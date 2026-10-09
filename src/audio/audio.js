/* =========================================================================================
   MOTOR DE AUDIO — Web Audio API, 100% procedural, sin archivos externos
   ========================================================================================= */
let audioCtx = null;
let volumenGeneral = 1.0; // multiplicador global, ajustable desde AJUSTES (0.0 a 1.5)
function getAudioCtx(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ return null; }
  }
  if(audioCtx.state === 'suspended'){ audioCtx.resume().catch(()=>{}); }
  return audioCtx;
}

// 1) Clic mecánico sordo — ráfaga corta de ruido filtrado en pasa-bajos
function sonidoClick(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const dur = 0.045;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){
    data[i] = (Math.random()*2-1) * Math.pow(1 - i/bufferSize, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 850;
  const gain = ctx.createGain();
  gain.gain.value = 0.5 * volumenGeneral;
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start();
}

// 2) Pitido grave de advertencia — tono descendente y corto
function sonidoAlertaCaja(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.26);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.38 * volumenGeneral), ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.32);
}
function tendenciaCajaNegativa(){
  const h = state && state.healthHistory;
  if(!h || h.length < 2) return false;
  return h[h.length-1].caja < h[h.length-2].caja;
}

// 3) Zumbido grave de fondo — dron casi imperceptible, arranca con la partida
let droneOsc = null, droneGain = null;
function iniciarDrone(){
  const ctx = getAudioCtx();
  if(!ctx || droneOsc) return;
  droneOsc = ctx.createOscillator();
  droneOsc.type = 'sine';
  droneOsc.frequency.value = 45;
  droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  droneOsc.connect(droneGain).connect(ctx.destination);
  droneOsc.start();
  droneGain.gain.linearRampToValueAtTime(0.032 * volumenGeneral, ctx.currentTime + 2.5);
  if(sectorActual) iniciarMusica(sectorActual.id);
}
function detenerDrone(){
  if(musica && musica.estilo !== 'menu') detenerMusica();
  if(!droneOsc) return;
  const ctx = getAudioCtx();
  if(droneGain && ctx){ droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); }
  const oscRef = droneOsc;
  setTimeout(()=>{ try{ oscRef.stop(); }catch(e){} }, 900);
  droneOsc = null; droneGain = null;
}
function actualizarVolumenEnVivo(){
  // Actualiza en vivo TODAS las capas de sonido de larga duración (los sonidos
  // instantáneos ya toman volumenGeneral en el momento en que se disparan).
  const ctx = getAudioCtx();
  if(!ctx) return;
  if(droneGain){ droneGain.gain.linearRampToValueAtTime(0.032 * volumenGeneral, ctx.currentTime + 0.15); }
  if(droneCriticoGain){ droneCriticoGain.gain.linearRampToValueAtTime(0.02 * volumenGeneral, ctx.currentTime + 0.15); }
  if(murmulloNodes){ murmulloNodes.gain.gain.linearRampToValueAtTime(0.018 * volumenGeneral, ctx.currentTime + 0.15); }
  actualizarVolumenMusica();
}

// 4) Tecla de máquina de escribir — tic breve y agudo, tono ligeramente aleatorio
function sonidoTecla(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const dur = 0.03;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){
    data[i] = (Math.random()*2-1) * Math.pow(1 - i/bufferSize, 4);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2100 + Math.random()*900;
  filter.Q.value = 4;
  const gain = ctx.createGain();
  gain.gain.value = 0.42 * volumenGeneral;
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start();
}

// 5) Confirmación de decisión — tono ascendente, más sólido que el clic genérico de botón
function sonidoConfirmacion(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(240, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.1);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.32 * volumenGeneral), ctx.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.24);
}

