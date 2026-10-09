/* =========================================================================================
   METAS TRIMESTRALES DE LA JUNTA — desde el turno 1, no solo al llegar a la primera junta,
   y renovadas cada 5 turnos. Reutiliza indicadorPrioritario() para que la meta sea relevante
   a la situación real de la empresa, no genérica. Cumplirla o no tiene una consecuencia
   modesta de reputación, enmarcada como retroalimentación, no como castigo severo.
   ========================================================================================= */
const COMITE_IMG_BASE64 = '@asset(junta-directiva.jpg)';
const RETRATO_SOFIA_LINDO = '@asset(retratos/sofia-lindo.webp)';
const RETRATO_DON_HIGINIO = '@asset(retratos/don-higinio.webp)';
const RETRATO_CAMILA = '@asset(retratos/camila.webp)';
const RETRATO_DON_RIGO = '@asset(retratos/don-rigo.webp)';
const RETRATO_MARCELA = '@asset(retratos/marcela.webp)';
const RETRATO_ELVIRA = '@asset(retratos/elvira.webp)';
const RETRATO_TETO = '@asset(retratos/teto.webp)';
const RETRATO_AURELIO = '@asset(retratos/aurelio.webp)';
const RETRATO_JAIRO = '@asset(retratos/jairo.webp)';
const RETRATO_TONO = '@asset(retratos/tono.webp)';
const RETRATO_VALENTINA = '@asset(retratos/valentina.webp)';
let metaTrimestral = null;
let ultimaEvaluacionMeta = null;
