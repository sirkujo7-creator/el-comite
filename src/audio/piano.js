/* =========================================================================================
   PIANO Y "SONATA DE LA JUNTA" — música de partida (nov. 2026, elegida por Juan)
   Piano solo, a la manera de la Sonata "Claro de luna" de Beethoven, en do sostenido menor:
   - calma: Adagio (octava grave, tresillos, el tema de El Comité con puntillo);
   - tensión: Più mosso (semicorcheas, bajo en cada tiempo, tema en octavas);
   - alarma: Presto agitato (olas de semicorcheas de tres octavas y dos acordes secos);
   - ventana de decisión: trémolo grave y una nota que insiste sobre un acorde que no resuelve;
   - junta: la sala espera (octavas graves aisladas).
   El piano no usa grabaciones: cada nota se sintetiza (parciales inarmónicos de cuerda rígida,
   2–3 cuerdas apenas desafinadas, decaimiento en dos etapas, martillo) en un Worker, en segundo
   plano, y se guarda. Una nota que todavía no está lista simplemente no suena esa vez.
   ========================================================================================= */

// ---- Síntesis de una nota (se ejecuta dentro del Worker; también sirve sin Worker)
function sintetizarNotaPiano(midi, capa, sr){
  const f0 = 440 * Math.pow(2, (midi - 69) / 12);
  const brillo = {pp:0.42, mf:0.26, f:0.15}[capa];
  const T = Math.max(1.2, 9 * Math.pow(2, -(midi - 36) / 20));
  const dur = Math.min(6, T * 1.4 + 0.4), n = Math.floor(sr * dur);
  const B = 0.00012 * Math.pow(2, (midi - 48) / 22);
  const cuerdas = midi < 34 ? [0] : midi < 46 ? [-0.9, 0.9] : [-1.1, 0, 1.3];
  const L = new Float32Array(n), R = new Float32Array(n);
  const maxP = Math.min(24, Math.floor(7000 / f0));
  for(let p = 1; p <= maxP; p++){
    const fp = p * f0 * Math.sqrt(1 + B * p * p);
    if(fp > sr * 0.45) break;
    const amp = Math.abs(Math.sin(Math.PI * p / 7.3)) * Math.pow(p, -1.15) * Math.exp(-(p - 1) * brillo);
    if(amp < 0.002) continue;
    const tau = T / (1 + 0.09 * Math.pow(p, 1.6));
    cuerdas.forEach((cents, k)=>{
      const w = 2 * Math.PI * fp * Math.pow(2, cents / 1200) / sr, cw = Math.cos(w), sw = Math.sin(w);
      const a1 = Math.exp(-1 / (sr * tau * 0.22)), a2 = Math.exp(-1 / (sr * tau));
      let s = 0, c = 1, e1 = 0.62 * amp / cuerdas.length, e2 = 0.38 * amp / cuerdas.length;
      const izq = 0.5 + 0.25 * (k - 1), der = 1 - izq;
      for(let i = 0; i < n; i++){
        const ns = s * cw + c * sw; c = c * cw - s * sw; s = ns;
        const v = s * (e1 + e2); e1 *= a1; e2 *= a2;
        L[i] += v * izq; R[i] += v * der;
        if(e1 + e2 < 1e-6) break;
      }
    });
  }
  const golpe = Math.floor(sr * 0.012), nivel = {pp:0.004, mf:0.008, f:0.014}[capa];
  let semilla = midi * 7919 + 13, prev = 0;
  for(let i = 0; i < golpe; i++){
    semilla = (semilla * 1103515245 + 12345) % 2147483648;
    prev = prev * 0.7 + (semilla / 1073741824 - 1) * 0.3;
    const v = prev * nivel * (1 - i / golpe); L[i] += v; R[i] += v;
  }
  const at = Math.floor(sr * 0.002), fin = Math.floor(sr * 0.3);
  for(let i = 0; i < at; i++){ L[i] *= i / at; R[i] *= i / at; }
  for(let i = 0; i < fin; i++){ const k = i / fin; L[n - 1 - i] *= k; R[n - 1 - i] *= k; }
  return [L, R];
}

