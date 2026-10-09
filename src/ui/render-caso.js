function renderTransition(c){
  const g = document.getElementById('turnModalContent');
  const contexto = resaltarGlosario(typeof c.contexto === 'function' ? c.contexto(state, flags) : c.contexto);
  let impactHtml = '';
  if(c.impactoAutomatico){
    const chips = Object.keys(c.impactoAutomatico).map(k=>{
      const v = c.impactoAutomatico[k];
      const money = (k==='caja'||k==='capitalTrabajo'||k==='deuda'||k==='ebitda');
      const kind = money?'money':(k==='diasInventario'?'dias':'num');
      const goodDir = deltaEsSano(k, v);
      return `<span class="impact-chip ${goodDir?'up':'down'}">${KPI_LABEL[k]||k} <span class="impact-arrow">→</span> ${fmtDelta(v,kind)}</span>`;
    }).join('');
    impactHtml = `<div class="impact-preview">${chips}</div>`;
  }

  if(c.tipo === 'macro'){
    const titular = c.titular || c.titulo;
    g.innerHTML = `
      <div class="case-card transicion-macro screen-fade-in">
        <div class="masthead-dateline">Edición especial · Turno ${turnNumber} · ${nombreEmpresaActual()}</div>
        <div class="masthead-kicker">Última hora · Boletín de mercado</div>
        <div class="masthead-headline">${titular}</div>
        <hr class="masthead-rule">
        <p class="masthead-sub">${contexto}</p>
        ${impactHtml}
        <button class="continue-btn" id="verImpactoBtn">Evaluar mi respuesta →</button>
      </div>
    `;
  } else {
    g.innerHTML = `
      <div class="case-card transicion screen-fade-in">
        <div class="headline">📰 Boletín de mercado — turno ${turnNumber}</div>
        <div class="headline-title">${c.titulo}</div>
        <p class="case-context">${contexto}</p>
        ${impactHtml}
        <button class="continue-btn" id="verImpactoBtn">Evaluar mi respuesta →</button>
      </div>
    `;
  }
  document.getElementById('verImpactoBtn').addEventListener('click', ()=>triggerCurtainSweep(()=>renderCase(c)));
  renderTicker(c.impactoAutomatico||null);
}

function renderCase(c){
  registrarTituloReciente(c.titulo);
  if(c.tipo === 'junta') sonidoTimbreJunta();
  if(c.tipo === 'meta_comite') sonidoElComiteObserva();
  const g = document.getElementById('turnModalContent');
  const isEvento = c.tipo !== 'caso';
  const contexto = resaltarGlosario(typeof c.contexto === 'function' ? c.contexto(state, flags) : c.contexto);
  const eyebrowMap = {caso:'Caso · turno '+turnNumber, macro:'Evento macroeconómico', vencimiento:'Vencimiento de obligación', karma:'Consecuencia de tu gestión', random:'Imprevisto operativo', calendario:'Obligación del periodo', junta:'Junta directiva · cierre trimestral', meta_comite:'El Comité'};
  const eyebrowTexto = c.esDecisionExtra ? '⚠ Antes de seguir — esto no puede esperar' : (eyebrowMap[c.tipo]||('Turno '+turnNumber));
  const cardExtra = c.esDecisionExtra ? 'evento' : (c.tipo==='meta_comite' ? 'meta-comite' : (c.tipo==='junta' ? 'junta' : (isEvento?'evento':'')));

  let investBoxHtml = '';
  if(c.investigacion){
    const inv = c.investigacion;
    const puede = state.caja >= inv.costo;
    investBoxHtml = `
      <div class="invest-box">
        <button class="invest-btn" id="investBtn" ${puede?'':'disabled'}>🔍 ${inv.boton}</button>
        <div class="invest-hint">${puede? 'Gastar ahora para reducir la incertidumbre antes de decidir. El reporte trae datos crudos: la lectura es tuya.' : 'No tienes caja suficiente para esta investigación.'}</div>
        <div class="briefing" id="briefing"><b>Informe recibido:</b> ${inv.reporte}</div>
      </div>
    `;
  }

  g.innerHTML = `
    <div class="case-card ${cardExtra} screen-fade-in">
      <div class="case-eyebrow ${cardExtra}">${eyebrowTexto}</div>
      ${c.retrato ? `<img class="case-retrato-mini" src="${c.retrato}" alt="Retrato del personaje" />` : ''}
      <h2 class="case-title">${c.titulo}</h2>
      <p class="case-context">${contexto}</p>
      ${c.contextoHtml || ''}
      ${investBoxHtml}
      <div class="choices" id="choices"></div>
    </div>
  `;

  renderChoices(c);

  if(c.investigacion){
    document.getElementById('investBtn').addEventListener('click', ()=>{
      const inv = c.investigacion;
      if(state.caja < inv.costo) return;
      state.caja -= inv.costo;
      investigado = true;
      contadorInvestigaciones++;
      renderTicker({caja:-inv.costo});
      document.getElementById('briefing').classList.add('show');
      document.getElementById('investBtn').disabled = true;
      document.getElementById('investBtn').textContent = '✓ Información obtenida';
      renderChoices(c);
    });
  }

  renderLog();
  renderTicker(null);
}

