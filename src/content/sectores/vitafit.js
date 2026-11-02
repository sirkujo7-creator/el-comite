/* =========================================================================================
   SECTOR 1 · VITA FIT — Gimnasio, suplementos (mecánica: caducidad + retención por CapEx)
   Nov. 2026: 3 opciones por caso, todas defendibles; los efectos dependen de cómo esté la
   empresa (content/universal/contexto.js). En Vita Fit pesan los equipos sin mantenimiento,
   los suplementos que se vencen en bodega, la caja y la moral de los entrenadores.
   ========================================================================================= */
const VITAFIT_CASES = [
(s,f)=>({ tipo:'caso', titulo:"El cliente estrella pide más plazo",
  contexto:"Un fondo de empleados que paga las membresías corporativas de 200 trabajadores (35% de tus ingresos) te pide pasar de 30 a 90 días de plazo, justo cuando tienes nómina y proveedores de suplementos por cubrir este mes.",
  investigacion:{costo:3, boton:"Solicitar reporte de central de riesgo del cliente ($3M)",
    reporte:"Razón corriente del cliente: <b>0.8</b>. Su endeudamiento de corto plazo se incrementó <b>40%</b> en el último semestre."},
  choices:[
    {texto:"Aceptar los 90 días completos, sin condiciones adicionales.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), -5, -3), capitalTrabajo:-2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.25, -0.15), diasCartera:35, reputacion:2, ebitda:0.5},
     consecuencia:"El cliente sigue pagando, la relación queda intacta y hasta amplía el plan, pero ahora financias tú su operación." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, tres meses sin cobrar te dejan contra las cuerdas.', '')},
    {texto:"Negociar 60 días con 2% de descuento si paga antes de 45.",
     efectos:{caja:-1, razonCorriente:-0.05, ebitda:-1, diasCartera:si(CONTEXTO.carteraLenta(s), 20, 12)},
     consecuencia:"Reduces la presión sobre tu capital de trabajo, aunque el 2% de descuento golpea tu margen." + si(CONTEXTO.carteraLenta(s), ' Tu cartera ya venía lenta: el cliente no aprovecha el descuento y paga al día 60.', '')},
    {texto:"Ofrecer una alianza: pagar a 45 días a cambio de que el cliente refiera nuevas empresas afiliadas.",
     efectos:{caja:-2, ebitda:si(CONTEXTO.reputacionAlta(s), 1.5, 0.5), razonCorriente:-0.03, diasCartera:10},
     consecuencia:"Sacrificas flujo inmediato por una promesa de crecimiento que no está garantizada." + si(CONTEXTO.reputacionAlta(s), ' Con tu reputación, los referidos sí llegan.', ' Sin una marca fuerte, llegan pocos referidos.')}
  ],
  choiceInformado:{texto:"Con el reporte en mano, exigir un pagaré con aval antes de aceptar cualquier plazo mayor a 30 días.", efectos:{capitalTrabajo:1, razonCorriente:0.05, diasCartera:5},
    consecuencia:"Una razón corriente de 0.8 y un endeudamiento de corto plazo creciendo 40% no son síntomas de expansión: son síntomas de iliquidez."}
}),
(s,f)=>({ tipo:'caso', titulo:"Necesitas capital para crecer",
  contexto:"Para ampliar el inventario de suplementos y comprar un nuevo lote de equipos de fuerza necesitas $15.000.000. El dinero se irá en equipos y producto: lo que quede en caja será poco.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas del banco proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", plazo:'largo', capex:true,
     efectos:{caja:6, capitalTrabajo:6, valorInventario:4, deuda:15, ebitda:1.2, wacc:si(CONTEXTO.apalancado(s), 1, si(CONTEXTO.bancoAmigo(s), 0.2, 0.5))},
     consecuencia:"Equipos nuevos y bodega surtida. Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas." + si(CONTEXTO.apalancado(s), ' Con tanta deuda encima, el banco cobró más.', '')},
    {texto:"Ceder 20% de participación a un inversionista ángel por el mismo monto.", capex:true,
     efectos:{caja:6, capitalTrabajo:6, valorInventario:4, ebitda:1.2, wacc:si(CONTEXTO.juntaDesconfia(s), 1.6, si(CONTEXTO.apalancado(s), 1.3, 1)), confianzaBanco:si(CONTEXTO.apalancado(s), 3, 0)},
     consecuencia:"No agregas deuda ni intereses, pero cediste una porción real de las utilidades y del control de Vita Fit. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube."},
    {texto:"Crecer solo con lo que hay: comprar la mitad de los equipos con caja propia.", capex:true,
     efectos:{caja:-5, valorInventario:2, ebitda:0.5, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.15, -0.05), confianzaBanco:1},
     consecuencia:"Ni deuda ni socios: creces a la mitad del ritmo con tu propia caja." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, la compra deja tu liquidez en rojo.', ' Tenías con qué: el banco ve una empresa que se financia sola.')}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", plazo:'largo', capex:true, efectos:{caja:5, capitalTrabajo:5, valorInventario:3, deuda:12, ebitda:1, wacc:0.3, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
}),
(s,f)=>({ tipo:'caso', titulo:"El proveedor ofrece un descuento",
  contexto:"Tu proveedor principal de suplementos ofrece 5% de descuento si le pagas de contado en lugar de a 60 días, como es habitual.",
  choices:[
    {texto:"Pagar de contado y tomar el descuento.",
     efectos:{caja:-9, ebitda:si(CONTEXTO.liquidezBaja(s), 1, 1.8), confianzaProveedores:6, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.2, -0.05)},
     consecuencia:"El 5% de descuento equivale a una tasa anual muy superior a tu costo de capital, aunque te deja con menos caja este mes." + si(CONTEXTO.liquidezBaja(s), ' Con la caja tan justa, quedarte sin colchón es un riesgo real.', '')},
    {texto:"Mantener el crédito a 60 días para no sacrificar liquidez.",
     efectos:{capitalTrabajo:2, ebitda:-0.5, razonCorriente:si(CONTEXTO.liquidezBaja(s), 0.08, 0.02)},
     consecuencia:"Conservas tu efectivo disponible, aunque dejaste sobre la mesa un ahorro que probablemente valía más que el costo de oportunidad de tu caja." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez así, el efectivo vale más que el descuento.', '')},
    {texto:"Pedir un descuento aún mayor a cambio de un contrato de exclusividad por un año.",
     efectos:{caja:-4, ebitda:si(CONTEXTO.proveedoresTensos(s), 1, 2), confianzaProveedores:8, diasInventario:si(CONTEXTO.inventarioPesado(s), 8, 3), wacc:0.3},
     consecuencia:"El proveedor acepta 7% a cambio de exclusividad y de pedidos mínimos: ahora dependes más de esa única relación." + si(CONTEXTO.proveedoresTensos(s), ' La relación venía tensa: el proveedor solo concede el 6%.', '') + si(CONTEXTO.inventarioPesado(s), ' Y con la bodega llena, los pedidos mínimos se acumulan.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Llega la recesión",
  contexto:"Una desaceleración golpea al sector fitness: tu EBITDA cae por menos inscripciones y menos gasto discrecional en suplementos.",
  choices:[
    {texto:"Recortar personal para bajar costos fijos de inmediato.",
     efectos:{ebitda:4, capitalTrabajo:1, reputacion:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -12, -6)},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero pierdes entrenadores con relación directa con tus clientes más antiguos." + si(CONTEXTO.equipoCansado(s), ' El equipo ya estaba desgastado: el recorte se siente como abandono.', '')},
    {texto:"Reducir gastos generales y renegociar contratos antes de tocar la nómina.",
     efectos:{ebitda:2, capitalTrabajo:1, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -9, -5)},
     consecuencia:"El ajuste es más lento, pero protege a tu equipo, aunque tensiona alguna relación comercial." + si(CONTEXTO.proveedoresTensos(s), ' Tus proveedores ya estaban molestos: la renegociación los aleja.', '')},
    {texto:"Lanzar un servicio online de bajo costo para diversificar ingresos.",
     efectos:{caja:-3, ebitda:si(CONTEXTO.reputacionAlta(s), 1.8, 0.8), capitalTrabajo:-1, moralEquipo:si(CONTEXTO.equipoCansado(s), -3, 0)},
     consecuencia:"Abres una fuente de ingreso nueva en medio de la crisis, aunque construirla consume caja y tiempo." + si(CONTEXTO.reputacionAlta(s), ' Tus socios conocen la marca: se suscriben rápido.', '') + si(CONTEXTO.equipoCansado(s), ' Los entrenadores, agotados, graban clases a regañadientes.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante para financiar la segunda sede. Tu contador sugiere reclasificar unos gastos como activos para mejorar los indicadores que verá el banco.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 6, 4), confianzaBanco:8, wacc:-0.5, reputacion:si(CONTEXTO.juntaDesconfia(s), -8, -4)},
     setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales. Tarde o temprano, alguien más las revisa."},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.",
     efectos:{caja:si(CONTEXTO.bancoAmigo(s), -1, -2), confianzaBanco:si(CONTEXTO.bancoAmigo(s), 8, 6), razonCorriente:0.1, wacc:-0.2, reputacion:4},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable — un activo que vale más de lo que parece."},
    {texto:"Mejorar los indicadores reales primero, cobrando cartera vencida antes de volver a aplicar.",
     efectos:{caja:3, capitalTrabajo:3, confianzaBanco:3, diasCartera:si(CONTEXTO.carteraLenta(s), -14, -6), ebitda:si(CONTEXTO.liquidezBaja(s), -1.6, -1)},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Mientras tanto, la segunda sede queda en pausa." + si(CONTEXTO.carteraLenta(s), ' Tenías mucha cartera atrasada: hay bastante por recoger.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Una cadena de gimnasios busca comprar tu sucursal más rentable",
  contexto:"Una cadena nacional de gimnasios te hace una oferta atractiva por comprar específicamente tu sucursal más rentable — la que sostiene buena parte de tu flujo de caja actual — dejándote el resto de la operación intacta.",
  investigacion:{costo:1.5, boton:"Contratar una valoración independiente de la sucursal ($1.5M)",
    reporte:"La valoración independiente confirma que la oferta de la cadena está <b>12% por encima</b> del valor razonable de mercado para esa sucursal."},
  choices:[
    {texto:"Vender la sucursal al precio ofrecido.",
     efectos:{caja:10, ebitda:-2.5, capitalTrabajo:3, moralEquipo:-3, deuda:si(CONTEXTO.apalancado(s), -6, 0)},
     consecuencia:"Obtienes liquidez inmediata importante, aunque pierdes la sucursal que más aportaba y parte del equipo se va con ella." + si(CONTEXTO.apalancado(s), ' Con tanta deuda, usas parte del dinero para pagarla.', '')},
    {texto:"Negociar vender solo una participación minoritaria de esa sucursal, no el control total.",
     efectos:{caja:4, ebitda:-0.8, wacc:si(CONTEXTO.juntaDesconfia(s), 0.6, 0.3)},
     consecuencia:"Consigues liquidez parcial sin perder el control operativo, aunque ahora compartes utilidades con un socio que exige retorno."},
    {texto:"Usar la oferta como argumento para conseguir mejores condiciones de un banco, sin vender nada.", plazo:'largo',
     efectos:si(CONTEXTO.bancoAmigo(s), {deuda:8, caja:8, wacc:-0.3}, {deuda:8, caja:6, wacc:0.2}),
     consecuencia:"Muestras el respaldo de una oferta real para pedir financiamiento sin ceder la sucursal." + si(CONTEXTO.bancoAmigo(s), ' Tu banco ya confiaba en ti: la tasa baja.', ' Sin relación previa, el banco presta pero no mejora tanto las condiciones.')}
  ],
  choiceInformado:{texto:"Con la sobrevaloración del 12% confirmada, vender la sucursal sin dudarlo.", efectos:{caja:11, ebitda:-2, capitalTrabajo:3},
    consecuencia:"Cuando una fuente independiente confirma que te pagan por encima del valor razonable de mercado, rechazar la oferta es difícil de justificar."}
}),
];
function VITAFIT_NOMINA(s,f){ return {tipo:'calendario', titulo:"Nómina, prima y mantenimiento de equipos",
  contexto:"Toca pagar la nómina completa (entrenadores, recepción, nutricionista) más la prima legal — y el mantenimiento trimestral de los equipos de gimnasio ya no puede esperar más sin perder suscripciones por desgaste.",
  choices:[
    {texto:"Pagar todo, incluyendo el mantenimiento completo de los equipos.", capex:true,
     efectos:{caja:-11, reputacion:1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.15, 0)},
     consecuencia:"Cumples en tiempo y forma, y tus equipos quedan en condiciones óptimas para retener suscripciones." + si(CONTEXTO.liquidezBaja(s), ' Pero con la caja tan justa, el pago deja tu liquidez en rojo.', '')},
    {texto:"Pagar solo nómina y prima, aplazando el mantenimiento de equipos.",
     efectos:{caja:-9, ebitda:si(CONTEXTO.equiposGastados(s), -1, 0), moralEquipo:si(CONTEXTO.equiposGastados(s), -2, 0), reputacion:si(CONTEXTO.equiposGastados(s), -2, -1)},
     consecuencia:"Cumples con tu equipo humano, pero el desgaste de los equipos sigue acumulándose." + si(CONTEXTO.equiposGastados(s), ' Ya llevaban turnos sin mantenimiento: las máquinas fallan en hora pico y los socios se quejan.', '')},
    {texto:"Tomar un crédito de nómina de corto plazo para cubrir todo, incluido el mantenimiento.", capex:true,
     efectos:{deuda:6, wacc:si(CONTEXTO.apalancado(s), 0.9, 0.4), caja:-5},
     consecuencia:"Mantienes los equipos al día sin vaciar la caja, a cambio de sumar una deuda más a tu estructura de capital." + si(CONTEXTO.apalancado(s), ' Ya cargabas mucha deuda: el crédito sale caro.', '')}
  ]};}
function VITAFIT_RENTA(s,f){ return {tipo:'calendario', titulo:"Declaración y pago de renta",
  contexto:"Llega la fecha de declarar y pagar el impuesto de renta del periodo. La DIAN no negocia el vencimiento, solo la forma de pago.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7, confianzaBanco:4, wacc:-0.1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Cumples sin generar ninguna obligación adicional. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la DIAN, a cambio de intereses.", efectos:{caja:-2, deuda:5, wacc:si(CONTEXTO.bancoAmigo(s), 0.2, 0.4)},
     consecuencia:"Alivias la presión de caja, pero conviertes una obligación tributaria en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario externo para revisar deducciones antes de declarar.", efectos:{caja:-6, ebitda:0.4},
     consecuencia:"Los honorarios cuestan, pero el asesor identifica deducciones legítimas que reducen el valor final a pagar."}
  ]};}
const VITAFIT_RANDOM = [
  (s,f)=>MACRO_TASA_INTERES(s,f),
  (s,f)=>MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,"tus membresías y suplementos"),
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"tu proteína, creatina y equipos importados"),
  (s,f)=>({tipo:'random', titulo:"Lote de suplementos por vencer",
    contexto:"Revisando bodega, encuentras un lote grande de suplementos que caduca en tres semanas — parte de aquel pedido de gran volumen de hace algunos turnos.",
    choices:[
      {texto:"Liquidar todo con 40% de descuento antes de que venza.", efectos:{caja:si(CONTEXTO.liquidezBaja(s), 4, 3), ebitda:-2, diasInventario:-15, valorInventario:-4, reputacion:-1},
       consecuencia:"Recuperas algo de caja y liberas bodega, aunque vendes por debajo de tu margen y rematar producto de marca la devalúa un poco."},
      {texto:"Donarlo a un gimnasio comunitario aliado.", efectos:{ebitda:-1, confianzaProveedores:3, reputacion:si(CONTEXTO.juntaDesconfia(s), 5, 3), diasInventario:-15, valorInventario:-4},
       consecuencia:"No recuperas caja, pero evitas la pérdida total y fortaleces tu reputación en el gremio."},
      {texto:"Devolverlo al proveedor a cambio de comprometerte con un pedido más grande la próxima temporada.", efectos:{ebitda:-0.5, diasInventario:-10, valorInventario:-4, capitalTrabajo:-3, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -3, 2)},
       consecuencia:"El proveedor te abona el lote, así que casi no pierdes margen hoy. A cambio, quedas atado a un pedido mayor." + si(CONTEXTO.proveedoresTensos(s), ' Con la relación tensa, el proveedor acepta de mala gana.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Daño en los equipos de cardio",
    contexto:"Dos caminadoras de alta gama presentan una falla eléctrica simultánea y requieren mantenimiento correctivo urgente.",
    choices:[
      {texto:"Reparar de inmediato con el proveedor autorizado.", capex:true, efectos:{caja:-4, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0), reputacion:1},
       consecuencia:"El servicio se restablece sin poner en riesgo la garantía de fábrica."},
      {texto:"Contratar a un técnico independiente, más barato pero sin garantía.", efectos:{caja:-2, ebitda:si(CONTEXTO.equiposGastados(s), -1.5, -0.5)},
       consecuencia:"Ahorras la mitad del costo, aunque la reparación informal deja el equipo más propenso a nuevas paradas." + si(CONTEXTO.equiposGastados(s), ' Con todo el gimnasio sin mantenimiento, el parche dura poco.', '')},
      {texto:"Alquilar equipos temporales mientras defines la reparación con calma.", efectos:{caja:-3, ebitda:-1, reputacion:si(CONTEXTO.reputacionAlta(s), 2, 1), wacc:-0.1},
       consecuencia:"Evitas la queja de tus clientes sin apurar una decisión, a cambio de un arriendo adicional."}
    ]}),
  (s,f)=>({
    tipo:'random', titulo:"Tu instructor estrella exige exclusividad o se va con sus clientes",
    contexto:"El instructor de spinning más popular del gimnasio, quien arrastra consigo a buena parte de la clientela fiel, te exige un contrato de exclusividad con mejores condiciones o amenaza con abrir su propio estudio y llevarse a sus alumnos.",
    choices:[
      {texto:"Aceptar sus condiciones y firmar un contrato de exclusividad más generoso.", efectos:{ebitda:-2, moralEquipo:si(CONTEXTO.equipoCansado(s), -6, -2), reputacion:2},
       consecuencia:"Retienes al instructor y a su clientela, aunque el resto del equipo se pregunta por qué él sí y ellos no." + si(CONTEXTO.equipoCansado(s), ' Con la moral ya baja, la comparación duele.', '')},
      {texto:"Ofrecerle una participación en las membresías premium que él mismo venda.", efectos:{ebitda:si(CONTEXTO.reputacionAlta(s), 0, -1), moralEquipo:3, wacc:0.1},
       consecuencia:"Un esquema que lo motiva sin exclusividad rígida, aunque cedes parte de un ingreso que era tuyo." + si(CONTEXTO.reputacionAlta(s), ' Con tu marca fuerte, las membresías premium se venden solas y la participación se paga sola.', '')},
      {texto:"Contratar a otro instructor de perfil similar como respaldo, sin confrontarlo directamente.", efectos:{caja:-3, wacc:-0.1, moralEquipo:si(CONTEXTO.equipoCansado(s), 2, 0)},
       consecuencia:"Reduces tu dependencia de una sola persona, aunque el costo de tener doble cobertura pesa mientras tanto." + si(CONTEXTO.equipoCansado(s), ' El equipo, agotado, agradece un refuerzo.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Brote de una enfermedad respiratoria reduce la asistencia",
    contexto:"Un brote de una enfermedad respiratoria común en la ciudad hace que la asistencia al gimnasio caiga notablemente durante varias semanas, mientras algunos clientes piden pausar su membresía.",
    choices:[
      {texto:"Renovar el sistema de ventilación y reforzar la limpieza, y comunicarlo para tranquilizar a los clientes.", capex:true, efectos:{caja:-3, reputacion:si(CONTEXTO.reputacionAlta(s), 5, 3), ebitda:-0.5},
       consecuencia:"Los protocolos visibles ayudan a que algunos clientes vuelvan antes, aunque la asistencia tarda en recuperarse."},
      {texto:"Ofrecer clases virtuales temporales para quienes prefieran no asistir presencialmente.", efectos:{caja:-1, ebitda:0.5, moralEquipo:si(CONTEXTO.equipoCansado(s), -4, -1)},
       consecuencia:"Mantienes parte del ingreso sin forzar a los clientes a elegir entre pagar y no asistir, aunque los entrenadores doblan turnos." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, se nota en las clases.', '')},
      {texto:"Congelar temporalmente las membresías de quienes lo soliciten, sin cobrarles durante la pausa.", efectos:{caja:si(CONTEXTO.liquidezBaja(s), -3, -1.5), ebitda:-1, reputacion:5},
       consecuencia:"El gesto genera lealtad real, a cambio de un ingreso que dejas de percibir." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, ese ingreso que no entra duele.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una cadena low-cost abre un gimnasio justo al lado",
    contexto:"Una cadena de gimnasios de bajo costo abre una sede a media cuadra de la tuya, con membresías a un tercio de tu precio y máquinas nuevas, aunque sin clases grupales ni asesoría personalizada.",
    choices:[
      {texto:"Bajar tus precios para competir directamente en el mismo terreno.", efectos:{ebitda:-3, caja:si(CONTEXTO.liquidezBaja(s), 3, 2)},
       consecuencia:"Frenas parte de la fuga de clientes sensibles al precio, a costa de un margen que ya era ajustado."},
      {texto:"Renovar las máquinas más gastadas y reforzar las clases grupales, sin tocar el precio.", capex:true, efectos:{caja:-4, reputacion:4, ebitda:si(CONTEXTO.equipoCansado(s), -1.5, 0)},
       consecuencia:"Apuestas a que el valor agregado, no el precio, retiene a tu clientela más fiel." + si(CONTEXTO.equipoCansado(s), ' Pero un equipo agotado no da el servicio que prometiste: varios socios se van igual.', '')},
      {texto:"Lanzar una membresía básica más económica, sin tocar tu membresía premium actual.", efectos:{ebitda:si(CONTEXTO.equiposGastados(s), -2.5, -1.5), caja:1},
       consecuencia:"Segmentas tu oferta para no perder a los sensibles al precio, aunque algunos premium se pasan a la básica." + si(CONTEXTO.equiposGastados(s), ' Con las máquinas gastadas, la básica no compite contra equipos nuevos.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una marca de suplementos ofrece exclusividad de distribución",
    contexto:"Una marca reconocida de suplementos te ofrece ser su único punto de venta autorizado en la zona, a cambio de un compromiso de compra mínima mensual considerable.",
    choices:[
      {texto:"Aceptar la exclusividad y comprometerte con el volumen mínimo mensual.", efectos:{caja:-4, valorInventario:6, ebitda:si(CONTEXTO.inventarioPesado(s), 1, 2), diasInventario:si(CONTEXTO.inventarioPesado(s), 10, 5)},
       consecuencia:"Márgenes preferenciales y una marca reconocida solo en tu gimnasio, a cambio de un compromiso de compra aunque la demanda fluctúe." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega ya llena, el volumen mínimo se acumula y algo vencerá.', '')},
      {texto:"Negociar un volumen mínimo más bajo a cambio de exclusividad solo en ciertas líneas de producto.", efectos:{caja:-2, valorInventario:3, ebitda:0.8, diasInventario:2},
       consecuencia:"Un término medio: menos exposición, aunque también menos beneficio del que ofrecía el trato completo."},
      {texto:"Aceptar la exclusividad pero financiar el inventario inicial con el proveedor a plazo.", efectos:{valorInventario:6, deuda:3, ebitda:1.5, diasInventario:5, wacc:si(CONTEXTO.apalancado(s), 0.6, 0.2)},
       consecuencia:"Consigues el trato sin golpear tu caja, a cambio de una obligación financiera con el mismo proveedor." + si(CONTEXTO.apalancado(s), ' Con tanta deuda ya, una más encarece tu capital.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Accidente de un cliente en las instalaciones",
    contexto:"Un cliente sufre una caída usando una máquina de peso libre sin la supervisión adecuada, y aunque no hay lesiones graves, exige una compensación y amenaza con acciones legales.",
    investigacion:{costo:1, boton:"Revisar las cámaras de seguridad y el registro de mantenimiento de la máquina ($1M)",
      reporte:"Las cámaras muestran que la máquina sí tenía el mantenimiento al día, pero el cliente no siguió las instrucciones de uso visibles en el equipo."},
    choices:[
      {texto:"Ofrecer una compensación económica inmediata para evitar cualquier proceso legal.", efectos:{caja:-3, reputacion:si(CONTEXTO.juntaDesconfia(s), 4, 2)},
       consecuencia:"Cierras el tema rápido, aunque el pago sienta un precedente costoso para cualquier reclamo futuro."},
      {texto:"Negarte a compensar, argumentando que el cliente asumió el riesgo al usar el equipo.", efectos:{reputacion:si(CONTEXTO.equiposGastados(s), -8, -3), caja:si(CONTEXTO.equiposGastados(s), -3, 0), ebitda:0.3},
       consecuencia:"No pagas nada por ahora, aunque un cliente que se siente ignorado rara vez se queda callado en redes." + si(CONTEXTO.equiposGastados(s), ' Y tus equipos llevan turnos sin mantenimiento: su abogado lo descubre y terminas pagando.', '')},
      {texto:"Revisar todas las máquinas de pesos libres, reforzar la supervisión y contratar un seguro de responsabilidad civil.", capex:true, efectos:{caja:-3, wacc:-0.1, reputacion:1, ebitda:-0.5},
       consecuencia:"No resuelve del todo el caso actual, pero te protege de que el próximo incidente golpee tu caja."}
    ],
    choiceInformado:{texto:"Con la evidencia de que la máquina estaba en buen estado y el cliente no siguió las instrucciones, rechazar la compensación con respaldo documentado.", efectos:{reputacion:-1},
      consecuencia:"Tienes la razón y la evidencia para sostenerla, aunque decir que no a un cliente lesionado siempre deja algo de incomodidad, tenga uno la razón o no."}
  }),
  (s,f)=>({tipo:'random', titulo:"El proveedor de proteína ofrece 15% de descuento por compra trimestral",
    contexto:"Tu proveedor de proteína en polvo te ofrece un 15% de descuento si compras de una vez el volumen de todo el trimestre, en lugar de los pedidos mensuales de siempre.",
    choices:[
      {texto:"Comprar el volumen trimestral completo con el descuento.", efectos:{caja:-6, ebitda:si(CONTEXTO.inventarioPesado(s), 1, 2), diasInventario:20, valorInventario:6, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"El costo unitario baja, pero llenas la bodega de producto que tardará meses en rotar y que tiene fecha de vencimiento." + si(CONTEXTO.inventarioPesado(s), ' Ya tenías la bodega llena: parte vencerá antes de venderse.', '')},
      {texto:"Comprar con descuento solo los dos sabores que más rotan.", efectos:{caja:-3, ebitda:1, diasInventario:8, valorInventario:3},
       consecuencia:"Capturas parte del ahorro sin llenar la bodega de sabores que se mueven despacio."},
      {texto:"Proponerle al proveedor que guarde el inventario en su bodega y te despache cada mes al precio con descuento.", efectos:{caja:-1.5, ebitda:si(CONTEXTO.proveedoresTensos(s), 0.3, 1.2), diasInventario:2, confianzaProveedores:-1},
       consecuencia:"Consigues parte del descuento sin llenar tu bodega, pagando una tarifa de almacenamiento." + si(CONTEXTO.proveedoresTensos(s), ' Con la relación tensa, la tarifa se come casi todo el ahorro.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Las bebidas energéticas de marca propia rotan la mitad de lo previsto",
    contexto:"Las bebidas energéticas de marca propia que lanzaste hace unos meses se venden a la mitad del ritmo proyectado. Ocupan la nevera del mostrador y el capital invertido en ellas sigue quieto.",
    choices:[
      {texto:"Incluirlas gratis en las membresías premium durante un mes.", efectos:{diasInventario:-10, valorInventario:-3, ebitda:-1, reputacion:si(CONTEXTO.reputacionAlta(s), 3, 2)},
       consecuencia:"El inventario se mueve y los socios premium lo agradecen, aunque regalas producto que pagaste."},
      {texto:"Bajar el precio en el mostrador hasta agotar existencias.", efectos:{diasInventario:-12, valorInventario:-3, caja:si(CONTEXTO.liquidezBaja(s), 3, 2), ebitda:-1.5},
       consecuencia:"Recuperas caja y liberas la nevera, a costa de vender por debajo del margen que proyectaste."},
      {texto:"Mantenerlas y pedirle a un entrenador que las recomiende en sus clases.", efectos:{caja:-1, diasInventario:3, ebitda:si(CONTEXTO.equipoCansado(s), -0.3, 0.5), moralEquipo:-1},
       consecuencia:"La recomendación ayuda a las ventas, pero el bono del entrenador cuesta y el inventario sigue acumulando días." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, la recomendación suena forzada y no vende.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un gimnasio que cierra ofrece venderte su inventario de suplementos",
    contexto:"Un gimnasio de la zona cierra sus puertas y te ofrece todo su inventario de suplementos a mitad de precio. Hay producto con vencimiento lejano y otro que vence en pocos meses.",
    choices:[
      {texto:"Comprar todo el lote a mitad de precio.", efectos:{caja:-5, valorInventario:8, diasInventario:15, ebitda:si(CONTEXTO.inventarioPesado(s), 0.5, 1.5), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"El margen potencial es alto, pero inmovilizas caja en inventario que tardará en rotar, y parte vence pronto." + si(CONTEXTO.inventarioPesado(s), ' Con tu bodega ya llena, buena parte se vence sin venderse.', '')},
      {texto:"Comprar solo los productos con vencimiento lejano.", efectos:{caja:-2, valorInventario:3, diasInventario:5, ebitda:0.5},
       consecuencia:"Aprovechas parte de la oportunidad sin asumir el riesgo del producto que está por vencer."},
      {texto:"Proponer venderlo en consignación: le pagas solo lo que se venda.", efectos:{ebitda:0.6, diasInventario:4, confianzaProveedores:-1},
       consecuencia:"No inmovilizas caja, aunque cedes espacio de exhibición y bodega a producto que no es tuyo y el margen es menor."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Empresas aliadas atrasan el pago de sus planes corporativos",
    contexto:"Tres empresas que pagan planes corporativos para sus empleados llevan dos meses sin pagar. Sus empleados siguen entrenando como si nada.",
    choices:[
      {texto:"Suspender el acceso a los empleados de las empresas morosas.", efectos:{diasCartera:-18, reputacion:si(CONTEXTO.reputacionAlta(s), -4, -2), ebitda:-1, caja:si(CONTEXTO.liquidezBaja(s), 3, 1)},
       consecuencia:"Las empresas pagan rápido, pero sus empleados se sienten castigados y algunos no vuelven." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, ese dinero llega cuando más falta.', '')},
      {texto:"Facturar los planes corporativos por anticipado desde el próximo ciclo.", efectos:{diasCartera:-12, razonCorriente:0.05, ebitda:-1.5},
       consecuencia:"Tu cartera se sanea y tu liquidez mejora, aunque una de las empresas no acepta el cambio y cancela su plan."},
      {texto:"Ofrecerles pagar con tarjeta de crédito corporativa, asumiendo tú la comisión.", efectos:{diasCartera:-15, caja:1, ebitda:si(CONTEXTO.bancoAmigo(s), -0.5, -0.9)},
       consecuencia:"El dinero entra de inmediato por el datáfono, aunque la comisión de la tarjeta sale de tu margen." + si(CONTEXTO.bancoAmigo(s), ' Tu banco te da una comisión preferencial.', '')}
    ]})
];
