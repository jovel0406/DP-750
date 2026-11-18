# Databricks DP-750 Tactical Simulator

Aplicación web de estudio para el examen **Microsoft DP-750: Implementing Data Engineering Solutions Using Azure Databricks**. Interfaz tipo *Cloud Operations Console*, en español, sin dependencias ni paso de compilación.

> Proyecto de estudio independiente. No está afiliado a Microsoft ni a Databricks y no contiene preguntas reales del examen.

> **También en este repositorio:** [Redação Brasil — Academia & Simulador CELPE-Bras](redacao-brasil/README.md) (carpeta `redacao-brasil/`, build en `redacao-brasil/dist/`).

## Cómo usarla

- **Local:** abre `index.html` en el navegador (funciona con `file://`).
- **GitHub Pages:** *Settings → Pages → Build and deployment → Deploy from a branch →* rama `main`, carpeta `/ (root)`. La web queda en `https://jovel0406.github.io/DP-750/`.

El progreso se guarda en `localStorage` del navegador; desde el panel puedes exportarlo e importarlo como JSON.

## Qué incluye

| Sección | Contenido |
|---|---|
| Panel de control | Preparación estimada (0–1000), % de dominio en cada uno de los 4 dominios, historial de simulacros, siguiente acción recomendada |
| Ruta de aprendizaje | Las 12 habilidades oficiales, cada una con mini-lección, el texto literal de lo que evalúa el examen, enlaces a la documentación y entrenamiento propio |
| Preguntas de concepto | 124 preguntas directas que cubren todas las viñetas del temario, en sesiones de 10 |
| Modo Campaña | 12 escenarios arquitectónicos con restricciones de negocio |
| Code & Permission Audit | 9 bloques de SQL / PySpark / YAML / JSON con un defecto que localizar |
| Acciones de Ingeniero | 24 ejercicios sobre código real: 12 de hacer clic en la línea con el defecto y 12 de arrastrar palabras clave a sus huecos, con pistas progresivas, explicación, corrección y opción de ver la respuesta |
| Juego: Incident Run | Juego en pixel art con cuatro zonas (una por dominio). Cada incidente es una pregunta del banco; los jefes plantean escenarios y auditorías. Lo que aciertas o fallas cuenta para el dominio por área y la deuda técnica |
| Simulador de examen | 20 o 50 preguntas muestreadas según el peso de cada dominio, cronometrado, puntaje sobre 1000 (mínimo 700) y revisión completa |
| Deuda técnica | Lo fallado se re-encola hasta lograr 2 aciertos seguidos |
| Biblioteca | Temario literal, 14 tablas resumen, tabla de nombres que cambiaron, tácticas de examen, plan de 5 semanas y 100+ enlaces oficiales |

**Banco: 145 preguntas** — dominio 1: 25 · dominio 2: 28 · dominio 3: 48 · dominio 4: 44.

Cada respuesta (acertada o no) se explica en **4 capas**: fundamento técnico, autopsia de cada distractor, heurística de examen y código de referencia con resaltado sintáctico, más el enlace a la página de la documentación en que se basa.

### Gamificación

- **Presupuesto DBU:** cada error consume DBU; al agotarse hay un «incidente de facturación».
- **SLA de latencia:** los errores lo degradan; por debajo del 70 % se gana la mitad de XP.
- **Rango:** de *Becario de Pipelines* a *Principal Data Architect*; sube con XP y baja con errores.
- **Racha diaria** y opción «Respondo con dudas», que re-encola un acierto inseguro.

## Temario oficial

Tomado literalmente de la [guía de estudio oficial](https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-750): *Skills measured as of March 11, 2026* (página actualizada el 28 de octubre de 2026).

| Dominio | Peso |
|---|---|
| Set up and configure an Azure Databricks environment | 15–20 % |
| Secure and govern Unity Catalog objects | 15–20 % |
| Prepare and process data | 30–35 % |
| Deploy and maintain data pipelines and workloads | 30–35 % |

## Fuentes y límites de exactitud

- El contenido se redactó contrastándolo con la documentación de Azure Databricks en `learn.microsoft.com`, consultada en noviembre de 2026. Los ~100 enlaces de la app se comprobaron (HTTP 200) en esa fecha.
- **Lo que no se hizo:** el código de referencia no se ejecutó contra un workspace real. Trátalo como material de estudio, no como código listo para producción.
- La documentación ha renombrado varios productos respecto a la guía del examen (Databricks Asset Bundles → Declarative Automation Bundles, Delta Sharing → OpenSharing, Genie spaces → Genie Agents, Repos → Git folders). La app muestra ambos nombres.
- El puntaje del simulador es una estimación ponderada por dominio; Microsoft no publica su fórmula de escalado. Las preguntas son originales: sirven para aprender el temario, no reproducen el examen.
- Databricks cambia nombres y sintaxis con frecuencia: ante cualquier discrepancia, manda la documentación oficial.

## Arquitectura

```
index.html              Estructura: barra lateral, HUD y contenedor de vistas
css/styles.css          Tema oscuro, adaptable a móvil
js/data/domains.js      Temario literal, mini-lecciones, tablas resumen y fuentes
js/data/scenarios.js    Banco del Modo Campaña
js/data/audits.js       Banco de Code & Permission Audit
js/data/drills-*.js     Banco de preguntas de concepto (formato compacto)
js/engine.js            Estado, economía DBU/SLA, rangos, racha, deuda técnica, muestreo y puntuación
js/data/exercises.js    Ejercicios de Acciones de Ingeniero
js/actions.js           Interfaz de Acciones de Ingeniero (clic en línea, arrastrar y soltar)
js/game.js              Juego Incident Run (canvas, sprites definidos en código)
js/highlight.js         Resaltado sintáctico (SQL, Python, YAML, JSON, CLI, KQL)
js/app.js               Enrutado por hash, vistas y eventos
```

### Añadir preguntas

**Pregunta de concepto** — añade una entrada al final del bloque de su habilidad en `js/data/drills-*.js` (el identificador se deriva del orden, así que no insertes en medio):

```js
["3.2", "objetivo evaluado", "título", "pregunta",
 ["opción correcta", "por qué es correcta"],
 [["distractor", "por qué falla"], ["distractor", "por qué falla"], ["distractor", "por qué falla"]],
 "fundamento técnico", "heurística de examen",
 "sql", `código de referencia`, ["título del doc", "ruta/relativa/en/azure/databricks"]]
```

**Escenario o auditoría** — añade un objeto a `DP750.SCENARIOS` o `DP750.AUDITS` con `id`, `mode`, `domain`, `objective`, `title`, `context`, `constraints`/`audit` (opcionales), `question`, `options` (una con `ok: true`; todas con `why`), `foundation`, `heuristic`, `code` y `refs`, y registra su habilidad en `SKILL_OF` (`js/engine.js`).
