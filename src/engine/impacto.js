/* =========================================================
   IMPACTO Y VARIABILIDAD ESTILO "REIGNS" — cada decisión pesa más,
   la misma elección no da siempre el mismo número exacto, y las
   decisiones con carga humana/económica marcada pueden generar un
   eco aleatorio varios turnos después (sin construir rutas fijas:
   el eco es uno al azar de un pool, y no siempre ocurre).
   ========================================================= */
const IMPACTO_MULTIPLICADORES = {
  caja:1.35, capitalTrabajo:1.35, deuda:1.3, ebitda:1.35, valorInventario:1.3,
  wacc:1.15, razonCorriente:1.15,
  confianzaProveedores:1.3, confianzaBanco:1.3, reputacion:1.3, moralEquipo:1.3,
  diasInventario:1.2, diasCartera:1.2
};
// Campos donde un valor NEGATIVO en realidad es una buena noticia (menos deuda, menos WACC,
// menos días de inventario o de cartera son mejoras, no daños). Todos los demás campos son
// "normales": negativo es malo, positivo es bueno.
const CAMPOS_INVERTIDOS = ['deuda', 'wacc', 'diasInventario', 'diasCartera'];
function esValorMalo(campo, valor){
  const invertido = CAMPOS_INVERTIDOS.includes(campo);
  return invertido ? valor > 0 : valor < 0;
}
function amplificarEImpredecir(efectos){
  if(!efectos) return {};
  const resultado = {};
  Object.keys(efectos).forEach(k=>{
    let v = efectos[k];
    if(typeof v !== 'number'){ resultado[k] = v; return; }
    const multBase = IMPACTO_MULTIPLICADORES[k] || 1.25;
    // No todo puede ser negativo, pero una mala decisión sí debe dolerse de verdad — el
    // descuento sobre lo negativo se moderó a 0.75 en medio/difícil. En fácil se mantiene
    // más generoso (0.55) para que un camino deliberadamente humano siga siendo sostenible,
    // no solo alcanzable de forma trágica.
    const descuentoNegativo = dificultadSeleccionada === 'facil' ? 0.55 : 0.75;
    const mult = esValorMalo(k, v) ? multBase * descuentoNegativo : multBase;
    v = v * mult;
    const jitter = 1 + (Math.random()*0.4 - 0.2); // variabilidad de ±20% sobre el valor ya amplificado
    v = v * jitter;
    resultado[k] = Math.round(v*100)/100;
  });
  return resultado;
}

