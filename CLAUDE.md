# CLAUDE.md — El Comité (simulador de gestión financiera)

> Documento de traspaso para Claude Code. Léelo completo antes de tocar código.
> Autor del proyecto: Juan (docente de Ciencias Sociales/Filosofía, estudiante de Administración Financiera, Ibagué, Colombia).

---

## 1. Qué es el proyecto

**El Comité** es un simulador de gestión financiera ejecutiva, inspirado en *Reigns*: cada turno llega un caso (dilema) con varias opciones; cada decisión mueve indicadores financieros y relacionales. Estética **retro oscura**, retratos planos poligonales con aura negra radial.

- Partida: `MAX_TURNS = 20`. Junta directiva cada 5 turnos con **meta trimestral**.
- 6 sectores: `vitafit`, `technova`, `agroverde`, `ganadera`, `construyeya`, `modaurbana`.
- Progreso entre partidas en `localStorage` (`STORAGE_KEY = 'elcomite_progreso_v1'`): XP, historial, legados.
- Público: estudiantes. Debe enseñar finanzas reales (WACC, razón corriente, días de cartera, etc.) sin volverse planilla.

### Idioma
- **Contenido del juego (casos, narrativa, UI): español.**
- **Conversación con Juan: español**, respuestas profundas pero concisas, sin exceso de texto.
- No entregar archivos `.zip` salvo que Juan lo pida explícitamente.

---

## 2. Estado actual — repositorio modular (Fase 1 completada)

El juego ya no se edita en un solo HTML. **Se edita `src/` y se genera `dist/`.**

```
original/simulador_financiero.html   referencia intacta (NO editar)
src/index.html                       esqueleto; cada `<!-- @include ruta -->` inserta un archivo de src/
src/styles/*.css                     hojas en orden de cascada; sala-de-mando.css (tablero y ventana) va al final
src/{engine,systems,ui,minigames,audio,content}/*.js   65 fragmentos de un solo <script>
assets/                              retratos .webp, junta .jpg y fuentes/*.woff2; en el código aparecen como @asset(ruta)
assets/vendor/chart.umd.min.js       Chart.js 4.4.0 incrustado (el juego funciona sin internet)
build.mjs                            une todo en dist/simulador_financiero.html (sin dependencias)
dist/simulador_financiero.html       archivo que se entrega a Juan (se versiona)
tests/                               arnés + pruebas (npm test)
```

- **Publicación web:** https://sirkujo7-creator.github.io/el-comite/ (GitHub Pages, activado por Juan
  con Source = GitHub Actions). `.github/workflows/publicar.yml` corre `npm test` (Node 22) en cada
  push a `claude/awesome-pascal-5xc05d` y, solo si pasa, publica `dist/` como `index.html`.
  Si una prueba falla, la versión publicada no cambia.
- **Comandos:** `npm run build` (genera dist/) · `npm test` (build + todas las pruebas, ~1 min).
  Variables: `SIM_N` (partidas por perfil, defecto 84), `SIM_DIFICULTAD`, `EQUIV_N`.
- **Los fragmentos JS NO son módulos ES:** se concatenan en orden dentro de un único `<script>`
  y comparten el alcance global, igual que el original. El orden de `src/index.html` importa
  (declaraciones `let/const` y llamadas de nivel superior). No añadir `import`/`export`.
- Tras cualquier cambio en `src/` o `assets/`: `npm run build` y commitear también `dist/`.
- Al cerrar la Fase 1, `dist/` era **idéntico byte a byte** al original.

### Dónde está cada cosa (archivo → contenido clave)

| Archivo | Contenido |
|---|---|
| engine/estado-global.js, constantes-partida.js | `state`, `flags`, `MAX_TURNS`… |
| engine/dificultad-e-inicio.js | `DIFICULTADES`, `DIFICULTAD_MODIFICADORES`, `initState`, `clamp/shuffle/pick` |
| engine/impacto.js | `IMPACTO_MULTIPLICADORES`, `CAMPOS_INVERTIDOS`, `amplificarEImpredecir`, ecos |
| engine/motor-operativo.js | `aplicarMotorOperativo`, `ajustarDeltaSiCritico`, `applyEfectos` |
| engine/resolucion-turno.js, junta-trimestral.js, finales.js, flujo-turno.js, inicio.js | `resolveTurn`, junta, `checkForcedEnding`, `nextTurn`, arranque |
| systems/metas-e-imagenes.js | constantes `RETRATO_*`, `COMITE_IMG_BASE64`, `metaTrimestral` |
| systems/metas-junta.js | `META_DELTAS`, `META_RANGOS`, `generarNuevaMeta` |
| systems/priorizacion.js, priorizacion-casos.js | `indicadoresEnAlerta`, `buscarCasoParaIndicador`, `elegirDecisionExtra` |
| systems/… | persistencia, mandato inicial, logros, glosario, arquetipos, mayor error, título, legado, estadísticas |
| ui/… | formato, feedback visual, iconos KPI, tensión, render de caso, franja de KPI, resultado (antes → después), bitácora, post-mortem, panel CRT, pantallas de inicio, cinemática, pantalla completa |
| minigames/… | auditoría, mercado volátil, bandeja, fuga de capital, oficina (+ ambiente) |
| content/universal/… | dilemas, elenco, cadenas profundas, carta meta, karma, cisne negro… |
| content/sectores/<sector>.js, sectores.js, perfiles.js | `*_CASES`, `*_RANDOM`, `SECTORS`, `PERFILES`, `PERKS` |

