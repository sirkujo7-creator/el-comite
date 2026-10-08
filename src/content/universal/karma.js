const KARMA_CASES = [
  { id:'llamadaBanco', trigger:(s)=>s.deuda>25,
    build:(s,f)=>({
      tipo:'karma', titulo:"Llamada del banco",
      contexto:"Tu oficial de cuenta te llama: tu endeudamiento superó el límite interno que el banco maneja para clientes de tu perfil. Te exige un abono extraordinario a capital o congelará tu cupo de sobregiro.",
      choices:[
        {texto:"Hacer el abono extraordinario exigido de inmediato.", efectos:{caja:-6, deuda:-6, confianzaBanco:8},
         consecuencia:"El banco reconoce el gesto y tu relación mejora, aunque sacrificaste liquidez inmediata para lograrlo."},
        {texto:"Negociar un plazo de gracia de dos meses antes del abono.", efectos:{wacc:0.8, confianzaBanco:-5},
         consecuencia:"Ganas tiempo, pero el banco encarece las condiciones mientras tanto: la flexibilidad casi nunca es gratis."},
        {texto:"Aceptar que congelen el cupo de sobregiro y seguir operando sin tocar la deuda.", efectos:{confianzaBanco:-15}, setFlags:{sobregiroCongelado:true},
         consecuencia:"No mueves un peso hoy, pero perdiste tu colchón de liquidez de emergencia justo cuando más podrías necesitarlo."},
        {texto:"Proponer convertir parte de la deuda en un crédito sindicado con mejores garantías y plazo más largo.", efectos:{wacc:-0.4, confianzaBanco:5, caja:-3},
         consecuencia:"Reestructurar toma esfuerzo y algo de caja en el proceso, pero termina siendo más barato que ambos caminos anteriores en el mediano plazo."}
      ]
    })
  },
  { id:'proveedorExigeGarantias', trigger:(s)=>s.confianzaProveedores<=40,
    build:(s,f)=>({
      tipo:'karma', titulo:"Tus proveedores exigen garantías",
      contexto:"La confianza de tus proveedores está en mínimos. Te comunican que, de ahora en adelante, solo despacharán contra pago anticipado o carta de crédito — nada de plazo.",
      choices:[
        {texto:"Aceptar pagar de contado anticipado en adelante.", efectos:{capitalTrabajo:-4, confianzaProveedores:15},
         consecuencia:"Recuperas la relación, pero tu ciclo de caja se vuelve más exigente: ya no financias tu operación con plazo de proveedor."},
        {texto:"Tramitar una carta de crédito con el banco como garantía.", efectos:{caja:-2, deuda:4, wacc:0.3, confianzaProveedores:12},
         consecuencia:"El banco respalda la operación, pero eso también es deuda nueva con su propio costo."},
        {texto:"Buscar proveedores nuevos dispuestos a dar plazo, aunque cobren más caro.", efectos:{ebitda:-2, confianzaProveedores:5},
         consecuencia:"Diversificas la dependencia, pero pagas un sobrecosto permanente por conseguir condiciones más flexibles."},
        {texto:"Ofrecer a los proveedores actuales una alianza de exclusividad a cambio de recuperar el plazo.", efectos:{confianzaProveedores:18, ebitda:-1},
         consecuencia:"Recuperas la confianza sin tocar tu caja ni tu deuda, aunque quedas comprometido a no comprarle a nadie más mientras dure el acuerdo."}
      ]
    })
  },
  { id:'planDeChoque', trigger:(s)=>s.ebitda<=0,
    build:(s,f)=>({
      tipo:'karma', titulo:"La junta de socios exige un plan de choque",
      contexto:"Tu EBITDA acumulado quedó en terreno negativo. La junta te convoca de urgencia: quiere ver un plan concreto de recuperación, no otro trimestre de explicaciones.",
      choices:[
        {texto:"Proponer un recorte generalizado de gastos en toda la operación.", efectos:{ebitda:4, confianzaProveedores:-5, confianzaBanco:3},
         consecuencia:"El ajuste es duro y transversal, pero manda una señal clara de disciplina hacia adentro y hacia afuera."},
        {texto:"Pedir a los socios una capitalización de emergencia.", efectos:{caja:8},
         consecuencia:"Los socios inyectan capital fresco sin que la empresa tenga que endeudarse, aunque a costa de diluir el retorno esperado de cada uno."},
        {texto:"Vender activos no estratégicos para generar caja rápida.", efectos:{caja:6, capitalTrabajo:-2, ebitda:1},
         consecuencia:"Consigues liquidez inmediata sin pedir nada a nadie, aunque te desprendes de algo que en otro momento hubiera sido útil conservar."},
        {texto:"Convocar a todos los acreedores para una renegociación integral de condiciones.", efectos:{wacc:-0.5, confianzaBanco:-5, confianzaProveedores:-5, deuda:-3},
         consecuencia:"Es la solución más completa, pero también la más incómoda: sientas a todos tus acreedores en la misma mesa a discutir que las condiciones actuales no son sostenibles."}
      ]
    })
  }
];

