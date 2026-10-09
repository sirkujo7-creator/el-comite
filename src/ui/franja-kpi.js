// Franja de indicadores dentro de la ventana de decisión: el jugador ve su situación mientras
// decide. Al pasar el cursor (o el foco) por una opción se iluminan los indicadores que esa
// opción toca, sin decir cuánto ni hacia dónde (como en Reigns): un punto grande si el efecto
// es fuerte y uno pequeño si es leve. La deuda diferida marca la caja con borde punteado.
const FRANJA_KPI = [
  {key:'caja', corto:'Caja'}, {key:'capitalTrabajo', corto:'Cap. trabajo'},
  {key:'razonCorriente', corto:'Razón cte.'}, {key:'deuda', corto:'Deuda'},
  {key:'wacc', corto:'WACC'}, {key:'ebitda', corto:'EBITDA'},
  {key:'diasCartera', corto:'Cartera'}, {key:'diasInventario', corto:'Días inv.'},
  {key:'valorInventario', corto:'Valor inv.'},
  {key:'confianzaProveedores', corto:'Proveedores', rel:true}, {key:'confianzaBanco', corto:'Banco', rel:true},
  {key:'reputacion', corto:'Junta', rel:true}, {key:'moralEquipo', corto:'Moral', rel:true},
];
// A partir de este tamaño (en las unidades de cada indicador) el efecto se marca como fuerte.
const FRANJA_UMBRAL_FUERTE = { caja:8, capitalTrabajo:6, razonCorriente:0.15, deuda:6, wacc:1.5, ebitda:2.5,
  diasCartera:20, diasInventario:10, valorInventario:5, confianzaProveedores:8, confianzaBanco:8, reputacion:8, moralEquipo:8 };

function fmtFranja(d, v){
  if(d.rel) return Math.round(v) + '/100';
  if(['caja','capitalTrabajo','deuda','ebitda','valorInventario'].includes(d.key)){
    return (v < 0 ? '-' : '') + '$' + Math.abs(v).toFixed(1).replace('.', ',') + ' M';
  }
  if(d.key === 'razonCorriente') return v.toFixed(2);
  if(d.key === 'wacc') return v.toFixed(1) + '%';
  return Math.round(v) + ' d';
}

function mostrarFranjaKpi(){
  const el = document.getElementById('franjaKpi');
  if(!el) return;
  const visibles = FRANJA_KPI.filter(d=>{
    if(state[d.key] == null) return false;
    if((d.key==='diasInventario' || d.key==='valorInventario') && !sectorActual.tieneInventario) return false;
    return true;
  });
  el.innerHTML = visibles.map(d=>{
    const v = state[d.key];
    const color = d.rel ? ('tier-' + statusPill(v).tier) : ('c-' + colorFor(d.key, v));
    return `<div class="franja-item ${color}" data-franja="${d.key}">
      <span class="franja-label">${d.corto}</span><span class="franja-valor">${fmtFranja(d, v)}</span>
    </div>`;
  }).join('');
  el.classList.add('show');
}
function ocultarFranjaKpi(){
  const el = document.getElementById('franjaKpi');
  if(el){ el.classList.remove('show'); el.innerHTML = ''; }
}

function pistaDeOpcion(ch){
  limpiarPistaKpi();
  const efectos = ch.efectos || {};
  Object.keys(efectos).forEach(k=>{
    const v = efectos[k];
    if(typeof v !== 'number' || !v) return;
    const item = document.querySelector('.franja-item[data-franja="'+k+'"]');
    if(!item) return;
    item.classList.add('toca', Math.abs(v) >= (FRANJA_UMBRAL_FUERTE[k] || Infinity) ? 'fuerte' : 'leve');
  });
  if(ch.diferir){
    const caja = document.querySelector('.franja-item[data-franja="caja"]');
    if(caja) caja.classList.add('diferido');
  }
}
function limpiarPistaKpi(){
  document.querySelectorAll('.franja-item').forEach(item=>item.classList.remove('toca','fuerte','leve','diferido'));
}
