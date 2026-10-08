/* =========================================================================================
   PANTALLA COMPLETA — usa la API estándar de Fullscreen, con los prefijos necesarios para
   Safari/iOS antiguos. Si el navegador no la soporta (algunos navegadores móviles la
   bloquean), el botón lo indica en vez de fallar en silencio.
   ========================================================================================= */
function estaEnPantallaCompleta(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}
function actualizarTextoPantallaCompleta(){
  const btn = document.getElementById('settingsFullscreenBtn');
  if(!btn) return;
  btn.textContent = estaEnPantallaCompleta() ? 'SALIR DE PANTALLA COMPLETA' : 'PANTALLA COMPLETA';
}
function alternarPantallaCompleta(){
  const el = document.documentElement;
  try{
    if(!estaEnPantallaCompleta()){
      const solicitar = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if(!solicitar){ alert('Tu navegador no permite activar pantalla completa desde aquí.'); return; }
      const resultado = solicitar.call(el);
      // requestFullscreen() devuelve una promesa en los navegadores modernos — si se rechaza
      // (por ejemplo, viendo el archivo dentro de una vista previa incrustada sin permiso de
      // pantalla completa) hay que avisarlo, no fallar en silencio.
      if(resultado && typeof resultado.catch === 'function'){
        resultado.catch(err=>{
          console.warn('No se pudo activar pantalla completa:', err.message);
          alert('No se pudo activar pantalla completa. Si estás viendo este archivo dentro de una vista previa incrustada, abre el archivo directamente en una pestaña de tu navegador e intenta de nuevo.');
        });
      }
    } else {
      const salir = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if(salir) salir.call(document);
    }
  } catch(e){
    console.warn('No se pudo cambiar el modo de pantalla completa:', e.message);
    alert('No se pudo activar pantalla completa. Si estás viendo este archivo dentro de una vista previa incrustada, abre el archivo directamente en una pestaña de tu navegador e intenta de nuevo.');
  }
}
document.getElementById('settingsFullscreenBtn').addEventListener('click', alternarPantallaCompleta);
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(evt=>{
  document.addEventListener(evt, actualizarTextoPantallaCompleta);
});

document.getElementById('settingsCarreraBtn').addEventListener('click', ()=>{
  cerrarAjustes();
  openTurnModal();
  renderPantallaCarrera();
});

document.getElementById('settingsRestartBtn').addEventListener('click', ()=>{
  if(!sectorActual) return;
  cerrarAjustes();
  reiniciarPartidaActual();
});

// "Volver al inicio" usa una confirmación propia, dentro del mismo modal, en vez de
// window.confirm(): el diálogo nativo del navegador puede estar bloqueado o simplemente
// no aparecer cuando el juego se ve dentro de un iframe o una vista previa integrada.
function irAlInicioDesdeAjustes(){
  cerrarAjustes();
  // Blindaje: forzar el cierre de cualquier otro overlay que pudiera seguir abierto
  // (modal de turno, "calculando impacto"), sin importar el momento exacto de la
  // partida en que se use este botón.
  const turnBackdrop = document.getElementById('turnModalBackdrop');
  if(turnBackdrop && turnBackdrop.classList.contains('show')){ closeTurnModal(); }
  const fadeOverlay = document.querySelector('.turn-fade-overlay');
  if(fadeOverlay){ fadeOverlay.classList.remove('show'); }
  pendingEndingResult = null;
  renderLanding();
}
document.getElementById('settingsHomeBtn').addEventListener('click', ()=>{
  const fila = document.getElementById('settingsButtonsRow');
  const confirmBox = document.getElementById('settingsHomeConfirm');
  if(fila) fila.style.display = 'none';
  if(confirmBox) confirmBox.style.display = '';
});
document.getElementById('settingsHomeConfirmYes').addEventListener('click', irAlInicioDesdeAjustes);
document.getElementById('settingsHomeConfirmNo').addEventListener('click', ocultarConfirmacionInicio);

// La cinemática arranca SIEMPRE que se abre el juego, sin importar cuántas veces.
startIntro();

