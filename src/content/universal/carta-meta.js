/* =========================================================================================
   LA CARTA META — "El Comité te observa". Reutiliza el mismo análisis de patrón que ya usa
   el final oculto (detectarPatronGenerosidad), pero consultado A MITAD DE PARTIDA en vez de
   solo al cierre. Aparece como mucho una vez por partida, con un tratamiento visual y sonoro
   propio — no es un caso más de gestión, es el juego mismo mirándote de vuelta.
   ========================================================================================= */
const CARTA_META_COMITE = {
  id:'meta_comite',
  trigger:(s,f)=>{
    if(turnNumber < 9) return false;
    const patron = detectarPatronGenerosidad();
    return patron.generosas >= 5 && patron.mercantiles === 0;
  },
  build:(s,f)=>({
    tipo:'meta_comite', titulo:"El Comité te observa",
    contexto:"Hay una pausa distinta en el ritmo habitual del día. Entre tus documentos aparece una nota, sin firma: 'Hemos estado observando. Turno tras turno, cuando pudiste elegir el balance por encima de tu gente, la mayoría de las veces no lo hiciste. Interesante.' No dice quién la escribió. No hacía falta.",
    choices:[
      {texto:"Ignorar la nota y seguir con la agenda del día.", efectos:{reputacion:-0.3}, consecuencia:"La nota queda en un cajón, aunque no se te olvida del todo."},
      {texto:"Guardarla, incómodo con que alguien lleve esa cuenta de ti.", efectos:{reputacion:1}, consecuencia:"La incomodidad de sentirte observado no desaparece, pero tampoco cambia cómo decides."},
      {texto:"Preguntar abiertamente en la oficina quién la dejó ahí.", efectos:{moralEquipo:1}, consecuencia:"Nadie admite haberla escrito. El gesto de preguntar, aun así, no pasa desapercibido para el equipo."},
      {texto:"Tomarlo como una validación silenciosa de tu forma de liderar.", efectos:{moralEquipo:2, reputacion:1}, consecuencia:"Sea quien sea que la escribió, decides quedarte con la parte que se siente como un reconocimiento."}
    ]
  })
};

