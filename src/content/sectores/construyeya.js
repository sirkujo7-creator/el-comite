/* =========================================================================================
   SECTOR 4 · CONSTRUYE YA — Constructora e inmobiliaria (mecánica: doble golpe de tasa)
   Nov. 2026: 3 opciones por caso, todas defendibles; los efectos dependen de cómo esté la
   empresa (content/universal/contexto.js). En Construye YA pesan el endeudamiento (la tasa
   golpea dos veces), los apartamentos sin vender, la caja comprometida en obra y el banco.
   ========================================================================================= */
const CONSTRUYEYA_CASES = [
(s,f)=>({ tipo:'caso', titulo:"El comprador grande pide financiamiento directo",
  contexto:"Un inversionista que compra 15 apartamentos para arriendo pide que la constructora le financie directamente a 24 meses, en vez de crédito hipotecario tradicional.",
  investigacion:{costo:3, boton:"Solicitar reporte de central de riesgo del comprador ($3M)",
    reporte:"Razón corriente del comprador: <b>0.9</b>. Mantiene otros 2 créditos hipotecarios activos con un nivel de endeudamiento total considerado alto por el sector financiero."},
  choices:[
    {texto:"Aceptar financiar directamente los 24 meses completos.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), -6, -4), capitalTrabajo:-3, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.25, -0.15), diasCartera:90, ebitda:3, diasInventario:si(CONTEXTO.inventarioPesado(s), -30, -20)},
     consecuencia:"Cierras la venta de 15 unidades de una vez, pero ahora eres tú quien asume el riesgo crediticio que normalmente asumiría un banco." + si(CONTEXTO.liquidezBaja(s), ' Con la caja comprometida en obra, financiar dos años a un comprador te deja sin aire.', '') + si(CONTEXTO.inventarioPesado(s), ' Con tantos apartamentos quietos, salir de 15 de una vez es un alivio enorme.', '')},
    {texto:"Exigir crédito hipotecario tradicional, sin financiamiento directo.",
     efectos:{razonCorriente:0.05, ebitda:si(CONTEXTO.reputacionAlta(s), 0.3, -1), diasInventario:si(CONTEXTO.reputacionAlta(s), -8, 0), diasCartera:si(CONTEXTO.reputacionAlta(s), 10, 0), wacc:-0.1},
     consecuencia:"Proteges tu balance por completo, aunque el comprador podría desistir si el banco le exige más requisitos." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación pesa: el comprador consigue el crédito y compra casi todas las unidades, aunque el banco tarda en desembolsar.', ' Esta vez, desiste de parte de las unidades.')},
    {texto:"Estructurar el pago a través de una fiduciaria, que asume la administración del riesgo crediticio.",
     efectos:{caja:-2, capitalTrabajo:1, diasCartera:15, ebitda:si(CONTEXTO.bancoAmigo(s), 2, 1.2), diasInventario:-15},
     consecuencia:"Cierras la venta sin cargar tú con el riesgo de mora, a cambio de una comisión fiduciaria." + si(CONTEXTO.bancoAmigo(s), ' La fiduciaria de tu banco te cobra una comisión baja.', '')}
  ],
  choiceInformado:{texto:"Con el reporte en mano, exigir garantía hipotecaria de otro inmueble antes de aceptar financiamiento directo.", efectos:{capitalTrabajo:1, razonCorriente:0.05, diasCartera:20},
    consecuencia:"Una razón corriente de 0.9 y dos créditos hipotecarios activos son señales claras de un comprador ya bastante apalancado."}
}),
(s,f)=>({ tipo:'caso', titulo:"Financiamiento para la siguiente etapa de obra",
  contexto:"Necesitas $15.000.000 para iniciar la siguiente etapa constructiva de la torre. El dinero se irá en obra: lo que quede en caja será poco.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito constructor a tasa fija por $15M.", plazo:'largo',
     efectos:{caja:6, capitalTrabajo:6, valorInventario:6, deuda:15, ebitda:1, wacc:si(CONTEXTO.apalancado(s), 1, 0.5)},
     consecuencia:"La siguiente etapa arranca. Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas." + si(CONTEXTO.inventarioPesado(s), ' Pero ya tenías apartamentos sin vender: construyes más sobre un inventario que no rota.', '')},
    {texto:"Tomar crédito constructor a tasa variable, más barata hoy.", plazo:'largo', setFlags:{deudaVariable:true},
     efectos:{caja:6, capitalTrabajo:6, valorInventario:6, deuda:15, ebitda:1, wacc:si(CONTEXTO.apalancado(s), 0.4, -0.3)},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado al Banco de la República — riesgoso en un sector de ciclos largos." + si(CONTEXTO.apalancado(s), ' Con tanta deuda ya, una subida de tasas te golpearía doble.', '')},
    {texto:"Ceder 20% del proyecto a un fondo inmobiliario a cambio del mismo monto.",
     efectos:{caja:6, capitalTrabajo:6, valorInventario:6, diasInventario:si(CONTEXTO.inventarioPesado(s), -6, -3), ebitda:0.8, wacc:si(CONTEXTO.juntaDesconfia(s), 1.6, si(CONTEXTO.apalancado(s), 1.3, 1)), confianzaBanco:si(CONTEXTO.apalancado(s), 3, 0)},
     consecuencia:"No agregas deuda y el fondo ayuda a vender, pero cediste una porción real de las utilidades. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube." + si(CONTEXTO.apalancado(s), ' Con la deuda que ya cargabas, el banco agradece que no le pidieras más.', '')}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", plazo:'largo', efectos:{caja:5, capitalTrabajo:5, valorInventario:5, deuda:12, ebitda:0.8, wacc:0.3, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
}),
(s,f)=>({ tipo:'caso', titulo:"Sube el precio del acero y el cemento",
  contexto:"Un choque en la cadena de suministro sube el precio del acero y el cemento 18% de un mes a otro, justo en medio de la etapa estructural.",
  choices:[
    {texto:"Absorber el alza en tu presupuesto de obra actual.",
     efectos:{ebitda:-2.5, caja:si(CONTEXTO.liquidezBaja(s), -3, -2), confianzaProveedores:2, reputacion:1},
     consecuencia:"El proyecto sigue en marcha sin cambios visibles y cumples a todos, pero tu margen se reduce de forma directa."},
    {texto:"Trasladar el alza a los compradores que aún no han firmado.",
     efectos:{ebitda:1, diasInventario:10, reputacion:si(CONTEXTO.reputacionAlta(s), 0, -1)},
     consecuencia:"Proteges tu margen, aunque encareces el producto en un mercado sensible a precio y las unidades se venden más despacio." + si(CONTEXTO.inventarioPesado(s), ' Con tantos apartamentos ya quietos, el inventario se vuelve un problema serio.', '')},
    {texto:"Rediseñar parte de la estructura para reducir el consumo de acero sin comprometer la norma.",
     efectos:{caja:-3, ebitda:si(CONTEXTO.equipoCansado(s), 0, 1), capitalTrabajo:-1},
     consecuencia:"El rediseño cuesta ingeniería y algo de capital de trabajo, pero reduce tu exposición al precio del insumo en este proyecto." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, el rediseño se demora y el ahorro no alcanza a notarse.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Cae la demanda por alza en tasas hipotecarias",
  contexto:"El Banco de la República sube tasas y el crédito hipotecario se encarece: las ventas de apartamentos caen de forma notoria este trimestre.",
  choices:[
    {texto:"Recortar personal y cuadrillas de obra para bajar costos fijos.",
     efectos:{ebitda:4, capitalTrabajo:1, reputacion:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -12, -6)},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero pierdes cuadrillas experimentadas que serán difíciles de recontratar." + si(CONTEXTO.equipoCansado(s), ' Con el equipo ya desgastado, el recorte se siente como abandono.', '')},
    {texto:"Pausar el inicio de la siguiente etapa hasta que la demanda se recupere.",
     efectos:{ebitda:si(CONTEXTO.inventarioPesado(s), 2.5, 1.5), capitalTrabajo:1, reputacion:-2, wacc:-0.1},
     consecuencia:"Evitas comprometer capital en un mercado débil, aunque el proyecto se atrasa y los compradores en preventa no lo reciben bien." + si(CONTEXTO.inventarioPesado(s), ' Con tantos apartamentos sin vender, no construir más era lo sensato.', '')},
    {texto:"Vender un bloque de unidades a descuento a un fondo inmobiliario institucional.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 10, 7), ebitda:-3, diasInventario:-30, valorInventario:-10},
     consecuencia:"Recuperas liquidez de inmediato y liberas inventario, a cambio de sacrificar margen en ese bloque." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, el fondo negocia menos duro porque necesita el producto: el precio es mejor de lo esperado.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante para la siguiente etapa. Tu contador sugiere reclasificar gastos de obra como mayor valor del activo de forma indebida.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 6, 4), confianzaBanco:8, wacc:-0.5, reputacion:si(CONTEXTO.juntaDesconfia(s), -8, -4)},
     setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que ya te vigilaba, nota que las cifras no cuadran.', '')},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.",
     efectos:{caja:si(CONTEXTO.bancoAmigo(s), -1, -2), confianzaBanco:si(CONTEXTO.bancoAmigo(s), 8, 6), razonCorriente:0.1, wacc:-0.2, reputacion:4},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable." + si(CONTEXTO.bancoAmigo(s), ' El banco te conoce: recorta poco y valora la franqueza.', '')},
    {texto:"Mejorar los indicadores reales primero, acelerando el cobro de cuotas iniciales pendientes.",
     efectos:{caja:3, capitalTrabajo:3, confianzaBanco:3, diasCartera:si(CONTEXTO.carteraLenta(s), -12, -6), ebitda:si(CONTEXTO.liquidezBaja(s), -1.6, -1), reputacion:-1},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Algunos compradores se incomodan con el cobro y el crecimiento queda en pausa."}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Un municipio ofrece un terreno público para un proyecto de vivienda social",
  contexto:"La alcaldía te ofrece un terreno público en condiciones favorables para desarrollar un proyecto de vivienda social, con márgenes más bajos que tus proyectos habituales pero con el respaldo político y mediático de un programa gubernamental.",
  investigacion:{costo:2, boton:"Contratar un estudio de viabilidad financiera del proyecto social ($2M)",
    reporte:"El estudio confirma que el margen del proyecto es <b>bajo pero positivo</b>, y que los subsidios estatales de vivienda social suelen pagarse con puntualidad superior al promedio del sector privado."},
  choices:[
    {texto:"Aceptar el proyecto completo, asumiendo el margen más bajo a cambio de volumen y reputación.",
     efectos:{caja:-8, ebitda:1, reputacion:si(CONTEXTO.juntaDesconfia(s), 9, 6), capitalTrabajo:-5, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.2, -0.05)},
     consecuencia:"Ganas visibilidad y buena imagen pública, con una rentabilidad más ajustada que tus proyectos habituales." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que dudaba de ti, ve con buenos ojos el respaldo oficial.', '') + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, la inversión inicial aprieta tu liquidez.', '')},
    {texto:"Rechazar la oferta y enfocarte en proyectos de mayor margen.",
     efectos:{diasInventario:2, reputacion:-1, ebitda:si(CONTEXTO.inventarioPesado(s), 0, 0.5)},
     consecuencia:"Proteges tu rentabilidad promedio, renunciando al respaldo político y mediático y a un terreno que tomará otro constructor." + si(CONTEXTO.inventarioPesado(s), ' Con tantos apartamentos quietos, tus proyectos de mayor margen tampoco se venden.', '')},
    {texto:"Proponer un esquema mixto: parte del terreno para vivienda social, parte para vivienda de venta libre.",
     efectos:{caja:-6, ebitda:si(CONTEXTO.reputacionAlta(s), 2, 1.2), reputacion:3, capitalTrabajo:-4, wacc:0.1},
     consecuencia:"Mejoras el margen general sin renunciar al componente social, aunque las unidades de venta libre suman riesgo comercial." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación convence a la alcaldía de darte la mejor parte del lote.', '')}
  ],
  choiceInformado:{texto:"Con la puntualidad de pago estatal confirmada, aceptar el proyecto completo sin reservas.", efectos:{caja:-7, ebitda:1.5, reputacion:7, capitalTrabajo:-5},
    consecuencia:"Sabiendo que el riesgo de pago es bajo, el margen ajustado deja de ser un problema — es simplemente el costo de un proyecto de bajo riesgo y alta visibilidad."}
}),
];
function CONSTRUYEYA_SUBCONTRATISTAS(s,f){ return {tipo:'calendario', titulo:"Pago a subcontratistas y cuadrillas de obra",
  contexto:"Toca pagar a las cuadrillas y subcontratistas del mes: electricidad, plomería y acabados. No es negociable sin frenar el avance de obra.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), 4, 2), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
     consecuencia:"Cumples en tiempo y forma, y la obra sigue su cronograma." + si(CONTEXTO.liquidezBaja(s), ' Pero con la caja tan justa, el pago deja tu liquidez en rojo.', '')},
    {texto:"Pagar la mayoría y diferir un saldo 30 días con acuerdo de los subcontratistas.", efectos:{caja:-6, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -8, -3)}, diferir:{monto:3.3, turnos:1, motivo:"Saldo diferido a subcontratistas", tipo:'proveedor'},
     consecuencia:"Aceptan por esta vez, aunque varios atienden otros proyectos y no toleran atrasos repetidos." + si(CONTEXTO.proveedoresTensos(s), ' La relación ya estaba frágil: dos subcontratistas bajan el ritmo en tu obra.', '')},
    {texto:"Tomar un crédito de obra de corto plazo.", efectos:{deuda:5, wacc:si(CONTEXTO.apalancado(s), 0.9, 0.4), caja:-4},
     consecuencia:"Evitas fricción con las cuadrillas, pero sumas una deuda más a tu estructura de capital." + si(CONTEXTO.apalancado(s), ' Ya cargabas mucha deuda: el crédito sale caro.', '')}
  ]};}
