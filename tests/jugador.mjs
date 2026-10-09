// Jugador automático: juega una partida completa haciendo clic en la interfaz real
// (sobre el arnés de tests/harness.mjs) y devuelve el resultado y una traza turno a turno.
import { crearJuego, mulberry32 } from './harness.mjs';

// Pesos por indicador para cada perfil de jugador. Un valor negativo = "menos es mejor".
const PESOS = {
  // Prudente: cuida liquidez, deuda y relaciones; crece sin apostar la empresa. Además
  // descuenta la deuda diferida y evita consecuencias inciertas (ver puntuar).
  bueno: {
    caja: 1, capitalTrabajo: 0.5, razonCorriente: 8, deuda: -0.6, ebitda: 1.5, wacc: -2,
    diasInventario: -0.1, diasCartera: -0.1, valorInventario: 0.1,
    confianzaProveedores: 0.25, confianzaBanco: 0.25, reputacion: 0.25, moralEquipo: 0.2,
  },
  // Crecimiento agresivo: todo por el EBITDA; ignora deuda, costo de capital y liquidez.
  agresivo: { ebitda: 2, caja: 0.2, reputacion: 0.05 },
  // Imperio: persigue a la vez EBITDA y caja altos (el arquetipo "El Imperio").
  imperio: { ebitda: 1.5, caja: 1, capitalTrabajo: 0.3 },
  // Azar: elige sin mirar los números.
  azar: null,
};
// Metódico: el prudente que además persigue la meta trimestral de la junta (como haría un
// estudiante atento). Solo lo usa el tablero de balance (tests/balance.mjs).
PESOS.metodico = PESOS.bueno;
export const PERFILES_JUGADOR = ['bueno', 'agresivo', 'imperio', 'azar'];
export const PERFILES_BALANCE = PERFILES_JUGADOR.concat(['metodico']);
// Paso de referencia de cada meta (META_DELTAS del juego) para medir cuánto acerca una opción.
const PASO_META = { caja:5, ebitda:3, deuda:-5, wacc:-1, razonCorriente:0.3, capitalTrabajo:5, diasInventario:-8,
  diasCartera:-8, valorInventario:2, confianzaProveedores:8, confianzaBanco:8, reputacion:8, moralEquipo:8 };

// Umbrales de alerta: el jugador prudente triplica el peso de lo que está en peligro.
function pesoAjustado(perfil, k, estado) {
  const w = PESOS[perfil][k] || 0;
  if ((perfil !== 'bueno' && perfil !== 'metodico') || !estado) return w;
  const enPeligro =
    (k === 'caja' && estado.caja < 12) ||
    (k === 'razonCorriente' && estado.razonCorriente < 1.1) ||
    (k === 'deuda' && estado.deuda >= 40) ||
    (k === 'wacc' && estado.wacc >= 17) ||
    (['confianzaProveedores', 'confianzaBanco', 'reputacion'].includes(k) && estado[k] < 30);
  if (enPeligro) return w * 3;
  // Con la caja holgada, cada peso adicional vale menos que reducir deuda o riesgo.
  if (k === 'caja' && estado.caja > 40) return w * 0.3;
  return w;
}

function puntuar(perfil, opcion, estado, meta) {
  let s = 0;
  for (const [k, v] of Object.entries(opcion.efectos || {})) if (typeof v === 'number') s += v * pesoAjustado(perfil, k, estado);
  // El jugador prudente también pesa lo que no se ve de inmediato: la deuda diferida es caja
  // que saldrá después, y un evento disparado es una consecuencia incierta que prefiere evitar.
  if (perfil === 'metodico' && meta && PASO_META[meta.indicador]) {
    const v = (opcion.efectos || {})[meta.indicador];
    // Cada "paso" de meta vale como 6 puntos de puntuación; solo si aún no se ha cumplido.
    const invertido = PASO_META[meta.indicador] < 0;
    const falta = invertido ? estado[meta.indicador] > meta.valorObjetivo : estado[meta.indicador] < meta.valorObjetivo;
    if (typeof v === 'number' && falta) s += 6 * v / Math.abs(PASO_META[meta.indicador]) * (invertido ? -1 : 1);
  }
  if (perfil === 'bueno' || perfil === 'metodico') {
    if (opcion.diferir) s -= (opcion.diferir.monto || 0) * pesoAjustado(perfil, 'caja', estado) * 0.8;
    if (opcion.disparar) s -= 2;
  }
  return s;
}

function elegirOpcion(perfil, opciones, estado, rng, meta) {
  if (!PESOS[perfil]) return Math.floor(rng() * opciones.length);
  let mejor = -Infinity, candidatos = [];
  opciones.forEach((o, i) => {
    const s = Math.round(puntuar(perfil, o, estado, meta) * 1e6) / 1e6;
    if (s > mejor) { mejor = s; candidatos = [i]; } else if (s === mejor) candidatos.push(i);
  });
  return candidatos[Math.floor(rng() * candidatos.length)];
}

const KPIS = ['caja', 'capitalTrabajo', 'razonCorriente', 'deuda', 'ebitda', 'wacc', 'diasInventario', 'diasCartera',
  'valorInventario', 'confianzaProveedores', 'confianzaBanco', 'reputacion', 'moralEquipo'];
const RE_CONTINUAR = /continue|continuar/i;

function clicables(raiz) {
  return raiz.querySelectorAll('button').filter((b) => !b.disabled && b.listeners.some((l) => l.type === 'click'))
    .concat(raiz.querySelectorAll('[data-i]').filter((b) => b.tagName !== 'BUTTON' && b.listeners.length));
}

