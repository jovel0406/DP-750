/* Dominios oficiales DP-750, recursos y tablas resumen.
   NOTA DE VERACIDAD: los nombres y pesos de dominio se contrastaron con resultados de búsqueda
   de la guía oficial de Microsoft Learn. Las viñetas de cada dominio están parafraseadas (no son
   cita literal) y deben contrastarse con la guía oficial antes del examen. */
window.DP750 = window.DP750 || {};

DP750.DOMAINS = [
  {
    id: "d1", short: "Entorno", color: "#38bdf8",
    name: "Configurar un entorno de Azure Databricks",
    en: "Set up and configure an Azure Databricks environment",
    min: 15, max: 20,
    groups: [
      { title: "Seleccionar y configurar cómputo", items: [
        "Elegir el tipo de cómputo: job compute, serverless, SQL warehouse, clásico (all-purpose), compartido",
        "Rendimiento: tipo y número de nodos, autoscaling, auto-terminación, pools",
        "Características: Photon, versión de Databricks Runtime / Spark, runtime ML",
        "Instalar librerías en un recurso de cómputo",
        "Permisos de acceso al cómputo"
      ]},
      { title: "Crear y organizar objetos en Unity Catalog", items: [
        "Convenciones de nombres (aislamiento, compartición externa, entornos dev/test/prod)",
        "Crear catálogos, esquemas y volúmenes según requisitos",
        "Crear tablas, vistas y vistas materializadas",
        "Foreign catalogs mediante conexiones (Lakehouse Federation)",
        "DDL sobre tablas administradas (managed) y externas",
        "Instrucciones de AI/BI Genie para descubrimiento de datos"
      ]}
    ]
  },
  {
    id: "d2", short: "Gobierno", color: "#a78bfa",
    name: "Proteger y gobernar objetos de Unity Catalog",
    en: "Secure and govern Unity Catalog objects",
    min: 15, max: 20,
    groups: [
      { title: "Proteger objetos de Unity Catalog", items: [
        "Conceder privilegios a usuarios, service principals y grupos",
        "Control de acceso a nivel de tabla, columna y fila",
        "Acceder a secretos de Azure Key Vault desde Azure Databricks",
        "Autenticar acceso a datos con service principals",
        "Autenticar acceso a recursos con managed identities"
      ]},
      { title: "Gobernar objetos de Unity Catalog", items: [
        "Definiciones y descripciones de tablas y columnas",
        "ABAC (control de acceso basado en atributos) con tags y políticas",
        "Row filters y column masks",
        "Políticas de retención de datos",
        "Linaje de datos y propiedad (owner)",
        "Audit logging",
        "Estrategia segura de Delta Sharing"
      ]}
    ]
  },
  {
    id: "d3", short: "Datos", color: "#34d399",
    name: "Preparar y procesar datos",
    en: "Prepare and process data",
    min: 30, max: 35,
    groups: [
      { title: "Diseñar el modelado de datos en Unity Catalog", items: [
        "Lógica de ingesta: tipo de extracción y tipo de archivo",
        "Elegir herramienta de ingesta: Lakeflow Connect, notebooks, Azure Data Factory",
        "Elegir carga batch vs streaming",
        "Elegir formato de tabla: Parquet, Delta, CSV, JSON, Iceberg",
        "Esquema de particionado; estrategia de clustering (liquid clustering, Z-order, deletion vectors)",
        "Tipo de SCD, granularidad, tablas temporales (historia)",
        "Managed vs unmanaged (externa)"
      ]},
      { title: "Ingerir datos en Unity Catalog", items: [
        "Lakeflow Connect y notebooks",
        "Métodos SQL: CTAS, CREATE OR REPLACE TABLE, COPY INTO",
        "Change Data Capture (CDC) / change data feed",
        "Spark Structured Streaming y Azure Event Hubs",
        "Lakeflow Spark Declarative Pipelines, incluido Auto Loader"
      ]},
      { title: "Limpiar, transformar y cargar", items: [
        "Perfilado de datos y elección de tipos de columna",
        "Duplicados, valores faltantes y nulos",
        "Filtrar, agrupar, agregar; join, union, intersect, except",
        "Desnormalizar: pivot / unpivot",
        "Cargar con merge, insert y append"
      ]},
      { title: "Restricciones de calidad de datos", items: [
        "Validaciones: nulabilidad, cardinalidad, rango, tipo de dato",
        "Schema enforcement y gestión de schema drift",
        "Expectations en Lakeflow Spark Declarative Pipelines"
      ]}
    ]
  },
  {
    id: "d4", short: "Pipelines", color: "#fbbf24",
    name: "Desplegar y mantener pipelines y cargas de trabajo",
    en: "Deploy and maintain data pipelines and workloads",
    min: 30, max: 35,
    groups: [
      { title: "Diseñar e implementar pipelines", items: [
        "Orden de operaciones y lógica de tareas en Lakeflow Jobs",
        "Notebook vs Lakeflow Spark Declarative Pipelines",
        "Manejo de errores y restricciones de precedencia"
      ]},
      { title: "Implementar Lakeflow Jobs", items: [
        "Crear y configurar jobs; triggers y programación",
        "Alertas y reinicios automáticos (reintentos)"
      ]},
      { title: "Ciclo de vida de desarrollo", items: [
        "Git: control de versiones, ramas, pull requests, conflictos",
        "Estrategia de pruebas: unitarias, integración, end-to-end, UAT",
        "Databricks Asset Bundles: configurar, empaquetar y desplegar (CLI y REST API)"
      ]},
      { title: "Monitorizar, diagnosticar y optimizar", items: [
        "Consumo de clústeres: rendimiento y costo",
        "Reparar y reiniciar ejecuciones en Lakeflow Jobs",
        "Diagnóstico Spark: caching, skew, spill, shuffle con DAG, Spark UI y query profile",
        "Optimizar tablas Delta: OPTIMIZE y VACUUM",
        "Log streaming con Log Analytics; alertas con Azure Monitor"
      ]}
    ]
  }
];

