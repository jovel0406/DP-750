/* Banco Modo Campaña: 12 escenarios arquitectónicos (3 por dominio).
   Cada opción lleva su propia autopsia (why) y su costo en DBU / SLA si se elige mal. */
window.DP750 = window.DP750 || {};
const DOC = "https://learn.microsoft.com/azure/databricks/";

DP750.SCENARIOS = [
  /* ───────────── DOMINIO 1 ───────────── */
  {
    id: "c-d1-01", mode: "campaign", domain: "d1",
    objective: "Elegir el tipo de cómputo apropiado",
    title: "El ETL nocturno que quemaba presupuesto",
    context: "Contoso Retail ejecuta cada noche a las 02:00 un ETL de 45 minutos que carga ventas a la capa silver. Hoy corre sobre un clúster all-purpose de 8 workers que el equipo deja encendido todo el día «para que arranque rápido». Finanzas detectó que es la línea más cara de la factura de Databricks.",
    constraints: ["El job no es interactivo: nadie lo observa mientras corre", "Debe seguir terminando antes de las 04:00", "Se exige aislamiento: ningún otro proceso debe competir por recursos"],
    question: "¿Qué configuración de cómputo recomiendas?",
    options: [
      { t: "Definir un job cluster (job compute) en la propia tarea del job, con autoscaling, que se crea al iniciar y se termina al finalizar.", ok: true,
        why: "El cómputo de jobs existe solo durante la ejecución, está aislado por diseño y se factura con una tarifa DBU inferior a all-purpose. Cumple costo, aislamiento y ventana." },
      { t: "Mantener el clúster all-purpose pero configurar auto-terminación a 30 minutos.", ok: false, dbu: 90, sla: 5,
        why: "Reduce el tiempo ocioso, pero sigue pagando tarifa all-purpose por una carga automatizada y el clúster puede compartirse con usuarios interactivos (sin aislamiento). Mejora parcial, no la óptima." },
      { t: "Ejecutar el ETL en un SQL warehouse Pro siempre encendido.", ok: false, dbu: 110, sla: 10,
        why: "Un SQL warehouse ejecuta SQL; no ejecuta notebooks PySpark. Además «siempre encendido» reproduce el problema de costo ocioso." },
      { t: "Crear un pool de instancias con 8 VMs inactivas permanentes y adjuntar el clúster all-purpose al pool.", ok: false, dbu: 120, sla: 5,
        why: "Un pool acelera el arranque, pero las VMs inactivas generan costo de infraestructura en Azure y el clúster sigue siendo all-purpose. Optimiza lo que no era el problema." }
    ],
    foundation: "Regla de arquitectura: **cargas automatizadas → job compute; trabajo interactivo → all-purpose**. El job cluster se aprovisiona para la ejecución y desaparece al terminar, de modo que no hay costo ocioso ni contención. Si el tiempo de arranque fuese crítico, las alternativas válidas serían cómputo serverless para jobs o un job cluster respaldado por un pool, no un all-purpose permanente.",
    heuristic: "Si lees «programado», «nocturno», «automatizado» o «producción» → descarta all-purpose. Si lees «exploración», «ad hoc», «desarrollo colaborativo» → all-purpose. Si lees «dashboard/BI/SQL» → SQL warehouse.",
    code: { lang: "yaml", text: `# Definición del job (formato Databricks Asset Bundles)
resources:
  jobs:
    etl_ventas_nocturno:
      name: etl_ventas_nocturno
      schedule:
        quartz_cron_expression: "0 0 2 * * ?"
        timezone_id: "America/Mexico_City"
      job_clusters:
        - job_cluster_key: etl_cluster
          new_cluster:
            spark_version: 15.4.x-scala2.12
            node_type_id: Standard_D8ds_v5
            autoscale:
              min_workers: 2
              max_workers: 8
      tasks:
        - task_key: cargar_silver
          job_cluster_key: etl_cluster     # job compute, no existing_cluster_id
          notebook_task:
            notebook_path: ../src/cargar_silver.py` },
    refs: [{ t: "Cómputo en Azure Databricks", u: DOC + "compute/" }, { t: "Lakeflow Jobs", u: DOC + "jobs/" }]
  },
  {
    id: "c-d1-02", mode: "campaign", domain: "d1",
    objective: "Configurar permisos y modo de acceso del cómputo",
    title: "Un clúster, seis analistas, cero fugas",
    context: "Seis ingenieros de datos de Fabrikam Salud compartirán un mismo clúster para desarrollar notebooks en Python y SQL. Todas las tablas están en Unity Catalog y cada ingeniero tiene privilegios distintos: algunos no pueden ver datos clínicos.",
    constraints: ["Un único clúster compartido (restricción de costo)", "Unity Catalog debe aplicar los privilegios de cada usuario individualmente", "El código de un usuario no debe poder acceder a las credenciales o datos de otro"],
    question: "¿Qué modo de acceso debe tener el clúster?",
    options: [
      { t: "Standard (anteriormente «Shared»).", ok: true,
        why: "Es el modo multiusuario con aislamiento entre usuarios y compatibilidad total con Unity Catalog: cada consulta se autoriza con la identidad de quien la ejecuta." },
      { t: "Dedicated (anteriormente «Single user») asignado al líder técnico.", ok: false, dbu: 70, sla: 10,
        why: "Un clúster dedicado a un usuario solo puede ser usado por ese usuario; los otros cinco no podrían adjuntarse. (Puede asignarse a un grupo, pero entonces el cómputo actúa con los permisos del grupo, no con los de cada persona: incumple el requisito de privilegios individuales.)" },
      { t: "No isolation shared.", ok: false, dbu: 100, sla: 20,
        why: "Es un modo heredado sin aislamiento y **no compatible con Unity Catalog**. Incumple dos de las tres restricciones." },
      { t: "Un SQL warehouse serverless.", ok: false, dbu: 60, sla: 10,
        why: "Aplica Unity Catalog por usuario, pero solo ejecuta SQL: no sirve para desarrollar notebooks en Python." }
    ],
    foundation: "El modo de acceso determina **quién** puede usar el cómputo y **cómo** se aplica la gobernanza. Standard aísla el código de cada usuario, lo que permite a Unity Catalog aplicar privilegios, row filters y column masks de forma segura en un clúster compartido. El precio es que ciertas APIs de bajo nivel están restringidas; cuando una carga las necesita, se usa Dedicated.",
    heuristic: "«Varios usuarios + Unity Catalog + aislamiento» → Standard/Shared. «Un usuario o carga que necesita capacidades no soportadas en Standard» → Dedicated/Single user. «No isolation» nunca es la respuesta si aparece Unity Catalog.",
    code: { lang: "json", text: `{
  "cluster_name": "dev-compartido-ingenieria",
  "spark_version": "15.4.x-scala2.12",
  "node_type_id": "Standard_D4ds_v5",
  "autoscale": { "min_workers": 1, "max_workers": 4 },
  "autotermination_minutes": 30,
  "data_security_mode": "USER_ISOLATION"
}` },
    codeNote: "En la API de clústeres, `USER_ISOLATION` corresponde al modo Standard/Shared y `SINGLE_USER` a Dedicated/Single user. Verifica los valores vigentes en la referencia de la API: Databricks ha ido introduciendo valores nuevos para este campo.",
    refs: [{ t: "Cómputo en Azure Databricks", u: DOC + "compute/" }]
  },
  {
    id: "c-d1-03", mode: "campaign", domain: "d1",
    objective: "Implementar un foreign catalog mediante conexiones",
    title: "Consultar el ERP sin mover un byte",
    context: "Northwind Logística tiene su ERP en Azure SQL Database. Los analistas necesitan cruzar, desde Databricks SQL, los pedidos del ERP con las tablas Delta del lakehouse. El equipo de plataforma prohíbe por ahora construir pipelines de ingesta para esas tablas: es una fase de exploración.",
    constraints: ["Sin copiar datos al lakehouse", "El acceso debe gobernarse con privilegios de Unity Catalog", "Las credenciales del ERP no pueden aparecer en notebooks"],
    question: "¿Qué solución implementas?",
    options: [
      { t: "Crear una CONNECTION a Azure SQL Database y un FOREIGN CATALOG sobre ella (Lakehouse Federation).", ok: true,
        why: "El foreign catalog refleja la base de datos externa dentro de Unity Catalog: se consulta con el espacio de nombres de tres niveles, se gobierna con GRANT y las credenciales viven en el objeto connection." },
      { t: "Crear una EXTERNAL LOCATION que apunte al servidor de Azure SQL Database.", ok: false, dbu: 70, sla: 10,
        why: "Las external locations referencian rutas de almacenamiento en la nube (p. ej. ADLS Gen2), no motores de base de datos." },
      { t: "Leer por JDBC desde un notebook, con usuario y contraseña obtenidos de un secret scope.", ok: false, dbu: 80, sla: 10,
        why: "Funciona técnicamente y protege la contraseña, pero las tablas no quedan registradas en Unity Catalog: no hay GRANT, ni linaje, ni acceso desde Databricks SQL para los analistas." },
      { t: "Pedir al equipo del ERP que publique las tablas mediante Delta Sharing.", ok: false, dbu: 90, sla: 15,
        why: "Delta Sharing comparte tablas Delta (u otros activos del lakehouse) desde un proveedor; Azure SQL Database no es un proveedor de Delta Sharing." }
    ],
    foundation: "Lakehouse Federation permite consultar orígenes externos **en el sitio**. Dos objetos de Unity Catalog lo hacen posible: la **connection** (tipo de origen + credenciales) y el **foreign catalog** (reflejo de una base de datos externa). Los filtros se intentan delegar al origen (pushdown). Es ideal para exploración, pruebas de concepto y consultas ocasionales; para cargas analíticas pesadas y recurrentes sigue siendo preferible ingerir.",
    heuristic: "«Consultar sin ingerir / sin copiar / sin ETL» + base de datos externa → connection + foreign catalog. External location = solo almacenamiento de archivos.",
    code: { lang: "sql", text: `-- 1) Conexión: credenciales encapsuladas, tomadas de un secret scope
CREATE CONNECTION erp_azuresql TYPE sqlserver
OPTIONS (
  host 'erp-northwind.database.windows.net',
  port '1433',
  user secret('kv-plataforma', 'erp-user'),
  password secret('kv-plataforma', 'erp-password')
);

-- 2) Foreign catalog: refleja la base de datos externa
CREATE FOREIGN CATALOG erp_fed
USING CONNECTION erp_azuresql
OPTIONS (database 'erp_prod');

-- 3) Gobernanza estándar de Unity Catalog
GRANT USE CATALOG ON CATALOG erp_fed TO \`analistas\`;
GRANT USE SCHEMA, SELECT ON SCHEMA erp_fed.dbo TO \`analistas\`;

-- 4) Consulta federada
SELECT p.pedido_id, e.estado_entrega
FROM erp_fed.dbo.pedidos AS p
JOIN prod.gold.entregas AS e ON e.pedido_id = p.pedido_id;` },
    refs: [{ t: "Lakehouse Federation", u: DOC + "query-federation/" }]
  },

  /* ───────────── DOMINIO 2 ───────────── */
  {
    id: "c-d2-01", mode: "campaign", domain: "d2",
    objective: "Configurar row filters y column masks",
    title: "Una tabla, doce regiones, un número de identidad",
    context: "La tabla `rrhh.core.empleados` contiene empleados de 12 regiones y una columna `num_identidad`. Cada gerente regional debe ver solo su región. Solo el grupo `rrhh_nomina` puede ver `num_identidad` completo; el resto debe ver los últimos 4 dígitos.",
    constraints: ["Una única tabla física (sin duplicar datos)", "Las regiones cambian con frecuencia: mínimo mantenimiento", "La regla debe aplicarse sin importar cómo se consulte la tabla"],
    question: "¿Qué diseño cumple las tres restricciones?",
    options: [
      { t: "Un row filter sobre `region` y un column mask sobre `num_identidad`, ambos como funciones SQL aplicadas a la tabla.", ok: true,
        why: "Las funciones se adjuntan a la tabla, así que se aplican en cualquier consulta. La lógica está centralizada y, con una tabla de mapeo usuario→región, añadir una región no requiere tocar código." },
      { t: "Crear 12 vistas dinámicas (una por región) y conceder SELECT sobre cada vista al gerente correspondiente.", ok: false, dbu: 80, sla: 5,
        why: "Protege los datos, pero multiplica objetos y permisos: cada región nueva exige vista + GRANT. Además, quien conserve acceso a la tabla base se salta la regla. Incumple «mínimo mantenimiento»." },
      { t: "Ejecutar `GRANT SELECT (nombre, region, puesto) ON TABLE …` excluyendo `num_identidad` para los no autorizados.", ok: false, dbu: 70, sla: 10,
        why: "Unity Catalog no admite GRANT a nivel de columna. Y aunque existiera, no resolvería el filtrado por región ni el enmascarado parcial." },
      { t: "Particionar la tabla por `region` y conceder permisos sobre cada partición.", ok: false, dbu: 90, sla: 10,
        why: "Las particiones no son objetos protegibles: no se pueden conceder privilegios sobre ellas. El particionado es una decisión de rendimiento, no de seguridad." }
    ],
    foundation: "Row filters y column masks son funciones SQL (UDF) que Unity Catalog evalúa en tiempo de consulta con la identidad del usuario. El **row filter** devuelve BOOLEAN y decide qué filas se ven; el **column mask** devuelve el valor (del mismo tipo que la columna) que verá cada usuario. Si la misma regla debe repetirse en muchas tablas, el siguiente paso es ABAC: políticas basadas en tags gobernados.",
    heuristic: "«Misma tabla, distintos usuarios ven distintas filas» → row filter. «Ocultar/ofuscar una columna» → column mask. «GRANT por columna» o «permisos por partición» → siempre falso. «Aplicar la regla a cientos de tablas por etiqueta» → ABAC.",
    code: { lang: "sql", text: `-- Row filter: el usuario ve solo las regiones que le asigna la tabla de mapeo
CREATE OR REPLACE FUNCTION rrhh.gov.filtro_region(region STRING)
RETURN is_account_group_member('rrhh_nomina')
    OR EXISTS (
         SELECT 1 FROM rrhh.gov.mapa_gerente_region m
         WHERE m.usuario = current_user() AND m.region = region
       );

ALTER TABLE rrhh.core.empleados
  SET ROW FILTER rrhh.gov.filtro_region ON (region);

-- Column mask: solo nómina ve el valor completo
CREATE OR REPLACE FUNCTION rrhh.gov.mask_identidad(num_identidad STRING)
RETURN CASE
  WHEN is_account_group_member('rrhh_nomina') THEN num_identidad
  ELSE concat('***-**-', right(num_identidad, 4))
END;

ALTER TABLE rrhh.core.empleados
  ALTER COLUMN num_identidad SET MASK rrhh.gov.mask_identidad;` },
    refs: [{ t: "Unity Catalog", u: DOC + "data-governance/unity-catalog/" }]
  },
  {
    id: "c-d2-02", mode: "campaign", domain: "d2",
    objective: "Autenticar acceso a recursos con managed identities",
    title: "La clave de la cuenta que todos conocían",
    context: "Tailspin Energía accede a su cuenta ADLS Gen2 mediante la clave de la cuenta de almacenamiento configurada en `spark.conf` dentro de los notebooks. Una auditoría lo marcó como hallazgo crítico. Se migrará a Unity Catalog con tablas externas sobre el contenedor `raw`.",
    constraints: ["Ningún secreto que rotar ni almacenar", "El acceso al almacenamiento debe gobernarse desde Unity Catalog", "Los usuarios no deben tener permisos directos sobre la cuenta de almacenamiento"],
    question: "¿Cuál es la arquitectura de autenticación correcta?",
    options: [
      { t: "Access Connector for Azure Databricks (managed identity) con rol sobre la cuenta de almacenamiento → storage credential → external location, y GRANT sobre la external location.", ok: true,
        why: "La managed identity no tiene secreto que rotar. Unity Catalog usa el storage credential para acceder, y los usuarios solo reciben privilegios sobre objetos de Unity Catalog, nunca sobre Azure Storage." },
      { t: "Registrar un service principal, guardar su client secret en un secret scope y configurar OAuth en `spark.conf` de cada clúster.", ok: false, dbu: 80, sla: 5,
        why: "Mejor que la clave de cuenta, pero sigue habiendo un secreto que caduca y rotar, y la configuración vive en el clúster, fuera del modelo de gobierno de Unity Catalog." },
      { t: "Guardar la clave de la cuenta en Azure Key Vault y leerla con `dbutils.secrets.get()`.", ok: false, dbu: 100, sla: 10,
        why: "Oculta la clave, pero sigue siendo una credencial con acceso total a la cuenta, sin granularidad ni gobierno por Unity Catalog. Incumple las tres restricciones." },
      { t: "Montar el contenedor con `dbutils.fs.mount()` y conceder a los usuarios el rol Storage Blob Data Reader en Azure.", ok: false, dbu: 110, sla: 15,
        why: "Los mounts son un patrón heredado que elude Unity Catalog, y otorgar roles de Azure a los usuarios contradice la restricción de no dar permisos directos." }
    ],
    foundation: "En Unity Catalog el acceso al almacenamiento se modela en dos objetos: el **storage credential** (la identidad, idealmente la managed identity de un Access Connector) y la **external location** (ruta + credential). Los usuarios nunca tocan la identidad: reciben `READ FILES`, `WRITE FILES` o `CREATE EXTERNAL TABLE` sobre la external location, o directamente privilegios sobre tablas y volúmenes.",
    heuristic: "«Sin secretos que rotar» → managed identity. «Azure Databricks + ADLS + Unity Catalog» → Access Connector. «Service principal» es la respuesta cuando hablan de identidades para jobs/CI-CD o acceso a datos por una aplicación; «mounts» y «clave de cuenta» son distractores heredados.",
    code: { lang: "sql", text: `-- Requisitos previos en Azure (portal / CLI / IaC):
--   1. Crear el recurso "Access Connector for Azure Databricks".
--   2. Asignar a su managed identity el rol Storage Blob Data Contributor
--      sobre la cuenta de almacenamiento.
--   3. Crear en Unity Catalog el storage credential 'cred_tailspin_mi'
--      apuntando al Access Connector (Catalog Explorer o API).

CREATE EXTERNAL LOCATION IF NOT EXISTS loc_tailspin_raw
URL 'abfss://raw@tailspinlake.dfs.core.windows.net/'
WITH (STORAGE CREDENTIAL cred_tailspin_mi)
COMMENT 'Zona raw - acceso mediante managed identity';

-- Los ingenieros pueden crear tablas externas ahí; nadie tiene roles en Azure
GRANT CREATE EXTERNAL TABLE, READ FILES
  ON EXTERNAL LOCATION loc_tailspin_raw TO \`ingenieria_datos\`;` },
    refs: [{ t: "Unity Catalog", u: DOC + "data-governance/unity-catalog/" }, { t: "Gestión de secretos", u: DOC + "security/secrets/" }]
  },
  {
    id: "c-d2-03", mode: "campaign", domain: "d2",
    objective: "Diseñar una estrategia segura de Delta Sharing",
    title: "El socio que no usa Databricks",
    context: "Adatum Seguros debe entregar diariamente la tabla `prod.gold.siniestros_agregados` a una reaseguradora externa. La reaseguradora no tiene Databricks: consume datos con pandas y Power BI.",
    constraints: ["Sin copias ni exportaciones de archivos", "El socio solo puede leer, y solo esa tabla", "El acceso debe poder revocarse y auditarse de forma centralizada"],
    question: "¿Qué estrategia implementas?",
    options: [
      { t: "Crear un share con la tabla, un recipient de tipo open sharing (credencial por token) y conceder SELECT sobre el share al recipient.", ok: true,
        why: "El protocolo abierto de Delta Sharing permite leer desde clientes que no son Databricks (pandas, Power BI, Spark OSS). El acceso es de solo lectura, limitado al share, revocable y auditable." },
      { t: "Crear un recipient Databricks-to-Databricks usando el identificador de metastore del socio.", ok: false, dbu: 60, sla: 10,
        why: "Ese flujo requiere que el destinatario tenga un workspace de Databricks con Unity Catalog. El socio no lo tiene." },
      { t: "Invitar a los usuarios del socio como invitados de Microsoft Entra ID y concederles SELECT sobre la tabla.", ok: false, dbu: 100, sla: 15,
        why: "Introduce identidades externas en tu workspace, amplía la superficie de ataque y obliga al socio a usar tu cómputo. No es compartición, es dar acceso interno." },
      { t: "Programar un job que exporte la tabla a Parquet en un contenedor con un SAS token para el socio.", ok: false, dbu: 110, sla: 10,
        why: "Crea copias, añade un pipeline que mantener y el SAS token queda fuera del gobierno de Unity Catalog. Incumple «sin copias» y «auditoría centralizada»." }
    ],
    foundation: "Delta Sharing tiene tres objetos: **share** (colección de activos de solo lectura), **recipient** (la identidad del destinatario) y el **provider** (quien comparte). Hay dos modalidades: **Databricks-to-Databricks** (el recipient se crea con el identificador de compartición del metastore del destinatario; sin tokens) y **open sharing** (el recipient recibe un archivo de credenciales con token; sirve para cualquier cliente compatible). Buenas prácticas de seguridad: caducidad de tokens, listas de acceso por IP y compartir solo lo necesario.",
    heuristic: "«El destinatario NO usa Databricks» → open sharing con token. «El destinatario tiene Databricks/Unity Catalog» → Databricks-to-Databricks. «Exportar archivos» o «crear usuarios invitados» nunca es la respuesta a «compartir de forma segura».",
    code: { lang: "sql", text: `-- Proveedor (Adatum)
CREATE SHARE IF NOT EXISTS share_reaseguro
  COMMENT 'Siniestros agregados para la reaseguradora';

ALTER SHARE share_reaseguro
  ADD TABLE prod.gold.siniestros_agregados;

-- Open sharing: sin USING ID => se genera un enlace de activación con token
CREATE RECIPIENT IF NOT EXISTS reaseguradora_ext
  COMMENT 'Consumidor externo sin Databricks';

GRANT SELECT ON SHARE share_reaseguro TO RECIPIENT reaseguradora_ext;

-- Variante Databricks-to-Databricks (si el socio tuviera Unity Catalog):
-- CREATE RECIPIENT socio_dbx USING ID '<identificador-de-comparticion>';

-- Revocar
-- REVOKE SELECT ON SHARE share_reaseguro FROM RECIPIENT reaseguradora_ext;` },
    codeNote: "La guía del examen habla de **Delta Sharing**; la documentación actual de Azure Databricks presenta esta funcionalidad como **OpenSharing**. Los objetos (share, recipient) y la sintaxis SQL son los mismos.",
    refs: [{ t: "Data sharing (OpenSharing / Delta Sharing)", u: DOC + "opensharing/" }]
  },

  /* ───────────── DOMINIO 3 ───────────── */
  {
    id: "c-d3-01", mode: "campaign", domain: "d3",
    objective: "Ingerir datos con Auto Loader / elegir herramienta de ingesta",
    title: "Dos millones de JSON al día",
    context: "Los dispositivos IoT de Wingtip Manufactura depositan unos 2 millones de archivos JSON pequeños al día en ADLS Gen2. El firmware se actualiza a menudo y añade campos nuevos sin aviso. La capa bronze debe alimentarse cada 15 minutos.",
    constraints: ["Cada archivo debe procesarse exactamente una vez", "Los campos nuevos no deben romper la ingesta ni perderse", "El costo de descubrir archivos nuevos no debe crecer con el histórico"],
    question: "¿Qué mecanismo de ingesta eliges?",
    options: [
      { t: "Auto Loader (`cloudFiles`) con `schemaLocation`, evolución de esquema y checkpoint, ejecutado con trigger `availableNow` cada 15 minutos.", ok: true,
        why: "Auto Loader registra qué archivos ya procesó (exactly-once con el checkpoint), infiere y evoluciona el esquema, y descubre archivos nuevos de forma eficiente incluso con directorios enormes." },
      { t: "`COPY INTO` programado cada 15 minutos.", ok: false, dbu: 70, sla: 10,
        why: "Es idempotente, pero está pensado para volúmenes moderados de archivos; con millones de archivos acumulados su descubrimiento escala peor que Auto Loader y su manejo de evolución de esquema es más limitado." },
      { t: "`spark.read.json()` sobre toda la ruta y `mode(\"overwrite\")` en bronze cada 15 minutos.", ok: false, dbu: 130, sla: 20,
        why: "Reprocesa todo el histórico en cada ejecución: el costo crece sin límite y no hay procesamiento incremental." },
      { t: "Structured Streaming con el origen de archivos nativo (`format(\"json\")`) y un esquema fijo.", ok: false, dbu: 90, sla: 15,
        why: "Es incremental, pero el descubrimiento por listado de directorios se degrada con millones de archivos y el esquema fijo descarta silenciosamente los campos nuevos." }
    ],
    foundation: "Auto Loader es un origen de Structured Streaming (`cloudFiles`) especializado en archivos en almacenamiento en la nube. Guarda el estado de descubrimiento en el **checkpoint** y el esquema inferido en **`cloudFiles.schemaLocation`**. Con `schemaEvolutionMode = addNewColumns` (el valor por defecto cuando no se proporciona esquema), al detectar una columna nueva el stream se detiene, registra el nuevo esquema y, al reiniciarse, la incorpora; los datos que no encajan van a `_rescued_data`.",
    heuristic: "«Millones de archivos», «llegada continua», «esquema cambiante» → Auto Loader. «Miles de archivos, SQL, idempotente» → COPY INTO. «Conector administrado a SaaS/BD» → Lakeflow Connect.",
    code: { lang: "python", text: `ruta_origen = "abfss://iot@wingtiplake.dfs.core.windows.net/telemetria/"
ruta_estado = "/Volumes/prod/bronze/_estado/telemetria"

(spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", f"{ruta_estado}/schema")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.inferColumnTypes", "true")
    .load(ruta_origen)
 .writeStream
    .option("checkpointLocation", f"{ruta_estado}/checkpoint")
    .option("mergeSchema", "true")          # la tabla destino acepta columnas nuevas
    .trigger(availableNow=True)             # procesa lo pendiente y termina
    .toTable("prod.bronze.telemetria"))` },
    refs: [{ t: "Auto Loader", u: DOC + "ingestion/cloud-object-storage/auto-loader/" }]
  },
  {
    id: "c-d3-02", mode: "campaign", domain: "d3",
    objective: "Diseñar particionado y estrategia de clustering",
    title: "La tabla de 60 GB con 40 000 particiones",
    context: "La tabla `prod.silver.transacciones` (60 GB) se creó con `PARTITIONED BY (cliente_id)`. Hay 40 000 clientes. Las consultas tardan minutos y el listado de archivos domina el tiempo. Los analistas filtran sobre todo por `cliente_id` y `fecha_tx`, pero el equipo de fraude empezará pronto a filtrar por `comercio_id`.",
    constraints: ["Reducir la latencia de consultas selectivas", "Poder cambiar las columnas de organización sin reescribir toda la tabla de inmediato", "Mínima operación manual"],
    question: "¿Qué rediseño propones para la tabla?",
    options: [
      { t: "Recrearla sin particiones y con liquid clustering: `CLUSTER BY (cliente_id, fecha_tx)`.", ok: true,
        why: "Liquid clustering maneja columnas de alta cardinalidad sin generar miles de directorios, es incremental y las claves pueden cambiarse después con `ALTER TABLE … CLUSTER BY`." },
      { t: "Mantener la partición por `cliente_id` y añadir `OPTIMIZE … ZORDER BY (fecha_tx)`.", ok: false, dbu: 100, sla: 15,
        why: "El problema de raíz es la partición por una columna de alta cardinalidad: 40 000 particiones en 60 GB implican archivos diminutos. Z-order dentro de cada partición no lo corrige." },
      { t: "Particionar por `fecha_tx` y aplicar `ZORDER BY (cliente_id)`.", ok: false, dbu: 60, sla: 5,
        why: "Es el patrón clásico y mejoraría la situación, pero 60 GB es una tabla pequeña para particionar, Z-order no es incremental y cambiar a `comercio_id` exige re-optimizar. Subóptimo frente a liquid clustering." },
      { t: "Particionar por `(cliente_id, fecha_tx)` para afinar más el pruning.", ok: false, dbu: 140, sla: 20,
        why: "Multiplica la cardinalidad de particiones y agrava el problema de archivos pequeños y de listado de metadatos." }
    ],
    foundation: "Particionar crea un directorio por valor: solo conviene con columnas de **baja cardinalidad** en tablas **muy grandes**. Sobre-particionar produce miles de archivos pequeños y sobrecarga de metadatos. **Liquid clustering** agrupa los datos por las claves indicadas sin directorios físicos, se aplica incrementalmente con `OPTIMIZE` (o automáticamente con predictive optimization en tablas managed) y permite redefinir claves. No puede combinarse con particionado ni con Z-order en la misma tabla.",
    heuristic: "«Alta cardinalidad», «patrones de consulta cambiantes», «tabla nueva» → liquid clustering. «Tabla pequeña + particionada» → el particionado ES el error. Si una opción combina `PARTITIONED BY` con `CLUSTER BY`, es inválida.",
    code: { lang: "sql", text: `-- Recrear sin particiones y con liquid clustering
CREATE OR REPLACE TABLE prod.silver.transacciones_lc
CLUSTER BY (cliente_id, fecha_tx)
AS SELECT * FROM prod.silver.transacciones;

-- Aplicar el clustering a los datos (incremental en ejecuciones posteriores)
OPTIMIZE prod.silver.transacciones_lc;

-- Meses después: fraude filtra por comercio_id. Se cambian las claves sin recrear.
ALTER TABLE prod.silver.transacciones_lc
  CLUSTER BY (cliente_id, comercio_id, fecha_tx);

-- Alternativa: dejar que Databricks elija las claves según las consultas
-- ALTER TABLE prod.silver.transacciones_lc CLUSTER BY AUTO;` },
    codeNote: "`CLUSTER BY AUTO` requiere tablas managed de Unity Catalog con predictive optimization; confirma los requisitos vigentes en la documentación.",
    refs: [{ t: "Liquid clustering", u: DOC + "tables/clustering" }, { t: "OPTIMIZE", u: DOC + "tables/operations/optimize" }]
  },
  {
    id: "c-d3-03", mode: "campaign", domain: "d3",
    objective: "Elegir tipo de SCD e ingerir datos con CDC",
    title: "Los cambios que llegaban desordenados",
    context: "Un sistema CRM emite un feed CDC de clientes (insert/update/delete) hacia la capa bronze. Por reintentos de red, los eventos pueden llegar fuera de orden. Cada evento trae `cliente_id`, `operacion` y `ts_evento`. Auditoría exige poder responder: «¿qué dirección tenía este cliente el 3 de marzo?».",
    constraints: ["Conservar el historial completo de cambios", "Resolver correctamente eventos tardíos o desordenados", "Mínimo código propio que mantener"],
    question: "¿Cómo construyes la dimensión `silver.dim_cliente`?",
    options: [
      { t: "Un flujo AUTO CDC (antes APPLY CHANGES INTO) en Lakeflow Spark Declarative Pipelines con `KEYS (cliente_id)`, `SEQUENCE BY ts_evento` y `STORED AS SCD TYPE 2`.", ok: true,
        why: "SCD Tipo 2 conserva la historia con columnas de vigencia, `SEQUENCE BY` resuelve el orden lógico aunque los eventos lleguen desordenados, y todo es declarativo." },
      { t: "Un `MERGE INTO` dentro de `foreachBatch` que actualiza cuando coincide la clave e inserta cuando no.", ok: false, dbu: 80, sla: 15,
        why: "Así escrito es SCD Tipo 1 (sobrescribe) y no maneja el desorden: un evento antiguo que llega tarde pisaría un valor más reciente. Hacerlo bien exige bastante código propio." },
      { t: "El mismo flujo AUTO CDC pero `STORED AS SCD TYPE 1`.", ok: false, dbu: 60, sla: 10,
        why: "Resuelve el orden, pero Tipo 1 solo guarda el estado actual: no se puede responder a la pregunta de auditoría." },
      { t: "Tabla append-only con todos los eventos y una vista que tome la última fila por cliente con `ROW_NUMBER()`.", ok: false, dbu: 90, sla: 15,
        why: "Conserva los eventos, pero la vista solo da el estado actual, los deletes hay que tratarlos a mano, cada consulta recalcula la ventana y no hay vigencias para consultas «a fecha»." }
    ],
    foundation: "AUTO CDC implementa la lógica de CDC de forma declarativa: `KEYS` identifica la entidad, `SEQUENCE BY` define el orden lógico (los eventos tardíos se colocan donde corresponde), `APPLY AS DELETE WHEN` trata los borrados y `STORED AS SCD TYPE 1|2` decide si se sobrescribe o se historiza. En Tipo 2 el destino incluye las columnas `__START_AT` y `__END_AT`.",
    heuristic: "«Historial», «auditoría», «valor a una fecha» → SCD Tipo 2. «Solo el estado actual» → Tipo 1. «Fuera de orden» + «mínimo código» → AUTO CDC / APPLY CHANGES con SEQUENCE BY, no MERGE manual.",
    code: { lang: "sql", text: `CREATE OR REFRESH STREAMING TABLE silver.dim_cliente;

CREATE FLOW flujo_dim_cliente AS AUTO CDC INTO silver.dim_cliente
FROM STREAM(bronze.crm_clientes_cdc)
KEYS (cliente_id)
APPLY AS DELETE WHEN operacion = 'DELETE'
SEQUENCE BY ts_evento
COLUMNS * EXCEPT (operacion, ts_evento)
STORED AS SCD TYPE 2;

-- Consulta "a fecha": dirección vigente el 3 de marzo
SELECT cliente_id, direccion
FROM silver.dim_cliente
WHERE cliente_id = 1042
  AND __START_AT <= '2026-03-03'
  AND (__END_AT > '2026-03-03' OR __END_AT IS NULL);` },
    codeNote: "Sintaxis anterior equivalente: `APPLY CHANGES INTO silver.dim_cliente FROM STREAM(…) KEYS … SEQUENCE BY … STORED AS SCD TYPE 2`. En Python: `dp.create_auto_cdc_flow(…)` (antes `dlt.apply_changes(…)`). El examen puede usar cualquiera de las dos.",
    refs: [{ t: "AUTO CDC", u: DOC + "ldp/cdc" }]
  },

  /* ───────────── DOMINIO 4 ───────────── */
  {
    id: "c-d4-01", mode: "campaign", domain: "d4",
    objective: "Configurar, empaquetar y desplegar Databricks Asset Bundles",
    title: "«En mi workspace sí funcionaba»",
    context: "El equipo de Litware promueve cambios a producción exportando notebooks y recreando los jobs a mano en el workspace de prod. Los últimos tres incidentes se debieron a diferencias de configuración entre dev y prod. Usan Git con pull requests y Azure DevOps.",
    constraints: ["Código y definición de jobs/pipelines versionados juntos", "El mismo artefacto se despliega en dev y prod, cambiando solo parámetros de entorno", "En prod, los jobs deben ejecutarse con una identidad no personal"],
    question: "¿Qué enfoque de despliegue implementas?",
    options: [
      { t: "Databricks Asset Bundles: `databricks.yml` con targets `dev` y `prod`, despliegue desde el pipeline de CI/CD con `databricks bundle deploy -t prod` y `run_as` con un service principal.", ok: true,
        why: "Un bundle empaqueta código y recursos como configuración declarativa versionada; los targets parametrizan cada entorno y `run_as` fija la identidad de ejecución." },
      { t: "Conectar una carpeta Git en prod y hacer `pull` de la rama main; los jobs se siguen creando desde la interfaz.", ok: false, dbu: 80, sla: 10,
        why: "Versiona el código, pero no la definición de jobs, clústeres ni permisos: la deriva de configuración (la causa de los incidentes) persiste." },
      { t: "Un notebook «instalador» que llama a la REST API de Jobs con JSON embebido para crear los jobs en cada workspace.", ok: false, dbu: 90, sla: 10,
        why: "Reinventa de forma imperativa lo que los bundles hacen de forma declarativa: sin validación, sin control de estado y difícil de mantener." },
      { t: "Clonar el workspace de dev sobre prod con la herramienta de exportación/importación en cada release.", ok: false, dbu: 120, sla: 20,
        why: "Copia también experimentos y configuraciones propias de dev, no parametriza entornos y no es un proceso reproducible ni revisable por pull request." }
    ],
    foundation: "Un **bundle** es un proyecto con `databricks.yml` que declara recursos (jobs, pipelines, etc.) junto al código. Los **targets** definen entornos: workspace, variables, modo y permisos. `mode: development` añade un prefijo a los recursos y pausa schedules para no interferir; `mode: production` aplica validaciones más estrictas. El ciclo habitual en CI/CD es `validate` → `deploy` → `run`, autenticando con un service principal.",
    heuristic: "«CI/CD», «infraestructura como código», «mismo código en dev/test/prod», «empaquetar jobs y pipelines» → Databricks Asset Bundles. «Identidad no personal» → service principal + `run_as`.",
    code: { lang: "yaml", text: `# databricks.yml
bundle:
  name: litware_etl

include:
  - resources/*.yml

variables:
  catalogo:
    description: Catálogo de destino
    default: dev

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-1111111111111111.1.azuredatabricks.net

  prod:
    mode: production
    workspace:
      host: https://adb-2222222222222222.2.azuredatabricks.net
      root_path: /Workspace/Shared/.bundle/\${bundle.name}/\${bundle.target}
    variables:
      catalogo: prod
    run_as:
      service_principal_name: "00000000-0000-0000-0000-000000000000"

# Pipeline de CI/CD:
#   databricks bundle validate -t prod
#   databricks bundle deploy   -t prod
#   databricks bundle run      -t prod etl_diario` },
    codeNote: "La guía del examen dice **Databricks Asset Bundles**; la documentación actual los llama **Declarative Automation Bundles**. Los comandos `databricks bundle …` y el archivo `databricks.yml` no cambian.",
    refs: [{ t: "Bundles", u: DOC + "dev-tools/bundles/" }]
  },
  {
    id: "c-d4-02", mode: "campaign", domain: "d4",
    objective: "Diagnosticar y reparar ejecuciones en Lakeflow Jobs",
    title: "Falló la tarea 7 de 9, tras tres horas",
    context: "Un job de Lakeflow con 9 tareas encadenadas lleva 3 horas de ejecución cuando la tarea 7 (`cargar_gold_finanzas`) falla porque un servicio externo devolvió un error 503 momentáneo. Las tareas 1 a 6 terminaron correctamente; las 8 y 9 dependen de la 7. El cierre financiero necesita los datos en 40 minutos.",
    constraints: ["No repetir trabajo ya completado", "Minimizar consumo de cómputo", "Evitar que un error transitorio similar vuelva a requerir intervención manual"],
    question: "¿Qué haces ahora y qué cambias para el futuro?",
    options: [
      { t: "Usar «Repair run» para re-ejecutar solo la tarea 7 y sus dependientes, y configurar reintentos automáticos en la tarea.", ok: true,
        why: "Repair run reutiliza los resultados de las tareas exitosas y ejecuta únicamente las fallidas y las que dependen de ellas. Los reintentos por tarea absorben fallos transitorios sin intervención." },
      { t: "Pulsar «Run now» para lanzar el job completo de nuevo.", ok: false, dbu: 130, sla: 25,
        why: "Repite 3 horas de trabajo ya terminado: incumple el plazo de 40 minutos y duplica el consumo." },
      { t: "Ejecutar manualmente los notebooks de las tareas 7, 8 y 9 en un clúster all-purpose.", ok: false, dbu: 90, sla: 10,
        why: "Puede entregar los datos, pero fuera del job: sin parámetros ni identidad del job, sin registro en el historial de ejecuciones y a tarifa all-purpose. Y no previene la recurrencia." },
      { t: "Clonar el job, eliminar las tareas 1 a 6 del clon y ejecutarlo.", ok: false, dbu: 70, sla: 15,
        why: "Es un «repair» artesanal: genera un job huérfano, pierde la trazabilidad de la ejecución original y es propenso a errores." }
    ],
    foundation: "Lakeflow Jobs modela dependencias entre tareas. Ante un fallo parcial, **Repair run** crea un nuevo intento dentro de la misma ejecución, conservando las tareas exitosas. Para la resiliencia preventiva: **reintentos por tarea** (número máximo e intervalo), **notificaciones** en fallo o duración excesiva, y condiciones **Run if** para rutas de compensación.",
    heuristic: "«Falló una tarea intermedia» + «no repetir lo ya hecho» → Repair run. «Fallo transitorio/intermitente» → política de reintentos. «Run now» es el distractor caro.",
    code: { lang: "yaml", text: `resources:
  jobs:
    cierre_financiero:
      name: cierre_financiero
      email_notifications:
        on_failure: ["datos-oncall@litware.example"]
      tasks:
        - task_key: cargar_gold_finanzas
          depends_on:
            - task_key: validar_silver
          notebook_task:
            notebook_path: ../src/cargar_gold_finanzas.py
          max_retries: 3                     # absorbe errores transitorios
          min_retry_interval_millis: 60000   # espera 1 min entre intentos
          retry_on_timeout: true
          timeout_seconds: 3600

        - task_key: notificar_fallo
          depends_on:
            - task_key: cargar_gold_finanzas
          run_if: AT_LEAST_ONE_FAILED        # ruta de compensación
          notebook_task:
            notebook_path: ../src/notificar_fallo.py` },
    refs: [{ t: "Lakeflow Jobs", u: DOC + "jobs/" }]
  },
  {
    id: "c-d4-03", mode: "campaign", domain: "d4",
    objective: "Investigar skew, spill y shuffle con Spark UI",
    title: "199 tareas en segundos, una en 47 minutos",
    context: "Un job une `ventas` (2 000 millones de filas) con `tiendas` (3 000 filas) por `tienda_id`. En Spark UI, el stage del join muestra 200 tareas: 199 terminan en menos de 10 segundos y una tarda 47 minutos, con «Spill (disk)» de 80 GB. El 35 % de las ventas pertenece a la tienda online (`tienda_id = 0`).",
    constraints: ["Reducir la duración sin aumentar el tamaño del clúster", "La corrección debe atacar la causa raíz"],
    question: "¿Cuál es el diagnóstico y la corrección adecuada?",
    options: [
      { t: "Data skew en la clave del join. Forzar un broadcast join de `tiendas` (y verificar que AQE con skew join está activo).", ok: true,
        why: "Una tarea desproporcionada con spill es la firma del skew. Como `tiendas` es diminuta, difundirla (broadcast) elimina el shuffle de `ventas` por `tienda_id` y, con él, la partición gigante." },
      { t: "Falta capacidad: duplicar el número de workers.", ok: false, dbu: 140, sla: 15,
        why: "La partición sesgada la procesa una sola tarea en un solo executor. Más workers aceleran las 199 tareas que ya eran rápidas y dejan intacta la lenta." },
      { t: "Aumentar `spark.sql.shuffle.partitions` de 200 a 2000.", ok: false, dbu: 70, sla: 15,
        why: "Todas las filas con `tienda_id = 0` siguen yendo a la misma partición, porque el hash de una misma clave es siempre el mismo. Solo se crean más particiones pequeñas." },
      { t: "Hacer `cache()` del DataFrame `ventas` antes del join.", ok: false, dbu: 110, sla: 20,
        why: "El cache evita recalcular, no redistribuye datos. Cachear 2 000 millones de filas además presiona la memoria y puede empeorar el spill." }
    ],
    foundation: "**Skew** = unas pocas claves concentran gran parte de los datos, de modo que tras el shuffle una partición es enorme. Síntomas en Spark UI: máximo de duración/tamaño de tarea muy por encima de la mediana y spill a disco. Correcciones por orden de preferencia: (1) evitar el shuffle con **broadcast join** si un lado es pequeño; (2) dejar que **AQE** divida particiones sesgadas (`spark.sql.adaptive.skewJoin.enabled`, activo por defecto en runtimes actuales); (3) **salting** de la clave cuando lo anterior no basta.",
    heuristic: "«Una/pocas tareas muchísimo más lentas que el resto» → skew, nunca «más nodos». «Tabla pequeña en el join» → broadcast. «Spill» → partición demasiado grande para la memoria.",
    code: { lang: "python", text: `from pyspark.sql import functions as F

ventas  = spark.table("prod.silver.ventas")     # 2 000 M filas, sesgada en tienda_id = 0
tiendas = spark.table("prod.silver.tiendas")    # 3 000 filas

# 1) Evitar el shuffle: difundir la tabla pequeña a todos los executors
resultado = ventas.join(F.broadcast(tiendas), "tienda_id")

# 2) Red de seguridad: AQE divide particiones sesgadas en joins con shuffle
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# 3) Si ambos lados fueran grandes: salting de la clave caliente
N = 32
ventas_salt  = ventas.withColumn("sal", (F.rand() * N).cast("int"))
tiendas_salt = tiendas.crossJoin(spark.range(N).withColumnRenamed("id", "sal"))
resultado_salt = ventas_salt.join(tiendas_salt, ["tienda_id", "sal"]).drop("sal")` },
    refs: [{ t: "Adaptive Query Execution", u: DOC + "optimizations/aqe" }]
  }
];
