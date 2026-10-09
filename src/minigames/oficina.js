/* =========================================================================================
   MOTOR DE CULTURA DE OFICINA — 4 eventos ligeros con mecánicas nativas (slider/clicker/timer/hover)
   ========================================================================================= */
let oficinaEsAmbiente = false;
function aplicarYFinalizarEventoOficina(resultElId, efectos, mensaje, stampClass, stampTexto){
  applyEfectos(efectos);
  history.push({titulo: oficinaEsAmbiente?'Situación en la Oficina':'Cultura de Oficina', texto:mensaje, turno:turnNumber, efectos});
  state.healthHistory.push({turno:turnNumber, score:Math.round(healthScore(state)*10)/10, caja:state.caja, ebitda:Math.round(state.ebitda*10)/10, deuda:Math.round(state.deuda*10)/10});
  renderTicker(efectos);

  const chipOrder = ['caja','ebitda','moralEquipo','reputacion'];
  const chips = chipOrder.filter(k=>efectos[k]).map(k=>{
    const val = efectos[k];
    const money = (k==='caja'||k==='ebitda');
    const goodDir = deltaEsSano(k, val);
    return `<span class="delta-chip ${goodDir?'up':'down'}">${KPI_LABEL[k]||k} ${fmtDelta(val, money?'money':'num')}</span>`;
  }).join('');

  const resultBox = document.getElementById(resultElId);
  if(resultBox){
    resultBox.innerHTML = `
      <div class="stamp ${stampClass}">${stampTexto || 'DECISIÓN TOMADA'}</div>
      <p class="consequence-text">${mensaje}</p>
      <div class="deltas">${chips || '<span class="delta-chip up">Sin efectos netos</span>'}</div>
      <button class="continue-btn" id="oficinaContinueBtn">Continuar →</button>
    `;
    resultBox.classList.add('show');
    const eraAmbiente = oficinaEsAmbiente;
    oficinaEsAmbiente = false;
    document.getElementById('oficinaContinueBtn').addEventListener('click', ()=>{
      const forced = checkForcedEnding();
      const esFinal = eraAmbiente ? !!forced : (!!forced || turnNumber >= MAX_TURNS);
      const shake = deberiaTemblar(efectos);
      calculandoImpactoYAvanzar(()=>{
        closeTurnModal();
        detenerMurmulloOficina();
        if(esFinal){ prepararFinDePartida(forced || cierreAnioFiscal()); }
        else if(eraAmbiente){ programarProximaOficinaAmbiente(); }
      }, shake, efectos);
    });
  }
}

