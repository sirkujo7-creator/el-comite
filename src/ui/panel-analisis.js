/* =========================================================
   PANEL DE ANÁLISIS — pantallas CRT con Zoom y Periodo funcionales
   ========================================================= */
let analiticaVisible = false; // no usado (panel ahora permanente); se conserva por compatibilidad
let cajaZoom='todo', cajaPeriodo='todo', edZoom='todo', edPeriodo='todo';
let chartCajaInstance = null, chartEdInstance = null;
const ZOOM_CYCLE = ['todo','10','5'];
const ZOOM_LABEL = {todo:'Todo', '10':'Últimos 10', '5':'Últimos 5'};
const PERIODO_CYCLE = ['todo','h1','h2'];
const PERIODO_LABEL = {todo:'Todo', h1:'1er semestre', h2:'2do semestre'};
function cycleNext(current, arr){ const i=arr.indexOf(current); return arr[(i+1)%arr.length]; }

function filtrarHistorial(zoom, periodo){
  let data = state.healthHistory.slice();
  if(state.puntoInicial) data.unshift(state.puntoInicial);
  if(periodo === 'h1') data = data.filter(p=>p.turno<=10);
  else if(periodo === 'h2') data = data.filter(p=>p.turno>10);
  if(zoom === '10') data = data.slice(-10);
  else if(zoom === '5') data = data.slice(-5);
  return data;
}

// Colores de la "Sala de mando" para las gráficas (los mismos tokens de styles/sala-de-mando.css).
const SALA = {sano:'#3ddc97', malo:'#ff5a46', alerta:'#ffb000', hueso:'#ece6d8', rejilla:'#1f2329', texto:'#8d93a0'};
const SALA_FUENTE = "'IBM Plex Mono', monospace";
const tickMillones = (v)=> (v < 0 ? '-$' : '$') + Math.abs(Math.round(v*10)/10).toLocaleString('es-CO');
function colorSala(key, v){ return {teal:SALA.sano, gold:SALA.alerta, danger:SALA.malo}[colorFor(key, v)] || SALA.hueso; }
function opcionesBaseSala(extra){
  const tick = {color:SALA.texto, font:{family:SALA_FUENTE, size:10}};
  return Object.assign({
    responsive:true, maintainAspectRatio:false, animation:{duration:900, easing:'easeOutQuart'},
    interaction:{mode:'index', intersect:false},
    scales:{
      x:{grid:{color:SALA.rejilla}, ticks:Object.assign({maxRotation:0, autoSkip:true, maxTicksLimit:10}, tick)},
      y:{grid:{color:SALA.rejilla}, ticks:Object.assign({maxTicksLimit:6, callback:tickMillones}, tick)}
    },
    plugins:{
      legend:{display:false},
      tooltip:{backgroundColor:'#0c0e11', titleColor:SALA.alerta, bodyColor:SALA.hueso, borderColor:SALA.hueso, borderWidth:2, cornerRadius:0, padding:10,
        titleFont:{family:SALA_FUENTE, size:11, weight:'700'}, bodyFont:{family:SALA_FUENTE, size:11}}
    }
  }, extra || {});
}
function sinGrafica(wrap, data){
  if(typeof Chart === 'undefined'){ wrap.innerHTML = '<div class="crt-msg">SIN SEÑAL — gráfico no disponible</div>'; return true; }
  if(data.length < 2){ wrap.innerHTML = '<div class="crt-msg">La gráfica se dibuja desde tu primera decisión.</div>'; return true; }
  return false;
}
function decisionDelTurno(turno){
  const h = history.filter(x=>x.turno===turno).pop();
  return h ? h.titulo : '';
}

