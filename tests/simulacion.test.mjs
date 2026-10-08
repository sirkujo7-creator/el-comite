// Simulación masiva (CLAUDE.md §3, regla 8 y 9): partidas automatizadas por perfil de jugador.
// Imprime un reporte de quiebras, rangos y arquetipos, y verifica que:
//  - toda partida termina sin errores de ejecución;
//  - ningún caso aparece más de 2 veces en una misma partida (anti-repetición).
// Cantidad de partidas por perfil: SIM_N (por defecto 84 = 14 por sector).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jugarPartida, PERFILES_JUGADOR } from './jugador.mjs';
import { SECTORES } from './contenido.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'dist', 'simulador_financiero.html'), 'utf8');
const N = Number(process.env.SIM_N || 84);
const DIFICULTAD = process.env.SIM_DIFICULTAD || 'medio';
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + ' %' : '—');

const resultados = {};
const repeticiones = [];

test(`simulación: ${N} partidas por perfil (${DIFICULTAD})`, async () => {
  for (const perfil of PERFILES_JUGADOR) {
    const lista = (resultados[perfil] = []);
    for (let i = 0; i < N; i++) {
      const sector = SECTORES[i % SECTORES.length];
      const seed = 1 + i * 104729 + PERFILES_JUGADOR.indexOf(perfil);
      const r = await jugarPartida(html, { seed, sector, perfil, dificultad: DIFICULTAD });
      assert.deepEqual(r.errores, [], `errores de consola (semilla ${seed})`);
      lista.push({ sector, seed, ...r });
      for (const [titulo, veces] of Object.entries(r.apariciones)) {
        if (veces > 2) repeticiones.push(`${perfil}/${sector}/semilla ${seed}: "${titulo}" ×${veces}`);
      }
    }
  }
});

test('reporte', (t) => {
  const filas = [];
  for (const perfil of PERFILES_JUGADOR) {
    const l = resultados[perfil] || [];
    const quiebras = l.filter((r) => r.final.tipoFinal === 'derrota').length;
    const cuenta = (f) => { const m = {}; for (const r of l) { const k = f(r); if (k) m[k] = (m[k] || 0) + 1; } return m; };
    const fmt = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pct(v, l.length)}`).join(', ') || '—';
    filas.push(`${perfil.padEnd(9)} quiebra ${pct(quiebras, l.length).padStart(7)} | rangos: ${fmt(cuenta((r) => r.final.rango))}`);
    filas.push(`${''.padEnd(9)} arquetipos: ${fmt(cuenta((r) => r.final.arquetipo))}`);
    filas.push(`${''.padEnd(9)} derrotas: ${fmt(cuenta((r) => (r.final.tipoFinal === 'derrota' ? r.final.badge : null)))}`);
    const porSector = SECTORES.map((s) => { const x = l.filter((r) => r.sector === s); return `${s} ${pct(x.filter((r) => r.final.tipoFinal === 'derrota').length, x.length)}`; });
    filas.push(`${''.padEnd(9)} quiebra por sector: ${porSector.join(', ')}`);
  }
  for (const f of filas) t.diagnostic(f);
});

test('regla 9 — ningún caso aparece más de 2 veces por partida', () => {
  assert.deepEqual(repeticiones, [], `${repeticiones.length} repeticiones:\n  ${repeticiones.slice(0, 30).join('\n  ')}`);
});
