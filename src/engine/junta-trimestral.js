/* =========================================================
   JUNTA TRIMESTRAL — cierre cada 5 turnos
   ========================================================= */
let snapshotTrimestre = {caja:0, ebitda:0};
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
  return {
    tipo:'junta',
    titulo:"Cierre trimestral: la junta espera tu decisión",
    contextoHtml: pl,
    contexto:"Cierra el trimestre. La junta directiva revisa el resultado acumulado y espera que definas qué hacer con el excedente (o el faltante) antes de seguir operando.",
    choices:[
      {texto:"Repartir dividendos a los socios.", efectos:{caja:-6, reputacion:12},
       consecuencia:"El FCF baja de forma notoria este trimestre, pero la junta ve un retorno tangible: tu reputación como gerente que sí entrega resultados sube con fuerza."},
      {texto:"Reinvertir en CapEx (tecnología o maquinaria).", efectos:{caja:-5, ebitda:1}, capex:true,
       consecuencia:"Consumes caja hoy, pero reduces costos operativos futuros — el equivalente a comprarle margen a tus próximos trimestres."},
      {texto:"Prepagar deuda cara.", efectos:{caja:-5, deuda:-5, wacc:-0.6},
       consecuencia:"Matas pasivos que venían encareciendo tu costo de capital y liberas cupo de crédito para una futura emergencia."},
      {texto:"Acumular liquidez y no mover nada.", efectos:{reputacion:-3},
       consecuencia:"La junta lo nota: tener 'dinero ocioso' sin un destino claro, perdiendo poder adquisitivo frente a la inflación, no es gratis en reputación — aunque tu caja queda intacta para lo que venga."}
    ]
  };
}

