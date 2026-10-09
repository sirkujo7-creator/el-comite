// Une src/ + assets/ en un solo HTML autocontenido: dist/simulador_financiero.html
// - Cada línea `<!-- @include ruta -->` de src/index.html se reemplaza por el contenido de src/ruta.
// - Cada `@asset(ruta)` se reemplaza por el archivo de assets/ruta (imagen o fuente) como data URI base64.
// - Las librerías de terceros (assets/vendor/) se incluyen tal cual con `<!-- @include ../assets/vendor/… -->`.
// Sin dependencias: solo Node.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');
const SALIDA = path.join(ROOT, 'dist', 'simulador_financiero.html');
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };

function incrustarAssets(texto) {
  return texto.replace(/@asset\(([^)]+)\)/g, (_, ruta) => {
    const mime = MIME[path.extname(ruta).toLowerCase()];
    if (!mime) throw new Error(`Tipo de archivo no soportado: ${ruta}`);
    return `data:${mime};base64,` + fs.readFileSync(path.join(ASSETS, ruta)).toString('base64');
  });
}

export function construir() {
  const plantilla = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const unido = plantilla.replace(/^<!-- @include (\S+) -->\n/gm, (_, ruta) =>
    fs.readFileSync(path.join(SRC, ruta), 'utf8'));
  return incrustarAssets(unido);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = construir();
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, html);
  console.log(`dist/simulador_financiero.html — ${html.split('\n').length - 1} líneas, ${(html.length / 1e6).toFixed(2)} M caracteres`);
}
