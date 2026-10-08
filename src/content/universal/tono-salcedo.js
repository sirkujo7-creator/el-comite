/* =========================================================
   TOÑO SALCEDO — un NPC con nombre propio cuyo destino queda
   ligado a cómo lo trataste. Reaparece varios turnos después
   (micro-arco encadenado vía disparar/scheduledEvents).
   ========================================================= */
function eventoTonoReaparece(s,f){
  if(f.tonoAyudado){
    return {
      tipo:'karma', titulo:"Toño vuelve a tocar la puerta", retrato: RETRATO_TONO, presentacion:"El mensajero de toda la vida vuelve a la oficina — esta vez no a pedir nada.",
      contexto: f.tonoAyudaGrande
        ? "Han pasado unas semanas. Toño Salcedo, el mensajero al que le diste el adelanto completo sin condiciones, se aparece por la oficina — no a pedir nada esta vez, sino a avisarte que un competidor le ofreció el doble por cambiarse de bando y llevarse consigo el conocimiento de tus rutas y clientes habituales. Le dijo que no."
        : "Han pasado unas semanas. Toño Salcedo, el mensajero al que ayudaste cuando lo necesitó, se aparece por la oficina — no a pedir nada esta vez, sino a avisarte que un competidor le ofreció el doble por cambiarse de bando y llevarse consigo el conocimiento de tus rutas y clientes habituales. Le dijo que no.",
      choices:[
        {texto:"Agradecerle formalmente y subirle el sueldo de forma permanente, no solo un bono.", efectos:{caja:-1, moralEquipo:6, reputacion:2},
         consecuencia:"El gesto se nota en todo el equipo: la lealtad, cuando se paga de vuelta, se multiplica."},
        {texto:"Darle un bono único en efectivo por el gesto, sin cambiar su condición permanente.", efectos:{caja:-0.6, moralEquipo:3},
         consecuencia:"Toño lo agradece, aunque en el fondo sabe que un bono no es lo mismo que un compromiso real."},
        {texto:"Agradecerle de palabra, sin ningún gesto económico de por medio.", efectos:{moralEquipo:1},
         consecuencia:"Toño se va conforme con haber hecho lo correcto, aunque el resto del equipo nota que aquí la lealtad no siempre se retribuye."},
        {texto:"Aprovechar la información para presionar legalmente al competidor por competencia desleal.", efectos:{reputacion:-2, caja:-1},
         consecuencia:"Ganas una pelea legal menor, pero el ambiente se enrarece: Toño no esperaba que su lealtad terminara en un pleito de abogados."}
      ]
    };
  } else {
    return {
      tipo:'karma', titulo:"La silla de Toño está vacía", retrato: RETRATO_TONO, presentacion:"Han pasado unas semanas desde una decisión que tomaste sobre Toño Salcedo.",
      contexto:"Han pasado unas semanas desde que le negaste el adelanto a Toño Salcedo, el mensajero que llevaba años con la empresa. Hoy te avisan que renunció sin previo aviso — se fue a trabajar con un competidor que sí le dio una mano cuando la necesitó. Se lleva consigo años de rutas memorizadas, relaciones con clientes, y una historia que ya circula entre el resto del equipo.",
      choices:[
        {texto:"Contratar de urgencia un reemplazo externo, sin mirar atrás.", efectos:{caja:-1.5, moralEquipo:-2},
         consecuencia:"Cubres el puesto, pero la curva de aprendizaje y el mensaje que quedó flotando en el equipo cuestan más de lo que se ve en la caja."},
        {texto:"Reunir al equipo para explicar la decisión y escuchar cómo lo vivieron.", efectos:{moralEquipo:2, ebitda:-1.5},
         consecuencia:"No trae a Toño de vuelta, pero al menos el equipo siente que su salida no pasó desapercibida. Mientras tanto, el puesto sigue vacío y su trabajo se reparte como se puede."},
        {texto:"Llamarlo para ofrecerle regresar, ahora sí con el adelanto que pidió.", efectos:{caja:-2, moralEquipo:4},
         consecuencia:"Toño valora el gesto tardío, aunque ambos saben que la confianza rota tarda más en repararse que en romperse."},
        {texto:"No hacer nada especial: la rotación de personal es parte normal del negocio.", efectos:{moralEquipo:-3, ebitda:-1},
         consecuencia:"El resto del equipo saca sus propias conclusiones sobre qué tan lejos llega tu lealtad hacia ellos. El trabajo de Toño, mientras tanto, se reparte entre los demás."}
      ]
    };
  }
}

