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
src/styles/*.css                     14 hojas, en el orden del original
src/{engine,systems,ui,minigames,audio,content}/*.js   65 fragmentos de un solo <script>
assets/                              13 imágenes; en el código aparecen como @asset(ruta)
build.mjs                            une todo en dist/simulador_financiero.html (sin dependencias)
dist/simulador_financiero.html       archivo que se entrega a Juan (se versiona)
tests/                               arnés + pruebas (npm test)
```

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
| ui/… | formato, feedback visual, iconos KPI, tensión, render de caso, bitácora, post-mortem, panel CRT, pantallas de inicio, cinemática, pantalla completa |
| minigames/… | auditoría, mercado volátil, bandeja, fuga de capital, oficina (+ ambiente) |
| content/universal/… | dilemas, elenco, cadenas profundas, carta meta, karma, cisne negro… |
| content/sectores/<sector>.js, sectores.js, perfiles.js | `*_CASES`, `*_RANDOM`, `SECTORS`, `PERFILES`, `PERKS` |

### Estado global
`state`, `flags`, `history`, `turnNumber`, `currentCase`, `randomBag`, `mainQueue`, `sectorActual`, `perfilActual`, `perkActual`, `dificultadSeleccionada`, `legadosEmpresariales`, `metaTrimestral`, `mandatoInicial`. Todo es global mutable: **es la principal deuda técnica**.

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
  `bueno` (prudente), `agresivo` (todo por EBITDA), `imperio` (EBITDA + caja), `azar`.
  Espera 1,3 s tras cada clic (más que "Calculando impacto"): volver a pulsar antes encola
  cierres de modal duplicados — error del arnés, no del juego.
- `equivalencia.test.mjs`: original vs dist/ con la misma semilla (vigente solo mientras
  original/ sea la referencia de comportamiento; retirarla cuando se cambie el juego a propósito).
- `contenido.test.mjs` (reglas 1–7) y `simulacion.test.mjs` (reglas 8–9, imprime el reporte).
- Las cifras de referencia de la regla 8 venían de un arnés anterior con otros perfiles.
  Línea base con este arnés (84 partidas/perfil, dificultad media, oct. 2026):
  bueno 0 % quiebra · agresivo 27 % · imperio 35 % (arquetipo Imperio en el perfil agresivo: 11 %) · azar 36 %.

---

## 4. Decisiones intencionales de Juan (NO "arreglar")

- Umbral del arquetipo **Equilibrista**: se mantiene.
- `sparklineSVG`: código muerto conservado a propósito.
- **Final oculto trágico**: es deliberado.
- Rango de moral: se dejó como está tras el ajuste de +16 %.
- Flechas de tendencia: subida azul claro `#7FADD9`, bajada siempre roja, 🔥 desde racha 3.
- Inversión se colorea ámbar `#D98847` (no como pérdida).
- Sparklines fueron retiradas por estética; el estado relacional se muestra con barras de progreso.
- Retratos: PNG transparente, grande, flujo de dos pantallas (`renderPersonajeIntro`), nombre debajo de la imagen, mini retrato en la pantalla de decisión. Se rechazó: retrato circular con fondo blanco e ilustración SVG en la portada.

---

## 5. Forma de trabajar con Juan

- **Explicar antes de cualquier cambio arquitectónico grande** y esperar su visto bueno.
- **Proponer opciones**, no asumir. Trabajar paso a paso.
- Cuando diga "no hagas nada aún", solo informar.
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

### Fase 2 — Calidad de contenido automatizada
- Validador de esquema para casos (campos obligatorios, rangos de efectos).
- Reporte automático de cobertura por indicador y sector (prioridad: razón corriente, capital de trabajo, valor de inventario y días de cartera, especialmente en Ganadería).
- Revisión gramatical del texto (ej.: "tenerte de aliada" → "tenerte como aliada").

### Fase 3 — Balance basado en datos
- Simulaciones masivas con perfiles de jugador; tablero de quiebra, arquetipos y metas cumplidas por sector y dificultad.
- Ajustes de balance solo con evidencia antes/después.

### Fase 4 — Producto
- Reducir estado global (objeto de partida único), guardado más robusto, posible despliegue web y modo docente (resultados exportables para clase).

---

## 7. Pendientes conocidos

Detectados por `npm test` al cerrar la Fase 1 (marcados `todo`: se listan, no fallan):
- **Regla 2:** 243 pares de opciones dominadas en el contenido heredado (ej.: "Ceder 20 % a un
  inversionista" domina al crédito bancario porque la dilución no se modela como indicador).
- **Regla 3:** 216 opciones sin ningún efecto negativo ni riesgo.
- **Regla 9:** en Ganadería, 3 casos aparecen 5–6 veces por partida (Construye Ya: 1 caso, 3–4).
  Causa: `historialTitulosRecientes` recuerda solo 4 títulos y `elegirDecisionExtra` recicla
  los pocos casos que tocan el indicador crítico.

- Cobertura baja de casos para razón corriente (~2 %) y algunos indicadores de Ganadería.
- Revisión gramatical general.
- La copia del HTML en el Proyecto de claude.ai puede estar desactualizada frente a la última versión entregada.
