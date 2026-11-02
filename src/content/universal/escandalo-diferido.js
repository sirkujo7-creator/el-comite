/* =========================================================
   ESCÁNDALO ÉTICO DIFERIDO (reutilizable — se dispara semanas después)
   ========================================================= */
function buildEscandaloEtico(motivo){
  return {
    tipo:'karma', titulo:"El escándalo sale a la luz",
    contexto:`Un medio de investigación regional publica un reportaje con pruebas sobre ${motivo}. La noticia se viraliza y la junta te pide explicaciones de inmediato.`,
    choices:[
      {texto:"Reconocer el error públicamente y anunciar un plan de remediación inmediato.", efectos:{caja:-7, reputacion:si(CONTEXTO.reputacionAlta(state), -6, -8), razonCorriente:si(CONTEXTO.liquidezBaja(state), -0.15, 0)},
       consecuencia:"El daño ya estaba hecho, pero reconocerlo rápido evita que la situación empeore más de lo necesario."},
      {texto:"Contratar una firma de manejo de crisis para controlar el relato mediático.", efectos:{caja:-9, reputacion:-4},
       consecuencia:"Gastas mucho en contener el daño reputacional sin resolver la causa de fondo — un parche caro sobre una herida que sigue abierta."},
      {texto:"Ofrecer una compensación económica directa a los afectados.", efectos:{caja:-10, reputacion:-2, razonCorriente:si(CONTEXTO.liquidezBaja(state), -0.25, -0.05)},
       consecuencia:"Es caro y no borra el error original, pero es la respuesta que más rápido calma la tensión pública."}
    ]
  };
}
function eventoEscandaloAmbiental(s,f){ return buildEscandaloEtico("el impacto ambiental que negaste hace unos meses, cuando la comunidad vecina lo denunció por primera vez"); }
function eventoEscandaloProveedor(s,f){ return buildEscandaloEtico("las condiciones laborales del proveedor con el que decidiste seguir trabajando pese a las señales de alerta"); }

