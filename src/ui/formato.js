/* =========================================================
   FORMATO Y COLOR
   ========================================================= */
function fmtMoney(v){
  const cop = Math.round(v*1000000);
  const sign = cop < 0 ? "-" : "";
  return sign + "$" + Math.abs(cop).toLocaleString('es-CO');
}
// Pesos completos para espacios estrechos: los millones a tamaño normal y el resto atenuado
// ($54<span>.012.800</span>), para leer la cifra exacta sin perder la lectura rápida.
function fmtMoneyHTML(v){
  const txt = fmtMoney(v);
  const cop = Math.abs(Math.round(v*1000000));
  if(cop < 1000000) return txt;
  const i = txt.indexOf('.');
  return txt.slice(0, i) + '<span class="cifra-resto">' + txt.slice(i) + '</span>';
}
function fmtDelta(v, kind){
  const sign = v>0 ? "+" : "";
  if(kind==='money') return sign+fmtMoney(v);
  if(kind==='dias') return sign+Math.round(v)+"d";
  if(kind==='pct') return sign+v.toFixed(1)+"%";
  if(kind==='ratio') return sign+v.toFixed(2);
  return sign+(Number.isInteger(v)?v:v.toFixed(1));
}
// "Lo sano" de cada indicador: el rango que colorFor pinta en verde. Un cambio es sano si
// acerca el indicador a ese rango, o lo mueve en la dirección favorable sin sacarlo de él.
// Se usa SOLO para lo visual (flechas, números de cambio, destellos, fichas); el motor
// operativo conserva su propia lógica (esMejorSiSube).
const RANGOS_SANOS = {
  caja:{min:15}, capitalTrabajo:{min:10}, razonCorriente:{min:1.3}, deuda:{max:25},
  ebitda:{min:8}, wacc:{max:14}, diasInventario:{min:25, max:55}, diasCartera:{max:60},
  // Valor de inventario: hasta 25 es un activo sano (perderlo por robo, plaga o vencimiento es
  // malo); desde 25 es capital atrapado y bajarlo es lo sano. Por eso el "objetivo" es 25.
  valorInventario:{min:25, max:25},
  confianzaProveedores:{min:70}, confianzaBanco:{min:70}, reputacion:{min:70}, moralEquipo:{min:70}
};
// Umbrales de días de inventario y de cartera: cada empresa tiene su ciclo (nov. 2026, aprobado por
// Juan: "no todo debe estar estandarizado"). sanoMin–sanoMax = lo normal del negocio; peligro = alarma,
// rojo y castigo del motor; derrota = la partida se pierde por inventario obsoleto.
const UMBRALES_BASE = {
  diasInventario:{ sanoMin:25, sanoMax:55, peligro:75, derrota:110 },
  diasCartera:{ sanoMax:60, peligro:90 }
};
function umbralSector(key){
  const base = UMBRALES_BASE[key];
  const u = (typeof sectorActual !== 'undefined' && sectorActual && sectorActual.umbrales && sectorActual.umbrales[key]) || null;
  if(!base && !u) return null;
  return Object.assign({}, base, u, u && u.sanoMin === undefined && base && u.sanoMax !== undefined ? {sanoMin:undefined} : {});
}
// Deuda medida en veces el EBITDA (nov. 2026, Juan: "realista y sin incoherencias"): $25 M es poco
// para una constructora y mucho para una startup. Una sola escala para todo el juego:
//   sano ≤ 3×  (también la condición de empresa sana del cierre, systems/arquetipos.js)
//   alto ≥ 4×  (el crédito sale más caro, el banco llama, el motor sube el WACC)
//   crítico ≥ 5,5× (rojo en el tablero, alarma, segundo castigo del motor)
//   quiebra ≥ 7× con WACC ≥ 20 (sobreendeudamiento, engine/finales.js)
// Con EBITDA cero o negativo, cualquier deuda cuenta como altísima.
const DEUDA_VECES_BASE = { sano:3, alto:4, critico:5.5, quiebra:7 };
// Cada empresa tolera distinto: una constructora vive de créditos de obra; una tienda, no.
// SECTORS[].umbrales.deudaVeces sobrescribe la escala base (mismo criterio que inventario y cartera).
function escalaDeuda(){
  const u = (typeof sectorActual !== 'undefined' && sectorActual && sectorActual.umbrales && sectorActual.umbrales.deudaVeces) || null;
  return Object.assign({}, DEUDA_VECES_BASE, u);
}
function multiploDeuda(deuda, ebitda){
  if(deuda == null || deuda <= 0) return 0;
  return ebitda != null && ebitda > 0.5 ? deuda / ebitda : 99;
}
function deudaEnVeces(s){ s = s || (typeof state !== 'undefined' ? state : null); return s ? multiploDeuda(s.deuda, s.ebitda) : 0; }
function rangoSano(key){
  if(key === 'deuda' && typeof state !== 'undefined' && state && state.ebitda != null) return {max: escalaDeuda().sano * Math.max(state.ebitda, 0.5)};
  const u = umbralSector(key);
  if(u) return {min:u.sanoMin, max:u.sanoMax};
  return RANGOS_SANOS[key] || {min:-Infinity};
}
// ¿Pasar de `antes` a `despues` acerca el indicador a lo sano?
function cambioEsSano(key, antes, despues){
  if(antes==null || despues==null || antes===despues) return true;
  const r = rangoSano(key);
  const tieneMin = r.min!=null, tieneMax = r.max!=null;
  if(tieneMin && tieneMax){
    const dentro = v => v>=r.min && v<=r.max;
    if(dentro(antes)) return dentro(despues);
    const distancia = v => v<r.min ? r.min-v : v>r.max ? v-r.max : 0;
    return distancia(despues) < distancia(antes);
  }
  return tieneMin ? despues > antes : despues < antes;
}
// Variante para un efecto ya aplicado: el valor actual es el "después".
function deltaEsSano(key, delta){
  if(!delta || !state || state[key]==null) return delta ? (delta>0) === esMejorSiSube(key) : true;
  return cambioEsSano(key, state[key]-delta, state[key]);
}

