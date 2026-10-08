/* =========================================================================================
   SECTOR 4 · CONSTRUYE YA — Constructora e inmobiliaria (mecánica: doble golpe de tasa)
   ========================================================================================= */
const CONSTRUYEYA_CASES = [
{ tipo:'caso', titulo:"El comprador grande pide financiamiento directo",
  contexto:"Un inversionista que compra 15 apartamentos para arriendo pide que la constructora le financie directamente a 24 meses, en vez de crédito hipotecario tradicional.",
  investigacion:{costo:3, boton:"Solicitar reporte de central de riesgo del comprador ($3M)",
    reporte:"Razón Corriente del comprador: <b>0.9</b>. Mantiene otros 2 créditos hipotecarios activos con un nivel de endeudamiento total considerado alto por el sector financiero."},
  choices:[
    {texto:"Aceptar financiar directamente los 24 meses completos.", efectos:{caja:-4, capitalTrabajo:-3, razonCorriente:-0.15, diasCartera:90}, consecuencia:"Cierras la venta de 15 unidades de una vez, pero ahora eres tú quien asume el riesgo crediticio que normalmente asumiría un banco."},
    {texto:"Ofrecer 12 meses de financiamiento directo y el resto por crédito hipotecario.", efectos:{caja:-1, razonCorriente:-0.05, diasCartera:45}, consecuencia:"Compartes el riesgo con el sistema financiero tradicional en vez de asumirlo tú solo por completo."},
    {texto:"Exigir crédito hipotecario tradicional, sin financiamiento directo.", efectos:{razonCorriente:0.03}, consecuencia:"Proteges tu balance por completo, aunque el comprador podría desistir si el banco le exige más requisitos de los que esperaba."},
    {texto:"Estructurar el pago a través de una fiduciaria, que asume la administración del riesgo crediticio.", efectos:{caja:-2, capitalTrabajo:1, diasCartera:15}, consecuencia:"Cierras la venta sin cargar tú directamente con el riesgo de mora, a cambio de una comisión fiduciaria."}
  ],
  choiceInformado:{texto:"Con el reporte en mano, exigir garantía hipotecaria de otro inmueble antes de aceptar financiamiento directo.", efectos:{capitalTrabajo:1, razonCorriente:0.05, diasCartera:20},
    consecuencia:"Una Razón Corriente de 0.9 y dos créditos hipotecarios activos son señales claras de un comprador ya bastante apalancado."}
},
{ tipo:'caso', titulo:"Financiamiento para la siguiente etapa de obra",
  contexto:"Necesitas $15.000.000 para iniciar la siguiente etapa constructiva de la torre.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito constructor a tasa fija por $15M.", efectos:{caja:15, deuda:15, wacc:0.5, capitalTrabajo:15}, consecuencia:"Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas del mercado."},
    {texto:"Tomar crédito constructor a tasa variable, más barata hoy.", efectos:{caja:15, deuda:15, wacc:-0.3, capitalTrabajo:15}, setFlags:{deudaVariable:true},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado a lo que haga el Banco de la República — especialmente riesgoso en un sector con ciclos largos."},
    {texto:"Ceder 20% del proyecto a un fondo inmobiliario a cambio del mismo monto.", efectos:{caja:15, capitalTrabajo:15}, consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades futuras del proyecto."},
    {texto:"Usar el lote sin desarrollar como garantía para un crédito con mejor tasa.", efectos:{caja:14, deuda:14, wacc:0.1, capitalTrabajo:14}, consecuencia:"La garantía adicional te consigue una tasa más favorable, aunque ese activo queda comprometido mientras dure el crédito."}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", efectos:{caja:12, deuda:12, wacc:0.3, capitalTrabajo:12, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
},
{ tipo:'caso', titulo:"Sube el precio del acero y el cemento",
  contexto:"Un choque en la cadena de suministro sube el precio del acero y el cemento 18% de un mes a otro, justo en medio de la etapa estructural.",
  choices:[
    {texto:"Absorber el alza en tu presupuesto de obra actual.", efectos:{ebitda:-3, caja:-2}, consecuencia:"El proyecto sigue en marcha sin cambios visibles, pero tu margen se reduce de forma directa."},
    {texto:"Trasladar el alza a los compradores que aún no han firmado.", efectos:{ebitda:1}, consecuencia:"Proteges tu margen en las unidades pendientes de venta, aunque encareces el producto en un mercado ya sensible a precio."},
    {texto:"Buscar un proveedor alterno de materiales, con menor respaldo de marca.", efectos:{ebitda:0.5, capitalTrabajo:-2}, consecuencia:"Reduces el impacto del alza, aunque asumes cierto riesgo de calidad en un componente estructural."},
    {texto:"Rediseñar parte de la estructura para reducir el consumo de acero sin comprometer la norma.", efectos:{caja:-3, ebitda:1}, consecuencia:"El rediseño tiene costo de ingeniería, pero reduce tu exposición al precio del insumo de forma permanente en este proyecto."}
  ]
},
{ tipo:'caso', titulo:"Cae la demanda por alza en tasas hipotecarias",
  contexto:"El Banco de la República sube tasas y el crédito hipotecario se encarece: las ventas de apartamentos caen de forma notoria este trimestre.",
  choices:[
    {texto:"Recortar personal y cuadrillas de obra para bajar costos fijos.", efectos:{ebitda:4, capitalTrabajo:1, reputacion:-6},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero pierdes cuadrillas experimentadas que serán difíciles de recontratar después."},
    {texto:"Pausar el inicio de la siguiente etapa hasta que la demanda se recupere.", efectos:{ebitda:2, capitalTrabajo:1}, consecuencia:"Evitas comprometer más capital en un mercado débil, aunque el proyecto se atrasa frente al cronograma original."},
    {texto:"Ofrecer financiamiento propio más atractivo que el bancario para reactivar ventas.", efectos:{caja:-4, capitalTrabajo:-3}, consecuencia:"Reactivas ventas asumiendo tú el riesgo crediticio que el banco ya no está dispuesto a tomar tan fácil."},
    {texto:"Vender un bloque de unidades a descuento a un fondo inmobiliario institucional.", efectos:{caja:8, ebitda:-3, diasInventario:-30, valorInventario:-10}, consecuencia:"Recuperas liquidez de inmediato y liberas inventario, a cambio de sacrificar margen en ese bloque de unidades."}
  ]
},
{ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante para la siguiente etapa. Tu contador sugiere reclasificar gastos de obra como mayor valor del activo de forma indebida.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.", efectos:{caja:5, confianzaBanco:15, wacc:-1, reputacion:-4}, setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales."},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.", efectos:{caja:-3, confianzaBanco:5, razonCorriente:0.05, reputacion:5},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable."},
    {texto:"Mejorar los indicadores reales primero, acelerando el cobro de cuotas iniciales pendientes.", efectos:{caja:2, capitalTrabajo:3, confianzaBanco:3, ebitda:1, reputacion:2},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel."},
    {texto:"Buscar un fondo de deuda inmobiliaria alternativo, sin tocar la contabilidad.", efectos:{caja:4, wacc:1.2, deuda:4},
     consecuencia:"Consigues capital sin mentir en tus estados financieros, a un costo más alto que el crédito bancario tradicional."}
  ]
},
{ tipo:'caso', titulo:"Un municipio ofrece un terreno público para un proyecto de vivienda social",
  contexto:"La alcaldía te ofrece un terreno público en condiciones favorables para desarrollar un proyecto de vivienda social, con márgenes más bajos que tus proyectos habituales pero con el respaldo político y mediático de un programa gubernamental.",
  investigacion:{costo:2, boton:"Contratar un estudio de viabilidad financiera del proyecto social ($2M)",
    reporte:"El estudio confirma que el margen del proyecto es <b>bajo pero positivo</b>, y que los subsidios estatales de vivienda social suelen pagarse con puntualidad superior al promedio del sector privado."},
  choices:[
    {texto:"Aceptar el proyecto completo, asumiendo el margen más bajo a cambio de volumen y reputación.", efectos:{caja:-8, ebitda:1, reputacion:6, capitalTrabajo:-5}, consecuencia:"Ganas visibilidad y buena imagen pública, con una rentabilidad bastante más ajustada que tus proyectos habituales."},
    {texto:"Rechazar la oferta y enfocarte en proyectos de mayor margen.", efectos:{diasInventario:2}, consecuencia:"Proteges tu rentabilidad promedio, renunciando al respaldo político y mediático que el programa ofrecía — y a un terreno que ya tenías medio evaluado, ahora otro constructor lo va a tomar."},
    {texto:"Aceptar solo una fase reducida del proyecto, como piloto antes de comprometerte a todo el terreno.", efectos:{caja:-4, reputacion:3, capitalTrabajo:-2}, consecuencia:"Entras al programa social sin comprometer toda tu capacidad operativa de una sola vez."},
    {texto:"Proponer un esquema mixto: parte del terreno para vivienda social, parte para vivienda de venta libre.", efectos:{caja:-6, ebitda:1.5, reputacion:3, capitalTrabajo:-4}, consecuencia:"Un punto medio que mejora el margen general del proyecto sin renunciar del todo al componente social."}
  ],
  choiceInformado:{texto:"Con la puntualidad de pago estatal confirmada, aceptar el proyecto completo sin reservas.", efectos:{caja:-7, ebitda:1.5, reputacion:7, capitalTrabajo:-5},
    consecuencia:"Sabiendo que el riesgo de pago es bajo, el margen ajustado deja de ser un problema — es simplemente el costo de un proyecto de bajo riesgo y alta visibilidad."}
},
];
function CONSTRUYEYA_SUBCONTRATISTAS(s,f){ return {tipo:'calendario', titulo:"Pago a subcontratistas y cuadrillas de obra",
  contexto:"Toca pagar a las cuadrillas y subcontratistas del mes: electricidad, plomería y acabados. No es negociable sin frenar el avance de obra.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9}, consecuencia:"Cumples en tiempo y forma, sin costo adicional, y la obra sigue su cronograma."},
    {texto:"Pagar la mayoría y diferir un saldo 30 días con acuerdo de los subcontratistas.", efectos:{caja:-6}, diferir:{monto:3.3, turnos:1, motivo:"Saldo diferido a subcontratistas", tipo:'proveedor'},
     consecuencia:"Aceptan por esta vez, aunque varios subcontratistas trabajan con varios proyectos y no toleran atrasos repetidos."},
    {texto:"Tomar un crédito de obra de corto plazo.", efectos:{deuda:5, wacc:0.5, caja:-4}, consecuencia:"Evitas fricción con las cuadrillas, pero sumas una deuda más a tu estructura de capital."},
    {texto:"Usar el desembolso ya aprobado del crédito constructor para cubrir el pago.", efectos:{razonCorriente:-0.08, caja:-9}, consecuencia:"Cumples sin pedir deuda nueva, aunque adelantas un recurso que tenías destinado a otra fase de la obra."}
  ]};}
