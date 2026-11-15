/* Preguntas de concepto · Dominio 1. Formato compacto:
   [habilidad, objetivo, título, pregunta, [correcta, por qué], [[distractor, por qué] ×3],
    fundamento, heurística, lenguaje, código, [título doc, ruta doc]]
   Añade siempre al final de cada habilidad: el id se deriva del orden. */
window.DP750 = window.DP750 || {};
DP750.DRILLS = (DP750.DRILLS || []).concat([

/* ───── 1.1 Select and configure compute ───── */
["1.1", "Elegir el tipo de cómputo (warehouse)", "Dashboards que no pueden esperar",
 "Un equipo de BI consulta dashboards de forma esporádica durante el día. Exigen que el cómputo esté disponible casi al instante y no pagar mientras nadie consulta. Solo ejecutan SQL. ¿Qué cómputo eliges?",
 ["Un SQL warehouse serverless.", "Los SQL warehouses son el cómputo para SQL/BI, y el tipo serverless arranca rápido y se detiene al quedar inactivo, sin infraestructura que gestionar."],
 [["Un clúster all-purpose con auto-terminación desactivada.", "Estaría siempre disponible, pero pagando 24 horas por un uso esporádico; además no es el cómputo pensado para BI."],
  ["Un job cluster definido en un job programado cada hora.", "El job compute existe solo durante la ejecución de un job; no atiende consultas interactivas de un dashboard."],
  ["Un SQL warehouse classic sin auto-stop.", "Sirve para SQL, pero sin auto-stop incumple «no pagar mientras nadie consulta», y es el tipo con menos capacidades."]],
 "Databricks SQL ofrece tres tipos de warehouse: **serverless**, **pro** y **classic**. Todos usan Photon. Serverless añade arranque rápido y elasticidad gestionada por Databricks, por lo que es la opción natural para cargas de BI intermitentes.",
 "«Solo SQL / BI / dashboards» → SQL warehouse. «Arranque inmediato + no pagar inactivo» → serverless.",
 "sql", `-- Un SQL warehouse ejecuta SQL de Databricks; no notebooks PySpark
SELECT region, SUM(importe) AS ventas
FROM prod.gold.ventas_diarias
WHERE fecha >= current_date() - INTERVAL 30 DAYS
GROUP BY region;`, ["SQL warehouse types", "compute/sql-warehouse/warehouse-types"]],

["1.1", "Configurar pooling", "El pool no es gratis",
 "Un job cluster tarda demasiado en arrancar y se plantea usar un pool de instancias. ¿Qué afirmación sobre los pools es correcta?",
 ["Las instancias inactivas del pool no generan DBU, pero Azure sí factura las máquinas virtuales.", "Es exactamente lo que indica la documentación: sin cargo de DBU mientras están inactivas, pero se aplica la facturación del proveedor de instancias."],
 [["Las instancias inactivas del pool no tienen ningún costo.", "Falso: Databricks no cobra DBU por ellas, pero la infraestructura de Azure se sigue pagando."],
  ["Un pool es un tipo de cómputo que ejecuta notebooks directamente.", "Un pool es un conjunto de instancias listas para usar; quienes ejecutan cargas son los clústeres que se adjuntan a él."],
  ["Cualquier clúster del workspace puede tomar instancias del pool sin configurarlo.", "Solo los clústeres adjuntos a un pool pueden usar sus instancias inactivas."]],
 "Un **pool** mantiene instancias inactivas y listas, lo que reduce el tiempo de arranque y de autoescalado de los clústeres adjuntos. Cuando un clúster libera una instancia, vuelve al pool. Si tu carga admite serverless, Databricks recomienda serverless en lugar de pools.",
 "Pool = arranque/escalado más rápido a cambio de pagar VMs inactivas. No reduce la tarifa DBU ni es un tipo de cómputo.",
 "json", `{
  "instance_pool_name": "pool-etl",
  "node_type_id": "Standard_D8ds_v5",
  "min_idle_instances": 2,
  "idle_instance_autotermination_minutes": 20
}`, ["Instance pools", "compute/pool-index"]],

["1.1", "Configurar Photon", "¿Dónde ayuda Photon?",
 "¿Cuál de estas cargas es la que más se beneficia de activar Photon?",
 ["Un ETL en SQL y DataFrame API con joins y agregaciones sobre tablas grandes.", "Photon es un motor vectorizado nativo que acelera cargas SQL, llamadas a la DataFrame API, ETL y streaming sin estado."],
 [["Un proceso que usa exclusivamente la API de RDD.", "Photon actúa sobre el motor de ejecución de Spark SQL/DataFrame; el código RDD no pasa por él."],
  ["Un notebook que entrena un modelo en una sola máquina con scikit-learn.", "Ese código Python se ejecuta fuera del motor de consultas de Spark, así que Photon no interviene."],
  ["Un script que solo copia archivos con dbutils.fs.", "No hay ejecución de consultas que acelerar."]],
 "**Photon** sustituye, para las operaciones que soporta, al motor de ejecución de Spark SQL basado en la JVM por un runtime nativo en C++ que procesa los datos en lotes columnares. Catalyst sigue planificando la consulta. No requiere cambios de código y es el motor por defecto de todos los SQL warehouses.",
 "Photon → SQL y DataFrames (joins, agregaciones, escrituras Delta). No acelera RDD ni código Python arbitrario.",
 "json", `{
  "spark_version": "15.4.x-scala2.12",
  "runtime_engine": "PHOTON",
  "node_type_id": "Standard_D8ds_v5",
  "autoscale": { "min_workers": 2, "max_workers": 8 }
}`, ["Photon", "compute/photon"]],

["1.1", "Elegir el tipo de cómputo (modo de acceso)", "El modo recomendado por defecto",
 "Vas a crear cómputo clásico para un equipo sin requisitos especiales. Según la documentación, ¿qué modo de acceso se recomienda para la mayoría de las cargas?",
 ["Standard.", "La documentación indica que el cómputo Standard se recomienda para la mayoría de cargas: admite cualquier número de usuarios con aislamiento completo del código."],
 [["Dedicated asignado al creador.", "Válido cuando una carga necesita capacidades no disponibles en Standard, pero no es la recomendación general y solo lo usa el usuario o grupo asignado."],
  ["No isolation shared.", "Modo heredado sin aislamiento entre usuarios ni gobierno de Unity Catalog."],
  ["El modo de acceso no influye en Unity Catalog.", "Sí influye: determina cómo se aísla el código de usuario y, por tanto, cómo se aplican los controles de acceso."]],
 "El cómputo **Standard** (antes Shared) permite que cualquier número de usuarios ejecute cargas simultáneamente en el mismo recurso, con aislamiento de código mediante Lakeguard. **Dedicated** (antes Single user) solo puede usarlo el usuario o el grupo al que está asignado.",
 "Sin requisitos especiales → Standard. «Necesito algo que Standard no soporta» → Dedicated.",
 "json", `{
  "cluster_name": "equipo-datos",
  "data_security_mode": "USER_ISOLATION",
  "autotermination_minutes": 30
}`, ["Standard compute", "compute/standard-overview"]],

["1.1", "Configurar permisos de acceso al cómputo", "Adjuntar sí, reiniciar no",
 "Los analistas deben poder adjuntar sus notebooks a un clúster compartido y ejecutar código, pero no reiniciarlo ni cambiar su configuración. ¿Qué permiso les concedes?",
 ["CAN ATTACH TO.", "Es el nivel mínimo que permite adjuntar notebooks y ejecutar comandos, sin poder reiniciar ni editar el cómputo."],
 [["CAN RESTART.", "Incluye lo anterior y además permite iniciar, reiniciar y terminar el cómputo: más de lo pedido."],
  ["CAN MANAGE.", "Permite editar la configuración y los permisos; viola el mínimo privilegio."],
  ["USE CATALOG sobre el catálogo.", "Es un privilegio de Unity Catalog sobre datos, no un permiso sobre el recurso de cómputo."]],
 "Los permisos de cómputo son ACL del workspace, independientes de los privilegios de Unity Catalog. Niveles: **CAN ATTACH TO** (adjuntar y ejecutar), **CAN RESTART** (además iniciar/reiniciar/terminar), **CAN MANAGE** (además editar, redimensionar y gestionar permisos).",
 "Permisos de cómputo ≠ privilegios de datos. Elige el nivel más bajo que cumpla el requisito: ATTACH < RESTART < MANAGE.",
 "json", `{
  "access_control_list": [
    { "group_name": "analistas",  "permission_level": "CAN_ATTACH_TO" },
    { "group_name": "plataforma", "permission_level": "CAN_MANAGE" }
  ]
}`, ["Access control lists", "security/auth/access-control/"]],

["1.1", "Instalar librerías", "Una librería solo para mi notebook",
 "En un clúster compartido necesitas una versión concreta de una librería Python para un único notebook, sin afectar a los demás notebooks del clúster. ¿Qué haces?",
 ["Instalarla con `%pip install` al inicio del notebook (librería de ámbito de notebook).", "Las librerías de ámbito de notebook solo afectan al notebook actual (y a los jobs asociados a él), sin alterar el entorno de los demás."],
 [["Instalarla como librería de cómputo desde la pestaña Libraries del clúster.", "Quedaría disponible para todos los notebooks y jobs del clúster: justo lo que se quiere evitar."],
  ["Añadirla a una política de cómputo.", "Una política con librerías las impone a todo el cómputo creado con ella."],
  ["Reiniciar el clúster con un init script que la instale.", "Afecta a todo el clúster y exige reinicio."]],
 "Hay dos ámbitos: **librerías de cómputo** (disponibles para todos los notebooks y jobs del clúster) y **librerías de notebook** (`%pip`), que crean un entorno propio del notebook. Las de notebook **no persisten** entre sesiones: hay que reinstalarlas al inicio o cuando el notebook se desadjunta.",
 "«Solo este notebook» → `%pip`. «Todo el clúster» → librería de cómputo. «Todos los clústeres de un tipo» → política.",
 "python", `%pip install great-expectations==1.2.0

# en una celda posterior
import great_expectations as gx`, ["Notebook-scoped Python libraries", "libraries/notebooks-python-libraries"]],

["1.1", "Elegir el tipo de cómputo (serverless)", "Lo que serverless no hace",
 "Un equipo quiere mover a cómputo serverless un notebook escrito en R que además usa la API de RDD. ¿Qué les dices?",
 ["No es posible tal cual: serverless para notebooks y jobs no soporta R ni las APIs de RDD; deben usar cómputo clásico o reescribirlo.", "La documentación de limitaciones indica que R no está soportado y que solo se admiten las APIs de Spark Connect, no las de RDD."],
 [["Funcionará sin cambios: serverless es compatible con todo lo que soporta el cómputo clásico.", "Falso: serverless tiene una lista de limitaciones documentadas."],
  ["Funcionará si se activa Photon en el notebook.", "Photon no cambia los lenguajes ni las APIs soportados."],
  ["Solo falla R; la API de RDD sí está soportada.", "Tampoco: serverless usa Spark Connect, que no expone RDD."]],
 "El cómputo **serverless** para notebooks y jobs usa Spark Connect. Entre sus limitaciones: R no soportado, APIs de RDD no soportadas, acceso limitado a DBFS (usa volúmenes o archivos del workspace) y modo ANSI activado por defecto.",
 "Serverless = sin gestionar infraestructura, pero con restricciones. Si el enunciado menciona R, RDD o configuración de bajo nivel → cómputo clásico.",
 "python", `# Compatible con serverless (DataFrame API / Spark Connect)
df = spark.table("prod.silver.ventas").groupBy("region").count()

# No compatible con serverless (API de RDD)
# rdd = spark.sparkContext.parallelize([1, 2, 3])`, ["Serverless compute limitations", "compute/serverless/limitations"]],

["1.1", "Configurar auto-terminación y tamaño (políticas)", "Imponer el apagado automático",
 "Los administradores quieren garantizar que todo clúster all-purpose creado por el equipo de analítica tenga auto-terminación y no supere cierto tamaño. ¿Qué mecanismo usan?",
 ["Una política de cómputo que fije o limite esos atributos y se asigne al grupo.", "Las políticas de cómputo definen limitaciones por atributo (valor fijo, rango, prohibido…) que se aplican al crear el cómputo."],
 [["Conceder CAN MANAGE sobre los clústeres a los administradores.", "Permite corregir clústeres ya creados, pero no impide crearlos mal configurados."],
  ["Un row filter sobre la tabla de clústeres.", "Los row filters son controles de acceso a datos de tablas de Unity Catalog."],
  ["Usar un pool de instancias.", "El pool acelera el arranque; no impone auto-terminación ni tamaños máximos al clúster."]],
 "Una **política de cómputo** es un conjunto de reglas sobre los atributos de la API de clústeres. Cada atributo admite una limitación (`fixed`, `range`, `allowlist`, `forbidden`, `unlimited`…). Es la forma de gobernar costo y configuración a escala.",
 "«Garantizar / imponer / obligar» una configuración de cómputo → política de cómputo.",
 "json", `{
  "autotermination_minutes": { "type": "range", "minValue": 10, "maxValue": 60, "defaultValue": 30 },
  "autoscale.max_workers":   { "type": "range", "maxValue": 8 },
  "node_type_id":            { "type": "allowlist", "values": ["Standard_D4ds_v5", "Standard_D8ds_v5"] }
}`, ["Compute policy reference", "admin/clusters/policy-definition"]],

["1.1", "Configurar autoscaling", "Autoscaling y streaming",
 "Una carga de Structured Streaming corre en cómputo clásico con autoscaling y el clúster casi nunca reduce su tamaño. ¿Qué recomienda la documentación?",
 ["Usar pipelines declarativos de Lakeflow con autoscaling mejorado (enhanced autoscaling) para cargas de streaming.", "La documentación advierte que el autoscaling del cómputo tiene limitaciones para reducir tamaño con Structured Streaming y recomienda los pipelines de Lakeflow con enhanced autoscaling."],
 [["Desactivar la auto-terminación.", "No guarda relación con la reducción del número de workers."],
  ["Usar instancias spot para el driver.", "La documentación desaconseja spot para el driver, y no resuelve el problema."],
  ["Aumentar el máximo de workers.", "Ampliar el techo no ayuda a que el clúster reduzca su tamaño."]],
 "El **autoscaling** añade y quita workers según la carga y suele reducir costos frente a un tamaño fijo. Pero con Structured Streaming la reducción de tamaño es limitada; para streaming se recomienda el autoscaling mejorado de los pipelines de Lakeflow.",
 "Autoscaling clásico → cargas batch/interactivas variables. Streaming → pipelines de Lakeflow con enhanced autoscaling.",
 "json", `{
  "autoscale": { "min_workers": 2, "max_workers": 10 },
  "autotermination_minutes": 30
}`, ["Compute configuration", "compute/configure"]],

["1.1", "Instalar librerías", "Una librería para todo el clúster",
 "Todos los notebooks y jobs que usan un clúster concreto necesitan el mismo paquete interno (un wheel almacenado en un volumen). ¿Cuál es la forma adecuada de instalarlo?",
 ["Instalarlo como librería de ámbito de cómputo en ese clúster, apuntando al wheel del volumen.", "Las librerías de cómputo quedan disponibles para todos los notebooks y jobs que se ejecutan en el clúster."],
 [["Pedir a cada usuario que ejecute `%pip install` en cada notebook.", "Funciona, pero es repetitivo, propenso a versiones distintas y no persiste entre sesiones."],
  ["Copiar el wheel a la carpeta personal de cada usuario.", "Copiar el archivo no lo instala en el entorno de Python."],
  ["Concederles CAN MANAGE sobre el clúster.", "Un permiso no instala librerías y además excede el mínimo privilegio."]],
 "Las **librerías de cómputo** pueden instalarse desde la UI, la API de Libraries, la CLI, Terraform o mediante una política que las imponga. Las fuentes incluyen repositorios de paquetes (PyPI, Maven), archivos del workspace, volúmenes de Unity Catalog y almacenamiento de objetos.",
 "«Todos los notebooks y jobs del clúster» → librería de cómputo.",
 "json", `{
  "cluster_id": "0101-123456-abcd123",
  "libraries": [
    { "whl": "/Volumes/prod/plataforma/paquetes/utilidades-1.4.0-py3-none-any.whl" },
    { "pypi": { "package": "pyarrow==17.0.0" } }
  ]
}`, ["Compute-scoped libraries", "libraries/cluster-libraries"]],

/* ───── 1.2 Create and organize objects in Unity Catalog ───── */
["1.2", "Crear volúmenes según requisitos", "Dónde viven los PDF",
 "Un proceso recibe contratos en PDF e imágenes escaneadas que deben quedar gobernados por Unity Catalog antes de procesarlos. ¿Qué objeto usas?",
 ["Un volumen de Unity Catalog.", "Los volúmenes gobiernan datos no tabulares de cualquier formato y se acceden por ruta."],
 [["Una tabla managed con una columna BINARY por archivo, como primer paso obligatorio.", "No es el objeto pensado para almacenar y gobernar archivos; los volúmenes existen para eso."],
  ["Una vista sobre la carpeta de almacenamiento.", "Una vista es una consulta sobre tablas; no gobierna archivos."],
  ["Un montaje DBFS (`dbutils.fs.mount`).", "Patrón heredado, fuera del gobierno de Unity Catalog."]],
 "**Tablas** gobiernan datos tabulares; **volúmenes** gobiernan datos no tabulares (estructurados, semiestructurados o no estructurados). Se accede por ruta `/Volumes/<catálogo>/<esquema>/<volumen>/<ruta>`. Los archivos de un volumen no pueden registrarse como tablas.",
 "«Archivos», «no tabular», «PDF/imágenes/CSV crudos» + gobierno → volumen.",
 "sql", `CREATE VOLUME IF NOT EXISTS prod.legal.contratos
  COMMENT 'Contratos escaneados pendientes de procesar';

GRANT READ VOLUME, WRITE VOLUME ON VOLUME prod.legal.contratos TO \`equipo_legal\`;

LIST '/Volumes/prod/legal/contratos/2026/';`, ["Volumes", "volumes/"]],

["1.2", "Crear volúmenes según requisitos", "Archivos que ya existen en ADLS",
 "Los archivos ya están en un contenedor de ADLS Gen2 que también usan otros sistemas. Quieres añadirles gobierno de Unity Catalog sin moverlos. ¿Qué creas?",
 ["Un volumen externo sobre esa ruta (dentro de una external location).", "Los volúmenes externos añaden gobierno a ubicaciones de almacenamiento existentes, sin que Databricks gestione el ciclo de vida de los archivos."],
 [["Un volumen managed.", "En un volumen managed los archivos residen en el almacenamiento administrado por Unity Catalog; habría que copiarlos."],
  ["Una tabla externa en formato PDF.", "No existe tal formato de tabla; las tablas son para datos tabulares."],
  ["Un foreign catalog.", "Lakehouse Federation conecta bases de datos y catálogos externos, no carpetas de archivos."]],
 "**Volumen managed**: almacenamiento sencillo administrado por Databricks. **Volumen externo**: gobierno sobre una ubicación de almacenamiento que ya existe. La experiencia de uso es casi idéntica; cambian la ubicación, el ciclo de vida y el control.",
 "«Los archivos ya existen / otros sistemas los usan / sin mover» → externo. «Empezar de cero, lo más simple» → managed.",
 "sql", `CREATE EXTERNAL VOLUME prod.iot.telemetria_raw
  LOCATION 'abfss://iot@contosolake.dfs.core.windows.net/telemetria/'
  COMMENT 'Archivos de telemetría compartidos con el sistema SCADA';`, ["Volumes", "volumes/"]],

["1.2", "Aplicar convenciones de nombres (aislamiento, entornos)", "Aislar dev de prod",
 "Una organización quiere que los datos de desarrollo y de producción estén aislados, con permisos independientes, y que el catálogo de producción solo sea accesible desde el workspace de producción. ¿Qué diseño aplicas?",
 ["Un catálogo por entorno (por ejemplo `dev` y `prod`) y vincular el catálogo `prod` solo al workspace de producción.", "El catálogo es la unidad principal de aislamiento, y la vinculación workspace-catálogo limita desde qué workspaces se puede acceder."],
 [["Un único catálogo con esquemas `dev_ventas` y `prod_ventas`.", "Mezcla entornos en el mismo contenedor: los privilegios de catálogo se heredarían a ambos y no se puede limitar por workspace."],
  ["Prefijar las tablas con `dev_` y `prod_` en el mismo esquema.", "Los nombres no aíslan nada: los privilegios de esquema se heredan a todas las tablas."],
  ["Dos metastores en la misma región, uno por entorno.", "El metastore es el contenedor de nivel superior por región; el aislamiento por entorno se resuelve con catálogos."]],
 "El espacio de nombres de tres niveles (`catálogo.esquema.objeto`) permite codificar el entorno o el dominio en el catálogo. Los privilegios se heredan hacia abajo, así que separar por catálogo da fronteras de permisos limpias. La **vinculación workspace-catálogo** restringe el acceso a un catálogo a workspaces concretos.",
 "«Aislamiento» por entorno o por unidad de negocio → catálogos separados (+ workspace-catalog binding).",
 "sql", `CREATE CATALOG IF NOT EXISTS dev  COMMENT 'Desarrollo';
CREATE CATALOG IF NOT EXISTS prod COMMENT 'Producción';

-- Mismo código, distinto catálogo según el entorno
SELECT * FROM prod.ventas.pedidos;
SELECT * FROM dev.ventas.pedidos;`, ["Workspace-catalog binding", "data-governance/unity-catalog/access-control/workspace-catalog-binding"]],

["1.2", "Crear tablas, vistas y vistas materializadas", "La agregación que tarda minutos",
 "Un dashboard ejecuta cientos de veces al día la misma agregación costosa sobre una tabla enorme que cambia cada hora. ¿Qué objeto reduce el costo de esas consultas?",
 ["Una vista materializada.", "Almacena el resultado precalculado y lo refresca (a menudo de forma incremental), en lugar de recalcularlo en cada consulta."],
 [["Una vista estándar.", "Una vista guarda el texto de la consulta y se recalcula cada vez que se consulta."],
  ["Una vista temporal.", "Además de recalcularse, solo existe durante la sesión."],
  ["Un volumen con el resultado exportado a CSV.", "Pierde gobierno tabular, tipos y refresco automático."]],
 "Una **vista** recalcula su consulta en cada lectura. Una **vista materializada** guarda en caché el resultado y lo mantiene sincronizado mediante refrescos; Databricks intenta elegir la estrategia que minimiza el costo de actualización (con frecuencia incremental).",
 "«Consulta costosa y repetida» + «los datos cambian periódicamente» → vista materializada.",
 "sql", `CREATE MATERIALIZED VIEW prod.gold.ventas_por_region AS
SELECT region, date_trunc('DAY', ts_venta) AS dia, SUM(importe) AS total
FROM prod.silver.ventas
GROUP BY region, date_trunc('DAY', ts_venta);

REFRESH MATERIALIZED VIEW prod.gold.ventas_por_region;`, ["Materialized views", "ldp/concepts/materialized-views"]],

["1.2", "Crear tablas (streaming tables)", "Ingesta que solo añade",
 "Necesitas un objeto que ingiera de forma incremental eventos que solo se añaden (append-only), procesando cada fila de entrada una sola vez. ¿Cuál eliges?",
 ["Una streaming table.", "Es una tabla Delta con soporte de procesamiento incremental en la que cada fila de entrada se trata una sola vez."],
 [["Una vista materializada.", "Está pensada para mantener el resultado de una consulta (p. ej. agregaciones), no para la ingesta append-only de grandes volúmenes."],
  ["Una vista estándar.", "No almacena datos ni procesa incrementalmente."],
  ["Una tabla externa en CSV.", "Sin transacciones ACID ni procesamiento incremental."]],
 "Una **streaming table** es una tabla Delta con soporte adicional para streaming o procesamiento incremental; modela la gran mayoría de cargas de ingesta. La definen y actualizan los flujos de un único pipeline.",
 "Ingesta incremental / append / «cada fila una vez» → streaming table. Agregaciones precalculadas → vista materializada.",
 "sql", `CREATE OR REFRESH STREAMING TABLE prod.bronze.eventos
AS SELECT *
FROM STREAM read_files(
  '/Volumes/prod/landing/eventos/',
  format => 'json'
);`, ["Streaming tables", "ldp/concepts/streaming-tables"]],

["1.2", "Crear un catálogo según requisitos", "Cada dominio en su cuenta de almacenamiento",
 "Por requisitos legales, las tablas managed del catálogo `finanzas` deben almacenarse en una cuenta de almacenamiento distinta de la del resto del metastore. ¿Cómo lo consigues?",
 ["Crear el catálogo con `MANAGED LOCATION` apuntando a una external location de esa cuenta.", "Un catálogo (o un esquema) puede definir su propia ubicación de almacenamiento administrado, que prevalece sobre la del metastore."],
 [["Crear todas las tablas del catálogo como externas con `LOCATION`.", "Cumpliría la ubicación, pero dejarían de ser managed y perderían la optimización automática."],
  ["No es posible: todas las tablas managed de un metastore comparten almacenamiento.", "Falso: se puede definir almacenamiento administrado a nivel de catálogo y de esquema."],
  ["Configurar la ruta en `spark.conf` de cada clúster.", "El almacenamiento de las tablas managed lo decide Unity Catalog, no la configuración del clúster."]],
 "El almacenamiento administrado se resuelve jerárquicamente: **esquema → catálogo → metastore**. Para fijarlo en un catálogo o esquema se necesita el privilegio `CREATE MANAGED STORAGE` sobre la external location. Si el metastore no tiene almacenamiento administrado, es obligatorio indicarlo en el catálogo.",
 "«Tablas managed en un almacenamiento concreto» → `MANAGED LOCATION` en catálogo o esquema.",
 "sql", `CREATE CATALOG finanzas
  MANAGED LOCATION 'abfss://finanzas@contosofin.dfs.core.windows.net/managed/'
  COMMENT 'Datos financieros - almacenamiento segregado';

CREATE SCHEMA finanzas.contabilidad;`, ["Create catalogs", "catalogs/create-catalog"]],

["1.2", "Crear un esquema según requisitos", "Privilegios para crear un esquema",
 "Un ingeniero recibe un error de permisos al ejecutar `CREATE SCHEMA prod.marketing`. ¿Qué privilegios necesita sobre el catálogo `prod`?",
 ["USE CATALOG y CREATE SCHEMA.", "Son los dos privilegios que la documentación exige sobre el catálogo padre para crear un esquema."],
 [["Solo CREATE TABLE.", "Ese privilegio permite crear tablas dentro de un esquema existente."],
  ["SELECT sobre el catálogo.", "SELECT permite leer datos; no crear objetos."],
  ["Ser administrador del workspace.", "El rol de administrador del workspace no concede por sí mismo privilegios sobre los objetos de datos."]],
 "Para crear objetos hace falta el privilegio de uso sobre los contenedores superiores más el privilegio `CREATE …` correspondiente sobre el contenedor inmediato: `USE CATALOG` + `CREATE SCHEMA` para esquemas; `USE CATALOG` + `USE SCHEMA` + `CREATE TABLE` para tablas.",
 "Crear X dentro de Y → usage sobre los padres + `CREATE X` sobre Y.",
 "sql", `GRANT USE CATALOG, CREATE SCHEMA ON CATALOG prod TO \`ingenieria_datos\`;

CREATE SCHEMA IF NOT EXISTS prod.marketing
  COMMENT 'Campañas y atribución';`, ["Create schemas", "schemas/create-schema"]],

["1.2", "Configurar instrucciones de AI/BI Genie", "Genie responde mal",
 "Los usuarios de negocio hacen preguntas en lenguaje natural a Genie sobre las tablas de ventas y reciben respuestas imprecisas (confunde «ingreso neto» con «ingreso bruto»). ¿Qué acción mejora más la precisión?",
 ["Añadir instrucciones y consultas SQL de ejemplo al espacio de Genie, y documentar tablas y columnas con comentarios.", "La documentación recomienda añadir consultas SQL de ejemplo e instrucciones antes de compartirlo, y Genie se apoya en los metadatos para entender la semántica del negocio."],
 [["Conceder ALL PRIVILEGES a los usuarios sobre el catálogo.", "Los permisos no enseñan a Genie la definición de las métricas, y sobreexponen los datos."],
  ["Aumentar el tamaño del SQL warehouse.", "Mejora la velocidad, no la corrección semántica."],
  ["Mencionar en las instrucciones tablas adicionales sin adjuntarlas.", "Genie solo usa las fuentes de datos adjuntas explícitamente, aunque las instrucciones mencionen otras."]],
 "Un espacio de Genie (la documentación actual lo llama **Genie Agent**, antes *Genie space*) se configura con fuentes de Unity Catalog, **instrucciones generales**, **consultas SQL de ejemplo** y metadatos. Solo consulta las fuentes adjuntas, y el acceso a los datos sigue rigiéndose por los privilegios de Unity Catalog de cada usuario.",
 "Genie impreciso → más contexto: instrucciones, SQL de ejemplo, comentarios. Nunca más permisos ni más cómputo.",
 "sql", `-- Metadatos que Genie aprovecha
COMMENT ON TABLE prod.gold.ventas IS 'Una fila por línea de factura. Importes en EUR.';
ALTER TABLE prod.gold.ventas ALTER COLUMN ingreso_neto
  COMMENT 'Ingreso tras descuentos y devoluciones, sin impuestos';

-- Consulta de ejemplo que se añade al espacio de Genie
SELECT date_trunc('MONTH', fecha) AS mes, SUM(ingreso_neto) AS ingreso_neto
FROM prod.gold.ventas GROUP BY 1;`, ["Create a Genie Agent", "genie-agents/set-up"]],

["1.2", "Implementar un foreign catalog", "Escribir en el foreign catalog",
 "Tras crear un foreign catalog sobre una base de datos PostgreSQL, un analista intenta ejecutar `INSERT INTO pg_fed.public.clientes …` y falla. ¿Por qué?",
 ["Porque la federación de consultas es de solo lectura.", "La documentación indica que las escrituras no están soportadas: los foreign catalogs de Lakehouse Federation son de solo lectura."],
 [["Porque le falta el privilegio MODIFY sobre la tabla federada.", "Ningún privilegio habilita escrituras: la limitación es de la funcionalidad."],
  ["Porque debe usar `COPY INTO` en lugar de `INSERT`.", "COPY INTO carga archivos en tablas Delta; tampoco escribe en el origen federado."],
  ["Porque el foreign catalog debe refrescarse antes de escribir.", "Refrescar actualiza metadatos; no habilita escritura."]],
 "**Lakehouse Federation** permite consultar bases de datos externas a través de un foreign catalog gobernado por Unity Catalog, con pushdown automático de consultas. Es de **solo lectura** y está orientado a informes ad hoc, BI y pruebas de concepto sobre bases operacionales.",
 "Foreign catalog = leer sin ingerir. Si hay que escribir o transformar a escala → ingerir (Lakeflow Connect, pipelines).",
 "sql", `-- Permitido
SELECT cliente_id, pais FROM pg_fed.public.clientes WHERE pais = 'ES';

-- No soportado: el foreign catalog es de solo lectura
-- INSERT INTO pg_fed.public.clientes VALUES (...);

-- Alternativa: materializar en el lakehouse
CREATE TABLE prod.bronze.clientes AS SELECT * FROM pg_fed.public.clientes;`, ["Lakehouse Federation", "query-federation/"]],

["1.2", "DDL sobre tablas managed", "Recuperar una tabla borrada",
 "Ayer alguien ejecutó `DROP TABLE` sobre una tabla managed de producción por error. La configuración de retención es la predeterminada. ¿Qué haces?",
 ["Ejecutar `UNDROP TABLE` sobre la tabla.", "Unity Catalog permite recuperar tablas managed eliminadas; por defecto son recuperables durante 7 días."],
 [["Nada: en una tabla managed los datos se eliminan de inmediato y de forma irreversible.", "Falso: existe un periodo de recuperación antes de la purga asíncrona."],
  ["Ejecutar `RESTORE TABLE … VERSION AS OF`.", "RESTORE devuelve una tabla existente a una versión anterior; la tabla ya no existe en el catálogo."],
  ["Ejecutar `VACUUM` para recuperar los archivos.", "VACUUM elimina archivos; no recupera nada."]],
 "Al eliminar una **tabla managed**, Unity Catalog la marca como eliminada y un proceso asíncrono purga los datos cuando termina el periodo de recuperación (7 días por defecto; configurable a 0 horas —sin recuperación— o entre 7 y 30 días). `UNDROP TABLE` la restaura dentro de ese periodo.",
 "DROP accidental de tabla managed → `UNDROP TABLE`. Volver a una versión anterior de una tabla existente → `RESTORE`.",
 "sql", `-- Ver tablas eliminadas aún recuperables
SHOW TABLES DROPPED IN prod.ventas;

UNDROP TABLE prod.ventas.pedidos;`, ["Managed tables", "tables/managed"]]
]);
