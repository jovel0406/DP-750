/* Acciones de Ingeniero: clic en la línea defectuosa y rellenar huecos arrastrando palabras clave. */
(function () {
  const D = window.DP750, E = D.Engine, { esc, rich, highlight, block } = D.HL;
  const EX = D.EXERCISES;
  const SK = Object.fromEntries(E.SKILLS.map(s => [s.id, s]));
  const LANG = { sql: "Databricks SQL", python: "PySpark", yaml: "YAML", json: "JSON", bash: "CLI" };
  const TYPE = { line: "Encuentra el bug", fill: "Completa el código" };
  let root, hooks, filter = "all", cur = null, drag = null;

  const status = id => { const r = E.state.ex[id]; return !r ? "new" : r.solved ? (r.hints ? "hint" : "ok") : "seen"; };
  const STATUS = { new: "Pendiente", ok: "Resuelto sin ayuda", hint: "Resuelto con pistas", seen: "Respuesta vista: repítelo" };

  function list() {
    cur = null;
    const items = EX.filter(x => filter === "all" || x.type === filter || "d" + x.skill[0] === filter);
    const solved = EX.filter(x => (E.state.ex[x.id] || {}).solved).length;
    root.innerHTML = `
      <div class="page-head"><h1>Acciones de Ingeniero</h1>
        <p>Trabaja sobre código real: haz clic en la línea que contiene el defecto o arrastra las palabras clave a su hueco. Si te atascas, pide una pista; si no lo sabes, mira la respuesta y vuelve a intentarlo más tarde.</p></div>
      <section class="card">
        <div class="row between"><h2>Ejercicios · ${solved}/${EX.length} resueltos</h2>
          <button class="btn primary" data-x="next">${solved < EX.length ? "Siguiente ejercicio pendiente" : "Repetir desde el principio"}</button></div>
        <div class="filters">${[["all", "Todos"], ["line", "Encuentra el bug"], ["fill", "Completa el código"], ...D.DOMAINS.map(d => [d.id, d.short])]
          .map(([k, l]) => `<button class="${filter === k ? "on" : ""}" data-x="filter" data-k="${k}">${esc(l)}</button>`).join("")}</div>
        <div class="xgrid">${items.map(x => { const s = status(x.id), d = SK[x.skill].domain;
          return `<button class="xcard st-${s}" data-x="open" data-id="${x.id}" style="--c:${d.color}">
            <span class="xtype">${TYPE[x.type]} · ${LANG[x.lang]}</span><strong>${esc(x.title)}</strong>
            <span class="xmeta">Habilidad ${x.skill} · ${esc(d.short)}</span><span class="xst">${STATUS[s]}</span></button>`; }).join("")}</div>
      </section>`;
  }

  function open(id) {
    const x = EX.find(e => e.id === id);
    cur = { x, hints: 0, tries: 0, done: false, revealed: false, wrong: {}, slots: x.type === "fill" ? x.answers.map(() => null) : null, sel: null, checked: null, msg: "" };
    render(); window.scrollTo(0, 0);
  }
  function nextPending() {
    const order = EX.filter(x => !(E.state.ex[x.id] || {}).solved);
    const pool = order.length ? order : EX;
    const i = cur ? pool.findIndex(x => x.id === cur.x.id) : -1;
    open(pool[(i + 1) % pool.length].id);
  }

  function codeLine() {
    const { x } = cur;
    return `<figure class="code xcode"><figcaption><span>Haz clic en la línea con el defecto</span><span class="lang">${LANG[x.lang]}</span></figcaption>
      <div class="xlines" role="listbox" aria-label="Líneas de código">${x.code.split("\n").map((ln, i) => {
        const cls = cur.done && x.bug.includes(i) ? "hit" : cur.wrong[i] ? "miss" : "";
        const blank = !ln.trim();
        return `<button class="xline ${cls}" role="option" data-x="line" data-i="${i}" ${cur.done || blank ? "disabled" : ""} aria-label="Línea ${i + 1}">
          <span class="ln">${i + 1}</span><code>${highlight(ln, x.lang) || " "}</code></button>`; }).join("")}</div></figure>`;
  }
  function codeFill() {
    const { x } = cur;
    let html = highlight(x.code.replace(/\[\[(\d+)\]\]/g, "XBLANKX$1X"), x.lang);
    html = html.replace(/XBLANKX(\d+)X/g, (_, n) => {
      const v = cur.slots[+n], st = cur.checked ? (cur.checked[+n] ? "good" : "bad") : "";
      return `<span class="blank ${v ? "full" : ""} ${st}" data-x="slot" data-n="${n}" tabindex="0" role="button" aria-label="Hueco ${+n + 1}${v ? ": " + esc(v) : ", vacío"}">${v ? esc(v) : "&nbsp;"}</span>`;
    });
    return `<figure class="code xcode"><figcaption><span>Arrastra cada palabra clave a su hueco (o tócala y luego toca el hueco)</span><span class="lang">${LANG[x.lang]}</span></figcaption>
      <div class="code-body"><pre class="src"><code>${html}</code></pre></div></figure>
      <div class="bank" aria-label="Palabras clave">${x.bank.map(t => `<button class="tok ${cur.sel === t ? "sel" : ""}" draggable="${!cur.done}" data-x="tok" data-t="${esc(t)}" ${cur.done ? "disabled" : ""}>${esc(t)}</button>`).join("")}</div>`;
  }

  function render() {
    const { x } = cur, d = SK[x.skill].domain;
    const fixed = x.type === "fill" ? x.code.replace(/\[\[(\d+)\]\]/g, (_, n) => x.answers[+n]) : x.fix;
    root.innerHTML = `
      <div class="q-head"><div class="crumbs"><a class="mode" href="#/acciones">← Acciones de Ingeniero</a>
        <span class="chip" style="--c:${d.color}">${esc(d.short)} · ${d.min}–${d.max}%</span><span class="chip">Habilidad ${x.skill}</span><span class="chip">${TYPE[x.type]}</span></div></div>
      <article class="card q">
        <h1>${esc(x.title)}</h1>
        <p class="ctx">${rich(x.brief)}</p>
        ${x.type === "line" ? codeLine() : codeFill()}
        ${cur.msg ? `<p class="xmsg ${cur.msgType || ""}" role="status">${rich(cur.msg)}</p>` : ""}
        ${cur.hints ? `<ol class="xhints">${x.hints.slice(0, cur.hints).map(h => `<li>${rich(h)}</li>`).join("")}</ol>` : ""}
        ${cur.done ? "" : `<div class="row between">
          <div class="row"><button class="btn" data-x="hint" ${cur.hints >= x.hints.length ? "disabled" : ""}>Pista (${cur.hints}/${x.hints.length})</button>
            <button class="btn" data-x="reveal">No lo sé: ver la respuesta</button></div>
          ${x.type === "fill" ? `<div class="row"><button class="btn" data-x="clear">Vaciar huecos</button><button class="btn primary" data-x="check" ${cur.slots.some(s => !s) ? "disabled" : ""}>Comprobar</button></div>` : ""}</div>`}
      </article>
      ${cur.done ? `
        <div class="verdict ${cur.revealed ? "bad" : "ok"}" role="status"><div><strong>${cur.revealed ? "Respuesta mostrada" : "Resuelto"}</strong>
          <span>${cur.revealed ? "No cuenta como resuelto: vuelve a intentarlo cuando repases." : cur.hints ? "Resuelto con " + cur.hints + " pista" + (cur.hints > 1 ? "s" : "") + "." : "Resuelto sin ayuda."}</span></div>
          <div class="impact"><span class="${cur.xp ? "ok" : "bad"}">+${cur.xp || 0} XP</span></div></div>
        <div class="card fb">
          <section class="layer"><h3><span>1</span>Explicación</h3><p>${rich(x.explain)}</p></section>
          <section class="layer"><h3><span>2</span>Corrección</h3>${block({ lang: x.lang, text: fixed }, "Código corregido")}</section>
          <section class="layer heur"><h3><span>3</span>Heurística de examen</h3><p>${rich(x.heuristic)}</p></section>
          <p class="refs">Documentación oficial: <a href="${D.DOC + x.ref[1]}" target="_blank" rel="noopener">${esc(x.ref[0])}</a></p>
        </div>
        <div class="row end">${cur.revealed ? '<button class="btn" data-x="retry">Reintentar ahora</button>' : ""}<button class="btn primary" data-x="next">Siguiente ejercicio</button></div>` : ""}`;
  }

  function finish(solved) {
    cur.done = true; cur.revealed = !solved; cur.checked = cur.slots ? cur.slots.map(() => true) : null;
    if (!solved && cur.slots) cur.slots = cur.x.answers.slice();
    cur.xp = E.exerciseDone(cur.x.id, { solved, hints: cur.hints, tries: cur.tries });
    cur.msg = ""; hooks.refresh(); render();
    const v = root.querySelector(".verdict"); if (v) v.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function place(n, t) {
    if (cur.done) return;
    cur.slots[n] = t; cur.sel = null; cur.checked = null; cur.msg = ""; render();
  }
  function check() {
    const { x } = cur; cur.tries++;
    cur.checked = cur.slots.map((s, i) => s === x.answers[i]);
    if (cur.checked.every(Boolean)) return finish(true);
    const bad = cur.checked.filter(c => !c).length;
    cur.msg = `${bad} hueco${bad > 1 ? "s" : ""} incorrecto${bad > 1 ? "s" : ""} (en rojo). Corrígelo${bad > 1 ? "s" : ""} y vuelve a comprobar, o pide una pista.`; cur.msgType = "bad";
    render();
  }

  function onClick(e) {
    const el = e.target.closest("[data-x]"); if (!el || !root.contains(el)) return;
    const a = el.dataset.x;
    if (a === "filter") { filter = el.dataset.k; list(); }
    else if (a === "open") open(el.dataset.id);
    else if (a === "next") nextPending();
    else if (a === "retry") open(cur.x.id);
    else if (a === "hint") { cur.hints = Math.min(cur.x.hints.length, cur.hints + 1); render(); }
    else if (a === "reveal") finish(false);
    else if (a === "clear") { cur.slots = cur.slots.map(() => null); cur.checked = null; cur.msg = ""; render(); }
    else if (a === "check") check();
    else if (a === "tok") { cur.sel = cur.sel === el.dataset.t ? null : el.dataset.t; render(); }
    else if (a === "slot") { const n = +el.dataset.n; if (cur.sel) place(n, cur.sel); else if (cur.slots[n] && !cur.done) { cur.slots[n] = null; cur.checked = null; render(); } }
    else if (a === "line") {
      const i = +el.dataset.i; cur.tries++;
      if (cur.x.bug.includes(i)) return finish(true);
      cur.wrong[i] = true;
      cur.msg = (cur.x.notes && cur.x.notes[i] ? cur.x.notes[i] : "Esa línea es correcta.") + " Sigue buscando o pide una pista."; cur.msgType = "bad";
      render();
    }
  }
  function onKey(e) {
    if (!cur || cur.done) return;
    const s = e.target.closest && e.target.closest(".blank");
    if (s && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); s.click(); }
  }
  function onDragStart(e) { const t = e.target.closest && e.target.closest(".tok"); if (t) { drag = t.dataset.t; e.dataTransfer.setData("text/plain", drag); e.dataTransfer.effectAllowed = "copy"; } }
  function onDragOver(e) { const s = e.target.closest && e.target.closest(".blank"); if (s && drag) { e.preventDefault(); s.classList.add("over"); } }
  function onDragLeave(e) { const s = e.target.closest && e.target.closest(".blank"); if (s) s.classList.remove("over"); }
  function onDrop(e) { const s = e.target.closest && e.target.closest(".blank"); if (s && drag) { e.preventDefault(); const t = drag; drag = null; place(+s.dataset.n, t); } }

  let bound = false;
  D.Actions = {
    mount(view, h) {
      root = view; hooks = h;
      if (!bound) {
        bound = true;
        document.addEventListener("click", onClick); document.addEventListener("keydown", onKey);
        document.addEventListener("dragstart", onDragStart); document.addEventListener("dragover", onDragOver);
        document.addEventListener("dragleave", onDragLeave); document.addEventListener("drop", onDrop);
      }
      list();
    }
  };
})();