// ---- Almacén de notas y Worker
const pianoNotas = {};      // clave → {L, R, sr} listos (o AudioBuffer ya creado)
const pianoPendientes = {}; // clave → true mientras se calculan
let pianoWorker = null, pianoSinWorker = false;
function pianoClave(midi, capa){ return midi + '|' + capa; }
function pianoIniciarWorker(){
  if(pianoWorker || pianoSinWorker) return;
  try{
    const codigo = sintetizarNotaPiano.toString() +
      '\nonmessage = (e)=>{ const {midi, capa, sr} = e.data; const [L, R] = sintetizarNotaPiano(midi, capa, sr); postMessage({midi, capa, sr, L, R}, [L.buffer, R.buffer]); };';
    pianoWorker = new Worker(URL.createObjectURL(new Blob([codigo], {type:'application/javascript'})));
    pianoWorker.onmessage = (e)=>{
      const {midi, capa, sr, L, R} = e.data, clave = pianoClave(midi, capa);
      pianoNotas[clave] = {L, R, sr}; delete pianoPendientes[clave];
    };
    pianoWorker.onerror = ()=>{ pianoWorker = null; pianoSinWorker = true; };
  }catch(e){ pianoWorker = null; pianoSinWorker = true; }
}
function pianoTasaMuestreo(){ return audioCtx ? audioCtx.sampleRate : 44100; }
function pianoPedir(midi, capa){
  const clave = pianoClave(midi, capa);
  if(pianoNotas[clave] || pianoPendientes[clave]) return;
  pianoPendientes[clave] = true;
  pianoIniciarWorker();
  if(pianoWorker){ pianoWorker.postMessage({midi, capa, sr: pianoTasaMuestreo()}); return; }
  // Sin Worker: de a una nota por vez, cediendo el turno al navegador entre notas.
  setTimeout(()=>{ const [L, R] = sintetizarNotaPiano(midi, capa, pianoTasaMuestreo()); pianoNotas[clave] = {L, R, sr: pianoTasaMuestreo()}; delete pianoPendientes[clave]; }, 30);
}
function pianoBufferListo(ctx, midi, capa){
  const clave = pianoClave(midi, capa), nota = pianoNotas[clave];
  if(!nota){ pianoPedir(midi, capa); return null; }
  if(nota.buffer) return nota.buffer;
  const buf = ctx.createBuffer(2, nota.L.length, nota.sr);
  buf.copyToChannel(nota.L, 0); buf.copyToChannel(nota.R, 1);
  nota.buffer = buf; nota.L = nota.R = null;
  return buf;
}
let pianoGrabacion = null; // al precalentar, en vez de sonar se anota qué notas hacen falta
function pianoNota(ctx, bus, midi, t, vel, soltar){
  const capa = vel > 0.75 ? 'f' : vel > 0.45 ? 'mf' : 'pp';
  if(pianoGrabacion){ pianoGrabacion.add(pianoClave(midi, capa)); return; }
  const buffer = pianoBufferListo(ctx, midi, capa);
  if(!buffer) return;
  const src = ctx.createBufferSource(); src.buffer = buffer;
  const g = ctx.createGain(); g.gain.value = 0.9 * vel;
  if(soltar){ g.gain.setValueAtTime(0.9 * vel, t + soltar); g.gain.exponentialRampToValueAtTime(0.0001, t + soltar + 0.35); }
  src.connect(g).connect(bus.entrada); src.start(t);
  src.stop(t + Math.min(buffer.duration, soltar ? soltar + 0.4 : 99));
}
function acordeNotas(raiz, tipo){ const t = {m:[0,3,7], M:[0,4,7], s7:[0,4,7,10]}[tipo]; return t.map(x=>raiz + x); }

// ---- La sonata
// Armonía: C#m | C#m/B | A | F#m | D (napolitano) | G#7 | C#m | G#7 — y una más urgente en el agitado.
const ARMONIA_SONATA = [[37,49,'m'],[35,49,'m'],[33,45,'M'],[30,42,'m'],[38,50,'M'],[32,44,'s7'],[37,49,'m'],[32,44,'s7']];
const ARMONIA_AGITATO = [[37,49,'m'],[37,49,'m'],[32,44,'s7'],[32,44,'s7'],[37,49,'m'],[33,45,'M'],[38,50,'M'],[32,44,'s7']];
// Tema de El Comité en do sostenido menor, con el puntillo de Beethoven: [nota, tiempo, duración].
const TEMA_SONATA = [[[68,0,1.5],[68,1.5,0.5],[69,2,1],[68,3,1]],[[71,0,1.5],[69,1.5,0.5],[68,2,2]],[[66,0,1.5],[64,1.5,0.5],[66,2,1],[68,3,1]],[[64,0,3]],
                     [[74,0,1.5],[73,1.5,0.5],[71,2,2]],[[68,0,1],[71,1,1],[72,2,2]],[[73,0,2],[68,2,2]],[[67,0,4]]];
const TEMPO_SONATA = { calma:60, tension:72, alarma:150, decision:64, junta:50 };
function faseSonata(){
  if(!musica) return 'calma';
  if(musica.junta) return 'junta';
  if(musica.nivel === 'alarma') return 'alarma';
  if(musica.decision) return 'decision';
  return musica.nivel || 'calma';
}
// Pequeña imprecisión humana (sin Math.random: la música no debe alterar el azar del juego).
let pianoSemillaHumana = 7;
function pianoHumano(){ pianoSemillaHumana = (pianoSemillaHumana * 16807) % 2147483647; return (pianoSemillaHumana / 2147483647 - 0.5) * 0.008; }

