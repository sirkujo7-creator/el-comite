/* =========================================================
   ICONOGRAFÍA DE SECTOR — SVG wireframe brutalista, 32x32,
   fill:none, stroke:currentColor (hereda el color del texto)
   ========================================================= */
const SECTOR_ICON_SVG = {
  vitafit: `<path d="M2 16 L9 16 L12 6 L15 27 L18 10 L21 16 L30 16"/>`,
  technova: `<rect x="4" y="4" width="24" height="6"/><rect x="4" y="13" width="24" height="6"/><rect x="4" y="22" width="24" height="6"/><rect x="7" y="6.5" width="2" height="1.5" fill="currentColor" stroke="none"/><rect x="7" y="15.5" width="2" height="1.5" fill="currentColor" stroke="none"/><rect x="7" y="24.5" width="2" height="1.5" fill="currentColor" stroke="none"/>`,
  agroverde: `<path d="M16 6 L26 11 L26 21 L16 26 L6 21 L6 11 Z"/><path d="M16 6 L16 16 M6 11 L16 16 M26 11 L16 16"/><path d="M16 6 L20 1"/>`,
  ganadera: `<path d="M12 6 H20 V4 H12 Z"/><path d="M13 6 L10 12 L10 27 L22 27 L22 12 L19 6"/><path d="M10 16 H22"/>`,
  construyeya: `<path d="M9 5 H23 M9 27 H23 M16 5 V27"/><path d="M9 5 V9 M23 5 V9 M9 23 V27 M23 23 V27" stroke-width="3"/><path d="M3 4 V28 M29 4 V28" stroke-width="1"/><path d="M2 4 H4 M2 28 H4 M28 4 H30 M28 28 H30" stroke-width="1"/>`,
  modaurbana: `<rect x="14" y="3" width="4" height="4"/><path d="M16 7 V9"/><path d="M16 9 L4 21 L28 21 Z"/>`
};
function sectorIcon(id){
  const inner = SECTOR_ICON_SVG[id] || '';
  return `<svg class="sector-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square">${inner}</svg>`;
}

const CATEGORIA_LABELS = {
  primario: 'SECTOR PRIMARIO — EXTRACCIÓN Y PRODUCCIÓN DE MATERIA PRIMA',
  secundario: 'SECTOR SECUNDARIO — MANUFACTURA Y TRANSFORMACIÓN',
  terciario: 'SECTOR TERCIARIO — SERVICIOS'
};
const CATEGORIA_ORDEN = ['primario','secundario','terciario'];

function renderSectorSelect(){
  showChrome(false);
  const xpEl = document.getElementById('xpLine');
  if(sessionXP>0){ xpEl.textContent = `XP gerencial guardada: ${sessionXP} (persiste en este navegador)`; xpEl.classList.add('show'); }
  else { xpEl.classList.remove('show'); }

  const victorias = historialPartidas.filter(h=>h.resultado!=='Derrota').length;
  const derrotas = historialPartidas.filter(h=>h.resultado==='Derrota').length;
  const historialHtml = historialPartidas.length ? `
    <button class="log-toggle" id="historialToggle">Ver historial de partidas (${victorias} cierres de año · ${derrotas} derrotas)</button>
    <div class="log" id="historialLog">
      ${historialPartidas.slice(0,10).map(h=>`
        <div class="log-entry"><div class="lcase">${h.fecha} · ${h.sector} · ${h.perfil}</div><div>${h.resultado} — ${h.detalle} (turno ${h.turnos}, +${h.xp} XP)</div></div>
      `).join('')}
    </div>
    <button class="log-toggle" id="resetProgresoBtn" style="margin-top:8px;color:var(--danger);">Reiniciar progreso guardado</button>
  ` : '';

  document.getElementById('game').innerHTML = `
    <div class="case-card brutal-screen">
      <h2 class="brutal-title">&gt; SELECCIONE SECTOR OPERATIVO_</h2>
      <p class="case-context brutal-hint">Pasa el cursor sobre cada tarjeta para ver el detalle.</p>
      ${CATEGORIA_ORDEN.map(cat=>{
        const sectoresCat = SECTORS.filter(s=>s.categoria===cat);
        if(!sectoresCat.length) return '';
        return `
          <div class="categoria-section">
            <h3 class="categoria-titulo">${CATEGORIA_LABELS[cat]}</h3>
            <div class="sector-grid">
              ${sectoresCat.map(s=>`
                <button class="sector-card" data-id="${s.id}">
                  <span class="card-info-icon" data-tip="sector:${s.id}">ⓘ</span>
                  ${sectorIcon(s.id)}
                  <div class="sector-name">${s.nombre}</div>
                  <div class="sector-rubro">${s.rubro}</div>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
      ${historialHtml}
    </div>
  `;
  document.querySelectorAll('.sector-card').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      if(ev.target.closest('.card-info-icon')) return;
      sectorPendiente = btn.dataset.id; nombreEmpresaJugador = ''; renderProfileSelect();
    });
  });
  if(historialPartidas.length){
    document.getElementById('historialToggle').addEventListener('click', ()=>{ document.getElementById('historialLog').classList.toggle('show'); });
    const resetBtn = document.getElementById('resetProgresoBtn');
    if(resetBtn){
      const textoOriginal = resetBtn.textContent;
      let armado = false;
      let armadoTimeout = null;
      resetBtn.addEventListener('click', ()=>{
        if(!armado){
          armado = true;
          resetBtn.textContent = '¿SEGURO? CLIC DE NUEVO PARA BORRAR';
          armadoTimeout = setTimeout(()=>{ armado = false; resetBtn.textContent = textoOriginal; }, 4000);
          return;
        }
        clearTimeout(armadoTimeout);
        armado = false;
        resetBtn.textContent = textoOriginal;
        reiniciarProgreso();
      });
    }
  }
}