// Voz de campana suave para los resultados: parciales inarmónicos (como una marimba de madera)
// que decaen a distinto ritmo, filtrados y con un eco corto — suena a instrumento, no a pitido.
function tocarCampana(ctx, freq, inicio, opts){
  opts = opts || {};
  const vol = (opts.vol || 0.2) * volumenGeneral;
  const dur = opts.dur || 1.4;
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = opts.brillo || 2600;
  const salida = ctx.createGain();
  salida.gain.value = 1;
  filtro.connect(salida).connect(ctx.destination);
  // Eco corto (≈ sala pequeña): retardo con realimentación baja.
  const eco = ctx.createDelay(1);
  eco.delayTime.value = 0.13;
  const realim = ctx.createGain();
  realim.gain.value = 0.22;
  const envio = ctx.createGain();
  envio.gain.value = 0.18;
  filtro.connect(envio).connect(eco);
  eco.connect(realim).connect(eco);
  eco.connect(ctx.destination);
  [[1, 1, dur], [2.76, 0.32, dur*0.45], [5.4, 0.12, dur*0.22]].forEach(([ratio, amp, d])=>{
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio;
    osc.detune.value = (Math.random() - 0.5) * 6; // leve imperfección humana
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * amp), inicio + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + d);
    osc.connect(g).connect(filtro);
    osc.start(inicio);
    osc.stop(inicio + d + 0.05);
  });
  setTimeout(()=>{ try{ salida.disconnect(); eco.disconnect(); realim.disconnect(); }catch(e){} }, (inicio - ctx.currentTime + dur + 1.5) * 1000);
}

// Resultado de una decisión: bueno = tercera mayor ascendente y clara; malo = dos notas
// graves descendentes y apagadas; doble filo = una sola nota media, neutra.
function sonidoResultado(tipo){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const t = ctx.currentTime + 0.05;
  if(tipo === 'pos'){
    tocarCampana(ctx, 523.25, t, {vol:0.16, brillo:3200});        // Do5
    tocarCampana(ctx, 659.25, t + 0.12, {vol:0.15, brillo:3400}); // Mi5
    tocarCampana(ctx, 783.99, t + 0.24, {vol:0.12, brillo:3600, dur:1.8}); // Sol5
  } else if(tipo === 'neg'){
    tocarCampana(ctx, 233.08, t, {vol:0.22, brillo:900, dur:1.2});        // Si♭3
    tocarCampana(ctx, 196.00, t + 0.2, {vol:0.24, brillo:700, dur:1.8});  // Sol3
  } else {
    tocarCampana(ctx, 392.00, t, {vol:0.16, brillo:1800, dur:1.3});       // Sol4
  }
}

// 6) Segunda capa de dron — se enciende sola cuando la salud entra en zona crítica,
// ligeramente desafinada respecto al dron base (45Hz vs 47Hz) para crear un "batido" incómodo
let droneCriticoOsc = null, droneCriticoGain = null;
function iniciarDroneCritico(){
  const ctx = getAudioCtx();
  if(!ctx || droneCriticoOsc) return;
  droneCriticoOsc = ctx.createOscillator();
  droneCriticoOsc.type = 'sine';
  droneCriticoOsc.frequency.value = 47;
  droneCriticoGain = ctx.createGain();
  droneCriticoGain.gain.value = 0;
  droneCriticoOsc.connect(droneCriticoGain).connect(ctx.destination);
  droneCriticoOsc.start();
  droneCriticoGain.gain.linearRampToValueAtTime(0.02 * volumenGeneral, ctx.currentTime + 2);
}
function detenerDroneCritico(){
  if(!droneCriticoOsc) return;
  const ctx = getAudioCtx();
  if(droneCriticoGain && ctx){ droneCriticoGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2); }
  const oscRef = droneCriticoOsc;
  setTimeout(()=>{ try{ oscRef.stop(); }catch(e){} }, 1300);
  droneCriticoOsc = null; droneCriticoGain = null;
}
function actualizarDroneCriticoSegunSalud(){
  if(!state) return;
  const h = healthScore(state);
  if(h <= 25){ iniciarDroneCritico(); } else { detenerDroneCritico(); }
  actualizarMusicaSegunSalud(h);
}

// El Comité te observa — dos tonos graves y ligeramente desafinados entre sí, sostenidos,
// que se sienten deliberadamente incómodos: la sensación de que algo te está mirando.
function sonidoElComiteObserva(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  [55, 55.7].forEach((freq)=>{
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, 0.16 * volumenGeneral), ctx.currentTime + 0.6);
    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.3);
  });
}

