/* =========================================================================================
   SECTOR 1 · VITA FIT — Gimnasio, suplementos (mecánica: caducidad + retención por CapEx)
   ========================================================================================= */
const VITAFIT_CASES = [
{ tipo:'caso', titulo:"El cliente estrella pide más plazo",
  contexto:"Un fondo de empleados que paga las membresías corporativas de 200 trabajadores (35% de tus ingresos) te pide pasar de 30 a 90 días de plazo, justo cuando tienes nómina y proveedores de suplementos por cubrir este mes.",
  investigacion:{costo:3, boton:"Solicitar reporte de central de riesgo del cliente ($3M)",
    reporte:"Razón Corriente del cliente: <b>0.8</b>. Su endeudamiento de corto plazo se incrementó <b>40%</b> en el último semestre."},
  choices:[
    {texto:"Aceptar los 90 días completos, sin condiciones adicionales.", efectos:{caja:-3, capitalTrabajo:-2, razonCorriente:-0.15, diasCartera:35},
     consecuencia:"El cliente sigue pagando y la relación queda intacta, pero tu ciclo de conversión de efectivo se alarga: ahora financias tú su operación."},
    {texto:"Negociar 60 días con 2% de descuento si paga antes de 45.", efectos:{caja:-1, razonCorriente:-0.05, ebitda:-1, diasCartera:15},
     consecuencia:"Reduces algo la presión sobre tu capital de trabajo, aunque el 2% de descuento sobre el total facturado golpea tu margen operativo."},
    {texto:"Aceptar los 90 días y cubrir el hueco de nómina atrasando el pago a proveedores 30 días.", efectos:{caja:1, capitalTrabajo:-4, confianzaProveedores:-15, diasCartera:35},
     diferir:{monto:5, turnos:2, motivo:"Pago atrasado a proveedores por cubrir nómina", tipo:'proveedor'},
     consecuencia:"Resuelves la nómina sin pedir crédito nuevo, pero esa deuda no desaparece, solo se reprograma."},
    {texto:"Ofrecer una alianza: pagar a 45 días a cambio de que el cliente refiera nuevas empresas afiliadas.", efectos:{caja:-2, ebitda:1, razonCorriente:-0.03, diasCartera:10},
     consecuencia:"El cliente acepta un plazo intermedio a cambio de referir nuevas cuentas: sacrificas flujo inmediato por una promesa de crecimiento que no está garantizada."}
  ],
  choiceInformado:{texto:"Con el reporte en mano, exigir un pagaré con aval antes de aceptar cualquier plazo mayor a 30 días.", efectos:{capitalTrabajo:1, razonCorriente:0.05, diasCartera:5},
    consecuencia:"Una Razón Corriente de 0.8 y un endeudamiento de corto plazo creciendo 40% no son síntomas de expansión: son síntomas de iliquidez."}
},
{ tipo:'caso', titulo:"Necesitas capital para crecer",
  contexto:"Para ampliar el inventario de suplementos y comprar un nuevo lote de equipos de fuerza necesitas $15.000.000 adicionales de capital de trabajo.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas del banco proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", efectos:{caja:15, deuda:15, wacc:0.5, capitalTrabajo:15},
     consecuencia:"Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas del mercado."},
    {texto:"Tomar crédito bancario a tasa variable por $15M, más barata hoy.", efectos:{caja:15, deuda:15, wacc:-0.3, capitalTrabajo:15}, setFlags:{deudaVariable:true},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado a lo que haga el Banco de la República."},
    {texto:"Ceder 20% de participación a un inversionista ángel por el mismo monto.", efectos:{caja:15, capitalTrabajo:15},
     consecuencia:"No agregas deuda ni intereses, pero cediste una porción real de las utilidades y del control futuro de Vita Fit."},
    {texto:"Combinar: tomar solo $8M en crédito fijo y buscar un pequeño inversionista para el resto.", efectos:{caja:15, deuda:8, wacc:0.2, capitalTrabajo:15},
     consecuencia:"Divides el riesgo entre deuda y capital propio — una estructura mixta, más compleja de gestionar pero más resiliente ante un solo tipo de choque."}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", efectos:{caja:12, deuda:12, wacc:0.3, capitalTrabajo:12, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
},
{ tipo:'caso', titulo:"El proveedor ofrece un descuento",
  contexto:"Tu proveedor principal de suplementos ofrece 5% de descuento si le pagas de contado en lugar de a 60 días, como es habitual.",
  choices:[
    {texto:"Pagar de contado y tomar el descuento.", efectos:{caja:-9, ebitda:2, confianzaProveedores:6},
     consecuencia:"El 5% de descuento equivale a una tasa efectiva anual muy superior a tu costo de capital, y el pago puntual refuerza tu imagen ante el proveedor — aunque te deja con menos caja este mes."},
    {texto:"Mantener el crédito a 60 días para no sacrificar liquidez.", efectos:{capitalTrabajo:2, ebitda:-0.5},
     consecuencia:"Conservas tu efectivo disponible, pero dejaste sobre la mesa un ahorro que probablemente valía más que el costo de oportunidad de tu caja."},
    {texto:"Pedir un descuento aún mayor a cambio de un contrato de largo plazo.", efectos:{caja:-4, ebitda:3, confianzaProveedores:10, diasInventario:-4},
     consecuencia:"El proveedor acepta 7% a cambio de exclusividad por un año, y hasta mejora tus tiempos de reposición. Negociaste a largo plazo, aunque ahora dependes más de esa única relación."},
    {texto:"Proponer pago escalonado: 50% de contado y 50% a 60 días.", efectos:{caja:-4, ebitda:1, capitalTrabajo:1, confianzaProveedores:3},
     consecuencia:"Consigues parte del ahorro y algo de buena voluntad del proveedor, sin comprometer toda tu liquidez de una sola vez."}
  ]
},
{ tipo:'caso', titulo:"Llega la recesión",
  contexto:"Una desaceleración golpea al sector fitness: tu EBITDA cae por menos inscripciones y menos gasto discrecional en suplementos.",
  choices:[
    {texto:"Recortar personal para bajar costos fijos de inmediato.", efectos:{ebitda:4, capitalTrabajo:1, reputacion:-6},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero pierdes entrenadores con relación directa con tus clientes más antiguos — y el costo humano de la decisión no desaparece solo porque bajó el gasto."},
    {texto:"Reducir gastos generales y renegociar contratos antes de tocar la planilla.", efectos:{ebitda:2, capitalTrabajo:1, confianzaProveedores:-5},
     consecuencia:"El ajuste es más lento pero protege tu equipo, aunque tensiona alguna relación comercial."},
    {texto:"Buscar un crédito puente para sostener la operación sin recortar nada.", efectos:{caja:6, deuda:8, wacc:0.5, capitalTrabajo:4},
     consecuencia:"Ganas tiempo sin tocar la nómina, pero cargas deuda adicional justo cuando tus ingresos son más bajos."},
    {texto:"Lanzar un servicio online de bajo costo para diversificar ingresos.", efectos:{caja:-3, ebitda:1, capitalTrabajo:-1},
     consecuencia:"Abres una fuente de ingreso nueva en medio de la crisis, aunque construirla consume caja y tiempo que también son escasos ahora."}
  ]
},
{ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante para financiar la segunda sede. Tu contador sugiere reclasificar unos gastos como activos para mejorar los indicadores que verá el banco.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.", efectos:{caja:5, confianzaBanco:15, wacc:-1, reputacion:-4}, setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales. Tarde o temprano, alguien más las revisa."},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.", efectos:{caja:-3, confianzaBanco:5, razonCorriente:0.05, reputacion:5},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable — un activo que vale más de lo que parece."},
    {texto:"Mejorar los indicadores reales primero, cobrando cartera vencida antes de volver a aplicar.", efectos:{caja:2, capitalTrabajo:3, confianzaBanco:3, ebitda:1, reputacion:2},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel."},
    {texto:"Buscar un crédito alternativo no bancario, sin tocar la contabilidad.", efectos:{caja:4, wacc:1.2, deuda:4},
     consecuencia:"Consigues el capital sin mentir en tus estados financieros, aunque el costo de ese crédito es más alto que el de la banca tradicional."}
  ]
},
{ tipo:'caso', titulo:"Una cadena de gimnasios busca comprar tu sucursal más rentable",
  contexto:"Una cadena nacional de gimnasios te hace una oferta atractiva por comprar específicamente tu sucursal más rentable — la que sostiene buena parte de tu flujo de caja actual — dejándote el resto de la operación intacta.",
  investigacion:{costo:1.5, boton:"Contratar una valoración independiente de la sucursal ($1.5M)",
    reporte:"La valoración independiente confirma que la oferta de la cadena está <b>12% por encima</b> del valor razonable de mercado para esa sucursal."},
  choices:[
    {texto:"Vender la sucursal al precio ofrecido.", efectos:{caja:10, ebitda:-2, capitalTrabajo:3}, consecuencia:"Obtienes liquidez inmediata importante, aunque pierdes la sucursal que más aportaba a tu operación recurrente."},
    {texto:"Rechazar la oferta y conservar la sucursal como motor principal del negocio.", efectos:{capitalTrabajo:-1}, consecuencia:"Mantienes tu flujo de caja recurrente intacto, aunque renuncias a una inyección de liquidez que ya no vas a tener disponible este año."},
    {texto:"Negociar vender solo una participación minoritaria de esa sucursal, no el control total.", efectos:{caja:4, ebitda:-0.5}, consecuencia:"Consigues liquidez parcial sin perder el control operativo de tu sucursal más importante."},
    {texto:"Usar la oferta como argumento para conseguir mejores condiciones de un banco, sin vender nada.", efectos:{deuda:8, caja:8, wacc:-0.3}, consecuencia:"Consigues financiamiento en mejores condiciones al mostrar el respaldo de una oferta real, sin ceder la sucursal."}
  ],
  choiceInformado:{texto:"Con la sobrevaloración del 12% confirmada, vender la sucursal sin dudarlo.", efectos:{caja:11, ebitda:-2, capitalTrabajo:3},
    consecuencia:"Vender por encima del valor razonable de mercado, cuando ya lo confirmaste con una fuente independiente, es difícil de justificar rechazar."}
},
];
function VITAFIT_NOMINA(s,f){ return {tipo:'calendario', titulo:"Nómina, prima y mantenimiento de equipos",
  contexto:"Toca pagar la nómina completa (entrenadores, recepción, nutricionista) más la prima legal — y el mantenimiento trimestral de los equipos de gimnasio ya no puede esperar más sin perder suscripciones por desgaste.",
  choices:[
    {texto:"Pagar todo, incluyendo el mantenimiento completo de los equipos.", efectos:{caja:-11}, capex:true, consecuencia:"Cumples en tiempo y forma, y tus equipos quedan en condiciones óptimas para retener suscripciones."},
    {texto:"Pagar solo nómina y prima, aplazando el mantenimiento de equipos.", efectos:{caja:-9}, consecuencia:"Cumples con tu equipo humano, pero el desgaste de los equipos sigue acumulándose sin atenderse."},
    {texto:"Pagar la nómina completa, pero diferir la prima 30 días con acuerdo del equipo.", efectos:{caja:-6}, diferir:{monto:3.3, turnos:1, motivo:"Prima diferida al equipo", tipo:'nomina'},
     consecuencia:"El equipo acepta por esta vez, pero es una obligación legal con un límite de tolerancia corto."},
    {texto:"Tomar un crédito de nómina de corto plazo para cubrir todo, incluido el mantenimiento.", efectos:{deuda:6, wacc:0.5, caja:-5}, capex:true,
     consecuencia:"Evitas fricción con el equipo y mantienes los equipos al día, a cambio de sumar una deuda más a tu estructura de capital."}
  ]};}
