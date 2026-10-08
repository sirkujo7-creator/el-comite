/* =========================================================
   RENDER: PANTALLA FINAL (derrota o cierre de año fiscal)
   ========================================================= */
/* =========================================================
   TÍTULO GERENCIAL — condiciones simples sobre los indicadores finales
   ========================================================= */
function tituloGerencial(){
  const s = state;
  if(s.deuda >= 40 && s.caja > 0){
    return {titulo:"Maestro del Apalancamiento",
      parrafo:"Sobreviviste cargando un nivel de deuda que hubiera hundido a otro. Financiaste el crecimiento a punta de apalancamiento — funcionó, pero tu margen de error fue mínimo en cada turno que quedó por delante."};
  }
  if(s.confianzaProveedores <= 25 && s.caja >= 15){
    return {titulo:"Sobreviviente Despiadado",
      parrafo:"Salvaste tu caja a costa de casi todas tus relaciones comerciales. Tus proveedores ya no confían en ti, pero tu balance sigue en pie — la pregunta que queda abierta es cuánto tiempo más puede sostenerse una operación así."};
  }
  if(s.reputacion <= 30 && s.ebitda >= 10){
    return {titulo:"El Cínico Rentable",
      parrafo:"Tus números son buenos. Tu reputación, no. Priorizaste el resultado financiero por encima de casi todo lo demás — y aunque el balance no lo refleje, esa cuenta también se paga, tarde o temprano."};
  }
  if(s.moralEquipo!=null && s.moralEquipo <= 30 && s.ebitda >= 8){
    return {titulo:"El Exprimidor",
      parrafo:"Sacaste rentabilidad de tu equipo hasta el límite. El EBITDA lo agradece; la moral del equipo, no — y ese tipo de deuda no aparece en ningún balance hasta que ya es demasiado tarde para pagarla."};
  }
  if(s.razonCorriente >= 1.8 && s.ebitda < 8){
    return {titulo:"El Guardián Conservador",
      parrafo:"Nunca te faltó liquidez. Tampoco sobró crecimiento. Jugaste con el freno de mano puesto todo el año fiscal — a salvo, pero sin acelerar nunca del todo."};
  }
  if(s.wacc <= 11 && s.confianzaBanco >= 65 && s.confianzaProveedores >= 65){
    return {titulo:"El Diplomático Financiero",
      parrafo:"Construiste confianza en todos los frentes — banco, proveedores, junta — y el mercado te lo devolvió en forma de capital barato. Pocas gestiones se ven tan bien relacionadas al cierre."};
  }
  if(s.ebitda >= 20 && s.reputacion >= 60 && s.deuda <= 25){
    return {titulo:"El Estratega Equilibrado",
      parrafo:"Creciste sin quemar relaciones ni sobreapalancarte. No fue la gestión más audaz de todas, pero probablemente sea la más replicable — y en administración financiera, eso vale más de lo que parece."};
  }
  if(s.caja <= 0){
    return {titulo:"El Apostador Fallido",
      parrafo:"La apuesta no salió. En algún punto del camino el flujo de caja dejó de sostener las decisiones que fuiste tomando, y el mercado no dio segundas oportunidades."};
  }
  return {titulo:"El Administrador en Construcción",
    parrafo:"Tu gestión no encajó en un patrón extremo — ni el más audaz, ni el más conservador. Es terreno fértil para la próxima partida: ahora ya sabes qué palancas mueve cada indicador."};
}

