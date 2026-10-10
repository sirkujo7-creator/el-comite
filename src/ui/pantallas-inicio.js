/* =========================================================================================
   PANTALLAS DE INICIO
   ========================================================================================= */
let sectorPendiente = null;
let perfilSeleccionado = 'negociador';
let perkSeleccionado = 'ninguna';
let nombreEmpresaJugador = '';

function activarFadeInOscuro(){
  const wrap = document.querySelector('.wrap');
  if(!wrap) return;
  wrap.classList.remove('fade-in-oscuro');
  void wrap.offsetWidth; // fuerza el reflow para poder reiniciar la animación si ya se habia aplicado antes
  wrap.classList.add('fade-in-oscuro');
}

function showChrome(v){
  document.getElementById('tickerLeft').style.display = v?'':'none';
  document.getElementById('tickerRight').style.display = v?'':'none';
  document.getElementById('relations').style.display = v?'':'none';
  document.getElementById('calendario').style.display = v?'':'none';
  const equipos = document.getElementById('equiposLine');
  if(equipos) equipos.style.display = v?'':'none';
  document.getElementById('crtRow').style.display = v?'grid':'none';
  document.getElementById('evaluarTurnoWrap').style.display = v?'':'none';
  document.getElementById('logToggle').style.display = v?'':'none';
  if(!v){
    document.getElementById('log').classList.remove('show');
    const wrap = document.querySelector('.wrap');
    if(wrap) wrap.classList.remove('shake');
    const vig = document.getElementById('stressVignette');
    if(vig) vig.classList.remove('stress-high','stress-critical');
    detenerOficinaAmbiente();
    detenerDrone();
    detenerDroneCritico();
  } else {
    detenerAmbienteMenu();
  }
  const subtitle = document.getElementById('subtitleText');
  const xpLine = document.getElementById('xpLine');
  if(subtitle) subtitle.style.display = v ? 'none' : '';
  if(xpLine && v) xpLine.classList.remove('show');
  const headerEl = document.querySelector('header');
  if(headerEl){ headerEl.style.marginBottom = v ? '10px' : '18px'; }
}

function renderLanding(){
  showChrome(false);
  iniciarAmbienteMenu();
  document.getElementById('subtitleText').innerHTML = "Información incompleta. Plazos que vencen. Un mercado que no avisa.";
  document.getElementById('xpLine').classList.remove('show');
  document.getElementById('game').innerHTML = `
    <div class="case-card landing">
      <div class="landing-escena"><img src="${COMITE_IMG_BASE64}" alt="" /></div>
      <h1 class="landing-title">El Comité</h1>
      <div class="landing-subtitle">Gestión crítica. Decisión final.</div>
      <button class="landing-inicio-btn" id="inicioBtn">INICIO</button>
      <div class="landing-pie">${SECTORS.length} sectores · ${MAX_TURNS} turnos · ${Math.floor(MAX_TURNS/5)} juntas directivas</div>
    </div>
  `;
  document.getElementById('inicioBtn').addEventListener('click', renderSectorSelect);
}

