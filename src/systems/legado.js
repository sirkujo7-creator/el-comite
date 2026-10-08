/* =========================================================================================
   LEGADO EMPRESARIAL — estilo Reigns: la misma empresa continúa entre partidas, generación
   tras generación, hasta que finalmente quiebra (cualquiera de los 8 finales de derrota que
   ya existen). Sobrevivir el año fiscal completo no reinicia la empresa desde cero — hereda
   una versión atenuada de cómo la dejaste, decayendo hacia el punto de partida del sector en
   vez de copiarse exacta, para que la herencia sea un eco real, no una ventaja mecánica.
   ========================================================================================= */
let legadoActivo = null;
function actualizarLegadoEmpresarial(ending){
  const id = sectorActual.id;
  if(ending.tipoFinal === 'cierre'){
    const previo = legadosEmpresariales[id];
    const generacionNueva = (previo && !previo.quebrada) ? (previo.generacion||1) + 1 : 1;
    const snapshot = {};
    const camposHeredables = ['caja','ebitda','deuda','wacc','razonCorriente','capitalTrabajo','reputacion','moralEquipo','confianzaProveedores','confianzaBanco','diasCartera'];
    if(sectorActual.tieneInventario){ camposHeredables.push('diasInventario','valorInventario'); }
    camposHeredables.forEach(k=>{
      if(state[k]==null) return;
      const base = sectorActual.kpiInicial[k];
      if(base==null){ snapshot[k] = state[k]; return; }
      snapshot[k] = base + (state[k]-base)*0.45; // decae hacia el punto de partida del sector
    });
    legadosEmpresariales[id] = {
      generacion: generacionNueva, quebrada: false,
      nombreEmpresa: nombreEmpresaJugador || '', ultimoRango: ending.rango,
      estadoHeredado: snapshot
    };
  } else if(ending.tipoFinal === 'derrota'){
    legadosEmpresariales[id] = {
      generacion: (legadosEmpresariales[id]&&legadosEmpresariales[id].generacion)||1, quebrada: true,
      nombreEmpresa: nombreEmpresaJugador || '', ultimoBadge: ending.badge,
      estadoHeredado: null
    };
  }
}
// Para el guiño a otras empresas jugadas antes: sectores con legado activo (no quebrado,
// generación 2 o más) distintos al que estás jugando ahora.
function legadosActivosDeOtrosSectores(idActual){
  return Object.keys(legadosEmpresariales)
    .filter(id=>id!==idActual)
    .map(id=>({id, ...legadosEmpresariales[id]}))
    .filter(l=>!l.quebrada && l.generacion>=2);
}

