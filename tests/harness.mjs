// Arnés de pruebas: ejecuta el juego en Node (vm) con un DOM falso y un reloj virtual.
//
// - DOM mínimo: árbol de elementos parseado desde el HTML real, con innerHTML, classList,
//   style, dataset, selectores simples (.clase, #id, etiqueta, [attr], [attr="v"], descendiente)
//   y eventos con burbujeo.
// - Reloj virtual: setTimeout / setInterval / requestAnimationFrame / Date / performance se
//   rigen por un reloj que solo avanza cuando el arnés lo pide. Los temporizadores de los
//   minijuegos se agotan "de verdad", sin esperas reales.
// - Math.random con semilla (mulberry32): misma semilla => misma partida.
import fs from 'node:fs';
import vm from 'node:vm';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ DOM falso */

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RE_TOKEN = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
const RE_ATTR = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function decodeEntities(s) {
  return s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' }[e]));
}

class FakeClassList {
  constructor(el) { this.el = el; }
  _get() { return (this.el.attrs.class || '').split(/\s+/).filter(Boolean); }
  _set(arr) { this.el.attrs.class = arr.join(' '); }
  add(...c) { const a = this._get(); for (const x of c) if (!a.includes(x)) a.push(x); this._set(a); }
  remove(...c) { this._set(this._get().filter((x) => !c.includes(x))); }
  contains(c) { return this._get().includes(c); }
  toggle(c, force) {
    const has = this.contains(c);
    const on = force === undefined ? !has : !!force;
    if (on) this.add(c); else this.remove(c);
    return on;
  }
}

function crearContexto2D() {
  // Contexto de canvas que acepta cualquier llamada y cualquier asignación.
  return new Proxy({}, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'measureText') return () => ({ width: 0 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k === 'getImageData') return () => ({ data: [] });
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}

export class FakeElement {
  constructor(doc, tagName, attrs = {}) {
    this.ownerDocument = doc;
    this.tagName = tagName.toUpperCase();
    this.attrs = attrs;
    this.children = [];
    this.parentNode = null;
    this._text = '';
    this.listeners = [];
    this.style = { setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; } };
    this.classList = new FakeClassList(this);
    this.value = attrs.value !== undefined ? decodeEntities(attrs.value) : '';
    this.disabled = 'disabled' in attrs;
    this.checked = 'checked' in attrs;
    this.offsetWidth = 0; this.offsetHeight = 0; this.width = 300; this.height = 150;
    this.scrollTop = 0; this.scrollHeight = 0;
  }
  get id() { return this.attrs.id || ''; }
  set id(v) { this.attrs.id = v; }
  get className() { return this.attrs.class || ''; }
  set className(v) { this.attrs.class = v; }
  get dataset() {
    const ds = {};
    for (const [k, v] of Object.entries(this.attrs)) {
      if (k.startsWith('data-')) ds[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decodeEntities(v);
    }
    return ds;
  }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this._detachChildren(); this._text = String(v); }
  get innerText() { return this.textContent; }
  set innerText(v) { this.textContent = v; }
  get innerHTML() { return this._html || ''; }
  set innerHTML(html) {
    this._detachChildren();
    this._text = '';
    this._html = String(html);
    parseInto(this, this._html);
  }
  _detachChildren() {
    for (const c of this.children) c.parentNode = null;
    this.children = [];
  }
  appendChild(el) {
    if (el.parentNode) el.parentNode.removeChild(el);
    el.parentNode = this; this.children.push(el); return el;
  }
  removeChild(el) {
    this.children = this.children.filter((c) => c !== el);
    el.parentNode = null; return el;
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  contains(el) { for (let n = el; n; n = n.parentNode) if (n === this) return true; return false; }
  get isConnected() {
    let n = this; while (n.parentNode) n = n.parentNode;
    return n === this.ownerDocument.documentElement;
  }
  *descendants() { for (const c of this.children) { yield c; yield* c.descendants(); } }
  querySelectorAll(sel) { return [...this.descendants()].filter((el) => matches(el, sel, this)); }
  querySelector(sel) { for (const el of this.descendants()) if (matches(el, sel, this)) return el; return null; }
  matches(sel) { return matches(this, sel, null); }
  closest(sel) { for (let n = this; n && n instanceof FakeElement; n = n.parentNode) if (matches(n, sel, null)) return n; return null; }
  addEventListener(type, fn, opts) { this.listeners.push({ type, fn, capture: opts === true || !!(opts && opts.capture) }); }
  removeEventListener(type, fn) { this.listeners = this.listeners.filter((l) => !(l.type === type && l.fn === fn)); }
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }; }
  getContext() { return this._ctx || (this._ctx = crearContexto2D()); }
  focus() {} blur() {} scrollIntoView() {} select() {} scrollTo() {}
  setPointerCapture() {} releasePointerCapture() {}
  click() { this.ownerDocument.dispatch(this, { type: 'click' }); }
}

