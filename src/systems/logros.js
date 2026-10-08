/* =========================================================================================
   LOGROS — a diferencia de los arquetipos (una sola etiqueta que resume el estilo general de
   la partida) o el mandato (una misión impuesta desde el inicio), los logros son un badge
   case: cualquier número de ellos puede desbloquearse en una misma partida, detectados al
   final igual que el final oculto — no se eligen antes, no cambian cómo jugás, solo
   reconocen lo que ya hiciste.
   ========================================================================================= */
let contadorDecisionesExtra = 0;
let contadorInvestigaciones = 0;
let deudaMaximaAlcanzada = 0;
let rachaMetasCumplidas = 0;
let rachaMetasCumplidasMax = 0;

const LOGROS_DEFINIDOS = [
  { id:'cero_alertas', titulo:'Cero Alertas',
    desc:'Ningún indicador tuyo llegó a necesitar una decisión de emergencia en toda la partida.',
    cumplido:()=> contadorDecisionesExtra === 0 },
  { id:'purista', titulo:'El Purista',
    desc:'Nunca pagaste por investigar un caso — cada decisión la tomaste solo con lo que el propio caso te contaba.',
    cumplido:()=> contadorInvestigaciones === 0 },
  { id:'nunca_en_deuda', titulo:'Nunca en Deuda',
    desc:'Tu endeudamiento jamás superó el nivel con el que arrancaste la partida.',
    cumplido:()=> deudaMaximaAlcanzada <= (sectorActual ? sectorActual.kpiInicial.deuda : 0) + 0.5 },
  { id:'racha_de_hierro', titulo:'Racha de Hierro',
    desc:'Cumpliste 3 o más metas trimestrales de la junta de forma consecutiva.',
    cumplido:()=> rachaMetasCumplidasMax >= 3 },
  { id:'legado_en_marcha', titulo:'Legado en Marcha',
    desc:'Esta empresa ya va por su tercera generación o más bajo tu forma de gestión.',
    cumplido:()=>{
      const legado = sectorActual ? legadosEmpresariales[sectorActual.id] : null;
      return !!(legado && !legado.quebrada && legado.generacion >= 3);
    }},
  { id:'reconstructor', titulo:'El Reconstructor',
    desc:'Resolviste con un desenlace positivo al menos 2 de las historias largas que se cruzaron en tu gestión.',
    cumplido:()=>{
      const positivos = [flags.renataLeal===true || (flags.renataRetenida===true), flags.auditoriaLimpia===true, flags.selloObtenido===true, flags.reestructuracionExitosa===true];
      return positivos.filter(Boolean).length >= 2;
    }}
];
function detectarLogros(){
  return LOGROS_DEFINIDOS.filter(l=>{ try{ return l.cumplido(); } catch(e){ return false; } });
}
