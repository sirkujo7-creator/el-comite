/* =========================================================================================
   ACTIVACIÓN AMBIENTE — "Situación en la Oficina" puede aparecer en cualquier momento de la
   partida, independiente del flujo de turnos. No consume turno ni compite con otros eventos.
   ========================================================================================= */
let oficinaAmbienteTimeout = null;
let oficinaDisponible = false;

function programarProximaOficinaAmbiente(){
  if(oficinaAmbienteTimeout){ clearTimeout(oficinaAmbienteTimeout); oficinaAmbienteTimeout = null; }
  const espera = 7000 + Math.random()*6000; // entre 7 y 13 segundos
  oficinaAmbienteTimeout = setTimeout(()=>{
    if(!sectorActual || pendingEndingResult){ return; }
    const modalAbierto = document.getElementById('turnModalBackdrop').classList.contains('show');
    if(!oficinaDisponible && !modalAbierto){
      activarBotonOficinaAmbiente();
    }
    // Se sigue reprogramando SIEMPRE, incluso si ya está disponible o el modal está ocupado,
    // para que el ciclo nunca se quede atascado si el jugador ignora el botón.
    programarProximaOficinaAmbiente();
  }, espera);
}
function activarBotonOficinaAmbiente(){
  oficinaDisponible = true;
  const btn = document.getElementById('oficinaAmbienteBtn');
  if(btn) btn.classList.add('show');
}
function detenerOficinaAmbiente(){
  if(oficinaAmbienteTimeout){ clearTimeout(oficinaAmbienteTimeout); oficinaAmbienteTimeout = null; }
  oficinaDisponible = false;
  const btn = document.getElementById('oficinaAmbienteBtn');
  if(btn) btn.classList.remove('show');
}
function activarSituacionOficina(){
  if(!oficinaDisponible) return;
  oficinaDisponible = false;
  const btn = document.getElementById('oficinaAmbienteBtn');
  if(btn) btn.classList.remove('show');
  oficinaEsAmbiente = true;
  openTurnModal();
  iniciarMurmulloOficina();
  const evento = pickEventoOficinaPonderado();
  currentCase = evento;
  const sonidoFn = SONIDO_OFICINA_POR_TIPO[evento.tipo];
  if(sonidoFn) sonidoFn();
  const renderFn = OFICINA_RENDER_POR_TIPO[evento.tipo];
  if(renderFn) renderFn(evento);
}