function parseInto(root, html) {
  const doc = root.ownerDocument;
  const stack = [root];
  let last = 0;
  const addText = (txt) => {
    if (!txt) return;
    const top = stack[stack.length - 1];
    // El texto se acumula como hijo "texto" del elemento abierto (basta para textContent).
    const t = new FakeElement(doc, '#text');
    t._text = decodeEntities(txt);
    t.parentNode = top; top.children.push(t);
  };
  RE_TOKEN.lastIndex = 0;
  let m;
  while ((m = RE_TOKEN.exec(html))) {
    addText(html.slice(last, m.index));
    last = RE_TOKEN.lastIndex;
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) { // cierre
      const tag = m[1].toUpperCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tagName === tag) { stack.length = i; break; }
      continue;
    }
    const attrs = {};
    RE_ATTR.lastIndex = 0;
    let a;
    while ((a = RE_ATTR.exec(m[3] || ''))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    const el = new FakeElement(doc, m[2], attrs);
    const top = stack[stack.length - 1];
    el.parentNode = top; top.children.push(el);
    const tag = m[2].toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'textarea') {
      const close = html.toLowerCase().indexOf('</' + tag, last);
      const end = close < 0 ? html.length : close;
      el._text = html.slice(last, end);
      RE_TOKEN.lastIndex = last = end;
      continue;
    }
    if (!m[4] && !VOID_TAGS.has(tag)) stack.push(el);
  }
  addText(html.slice(last));
}

