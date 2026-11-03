/* =========================================================
   JUNTA TRIMESTRAL — cierre cada 5 turnos
   ========================================================= */
// snapshotTrimestre: vive en el expediente `partida` (engine/estado-global.js)
function buildJuntaTrimestral(){
  const deltaCaja = Math.round((state.caja - snapshotTrimestre.caja)*10)/10;
  const deltaEbitda = Math.round((state.ebitda - snapshotTrimestre.ebitda)*10)/10;
  snapshotTrimestre = {caja: state.caja, ebitda: state.ebitda};

  let metaHtml = '';
  ultimaEvaluacionMeta = null;
  if(metaTrimestral){
    const cumplida = metaCumplida(metaTrimestral);
    const objetivoFmt = fmtMetaValor(metaTrimestral.indicador, metaTrimestral.valorObjetivo);
    const actualFmt = fmtMetaValor(metaTrimestral.indicador, state[metaTrimestral.indicador]);
    ultimaEvaluacionMeta = {metaAnterior: Object.assign({}, metaTrimestral), cumplida, objetivoFmt, actualFmt};
    if(cumplida){
      state.reputacion = clamp((state.reputacion||0) + 4, 0, 100);
      rachaMetasCumplidas++;
      rachaMetasCumplidasMax = Math.max(rachaMetasCumplidasMax, rachaMetasCumplidas);
      metaHtml = `<div class="pl-row"><span class="pl-label">Meta de la junta (${META_ETIQUETAS[metaTrimestral.indicador]})</span><span style="color:var(--teal)">Cumplida — ${actualFmt} (reputación +4)</span></div>`;
    } else {
      state.reputacion = clamp((state.reputacion||0) - 2, 0, 100);
      rachaMetasCumplidas = 0;
      metaHtml = `<div class="pl-row"><span class="pl-label">Meta de la junta (${META_ETIQUETAS[metaTrimestral.indicador]})</span><span style="color:var(--danger)">No se cumplió — esperaban ${objetivoFmt}, quedó en ${actualFmt} (reputación -2)</span></div>`;
    }
  }
  generarNuevaMeta();
  if(ultimaEvaluacionMeta) ultimaEvaluacionMeta.metaNueva = Object.assign({}, metaTrimestral);
  const nuevaMetaHtml = metaTrimestral ? `<div class="pl-row"><span class="pl-label">Nueva meta para el próximo trimestre</span><span>${META_ETIQUETAS[metaTrimestral.indicador]} hacia ${fmtMetaValor(metaTrimestral.indicador, metaTrimestral.valorObjetivo)}</span></div>` : '';

  const pl = `
    <div class="pl-summary">
      <div class="pl-row"><span class="pl-label">Variación del EBITDA este trimestre</span><span>${fmtMoney(deltaEbitda)}</span></div>
      <div class="pl-row"><span class="pl-label">Variación de caja este trimestre</span><span>${fmtMoney(deltaCaja)}</span></div>
      <div class="pl-row"><span class="pl-label">Caja disponible hoy</span><span>${fmtMoney(state.caja)}</span></div>
      ${metaHtml}
      ${nuevaMetaHtml}
    </div>
  `;
  // Algunas empresas tienen su propio costo de prepagar (Construye YA: crédito constructor).
  const prepagoSector = sectorActual && sectorActual.prepagoDeuda;
  return {
    tipo:'junta',
    titulo:"Cierre trimestral: la junta espera tu decisión",
    contextoHtml: pl,
    contexto:"Cierra el trimestre. La junta directiva revisa el resultado acumulado y espera que definas qué hacer con el excedente (o el faltante) antes de seguir operando.",
    // 3 opciones según la caja (nov. 2026): con liquidez floja, repartir dividendos no tiene sentido y
    // conservar la caja es una decisión defendible; con caja sana, quedarse quieto solo cuesta.
    choices: CONTEXTO.liquidezBaja(state) ? [
      {texto:"Reinvertir en CapEx (tecnología o maquinaria).", efectos:{caja:-5, ebitda:1, razonCorriente:-0.12}, capex:true,
       consecuencia:"Consumes caja que hoy escasea, pero reduces costos operativos futuros — el equivalente a comprarle margen a tus próximos trimestres."},
      {texto:"Prepagar deuda cara.", efectos:Object.assign({}, prepagoSector ? prepagoSector[CONTEXTO.apalancado(state) ? 'apalancado' : 'normal'] : {caja:-5, deuda:-5, wacc:-0.6}, {razonCorriente:-0.08}),
       consecuencia:"Matas pasivos que venían encareciendo tu costo de capital, aunque tu colchón de caja queda todavía más delgado."},
      {texto:"Conservar la caja y explicarle a la junta el plan de liquidez.", efectos:{reputacion:-1, confianzaBanco:2, ebitda:-0.3},
       consecuencia:"Con la liquidez tan justa, la junta entiende que no es momento de repartir ni de invertir — aunque esperaba algo más que prudencia."}
    ] : [
      {texto:"Repartir dividendos a los socios.", efectos:{caja:-6, reputacion:si(CONTEXTO.juntaDesconfia(state), 15, 12)},
       consecuencia:"El FCF baja de forma notoria este trimestre, pero la junta ve un retorno tangible: tu reputación como gerente que sí entrega resultados sube con fuerza." + si(CONTEXTO.juntaDesconfia(state), ' Una junta que dudaba de ti valora el doble ver el dinero.', '')},
      {texto:"Reinvertir en CapEx (tecnología o maquinaria).", efectos:{caja:-5, ebitda:1}, capex:true,
       consecuencia:"Consumes caja hoy, pero reduces costos operativos futuros — el equivalente a comprarle margen a tus próximos trimestres."},
      {texto:"Prepagar deuda.", efectos:prepagoSector ? prepagoSector[CONTEXTO.apalancado(state) ? 'apalancado' : 'normal'] : si(CONTEXTO.apalancado(state), {caja:-5, deuda:-5, wacc:-0.9}, {caja:-5, deuda:-4.5, wacc:-0.35}),
       consecuencia: prepagoSector ? prepagoSector.texto : si(CONTEXTO.apalancado(state),
         "Estabas muy endeudado: matas pasivos que encarecían tu costo de capital, liberas cupo para una emergencia y el banco lo nota en tu tasa.",
         "Tu deuda era moderada y barata: prepagarla te cuesta una penalidad y el alivio en tu costo de capital es pequeño, porque además pierdes parte del ahorro tributario de los intereses. Menos deuda, sí, pero no siempre es lo más rentable que puedes hacer con esa caja.")}
    ]
  };
}

