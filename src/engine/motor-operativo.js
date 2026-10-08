/* =========================================================================================
   MOTOR OPERATIVO — una pequeña deriva pasiva, calculada UNA VEZ por turno real (nunca en
   decisiones extra), que refleja que la empresa sigue funcionando entre una decisión y la
   siguiente. Cada relación es diminuta a propósito (una fracción de lo que cualquier
   decisión normal movería) y tiene un tope de velocidad individual — para que sea textura
   de fondo, nunca el motor principal de la partida ni una espiral que se acelera sola.
   ========================================================================================= */
const MOTOR_OPERATIVO_TOPE = 1.2; // ningún indicador deriva más que esto en un solo turno,
                                   // sin importar cuántas relaciones lo empujen a la vez.
function aplicarMotorOperativo(){
  if(!state || !sectorActual) return;
  const cambios = {};
  const suma = (k,v)=>{ cambios[k] = (cambios[k]||0) + v; };

  // El motor ya no empuja todo hacia el centro por igual: amplifica la dirección en la que
  // ya vas. Un negocio sano mejora solo, pero despacio; uno en problemas empeora solo, y más
  // rápido si no se atiende — así se parece más a cómo funciona un negocio real.

  // Caja: EBITDA sano la genera despacio; EBITDA negativo la drena más rápido.
  if(state.ebitda != null) suma('caja', state.ebitda > 0 ? clamp(state.ebitda * 0.04, 0, 0.5) : clamp(state.ebitda * (dificultadSeleccionada==='facil'?0.06:0.09), -0.9, 0));

  // Deuda: solo se amortiza sola si tu EBITDA es positivo (hay con qué pagarla). Si tu
  // EBITDA es negativo, la deuda crece sola — más despacio en fácil, para que un camino
  // deliberadamente humano ahí todavía te dé margen de sobrevivir hasta el cierre del año.
  if(state.deuda != null && state.deuda > 0){
    if(state.ebitda != null && state.ebitda > 0){
      suma('deuda', -Math.min(0.3, state.deuda * 0.01));
    } else {
      const tasaCrecimiento = dificultadSeleccionada==='facil' ? 0.009 : 0.016;
      suma('deuda', Math.min(0.45, state.deuda * tasaCrecimiento));
    }
  }

  // El WACC se acerca al nivel que "debería" tener según tu confianza bancaria — pero subir
  // (empeorar) es más rápido que bajar (mejorar), igual que en la vida real: ganarte la
  // confianza de un banco toma tiempo; perderla es casi inmediato.
  if(state.wacc != null && state.confianzaBanco != null){
    const objetivo = 20 - (state.confianzaBanco/100)*8;
    const diff = objetivo - state.wacc;
    suma('wacc', clamp(diff * (diff < 0 ? 0.05 : 0.12), -0.35, 0.35));
  }

  // Razón corriente: el mismo empuje de siempre, pero deteriorarse pesa más que mejorar.
  if(state.razonCorriente != null && state.caja != null && state.deuda != null){
    const empuje = ((state.caja - 22) * 0.006) - ((state.deuda - 18) * 0.004);
    suma('razonCorriente', clamp(empuje * (empuje < 0 ? 1.3 : 0.7), -0.06, 0.06));
  }

  if(sectorActual.tieneInventario && state.diasInventario != null){
    // Inventario que rota mal (muchos días) erosiona su propio valor con el tiempo.
    if(state.valorInventario != null && state.diasInventario > 55){
      suma('valorInventario', -Math.min(0.6, (state.diasInventario - 55) * 0.02));
    }
  }

  // EBITDA: la ineficiencia de capital de trabajo pesa más de lo que premia la eficiencia.
  let eficiencia = 0;
  if(state.diasCartera != null){
    if(state.diasCartera < 35) eficiencia += 0.06; else if(state.diasCartera > 70) eficiencia -= 0.16;
  }
  if(sectorActual.tieneInventario && state.diasInventario != null){
    if(state.diasInventario < 30) eficiencia += 0.04; else if(state.diasInventario > 55) eficiencia -= 0.11;
  }
  if(eficiencia !== 0) suma('ebitda', eficiencia);

  // Confianza de proveedores y bancaria: perderla por caja/deuda débil pesa más que ganarla
  // por caja/deuda sana — la desconfianza se instala más rápido de lo que se reconstruye.
  if(state.confianzaProveedores != null && state.caja != null){
    suma('confianzaProveedores', state.caja > 25 ? 0.12 : state.caja < 10 ? -0.3 : 0);
  }
  if(state.confianzaBanco != null && state.deuda != null){
    suma('confianzaBanco', state.deuda < 20 ? 0.12 : state.deuda > 35 ? -0.3 : 0);
  }

  // Reputación deriva hacia el promedio de cómo tratas a tu gente y tus socios — pero cae
  // más rápido de lo que sube, igual que cualquier imagen pública real.
  if(state.reputacion != null){
    const partes = [state.moralEquipo, state.confianzaProveedores, state.confianzaBanco].filter(v=>v!=null);
    if(partes.length){
      const promedioInterno = partes.reduce((a,b)=>a+b,0) / partes.length;
      const diff = promedioInterno - state.reputacion;
      suma('reputacion', clamp(diff * (diff > 0 ? 0.02 : 0.06), -0.4, 0.4));
    }
  }

  // Moral del equipo: se deteriora un poco si llevas varios turnos sin invertir en la
  // operación — pero, a diferencia de antes, también puede subir sola cuando la empresa
  // está genuinamente sana, la misma lógica pasiva que ya tienen confianza y reputación.
  if(state.moralEquipo != null){
    if(sectorActual.requiereCapex && (state.turnosSinCapex||0) >= 2){
      suma('moralEquipo', -0.3);
    } else if(state.ebitda != null && state.ebitda > 5){
      suma('moralEquipo', 0.25);
    }
  }

  Object.keys(cambios).forEach(k=>{ cambios[k] = clamp(cambios[k], -MOTOR_OPERATIVO_TOPE, MOTOR_OPERATIVO_TOPE); });
  if(Object.keys(cambios).length) applyEfectos(cambios, 'pasivo');
}

