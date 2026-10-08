/* =========================================================
   FORMATO Y COLOR
   ========================================================= */
function fmtMoney(v){
  const cop = Math.round(v*1000000);
  const sign = cop < 0 ? "-" : "";
  return sign + "$" + Math.abs(cop).toLocaleString('es-CO');
}
function fmtDelta(v, kind){
  const sign = v>0 ? "+" : "";
  if(kind==='money') return sign+fmtMoney(v);
  if(kind==='dias') return sign+Math.round(v)+"d";
  if(kind==='pct') return sign+v.toFixed(1)+"%";
  return sign+(Number.isInteger(v)?v:v.toFixed(1));
}
function colorFor(key, v){
  // Umbrales propios del sector (solo por arriba): p. ej. Ganadería, donde pocos días de inventario es lo sano.
  const u = sectorActual && sectorActual.umbrales && sectorActual.umbrales[key];
  if(u) return v>=u.peligro ? 'danger' : v>=u.alerta ? 'gold' : 'teal';
  const t = {
    caja: v<=5?'danger':v<=15?'gold':'teal',
    capitalTrabajo: v<0?'danger':v<10?'gold':'teal',
    razonCorriente: v<1?'danger':v<1.3?'gold':'teal',
    deuda: v>=45?'danger':v>=25?'gold':'teal',
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

