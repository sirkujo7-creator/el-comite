/* =========================================================================================
   EL ELENCO — 10 personajes con nombre propio, arcos de 2 apariciones (introducción + regreso),
   reutilizando el mismo mecanismo de disparar/scheduledEvents que ya usa Toño. 5 se disparan
   desde el pool aleatorio de decisiones; los otros 5 reaccionan al estado real de tus
   indicadores (moral, confianza bancaria, mantenimiento, EBITDA, hitos de turno). No todos
   tienen por qué aparecer en una misma partida.
   ========================================================================================= */

/* ---------- 1) Marcela Duarte — contadora meticulosa y desconfiada ---------- */
function eventoMarcelaReaparece(s,f){
  if(f.marcelaConfio){
    return { tipo:'karma', titulo:"Marcela encuentra algo que juega a tu favor", retrato: RETRATO_MARCELA, presentacion:"La contadora más meticulosa del equipo vuelve, esta vez con algo bueno que reportar.",
      contexto:"Marcela Duarte, la contadora que dejaste revisar a fondo aquella decisión, vuelve a tu oficina — esta vez con una sonrisa contenida. Encontró una deducción tributaria legítima que nadie más había detectado, gracias a lo meticulosa que la dejaste ser.",
      choices:[
        {texto:"Agradecerle formalmente y aplicar la deducción de inmediato.", efectos:{caja:4, ebitda:1}, consecuencia:"Marcela se toma su trabajo con orgullo genuino cuando siente que realmente importa."},
        {texto:"Pedirle que audite también otras áreas con el mismo detalle.", efectos:{caja:3, ebitda:1, moralEquipo:-1}, consecuencia:"Encuentras más ahorros, aunque el resto del equipo empieza a sentir la lupa encima con más frecuencia."},
        {texto:"Aplicar la deducción sin darle mayor protagonismo al hallazgo.", efectos:{caja:3}, consecuencia:"El ahorro es el mismo, pero Marcela nota que su esfuerzo pasó casi desapercibido."},
        {texto:"Ofrecerle una responsabilidad mayor dentro del área financiera.", efectos:{caja:2, moralEquipo:2}, consecuencia:"Marcela acepta encantada — por fin alguien valora la meticulosidad en vez de verla como un obstáculo."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Marcela se vuelve más rígida contigo", retrato: RETRATO_MARCELA, presentacion:"Marcela Duarte vuelve a buscarte — su tono ya no es el mismo de antes.",
      contexto:"Desde que ignoraste sus reparos, Marcela Duarte empezó a exigir el doble de documentación para cualquier trámite que pase por tu escritorio — hasta para lo más simple. No es venganza, dice; es 'debido proceso'.",
      choices:[
        {texto:"Hablar con ella directamente y reconstruir la confianza perdida.", efectos:{moralEquipo:3, caja:-0.3}, consecuencia:"La conversación incómoda ayuda, aunque Marcela sigue siendo más cautelosa que antes contigo — y el tiempo que le dedicaste a esto no lo dedicaste a otra cosa."},
        {texto:"Pedirle a Recursos Humanos que intervenga en el conflicto.", efectos:{moralEquipo:-2, caja:-0.5, ebitda:0.5}, consecuencia:"La intervención formal resuelve el papeleo, pero la relación se vuelve todavía más fría. Al menos, los trámites vuelven a fluir."},
        {texto:"Aceptar el nuevo nivel de burocracia sin cuestionarlo.", efectos:{ebitda:-1}, consecuencia:"Los trámites se ralentizan de forma permanente, un costo silencioso pero real."},
        {texto:"Reemplazarla por alguien más flexible.", efectos:{caja:-2, moralEquipo:-3, ebitda:1}, consecuencia:"Resuelves la fricción inmediata, aunque pierdes a alguien que, con todo, conocía tus números mejor que nadie. Con el reemplazo, los procesos se agilizan de inmediato."}
      ]};
  }
}

/* ---------- 2) Don Rigo Salazar — proveedor histórico, de la vieja escuela ---------- */
function eventoRigoReaparece(s,f){
  if(f.rigoRespetado){
    return { tipo:'karma', titulo:"Don Rigo te ofrece algo que no le ofrece a nadie más", retrato: RETRATO_DON_RIGO, presentacion:"Tu proveedor histórico vuelve a buscarte, esta vez con un trato especial.",
      contexto:"Don Rigo Salazar, el proveedor que lleva años en esto, se aparece personalmente — no manda a nadie más para esto — a ofrecerte condiciones preferenciales que, según él, 'no le da ni a los grandes'. El trato humano, dice, todavía vale algo.",
      choices:[
        {texto:"Aceptar las condiciones preferenciales con gratitud.", efectos:{caja:3, confianzaProveedores:5, wacc:0.1}, consecuencia:"La relación de años rinde frutos concretos justo cuando más los necesitas, aunque depender tanto de un solo proveedor también es un riesgo que el mercado empieza a notar."},
        {texto:"Aceptar, pero insistir en formalizarlo por escrito de todas formas.", efectos:{caja:2, confianzaProveedores:2}, consecuencia:"Don Rigo lo firma sin problema, aunque bromea que 'antes la palabra bastaba'."},
        {texto:"Rechazar el trato preferencial por principio, pagando precio de mercado.", efectos:{caja:-1, confianzaProveedores:3}, consecuencia:"Don Rigo respeta profundamente el gesto — pocos rechazan un favor así por ética."},
        {texto:"Aceptar el trato y pedirle además que te presente a otros proveedores de confianza.", efectos:{caja:3, confianzaProveedores:4}, consecuencia:"Don Rigo abre su red de contactos — algo que construyó en décadas y que ahora comparte contigo."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Don Rigo deja de ser flexible contigo", retrato: RETRATO_DON_RIGO, presentacion:"Don Rigo Salazar vuelve a buscarte — pero la relación ya no se siente igual.",
      contexto:"Desde que lo trataste como 'un proveedor más', Don Rigo Salazar empezó a exigir condiciones exactas de contrato, sin ninguna de las flexibilidades que solía dar por la relación de años. 'Los negocios son los negocios', te dice, citándote a ti mismo.",
      choices:[
        {texto:"Aceptar las nuevas condiciones más estrictas sin quejarte.", efectos:{caja:-2, confianzaProveedores:1}, consecuencia:"Pagas el costo de haber tratado una relación de años como una transacción cualquiera."},
        {texto:"Buscar un proveedor alterno más flexible, aunque menos confiable.", efectos:{caja:1, confianzaProveedores:-4}, consecuencia:"Ahorras en el papel, pero cambias certeza probada por una relación todavía sin construir."},
        {texto:"Intentar reconstruir la relación con un gesto genuino.", efectos:{caja:-1, confianzaProveedores:3, ebitda:-0.5}, consecuencia:"Don Rigo se ablanda un poco, aunque deja claro que la confianza rota tarda en repararse. El gesto incluye respetarle por un tiempo los precios de antes."},
        {texto:"Aceptar las condiciones y buscar diversificar proveedores a futuro.", efectos:{caja:-1.5, wacc:-0.1}, consecuencia:"Una decisión prudente a mediano plazo, aunque no resuelve la tensión inmediata."}
      ]};
  }
}

/* ---------- 3) Valentina Ospina — periodista financiera joven y ambiciosa ---------- */
function eventoValentinaReaparece(s,f){
  if(f.valentinaFavorable){
    return { tipo:'karma', titulo:"Valentina publica un perfil favorable sobre tu gestión", retrato: RETRATO_VALENTINA, presentacion:"Valentina Ospina finalmente publica el artículo que prometió.",
      contexto:"Valentina Ospina publica finalmente su artículo — y es mucho más favorable de lo que esperabas. Te describe como 'una de las gestiones más transparentes del sector este año'. El artículo ya circula y varios colegas te lo han compartido.",
      choices:[
        {texto:"Compartir el artículo activamente en tus canales profesionales.", efectos:{reputacion:4}, consecuencia:"El artículo se amplifica y refuerza tu imagen pública de forma notable."},
        {texto:"Agradecerle en privado, sin promover el artículo activamente.", efectos:{reputacion:2}, consecuencia:"Un gesto más discreto, que Valentina aprecia como genuino en vez de calculado."},
        {texto:"Usar el artículo como material para atraer inversionistas o clientes nuevos.", efectos:{reputacion:2, caja:1}, consecuencia:"Conviertes la buena prensa en una herramienta comercial concreta."},
        {texto:"No hacer nada especial al respecto.", efectos:{reputacion:1}, consecuencia:"El beneficio llega de todas formas, aunque sin que tú lo capitalices más allá de lo obvio."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Valentina publica algo mucho más crítico de lo esperado", retrato: RETRATO_VALENTINA, presentacion:"Valentina Ospina finalmente publica el artículo que prometió — y no es lo que esperabas.",
      contexto:"Valentina Ospina publica su artículo — y es notablemente más duro de lo que anticipabas. Cita 'fuentes cercanas a la operación' y cuestiona directamente varias de tus decisiones recientes. El artículo ya se está compartiendo entre colegas del sector.",
      choices:[
        {texto:"Responder públicamente con una aclaración detallada.", efectos:{reputacion:2, caja:-1}, consecuencia:"La respuesta calma parte del ruido, aunque no borra la impresión inicial que dejó el artículo."},
        {texto:"No responder y dejar que el tema se diluya con el tiempo.", efectos:{reputacion:-3}, consecuencia:"Sin una versión propia circulando, la narrativa crítica de Valentina queda como la única disponible."},
        {texto:"Contactarla directamente para entender qué generó ese tono tan duro.", efectos:{reputacion:1, caja:-0.3}, consecuencia:"La conversación no cambia lo ya publicado, pero abre la puerta a una relación menos hostil a futuro."},
        {texto:"Considerar acciones legales por las afirmaciones del artículo.", efectos:{reputacion:-2, caja:-2, moralEquipo:1}, consecuencia:"La amenaza legal contra una periodista genera más atención negativa de la que buscabas evitar. Puertas adentro, el equipo siente que la empresa lo defiende."}
      ]};
  }
}

/* ---------- 4) Esteban "Teto" Vargas — excompañero, ahora en un fondo de inversión ---------- */
function eventoTetoReaparece(s,f){
  if(f.tetoRechazado){
    return { tipo:'karma', titulo:"Teto vuelve con una oferta todavía más agresiva", retrato: RETRATO_TETO, presentacion:"Tu excompañero, ahora en un fondo de inversión, no se dio por vencido.",
      contexto:"Esteban 'Teto' Vargas no se dio por vencido. Vuelve con una oferta de capital notablemente mayor a la anterior — y esta vez con un tono menos casual, más cercano a la presión. 'Esta es literalmente la última vez que te la ofrezco así de buena', te dice.",
      choices:[
        {texto:"Aceptar esta vez, ante una oferta objetivamente mejor.", efectos:{caja:9, ebitda:1}, consecuencia:"El capital llega, aunque cediste ante la insistencia más que ante la convicción."},
        {texto:"Rechazar de nuevo, con firmeza, y pedirle que respete tu decisión.", efectos:{reputacion:2}, consecuencia:"Teto se sorprende, pero termina respetando la firmeza — la relación se enfría, aunque no se rompe."},
        {texto:"Negociar una versión reducida de la oferta, en tus términos.", efectos:{caja:4}, consecuencia:"Consigues algo de capital sin ceder tanto control como Teto quería originalmente."},
        {texto:"Cortar la relación comercial por completo ante la insistencia.", efectos:{reputacion:1}, consecuencia:"Pierdes una fuente de capital potencial, pero también una presión constante que no pediste."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Teto presenta resultados de la inversión que hiciste con él", retrato: RETRATO_TETO, presentacion:"Esteban \"Teto\" Vargas vuelve a buscarte, esta vez con resultados en la mano.",
      contexto:"Esteban 'Teto' Vargas te invita a almorzar para mostrarte, con genuino entusiasmo, cómo le fue al fondo con la participación que le diste. Los números son buenos — y te propone ampliar la relación.",
      choices:[
        {texto:"Ampliar la relación con una segunda ronda de inversión.", efectos:{caja:6, ebitda:1, wacc:0.5}, consecuencia:"La relación de confianza construida rinde frutos concretos en una segunda ronda. Esa segunda ronda, eso sí, diluye un poco más tu participación: el capital de Teto espera su retorno."},
        {texto:"Agradecer los resultados, pero mantener la relación como está por ahora.", efectos:{reputacion:1, caja:-0.3}, consecuencia:"Consolidas la relación sin comprometer más participación de la que ya tenías."},
        {texto:"Pedirle que te ayude a conectar con otros inversionistas de su red.", efectos:{caja:2, reputacion:2, wacc:0.2}, consecuencia:"Teto abre puertas adicionales, contento de que la relación se sienta genuinamente mutua. Más socios, eso sí, también significa más expectativas de retorno."},
        {texto:"Empezar a evaluar recomprar la participación que le diste.", efectos:{caja:-4, wacc:-0.5}, consecuencia:"Recuperas control total sobre esa porción del negocio, a un costo real hoy. Y con menos socios esperando retorno, tu costo de capital baja."}
      ]};
  }
}

/* ---------- 5) Dra. Elvira Bonilla — abogada externa, cautelosa ---------- */
function eventoElviraReaparece(s,f){
  if(f.elviraEscuchada){
    return { tipo:'karma', titulo:"La prevención de la Dra. Bonilla evita un problema mayor", retrato: RETRATO_ELVIRA, presentacion:"Tu abogada externa te llama con una noticia poco común en su tono: buenas noticias.",
      contexto:"La Dra. Elvira Bonilla te llama con una noticia poco común en su tono: buenas noticias. La cláusula que insistió en revisar hace unos turnos acaba de evitarte un problema legal real que le está pasando, ahora mismo, a un competidor con una situación casi idéntica.",
      choices:[
        {texto:"Agradecerle formalmente y ampliar el contrato de asesoría con ella.", efectos:{caja:-1.5, reputacion:2}, consecuencia:"Formalizas una relación de confianza que ya demostró su valor real."},
        {texto:"Pedirle que revise preventivamente otros contratos vigentes.", efectos:{caja:-2}, consecuencia:"El costo es real, pero la tranquilidad legal que ofrece también lo es."},
        {texto:"Agradecerle el gesto sin comprometerte a nada adicional por ahora.", efectos:{reputacion:1}, consecuencia:"Un reconocimiento simple, aunque no aprovechas del todo el momento de confianza generado."},
        {texto:"Usar el caso del competidor como argumento para endurecer tus propios contratos futuros.", efectos:{reputacion:1, caja:-0.5}, consecuencia:"Conviertes la lección ajena en una mejora estructural real para tu operación."}
      ]};
  } else {
    return { tipo:'karma', titulo:"El riesgo que la Dra. Bonilla advirtió se materializa", retrato: RETRATO_ELVIRA, presentacion:"La advertencia que la Dra. Elvira Bonilla te dio hace un tiempo ya no es hipotética.",
      contexto:"La cláusula que la Dra. Elvira Bonilla te recomendó revisar, y que decidiste dejar pasar, ahora te está costando: un cliente la está usando en su favor en una disputa contractual. Ella no dice 'te lo dije', pero tampoco hacía falta.",
      choices:[
        {texto:"Contratarla de urgencia para resolver la disputa ahora mismo.", efectos:{caja:-4, reputacion:1}, consecuencia:"El costo de resolverlo ahora es más alto del que hubiera sido prevenirlo, pero al menos se resuelve."},
        {texto:"Intentar resolver la disputa internamente, sin asesoría legal externa.", efectos:{caja:-2, reputacion:-2}, consecuencia:"Ahorras en honorarios legales, pero el resultado de la disputa es peor de lo que hubiera sido con ayuda experta."},
        {texto:"Negociar directamente con el cliente para llegar a un acuerdo rápido.", efectos:{caja:-3, ebitda:-0.5}, consecuencia:"Resuelves el conflicto sin escalarlo más, a un costo directo pero contenido. El acuerdo incluye algunas concesiones comerciales."},
        {texto:"Comprometerte a que, de ahora en adelante, sus recomendaciones se sigan sin excepción.", efectos:{caja:-3, reputacion:-1, wacc:-0.2}, consecuencia:"El costo de esta vez es real, pero al menos queda una lección aprendida de verdad."}
      ]};
  }
}

