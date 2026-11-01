// Fase 4 — expediente único de partida y "continuar partida".
// 1) Ningún archivo vuelve a declarar con let/var un campo del expediente (lo taparía).
// 2) Una partida cortada a mitad de año se guarda sin perder referencias, se retoma en otro
//    juego (otra pestaña, otro día) exactamente igual y se puede jugar hasta el final.
// 3) Al terminar el año fiscal la partida guardada se borra.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearJuego, leerHtml, mulberry32 } from './harness.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = leerHtml(path.join(ROOT, 'dist', 'simulador_financiero.html'));
const CLAVE = 'elcomite_partida_v1';

function clicables(raiz) {
  return raiz.querySelectorAll('button').filter((b) => !b.disabled && b.listeners.some((l) => l.type === 'click'))
    .concat(raiz.querySelectorAll('[data-i]').filter((b) => b.tagName !== 'BUTTON' && b.listeners.length));
}
// Un paso de juego: elige una opción al azar, continúa o pide el siguiente turno.
async function paso(j, rng) {
  const doc = j.document;
  if (!j.ev('introCerrada')) { await j.tecla('Escape'); await j.avanzar(900); return; }
  const modal = doc.getElementById('turnModalBackdrop').classList.contains('show');
  let objetivo = null;
  if (modal) {
    const botones = clicables(doc.getElementById('turnModalContent'));
    const opciones = botones.filter((b) => b.classList.contains('choice-btn'));
    objetivo = opciones.length ? opciones[Math.floor(rng() * opciones.length)]
      : (botones.find((b) => /continue|continuar/i.test(b.id)) || botones.find((b) => b.id === 'verImpactoBtn') || botones[0]);
  } else {
    const ev = doc.getElementById('evaluarTurnoBtn');
    if (ev && !ev.disabled) objetivo = ev;
  }
  if (objetivo) await j.click(objetivo);
  await j.avanzar(objetivo ? 1300 : 250);
}
const enReposo = (j) => !j.document.getElementById('turnModalBackdrop').classList.contains('show')
  && !j.ev('pendingEndingResult') && j.ev('introCerrada');
const guardadoSinFecha = (raw) => { const d = JSON.parse(raw); delete d.fecha; return d; };

test('ningún archivo tapa un campo del expediente con let/var', () => {
  const j = crearJuego(html, { seed: 1 });
  const tapados = JSON.parse(j.ev(`JSON.stringify(Object.keys(CAMPOS_PARTIDA).filter(k => {
    const antes = partida[k]; partida[k] = '__prueba__';
    const visto = (0, eval)(k); partida[k] = antes; return visto !== '__prueba__';
  }))`));
  assert.deepEqual(tapados, []);
});

for (const [sector, seed] of [['ganadera', 11], ['vitafit', 23], ['modaurbana', 37], ['technova', 41]]) {
  test(`continuar partida: ${sector} cortada en el turno 8 se retoma igual y se termina`, async () => {
    const rng = mulberry32(seed * 977);
    const j = crearJuego(html, { seed });
    await j.avanzar(100); await j.tecla('Escape'); await j.avanzar(900);
    await j.click(j.document.getElementById('inicioBtn'));
    await j.click(j.document.querySelector(`.sector-card[data-id="${sector}"]`));
    await j.click(j.document.getElementById('confirmarBtn'));
    let faltantes = 0;
    for (let i = 0; i < 3000; i++) {
      await paso(j, rng);
      if (enReposo(j)) faltantes += j.ev('(() => { const f = []; serializarPartida(f); return f.length; })()');
      if (j.ev('pendingEndingResult') || (enReposo(j) && j.ev('turnNumber') >= 8)) break;
    }
    assert.equal(faltantes, 0, 'hay casos o eventos que no se pudieron guardar como referencia');
    if (j.ev('pendingEndingResult')) return; // quebró antes del turno 8: no hay nada que retomar
    const raw = j.almacen.get(CLAVE);
    assert.ok(raw, 'no se guardó la partida');
    const turnoCorte = j.ev('turnNumber');
    assert.equal(JSON.parse(raw).partida.turnNumber, turnoCorte);

    // Otro juego: la portada ofrece continuar y el expediente vuelve idéntico.
    const j2 = crearJuego(html, { seed: seed + 1000 });
    await j2.avanzar(100); await j2.tecla('Escape'); await j2.avanzar(900);
    j2.almacen.set(CLAVE, raw);
    j2.ev('renderLanding()');
    const btn = j2.document.getElementById('continuarBtn');
    assert.ok(btn, 'la portada no ofrece continuar');
    await j2.click(btn); await j2.avanzar(1500);
    assert.deepEqual(guardadoSinFecha(j2.ev('JSON.stringify(serializarPartida())')), guardadoSinFecha(raw));
    assert.equal(j2.ev("document.body.classList.contains('en-partida')"), true);

    // Y se puede jugar hasta el final; al terminar, la partida guardada desaparece.
    for (let i = 0; i < 4000 && !j2.ev('pendingEndingResult'); i++) await paso(j2, rng);
    assert.ok(j2.ev('pendingEndingResult'), 'la partida retomada no llegó al final');
    assert.ok(j2.ev('turnNumber') > turnoCorte || j2.ev('pendingEndingResult.tipoFinal') === 'derrota');
    assert.equal(j2.almacen.has(CLAVE), false, 'la partida terminada sigue guardada');
    assert.deepEqual(j.errores.concat(j2.errores), []);
  });
}