/* ---------- 1) La Climatización del Caos (Slider) ---------- */
const OFICINA_CONTEXTOS = {
  clima_caos: {
    vitafit: "Los instructores de spinning exigen 26°C para no 'matar' a los que hacen ejercicio; el equipo administrativo pide 18°C para poder concentrarse en la caja.",
    technova: "El equipo de desarrollo, encerrado todo el día junto a servidores que calientan la sala, exige 18°C. El equipo comercial, siempre en videollamada, pide 24°C para no sonar como si estuviera temblando.",
    agroverde: "La oficina administrativa, pegada a la planta de empaque, exige 16°C para contrarrestar el calor de las máquinas. El equipo comercial, con clientes internacionales en videollamada, pide 24°C para verse presentables sin sudar.",
    ganadera: "La oficina, pegada al establo de ordeño, exige 16°C para contrarrestar el calor y el olor. El equipo contable, que casi no sale de ahí, pide 23°C porque se está congelando.",
    construyeya: "El equipo de obra entra y sale todo el día dejando las puertas abiertas y pide que suban la temperatura. El equipo de finanzas, encerrado con los computadores, exige que baje.",
    modaurbana: "El equipo de diseño, rodeado de telas y maniquíes, quiere frío para que la ropa no se dañe. El equipo de ventas del local, de cara al público, exige calor para que los clientes se queden más tiempo comprando."
  },
  dilema_cafe: {
    vitafit: "Se acabó el café en la sala de espera del gimnasio, justo antes de la hora pico de las 6am.",
    technova: "Se acabó el café en la sala de juntas. El sprint review empieza en diez minutos y el equipo lleva toda la noche despierto.",
    agroverde: "Se acabó el café en la oficina — irónico, siendo una empresa agroexportadora. Los visitantes de la certificadora llegan en media hora.",
    ganadera: "Se acabó el café en la oficina de la finca, justo cuando llega el veterinario a hacer la ronda de la mañana.",
    construyeya: "Se acabó el café en la caseta de obra. Los maestros llevan toda la mañana esperando su tinto de las 10.",
    modaurbana: "Se acabó el café en el showroom, justo antes de que lleguen los compradores de la temporada."
  },
  cumple_inoportuno: {
    vitafit: "Es el cumpleaños del entrenador que nadie soporta. Ya te arrastraron al salón principal, entre las máquinas, y todos esperan que cantes.",
    technova: "Es el cumpleaños del desarrollador senior que nadie soporta. Ya te tienen frente a la cámara en la videollamada del equipo.",
    agroverde: "Es el cumpleaños del jefe de planta que nadie soporta. Ya te arrastraron a la bodega de empaque, entre cajas, para cantarle.",
    ganadera: "Es el cumpleaños del capataz que nadie soporta. Ya te arrastraron hasta el establo, entre el ganado, para cantarle.",
    construyeya: "Es el cumpleaños del ingeniero residente que nadie soporta. Ya te tienen parado en medio de la obra, con casco puesto, para cantarle.",
    modaurbana: "Es el cumpleaños del encargado de bodega que nadie soporta. Ya te arrastraron entre los racks de ropa para cantarle."
  },
  guerra_nevera: {
    vitafit: "Alguien se robó un batido de proteína de la nevera del staff — otra vez.",
    technova: "Alguien se robó un almuerzo de la nevera de la oficina — otra vez. El sospechoso número uno es quien programa hasta las 2am.",
    agroverde: "Alguien se robó un almuerzo de la nevera de la planta — otra vez. Con tanta fruta fresca alrededor, nadie entiende por qué roban comida empacada.",
    ganadera: "Alguien se robó un almuerzo de la nevera de la finca — otra vez. Con tanta leche fresca disponible, nadie entiende por qué roban justo el almuerzo ajeno.",
    construyeya: "Alguien se robó el almuerzo de la caseta de obra — otra vez. Con maestros de tres frentes distintos, el sospechoso puede ser cualquiera.",
    modaurbana: "Alguien se robó un almuerzo de la nevera del showroom — otra vez, justo el día que llegó comida de un cliente importante."
  },
  impresora_atascada: {
    vitafit: "La única impresora del gimnasio se atasca justo cuando hay que sacar veinte contratos de membresía nuevos antes del cierre del mes.",
    technova: "La impresora de la oficina se atasca justo cuando Legal necesita imprimir y firmar un contrato en físico porque el cliente, a la antigua, no acepta firma digital.",
    agroverde: "La impresora se atasca justo cuando hay que sacar los certificados fitosanitarios para el embarque de exportación que sale hoy.",
    ganadera: "La impresora se atasca justo cuando hay que imprimir la certificación sanitaria que el comprador exige ver antes de recoger la leche.",
    construyeya: "La impresora de la caseta de obra se atasca justo cuando hay que sacar los planos actualizados para la inspección de hoy.",
    modaurbana: "La impresora del showroom se atasca justo cuando hay que imprimir las etiquetas de precio de la colección nueva antes de abrir."
  },
  pantalla_azul: {
    vitafit: "El computador de recepción se congela justo cuando hay una fila de clientes esperando para renovar su membresía.",
    technova: "El computador del líder técnico se congela en plena demo en vivo con un cliente potencial.",
    agroverde: "El computador de la oficina se congela justo cuando hay que cerrar el reporte de exportación antes del corte del día.",
    ganadera: "El computador de la oficina se congela justo cuando hay que subir el registro sanitario del día antes de que cierre el sistema.",
    construyeya: "El computador de la caseta de obra se congela justo cuando hay que enviar el avance de obra semanal antes del corte.",
    modaurbana: "El computador de caja se congela justo en plena hora pico de ventas del showroom."
  },
  correo_todos: {
    vitafit: "Alguien del equipo administrativo responde-a-todos por error con una queja sobre un compañero, visible para todo el staff del gimnasio.",
    technova: "Alguien del equipo responde-a-todos con una crítica directa a un cliente, en un correo que debía ser interno.",
    agroverde: "Alguien de logística responde-a-todos con cifras internas de costos que no debían salir del área financiera.",
    ganadera: "Alguien de la oficina responde-a-todos con un comentario incómodo sobre un proveedor, visible para toda la finca.",
    construyeya: "Alguien de obra responde-a-todos con una queja sobre el cliente del proyecto, visible para todo el equipo.",
    modaurbana: "Alguien de ventas responde-a-todos con un comentario sobre un cliente difícil, visible para toda la tienda."
  },
  encuesta_clima: {
    vitafit: "RRHH manda la encuesta anual de clima laboral. Como gerente, también debes responderla — y hay más de un ojo puesto en cómo lo haces.",
    technova: "RRHH manda la encuesta trimestral de clima laboral del equipo técnico. Tu respuesta, aunque anónima en teoría, se sabe que es la tuya.",
    agroverde: "RRHH manda la encuesta anual de clima laboral para toda la operación, oficina y campo incluidos.",
    ganadera: "RRHH manda la encuesta anual de clima laboral para todo el personal, de la oficina al establo.",
    construyeya: "RRHH manda la encuesta de clima laboral, esta vez incluyendo también al personal de obra.",
    modaurbana: "RRHH manda la encuesta anual de clima laboral para el equipo del showroom y la bodega."
  },
  apagon: {
    vitafit: "Se va la luz en el gimnasio en plena tarde. La planta de respaldo solo alcanza para una parte de las máquinas y sistemas.",
    technova: "Se va la luz en la oficina. La planta de respaldo es pequeña y no alcanza para todo al mismo tiempo.",
    agroverde: "Se va la luz en la planta de empaque. La planta de respaldo es limitada y hay que decidir rápido qué mantener encendido.",
    ganadera: "Se va la luz en la finca. La planta de respaldo es pequeña y no alcanza para todo el sistema de ordeño y refrigeración a la vez.",
    construyeya: "Se va la luz en la caseta de obra. La planta de respaldo es pequeña y no alcanza para todos los equipos conectados.",
    modaurbana: "Se va la luz en el showroom en plena tarde de ventas. La planta de respaldo es limitada."
  }
};
function contextoOficina(tipo){
  const porSector = OFICINA_CONTEXTOS[tipo];
  if(!porSector) return '';
  return (sectorActual && porSector[sectorActual.id]) || Object.values(porSector)[0];
}

