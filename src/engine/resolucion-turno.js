/* =========================================================
   MOTOR: RESOLUCIÓN DE TURNO (con dificultad dinámica)
   ========================================================= */
function resolveTurn(){
  turnNumber++;
  if(turnNumber > MAX_TURNS) return null;

  const dueOblig = state.obligaciones.filter(o=>!o.pagada && o.vence<=turnNumber);
  if(dueOblig.length){ dueOblig.forEach(o=>o.pagada=true); return buildVencimientoCase(dueOblig); }

  const dueEv = state.scheduledEvents.find(e=>!e.consumido && e.turno<=turnNumber);
  if(dueEv){ dueEv.consumido = true; return dueEv.build(state, flags); }

  if(turnNumber>=4 && !usedFixed.turno4){ usedFixed.turno4=true; return sectorActual.calendario[0](state,flags); }
  if(turnNumber>=8 && !usedFixed.turno8){ usedFixed.turno8=true; return sectorActual.calendario[1](state,flags); }

  if(turnNumber>=nextBoardTurn){ nextBoardTurn += 5; return buildJuntaTrimestral(); }

  // PRIORIDAD DE EMERGENCIA: si algún indicador está en rojo, se atiende de inmediato —
  // por encima del karma, el elenco, las cadenas, los minijuegos y la cola principal.
  // Antes esto solo se consultaba dentro del 28% del pool aleatorio (que además compite
  // con minijuegos y la cola fija), así que casi nunca llegaba a activarse en la práctica.
  const mercyEmergencia = healthScore(state) < 15;
  if(!mercyEmergencia){
    const criticos = indicadoresEnAlerta().filter(a=>a.nivel==='critico');
    if(criticos.length && Math.random() < 0.7){
      const indicador = criticos[Math.floor(Math.random()*criticos.length)].key;
      const caso = buscarCasoParaIndicador(indicador);
      if(caso) return caso;
    }
  }

  for(const k of KARMA_CASES){
    if(!usedKarma[k.id] && k.trigger(state,flags)){ usedKarma[k.id]=true; return k.build(state,flags); }
  }
  if(sectorActual.karmaExtra){
    for(const k of sectorActual.karmaExtra){
      if(!usedKarma[k.id] && k.trigger(state,flags)){ usedKarma[k.id]=true; return k.build(state,flags); }
    }
  }
  for(const k of ELENCO_INDICADORES){
    if(!usedKarma[k.id] && k.trigger(state,flags)){ usedKarma[k.id]=true; return k.build(state,flags); }
  }
  if(!usedKarma[CARTA_META_COMITE.id] && CARTA_META_COMITE.trigger(state,flags)){
    usedKarma[CARTA_META_COMITE.id] = true;
    return CARTA_META_COMITE.build(state,flags);
  }
  for(const k of CADENAS_PROFUNDAS){
    if(!usedKarma[k.id] && k.trigger(state,flags)){ usedKarma[k.id]=true; return k.build(state,flags); }
  }

  // Una sola tirada aleatoria reparte entre los 4 minijuegos (en vez de 4 chequeos
  // secuenciales, que sesgaban la frecuencia hacia el primero de la lista). Frecuencia
  // total reducida: son para amenizar el juego, no para dominar el rumbo de la partida.
  const rMinijuego = Math.random();
  if(rMinijuego < 0.12){
    return buildAuditoriaRelampago();
  } else if(rMinijuego < 0.22){
    return buildMercadoVolatil();
  } else if(rMinijuego < 0.30){
    return buildBandejaEntrada();
  } else if(rMinijuego < 0.36){
    return buildFugaCapital();
  }

  const health = healthScore(state);
  if(!cisneNegroMostrado && turnNumber>=7 && health>=95){
    cisneNegroMostrado = true;
    return pick(BLACK_SWAN_POOL)(state,flags);
  }

  const mercy = health < 15;
  if(!mercy && Math.random() < 0.28 && mainQueue.length){
    if(randomBag.length===0) randomBag = shuffle(sectorActual.random.concat(poolUniversalParaCategoria(sectorActual.categoria)));
    const picked = elegirDeBagPriorizado(randomBag);
    return picked(state,flags);
  }

  if(mainQueue.length){
    let next = mainQueue.shift();
    if(typeof next === 'function') next = next(state,flags);
    return next;
  }
  return null;
}

function buildVencimientoCase(due){
  const total = Math.round(due.reduce((a,o)=>a+o.monto,0)*10)/10;
  const tipo = due[0].tipo;
  const motivos = due.map(o=>o.motivo).join('; ');
  const perfil = {
    proveedor:{sujeto:'Tus proveedores', verbo:'te cobran', neg:'ellos', kpiNeg:'confianzaProveedores'},
    banco:{sujeto:'El banco', verbo:'te cobra', neg:'el banco', kpiNeg:'confianzaBanco'},
    nomina:{sujeto:'El equipo', verbo:'te reclama', neg:'el equipo', kpiNeg:'confianzaProveedores'},
  }[tipo] || {sujeto:'Tu acreedor', verbo:'te cobra', neg:'la contraparte', kpiNeg:'confianzaProveedores'};

  const negEfectos = {}; negEfectos[perfil.kpiNeg] = -20;

  return {
    tipo:'vencimiento',
    titulo:"Vence una obligación diferida",
    contexto:`Llegó el momento de pagar lo que aplazaste: ${motivos}. ${perfil.sujeto} ${perfil.verbo} ${fmtMoney(total)} y esta vez no acepta más demoras sin consecuencias.`,
    choices:[
      {texto:`Pagar de contado los ${fmtMoney(total)} completos.`, efectos:{caja:-total},
       consecuencia:"Cubres la obligación por completo. Tu caja absorbe el golpe de lleno — exactamente lo que dejaste programado hace unos turnos."},
      {texto:"Tomar un crédito de emergencia a corto plazo para cubrir el pago.", efectos:{deuda: Math.round(total*1.15*10)/10, wacc:1.5, caja:-1},
       consecuencia:"Consigues el desembolso por la vía rápida — y cara: la tasa refleja que llegaste a negociar con el agua al cuello."},
      {texto:`Negociar una extensión adicional con ${perfil.neg}.`, efectos:negEfectos,
       diferir:{monto: Math.round(total*1.1*10)/10, turnos:2, motivo:`Extensión de: ${motivos}`, tipo},
       consecuencia:"Te dan un respiro, pero la deuda original creció y queda programada para el siguiente vencimiento, con menos paciencia disponible."},
      {texto:"Ofrecer un activo no estratégico como garantía a cambio de una extensión más barata.", efectos:{razonCorriente:-0.05},
       diferir:{monto: Math.round(total*1.05*10)/10, turnos:3, motivo:`Extensión con garantía de: ${motivos}`, tipo},
       consecuencia:"Consigues una extensión más barata que el crédito de emergencia, aunque ese activo deja de estar libre para otras negociaciones futuras."}
    ]
  };
}

