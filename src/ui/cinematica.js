/* =========================================================
   CINEMÁTICA DE INTRODUCCIÓN — motor de narrativa por secuencia
   ========================================================= */
const introScript = [
  { text: "Lugar: Habitación sin pagar.", speed: 60 },
  { text: "Estado: Desempleado. Saldo en caja: $0.00.", speed: 55 },
  { text: "Día 143. La carta de desalojo pasó por debajo de la puerta.", speed: 50 },
  { text: "El sistema no te va a salvar.", speed: 75 },
  { text: "Pero entiendes los números. Entiendes el riesgo.", speed: 55 },
  { text: "Si vas a caer... será intentando construir un imperio.", speed: 70 },
  { text: "INICIANDO TERMINAL DE EL COMITÉ...", speed: 45 }
];

// Guion de la transición al INICIAR (o reiniciar) una partida
function guionInicioPartida(sector, perfil){
  const rubroTexto = (sector && sector.rubro) ? sector.rubro : 'SECTOR NO DEFINIDO';
  const perfilTexto = (perfil && perfil.nombre) ? perfil.nombre : PERFILES[0].nombre;
  const legado = sector ? legadosEmpresariales[sector.id] : null;
  const lineas = [
    { text: "ACCEDIENDO A LA TERMINAL DE EL COMITÉ...", speed: 30 },
    { text: "EMPRESA: " + nombreEmpresaActual().toUpperCase(), speed: 35 },
    { text: "SECTOR: " + rubroTexto.toUpperCase(), speed: 30 }
  ];
  if(legado && !legado.quebrada && legado.generacion>=2){
    lineas.push({ text: "GENERACIÓN " + legado.generacion + " — HEREDAS LA EMPRESA DE LA GESTIÓN ANTERIOR (RANGO " + (legado.ultimoRango||'—') + ")", speed: 28 });
  } else if(legado && legado.quebrada){
    lineas.push({ text: "AVISO: LA GESTIÓN ANTERIOR DE ESTA EMPRESA TERMINÓ EN QUIEBRA. EMPIEZAS DESDE CERO.", speed: 28 });
  }
  const otrosLegados = sector ? legadosActivosDeOtrosSectores(sector.id) : [];
  if(otrosLegados.length){
    const otro = otrosLegados[Math.floor(Math.random()*otrosLegados.length)];
    const nombreOtroSector = (SECTORS.find(s=>s.id===otro.id)||{}).rubro || otro.id;
    lineas.push({ text: "MIENTRAS TANTO, TU GESTIÓN EN " + nombreOtroSector.toUpperCase() + " SIGUE EN PIE (GENERACIÓN " + otro.generacion + ")", speed: 26 });
  }
  lineas.push({ text: "PERFIL GERENCIAL: " + perfilTexto.toUpperCase(), speed: 35 });
  lineas.push({ text: "LA JUNTA YA ESTÁ ESPERANDO TU PRIMERA DECISIÓN...", speed: 30 });
  return lineas;
}

// Guion de la transición al GENERAR EL INFORME FINAL
const GUION_INFORME_FINAL = [
  { text: "CERRANDO EL AÑO FISCAL...", speed: 35 },
  { text: "LA JUNTA SE REÚNE A PUERTA CERRADA...", speed: 30 },
  { text: "COMPILANDO TU GESTIÓN, TURNO POR TURNO...", speed: 28 },
  { text: "GENERANDO VEREDICTO FINAL...", speed: 32 }
];

let introCerrada = false;
let introTimeoutActual = null;
let introResolverActual = null;
let introTypingActivo = false;
let introEsperandoEspacio = false;
let introResolverEspacio = null;
let introCompletarLineaYa = false;

function esperar(ms){
  return new Promise(resolve=>{
    introResolverActual = resolve;
    introTimeoutActual = setTimeout(()=>{
      introResolverActual = null;
      resolve();
    }, ms);
  });
}
function cancelarEsperaActual(){
  if(introTimeoutActual){ clearTimeout(introTimeoutActual); introTimeoutActual = null; }
  if(introResolverActual){
    const r = introResolverActual;
    introResolverActual = null;
    r();
  }
}
function esperarEspacio(){
  const hint = document.getElementById('introHint');
  if(hint) hint.classList.add('show');
  return new Promise(resolve=>{
    introResolverEspacio = resolve;
    introEsperandoEspacio = true;
  });
}
function liberarEsperaEspacio(){
  const hint = document.getElementById('introHint');
  if(hint) hint.classList.remove('show');
  if(introResolverEspacio){
    const r = introResolverEspacio;
    introEsperandoEspacio = false;
    introResolverEspacio = null;
    r();
  }
}

function resaltarNombreJuego(lineEl, textoCompleto){
  if(!lineEl) return;
  if(/el comité/i.test(textoCompleto)){
    lineEl.innerHTML = textoCompleto.replace(/el comité/gi, '<span class="nombre-juego">$&</span>');
  }
}

