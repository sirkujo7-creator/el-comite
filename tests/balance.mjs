// Fase 3 — tablero de balance. Juega N partidas por sector × dificultad × perfil de jugador
// (en paralelo) y resume: quiebra, turno y causa de la quiebra, metas de la junta cumplidas,
// rangos y arquetipos. No es una prueba: es un instrumento para decidir ajustes con evidencia.
//
//   npm run balance                      → 20 partidas por celda, imprime y guarda el reporte
//   BAL_N=40 npm run balance             → más partidas por celda
//   BAL_SALIDA=ruta npm run balance      → carpeta del reporte (defecto: reportes/)
//
// Salida: reportes/balance.json (datos crudos resumidos) y reportes/balance.html (tablero).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { jugarPartida, PERFILES_BALANCE as PERFILES_JUGADOR } from './jugador.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SECTORES = ['vitafit', 'technova', 'agroverde', 'ganadera', 'construyeya', 'modaurbana'];
const DIFICULTADES = ['facil', 'medio', 'dificil'];

if (!isMainThread) {
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'simulador_financiero.html'), 'utf8');
  parentPort.on('message', async (tarea) => {
    if (!tarea) return process.exit(0);
    try {
      const r = await jugarPartida(html, tarea);
      parentPort.postMessage({ tarea, r: {
        final: r.final, turnos: r.turnos, estadoFinal: r.estadoFinal, metas: r.metas, errores: r.errores.length,
      } });
    } catch (e) { parentPort.postMessage({ tarea, error: String(e) }); }
  });
} else {
  const N = Number(process.env.BAL_N || 20);
  const SALIDA = process.env.BAL_SALIDA || path.join(ROOT, 'reportes');
  const PERFILES = process.env.BAL_PERFILES ? process.env.BAL_PERFILES.split(',') : PERFILES_JUGADOR;
  const SECT = process.env.BAL_SECTORES ? process.env.BAL_SECTORES.split(',') : SECTORES;
  const DIFS = process.env.BAL_DIFICULTADES ? process.env.BAL_DIFICULTADES.split(',') : DIFICULTADES;
  const tareas = [];
  for (const dificultad of DIFS) for (const sector of SECT) for (const perfil of PERFILES)
    for (let i = 0; i < N; i++) tareas.push({ seed: 7 + i * 7919 + SECTORES.indexOf(sector) * 31, sector, perfil, dificultad });

  const hilos = Math.max(1, Math.min(os.cpus().length, 8));
  const resultados = [];
  const t0 = Date.now();
  await new Promise((fin) => {
    let pendientes = tareas.length, siguiente = 0;
    for (let w = 0; w < hilos; w++) {
      const worker = new Worker(fileURLToPath(import.meta.url));
      const dar = () => worker.postMessage(siguiente < tareas.length ? tareas[siguiente++] : null);
      worker.on('message', (m) => {
        resultados.push(m);
        if (--pendientes === 0) fin();
        if (resultados.length % 100 === 0) process.stderr.write(`  ${resultados.length}/${tareas.length} partidas\n`);
        dar();
      });
      dar();
    }
  });

  const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : null);
  const mediana = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const moda = (xs) => { const m = {}; xs.forEach((x) => x && (m[x] = (m[x] || 0) + 1)); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const resumir = (l) => {
    const ok = l.filter((x) => x.r);
    const der = ok.filter((x) => x.r.final.tipoFinal === 'derrota');
    const metas = ok.flatMap((x) => x.r.metas || []);
    return {
      n: ok.length, fallas: l.length - ok.length + ok.reduce((a, x) => a + x.r.errores, 0),
      quiebra: pct(der.length, ok.length),
      turnoQuiebra: mediana(der.map((x) => x.r.turnos)),
      causas: moda(der.map((x) => x.r.final.badge)).slice(0, 3),
      metas: pct(metas.filter((m) => m.cumplida).length, metas.length),
      rangoSA: pct(ok.filter((x) => ['S', 'A'].includes(x.r.final.rango)).length, ok.length),
      arquetipo: (moda(ok.map((x) => x.r.final.arquetipo))[0] || [null])[0],
      cajaFinal: mediana(ok.filter((x) => x.r.final.tipoFinal !== 'derrota').map((x) => x.r.estadoFinal.caja)),
      metasPorIndicador: Object.fromEntries(moda(metas.map((m) => m.indicador)).map(([k]) => {
        const xs = metas.filter((m) => m.indicador === k); return [k, [pct(xs.filter((m) => m.cumplida).length, xs.length), xs.length]];
      })),
    };
  };
  const celda = (f) => resumir(resultados.filter((x) => f(x.tarea)));
  const reporte = { fecha: new Date().toISOString(), N, segundos: Math.round((Date.now() - t0) / 1000), porDificultad: {}, porSector: {}, metasGlobal: {} };
  for (const d of DIFICULTADES) {
    reporte.porDificultad[d] = {};
    for (const p of PERFILES_JUGADOR) reporte.porDificultad[d][p] = celda((t) => t.dificultad === d && t.perfil === p);
  }
  for (const s of SECTORES) {
    reporte.porSector[s] = {};
    for (const p of PERFILES_JUGADOR) reporte.porSector[s][p] = celda((t) => t.sector === s && t.perfil === p && t.dificultad === 'medio');
  }
  reporte.metasGlobal = resumir(resultados).metasPorIndicador;

  // ---------------- Texto en consola
  const lineas = [`Balance — ${N} partidas por celda, ${tareas.length} en total (${reporte.segundos} s, ${hilos} hilos)`, ''];
  lineas.push('QUIEBRA % por dificultad × perfil (todos los sectores)');
  lineas.push('dificultad  ' + PERFILES_JUGADOR.map((p) => p.padStart(10)).join(''));
  for (const d of DIFICULTADES) lineas.push(d.padEnd(12) + PERFILES_JUGADOR.map((p) => String(reporte.porDificultad[d][p].quiebra).padStart(10)).join(''));
  lineas.push('', 'QUIEBRA % por sector × perfil (dificultad media)');
  lineas.push('sector      ' + PERFILES_JUGADOR.map((p) => p.padStart(10)).join(''));
  for (const s of SECTORES) lineas.push(s.padEnd(12) + PERFILES_JUGADOR.map((p) => String(reporte.porSector[s][p].quiebra).padStart(10)).join(''));
  lineas.push('', 'METAS DE LA JUNTA cumplidas % por sector × perfil (media)');
  for (const s of SECTORES) lineas.push(s.padEnd(12) + PERFILES_JUGADOR.map((p) => String(reporte.porSector[s][p].metas).padStart(10)).join(''));
  lineas.push('', 'METAS por indicador (todas las partidas): ' + Object.entries(reporte.metasGlobal).map(([k, [v, n]]) => `${k} ${v} % (${n})`).join(' · '));
  lineas.push('', 'CAUSAS de quiebra (media, por sector, perfiles juntos)');
  for (const s of SECTORES) {
    const c = resumir(resultados.filter((x) => x.tarea.sector === s && x.tarea.dificultad === 'medio'));
    lineas.push(`${s.padEnd(12)} quiebra ${c.quiebra} % · turno mediano ${c.turnoQuiebra ?? '—'} · ` + c.causas.map(([k, v]) => `${k} (${v})`).join(', '));
  }
  const fallas = resultados.filter((x) => x.error || (x.r && x.r.errores));
  lineas.push('', `Partidas con error: ${fallas.length}`);
  console.log(lineas.join('\n'));

  fs.mkdirSync(SALIDA, { recursive: true });
  fs.writeFileSync(path.join(SALIDA, 'balance.json'), JSON.stringify(reporte, null, 1));
  fs.writeFileSync(path.join(SALIDA, 'balance.txt'), lineas.join('\n') + '\n');
  fs.writeFileSync(path.join(SALIDA, 'metas.json'), JSON.stringify(resultados.filter((x) => x.r).flatMap((x) => (x.r.metas || []).map((m) => ({ ...m, ...x.tarea })))));
  console.log(`\nReporte: ${path.relative(ROOT, SALIDA)}/balance.json y balance.txt`);
  process.exit(0);
}