### Estado de la partida (Fase 4, nov. 2026)
Todo lo que pertenece a UNA partida vive en un solo objeto, `partida` (`engine/estado-global.js`,
lista en `CAMPOS_PARTIDA`: `state`, `flags`, `history`, `turnNumber`, `mainQueue`, `randomBag`,
`sectorActual`, `perfilActual`, `perkActual`, `metaTrimestral`, `mandatoInicial`, contadores de
logros, rachas, anti-repetición…). `initState` crea un expediente nuevo con `nuevaPartida()`
(solo conserva sector, perfil y ventaja), así que nada de la partida anterior queda suelto.
Cada campo sigue disponible con su nombre de siempre como acceso directo a `partida.<campo>`
(propiedad de `globalThis`): **no volver a declarar esos nombres con let/var** — la prueba
`guardado.test.mjs` lo detecta. Fuera del expediente quedan solo cosas de la sesión o de la
interfaz: `sessionXP`, `historialPartidas`, `legadosEmpresariales`, `dificultadSeleccionada`,
`nombreEmpresaJugador`, selecciones de las pantallas de inicio, audio y temporizadores.

**Continuar partida** (`systems/guardado-partida.js`, clave `elcomite_partida_v1`): el expediente
se guarda en localStorage con el tablero en reposo (al empezar la partida, al empezar cada turno
y tras "Calculando impacto") y se borra al terminar el año fiscal. Casos, eventos, sectores y
perfiles se guardan como referencia a su lugar en el contenido (`caso:vitafit:3`,
`fn:eventoHuelgaSindical`); una huella del contenido descarta guardados de otra versión de los
casos. La portada muestra "CONTINUAR PARTIDA · empresa · turno n de 20" y "NUEVA PARTIDA".
Salir al inicio desde Ajustes conserva la partida hasta el último turno terminado (un turno a
medias no se guarda: así no se puede esquivar un caso saliendo y volviendo).

---

## 3. Reglas de calidad (obligatorias en cada cambio)

1. **Cero opciones vacías:** `grep -c "efectos:{}"` debe dar `0`.
2. **Sin dominancia absoluta:** ninguna opción puede ser mejor o igual en todos los indicadores que otra del mismo caso. Normalizar antes con `CAMPOS_INVERTIDOS` (`deuda`, `wacc`, `diasInventario`, `diasCartera`: menos es mejor).
3. **Cada decisión tiene costo:** toda opción debe tener al menos un efecto negativo o un riesgo.
4. **Metas alcanzables:** toda meta trimestral queda dentro de `META_RANGOS` (bug histórico: se pidió −2 días de inventario).
5. **Casos con personaje:** si usan retrato, deben tener `retrato` y `presentacion`.
6. **Sintaxis:** el último `<script>` debe compilar con `new Function(codigo)`.
7. **CSS balanceado:** igual número de `{` y `}`.
8. **Simulación tras cada cambio de balance:** 80–200 partidas automatizadas por perfil de jugador. Referencias actuales:
   - Juego "bueno": 0 % quiebra · Crecimiento agresivo: ~35 % quiebra · Arquetipo Imperio: ~8 %.
   - Distribución de efectos: caja ~55 % de opciones, EBITDA ~40 %, razón corriente ~2 % (bajo, a mejorar).
9. **Anti-repetición:** ningún caso debería aparecer más de 2 veces por partida.
10. **Español correcto y natural** en todo texto de juego (revisar concordancia y preposiciones).

### Arnés de pruebas (`tests/`)
- `harness.mjs`: Node `vm` + DOM falso (árbol real parseado del HTML, selectores simples,
  eventos con burbujeo) + **reloj virtual** (setTimeout/rAF/Date avanzan solo cuando el arnés
  lo pide; los minijuegos se agotan solos) + `Math.random` con semilla (mulberry32).
