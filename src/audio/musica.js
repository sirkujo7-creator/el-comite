/* =========================================================================================
   MÚSICA DE FONDO POR SECTOR — generada en vivo con Web Audio, sin archivos
   Cada sector tiene un estilo propio (tempo, compás, tonalidad, progresión e instrumentos).
   Los instrumentos buscan sonar acústicos y no "de pitido":
   - cuerda pulsada (guitarra, arpa llanera, cuatro) con síntesis Karplus-Strong;
   - marimba/campana de madera (parciales inarmónicos);
   - piano eléctrico (FM suave), colchón de cuerdas (sierras desafinadas y filtradas);
   - percusión de ruido filtrado (maracas, escobilla) y bombo suave.
   Todo pasa por una sala (reverberación por convolución) y una humanización leve: cada nota
   se adelanta o atrasa unos milisegundos y cambia de intensidad, y los patrones varían.
   El programador agenda un compás por adelantado; los compases son deterministas en forma pero
   con variación aleatoria, así que la música no se repite exactamente.
   ========================================================================================= */
const MUSICA_VOLUMEN = 0.16;
let musica = null; // { ctx, bus, estilo, compas, inicio, timer }

function midiAFrec(m){ return 440 * Math.pow(2, (m - 69) / 12); }
function humano(t, ms){ return t + (Math.random() - 0.5) * 2 * (ms || 8) / 1000; }
function azar(min, max){ return min + Math.random() * (max - min); }

// ---------------------------------------------------------------- Bus: filtro + sala
function impulsoSala(ctx, seg, caida){
  const n = Math.floor(ctx.sampleRate * seg);
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for(let c = 0; c < 2; c++){
    const d = buf.getChannelData(c);
    for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida);
  }
  return buf;
}
function musicaConstruirBus(ctx, destino){
  const entrada = ctx.createGain();
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass'; filtro.frequency.value = 9000; filtro.Q.value = 0.4;
  const maestro = ctx.createGain();
  maestro.gain.value = 0;
  const sala = ctx.createConvolver();
  sala.buffer = impulsoSala(ctx, 2.4, 3.2);
  const envioSala = ctx.createGain(); envioSala.gain.value = 0.32;
  entrada.connect(filtro);
  filtro.connect(maestro);
  filtro.connect(envioSala).connect(sala).connect(maestro);
  maestro.connect(destino || ctx.destination);
  return { entrada, filtro, maestro, cache:{} };
}

