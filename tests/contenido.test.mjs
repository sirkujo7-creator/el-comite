// Reglas de calidad de CLAUDE.md §3 sobre el contenido del juego (reglas 1–7).
// La regla 9 (anti-repetición) depende de partidas reales: está en simulacion.test.mjs.
//
// Reglas 2 y 3: el contenido actual (heredado del HTML original) aún las incumple en muchos
// casos. Quedan como `todo`: se ejecutan y listan los casos, pero no hacen fallar `npm test`.
// Corregirlas es contenido de la Fase 2; al llegar a cero, quitar el `todo`.
const PENDIENTE_FASE_2 = 'pendiente Fase 2 (contenido heredado)';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recolectarCasos, iniciarEnSector, SECTORES } from './contenido.mjs';
import { extraerPartes } from './harness.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist', 'simulador_financiero.html');
const html = fs.readFileSync(DIST, 'utf8');
const casos = await recolectarCasos(html);

// Campos donde menos es mejor (CAMPOS_INVERTIDOS del juego).
const INVERTIDOS = ['deuda', 'wacc', 'diasInventario', 'diasCartera'];
const normalizado = (k, v) => (INVERTIDOS.includes(k) ? -v : v);
// Consecuencias no numéricas: deuda diferida, eventos disparados, banderas narrativas.
const tieneRiesgo = (op) => !!(op.diferir || op.disparar || op.setFlags);
const nombre = ({ caso, origen }) => `"${caso.titulo}" (${origen})`;
const opcionesDe = (caso) => caso.choices.concat(caso.choiceInformado ? [caso.choiceInformado] : []);

const listar = (fallas) => fallas.slice(0, 40).join('\n  ') + (fallas.length > 40 ? `\n  … y ${fallas.length - 40} más` : '');

test('se recolecta el contenido', () => {
  assert.ok(casos.length > 150, `solo se encontraron ${casos.length} casos`);
});

test('regla 1 — cero opciones vacías', () => {
  const fuente = fs.readFileSync(DIST, 'utf8');
  assert.equal((fuente.match(/efectos:\{\}/g) || []).length, 0, 'aparece "efectos:{}" en el código');
  const fallas = [];
  for (const c of casos) for (const op of opcionesDe(c.caso)) {
    const numericos = Object.values(op.efectos || {}).filter((v) => typeof v === 'number' && v !== 0);
    if (!numericos.length && !tieneRiesgo(op)) fallas.push(`${nombre(c)} → "${op.texto}"`);
  }
  assert.deepEqual(fallas, [], `Opciones sin ningún efecto:\n  ${listar(fallas)}`);
});

test('regla 2 — ninguna opción domina a otra del mismo caso', { todo: PENDIENTE_FASE_2 }, () => {
  const fallas = [];
  for (const c of casos) {
    const ops = c.caso.choices; // la opción informada se paga con la investigación: queda fuera
    for (let a = 0; a < ops.length; a++) for (let b = 0; b < ops.length; b++) {
      if (a === b || tieneRiesgo(ops[a]) || tieneRiesgo(ops[b])) continue;
      const claves = new Set([...Object.keys(ops[a].efectos || {}), ...Object.keys(ops[b].efectos || {})]);
      let todasMayorIgual = true;
      for (const k of claves) {
        const va = normalizado(k, ops[a].efectos[k] || 0), vb = normalizado(k, ops[b].efectos[k] || 0);
        if (va < vb) { todasMayorIgual = false; break; }
      }
      if (todasMayorIgual && (a < b || JSON.stringify(ops[a].efectos) !== JSON.stringify(ops[b].efectos))) {
        fallas.push(`${nombre(c)}: "${ops[a].texto}" ≥ "${ops[b].texto}" en todo`);
      }
    }
  }
  assert.deepEqual(fallas, [], `${fallas.length} pares de opciones dominantes:\n  ${listar(fallas)}`);
});

test('regla 3 — toda opción tiene un costo o un riesgo', { todo: PENDIENTE_FASE_2 }, () => {
  const fallas = [];
  for (const c of casos) for (const op of opcionesDe(c.caso)) {
    const costo = Object.entries(op.efectos || {}).some(([k, v]) => typeof v === 'number' && normalizado(k, v) < 0);
    if (!costo && !tieneRiesgo(op)) fallas.push(`${nombre(c)} → "${op.texto}"`);
  }
  assert.deepEqual(fallas, [], `${fallas.length} opciones sin costo ni riesgo:\n  ${listar(fallas)}`);
});

test('regla 4 — las metas trimestrales quedan dentro de META_RANGOS', async () => {
  const fallas = [];
  for (const sector of SECTORES) {
    const j = await iniciarEnSector(html, sector);
    const rangos = j.ev('META_RANGOS'), deltas = j.ev('META_DELTAS');
    // Para cada indicador, se fuerza el peor y el mejor valor del rango y se genera la meta.
    for (const k of Object.keys(deltas)) {
      if (j.ev(`state.${k}`) == null) continue;
      const [min, max] = rangos[k] || [-Infinity, Infinity];
      for (const v of [min, max, j.ev(`state.${k}`)]) {
        if (!Number.isFinite(v)) continue;
        j.ev(`state.${k} = ${v}; indicadorPrioritario = (() => '${k}');`);
        j.ev('generarNuevaMeta()');
        const meta = j.ev('metaTrimestral');
        if (meta.valorObjetivo < min || meta.valorObjetivo > max) fallas.push(`${sector}/${k}: objetivo ${meta.valorObjetivo} fuera de [${min}, ${max}]`);
      }
    }
  }
  assert.deepEqual(fallas, [], listar(fallas));
});

test('regla 5 — los casos con retrato tienen presentación', () => {
  const fallas = casos.filter((c) => c.caso.retrato && !c.caso.presentacion).map(nombre);
  assert.deepEqual(fallas, [], listar(fallas));
});

test('regla 6 — el último <script> compila', () => {
  const { codigo } = extraerPartes(html);
  assert.doesNotThrow(() => new Function(codigo));
});

test('regla 7 — CSS con llaves balanceadas', () => {
  const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length);
});
