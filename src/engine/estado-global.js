/* =========================================================
   EXPEDIENTE DE LA PARTIDA (Fase 4, nov. 2026)
   Todo lo que pertenece a UNA partida vive en un solo objeto, `partida`. Empezar otra es
   crear un expediente nuevo (nuevaPartida): nada de la anterior queda suelto. Guardar y
   continuar es archivar ese objeto (systems/guardado-partida.js).
   Para no reescribir el juego entero, cada campo sigue disponible con su nombre de siempre
   (`state`, `turnNumber`, `history`…) como acceso directo a `partida.<campo>`: leerlo o
   asignarlo lee o cambia el expediente. Ningún archivo debe volver a declarar estos nombres
   con let/var (la prueba de guardado lo comprueba).
   ========================================================= */
const CAMPOS_PARTIDA = {
  // Estado del motor
  state:null, flags:null, history:null, turnNumber:0, currentCase:null, investigado:false,
  mainQueue:null, randomBag:null, usedFixed:null, usedKarma:null,
  nextBoardTurn:0, cisneNegroMostrado:false, pendingEndingResult:null,
  // Configuración elegida al empezar
  sectorActual:null, perfilActual:null, perkActual:null, legadoActivo:null,
  // Junta, metas y mandato
  metaTrimestral:null, ultimaEvaluacionMeta:null, mandatoInicial:null,
  snapshotTrimestre:{caja:0, ebitda:0},
  // Anti-repetición
  historialTitulosRecientes:[], historialOficinaReciente:[],
  // Seguimiento visual (rachas y tendencias)
  kpiHistorial:{}, rachaIndicador:{}, origenUltimoCambio:{},
  // Contadores para logros
  contadorDecisionesExtra:0, contadorInvestigaciones:0, deudaMaximaAlcanzada:0,
  rachaMetasCumplidas:0, rachaMetasCumplidasMax:0
};
// Un expediente en blanco. `conservar` trae lo que se eligió antes de empezar (sector, perfil…).
function nuevaPartida(conservar){
  const p = JSON.parse(JSON.stringify(CAMPOS_PARTIDA));
  return Object.assign(p, conservar || {});
}
let partida = nuevaPartida();
Object.keys(CAMPOS_PARTIDA).forEach(campo=>{
  Object.defineProperty(globalThis, campo, {
    get(){ return partida[campo]; },
    set(valor){ partida[campo] = valor; },
    configurable:true
  });
});
