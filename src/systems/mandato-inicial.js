/* =========================================================================================
   MANDATO INICIAL — a diferencia de la meta trimestral (que rota cada 5 turnos según lo que
   esté en alerta), el mandato es UNA sola misión fijada al arrancar la partida, para el año
   fiscal completo. Convierte cada partida en una misión concreta desde el turno 1, no solo
   en un sandbox de supervivencia.
   ========================================================================================= */
let mandatoInicial = null;
const MANDATOS_INICIALES = [
  { id:'crecimiento', titulo:'Crecimiento agresivo',
    desc:'La junta espera que multipliques el valor de la empresa por al menos 2 antes de que termine el año fiscal.',
    cumplido:()=>{
      const val = state.ebitda*4 - state.deuda;
      const ini = sectorActual.kpiInicial.ebitda*4 - sectorActual.kpiInicial.deuda;
      return ini > 0 ? (val/ini) >= 2 : val > 0;
    }},
  { id:'sinSacrificios', titulo:'Cero sacrificios humanos',
    desc:'La junta quiere ver que puedes crecer sin sacrificar a tu gente — termina el año con la moral de tu equipo genuinamente alta.',
    cumplido:()=> state.moralEquipo!=null && state.moralEquipo >= 65 },
  { id:'independencia', titulo:'Independencia financiera',
    desc:'La junta quiere una empresa que no dependa de deuda para sostenerse — termina el año fiscal casi libre de endeudamiento.',
    cumplido:()=> state.deuda <= 5 },
  { id:'reputacion', titulo:'Reputación intachable',
    desc:'La junta quiere que tu gestión sea intachable ante cualquiera que la revise — termina el año con una reputación sobresaliente.',
    cumplido:()=> state.reputacion!=null && state.reputacion >= 80 }
];
function elegirMandatoInicial(){
  mandatoInicial = MANDATOS_INICIALES[Math.floor(Math.random()*MANDATOS_INICIALES.length)];
}