/* ---------- 6) Camila Reyes — gerente de talento humano (dispara con moral baja) ---------- */
function eventoCamilaReaparece(s,f){
  if(f.camilaEscuchada){
    return { tipo:'karma', titulo:"Camila reporta que el ambiente mejoró de verdad", retrato: RETRATO_CAMILA, presentacion:"La encargada de Recursos Humanos vuelve, esta vez con una noticia que sí quiere dar.",
      contexto:"Camila Reyes, la gerente de talento humano, te busca para contarte algo que rara vez trae ella misma: buenas noticias. Las medidas que tomaste tras su advertencia funcionaron — el ambiente del equipo mejoró de forma medible, no solo en apariencia.",
      choices:[
        {texto:"Pedirle que documente qué funcionó, para replicarlo si vuelve a hacer falta.", efectos:{moralEquipo:3}, consecuencia:"Camila lo agradece — pocas veces alguien le pide sistematizar lo que funciona, no solo apagar incendios."},
        {texto:"Reconocer públicamente su trabajo frente al resto del equipo.", efectos:{moralEquipo:4, reputacion:1, caja:-0.3}, consecuencia:"El reconocimiento público a Camila también eleva la moral de quienes ven que su bienestar sí importa — el pequeño gesto de celebrarlo formalmente también tiene su costo."},
        {texto:"Aprovechar el buen momento para pedirle más iniciativas similares.", efectos:{moralEquipo:2, caja:-1}, consecuencia:"Camila acepta con gusto, aunque advierte que este tipo de cosas no se pueden acelerar sin perder autenticidad."},
        {texto:"Tomar nota y seguir adelante sin mayor ceremonia.", efectos:{moralEquipo:1}, consecuencia:"El resultado positivo queda, aunque el momento de reconocerlo explícitamente se pierde un poco."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Camila advierte que la situación empeoró", retrato: RETRATO_CAMILA, presentacion:"Camila Reyes vuelve a buscarte — y no trae buenas noticias.",
      contexto:"Camila Reyes vuelve, esta vez con un tono más serio. La situación que te advirtió hace unos turnos no se resolvió sola — empeoró. Ya hay conversaciones informales sobre renuncias en más de un equipo.",
      choices:[
        {texto:"Actuar de inmediato con medidas concretas de bienestar y carga laboral.", efectos:{caja:-3, moralEquipo:8}, consecuencia:"La acción tardía, pero real, empieza a revertir el daño — aunque no de un día para otro."},
        {texto:"Pedirle a Camila que maneje la situación con el presupuesto que ya tiene.", efectos:{moralEquipo:1, ebitda:-0.5}, consecuencia:"Camila hace lo que puede con recursos limitados, pero el problema de fondo sigue sin atenderse. Y el tiempo que Camila dedica a apagar incendios sale de su trabajo habitual."},
        {texto:"Reconocer que la prioridad de la empresa, por ahora, tiene que ser financiera.", efectos:{moralEquipo:-4, caja:1}, consecuencia:"La honestidad brutal, aunque respetada, confirma los temores que ya circulaban en el equipo. A cambio, contienes el gasto de este periodo."},
        {texto:"Convocar una reunión abierta para escuchar directamente al equipo.", efectos:{moralEquipo:5, caja:-0.5}, consecuencia:"Escuchar directamente, sin intermediarios, calma más de lo que cualquier medida aislada hubiera logrado."}
      ]};
  }
}

/* ---------- 7) Jairo Cepeda — banquero de tu cuenta empresarial (dispara con confianza bancaria baja) ---------- */
function eventoJairoReaparece(s,f){
  if(f.jairoTranquilizado){
    return { tipo:'karma', titulo:"Jairo Cepeda confirma que el banco recuperó la confianza", retrato: RETRATO_JAIRO, presentacion:"Tu banquero de siempre vuelve a llamar, esta vez con mejores noticias.",
      contexto:"Jairo Cepeda, tu banquero de siempre, te llama con un tono notablemente más relajado que la última vez. El comité de crédito del banco revisó tu caso de nuevo y decidió mantener — incluso mejorar levemente — tus condiciones actuales.",
      choices:[
        {texto:"Aprovechar el buen momento para negociar una línea de crédito adicional.", efectos:{deuda:5, caja:5, wacc:-0.2}, consecuencia:"El banco, con la confianza renovada, te ofrece condiciones que no hubieras conseguido hace unos turnos."},
        {texto:"Agradecer y mantener la relación exactamente como está, sin pedir más.", efectos:{confianzaBanco:2}, consecuencia:"La prudencia de no pedir más justo cuando podrías refuerza aún más tu imagen ante el banco."},
        {texto:"Preguntarle directamente qué fue lo que más pesó en la decisión del comité.", efectos:{confianzaBanco:1}, consecuencia:"Jairo te da información valiosa sobre cómo te evalúan internamente — útil para el futuro."},
        {texto:"Invitarlo a conocer la operación en persona, para fortalecer la relación.", efectos:{caja:-0.3, confianzaBanco:3}, consecuencia:"Ver la operación de cerca humaniza la relación — Jairo ya no es solo un número en un sistema para ti, ni tú para él."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Jairo Cepeda trae condiciones más duras", retrato: RETRATO_JAIRO, presentacion:"Jairo Cepeda vuelve a llamar — y las condiciones no son las de antes.",
      contexto:"Jairo Cepeda vuelve a llamar, esta vez con instrucciones claras del comité de crédito: sin señales concretas de mejora, el banco va a endurecer las condiciones de tu línea actual. 'No es personal', te dice, aunque ambos saben que sí lo es un poco.",
      choices:[
        {texto:"Aceptar las nuevas condiciones más estrictas.", efectos:{wacc:1, confianzaBanco:1}, consecuencia:"Aceptas el costo mayor, evitando al menos un conflicto directo con el banco."},
        {texto:"Presentar un plan financiero detallado para intentar revertir la decisión.", efectos:{caja:-1, confianzaBanco:3}, consecuencia:"El esfuerzo de mostrar un plan concreto suaviza parcialmente la posición del banco."},
        {texto:"Empezar a explorar activamente otras entidades bancarias.", efectos:{confianzaBanco:-3, wacc:-0.3}, consecuencia:"Diversificas tu riesgo de dependencia de un solo banco, aunque la relación actual se resiente al notarlo. Con varios bancos compitiendo por tu crédito, las ofertas mejoran."},
        {texto:"Pedirle a Jairo, directamente, qué necesitaría ver para cambiar la decisión.", efectos:{confianzaBanco:2, caja:-0.3}, consecuencia:"La franqueza directa te da una hoja de ruta clara, incluso si no cambia nada de inmediato. Cumplir esa hoja de ruta exige preparar información adicional."}
      ]};
  }
}

/* ---------- 8) Ingeniero Aurelio Solano — mantenimiento y operaciones (dispara sin inversión reciente) ---------- */
function eventoAurelioReaparece(s,f){
  if(f.aurelioAtendido){
    return { tipo:'karma', titulo:"Aurelio confirma que la inversión valió la pena", retrato: RETRATO_AURELIO, presentacion:"El ingeniero de mantenimiento vuelve, esta vez para confirmarte que tenía razón.",
      contexto:"El ingeniero Aurelio Solano te busca, poco común en él, para reconocer algo: la inversión en mantenimiento que autorizaste hace unos turnos evitó exactamente el tipo de falla que él había anticipado. 'Se lo iba a decir de todas formas', dice, casi sin sonreír.",
      choices:[
        {texto:"Pedirle que proponga un plan de mantenimiento preventivo permanente.", efectos:{caja:-2, ebitda:1}, consecuencia:"Aurelio arma un plan sólido — prevenir, para él, siempre fue mejor que reparar."},
        {texto:"Reconocer su criterio técnico frente al resto del equipo directivo.", efectos:{moralEquipo:2}, consecuencia:"El reconocimiento público a alguien tan poco dado a pedirlo genera un respeto real en el equipo técnico."},
        {texto:"Preguntarle qué otro riesgo operativo le preocupa a mediano plazo.", efectos:{caja:-0.5}, consecuencia:"Aurelio, cuando siente que lo escuchan de verdad, comparte información valiosa que normalmente se guarda."},
        {texto:"Tomar nota del resultado y seguir adelante sin mayor ceremonia.", efectos:{moralEquipo:1}, consecuencia:"El resultado técnico habla por sí solo, aunque Aurelio nota que nadie lo celebra demasiado."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Aurelio confirma que la falla que anticipó ya ocurrió", retrato: RETRATO_AURELIO, presentacion:"El ingeniero Aurelio Solano vuelve — y esta vez el problema que advirtió ya pasó.",
      contexto:"El ingeniero Aurelio Solano no dice 'se lo advertí', pero su expresión lo dice todo: el equipo que llevaba meses pidiendo revisión finalmente falló, justo como había anticipado. La reparación de emergencia va a costar bastante más que el mantenimiento preventivo que pidió.",
      choices:[
        {texto:"Autorizar la reparación de emergencia completa, sin más demoras.", efectos:{caja:-6, ebitda:1}, capex:true, consecuencia:"El costo es alto, pero resuelve el problema de raíz — con meses de retraso."},
        {texto:"Buscar una reparación temporal más barata mientras se evalúa el reemplazo.", efectos:{caja:-2}, consecuencia:"Una solución parche, que Aurelio acepta con resignación profesional, no con convencimiento."},
        {texto:"Reconocer abiertamente que debiste haberlo escuchado antes.", efectos:{caja:-5, moralEquipo:3}, capex:true, consecuencia:"El reconocimiento honesto, aunque tardío, reconstruye algo de la confianza técnica perdida."},
        {texto:"Delegar la decisión completa a Aurelio, sin más intervención tuya.", efectos:{caja:-4, ebitda:0.5}, capex:true, consecuencia:"Aurelio resuelve el problema con criterio técnico puro, sin ninguna presión financiera de por medio esta vez."}
      ]};
  }
}

/* ---------- 9) Sofía Lindo — competidora directa (dispara con EBITDA alto: te volviste un objetivo) ---------- */
function eventoSofiaReaparece(s,f){
  if(f.sofiaRespetada){
    return { tipo:'karma', titulo:"Sofía Lindo propone una tregua competitiva", retrato: RETRATO_SOFIA_LINDO,
      presentacion:"Tu competidora más directa vuelve a cruzarse en tu camino — esta vez no con una amenaza.",
      contexto:"Sofía Lindo, tu competidora más directa, te contacta con algo inesperado: una propuesta de colaboración puntual en un segmento donde ninguna de las dos compite directamente. 'Prefiero tenerte como aliada ocasional que como enemiga', te dice sin rodeos.",
      choices:[
        {texto:"Aceptar la colaboración puntual propuesta.", efectos:{ebitda:1, reputacion:1, confianzaProveedores:-1}, consecuencia:"La colaboración funciona mejor de lo esperado, aunque alguno de tus proveedores de siempre nota con extrañeza que ahora compartes espacio con la competencia."},
        {texto:"Rechazar cualquier acercamiento, manteniendo la rivalidad pura.", efectos:{reputacion:1}, consecuencia:"Sofía respeta la claridad de la posición, aunque la oportunidad de colaboración queda descartada."},
        {texto:"Aceptar, pero con condiciones que protejan claramente tu información sensible.", efectos:{ebitda:0.5}, consecuencia:"Un acercamiento cauteloso que funciona, sin exponer más de lo necesario."},
        {texto:"Usar el acercamiento para obtener información sobre su propia operación.", efectos:{ebitda:0.5, reputacion:-1}, consecuencia:"Consigues algo de información útil, aunque el gesto, si se descubre, podría costarte la confianza que Sofía te mostró."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Sofía Lindo hace un movimiento agresivo en tu contra", retrato: RETRATO_SOFIA_LINDO,
      presentacion:"Sofía Lindo, tu competidora más directa, decide que ya no puede seguir observándote de lejos.",
      contexto:"Sofía Lindo, que lleva un tiempo observándote de cerca, hace un movimiento directo: se acerca a uno de tus clientes o proveedores clave con una oferta diseñada específicamente para quitártelo. El mensaje es claro — te ve como una amenaza real, y actúa en consecuencia.",
      choices:[
        {texto:"Contraatacar igualando o mejorando la oferta para retener la relación.", efectos:{caja:-2, ebitda:-0.5, confianzaProveedores:3}, consecuencia:"Retienes la relación, a un costo directo que Sofía sabía que tendrías que asumir."},
        {texto:"No reaccionar directamente y enfocarte en fortalecer otras relaciones.", efectos:{ebitda:-1}, consecuencia:"Pierdes algo de terreno en este frente específico, pero evitas una guerra de precios que nadie gana del todo."},
        {texto:"Hacer un movimiento propio hacia uno de sus clientes o proveedores clave.", efectos:{ebitda:1, reputacion:-1}, consecuencia:"Escalas la rivalidad de forma directa — Sofía lo va a notar y probablemente responderá."},
        {texto:"Fortalecer la relación con el resto de tu cartera para reducir tu exposición futura.", efectos:{caja:-1, confianzaProveedores:2}, consecuencia:"Una respuesta defensiva e inteligente: no gana la batalla puntual, pero reduce tu vulnerabilidad general."}
      ]};
  }
}

/* ---------- 10) Abuelo Higinio Restrepo — mentor retirado (aparece en turnos de hito) ---------- */
function eventoHiginioReaparece(s,f){
  if(f.higinioEscuchado){
    return { tipo:'karma', titulo:"Don Higinio vuelve con un último consejo", retrato: RETRATO_DON_HIGINIO, presentacion:"El fundador retirado que conociste hace un tiempo vuelve a buscarte.",
      contexto:"Don Higinio Restrepo, el fundador retirado que te ha visitado un par de veces a lo largo del camino, vuelve una vez más — quizás la última, dice, sin dramatismo. 'Ya casi no tengo consejos nuevos', comenta, 'solo uno que se me quedó guardado hace años'.",
      choices:[
        {texto:"Escuchar el consejo con toda la atención, sin interrupciones.", efectos:{reputacion:2, moralEquipo:2}, consecuencia:"El tiempo que le das, más que el consejo mismo, es lo que Don Higinio realmente valora a esta altura."},
        {texto:"Agradecerle todo lo aprendido a lo largo del camino, abiertamente.", efectos:{moralEquipo:3}, consecuencia:"El gesto de gratitud genuina cierra, de forma honesta, una relación que empezó como simple curiosidad."},
        {texto:"Pedirle que comparta esa misma sabiduría con el resto del equipo directivo.", efectos:{moralEquipo:2, reputacion:1}, consecuencia:"Don Higinio, encantado de que su experiencia llegue más allá de una sola conversación, acepta con gusto."},
        {texto:"Escuchar por cortesía, aunque ya sientes que tienes tu propio camino claro.", efectos:{reputacion:0.5}, consecuencia:"La conversación es breve y cordial, sin que ninguno de los dos espere más de lo que fue."}
      ]};
  } else {
    return { tipo:'karma', titulo:"Don Higinio regresa con una pregunta incómoda", retrato: RETRATO_DON_HIGINIO, presentacion:"Don Higinio Restrepo vuelve — esta vez con algo más directo que decirte.",
      contexto:"Don Higinio Restrepo vuelve, esta vez con una pregunta directa que no esperabas: '¿Todavía te acuerdas por qué empezaste esto?' No es retórica — genuinamente quiere saber si, en medio de tantas decisiones tácticas, no perdiste de vista el propósito original.",
      choices:[
        {texto:"Responder con honestidad, incluso si la respuesta no es la que esperabas dar.", efectos:{moralEquipo:2, reputacion:-0.5}, consecuencia:"La honestidad, incluso incómoda, es exactamente lo que Don Higinio esperaba de la conversación. Fiel a su estilo, luego la comenta con otros del gremio."},
        {texto:"Admitir que, en el día a día, el propósito original se ha ido diluyendo.", efectos:{moralEquipo:-1, reputacion:1}, consecuencia:"El reconocimiento honesto de esa deriva es, paradójicamente, el primer paso para corregirla."},
        {texto:"Cambiar de tema, incómodo con una pregunta tan personal.", efectos:{moralEquipo:-1, ebitda:0.2}, consecuencia:"Don Higinio no insiste, pero la pregunta sin responder se queda dando vueltas más de lo que esperabas."},
        {texto:"Usar la conversación para replantear en voz alta tus prioridades reales.", efectos:{moralEquipo:3, reputacion:1, caja:-0.3}, consecuencia:"El ejercicio de pensarlo en voz alta, frente a alguien que ya recorrió ese camino, aclara más de lo que anticipabas — aunque el tiempo dedicado a la introspección es tiempo que no dedicaste a la operación."}
      ]};
  }
}

