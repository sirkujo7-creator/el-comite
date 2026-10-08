/* =========================================================================================
   BANDEJA DE ENTRADA — swipe de tarjetas (estilo Tinder / Reigns), 5 tarjetas, 15s totales
   ========================================================================================= */
const INBOX_EVENTS_POOL = [
  {icono:'☕', texto:'Reparar la cafetera de la oficina.', montoTexto:'-$500.000', aceptar:{caja:-0.5}, rechazar:{moralEquipo:-1}},
  {icono:'🎉', texto:'Bono sorpresa de fin de mes para el equipo.', montoTexto:'-$1.200.000', aceptar:{caja:-1.2, moralEquipo:5}, rechazar:{moralEquipo:-2}},
  {icono:'🪑', texto:'Comprar sillas ergonómicas nuevas.', montoTexto:'-$1.500.000', aceptar:{caja:-1.5, moralEquipo:4}, rechazar:{}},
  {icono:'🎂', texto:'Fiesta de cumpleaños de un empleado.', montoTexto:'-$300.000', aceptar:{caja:-0.3, moralEquipo:2}, rechazar:{moralEquipo:-1}},
  {icono:'💻', texto:'Actualizar el software de contabilidad.', montoTexto:'-$1.000.000', aceptar:{caja:-1, ebitda:0.5}, rechazar:{}},
  {icono:'🤝', texto:'Donación a una causa social a nombre de la empresa.', montoTexto:'-$500.000', aceptar:{caja:-0.5, reputacion:3}, rechazar:{}},
  {icono:'📚', texto:'Curso de capacitación exprés para el equipo.', montoTexto:'-$1.000.000', aceptar:{caja:-1, moralEquipo:5}, rechazar:{moralEquipo:-1}},
  {icono:'❄️', texto:'Reparación urgente del aire acondicionado.', montoTexto:'-$800.000', aceptar:{caja:-0.8}, rechazar:{moralEquipo:-1}},
  {icono:'🔧', texto:'Suscripción anual a una herramienta de productividad.', montoTexto:'-$400.000', aceptar:{caja:-0.4, ebitda:0.3}, rechazar:{}},
  {icono:'🎁', texto:'Regalo de fin de año a clientes importantes.', montoTexto:'-$1.200.000', aceptar:{caja:-1.2, reputacion:2}, rechazar:{}},
  {icono:'📋', texto:'Auditoría voluntaria de procesos internos.', montoTexto:'-$1.000.000', aceptar:{caja:-1, confianzaBanco:2}, rechazar:{}},
  {icono:'📶', texto:'Mejorar el servicio de internet de la oficina.', montoTexto:'-$600.000', aceptar:{caja:-0.6, ebitda:0.2}, rechazar:{}}
];
function buildBandejaEntrada(){
  const cartas = shuffle(INBOX_EVENTS_POOL.slice()).slice(0,5);
  return {tipo:'bandeja_entrada', titulo:'Bandeja de Entrada', cartas};
}