// ---------------------------------------------------------------- Instrumentos
// Cuerda pulsada (Karplus-Strong): un ruido corto que recircula por un retardo del largo de la
// cuerda y se va suavizando. Se precalcula una vez por nota y brillo.
function bufferCuerda(ctx, bus, frec, brillo, sostener){
  const clave = Math.round(frec * 10) + '|' + brillo + '|' + sostener;
  if(bus.cache[clave]) return bus.cache[clave];
  const sr = ctx.sampleRate, dur = 2.2;
  // Periodo fraccionario (interpolación lineal) para que las notas agudas queden afinadas;
  // el promedio de dos muestras añade medio ciclo de retardo, por eso el -0,5.
  const n = Math.floor(sr * dur), periodo = Math.max(2, sr / frec - 0.5), entero = Math.floor(periodo), frac = periodo - entero;
  const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  let previo = 0;
  for(let i = 0; i <= entero + 1; i++){ previo = brillo * (Math.random() * 2 - 1) + (1 - brillo) * previo; d[i] = previo; }
  for(let i = entero + 2; i < n; i++){
    const a = d[i - entero] * (1 - frac) + d[i - entero - 1] * frac;
    const b = d[i - entero - 1] * (1 - frac) + d[i - entero - 2] * frac;
    d[i] = sostener * 0.5 * (a + b);
  }
  bus.cache[clave] = buf;
  return buf;
}
function cuerda(ctx, bus, midi, t, vel, opts){
  opts = opts || {};
  const src = ctx.createBufferSource();
  src.buffer = bufferCuerda(ctx, bus, midiAFrec(midi), opts.brillo || 0.55, opts.sostener || 0.996);
  const g = ctx.createGain();
  const dur = opts.dur || 1.6;
  g.gain.setValueAtTime(vel * (opts.vol || 0.5), t);
  g.gain.setTargetAtTime(0.0001, t + dur * 0.7, dur * 0.12);
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if(pan){ pan.pan.value = opts.pan || 0; src.connect(g).connect(pan).connect(bus.entrada); }
  else src.connect(g).connect(bus.entrada);
  src.start(t); src.stop(t + dur + 0.3);
}
// Marimba de madera: fundamental + parciales inarmónicos (×3,93 y ×9,2) que decaen rápido.
function marimba(ctx, bus, midi, t, vel, opts){
  opts = opts || {};
  const f = midiAFrec(midi), dur = opts.dur || 1.2, vol = (opts.vol || 0.22) * vel;
  [[1, 1, dur], [3.93, 0.28, dur * 0.3], [9.2, 0.08, dur * 0.1]].forEach(([r, a, d])=>{
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * r;
    o.detune.value = azar(-4, 4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * a), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(bus.entrada); o.start(t); o.stop(t + d + 0.05);
  });
}
// Piano eléctrico: FM suave (modulador a la misma frecuencia, índice que se apaga).
function rhodes(ctx, bus, midi, t, vel, dur){
  const f = midiAFrec(midi);
  const car = ctx.createOscillator(); car.type = 'sine'; car.frequency.value = f; car.detune.value = azar(-3, 3);
  const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.value = f;
  const indice = ctx.createGain();
  indice.gain.setValueAtTime(f * 1.4 * vel, t);
  indice.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.6);
  mod.connect(indice).connect(car.frequency);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.11 * vel, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.03 * vel, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  car.connect(g).connect(bus.entrada);
  car.start(t); mod.start(t); car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
}
// Colchón de cuerdas: dos sierras desafinadas por nota, filtradas, con ataque y caída lentos.
function colchon(ctx, bus, notas, t, dur, opts){
  opts = opts || {};
  const vol = opts.vol || 0.035;
  const filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(opts.corte || 900, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + Math.min(1.2, dur * 0.4));
  g.gain.setValueAtTime(vol, t + dur * 0.75);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.9);
  filtro.connect(g).connect(bus.entrada);
  notas.forEach(m=>[-7, 7].forEach(cents=>{
    const o = ctx.createOscillator(); o.type = opts.onda || 'sawtooth';
    o.frequency.value = midiAFrec(m); o.detune.value = cents + azar(-2, 2);
    o.connect(filtro); o.start(t); o.stop(t + dur + 1);
  }));
}
// Bajo redondo: triángulo + seno una octava abajo, filtrado.
function bajo(ctx, bus, midi, t, vel, dur){
  const f = midiAFrec(midi);
  const filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 420;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.2 * vel, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.06 * vel, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  filtro.connect(g).connect(bus.entrada);
  [['triangle', f], ['sine', f / 2]].forEach(([tipo, fr])=>{
    const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = fr;
    o.connect(filtro); o.start(t); o.stop(t + dur + 0.05);
  });
}
function bufferRuido(ctx, bus){
  if(bus.cache.ruido) return bus.cache.ruido;
  const n = Math.floor(ctx.sampleRate * 0.5), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return (bus.cache.ruido = buf);
}
// Maraca / shaker / escobilla: ruido filtrado muy corto.
function maraca(ctx, bus, t, vel, opts){
  opts = opts || {};
  const src = ctx.createBufferSource(); src.buffer = bufferRuido(ctx, bus);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = opts.frec || 6500; f.Q.value = 1.1;
  const g = ctx.createGain(), dur = opts.dur || 0.07;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime((opts.vol || 0.09) * vel, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus.entrada);
  src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
}
// Bombo suave: seno que cae de tono.
function bombo(ctx, bus, t, vel){
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32 * vel, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g).connect(bus.entrada); o.start(t); o.stop(t + 0.35);
}