function buildClimaCaos(){ return {tipo:'clima_caos', titulo:'La Climatización del Caos'}; }
function renderClimaCaos(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">🌡️ CULTURA DE OFICINA</div>
      <h2 class="case-title">La Climatización del Caos</h2>
      <p class="case-context">${contextoOficina('clima_caos')} El termostato de la oficina se ha convertido en un campo de batalla, y todos te miran a ti.</p>
      <div class="clima-dial-wrap">
        <div class="clima-valor" id="climaValor">5</div>
        <input type="range" min="1" max="10" value="5" class="clima-slider" id="climaSlider">
        <div class="clima-labels"><span>❄️ 16°C</span><span>🔥 26°C</span></div>
      </div>
      <button class="continue-btn" id="climaConfirmarBtn">Confirmar temperatura</button>
      <div class="oficina-result" id="climaResult"></div>
    </div>
  `;
  const slider = document.getElementById('climaSlider');
  const valorEl = document.getElementById('climaValor');
  slider.addEventListener('input', ()=>{ valorEl.textContent = slider.value; });
  document.getElementById('climaConfirmarBtn').addEventListener('click', ()=>{
    resolverClimaCaos(parseInt(slider.value,10));
  });
}
function resolverClimaCaos(valor){
  const slider = document.getElementById('climaSlider');
  const btn = document.getElementById('climaConfirmarBtn');
  if(slider) slider.disabled = true;
  if(btn) btn.disabled = true;
  const esMedio = valor>=4 && valor<=7;
  const efectos = esMedio ? {moralEquipo:-1} : {caja:-0.05, moralEquipo:3};
  const mensaje = esMedio
    ? "Decisión salomónica: dejas el termostato a mitad de camino y todos sufren por igual — ni Contabilidad ni Mercadeo quedan contentos."
    : "Favoreces claramente a un bando y compras abrigos o ventiladores portátiles para calmar al resto de la oficina.";
  aplicarYFinalizarEventoOficina('climaResult', efectos, mensaje, esMedio?'neu':'pos', esMedio?'DECISIÓN SALOMÓNICA':'BANDO ELEGIDO');
}

/* ---------- 2) El Dilema del Café (Clicker) ---------- */
function buildDilemaCafe(){ return {tipo:'dilema_cafe', titulo:'El Dilema del Café'}; }
let cafeCheckInterval = null;
function renderDilemaCafe(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">☕ CULTURA DE OFICINA</div>
      <h2 class="case-title">El Dilema del Café</h2>
      <p class="case-context">${contextoOficina('dilema_cafe')}</p>
      <div class="cafe-clicker-box">
        <button class="oficina-choice-btn" id="cafeABtn">A) Exprimir la jarra vieja<span class="cafe-clicker-hint" id="cafeHint">Haz clic 10 veces en menos de 6 segundos</span></button>
        <div class="cafe-progreso-wrap"><div class="cafe-progreso-fill" id="cafeProgresoFill"></div></div>
        <button class="oficina-choice-btn" id="cafeBBtn">B) Comprar máquina premium</button>
      </div>
      <div class="oficina-result" id="cafeResult"></div>
    </div>
  `;
  let clics = 0, ventanaAbierta = false, deadline = 0, resuelto = false;
  const btnA = document.getElementById('cafeABtn');
  const btnB = document.getElementById('cafeBBtn');
  const fill = document.getElementById('cafeProgresoFill');
  const hint = document.getElementById('cafeHint');

  btnA.addEventListener('click', ()=>{
    if(resuelto) return;
    const ahora = Date.now();
    if(!ventanaAbierta || ahora > deadline){
      ventanaAbierta = true;
      clics = 0;
      deadline = ahora + 6000;
    }
    clics++;
    if(fill) fill.style.width = Math.min(100,(clics/10)*100)+'%';
    if(hint) hint.textContent = clics + ' / 10 clics';
    if(clics >= 10){
      resuelto = true;
      resolverDilemaCafe('A');
    }
  });
  btnB.addEventListener('click', ()=>{
    if(resuelto) return;
    resuelto = true;
    resolverDilemaCafe('B');
  });

  if(cafeCheckInterval){ clearInterval(cafeCheckInterval); }
  cafeCheckInterval = setInterval(()=>{
    if(resuelto){ clearInterval(cafeCheckInterval); cafeCheckInterval=null; return; }
    if(ventanaAbierta && Date.now() > deadline && clics > 0 && clics < 10){
      resuelto = true;
      clearInterval(cafeCheckInterval); cafeCheckInterval=null;
      resolverDilemaCafe('A_fallo');
    }
  }, 100);
}
function resolverDilemaCafe(resultado){
  if(cafeCheckInterval){ clearInterval(cafeCheckInterval); cafeCheckInterval=null; }
  const btnA = document.getElementById('cafeABtn');
  const btnB = document.getElementById('cafeBBtn');
  if(btnA) btnA.disabled = true;
  if(btnB) btnB.disabled = true;

  let efectos, mensaje, stampClass, stampTexto;
  if(resultado === 'A'){
    efectos = {ebitda:0.05, moralEquipo:1};
    stampClass='neu'; stampTexto='AHORRO LOGRADO';
    mensaje = "Lo lograste: 10 clics en menos de 6 segundos. Ahorro extremo, pero todo el equipo te vio hacerlo y ahora te odia un poco.";
  } else if(resultado === 'A_fallo'){
    efectos = {moralEquipo:-1};
    stampClass='neg'; stampTexto='INTENTO FALLIDO';
    mensaje = "No alcanzaste el ritmo a tiempo: la jarra vieja termina rota en el intento y tienes que reponerla de todas formas.";
  } else {
    efectos = {caja:-0.1, moralEquipo:3};
    stampClass='pos'; stampTexto='JEFE FAVORITO';
    mensaje = "Compras la máquina premium sin pensarlo dos veces. Eres, oficialmente, el jefe favorito de la oficina esta semana.";
  }
  aplicarYFinalizarEventoOficina('cafeResult', efectos, mensaje, stampClass, stampTexto);
}

