/* =========================================================
   RETROALIMENTACIÓN: TU MAYOR ERROR FINANCIERO DE LA PARTIDA
   ========================================================= */
const CONSEJOS_KPI = {
  razonCorriente: "En administración financiera esto se llama <b>descalce de plazos</b>: aceptaste (o generaste) condiciones de pago más largas de las que tu propio ciclo de caja podía sostener. La lección técnica es simple — nunca cedas más plazo del que puedes financiar tú mismo.",
  wacc: "Dejaste que tu <b>costo de capital</b> subiera sin que la decisión generara un retorno que lo compensara. Cada punto adicional de WACC es un costo permanente: solo vale la pena asumirlo cuando el retorno esperado lo supera con margen real, no solo en el papel.",
  deuda: "Te apalancaste en un momento en que tu capacidad de pago ya estaba comprometida. La <b>deuda 'barata'</b> solo es barata si tu flujo de caja futuro puede sostenerla sin sobresaltos — el costo nominal casi nunca es el costo real.",
  confianzaProveedores: "Sacrificaste una relación comercial de largo plazo por liquidez de corto plazo. La <b>confianza de tus proveedores</b> funciona, en la práctica, como una línea de crédito informal: gastarla tiene el mismo costo que gastar cualquier otra fuente de financiamiento.",
  confianzaBanco: "Erosionaste la <b>confianza de tu banco</b> justo cuando más ibas a necesitarla. Esa confianza determina si tu próximo crédito llega a tiempo y a qué costo — no es un indicador simbólico.",
  reputacion: "Priorizaste un resultado numérico inmediato sobre la confianza de tu junta y tus grupos de interés. La <b>reputación</b> es un activo intangible que financia tus decisiones futuras: quemarla hoy encarece todo lo que necesites negociar mañana.",
  ebitda: "El golpe más fuerte de la partida vino directo de tu <b>rentabilidad operativa</b>. Vale la pena revisar si esa salida de caja tuvo una contrapartida real en valor, o si fue solo un costo sin retorno.",
  diasInventario: "Dejaste que el <b>inventario</b> se acumulara más de lo que tu ciclo de ventas podía absorber. Cada día adicional de inventario es capital de trabajo atrapado, dejando de estar disponible para pagar otra cosa.",
  caja: "El golpe vino de una obligación que en algún momento decidiste aplazar, y que terminó costando más cuando finalmente venció. <b>Aplazar un pago no lo elimina</b>: solo le agrega el costo de la espera."
};

function severidadNegativa(e){
  if(!e) return 0;
  return Math.max(0,
    -(e.ebitda||0) * 1 +
    -(e.reputacion||0) * 0.4 +
    -(e.confianzaProveedores||0) * 0.3 +
    -(e.confianzaBanco||0) * 0.3 +
    (e.wacc||0) * 2 +
    (e.deuda||0) * 0.15 +
    -(e.razonCorriente||0) * 6 +
    (e.diasInventario||0) * 0.08 +
    -(e.caja||0) * 0.3
  );
}
function severidadPositiva(e){
  if(!e) return 0;
  return Math.max(0,
    (e.ebitda||0) * 1 +
    (e.reputacion||0) * 0.4 +
    (e.confianzaProveedores||0) * 0.3 +
    (e.confianzaBanco||0) * 0.3 +
    -(e.wacc||0) * 2 +
    -(e.deuda||0) * 0.15 +
    (e.razonCorriente||0) * 6 +
    -(e.diasInventario||0) * 0.08 +
    (e.caja||0) * 0.3
  );
}
function mayorAciertoFinanciero(){
  const conEfectos = history.filter(h=>h.efectos && Object.keys(h.efectos).length);
  if(!conEfectos.length) return null;

  let mejor = conEfectos[0], mejorScore = severidadPositiva(conEfectos[0].efectos);
  conEfectos.forEach(h=>{
    const sc = severidadPositiva(h.efectos);
    if(sc > mejorScore){ mejor = h; mejorScore = sc; }
  });

  if(mejorScore <= 1) return null;

  return `Tu decisión más acertada fue en el turno ${mejor.turno}, en "${mejor.titulo}": <i>"${mejor.texto}"</i>.`;
}

function mayorErrorFinanciero(){
  const conEfectos = history.filter(h=>h.efectos && Object.keys(h.efectos).length);
  if(!conEfectos.length) return "No hubo suficientes decisiones con impacto medible para señalar un error dominante en esta partida.";

  let peor = conEfectos[0], peorScore = severidadNegativa(conEfectos[0].efectos);
  conEfectos.forEach(h=>{
    const sc = severidadNegativa(h.efectos);
    if(sc > peorScore){ peor = h; peorScore = sc; }
  });

  if(peorScore <= 1){
    return "No hubo un error dominante y aislado: tu gestión fue razonablemente pareja a lo largo de la partida, sin una sola decisión que concentrara el daño.";
  }

  const e = peor.efectos;
  const contribuciones = {
    razonCorriente: -(e.razonCorriente||0)*6, wacc: (e.wacc||0)*2, deuda: (e.deuda||0)*0.15,
    confianzaProveedores: -(e.confianzaProveedores||0)*0.3, confianzaBanco: -(e.confianzaBanco||0)*0.3,
    reputacion: -(e.reputacion||0)*0.4, ebitda: -(e.ebitda||0)*1,
    diasInventario: (e.diasInventario||0)*0.08, caja: -(e.caja||0)*0.3
  };
  const kpiDominante = Object.keys(contribuciones).reduce((a,b)=> contribuciones[b]>contribuciones[a] ? b : a);
  const consejo = CONSEJOS_KPI[kpiDominante] || "Revisa el efecto conjunto de esta decisión sobre tus indicadores: fue, en el neto, la más costosa de la partida.";

  return `Tu decisión más costosa fue en el turno ${peor.turno}, en "${peor.titulo}": <i>"${peor.texto}"</i>. ${consejo}`;
}

