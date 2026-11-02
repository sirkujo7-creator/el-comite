/* =========================================================================================
   SECTOR 2 · TECHNOVA — SaaS B2B (mecánica: burn rate + fuga de cerebros)
   Nov. 2026: 3 opciones por caso, todas defendibles; los efectos dependen de cómo esté la
   empresa (content/universal/contexto.js). En TechNova pesan sobre todo la liquidez (burn
   rate), la moral del equipo técnico y el endeudamiento frente al EBITDA.
   ========================================================================================= */
const TECHNOVA_CASES = [
(s,f)=>({ tipo:'caso', titulo:"El cliente ancla pide exclusividad y descuento",
  contexto:"Tu cliente más grande (40% de tus ingresos recurrentes) pide 30% de descuento a cambio de firmar un contrato de exclusividad por 2 años.",
  investigacion:{costo:2, boton:"Revisar el historial de renovación y descuentos del cliente ($2M)",
    reporte:"Tasa de renovación histórica del cliente: <b>92%</b>. Ha solicitado descuentos adicionales <b>3 veces</b> en los últimos 18 meses."},
  choices:[
    {texto:"Aceptar el descuento a cambio de la exclusividad de 2 años.",
     efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:-2, capitalTrabajo:2, wacc:-0.6, confianzaBanco:3}, {caja:-1, ebitda:-2.5, capitalTrabajo:2, wacc:-0.4, confianzaBanco:3}),
     consecuencia:"Aseguras ingreso recurrente a largo plazo, pero a un margen bastante más delgado del que tenías." + si(CONTEXTO.liquidezBaja(s), ' Con el burn rate apretando, dos años de ingreso seguro valen más que el margen que cedes.', ' Con la caja tranquila, pagaste caro una certeza que no necesitabas tanto.')},
    {texto:"Contraofertar un descuento del 15% con funcionalidades adicionales en vez de rebaja total.",
     efectos:{ebitda:si(CONTEXTO.equipoCansado(s), -1.6, -1), caja:-1, moralEquipo:si(CONTEXTO.equipoCansado(s), -4, -2), wacc:-0.2, reputacion:1},
     consecuencia:"Cedes menos margen del que pedían y le das algo de valor tangible a cambio, aunque tu equipo tiene que construir esas funcionalidades." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, las funcionalidades llegan tarde y con errores: el cliente reclama.', '')},
    {texto:"Proponer un esquema de precios por consumo, alineando el pago a su crecimiento real.",
     efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:0.2, caja:-2, capitalTrabajo:-2, diasCartera:10, wacc:0.5}, {ebitda:0.5, capitalTrabajo:-2, diasCartera:8, wacc:0.4}),
     consecuencia:"Cambias la conversación de 'descuento' a 'modelo de pago': si el cliente crece, tú creces con él, pero tu ingreso deja de ser fijo." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, un mes de bajo consumo del cliente te deja sin aire.', ' Tu caja aguanta la variación, aunque facturar por consumo alarga tu cartera.')}
  ],
  choiceInformado:{texto:"Con el patrón de descuentos repetidos, condicionar cualquier rebaja a un caso de éxito público y referidos verificables.", efectos:{ebitda:-1, caja:-1, reputacion:2},
    consecuencia:"Una tasa de renovación del 92% te dice que el cliente te necesita casi tanto como tú a él: tienes más poder de negociación del que aparentaba."}
}),
(s,f)=>({ tipo:'caso', titulo:"Financiamiento para escalar",
  contexto:"Necesitas $15.000.000 para acelerar el equipo de desarrollo y ventas antes de la siguiente ronda. El dinero se irá en contrataciones: lo que quede en caja será poco.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas del banco proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", plazo:'largo',
     efectos:{caja:8, capitalTrabajo:8, deuda:15, ebitda:1.2, wacc:si(CONTEXTO.apalancado(s), 1, si(CONTEXTO.bancoAmigo(s), 0.2, 0.5)), confianzaBanco:si(CONTEXTO.apalancado(s), -2, 1)},
     consecuencia:"Contratas y el equipo nuevo empieza a vender. Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas." + si(CONTEXTO.apalancado(s), ' Con tanta deuda frente a lo que generas, el banco cobró más y pidió garantías.', si(CONTEXTO.bancoAmigo(s), ' Tu buena relación con el banco te dio la mejor tasa fija.', ''))},
    {texto:"Tomar crédito bancario a tasa variable por $15M, más barato hoy.", plazo:'largo', setFlags:{deudaVariable:true},
     efectos:{caja:8, capitalTrabajo:8, deuda:15, ebitda:1.2, wacc:si(CONTEXTO.apalancado(s), 0.4, -0.3)},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado a lo que haga el Banco de la República." + si(CONTEXTO.apalancado(s), ' Ya estabas muy endeudado: si las tasas suben, la cuota variable te puede ahogar.', '')},
    {texto:"Levantar una ronda de inversión ángel, cediendo 20% de la empresa.",
     efectos:{caja:8, capitalTrabajo:8, ebitda:1.2, wacc:si(CONTEXTO.juntaDesconfia(s), 1.6, si(CONTEXTO.apalancado(s), 1.3, 1)), reputacion:si(CONTEXTO.juntaDesconfia(s), -3, 0), confianzaBanco:si(CONTEXTO.apalancado(s), 3, 0)},
     consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades y del control futuro de TechNova. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que ya dudaba de ti, lo leyó como pérdida de control.', si(CONTEXTO.apalancado(s), ' Con la deuda que ya cargabas, el banco agradece que no le pidieras más.', ''))}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", plazo:'largo', efectos:{caja:6, capitalTrabajo:6, deuda:12, ebitda:1, wacc:0.3, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
}),
(s,f)=>({ tipo:'caso', titulo:"Fuga de un desarrollador clave",
  contexto:"Tu arquitecto principal recibe una oferta de la competencia con 40% más de sueldo.",
  choices:[
    {texto:"Igualar la oferta de inmediato.",
     efectos:{caja:-2, ebitda:-1.5, moralEquipo:si(CONTEXTO.equipoCansado(s), 10, 6), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.08, 0)},
     consecuencia:"Retienes el talento crítico y el equipo lo nota: tu estructura de costos de desarrollo sube de forma permanente." + si(CONTEXTO.equipoCansado(s), ' Con la moral por el piso, el gesto calma a todo el equipo, no solo a él.', '')},
    {texto:"Ofrecer opciones accionarias en vez de igualar en efectivo.",
     efectos:{ebitda:-1, moralEquipo:si(CONTEXTO.liquidezBaja(s), 1, 3), wacc:si(CONTEXTO.juntaDesconfia(s), 0.8, 0.5)},
     consecuencia:"Alineas su incentivo con el crecimiento de largo plazo sin golpear tu caja hoy. Eso sí, cada opción que entregas diluye a los socios actuales." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, él duda de que esas acciones lleguen a valer algo.', '')},
    {texto:"Contraofertar con un bono de retención atado a resultados de los próximos dos trimestres.",
     efectos:{caja:-1.5, ebitda:si(CONTEXTO.equipoCansado(s), -1.5, -0.6), moralEquipo:si(CONTEXTO.equipoCansado(s), 0, 2)},
     consecuencia:"Condicionas la retención a resultados concretos, lo cual protege tu caja si el desempeño no acompaña." + si(CONTEXTO.equipoCansado(s), ' Pero un equipo agotado no cree en metas: se queda a medias y el ritmo cae.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Cae la renovación de clientes pequeños",
  contexto:"Una ola de cancelaciones golpea tu segmento de clientes pequeños: representan poco ingreso individual, pero en conjunto pesan en tu EBITDA.",
  choices:[
    {texto:"Recortar el equipo de soporte para bajar costos.",
     efectos:{ebitda:4, capitalTrabajo:1, moralEquipo:si(CONTEXTO.equipoCansado(s), -16, -12), reputacion:-6},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero la experiencia de los clientes que sí se quedan se resiente — y el resto del equipo técnico observa cómo tratas a quien ya no necesitas." + si(CONTEXTO.equipoCansado(s), ' Con la moral ya baja, el recorte suena a desbandada.', '')},
    {texto:"Reducir gastos generales sin tocar el equipo.",
     efectos:{ebitda:2, capitalTrabajo:1, caja:si(CONTEXTO.liquidezBaja(s), -2.5, -1)},
     consecuencia:"El ajuste es más lento, pero protege la atención al cliente y la moral. Cancelar antes de tiempo contratos de servicios y oficina tiene sus penalidades." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, esas penalidades duelen de verdad.', '')},
    {texto:"Lanzar un plan 'lite' más barato para retener a quienes quieren cancelar.",
     efectos:{ebitda:si(CONTEXTO.reputacionAlta(s), 0.5, -1), caja:1, capitalTrabajo:1, moralEquipo:-1},
     consecuencia:"Reduces la fuga a cambio de un ingreso promedio más bajo por cuenta, y soporte debe atender un plan más." + si(CONTEXTO.reputacionAlta(s), ' Tu marca es fuerte: muchos que iban a irse se quedan y algunos vuelven.', ' Pocos confían en la marca: el plan retiene menos de lo esperado.')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante. Tu contador sugiere capitalizar de forma indebida gastos de desarrollo que deberían registrarse como costo del periodo.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 6, 4), confianzaBanco:8, wacc:-0.5, reputacion:si(CONTEXTO.juntaDesconfia(s), -8, -4)},
     setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que ya te vigilaba, nota que las cifras no cuadran.', '')},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.",
     efectos:{caja:si(CONTEXTO.bancoAmigo(s), -1, -2), confianzaBanco:si(CONTEXTO.bancoAmigo(s), 8, 6), razonCorriente:0.1, wacc:-0.2, reputacion:4},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable." + si(CONTEXTO.bancoAmigo(s), ' El banco te conoce: recorta poco y valora la franqueza.', ' Sin historia con el banco, el recorte del monto es fuerte.')},
    {texto:"Mejorar los indicadores reales primero, cobrando cartera atrasada de clientes enterprise.",
     efectos:{caja:3, capitalTrabajo:3, confianzaBanco:3, diasCartera:si(CONTEXTO.reputacionAlta(s), -12, -6), ebitda:si(CONTEXTO.liquidezBaja(s), -1.6, -1)},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Mientras tanto, el crecimiento que pensabas financiar queda en pausa." + si(CONTEXTO.liquidezBaja(s), ' Con la caja tan justa, la pausa frena ventas que necesitabas.', '') + si(CONTEXTO.reputacionAlta(s), ' Tu reputación ayuda: los clientes pagan sin pelear.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Un cliente grande pide integración personalizada gratuita",
  contexto:"Tu cliente más grande, que representa una porción importante de tus ingresos recurrentes, condiciona la renovación de su contrato a que desarrolles una integración personalizada con su sistema interno — sin costo adicional.",
  investigacion:{costo:1, boton:"Pedir a ingeniería una estimación real de horas de desarrollo ($1M)",
    reporte:"El equipo estima que la integración tomaría <b>3 semanas completas</b> de un desarrollador senior, tiempo que hoy está asignado a funcionalidades del roadmap general del producto."},
  choices:[
    {texto:"Aceptar y desarrollar la integración gratuita para asegurar la renovación.",
     efectos:{caja:-1.5, ebitda:-0.5, moralEquipo:si(CONTEXTO.equipoCansado(s), -6, -3), wacc:-0.5, reputacion:2},
     consecuencia:"Retienes al cliente más grande y tu ingreso recurrente más importante queda asegurado, a costa de desarrollo no presupuestado y de un equipo que siente que trabaja gratis." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, la sensación de trabajar gratis pesa el doble.', '')},
    {texto:"Rechazar la integración gratuita y ofrecerla como un desarrollo pago aparte.",
     efectos:si(CONTEXTO.reputacionAlta(s), {ebitda:1, caja:1, wacc:0.2, moralEquipo:-1}, {ebitda:0.6, diasCartera:10, wacc:0.6, reputacion:-1}),
     consecuencia:"Proteges tu roadmap y tu margen, arriesgando la renovación de tu cliente más importante." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación pesa: el cliente acepta pagar, aunque tu equipo carga con un desarrollo más.', ' El cliente paga, pero molesto: retrasa los pagos y empieza a cotizar con la competencia.')},
    {texto:"Ofrecer una versión simplificada de la integración, gratis, y la versión completa como pago adicional.",
     efectos:{caja:-1, ebitda:-0.3, moralEquipo:-1, reputacion:-1},
     consecuencia:"Un punto medio que el cliente acepta, aunque no queda tan satisfecho como con la integración completa que pedía."}
  ],
  choiceInformado:{texto:"Con el costo real de 3 semanas confirmado, ofrecer la versión simplificada gratis y la completa como pago adicional.", efectos:{caja:-1, ebitda:1},
    consecuencia:"Conocer el costo exacto en horas te da el argumento preciso para no regalar más desarrollo del que la relación comercial justifica."}
}),
];
function TECHNOVA_NOMINA(s,f){ return {tipo:'calendario', titulo:"Nómina y bonos del equipo técnico",
  contexto:"Toca pagar la nómina completa del equipo de desarrollo y ventas, más los bonos trimestrales comprometidos.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9, moralEquipo:si(CONTEXTO.equipoCansado(s), 3, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
     consecuencia:"Cumples en tiempo y forma." + si(CONTEXTO.liquidezBaja(s), ' Pero con la caja tan justa, el pago deja tu liquidez en rojo.', '')},
    {texto:"Pagar salarios completos, pero diferir los bonos 30 días con acuerdo del equipo.", efectos:{caja:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -12, -6)}, diferir:{monto:3.3, turnos:1, motivo:"Bonos diferidos al equipo", tipo:'nomina'},
     consecuencia:"El equipo acepta por esta vez, aunque un bono aplazado repetidamente erosiona rápido la confianza en el sector tecnológico." + si(CONTEXTO.equipoCansado(s), ' Con la moral baja, algunos empiezan a contestar llamadas de reclutadores.', '')},
    {texto:"Tomar un crédito de nómina de corto plazo.", efectos:{deuda:5, wacc:si(CONTEXTO.apalancado(s), 0.9, 0.4), caja:-4},
     consecuencia:"Evitas fricción con el equipo, pero sumas una deuda más a tu estructura de capital." + si(CONTEXTO.apalancado(s), ' Ya cargabas mucha deuda frente a tu EBITDA: el crédito sale caro.', '')}
  ]};}
function TECHNOVA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta y facturación de servicios digitales",
  contexto:"Llega la fecha de declarar renta, incluyendo la retención especial que aplica sobre ingresos de servicios digitales.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7, confianzaBanco:4, wacc:-0.1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Cumples sin generar ninguna obligación adicional. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la DIAN.", efectos:{caja:-2, deuda:5, wacc:si(CONTEXTO.bancoAmigo(s), 0.2, 0.4)},
     consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario especializado en economía digital.", efectos:{caja:-6, ebitda:0.4},
     consecuencia:"Los honorarios cuestan, pero el asesor identifica deducciones legítimas específicas del sector."}
  ]};}
const TECHNOVA_RANDOM = [
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"tu factura mensual de infraestructura cloud (AWS/Azure), que pagas en dólares"),
  (s,f)=>MACRO_TASA_INTERES(s,f),
  (s,f)=>MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,"tus ingresos por suscripciones digitales"),
  (s,f)=>({tipo:'random', titulo:"Caída del servicio por 6 horas",
    contexto:"Un error en un despliegue tumba la plataforma durante 6 horas en horario laboral. Varios clientes enterprise reportan pérdidas operativas por la caída.",
    choices:[
      {texto:"Compensar a los clientes afectados con crédito en su próxima factura.", efectos:{caja:-2.5, ebitda:-1, reputacion:si(CONTEXTO.juntaDesconfia(s), 4, 3)},
       consecuencia:"El gesto calma a los clientes más grandes, aunque tiene un costo directo en ingreso reconocido." + si(CONTEXTO.juntaDesconfia(s), ' Con la junta dudando de ti, responder rápido a los clientes recupera algo de terreno.', '')},
      {texto:"Invertir de inmediato en redundancia de infraestructura para que no vuelva a pasar.", efectos:{caja:-6, wacc:si(CONTEXTO.liquidezHolgada(s), -0.3, -0.1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)}, capex:true,
       consecuencia:"Resuelves la causa raíz del problema, a un costo de inversión considerable este periodo." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, la inversión te deja sin colchón.', si(CONTEXTO.liquidezHolgada(s), ' Tenías con qué: el banco ve una empresa que invierte en su solidez.', ''))},
      {texto:"Contratar temporalmente un proveedor externo de monitoreo 24/7 mientras se refuerza el equipo interno.", efectos:{caja:-2, ebitda:-1, moralEquipo:si(CONTEXTO.equipoCansado(s), 2, 0)},
       consecuencia:"Ganas tranquilidad operativa de corto plazo sin comprometer una inversión estructural todavía." + si(CONTEXTO.equipoCansado(s), ' Tu equipo, agotado, agradece no tener que hacer guardias de noche.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un competidor lanza una función clon",
    contexto:"Un competidor directo lanza una copia casi idéntica de tu función más popular, a menor precio.",
    choices:[
      {texto:"Bajar el precio de esa función para no perder clientes por costo.", efectos:{ebitda:si(CONTEXTO.liquidezBaja(s), -1.5, -2), wacc:-0.2, confianzaBanco:1},
       consecuencia:"Mantienes tu base de clientes, aunque cediste margen en tu diferencial más fuerte." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, no perder ni un cliente era prioridad.', '')},
      {texto:"Acelerar el desarrollo de la siguiente versión para mantenerte adelante.", efectos:{caja:-3, ebitda:-1, moralEquipo:si(CONTEXTO.equipoCansado(s), -7, -3), reputacion:si(CONTEXTO.equipoCansado(s), 1, 4)},
       consecuencia:"Presionas al equipo técnico a un ritmo más alto de lo planeado, a cambio de no perder la ventaja competitiva." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, la versión sale tarde y con errores.', '')},
      {texto:"Comunicar activamente a tus clientes las diferencias técnicas reales frente al clon.", efectos:{caja:-2, ebitda:si(CONTEXTO.reputacionAlta(s), 1, -1)},
       consecuencia:"Inviertes en educar al mercado sobre por qué tu producto es distinto, sin tocar precio ni forzar al equipo." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación hace creíble el mensaje: los clientes se quedan.', ' Sin una marca fuerte, el mensaje suena a excusa y algunos se van.')}
    ]}),
  (s,f)=>({
    tipo:'random', titulo:"Vulnerabilidad de seguridad crítica en tu producto",
    contexto:"Un investigador de seguridad independiente te contacta de forma responsable: encontró una vulnerabilidad crítica en tu plataforma que podría exponer datos de clientes si se explota.",
    choices:[
      {texto:"Corregirla de inmediato con un equipo dedicado, aunque signifique pausar otros desarrollos.", efectos:{caja:-4, ebitda:-2, reputacion:4, moralEquipo:si(CONTEXTO.equipoCansado(s), -3, 0)},
       consecuencia:"El sprint se reorganiza por completo, pero cierras la vulnerabilidad antes de que alguien más la encuentre con peores intenciones." + si(CONTEXTO.equipoCansado(s), ' El equipo, ya agotado, encadena otra semana de noches largas.', '')},
      {texto:"Corregirla en el próximo ciclo de desarrollo normal, sin alterar el roadmap actual.", efectos:{reputacion:si(CONTEXTO.juntaDesconfia(s), -6, -3), ebitda:0.5},
       consecuencia:"Ahorras la disrupción inmediata, aunque cada día que la vulnerabilidad sigue abierta es un día de riesgo que decidiste tolerar. El roadmap, al menos, sale a tiempo." + si(CONTEXTO.juntaDesconfia(s), ' La junta se entera de la demora y la anota en tu cuenta.', '')},
      {texto:"Pagarle una recompensa al investigador y hacer pública la corrección como gesto de transparencia.", efectos:{caja:-5, ebitda:-2, reputacion:si(CONTEXTO.reputacionAlta(s), 8, 5)},
       consecuencia:"El programa de recompensas es costoso, pero construye una reputación de seguridad tomada en serio — algo que tus clientes B2B valoran mucho." + si(CONTEXTO.reputacionAlta(s), ' Con una marca ya sólida, el gesto te pone como referente del sector.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un desarrollador clave se va con conocimiento del código",
    contexto:"Tu arquitecto de software principal renuncia para irse a un competidor directo. Se lleva consigo un conocimiento profundo de tu arquitectura que no está completamente documentado.",
    choices:[
      {texto:"Ofrecerle un paquete de salida a cambio de dos semanas de transferencia de conocimiento documentada.", efectos:{caja:-3, ebitda:-1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.06, 0)},
       consecuencia:"Pagar por una salida ordenada es mucho más barato que reconstruir ese conocimiento perdido desde cero más adelante."},
      {texto:"Contratar rápidamente un reemplazo senior, aunque cueste más de lo presupuestado.", efectos:{caja:-5, ebitda:-0.5, moralEquipo:si(CONTEXTO.equipoCansado(s), 3, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
       consecuencia:"Reduces el vacío técnico más rápido, a un costo salarial más alto del que tenías planeado para ese cargo." + si(CONTEXTO.equipoCansado(s), ' El equipo, agotado, respira al ver que llega refuerzo.', '')},
      {texto:"Iniciar de inmediato un plan de documentación técnica exhaustiva como política permanente.", efectos:{caja:-2, ebitda:-2, wacc:-0.1, moralEquipo:si(CONTEXTO.equipoCansado(s), -3, 0)},
       consecuencia:"No resuelve la pérdida actual, pero reduce el riesgo de que la próxima salida clave duela tanto como esta. Mientras tanto, el vacío sigue frenando el desarrollo." + si(CONTEXTO.equipoCansado(s), ' Al equipo cansado le cae encima otra tarea más.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un inversionista ángel ofrece una ronda de financiamiento",
    contexto:"Un inversionista ángel con buen historial en SaaS te ofrece una ronda de financiamiento a cambio de una participación accionaria y un puesto en el comité asesor.",
    choices:[
      {texto:"Aceptar la ronda completa y ceder la participación y el puesto asesor solicitados.", efectos:{caja:9, deuda:-2, ebitda:1, reputacion:si(CONTEXTO.juntaDesconfia(s), -3, -1), wacc:si(CONTEXTO.juntaDesconfia(s), 1.5, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), 0.2, 0)},
       consecuencia:"El capital fresco acelera tu contratación y desarrollo de producto, aunque ahora respondes también ante un nuevo asesor con voz en decisiones clave." + si(CONTEXTO.liquidezBaja(s), ' Con la caja como estaba, ese dinero llega justo a tiempo.', '') + si(CONTEXTO.juntaDesconfia(s), ' La junta lo lee como que necesitas que alguien te vigile.', '')},
      {texto:"Negociar una ronda más pequeña sin ceder puesto en el comité asesor.", efectos:{caja:4, wacc:0.5, ebitda:si(CONTEXTO.reputacionAlta(s), 0.5, 0)},
       consecuencia:"Consigues parte del capital manteniendo tu autonomía completa. Ese capital, eso sí, espera un retorno alto: tu costo de capital sube." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación te dio poder de negociación: el ángel acepta y abre su red de clientes.', '')},
      {texto:"Rechazar la oferta y seguir financiando el crecimiento solo con ingresos propios.", efectos:si(CONTEXTO.liquidezBaja(s), {capitalTrabajo:-3, razonCorriente:-0.08, reputacion:1}, {capitalTrabajo:-1, reputacion:1}),
       consecuencia:"Mantienes control total, a costa de un ritmo de crecimiento más lento del que el capital fresco hubiera permitido." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez así, rechazar dinero te deja sin colchón.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un cliente grande pide una integración personalizada fuera de roadmap",
    contexto:"Tu cliente más grande, que representa una porción considerable de tu ingreso recurrente, pide una integración técnica muy específica que no está en tu roadmap de producto.",
    choices:[
      {texto:"Desarrollarla como proyecto especial, cobrando un fee adicional por el trabajo a la medida.", efectos:{caja:3, ebitda:-1, capitalTrabajo:1, moralEquipo:si(CONTEXTO.equipoCansado(s), -4, -1)},
       consecuencia:"Satisfaces a tu cliente más importante y cobras por el esfuerzo, aunque desvías recursos de desarrollo que tenías planeados." + si(CONTEXTO.equipoCansado(s), ' El equipo agotado lo vive como otra carga encima.', '')},
      {texto:"Incluir la funcionalidad en el roadmap general del producto, beneficiando a todos los clientes.", efectos:{ebitda:-2, reputacion:si(CONTEXTO.reputacionAlta(s), 5, 3), diasCartera:si(CONTEXTO.liquidezBaja(s), 6, 0)},
       consecuencia:"Conviertes una petición puntual en una mejora para toda tu base de clientes, aunque tarda más en estar lista de lo que tu cliente esperaba." + si(CONTEXTO.liquidezBaja(s), ' Mientras espera, el cliente se toma su tiempo para pagar, y tu caja no da para eso.', '')},
      {texto:"Subcontratar el desarrollo a un desarrollador independiente para no distraer a tu equipo interno.", efectos:{caja:-2, ebitda:1, reputacion:si(CONTEXTO.juntaDesconfia(s), -2, 0), wacc:0.1},
       consecuencia:"Resuelves la petición sin sacrificar tu roadmap interno, a cambio de depender de un tercero para algo que toca directamente tu producto." + si(CONTEXTO.juntaDesconfia(s), ' La junta pregunta quién controla el código de tu cliente más grande.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Caída prolongada del proveedor de infraestructura en la nube",
    contexto:"Tu proveedor de servicios en la nube sufre una caída regional que deja tu plataforma inaccesible durante varias horas, justo durante el horario pico de uso de tus clientes empresariales.",
    choices:[
      {texto:"Comunicar de inmediato y con total transparencia el incidente a todos tus clientes.", efectos:{reputacion:si(CONTEXTO.reputacionAlta(s), 4, 2), moralEquipo:si(CONTEXTO.equipoCansado(s), -3, -1), ebitda:-0.5},
       consecuencia:"La comunicación clara durante una falla que no fue tu culpa directa ayuda a que tus clientes no sobrerreaccionen, aunque algunos piden descuentos y soporte pasa el día desbordado." + si(CONTEXTO.reputacionAlta(s), ' Con tu reputación, los clientes te creen a la primera.', '')},
      {texto:"Migrar a una arquitectura multi-nube para reducir la dependencia de un solo proveedor.", efectos:{caja:-6, wacc:-0.2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"Es una inversión considerable en resiliencia técnica que reduce drásticamente el riesgo de que esto se repita." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, la migración te deja la liquidez en rojo.', '')},
      {texto:"Ofrecer una compensación en forma de crédito de servicio a los clientes afectados.", efectos:{caja:-2, reputacion:si(CONTEXTO.juntaDesconfia(s), 5, 3), ebitda:-0.5},
       consecuencia:"El gesto cuesta ingreso recurrente, pero refuerza la confianza de tus clientes empresariales en los momentos en que más se necesita." + si(CONTEXTO.juntaDesconfia(s), ' La junta valora que protejas a los clientes grandes.', '')}
    ]
  })
];