/* ---------- 3) El cumpleaños inoportuno (Timer/Estrés) ---------- */
function buildCumpleInoportuno(){ return {tipo:'cumple_inoportuno', titulo:'El cumpleaños inoportuno'}; }
let cumpleIntervalId = null;
function renderCumpleInoportuno(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">🎂 CULTURA DE OFICINA</div>
      <h2 class="case-title">El cumpleaños inoportuno</h2>
      <p class="case-context">${contextoOficina('cumple_inoportuno')}</p>
      <progress class="cumple-progress" id="cumpleProgress" max="100" value="100"></progress>
      <div class="oficina-botones">
        <button class="oficina-choice-btn" id="cumpleABtn">A) Huir cobardemente</button>
        <button class="oficina-choice-btn" id="cumpleBBtn">B) Cantar incómodo</button>
      </div>
      <div class="oficina-result" id="cumpleResult"></div>
    </div>
  `;
  const DURACION = 9000;
  const inicio = Date.now();
  let resuelto = false;
  const progressEl = document.getElementById('cumpleProgress');

  if(cumpleIntervalId){ clearInterval(cumpleIntervalId); }
  cumpleIntervalId = setInterval(()=>{
    const restante = Math.max(0, DURACION - (Date.now()-inicio));
    if(progressEl) progressEl.value = (restante/DURACION)*100;
    if(restante<=0){
      clearInterval(cumpleIntervalId); cumpleIntervalId=null;
      if(!resuelto){ resuelto = true; resolverCumple('timeout'); }
    }
  }, 80);

  document.getElementById('cumpleABtn').addEventListener('click', ()=>{
    if(resuelto) return; resuelto = true;
    if(cumpleIntervalId){ clearInterval(cumpleIntervalId); cumpleIntervalId=null; }
    resolverCumple('A');
  });
  document.getElementById('cumpleBBtn').addEventListener('click', ()=>{
    if(resuelto) return; resuelto = true;
    if(cumpleIntervalId){ clearInterval(cumpleIntervalId); cumpleIntervalId=null; }
    resolverCumple('B');
  });
}
function resolverCumple(resultado){
  const btnA = document.getElementById('cumpleABtn');
  const btnB = document.getElementById('cumpleBBtn');
  if(btnA) btnA.disabled = true;
  if(btnB) btnB.disabled = true;

  let efectos, mensaje, stampClass, stampTexto;
  if(resultado === 'A'){
    efectos = {reputacion:-1};
    stampClass='neu'; stampTexto='ESCAPE EXITOSO';
    mensaje = "Huyes justo a tiempo alegando una llamada urgente. La junta lo nota, y no lo olvida tan fácil.";
  } else if(resultado === 'B'){
    efectos = {moralEquipo:3};
    stampClass='pos'; stampTexto='CANTASTE';
    mensaje = "Cantas incómodo, desafinado, pero presente. El equipo lo valora más de lo que esperabas.";
  } else {
    efectos = {moralEquipo:1};
    stampClass='neu'; stampTexto='PARALIZADO';
    mensaje = "Se te acabó el tiempo para decidir: te quedaste paralizado y terminaste aplaudiendo torpemente junto a todos los demás.";
  }
  aplicarYFinalizarEventoOficina('cumpleResult', efectos, mensaje, stampClass, stampTexto);
}

/* ---------- 4) Guerra de la Nevera (Hover Reveal) ---------- */
function buildGuerraNevera(){ return {tipo:'guerra_nevera', titulo:'Guerra de la Nevera'}; }
function renderGuerraNevera(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">🥪 CULTURA DE OFICINA</div>
      <h2 class="case-title">Guerra de la Nevera</h2>
      <p class="case-context">${contextoOficina('guerra_nevera')} Te entregan la "grabación" de la cámara de seguridad rota de la cocina.</p>
      <div class="nevera-camara" id="neveraCamara">
        <div class="nevera-silueta">👤</div>
        <div class="nevera-static"></div>
      </div>
      <div class="nevera-hint">Pasa el cursor sobre la grabación</div>
      <div class="oficina-botones">
        <button class="oficina-choice-btn" id="neveraABtn">A) Ignorar</button>
        <button class="oficina-choice-btn" id="neveraBBtn">B) Comprar sistema de cámaras</button>
      </div>
      <div class="oficina-result" id="neveraResult"></div>
    </div>
  `;
  document.getElementById('neveraABtn').addEventListener('click', ()=>resolverNevera('A'));
  document.getElementById('neveraBBtn').addEventListener('click', ()=>resolverNevera('B'));
}
function resolverNevera(resultado){
  const btnA = document.getElementById('neveraABtn');
  const btnB = document.getElementById('neveraBBtn');
  if(btnA) btnA.disabled = true;
  if(btnB) btnB.disabled = true;

  let efectos, mensaje, stampClass, stampTexto;
  if(resultado === 'A'){
    efectos = {};
    stampClass='neu'; stampTexto='SIN PRESUPUESTO PARA DRAMAS';
    mensaje = "No hay presupuesto para dramas de sándwiches. El misterio del almuerzo robado queda oficialmente sin resolver.";
  } else {
    efectos = {caja:-0.15, moralEquipo:4};
    stampClass='pos'; stampTexto='PARANOIA ACTIVADA';
    mensaje = "Instalas un sistema de cámaras completamente desproporcionado para el tamaño del problema. Paranoia corporativa activada — y el equipo lo celebra como si fuera una victoria.";
  }
  aplicarYFinalizarEventoOficina('neveraResult', efectos, mensaje, stampClass, stampTexto);
}