// ---------------------------------------------------------------- Estilos por sector
// Acordes en notas MIDI. raiz = nota más grave para el bajo.
const acordeM = (raiz, ...resto)=>({ raiz, notas:resto });
const MUSICA_ESTILOS = {
  // Menú: el comité en penumbra. Lento, menor, solo colchón y marimba grave dispersa.
  menu: { bpm:58, tiempos:4, acordes:[acordeM(45,57,60,64), acordeM(41,57,60,65), acordeM(38,57,62,65), acordeM(40,56,59,64)],
    compas(ctx, bus, t, n, ac, b){
      colchon(ctx, bus, ac.notas, t, b * 4, {vol:0.03, corte:700});
      bajo(ctx, bus, ac.raiz, humano(t), 0.5, b * 3.5);
      if(Math.random() < 0.7) marimba(ctx, bus, ac.notas[Math.floor(Math.random()*ac.notas.length)] + 12, humano(t + b * (1 + Math.floor(Math.random()*3))), azar(0.4, 0.6), {vol:0.16, dur:2});
    } },
  // AgroVerde: bambuco campesino en 3/4 (Sol mayor), guitarra pulsada y tiple, maraca suave.
  agroverde: { bpm:96, tiempos:3, acordes:[acordeM(43,55,59,62), acordeM(48,55,60,64), acordeM(50,54,57,62), acordeM(43,55,59,62), acordeM(40,55,59,64), acordeM(48,55,60,64), acordeM(50,54,57,62), acordeM(50,54,57,60)],
    compas(ctx, bus, t, n, ac, b){
      bajo(ctx, bus, ac.raiz, humano(t, 6), 0.75, b * 1.6);
      const arpegio = [ac.notas[0], ac.notas[1], ac.notas[2], ac.notas[1], ac.notas[2] + 12, ac.notas[1]];
      arpegio.forEach((m, i)=>cuerda(ctx, bus, m, humano(t + i * b / 2, 9), azar(0.55, 0.85), {vol:0.42, brillo:0.5, pan:-0.25}));
      if(n % 2 === 1) [ac.notas[0] + 12, ac.notas[2] + 12].forEach((m, i)=>marimba(ctx, bus, m, humano(t + b * (1 + i)), azar(0.5, 0.7), {vol:0.13}));
      for(let i = 0; i < 6; i++) if(i % 2 === 1 || Math.random() < 0.3) maraca(ctx, bus, humano(t + i * b / 2, 6), i % 2 ? 0.8 : 0.4, {vol:0.06});
    } },
  // Ganadera Los Llanos: joropo llanero (Re mayor, 3/4 vivo), arpa en corcheas, bajo sincopado,
  // cuatro rasgueado y maracas constantes.
  ganadera: { bpm:126, tiempos:3, acordes:[acordeM(38,62,66,69), acordeM(45,61,64,69), acordeM(38,62,66,69), acordeM(45,61,64,67), acordeM(43,62,67,71), acordeM(45,61,64,69), acordeM(38,62,66,69), acordeM(45,61,64,67)],
    compas(ctx, bus, t, n, ac, b){
      bajo(ctx, bus, ac.raiz, humano(t, 5), 0.85, b * 0.9);
      bajo(ctx, bus, ac.raiz + 7, humano(t + b * 1.5, 5), 0.6, b * 0.9);
      const sube = n % 2 === 0;
      const arpa = sube ? [ac.notas[0], ac.notas[1], ac.notas[2], ac.notas[0] + 12, ac.notas[1] + 12, ac.notas[2] + 12]
                        : [ac.notas[2] + 12, ac.notas[1] + 12, ac.notas[0] + 12, ac.notas[2], ac.notas[1], ac.notas[0]];
      arpa.forEach((m, i)=>cuerda(ctx, bus, m, humano(t + i * b / 2, 7), azar(0.55, 0.9), {vol:0.36, brillo:0.75, sostener:0.994, pan:0.3, dur:1.1}));
      [1, 2].forEach(k=>ac.notas.forEach((m, j)=>cuerda(ctx, bus, m - 12, humano(t + b * k + j * 0.012, 4), 0.5, {vol:0.16, brillo:0.4, dur:0.35, pan:-0.3})));
      for(let i = 0; i < 6; i++) maraca(ctx, bus, humano(t + i * b / 2, 5), i % 2 === 0 ? 0.9 : 0.55, {vol:0.07, dur:0.06});
    } },
  // Vita Fit: pulso de gimnasio contenido (Mi menor), bombo, shaker en semicorcheas, bajo en
  // corcheas y arpegio de cuerda brillante.
  vitafit: { bpm:108, tiempos:4, acordes:[acordeM(40,52,55,59), acordeM(36,52,55,60), acordeM(43,55,59,62), acordeM(38,54,57,62)],
    compas(ctx, bus, t, n, ac, b){
      [0, 2].forEach(k=>bombo(ctx, bus, t + k * b, 0.8));
      if(n % 4 === 3) bombo(ctx, bus, t + 3.5 * b, 0.5);
      for(let i = 0; i < 8; i++) bajo(ctx, bus, ac.raiz + (i % 4 === 3 ? 12 : 0), humano(t + i * b / 2, 4), i % 2 ? 0.55 : 0.75, b * 0.45);
      for(let i = 0; i < 16; i++) if(Math.random() < 0.85) maraca(ctx, bus, humano(t + i * b / 4, 4), i % 4 === 2 ? 0.9 : 0.45, {vol:0.045, frec:8000, dur:0.04});
      const arp = [ac.notas[0] + 12, ac.notas[2] + 12, ac.notas[1] + 12, ac.notas[2] + 12];
      for(let i = 0; i < 8; i++) cuerda(ctx, bus, arp[i % 4], humano(t + i * b / 2, 5), azar(0.4, 0.6), {vol:0.22, brillo:0.8, dur:0.6, pan:(i % 2 ? 0.35 : -0.35)});
      colchon(ctx, bus, ac.notas, t, b * 4, {vol:0.018, corte:1400});
    } },
  // TechNova: ambiente electrónico (Re dórico), arpegio de marimba en semicorcheas con eco,
  // colchón amplio y sub bajo.
  technova: { bpm:92, tiempos:4, acordes:[acordeM(38,57,60,64,65), acordeM(43,59,62,65), acordeM(45,57,60,64), acordeM(41,57,60,64)],
    compas(ctx, bus, t, n, ac, b){
      colchon(ctx, bus, ac.notas, t, b * 4, {vol:0.026, corte:1100, onda:'triangle'});
      bajo(ctx, bus, ac.raiz, humano(t, 3), 0.7, b * 1.8);
      bajo(ctx, bus, ac.raiz, humano(t + b * 2.5, 3), 0.5, b * 1.2);
      const arp = ac.notas.concat([ac.notas[1] + 12]);
      for(let i = 0; i < 16; i++){
        if(Math.random() < 0.18) continue;
        const m = arp[(i * 3 + n) % arp.length] + (i >= 8 && n % 2 ? 12 : 0);
        marimba(ctx, bus, m, humano(t + i * b / 4, 3), azar(0.35, 0.65), {vol:0.11, dur:0.7});
      }
      for(let i = 0; i < 4; i++) maraca(ctx, bus, humano(t + i * b + b / 2, 3), 0.6, {vol:0.035, frec:9500, dur:0.03});
    } },
  // Construye YA: tensión de obra (Do menor), pulso grave en negras, colchón oscuro y un golpe
  // metálico lejano de vez en cuando.
  construyeya: { bpm:74, tiempos:4, acordes:[acordeM(36,55,60,63), acordeM(32,56,60,63), acordeM(29,56,60,65), acordeM(31,55,59,62)],
    compas(ctx, bus, t, n, ac, b){
      colchon(ctx, bus, ac.notas, t, b * 4, {vol:0.032, corte:650});
      for(let i = 0; i < 4; i++) bajo(ctx, bus, ac.raiz, humano(t + i * b, 4), i === 0 ? 0.9 : 0.55, b * 0.8);
      bombo(ctx, bus, t, 0.6);
      const motivo = [ac.notas[0], ac.notas[1], ac.notas[0], ac.notas[2]];
      motivo.forEach((m, i)=>{ if(Math.random() < 0.75) marimba(ctx, bus, m - 12, humano(t + b * (i + 0.5)), azar(0.45, 0.7), {vol:0.16, dur:1}); });
      if(n % 4 === 2) marimba(ctx, bus, ac.notas[2] + 24, humano(t + b * 3.25), 0.5, {vol:0.06, dur:2.4});
      for(let i = 0; i < 8; i++) if(i % 2) maraca(ctx, bus, humano(t + i * b / 2, 6), 0.5, {vol:0.03, frec:3500, dur:0.09});
    } },
  // Moda Urbana: lo-fi con swing (Fa mayor, acordes de séptima), piano eléctrico, bajo,
  // bombo, escobilla en 2 y 4.
  modaurbana: { bpm:84, tiempos:4, swing:0.62, acordes:[acordeM(41,57,60,64,67), acordeM(40,55,59,62,67), acordeM(38,57,60,64,65), acordeM(36,55,59,64,67)],
    compas(ctx, bus, t, n, ac, b, sw){
      const ocho = (i)=>t + Math.floor(i / 2) * b + (i % 2 ? b * sw : 0);
      ac.notas.forEach((m, j)=>rhodes(ctx, bus, m, humano(t + j * 0.015, 6), azar(0.6, 0.8), b * 1.4));
      ac.notas.slice(1).forEach((m, j)=>rhodes(ctx, bus, m, humano(ocho(3) + j * 0.012, 6), azar(0.4, 0.55), b * 0.9));
      bajo(ctx, bus, ac.raiz, humano(t, 5), 0.8, b * 1.4);
      bajo(ctx, bus, ac.raiz + 7, humano(ocho(5), 5), 0.6, b * 0.6);
      bajo(ctx, bus, ac.raiz + (n % 2 ? 10 : 12), humano(ocho(7), 5), 0.5, b * 0.5);
      bombo(ctx, bus, t, 0.75); bombo(ctx, bus, ocho(5), 0.5);
      [1, 3].forEach(k=>maraca(ctx, bus, humano(t + k * b, 5), 0.9, {vol:0.08, frec:2200, dur:0.16}));
      for(let i = 0; i < 8; i++) maraca(ctx, bus, humano(ocho(i), 5), i % 2 ? 0.5 : 0.8, {vol:0.035, frec:7500, dur:0.04});
    } },
};

