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
