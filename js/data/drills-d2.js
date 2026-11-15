/* Preguntas de concepto · Dominio 2 (mismo formato que drills-d1.js). */
window.DP750 = window.DP750 || {};
DP750.DRILLS = (DP750.DRILLS || []).concat([

/* ───── 2.1 Secure Unity Catalog objects ───── */
["2.1", "Conceder privilegios a un service principal", "El principal que es una aplicación",
 "Debes conceder SELECT sobre un esquema al service principal que ejecuta un job. ¿Cómo se identifica el service principal en la sentencia GRANT?",
 ["Por su application ID, entre acentos graves.", "La documentación indica que un service principal se representa por su valor applicationId, y que los nombres con caracteres especiales van entre acentos graves."],
 [["Por el nombre del job que ejecuta.", "Los privilegios se conceden a identidades (usuarios, grupos, service principals), no a jobs."],
  ["Por su client secret.", "El secreto es una credencial de autenticación; nunca aparece en sentencias de autorización."],
  ["No se puede: los service principals solo reciben privilegios a través de un usuario humano.", "Falso: son principals de pleno derecho, igual que usuarios y grupos."]],
 "En Unity Catalog un **principal** puede ser un usuario, un grupo o un service principal. `GRANT <privilegio> ON <tipo> <objeto> TO <principal>`. Lo habitual es conceder a **grupos** y añadir a ellos usuarios y service principals.",
 "Service principal en SQL → su application ID (GUID) entre acentos graves.",
 "sql", `GRANT USE CATALOG ON CATALOG prod TO \`7c1e2a9b-3f4d-4c5e-8a6b-0d1e2f3a4b5c\`;
GRANT USE SCHEMA, SELECT ON SCHEMA prod.gold TO \`7c1e2a9b-3f4d-4c5e-8a6b-0d1e2f3a4b5c\`;`, ["Manage privileges", "data-governance/unity-catalog/manage-privileges/"]],

["2.1", "Conceder privilegios (herencia)", "Las tablas del futuro",
 "Se ejecuta `GRANT SELECT ON SCHEMA prod.gold TO analistas`. La semana siguiente se crea la tabla `prod.gold.margen`. ¿Pueden leerla los analistas (suponiendo que tienen USE CATALOG y USE SCHEMA)?",
 ["Sí: un privilegio concedido en un contenedor se aplica a todos sus objetos hijos, actuales y futuros.", "Así funciona la herencia de privilegios en Unity Catalog."],
 [["No: hay que repetir el GRANT por cada tabla nueva.", "Solo sería necesario si el privilegio se hubiese concedido tabla por tabla."],
  ["Solo si el propietario de la tabla nueva lo aprueba.", "La herencia es automática; no requiere aprobación."],
  ["Solo tras ejecutar `REFRESH` sobre el esquema.", "No existe tal requisito para que la herencia surta efecto."]],
 "**Herencia de privilegios**: conceder un privilegio sobre un catálogo o esquema lo aplica automáticamente a todos los objetos hijos presentes y futuros. Es potente y peligroso a la vez: `SELECT` sobre un catálogo permite leer todas sus tablas.",
 "GRANT en esquema/catálogo = vale para lo que exista hoy y lo que se cree mañana.",
 "sql", `GRANT SELECT ON SCHEMA prod.gold TO \`analistas\`;

-- Más tarde:
CREATE TABLE prod.gold.margen AS SELECT ...;
-- 'analistas' ya puede leer prod.gold.margen sin ningún GRANT adicional`, ["Permissions concepts", "data-governance/unity-catalog/access-control/permissions-concepts"]],

["2.1", "Conceder privilegios (BROWSE)", "Ver que existe, sin ver el contenido",
 "Quieres que toda la empresa pueda descubrir qué tablas existen en el catálogo `prod` y ver sus metadatos para solicitar acceso, pero sin poder leer ningún dato. ¿Qué concedes?",
 ["BROWSE sobre el catálogo.", "BROWSE permite descubrir objetos, ver sus metadatos y solicitar acceso sin necesitar USE CATALOG ni USE SCHEMA; se concede a nivel de catálogo."],
 [["SELECT sobre el catálogo.", "Permitiría leer todos los datos (con los privilegios de uso)."],
  ["USE CATALOG sobre el catálogo.", "Es un requisito para operar con objetos hijos, pero no es el privilegio diseñado para el descubrimiento de metadatos."],
  ["ALL PRIVILEGES sobre el catálogo.", "Concede prácticamente todo: lo opuesto a lo que se pide."]],
 "**BROWSE** separa el *descubrimiento* del *acceso*: los usuarios encuentran los datos en Catalog Explorer, la búsqueda o el linaje y piden permiso, sin haber visto una sola fila.",
 "«Descubrir / ver metadatos / solicitar acceso» sin leer datos → BROWSE.",
 "sql", `GRANT BROWSE ON CATALOG prod TO \`account users\`;`, ["Privileges reference", "data-governance/unity-catalog/access-control/privileges-reference"]],

["2.1", "Conceder privilegios (delegación)", "Delegar la gestión de permisos",
 "La propietaria de una tabla quiere que un compañero pueda conceder y revocar privilegios sobre ella, sin transferirle la propiedad. ¿Qué le concede?",
 ["El privilegio MANAGE sobre la tabla.", "MANAGE permite gestionar privilegios, transferir propiedad, renombrar y eliminar el objeto, sin ser su propietario."],
 [["ALL PRIVILEGES sobre la tabla.", "ALL PRIVILEGES no incluye MANAGE: podría leer y escribir, pero no gestionar permisos."],
  ["MODIFY sobre la tabla.", "MODIFY es para modificar datos, no permisos."],
  ["Hacerlo administrador del workspace.", "Rol excesivo y que no otorga por sí mismo la gestión de privilegios de ese objeto."]],
 "Pueden gestionar los privilegios de un objeto: su **propietario**, el propietario del catálogo o esquema que lo contiene, y cualquier usuario con **MANAGE** sobre el objeto. `ALL PRIVILEGES` excluye expresamente MANAGE (y también EXTERNAL USE SCHEMA, EXTERNAL USE LOCATION y READ METADATA).",
 "«Gestionar permisos sin ser propietario» → MANAGE. Recuerda: ALL PRIVILEGES ≠ MANAGE.",
 "sql", `GRANT MANAGE ON TABLE prod.gold.margen TO \`ana.lopez@contoso.com\`;

-- Transferir la propiedad (acción distinta)
ALTER TABLE prod.gold.margen OWNER TO \`equipo_finanzas\`;`, ["Manage privileges", "data-governance/unity-catalog/manage-privileges/"]],

["2.1", "Conceder privilegios (mínimo privilegio para escribir)", "El job que solo añade filas",
 "Un service principal ejecuta un job que únicamente hace `INSERT INTO prod.silver.eventos`. Aplicando mínimo privilegio, ¿qué necesita?",
 ["USE CATALOG en `prod`, USE SCHEMA en `prod.silver` y MODIFY sobre la tabla.", "Los privilegios de uso permiten llegar al objeto y MODIFY permite añadir, actualizar y borrar datos."],
 [["Solo MODIFY sobre la tabla.", "Sin USE CATALOG y USE SCHEMA no puede acceder a la tabla."],
  ["ALL PRIVILEGES sobre el esquema.", "Funcionaría, pero concede lectura, escritura y creación sobre todo el esquema."],
  ["Ser propietario de la tabla.", "Otorga control total, incluido eliminarla y gestionar sus permisos."]],
 "Lectura → `SELECT`. Escritura → `MODIFY`. Ambos exigen los privilegios de uso sobre catálogo y esquema. Operaciones que leen y escriben (MERGE, UPDATE con subconsultas) necesitan SELECT y MODIFY. La referencia actual lista además privilegios DML más finos (INSERT, UPDATE, DELETE).",
 "Escribir = usage + MODIFY. Leer = usage + SELECT. Descarta ALL PRIVILEGES y OWNER si existe una opción más ajustada.",
 "sql", `GRANT USE CATALOG ON CATALOG prod              TO \`sp-ingesta\`;
GRANT USE SCHEMA  ON SCHEMA  prod.silver       TO \`sp-ingesta\`;
GRANT MODIFY      ON TABLE   prod.silver.eventos TO \`sp-ingesta\`;`, ["Privileges reference", "data-governance/unity-catalog/access-control/privileges-reference"]],

["2.1", "Acceder a secretos de Azure Key Vault", "Dónde se rota el secreto",
 "Un notebook lee la contraseña de una base de datos desde un secret scope respaldado por Azure Key Vault. Seguridad exige rotar la contraseña. ¿Dónde se actualiza el secreto?",
 ["En Azure Key Vault; el scope respaldado por Key Vault es una interfaz de solo lectura.", "La documentación lo define como una interfaz de solo lectura al Key Vault: los secretos se gestionan en Azure."],
 [["Con `dbutils.secrets.put()` desde el notebook.", "No se pueden escribir secretos en un scope respaldado por Key Vault desde Databricks."],
  ["En la configuración de Spark del clúster.", "Pondría la contraseña en texto plano en la configuración."],
  ["En una tabla de Unity Catalog con column mask.", "Las tablas no son un almacén de secretos."]],
 "Hay dos tipos de secret scope de workspace: **respaldado por Azure Key Vault** (solo lectura desde Databricks; gestión y rotación en Azure) y **respaldado por Databricks** (almacenado en una base cifrada gestionada por Databricks). El código es idéntico: `dbutils.secrets.get(scope, key)`. Databricks intenta ocultar los valores en la salida de los notebooks.",
 "Scope respaldado por Key Vault → leer en Databricks, administrar en Azure.",
 "python", `password = dbutils.secrets.get(scope="kv-plataforma", key="erp-password")

df = (spark.read.format("jdbc")
        .option("url", "jdbc:sqlserver://erp.database.windows.net:1433;database=erp")
        .option("user", "svc_lectura")
        .option("password", password)      # la salida se muestra como [REDACTED]
        .option("dbtable", "dbo.pedidos")
        .load())`, ["Workspace secret scopes", "security/secrets/workspace-secret-scopes"]],

["2.1", "Acceder a secretos de Azure Key Vault", "Un scope, todos los secretos",
 "Los equipos de Finanzas y Marketing comparten un único secret scope. Marketing no debe poder leer las credenciales de Finanzas. ¿Cuál es el problema y la solución?",
 ["Los permisos se aplican al scope completo, no a cada secreto: hay que usar scopes separados por equipo.", "La documentación indica que quien puede leer un secreto de un scope puede leerlos todos."],
 [["Basta con conceder READ solo sobre las claves de Marketing dentro del scope.", "Los secret scopes de workspace no tienen control de acceso a nivel de secreto."],
  ["Basta con prefijar las claves con el nombre del equipo.", "El nombre de la clave no restringe el acceso."],
  ["Hay que aplicar un row filter al scope.", "Los row filters son para tablas de Unity Catalog."]],
 "En un **secret scope de workspace** los permisos (READ, WRITE, MANAGE) se asignan al scope entero. Para aislar equipos se crean scopes distintos (y, en el caso de Key Vault, vaults distintos). Los secretos de Unity Catalog, más recientes, sí permiten privilegios por secreto.",
 "Aislamiento de secretos entre equipos → un scope por equipo.",
 "bash", `databricks secrets put-acl kv-finanzas  finanzas  READ
databricks secrets put-acl kv-marketing marketing READ
databricks secrets list-acls kv-finanzas`, ["Workspace secret scopes", "security/secrets/workspace-secret-scopes"]],

["2.1", "Acceder a secretos de Azure Key Vault", "El vault con RBAC",
 "Al crear un secret scope respaldado por un Azure Key Vault recién creado, la operación falla. El vault usa el modelo de permisos por defecto. ¿Cuál es la causa más probable?",
 ["Los secret scopes respaldados por Key Vault solo admiten el modelo «Vault access policy»; los vaults nuevos usan Azure RBAC por defecto.", "La documentación lo indica expresamente y pide cambiar el modelo de permisos antes de crear el scope."],
 [["Los secret scopes respaldados por Key Vault solo funcionan con vaults de otra suscripción.", "No existe tal requisito."],
  ["Hay que crear primero un scope respaldado por Databricks con el mismo nombre.", "Son tipos de scope independientes."],
  ["Key Vault no es compatible con Azure Databricks.", "Sí lo es: es una integración documentada."]],
 "Crear un scope respaldado por Key Vault requiere el rol Contributor u Owner sobre el vault, y concede a la aplicación de Azure Databricks los permisos **Get** y **List** mediante *access policies*. Si el vault usa Azure RBAC, hay que cambiarlo a *Vault access policy*.",
 "Fallo al crear el scope con Key Vault nuevo → revisar el modelo de permisos del vault (access policy, no RBAC) y tu rol sobre él.",
 "bash", `# Requisitos antes de crear el scope respaldado por Key Vault:
#  1. Rol Contributor u Owner sobre el vault.
#  2. Modelo de permisos del vault: "Vault access policy" (no Azure RBAC).
#  3. Crear el scope desde la UI del workspace (o la CLI) indicando
#     el DNS name y el resource ID del vault.

databricks secrets list-scopes
databricks secrets put-acl kv-plataforma ingenieria_datos READ`, ["Workspace secret scopes", "security/secrets/workspace-secret-scopes"]],

["2.1", "Autenticar acceso a datos con service principals", "El job huérfano",
 "Un job de producción falla cada vez que la persona que lo creó cambia de equipo y pierde permisos. ¿Cuál es la solución recomendada?",
 ["Configurar el job para ejecutarse como («Run as») un service principal con los permisos necesarios.", "El job se ejecuta con la identidad y los permisos del service principal, sin depender de ningún usuario."],
 [["Dar a todos los miembros del equipo permisos de propietario sobre las tablas.", "Amplía privilegios y sigue dependiendo de personas."],
  ["Guardar la contraseña del creador en un secret scope.", "Mala práctica: suplanta a una persona y la dependencia persiste."],
  ["Convertir el job en continuo.", "El trigger no cambia la identidad de ejecución."]],
 "Por defecto un job se ejecuta como quien lo creó. Un **service principal** es una identidad para automatización: acceso solo por API, sin credenciales de usuario. Al usarlo como «Run as», los jobs no fallan cuando alguien deja la organización o se modifica un grupo.",
 "«Producción», «automatización», «no depender de una persona» → service principal como Run as.",
 "yaml", `resources:
  jobs:
    carga_diaria:
      name: carga_diaria
      run_as:
        service_principal_name: "7c1e2a9b-3f4d-4c5e-8a6b-0d1e2f3a4b5c"`, ["Run jobs with service principals", "jobs/how-to/run-jobs-with-service-principals"]],

["2.1", "Autenticar acceso a recursos con managed identities", "Escribir exige leer",
 "A un grupo se le concede únicamente `WRITE FILES` sobre una external location y recibe PERMISSION_DENIED al escribir archivos. ¿Por qué?",
 ["Porque WRITE FILES requiere tener también READ FILES sobre la misma external location.", "La documentación explica que las escrituras implican comprobaciones de metadatos y validación de rutas que necesitan acceso de lectura."],
 [["Porque falta el rol Storage Blob Data Contributor para cada usuario en Azure.", "Con Unity Catalog los usuarios no necesitan roles en Azure: accede el storage credential."],
  ["Porque las external locations son de solo lectura.", "Admiten lectura y escritura según los privilegios concedidos."],
  ["Porque hay que conceder ALL PRIVILEGES sobre el metastore.", "Desproporcionado e innecesario."]],
 "Privilegios habituales sobre una **external location**: `READ FILES`, `WRITE FILES`, `CREATE EXTERNAL TABLE`, `CREATE EXTERNAL VOLUME`, `CREATE MANAGED STORAGE`. La documentación recomienda gobernar el acceso a archivos mediante **volúmenes** en lugar de conceder acceso directo a rutas.",
 "WRITE FILES siempre acompañado de READ FILES. Para acceso a archivos de usuarios finales, mejor un volumen.",
 "sql", `GRANT READ FILES, WRITE FILES
  ON EXTERNAL LOCATION loc_landing TO \`ingenieria_datos\`;`, ["Manage external locations", "connect/unity-catalog/cloud-storage/manage-external-locations"]],

["2.1", "Autenticar acceso a recursos con managed identities", "Managed identity frente a service principal",
 "Para que Unity Catalog acceda a ADLS Gen2 puedes configurar el storage credential con una managed identity o con un service principal. ¿Qué ventaja documentada tiene la managed identity?",
 ["No requiere mantener credenciales ni rotar secretos (y permite conectar con cuentas protegidas por firewall de almacenamiento).", "Son los dos beneficios que la documentación señala frente al service principal."],
 [["Tiene una tarifa DBU más baja.", "La identidad usada no afecta a la facturación de DBU."],
  ["Permite a los usuarios acceder al almacenamiento sin privilegios de Unity Catalog.", "Al contrario: el acceso de los usuarios sigue gobernado por Unity Catalog."],
  ["Hace que las tablas externas se conviertan en managed.", "El tipo de tabla no depende de la identidad del storage credential."]],
 "Se crea un **Access Connector for Azure Databricks** (recurso de Azure con una managed identity asignada por el sistema o por el usuario), se le concede un rol sobre la cuenta de almacenamiento y se registra como **storage credential** en Unity Catalog.",
 "«Sin secretos que rotar» o «almacenamiento tras firewall» → managed identity mediante Access Connector.",
 "sql", `-- Tras registrar el storage credential 'cred_mi' (Access Connector):
CREATE EXTERNAL LOCATION loc_landing
  URL 'abfss://landing@contosolake.dfs.core.windows.net/'
  WITH (STORAGE CREDENTIAL cred_mi);`, ["Azure managed identities in Unity Catalog", "connect/unity-catalog/cloud-storage/azure-managed-identities"]],

/* ───── 2.2 Govern Unity Catalog objects ───── */
["2.2", "Definiciones y descripciones para descubrimiento", "Documentar una columna",
 "Quieres añadir una descripción a la columna `ingreso_neto` de una tabla existente para que aparezca en Catalog Explorer y en la búsqueda. ¿Qué sentencia usas?",
 ["`ALTER TABLE … ALTER COLUMN ingreso_neto COMMENT '…'`.", "Es la forma documentada de añadir o actualizar el comentario de una columna en una tabla existente."],
 [["`ALTER TABLE … SET TAGS ('descripcion' = '…')`.", "Los tags clasifican objetos mediante pares clave-valor; no son la descripción del objeto."],
  ["`ALTER TABLE … ALTER COLUMN ingreso_neto SET MASK …`.", "Eso aplica un column mask."],
  ["`GRANT COMMENT ON TABLE … TO …`.", "No existe tal privilegio; COMMENT no se concede con GRANT."]],
 "Los **comentarios** documentan catálogos, esquemas, tablas y columnas. Pueden escribirse a mano (`COMMENT ON TABLE … IS '…'`, cláusula `COMMENT` en el DDL) o generarse con IA desde Catalog Explorer, donde se revisan y aceptan. Mejoran la búsqueda y las respuestas de Genie.",
 "Descripción = COMMENT. Clasificación = TAGS. Protección = MASK / ROW FILTER.",
 "sql", `COMMENT ON TABLE prod.gold.ventas IS 'Una fila por línea de factura';

ALTER TABLE prod.gold.ventas ALTER COLUMN ingreso_neto
  COMMENT 'Ingreso tras descuentos y devoluciones, sin impuestos (EUR)';`, ["Comments", "comments/"]],

["2.2", "Configurar ABAC con tags y políticas", "Tags con reglas",
 "Gobierno de datos quiere que la etiqueta `pii` solo admita los valores `ssn`, `email` y `telefono`, y que solo ciertos grupos puedan asignarla. ¿Qué usas?",
 ["Governed tags.", "Son tags a nivel de cuenta con reglas: definen claves y valores permitidos y controlan quién puede asignarlos."],
 [["Tags normales con una convención documentada en la wiki.", "Sin reglas aplicadas, cualquiera con privilegios puede asignar cualquier valor."],
  ["Comentarios en las columnas.", "Los comentarios son texto libre, no clasificación controlada."],
  ["Una restricción CHECK en la tabla.", "CHECK valida los datos de las filas, no los metadatos."]],
 "Los **governed tags** garantizan una clasificación coherente y son la base de **ABAC**: las políticas se activan según los tags de tablas y columnas. Si se crea un governed tag con la clave de tags ya asignados, esas asignaciones pasan a estar gobernadas.",
 "«Valores permitidos» + «quién puede etiquetar» → governed tags. Son el requisito previo de ABAC.",
 "sql", `ALTER TABLE prod.clientes.contactos
  ALTER COLUMN email SET TAGS ('pii' = 'email');

ALTER TABLE prod.clientes.contactos SET TAGS ('sensibilidad' = 'alta');`, ["Tags", "database-objects/tags"]],

["2.2", "Configurar ABAC con tags y políticas", "Una política para 400 tablas",
 "Hay 400 tablas en el catálogo `prod` con columnas etiquetadas `pii = ssn`. Todas deben enmascararse para el grupo `analistas`, incluidas las tablas que se creen en el futuro. ¿Qué enfoque es el adecuado?",
 ["Una política ABAC de column mask adjunta al catálogo que coincida con las columnas por su tag.", "Una sola política en el catálogo se aplica dinámicamente a todas las tablas cuyas columnas tengan el tag, también las futuras."],
 [["Ejecutar `ALTER TABLE … SET MASK` en cada una de las 400 tablas.", "Funciona hoy, pero hay que repetirlo por cada tabla nueva y los propietarios pueden quitar la máscara."],
  ["Crear 400 vistas dinámicas.", "Duplica objetos y permisos, y la tabla base seguiría accesible para quien tenga permisos."],
  ["Revocar SELECT a `analistas` en todas las tablas.", "Les impediría usar el resto de columnas."]],
 "**ABAC**: las políticas se adjuntan a un catálogo, esquema o tabla y seleccionan tablas y columnas mediante condiciones sobre governed tags (`has_tag`, `has_tag_value`). Los propietarios de las tablas no pueden eliminarlas ni eludirlas. Los filtros y máscaras a nivel de tabla siguen siendo adecuados para pocas tablas.",
 "«Muchas tablas», «tablas futuras», «control centralizado», «por etiqueta» → política ABAC. «Una o pocas tablas» → ALTER TABLE.",
 "sql", `CREATE FUNCTION prod.gov.ssn_ultimos(ssn STRING, n INT) RETURNS STRING
  RETURN right(ssn, n);

CREATE POLICY mask_ssn
ON CATALOG prod
COLUMN MASK prod.gov.ssn_ultimos
TO analistas EXCEPT administradores
FOR TABLES
MATCH COLUMNS has_tag_value('pii', 'ssn') AS ssn
ON COLUMN ssn
USING COLUMNS (4);`, ["Create and manage ABAC policies", "data-governance/unity-catalog/abac/policies"]],

["2.2", "Configurar ABAC / row filters", "La política que no da acceso",
 "Se crea una política ABAC de row filter para el grupo `auditores` sobre el esquema `prod.finanzas`, pero los auditores siguen sin poder consultar las tablas. ¿Por qué?",
 ["Porque las políticas ABAC (y los row filters y column masks) no conceden acceso: restringen sobre privilegios que deben concederse aparte.", "La documentación indica que ninguno de los dos enfoques concede acceso a los datos por sí solo."],
 [["Porque las políticas ABAC tardan 24 horas en propagarse.", "Se evalúan dinámicamente en tiempo de consulta."],
  ["Porque las políticas solo pueden adjuntarse a tablas, no a esquemas.", "Pueden adjuntarse a catálogo, esquema o tabla."],
  ["Porque los row filters solo funcionan en SQL warehouses.", "No es la causa: lo que falta es el acceso base."]],
 "El control de acceso es por capas: primero los **privilegios de objeto** (USE CATALOG, USE SCHEMA, SELECT) deciden si se puede consultar; después los **row filters / column masks / políticas ABAC** deciden qué filas y valores se ven.",
 "Filtros, máscaras y ABAC restringen; nunca conceden. Si «no puede consultar», revisa los GRANT.",
 "sql", `-- 1) Acceso base
GRANT USE CATALOG ON CATALOG prod TO \`auditores\`;
GRANT USE SCHEMA, SELECT ON SCHEMA prod.finanzas TO \`auditores\`;

-- 2) La política decide qué filas ven
CREATE POLICY solo_ejercicio_actual
ON SCHEMA prod.finanzas
ROW FILTER prod.gov.ejercicio_actual
TO auditores
FOR TABLES
MATCH COLUMNS has_tag('ejercicio') AS ej
USING COLUMNS (ej);`, ["ABAC vs row filters and column masks", "data-governance/unity-catalog/abac/abac-vs-rls-cm"]],

["2.2", "Configurar row filters y column masks", "Borrar la función antes de tiempo",
 "Un ingeniero elimina con `DROP FUNCTION` la función usada como row filter de una tabla, sin tocar la tabla. ¿Qué ocurre?",
 ["La tabla queda inaccesible hasta ejecutar `ALTER TABLE … DROP ROW FILTER`.", "La documentación advierte que hay que quitar el row filter antes de eliminar la función; si no, la tabla queda en estado inaccesible."],
 [["La tabla vuelve a mostrar todas las filas a todos los usuarios.", "No: Unity Catalog no abre el acceso cuando falta la función."],
  ["La función no puede eliminarse mientras esté en uso.", "Sí puede eliminarse, y ese es el problema."],
  ["Se eliminan también los datos de la tabla.", "Los datos no se tocan."]],
 "Orden correcto para retirar un filtro: primero `ALTER TABLE … DROP ROW FILTER`, después `DROP FUNCTION`. Si la tabla ya quedó inaccesible, se recupera ejecutando el `DROP ROW FILTER`. Para aplicar un filtro o máscara hace falta EXECUTE sobre la función y los privilegios de uso sobre su esquema y catálogo.",
 "Retirar filtro o máscara: primero la tabla, luego la función.",
 "sql", `ALTER TABLE prod.ventas.pedidos DROP ROW FILTER;
DROP FUNCTION prod.gov.filtro_region;

-- Column mask
ALTER TABLE prod.rrhh.empleados ALTER COLUMN salario DROP MASK;`, ["Manually apply row filters and column masks", "data-governance/unity-catalog/filters-and-masks/manually-apply"]],

["2.2", "Gestionar el linaje de datos", "Antes de borrar una columna",
 "Vas a eliminar la columna `canal` de una tabla silver y quieres saber qué tablas, jobs y dashboards dependen de ella. ¿Qué herramienta usas?",
 ["El linaje de Unity Catalog en Catalog Explorer, a nivel de columna.", "Unity Catalog captura el linaje automáticamente hasta nivel de columna, y el análisis de impacto es uno de sus usos documentados."],
 [["`DESCRIBE HISTORY` de la tabla.", "Muestra las operaciones realizadas sobre la tabla, no quién consume sus columnas."],
  ["El Spark UI del último job.", "Muestra la ejecución de un job concreto, no las dependencias entre objetos."],
  ["`SHOW GRANTS` sobre la tabla.", "Muestra quién tiene privilegios, no quién usa los datos."]],
 "El **linaje** se captura automáticamente para las consultas ejecutadas en Azure Databricks y se agrega entre todos los workspaces del metastore. Incluye tablas, vistas, columnas, notebooks, jobs y dashboards. Para verlo se necesita al menos BROWSE sobre el catálogo padre. También es consultable en system tables.",
 "«Qué se rompe si cambio esto» (downstream) o «de dónde viene este dato» (upstream) → linaje.",
 "sql", `SELECT target_table_full_name, target_column_name, entity_type
FROM system.access.column_lineage
WHERE source_table_full_name = 'prod.silver.pedidos'
  AND source_column_name = 'canal';`, ["Data lineage", "data-governance/unity-catalog/data-lineage"]],

["2.2", "Configurar audit logging", "¿Quién consultó esa tabla?",
 "Cumplimiento pide un informe SQL de quién accedió a una tabla sensible durante el último mes. ¿Qué fuente consultas?",
 ["La system table `system.access.audit`.", "Es la tabla del sistema con los registros de auditoría, consultable con SQL."],
 [["`DESCRIBE HISTORY` de la tabla.", "Registra las operaciones de escritura sobre la tabla (versiones), no las lecturas."],
  ["El event log de un pipeline de Lakeflow.", "Contiene eventos de ese pipeline, no la auditoría de accesos de la cuenta."],
  ["`SHOW GRANTS`.", "Indica quién podría acceder, no quién accedió."]],
 "Las **system tables** (esquema `system`) exponen datos operativos de la cuenta: `system.access.audit` (auditoría), `system.billing.usage` (consumo), linaje, cómputo, jobs… Requieren un workspace con Unity Catalog. Los eventos de nivel de cuenta registran `workspace_id` 0.",
 "Auditoría con SQL → `system.access.audit`. Envío de logs a Azure Monitor → diagnostic settings.",
 "sql", `SELECT event_time, user_identity.email, action_name
FROM system.access.audit
WHERE service_name = 'unityCatalog'
  AND request_params.full_name_arg = 'prod.rrhh.nominas'
  AND event_date >= current_date() - INTERVAL 30 DAYS
ORDER BY event_time DESC;`, ["Audit log system table", "admin/system-tables/audit-logs"]],

["2.2", "Configurar audit logging", "Los logs hacia el SOC",
 "El equipo de seguridad centraliza todo en Azure Monitor y quiere recibir allí los logs de diagnóstico de Azure Databricks. ¿Cómo lo configuras?",
 ["Con una configuración de diagnóstico (diagnostic setting) del recurso de Azure Databricks que envíe los logs a un workspace de Log Analytics.", "La entrega de logs de diagnóstico se configura en el portal de Azure y permite enviarlos a Log Analytics, a un event hub o a una cuenta de almacenamiento."],
 [["Con un job que copie `system.access.audit` a un archivo CSV cada hora.", "Solución artesanal, con retraso y fuera de la integración nativa."],
  ["Activando Photon en los clústeres.", "Photon es un motor de ejecución; no guarda relación con los logs."],
  ["Creando un secret scope respaldado por Key Vault.", "Los secret scopes gestionan secretos, no logs."]],
 "En el recurso de Azure Databricks → Monitoring → **Diagnostic settings** se eligen las categorías de log y el destino: **archivar en una cuenta de almacenamiento**, **transmitir a un event hub** o **enviar a Log Analytics**. Requiere el plan Premium.",
 "«Azure Monitor», «Log Analytics», «SIEM/SOC» → diagnostic settings del recurso de Azure Databricks.",
 "bash", `az monitor diagnostic-settings create \\
  --name dbx-a-log-analytics \\
  --resource "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Databricks/workspaces/<ws>" \\
  --workspace "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/<law>" \\
  --logs '[{"category":"unityCatalog","enabled":true},{"category":"jobs","enabled":true}]'`, ["Configure diagnostic log delivery", "admin/account-settings/audit-log-delivery"]],

["2.2", "Aplicar políticas de retención de datos", "El derecho al olvido",
 "Un cliente ejerce su derecho de supresión. La tabla tiene deletion vectors activados. Ejecutas `DELETE … WHERE cliente_id = 42`. ¿Qué más hace falta para que sus datos desaparezcan físicamente del almacenamiento?",
 ["Reescribir los archivos afectados (por ejemplo `REORG TABLE … APPLY (PURGE)`) y después `VACUUM` cuando venza la retención.", "Con deletion vectors el DELETE es un borrado lógico; los archivos antiguos solo se eliminan cuando se reescriben y luego VACUUM los retira."],
 [["Nada: DELETE elimina físicamente las filas de inmediato.", "Con deletion vectors las filas se marcan como borradas, y las versiones anteriores siguen siendo accesibles por time travel."],
  ["Ejecutar `OPTIMIZE … ZORDER BY (cliente_id)`.", "Z-order reorganiza datos para el rendimiento; no es el mecanismo para purgar."],
  ["Ejecutar `UNDROP TABLE`.", "Recupera tablas eliminadas; no purga filas."]],
 "Los **deletion vectors** registran borrados lógicos sin reescribir el Parquet. Para la eliminación física: (1) reescribir los archivos (`REORG TABLE … APPLY (PURGE)`), (2) esperar la retención y (3) `VACUUM`, que elimina los archivos ya no referenciados. Hasta entonces, el dato sigue recuperable con time travel.",
 "Borrado legal = DELETE + purga de archivos + VACUUM. DELETE solo no basta.",
 "sql", `DELETE FROM prod.clientes.perfiles WHERE cliente_id = 42;

REORG TABLE prod.clientes.perfiles APPLY (PURGE);

-- Cuando haya vencido la retención de archivos eliminados
VACUUM prod.clientes.perfiles;`, ["Deletion vectors", "tables/features/deletion-vectors"]],

["2.2", "Estrategia segura de Delta Sharing", "Endurecer el acceso del socio",
 "Compartes datos con un socio que no usa Databricks mediante un token (compartición abierta). Seguridad pide reducir el riesgo si el token se filtra. ¿Qué dos controles documentados aplicas?",
 ["Definir una caducidad para el token del recipient y restringir el acceso con una lista de IP permitidas.", "Los tokens admiten tiempo de vida (como máximo un año) y los recipients abiertos pueden limitarse a un conjunto de direcciones IP."],
 [["Conceder al socio ALL PRIVILEGES sobre el share.", "Aumenta la exposición; el acceso por share es de solo lectura."],
  ["Enviar el archivo de credenciales por correo a una lista de distribución.", "El enlace de activación debe enviarse por un canal seguro; el archivo solo puede descargarse una vez."],
  ["Compartir todo el catálogo para no tener que rotar nada.", "Viola el principio de compartir solo lo necesario."]],
 "En la compartición abierta, el proveedor crea un **recipient** con token (o con federación OIDC). El token tiene tiempo de vida configurable, puede rotarse, y se puede asignar al recipient una **lista de acceso por IP** (solo listas de permitidos). Los datos compartidos son de solo lectura.",
 "Delta Sharing abierto seguro = token con caducidad + lista de IP + compartir lo mínimo + canal seguro para la activación.",
 "sql", `CREATE SHARE share_socio;
ALTER SHARE share_socio ADD TABLE prod.gold.ventas_agregadas;

CREATE RECIPIENT socio_ext COMMENT 'Socio sin Databricks';
GRANT SELECT ON SHARE share_socio TO RECIPIENT socio_ext;

-- La caducidad del token y la lista de IP se configuran en el recipient
-- (Catalog Explorer, CLI o API).`, ["Restrict recipient access using IP access lists", "opensharing/access-list"]],

["2.2", "Estrategia segura de Delta Sharing", "Compartir solo una parte",
 "Debes compartir con la filial alemana únicamente las filas de `pais = 'DE'` de una tabla de ventas. ¿Qué opciones ofrece Delta Sharing para no exponer el resto?",
 ["Añadir al share solo una partición de la tabla, o compartir una vista (incluida una vista dinámica) que filtre las filas.", "Los shares admiten tablas, particiones de tablas y vistas, incluidas vistas dinámicas que restringen filas y columnas."],
 [["Compartir la tabla completa y pedir a la filial que filtre.", "Expone todos los datos; el filtrado quedaría en manos del receptor."],
  ["No es posible: un share siempre contiene el esquema completo.", "Falso: se pueden añadir objetos individuales."],
  ["Enviar un archivo CSV filtrado por correo.", "Crea copias sin gobierno ni auditoría."]],
 "Un **share** puede contener tablas y particiones de tablas, vistas (también dinámicas), vistas materializadas, volúmenes, notebooks y modelos; o un esquema entero, en cuyo caso se incluyen los objetos futuros. Regla de seguridad: compartir lo mínimo necesario.",
 "«Solo una parte de la tabla» → partición en el share o vista filtrada. Nunca la tabla completa.",
 "sql", `-- Opción A: compartir una partición
ALTER SHARE share_alemania
  ADD TABLE prod.gold.ventas PARTITION (pais = 'DE');

-- Opción B: compartir una vista que filtra
CREATE VIEW prod.gold.ventas_de AS
  SELECT * FROM prod.gold.ventas WHERE pais = 'DE';
ALTER SHARE share_alemania ADD VIEW prod.gold.ventas_de;`, ["Create shares", "opensharing/create-share"]],

["2.2", "Estrategia segura de Delta Sharing", "Sin tokens entre workspaces",
 "El destinatario tiene un workspace de Databricks con Unity Catalog en otra organización. ¿Qué necesitas de él para crear el recipient sin usar tokens?",
 ["El identificador de compartición (sharing identifier) de su metastore.", "En la compartición Databricks-to-Databricks el recipient se define con una cadena que identifica el metastore del destinatario (nube, región y UUID)."],
 [["Su token de acceso personal.", "No se usan tokens en este flujo, y nunca deben compartirse tokens personales."],
  ["La clave de su cuenta de almacenamiento.", "El destinatario no expone su almacenamiento."],
  ["Que cree usuarios para tu equipo en su workspace.", "El modelo es el inverso y no requiere cuentas cruzadas."]],
 "**Databricks-to-Databricks**: recipient de tipo DATABRICKS identificado por el sharing identifier del metastore destino; el destinatario ve el share como un catálogo en su workspace. **Abierto**: recipient con token u OIDC para cualquier cliente compatible.",
 "Destinatario con Unity Catalog → sharing identifier (`USING ID`). Sin Databricks → token u OIDC.",
 "sql", `CREATE RECIPIENT filial_francia
  USING ID 'azure:westeurope:1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
  COMMENT 'Metastore de la filial francesa';

GRANT SELECT ON SHARE share_grupo TO RECIPIENT filial_francia;`, ["Create Databricks recipients", "opensharing/create-recipient"]]
]);