/* ---------- 5) La impresora atascada (Secuencia tipo "Simon dice") ---------- */
function buildImpresoraAtascada(){ return {tipo:'impresora_atascada', titulo:'La impresora atascada'}; }
let impresoraTimeouts = [];
function renderImpresoraAtascada(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">🖨️ CULTURA DE OFICINA</div>
      <h2 class="case-title">La impresora atascada</h2>
      <p class="case-context">${contextoOficina('impresora_atascada')}</p>
      <div class="impresora-intro" id="impresoraIntro">
        <button class="oficina-choice-btn" id="impresoraIntentarBtn">A) Intentar arreglarla tú mismo</button>
        <button class="oficina-choice-btn" id="impresoraLlamarBtn">B) Llamar de inmediato a soporte técnico</button>
      </div>
      <div class="impresora-juego" id="impresoraJuego" style="display:none">
        <div class="impresora-instruccion" id="impresoraInstruccion">Memoriza la secuencia...</div>
        <div class="impresora-grid">
          <button class="impresora-flecha" data-dir="up" disabled>▲</button>
          <button class="impresora-flecha" data-dir="left" disabled>◀</button>
          <button class="impresora-flecha" data-dir="right" disabled>▶</button>
          <button class="impresora-flecha" data-dir="down" disabled>▼</button>
        </div>
      </div>
      <div class="oficina-result" id="impresoraResult"></div>
    </div>
  `;
  let resuelto = false;
  const intro = document.getElementById('impresoraIntro');
  const juego = document.getElementById('impresoraJuego');
  const instruccion = document.getElementById('impresoraInstruccion');
  const flechas = document.querySelectorAll('.impresora-flecha');
  let deadlineTimeout = null;

  document.getElementById('impresoraLlamarBtn').addEventListener('click', ()=>{
    if(resuelto) return;
    resuelto = true;
    resolverImpresora('llamar');
  });
  document.getElementById('impresoraIntentarBtn').addEventListener('click', (ev)=>{
    if(resuelto) return;
    document.getElementById('impresoraIntentarBtn').disabled = true;
    document.getElementById('impresoraLlamarBtn').disabled = true;
    intro.style.display = 'none';
    juego.style.display = '';
    iniciarSecuencia();
  });

  const direcciones = ['up','down','left','right'];
  const secuencia = [];
  for(let i=0;i<4;i++){ secuencia.push(direcciones[Math.floor(Math.random()*4)]); }
  let entradaJugador = [];

  function iniciarSecuencia(){
    instruccion.textContent = 'Memoriza la secuencia...';
    let i = 0;
    function flashSiguiente(){
      if(resuelto) return;
      if(i >= secuencia.length){
        const t = setTimeout(()=>{
          if(resuelto) return;
          instruccion.textContent = '¡Ahora repítela, rápido!';
          flechas.forEach(f=>f.disabled = false);
          deadlineTimeout = setTimeout(()=>{
            if(resuelto) return;
            resuelto = true;
            resolverImpresora('tiempo_agotado');
          }, 9000);
          impresoraTimeouts.push(deadlineTimeout);
        }, 400);
        impresoraTimeouts.push(t);
        return;
      }
      const dir = secuencia[i];
      const btn = document.querySelector('.impresora-flecha[data-dir="'+dir+'"]');
      if(btn) btn.classList.add('flash');
      const t1 = setTimeout(()=>{
        if(btn) btn.classList.remove('flash');
        i++;
        const t2 = setTimeout(flashSiguiente, 200);
        impresoraTimeouts.push(t2);
      }, 450);
      impresoraTimeouts.push(t1);
    }
    flashSiguiente();
  }

  flechas.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(resuelto || btn.disabled) return;
      const dir = btn.dataset.dir;
      btn.classList.add('press');
      setTimeout(()=>btn.classList.remove('press'), 150);
      const idx = entradaJugador.length;
      entradaJugador.push(dir);
      if(secuencia[idx] !== dir){
        resuelto = true;
        if(deadlineTimeout) clearTimeout(deadlineTimeout);
        resolverImpresora('secuencia_incorrecta');
        return;
      }
      if(entradaJugador.length === secuencia.length){
        resuelto = true;
        if(deadlineTimeout) clearTimeout(deadlineTimeout);
        resolverImpresora('exito');
      }
    });
  });
}
function resolverImpresora(resultado){
  impresoraTimeouts.forEach(t=>clearTimeout(t));
  impresoraTimeouts = [];
  document.querySelectorAll('.impresora-flecha').forEach(b=>{ b.disabled = true; });
  const intentarBtn = document.getElementById('impresoraIntentarBtn');
  const llamarBtn = document.getElementById('impresoraLlamarBtn');
  if(intentarBtn) intentarBtn.disabled = true;
  if(llamarBtn) llamarBtn.disabled = true;

  let efectos, mensaje, stampClass, stampTexto;
  if(resultado === 'exito'){
    efectos = {moralEquipo:3};
    stampClass='pos'; stampTexto='IMPRESORA SALVADA';
    mensaje = "Sacas el papel atascado en el orden correcto, sin romper nada. El equipo aplaude — hoy eres un héroe de oficina.";
  } else if(resultado === 'secuencia_incorrecta' || resultado === 'tiempo_agotado'){
    efectos = {moralEquipo:-1};
    stampClass='neg'; stampTexto='PAPEL DESTROZADO';
    mensaje = "Te equivocas de dirección y el papel se rasga dentro del mecanismo. Ahora sí hay que llamar a soporte técnico, con recargo por urgencia.";
  } else {
    efectos = {caja:-0.2};
    stampClass='neu'; stampTexto='SOPORTE TÉCNICO';
    mensaje = "Llamas de inmediato a soporte técnico. Resuelven el problema sin drama, a cambio de la tarifa de visita urgente.";
  }
  aplicarYFinalizarEventoOficina('impresoraResult', efectos, mensaje, stampClass, stampTexto);
}

/* ---------- 6) La pantalla azul (Secuencia de teclas, tipo "Simon dice") ---------- */
function buildPantallaAzul(){ return {tipo:'pantalla_azul', titulo:'La pantalla azul'}; }
let pantallaAzulTimeouts = [];
function renderPantallaAzul(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">🖥️ CULTURA DE OFICINA</div>
      <h2 class="case-title">La pantalla azul</h2>
      <p class="case-context">${contextoOficina('pantalla_azul')}</p>
      <div class="pantalla-intro" id="pantallaIntro">
        <button class="oficina-choice-btn" id="pantallaIntentarBtn">A) Intentar el combo de reinicio de emergencia</button>
        <button class="oficina-choice-btn" id="pantallaReiniciarBtn">B) Apagar de un tirón y perder el trabajo sin guardar</button>
      </div>
      <div class="pantalla-juego" id="pantallaJuego" style="display:none">
        <div class="impresora-instruccion" id="pantallaInstruccion">Memoriza la secuencia...</div>
        <div class="pantalla-tecla-grid">
          <button class="pantalla-tecla" data-t="ctrlaltsupr" disabled>CTRL+ALT+SUPR</button>
          <button class="pantalla-tecla" data-t="enter" disabled>ENTER</button>
          <button class="pantalla-tecla" data-t="esc" disabled>ESC</button>
          <button class="pantalla-tecla" data-t="f5" disabled>F5</button>
        </div>
      </div>
      <div class="oficina-result" id="pantallaResult"></div>
    </div>
  `;
  let resuelto = false;
  const intro = document.getElementById('pantallaIntro');
  const juego = document.getElementById('pantallaJuego');
  const instruccion = document.getElementById('pantallaInstruccion');
  const teclas = document.querySelectorAll('.pantalla-tecla');
  let deadlineTimeout = null;

  document.getElementById('pantallaReiniciarBtn').addEventListener('click', ()=>{
    if(resuelto) return;
    resuelto = true;
    resolverPantallaAzul('reiniciar');
  });
  document.getElementById('pantallaIntentarBtn').addEventListener('click', ()=>{
    if(resuelto) return;
    document.getElementById('pantallaIntentarBtn').disabled = true;
    document.getElementById('pantallaReiniciarBtn').disabled = true;
    intro.style.display = 'none';
    juego.style.display = '';
    iniciarSecuenciaPantalla();
  });

  const opciones = ['ctrlaltsupr','enter','esc','f5'];
  const secuencia = [];
  for(let i=0;i<4;i++){ secuencia.push(opciones[Math.floor(Math.random()*4)]); }
  let entradaJugador = [];

  function iniciarSecuenciaPantalla(){
    instruccion.textContent = 'Memoriza la secuencia...';
    let i = 0;
    function flashSiguiente(){
      if(resuelto) return;
      if(i >= secuencia.length){
        const t = setTimeout(()=>{
          if(resuelto) return;
          instruccion.textContent = '¡Ahora repítela, rápido!';
          teclas.forEach(f=>f.disabled = false);
          deadlineTimeout = setTimeout(()=>{
            if(resuelto) return;
            resuelto = true;
            resolverPantallaAzul('tiempo_agotado');
          }, 9500);
          pantallaAzulTimeouts.push(deadlineTimeout);
        }, 400);
        pantallaAzulTimeouts.push(t);
        return;
      }
      const tec = secuencia[i];
      const btn = document.querySelector('.pantalla-tecla[data-t="'+tec+'"]');
      if(btn) btn.classList.add('flash');
      const t1 = setTimeout(()=>{
        if(btn) btn.classList.remove('flash');
        i++;
        const t2 = setTimeout(flashSiguiente, 220);
        pantallaAzulTimeouts.push(t2);
      }, 480);
      pantallaAzulTimeouts.push(t1);
    }
    flashSiguiente();
  }

  teclas.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(resuelto || btn.disabled) return;
      const tec = btn.dataset.t;
      btn.classList.add('press');
      setTimeout(()=>btn.classList.remove('press'), 150);
      const idx = entradaJugador.length;
      entradaJugador.push(tec);
      if(secuencia[idx] !== tec){
        resuelto = true;
        if(deadlineTimeout) clearTimeout(deadlineTimeout);
        resolverPantallaAzul('secuencia_incorrecta');
        return;
      }
      if(entradaJugador.length === secuencia.length){
        resuelto = true;
        if(deadlineTimeout) clearTimeout(deadlineTimeout);
        resolverPantallaAzul('exito');
      }
    });
  });
}
function resolverPantallaAzul(resultado){
  pantallaAzulTimeouts.forEach(t=>clearTimeout(t));
  pantallaAzulTimeouts = [];
  document.querySelectorAll('.pantalla-tecla').forEach(b=>{ b.disabled = true; });
  const intentarBtn = document.getElementById('pantallaIntentarBtn');
  const reiniciarBtn = document.getElementById('pantallaReiniciarBtn');
  if(intentarBtn) intentarBtn.disabled = true;
  if(reiniciarBtn) reiniciarBtn.disabled = true;

  let efectos, mensaje, stampClass, stampTexto;
  if(resultado === 'exito'){
    efectos = {moralEquipo:3};
    stampClass='pos'; stampTexto='EQUIPO SALVADO';
    mensaje = "Reproduces el combo de emergencia justo a tiempo. El equipo vuelve a arrancar sin perder nada — todos respiran de nuevo.";
  } else if(resultado === 'secuencia_incorrecta' || resultado === 'tiempo_agotado'){
    efectos = {moralEquipo:-1};
    stampClass='neg'; stampTexto='TRABAJO PERDIDO';
    mensaje = "Te equivocas de tecla y el equipo se congela por completo. Hay que llamar a soporte técnico y varias horas de trabajo se pierden sin guardar.";
  } else {
    efectos = {moralEquipo:-1};
    stampClass='neu'; stampTexto='REINICIO FORZADO';
    mensaje = "Apagas el equipo de un tirón sin intentar nada más. Rápido y sin drama, aunque el trabajo sin guardar de esa sesión se pierde de todas formas.";
  }
  aplicarYFinalizarEventoOficina('pantallaResult', efectos, mensaje, stampClass, stampTexto);
}

