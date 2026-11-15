/* Banco Modo Code & Permission Audit: bloques de código con un defecto a identificar. */
window.DP750 = window.DP750 || {};
const DOCA = "https://learn.microsoft.com/azure/databricks/";

DP750.AUDITS = [
  {
    id: "a-d1-01", mode: "audit", domain: "d1",
    objective: "DDL sobre tablas managed y externas",
    title: "La tabla que sobrevivió a su DROP",
    context: "Requisito del equipo de cumplimiento: al ejecutar `DROP TABLE` sobre tablas de staging, los datos deben eliminarse, y las tablas deben beneficiarse de la optimización automática de Unity Catalog. Un ingeniero entrega este DDL.",
    audit: { lang: "sql", text: `CREATE TABLE prod.staging.pedidos_tmp (
  pedido_id   BIGINT,
  cliente_id  BIGINT,
  importe     DECIMAL(12,2),
  fecha       DATE
)
USING DELTA
LOCATION 'abfss://staging@contosolake.dfs.core.windows.net/pedidos_tmp';` },
    question: "¿Qué defecto incumple el requisito?",
    options: [
      { t: "La cláusula `LOCATION` convierte la tabla en externa: `DROP TABLE` no borrará los archivos y la tabla queda fuera de predictive optimization.", ok: true,
        why: "Con LOCATION la tabla es externa: Unity Catalog solo gestiona sus metadatos. Quitando LOCATION se crea como managed, que es lo que pide el requisito." },
      { t: "Falta `PARTITIONED BY (fecha)`; sin particiones no se pueden borrar los datos.", ok: false, dbu: 70, sla: 5,
        why: "El particionado no guarda relación con el ciclo de vida de los datos al hacer DROP, y particionar una tabla de staging pequeña sería contraproducente." },
      { t: "`USING DELTA` es inválido en Unity Catalog; debe ser `USING PARQUET`.", ok: false, dbu: 60, sla: 5,
        why: "Delta es el formato por defecto y el recomendado. Parquet perdería transacciones ACID y time travel." },
      { t: "El nombre de tres niveles es incorrecto: las tablas de staging deben crearse en `hive_metastore`.", ok: false, dbu: 80, sla: 10,
        why: "`hive_metastore` es el metastore heredado, sin gobierno de Unity Catalog. El espacio `catálogo.esquema.tabla` es correcto." }
    ],
    foundation: "**Managed**: Unity Catalog gestiona metadatos y archivos; `DROP TABLE` elimina ambos (con una ventana en la que `UNDROP TABLE` puede recuperarla) y la tabla admite predictive optimization. **Externa**: se declara con `LOCATION` dentro de una external location; `DROP` elimina solo los metadatos. Databricks recomienda managed por defecto.",
    heuristic: "Si ves `LOCATION` en un CREATE TABLE → es externa → DROP no borra datos. Requisito «los datos deben borrarse al eliminar la tabla» u «optimización automática» → managed (sin LOCATION).",
    code: { lang: "sql", text: `-- Tabla managed: sin LOCATION
CREATE TABLE prod.staging.pedidos_tmp (
  pedido_id   BIGINT,
  cliente_id  BIGINT,
  importe     DECIMAL(12,2),
  fecha       DATE
);

-- Comprobar el tipo de tabla
DESCRIBE EXTENDED prod.staging.pedidos_tmp;   -- fila "Type": MANAGED

DROP TABLE prod.staging.pedidos_tmp;          -- elimina metadatos y datos
-- UNDROP TABLE prod.staging.pedidos_tmp;     -- recuperable dentro de la ventana de retención` },
    refs: [{ t: "Unity Catalog", u: DOCA + "data-governance/unity-catalog/" }]
  },
  {
    id: "a-d1-02", mode: "audit", domain: "d1",
    objective: "Configurar rendimiento del cómputo (autoscaling, terminación)",
    title: "El clúster de desarrollo insomne",
    context: "Este clúster all-purpose es para que 4 ingenieros desarrollen notebooks en horario laboral. La carga es intermitente: ratos de uso intenso y largos periodos sin actividad. La factura del mes pasado triplicó lo previsto.",
    audit: { lang: "json", text: `{
  "cluster_name": "dev-ingenieria",
  "spark_version": "15.4.x-scala2.12",
  "node_type_id": "Standard_D16ds_v5",
  "num_workers": 20,
  "autotermination_minutes": 0,
  "data_security_mode": "USER_ISOLATION"
}` },
    question: "¿Qué configuración explica principalmente el sobrecosto?",
    options: [
      { t: "`autotermination_minutes: 0` desactiva la auto-terminación y `num_workers: 20` fija el tamaño: el clúster nunca se apaga ni se reduce.", ok: true,
        why: "Para una carga intermitente, un clúster de tamaño fijo y sin auto-terminación factura 20 workers las 24 horas. Lo correcto es autoscaling y auto-terminación." },
      { t: "`data_security_mode: USER_ISOLATION` duplica el consumo de DBU frente a un clúster dedicado.", ok: false, dbu: 80, sla: 10,
        why: "El modo de acceso define el aislamiento y la gobernanza, no una tarifa multiplicada. Además, es el modo adecuado para 4 usuarios con Unity Catalog." },
      { t: "La versión de runtime `15.4.x` es LTS, y las versiones LTS tienen un recargo.", ok: false, dbu: 60, sla: 5,
        why: "LTS significa soporte de larga duración; no implica recargo. Es la elección prudente para estabilidad." },
      { t: "Falta `\"runtime_engine\": \"PHOTON\"`; sin Photon el clúster consume más DBU.", ok: false, dbu: 70, sla: 5,
        why: "Photon acelera ciertas cargas (y tiene su propia tarifa), pero no corrige un clúster que permanece encendido sin uso." }
    ],
    foundation: "Dos palancas de costo en cómputo clásico: **auto-terminación** (apaga tras N minutos de inactividad; el valor 0 la desactiva) y **autoscaling** (`autoscale.min_workers` / `max_workers` en lugar de `num_workers` fijo). Para desarrollo interactivo intermitente se combinan ambas. Las políticas de clúster permiten imponer estos límites a todo el equipo.",
    heuristic: "En configuraciones de clúster busca primero: ¿`autotermination_minutes` es 0 o falta?, ¿`num_workers` fijo con carga variable?, ¿all-purpose para un job? Son los tres defectos de costo más habituales.",
    code: { lang: "json", text: `{
  "cluster_name": "dev-ingenieria",
  "spark_version": "15.4.x-scala2.12",
  "node_type_id": "Standard_D8ds_v5",
  "autoscale": { "min_workers": 1, "max_workers": 6 },
  "autotermination_minutes": 30,
  "data_security_mode": "USER_ISOLATION"
}` },
    refs: [{ t: "Cómputo en Azure Databricks", u: DOCA + "compute/" }]
  },
  {
    id: "a-d2-01", mode: "audit", domain: "d2",
    objective: "Conceder privilegios a un principal",
    title: "SELECT concedido, acceso denegado",
    context: "Un administrador ejecutó este script para que el grupo `analistas_ventas` pueda consultar una tabla. Los analistas reciben un error de permisos al ejecutar `SELECT * FROM prod.gold.ventas_diarias`.",
    audit: { lang: "sql", text: `-- Script de permisos ejecutado por el administrador
GRANT SELECT ON TABLE prod.gold.ventas_diarias TO \`analistas_ventas\`;

-- Verificación
SHOW GRANTS \`analistas_ventas\` ON TABLE prod.gold.ventas_diarias;
-- principal          action_type   object_type   object_key
-- analistas_ventas   SELECT        TABLE         prod.gold.ventas_diarias` },
    question: "¿Qué falta?",
    options: [
      { t: "`USE CATALOG` sobre `prod` y `USE SCHEMA` sobre `prod.gold`.", ok: true,
        why: "En Unity Catalog, para llegar a un objeto hay que poder «atravesar» sus contenedores. SELECT sobre la tabla no basta sin USE CATALOG y USE SCHEMA." },
      { t: "`MODIFY` sobre la tabla, porque SELECT requiere MODIFY.", ok: false, dbu: 90, sla: 10,
        why: "MODIFY permite escribir (INSERT/UPDATE/DELETE). No es requisito para leer y concederlo violaría el mínimo privilegio." },
      { t: "Convertir al grupo en propietario (`OWNER`) de la tabla.", ok: false, dbu: 110, sla: 15,
        why: "El propietario puede hacer todo, incluido conceder permisos y eliminar la tabla. Es una escalada de privilegios innecesaria, y aun así necesitaría USE CATALOG / USE SCHEMA." },
      { t: "`ALL PRIVILEGES` sobre el catálogo `prod`.", ok: false, dbu: 120, sla: 15,
        why: "«Funcionaría», pero concede lectura y escritura sobre todo el catálogo por herencia. Es exactamente lo contrario del mínimo privilegio." }
    ],
    foundation: "El modelo de Unity Catalog es jerárquico: metastore → catálogo → esquema → tabla/vista/volumen/función. Leer una tabla requiere **USE CATALOG + USE SCHEMA + SELECT**. Los privilegios concedidos en un nivel superior se **heredan** hacia abajo (p. ej. SELECT sobre un esquema aplica a todas sus tablas, actuales y futuras), pero `USE CATALOG`/`USE SCHEMA` por sí solos no permiten leer datos.",
    heuristic: "Pregunta de «tiene SELECT pero no puede consultar» → faltan USE CATALOG / USE SCHEMA. Entre varias opciones que «funcionan», elige siempre la de **mínimo privilegio**: descarta ALL PRIVILEGES y OWNER.",
    code: { lang: "sql", text: `GRANT USE CATALOG ON CATALOG prod              TO \`analistas_ventas\`;
GRANT USE SCHEMA  ON SCHEMA  prod.gold         TO \`analistas_ventas\`;
GRANT SELECT      ON TABLE   prod.gold.ventas_diarias TO \`analistas_ventas\`;

-- Alternativa por herencia: todas las tablas (actuales y futuras) del esquema
-- GRANT SELECT ON SCHEMA prod.gold TO \`analistas_ventas\`;

-- Revisar
SHOW GRANTS ON SCHEMA prod.gold;` },
    refs: [{ t: "Permissions concepts", u: DOCA + "data-governance/unity-catalog/access-control/permissions-concepts" }]
  },
  {
    id: "a-d2-02", mode: "audit", domain: "d2",
    objective: "Configurar column masks",
    title: "La máscara puesta del revés",
    context: "Requisito: solo los miembros del grupo `cumplimiento` pueden ver el IBAN completo; el resto debe ver un valor ofuscado. Tras el despliegue, un analista ajeno a cumplimiento informa de que ve los IBAN completos.",
    audit: { lang: "sql", text: `CREATE OR REPLACE FUNCTION fin.gov.mask_iban(iban STRING)
RETURN CASE
  WHEN is_account_group_member('cumplimiento')
    THEN concat('****', right(iban, 4))
  ELSE iban
END;

ALTER TABLE fin.core.cuentas
  ALTER COLUMN iban SET MASK fin.gov.mask_iban;` },
    question: "¿Dónde está el error?",
    options: [
      { t: "La lógica del `CASE` está invertida: enmascara para `cumplimiento` y devuelve el valor real al resto.", ok: true,
        why: "La rama THEN (miembros de cumplimiento) devuelve el valor ofuscado y el ELSE devuelve el IBAN real. Hay que intercambiar las ramas." },
      { t: "Los column masks solo pueden aplicarse a vistas, no a tablas.", ok: false, dbu: 70, sla: 10,
        why: "Es al revés: los column masks se aplican a columnas de tablas mediante `ALTER TABLE … ALTER COLUMN … SET MASK` (o en el CREATE TABLE)." },
      { t: "La función debe escribirse en Python; las funciones SQL no pueden usarse como máscara.", ok: false, dbu: 70, sla: 5,
        why: "Las máscaras se definen como funciones (UDF) de Unity Catalog y las funciones SQL son la forma habitual y recomendada." },
      { t: "Debe usarse `SET ROW FILTER` en lugar de `SET MASK`.", ok: false, dbu: 80, sla: 10,
        why: "Un row filter decide qué filas se devuelven; no transforma el valor de una columna. El requisito es ofuscar un valor, no ocultar filas." }
    ],
    foundation: "Un column mask es una función cuyo primer parámetro recibe el valor de la columna y cuyo resultado (de tipo compatible con la columna) es lo que ve el usuario. La decisión suele basarse en `is_account_group_member()` o `current_user()`. La auditoría de máscaras consiste en leer cada rama preguntándose: «¿quién entra aquí y qué ve?».",
    heuristic: "En preguntas de máscaras y filtros, traza las dos ramas con un usuario autorizado y otro no autorizado. Los errores de examen típicos son: lógica invertida, tipo de retorno incompatible y confundir MASK (valor) con ROW FILTER (filas).",
    code: { lang: "sql", text: `CREATE OR REPLACE FUNCTION fin.gov.mask_iban(iban STRING)
RETURN CASE
  WHEN is_account_group_member('cumplimiento') THEN iban
  ELSE concat('****', right(iban, 4))
END;

ALTER TABLE fin.core.cuentas
  ALTER COLUMN iban SET MASK fin.gov.mask_iban;

-- Retirar la máscara
-- ALTER TABLE fin.core.cuentas ALTER COLUMN iban DROP MASK;` },
    refs: [{ t: "Unity Catalog", u: DOCA + "data-governance/unity-catalog/" }]
  },
  {
    id: "a-d3-01", mode: "audit", domain: "d3",
    objective: "Ingerir datos con Auto Loader (cloudFiles)",
    title: "El stream que no quiso arrancar",
    context: "Este notebook debe ingerir CSV de facturas con Auto Loader infiriendo el esquema automáticamente. Al ejecutarlo, falla en el arranque del stream antes de leer ningún archivo.",
    audit: { lang: "python", text: `(spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "csv")
    .option("header", "true")
    .load("abfss://facturas@contosolake.dfs.core.windows.net/entrada/")
 .writeStream
    .option("checkpointLocation", "/Volumes/prod/bronze/_estado/facturas/checkpoint")
    .trigger(availableNow=True)
    .toTable("prod.bronze.facturas"))` },
    question: "¿Qué falta para que funcione con inferencia de esquema?",
    options: [
      { t: "La opción `cloudFiles.schemaLocation`, donde Auto Loader persiste el esquema inferido.", ok: true,
        why: "Sin un esquema explícito, Auto Loader necesita una ubicación donde guardar y versionar el esquema inferido. Sin ella (y sin `.schema(...)`) el stream no arranca." },
      { t: "El formato debe ser `format(\"autoloader\")` en lugar de `\"cloudFiles\"`.", ok: false, dbu: 60, sla: 10,
        why: "El nombre del origen de Auto Loader es precisamente `cloudFiles`. No existe un formato `autoloader`." },
      { t: "`trigger(availableNow=True)` no es compatible con Auto Loader; debe ser `processingTime`.", ok: false, dbu: 70, sla: 10,
        why: "`availableNow` es compatible y es el patrón recomendado para ejecuciones incrementales programadas tipo batch." },
      { t: "`toTable()` no puede usarse en streaming; hay que usar `.start(ruta)`.", ok: false, dbu: 60, sla: 5,
        why: "`toTable()` es la forma estándar de escribir un stream en una tabla de Unity Catalog." }
    ],
    foundation: "Auto Loader mantiene **dos** ubicaciones de estado distintas: `cloudFiles.schemaLocation` (esquema inferido y su evolución; opción del **reader**) y `checkpointLocation` (progreso del stream y archivos ya procesados; opción del **writer**). Pueden compartir ruta base, pero son conceptos diferentes y ambas son necesarias cuando se infiere el esquema.",
    heuristic: "Checklist `cloudFiles` en 5 segundos: (1) `format(\"cloudFiles\")`, (2) `cloudFiles.format`, (3) `cloudFiles.schemaLocation` o `.schema()`, (4) `checkpointLocation` en el writeStream, (5) trigger acorde al requisito. La opción que falte es la respuesta.",
    code: { lang: "python", text: `estado = "/Volumes/prod/bronze/_estado/facturas"

(spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "csv")
    .option("cloudFiles.schemaLocation", f"{estado}/schema")   # <- faltaba
    .option("header", "true")
    .load("abfss://facturas@contosolake.dfs.core.windows.net/entrada/")
 .writeStream
    .option("checkpointLocation", f"{estado}/checkpoint")
    .trigger(availableNow=True)
    .toTable("prod.bronze.facturas"))` },
    refs: [{ t: "Auto Loader", u: DOCA + "ingestion/cloud-object-storage/auto-loader/" }]
  },
  {
    id: "a-d3-02", mode: "audit", domain: "d3",
    objective: "Gestionar calidad de datos con expectations",
    title: "La expectativa que solo miraba",
    context: "Regla de negocio: los pedidos sin `pedido_id` o con `importe` negativo **no deben llegar** a la capa silver, pero el pipeline **no debe detenerse** por ellos. Tras el despliegue, aparecen pedidos con importe negativo en `silver_pedidos`.",
    audit: { lang: "sql", text: `CREATE OR REFRESH STREAMING TABLE silver_pedidos (
  CONSTRAINT id_valido      EXPECT (pedido_id IS NOT NULL),
  CONSTRAINT importe_valido EXPECT (importe >= 0)
)
AS SELECT pedido_id, cliente_id, importe, fecha_pedido
FROM STREAM(bronze_pedidos);` },
    question: "¿Cómo debe corregirse?",
    options: [
      { t: "Añadir `ON VIOLATION DROP ROW` a ambas expectativas.", ok: true,
        why: "Sin cláusula ON VIOLATION, la expectativa solo registra la métrica y conserva la fila. DROP ROW descarta las filas inválidas y el pipeline continúa." },
      { t: "Añadir `ON VIOLATION FAIL UPDATE` a ambas expectativas.", ok: false, dbu: 80, sla: 20,
        why: "Impide que entren datos inválidos, pero deteniendo la actualización: incumple «el pipeline no debe detenerse»." },
      { t: "Sustituir las expectativas por restricciones `CHECK` de Delta en la tabla.", ok: false, dbu: 70, sla: 20,
        why: "Una restricción CHECK hace fallar toda la transacción cuando una fila la incumple; no descarta filas individualmente. Mismo problema que FAIL UPDATE." },
      { t: "No hay error: `EXPECT` ya descarta las filas por defecto; el problema está en bronze.", ok: false, dbu: 90, sla: 15,
        why: "El comportamiento por defecto de EXPECT es conservar la fila y registrar la violación (modo advertencia)." }
    ],
    foundation: "Las expectations tienen tres acciones: **warn** (por defecto: la fila pasa y se contabiliza), **drop** (`ON VIOLATION DROP ROW`: la fila se descarta y se contabiliza) y **fail** (`ON VIOLATION FAIL UPDATE`: la actualización falla). Las métricas quedan en el registro de eventos del pipeline. Para no perder los registros rechazados se usa el patrón de **cuarentena**: una segunda tabla con la condición invertida.",
    heuristic: "Mapea el verbo del enunciado: «registrar / monitorizar» → EXPECT solo; «descartar / excluir / filtrar» → DROP ROW; «detener / abortar / no tolerar» → FAIL UPDATE. Si el pipeline «debe continuar», descarta FAIL y CHECK.",
    code: { lang: "sql", text: `CREATE OR REFRESH STREAMING TABLE silver_pedidos (
  CONSTRAINT id_valido      EXPECT (pedido_id IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT importe_valido EXPECT (importe >= 0)          ON VIOLATION DROP ROW
)
AS SELECT pedido_id, cliente_id, importe, fecha_pedido
FROM STREAM(bronze_pedidos);

-- Patrón de cuarentena: conservar lo rechazado para su análisis
CREATE OR REFRESH STREAMING TABLE cuarentena_pedidos
AS SELECT *, current_timestamp() AS rechazado_en
FROM STREAM(bronze_pedidos)
WHERE pedido_id IS NULL OR importe < 0 OR importe IS NULL;` },
    codeNote: "Equivalente en Python: `@dp.expect_or_drop(\"importe_valido\", \"importe >= 0\")` con `from pyspark import pipelines as dp` (antes `import dlt` y `@dlt.expect_or_drop`).",
    refs: [{ t: "Pipeline expectations", u: DOCA + "ldp/expectations" }]
  },
  {
    id: "a-d3-03", mode: "audit", domain: "d3",
    objective: "Cargar datos con MERGE y resolver duplicados",
    title: "El MERGE ambiguo",
    context: "Este MERGE actualiza la dimensión de clientes desde un lote diario. Hoy falla con un error que indica que varias filas del origen coinciden con la misma fila del destino. El lote contiene dos registros para `cliente_id = 881` (el cliente cambió de email dos veces en el día).",
    audit: { lang: "sql", text: `MERGE INTO prod.silver.clientes AS t
USING prod.bronze.clientes_lote AS s
  ON t.cliente_id = s.cliente_id
WHEN MATCHED THEN
  UPDATE SET t.email = s.email, t.actualizado_en = s.ts_cambio
WHEN NOT MATCHED THEN
  INSERT (cliente_id, email, actualizado_en)
  VALUES (s.cliente_id, s.email, s.ts_cambio);` },
    question: "¿Cuál es la corrección adecuada?",
    options: [
      { t: "Deduplicar el origen antes del MERGE, conservando por `cliente_id` la fila con el `ts_cambio` más reciente.", ok: true,
        why: "MERGE exige que cada fila del destino coincida, como máximo, con una fila del origen; de lo contrario el resultado sería ambiguo. Deduplicar con criterio determinista resuelve la causa." },
      { t: "Añadir `WHEN NOT MATCHED BY SOURCE THEN DELETE`.", ok: false, dbu: 120, sla: 20,
        why: "Esa cláusula borra del destino las filas que no están en el origen: no resuelve los duplicados y eliminaría a todos los clientes ausentes del lote de hoy." },
      { t: "Cambiar la condición a `ON t.cliente_id = s.cliente_id AND t.email = s.email`.", ok: false, dbu: 90, sla: 15,
        why: "Con ese ON, un cambio de email ya no coincide y se insertaría como cliente nuevo: genera duplicados en la dimensión." },
      { t: "Ejecutar `OPTIMIZE prod.silver.clientes` antes del MERGE para eliminar la ambigüedad.", ok: false, dbu: 60, sla: 10,
        why: "OPTIMIZE compacta archivos; no cambia el contenido lógico de ninguna tabla y, además, el duplicado está en el origen." }
    ],
    foundation: "MERGE es determinista solo si cada fila destino tiene, como máximo, una coincidencia en el origen. Los lotes CDC suelen traer varios cambios de la misma clave, así que el patrón estándar es **deduplicar el origen con una función de ventana** (o `QUALIFY`) antes del MERGE. Si además se requiere historia u orden entre lotes, AUTO CDC con `SEQUENCE BY` lo resuelve de forma declarativa.",
    heuristic: "«Múltiples filas del origen coinciden» → deduplicar el ORIGEN (ROW_NUMBER / QUALIFY por clave, ordenando por timestamp). Nunca se arregla tocando el destino ni relajando/endureciendo el ON.",
    code: { lang: "sql", text: `MERGE INTO prod.silver.clientes AS t
USING (
  SELECT cliente_id, email, ts_cambio
  FROM prod.bronze.clientes_lote
  QUALIFY ROW_NUMBER() OVER (
            PARTITION BY cliente_id ORDER BY ts_cambio DESC
          ) = 1
) AS s
  ON t.cliente_id = s.cliente_id
WHEN MATCHED AND s.ts_cambio > t.actualizado_en THEN
  UPDATE SET t.email = s.email, t.actualizado_en = s.ts_cambio
WHEN NOT MATCHED THEN
  INSERT (cliente_id, email, actualizado_en)
  VALUES (s.cliente_id, s.email, s.ts_cambio);` },
    refs: [{ t: "MERGE INTO", u: DOCA + "delta/merge" }]
  },
  {
    id: "a-d4-01", mode: "audit", domain: "d4",
    objective: "Configurar Databricks Asset Bundles",
    title: "Producción con prefijo [dev]",
    context: "Tras desplegar con `databricks bundle deploy -t prod`, el job de producción aparece con el nombre `[dev maria] ventas_diario` y su programación está en pausa: anoche no se ejecutó.",
    audit: { lang: "yaml", text: `bundle:
  name: ventas_etl

include:
  - resources/*.yml

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
      service_principal_name: "00000000-0000-0000-0000-000000000000"` },
    question: "¿Qué línea causa el comportamiento?",
    options: [
      { t: "`mode: development` en el target `prod`; debe ser `mode: production`.", ok: true,
        why: "El modo development antepone un prefijo con el usuario a los recursos y pausa schedules y triggers. Es justo lo observado." },
      { t: "`default: true` en el target `dev` hace que todo despliegue vaya siempre a dev.", ok: false, dbu: 70, sla: 15,
        why: "`default` solo indica el target cuando no se pasa `-t`. Aquí se indicó `-t prod` y el job se desplegó en el workspace de prod." },
      { t: "`run_as` con service principal pausa los schedules hasta que un usuario los apruebe.", ok: false, dbu: 80, sla: 15,
        why: "`run_as` solo define la identidad de ejecución. No pausa programaciones; de hecho es la práctica recomendada en producción." },
      { t: "Falta el comando `databricks bundle validate`, que es el que activa los schedules.", ok: false, dbu: 60, sla: 10,
        why: "`validate` comprueba la configuración sin desplegar ni modificar recursos. No activa nada." }
    ],
    foundation: "Los **modos de despliegue** predefinen comportamientos por entorno. `development`: prefijo `[dev <usuario>]` en los recursos, schedules y triggers en pausa, pensado para iterar sin interferir con otros. `production`: sin prefijos, schedules activos y validaciones adicionales (por ejemplo, sobre la ruta de despliegue y la identidad de ejecución).",
    heuristic: "En YAML de bundles revisa en este orden: `mode` de cada target, `workspace.host`, `run_as`, y que los recursos referencien variables en vez de valores fijos. «Prefijo [dev …]» o «schedule en pausa» → mode: development.",
    code: { lang: "yaml", text: `targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-1111111111111111.1.azuredatabricks.net

  prod:
    mode: production          # sin prefijos; schedules activos
    workspace:
      host: https://adb-2222222222222222.2.azuredatabricks.net
      root_path: /Workspace/Shared/.bundle/\${bundle.name}/\${bundle.target}
    run_as:
      service_principal_name: "00000000-0000-0000-0000-000000000000"` },
    refs: [{ t: "Databricks Asset Bundles", u: DOCA + "dev-tools/bundles/" }]
  },
  {
    id: "a-d4-02", mode: "audit", domain: "d4",
    objective: "Optimizar tablas Delta (OPTIMIZE, VACUUM)",
    title: "El mantenimiento que borró el pasado",
    context: "Política corporativa: debe poder consultarse cualquier versión de `prod.gold.saldos` de los últimos 30 días (time travel) para reconstruir informes regulatorios. Un job de mantenimiento semanal ejecuta este script «para ahorrar almacenamiento».",
    audit: { lang: "sql", text: `SET spark.databricks.delta.retentionDurationCheck.enabled = false;

OPTIMIZE prod.gold.saldos;

VACUUM prod.gold.saldos RETAIN 0 HOURS;` },
    question: "¿Cuál es el problema?",
    options: [
      { t: "`VACUUM … RETAIN 0 HOURS` elimina los archivos de versiones anteriores: rompe el time travel de 30 días (y puede afectar a lecturas o escrituras concurrentes).", ok: true,
        why: "VACUUM borra físicamente archivos no referenciados por la versión actual que superen la retención. Con 0 horas no queda ninguna versión anterior consultable. Desactivar la comprobación de seguridad es la señal de alarma." },
      { t: "`OPTIMIZE` debe ejecutarse después de `VACUUM`, no antes.", ok: false, dbu: 60, sla: 10,
        why: "El orden habitual es precisamente OPTIMIZE y luego VACUUM (para limpiar los archivos pequeños que OPTIMIZE dejó obsoletos). El orden no es el defecto." },
      { t: "`OPTIMIZE` sin `ZORDER BY` elimina el historial de la tabla.", ok: false, dbu: 70, sla: 10,
        why: "OPTIMIZE reescribe archivos en una nueva versión; no borra historial. Z-order es opcional." },
      { t: "Falta `REFRESH TABLE` tras el VACUUM para recuperar las versiones.", ok: false, dbu: 80, sla: 15,
        why: "REFRESH actualiza metadatos en caché; no puede restaurar archivos que VACUUM ya eliminó físicamente." }
    ],
    foundation: "El time travel depende de dos retenciones: los **archivos de datos** antiguos (`delta.deletedFileRetentionDuration`, 7 días por defecto, que es el umbral que respeta VACUUM) y el **registro de transacciones** (`delta.logRetentionDuration`, 30 días por defecto). Para garantizar 30 días de time travel hay que elevar la retención de archivos a 30 días y no ejecutar VACUUM con una retención menor.",
    heuristic: "`RETAIN 0 HOURS` o `retentionDurationCheck.enabled = false` → casi siempre es el error. OPTIMIZE = compacta (no borra historial); VACUUM = borra archivos antiguos (limita el time travel).",
    code: { lang: "sql", text: `-- Alinear la retención con la política de 30 días
ALTER TABLE prod.gold.saldos SET TBLPROPERTIES (
  'delta.deletedFileRetentionDuration' = 'interval 30 days',
  'delta.logRetentionDuration'         = 'interval 30 days'
);

OPTIMIZE prod.gold.saldos;

VACUUM prod.gold.saldos;                 -- respeta la retención configurada
-- VACUUM prod.gold.saldos DRY RUN;      -- lista lo que se eliminaría

-- Time travel
SELECT * FROM prod.gold.saldos TIMESTAMP AS OF '2026-10-20';
DESCRIBE HISTORY prod.gold.saldos;` },
    codeNote: "Según la documentación, a partir de Databricks Runtime 18.0 la retención se controla con la propiedad de tabla `deletedFileRetentionDuration` (en tablas managed de Unity Catalog, desde 12.2 LTS), y las consultas de time travel anteriores a ese umbral se bloquean.",
    refs: [{ t: "VACUUM", u: DOCA + "tables/operations/vacuum" }, { t: "OPTIMIZE", u: DOCA + "tables/operations/optimize" }]
  }
];