function renderChartCaja(){
  const wrap = document.getElementById('chartCajaWrap');
  if(!wrap) return;
  if(chartCajaInstance){ try{chartCajaInstance.destroy();}catch(e){} chartCajaInstance=null; }
  const data = filtrarHistorial(cajaZoom, cajaPeriodo);
  if(sinGrafica(wrap, data)) return;
  wrap.innerHTML = '<canvas id="chartCajaCanvas"></canvas>';
  const canvas = document.getElementById('chartCajaCanvas');
  const labels = data.map(p=>p.turno ? 'T'+p.turno : 'Inicio');
  const cajas = data.map(p=>p.caja);
  // La peor caída del periodo (si es de al menos $2 M) queda marcada en la gráfica.
  let caida = -1, peor = -2;
  for(let i=1;i<cajas.length;i++){ const d = cajas[i]-cajas[i-1]; if(d < peor){ peor = d; caida = i; } }
  const CRITICO = 5;
  const zona = {id:'zonaCritica', beforeDatasetsDraw(c){
    const y = c.scales.y, x = c.scales.x, g = c.ctx, yc = y.getPixelForValue(CRITICO);
    if(yc > y.bottom) return;
    g.save(); g.fillStyle = 'rgba(255,90,70,.10)'; g.fillRect(x.left, yc, x.right-x.left, y.bottom-yc);
    g.setLineDash([4,4]); g.strokeStyle = 'rgba(255,90,70,.6)'; g.beginPath(); g.moveTo(x.left, yc); g.lineTo(x.right, yc); g.stroke(); g.restore();
  }};
  const marcas = {id:'marcas', afterDatasetsDraw(c){
    const m = c.getDatasetMeta(0), g = c.ctx, ult = m.data[m.data.length-1];
    if(!ult) return;
    g.save(); g.font = "700 11px " + SALA_FUENTE; g.fillStyle = SALA.alerta; g.textAlign = 'right';
    g.fillText(fmtMoney(cajas[cajas.length-1]), Math.max(ult.x - 8, c.chartArea.left + 90), Math.max(ult.y - 10, c.chartArea.top + 10));
    const p = caida > 0 ? m.data[caida] : null;
    if(p){ g.fillStyle = SALA.malo; g.textAlign = 'center'; g.font = "700 9px " + SALA_FUENTE; g.fillText('▼ mayor caída', p.x, Math.min(p.y + 16, c.chartArea.bottom - 4)); }
    g.restore();
  }};
  const minimo = Math.min(0, Math.floor(Math.min(...cajas) - 2));
  chartCajaInstance = new Chart(canvas.getContext('2d'), {
    type:'line', plugins:[zona, marcas],
    data:{labels, datasets:[{label:'Caja', data:cajas, borderColor:SALA.alerta, borderWidth:2.5, tension:0.3, fill:'start',
      backgroundColor:(ctx)=>{ const a = ctx.chart.chartArea; if(!a) return 'rgba(255,176,0,.2)';
        const gr = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); gr.addColorStop(0,'rgba(255,176,0,.38)'); gr.addColorStop(1,'rgba(255,176,0,0)'); return gr; },
      pointRadius:(ctx)=> ctx.dataIndex===cajas.length-1 ? 5 : (ctx.dataIndex===caida ? 4 : 2),
      pointBackgroundColor:(ctx)=> ctx.dataIndex===caida ? SALA.malo : SALA.alerta, pointBorderColor:'#0c0e11'}]},
    options:opcionesBaseSala({
      scales:{
        x:{grid:{color:SALA.rejilla}, ticks:{color:SALA.texto, font:{family:SALA_FUENTE, size:10}, maxRotation:0, autoSkip:true, maxTicksLimit:10}},
        y:{min:minimo, grace:'12%', grid:{color:SALA.rejilla}, ticks:{color:SALA.texto, font:{family:SALA_FUENTE, size:10}, maxTicksLimit:6, callback:tickMillones}}
      },
      plugins:{legend:{display:false}, tooltip:Object.assign(opcionesBaseSala().plugins.tooltip, {callbacks:{
        title:(it)=> data[it[0].dataIndex].turno ? 'Turno ' + data[it[0].dataIndex].turno : 'Inicio del año fiscal',
        label:(ctx)=> 'Caja: ' + fmtMoney(ctx.raw),
        afterLabel:(ctx)=>{ const t = decisionDelTurno(data[ctx.dataIndex].turno); return t ? '↳ ' + (t.length > 46 ? t.slice(0,45) + '…' : t) : ''; }
      }})}
    })
  });
}

