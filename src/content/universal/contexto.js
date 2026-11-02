/* =========================================================================================
   CONTEXTO DE LA EMPRESA — para casos cuyas opciones rinden distinto según la situación
   (nov. 2026, dificultad por decisiones: "ninguna opción es la mejor siempre; hay que leer
   el tablero"). Cada caso construido con (s, f) puede preguntar aquí cómo está la empresa y
   ajustar efectos y consecuencias. Umbrales alineados con los colores del tablero.
   ========================================================================================= */
const CONTEXTO = {
  // Caja justa o razón corriente floja: proteger liquidez vale más; apostar duele más.
  liquidezBaja: (s)=> s.razonCorriente < 1.15 || s.caja < 12,
  // Holgura real: el costo de oportunidad de quedarse quieto es mayor.
  liquidezHolgada: (s)=> s.razonCorriente >= 1.6 && s.caja >= 30,
  // Deuda alta frente a lo que genera la operación: el crédito sale más caro.
  apalancado: (s)=> s.deuda >= 32 || s.deuda / Math.max(1, s.ebitda) >= 3.2,
  // El banco confía: mejores condiciones, pero traicionarlo cuesta más.
  bancoAmigo: (s)=> s.confianzaBanco >= 65,
  // Equipo agotado: la ejecución falla justo cuando más depende de la gente.
  equipoCansado: (s)=> s.moralEquipo != null && s.moralEquipo < 50,
  // Proveedores con dudas: cualquier jugada que los presione se devuelve.
  proveedoresTensos: (s)=> s.confianzaProveedores < 55,
  // La junta ya duda de ti: los socios y los escándalos pesan doble.
  juntaDesconfia: (s)=> s.reputacion < 50,
  // Reputación sólida: abre puertas y mejora términos.
  reputacionAlta: (s)=> s.reputacion >= 65,
  // Equipos sin mantenimiento hace dos turnos o más (Vita Fit, Ganadería).
  equiposGastados: (s)=> (s.turnosSinCapex || 0) >= 2,
  // Inventario que rota lento: 30 % más días que al empezar (cada sector tiene su nivel normal),
  // o el umbral de alerta propio del sector (Ganadería). Nunca por encima de 90: a los 100 días
  // la partida se pierde por inventario obsoleto (engine/finales.js).
  inventarioPesado: (s)=> {
    if(s.diasInventario == null) return false;
    const sec = (typeof sectorActual !== 'undefined' && sectorActual) || null;
    const alerta = sec && sec.umbrales && sec.umbrales.diasInventario && sec.umbrales.diasInventario.alerta;
    const base = (sec && sec.kpiInicial.diasInventario) || 50;
    return s.diasInventario >= (alerta || Math.min(base * 1.3, 90));
  },
  // Cartera lenta: los clientes tardan en pagar.
  carteraLenta: (s)=> s.diasCartera != null && s.diasCartera >= 60
};
// Elige entre dos versiones según una condición: si(cond, siSe cumple, si no).
function si(cond, a, b){ return cond ? a : b; }