const ECOS_DECISION_DURA = [
  (s,f)=>({
    tipo:'karma', titulo:"Un comentario que no esperabas",
    contexto:"Alguien del equipo menciona, sin acusarte directamente, una decisión que tomaste hace unos turnos — la que priorizó los números por encima de las personas. El comentario no es un ataque, pero se siente como un examen que no pediste.",
    choices:[
      {texto:"Reconocer abiertamente que fue una decisión difícil, sin justificarla de más.", efectos:{moralEquipo:6}, consecuencia:"La honestidad, incluso tardía, pesa más de lo que esperabas."},
      {texto:"Defender la decisión con los números que la sustentaron en su momento.", efectos:{reputacion:2, moralEquipo:-3}, consecuencia:"Los números te respaldan, pero el equipo sigue sintiendo que faltó algo más humano en esa conversación."},
      {texto:"Cambiar de tema y evitar profundizar en la conversación.", efectos:{moralEquipo:-4}, consecuencia:"El comentario queda sin resolver, y una pregunta sin responder suele pesar más que una respuesta incómoda."},
      {texto:"Compensarlo con un gesto concreto hacia el equipo, sin mencionar la decisión pasada.", efectos:{caja:-2, moralEquipo:5}, consecuencia:"No hablas del tema directamente, pero el gesto se siente como una respuesta de todas formas."}
    ]
  }),
  (s,f)=>({
    tipo:'karma', titulo:"La versión que ya circula",
    contexto:"Te enteras de que la historia de aquella decisión dura que tomaste ya circula entre el equipo — y como toda historia que pasa de boca en boca, llegó un poco más exagerada de lo que realmente fue.",
    choices:[
      {texto:"Aclarar los hechos reales en una reunión abierta con todo el equipo.", efectos:{reputacion:3, moralEquipo:2}, consecuencia:"Aclarar la versión real, aunque incómodo, corta la exageración de raíz."},
      {texto:"Dejar que la historia siga circulando sin intervenir.", efectos:{moralEquipo:-3}, consecuencia:"Sin una versión oficial, la exagerada termina siendo la que todos recuerdan."},
      {texto:"Hablarlo en privado solo con los líderes de cada área, no con todo el equipo.", efectos:{moralEquipo:1}, consecuencia:"La aclaración llega a menos gente de la que hubieras querido, pero al menos llega a quienes más influencia tienen."},
      {texto:"Usar el momento para explicar el contexto financiero completo detrás de la decisión.", efectos:{reputacion:2, moralEquipo:-1}, consecuencia:"El equipo entiende mejor el porqué, aunque entenderlo no significa que les guste más."}
    ]
  }),
  (s,f)=>({
    tipo:'karma', titulo:"El favor que ya no te deben",
    contexto:"Necesitas un favor operativo rápido de alguien del equipo — algo que normalmente se resolvía con buena voluntad. Esta vez, la respuesta es fría y estrictamente profesional. La decisión dura de hace unos turnos todavía se siente.",
    choices:[
      {texto:"Aceptar la respuesta fría y resolverlo por otra vía, sin insistir.", efectos:{ebitda:-1}, consecuencia:"Te toma más esfuerzo del que hubiera tomado antes, pero no fuerzas una relación que ya está tensa."},
      {texto:"Hablar directamente sobre la distancia que sientes desde aquella decisión.", efectos:{moralEquipo:4}, consecuencia:"La conversación incómoda abre una puerta que llevaba tiempo cerrada."},
      {texto:"Insistir apelando a la jerarquía, sin abrir la conversación de fondo.", efectos:{moralEquipo:-5}, consecuencia:"Consigues lo que necesitabas, pero la distancia entre ustedes se hace todavía más grande."},
      {texto:"Ofrecer una compensación económica puntual por el favor.", efectos:{caja:-1.5}, consecuencia:"Resuelves lo inmediato, aunque una relación de confianza rota no se arregla solo con dinero."}
    ]
  })
];

const ECOS_DECISION_GENEROSA = [
  (s,f)=>({
    tipo:'karma', titulo:"El gesto que no se olvidó",
    contexto:"El gesto que tuviste hace unos turnos — cuando priorizaste a tu gente por encima del resultado inmediato — sigue siendo mencionado en el equipo. Hoy, alguien te ofrece ayuda extra en algo que ni siquiera pediste, solo porque quiere devolver el favor.",
    choices:[
      {texto:"Aceptar la ayuda con gratitud genuina.", efectos:{moralEquipo:5, ebitda:1}, consecuencia:"La reciprocidad genuina, cuando se acepta bien, fortalece la relación todavía más."},
      {texto:"Agradecer, pero insistir en que no era necesario y rechazar la ayuda.", efectos:{moralEquipo:1}, consecuencia:"Tu gesto de no querer 'cobrar' el favor se aprecia, aunque la ayuda ofrecida se pierde."},
      {texto:"Aceptar la ayuda y usarla como base para formalizar más ese tipo de colaboración.", efectos:{ebitda:1.5, moralEquipo:3}, consecuencia:"Conviertes un gesto espontáneo en algo más estructurado y sostenible en el tiempo."},
      {texto:"Aceptar la ayuda sin decir nada especial al respecto, como algo normal entre colegas.", efectos:{ebitda:0.8}, consecuencia:"Resuelve lo práctico, aunque el momento humano de reconocerlo explícitamente se pierde un poco."}
    ]
  }),
  (s,f)=>({
    tipo:'karma', titulo:"Alguien lo cuenta por ahí",
    contexto:"Un excompañero que se fue hace meses menciona en una conversación externa lo bien que lo trataste en aquella decisión donde priorizaste a la gente sobre el balance. El comentario, sin que lo busques, te llega como una buena recomendación silenciosa.",
    choices:[
      {texto:"Dejar que el comentario se difunda de forma orgánica, sin promoverlo activamente.", efectos:{reputacion:3}, consecuencia:"La reputación que se construye sin buscarla suele ser la más creíble."},
      {texto:"Aprovechar el momento para pedirle una recomendación formal en redes profesionales.", efectos:{reputacion:4, caja:-0.3}, consecuencia:"Conviertes el comentario espontáneo en algo más permanente y visible."},
      {texto:"Contactarlo solo para agradecerle el gesto, sin pedir nada más.", efectos:{reputacion:1, moralEquipo:2}, consecuencia:"Un gesto simple que refuerza, puertas afuera y adentro, el tipo de empresa que estás construyendo."},
      {texto:"No hacer nada al respecto — dejar que las cosas sigan su curso natural.", efectos:{reputacion:1}, consecuencia:"El beneficio ya está hecho de todas formas, aunque no lo capitalizas tanto como pudiste haberlo hecho."}
    ]
  }),
  (s,f)=>({
    tipo:'karma', titulo:"Te lo regresan cuando menos lo esperas",
    contexto:"Necesitas ayuda urgente en un tema fuera de lo habitual, y es justamente la persona a la que ayudaste hace unos turnos quien se ofrece de inmediato, sin que tengas que pedirlo dos veces.",
    choices:[
      {texto:"Aceptar la ayuda y confiarle una responsabilidad mayor de la que tenía antes.", efectos:{ebitda:1.5, moralEquipo:4}, consecuencia:"La confianza recíproca, bien correspondida, suele rendir más de lo esperado."},
      {texto:"Aceptar la ayuda puntual, sin cambiar nada en su rol habitual.", efectos:{ebitda:1}, consecuencia:"Resuelves el problema inmediato, aunque no capitalizas del todo el momento de confianza mutua."},
      {texto:"Agradecer con un reconocimiento público frente al resto del equipo.", efectos:{moralEquipo:5}, consecuencia:"El reconocimiento público de un gesto así inspira a que otros actúen igual la próxima vez."},
      {texto:"Compensarlo económicamente además del agradecimiento verbal.", efectos:{caja:-1, moralEquipo:3}, consecuencia:"El gesto se aprecia, aunque para esta persona probablemente el reconocimiento importaba más que el dinero."}
    ]
  })
];

