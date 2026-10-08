/* =========================================================
   PERSONALIZACIÓN DE DILEMAS UNIVERSALES POR SECTOR ECONÓMICO
   Algunos dilemas del pool compartido tienen más sentido en unas categorías
   económicas que en otras (un caso sobre "reseñas online" encaja en un negocio
   de cara al público, no tanto en la venta mayorista de un commodity agrícola).
   Si un título no aparece aquí, se considera aplicable a las 3 categorías.
   ========================================================= */
const DILEMA_RESTRICCIONES = {
  "La comunidad vecina denuncia impacto ambiental": ['primario','secundario'],
  "Ataque de ransomware a los sistemas administrativos": ['secundario','terciario'],
  "Devolución masiva por un lote defectuoso": ['primario','secundario'],
  "Oportunidad de certificación de calidad internacional": ['primario','secundario'],
  "Oferta por los datos de tus clientes": ['secundario','terciario'],
  "Fluctuación fuerte en el tipo de cambio": ['primario','secundario'],
  "Una app de reseñas hunde tu calificación tras un mal servicio puntual": ['secundario','terciario'],
  "Una startup te ofrece una alianza tecnológica a cambio de participación accionaria": ['secundario','terciario'],
  "Un influenciador menciona tu marca sin que se lo pidieras": ['secundario','terciario']
};
function poolUniversalParaCategoria(categoria){
  return ETHICAL_DILEMMA_POOL.filter(build=>{
    const restriccion = DILEMA_RESTRICCIONES[build(state, flags).titulo];
    return !restriccion || restriccion.includes(categoria);
  });
}

/* =========================================================
   CASOS CONDICIONALES / KARMA (compartidos)
   ========================================================= */
