// Reglas de calidad de CLAUDE.md §3 sobre el contenido del juego (reglas 1–7), más el esquema
// de los casos y la cobertura mínima por indicador y sector (Fase 2).
// La regla 9 (anti-repetición) depende de partidas reales: está en simulacion.test.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recolectarCasos, iniciarEnSector, coberturaPorSector, SECTORES, KPIS } from './contenido.mjs';
import { extraerPartes } from './harness.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist', 'simulador_financiero.html');
const html = fs.readFileSync(DIST, 'utf8');
const casos = await recolectarCasos(html);

// Campos donde menos es mejor (CAMPOS_INVERTIDOS del juego).
const INVERTIDOS = ['deuda', 'wacc', 'diasInventario', 'diasCartera'];
const normalizado = (k, v) => (INVERTIDOS.includes(k) ? -v : v);
// Consecuencias no numéricas: deuda diferida, eventos disparados, banderas narrativas, azar.
const tieneRiesgo = (op) => !!(op.diferir || op.disparar || op.setFlags || op.__aleatorio);
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

test('regla 2 — ninguna opción domina a otra del mismo caso', () => {
  const fallas = [];
  for (const c of casos) {
    const ops = c.caso.choices; // la opción informada se paga con la investigación: queda fuera
    for (let a = 0; a < ops.length; a++) for (let b = 0; b < ops.length; b++) {
      if (a === b || tieneRiesgo(ops[a]) || tieneRiesgo(ops[b])) continue;
      if (ops[b].capex && !ops[a].capex) continue; // invertir en equipos (capex) es un beneficio no numérico
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

test('regla 3 — toda opción tiene un costo o un riesgo', () => {
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

// ---------------------------------------------------------------- Esquema de casos
const TIPOS = ['caso', 'karma', 'calendario', 'macro', 'random', 'meta_comite', 'junta', 'vencimiento'];
// Magnitud máxima razonable de un efecto en una sola decisión (por encima, casi seguro es un error).
const LIMITES = { caja: 25, capitalTrabajo: 20, razonCorriente: 0.5, deuda: 20, ebitda: 8, wacc: 5,
  diasInventario: 35, diasCartera: 90, valorInventario: 15, confianzaProveedores: 20, confianzaBanco: 40,
  reputacion: 20, moralEquipo: 20 };
const CLAVES_OPCION = ['texto', 'efectos', 'consecuencia', 'diferir', 'setFlags', 'disparar', 'capex', 'informado', '__aleatorio'];
const textoValido = (t) => typeof t === 'string' && t.trim().length >= 8;

test('esquema — campos obligatorios, tipos y rangos de efectos', () => {
  const fallas = [];
  for (const c of casos) {
    const k = c.caso, n = nombre(c);
    if (!TIPOS.includes(k.tipo)) fallas.push(`${n}: tipo desconocido "${k.tipo}"`);
    if (!textoValido(k.titulo)) fallas.push(`${n}: título vacío o muy corto`);
    if (!textoValido(k.contexto)) fallas.push(`${n}: contexto vacío o muy corto`);
    if (k.choices.length < 2 || k.choices.length > 5) fallas.push(`${n}: ${k.choices.length} opciones (se esperan 2 a 5)`);
    for (const op of opcionesDe(k)) {
      const o = `${n} → "${(op.texto || '').slice(0, 50)}"`;
      if (!textoValido(op.texto)) fallas.push(`${o}: texto vacío`);
      if (!textoValido(op.consecuencia)) fallas.push(`${o}: consecuencia vacía`);
      for (const clave of Object.keys(op)) if (!CLAVES_OPCION.includes(clave)) fallas.push(`${o}: campo desconocido "${clave}" (¿error de tipeo?)`);
      for (const [ind, v] of Object.entries(op.efectos || {})) {
        if (!KPIS.includes(ind)) fallas.push(`${o}: indicador desconocido "${ind}"`);
        else if (typeof v !== 'number' || !Number.isFinite(v)) fallas.push(`${o}: ${ind} no es un número`);
        else if (Math.abs(v) > LIMITES[ind]) fallas.push(`${o}: ${ind} ${v} supera el límite ±${LIMITES[ind]}`);
      }
    }
  }
  assert.deepEqual(fallas, [], listar(fallas));
});

// ---------------------------------------------------------------- Cobertura
// Mínimo de casos (en la bolsa aleatoria del sector) que deben tocar cada indicador aplicable,
// para que la decisión extra por indicador crítico tenga de dónde elegir sin repetir.
const MINIMO_POR_INDICADOR = 4;

test(`cobertura — cada indicador aplicable tiene al menos ${MINIMO_POR_INDICADOR} casos por sector`, async (t) => {
  const cob = await coberturaPorSector(html);
  const fallas = [];
  for (const [sector, r] of Object.entries(cob)) {
    const aplicables = KPIS.filter((k) => (r.tieneInventario || !['diasInventario', 'valorInventario'].includes(k)) && (r.moral || k !== 'moralEquipo'));
    t.diagnostic(`${sector.padEnd(12)} (${r.n} casos) ` + aplicables.map((k) => `${k} ${r.por[k]}`).join(' · '));
    for (const k of aplicables) if (r.por[k] < MINIMO_POR_INDICADOR) fallas.push(`${sector}: ${k} solo tiene ${r.por[k]} casos`);
  }
  assert.deepEqual(fallas, [], listar(fallas));
});