function renderChoices(c){
  const wrap = document.getElementById('choices');
  let choices = c.choices.slice();
  if(investigado && c.choiceInformado) choices = choices.concat([Object.assign({informado:true}, c.choiceInformado)]);

  wrap.innerHTML = choices.map((ch,i)=>`
    <button class="choice-btn ${ch.informado?'informado':''}" data-i="${i}">
      <span class="choice-letter">${ch.informado ? '🔍' : String.fromCharCode(65+i)}</span>
      <span>${resaltarGlosario(ch.texto)}</span>
    </button>
  `).join('');

  mostrarFranjaKpi();
  wrap.querySelectorAll('.choice-btn').forEach((btn,idx)=>{
    btn.addEventListener('mouseenter', ()=>pistaDeOpcion(choices[idx]));
    btn.addEventListener('focus', ()=>pistaDeOpcion(choices[idx]));
    btn.addEventListener('mouseleave', limpiarPistaKpi);
    btn.addEventListener('blur', limpiarPistaKpi);
    btn.addEventListener('click', (ev)=>{
      if(ev.target.closest('.glosario-term')) return;
      selectChoice(c, choices[idx]);
    });
  });
}

function selectChoice(c, ch){
  ocultarFranjaKpi();
  const indicadoresAntes = capturarIndicadores();
  document.querySelectorAll('.choice-btn').forEach((b)=>{ b.disabled = true; b.style.pointerEvents='none'; });
  sonidoConfirmacion();

  // Cada decisión pesa más de lo que pesaba antes, y no siempre pesa exactamente igual —
  // la misma elección no da siempre el mismo resultado numérico exacto (inspirado en Reigns).
  const efectosAplicados = amplificarEImpredecir(ch.efectos);

  applyEfectos(efectosAplicados);
  if(ch.setFlags) Object.assign(flags, ch.setFlags);
  if(ch.diferir){
    state.obligaciones.push({monto: ch.diferir.monto, vence: turnNumber + ch.diferir.turnos, motivo: ch.diferir.motivo, tipo: ch.diferir.tipo, pagada:false});
  }
  if(ch.disparar){
    state.scheduledEvents.push({turno: turnNumber + ch.disparar.turnos, build: ch.disparar.evento, consumido:false});
  }
  evaluarEcoDeDecision(efectosAplicados);

  if(sectorActual.requiereCapex){
    if(ch.capex){ state.turnosSinCapex = 0; }
    else {
      state.turnosSinCapex = (state.turnosSinCapex||0) + 1;
      if(state.turnosSinCapex >= 3){
        state.ebitda -= 2;
        systemicNotes.push("Llevas varios turnos sin invertir en mantenimiento de equipos: el desgaste ya afecta la experiencia del servicio y eso golpea tu <b>EBITDA (-2)</b>.");
        state.turnosSinCapex = 0;
      }
    }
  }

  history.push({titulo:c.titulo, texto:ch.texto, turno:turnNumber, efectos: efectosAplicados});
  state.healthHistory.push({turno:turnNumber, score:Math.round(healthScore(state)*10)/10, caja:state.caja, ebitda:Math.round(state.ebitda*10)/10, deuda:Math.round(state.deuda*10)/10});

  const score = (efectosAplicados.ebitda||0) + (efectosAplicados.confianzaBanco||0)*0.3 + (efectosAplicados.confianzaProveedores||0)*0.3 + (efectosAplicados.reputacion||0)*0.2 - (efectosAplicados.wacc||0)*2 - (efectosAplicados.deuda||0)*0.1 + (efectosAplicados.razonCorriente||0)*4 - (efectosAplicados.diasInventario||0)*0.05;
  const stampClass = score > 2 ? 'pos' : (score < -2 ? 'neg' : 'neu');
  const stampText = score > 2 ? 'Decisión que fortalece el balance' : (score < -2 ? 'Costo estructural asumido' : 'Compromiso con doble filo');

  const chipOrder = ['caja','capitalTrabajo','razonCorriente','deuda','ebitda','wacc','diasInventario','confianzaProveedores','confianzaBanco','reputacion','moralEquipo'];

  const explainItems = chipOrder.filter(k=>efectosAplicados[k] && EXPLAIN[k]).map(k=>`<div class="explain-item"><b>${KPI_LABEL[k]}:</b> ${EXPLAIN[k]}</div>`).join('');
  const explainSystemic = systemicNotes.map(n=>`<div class="explain-item">${n}</div>`).join('');
  const explainHtml = explainItems + explainSystemic || '<div class="explain-item">Esta decisión no tuvo un efecto numérico directo sobre tus indicadores.</div>';

  const balanceHtml = balanceDecisionHTML(indicadoresAntes, efectosAplicados);
  renderLog();
  triggerCurtainSweep(()=>renderResultScreen(c, ch, efectosAplicados, stampClass, stampText, balanceHtml, explainHtml));
}

