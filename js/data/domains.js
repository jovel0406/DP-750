/* Dominios y habilidades oficiales del DP-750, mini-lecciones, fuentes y tablas resumen.
   Temario: texto literal de la guía de estudio oficial de Microsoft Learn
   («Skills measured as of March 11, 2026», página actualizada el 28-oct-2026).
   Mini-lecciones y tablas: redactadas a partir de la documentación de Azure Databricks en
   learn.microsoft.com consultada en noviembre de 2026. */
window.DP750 = window.DP750 || {};
DP750.DOC = "https://learn.microsoft.com/azure/databricks/";
DP750.GUIDE = { asOf: "March 11, 2026", updated: "28-oct-2026", url: "https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-750" };

DP750.DOMAINS = [
  {
    id: "d1", short: "Entorno", color: "#38bdf8",
    name: "Configurar un entorno de Azure Databricks",
    en: "Set up and configure an Azure Databricks environment",
    min: 15, max: 20,
    groups: [
      { id: "1.1", title: "Select and configure compute in a workspace", es: "Seleccionar y configurar cómputo",
        items: [
          "Choose an appropriate compute type, including job compute, serverless, warehouse, classic compute, and shared compute",
          "Configure compute performance settings, including CPU, node count, autoscaling, termination, node type, cluster size, and pooling",
          "Configure compute feature settings, including Photon acceleration, Azure Databricks runtime/Spark version, and machine learning",
          "Install libraries for a compute resource",
          "Configure access permissions to a compute resource"
        ],
        brief: [
          "**Job compute** para cargas automatizadas; **all-purpose (clásico)** para desarrollo interactivo; **SQL warehouse** para SQL/BI; **serverless** cuando quieres arranque rápido sin gestionar infraestructura.",
          "Modos de acceso: **Standard** (antes Shared) permite que varios usuarios compartan el cómputo con aislamiento y es el recomendado para la mayoría de cargas; **Dedicated** (antes Single user) se asigna a un usuario o a un grupo.",
          "Costo: **autoscaling** + **auto-terminación**. Los **pools** mantienen instancias inactivas listas para acelerar arranque y escalado: no generan DBU mientras están inactivas, pero Azure sí cobra las VMs.",
          "**Photon** es el motor vectorizado (C++) que acelera SQL y DataFrame API; es el motor por defecto de los SQL warehouses.",
          "Librerías: **de cómputo** (todas las sesiones del clúster) o **de notebook** con `%pip` (solo ese notebook, no persisten entre sesiones).",
          "Permisos de cómputo: **CAN ATTACH TO** < **CAN RESTART** < **CAN MANAGE**. Las **políticas de cómputo** imponen límites (p. ej. auto-terminación obligatoria)."
        ],
        docs: [["Compute", "compute/"], ["Standard compute", "compute/standard-overview"], ["Dedicated compute", "compute/dedicated-overview"], ["Instance pools", "compute/pool-index"], ["Photon", "compute/photon"], ["SQL warehouse types", "compute/sql-warehouse/warehouse-types"], ["Serverless limitations", "compute/serverless/limitations"], ["Libraries", "libraries/"], ["Compute policy reference", "admin/clusters/policy-definition"]]
      },
      { id: "1.2", title: "Create and organize objects in Unity Catalog", es: "Crear y organizar objetos en Unity Catalog",
        items: [
          "Apply naming conventions based on requirements, including isolation, development environment, and external sharing",
          "Create a catalog based on requirements",
          "Create a schema based on requirements",
          "Create volumes based on requirements",
          "Create tables, views, and materialized views",
          "Implement a foreign catalog by configuring connections",
          "Implement data definition language (DDL) operations on managed and external tables",
          "Configure AI/BI Genie instructions for data discovery"
        ],
        brief: [
          "Jerarquía: **metastore → catálogo → esquema → tabla / vista / volumen / función**. Todo se referencia con tres niveles: `catalogo.esquema.objeto`.",
          "El **catálogo** es la unidad principal de aislamiento (por entorno, por dominio de negocio). Puede tener su propia ubicación de almacenamiento administrado (`MANAGED LOCATION`).",
          "**Volúmenes** gobiernan datos **no tabulares** (archivos) y se acceden por ruta: `/Volumes/catalogo/esquema/volumen/`. Managed o external, igual que las tablas.",
          "**Tabla managed** (por defecto y recomendada): Unity Catalog gestiona datos y metadatos; `DROP` elimina ambos, con `UNDROP` durante 7 días por defecto. **Externa**: lleva `LOCATION`; `DROP` solo elimina metadatos.",
          "**Vista** = consulta guardada que se recalcula cada vez. **Vista materializada** = resultado precalculado que se refresca (a menudo incrementalmente). **Streaming table** = tabla Delta para procesamiento incremental/append.",
          "**Foreign catalog** (Lakehouse Federation): `CREATE CONNECTION` + `CREATE FOREIGN CATALOG`. Es de **solo lectura**.",
          "**Genie**: la precisión mejora con instrucciones, consultas SQL de ejemplo y buenos comentarios de tablas y columnas. Solo usa las fuentes de datos que se le adjuntan."
        ],
        docs: [["Catalogs", "catalogs/"], ["Create schemas", "schemas/create-schema"], ["Volumes", "volumes/"], ["Managed tables", "tables/managed"], ["External tables", "tables/external"], ["Views", "views/"], ["Materialized views", "ldp/concepts/materialized-views"], ["Lakehouse Federation", "query-federation/"], ["Genie Agents (antes Genie spaces)", "genie-agents/set-up"]]
      }
    ]
  },
  {
    id: "d2", short: "Gobierno", color: "#a78bfa",
    name: "Proteger y gobernar objetos de Unity Catalog",
    en: "Secure and govern Unity Catalog objects",
    min: 15, max: 20,
    groups: [
      { id: "2.1", title: "Secure Unity Catalog objects", es: "Proteger objetos de Unity Catalog",
        items: [
          "Grant privileges to a principal (user, service principal, or group) for securable objects in Unity Catalog",
          "Implement table- and column-level access control and row-level security",
          "Access Azure Key Vault secrets from within Azure Databricks",
          "Authenticate data access by using service principals",
          "Authenticate resource access by using managed identities"
        ],
        brief: [
          "Para leer una tabla hacen falta **tres** privilegios: `USE CATALOG` + `USE SCHEMA` + `SELECT`. Tener solo SELECT no basta.",
          "Los privilegios concedidos en un contenedor se **heredan** a todos sus hijos actuales y futuros.",
          "Pueden gestionar privilegios: el **propietario** del objeto, el propietario del catálogo/esquema que lo contiene, o quien tenga **MANAGE**. `ALL PRIVILEGES` no incluye MANAGE.",
          "**BROWSE** (a nivel de catálogo) permite descubrir objetos y ver sus metadatos sin poder leer los datos.",
          "**Secretos**: un secret scope respaldado por Azure Key Vault es una interfaz de **solo lectura** al vault; los secretos se gestionan y rotan en Azure. Los permisos son por scope completo.",
          "**Managed identity** (Access Connector for Azure Databricks) para que Unity Catalog acceda al almacenamiento: sin secretos que rotar. **Service principal** como identidad «Run as» de jobs y automatización."
        ],
        docs: [["Permissions concepts", "data-governance/unity-catalog/access-control/permissions-concepts"], ["Privileges reference", "data-governance/unity-catalog/access-control/privileges-reference"], ["Manage privileges", "data-governance/unity-catalog/manage-privileges/"], ["Workspace secret scopes", "security/secrets/workspace-secret-scopes"], ["Azure managed identities in Unity Catalog", "connect/unity-catalog/cloud-storage/azure-managed-identities"], ["Manage external locations", "connect/unity-catalog/cloud-storage/manage-external-locations"], ["Service principals", "admin/users-groups/service-principals"], ["Run jobs with service principals", "jobs/how-to/run-jobs-with-service-principals"]]
      },
      { id: "2.2", title: "Govern Unity Catalog objects", es: "Gobernar objetos de Unity Catalog",
        items: [
          "Create, implement, and preserve table and column definitions and descriptions for data discovery",
          "Configure attribute-based access control (ABAC) by using tags and policies",
          "Configure row filters and column masks",
          "Apply data retention policies",
          "Set up and manage data lineage tracking by using Catalog Explorer, including owner, history, dependencies, and lineage",
          "Configure audit logging",
          "Design and implement a secure strategy for Delta Sharing"
        ],
        brief: [
          "**Comentarios** en tablas y columnas (`COMMENT ON`, `ALTER TABLE … ALTER COLUMN … COMMENT`, o generados por IA) alimentan la búsqueda y a Genie.",
          "**Row filter** (función que devuelve BOOLEAN) y **column mask** (función que devuelve el valor a mostrar) se aplican tabla por tabla con `ALTER TABLE`.",
          "**ABAC**: políticas (`CREATE POLICY`) adjuntas a catálogo, esquema o tabla que se activan según **governed tags**. Una política cubre muchas tablas. Ni ABAC ni los filtros conceden acceso por sí solos: restringen sobre los GRANT existentes.",
          "**Linaje** automático hasta nivel de columna, visible en Catalog Explorer y en system tables. Requiere al menos BROWSE sobre el catálogo.",
          "**Auditoría**: system table `system.access.audit`, o diagnostic settings de Azure para enviar los logs a Log Analytics, Event Hubs o una cuenta de almacenamiento (plan Premium).",
          "**Retención**: VACUUM elimina archivos antiguos (7 días por defecto); el time travel no es un mecanismo de archivo a largo plazo.",
          "**Delta Sharing**: share + recipient. Databricks-to-Databricks (identificador de compartición, sin tokens) o abierto (token/credencial u OIDC). Tokens con caducidad y listas de IP permitidas."
        ],
        docs: [["Comments", "comments/"], ["Tags", "database-objects/tags"], ["ABAC", "data-governance/unity-catalog/abac/"], ["ABAC vs row filters and column masks", "data-governance/unity-catalog/abac/abac-vs-rls-cm"], ["Row filters and column masks", "data-governance/unity-catalog/filters-and-masks/"], ["Data lineage", "data-governance/unity-catalog/data-lineage"], ["Audit log system table", "admin/system-tables/audit-logs"], ["Configure diagnostic log delivery", "admin/account-settings/audit-log-delivery"], ["Data sharing (OpenSharing / Delta Sharing)", "opensharing/"]]
      }
    ]
  },
  {
    id: "d3", short: "Datos", color: "#34d399",
    name: "Preparar y procesar datos",
    en: "Prepare and process data",
    min: 30, max: 35,
    groups: [
      { id: "3.1", title: "Design and implement data modeling in Unity Catalog", es: "Diseñar e implementar el modelado de datos",
        items: [
          "Design logic for data ingestion and data source configuration, including extraction type and file type",
          "Choose an appropriate data ingestion tool, including Lakeflow Connect, notebooks, and Azure Data Factory",
          "Choose a data loading method, including batch and streaming",
          "Choose a data table format, such as Parquet, Delta, CSV, JSON, or Iceberg",
          "Design and implement a data partitioning scheme",
          "Choose a slowly changing dimension (SCD) type",
          "Choose granularity on a column or table based on requirements",
          "Design and implement a temporal (history) table to record changes over time",
          "Design and implement a clustering strategy, including liquid clustering, Z-ordering, and deletion vectors",
          "Choose between managed and unmanaged tables"
        ],
        brief: [
          "**Delta** es el formato por defecto (ACID, time travel, schema enforcement). **Iceberg** administrado cuando motores externos necesitan el catálogo REST de Iceberg. CSV/JSON/Parquet son formatos de **origen**, no de destino analítico.",
          "**Particionado**: no particiones tablas de menos de 1 TB; cada partición debería contener al menos 1 GB. **Liquid clustering** es lo recomendado para tablas nuevas y sustituye a particionado y Z-order (no se pueden combinar).",
          "**Deletion vectors**: marcan filas como borradas sin reescribir el archivo Parquet completo; aceleran DELETE/UPDATE/MERGE.",
          "**SCD Tipo 1** sobrescribe (sin historia); **SCD Tipo 2** conserva historia con vigencias. Una tabla de historia se modela con SCD 2, no con time travel.",
          "**Granularidad**: guarda el hecho al nivel más fino que el negocio necesite; se puede agregar hacia arriba, nunca desagregar.",
          "Databricks recomienda modelos **estrella/copo de nieve** frente a modelos muy normalizados (3NF).",
          "**Managed** por defecto; **externa** cuando clientes ajenos a Databricks deben acceder directamente a los archivos."
        ],
        docs: [["Partitioning tables", "tables/partitions"], ["Liquid clustering", "tables/clustering"], ["Deletion vectors", "tables/features/deletion-vectors"], ["Data modeling", "transform/data-modeling"], ["Iceberg", "iceberg/"], ["AUTO CDC (SCD 1 y 2)", "ldp/cdc"], ["History and data retention", "tables/history"], ["Lakeflow Connect", "ingestion/overview"]]
      },
      { id: "3.2", title: "Ingest data into Unity Catalog", es: "Ingerir datos en Unity Catalog",
        items: [
          "Ingest data by using Lakeflow Connect, including batch and streaming",
          "Ingest data by using notebooks, including batch and streaming",
          "Ingest data by using SQL methods, including CREATE TABLE … AS (CTAS), CREATE OR REPLACE TABLE, and COPY INTO",
          "Ingest data by using a change data capture (CDC) feed",
          "Ingest data by using Spark Structured Streaming",
          "Ingest streaming data from Azure Event Hubs",
          "Ingest data by using Lakeflow Spark Declarative Pipelines, including Auto Loader"
        ],
        brief: [
          "**Lakeflow Connect**: conectores administrados para SaaS (Salesforce, Workday…) y bases de datos (SQL Server, PostgreSQL, MySQL con CDC). Los de base de datos con CDC usan un *ingestion gateway* y almacenamiento de staging.",
          "**COPY INTO**: SQL, reintentable e idempotente (omite archivos ya cargados). **CTAS** crea y carga; **CREATE OR REPLACE TABLE** reemplaza el contenido conservando la tabla.",
          "**Auto Loader** (`cloudFiles`): incremental, exactly-once, escala a miles de millones de archivos. Por defecto usa listado de directorios; se recomienda el modo de notificación con *file events*. Para JSON/CSV infiere todo como STRING salvo `cloudFiles.inferColumnTypes`.",
          "Evolución de esquema en Auto Loader: `addNewColumns` (por defecto), `rescue`, `failOnNewColumns`, `none`.",
          "**Structured Streaming**: cada consulta necesita su propio **checkpoint**. Triggers: por defecto (micro-lotes continuos), `processingTime`, `availableNow`.",
          "**Event Hubs** se lee con el conector **Kafka** (endpoint `<namespace>.servicebus.windows.net:9093`).",
          "**CDC**: AUTO CDC en pipelines; **change data feed** (`table_changes`, `readChangeFeed`) para leer cambios de una tabla Delta. En pipelines Lakeflow, Auto Loader no necesita que indiques esquema ni checkpoint."
        ],
        docs: [["Lakeflow Connect concepts", "ingestion/lakeflow-connect/"], ["Auto Loader", "ingestion/cloud-object-storage/auto-loader/"], ["Auto Loader schema inference and evolution", "ingestion/cloud-object-storage/auto-loader/schema"], ["Auto Loader file detection modes", "ingestion/cloud-object-storage/auto-loader/file-detection-modes"], ["COPY INTO", "ingestion/cloud-object-storage/copy-into/"], ["Trigger intervals", "structured-streaming/triggers"], ["Checkpoints", "structured-streaming/checkpoints"], ["Azure Event Hubs as a pipeline source", "ldp/event-hubs"], ["Change data feed", "tables/features/change-data-feed"], ["AUTO CDC", "ldp/cdc"]]
      },
      { id: "3.3", title: "Cleanse, transform, and load data into Unity Catalog", es: "Limpiar, transformar y cargar datos",
        items: [
          "Profile data to generate summary statistics and assess data distributions",
          "Choose appropriate column data types",
          "Identify and resolve duplicate, missing, and null values",
          "Transform data, including filtering, grouping, and aggregating data",
          "Transform data by using join, union, intersect, and except operators",
          "Transform data by denormalizing, pivoting, and unpivoting data",
          "Load data by using merge, insert, and append operations"
        ],
        brief: [
          "**Perfilado**: `df.summary()` / `df.describe()` y el perfil de datos del notebook para estadísticas y distribuciones.",
          "**Tipos**: importes en `DECIMAL(p,s)` (no DOUBLE), fechas en `DATE`/`TIMESTAMP` (no STRING), identificadores grandes en `BIGINT`.",
          "**Duplicados**: `dropDuplicates([clave])` o `ROW_NUMBER() … QUALIFY`. **Nulos**: `coalesce`, `fillna`, `dropna(subset=…)`.",
          "`WHERE` filtra filas antes de agrupar; `HAVING` filtra grupos después de agregar.",
          "Conjuntos: `UNION` elimina duplicados, `UNION ALL` no; `INTERSECT` = comunes; `EXCEPT` = en el primero y no en el segundo. `LEFT ANTI JOIN` = filas sin correspondencia.",
          "**PIVOT** convierte filas en columnas; **UNPIVOT** columnas en filas.",
          "Carga: **append** (INSERT INTO), **overwrite selectivo** (`REPLACE WHERE`) para re-ejecuciones idempotentes, **MERGE** para upserts. MERGE falla si varias filas del origen coinciden con una del destino."
        ],
        docs: [["MERGE", "delta/merge"], ["Selective overwrite", "delta/selective-overwrite"], ["Joins", "transform/join"], ["Aggregations", "transform/aggregation"], ["Clean and validate", "transform/validate"]]
      },
      { id: "3.4", title: "Implement and manage data quality constraints in Unity Catalog", es: "Restricciones de calidad de datos",
        items: [
          "Implement validation checks, including nullability, data cardinality, and range checking",
          "Implement data type checks",
          "Implement schema enforcement and manage schema drift",
          "Manage data quality with pipeline expectations in Lakeflow Spark Declarative Pipelines"
        ],
        brief: [
          "Restricciones **aplicadas**: `NOT NULL` y `CHECK`. Si una fila las incumple, la transacción entera falla.",
          "Restricciones **informativas** (no aplicadas): `PRIMARY KEY`, `FOREIGN KEY`, unique. La unicidad hay que validarla tú.",
          "**Schema enforcement**: Delta rechaza escrituras cuyo esquema no encaja. Para aceptar columnas nuevas: `mergeSchema` (evolución) o `ALTER TABLE … ADD COLUMNS`.",
          "**Expectations**: `EXPECT` (advierte y conserva; por defecto), `… ON VIOLATION DROP ROW` (descarta), `… ON VIOLATION FAIL UPDATE` (falla la actualización).",
          "En Python: `@dp.expect`, `@dp.expect_or_drop`, `@dp.expect_or_fail` y las variantes `expect_all*` que reciben un diccionario.",
          "Las métricas de warn y drop se ven en la UI y en el event log del pipeline; con fail no se registran métricas."
        ],
        docs: [["Table constraints", "tables/constraints"], ["Schema enforcement", "tables/schema-enforcement"], ["Update table schema", "tables/update-schema"], ["Pipeline expectations", "ldp/expectations"]]
      }
    ]
  },
  {
    id: "d4", short: "Pipelines", color: "#fbbf24",
    name: "Desplegar y mantener pipelines y cargas de trabajo",
    en: "Deploy and maintain data pipelines and workloads",
    min: 30, max: 35,
    groups: [
      { id: "4.1", title: "Design and implement data pipelines", es: "Diseñar e implementar pipelines de datos",
        items: [
          "Design order of operations for a data pipeline",
          "Choose between notebook and Lakeflow Spark Declarative Pipelines",
          "Design task logic for Lakeflow Jobs",
          "Design and implement error handling in data pipelines, notebooks, and jobs",
          "Create a data pipeline by using a notebook, including precedence constraints",
          "Create a data pipeline by using Lakeflow Spark Declarative Pipelines"
        ],
        brief: [
          "Orden típico (medallion): **bronze** (crudo) → **silver** (limpio, conformado) → **gold** (agregado para negocio).",
          "**Pipeline declarativo**: declaras tablas y el motor resuelve dependencias, incrementalidad, reintentos y calidad. **Notebook + job**: control procedimental total, tú gestionas el orden y el estado.",
          "Lógica de tareas en Lakeflow Jobs: dependencias (`depends_on`), **Run if**, **If/else**, **For each**, **Run Job** y **task values** para pasar datos entre tareas.",
          "Errores en notebooks: una excepción no capturada hace fallar la tarea; `dbutils.notebook.exit()` termina **con éxito**.",
          "Modo **triggered** (procesa lo disponible y se detiene) frente a **continuous** (mantiene las tablas al día; más costo).",
          "Un **full refresh** de una streaming table borra datos y checkpoints y reprocesa todo: puede perder registros si el origen ya no los conserva."
        ],
        docs: [["Lakeflow pipelines", "ldp/"], ["Streaming tables", "ldp/concepts/streaming-tables"], ["Triggered vs continuous", "ldp/concepts/pipeline-mode"], ["Pipeline updates", "ldp/updates"], ["Control flow in jobs", "jobs/control-flow"], ["Configure task dependencies (Run if)", "jobs/run-if"], ["If/else task", "jobs/tasks/if-else"], ["For each task", "jobs/tasks/for-each"], ["Task values", "jobs/task-values"]]
      },
      { id: "4.2", title: "Implement Lakeflow Jobs", es: "Implementar Lakeflow Jobs",
        items: [
          "Create a job, including setup and configuration",
          "Configure job triggers",
          "Schedule a job",
          "Configure alerts for a job",
          "Configure automatic restarts for a job or a data pipeline"
        ],
        brief: [
          "Tipos de trigger: **Scheduled**, **File arrival**, **Table update**, **Job completion**, **Continuous** y manual.",
          "**File arrival** vigila una external location o un volumen de Unity Catalog (incluidas subcarpetas), comprobando aproximadamente cada minuto.",
          "**Continuous**: mantiene el job siempre en ejecución; no admite dependencias entre tareas ni políticas de reintento (reintenta con backoff exponencial).",
          "**Notificaciones**: inicio, éxito, fallo, duración que supera un umbral, backlog de streaming. Destinos: email, Slack, Microsoft Teams, PagerDuty, webhooks.",
          "**Reintentos** por tarea para fallos transitorios; los pipelines lanzados desde Jobs y los continuos tienen reintento y reinicio automáticos.",
          "Historial de ejecuciones: 60 días. Para más tiempo, system tables (`system.lakeflow`)."
        ],
        docs: [["Lakeflow Jobs", "jobs/"], ["Schedules and triggers", "jobs/triggers"], ["File arrival triggers", "jobs/file-arrival-triggers"], ["Table update triggers", "jobs/trigger-table-update"], ["Continuous jobs", "jobs/continuous"], ["Notifications", "jobs/notifications"], ["Configure jobs", "jobs/configure-job"], ["Monitor jobs", "jobs/monitor"]]
      },
      { id: "4.3", title: "Implement development lifecycle processes in Azure Databricks", es: "Ciclo de vida de desarrollo",
        items: [
          "Apply version control best practices using Git",
          "Manage branching, pull requests, and conflict resolution",
          "Implement a testing strategy, including unit tests, integration tests, end-to-end tests, and user acceptance testing (UAT)",
          "Configure and package Databricks Asset Bundles",
          "Deploy a bundle by using the Azure Databricks command-line interface (CLI)",
          "Deploy a bundle by using REST APIs"
        ],
        brief: [
          "**Git folders** (antes Repos): cada desarrollador trabaja en su carpeta y su rama; las carpetas de producción las crea un administrador y las actualiza la automatización.",
          "Flujo: rama de feature → commit/push → **pull request** con revisión → merge a main → CI/CD despliega.",
          "Pruebas: **unitarias** (una función aislada, p. ej. con pytest), **integración** (componentes juntos contra datos reales de prueba), **end-to-end** (el pipeline completo), **UAT** (el negocio valida).",
          "**Bundles**: un único `databricks.yml` en la raíz (puede incluir otros archivos), con `targets` por entorno. La documentación actual los llama **Declarative Automation Bundles**; el examen dice **Databricks Asset Bundles**.",
          "CLI: `bundle init` → `validate` → `deploy -t <target>` → `run` → `destroy`. `bundle generate` crea configuración a partir de un recurso existente.",
          "`mode: development` prefija `[dev <usuario>]` y pausa schedules; `mode: production` valida configuración de producción. `run_as` fija la identidad de ejecución."
        ],
        docs: [["Git folders", "repos/"], ["Git operations", "repos/git-operations-with-repos"], ["CI/CD with Git folders", "repos/ci-cd"], ["Unit testing for notebooks", "notebooks/testing"], ["Bundles overview", "dev-tools/bundles/"], ["Bundle configuration", "dev-tools/bundles/settings"], ["Deployment modes", "dev-tools/bundles/deployment-modes"], ["Develop bundles (CLI workflow)", "dev-tools/bundles/work-tasks"], ["Substitutions and variables", "dev-tools/bundles/variables"]]
      },
      { id: "4.4", title: "Monitor, troubleshoot, and optimize workloads in Azure Databricks", es: "Monitorizar, diagnosticar y optimizar",
        items: [
          "Monitor and manage cluster consumption to optimize performance and cost",
          "Troubleshoot and repair issues in Lakeflow Jobs, including repair, restart, stop, and run functions",
          "Troubleshoot and repair issues in Apache Spark jobs and notebooks, including performance tuning, resolving resource bottlenecks, and cluster restart",
          "Investigate and resolve caching, skewing, spilling, and shuffle issues by using a Directed Acyclic Graph (DAG), the Spark UI, and query profile",
          "Optimize Delta tables for performance and cost, including OPTIMIZE and VACUUM commands",
          "Implement log streaming by using Log Analytics in Azure Monitor",
          "Configure alerts by using Azure Monitor"
        ],
        brief: [
          "**Costo**: system table `system.billing.usage`, etiquetas (tags) para atribuir consumo, políticas de cómputo y la UI de métricas de cómputo (CPU, memoria).",
          "**Repair run** re-ejecuta solo las tareas fallidas y sus dependientes, con la configuración actual. Ojo: no hace idempotente a la tarea.",
          "**Skew**: en Spark UI, si la duración máxima supera en 50 % o más al percentil 75 del stage. Soluciones: AQE, salting, pre-agregación, liquid clustering.",
          "**Spill**: Spark se queda sin memoria de ejecución y escribe a disco. Soluciones: `spark.sql.shuffle.partitions=auto`, reducir datos en memoria, más memoria por executor.",
          "**AQE** está activo por defecto: convierte sort-merge join en broadcast join, fusiona particiones pequeñas y trata el skew.",
          "**Query profile**: para consultas en SQL warehouses; muestra operadores, tiempo, filas y memoria.",
          "**OPTIMIZE** compacta; **VACUUM** elimina archivos antiguos (7 días por defecto; `DRY RUN` para previsualizar; `LITE` usa el log de transacciones). **Predictive optimization** lo hace solo en tablas managed.",
          "**Logs**: diagnostic settings de Azure → Log Analytics; alertas con reglas de Azure Monitor sobre esas consultas."
        ],
        docs: [["Troubleshoot and repair job failures", "jobs/repair-job-failures"], ["Skew and spill (Spark UI)", "optimizations/spark-ui-guide/long-spark-stage-page"], ["Spark UI guide", "optimizations/spark-ui-guide/"], ["Adaptive query execution", "optimizations/aqe"], ["Query profile", "sql/user/queries/query-profile"], ["OPTIMIZE", "tables/operations/optimize"], ["VACUUM", "tables/operations/vacuum"], ["Predictive optimization", "optimizations/predictive-optimization"], ["Billable usage system table", "admin/system-tables/billing"], ["Compute metrics", "compute/cluster-metrics"], ["Configure diagnostic log delivery", "admin/account-settings/audit-log-delivery"]]
      }
    ]
  }
];

