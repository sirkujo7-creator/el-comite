/* =========================================================================================
   SONIDOS DE LA SALA DE MANDO — etapa 4 (oct. 2026)
   Acompañan, sincronizados, a los efectos visuales de ui/efectos-turno.js y efectos-finales.js:
   encendido, ventana, título que se descifra, opciones, sello, cálculo, impacto en las
   tarjetas, alarma, junta, combo, quiebra y cierre. Procedurales (Web Audio), discretos y
   cortos. Usan azarVisual(), nunca Math.random (las partidas con semilla no cambian).
   ========================================================================================= */
function sonidosActivos(){ return volumenGeneral > 0 && !!getAudioCtx(); }
// Un tono con envolvente corta; `hasta` desliza la frecuencia (glissando).
function tonoSala(ctx, freq, inicio, dur, opts){
  opts = opts || {};
  const osc = ctx.createOscillator();
  osc.type = opts.tipo || 'sine';
  osc.frequency.setValueAtTime(freq, inicio);
  if(opts.hasta) osc.frequency.exponentialRampToValueAtTime(opts.hasta, inicio + dur);
  const g = ctx.createGain();
  const vol = Math.max(0.0001, (opts.vol || 0.1) * volumenGeneral);
  g.gain.setValueAtTime(0.0001, inicio);
  g.gain.exponentialRampToValueAtTime(vol, inicio + (opts.ataque || 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
  let salida = g;
  if(opts.filtro){
    const f = ctx.createBiquadFilter();
    f.type = opts.filtro; f.frequency.value = opts.corte || 1200;
    g.connect(f); salida = f;
  }
  osc.connect(g); salida.connect(ctx.destination);
  osc.start(inicio); osc.stop(inicio + dur + 0.03);
}
// Ráfaga de ruido filtrado (golpes, chasquidos, estática).
function ruidoSala(ctx, inicio, dur, opts){
  opts = opts || {};
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  const caida = opts.caida || 3;
  for(let i=0;i<n;i++) datos[i] = (azarVisual()*2 - 1) * Math.pow(1 - i/n, caida);
  const src = ctx.createBufferSource(); src.buffer = buffer;
  const f = ctx.createBiquadFilter(); f.type = opts.filtro || 'lowpass'; f.frequency.value = opts.corte || 900;
  if(opts.q) f.Q.value = opts.q;
  const g = ctx.createGain(); g.gain.value = (opts.vol || 0.3) * volumenGeneral;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(inicio);
}

// Encendido del tablero: zumbido que sube y un golpe de corriente.
function sonidoEncendidoTablero(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.02;
  ruidoSala(ctx, t, 0.08, {vol:0.35, corte:420});
  tonoSala(ctx, 60, t, 0.9, {tipo:'sawtooth', hasta:15000, vol:0.025, filtro:'lowpass', corte:3000, ataque:0.2});
  for(let i=0;i<5;i++) tonoSala(ctx, 880 + i*120, t + 0.18 + i*0.11, 0.05, {tipo:'square', vol:0.025, filtro:'lowpass', corte:2400});
}
// La ventana se enciende: chasquido de tubo y un pitido agudo breve.
function sonidoVentana(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.01;
  ruidoSala(ctx, t, 0.05, {vol:0.22, filtro:'bandpass', corte:1800, q:1.5});
  tonoSala(ctx, 7800, t + 0.03, 0.18, {vol:0.012});
  tonoSala(ctx, 180, t, 0.25, {tipo:'triangle', hasta:420, vol:0.06});
}
// Título que se descifra: ráfaga de bips de datos durante ~0,8 s.
function sonidoDescifrar(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.02;
  for(let i=0;i<12;i++) tonoSala(ctx, 900 + azarVisual()*1400, t + i*0.065, 0.025, {tipo:'square', vol:0.04, filtro:'lowpass', corte:3000});
}
// Pasar por una opción: un clic suave (como mucho uno cada 90 ms).
let ultimoSonidoOpcion = -1;
function sonidoOpcion(i){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx();
  if(ctx.currentTime - ultimoSonidoOpcion < 0.09) return;
  ultimoSonidoOpcion = ctx.currentTime;
  tonoSala(ctx, [523, 587, 659, 784, 880][i % 5], ctx.currentTime + 0.005, 0.07, {tipo:'triangle', vol:0.08});
}
// Sello "ORDEN EJECUTADA": golpe grave en el instante en que el sello toca la ventana.
function sonidoSello(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.22;
  tonoSala(ctx, 140, t, 0.35, {hasta:42, vol:0.3, ataque:0.003});
  ruidoSala(ctx, t, 0.12, {vol:0.3, corte:700});
  ruidoSala(ctx, t, 0.03, {vol:0.15, filtro:'highpass', corte:3000});
}
// "Calculando impacto": un bip por cada bloque de la barra (12 en 0,9 s).
function sonidoCalculando(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.02;
  for(let i=0;i<12;i++) tonoSala(ctx, 440 + i*45, t + i*0.075, 0.03, {tipo:'square', vol:0.06, filtro:'lowpass', corte:2600});
}
// Impacto en las tarjetas: un solo sonido por decisión, según lo que predomine.
let impactoPendiente = null;
function sonidoImpacto(tipo){
  if(!sonidosActivos()) return;
  if(!impactoPendiente) impactoPendiente = {bueno:0, malo:0, inversion:0};
  impactoPendiente[tipo] = (impactoPendiente[tipo] || 0) + 1;
  if(impactoPendiente.temporizador) return;
  impactoPendiente.temporizador = setTimeout(()=>{
    const p = impactoPendiente; impactoPendiente = null;
    if(!sonidosActivos()) return;
    const ctx = getAudioCtx(), t = ctx.currentTime + 0.02;
    if(p.bueno >= p.malo){
      [1046.5, 1318.5, 1568, 2093].forEach((f,i)=>tonoSala(ctx, f, t + i*0.05, 0.22, {vol:0.09}));
    } else {
      ruidoSala(ctx, t, 0.18, {vol:0.6, corte:500, caida:2});
      tonoSala(ctx, 220, t, 0.3, {tipo:'square', hasta:110, vol:0.09, filtro:'lowpass', corte:900});
    }
    if(p.inversion) tonoSala(ctx, 660, t + 0.08, 0.25, {tipo:'triangle', vol:0.09});
    // Tic-tac del conteo de las cifras (0,9 s)
    for(let i=0;i<7;i++) tonoSala(ctx, 1500, t + 0.1 + i*0.11, 0.012, {tipo:'square', vol:0.03});
  }, 40);
}
// Entrada en alarma: dos tonos de sirena, dos veces (solo al entrar, no en bucle).
function sonidoAlarma(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.05;
  for(let i=0;i<2;i++){
    tonoSala(ctx, 880, t + i*0.5, 0.22, {tipo:'square', vol:0.12, filtro:'lowpass', corte:1800});
    tonoSala(ctx, 660, t + i*0.5 + 0.24, 0.22, {tipo:'square', vol:0.12, filtro:'lowpass', corte:1800});
  }
}
// Veredicto de la junta: mazo y, según el resultado, fanfarria breve o golpe sordo.
function sonidoVeredicto(cumplida){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.72;
  ruidoSala(ctx, t, 0.1, {vol:0.45, corte:600});
  tonoSala(ctx, 110, t, 0.25, {hasta:60, vol:0.3});
  if(cumplida){
    [523.25, 659.25, 783.99, 1046.5].forEach((f,i)=>tocarCampana(ctx, f, t + 0.15 + i*0.09, {vol:0.12, brillo:3600, dur:1.4}));
  } else {
    tocarCampana(ctx, 155.56, t + 0.15, {vol:0.2, brillo:700, dur:1.6});
    tocarCampana(ctx, 146.83, t + 0.17, {vol:0.18, brillo:700, dur:1.6});
  }
}
// Combo: arpegio que sube un escalón por cada decisión positiva seguida.
function sonidoCombo(n){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.35;
  const base = 523.25 * Math.pow(2, Math.min(n - 2, 6) / 12);
  [1, 1.25, 1.5, 2].forEach((r,i)=>tonoSala(ctx, base * r, t + i*0.06, 0.12, {tipo:'square', vol:0.08, filtro:'lowpass', corte:4000}));
}
// Quiebra: chasquidos de vidrio que se agrieta y, al final, el apagón del monitor.
function sonidoQuiebra(){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.02;
  for(let i=0;i<9;i++) ruidoSala(ctx, t + i*0.045 + azarVisual()*0.03, 0.06, {vol:0.3, filtro:'highpass', corte:2500 + azarVisual()*2500, caida:6});
  tonoSala(ctx, 70, t, 0.6, {tipo:'sawtooth', vol:0.08, filtro:'lowpass', corte:300});
  const apagon = t + 0.9;
  tonoSala(ctx, 3200, apagon, 0.7, {hasta:40, vol:0.12});
  ruidoSala(ctx, apagon + 0.65, 0.05, {vol:0.3, corte:500});
}
// Cartel final: MISIÓN CUMPLIDA (fanfarria + monedas) o MISIÓN FALLIDA (caída y estática).
function sonidoFinal(victoria, monedas){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx(), t = ctx.currentTime + 0.05;
  if(victoria){
    [[523.25,0],[659.25,0.12],[783.99,0.24],[1046.5,0.36],[783.99,0.54],[1046.5,0.66]].forEach(([f,d])=>
      tonoSala(ctx, f, t + d, d >= 0.6 ? 0.6 : 0.14, {tipo:'square', vol:0.16, filtro:'lowpass', corte:3500}));
    for(let i=0;i<Math.min(monedas, 40);i++){
      const c = t + 0.4 + azarVisual()*2.6;
      tonoSala(ctx, 1975, c, 0.06, {tipo:'square', vol:0.045, filtro:'lowpass', corte:5000});
      tonoSala(ctx, 2637, c + 0.06, 0.16, {tipo:'square', vol:0.045, filtro:'lowpass', corte:5000});
    }
  } else {
    [392, 369.99, 349.23, 329.63].forEach((f,i)=>tonoSala(ctx, f, t + i*0.28, 0.32, {tipo:'square', vol:0.15, filtro:'lowpass', corte:1500}));
    tonoSala(ctx, 311.13, t + 1.12, 1.2, {tipo:'square', hasta:150, vol:0.15, filtro:'lowpass', corte:1200});
    ruidoSala(ctx, t, 0.5, {vol:0.15, filtro:'bandpass', corte:3000, caida:1});
  }
}
// Juegos de memoria de la oficina (impresora, pantalla azul): un tono por destello, de una
// escala fija para que la secuencia también se pueda recordar de oído.
function sonidoMemoria(i){
  if(!sonidosActivos()) return;
  const ctx = getAudioCtx();
  tonoSala(ctx, [523.25, 659.25, 783.99, 1046.5][i % 4], ctx.currentTime + 0.01, 0.3, {tipo:'square', vol:0.06, filtro:'lowpass', corte:2600});
}
// Botones de la oficina: el mismo clic suave al pasar por encima que las opciones de un caso,
// y un golpe de tecla al pulsar las flechas o teclas de los juegos de memoria.
document.addEventListener('mouseover', (e)=>{
  const b = e.target && e.target.closest ? e.target.closest('.oficina-choice-btn:not(:disabled)') : null;
  if(b && !(e.relatedTarget && b.contains && b.contains(e.relatedTarget))) sonidoOpcion(Array.from(b.parentNode.children).indexOf(b));
});
document.addEventListener('click', (e)=>{
  const t = e.target && e.target.closest ? e.target.closest('.impresora-flecha, .pantalla-tecla') : null;
  if(t && !t.disabled && sonidosActivos()){ const ctx = getAudioCtx(); ruidoSala(ctx, ctx.currentTime + 0.005, 0.04, {vol:0.25, filtro:'bandpass', corte:2400, q:2}); }
});
