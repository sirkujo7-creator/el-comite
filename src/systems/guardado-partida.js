/* =========================================================
   GUARDAR Y CONTINUAR PARTIDA (Fase 4, nov. 2026)
   El expediente `partida` (engine/estado-global.js) se archiva en localStorage cada vez que
   el tablero queda en reposo entre turnos, y se borra al terminar el año fiscal. Si el
   jugador cierra el navegador, la portada ofrece continuar donde iba.
   Los casos, eventos, sectores y perfiles no se copian: se guardan como referencia a su
   lugar en el contenido del juego ("caso:vitafit:3", "fn:eventoHuelgaSindical"), y la
   huella del contenido evita restaurar una partida guardada con otra versión de los casos.
   ========================================================= */
const GUARDADO_PARTIDA_KEY = 'elcomite_partida_v1';

// Todo lo del contenido que una partida puede referenciar, con una clave estable.
let registroContenido = null;
function obtenerRegistroContenido(){
  if(registroContenido) return registroContenido;
  const porValor = new Map(), porClave = new Map();
  const anotar = (clave, valor)=>{
    if(!valor || (typeof valor !== 'object' && typeof valor !== 'function') || porValor.has(valor)) return;
    porValor.set(valor, clave); porClave.set(clave, valor);
  };
  const lista = (prefijo, arr)=> (arr || []).forEach((x, i)=>anotar(prefijo + ':' + i, x));
  SECTORS.forEach(s=>{
    anotar('sector:' + s.id, s);
    lista('caso:' + s.id, s.cases); lista('azar:' + s.id, s.random); lista('calendario:' + s.id, s.calendario);
  });
  PERFILES.forEach(p=>anotar('perfil:' + p.id, p));
  PERKS.forEach(p=>anotar('ventaja:' + p.id, p));
  MANDATOS_INICIALES.forEach(m=>anotar('mandato:' + m.id, m));
  [['dilema', ETHICAL_DILEMMA_POOL], ['elenco', ELENCO_INDICADORES], ['karma', KARMA_CASES],
   ['cadena', CADENAS_PROFUNDAS], ['cisne', BLACK_SWAN_POOL], ['ecoDura', ECOS_DECISION_DURA],
   ['ecoGenerosa', ECOS_DECISION_GENEROSA], ['oficina', OFICINA_EVENTS_POOL], ['fuga', FUGA_CAPITAL_DEPTS]]
    .forEach(([prefijo, arr])=>lista(prefijo, arr));
  registroContenido = {porValor, porClave};
  return registroContenido;
}
// Huella del contenido: si cambian los casos (otra versión del juego), la partida guardada
// ya no apunta a lo mismo y no se ofrece continuarla.
function huellaContenido(){
  let h = 0;
  const texto = Array.from(obtenerRegistroContenido().porClave.entries())
    .map(([k, v])=>k + '=' + (typeof v === 'function' ? String(v).length : (v.titulo || v.id || v.nombre || ''))).join('|');
  for(let i=0;i<texto.length;i++) h = (h * 31 + texto.charCodeAt(i)) | 0;
  return String(h);
}

function aGuardable(valor, faltantes){
  if(valor == null || typeof valor !== 'object' && typeof valor !== 'function') return valor;
  const clave = obtenerRegistroContenido().porValor.get(valor);
  if(clave) return {$ref: clave};
  if(typeof valor === 'function'){
    if(valor.name && globalThis[valor.name] === valor) return {$ref: 'fn:' + valor.name};
    faltantes.push(valor.name || String(valor).slice(0, 60));
    return {$ref: null};
  }
  if(Array.isArray(valor)) return valor.map(v=>aGuardable(v, faltantes));
  const copia = {};
  Object.keys(valor).forEach(k=>{ copia[k] = aGuardable(valor[k], faltantes); });
  return copia;
}
function desdeGuardable(valor){
  if(valor == null || typeof valor !== 'object') return valor;
  if(Array.isArray(valor)) return valor.map(desdeGuardable);
  if('$ref' in valor && Object.keys(valor).length === 1){
    const clave = valor.$ref;
    if(clave == null) return null;
    if(clave.startsWith('fn:')) return globalThis[clave.slice(3)] || null;
    return obtenerRegistroContenido().porClave.get(clave) || null;
  }
  const copia = {};
  Object.keys(valor).forEach(k=>{ copia[k] = desdeGuardable(valor[k]); });
  return copia;
}