/* ---------- 7) El Correo Enviado a "Todos" (Ventana de reacción cronometrada) ---------- */
function buildCorreoTodos(){ return {tipo:'correo_todos', titulo:'El Correo Enviado a "Todos"'}; }
let correoTodosTimeout = null;
let correoTodosInterval = null;
function renderCorreoTodos(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">📧 CULTURA DE OFICINA</div>
      <h2 class="case-title">El Correo Enviado a "Todos"</h2>
      <p class="case-context">${contextoOficina('correo_todos')}</p>
      <div class="cafe-progreso-wrap"><div class="cafe-progreso-fill" id="correoTimerFill"></div></div>
      <div class="pantalla-intro">
        <button class="oficina-choice-btn" id="correoRecuperarBtn">A) Intentar recuperar el mensaje AHORA</button>
        <button class="oficina-choice-btn" id="correoDejarBtn">B) Dejarlo pasar y esperar a que se calme solo</button>
      </div>
      <div class="oficina-result" id="correoResult"></div>
    </div>
  `;
  let resuelto = false;
  const fill = document.getElementById('correoTimerFill');
  const ventanaMs = 7000;
  const inicio = Date.now();

  document.getElementById('correoRecuperarBtn').addEventListener('click', ()=>{
    if(resuelto) return;
    resuelto = true;
    if(correoTodosInterval){ clearInterval(correoTodosInterval); correoTodosInterval=null; }
    if(correoTodosTimeout){ clearTimeout(correoTodosTimeout); correoTodosTimeout=null; }
    resolverCorreoTodos('recuperado');
  });
  document.getElementById('correoDejarBtn').addEventListener('click', ()=>{
    if(resuelto) return;
    resuelto = true;
    if(correoTodosInterval){ clearInterval(correoTodosInterval); correoTodosInterval=null; }
    if(correoTodosTimeout){ clearTimeout(correoTodosTimeout); correoTodosTimeout=null; }
    resolverCorreoTodos('dejar_pasar');
  });

  correoTodosInterval = setInterval(()=>{
    const transcurrido = Date.now() - inicio;
    const pct = Math.min(100, (transcurrido/ventanaMs)*100);
    if(fill) fill.style.width = pct + '%';
  }, 80);
  correoTodosTimeout = setTimeout(()=>{
    if(resuelto) return;
    resuelto = true;
    if(correoTodosInterval){ clearInterval(correoTodosInterval); correoTodosInterval=null; }
    resolverCorreoTodos('tiempo_agotado');
  }, ventanaMs);
}
function resolverCorreoTodos(resultado){
  if(correoTodosInterval){ clearInterval(correoTodosInterval); correoTodosInterval=null; }
  if(correoTodosTimeout){ clearTimeout(correoTodosTimeout); correoTodosTimeout=null; }
  const recBtn = document.getElementById('correoRecuperarBtn');
  const dejBtn = document.getElementById('correoDejarBtn');
  if(recBtn) recBtn.disabled = true;
  if(dejBtn) dejBtn.disabled = true;

  let efectos, mensaje, stampClass, stampTexto;
  if(resultado === 'recuperado'){
    efectos = {reputacion:1};
    stampClass='pos'; stampTexto='MENSAJE RECUPERADO';
    mensaje = "Alcanzas a recuperarlo a tiempo — la mayoría del equipo ni se entera de que pasó algo.";
  } else if(resultado === 'dejar_pasar'){
    efectos = {moralEquipo:-1};
    stampClass='neu'; stampTexto='SE DEJÓ PASAR';
    mensaje = "Decides no hacer nada y esperar a que el chisme se enfríe solo. Toma unos días, pero eventualmente el tema deja de comentarse.";
  } else {
    efectos = {moralEquipo:-1.5, reputacion:-1};
    stampClass='neg'; stampTexto='SE VOLVIÓ VIRAL INTERNO';
    mensaje = "No reaccionas a tiempo. Para cuando decides algo, ya todo el mundo lo vio, lo comentó, y hasta le tomaron captura de pantalla.";
  }
  aplicarYFinalizarEventoOficina('correoResult', efectos, mensaje, stampClass, stampTexto);
}

/* ---------- 8) La Encuesta de Clima Laboral Obligatoria (Sliders de autoevaluación) ---------- */
function buildEncuestaClima(){ return {tipo:'encuesta_clima', titulo:'La Encuesta de Clima Laboral Obligatoria'}; }
function renderEncuestaClima(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">📋 CULTURA DE OFICINA</div>
      <h2 class="case-title">La Encuesta de Clima Laboral Obligatoria</h2>
      <p class="case-context">${contextoOficina('encuesta_clima')}</p>
      <div class="encuesta-pregunta">
        <div class="encuesta-texto">¿Qué tan sostenible sientes el ritmo de trabajo actual?</div>
        <input type="range" min="1" max="10" value="5" class="clima-slider" id="encuestaSlider1">
      </div>
      <div class="encuesta-pregunta">
        <div class="encuesta-texto">¿Confías en la dirección que está tomando la empresa?</div>
        <input type="range" min="1" max="10" value="5" class="clima-slider" id="encuestaSlider2">
      </div>
      <div class="encuesta-pregunta">
        <div class="encuesta-texto">¿Recomendarías este lugar de trabajo a alguien más?</div>
        <input type="range" min="1" max="10" value="5" class="clima-slider" id="encuestaSlider3">
      </div>
      <button class="oficina-choice-btn" id="encuestaEnviarBtn">Enviar respuestas</button>
      <div class="oficina-result" id="encuestaResult"></div>
    </div>
  `;
  document.getElementById('encuestaEnviarBtn').addEventListener('click', ()=>{
    const v1 = parseInt(document.getElementById('encuestaSlider1').value, 10);
    const v2 = parseInt(document.getElementById('encuestaSlider2').value, 10);
    const v3 = parseInt(document.getElementById('encuestaSlider3').value, 10);
    document.getElementById('encuestaEnviarBtn').disabled = true;
    resolverEncuestaClima((v1+v2+v3)/3);
  });
}
function resolverEncuestaClima(promedio){
  let efectos, mensaje, stampClass, stampTexto;
  if(promedio >= 8){
    efectos = {moralEquipo:2};
    stampClass='neu'; stampTexto='RESPUESTA DEMASIADO POSITIVA';
    mensaje = "Respondes casi todo con la nota más alta. Se ve bien en el reporte de esta semana — aunque nadie que conozca la operación de verdad se lo va a creer del todo.";
    flags.climaMaquillado = true;
    state.scheduledEvents.push({turno: turnNumber + 4, build: eventoClimaDestapado, consumido:false});
  } else if(promedio <= 3){
    efectos = {moralEquipo:2};
    stampClass='neg'; stampTexto='ALERTA ROJA EN RRHH';
    mensaje = "Respondes con total honestidad, incluso lo más incómodo. RRHH programa una reunión urgente contigo — pero al menos el equipo siente que su malestar quedó registrado en algún lado.";
  } else {
    efectos = {moralEquipo:2, reputacion:1};
    stampClass='pos'; stampTexto='RESPUESTA EQUILIBRADA';
    mensaje = "Respondes con honestidad moderada, ni maquillando todo ni exagerando lo malo. El equipo, cuando se entera del resultado agregado, siente que fue una lectura justa.";
  }
  aplicarYFinalizarEventoOficina('encuestaResult', efectos, mensaje, stampClass, stampTexto);
}
function eventoClimaDestapado(s,f){
  return {
    tipo:'karma', titulo:"El equipo se entera de la encuesta maquillada",
    contexto:"Alguien de RRHH comenta, sin mala intención, que tus respuestas a la última encuesta de clima laboral fueron 'las más positivas de toda la gerencia'. El comentario llega al equipo, que sabe perfectamente que la realidad no es esa.",
    choices:[
      {texto:"Reconocerlo abiertamente en la próxima reunión de equipo, sin excusas.", efectos:{moralEquipo:6, reputacion:-1}, consecuencia:"El gesto de reconocerlo sin rodeos recupera más confianza de la que perdiste al maquillar la encuesta. Eso sí, el episodio trasciende la oficina y algunos clientes se enteran."},
      {texto:"Minimizarlo, diciendo que la encuesta 'no capturaba bien el contexto completo'.", efectos:{moralEquipo:-5, reputacion:1}, consecuencia:"La excusa no convence a nadie, y confirma exactamente lo que el equipo ya sospechaba. Hacia afuera, al menos, el tema no trasciende."},
      {texto:"No decir nada y esperar a que el comentario se olvide con el tiempo.", efectos:{moralEquipo:-2}, consecuencia:"El tema se diluye solo, pero deja una pequeña grieta de confianza que no se cierra del todo."},
      {texto:"Compensarlo con una mejora concreta y visible en algo que el equipo sí pidió en la encuesta.", efectos:{caja:-2, moralEquipo:8}, consecuencia:"Una acción concreta pesa más que cualquier explicación — el equipo lo nota y lo agradece."}
    ]
  };
}

