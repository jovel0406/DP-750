/* Preguntas de concepto · Dominio 4, habilidades 4.1 y 4.2 (mismo formato que drills-d1.js). */
window.DP750 = window.DP750 || {};
DP750.DRILLS = (DP750.DRILLS || []).concat([

/* ───── 4.1 Design and implement data pipelines ───── */
["4.1", "Elegir entre notebook y Lakeflow Spark Declarative Pipelines", "Declarar o programar",
 "Un equipo va a construir un flujo bronze → silver → gold con ingesta incremental, reglas de calidad y gestión automática de dependencias y reintentos, con el menor código de orquestación posible. ¿Qué eliges?",
 ["Lakeflow Spark Declarative Pipelines.", "Es un marco declarativo: se definen las transformaciones y el pipeline gestiona orquestación, monitorización, calidad de datos y errores."],
 [["Notebooks encadenados con `dbutils.notebook.run` y lógica propia de estado.", "Da control total, pero obliga a programar a mano dependencias, incrementalidad, reintentos y calidad."],
  ["Un único notebook gigante que lo hace todo.", "Sin modularidad, sin reintentos por etapa y difícil de probar."],
  ["Consultas programadas en un SQL warehouse con tablas recreadas a diario.", "Reprocesa todo cada vez y no gestiona dependencias ni calidad."]],
 "**Pipeline declarativo**: describes *qué* tablas quieres (streaming tables, vistas materializadas, flujos) y el motor decide *cómo* y en qué orden. **Notebook orquestado por un job**: adecuado para lógica procedimental arbitraria, llamadas a APIs externas o pasos que no son transformaciones de tablas.",
 "«Incremental + calidad + dependencias automáticas + mínimo código» → pipeline declarativo. «Lógica procedimental a medida» → notebook en un job.",
 "sql", `CREATE OR REFRESH STREAMING TABLE bronze_pedidos
AS SELECT * FROM STREAM read_files('/Volumes/prod/landing/pedidos/', format => 'json');

CREATE OR REFRESH STREAMING TABLE silver_pedidos (
  CONSTRAINT id_valido EXPECT (pedido_id IS NOT NULL) ON VIOLATION DROP ROW
) AS SELECT * FROM STREAM(bronze_pedidos);

CREATE OR REFRESH MATERIALIZED VIEW gold_ventas_dia
AS SELECT fecha, SUM(importe) AS total FROM silver_pedidos GROUP BY fecha;`, ["Lakeflow pipelines", "ldp/"]],

["4.1", "Diseñar el orden de operaciones", "Quién va primero",
 "En un pipeline declarativo defines `gold_ventas` (lee de `silver_pedidos`), `silver_pedidos` (lee de `bronze_pedidos`) y `bronze_pedidos`, en ese orden dentro del archivo. ¿En qué orden se ejecutan?",
 ["bronze → silver → gold: el pipeline deduce el grafo de dependencias a partir de las referencias entre conjuntos de datos.", "El orden del código fuente no determina la ejecución; lo determina el grafo de dependencias."],
 [["En el orden en que aparecen en el archivo: gold, silver, bronze.", "Así funcionaría un notebook imperativo, no un pipeline declarativo."],
  ["En orden alfabético.", "No existe tal regla."],
  ["Falla: las tablas deben declararse en orden de dependencia.", "No es necesario; el motor resuelve las dependencias."]],
 "En el modelo declarativo cada conjunto de datos es un nodo y cada referencia a otro conjunto es una arista. El pipeline construye el **DAG** y ejecuta cada nodo cuando sus dependencias están listas, en paralelo cuando es posible. En un job, en cambio, el orden lo fijas tú con las dependencias entre tareas.",
 "Pipeline declarativo: el orden lo fija el grafo, no el archivo. Job: el orden lo fijan `depends_on` y Run if.",
 "python", `from pyspark import pipelines as dp

@dp.materialized_view
def gold_ventas():
    return spark.read.table("silver_pedidos").groupBy("fecha").sum("importe")

@dp.table
def silver_pedidos():
    return spark.readStream.table("bronze_pedidos").where("pedido_id IS NOT NULL")

@dp.table
def bronze_pedidos():
    return (spark.readStream.format("cloudFiles")
              .option("cloudFiles.format", "json")
              .load("/Volumes/prod/landing/pedidos/"))`, ["Lakeflow pipelines", "ldp/"]],

["4.1", "Manejo de errores en notebooks y jobs", "El notebook que falló «con éxito»",
 "Un notebook de validación detecta datos corruptos y ejecuta `dbutils.notebook.exit(\"ERROR: datos corruptos\")`. La tarea del job aparece como correcta y las tareas siguientes se ejecutan. ¿Cómo debe corregirse?",
 ["Lanzando una excepción (`raise`) cuando la validación falla.", "Una excepción no capturada hace fallar la tarea, y con ello las tareas dependientes no se ejecutan."],
 [["Devolviendo la cadena en mayúsculas.", "El contenido del valor de salida no cambia el estado de la tarea."],
  ["Usando `print(\"ERROR\")` antes de `exit`.", "Escribir en la salida no altera el estado de la ejecución."],
  ["Añadiendo `max_retries` a la tarea.", "Los reintentos solo actúan cuando la tarea falla, y aquí termina correctamente."]],
 "`dbutils.notebook.exit(valor)` finaliza el notebook **con éxito** devolviendo un valor. Para señalar un fallo hay que **lanzar una excepción**. Patrón habitual: `try/except` para registrar o limpiar, y después relanzar.",
 "Fallar una tarea = excepción. `dbutils.notebook.exit` = terminar correctamente con un valor de retorno.",
 "python", `invalidos = spark.table("prod.bronze.pedidos").where("pedido_id IS NULL").count()

try:
    if invalidos > 0:
        raise ValueError(f"{invalidos} pedidos sin identificador")
except Exception as e:
    print(f"Validación fallida: {e}")   # registrar / limpiar
    raise                               # relanzar: la tarea queda como fallida

dbutils.notebook.exit("OK")`, ["Control flow in jobs", "jobs/control-flow"]],

["4.1", "Crear un pipeline con notebooks, incluidas restricciones de precedencia", "Primero A y B, después C",
 "Tienes tres notebooks: `cargar_clientes`, `cargar_pedidos` y `construir_gold`. El tercero solo debe ejecutarse si los dos primeros terminan bien, y los dos primeros pueden ir en paralelo. ¿Cómo lo implementas?",
 ["Un job con tres tareas de notebook, donde `construir_gold` declara `depends_on` sobre las otras dos.", "Las dependencias entre tareas expresan la precedencia; las tareas sin dependencia mutua se ejecutan en paralelo y la condición por defecto exige que todas las dependencias hayan tenido éxito."],
 [["Tres jobs independientes programados a las 02:00, 02:30 y 03:00.", "El orden queda al azar de las duraciones: si una carga se retrasa o falla, gold se ejecuta igualmente."],
  ["Un notebook maestro que llama a los tres en secuencia con `%run`.", "Los ejecuta en serie, sin paralelismo, sin reintentos por etapa ni visibilidad por tarea."],
  ["Un trigger continuo en `construir_gold`.", "Los jobs continuos no admiten dependencias entre tareas y no resuelven la precedencia."]],
 "Un job de Lakeflow es un **DAG de tareas**. La precedencia se define con `depends_on`, y la condición de ejecución con **Run if** (por defecto, *All succeeded*). Así se obtiene paralelismo, reintentos por tarea, repair run y trazabilidad.",
 "«Restricciones de precedencia» entre notebooks → tareas de un job con depends_on.",
 "yaml", `tasks:
  - task_key: cargar_clientes
    notebook_task: { notebook_path: ../src/cargar_clientes.py }
  - task_key: cargar_pedidos
    notebook_task: { notebook_path: ../src/cargar_pedidos.py }
  - task_key: construir_gold
    depends_on:
      - task_key: cargar_clientes
      - task_key: cargar_pedidos
    notebook_task: { notebook_path: ../src/construir_gold.py }`, ["Configure task dependencies (Run if)", "jobs/run-if"]],

["4.1", "Diseñar la lógica de tareas (Run if)", "La tarea de limpieza",
 "Un job crea tablas temporales al inicio. Una tarea final `limpieza` debe ejecutarse siempre, hayan tenido éxito o no las tareas anteriores. ¿Qué condición Run if le asignas?",
 ["All done.", "La tarea se ejecuta cuando todas sus dependencias han terminado, con independencia de su resultado."],
 [["All succeeded.", "Es el valor por defecto: la limpieza no se ejecutaría si algo falla."],
  ["At least one failed.", "Solo se ejecutaría si hubo fallos, no en las ejecuciones correctas."],
  ["None failed.", "No se ejecutaría si alguna dependencia falla."]],
 "Condiciones **Run if**: *All succeeded* (por defecto), *At least one succeeded*, *None failed*, *All done*, *At least one failed*, *All failed*. Permiten rutas de limpieza, notificación y compensación.",
 "«Siempre, pase lo que pase» → All done. «Solo si algo falló» → At least one failed.",
 "yaml", `- task_key: limpieza
  depends_on:
    - task_key: cargar
    - task_key: transformar
  run_if: ALL_DONE
  notebook_task:
    notebook_path: ../src/limpiar_temporales.py`, ["Configure task dependencies (Run if)", "jobs/run-if"]],

["4.1", "Diseñar la lógica de tareas (If/else y task values)", "Bifurcar según un resultado",
 "Una tarea de validación cuenta registros inválidos. Si hay alguno, debe ejecutarse una rama de cuarentena; si no, la carga normal. ¿Cómo lo modelas en un job?",
 ["La tarea publica el recuento como task value y una tarea If/else condition evalúa ese valor para elegir la rama.", "Los task values pasan datos entre tareas y la tarea If/else añade lógica condicional booleana al grafo."],
 [["Dos jobs distintos y un operador que lanza el adecuado a mano.", "No es automatizable."],
  ["Una única tarea con un `if` que hace ambas cosas.", "Funciona, pero oculta la bifurcación: sin visibilidad, reintentos ni repair por rama."],
  ["Un trigger de file arrival.", "Los triggers inician ejecuciones; no bifurcan dentro de una."]],
 "`dbutils.jobs.taskValues.set(key, value)` publica un valor desde un notebook Python; las tareas posteriores lo leen con `taskValues.get` o con una referencia dinámica `{{tasks.<tarea>.values.<clave>}}`. La tarea **If/else** compara dos operandos; ojo: `==` y `!=` comparan como cadenas.",
 "Pasar datos entre tareas → task values. Bifurcar → If/else condition task.",
 "yaml", `- task_key: validar
  notebook_task: { notebook_path: ../src/validar.py }   # taskValues.set("invalidos", n)

- task_key: hay_invalidos
  depends_on: [{ task_key: validar }]
  condition_task:
    op: GREATER_THAN
    left: "{{tasks.validar.values.invalidos}}"
    right: "0"

- task_key: cuarentena
  depends_on: [{ task_key: hay_invalidos, outcome: "true" }]
  notebook_task: { notebook_path: ../src/cuarentena.py }

- task_key: carga_normal
  depends_on: [{ task_key: hay_invalidos, outcome: "false" }]
  notebook_task: { notebook_path: ../src/cargar.py }`, ["If/else task", "jobs/tasks/if-else"]],

["4.1", "Diseñar la lógica de tareas (For each)", "La misma tarea para cuarenta tablas",
 "Debes aplicar el mismo notebook de transformación a 40 tablas, pasándole el nombre de tabla como parámetro y ejecutando varias a la vez. ¿Qué tipo de tarea usas?",
 ["Una tarea For each con el notebook como tarea anidada.", "Ejecuta una tarea anidada en bucle, con un conjunto distinto de parámetros en cada iteración y concurrencia configurable."],
 [["Cuarenta tareas de notebook definidas a mano.", "Funciona, pero es inmantenible y hay que editar el job por cada tabla nueva."],
  ["Una tarea For each anidada dentro de otra For each.", "No se puede añadir una tarea For each como tarea anidada de otra."],
  ["Un job continuo.", "Mantiene una ejecución siempre activa; no itera sobre una lista."]],
 "La tarea **For each** requiere dos definiciones: la propia For each (con la lista de entradas y la concurrencia) y la **tarea anidada**, que es uno de los tipos de tarea estándar. La lista puede provenir de un task value o de un parámetro del job.",
 "«El mismo proceso para N elementos» → For each.",
 "yaml", `- task_key: procesar_tablas
  for_each_task:
    inputs: '["clientes", "pedidos", "pagos", "envios"]'
    concurrency: 4
    task:
      task_key: procesar_tabla
      notebook_task:
        notebook_path: ../src/procesar_tabla.py
        base_parameters:
          tabla: "{{input}}"`, ["For each task", "jobs/tasks/for-each"]],

["4.1", "Crear un pipeline con Lakeflow Spark Declarative Pipelines (modo)", "Frescura cada seis horas",
 "Un pipeline declarativo alimenta informes que se consultan cuatro veces al día. ¿Qué modo de ejecución eliges?",
 ["Triggered, programado cada seis horas.", "En modo triggered el pipeline actualiza las tablas con los datos disponibles y se detiene: no hay cómputo encendido entre ejecuciones."],
 [["Continuous.", "Mantiene las tablas al día a medida que llegan datos, a costa de cómputo permanente: innecesario para esta frescura."],
  ["Continuous con full refresh en cada actualización.", "Reprocesaría todo continuamente."],
  ["No importa: ambos modos cuestan lo mismo.", "El modo continuo mantiene cómputo activo de forma permanente."]],
 "**Triggered**: el sistema se detiene tras actualizar todas las tablas con los datos disponibles al inicio de la actualización. **Continuous**: procesa los datos nuevos según llegan. La elección depende de la latencia requerida y del costo aceptable.",
 "Frescura de horas → triggered + schedule. Frescura de segundos/minutos → continuous.",
 "yaml", `resources:
  pipelines:
    ventas_pipeline:
      name: ventas_pipeline
      catalog: prod
      schema: ventas
      continuous: false          # modo triggered
      serverless: true
      libraries:
        - glob: { include: ../src/pipeline/** }`, ["Triggered vs continuous", "ldp/concepts/pipeline-mode"]],

["4.1", "Crear un pipeline con Lakeflow Spark Declarative Pipelines (refresh)", "El full refresh que perdió datos",
 "Para «arreglar» un cálculo, alguien lanza un full refresh de una streaming table cuyo origen es un bus de eventos con retención de 7 días. Después faltan los datos más antiguos. ¿Qué ocurrió?",
 ["El full refresh borró los datos y los checkpoints de la streaming table y reprocesó desde el origen, que ya solo conservaba 7 días.", "La documentación advierte que un full refresh en streaming tables puede provocar pérdida de registros si el origen ya no dispone de los datos."],
 [["El full refresh solo recalcula las filas modificadas, así que el fallo es de otro proceso.", "Eso describe la actualización por defecto, no el full refresh."],
  ["VACUUM se ejecutó en mitad del refresh.", "No es la causa descrita."],
  ["Las streaming tables no conservan datos más de 7 días.", "No tienen ese límite; el límite era del origen."]],
 "**Actualización por defecto**: procesa solo lo nuevo. **Full refresh**: en streaming tables limpia datos y checkpoints y reprocesa todo desde el origen; en vistas materializadas el resultado es el mismo que con la actualización por defecto. Databricks recomienda usarlo solo cuando sea necesario.",
 "Full refresh de streaming table + origen con retención limitada = riesgo de pérdida. Piénsalo dos veces.",
 "sql", `-- Actualización normal (incremental)
REFRESH STREAMING TABLE prod.bronze.eventos;

-- Reprocesa TODO desde el origen: úsalo con cuidado
REFRESH STREAMING TABLE prod.bronze.eventos FULL;`, ["Pipeline updates", "ldp/updates"]],

/* ───── 4.2 Implement Lakeflow Jobs ───── */
["4.2", "Configurar triggers de job", "Cuando llegue el archivo",
 "Un proveedor deposita archivos en una external location a horas impredecibles. El job debe ejecutarse poco después de cada llegada, sin sondear con un schedule frecuente. ¿Qué trigger configuras?",
 ["File arrival.", "Lanza una ejecución cuando llegan archivos nuevos a una external location o a un volumen de Unity Catalog."],
 [["Scheduled, cada minuto.", "Arranca ejecuciones aunque no haya nada que procesar."],
  ["Continuous.", "Mantiene una ejecución siempre activa: no es necesario para llegadas esporádicas."],
  ["Table update.", "Reacciona a actualizaciones de tablas, no a la llegada de archivos."]],
 "El trigger **file arrival** vigila la raíz o una subruta de una external location o de un volumen, incluidas sus subcarpetas, y comprueba la llegada de archivos aproximadamente cada minuto (best effort). No añade costo más allá del del proveedor de nube por listar el almacenamiento.",
 "«Cuando lleguen archivos» → file arrival. «Cuando cambie una tabla» → table update. «A una hora» → scheduled.",
 "yaml", `resources:
  jobs:
    ingesta_proveedor:
      name: ingesta_proveedor
      trigger:
        pause_status: UNPAUSED
        file_arrival:
          url: /Volumes/prod/landing/proveedor/`, ["File arrival triggers", "jobs/file-arrival-triggers"]],

["4.2", "Configurar triggers de job", "Cuando la tabla se actualice",
 "Un job que recalcula indicadores gold debe ejecutarse cada vez que se actualice la tabla `prod.silver.pedidos`, que cargan otros equipos sin horario fijo. ¿Qué trigger usas?",
 ["Table update.", "Lanza el job cuando las tablas indicadas reciben actualizaciones."],
 [["File arrival sobre la carpeta de la tabla.", "Vigilar los archivos internos de una tabla Delta no es el mecanismo previsto."],
  ["Scheduled cada 5 minutos.", "Ejecuta aunque no haya cambios y añade latencia cuando los hay."],
  ["Job completion del job de otro equipo.", "Acopla tu job a un job concreto en lugar de al dato; si la tabla se carga por otra vía, no se entera."]],
 "Tipos de trigger en Lakeflow Jobs: **Scheduled**, **File arrival**, **Table update**, **Job completion**, **Continuous** y ejecución manual. Con *table update*, referencias dinámicas como `{{job.trigger.table_update.updated_tables}}` indican qué tablas cambiaron.",
 "Reaccionar a datos, no a relojes: tabla → table update; archivos → file arrival.",
 "yaml", `trigger:
  pause_status: UNPAUSED
  table_update:
    table_names:
      - prod.silver.pedidos
    condition: ANY_UPDATED`, ["Table update triggers", "jobs/trigger-table-update"]],

["4.2", "Configurar triggers de job", "Siempre en ejecución",
 "Un job de streaming debe estar siempre activo: si una ejecución termina o falla, debe arrancar otra automáticamente. ¿Qué configuras y qué limitación tiene?",
 ["Trigger Continuous; no admite dependencias entre tareas ni políticas de reintento (reintenta con backoff exponencial).", "El modo continuo lanza una nueva ejecución cuando la anterior termina o falla, con esas limitaciones documentadas."],
 [["Schedule cada minuto con un máximo de 100 ejecuciones concurrentes.", "Generaría ejecuciones solapadas de un mismo stream."],
  ["Reintentos ilimitados y un máximo de una ejecución concurrente.", "Era la recomendación heredada; el modo continuo la sustituye."],
  ["Trigger Continuous; admite cualquier grafo de dependencias entre tareas.", "No se pueden usar dependencias entre tareas en un job continuo."]],
 "En modo **continuous** siempre hay una ejecución activa; entre el fin de una y el inicio de la siguiente hay un pequeño retardo (menos de 60 segundos). Los fallos se gestionan con backoff exponencial, y puede configurarse el modo de reintento de tareas.",
 "«Siempre activo» → Continuous. Recuerda sus dos «no»: dependencias entre tareas y políticas de reintento.",
 "yaml", `resources:
  jobs:
    stream_telemetria:
      name: stream_telemetria
      continuous:
        pause_status: UNPAUSED
      tasks:
        - task_key: procesar
          notebook_task: { notebook_path: ../src/stream_telemetria.py }`, ["Continuous jobs", "jobs/continuous"]],

["4.2", "Programar un job", "Todos los laborables a las 06:30",
 "Un job debe ejecutarse de lunes a viernes a las 06:30, hora de Madrid, también tras los cambios de horario de verano. ¿Qué configuras?",
 ["Un trigger scheduled con una expresión cron y la zona horaria Europe/Madrid.", "La programación con cron admite zona horaria, de modo que la hora local se mantiene tras los cambios de horario."],
 [["Un schedule en UTC a las 05:30 fijo todo el año.", "Se desfasa una hora cuando cambia el horario de verano."],
  ["Un trigger continuous con una pausa manual los fines de semana.", "Ni cumple el horario ni es automático."],
  ["Un file arrival trigger.", "No depende de la llegada de archivos."]],
 "El trigger **scheduled** admite programaciones simples (cada N minutos, horas, días) o avanzadas con sintaxis **Quartz cron** y zona horaria. Un schedule puede **pausarse** sin eliminarlo.",
 "Hora local estable → cron + timezone_id. «Detener temporalmente» → pausar el schedule, no borrarlo.",
 "yaml", `schedule:
  quartz_cron_expression: "0 30 6 ? * MON-FRI"
  timezone_id: "Europe/Madrid"
  pause_status: UNPAUSED`, ["Schedules and triggers", "jobs/triggers"]],

["4.2", "Configurar alertas para un job", "El job que tarda demasiado",
 "Un job que normalmente dura 20 minutos a veces se queda bloqueado durante horas sin fallar. Quieres un aviso cuando supere los 45 minutos. ¿Qué configuras?",
 ["Un umbral de duración (aviso) en el job y una notificación para el evento «la duración supera el umbral».", "Las notificaciones pueden enviarse cuando la duración excede un umbral configurado."],
 [["Solo una notificación «On failure».", "El job no falla: sigue en ejecución, así que no se dispararía."],
  ["Una notificación «On start».", "Avisa en cada inicio, no cuando hay un retraso."],
  ["Aumentar `max_retries`.", "Los reintentos actúan tras un fallo; un job bloqueado no ha fallado."]],
 "Eventos de notificación: inicio, finalización correcta, fallo, **duración que supera un umbral** y backlog de streaming por encima de un umbral. Los umbrales de duración admiten un valor de aviso (duración esperada) y un tiempo máximo (timeout) que cancela la ejecución.",
 "«Lento / bloqueado / no termina» → umbral de duración. «Falla» → on failure.",
 "yaml", `health:
  rules:
    - metric: RUN_DURATION_SECONDS
      op: GREATER_THAN
      value: 2700
email_notifications:
  on_failure: ["datos-oncall@contoso.example"]
  on_duration_warning_threshold_exceeded: ["datos-oncall@contoso.example"]
timeout_seconds: 7200`, ["Notifications", "jobs/notifications"]],

["4.2", "Configurar alertas para un job", "Avisar en Teams",
 "El equipo de guardia quiere recibir los fallos de los jobs en un canal de Microsoft Teams en lugar de por correo. ¿Cómo se hace?",
 ["Un administrador configura Microsoft Teams como destino de notificación del sistema y el job lo selecciona para el evento de fallo.", "Las notificaciones pueden enviarse a destinos de terceros como Slack, Microsoft Teams, PagerDuty o cualquier servicio basado en webhooks."],
 [["No es posible: los jobs solo notifican por correo electrónico.", "Se admiten correo y destinos de terceros."],
  ["Con un notebook final que llame a la API de Teams en cada job.", "Reinventa una función nativa y no se ejecuta si el job se cancela o falla antes."],
  ["Con un diagnostic setting de Azure.", "Eso envía logs de diagnóstico a Azure Monitor; no es la notificación a nivel de job."]],
 "Los **destinos de notificación** los configuran los administradores del workspace; después cualquier job puede usarlos. Las notificaciones pueden definirse a nivel de job y de tarea.",
 "Notificar fuera del correo → destino de notificación (Teams, Slack, PagerDuty, webhook).",
 "yaml", `webhook_notifications:
  on_failure:
    - id: "0481e838-0a59-4eff-9541-a4ca6f149574"   # destino Teams configurado por un admin
email_notifications:
  on_failure: ["datos-oncall@contoso.example"]`, ["Notifications", "jobs/notifications"]],

["4.2", "Configurar reinicios automáticos", "Reintentar sin despertar a nadie",
 "Una tarea llama a una API externa que de vez en cuando devuelve errores transitorios. Quieres que se reintente sola hasta tres veces, esperando dos minutos entre intentos. ¿Qué configuras?",
 ["Una política de reintentos en la tarea: número máximo de reintentos e intervalo mínimo entre ellos.", "Los reintentos se definen por tarea y absorben fallos transitorios sin intervención."],
 [["Un trigger continuous en el job.", "Reinicia el job entero continuamente y no admite políticas de reintento."],
  ["Repair run manual cada vez que falle.", "Funciona, pero exige intervención humana."],
  ["Aumentar el tamaño del clúster.", "El fallo está en un servicio externo."]],
 "Los **reintentos por tarea** controlan cuántas veces y con qué espera se reintenta una tarea fallida, y si se reintenta también por timeout. Para pipelines, las actualizaciones lanzadas desde Jobs o la API y todas las de pipelines continuos usan reintento y reinicio automáticos.",
 "Fallo transitorio → reintentos por tarea. Fallo de lógica o datos → corregir y repair run.",
 "yaml", `- task_key: llamar_api
  notebook_task: { notebook_path: ../src/llamar_api.py }
  max_retries: 3
  min_retry_interval_millis: 120000
  retry_on_timeout: true`, ["Configure jobs", "jobs/configure-job"]],

["4.2", "Crear y configurar un job", "Ejecuciones que se pisan",
 "Un job programado cada 15 minutos a veces tarda 25. Dos ejecuciones simultáneas escriben en la misma tabla y generan conflictos. ¿Qué configuración lo evita sin perder ejecuciones?",
 ["Máximo de ejecuciones concurrentes = 1, con la cola de ejecuciones (queueing) activada.", "Con una sola ejecución concurrente no hay solapamiento, y la cola hace que la siguiente espere en lugar de omitirse."],
 [["Aumentar el máximo de ejecuciones concurrentes a 10.", "Empeora el problema: más ejecuciones escribiendo a la vez."],
  ["Desactivar el schedule.", "El job dejaría de ejecutarse."],
  ["Añadir reintentos a todas las tareas.", "Los reintentos no evitan el solapamiento y pueden agravarlo."]],
 "La configuración del job incluye el **número máximo de ejecuciones concurrentes** y la **cola de ejecuciones**. El queueing está activado por defecto en los jobs creados desde la UI después del 15 de abril de 2024.",
 "Ejecuciones solapadas → max concurrent runs = 1 (+ queue para no perder ninguna).",
 "yaml", `resources:
  jobs:
    carga_frecuente:
      name: carga_frecuente
      max_concurrent_runs: 1
      queue:
        enabled: true
      schedule:
        quartz_cron_expression: "0 0/15 * * * ?"
        timezone_id: "UTC"`, ["Configure jobs", "jobs/configure-job"]],

["4.2", "Crear y configurar un job (tareas)", "Un pipeline dentro de un job",
 "Tu job debe (1) actualizar un pipeline declarativo y (2) después ejecutar un notebook que exporta resultados. ¿Cómo lo configuras?",
 ["Un job con una tarea de tipo Pipeline y una tarea de notebook que depende de ella.", "Los pipelines se orquestan desde un job mediante la tarea Pipeline, que puede encadenarse con otras tareas."],
 [["Programar el pipeline y el notebook por separado a horas distintas.", "No garantiza el orden ni que el pipeline haya terminado bien."],
  ["Llamar al notebook desde dentro del código del pipeline.", "El código de un pipeline declara conjuntos de datos; no orquesta pasos arbitrarios."],
  ["Convertir el notebook en una vista materializada.", "Una exportación no es un conjunto de datos del pipeline."]],
 "Lakeflow Jobs orquesta tipos de tarea heterogéneos: notebook, script Python, wheel, SQL, **Pipeline**, dbt, **Run Job** (un job que llama a otro), If/else, For each, etc. Una actualización de pipeline lanzada desde un job usa el comportamiento automático de reintento.",
 "Orquestar un pipeline con otros pasos → tarea Pipeline dentro de un job.",
 "yaml", `tasks:
  - task_key: actualizar_pipeline
    pipeline_task:
      pipeline_id: \${resources.pipelines.ventas_pipeline.id}

  - task_key: exportar
    depends_on:
      - task_key: actualizar_pipeline
    notebook_task:
      notebook_path: ../src/exportar_resultados.py`, ["Lakeflow Jobs", "jobs/"]]
]);
