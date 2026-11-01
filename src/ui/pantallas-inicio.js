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
  // Tablero "Sala de mando": la clase en-partida activa su distribución (styles/sala-de-mando.css).
  limpiarFinal();
  document.body.classList.toggle('en-partida', !!v);
  if(v && !document.body.classList.contains('tablero-encendido')){ document.body.classList.add('tablero-encendido'); encenderTablero(); }
  if(!v) document.body.classList.remove('tablero-encendido');
  ['tickerLeft','calendario','tableroLado','tableroPie','anioFiscal'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = v?'':'none';
  });
  document.getElementById('crtRow').style.display = v?'grid':'none';
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
  const resumen = resumenPartidaGuardada();
  document.getElementById('game').innerHTML = `
    <div class="case-card landing">
      <div class="landing-escena"><img src="${COMITE_IMG_BASE64}" alt="" /></div>
      <h1 class="landing-title">El Comité</h1>
      <div class="landing-subtitle">Gestión crítica. Decisión final.</div>
      ${resumen ? `<button class="landing-continuar-btn" id="continuarBtn">CONTINUAR PARTIDA<small>${resumen.empresa} · turno ${resumen.turno} de ${MAX_TURNS}</small></button>` : ''}
      <button class="landing-inicio-btn" id="inicioBtn">${resumen ? 'NUEVA PARTIDA' : 'INICIO'}</button>
      ${resumen ? '<div class="landing-aviso">Empezar una nueva reemplaza la partida guardada.</div>' : ''}
      <div class="landing-pie">${SECTORS.length} sectores · ${MAX_TURNS} turnos · ${Math.floor(MAX_TURNS/5)} juntas directivas</div>
    </div>
  `;
  document.getElementById('inicioBtn').addEventListener('click', renderSectorSelect);
  if(resumen) document.getElementById('continuarBtn').addEventListener('click', continuarPartidaGuardada);
}

