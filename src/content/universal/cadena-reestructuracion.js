/* ---------- CADENA 4: REESTRUCTURACIÓN FINANCIERA — razón corriente, deuda y WACC ---------- */
function cadenaReestructuracionEtapa2(s,f){
  if(f.reestructuracionSeria){
    return { tipo:'karma', titulo:"El diagnóstico revela el verdadero origen del problema",
      contexto:"El diagnóstico externo confirma lo que sospechabas, pero con más precisión de la que esperabas: buena parte de tu deuda está mal estructurada, concentrada en plazos demasiado cortos para el tipo de operación que tienes. La firma propone un plan concreto de reestructuración, con un costo de implementación real.",
      choices:[
        {texto:"Aprobar el plan completo de reestructuración, sin recortes.", efectos:{caja:-2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.05, 0)}, setFlags:{reestructuracionResuelta:true}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa3},
         consecuencia:"El compromiso total con el diagnóstico honesto es exactamente lo que la situación pedía."},
        {texto:"Aprobar solo la parte más urgente del plan, posponiendo el resto.", efectos:{caja:-1}, setFlags:{reestructuracionResuelta:true}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa3},
         consecuencia:"Atiendes lo más crítico primero, aunque el plan completo hubiera resuelto el problema con más solidez."},
        {texto:"Agradecer el diagnóstico, pero decidir no implementar el plan por ahora.", efectos:{wacc:0.1}, setFlags:{reestructuracionResuelta:false}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa3},
         consecuencia:"Pagaste por saber exactamente qué está mal, y decidiste no hacer nada al respecto todavía."}
      ]};
  } else {
    return { tipo:'karma', titulo:"El problema sigue sin resolverse de fondo",
      contexto:"Sin un diagnóstico externo real, la sensación de urgencia sobre tu estructura financiera solo ha crecido — sabes que algo anda mal, pero no exactamente qué, ni cómo priorizarlo. La firma de reestructuración vuelve a insistir, esta vez con un descuento en su tarifa.",
      choices:[
        {texto:"Aceptar esta vez, ante la oferta con descuento.", efectos:{caja:-2}, setFlags:{reestructuracionResuelta:true}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa3},
         consecuencia:"Tarde, pero a tiempo — el descuento hace que valga la pena lo que antes pareció un gasto evitable."},
        {texto:"Intentar resolverlo con ajustes internos, sin ayuda externa.", efectos:{wacc:0.15}, setFlags:{reestructuracionResuelta:false}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa3},
         consecuencia:"Sin un diagnóstico certero, los ajustes internos atacan síntomas, no necesariamente la causa real."},
        {texto:"Consultar con tu banco directamente sobre cómo mejorar tu estructura.", efectos:{confianzaBanco:2}, setFlags:{reestructuracionResuelta:false}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa3},
         consecuencia:"El banco te da una perspectiva útil, aunque con un interés propio en el consejo que te ofrece."}
      ]};
  }
}
function cadenaReestructuracionEtapa3(s,f){
  if(f.reestructuracionResuelta){
    flags.reestructuracionExitosa = true;
    return { tipo:'karma', titulo:"Tu estructura financiera queda genuinamente saneada",
      contexto:"La reestructuración se completa. Tu deuda ahora está distribuida en plazos que realmente corresponden a tu operación, y tu liquidez de corto plazo deja de estar bajo presión constante. No es un cambio dramático en el papel de un solo turno, pero es un cambio real y sostenido.",
      choices:[
        {texto:"Usar la nueva solidez financiera para negociar mejores condiciones con proveedores.", efectos:{confianzaProveedores:3, razonCorriente:0.15}, consecuencia:"La solidez financiera real, bien comunicada, abre puertas comerciales que antes costaban más esfuerzo."},
        {texto:"Comunicar el saneamiento financiero a tu junta y grupos de interés.", efectos:{reputacion:3, razonCorriente:0.1}, consecuencia:"La transparencia sobre haber resuelto un problema real construye más credibilidad de la que habría generado ocultarlo."},
        {texto:"Aprovechar la nueva holgura para invertir en algo que llevabas tiempo posponiendo.", efectos:{ebitda:1.5, razonCorriente:0.05}, consecuencia:"La liquidez recuperada, bien canalizada, empieza a generar valor real más allá de solo verse bien en el balance."}
      ]};
  } else {
    flags.reestructuracionFallida = true;
    return { tipo:'karma', titulo:"La estructura financiera sigue exactamente igual de tensa",
      contexto:"Pasan los meses y la estructura financiera que tanto te preocupaba nunca se corrigió de fondo. No hubo una crisis puntual que lo forzara — solo la acumulación silenciosa de una decisión postergada una y otra vez, hasta que se volvió, simplemente, cómo son las cosas ahora.",
      choices:[
        {texto:"Aceptar que este va a ser tu nivel de riesgo estructural de ahora en adelante.", efectos:{wacc:0.3}, consecuencia:"Resignarte a vivir con el problema no lo resuelve, pero al menos deja de sorprenderte cada vez que aparece."},
        {texto:"Intentar, una vez más, resolverlo con recursos internos limitados.", efectos:{caja:-1, wacc:0.1}, consecuencia:"El esfuerzo tardío ayuda un poco, aunque sin el diagnóstico correcto, sigue siendo un intento a ciegas."},
        {texto:"Buscar refinanciar con otro banco, esperando mejores condiciones.", efectos:{confianzaBanco:-2, wacc:0.15}, consecuencia:"Cambiar de banco sin resolver el problema de fondo solo traslada la misma tensión a una relación nueva."}
      ]};
  }
}

