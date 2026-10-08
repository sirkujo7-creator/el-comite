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