DP750.RESOURCES = [
  { group: "Examen (fuente primaria)", items: [
    { t: "Guía de estudio oficial DP-750 (skills measured)", u: DP750.GUIDE.url, n: "La única fuente autoritativa del temario y sus pesos." },
    { t: "Certificación Azure Databricks Data Engineer Associate", u: "https://learn.microsoft.com/credentials/certifications/implementing-data-engineering-solutions-using-azure-databricks/", n: "Registro, idiomas, precio y acceso al Practice Assessment oficial." },
    { t: "Curso oficial DP-750T00", u: "https://learn.microsoft.com/training/courses/dp-750t00", n: "Curso con instructor; sus módulos también existen como rutas autodidactas." },
    { t: "Documentación de Azure Databricks", u: DP750.DOC, n: "Raíz de toda la documentación citada en esta app." }
  ]}
].concat(DP750.DOMAINS.map(d => ({
  group: d.name + " (" + d.min + "–" + d.max + "%)",
  items: d.groups.flatMap(g => g.docs.map(x => ({ t: x[0], u: DP750.DOC + x[1], n: "Habilidad " + g.id + " · " + g.es })))
})));

/* Nombres que cambiaron: el examen (guía de marzo de 2026) y la documentación actual no siempre coinciden. */
DP750.RENAMES = [
  ["Delta Live Tables (DLT)", "Lakeflow Spark Declarative Pipelines / Lakeflow pipelines", "El código antiguo sigue funcionando."],
  ["import dlt · @dlt.table", "from pyspark import pipelines as dp · @dp.table", "Databricks recomienda migrar a los nombres nuevos."],
  ["APPLY CHANGES INTO · dlt.apply_changes()", "AUTO CDC INTO · dp.create_auto_cdc_flow()", "Misma sintaxis; las APIs antiguas siguen disponibles."],
  ["Databricks Workflows / Jobs", "Lakeflow Jobs", "Nombre usado en la guía del examen."],
  ["Databricks Asset Bundles", "Declarative Automation Bundles", "La guía del examen dice Databricks Asset Bundles; la documentación actual, el nombre nuevo."],
  ["Delta Sharing", "OpenSharing", "La guía del examen dice Delta Sharing; la documentación actual lo presenta como OpenSharing."],
  ["Genie spaces (AI/BI Genie)", "Genie Agents", "La guía del examen dice AI/BI Genie."],
  ["Repos", "Git folders", ""],
  ["Shared access mode", "Standard access mode", ""],
  ["Single user access mode", "Dedicated access mode", "Puede asignarse a un usuario o a un grupo."]
];