// 7) Timbre del cierre trimestral — acorde corto, solemne y descendente (Sol-Mi-Do)
function sonidoTimbreJunta(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const t = ctx.currentTime + 0.05;
  [392, 329.63, 261.63].forEach((freq, i)=>tocarCampana(ctx, freq, t + i*0.26, {vol:0.2, brillo:2000, dur:i===2 ? 2.4 : 1.4}));
  tocarCampana(ctx, 130.81, t + 0.52, {vol:0.12, brillo:600, dur:2.6}); // Do2 grave de fondo
}

// 8) Firmas sonoras propias para cada uno de los 4 eventos de cultura de oficina
function sonidoClima(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 110;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(Math.max(0.0001, 0.12 * volumenGeneral), ctx.currentTime + 0.3);
  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}
function sonidoCafe(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  for(let i=0;i<6;i++){
    const t = ctx.currentTime + i*0.09 + Math.random()*0.03;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 300 + Math.random()*250;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.1 * volumenGeneral), t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}
function sonidoCumple(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const notas = [523, 659, 784];
  notas.forEach((freq, i)=>{
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const start = ctx.currentTime + i*0.13;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.2 * volumenGeneral), start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}
function sonidoNevera(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(90, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.16 * volumenGeneral), ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.65);
}
function sonidoImpresora(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const bufferSize = Math.floor(ctx.sampleRate * 0.4);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (1 - i/bufferSize); }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 700;
  filter.Q.value = 3;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(Math.max(0.0001, 0.2 * volumenGeneral), ctx.currentTime + 0.03);
  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + 0.42);
}
// Pantalla azul: tono grave descendente de "falla critica"
function sonidoPantallaAzul(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.2 * volumenGeneral), ctx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.58);
}
// Correo enviado a todos: campanita rapida de alerta
function sonidoCorreoTodos(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  [880, 660].forEach((freq,i)=>{
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const start = ctx.currentTime + i*0.09;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.18 * volumenGeneral), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.17);
  });
}
// Encuesta de clima: tono neutro de "notificación de formulario"
function sonidoEncuestaClima(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.16 * volumenGeneral), ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.27);
}
// Apagon: zumbido de planta electrica arrancando
function sonidoApagon(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(40, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(85, ctx.currentTime + 0.3);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(Math.max(0.0001, 0.18 * volumenGeneral), ctx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.85);
}
const SONIDO_OFICINA_POR_TIPO = {
  clima_caos: sonidoClima,
  dilema_cafe: sonidoCafe,
  cumple_inoportuno: sonidoCumple,
  guerra_nevera: sonidoNevera,
  impresora_atascada: sonidoImpresora,
  pantalla_azul: sonidoPantallaAzul,
  correo_todos: sonidoCorreoTodos,
  encuesta_clima: sonidoEncuestaClima,
  apagon: sonidoApagon
};

// 9) Murmullo de oficina — capa de ruido filtrado, solo mientras dura "Situación en la oficina"
let murmulloNodes = null;
function iniciarMurmulloOficina(){
  const ctx = getAudioCtx();
  if(!ctx || murmulloNodes) return;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){ data[i] = Math.random()*2-1; }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 500;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start();
  gain.gain.linearRampToValueAtTime(0.018 * volumenGeneral, ctx.currentTime + 0.8);
  murmulloNodes = {noise, gain};
}
function detenerMurmulloOficina(){
  if(!murmulloNodes) return;
  const ctx = getAudioCtx();
  if(ctx) murmulloNodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  const ref = murmulloNodes;
  setTimeout(()=>{ try{ ref.noise.stop(); }catch(e){} }, 600);
  murmulloNodes = null;
}

// 10) Ambientación de los menús previos a la partida (portada, selección de sector y de
// perfil) — una capa suave y curiosa, deliberadamente distinta de la tensión del dron
// de partida: dos tonos casi idénticos ligeramente desafinados entre sí (130Hz / 130.6Hz)
// Ambiente del menú: el tema "menu" de la música de fondo (audio/musica.js).
function iniciarAmbienteMenu(){ iniciarMusica('menu'); }
function detenerAmbienteMenu(){ if(musica && musica.estilo === 'menu') detenerMusica(); }

// Clic mecánico en CUALQUIER botón de la app (delegado, fase de captura para que nunca falle)
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(btn) sonidoClick();
}, true);

