/* =========================================================
   PRIORIZACIÓN POR INDICADOR EN ALERTA — reutiliza exactamente los mismos
   umbrales de color que ya usa el panel (colorFor / statusPill) para saber
   qué indicador necesita atención urgente, y sesga la selección de casos
   hacia decisiones que realmente lo toquen — en vez de casos aislados sin
   relación con lo que la empresa necesita en ese momento.
   ========================================================= */
function indicadoresEnAlerta(){
  const alerta = [];
  const camposEscala = ['caja','capitalTrabajo','razonCorriente','deuda','ebitda','wacc'];
  if(sectorActual && sectorActual.tieneInventario){ camposEscala.push('diasInventario','valorInventario'); }
  camposEscala.push('diasCartera');
  camposEscala.forEach(k=>{
    if(state[k]==null) return;
    const c = colorFor(k, state[k]);
    if(c==='danger') alerta.push({key:k, nivel:'critico'});
    else if(c==='gold') alerta.push({key:k, nivel:'riesgo'});
  });
  const camposRelacionales = ['confianzaProveedores','confianzaBanco','reputacion'];
  if(state.moralEquipo!=null) camposRelacionales.push('moralEquipo');
  camposRelacionales.forEach(k=>{
    const v = state[k];
    if(v==null) return;
    const tier = statusPill(v).tier;
    if(tier==='critico') alerta.push({key:k, nivel:'critico'});
    else if(tier==='riesgo') alerta.push({key:k, nivel:'riesgo'});
  });
  return alerta;
}
function indicadorPrioritario(){
  const alertas = indicadoresEnAlerta();
  if(!alertas.length) return null;
  const criticos = alertas.filter(a=>a.nivel==='critico');
  const pool = criticos.length ? criticos : alertas;
  return pool[Math.floor(Math.random()*pool.length)].key;
}