const CADENAS_PROFUNDAS = [
  { id:'cadena_renata', trigger:(s,f)=> s.moralEquipo!=null && s.moralEquipo <= 40,
    build:(s,f)=>({
      tipo:'karma', titulo:"Renata Cifuentes pide una reunión seria",
      contexto:"Renata Cifuentes, tu mejor gerente de operaciones, pide hablar contigo con un tono que nunca le habías escuchado. Está agotada, dice sin rodeos, y necesita saber si hay un compromiso real de la empresa con su bienestar — o si debería empezar a buscar en otro lado.",
      choices:[
        {texto:"Comprometerte de forma concreta: menos carga, más reconocimiento, seguimiento real.", efectos:{caja:-1, moralEquipo:si(CONTEXTO.equipoCansado(s), 6, 4)}, setFlags:{renataComprometido:true}, disparar:{turnos:4, evento:cadenaRenataEtapa2},
         consecuencia:"El compromiso concreto, no solo verbal, es exactamente lo que Renata necesitaba escuchar."},
        {texto:"Decirle que valoras su trabajo, sin comprometerte a cambios concretos.", efectos:{moralEquipo:-1}, setFlags:{renataComprometido:false}, disparar:{turnos:4, evento:cadenaRenataEtapa2},
         consecuencia:"Las palabras de aprecio, sin ningún cambio real detrás, no parecen haber sido suficientes."},
        {texto:"Ofrecerle un aumento salarial como respuesta principal.", efectos:{caja:-2, moralEquipo:1}, setFlags:{renataComprometido:false}, disparar:{turnos:4, evento:cadenaRenataEtapa2},
         consecuencia:"El dinero ayuda, pero Renata deja claro que no era exactamente eso lo que estaba pidiendo."}
      ]
    })
  },
  { id:'cadena_auditoria', trigger:(s,f)=> s.deuda >= 30 || s.wacc >= 18,
    build:(s,f)=>({
      tipo:'karma', titulo:"Inicia una revisión fiscal preventiva",
      contexto:"La autoridad tributaria notifica el inicio de una revisión preventiva de tus estados financieros — rutinaria, dicen, aunque el nivel de detalle solicitado no se siente tan rutinario. Tienes que decidir cómo vas a responder desde el primer momento.",
      choices:[
        {texto:"Cooperar por completo, entregando toda la documentación solicitada sin demoras.", efectos:{caja:-0.5}, setFlags:{auditoriaCooperativo:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa2},
         consecuencia:"La cooperación desde el primer momento suele ser la señal que más tranquiliza a cualquier auditor."},
        {texto:"Cooperar solo con lo estrictamente exigido, sin ir más allá.", efectos:{confianzaBanco:-0.5}, setFlags:{auditoriaCooperativo:false}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa2},
         consecuencia:"Es tu derecho, aunque una postura tan mínima a veces genera más preguntas de las que evita."},
        {texto:"Contratar de inmediato asesoría tributaria especializada para manejar el proceso.", efectos:{caja:-2}, setFlags:{auditoriaCooperativo:true}, disparar:{turnos:4, evento:cadenaAuditoriaEtapa2},
         consecuencia:"El gasto anticipado en asesoría experta suele pagarse solo, en procesos como este."}
      ]
    })
  },
  { id:'cadena_sello', trigger:(s,f)=> s.reputacion >= 65,
    build:(s,f)=>({
      tipo:'karma', titulo:"Una fundación te invita a certificarte como empresa socialmente responsable",
      contexto:"Una fundación reconocida en temas de responsabilidad empresarial te invita a postular a su sello de certificación — un reconocimiento que se toma en serio, con verificación real de las iniciativas que se declaran, no solo un logo más para la página web.",
      choices:[
        {texto:"Postular con un compromiso genuino: iniciativas reales, medibles, sostenidas en el tiempo.", efectos:{caja:-1.5}, setFlags:{selloGenuino:true}, disparar:{turnos:4, evento:cadenaSelloEtapa2},
         consecuencia:"El compromiso real, aunque cuesta más desde el principio, es la única base sólida para un sello que se verifica de verdad."},
        {texto:"Postular destacando principalmente lo que ya haces, sin comprometerte a más.", efectos:{reputacion:0.5}, setFlags:{selloGenuino:false}, disparar:{turnos:4, evento:cadenaSelloEtapa2},
         consecuencia:"Es una postulación honesta en lo que dice, aunque quizás no alcance el nivel de compromiso que la fundación espera verificar."},
        {texto:"Declinar la invitación por ahora, prefiriendo construir una base más sólida primero.", efectos:{reputacion:-0.3}, setFlags:{selloGenuino:true}, disparar:{turnos:4, evento:cadenaSelloEtapa2},
         consecuencia:"La prudencia de no postular a medias, aunque implique esperar, suele ser la decisión que mejor envejece."}
      ]
    })
  },
  { id:'cadena_reestructuracion', trigger:(s,f)=> (s.razonCorriente!=null && s.razonCorriente < 1.5) || s.deuda >= 26,
    build:(s,f)=>({
      tipo:'karma', titulo:"Una banca de inversión boutique detecta tu estructura financiera",
      contexto:"Una firma pequeña, especializada en reestructuraciones, te contacta directamente — notaron, por tus reportes públicos, que tu estructura de capital está tensa: mucha deuda de corto plazo, poca holgura de liquidez real. Ofrecen diseñar un plan de reestructuración integral, a cambio de un fee por el diagnóstico.",
      choices:[
        {texto:"Contratarlos para un diagnóstico completo y honesto, aunque cueste.", efectos:{caja:-3, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.08, 0)}, setFlags:{reestructuracionSeria:true}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa2},
         consecuencia:"El costo es real, pero un diagnóstico externo honesto vale más que seguir adivinando por tu cuenta."},
        {texto:"Rechazar la oferta y manejar la estructura financiera internamente.", efectos:{wacc:0.2}, setFlags:{reestructuracionSeria:false}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa2},
         consecuencia:"Ahorras el fee de la firma externa, aunque sin un diagnóstico honesto el problema de fondo sigue sin nombre."},
        {texto:"Pedir una propuesta preliminar sin costo antes de comprometer nada.", efectos:{caja:-0.3}, setFlags:{reestructuracionSeria:true}, disparar:{turnos:4, evento:cadenaReestructuracionEtapa2},
         consecuencia:"Una entrada más cautelosa, que igual te da una primera mirada externa real a tu situación."}
      ]
    })
  }
];

