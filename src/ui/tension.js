/* =========================================================
   TENSIÓN PSICOLÓGICA: viñeta de estrés + screen shake
   ========================================================= */
function actualizarVineta(){
  const vig = document.getElementById('stressVignette');
  if(!vig || !sectorActual) return;
  vig.classList.remove('stress-high','stress-critical');
  const cajaCritica = state.caja <= 5;
  const cajaBaja = state.caja <= 15;
  const waccCritico = state.wacc >= 20;
  const waccAlto = state.wacc >= 16;
  if(cajaCritica || waccCritico){
    vig.classList.add('stress-critical');
  } else if(cajaBaja || waccAlto){
    vig.classList.add('stress-high');
  }
}
function deberiaTemblar(efectos){
  if(!efectos) return false;
  if((efectos.caja||0) <= -6) return true;
  const claves = ['confianzaProveedores','confianzaBanco','reputacion','moralEquipo'];
  for(const k of claves){
    if(state[k]!=null && statusPill(state[k]).tier === 'critico') return true;
  }
  return false;
}
function activarShakeSiAplica(shouldShake){
  if(!shouldShake) return;
  const wrap = document.querySelector('.wrap');
  if(!wrap) return;
  wrap.classList.remove('shake');
  void wrap.offsetWidth;
  wrap.classList.add('shake');
  setTimeout(()=>wrap.classList.remove('shake'), 450);
}
// Un sacrificio de caja o EBITDA que viene acompañado de una mejora real en otro indicador
// (más EBITDA futuro, mejor capital de trabajo, más confianza, etc.) no es una pérdida pura
// — es una inversión con posibilidad de retorno. Se distingue con su propio color, ni verde
// ni rojo.
function tieneContrapartidaPositiva(efectos, keyExcluir){
  return Object.keys(efectos).some(k=>{
    if(k === keyExcluir) return false;
    const delta = efectos[k];
    if(!delta) return false;
    return deltaEsSano(k, delta);
  });
}
function flashKpiCards(efectos){
  if(!efectos) return;
  TODOS_LOS_KPIS_VISUALES.forEach(key=>{
    const delta = efectos[key];
    if(!delta) return;
    const esRelacional = ['confianzaProveedores','confianzaBanco','reputacion','moralEquipo'].includes(key);
    const selector = esRelacional ? '.rel-chip[data-tip="'+key+'"]' : '.stat[data-kpi="'+key+'"]';
    const card = document.querySelector(selector);
    if(!card) return;
    const bueno = deltaEsSano(key, delta);
    const esPasivo = origenUltimoCambio[key] === 'pasivo';
    const esInversion = !bueno && ['caja','ebitda'].includes(key) && tieneContrapartidaPositiva(efectos, key);
    ['flash-bg-good','flash-bg-bad','flash-bg-pasivo','flash-bg-inversion'].forEach(c=>card.classList.remove(c));
    void card.offsetWidth;
    card.classList.add(esInversion ? 'flash-bg-inversion' : esPasivo ? 'flash-bg-pasivo' : (bueno?'flash-bg-good':'flash-bg-bad'));
    setTimeout(()=>card.classList.remove('flash-bg-good','flash-bg-bad','flash-bg-pasivo','flash-bg-inversion'), 800);
    const kd = KPI_DEFS.find(d=>d.key===key);
    mostrarNumeroFlotante(selector, delta, kd?kd.kind:'num', bueno, esInversion);
  });
}

function saludTier(){
  const h = healthScore(state);
  if(h >= 70) return 'good';
  if(h <= 25) return 'critical';
  return 'neutral';
}

function renderTicker(deltas){
  actualizarDroneCriticoSegunSalud();
  renderMetaJuntaLine();
  const defs = KPI_DEFS.filter(d=> (d.key!=='diasInventario' && d.key!=='valorInventario') || sectorActual.tieneInventario);
  const mitad = Math.ceil(defs.length/2);
  const izquierda = defs.slice(0, mitad);
  const derecha = defs.slice(mitad);

  function renderMitad(lista, targetId){
    const el = document.getElementById(targetId);
    if(!el) return;
    el.className = 'ticker salud-' + saludTier();
    el.innerHTML = lista.map(d=>{
      const val = d.key === 'cce' ? calcularCCE() : state[d.key];
      const delta = deltas ? deltas[d.key] : 0;
      let deltaHtml = '';
      let flashClass = '';
      if(delta){
        const goodDir = deltaEsSano(d.key, delta);
        deltaHtml = `<span class="stat-delta show ${goodDir?'up':'down'}">${fmtDelta(delta, d.kind)}</span>`;
        flashClass = delta > 0 ? 'flash-up' : 'flash-down';
      }
      const c = colorFor(d.key,val);
      return `<div class="stat" data-kpi="${d.key}">
        <div class="stat-icon-row">
          ${pixelIcon(d.key, 32)}
          <span class="stat-info-icon ${flashClass}" data-tip="${d.key}">ⓘ</span>
        </div>
        <div class="stat-label">${d.label} ${tendenciaHTML(d.key)}</div>
        <div class="stat-value ${flashClass}" style="color:${c==='ink'?'var(--ink)':'var(--'+c+')'}">${d.fmt(val)}${deltaHtml}</div>
      </div>`;
    }).join('');
  }
  renderMitad(izquierda, 'tickerLeft');
  renderMitad(derecha, 'tickerRight');

  const rel = document.getElementById('relations');
  let chips = relChip('Proveedores', state.confianzaProveedores, 'confianzaProveedores', 'riesgo de corte de suministro')
    + relChip('Relación bancaria', state.confianzaBanco, 'confianzaBanco', 'riesgo de corte de crédito')
    + relChip('Junta directiva', state.reputacion, 'reputacion', 'riesgo de destitución');
  if(state.moralEquipo!=null){
    chips += relChip('Moral del equipo', state.moralEquipo, 'moralEquipo', 'riesgo de fuga de talento');
  }
  rel.innerHTML = chips;
  renderCalendario();
  renderPortrait();
  if(document.getElementById('crtRow').style.display !== 'none'){ renderChartCaja(); renderChartEd(); }
  actualizarVineta();
}

function renderCalendario(){
  const el = document.getElementById('calendario');
  const activos = state.obligaciones.filter(o=>!o.pagada);
  if(!activos.length){
    el.innerHTML = `<div class="cal-title">Calendario de vencimientos</div><div class="cal-empty">Sin obligaciones diferidas pendientes.</div>`;
    return;
  }
  const buckets = {b30:[], b60:[], b90:[]};
  activos.forEach(o=>{
    const rem = o.vence - turnNumber;
    if(rem<=1) buckets.b30.push(o); else if(rem===2) buckets.b60.push(o); else buckets.b90.push(o);
  });
  const sum = arr=>arr.reduce((a,o)=>a+o.monto,0);
  el.innerHTML = `
    <div class="cal-title">Calendario de vencimientos</div>
    <div class="cal-row">
      <div class="cal-bucket ${buckets.b30.length?'due':''}"><span class="cal-label">0–30 días</span><span class="cal-amt">${buckets.b30.length?fmtMoney(sum(buckets.b30)):'—'}</span></div>
      <div class="cal-bucket"><span class="cal-label">31–60 días</span><span class="cal-amt">${buckets.b60.length?fmtMoney(sum(buckets.b60)):'—'}</span></div>
      <div class="cal-bucket"><span class="cal-label">61–90 días</span><span class="cal-amt">${buckets.b90.length?fmtMoney(sum(buckets.b90)):'—'}</span></div>
    </div>
  `;
}

