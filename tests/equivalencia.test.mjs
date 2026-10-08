// Prueba de equivalencia: con semilla fija, un HTML de referencia y el dist/ actual deben
// producir exactamente las mismas partidas — mismos casos, opciones, estados y final.
//
// Sirvió para cerrar la Fase 1 (original/ vs dist/). Desde la Fase 2 el juego cambia a
// propósito, así que es OPCIONAL: se usa para refactorizaciones que no deben cambiar nada.
//   1) node build.mjs && cp dist/simulador_financiero.html /tmp/ref.html   (antes del cambio)
//   2) EQUIV_REF=/tmp/ref.html npm test                                    (después)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jugarPartida, PERFILES_JUGADOR } from './jugador.mjs';
import { SECTORES } from './contenido.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = process.env.EQUIV_REF;
const original = REF ? fs.readFileSync(path.resolve(REF), 'utf8') : '';
const dist = fs.readFileSync(path.join(ROOT, 'dist', 'simulador_financiero.html'), 'utf8');
const N = Number(process.env.EQUIV_N || 2); // partidas por sector y perfil

const opciones = { skip: REF ? false : 'opcional: definir EQUIV_REF=<html de referencia>' };

test('dist/ frente a la referencia, byte a byte (informativo)', opciones, (t) => {
  if (original !== dist) t.diagnostic('dist/ difiere en bytes de la referencia: la equivalencia se verifica por comportamiento.');
  else t.diagnostic('dist/ es idéntico byte a byte a la referencia.');
});

test(`mismas partidas con la misma semilla (${N} × ${SECTORES.length} sectores × ${PERFILES_JUGADOR.length} perfiles)`, opciones, async () => {
  let partidas = 0;
  for (const sector of SECTORES) for (const perfil of PERFILES_JUGADOR) for (let i = 0; i < N; i++) {
    const seed = 1000 + i * 7919 + SECTORES.indexOf(sector) * 31 + PERFILES_JUGADOR.indexOf(perfil);
    const a = await jugarPartida(original, { seed, sector, perfil });
    const b = await jugarPartida(dist, { seed, sector, perfil });
    assert.deepEqual(b, a, `Divergencia: semilla ${seed}, ${sector}, perfil ${perfil}`);
    partidas++;
  }
  assert.ok(partidas > 0);
});
