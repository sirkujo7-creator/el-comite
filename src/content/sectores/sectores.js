/* =========================================================================================
   SECTORES
   ========================================================================================= */
const SECTORS = [
  { id:'vitafit', emoji:'💪', nombre:'Vita Fit', rubro:'Gimnasio, suplementos y acondicionamiento físico', categoria:'terciario',
    descripcion:'Modelo híbrido: si no inviertes en mantenimiento de equipos pierdes suscripciones, y si el inventario de suplementos no rota a tiempo, caduca y se convierte en pérdida.',
    tieneInventario:true, requiereCapex:true, perecedero:true,
    kpiInicial:{caja:40, capitalTrabajo:30, razonCorriente:1.6, deuda:18, ebitda:9, wacc:12.0, diasInventario:42, diasCartera:35, valorInventario:14, confianzaProveedores:68, confianzaBanco:60, reputacion:60, moralEquipo:62},
    cases:VITAFIT_CASES, calendario:[VITAFIT_NOMINA, VITAFIT_RENTA], random:VITAFIT_RANDOM,
    karmaExtra:[{ id:'viralInfluencer', trigger:(s)=>s.reputacion!=null && s.reputacion>=70,
      build:(s,f)=>({tipo:'karma', titulo:"Un influencer local te etiqueta en una publicación viral",
        contexto:"Una influencer de fitness con cientos de miles de seguidores publica una rutina grabada en tu gimnasio, etiquetándote sin que se lo hayas pedido. Las inscripciones empiezan a repuntar de inmediato, y ella te escribe ofreciendo una colaboración paga.",
        choices:[
          {texto:"Aceptar la colaboración paga y ampliar la campaña con ella.", efectos:{caja:-4, reputacion:6, ebitda:2}, consecuencia:"El impulso orgánico se convierte en una estrategia sostenida, aunque el costo de la colaboración se siente de inmediato."},
          {texto:"Agradecerle públicamente sin pagar nada, dejando que el momento orgánico se apague solo.", efectos:{reputacion:-1}, consecuencia:"El momento viral se desvanece más rápido de lo que llegó — sin inversión detrás, el impulso no se sostiene."},
          {texto:"Invitarla a una sesión gratuita a cambio de contenido, sin pago en efectivo.", efectos:{caja:-1, reputacion:4}, consecuencia:"Un punto medio razonable: extiendes el momento sin comprometer tanta caja como una colaboración paga completa."},
          {texto:"Aprovechar el momento para subir precios de membresía antes de que se enfríe.", efectos:{caja:3, ebitda:2, reputacion:-3}, consecuencia:"Capitalizas la demanda mientras dura, aunque algunos nuevos interesados sienten que les cobraste la ola justo cuando llegaban."}
        ]})
    }] },
  { id:'technova', emoji:'💻', nombre:'TechNova', rubro:'Software B2B / SaaS', categoria:'terciario',
    descripcion:'Sin inventario: tu mayor costo es la nómina técnica. Si recortas beneficios para salvar caja, la moral del equipo cae y el mejor talento se va — con el servicio detrás.',
    tieneInventario:false, requiereCapex:false, perecedero:false,
    kpiInicial:{caja:35, capitalTrabajo:22, razonCorriente:1.4, deuda:20, ebitda:6, wacc:13.5, diasInventario:null, diasCartera:45, valorInventario:null, confianzaProveedores:65, confianzaBanco:55, reputacion:60, moralEquipo:65},
    cases:TECHNOVA_CASES, calendario:[TECHNOVA_NOMINA, TECHNOVA_RENTA], random:TECHNOVA_RANDOM,
    karmaExtra:[{ id:'fugaCerebros', trigger:(s)=>s.moralEquipo!=null && s.moralEquipo<=25,
      build:(s,f)=>({tipo:'karma', titulo:"Fuga de cerebros", contexto:"La moral del equipo técnico tocó fondo. Dos desarrolladores senior presentan su renuncia la misma semana, alegando 'falta de reconocimiento y estabilidad'.",
        choices:[
          {texto:"Contraofertar de inmediato con mejoras salariales y de beneficios para todo el equipo técnico.", efectos:{caja:-7, moralEquipo:20}, consecuencia:"Frenas la sangría a un costo alto, pero recuperas parte de la confianza perdida en el equipo que se queda."},
          {texto:"Dejarlos ir y contratar reemplazos de forma acelerada.", efectos:{caja:-4, ebitda:-4, moralEquipo:-5, capitalTrabajo:3}, consecuencia:"El proceso de reemplazo y curva de aprendizaje golpea la velocidad de desarrollo por varios meses. A cambio, la nómina de los reemplazos es más liviana que la de los seniors que se fueron."},
          {texto:"Convocar una reunión abierta para escuchar al equipo y ajustar la cultura interna sin subir salarios todavía.", efectos:{moralEquipo:10, ebitda:-1}, consecuencia:"El gesto de escuchar sin prometer dinero calma parcialmente al equipo, aunque no resuelve la causa económica de fondo."},
          {texto:"Ofrecer participación accionaria (equity) al equipo técnico clave que se queda.", efectos:{moralEquipo:15, ebitda:-1, wacc:0.5}, consecuencia:"Alineas el incentivo de largo plazo del equipo con el de la empresa, sin un desembolso de caja inmediato tan alto. Eso sí, diluyes a los socios actuales, que ahora exigen más retorno: tu costo de capital sube."}
        ]})
    }] },
  { id:'agroverde', emoji:'🌱', nombre:'AgroVerde', rubro:'Exportación de café y aguacate', categoria:'primario',
    descripcion:'Expuesto al clima y al precio internacional del commodity — pero al revés que casi todos: un dólar caro es buena noticia para tus exportaciones.',
    tieneInventario:true, requiereCapex:false, perecedero:false,
    kpiInicial:{caja:38, capitalTrabajo:28, razonCorriente:1.5, deuda:16, ebitda:8, wacc:13.0, diasInventario:35, diasCartera:40, valorInventario:12, confianzaProveedores:70, confianzaBanco:58, reputacion:60, moralEquipo:60},
    cases:AGROVERDE_CASES, calendario:[AGROVERDE_COSECHA, AGROVERDE_RENTA], random:AGROVERDE_RANDOM,
    karmaExtra:[{ id:'recolectoresPiden', trigger:(s)=>s.moralEquipo!=null && s.moralEquipo<=30,
      build:(s,f)=>({tipo:'karma', titulo:"Los recolectores de la finca piden mejores condiciones",
        contexto:"Un grupo de recolectores, cansados de las condiciones actuales, pide una reunión formal — turnos más cortos en las horas de más calor, y almuerzo incluido durante la temporada de cosecha.",
        choices:[
          {texto:"Aceptar ambas peticiones de inmediato.", efectos:{caja:-3, moralEquipo:15}, consecuencia:"El costo es real, pero la respuesta inmediata a una petición razonable reconstruye confianza rápido."},
          {texto:"Rechazar las peticiones, argumentando que el margen no lo permite.", efectos:{moralEquipo:-8}, consecuencia:"El rechazo confirma exactamente lo que los recolectores ya sospechaban — la relación se enfría todavía más."},
          {texto:"Aceptar solo el almuerzo, posponiendo la discusión de turnos.", efectos:{caja:-1, moralEquipo:7}, consecuencia:"Un gesto parcial calma la situación por ahora, aunque el tema de fondo sigue sin resolverse."},
          {texto:"Proponer turnos más cortos a cambio de una meta de recolección diaria.", efectos:{moralEquipo:8, ebitda:1, caja:-1.5}, consecuencia:"Un acuerdo que beneficia a ambos lados — mejor condición a cambio de un compromiso de productividad claro. Cubrir los turnos más cortos exige contratar un par de recolectores adicionales."}
        ]})
    }] },
  { id:'ganadera', emoji:'🐄', nombre:'Ganadera Los Llanos', rubro:'Ganadería lechera y cría de bovinos', categoria:'primario',
    descripcion:'Cada litro de leche que no se vende o refrigera a tiempo se pierde en horas — y una epidemia en el hato puede borrar meses de trabajo de un día para otro.',
    tieneInventario:true, requiereCapex:true, perecedero:true,
    // La leche fresca no se almacena: pocos días de inventario es lo sano. Lo peligroso es la
    // leche represada (días altos), no quedarse "corto" como en el comercio.
    umbrales:{ diasInventario:{ alerta:15, peligro:25, rango:"menos de 15 días: la leche fresca se vende o se procesa en horas; por encima de 25 días hay producción represada que se está perdiendo." } },
    kpiInicial:{caja:36, capitalTrabajo:26, razonCorriente:1.5, deuda:17, ebitda:7.5, wacc:13.5, diasInventario:6, diasCartera:32, valorInventario:9, confianzaProveedores:66, confianzaBanco:58, reputacion:60, moralEquipo:60},
    cases:GANADERA_CASES, calendario:[GANADERA_NOMINA, GANADERA_RENTA], random:GANADERA_RANDOM,
    karmaExtra:[{ id:'programaTV', trigger:(s)=>s.reputacion!=null && s.reputacion>=70,
      build:(s,f)=>({tipo:'karma', titulo:"Un programa de televisión quiere grabar en tu finca",
        contexto:"Un programa regional sobre el campo colombiano te contacta: quieren grabar un episodio completo mostrando tu operación lechera como ejemplo de buenas prácticas. La exposición sería enorme, pero implica abrir la finca por varios días.",
        choices:[
          {texto:"Aceptar la grabación completa, con acceso total a la operación.", efectos:{caja:-2, reputacion:8}, consecuencia:"La exposición completa tiene un costo logístico real, pero el resultado en reputación es de los más altos que vas a conseguir."},
          {texto:"Rechazar la propuesta, prefiriendo mantener bajo perfil.", efectos:{reputacion:-1}, consecuencia:"Evitas la exposición, aunque una oportunidad de esa visibilidad no vuelve a tocar la puerta todos los años."},
          {texto:"Aceptar, pero limitar el acceso a solo una parte de la operación.", efectos:{caja:-1, reputacion:4}, consecuencia:"Un punto medio que reduce la exposición y el costo, sin perder del todo la oportunidad."},
          {texto:"Aceptar y aprovechar la grabación para promocionar directamente tus productos en cámara.", efectos:{caja:-2, reputacion:5, ebitda:1}, consecuencia:"Conviertes la exposición en algo comercialmente útil, no solo en imagen — aunque se siente menos genuino en pantalla."}
        ]})
    }] },
  { id:'construyeya', emoji:'🏗️', nombre:'Construye YA', rubro:'Constructora e inmobiliaria', categoria:'secundario',
    descripcion:'Ciclos largos y doble exposición a la tasa de interés: encarece tu crédito de obra y enfría la demanda hipotecaria de tus compradores al mismo tiempo.',
    tieneInventario:true, requiereCapex:false, perecedero:false,
    kpiInicial:{caja:45, capitalTrabajo:32, razonCorriente:1.4, deuda:25, ebitda:10, wacc:14.0, diasInventario:80, diasCartera:60, valorInventario:35, confianzaProveedores:62, confianzaBanco:55, reputacion:60, moralEquipo:55},
    cases:CONSTRUYEYA_CASES, calendario:[CONSTRUYEYA_SUBCONTRATISTAS, CONSTRUYEYA_RENTA], random:CONSTRUYEYA_RANDOM,
    karmaExtra:[{ id:'inspectorObra', trigger:(s)=>s.deuda!=null && s.deuda>=30,
      build:(s,f)=>({tipo:'karma', titulo:"Un inspector de obra encuentra una irregularidad menor",
        contexto:"Durante una visita rutinaria, un inspector municipal encuentra una irregularidad menor en los planos de una de tus obras en curso — nada que ponga en riesgo la estructura, pero sí un papeleo que no coincide del todo.",
        choices:[
          {texto:"Corregir el papeleo de inmediato y pagar el ajuste que pida.", efectos:{caja:-3, reputacion:2}, consecuencia:"La corrección rápida y sin drama es exactamente lo que un inspector espera ver de un constructor serio."},
          {texto:"Discutir el hallazgo, argumentando que es un tecnicismo sin importancia real.", efectos:{reputacion:-3, caja:1}, consecuencia:"Ahorras el ajuste inmediato, pero el inspector queda con la sensación de que no tomas en serio sus observaciones."},
          {texto:"Ofrecer resolverlo puertas adentro, sin escalarlo formalmente.", efectos:{caja:-2, reputacion:-2}, consecuencia:"La solución informal funciona esta vez, aunque no es el tipo de precedente que quieres que se sepa."},
          {texto:"Contratar una auditoría externa de todos tus proyectos activos antes de que vuelva a pasar.", efectos:{caja:-4, reputacion:5}, consecuencia:"El costo es mayor hoy, pero resolver la causa de raíz vale más que corregir un solo hallazgo aislado."}
        ]})
    }] },
  { id:'modaurbana', emoji:'👗', nombre:'Moda Urbana', rubro:'Retail de ropa y confección', categoria:'secundario',
    descripcion:'El inventario de moda pierde valor si no rota a tiempo con la temporada, y compite de frente contra el fast-fashion importado.',
    tieneInventario:true, requiereCapex:false, perecedero:true,
    kpiInicial:{caja:32, capitalTrabajo:24, razonCorriente:1.5, deuda:15, ebitda:7, wacc:13.5, diasInventario:55, diasCartera:50, valorInventario:18, confianzaProveedores:65, confianzaBanco:58, reputacion:60, moralEquipo:58},
    cases:MODAURBANA_CASES, calendario:[MODAURBANA_NOMINA, MODAURBANA_RENTA], random:MODAURBANA_RANDOM,
    karmaExtra:[{ id:'copiaFastFashion', trigger:(s)=>s.reputacion!=null && s.reputacion>=65,
      build:(s,f)=>({tipo:'karma', titulo:"Una marca de fast fashion copia tu diseño estrella",
        contexto:"Tu prenda más vendida de la temporada aparece, casi idéntica, en el catálogo de una cadena internacional de fast fashion — a una fracción de tu precio. Tus clientes empiezan a preguntarte qué vas a hacer al respecto.",
        choices:[
          {texto:"Iniciar un proceso legal formal contra la marca.", efectos:{caja:-5, reputacion:4, ebitda:1}, consecuencia:"El proceso es costoso y lento, pero defender tu diseño públicamente refuerza tu credibilidad como marca original. Y la demanda frena la venta de la copia en los canales formales."},
          {texto:"Ignorarlo y seguir enfocado en tu propio trabajo.", efectos:{reputacion:-2}, consecuencia:"Sin ninguna respuesta visible, algunos clientes interpretan el silencio como resignación."},
          {texto:"Denunciarlo públicamente en redes sociales, sin acción legal.", efectos:{reputacion:5, caja:-1}, consecuencia:"La denuncia pública resuena con tu comunidad — no resuelve el problema legal, pero sí gana simpatía inmediata."},
          {texto:"Lanzar rápido una versión mejorada del diseño original para diferenciarte.", efectos:{caja:-3, ebitda:2, reputacion:2}, consecuencia:"Responder con innovación, no solo con indignación, es la jugada que mejor conecta con quienes ya te seguían."}
        ]})
    }] }
];

