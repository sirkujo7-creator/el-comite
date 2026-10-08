/* =========================================================================================
   SEGUIMIENTO VISUAL DE INDICADORES — historial reciente (para el mini-gráfico), rachas de
   turnos consecutivos en la misma dirección (para el ícono de racha), y el origen del último
   cambio (decisión propia vs. algo automático como el motor operativo o el doble filo) para
   poder distinguirlos con un color distinto.
   ========================================================================================= */
let kpiHistorial = {};
let origenUltimoCambio = {};
let rachaIndicador = {};
const TODOS_LOS_KPIS_VISUALES = ['caja','capitalTrabajo','razonCorriente','deuda','ebitda','wacc','diasInventario','diasCartera','valorInventario','confianzaProveedores','confianzaBanco','reputacion','moralEquipo'];
function esMejorSiSube(key){
  return !['deuda','wacc','diasInventario','diasCartera'].includes(key);
}
function actualizarHistorialYRachas(){
  if(!state) return;
  if(state.deuda != null) deudaMaximaAlcanzada = Math.max(deudaMaximaAlcanzada, state.deuda);
  TODOS_LOS_KPIS_VISUALES.forEach(k=>{
    if(state[k]==null) return;
    if(!kpiHistorial[k]) kpiHistorial[k] = [];
    kpiHistorial[k].push(state[k]);
    if(kpiHistorial[k].length > 8) kpiHistorial[k].shift();
    const hist = kpiHistorial[k];
    if(hist.length >= 2){
      const anterior = hist[hist.length-2], actual = hist[hist.length-1];
      const dir = actual > anterior ? 1 : actual < anterior ? -1 : 0;
      const racha = rachaIndicador[k];
      if(dir !== 0 && racha && racha.dir === dir){ racha.turnos++; }
      else if(dir !== 0){ rachaIndicador[k] = {dir, turnos:1}; }
      else { rachaIndicador[k] = {dir:0, turnos:0}; }
    }
  });
}
function sparklineSVG(key){
  const hist = kpiHistorial[key];
  if(!hist || hist.length < 2) return '';
  const w = 52, h = 14;
  const min = Math.min(...hist), max = Math.max(...hist);
  const rango = (max-min) || 1;
  const puntos = hist.map((v,i)=>{
    const x = hist.length>1 ? (i/(hist.length-1))*w : 0;
    const y = h - ((v-min)/rango)*h;
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  const subiendo = hist[hist.length-1] >= hist[0];
  const bueno = subiendo === esMejorSiSube(key);
  return `<svg class="stat-sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${puntos}" fill="none" stroke="${bueno?'var(--teal)':'var(--danger)'}" stroke-width="1.6"/></svg>`;
}
function tendenciaHTML(key){
  const racha = rachaIndicador[key];
  if(!racha || racha.turnos < 1) return '';
  const subiendo = racha.dir === 1;
  const flecha = subiendo ? '▲' : '▼';
  const fuego = racha.turnos >= 3 ? ' 🔥' : '';
  return `<span class="stat-trend ${subiendo?'up':'down'}" title="${racha.turnos} turno(s) seguidos en esta dirección">${flecha}${fuego}</span>`;
}
function mostrarNumeroFlotante(selector, delta, kind, bueno, esInversion){
  const card = document.querySelector(selector);
  if(!card || !delta) return;
  const num = document.createElement('div');
  num.className = 'floating-delta ' + (esInversion ? 'inversion' : (bueno?'good':'bad'));
  num.textContent = (esInversion ? '↗ ' : '') + fmtDelta(delta, kind);
  card.appendChild(num);
  setTimeout(()=>{ if(num.parentNode) num.parentNode.removeChild(num); }, 2500);
}
const META_ETIQUETAS = {
  caja:'Caja', ebitda:'EBITDA', deuda:'Endeudamiento', wacc:'WACC', razonCorriente:'Razón corriente',
  capitalTrabajo:'Capital de trabajo', diasInventario:'Días de inventario', diasCartera:'Días de cartera',
  valorInventario:'Valor de inventario', confianzaProveedores:'Confianza de proveedores',
  confianzaBanco:'Confianza bancaria', reputacion:'Reputación', moralEquipo:'Moral del equipo'
};
const META_DELTAS = {
  caja:5, ebitda:3, deuda:-5, wacc:-1, razonCorriente:0.3, capitalTrabajo:5,
  diasInventario:-8, diasCartera:-8, valorInventario:2,
  confianzaProveedores:8, confianzaBanco:8, reputacion:8, moralEquipo:8
};
const META_INVERTIDOS = ['deuda','wacc','diasInventario','diasCartera'];
// Rangos reales de cada indicador (los mismos límites que ya aplica applyEfectos) — sin esto,
// una meta podía pedir cosas imposibles, como "días de inventario en -2".
const META_RANGOS = {
  razonCorriente:[0,5], wacc:[5,35], deuda:[0,Infinity],
  diasInventario:[0,Infinity], diasCartera:[0,Infinity], valorInventario:[0,Infinity],
  confianzaProveedores:[0,100], confianzaBanco:[0,100], reputacion:[0,100], moralEquipo:[0,100],
  capitalTrabajo:[-Infinity,Infinity], caja:[-Infinity,Infinity], ebitda:[-Infinity,Infinity]
};
function generarNuevaMeta(){
  if(!state) return;
  let indicador = indicadorPrioritario();
  if(!indicador){
    // todo sano: una meta de crecimiento por defecto, no de rescate
    indicador = Math.random()<0.5 ? 'ebitda' : 'reputacion';
  }
  const valorInicial = state[indicador];
  if(valorInicial==null) return;
  const [minReal, maxReal] = META_RANGOS[indicador] || [-Infinity, Infinity];
  const bruto = clamp(valorInicial + (META_DELTAS[indicador]||1), minReal, maxReal);
  // Los objetivos de la junta siempre se fijan en números enteros, sin decimales —
  // nadie exige "$3.256.842" de EBITDA, exige "$3.000.000" o "3 puntos de reputación".
  const decimales = (indicador==='razonCorriente') ? 1 : 0;
  const factor = Math.pow(10, decimales);
  metaTrimestral = {
    indicador, valorInicial: Math.round(valorInicial*factor)/factor,
    valorObjetivo: Math.round(bruto*factor)/factor,
    turnoInicio: turnNumber, turnoLimite: turnNumber + 5
  };
}
function metaCumplida(meta){
  const actual = state[meta.indicador];
  if(actual==null) return true;
  const invertido = META_INVERTIDOS.includes(meta.indicador);
  return invertido ? actual <= meta.valorObjetivo : actual >= meta.valorObjetivo;
}
// Formatea cualquier valor de meta como número entero (salvo razón corriente, que se
// muestra con 1 decimal por ser un ratio) — cubre también reputación, moral y confianza,
// que KPI_DEFS no incluye porque se muestran con su propio sistema de chips.
function fmtMetaValor(indicador, valor){
  if(valor==null) return '—';
  if(indicador==='razonCorriente') return valor.toFixed(1);
  const kd = KPI_DEFS.find(d=>d.key===indicador);
  if(kd && (kd.kind==='money' || kd.kind==='dias')) return kd.fmt(Math.round(valor));
  return Math.round(valor).toString();
}
function renderMetaJuntaLine(){
  const el = document.getElementById('metaJuntaLine');
  if(!el) return;
  if(!metaTrimestral){ el.classList.remove('show'); return; }
  el.textContent = `Meta de la junta: ${META_ETIQUETAS[metaTrimestral.indicador]||metaTrimestral.indicador} hacia ${fmtMetaValor(metaTrimestral.indicador, metaTrimestral.valorObjetivo)} para el turno ${metaTrimestral.turnoLimite}`;
  el.classList.add('show');
}

function caseTocaIndicador(build, indicador){
  try{
    const c = build(state, flags);
    if(!c || !Array.isArray(c.choices)) return false;
    return c.choices.some(ch=>ch.efectos && ch.efectos[indicador]!=null && Math.abs(ch.efectos[indicador])>0);
  } catch(e){ return false; }
}
// En vez de sacar del bag de forma puramente aleatoria, si hay un indicador en alerta
// intenta primero encontrar un caso que realmente lo toque — sin perder la variedad
// cuando no hay ninguna alerta activa.
function elegirDeBagPriorizado(bag){
  const indicador = indicadorPrioritario();
  if(indicador){
    // solo una coincidencia que no se haya mostrado hace poco — si la unica opcion
    // disponible ya salio recientemente, mejor no forzarla que repetirla sin parar
    const idx = bag.findIndex(build=>{
      if(!caseTocaIndicador(build, indicador)) return false;
      try{ return !historialTitulosRecientes.includes(build(state, flags).titulo); }catch(e){ return true; }
    });
    if(idx !== -1){
      const [elegido] = bag.splice(idx, 1);
      return elegido;
    }
  }
  return bag.pop();
}
// Busca, de forma robusta, un caso que toque el indicador dado — recarga la bolsa
// completa si hace falta, en vez de rendirse solo porque el sorteo previo ya la vació
// o no le tocó un caso relevante por casualidad.
// Se recuerdan los últimos títulos mostrados para evitar que la búsqueda por indicador
// termine repitiendo el mismo caso varias veces seguidas cuando solo hay una opción
// disponible para ese indicador en el sector — mejor no forzar nada esta vez que repetir.
let historialTitulosRecientes = [];
function registrarTituloReciente(titulo){
  if(!titulo) return;
  historialTitulosRecientes.push(titulo);
  if(historialTitulosRecientes.length > 4) historialTitulosRecientes.shift();
}
function buscarCasoParaIndicador(indicador){
  // solo una coincidencia que no se haya mostrado hace poco — si la unica opcion
  // disponible ya salio recientemente, mejor devolver null (y que el juego siga su
  // curso normal) que forzar la misma historia otra vez.
  const buscarNoReciente = ()=> randomBag.findIndex(build=>{
    if(!caseTocaIndicador(build, indicador)) return false;
    try{ return !historialTitulosRecientes.includes(build(state, flags).titulo); }catch(e){ return true; }
  });
  if(randomBag.length===0) randomBag = shuffle(sectorActual.random.concat(poolUniversalParaCategoria(sectorActual.categoria)));
  let idx = buscarNoReciente();
  if(idx === -1){
    randomBag = shuffle(sectorActual.random.concat(poolUniversalParaCategoria(sectorActual.categoria)));
    idx = buscarNoReciente();
  }
  if(idx === -1) return null;
  const [build] = randomBag.splice(idx, 1);
  return build(state, flags);
}
// Decisión adicional dentro del mismo turno: si tras resolver una decisión la empresa
// SIGUE con algún indicador en zona crítica, ofrece una decisión más — enfocada en
// ese indicador — antes de avanzar de turno. Máximo una por turno real, para no romper
// la cadencia de la Junta, el elenco y las cadenas, todas ancladas a turnNumber.
function elegirDecisionExtra(){
  const alertas = indicadoresEnAlerta().filter(a=>a.nivel==='critico');
  if(!alertas.length) return null;
  const indicador = alertas[Math.floor(Math.random()*alertas.length)].key;
  const caso = buscarCasoParaIndicador(indicador);
  if(!caso) return null;
  caso.esDecisionExtra = true;
  return caso;
}
