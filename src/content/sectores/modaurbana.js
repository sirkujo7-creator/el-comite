/* =========================================================================================
   SECTOR 5 · MODA URBANA — Retail de ropa (mecánica: inventario perecedero por temporada)
   ========================================================================================= */
const MODAURBANA_CASES = [
{ tipo:'caso', titulo:"La tienda por departamentos pide más plazo",
  contexto:"Tu cliente mayorista más grande (una cadena de tiendas por departamentos, 35% de tus ventas) te pide pasar de 30 a 90 días de plazo.",
  investigacion:{costo:3, boton:"Solicitar reporte de central de riesgo del cliente ($3M)",
    reporte:"Razón Corriente del cliente: <b>0.8</b>. Su endeudamiento de corto plazo se incrementó <b>40%</b> en el último semestre."},
  choices:[
    {texto:"Aceptar los 90 días completos, sin condiciones adicionales.", efectos:{caja:-3, capitalTrabajo:-2, razonCorriente:-0.15, diasCartera:35}, consecuencia:"El cliente sigue comprando y la relación queda intacta, pero tu ciclo de conversión de efectivo se alarga."},
    {texto:"Negociar 60 días con 2% de descuento si paga antes de 45.", efectos:{caja:-1, razonCorriente:-0.05, ebitda:-1, diasCartera:15}, consecuencia:"Reduces algo la presión sobre tu capital de trabajo, aunque el descuento golpea tu margen operativo."},
    {texto:"Aceptar los 90 días y cubrir el hueco de caja atrasando el pago a tus maquiladoras 30 días.", efectos:{caja:1, capitalTrabajo:-4, confianzaProveedores:-15, diasCartera:35},
     diferir:{monto:5, turnos:2, motivo:"Pago atrasado a maquiladoras por cubrir caja", tipo:'proveedor'}, consecuencia:"Resuelves el hueco de caja sin pedir crédito nuevo, pero esa deuda no desaparece, solo se reprograma."},
    {texto:"Ofrecer factoring: vender la cartera de este cliente a un descuento a cambio de caja inmediata.", efectos:{caja:4, ebitda:-2, diasCartera:-10}, consecuencia:"Obtienes liquidez de inmediato sin tomar deuda, a cambio de ceder parte del valor de la cartera a la entidad de factoring."}
  ],
  choiceInformado:{texto:"Con el reporte en mano, exigir un pagaré con aval antes de aceptar cualquier plazo mayor a 30 días.", efectos:{capitalTrabajo:1, razonCorriente:0.05, diasCartera:5},
    consecuencia:"Una Razón Corriente de 0.8 y un endeudamiento de corto plazo creciendo 40% no son síntomas de expansión: son síntomas de iliquidez."}
},
{ tipo:'caso', titulo:"Financiamiento para la colección de temporada",
  contexto:"Necesitas $15.000.000 para producir la colección de la próxima temporada antes de que pierda vigencia comercial.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", efectos:{caja:15, deuda:15, wacc:0.5, capitalTrabajo:15}, consecuencia:"Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas del mercado."},
    {texto:"Tomar crédito bancario a tasa variable por $15M, más barata hoy.", efectos:{caja:15, deuda:15, wacc:-0.3, capitalTrabajo:15}, setFlags:{deudaVariable:true},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado a lo que haga el Banco de la República."},
    {texto:"Ceder 20% de participación a un inversionista ángel por el mismo monto.", efectos:{caja:15, capitalTrabajo:15, wacc:1}, consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades futuras de la marca. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube."},
    {texto:"Hacer factoring de la cartera de clientes mayoristas actuales para financiar la nueva colección.", efectos:{caja:12, ebitda:-2, capitalTrabajo:10}, consecuencia:"Financias la colección con dinero que ya te debían, sin tomar deuda nueva, a cambio de un descuento sobre esa cartera."}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", efectos:{caja:12, deuda:12, wacc:0.3, capitalTrabajo:12, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
},
{ tipo:'caso', titulo:"Llega fast-fashion importado más barato",
  contexto:"Una cadena de fast-fashion importado abre en tu zona con precios muy por debajo de los tuyos en prendas similares.",
  choices:[
    {texto:"Bajar tus precios para competir directamente.", efectos:{ebitda:-4, caja:1}, consecuencia:"Mantienes el volumen de ventas, aunque entras en una guerra de precios que golpea tu margen de forma directa."},
    {texto:"Diferenciarte con diseño propio y producción local exclusiva.", efectos:{caja:-3, ebitda:1}, consecuencia:"Sales de competir solo por precio, aunque construir una propuesta de diseño diferenciada toma tiempo e inversión."},
    {texto:"Apostar por un nicho de sostenibilidad y producción local frente al fast-fashion.", efectos:{caja:-2, ebitda:0.5, confianzaProveedores:5}, consecuencia:"Atraes a un segmento de clientes dispuesto a pagar más por origen y sostenibilidad, aunque es un mercado más pequeño."},
    {texto:"No cambiar nada y esperar a ver si el efecto de la nueva competencia se diluye.", efectos:{ebitda:-2}, consecuencia:"Ahorras cualquier inversión de reacción, aunque cedes terreno mientras decides qué hacer."}
  ]
},
{ tipo:'caso', titulo:"Cae la demanda de temporada",
  contexto:"Un cambio de clima atípico reduce la demanda de la colección de temporada: las ventas caen justo en las semanas de mayor rotación esperada.",
  choices:[
    {texto:"Recortar personal de tienda para bajar costos fijos.", efectos:{ebitda:4, capitalTrabajo:1, reputacion:-6},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero pierdes vendedores con relación directa con tus clientes frecuentes."},
    {texto:"Reducir gastos generales y renegociar con maquiladoras antes de tocar personal.", efectos:{ebitda:2, capitalTrabajo:1, confianzaProveedores:-5}, consecuencia:"El ajuste es más lento pero protege tu equipo de tienda, aunque tensiona alguna relación de producción."},
    {texto:"Buscar un crédito puente para sostener la operación.", efectos:{caja:6, deuda:8, wacc:0.5, capitalTrabajo:4}, consecuencia:"Ganas tiempo sin recortar nada, pero cargas deuda adicional justo cuando tus ingresos son más bajos."},
    {texto:"Liquidar parte de la colección con descuento agresivo para acelerar la rotación.", efectos:{caja:3, ebitda:-2, diasInventario:-15, valorInventario:-5}, consecuencia:"Recuperas caja y liberas espacio de bodega, aunque vendes por debajo de tu margen habitual."}
  ]
},
{ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante. Tu contador sugiere reclasificar unos gastos como activos para mejorar los indicadores que verá el banco.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.", efectos:{caja:5, confianzaBanco:15, wacc:-1, reputacion:-4}, setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales."},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.", efectos:{caja:-3, confianzaBanco:5, razonCorriente:0.05, reputacion:5},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable."},
    {texto:"Mejorar los indicadores reales primero, cobrando cartera vencida antes de volver a aplicar.", efectos:{caja:2, capitalTrabajo:3, confianzaBanco:3, diasCartera:-8, ebitda:-1},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Mientras tanto, el crecimiento que pensabas financiar con el crédito queda en pausa."},
    {texto:"Buscar un crédito alternativo no bancario, sin tocar la contabilidad.", efectos:{caja:4, wacc:1.2, deuda:4},
     consecuencia:"Consigues el capital sin mentir en tus estados financieros, aunque el costo de ese crédito es más alto que el de la banca tradicional."}
  ]
},
{ tipo:'caso', titulo:"Una plataforma internacional de e-commerce ofrece incluirte en su catálogo",
  contexto:"Una plataforma de e-commerce con presencia en varios países te ofrece un cupo destacado en su catálogo de moda latinoamericana, con acceso a un público mucho más grande — a cambio de una comisión alta por venta y de cumplir tiempos de despacho muy estrictos.",
  investigacion:{costo:1.5, boton:"Contratar un estudio de la demanda potencial en esa plataforma ($1.5M)",
    reporte:"El estudio muestra una demanda real para tu categoría, pero advierte que el <b>15% de los vendedores nuevos</b> no logra sostener los tiempos de despacho exigidos más allá de tres meses."},
  choices:[
    {texto:"Aceptar el cupo y ajustar la operación completa a los tiempos de despacho exigidos.", efectos:{caja:-3, ebitda:2, capitalTrabajo:-2}, consecuencia:"Abres una puerta grande de ventas, apostando a que tu logística aguante el ritmo exigido."},
    {texto:"Rechazar la oferta y mantenerte enfocado en tus canales de venta actuales.", efectos:{diasInventario:2}, consecuencia:"Evitas el riesgo operativo, aunque el inventario que pensabas mover por ese canal se queda rotando más lento en tu bodega."},
    {texto:"Aceptar, pero empezando con un catálogo reducido para probar la operación antes de escalar.", efectos:{caja:-1, ebitda:0.5}, consecuencia:"Una entrada más controlada: menos exposición inmediata, pero también menos riesgo de fallar en los tiempos de entrega."},
    {texto:"Negociar tiempos de despacho más laxos antes de aceptar cualquier compromiso.", efectos:{caja:-0.3}, consecuencia:"La plataforma cede parcialmente, dándote algo más de margen operativo del que ofrecía originalmente."}
  ],
  choiceInformado:{texto:"Con el riesgo de sostenibilidad confirmado, aceptar solo con un catálogo reducido para probar la operación primero.", efectos:{caja:-1, ebitda:1},
    consecuencia:"Sabiendo que 1 de cada 6 vendedores nuevos no aguanta el ritmo, entrar en grande desde el día uno hubiera sido innecesariamente arriesgado."}
},
];
function MODAURBANA_NOMINA(s,f){ return {tipo:'calendario', titulo:"Nómina y prima de temporada",
  contexto:"Toca pagar la nómina completa del equipo de tienda, incluyendo el personal estacional contratado para la temporada alta, más la prima legal.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9}, consecuencia:"Cumples en tiempo y forma, sin costo adicional."},
    {texto:"Pagar la nómina completa, pero diferir la prima 30 días con acuerdo del equipo.", efectos:{caja:-6}, diferir:{monto:3.3, turnos:1, motivo:"Prima diferida al equipo", tipo:'nomina'},
     consecuencia:"El equipo acepta por esta vez, pero es una obligación legal con un límite de tolerancia corto."},
    {texto:"Tomar un crédito de nómina de corto plazo.", efectos:{deuda:5, wacc:0.5, caja:-4}, consecuencia:"Evitas fricción con el equipo, pero sumas una deuda más a tu estructura de capital."},
    {texto:"Usar el ingreso de la liquidación de temporada pasada para cubrir el pago.", efectos:{caja:-9, diasInventario:-10, valorInventario:-3}, consecuencia:"Cumples usando caja que ya tenías en mano de ventas de liquidación, sin pedir nada nuevo."}
  ]};}
