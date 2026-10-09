// Pantalla de resultado: "antes → después" de cada indicador que cambió con la decisión.
// Las cifras financieras cuentan desde el valor anterior hasta el nuevo; las relaciones
// (0–100) muestran su barra pasando del nivel anterior al nuevo. El color sigue la regla de
// "lo sano" del resto de la interfaz (ver cambioEsSano) y el ámbar marca una inversión.
function capturarIndicadores(){
  const foto = {};
  FRANJA_KPI.forEach(d=>{ if(state[d.key] != null) foto[d.key] = state[d.key]; });
  return foto;
}

function fmtIndicadorCompleto(d, v){
  if(d.rel) return Math.round(v) + '/100';
  const def = KPI_DEFS.find(k=>k.key===d.key);
  return def ? def.fmt(v) : String(v);
}

function balanceDecisionHTML(antes, efectos){
  const filas = FRANJA_KPI.filter(d=>antes[d.key] != null && state[d.key] != null && Math.abs(state[d.key] - antes[d.key]) > 1e-6);
  if(!filas.length) return '';
  return `<div class="balance-decision">${filas.map(d=>{
    const a = antes[d.key], b = state[d.key];
    const sano = cambioEsSano(d.key, a, b);
    const inversion = !sano && ['caja','ebitda'].includes(d.key) && tieneContrapartidaPositiva(efectos||{}, d.key);
    const clase = inversion ? 'inversion' : (sano ? 'sano' : 'malo');
    const kd = KPI_DEFS.find(k=>k.key===d.key);
    const delta = d.rel ? (Math.round(b - a) > 0 ? '+' : '') + Math.round(b - a) : fmtDelta(b - a, kd ? kd.kind : 'num');
    const barra = d.rel ? `<div class="balance-barra"><div class="balance-barra-fill ${clase}" style="width:${Math.max(0,Math.min(100,a))}%" data-hasta="${Math.max(0,Math.min(100,b))}"></div></div>` : '';
    return `<div class="balance-fila ${clase}">
      <span class="balance-label">${KPI_LABEL[d.key] || d.corto}</span>
      <span class="balance-valores"><span class="balance-antes">${fmtIndicadorCompleto(d, a)}</span><span class="balance-flecha">→</span><span class="balance-despues" data-kpi="${d.key}" data-desde="${a}" data-hasta="${b}">${fmtIndicadorCompleto(d, a)}</span></span>
      <span class="balance-delta">${inversion ? '↗ ' : ''}${delta}</span>
      ${barra}
    </div>`;
  }).join('')}</div>`;
}

// Anima las cifras y barras de la pantalla de resultado (≈0,8 s).
function animarBalanceDecision(){
  const cifras = document.querySelectorAll('.balance-despues');
  const barras = document.querySelectorAll('.balance-barra-fill');
  const dur = 800, t0 = performance.now();
  const paso = (t)=>{
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    cifras.forEach(el=>{
      const d = FRANJA_KPI.find(x=>x.key===el.dataset.kpi);
      const desde = parseFloat(el.dataset.desde), hasta = parseFloat(el.dataset.hasta);
      el.textContent = fmtIndicadorCompleto(d, desde + (hasta - desde) * e);
    });
    if(p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
  setTimeout(()=>barras.forEach(el=>{ el.style.width = el.dataset.hasta + '%'; }), 60);
}
