/* =========================================================================================
   SECTOR 3 · AGROVERDE — Exportación café/aguacate (mecánica: TRM a favor + clima)
   ========================================================================================= */
const AGROVERDE_CASES = [
{ tipo:'caso', titulo:"El comprador internacional pide precio fijo",
  contexto:"Un importador europeo ofrece comprarte a precio fijo por 12 meses, protegiéndote de la volatilidad, pero por debajo del precio spot actual.",
  investigacion:{costo:2, boton:"Pedir una proyección de precios a un analista de commodities ($2M)",
    reporte:"Los futuros del commodity a 12 meses cotizan un <b>8% por debajo</b> del precio spot actual; el mercado anticipa mayor oferta global."},
  choices:[
    {texto:"Firmar el contrato a precio fijo por toda la cosecha.", efectos:{caja:3, wacc:-0.3, ebitda:-1}, consecuencia:"Te proteges de la volatilidad, aunque renuncias a cualquier alza del precio spot durante el año."},
    {texto:"Rechazar y vender en el mercado spot mes a mes.", efectos:{ebitda:1, wacc:0.2}, consecuencia:"Capturas el precio del momento, con toda la volatilidad que eso implica para tu flujo de caja."},
    {texto:"Firmar solo el 50% de la cosecha a precio fijo y dejar el resto libre.", efectos:{caja:1, ebitda:0.5, wacc:0.1}, consecuencia:"Reduces el riesgo sin comprometer toda tu producción a un solo precio. Eso sí, la mitad libre sigue expuesta a la volatilidad del precio."},
    {texto:"Buscar un segundo comprador para negociar mejores condiciones antes de decidir.", efectos:{caja:-1, ebitda:0.5}, consecuencia:"Ganas poder de negociación, aunque el proceso comercial adicional consume tiempo y algo de caja."}
  ],
  choiceInformado:{texto:"Con la proyección bajista confirmada, firmar el contrato fijo por el 100% de la cosecha.", efectos:{caja:4, wacc:-0.4, ebitda:0.5, diasCartera:5},
    consecuencia:"Si los futuros anticipan una caída del 8%, asegurar el precio actual completo es la jugada matemáticamente superior. A cambio, aceptas el plazo de pago más largo que exige el comprador."}
},
{ tipo:'caso', titulo:"Financiamiento para el ciclo de cosecha",
  contexto:"Necesitas $15.000.000 de capital de trabajo estacional para cubrir la recolección y el procesamiento antes de exportar.",
  investigacion:{costo:1, boton:"Pedir al banco una simulación de escenarios de tasa ($1M)",
    reporte:"Los analistas proyectan la tasa de intervención en un rango de <b>9.5% – 10.5%</b> para el cierre del semestre, frente al <b>8.75%</b> actual."},
  choices:[
    {texto:"Tomar crédito bancario a tasa fija por $15M.", efectos:{caja:15, deuda:15, wacc:0.5, capitalTrabajo:15}, consecuencia:"Tu apalancamiento sube, pero la cuota no cambiará así suban las tasas del mercado."},
    {texto:"Tomar crédito bancario a tasa variable por $15M, más barata hoy.", efectos:{caja:15, deuda:15, wacc:-0.3, capitalTrabajo:15}, setFlags:{deudaVariable:true},
     consecuencia:"Consigues una tasa inicial más baja, pero tu costo de capital queda atado a lo que haga el Banco de la República."},
    {texto:"Ceder 20% de participación a un fondo de inversión agrícola.", efectos:{caja:15, capitalTrabajo:15, wacc:1}, consecuencia:"No agregas deuda, pero cediste una porción real de las utilidades futuras de la finca. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube."},
    {texto:"Tramitar una línea de crédito agropecuario subsidiado, con tasa preferencial pero más garantías exigidas.", efectos:{caja:13, deuda:13, wacc:-0.6, capitalTrabajo:13, confianzaBanco:3},
     consecuencia:"La tasa es mucho mejor, pero el trámite tomó tiempo y quedaste con menos del monto que esperabas por las garantías exigidas."}
  ],
  choiceInformado:{texto:"Tomar solo $12M a tasa fija, exponiendo menos capital del que el banco ofrece.", efectos:{caja:12, deuda:12, wacc:0.3, capitalTrabajo:12, confianzaBanco:5},
    consecuencia:"Con el rango proyectado en mano, decides que un punto porcentual de subida es un riesgo real y te blindas parcialmente frente a él."}
},
{ tipo:'caso', titulo:"El Niño amenaza la cosecha",
  contexto:"El pronóstico climático advierte una sequía prolongada en la zona productora en los próximos meses.",
  choices:[
    {texto:"Invertir en riego tecnificado de emergencia.", efectos:{caja:-6, ebitda:2, diasInventario:-3}, capex:true, consecuencia:"Proteges buena parte de la producción esperada, a un costo de inversión importante hoy."},
    {texto:"Contratar un seguro paramétrico climático.", efectos:{caja:-2, wacc:-0.1}, consecuencia:"Pagas una prima moderada para transferir el riesgo climático a una aseguradora en vez de asumirlo tú solo."},
    {texto:"No hacer nada y asumir el riesgo de una cosecha menor.", efectos:{ebitda:-3}, consecuencia:"Ahorras la inversión de hoy, pero si la sequía se confirma, el golpe a tu producción será mayor y sin ningún colchón."},
    {texto:"Diversificar parte del cultivo hacia una variedad más resistente a la sequía.", efectos:{caja:-3, ebitda:-1, diasInventario:-2}, consecuencia:"Es una apuesta de mediano plazo: reduces tu vulnerabilidad futura, aunque el cambio de variedad no rinde beneficio inmediato."}
  ]
},
{ tipo:'caso', titulo:"Cae el precio internacional del commodity",
  contexto:"El precio internacional cae 20% por sobreoferta global. El ingreso proyectado de la próxima exportación se reduce de forma directa.",
  choices:[
    {texto:"Recortar personal de campo.", efectos:{ebitda:4, capitalTrabajo:1, confianzaProveedores:-8, reputacion:-6},
     setFlags:{recorteFuerte:true}, disparar:{turnos:3, evento:eventoHuelgaSindical},
     consecuencia:"Tu punto de equilibrio baja rápido, pero golpeas directamente a las familias recolectoras que dependen de la finca — y esa decisión suele volver."},
    {texto:"Reducir gastos generales y renegociar insumos agrícolas.", efectos:{ebitda:2, capitalTrabajo:1, confianzaProveedores:-3}, consecuencia:"El ajuste es más lento, pero protege el empleo de campo."},
    {texto:"Tomar un crédito puente para sostener la operación.", efectos:{caja:6, deuda:8, wacc:0.5, capitalTrabajo:4}, consecuencia:"Ganas tiempo sin recortar nada, pero sumas deuda justo cuando tu ingreso por exportación es más bajo."},
    {texto:"Buscar certificación orgánica o de comercio justo para acceder a un precio diferenciado.", efectos:{caja:-4, ebitda:1, diasInventario:-2}, consecuencia:"Es una inversión de mediano plazo que te saca de competir solo por precio spot, aunque no resuelve la caída de este periodo."}
  ]
},
{ tipo:'caso', titulo:"La sugerencia del contador",
  contexto:"Necesitas calificar a un crédito importante. Tu contador sugiere reclasificar gastos de mantenimiento del cultivo como activos para mejorar los indicadores.",
  choices:[
    {texto:"Aceptar el ajuste contable para asegurar el crédito.", efectos:{caja:5, confianzaBanco:15, wacc:-1, reputacion:-4}, setFlags:{contabilidadMaquillada:true}, disparar:{turnos:4, evento:eventoAuditoriaExterna},
     consecuencia:"El banco aprueba el crédito con mejores condiciones de las que merecías con tus cifras reales."},
    {texto:"Rechazarlo y presentar los estados financieros reales, ajustando la solicitud.", efectos:{caja:-3, confianzaBanco:5, razonCorriente:0.05, reputacion:5},
     consecuencia:"El monto aprobado es menor, pero tu información financiera sigue siendo confiable."},
    {texto:"Mejorar los indicadores reales primero, cobrando anticipos pendientes de compradores internacionales.", efectos:{caja:2, capitalTrabajo:3, confianzaBanco:3, diasCartera:-8, ebitda:-1},
     consecuencia:"Toma más tiempo, pero mejoras tu capacidad de pago real, no solo en el papel. Mientras tanto, el crecimiento que pensabas financiar con el crédito queda en pausa."},
    {texto:"Buscar financiamiento con un fondo de inversión de impacto agrícola, sin tocar la contabilidad.", efectos:{caja:4, wacc:0.8, deuda:4},
     consecuencia:"Consigues capital sin mentir en tus estados financieros, a un costo algo mayor que el crédito bancario tradicional."}
  ]
},
{ tipo:'caso', titulo:"Una certificadora orgánica ofrece un upgrade de certificación",
  contexto:"La certificadora que ya te avala te ofrece subir a una certificación orgánica de nivel superior, que abre puertas a mercados premium en Europa — pero exige una inversión en procesos y una auditoría más estricta cada año.",
  investigacion:{costo:1.5, boton:"Pedir un estudio de precios premium en mercados con esa certificación ($1.5M)",
    reporte:"El estudio confirma un sobreprecio real de hasta <b>18%</b> en los mercados que exigen esa certificación superior, aunque el costo de mantenerla cada año no es menor."},
  choices:[
    {texto:"Invertir en el upgrade completo de certificación.", efectos:{caja:-5, ebitda:1.5}, capex:true, consecuencia:"Accedes a mercados premium con mejores precios, asumiendo un costo de proceso y auditoría permanente más alto."},
    {texto:"Mantener la certificación actual, sin subir de nivel por ahora.", efectos:{ebitda:-0.3}, consecuencia:"Evitas la inversión y el compromiso adicional, aunque renuncias al sobreprecio de los mercados más exigentes mientras la competencia sí avanza hacia allá."},
    {texto:"Certificar solo una porción de la producción bajo el nuevo estándar, como prueba piloto.", efectos:{caja:-2, ebitda:0.5}, consecuencia:"Accedes parcialmente al mercado premium, sin comprometer toda tu operación al nuevo estándar de una vez."},
    {texto:"Buscar un comprador dispuesto a financiar parte del proceso de certificación a cambio de exclusividad.", efectos:{caja:-1, ebitda:1, diasCartera:10}, consecuencia:"Reduces tu inversión propia, a cambio de atarte comercialmente a un solo comprador durante la transición. Ese comprador, además, te impone sus plazos de pago."}
  ],
  choiceInformado:{texto:"Con el sobreprecio del 18% confirmado, invertir en el upgrade completo sin reservas.", efectos:{caja:-4, ebitda:2.5},
    consecuencia:"Un sobreprecio de esa magnitud, sostenido en el tiempo, hace que el costo del upgrade se recupere mucho más rápido de lo que parecía al principio."}
},
];
function AGROVERDE_COSECHA(s,f){ return {tipo:'calendario', titulo:"Pago a recolectores de la cosecha",
  contexto:"Llega la temporada de corte: toca pagar a las cuadrillas de recolectores, mano de obra intensiva y no negociable en plena cosecha.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:{caja:-9}, consecuencia:"Cumples en tiempo y forma, asegurando que las cuadrillas vuelvan la próxima temporada."},
    {texto:"Pagar la mayoría y diferir un pequeño saldo 30 días con acuerdo de los recolectores.", efectos:{caja:-6}, diferir:{monto:3.3, turnos:1, motivo:"Saldo diferido a recolectores", tipo:'nomina'},
     consecuencia:"Las cuadrillas aceptan por esta vez, pero dependes de su buena voluntad para la próxima cosecha si se repite."},
    {texto:"Tomar un crédito de cosecha de corto plazo.", efectos:{deuda:5, wacc:0.5, caja:-4}, consecuencia:"Evitas fricción con las cuadrillas, pero sumas una deuda más a tu estructura de capital."},
    {texto:"Usar el anticipo ya cobrado del comprador internacional para cubrir el pago.", efectos:{capitalTrabajo:-6, caja:-3}, consecuencia:"Cumples sin pedir deuda nueva, aunque comprometes un recurso que ya tenías destinado a otra etapa del ciclo."}
  ]};}
