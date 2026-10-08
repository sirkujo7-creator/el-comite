function healthScore(s){
  return (s.caja||0) + (s.capitalTrabajo||0)*0.5 + (s.ebitda||0)*2 - (s.deuda||0)*0.5 - (s.wacc||0)*1.5 + (s.reputacion||0)*0.3;
}

const DIFICULTADES = [
  {id:'facil', nombre:'Fácil', descripcion:'Arrancas con más caja, menos deuda y mejores relaciones. Ideal para conocer el juego sin tanta presión inicial.'},
  {id:'medio', nombre:'Medio', descripcion:'Las condiciones estándar del sector, tal como fueron diseñadas.'},
  {id:'dificil', nombre:'Difícil', descripcion:'Arrancas con menos caja, más deuda y relaciones más tensas. Cada decisión pesa más desde el primer turno.'}
];
let dificultadSeleccionada = 'medio';

const DIFICULTAD_MODIFICADORES = {
  facil:   { caja:1.25, capitalTrabajo:1.15, deuda:0.75, ebitda:1.15, wacc:-1.5, razonCorriente:0.15,
             confianzaProveedores:8, confianzaBanco:8, reputacion:5, moralEquipo:5 },
  medio:   { caja:1, capitalTrabajo:1, deuda:1, ebitda:1, wacc:0, razonCorriente:0,
             confianzaProveedores:0, confianzaBanco:0, reputacion:0, moralEquipo:0 },
  dificil: { caja:0.8, capitalTrabajo:0.88, deuda:1.3, ebitda:0.85, wacc:1.8, razonCorriente:-0.15,
             confianzaProveedores:-8, confianzaBanco:-8, reputacion:-6, moralEquipo:-6 }
};
const KPI_CAMPOS_MULTIPLICATIVOS = ['caja','capitalTrabajo','deuda','ebitda','valorInventario'];
const KPI_CAMPOS_ADITIVOS = ['wacc','razonCorriente','confianzaProveedores','confianzaBanco','reputacion','moralEquipo'];

// Aplica el nivel de dificultad elegido MÁS una variabilidad aleatoria de hasta ±8% sobre
// cada indicador — así ni siquiera repetir la misma empresa con la misma dificultad
// arranca dos veces con exactamente los mismos números.
function aplicarDificultadYVariabilidad(base, dificultad){
  const mod = DIFICULTAD_MODIFICADORES[dificultad] || DIFICULTAD_MODIFICADORES.medio;
  const resultado = {};
  Object.keys(base).forEach(k=>{
    let v = base[k];
    if(v == null){ resultado[k] = v; return; }
    if(typeof v !== 'number'){ resultado[k] = v; return; }
    if(KPI_CAMPOS_MULTIPLICATIVOS.includes(k) && mod[k]!=null){
      v = v * mod[k];
    } else if(KPI_CAMPOS_ADITIVOS.includes(k) && mod[k]!=null){
      v = v + mod[k];
    }
    const jitter = 1 + (Math.random()*0.16 - 0.08);
    v = v * jitter;
    resultado[k] = Math.round(v*100)/100;
  });
  if(resultado.razonCorriente!=null) resultado.razonCorriente = clamp(resultado.razonCorriente, 0.4, 3.5);
  if(resultado.wacc!=null) resultado.wacc = clamp(resultado.wacc, 6, 25);
  ['confianzaProveedores','confianzaBanco','reputacion','moralEquipo'].forEach(k=>{
    if(resultado[k]!=null) resultado[k] = clamp(resultado[k], 10, 95);
  });
  if(resultado.caja!=null) resultado.caja = Math.max(5, resultado.caja);
  if(resultado.deuda!=null) resultado.deuda = Math.max(0, resultado.deuda);
  if(resultado.diasInventario!=null) resultado.diasInventario = Math.max(1, Math.round(resultado.diasInventario));
  if(resultado.diasCartera!=null) resultado.diasCartera = Math.max(1, Math.round(resultado.diasCartera));
  return resultado;
}

function initState(){
  const base = JSON.parse(JSON.stringify(sectorActual.kpiInicial));
  const ajustado = aplicarDificultadYVariabilidad(base, dificultadSeleccionada);
  if(perfilActual && perfilActual.bonus){
    Object.keys(perfilActual.bonus).forEach(k=>{ ajustado[k] = (ajustado[k]||0) + perfilActual.bonus[k]; });
  }
  if(perkActual && perkActual.bonus){
    Object.keys(perkActual.bonus).forEach(k=>{ ajustado[k] = (ajustado[k]||0) + perkActual.bonus[k]; });
  }
  const legado = legadosEmpresariales[sectorActual.id];
  legadoActivo = (legado && !legado.quebrada && legado.estadoHeredado) ? legado : null;
  if(legadoActivo){
    Object.keys(legadoActivo.estadoHeredado).forEach(k=>{
      if(ajustado[k]!=null) ajustado[k] = legadoActivo.estadoHeredado[k];
    });
  }
  state = Object.assign({obligaciones:[], scheduledEvents:[], turnosSinCapex:0, healthHistory:[]}, ajustado);
  flags = {};
  history = [];
  turnNumber = 0;
  investigado = false;
  usedFixed = {turno4:false, turno8:false};
  usedKarma = {};
  randomBag = [];
  mainQueue = shuffle(sectorActual.cases.slice());
  nextBoardTurn = 5;
  cisneNegroMostrado = false;
  historialOficinaReciente = [];
  kpiHistorial = {};
  rachaIndicador = {};
  contadorDecisionesExtra = 0;
  contadorInvestigaciones = 0;
  deudaMaximaAlcanzada = sectorActual.kpiInicial.deuda;
  rachaMetasCumplidas = 0;
  rachaMetasCumplidasMax = 0;
  generarNuevaMeta();
  elegirMandatoInicial();
  actualizarHistorialYRachas(); // primer punto del historial, desde el turno 1
}

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

let systemicNotes = [];
