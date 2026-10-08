/* =========================================================================================
   3 CADENAS PROFUNDAS DE 3 ETAPAS — a diferencia del eco genérico (que resuelve en una sola
   consecuencia y se cierra) y del elenco (arcos fijos de 2 etapas), estas 3 historias
   escalan en tres actos y su desenlace final deja una marca MECÁNICA permanente en el resto
   de la partida — no solo una línea de texto — más el peso simbólico de una cadena completa.
   ========================================================================================= */

/* ---------- CADENA 1: RENATA CIFUENTES — retención de talento clave ---------- */
function cadenaRenataEtapa2(s,f){
  if(f.renataComprometido){
    return { tipo:'karma', titulo:"Renata Cifuentes recibe una oferta de la competencia",
      contexto:"Renata Cifuentes, tu mejor gerente de operaciones, te cuenta —con la confianza que reconstruyeron hace unos turnos— que un competidor le hizo una oferta salarial notablemente mayor. No vino a renunciar, dice; vino a ser honesta contigo primero.",
      choices:[
        {texto:"Igualar la oferta y reafirmar tu compromiso con ella de forma concreta.", efectos:{caja:-3, moralEquipo:2}, setFlags:{renataRetenida:true}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"El gesto, sostenido en el tiempo desde la última conversación, confirma que el compromiso de entonces no era solo palabras."},
        {texto:"Agradecerle la honestidad, sin poder igualar la oferta económica.", efectos:{moralEquipo:1}, setFlags:{renataRetenida:false}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"Renata aprecia la honestidad de vuelta, aunque la diferencia salarial sigue siendo real."},
        {texto:"Ofrecerle una contraoferta no económica: más autonomía y un rol ampliado.", efectos:{moralEquipo:3, ebitda:-0.5}, setFlags:{renataRetenida:true}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"Para alguien como Renata, el reconocimiento real del rol pesa tanto o más que el número en la oferta — aunque redistribuir responsabilidades toma tiempo de ajuste que se nota en la operación."},
        {texto:"Decirle que entiendes si decide irse, sin presionarla de ninguna forma.", efectos:{moralEquipo:-1}, setFlags:{renataRetenida:false}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"El respeto por su decisión es genuino, aunque no cambia el resultado más probable."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Renata Cifuentes ya está entrevistando en otro lado",
      contexto:"Te enteras, no por ella sino por un tercero, que Renata Cifuentes ya está en proceso de entrevistas con al menos dos competidores. Desde la conversación de hace unos turnos —la que no llegó a ningún compromiso real— no ha vuelto a mencionar el tema contigo directamente.",
      choices:[
        {texto:"Hablar con ella de frente, reconociendo que debiste comprometerte antes.", efectos:{caja:-2, moralEquipo:3}, setFlags:{renataRetenida:true}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"Llegar tarde no es lo mismo que no llegar — la honestidad tardía todavía puede cambiar el desenlace."},
        {texto:"Esperar a que ella misma traiga el tema, sin intervenir primero.", efectos:{moralEquipo:-1.5}, setFlags:{renataRetenida:false}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"El silencio, en un momento así, se interpreta como una respuesta en sí misma."},
        {texto:"Ofrecerle de inmediato una mejora salarial preventiva, sin esperar una oferta formal.", efectos:{caja:-3}, setFlags:{renataRetenida:true}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"El gesto proactivo, aunque tardío, todavía cuenta como una señal real de que te importa retenerla."},
        {texto:"Empezar a preparar, en silencio, un plan de sucesión para su cargo.", efectos:{caja:-1}, setFlags:{renataRetenida:false}, disparar:{turnos:4, evento:cadenaRenataEtapa3},
         consecuencia:"Te cubres ante lo que parece inevitable, aunque prepararte para perderla no es lo mismo que intentar evitarlo."}
      ]};
  }
}
function cadenaRenataEtapa3(s,f){
  if(f.renataRetenida){
    return { tipo:'karma', titulo:"Renata Cifuentes decide quedarse",
      contexto:"Renata Cifuentes te confirma su decisión: se queda. No fue solo el dinero, dice —fue sentir que, cuando importó de verdad, la empresa respondió. Se compromete a quedarse al menos los próximos años, y ya está pensando en a quién formar como su propio relevo algún día.",
      choices:[
        {texto:"Celebrarlo con el equipo y darle un rol formal de mentoría interna.", efectos:{moralEquipo:6, ebitda:1}, consecuencia:"Renata, ahora formando a otros, multiplica el valor de haberla retenido mucho más allá de su propio cargo."},
        {texto:"Seguir adelante sin mayor ceremonia, aliviado de que se quedó.", efectos:{moralEquipo:2, ebitda:1}, consecuencia:"El resultado es el mismo, aunque el momento de reconocerlo abiertamente se pierde un poco."},
        {texto:"Aprovechar su compromiso renovado para delegarle un proyecto estratégico grande.", efectos:{ebitda:2, moralEquipo:1}, consecuencia:"La confianza recién reafirmada rinde frutos concretos casi de inmediato."},
        {texto:"Preguntarle abiertamente qué más necesitaría para sentirse así de comprometida siempre.", efectos:{moralEquipo:4}, consecuencia:"La pregunta, poco común viniendo de un jefe, profundiza la lealtad todavía más."}
      ]};
  } else {
    flags.renataSeFue = true;
    return { tipo:'karma', titulo:"Renata Cifuentes se va",
      contexto:"Renata Cifuentes renuncia formalmente. Se va en buenos términos, sin drama, pero se va — y con ella, años de conocimiento operativo que no se transfieren de un día para otro. El equipo lo siente de inmediato, incluso antes de que se le nombre reemplazo.",
      choices:[
        {texto:"Iniciar de inmediato la búsqueda de un reemplazo externo senior.", efectos:{caja:-4, ebitda:-1.5, moralEquipo:-2, reputacion:1}, consecuencia:"El costo de reemplazar años de experiencia, de golpe, resulta más alto de lo que parecía en el papel. A cambio, llega alguien con trayectoria reconocida en el sector."},
        {texto:"Promover internamente a alguien del propio equipo de Renata.", efectos:{caja:-1, ebitda:-2, moralEquipo:1}, consecuencia:"Es más barato y el equipo lo recibe mejor, aunque la curva de aprendizaje sigue siendo real."},
        {texto:"Pedirle a Renata que se quede un mes de transición para entrenar a su sucesor.", efectos:{caja:-2, ebitda:-1}, consecuencia:"Renata acepta el gesto profesional, y ese mes de transición amortigua buena parte del golpe."},
        {texto:"No hacer un plan formal de transición y asumir el golpe operativo directamente.", efectos:{ebitda:-4, moralEquipo:-3}, consecuencia:"Sin ningún plan de transición, el vacío que deja Renata se siente en toda la operación durante semanas."}
      ]};
  }
}

/* ---------- CADENA 2: REVISIÓN FISCAL PREVENTIVA — riesgo financiero y regulatorio ---------- */
function cadenaAuditoriaEtapa2(s,f){
  if(f.auditoriaCooperativo){
    return { tipo:'karma', titulo:"La revisión fiscal avanza sin sobresaltos",
      contexto:"Gracias a la cooperación total que mostraste desde el inicio, la revisión fiscal avanza sin fricciones. El auditor a cargo te comenta, informalmente, que casos como el tuyo —transparentes desde el primer día— rara vez terminan en sanciones formales.",
      choices:[
        {texto:"Aprovechar la buena relación para pedir orientación sobre futuras obligaciones.", efectos:{caja:-0.5}, setFlags:{auditoriaResuelta:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"La orientación adicional, aunque tiene un costo menor, te deja mejor preparado para el futuro."},
        {texto:"Mantener la cooperación total hasta el cierre formal del proceso.", efectos:{confianzaBanco:1, caja:-0.3}, setFlags:{auditoriaResuelta:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"La consistencia en tu postura, de principio a fin, es exactamente lo que un auditor valora más — aunque mantener ese nivel de disponibilidad tiene un costo operativo real."},
        {texto:"Empezar a relajar la cooperación, asumiendo que ya lo peor pasó.", efectos:{confianzaBanco:-1}, setFlags:{auditoriaResuelta:false}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"Bajar la guardia antes de tiempo es, paradójicamente, cuando más casos se complican sin necesidad."},
        {texto:"Contratar asesoría externa adicional, aunque el proceso ya iba bien.", efectos:{caja:-1.5}, setFlags:{auditoriaResuelta:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"Un gasto probablemente innecesario, aunque la tranquilidad adicional tiene su propio valor."}
      ]};
  } else {
    return { tipo:'karma', titulo:"La revisión fiscal se profundiza",
      contexto:"La cooperación mínima que mostraste al inicio no ayudó: el auditor decide profundizar la revisión, esta vez solicitando documentación de los últimos tres años completos, no solo del período original bajo revisión.",
      choices:[
        {texto:"Cambiar de estrategia y cooperar por completo desde ahora.", efectos:{caja:-1}, setFlags:{auditoriaResuelta:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"Nunca es tarde para corregir el rumbo — la cooperación tardía todavía cuenta a tu favor."},
        {texto:"Contratar un abogado tributarista para manejar el proceso de forma más formal.", efectos:{caja:-3}, setFlags:{auditoriaResuelta:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"La asesoría especializada ayuda a encauzar un proceso que se había puesto tenso."},
        {texto:"Mantener la misma postura mínima de antes, sin cambiar de estrategia.", efectos:{confianzaBanco:-1}, setFlags:{auditoriaResuelta:false}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"La misma actitud que generó la escalada inicial, sostenida, rara vez revierte una tendencia así."},
        {texto:"Cuestionar formalmente el alcance ampliado de la revisión.", efectos:{caja:-1, reputacion:-1}, setFlags:{auditoriaResuelta:false}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa3},
         consecuencia:"El cuestionamiento formal es tu derecho, aunque el auditor lo interpreta como una señal más de que hay algo que ocultar."}
      ]};
  }
}
function cadenaAuditoriaEtapa3(s,f){
  if(f.auditoriaResuelta){
    flags.auditoriaLimpia = true;
    return { tipo:'karma', titulo:"La revisión fiscal cierra sin ninguna sanción",
      contexto:"La revisión fiscal cierra formalmente, sin ninguna sanción ni hallazgo relevante. El certificado de cumplimiento que recibes no es solo un papel — varios bancos y clientes grandes lo piden como referencia antes de cerrar tratos importantes.",
      choices:[
        {texto:"Usar el certificado activamente como argumento comercial y de crédito.", efectos:{confianzaBanco:4, reputacion:2}, consecuencia:"El certificado, bien aprovechado, abre puertas comerciales concretas que antes costaban más esfuerzo."},
        {texto:"Archivarlo formalmente sin mayor promoción.", efectos:{confianzaBanco:2}, consecuencia:"El beneficio queda, aunque sin explotarlo del todo como una herramienta activa."},
        {texto:"Compartir la buena noticia abiertamente con todo el equipo financiero.", efectos:{moralEquipo:2, confianzaBanco:2}, consecuencia:"El equipo que vivió la tensión del proceso también merece celebrar que se cerró bien."},
        {texto:"Usarlo para renegociar mejores condiciones con tu banco actual.", efectos:{wacc:-0.3, confianzaBanco:2}, consecuencia:"El certificado limpio se convierte en una palanca de negociación real y concreta."}
      ]};
  } else {
    flags.auditoriaSancionado = true;
    return { tipo:'karma', titulo:"La revisión fiscal termina en sanción formal",
      contexto:"La revisión fiscal termina peor de lo que esperabas: una sanción formal, con una multa y —lo que más pesa a largo plazo— una marca permanente en tu historial de cumplimiento que cualquier banco o inversionista serio va a ver de ahora en adelante.",
      choices:[
        {texto:"Pagar la multa de inmediato y cerrar el capítulo cuanto antes.", efectos:{caja:-4.5}, consecuencia:"El pago inmediato cierra el proceso, aunque la marca en tu historial de cumplimiento queda de todas formas. Pagar de inmediato, eso sí, te da derecho a la reducción de la sanción que contempla la ley."},
        {texto:"Apelar formalmente la sanción, aunque tome más tiempo.", efectos:{caja:-3, reputacion:-1}, consecuencia:"La apelación puede reducir el monto final, aunque prolonga la incertidumbre y el desgaste del proceso."},
        {texto:"Aceptar la sanción y reestructurar internamente los procesos que la originaron.", efectos:{caja:-5, ebitda:1}, consecuencia:"El costo inmediato es alto, pero la reestructuración real reduce el riesgo de que algo así vuelva a pasar."},
        {texto:"Negociar un plan de pago extendido para la multa.", efectos:{caja:-2, deuda:3}, consecuencia:"Alivias la presión de caja inmediata, convirtiendo parte de la sanción en una obligación financiera más."}
      ]};
  }
}

/* ---------- CADENA 3: EL SELLO DE RESPONSABILIDAD SOCIAL — reputación e impacto ---------- */
function cadenaSelloEtapa2(s,f){
  if(f.selloGenuino){
    return { tipo:'karma', titulo:"La fundación viene a verificar en terreno",
      contexto:"La fundación que evalúa tu candidatura al sello de responsabilidad social envía a alguien a verificar en persona lo que describiste en la postulación. No es una simple visita de cortesía — quieren ver la operación real, no solo el papel.",
      choices:[
        {texto:"Darles acceso completo y sin restricciones a toda la operación.", efectos:{caja:-0.5}, setFlags:{selloAprobado:true}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"La transparencia total, cuando el compromiso ya era real, no tiene nada que esconder."},
        {texto:"Prepararles un recorrido guiado que muestre lo mejor de la operación.", efectos:{caja:-0.3}, setFlags:{selloAprobado:true}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"Un poco de preparación razonable no oculta nada —el compromiso real se sostiene incluso bajo revisión de cerca."},
        {texto:"Involucrar directamente al equipo en la visita, no solo a la gerencia.", efectos:{moralEquipo:2}, setFlags:{selloAprobado:true}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"Que el equipo mismo hable de las iniciativas, sin guion, es la evidencia más convincente que existe."},
        {texto:"Limitar la visita a lo estrictamente necesario para no interrumpir la operación.", efectos:{reputacion:0.5}, setFlags:{selloAprobado:true}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"La visita acotada es suficiente —el compromiso genuino no necesita un despliegue enorme para sostenerse."}
      ]};
  } else {
    return { tipo:'karma', titulo:"La fundación empieza a hacer preguntas incómodas",
      contexto:"La fundación que evalúa tu candidatura al sello empieza a hacer preguntas más específicas de lo esperado — piden evidencia concreta de las iniciativas que mencionaste, no solo declaraciones generales. El proceso, que parecía casi automático, se está complicando.",
      choices:[
        {texto:"Reconocer que el compromiso hasta ahora fue más de imagen que de fondo, y proponer corregirlo.", efectos:{caja:-2}, setFlags:{selloAprobado:true}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"La honestidad tardía, acompañada de una corrección real, todavía puede cambiar el resultado final."},
        {texto:"Intentar construir evidencia rápida de las iniciativas mencionadas.", efectos:{caja:-1.5}, setFlags:{selloAprobado:false}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"Improvisar evidencia a último momento rara vez convence a alguien entrenado para detectar justamente eso."},
        {texto:"Retirar la candidatura antes de que la fundación llegue a una conclusión formal.", efectos:{reputacion:-1}, setFlags:{selloAprobado:false}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"Retirarte a tiempo evita lo peor, aunque no borra la impresión que ya quedó del proceso."},
        {texto:"Insistir en que las iniciativas son reales, sin aportar evidencia adicional.", efectos:{reputacion:-1}, setFlags:{selloAprobado:false}, disparar:{turnos:4, evento:cadenaSelloEtapa3},
         consecuencia:"Sin evidencia que respalde la insistencia, la fundación tiene cada vez más claro hacia dónde se inclina su decisión."}
      ]};
  }
}
function cadenaSelloEtapa3(s,f){
  if(f.selloAprobado){
    flags.selloObtenido = true;
    return { tipo:'karma', titulo:"Obtienes el sello de responsabilidad social",
      contexto:"La fundación te otorga formalmente el sello de responsabilidad social — verificado, no solo declarado. Es un reconocimiento que pocas empresas del sector logran sostener bajo escrutinio real, y ya empiezas a notar cómo cambia la forma en que algunos clientes y socios te perciben.",
      choices:[
        {texto:"Incorporar el sello activamente en toda tu comunicación comercial.", efectos:{reputacion:5}, consecuencia:"El reconocimiento verificado, bien comunicado, se convierte en un diferenciador real frente a la competencia."},
        {texto:"Usarlo internamente como motivo de orgullo del equipo, sin gran despliegue externo.", efectos:{reputacion:2, moralEquipo:3}, consecuencia:"El orgullo interno de un logro genuino a veces vale más que la visibilidad externa."},
        {texto:"Aprovecharlo para atraer talento que valora este tipo de compromiso.", efectos:{reputacion:3, moralEquipo:2}, consecuencia:"El sello se convierte también en una herramienta de reclutamiento genuinamente efectiva."},
        {texto:"Comprometerte públicamente a mantener y ampliar las iniciativas evaluadas.", efectos:{reputacion:4, caja:-1}, consecuencia:"El compromiso público eleva las expectativas futuras, pero también consolida la credibilidad ganada."}
      ]};
  } else {
    flags.selloRechazado = true;
    return { tipo:'karma', titulo:"La fundación rechaza la candidatura públicamente",
      contexto:"La fundación no solo rechaza tu candidatura — publica, como parte de su política de transparencia, un breve comunicado explicando por qué. No te acusan de mala fe directamente, pero el mensaje es claro: lo que mostraste no se sostuvo bajo revisión real.",
      choices:[
        {texto:"Responder públicamente reconociendo las fallas y comprometiéndote a corregirlas.", efectos:{reputacion:-2, caja:-1}, consecuencia:"Reconocerlo públicamente limita el daño, aunque no lo elimina del todo."},
        {texto:"No responder públicamente y dejar que el tema pierda relevancia con el tiempo.", efectos:{reputacion:-4}, consecuencia:"Sin ninguna respuesta de tu parte, la versión de la fundación queda como la única narrativa disponible."},
        {texto:"Cuestionar públicamente los criterios de evaluación de la fundación.", efectos:{reputacion:-5, moralEquipo:1}, consecuencia:"Atacar al mensajero rara vez mejora la percepción de un problema que, en el fondo, era real. Puertas adentro, al menos, el equipo cierra filas contigo."},
        {texto:"Iniciar en privado un programa real de impacto social, sin buscar reconocimiento inmediato.", efectos:{reputacion:-2, caja:-2, moralEquipo:2}, consecuencia:"Empezar de cero, esta vez de verdad, es el camino más largo pero también el único genuinamente sólido. Y el equipo se involucra en el programa con un entusiasmo que no esperabas."}
      ]};
  }
}