function renderProfileSelect(){
  const g = document.getElementById('game');
  const sectorObj = SECTORS.find(x=>x.id===sectorPendiente);
  g.innerHTML = `
    <div class="case-card brutal-screen">
      <h2 class="brutal-title">&gt; SELECCIONE PERFIL GERENCIAL_</h2>
      <div class="empresa-nombre-section">
        <div class="brutal-subtitle" style="margin:0 0 8px;">&gt; NOMBRE DE TU EMPRESA (OPCIONAL)_</div>
        <input type="text" class="empresa-nombre-input" id="empresaNombreInput" placeholder="${sectorObj ? sectorObj.nombre : ''}" maxlength="40" value="${nombreEmpresaJugador.replace(/"/g,'&quot;')}">
      </div>
      <div class="profile-grid" id="profileGrid">
        ${PERFILES.map(p=>{
          const sel = p.id===perfilSeleccionado;
          return `<button class="profile-card ${sel?'selected':''}" data-id="${p.id}">
            <span class="card-info-icon" data-tip="profile:${p.id}">ⓘ</span>
            <div class="profile-name">[${sel?'X':' '}] ${p.nombre}</div>
          </button>`;
        }).join('')}
      </div>
      <h2 class="brutal-subtitle">&gt; VENTAJA INICIAL (OPCIONAL)_</h2>
      <div class="perk-list" id="perkList">
        ${PERKS.map(p=>{
          const locked = sessionXP < p.xpRequerido;
          const sel = p.id===perkSeleccionado;
          return `<button class="perk-card ${sel?'selected':''} ${locked?'locked':''}" data-id="${p.id}" ${locked?'disabled':''}>
            <span class="card-info-icon" data-tip="perk:${p.id}">ⓘ</span>
            <div class="perk-name">[${sel?'X':' '}] ${p.nombre}${locked?` · requiere ${p.xpRequerido} XP (tienes ${sessionXP})`:''}</div>
          </button>`;
        }).join('')}
      </div>
      <h2 class="brutal-subtitle">&gt; NIVEL DE DIFICULTAD_</h2>
      <div class="profile-grid" id="dificultadGrid">
        ${DIFICULTADES.map(d=>{
          const sel = d.id===dificultadSeleccionada;
          return `<button class="profile-card ${sel?'selected':''}" data-id="${d.id}">
            <span class="card-info-icon" data-tip="dificultad:${d.id}">ⓘ</span>
            <div class="profile-name">[${sel?'X':' '}] ${d.nombre}</div>
          </button>`;
        }).join('')}
      </div>
      <button class="brutal-confirm-btn" id="confirmarBtn">COMENZAR SIMULACIÓN →</button>
    </div>
  `;
  const nombreInput = document.getElementById('empresaNombreInput');
  if(nombreInput){
    nombreInput.addEventListener('input', ()=>{ nombreEmpresaJugador = nombreInput.value; });
  }
  document.querySelectorAll('#profileGrid .profile-card').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      if(ev.target.closest('.card-info-icon')) return;
      perfilSeleccionado = btn.dataset.id; renderProfileSelect();
    });
  });
  document.querySelectorAll('#dificultadGrid .profile-card').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      if(ev.target.closest('.card-info-icon')) return;
      dificultadSeleccionada = btn.dataset.id; renderProfileSelect();
    });
  });
  document.querySelectorAll('.perk-card').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      if(ev.target.closest('.card-info-icon')) return;
      if(btn.disabled) return;
      perkSeleccionado = btn.dataset.id; renderProfileSelect();
    });
  });
  document.getElementById('confirmarBtn').addEventListener('click', confirmarInicio);
}

function reiniciarPartidaActual(){
  document.getElementById('game').innerHTML = '';
  reproducirSecuencia(guionInicioPartida(sectorActual, perfilActual), ()=>{
    resetEvaluarTurnoBtn();
    initState();
    showChrome(true);
    activarFadeInOscuro();
    document.getElementById('game').innerHTML = '';
    renderTicker(null);
    programarProximaOficinaAmbiente();
    iniciarDrone();
  });
}

function confirmarInicio(){
  detenerAmbienteMenu();
  sectorActual = SECTORS.find(x=>x.id===sectorPendiente) || SECTORS[0];
  perfilActual = PERFILES.find(x=>x.id===perfilSeleccionado) || PERFILES[0];
  perkActual = PERKS.find(x=>x.id===perkSeleccionado) || PERKS[0];
  document.getElementById('game').innerHTML = ''; // limpia la pantalla de perfil de inmediato, antes de la transición
  reproducirSecuencia(guionInicioPartida(sectorActual, perfilActual), ()=>{
    showChrome(true);
    activarFadeInOscuro();
    document.getElementById('subtitleText').innerHTML = `Diriges las finanzas de <b>${nombreEmpresaActual()}</b>: ${sectorActual.rubro.toLowerCase()}. ${sectorActual.descripcion} Perfil activo: <b>${perfilActual.nombre}</b>.`;
    document.getElementById('xpLine').classList.remove('show');
    resetEvaluarTurnoBtn();
    initState();
    document.getElementById('game').innerHTML = '';
    renderTicker(null);
    programarProximaOficinaAmbiente();
    iniciarDrone();
    openTurnModal();
    renderMetaScreen({metaNueva: metaTrimestral}, ()=>{ closeTurnModal(); });
  });
}

