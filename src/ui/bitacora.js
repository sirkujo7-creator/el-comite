function chipsDeEfectos(efectos){
  if(!efectos) return '';
  return Object.keys(efectos).filter(k=>efectos[k]).map(k=>{
    const val = efectos[k];
    const kd = KPI_DEFS.find(d=>d.key===k);
    const kind = kd ? kd.kind : 'num';
    const bueno = deltaEsSano(k, val);
    const etiqueta = KPI_LABEL[k] || k;
    return `<span class="delta-chip ${bueno?'up':'down'}">${etiqueta} ${fmtDelta(val, kind)}</span>`;
  }).join('');
}
function renderLog(){
  // solo mantiene actualizado el contador en el boton — la lista real vive en su propia
  // pantalla (renderPantallaBitacora), no aqui, para no seguir ampliando la pagina general.
  const toggleEl = document.getElementById('logToggle');
  if(toggleEl) toggleEl.textContent = `Ver bitácora completa (${history.length}) →`;
  // Resumen en el pie del tablero: las dos últimas decisiones con sus dos efectos principales.
  const resumen = document.getElementById('logResumen');
  if(resumen){
    resumen.innerHTML = history.slice(-2).reverse().map(h=>{
      const efectos = {};
      Object.keys(h.efectos||{}).filter(k=>h.efectos[k] && typeof h.efectos[k]==='number')
        .sort((a,b)=>Math.abs(h.efectos[b])-Math.abs(h.efectos[a])).slice(0,2).forEach(k=>efectos[k]=h.efectos[k]);
      return `<div class="resumen-linea">T${h.turno} · ${h.titulo} ${chipsDeEfectos(efectos)}</div>`;
    }).join('') || '<div class="resumen-linea vacio">Aún no hay decisiones registradas.</div>';
  }
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
  const titulo = document.getElementById('ventanaTitulo');
  if(titulo) titulo.textContent = 'Bitácora de decisiones';
  renderPantallaBitacora();
}

