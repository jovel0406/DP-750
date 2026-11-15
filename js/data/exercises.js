/* Acciones de Ingeniero: ejercicios interactivos sobre código real.
   type "line": hay que hacer clic en la línea defectuosa (bug = índices de línea válidos, base 0).
   type "fill": hay que colocar palabras clave en los huecos [[0]], [[1]]… (answers en ese orden).
   Todos llevan pistas progresivas, explicación, corrección y heurística. */
window.DP750 = window.DP750 || {};
DP750.EXERCISES = [

/* ══════════ CLIC EN LA LÍNEA CON EL BUG ══════════ */
{ id: "x-l-01", type: "line", skill: "2.1", lang: "sql", title: "SELECT concedido, acceso denegado",
  brief: "El grupo `analistas` debe poder leer `prod.gold.ventas`. Tras ejecutar este script siguen recibiendo un error de permisos. Haz clic en la línea que lo provoca.",
  code: `GRANT USE CATALOG ON CATALOG dev TO \`analistas\`;
GRANT USE SCHEMA  ON SCHEMA prod.gold TO \`analistas\`;
GRANT SELECT      ON TABLE prod.gold.ventas TO \`analistas\`;

SELECT * FROM prod.gold.ventas;`,
  bug: [0],
  notes: { 2: "El SELECT sobre la tabla es correcto y necesario; lo que falla es poder llegar hasta ella.", 1: "USE SCHEMA está sobre el esquema correcto." },
  hints: ["Para leer una tabla hacen falta tres privilegios, uno por cada nivel de la jerarquía.", "Comprueba que cada GRANT apunta al objeto correcto: catálogo, esquema y tabla deben pertenecer a la misma ruta.", "Mira el nombre del catálogo en el primer GRANT."],
  explain: "`USE CATALOG` se concedió sobre `dev`, pero la tabla vive en `prod`. Sin `USE CATALOG` sobre `prod`, el SELECT sobre la tabla no sirve: Unity Catalog exige los privilegios de uso sobre **todos** los contenedores padres.",
  fix: `GRANT USE CATALOG ON CATALOG prod TO \`analistas\`;
GRANT USE SCHEMA  ON SCHEMA prod.gold TO \`analistas\`;
GRANT SELECT      ON TABLE prod.gold.ventas TO \`analistas\`;`,
  heuristic: "«Tiene SELECT pero no puede leer» → revisa USE CATALOG y USE SCHEMA, y que sean del catálogo y esquema correctos.",
  ref: ["Permissions concepts", "data-governance/unity-catalog/access-control/permissions-concepts"] },

{ id: "x-l-02", type: "line", skill: "3.2", lang: "python", title: "El Auto Loader que no era Auto Loader",
  brief: "Este stream debe ingerir JSON con Auto Loader. Falla al arrancar indicando que no reconoce las opciones `cloudFiles`. Haz clic en la línea defectuosa.",
  code: `(spark.readStream
    .format("json")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/Volumes/prod/bronze/_estado/ev/schema")
    .load("/Volumes/prod/landing/eventos/")
 .writeStream
    .option("checkpointLocation", "/Volumes/prod/bronze/_estado/ev/checkpoint")
    .trigger(availableNow=True)
    .toTable("prod.bronze.eventos"))`,
  bug: [1],
  notes: { 2: "`cloudFiles.format` es correcto: indica el formato de los archivos de origen.", 7: "`availableNow` es un trigger válido y recomendado para ejecuciones programadas.", 6: "El checkpoint va en el writeStream: está bien colocado." },
  hints: ["Las opciones que empiezan por `cloudFiles.` solo las entiende un origen concreto.", "El formato de los archivos y el nombre del origen de streaming son dos cosas distintas.", "Auto Loader se invoca con `.format(\"cloudFiles\")`; el formato de los archivos va en `cloudFiles.format`."],
  explain: "El origen de Auto Loader se llama `cloudFiles`. Con `.format(\"json\")` se usa el origen de archivos nativo de Structured Streaming, que no conoce las opciones `cloudFiles.*` ni ofrece inferencia y evolución de esquema.",
  fix: `(spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/Volumes/prod/bronze/_estado/ev/schema")
    .load("/Volumes/prod/landing/eventos/")
 .writeStream
    .option("checkpointLocation", "/Volumes/prod/bronze/_estado/ev/checkpoint")
    .trigger(availableNow=True)
    .toTable("prod.bronze.eventos"))`,
  heuristic: "Auto Loader = `format(\"cloudFiles\")` + `cloudFiles.format` + `cloudFiles.schemaLocation` + `checkpointLocation`.",
  ref: ["Auto Loader", "ingestion/cloud-object-storage/auto-loader/"] },

{ id: "x-l-03", type: "line", skill: "3.4", lang: "sql", title: "El pipeline que se detiene por una fila",
  brief: "Requisito: las filas con `importe` negativo deben **descartarse** y el pipeline debe **continuar**. Hoy la actualización falla entera cuando aparece una. Haz clic en la línea responsable.",
  code: `CREATE OR REFRESH STREAMING TABLE silver_pedidos (
  CONSTRAINT id_valido      EXPECT (pedido_id IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT importe_valido EXPECT (importe >= 0)          ON VIOLATION FAIL UPDATE
)
AS SELECT pedido_id, cliente_id, importe
FROM STREAM(bronze_pedidos);`,
  bug: [2],
  notes: { 1: "Esta expectativa descarta la fila y deja continuar: cumple el requisito." },
  hints: ["Hay tres acciones posibles ante una violación: advertir, descartar o fallar.", "Busca la expectativa cuya acción detiene la actualización.", "`FAIL UPDATE` hace fallar la actualización; el requisito pide `DROP ROW`."],
  explain: "`ON VIOLATION FAIL UPDATE` impide que la actualización termine cuando hay un registro inválido. Para descartar y continuar se usa `ON VIOLATION DROP ROW`.",
  fix: `CREATE OR REFRESH STREAMING TABLE silver_pedidos (
  CONSTRAINT id_valido      EXPECT (pedido_id IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT importe_valido EXPECT (importe >= 0)          ON VIOLATION DROP ROW
)
AS SELECT pedido_id, cliente_id, importe
FROM STREAM(bronze_pedidos);`,
  heuristic: "Registrar → EXPECT · descartar → DROP ROW · detener → FAIL UPDATE.",
  ref: ["Pipeline expectations", "ldp/expectations"] },

{ id: "x-l-04", type: "line", skill: "4.3", lang: "yaml", title: "Producción con prefijo [dev]",
  brief: "Tras `databricks bundle deploy -t prod`, el job aparece como `[dev maria] ventas_diario` y con el schedule en pausa. Haz clic en la línea que lo causa.",
  code: `bundle:
  name: ventas_etl

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-1111111111111111.1.azuredatabricks.net
  prod:
    mode: development
    workspace:
      host: https://adb-2222222222222222.2.azuredatabricks.net
    run_as:
      service_principal_name: "00000000-0000-0000-0000-000000000000"`,
  bug: [10],
  notes: { 5: "En el target `dev` el modo development es lo correcto.", 6: "`default: true` solo indica el target cuando no se pasa `-t`.", 14: "`run_as` con service principal es la práctica recomendada en producción." },
  hints: ["El prefijo `[dev usuario]` y la pausa de schedules son comportamientos de un modo de despliegue.", "Fíjate en el modo de cada target.", "El target `prod` no debería estar en modo development."],
  explain: "`mode: development` antepone `[dev <usuario>]` a los recursos y pausa schedules y triggers. En el target de producción debe ser `mode: production`.",
  fix: `  prod:
    mode: production
    workspace:
      host: https://adb-2222222222222222.2.azuredatabricks.net
    run_as:
      service_principal_name: "00000000-0000-0000-0000-000000000000"`,
  heuristic: "«Prefijo [dev …]» o «schedule en pausa» tras desplegar → `mode: development`.",
  ref: ["Deployment modes", "dev-tools/bundles/deployment-modes"] },

{ id: "x-l-05", type: "line", skill: "4.4", lang: "sql", title: "El mantenimiento que borró el pasado",
  brief: "Política: debe poder consultarse cualquier versión de `prod.gold.saldos` de los últimos 30 días. Haz clic en la línea que la incumple.",
  code: `ALTER TABLE prod.gold.saldos SET TBLPROPERTIES (
  'delta.logRetentionDuration' = 'interval 30 days'
);

OPTIMIZE prod.gold.saldos;

VACUUM prod.gold.saldos RETAIN 0 HOURS;`,
  bug: [6],
  notes: { 4: "OPTIMIZE compacta archivos en una versión nueva; no elimina historial.", 1: "Conservar 30 días de log es coherente con la política." },
  hints: ["El time travel necesita dos cosas: el log de transacciones y los archivos de datos antiguos.", "Una de estas sentencias elimina físicamente archivos de versiones anteriores.", "VACUUM con retención de 0 horas borra todo lo que no pertenezca a la versión actual."],
  explain: "`VACUUM … RETAIN 0 HOURS` elimina los archivos de datos de todas las versiones anteriores, así que el time travel deja de funcionar aunque el log se conserve. Hay que alinear `delta.deletedFileRetentionDuration` con la política y ejecutar VACUUM sin reducir la retención.",
  fix: `ALTER TABLE prod.gold.saldos SET TBLPROPERTIES (
  'delta.logRetentionDuration'         = 'interval 30 days',
  'delta.deletedFileRetentionDuration' = 'interval 30 days'
);

OPTIMIZE prod.gold.saldos;

VACUUM prod.gold.saldos;`,
  heuristic: "OPTIMIZE compacta; VACUUM borra. `RETAIN 0 HOURS` casi siempre es el error.",
  ref: ["VACUUM", "tables/operations/vacuum"] },

{ id: "x-l-06", type: "line", skill: "1.1", lang: "json", title: "El clúster insomne",
  brief: "Este clúster de desarrollo se usa de forma intermitente y la factura se ha triplicado: nunca se apaga. Haz clic en la línea responsable.",
  code: `{
  "cluster_name": "dev-ingenieria",
  "spark_version": "15.4.x-scala2.12",
  "node_type_id": "Standard_D8ds_v5",
  "autoscale": { "min_workers": 1, "max_workers": 6 },
  "autotermination_minutes": 0,
  "data_security_mode": "USER_ISOLATION"
}`,
  bug: [5],
  notes: { 4: "El autoscaling ya está configurado: ajusta el tamaño a la carga.", 6: "El modo de acceso define el aislamiento, no el apagado." },
  hints: ["Hay un ajuste que apaga el clúster tras un tiempo de inactividad.", "Busca un valor que desactive esa función.", "Un valor de 0 minutos desactiva la auto-terminación."],
  explain: "`autotermination_minutes: 0` desactiva la auto-terminación: el clúster queda encendido aunque nadie lo use. Un valor como 30 lo apaga tras media hora de inactividad.",
  fix: `{
  "cluster_name": "dev-ingenieria",
  "spark_version": "15.4.x-scala2.12",
  "node_type_id": "Standard_D8ds_v5",
  "autoscale": { "min_workers": 1, "max_workers": 6 },
  "autotermination_minutes": 30,
  "data_security_mode": "USER_ISOLATION"
}`,
  heuristic: "Costo de cómputo interactivo: autoscaling + auto-terminación. Un 0 en `autotermination_minutes` es una fuga de dinero.",
  ref: ["Compute configuration", "compute/configure"] },

{ id: "x-l-07", type: "line", skill: "2.2", lang: "sql", title: "La tabla que quedó inaccesible",
  brief: "Se quiere retirar el row filter de una tabla. Tras ejecutar este script, la tabla queda inaccesible. Haz clic en la sentencia que está en el lugar equivocado.",
  code: `-- Retirar el filtro por región
DROP FUNCTION prod.gov.filtro_region;

ALTER TABLE prod.ventas.pedidos DROP ROW FILTER;

SELECT COUNT(*) FROM prod.ventas.pedidos;`,
  bug: [1],
  notes: { 3: "Esta sentencia es correcta, pero llega tarde: debía ejecutarse antes." },
  hints: ["La tabla hace referencia a una función. ¿Qué pasa si la función desaparece primero?", "El orden de las dos primeras sentencias importa.", "Hay que quitar el filtro de la tabla antes de eliminar la función."],
  explain: "Si se elimina la función mientras la tabla aún la usa como row filter, la tabla queda en estado inaccesible. El orden correcto es `ALTER TABLE … DROP ROW FILTER` y después `DROP FUNCTION`.",
  fix: `ALTER TABLE prod.ventas.pedidos DROP ROW FILTER;

DROP FUNCTION prod.gov.filtro_region;`,
  heuristic: "Para retirar un filtro o una máscara: primero la tabla, después la función.",
  ref: ["Manually apply row filters and column masks", "data-governance/unity-catalog/filters-and-masks/manually-apply"] },

{ id: "x-l-08", type: "line", skill: "3.3", lang: "sql", title: "El MERGE que vació la dimensión",
  brief: "Cada hora llega un lote **incremental** con solo los clientes que cambiaron. Tras desplegar este MERGE, la dimensión perdió a casi todos los clientes. Haz clic en la línea culpable.",
  code: `MERGE INTO prod.silver.clientes AS t
USING prod.bronze.clientes_lote AS s
  ON t.cliente_id = s.cliente_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *
WHEN NOT MATCHED BY SOURCE THEN DELETE;`,
  bug: [5],
  notes: { 3: "Actualizar los clientes que coinciden es correcto.", 4: "Insertar los clientes nuevos es correcto." },
  hints: ["Piensa qué clientes del destino no aparecen en un lote incremental.", "Una cláusula actúa sobre las filas del destino que no están en el origen.", "`WHEN NOT MATCHED BY SOURCE THEN DELETE` solo es válido cuando el origen es una foto completa."],
  explain: "`WHEN NOT MATCHED BY SOURCE THEN DELETE` borra del destino todo lo que no viene en el origen. Con un lote incremental, eso elimina a todos los clientes que no cambiaron en esa hora.",
  fix: `MERGE INTO prod.silver.clientes AS t
USING prod.bronze.clientes_lote AS s
  ON t.cliente_id = s.cliente_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;`,
  heuristic: "NOT MATCHED BY SOURCE → solo con fotos completas. Con lotes incrementales, nunca.",
  ref: ["MERGE", "delta/merge"] },

{ id: "x-l-09", type: "line", skill: "1.2", lang: "sql", title: "La tabla que sobrevivió a su DROP",
  brief: "Requisito: al hacer `DROP TABLE`, los datos deben eliminarse y la tabla debe beneficiarse de la optimización automática. Haz clic en la línea que lo impide.",
  code: `CREATE TABLE prod.staging.pedidos_tmp (
  pedido_id  BIGINT,
  importe    DECIMAL(12,2),
  fecha      DATE
)
LOCATION 'abfss://staging@contosolake.dfs.core.windows.net/pedidos_tmp';`,
  bug: [5],
  notes: { 0: "El nombre de tres niveles es correcto." },
  hints: ["Hay dos tipos de tabla en Unity Catalog y se distinguen por una cláusula.", "En uno de los tipos, DROP solo elimina los metadatos.", "La cláusula `LOCATION` convierte la tabla en externa."],
  explain: "Con `LOCATION` la tabla es **externa**: `DROP TABLE` elimina solo los metadatos y predictive optimization no actúa. Sin esa cláusula la tabla es **managed**.",
  fix: `CREATE TABLE prod.staging.pedidos_tmp (
  pedido_id  BIGINT,
  importe    DECIMAL(12,2),
  fecha      DATE
);`,
  heuristic: "`LOCATION` en un CREATE TABLE = externa = DROP no borra los datos.",
  ref: ["Managed tables", "tables/managed"] },

{ id: "x-l-10", type: "line", skill: "1.1", lang: "yaml", title: "El job nocturno en el clúster de todos",
  brief: "Un job programado de producción comparte recursos con los analistas y paga tarifa de cómputo interactivo. Haz clic en la línea que lo explica.",
  code: `resources:
  jobs:
    etl_nocturno:
      name: etl_nocturno
      schedule:
        quartz_cron_expression: "0 0 2 * * ?"
        timezone_id: "UTC"
      tasks:
        - task_key: cargar_silver
          existing_cluster_id: "0101-123456-allpurpose"
          notebook_task:
            notebook_path: ../src/cargar_silver.py`,
  bug: [9],
  notes: { 5: "La expresión cron es válida: todos los días a las 02:00." },
  hints: ["Las cargas automatizadas deben usar un tipo de cómputo distinto del interactivo.", "Mira a qué cómputo se adjunta la tarea.", "`existing_cluster_id` apunta a un clúster all-purpose ya existente."],
  explain: "`existing_cluster_id` adjunta la tarea a un clúster all-purpose. La documentación no recomienda esa configuración para jobs de producción: debe usarse cómputo de jobs (un `job_cluster_key` con `new_cluster`) o serverless.",
  fix: `      job_clusters:
        - job_cluster_key: etl
          new_cluster:
            spark_version: 15.4.x-scala2.12
            node_type_id: Standard_D8ds_v5
            autoscale: { min_workers: 2, max_workers: 8 }
      tasks:
        - task_key: cargar_silver
          job_cluster_key: etl
          notebook_task:
            notebook_path: ../src/cargar_silver.py`,
  heuristic: "Job programado + `existing_cluster_id` de un all-purpose = distractor de costo.",
  ref: ["Compute for jobs", "jobs/compute"] },

{ id: "x-l-11", type: "line", skill: "3.1", lang: "sql", title: "Cuarenta mil particiones",
  brief: "Esta tabla de 60 GB tiene 40 000 clientes distintos y las consultas son lentas por la cantidad de archivos diminutos. Haz clic en la línea de diseño equivocada.",
  code: `CREATE TABLE prod.silver.transacciones (
  tx_id       BIGINT,
  cliente_id  BIGINT,
  fecha_tx    DATE,
  importe     DECIMAL(14,2)
)
PARTITIONED BY (cliente_id);`,
  bug: [6],
  notes: { 4: "DECIMAL es el tipo adecuado para importes." },
  hints: ["La documentación da una recomendación de tamaño mínimo para particionar.", "Piensa en cuántos directorios crea una partición por una columna con 40 000 valores.", "Con menos de 1 TB no se particiona; se recomienda liquid clustering."],
  explain: "Particionar una tabla pequeña por una columna de alta cardinalidad crea decenas de miles de particiones con archivos diminutos. La recomendación es no particionar por debajo de 1 TB y usar liquid clustering.",
  fix: `CREATE TABLE prod.silver.transacciones (
  tx_id       BIGINT,
  cliente_id  BIGINT,
  fecha_tx    DATE,
  importe     DECIMAL(14,2)
)
CLUSTER BY (cliente_id, fecha_tx);`,
  heuristic: "Tabla pequeña + PARTITIONED BY (sobre todo por alta cardinalidad) → el particionado es el error.",
  ref: ["Partitioning tables", "tables/partitions"] },

{ id: "x-l-12", type: "line", skill: "4.1", lang: "python", title: "El fallo que salió «con éxito»",
  brief: "Cuando la validación detecta datos corruptos, la tarea del job aparece como correcta y las tareas siguientes se ejecutan. Haz clic en la línea que lo provoca.",
  code: `invalidos = spark.table("prod.bronze.pedidos").where("pedido_id IS NULL").count()

try:
    if invalidos > 0:
        raise ValueError(f"{invalidos} pedidos sin identificador")
except Exception as e:
    print(f"Validación fallida: {e}")
    dbutils.notebook.exit("ERROR")

dbutils.notebook.exit("OK")`,
  bug: [7],
  notes: { 4: "Lanzar la excepción es correcto: el problema es lo que ocurre después de capturarla.", 6: "Registrar el error está bien; falta relanzarlo." },
  hints: ["Una tarea falla cuando el notebook termina con una excepción no capturada.", "Mira qué hace el bloque `except` después de registrar el error.", "`dbutils.notebook.exit()` termina el notebook con éxito, sea cual sea el texto que devuelva."],
  explain: "El bloque `except` captura la excepción y luego llama a `dbutils.notebook.exit(\"ERROR\")`, que finaliza el notebook **correctamente**. Para que la tarea falle hay que relanzar la excepción con `raise`.",
  fix: `try:
    if invalidos > 0:
        raise ValueError(f"{invalidos} pedidos sin identificador")
except Exception as e:
    print(f"Validación fallida: {e}")
    raise`,
  heuristic: "Fallar una tarea = excepción. `dbutils.notebook.exit` = éxito con valor de retorno.",
  ref: ["Control flow in jobs", "jobs/control-flow"] },

/* ══════════ RELLENAR HUECOS ══════════ */
{ id: "x-f-01", type: "fill", skill: "3.1", lang: "sql", title: "Liquid clustering",
  brief: "Crea la tabla organizada por `cliente_id` y `fecha` sin particiones físicas, y después aplica la organización a los datos existentes.",
  code: `CREATE TABLE prod.silver.movimientos (
  mov_id BIGINT, cliente_id BIGINT, fecha DATE, importe DECIMAL(14,2)
)
[[0]] (cliente_id, fecha);

[[1]] prod.silver.movimientos;`,
  answers: ["CLUSTER BY", "OPTIMIZE"],
  bank: ["CLUSTER BY", "PARTITIONED BY", "ZORDER BY", "OPTIMIZE", "VACUUM"],
  hints: ["El primer hueco define la organización física recomendada para tablas nuevas.", "El segundo hueco es el comando que compacta archivos y aplica el clustering.", "`CLUSTER BY` para definir las claves; `OPTIMIZE` para aplicarlas."],
  explain: "`CLUSTER BY` activa liquid clustering, que sustituye a particionado y Z-order (y no puede combinarse con ellos). `OPTIMIZE` agrupa los datos de forma incremental; `VACUUM` solo elimina archivos antiguos.",
  heuristic: "Tabla nueva → CLUSTER BY. Aplicar el clustering → OPTIMIZE.",
  ref: ["Liquid clustering", "tables/clustering"] },

{ id: "x-f-02", type: "fill", skill: "3.2", lang: "python", title: "Auto Loader completo",
  brief: "Completa la ingesta incremental de CSV con inferencia de esquema, que procese lo pendiente y termine.",
  code: `(spark.readStream
    .format("[[0]]")
    .option("cloudFiles.format", "csv")
    .option("cloudFiles.[[1]]", "/Volumes/prod/bronze/_estado/fac/schema")
    .load("/Volumes/prod/landing/facturas/")
 .writeStream
    .option("[[2]]", "/Volumes/prod/bronze/_estado/fac/checkpoint")
    .trigger([[3]]=True)
    .toTable("prod.bronze.facturas"))`,
  answers: ["cloudFiles", "schemaLocation", "checkpointLocation", "availableNow"],
  bank: ["cloudFiles", "autoloader", "schemaLocation", "checkpointLocation", "availableNow", "processingTime", "schemaPath"],
  hints: ["El origen de Auto Loader tiene un nombre propio, distinto del formato de los archivos.", "Hay dos ubicaciones de estado: una para el esquema (reader) y otra para el progreso (writer).", "`cloudFiles`, `schemaLocation`, `checkpointLocation` y el trigger que procesa todo y se detiene."],
  explain: "`format(\"cloudFiles\")` invoca Auto Loader; `cloudFiles.schemaLocation` guarda el esquema inferido; `checkpointLocation` guarda el progreso del stream; `availableNow` procesa lo disponible y termina.",
  heuristic: "Checklist cloudFiles: format, cloudFiles.format, schemaLocation, checkpointLocation, trigger.",
  ref: ["Auto Loader schema inference and evolution", "ingestion/cloud-object-storage/auto-loader/schema"] },

{ id: "x-f-03", type: "fill", skill: "3.4", lang: "sql", title: "Tres acciones de calidad",
  brief: "Regla 1: los pedidos sin id se descartan. Regla 2: un importe negativo es inaceptable y debe detener la actualización. Regla 3: la fecha futura solo se registra como métrica.",
  code: `CREATE OR REFRESH STREAMING TABLE silver_pedidos (
  CONSTRAINT id_valido      [[0]] (pedido_id IS NOT NULL) ON VIOLATION [[1]],
  CONSTRAINT importe_valido EXPECT (importe >= 0)          ON VIOLATION [[2]],
  CONSTRAINT fecha_valida   [[3]] (fecha <= current_date())
)
AS SELECT * FROM STREAM(bronze_pedidos);`,
  answers: ["EXPECT", "DROP ROW", "FAIL UPDATE", "EXPECT"],
  bank: ["EXPECT", "CHECK", "DROP ROW", "FAIL UPDATE", "SKIP ROW", "WARN"],
  hints: ["Todas las reglas de calidad de un pipeline usan la misma palabra clave.", "Descartar y detener son dos acciones distintas de `ON VIOLATION`.", "Sin cláusula `ON VIOLATION`, la expectativa solo advierte."],
  explain: "`EXPECT` define la expectativa. `ON VIOLATION DROP ROW` descarta la fila; `ON VIOLATION FAIL UPDATE` hace fallar la actualización; sin cláusula, la fila se conserva y se registra la métrica. `CHECK` es una restricción de tabla Delta, no una expectativa.",
  heuristic: "EXPECT sola = advertir · DROP ROW = descartar · FAIL UPDATE = detener.",
  ref: ["Pipeline expectations", "ldp/expectations"] },

{ id: "x-f-04", type: "fill", skill: "2.1", lang: "sql", title: "Los tres privilegios de lectura",
  brief: "Concede a `analistas` lo mínimo necesario para leer la tabla `prod.gold.ventas`.",
  code: `GRANT [[0]] ON CATALOG prod TO \`analistas\`;
GRANT [[1]] ON SCHEMA prod.gold TO \`analistas\`;
GRANT [[2]] ON TABLE prod.gold.ventas TO \`analistas\`;`,
  answers: ["USE CATALOG", "USE SCHEMA", "SELECT"],
  bank: ["USE CATALOG", "USE SCHEMA", "SELECT", "MODIFY", "ALL PRIVILEGES", "BROWSE"],
  hints: ["Cada nivel de la jerarquía necesita su privilegio.", "Los dos primeros son privilegios de uso; el tercero, de lectura.", "USE CATALOG → USE SCHEMA → SELECT."],
  explain: "Leer una tabla exige `USE CATALOG` en el catálogo, `USE SCHEMA` en el esquema y `SELECT` en la tabla. `MODIFY` es para escribir, `ALL PRIVILEGES` excede el mínimo privilegio y `BROWSE` solo permite ver metadatos.",
  heuristic: "Leer = USE CATALOG + USE SCHEMA + SELECT. Elige siempre el mínimo privilegio.",
  ref: ["Privileges reference", "data-governance/unity-catalog/access-control/privileges-reference"] },

{ id: "x-f-05", type: "fill", skill: "2.2", lang: "sql", title: "Filtro de filas y máscara de columna",
  brief: "Aplica un filtro de filas por región y una máscara sobre `num_identidad` para todos salvo el grupo `rrhh`.",
  code: `CREATE FUNCTION prod.gov.mask_id(valor STRING)
RETURN CASE WHEN [[0]]('rrhh') THEN valor
            ELSE concat('***', right(valor, 4)) END;

ALTER TABLE prod.rrhh.empleados SET [[1]] prod.gov.filtro_region ON (region);

ALTER TABLE prod.rrhh.empleados ALTER COLUMN num_identidad SET [[2]] prod.gov.mask_id;`,
  answers: ["is_account_group_member", "ROW FILTER", "MASK"],
  bank: ["is_account_group_member", "current_database", "ROW FILTER", "MASK", "TAGS", "COLUMN FILTER"],
  hints: ["El primer hueco es una función que comprueba la pertenencia a un grupo de la cuenta.", "Una cláusula decide qué filas se ven; la otra, qué valor se muestra.", "`SET ROW FILTER … ON (col)` y `ALTER COLUMN … SET MASK`."],
  explain: "`is_account_group_member()` evalúa la pertenencia del usuario a un grupo. `SET ROW FILTER` asocia una función booleana que filtra filas; `SET MASK` asocia una función que devuelve el valor visible de la columna.",
  heuristic: "Filas → ROW FILTER. Valor de una columna → MASK.",
  ref: ["Manually apply row filters and column masks", "data-governance/unity-catalog/filters-and-masks/manually-apply"] },

{ id: "x-f-06", type: "fill", skill: "3.1", lang: "sql", title: "Dimensión con historia (SCD 2)",
  brief: "Construye la dimensión de clientes a partir de un feed CDC, resolviendo eventos fuera de orden y conservando la historia.",
  code: `CREATE OR REFRESH STREAMING TABLE silver.dim_cliente;

CREATE FLOW flujo_dim_cliente AS [[0]] INTO silver.dim_cliente
FROM STREAM(bronze.clientes_cdc)
[[1]] (cliente_id)
APPLY AS DELETE WHEN operacion = 'DELETE'
[[2]] ts_evento
STORED AS SCD TYPE [[3]];`,
  answers: ["AUTO CDC", "KEYS", "SEQUENCE BY", "2"],
  bank: ["AUTO CDC", "MERGE", "KEYS", "PARTITION BY", "SEQUENCE BY", "ORDER BY", "1", "2"],
  hints: ["La API declarativa de CDC tiene un nombre nuevo (antes se llamaba APPLY CHANGES).", "Una cláusula identifica la entidad y otra define el orden lógico de los eventos.", "Conservar historia es SCD Tipo 2."],
  explain: "`AUTO CDC INTO` aplica el feed de cambios; `KEYS` identifica cada cliente; `SEQUENCE BY` ordena los eventos aunque lleguen desordenados; `SCD TYPE 2` conserva la historia con columnas de vigencia.",
  heuristic: "Historia → TYPE 2 · estado actual → TYPE 1 · fuera de orden → SEQUENCE BY.",
  ref: ["AUTO CDC", "ldp/cdc"] },

{ id: "x-f-07", type: "fill", skill: "1.2", lang: "sql", title: "Objetos de Unity Catalog",
  brief: "Consulta una base de datos SQL Server sin copiar datos y crea un contenedor gobernado para archivos PDF.",
  code: `CREATE [[0]] erp_sql TYPE sqlserver
OPTIONS (host 'erp.database.windows.net', port '1433',
         user secret('kv', 'erp-user'), password secret('kv', 'erp-pwd'));

CREATE [[1]] erp_fed USING CONNECTION erp_sql
OPTIONS (database 'erp_prod');

CREATE [[2]] prod.legal.contratos;`,
  answers: ["CONNECTION", "FOREIGN CATALOG", "VOLUME"],
  bank: ["CONNECTION", "FOREIGN CATALOG", "VOLUME", "EXTERNAL LOCATION", "SHARE", "SCHEMA"],
  hints: ["Lakehouse Federation necesita dos objetos: uno con las credenciales y otro que refleja la base de datos.", "Los archivos no tabulares se gobiernan con un objeto específico.", "CONNECTION → FOREIGN CATALOG; y VOLUME para los archivos."],
  explain: "La `CONNECTION` guarda el tipo de origen y las credenciales; el `FOREIGN CATALOG` refleja la base de datos externa (solo lectura). Un `VOLUME` gobierna datos no tabulares. Una external location apunta a almacenamiento en la nube, no a una base de datos.",
  heuristic: "BD externa sin ingerir → CONNECTION + FOREIGN CATALOG. Archivos → VOLUME.",
  ref: ["Lakehouse Federation", "query-federation/"] },

{ id: "x-f-08", type: "fill", skill: "4.3", lang: "bash", title: "El ciclo del bundle",
  brief: "Completa el pipeline de CI/CD: primero comprobar la configuración, luego publicar en producción y por último ejecutar el job.",
  code: `# 1) comprobar la configuración sin tocar el workspace
databricks bundle [[0]] -t prod

# 2) crear o actualizar los recursos en el workspace
databricks bundle [[1]] -t prod

# 3) lanzar el job desplegado
databricks bundle [[2]] -t prod carga_diaria`,
  answers: ["validate", "deploy", "run"],
  bank: ["validate", "deploy", "run", "destroy", "init", "generate"],
  hints: ["Un comando solo comprueba, otro publica y otro ejecuta.", "`init` crea un proyecto desde una plantilla y `destroy` elimina lo desplegado: no son estos.", "validate → deploy → run."],
  explain: "`bundle validate` verifica la configuración; `bundle deploy` despliega al target; `bundle run` ejecuta un recurso desplegado. `init`, `generate` y `destroy` sirven para crear el proyecto, importar recursos existentes y eliminar lo desplegado.",
  heuristic: "validate = comprobar · deploy = publicar · run = ejecutar · destroy = eliminar.",
  ref: ["Develop bundles (CLI workflow)", "dev-tools/bundles/work-tasks"] },

{ id: "x-f-09", type: "fill", skill: "4.1", lang: "yaml", title: "Dependencias, reintentos y limpieza",
  brief: "`transformar` debe ejecutarse después de `cargar` y reintentarse hasta 3 veces. `limpieza` debe ejecutarse siempre, falle o no lo anterior.",
  code: `tasks:
  - task_key: cargar
    notebook_task: { notebook_path: ../src/cargar.py }

  - task_key: transformar
    [[0]]:
      - task_key: cargar
    [[1]]: 3
    notebook_task: { notebook_path: ../src/transformar.py }

  - task_key: limpieza
    depends_on:
      - task_key: transformar
    run_if: [[2]]
    notebook_task: { notebook_path: ../src/limpiar.py }`,
  answers: ["depends_on", "max_retries", "ALL_DONE"],
  bank: ["depends_on", "runs_after", "max_retries", "retry_count", "ALL_DONE", "ALL_SUCCESS", "AT_LEAST_ONE_FAILED"],
  hints: ["La precedencia entre tareas se declara con una clave concreta.", "La condición por defecto exige que todo haya ido bien; aquí se necesita otra.", "`depends_on`, `max_retries` y la condición que no mira el resultado."],
  explain: "`depends_on` define la precedencia; `max_retries` absorbe fallos transitorios; `run_if: ALL_DONE` ejecuta la tarea cuando sus dependencias han terminado, con independencia del resultado.",
  heuristic: "«Siempre, pase lo que pase» → ALL_DONE. «Solo si algo falló» → AT_LEAST_ONE_FAILED.",
  ref: ["Configure task dependencies (Run if)", "jobs/run-if"] },

{ id: "x-f-10", type: "fill", skill: "2.2", lang: "sql", title: "Compartir con un socio",
  brief: "Comparte una tabla con un socio externo mediante Delta Sharing, concediéndole solo lectura.",
  code: `CREATE [[0]] share_socio COMMENT 'Ventas agregadas';

ALTER SHARE share_socio ADD TABLE prod.gold.ventas_agregadas;

CREATE [[1]] socio_ext COMMENT 'Socio sin Databricks';

GRANT [[2]] ON SHARE share_socio TO RECIPIENT socio_ext;`,
  answers: ["SHARE", "RECIPIENT", "SELECT"],
  bank: ["SHARE", "RECIPIENT", "SELECT", "CONNECTION", "USER", "ALL PRIVILEGES"],
  hints: ["Delta Sharing tiene dos objetos: la colección de datos y el destinatario.", "Lo compartido es siempre de solo lectura.", "SHARE, RECIPIENT y SELECT."],
  explain: "El `SHARE` agrupa los objetos compartidos; el `RECIPIENT` representa al destinatario (con token u OIDC si no usa Databricks, o con el identificador de su metastore si lo usa); `GRANT SELECT ON SHARE` le da acceso de lectura.",
  heuristic: "Compartir = SHARE + RECIPIENT + GRANT SELECT. Nunca crear usuarios ni exportar archivos.",
  ref: ["Create shares", "opensharing/create-share"] },

{ id: "x-f-11", type: "fill", skill: "1.1", lang: "json", title: "Clúster compartido y económico",
  brief: "Configura un clúster para varios usuarios con Unity Catalog, que ajuste su tamaño a la carga y se apague tras 30 minutos sin uso.",
  code: `{
  "cluster_name": "equipo-datos",
  "spark_version": "15.4.x-scala2.12",
  "node_type_id": "Standard_D4ds_v5",
  "[[0]]": { "min_workers": 1, "max_workers": 6 },
  "[[1]]": 30,
  "data_security_mode": "[[2]]"
}`,
  answers: ["autoscale", "autotermination_minutes", "USER_ISOLATION"],
  bank: ["autoscale", "num_workers", "autotermination_minutes", "idle_timeout", "USER_ISOLATION", "SINGLE_USER", "NONE"],
  hints: ["Un ajuste define un rango de workers; otro, el apagado por inactividad.", "El modo de acceso para varios usuarios con aislamiento es Standard (antes Shared).", "`autoscale`, `autotermination_minutes` y `USER_ISOLATION`."],
  explain: "`autoscale` define el rango de workers; `autotermination_minutes` apaga el clúster inactivo; `USER_ISOLATION` es el valor de la API para el modo Standard (multiusuario con aislamiento). `SINGLE_USER` corresponde a Dedicated.",
  heuristic: "Varios usuarios + Unity Catalog → Standard (USER_ISOLATION). Costo → autoscale + auto-terminación.",
  ref: ["Standard compute", "compute/standard-overview"] },

{ id: "x-f-12", type: "fill", skill: "4.4", lang: "sql", title: "Mantenimiento seguro de una tabla Delta",
  brief: "Garantiza 30 días de time travel, compacta los archivos pequeños y previsualiza lo que VACUUM eliminaría antes de ejecutarlo.",
  code: `ALTER TABLE prod.gold.saldos SET TBLPROPERTIES (
  'delta.[[0]]' = 'interval 30 days'
);

[[1]] prod.gold.saldos;

[[2]] prod.gold.saldos [[3]];`,
  answers: ["deletedFileRetentionDuration", "OPTIMIZE", "VACUUM", "DRY RUN"],
  bank: ["deletedFileRetentionDuration", "enableChangeDataFeed", "OPTIMIZE", "VACUUM", "DRY RUN", "RETAIN 0 HOURS", "ANALYZE"],
  hints: ["Una propiedad de tabla decide cuánto se conservan los archivos de datos antiguos.", "Un comando compacta y otro borra.", "`DRY RUN` muestra lo que se eliminaría sin eliminarlo."],
  explain: "`delta.deletedFileRetentionDuration` es el umbral que respeta VACUUM. `OPTIMIZE` compacta archivos pequeños. `VACUUM … DRY RUN` lista los archivos candidatos sin borrarlos. `RETAIN 0 HOURS` destruiría el time travel.",
  heuristic: "Time travel de N días → deletedFileRetentionDuration = N días. Antes de borrar → DRY RUN.",
  ref: ["VACUUM", "tables/operations/vacuum"] }
];