- `jugador.mjs`: juega partidas completas **haciendo clic en la interfaz**. Perfiles:
  `bueno` (prudente: además descuenta la deuda diferida y evita eventos `disparar`),
  `agresivo` (todo por EBITDA), `imperio` (EBITDA + caja), `azar`.
  Espera 1,3 s tras cada clic (más que "Calculando impacto"): volver a pulsar antes encola
  cierres de modal duplicados — error del arnés, no del juego.
- `equivalencia.test.mjs`: **opcional** (`EQUIV_REF=ruta.html npm test`). Compara partidas con
  semilla fija entre un HTML de referencia y dist/. Úsala en refactorizaciones que no deben
  cambiar el juego (p. ej. Fase 4): genera la referencia antes del cambio.
- `balance.mjs` (Fase 3, `npm run balance`; `BAL_N`, `BAL_PERFILES`, `BAL_SECTORES`,
  `BAL_DIFICULTADES`, `BAL_SALIDA`): tablero de balance en paralelo (sector × dificultad × perfil),
  con quiebra, turno y causa de quiebra, metas de la junta cumplidas (por indicador) y rangos.
  Escribe `reportes/` (no se versiona). Añade el perfil `metodico` (= bueno que además persigue la
  meta trimestral) para medir si las metas son alcanzables. 1.080 partidas ≈ 80 s con 4 hilos.
  `jugarPartida` acepta `sonda`/`leer` para instrumentar el motor en estudios puntuales.
- `guardado.test.mjs` (Fase 4): ningún let/var tapa un campo del expediente; en 4 sectores, una
  partida cortada en el turno 8 se guarda sin referencias perdidas, se retoma en otro juego
  idéntica, se juega hasta el final y su guardado se borra.
- `contenido.mjs` recolecta todos los casos (llama a las constructoras con el estado real de cada
  sector; construye varias veces para detectar opciones con resultado aleatorio).
- `contenido.test.mjs` (reglas 1–7) y `simulacion.test.mjs` (reglas 8–9, imprime el reporte).
  Para las reglas 2 y 3 cuentan como beneficio/riesgo no numérico: `capex`, `diferir`,
  `disparar`, `setFlags` y los efectos aleatorios.
- Las cifras de referencia de la regla 8 venían de un arnés anterior con otros perfiles.
  Línea base con este arnés (84 partidas/perfil, dificultad media, mismas semillas):

  | Perfil | Quiebra original/ | Tras Fase 2 (oct. 2026) | Tras Fase 3, ronda 1 |
  |---|---|---|---|
  | bueno | 0 % | 0 % | 0 % (rango S 10,7 → 25 %) |
  | agresivo | 27,4 % | 19,0 % (arquetipo Imperio 11,9 %) | 21,4 % |
  | imperio | 34,5 % | 33,3 % | 22,6 % |
  | azar | 35,7 % | 33,3 % | 23,8 % |

  Casos repetidos más de 2 veces por partida: ~50 por perfil → 0.

---

## 4. Decisiones intencionales de Juan (NO "arreglar")

- Umbral del arquetipo **Equilibrista**: se mantiene.
- `sparklineSVG`: código muerto conservado a propósito.
- **Final oculto trágico**: es deliberado.
- Rango de moral: se dejó como está tras el ajuste de +16 %.
- Flechas de tendencia (decisión de oct. 2026, reemplaza la anterior): ▲/▼ según hacia dónde se
  movió el valor; **verde si el movimiento acerca el indicador a lo sano, rojo si lo aleja**
  (aunque esté en zona crítica, si se recupera va en verde). 🔥 desde racha 3. "Lo sano" está en
  `RANGOS_SANOS` (`ui/formato.js`, `cambioEsSano`/`deltaEsSano`) y se usa en todo lo visual:
  flechas, números de cambio, destellos y fichas. El motor sigue usando `esMejorSiSube`.
- Inversión se colorea ámbar `#D98847` (no como pérdida).
- Tipografía (oct. 2026), variables en `styles/fuentes.css`: `--font-ui` IBM Plex Mono (interfaz,
  números, botones, texto del caso), `--font-texto` IBM Plex Sans (párrafos), `--font-narr`
  Fraunces (titulares y título del caso), `--font-display` Comite Pixel (Press Start 2P con Á É Í Ó Ú
  rehechas; la original las dibuja como minúsculas y por licencia no puede llevar su nombre) solo en títulos grandes
  (logotipo, pantallas, sello del resultado, rango final). No usar fuentes nuevas ni nombres sueltos.
- Selección (perfil, ventaja, dificultad): borde dorado y marca cuadrada; al pasar el cursor solo se
  aclara el borde (antes se invertía a blanco). El cambio de cada KPI se resalta en su propio número
  (no hay número flotante encima de la tarjeta); las fichas de relaciones sí lo conservan.