// Si un indicador YA está en zona crítica, mejorarlo cuesta más esfuerzo del que una sola
// decisión puede dar de golpe — el tope solo aplica para mejorar; empeorar nunca tiene freno.
function ajustarDeltaSiCritico(key, delta){
  if(!delta || !state) return delta;
  const valorActual = state[key];
  if(valorActual == null) return delta;
  const esRelacional = ['confianzaProveedores','confianzaBanco','reputacion','moralEquipo'].includes(key);
  const critico = esRelacional ? statusPill(valorActual).tier === 'critico' : colorFor(key, valorActual) === 'danger';
  if(!critico) return delta;
  const mejora = esMejorSiSube(key) ? delta > 0 : delta < 0;
  return mejora ? delta * 0.4 : delta;
}
function applyEfectos(e, origen){
  systemicNotes = [];
  origenUltimoCambio = {};
  if(!e) return;
  const marcarOrigen = (obj)=>{ Object.keys(obj).forEach(k=>{ if(obj[k]) origenUltimoCambio[k] = origen||'decision'; }); };
  marcarOrigen(e);
  if(e.caja) state.caja += ajustarDeltaSiCritico('caja', e.caja);
  if(e.capitalTrabajo) state.capitalTrabajo += ajustarDeltaSiCritico('capitalTrabajo', e.capitalTrabajo);
  if(e.razonCorriente) state.razonCorriente = clamp(state.razonCorriente + ajustarDeltaSiCritico('razonCorriente', e.razonCorriente), 0, 5);
  if(e.deuda) state.deuda = Math.max(0, state.deuda + ajustarDeltaSiCritico('deuda', e.deuda));
  if(e.ebitda) state.ebitda += ajustarDeltaSiCritico('ebitda', e.ebitda);
  if(e.wacc) state.wacc = clamp(state.wacc + ajustarDeltaSiCritico('wacc', e.wacc), 5, 35);
  if(e.diasInventario && state.diasInventario!=null) state.diasInventario = Math.max(0, state.diasInventario + ajustarDeltaSiCritico('diasInventario', e.diasInventario));
  if(e.diasCartera) state.diasCartera = Math.max(0, state.diasCartera + ajustarDeltaSiCritico('diasCartera', e.diasCartera));
  if(e.valorInventario && state.valorInventario!=null) state.valorInventario = Math.max(0, state.valorInventario + ajustarDeltaSiCritico('valorInventario', e.valorInventario));
  if(e.confianzaProveedores) state.confianzaProveedores = clamp(state.confianzaProveedores + ajustarDeltaSiCritico('confianzaProveedores', e.confianzaProveedores), 0, 100);
  if(e.confianzaBanco) state.confianzaBanco = clamp(state.confianzaBanco + ajustarDeltaSiCritico('confianzaBanco', e.confianzaBanco), 0, 100);
  if(e.reputacion) state.reputacion = clamp(state.reputacion + ajustarDeltaSiCritico('reputacion', e.reputacion), 0, 100);
  if(e.moralEquipo && state.moralEquipo!=null) state.moralEquipo = clamp(state.moralEquipo + ajustarDeltaSiCritico('moralEquipo', e.moralEquipo), 0, 100);

  /* Correlación automática: Caja, Deuda y Capital de Trabajo son, en la vida real, insumos
     directos del cálculo de la Razón Corriente (Activo Corriente ÷ Pasivo Corriente). Si la
     decisión ya trae su propio ajuste manual de razonCorriente (autoría fina caso por caso),
     respetamos ese número tal cual. Si NO lo trae pero SÍ movió caja/deuda/capital de trabajo,
     aplicamos un arrastre proporcional automático para que el indicador nunca quede "congelado". */
  if(e.razonCorriente === undefined){
    let arrastre = 0;
    if(e.caja) arrastre += e.caja * 0.012;
    if(e.deuda) arrastre -= e.deuda * 0.010;
    if(e.capitalTrabajo) arrastre += e.capitalTrabajo * 0.015;
    if(arrastre !== 0){
      state.razonCorriente = clamp(Math.round((state.razonCorriente + arrastre)*100)/100, 0.1, 5);
    }
  }

  if(state.razonCorriente < 1.0){
    state.wacc = clamp(state.wacc + 2, 5, 35);
    systemicNotes.push("Tu razón corriente cayó por debajo de 1.0: el mercado penaliza automáticamente tu costo de capital (<b>WACC +2 puntos</b>) porque tu capacidad de pago inmediata quedó comprometida.");
  }
  if(state.deuda >= 40){
    state.wacc = clamp(state.wacc + 0.3, 5, 35);
    systemicNotes.push("Tu endeudamiento superó los $40M: cualquier acreedor nuevo te percibe como más riesgoso, así que tu WACC sube un poco cada turno mientras te mantengas en ese nivel.");
  }
  if(state.ebitda > 1 && (state.deuda/state.ebitda) >= 4){
    state.wacc = clamp(state.wacc + 0.3, 5, 35);
    systemicNotes.push("Tu relación Deuda/EBITDA superó 4x: para cualquier analista de crédito ese es un apalancamiento alto, y el mercado te cobra un WACC más caro por el riesgo adicional.");
  }
  if(state.confianzaBanco <= 35){
    state.wacc = clamp(state.wacc + 0.2, 5, 35);
    systemicNotes.push("Tu relación bancaria está deteriorada: el banco encarece marginalmente cualquier condición nueva que te ofrece.");
  }
  if(state.caja <= 8){
    state.confianzaBanco = clamp(state.confianzaBanco - 2, 0, 100);
    systemicNotes.push("Tu caja está en niveles críticos: el banco lo nota en tus movimientos y reduce silenciosamente su confianza en tu capacidad de pago (<b>Confianza bancaria -2</b>).");
    state.confianzaProveedores = clamp(state.confianzaProveedores - 2, 0, 100);
    systemicNotes.push("Con la caja en niveles críticos, tus proveedores empiezan a sentir el riesgo de no cobrar y se ponen más exigentes (<b>Confianza de proveedores -2</b>).");
  }
  if(state.diasCartera >= 90){
    state.wacc = clamp(state.wacc + 0.2, 5, 35);
    systemicNotes.push("Tu cartera lleva más de 90 días en promedio sin cobrarse: el mercado empieza a tratar esa cartera como un riesgo de crédito más, no como un activo líquido.");
  }
  if(sectorActual.perecedero && state.diasInventario!=null && state.diasInventario >= 70){
    state.ebitda -= 3;
    systemicNotes.push("Tu inventario perecedero lleva demasiados días en bodega: una parte se dañó o quedó fuera de temporada, y la pérdida se registra directo contra el <b>EBITDA (-3)</b>.");
  }
  if(!sectorActual.perecedero && sectorActual.tieneInventario && state.diasInventario!=null && state.diasInventario >= 75){
    state.ebitda -= 1;
    systemicNotes.push("Tu inventario lleva demasiado tiempo sin rotar: los costos de almacenamiento y el riesgo de obsolescencia ya están pesando sobre tu <b>EBITDA (-1)</b>.");
  }
  if(sectorActual.id==='technova' && state.moralEquipo!=null && state.moralEquipo <= 30 && !flags.fugaCerebrosActiva){
    state.ebitda -= 2;
    systemicNotes.push("La moral del equipo técnico está en mínimos: la productividad de desarrollo cae y eso ya se refleja en tu <b>EBITDA (-2)</b>, incluso antes de que nadie renuncie formalmente.");
  } else if(sectorActual.id!=='technova' && state.moralEquipo!=null && state.moralEquipo <= 30){
    state.ebitda -= 1;
    systemicNotes.push("La moral del equipo está en mínimos: el ausentismo y la baja productividad ya están pesando sobre tu <b>EBITDA (-1)</b>.");
  }

  /* Medidores de doble filo: el umbral se acerca (no hace falta llegar a 100) y la intensidad
     sube según la dificultad elegida — en Difícil, un indicador demasiado alto pesa más. */
  const umbralTecho = umbralTechoActual();
  const intensidadTecho = intensidadTechoActual();

  if(state.moralEquipo!=null && state.moralEquipo >= umbralTecho){
    const golpe = Math.round(1.2 * intensidadTecho * 10)/10;
    state.ebitda -= golpe;
    origenUltimoCambio.ebitda = 'pasivo';
    systemicNotes.push(`La moral del equipo está tan alta que roza la complacencia: sin ninguna presión real, el ritmo de trabajo se relaja y eso ya golpea tu <b>EBITDA (-${golpe})</b>.`);
  }
  if(state.confianzaBanco >= umbralTecho){
    const golpe = Math.round(1.2 * intensidadTecho * 10)/10;
    state.deuda += golpe;
    origenUltimoCambio.deuda = 'pasivo';
    systemicNotes.push(`Tu confianza bancaria es tan alta que el banco te ofrece líneas de crédito constantemente — la tentación de usarlas ya se refleja en tu <b>Endeudamiento (+${golpe})</b>, lo hayas pedido explícitamente o no.`);
  }
  if(state.reputacion >= umbralTecho){
    const golpe = Math.round(0.8 * intensidadTecho * 10)/10;
    state.caja -= golpe;
    origenUltimoCambio.caja = 'pasivo';
    systemicNotes.push(`Tu reputación es tan alta que estás bajo escrutinio mediático constante: cualquier gesto, por mínimo que sea, se convierte en gasto de relaciones públicas y manejo de imagen (<b>Caja -${golpe}</b>).`);
  }

  /* Consecuencias PERMANENTES de las 4 cadenas profundas: a diferencia de un eco puntual,
     el desenlace negativo de estas historias deja una marca mecánica que se repite cada
     turno por el resto de la partida — el peso real de una cadena completa, no solo texto. */
  if(flags.renataSeFue){
    state.ebitda -= 0.4;
    origenUltimoCambio.ebitda = 'pasivo';
    systemicNotes.push("La salida de Renata Cifuentes todavía se siente en la operación: el conocimiento que se fue con ella no se ha terminado de reconstruir (<b>EBITDA -0.4</b>).");
  }
  if(flags.auditoriaSancionado){
    state.wacc = clamp(state.wacc + 0.4, 5, 35);
    origenUltimoCambio.wacc = 'pasivo';
    systemicNotes.push("La sanción fiscal quedó registrada en tu historial de cumplimiento: cualquier acreedor la revisa antes de prestarte, y eso ya está encareciendo tu <b>WACC</b> de forma permanente.");
  }
  if(flags.selloRechazado){
    state.reputacion = clamp(Math.min(state.reputacion, 78), 0, 100);
    origenUltimoCambio.reputacion = 'pasivo';
    systemicNotes.push("El rechazo público de la fundación quedó dando vueltas: mientras esa sombra siga presente, tu <b>reputación</b> tiene un techo más bajo del que tendría en otras condiciones.");
  }
  if(flags.reestructuracionFallida){
    state.wacc = clamp(state.wacc + 0.3, 5, 35);
    origenUltimoCambio.wacc = 'pasivo';
    systemicNotes.push("La estructura financiera que nunca terminaste de corregir sigue pesando: el mercado te reprecia como un riesgo mayor cada vez que necesitas capital, encareciendo tu <b>WACC</b> de forma permanente.");
  }
}

