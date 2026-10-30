/* =========================================================
   ALARMA, JUNTA Y FINALES — "Sala de mando", etapa 3 (oct. 2026)
   Modo alarma cuando la empresa está en zona crítica (marco rojo, cinta de avisos y
   parpadeos), la sesión de junta y su veredicto, el combo de buenas decisiones seguidas,
   y los finales: lluvia de monedas al cerrar el año, grietas y apagón en la quiebra.
   Solo visual; usa azarVisual() (ui/efectos-turno.js), nunca Math.random.
   ========================================================= */

// Qué tiene a la empresa en peligro ahora mismo. 'critico' enciende la alarma; 'tension',
// un aviso ámbar más suave. Los umbrales son los de la viñeta de estrés y de colorFor.
function nivelAlarma(){
  if(!state || !sectorActual) return {nivel:null, motivos:[]};
  const criticos = [];
  if(state.caja <= 5) criticos.push('Caja en zona crítica');
  if(state.razonCorriente < 1) criticos.push('Razón corriente bajo 1');
  if(state.wacc >= 20) criticos.push('WACC sobre el 20 %');
  if(state.deuda >= 45) criticos.push('Endeudamiento crítico');
  if(state.ebitda <= 0) criticos.push('EBITDA negativo');
  [['confianzaBanco','Confianza del banco'],['confianzaProveedores','Confianza de proveedores'],
   ['reputacion','Respaldo de la junta'],['moralEquipo','Moral del equipo']].forEach(([k,n])=>{
    if(state[k] != null && statusPill(state[k]).tier === 'critico') criticos.push(n + ' en riesgo crítico');
  });
  if(sectorActual.tieneInventario && state.diasInventario >= 90) criticos.push('Inventario a punto de volverse obsoleto');
  if(criticos.length) return {nivel:'critico', motivos:criticos};
  if(state.caja <= 15 || state.wacc >= 16) return {nivel:'tension', motivos:[]};
  return {nivel:null, motivos:[]};
}
function actualizarAlarma(){
  const enPartida = document.body.classList.contains('en-partida');
  const a = enPartida ? nivelAlarma() : {nivel:null, motivos:[]};
  const yaEnAlarma = document.body.classList.contains('alarma');
  document.body.classList.toggle('alarma', a.nivel === 'critico');
  if(a.nivel === 'critico' && !yaEnAlarma) sonidoAlarma();
  document.body.classList.toggle('tension', a.nivel === 'tension');
  const texto = document.getElementById('alarmaTexto');
  if(texto && a.nivel === 'critico'){
    const linea = '⚠ ALERTA ROJA · ' + a.motivos.map(m=>m.toUpperCase()).join(' · ') + ' · ';
    if(texto.getAttribute('data-linea') !== linea){
      texto.setAttribute('data-linea', linea);
      texto.textContent = linea.repeat(4);
    }
  }
}

// Sesión de junta: la ventana cambia a dorado y la barra dice qué trimestre se cierra.
function prepararVentanaJunta(c){
  const ventana = document.getElementById('ventanaTurno');
  if(!ventana) return;
  const eraJunta = ventana.classList.contains('modo-junta');
  ventana.classList.toggle('modo-junta', !!c && c.tipo === 'junta');
  if(c && c.tipo !== 'junta' && eraJunta){
    // Tras la junta puede seguir otro caso en la misma ventana: vuelve el título normal.
    const titulo = document.getElementById('ventanaTitulo');
    if(titulo) titulo.textContent = 'Ventana de decisión · turno ' + Math.max(turnNumber, 1);
  }
  if(c && c.tipo === 'junta'){
    const titulo = document.getElementById('ventanaTitulo');
    const trimestre = Math.max(1, Math.round(turnNumber / 5));
    if(titulo) titulo.textContent = `Junta directiva · cierre del trimestre ${trimestre} de ${Math.floor(MAX_TURNS/5)}`;
  }
}
function veredictoMetaHTML(datos){
  if(!datos || !datos.metaAnterior) return '';
  sonidoVeredicto(!!datos.cumplida);
  return datos.cumplida
    ? '<div class="veredicto-meta ok">META CUMPLIDA</div>'
    : '<div class="veredicto-meta no">META NO CUMPLIDA</div>';
}

