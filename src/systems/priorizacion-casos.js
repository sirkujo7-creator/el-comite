function caseTocaIndicador(build, indicador){
  try{
    const c = build(state, flags);
    if(!c || !Array.isArray(c.choices)) return false;
    return c.choices.some(ch=>ch.efectos && ch.efectos[indicador]!=null && Math.abs(ch.efectos[indicador])>0);
  } catch(e){ return false; }
}
// En vez de sacar del bag de forma puramente aleatoria, si hay un indicador en alerta
// intenta primero encontrar un caso que realmente lo toque — sin perder la variedad
// cuando no hay ninguna alerta activa.
function elegirDeBagPriorizado(bag){
  const indicador = indicadorPrioritario();
  if(indicador){
    // solo una coincidencia que no se haya mostrado hace poco — si la unica opcion
    // disponible ya salio recientemente, mejor no forzarla que repetirla sin parar
    const idx = bag.findIndex(build=>{
      if(!caseTocaIndicador(build, indicador)) return false;
      try{ return !historialTitulosRecientes.includes(build(state, flags).titulo); }catch(e){ return true; }
    });
    if(idx !== -1){
      const [elegido] = bag.splice(idx, 1);
      return elegido;
    }
  }
  return bag.pop();
}
// Busca, de forma robusta, un caso que toque el indicador dado — recarga la bolsa
// completa si hace falta, en vez de rendirse solo porque el sorteo previo ya la vació
// o no le tocó un caso relevante por casualidad.
// Se recuerdan todos los títulos mostrados en la partida (se reinicia en initState) para que
// la búsqueda por indicador nunca repita un caso ya visto: si un indicador pasa muchos turnos
// en crítico y solo hay pocos casos que lo toquen, mejor no forzar nada que repetir.
let historialTitulosRecientes = [];
function registrarTituloReciente(titulo){
  if(!titulo) return;
  historialTitulosRecientes.push(titulo);
}
function buscarCasoParaIndicador(indicador){
  // solo una coincidencia que no se haya mostrado hace poco — si la unica opcion
  // disponible ya salio recientemente, mejor devolver null (y que el juego siga su
  // curso normal) que forzar la misma historia otra vez.
  const buscarNoReciente = ()=> randomBag.findIndex(build=>{
    if(!caseTocaIndicador(build, indicador)) return false;
    try{ return !historialTitulosRecientes.includes(build(state, flags).titulo); }catch(e){ return true; }
  });
  if(randomBag.length===0) randomBag = shuffle(sectorActual.random.concat(poolUniversalParaCategoria(sectorActual.categoria)));
  let idx = buscarNoReciente();
  if(idx === -1){
    randomBag = shuffle(sectorActual.random.concat(poolUniversalParaCategoria(sectorActual.categoria)));
    idx = buscarNoReciente();
  }
  if(idx === -1) return null;
  const [build] = randomBag.splice(idx, 1);
  return build(state, flags);
}
// Decisión adicional dentro del mismo turno: si tras resolver una decisión la empresa
// SIGUE con algún indicador en zona crítica, ofrece una decisión más — enfocada en
// ese indicador — antes de avanzar de turno. Máximo una por turno real, para no romper
// la cadencia de la Junta, el elenco y las cadenas, todas ancladas a turnNumber.
function elegirDecisionExtra(){
  const alertas = indicadoresEnAlerta().filter(a=>a.nivel==='critico');
  if(!alertas.length) return null;
  const indicador = alertas[Math.floor(Math.random()*alertas.length)].key;
  const caso = buscarCasoParaIndicador(indicador);
  if(!caso) return null;
  caso.esDecisionExtra = true;
  return caso;
}
