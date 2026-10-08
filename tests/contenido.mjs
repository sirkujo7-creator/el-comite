// Recolector de contenido: arranca una partida por sector en el arnés y reúne todos los
// casos (objetos con `choices`) alcanzables desde las colecciones de contenido, llamando a
// las funciones constructoras con el estado real de esa partida.
import { crearJuego } from './harness.mjs';

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
    const state = j.ev('state'), flags = j.ev('flags');
    const visitados = new Set();
    const caminar = (v, origen, prof) => {
      if (prof > 8 || v == null) return;
      if (typeof v === 'function') {
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
        if (r && typeof r === 'object') caminar(r, origen + '()', prof + 1);
        return;
      }
      if (typeof v !== 'object' || visitados.has(v)) return;
      visitados.add(v);
      if (Array.isArray(v.choices)) {
        const clave = (v.titulo || '') + '|' + v.choices.map((c) => c.texto).join('|');
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
