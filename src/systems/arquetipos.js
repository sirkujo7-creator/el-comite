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

// Cómo se lee cada rango (decisión de Juan, nov. 2026): S y A se ganan, B es regular, C y D son un desastre.
const VEREDICTO_RANGO = { S:'victoria', A:'victoria', B:'regular', C:'desastre', D:'desastre' };
const VEREDICTO_TEXTO = { victoria:'Victoria', regular:'Resultado regular', desastre:'Desastre' };
// Valor de la empresa (regla 3, nov. 2026, aprobada por Juan): EBITDA por un múltiplo que baja
// cuando sube el costo de capital (55 / WACC, entre 2,5 y 6), menos la deuda, más media caja.
// Sin liquidez (razón corriente < 1) la empresa vale un 15 % menos. Antes era EBITDA × 4 − deuda:
// crecer a cualquier costo siempre pagaba.
function valorEmpresa(k){
  const multiplo = Math.max(2.5, Math.min(6, 55 / Math.max(1, k.wacc)));
  let v = k.ebitda * multiplo - k.deuda + 0.5 * k.caja;
  if(k.razonCorriente < 1) v *= v > 0 ? 0.85 : 1.15;
  return Math.round(v * 10) / 10;
}
// Lo que la junta exige para llamar victoria a un crecimiento: una empresa sana al cierre.
// Devuelve las condiciones que faltan (vacío = sana).
function condicionesFaltantesCierre(waccInicial){
  const faltan = [];
  if(state.razonCorriente < 1.1) faltan.push(`la razón corriente quedó en ${fmtNum(state.razonCorriente, 2)} (mínimo 1,1)`);
  if(state.wacc > waccInicial + 2) faltan.push(`tu WACC subió ${fmtNum(state.wacc - waccInicial, 1)} puntos (máximo 2)`);
  if(state.deuda > Math.max(3, state.ebitda) * 3) faltan.push(`la deuda es ${state.ebitda > 0 ? fmtNum(state.deuda / state.ebitda, 1) + ' veces' : 'mayor que'} el EBITDA (máximo 3 veces)`);
  [['confianzaBanco','la confianza del banco'],['confianzaProveedores','la confianza de los proveedores'],
   ['reputacion','el respaldo de la junta'],['moralEquipo','la moral del equipo']].forEach(([k, n])=>{
    if(state[k] != null && state[k] < 40) faltan.push(`${n} quedó en ${Math.round(state[k])} (mínimo 40)`);
  });
  return faltan;
}
function fmtNum(v, dec){ return (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toString().replace('.', ','); }
function cierreAnioFiscal(){
  const ini = sectorActual.kpiInicial;
  const val = valorEmpresa(state);
  const valInicial = valorEmpresa(ini);
  const ratio = valInicial > 0 ? val/valInicial : (val>0?2:0);
  const waccInicial = (state.puntoInicial && state.puntoInicial.wacc != null) ? state.puntoInicial.wacc : ini.wacc;
  const faltan = condicionesFaltantesCierre(waccInicial);
  const sana = faltan.length === 0;
  let rango, badge, desc, color;
  if(ratio>=2.5 && sana && state.wacc<=15 && state.reputacion>=50){
    rango='S'; badge='CFO de Élite'; color='pos';
    desc="Multiplicaste el valor de la empresa manteniendo el riesgo bajo control y la confianza de tus grupos de interés intacta. Es exactamente lo que un comité de alta gerencia espera ver: crecimiento real, no maquillado y no apalancado a cualquier costo.";
  } else if(ratio>=1.3 && sana){
    rango='A'; badge='Crecimiento sólido'; color='pos';
    desc="Cierras el año fiscal con la empresa valiendo notablemente más de lo que valía al empezar, y sana: liquidez, costo de capital, deuda y relaciones en orden. Tu gestión combinó crecimiento con un manejo razonable del riesgo.";
  } else if(ratio>=1.3){
    rango='B'; badge='Crecimiento frágil'; color='neu';
    desc=`La empresa vale más que al empezar, pero la junta no lo considera una victoria: ${faltan.join('; ')}. Crecer dejando la empresa expuesta no es lo mismo que hacerla más valiosa.`;
  } else if(ratio>=0.7){
    rango='B'; badge='Resultado mixto'; color='neu';
    desc="Sobreviviste el año fiscal completo sin destruir ni crear demasiado valor. Algunas decisiones fueron sólidas, otras reactivas — el balance final quedó prácticamente donde empezó.";
  } else if(ratio>=0.4){
    rango='C'; badge='Valor destruido'; color='neg';
    desc="Sobreviviste los 20 turnos sin quebrar, pero la empresa vale menos de lo que valía al empezar el año fiscal. Sobrevivir no es lo mismo que gerenciar bien.";
  } else {
    rango='D'; badge='Empresa en ruinas'; color='neg';
    desc="La empresa sigue abierta, pero vale menos de la mitad de lo que valía al empezar: el EBITDA ya no sostiene la deuda. Técnicamente no quebraste; en la práctica, la junta ya está buscando a tu reemplazo.";
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

  return {tipoFinal:'cierre', rango, badge, color, desc, valuacion:val, valuacionInicial:valInicial, condicionesFaltantes:faltan, esFinalOculto, arquetipo, mandatoResultado, logros};
}