function MODAURBANA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta y liquidación de inventario de temporada pasada",
  contexto:"Llega la fecha de declarar renta, mientras aún tienes inventario de la temporada pasada por liquidar en bodega.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7, confianzaBanco:2}, consecuencia:"Cumples sin generar ninguna obligación adicional. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la DIAN.", efectos:{caja:-2, deuda:5, wacc:0.4}, consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario externo para revisar deducciones antes de declarar.", efectos:{caja:-5, ebitda:0.5}, consecuencia:"Sus honorarios tienen costo, pero identifica deducciones legítimas que reducen el valor final a pagar."},
    {texto:"Liquidar parte del inventario de temporada pasada para financiar el pago.", efectos:{caja:2, ebitda:-2, diasInventario:-20, valorInventario:-6}, consecuencia:"Cubres buena parte del pago con inventario que de todos modos ya estaba perdiendo valor en bodega."}
  ]};}
const MODAURBANA_RANDOM = [
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"las telas e insumos importados de tu próxima colección"),
  (s,f)=>({tipo:'macro', titulo:"Sube el arancel a la ropa importada", titular:"Guerra Comercial en Casa: Sube el Arancel a la Ropa Importada", impactoAutomatico:{ebitda:1},
    contexto:"El gobierno sube el arancel a las importaciones de fast-fashion para proteger la industria nacional — lo cual ya te favorece frente a la competencia importada, aunque también encarece la tela importada que tú mismo usas.",
    choices:[
      {texto:"Aprovechar la menor competencia para subir tus precios.", efectos:{ebitda:2, diasInventario:3}, consecuencia:"Con el fast-fashion más caro, tienes más margen de maniobra en precio, aunque el precio más alto también hace que la ropa rote un poco más lento en tienda."},
      {texto:"Mantener tus precios y ganar participación de mercado frente al fast-fashion encarecido.", efectos:{capitalTrabajo:-1}, consecuencia:"Capturas clientes que antes preferían lo importado más barato, a cambio de no capitalizar el margen extra de inmediato."},
      {texto:"Buscar proveedores de tela nacional para reducir tu propia exposición al arancel.", efectos:{caja:-2, ebitda:0.5}, consecuencia:"Reduces tu dependencia de tela importada, aunque el cambio de proveedor toma tiempo de ajuste en tu producción."},
      {texto:"No cambiar nada por ahora y evaluar el efecto completo el próximo periodo.", efectos:{diasInventario:1}, consecuencia:"Ganas algo del efecto favorable sin mover nada todavía, aunque también sin capitalizarlo del todo."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un lote de la colección no llegó a tiempo",
    contexto:"Un problema logístico retiene en aduana un lote importante de la colección justo antes del arranque de temporada.",
    choices:[
      {texto:"Pagar por una gestión aduanera urgente para liberar el lote.", efectos:{caja:-4}, consecuencia:"Recuperas el lote a tiempo para buena parte de la temporada, a un costo de gestión considerable."},
      {texto:"Esperar el trámite regular de aduana.", efectos:{ebitda:-3, diasInventario:10}, consecuencia:"Ahorras el costo de la gestión urgente, pero pierdes buena parte de la ventana comercial de la temporada."},
      {texto:"Lanzar la temporada solo con lo que ya tienes en bodega y ajustar la estrategia de surtido.", efectos:{ebitda:-1, reputacion:-1}, consecuencia:"Sales a tiempo con menos variedad de la planeada, aunque no dependes de que se resuelva el trámite aduanero. Algunos clientes extrañan las referencias anunciadas."},
      {texto:"Reclamar el sobrecosto y el retraso al operador logístico responsable.", efectos:{caja:-1, ebitda:-2}, consecuencia:"Inicias un proceso de reclamación que, si prospera, podría compensar parte de la pérdida — aunque no es inmediato. Mientras tanto, el lote sigue retenido y pierdes parte de la temporada."}
    ]}),
  (s,f)=>{
    const inventarioSano = s.diasInventario!=null && s.diasInventario <= 45;
    return {tipo:'random', titulo:"Una prenda se vuelve tendencia viral",
      contexto:`Una prenda de tu colección se vuelve tendencia en redes sociales y la demanda se dispara esta semana. ${inventarioSano ? 'Tu inventario está rotando a buen ritmo para responder a la demanda extra.' : 'Tu inventario lleva varios turnos rotando lento, justo cuando más se necesitaría stock disponible.'}`,
      choices:[
        {texto:"Aprovechar y producir un reabastecimiento urgente de la prenda.", efectos: inventarioSano ? {caja:2, ebitda:3, diasInventario:5} : {caja:2, ebitda:1, confianzaProveedores:-5},
         consecuencia: inventarioSano ? "Tu cadena de producción responde a tiempo y capturas la demanda casi por completo. Eso sí, si la tendencia se enfría, las unidades extra se quedan en bodega." : "La demanda llega, pero tu producción no tiene la holgura para responder rápido: terminas pidiendo producción urgente a la maquiladora, en peores condiciones."},
        {texto:"Limitar la promoción para no comprometer la calidad de producción actual.", efectos:{ebitda:1, reputacion:-1}, consecuencia:"Creces con prudencia: menos ingreso inmediato, pero ningún cliente nuevo recibe una prenda de menor calidad por la prisa. Algunos clientes que no consiguieron la prenda la buscan en la competencia."},
        {texto:"Subcontratar una segunda maquiladora temporal para atender el pico de demanda.", efectos:{caja:-2, ebitda:2}, consecuencia:"Cubres el pico de demanda sin comprometer tu producción habitual, a cambio de un costo adicional este periodo."},
        {texto:"Lanzar una edición limitada numerada para capitalizar la tendencia sin sobreproducir.", efectos:{ebitda:2, diasInventario:-5, valorInventario:-2}, consecuencia:"Capitalizas el momento viral sin arriesgarte a producir de más si la tendencia se apaga tan rápido como llegó."}
      ]};
  },

  (s,f)=>({
    tipo:'random', titulo:"Una influencer usa tu ropa y dispara la demanda",
    contexto:"Una influencer con millones de seguidores usa una prenda tuya sin que hubiera ningún acuerdo comercial de por medio, y las ventas de esa referencia se disparan de un día para otro.",
    choices:[
      {texto:"Producir de emergencia más unidades de esa referencia para no perder la ola de demanda.", efectos:{caja:-5, valorInventario:8, ebitda:3},
       consecuencia:"Capitalizas el momento viral con producción acelerada, aunque a un costo de manufactura más alto por la urgencia."},
      {texto:"Contactar a la influencer para formalizar una colaboración paga a futuro.", efectos:{caja:-2, reputacion:4},
       consecuencia:"Conviertes un golpe de suerte en una relación comercial sostenible a mediano plazo, aunque no todas las influencers responden a este tipo de acercamiento."},
      {texto:"Dejar que la demanda se agote con el inventario actual, sin producir más de esa referencia.", efectos:{ebitda:1, reputacion:-1},
       consecuencia:"Evitas el riesgo de sobreproducir para una tendencia que podría apagarse tan rápido como llegó, aunque dejas ventas sobre la mesa mientras dura el momento. Y algunos clientes que llegaron por la publicación se van con las manos vacías."},
      {texto:"Subir el precio de esa referencia específica mientras dure el pico de demanda.", efectos:{ebitda:3, reputacion:-3},
       consecuencia:"Capitalizas el momento con mejor margen, aunque algunos clientes notan el aumento repentino y lo comentan como oportunismo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Denuncia de mano de obra infantil en un proveedor",
    contexto:"Una ONG denuncia públicamente que uno de tus proveedores de confección subcontrata talleres donde se ha detectado mano de obra infantil.",
    investigacion:{costo:2, boton:"Contratar una auditoría social independiente del taller señalado ($2M)",
      reporte:"La auditoría confirma la presencia de menores trabajando en el taller subcontratado, en clara violación de la normativa laboral vigente."},
    choices:[
      {texto:"Cortar de inmediato la relación con ese proveedor y hacerlo público como gesto de compromiso.", efectos:{caja:-3, ebitda:-2, reputacion:8, confianzaProveedores:-3},
       consecuencia:"La decisión cuesta producción y proveedores a corto plazo, pero es la única respuesta defendible ante un hallazgo de este tipo."},
      {texto:"Mantener la relación mientras exiges un plan de corrección al proveedor, sin hacerlo público.", efectos:{ebitda:1, reputacion:-6, confianzaProveedores:2},
       consecuencia:"Evitas la disrupción inmediata en tu cadena de suministro, pero si la denuncia sigue creciendo, tu silencio se interpreta como complicidad."},
      {texto:"Negar cualquier conocimiento previo y no tomar ninguna acción sobre el proveedor.", efectos:{ebitda:1.5, reputacion:-12, confianzaProveedores:-2},
       consecuencia:"La negación sin acción, frente a una denuncia pública y documentada, suele salir peor que cualquier otra respuesta posible."},
      {texto:"Financiar directamente un programa de escolarización para los menores identificados, manteniendo al proveedor bajo supervisión estricta.", efectos:{caja:-4, reputacion:3, confianzaProveedores:1},
       consecuencia:"Atiendes la causa humana del problema inmediato, aunque mantener al proveedor sigue siendo una decisión que muchos cuestionarían."}
    ],
    choiceInformado:{texto:"Con la auditoría confirmando el hallazgo, cortar la relación de inmediato y reportarlo a las autoridades laborales.", efectos:{caja:-3, ebitda:-2, reputacion:10},
      consecuencia:"Actuar con evidencia confirmada, no solo con la denuncia inicial, es la respuesta más sólida — y la única moralmente defendible ante un caso comprobado."}
  }),
  (s,f)=>({
    tipo:'random', titulo:"Temporada de lluvias atípica arruina la colección de verano",
    contexto:"Una temporada de lluvias mucho más intensa de lo pronosticado golpea justo cuando lanzaste tu colección de verano, y la demanda de esas prendas se desploma.",
    choices:[
      {texto:"Liquidar la colección de verano con descuento agresivo antes de que pierda más valor.", efectos:{caja:4, ebitda:-3, valorInventario:-8, diasInventario:-15},
       consecuencia:"Recuperas algo de liquidez rápido, a costa de vender muy por debajo del margen que esperabas para esta colección."},
      {texto:"Almacenar la colección para la próxima temporada de verano.", efectos:{valorInventario:0, capitalTrabajo:-3},
       consecuencia:"Evitas liquidar con pérdida, aunque ese capital queda atrapado en inventario durante varios meses antes de poder venderse de nuevo."},
      {texto:"Reconvertir parte de la colección en prendas de entretiempo con ajustes menores de diseño.", efectos:{caja:-2, ebitda:1, diasInventario:-8},
       consecuencia:"Encuentras una salida creativa que recupera parte del valor sin liquidar a pérdida total ni esperar meses."},
      {texto:"Donar una parte de la colección menos vendible como estrategia de responsabilidad social.", efectos:{ebitda:-2, reputacion:4, valorInventario:-4},
       consecuencia:"El gesto genera buena imagen de marca, aunque no recuperas nada del valor de esas prendas."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un competidor copia tu diseño y lo vende más barato",
    contexto:"Detectas que un competidor lanzó una prenda casi idéntica a uno de tus diseños más exitosos, vendiéndola a un precio considerablemente menor.",
    choices:[
      {texto:"Iniciar un proceso legal por infracción de diseño industrial, si tienes el registro correspondiente.", efectos:{caja:-3, reputacion:2},
       consecuencia:"El proceso puede tomar meses y no siempre termina a tu favor, pero envía un mensaje claro sobre proteger tu propiedad intelectual."},
      {texto:"Lanzar rápidamente una variación mejorada del diseño original para diferenciarte.", efectos:{caja:-2, ebitda:1},
       consecuencia:"Te adelantas con una versión superior antes de que el mercado asocie el diseño original solo con la copia barata."},
      {texto:"Bajar el precio de tu diseño original para competir directamente.", efectos:{ebitda:-2, diasInventario:-5},
       consecuencia:"Defiendes tu participación de mercado en esa referencia, a costa de un margen que ya considerabas parte de tu rentabilidad."},
      {texto:"No hacer nada, confiando en que tu marca y calidad se diferencian solas.", efectos:{ebitda:-1},
       consecuencia:"Para una parte de tu clientela, la marca sí importa. Para otra parte, sensible al precio, la copia barata es suficiente."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La plataforma de e-commerce sube su comisión drásticamente",
    contexto:"La plataforma de e-commerce donde vendes buena parte de tu producción anuncia un aumento considerable en su comisión por venta, con vigencia inmediata y sin negociación individual.",
    choices:[
      {texto:"Aceptar la nueva comisión y mantener tu operación en la plataforma sin cambios.", efectos:{ebitda:-3},
       consecuencia:"Conservas el volumen de ventas que ya tenías, a costa directa de tu margen en cada transacción."},
      {texto:"Subir tus precios en esa plataforma para compensar la comisión adicional.", efectos:{ebitda:1, diasCartera:5},
       consecuencia:"Proteges tu margen, aunque tus productos quedan menos competitivos frente a otras marcas en la misma plataforma."},
      {texto:"Invertir en fortalecer tu tienda propia en línea para reducir la dependencia de la plataforma.", efectos:{caja:-5, ebitda:-1},
       consecuencia:"Es una apuesta a mediano plazo por tu propio canal de venta, que no da resultados inmediatos pero reduce tu exposición futura a decisiones de terceros."},
      {texto:"Reducir tu catálogo en la plataforma a solo los productos de mayor margen.", efectos:{ebitda:1, valorInventario:-3},
       consecuencia:"Proteges tu rentabilidad concentrándote en lo más rentable, aunque reduces tu volumen total de ventas en ese canal."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La colección de la temporada pasada sigue sin venderse",
    contexto:"La ropa de la colección anterior sigue ocupando espacio en tienda y bodega, mientras la nueva colección ya está lista para exhibirse. Cada semana que esa ropa vieja no se mueve, tus días de inventario suben y el espacio que ocupa podría estar mostrando lo nuevo.",
    choices:[
      {texto:"Liquidar todo con un descuento agresivo de fin de temporada.", efectos:{diasInventario:-14, valorInventario:-3, caja:2}, consecuencia:"Recuperas espacio y liquidez de inmediato, aunque vendiste muy por debajo del precio original de esas prendas."},
      {texto:"Mantenerla en bodega esperando una nueva oportunidad de venderla a precio completo.", efectos:{diasInventario:6}, consecuencia:"Conservas la esperanza de un mejor precio, aunque la moda avanza rápido y esa oportunidad puede no llegar nunca."},
      {texto:"Donarla a una fundación a cambio del beneficio tributario correspondiente.", efectos:{diasInventario:-14, valorInventario:-3, reputacion:3}, consecuencia:"No recuperas caja directa, pero el beneficio tributario y la reputación ganada compensan buena parte de la pérdida."},
      {texto:"Venderla a granel a un outlet de descuento, sin exhibirla más en tu tienda.", efectos:{diasInventario:-10, valorInventario:-2, caja:1}, consecuencia:"Un punto medio razonable: liberas espacio e inventario sin regalar la mercancía por completo."}
    ]
  })
];