// Combo: decisiones seguidas con sello positivo ("Decisión que fortalece el balance").
let comboDecisiones = 0;
function reiniciarCombo(){ comboDecisiones = 0; }
function comboHTML(stampClass){
  comboDecisiones = stampClass === 'pos' ? comboDecisiones + 1 : 0;
  if(comboDecisiones >= 2) sonidoCombo(comboDecisiones);
  return comboDecisiones >= 2 ? `<div class="combo-decisiones">COMBO ×${comboDecisiones}</div>` : '';
}

// Quiebra: la pantalla se agrieta, tiembla y se apaga como un monitor viejo antes del informe.
function grietasSVG(){
  const cx = 683, cy = 400; let lineas = '';
  for(let i=0;i<9;i++){
    let x = cx, y = cy, ang = (i/9)*Math.PI*2 + azarVisual()*0.5, puntos = `${x},${y}`;
    for(let j=0;j<6;j++){
      ang += (azarVisual()-0.5)*0.9; const paso = 60 + azarVisual()*90;
      x += Math.cos(ang)*paso; y += Math.sin(ang)*paso; puntos += ` ${Math.round(x)},${Math.round(y)}`;
    }
    lineas += `<polyline points="${puntos}"/>`;
  }
  return `<svg class="grietas" viewBox="0 0 1366 800" preserveAspectRatio="xMidYMid slice">${lineas}</svg>`;
}
function secuenciaQuiebra(alTerminar){
  const capa = document.getElementById('efectoCapa');
  if(!capa || reducirMovimiento()){ alTerminar(); return; }
  sonidoQuiebra();
  capa.innerHTML = grietasSVG();
  capa.className = 'efecto-capa quiebra';
  activarShakeSiAplica(true);
  setTimeout(()=>{ document.body.classList.add('apagon'); }, 900);
  setTimeout(()=>{
    capa.className = 'efecto-capa'; capa.innerHTML = '';
    alTerminar();
  }, 1700);
}

// Finales: cartel de misión y, al cerrar el año, monedas que caen (más cuanto mejor el rango).
function cartelMision(texto, clase){
  const capa = document.getElementById('efectoCapa');
  if(!capa) return;
  const c = document.createElement('div');
  c.className = 'cartel-mision ' + clase;
  c.textContent = texto;
  capa.appendChild(c);
  setTimeout(()=>{ if(c.parentNode) c.parentNode.removeChild(c); }, 2600);
}
function lluviaMonedas(cantidad){
  const capa = document.getElementById('efectoCapa');
  if(!capa || reducirMovimiento()) return;
  for(let i=0;i<cantidad;i++){
    const m = document.createElement('i');
    m.className = 'moneda';
    m.style.left = (azarVisual()*100) + 'vw';
    m.style.animationDuration = (1.6 + azarVisual()*1.6) + 's, ' + (0.5 + azarVisual()*0.5) + 's';
    m.style.animationDelay = (azarVisual()*1.4) + 's, 0s';
    capa.appendChild(m);
    setTimeout(()=>{ if(m.parentNode) m.parentNode.removeChild(m); }, 5000);
  }
}
function festejarFinal(ending){
  document.body.classList.remove('apagon');
  document.body.classList.add('informe-final', ending.tipoFinal === 'cierre' ? 'victoria' : 'derrota');
  // El informe empieza arriba (en el celular el tablero podía haber quedado desplazado).
  try{ window.scrollTo(0, 0); }catch(e){}
  if(ending.tipoFinal === 'cierre'){
    const monedas = {S:90, A:60, B:35, C:15}[ending.rango] || 20;
    cartelMision('MISIÓN CUMPLIDA', 'ok');
    lluviaMonedas(monedas);
    sonidoFinal(true, monedas);
  } else {
    cartelMision('MISIÓN FALLIDA', 'no');
    sonidoFinal(false, 0);
  }
}
function limpiarFinal(){
  document.body.classList.remove('informe-final', 'victoria', 'derrota', 'apagon', 'alarma', 'tension');
}
