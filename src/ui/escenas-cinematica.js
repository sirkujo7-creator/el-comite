/* =========================================================
   ESCENAS DE LAS CINEMÁTICAS — flashbacks con imágenes de Canva
   Cada frase de una cinemática puede llevar una `escena` (clave). Si hay imagen para esa clave
   en ESCENAS_IMAGENES, se muestra encima del texto como un recuerdo (destello, acercamiento
   lento, viñeta y grano: styles/cinematica.css). Sin imagen, la cinemática es solo texto.
   Nov. 2026: se retiraron las ilustraciones SVG (a Juan no le gustaron). Las nuevas las genera
   Juan en Canva con los textos de docs/escenas-canva.md; al llegar, se agregan a assets/escenas/
   y aquí, una línea por escena: la clave y el archivo con la marca de recurso del build (arroba
   asset entre paréntesis, ver build.mjs), p. ej. cuarto → assets/escenas/cuarto.webp.
   ========================================================= */
const ESCENAS_IMAGENES = {
  cuarto: '@asset(escenas/cuarto.webp)',
  saldo: '@asset(escenas/saldo.webp)',
  desalojo: '@asset(escenas/desalojo.webp)',
  ciudad: '@asset(escenas/ciudad.webp)',
  numeros: '@asset(escenas/numeros.webp)',
  imperio: '@asset(escenas/imperio.webp)',
  'terminal': '@asset(escenas/terminal.webp)',
  'empresa-vitafit': '@asset(escenas/empresa-vitafit.webp)',
  'empresa-technova': '@asset(escenas/empresa-technova.webp)',
  'empresa-agroverde': '@asset(escenas/empresa-agroverde.webp)',
  'empresa-ganadera': '@asset(escenas/empresa-ganadera.webp)',
  'empresa-construyeya': '@asset(escenas/empresa-construyeya.webp)',
  'empresa-modaurbana': '@asset(escenas/empresa-modaurbana.webp)',
  'legado': '@asset(escenas/legado.webp)',
  'perfil': '@asset(escenas/perfil.webp)',
  'calendario': '@asset(escenas/calendario.webp)',
};
let escenaActual = null;
function mostrarEscenaCinematica(nombre){
  const cont = document.getElementById('introEscena');
  if(!cont) return;
  const src = nombre ? ESCENAS_IMAGENES[nombre] : null;
  if(!src){ escenaActual = null; cont.classList.remove('visible'); cont.innerHTML = ''; return; }
  if(nombre === escenaActual) return;
  escenaActual = nombre;
  cont.innerHTML = `<img src="${src}" alt="" data-escena="${nombre}"><div class="escena-grano"></div>`;
  cont.classList.remove('visible', 'entra'); void cont.offsetWidth; cont.classList.add('visible', 'entra');
}
