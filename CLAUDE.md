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

## 2. Estado actual (punto de partida de la migración)

Un único archivo: `simulador_financiero.html` (~9.400 líneas, ~1,68 MB).

| Líneas aprox. | Contenido |
|---|---|
| 9 | Chart.js 4.4.0 por CDN (jsdelivr) |
| 10–1115 | CSS (`<style>`) |
| 1116–1222 | HTML (pantallas, modales) |
| 1223–9404 | JS (`<script>`), ~256 funciones de nivel superior |
| 2280–2291 | **Imágenes base64** (`COMITE_IMG_BASE64` + 11 `RETRATO_*`) — la mayor parte del peso |

### Mapa del JS (orden aproximado en el archivo)

| Zona | Constantes / funciones clave |
|---|---|
| Audio | `audioCtx`, drones, `SONIDO_OFICINA_POR_TIPO`, ambiente de menú |
| Dificultad e impacto | `DIFICULTADES`, `DIFICULTAD_MODIFICADORES`, `KPI_CAMPOS_MULTIPLICATIVOS/ADITIVOS`, `IMPACTO_MULTIPLICADORES`, `CAMPOS_INVERTIDOS`, `amplificarEImpredecir` |
| Ecos narrativos | `ECOS_DECISION_DURA`, `ECOS_DECISION_GENEROSA` |
| Motor operativo | `aplicarMotorOperativo` (asimétrico, tope `MOTOR_OPERATIVO_TOPE = 1.2`, se aplica **una vez por turno real** en `nextTurn`), `ajustarDeltaSiCritico` |
| Imágenes | `COMITE_IMG_BASE64`, `RETRATO_*` |
| Metas y mandatos | `metaTrimestral`, `MANDATOS_INICIALES`, `META_ETIQUETAS`, `META_DELTAS`, `META_INVERTIDOS`, `META_RANGOS` |
| Logros y carrera | `LOGROS_DEFINIDOS`, contadores (`contadorDecisionesExtra`, `deudaMaximaAlcanzada`, `rachaMetasCumplidas`…), `detectarArquetipo` |
| Feedback visual | `TODOS_LOS_KPIS_VISUALES`, `kpiHistorial`, `rachaIndicador`, `flashKpiCards`, `mostrarNumeroFlotante`, `tendenciaHTML` |
| Priorización | `indicadoresEnAlerta`, `indicadorPrioritario`, `elegirDeBagPriorizado`, `buscarCasoParaIndicador`, `elegirDecisionExtra`, `historialTitulosRecientes` (anti-repetición) |
| Glosario | `GLOSARIO_FINANCIERO` (32 términos), `resaltarGlosario` |
| Indicadores | `KPI_DEFS`, `KPI_LABEL`, `KPI_INFO`, `KPI_ICON_*`, `EXPLAIN`, `CONSEJOS_KPI` |
| Contenido universal | `ETHICAL_DILEMMA_POOL`, `DILEMA_RESTRICCIONES`, `INBOX_EVENTS_POOL`, `OFICINA_EVENTS_POOL`, `BLACK_SWAN_POOL` |
| Minijuegos | Fuga de capital (`FUGA_CAPITAL_*`), Oficina (`OFICINA_CONTEXTOS`, `OFICINA_RENDER_POR_TIPO`) |
| Narrativa larga | `CARTA_META_COMITE`, `CADENAS_PROFUNDAS` (4 cadenas: Renata, Revisión Fiscal, Sello, Reestructuración), `ELENCO_INDICADORES`, `KARMA_CASES` |
| Sectores | `*_CASES` y `*_RANDOM` por sector, `PERFILES`, `PERKS`, `SECTORS` (incluye `calendario` y `karmaExtra`) |
| Cierre | `checkForcedEnding` → `checkForcedEndingInterno`, final oculto y final oculto trágico, `GUION_INFORME_FINAL` |
| UI de bitácora | `renderLog`, `renderPantallaBitacora`, `toggleLog`, `chipsDeEfectos` |

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

### Arnés de pruebas (cómo se ha probado hasta ahora)
- Node + `vm` con DOM falso: registro `FakeEl`, `FakeCanvas`, `FakeChart`, `fakeSetTimeout` que omite esperas ≥1000 ms, `requestAnimationFrame`, `createElement`, `style`.
- Lecciones aprendidas (errores del arnés, no del juego):
  - IDs efímeros: al reemplazar `turnModalContent.innerHTML`, borrar del registro los botones viejos (si no, se acumulan listeners).
  - Condición correcta para avanzar: `if (decisionExtraAntes || !flags.decisionExtraUsadaEsteTurno) nextTurn()`.
  - `pendingEndingResult` contiene tanto victorias como derrotas.

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

### Fase 1 — Modularizar sin cambiar el comportamiento (la primera tarea)

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

- Cobertura baja de casos para razón corriente (~2 %) y algunos indicadores de Ganadería.
- Revisión gramatical general.
- La copia del HTML en el Proyecto de claude.ai puede estar desactualizada frente a la última versión entregada.