function AGROVERDE_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta y aranceles de exportación",
  contexto:"Llega la fecha de declarar renta, junto con los trámites y aranceles asociados al siguiente embarque de exportación.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:{caja:-7, confianzaBanco:2}, consecuencia:"Cumples sin generar ninguna obligación adicional. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la DIAN.", efectos:{caja:-2, deuda:5, wacc:0.4}, consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor en comercio exterior para optimizar la carga arancelaria.", efectos:{caja:-5, ebitda:0.5}, consecuencia:"Sus honorarios tienen costo, pero identifica beneficios arancelarios legítimos del tratado vigente."},
    {texto:"Usar parte de la reserva de contingencia para cubrir el pago.", efectos:{caja:-4, razonCorriente:-0.12}, consecuencia:"Cumples sin vaciar la caja operativa, pero sacrificas el colchón construido para otro tipo de imprevistos y tu liquidez de corto plazo se resiente."}
  ]};}
const AGROVERDE_RANDOM = [
  (s,f)=>({tipo:'macro', titulo:"El dólar sube y tus exportaciones valen más en pesos", titular:"El Dólar se Dispara: Ganadores y Perdedores en la Economía Real", impactoAutomatico:{caja:3},
    contexto:"La TRM sube 8%. Como exportas en dólares, cada contenedor que despachas ahora te genera más ingreso en pesos — ya reflejado en tu caja — aunque tus insumos importados (fertilizantes, empaques) también se encarecen.",
    choices:[
      {texto:"Reinvertir el excedente cambiario en el cultivo.", efectos:{ebitda:2, caja:-2}, consecuencia:"Aprovechas el viento a favor para fortalecer la producción futura en vez de solo repartir la ganancia."},
      {texto:"Repartir el excedente como utilidad extraordinaria a los socios.", efectos:{caja:-4, reputacion:8}, consecuencia:"Los socios reciben un beneficio inmediato del buen momento cambiario, y tu reputación ante ellos sube — aunque no queda reinvertido en la operación."},
      {texto:"Cubrirte con un forward para asegurar el nivel actual de TRM en las próximas exportaciones.", efectos:{caja:-2, wacc:-0.2}, setFlags:{coberturaCambiaria:true}, consecuencia:"Pagas hoy por asegurar que el próximo embarque no dependa de hacia dónde se mueva el dólar."},
      {texto:"Usar el excedente para pagar deuda anticipadamente.", efectos:{caja:-5, deuda:-5}, consecuencia:"Reduces tu apalancamiento aprovechando un ingreso extraordinario que no estaba presupuestado."}
    ]}),
  (s,f)=>MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,"tus ingresos agropecuarios (se elimina una exención histórica del sector)"),
  (s,f)=>({tipo:'random', titulo:"Nuevo arancel en el país destino",
    contexto:"El país que más te compra impone un arancel del 10% a las importaciones agrícolas de tu región, con efecto inmediato.",
    choices:[
      {texto:"Buscar un mercado alterno para redirigir parte de la producción.", efectos:{caja:-2, ebitda:0.5}, consecuencia:"Diversificas destinos de exportación, aunque abrir un mercado nuevo toma tiempo y esfuerzo comercial."},
      {texto:"Absorber el arancel para no perder al comprador actual.", efectos:{ebitda:-3}, consecuencia:"Mantienes la relación comercial intacta, a costa de tu margen en ese embarque."},
      {texto:"Certificarte bajo el tratado de libre comercio vigente para acceder a exención parcial.", efectos:{caja:-3, ebitda:1}, consecuencia:"La certificación cuesta y toma tiempo, pero reduce el arancel de forma permanente para futuros embarques."},
      {texto:"Trasladar parte del arancel al precio pactado con el comprador.", efectos:{ebitda:-1, confianzaProveedores:-2}, consecuencia:"Compartes el costo con el comprador, aunque la negociación tensiona la relación comercial."}
    ]}),
  (s,f)=>({tipo:'random', titulo:"Plaga afecta parte del cultivo",
    contexto:"La broca ataca una porción del cultivo. Sin control inmediato, el daño puede extenderse a la próxima cosecha completa.",
    choices:[
      {texto:"Fumigar de emergencia con control especializado.", efectos:{caja:-5, ebitda:1}, consecuencia:"Controlas la plaga a tiempo, con un gasto fitosanitario considerable pero necesario."},
      {texto:"Aplicar control biológico, más lento pero más barato.", efectos:{caja:-2, diasInventario:2}, consecuencia:"El costo es menor, aunque el control tarda más en hacer efecto y parte del daño ya está hecho."},
      {texto:"No intervenir y aceptar la pérdida parcial de esta cosecha.", efectos:{ebitda:-4}, consecuencia:"Ahorras el gasto de control, pero el daño se extiende más de lo que hubiera costado atajarlo a tiempo."},
      {texto:"Contratar una asesoría agronómica externa para un diagnóstico y plan de choque.", efectos:{caja:-3, ebitda:-1}, consecuencia:"El diagnóstico profesional cuesta, pero evita que actúes a ciegas sobre un problema que puede repetirse."}
    ]}),

  (s,f)=>({
    tipo:'random', titulo:"Una plaga nueva amenaza la cosecha actual",
    contexto:"El equipo de campo detecta una plaga poco común avanzando en uno de tus cultivos, con potencial de afectar una porción importante de la cosecha si no se actúa pronto.",
    choices:[
      {texto:"Aplicar de inmediato un control fitosanitario de amplio espectro.", efectos:{caja:-4, ebitda:1},
       consecuencia:"Detienes el avance de la plaga rápido, aunque el producto de amplio espectro también afecta algunos insectos benéficos del cultivo."},
      {texto:"Usar control biológico dirigido, más lento pero compatible con tu certificación orgánica.", efectos:{caja:-3, diasInventario:2},
       consecuencia:"Proteges tu certificación y el ecosistema del cultivo, a cambio de una respuesta más lenta ante la plaga."},
      {texto:"Sacrificar la zona afectada para proteger el resto del cultivo sin tratamiento químico.", efectos:{ebitda:-5},
       consecuencia:"Pierdes esa porción de cosecha por completo, pero evitas cualquier riesgo de que la plaga o el tratamiento afecten al resto."},
      {texto:"Esperar a ver si la plaga se controla sola antes de invertir en tratamiento.", efectos:{ebitda:-3, valorInventario:-2},
       consecuencia:"A veces la naturaleza se encarga sola. Esta vez, la plaga avanza más de lo que hubieras querido antes de decidir actuar."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Paro portuario retrasa el barco de exportación",
    contexto:"Un paro de trabajadores portuarios retrasa por tiempo indefinido la salida de tu contenedor de exportación, con producto perecedero a bordo.",
    choices:[
      {texto:"Pagar una tarifa de almacenamiento refrigerado de emergencia en el puerto mientras se resuelve el paro.", efectos:{caja:-4, diasInventario:5},
       consecuencia:"Proteges la calidad del producto mientras esperas, a un costo logístico adicional no presupuestado. Mientras tanto, el lote sigue sin venderse."},
      {texto:"Redirigir el envío a un puerto alterno, aunque implique costos logísticos extra.", efectos:{caja:-5, ebitda:-1, reputacion:2},
       consecuencia:"Consigues sacar el producto a tiempo, a un costo logístico considerablemente mayor al plan original. Tu comprador internacional toma nota de que cumpliste pese al paro."},
      {texto:"Esperar sin costo adicional a que el paro se resuelva por sí solo.", efectos:{ebitda:-4, diasCartera:10},
       consecuencia:"Ahorras el gasto logístico extra, pero una parte del producto perecedero no sobrevive la espera en las condiciones del puerto."},
      {texto:"Vender el lote afectado a un comprador local a precio reducido antes de que se dañe.", efectos:{caja:3, ebitda:-3, reputacion:-2},
       consecuencia:"Recuperas algo de valor rápidamente, muy por debajo del precio de exportación que tenías pactado originalmente. Y quedas mal con el comprador internacional que esperaba ese lote."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El comprador internacional exige una certificación orgánica adicional",
    contexto:"Tu comprador internacional más importante exige, de un momento a otro, una certificación orgánica adicional específica de su país de destino, o cancela el contrato vigente.",
    choices:[
      {texto:"Iniciar el proceso de certificación adicional de inmediato, aunque sea costoso.", efectos:{caja:-6, diasCartera:-10},
       consecuencia:"Proteges la relación con tu comprador más importante, a cambio de una inversión considerable en un proceso que toma tiempo."},
      {texto:"Negociar un plazo de transición mientras obtienes la certificación.", efectos:{diasCartera:15, reputacion:-1},
       consecuencia:"Ganas tiempo sin gastar de inmediato, aunque la relación queda en una zona de incertidumbre mientras se resuelve."},
      {texto:"Buscar un comprador alternativo que no exija esa certificación específica.", efectos:{ebitda:-2, diasCartera:20},
       consecuencia:"Evitas el gasto de la certificación, a cambio de negociar de cero con un comprador nuevo, probablemente en condiciones menos favorables."},
      {texto:"Rechazar la exigencia y mantener tu oferta actual sin cambios.", efectos:{ebitda:-6},
       consecuencia:"El comprador cumple su amenaza y cancela el contrato, dejándote con el volumen que le tenías destinado sin comprador inmediato."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una sequía atípica reduce el rendimiento esperado",
    contexto:"Una sequía más severa de lo habitual para la temporada reduce el rendimiento esperado de tu próxima cosecha en un porcentaje considerable.",
    choices:[
      {texto:"Invertir en riego tecnificado de emergencia para mitigar el impacto en lo que queda de temporada.", efectos:{caja:-6, ebitda:2},
       consecuencia:"La inversión reduce el daño de esta temporada y queda como infraestructura útil para las siguientes."},
      {texto:"Aceptar el rendimiento reducido sin inversión adicional.", efectos:{ebitda:-5},
       consecuencia:"No gastas de más, pero el impacto de la sequía se refleja completo en tu cosecha de este periodo."},
      {texto:"Contratar un seguro agrícola retroactivo si tu póliza actual lo permite.", efectos:{caja:-2, wacc:-0.1},
       consecuencia:"Dependiendo de los términos de tu póliza, esto puede cubrir parte de la pérdida — o no, si la sequía ya estaba en curso cuando la contrataste."},
      {texto:"Redistribuir el agua disponible priorizando los cultivos de mayor margen.", efectos:{ebitda:-3, capitalTrabajo:1, valorInventario:-2},
       consecuencia:"Proteges lo más rentable de tu producción a costa de sacrificar más severamente el resto."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Nuevo arancel de importación en el país destino",
    contexto:"El país al que exportas tu producto principal aprueba un nuevo arancel de importación que encarece tu producto frente a competidores de otros orígenes.",
    choices:[
      {texto:"Absorber el arancel manteniendo tu precio de exportación actual.", efectos:{ebitda:-4},
       consecuencia:"Mantienes tu posición competitiva en ese mercado, a costa directa de tu margen de exportación."},
      {texto:"Trasladar el arancel completo al precio final para tu comprador.", efectos:{ebitda:1, diasCartera:10},
       consecuencia:"Proteges tu margen, aunque tu producto ahora es menos competitivo frente a otros orígenes sin el mismo arancel."},
      {texto:"Buscar mercados de exportación alternativos sin ese arancel.", efectos:{caja:-3, ebitda:-1, wacc:-0.2},
       consecuencia:"Diversificas tu riesgo de dependencia de un solo mercado, aunque abrir mercados nuevos toma tiempo y esfuerzo comercial."},
      {texto:"Explorar un esquema de comercio justo o denominación de origen que reduzca el impacto arancelario.", efectos:{caja:-2, reputacion:3},
       consecuencia:"Una alternativa que, si califica, puede mitigar el arancel y sumar valor a tu marca — aunque no todos los productos aplican."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una porción de tu inventario lleva meses sin rotar",
    contexto:"Una revisión interna de bodega revela que parte de tu inventario lleva varios meses sin moverse — cada día que pasa sin rotar, tus días de inventario suben y ese capital sigue atrapado sin generar nada.",
    choices:[
      {texto:"Liquidar todo ese inventario estancado con un descuento agresivo.", efectos:{diasInventario:-15, valorInventario:-3, caja:2}, consecuencia:"Recuperas liquidez y mejoras tu rotación de golpe, aunque vendiste por debajo de lo que ese inventario realmente valía."},
      {texto:"Mantenerlo en bodega, esperando una mejor oportunidad de venta.", efectos:{diasInventario:5}, consecuencia:"Conservas la esperanza de vender a mejor precio, aunque tus días de inventario siguen empeorando mientras tanto."},
      {texto:"Hacer una liquidación parcial y moderada, no agresiva.", efectos:{diasInventario:-8, valorInventario:-1, caja:1}, consecuencia:"Un punto medio que mejora algo tu rotación sin regalar el inventario completo."},
      {texto:"Donarlo a cambio del beneficio tributario correspondiente.", efectos:{diasInventario:-15, valorInventario:-3, reputacion:3}, consecuencia:"No recuperas caja directa, pero el beneficio tributario y el gesto público compensan parte de la pérdida."}
    ]
  })
];