- Ventana de decisión (oct. 2026, `ui/franja-kpi.js`): franja con todos los indicadores mientras se
  decide. Al pasar el cursor por una opción se iluminan los que toca, **sin cifra ni dirección**
  (punto grande = efecto fuerte, según `FRANJA_UMBRAL_FUERTE`; borde punteado ámbar en caja si la
  opción difiere deuda). Mostrar cuánto o hacia dónde quitaría la decisión al jugador: no hacerlo.
- Pantalla de resultado (oct. 2026, `ui/resultado-balance.js`): tras decidir, cada indicador que
  cambió aparece como "antes → después" con el delta en el color de lo sano (ámbar si es
  inversión); las cifras cuentan y las relaciones muestran su barra. Sonido según el sello:
  `sonidoResultado('pos'|'neg'|'neu')`; la junta usa la misma voz (`tocarCampana`, parciales
  inarmónicos + eco corto, en lugar de osciladores simples).
- Pantallas de inicio (oct. 2026): portada con la imagen de la junta saliendo de la oscuridad;
  sectores con color propio (`SECTOR_COLOR`), descripción, rasgos operativos y cifras iniciales
  a la vista; configuración con perfil/ventaja/dificultad explicados en la tarjeta (efectos como
  fichas de color "lo sano") y botón para volver a cambiar de sector. Textos en tuteo.
- Estética "Sala de mando" (oct. 2026, elegida por Juan entre varias maquetas; `styles/sala-de-mando.css`,
  reemplaza a dashboard.css). Fondo oscuro, bordes hueso y sombras duras del color del estado
  (verde `--sm-sano`, ámbar `--sm-alerta`, rojo `--sm-malo` con franja de peligro). Solo se activa con
  `body.en-partida` (lo pone `showChrome`): inicio e informe final no cambian. Distribución: cabecera
  (logotipo, empresa, meta, año fiscal con las juntas marcadas) → indicadores en mosaico de 2 columnas |
  gráficas + calendario | anillos de relaciones, mantenimiento y panel de la meta → pie con botón de
  turno, resumen de bitácora y tarjeta "Situación en la oficina" (siempre visible; se enciende cuando
  hay evento). Pesos completos con los millones grandes y el resto atenuado (`fmtMoneyHTML`); la cifra
  se achica sola si no cabe. Gráficas: caja con degradado, zona crítica bajo $5 M y la mayor caída
  marcada; EBITDA en barras con el color de lo sano + deuda en línea y razón deuda/EBITDA. Las
  decisiones se abren en una ventana (`.ventana`, borde ámbar, sin borde blanco) sobre el tablero
  difuminado, con la franja de indicadores dentro. Capa CRT suave (líneas finas). Plan acordado:
  1) estilo ✅, 2) efectos del turno ✅, 3) alarma, junta y finales ✅, 4) sonidos sincronizados y celular ✅;
  video a Juan antes de publicar cada etapa.
- Efectos del turno (etapa 2, `ui/efectos-turno.js` + final de sala-de-mando.css): encendido en
  cascada del tablero al empezar, ventana que se enciende como monitor, título del caso que se
  descifra, destello RGB y barra de carga al pasar por una opción, mira ámbar en la franja, sello
  "ORDEN EJECUTADA" con sacudida (el resultado se muestra 0,5 s después), barra de bloques en
  "Calculando impacto" e impacto en las tarjetas (partículas, cifra que salta sobre la etiqueta y
  valor que cuenta). Grano y barrido de luz suaves. Usan `azarVisual()`, nunca `Math.random`: las
  partidas con semilla siguen idénticas (comprobado con `EQUIV_REF`). Respetan
  `prefers-reduced-motion`.
- Alarma, junta y finales (etapa 3, `ui/efectos-finales.js`): en el tablero la viñeta roja de
  pantalla completa se reemplazó por un marco que late y una cinta inferior con los motivos
  (`nivelAlarma`: caja ≤ 5, razón corriente < 1, WACC ≥ 20, deuda ≥ 45, EBITDA ≤ 0, relación en
  crítico, inventario ≥ 90 días) más una interferencia breve cada 7 s; tensión (caja ≤ 15 o WACC ≥ 16)
  = marco ámbar suave. La junta pinta la ventana de dorado ("cierre del trimestre n de 4") y su
  evaluación lleva el sello META CUMPLIDA / NO CUMPLIDA. "COMBO ×n" en el resultado tras 2+ sellos
  positivos seguidos. Quiebra: grietas, sacudida y apagón de monitor antes del informe; informe con
  "MISIÓN FALLIDA". Cierre: "MISIÓN CUMPLIDA" y lluvia de monedas (más cuanto mejor el rango).
  El informe final usa la misma estética (`body.informe-final`, solo en pantalla; imprimir no cambia).