function colorFor(key, v){
  // Umbrales propios del sector (solo por arriba): p. ej. Ganadería, donde pocos días de inventario es lo sano.
  const u = (key === 'diasInventario' || key === 'diasCartera') ? umbralSector(key) : null;
  if(u){
    if(v >= u.peligro || (u.sanoMin != null && v < u.sanoMin * 0.6)) return 'danger';
    if(v > u.sanoMax || (u.sanoMin != null && v < u.sanoMin)) return 'gold';
    return 'teal';
  }
  const t = {
    caja: v<=5?'danger':v<=15?'gold':'teal',
    capitalTrabajo: v<0?'danger':v<10?'gold':'teal',
    razonCorriente: v<1?'danger':v<1.3?'gold':'teal',
    deuda: (()=>{ const m = multiploDeuda(v, (typeof state !== 'undefined' && state) ? state.ebitda : 8); return m>=escalaDeuda().critico?'danger':m>escalaDeuda().sano?'gold':'teal'; })(),
    ebitda: v<=0?'danger':v<8?'gold':'teal',
    wacc: v>=18?'danger':v>=14?'gold':'teal',
    diasInventario: (v>65||v<15)?'danger':(v>55||v<25)?'gold':'teal',
    diasCartera: v>=90?'danger':v>=60?'gold':'teal',
    valorInventario: v>=45?'danger':v>=25?'gold':'teal',
    cce: v>=90?'danger':v>=45?'gold':'teal'
  };
  return t[key] || 'ink';
}
function calcularCCE(){
  const dpo = 20 + (state.confianzaProveedores/100)*30;
  const inv = state.diasInventario!=null ? state.diasInventario : 0;
  const cart = state.diasCartera!=null ? state.diasCartera : 0;
  return inv + cart - dpo;
}
function statusPill(v){
  if(v>=70) return {label:'ÓPTIMO', tier:'optimo'};
  if(v>=45) return {label:'ESTABLE', tier:'estable'};
  if(v>=25) return {label:'EN RIESGO', tier:'riesgo'};
  return {label:'CRÍTICO', tier:'critico'};
}

