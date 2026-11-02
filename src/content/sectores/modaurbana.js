/* =========================================================================================
   SECTOR 5 · MODA URBANA — Retail de ropa (mecánica: inventario perecedero por temporada)
   Nov. 2026: 3 opciones por caso, todas defendibles; los efectos dependen de cómo esté la
   empresa (content/universal/contexto.js). En Moda Urbana pesan el inventario que no rota
   (la ropa pierde valor cada semana), la caja, la cartera de los mayoristas y las maquiladoras.
   ========================================================================================= */
const MODAURBANA_CASES = [
(s,f)=>({ tipo:'caso', titulo:"La tienda por departamentos pide más plazo",
  contexto:"Tu cliente mayorista más grande (una cadena de tiendas por departamentos, 35% de tus ventas) te pide pasar de 30 a 90 días de plazo.",
  investigacion:{costo:3, boton:"Solicitar reporte de central de riesgo del cliente ($3M)",
    reporte:"Razón corriente del cliente: <b>0.8</b>. Su endeudamiento de corto plazo se incrementó <b>40%</b> en el último semestre."},
  choices:[
    {texto:"Aceptar los 90 días completos, sin condiciones adicionales.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), -5, -3), capitalTrabajo:-2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.25, -0.15), diasCartera:35, ebitda:1, confianzaProveedores:2},
     consecuencia:"El cliente sigue comprando y hasta sube el pedido, pero tu ciclo de conversión de efectivo se alarga." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, financiar tres meses a un cliente te deja contra las cuerdas.', '')},
    {texto:"Negociar 60 días con 2% de descuento si paga antes de 45.",
     efectos:{caja:-1, razonCorriente:-0.05, ebitda:-1, diasCartera:si(CONTEXTO.carteraLenta(s), 20, 12)},
     consecuencia:"Reduces la presión sobre tu capital de trabajo, aunque el descuento golpea tu margen operativo." + si(CONTEXTO.carteraLenta(s), ' Tu cartera ya venía lenta: el cliente no aprovecha el descuento y paga al día 60.', '')},
    {texto:"Ofrecer factoring: vender la cartera de este cliente a un descuento a cambio de caja inmediata.",
     efectos:{caja:si(CONTEXTO.bancoAmigo(s), 5, 4), ebitda:si(CONTEXTO.bancoAmigo(s), -1.5, -2.2), diasCartera:-10, wacc:0.1},
     consecuencia:"Obtienes liquidez de inmediato sin tomar deuda, a cambio de ceder parte del valor de la cartera." + si(CONTEXTO.bancoAmigo(s), ' Tu banco te da una tasa de descuento baja.', '')}
  ],
  choiceInformado:{texto:"Con el reporte en mano, exigir un pagaré con aval antes de aceptar cualquier plazo mayor a 30 días.", efectos:{capitalTrabajo:1, razonCorriente:0.05, diasCartera:5},
    consecuencia:"Una razón corriente de 0.8 y un endeudamiento de corto plazo creciendo 40% no son síntomas de expansión: son síntomas de iliquidez."}
}),
(s,f)=>({ tipo:'caso', titulo:"Financiamiento para la colección de temporada",
  contexto:"Necesitas $15.000.000 para producir la colección de la próxima temporada antes de que pierda vigencia comercial. El dinero se irá en telas y confección: lo que quede en caja será poco.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", plazo:'largo',
     efectos:{caja:6, capitalTrabajo:6, valorInventario:5, diasInventario:si(CONTEXTO.inventarioPesado(s), 10, 4), deuda:15, ebitda:1, wacc:si(CONTEXTO.apalancado(s), 1, 0.5)},
     consecuencia:"La colección sale a tiempo. Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas." + si(CONTEXTO.inventarioPesado(s), ' Pero la bodega ya estaba llena: la ropa nueva se amontona sobre la vieja.', '')},
    {texto:"Ceder 20% de participación a un inversionista ángel por el mismo monto.",
     efectos:{caja:6, capitalTrabajo:6, valorInventario:5, diasInventario:si(CONTEXTO.inventarioPesado(s), 10, 4), ebitda:1, wacc:si(CONTEXTO.juntaDesconfia(s), 1.6, si(CONTEXTO.apalancado(s), 1.3, 1)), reputacion:si(CONTEXTO.reputacionAlta(s), 2, 0)},
     consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades futuras de la marca. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube." + si(CONTEXTO.reputacionAlta(s), ' Un inversionista conocido en moda se suma a una marca con buena fama, y se nota.', '')},
    {texto:"Hacer factoring de la cartera de clientes mayoristas actuales para financiar una colección más corta.",
     efectos:{caja:3, capitalTrabajo:3, valorInventario:3, diasCartera:-10, ebitda:si(CONTEXTO.carteraLenta(s), -0.5, -1.2)},
     consecuencia:"Financias una colección más pequeña con dinero que ya te debían, sin deuda nueva, a cambio de un descuento sobre esa cartera." + si(CONTEXTO.carteraLenta(s), ' Con tanta cartera atrasada, convertirla en caja vale más que el descuento.', '')}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", plazo:'largo', efectos:{caja:5, capitalTrabajo:5, valorInventario:4, diasInventario:3, deuda:12, ebitda:0.8, wacc:0.3, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
}),
(s,f)=>({ tipo:'caso', titulo:"Llega fast fashion importado más barato",
  contexto:"Una cadena de fast fashion importado abre en tu zona con precios muy por debajo de los tuyos en prendas similares.",
  choices:[
    {texto:"Bajar tus precios para competir directamente.",
     efectos:{ebitda:si(CONTEXTO.inventarioPesado(s), -2, -3), caja:1, diasInventario:si(CONTEXTO.inventarioPesado(s), -10, -4)},
     consecuencia:"Mantienes el volumen de ventas, aunque entras en una guerra de precios que golpea tu margen." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega llena, al menos la ropa empieza a moverse.', '')},
    {texto:"Diferenciarte con diseño propio y producción local exclusiva.",
     efectos:{caja:-3, ebitda:si(CONTEXTO.reputacionAlta(s), 1.5, 0.5), diasInventario:3, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Sales de competir solo por precio, aunque construir una propuesta de diseño toma tiempo e inversión." + si(CONTEXTO.reputacionAlta(s), ' Tu marca ya tiene seguidores: la apuesta paga rápido.', ' Sin una marca reconocida, el público tarda en notarlo.')},
    {texto:"Apostar por un nicho de sostenibilidad y producción local frente al fast fashion.",
     efectos:{caja:-2, ebitda:-0.5, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), 8, 4), reputacion:2},
     consecuencia:"Atraes a un segmento dispuesto a pagar más por origen y sostenibilidad, aunque es un mercado más pequeño y vendes menos." + si(CONTEXTO.proveedoresTensos(s), ' Tus maquiladoras locales, que se sentían relegadas, lo agradecen.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Cae la demanda de temporada", impactoAutomatico:{ebitda:-2},
  contexto:"Un cambio de clima atípico reduce la demanda de la colección de temporada: las ventas caen justo en las semanas de mayor rotación esperada.",
  choices:[
    {texto:"Recortar personal de tienda para bajar costos fijos.",
     efectos:{ebitda:4, capitalTrabajo:1, reputacion:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -12, -6)},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero pierdes vendedores con relación directa con tus clientes frecuentes." + si(CONTEXTO.equipoCansado(s), ' El equipo ya estaba desgastado: el recorte se siente como abandono.', '')},
    {texto:"Reducir gastos generales y renegociar con maquiladoras antes de tocar personal.",
     efectos:{ebitda:2, capitalTrabajo:1, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -10, -5)},
     consecuencia:"El ajuste es más lento, pero protege a tu equipo de tienda, aunque tensiona la relación de producción." + si(CONTEXTO.proveedoresTensos(s), ' Las maquiladoras ya estaban molestas: algunas amenazan con no aceptar tu próximo pedido.', '')},
    {texto:"Liquidar parte de la colección con descuento agresivo para acelerar la rotación.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 5, 3), ebitda:-2, diasInventario:si(CONTEXTO.inventarioPesado(s), -20, -12), valorInventario:-5},
     consecuencia:"Recuperas caja y liberas espacio de bodega, aunque vendes por debajo de tu margen habitual." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega a reventar, era la salida que más falta hacía.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante. Tu contador sugiere reclasificar unos gastos como activos para mejorar los indicadores que verá el banco.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 6, 4), confianzaBanco:8, wacc:-0.5, reputacion:si(CONTEXTO.juntaDesconfia(s), -8, -4)},
     setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que ya te vigilaba, nota que las cifras no cuadran.', '')},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.",
     efectos:{caja:si(CONTEXTO.bancoAmigo(s), -1, -2), confianzaBanco:si(CONTEXTO.bancoAmigo(s), 8, 6), razonCorriente:0.1, wacc:-0.2, reputacion:4},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable." + si(CONTEXTO.bancoAmigo(s), ' El banco te conoce: recorta poco y valora la franqueza.', '')},
    {texto:"Mejorar los indicadores reales primero, cobrando cartera vencida antes de volver a aplicar.",
     efectos:{caja:3, capitalTrabajo:3, confianzaBanco:3, diasCartera:si(CONTEXTO.carteraLenta(s), -14, -6), ebitda:si(CONTEXTO.liquidezBaja(s), -1.6, -1)},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Mientras tanto, el crecimiento que pensabas financiar queda en pausa." + si(CONTEXTO.carteraLenta(s), ' Tenías mucha cartera atrasada: hay bastante por recoger.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Una plataforma internacional de e-commerce ofrece incluirte en su catálogo",
  contexto:"Una plataforma de e-commerce con presencia en varios países te ofrece un cupo destacado en su catálogo de moda latinoamericana, con acceso a un público mucho más grande — a cambio de una comisión alta por venta y de cumplir tiempos de despacho muy estrictos.",
  investigacion:{costo:1.5, boton:"Contratar un estudio de la demanda potencial en esa plataforma ($1.5M)",
    reporte:"El estudio muestra una demanda real para tu categoría, pero advierte que el <b>15% de los vendedores nuevos</b> no logra sostener los tiempos de despacho exigidos más allá de tres meses."},
  choices:[
    {texto:"Aceptar el cupo y ajustar la operación completa a los tiempos de despacho exigidos.",
     efectos:{caja:-3, ebitda:si(CONTEXTO.equipoCansado(s), 0.5, 2), capitalTrabajo:-2, diasInventario:si(CONTEXTO.inventarioPesado(s), -10, -4), moralEquipo:-2},
     consecuencia:"Abres una puerta grande de ventas, apostando a que tu logística aguante el ritmo exigido." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, fallas despachos y la plataforma te baja de posición.', '') + si(CONTEXTO.inventarioPesado(s), ' Al menos la ropa acumulada encuentra compradores.', '')},
    {texto:"Rechazar la oferta y mantenerte enfocado en tus canales de venta actuales.",
     efectos:{diasInventario:si(CONTEXTO.inventarioPesado(s), 6, 2), wacc:-0.1, reputacion:1},
     consecuencia:"Evitas el riesgo operativo y no te atas a un tercero, aunque el inventario que pensabas mover por ese canal se queda rotando más lento." + si(CONTEXTO.inventarioPesado(s), ' Y tu bodega ya estaba llena.', '')},
    {texto:"Aceptar, pero empezando con un catálogo reducido para probar la operación antes de escalar.",
     efectos:{caja:-1.5, ebitda:0.5, diasInventario:-2, moralEquipo:-1},
     consecuencia:"Una entrada más controlada: menos exposición inmediata y menos riesgo de fallar en los tiempos de entrega, aunque la plataforma te da menos visibilidad."}
  ],
  choiceInformado:{texto:"Con el riesgo de sostenibilidad confirmado, aceptar solo con un catálogo reducido para probar la operación primero.", efectos:{caja:-1, ebitda:1},
    consecuencia:"Sabiendo que 1 de cada 6 vendedores nuevos no aguanta el ritmo, entrar en grande desde el día uno hubiera sido innecesariamente arriesgado."}
}),
];
function MODAURBANA_NOMINA(s,f){ return {tipo:'calendario', titulo:"Nómina y prima de temporada",
  contexto:"Toca pagar la nómina completa del equipo de tienda, incluyendo el personal estacional contratado para la temporada alta, más la prima legal.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9, moralEquipo:si(CONTEXTO.equipoCansado(s), 3, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
     consecuencia:"Cumples en tiempo y forma." + si(CONTEXTO.liquidezBaja(s), ' Pero con la caja tan justa, el pago deja tu liquidez en rojo.', '')},
    {texto:"Pagar la nómina completa, pero diferir la prima 30 días con acuerdo del equipo.", efectos:{caja:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -8, -3)}, diferir:{monto:3.3, turnos:1, motivo:"Prima diferida al equipo", tipo:'nomina'},
     consecuencia:"El equipo acepta por esta vez, pero es una obligación legal con un límite de tolerancia corto." + si(CONTEXTO.equipoCansado(s), ' Con el ánimo bajo, varios vendedores empiezan a buscar otro trabajo.', '')},
    {texto:"Cubrir el pago con una liquidación relámpago de la temporada pasada.", efectos:{caja:-7, diasInventario:si(CONTEXTO.inventarioPesado(s), -14, -8), valorInventario:-4, ebitda:-1},
     consecuencia:"Cumples usando ventas de liquidación, sin deuda nueva, aunque rematas ropa por debajo de su precio." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega llena, la liquidación además libera espacio que necesitabas.', '')}
  ]};}
function MODAURBANA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta y liquidación de inventario de temporada pasada",
  contexto:"Llega la fecha de declarar renta, mientras aún tienes inventario de la temporada pasada por liquidar en bodega.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7, confianzaBanco:4, wacc:-0.1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Cumples sin generar ninguna obligación adicional. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la DIAN.", efectos:{caja:-2, deuda:5, wacc:si(CONTEXTO.bancoAmigo(s), 0.2, 0.4)},
     consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Liquidar parte del inventario de temporada pasada para financiar el pago.", efectos:{caja:si(CONTEXTO.inventarioPesado(s), -1, -3), ebitda:-2.5, diasInventario:-20, valorInventario:-6},
     consecuencia:"Cubres buena parte del pago con inventario que de todos modos ya estaba perdiendo valor en bodega." + si(CONTEXTO.inventarioPesado(s), ' Había tanta ropa acumulada que la liquidación cubre casi todo el pago.', '')}
  ]};}
