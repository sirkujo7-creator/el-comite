/* =========================================================================================
   SECTOR 2 · TECHNOVA — SaaS B2B (mecánica: burn rate + fuga de cerebros)
   ========================================================================================= */
const TECHNOVA_CASES = [
{ tipo:'caso', titulo:"El cliente ancla pide exclusividad y descuento",
  contexto:"Tu cliente más grande (40% de tus ingresos recurrentes) pide 30% de descuento a cambio de firmar un contrato de exclusividad por 2 años.",
  investigacion:{costo:2, boton:"Revisar el historial de renovación y descuentos del cliente ($2M)",
    reporte:"Tasa de renovación histórica del cliente: <b>92%</b>. Ha solicitado descuentos adicionales <b>3 veces</b> en los últimos 18 meses."},
  choices:[
    {texto:"Aceptar el descuento a cambio de la exclusividad de 2 años.", efectos:{caja:-3, ebitda:-4, capitalTrabajo:2},
     consecuencia:"Aseguras ingreso recurrente a largo plazo, pero a un margen bastante más delgado del que tenías."},
    {texto:"Ofrecer un descuento menor (15%) con funcionalidades adicionales en vez de rebaja total.", efectos:{ebitda:-1, caja:-1},
     consecuencia:"Cedes menos margen del que pedían y le das algo de valor tangible a cambio — una negociación más equilibrada."},
    {texto:"Rechazar el descuento y arriesgar la renovación.", efectos:{caja:1, ebitda:1},
     consecuencia:"Proteges tu margen por completo, aunque te expones a perder el 40% de tu ingreso recurrente si el cliente decide no renovar."},
    {texto:"Proponer pricing por consumo, alineando el pago a su crecimiento real.", efectos:{ebitda:0.5, capitalTrabajo:-1, wacc:-0.1},
     consecuencia:"Cambias la conversación de 'descuento' a 'modelo de pago': si el cliente crece, tú creces con él; si no, tampoco pierdes tanto margen."}
  ],
  choiceInformado:{texto:"Con el patrón de descuentos repetidos, condicionar cualquier rebaja a un caso de éxito público y referidos verificables.", efectos:{ebitda:-1, caja:-1},
    consecuencia:"Una tasa de renovación del 92% te dice que el cliente te necesita casi tanto como tú a él: tienes más poder de negociación del que aparentaba."}
},
{ tipo:'caso', titulo:"Financiamiento para escalar",
  contexto:"Necesitas $15.000.000 para acelerar el equipo de desarrollo y ventas antes de la siguiente ronda.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas del banco proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", efectos:{caja:15, deuda:15, wacc:0.5, capitalTrabajo:15},
     consecuencia:"Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas del mercado."},
    {texto:"Tomar crédito bancario a tasa variable por $15M, más barata hoy.", efectos:{caja:15, deuda:15, wacc:-0.3, capitalTrabajo:15}, setFlags:{deudaVariable:true},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado a lo que haga el Banco de la República."},
    {texto:"Levantar una ronda de inversión ángel, cediendo 20% de la empresa.", efectos:{caja:15, capitalTrabajo:15},
     consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades y del control futuro de TechNova."},
    {texto:"Tomar venture debt: deuda respaldada por tus inversionistas actuales, con warrants a favor de ellos.", efectos:{caja:12, deuda:12, wacc:0.8, capitalTrabajo:12},
     consecuencia:"Cuesta un poco más que un crédito tradicional y cede pequeñas opciones futuras, pero no diluye tu control operativo hoy."}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", efectos:{caja:12, deuda:12, wacc:0.3, capitalTrabajo:12, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
},
{ tipo:'caso', titulo:"Fuga de un desarrollador clave",
  contexto:"Tu arquitecto principal recibe una oferta de la competencia con 40% más de sueldo.",
  choices:[
    {texto:"Igualar la oferta de inmediato.", efectos:{caja:-3, ebitda:-2, moralEquipo:6}, consecuencia:"Retienes el talento crítico y el equipo lo nota: tu estructura de costos de desarrollo sube de forma permanente, pero la moral se sostiene."},
    {texto:"Ofrecer opciones accionarias en vez de igualar en efectivo.", efectos:{ebitda:-1, moralEquipo:3}, consecuencia:"Alineas su incentivo con el crecimiento de largo plazo de la empresa, sin golpear tanto tu caja hoy."},
    {texto:"Dejarlo ir y redistribuir el conocimiento en el equipo.", efectos:{ebitda:-3, capitalTrabajo:-1, moralEquipo:-10}, consecuencia:"Pierdes velocidad de desarrollo por varios meses, y el resto del equipo se pregunta si es momento de mirar otras ofertas también."},
    {texto:"Contraofertar con un bono de retención atado a resultados de los próximos dos trimestres.", efectos:{caja:-1, ebitda:-1, moralEquipo:2}, consecuencia:"Condicionas la retención a resultados concretos, lo cual protege tu caja si el desempeño no acompaña."}
  ]
},
{ tipo:'caso', titulo:"Cae la renovación de clientes pequeños",
  contexto:"Una ola de cancelaciones golpea tu segmento de clientes pequeños: representan poco ingreso individual, pero en conjunto pesan en tu EBITDA.",
  choices:[
    {texto:"Recortar el equipo de soporte para bajar costos.", efectos:{ebitda:4, capitalTrabajo:1, moralEquipo:-12, reputacion:-6},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero la experiencia de los clientes que sí se quedan se resiente — y el resto del equipo técnico observa cómo tratas a quien ya no necesitas."},
    {texto:"Reducir gastos generales sin tocar el equipo.", efectos:{ebitda:2, capitalTrabajo:1}, consecuencia:"El ajuste es más lento, pero protege la capacidad de atención al cliente y la moral del equipo."},
    {texto:"Tomar un crédito puente para sostener la operación.", efectos:{caja:6, deuda:8, wacc:0.5, capitalTrabajo:4}, consecuencia:"Ganas tiempo sin recortar nada, pero sumas deuda justo cuando tu ingreso recurrente es más bajo."},
    {texto:"Lanzar un plan 'lite' más barato para retener a quienes quieren cancelar.", efectos:{ebitda:-1, caja:1, capitalTrabajo:1}, consecuencia:"Reduces la fuga de clientes a cambio de un ingreso promedio más bajo por cuenta."}
  ]
},
{ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante. Tu contador sugiere capitalizar de forma indebida gastos de desarrollo que deberían registrarse como costo del periodo.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.", efectos:{caja:5, confianzaBanco:15, wacc:-1, reputacion:-4}, setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales."},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.", efectos:{caja:-3, confianzaBanco:5, razonCorriente:0.05, reputacion:5},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable."},
    {texto:"Mejorar los indicadores reales primero, cobrando cartera atrasada de clientes enterprise.", efectos:{caja:2, capitalTrabajo:3, confianzaBanco:3, ebitda:1, reputacion:2},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel."},
    {texto:"Buscar venture debt en lugar de crédito bancario, sin tocar la contabilidad.", efectos:{caja:4, wacc:1, deuda:4},
     consecuencia:"Consigues capital sin mentir en tus estados financieros, a un costo algo mayor que el crédito bancario tradicional."}
  ]
},
{ tipo:'caso', titulo:"Un cliente grande pide integración personalizada gratuita",
  contexto:"Tu cliente más grande, que representa una porción importante de tus ingresos recurrentes, condiciona la renovación de su contrato a que desarrolles una integración personalizada con su sistema interno — sin costo adicional.",
  investigacion:{costo:1, boton:"Pedir a ingeniería una estimación real de horas de desarrollo ($1M)",
    reporte:"El equipo estima que la integración tomaría <b>3 semanas completas</b> de un desarrollador senior, tiempo que hoy está asignado a funcionalidades del roadmap general del producto."},
  choices:[
    {texto:"Aceptar y desarrollar la integración gratuita para asegurar la renovación.", efectos:{caja:-3, ebitda:-1, moralEquipo:-3}, consecuencia:"Retienes al cliente más grande, a costa de tiempo de desarrollo que no estaba presupuestado y de un equipo que siente que trabaja gratis para un solo cliente."},
    {texto:"Rechazar la integración gratuita y ofrecerla como un desarrollo pago aparte.", efectos:{ebitda:-0.5}, consecuencia:"Proteges tu roadmap y tu margen, arriesgando la renovación de tu cliente más importante."},
    {texto:"Ofrecer una versión simplificada de la integración, gratis, y la versión completa como pago adicional.", efectos:{caja:-1, ebitda:0.5}, consecuencia:"Un punto medio que el cliente acepta, aunque no queda tan satisfecho como con la integración completa que pedía."},
    {texto:"Convertir la integración en un caso de estudio público a cambio de hacerla gratis, ganando marketing.", efectos:{caja:-2, ebitda:-0.5, reputacion:3}, consecuencia:"Absorbes el costo de desarrollo, pero lo capitalizas como material comercial para atraer clientes similares."}
  ],
  choiceInformado:{texto:"Con el costo real de 3 semanas confirmado, ofrecer la version simplificada gratis y la completa como pago adicional.", efectos:{caja:0, ebitda:1},
    consecuencia:"Conocer el costo exacto en horas te da el argumento preciso para no regalar más desarrollo del que la relación comercial justifica."}
},
];
function TECHNOVA_NOMINA(s,f){ return {tipo:'calendario', titulo:"Nómina y bonos del equipo técnico",
  contexto:"Toca pagar la nómina completa del equipo de desarrollo y ventas, más los bonos trimestrales comprometidos.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9}, consecuencia:"Cumples en tiempo y forma, sin costo adicional."},
    {texto:"Pagar salarios completos, pero diferir los bonos 30 días con acuerdo del equipo.", efectos:{caja:-6, moralEquipo:-8}, diferir:{monto:3.3, turnos:1, motivo:"Bonos diferidos al equipo", tipo:'nomina'},
     consecuencia:"El equipo acepta por esta vez, aunque un bono aplazado repetidamente erosiona la confianza rápido en el sector tech."},
    {texto:"Tomar un crédito de nómina de corto plazo.", efectos:{deuda:5, wacc:0.5, caja:-4}, consecuencia:"Evitas fricción con el equipo, pero sumas una deuda más a tu estructura de capital."},
    {texto:"Congelar los bonos por este trimestre y comunicarlo abiertamente al equipo.", efectos:{caja:-6, moralEquipo:-15}, consecuencia:"Ahorras el gasto del bono por completo, pero la señal de austeridad golpea directo la moral de tu equipo técnico."}
  ]};}
