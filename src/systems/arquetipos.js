/* =========================================================================================
   ARQUETIPOS DE VICTORIA — una capa narrativa adicional sobre el rango S/A/B/C, que reconoce
   que "ganar bien" puede verse muy distinto según cómo jugaste, no solo cuánto acumulaste.
   ========================================================================================= */
function detectarArquetipo(){
  if(!state || !state.healthHistory || state.healthHistory.length < 6) return null;
  const scores = state.healthHistory.map(h=>h.score);
  const patron = detectarPatronGenerosidad();
  const scoreFinal = healthScore(state);

  // Los arquetipos mas especificos (una combinacion deliberada de indicadores) van primero;
  // "nunca estuvo en riesgo" es la historia menos distintiva, así que queda de última opción.
  if(state.reputacion!=null && state.reputacion>=70 && state.moralEquipo!=null && state.moralEquipo>=70 && patron.generosas>=4){
    return {nombre:'El Legado', desc:'Construiste una gestión centrada en tu gente, no solo en los números — y terminaste con la confianza y la moral para probarlo.'};
  }
  if(state.ebitda>=15 && state.caja>=40){
    return {nombre:'El Imperio', desc:'Construiste algo grande — EBITDA y caja muy por encima de lo normal. El crecimiento fue el centro de tu gestión, cueste lo que cueste.'};
  }
  const tuvoMomentoCritico = scores.some(s => s <= 30);
  if(tuvoMomentoCritico && scoreFinal >= 45){
    return {nombre:'El Fénix', desc:'Tu empresa estuvo al borde real del colapso en algún momento de la partida — y no solo sobrevivió: terminó sana. Pocas gestiones se recuperan así.'};
  }
  const nuncaCritico = scores.every(s => s > 40);
  if(nuncaCritico){
    return {nombre:'El Equilibrista', desc:'En ningún momento de la partida tu empresa estuvo genuinamente en riesgo — mantuviste el control de principio a fin, sin sobresaltos ni decisiones desesperadas.'};
  }
  return null;
}

function cierreAnioFiscal(){
  const val = Math.round((state.ebitda*4 - state.deuda)*10)/10;
  const ini = sectorActual.kpiInicial;
  const valInicial = Math.round((ini.ebitda*4 - ini.deuda)*10)/10;
  const ratio = valInicial !== 0 ? val/valInicial : (val>0?2:0);
  let rango, badge, desc, color;
  if(ratio>=2.5 && state.wacc<=15 && state.reputacion>=50){
    rango='S'; badge='CFO de Élite'; color='pos';
    desc="Multiplicaste el valor de la empresa manteniendo el riesgo bajo control y la confianza de tus grupos de interés intacta. Es exactamente lo que un comité de alta gerencia espera ver: crecimiento real, no maquillado y no apalancado a cualquier costo.";
  } else if(ratio>=1.3){
    rango='A'; badge='Crecimiento sólido'; color='pos';
    desc="Cierras el año fiscal con la empresa valiendo notablemente más de lo que valía al empezar. Tu gestión combinó crecimiento con un manejo razonable del riesgo.";
  } else if(ratio>=0.7){
    rango='B'; badge='Resultado mixto'; color='neu';
    desc="Sobreviviste el año fiscal completo sin destruir ni crear demasiado valor. Algunas decisiones fueron sólidas, otras reactivas — el balance final quedó prácticamente donde empezó.";
  } else {
    rango='C'; badge='Valor destruido'; color='neu';
    desc="Sobreviviste los 20 turnos sin quebrar, pero la empresa vale menos de lo que valía al empezar el año fiscal. Sobrevivir no es lo mismo que gerenciar bien.";
  }

  let esFinalOculto = false;
  const patron = detectarPatronGenerosidad();
  if(patron.generosas >= 7 && patron.mercantiles <= 1){
    esFinalOculto = true;
    badge = 'El Que Nunca Fue Solo de Números';
    desc = "El Comité no tiene una casilla en ningún reporte para medir esto, pero alguien lo notó: turno tras turno, cuando tuviste que elegir entre proteger el balance o proteger a tu gente, casi siempre elegiste a tu gente. No fue la gestión más eficiente en papel. Pero es la que la gente que trabajó contigo recordará.";
  }

  const arquetipo = esFinalOculto ? null : detectarArquetipo();
  const mandatoResultado = mandatoInicial ? {titulo: mandatoInicial.titulo, cumplido: mandatoInicial.cumplido()} : null;
  const logros = detectarLogros();

  return {tipoFinal:'cierre', rango, badge, color, desc, valuacion:val, valuacionInicial:valInicial, esFinalOculto, arquetipo, mandatoResultado, logros};
}