// El expediente completo, listo para JSON. `faltantes` recoge lo que no se pudo referenciar.
function serializarPartida(faltantes){
  faltantes = faltantes || [];
  return {
    version: 1, huella: huellaContenido(), fecha: Date.now(),
    nombreEmpresa: nombreEmpresaJugador || '', dificultad: dificultadSeleccionada,
    partida: aGuardable(Object.assign({}, partida, {currentCase: null}), faltantes)
  };
}
function guardarPartidaEnCurso(){
  if(!partida || !partida.state || !partida.sectorActual || partida.pendingEndingResult) return;
  try{ window.localStorage.setItem(GUARDADO_PARTIDA_KEY, JSON.stringify(serializarPartida())); }catch(e){}
}
function borrarPartidaGuardada(){
  try{ window.localStorage.removeItem(GUARDADO_PARTIDA_KEY); }catch(e){}
}
// Devuelve los datos guardados si se pueden continuar con esta versión del juego.
function leerPartidaGuardada(){
  try{
    const raw = window.localStorage.getItem(GUARDADO_PARTIDA_KEY);
    if(!raw) return null;
    const datos = JSON.parse(raw);
    if(!datos || datos.version !== 1 || !datos.partida || datos.huella !== huellaContenido()) return null;
    return datos;
  }catch(e){ return null; }
}
function resumenPartidaGuardada(){
  const datos = leerPartidaGuardada();
  if(!datos) return null;
  const sector = obtenerRegistroContenido().porClave.get(datos.partida.sectorActual && datos.partida.sectorActual.$ref);
  if(!sector) return null;
  return {empresa: datos.nombreEmpresa || sector.nombre, turno: datos.partida.turnNumber || 0};
}

// Vuelve al tablero tal como quedó la última vez que estuvo en reposo.
function continuarPartidaGuardada(){
  const datos = leerPartidaGuardada();
  if(!datos){ renderLanding(); return; }
  detenerAmbienteMenu();
  partida = Object.assign(nuevaPartida(), desdeGuardable(datos.partida));
  // Lo que no se pudo reconstruir (no debería pasar) se descarta en vez de romper el turno.
  if(Array.isArray(mainQueue)) mainQueue = mainQueue.filter(Boolean);
  if(Array.isArray(randomBag)) randomBag = randomBag.filter(Boolean);
  if(state && Array.isArray(state.scheduledEvents)) state.scheduledEvents = state.scheduledEvents.filter(e=>e && e.build);
  nombreEmpresaJugador = datos.nombreEmpresa || '';
  if(datos.dificultad) dificultadSeleccionada = datos.dificultad;
  sectorPendiente = sectorActual.id;
  if(perfilActual) perfilSeleccionado = perfilActual.id;
  if(perkActual) perkSeleccionado = perkActual.id;
  document.getElementById('game').innerHTML = '';
  showChrome(true);
  activarFadeInOscuro();
  document.getElementById('subtitleText').innerHTML = `Diriges las finanzas de <b>${nombreEmpresaActual()}</b>: ${sectorActual.rubro.toLowerCase()}. ${sectorActual.descripcion} Perfil activo: <b>${perfilActual ? perfilActual.nombre : '—'}</b>.`;
  document.getElementById('xpLine').classList.remove('show');
  resetEvaluarTurnoBtn();
  renderTicker(null);
  programarProximaOficinaAmbiente();
  iniciarDrone();
}