/* Enlaces: solo dominios oficiales. No se pudieron abrir desde el entorno donde se generó la app;
   si alguno devuelve 404, busca el título en Microsoft Learn. */
const L = "https://learn.microsoft.com";
DP750.RESOURCES = [
  { group: "Examen (fuente primaria)", items: [
    { t: "Guía de estudio oficial DP-750 (skills measured)", u: L + "/credentials/certifications/resources/study-guides/dp-750", n: "La única fuente autoritativa del temario y sus pesos. Revísala primero." },
    { t: "Página de la certificación Azure Databricks Data Engineer Associate", u: L + "/credentials/certifications/implementing-data-engineering-solutions-using-azure-databricks/", n: "Registro, idiomas, precio y Practice Assessment si está disponible." },
    { t: "Curso oficial DP-750T00", u: L + "/training/courses/dp-750t00", n: "Curso con instructor; sus módulos también existen como rutas autodidactas." }
  ]},
  { group: "Documentación de Azure Databricks", items: [
    { t: "Documentación de Azure Databricks (raíz)", u: L + "/azure/databricks/", n: "Punto de entrada para todo lo demás." },
    { t: "Cómputo", u: L + "/azure/databricks/compute/", n: "Tipos de cómputo, modos de acceso, pools, Photon." },
    { t: "Unity Catalog", u: L + "/azure/databricks/data-governance/unity-catalog/", n: "Objetos, privilegios, row filters, column masks, ABAC, linaje." },
    { t: "Privilegios y objetos protegibles de Unity Catalog", u: L + "/azure/databricks/data-governance/unity-catalog/manage-privileges/privileges", n: "Tabla de privilegios: imprescindible." },
    { t: "Lakehouse Federation", u: L + "/azure/databricks/query-federation/", n: "Connections y foreign catalogs." },
    { t: "Delta Sharing", u: L + "/azure/databricks/delta-sharing/", n: "Shares, recipients, open sharing vs Databricks-to-Databricks." },
    { t: "Gestión de secretos", u: L + "/azure/databricks/security/secrets/", n: "Secret scopes respaldados por Azure Key Vault." },
    { t: "Auto Loader", u: L + "/azure/databricks/ingestion/cloud-object-storage/auto-loader/", n: "cloudFiles, inferencia y evolución de esquema." },
    { t: "Liquid clustering", u: L + "/azure/databricks/delta/clustering", n: "CLUSTER BY frente a particionado y Z-order." },
    { t: "MERGE INTO (upserts)", u: L + "/azure/databricks/delta/merge", n: "Semántica de merge y errores típicos." },
    { t: "OPTIMIZE", u: L + "/azure/databricks/delta/optimize", n: "Compactación de archivos." },
    { t: "VACUUM", u: L + "/azure/databricks/delta/vacuum", n: "Retención y time travel." },
    { t: "Lakeflow Jobs", u: L + "/azure/databricks/jobs/", n: "Tareas, triggers, reintentos, repair run." },
    { t: "Databricks Asset Bundles", u: L + "/azure/databricks/dev-tools/bundles/", n: "databricks.yml, targets, modos de despliegue." },
    { t: "Adaptive Query Execution", u: L + "/azure/databricks/optimizations/aqe", n: "Skew join, coalescing de particiones." },
    { t: "System tables", u: L + "/azure/databricks/admin/system-tables/", n: "Auditoría, facturación y linaje consultables por SQL." },
    { t: "Structured Streaming", u: L + "/azure/databricks/structured-streaming/", n: "Checkpoints, triggers, watermarks." }
  ]}
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
