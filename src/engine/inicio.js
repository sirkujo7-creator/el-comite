/* =========================================================
   INICIO
   ========================================================= */
document.getElementById('cajaZoomBtn').addEventListener('click', ()=>{ cajaZoom = cycleNext(cajaZoom, ZOOM_CYCLE); document.getElementById('cajaZoomBtn').textContent = 'Zoom: '+ZOOM_LABEL[cajaZoom]; renderChartCaja(); });
document.getElementById('cajaPeriodoBtn').addEventListener('click', ()=>{ cajaPeriodo = cycleNext(cajaPeriodo, PERIODO_CYCLE); document.getElementById('cajaPeriodoBtn').textContent = 'Periodo: '+PERIODO_LABEL[cajaPeriodo]; renderChartCaja(); });
document.getElementById('edZoomBtn').addEventListener('click', ()=>{ edZoom = cycleNext(edZoom, ZOOM_CYCLE); document.getElementById('edZoomBtn').textContent = 'Zoom: '+ZOOM_LABEL[edZoom]; renderChartEd(); });
document.getElementById('edPeriodoBtn').addEventListener('click', ()=>{ edPeriodo = cycleNext(edPeriodo, PERIODO_CYCLE); document.getElementById('edPeriodoBtn').textContent = 'Periodo: '+PERIODO_LABEL[edPeriodo]; renderChartEd(); });
document.getElementById('evaluarTurnoBtn').addEventListener('click', ()=>{
  if(pendingEndingResult){
    const ending = pendingEndingResult;
    pendingEndingResult = null;
    reproducirSecuencia(GUION_INFORME_FINAL, ()=>{
      mostrarInformeFinal(ending);
    });
    return;
  }
  nextTurn();
});
document.getElementById('oficinaAmbienteBtn').addEventListener('click', activarSituacionOficina);
document.getElementById('logToggle').addEventListener('click', toggleLog);

renderLanding();