function renderChartEd(){
  const wrap = document.getElementById('chartEdWrap');
  if(!wrap) return;
  if(chartEdInstance){ try{chartEdInstance.destroy();}catch(e){} chartEdInstance=null; }
  const ratio = document.getElementById('ratioDeudaEbitda');
  if(ratio && state){
    const r = state.ebitda > 0 ? state.deuda / state.ebitda : null;
    ratio.textContent = r == null ? 'EBITDA negativo' : 'deuda/EBITDA ' + r.toFixed(1).replace('.', ',') + '×';
    ratio.className = 'crt-sub ' + (r == null || r >= 4 ? 'malo' : r >= 3 ? 'alerta' : 'sano');
  }
  const data = filtrarHistorial(edZoom, edPeriodo);
  if(sinGrafica(wrap, data)) return;
  wrap.innerHTML = '<canvas id="chartEdCanvas"></canvas>';
  const canvas = document.getElementById('chartEdCanvas');
  const labels = data.map(p=>p.turno ? 'T'+p.turno : 'Inicio');
  const ebitdas = data.map(p=>p.ebitda);
  const deudas = data.map(p=>p.deuda);
  const tick = {color:SALA.texto, font:{family:SALA_FUENTE, size:10}};
  chartEdInstance = new Chart(canvas.getContext('2d'), {
    data:{labels, datasets:[
      {type:'bar', label:'EBITDA', data:ebitdas, yAxisID:'y', backgroundColor:ebitdas.map(v=>colorSala('ebitda', v)), borderWidth:0, borderRadius:0, barPercentage:0.7, order:2},
      {type:'line', label:'Deuda', data:deudas, yAxisID:'y2', borderColor:SALA.hueso, backgroundColor:SALA.hueso, borderWidth:2, pointRadius:2, tension:0.2, order:1}
    ]},
    options:opcionesBaseSala({
      scales:{
        x:{grid:{display:false}, ticks:Object.assign({maxRotation:0, autoSkip:true, maxTicksLimit:10}, tick)},
        y:{position:'left', beginAtZero:true, grace:'10%', grid:{color:SALA.rejilla}, ticks:Object.assign({maxTicksLimit:5, callback:tickMillones}, tick)},
        y2:{position:'right', beginAtZero:true, grace:'10%', grid:{display:false}, ticks:Object.assign({maxTicksLimit:5, callback:tickMillones}, tick)}
      },
      plugins:{
        legend:{display:true, position:'top', align:'end', labels:{color:'#bdb6a8', boxWidth:10, boxHeight:10, font:{family:SALA_FUENTE, size:10}}},
        tooltip:Object.assign(opcionesBaseSala().plugins.tooltip, {callbacks:{
          title:(it)=> data[it[0].dataIndex].turno ? 'Turno ' + data[it[0].dataIndex].turno : 'Inicio del año fiscal',
          label:(ctx)=> ctx.dataset.label + ': ' + fmtMoney(ctx.raw)
        }})
      }
    })
  });
}

function analisisDelComite(ending){
  const pts = state.healthHistory;
  if(pts.length < 2) return "No hubo suficientes turnos para un análisis detallado — la partida terminó demasiado pronto.";
  let peorCaidaIdx = 1, peorCaida = 0;
  for(let i=1;i<pts.length;i++){
    const drop = pts[i-1].score - pts[i].score;
    if(drop > peorCaida){ peorCaida = drop; peorCaidaIdx = i; }
  }
  const turnoCritico = pts[peorCaidaIdx].turno;
  const entradaCritica = history.find(h=>h.turno===turnoCritico);
  const nombreCaso = entradaCritica ? entradaCritica.titulo : 'una decisión de ese turno';

  const debilidades = [
    {k:'razonCorriente', v:state.razonCorriente, malo: v=>v<1.1, txt:'tu gestión de liquidez de corto plazo'},
    {k:'deuda', v:state.deuda, malo: v=>v>=35, txt:'tu nivel de apalancamiento'},
    {k:'wacc', v:state.wacc, malo: v=>v>=16, txt:'el costo de capital que dejaste acumular'},
    {k:'reputacion', v:state.reputacion, malo: v=>v<40, txt:'la relación con tu junta y grupos de interés'},
    {k:'confianzaProveedores', v:state.confianzaProveedores, malo: v=>v<40, txt:'la relación con tus proveedores'}
  ];
  const fortalezas = [
    {v:state.ebitda, malo:v=>v<8, txt:'tu manejo del EBITDA'},
    {v:state.razonCorriente, malo:v=>v<1.2, txt:'tu liquidez de corto plazo'},
    {v:state.wacc, malo:v=>v>15, txt:'tu costo de capital'}
  ];
  const peorDebilidad = debilidades.find(d=>d.malo(d.v));
  const fortalezaTxt = state.ebitda>=10 ? "tu manejo del EBITDA fue consistente" : "tu gestión operativa tuvo altibajos";

  let causaTxt;
  if(peorCaida > 12){
    causaTxt = `El quiebre más marcado de tu gestión ocurrió en el turno ${turnoCritico}, con "${nombreCaso}". Fue el punto donde la estrategia dejó de sostenerse.`;
  } else {
    causaTxt = "No hubo un solo quiebre dramático: el deterioro fue gradual, decisión tras decisión, más que un error puntual.";
  }
  const debilidadTxt = peorDebilidad ? `Tu punto más débil de cierre fue ${peorDebilidad.txt}.` : "No hubo un punto débil dominante: el cierre fue razonablemente equilibrado entre indicadores.";

  return `${causaTxt} ${fortalezaTxt.charAt(0).toUpperCase()+fortalezaTxt.slice(1)}, pero ${debilidadTxt.charAt(0).toLowerCase()+debilidadTxt.slice(1)} Esto convierte el resultado en una lección técnica concreta más que en un simple veredicto de éxito o fracaso.`;
}