function CONSTRUYEYA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta e impuesto predial de unidades sin vender",
  contexto:"Llega la fecha de declarar renta, junto con el impuesto predial de las unidades que aún no se han vendido.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:si(CONTEXTO.inventarioPesado(s), -9, -7), confianzaBanco:4, wacc:-0.1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Cumples sin generar ninguna obligación adicional, y un historial tributario impecable mejora tu perfil ante el banco." + si(CONTEXTO.inventarioPesado(s), ' Con tantas unidades sin vender, el predial pesa más de lo previsto.', '')},
    {texto:"Acogerse a una facilidad de pago con la DIAN y el municipio.", efectos:{caja:-2, deuda:5, wacc:si(CONTEXTO.bancoAmigo(s), 0.2, 0.4)},
     consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario especializado en el sector inmobiliario.", efectos:{caja:-6, ebitda:0.4},
     consecuencia:"Los honorarios cuestan, pero el asesor identifica deducciones legítimas específicas del sector."}
  ]};}
const CONSTRUYEYA_RANDOM = [
  (s,f)=>MACRO_TASA_INTERES(s,f, true),
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"los ascensores, acabados y estructuras metálicas importadas que tienes presupuestados"),
  (s,f)=>({tipo:'random', titulo:"La curaduría exige un ajuste en los planos",
    contexto:"La curaduría urbana encuentra una inconsistencia normativa en los planos ya aprobados y exige un ajuste antes de continuar con la siguiente etapa.",
    choices:[
      {texto:"Contratar de inmediato al equipo de arquitectura para el ajuste urgente.", efectos:{caja:-4, capitalTrabajo:-1, reputacion:1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
       consecuencia:"Resuelves el trámite lo más rápido posible, minimizando el atraso sobre el cronograma general."},
      {texto:"Esperar el turno normal de revisión sin acelerar el trámite.", efectos:{ebitda:si(CONTEXTO.apalancado(s), -2.5, -1.5), capitalTrabajo:-1},
       consecuencia:"Ahorras el costo de urgencia, pero la obra se atrasa varias semanas." + si(CONTEXTO.apalancado(s), ' Con tanta deuda, cada semana de obra quieta son intereses que corren.', '')},
      {texto:"Contratar un gestor de trámites especializado en curadurías para agilizar el proceso.", efectos:{caja:-2.5, ebitda:si(CONTEXTO.reputacionAlta(s), -0.2, -0.5), reputacion:si(CONTEXTO.juntaDesconfia(s), -2, 0)},
       consecuencia:"Su conocimiento del proceso reduce el tiempo de espera, a cambio de sus honorarios." + si(CONTEXTO.juntaDesconfia(s), ' La junta pregunta qué tanto "agiliza" ese gestor.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Red de servicios no mapeada detiene la obra",
    contexto:"Durante la excavación aparece una red de acueducto no mapeada que obliga a detener la obra temporalmente mientras se coordina con la empresa de servicios.",
    choices:[
      {texto:"Pagar por una coordinación urgente con la empresa de servicios.", efectos:{caja:-5, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0), confianzaProveedores:1},
       consecuencia:"Retomas la obra en pocos días, a un costo de gestión considerable por la urgencia."},
      {texto:"Esperar el trámite regular de coordinación.", efectos:{ebitda:si(CONTEXTO.apalancado(s), -3, -2), capitalTrabajo:-1},
       consecuencia:"Ahorras el costo de la gestión urgente, pero la obra queda detenida varias semanas." + si(CONTEXTO.apalancado(s), ' Con tanta deuda, los intereses corren mientras esperas.', '')},
      {texto:"Rediseñar temporalmente la cimentación para trabajar alrededor de la red mientras se resuelve.", efectos:{caja:-3, ebitda:si(CONTEXTO.equipoCansado(s), -1.5, -0.5)},
       consecuencia:"La obra no se detiene del todo, aunque el rediseño temporal tiene su propio costo de ingeniería." + si(CONTEXTO.equipoCansado(s), ' Con las cuadrillas cansadas, el trabajo alrededor de la red avanza lento.', '')}
    ]}),
  (s,f)=>({
    tipo:'random', titulo:"Hallazgo arqueológico paraliza una obra",
    contexto:"Durante la excavación de cimientos, el equipo encuentra restos arqueológicos. La normativa exige detener la obra hasta que las autoridades de patrimonio hagan su evaluación.",
    choices:[
      {texto:"Detener la obra de inmediato y notificar formalmente a las autoridades, tal como exige la ley.", efectos:{ebitda:si(CONTEXTO.apalancado(s), -4, -3), reputacion:3},
       consecuencia:"Cumples la norma al pie de la letra, aunque el proyecto se paraliza mientras las autoridades evalúan." + si(CONTEXTO.apalancado(s), ' Con tanta deuda, la parálisis sale cara.', '')},
      {texto:"Continuar la obra discretamente mientras se gestiona el permiso en paralelo.", efectos:{ebitda:2, reputacion:si(CONTEXTO.juntaDesconfia(s), -12, -8)},
       consecuencia:"Ganas tiempo de construcción, pero si se descubre que avanzaste sin autorización, la multa y el daño reputacional pueden ser mayores que la demora evitada." + si(CONTEXTO.juntaDesconfia(s), ' La junta ya te tenía en la mira: el rumor le llega rápido.', '')},
      {texto:"Rediseñar los cimientos para evitar la zona del hallazgo y seguir construyendo alrededor.", efectos:{caja:-5, ebitda:-0.5, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"Una salida técnica que evita la paralización total, a un costo de rediseño considerable."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un subcontratista se declara en quiebra a mitad de proyecto",
    contexto:"El subcontratista encargado de las instalaciones eléctricas de tu proyecto se declara en quiebra, dejando el trabajo a medio terminar y sin responder a tus llamadas.",
    choices:[
      {texto:"Contratar de emergencia a otro subcontratista para terminar el trabajo cuanto antes.", efectos:{caja:-5, ebitda:-0.5, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -2, 0)},
       consecuencia:"El proyecto retoma su ritmo, aunque el nuevo subcontratista cobra tarifa de urgencia." + si(CONTEXTO.proveedoresTensos(s), ' Con tu fama de pagar tarde, cobra todavía más.', '')},
      {texto:"Asumir la instalación eléctrica con tu propio equipo técnico interno.", efectos:{caja:-2, ebitda:si(CONTEXTO.equipoCansado(s), -2.5, -1.5), moralEquipo:si(CONTEXTO.equipoCansado(s), -4, -1)},
       consecuencia:"Ahorras el sobrecosto de contratar de emergencia, aunque tu equipo no estaba dimensionado para esta carga." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, la carga extra se nota en la obra y en el ánimo.', '')},
      {texto:"Pausar esa fase de la obra hasta encontrar un reemplazo con mejores condiciones.", efectos:{ebitda:si(CONTEXTO.apalancado(s), -2.5, -1.5), diasCartera:8, wacc:-0.1},
       consecuencia:"Evitas contratar bajo presión, aunque el cronograma se atrasa." + si(CONTEXTO.apalancado(s), ' Con tanta deuda, cada semana de atraso cuesta intereses.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Nueva norma sismorresistente obliga a rediseñar",
    contexto:"Una actualización a la norma sismorresistente entra en vigencia justo cuando tu proyecto está en etapa de diseño estructural avanzado, obligando ajustes antes de poder continuar.",
    choices:[
      {texto:"Rediseñar completamente la estructura conforme a la nueva norma, sin atajos.", efectos:{caja:-7, ebitda:-1, reputacion:3, confianzaBanco:si(CONTEXTO.bancoAmigo(s), 4, 2), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.15, 0)},
       consecuencia:"El proyecto cumple la norma más reciente sin ambigüedad legal, a un costo considerable. Compradores y banco lo valoran." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, el costo aprieta tu liquidez.', '')},
      {texto:"Aplicar solo los ajustes mínimos indispensables para cumplir formalmente.", efectos:{caja:-3, reputacion:si(CONTEXTO.juntaDesconfia(s), -4, -1)},
       consecuencia:"Cumples la norma al menor costo posible, aunque la holgura estructural queda más ajustada de lo que hubieras preferido."},
      {texto:"Consultar con la curaduría si el proyecto puede acogerse a la norma anterior por estar ya en trámite.", efectos:{caja:-1, ebitda:si(CONTEXTO.reputacionAlta(s), -0.5, -1.5)},
       consecuencia:"Si la respuesta es favorable, te ahorras el rediseño; si no, perdiste tiempo." + si(CONTEXTO.reputacionAlta(s), ' Tu historial de cumplimiento ayuda: la curaduría responde rápido y a tu favor en parte.', ' Esta vez, la respuesta tarda y no te favorece.')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Robo de materiales en la obra",
    contexto:"Amaneces con un reporte de robo de materiales de construcción de valor considerable en una de tus obras activas, sin cámaras de seguridad instaladas en la zona afectada.",
    choices:[
      {texto:"Denunciar formalmente y contratar vigilancia privada permanente para el resto de la obra.", efectos:{caja:-4, ebitda:-0.5, reputacion:1, wacc:-0.1},
       consecuencia:"No recuperas lo robado, pero reduces el riesgo de que se repita durante el resto del proyecto."},
      {texto:"Investigar internamente si algún trabajador de la obra estuvo involucrado.", efectos:{moralEquipo:si(CONTEXTO.equipoCansado(s), -8, -4), caja:-2},
       consecuencia:"La investigación puede esclarecer lo ocurrido y repones lo mínimo, aunque el ambiente de sospecha golpea la moral del equipo." + si(CONTEXTO.equipoCansado(s), ' Con el equipo ya desgastado, la sospecha cae muy mal.', '')},
      {texto:"Reclamar la pérdida a tu póliza de seguro de obra, si la tienes vigente.", efectos:{caja:-1, ebitda:si(CONTEXTO.bancoAmigo(s), -0.5, -1.5)},
       consecuencia:"La póliza cubre buena parte del valor con un deducible. Mientras se procesa el reclamo, la obra espera el material." + si(CONTEXTO.bancoAmigo(s), ' La aseguradora de tu banco paga rápido.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Cliente exige adelantar la entrega con penalidad de por medio",
    contexto:"Tu cliente pide adelantar la fecha de entrega del proyecto varias semanas respecto al cronograma pactado, argumentando compromisos propios, y menciona que el contrato incluye una penalidad si no se cumple.",
    choices:[
      {texto:"Aceptar el adelanto contratando turnos extendidos y personal adicional temporal.", efectos:{caja:-5, ebitda:-1, reputacion:3, diasCartera:-10, moralEquipo:si(CONTEXTO.equipoCansado(s), -5, -1)},
       consecuencia:"Cumples con el nuevo plazo evitando la penalidad, a un costo considerable. El cliente, satisfecho, paga sin demoras." + si(CONTEXTO.equipoCansado(s), ' Las cuadrillas, ya agotadas, terminan exhaustas.', '')},
      {texto:"Negociar una entrega parcial por fases en vez de la fecha completa adelantada.", efectos:{caja:-2, diasCartera:si(CONTEXTO.reputacionAlta(s), -8, -3), ebitda:-0.5},
       consecuencia:"Un punto intermedio que satisface parte de la urgencia sin comprometer la calidad, aunque coordinar por fases cuesta." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación hace que el cliente acepte de buena gana y pague a tiempo.', '')},
      {texto:"Rechazar el adelanto y asumir la penalidad contractual.", efectos:{caja:si(CONTEXTO.liquidezBaja(s), -5, -3.5), wacc:-0.1, reputacion:-1},
       consecuencia:"Pagas la penalidad, pero mantienes el cronograma sin comprometer la calidad por la prisa." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, la penalidad duele más.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Material comprado para un proyecto que se retrasó en permisos",
    contexto:"Compraste materiales para un proyecto que ahora está detenido por permisos pendientes. El cemento, el acero y los demás insumos llevan semanas acumulando polvo en la bodega, atrapando capital que podrías estar usando en otro frente activo.",
    choices:[
      {texto:"Vender los materiales a otro constructor, con descuento, antes de que sigan perdiendo valor.", efectos:{diasInventario:-12, valorInventario:-2, caja:si(CONTEXTO.liquidezBaja(s), 3, 2)},
       consecuencia:"Liberas capital atrapado de inmediato, aunque vendiste por debajo de lo que pagaste."},
      {texto:"Reasignarlos a otro proyecto activo tuyo, ajustando el presupuesto de ambos.", efectos:{diasInventario:-10, ebitda:si(CONTEXTO.equipoCansado(s), -1.2, -0.5)},
       consecuencia:"Evitas que el capital siga atrapado sin vender con pérdida, aunque reorganizar dos proyectos toma esfuerzo." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, la reorganización genera errores y desperdicio.', '')},
      {texto:"Guardarlos hasta que el proyecto se reactive.", efectos:{diasInventario:8, valorInventario:1, wacc:-0.1},
       consecuencia:"Conservas el material comprado a buen precio para cuando el proyecto arranque, aunque no tienes certeza de cuándo será." + si(CONTEXTO.inventarioPesado(s), ' Con tanto inventario ya quieto, es más capital dormido.', '')}
    ]
  }),
  (s,f)=>({tipo:'random', titulo:"Doce apartamentos terminados siguen sin venderse",
    contexto:"La última etapa del proyecto está terminada, pero doce apartamentos siguen sin comprador. Cada mes pagas administración, impuesto predial y el costo financiero de tenerlos quietos.",
    choices:[
      {texto:"Bajar el precio un 8% para venderlos este trimestre.", efectos:{diasInventario:-25, valorInventario:-8, caja:si(CONTEXTO.liquidezBaja(s), 8, 6), ebitda:-2},
       consecuencia:"Los apartamentos se venden y entra caja, a costa de sacrificar margen en cada unidad."},
      {texto:"Lanzar una campaña de mercadeo sin tocar el precio.", efectos:{caja:si(CONTEXTO.liquidezBaja(s), -3, -2), diasInventario:si(CONTEXTO.reputacionAlta(s), -12, -6), valorInventario:-2, ebitda:0.5},
       consecuencia:"Algunas unidades se venden a precio completo, aunque la campaña cuesta y no resuelve todo el inventario." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación hace que la campaña venda más de lo esperado.', '')},
      {texto:"Subsidiar dos puntos de la tasa hipotecaria de los compradores.", efectos:{diasInventario:-18, valorInventario:-6, caja:3, ebitda:si(CONTEXTO.bancoAmigo(s), -1, -1.8), capitalTrabajo:-1},
       consecuencia:"La cuota más baja atrae compradores sin bajar el precio de lista, aunque el subsidio sale de tu bolsillo." + si(CONTEXTO.bancoAmigo(s), ' Tu banco comparte parte del subsidio.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un proveedor ofrece congelar el precio del acero para dos etapas",
    contexto:"Tu proveedor de acero te ofrece el precio de hoy si compras de una vez el material para la etapa actual y la siguiente. El mercado espera alzas, pero no es seguro.",
    choices:[
      {texto:"Comprar de contado el acero de ambas etapas.", efectos:{caja:-8, valorInventario:10, diasInventario:15, ebitda:2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.15, 0)},
       consecuencia:"Te blindas contra el alza, pero inmovilizas caja en material que no usarás en meses." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, quedas sin colchón.', '')},
      {texto:"Firmar un contrato de precio fijo con entregas por etapa.", efectos:{caja:-1, ebitda:1.2, wacc:0.1, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), 4, 2)},
       consecuencia:"Aseguras el precio sin llenar la bodega, a cambio de un anticipo y de un compromiso de compra que ya no puedes cambiar."},
      {texto:"Comprar todo con crédito del proveedor a 90 días.", efectos:{deuda:6, valorInventario:10, diasInventario:15, ebitda:2, wacc:si(CONTEXTO.apalancado(s), 0.7, 0.3)},
       consecuencia:"Aseguras el precio sin tocar tu caja, aunque sumas deuda con intereses por un material que tardarás en usar." + si(CONTEXTO.apalancado(s), ' Con tanta deuda ya, el proveedor cobra intereses altos.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un comprador ofrece un lote a cambio de tres apartamentos",
    contexto:"Un propietario de tierra te ofrece permutar un lote bien ubicado por tres de tus apartamentos sin vender. El lote serviría para un proyecto futuro.",
    choices:[
      {texto:"Aceptar la permuta completa.", efectos:{diasInventario:si(CONTEXTO.inventarioPesado(s), -14, -10), valorInventario:-6, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.15, -0.08), ebitda:1},
       consecuencia:"Sacas tres unidades del inventario y consigues tierra para crecer, pero cambiaste activos que podías vender pronto por uno que tardará años en convertirse en caja: tu razón corriente baja."},
      {texto:"Exigir el pago en efectivo, sin permuta.", efectos:{diasInventario:2, ebitda:-0.3, razonCorriente:0.03},
       consecuencia:"Proteges tu liquidez, aunque el propietario no tiene el efectivo y los apartamentos siguen esperando comprador."},
      {texto:"Permutar el lote por dos apartamentos más un saldo en efectivo.", efectos:{diasInventario:-7, valorInventario:-4, caja:si(CONTEXTO.reputacionAlta(s), 2, 1), razonCorriente:-0.03, ebitda:0.3},
       consecuencia:"Un punto medio: consigues el lote, liberas inventario y entra algo de caja, aunque el lote que recibes es más pequeño." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación te da mejor saldo en la negociación.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"La fiduciaria retiene el dinero de las preventas",
    contexto:"Las cuotas iniciales de los compradores de la nueva etapa están en la fiduciaria, que no las liberará hasta que alcances el punto de equilibrio de ventas. Tu caja está comprometida en obra y el dinero de los compradores, quieto.",
    choices:[
      {texto:"Acelerar la preventa con descuentos para llegar rápido al punto de equilibrio.", efectos:{ebitda:-2, diasCartera:-15, caja:4, razonCorriente:0.1},
       consecuencia:"Llegas al punto de equilibrio y la fiduciaria libera los recursos, a costa del margen de las unidades vendidas con descuento."},
      {texto:"Financiar la obra con crédito constructor mientras tanto.", efectos:{caja:5, deuda:5, wacc:si(CONTEXTO.apalancado(s), 0.7, 0.3), razonCorriente:-0.05},
       consecuencia:"La obra sigue a buen ritmo, aunque sumas deuda de corto plazo justo cuando tu liquidez ya está apretada."},
      {texto:"Negociar con la fiduciaria una liberación parcial con garantías adicionales.", efectos:{caja:si(CONTEXTO.bancoAmigo(s), 3, 2), diasCartera:-5, razonCorriente:-0.03, confianzaBanco:-1},
       consecuencia:"Recibes una parte del dinero, aunque los activos que diste en garantía quedan comprometidos." + si(CONTEXTO.bancoAmigo(s), ' Tu banco respalda la solicitud y la fiduciaria libera más.', '')}
    ]})
];
