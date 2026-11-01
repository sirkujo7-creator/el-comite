/* =========================================================================================
   SECTOR PRIMARIO · GANADERA LOS LLANOS — Ganadería lechera y cría de bovinos
   (mecánica: la leche cruda se daña en horas; una epidemia puede borrar meses de trabajo)
   ========================================================================================= */
const GANADERA_CASES = [
(s,f)=>({ tipo:'caso', titulo:"El precio de la leche cae por sobreoferta regional",
  contexto:"Varias ganaderías vecinas ampliaron su hato al mismo tiempo que tú. La región produce ahora más leche de la que las plantas procesadoras pueden absorber, y el precio de compra por litro empezó a caer.",
  investigacion:{costo:2, boton:"Contratar un análisis de mercado lechero regional ($2M)",
    reporte:"El estudio indica que la sobreoferta es <b>temporal</b>: dos plantas nuevas de procesamiento entrarán en operación en los próximos meses y absorberán el excedente."},
  choices:[
    {texto:"Firmar un contrato de suministro fijo con la planta procesadora, asegurando precio aunque sea menor al actual.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:4, wacc:-0.4, ebitda:-1}, {caja:2, wacc:-0.2, ebitda:-1.3}), consecuencia:"Te proteges de que el precio siga cayendo, renunciando a cualquier recuperación si el mercado se ajusta rápido." + si(CONTEXTO.liquidezBaja(s), ' Con la caja tan justa, esa certeza vale oro.', ' Con caja de sobra, renunciaste a margen que no necesitabas proteger.')},
    {texto:"Vender al mejor postor cada semana, sin comprometerte a un solo comprador.", efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:0.6, caja:-2, razonCorriente:-0.08, wacc:0.3}, {ebitda:1.2, wacc:0.2}), consecuencia:"Mantienes flexibilidad total, a costa de una exposición completa a un precio que hoy va a la baja." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez floja, una sola semana mala te deja corto para pagar.', ' Tu caja aguanta los vaivenes y el precio libre te favorece.')},
    {texto:"Comprometer solo la mitad de la producción a precio fijo y dejar el resto libre.", efectos:{caja:1, ebitda:0.5, wacc:0.1}, consecuencia:"Repartes el riesgo: ni la protección completa si el precio sigue cayendo, ni toda la recuperación si se ajusta rápido."},
  ],
  choiceInformado:{texto:"Con la sobreoferta confirmada como temporal, vender semana a semana y esperar a que las nuevas plantas absorban el excedente.", efectos:{caja:1, ebitda:1.5, wacc:0.2},
    consecuencia:"Sabiendo que el desbalance se corrige pronto, comprometerte a un precio fijo hoy habría sido resignar ingreso sin necesidad real. Mientras tanto, eso sí, quedas expuesto a la volatilidad semanal."}
}),
(s,f)=>({ tipo:'caso', titulo:"Financiamiento para ampliar el hato",
  contexto:"Tienes la oportunidad de comprar 40 cabezas de ganado lechero de alta genética a un precio favorable, pero necesitas $14.000.000 que no tienes en caja disponible.",
  investigacion:{costo:1, boton:"Pedir al banco una proyección de tasas para crédito agropecuario ($1M)",
    reporte:"Los analistas proyectan la tasa agropecuaria subsidiada estable en el corto plazo, pero la tasa comercial ordinaria podría subir hasta <b>1.2 puntos</b> en el semestre."},
  choices:[
    {texto:"Tomar crédito agropecuario subsidiado, con más garantías exigidas pero tasa preferencial.", plazo:'largo', efectos:si(CONTEXTO.apalancado(s), {deuda:14, valorInventario:10, ebitda:0.8, wacc:0.9, confianzaBanco:-2, caja:-2, razonCorriente:-0.03}, si(CONTEXTO.bancoAmigo(s), {deuda:14, valorInventario:10, ebitda:1, wacc:0.1, confianzaBanco:3, caja:-1, razonCorriente:-0.03}, {deuda:14, valorInventario:10, ebitda:1, wacc:0.3, confianzaBanco:3, caja:-1, razonCorriente:-0.03})), consecuencia:"Compras las 40 cabezas con la tasa más baja del mercado. Es deuda de largo plazo (solo la cuota cercana pesa en tu liquidez), pero sumas deuda y pagas el trámite y las garantías. Además, el trámite y las garantías exigidas tomaron más tiempo del esperado. Esa demora te costó parte de la temporada de compra de animales." + si(CONTEXTO.apalancado(s), ' Pero ya estabas muy endeudado: el banco exigió más garantías y subió la tasa.', si(CONTEXTO.bancoAmigo(s), ' Tu buena relación con el banco te consiguió la mejor tasa del programa.', ''))},
    {texto:"Ceder participación a un inversionista local interesado en el negocio ganadero.", efectos:si(CONTEXTO.juntaDesconfia(s), {valorInventario:10, ebitda:0.6, wacc:1.4, reputacion:-2}, {valorInventario:10, ebitda:0.6, wacc:0.8}), consecuencia:"Compras el ganado sin sumar deuda, pero cediste una porción real de las utilidades futuras del hato. Y ese socio espera un retorno más alto que el de un banco: tu costo de capital sube." + si(CONTEXTO.juntaDesconfia(s), ' Con una junta que ya duda de ti, el socio negoció duro y la junta lo leyó como pérdida de control.', '')},
    {texto:"Postergar la compra y ampliar el hato de forma orgánica con las crías propias.", efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:-0.2, valorInventario:2, caja:-0.5, confianzaBanco:1}, {ebitda:-0.7, valorInventario:2, caja:-0.5}), consecuencia:"Ni deuda ni socios: el hato crece despacio con tus propias crías. La genética y el ritmo quedan muy por debajo de lo que la oportunidad ofrecía." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez como está, no endeudarte fue prudencia, no timidez.', ' Tenías con qué crecer: el costo de esperar se nota en el margen.')}
  ],
  choiceInformado:{texto:"Con la tasa comercial subiendo confirmada, tomar el crédito agropecuario subsidiado pese al trámite más largo.", plazo:'largo', efectos:{deuda:14, valorInventario:10, ebitda:1, wacc:0.1, confianzaBanco:5, caja:-1, razonCorriente:-0.03},
    consecuencia:"Un punto de tasa sostenido durante años de crédito es una diferencia real — el trámite adicional valió la pena."}
}),
(s,f)=>({ tipo:'caso', titulo:"Brote de fiebre aftosa en la región",
  contexto:"Las autoridades sanitarias confirman casos de fiebre aftosa en fincas vecinas. Si el brote llega a tu hato, podrías perder animales y quedar en cuarentena, sin poder vender leche ni ganado por semanas.",
  choices:[
    {texto:"Vacunar de emergencia a todo el hato, aunque no estaba presupuestado.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:-5, valorInventario:1, razonCorriente:-0.1}, {caja:-5, valorInventario:1}), consecuencia:"El gasto no estaba previsto, pero reduces drásticamente el riesgo de perder animales o entrar en cuarentena." + si(CONTEXTO.liquidezBaja(s), ' Con la caja tan justa, el gasto imprevisto aprieta tu liquidez.', '')},
    {texto:"Reforzar el aislamiento perimetral y esperar a ver si el brote se contiene en las fincas vecinas.", efectos:si(CONTEXTO.equipoCansado(s), {caja:-1, valorInventario:-4, ebitda:-1.2}, {caja:-1, valorInventario:-1, ebitda:-0.3}), consecuencia:"Ahorras el costo de la vacunación masiva, apostando a que la bioseguridad básica sea suficiente. Algunos animales enferman igual: no es una cuarentena, pero sí un golpe al hato." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, el protocolo se relaja y el brote entra.', ' Tu equipo cumple el protocolo al pie de la letra y el daño queda acotado.')},
    {texto:"Contratar un seguro de emergencia sanitaria para el hato.", efectos:{caja:-2, wacc:-0.1}, consecuencia:"Pagas una prima moderada para transferir buena parte del riesgo económico a la aseguradora."},
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"La cadena de frío falla en plena ola de calor",
  contexto:"El tanque de enfriamiento de leche, ya viejo, empieza a fallar justo en la época de más calor del año. Si no lo reemplazas pronto, vas a perder litros enteros de producción por descomposición antes de la recolección.",
  choices:[
    {texto:"Reemplazar el tanque de frío por uno nuevo de mayor capacidad.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:-7, diasInventario:-2, ebitda:0.5, razonCorriente:-0.12}, {caja:-7, diasInventario:-2, ebitda:0.5}), capex:true, consecuencia:"Resuelves el problema de raíz y hasta ganas capacidad adicional, a cambio de un desembolso importante hoy." + si(CONTEXTO.liquidezBaja(s), ' El desembolso, con la caja así, deja tu liquidez en rojo.', '')},
    {texto:"Reparar el tanque actual con un mantenimiento de emergencia.", efectos:si(CONTEXTO.equiposGastados(s), {caja:-2, valorInventario:-2.5, ebitda:-0.5}, {caja:-2, valorInventario:-1}), consecuencia:"Una solución más barata, aunque el equipo sigue viejo: en los días más calientes todavía se pierde algo de leche." + si(CONTEXTO.equiposGastados(s), ' Los equipos llevan turnos sin mantenimiento: el parche dura poco.', '')},
    {texto:"Alquilar temporalmente un tanque de frío móvil mientras decides qué hacer.", efectos:{caja:-3, diasInventario:-1, ebitda:-0.3}, consecuencia:"Ganas tiempo sin comprometer la inversión completa, pero el alquiler es un costo que se repite mientras no decidas."},
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Un distribuidor grande ofrece exclusividad",
  contexto:"Una cadena de supermercados regional te propone ser su proveedor exclusivo de leche fresca, con un volumen garantizado — pero exige que dejes de venderle a tus compradores actuales, más pequeños pero leales.",
  choices:[
    {texto:"Aceptar la exclusividad con la cadena de supermercados.", efectos:si(CONTEXTO.apalancado(s), {caja:4, ebitda:2, confianzaProveedores:-4, wacc:0.8}, {caja:4, ebitda:2, confianzaProveedores:-4, wacc:0.4}), consecuencia:"Aseguras un volumen grande y estable, a costa de las relaciones con tus compradores de siempre. Y ahora dependes de un solo cliente: el banco lo lee como más riesgo." + si(CONTEXTO.apalancado(s), ' Muy endeudado y con un solo cliente: el banco lo ve como riesgo doble.', '')},
    {texto:"Negociar un contrato no exclusivo, vendiéndole un porcentaje fijo sin abandonar a los demás.", efectos:si(CONTEXTO.reputacionAlta(s), {caja:2, ebitda:1.4, confianzaProveedores:-1}, {caja:2, ebitda:1, confianzaProveedores:-1}), consecuencia:"Consigues parte del volumen ofrecido sin romper tus relaciones existentes — la cadena acepta, aunque no es lo que pedía originalmente." + si(CONTEXTO.reputacionAlta(s), ' Tu reputación pesa: la cadena acepta mejores términos de los que pensaba dar.', '')},
    {texto:"Usar la oferta de la cadena como palanca para renegociar mejores precios con tus compradores actuales.", efectos:si(CONTEXTO.proveedoresTensos(s), {ebitda:1.1, confianzaProveedores:-6, reputacion:-2}, {ebitda:1.5, confianzaProveedores:-2, reputacion:-1}), consecuencia:"Consigues algo mejor de tus compradores de siempre, aunque notan que los usaste como comparación frente a un tercero." + si(CONTEXTO.proveedoresTensos(s), ' La relación ya estaba frágil: se ofenden y ceden muy poco.', '')}
  ]
}),
(s,f)=>({ tipo:'caso', titulo:"Un matadero ofrece comprar todo el ganado de descarte por adelantado",
  contexto:"Un matadero de la región te propone un contrato anual: comprarte por adelantado todo el ganado de descarte que generes, a un precio fijo, asegurándote un comprador constante — pero atándote a él en exclusividad durante todo el contrato.",
  choices:[
    {texto:"Firmar el contrato de exclusividad anual con el matadero.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:6, capitalTrabajo:4, ebitda:-0.8, wacc:-0.3}, {caja:6, capitalTrabajo:4, ebitda:-1.2, wacc:-0.1}), consecuencia:"Aseguras un comprador constante y previsible, renunciando a negociar con otros compradores durante todo el año. El precio pactado para todo el año es algo menor que el del mercado." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez justa, el anticipo te da aire de verdad.', '')},
    {texto:"Rechazar la exclusividad y seguir vendiendo el ganado de descarte al mejor postor cada vez.", efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:0.3, diasInventario:4, caja:-1.5}, {ebitda:0.8, diasInventario:2}), consecuencia:"Mantienes flexibilidad total, sin la certeza de un comprador garantizado en meses de poca demanda. En los meses flojos, algunos animales de descarte se quedan más tiempo en la finca." + si(CONTEXTO.liquidezBaja(s), ' Sin caja para esperar al mejor postor, terminas vendiendo cuando no te conviene.', '')},
    {texto:"Aceptar el contrato solo por seis meses, para evaluar la relación antes de comprometerte a un año completo.", efectos:{caja:3, capitalTrabajo:2, ebitda:-0.5}, consecuencia:"Pruebas la relación comercial con un compromiso menor, aunque el precio ofrecido por ese plazo corto es menos favorable."}
  ]
}),
];

function GANADERA_NOMINA(s,f){ return {tipo:'calendario', titulo:"Pago a vaqueros y personal de ordeño",
  contexto:"Llega el pago quincenal del personal de campo: vaqueros, ordeñadores y el encargado de mantenimiento — trabajo manual diario que no se puede posponer sin arriesgar la operación misma.",
  choices:[
    {texto:"Pagar todo con la caja disponible.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:-6, moralEquipo:1, razonCorriente:-0.1}, {caja:-6, moralEquipo:1}), consecuencia:"Cumples en tiempo y forma, manteniendo la confianza del personal que sostiene la operación día a día."},
    {texto:"Pagar la mayoría y diferir un pequeño saldo con acuerdo del personal.", efectos:si(CONTEXTO.equipoCansado(s), {caja:-4, moralEquipo:-5}, {caja:-4, moralEquipo:-2}), diferir:{monto:2.2, turnos:1, motivo:"Saldo diferido a personal de campo", tipo:'nomina'},
     consecuencia:"El personal acepta por esta vez, aunque depender de su buena voluntad tiene un límite."},
    {texto:"Tomar un adelanto de caja de corto plazo para cubrir la nómina completa.", efectos:si(CONTEXTO.apalancado(s), {deuda:3, wacc:0.8, caja:-3}, {deuda:3, wacc:0.4, caja:-3}), consecuencia:"Evitas cualquier fricción con el personal, sumando una deuda de corto plazo a tu estructura de capital."},
  ]};}
function GANADERA_RENTA(s,f){ return {tipo:'calendario', titulo:"Renta, predial y certificación sanitaria",
  contexto:"Llega la fecha de declarar renta, junto con el impuesto predial de la finca y la renovación de la certificación sanitaria que te permite seguir vendiendo leche formalmente.",
  choices:[
    {texto:"Pagar de contado el valor completo estimado.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:-6, confianzaBanco:2, razonCorriente:-0.1}, {caja:-6, confianzaBanco:2}), consecuencia:"Cumples sin generar ninguna obligación adicional, y tu certificación sanitaria queda vigente sin sobresaltos. Además, un historial tributario impecable mejora tu perfil ante el banco."},
    {texto:"Acogerse a una facilidad de pago con la autoridad tributaria.", efectos:si(CONTEXTO.bancoAmigo(s), {caja:-2, deuda:4, wacc:0.2}, {caja:-2, deuda:4, wacc:0.4}), consecuencia:"Alivias la presión de caja, pero conviertes impuestos en deuda financiera con intereses."},
    {texto:"Contratar un asesor tributario rural para optimizar las deducciones aplicables al sector.", efectos:{caja:-4, ebitda:0.5}, consecuencia:"Los honorarios cuestan, pero el asesor identifica beneficios tributarios legítimos para la actividad ganadera."},
  ]};}
const GANADERA_RANDOM = [
  (s,f)=>({tipo:'macro', titulo:"Una sequía prolongada reduce la disponibilidad de pastos", titular:"Fenómeno climático golpea a los ganaderos de la región", impactoAutomatico:{ebitda:-1},
    contexto:"Meses sin lluvia suficiente están secando los potreros de toda la región. Sin pasto natural, vas a necesitar comprar alimento suplementario para mantener la producción de leche estable — o dejar que la producción caiga.",
    choices:[
      {texto:"Comprar alimento balanceado suplementario para sostener la producción completa.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:-4, ebitda:1, razonCorriente:-0.1}, {caja:-4, ebitda:1}), consecuencia:"El costo extra pesa en el balance, pero evitas que la sequía te cueste producción real."},
      {texto:"Vender parte del hato menos productivo para aliviar la presión sobre los pastos restantes.", efectos:si(s.valorInventario != null && s.valorInventario < 8, {caja:3, ebitda:-1.8, valorInventario:-2}, {caja:3, ebitda:-1, valorInventario:-2}), consecuencia:"Consigues liquidez inmediata y alivias la presión sobre el pasto, reduciendo también tu capacidad futura." + si(s.valorInventario != null && s.valorInventario < 8, ' El hato ya era pequeño: cada animal vendido se nota en la producción.', '')},
      {texto:"Invertir en un sistema de riego para los potreros más críticos.", efectos:si(CONTEXTO.liquidezBaja(s), {caja:-5, ebitda:1, razonCorriente:-0.12}, {caja:-5, ebitda:1.5}), capex:true, consecuencia:"Una solución más duradera frente a futuras sequías, aunque el desembolso de hoy es considerable." + si(CONTEXTO.liquidezBaja(s), ' Con la caja así, la obra se hace a medias y la liquidez se resiente.', '')}
    ]
  }),
  (s,f)=>({tipo:'macro', titulo:"El precio internacional de la carne sube con fuerza", titular:"Exportaciones de carne impulsan el precio al productor", impactoAutomatico:{caja:2},
    contexto:"La demanda externa de carne bovina empuja el precio interno al alza, beneficiando también a quienes venden animales de descarte del hato lechero — ya reflejado como ingreso extra en tu caja.",
    choices:[
      {texto:"Vender de inmediato los animales de descarte aprovechando el precio alto.", efectos:{caja:3, valorInventario:-2}, consecuencia:"Capturas el buen momento del mercado antes de que el precio pueda corregirse."},
      {texto:"Esperar a ver si el precio sigue subiendo antes de vender.", efectos:si(CONTEXTO.liquidezBaja(s), {ebitda:0.4, caja:-1.6}, {ebitda:1, caja:-1}), consecuencia:"Apuestas a que la tendencia continúe — puede salir mejor o peor que vender ahora. Mientras esperas, mantener esos animales en la finca cuesta alimento." + si(CONTEXTO.liquidezBaja(s), ' Con la caja justa, sostener esos animales sale más caro de lo que crees.', '')},
      {texto:"Reinvertir el ingreso extra en mejorar la genética del hato.", efectos:{caja:-2, ebitda:1, valorInventario:2}, capex:true, consecuencia:"Usas el viento a favor del mercado para fortalecer la productividad futura en vez de solo repartir la ganancia."},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"El veterinario recomienda un plan de vacunación preventiva ampliado",
    contexto:"Más allá del calendario sanitario obligatorio, tu veterinario de confianza recomienda un plan preventivo adicional contra enfermedades que no son frecuentes en la zona, pero que serían devastadoras si aparecieran.",
    choices:[
      {texto:"Aplicar el plan preventivo ampliado completo.", efectos:{caja:-3, moralEquipo:1}, consecuencia:"Un gasto que probablemente nunca veas rendir en el papel, salvo que la enfermedad que previene aparezca."},
      {texto:"Aplicar solo el calendario sanitario obligatorio, sin el plan adicional.", efectos:si(CONTEXTO.equipoCansado(s), {valorInventario:-2.5}, {valorInventario:-1}), consecuencia:"Ahorras el costo adicional, asumiendo el riesgo estadísticamente bajo de esas enfermedades específicas — un riesgo que, si se materializa, golpea directamente el valor del hato."},
      {texto:"Aplicar el plan solo a las crías y hembras reproductoras, priorizando el futuro del hato.", efectos:{caja:-1.5, valorInventario:0.5}, consecuencia:"Un punto medio que protege lo más valioso a largo plazo sin el gasto completo."},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un comprador informal ofrece pagar más, en efectivo y sin factura",
    contexto:"Un intermediario conocido en la zona te ofrece comprarte parte de la producción a un precio mejor que el de la planta formal, pero en efectivo y sin ningún tipo de factura ni contrato.",
    choices:[
      {texto:"Aceptar y venderle una parte de la producción de esa forma.", efectos:si(CONTEXTO.juntaDesconfia(s), {caja:3, reputacion:-8, confianzaBanco:-3}, {caja:3, reputacion:-4}), consecuencia:"Ganas margen inmediato, pero quedas expuesto si la operación informal alguna vez se conoce o se audita." + si(CONTEXTO.juntaDesconfia(s), ' La junta ya te tenía en la mira: el rumor llega rápido y pesa el doble.', '')},
      {texto:"Rechazar la oferta y mantener toda la venta formal con la planta procesadora.", efectos:{reputacion:2, ebitda:-0.5}, consecuencia:"Renuncias al margen adicional, pero tu operación queda completamente en regla."},
      {texto:"Proponerle al comprador informal una relación formal, con factura, a cambio de mantener buena parte del precio ofrecido.", efectos:{caja:1, reputacion:1, diasCartera:5}, consecuencia:"Consigues parte de la mejora de precio sin salir de la formalidad — el comprador acepta, aunque a regañadientes. Eso sí, con factura de por medio ya no paga en efectivo: ahora te paga a 30 días."},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Una organización de bienestar animal pide auditar tu hato",
    contexto:"Una ONG de bienestar animal, activa en la región, te solicita acceso para auditar las condiciones de manejo de tu ganado, ofreciendo a cambio un sello de certificación si apruebas.",
    choices:[
      {texto:"Abrir las puertas del hato a la auditoría completa.", efectos:si(CONTEXTO.equipoCansado(s), {caja:-1, reputacion:-2, moralEquipo:-1, valorInventario:1}, {caja:-1, reputacion:4}), consecuencia:"El sello de bienestar animal puede abrirte puertas comerciales nuevas, aunque el proceso expone cualquier debilidad real que tengas." + si(CONTEXTO.equipoCansado(s), ' Con el equipo desbordado, la auditoría encuentra fallas de manejo y el sello no llega; al menos te deja un plan de mejoras para el hato.', '')},
      {texto:"Rechazar la auditoría por ahora, prefiriendo mantener el manejo interno como está.", efectos:{reputacion:-1}, consecuencia:"Evitas cualquier exposición, aunque te quedas sin el sello que algunos compradores empiezan a valorar."},
      {texto:"Pedir tiempo para hacer mejoras internas antes de aceptar la auditoría.", efectos:{caja:-2, reputacion:2, valorInventario:1}, consecuencia:"Inviertes primero en asegurarte de que la auditoría salga bien, retrasando el proceso pero reduciendo el riesgo."},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Robo de ganado en una finca vecina",
    contexto:"Una finca cercana sufrió el robo de varias cabezas de ganado durante la noche. La zona está en alerta, y varios ganaderos vecinos están reforzando la seguridad de sus propios predios.",
    choices:[
      {texto:"Invertir en cercas eléctricas y cámaras de seguridad para todo el perímetro.", efectos:{caja:-4, valorInventario:1}, capex:true, consecuencia:"Un gasto considerable, pero reduces de forma real el riesgo de sufrir el mismo destino."},
      {texto:"Contratar vigilancia nocturna temporal mientras pasa la alerta en la zona.", efectos:si(CONTEXTO.equipoCansado(s), {caja:-1.5, moralEquipo:-3, valorInventario:1}, {caja:-1.5, moralEquipo:-1, valorInventario:1}), consecuencia:"Una solución más barata y rápida, aunque no resuelve el problema de fondo, y tus vaqueros terminan cubriendo turnos de noche que nadie les había pedido."},
      {texto:"Coordinar con los ganaderos vecinos una red de vigilancia comunitaria compartida.", efectos:si(CONTEXTO.reputacionAlta(s), {caja:-0.5, reputacion:1, valorInventario:0.5}, {caja:-0.5, reputacion:1, valorInventario:-0.5}), consecuencia:"Reduces el costo individual apoyándote en la comunidad, aunque la efectividad depende del compromiso de todos. Esta vez, algunos turnos de vigilancia quedan sin cubrir y pierdes un par de animales." + si(CONTEXTO.reputacionAlta(s), ' Tu nombre pesa en la zona: los vecinos cumplen sus turnos.', '')},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un fondo de inversión ganadera ofrece capital a cambio de participación",
    contexto:"Un fondo especializado en agronegocios te propone una inyección de capital importante para modernizar el hato, a cambio de una participación permanente en el negocio.",
    choices:[
      {texto:"Aceptar la inversión del fondo a cambio de la participación solicitada.", efectos:si(CONTEXTO.juntaDesconfia(s), {caja:10, ebitda:1, reputacion:-1, wacc:1.5}, si(CONTEXTO.liquidezBaja(s), {caja:10, ebitda:1, reputacion:-1, wacc:1, razonCorriente:0.2}, {caja:10, ebitda:1, reputacion:-1, wacc:1})), consecuencia:"Consigues capital sustancial para modernizar, cediendo a cambio una porción real y permanente del negocio — algunos en la región ven con recelo que un fondo externo ya tenga voz en el hato. Además, el fondo exige un retorno alto por su capital: tu costo de capital sube."},
      {texto:"Rechazar la oferta y seguir creciendo con recursos propios, más lento pero sin ceder control.", efectos:si(CONTEXTO.liquidezBaja(s), {capitalTrabajo:-3, razonCorriente:-0.08}, {capitalTrabajo:-1}), consecuencia:"Mantienes el control total del negocio, renunciando a un salto de capital que hubiera acelerado tu crecimiento." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez como está, crecer solo con lo propio te deja sin colchón.', '')},
      {texto:"Negociar una participación menor a la ofrecida, aunque signifique menos capital.", efectos:{caja:5, ebitda:0.5, wacc:0.5}, consecuencia:"Un punto medio: menos capital del que el fondo ofrecía, pero cediendo también menos control. Aun así, el fondo exige un retorno alto por su parte: tu costo de capital sube."},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Litros de leche represados por una falla en la recolección",
    contexto:"Un problema logístico del comprador habitual dejó litros de leche sin recoger a tiempo. Cada hora que pasa en el tanque de frío, ese producto pierde valor — y algunos litros ya no van a poder venderse como leche fresca de primera calidad.",
    choices:[
      {texto:"Vender de emergencia a un comprador informal, a precio bajo, antes de perderlo todo.", efectos:{diasInventario:-4, valorInventario:-3, caja:1, reputacion:-1}, consecuencia:"Recuperas algo de valor antes de que se pierda del todo, aunque muy por debajo del precio que hubieras conseguido en condiciones normales."},
      {texto:"Procesar la leche en queso fresco en tu propia finca, en vez de venderla cruda.", efectos:si(CONTEXTO.equipoCansado(s), {caja:-1.5, valorInventario:-1, diasInventario:-2}, {caja:-1.5, valorInventario:1, diasInventario:-2}), consecuencia:"La inversión en procesamiento le da una vida útil mucho más larga a ese producto, aunque no es algo que puedas improvisar de un día para otro sin costo." + si(CONTEXTO.equipoCansado(s), ' Con el equipo agotado, el queso sale irregular y se pierde parte.', '')},
      {texto:"Donar una parte a un comedor comunitario, evitando al menos la pérdida total.", efectos:{diasInventario:-3, valorInventario:-2, reputacion:2}, consecuencia:"No recuperas caja directa, pero evitas que el producto se pierda por completo, y el gesto no pasa desapercibido en la comunidad."}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Tu banco ofrece una línea de crédito estacional para la finca",
    contexto:"Tu banco, conocedor del negocio ganadero, te ofrece una línea de crédito pensada específicamente para cubrir los meses de menor producción — con una tasa preferencial si demuestras que la usas exclusivamente para la operación del hato.",
    choices:[
      {texto:"Tomar la línea completa y usarla exactamente como fue pensada.", efectos:si(CONTEXTO.apalancado(s), {caja:4, deuda:3, confianzaBanco:2, wacc:0.4}, {caja:4, deuda:3, confianzaBanco:5}), consecuencia:"El banco premia el uso responsable de una línea diseñada para ti con una relación cada vez más sólida."},
      {texto:"Tomar solo una parte de la línea, la mínima necesaria.", efectos:{caja:2, deuda:1, confianzaBanco:2}, consecuencia:"Un uso prudente que cubre lo esencial sin comprometerte más de la cuenta."},
      {texto:"Tomar la línea completa, pero usar parte del dinero en algo distinto a lo pactado.", efectos:si(CONTEXTO.bancoAmigo(s), {caja:4, deuda:3, confianzaBanco:-8, ebitda:1}, {caja:4, deuda:3, confianzaBanco:-4, ebitda:1}), consecuencia:"El banco lo nota tarde o temprano — desviar el uso de una línea con condiciones específicas rara vez pasa desapercibido." + si(CONTEXTO.bancoAmigo(s), ' El banco confiaba en ti: la traición le duele más.', '')}
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"Un comprador mayorista pide entrega urgente de todo el excedente",
    contexto:"Un comprador mayorista, que normalmente compra por lotes pequeños, ofrece llevarse todo tu excedente de producción de una sola vez — pero necesita la entrega mañana mismo, sin el tiempo habitual de verificación de calidad.",
    choices:[
      {texto:"Aceptar la entrega urgente, saltándote la verificación habitual.", efectos:si(CONTEXTO.juntaDesconfia(s), {diasInventario:-6, caja:2, reputacion:-3}, {diasInventario:-6, caja:2, reputacion:-1}), consecuencia:"El excedente sale de la bodega de inmediato, aunque saltarte tu propio proceso de calidad no pasa del todo desapercibido."},
      {texto:"Rechazar la prisa, ofreciendo la entrega en el plazo normal con verificación completa.", efectos:{reputacion:1, diasInventario:2}, consecuencia:"Mantener el estándar de siempre, aunque signifique perder esta venta puntual, refuerza tu nombre como proveedor serio."},
      {texto:"Aceptar, pero hacer una verificación exprés reducida en vez de omitirla del todo.", efectos:{diasInventario:-4, caja:1.5, reputacion:-0.5}, consecuencia:"Un punto medio que agiliza la entrega sin renunciar por completo al control de calidad."},
    ]
  }),
  (s,f)=>({
    tipo:'random', titulo:"La finca vecina ofrece capacidad de refrigeración adicional temporal",
    contexto:"Tu tanque de frío está al límite de su capacidad en esta temporada alta de producción. La finca vecina, con quien tienes buena relación, ofrece prestarte espacio de refrigeración adicional por unas semanas, a cambio de una tarifa.",
    choices:[
      {texto:"Aceptar el espacio adicional completo.", efectos:{diasInventario:-4, valorInventario:1, caja:-1}, consecuencia:"La capacidad extra resuelve la saturación justo cuando más la necesitabas."},
      {texto:"Aceptar solo una parte del espacio ofrecido.", efectos:{diasInventario:-2, caja:-0.5}, consecuencia:"Un alivio parcial que no resuelve toda la saturación, pero tampoco compromete tanta caja."},
      {texto:"Aceptar el espacio completo, ofreciendo a cambio ayuda con transporte compartido en el futuro.", efectos:si(CONTEXTO.equipoCansado(s), {diasInventario:-3, valorInventario:1, confianzaProveedores:2, caja:-1, moralEquipo:-1}, {diasInventario:-3, valorInventario:1, confianzaProveedores:2, caja:-1}), consecuencia:"El trueque de favores, además del pago, deja una relación más sólida de la que tenías antes — aunque el alivio de inventario es un poco menor que si solo hubieras pagado."}
    ]
  }),
  (s,f)=>({tipo:'random', titulo:"El queso madurado se acumula en el cuarto frío",
    contexto:"La línea de queso que empezaste para darle salida a la leche sobrante rota más lento de lo previsto. El cuarto frío está lleno y el queso sigue sumando días en inventario.",
    choices:[
      {texto:"Venderlo al por mayor a un distribuidor regional, con descuento.", efectos:{diasInventario:-8, valorInventario:-3, caja:3, ebitda:-1},
       consecuencia:"Vacías el cuarto frío y entra caja, a un precio bastante menor del que esperabas."},
      {texto:"Abrir un punto de venta directo los fines de semana en el pueblo.", efectos:si(CONTEXTO.equipoCansado(s), {caja:-2, diasInventario:-5, ebitda:0.3, reputacion:1, moralEquipo:-2}, {caja:-2, diasInventario:-5, ebitda:1, reputacion:1}),
       consecuencia:"Vendes al precio completo y la gente empieza a conocer tu marca, aunque montar el punto de venta cuesta." + si(CONTEXTO.equipoCansado(s), ' Con el equipo cansado, los fines de semana de más pasan factura.', '')},
      {texto:"Seguir madurándolo: el queso añejo se vende más caro.", efectos:si(CONTEXTO.liquidezBaja(s), {diasInventario:6, valorInventario:3, ebitda:0.5, caja:-1.5}, {diasInventario:6, valorInventario:3, ebitda:0.5}),
       consecuencia:"El queso gana valor con el tiempo, pero también gana días en bodega mientras encuentras quién lo compre." + si(CONTEXTO.liquidezBaja(s), ' Pero con la caja así, inmovilizar producto duele.', '')}
    ]}),
  (s,f)=>({tipo:'random', titulo:"La planta procesadora empieza a pagarte a 60 días",
    contexto:"La planta que te compra la leche anuncia que, por sus propios problemas de liquidez, pasará de pagarte a 15 días a pagarte a 60.",
    choices:[
      {texto:"Aceptar el nuevo plazo para no perder a tu comprador principal.", efectos:si(CONTEXTO.liquidezBaja(s), {diasCartera:25, razonCorriente:-0.2, confianzaProveedores:2, caja:-2}, {diasCartera:25, razonCorriente:-0.1, confianzaProveedores:2}),
       consecuencia:"La relación se mantiene, pero ahora financias tú dos meses de la operación de la planta." + si(CONTEXTO.liquidezBaja(s), ' Con la liquidez ya floja, financiar a la planta te deja contra las cuerdas.', '')},
      {texto:"Vender parte de la leche a una cooperativa que paga a 15 días, aunque a menor precio.", efectos:{diasCartera:-5, ebitda:-1.5},
       consecuencia:"Proteges tu flujo de caja, a costa de un precio por litro más bajo en esa porción."},
      {texto:"Tomar un crédito de capital de trabajo a un año mientras se normalizan los pagos.", efectos:si(CONTEXTO.apalancado(s), {caja:4, deuda:4, wacc:0.7, razonCorriente:-0.05}, {caja:4, deuda:4, wacc:0.3, razonCorriente:-0.05}),
       consecuencia:"Entra caja para operar, pero como es deuda de corto plazo, tu razón corriente incluso baja un poco: suben a la vez el efectivo y los pasivos corrientes."}
    ]})
];