DP750.CHEATS = [
  {
    domain: "d1", title: "Tipos de cómputo: cuál elegir",
    head: ["Cómputo", "Úsalo para", "Trampa de examen"],
    rows: [
      ["Job compute (clúster de job)", "Jobs programados/automatizados. Se crea al iniciar y se destruye al terminar.", "Es la respuesta por defecto para ETL programado: tarifa DBU menor que all-purpose."],
      ["All-purpose (clásico interactivo)", "Desarrollo interactivo y exploración en notebooks.", "Usarlo para jobs programados = costo extra. Casi siempre es distractor."],
      ["Serverless (notebooks / jobs / pipelines)", "Arranque rápido sin gestionar infraestructura.", "No eliges tipo de nodo ni configuraciones Spark arbitrarias."],
      ["SQL warehouse", "BI, dashboards y SQL ad hoc.", "Solo SQL: no ejecuta notebooks PySpark/Scala."],
      ["Pools de instancias", "Reducir tiempo de arranque/escalado con VMs en espera.", "Un pool no es un tipo de cómputo: es un origen de instancias para clústeres."]
    ],
    note: "Las tarifas exactas de DBU cambian; el examen evalúa el criterio (job < all-purpose para cargas automatizadas), no los precios."
  },
  {
    domain: "d1", title: "Modos de acceso del cómputo y Unity Catalog",
    head: ["Modo", "Usuarios", "Unity Catalog", "Notas"],
    rows: [
      ["Standard (antes «Shared»)", "Varios, con aislamiento entre usuarios", "Sí", "Recomendado para compartir. Algunas APIs de bajo nivel están restringidas."],
      ["Dedicated (antes «Single user»)", "Un usuario (o un grupo) asignado", "Sí", "Para cargas que requieren funciones no disponibles en Standard (p. ej. ciertas librerías ML, RDD)."],
      ["No isolation shared (legado)", "Varios, sin aislamiento", "No", "Si el escenario exige Unity Catalog, esta opción queda descartada."]
    ],
    note: "El examen puede usar la nomenclatura antigua (Shared / Single user) o la nueva (Standard / Dedicated). Verifica en la documentación vigente las limitaciones exactas de cada modo, porque cambian con cada runtime."
  },
  {
    domain: "d1", title: "Tabla managed vs externa",
    head: ["Aspecto", "Managed", "Externa"],
    rows: [
      ["Ubicación de datos", "Almacenamiento administrado por Unity Catalog", "Ruta propia indicada con LOCATION (external location)"],
      ["DROP TABLE", "Elimina metadatos y datos (con ventana de recuperación UNDROP)", "Solo elimina metadatos; los archivos permanecen"],
      ["Optimización automática", "Compatible con predictive optimization", "No administrada por Unity Catalog"],
      ["Cuándo elegirla", "Opción por defecto recomendada", "Cuando otros sistemas deben leer/escribir los archivos directamente o los datos ya existen en una ruta"]
    ]
  },
  {
    domain: "d2", title: "Jerarquía de privilegios en Unity Catalog",
    head: ["Para…", "Privilegios necesarios"],
    rows: [
      ["Leer una tabla", "USE CATALOG + USE SCHEMA + SELECT sobre la tabla"],
      ["Escribir en una tabla", "USE CATALOG + USE SCHEMA + MODIFY (y SELECT si la operación lee, p. ej. MERGE/UPDATE)"],
      ["Crear una tabla", "USE CATALOG + USE SCHEMA + CREATE TABLE sobre el esquema"],
      ["Crear tabla externa", "Además: CREATE EXTERNAL TABLE sobre la external location"],
      ["Leer archivos de un volumen", "USE CATALOG + USE SCHEMA + READ VOLUME"],
      ["Descubrir metadatos sin leer datos", "BROWSE sobre el catálogo"]
    ],
    note: "Los privilegios se heredan hacia abajo (catálogo → esquema → tabla). SELECT sin USE CATALOG / USE SCHEMA no basta: es la trampa nº 1 del dominio."
  },
  {
    domain: "d2", title: "Control fino de acceso: qué herramienta usar",
    head: ["Necesidad", "Herramienta", "Clave"],
    rows: [
      ["Filtrar filas según el usuario", "Row filter (función SQL + ALTER TABLE … SET ROW FILTER)", "Una sola tabla, lógica centralizada"],
      ["Enmascarar una columna", "Column mask (ALTER TABLE … ALTER COLUMN … SET MASK)", "El tipo devuelto debe ser compatible con la columna"],
      ["La misma regla sobre muchas tablas", "ABAC: tags gobernados + políticas", "Escala por atributo, no tabla por tabla"],
      ["Exponer un subconjunto/transformación", "Vista dinámica", "Más objetos que mantener; válido pero menos escalable"],
      ["GRANT por columna", "No existe en Unity Catalog", "Distractor frecuente"]
    ]
  },
  {
    domain: "d2", title: "Identidades y secretos en Azure",
    head: ["Escenario", "Solución recomendada"],
    rows: [
      ["Unity Catalog accede a ADLS Gen2", "Access Connector for Azure Databricks (managed identity) → storage credential → external location"],
      ["Job automatizado / CI-CD", "Service principal de Microsoft Entra ID como identidad de ejecución (run as)"],
      ["Contraseñas / claves de API en notebooks", "Secret scope respaldado por Azure Key Vault + dbutils.secrets.get()"],
      ["Clave de cuenta en spark.conf o montajes (mounts)", "Patrón heredado: evita Unity Catalog y no es auditable por objeto. Distractor."]
    ]
  },
  {
    domain: "d3", title: "Ingesta: qué herramienta elegir",
    head: ["Herramienta", "Mejor para", "Límite / trampa"],
    rows: [
      ["Auto Loader (cloudFiles)", "Archivos que llegan continuamente, gran volumen, esquema que evoluciona", "Requiere schemaLocation al inferir esquema y checkpoint en el writeStream"],
      ["COPY INTO", "Cargas batch idempotentes de un número moderado de archivos, en SQL", "Escala peor con muchísimos archivos; sin evolución de esquema tan rica"],
      ["Lakeflow Connect", "Conectores administrados a SaaS y bases de datos", "Elige esto cuando el enunciado pide «mínimo código / conector administrado»"],
      ["Structured Streaming + Event Hubs", "Eventos en tiempo real", "Event Hubs expone un endpoint compatible con Kafka"],
      ["Azure Data Factory", "Orquestación y copia desde orígenes on-premises/variados", "Orquesta; la transformación pesada sigue en Databricks"],
      ["CTAS / CREATE OR REPLACE TABLE", "Cargas completas o reconstrucciones", "No es incremental"]
    ]
  },
  {
    domain: "d3", title: "Organización física: particionado vs clustering",
    head: ["Técnica", "Cuándo", "Advertencia"],
    rows: [
      ["Liquid clustering (CLUSTER BY)", "Opción recomendada para tablas nuevas; columnas de filtro de alta cardinalidad; patrones de consulta cambiantes", "Incompatible con particionado y con ZORDER en la misma tabla"],
      ["Particionado (PARTITIONED BY)", "Tablas muy grandes con columna de baja cardinalidad", "Databricks recomienda no particionar tablas pequeñas (orientación: por debajo de ~1 TB). Sobre-particionar genera archivos pequeños"],
      ["Z-order (OPTIMIZE … ZORDER BY)", "Tablas existentes particionadas sin liquid clustering", "No es incremental: reescribe; cambiar columnas implica re-optimizar"],
      ["Deletion vectors", "Acelerar DELETE/UPDATE/MERGE evitando reescribir archivos completos", "Los datos se eliminan físicamente al reescribir (OPTIMIZE / REORG … PURGE) y VACUUM"]
    ],
    note: "El umbral de ~1 TB es una orientación de la documentación de Databricks, no un límite técnico. Verifica la redacción vigente."
  },
  {
    domain: "d3", title: "Expectations en Lakeflow Spark Declarative Pipelines",
    head: ["Sintaxis SQL", "Decorador Python", "Fila inválida", "Pipeline"],
    rows: [
      ["EXPECT (cond)", "@dp.expect", "Se conserva (se registra la métrica)", "Continúa"],
      ["EXPECT (cond) ON VIOLATION DROP ROW", "@dp.expect_or_drop", "Se descarta", "Continúa"],
      ["EXPECT (cond) ON VIOLATION FAIL UPDATE", "@dp.expect_or_fail", "—", "La actualización falla"]
    ],
    note: "En material anterior verás el módulo `dlt` (import dlt, @dlt.expect…) y el nombre «Delta Live Tables». El producto se renombró a Lakeflow Spark Declarative Pipelines y el módulo actual es `pyspark.pipelines` (alias habitual `dp`). El examen puede mostrar cualquiera de las dos formas."
  },
  {
    domain: "d3", title: "SCD y CDC",
    head: ["Tipo", "Comportamiento", "Cómo se implementa"],
    rows: [
      ["SCD Tipo 1", "Sobrescribe; no guarda historia", "AUTO CDC … STORED AS SCD TYPE 1, o MERGE con UPDATE"],
      ["SCD Tipo 2", "Conserva historia con vigencias (__START_AT / __END_AT)", "AUTO CDC … STORED AS SCD TYPE 2"],
      ["Eventos fuera de orden", "Deben ordenarse por una columna de secuencia", "SEQUENCE BY (lo resuelve AUTO CDC; con MERGE manual es tu responsabilidad)"],
      ["Change data feed", "Expone cambios fila a fila de una tabla Delta", "TBLPROPERTIES (delta.enableChangeDataFeed = true) + table_changes()"]
    ],
    note: "AUTO CDC es el nombre actual de APPLY CHANGES INTO (Python: create_auto_cdc_flow, antes apply_changes). Reconoce ambos."
  },
  {
    domain: "d4", title: "Databricks Asset Bundles: comandos",
    head: ["Comando", "Qué hace"],
    rows: [
      ["databricks bundle init", "Crea un bundle a partir de una plantilla"],
      ["databricks bundle validate", "Valida la configuración (databricks.yml) sin desplegar"],
      ["databricks bundle deploy -t <target>", "Despliega código y recursos al target indicado"],
      ["databricks bundle run -t <target> <recurso>", "Ejecuta un job o pipeline desplegado"],
      ["databricks bundle destroy -t <target>", "Elimina los recursos desplegados por el bundle"]
    ],
    note: "mode: development antepone un prefijo a los recursos y pausa schedules/triggers; mode: production valida condiciones más estrictas. Usar development en el target prod es una trampa clásica."
  },
  {
    domain: "d4", title: "Diagnóstico en Spark UI: síntoma → causa → acción",
    head: ["Síntoma", "Causa probable", "Acción"],
    rows: [
      ["Unas pocas tareas tardan muchísimo más que la mediana del stage", "Data skew", "AQE skew join, broadcast de la tabla pequeña, salting de la clave"],
      ["«Spill (disk)» alto en un stage", "Particiones demasiado grandes para la memoria", "Más particiones de shuffle / corregir skew / nodos con más memoria"],
      ["Shuffle read/write enorme", "Joins o agregaciones amplias", "Filtrar antes, broadcast join, revisar claves"],
      ["Muchos archivos pequeños escaneados", "Tabla fragmentada o sobre-particionada", "OPTIMIZE, liquid clustering"],
      ["Mismo cálculo repetido en varias acciones", "DataFrame recalculado", "Cache/persist selectivo (y liberar después)"]
    ]
  },
  {
    domain: "d4", title: "Mantenimiento de tablas Delta",
    head: ["Operación", "Efecto", "Trampa"],
    rows: [
      ["OPTIMIZE", "Compacta archivos pequeños (y aplica clustering)", "No borra archivos antiguos: eso es VACUUM"],
      ["VACUUM", "Elimina archivos no referenciados más antiguos que la retención", "Retención por defecto: 7 días. Reducirla rompe el time travel a versiones anteriores"],
      ["delta.deletedFileRetentionDuration", "Controla cuánto se conservan los archivos eliminados", "Debe cubrir la ventana de time travel requerida"],
      ["delta.logRetentionDuration", "Controla cuánto historial de transacciones se conserva", "Por defecto 30 días"],
      ["Predictive optimization", "Ejecuta OPTIMIZE/VACUUM automáticamente", "Solo en tablas managed de Unity Catalog"]
    ]
  },
  {
    domain: "d4", title: "Lakeflow Jobs: recuperación ante fallos",
    head: ["Mecanismo", "Cuándo"],
    rows: [
      ["Reintentos por tarea (max_retries)", "Fallos transitorios (red, throttling)"],
      ["Repair run", "Re-ejecutar solo las tareas fallidas y sus dependientes, sin repetir las exitosas"],
      ["Tarea con «Run if» (p. ej. al menos una falló)", "Rutas de compensación / notificación"],
      ["Notificaciones del job", "Alertar en inicio, éxito, fallo o exceso de duración"],
      ["Run now", "Re-ejecuta todo el job: desperdicia cómputo si solo falló una tarea"]
    ]
  }
];
