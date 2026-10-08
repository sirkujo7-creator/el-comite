function chipsDeEfectos(efectos){
  if(!efectos) return '';
  return Object.keys(efectos).filter(k=>efectos[k]).map(k=>{
    const val = efectos[k];
    const kd = KPI_DEFS.find(d=>d.key===k);
    const kind = kd ? kd.kind : 'num';
    const bueno = (val>0) === esMejorSiSube(k);
    const etiqueta = KPI_LABEL[k] || k;
    return `<span class="delta-chip ${bueno?'up':'down'}">${etiqueta} ${fmtDelta(val, kind)}</span>`;
  }).join('');
}
function renderLog(){
  // solo mantiene actualizado el contador en el boton — la lista real vive en su propia
  // pantalla (renderPantallaBitacora), no aqui, para no seguir ampliando la pagina general.
  const toggleEl = document.getElementById('logToggle');
  if(toggleEl) toggleEl.textContent = `Ver bitácora de decisiones (${history.length})`;
}
function listaBitacoraHtml(){
  return history.slice().reverse().map(h=>`
    <div class="log-entry">
      <div class="lcase">Turno ${h.turno} · ${h.titulo}</div>
      <div>${h.texto}</div>
      ${h.efectos && Object.keys(h.efectos).some(k=>h.efectos[k]) ? `<div class="log-deltas">${chipsDeEfectos(h.efectos)}</div>` : ''}
    </div>
  `).join('') || '<div class="log-entry" style="color:var(--ink-muted)">Aún no hay decisiones registradas.</div>';
}
function renderPantallaBitacora(){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="result-card screen-fade-in">
      <div class="result-recordatorio">BITÁCORA DE DECISIONES (${history.length})</div>
      <div class="log log-modal-list show">${listaBitacoraHtml()}</div>
      <div><button class="continue-btn" id="bitacoraCerrarBtn">Cerrar</button></div>
    </div>
  `;
  document.getElementById('bitacoraCerrarBtn').addEventListener('click', ()=>{ closeTurnModal(); });
}
function toggleLog(){
  openTurnModal();
  renderPantallaBitacora();
}

