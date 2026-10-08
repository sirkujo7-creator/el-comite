/* =========================================================
   RENDER: TICKER / RELACIONES / CALENDARIO / RETRATO
   ========================================================= */
function moodColor(){
  const h = healthScore(state);
  if(h >= 70) return getComputedStyle(document.documentElement).getPropertyValue('--teal').trim() || '#4F9D8D';
  if(h <= 25) return getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#C1452D';
  return getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#C9A961';
}
function nombreEmpresaActual(){
  if(nombreEmpresaJugador && nombreEmpresaJugador.trim()) return nombreEmpresaJugador.trim();
  return sectorActual ? sectorActual.nombre : 'tu empresa';
}

function renderPortrait(){
  const ring = document.getElementById('portraitRing');
  if(ring){ const c = moodColor(); ring.style.borderColor = c; ring.style.boxShadow = '0 0 10px ' + c; }
  const label = document.getElementById('portraitLabel');
  if(label) label.textContent = sectorActual ? nombreEmpresaActual() : 'Comité';
}