const MODAURBANA_RANDOM = [
  (s,f)=>MACRO_TRM_COSTOS_USD(s,f,"las telas e insumos importados de tu próxima colección"),
  (s,f)=>({tipo:'macro', titulo:"Sube el arancel a la ropa importada", titular:"Guerra comercial en casa: sube el arancel a la ropa importada", impactoAutomatico:{ebitda:1},
    contexto:"El gobierno sube el arancel a las importaciones de fast fashion para proteger la industria nacional — lo cual ya te favorece frente a la competencia importada, aunque también encarece la tela importada que tú mismo usas.",
    choices:[
      {texto:"Aprovechar la menor competencia para subir tus precios.", efectos:{ebitda:2, diasInventario:si(CONTEXTO.inventarioPesado(s), 8, 3)},
       consecuencia:"Con el fast fashion más caro, tienes más margen de maniobra en precio, aunque la ropa rota más lento en tienda." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega ya llena, eso pesa.', '')},
      {texto:"Mantener tus precios y ganar participación de mercado frente al fast fashion encarecido.", efectos:{capitalTrabajo:-1, diasInventario:-5, reputacion:si(CONTEXTO.reputacionAlta(s), 3, 1)},
       consecuencia:"Capturas clientes que antes preferían lo importado y la ropa se mueve, a cambio de no capitalizar el margen extra."},
      {texto:"Buscar proveedores de tela nacional para reducir tu propia exposición al arancel.", efectos:{caja:-2, ebitda:0.5, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -3, 2)},
       consecuencia:"Reduces tu dependencia de tela importada, aunque el cambio de proveedor toma tiempo de ajuste." + si(CONTEXTO.proveedoresTensos(s), ' Tus proveedores actuales, ya molestos, lo toman como una traición.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Un lote de la colección no llegó a tiempo",
    contexto:"Un problema logístico retiene en aduana un lote importante de la colección justo antes del arranque de temporada.",
    choices:[
      {texto:"Pagar por una gestión aduanera urgente para liberar el lote.", efectos:{caja:-4, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0), confianzaProveedores:1},
       consecuencia:"Recuperas el lote a tiempo para buena parte de la temporada, a un costo de gestión considerable."},
      {texto:"Esperar el trámite regular de aduana.", efectos:{ebitda:-2, diasInventario:8, caja:-0.5, wacc:-0.1},
       consecuencia:"Ahorras el costo de la gestión urgente, pero pierdes parte de la ventana comercial de la temporada."},
      {texto:"Lanzar la temporada solo con lo que ya tienes en bodega y ajustar el surtido.", efectos:{ebitda:si(CONTEXTO.inventarioPesado(s), 0.5, -1), reputacion:-1, diasInventario:si(CONTEXTO.inventarioPesado(s), -8, -3)},
       consecuencia:"Sales a tiempo con menos variedad de la planeada. Algunos clientes extrañan las referencias anunciadas." + si(CONTEXTO.inventarioPesado(s), ' Pero tenías ropa de sobra en bodega: el surtido aguanta y la bodega se vacía.', '')}
    ]}),
  (s,f)=>{
    const inventarioSano = s.diasInventario!=null && s.diasInventario <= 45;
    return {tipo:'random', titulo:"Una prenda se vuelve tendencia viral",
      contexto:`Una prenda de tu colección se vuelve tendencia en redes sociales y la demanda se dispara esta semana. ${inventarioSano ? 'Tu inventario está rotando a buen ritmo para responder a la demanda extra.' : 'Tu inventario lleva varios turnos rotando lento, justo cuando más se necesitaría stock disponible.'}`,
      choices:[
        {texto:"Aprovechar y producir un reabastecimiento urgente de la prenda.", efectos: inventarioSano ? {caja:-1, ebitda:3, diasInventario:5} : {caja:-1, ebitda:1, confianzaProveedores:-5},
         consecuencia: inventarioSano ? "Tu cadena de producción responde a tiempo y capturas la demanda casi por completo. Eso sí, si la tendencia se enfría, las unidades extra se quedan en bodega." : "La demanda llega, pero tu producción no tiene la holgura para responder rápido: terminas pidiendo producción urgente a la maquiladora, en peores condiciones."},
        {texto:"Subcontratar una segunda maquiladora temporal para atender el pico de demanda.", efectos:{caja:-2, ebitda:si(CONTEXTO.proveedoresTensos(s), 1, 2), confianzaProveedores:-1},
         consecuencia:"Cubres el pico sin comprometer tu producción habitual, a cambio de un costo adicional y de que tu maquiladora de siempre lo note." + si(CONTEXTO.proveedoresTensos(s), ' Con la relación tensa, la segunda maquiladora cobra caro.', '')},
        {texto:"Lanzar una edición limitada numerada para capitalizar la tendencia sin sobreproducir.", efectos:{ebitda:si(CONTEXTO.reputacionAlta(s), 2, 1), diasInventario:-5, valorInventario:-2},
         consecuencia:"Capitalizas el momento viral sin arriesgarte a producir de más si la tendencia se apaga." + si(CONTEXTO.reputacionAlta(s), ' Tu marca convierte la escasez en deseo.', ' Sin una marca fuerte, la edición limitada pasa casi inadvertida.')}
      ]};
  },
  (s,f)=>({
    tipo:'random', titulo:"Una influencer usa tu ropa y dispara la demanda",
    contexto:"Una influencer con millones de seguidores usa una prenda tuya sin que hubiera ningún acuerdo comercial de por medio, y las ventas de esa referencia se disparan de un día para otro.",
    choices:[
      {texto:"Producir de emergencia más unidades de esa referencia para no perder la ola de demanda.", efectos:{caja:-5, valorInventario:8, ebitda:si(CONTEXTO.liquidezBaja(s), 1.5, 3), diasInventario:6, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"Capitalizas el momento con producción acelerada, a un costo más alto por la urgencia y con el riesgo de que sobren unidades." + si(CONTEXTO.liquidezBaja(s), ' Sin caja para producir todo, llegas tarde a la mitad de la ola.', '')},
      {texto:"Contactar a la influencer para formalizar una colaboración paga a futuro.", efectos:{caja:-2, reputacion:si(CONTEXTO.reputacionAlta(s), 6, 3), ebitda:0.5},
       consecuencia:"Conviertes un golpe de suerte en una relación comercial sostenible, aunque el efecto inmediato en ventas es menor."},
      {texto:"Subir el precio de esa referencia específica mientras dure el pico de demanda.", efectos:{ebitda:2, reputacion:si(CONTEXTO.juntaDesconfia(s), -5, -3)},
       consecuencia:"Capitalizas el momento con mejor margen, aunque algunos clientes notan el aumento repentino y lo comentan como oportunismo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Denuncia de mano de obra infantil en un proveedor",
    contexto:"Una ONG denuncia públicamente que uno de tus proveedores de confección subcontrata talleres donde se ha detectado mano de obra infantil.",
    investigacion:{costo:2, boton:"Contratar una auditoría social independiente del taller señalado ($2M)",
      reporte:"La auditoría confirma la presencia de menores trabajando en el taller subcontratado, en clara violación de la normativa laboral vigente."},
    choices:[
      {texto:"Cortar de inmediato la relación con ese proveedor y hacerlo público como gesto de compromiso.", efectos:{caja:-3, ebitda:-2, reputacion:8, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -6, -3)},
       consecuencia:"La decisión cuesta producción y proveedores a corto plazo, pero es la única respuesta defendible ante un hallazgo de este tipo."},
      {texto:"Mantener la relación mientras exiges un plan de corrección al proveedor, sin hacerlo público.", efectos:{ebitda:1, reputacion:si(CONTEXTO.juntaDesconfia(s), -10, -6), confianzaProveedores:2},
       consecuencia:"Evitas la disrupción en tu cadena de suministro, pero si la denuncia sigue creciendo, tu silencio se interpreta como complicidad."},
      {texto:"Financiar un programa de escolarización para los menores identificados, manteniendo al proveedor bajo supervisión estricta.", efectos:{caja:-4, reputacion:3, confianzaProveedores:1},
       consecuencia:"Atiendes la causa humana del problema inmediato, aunque mantener al proveedor sigue siendo una decisión que muchos cuestionarían."}
    ],
    choiceInformado:{texto:"Con la auditoría confirmando el hallazgo, cortar la relación de inmediato y reportarlo a las autoridades laborales.", efectos:{caja:-3, ebitda:-2, reputacion:10},
      consecuencia:"Actuar con evidencia confirmada, no solo con la denuncia inicial, es la respuesta más sólida — y la única moralmente defendible ante un caso comprobado."}
  }),
  (s,f)=>({
    tipo:'random', titulo:"Temporada de lluvias atípica arruina la colección de verano",
    contexto:"Una temporada de lluvias mucho más intensa de lo pronosticado golpea justo cuando lanzaste tu colección de verano, y la demanda de esas prendas se desploma.",
    choices:[
      {texto:"Liquidar la colección de verano con descuento agresivo antes de que pierda más valor.", efectos:{caja:si(CONTEXTO.liquidezBaja(s), 5, 3), ebitda:-3, valorInventario:-8, diasInventario:-15},
       consecuencia:"Recuperas liquidez rápido, a costa de vender muy por debajo del margen esperado." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, esa plata llega a tiempo.', '')},
      {texto:"Almacenar la colección para la próxima temporada de verano.", efectos:{capitalTrabajo:-3, diasInventario:si(CONTEXTO.inventarioPesado(s), 15, 8), ebitda:0.5},
       consecuencia:"Evitas liquidar con pérdida y conservas el margen, aunque ese capital queda atrapado en inventario varios meses." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega ya llena, es mucho capital quieto.', '')},
      {texto:"Reconvertir parte de la colección en prendas de entretiempo con ajustes menores de diseño.", efectos:{caja:-2, ebitda:si(CONTEXTO.equipoCansado(s), 0, 1), diasInventario:-8, moralEquipo:-1},
       consecuencia:"Una salida creativa que recupera parte del valor sin liquidar a pérdida ni esperar meses." + si(CONTEXTO.equipoCansado(s), ' Pero el taller, agotado, entrega tarde y la reconversión apenas cubre su costo.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un competidor copia tu diseño y lo vende más barato",
    contexto:"Detectas que un competidor lanzó una prenda casi idéntica a uno de tus diseños más exitosos, vendiéndola a un precio considerablemente menor.",
    choices:[
      {texto:"Iniciar un proceso legal por infracción de diseño industrial, si tienes el registro correspondiente.", efectos:{caja:-3, reputacion:si(CONTEXTO.reputacionAlta(s), 4, 2), ebitda:0.5},
       consecuencia:"El proceso puede tomar meses y no siempre termina a tu favor, pero frena la copia en los canales formales."},
      {texto:"Lanzar rápidamente una variación mejorada del diseño original para diferenciarte.", efectos:{caja:-2, ebitda:si(CONTEXTO.equipoCansado(s), 0, 1), diasInventario:3},
       consecuencia:"Te adelantas con una versión superior antes de que el mercado asocie tu diseño solo con la copia, aunque sumas otra referencia a la bodega." + si(CONTEXTO.equipoCansado(s), ' Con el equipo cansado, la variación sale apurada y no convence.', '')},
      {texto:"Bajar el precio de tu diseño original para competir directamente.", efectos:{ebitda:-1.5, diasInventario:si(CONTEXTO.inventarioPesado(s), -10, -5), caja:1},
       consecuencia:"Defiendes tu participación en esa referencia, a costa de margen." + si(CONTEXTO.inventarioPesado(s), ' Con la bodega llena, al menos la ropa se mueve.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La plataforma de e-commerce sube su comisión drásticamente",
    contexto:"La plataforma de e-commerce donde vendes buena parte de tu producción anuncia un aumento considerable en su comisión por venta, con vigencia inmediata y sin negociación individual.",
    choices:[
      {texto:"Aceptar la nueva comisión y mantener tu operación en la plataforma sin cambios.", efectos:{ebitda:-2, diasInventario:-3},
       consecuencia:"Conservas el volumen de ventas y la rotación que ya tenías, a costa directa de tu margen en cada transacción."},
      {texto:"Subir tus precios en esa plataforma para compensar la comisión adicional.", efectos:{ebitda:1, diasInventario:si(CONTEXTO.inventarioPesado(s), 10, 5), reputacion:si(CONTEXTO.reputacionAlta(s), 0, -1)},
       consecuencia:"Proteges tu margen, aunque tus productos quedan menos competitivos y rotan más lento." + si(CONTEXTO.reputacionAlta(s), ' Tu marca aguanta el precio sin perder clientes fieles.', '')},
      {texto:"Invertir en fortalecer tu tienda propia en línea para reducir la dependencia de la plataforma.", efectos:{caja:-4, ebitda:-0.5, wacc:-0.2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
       consecuencia:"Una apuesta a mediano plazo por tu propio canal: no da resultados inmediatos, pero reduce tu exposición a decisiones de terceros."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La colección de la temporada pasada sigue sin venderse",
    contexto:"La ropa de la colección anterior sigue ocupando espacio en tienda y bodega, mientras la nueva colección ya está lista para exhibirse. Cada semana que esa ropa vieja no se mueve, tus días de inventario suben y el espacio que ocupa podría estar mostrando lo nuevo.",
    choices:[
      {texto:"Liquidar todo con un descuento agresivo de fin de temporada.", efectos:{diasInventario:-14, valorInventario:-3, caja:si(CONTEXTO.liquidezBaja(s), 3, 2), ebitda:-0.5},
       consecuencia:"Recuperas espacio y liquidez de inmediato, aunque vendiste muy por debajo del precio original."},
      {texto:"Donarla a una fundación a cambio del beneficio tributario correspondiente.", efectos:{diasInventario:-14, valorInventario:-3, reputacion:si(CONTEXTO.juntaDesconfia(s), 5, 3)},
       consecuencia:"No recuperas caja directa, pero el beneficio tributario y la reputación ganada compensan buena parte de la pérdida."},
      {texto:"Venderla a granel a un outlet de descuento, sin exhibirla más en tu tienda.", efectos:{diasInventario:-10, valorInventario:-2, caja:1, reputacion:si(CONTEXTO.reputacionAlta(s), -2, 0)},
       consecuencia:"Liberas espacio e inventario sin regalar la mercancía por completo." + si(CONTEXTO.reputacionAlta(s), ' Ver tu marca en un outlet le resta algo de brillo.', '')}
    ]
  })
];
