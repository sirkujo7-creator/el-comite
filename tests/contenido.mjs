// Recolector de contenido: arranca una partida por sector en el arnés y reúne todos los
// casos (objetos con `choices`) alcanzables desde las colecciones de contenido, llamando a
// las funciones constructoras con el estado real de esa partida.
import { crearJuego } from './harness.mjs';

const VARIANTES = [
  { caja: 3 }, { caja: 90 }, { diasInventario: 95 }, { diasInventario: 8 }, { valorInventario: 50 },
  { deuda: 60, wacc: 22 }, { razonCorriente: 0.85 }, { reputacion: 18 }, { reputacion: 90 },
  { moralEquipo: 18 }, { moralEquipo: 90 }, { confianzaBanco: 15 }, { confianzaProveedores: 15 }, { ebitda: -2 },
];
const RAICES = ['SECTORS', 'ETHICAL_DILEMMA_POOL', 'KARMA_CASES', 'BLACK_SWAN_POOL', 'CADENAS_PROFUNDAS',
  'ELENCO_INDICADORES', 'CARTA_META_COMITE'];
// Constructoras globales de casos: build*, cadena*, evento*.
const RE_CONSTRUCTORA = /^(build|cadena|evento)[A-Z]/;

export const SECTORES = ['vitafit', 'technova', 'agroverde', 'ganadera', 'construyeya', 'modaurbana'];

export async function iniciarEnSector(html, sector, seed = 1) {
  const j = crearJuego(html, { seed });
  const d = j.document;
  await j.avanzar(100); await j.tecla('Escape'); await j.avanzar(900);
  await j.click(d.getElementById('inicioBtn'));
  await j.click(d.querySelector(`.sector-card[data-id="${sector}"]`));
  await j.click(d.getElementById('confirmarBtn'));
  await j.tecla('Escape'); await j.avanzar(900);
  return j;
}

/** Devuelve [{origen, caso}] sin duplicados (por identidad de objeto y por título+opciones). */
export async function recolectarCasos(html) {
  const vistos = new Map();
  for (const sector of SECTORES) {
    const j = await iniciarEnSector(html, sector);
    const base = j.ev('state'), flags = j.ev('flags');
    // Estados extremos para ejercitar las ramas condicionales (p. ej. inventarioSano ? … : …).
    const estados = [base, ...VARIANTES.map((v) => Object.assign({}, base, v))];
    const visitados = new Set();
    const caminar = (v, origen, prof) => {
      if (prof > 8 || v == null) return;
      if (typeof v === 'function') {
        for (const state of estados) construir(v, state, origen, prof);
        return;
      }
      caminarObjeto(v, origen, prof);
    };
    const construir = (v, state, origen, prof) => {
      {
        let r;
        try { r = v(state, flags); } catch { return; }
        // Opciones con resultado al azar (p. ej. caja:pick([-5,4])): se construye el caso
        // varias veces y se marcan; cuentan como "riesgo" en las reglas 2 y 3.
        if (r && Array.isArray(r.choices)) {
          for (let k = 0; k < 6; k++) {
            let otra; try { otra = v(state, flags); } catch { break; }
            if (!otra || !Array.isArray(otra.choices)) break;
            r.choices.forEach((ch, i) => {
              if (otra.choices[i] && JSON.stringify(otra.choices[i].efectos) !== JSON.stringify(ch.efectos)) ch.__aleatorio = true;
            });
          }
        }
        if (r && typeof r === 'object') caminarObjeto(r, origen + '()', prof + 1);
      }
    };
    const caminarObjeto = (v, origen, prof) => {
      if (prof > 8 || v == null) return;
      if (typeof v === 'function') return caminar(v, origen, prof);
      if (typeof v !== 'object' || visitados.has(v)) return;
      visitados.add(v);
      if (Array.isArray(v.choices)) {
        // La clave incluye los efectos: dos ramas condicionales del mismo caso cuentan aparte.
        const clave = (v.titulo || '') + '|' + v.choices.map((c) => c.texto + JSON.stringify(c.efectos)).join('|');
        if (!vistos.has(clave)) vistos.set(clave, { origen, caso: v, sector });
      }
      for (const [k, x] of Object.entries(v)) {
        if (k === 'efectos' || k === 'kpiInicial') continue;
        caminar(x, origen + '.' + k, prof + 1);
      }
    };
    for (const r of RAICES) caminar(j.ev(r), r, 0);
    const globales = j.ev('Object.getOwnPropertyNames(globalThis)').filter((n) => RE_CONSTRUCTORA.test(n));
    for (const n of globales) {
      const f = j.ev(n);
      if (typeof f === 'function') caminar(f, n, 0);
    }
  }
  return [...vistos.values()];
}

export const KPIS = ['caja', 'capitalTrabajo', 'razonCorriente', 'deuda', 'ebitda', 'wacc', 'diasInventario',
  'diasCartera', 'valorInventario', 'confianzaProveedores', 'confianzaBanco', 'reputacion', 'moralEquipo'];

/** Por sector: cuántos casos de la bolsa aleatoria (sector + universales) tocan cada indicador. */
export async function coberturaPorSector(html) {
  const out = {};
  for (const sector of SECTORES) {
    const j = await iniciarEnSector(html, sector);
    out[sector] = j.ev(`(() => {
      const bolsa = sectorActual.random.concat(poolUniversalParaCategoria(sectorActual.categoria));
      const r = { tieneInventario: !!sectorActual.tieneInventario, moral: state.moralEquipo != null, n: bolsa.length, por: {} };
      for (const k of ${JSON.stringify(KPIS)}) r.por[k] = bolsa.filter((b) => caseTocaIndicador(b, k)).length;
      return r;
    })()`);
  }
  return out;
}
