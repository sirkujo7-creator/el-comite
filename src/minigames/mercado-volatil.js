/* =========================================================================================
   MERCADO VOLÁTIL — minijuego de compra urgente bajo presión (canvas + requestAnimationFrame)
   ========================================================================================= */
function buildMercadoVolatil(){
  const esDivisa = Math.random() < 0.5;
  const base = Math.round((0.3 + Math.random()*0.7)*100)/100;
  return {
    tipo:'mercado_volatil',
    titulo: esDivisa ? 'Volatilidad Cambiaria Repentina' : 'Escasez Súbita de Insumo Crítico',
    motivoTexto: esDivisa
      ? 'El precio del dólar se dispara sin previo aviso. Necesitas comprar divisas AHORA para cubrir un pago urgente en el exterior.'
      : 'Un proveedor crítico solo tiene inventario disponible por los próximos segundos, a precio spot. Si no compras ya, te quedas sin el insumo.',
    base
  };
}

let mvState = null;
function renderMercadoVolatil(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card mercado-volatil-card screen-fade-in">
      <div class="case-eyebrow" style="color:var(--danger);">🚨 ALERTA DE MERCADO</div>
      <h2 class="case-title">${c.titulo}</h2>
      <p class="case-context">${c.motivoTexto} Haz clic en EJECUTAR COMPRA cuando el precio esté lo más bajo posible — si el tiempo se agota, el sistema compra por ti al peor precio visto.</p>
      <div class="mv-price-display" id="mvPriceDisplay">${fmtMoney(c.base)}</div>
      <div class="mv-chart-wrap"><canvas id="mvCanvas"></canvas></div>
      <div class="mv-timer-label" id="mvTimerLabel">10.0s</div>
      <button class="mv-buy-btn" id="mvBuyBtn">[ EJECUTAR COMPRA ]</button>
      <div class="mv-result" id="mvResult"></div>
    </div>
  `;
  iniciarMercadoVolatil(c);
}

function iniciarMercadoVolatil(c){
  const canvas = document.getElementById('mvCanvas');
  const ctx2d = canvas.getContext('2d');
  canvas.width = 500; canvas.height = 150;
  const priceDisplay = document.getElementById('mvPriceDisplay');
  const timerLabel = document.getElementById('mvTimerLabel');
  const buyBtn = document.getElementById('mvBuyBtn');

  const DURACION_MS = 15000;
  const minP = Math.max(0.05, Math.round(c.base*0.6*100)/100);
  const maxP = Math.round(c.base*1.5*100)/100;

  mvState = {
    startTime: performance.now(),
    precioActual: c.base,
    historial: [c.base],
    maxRegistrado: c.base,
    minP, maxP,
    resuelto: false,
    proximoSalto: 0,
    rafId: null,
    ctx2d, canvas
  };

  function nuevoPrecioAleatorio(){
    return Math.round((minP + Math.random()*(maxP-minP))*100)/100;
  }

  function dibujarCanvas(){
    const w = canvas.width, h = canvas.height;
    ctx2d.fillStyle = '#001a08';
    ctx2d.fillRect(0,0,w,h);
    ctx2d.strokeStyle = 'rgba(57,255,106,0.15)';
    ctx2d.lineWidth = 1;
    for(let i=1;i<4;i++){
      const y = (h/4)*i;
      ctx2d.beginPath(); ctx2d.moveTo(0,y); ctx2d.lineTo(w,y); ctx2d.stroke();
    }
    const hist = mvState.historial;
    const n = hist.length;
    if(n<2) return;
    const rango = (maxP-minP) || 1;
    ctx2d.strokeStyle = '#39ff6a';
    ctx2d.lineWidth = 2;
    ctx2d.shadowColor = '#39ff6a';
    ctx2d.shadowBlur = 6;
    ctx2d.beginPath();
    hist.forEach((p,i)=>{
      const x = (i/(Math.max(1,n-1)))*w;
      const y = h - ((p-minP)/rango)*h*0.85 - h*0.075;
      if(i===0) ctx2d.moveTo(x,y); else ctx2d.lineTo(x,y);
    });
    ctx2d.stroke();
    ctx2d.shadowBlur = 0;
  }

  function loop(now){
    if(!mvState || mvState.resuelto) return;
    const elapsed = now - mvState.startTime;
    if(elapsed >= mvState.proximoSalto){
      mvState.precioActual = nuevoPrecioAleatorio();
      mvState.historial.push(mvState.precioActual);
      if(mvState.historial.length > 80) mvState.historial.shift();
      mvState.maxRegistrado = Math.max(mvState.maxRegistrado, mvState.precioActual);
      mvState.proximoSalto = elapsed + 90 + Math.random()*120;
      if(priceDisplay) priceDisplay.textContent = fmtMoney(mvState.precioActual);
    }
    dibujarCanvas();
    const restante = Math.max(0, DURACION_MS - elapsed);
    if(timerLabel) timerLabel.textContent = (restante/1000).toFixed(1)+'s';
    if(restante <= 0){
      resolverMercadoVolatil('timeout');
      return;
    }
    mvState.rafId = requestAnimationFrame(loop);
  }

  if(buyBtn) buyBtn.addEventListener('click', ()=>{ resolverMercadoVolatil('click'); });
  mvState.rafId = requestAnimationFrame(loop);
}

function resolverMercadoVolatil(accion){
  if(!mvState || mvState.resuelto) return;
  mvState.resuelto = true;
  if(mvState.rafId) cancelAnimationFrame(mvState.rafId);

  const buyBtn = document.getElementById('mvBuyBtn');
  if(buyBtn) buyBtn.disabled = true;

  const esMarginCall = accion !== 'click';
  const precioFinal = esMarginCall ? mvState.maxRegistrado : mvState.precioActual;

  const efectos = {caja: -precioFinal};
  applyEfectos(efectos);
  history.push({titulo:'Mercado Volátil', texto: esMarginCall ? 'Margin Call automático' : 'Compra ejecutada manualmente', turno:turnNumber, efectos});
  state.healthHistory.push({turno:turnNumber, score:Math.round(healthScore(state)*10)/10, caja:state.caja, ebitda:Math.round(state.ebitda*10)/10, deuda:Math.round(state.deuda*10)/10});
  renderTicker(efectos);

  const priceDisplay = document.getElementById('mvPriceDisplay');
  if(priceDisplay){
    priceDisplay.textContent = fmtMoney(precioFinal);
    priceDisplay.classList.add(esMarginCall ? 'flash-bg-bad' : 'flash-bg-good');
  }

  const stampClass = esMarginCall ? 'neg' : 'neu';
  const stampTexto = esMarginCall ? 'MARGIN CALL — COMPRA FORZOSA' : 'COMPRA EJECUTADA';
  const mensaje = esMarginCall
    ? `Se acabó el tiempo. El sistema ejecutó la compra automáticamente al precio más alto que tocó el mercado durante la ventana: ${fmtMoney(precioFinal)}.`
    : `Compraste a ${fmtMoney(precioFinal)}, con un mínimo registrado de ${fmtMoney(mvState.minP)} y un máximo de ${fmtMoney(mvState.maxRegistrado)} durante la ventana. ${precioFinal <= mvState.minP*1.15 ? 'Un timing casi perfecto.' : 'Pudiste esperar un mejor precio, pero evitaste el peor escenario.'}`;

  const resultBox = document.getElementById('mvResult');
  if(resultBox){
    resultBox.innerHTML = `
      <div class="stamp ${stampClass}">${stampTexto}</div>
      <p class="consequence-text">${mensaje}</p>
      <div class="deltas"><span class="delta-chip down">Caja ${fmtDelta(-precioFinal,'money')}</span></div>
      <button class="continue-btn" id="mvContinueBtn">Continuar →</button>
    `;
    resultBox.classList.add('show');
    document.getElementById('mvContinueBtn').addEventListener('click', ()=>{
      const forced = checkForcedEnding();
      const esFinal = !!forced || turnNumber >= MAX_TURNS;
      const shake = esMarginCall || deberiaTemblar(efectos);
      calculandoImpactoYAvanzar(()=>{
        closeTurnModal();
        if(esFinal){ prepararFinDePartida(forced || cierreAnioFiscal()); }
      }, shake, efectos);
    });
  }
}