function CONSTRUYEYA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta e impuesto predial de unidades sin vender",
  contexto:"Llega la fecha de declarar renta, junto con el impuesto predial de las unidades que aún no se han vendido.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7}, consecuencia:"Cumples sin generar ninguna obligación adicional."},
    {texto:"Acogerse a una facilidad de pago con la DIAN y el municipio.", efectos:{caja:-2, deuda:5, wacc:0.4}, consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario especializado en el sector inmobiliario.", efectos:{caja:-5, ebitda:0.5}, consecuencia:"Sus honorarios tienen costo, pero identifica deducciones legítimas específicas del sector."},
    {texto:"Usar parte de la reserva de contingencia para cubrir el pago.", efectos:{razonCorriente:-0.08, caja:-7}, consecuencia:"Cumples igual, pero sacrificas el colchón construido para otro tipo de imprevistos."}
  ]};}
const CONSTRUYEYA_RANDOM = [
  (s,f)=>MACRO_TASA_INTERES(s,f, true),
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"los ascensores, acabados y estructuras metálicas importadas que tienes presupuestados"),
  (s,f)=>({tipo:'random', titulo:"La curaduría exige un ajuste en los planos",
    contexto:"La curaduría urbana encuentra una inconsistencia normativa en los planos ya aprobados y exige un ajuste antes de continuar con la siguiente etapa.",
    choices:[
      {texto:"Contratar de inmediato al equipo de arquitectura para el ajuste urgente.", efectos:{caja:-4, capitalTrabajo:-1}, consecuencia:"Resuelves el trámite lo más rápido posible, minimizando el atraso sobre el cronograma general."},
      {texto:"Esperar el turno normal de revisión sin acelerar el trámite.", efectos:{ebitda:-2}, consecuencia:"Ahorras el costo de urgencia, pero la obra se atrasa varias semanas mientras el trámite avanza a su ritmo habitual."},
      {texto:"Apelar formalmente la exigencia de la curaduría.", efectos:{caja:-2, ebitda:-1}, consecuencia:"El proceso se alarga y no garantiza un resultado distinto, pero deja constancia formal de tu posición."},
      {texto:"Contratar un gestor de trámites especializado en curadurías para agilizar el proceso.", efectos:{caja:-3}, consecuencia:"Su conocimiento del proceso interno reduce el tiempo de espera de forma notable, a cambio de sus honorarios."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Red de servicios no mapeada detiene la obra",
    contexto:"Durante la excavación aparece una red de acueducto no mapeada que obliga a detener la obra temporalmente mientras se coordina con la empresa de servicios.",
    choices:[
      {texto:"Pagar por una coordinación urgente con la empresa de servicios.", efectos:{caja:-5}, consecuencia:"Retomas la obra en pocos días, a un costo de gestión considerable por la urgencia."},
      {texto:"Esperar el trámite regular de coordinación.", efectos:{ebitda:-3}, consecuencia:"Ahorras el costo de la gestión urgente, pero la obra queda detenida varias semanas."},
      {texto:"Rediseñar temporalmente la cimentación para trabajar alrededor de la red mientras se resuelve.", efectos:{caja:-3, ebitda:-1}, consecuencia:"La obra no se detiene del todo, aunque el rediseño temporal tiene su propio costo de ingeniería."},
      {texto:"Reclamar el sobrecosto a la entidad de servicios públicos por la red no reportada.", efectos:{caja:-1}, consecuencia:"Inicias un proceso de reclamación que, si prospera, podría compensar parte del costo — aunque no es inmediato."}
    ]}),

  (s,f)=>({
    tipo:'random', titulo:"Hallazgo arqueológico paraliza una obra",
    contexto:"Durante la excavación de cimientos, el equipo encuentra restos arqueológicos. La normativa exige detener la obra hasta que las autoridades de patrimonio hagan su evaluación.",
    choices:[
      {texto:"Detener la obra de inmediato y notificar formalmente a las autoridades, tal como exige la ley.", efectos:{ebitda:-4, reputacion:3},
       consecuencia:"Cumples la norma al pie de la letra, aunque el proyecto se paraliza por un tiempo indefinido mientras las autoridades hacen su evaluación."},
      {texto:"Continuar la obra discretamente mientras se gestiona el permiso en paralelo.", efectos:{ebitda:2, reputacion:-8},
       consecuencia:"Ganas tiempo de construcción, pero si se descubre que avanzaste sin autorización, la multa y el daño reputacional pueden ser mucho mayores que la demora evitada."},
      {texto:"Contratar un arqueólogo privado para acelerar la evaluación oficial.", efectos:{caja:-4},
       consecuencia:"El proceso avanza más rápido de lo habitual, aunque no garantiza que las autoridades lo acepten sin su propia revisión adicional."},
      {texto:"Rediseñar los cimientos para evitar la zona del hallazgo y seguir construyendo alrededor.", efectos:{caja:-5, ebitda:-1},
       consecuencia:"Encuentras una salida técnica que evita la paralización total, a un costo de rediseño considerable."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un subcontratista se declara en quiebra a mitad de proyecto",
    contexto:"El subcontratista encargado de las instalaciones eléctricas de tu proyecto se declara en quiebra, dejando el trabajo a medio terminar y sin responder a tus llamadas.",
    choices:[
      {texto:"Contratar de emergencia a otro subcontratista para terminar el trabajo cuanto antes.", efectos:{caja:-6, ebitda:-1},
       consecuencia:"El proyecto retoma su ritmo, aunque el nuevo subcontratista cobra tarifa de urgencia por entrar a mitad de una obra ajena."},
      {texto:"Asumir la instalación eléctrica con tu propio equipo técnico interno.", efectos:{caja:-3, ebitda:-2},
       consecuencia:"Ahorras el sobrecosto de contratar de emergencia, aunque tu equipo interno no estaba planeado ni dimensionado para asumir esta carga."},
      {texto:"Pausar esa fase de la obra hasta encontrar un reemplazo con mejores condiciones.", efectos:{ebitda:-3, diasCartera:10},
       consecuencia:"Evitas contratar bajo presión, aunque el cronograma general del proyecto se atrasa mientras decides con calma."},
      {texto:"Intentar recuperar parte del anticipo pagado por vía legal contra el subcontratista quebrado.", efectos:{caja:-1, deuda:2},
       consecuencia:"El proceso legal contra una empresa en quiebra rara vez es rápido ni garantiza recuperación total del anticipo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Nueva norma sismorresistente obliga a rediseñar",
    contexto:"Una actualización a la norma sismorresistente entra en vigencia justo cuando tu proyecto está en etapa de diseño estructural avanzado, obligando ajustes antes de poder continuar.",
    choices:[
      {texto:"Rediseñar completamente la estructura conforme a la nueva norma, sin atajos.", efectos:{caja:-7, ebitda:-1},
       consecuencia:"El proyecto cumple la norma más reciente sin ninguna ambigüedad legal futura, a un costo de rediseño considerable."},
      {texto:"Aplicar solo los ajustes mínimos indispensables para cumplir formalmente.", efectos:{caja:-3},
       consecuencia:"Cumples la norma al menor costo posible, aunque el margen de holgura estructural queda más ajustado del que hubieras preferido."},
      {texto:"Consultar con la curaduría si el proyecto puede acogerse a la norma anterior por estar ya en trámite.", efectos:{caja:-1},
       consecuencia:"Si la respuesta es favorable, te ahorras el rediseño. Si no lo es, perdiste tiempo valioso esperando una respuesta que no llegó a tu favor."},
      {texto:"Detener el proyecto hasta contratar una firma estructural especializada en la nueva norma.", efectos:{ebitda:-3, diasCartera:15},
       consecuencia:"Te aseguras un diseño técnicamente sólido desde cero, a costa de un atraso considerable en el cronograma del proyecto."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Robo de materiales en la obra",
    contexto:"Amaneces con un reporte de robo de materiales de construcción de valor considerable en una de tus obras activas, sin cámaras de seguridad instaladas en la zona afectada.",
    choices:[
      {texto:"Denunciar formalmente y contratar vigilancia privada permanente para el resto de la obra.", efectos:{caja:-4},
       consecuencia:"No recuperas lo robado, pero reduces sustancialmente el riesgo de que se repita durante el resto del proyecto."},
      {texto:"Absorber la pérdida y reponer el material sin cambios de seguridad adicionales.", efectos:{caja:-5},
       consecuencia:"Resuelves el problema inmediato del material faltante, sin abordar la vulnerabilidad que permitió el robo."},
      {texto:"Investigar internamente si algún trabajador de la obra estuvo involucrado.", efectos:{moralEquipo:-4},
       consecuencia:"La investigación puede esclarecer lo ocurrido, aunque el ambiente de sospecha generalizada golpea la moral de todo el equipo de obra, culpable o no."},
      {texto:"Reclamar la pérdida a tu póliza de seguro de obra, si la tienes vigente.", efectos:{caja:-1, wacc:-0.1},
       consecuencia:"Si tu póliza cubre este tipo de siniestro, recuperas buena parte del valor con un deducible menor al costo total."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Cliente exige adelantar la entrega con penalidad de por medio",
    contexto:"Tu cliente pide adelantar la fecha de entrega del proyecto varias semanas respecto al cronograma pactado, argumentando compromisos propios, y menciona que el contrato incluye una penalidad si no se cumple.",
    choices:[
      {texto:"Aceptar el adelanto contratando turnos extendidos y personal adicional temporal.", efectos:{caja:-6, ebitda:-1},
       consecuencia:"Cumples con el nuevo plazo evitando la penalidad, a un costo operativo considerable por la aceleración forzada."},
      {texto:"Negociar una entrega parcial por fases en vez de la fecha completa adelantada.", efectos:{caja:-2, diasCartera:-5},
       consecuencia:"Encuentras un punto intermedio que satisface parte de la urgencia del cliente sin comprometer toda la calidad del proyecto."},
      {texto:"Rechazar el adelanto y asumir la penalidad contractual si el cliente insiste en el plazo original pactado.", efectos:{caja:-4},
       consecuencia:"Pagas la penalidad, pero mantienes el cronograma original sin comprometer la calidad de la obra por la prisa."},
      {texto:"Ofrecer un descuento a cambio de mantener el cronograma original sin penalidad.", efectos:{caja:-2, reputacion:1},
       consecuencia:"El cliente acepta el descuento a cambio de esperar el plazo original, evitando la aceleración forzada del proyecto."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Material comprado para un proyecto que se retrasó en permisos",
    contexto:"Compraste materiales para un proyecto que ahora está detenido por permisos pendientes. El cemento, el acero y los demás insumos llevan semanas acumulando polvo en la bodega, atrapando capital que podrías estar usando en otro frente activo.",
    choices:[
      {texto:"Vender los materiales a otro constructor, con descuento, antes de que sigan perdiendo valor.", efectos:{diasInventario:-12, valorInventario:-2, caja:2}, consecuencia:"Liberas capital atrapado de inmediato, aunque vendiste por debajo de lo que pagaste originalmente."},
      {texto:"Guardarlos indefinidamente hasta que el proyecto se reactive.", efectos:{diasInventario:8}, consecuencia:"Conservas los materiales para cuando el proyecto arranque, aunque no tienes certeza de cuándo será eso."},
      {texto:"Reasignarlos a otro proyecto activo tuyo, ajustando el presupuesto de ambos.", efectos:{diasInventario:-10, ebitda:-0.5}, consecuencia:"Evitas que el capital siga atrapado sin necesidad de vender con pérdida, aunque reorganizar el presupuesto de dos proyectos toma esfuerzo."},
      {texto:"Alquilar espacio de bodega adicional para no comprometer el flujo de tus otros proyectos.", efectos:{caja:-1, diasInventario:2}, consecuencia:"El material sigue esperando, pero al menos deja de estorbar la operación normal de tu bodega principal."}
    ]
  })
];

