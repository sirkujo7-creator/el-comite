/* =========================================================================================
   MÚSICA DE FONDO — generada en vivo con Web Audio, sin archivos
   Menú: el comité en penumbra. Partida (nov. 2026): banda sonora de tensión que reacciona al
   estado de la empresa (calma → tensión → alarma) y calla en la junta; cada sector conserva
   solo un color lejano (COLOR_SECTOR). Antes cada sector tenía un género alegre propio
   (bambuco, joropo, lo-fi…); Juan lo descartó porque sonaba "a música de tienda".
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
// Volumen propio de la música (Ajustes), aparte del volumen general de los efectos.
let volumenMusica = (()=>{ try{ const v = parseFloat(window.localStorage.getItem('elcomite_volumen_musica')); return isNaN(v) ? 1 : v; }catch(e){ return 1; } })();
function nivelVolumenMusica(){ return MUSICA_VOLUMEN * volumenGeneral * volumenMusica; }
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
  // Partida (nov. 2026, reemplaza los estilos alegres por sector, que sonaban "de tienda"):
  // banda sonora de tensión, sin melodía protagonista, en Re menor. Reacciona al estado de la
  // empresa (musica.nivel: calma / tension / alarma, ver actualizarMusicaSegunPartida) y calla
  // durante la junta (musica.junta). Cada sector conserva solo un color lejano (COLOR_SECTOR).
  partida: { bpm:56, tiempos:4, acordes:[acordeM(38,50,53,57,64), acordeM(34,50,53,58,62), acordeM(31,50,55,58,62), acordeM(33,52,57,60,64)],
    compas(ctx, bus, t, n, ac, b){ compasPartida(ctx, bus, t, n, b); } },
};
// Tempo por nivel: el pulso se acelera con el riesgo.
const PARTIDA_BPM = { calma:56, tension:68, alarma:84 };
// Dm(add9) → B♭maj7 → Gm(add9) → Am: dos compases por acorde, ciclo de 8 compases.
const PARTIDA_ACORDES = MUSICA_ESTILOS.partida.acordes;
// Tictac de reloj de pared: la sala espera.
function reloj(ctx, bus, t, vel){
  maraca(ctx, bus, t, vel, {vol:0.05, frec:2600, dur:0.03});
}
// Un compás de la partida según el nivel.
function compasPartida(ctx, bus, t, n, b){
  const nivel = (musica && musica.nivel) || 'calma';
  const ac = PARTIDA_ACORDES[Math.floor(n / 2) % PARTIDA_ACORDES.length];
  const cambio = n % 2 === 0;
  // Junta: solo la sala y el reloj; la música se calla para que pese el veredicto.
  if(musica && musica.junta){
    colchon(ctx, bus, [ac.notas[0], ac.notas[2]], t, b * 4, {vol:0.012, corte:380, onda:'triangle'});
    for(let i = 0; i < 4; i++) reloj(ctx, bus, t + i * b, i % 2 ? 0.5 : 0.7);
    return;
  }
  if(nivel === 'calma'){
    colchon(ctx, bus, ac.notas.slice(0, 3), t, b * 4, {vol:0.02, corte:520, onda:'triangle'});
    if(cambio) bajo(ctx, bus, ac.raiz, humano(t), 0.45, b * 7);
    for(let i = 0; i < 4; i++) reloj(ctx, bus, t + i * b, i % 2 ? 0.35 : 0.5);
    // Una nota suelta, aguda y lejana, de vez en cuando.
    if(Math.random() < 0.55){
      const escala = [ac.notas[1], ac.notas[2], ac.notas[3] || ac.notas[2]];
      marimba(ctx, bus, escala[Math.floor(Math.random()*escala.length)] + 12, humano(t + b * (1 + Math.floor(Math.random()*3)), 20), azar(0.3, 0.45), {vol:0.1, dur:3});
    }
  } else if(nivel === 'tension'){
    colchon(ctx, bus, ac.notas.slice(0, 4), t, b * 4, {vol:0.026, corte:820});
    // Pulso grave en corcheas, acentuado en cada tiempo: el reloj se vuelve latido.
    for(let i = 0; i < 8; i++) bajo(ctx, bus, ac.raiz + 12, humano(t + i * b / 2, 3), i % 2 ? 0.28 : 0.45, b * 0.42);
    bombo(ctx, bus, t, 0.45);
    for(let i = 0; i < 4; i++) reloj(ctx, bus, t + i * b, 0.6);
    // Segunda menor que roza, cada cuatro compases.
    if(n % 4 === 3){ marimba(ctx, bus, ac.notas[2] + 12, humano(t + b * 2), 0.45, {vol:0.09, dur:2.5}); marimba(ctx, bus, ac.notas[2] + 13, humano(t + b * 2.05), 0.4, {vol:0.07, dur:2.5}); }
  } else {
    // Alarma: racimo disonante, pulso rápido, latido doble y un trémolo agudo.
    colchon(ctx, bus, ac.notas.slice(0, 3).concat([ac.notas[0] + 1]), t, b * 4, {vol:0.03, corte:1300});
    for(let i = 0; i < 8; i++) bajo(ctx, bus, ac.raiz + 12, humano(t + i * b / 2, 2), i % 2 ? 0.4 : 0.6, b * 0.4);
    [0, 2].forEach(k=>{ bombo(ctx, bus, t + k * b, 0.7); bombo(ctx, bus, t + k * b + 0.2, 0.45); });
    for(let i = 0; i < 16; i++) marimba(ctx, bus, ac.notas[2] + 24 + (i % 2), t + i * b / 4, 0.3, {vol:0.025, dur:0.25});
  }
  // Color del sector: un gesto lejano cada cuatro compases (no en alarma).
  if(nivel !== 'alarma' && n % 4 === 1 && musica && COLOR_SECTOR[musica.sector]) COLOR_SECTOR[musica.sector](ctx, bus, t, ac, b);
}
const COLOR_SECTOR = {
  // Cuatro llanero rasgueado a lo lejos.
  ganadera:(ctx, bus, t, ac, b)=>[0, 0.5, 1].forEach(k=>ac.notas.slice(0, 3).forEach((m, j)=>cuerda(ctx, bus, m + 12, humano(t + b * (1 + k) + j * 0.014, 4), 0.4, {vol:0.1, brillo:0.45, dur:0.4, pan:0.4}))),
  // Guitarra campesina: cuatro notas arpegiadas.
  agroverde:(ctx, bus, t, ac, b)=>[0, 1, 2, 1].forEach((j, i)=>cuerda(ctx, bus, ac.notas[j] + 12, humano(t + b * (1 + i * 0.5), 8), 0.45, {vol:0.14, brillo:0.4, pan:-0.3})),
  // Eco electrónico.
  technova:(ctx, bus, t, ac, b)=>[0, 2, 1, 3, 2, 0].forEach((j, i)=>marimba(ctx, bus, (ac.notas[j] || ac.notas[0]) + 12, t + b + i * b / 4, 0.4 - i * 0.05, {vol:0.06, dur:0.8})),
  // Gimnasio al otro lado de la pared: bombo apagado.
  vitafit:(ctx, bus, t, ac, b)=>[0, 1, 2, 3].forEach(k=>bombo(ctx, bus, t + k * b, 0.25)),
  // Obra: un golpe metálico agudo y otro grave.
  construyeya:(ctx, bus, t, ac, b)=>{ marimba(ctx, bus, ac.notas[2] + 24, t + b * 1.5, 0.4, {vol:0.06, dur:2.4}); marimba(ctx, bus, ac.raiz, t + b * 1.5, 0.5, {vol:0.12, dur:1.5}); },
  // Moda: un solo acorde de piano eléctrico, lejano.
  modaurbana:(ctx, bus, t, ac, b)=>ac.notas.slice(1).forEach((m, j)=>rhodes(ctx, bus, m, humano(t + b * 2 + j * 0.02, 6), 0.35, b * 2))
};

// Agenda el compás n del estilo a partir del tiempo t. Devuelve la duración del compás.
function musicaProgramarCompas(ctx, bus, estiloId, t, n){
  const e = MUSICA_ESTILOS[estiloId];
  const b = 60 / (estiloId === 'partida' ? PARTIDA_BPM[(musica && musica.nivel) || 'calma'] : e.bpm);
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
  bus.maestro.gain.linearRampToValueAtTime(nivelVolumenMusica(), ctx.currentTime + 3);
  const m = { ctx, bus, estilo:estiloId, compas:0, siguiente:ctx.currentTime + 0.3, timer:null, nivel:'calma', junta:false, sector:null };
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
  musica.bus.maestro.gain.linearRampToValueAtTime(nivelVolumenMusica(), musica.ctx.currentTime + 0.15);
}
// Música de partida: el nivel (calma / tensión / alarma) sigue al de la alarma del tablero
// (nivelAlarma, ui/efectos-finales.js) y cambia en el compás siguiente.
function actualizarMusicaSegunSalud(h){
  if(!musica || musica.estilo !== 'partida') return;
  const a = nivelAlarma();
  musica.nivel = a.nivel === 'critico' ? 'alarma' : a.nivel === 'tension' ? 'tension' : 'calma';
}
// Durante la junta la música se calla: queda la sala y el reloj.
function musicaJunta(activa){
  if(!musica || musica.estilo !== 'partida' || musica.junta === !!activa) return;
  musica.junta = !!activa;
  // Lo ya agendado (hasta un compás) se atenúa enseguida en vez de esperar al siguiente.
  const g = musica.bus.maestro.gain, t = musica.ctx.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(nivelVolumenMusica() * (activa ? 0.45 : 1), t + (activa ? 0.8 : 2.5));
}
