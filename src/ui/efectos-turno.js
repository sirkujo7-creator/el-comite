/* =========================================================
   EFECTOS DEL TURNO — "Sala de mando", etapa 2 (oct. 2026)
   Encendido del tablero, título que se descifra, sello "ORDEN EJECUTADA", y el impacto de la
   decisión sobre las tarjetas (partículas, cifra que salta y cuenta). Solo visual: nada de esto
   toca el estado del juego. Usa su propio azar (azarVisual) para no consumir Math.random, que
   decide los casos y los resultados (las partidas con semilla deben seguir siendo idénticas).
   ========================================================= */
let semillaVisual = 20261014;
function azarVisual(){
  semillaVisual = (semillaVisual * 1103515245 + 12345) % 2147483648;
  return semillaVisual / 2147483648;
}
function ahoraVisual(){ return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
function reducirMovimiento(){
  try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; }
}

// Los paneles del tablero se encienden en cascada, como monitores de una sala de control.
function encenderTablero(){
  reiniciarCombo();
  if(reducirMovimiento()) return;
  setTimeout(()=>{
    const paneles = [].concat(
      Array.from(document.querySelectorAll('.header-text h1, .header-text .empresa-chip, .header-text .meta-junta-line, .anio-fiscal')),
      Array.from(document.querySelectorAll('.kpi-card')),
      Array.from(document.querySelectorAll('.crt-screen')),
      [document.getElementById('calendario'), document.getElementById('relations'),
       document.getElementById('equiposLine'), document.getElementById('metaPanel'),
       document.getElementById('evaluarTurnoWrap'), document.querySelector('.bitacora-resumen'),
       document.getElementById('oficinaAmbienteBtn')]
    ).filter(Boolean);
    paneles.forEach(p=>{ p.classList.remove('enciende'); p.classList.add('apagado'); });
    paneles.forEach((p,i)=>setTimeout(()=>{ p.classList.remove('apagado'); p.classList.add('enciende'); }, 80 + i*45));
    setTimeout(()=>paneles.forEach(p=>p.classList.remove('enciende')), 80 + paneles.length*45 + 700);
  }, 30);
}

// El título del caso aparece "descifrándose" de izquierda a derecha.
function descifrarTitulo(el){
  if(!el || reducirMovimiento()) return;
  const original = el.innerHTML, texto = el.textContent;
  if(!texto || (el.children && el.children.length)) return;
  const signos = '▓▒░#$%&@01';
  const dur = 800, t0 = ahoraVisual();
  const paso = ()=>{
    if(!el.isConnected && el.isConnected !== undefined) return;
    const k = Math.min(1, (ahoraVisual() - t0) / dur), n = Math.floor(texto.length * k);
    if(k >= 1){ el.innerHTML = original; return; }
    let resto = '';
    for(let i=n;i<texto.length;i++) resto += texto[i] === ' ' ? ' ' : signos[Math.floor(azarVisual()*signos.length)];
    el.textContent = texto.slice(0, n) + resto;
    requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

// Sello al confirmar una decisión: golpe, sacudida de la ventana y destello breve.
function selloOrdenEjecutada(){
  const ventana = document.getElementById('ventanaTurno');
  if(!ventana) return;
  const viejo = ventana.querySelector('.sello-orden');
  if(viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);
  const sello = document.createElement('div');
  sello.className = 'sello-orden';
  sello.textContent = 'ORDEN EJECUTADA';
  ventana.appendChild(sello);
  ventana.classList.remove('sacude'); void ventana.offsetWidth; ventana.classList.add('sacude');
  const destello = document.getElementById('destelloPantalla');
  if(destello){ destello.classList.remove('on'); void destello.offsetWidth; destello.classList.add('on'); }
  setTimeout(()=>{ ventana.classList.remove('sacude'); }, 450);
  setTimeout(()=>{ if(sello.parentNode) sello.parentNode.removeChild(sello); }, 720);
}

// Partículas de píxel que salen de una tarjeta: suben si el cambio es sano, caen si no.
function particulasDesde(el, color, sube, n){
  if(!el || !el.getBoundingClientRect || reducirMovimiento()) return;
  const r = el.getBoundingClientRect();
  if(!r.width) return;
  for(let i=0;i<(n||16);i++){
    const p = document.createElement('i');
    p.className = 'px-particula';
    p.style.background = color; p.style.boxShadow = '0 0 6px ' + color;
    p.style.left = (r.left + r.width*(0.2 + azarVisual()*0.6)) + 'px';
    p.style.top = (r.top + r.height*0.5) + 'px';
    document.body.appendChild(p);
    let x = 0, y = 0, v = 0;
    const vx = (azarVisual() - 0.5) * 5;
    let vy = sube ? -(3 + azarVisual()*4) : (1 + azarVisual()*2);
    const mover = ()=>{
      v++; x += vx; y += vy; vy += sube ? 0.12 : 0.25;
      p.style.transform = `translate(${x}px,${y}px)`; p.style.opacity = String(1 - v/50);
      if(v < 50) requestAnimationFrame(mover); else if(p.parentNode) p.parentNode.removeChild(p);
    };
    requestAnimationFrame(mover);
  }
}
// La cifra del cambio salta sobre la tarjeta y se desvanece.
function saltoJuntoA(el, texto, color, sube){
  if(!el || !el.getBoundingClientRect || reducirMovimiento()) return;
  const r = el.getBoundingClientRect();
  if(!r.width) return;
  const s = document.createElement('div');
  s.className = 'salto-delta ' + (sube ? 'sube' : 'baja');
  s.textContent = texto; s.style.color = color;
  // Dentro de la propia tarjeta, arriba a la derecha (al lado taparía la tarjeta vecina).
  s.style.left = (r.right - 12) + 'px';
  s.style.top = (r.top + 4) + 'px';
  document.body.appendChild(s);
  setTimeout(()=>{ if(s.parentNode) s.parentNode.removeChild(s); }, 1400);
}
// La cifra de la tarjeta cuenta desde el valor anterior hasta el nuevo.
function contarCifraKpi(card, key, delta){
  const el = card && card.querySelector('.kpi-valor');
  const d = KPI_DEFS.find(k=>k.key===key);
  if(!el || !d || !delta || reducirMovimiento()) return;
  const hasta = state[key], desde = hasta - delta, dur = 900, t0 = ahoraVisual();
  const final = el.innerHTML;
  const paso = ()=>{
    const k = Math.min(1, (ahoraVisual() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    if(k >= 1){ el.innerHTML = final; return; }
    el.innerHTML = valorKpiHTML(d, desde + (hasta - desde) * e);
    requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
const COLOR_IMPACTO = { bueno:'#3ddc97', malo:'#ff5a46', inversion:'#D98847' };
// Se llama desde flashKpiCards por cada indicador que cambió con la decisión.
function impactoEnTarjeta(card, key, delta, tipo, esRelacional){
  const color = COLOR_IMPACTO[tipo] || COLOR_IMPACTO.bueno;
  const sube = tipo === 'bueno';
  particulasDesde(card, color, sube, esRelacional ? 10 : 16);
  if(esRelacional) return;
  const kd = KPI_DEFS.find(k=>k.key===key);
  saltoJuntoA(card, (tipo==='inversion' ? '↗ ' : '') + fmtDelta(delta, kd ? kd.kind : 'num'), color, sube);
  contarCifraKpi(card, key, delta);
}