async function tipearLinea(texto, speed){
  const el = document.getElementById('introTextContainer');
  if(!el) return;
  el.innerHTML = '<span id="introLineText"></span><span class="cursor-blink"></span>';
  const lineEl = document.getElementById('introLineText');
  introTypingActivo = true;
  introCompletarLineaYa = false;
  for(let i=0; i<texto.length; i++){
    if(introCerrada){ introTypingActivo = false; return; }
    if(introCompletarLineaYa){
      if(lineEl) lineEl.textContent = texto;
      introCompletarLineaYa = false;
      introTypingActivo = false;
      resaltarNombreJuego(lineEl, texto);
      return;
    }
    if(lineEl) lineEl.textContent += texto.charAt(i);
    sonidoTecla();
    if(i < texto.length - 1){
      await esperar(speed);
    }
  }
  introTypingActivo = false;
  resaltarNombreJuego(lineEl, texto);
}

// Reproductor único de secuencias de terminal: SIEMPRE espera [ESPACIO] para pasar a la
// siguiente línea (o [ESC] para omitir toda la secuencia) — nunca avanza sola.
// Se usa para la intro inicial, el arranque de partida y la carga del informe final.
let onSecuenciaCompleta = null;
async function reproducirSecuencia(guion, callback){
  onSecuenciaCompleta = callback;
  introCerrada = false;
  const overlay = document.getElementById('introOverlay');
  if(overlay){ overlay.classList.remove('intro-hide'); overlay.style.display = 'flex'; }
  for(const linea of guion){
    if(introCerrada) break;
    await tipearLinea(linea.text, linea.speed);
    if(introCerrada) break;
    // La oración queda fija en pantalla hasta que el jugador presione ESPACIO
    await esperarEspacio();
    if(introCerrada) break;
    const el = document.getElementById('introTextContainer');
    if(el) el.innerHTML = '';
  }
  closeIntro();
}

async function startIntro(){
  await reproducirSecuencia(introScript, null);
}

function closeIntro(){
  if(introCerrada) return;
  introCerrada = true;
  cancelarEsperaActual();
  liberarEsperaEspacio();
  const overlay = document.getElementById('introOverlay');
  // Ejecutar el callback de inmediato, mientras el overlay sigue 100% opaco: así el contenido
  // de la siguiente pantalla ya está listo y renderizado ANTES de que el negro empiece a
  // desvanecerse, evitando el "flash" de un instante vacío detrás del degradado.
  const cb = onSecuenciaCompleta;
  onSecuenciaCompleta = null;
  if(cb) cb();
  if(overlay){
    overlay.classList.add('intro-hide');
    setTimeout(()=>{
      overlay.style.display = 'none';
      overlay.classList.remove('intro-hide');
    }, 800);
  }
}

const skipBtn = document.getElementById('skipIntroBtn');
if(skipBtn) skipBtn.addEventListener('click', closeIntro);
document.addEventListener('keydown', (e)=>{
  if(introCerrada) return;
  if(e.key === 'Escape'){ closeIntro(); return; }
  if(e.code === 'Space' || e.key === ' '){
    if(e.preventDefault) e.preventDefault();
    if(introEsperandoEspacio){
      liberarEsperaEspacio();
    } else if(introTypingActivo){
      introCompletarLineaYa = true;
    }
  }
});

// =========================================================
// BOTÓN Y MODAL DE AJUSTES
// =========================================================
function ocultarConfirmacionInicio(){
  const fila = document.getElementById('settingsButtonsRow');
  const confirmBox = document.getElementById('settingsHomeConfirm');
  if(fila) fila.style.display = '';
  if(confirmBox) confirmBox.style.display = 'none';
}
function abrirAjustes(){
  document.getElementById('settingsModalBackdrop').classList.add('show');
  const restartBtn = document.getElementById('settingsRestartBtn');
  if(restartBtn) restartBtn.disabled = !sectorActual;
  ocultarConfirmacionInicio();
}
function cerrarAjustes(){
  document.getElementById('settingsModalBackdrop').classList.remove('show');
  ocultarConfirmacionInicio();
}
document.getElementById('portraitBtn').addEventListener('click', abrirAjustes);
document.getElementById('portraitBtn').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); abrirAjustes(); }
});
document.getElementById('settingsCloseBtn').addEventListener('click', cerrarAjustes);
document.getElementById('settingsModalBackdrop').addEventListener('click', (e)=>{
  if(e.target.id === 'settingsModalBackdrop') cerrarAjustes();
});

const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
if(volumeSlider){
  volumeSlider.addEventListener('input', ()=>{
    volumenGeneral = parseInt(volumeSlider.value, 10) / 100;
    if(volumeValue) volumeValue.textContent = volumeSlider.value + '%';
    actualizarVolumenEnVivo();
  });
}