- Sonidos de la Sala de mando (etapa 4, `audio/sonidos-sala.js`): cada efecto tiene su sonido
  sincronizado — encendido, ventana, título descifrado, clic suave al pasar por opciones, golpe del
  sello (cuando toca la ventana), bips de "Calculando impacto" (uno por bloque), impacto en las
  tarjetas (un sonido por decisión según lo que predomine + tic del conteo), sirena al ENTRAR en
  alarma (no en bucle), mazo y fanfarria/golpe en el veredicto de la junta, arpegio del combo,
  vidrio y apagón en la quiebra, fanfarria con monedas o caída al final. Volúmenes medidos: efectos
  de fondo 0,05–0,2 de pico, eventos 0,3–0,4 (como el resultado y la junta). Usan `azarVisual()`.
- Situación en la oficina (nov. 2026, minigames/oficina.js + final de sala-de-mando.css): los 9
  eventos usan la estética de la sala — botones como las opciones de un caso (clic suave al pasar),
  deslizadores de riel frío→caliente, barras de tiempo en bloques, cámara de seguridad verde con REC,
  teclas físicas en los juegos de memoria (un tono por destello), una pantalla azul de verdad. Al
  resolver se ocultan los controles y el resultado es el de una decisión: sello, consecuencia,
  "antes → después" y `sonidoResultado`. Ignorar el robo de la nevera ya no es gratis (moral −1).
- Flashbacks en las cinemáticas (nov. 2026, `ui/escenas-cinematica.js`): cada frase puede llevar una
  `escena` (SVG plano en la paleta de la sala, sin archivos) con la silueta del protagonista
  (`siluetaProtagonista`: de pie, sentado o de espaldas, con filo de luz). Intro: cuarto sin pagar,
  saldo $0, carta de desalojo, la ciudad, los números, la torre del imperio, la terminal. Inicio de
  partida: terminal, fachada de la empresa (color del sector y su nombre), retrato de la gestión
  anterior (legado), espejo y corbata (perfil), la imagen de la junta. Informe: calendario tachado,
  sala de juntas a puerta cerrada, la curva real de caja de la partida, el veredicto ante la junta.
  Entran con destello, se acercan despacio, viñeta y grano.
- Escala de rangos (nov. 2026, decisión de Juan): S y A = victoria ("MISIÓN CUMPLIDA" y monedas),
  B = resultado regular ("AÑO A MEDIAS", sin fiesta), C y D = desastre ("DESASTRE"; la quiebra sigue
  siendo "MISIÓN FALLIDA"). Nuevo rango D (`cierreAnioFiscal`): la empresa vale menos del 40 % de su
  valor inicial. `VEREDICTO_RANGO` lo traduce y el informe lo muestra sobre el rango.
- Cinemáticas en silencio absoluto (`silencioCinematica`): música, drones y tecleo callan mientras
  dura la secuencia.
- Celular (≤720 px, al final de sala-de-mando.css): una columna — indicadores en 2 columnas → botón
  de turno → relaciones y meta → gráficas → bitácora → oficina (`display:contents` en el pie).
  Carteles, sello y veredicto se ajustan al ancho (`clamp` con vw); el informe final empieza arriba.
- Retratos en WebP (calidad 90, alfa intacto): mismo aspecto, 714 KB → 178 KB.
- Música de fondo (`audio/musica.js` + `audio/piano.js`, generada, no grabada). Menú: el comité en
  penumbra. **Partida (nov. 2026): la "Sonata de la junta"**, piano solo a la manera de la Claro de
  luna de Beethoven, en do sostenido menor, con el tema de El Comité (ritmo con puntillo). Fases
  (`faseSonata`): calma = Adagio (octava grave, tresillos, tema); tensión = Più mosso (semicorcheas,
  bajo en cada tiempo, tema en octavas); alarma = Presto agitato a la manera del tercer movimiento
  (olas de semicorcheas de tres octavas, dos acordes secos en fortissimo, octavas martilladas);
  ventana de decisión (`musicaDecision`, salvo en alarma) = trémolo grave y una nota que insiste
  sobre una séptima disminuida que no resuelve; junta (`musicaJunta`) = octavas graves aisladas.
  Tempos 60 / 72 / 150 / 64 / 50. El nivel sigue a `nivelAlarma`. El piano se sintetiza nota a nota
  (parciales inarmónicos, 2–3 cuerdas desafinadas, doble decaimiento, martillo) en un Worker desde el
  menú (`precalentarPiano`): ~93 notas en ~6 s, sin pausas en el hilo principal. No usa Math.random.
  Historia: primero un género alegre por sector (descartado: "música de tienda"), luego una banda de
  tensión sintética (descartada: demasiado suave y sin carácter); Juan eligió el piano entre muestras
  (A sintetizador, B thriller con piano, C orquestal, y la prueba clásica). Ajustes tiene volumen de
  música aparte (`volumenMusica`). Volumen base `MUSICA_VOLUMEN` 0,14.
