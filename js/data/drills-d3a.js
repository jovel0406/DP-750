/* Preguntas de concepto · Dominio 3, habilidades 3.1 y 3.2 (mismo formato que drills-d1.js). */
window.DP750 = window.DP750 || {};
DP750.DRILLS = (DP750.DRILLS || []).concat([

/* ───── 3.1 Design and implement data modeling ───── */
["3.1", "Elegir el formato de tabla", "El formato por defecto",
 "Una tabla silver recibirá actualizaciones y borrados concurrentes, y los analistas necesitan consultar versiones anteriores. ¿Qué formato de tabla eliges?",
 ["Delta.", "Delta aporta transacciones ACID, UPDATE/DELETE/MERGE, schema enforcement y time travel; es el formato por defecto en Azure Databricks."],
 [["Parquet.", "Es el formato de archivo subyacente, pero sin registro de transacciones: sin ACID, sin MERGE eficiente y sin time travel."],
  ["CSV.", "Formato de texto sin tipos, sin transacciones y sin rendimiento analítico."],
  ["JSON.", "Útil como formato de origen semiestructurado, no como tabla analítica transaccional."]],
 "CSV, JSON y Parquet son sobre todo formatos de **origen**. Para tablas del lakehouse se usa **Delta** (por defecto) o **Iceberg administrado**. Schema enforcement, por ejemplo, no se aplica a tablas en formatos que no son Delta.",
 "Si el enunciado menciona ACID, MERGE, time travel o schema enforcement → Delta.",
 "sql", `CREATE TABLE prod.silver.pedidos (
  pedido_id BIGINT, cliente_id BIGINT, importe DECIMAL(12,2), fecha DATE
);   -- Delta es el formato por defecto

SELECT * FROM prod.silver.pedidos VERSION AS OF 12;`, ["History and data retention", "tables/history"]],

["3.1", "Elegir el formato de tabla (Iceberg)", "El motor externo que habla Iceberg",
 "Un equipo usa motores externos (por ejemplo Trino o Flink) que se integran mediante la API REST de catálogo de Iceberg y deben trabajar con tablas gobernadas por Unity Catalog. ¿Qué tipo de tabla es el más directo?",
 ["Una tabla Iceberg administrada (managed) en Unity Catalog.", "Las tablas Iceberg creadas en Unity Catalog son managed y pueden usarse desde motores externos compatibles con la API REST de catálogo de Iceberg."],
 [["Una tabla externa en CSV.", "Sin transacciones ni catálogo Iceberg."],
  ["Una vista materializada.", "Es un resultado precalculado, no un formato de tabla para motores externos."],
  ["Un foreign catalog hacia el motor externo.", "La federación lee de sistemas externos; aquí se quiere que el motor externo use tablas de Unity Catalog."]],
 "Azure Databricks soporta tablas **Iceberg administradas** en Unity Catalog, integradas con las funciones de la plataforma (Unity Catalog gestiona, por ejemplo, la expiración de snapshots y la compactación). También puede leer tablas Iceberg de catálogos externos como tablas foráneas.",
 "«Clientes Iceberg» o «Iceberg REST catalog» → tabla Iceberg managed. Sin ese requisito → Delta.",
 "sql", `CREATE TABLE prod.silver.eventos_iceberg (
  evento_id BIGINT, tipo STRING, ts TIMESTAMP
) USING ICEBERG;`, ["Iceberg", "iceberg/"]],

["3.1", "Diseñar el esquema de particionado", "¿Particiono esta tabla?",
 "Una tabla Delta nueva ocupará unos 200 GB. Un compañero propone particionarla por fecha «porque siempre se ha hecho así». ¿Qué indica la documentación?",
 ["No particionar tablas de menos de 1 TB; usar liquid clustering.", "La recomendación de tamaño mínimo es expresa: con menos de 1 TB, no particiones, y se recomienda liquid clustering para todas las tablas."],
 [["Particionar siempre por fecha: es la mejor práctica universal.", "No lo es: en tablas pequeñas el particionado suele perjudicar más de lo que ayuda."],
  ["Particionar por la columna de mayor cardinalidad.", "Es la peor elección: genera multitud de particiones diminutas."],
  ["Particionar por fecha y además definir CLUSTER BY.", "Liquid clustering no es compatible con el particionado."]],
 "Orientación de la documentación: **< 1 TB** no particionar; **1–100 TB** liquid clustering en lugar de particionado; **≥ 100 TB** el particionado podría ayudar, pero se recomienda probar antes liquid clustering. Si se particiona, cada partición debería tener **al menos 1 GB**.",
 "Tabla pequeña + propuesta de particionar → respuesta: no particionar / liquid clustering.",
 "sql", `CREATE TABLE prod.silver.movimientos (
  mov_id BIGINT, cuenta_id BIGINT, fecha DATE, importe DECIMAL(14,2)
)
CLUSTER BY (fecha, cuenta_id);`, ["Partitioning tables", "tables/partitions"]],

["3.1", "Diseñar la estrategia de clustering", "Que elija Databricks las claves",
 "Los patrones de consulta de una tabla cambian con frecuencia y nadie quiere mantener a mano las claves de clustering. ¿Qué opción existe y qué requiere?",
 ["`CLUSTER BY AUTO` (liquid clustering automático), disponible para tablas managed de Unity Catalog con predictive optimization.", "Predictive optimization selecciona y actualiza las claves de clustering según cambian las consultas; solo está disponible para tablas managed."],
 [["`OPTIMIZE … ZORDER BY AUTO`.", "No existe esa sintaxis; Z-order exige indicar columnas."],
  ["`PARTITIONED BY AUTO`.", "No existe; el particionado es estático."],
  ["`CLUSTER BY AUTO` sobre una tabla externa.", "El clustering automático depende de predictive optimization, que solo actúa en tablas managed."]],
 "Con **liquid clustering** las claves pueden redefinirse sin reescribir los datos existentes. **Automatic liquid clustering** va un paso más allá: predictive optimization analiza la carga de consultas y elige las claves.",
 "«Patrones cambiantes» + «sin mantenimiento manual» → CLUSTER BY AUTO en tabla managed.",
 "sql", `CREATE TABLE prod.silver.interacciones (
  usuario_id BIGINT, canal STRING, ts TIMESTAMP, detalle STRING
) CLUSTER BY AUTO;

ALTER TABLE prod.silver.pedidos CLUSTER BY AUTO;`, ["Liquid clustering", "tables/clustering"]],

["3.1", "Diseñar la estrategia de clustering (deletion vectors)", "Borrar una fila sin reescribir el archivo",
 "Un job ejecuta miles de DELETE y UPDATE pequeños sobre una tabla grande y cada operación reescribe archivos Parquet enteros. ¿Qué característica reduce ese costo?",
 ["Deletion vectors.", "Marcan las filas modificadas como borrados lógicos sin reescribir el archivo completo, acelerando DELETE, UPDATE y MERGE."],
 [["Z-ordering.", "Mejora el data skipping en lecturas; no evita la reescritura en modificaciones."],
  ["Particionar por la clave primaria.", "Crearía una partición por fila: inviable."],
  ["Change data feed.", "Expone los cambios para consumidores; no reduce el costo de escribirlos."]],
 "Sin **deletion vectors**, modificar una sola fila obliga a reescribir el archivo Parquet que la contiene. Con ellos, el cambio se registra como *soft-delete* y la reescritura física ocurre después (OPTIMIZE, auto-compaction o `REORG TABLE … APPLY (PURGE)`).",
 "«Muchos DELETE/UPDATE/MERGE pequeños y lentos» → deletion vectors.",
 "sql", `ALTER TABLE prod.silver.cuentas
  SET TBLPROPERTIES ('delta.enableDeletionVectors' = true);

DELETE FROM prod.silver.cuentas WHERE estado = 'CERRADA';`, ["Deletion vectors", "tables/features/deletion-vectors"]],

["3.1", "Elegir el tipo de SCD", "Corregir sin historia",
 "En la dimensión de productos, los cambios de descripción son correcciones de erratas y el negocio no necesita saber el valor anterior. ¿Qué tipo de SCD aplicas?",
 ["SCD Tipo 1: sobrescribir el valor.", "El Tipo 1 conserva solo el estado actual, que es justo lo que se necesita."],
 [["SCD Tipo 2: nueva fila con fechas de vigencia.", "Guardaría una historia que nadie necesita, complicando las consultas y aumentando el tamaño."],
  ["Tabla append-only con todos los eventos.", "Obligaría a deduplicar en cada lectura para obtener el estado actual."],
  ["No actualizar nunca la dimensión.", "Dejaría las erratas sin corregir."]],
 "**SCD Tipo 1**: el registro se actualiza en el sitio; no hay historia. **SCD Tipo 2**: cada cambio genera una nueva versión del registro con periodo de vigencia. La elección depende de si el negocio necesita analizar los hechos con el valor vigente en su momento.",
 "«No interesa el valor anterior / corrección» → Tipo 1. «Auditoría / histórico / a fecha de» → Tipo 2.",
 "sql", `CREATE OR REFRESH STREAMING TABLE silver.dim_producto;

CREATE FLOW flujo_dim_producto AS AUTO CDC INTO silver.dim_producto
FROM STREAM(bronze.productos_cdc)
KEYS (producto_id)
SEQUENCE BY ts_cambio
STORED AS SCD TYPE 1;`, ["AUTO CDC", "ldp/cdc"]],

["3.1", "Elegir la granularidad", "El grano de la tabla de hechos",
 "Hoy el negocio solo pide ventas diarias por tienda, pero el año que viene quiere analizar por producto y por ticket. Los datos de origen llegan por línea de ticket. ¿Con qué granularidad guardas la tabla de hechos silver?",
 ["Por línea de ticket (el nivel más fino disponible), y se agrega en gold.", "Desde el grano más fino se puede agregar a cualquier nivel; al revés es imposible."],
 [["Agregada por día y tienda, para ahorrar espacio.", "Destruye el detalle: no se podrá desagregar por producto ni por ticket."],
  ["Agregada por mes.", "Aún menos detalle del que ya se pide hoy."],
  ["Una fila por tienda con un array de todas sus ventas.", "Dificulta filtros, joins y agregaciones."]],
 "La **granularidad** (el *grano*) define qué representa una fila. Regla de modelado: almacenar los hechos al nivel atómico que el negocio pueda necesitar y construir agregados encima (capa gold, vistas materializadas).",
 "Se puede agregar hacia arriba, nunca desagregar hacia abajo → guarda el grano fino.",
 "sql", `-- silver: una fila por línea de ticket
CREATE TABLE prod.silver.ventas_linea (
  ticket_id BIGINT, linea INT, tienda_id INT, producto_id BIGINT,
  ts_venta TIMESTAMP, cantidad INT, importe DECIMAL(12,2)
);

-- gold: agregado diario por tienda
CREATE MATERIALIZED VIEW prod.gold.ventas_dia_tienda AS
SELECT tienda_id, CAST(ts_venta AS DATE) AS dia, SUM(importe) AS total
FROM prod.silver.ventas_linea GROUP BY tienda_id, CAST(ts_venta AS DATE);`, ["Data modeling", "transform/data-modeling"]],

["3.1", "Diseñar una tabla temporal (historia)", "Time travel no es un archivo",
 "Auditoría exige consultar cómo era cada registro de clientes en cualquier fecha de los últimos 5 años. Un compañero propone «usar time travel de Delta». ¿Qué respondes?",
 ["Modelar una tabla de historia (SCD Tipo 2 con vigencias); el time travel no es una solución de archivo a largo plazo.", "La documentación advierte expresamente contra usar el historial de la tabla como copia de seguridad o archivo a largo plazo."],
 [["Correcto: basta con no ejecutar nunca VACUUM.", "Acumular 5 años de archivos y de log degrada costo y rendimiento, y depende de configuraciones de retención que la documentación desaconseja usar como archivo."],
  ["Correcto: time travel conserva todas las versiones para siempre por defecto.", "Falso: por defecto, la retención de archivos eliminados es de 7 días y la del log de 30."],
  ["Exportar la tabla a CSV cada día.", "Miles de copias sin gobierno ni consulta eficiente."]],
 "El **time travel** sirve para auditoría reciente, recuperación de errores y reproducibilidad a corto plazo. La **historia de negocio** se modela explícitamente: filas versionadas con inicio y fin de vigencia (SCD 2), que se consultan con SQL normal.",
 "«Historia de años», «a fecha de» como requisito de negocio → tabla de historia/SCD 2. Time travel = corto plazo.",
 "sql", `SELECT cliente_id, direccion, __START_AT, __END_AT
FROM prod.silver.dim_cliente
WHERE cliente_id = 1042
  AND __START_AT <= '2023-06-30'
  AND (__END_AT > '2023-06-30' OR __END_AT IS NULL);`, ["History and data retention", "tables/history"]],

["3.1", "Elegir entre tablas managed y no managed", "Cuándo sí una tabla externa",
 "¿En cuál de estos casos recomienda la documentación usar una tabla externa en lugar de una managed?",
 ["Cuando clientes ajenos a Databricks necesitan acceso directo a los archivos de datos.", "Es el caso de uso documentado; con la advertencia de que los privilegios de Unity Catalog no se aplican a quien accede directamente a los archivos."],
 [["Cuando se quiere el mejor rendimiento con optimización automática.", "Eso es precisamente lo que ofrecen las tablas managed (predictive optimization)."],
  ["Siempre que la tabla supere 1 TB.", "El tamaño no determina el tipo de tabla."],
  ["Cuando la tabla tiene row filters.", "Los controles de acceso no exigen que la tabla sea externa."]],
 "Las **tablas managed** son el tipo por defecto y recomendado: Unity Catalog gestiona lectura, escritura, almacenamiento y optimización. Las **externas** guardan los datos en una ubicación de tu tenant registrada como external location; al eliminarlas, los archivos permanecen.",
 "Por defecto managed. Externa solo con requisito explícito de acceso directo a los archivos o de datos preexistentes en una ruta.",
 "sql", `CREATE TABLE prod.intercambio.posiciones (
  cuenta_id BIGINT, fecha DATE, saldo DECIMAL(16,2)
)
LOCATION 'abfss://intercambio@contosolake.dfs.core.windows.net/posiciones/';`, ["External tables", "tables/external"]],

["3.1", "Diseñar el modelado de datos", "¿Tercera forma normal?",
 "Vas a diseñar la capa gold de un lakehouse nuevo para analítica. ¿Qué enfoque de modelado recomienda la documentación?",
 ["Un modelo dimensional (estrella o copo de nieve), evitando modelos muy normalizados.", "La documentación desaconseja modelos fuertemente normalizados como 3NF e indica que estrella y copo de nieve rinden bien al requerir menos joins."],
 [["Tercera forma normal estricta, como en un OLTP.", "Multiplica los joins en consultas analíticas; es justo lo que se desaconseja."],
  ["Una única tabla con todas las columnas como STRING.", "Sin tipos se pierden validación, estadísticas y rendimiento."],
  ["Una tabla por informe.", "Duplica lógica y datos; inmantenible."]],
 "En un modelo **estrella**, las tablas de **hechos** (medidas, a un grano definido) se relacionan con **dimensiones** (contexto descriptivo). Menos joins y más columnas por tabla permiten al optimizador aprovechar el data skipping.",
 "Analítica en el lakehouse → hechos y dimensiones. 3NF es para sistemas transaccionales.",
 "sql", `SELECT d.categoria, t.region, SUM(f.importe) AS ventas
FROM prod.gold.fact_ventas f
JOIN prod.gold.dim_producto d ON f.producto_id = d.producto_id
JOIN prod.gold.dim_tienda   t ON f.tienda_id   = t.tienda_id
GROUP BY d.categoria, t.region;`, ["Data modeling", "transform/data-modeling"]],

["3.1", "Elegir el método de carga (batch o streaming)", "Una vez al día basta",
 "Un proveedor deposita un lote de archivos cada noche. El negocio consulta los datos a la mañana siguiente. ¿Qué método de carga es el adecuado?",
 ["Carga incremental por lotes programada (por ejemplo, Auto Loader con trigger `availableNow`).", "Procesa todo lo nuevo y termina: procesamiento incremental sin pagar cómputo encendido todo el día."],
 [["Un stream continuo activo las 24 horas.", "Paga cómputo permanente por datos que llegan una vez al día y se consumen al día siguiente."],
  ["Recargar todo el histórico cada noche con overwrite.", "El costo crece con el histórico; no es incremental."],
  ["Cargar los archivos a mano desde la UI.", "No es automatizable ni fiable."]],
 "La elección entre batch y streaming la dicta el **requisito de frescura**. Con Structured Streaming se puede obtener lo mejor de ambos: semántica incremental y exactly-once, ejecutada como job programado mediante el trigger `availableNow`.",
 "Latencia de horas/días → batch o incremental programado. Latencia de segundos/minutos → streaming continuo.",
 "python", `(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .option("cloudFiles.schemaLocation", "/Volumes/prod/bronze/_estado/prov/schema")
    .load("/Volumes/prod/landing/proveedor/")
 .writeStream
    .option("checkpointLocation", "/Volumes/prod/bronze/_estado/prov/checkpoint")
    .trigger(availableNow=True)
    .toTable("prod.bronze.proveedor"))`, ["Trigger intervals", "structured-streaming/triggers"]],

/* ───── 3.2 Ingest data into Unity Catalog ───── */
["3.2", "Ingerir datos con Lakeflow Connect", "Salesforce sin escribir un conector",
 "Necesitas ingerir objetos de Salesforce al lakehouse de forma incremental, con el mínimo código y mantenimiento. ¿Qué herramienta eliges?",
 ["Un conector SaaS administrado de Lakeflow Connect.", "Lakeflow Connect ofrece conectores totalmente administrados para aplicaciones empresariales como Salesforce, con gobierno de Unity Catalog."],
 [["Un notebook que llame a la API REST de Salesforce y gestione la paginación y el estado.", "Funciona, pero es código propio que mantener: lo contrario de «mínimo código»."],
  ["`COPY INTO` apuntando a Salesforce.", "COPY INTO carga archivos de almacenamiento en la nube, no APIs SaaS."],
  ["Auto Loader apuntando a Salesforce.", "Auto Loader ingiere archivos de almacenamiento de objetos."]],
 "**Lakeflow Connect** agrupa conectores por tipo de origen: SaaS, bases de datos, archivos y streaming. Los conectores SaaS usan una conexión, un pipeline de ingesta y tablas de destino (streaming tables), con lecturas y escrituras incrementales.",
 "«SaaS» + «mínimo código / administrado» → Lakeflow Connect.",
 "yaml", `resources:
  pipelines:
    ingesta_salesforce:
      name: ingesta_salesforce
      catalog: prod
      schema: bronze
      ingestion_definition:
        connection_name: salesforce_conn
        objects:
          - table:
              source_schema: objects
              source_table: Account
              destination_catalog: prod
              destination_schema: bronze`, ["Lakeflow Connect concepts", "ingestion/lakeflow-connect/"]],

["3.2", "Ingerir datos con Lakeflow Connect (bases de datos)", "Las piezas del conector de base de datos",
 "Vas a ingerir con CDC desde SQL Server mediante un conector de base de datos de Lakeflow Connect. Frente a un conector SaaS, ¿qué componentes adicionales intervienen?",
 ["Un ingestion gateway y almacenamiento de staging.", "Los conectores de base de datos incluyen ambos para soportar la captura continua de cambios."],
 [["Un SQL warehouse dedicado por tabla.", "No forma parte de la arquitectura del conector."],
  ["Un clúster all-purpose siempre encendido gestionado por el usuario.", "La ingesta la ejecutan pipelines administrados."],
  ["Ninguno: todos los conectores tienen exactamente los mismos componentes.", "La documentación distingue los componentes según el tipo de conector."]],
 "Conectores **SaaS y de archivos**: conexión + pipeline de ingesta + tablas de destino. Conectores **de base de datos (CDC)**: además, un *ingestion gateway* que extrae los cambios y un *staging storage* donde se depositan antes de aplicarlos. Los conectores basados en consulta leen directamente de la base sin gateway.",
 "CDC desde una base de datos con Lakeflow Connect → gateway + staging + pipeline de ingesta.",
 "sql", `-- La conexión se registra en Unity Catalog
CREATE CONNECTION sqlserver_erp TYPE sqlserver
OPTIONS (
  host 'erp.database.windows.net', port '1433',
  user secret('kv-plataforma', 'erp-user'),
  password secret('kv-plataforma', 'erp-password')
);`, ["Lakeflow Connect concepts", "ingestion/lakeflow-connect/"]],

["3.2", "Ingerir con métodos SQL (COPY INTO)", "Ejecutarlo dos veces",
 "Un job ejecuta `COPY INTO` sobre una carpeta. Por un reintento, la misma sentencia se ejecuta dos veces seguidas sin que lleguen archivos nuevos. ¿Qué ocurre en la segunda ejecución?",
 ["No se carga nada: COPY INTO es idempotente y omite los archivos ya cargados.", "La documentación lo describe como reintentable e idempotente."],
 [["Se duplican todas las filas.", "Ocurriría con un INSERT desde `read_files`, pero no con COPY INTO."],
  ["Falla porque los archivos ya fueron procesados.", "No falla; simplemente los omite."],
  ["Sobrescribe la tabla con el mismo contenido.", "COPY INTO añade datos; no sobrescribe."]],
 "**COPY INTO** carga archivos de una ubicación en una tabla Delta llevando el registro de los ya cargados. Para forzar la recarga existe la opción `force` en `COPY_OPTIONS`. Con `mergeSchema` puede evolucionar el esquema, incluso partiendo de una tabla vacía sin columnas.",
 "COPY INTO = SQL + idempotente. Para cargas masivas y continuas de archivos, Auto Loader.",
 "sql", `CREATE TABLE IF NOT EXISTS prod.bronze.facturas;

COPY INTO prod.bronze.facturas
FROM '/Volumes/prod/landing/facturas/'
FILEFORMAT = CSV
FORMAT_OPTIONS ('header' = 'true', 'inferSchema' = 'true', 'mergeSchema' = 'true')
COPY_OPTIONS ('mergeSchema' = 'true');`, ["COPY INTO", "ingestion/cloud-object-storage/copy-into/"]],

["3.2", "Ingerir con métodos SQL (CTAS / CREATE OR REPLACE)", "Reconstruir sin perder la tabla",
 "Un job reconstruye por completo una tabla gold cada noche. Debe conservarse el historial de versiones y los permisos, y los lectores no deben encontrarse con que la tabla «no existe». ¿Qué sentencia usas?",
 ["`CREATE OR REPLACE TABLE … AS SELECT …`.", "Reemplaza el contenido en una sola transacción manteniendo la identidad de la tabla, su historial y sus privilegios."],
 [["`DROP TABLE` seguido de `CREATE TABLE … AS SELECT`.", "Entre ambas sentencias la tabla no existe, y se pierden historial y privilegios concedidos."],
  ["`CREATE TABLE IF NOT EXISTS … AS SELECT`.", "Si la tabla ya existe no hace nada: los datos no se actualizan."],
  ["`COPY INTO` desde la propia tabla.", "COPY INTO carga archivos nuevos; no reconstruye."]],
 "**CTAS** (`CREATE TABLE … AS SELECT`) crea y puebla una tabla nueva. **CREATE OR REPLACE TABLE** reemplaza de forma atómica definición y contenido de una tabla existente; la versión anterior sigue disponible con time travel. Es la práctica recomendada frente a borrar y recrear.",
 "Reemplazo total recurrente → CREATE OR REPLACE TABLE. Nunca DROP + CREATE.",
 "sql", `CREATE OR REPLACE TABLE prod.gold.resumen_clientes AS
SELECT cliente_id, COUNT(*) AS pedidos, SUM(importe) AS total
FROM prod.silver.pedidos
GROUP BY cliente_id;

DESCRIBE HISTORY prod.gold.resumen_clientes;`, ["Delta Lake best practices", "delta/best-practices"]],

["3.2", "Ingerir con Auto Loader (detección de archivos)", "Cómo descubre archivos nuevos",
 "¿Qué modo de detección de archivos usa Auto Loader por defecto y cuál recomienda la documentación para la mayoría de cargas?",
 ["Por defecto, listado de directorios; se recomienda el modo de notificación de archivos con file events.", "La documentación indica ambas cosas: directory listing es el valor por defecto y file notification con file events es más eficiente y escalable."],
 [["Por defecto, notificación de archivos; se recomienda listado de directorios.", "Es exactamente al revés."],
  ["Solo existe el listado de directorios.", "Hay dos modos, y se puede cambiar de uno a otro entre reinicios conservando exactly-once."],
  ["Auto Loader relee todos los archivos en cada ejecución.", "Persiste los metadatos de los archivos descubiertos en el checkpoint para procesar cada uno una sola vez."]],
 "**Directory listing**: lista el directorio de entrada; no requiere más permisos que el acceso a los datos. **File notification**: se apoya en servicios de notificación y colas de la nube; con *file events* habilitados en la external location es el modo más eficiente.",
 "Auto Loader: por defecto lista directorios; para gran escala, notificaciones con file events.",
 "python", `(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.useManagedFileEvents", "true")   # file events de la external location
    .option("cloudFiles.schemaLocation", "/Volumes/prod/bronze/_estado/ev/schema")
    .load("abfss://landing@contosolake.dfs.core.windows.net/eventos/"))`, ["Auto Loader file detection modes", "ingestion/cloud-object-storage/auto-loader/file-detection-modes"]],

["3.2", "Ingerir con Auto Loader (inferencia de esquema)", "Todo llegó como STRING",
 "Tras ingerir JSON con Auto Loader e inferencia de esquema, todas las columnas —incluidos importes y fechas— quedaron como STRING. ¿Por qué y cómo se corrige?",
 ["Para formatos sin tipos (JSON, CSV, XML) Auto Loader infiere todo como STRING por defecto; se activa `cloudFiles.inferColumnTypes` o se dan `schemaHints`.", "Es el comportamiento por defecto documentado, pensado para evitar problemas de evolución por discrepancias de tipo."],
 [["Es un error del archivo: JSON no admite números.", "JSON sí distingue números; lo que cambia es la decisión de inferencia de Auto Loader."],
  ["Hay que usar `format(\"json\")` en lugar de `cloudFiles`.", "Se perdería Auto Loader; no es la corrección."],
  ["Hay que ejecutar OPTIMIZE para que se detecten los tipos.", "OPTIMIZE compacta archivos; no cambia tipos."]],
 "Para inferir el esquema, Auto Loader muestrea los primeros 50 GB o 1000 archivos (lo que ocurra antes) y guarda el resultado en `cloudFiles.schemaLocation`. Con `cloudFiles.inferColumnTypes = true` infiere tipos como el DataFrameReader; `cloudFiles.schemaHints` fija el tipo de columnas concretas.",
 "Auto Loader + JSON/CSV + «todo es STRING» → inferColumnTypes o schemaHints.",
 "python", `(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", ruta_schema)
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaHints", "importe DECIMAL(12,2), fecha DATE")
    .load(ruta_origen))`, ["Auto Loader schema inference and evolution", "ingestion/cloud-object-storage/auto-loader/schema"]],

["3.2", "Ingerir con Auto Loader (evolución de esquema)", "Que el stream no se detenga",
 "Un stream de Auto Loader se detiene cada vez que el origen añade una columna. El equipo quiere que nunca se detenga por cambios de esquema y que los datos de las columnas nuevas no se pierdan. ¿Qué modo de evolución configuras?",
 ["`rescue`: el esquema no evoluciona y las columnas nuevas se guardan en la columna de datos rescatados.", "En modo rescue el stream no falla por cambios de esquema y todo lo nuevo queda en la columna de datos rescatados."],
 [["`addNewColumns` (por defecto).", "Es el comportamiento actual: el stream falla al detectar columnas nuevas y las incorpora al reiniciarse."],
  ["`failOnNewColumns`.", "El stream falla y no se reinicia hasta que se actualiza el esquema o se elimina el archivo."],
  ["`none`.", "No evoluciona el esquema y las columnas nuevas se ignoran: los datos se pierden salvo que se configure la columna de rescate."]],
 "Modos de `cloudFiles.schemaEvolutionMode`: **addNewColumns** (por defecto sin esquema explícito; falla y evoluciona al reiniciar), **addNewColumnsWithTypeWidening**, **rescue** (nunca evoluciona ni falla; lo inesperado va a `_rescued_data`), **failOnNewColumns** y **none**.",
 "«Nunca detenerse» + «no perder datos» → rescue. «Incorporar columnas automáticamente» → addNewColumns con reinicio automático del job.",
 "python", `(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", ruta_schema)
    .option("cloudFiles.schemaEvolutionMode", "rescue")
    .load(ruta_origen))
# Los campos no previstos quedan en la columna _rescued_data`, ["Auto Loader schema inference and evolution", "ingestion/cloud-object-storage/auto-loader/schema"]],

["3.2", "Ingerir datos de streaming desde Azure Event Hubs", "Event Hubs habla Kafka",
 "Debes leer eventos de Azure Event Hubs con Structured Streaming (o en un pipeline de Lakeflow) usando solo lo incluido en Databricks Runtime. ¿Qué conector y endpoint usas?",
 ["El conector Kafka, contra el endpoint compatible con Kafka `<namespace>.servicebus.windows.net:9093`.", "Event Hubs expone un endpoint compatible con Apache Kafka y el conector Kafka de Structured Streaming viene incluido en Databricks Runtime."],
 [["El conector `eventhubs` de Structured Streaming, incluido por defecto.", "Esa librería no forma parte de Databricks Runtime, y los pipelines de Lakeflow no permiten librerías JVM de terceros."],
  ["Auto Loader con `cloudFiles.format = eventhubs`.", "Auto Loader ingiere archivos, no mensajes de un bus."],
  ["`COPY INTO` desde la URL del event hub.", "COPY INTO carga archivos."]],
 "Configuración típica: `kafka.bootstrap.servers` = `<namespace>.servicebus.windows.net:9093`, `subscribe` = nombre del event hub, `kafka.security.protocol` = `SASL_SSL` y el mecanismo SASL correspondiente. Las credenciales deben venir de un secret scope.",
 "Event Hubs en Databricks → `format(\"kafka\")` y puerto 9093.",
 "python", `conn = dbutils.secrets.get("kv-plataforma", "eventhubs-connection-string")

df = (spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "contoso-eh.servicebus.windows.net:9093")
    .option("subscribe", "telemetria")
    .option("kafka.security.protocol", "SASL_SSL")
    .option("kafka.sasl.mechanism", "PLAIN")
    .option("kafka.sasl.jaas.config",
            'kafkashaded.org.apache.kafka.common.security.plain.PlainLoginModule required '
            f'username="$ConnectionString" password="{conn}";')
    .load())`, ["Azure Event Hubs as a pipeline source", "ldp/event-hubs"]],

["3.2", "Ingerir con Spark Structured Streaming (triggers)", "Procesar lo pendiente y parar",
 "Un job horario debe procesar con Structured Streaming todos los datos nuevos disponibles y terminar, para no mantener cómputo encendido. ¿Qué trigger configuras?",
 ["`trigger(availableNow=True)`.", "Procesa todos los datos disponibles en el momento del arranque (en varios micro-lotes si hace falta) y se detiene."],
 [["Ninguno (trigger por defecto).", "El comportamiento por defecto mantiene el stream en ejecución procesando micro-lotes de forma continua."],
  ["`trigger(processingTime='1 hour')`.", "El stream sigue activo y el cómputo encendido entre micro-lotes."],
  ["`trigger(continuous='1 second')`.", "El modo continuo es experimental y la documentación indica que no está soportado."]],
 "Triggers: **por defecto** (micro-lotes tan pronto como sea posible), **processingTime** (intervalo fijo), **availableNow** (todo lo pendiente y termina) y el **modo de tiempo real** para latencias por debajo del segundo.",
 "«Programado», «termina al acabar», «batch incremental» → availableNow.",
 "python", `(df.writeStream
   .option("checkpointLocation", "/Volumes/prod/silver/_estado/pedidos/checkpoint")
   .trigger(availableNow=True)
   .toTable("prod.silver.pedidos"))`, ["Trigger intervals", "structured-streaming/triggers"]],

["3.2", "Ingerir con Spark Structured Streaming (checkpoints)", "Dos streams, un checkpoint",
 "Para «simplificar», un ingeniero configura dos consultas de streaming distintas con la misma `checkpointLocation`. ¿Cuál es el problema?",
 ["Cada consulta debe tener su propia ubicación de checkpoint; nunca deben compartirla.", "El checkpoint guarda la identidad de la consulta, su progreso y su estado; compartirlo corrompe el seguimiento de ambas."],
 [["Ninguno: compartir checkpoint reduce el almacenamiento.", "Rompe las garantías de procesamiento."],
  ["Solo es un problema si escriben en la misma tabla.", "Es un problema siempre, con independencia del destino."],
  ["El checkpoint solo es necesario en la primera ejecución.", "Es necesario durante toda la vida del stream para reanudar donde se quedó."]],
 "El **checkpoint** y los *write-ahead logs* dan a Structured Streaming tolerancia a fallos y garantías de procesamiento: registra los offsets procesados y el estado de los operadores con estado. Borrarlo equivale a empezar de cero.",
 "Un stream ↔ un checkpoint. Checkpoint compartido o borrado = pérdida de garantías.",
 "python", `base = "/Volumes/prod/silver/_estado"

q1 = (pedidos.writeStream
        .option("checkpointLocation", f"{base}/pedidos/checkpoint")
        .toTable("prod.silver.pedidos"))

q2 = (pagos.writeStream
        .option("checkpointLocation", f"{base}/pagos/checkpoint")
        .toTable("prod.silver.pagos"))`, ["Checkpoints", "structured-streaming/checkpoints"]],

["3.2", "Ingerir datos con un feed CDC (change data feed)", "Leer solo lo que cambió",
 "Un proceso downstream debe leer únicamente las filas insertadas, actualizadas o borradas de una tabla Delta desde su última ejecución. ¿Qué característica usas?",
 ["Change data feed, leyéndolo con `table_changes()` o la opción `readChangeFeed`.", "El change data feed expone los cambios a nivel de fila entre versiones de una tabla Delta."],
 [["`DESCRIBE HISTORY`.", "Lista las operaciones y versiones, pero no devuelve las filas cambiadas."],
  ["Comparar dos copias completas con EXCEPT en cada ejecución.", "Costoso: lee ambas versiones enteras."],
  ["Deletion vectors.", "Optimizan cómo se escriben los borrados; no exponen cambios a los consumidores."]],
 "Con **change data feed** activo, cada cambio se registra con metadatos (`_change_type`, `_commit_version`, `_commit_timestamp`). Se lee en batch con `table_changes('tabla', versión_inicial)` o en streaming con `.option(\"readChangeFeed\", \"true\")`.",
 "«Solo los cambios» de una tabla Delta → change data feed.",
 "sql", `ALTER TABLE prod.silver.clientes
  SET TBLPROPERTIES (delta.enableChangeDataFeed = true);

SELECT cliente_id, email, _change_type, _commit_version
FROM table_changes('prod.silver.clientes', 25);`, ["Change data feed", "tables/features/change-data-feed"]],

["3.2", "Ingerir con Spark Structured Streaming (foreachBatch)", "MERGE dentro de un stream",
 "Debes aplicar un MERGE (upsert) a una tabla Delta desde una consulta de Structured Streaming escrita en un notebook. ¿Cómo se hace y qué garantía ofrece?",
 ["Con `foreachBatch`, que aplica el MERGE a cada micro-lote; ofrece garantía at-least-once, así que la lógica debe ser idempotente.", "La documentación indica que foreachBatch es necesario para el MERGE en Structured Streaming y que solo garantiza at-least-once."],
 [["Con `.writeStream.format(\"delta\").outputMode(\"merge\")`.", "No existe un modo de salida «merge»."],
  ["No es posible hacer upserts desde streaming.", "Sí lo es, mediante foreachBatch (o con AUTO CDC en un pipeline)."],
  ["Con `foreachBatch`, que garantiza exactly-once sin más consideraciones.", "La garantía es at-least-once; para exactly-once hay que deduplicar usando el batchId o hacer la operación idempotente."]],
 "`foreachBatch(func)` invoca una función con el DataFrame del micro-lote y su `batchId`, permitiendo usar operaciones batch (como MERGE) sobre la salida de un stream. Un MERGE por clave es naturalmente idempotente, lo que lo hace adecuado para este patrón.",
 "Upsert desde streaming en notebook → foreachBatch + MERGE. En pipeline declarativo → AUTO CDC.",
 "python", `from delta.tables import DeltaTable

def upsert(microlote, batch_id):
    destino = DeltaTable.forName(spark, "prod.silver.clientes")
    (destino.alias("t")
        .merge(microlote.dropDuplicates(["cliente_id"]).alias("s"), "t.cliente_id = s.cliente_id")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute())

(cambios.writeStream
    .foreachBatch(upsert)
    .option("checkpointLocation", "/Volumes/prod/silver/_estado/clientes/checkpoint")
    .trigger(availableNow=True)
    .start())`, ["foreachBatch", "structured-streaming/foreach"]],

["3.2", "Ingerir con Lakeflow Spark Declarative Pipelines y Auto Loader", "Lo que el pipeline gestiona por ti",
 "Al usar Auto Loader dentro de un pipeline declarativo de Lakeflow, ¿qué configuración deja de ser necesaria respecto a un notebook con Structured Streaming?",
 ["La ubicación del esquema y la del checkpoint: el pipeline las gestiona automáticamente.", "La documentación indica que no hace falta proporcionar esquema ni checkpoint location porque los pipelines administran esos ajustes."],
 [["El formato de los archivos (`cloudFiles.format`).", "El formato del origen siempre hay que indicarlo."],
  ["La ruta de origen.", "El pipeline no puede adivinar de dónde leer."],
  ["Los privilegios sobre el almacenamiento.", "El acceso sigue gobernado por Unity Catalog."]],
 "Databricks recomienda **Auto Loader en pipelines de Lakeflow** para la ingesta incremental. En SQL se expresa con `STREAM read_files(...)` y en Python con `spark.readStream.format(\"cloudFiles\")` dentro de una función decorada con `@dp.table`.",
 "Auto Loader en notebook → tú gestionas schemaLocation y checkpoint. En pipeline declarativo → los gestiona la plataforma.",
 "python", `from pyspark import pipelines as dp

@dp.table(comment="Pedidos crudos desde la zona de aterrizaje")
def bronze_pedidos():
    return (spark.readStream.format("cloudFiles")
              .option("cloudFiles.format", "json")
              .load("/Volumes/prod/landing/pedidos/"))`, ["Auto Loader", "ingestion/cloud-object-storage/auto-loader/"]]
]);
