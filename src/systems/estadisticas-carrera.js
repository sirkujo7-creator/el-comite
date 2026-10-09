/* =========================================================================================
   ESTADÍSTICAS DE CARRERA — compara la partida actual contra tu propio historial guardado,
   y ofrece una pantalla aparte ("Tu carrera en El Comité") con el panorama completo.
   ========================================================================================= */
function calcularEstadisticasCarrera(){
  const partidas = historialPartidas;
  if(!partidas.length) return null;
  const total = partidas.length;
  const quiebras = partidas.filter(p=>p.esQuiebra).length;
  const conValoracion = partidas.filter(p=>p.valoracion!=null);
  const mejorValoracion = conValoracion.length ? Math.max(...conValoracion.map(p=>p.valoracion)) : null;
  const conRazonCorriente = partidas.filter(p=>p.razonCorriente!=null);
  const promedioRazonCorriente = conRazonCorriente.length ? conRazonCorriente.reduce((a,p)=>a+p.razonCorriente,0)/conRazonCorriente.length : null;
  const mejorRazonCorriente = conRazonCorriente.length ? Math.max(...conRazonCorriente.map(p=>p.razonCorriente)) : null;
  const conteoArquetipos = {};
  partidas.forEach(p=>{ if(p.arquetipo) conteoArquetipos[p.arquetipo] = (conteoArquetipos[p.arquetipo]||0)+1; });
  let arquetipoMasFrecuente = null, maxConteo = 0;
  Object.keys(conteoArquetipos).forEach(k=>{ if(conteoArquetipos[k]>maxConteo){ maxConteo=conteoArquetipos[k]; arquetipoMasFrecuente=k; } });
  return {
    total, quiebras, tasaQuiebra: total ? (quiebras/total*100) : 0,
    mejorValoracion, promedioRazonCorriente, mejorRazonCorriente,
    arquetipoMasFrecuente, conteoArquetipos
  };
}
function detectarRecordPersonal(ending){
  if(ending.tipoFinal !== 'cierre') return null;
  const anteriores = historialPartidas.slice(1).filter(p=>p.valoracion!=null);
  if(!anteriores.length) return null;
  const mejorAnterior = Math.max(...anteriores.map(p=>p.valoracion));
  if(ending.valuacion > mejorAnterior){
    return `Nuevo récord personal: nunca habías cerrado una partida con una valoración tan alta (antes, tu mejor resultado fue ${fmtMoney(mejorAnterior)}).`;
  }
  return null;
}
function renderPantallaCarrera(){
  const stats = calcularEstadisticasCarrera();
  const g = document.getElementById('turnModalContent');
  if(!stats){
    g.innerHTML = `
      <div class="result-card screen-fade-in">
        <div class="result-recordatorio">TU CARRERA EN EL COMITÉ</div>
        <p class="consequence-text">Todavía no has terminado ninguna partida — esta pantalla se llena de estadísticas reales a medida que juegas.</p>
        <div><button class="continue-btn" id="carreraCerrarBtn">Cerrar</button></div>
      </div>
    `;
  } else {
    const arquetipoTexto = stats.arquetipoMasFrecuente ? `${stats.arquetipoMasFrecuente} (${stats.conteoArquetipos[stats.arquetipoMasFrecuente]} vez/veces)` : 'Ninguno todavía';
    g.innerHTML = `
      <div class="result-card screen-fade-in">
        <div class="result-recordatorio">TU CARRERA EN EL COMITÉ</div>
        <div class="carrera-stats">
          <div class="carrera-stat"><div class="carrera-stat-num">${stats.total}</div><div class="carrera-stat-label">Partidas jugadas</div></div>
          <div class="carrera-stat"><div class="carrera-stat-num">${stats.tasaQuiebra.toFixed(0)}%</div><div class="carrera-stat-label">Tasa de quiebra</div></div>
          <div class="carrera-stat"><div class="carrera-stat-num">${stats.mejorValoracion!=null?fmtMoney(stats.mejorValoracion):'—'}</div><div class="carrera-stat-label">Mejor valoración final</div></div>
          <div class="carrera-stat"><div class="carrera-stat-num">${stats.mejorRazonCorriente!=null?stats.mejorRazonCorriente.toFixed(2):'—'}</div><div class="carrera-stat-label">Mejor razón corriente</div></div>
          <div class="carrera-stat"><div class="carrera-stat-num">${stats.promedioRazonCorriente!=null?stats.promedioRazonCorriente.toFixed(2):'—'}</div><div class="carrera-stat-label">Razón corriente promedio</div></div>
          <div class="carrera-stat"><div class="carrera-stat-num" style="font-size:14px;">${arquetipoTexto}</div><div class="carrera-stat-label">Arquetipo más frecuente</div></div>
        </div>
        <div><button class="continue-btn" id="carreraCerrarBtn">Cerrar</button></div>
      </div>
    `;
  }
  document.getElementById('carreraCerrarBtn').addEventListener('click', ()=>{ closeTurnModal(); });
}
function renderEnding(ending){
  const g = document.getElementById('game');
  const esCierre = ending.tipoFinal === 'cierre';
  const xpGanado = 10 + turnNumber + (esCierre ? {S:40,A:25,B:12,C:5}[ending.rango] : 0);
  sessionXP += xpGanado;
  historialPartidas.unshift({
    fecha: new Date().toLocaleDateString('es-CO'),
    sector: nombreEmpresaActual(),
    sectorId: sectorActual ? sectorActual.id : null,
    perfil: perfilActual ? perfilActual.nombre : '—',
    resultado: esCierre ? `Rango ${ending.rango}` : 'Derrota',
    detalle: ending.badge,
    turnos: turnNumber - 1,
    xp: xpGanado,
    esQuiebra: !esCierre,
    valoracion: esCierre ? ending.valuacion : null,
    razonCorriente: state.razonCorriente,
    deuda: state.deuda,
    arquetipo: (esCierre && ending.arquetipo) ? ending.arquetipo.nombre : null
  });
  if(historialPartidas.length > 20) historialPartidas.length = 20;
  actualizarLegadoEmpresarial(ending);
  guardarProgreso();

  const rankColor = (ending.esFinalOculto || ending.esFinalOcultoTragico) ? 'var(--evento)' : (ending.color==='pos'?'var(--teal)':ending.color==='neg'?'var(--danger)':'var(--gold)');
  const tg = tituloGerencial();
  const recordPersonal = detectarRecordPersonal(ending);
  const rankHtml = esCierre ? `
    <div class="rank-badge" style="color:${rankColor}">Rango ${ending.rango}</div>
    <div class="ending-badge" style="${ending.esFinalOculto?'color:var(--evento);':''}">${ending.badge}${ending.esFinalOculto ? ' <span style="font-size:11px; opacity:0.7;">· final oculto descubierto</span>' : ''}</div>
    ${ending.arquetipo ? `<div class="arquetipo-badge">${ending.arquetipo.nombre}</div><p class="arquetipo-desc">${ending.arquetipo.desc}</p>` : ''}
    ${recordPersonal ? `<div class="committee-box acierto">🏆 ${recordPersonal}</div>` : ''}
    ${ending.mandatoResultado ? `<div class="committee-box ${ending.mandatoResultado.cumplido?'acierto':'error'}"><b>Mandato del año — ${ending.mandatoResultado.titulo}:</b> ${ending.mandatoResultado.cumplido ? 'Cumplido.' : 'No se cumplió.'}</div>` : ''}
    ${(ending.logros && ending.logros.length) ? `<div class="logros-box"><div class="logros-titulo">Logros desbloqueados</div>${ending.logros.map(l=>`<div class="logro-item"><span class="logro-nombre">🏅 ${l.titulo}</span><span class="logro-desc">${l.desc}</span></div>`).join('')}</div>` : ''}
    <div class="val-row">
      <div class="val-item"><div class="val-num">${fmtMoney(ending.valuacionInicial)}</div><div class="val-label">Valoración inicial</div></div>
      <div class="val-item"><div class="val-num">${fmtMoney(ending.valuacion)}</div><div class="val-label">Valoración final</div></div>
    </div>
  ` : `<div class="ending-badge" style="color:${rankColor}">${ending.badge}${ending.esFinalOcultoTragico ? ' <span style="font-size:11px; opacity:0.7;">· El Comité vio más que un fracaso</span>' : ''}</div>`;

  g.innerHTML = `
    <div class="case-card ending-card">
      <div class="case-eyebrow" style="justify-content:center">${esCierre ? 'Cierre del año fiscal' : 'Fin del ejercicio'} · ${nombreEmpresaActual()} · turno ${turnNumber-1}</div>
      ${rankHtml}
      <div class="titulo-gerencial">
        <div class="titulo-gerencial-label">Título gerencial</div>
        <div class="titulo-gerencial-nombre">${tg.titulo}</div>
        <p class="titulo-gerencial-parrafo">${tg.parrafo}</p>
      </div>
      <p class="ending-desc">${ending.desc}</p>
      <div class="chart-box">
        <div class="chart-title">El gráfico de la gestión — salud financiera por turno (pasa el cursor para ver el detalle)</div>
        <div class="chart-canvas-wrap" id="chartCanvasWrap"></div>
      </div>
      <div class="committee-box"><b>Análisis del Comité:</b> ${analisisDelComite(ending)}</div>
      <div class="committee-box error"><b>Tu mayor error financiero:</b> ${mayorErrorFinanciero()}</div>
      ${mayorAciertoFinanciero() ? `<div class="committee-box acierto"><b>Tu mejor decisión:</b> ${mayorAciertoFinanciero()}</div>` : ''}
      <div class="xp-line show" style="text-align:center;margin-bottom:16px;">+${xpGanado} XP gerencial · total de sesión: ${sessionXP} XP</div>
      <div class="ending-btns">
        <button class="restart-btn" id="printBtn">🖨️ Exportar a PDF / Imprimir</button>
        <button class="restart-btn primary" id="restartBtn">Repetir este sector</button>
        <button class="restart-btn" id="changeSectorBtn">Elegir otro sector</button>
      </div>
    </div>
  `;
  document.getElementById('printBtn').addEventListener('click', ()=>{ window.print(); });
  document.getElementById('restartBtn').addEventListener('click', reiniciarPartidaActual);
  document.getElementById('changeSectorBtn').addEventListener('click', renderSectorSelect);
  renderLog();
  renderTicker(null);
  renderDeathChartJS();
}

