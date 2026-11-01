// Estudio de opciones (no es prueba): para los casos de un archivo de contenido, ¿cuántos casos
// tienen la misma opción favorita en los 4 perfiles y cuántas opciones no elige nadie?
//   node tests/estudio-opciones.mjs dist/simulador_financiero.html src/content/sectores/ganadera.js ganadera
import fs from 'node:fs';
import { jugarPartida } from './jugador.mjs';
const [ruta, fuente, sector = 'ganadera'] = process.argv.slice(2);
const html = fs.readFileSync(ruta, 'utf8');
const titulos = new Set([...fs.readFileSync(fuente,'utf8').matchAll(/titulo:"([^"]+)"/g)].map(m=>m[1]));
const PERF = ['bueno','agresivo','imperio','metodico'];
const elec = {}; const quiebras = {};
for (const perfil of PERF) for (let i=0;i<20;i++){
  const r = await jugarPartida(html, {seed: 900+i*53, sector, perfil});
  quiebras[perfil] = (quiebras[perfil]||0) + (r.final.tipoFinal==='derrota'?1:0);
  for (const t of r.traza){ if(!titulos.has(t.titulo)) continue; const c = elec[t.titulo] ||= {n:0}; c.n = Math.max(c.n, 0); const v = c[perfil] ||= []; v[t.opcion]=(v[t.opcion]||0)+1; }
}
let total=0, unanimes=0, nunca=0, opciones=0;
const nOps = (titulo)=>{ const m = fs.readFileSync(fuente,'utf8').split('titulo:"'+titulo+'"')[1]; const bloque = m.split(/choices:\[/)[1].split(/\]\s*[,}]/)[0]; return (bloque.match(/\{texto:/g)||[]).length; };
for (const [titulo, pp] of Object.entries(elec)){
  const perfiles = PERF.filter(p=>pp[p]);
  const fav = new Set(perfiles.map(p=>{ const v=pp[p]; let m=0,k=-1; v.forEach((c,i)=>{ if((c||0)>m){m=c;k=i;} }); return k; }));
  const usadas = new Set(); perfiles.forEach(p=>pp[p].forEach((c,i)=>{ if(c) usadas.add(i); }));
  const n = nOps(titulo); total++; opciones += n; nunca += n - usadas.size; if (fav.size===1 && perfiles.length>=3) unanimes++;
}
console.log(`casos jugados (${sector}): ${total} · misma favorita en los 4 perfiles: ${Math.round(100*unanimes/total)} % · opciones que nadie eligió: ${nunca} de ${opciones} (${Math.round(100*nunca/opciones)} %) · quiebras (de 20): ${JSON.stringify(quiebras)}`);