/* ---------- 9) El Apagón de 10 Minutos (Priorización bajo presión de tiempo) ---------- */
function buildApagon(){ return {tipo:'apagon', titulo:'El Apagón de 10 Minutos'}; }
let apagonTimeout = null;
let apagonInterval = null;
function renderApagon(c){
  const g = document.getElementById('turnModalContent');
  g.innerHTML = `
    <div class="case-card oficina-card screen-fade-in">
      <div class="case-eyebrow">🔌 CULTURA DE OFICINA</div>
      <h2 class="case-title">El Apagón de 10 Minutos</h2>
      <p class="case-context">${contextoOficina('apagon')}</p>
      <div class="impresora-instruccion">La planta de respaldo solo alcanza para <b>2</b> de estos 4. Elige rápido:</div>
      <div class="cafe-progreso-wrap"><div class="cafe-progreso-fill" id="apagonTimerFill"></div></div>
      <div class="apagon-grid">
        <button class="oficina-choice-btn apagon-opcion" data-item="servidor">🖥️ El servidor</button>
        <button class="oficina-choice-btn apagon-opcion" data-item="nevera">🧊 La nevera de insumos</button>
        <button class="oficina-choice-btn apagon-opcion" data-item="luces">💡 Las luces de la bodega</button>
        <button class="oficina-choice-btn apagon-opcion" data-item="aire">❄️ El aire acondicionado</button>
      </div>
      <div class="oficina-result" id="apagonResult"></div>
    </div>
  `;
  let resuelto = false;
  let elegidos = [];
  const fill = document.getElementById('apagonTimerFill');
  const ventanaMs = 12000;
  const inicio = Date.now();
  const opciones = document.querySelectorAll('.apagon-opcion');

  opciones.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(resuelto || btn.disabled) return;
      const item = btn.dataset.item;
      if(elegidos.includes(item)) return;
      elegidos.push(item);
      btn.classList.add('press');
      btn.disabled = true;
      if(elegidos.length >= 2){
        resuelto = true;
        if(apagonInterval){ clearInterval(apagonInterval); apagonInterval=null; }
        if(apagonTimeout){ clearTimeout(apagonTimeout); apagonTimeout=null; }
        resolverApagon(elegidos);
      }
    });
  });

  apagonInterval = setInterval(()=>{
    const transcurrido = Date.now() - inicio;
    const pct = Math.min(100, (transcurrido/ventanaMs)*100);
    if(fill) fill.style.width = pct + '%';
  }, 80);
  apagonTimeout = setTimeout(()=>{
    if(resuelto) return;
    resuelto = true;
    if(apagonInterval){ clearInterval(apagonInterval); apagonInterval=null; }
    resolverApagon(elegidos);
  }, ventanaMs);
}
function resolverApagon(elegidos){
  if(apagonInterval){ clearInterval(apagonInterval); apagonInterval=null; }
  if(apagonTimeout){ clearTimeout(apagonTimeout); apagonTimeout=null; }
  document.querySelectorAll('.apagon-opcion').forEach(b=>{ b.disabled = true; });

  const protegioServidor = elegidos.includes('servidor');
  const protegioNevera = elegidos.includes('nevera');
  let efectos = {};
  let partes = [];
  if(!protegioServidor){ efectos.ebitda = (efectos.ebitda||0) - 0.5; partes.push("perdiste datos y sistemas que tardan en recuperarse"); }
  if(!protegioNevera){ efectos.caja = (efectos.caja||0) - 0.4; partes.push("se dañaron insumos que había en la nevera"); }
  if(protegioServidor && protegioNevera){ efectos.moralEquipo = 2; }
  if(elegidos.length < 2){ efectos.moralEquipo = (efectos.moralEquipo||0) - 1; }

  let stampClass, stampTexto, mensaje;
  if(protegioServidor && protegioNevera){
    stampClass='pos'; stampTexto='PRIORIZACIÓN PERFECTA';
    mensaje = "Salvas lo más crítico de la operación: el servidor y los insumos de la nevera. Las luces y el aire se apagan, pero eso se resuelve solo cuando vuelve la luz.";
  } else if(elegidos.length < 2){
    stampClass='neg'; stampTexto='SE ACABÓ EL TIEMPO';
    mensaje = "No alcanzas a decidir a tiempo. La planta de respaldo se reparte mal entre todo" + (partes.length ? ", y " + partes.join(" y ") + "." : ", por suerte el daño termina siendo menor al esperado.");
  } else {
    stampClass='neu'; stampTexto='PRIORIZACIÓN PARCIAL';
    mensaje = "Tomas una decisión rápida bajo presión" + (partes.length ? ", aunque " + partes.join(" y ") + "." : ", y logras minimizar el daño.");
  }
  aplicarYFinalizarEventoOficina('apagonResult', efectos, mensaje, stampClass, stampTexto);
}

