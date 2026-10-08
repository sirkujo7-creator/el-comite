// Prueba de equivalencia (Fase 1): con semilla fija, el HTML original y el dist/ generado
// desde src/ deben producir exactamente las mismas partidas — mismos casos, mismas opciones
// y mismos estados turno a turno, y el mismo final.
//
// Vigente mientras original/ sea la referencia de comportamiento. Cuando una fase posterior
// cambie el juego a propósito, esta prueba deja de aplicar y se retira (ver CLAUDE.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jugarPartida, PERFILES_JUGADOR } from './jugador.mjs';
import { SECTORES } from './contenido.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const original = fs.readFileSync(path.join(ROOT, 'original', 'simulador_financiero.html'), 'utf8');
const dist = fs.readFileSync(path.join(ROOT, 'dist', 'simulador_financiero.html'), 'utf8');
const N = Number(process.env.EQUIV_N || 2); // partidas por sector y perfil

test('dist/ es idéntico byte a byte al original (informativo)', (t) => {
  if (original !== dist) t.diagnostic('dist/ difiere en bytes del original: la equivalencia se verifica por comportamiento.');
  else t.diagnostic('dist/ es idéntico byte a byte al original.');
});

test(`mismas partidas con la misma semilla (${N} × ${SECTORES.length} sectores × ${PERFILES_JUGADOR.length} perfiles)`, async () => {
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
