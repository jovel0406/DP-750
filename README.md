# Databricks DP-750 Tactical Simulator

Aplicación web de estudio para el examen **Microsoft DP-750: Implementing Data Engineering Solutions Using Azure Databricks**. Interfaz tipo *Cloud Operations Console*, en español, sin dependencias ni paso de compilación.

> Proyecto de estudio independiente. No está afiliado a Microsoft ni a Databricks y no contiene preguntas reales del examen.

## Cómo usarla

- **Local:** abre `index.html` en el navegador (funciona con `file://`).
- **GitHub Pages:** *Settings → Pages → Deploy from a branch →* rama `main`, carpeta `/ (root)`.

El progreso se guarda en `localStorage` del navegador; desde el panel puedes exportarlo e importarlo como JSON.

## Qué incluye

| Sección | Contenido |
|---|---|
| Panel de control | Preparación estimada (0–1000), % de dominio en cada uno de los 4 dominios, historial de simulacros, siguiente acción recomendada |
| Modo Campaña | 12 escenarios arquitectónicos con restricciones de negocio (3 por dominio) |
| Code & Permission Audit | 9 bloques de SQL / PySpark / YAML / JSON con un defecto que localizar (`GRANT`, `EXPECT`, `cloudFiles`, bundles, `VACUUM`…) |
| Simulador de examen | Cronometrado, navegador de preguntas, marcado para revisión, puntaje sobre 1000 (mínimo 700) y revisión completa |
| Deuda técnica | Los conceptos fallados se re-encolan hasta lograr 2 aciertos seguidos |
| Biblioteca | Temario por dominio, 14 tablas resumen, tácticas de examen, plan de 5 semanas y fuentes oficiales |

Cada respuesta (acertada o no) se explica en **4 capas**: fundamento técnico, autopsia de cada distractor, heurística de examen y código de referencia con resaltado sintáctico.

### Gamificación

- **Presupuesto DBU:** cada error consume DBU según su costo en producción; al agotarse hay un «incidente de facturación».
- **SLA de latencia:** los errores lo degradan; por debajo del 70 % se gana la mitad de XP.
- **Rango:** de *Becario de Pipelines* a *Principal Data Architect*; sube con XP y baja con errores.
- **Racha diaria** y opción «Respondo con dudas», que re-encola un acierto inseguro.

## Dominios del examen

| Dominio | Peso |
|---|---|
| Set up and configure an Azure Databricks environment | 15–20 % |
| Secure and govern Unity Catalog objects | 15–20 % |
| Prepare and process data | 30–35 % |
| Deploy and maintain data pipelines and workloads | 30–35 % |

## Advertencias de exactitud

- Los nombres y pesos de los dominios se contrastaron con resultados de búsqueda de la [guía de estudio oficial](https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-750), pero la página no pudo abrirse directamente al generar la app. Las viñetas del temario están **parafraseadas**, y las fuentes consultadas discrepaban sobre la fecha de «skills measured» (marzo u octubre de 2026). **Verifica siempre la guía oficial.**
- El puntaje del simulador es una estimación ponderada por dominio; Microsoft no publica su fórmula de escalado.
- El contenido técnico y el código de referencia no se ejecutaron contra un workspace real y los enlaces a la documentación no se comprobaron. Databricks cambia nombres y sintaxis con frecuencia: ante cualquier discrepancia, manda la documentación oficial.

## Arquitectura

```
index.html            Estructura: barra lateral, HUD y contenedor de vistas
css/styles.css        Tema oscuro, adaptable a móvil
js/data/domains.js    Dominios, objetivos, tablas resumen y fuentes
js/data/scenarios.js  Banco del Modo Campaña
js/data/audits.js     Banco de Code & Permission Audit
js/engine.js          Estado, economía DBU/SLA, rangos, racha, deuda técnica, puntuación
js/highlight.js       Resaltado sintáctico (SQL, Python, YAML, JSON)
js/app.js             Enrutado por hash, vistas y eventos
```

### Añadir preguntas

Agrega un objeto a `DP750.SCENARIOS` o `DP750.AUDITS` con: `id`, `mode` (`campaign` | `audit`), `domain` (`d1`–`d4`), `objective`, `title`, `context`, `constraints` (opcional), `audit` (opcional, `{lang, text}`), `question`, `options` (exactamente una con `ok: true`; cada una con `why`, y las incorrectas con `dbu` y `sla`), `foundation`, `heuristic`, `code` (`{lang, text}`) y `refs`.