function TECHNOVA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta y facturación de servicios digitales",
  contexto:"Llega la fecha de declarar renta, incluyendo la retención especial que aplica sobre ingresos de servicios digitales.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7}, consecuencia:"Cumples sin generar ninguna obligación adicional."},
    {texto:"Acogerse a una facilidad de pago con la DIAN.", efectos:{caja:-2, deuda:5, wacc:0.4}, consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario especializado en economía digital.", efectos:{caja:-5, ebitda:0.5}, consecuencia:"Sus honorarios tienen costo, pero identifica deducciones legítimas específicas del sector."},
    {texto:"Usar parte de la reserva de contingencia para cubrir el pago.", efectos:{razonCorriente:-0.08, caja:-7}, consecuencia:"Cumples igual, pero sacrificas el colchón construido para otro tipo de imprevistos."}
  ]};}
const TECHNOVA_RANDOM = [
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"tu factura mensual de infraestructura cloud (AWS/Azure), que pagas en dólares"),
  (s,f)=>MACRO_TASA_INTERES(s,f),
  (s,f)=>MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,"tus ingresos por suscripciones digitales"),
  (s,f)=>({tipo:'random', titulo:"Caída del servicio por 6 horas",
    contexto:"Un error en un despliegue tumba la plataforma durante 6 horas en horario laboral. Varios clientes enterprise reportan pérdidas operativas por la caída.",
    choices:[
      {texto:"Compensar a los clientes afectados con crédito en su próxima factura.", efectos:{caja:-3, ebitda:-1}, consecuencia:"El gesto calma a los clientes más grandes, aunque tiene un costo directo en ingreso reconocido."},
      {texto:"Invertir de inmediato en redundancia de infraestructura para que no vuelva a pasar.", efectos:{caja:-6, wacc:-0.1}, capex:true, consecuencia:"Resuelves la causa raíz del problema, a un costo de inversión considerable este periodo."},
      {texto:"Comunicar el incidente de forma mínima y seguir operando sin cambios estructurales.", efectos:{ebitda:-2}, consecuencia:"Ahorras el gasto de inversión, pero varios clientes empiezan a evaluar alternativas por la falta de una respuesta contundente."},
      {texto:"Contratar temporalmente un proveedor externo de monitoreo 24/7 mientras se refuerza el equipo interno.", efectos:{caja:-2, ebitda:-1}, consecuencia:"Ganas tranquilidad operativa de corto plazo sin comprometer una inversión estructural todavía."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un competidor lanza una función clon",
    contexto:"Un competidor directo lanza una copia casi idéntica de tu función más popular, a menor precio.",
    choices:[
      {texto:"Bajar el precio de esa función para no perder clientes por costo.", efectos:{ebitda:-3}, consecuencia:"Mantienes tu base de clientes, aunque cediste margen en tu diferencial más fuerte."},
      {texto:"Acelerar el desarrollo de la siguiente versión para mantenerte adelante.", efectos:{caja:-4, ebitda:-1, moralEquipo:-3}, consecuencia:"Presionas al equipo técnico a un ritmo más alto de lo planeado, a cambio de no perder la ventaja competitiva."},
      {texto:"No reaccionar y confiar en tu servicio al cliente como diferencial.", efectos:{ebitda:-1}, consecuencia:"Ahorras cualquier inversión de reacción, apostando a que la relación con tus clientes actuales pese más que el precio."},
      {texto:"Comunicar activamente a tus clientes las diferencias técnicas reales frente al clon.", efectos:{caja:-1, ebitda:0.5}, consecuencia:"Inviertes en educar al mercado sobre por qué tu producto es distinto, sin tocar precio ni acelerar desarrollo de forma forzada."}
    ]}),

  (s,f)=>({
    tipo:'random', titulo:"Vulnerabilidad de seguridad crítica en tu producto",
    contexto:"Un investigador de seguridad independiente te contacta de forma responsable: encontró una vulnerabilidad crítica en tu plataforma que podría exponer datos de clientes si se explota.",
    choices:[
      {texto:"Corregirla de inmediato con un equipo dedicado, aunque signifique pausar otros desarrollos.", efectos:{caja:-4, ebitda:-2, reputacion:4},
       consecuencia:"El sprint se reorganiza por completo, pero cierras la vulnerabilidad antes de que alguien más la encuentre con peores intenciones."},
      {texto:"Corregirla en el próximo ciclo de desarrollo normal, sin alterar el roadmap actual.", efectos:{reputacion:-3},
       consecuencia:"Ahorras la disrupción inmediata, aunque cada día que la vulnerabilidad sigue abierta es un día de riesgo que decidiste tolerar."},
      {texto:"Pagarle una recompensa al investigador y hacer pública la corrección como gesto de transparencia.", efectos:{caja:-2, reputacion:6},
       consecuencia:"El programa de recompensas por vulnerabilidades es costoso, pero construye una reputación de seguridad tomada en serio — algo que tus clientes B2B valoran mucho."},
      {texto:"Pedirle al investigador que no divulgue nada mientras decides qué hacer, sin comprometerte a un plazo.", efectos:{reputacion:-2},
       consecuencia:"Ganas tiempo, aunque un investigador de seguridad tratado sin claridad puede optar por la divulgación pública de todas formas."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un desarrollador clave se va con conocimiento del código",
    contexto:"Tu arquitecto de software principal renuncia para irse a un competidor directo. Se lleva consigo un conocimiento profundo de tu arquitectura que no está completamente documentado.",
    choices:[
      {texto:"Ofrecerle un paquete de salida a cambio de dos semanas de transferencia de conocimiento documentada.", efectos:{caja:-3, ebitda:-1},
       consecuencia:"Pagar por una salida ordenada es mucho más barato que reconstruir ese conocimiento perdido desde cero más adelante."},
      {texto:"Dejarlo ir sin condiciones adicionales y asumir el riesgo de la documentación faltante.", efectos:{ebitda:-2, moralEquipo:-3},
       consecuencia:"El equipo que se queda absorbe la carga de reconstruir el conocimiento perdido sobre la marcha, mientras la operación sigue exigiendo lo mismo de siempre."},
      {texto:"Contratar rápidamente un reemplazo senior, aunque cueste más de lo presupuestado.", efectos:{caja:-5, ebitda:-1},
       consecuencia:"Reduces el vacío técnico más rápido, a un costo salarial más alto del que tenías planeado para ese cargo."},
      {texto:"Iniciar de inmediato un plan de documentación técnica exhaustiva como política permanente.", efectos:{caja:-2, ebitda:-1},
       consecuencia:"No resuelve la pérdida actual, pero reduce sustancialmente el riesgo de que la próxima salida clave duela tanto como esta."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un inversionista ángel ofrece una ronda de financiamiento",
    contexto:"Un inversionista ángel con buen historial en SaaS te ofrece una ronda de financiamiento a cambio de una participación accionaria y un puesto en el comité asesor.",
    choices:[
      {texto:"Aceptar la ronda completa y ceder la participación y el puesto asesor solicitados.", efectos:{caja:9, deuda:-2, ebitda:1, reputacion:-1},
       consecuencia:"El capital fresco acelera tu contratación y desarrollo de producto, aunque ahora respondes también ante un nuevo asesor con voz en decisiones clave — y el equipo original nota que las decisiones ya no son solo tuyas."},
      {texto:"Negociar una ronda más pequeña sin ceder puesto en el comité asesor.", efectos:{caja:4},
       consecuencia:"Consigues parte del capital manteniendo tu autonomía completa en la toma de decisiones."},
      {texto:"Rechazar la oferta y seguir financiando el crecimiento solo con ingresos propios.", efectos:{capitalTrabajo:-1},
       consecuencia:"Mantienes control total, a costa de un ritmo de crecimiento más lento del que el capital fresco hubiera permitido."},
      {texto:"Pedir referencias de otros fundadores que ya trabajaron con este inversionista antes de decidir.", efectos:{caja:-0.3},
       consecuencia:"Te tomas el tiempo de investigar con quién te vas a asociar, antes de ceder ni un punto porcentual de tu empresa."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un cliente grande pide una integración personalizada fuera de roadmap",
    contexto:"Tu cliente más grande, que representa una porción considerable de tu ingreso recurrente, pide una integración técnica muy específica que no está en tu roadmap de producto.",
    choices:[
      {texto:"Desarrollarla como proyecto especial, cobrando un fee adicional por el trabajo a la medida.", efectos:{caja:3, ebitda:-1, capitalTrabajo:1},
       consecuencia:"Satisfaces a tu cliente más importante y cobras por el esfuerzo, aunque desvías recursos de desarrollo que tenías planeados para el producto general."},
      {texto:"Negarte, argumentando que el producto no está diseñado para desarrollos a la medida.", efectos:{diasCartera:10},
       consecuencia:"Proteges la coherencia de tu producto, aunque tu cliente más grande queda visiblemente insatisfecho y empieza a mirar alternativas."},
      {texto:"Incluir la funcionalidad en el roadmap general del producto, beneficiando a todos los clientes.", efectos:{ebitda:-2, reputacion:3},
       consecuencia:"Conviertes una petición puntual en una mejora para toda tu base de clientes, aunque tarda más en estar lista de lo que tu cliente esperaba."},
      {texto:"Subcontratar el desarrollo a un freelance especializado para no distraer a tu equipo interno.", efectos:{caja:-2, ebitda:1},
       consecuencia:"Resuelves la petición sin sacrificar tu roadmap interno, a cambio de depender de un tercero para algo que toca directamente tu producto."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Caída prolongada del proveedor de infraestructura en la nube",
    contexto:"Tu proveedor de servicios en la nube sufre una caída regional que deja tu plataforma inaccesible durante varias horas, justo durante el horario pico de uso de tus clientes empresariales.",
    choices:[
      {texto:"Comunicar de inmediato y con total transparencia el incidente a todos tus clientes.", efectos:{reputacion:3},
       consecuencia:"La comunicación clara durante una falla que no fue tu culpa directa ayuda a que tus clientes entiendan y no sobrerreaccionen."},
      {texto:"Esperar a que el proveedor resuelva sin comunicar nada mientras tanto.", efectos:{reputacion:-5},
       consecuencia:"El silencio durante una caída se siente, para tus clientes, igual de grave que la caída misma."},
      {texto:"Migrar a una arquitectura multi-nube para reducir la dependencia de un solo proveedor.", efectos:{caja:-6, wacc:-0.1},
       consecuencia:"Es una inversión considerable en resiliencia técnica que reduce drásticamente el riesgo de que esto se repita."},
      {texto:"Ofrecer una compensación en forma de crédito de servicio a los clientes afectados.", efectos:{caja:-2, reputacion:4},
       consecuencia:"El gesto cuesta ingreso recurrente, pero refuerza la confianza de tus clientes empresariales en momentos donde más se necesita."}
    ]
  })
];

