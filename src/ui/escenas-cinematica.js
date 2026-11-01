/* =========================================================
   ESCENAS DE LAS CINEMÁTICAS — flashbacks con imágenes de Canva
   Cada frase de una cinemática puede llevar una `escena` (clave). Si hay imagen para esa clave
   en ESCENAS_IMAGENES, se muestra encima del texto como un recuerdo (destello, acercamiento
   lento, viñeta y grano: styles/cinematica.css). Sin imagen, la cinemática es solo texto.
   Nov. 2026: se retiraron las ilustraciones SVG (a Juan no le gustaron). Las nuevas las genera
   Juan en Canva con los textos de docs/escenas-canva.md; al llegar, se agregan a assets/escenas/
   y aquí, una línea por escena:  cuarto: '@asset(escenas/cuarto.webp)',
   ========================================================= */
const ESCENAS_IMAGENES = {
};
let escenaActual = null;
function mostrarEscenaCinematica(nombre){
  const cont = document.getElementById('introEscena');
  if(!cont) return;
  const src = nombre ? ESCENAS_IMAGENES[nombre] : null;
  if(!src){ escenaActual = null; cont.classList.remove('visible'); cont.innerHTML = ''; return; }
  if(nombre === escenaActual) return;
  escenaActual = nombre;
  cont.innerHTML = `<img src="${src}" alt=""><div class="escena-grano"></div>`;
  cont.classList.remove('visible', 'entra'); void cont.offsetWidth; cont.classList.add('visible', 'entra');
}