// Detecta si una decisión tuvo una carga humana/económica marcada, y si es así, probabilísticamente
// programa un eco aleatorio (no siempre el mismo, no siempre ocurre) unos turnos más adelante.
function evaluarEcoDeDecision(efectos){
  if(!efectos) return;
  const sacrificioEconomico = (efectos.caja||0) < -1.5 || (efectos.ebitda||0) < -1;
  const beneficioHumano = (efectos.moralEquipo||0) > 3 || (efectos.reputacion||0) > 3;
  const sacrificioHumano = (efectos.moralEquipo||0) < -3 || (efectos.reputacion||0) < -3;
  const beneficioEconomico = (efectos.caja||0) > 1.5 || (efectos.ebitda||0) > 1;

  let pool = null;
  if(sacrificioHumano && beneficioEconomico && !beneficioHumano){
    pool = ECOS_DECISION_DURA;
  } else if(sacrificioEconomico && beneficioHumano && !sacrificioHumano){
    pool = ECOS_DECISION_GENEROSA;
  }
  if(!pool) return;

  if(Math.random() < 0.4){
    const turnosDelay = 3 + Math.floor(Math.random()*4); // entre 3 y 6 turnos despues
    state.scheduledEvents.push({turno: turnNumber + turnosDelay, build: pick(pool), consumido:false});
  }
}

// Umbrales y magnitud de los "medidores de doble filo" (inspirado en Reigns): un indicador
// relacional demasiado ALTO también tiene costo real, no solo demasiado bajo. No hace falta
// llegar a 100 — el umbral se acerca según la dificultad, y en Difícil golpea más fuerte.
// La dificultad elegida ya no influye aqui — su unico rol en el juego es la variabilidad
// inicial de los indicadores (ver aplicarDificultadYVariabilidad). El umbral y la intensidad
// del "doble filo" son ahora fijos, iguales para cualquier nivel de dificultad.
const UMBRAL_TECHO_FIJO = 90;
const INTENSIDAD_TECHO_FIJA = 1;
function umbralTechoActual(){
  return UMBRAL_TECHO_FIJO;
}
function intensidadTechoActual(){
  return INTENSIDAD_TECHO_FIJA;
}