// Agenda el compás n del estilo a partir del tiempo t. Devuelve la duración del compás.
function musicaProgramarCompas(ctx, bus, estiloId, t, n){
  const e = MUSICA_ESTILOS[estiloId];
  const b = 60 / e.bpm;
  const acorde = e.acordes[n % e.acordes.length];
  e.compas(ctx, bus, t, n, acorde, b, e.swing || 0.5);
  return b * e.tiempos;
}

// ---------------------------------------------------------------- Control en vivo
function iniciarMusica(estiloId){
  const ctx = getAudioCtx();
  if(!ctx || !MUSICA_ESTILOS[estiloId]) return;
  if(musica && musica.estilo === estiloId) return;
  detenerMusica();
  const bus = musicaConstruirBus(ctx);
  bus.maestro.gain.linearRampToValueAtTime(MUSICA_VOLUMEN * volumenGeneral, ctx.currentTime + 3);
  const m = { ctx, bus, estilo:estiloId, compas:0, siguiente:ctx.currentTime + 0.3, timer:null };
  const programar = ()=>{
    while(m.siguiente < ctx.currentTime + 1.2){
      m.siguiente += musicaProgramarCompas(ctx, bus, estiloId, m.siguiente, m.compas++);
    }
    m.timer = setTimeout(programar, 400);
  };
  programar();
  musica = m;
}
function detenerMusica(){
  if(!musica) return;
  const m = musica; musica = null;
  clearTimeout(m.timer);
  const t = m.ctx.currentTime;
  m.bus.maestro.gain.cancelScheduledValues(t);
  m.bus.maestro.gain.setValueAtTime(m.bus.maestro.gain.value, t);
  m.bus.maestro.gain.linearRampToValueAtTime(0, t + 1.5);
  setTimeout(()=>{ try{ m.bus.maestro.disconnect(); }catch(e){} }, 1800);
}
function actualizarVolumenMusica(){
  if(!musica) return;
  musica.bus.maestro.gain.linearRampToValueAtTime(MUSICA_VOLUMEN * volumenGeneral, musica.ctx.currentTime + 0.15);
}
// Con la empresa en zona crítica la música se oscurece (se cierra el filtro); al recuperarse, se abre.
function actualizarMusicaSegunSalud(h){
  if(!musica) return;
  const corte = h <= 25 ? 1100 : h <= 45 ? 3000 : 9000;
  musica.bus.filtro.frequency.setTargetAtTime(corte, musica.ctx.currentTime, 1.2);
}
