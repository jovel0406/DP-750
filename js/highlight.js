/* Resaltado sintáctico mínimo y sin dependencias para SQL, Python, YAML y JSON. */
(function () {
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const words = s => new Set(s.split(/\s+/));
  const KW = {
    sql: words("select from where and or not in is null as join inner left right full outer cross on group by order having limit union intersect except all distinct create replace table view function catalog schema volume share recipient connection foreign external location storage credential streaming materialized refresh flow auto cdc into keys sequence stored scd type apply delete when then else end case merge using matched insert update set values alter column mask row filter drop add grant revoke to with options comment if exists return returns use show grants describe extended history optimize vacuum retain hours dry run zorder cluster partitioned partition over qualify constraint expect violation fail tblproperties timestamp of stream copy undrop desc asc interval source"),
    python: words("import from as def return if else elif for in while with lambda True False None and or not class try except finally raise pass"),
    yaml: words("true false null"),
    json: words("true false null")
  };
  const TYPES = words("string bigint int decimal date boolean double float long timestamp_ntz binary");
  const FUNCS = words("current_user is_account_group_member is_member concat right left row_number secret current_timestamp count sum avg min max coalesce table_changes rand broadcast");

  const RX = {
    sql: /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g,
    python: /(#[^\n]*)|((?:f|r|b)?"(?:[^"\\\n]|\\.)*"|(?:f|r|b)?'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g,
    yaml: /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_.-]*)/g,
    json: /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|(-?\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g
  };

  function highlight(code, lang) {
    const rx = RX[lang];
    if (!rx) return esc(code);
    rx.lastIndex = 0;
    let out = "", last = 0, m;
    while ((m = rx.exec(code))) {
      out += esc(code.slice(last, m.index));
      const rest = code.slice(m.index + m[0].length);
      const span = (cls, txt) => `<span class="tk-${cls}">${esc(txt)}</span>`;
      if (m[1]) out += span("com", m[0]);
      else if (m[2]) {
        const isKey = (lang === "json" || lang === "yaml") && /^\s*:/.test(rest);
        out += span(isKey ? "key" : "str", m[0]);
      }
      else if (m[3]) out += span("num", m[0]);
      else {
        const w = m[0], lw = w.toLowerCase();
        if ((lang === "yaml") && /^\s*:(\s|$)/.test(rest)) out += span("key", w);
        else if (lang === "sql" && KW.sql.has(lw)) out += span("kw", w);
        else if (lang === "sql" && TYPES.has(lw)) out += span("type", w);
        else if (lang === "sql" && FUNCS.has(lw) && /^\s*\(/.test(rest)) out += span("fn", w);
        else if (lang !== "sql" && KW[lang].has(w)) out += span("kw", w);
        else if (lang === "python" && /^\s*\(/.test(rest)) out += span("fn", w);
        else out += esc(w);
      }
      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last));
  }

  /* Texto con `código` y **énfasis** → HTML seguro. */
  function rich(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  const LABEL = { sql: "Databricks SQL", python: "PySpark", yaml: "YAML", json: "JSON" };
  function block(code, title) {
    const lines = code.text.split("\n").length;
    const gutter = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
    return `<figure class="code"><figcaption><span>${esc(title || "Código")}</span><span class="lang">${LABEL[code.lang] || code.lang}</span></figcaption>` +
      `<div class="code-body"><pre class="gutter" aria-hidden="true">${gutter}</pre><pre class="src"><code>${highlight(code.text, code.lang)}</code></pre></div></figure>`;
  }

  window.DP750.HL = { esc, rich, highlight, block };
})();