- Mantenimiento de equipos (oct. 2026, Vita Fit y Ganadería, `requiereCapex`): las opciones con
  `capex` llevan la etiqueta "🔧 Mantenimiento" y la cabecera muestra "Equipos: n de 3 turnos sin
  mantenimiento" (`renderEquiposLine`, cuenta también el turno recién jugado). El conteo es por
  turno real en `aplicarMotorOperativo` (antes por decisión); al tercer turno seguido, EBITDA −2.
- Sparklines fueron retiradas por estética; el estado relacional se muestra con barras de progreso.
- Retratos: imagen transparente (WebP), grande, flujo de dos pantallas (`renderPersonajeIntro`), nombre debajo de la imagen, mini retrato en la pantalla de decisión. Se rechazó: retrato circular con fondo blanco e ilustración SVG en la portada.

---

## 5. Forma de trabajar con Juan

- **Explicar antes de cualquier cambio arquitectónico grande** y esperar su visto bueno.
- **Proponer opciones**, no asumir. Trabajar paso a paso.
- Cuando diga "no hagas nada aún", solo informar.
- **Cambios visuales o creativos grandes (imágenes, estética, música): primero muestras, luego aplicar.**
  Nov. 2026: se aplicaron los flashbacks SVG de las cinemáticas sin mostrarlos antes y a Juan no le
  gustaron. Quiere las imágenes hechas con Canva. Regla: mostrar la propuesta y esperar su visto bueno.
- Valora hacer las cosas bien sobre hacerlas rápido.
- Al terminar: resumen breve de qué cambió y qué se verificó (números de simulación cuando aplique).

---

## 6. Plan de transformación

### Fase 1 — Modularizar sin cambiar el comportamiento ✅ completada

**Objetivo:** pasar de un archivo de 9.400 líneas a un repositorio ordenado, **produciendo un HTML final idéntico en comportamiento**. Nada de mejoras de juego en esta fase.

Estructura propuesta:
```
el-comite/
├─ CLAUDE.md
├─ package.json
├─ build.mjs                 # une todo en dist/simulador_financiero.html
├─ src/
│  ├─ index.html             # esqueleto HTML con marcadores de inserción
│  ├─ styles/                # CSS dividido por pantalla/componente
│  ├─ engine/                # estado, turnos, motor operativo, impacto, finales
│  ├─ systems/               # metas, logros, legado, arquetipos, priorización, glosario
│  ├─ ui/                    # KPIs, feedback visual, bitácora, retratos, modales
│  ├─ minigames/             # fuga de capital, oficina
│  ├─ audio/
│  └─ content/
│     ├─ universal/          # dilemas, inbox, oficina, cisnes negros, karma, cadenas
│     └─ sectores/           # un archivo por sector: casos, random, calendario, karmaExtra
├─ assets/retratos/*.png     # los 11 retratos + comité extraídos del base64
├─ tests/
│  ├─ harness.mjs            # DOM falso (ver §3)
│  ├─ contenido.test.mjs     # reglas 1–5 y 9
│  └─ simulacion.test.mjs    # 80–200 partidas por perfil, reporte de quiebras
└─ dist/                     # salida: un solo HTML autocontenido (imágenes re-incrustadas)
```

Pasos:
1. `git init` y primer commit con el HTML original intacto (`original/`), como referencia.
2. Extraer las 12 imágenes base64 a `assets/` como PNG.
3. Separar CSS, HTML y JS en módulos sin reescribir lógica (mover, no rediseñar).
4. `build.mjs` (sin dependencias pesadas; esbuild es aceptable) que genera `dist/simulador_financiero.html` autocontenido, re-incrustando las imágenes.
5. **Prueba de equivalencia:** con semilla fija de aleatoriedad, el original y el `dist/` deben producir las mismas secuencias de casos y estados en N partidas simuladas.
6. Pasar el arnés de pruebas a `tests/` y ejecutable con `npm test`.
7. Commit por cada paso. Mostrar a Juan el resultado antes de la Fase 2.

Criterio de éxito: Juan abre `dist/simulador_financiero.html` y no nota ninguna diferencia.

### Fase 2 — Calidad de contenido automatizada ✅ completada (oct. 2026)
- Validador de esquema para casos (campos obligatorios, rangos de efectos).
- Reporte automático de cobertura por indicador y sector (prioridad: razón corriente, capital de trabajo, valor de inventario y días de cartera, especialmente en Ganadería).
- Revisión gramatical del texto (ej.: "tenerte de aliada" → "tenerte como aliada").