function renderResultScreen(c, ch, efectosAplicados, stampClass, stampText, balanceHtml, explainHtml){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="result-card ${stampClass} screen-fade-in">
      <div class="result-recordatorio">Elegiste: ${ch.informado ? '🔍 ' : ''}${ch.texto}</div>
      <div class="stamp result-stamp ${stampClass}">${stampText}</div>
      <p class="consequence-text">${ch.consecuencia}</p>
      ${balanceHtml}
      <button class="explain-toggle" id="explainToggle">ⓘ ¿Por qué tuvo este efecto?</button>
      <div class="explain-panel" id="explainPanel">${explainHtml}</div>
      <div><button class="continue-btn" id="continueBtn">Continuar →</button></div>
    </div>
  `;

  if(balanceHtml) animarBalanceDecision();
  sonidoResultado(stampClass);
  document.getElementById('explainToggle').addEventListener('click', ()=>{ document.getElementById('explainPanel').classList.toggle('show'); });
  document.getElementById('continueBtn').addEventListener('click', ()=>{
    if(c.tipo === 'junta' && ultimaEvaluacionMeta){
      const evaluacionAMostrar = ultimaEvaluacionMeta;
      ultimaEvaluacionMeta = null; // evita mostrarla dos veces si se vuelve a hacer clic
      renderMetaScreen(evaluacionAMostrar, ()=>continuarTrasResultado(c, efectosAplicados));
      return;
    }
    continuarTrasResultado(c, efectosAplicados);
  });
}

function continuarTrasResultado(c, efectosAplicados){
  if(!flags.decisionExtraUsadaEsteTurno){
    const extra = elegirDecisionExtra();
    if(extra){
      flags.decisionExtraUsadaEsteTurno = true;
      contadorDecisionesExtra++;
      currentCase = extra;
      mostrarCaso(extra);
      return;
    }
  }
  const forced = checkForcedEnding();
  const esFinal = !!forced || turnNumber >= MAX_TURNS;
  const shake = deberiaTemblar(efectosAplicados);
  calculandoImpactoYAvanzar(()=>{
    closeTurnModal();
    if(esFinal){ prepararFinDePartida(forced || cierreAnioFiscal()); }
  }, shake, efectosAplicados);
}

// Narrativa de la meta trimestral: qué esperaba la junta, qué pasó, y qué exige ahora.
function narrativaMeta(evaluacion){
  const { cumplida, objetivoFmt, actualFmt, metaAnterior, metaNueva } = evaluacion;
  const etiquetaAnterior = (META_ETIQUETAS[metaAnterior.indicador]||metaAnterior.indicador).toLowerCase();
  const etiquetaNueva = (META_ETIQUETAS[metaNueva.indicador]||metaNueva.indicador).toLowerCase();
  const objetivoNuevoFmt = fmtMetaValor(metaNueva.indicador, metaNueva.valorObjetivo);
  let parrafo;
  if(cumplida){
    parrafo = `La junta directiva revisa el trimestre con satisfacción: la meta de llevar ${etiquetaAnterior} hasta ${objetivoFmt} se cumplió — cerraste en ${actualFmt}. Reconocen el resultado con un pequeño respaldo a tu reputación.`;
  } else {
    parrafo = `La junta directiva revisa el trimestre con preocupación: esperaban ${etiquetaAnterior} en ${objetivoFmt}, y cerraste en ${actualFmt}. No es una sanción severa, pero la confianza se resiente un poco.`;
  }
  parrafo += ` Para el próximo trimestre, el mandato es claro: llevar ${etiquetaNueva} hasta ${objetivoNuevoFmt} antes del turno ${metaNueva.turnoLimite}.`;
  return parrafo;
}
// Narrativa de la PRIMERA meta de la partida — antes de la primera decisión, sin nada
// todavía que evaluar.
function narrativaMetaInicial(meta){
  const etiqueta = (META_ETIQUETAS[meta.indicador]||meta.indicador).toLowerCase();
  const objetivoFmt = fmtMetaValor(meta.indicador, meta.valorObjetivo);
  return `Antes de tu primera decisión, la junta directiva se reúne para fijar el mandato del primer trimestre: llevar ${etiqueta} hasta ${objetivoFmt} antes del turno ${meta.turnoLimite}. A partir de aquí, cada decisión que tomes cuenta para ese objetivo.`;
}
// Cuando un caso trae retrato de personaje, se muestra primero una pantalla de presentación
// (imagen + una línea corta de contexto) antes de la pantalla real de decisión — el mismo
// patrón de dos pasos que ya usa la junta directiva, aplicado a cualquier personaje.
function renderPersonajeIntro(caso, callback){
  const g = document.getElementById('turnModalContent');
  const presentacion = caso.presentacion || caso.titulo + '.';
  g.innerHTML = `
    <div class="result-card screen-fade-in">
      <div class="personaje-hero">
        <div class="personaje-hero-glow"></div>
        <img class="case-retrato-grande" src="${caso.retrato}" alt="Retrato del personaje" />
        <div class="personaje-hero-nombre">${caso.titulo}</div>
      </div>
      <p class="consequence-text">${presentacion}</p>
      <div><button class="continue-btn" id="personajeContinueBtn">Continuar →</button></div>
    </div>
  `;
  document.getElementById('personajeContinueBtn').addEventListener('click', callback);
}
function mostrarCaso(caso){
  if(caso.retrato){
    renderPersonajeIntro(caso, ()=>renderCase(caso));
  } else {
    renderCase(caso);
  }
}
function renderMetaScreen(datos, callbackContinuar){
  const g = document.getElementById('turnModalContent');
  const esInicial = !datos.metaAnterior;
  const texto = esInicial ? narrativaMetaInicial(datos.metaNueva) : narrativaMeta(datos);
  const mandatoHtml = (esInicial && mandatoInicial) ? `
    <div class="mandato-inicial-box">
      <div class="mandato-inicial-titulo">Mandato del año fiscal: ${mandatoInicial.titulo}</div>
      <p class="mandato-inicial-desc">${mandatoInicial.desc}</p>
    </div>
  ` : '';
  g.innerHTML = `
    <div class="result-card meta-screen screen-fade-in">
      <img class="meta-screen-img" src="${COMITE_IMG_BASE64}" alt="La Junta Directiva de El Comité" />
      <div class="result-recordatorio">EL COMITÉ SE REÚNE</div>
      <p class="consequence-text">${texto}</p>
      ${mandatoHtml}
      <div><button class="continue-btn" id="metaContinueBtn">Continuar →</button></div>
    </div>
  `;
  document.getElementById('metaContinueBtn').addEventListener('click', callbackContinuar);
}

// Genera los chips de cambio numérico para CUALQUIER combinación de indicadores —
// a diferencia de las listas fijas (chipOrder) que ya existían para un par de minijuegos
// puntuales, esta cubre los 13 indicadores del juego, para reutilizar en la bitácora.
