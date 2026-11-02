/* =========================================================
   CISNE NEGRO — solo aparece si vas demasiado bien
   ========================================================= */
const BLACK_SWAN_POOL = [
  (s,f)=>({tipo:'macro', titulo:"Crisis financiera global", titular:"Alerta roja: estalla una crisis financiera internacional",
    contexto:`Justo cuando tu gestión parecía sólida, estalla una crisis financiera internacional. Los bancos restringen crédito en todo el sistema y el costo del dinero se dispara para todo el mercado, ${nombreEmpresaActual()} incluido.`,
    choices:[
      {texto:"Aprovechar que tus indicadores están sanos para tomar deuda barata antes de que suba más.", plazo:'largo', efectos:{caja:8, deuda:8, wacc:si(CONTEXTO.apalancado(s), 1.3, 0.8)}, consecuencia:"Te apalancas justo antes de que el crédito se encarezca aún más para todo el mercado — una apuesta audaz en medio de la tormenta."},
      {texto:"Renegociar preventivamente condiciones con banco y proveedores antes de que ellos te llamen a ti.", efectos:{wacc:-0.3, confianzaBanco:si(CONTEXTO.bancoAmigo(s), 7, 5), confianzaProveedores:5, caja:-3, razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.1, 0)}, consecuencia:"Llegar primero a la mesa de negociación, en vez de esperar a que te busquen, te deja en mejor posición que a la mayoría de tus pares del sector."},
      {texto:"Recortar de forma preventiva y agresiva para blindar el balance.", efectos:{ebitda:5, reputacion:si(CONTEXTO.reputacionAlta(s), -8, -6), confianzaProveedores:-6}, consecuencia:"Proteges los números duros, aunque el recorte preventivo — sin que la crisis te haya tocado todavía directamente — no cae bien puertas adentro."}
    ]}),
  (s,f)=>({tipo:'macro', titulo:"Shock de demanda sectorial", titular:"Terremoto en el mercado: la demanda se desploma sin aviso",
    contexto:`Un cambio abrupto en el comportamiento del consumidor golpea a todo el sector de ${nombreEmpresaActual()} al mismo tiempo — no es un error tuyo, es un shock de demanda que nadie vio venir.`,
    choices:[
      {texto:"Diversificar ingresos de emergencia hacia una línea de negocio adyacente.", efectos:{caja:-5, ebitda:si(CONTEXTO.equipoCansado(s), 0.3, 1), razonCorriente:si(CONTEXTO.liquidezBaja(s), -0.12, 0)}, consecuencia:"Abres un frente nuevo mientras el shock pasa, a un costo de inversión considerable y sin garantía de que rinda a tiempo."},
      {texto:"Usar tu buena relación bancaria para una línea de contingencia preventiva.", efectos:{deuda:6, wacc:si(CONTEXTO.bancoAmigo(s), 0.2, 0.4), caja:6}, consecuencia:"Te armas de liquidez extra justo a tiempo, antes de que el resto del sector empiece a pelear por el mismo crédito."},
      {texto:"Bajar precios agresivamente para ganar participación de mercado mientras la competencia duda.", efectos:{ebitda:-4, caja:si(CONTEXTO.liquidezBaja(s), 3, 2)}, consecuencia:"Sacrificas margen de forma importante a cambio de una apuesta de participación de mercado que solo rinde si el shock es temporal."}
    ]})
];