let bandejaState = null;
let bandejaActiva = false;
function sumarEnAcumulado(target, source){
  if(!source) return;
  Object.keys(source).forEach(k=>{ target[k] = (target[k]||0) + source[k]; });
}
function renderBandejaEntrada(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card bandeja-card screen-fade-in">
      <div class="case-eyebrow">📥 BANDEJA DE ENTRADA</div>
      <h2 class="case-title">5 solicitudes urgentes. Decide rápido.</h2>
      <div class="bandeja-timer-wrap"><div class="bandeja-timer-fill" id="bandejaTimerFill"></div></div>
      <div class="bandeja-progreso" id="bandejaProgreso">Tarjeta 1 / 5</div>
      <div class="bandeja-stack" id="bandejaStack"></div>
      <div class="bandeja-controles">
        <button class="bandeja-btn reject" id="bandejaRechazarBtn">✕ Rechazar</button>
        <button class="bandeja-btn accept" id="bandejaAceptarBtn">✓ Aceptar</button>
      </div>
      <div class="bandeja-hint">Usa las flechas ← → del teclado o los botones</div>
      <div class="bandeja-result" id="bandejaResult"></div>
    </div>
  `;
  iniciarBandejaEntrada(c);
}
function renderBandejaStack(){
  const stack = document.getElementById('bandejaStack');
  if(!stack) return;
  const cartas = bandejaState.cartas;
  const idx = bandejaState.indiceActual;
  let html = '';
  const tope = Math.min(idx+2, cartas.length-1);
  for(let i=tope; i>=idx; i--){
    const carta = cartas[i];
    const esActiva = i === idx;
    const offset = i - idx;
    html += `<div class="bandeja-tarjeta ${esActiva?'activa':''}" id="bandejaTarjeta${i}" style="transform:translateY(${offset*8}px) scale(${1-offset*0.05}); z-index:${100-offset};">
      <div class="bandeja-icono">${carta.icono}</div>
      <div class="bandeja-texto">${carta.texto}</div>
      <div class="bandeja-costo">${carta.montoTexto}</div>
    </div>`;
  }
  stack.innerHTML = html;
  const progreso = document.getElementById('bandejaProgreso');
  if(progreso) progreso.textContent = 'Tarjeta ' + (idx+1) + ' / ' + cartas.length;
}
function iniciarBandejaEntrada(c){
  bandejaState = {cartas:c.cartas, indiceActual:0, resuelto:false, timerInterval:null, efectosTotales:{}};
  bandejaActiva = true;
  renderBandejaStack();

  const totalMs = 15000;
  const startTime = Date.now();
  bandejaState.timerInterval = setInterval(()=>{
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, totalMs - elapsed);
    const pct = (remaining/totalMs)*100;
    const fill = document.getElementById('bandejaTimerFill');
    if(fill){ fill.style.width = pct+'%'; fill.style.background = pct<25?'var(--danger)':(pct<55?'var(--gold)':'var(--teal)'); }
    if(remaining<=0){
      clearInterval(bandejaState.timerInterval);
      finalizarBandejaPorTiempo();
    }
  }, 100);

  const btnAceptar = document.getElementById('bandejaAceptarBtn');
  const btnRechazar = document.getElementById('bandejaRechazarBtn');
  if(btnAceptar) btnAceptar.addEventListener('click', ()=>procesarSwipe('aceptar'));
  if(btnRechazar) btnRechazar.addEventListener('click', ()=>procesarSwipe('rechazar'));
}
function procesarSwipe(accion){
  if(!bandejaState || bandejaState.resuelto) return;
  const idx = bandejaState.indiceActual;
  if(idx >= bandejaState.cartas.length) return;
  const carta = bandejaState.cartas[idx];
  const efectos = accion==='aceptar' ? carta.aceptar : carta.rechazar;
  applyEfectos(efectos);
  sumarEnAcumulado(bandejaState.efectosTotales, efectos);

  const tarjetaEl = document.getElementById('bandejaTarjeta'+idx);
  if(tarjetaEl) tarjetaEl.classList.add(accion==='aceptar'?'swipe-right':'swipe-left');

  setTimeout(()=>{
    if(!bandejaState || bandejaState.resuelto) return;
    bandejaState.indiceActual++;
    if(bandejaState.indiceActual >= bandejaState.cartas.length){
      finalizarBandeja(false);
    } else {
      renderBandejaStack();
    }
  }, 280);
}
function finalizarBandejaPorTiempo(){
  if(!bandejaState || bandejaState.resuelto) return;
  for(let i=bandejaState.indiceActual; i<bandejaState.cartas.length; i++){
    const efectos = bandejaState.cartas[i].rechazar;
    applyEfectos(efectos);
    sumarEnAcumulado(bandejaState.efectosTotales, efectos);
  }
  bandejaState.indiceActual = bandejaState.cartas.length;
  finalizarBandeja(true);
}
function finalizarBandeja(porTiempo){
  if(!bandejaState || bandejaState.resuelto) return;
  bandejaState.resuelto = true;
  bandejaActiva = false;
  if(bandejaState.timerInterval) clearInterval(bandejaState.timerInterval);
  const efectosTotales = bandejaState.efectosTotales;
  renderTicker(efectosTotales);
  history.push({titulo:'Bandeja de Entrada', texto: porTiempo?'Se acabó el tiempo — el resto se rechazó automáticamente':'Bandeja resuelta a tiempo', turno:turnNumber, efectos: efectosTotales});
  state.healthHistory.push({turno:turnNumber, score:Math.round(healthScore(state)*10)/10, caja:state.caja, ebitda:Math.round(state.ebitda*10)/10, deuda:Math.round(state.deuda*10)/10});

  const chipOrder = ['caja','ebitda','moralEquipo','reputacion','confianzaBanco'];
  const chips = chipOrder.filter(k=>efectosTotales[k]).map(k=>{
    const val = efectosTotales[k];
    const money = (k==='caja'||k==='ebitda');
    const goodDir = val>0;
    return `<span class="delta-chip ${goodDir?'up':'down'}">${KPI_LABEL[k]||k} ${fmtDelta(val, money?'money':'num')}</span>`;
  }).join('');

  const resultBox = document.getElementById('bandejaResult');
  if(resultBox){
    resultBox.innerHTML = `
      <div class="stamp neu">BANDEJA RESUELTA</div>
      <p class="consequence-text">${porTiempo ? 'Se te acabó el tiempo: las solicitudes que no alcanzaste a revisar se rechazaron automáticamente.' : 'Procesaste las 5 solicitudes dentro del tiempo.'}</p>
      <div class="deltas">${chips || '<span class="delta-chip up">Sin efectos netos</span>'}</div>
      <button class="continue-btn" id="bandejaContinueBtn">Continuar →</button>
    `;
    resultBox.classList.add('show');
    document.getElementById('bandejaContinueBtn').addEventListener('click', ()=>{
      const forced = checkForcedEnding();
      const esFinal = !!forced || turnNumber >= MAX_TURNS;
      const shake = deberiaTemblar(efectosTotales);
      calculandoImpactoYAvanzar(()=>{
        closeTurnModal();
        if(esFinal){ prepararFinDePartida(forced || cierreAnioFiscal()); }
      }, shake, efectosTotales);
    });
  }
}
document.addEventListener('keydown', (e)=>{
  if(!bandejaActiva) return;
  if(e.key === 'ArrowRight'){ procesarSwipe('aceptar'); }
  else if(e.key === 'ArrowLeft'){ procesarSwipe('rechazar'); }
});

