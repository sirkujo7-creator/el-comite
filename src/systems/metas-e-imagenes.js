/* =========================================================================================
   METAS TRIMESTRALES DE LA JUNTA — desde el turno 1, no solo al llegar a la primera junta,
   y renovadas cada 5 turnos. Reutiliza indicadorPrioritario() para que la meta sea relevante
   a la situación real de la empresa, no genérica. Cumplirla o no tiene una consecuencia
   modesta de reputación, enmarcada como retroalimentación, no como castigo severo.
   ========================================================================================= */
const COMITE_IMG_BASE64 = '@asset(junta-directiva.jpg)';
const RETRATO_SOFIA_LINDO = '@asset(retratos/sofia-lindo.png)';
const RETRATO_DON_HIGINIO = '@asset(retratos/don-higinio.png)';
const RETRATO_CAMILA = '@asset(retratos/camila.png)';
const RETRATO_DON_RIGO = '@asset(retratos/don-rigo.png)';
const RETRATO_MARCELA = '@asset(retratos/marcela.png)';
const RETRATO_ELVIRA = '@asset(retratos/elvira.png)';
const RETRATO_TETO = '@asset(retratos/teto.png)';
const RETRATO_AURELIO = '@asset(retratos/aurelio.png)';
const RETRATO_JAIRO = '@asset(retratos/jairo.png)';
const RETRATO_TONO = '@asset(retratos/tono.png)';
const RETRATO_VALENTINA = '@asset(retratos/valentina.png)';
let metaTrimestral = null;
let ultimaEvaluacionMeta = null;
