/* =========================================================
   DILEMAS SOCIALES Y ÉTICOS (pool compartido, se suma al azar de cada sector)
   ========================================================= */
const ETHICAL_DILEMMA_POOL = [
  (s,f)=>({
    tipo:'random', titulo:"Toño, el mensajero de toda la vida, pide un adelanto", retrato: RETRATO_TONO, presentacion:"El mensajero que lleva años con la empresa se acerca con una petición personal.",
    contexto:"Toño Salcedo lleva seis años haciendo las entregas y mandados de la empresa — es de los pocos que conoce cada dirección, cada cliente difícil, cada atajo. Hoy se acerca, visiblemente incómodo, a pedir un adelanto de sueldo: su hija necesita una cirugía que no puede esperar al siguiente pago de nómina.",
    choices:[
      {texto:"Darle el adelanto completo, sin condiciones ni descuentos futuros.", efectos:{caja:-1, moralEquipo:3}, setFlags:{tonoAyudado:true, tonoAyudaGrande:true}, disparar:{turnos:5, evento:eventoTonoReaparece},
       consecuencia:"Toño se va aliviado. El resto del equipo, que se entera por el pasillo, lo nota."},
      {texto:"Ofrecerle un adelanto parcial, cubriendo lo más urgente por ahora.", efectos:{caja:-0.5}, setFlags:{tonoAyudado:true}, disparar:{turnos:5, evento:eventoTonoReaparece},
       consecuencia:"No es todo lo que necesitaba, pero es algo — Toño agradece el gesto aunque se va preocupado."},
      {texto:"Negarlo: la empresa no puede convertirse en una entidad de beneficencia para cada caso personal.", efectos:{moralEquipo:-3}, setFlags:{tonoAyudado:false}, disparar:{turnos:5, evento:eventoTonoReaparece},
       consecuencia:"Es una decisión defendible en una hoja de cálculo. En la sala de descanso, se siente distinto."},
      {texto:"Estructurar el adelanto como un préstamo con descuento gradual de nómina, sin regalarlo pero sin negarlo.", efectos:{caja:-0.3, moralEquipo:2}, setFlags:{tonoAyudado:true, tonoAyudaEstructurada:true}, disparar:{turnos:5, evento:eventoTonoReaparece},
       consecuencia:"Un punto medio: Toño consigue el dinero que necesita, y la empresa no lo regala sin más."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La comunidad vecina denuncia impacto ambiental",
    contexto:`Un grupo de vecinos de la zona donde opera ${nombreEmpresaActual()} denuncia públicamente que tu actividad está afectando una fuente hídrica cercana. No hay una multa todavía — solo la denuncia, un par de fotos borrosas circulando en redes, y un concejal local que ya pidió explicaciones.`,
    choices:[
      {texto:"Contratar de inmediato una consultoría ambiental independiente y publicar los resultados, sean los que sean.", efectos:{caja:-6, reputacion:10},
       consecuencia:"El estudio te cuesta caro y no puedes controlar lo que encuentre, pero la transparencia desarma buena parte de la desconfianza — incluso si el resultado no es perfecto."},
      {texto:"Emitir un comunicado negando cualquier impacto, sin estudio de por medio, para cerrar el tema rápido.", efectos:{ebitda:2, reputacion:-6}, disparar:{turnos:4, evento:eventoEscandaloAmbiental},
       consecuencia:"El comunicado calma la conversación esta semana. Pero negar algo que no investigaste es una apuesta — y las apuestas de este tipo tienden a cobrarse cuando menos las esperas."},
      {texto:"Invertir en una mejora real del proceso, aunque tome meses en dar resultados visibles.", efectos:{caja:-8, reputacion:6, wacc:-0.2},
       consecuencia:"Es la respuesta más costosa y la más lenta en notarse, pero es la única que ataca la causa en vez del síntoma. Y con el riesgo ambiental resuelto de raíz, bancos e inversionistas te perciben como una empresa menos riesgosa."},
      {texto:"Financiar un proyecto comunitario visible (parque, campaña de reciclaje) sin tocar el proceso productivo.", efectos:{caja:-3, reputacion:3},
       consecuencia:"El gesto suaviza el ambiente público, aunque cualquiera que lea entre líneas nota que no responde a la denuncia original."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Señales de estrés laboral en el equipo",
    contexto:"Varios líderes de área reportan un aumento notorio en licencias médicas y renuncias silenciosas. Nadie ha dicho la palabra 'burnout' todavía en una reunión formal del comité, pero todos saben de qué se trata.",
    choices:[
      {texto:"Reducir las metas del trimestre y dar dos días de descanso pagado extra al equipo.", efectos:{ebitda:-3, moralEquipo:15, reputacion:3},
       consecuencia:"Sacrificas resultado de corto plazo por un equipo que no se está quemando — una apuesta que rara vez se ve en un estado de resultados, pero que sostiene todo lo demás."},
      {texto:"Mantener las metas actuales; el mercado no espera a que el equipo descanse.", efectos:{ebitda:3, moralEquipo:-15},
       consecuencia:"El trimestre cierra mejor en el papel. Nadie renuncia todavía — pero la moral que perdiste no se recupera con un bono, y tarde o temprano alguien se va a ir, o algo se va a romper."},
      {texto:"Contratar personal temporal para aliviar la carga sin tocar las metas.", efectos:{caja:-5, moralEquipo:8},
       consecuencia:"Cuesta caja, pero reparte la carga sin sacrificar ni el resultado ni a la gente — el tipo de decisión que no se nota hasta que no la tomas."},
      {texto:"Traer un programa externo de bienestar laboral, sin tocar metas ni cargas de trabajo.", efectos:{caja:-2, moralEquipo:4},
       consecuencia:"Es un gesto de bajo costo y bajo impacto real: ayuda algo, pero no resuelve la causa de fondo del desgaste."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una oferta demasiado buena de un nuevo proveedor",
    contexto:"Un proveedor nuevo te ofrece insumos 30% más baratos que el mercado, con entregas rápidas y sin pedir anticipo. En la reunión nadie pregunta por qué puede cobrar tan poco — hasta que uno de tus compradores menciona, casi de pasada, que ha escuchado rumores sobre las condiciones laborales en su planta.",
    investigacion:{costo:2, boton:"Contratar una auditoría social independiente de la planta del proveedor ($2M)",
      reporte:"La auditoría encuentra jornadas que exceden el límite legal en un 35% y ausencia de contratos formales para gran parte del personal de planta."},
    choices:[
      {texto:"Firmar el contrato de todas formas: no es tu empresa, es la de ellos.", efectos:{ebitda:4, caja:2, reputacion:-10}, disparar:{turnos:4, evento:eventoEscandaloProveedor},
       consecuencia:"El ahorro en costos se ve muy bien este trimestre. Si algún día alguien investiga con quién trabajas, la pregunta ya no va a ser sobre ellos — va a ser sobre por qué tú no preguntaste antes."},
      {texto:"Rechazar la oferta sin más averiguaciones y quedarte con tu proveedor actual.", efectos:{ebitda:-1},
       consecuencia:"Pierdes el ahorro, pero tampoco te expones a un riesgo que ni siquiera te tomaste el trabajo de entender del todo."},
      {texto:"Exigirle al proveedor un plan de formalización como condición para firmar el contrato.", efectos:{caja:-2, ebitda:1, reputacion:4},
       consecuencia:"Consigues buena parte del ahorro sin cerrar los ojos ante la señal de alerta — aunque no tienes forma de garantizar que el plan se cumpla de verdad."},
      {texto:"Diversificar: comprarle una porción pequeña mientras decides qué hacer con el resto.", efectos:{ebitda:1, reputacion:-1},
       consecuencia:"Una decisión a medias: ni aprovechas todo el ahorro, ni resuelves la duda ética que quedó sobre la mesa."}
    ],
    choiceInformado:{texto:"Con la auditoría confirmando las condiciones laborales irregulares, rechazar el contrato de plano.", efectos:{ebitda:-1, reputacion:6},
      consecuencia:"Jornadas 35% por encima del límite legal y personal sin contrato no son un rumor: son un hallazgo. El ahorro nunca hubiera valido ese riesgo reputacional."}
  }),
  (s,f)=>({
    tipo:'random', titulo:"Gasto sospechoso en la tarjeta corporativa",
    contexto:"El área de tesorería detecta un cargo de $3M en la tarjeta corporativa que nadie reconoce como gasto operativo. El responsable de la tarjeta dice que 'debe ser un error del banco'.",
    investigacion:{costo:1, boton:"Pedir el extracto detallado y las facturas asociadas al banco ($1M)",
      reporte:"El extracto muestra que el cargo corresponde a una cena y regalos personales del responsable, disfrazados como 'atención a clientes'."},
    choices:[
      {texto:"Confrontar al responsable y exigir el reembolso inmediato, sin escándalo público.", efectos:{caja:2, reputacion:2, moralEquipo:-2},
       consecuencia:"Recuperas el dinero y evitas el drama, aunque el mensaje interno de que 'esto se resuelve en privado' puede envalentonar a otros. Y en el equipo hay quien lo percibe como un trato preferencial."},
      {texto:"Despedir de inmediato al responsable y comunicarlo como política de tolerancia cero.", efectos:{caja:1, moralEquipo:-6, reputacion:5},
       consecuencia:"El mensaje es contundente y protege tu reputación de control interno, pero el ambiente se tensiona: varios sienten que la reacción fue desproporcionada para un solo cargo."},
      {texto:"Dejarlo pasar como 'gasto de representación' para no generar conflicto.", efectos:{ebitda:-3, confianzaBanco:-3},
       consecuencia:"Evitas el conflicto hoy, pero acabas de enviar la señal de que la tarjeta corporativa no tiene controles reales — y eso rara vez se queda en un solo incidente."},
      {texto:"Suspender todas las tarjetas corporativas hasta implementar un nuevo protocolo de aprobación.", efectos:{caja:-1, moralEquipo:-4, confianzaBanco:2},
       consecuencia:"La medida es pareja y defendible ante cualquier auditoría, aunque castiga a todo el equipo por el error de una sola persona."}
    ],
    choiceInformado:{texto:"Con las facturas en mano confirmando el uso personal, despedir con causa justa y exigir el reembolso legal.", efectos:{caja:3, reputacion:4, moralEquipo:-2},
      consecuencia:"Con evidencia documental, la salida es limpia, defendible, y recuperas el dinero sin margen de negociación. Aun así, un despido siempre deja tensión en el equipo."}
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un cliente grande entra en mora generalizada",
    contexto:"Uno de tus clientes más importantes deja de responder correos y su factura más antigua ya lleva 45 días de atraso. Su equipo de compras sigue pidiéndote más producto como si nada.",
    choices:[
      {texto:"Cortar el crédito de inmediato y exigir pago de contado para seguir despachando.", efectos:{diasCartera:-15, caja:-2},
       consecuencia:"Proteges tu cartera, aunque el cliente se queja de que lo tratas como moroso antes de darle explicaciones."},
      {texto:"Seguir despachando bajo la misma condición de crédito, confiando en que es un problema temporal.", efectos:{diasCartera:20, razonCorriente:-0.05},
       consecuencia:"Mantienes la relación comercial intacta por ahora, pero acabas de aumentar tu exposición justo con el cliente que ya no te está pagando."},
      {texto:"Ofrecer un plan de pago escalonado a cambio de una garantía (pagaré o aval).", efectos:{diasCartera:-5, confianzaBanco:1, caja:-1},
       consecuencia:"Encuentras un punto intermedio: no cortas la relación, pero tampoco sigues expuesto sin ningún respaldo. Mientras se cumplen las cuotas, entra menos caja de la que esperabas este mes."},
      {texto:"Vender la cartera vencida a una firma de cobranza con descuento.", efectos:{caja:4, ebitda:-2, diasCartera:-25},
       consecuencia:"Recuperas liquidez de inmediato y sacas el problema de tus libros, a cambio de ceder buena parte del valor de la deuda."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Ataque de ransomware a los sistemas administrativos",
    contexto:"Llegas una mañana y ningún computador del área administrativa enciende con normalidad: un mensaje en pantalla pide un pago en criptomonedas para 'liberar' tus archivos.",
    choices:[
      {texto:"Pagar el rescate exigido para recuperar los archivos lo antes posible.", efectos:{caja:-7, reputacion:-4, wacc:0.3},
       consecuencia:"Recuperas el acceso, pero acabas de confirmarle a ese grupo criminal (y a otros) que tu empresa paga cuando la presionan."},
      {texto:"Negarte a pagar y restaurar todo desde los últimos respaldos disponibles.", efectos:{ebitda:-4, reputacion:2},
       consecuencia:"Pierdes días de operación y algo de información reciente, pero no financias el modelo de negocio de tus atacantes."},
      {texto:"Contratar de emergencia una firma de ciberseguridad forense antes de decidir cualquier cosa.", efectos:{caja:-5, confianzaBanco:2, ebitda:-2},
       consecuencia:"Gastas más de lo que esperabas, pero por fin entiendes el alcance real del incidente antes de tomar una decisión a ciegas. Mientras la firma trabaja, la operación administrativa sigue detenida."},
      {texto:"Minimizar el incidente públicamente y resolverlo puertas adentro sin avisar a clientes ni banco.", efectos:{ebitda:-2, confianzaBanco:-4, reputacion:-3},
       consecuencia:"Evitas el ruido inmediato, pero si algún dato de terceros se vio comprometido, el silencio puede costarte mucho más caro después."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Tu gerente comercial recibe una oferta de la competencia",
    contexto:"Tu gerente comercial, quien maneja la relación con tus clientes más grandes, te cuenta en confianza que recibió una oferta salarial 40% mayor de un competidor directo.",
    choices:[
      {texto:"Igualar la oferta salarial de inmediato para asegurarlo.", efectos:{ebitda:-3, moralEquipo:6},
       consecuencia:"Lo retienes, aunque ahora cualquier otro líder que se entere va a esperar el mismo trato si recibe una oferta similar."},
      {texto:"Ofrecerle una participación variable atada a resultados en vez de un aumento fijo.", efectos:{ebitda:-1, moralEquipo:3},
       consecuencia:"Alineas su incentivo con el negocio sin comprometer tanto el costo fijo, aunque él esperaba algo más inmediato."},
      {texto:"No igualar la oferta y empezar a preparar un plan de transición por si se va.", efectos:{moralEquipo:-5},
       consecuencia:"Ahorras el costo hoy, pero te expones a perder de golpe la relación con tus clientes más importantes si decide aceptar."},
      {texto:"Ofrecerle un ascenso con más responsabilidades, pero sin aumento salarial inmediato.", efectos:{moralEquipo:2, ebitda:-0.5},
       consecuencia:"Le das un camino de crecimiento sin subir hoy el costo fijo, aunque reorganizar el área tiene su costo y más responsabilidad sin más sueldo puede sentirse como más carga que premio."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Demanda laboral de un exempleado",
    contexto:"Un exempleado despedido hace dos meses presenta una demanda laboral alegando despido injustificado y exige una indemnización considerable.",
    investigacion:{costo:2, boton:"Contratar una revisión legal externa del expediente de despido ($2M)",
      reporte:"La revisión encuentra que el proceso de despido tuvo fallas de procedimiento que debilitan tu posición si el caso llega a juicio."},
    choices:[
      {texto:"Ofrecer una conciliación económica rápida para cerrar el caso fuera de juicio.", efectos:{caja:-4, reputacion:1},
       consecuencia:"Pagas más de lo que hubieras querido, pero evitas meses de proceso legal y el desgaste que eso implica."},
      {texto:"Ir a juicio confiando en que el despido estuvo bien justificado.", efectos:{deuda:3},
       consecuencia:"Evitas pagar hoy, pero los costos legales se acumulan como una obligación mientras el proceso avanza, con un resultado incierto."},
      {texto:"Contraofertar con un monto bajo, apostando a que el exempleado se canse del proceso.", efectos:{caja:-1, reputacion:-2},
       consecuencia:"A veces funciona. Cuando no funciona, terminas pagando lo mismo que hubieras pagado antes, más el desgaste de los meses intermedios."},
      {texto:"Revisar y formalizar los procesos de despido de toda la empresa para evitar demandas futuras.", efectos:{caja:-2, confianzaBanco:1},
       consecuencia:"No resuelve el caso actual, pero reduce sustancialmente el riesgo de que esto se repita con cualquier otra salida futura."}
    ],
    choiceInformado:{texto:"Con las fallas de procedimiento confirmadas, ofrecer una conciliación generosa antes de que el caso llegue a juicio.", efectos:{caja:-6, reputacion:2},
      consecuencia:"Pagar más ahora es más barato que perder en juicio con un expediente que ya sabes que tiene huecos."}
  }),
  (s,f)=>({
    tipo:'random', titulo:"Línea de crédito blando del gobierno",
    contexto:"El gobierno lanza una línea de crédito blando para reactivación empresarial, con tasa preferencial, pero exige entregar información financiera detallada y comprometerse a metas de empleo.",
    choices:[
      {texto:"Solicitar el monto máximo disponible de la línea.", efectos:{caja:8, deuda:8, wacc:-0.5},
       consecuencia:"Consigues liquidez barata justo cuando la necesitas, a cambio de comprometerte con metas de empleo que tendrás que sostener."},
      {texto:"Solicitar solo una porción moderada, lo justo para un proyecto puntual.", efectos:{caja:3, deuda:3, wacc:-0.2},
       consecuencia:"Tomas una porción prudente del beneficio sin comprometerte de más con el gobierno."},
      {texto:"No aplicar: no quieres exponer tu información financiera detallada a una entidad estatal.", efectos:{ebitda:-0.3},
       consecuencia:"Mantienes tu independencia total, aunque dejas sobre la mesa una de las fuentes de financiamiento más baratas que vas a ver este año."},
      {texto:"Aplicar pero solo después de que un asesor externo revise la letra menuda del programa.", efectos:{caja:-1},
       consecuencia:"Te cuesta un poco de tiempo y dinero, pero entras al programa sabiendo exactamente en qué te estás comprometiendo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El auditor externo encuentra una inconsistencia contable",
    contexto:"Durante la revisión anual, el auditor externo encuentra una inconsistencia menor entre lo reportado y los soportes físicos — nada ilegal, pero sí una señal de que los controles internos tienen huecos.",
    choices:[
      {texto:"Corregir de inmediato y pedirle al auditor que documente la corrección en su informe.", efectos:{confianzaBanco:3, reputacion:2, caja:-0.3},
       consecuencia:"Un informe con una corrección documentada se ve mejor ante cualquier banco que uno con hallazgos sin resolver, aunque corregirlo formalmente en plena revisión tiene su propio costo administrativo."},
      {texto:"Pedirle al auditor que simplemente no lo mencione, ya que no es un error material.", efectos:{confianzaBanco:1, reputacion:-3},
       consecuencia:"El auditor accede, pero ahora sabe que estás dispuesto a pedir ese tipo de favores — y eso puede pesar la próxima vez que necesites su buena fe. Por ahora, el banco recibe un informe limpio."},
      {texto:"Invertir en un sistema de control interno más robusto para evitar que se repita.", efectos:{caja:-3, confianzaBanco:2, wacc:-0.2},
       consecuencia:"Es la respuesta más costosa hoy, pero la única que realmente ataca la causa del hallazgo. Con controles sólidos, tu empresa se percibe menos riesgosa ante financiadores."},
      {texto:"No hacer nada: es un hallazgo menor y probablemente nadie más lo note.", efectos:{confianzaBanco:-1},
       consecuencia:"No pasa nada esta vez. Pero los controles internos débiles rara vez producen solo un hallazgo menor una sola vez, y el auditor deja constancia informal de la actitud."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Propuesta de alianza estratégica con un competidor",
    contexto:"Un competidor directo te propone una alianza para compartir costos logísticos y de compra de insumos, manteniendo cada uno su marca y clientes por separado.",
    choices:[
      {texto:"Aceptar la alianza y firmar un acuerdo formal de cooperación.", efectos:{ebitda:3, capitalTrabajo:2, reputacion:-1, wacc:0.2},
       consecuencia:"Ambos reducen costos operativos, aunque ahora dependes en parte de la buena fe de alguien que hasta ayer era tu competencia — y algunos clientes fieles cuestionan que te alíes con quien antes evitabas."},
      {texto:"Rechazar la propuesta: prefieres mantener el control total de tu operación.", efectos:{ebitda:-0.5},
       consecuencia:"Conservas independencia total, a cambio de renunciar a un ahorro de costos real que tu competencia sí va a aprovechar con alguien más."},
      {texto:"Proponer una alianza más limitada, solo para un insumo puntual.", efectos:{ebitda:1, reputacion:-0.5},
       consecuencia:"Un paso prudente: obtienes parte del beneficio sin exponer toda tu operación a la relación. Aun así, algunos clientes fieles no ven con buenos ojos que cooperes con la competencia."},
      {texto:"Usar la negociación para obtener información sobre su operación, sin intención real de firmar.", efectos:{reputacion:-4, ebitda:1.5},
       consecuencia:"Consigues algo de información valiosa, pero si se entera de que negociaste de mala fe, esa puerta se cierra para siempre — y probablemente hable con otros del gremio."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Filtración de información confidencial a la prensa",
    contexto:"Un medio local publica cifras internas de tu empresa que solo un puñado de personas debería conocer. No sabes todavía quién filtró la información, pero el daño ya está hecho.",
    choices:[
      {texto:"Contratar una investigación forense digital para identificar la fuente de la filtración.", efectos:{caja:-4, reputacion:1},
       consecuencia:"Gastas en encontrar respuestas, aunque no siempre se llega a una conclusión definitiva — y mientras tanto, la desconfianza interna ya se instaló."},
      {texto:"Emitir un comunicado restando importancia a la información publicada.", efectos:{reputacion:-3, confianzaBanco:1},
       consecuencia:"El comunicado no convence a nadie que ya vio las cifras — minimizar lo evidente rara vez funciona. El banco, al menos, recibe una postura oficial."},
      {texto:"Reforzar de inmediato los protocolos de manejo de información sensible, sin buscar culpables.", efectos:{caja:-2, moralEquipo:2},
       consecuencia:"No resuelves el caso puntual, pero reduces el riesgo de que se repita, y evitas una cacería de brujas interna que hubiera dañado la confianza del equipo."},
      {texto:"No hacer nada y esperar a que el ruido mediático se apague solo.", efectos:{reputacion:-2},
       consecuencia:"A veces el ruido efectivamente se apaga. Otras veces, el silencio se interpreta como que no te importó lo suficiente para actuar."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Devolución masiva por un lote defectuoso",
    contexto:"Un lote reciente de producto sale con una falla de calidad, y varios clientes exigen devolución o reemplazo al mismo tiempo.",
    choices:[
      {texto:"Reemplazar todo de inmediato sin pedir explicaciones, asumiendo el costo completo.", efectos:{caja:-6, reputacion:6},
       consecuencia:"El gesto genera lealtad real en tus clientes, aunque el golpe a la caja es considerable."},
      {texto:"Ofrecer solo un descuento en la próxima compra en vez de reemplazo o devolución de dinero.", efectos:{caja:-1, reputacion:-4},
       consecuencia:"Ahorras dinero hoy, pero varios clientes sienten que evadiste tu responsabilidad, y algunos no vuelven a comprar."},
      {texto:"Investigar primero la causa raíz del defecto antes de responder a los clientes.", efectos:{caja:-2, ebitda:-1},
       consecuencia:"Te toma más tiempo responder, pero cuando lo haces, tienes una explicación real y una solución de fondo, no solo un parche."},
      {texto:"Negociar caso por caso, dando más a quien más se queje.", efectos:{caja:-3, reputacion:-2},
       consecuencia:"Terminas gastando casi lo mismo que si hubieras sido generoso con todos desde el principio, pero generando la sensación de trato desigual entre tus clientes."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Beneficio tributario por contratación inclusiva",
    contexto:"Te enteras de un beneficio tributario vigente por contratar personas con discapacidad o mayores de 55 años, que llevas meses sin aprovechar por simple desconocimiento.",
    choices:[
      {texto:"Rediseñar tu próximo proceso de contratación para aprovechar el beneficio de forma genuina.", efectos:{ebitda:2, reputacion:3, caja:-0.5},
       consecuencia:"El beneficio tributario es real, y además construyes un equipo más diverso, aunque rediseñar el proceso de contratación no es gratis ni inmediato."},
      {texto:"Contratar al mínimo necesario solo para calificar al beneficio, sin cambiar realmente tu proceso.", efectos:{ebitda:1, moralEquipo:-2},
       consecuencia:"Obtienes parte del beneficio, aunque el gesto se siente más como un trámite que como una convicción — y eso, tarde o temprano, se nota puertas adentro."},
      {texto:"No hacer ningún cambio: tu proceso de contratación funciona bien como está.", efectos:{ebitda:-0.3},
       consecuencia:"Dejas sobre la mesa un ahorro tributario real por simple inercia."},
      {texto:"Consultar primero con un asesor tributario para entender el alcance exacto del beneficio.", efectos:{caja:-0.3},
       consecuencia:"Gastas un poco en asesoría, pero evitas aplicar mal un beneficio que después tendrías que devolver con intereses."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Fondo de inversión ofrece comprar una participación minoritaria",
    contexto:"Un fondo de inversión regional te ofrece comprar una participación minoritaria de tu empresa, inyectando capital fresco sin que pierdas el control operativo.",
    choices:[
      {texto:"Aceptar la oferta y capitalizar la empresa con ese dinero fresco.", efectos:{caja:10, capitalTrabajo:6, deuda:-3, reputacion:-1, wacc:1},
       consecuencia:"Entra dinero sin intereses ni cuotas, aunque ahora tienes un nuevo socio con derecho a voz sobre decisiones importantes — y algunos lo notan como una pérdida de independencia. Además, el fondo espera un retorno alto por su capital: tu costo de capital sube."},
      {texto:"Rechazar la oferta: prefieres mantener el 100% de la propiedad, aunque eso limite tu crecimiento.", efectos:{capitalTrabajo:-1},
       consecuencia:"Conservas control absoluto, a cambio de renunciar a capital que hubiera podido acelerar varios planes pendientes."},
      {texto:"Negociar una participación más pequeña de la ofrecida, a cambio de menos dinero.", efectos:{caja:5, capitalTrabajo:3, wacc:0.5},
       consecuencia:"Encuentras un punto intermedio: menos capital, pero también menos injerencia externa en tus decisiones. Aun así, ese capital espera un retorno alto: tu costo de capital sube."},
      {texto:"Pedir tiempo para hacer valorar la empresa por un tercero antes de negociar cualquier cifra.", efectos:{caja:-1},
       consecuencia:"Te tomas el tiempo de saber cuánto vale realmente tu empresa antes de ceder ni un punto porcentual de ella."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Error en la nómina paga de más a varios empleados",
    contexto:"Un error en el sistema de nómina hizo que varios empleados recibieran un pago superior al que les correspondía este mes. El error ya se identificó y corrigió hacia adelante.",
    choices:[
      {texto:"Descontar el excedente del próximo pago de nómina a los empleados afectados.", efectos:{caja:2, moralEquipo:-6},
       consecuencia:"Recuperas el dinero, pero varios empleados sienten que están pagando por un error que no cometieron ellos."},
      {texto:"Asumir la pérdida como costo del error y no descontar nada.", efectos:{ebitda:-3, moralEquipo:5},
       consecuencia:"El gesto genera buena voluntad real, aunque el error queda sin ninguna consecuencia financiera para la empresa."},
      {texto:"Negociar con cada empleado un plan de devolución en cuotas pequeñas.", efectos:{caja:1, moralEquipo:-2},
       consecuencia:"Encuentras un punto medio razonable, aunque coordinar planes individuales toma tiempo administrativo."},
      {texto:"Auditar el sistema de nómina completo para asegurar que el error no se repita.", efectos:{caja:-2, confianzaBanco:1},
       consecuencia:"Gastas en prevenir, no en corregir — la inversión más aburrida y a la vez más rentable que puedes hacer hoy."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Oportunidad de certificación de calidad internacional",
    contexto:"Una certificación de calidad internacional está disponible para tu sector. Es costosa y toma meses, pero te abriría la puerta a clientes que hoy ni siquiera te cotizan por no tenerla.",
    choices:[
      {texto:"Iniciar el proceso de certificación completo de inmediato.", efectos:{caja:-7, reputacion:5, confianzaBanco:2},
       consecuencia:"Es una inversión fuerte hoy que no se paga sola de inmediato, pero abre una puerta comercial que hoy tienes cerrada por completo."},
      {texto:"Posponer la certificación hasta tener más liquidez disponible.", efectos:{reputacion:-0.5},
       consecuencia:"Proteges tu caja actual, aunque cada trimestre que pasa es un trimestre más en el que esos clientes potenciales siguen sin considerarte."},
      {texto:"Buscar un crédito específico para financiar el proceso de certificación.", efectos:{caja:5, deuda:6, wacc:0.2},
       consecuencia:"Consigues el dinero sin tocar tu caja actual, a cambio de una nueva obligación financiera que vas a cargar mientras la certificación empieza a dar frutos."},
      {texto:"Buscar una certificación local más económica y menos reconocida como paso intermedio.", efectos:{caja:-2, reputacion:2},
       consecuencia:"Un paso más barato y más rápido, aunque no abre las mismas puertas que la certificación internacional completa."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El banco pide refinanciar anticipadamente por un rumor de crisis",
    contexto:"Corre el rumor de una crisis sectorial y, aunque tú vienes cumpliendo tus pagos al día, tu banco te pide adelantar una revisión de tus condiciones de crédito 'por precaución'.",
    choices:[
      {texto:"Entregar toda la información financiera solicitada de forma transparente y proactiva.", efectos:{confianzaBanco:4, caja:-0.5},
       consecuencia:"La transparencia total ante un banco nervioso rara vez sale mal — y en este caso refuerza la relación en vez de tensionarla. Preparar el paquete completo de información, eso sí, consume horas del equipo financiero."},
      {texto:"Negarte a entregar información adicional a la ya pactada contractualmente.", efectos:{confianzaBanco:-6, wacc:0.3},
       consecuencia:"Estás en tu derecho, pero un banco nervioso al que le cierras la puerta tiende a ponerte condiciones más duras la próxima vez que negocies algo."},
      {texto:"Aprovechar la revisión para negociar mejores condiciones a cambio de mostrar buenos números.", efectos:{confianzaBanco:1, wacc:-0.3, caja:-0.5},
       consecuencia:"Conviertes una revisión defensiva en una oportunidad: si tus números están bien, es el momento de pedir algo a cambio. El banco cede, aunque toma nota de que aprovechaste su momento de nerviosismo."},
      {texto:"Cambiar de banco antes de que la revisión se complete.", efectos:{caja:-2, confianzaBanco:-10, wacc:-0.4},
       consecuencia:"Escapas de la presión inmediata, pero migrar de banco a mitad de una relación de crédito rara vez sale barato ni rápido. El banco nuevo, eso sí, te recibe con una tasa de bienvenida."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Denuncia anónima de acoso laboral",
    contexto:"Llega una denuncia anónima de acoso laboral entre dos empleados de áreas distintas. No hay pruebas contundentes todavía, solo el relato de la persona afectada.",
    choices:[
      {texto:"Abrir una investigación formal e independiente de inmediato, con protocolo claro.", efectos:{caja:-2, moralEquipo:6, reputacion:3},
       consecuencia:"Tomarte en serio la denuncia, con proceso formal, es exactamente lo que un equipo necesita ver que su empresa hace en estos casos."},
      {texto:"Hablar informalmente con ambas partes para 'resolverlo entre ellos'.", efectos:{moralEquipo:-8},
       consecuencia:"La informalidad envía la señal equivocada: que este tipo de denuncias no se toman con la seriedad que merecen."},
      {texto:"Remitir el caso al comité de convivencia laboral, como exige la ley, sin intervención adicional de la gerencia.", efectos:{moralEquipo:1, ebitda:-0.5, reputacion:1},
       consecuencia:"Cumples el procedimiento legal y la denuncia tiene un canal formal, aunque el comité avanza despacio y algunos sienten que la gerencia se lavó las manos."},
      {texto:"Separar preventivamente a ambas personas de proyectos compartidos mientras se investiga.", efectos:{ebitda:-1, moralEquipo:3},
       consecuencia:"Una medida prudente mientras se aclaran los hechos, sin prejuzgar a nadie de antemano."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Nuevo impuesto municipal sorpresivo",
    contexto:"La alcaldía aprueba un nuevo impuesto municipal a las actividades comerciales, con vigencia inmediata y sin periodo de transición.",
    choices:[
      {texto:"Absorber el costo del nuevo impuesto sin trasladarlo a tus precios.", efectos:{ebitda:-3, reputacion:2},
       consecuencia:"Proteges tu relación con clientes sensibles al precio, a costa directa de tu rentabilidad."},
      {texto:"Trasladar el impuesto completo a tus precios de inmediato.", efectos:{ebitda:1, reputacion:-2},
       consecuencia:"Proteges tu margen, aunque algunos clientes sienten el aumento como una decisión tuya, no como lo que realmente es."},
      {texto:"Trasladar solo una parte del impuesto y absorber el resto.", efectos:{ebitda:-1},
       consecuencia:"Un punto intermedio razonable que reparte el golpe entre tu margen y tus clientes."},
      {texto:"Sumarte a un gremio empresarial que está impugnando legalmente el nuevo impuesto.", efectos:{caja:-1},
       consecuencia:"Inviertes poco en una apuesta legal que, si prospera, podría revertir el impuesto para todo el sector — aunque no hay garantía de éxito ni de plazo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Oferta por los datos de tus clientes",
    contexto:"Una empresa de marketing te ofrece una suma considerable por acceso a tu base de datos de clientes, para fines publicitarios de terceros. Tus términos de servicio no cubren explícitamente este uso.",
    choices:[
      {texto:"Rechazar la oferta: tus clientes no dieron consentimiento explícito para ese uso.", efectos:{reputacion:4, caja:-0.5},
       consecuencia:"Dejas dinero sobre la mesa, pero proteges algo que, una vez que se pierde — la confianza de tus clientes con sus datos —, no se recupera fácilmente. Responder formalmente, con concepto jurídico de por medio, tiene un pequeño costo."},
      {texto:"Aceptar la oferta sin informar a tus clientes del nuevo uso de sus datos.", efectos:{caja:6, reputacion:-8},
       consecuencia:"El dinero entra rápido. Si algún cliente se entera por su cuenta, la sensación de traición pesa mucho más que la suma que recibiste."},
      {texto:"Aceptar la oferta, pero solo tras actualizar tus términos y pedir consentimiento explícito.", efectos:{caja:3, ebitda:-1},
       consecuencia:"El proceso de consentimiento reduce cuántos clientes califican para la oferta, pero lo que obtienes es limpio y defendible."},
      {texto:"Ignorar la oferta y no responder.", efectos:{ebitda:-0.2},
       consecuencia:"La oferta desaparece de tu bandeja sin drama, aunque también sin el ingreso adicional que otros en tu lugar sí hubieran tomado."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El sistema de facturación falla por dos días",
    contexto:"Una falla técnica deja el sistema de facturación caído durante dos días completos. Las ventas siguen ocurriendo, pero registradas a mano en papel y hojas sueltas.",
    choices:[
      {texto:"Contratar soporte técnico de emergencia para restablecer el sistema cuanto antes.", efectos:{caja:-3, diasCartera:5},
       consecuencia:"Pagas una tarifa de urgencia, pero minimizas el tiempo con el sistema caído y el riesgo de perder registros."},
      {texto:"Esperar a que el proveedor del software lo resuelva en su tiempo normal de respuesta.", efectos:{diasCartera:15, confianzaBanco:-1},
       consecuencia:"No gastas de más hoy, pero la facturación desordenada de estos días te va a perseguir en el cierre de cartera del próximo mes."},
      {texto:"Migrar de emergencia a un sistema alterno más simple mientras se resuelve el problema de fondo.", efectos:{caja:-2, ebitda:-1},
       consecuencia:"Una solución rápida y algo improvisada, pero que evita seguir facturando a mano indefinidamente."},
      {texto:"Aprovechar el incidente para evaluar cambiar de proveedor de software definitivamente.", efectos:{caja:-1, diasCartera:12},
       consecuencia:"No resuelves nada hoy, pero empiezas a mover una decisión de fondo que llevabas tiempo posponiendo. Mientras tanto, la facturación de estos días se acumula."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Leasing financiero vs. compra directa de un activo clave",
    contexto:"Necesitas renovar un equipo o vehículo clave para la operación. Tu proveedor te ofrece dos caminos: comprarlo de contado, o tomarlo en leasing financiero con cuotas mensuales.",
    choices:[
      {texto:"Comprarlo de contado, usando caja disponible.", efectos:{caja:-9, capitalTrabajo:-4},
       consecuencia:"El activo queda completamente tuyo sin ninguna cuota futura, a cambio de un golpe fuerte e inmediato a tu liquidez."},
      {texto:"Tomarlo en leasing financiero, pagando cuotas mensuales durante los próximos periodos.", efectos:{caja:-1, deuda:9, wacc:0.2},
       consecuencia:"Conservas tu caja disponible para otras necesidades, a cambio de una obligación financiera que se extiende varios periodos."},
      {texto:"Posponer la renovación del activo hasta el próximo periodo de presupuesto.", efectos:{ebitda:-2},
       consecuencia:"Ahorras el gasto hoy, aunque seguir operando con un activo que necesitaba renovarse ya está pasando una pequeña factura en eficiencia."},
      {texto:"Negociar un esquema mixto: una cuota inicial menor y el resto financiado a corto plazo.", efectos:{caja:-3, deuda:4},
       consecuencia:"Un punto intermedio que no compromete toda tu caja ni te deja con una deuda tan larga como el leasing completo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Beneficio tributario no aprovechado, detectado por un nuevo asesor fiscal",
    contexto:"Cambias de asesor fiscal y el nuevo detecta que llevas más de un año sin aplicar correctamente una deducción a la que tenías derecho.",
    choices:[
      {texto:"Presentar la corrección ante la autoridad fiscal para reclamar el beneficio retroactivo.", efectos:{caja:5, ebitda:-0.5},
       consecuencia:"El trámite toma tiempo, pero recuperas dinero que legítimamente te correspondía y que llevabas meses dejando sobre la mesa. Los honorarios del trámite salen del margen de este periodo."},
      {texto:"Aplicar la deducción solo hacia adelante, sin reclamar lo retroactivo por evitar trámites.", efectos:{ebitda:1, caja:-0.3},
       consecuencia:"Simplificas el proceso, aunque renuncias a una parte del beneficio que ya tenías ganado."},
      {texto:"Cambiar definitivamente de asesor fiscal, dado lo que dejó pasar el anterior.", efectos:{caja:-1, confianzaBanco:1},
       consecuencia:"Una decisión razonable a mediano plazo, aunque no resuelve por sí sola el beneficio que ya quedó atrás. Y el banco nota que tus reportes tributarios ganan solidez."},
      {texto:"Auditar los últimos tres años completos, por si hay más beneficios no aplicados.", efectos:{caja:2, ebitda:-0.3},
       consecuencia:"La revisión le quita tiempo al equipo contable, pero aparece otro beneficio olvidado: recuperas más de lo que pagaste por la auditoría."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Fusión de dos proveedores clave sube los precios",
    contexto:"Dos de tus proveedores principales se fusionan, y la nueva empresa combinada te anuncia un incremento de precios del 15% para el próximo pedido, sin margen de negociación aparente.",
    choices:[
      {texto:"Aceptar el incremento y mantener la relación comercial como está.", efectos:{ebitda:-3},
       consecuencia:"Evitas el desgaste de buscar alternativas, a costa directa de tu margen operativo."},
      {texto:"Buscar activamente proveedores alternativos, aunque tome tiempo migrar.", efectos:{caja:-2, confianzaProveedores:-3},
       consecuencia:"Diversificas tu riesgo de dependencia, aunque el proceso de migración no es instantáneo ni gratuito."},
      {texto:"Negociar un contrato de volumen a cambio de mantener el precio anterior.", efectos:{ebitda:-1, capitalTrabajo:-2},
       consecuencia:"Consigues frenar parte del incremento, a cambio de comprometerte con volúmenes de compra más altos."},
      {texto:"Trasladar el incremento a tus propios precios de venta.", efectos:{ebitda:1, reputacion:-2},
       consecuencia:"Proteges tu margen, aunque tus propios clientes ahora sienten el efecto dominó de una decisión que ni siquiera tomaste tú."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Programa de referidos dispara contrataciones inesperadas",
    contexto:"Tu programa de bonos por referidos funcionó mejor de lo esperado: llegaron más candidatos calificados de los que tenías presupuestados para contratar este trimestre.",
    choices:[
      {texto:"Aprovechar el momento y contratar más rápido de lo planeado.", efectos:{caja:-5, ebitda:2, moralEquipo:5},
       consecuencia:"Aceleras el crecimiento del equipo aprovechando un momento de talento disponible poco común."},
      {texto:"Mantener el plan de contratación original y dejar pasar a los candidatos adicionales.", efectos:{moralEquipo:-3},
       consecuencia:"Te ciñes al presupuesto, aunque el equipo que refirió a esos candidatos siente que el esfuerzo no sirvió de nada."},
      {texto:"Ofrecerles a los candidatos adicionales un inicio diferido para el próximo trimestre.", efectos:{moralEquipo:2, ebitda:-0.5},
       consecuencia:"Un punto intermedio razonable, aunque corres el riesgo de perder a los mejores candidatos frente a otras ofertas mientras esperan."},
      {texto:"Pagar los bonos de referido igual, aunque no contrates a los candidatos adicionales.", efectos:{caja:-2, moralEquipo:4},
       consecuencia:"El gesto cuesta dinero sin ampliar el equipo, pero mantiene la confianza en que vale la pena participar en el programa de referidos."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un antiguo socio reclama una deuda informal olvidada",
    contexto:"Un antiguo socio o inversionista de los primeros días de la empresa reaparece reclamando el pago de un préstamo informal que, según él, nunca se saldó formalmente por escrito.",
    choices:[
      {texto:"Pagar el monto reclamado para evitar cualquier conflicto legal o reputacional.", efectos:{caja:-4, reputacion:2},
       consecuencia:"Cierras el tema de raíz, aunque nunca sabrás con certeza si el monto reclamado era exactamente el correcto."},
      {texto:"Exigir pruebas documentales antes de considerar cualquier pago.", efectos:{reputacion:-1, caja:-0.5},
       consecuencia:"Es lo correcto desde el punto de vista formal, aunque la relación personal con esa persona probablemente no sobreviva a la exigencia. Y la consulta con tu abogado tiene su costo."},
      {texto:"Ofrecer una negociación por una fracción del monto reclamado, sin admitir ni negar la deuda.", efectos:{caja:-2},
       consecuencia:"Encuentras un punto medio pragmático que cierra el tema sin comprometerte con el monto completo reclamado."},
      {texto:"Ignorar el reclamo por completo, al no existir ningún documento que lo respalde.", efectos:{reputacion:-3},
       consecuencia:"Legalmente estás cubierto, pero si esa persona tiene relaciones en tu gremio, el episodio puede seguir circulando informalmente."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Oferta de outsourcing para el área contable completa",
    contexto:"Una firma especializada te ofrece asumir toda tu operación contable y de nómina por outsourcing, a un costo mensual fijo menor al de mantener el equipo interno actual.",
    choices:[
      {texto:"Aceptar el outsourcing completo y prescindir del equipo contable interno.", efectos:{caja:3, ebitda:2, moralEquipo:-8},
       consecuencia:"Reduces costos fijos de forma notable, aunque el equipo interno que pierde su lugar lo vive como una señal de que nadie está a salvo."},
      {texto:"Mantener el equipo interno actual, sin considerar el outsourcing.", efectos:{ebitda:-0.5},
       consecuencia:"Conservas el conocimiento y la lealtad de tu equipo actual, renunciando a un ahorro de costos considerable."},
      {texto:"Hacer un outsourcing parcial, solo de las funciones más operativas y repetitivas.", efectos:{caja:-0.5, ebitda:1, moralEquipo:-2},
       consecuencia:"Reduces algo de costo sin desmantelar por completo tu capacidad contable interna. La transición, eso sí, tiene un costo inicial."},
      {texto:"Usar la oferta como argumento para renegociar condiciones con tu equipo interno actual.", efectos:{ebitda:1, moralEquipo:-4},
       consecuencia:"Consigues cierto ahorro, aunque usar una amenaza externa como palanca de negociación interna deja un ambiente incómodo detrás."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un cliente histórico pide condiciones que ya no son rentables",
    contexto:"Tu cliente más antiguo — uno de los primeros que confió en ti — pide renovar el contrato con los mismos precios de hace tres años. Con la inflación de costos actual, seguir sirviéndolo en esas condiciones prácticamente no deja margen.",
    choices:[
      {texto:"Renovar en las mismas condiciones, por lealtad y por lo que representa la relación.", efectos:{ebitda:-2, reputacion:4},
       consecuencia:"Conservas una relación valiosa y tu palabra como socio confiable, a costa directa de tu margen."},
      {texto:"Explicarle la situación con números claros y proponer un ajuste gradual de precios.", efectos:{reputacion:2, ebitda:-0.5},
       consecuencia:"La conversación es incómoda pero honesta — algunos clientes valoran más la transparencia que el precio congelado. Mientras dura el ajuste gradual, sigues sacrificando algo de margen."},
      {texto:"Aplicar el nuevo precio de lista sin excepciones, como a cualquier cliente nuevo.", efectos:{ebitda:3, reputacion:-5},
       consecuencia:"Proteges tu margen por completo, aunque el cliente lo vive como que el historial compartido no valió nada."},
      {texto:"Dejar que el contrato expire sin renovarlo, liberando esa capacidad para clientes más rentables.", efectos:{ebitda:2, reputacion:-2},
       consecuencia:"Sueltas una relación de bajo margen, aunque en el gremio se sabe que fuiste tú quien cerró la puerta primero."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Fluctuación fuerte en el tipo de cambio",
    contexto:"El tipo de cambio se movió con fuerza en las últimas semanas y varios de tus contratos con proveedores o clientes están denominados parcialmente en moneda extranjera. Tienes la opción de cubrir el riesgo ahora o esperar a ver si se revierte.",
    choices:[
      {texto:"Contratar coberturas cambiarias (forwards) para fijar el tipo de cambio de los próximos meses.", efectos:{caja:-3, wacc:-0.3},
       consecuencia:"Pagas el costo de la cobertura, pero eliminas la incertidumbre — tu planeación financiera vuelve a ser predecible."},
      {texto:"No cubrir nada y esperar a que el mercado se estabilice por sí solo.", efectos:{caja:pick([-5,4])},
       consecuencia:"Apuestas todo a la dirección del mercado — a veces sale bien, a veces te cuesta caro, y esta vez el resultado ya está definido."},
      {texto:"Cubrir solo una parte de la exposición, la más crítica para la operación.", efectos:{caja:-1.5},
       consecuencia:"Reduces el riesgo sin comprometer toda tu caja en coberturas — una solución intermedia razonable."},
      {texto:"Renegociar los contratos para que queden denominados en moneda local.", efectos:{reputacion:-2},
       consecuencia:"Eliminas el riesgo cambiario de raíz, aunque la contraparte no siempre acepta sin fricción trasladarte ese riesgo a ti antes que a ellos."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un exempleado amenaza con una demanda laboral",
    contexto:"Un empleado que despediste hace dos meses contrató un abogado y amenaza con demandar por despido injustificado. Tu área legal cree que tienes buenas probabilidades de ganar, pero el proceso sería largo y visible.",
    choices:[
      {texto:"Ofrecer una liquidación adicional a cambio de que retire la demanda y firme un acuerdo de confidencialidad.", efectos:{caja:-3, reputacion:2},
       consecuencia:"Cierras el tema rápido y sin ruido, aunque sienta un precedente interno de que amenazar con demandar tiene recompensa."},
      {texto:"Ir hasta el final del proceso legal, confiando en que la razón está de tu lado.", efectos:{caja:-1, reputacion:-1, moralEquipo:2},
       consecuencia:"El proceso se alarga y consume tiempo y dinero legal, pero evitas ceder ante una amenaza sin fundamento sólido. Internamente, el equipo nota que la empresa no cede ante amenazas sin fundamento."},
      {texto:"Buscar una mediación formal para llegar a un punto medio antes de que escale.", efectos:{caja:-1.5, reputacion:1},
       consecuencia:"Encuentras una salida razonable sin llegar a litigio abierto ni sentar precedentes incómodos."},
      {texto:"Ignorar la amenaza hasta que se formalice una demanda real.", efectos:{reputacion:-0.5},
       consecuencia:"No gastas nada por ahora, pero si la demanda se concreta, llegarás a defenderte sin haber explorado ninguna salida anticipada."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un proveedor clave se declara en dificultades financieras",
    contexto:"Uno de tus proveedores más importantes te avisa, de forma confidencial, que está atravesando serios problemas de liquidez. Si quiebra, tendrás que conseguir un reemplazo con urgencia y probablemente a peor precio.",
    choices:[
      {texto:"Adelantarle un pago importante para ayudarlo a sostenerse, asegurando el suministro.", efectos:{caja:-4, confianzaProveedores:10},
       consecuencia:"Tu apoyo puede salvar la relación y el suministro, aunque también expones tu propia caja al riesgo de que igual no lo logre."},
      {texto:"Empezar de inmediato a buscar un proveedor alterno, en paralelo, sin comprometerte con el actual.", efectos:{caja:-1},
       consecuencia:"Te cubres ante el peor escenario, aunque el proveedor actual nota que empezaste a mirar hacia otro lado."},
      {texto:"No hacer nada por ahora y esperar a ver cómo evoluciona la situación.", efectos:{confianzaProveedores:-2},
       consecuencia:"No comprometes recursos, pero el proveedor nota tu falta de reacción, y si la quiebra llega sin aviso, la transición será mucho más costosa y apresurada."},
      {texto:"Renegociar el contrato a tu favor, aprovechando que el proveedor está en una posición débil.", efectos:{ebitda:1, confianzaProveedores:-8},
       consecuencia:"Mejoras tus condiciones en el corto plazo, aunque exprimir a alguien en dificultades no es algo que se olvide fácil en el gremio."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una app de reseñas hunde tu calificación tras un mal servicio puntual",
    contexto:"Un incidente aislado con un cliente escaló en redes sociales y tu calificación promedio en plataformas de reseñas cayó de forma notoria en pocos días. El equipo de mercadeo pide una respuesta antes de que se profundice.",
    choices:[
      {texto:"Contratar una agencia de manejo de crisis en redes para gestionar la narrativa activamente.", efectos:{caja:-3, reputacion:5},
       consecuencia:"La reputación se recupera más rápido de lo que se habría recuperado sola, aunque el costo no es menor para un incidente puntual."},
      {texto:"Responder personalmente y de forma transparente al cliente afectado, sin intermediarios.", efectos:{reputacion:3, caja:-0.5},
       consecuencia:"El gesto humano se nota y calma buena parte de la conversación, aunque no tiene el alcance de una campaña profesional. Le ofreces además una compensación al cliente afectado."},
      {texto:"No responder públicamente y dejar que el tema se diluya solo con el tiempo.", efectos:{reputacion:-3},
       consecuencia:"Ahorras el costo de gestión, pero el silencio se interpreta como indiferencia mientras la conversación sigue circulando."},
      {texto:"Lanzar una promoción agresiva para desviar la atención hacia otra noticia positiva.", efectos:{caja:1, ebitda:-1, reputacion:-1},
       consecuencia:"La cortina de humo funciona a medias — algunos caen en la distracción, otros notan exactamente lo que estás haciendo. Las ventas suben unos días, a costa del margen."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Descubres una duplicidad de funciones entre dos áreas",
    contexto:"Una auditoría interna de procesos revela que dos áreas distintas llevan meses haciendo, sin saberlo, un trabajo prácticamente idéntico — un desperdicio silencioso de horas y presupuesto que nadie había detectado.",
    choices:[
      {texto:"Fusionar las funciones de inmediato y reasignar al personal sobrante a otras tareas.", efectos:{ebitda:2, moralEquipo:-6},
       consecuencia:"Eliminas el desperdicio de raíz, aunque la reasignación abrupta genera inseguridad sobre quién sigue y quién no."},
      {texto:"Rediseñar los procesos con calma durante los próximos meses, sin movimientos abruptos de personal.", efectos:{ebitda:1, caja:-1},
       consecuencia:"Corriges el problema de forma gradual, aceptando que el desperdicio siga un tiempo más mientras se ordena todo. Rediseñar procesos con apoyo externo tiene su costo."},
      {texto:"Dejarlo como está por ahora; dos áreas cubriendo lo mismo también reduce el riesgo de que algo se caiga.", efectos:{ebitda:-1},
       consecuencia:"Evitas el conflicto de reorganizar, pero sigues pagando por una redundancia que ya identificaste y decidiste ignorar."},
      {texto:"Premiar a ambas áreas por su compromiso, sin señalar la duplicidad para no generar tensión.", efectos:{moralEquipo:3, ebitda:-2},
       consecuencia:"Evitas el conflicto interno por completo, aunque el desperdicio de recursos queda intacto — y ahora hasta reforzado con un incentivo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una startup te ofrece una alianza tecnológica a cambio de participación accionaria",
    contexto:"Una startup con una herramienta interesante para tu operación te propone implementarla gratis a cambio de un pequeño porcentaje de participación en tu empresa, en vez de cobrar una licencia tradicional.",
    choices:[
      {texto:"Aceptar la participación accionaria a cambio de la herramienta.", efectos:{caja:1, ebitda:1, reputacion:-0.5},
       consecuencia:"Consigues tecnología sin desembolso inmediato, cediendo a cambio una porción — pequeña pero real — de tu empresa; algunos socios cuestionan ceder equity por una herramienta operativa."},
      {texto:"Rechazar la propuesta y pagar la licencia tradicional si la herramienta realmente lo vale.", efectos:{caja:-2, ebitda:1},
       consecuencia:"Mantienes el control total de tu estructura societaria, asumiendo el costo en efectivo en vez de en participación."},
      {texto:"Proponer un esquema híbrido: una licencia reducida más una porción accionaria menor a la ofrecida.", efectos:{caja:-1, ebitda:0.5},
       consecuencia:"Encuentras un punto medio que reparte el riesgo entre ambas partes, sin comprometerte del todo a ninguno de los dos extremos."},
      {texto:"Declinar por completo; no es el momento de abrir la estructura accionaria a terceros.", efectos:{ebitda:-0.3},
       consecuencia:"Te quedas sin la herramienta por ahora, pero conservas intacta tu estructura de propiedad para negociaciones futuras."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El seguro de la empresa vence y las primas subieron considerablemente",
    contexto:"La renovación de la póliza de seguros integral de la empresa (activos, responsabilidad civil, interrupción de negocio) llegó con un aumento de prima mucho mayor al esperado. Reducir la cobertura abarataría el costo, pero también la protección.",
    choices:[
      {texto:"Renovar la cobertura completa, aceptando el aumento de prima sin negociarlo.", efectos:{caja:-4},
       consecuencia:"Mantienes tu protección intacta ante cualquier eventualidad grave, al precio más alto disponible en el mercado actual."},
      {texto:"Reducir la cobertura a lo esencial para bajar el costo de la prima.", efectos:{caja:-1.5, razonCorriente:-0.05},
       consecuencia:"Ahorras en el corto plazo, aunque quedas más expuesto si ocurre justo el tipo de evento que decidiste dejar de cubrir."},
      {texto:"Cotizar con otras tres aseguradoras antes de decidir, aunque tome más tiempo.", efectos:{caja:-2.5, ebitda:-0.3},
       consecuencia:"El esfuerzo adicional de cotizar rinde frutos: consigues una prima más razonable sin sacrificar cobertura. Cotizar, eso sí, consume horas del equipo administrativo."},
      {texto:"No renovar por ahora y operar sin la póliza mientras se resuelve internamente.", efectos:{caja:1, razonCorriente:-0.1},
       consecuencia:"Liberas caja de inmediato, pero cada día sin cobertura es un día en que un solo incidente podría costarte mucho más de lo que ahorraste."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un influenciador menciona tu marca sin que se lo pidieras",
    contexto:"Un creador de contenido con audiencia relevante mencionó tu producto o servicio de forma espontánea y positiva. No te cobró nada, pero tampoco te avisó — y ahora te escribe preguntando si quieres formalizar una alianza pagada.",
    choices:[
      {texto:"Formalizar una alianza pagada de largo plazo con condiciones claras.", efectos:{caja:-3, reputacion:4},
       consecuencia:"Conviertes un golpe de suerte en una relación sostenida, con el costo que eso implica pero también con mayor control sobre el mensaje."},
      {texto:"Agradecer el gesto con un obsequio o descuento, sin comprometerte a un contrato formal.", efectos:{caja:-0.5, reputacion:2},
       consecuencia:"Mantienes la relación cálida con una inversión mínima, aunque sin ningún compromiso de continuidad de ninguna de las dos partes."},
      {texto:"No responder por ahora; la mención orgánica ya cumplió su función sin costarte nada.", efectos:{reputacion:1, ebitda:-0.3},
       consecuencia:"Te quedas con el beneficio gratuito de la mención, aunque dejas pasar la oportunidad de construir algo más duradero. Días después, un competidor lo contrata para su propia campaña."},
      {texto:"Pedir explícitamente que declare la relación comercial para cumplir con la normativa de publicidad.", efectos:{reputacion:2.5, caja:-1},
       consecuencia:"Te cubres legalmente y refuerzas tu imagen de empresa transparente, aunque el mensaje pierda algo de su espontaneidad original. Formalizarlo exige un contrato sencillo y asesoría legal."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un competidor directo cierra operaciones repentinamente",
    contexto:"Un competidor cercano en tamaño y mercado anuncia el cierre repentino de operaciones. Varios de sus clientes y algunos de sus empleados con experiencia empiezan a buscar dónde reubicarse, y tú estás en la lista de opciones obvias.",
    choices:[
      {texto:"Lanzar una campaña activa para captar tanto a los clientes como al talento que queda disponible.", efectos:{caja:-3, ebitda:2, moralEquipo:-3},
       consecuencia:"Capturas una oportunidad de crecimiento real, aunque absorber tanto de golpe tensiona a tu equipo actual, que de repente tiene nuevos compañeros y más carga."},
      {texto:"Absorber solo a los clientes, sin contratar personal adicional del competidor caído.", efectos:{ebitda:1.5, moralEquipo:-4},
       consecuencia:"Creces en ingresos sin ampliar la nómina, aunque tu equipo actual absorbe toda la carga extra sin refuerzos."},
      {texto:"Contratar selectivamente solo a dos o tres perfiles clave que quedaron disponibles.", efectos:{caja:-1.5, ebitda:0.5},
       consecuencia:"Incorporas talento valioso de forma controlada, sin comprometerte a una expansión agresiva que no estabas planeando."},
      {texto:"No hacer ningún movimiento activo y dejar que el mercado se reacomode solo.", efectos:{ebitda:-0.5},
       consecuencia:"Evitas cualquier riesgo de una expansión apresurada, aunque otros competidores más rápidos capturan la oportunidad que dejaste pasar."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Marcela Duarte cuestiona una de tus decisiones", retrato: RETRATO_MARCELA, presentacion:"La contadora más meticulosa del equipo financiero llega con preguntas incómodas.",
    contexto:"Marcela Duarte, la contadora más meticulosa del equipo financiero, se presenta en tu oficina con una carpeta bajo el brazo. Quiere que le expliques, con detalle, la lógica detrás de una de tus decisiones recientes — algo que a ella le suena 'demasiado creativo' para su gusto.",
    choices:[
      {texto:"Explicarle con calma toda la lógica financiera detrás de la decisión.", efectos:{reputacion:1, caja:-0.2}, setFlags:{marcelaConfio:true}, disparar:{turnos:4, evento:eventoMarcelaReaparece},
       consecuencia:"Marcela se va conforme, aunque sigue teniendo sus reservas guardadas para la próxima vez — y el tiempo dedicado a la explicación detallada no fue gratis."},
      {texto:"Decirle que confíe en tu criterio, sin entrar en detalles.", efectos:{moralEquipo:-1}, setFlags:{marcelaConfio:false}, disparar:{turnos:4, evento:eventoMarcelaReaparece},
       consecuencia:"Marcela anota la respuesta, literalmente, en su libreta. No parece haberle gustado."},
      {texto:"Agradecerle la diligencia y pedirle que documente sus propias reservas por escrito.", efectos:{caja:-0.3}, setFlags:{marcelaConfio:true}, disparar:{turnos:4, evento:eventoMarcelaReaparece},
       consecuencia:"El gesto de tomarla en serio, incluso en desacuerdo, no pasa desapercibido para ella."},
      {texto:"Restarle importancia frente a otros miembros del equipo.", efectos:{moralEquipo:-2}, setFlags:{marcelaConfio:false}, disparar:{turnos:4, evento:eventoMarcelaReaparece},
       consecuencia:"Marcela no dice nada más, pero el gesto público de restarle valor a su trabajo se siente en todo el equipo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Don Rigo Salazar pide ser tratado como algo más que un proveedor", retrato: RETRATO_DON_RIGO, presentacion:"Tu proveedor de años pide una conversación distinta a las de costumbre.",
    contexto:"Don Rigo Salazar, que te provee insumos desde antes de que la empresa tuviera el tamaño que tiene hoy, te comenta — sin queja directa, a su estilo — que últimamente todo se siente 'muy de trámite' entre ustedes. Extraña cuando las cosas se resolvían con una llamada y un apretón de manos.",
    choices:[
      {texto:"Invitarlo a almorzar para retomar la relación personal, no solo comercial.", efectos:{caja:-0.5, confianzaProveedores:4}, setFlags:{rigoRespetado:true}, disparar:{turnos:4, evento:eventoRigoReaparece},
       consecuencia:"Don Rigo se nota genuinamente contento — para él, el gesto vale más que cualquier descuento."},
      {texto:"Decirle que los negocios hoy funcionan distinto, con procesos y no con favores.", efectos:{confianzaProveedores:-3}, setFlags:{rigoRespetado:false}, disparar:{turnos:4, evento:eventoRigoReaparece},
       consecuencia:"Don Rigo lo entiende, pero algo en la relación se enfría de forma perceptible."},
      {texto:"Formalizar la relación con un contrato más estructurado, sin ningún gesto personal.", efectos:{confianzaProveedores:-1}, setFlags:{rigoRespetado:false}, disparar:{turnos:4, evento:eventoRigoReaparece},
       consecuencia:"El contrato queda en regla, aunque Don Rigo siente que perdió algo que no está en ningún papel."},
      {texto:"Visitarlo personalmente en su bodega, como en los viejos tiempos.", efectos:{caja:-0.3, confianzaProveedores:5}, setFlags:{rigoRespetado:true}, disparar:{turnos:4, evento:eventoRigoReaparece},
       consecuencia:"El gesto de ir tú hasta allá, y no al revés, dice más que cualquier palabra para alguien como Don Rigo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Valentina Ospina pide una entrevista exclusiva", retrato: RETRATO_VALENTINA, presentacion:"Una periodista financiera reconocida del sector busca una entrevista contigo.",
    contexto:"Valentina Ospina, una periodista financiera joven y ambiciosa que está construyendo su nombre cubriendo el sector, te escribe pidiendo una entrevista exclusiva sobre tu gestión. Es su gran oportunidad, y no lo esconde.",
    choices:[
      {texto:"Aceptar la entrevista y ser completamente transparente con ella.", efectos:{reputacion:2}, setFlags:{valentinaFavorable:true}, disparar:{turnos:3, evento:eventoValentinaReaparece},
       consecuencia:"Valentina aprecia la apertura genuina — no todos los que entrevista se la dan."},
      {texto:"Aceptar, pero con respuestas cuidadosamente controladas por tu equipo de comunicaciones.", efectos:{caja:-0.5}, setFlags:{valentinaFavorable:false}, disparar:{turnos:3, evento:eventoValentinaReaparece},
       consecuencia:"La entrevista sale, pero Valentina nota lo ensayada que se sintió cada respuesta."},
      {texto:"Rechazar la entrevista por ahora, sin dar mayor explicación.", efectos:{reputacion:-0.5}, setFlags:{valentinaFavorable:false}, disparar:{turnos:3, evento:eventoValentinaReaparece},
       consecuencia:"Valentina lo toma con profesionalismo, aunque el rechazo queda en su memoria — y se convierte en una fuente menos amigable para tu próxima mención en prensa."},
      {texto:"Aceptar la entrevista y aprovecharla para anunciar algo genuinamente positivo de la empresa.", efectos:{reputacion:3, caja:-0.3}, setFlags:{valentinaFavorable:true}, disparar:{turnos:3, evento:eventoValentinaReaparece},
       consecuencia:"La combinación de transparencia y una buena noticia real hace que la entrevista salga mejor de lo esperado."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Esteban \"Teto\" Vargas reaparece con una propuesta de inversión", retrato: RETRATO_TETO, presentacion:"Un viejo conocido, ahora en el mundo de los fondos de inversión, se acerca con una propuesta.",
    contexto:"Esteban 'Teto' Vargas, un excompañero de universidad que ahora dirige un fondo de inversión pequeño pero activo, te escribe de la nada — como si no hubieran pasado los años — proponiéndote capital a cambio de una participación en la empresa. El tono es casual, casi como en los viejos tiempos.",
    choices:[
      {texto:"Aceptar la propuesta, confiando en la relación de tantos años.", efectos:{caja:6, ebitda:0.5, reputacion:-1}, setFlags:{tetoRechazado:false}, disparar:{turnos:5, evento:eventoTetoReaparece},
       consecuencia:"El capital llega rápido, con la informalidad característica de Teto — aunque eso también te preocupa un poco, y alguien de tu junta cuestiona la falta de formalidad del proceso."},
      {texto:"Rechazar la propuesta educadamente, prefiriendo mantener distancia entre lo personal y lo profesional.", efectos:{capitalTrabajo:-0.5}, setFlags:{tetoRechazado:true}, disparar:{turnos:5, evento:eventoTetoReaparece},
       consecuencia:"Teto lo toma con humor, aunque insiste en que 'la oferta sigue en pie' — mientras tanto, sigues sin ese capital que hubiera acelerado algunos planes."},
      {texto:"Pedir toda la documentación formal del fondo antes de considerar algo.", efectos:{caja:-0.5}, setFlags:{tetoRechazado:false}, disparar:{turnos:5, evento:eventoTetoReaparece},
       consecuencia:"Teto se sorprende del formalismo, pero lo respeta y cumple con todo lo pedido."},
      {texto:"Rechazar de forma tajante, algo incómodo con mezclar amistad y negocios.", efectos:{capitalTrabajo:-0.5}, setFlags:{tetoRechazado:true}, disparar:{turnos:5, evento:eventoTetoReaparece},
       consecuencia:"Teto respeta la decisión, aunque el tono de la conversación se siente distinto de ahí en adelante."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La Dra. Elvira Bonilla te advierte sobre una cláusula riesgosa", retrato: RETRATO_ELVIRA, presentacion:"Tu abogada externa de siempre revisa un contrato reciente y te llama con una advertencia.",
    contexto:"La Dra. Elvira Bonilla, tu abogada externa de siempre, revisa un contrato reciente y te llama con una advertencia puntual: una cláusula específica te deja expuesto en un escenario poco probable, pero real. Corregirla toma tiempo y dinero que no tenías presupuestados.",
    choices:[
      {texto:"Seguir su recomendación al pie de la letra, sin cuestionarla.", efectos:{caja:-2}, setFlags:{elviraEscuchada:true}, disparar:{turnos:4, evento:eventoElviraReaparece},
       consecuencia:"El costo se siente hoy, aunque confías en el criterio que te ha funcionado antes."},
      {texto:"Pedirle una segunda opinión antes de gastar en corregir la cláusula.", efectos:{caja:-1}, setFlags:{elviraEscuchada:true}, disparar:{turnos:4, evento:eventoElviraReaparece},
       consecuencia:"La segunda opinión confirma su diagnóstico — el gasto adicional de consultarla, al menos, te da certeza."},
      {texto:"Decidir que el riesgo es demasiado improbable como para justificar el gasto.", efectos:{reputacion:-0.3}, setFlags:{elviraEscuchada:false}, disparar:{turnos:4, evento:eventoElviraReaparece},
       consecuencia:"Ahorras el costo inmediato, apostando a que ese escenario específico nunca llegue a materializarse — la Dra. Bonilla queda con la sensación de que su criterio no pesó lo suficiente."},
      {texto:"Corregir solo parcialmente la cláusula, buscando un punto medio de costo.", efectos:{caja:-1}, setFlags:{elviraEscuchada:false}, disparar:{turnos:4, evento:eventoElviraReaparece},
       consecuencia:"Reduces el riesgo sin eliminarlo del todo — la Dra. Bonilla deja claro que no es lo que ella hubiera recomendado."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Tu banco ofrece reestructurar la deuda de corto plazo",
    contexto:"Buena parte de tu deuda actual vence en los próximos meses, presionando tu liquidez inmediata. El banco te ofrece convertirla en un crédito de largo plazo — mejora tu razón corriente de un día para otro, aunque el costo total de esa deuda, sostenido en el tiempo, sale más caro.",
    choices:[
      {texto:"Aceptar la reestructuración completa a largo plazo.", efectos:{razonCorriente:0.35, wacc:0.5}, consecuencia:"Tu liquidez inmediata respira de golpe, a cambio de pagar más intereses acumulados durante los próximos años."},
      {texto:"Rechazarla y mantener la deuda en sus plazos originales.", efectos:{razonCorriente:-0.1, wacc:-0.1}, consecuencia:"El costo total de tu deuda se mantiene más bajo, aunque la presión de liquidez de corto plazo sigue exactamente igual."},
      {texto:"Reestructurar solo la mitad, dejando el resto en el plazo original.", efectos:{razonCorriente:0.18, wacc:0.25}, consecuencia:"Un punto medio: alivias parte de la presión inmediata sin comprometerte al costo completo de la reestructuración."},
      {texto:"Negociar una reestructuración parcial a cambio de una tasa preferencial por tu historial de pago.", efectos:{razonCorriente:0.3, wacc:0.15, confianzaBanco:3, caja:-0.5}, consecuencia:"Tu buen historial de pagos te consigue mejores condiciones de las que el banco ofrece por defecto. La negociación, eso sí, tiene costos de estudio de crédito."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El banco propone consolidar todas tus líneas de crédito",
    contexto:"Tienes varias líneas de crédito abiertas con distintas tasas y plazos, cada una abierta para una necesidad puntual del pasado. El banco te propone consolidarlas todas en un solo crédito, con una tasa promedio y un solo pago mensual — más simple de administrar, aunque no necesariamente más barato.",
    choices:[
      {texto:"Consolidar todo en un solo crédito, aceptando la tasa promedio ofrecida.", efectos:{wacc:-0.3, deuda:-1, caja:-0.5}, consecuencia:"Simplificas tu administración financiera y hasta mejoras ligeramente tu costo promedio de capital. La estructuración del crédito consolidado cobra una comisión."},
      {texto:"Mantener las líneas separadas tal como están.", efectos:{caja:-0.2}, consecuencia:"Conservas el control individual de cada línea, aunque sigues administrando varias tasas y fechas de pago distintas — y ese tiempo administrativo tiene su propio costo."},
      {texto:"Consolidar solo las líneas con peor tasa, dejando las más baratas como están.", efectos:{wacc:-0.5, caja:-0.3}, consecuencia:"Una consolidación selectiva que mejora tu costo de capital más de lo que la oferta general hubiera logrado. El banco cobra una comisión por la consolidación."},
      {texto:"Pedir asesoría externa antes de decidir si consolidar o no.", efectos:{caja:-0.5, wacc:-0.2, confianzaBanco:1}, consecuencia:"El costo de la asesoría se paga solo: identifica cuáles líneas sí conviene consolidar y cuáles no."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un cliente grande propone extender su plazo de pago a cambio de más volumen",
    contexto:"Uno de tus clientes más grandes ofrece triplicar su pedido mensual, pero a cambio pide que le extiendas el plazo de pago de 30 a 90 días — una condición que alargaría bastante tus días de cartera y el tiempo que ese dinero tarda en volver a tu caja.",
    choices:[
      {texto:"Aceptar la extensión completa de 90 días a cambio del volumen.", efectos:{diasCartera:25, ebitda:2, caja:-1}, consecuencia:"El volumen adicional se ve bien en el papel, pero ese dinero va a tardar el triple en volver a convertirse en caja disponible."},
      {texto:"Rechazar la extensión y mantener tus plazos actuales de siempre.", efectos:{diasCartera:-2, reputacion:-1}, consecuencia:"Renuncias al volumen extra, pero tu cartera se mantiene sana y predecible. El cliente no recibe bien la negativa."},
      {texto:"Negociar un plazo intermedio de 60 días en vez de los 90 pedidos.", efectos:{diasCartera:12, ebitda:1}, consecuencia:"Consigues parte del volumen sin comprometer tu cartera tanto como el cliente pedía originalmente."},
      {texto:"Aceptar el plazo largo, pero exigir un anticipo parcial al momento del pedido.", efectos:{diasCartera:15, caja:1, ebitda:1}, consecuencia:"El anticipo amortigua el impacto en tu caja inmediata, aunque tu cartera igual crece de forma considerable."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El banco realiza su revisión anual de tu relación crediticia",
    contexto:"Una vez al año, tu banco revisa formalmente el estado de la relación: cómo has pagado, qué tan transparente has sido, cómo te has comunicado con ellos. El resultado de esta revisión define tus condiciones de crédito para el próximo año.",
    choices:[
      {texto:"Preparar un dossier financiero completo y proactivo, más allá de lo que piden.", efectos:{confianzaBanco:6, caja:-1}, consecuencia:"El esfuerzo adicional de mostrar transparencia total suele rendir frutos concretos en la revisión."},
      {texto:"Entregar solo lo que formalmente piden, sin ir más allá.", efectos:{confianzaBanco:-0.5}, consecuencia:"Cumples con lo mínimo, aunque una revisión así de pasiva rara vez mejora la percepción que el banco ya tiene de ti. Frente a otros clientes más proactivos, quedas un poco atrás."},
      {texto:"Aprovechar la revisión para pedir directamente mejores condiciones de tasa.", efectos:{confianzaBanco:3, wacc:-0.3, caja:-0.5}, consecuencia:"Pedir en el momento correcto, con buenos números de respaldo, consigue mejores condiciones de las que el banco ofrece por defecto. Sustentar la solicitud exige un estudio financiero que tiene su costo."},
      {texto:"Posponer la reunión de revisión por estar ocupado con otras prioridades.", efectos:{confianzaBanco:-3, ebitda:0.5}, consecuencia:"Postergar una revisión que el banco considera importante rara vez pasa desapercibido para ellos. Al menos, ese tiempo lo dedicaste a la operación."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un proveedor histórico pide replantear la relación comercial",
    contexto:"Tu proveedor de años pide sentarse a conversar. No es una crisis puntual, aclara — pero siente que la relación se ha vuelto puramente transaccional últimamente, y quiere saber si todavía hay algo más que eso entre ustedes.",
    choices:[
      {texto:"Proponer un acuerdo de largo plazo con condiciones preferenciales mutuas.", efectos:{confianzaProveedores:6, caja:-1}, consecuencia:"El compromiso formal, más allá de lo transaccional, es exactamente lo que esta conversación buscaba encontrar."},
      {texto:"Mantener la relación tal como está, estrictamente comercial.", efectos:{confianzaProveedores:-2, ebitda:0.5}, consecuencia:"Tu proveedor entiende la posición, aunque se va con la sensación confirmada de que la relación ya no es lo que era. A cambio, conservas intacto tu poder de negociación sobre precios."},
      {texto:"Ofrecer pagarle puntualmente por adelantado como gesto concreto de compromiso.", efectos:{confianzaProveedores:4, caja:-2, ebitda:0.5}, consecuencia:"El gesto económico, aunque tiene un costo real, se siente como una respuesta genuina a su inquietud. Y el pago anticipado te da derecho a un descuento."},
      {texto:"Escuchar sus preocupaciones sin comprometerte todavía a ningún cambio concreto.", efectos:{confianzaProveedores:1, ebitda:-0.2}, consecuencia:"El gesto de escuchar ayuda un poco, aunque sin ningún compromiso real detrás, no cambia demasiado la percepción. Mientras la relación sigue en el limbo, el proveedor prioriza los pedidos de otros clientes."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un proveedor pequeño pide reducir el plazo de pago por apuros propios",
    contexto:"Un proveedor pequeño, pero confiable, te pide reducir tu plazo de pago habitual — no porque algo haya cambiado contigo, sino porque él mismo está pasando apuros de liquidez y necesita que le paguen más rápido de lo acostumbrado.",
    choices:[
      {texto:"Aceptar pagarle antes, aunque eso presione tu propio flujo de caja.", efectos:{confianzaProveedores:5, caja:-2, capitalTrabajo:-1}, consecuencia:"El gesto de ayudarlo cuando más lo necesitaba construye un tipo de lealtad que ningún contrato garantiza por sí solo."},
      {texto:"Negarte y mantener tus términos de pago actuales.", efectos:{confianzaProveedores:-3}, consecuencia:"Es tu derecho contractual, aunque tu proveedor no olvida quién estuvo dispuesto a ayudar cuando lo necesitó y quién no."},
      {texto:"Ofrecer un adelanto parcial, no el pago completo anticipado.", efectos:{confianzaProveedores:2, caja:-1, ebitda:0.3}, consecuencia:"Un punto medio que alivia parte de su apuro sin comprometer toda tu liquidez de una sola vez. Y el proveedor, agradecido, te reconoce un pequeño descuento."},
      {texto:"Ayudarlo a conseguir financiamiento externo (factoring) en vez de asumir tú el costo.", efectos:{confianzaProveedores:3, caja:-0.3}, consecuencia:"Resuelves su problema real sin sacrificar tu propia caja — aunque el esfuerzo de gestionarlo también cuenta."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El equipo pide más flexibilidad de horario",
    contexto:"Varios miembros del equipo, primero de forma informal y luego en una reunión conjunta, piden la posibilidad de trabajar con horarios más flexibles — llegar y salir dentro de un rango, en vez de un horario fijo estricto.",
    choices:[
      {texto:"Aceptar la flexibilidad total, confiando en que el trabajo se entrega igual.", efectos:{moralEquipo:8, ebitda:-0.5}, consecuencia:"El gesto de confianza se siente genuino, y la mayoría responde exactamente como esperabas — aunque coordinar reuniones se vuelve un poco más complicado."},
      {texto:"Rechazar la petición, manteniendo el horario fijo tradicional.", efectos:{moralEquipo:-6, ebitda:0.5}, consecuencia:"Es tu prerrogativa como gerencia, pero el equipo lo interpreta como una señal de desconfianza que no esperaban. La coordinación del día a día, eso sí, sigue siendo sencilla."},
      {texto:"Ofrecer flexibilidad parcial, solo en la hora de entrada.", efectos:{moralEquipo:4, ebitda:-0.2}, consecuencia:"Un punto medio razonable que resuelve buena parte de la fricción sin ceder el control por completo."},
      {texto:"Aceptar la flexibilidad, pero pedir un reporte semanal de horas trabajadas a cambio.", efectos:{moralEquipo:3, ebitda:0.3, caja:-0.3}, consecuencia:"El control adicional genera algo de incomodidad, aunque el reporte termina siendo útil para la operación. Implementar la herramienta de registro de horas tiene un pequeño costo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una oportunidad de reconocer públicamente al equipo",
    contexto:"El equipo cerró un mes especialmente difícil con resultados sólidos, sin que nadie se lo pidiera explícitamente. Tienes la oportunidad de reconocerlo — o dejarlo pasar como si solo estuvieran haciendo su trabajo.",
    choices:[
      {texto:"Organizar un reconocimiento genuino: almuerzo, mención especial, un bono simbólico.", efectos:{caja:-1.5, moralEquipo:7}, consecuencia:"El costo es menor comparado con lo que genera sentirse realmente visto después de un mes difícil."},
      {texto:"Dar el reconocimiento en forma de días libres, en vez de un bono.", efectos:{moralEquipo:5, ebitda:-1}, consecuencia:"El tiempo libre se agradece tanto como un bono, aunque la operación de esos días se resiente."},
      {texto:"Un simple correo de agradecimiento, sin ningún costo adicional.", efectos:{moralEquipo:2, ebitda:-0.2}, consecuencia:"No es mucho, pero al menos el esfuerzo del mes no pasa completamente en silencio. Eso sí, quienes más se esforzaron esperaban algo más concreto, y se nota un poco en su ritmo."},
      {texto:"Convertir el logro en la nueva meta permanente, sin reconocimiento especial.", efectos:{moralEquipo:-2, ebitda:1}, consecuencia:"Exiges más rendimiento sostenido, pero el equipo siente que un buen mes solo trajo más presión, no reconocimiento."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Rumores de recorte de personal generan ansiedad en el equipo",
    contexto:"Sin que hayas dicho nada al respecto, empiezan a circular rumores internos de un posible recorte de personal — probablemente originados por una decisión financiera reciente que alguien malinterpretó.",
    choices:[
      {texto:"Convocar una reunión abierta y aclarar la situación con transparencia total.", efectos:{moralEquipo:5, reputacion:1, ebitda:-0.5}, consecuencia:"La transparencia directa, incluso cuando la noticia no es perfecta, calma más que cualquier comunicado formal. Parar la operación para la reunión, eso sí, cuesta medio día de trabajo."},
      {texto:"Anunciar bonos de retención para el personal clave mientras se define la estructura.", efectos:{caja:-3, moralEquipo:2, ebitda:1}, consecuencia:"Aseguras a quienes no puedes perder y la operación no se frena, aunque el resto del equipo nota quién recibió bono y quién no."},
      {texto:"Enviar un comunicado escrito breve, sin espacio para preguntas.", efectos:{moralEquipo:2, ebitda:-0.2}, consecuencia:"Algo es mejor que nada, aunque la falta de espacio para preguntas deja dudas genuinas sin resolver. Y esas dudas siguen distrayendo al equipo."},
      {texto:"Aprovechar la ansiedad para negociar condiciones más favorables en la próxima renovación de contratos.", efectos:{moralEquipo:-4, caja:2}, consecuencia:"La jugada funciona en el papel, pero el equipo eventualmente entiende de qué se trató realmente esa negociación."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un cliente clave propone pagar de contado, con descuento",
    contexto:"Uno de tus clientes más grandes te ofrece pagar el total de su próximo pedido de contado, en vez de a los 60 días habituales — a cambio de un descuento considerable sobre el precio de lista.",
    choices:[
      {texto:"Aceptar el descuento a cambio de la liquidez inmediata.", efectos:{razonCorriente:0.2, caja:2, ebitda:-1}, consecuencia:"El margen se reduce, pero tener el dinero ahora en vez de en dos meses cambia genuinamente tu posición de liquidez."},
      {texto:"Rechazar, prefiriendo cobrar el precio completo aunque tarde en llegar.", efectos:{ebitda:1, razonCorriente:-0.05}, consecuencia:"Conservas todo el margen de la venta, apostando a que tu liquidez actual aguanta los dos meses de espera."},
      {texto:"Negociar un descuento menor a cambio del mismo pago de contado.", efectos:{razonCorriente:0.15, caja:1.5, ebitda:-0.5}, consecuencia:"Un punto medio que recupera parte del margen sin renunciar del todo a la liquidez inmediata."},
      {texto:"Aceptar solo un pago parcial de contado, el resto en el plazo normal.", efectos:{razonCorriente:0.1, caja:1, ebitda:-0.3}, consecuencia:"Una solución cautelosa que mejora tu liquidez sin comprometer toda la venta al descuento. La parte pagada de contado lleva un pequeño descuento."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Tu proveedor principal ofrece ampliar tu plazo de pago habitual",
    contexto:"Tu proveedor principal, en un gesto poco común, te ofrece ampliar tu plazo de pago habitual de 30 a 60 días — sin ningún cargo adicional, como reconocimiento a años de pagos puntuales.",
    choices:[
      {texto:"Aceptar la ampliación completa del plazo.", efectos:{razonCorriente:0.25, confianzaProveedores:2, ebitda:-0.5}, consecuencia:"La holgura adicional en tu liquidez de corto plazo llega justo cuando más la puedes aprovechar. Eso sí, renuncias al descuento por pronto pago que venías aprovechando."},
      {texto:"Rechazar, prefiriendo mantener el ciclo de pago corto de siempre.", efectos:{confianzaProveedores:1, ebitda:0.3, caja:-0.5}, consecuencia:"El gesto de seguir pagando rápido, aunque no lo necesites, refuerza una relación que ya era sólida. Pagar rápido te mantiene el descuento por pronto pago, aunque la caja sale antes de lo necesario."},
      {texto:"Aceptar una ampliación parcial, a 45 días en vez de 60.", efectos:{razonCorriente:0.12, confianzaProveedores:1, ebitda:-0.2}, consecuencia:"Un término medio que mejora tu liquidez sin estirar la relación más de lo prudente."},
      {texto:"Aceptar la ampliación, comprometiéndote a un volumen de compra mayor a cambio.", efectos:{razonCorriente:0.2, ebitda:0.5, confianzaProveedores:1, capitalTrabajo:-2}, consecuencia:"Ambos salen ganando: tu liquidez mejora, y tu proveedor asegura un volumen de negocio más predecible. Comprar más volumen, eso sí, inmoviliza capital de trabajo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La cartera vencida ya supera la quinta parte de tus ventas",
    contexto:`El informe de edades de cartera de ${nombreEmpresaActual()} muestra que más del 20% de lo facturado lleva más de 60 días sin pagarse. En el estado de resultados esas ventas existen; en la caja, todavía no.`,
    choices:[
      {texto:"Contratar una firma de cobranza que cobra un porcentaje de lo recuperado.", efectos:{diasCartera:-15, caja:2, ebitda:-1},
       consecuencia:"La cartera empieza a moverse y entra efectivo, aunque la comisión de la firma sale de tu margen."},
      {texto:"Ofrecer un descuento por pronto pago a los clientes atrasados.", efectos:{diasCartera:-10, caja:3, ebitda:-1.5, razonCorriente:0.05},
       consecuencia:"Muchos clientes aprovechan el descuento y pagan: la caja respira, a costa de resignar parte del precio facturado."},
      {texto:"Vender la cartera vencida a una firma de factoring.", efectos:{diasCartera:-25, caja:5, ebitda:-3, razonCorriente:0.1},
       consecuencia:"Conviertes la cartera en efectivo de inmediato, pero el factoring la compra con un descuento fuerte: la liquidez te sale cara."},
      {texto:"Endurecer la política de crédito: nuevos pedidos solo de contado hasta que cada cliente se ponga al día.", efectos:{diasCartera:-8, razonCorriente:0.05, reputacion:-2, ebitda:-1},
       consecuencia:"Frenas el crecimiento de la cartera de raíz, aunque algunos clientes lo toman mal y reducen sus pedidos."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Varias obligaciones de corto plazo vencen el mismo mes",
    contexto:`Por cómo se fueron firmando los créditos y las facturas de proveedores, varias obligaciones de corto plazo vencen en el mismo mes. Tu razón corriente está en ${s.razonCorriente.toFixed(2)} y el banco la mira de cerca.`,
    choices:[
      {texto:"Refinanciar parte de las obligaciones a largo plazo con el banco.", efectos:{razonCorriente:0.25, wacc:0.4, deuda:2},
       consecuencia:"Al pasar deuda de corto a largo plazo, tu razón corriente mejora de golpe, aunque pagarás más intereses durante más tiempo."},
      {texto:"Vender un activo no estratégico para cubrir los vencimientos.", efectos:{caja:4, razonCorriente:0.2, ebitda:-1},
       consecuencia:"Conviertes un activo inmóvil en liquidez, aunque ese activo aportaba algo a la operación."},
      {texto:"Negociar con los proveedores un calendario de pagos escalonado.", efectos:{razonCorriente:0.1, confianzaProveedores:-4},
       consecuencia:"Ganas holgura sin pedir crédito, aunque los proveedores aceptan a regañadientes y lo recordarán en la próxima negociación."},
      {texto:"Pagar todo con la caja disponible y aplazar las inversiones del trimestre.", efectos:{caja:-5, razonCorriente:0.05, ebitda:-1, confianzaBanco:2},
       consecuencia:"Pagar pasivos corrientes con caja reduce los dos lados de la razón corriente: como tienes más activos que pasivos de corto plazo, la razón incluso mejora un poco. El costo es aplazar las inversiones que tenías previstas."}
    ]
  })
];

