/* Preguntas de concepto · Dominio 3, habilidades 3.3 y 3.4 (mismo formato que drills-d1.js). */
window.DP750 = window.DP750 || {};
DP750.DRILLS = (DP750.DRILLS || []).concat([

/* ───── 3.3 Cleanse, transform, and load ───── */
["3.3", "Perfilar datos", "Conocer los datos antes de transformarlos",
 "Recibes una tabla bronze desconocida y necesitas, antes de diseñar las transformaciones, el recuento, los nulos, mínimos, máximos, medias y percentiles de sus columnas. ¿Qué usas en PySpark?",
 ["`df.summary()` (o `df.describe()` para las estadísticas básicas).", "Calculan estadísticas descriptivas por columna; `summary()` incluye además percentiles."],
 [["`df.collect()` y recorrer las filas en Python.", "Trae todos los datos al driver: lento y con riesgo de agotar su memoria."],
  ["`df.printSchema()`.", "Solo muestra nombres y tipos de columna, no la distribución de los datos."],
  ["`OPTIMIZE` sobre la tabla.", "Compacta archivos; no describe los datos."]],
 "El **perfilado** revela nulos, cardinalidades, rangos y valores atípicos, y orienta las reglas de limpieza y de calidad. Además de `summary()`/`describe()`, los notebooks ofrecen un perfil de datos visual sobre los resultados, y Unity Catalog incluye perfilado de datos dentro de la monitorización de calidad.",
 "«Estadísticas resumidas / distribución» → summary, describe o perfil de datos. Nunca collect.",
 "python", `df = spark.table("prod.bronze.pedidos")

df.summary("count", "min", "25%", "50%", "75%", "max").show()

# Nulos por columna
from pyspark.sql import functions as F
df.select([F.sum(F.col(c).isNull().cast("int")).alias(c) for c in df.columns]).show()`, ["Clean and validate", "transform/validate"]],

["3.3", "Elegir tipos de datos de columna", "El dinero no es DOUBLE",
 "Vas a definir la columna `importe` de una tabla de facturación que se sumará millones de veces y debe cuadrar al céntimo. ¿Qué tipo eliges?",
 ["`DECIMAL(p, s)`, por ejemplo `DECIMAL(12,2)`.", "DECIMAL representa valores exactos con precisión y escala fijas: es el tipo adecuado para importes monetarios."],
 [["`DOUBLE`.", "Coma flotante binaria: introduce errores de redondeo que se acumulan al sumar."],
  ["`STRING`.", "Impide el cálculo directo y la validación del valor."],
  ["`INT`.", "Pierde los decimales."]],
 "Elegir bien los tipos mejora corrección, almacenamiento y rendimiento (estadísticas y data skipping). Pautas: importes → `DECIMAL`; fechas → `DATE`/`TIMESTAMP`, no `STRING`; identificadores numéricos grandes → `BIGINT`; indicadores → `BOOLEAN`.",
 "Importes exactos → DECIMAL. Fechas → DATE/TIMESTAMP. STRING solo para texto.",
 "sql", `CREATE TABLE prod.silver.facturas (
  factura_id   BIGINT,
  fecha        DATE,
  emitida_en   TIMESTAMP,
  importe      DECIMAL(12,2),
  pagada       BOOLEAN
);

SELECT CAST('1234.50' AS DECIMAL(12,2)) AS importe;`, ["Clean and validate", "transform/validate"]],

["3.3", "Resolver valores duplicados", "Quedarse con el más reciente",
 "Una tabla bronze contiene varias filas por `pedido_id` debido a reenvíos del origen. Quieres conservar, por cada pedido, únicamente la fila con el `ts_carga` más reciente. ¿Qué técnica usas?",
 ["`ROW_NUMBER()` particionado por `pedido_id` y ordenado por `ts_carga` descendente, filtrando la fila 1 (por ejemplo con QUALIFY).", "Da control determinista sobre cuál de los duplicados se conserva."],
 [["`SELECT DISTINCT *`.", "Solo elimina filas idénticas en todas las columnas; los reenvíos difieren al menos en `ts_carga`."],
  ["`dropDuplicates([\"pedido_id\"])` sin ordenar.", "Conserva una fila por clave, pero no garantiza que sea la más reciente."],
  ["`GROUP BY pedido_id` con `MAX()` en cada columna.", "Mezcla valores de filas distintas: el resultado puede no corresponder a ninguna fila real."]],
 "Tres herramientas: `DISTINCT` (filas idénticas), `dropDuplicates([claves])` (una fila cualquiera por clave) y la **función de ventana** (una fila concreta por clave, según un orden). La tercera es el estándar previo a un MERGE.",
 "«El más reciente / el último por clave» → ROW_NUMBER + ORDER BY ... DESC = 1.",
 "sql", `SELECT *
FROM prod.bronze.pedidos
QUALIFY ROW_NUMBER() OVER (
          PARTITION BY pedido_id ORDER BY ts_carga DESC
        ) = 1;`, ["MERGE", "delta/merge"]],

["3.3", "Resolver valores faltantes y nulos", "Nulos con criterio",
 "En una tabla de ventas, `descuento` es NULL cuando no hubo descuento y `cliente_id` es NULL por un error del origen. Las filas sin `cliente_id` no sirven para el análisis. ¿Qué tratamiento aplicas?",
 ["Sustituir `descuento` nulo por 0 y descartar las filas con `cliente_id` nulo.", "Cada nulo tiene un significado distinto: uno es un valor por defecto legítimo y el otro invalida la fila."],
 [["Sustituir todos los nulos de todas las columnas por 0.", "Inventaría un cliente con id 0 y corrompería los joins."],
  ["Descartar toda fila que tenga algún nulo.", "Eliminaría las ventas válidas sin descuento."],
  ["Dejarlo como está: SUM ignora los nulos.", "Las agregaciones los ignoran, pero las expresiones aritméticas con NULL devuelven NULL y las filas sin cliente contaminarían el análisis."]],
 "Antes de tratar un nulo hay que entender **qué significa**. Herramientas: `coalesce(col, valor)` / `fillna({col: valor})` para imputar, `dropna(subset=[...])` / `WHERE col IS NOT NULL` para descartar. Recuerda que `NULL = NULL` no es verdadero: usa `IS NULL` o el operador `<=>`.",
 "Imputar solo cuando el valor por defecto tiene sentido de negocio; descartar cuando la fila es inservible.",
 "python", `limpio = (ventas
    .dropna(subset=["cliente_id"])
    .fillna({"descuento": 0}))

# Equivalente en SQL
# SELECT *, coalesce(descuento, 0) AS descuento FROM ventas WHERE cliente_id IS NOT NULL`, ["Clean and validate", "transform/validate"]],

["3.3", "Transformar datos: filtrar, agrupar y agregar", "WHERE o HAVING",
 "Quieres los clientes cuyo importe total de pedidos de 2026 supera 10 000. ¿Dónde va cada condición?",
 ["El año en WHERE (filtra filas antes de agrupar) y el total en HAVING (filtra grupos tras agregar).", "WHERE no puede referirse a agregados; HAVING actúa sobre el resultado de la agregación."],
 [["Ambas condiciones en WHERE.", "`WHERE SUM(importe) > 10000` es inválido: los agregados aún no existen en esa fase."],
  ["Ambas condiciones en HAVING.", "Puede funcionar, pero agrupa todas las filas de todos los años antes de filtrar: más costoso."],
  ["El total en WHERE y el año en HAVING.", "Invertido: el agregado no puede ir en WHERE."]],
 "Orden lógico de evaluación: `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`. Filtrar pronto reduce los datos que se agrupan y favorece el data skipping.",
 "Condición sobre filas → WHERE. Condición sobre agregados → HAVING.",
 "sql", `SELECT cliente_id, SUM(importe) AS total_2026
FROM prod.silver.pedidos
WHERE year(fecha) = 2026
GROUP BY cliente_id
HAVING SUM(importe) > 10000;`, ["Aggregations", "transform/aggregation"]],

["3.3", "Transformar con join, union, intersect y except", "Clientes que nunca compraron",
 "Necesitas la lista de clientes de `dim_cliente` que no tienen ningún pedido en `fact_pedidos`. ¿Qué operación es la más directa?",
 ["Un LEFT ANTI JOIN de clientes contra pedidos.", "Devuelve las filas del lado izquierdo que no tienen correspondencia en el derecho."],
 [["Un INNER JOIN.", "Devuelve justo lo contrario: los clientes que sí tienen pedidos."],
  ["Un CROSS JOIN.", "Genera el producto cartesiano de ambas tablas."],
  ["Un LEFT SEMI JOIN.", "Devuelve los clientes que sí tienen al menos un pedido."]],
 "Tipos de join: **INNER** (coincidencias), **LEFT/RIGHT/FULL OUTER** (conservan filas sin coincidencia), **LEFT SEMI** (filas izquierdas con coincidencia, sin duplicar), **LEFT ANTI** (filas izquierdas sin coincidencia), **CROSS** (producto cartesiano).",
 "«Los que no tienen…» → ANTI JOIN (o NOT EXISTS). «Los que tienen al menos uno» → SEMI JOIN (o EXISTS).",
 "sql", `SELECT c.*
FROM prod.gold.dim_cliente c
LEFT ANTI JOIN prod.gold.fact_pedidos p
  ON c.cliente_id = p.cliente_id;`, ["Joins", "transform/join"]],

["3.3", "Transformar con join, union, intersect y except", "Operadores de conjuntos",
 "Tienes los ids de clientes activos en 2025 y en 2026. Quieres los que estuvieron activos en 2025 pero ya no en 2026. ¿Qué operador de conjuntos usas?",
 ["`EXCEPT` (2025 EXCEPT 2026).", "Devuelve las filas de la primera consulta que no aparecen en la segunda."],
 [["`INTERSECT`.", "Devuelve los clientes activos en ambos años."],
  ["`UNION`.", "Devuelve los activos en cualquiera de los dos años, sin duplicados."],
  ["`UNION ALL`.", "Igual que UNION, pero conservando los duplicados."]],
 "**UNION** = unión sin duplicados; **UNION ALL** = unión con duplicados (más barata: no deduplica); **INTERSECT** = intersección; **EXCEPT** = diferencia (el orden importa). En PySpark: `union` (equivale a UNION ALL), `intersect`, `exceptAll` / `subtract`.",
 "Diferencia → EXCEPT. Comunes → INTERSECT. Juntar → UNION (ALL si no hace falta deduplicar).",
 "sql", `SELECT cliente_id FROM prod.silver.pedidos WHERE year(fecha) = 2025
EXCEPT
SELECT cliente_id FROM prod.silver.pedidos WHERE year(fecha) = 2026;`, ["Joins", "transform/join"]],

["3.3", "Transformar: desnormalizar, pivot y unpivot", "De filas a columnas",
 "Una tabla tiene una fila por (tienda, trimestre, ventas). El informe necesita una fila por tienda con una columna por trimestre (Q1 a Q4). ¿Qué operación aplicas?",
 ["PIVOT.", "Convierte los valores de una columna (trimestre) en columnas, agregando la medida."],
 [["UNPIVOT.", "Hace lo inverso: convierte columnas en filas."],
  ["EXPLODE.", "Expande los elementos de un array o mapa en filas."],
  ["CROSS JOIN con una tabla de trimestres.", "Multiplica filas; no reorganiza la medida en columnas."]],
 "**PIVOT** pasa de formato largo a ancho (requiere una agregación); **UNPIVOT** pasa de ancho a largo. En PySpark: `groupBy(...).pivot(col).agg(...)` y `df.unpivot(...)`. Indicar la lista de valores al pivotar evita un paso extra para descubrirlos.",
 "Filas → columnas = PIVOT. Columnas → filas = UNPIVOT.",
 "sql", `SELECT *
FROM (SELECT tienda, trimestre, ventas FROM prod.gold.ventas_trimestre)
PIVOT (SUM(ventas) FOR trimestre IN ('Q1', 'Q2', 'Q3', 'Q4'));

-- Inverso
SELECT * FROM prod.gold.ventas_ancho
UNPIVOT (ventas FOR trimestre IN (Q1, Q2, Q3, Q4));`, ["Aggregations", "transform/aggregation"]],

["3.3", "Cargar datos con merge, insert y append", "Reprocesar un día sin duplicar",
 "Un job diario carga las ventas del día en una tabla Delta. Si se re-ejecuta para la misma fecha (por un fallo o una corrección), no deben quedar duplicados. Sin clave única fiable, ¿qué técnica de carga lo hace idempotente?",
 ["Sobrescritura selectiva del día con `REPLACE WHERE` (o `replaceWhere`).", "Reemplaza de forma atómica solo las filas que cumplen el predicado, de modo que re-ejecutar produce el mismo resultado."],
 [["`INSERT INTO` (append).", "Cada re-ejecución añadiría de nuevo las filas del día."],
  ["`INSERT OVERWRITE` de toda la tabla solo con los datos del día.", "Borraría todos los demás días."],
  ["`DELETE` del día y, en otra transacción, `INSERT`.", "Funciona, pero entre ambas operaciones los lectores ven la tabla sin ese día; no es atómico."]],
 "Opciones de carga: **append** (añadir), **overwrite** total, **overwrite selectivo** (`INSERT INTO … REPLACE WHERE`, `REPLACE USING`), y **MERGE** (upsert por clave). La documentación recomienda REPLACE USING o REPLACE WHERE para la mayoría de los casos de sobrescritura selectiva y desaconseja el modo heredado de sobrescritura dinámica de particiones.",
 "Re-ejecución idempotente por rango (fecha) → REPLACE WHERE. Por clave → MERGE.",
 "sql", `INSERT INTO prod.silver.ventas
REPLACE WHERE fecha = '2026-11-14'
SELECT * FROM prod.bronze.ventas_dia WHERE fecha = '2026-11-14';`, ["Selective overwrite", "delta/selective-overwrite"]],

["3.3", "Cargar datos con merge", "Sincronizar con una foto completa",
 "Cada noche recibes una foto completa del maestro de productos. La tabla destino debe quedar idéntica: insertar los nuevos, actualizar los cambiados y eliminar los que ya no vienen en la foto. ¿Qué cláusula de MERGE cubre el último caso?",
 ["`WHEN NOT MATCHED BY SOURCE THEN DELETE`.", "Actúa sobre las filas del destino que no tienen correspondencia en el origen."],
 [["`WHEN NOT MATCHED THEN DELETE`.", "WHEN NOT MATCHED se refiere a filas del origen sin correspondencia en el destino; ahí solo cabe insertar."],
  ["`WHEN MATCHED THEN DELETE`.", "Borraría los productos que sí vienen en la foto."],
  ["No es posible con MERGE: hace falta un DELETE aparte.", "Sí es posible desde que existe WHEN NOT MATCHED BY SOURCE."]],
 "Cláusulas de MERGE: **WHEN MATCHED** (coincide: UPDATE o DELETE), **WHEN NOT MATCHED [BY TARGET]** (solo en el origen: INSERT), **WHEN NOT MATCHED BY SOURCE** (solo en el destino: UPDATE o DELETE). La última solo es correcta cuando el origen es una foto **completa**: con un lote parcial borraría datos válidos.",
 "Foto completa → usa NOT MATCHED BY SOURCE. Lote incremental → nunca.",
 "sql", `MERGE INTO prod.silver.productos AS t
USING prod.bronze.productos_foto AS s
  ON t.producto_id = s.producto_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *
WHEN NOT MATCHED BY SOURCE THEN DELETE;`, ["MERGE", "delta/merge"]],

/* ───── 3.4 Data quality constraints ───── */
["3.4", "Validaciones: nulabilidad y cardinalidad", "Restricciones que sí se aplican",
 "En Delta sobre Unity Catalog, ¿cuáles de estas restricciones rechazan realmente las escrituras que las incumplen?",
 ["NOT NULL y CHECK.", "Son las restricciones aplicadas (enforced): si una fila las incumple, la escritura falla."],
 [["PRIMARY KEY y FOREIGN KEY.", "Son restricciones informativas: documentan relaciones pero no se aplican."],
  ["Todas: NOT NULL, CHECK, PRIMARY KEY y FOREIGN KEY.", "Las de clave primaria, foránea y unicidad no se aplican."],
  ["Ninguna: Delta no aplica restricciones.", "NOT NULL y CHECK sí se aplican."]],
 "**Restricciones aplicadas**: `NOT NULL` (la columna no admite nulos) y `CHECK` (una expresión booleana debe cumplirse en cada fila). **Restricciones informativas**: clave primaria, clave foránea y unicidad; no se validan, pero aportan semántica al optimizador y a las herramientas.",
 "PK/FK en Databricks = informativas. Si el requisito es «impedir duplicados», una PRIMARY KEY no basta.",
 "sql", `CREATE TABLE prod.silver.clientes (
  cliente_id BIGINT NOT NULL,
  email      STRING,
  edad       INT,
  CONSTRAINT pk_clientes PRIMARY KEY (cliente_id)   -- informativa
);

ALTER TABLE prod.silver.clientes
  ADD CONSTRAINT edad_valida CHECK (edad BETWEEN 0 AND 120);   -- aplicada`, ["Table constraints", "tables/constraints"]],

["3.4", "Validaciones: comprobación de rango", "Una fila mala, todo el lote rechazado",
 "Una tabla tiene la restricción `CHECK (importe >= 0)`. Un INSERT de 10 000 filas incluye una con importe negativo. ¿Qué ocurre?",
 ["La transacción completa falla y no se inserta ninguna fila.", "Una restricción CHECK debe cumplirse en cada fila; si alguna la incumple, la operación falla de forma atómica."],
 [["Se insertan 9 999 filas y se descarta la inválida.", "Ese comportamiento corresponde a una expectativa con DROP ROW en un pipeline, no a una restricción CHECK."],
  ["Se insertan las 10 000 filas y se registra una advertencia.", "Eso sería una expectativa sin acción (warn)."],
  ["La fila inválida se inserta con importe NULL.", "Delta no altera los valores para cumplir la restricción."]],
 "Las restricciones de tabla son **todo o nada**: garantizan que nunca entra un dato inválido, a costa de detener la carga. Las **expectations** de los pipelines permiten además advertir o descartar fila a fila.",
 "CHECK / NOT NULL = falla la transacción. Descartar fila a fila = expectation con DROP ROW.",
 "sql", `ALTER TABLE prod.silver.pagos
  ADD CONSTRAINT importe_no_negativo CHECK (importe >= 0);

-- Falla entero si alguna fila tiene importe < 0
INSERT INTO prod.silver.pagos SELECT * FROM prod.bronze.pagos_lote;`, ["Table constraints", "tables/constraints"]],

["3.4", "Validaciones: cardinalidad de datos", "Garantizar unicidad de verdad",
 "El negocio exige que `pedido_id` sea único en la tabla silver. Has declarado una PRIMARY KEY, pero han aparecido duplicados. ¿Cómo validas la unicidad?",
 ["Con una comprobación explícita de cardinalidad: deduplicar en la carga y verificar, por ejemplo con una expectativa sobre un recuento agrupado por clave.", "Como la clave primaria es informativa, la unicidad debe garantizarla la lógica de carga y verificarse con una regla de calidad."],
 [["Añadiendo la palabra clave ENFORCED a la PRIMARY KEY.", "Las claves primarias no se aplican en Databricks."],
  ["Con una restricción `CHECK (COUNT(*) = 1)`.", "CHECK evalúa cada fila de forma aislada; no admite agregaciones."],
  ["Con una restricción NOT NULL.", "Garantiza que haya valor, no que sea único."]],
 "Comprobaciones de **cardinalidad**: unicidad de clave, relación uno-a-muchos esperada, o que un join no multiplique filas. Patrón: una consulta que agrupa por la clave y una regla que exige recuento = 1 (en un pipeline, una expectativa sobre esa vista o tabla intermedia).",
 "Unicidad → deduplicar al cargar + regla que cuente por clave. PK no la impone.",
 "sql", `CREATE OR REFRESH MATERIALIZED VIEW control_unicidad_pedidos (
  CONSTRAINT pedido_unico EXPECT (n = 1) ON VIOLATION FAIL UPDATE
) AS
SELECT pedido_id, COUNT(*) AS n
FROM silver_pedidos
GROUP BY pedido_id;`, ["Pipeline expectations", "ldp/expectations"]],

["3.4", "Schema enforcement y schema drift", "La columna que no estaba prevista",
 "Un job hace append a una tabla Delta. El origen empieza a enviar una columna nueva, `canal`, y el job falla por discrepancia de esquema. Quieres que la tabla incorpore la columna automáticamente. ¿Qué haces?",
 ["Activar la evolución de esquema en la escritura con la opción `mergeSchema`.", "Con mergeSchema las columnas nuevas del origen se añaden al esquema de la tabla durante la escritura."],
 [["Nada: Delta añade columnas nuevas automáticamente por defecto.", "Por defecto actúa el schema enforcement: la escritura se rechaza."],
  ["Usar `overwriteSchema` en modo append.", "overwriteSchema sirve para reemplazar el esquema al sobrescribir la tabla, no para añadir columnas en un append."],
  ["Convertir la tabla a CSV.", "Se perdería el schema enforcement (y todo lo demás)."]],
 "**Schema enforcement**: Delta valida el esquema en cada escritura y rechaza lo que no encaja; protege frente a la deriva silenciosa. **Schema evolution**: se habilita de forma explícita (`mergeSchema` por escritura, `MERGE WITH SCHEMA EVOLUTION`, o `ALTER TABLE … ADD COLUMNS`).",
 "«Rechaza la escritura por una columna nueva» = enforcement (por defecto). «Aceptar columnas nuevas» = mergeSchema.",
 "python", `(nuevos.write
    .mode("append")
    .option("mergeSchema", "true")
    .saveAsTable("prod.silver.pedidos"))

# Alternativa explícita en SQL:
# ALTER TABLE prod.silver.pedidos ADD COLUMNS (canal STRING COMMENT 'Canal de venta');`, ["Schema enforcement", "tables/schema-enforcement"]],

["3.4", "Comprobaciones de tipo de dato", "El importe que no era un número",
 "Una columna bronze `importe` es STRING y contiene valores como `'12.50'`, `'N/A'` y `''`. En silver debe ser DECIMAL, y las filas no convertibles deben identificarse sin que la carga falle. ¿Qué función usas?",
 ["`try_cast(importe AS DECIMAL(12,2))`, que devuelve NULL cuando la conversión no es posible.", "Permite convertir de forma segura y luego separar las filas con resultado NULL para su revisión."],
 [["`CAST(importe AS DECIMAL(12,2))`.", "Con el modo ANSI activado, un valor no convertible provoca un error en tiempo de ejecución."],
  ["Dejar la columna como STRING en silver.", "Traslada el problema a todos los consumidores e impide el cálculo."],
  ["`regexp_replace(importe, '.*', '0')`.", "Convertiría todos los valores en 0, destruyendo los datos."]],
 "Una **comprobación de tipo** verifica que un valor puede interpretarse con el tipo esperado. `try_cast` (y la familia `try_*`) devuelve NULL en lugar de fallar. En cómputo serverless y SQL warehouses el modo ANSI está activado por defecto, por lo que un CAST inválido lanza error.",
 "Conversión que puede fallar → try_cast + regla sobre el NULL resultante.",
 "sql", `SELECT
  pedido_id,
  try_cast(importe AS DECIMAL(12,2)) AS importe,
  (importe IS NOT NULL AND try_cast(importe AS DECIMAL(12,2)) IS NULL) AS importe_invalido
FROM prod.bronze.pedidos;`, ["Clean and validate", "transform/validate"]],

["3.4", "Expectations en Lakeflow Spark Declarative Pipelines", "Varias reglas, una acción",
 "En un pipeline en Python quieres aplicar seis reglas de calidad a una tabla y descartar cualquier fila que incumpla alguna, reutilizando el mismo conjunto de reglas en otras tablas. ¿Qué decorador usas?",
 ["`@dp.expect_all_or_drop(reglas)`, donde `reglas` es un diccionario nombre → condición.", "Los decoradores expect_all* reciben un diccionario, lo que permite agrupar y reutilizar reglas con una acción colectiva."],
 [["Seis decoradores `@dp.expect` apilados.", "`expect` solo advierte: las filas inválidas se conservarían."],
  ["`@dp.expect_all_or_fail(reglas)`.", "Detendría la actualización ante la primera fila inválida en lugar de descartarla."],
  ["Un `filter()` dentro de la función con las seis condiciones.", "Descarta filas, pero sin métricas de calidad por regla."]],
 "Variantes agrupadas: `expect_all` (advertir), `expect_all_or_drop` (descartar), `expect_all_or_fail` (fallar). La clave del diccionario es el nombre de la expectativa y el valor, la condición SQL.",
 "Muchas reglas con la misma acción → expect_all* + diccionario.",
 "python", `from pyspark import pipelines as dp

reglas = {
    "id_valido":      "pedido_id IS NOT NULL",
    "importe_valido": "importe >= 0",
    "fecha_valida":   "fecha <= current_date()",
}

@dp.table
@dp.expect_all_or_drop(reglas)
def silver_pedidos():
    return spark.readStream.table("bronze_pedidos")`, ["Pipeline expectations", "ldp/expectations"]],

["3.4", "Expectations: métricas", "¿Cuántas filas se descartaron?",
 "Tras desplegar expectativas con `ON VIOLATION DROP ROW`, el responsable de calidad pregunta cuántas filas se descartan en cada ejecución. ¿Dónde está ese dato?",
 ["En las métricas de calidad de la UI del pipeline y en su event log.", "Las métricas de las acciones warn y drop se registran y pueden verse en la UI o consultarse desde el event log."],
 [["En ningún sitio: las filas descartadas no se contabilizan.", "Sí se contabilizan para warn y drop."],
  ["En `DESCRIBE HISTORY` de la tabla destino.", "El historial de la tabla no contiene las métricas de expectativas."],
  ["En el Spark UI, pestaña Storage.", "Muestra datos en caché, no métricas de calidad."]],
 "Para las acciones **warn** y **drop** el pipeline registra cuántos registros cumplen e incumplen cada expectativa. Con **fail** no se registran métricas porque la actualización falla al detectar el primer registro inválido.",
 "Métricas de expectativas → UI del pipeline / event log. Con FAIL UPDATE no hay métricas.",
 "sql", `SELECT
  timestamp,
  details:flow_progress.data_quality.expectations AS expectativas
FROM event_log(TABLE(prod.silver.silver_pedidos))
WHERE event_type = 'flow_progress'
ORDER BY timestamp DESC;`, ["Pipeline expectations", "ldp/expectations"]],

["3.4", "Expectations: elegir la acción", "Tolerancia cero",
 "En una tabla regulatoria, un solo registro con `cuenta_id` nulo invalida el informe completo. El pipeline no debe publicar datos en ese caso. ¿Qué expectativa defines?",
 ["`EXPECT (cuenta_id IS NOT NULL) ON VIOLATION FAIL UPDATE`.", "Los registros inválidos impiden que la actualización se complete; hace falta intervención antes de reprocesar."],
 [["`EXPECT (cuenta_id IS NOT NULL)`.", "Solo registra la métrica: el registro inválido se escribiría en el destino."],
  ["`EXPECT (cuenta_id IS NOT NULL) ON VIOLATION DROP ROW`.", "Publicaría un informe incompleto en silencio."],
  ["Una PRIMARY KEY sobre `cuenta_id`.", "Las claves primarias son informativas: no impiden nulos ni duplicados."]],
 "Elegir la acción es una decisión de negocio: **warn** cuando interesa medir sin bloquear, **drop** cuando es aceptable perder los registros inválidos, **fail** cuando un dato inválido es inaceptable. Con fail, si la operación es una actualización de tabla, la transacción se revierte de forma atómica.",
 "«Inaceptable», «no debe publicarse», «detener» → FAIL UPDATE.",
 "sql", `CREATE OR REFRESH MATERIALIZED VIEW gold_informe_regulatorio (
  CONSTRAINT cuenta_presente EXPECT (cuenta_id IS NOT NULL) ON VIOLATION FAIL UPDATE
) AS
SELECT cuenta_id, SUM(saldo) AS saldo_total
FROM silver_posiciones
GROUP BY cuenta_id;`, ["Pipeline expectations", "ldp/expectations"]]
]);
