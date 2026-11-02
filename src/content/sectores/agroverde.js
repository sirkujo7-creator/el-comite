/* =========================================================================================
   SECTOR 3 · AGROVERDE — Exportación café/aguacate (mecánica: TRM a favor + clima)
   Nov. 2026: 3 opciones por caso, todas defendibles; los efectos dependen de cómo esté la
   empresa (content/universal/contexto.js). En AgroVerde pesan la liquidez del ciclo de
   cosecha, el inventario que no rota, la moral de las cuadrillas y la relación con el banco.
   ========================================================================================= */
const AGROVERDE_CASES = [
(s,f)=>({ tipo:'caso', titulo:"El comprador internacional pide precio fijo",
  contexto:"Un importador europeo ofrece comprarte a precio fijo por 12 meses, protegiéndote de la volatilidad, pero por debajo del precio spot actual.",
  investigacion:{costo:2, boton:"Pedir una proyección de precios a un analista de commodities ($2M)",
    reporte:"Los futuros del commodity a 12 meses cotizan un <b>8% por debajo</b> del precio spot actual; el mercado anticipa mayor oferta global."},
  choices:[
    {texto:"Firmar el contrato a precio fijo por toda la cosecha.",
     efectos:si(CONTEXTO.liquidezBaja(s), {caja:4, wacc:-0.5, ebitda:-0.8}, {caja:2, wacc:-0.3, ebitda:-1.3}),
     consecuencia:"Te proteges de la volatilidad, aunque renuncias a cualquier alza del precio spot durante el año." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, esa certeza vale oro.', ' Con caja de sobra, pagaste margen por una protección que no necesitabas tanto.')},
    {texto:"Rechazar y vender en el mercado spot mes a mes.",
     efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:0.6, caja:-2, razonCorriente:-0.08, wacc:0.3}, {ebitda:1.2, wacc:0.2}),
     consecuencia:"Capturas el precio del momento, con toda la volatilidad que eso implica para tu flujo de caja." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez floja, un mes malo te deja corto para pagar la cosecha.', ' Tu caja aguanta los vaivenes y el precio libre te favorece.')},
    {texto:"Firmar solo el 50% de la cosecha a precio fijo y dejar el resto libre.",
     efectos:{caja:1, ebitda:0.4, wacc:0.1, moralEquipo:si(CONTEXTO.equipoCansado(s), -1, 0)},
     consecuencia:"Repartes el riesgo: ni toda la protección si el precio cae, ni toda el alza si sube. Manejar dos esquemas de venta a la vez exige más del equipo comercial."}
  ],
  choiceInformado:{texto:"Con la proyección bajista confirmada, firmar el contrato fijo por el 100% de la cosecha.", efectos:{caja:4, wacc:-0.4, ebitda:0.5, diasCartera:5},
    consecuencia:"Si los futuros anticipan una caída del 8%, asegurar el precio actual completo es la jugada matemáticamente superior. A cambio, aceptas el plazo de pago más largo que exige el comprador."}
}),
(s,f)=>({ tipo:'caso', titulo:"Financiamiento para el ciclo de cosecha",
  contexto:"Necesitas $15.000.000 de capital de trabajo estacional para cubrir la recolección y el procesamiento antes de exportar. El dinero se irá en jornales e insumos: lo que quede en caja será poco.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", plazo:'largo',
     efectos:{caja:7, capitalTrabajo:7, valorInventario:4, deuda:15, ebitda:0.8, wacc:si(CONTEXTO.apalancado(s), 1, 0.5), confianzaBanco:si(CONTEXTO.apalancado(s), -2, 1)},
     consecuencia:"La cosecha queda financiada. Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas." + si(CONTEXTO.apalancado(s), ' Con tanta deuda encima, el banco cobró más y pidió garantías.', '')},
    {texto:"Tramitar crédito agropecuario subsidiado, con tasa preferencial pero más garantías exigidas.", plazo:'largo',
     efectos:si(CONTEXTO.bancoAmigo(s), {caja:6, capitalTrabajo:6, valorInventario:4, deuda:13, ebitda:0.8, wacc:-0.5, confianzaBanco:3}, {caja:4, capitalTrabajo:4, valorInventario:3, deuda:13, ebitda:0.4, wacc:-0.3, confianzaBanco:3}),
     consecuencia:"La tasa es mucho mejor, pero el trámite toma tiempo y las garantías recortan el monto." + si(CONTEXTO.bancoAmigo(s), ' Tu buena relación con el banco acelera el trámite: llega a tiempo para la cosecha.', ' Sin historia con el banco, el desembolso llega tarde y parte de la cosecha se recoge a medias.')},
    {texto:"Ceder 20% de participación a un fondo de inversión agrícola.",
     efectos:{caja:7, capitalTrabajo:7, valorInventario:4, ebitda:0.8, wacc:si(CONTEXTO.juntaDesconfia(s), 1.6, si(CONTEXTO.apalancado(s), 1.3, 1)), reputacion:si(CONTEXTO.juntaDesconfia(s), -3, 0), confianzaBanco:si(CONTEXTO.apalancado(s), 3, 0)},
     consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades futuras de la finca. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que ya dudaba de ti, lo leyó como pérdida de control.', '')}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", plazo:'largo', efectos:{caja:5, capitalTrabajo:5, valorInventario:4, deuda:12, ebitda:0.7, wacc:0.3, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
}),
(s,f)=>({ tipo:'caso', titulo:"El Niño amenaza la cosecha",
  contexto:"El pronóstico climático advierte una sequía prolongada en la zona productora en los próximos meses.",
  choices:[
    {texto:"Invertir en riego tecnificado de emergencia.", capex:true,
     efectos:{caja:-6, ebitda:si(CONTEXTO.liquidezBaja(s), 1, 1.8), diasInventario:-3, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
     consecuencia:"Proteges buena parte de la producción esperada, a un costo de inversión importante hoy." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, la obra se hace a medias y la liquidez se resiente.', '')},
    {texto:"Contratar un seguro paramétrico climático.",
     efectos:{caja:-2, wacc:-0.2, ebitda:-1, confianzaBanco:si(CONTEXTO.bancoAmigo(s), 3, 1)},
     consecuencia:"Pagas una prima para transferir el riesgo a una aseguradora. Si la sequía llega, el seguro paga, pero la cosecha igual sale menor." + si(CONTEXTO.bancoAmigo(s), ' El banco, que ya confiaba en ti, valora que cubras el riesgo.', '')},
    {texto:"Diversificar parte del cultivo hacia una variedad más resistente a la sequía.",
     efectos:{caja:-3, ebitda:-0.8, diasInventario:-2, wacc:-0.1, moralEquipo:si(CONTEXTO.equipoCansado(s), -3, 0)},
     consecuencia:"Es una apuesta de mediano plazo: reduces tu vulnerabilidad futura, aunque el cambio de variedad no rinde beneficio inmediato." + si(CONTEXTO.equipoCansado(s), ' Las cuadrillas, agotadas, cargan con la resiembra.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Cae el precio internacional del commodity", impactoAutomatico:{ebitda:-2},
  contexto:"El precio internacional cae 20% por sobreoferta global. El ingreso proyectado de la próxima exportación se reduce de forma directa.",
  choices:[
    {texto:"Recortar personal de campo.",
     efectos:{ebitda:4, capitalTrabajo:1, confianzaProveedores:-8, reputacion:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -12, -6)},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero golpeas directamente a las familias recolectoras que dependen de la finca — y esa decisión suele volver." + si(CONTEXTO.equipoCansado(s), ' Con las cuadrillas ya cansadas, el recorte enciende el descontento.', '')},
    {texto:"Reducir gastos generales y renegociar insumos agrícolas.",
     efectos:{ebitda:2, capitalTrabajo:1, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -7, -3)},
     consecuencia:"El ajuste es más lento, pero protege el empleo de campo." + si(CONTEXTO.proveedoresTensos(s), ' Tus proveedores ya estaban molestos: la renegociación los aleja.', '')},
    {texto:"Buscar certificación orgánica o de comercio justo para acceder a un precio diferenciado.",
     efectos:{caja:-4, ebitda:si(CONTEXTO.reputacionAlta(s), 1.8, 0.8), diasInventario:-2, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.08, 0)},
     consecuencia:"Una inversión que te saca de competir solo por precio spot, aunque no resuelve del todo la caída de este periodo." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación acorta el camino: los compradores premium ya te conocen.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante. Tu contador sugiere reclasificar gastos de mantenimiento del cultivo como activos para mejorar los indicadores.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.",
     efectos:{caja:si(CONTEXTO.liquidezBaja(s), 6, 4), confianzaBanco:8, wacc:-0.5, reputacion:si(CONTEXTO.juntaDesconfia(s), -8, -4)},
     setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales." + si(CONTEXTO.juntaDesconfia(s), ' La junta, que ya te vigilaba, nota que las cifras no cuadran.', '')},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.",
     efectos:{caja:si(CONTEXTO.bancoAmigo(s), -1, -2), confianzaBanco:si(CONTEXTO.bancoAmigo(s), 8, 6), razonCorriente:0.1, wacc:-0.2, reputacion:4},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable." + si(CONTEXTO.bancoAmigo(s), ' El banco te conoce: recorta poco y valora la franqueza.', '')},
    {texto:"Mejorar los indicadores reales primero, cobrando anticipos pendientes de compradores internacionales.",
     efectos:{caja:3, capitalTrabajo:3, confianzaBanco:3, diasCartera:si(CONTEXTO.carteraLenta(s), -14, -6), ebitda:si(CONTEXTO.liquidezBaja(s), -1.6, -1)},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Mientras tanto, el crecimiento que pensabas financiar queda en pausa." + si(CONTEXTO.carteraLenta(s), ' Tenías mucha cartera atrasada: hay bastante por recoger.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Una certificadora orgánica ofrece subir de nivel tu certificación",
  contexto:"La certificadora que ya te avala te ofrece subir a una certificación orgánica de nivel superior, que abre puertas a mercados premium en Europa — pero exige una inversión en procesos y una auditoría más estricta cada año.",
  investigacion:{costo:1.5, boton:"Pedir un estudio de precios premium en mercados con esa certificación ($1.5M)",
    reporte:"El estudio confirma un sobreprecio real de hasta <b>18%</b> en los mercados que exigen esa certificación superior, aunque el costo de mantenerla cada año no es menor."},
  choices:[
    {texto:"Invertir en la certificación de nivel superior completa.", capex:true,
     efectos:{caja:-5, ebitda:si(CONTEXTO.equipoCansado(s), 0.6, 1.5), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Accedes a mercados premium con mejores precios, asumiendo un costo de proceso y auditoría permanente más alto." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, la auditoría encuentra fallas y el sobreprecio tarda en llegar.', '')},
    {texto:"Certificar solo una porción de la producción bajo el nuevo estándar, como prueba piloto.",
     efectos:{caja:-2, ebitda:0.5, diasInventario:2},
     consecuencia:"Accedes parcialmente al mercado premium sin comprometer toda tu operación, aunque separar los dos lotes alarga el tiempo en bodega."},
    {texto:"Buscar un comprador dispuesto a financiar parte del proceso de certificación a cambio de exclusividad.",
     efectos:{caja:-1, ebitda:1, diasCartera:si(CONTEXTO.liquidezBaja(s), 14, 10), wacc:0.2},
     consecuencia:"Reduces tu inversión propia, a cambio de atarte a un solo comprador durante la transición y aceptar sus plazos de pago." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, esos plazos largos aprietan.', '')}
  ],
  choiceInformado:{texto:"Con el sobreprecio del 18% confirmado, invertir en la certificación superior sin reservas.", efectos:{caja:-4, ebitda:2.5},
    consecuencia:"Un sobreprecio de esa magnitud, sostenido en el tiempo, hace que el costo de la nueva certificación se recupere mucho más rápido de lo que parecía al principio."}
}),
];
function AGROVERDE_COSECHA(s,f){ return {tipo:'calendario', titulo:"Pago a recolectores de la cosecha",
  contexto:"Llega la temporada de corte: toca pagar a las cuadrillas de recolectores, mano de obra intensiva y no negociable en plena cosecha.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9, moralEquipo:si(CONTEXTO.equipoCansado(s), 3, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
     consecuencia:"Cumples en tiempo y forma, asegurando que las cuadrillas vuelvan la próxima temporada." + si(CONTEXTO.liquidezBaja(s), ' Pero con la caja tan justa, el pago deja tu liquidez en rojo.', '')},
    {texto:"Pagar la mayoría y diferir un pequeño saldo 30 días con acuerdo de los recolectores.", efectos:{caja:-6, moralEquipo:si(CONTEXTO.equipoCansado(s), -8, -3)}, diferir:{monto:3.3, turnos:1, motivo:"Saldo diferido a recolectores", tipo:'nomina'},
     consecuencia:"Las cuadrillas aceptan por esta vez, pero dependes de su buena voluntad para la próxima cosecha." + si(CONTEXTO.equipoCansado(s), ' Con el ánimo bajo, algunas cuadrillas se van a la finca vecina.', '')},
    {texto:"Tomar un crédito de cosecha de corto plazo.", efectos:{deuda:5, wacc:si(CONTEXTO.apalancado(s), 0.9, 0.4), caja:-4},
     consecuencia:"Evitas fricción con las cuadrillas, pero sumas una deuda más a tu estructura de capital." + si(CONTEXTO.apalancado(s), ' Ya cargabas mucha deuda: el crédito sale caro.', '')}
  ]};}
function AGROVERDE_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta y aranceles de exportación",
  contexto:"Llega la fecha de declarar renta, junto con los trámites y aranceles asociados al siguiente embarque de exportación.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7, confianzaBanco:4, wacc:-0.1, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
     consecuencia:"Cumples sin generar ninguna obligación adicional. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la DIAN.", efectos:{caja:-2, deuda:5, wacc:si(CONTEXTO.bancoAmigo(s), 0.2, 0.4)},
     consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor en comercio exterior para optimizar la carga arancelaria.", efectos:{caja:-6, ebitda:0.4},
     consecuencia:"Los honorarios cuestan, pero el asesor identifica beneficios arancelarios legítimos del tratado vigente."}
  ]};}
const AGROVERDE_RANDOM = [
  (s,f)=>({tipo:'macro', titulo:"El dólar sube y tus exportaciones valen más en pesos", titular:"El dólar se dispara: ganadores y perdedores en la economía real", impactoAutomatico:{caja:3},
    contexto:"La TRM sube 8%. Como exportas en dólares, cada contenedor que despachas ahora te genera más ingreso en pesos — ya reflejado en tu caja — aunque tus insumos importados (fertilizantes, empaques) también se encarecen.",
    choices:[
      {texto:"Reinvertir el excedente cambiario en el cultivo.", efectos:{ebitda:si(CONTEXTO.equipoCansado(s), 1, 2), caja:-2},
       consecuencia:"Aprovechas el viento a favor para fortalecer la producción futura en vez de solo repartir la ganancia." + si(CONTEXTO.equipoCansado(s), ' Con las cuadrillas cansadas, la inversión rinde menos de lo esperado.', '')},
      {texto:"Cubrirte con un forward para asegurar el nivel actual de TRM en las próximas exportaciones.", efectos:{caja:-2, wacc:si(CONTEXTO.liquidezBaja(s), -0.4, -0.2)}, setFlags:{coberturaCambiaria:true},
       consecuencia:"Pagas hoy por asegurar que el próximo embarque no dependa de hacia dónde se mueva el dólar." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, quitarte ese riesgo vale más.', '')},
      {texto:"Usar el excedente para pagar deuda anticipadamente.", efectos:{caja:-5, deuda:-5, wacc:si(CONTEXTO.apalancado(s), -0.4, 0), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
       consecuencia:"Reduces tu apalancamiento aprovechando un ingreso extraordinario que no estaba presupuestado." + si(CONTEXTO.apalancado(s), ' Estabas muy endeudado: el banco lo nota en tu tasa.', '') + si(CONTEXTO.liquidezBaja(s), ' Eso sí, la caja queda delgada.', '')}
    ]}),
  (s,f)=>MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,"tus ingresos agropecuarios (se elimina una exención histórica del sector)"),
  (s,f)=>({tipo:'random', titulo:"Nuevo arancel en el país destino",
    contexto:"El país que más te compra impone un arancel del 10% a las importaciones agrícolas de tu región, con efecto inmediato.",
    choices:[
      {texto:"Buscar un mercado alterno para redirigir parte de la producción.", efectos:{caja:-2, ebitda:si(CONTEXTO.reputacionAlta(s), 1, 0), diasInventario:4, wacc:-0.1},
       consecuencia:"Diversificas destinos, aunque abrir un mercado nuevo toma tiempo y el producto espera en bodega." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación abre puertas rápido.', '')},
      {texto:"Absorber el arancel para no perder al comprador actual.", efectos:{ebitda:si(CONTEXTO.liquidezBaja(s), -2, -2.5), confianzaProveedores:2},
       consecuencia:"Mantienes la relación comercial intacta, a costa de tu margen en ese embarque."},
      {texto:"Trasladar parte del arancel al precio pactado con el comprador.", efectos:{ebitda:-0.8, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -6, -2), caja:1},
       consecuencia:"Compartes el costo con el comprador, aunque la negociación tensiona la relación comercial." + si(CONTEXTO.proveedoresTensos(s), ' La relación ya estaba frágil: el comprador lo toma mal.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Plaga afecta parte del cultivo",
    contexto:"La broca ataca una porción del cultivo. Sin control inmediato, el daño puede extenderse a la próxima cosecha completa.",
    choices:[
      {texto:"Fumigar de emergencia con control especializado.", efectos:{caja:-5, ebitda:1, reputacion:si(CONTEXTO.reputacionAlta(s), -2, 0), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)},
       consecuencia:"Controlas la plaga a tiempo, con un gasto fitosanitario considerable." + si(CONTEXTO.reputacionAlta(s), ' Algunos compradores premium preguntan por los químicos.', '')},
      {texto:"Aplicar control biológico, más lento pero más barato.", efectos:{caja:-2, diasInventario:2, ebitda:si(CONTEXTO.equipoCansado(s), -1.5, -0.5)},
       consecuencia:"El costo es menor, aunque el control tarda y parte del daño ya está hecho." + si(CONTEXTO.equipoCansado(s), ' Con las cuadrillas cansadas, el control se aplica mal y el daño crece.', '')},
      {texto:"Contratar una asesoría agronómica externa para un diagnóstico y plan de choque.", efectos:{caja:-3, ebitda:-0.5, wacc:-0.1},
       consecuencia:"El diagnóstico profesional cuesta y tarda, pero evita que actúes a ciegas sobre un problema que puede repetirse."}
    ]}),
  (s,f)=>({
    tipo:'random', titulo:"Una plaga nueva amenaza la cosecha actual",
    contexto:"El equipo de campo detecta una plaga poco común avanzando en uno de tus cultivos, con potencial de afectar una porción importante de la cosecha si no se actúa pronto.",
    choices:[
      {texto:"Aplicar de inmediato un control fitosanitario de amplio espectro.", efectos:{caja:-4, ebitda:1, reputacion:si(CONTEXTO.reputacionAlta(s), -3, -1)},
       consecuencia:"Detienes el avance de la plaga rápido, aunque el producto de amplio espectro también afecta insectos benéficos y los compradores orgánicos lo notan."},
      {texto:"Usar control biológico dirigido, más lento pero compatible con tu certificación orgánica.", efectos:{caja:-3, diasInventario:2, ebitda:-0.5, reputacion:si(CONTEXTO.reputacionAlta(s), 2, 1)},
       consecuencia:"Proteges tu certificación y el ecosistema del cultivo, a cambio de una respuesta más lenta ante la plaga."},
      {texto:"Sacrificar la zona afectada para proteger el resto del cultivo sin tratamiento químico.", efectos:{ebitda:si(CONTEXTO.liquidezBaja(s), -2, -3), valorInventario:-2, wacc:-0.1},
       consecuencia:"Pierdes esa porción de cosecha, pero cortas el riesgo de raíz sin gastar en tratamientos." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, no gastar fue un alivio.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Paro portuario retrasa el barco de exportación",
    contexto:"Un paro de trabajadores portuarios retrasa por tiempo indefinido la salida de tu contenedor de exportación, con producto perecedero a bordo.",
    choices:[
      {texto:"Pagar almacenamiento refrigerado de emergencia en el puerto mientras se resuelve el paro.", efectos:{caja:-4, diasInventario:5, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0), confianzaProveedores:2},
       consecuencia:"Proteges la calidad del producto mientras esperas, a un costo logístico no presupuestado. El comprador agradece que el lote llegue intacto."},
      {texto:"Redirigir el envío a un puerto alterno, aunque implique costos logísticos extra.", efectos:{caja:-5, ebitda:-1, reputacion:si(CONTEXTO.reputacionAlta(s), 4, 2)},
       consecuencia:"Consigues sacar el producto a tiempo, a un costo logístico mayor. Tu comprador toma nota de que cumpliste pese al paro."},
      {texto:"Vender el lote afectado a un comprador local a precio reducido antes de que se dañe.", efectos:{caja:3, ebitda:-2.5, reputacion:-2, diasInventario:-5},
       consecuencia:"Recuperas algo de valor rápido, por debajo del precio de exportación pactado. Y quedas mal con el comprador internacional que esperaba ese lote."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El comprador internacional exige una certificación orgánica adicional",
    contexto:"Tu comprador internacional más importante exige, de un momento a otro, una certificación orgánica adicional específica de su país de destino, o cancela el contrato vigente.",
    choices:[
      {texto:"Iniciar el proceso de certificación adicional de inmediato, aunque sea costoso.", efectos:{caja:-6, diasCartera:-10, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"Proteges la relación con tu comprador más importante, a cambio de una inversión considerable." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, el gasto te deja sin colchón.', '')},
      {texto:"Negociar un plazo de transición mientras obtienes la certificación.", efectos:{diasCartera:si(CONTEXTO.reputacionAlta(s), 5, 15), reputacion:-1, caja:-1},
       consecuencia:"Ganas tiempo sin el gasto completo de una vez, aunque la relación queda en zona de incertidumbre." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación pesa: el comprador sigue pagando casi a tiempo.', ' El comprador te castiga alargando los pagos.')},
      {texto:"Buscar un comprador alternativo que no exija esa certificación específica.", efectos:{ebitda:-2, diasCartera:10, wacc:-0.1},
       consecuencia:"Evitas el gasto de la certificación y dejas de depender de un solo comprador, aunque el nuevo paga menos y más tarde."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una sequía atípica reduce el rendimiento esperado",
    contexto:"Una sequía más severa de lo habitual para la temporada reduce el rendimiento esperado de tu próxima cosecha en un porcentaje considerable.",
    choices:[
      {texto:"Invertir en riego tecnificado de emergencia para mitigar el impacto.", efectos:{caja:-6, ebitda:si(CONTEXTO.liquidezBaja(s), 1, 1.8), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)},
       consecuencia:"La inversión reduce el daño de esta temporada y queda como infraestructura útil para las siguientes."},
      {texto:"Activar el seguro agrícola que tengas vigente y aceptar parte de la pérdida.", efectos:{caja:1, ebitda:-2, wacc:-0.1, confianzaBanco:si(CONTEXTO.bancoAmigo(s), 2, 0)},
       consecuencia:"El seguro cubre una parte de la pérdida, no toda: la cosecha sale menor, pero la caja no se descuadra."},
      {texto:"Redistribuir el agua disponible priorizando los cultivos de mayor margen.", efectos:{ebitda:-1, capitalTrabajo:1, valorInventario:-2, moralEquipo:si(CONTEXTO.equipoCansado(s), -3, -1)},
       consecuencia:"Proteges lo más rentable a costa de sacrificar el resto, y las cuadrillas trabajan más para mover el agua."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Nuevo arancel de importación en el país destino",
    contexto:"El país al que exportas tu producto principal aprueba un nuevo arancel de importación que encarece tu producto frente a competidores de otros orígenes.",
    choices:[
      {texto:"Absorber el arancel manteniendo tu precio de exportación actual.", efectos:{ebitda:-3, confianzaProveedores:3},
       consecuencia:"Mantienes tu posición competitiva y tu comprador lo agradece, a costa directa de tu margen."},
      {texto:"Trasladar el arancel completo al precio final para tu comprador.", efectos:{ebitda:1, diasCartera:si(CONTEXTO.reputacionAlta(s), 4, 10), diasInventario:si(CONTEXTO.reputacionAlta(s), 0, 6)},
       consecuencia:"Proteges tu margen, aunque tu producto ahora es menos competitivo frente a otros orígenes." + si(CONTEXTO.reputacionAlta(s), ' Tu marca aguanta el precio.', ' Sin una marca fuerte, el producto se queda más tiempo en bodega.')},
      {texto:"Explorar un esquema de comercio justo o denominación de origen que reduzca el impacto arancelario.", efectos:{caja:-2, reputacion:3, ebitda:-1},
       consecuencia:"Mitigas parte del arancel y sumas valor a tu marca, aunque el trámite toma tiempo y no cubre todo."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una porción de tu inventario lleva meses sin rotar",
    contexto:"Una revisión interna de bodega revela que parte de tu inventario lleva varios meses sin moverse — cada día que pasa sin rotar, tus días de inventario suben y ese capital sigue atrapado sin generar nada.",
    choices:[
      {texto:"Liquidar todo ese inventario estancado con un descuento agresivo.", efectos:{diasInventario:-15, valorInventario:-3, caja:si(CONTEXTO.liquidezBaja(s), 4, 2), ebitda:-0.5},
       consecuencia:"Recuperas liquidez y mejoras tu rotación de golpe, aunque vendiste por debajo de lo que ese inventario valía." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, esa plata llega cuando más la necesitas.', '')},
      {texto:"Hacer una liquidación parcial y moderada, no agresiva.", efectos:{diasInventario:si(CONTEXTO.inventarioPesado(s), -5, -8), valorInventario:-1, caja:1},
       consecuencia:"Un punto medio que mejora algo tu rotación sin regalar el inventario completo." + si(CONTEXTO.inventarioPesado(s), ' Pero la bodega estaba tan llena que apenas se nota.', '')},
      {texto:"Donarlo a cambio del beneficio tributario correspondiente.", efectos:{diasInventario:-15, valorInventario:-3, reputacion:si(CONTEXTO.juntaDesconfia(s), 5, 3)},
       consecuencia:"No recuperas caja directa, pero el beneficio tributario y el gesto público compensan parte de la pérdida."}
    ]
  }),
  (s,f)=>({tipo:'random', titulo:"La bodega de café pergamino está llena antes de la cosecha principal",
    contexto:"Todavía tienes café de la traviesa almacenado y la cosecha principal empieza en tres semanas. No hay espacio para lo que viene.",
    choices:[
      {texto:"Vender ya el café almacenado al precio actual de la bolsa.", efectos:{diasInventario:-15, valorInventario:-5, caja:5, ebitda:-0.5},
       consecuencia:"Liberas la bodega y entra caja, aunque vendes en un momento en que el precio no está en su mejor punto."},
      {texto:"Alquilar una bodega adicional y esperar un mejor precio.", efectos:{caja:-2, diasInventario:10, valorInventario:3, ebitda:si(CONTEXTO.liquidezBaja(s), 0.3, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.08, 0)},
       consecuencia:"Si el precio sube, la espera valdrá la pena; mientras tanto, pagas arriendo y el café acumula días en inventario." + si(CONTEXTO.liquidezBaja(s), ' Sin caja para esperar, terminas vendiendo antes de tiempo.', '')},
      {texto:"Tostar parte del grano y venderlo como café de marca propia.", efectos:{caja:-3, valorInventario:4, diasInventario:5, ebitda:si(CONTEXTO.reputacionAlta(s), 2, 1), moralEquipo:si(CONTEXTO.equipoCansado(s), -2, 0)},
       consecuencia:"El café tostado vale más que el pergamino, aunque montar la línea de tostión cuesta y la marca se construye despacio." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación ayuda: la marca propia se vende rápido.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Una helada daña parte del aguacate almacenado",
    contexto:"Una helada atípica afectó la piel de parte del aguacate que tenías listo para exportar. La fruta sirve, pero ya no cumple el estándar del comprador internacional.",
    choices:[
      {texto:"Venderlo de inmediato en el mercado nacional como fruta de segunda.", efectos:{caja:si(CONTEXTO.liquidezBaja(s), 3, 2), valorInventario:-4, diasInventario:-6, ebitda:-1.5},
       consecuencia:"Recuperas algo de caja rápido, muy por debajo del precio de exportación."},
      {texto:"Procesarlo en aceite de aguacate con una planta aliada.", efectos:{caja:-2, valorInventario:-1, diasInventario:-4, ebitda:0.5, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), -3, 1)},
       consecuencia:"El procesamiento cuesta, pero el aceite conserva buena parte del valor de la fruta." + si(CONTEXTO.proveedoresTensos(s), ' La planta aliada, con la relación tensa, te cobra caro.', '')},
      {texto:"Reclamar al seguro agrícola y esperar el peritaje.", efectos:{caja:2.5, valorInventario:-5, diasInventario:6, confianzaBanco:si(CONTEXTO.bancoAmigo(s), 2, 0)},
       consecuencia:"El seguro paga una parte de la pérdida, pero mientras llega el perito la fruta sigue deteriorándose en bodega."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"El comprador del exterior pide pagarte a 90 días",
    contexto:"Tu comprador principal en el exterior quiere renovar el contrato de café, pero ahora pide pagar a 90 días en lugar de 30.",
    choices:[
      {texto:"Aceptar los 90 días para asegurar el contrato.", efectos:{diasCartera:30, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.25, -0.1), ebitda:1.5, caja:si(CONTEXTO.liquidezBaja(s), -2, 0)},
       consecuencia:"Aseguras el volumen y el precio, aunque ahora financias tres meses de la operación de tu comprador." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez ya floja, quedas contra las cuerdas.', '')},
      {texto:"Aceptar, pero descontar las facturas con un banco (factoring de exportación).", efectos:{diasCartera:5, caja:1, ebitda:si(CONTEXTO.bancoAmigo(s), 0.7, 0.2), wacc:0.1},
       consecuencia:"Recibes el dinero casi de inmediato, aunque el banco se queda con una parte por adelantártelo." + si(CONTEXTO.bancoAmigo(s), ' Tu banco te cobra una comisión baja.', '')},
      {texto:"Exigir una carta de crédito irrevocable a 30 días.", efectos:{diasCartera:-5, ebitda:si(CONTEXTO.reputacionAlta(s), -0.3, -1), wacc:-0.1},
       consecuencia:"El comprador acepta la carta de crédito, pero pide un descuento por asumir el costo bancario." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación te ahorra casi todo el descuento.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Tu lote premium podría certificarse como café especial",
    contexto:"Una catación confirmó que tu mejor lote puede certificarse como café especial, con un sobreprecio importante. La certificación cuesta y toma varias semanas.",
    choices:[
      {texto:"Certificar el lote completo como café especial.", efectos:{caja:-3, valorInventario:5, diasInventario:8, ebitda:si(CONTEXTO.liquidezBaja(s), 0.5, 1.2)},
       consecuencia:"El café vale más, aunque pasa más tiempo en bodega mientras se completa la certificación." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, la espera te obliga a malvender otra parte.', '')},
      {texto:"Vender todo ya como café estándar.", efectos:{caja:3, valorInventario:-4, diasInventario:-10, ebitda:-0.5},
       consecuencia:"Entra caja de inmediato, aunque dejas sobre la mesa el sobreprecio del café especial."},
      {texto:"Asociarte con una tostadora que pague la certificación a cambio de la exclusividad del lote.", efectos:{valorInventario:3, diasInventario:5, ebitda:0.5, wacc:0.2, confianzaProveedores:si(CONTEXTO.proveedoresTensos(s), 3, 1)},
       consecuencia:"No pones dinero para la certificación, pero quedas atado a un solo comprador para tu mejor café."}
    ]})
];
