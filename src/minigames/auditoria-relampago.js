/* =========================================================================================
   AUDITORÍA RELÁMPAGO — minijuego de tiempo (Papers, Please / Reigns)
   ========================================================================================= */
function generarFactura(esValido){
  const proveedores = ['Suministros del Valle S.A.S.','Distribuidora Andina Ltda.','Comercial San Marcos','Insumos y Materiales del Norte','Grupo Logístico Central'];
  const conceptos = ['Compra de insumos operativos','Mantenimiento de equipos','Suministro de materia prima','Servicios de transporte','Compra de material de oficina'];
  const proveedor = pick(proveedores);
  const concepto = pick(conceptos);
  const subtotal = Math.round((0.5 + Math.random()*4.5)*100)/100;
  const iva = Math.round(subtotal*0.19*100)/100;
  const totalCorrecto = Math.round((subtotal+iva)*100)/100;
  let totalMostrado = totalCorrecto;
  let homologado = true;
  let errorTipo = null, explicacion;

  if(!esValido){
    if(Math.random() < 0.5){
      errorTipo = 'total';
      totalMostrado = Math.round((totalCorrecto + pick([0.05,0.08,-0.06,0.12,-0.09]))*100)/100;
      explicacion = `La suma no cuadra: Subtotal (${fmtMoney(subtotal)}) + IVA (${fmtMoney(iva)}) debería dar ${fmtMoney(totalCorrecto)}, pero el documento muestra ${fmtMoney(totalMostrado)}. Diferencias pequeñas como esta son la forma más común de inflar una factura sin que salte a la vista.`;
    } else {
      errorTipo = 'homologacion';
      homologado = false;
      explicacion = `El proveedor "${proveedor}" figura como NO HOMOLOGADO. Pagarle salta todos los controles de debida diligencia — es justo el patrón que usa un esquema de facturación falsa: un proveedor que nadie verificó.`;
    }
  } else {
    explicacion = `El documento está en orden: Subtotal (${fmtMoney(subtotal)}) + IVA (${fmtMoney(iva)}) cuadra exactamente con el total (${fmtMoney(totalCorrecto)}), y el proveedor está homologado.`;
  }

  return {
    tipo:'factura', titulo:'Factura de Proveedor', kpiFriccion:'confianzaProveedores',
    campos:[
      {label:'Proveedor', value:proveedor, flag:false},
      {label:'Concepto', value:concepto, flag:false},
      {label:'Subtotal', value:fmtMoney(subtotal), flag:false},
      {label:'IVA (19%)', value:fmtMoney(iva), flag:false},
      {label:'TOTAL', value:fmtMoney(totalMostrado), flag: errorTipo==='total'},
      {label:'Estado homologación', value: homologado?'HOMOLOGADO':'NO HOMOLOGADO', flag: errorTipo==='homologacion'}
    ],
    esValido, errorTipo, explicacion
  };
}

function generarViaticos(esValido){
  const empleados = ['Camila Restrepo','Andrés Salazar','Juliana Gómez','Mauricio Peña','Laura Jiménez'];
  const conceptos = ['Viaje comercial a Medellín','Capacitación en Bogotá','Visita a planta de proveedor','Feria del sector en Cali'];
  const empleado = pick(empleados);
  const concepto = pick(conceptos);
  const dias = Math.floor(2 + Math.random()*4);
  const valorDia = Math.round((0.15 + Math.random()*0.15)*100)/100;
  const totalCorrecto = Math.round(dias*valorDia*100)/100;
  let totalMostrado = totalCorrecto;
  let autorizadoPor = 'Gerencia Administrativa';
  let errorTipo = null, explicacion;

  if(!esValido){
    if(Math.random() < 0.5){
      errorTipo = 'total';
      totalMostrado = Math.round((totalCorrecto + pick([0.1,0.15,-0.12,0.2,-0.08]))*100)/100;
      explicacion = `El total no coincide: ${dias} días × ${fmtMoney(valorDia)} debería dar ${fmtMoney(totalCorrecto)}, pero el reporte muestra ${fmtMoney(totalMostrado)}.`;
    } else {
      errorTipo = 'autorizacion';
      autorizadoPor = 'Sin autorización registrada';
      explicacion = `El campo "Autorizado por" está vacío. Un reporte de viáticos sin autorización formal es una de las formas más simples de colar un gasto que nadie aprobó.`;
    }
  } else {
    explicacion = `El reporte está en orden: ${dias} días × ${fmtMoney(valorDia)} = ${fmtMoney(totalCorrecto)}, y cuenta con autorización registrada.`;
  }

  return {
    tipo:'viaticos', titulo:'Reporte de Viáticos', kpiFriccion:'moralEquipo',
    campos:[
      {label:'Empleado', value:empleado, flag:false},
      {label:'Concepto', value:concepto, flag:false},
      {label:'Días', value:dias+' días', flag:false},
      {label:'Valor por día', value:fmtMoney(valorDia), flag:false},
      {label:'TOTAL', value:fmtMoney(totalMostrado), flag: errorTipo==='total'},
      {label:'Autorizado por', value:autorizadoPor, flag: errorTipo==='autorizacion'}
    ],
    esValido, errorTipo, explicacion
  };
}