function compasSonata(ctx, bus, t, n, b, fase){
  if(fase === 'junta'){
    // La junta delibera: solo una octava grave, larga, cada compás.
    const [bajoN] = ARMONIA_SONATA[(n * 2) % 8];
    pianoNota(ctx, bus, bajoN, t, 0.35); pianoNota(ctx, bus, bajoN + 12, t + b * 2, 0.3);
    return;
  }
  if(fase === 'decision'){
    for(let i = 0; i < 16; i++) pianoNota(ctx, bus, i % 2 ? 37 : 25, t + i * b / 4, 0.3 + (i % 4 === 0 ? 0.05 : 0), b * 0.3);
    if(n % 2 === 0) [48, 51, 54, 57].forEach(m=>pianoNota(ctx, bus, m, t, 0.35)); // séptima disminuida, sin resolver
    [[0, 0.75], [0.75, 0.25], [1, 1], [2, 0.75], [2.75, 0.25], [3, 1]].forEach(([s, d], i)=>pianoNota(ctx, bus, n % 2 && i > 2 ? 69 : 68, t + s * b, 0.42 + (i % 3 === 2 ? 0.08 : 0), d * b * 0.95));
    return;
  }
  const [bajoN, base, tipo] = (fase === 'alarma' ? ARMONIA_AGITATO : ARMONIA_SONATA)[n % 8];
  const ac = acordeNotas(base, tipo).map(m=>m + 12);
  if(fase === 'calma'){
    pianoNota(ctx, bus, bajoN, t, 0.55); pianoNota(ctx, bus, bajoN + 12, t, 0.45);
    for(let i = 0; i < 12; i++) pianoNota(ctx, bus, ac[i % 3], t + i * b / 3 + pianoHumano(), 0.28 + (i % 3 === 0 ? 0.06 : 0));
    TEMA_SONATA[n % 8].forEach(([m, s])=>pianoNota(ctx, bus, m, t + s * b, 0.5));
  } else if(fase === 'tension'){
    for(let k = 0; k < 4; k++){ pianoNota(ctx, bus, bajoN, t + k * b, 0.6, b * 0.9); pianoNota(ctx, bus, bajoN + 12, t + k * b, 0.5, b * 0.9); }
    const dieci = [ac[0], ac[1], ac[2], ac[1]];
    for(let i = 0; i < 16; i++) pianoNota(ctx, bus, dieci[i % 4], t + i * b / 4 + pianoHumano(), 0.42 + (i % 4 === 0 ? 0.08 : 0), b * 0.5);
    TEMA_SONATA[n % 8].forEach(([m, s])=>{ pianoNota(ctx, bus, m, t + s * b, 0.66); pianoNota(ctx, bus, m + 12, t + s * b, 0.5); });
  } else {
    // Presto agitato (tercer movimiento): ola de semicorcheas de tres octavas, dos acordes secos
    // en fortissimo y octavas martilladas en la mano izquierda.
    const tonos = acordeNotas(base, tipo), ola = [];
    for(let o = -1; o < 3 && ola.length < 12; o++) tonos.forEach(m=>{ const x = m + 12 * o; if(x >= base - 8 && ola.length < 12) ola.push(x); });
    ola.forEach((m, i)=>pianoNota(ctx, bus, m, t + i * b / 4, 0.6 + i * 0.03, b * 0.35));
    [3, 3.5].forEach(k=>{ tonos.concat([base + 12]).forEach(m=>pianoNota(ctx, bus, m + 12, t + k * b, 0.98, b * 0.22)); pianoNota(ctx, bus, bajoN, t + k * b, 0.95, b * 0.22); pianoNota(ctx, bus, bajoN - 12, t + k * b, 0.9, b * 0.22); });
    for(let i = 0; i < 6; i++){ pianoNota(ctx, bus, bajoN, t + i * b / 2, 0.78, b * 0.4); pianoNota(ctx, bus, bajoN - 12, t + i * b / 2, 0.7, b * 0.4); }
  }
}
// Calcula de antemano todas las notas que la sonata puede pedir, empezando por la calma, para
// que al empezar la partida el piano ya esté listo.
let pianoPrecalentado = false;
function precalentarPiano(){
  if(pianoPrecalentado) return;
  pianoPrecalentado = true;
  const orden = ['calma', 'decision', 'tension', 'junta', 'alarma'], claves = [];
  orden.forEach(fase=>{
    pianoGrabacion = new Set();
    for(let n = 0; n < 8; n++) compasSonata(null, null, 0, n, 1, fase);
    pianoGrabacion.forEach(c=>{ if(!claves.includes(c)) claves.push(c); });
  });
  pianoGrabacion = null;
  claves.forEach((c, i)=>setTimeout(()=>{ const [m, capa] = c.split('|'); pianoPedir(+m, capa); }, i * 15));
}