// Selectores: lista con comas, combinador descendiente y compuestos simples.
const selCache = new Map();
function compilar(sel) {
  if (selCache.has(sel)) return selCache.get(sel);
  const lista = sel.split(',').map((parte) => parte.trim().split(/\s+/).map((comp) => {
    const r = { tag: null, id: null, classes: [], attrs: [] };
    const re = /([a-zA-Z][\w-]*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/g;
    let m, consumido = 0;
    while ((m = re.exec(comp))) {
      if (m.index !== consumido) throw new Error('Selector no soportado por el arnés: ' + sel);
      consumido = re.lastIndex;
      if (m[1]) r.tag = m[1].toUpperCase();
      else if (m[2]) r.id = m[2];
      else if (m[3]) r.classes.push(m[3]);
      else r.attrs.push([m[4], m[5]]);
    }
    if (consumido !== comp.length) throw new Error('Selector no soportado por el arnés: ' + sel);
    return r;
  }));
  selCache.set(sel, lista);
  return lista;
}
function coincideSimple(el, r) {
  if (!(el instanceof FakeElement) || el.tagName === '#TEXT') return false;
  if (r.tag && el.tagName !== r.tag) return false;
  if (r.id && el.id !== r.id) return false;
  for (const c of r.classes) if (!el.classList.contains(c)) return false;
  for (const [k, v] of r.attrs) {
    if (!(k in el.attrs)) return false;
    if (v !== undefined && decodeEntities(el.attrs[k]) !== v) return false;
  }
  return true;
}
function matches(el, sel, scope) {
  return compilar(sel).some((cadena) => {
    if (!coincideSimple(el, cadena[cadena.length - 1])) return false;
    let n = el.parentNode;
    for (let i = cadena.length - 2; i >= 0; i--) {
      while (n && n !== scope && !coincideSimple(n, cadena[i])) n = n.parentNode;
      if (!n || n === scope) return false;
      n = n.parentNode;
    }
    return true;
  });
}

export class FakeDocument {
  constructor(bodyHtml) {
    this.documentElement = new FakeElement(this, 'html');
    this.head = new FakeElement(this, 'head');
    this.body = new FakeElement(this, 'body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.body.innerHTML = bodyHtml;
    this.listeners = [];
    this.fullscreenElement = null;
  }
  getElementById(id) {
    for (const el of this.documentElement.descendants()) if (el.attrs.id === id) return el;
    return null;
  }
  querySelector(sel) { return this.documentElement.querySelector(sel); }
  querySelectorAll(sel) { return this.documentElement.querySelectorAll(sel); }
  createElement(tag) { return new FakeElement(this, tag); }
  addEventListener(type, fn, opts) { this.listeners.push({ type, fn, capture: opts === true || !!(opts && opts.capture) }); }
  removeEventListener(type, fn) { this.listeners = this.listeners.filter((l) => !(l.type === type && l.fn === fn)); }
  exitFullscreen() { return Promise.resolve(); }
  // Despacho con fase de captura (solo document) y burbujeo hasta document.
  dispatch(target, init) {
    let detenido = false;
    const ev = Object.assign({
      target, currentTarget: null, bubbles: true, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { detenido = true; }, stopImmediatePropagation() { detenido = true; },
      clientX: 0, clientY: 0, touches: [], changedTouches: [],
    }, init);
    const llamar = (nodo, lista, fase) => {
      for (const l of lista.slice()) {
        if (l.type !== ev.type || l.capture !== fase) continue;
        ev.currentTarget = nodo;
        l.fn.call(nodo, ev);
      }
    };
    llamar(this, this.listeners, true);
    if (detenido) return ev;
    for (let n = target; n && n instanceof FakeElement; n = n.parentNode) {
      llamar(n, n.listeners, false);
      if (n.listeners.some((l) => l.capture && l.type === ev.type)) llamar(n, n.listeners, true);
      if (detenido) return ev;
    }
    llamar(this, this.listeners, false);
    return ev;
  }
}

class FakeChart {
  constructor(canvas, config) {
    this.canvas = canvas; this.config = config;
    this.data = (config && config.data) || { labels: [], datasets: [] };
    this.options = (config && config.options) || {};
  }
  update() {} destroy() {} resize() {}
}

/* ------------------------------------------------------------------ Juego */

export function extraerPartes(html) {
  const ini = html.lastIndexOf('<script>');
  const fin = html.lastIndexOf('</script>');
  const body = html.slice(html.indexOf('<body>') + '<body>'.length, ini);
  return { body, codigo: html.slice(ini + '<script>'.length, fin) };
}

const HOY = Date.UTC(2026, 0, 15, 15, 0, 0); // fecha fija: historial reproducible

export function crearJuego(html, { seed = 1 } = {}) {
  const { body, codigo } = extraerPartes(html);
  const document = new FakeDocument(body);
  const reloj = { ahora: 0, cola: [], sig: 1 };
  const programar = (fn, ms, args, intervalo) => {
    const id = reloj.sig++;
    reloj.cola.push({ id, t: reloj.ahora + Math.max(0, Number(ms) || 0), fn, args, intervalo });
    return id;
  };
  const cancelar = (id) => { reloj.cola = reloj.cola.filter((x) => x.id !== id); };
  const almacen = new Map();
  const errores = [];

  const sandbox = {
    document,
    console: { log() {}, info() {}, warn() {}, debug() {}, error: (...a) => errores.push(a.join(' ')) },
    setTimeout: (fn, ms, ...args) => programar(fn, ms, args, null),
    clearTimeout: cancelar,
    setInterval: (fn, ms, ...args) => programar(fn, ms, args, Math.max(1, Number(ms) || 1)),
    clearInterval: cancelar,
    requestAnimationFrame: (fn) => programar(() => fn(reloj.ahora), 16, [], null),
    cancelAnimationFrame: cancelar,
    performance: { now: () => reloj.ahora },
    localStorage: {
      getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
      setItem: (k, v) => { almacen.set(k, String(v)); },
      removeItem: (k) => { almacen.delete(k); },
    },
    Chart: FakeChart,
    innerWidth: 1280, innerHeight: 800,
    confirm: () => true, print: () => {}, alert: () => {},
    navigator: { userAgent: 'arnes', vibrate() {} },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  // Math.random con semilla y Date ligado al reloj virtual, dentro del propio contexto.
  ctx.__rng = mulberry32(seed);
  ctx.__ahora = () => HOY + reloj.ahora;
  vm.runInContext(`
    Math.random = () => __rng();
    (() => {
      const D = Date;
      function FDate(...a) { return a.length ? new D(...a) : new D(__ahora()); }
      FDate.prototype = D.prototype; FDate.now = () => __ahora(); FDate.UTC = D.UTC; FDate.parse = D.parse;
      globalThis.Date = FDate;
    })();
  `, ctx);
  vm.runInContext(codigo, ctx, { filename: 'juego.js' });

  const tick = () => new Promise((r) => setImmediate(r)); // drena microtareas (promesas del juego)

  return {
    ctx, document, reloj, errores, almacen,
    ev: (expr) => vm.runInContext(expr, ctx),
    async avanzar(ms) {
      const limite = reloj.ahora + ms;
      await tick();
      for (;;) {
        let prox = null;
        for (const x of reloj.cola) if (x.t <= limite && (!prox || x.t < prox.t || (x.t === prox.t && x.id < prox.id))) prox = x;
        if (!prox) break;
        reloj.ahora = prox.t;
        if (prox.intervalo) prox.t += prox.intervalo; else reloj.cola = reloj.cola.filter((x) => x !== prox);
        prox.fn(...prox.args);
        await tick();
      }
      reloj.ahora = limite;
    },
    async click(el) { document.dispatch(el, { type: 'click' }); await tick(); },
    async tecla(key) {
      document.dispatch(document.body, { type: 'keydown', key, code: key === ' ' ? 'Space' : key });
      await tick();
    },
  };
}

export function leerHtml(ruta) { return fs.readFileSync(ruta, 'utf8'); }
