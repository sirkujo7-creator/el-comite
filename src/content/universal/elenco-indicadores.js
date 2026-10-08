const ELENCO_INDICADORES = [
  { id:'elenco_camila', trigger:(s,f)=> s.moralEquipo!=null && s.moralEquipo <= 35,
    build:(s,f)=>({
      tipo:'karma', titulo:"Camila Reyes viene a advertirte", retrato: RETRATO_CAMILA, presentacion:"La encargada de Recursos Humanos pide verte, con algo serio que decirte.",
      contexto:"Camila Reyes, la gerente de talento humano, pide verte con urgencia. La moral del equipo, dice, ya no es un tema abstracto de recursos humanos — está afectando la operación real, y quiere que lo veas de primera mano antes de que sea tarde.",
      choices:[
        {texto:"Tomarte el tiempo de escucharla a fondo y actuar según lo que proponga.", efectos:{caja:-2, moralEquipo:6}, setFlags:{camilaEscuchada:true}, disparar:{turnos:4, evento:eventoCamilaReaparece},
         consecuencia:"El gesto de priorizar la conversación, y no solo escucharla de pasada, ya empieza a notarse."},
        {texto:"Pedirle un informe escrito para revisarlo con calma más adelante.", efectos:{moralEquipo:-1}, setFlags:{camilaEscuchada:false}, disparar:{turnos:4, evento:eventoCamilaReaparece},
         consecuencia:"Camila entrega el informe, aunque la urgencia con la que vino no se sintió correspondida."},
        {texto:"Asignarle presupuesto limitado y dejar que ella resuelva como pueda.", efectos:{caja:-0.5}, setFlags:{camilaEscuchada:false}, disparar:{turnos:4, evento:eventoCamilaReaparece},
         consecuencia:"Camila hace lo que puede, aunque el recurso limitado no ataca la raíz del problema que vino a plantear."},
        {texto:"Decirle que la prioridad ahora mismo tiene que ser financiera.", efectos:{moralEquipo:-3}, setFlags:{camilaEscuchada:false}, disparar:{turnos:4, evento:eventoCamilaReaparece},
         consecuencia:"Camila lo respeta, aunque se va con la sensación de que la advertencia no llegó a donde tenía que llegar."}
      ]
    })
  },
  { id:'elenco_jairo', trigger:(s,f)=> s.confianzaBanco <= 32,
    build:(s,f)=>({
      tipo:'karma', titulo:"Jairo Cepeda llama con preocupación", retrato: RETRATO_JAIRO, presentacion:"Tu banquero de toda la vida llama personalmente, algo que no hace por cualquier cosa.",
      contexto:"Jairo Cepeda, tu banquero de siempre, te llama en un tono distinto al habitual — más formal, más cauteloso. El comité de crédito del banco empezó a hacer preguntas sobre tu cuenta, y él, hasta donde puede, quiere ayudarte a estar preparado.",
      choices:[
        {texto:"Prepararle un informe financiero completo y transparente de inmediato.", efectos:{caja:-1, confianzaBanco:6}, setFlags:{jairoTranquilizado:true}, disparar:{turnos:4, evento:eventoJairoReaparece},
         consecuencia:"La transparencia proactiva, justo cuando el banco empieza a dudar, es exactamente lo que Jairo necesitaba mostrar internamente."},
        {texto:"Restarle importancia a la llamada, confiando en que se resuelva solo.", efectos:{confianzaBanco:-3}, setFlags:{jairoTranquilizado:false}, disparar:{turnos:4, evento:eventoJairoReaparece},
         consecuencia:"Sin ninguna señal de tu parte, el comité de crédito interpreta el silencio de la peor manera posible."},
        {texto:"Pedirle a Jairo consejo directo sobre qué necesita ver el comité.", efectos:{confianzaBanco:2}, setFlags:{jairoTranquilizado:true}, disparar:{turnos:4, evento:eventoJairoReaparece},
         consecuencia:"Jairo, agradecido de que le preguntes en vez de solo reaccionar, te da una guía clara de qué mostrar."},
        {texto:"Buscar de inmediato otras alternativas bancarias, por si acaso.", efectos:{confianzaBanco:-2}, setFlags:{jairoTranquilizado:false}, disparar:{turnos:4, evento:eventoJairoReaparece},
         consecuencia:"Te cubres ante el peor escenario, aunque el banco actual lo interpreta como una señal de desconfianza mutua."}
      ]
    })
  },
  { id:'elenco_aurelio', trigger:(s,f)=> sectorActual.requiereCapex && (s.turnosSinCapex||0) >= 2,
    build:(s,f)=>({
      tipo:'karma', titulo:"El ingeniero Aurelio Solano pide una reunión urgente", retrato: RETRATO_AURELIO, presentacion:"El encargado de mantenimiento y operaciones pide verte, algo poco común en él.",
      contexto:"El ingeniero Aurelio Solano, encargado de mantenimiento y operaciones, pide verte — algo poco común en alguien que prefiere resolver todo en el taller, no en una oficina. Lleva semanas viendo señales de desgaste que, según él, ya no se pueden seguir postergando.",
      choices:[
        {texto:"Autorizar la inversión en mantenimiento que Aurelio está pidiendo.", efectos:{caja:-4}, capex:true, setFlags:{aurelioAtendido:true}, disparar:{turnos:4, evento:eventoAurelioReaparece},
         consecuencia:"El gasto no estaba en el plan de este turno, pero Aurelio se va notablemente más tranquilo."},
        {texto:"Pedirle que priorice solo lo más urgente, con un presupuesto acotado.", efectos:{caja:-2}, setFlags:{aurelioAtendido:true}, disparar:{turnos:4, evento:eventoAurelioReaparece},
         consecuencia:"Una solución intermedia que Aurelio acepta, aunque deja claro que no cubre todo lo que identificó."},
        {texto:"Decirle que, por ahora, no hay presupuesto disponible para esto.", efectos:{moralEquipo:-1}, setFlags:{aurelioAtendido:false}, disparar:{turnos:4, evento:eventoAurelioReaparece},
         consecuencia:"Aurelio insiste una vez más antes de irse, dejando claro que el riesgo sigue exactamente donde estaba."},
        {texto:"Pedirle un informe técnico detallado antes de comprometer cualquier gasto.", efectos:{caja:-0.3}, setFlags:{aurelioAtendido:false}, disparar:{turnos:4, evento:eventoAurelioReaparece},
         consecuencia:"Ganas información más precisa, aunque el tiempo que toma prepararla es tiempo que el desgaste no espera."}
      ]
    })
  },
  { id:'elenco_sofia', trigger:(s,f)=> s.ebitda >= 12,
    build:(s,f)=>({
      tipo:'karma', titulo:"Sofía Lindo se presenta formalmente", retrato: RETRATO_SOFIA_LINDO,
      presentacion:"La competidora más directa del sector se acerca a ti, cara a cara, por primera vez.",
      contexto:"Sofía Lindo, la competidora más directa del sector, se acerca en un evento gremial — la primera vez que interactúan cara a cara. 'Te he estado observando', te dice sin rodeos. 'Con esos números, ya no puedo no hacerlo'.",
      choices:[
        {texto:"Responder con respeto genuino, reconociendo su trayectoria también.", efectos:{reputacion:1}, setFlags:{sofiaRespetada:true}, disparar:{turnos:5, evento:eventoSofiaReaparece},
         consecuencia:"El tono de la conversación queda como una rivalidad de respeto, no de hostilidad abierta."},
        {texto:"Responder con un tono competitivo directo, marcando distancia desde ya.", efectos:{reputacion:-1}, setFlags:{sofiaRespetada:false}, disparar:{turnos:5, evento:eventoSofiaReaparece},
         consecuencia:"Sofía recibe el mensaje con claridad — y ahora sabe exactamente a qué tipo de rival se enfrenta."},
        {texto:"Mantener la conversación cordial pero breve, sin revelar mucho.", efectos:{reputacion:0.3}, setFlags:{sofiaRespetada:true}, disparar:{turnos:5, evento:eventoSofiaReaparece},
         consecuencia:"La cautela profesional deja una impresión neutral, ni cercana ni hostil."},
        {texto:"Preguntarle abiertamente qué es lo que más le preocupa de tu crecimiento.", efectos:{reputacion:1}, setFlags:{sofiaRespetada:true}, disparar:{turnos:5, evento:eventoSofiaReaparece},
         consecuencia:"La pregunta directa la desarma un poco — no esperaba tanta franqueza de tu parte."}
      ]
    })
  },
  { id:'elenco_higinio', trigger:(s,f)=> turnNumber >= 9,
    build:(s,f)=>({
      tipo:'karma', titulo:"Un fundador retirado pide verte", retrato: RETRATO_DON_HIGINIO, presentacion:"Una figura respetada y ya retirada del sector pide conocerte, sin agenda clara.",
      contexto:"Don Higinio Restrepo, una figura respetada del sector que ya no está activo en el día a día de ningún negocio, pide una reunión contigo — sin agenda clara, solo 'quiero conocer a quien está llevando las cosas ahora'. Llega con más curiosidad que consejos, al menos por ahora.",
      choices:[
        {texto:"Recibirlo con toda la atención, sin apuros, aunque el día esté lleno.", efectos:{reputacion:2}, setFlags:{higinioEscuchado:true}, disparar:{turnos:5, evento:eventoHiginioReaparece},
         consecuencia:"El tiempo que le das, en un mundo de agendas apretadas, es justamente lo que más valora alguien como Don Higinio."},
        {texto:"Recibirlo brevemente, entre otras reuniones del día.", efectos:{reputacion:-0.5}, setFlags:{higinioEscuchado:false}, disparar:{turnos:5, evento:eventoHiginioReaparece},
         consecuencia:"La conversación es cordial pero apresurada — Don Higinio lo nota, aunque no lo menciona."},
        {texto:"Preguntarle directamente sobre los errores que él mismo cometió en su momento.", efectos:{reputacion:1, moralEquipo:1}, setFlags:{higinioEscuchado:true}, disparar:{turnos:5, evento:eventoHiginioReaparece},
         consecuencia:"La honestidad de preguntar por los errores, no solo los aciertos, genera una conversación genuinamente valiosa."},
        {texto:"Delegar la reunión en alguien más del equipo directivo.", efectos:{reputacion:-1}, setFlags:{higinioEscuchado:false}, disparar:{turnos:5, evento:eventoHiginioReaparece},
         consecuencia:"Don Higinio lo entiende, pero la persona que quería conocer, específicamente, no era la que le presentaron."}
      ]
    })
  }
];

