/* =========================================================
   RENDER DE PANTALLA — TRANSICIÓN / CASO
   ========================================================= */
const TRANSITION_TYPES = ['macro','random'];

function nextTurn(){
  investigado = false;
  flags.decisionExtraUsadaEsteTurno = false;
  const next = resolveTurn();
  if(!next){
    closeTurnModal();
    const forced = checkForcedEnding();
    prepararFinDePartida(forced || cierreAnioFiscal());
    return;
  }
  aplicarMotorOperativo();
  actualizarHistorialYRachas();
  openTurnModal();
  if(next.impactoAutomatico){
    applyEfectos(next.impactoAutomatico);
    renderTicker(next.impactoAutomatico);
  }
  currentCase = next;
  if(next.tipo === 'auditoria'){
    renderAuditoria(next);
  } else if(next.tipo === 'mercado_volatil'){
    renderMercadoVolatil(next);
  } else if(next.tipo === 'bandeja_entrada'){
    renderBandejaEntrada(next);
  } else if(next.tipo === 'fuga_capital'){
    renderFugaCapital(next);
  } else if(TRANSITION_TYPES.includes(next.tipo)){
    renderTransition(next);
  } else {
    mostrarCaso(next);
  }
}

function openTurnModal(){
  document.getElementById('turnModalBackdrop').classList.add('show');
  const btn = document.getElementById('evaluarTurnoBtn');
  if(btn) btn.disabled = true;
  const ofBtn = document.getElementById('oficinaAmbienteBtn');
  if(ofBtn) ofBtn.classList.remove('show');
  const contenido = document.getElementById('turnModalContent');
  if(contenido){
    contenido.classList.remove('fade-in-oscuro');
    void contenido.offsetWidth;
    contenido.classList.add('fade-in-oscuro');
  }
}
function closeTurnModal(){
  document.getElementById('turnModalBackdrop').classList.remove('show');
  document.getElementById('turnModalContent').innerHTML = '';
  ocultarFranjaKpi();
  const btn = document.getElementById('evaluarTurnoBtn');
  if(btn) btn.disabled = false;
  if(oficinaDisponible){
    const ofBtn = document.getElementById('oficinaAmbienteBtn');
    if(ofBtn) ofBtn.classList.add('show');
  }
}
let pendingEndingResult = null;
function prepararFinDePartida(endingObj){
  pendingEndingResult = endingObj;
  detenerOficinaAmbiente();
  const btn = document.getElementById('evaluarTurnoBtn');
  if(btn){
    btn.textContent = 'GENERAR INFORME DE JUNTA';
    btn.classList.add('btn-informe');
    btn.disabled = false;
  }
}
function resetEvaluarTurnoBtn(){
  pendingEndingResult = null;
  const btn = document.getElementById('evaluarTurnoBtn');
  if(btn){ btn.textContent = 'EVALUAR SIGUIENTE TURNO'; btn.classList.remove('btn-informe'); btn.disabled = false; }
}
function mostrarInformeFinal(ending){
  showChrome(false);
  renderEnding(ending);
}
function calculandoImpactoYAvanzar(callbackDespues, shouldShake, efectosParaFlash){
  const overlay = document.getElementById('turnFadeOverlay');
  const text = document.getElementById('turnFadeText');
  if(text) text.textContent = 'CALCULANDO IMPACTO — TURNO ' + turnNumber + '...';
  if(overlay) overlay.classList.add('show');
  setTimeout(()=>{
    if(callbackDespues) callbackDespues();
    setTimeout(()=>{
      if(overlay) overlay.classList.remove('show');
      renderTicker(efectosParaFlash);
      flashKpiCards(efectosParaFlash);
      activarShakeSiAplica(shouldShake);
      if(tendenciaCajaNegativa()) sonidoAlertaCaja();
    }, 30);
  }, 1000);
}

function triggerCurtainSweep(callback){
  const curtain = document.getElementById('curtainOverlay');
  const g = document.getElementById('turnModalContent');
  if(curtain){ curtain.classList.remove('sweep'); void curtain.offsetWidth; curtain.classList.add('sweep'); }
  g.style.transition = 'opacity 0.22s ease';
  g.style.opacity = '0';
  setTimeout(()=>{
    callback();
    g.style.opacity = '0';
    requestAnimationFrame(()=>{ g.style.opacity = '1'; });
  }, 230);
}

