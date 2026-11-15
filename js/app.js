/* Interfaz: enrutado por hash, vistas y manejo de eventos. */
(function () {
  const D = window.DP750, E = D.Engine, { esc, rich, block } = D.HL;
  const $ = s => document.querySelector(s);
  const view = $("#view"), hud = $("#hud"), nav = $("#nav");
  const DOM = Object.fromEntries(D.DOMAINS.map(d => [d.id, d]));
  const LETTERS = ["A", "B", "C", "D", "E"];
  const MODE_LABEL = { campaign: "Campaña", audit: "Code & Permission Audit", debt: "Deuda técnica", drill: "Preguntas de concepto", skill: "Ruta de aprendizaje" };

  let session = null;   // sesión de entrenamiento en curso
  let exam = null;      // examen en curso o resultado
  let timerId = null;
  let libTab = "temario", cheatFilter = "all";

  /* ───────── utilidades ───────── */
  const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
  const chip = d => `<span class="chip" style="--c:${d.color}">${esc(d.short)} · ${d.min}–${d.max}%</span>`;
  const bar = (value, color, label) =>
    `<div class="bar" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label || "")}"><i style="width:${Math.max(0, Math.min(100, value))}%;background:${color}"></i></div>`;
  const fmtTime = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const fmtDate = t => new Date(t).toLocaleDateString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2600);
  }

  /* ───────── HUD y navegación ───────── */
  function renderHud() {
    const s = E.state, r = E.rank(), debt = E.debtCount(), streak = E.streakAlive();
    const dbuPct = Math.min(100, pct(s.dbu, E.CFG.dbuStart));
    const dbuColor = dbuPct > 50 ? "var(--ok)" : dbuPct > 25 ? "var(--warn)" : "var(--bad)";
    const slaColor = s.sla >= 90 ? "var(--ok)" : s.sla >= E.CFG.slaBreach ? "var(--warn)" : "var(--bad)";
    hud.innerHTML = `
      <div class="metric"><span class="k">Presupuesto DBU</span><span class="v">${s.dbu}<small> / ${E.CFG.dbuStart}</small></span>${bar(dbuPct, dbuColor, "Presupuesto DBU")}</div>
      <div class="metric"><span class="k">SLA de latencia</span><span class="v" style="color:${slaColor}">${s.sla}%<small>${s.sla < E.CFG.slaBreach ? " incumplido" : ""}</small></span>${bar(s.sla, slaColor, "SLA")}</div>
      <div class="metric wide"><span class="k">Rango</span><span class="v rank">${esc(r.name)}</span>${bar(r.pct, "var(--accent)", "Progreso de rango")}<span class="sub">${s.xp} XP${r.next ? " · siguiente a " + r.next.xp : " · rango máximo"}</span></div>
      <div class="metric sm"><span class="k">Racha</span><span class="v">${streak}<small> día${streak === 1 ? "" : "s"}</small></span></div>
      <div class="metric sm"><span class="k">Deuda técnica</span><span class="v" style="color:${debt ? "var(--warn)" : "var(--ok)"}">${debt}</span></div>`;
  }

  const ROUTES = [
    ["panel", "Panel de control"], ["ruta", "Ruta de aprendizaje"], ["drill", "Preguntas de concepto"], ["campana", "Modo Campaña"], ["audit", "Code & Permission Audit"], ["acciones", "Acciones de Ingeniero"], ["juego", "Juego: Incident Run"],
    ["examen", "Simulador de examen"], ["deuda", "Deuda técnica"], ["biblioteca", "Biblioteca de estudio"]
  ];
  function renderNav(route) {
    const debt = E.debtCount();
    nav.innerHTML = ROUTES.map(([id, label]) =>
      `<a href="#/${id}" class="${id === route ? "on" : ""}" ${id === route ? 'aria-current="page"' : ""}>${esc(label)}${id === "deuda" && debt ? `<b>${debt}</b>` : ""}</a>`).join("");
  }

  /* ───────── Panel ───────── */
  function viewPanel() {
    const m = E.mastery(), s = E.state, ready = E.readiness();
    const seen = m.reduce((a, x) => a + x.seen, 0), total = m.reduce((a, x) => a + x.total, 0);
    const weakest = m.slice().sort((a, b) =>
      ((100 - b.pct) * (b.domain.min + b.domain.max)) - ((100 - a.pct) * (a.domain.min + a.domain.max)))[0];
    const debt = E.debtCount();
    let next;
    if (!seen && !debt) next = { t: "Empieza por la Ruta de aprendizaje: cada habilidad oficial tiene una mini-lección y sus preguntas, de lo conceptual a lo aplicado.", a: "#/ruta", l: "Abrir la ruta" };
    else if (debt) next = { t: `Tienes ${debt} concepto${debt > 1 ? "s" : ""} en deuda técnica. Sáldalos antes de avanzar: es donde más puntos recuperas.`, a: "#/deuda", l: "Pagar deuda" };
    else if (seen < total) next = { t: `Te quedan ${total - seen} casos sin ver. El dominio con mayor impacto pendiente es «${weakest.domain.name}».`, a: "#/ruta", l: "Continuar la ruta" };
    else if (weakest.pct < 100) next = { t: `Refuerza «${weakest.domain.name}» (${weakest.pct}% de dominio, pesa ${weakest.domain.min}–${weakest.domain.max}% del examen).`, a: "#/ruta", l: "Entrenar" };
    else next = { t: "Banco dominado. Valida con el simulador cronometrado y repasa las tablas resumen.", a: "#/examen", l: "Ir al simulador" };

    const readyColor = ready >= 700 ? "var(--ok)" : ready >= 500 ? "var(--warn)" : "var(--bad)";
    view.innerHTML = `
      <div class="page-head"><h1>Panel de control</h1><p>Examen Microsoft DP-750 · Implementing Data Engineering Solutions Using Azure Databricks</p></div>
      <section class="grid two">
        <div class="card">
          <h2>Preparación estimada</h2>
          <div class="score"><span style="color:${readyColor}">${ready}</span><small>/ 1000</small></div>
          <div class="scale">${bar(ready / 10, readyColor, "Preparación")}<i class="mark" style="left:70%"></i></div>
          <p class="hint">Mínimo aprobatorio: 700. Estimación ponderada por el peso de cada dominio sobre el banco de esta app (${seen} de ${total} casos vistos). No predice tu nota real: Microsoft no publica su fórmula de escalado.</p>
        </div>
        <div class="card next">
          <h2>Siguiente acción recomendada</h2>
          <p>${esc(next.t)}</p>
          <a class="btn primary" href="${next.a}">${esc(next.l)}</a>
        </div>
      </section>
      <section class="card">
        <h2>Dominio por área del examen</h2>
        <div class="domains">${m.map(x => `
          <div class="dom">
            <div class="dom-top"><span class="dom-name"><i style="background:${x.domain.color}"></i>${esc(x.domain.name)}</span><span class="dom-pct">${x.pct}%</span></div>
            ${bar(x.pct, x.domain.color, x.domain.name)}
            <div class="dom-meta"><span>Peso oficial ${x.domain.min}–${x.domain.max}%</span><span>${x.ok}/${x.total} dominados · ${x.seen} vistos${x.debt ? ` · <b class="warn">${x.debt} en deuda</b>` : ""}</span></div>
          </div>`).join("")}</div>
      </section>
      <section class="grid two">
        <div class="card">
          <h2>Historial de simulacros</h2>
          ${s.exams.length ? `<table class="tbl"><thead><tr><th>Fecha</th><th>Puntaje</th><th>Aciertos</th><th>Resultado</th></tr></thead><tbody>${s.exams.slice(0, 6).map(x =>
            `<tr><td>${fmtDate(x.at)}</td><td><b>${x.score}</b></td><td>${x.correct}/${x.total}</td><td class="${x.pass ? "ok" : "bad"}">${x.pass ? "Aprobado" : "No aprobado"}</td></tr>`).join("")}</tbody></table>`
            : `<p class="empty">Aún no has hecho ningún simulacro.</p>`}
        </div>
        <div class="card">
          <h2>Actividad reciente</h2>
          ${s.log.length ? `<ul class="log">${s.log.slice(0, 7).map(l => { const q = E.BY_ID[l.id]; return q ? `<li><span class="${l.ok ? "ok" : "bad"}">${l.ok ? "✓" : "✗"}</span>${esc(q.title)}<time>${fmtDate(l.at)}</time></li>` : ""; }).join("")}</ul>`
            : `<p class="empty">Sin actividad todavía. Empieza por el Modo Campaña.</p>`}
        </div>
      </section>
      <section class="card">
        <h2>Reglas de la operación</h2>
        <ul class="rules">
          <li><b>Presupuesto DBU.</b> Cada decisión errónea consume DBU según lo cara que sería en producción. Si llega a cero: incidente de facturación (−${E.CFG.xpIncident} XP).</li>
          <li><b>SLA de latencia.</b> Los errores lo degradan; por debajo de ${E.CFG.slaBreach}% ganas la mitad de XP hasta recuperarlo acertando.</li>
          <li><b>Rango.</b> Sube con XP y baja con los errores. Repetir un caso ya dominado da poca XP: se premia aprender, no memorizar.</li>
          <li><b>Deuda técnica.</b> Lo fallado se re-encola y exige ${E.CFG.debtInterest} aciertos seguidos. Si aciertas «con dudas», se re-encola una vez.</li>
        </ul>
        <div class="row">
          <button class="btn" data-act="export">Exportar progreso</button>
          <label class="btn">Importar progreso<input type="file" accept="application/json" data-act="import" hidden></label>
          <button class="btn danger" data-act="reset">Reiniciar todo</button>
        </div>
        <p class="hint">El progreso se guarda solo en este navegador (localStorage).</p>
      </section>`;
  }

  /* ───────── Lanzador de entrenamiento ───────── */
  function viewLauncher(mode) {
    const m = E.mastery();
    const count = id => E.BANK.filter(q => q.mode === mode && (!id || q.domain === id)).length;
    const head = {
      campaign: ["Modo Campaña", "Casos de estudio con restricciones de negocio. Lee las restricciones antes que las opciones: en el DP-750 la respuesta correcta es la que cumple <em>todas</em>."],
      audit: ["Code &amp; Permission Audit", "Revisa bloques reales de SQL, PySpark, YAML y JSON y localiza el defecto: permisos (<code>GRANT</code>), calidad (<code>EXPECT</code>), streaming (<code>cloudFiles</code>), bundles y mantenimiento Delta."],
      drill: ["Preguntas de concepto", "Preguntas directas, una por cada punto del temario oficial, redactadas a partir de la documentación de Azure Databricks. Sesiones de 10 que priorizan tu deuda técnica y lo que aún no has visto."]
    }[mode];
    const limit = mode === "drill" ? 10 : "";
    const sub = n => mode === "drill" ? `${n} preguntas en el banco · sesión de 10` : `${n} casos`;
    view.innerHTML = `
      <div class="page-head"><h1>${head[0]}</h1><p>${head[1]}</p></div>
      <section class="card">
        <h2>Elige el alcance</h2>
        <div class="launch">
          <button class="tile" data-act="start" data-mode="${mode}" data-domain="" data-limit="${limit}">
            <strong>Todos los dominios</strong><span>${sub(count())}</span></button>
          ${m.map(x => `<button class="tile" data-act="start" data-mode="${mode}" data-domain="${x.domain.id}" data-limit="${limit}" style="--c:${x.domain.color}">
            <strong>${esc(x.domain.name)}</strong><span>${sub(count(x.domain.id))} · peso ${x.domain.min}–${x.domain.max}% · dominio ${x.pct}%</span></button>`).join("")}
        </div>
      </section>
      <section class="card">
        <h2>Cómo se evalúa cada decisión</h2>
        <ol class="layers">
          <li><b>Fundamento técnico</b> — por qué la arquitectura o el código correcto es el óptimo.</li>
          <li><b>Autopsia de distractores</b> — por qué falla cada opción incorrecta, una por una.</li>
          <li><b>Heurística de examen</b> — la regla rápida para reconocer el patrón.</li>
          <li><b>Código de referencia</b> — fragmento en PySpark, Databricks SQL o configuración, con enlace a la documentación oficial.</li>
        </ol>
        <p class="hint">Atajos: <kbd>1</kbd>–<kbd>4</kbd> o <kbd>A</kbd>–<kbd>D</kbd> para elegir, <kbd>Enter</kbd> para confirmar y avanzar.</p>
      </section>`;
  }

  /* ───────── Ruta de aprendizaje por habilidad oficial ───────── */
  function viewRoute() {
    const sm = Object.fromEntries(E.skillMastery().map(x => [x.skill.id, x]));
    view.innerHTML = `
      <div class="page-head"><h1>Ruta de aprendizaje</h1>
        <p>Las 12 habilidades de la guía oficial (skills measured as of ${esc(D.GUIDE.asOf)}). Para cada una: lee la mini-lección, repasa los puntos que evalúa el examen y entrena hasta dominarla.</p></div>
      ${D.DOMAINS.map(d => `
        <section class="card route" style="--c:${d.color}">
          <h2><span class="route-dom">${esc(d.name)}</span><span class="w">${d.min}–${d.max}% del examen</span></h2>
          ${d.groups.map(g => { const x = sm[g.id]; const done = x.pct === 100;
            return `<details class="skill ${done ? "done" : ""}">
              <summary><span class="sid">${g.id}</span><span class="sname"><b>${esc(g.es)}</b><small>${esc(g.title)}</small></span>
                <span class="sprog">${bar(x.pct, d.color, g.es)}<small>${x.ok}/${x.total} dominadas${x.debt ? ` · <b class="warn">${x.debt} en deuda</b>` : ""}</small></span></summary>
              <div class="skill-body">
                <div class="grid two">
                  <div><h3>Mini-lección</h3><ul class="brief">${g.brief.map(b => `<li>${rich(b)}</li>`).join("")}</ul></div>
                  <div><h3>Lo que evalúa el examen <small>(texto oficial)</small></h3><ul class="official">${g.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
                    <h3>Documentación oficial</h3><p class="doclinks">${g.docs.map(x => `<a href="${D.DOC + x[1]}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join(" · ")}</p></div>
                </div>
                <div class="row end"><button class="btn primary" data-act="start" data-mode="skill" data-domain="${g.id}" data-limit="">Entrenar esta habilidad (${x.total} preguntas)</button></div>
              </div></details>`; }).join("")}
        </section>`).join("")}`;
  }

  function startSession(mode, domain, limit) {
    const list = mode === "debt" ? E.debtQueue() : mode === "skill" ? E.skillQueue(domain) : E.queue(mode, domain || null, +limit || 0);
    if (!list.length) { toast("No hay casos en este alcance."); return; }
    session = { mode, list, idx: 0, right: 0, wrong: 0, dbu: 0, cur: null };
    loadQuestion();
  }
  function loadQuestion() {
    const q = session.list[session.idx];
    session.cur = { q, order: E.shuffle(q.options.map((_, i) => i)), pick: null, doubt: false, fx: null };
    renderSession();
    view.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }

  /* Bloque de pregunta (compartido por entrenamiento, examen y revisión). */
  function questionBody(q) {
    return `
      ${q.context ? `<p class="ctx">${rich(q.context)}</p>` : ""}
      ${q.constraints ? `<div class="constraints"><h3>Restricciones</h3><ul>${q.constraints.map(c => `<li>${rich(c)}</li>`).join("")}</ul></div>` : ""}
      ${q.audit ? block(q.audit, "Código bajo auditoría") : ""}
      <p class="ask">${rich(q.question)}</p>`;
  }
  function optionsHtml(q, order, pick, revealed, act) {
    return `<div class="opts" role="radiogroup" aria-label="Opciones">${order.map((oi, k) => {
      const o = q.options[oi];
      const cls = revealed ? (o.ok ? "right" : oi === pick ? "wrong" : "dim") : (oi === pick ? "sel" : "");
      return `<button class="opt ${cls}" role="radio" aria-checked="${oi === pick}" data-act="${act}" data-oi="${oi}" ${revealed ? "disabled" : ""}>
        <span class="let">${LETTERS[k]}</span><span class="txt">${rich(o.t)}</span>${revealed && o.ok ? '<span class="tag ok">Correcta</span>' : ""}${revealed && !o.ok && oi === pick ? '<span class="tag bad">Tu elección</span>' : ""}</button>`;
    }).join("")}</div>`;
  }
  function feedbackHtml(q, order, pick) {
    return `
      <section class="layer"><h3><span>1</span>Fundamento técnico</h3><p>${rich(q.foundation)}</p></section>
      <section class="layer"><h3><span>2</span>Autopsia de distractores</h3>
        <ul class="autopsy">${order.map((oi, k) => { const o = q.options[oi];
          return `<li class="${o.ok ? "ok" : "bad"}${oi === pick ? " mine" : ""}"><span class="let">${LETTERS[k]}</span><div><p class="o">${rich(o.t)}${oi === pick ? ' <em>(tu elección)</em>' : ""}</p><p class="w"><b>${o.ok ? "Correcta." : "Falla porque:"}</b> ${rich(o.why)}</p></div></li>`; }).join("")}</ul></section>
      <section class="layer heur"><h3><span>3</span>Heurística de examen</h3><p>${rich(q.heuristic)}</p></section>
      <section class="layer"><h3><span>4</span>Código de referencia</h3>${block(q.code, "Implementación correcta")}
        ${q.codeNote ? `<p class="note">${rich(q.codeNote)}</p>` : ""}</section>
      ${q.refs ? `<p class="refs">Documentación oficial: ${q.refs.map(r => `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.t)}</a>`).join(" · ")}</p>` : ""}`;
  }

  function renderSession() {
    const { q, order, pick, doubt, fx } = session.cur;
    const d = DOM[q.domain], n = session.list.length, inDebt = E.state.debt[q.id] && !fx;
    const last = session.idx === n - 1;
    view.innerHTML = `
      <div class="q-head">
        <div class="crumbs"><span class="mode">${esc(MODE_LABEL[session.mode])}</span>${chip(d)}<span class="chip">Habilidad ${q.skill}</span>${inDebt ? '<span class="chip debt">En deuda técnica</span>' : ""}</div>
        <div class="prog"><span>Caso ${session.idx + 1} de ${n}</span>${bar(pct(session.idx + (fx ? 1 : 0), n), "var(--accent)", "Progreso de la sesión")}</div>
      </div>
      <article class="card q">
        <p class="obj">Objetivo evaluado: ${esc(q.objective)}</p>
        <h1>${esc(q.title)}</h1>
        ${questionBody(q)}
        ${optionsHtml(q, order, pick, !!fx, "pick")}
        ${fx ? "" : `<div class="row end">
          <label class="check"><input type="checkbox" data-act="doubt" ${doubt ? "checked" : ""}> Respondo con dudas</label>
          <button class="btn primary" data-act="confirm" ${pick === null ? "disabled" : ""}>Confirmar decisión</button></div>`}
      </article>
      ${fx ? `
      <div class="verdict ${fx.ok ? "ok" : "bad"}" role="status">
        <div><strong>${fx.ok ? "Decisión correcta" : "Decisión incorrecta"}</strong>
          <span>${fx.ok ? "Arquitectura aprobada en revisión." : "Esta decisión habría tenido un costo en producción."}</span></div>
        <div class="impact">
          <span class="${fx.dbu >= 0 ? "ok" : "bad"}">${fx.dbu >= 0 ? "+" : ""}${fx.dbu} DBU</span>
          <span class="${fx.sla >= 0 ? "ok" : "bad"}">${fx.sla >= 0 ? "+" : ""}${fx.sla} SLA</span>
          <span class="${fx.xp >= 0 ? "ok" : "bad"}">${fx.xp >= 0 ? "+" : ""}${fx.xp} XP</span></div>
        ${fx.notes.length ? `<ul>${fx.notes.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      </div>
      <div class="card fb">${feedbackHtml(q, order, pick)}</div>
      <div class="row end"><button class="btn primary" data-act="next">${last ? "Ver resumen de la sesión" : "Siguiente caso"}</button></div>` : ""}`;
  }

  function confirmAnswer() {
    const c = session.cur;
    if (c.pick === null || c.fx) return;
    c.fx = E.answer(c.q.id, c.pick, c.doubt);
    c.fx.ok ? session.right++ : session.wrong++;
    session.dbu += c.fx.dbu;
    renderHud(); renderNav(currentRoute()); renderSession();
    const v = view.querySelector(".verdict"); if (v) v.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function nextQuestion() {
    if (session.idx < session.list.length - 1) { session.idx++; loadQuestion(); return; }
    const s = session; session = null;
    const debt = E.debtCount();
    view.innerHTML = `
      <div class="page-head"><h1>Resumen de la sesión</h1><p>${esc(MODE_LABEL[s.mode])}</p></div>
      <section class="card">
        <div class="stats"><div><b class="ok">${s.right}</b><span>Correctas</span></div><div><b class="bad">${s.wrong}</b><span>Incorrectas</span></div>
          <div><b class="${s.dbu >= 0 ? "ok" : "bad"}">${s.dbu >= 0 ? "+" : ""}${s.dbu}</b><span>Balance DBU</span></div><div><b class="${debt ? "warn" : "ok"}">${debt}</b><span>Conceptos en deuda</span></div></div>
        <p>${s.wrong ? "Los conceptos fallados quedaron en deuda técnica. Repásalos ahora, mientras la explicación está fresca: la repetición inmediata y luego espaciada es lo que fija el patrón." : "Sesión limpia. Alterna con el otro modo de entrenamiento o valida con el simulador cronometrado."}</p>
        <div class="row">${debt ? '<a class="btn primary" href="#/deuda">Pagar deuda técnica</a>' : ""}<a class="btn" href="#/panel">Volver al panel</a><a class="btn" href="#/examen">Simulador de examen</a></div>
      </section>`;
    window.scrollTo(0, 0);
  }

  /* ───────── Deuda técnica ───────── */
  function viewDebt() {
    const ids = Object.keys(E.state.debt);
    view.innerHTML = `
      <div class="page-head"><h1>Deuda técnica</h1><p>Conceptos fallados (o acertados con dudas) que se re-encolan automáticamente hasta consolidarse.</p></div>
      <section class="card">
        ${ids.length ? `<table class="tbl"><thead><tr><th>Concepto</th><th>Dominio</th><th>Modo</th><th>Aciertos pendientes</th></tr></thead><tbody>${ids.map(id => { const q = E.BY_ID[id]; if (!q) return "";
          return `<tr><td><b>${esc(q.title)}</b><br><small>${esc(q.objective)}</small></td><td>${chip(DOM[q.domain])}</td><td>${q.mode === "audit" ? "Audit" : "Campaña"}</td><td class="warn"><b>${E.state.debt[id]}</b></td></tr>`; }).join("")}</tbody></table>
          <div class="row end"><button class="btn primary" data-act="start" data-mode="debt" data-domain="">Pagar deuda ahora (${ids.length})</button></div>`
        : `<p class="empty">Sin deuda técnica. Todo lo que has fallado está saldado.</p>`}
      </section>`;
  }

  /* ───────── Simulador de examen ───────── */
  function viewExam() {
    if (exam && exam.result) return renderExamResult();
    if (exam) return renderExam();
    const per = E.CFG.examSecondsPerQuestion;
    view.innerHTML = `
      <div class="page-head"><h1>Simulador de examen cronometrado</h1><p>Preguntas de los cuatro dominios, muestreadas según su peso oficial y sin retroalimentación hasta el final.</p></div>
      <section class="card">
        <div class="stats"><div><b>${E.BANK.length}</b><span>Preguntas en el banco</span></div><div><b>${per / 60} min</b><span>Por pregunta</span></div><div><b>${E.CFG.passScore}</b><span>Mínimo / 1000</span></div><div><b>4</b><span>Dominios</span></div></div>
        <ul class="rules">
          <li>Cada simulacro extrae una muestra distinta del banco, proporcional al peso de cada dominio.</li>
          <li>Puedes navegar entre preguntas, cambiar respuestas y marcarlas para revisión.</li>
          <li>Al terminar (o agotarse el tiempo) verás el puntaje, el desglose por dominio y la revisión completa en 4 capas.</li>
          <li>Las preguntas falladas u omitidas pasan a la deuda técnica. El simulacro no consume DBU.</li>
        </ul>
        <p class="hint">El puntaje se estima ponderando cada dominio por el punto medio de su peso oficial. Microsoft usa una puntuación escalada cuya fórmula no es pública, y la guía oficial no indica el número de preguntas ni la duración del examen real: confírmalos al reservar. Haz también el Practice Assessment oficial enlazado en la Biblioteca.</p>
        <div class="row end"><button class="btn" data-act="exam-start" data-n="20">Simulacro rápido · 20 preguntas · ${fmtTime(20 * per)}</button>
          <button class="btn primary" data-act="exam-start" data-n="50">Simulacro completo · 50 preguntas · ${fmtTime(50 * per)}</button></div>
      </section>`;
  }
  function examStart(n) {
    const items = E.buildExam(n);
    exam = { items, idx: 0, left: items.length * E.CFG.examSecondsPerQuestion, total: items.length * E.CFG.examSecondsPerQuestion, result: null };
    clearInterval(timerId);
    timerId = setInterval(() => {
      if (!exam || exam.result) return clearInterval(timerId);
      exam.left--;
      const t = document.getElementById("timer");
      if (t) { t.textContent = fmtTime(Math.max(0, exam.left)); t.classList.toggle("low", exam.left <= 120); }
      if (exam.left <= 0) examFinish(true);
    }, 1000);
    renderExam();
  }
  function renderExam() {
    const it = exam.items[exam.idx], q = E.BY_ID[it.id], n = exam.items.length;
    const answered = exam.items.filter(i => i.pick !== null).length;
    view.innerHTML = `
      <div class="q-head exam">
        <div class="crumbs"><span class="mode">Simulacro</span><span class="chip">Pregunta ${exam.idx + 1} de ${n}</span></div>
        <div class="prog"><span>${answered}/${n} respondidas</span>${bar(pct(answered, n), "var(--accent)", "Progreso del examen")}</div>
        <div class="timer"><span>Tiempo restante</span><b id="timer" class="${exam.left <= 120 ? "low" : ""}">${fmtTime(Math.max(0, exam.left))}</b></div>
      </div>
      <article class="card q">
        <h1>${esc(q.title)}</h1>
        ${questionBody(q)}
        ${optionsHtml(q, it.order, it.pick, false, "exam-pick")}
        <div class="row between">
          <label class="check"><input type="checkbox" data-act="exam-flag" ${it.flag ? "checked" : ""}> Marcar para revisión</label>
          <div class="row"><button class="btn" data-act="exam-prev" ${exam.idx === 0 ? "disabled" : ""}>Anterior</button>
          ${exam.idx < n - 1 ? '<button class="btn primary" data-act="exam-next">Siguiente</button>' : '<button class="btn primary" data-act="exam-finish">Finalizar examen</button>'}</div>
        </div>
      </article>
      <section class="card">
        <h2>Navegador de preguntas</h2>
        <div class="navgrid">${exam.items.map((x, i) => `<button data-act="exam-go" data-i="${i}" class="${i === exam.idx ? "cur " : ""}${x.pick !== null ? "done " : ""}${x.flag ? "flag" : ""}" aria-label="Pregunta ${i + 1}${x.pick !== null ? ", respondida" : ", sin responder"}${x.flag ? ", marcada" : ""}">${i + 1}</button>`).join("")}</div>
        <div class="row between"><p class="hint">Relleno = respondida · borde ámbar = marcada para revisión.</p><button class="btn" data-act="exam-finish">Finalizar examen</button></div>
      </section>`;
  }
  function examFinish(timeout) {
    if (!exam || exam.result) return;
    const missing = exam.items.filter(i => i.pick === null).length;
    if (!timeout && missing && !confirm(`Quedan ${missing} preguntas sin responder. ¿Finalizar de todos modos?`)) return;
    clearInterval(timerId);
    exam.result = E.gradeExam(exam.items, exam.total - Math.max(0, exam.left));
    exam.timeout = !!timeout;
    renderHud(); renderNav(currentRoute()); renderExamResult();
    window.scrollTo(0, 0);
  }
  function renderExamResult() {
    const r = exam.result;
    view.innerHTML = `
      <div class="page-head"><h1>Resultado del simulacro</h1><p>${exam.timeout ? "Tiempo agotado. " : ""}Tiempo empleado: ${fmtTime(r.seconds)}</p></div>
      <section class="card result ${r.pass ? "ok" : "bad"}">
        <div class="score big"><span>${r.score}</span><small>/ 1000</small></div>
        <div><strong>${r.pass ? "APROBADO" : "NO APROBADO"}</strong>
          <p>${r.correct} de ${r.total} correctas · mínimo aprobatorio ${E.CFG.passScore}</p>
          <div class="scale">${bar(r.score / 10, r.pass ? "var(--ok)" : "var(--bad)", "Puntaje")}<i class="mark" style="left:70%"></i></div></div>
      </section>
      <section class="card"><h2>Desglose por dominio</h2>
        <div class="domains">${D.DOMAINS.map(d => { const x = r.perDomain[d.id], p = pct(x.ok, x.total);
          return `<div class="dom"><div class="dom-top"><span class="dom-name"><i style="background:${d.color}"></i>${esc(d.name)}</span><span class="dom-pct">${p}%</span></div>${bar(p, d.color, d.name)}
            <div class="dom-meta"><span>Peso oficial ${d.min}–${d.max}%</span><span>${x.ok}/${x.total} correctas</span></div></div>`; }).join("")}</div>
      </section>
      <section class="card"><h2>Revisión pregunta por pregunta</h2>
        <p class="hint">Abre cada pregunta para ver las 4 capas de explicación. Empieza por las incorrectas.</p>
        ${exam.items.map((it, i) => { const q = E.BY_ID[it.id];
          return `<details class="rev ${it.ok ? "ok" : "bad"}"><summary><span class="st">${it.ok ? "✓" : it.pick === null ? "—" : "✗"}</span><span>${i + 1}. ${esc(q.title)}</span>${chip(DOM[q.domain])}</summary>
            <div class="rev-body">${questionBody(q)}${optionsHtml(q, it.order, it.pick, true, "noop")}${it.pick === null ? '<p class="note">No respondiste esta pregunta.</p>' : ""}${feedbackHtml(q, it.order, it.pick)}</div></details>`; }).join("")}
      </section>
      <div class="row end"><a class="btn" href="#/deuda">Ver deuda técnica</a><button class="btn primary" data-act="exam-reset">Nuevo simulacro</button></div>`;
  }

  /* ───────── Biblioteca ───────── */
  const PLAN = [
    ["Semana 1 · Fundamentos y entorno", "Guía oficial completa + dominio 1 en la Ruta de aprendizaje. Crea un workspace de prueba: catálogo, esquema, volumen, tabla managed y externa. Compara los tipos de cómputo en la práctica."],
    ["Semana 2 · Gobierno", "Dominio 2. Practica GRANT/REVOKE con un segundo usuario, un row filter, un column mask, un secret scope y un share de Delta Sharing. Memoriza la tabla de privilegios."],
    ["Semana 3 · Datos (30–35%)", "Dominio 3. Auto Loader, COPY INTO, MERGE, AUTO CDC con SCD 1 y 2, expectations y liquid clustering. Es uno de los dos bloques que más pesa: dedícale el doble."],
    ["Semana 4 · Pipelines (30–35%)", "Dominio 4. Lakeflow Jobs con dependencias y reintentos, repair run, un bundle desplegado en dos targets, lectura de Spark UI, OPTIMIZE y VACUUM."],
    ["Semana 5 · Consolidación", "Simulacros cronometrados hasta superar 850 de forma estable, deuda técnica en cero, repaso de tablas resumen y, si está disponible, el Practice Assessment oficial de Microsoft Learn."]
  ];
  const TACTICS = [
    ["Lee las restricciones antes que las opciones", "Subraya mentalmente «mínimo costo», «sin secretos», «mínimo mantenimiento», «sin detener el pipeline». La opción correcta cumple todas; los distractores cumplen casi todas."],
    ["Mínimo privilegio siempre", "Entre opciones que funcionan, descarta ALL PRIVILEGES, OWNER, roles directos en Azure y claves de cuenta."],
    ["Lo nativo y declarativo gana", "Unity Catalog frente a configuraciones en clúster; AUTO CDC frente a MERGE manual; bundles frente a scripts; managed frente a externa salvo requisito explícito."],
    ["Reconoce la nomenclatura antigua y la nueva", "Delta Live Tables ↔ Lakeflow Spark Declarative Pipelines; Workflows/Jobs ↔ Lakeflow Jobs; APPLY CHANGES ↔ AUTO CDC; Shared/Single user ↔ Standard/Dedicated."],
    ["Desconfía de «más nodos»", "Ante skew, spill o archivos pequeños, escalar el clúster casi nunca es la causa raíz ni la respuesta."],
    ["Gestiona el tiempo", "Marca y avanza. No dejes preguntas en blanco: una respuesta razonada suma más que una vacía."]
  ];
  function viewLibrary() {
    const tabs = [["temario", "Temario oficial"], ["tablas", "Tablas resumen"], ["tacticas", "Tácticas y plan"], ["fuentes", "Fuentes oficiales"]];
    let body = "";
    if (libTab === "temario") {
      body = `<p class="note">Texto literal de la <a href="${D.GUIDE.url}" target="_blank" rel="noopener">guía de estudio oficial</a>: «Skills measured as of ${esc(D.GUIDE.asOf)}» (página actualizada el ${esc(D.GUIDE.updated)}). La guía advierte de que las viñetas ilustran cómo se evalúa cada habilidad y que pueden entrar temas relacionados, incluidas funciones en Preview de uso común. Compruébala antes del examen por si cambia.</p>
        ${D.DOMAINS.map(d => `<section class="card syl" style="--c:${d.color}"><h2>${esc(d.en)} <span class="w">${d.min}–${d.max}%</span></h2><p class="en">${esc(d.name)}</p>
          <div class="grid two">${d.groups.map(g => `<div><h3>${g.id} · ${esc(g.title)}</h3><ul>${g.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</div></section>`).join("")}`;
    } else if (libTab === "tablas") {
      const list = D.CHEATS.filter(c => cheatFilter === "all" || c.domain === cheatFilter);
      body = `<div class="filters"><button class="${cheatFilter === "all" ? "on" : ""}" data-act="cheat" data-d="all">Todas</button>${D.DOMAINS.map(d => `<button class="${cheatFilter === d.id ? "on" : ""}" data-act="cheat" data-d="${d.id}">${esc(d.short)}</button>`).join("")}</div>
        ${cheatFilter === "all" ? `<section class="card"><h2>Nombres que cambiaron</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nombre anterior</th><th>Nombre en la documentación actual</th><th>Nota</th></tr></thead>
          <tbody>${D.RENAMES.map(r => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>
          <p class="note">El examen puede usar cualquiera de las dos formas. La guía oficial (marzo de 2026) usa: Lakeflow Spark Declarative Pipelines, Lakeflow Jobs, Databricks Asset Bundles, Delta Sharing y AI/BI Genie.</p></section>` : ""}
        ${list.map(c => `<section class="card"><h2>${esc(c.title)} ${chip(DOM[c.domain])}</h2><div class="tbl-wrap"><table class="tbl"><thead><tr>${c.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${c.rows.map(r => `<tr>${r.map((x, i) => `<td>${i === 0 ? "<b>" + rich(x) + "</b>" : rich(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${c.note ? `<p class="note">${rich(c.note)}</p>` : ""}</section>`).join("")}`;
    } else if (libTab === "tacticas") {
      body = `<section class="card"><h2>Tácticas para el día del examen</h2><ol class="tactics">${TACTICS.map(t => `<li><b>${esc(t[0])}.</b> ${esc(t[1])}</li>`).join("")}</ol></section>
        <section class="card"><h2>Plan de estudio sugerido (5 semanas)</h2><ol class="plan">${PLAN.map(p => `<li><b>${esc(p[0])}</b><span>${esc(p[1])}</span></li>`).join("")}</ol>
        <p class="hint">Es una propuesta orientativa; ajústala a tu experiencia previa con Spark y Azure. La práctica en un workspace real es insustituible.</p></section>`;
    } else {
      body = `<p class="note">Solo se enlaza learn.microsoft.com. Todos los enlaces se comprobaron en noviembre de 2026. La documentación de Azure Databricks cambia con frecuencia: ante cualquier discrepancia con esta app, manda la fuente oficial.</p>
        ${D.RESOURCES.map(g => `<section class="card"><h2>${esc(g.group)}</h2><ul class="links">${g.items.map(i => `<li><a href="${esc(i.u)}" target="_blank" rel="noopener">${esc(i.t)}</a><span>${esc(i.n)}</span></li>`).join("")}</ul></section>`).join("")}`;
    }
    view.innerHTML = `
      <div class="page-head"><h1>Biblioteca de estudio</h1><p>Temario, tablas resumen, tácticas y fuentes primarias.</p></div>
      <div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" aria-selected="${libTab === id}" class="${libTab === id ? "on" : ""}" data-act="lib" data-t="${id}">${esc(l)}</button>`).join("")}</div>
      ${body}`;
  }

  /* ───────── Enrutado ───────── */
  const modHooks = { refresh: () => { renderHud(); renderNav(currentRoute()); }, toast };
  const currentRoute = () => (location.hash.replace(/^#\//, "") || "panel");
  function route() {
    const r = currentRoute();
    session = null;
    if (D.Game) D.Game.stop();
    renderHud(); renderNav(r);
    ({ panel: viewPanel, ruta: viewRoute, drill: () => viewLauncher("drill"), campana: () => viewLauncher("campaign"), audit: () => viewLauncher("audit"),
       acciones: () => D.Actions.mount(view, modHooks), juego: () => D.Game.mount(view, modHooks),
       examen: viewExam, deuda: viewDebt, biblioteca: viewLibrary }[r] || viewPanel)();
    window.scrollTo(0, 0);
  }

  /* ───────── Eventos ───────── */
  document.addEventListener("click", e => {
    const link = e.target.closest('a[href^="#/"]');
    if (link && link.getAttribute("href") === (location.hash || "#/panel")) { route(); return; }   // misma ruta: no hay hashchange
    const el = e.target.closest("[data-act]");
    if (!el || el.tagName === "INPUT") return;
    const a = el.dataset.act;
    if (a === "start") startSession(el.dataset.mode, el.dataset.domain, el.dataset.limit);
    else if (a === "pick" && session && !session.cur.fx) { session.cur.pick = +el.dataset.oi; renderSession(); }
    else if (a === "confirm") confirmAnswer();
    else if (a === "next") nextQuestion();
    else if (a === "exam-start") examStart(+el.dataset.n || 50);
    else if (a === "exam-pick") { exam.items[exam.idx].pick = +el.dataset.oi; renderExam(); }
    else if (a === "exam-prev") { exam.idx--; renderExam(); window.scrollTo(0, 0); }
    else if (a === "exam-next") { exam.idx++; renderExam(); window.scrollTo(0, 0); }
    else if (a === "exam-go") { exam.idx = +el.dataset.i; renderExam(); window.scrollTo(0, 0); }
    else if (a === "exam-finish") examFinish(false);
    else if (a === "exam-reset") { exam = null; viewExam(); window.scrollTo(0, 0); }
    else if (a === "lib") { libTab = el.dataset.t; viewLibrary(); }
    else if (a === "cheat") { cheatFilter = el.dataset.d; viewLibrary(); }
    else if (a === "export") {
      const url = URL.createObjectURL(new Blob([E.exportState()], { type: "application/json" }));
      const link = Object.assign(document.createElement("a"), { href: url, download: "dp750-progreso.json" });
      link.click(); URL.revokeObjectURL(url);
    }
    else if (a === "reset" && confirm("Se borrará todo el progreso guardado en este navegador. ¿Continuar?")) { E.reset(); exam = null; route(); toast("Progreso reiniciado."); }
  });
  document.addEventListener("change", e => {
    const a = e.target.dataset && e.target.dataset.act;
    if (a === "doubt" && session) session.cur.doubt = e.target.checked;
    else if (a === "exam-flag" && exam) { exam.items[exam.idx].flag = e.target.checked; renderExam(); }
    else if (a === "import" && e.target.files[0]) {
      e.target.files[0].text().then(t => { E.importState(t); route(); toast("Progreso importado."); })
        .catch(() => toast("No se pudo importar: archivo no válido."));
    }
  });
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    const idx = "1234".includes(k) && k.length === 1 ? +k - 1 : "abcd".indexOf(k);
    if (session) {
      const c = session.cur;
      if (!c.fx && idx >= 0 && idx < c.order.length) { c.pick = c.order[idx]; renderSession(); }
      else if (k === "enter" && e.target.tagName !== "BUTTON" && e.target.tagName !== "A") { e.preventDefault(); c.fx ? nextQuestion() : confirmAnswer(); }
    } else if (exam && !exam.result && currentRoute() === "examen") {
      const it = exam.items[exam.idx];
      if (idx >= 0 && idx < it.order.length) { it.pick = it.order[idx]; renderExam(); }
      else if (k === "arrowright" && exam.idx < exam.items.length - 1) { exam.idx++; renderExam(); }
      else if (k === "arrowleft" && exam.idx > 0) { exam.idx--; renderExam(); }
    }
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("beforeunload", e => { if (exam && !exam.result) { e.preventDefault(); e.returnValue = ""; } });

  route();
})();
