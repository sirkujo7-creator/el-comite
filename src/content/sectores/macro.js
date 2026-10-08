/* =========================================================================================
   FUNCIONES MACRO REUTILIZABLES (con impacto automático antes de decidir)
   ========================================================================================= */
function MACRO_TASA_INTERES(s,f,dobleGolpe){
  const impacto = f.deudaVariable ? {wacc:1.5} : {wacc:0.3};
  return {
    tipo:'macro', titulo:"El Banco de la República sube las tasas", titular:"¿Se acabó el dinero barato? El banco central sorprende al mercado", impactoAutomatico: impacto,
    contexto: f.deudaVariable
      ? `El Banco de la República sube su tasa de referencia 150 puntos básicos. Como tomaste crédito a tasa variable, tu cuota mensual sube de inmediato y tu costo de capital ya se ajustó.${dobleGolpe? ' Además, el crédito hipotecario de tus posibles compradores también se encarece, lo que enfría la demanda.' : ''}`
      : `El Banco de la República sube su tasa de referencia 150 puntos básicos. Tu crédito actual es a tasa fija, así que tu cuota no cambia — pero el costo de cualquier deuda nueva ya subió un poco.${dobleGolpe? ' El crédito hipotecario de tus compradores también se encarece, lo que puede enfriar la demanda incluso sin tocar tu deuda.' : ''}`,
    choices: f.deudaVariable ? [
      {texto:"Reestructurar de inmediato a tasa fija, aunque cueste una comisión.", efectos:{caja:-2, wacc:-1}, setFlags:{deudaVariable:false},
       consecuencia:"Pagas la comisión de reestructuración, pero blindas tu flujo de caja futuro contra nuevas subidas de tasa."},
      {texto:"Mantener la tasa variable, apostando a que el ciclo de subidas termine pronto.", efectos:{wacc:1},
       consecuencia:"Tu cuota sigue subiendo. La apuesta puede salir bien, pero por ahora va perdiendo."},
      {texto:"Abonar a capital para reducir el saldo expuesto a la tasa variable.", efectos:{caja:-5, deuda:-5, wacc:0.3},
       consecuencia:"Usas caja disponible para bajar el monto expuesto: menos deuda, pero también menos colchón de liquidez este mes."},
      {texto:"Negociar con el banco un tope máximo (cap) sobre la tasa variable a cambio de una prima.", efectos:{caja:-2, wacc:0.2},
       consecuencia:"Limitas cuánto puede subir tu cuota en el peor escenario, a cambio de pagar una prima por esa protección desde ya."}
    ] : [
      {texto:"No tomar deuda nueva por ahora y esperar a que el mercado se estabilice.", efectos:{ebitda:-0.5},
       consecuencia:"Te mantienes al margen del encarecimiento del crédito, aunque el proyecto que ese capital hubiera financiado sigue esperando."},
      {texto:"Adelantar la solicitud de un nuevo cupo de crédito antes de que suba más.", efectos:{deuda:5, wacc:0.4, capitalTrabajo:5},
       consecuencia:"Aseguras un cupo a una tasa todavía razonable, anticipándote a que el crédito siga encareciéndose."},
      {texto:"Aprovechar para renegociar mejores plazos de pago con tus clientes actuales.", efectos:{capitalTrabajo:-2, ebitda:0.5},
       consecuencia:"Con el crédito más caro para todos, tus clientes valoran más la flexibilidad de plazo que tú les puedes ofrecer directamente."},
      {texto:"Reforzar la reserva de contingencia ante un posible enfriamiento generalizado de la demanda.", efectos:{caja:-2, razonCorriente:0.08},
       consecuencia:"Te preparas para un entorno más restrictivo, sacrificando algo de liquidez inmediata por más margen de maniobra futuro."}
    ]
  };
}
function MACRO_REFORMA_TRIBUTARIA_GENERICA(s,f,objeto){
  return {
    tipo:'macro', titulo:"Reforma tributaria aprobada", titular:"Última hora: el Congreso aprueba una reforma que nadie vio venir", impactoAutomatico:{ebitda:-1.5},
    contexto:`El Congreso aprueba una reforma tributaria que sube la tasa efectiva de renta y ajusta la carga tributaria sobre ${objeto}, vigente desde ya — el impacto en tu margen ya se sintió este periodo.`,
    choices:[
      {texto:"Trasladar el incremento a tus precios.", efectos:{ebitda:2.5, confianzaProveedores:-3}, consecuencia:"Recuperas margen, pero algunos clientes sensibles al precio empiezan a comparar con la competencia."},
      {texto:"Absorber el costo tributario en tu margen actual sin más ajustes.", efectos:{ebitda:-1.5}, consecuencia:"Tus precios se mantienen intactos y tus clientes ni se enteran del cambio, pero el golpe al EBITDA ya quedó registrado."},
      {texto:"Reestructurar gastos operativos para compensar el mayor costo tributario.", efectos:{ebitda:1, capitalTrabajo:-2}, consecuencia:"Encuentras eficiencias reales, aunque el ajuste consume parte de tu capital de trabajo mientras se implementa."},
      {texto:"Contratar una asesoría tributaria para identificar deducciones que compensen parte del nuevo impuesto.", efectos:{caja:-3, ebitda:1.5}, consecuencia:"La asesoría tiene costo, pero recupera parte del golpe tributario a través de beneficios legítimos que no estabas aprovechando."}
    ]
  };
}
function MACRO_TRM_COSTOS_USD(s,f,objeto){
  return {
    tipo:'macro', titulo:"Devaluación repentina del peso", titular:"¿Llegó la crisis? El peso se devalúa de un día para otro", impactoAutomatico:{ebitda:-1.5},
    contexto:`La TRM sube 8% de un día para otro, encareciendo de inmediato ${objeto} — el efecto en tu margen de este periodo ya se aplicó.`,
    choices:[
      {texto:"Trasladar el alza a tus precios de inmediato.", efectos:{ebitda:2.5, confianzaProveedores:-2}, consecuencia:"Recuperas margen en pesos, pero generas fricción con clientes que compraron la semana pasada a otro valor."},
      {texto:"Absorber el golpe en el margen de este periodo sin más ajustes.", efectos:{caja:-2}, consecuencia:"Mantienes precios estables, pero tu caja también siente el impacto cambiario."},
      {texto:"Contratar una cobertura cambiaria (forward) para el próximo trimestre.", efectos:{caja:-2, wacc:-0.2}, setFlags:{coberturaCambiaria:true}, consecuencia:"Pagas hoy por certeza futura sobre a qué tasa vas a comprar en los próximos meses."},
      {texto:"Renegociar plazos con tu proveedor en dólares mientras el mercado se estabiliza.", efectos:{confianzaProveedores:-4, capitalTrabajo:2}, consecuencia:"Ganas algo de tiempo antes de asumir el costo completo, a cambio de tensionar esa relación comercial."}
    ]
  };
}