const OFICINA_EVENTS_POOL = [buildClimaCaos, buildDilemaCafe, buildCumpleInoportuno, buildGuerraNevera, buildImpresoraAtascada, buildPantallaAzul, buildCorreoTodos, buildEncuestaClima, buildApagon];
const OFICINA_RENDER_POR_TIPO = {
  clima_caos: renderClimaCaos,
  dilema_cafe: renderDilemaCafe,
  cumple_inoportuno: renderCumpleInoportuno,
  guerra_nevera: renderGuerraNevera,
  impresora_atascada: renderImpresoraAtascada,
  pantalla_azul: renderPantallaAzul,
  correo_todos: renderCorreoTodos,
  encuesta_clima: renderEncuestaClima,
  apagon: renderApagon
};
// Selección ponderada entre los 9 eventos: Climatización del Caos queda con menos peso
// que el resto, que se reparten el resto casi por igual.
function pickEventoOficinaPonderadoBruto(){
  const r = Math.random();
  if(r < 0.08) return buildClimaCaos();
  if(r < 0.20) return buildDilemaCafe();
  if(r < 0.32) return buildCumpleInoportuno();
  if(r < 0.44) return buildGuerraNevera();
  if(r < 0.56) return buildImpresoraAtascada();
  if(r < 0.67) return buildPantallaAzul();
  if(r < 0.78) return buildCorreoTodos();
  if(r < 0.89) return buildEncuestaClima();
  return buildApagon();
}
// Bloqueo de repetición: un evento que ya salió no puede volver a salir hasta que hayan
// pasado otros 2 eventos distintos — evita que la misma situación se sienta repetitiva.
let historialOficinaReciente = [];
function pickEventoOficinaPonderado(){
  let elegido, intentos = 0;
  do {
    elegido = pickEventoOficinaPonderadoBruto();
    intentos++;
  } while(historialOficinaReciente.includes(elegido.tipo) && intentos < 25);
  historialOficinaReciente.push(elegido.tipo);
  if(historialOficinaReciente.length > 2) historialOficinaReciente.shift();
  return elegido;
}

