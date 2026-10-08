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
  if(periodo === 'h1') data = data.filter(p=>p.turno<=10);
  else if(periodo === 'h2') data = data.filter(p=>p.turno>10);
  if(zoom === '10') data = data.slice(-10);
  else if(zoom === '5') data = data.slice(-5);
  return data;
}

function renderChartCaja(){
  const wrap = document.getElementById('chartCajaWrap');
  if(!wrap) return;
  if(chartCajaInstance){ try{chartCajaInstance.destroy();}catch(e){} chartCajaInstance=null; }
  const data = filtrarHistorial(cajaZoom, cajaPeriodo);
  if(typeof Chart === 'undefined'){ wrap.innerHTML = '<div class="crt-msg">SIN SEÑAL — gráfico no disponible sin conexión</div>'; return; }
  if(data.length < 2){ wrap.innerHTML = '<div class="crt-msg">DATOS INSUFICIENTES PARA ESTE PERIODO</div>'; return; }
  wrap.innerHTML = '<canvas id="chartCajaCanvas"></canvas>';
  const canvas = document.getElementById('chartCajaCanvas');
  const labels = data.map(p=>'T'+p.turno);
  const cajas = data.map(p=>p.caja);
  chartCajaInstance = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{labels, datasets:[{label:'Caja', data:cajas, borderColor:'#39ff6a', backgroundColor:'rgba(57,255,106,0.14)', borderWidth:2, pointRadius:2.5, pointBackgroundColor:'#39ff6a', tension:0.25, fill:true}]},
    options:{
      responsive:true, maintainAspectRatio:false, animation:{duration:800, easing:'easeOutQuart'},
      scales:{
        x:{grid:{color:'#0f3d1e'}, ticks:{color:'#39ff6a', font:{family:"'IBM Plex Mono',monospace", size:9}, maxRotation:0, autoSkip:true, maxTicksLimit:7}},
        y:{grid:{color:'#0f3d1e'}, ticks:{color:'#39ff6a', font:{family:"'IBM Plex Mono',monospace", size:9}, callback:(v)=>fmtMoney(v)}}
      },
      plugins:{
        legend:{display:false},
        tooltip:{backgroundColor:'#001a08', titleColor:'#39ff6a', bodyColor:'#39ff6a', borderColor:'#39ff6a', borderWidth:1, padding:9,
          titleFont:{family:"'IBM Plex Mono',monospace", size:10}, bodyFont:{family:"'IBM Plex Mono',monospace", size:11},
          callbacks:{label:(ctx)=> 'Caja: ' + fmtMoney(ctx.raw)}}
      }
    }
  });
}

function renderChartEd(){
  const wrap = document.getElementById('chartEdWrap');
  if(!wrap) return;
  if(chartEdInstance){ try{chartEdInstance.destroy();}catch(e){} chartEdInstance=null; }
  const data = filtrarHistorial(edZoom, edPeriodo);
  if(typeof Chart === 'undefined'){ wrap.innerHTML = '<div class="crt-msg">SIN SEÑAL — gráfico no disponible sin conexión</div>'; return; }
  if(data.length < 2){ wrap.innerHTML = '<div class="crt-msg">DATOS INSUFICIENTES PARA ESTE PERIODO</div>'; return; }
  wrap.innerHTML = '<canvas id="chartEdCanvas"></canvas>';
  const canvas = document.getElementById('chartEdCanvas');
  const labels = data.map(p=>'T'+p.turno);
  const ebitdas = data.map(p=>p.ebitda);
  const deudas = data.map(p=>p.deuda);
  chartEdInstance = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{labels, datasets:[
      {label:'EBITDA', data:ebitdas, borderColor:'#ffb020', backgroundColor:'transparent', borderWidth:2, pointRadius:2.5, pointBackgroundColor:'#ffb020', tension:0.25},
      {label:'Endeudamiento', data:deudas, borderColor:'#ff4d4d', backgroundColor:'transparent', borderWidth:2, pointRadius:2.5, pointBackgroundColor:'#ff4d4d', tension:0.25}
    ]},
    options:{
      responsive:true, maintainAspectRatio:false, animation:{duration:800, easing:'easeOutQuart'},
      scales:{
        x:{grid:{color:'#0f3d1e'}, ticks:{color:'#39ff6a', font:{family:"'IBM Plex Mono',monospace", size:9}, maxRotation:0, autoSkip:true, maxTicksLimit:7}},
        y:{grid:{color:'#0f3d1e'}, ticks:{color:'#39ff6a', font:{family:"'IBM Plex Mono',monospace", size:9}, callback:(v)=>fmtMoney(v)}}
      },
      plugins:{
        legend:{display:true, labels:{color:'#39ff6a', font:{family:"'IBM Plex Mono',monospace", size:9}, boxWidth:10}},
        tooltip:{backgroundColor:'#001a08', titleColor:'#39ff6a', bodyColor:'#39ff6a', borderColor:'#39ff6a', borderWidth:1, padding:9,
          titleFont:{family:"'IBM Plex Mono',monospace", size:10}, bodyFont:{family:"'IBM Plex Mono',monospace", size:11},
          callbacks:{label:(ctx)=> ctx.dataset.label + ': ' + fmtMoney(ctx.raw)}}
      }
    }
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