### Fase 3 — Balance basado en datos
- Simulaciones masivas con perfiles de jugador; tablero de quiebra, arquetipos y metas cumplidas por sector y dificultad.
- Ajustes de balance solo con evidencia antes/después.

### Fase 4 — Producto
- ✅ Estado de la partida en un solo expediente y "continuar partida" (nov. 2026).
- ✅ Despliegue web (GitHub Pages).
- Pendiente: modo docente (resultados exportables para clase). Juan pidió dejarlo para después;
  el expediente ya permite exportar una partida completa.

---

## 7. Pendientes conocidos

- Los efectos condicionales (p. ej. `inventarioSano ? {...} : {...}`) solo se validan en la rama
  que corresponde al estado inicial; revisar a mano las otras ramas al editarlas.
- `valorInventario` tiene dos lecturas en el contenido: perder valor (robo, plaga, vencimiento) es
  malo; tener demasiado es capital atrapado. Decisión: en lo visual el objetivo sano es 25
  (por debajo, perder valor es rojo; por encima, bajarlo es verde). En las reglas de contenido
  sigue contando "más es mejor" (perder valor = costo).
- La copia del HTML en el Proyecto de claude.ai puede estar desactualizada frente a la última versión entregada.

## 8. Historial de cambios de contenido y balance

**Fase 2 (oct. 2026)** — ver commits para el detalle:
- Ganadería: umbral propio de días de inventario (`SECTORS[].umbrales`; `colorFor` lo respeta).
  Antes arrancaba en crítico con 6 días y la decisión extra empujaba aún más abajo.
- Anti-repetición: `historialTitulosRecientes` recuerda toda la partida (se reinicia en
  `initState`); la decisión extra nunca repite un caso ya visto.
- Reglas 2 y 3 en cero: se corrigieron 243 pares dominados y 88 opciones sin costo. Criterios:
  capital propio sube el WACC; pagar renta de contado mejora la confianza del banco;
  depender de un solo cliente/proveedor sube el WACC y diversificar lo baja. Cinco opciones
  sin sentido como decisión se reemplazaron (ver commit). El encubrimiento ante la auditoría
  externa es una apuesta (25 %).
- Revisión gramatical completa (oct. 2026): se leyeron las ~3.100 frases del juego. 61 correcciones:
  titulares con mayúscula inicial (no estilo inglés), concordancia, preposiciones ("sobrevivir a",
  "enterarse de que"), voseo → tuteo, anglicismos sin glosario (upgrade, pricing, freelance, tech).
  Se conservan los términos financieros que tienen entrada en el glosario (fee, equity, venture
  debt, warrants, spot). Pendiente opcional: las citas usan comillas simples ('…'); la norma
  prefiere comillas angulares («…»).
- Pruebas nuevas: esquema de casos, cobertura mínima (4 casos por indicador y sector) y ramas
  condicionales (estados extremos).
- 16 casos nuevos para cobertura: 2 universales (cartera, razón corriente), 4 Vita Fit,
  4 Agroverde, 2 Ganadería, 4 Construye Ya (inventario). Mínimo por sector: 4 casos por
  indicador aplicable.

**Fase 3, ronda 1 (oct. 2026)** — medido con `npm run balance` (40 partidas por celda, 3.600 partidas,
mismas semillas antes/después). Tres cambios aprobados por Juan:
- A. WACC en equilibrio al arrancar: `state.waccEquilibrioBase` (en `initState`); el motor lo
  acerca a `waccEquilibrioBase − confianzaBanco × 0,08`. Antes apuntaba a `20 − confianzaBanco × 0,08`,
  por encima del WACC inicial de todos los sectores: subía ~+0,8 por trimestre jugando bien (y más
  rápido en Fácil que en Difícil). Ahora la deriva es ~−0,1 y solo responde a la confianza bancaria.
- B. Penalizaciones sistémicas de `applyEfectos` (razón corriente < 1, deuda ≥ 40, deuda/EBITDA ≥ 4,
  banco ≤ 35, caja ≤ 8, cartera ≥ 90, inventario vencido, moral baja, medidores de doble filo y
  consecuencias permanentes de las cadenas) una sola vez por turno (`state.turnoPenalizado`).
  Antes se aplicaban en cada cambio de indicadores (~2,2 veces por turno).
- C. Metas de la junta proporcionadas: EBITDA +1,5 (antes +3; el jugador más agresivo lograba
  +2,4 de mediana por trimestre) y WACC −0,5 con un decimal (antes −1 entero).

  | Dificultad media | Antes | Después |
  |---|---|---|
  | Metas cumplidas — metódico / prudente | 19 % / 11 % | 32 % / 19 % |
  | Metas de EBITDA / WACC cumplidas | 12,7 % / 1,6 % | 26,4 % / 5,3 % |
  | Quiebra imperio · Construye YA imperio | 34 % · 90 % | 18 % · 48 % |
  | Quiebra agresivo / azar | 21 % / 32 % | 19 % / 26 % |
  | Quiebra prudente y metódico (todas las dificultades) | 0–8 % | 0–7 % |


