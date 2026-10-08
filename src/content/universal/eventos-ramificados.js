/* =========================================================
   EVENTOS RAMIFICADOS COMPARTIDOS
   ========================================================= */
function eventoAuditoriaExterna(s, f){
  return {
    tipo:'karma',
    titulo:"El banco pide una auditoría externa",
    contexto:"Como parte de una revisión rutinaria de tu línea de crédito, el banco exige una auditoría externa de los estados financieros que ajustaste hace unos turnos.",
    choices:[
      {texto:"Colaborar totalmente y esperar el resultado de la auditoría.", efectos:{confianzaBanco:-30, caja:-8, wacc:3, reputacion:-8},
       consecuencia:"La auditoría detecta las inconsistencias. El banco no cancela el crédito, pero lo reclasifica como de mayor riesgo: tu costo de capital sube de forma permanente."},
      {texto:"Contratar apresuradamente a otro contador para 'corregir' los registros antes de la visita.", efectos:{caja:-6, confianzaBanco:-40, wacc:4, reputacion:-15},
       consecuencia:"El intento de corrección tardía resulta más evidente que el error original. El banco pierde casi toda la confianza en tu información financiera."},
      {texto:"Confesar proactivamente el ajuste indebido antes de que la auditoría lo encuentre.", efectos:{confianzaBanco:-15, caja:-3, wacc:1, reputacion:-3},
       consecuencia:"El banco valora la transparencia tardía más que el silencio, aunque igual endurece tus condiciones."},
      {texto:"Contratar una firma externa para hacer una autoauditoría y presentarla junto con un plan de corrección.", efectos:{caja:-5, confianzaBanco:-8, wacc:0.5, reputacion:2},
       consecuencia:"Llegas con el problema ya diagnosticado y un plan propio, lo que suaviza bastante la reacción del banco frente a lo que hubiera sido un hallazgo sorpresivo."}
    ]
  };
}

function eventoHuelgaSindical(s,f){
  return {
    tipo:'karma',
    titulo:"El costo humano de los recortes",
    contexto:"Semanas después del recorte de personal, un grupo de empleados convoca una huelga parcial y un exempleado histórico te escribe una carta abierta que empieza a circular internamente: 'Di quince años de mi vida a esta empresa. Merecía algo mejor que un correo.'",
    choices:[
      {texto:"Negociar directamente con los líderes de la huelga y ceder en algunos puntos.", efectos:{caja:-4, reputacion:8, ebitda:-1},
       consecuencia:"La operación se normaliza y el gesto de sentarte a negociar en persona recompone parte del daño reputacional, a un costo real de caja y productividad."},
      {texto:"Ofrecer una liquidación adicional voluntaria a quienes se sientan afectados.", efectos:{caja:-6, reputacion:10},
       consecuencia:"Es la respuesta más costosa en caja, pero la que más credibilidad recupera frente a tu propio equipo y frente a terceros que estén observando cómo tratas a tu gente."},
      {texto:"Sostener la decisión sin cambios y esperar a que la huelga se diluya.", efectos:{ebitda:-3, reputacion:-10},
       consecuencia:"La operación se resiente varios días y la carta del exempleado sigue circulando. Sostener la postura tiene un costo que no aparece en ningún estado financiero, pero se siente."},
      {texto:"Contratar a un mediador externo para gestionar el conflicto de forma profesional.", efectos:{caja:-3, reputacion:4, ebitda:-0.5},
       consecuencia:"El mediador logra bajar la tensión sin que tengas que ceder ni sostener una postura dura tú mismo — un camino intermedio con su propio costo de honorarios."}
    ]
  };
}