function generarBalanceDoc(esValido){
  const ingresos = Math.round((15+Math.random()*20)*10)/10;
  const egresos = Math.round((10+Math.random()*12)*10)/10;
  const resultadoCorrecto = Math.round((ingresos-egresos)*10)/10;
  let resultadoMostrado = resultadoCorrecto;
  let errorTipo = null, explicacion;

  if(!esValido){
    errorTipo = 'total';
    resultadoMostrado = Math.round((resultadoCorrecto + pick([0.5,0.8,-0.6,1.1,-0.9]))*10)/10;
    explicacion = `El resultado neto no cuadra: Ingresos (${fmtMoney(ingresos)}) − Egresos (${fmtMoney(egresos)}) debería dar ${fmtMoney(resultadoCorrecto)}, pero el balance muestra ${fmtMoney(resultadoMostrado)}. Un balance que no cuadra suele significar que algo se registró dos veces, o que algo no se registró en absoluto.`;
  } else {
    explicacion = `El balance está en orden: Ingresos (${fmtMoney(ingresos)}) − Egresos (${fmtMoney(egresos)}) = ${fmtMoney(resultadoCorrecto)}, exactamente lo que muestra el resultado neto.`;
  }

  return {
    tipo:'balance', titulo:'Balance Mensual Resumido', kpiFriccion:'confianzaProveedores',
    campos:[
      {label:'Ingresos del mes', value:fmtMoney(ingresos), flag:false},
      {label:'Egresos del mes', value:fmtMoney(egresos), flag:false},
      {label:'Resultado neto', value:fmtMoney(resultadoMostrado), flag: errorTipo==='total'}
    ],
    esValido, errorTipo, explicacion
  };
}

function generarDocumentoAuditoria(){
  const esValido = Math.random() < 0.5;
  const generador = pick([generarFactura, generarViaticos, generarBalanceDoc]);
  return generador(esValido);
}

function buildAuditoriaRelampago(){
  return { tipo:'auditoria', titulo:'Auditoría Relámpago', documento: generarDocumentoAuditoria() };
}

function renderDocBody(doc, revelar){
  return doc.campos.map(f=>`<div class="doc-row ${revelar && f.flag ? 'doc-row-error':''}"><span class="doc-label">${f.label}</span><span class="doc-value">${f.value}</span></div>`).join('');
}