function VITAFIT_RENTA(s,f){ return {tipo:'calendario', titulo:"Declaración y pago de renta",
  contexto:"Llega la fecha de declarar y pagar el impuesto de renta del periodo. La DIAN no negocia el vencimiento, solo la forma de pago.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7}, consecuencia:"Cumples sin generar ninguna obligación adicional."},
    {texto:"Acogerse a una facilidad de pago con la DIAN, a cambio de intereses.", efectos:{caja:-2, deuda:5, wacc:0.4},
     consecuencia:"Alivias la presión de caja, pero conviertes una obligación tributaria en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario externo para revisar deducciones antes de declarar.", efectos:{caja:-5, ebitda:0.5},
     consecuencia:"Los honorarios tienen costo, pero identifica deducciones legítimas que reducen el valor final a pagar."},
    {texto:"Usar parte de la reserva de contingencia para cubrir el pago sin tocar la caja operativa.", efectos:{razonCorriente:-0.08, caja:-7},
     consecuencia:"Cumples igual, pero sacrificas el colchón que habías construido para otro tipo de imprevistos."}
  ]};}
const VITAFIT_RANDOM = [
  (s,f)=>MACRO_TASA_INTERES(s,f),
  (s,f)=>MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,"tus membresías y suplementos"),
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"tu proteína, creatina y equipos importados"),
  (s,f)=>({tipo:'random', titulo:"Lote de suplementos por vencer",
    contexto:"Revisando bodega, encuentras un lote grande de suplementos que caduca en tres semanas — parte de aquel pedido de gran volumen de hace algunos turnos.",
    choices:[
      {texto:"Liquidar todo con 40% de descuento antes de que venza.", efectos:{caja:3, ebitda:-2, diasInventario:-15, valorInventario:-4}, consecuencia:"Recuperas algo de caja y liberas espacio de bodega, aunque vendiste por debajo de tu margen habitual."},
      {texto:"Donarlo a un gimnasio comunitario aliado.", efectos:{ebitda:-1, confianzaProveedores:5, reputacion:3, diasInventario:-15, valorInventario:-4}, consecuencia:"No recuperas caja, pero evitas la pérdida total y fortaleces tu reputación en el gremio del sector."},
      {texto:"Dejarlo en bodega y asumir la pérdida total al vencer.", efectos:{ebitda:-4, diasInventario:-15, valorInventario:-4}, consecuencia:"Es la opción que menos esfuerzo pide hoy, y la que más te cuesta: el valor completo del lote se convierte en pérdida operativa."},
      {texto:"Reformularlo en combos promocionales de salida rápida.", efectos:{caja:2, ebitda:-1, diasInventario:-15, valorInventario:-3}, consecuencia:"Encuentras un punto medio: no liquidas tan barato como un descuento masivo, pero mueves el inventario antes de que caduque."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Daño en los equipos de cardio",
    contexto:"Dos caminadoras de alta gama presentan una falla eléctrica simultánea y requieren mantenimiento correctivo urgente.",
    choices:[
      {texto:"Reparar de inmediato con el proveedor autorizado.", efectos:{caja:-4}, capex:true, consecuencia:"El servicio se restablece sin poner en riesgo la garantía de fábrica."},
      {texto:"Contratar a un técnico independiente, más barato pero sin garantía.", efectos:{caja:-2}, consecuencia:"Ahorras la mitad del costo, aunque cualquier falla futura relacionada ya no estará cubierta por el fabricante."},
      {texto:"Sacar los equipos de servicio hasta el próximo periodo de presupuesto.", efectos:{ebitda:-3}, consecuencia:"Ahorras el gasto hoy, pero varios clientes se quejan y algunos no renuevan membresía."},
      {texto:"Alquilar equipos temporales mientras defines la reparación con calma.", efectos:{caja:-3, ebitda:-1}, consecuencia:"Evitas la queja de tus clientes sin apurar una decisión de reparación, a cambio de un costo de arriendo adicional."}
    ]}),

  (s,f)=>({
    tipo:'random', titulo:"Tu instructor estrella exige exclusividad o se va con sus clientes",
    contexto:"El instructor de spinning más popular del gimnasio, quien arrastra consigo a buena parte de la clientela fiel, te exige un contrato de exclusividad con mejores condiciones o amenaza con abrir su propio estudio y llevarse a sus alumnos.",
    choices:[
      {texto:"Aceptar sus condiciones y firmar un contrato de exclusividad más generoso.", efectos:{ebitda:-3, moralEquipo:5},
       consecuencia:"Retienes al instructor y a su clientela fiel, aunque el resto del equipo de entrenadores empieza a preguntarse por qué él sí y ellos no."},
      {texto:"Negarte y dejar que se vaya, apostando a que sus alumnos se queden por el gimnasio, no por él.", efectos:{ebitda:-4, reputacion:-2},
       consecuencia:"Una parte de sus alumnos efectivamente se queda. La mayoría, sin embargo, sigue al instructor a su nuevo estudio."},
      {texto:"Ofrecerle una participación en las membresías premium que él mismo venda.", efectos:{ebitda:-1, moralEquipo:3},
       consecuencia:"Encuentras un esquema que lo motiva sin comprometerte a una exclusividad rígida ni desestabilizar la estructura salarial del resto."},
      {texto:"Contratar a otro instructor de perfil similar como respaldo, sin confrontarlo directamente.", efectos:{caja:-3},
       consecuencia:"Reduces tu dependencia de una sola persona a mediano plazo, aunque el costo de tener doble cobertura pesa mientras tanto."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Brote de una enfermedad respiratoria reduce la asistencia",
    contexto:"Un brote de una enfermedad respiratoria común en la ciudad hace que la asistencia al gimnasio caiga notablemente durante varias semanas, mientras algunos clientes piden pausar su membresía.",
    choices:[
      {texto:"Reforzar la limpieza y ventilación, y comunicarlo activamente para tranquilizar a los clientes.", efectos:{caja:-2, reputacion:4},
       consecuencia:"La inversión en protocolos visibles ayuda a que algunos clientes vuelvan antes de lo que hubieran vuelto por su cuenta."},
      {texto:"Ofrecer clases virtuales temporales para quienes prefieran no asistir presencialmente.", efectos:{caja:-1, ebitda:1},
       consecuencia:"Mantienes parte del ingreso de esos clientes sin forzarlos a elegir entre pagar y no asistir."},
      {texto:"No hacer ningún cambio y esperar a que el brote pase por sí solo.", efectos:{ebitda:-3},
       consecuencia:"Ahorras el gasto en medidas adicionales, pero pierdes más clientes de los necesarios mientras el brote sigue su curso."},
      {texto:"Congelar temporalmente las membresías de quienes lo soliciten, sin cobrarles durante la pausa.", efectos:{caja:-2, reputacion:3},
       consecuencia:"El gesto genera lealtad real, a cambio de un ingreso que dejas de percibir mientras dure la pausa."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una cadena low-cost abre un gimnasio justo al lado",
    contexto:"Una cadena de gimnasios de bajo costo abre una sede a media cuadra de la tuya, con membresías a un tercio de tu precio y máquinas nuevas, aunque sin clases grupales ni asesoría personalizada.",
    choices:[
      {texto:"Bajar tus precios para competir directamente en el mismo terreno.", efectos:{ebitda:-4, caja:2},
       consecuencia:"Frenas parte de la fuga de clientes sensibles al precio, a costa de un margen que ya era ajustado."},
      {texto:"Diferenciarte reforzando las clases grupales y la asesoría personalizada, sin tocar el precio.", efectos:{caja:-3, reputacion:4},
       consecuencia:"Apuestas a que el valor agregado, no el precio, es lo que retiene a tu clientela más fiel."},
      {texto:"Lanzar una membresía básica más económica, sin tocar tu membresía premium actual.", efectos:{ebitda:-1, caja:1},
       consecuencia:"Segmentas tu oferta para no perder del todo a los clientes sensibles al precio, sin sacrificar a los que sí valoran el servicio completo."},
      {texto:"No hacer ningún cambio y confiar en la fidelidad de tu clientela actual.", efectos:{ebitda:-1},
       consecuencia:"Algunos clientes efectivamente se quedan por costumbre y cercanía. Otros, simplemente, se van a probar la opción más barata."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una marca de suplementos ofrece exclusividad de distribución",
    contexto:"Una marca reconocida de suplementos te ofrece ser su único punto de venta autorizado en la zona, a cambio de un compromiso de compra mínima mensual considerable.",
    choices:[
      {texto:"Aceptar la exclusividad y comprometerte con el volumen mínimo mensual.", efectos:{caja:-4, valorInventario:6, ebitda:2},
       consecuencia:"Consigues márgenes preferenciales y una marca reconocida solo en tu gimnasio, a cambio de un compromiso de compra que debes sostener aunque la demanda fluctúe."},
      {texto:"Rechazar la exclusividad y seguir comprando a varios proveedores según conveniencia.", efectos:{ebitda:-0.5},
       consecuencia:"Mantienes flexibilidad total, aunque renuncias a las condiciones preferenciales que solo obtienes con un compromiso de volumen."},
      {texto:"Negociar un volumen mínimo más bajo a cambio de exclusividad solo en ciertas líneas de producto.", efectos:{caja:-2, valorInventario:3},
       consecuencia:"Un término medio razonable: menos exposición, aunque también menos beneficio del que ofrecía el trato completo."},
      {texto:"Aceptar la exclusividad pero financiar el inventario inicial con el proveedor a plazo.", efectos:{valorInventario:6, diasCartera:0, deuda:3},
       consecuencia:"Consigues el trato sin golpear tu caja de inmediato, a cambio de una obligación financiera con el mismo proveedor."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Accidente de un cliente en las instalaciones",
    contexto:"Un cliente sufre una caída usando una máquina de peso libre sin la supervisión adecuada, y aunque no hay lesiones graves, exige una compensación y amenaza con acciones legales.",
    investigacion:{costo:1, boton:"Revisar las cámaras de seguridad y el registro de mantenimiento de la máquina ($1M)",
      reporte:"Las cámaras muestran que la máquina sí tenía el mantenimiento al día, pero el cliente no siguió las instrucciones de uso visibles en el equipo."},
    choices:[
      {texto:"Ofrecer una compensación económica inmediata para evitar cualquier proceso legal.", efectos:{caja:-3, reputacion:1},
       consecuencia:"Cierras el tema rápido, aunque sin claridad sobre la responsabilidad real, sienta un precedente costoso para cualquier reclamo futuro."},
      {texto:"Negarte a compensar, argumentando que el cliente asumió el riesgo al usar el equipo.", efectos:{reputacion:-4},
       consecuencia:"Puede que tengas razón, pero un cliente que se siente ignorado después de un accidente rara vez se queda callado en redes sociales."},
      {texto:"Contratar un seguro de responsabilidad civil para instalaciones deportivas de aquí en adelante.", efectos:{caja:-2, wacc:-0.1},
       consecuencia:"No resuelve el caso actual, pero te protege de que el próximo incidente similar sea un golpe tan directo a tu caja."},
      {texto:"Reforzar la señalización y supervisión en el área de pesos libres.", efectos:{caja:-1, reputacion:2},
       consecuencia:"Una medida preventiva razonable, aunque no cambia nada sobre cómo termina resolviéndose este caso puntual."}
    ],
    choiceInformado:{texto:"Con la evidencia de que la máquina estaba en buen estado y el cliente no siguió las instrucciones, rechazar la compensación con respaldo documentado.", efectos:{reputacion:-1},
      consecuencia:"Tienes la razón y la evidencia para sostenerla, aunque decir que no a un cliente lesionado siempre deja algo de incomodidad, tenga uno la razón o no."}
  })
];

