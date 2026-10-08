/* =========================================================
   FINALES: DERROTA / CIERRE DE AÑO FISCAL (RANGO)
   ========================================================= */
function checkForcedEndingInterno(){
  if(state.caja <= 0) return {tipoFinal:'derrota', badge:"Quiebra técnica", color:'neg',
    desc:`Tu caja llegó a ${fmtMoney(state.caja)} sin poder cubrir tus obligaciones. El banco toma el control: no puedes pagar la nómina ni conseguir prestado. La liquidez siempre es la primera restricción — tener razón sobre el largo plazo no sirve si no sobrevives al corto plazo.`};
  if(state.razonCorriente < 0.8) return {tipoFinal:'derrota', badge:"Crisis de liquidez", color:'neg',
    desc:`Tu razón corriente cayó a ${state.razonCorriente.toFixed(2)}: tus obligaciones de corto plazo superan por mucho tus activos líquidos. Sigues operando, pero ya no puedes cubrir tus compromisos inmediatos sin vender activos o pedir auxilio.`};
  if(state.confianzaProveedores <= 10) return {tipoFinal:'derrota', badge:"Parálisis de la cadena de suministro", color:'neg',
    desc:"Tus proveedores dejaron de despacharte casi por completo. Sin insumos que vender o transformar, la operación se detiene sin importar cuánta caja tengas."};
  if(state.confianzaBanco <= 10) return {tipoFinal:'derrota', badge:"Corte total de crédito", color:'neg',
    desc:"El banco cierra por completo tu acceso a cualquier línea de crédito o refinanciación. Sin margen de maniobra financiera, cualquier imprevisto que llegue ahora ya no tiene con qué cubrirse."};
  if(state.reputacion <= 15) return {tipoFinal:'derrota', badge:"Destitución por la junta", color:'neg',
    desc:"Tu caja puede estar en verde, pero tomaste decisiones tan despiadadas o tan opacas — recortes sin contemplación, cifras maquilladas, promesas rotas — que la junta directiva decide destituirte por destruir el valor intangible de la marca. Los números no lo son todo."};
  if(sectorActual.tieneInventario && state.diasInventario >= 100) return {tipoFinal:'derrota', badge:"Insolvencia técnica por inventario obsoleto", color:'neg',
    desc:`Tu inventario tarda ${Math.round(state.diasInventario)} días en convertirse en venta. Tienes activos en bodega, no en caja: en el papel no estás en quiebra, pero no puedes pagar nada con estantería.`};
  if(state.deuda >= 55 && state.wacc >= 20) return {tipoFinal:'derrota', badge:"Sobreendeudamiento crítico", color:'neg',
    desc:`Tu endeudamiento llegó a ${fmtMoney(state.deuda)} con un WACC de ${state.wacc.toFixed(1)}%. Cada peso nuevo que consigues cuesta más que el anterior: quedaste atrapado en una espiral de costo de capital creciente.`};
  return null;
}
// El final oculto también se reconoce aunque la empresa quiebre — si el patrón de generosidad
// ya estaba ahí, El Comité no solo ve un fracaso financiero: ve por qué llegaste a él.
function checkForcedEnding(){
  const resultado = checkForcedEndingInterno();
  if(!resultado) return null;
  const patron = detectarPatronGenerosidad();
  if(patron.generosas >= 7 && patron.mercantiles <= 1){
    return {
      tipoFinal:'derrota', esFinalOcultoTragico:true, color:'neg', badge:resultado.badge,
      desc:`${resultado.desc} Pero El Comité, esta vez, no ve solo un fracaso financiero: turno tras turno, cuando tuviste que elegir entre proteger el balance o proteger a tu gente, casi siempre elegiste a tu gente — incluso sabiendo que esto podía pasar. No fue la gestión más eficiente. Pero es la que la gente que trabajó contigo recordará, incluso ahora.`
    };
  }
  return resultado;
}

function detectarPatronGenerosidad(){
  let generosas = 0, mercantiles = 0;
  history.forEach(h=>{
    const e = h.efectos || {};
    const sacrificioEconomico = (e.caja||0) < 0 || (e.ebitda||0) < 0;
    const beneficioHumano = (e.moralEquipo||0) > 0 || (e.reputacion||0) > 0;
    const sacrificioHumano = (e.moralEquipo||0) < 0 || (e.reputacion||0) < 0;
    const beneficioEconomico = (e.caja||0) > 0 || (e.ebitda||0) > 0;
    if(sacrificioEconomico && beneficioHumano && !sacrificioHumano) generosas++;
    if(sacrificioHumano && beneficioEconomico && !beneficioHumano) mercantiles++;
  });
  return {generosas, mercantiles};
}