let auditoriaTimerInterval = null;
function renderAuditoria(c){
  if(auditoriaTimerInterval){ clearInterval(auditoriaTimerInterval); auditoriaTimerInterval = null; }
  const doc = c.documento;
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card auditoria-card screen-fade-in">
      <div class="case-eyebrow" style="color:var(--danger);">⚡ Auditoría Relámpago · turno ${turnNumber}</div>
      <h2 class="case-title">Revisa el documento antes de que se acabe el tiempo</h2>
      <div class="timer-bar-wrap"><div class="timer-bar-fill" id="timerBarFill"></div></div>
      <div class="timer-label" id="timerLabel">20s</div>
      <div class="documento-financiero">
        <div class="doc-header">📄 ${doc.titulo}</div>
        <div class="doc-body">${renderDocBody(doc, false)}</div>
      </div>
      <div class="auditoria-buttons">
        <button class="audit-btn approve" id="aprobarBtn">✅ APROBAR</button>
        <button class="audit-btn reject" id="rechazarBtn">❌ RECHAZAR</button>
      </div>
      <div class="auditoria-result" id="auditoriaResult"></div>
    </div>
  `;
  document.getElementById('aprobarBtn').addEventListener('click', ()=>resolverAuditoria(doc,'aprobar'));
  document.getElementById('rechazarBtn').addEventListener('click', ()=>resolverAuditoria(doc,'rechazar'));

  const totalMs = 20000;
  const startTime = Date.now();
  auditoriaTimerInterval = setInterval(()=>{
    const elapsed = Date.now()-startTime;
    const remaining = Math.max(0, totalMs-elapsed);
    const pct = (remaining/totalMs)*100;
    const fill = document.getElementById('timerBarFill');
    const label = document.getElementById('timerLabel');
    if(fill){
      fill.style.width = pct+'%';
      fill.style.background = pct<25 ? 'var(--danger)' : (pct<55 ? 'var(--gold)' : 'var(--teal)');
    }
    if(label) label.textContent = Math.ceil(remaining/1000)+'s';
    if(remaining<=0){
      clearInterval(auditoriaTimerInterval); auditoriaTimerInterval = null;
      resolverAuditoria(doc, 'omision');
    }
  }, 100);
}

function resolverAuditoria(doc, accion){
  if(auditoriaTimerInterval){ clearInterval(auditoriaTimerInterval); auditoriaTimerInterval = null; }
  const aprobarBtn = document.getElementById('aprobarBtn');
  const rechazarBtn = document.getElementById('rechazarBtn');
  if(aprobarBtn) aprobarBtn.disabled = true;
  if(rechazarBtn) rechazarBtn.disabled = true;

  let efectos = {}, stampTexto = '', stampClass = 'neu', explicacionFinal = '';
  const kpiFriccion = doc.kpiFriccion;

  if(accion === 'aprobar'){
    if(doc.esValido){
      efectos = {reputacion:1};
      stampTexto = 'APROBADO — CRITERIO CORRECTO'; stampClass = 'pos';
      explicacionFinal = `Hiciste bien en aprobarlo. ${doc.explicacion}`;
    } else {
      efectos = {caja:-1, wacc:0.3, reputacion:-1};
      stampTexto = 'MULTA — DOCUMENTO FALSO APROBADO'; stampClass = 'neg';
      explicacionFinal = `Este documento tenía un error. ${doc.explicacion}`;
    }
  } else if(accion === 'rechazar'){
    if(!doc.esValido){
      efectos = {reputacion:2};
      stampTexto = 'RECHAZADO — CRITERIO CORRECTO'; stampClass = 'pos';
      explicacionFinal = `Hiciste bien en rechazarlo. ${doc.explicacion}`;
    } else {
      efectos = {}; efectos[kpiFriccion] = -2;
      stampTexto = 'FRICCIÓN OPERATIVA — ERA VÁLIDO'; stampClass = 'neg';
      explicacionFinal = `Este documento en realidad estaba en orden. ${doc.explicacion}`;
    }
  } else { // omision (se acabó el tiempo)
    if(doc.esValido){
      efectos = {};
      stampTexto = 'APROBADO POR OMISIÓN'; stampClass = 'neu';
      explicacionFinal = `Se acabó el tiempo, pero por suerte el documento era correcto. ${doc.explicacion}`;
    } else {
      efectos = {caja:-1, wacc:0.3, reputacion:-1};
      stampTexto = 'MULTA POR OMISIÓN'; stampClass = 'neg';
      explicacionFinal = `Se acabó el tiempo y el documento tenía un error que no alcanzaste a detectar. ${doc.explicacion}`;
    }
  }

  applyEfectos(efectos);
  history.push({titulo:'Auditoría Relámpago · '+doc.titulo, texto:stampTexto, turno:turnNumber, efectos});
  state.healthHistory.push({turno:turnNumber, score:Math.round(healthScore(state)*10)/10, caja:state.caja, ebitda:Math.round(state.ebitda*10)/10, deuda:Math.round(state.deuda*10)/10});
  renderTicker(efectos);

  const docBody = document.querySelector('.documento-financiero .doc-body');
  if(docBody) docBody.innerHTML = renderDocBody(doc, true);

  const resultBox = document.getElementById('auditoriaResult');
  if(resultBox){
    resultBox.innerHTML = `
      <div class="stamp ${stampClass}">${stampTexto}</div>
      <p class="consequence-text">${explicacionFinal}</p>
      <button class="continue-btn" id="auditoriaContinueBtn">Continuar →</button>
    `;
    resultBox.classList.add('show');
    document.getElementById('auditoriaContinueBtn').addEventListener('click', ()=>{
      const forced = checkForcedEnding();
      const esFinal = !!forced || turnNumber >= MAX_TURNS;
      const shake = deberiaTemblar(efectos);
      calculandoImpactoYAvanzar(()=>{
        closeTurnModal();
        if(esFinal){ prepararFinDePartida(forced || cierreAnioFiscal()); }
      }, shake, efectos);
    });
  }
}

