/* =========================================================
   PERSISTENCIA LOCAL (localStorage) — progresión roguelike real
   ========================================================= */
const STORAGE_KEY = 'elcomite_progreso_v1';

function cargarProgreso(){
  try{
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if(!raw) return {xp:0, historial:[], legados:{}};
    const data = JSON.parse(raw);
    return {
      xp: typeof data.xp === 'number' ? data.xp : 0,
      historial: Array.isArray(data.historial) ? data.historial : [],
      legados: (data.legados && typeof data.legados === 'object') ? data.legados : {}
    };
  }catch(e){
    console.warn('No se pudo leer el progreso guardado (localStorage no disponible):', e.message);
    return {xp:0, historial:[], legados:{}};
  }
}

function guardarProgreso(){
  try{
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({xp: sessionXP, historial: historialPartidas, legados: legadosEmpresariales}));
  }catch(e){
    console.warn('No se pudo guardar el progreso (localStorage no disponible):', e.message);
  }
}

function reiniciarProgreso(){
  try{ window.localStorage.removeItem(STORAGE_KEY); }catch(e){}
  sessionXP = 0;
  historialPartidas = [];
  legadosEmpresariales = {};
  renderSectorSelect();
}

const progresoGuardado = cargarProgreso();
sessionXP = progresoGuardado.xp;
historialPartidas = progresoGuardado.historial;
let legadosEmpresariales = progresoGuardado.legados;