/**
 * Juega una partida.
 * @returns {{final, turnos, decisiones, traza, errores, apariciones}}
 */
// `sonda` (opcional): código que se evalúa en el juego antes de empezar; `leer`: expresión cuyo
// valor se devuelve al final como `sonda` (para instrumentar el motor en estudios de balance).
export async function jugarPartida(html, { seed = 1, sector = 'vitafit', perfil = 'bueno', dificultad = 'medio', maxPasos = 6000, sonda = null, leer = null } = {}) {
  const j = crearJuego(html, { seed });
  const rng = mulberry32((seed * 2654435761) ^ 0x5bd1e995);
  const doc = j.document;
  const traza = [];
  const apariciones = {};

  // Sonda de solo lectura: guarda el último caso cuyas opciones se dibujaron.
  j.ev(`(() => { const original = renderChoices; renderChoices = function(c){ __ultimoCaso = c; return original.apply(this, arguments); }; })(); var __ultimoCaso = null;`);
  // Registro de casos mostrados (para la regla de anti-repetición).
  j.ev(`(() => { const original = renderCase; renderCase = function(c){ __casosMostrados.push([c.tipo, c.titulo]); return original.apply(this, arguments); }; })(); var __casosMostrados = [];`);
  // Registro de metas trimestrales evaluadas por la junta (para el reporte de balance).
  j.ev(`(() => { const original = metaCumplida; metaCumplida = function(m){ const r = original.apply(this, arguments); __metas.push({indicador:m.indicador, cumplida:!!r, inicial:m.valorInicial, objetivo:m.valorObjetivo, final:state[m.indicador], turno:turnNumber}); return r; }; })(); var __metas = [];`);

  if (sonda) j.ev(sonda);
  const pausa = (ms) => j.avanzar(ms);
  await pausa(100);
  await j.tecla('Escape');
  await pausa(900);
  await j.click(doc.getElementById('inicioBtn'));
  await j.click(doc.querySelector(`.sector-card[data-id="${sector}"]`));
  const btnDif = doc.querySelectorAll('#dificultadGrid .profile-card').find((b) => b.dataset.id === dificultad);
  if (!btnDif) throw new Error('Dificultad inexistente: ' + dificultad);
  await j.click(btnDif);
  await j.click(doc.getElementById('confirmarBtn'));

  let final = null;
  let quietos = 0;
  for (let paso = 0; paso < maxPasos; paso++) {
    if (!j.ev('introCerrada')) { await j.tecla('Escape'); await pausa(900); continue; }
    final = j.ev('pendingEndingResult');
    if (final) break;
    const modal = doc.getElementById('turnModalBackdrop').classList.contains('show');
    const contenido = doc.getElementById('turnModalContent');
    let objetivo = null;
    if (modal) {
      const botones = clicables(contenido);
      const opciones = botones.filter((b) => b.classList.contains('choice-btn'));
      if (opciones.length) {
        const caso = j.ev('__ultimoCaso');
        let lista = caso.choices.slice();
        if (j.ev('investigado') && caso.choiceInformado) lista = lista.concat([caso.choiceInformado]);
        const estado = j.ev('state');
        const i = elegirOpcion(perfil, lista, estado, rng, j.ev('metaTrimestral'));
        traza.push({
          turno: j.ev('turnNumber'), tipo: caso.tipo, titulo: caso.titulo, opcion: i,
          estado: Object.fromEntries(KPIS.filter((k) => estado[k] != null).map((k) => [k, Math.round(estado[k] * 1000) / 1000])),
        });
        objetivo = opciones[i];
      } else {
        objetivo = botones.find((b) => RE_CONTINUAR.test(b.id)) || botones.find((b) => b.id === 'verImpactoBtn')
          || (botones.length ? botones[Math.floor(rng() * botones.length)] : null);
      }
    } else {
      const ev = doc.getElementById('evaluarTurnoBtn');
      if (ev && !ev.disabled) objetivo = ev;
    }
    // Tras cada clic se espera más que la transición "Calculando impacto" (1.000 ms), como haría
    // una persona: volver a pulsar un botón ya pulsado encolaría cierres de modal duplicados.
    if (objetivo) { quietos = 0; await j.click(objetivo); await pausa(1300); }
    else { quietos++; await pausa(250); if (quietos > 400) throw new Error(`Partida atascada (semilla ${seed}, ${sector}, ${perfil}) en turno ${j.ev('turnNumber')}`); }
  }
  if (!final) throw new Error(`La partida no terminó en ${maxPasos} pasos (semilla ${seed})`);
  // La junta trimestral y los vencimientos de deuda diferida son eventos estructurales con
  // título fijo: se repiten por diseño y no cuentan para la regla de anti-repetición.
  for (const [tipo, t] of j.ev('__casosMostrados')) {
    if (tipo === 'junta' || tipo === 'vencimiento') continue;
    apariciones[t] = (apariciones[t] || 0) + 1;
  }
  const estadoFinal = j.ev('state');
  return {
    final: {
      tipoFinal: final.tipoFinal, badge: final.badge, rango: final.rango || null,
      arquetipo: final.arquetipo ? final.arquetipo.nombre : null,
      esFinalOculto: !!final.esFinalOculto, esFinalOcultoTragico: !!final.esFinalOcultoTragico,
    },
    turnos: j.ev('turnNumber'),
    estadoFinal: Object.fromEntries(KPIS.filter((k) => estadoFinal[k] != null).map((k) => [k, Math.round(estadoFinal[k] * 1000) / 1000])),
    traza, apariciones, metas: j.ev('__metas'), sonda: leer ? j.ev(leer) : undefined, errores: j.errores,
  };
}
