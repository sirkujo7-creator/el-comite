/* =========================================================
   POST-MORTEM: GRÁFICO Y ANÁLISIS DEL COMITÉ
   ========================================================= */
function cssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
let deathChartInstance = null;
function renderDeathChartJS(){
  const wrap = document.getElementById('chartCanvasWrap');
  if(!wrap) return;
  const pts = state.healthHistory;
  if(deathChartInstance){ try{ deathChartInstance.destroy(); }catch(e){} deathChartInstance = null; }
  if(typeof Chart === 'undefined'){
    wrap.innerHTML = '<div style="color:var(--ink-muted);font-size:12px;text-align:center;padding:24px 8px;">No se pudo cargar el gráfico interactivo (revisa tu conexión a internet). Consulta la bitácora completa para el detalle turno a turno.</div>';
    return;
  }
  if(pts.length < 2){
    wrap.innerHTML = '<div style="color:var(--ink-muted);font-size:12px;text-align:center;padding:24px 8px;">No hubo suficientes turnos para graficar la gestión.</div>';
    return;
  }
  wrap.innerHTML = '<canvas id="deathChartCanvas"></canvas>';
  const canvas = document.getElementById('deathChartCanvas');
  const labels = pts.map(p=>'Turno '+p.turno);
  const scores = pts.map(p=>p.score);
  const cajas = pts.map(p=>p.caja);
  const lastScore = scores[scores.length-1];
  const lineColor = lastScore < 20 ? cssVar('--danger') : (lastScore > 70 ? cssVar('--teal') : cssVar('--gold'));
  deathChartInstance = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Salud financiera',
        data:scores,
        borderColor:lineColor,
        backgroundColor:lineColor+'2E',
        borderWidth:2.5,
        pointRadius:3,
        pointHoverRadius:6,
        pointBackgroundColor:lineColor,
        pointBorderColor:cssVar('--bg-panel'),
        tension:0.3,
        fill:true
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:1200, easing:'easeOutQuart'},
      interaction:{mode:'index', intersect:false},
      scales:{
        x:{grid:{color:cssVar('--line')}, ticks:{color:cssVar('--ink-muted'), font:{family:"'IBM Plex Mono', monospace", size:9}, maxRotation:0, autoSkip:true, maxTicksLimit:7}},
        y:{grid:{color:cssVar('--line')}, ticks:{color:cssVar('--ink-muted'), font:{family:"'IBM Plex Mono', monospace", size:9}}}
      },
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:cssVar('--bg-raised'),
          titleColor:cssVar('--gold'),
          bodyColor:cssVar('--ink'),
          borderColor:cssVar('--gold'),
          borderWidth:1,
          padding:10,
          titleFont:{family:"'IBM Plex Mono', monospace", size:11},
          bodyFont:{family:"'IBM Plex Sans', sans-serif", size:12},
          callbacks:{
            title:(items)=> labels[items[0].dataIndex],
            label:(ctx)=>{
              const i = ctx.dataIndex;
              return [`Salud financiera: ${scores[i]}`, `Caja disponible: ${fmtMoney(cajas[i])}`];
            }
          }
        }
      }
    }
  });
}