**Fase 3, ronda 2 (oct. 2026)** — aprobada por Juan:
- D. Mantenimiento visible (etiqueta, aviso en cabecera) y contado por turno real (ver §4).
- E. El jugador `metodico` valora el mantenimiento cuando el aviso está en 2 de 3 (solo el arnés).
- Corrección: la primera junta comparaba la caja y el EBITDA del trimestre contra cero (o contra la
  partida anterior); `initState` ahora toma la foto inicial. "EBITDA generado" → "Variación del EBITDA".
- Metas cumplidas por el metódico (media): Ganadería 17 → 37 %, Vita Fit 23,5 → 42 %; el resto de
  sectores, igual. Quiebras sin cambios relevantes (Ganadería agresivo 7,5 → 0 %).
- Se decidió no tocar: Moda Urbana con perfil agresivo (48 % de quiebra por liquidez: coherente con
  inventario perecedero y moda rápida) ni el salto Media → Difícil (el prudente sigue en ~1 %).

**Opciones de respuesta: piloto en Ganadería (nov. 2026)** — aprobado por Juan ("hay opciones tan
inviables que da risa elegirlas y una evidentemente buena"). Medición inicial en los 220 casos (todos
con 4 opciones, 144 partidas con 4 perfiles): en el 55 % los 4 perfiles eligen la misma opción y el
56 % de las opciones no la elige nadie. Criterio: 3 opciones por caso, las tres defendibles por un
gerente real, cada una con su costo; se quitan relleno ("consultar al contador", "pedir evidencia"),
opciones casi idénticas y las de solo pérdida; se conservan las trampas tentadoras (venta informal,
desviar una línea de crédito). La ventana muestra 3 opciones en una fila. Ganadería (21 casos propios,
`node tests/estudio-opciones.mjs <html> src/content/sectores/ganadera.js ganadera`, 20 partidas por
perfil): favorita unánime 22 → 18 %, opciones que nadie elige 56 → 39 %. "Financiamiento para ampliar
el hato" regalaba liquidez (+$14 M de caja y capital de trabajo además de la deuda, aunque el dinero se
iba en las vacas); ahora la compra suma hato y EBITDA y la deuda pesa. Efecto: quiebra del perfil
agresivo en Ganadería 3 → 8 de 20 (en el reporte general, agresivo 21,4 → 25 %), porque el motor
trata toda la deuda como si fuera de corto plazo en la deriva de la razón corriente. Pendiente de
decisión de Juan.

**Dificultad por decisiones (nov. 2026, en curso)** — Juan: "que menos del 45 % de las partidas se ganen
en Normal, por las decisiones según el caso y no por la opción evidentemente mejor". Ganar = rango S o A.
Metas propuestas en Normal: jugador cuidadoso (metódico) 40–45 %, agresivo 15–20 %, azar < 10 %.
- Motor: deuda de largo plazo (`state.deudaLargoPlazo`, opción con `plazo:'largo'`, etiqueta 🏦 en la
  ventana). No baja de golpe la razón corriente y en la deriva del motor pesa solo su cuota cercana (25 %);
  se amortiza en proporción. 26 créditos de inversión etiquetados. Medido: casi no cambia la dificultad.
- `content/universal/contexto.js`: `CONTEXTO.liquidezBaja`, `apalancado`, `bancoAmigo`, `equipoCansado`,
  `proveedoresTensos`, `juntaDesconfia`, `reputacionAlta`, `equiposGastados` y `si(cond, a, b)`.
  Ganadería: sus 21 casos rinden distinto según la situación (efectos y consecuencia); los casos
  principales ahora son constructoras `(s,f)=>({...})`. Regla 2 se mantiene también en estados extremos.
- Línea base antes (10 partidas por sector y perfil, Normal): victoria metódico 75 %, prudente 70 %,
  agresivo 60 %, azar 25 %. Muy desparejo por sector: en TechNova, AgroVerde y Moda Urbana el cuidadoso
  gana casi siempre; en Vita Fit y Ganadería el prudente suele terminar en D (descuida el mantenimiento).
- Ganadería con contexto (20 por perfil): metódico 45 %, agresivo 70 %, azar 10 %. El agresivo sigue
  ganando porque el rango se calcula con valor = EBITDA×4 − deuda: crecer a cualquier costo siempre paga.
  Pendiente de decisión de Juan: valorar como EBITDA × múltiplo según WACC − deuda + ½ caja (−15 % si la
  razón corriente < 1); con los mismos finales: metódico 60 %, agresivo 47 %, azar 13 %.
