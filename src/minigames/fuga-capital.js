/* =========================================================================================
   FUGA DE CAPITAL — minijuego de deducción lógica (3 pistas, 4 departamentos, 1 intento)
   ========================================================================================= */
const FUGA_CAPITAL_DEPTS = [
  {id:'ventas', nombre:'Ventas', emoji:'💼'},
  {id:'operaciones', nombre:'Operaciones', emoji:'⚙️'},
  {id:'marketing', nombre:'Marketing', emoji:'📣'},
  {id:'rrhh', nombre:'RRHH', emoji:'👥'}
];
const FUGA_CAPITAL_PISTAS = {
  ventas: [
    "Los gastos de representación y viáticos de un vendedor subieron sospechosamente este trimestre.",
    "Un cliente reportó que le cobraron una comisión que nunca se autorizó.",
    "Las notas de gastos de entretenimiento con clientes no tienen soportes claros.",
    "Se aprobaron descuentos especiales a un solo cliente sin pasar por el comité de precios."
  ],
  operaciones: [
    "Alguien compró equipos o maquinaria sin pasar por el proceso de autorización normal.",
    "El inventario físico no cuadra con lo que dice el sistema desde hace dos meses.",
    "Se pagaron facturas de mantenimiento a un proveedor que nadie reconoce.",
    "Hay órdenes de compra duplicadas para el mismo insumo en la misma semana."
  ],
  marketing: [
    "Una campaña publicitaria se pagó dos veces al mismo proveedor de pauta.",
    "El presupuesto de un evento terminó siendo el triple de lo aprobado, sin explicación.",
    "Se contrató a una agencia externa sin cotizar con nadie más.",
    "Aparecen gastos de 'relaciones públicas' sin ningún evento o entregable asociado."
  ],
  rrhh: [
    "Un empleado que ya no trabaja en la empresa sigue apareciendo en la nómina.",
    "Se pagaron bonos de referido por contrataciones que nunca se formalizaron.",
    "Los gastos de capacitación se dispararon sin que nadie recuerde qué curso se tomó.",
    "Hay reembolsos de gastos médicos aprobados sin ningún soporte adjunto."
  ]
};
function buildFugaCapital(){
  const culpable = pick(FUGA_CAPITAL_DEPTS.map(d=>d.id));
  const pistas = shuffle(FUGA_CAPITAL_PISTAS[culpable].slice()).slice(0,3);
  const montoRecuperado = Math.round((2 + Math.random()*3)*10)/10;
  return {tipo:'fuga_capital', titulo:'Fuga de Capital', culpable, pistas, montoRecuperado};
}
function renderFugaCapital(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card fuga-capital-card screen-fade-in">
      <div class="case-eyebrow" style="color:var(--danger);">🕵️ FUGA DE CAPITAL</div>
      <h2 class="case-title">Alguien está desviando recursos. Un solo intento.</h2>
      <div class="fuga-pistas">
        ${c.pistas.map(p=>`<div class="fuga-pista">🔍 ${p}</div>`).join('')}
      </div>
      <div class="fuga-depts" id="fugaDepts">
        ${FUGA_CAPITAL_DEPTS.map(d=>`<button class="fuga-dept-btn" data-dept="${d.id}"><span class="fuga-dept-emoji">${d.emoji}</span><span>${d.nombre}</span></button>`).join('')}
      </div>
      <div class="fuga-result" id="fugaResult"></div>
    </div>
  `;
  document.querySelectorAll('.fuga-dept-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>resolverFugaCapital(c, btn.dataset.dept));
  });
}
function resolverFugaCapital(c, eleccion){
  document.querySelectorAll('.fuga-dept-btn').forEach(b=>{ b.disabled = true; });
  const acierto = eleccion === c.culpable;
  const deptElegido = FUGA_CAPITAL_DEPTS.find(d=>d.id===eleccion);
  const deptCulpable = FUGA_CAPITAL_DEPTS.find(d=>d.id===c.culpable);

  let efectos, stampClass, stampTexto, mensaje;
  if(acierto){
    efectos = {caja: c.montoRecuperado, reputacion:3};
    stampClass = 'pos'; stampTexto = 'CULPABLE IDENTIFICADO';
    mensaje = `Acertaste: era ${deptCulpable.nombre}. Recuperas ${fmtMoney(c.montoRecuperado)} y tu junta valora la gestión del riesgo interno.`;
  } else {
    efectos = {moralEquipo:-4, reputacion:-2, confianzaProveedores:-1};
    stampClass = 'neg'; stampTexto = 'ACUSACIÓN EQUIVOCADA';
    mensaje = `Acusaste a ${deptElegido.nombre}, pero el verdadero responsable era ${deptCulpable.nombre}. La moral se desploma por la acusación injusta, y la fuga real sigue sin resolverse.`;
  }

  applyEfectos(efectos);
  history.push({titulo:'Fuga de Capital', texto: acierto?'Departamento correcto identificado':'Acusación equivocada a '+deptElegido.nombre, turno:turnNumber, efectos});
  state.healthHistory.push({turno:turnNumber, score:Math.round(healthScore(state)*10)/10, caja:state.caja, ebitda:Math.round(state.ebitda*10)/10, deuda:Math.round(state.deuda*10)/10});
  renderTicker(efectos);

  const resultBox = document.getElementById('fugaResult');
  if(resultBox){
    resultBox.innerHTML = `
      <div class="stamp ${stampClass}">${stampTexto}</div>
      <p class="consequence-text">${mensaje}</p>
      <button class="continue-btn" id="fugaContinueBtn">Continuar →</button>
    `;
    resultBox.classList.add('show');
    document.getElementById('fugaContinueBtn').addEventListener('click', ()=>{
      const forced = checkForcedEnding();
      const esFinal = !!forced || turnNumber >= MAX_TURNS;
      const shake = !acierto || deberiaTemblar(efectos);
      calculandoImpactoYAvanzar(()=>{
        closeTurnModal();
        if(esFinal){ prepararFinDePartida(forced || cierreAnioFiscal()); }
      }, shake, efectos);
    });
  }
}

