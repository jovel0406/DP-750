/* Preguntas de concepto · Dominio 4, habilidades 4.3 y 4.4 (mismo formato que drills-d1.js). */
window.DP750 = window.DP750 || {};
DP750.DRILLS = (DP750.DRILLS || []).concat([

/* ───── 4.3 Development lifecycle ───── */
["4.3", "Buenas prácticas de control de versiones con Git", "Dónde trabaja cada uno",
 "Cinco ingenieros editan los mismos notebooks dentro de una única carpeta Git compartida del workspace y se pisan los cambios constantemente. ¿Qué práctica recomienda la documentación?",
 ["Que cada usuario trabaje en su propia carpeta Git, en su propia rama, y que las carpetas de producción las cree un administrador y las actualice la automatización.", "Es el reparto documentado: flujo de usuario bajo su carpeta personal y flujo de administración para las carpetas de producción."],
 [["Que todos trabajen directamente sobre la rama main en la carpeta compartida.", "Es el origen del problema: sin aislamiento ni revisión."],
  ["Desactivar Git y usar solo el historial de versiones del notebook.", "El historial del notebook no ofrece ramas, revisión ni CI/CD."],
  ["Copiar los notebooks a carpetas personales sin Git y fusionarlos a mano.", "Se pierde la trazabilidad y la fusión manual es propensa a errores."]],
 "Las **Git folders** (antes *Repos*) son un cliente Git visual integrado en el workspace: clonar, crear ramas, commit, push, pull, merge y resolver conflictos. Patrón recomendado: desarrollo aislado por usuario y rama; producción en carpetas de nivel superior gestionadas por un administrador y actualizadas por CI/CD.",
 "Un desarrollador = su carpeta Git + su rama. Producción = carpeta gestionada por automatización, nunca editada a mano.",
 "bash", `# Flujo de trabajo de un desarrollador
git checkout -b feature/calculo-margen
git add src/margen.py tests/test_margen.py
git commit -m "Añade cálculo de margen neto"
git push -u origin feature/calculo-margen
# ... y se abre un pull request hacia main`, ["CI/CD with Git folders", "repos/ci-cd"]],

["4.3", "Gestionar ramas, pull requests y resolución de conflictos", "El pull que no entra",
 "Al hacer pull en tu carpeta Git, aparece un conflicto de fusión en un notebook que tú y un compañero habéis modificado en las mismas líneas. ¿Cuál es la forma correcta de proceder?",
 ["Resolver el conflicto eligiendo o combinando los cambios de ambas versiones, y después confirmar (commit) la resolución.", "Git no puede decidir entre dos cambios sobre las mismas líneas; hay que resolverlo explícitamente, algo que la interfaz de Git folders permite."],
 [["Borrar la carpeta Git y volver a clonarla, descartando tu trabajo.", "Pierdes tus cambios sin necesidad."],
  ["Forzar el push de tu versión para sobrescribir la rama remota.", "Elimina el trabajo de tu compañero y reescribe la historia compartida."],
  ["Renombrar tu notebook para evitar el conflicto.", "Genera dos versiones divergentes de la misma lógica."]],
 "Un **conflicto de fusión** ocurre cuando dos ramas cambian las mismas líneas. Git folders ofrece una interfaz para resolverlos, además de operaciones de merge, rebase y reset. Buenas prácticas para reducirlos: ramas de vida corta, pulls frecuentes y pull requests pequeños.",
 "Conflicto → resolver y confirmar. Nunca force-push sobre una rama compartida.",
 "bash", `git pull origin main
# CONFLICT (content): Merge conflict in src/transformaciones.py

# Tras editar el archivo y dejar la versión correcta:
git add src/transformaciones.py
git commit -m "Resuelve conflicto en transformaciones"
git push`, ["Git operations", "repos/git-operations-with-repos"]],

["4.3", "Gestionar ramas y pull requests", "La puerta de entrada a main",
 "El equipo quiere que ningún cambio llegue a producción sin revisión de otra persona y sin pasar las pruebas automáticas. ¿Qué flujo implantas?",
 ["Ramas de feature, pull request hacia main con revisión obligatoria y pruebas automáticas (CI), y despliegue a producción solo tras el merge.", "El pull request es el punto donde se combinan la revisión de código y las validaciones automáticas antes de integrar."],
 [["Commits directos a main y revisión mensual del historial.", "Los errores llegan a producción antes de que nadie los revise."],
  ["Una rama por entorno que se edita a mano en cada workspace.", "Las ramas divergen y no hay un punto único de revisión."],
  ["Enviar los notebooks por correo para su aprobación.", "Sin trazabilidad ni automatización."]],
 "Flujo estándar de CI/CD: rama de feature → commits → **pull request** (revisión + pruebas unitarias y validación) → merge a main → el pipeline de CD despliega a los entornos. La protección de rama en el proveedor Git impone la revisión.",
 "«Revisión obligatoria» + «pruebas antes de integrar» → pull request con CI y rama main protegida.",
 "yaml", `# Pipeline de CI (esquema): se ejecuta en cada pull request
steps:
  - run: pip install -r requirements-dev.txt
  - run: pytest tests/unit
  - run: databricks bundle validate -t staging`, ["CI/CD with Git folders", "repos/ci-cd"]],

["4.3", "Estrategia de pruebas (unitarias)", "Probar una función, no un notebook entero",
 "Quieres pruebas unitarias con pytest para la lógica de transformación que hoy vive dentro de las celdas de un notebook. ¿Qué cambio de diseño lo hace posible?",
 ["Extraer la lógica a funciones en módulos Python separados que reciban y devuelvan DataFrames, y probarlas con pytest.", "La documentación sobre pruebas unitarias se centra en organizar el código en funciones que puedan llamarse y probarse de forma aislada."],
 [["Ejecutar el notebook completo contra producción y revisar el resultado a ojo.", "Eso no es una prueba unitaria ni es repetible."],
  ["Añadir `print()` a cada celda.", "No verifica nada de forma automática."],
  ["Mantener toda la lógica en una única celda para que sea más fácil de copiar.", "Empeora la capacidad de prueba."]],
 "Una **prueba unitaria** verifica una unidad aislada de código (una función) con entradas pequeñas y resultados esperados. Requiere funciones puras: datos de entrada como parámetros, sin leer ni escribir tablas dentro. Azure Databricks admite pytest para Python, testthat para R, ScalaTest para Scala y UDF de SQL.",
 "Código probable = funciones en módulos + pytest. Lógica incrustada en celdas = imposible de probar de forma aislada.",
 "python", `# src/transformaciones.py
from pyspark.sql import DataFrame, functions as F

def calcular_margen(df: DataFrame) -> DataFrame:
    return df.withColumn("margen", F.col("ingreso") - F.col("costo"))

# tests/test_transformaciones.py
def test_calcular_margen(spark):
    df = spark.createDataFrame([(100.0, 60.0)], ["ingreso", "costo"])
    assert calcular_margen(df).first()["margen"] == 40.0`, ["Unit testing for notebooks", "notebooks/testing"]],

["4.3", "Estrategia de pruebas (tipos)", "Qué prueba es cuál",
 "Antes de liberar un pipeline, usuarios de Finanzas revisan en un entorno de preproducción que los informes generados coinciden con lo que esperan del negocio. ¿Qué tipo de prueba es?",
 ["Prueba de aceptación de usuario (UAT).", "La realiza el negocio para confirmar que la solución cumple sus necesidades reales."],
 [["Prueba unitaria.", "Verifica una función aislada, la escribe el desarrollador y se ejecuta de forma automática."],
  ["Prueba de integración.", "Verifica que varios componentes funcionan juntos (por ejemplo, la transformación contra tablas reales de prueba)."],
  ["Prueba end-to-end.", "Ejecuta el flujo completo de principio a fin de forma técnica; no implica la validación del negocio."]],
 "Pirámide de pruebas: **unitarias** (muchas, rápidas, una función), **integración** (componentes juntos, con un workspace y datos de prueba), **end-to-end** (el pipeline completo de origen a destino) y **UAT** (el usuario de negocio da el visto bueno).",
 "¿Quién valida? El desarrollador con código → unitaria/integración/E2E. El usuario de negocio → UAT.",
 "yaml", `# Etapas habituales de un pipeline de CI/CD
stages:
  - unit:        pytest tests/unit                               # en cada pull request
  - integration: databricks bundle run -t staging tests_integracion
  - e2e:         databricks bundle run -t staging pipeline_completo
  - uat:         aprobación manual del negocio en staging
  - deploy:      databricks bundle deploy -t prod`, ["Unit testing for notebooks", "notebooks/testing"]],

["4.3", "Configurar y empaquetar Databricks Asset Bundles", "El archivo que no puede faltar",
 "¿Qué archivo es imprescindible en la raíz de un proyecto de bundle y qué contiene como mínimo?",
 ["Un único `databricks.yml` con el nombre del bundle y, normalmente, al menos un target de despliegue.", "La documentación indica que un bundle debe contener uno y solo un `databricks.yml` en la raíz, y que el nombre del bundle es el mapeo obligatorio de nivel superior."],
 [["Un `bundle.json` por cada workspace.", "No es el formato ni el nombre; la configuración es YAML y los entornos son targets del mismo archivo."],
  ["Varios `databricks.yml`, uno por carpeta.", "Solo puede haber uno; lo que sí puede hacer es incluir otros archivos de configuración."],
  ["Un `requirements.txt`.", "Declara dependencias de Python; no define el bundle."]],
 "`databricks.yml` define el bundle: `bundle` (nombre), `include` (otros YAML, por ejemplo `resources/*.yml`), `variables`, `resources` (jobs, pipelines…), `targets` (entornos) y más. La documentación actual llama a esta herramienta **Declarative Automation Bundles** (antes Databricks Asset Bundles).",
 "Bundle = un `databricks.yml` en la raíz + recursos + targets.",
 "yaml", `bundle:
  name: ventas_etl

include:
  - resources/*.yml

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-1111111111111111.1.azuredatabricks.net`, ["Bundle configuration", "dev-tools/bundles/settings"]],

["4.3", "Desplegar un bundle con la CLI", "Validar no es desplegar",
 "En el pipeline de CI quieres comprobar que la configuración del bundle es correcta sin crear ni modificar nada en el workspace. ¿Qué comando ejecutas?",
 ["`databricks bundle validate`.", "Verifica que las definiciones de los archivos de configuración son válidas, sin desplegar."],
 [["`databricks bundle deploy`.", "Despliega: crea o actualiza recursos en el workspace de destino."],
  ["`databricks bundle run`.", "Ejecuta un job o pipeline ya desplegado."],
  ["`databricks bundle destroy`.", "Elimina los recursos que el bundle desplegó."]],
 "Ciclo con la CLI: `bundle init` (plantilla) → `bundle validate` → `bundle deploy -t <target>` → `bundle run -t <target> <recurso>` → `bundle destroy`. El target de destino se toma de `-t` o del target marcado como `default`.",
 "validate = comprobar · deploy = publicar · run = ejecutar · destroy = eliminar.",
 "bash", `databricks bundle validate -t prod
databricks bundle deploy   -t prod
databricks bundle run      -t prod carga_diaria`, ["Develop bundles (CLI workflow)", "dev-tools/bundles/work-tasks"]],

["4.3", "Configurar bundles (variables y sustituciones)", "Un catálogo por entorno",
 "El mismo bundle debe escribir en el catálogo `dev` al desplegar en desarrollo y en `prod` al desplegar en producción, sin duplicar la definición de los jobs. ¿Cómo lo resuelves?",
 ["Con una variable del bundle (por ejemplo `catalogo`) referenciada como `${var.catalogo}` y con un valor distinto en cada target.", "Las variables personalizadas y las sustituciones permiten parametrizar la configuración por target."],
 [["Con dos copias del YAML del job, una por entorno.", "Duplica la definición: justo lo que los bundles evitan."],
  ["Escribiendo `prod` fijo y editándolo a mano antes de cada despliegue a dev.", "Propenso a errores y no reproducible."],
  ["No es posible: un bundle solo admite un entorno.", "Los targets existen precisamente para definir varios entornos."]],
 "Sustituciones integradas: `${bundle.name}`, `${bundle.target}`, `${workspace.host}`, `${workspace.current_user.userName}`, `${resources.<tipo>.<nombre>.<campo>}`. Variables propias: se declaran en `variables` y se usan como `${var.<nombre>}`; cada target puede sobrescribir su valor.",
 "Diferencias entre entornos → variables + valores por target. Nunca copiar y pegar recursos.",
 "yaml", `variables:
  catalogo:
    description: Catálogo de destino
    default: dev

targets:
  dev:
    default: true
  prod:
    variables:
      catalogo: prod

resources:
  jobs:
    carga_diaria:
      name: carga_diaria_\${bundle.target}
      parameters:
        - name: catalogo
          default: \${var.catalogo}`, ["Substitutions and variables", "dev-tools/bundles/variables"]],

["4.3", "Configurar y empaquetar bundles (recursos existentes)", "El job que ya existía",
 "Un job creado a mano en la interfaz debe pasar a gestionarse con un bundle sin recrearlo. ¿Qué flujo ofrece la CLI?",
 ["`bundle generate` para generar la configuración a partir del recurso existente y `bundle deployment bind` para vincularla a ese recurso.", "Es el flujo documentado para traer recursos existentes a un bundle y mantenerlos sincronizados."],
 [["Borrar el job y escribir su YAML desde cero de memoria.", "Se pierde el historial de ejecuciones y es fácil omitir configuración."],
  ["`bundle validate`, que importa automáticamente los jobs del workspace.", "validate solo comprueba la configuración local."],
  ["Exportar el job a CSV e incluir el CSV en el bundle.", "No es un formato de configuración de bundles."]],
 "`databricks bundle generate` crea la configuración de un recurso que ya existe (job, pipeline…) y descarga sus archivos. `databricks bundle deployment bind` enlaza el recurso definido en el bundle con el del workspace, de modo que los despliegues posteriores lo actualizan en lugar de crear otro.",
 "Recurso creado a mano → generate + bind. No lo recrees.",
 "bash", `databricks bundle generate job --existing-job-id 987654321
databricks bundle deployment bind carga_diaria 987654321
databricks bundle deploy -t prod`, ["Develop bundles (CLI workflow)", "dev-tools/bundles/work-tasks"]],

/* ───── 4.4 Monitor, troubleshoot, optimize ───── */
["4.4", "Investigar skew con Spark UI", "La señal del skew",
 "En la página de un stage en Spark UI, ¿qué comparación de las Summary Metrics indica, según la documentación, que el stage podría tener skew?",
 ["Que la duración máxima de tarea supere en un 50 % o más a la del percentil 75.", "Es el criterio documentado: comparar Max con el percentil 75 de duración."],
 [["Que el número de tareas sea superior a 200.", "El número de tareas no indica por sí mismo un desequilibrio."],
  ["Que todas las tareas duren exactamente lo mismo.", "Eso describe un stage sano."],
  ["Que el stage no tenga Shuffle Read.", "La ausencia de shuffle no indica skew."]],
 "**Skew**: una o pocas tareas tardan mucho más que el resto mientras los demás núcleos esperan. Soluciones documentadas: comprobar si AQE lo gestiona (solo en sort-merge y shuffle-hash joins, y solo por encima de sus umbrales), ajustar esos umbrales, aplicar salting o pre-agregar, y usar liquid clustering si el sesgo viene del diseño físico de la tabla.",
 "Skew = Max muy por encima del percentil 75. Los broadcast joins nunca se optimizan por skew.",
 "python", `# Umbrales de AQE para considerar sesgada una partición
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256MB")`, ["Skew and spill (Spark UI)", "optimizations/spark-ui-guide/long-spark-stage-page"]],

["4.4", "Investigar spill con Spark UI", "Datos que no caben en memoria",
 "Un stage muestra un gran volumen de spill a disco durante un shuffle. No hay skew apreciable. ¿Qué acción es la primera que sugiere la documentación?",
 ["Usar el shuffle auto-optimizado: `spark.sql.shuffle.partitions = auto`.", "Deja que Spark elija el número de particiones de shuffle según el plan y el tamaño de los datos."],
 [["Ejecutar VACUUM sobre las tablas de origen.", "VACUUM elimina archivos antiguos; no afecta a la memoria de ejecución."],
  ["Hacer `collect()` del DataFrame para procesarlo en el driver.", "Trasladaría el problema al driver, con riesgo de dejarlo sin memoria."],
  ["Desactivar AQE.", "AQE ayuda a dimensionar particiones; desactivarlo empeora la situación."]],
 "**Spill**: Spark se queda sin memoria de ejecución (la usada para shuffles, joins, ordenaciones y agregaciones) y escribe datos a disco. Otras acciones documentadas: reducir filas, columnas o el tamaño de columnas grandes; usar instancias con más memoria (menos workers, más grandes); y limitar el tamaño del micro-lote en streaming.",
 "Spill → más particiones (auto), menos datos en memoria o más memoria por executor.",
 "python", `spark.conf.set("spark.sql.shuffle.partitions", "auto")

# Reducir lo que viaja por el shuffle: seleccionar y filtrar antes del join
ventas = (spark.table("prod.silver.ventas")
            .where("fecha >= '2026-01-01'")
            .select("ticket_id", "tienda_id", "importe"))`, ["Skew and spill (Spark UI)", "optimizations/spark-ui-guide/long-spark-stage-page"]],

["4.4", "Investigar con query profile", "La consulta lenta del warehouse",
 "Una consulta de un dashboard tarda dos minutos en un SQL warehouse. ¿Qué herramienta usas para ver qué operador consume el tiempo y cuántas filas procesa cada uno?",
 ["El query profile, accesible desde el historial de consultas.", "Visualiza los operadores de la ejecución con métricas como tiempo empleado, filas procesadas y consumo de memoria."],
 [["`DESCRIBE HISTORY` de la tabla.", "Muestra las versiones de la tabla, no la ejecución de una consulta."],
  ["La pestaña Libraries del clúster.", "Gestiona librerías."],
  ["El linaje en Catalog Explorer.", "Muestra dependencias entre objetos, no métricas de ejecución."]],
 "El **query profile** ayuda a localizar cuellos de botella: escaneos completos por falta de filtros, joins que multiplican filas, operadores con gran consumo de memoria. Para verlo hay que ser propietario de la consulta o tener al menos CAN MONITOR sobre el warehouse. Para cargas Spark en clústeres, el equivalente es Spark UI (DAG, stages, tareas).",
 "SQL warehouse → query profile. Clúster Spark → Spark UI.",
 "sql", `-- Complemento: plan de la consulta
EXPLAIN FORMATTED
SELECT c.region, SUM(p.importe)
FROM prod.silver.pedidos p JOIN prod.silver.clientes c USING (cliente_id)
GROUP BY c.region;`, ["Query profile", "sql/user/queries/query-profile"]],

["4.4", "Ajuste de rendimiento con AQE", "Lo que AQE hace solo",
 "¿Cuál de estas afirmaciones sobre Adaptive Query Execution (AQE) es correcta?",
 ["Está activado por defecto y puede, en tiempo de ejecución, convertir un sort-merge join en broadcast hash join, fusionar particiones pequeñas y tratar el skew en joins.", "Son las optimizaciones documentadas; no requiere cambios en las consultas."],
 [["Hay que activarlo manualmente en cada consulta con un hint.", "Está activado por defecto."],
  ["Solo actúa antes de ejecutar la consulta, a partir de estimaciones.", "Al contrario: reoptimiza durante la ejecución con estadísticas reales de cada etapa."],
  ["Sustituye la necesidad de filtrar o seleccionar columnas.", "Optimiza el plan, pero no elimina trabajo innecesario que la consulta pide."]],
 "Antes de ejecutar, el optimizador elige un plan con **estimaciones** que pueden ser erróneas (estadísticas ausentes u obsoletas, datos sesgados). **AQE** aprovecha las estadísticas exactas disponibles al final de cada shuffle o broadcast para elegir una estrategia física mejor.",
 "AQE = reoptimización en tiempo de ejecución, activa por defecto. Ajusta sus parámetros solo si los valores por defecto no encajan.",
 "sql", `SET spark.sql.adaptive.enabled;                      -- true por defecto
SET spark.sql.adaptive.coalescePartitions.enabled;
SET spark.sql.adaptive.skewJoin.enabled;`, ["Adaptive query execution", "optimizations/aqe"]],

["4.4", "Optimizar tablas Delta (OPTIMIZE)", "Miles de archivos diminutos",
 "Una tabla alimentada por micro-lotes frecuentes acumula decenas de miles de archivos pequeños y las lecturas se han vuelto lentas. La tabla es managed en Unity Catalog. ¿Qué haces?",
 ["Ejecutar `OPTIMIZE` para compactarlos y comprobar que predictive optimization está activo para que el mantenimiento sea automático.", "OPTIMIZE compacta archivos pequeños, y predictive optimization ejecuta OPTIMIZE, VACUUM y ANALYZE automáticamente en tablas managed."],
 [["Ejecutar solo `VACUUM`.", "VACUUM elimina archivos ya no referenciados; no compacta los vigentes."],
  ["Particionar la tabla por una columna de alta cardinalidad.", "Genera aún más archivos pequeños."],
  ["Aumentar el número de workers.", "Paliaría el síntoma sin corregir la fragmentación."]],
 "El **problema de los archivos pequeños**: abrir y leer muchos archivos diminutos cuesta más que leer pocos de tamaño adecuado. `OPTIMIZE` los reescribe en archivos más grandes (y aplica el clustering). **Predictive optimization** está activado por defecto y se recomienda para todas las tablas managed.",
 "Muchos archivos pequeños → OPTIMIZE. En tablas managed → dejar actuar a predictive optimization.",
 "sql", `OPTIMIZE prod.bronze.telemetria;

-- Compactar solo los datos recientes
OPTIMIZE prod.bronze.telemetria WHERE fecha >= current_date() - INTERVAL 7 DAYS;

DESCRIBE DETAIL prod.bronze.telemetria;   -- numFiles, sizeInBytes`, ["Predictive optimization", "optimizations/predictive-optimization"]],

["4.4", "Optimizar tablas Delta (VACUUM)", "Ver antes de borrar",
 "Antes de ejecutar VACUUM por primera vez sobre una tabla crítica, quieres saber qué archivos se eliminarían, sin borrar nada. ¿Qué ejecutas?",
 ["`VACUUM tabla DRY RUN`.", "Muestra la lista de archivos que se eliminarían sin eliminarlos."],
 [["`VACUUM tabla LITE`.", "Es un modo de ejecución alternativo que sí elimina archivos, usando el log de transacciones para identificarlos."],
  ["`OPTIMIZE tabla`.", "Compacta archivos; no informa de lo que VACUUM borraría."],
  ["`DESCRIBE HISTORY tabla`.", "Lista versiones y operaciones, no los archivos candidatos a eliminación."]],
 "**VACUUM** elimina los archivos que la tabla ya no referencia y que superan el umbral de retención (7 días por defecto). Tras ejecutarlo se pierde la posibilidad de consultar versiones anteriores a ese umbral. Modos: **FULL** (por defecto, lista el directorio) y **LITE** (se basa en el log de transacciones; no borra archivos ajenos al log, como los de transacciones abortadas).",
 "Previsualizar → DRY RUN. Tablas grandes con VACUUM frecuente → LITE.",
 "sql", `VACUUM prod.gold.saldos DRY RUN;
VACUUM prod.gold.saldos;
VACUUM prod.gold.saldos LITE;`, ["VACUUM", "tables/operations/vacuum"]],

["4.4", "Monitorizar el consumo de cómputo", "¿En qué se van los DBU?",
 "Finanzas pide un desglose mensual del consumo de DBU por equipo. Los recursos están etiquetados con el tag `equipo`. ¿Qué fuente consultas?",
 ["La system table `system.billing.usage`, agrupando por el tag personalizado.", "Contiene el consumo facturable con SKU, cantidad, metadatos de uso y tags personalizados."],
 [["El Spark UI de cada clúster.", "Muestra la ejecución de trabajos Spark, no la facturación."],
  ["`DESCRIBE HISTORY` de cada tabla.", "No contiene información de costos."],
  ["La pestaña de métricas de un clúster.", "Muestra CPU y memoria de ese cómputo, no el consumo agregado por equipo."]],
 "`system.billing.usage` registra `sku_name`, `usage_quantity`, `usage_metadata` (job, clúster, warehouse…) y `custom_tags`. Combinada con las tablas de precios y de jobs permite atribuir costos. Las **etiquetas** en cómputo y jobs son la base de esa atribución.",
 "Costo y atribución → system.billing.usage + tags. Rendimiento de un clúster → métricas de cómputo.",
 "sql", `SELECT custom_tags['equipo'] AS equipo,
       sku_name,
       SUM(usage_quantity) AS dbus
FROM system.billing.usage
WHERE usage_date >= date_trunc('MONTH', current_date())
GROUP BY ALL
ORDER BY dbus DESC;`, ["Billable usage system table", "admin/system-tables/billing"]],

["4.4", "Monitorizar el consumo de cómputo", "¿Está sobredimensionado el clúster?",
 "Sospechas que un clúster de jobs tiene demasiados workers. ¿Dónde compruebas el uso real de CPU y memoria durante las ejecuciones?",
 ["En la UI de métricas de cómputo del clúster.", "Ofrece métricas de hardware y de Spark casi en tiempo real para cómputo all-purpose y de jobs."],
 [["En `system.access.audit`.", "Registra eventos de auditoría, no el uso de CPU."],
  ["En Catalog Explorer, pestaña Lineage.", "Muestra dependencias de datos."],
  ["En el event log de un pipeline.", "Contiene eventos de ese pipeline, no métricas del clúster de jobs."]],
 "Las **métricas de cómputo** están disponibles con un retraso habitual inferior a un minuto. Uso de CPU sostenidamente bajo indica sobredimensionamiento; memoria al límite con spill indica lo contrario. El cómputo serverless usa *query insights* en lugar de esta UI.",
 "Dimensionar un clúster → métricas de cómputo (CPU, memoria) + Spark UI.",
 "sql", `-- Histórico de utilización desde system tables
SELECT cluster_id,
       AVG(cpu_user_percent + cpu_system_percent) AS cpu_media,
       MAX(mem_used_percent)                      AS mem_max
FROM system.compute.node_timeline
WHERE start_time >= current_date() - INTERVAL 7 DAYS
GROUP BY cluster_id;`, ["Compute metrics", "compute/cluster-metrics"]],

["4.4", "Implementar log streaming con Log Analytics", "Los logs a Azure Monitor",
 "Operaciones quiere analizar en Log Analytics los logs de diagnóstico de Azure Databricks (jobs, clústeres, Unity Catalog) junto con los del resto de la plataforma. ¿Qué configuras?",
 ["Un diagnostic setting en el recurso de Azure Databricks con destino «Send to Log Analytics».", "La entrega de logs de diagnóstico se configura en Azure y admite Log Analytics, Event Hubs y cuenta de almacenamiento."],
 [["Un `OPTIMIZE` programado sobre las tablas de logs.", "No guarda relación con la entrega de logs."],
  ["Un secret scope respaldado por Key Vault.", "Gestiona secretos, no logs."],
  ["Un share de Delta Sharing hacia Azure Monitor.", "Azure Monitor no es un recipient de Delta Sharing."]],
 "Destinos de un **diagnostic setting**: archivar en una cuenta de almacenamiento, transmitir a un event hub o enviar a un workspace de Log Analytics. Requiere el plan Premium. Una vez en Log Analytics, los logs se consultan con KQL.",
 "«Log streaming», «Log Analytics», «Azure Monitor» → diagnostic settings.",
 "kql", `DatabricksJobs
| where TimeGenerated > ago(24h)
| where ActionName == "runFailed"
| project TimeGenerated, Identity, RequestParams
| order by TimeGenerated desc`, ["Configure diagnostic log delivery", "admin/account-settings/audit-log-delivery"]],

["4.4", "Configurar alertas con Azure Monitor", "Avisar cuando fallen los jobs",
 "Los logs de Azure Databricks ya llegan a Log Analytics. Quieres que Azure avise al equipo de guardia cuando se registren fallos de ejecución de jobs. ¿Qué creas?",
 ["Una regla de alerta de Azure Monitor basada en una consulta de logs, asociada a un grupo de acciones (action group).", "La regla evalúa la consulta periódicamente y el grupo de acciones define a quién y cómo se notifica."],
 [["Un row filter sobre la tabla de logs.", "Es un control de acceso de Unity Catalog."],
  ["Una expectativa `EXPECT` en el pipeline.", "Valida la calidad de los datos del pipeline, no los logs de Azure."],
  ["Un trigger file arrival en el job.", "Inicia ejecuciones; no envía alertas."]],
 "En Azure Monitor, una **regla de alerta de búsqueda de logs** ejecuta una consulta KQL con una frecuencia y un umbral; cuando se cumple la condición, dispara un **action group** (correo, SMS, webhook, ITSM…). Complementa a las notificaciones nativas de los jobs cuando la supervisión se centraliza en Azure.",
 "Alertas desde Azure → regla de alerta sobre logs + action group. Alertas desde el propio job → notificaciones de Lakeflow Jobs.",
 "bash", `az monitor scheduled-query create \\
  --name "dbx-jobs-fallidos" \\
  --resource-group rg-datos \\
  --scopes "<id-del-workspace-de-log-analytics>" \\
  --condition "count 'Fallos' > 0" \\
  --condition-query Fallos="DatabricksJobs | where ActionName == 'runFailed'" \\
  --evaluation-frequency 5m --window-size 5m \\
  --action-groups "<id-del-action-group>"`, ["Configure diagnostic log delivery", "admin/account-settings/audit-log-delivery"]],

["4.4", "Resolver problemas de caching", "El DataFrame que se recalcula",
 "Un notebook construye un DataFrame costoso (varios joins) y lo usa en cuatro acciones distintas. Cada acción tarda lo mismo que la primera. ¿Qué ocurre y cómo se corrige?",
 ["Spark recalcula todo el linaje en cada acción; se cachea el DataFrame (`cache()`/`persist()`) antes de reutilizarlo y se libera al terminar (`unpersist()`).", "Las transformaciones son perezosas: sin caché, cada acción vuelve a ejecutar el plan completo."],
 [["El clúster es demasiado pequeño; hay que duplicar los workers.", "Aceleraría cada recálculo, pero seguiría repitiéndose cuatro veces."],
  ["Hay que ejecutar `VACUUM` entre acción y acción.", "No guarda relación con el recálculo."],
  ["Hay que hacer `collect()` y trabajar con listas de Python.", "Traslada los datos al driver, con riesgo de agotar su memoria."]],
 "La **evaluación perezosa** hace que un DataFrame sea una receta, no un resultado. `cache()` lo materializa en la primera acción. Usarlo con criterio: cachear lo que no se reutiliza desperdicia memoria y puede provocar spill; por eso se libera con `unpersist()`. Alternativa robusta: escribir el resultado intermedio en una tabla.",
 "Mismo DataFrame en varias acciones → cache + unpersist. Uso único → no cachear.",
 "python", `base = (pedidos.join(clientes, "cliente_id")
               .join(productos, "producto_id")
               .where("fecha >= '2026-01-01'")
               .cache())

base.count()                                   # materializa la caché
base.groupBy("region").sum("importe").show()
base.groupBy("categoria").count().show()

base.unpersist()`, ["Spark UI guide", "optimizations/spark-ui-guide/"]],

["4.4", "Diagnosticar y reparar jobs de Lakeflow", "Reparar sin duplicar",
 "Una tarea que hace `INSERT INTO` (append) falló a mitad, después de escribir parte de los datos. Vas a usar Repair run. ¿Qué debes tener en cuenta?",
 ["Repair re-ejecuta la tarea desde el principio y no la hace idempotente: si ya escribió parte de su salida, puede duplicar datos.", "La documentación lo advierte: que una reparación sea segura depende de la lógica de la propia tarea."],
 [["Repair retoma la tarea exactamente en la fila donde falló.", "No: cada tarea fallida se vuelve a ejecutar completa."],
  ["Repair revierte automáticamente los datos parciales antes de reintentar.", "Lakeflow Jobs no deshace escrituras de la tarea."],
  ["Repair vuelve a ejecutar también las tareas que terminaron bien.", "Solo las fallidas u omitidas y sus dependientes."]],
 "**Repair run** ejecuta el subconjunto de tareas no exitosas y sus dependientes, con la configuración **actual** del job (se puede corregir un parámetro o una ruta antes de reparar). Para que sea seguro, las tareas deben ser idempotentes: MERGE por clave, `REPLACE WHERE`, o escrituras atómicas.",
 "Diseña tareas idempotentes (MERGE / REPLACE WHERE): así reintentos y repair nunca duplican.",
 "sql", `-- No idempotente: un reintento duplica
-- INSERT INTO prod.silver.ventas SELECT * FROM prod.bronze.ventas_dia;

-- Idempotente: un reintento produce el mismo resultado
INSERT INTO prod.silver.ventas
REPLACE WHERE fecha = '2026-11-14'
SELECT * FROM prod.bronze.ventas_dia WHERE fecha = '2026-11-14';`, ["Troubleshoot and repair job failures", "jobs/repair-job-failures"]]
]);
