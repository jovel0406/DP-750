/* Incident Run: juego en pixel art. Recorres cuatro salas (una por dominio del examen) resolviendo
   incidentes; cada incidente es una pregunta del banco y su resultado alimenta el mismo progreso,
   dominio por área y deuda técnica que el resto de la app. */
(function () {
  const D = window.DP750, E = D.Engine, { esc, rich } = D.HL;
  const T = 16, COLS = 20, ROWS = 11, W = COLS * T, H = ROWS * T;
  const MAX_HP = 5, SLA_SECONDS = 40, HINT_COST = 3, COFFEE_COST = 5;

  /* # muro · R rack · T terminal · C máquina de café · D puerta · B incidente · X jefe · o DBU · P inicio */
  const ZONES = [
    { dom: "d1", name: "Sala de Cómputo", boss: "El Clúster Insomne", floor: ["#0d1a2b", "#0f1e31"],
      map: ["####################", "#P...o....R....o...#", "#.RR......R..B.....#", "#.RR..B...R........#", "#.........o....RR..#", "#....TT........RR.XD", "#.o..TT...B........#", "#.........R....o...#", "#.B...C...R...B....#", "#.....o...R........#", "####################"] },
    { dom: "d2", name: "Bóveda de Unity Catalog", boss: "El Permiso Fantasma", floor: ["#161331", "#1a1638"],
      map: ["####################", "#P..R....o....R....#", "#...R..B......R.B..#", "#...R.........R....#", "#.o.....TT.....o...#", "#.......TT........XD", "#...R.........R....#", "#.B.R....o....R.B..#", "#...R..C......R....#", "#o.......B.......o.#", "####################"] },
    { dom: "d3", name: "Lakehouse: Bronze · Silver · Gold", boss: "El Archivo Pequeño Infinito", floor: ["#0c2019", "#0e251d"],
      map: ["####################", "#P.....R.....R...o.#", "#..B...R..o..R.....#", "#......R.....R..B..#", "#.o................#", "#....TT....TT.....XD", "#.......B..........#", "#......R.....R..o..#", "#..B...R..C..R.....#", "#.o....R.....R..B..#", "####################"] },
    { dom: "d4", name: "Centro de Operaciones", boss: "El Skew Golem", floor: ["#231b0b", "#281f0d"],
      map: ["####################", "#P..o......o......o#", "#.RRRR..B....RRRR..#", "#..........B.......#", "#.o...TT...........#", "#.....TT....B.....XD", "#..................#", "#.RRRR.......RRRR..#", "#...B...C.......B..#", "#o.........o.......#", "####################"] }
  ];

  const SPR = {
    hero: [["...hhhh...", "..hhhhhh..", "..hsssss..", "..sesses..", "..ssssss..", ".bbbbbbbb.", "sbbbbbbbbs", "sbbwwbbbbs", ".bbbbbbbb.", "..pp..pp..", "..pp..pp..", "..kk..kk.."],
           ["...hhhh...", "..hhhhhh..", "..hsssss..", "..sesses..", "..ssssss..", ".bbbbbbbb.", "sbbbbbbbbs", "sbbwwbbbbs", ".bbbbbbbb.", "..pp..pp..", ".pp....pp.", ".kk....kk."]],
    bug: [["..a......a..", "...a....a...", "..gggggggg..", ".gggggggggg.", "ggwkggggwkgg", "gggggggggggg", "gggmmmmmmggg", ".gggggggggg.", "..l..ll..l..", ".l...ll...l."],
          ["...a....a...", "...a....a...", "..gggggggg..", ".gggggggggg.", "ggwkggggwkgg", "gggggggggggg", "gggmmmmmmggg", ".gggggggggg.", ".l...ll...l.", "..l..ll..l.."]],
    coin: [".yyyy.", "yyYYyy", "yYyyYy", "yYyyYy", "yyYYyy", ".yyyy."],
    heart: [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."]
  };
  const PAL = { h: "#22d3ee", s: "#f2c9a0", e: "#0b1220", b: "#1f6f80", w: "#e6edf7", p: "#334155", k: "#0f172a",
    a: "#fca5a5", g: "#ef4444", m: "#7f1d1d", l: "#b91c1c", y: "#f59e0b", Y: "#fde68a", r: "#f87171" };

  let root, hooks, cv, cx, raf = 0, last = 0, keys = {}, G = null, bound = false;

  function sprite(rows, x, y, scale, pal, flip) {
    const s = scale || 1, w = rows[0].length;
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < w; i++) {
      const c = rows[j][flip ? w - 1 - i : i]; if (c === ".") continue;
      cx.fillStyle = (pal && pal[c]) || PAL[c]; cx.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s);
    }
  }
  const tile = (c, r) => (r < 0 || r >= ROWS || c < 0 || c >= COLS) ? "#" : G.map[r][c];
  const solid = (c, r) => { const t = tile(c, r); return t === "#" || t === "R" || t === "T" || t === "C" || (t === "D" && !G.open); };
  function blocked(x, y, w, h) {
    const c0 = Math.floor(x / T), c1 = Math.floor((x + w - 1) / T), r0 = Math.floor(y / T), r1 = Math.floor((y + h - 1) / T);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (solid(c, r)) return true;
    return false;
  }

  function loadZone(i) {
    const z = ZONES[i], dom = D.DOMAINS.find(d => d.id === z.dom);
    G.zone = i; G.z = z; G.dom = dom; G.open = false; G.bugs = []; G.coins = []; G.parts = []; G.t = 0;
    G.map = z.map.map(row => row.split(""));
    G.pool = E.queue("drill", z.dom); G.bossPool = E.queue("campaign", z.dom).concat(E.queue("audit", z.dom));
    G.zstat = { ok: 0, bad: 0 };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = G.map[r][c];
      if (t === "P") { G.p = { x: c * T + 3, y: r * T + 2, w: 10, h: 12, face: 1, step: 0, inv: 0 }; G.map[r][c] = "."; }
      else if (t === "B") { G.bugs.push({ x: c * T + 2, y: r * T + 3, vx: 0, vy: 0, turn: 0, cool: 0, boss: false, hp: 1 }); G.map[r][c] = "."; }
      else if (t === "X") { G.bugs.push({ x: c * T - 6, y: r * T - 4, vx: 0, vy: 0, turn: 0, cool: 0, boss: true, hp: 2 }); G.map[r][c] = "."; }
      else if (t === "o") { G.coins.push({ x: c * T + 5, y: r * T + 5 }); G.map[r][c] = "."; }
    }
    banner(`Zona ${i + 1}: ${z.name}`);
    hud();
  }
  const banner = txt => { G.banner = txt; G.bannerT = 2.6; };
  const burst = (x, y, col, n) => { for (let i = 0; i < (n || 14); i++) G.parts.push({ x, y, vx: (Math.random() - .5) * 90, vy: (Math.random() - .8) * 90, life: .5 + Math.random() * .4, col }); };

  /* ───────── bucle ───────── */
  function update(dt) {
    G.t += dt; if (G.bannerT > 0) G.bannerT -= dt;
    const p = G.p; if (p.inv > 0) p.inv -= dt;
    let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    if (dx && dy) { dx *= .707; dy *= .707; }
    const sp = 72 * dt;
    if (dx) { if (!blocked(p.x + dx * sp, p.y, p.w, p.h)) p.x += dx * sp; p.face = dx > 0 ? 1 : -1; }
    if (dy && !blocked(p.x, p.y + dy * sp, p.w, p.h)) p.y += dy * sp;
    if (dx || dy) p.step += dt * 9;

    G.coins = G.coins.filter(c => { if (Math.abs(c.x - (p.x + 2)) < 9 && Math.abs(c.y - (p.y + 3)) < 10) { G.dbu++; burst(c.x + 3, c.y + 3, "#fde68a", 6); return false; } return true; });

    G.bugs.forEach(b => {
      if (b.cool > 0) b.cool -= dt;
      if (!b.boss) {
        b.turn -= dt;
        if (b.turn <= 0) { const a = Math.random() * 6.28; b.vx = Math.cos(a) * 16; b.vy = Math.sin(a) * 16; b.turn = .8 + Math.random() * 1.4; }
        if (!blocked(b.x + b.vx * dt, b.y, 12, 10)) b.x += b.vx * dt; else b.vx *= -1;
        if (!blocked(b.x, b.y + b.vy * dt, 12, 10)) b.y += b.vy * dt; else b.vy *= -1;
      }
      const s = b.boss ? 24 : 12, cxm = b.x + s / 2, cym = b.y + s / 2;
      if (b.cool <= 0 && Math.abs(cxm - (p.x + 5)) < s / 2 + 5 && Math.abs(cym - (p.y + 6)) < s / 2 + 6) encounter(b);
    });
    G.parts = G.parts.filter(q => { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 160 * dt; return q.life > 0; });

    const pc = Math.floor((p.x + 5) / T), pr = Math.floor((p.y + 6) / T);
    G.nearCoffee = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => tile(pc + a, pr + b) === "C");
    if (G.open && tile(pc, pr) === "D") zoneDone();
    if (Math.floor(G.t * 4) !== G.hudTick) { G.hudTick = Math.floor(G.t * 4); hud(); }
  }

  function draw() {
    const z = G.z, col = G.dom.color;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = G.map[r][c], x = c * T, y = r * T;
      cx.fillStyle = z.floor[(r + c) % 2]; cx.fillRect(x, y, T, T);
      if (t === "#") { cx.fillStyle = "#1f2b42"; cx.fillRect(x, y, T, T); cx.fillStyle = "#2b3a58"; cx.fillRect(x, y, T, 3); cx.fillStyle = "#141d2e"; cx.fillRect(x, y + 13, T, 3); }
      else if (t === "R") { cx.fillStyle = "#0b1220"; cx.fillRect(x + 1, y, 14, 16); cx.fillStyle = "#1f2b42"; cx.fillRect(x + 2, y + 1, 12, 14);
        for (let k = 0; k < 4; k++) { cx.fillStyle = "#0b1220"; cx.fillRect(x + 3, y + 2 + k * 3.5, 10, 2);
          cx.fillStyle = ((Math.floor(G.t * 3) + k + c + r) % 3) ? col : "#34d399"; cx.fillRect(x + 11, y + 2 + k * 3.5, 2, 2); } }
      else if (t === "T") { cx.fillStyle = "#334155"; cx.fillRect(x, y + 6, 16, 9); cx.fillStyle = "#0b1220"; cx.fillRect(x + 3, y + 1, 10, 7);
        cx.fillStyle = col; cx.fillRect(x + 4, y + 2, 8, 5); cx.fillStyle = "#0b1220"; if (Math.floor(G.t * 2) % 2) cx.fillRect(x + 5, y + 3, 4, 1); cx.fillRect(x + 5, y + 5, 6, 1); }
      else if (t === "C") { cx.fillStyle = "#475569"; cx.fillRect(x + 2, y + 1, 12, 14); cx.fillStyle = "#0b1220"; cx.fillRect(x + 4, y + 3, 8, 4);
        cx.fillStyle = "#f59e0b"; cx.fillRect(x + 5, y + 4, 2, 2); cx.fillStyle = "#e6edf7"; cx.fillRect(x + 6, y + 9, 4, 4); cx.fillStyle = "#7c2d12"; cx.fillRect(x + 7, y + 10, 2, 2); }
      else if (t === "D") { cx.fillStyle = "#1f2b42"; cx.fillRect(x, y, T, T);
        cx.fillStyle = G.open ? "#34d399" : "#7f1d1d"; cx.fillRect(x + 2, y + 1, 12, 14);
        cx.fillStyle = G.open ? "#052e1b" : "#f87171"; cx.fillRect(x + 6, y + 6, 4, 4); }
    }
    G.coins.forEach(c => sprite(SPR.coin, c.x, c.y + Math.sin(G.t * 5 + c.x) * 1.2));
    G.bugs.forEach(b => {
      const f = SPR.bug[Math.floor(G.t * 6) % 2];
      if (b.boss) { const bob = Math.sin(G.t * 3) * 1.5;
        sprite(f, b.x, b.y + bob, 2, { g: "#a855f7", m: "#3b0764", l: "#7e22ce", a: "#f0abfc", w: "#fde68a", k: "#0b1220" });
        cx.fillStyle = "#fbbf24"; for (let k = 0; k < 3; k++) cx.fillRect(b.x + 5 + k * 6, b.y - 3 + bob, 2, 4); cx.fillRect(b.x + 5, b.y + 1 + bob, 14, 2);
        for (let k = 0; k < b.hp; k++) { cx.fillStyle = "#f87171"; cx.fillRect(b.x + 6 + k * 7, b.y + 24, 5, 2); } }
      else sprite(f, b.x, b.y, 1, b.cool > 0 ? { g: "#7f1d1d", m: "#450a0a", l: "#7f1d1d", a: "#7f1d1d", w: "#e6edf7", k: "#0b1220" } : null, b.vx < 0);
    });
    const p = G.p;
    if (!(p.inv > 0 && Math.floor(G.t * 12) % 2)) sprite(SPR.hero[Math.floor(p.step) % 2], p.x, p.y, 1, { h: G.dom.color }, p.face < 0);
    G.parts.forEach(q => { cx.fillStyle = q.col; cx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); });
    if (G.bannerT > 0) { cx.fillStyle = "rgba(7,11,20,.85)"; cx.fillRect(0, 76, W, 24); cx.fillStyle = G.dom.color; cx.fillRect(0, 76, W, 1); cx.fillRect(0, 99, W, 1);
      cx.fillStyle = "#e6edf7"; cx.font = "bold 10px monospace"; cx.textAlign = "center"; cx.fillText(G.banner, W / 2, 91); }
  }
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    if (!G || G.paused) return;
    update(dt); if (G && !G.paused) draw();
  }

  /* ───────── HUD ───────── */
  function hud() {
    const el = root.querySelector("#g-hud"); if (!el || !G) return;
    const left = G.bugs.filter(b => !b.boss).length, boss = G.bugs.find(b => b.boss);
    const goal = left ? `Incidentes abiertos: <b>${left}</b>` : boss ? `Derrota al jefe: <b>${esc(G.z.boss)}</b> (${boss.hp} golpe${boss.hp > 1 ? "s" : ""})` : `<b class="ok">Puerta abierta →</b> avanza a la derecha`;
    el.innerHTML = `<span class="g-zone" style="color:${G.dom.color}">Zona ${G.zone + 1}/4 · ${esc(G.z.name)}</span>
      <span class="g-hp" aria-label="Uptime ${G.hp} de ${MAX_HP}">${"♥".repeat(G.hp)}<i>${"♥".repeat(MAX_HP - G.hp)}</i></span>
      <span class="g-dbu">◆ ${G.dbu} DBU</span><span class="g-goal">${goal}</span>
      ${G.nearCoffee ? `<button class="btn g-coffee" data-g="coffee">Café: +1 ♥ por ${COFFEE_COST} DBU</button>` : ""}`;
  }

  /* ───────── encuentro con un incidente ───────── */
  function nextQ(boss) {
    let pool = boss ? G.bossPool : G.pool;
    if (!pool.length) { pool = boss ? E.queue("campaign", G.z.dom).concat(E.queue("audit", G.z.dom)) : E.queue("drill", G.z.dom); if (boss) G.bossPool = pool; else G.pool = pool; }
    return pool.shift();
  }
  function encounter(b) {
    const q = nextQ(b.boss);
    G.paused = true; keys = {};
    G.enc = { b, q, order: E.shuffle(q.options.map((_, i) => i)), hidden: [], pick: null, fx: null, t0: performance.now(), sla: true };
    renderEnc();
    clearInterval(G.slaTimer);
    G.slaTimer = setInterval(() => {
      if (!G || !G.enc || G.enc.fx) return clearInterval(G.slaTimer);
      const left = Math.max(0, SLA_SECONDS - (performance.now() - G.enc.t0) / 1000);
      const bar = root.querySelector("#g-sla i"); if (bar) bar.style.width = (left / SLA_SECONDS * 100) + "%";
      if (!left) { G.enc.sla = false; const l = root.querySelector("#g-sla-l"); if (l) l.textContent = "SLA vencido: sin bonificación, pero sin penalización. Tómate tu tiempo."; clearInterval(G.slaTimer); }
    }, 200);
  }
  function renderEnc() {
    const e = G.enc, q = e.q, L = ["A", "B", "C", "D"];
    const ov = root.querySelector("#g-over"); ov.hidden = false;
    const head = `<div class="g-inc"><span class="mode">${e.b.boss ? "Jefe · " + esc(G.z.boss) : "Incidente"}</span><span class="chip" style="--c:${G.dom.color}">Habilidad ${q.skill}</span></div><h2>${esc(q.title)}</h2>`;
    const body = `${q.context ? `<p class="ctx">${rich(q.context)}</p>` : ""}
      ${q.constraints ? `<ul class="g-cons">${q.constraints.map(c => `<li>${rich(c)}</li>`).join("")}</ul>` : ""}
      ${q.audit ? D.HL.block(q.audit, "Código bajo auditoría") : ""}<p class="ask">${rich(q.question)}</p>`;
    if (!e.fx) {
      ov.innerHTML = `<div class="g-card" role="dialog" aria-label="Incidente">${head}
        <div class="g-slabar"><div id="g-sla" class="bar"><i style="width:100%;background:var(--warn)"></i></div><small id="g-sla-l">Resuelve dentro del SLA para ganar +2 DBU extra.</small></div>
        ${body}
        <div class="opts">${e.order.map((oi, k) => e.hidden.includes(oi) ? `<div class="opt dim gone"><span class="let">${L[k]}</span><span class="txt">Descartada por la documentación</span></div>`
          : `<button class="opt" data-g="pick" data-oi="${oi}"><span class="let">${L[k]}</span><span class="txt">${rich(q.options[oi].t)}</span></button>`).join("")}</div>
        <div class="row between"><button class="btn" data-g="hint" ${G.dbu < HINT_COST || e.hidden.length ? "disabled" : ""}>Consultar la documentación (−${HINT_COST} DBU): descarta 2 opciones</button>
          <small class="hint">Teclas 1–4 o A–D</small></div></div>`;
    } else {
      const ok = e.fx.ok, right = q.options.find(o => o.ok), mine = q.options[e.pick];
      ov.innerHTML = `<div class="g-card" role="dialog" aria-label="Resultado">${head}
        <div class="verdict ${ok ? "ok" : "bad"}"><div><strong>${ok ? (e.b.boss ? "¡Golpe al jefe!" : "Incidente resuelto") : "Incidente sin resolver"}</strong>
          <span>${ok ? `+${e.gain} DBU${e.sla ? " (incluye bonificación de SLA)" : ""}` : "Pierdes 1 ♥ de uptime. El concepto pasa a tu deuda técnica."}</span></div></div>
        ${ok ? "" : `<div class="g-why bad"><b>Tu respuesta:</b> ${rich(mine.t)}<br><b>Falla porque:</b> ${rich(mine.why)}</div>`}
        <div class="g-why ok"><b>Respuesta correcta:</b> ${rich(right.t)}<br>${rich(right.why)}</div>
        <div class="layer heur"><h3>Heurística de examen</h3><p>${rich(q.heuristic)}</p></div>
        <details class="g-more"><summary>Ver fundamento técnico y código de referencia</summary><p>${rich(q.foundation)}</p>${D.HL.block(q.code, "Implementación correcta")}
          ${q.refs ? `<p class="refs">Documentación: ${q.refs.map(r => `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.t)}</a>`).join(" · ")}</p>` : ""}</details>
        <div class="row end"><button class="btn primary" data-g="cont">Continuar (Enter)</button></div></div>`;
    }
    ov.scrollTop = 0; const first = ov.querySelector("button"); if (first) first.focus({ preventScroll: true });
  }
  function pick(oi) {
    const e = G.enc; if (!e || e.fx || e.hidden.includes(oi)) return;
    e.pick = oi; e.fx = E.answer(e.q.id, oi, false); clearInterval(G.slaTimer);
    G.stat.n++;
    if (e.fx.ok) { G.stat.ok++; G.zstat.ok++; e.gain = (e.b.boss ? 8 : 5) + (e.sla ? 2 : 0); G.dbu += e.gain; }
    else { G.zstat.bad++; G.hp--; }
    hooks.refresh(); renderEnc();
  }
  function cont() {
    const e = G.enc; if (!e || !e.fx) return;
    const b = e.b, s = b.boss ? 24 : 12;
    root.querySelector("#g-over").hidden = true; G.enc = null;
    if (e.fx.ok) {
      b.hp--; burst(b.x + s / 2, b.y + s / 2, b.boss ? "#a855f7" : "#ef4444", b.boss ? 26 : 14);
      if (b.hp <= 0) G.bugs = G.bugs.filter(x => x !== b); else b.cool = 1.2;
      if (!G.bugs.length) { G.open = true; banner("Zona estabilizada: puerta abierta →"); }
      else if (!b.boss && b.hp <= 0 && !G.bugs.some(x => !x.boss)) banner("Solo queda el jefe");
    } else {
      b.cool = 3; G.p.inv = 1.5;
      const p = G.p, ax = Math.sign(p.x - b.x) || -1;   // empujar al jugador lejos del incidente
      for (let k = 0; k < 18 && !blocked(p.x + ax, p.y, p.w, p.h); k++) p.x += ax;
    }
    if (G.hp <= 0) return gameOver();
    G.paused = false; hud();
  }
  function hint() {
    const e = G.enc; if (!e || e.fx || e.hidden.length || G.dbu < HINT_COST) return;
    G.dbu -= HINT_COST;
    e.hidden = E.shuffle(e.q.options.map((o, i) => o.ok ? -1 : i).filter(i => i >= 0)).slice(0, 2);
    hud(); renderEnc();
  }
  function coffee() {
    if (!G.nearCoffee) return;
    if (G.hp >= MAX_HP) banner("Uptime al máximo"); else if (G.dbu < COFFEE_COST) banner(`Necesitas ${COFFEE_COST} DBU`);
    else { G.dbu -= COFFEE_COST; G.hp++; banner("+1 ♥ de uptime"); }
    hud();
  }

  /* ───────── pantallas ───────── */
  function panel(html) { G.paused = true; keys = {}; const ov = root.querySelector("#g-over"); ov.hidden = false; ov.innerHTML = `<div class="g-card">${html}</div>`; const b = ov.querySelector("button"); if (b) b.focus({ preventScroll: true }); }
  function zoneDone() {
    const z = G.zstat, tot = z.ok + z.bad, acc = tot ? Math.round(z.ok / tot * 100) : 0;
    G.results.push({ zone: G.zone, acc, ok: z.ok, bad: z.bad });
    E.gameSave(G.zone + 1, false);
    if (G.zone === ZONES.length - 1) return victory();
    panel(`<span class="mode">Zona ${G.zone + 1} completada</span><h2>${esc(G.z.name)}</h2>
      <div class="stats"><div><b class="${acc >= 70 ? "ok" : "warn"}">${acc}%</b><span>Precisión</span></div><div><b>${z.ok}</b><span>Resueltos</span></div><div><b class="${z.bad ? "bad" : "ok"}">${z.bad}</b><span>Fallados</span></div><div><b>${G.dbu}</b><span>DBU</span></div></div>
      <p>${z.bad ? `Los ${z.bad} conceptos fallados están en tu deuda técnica. Repásalos en la Ruta de aprendizaje (${esc(G.dom.name)}) antes del examen.` : "Zona limpia: ni un solo fallo en este dominio."}</p>
      <p class="hint">Siguiente: ${esc(ZONES[G.zone + 1].name)} · pesa ${D.DOMAINS[G.zone + 1].min}–${D.DOMAINS[G.zone + 1].max}% del examen.</p>
      <div class="row end"><button class="btn primary" data-g="nextzone">Entrar en la siguiente zona</button></div>`);
  }
  function victory() {
    const acc = G.stat.n ? Math.round(G.stat.ok / G.stat.n * 100) : 0;
    E.gameSave(ZONES.length, true);
    panel(`<span class="mode">Plataforma estabilizada</span><h2>Has completado Incident Run</h2>
      <div class="stats"><div><b class="${acc >= 80 ? "ok" : "warn"}">${acc}%</b><span>Precisión global</span></div><div><b>${G.stat.ok}/${G.stat.n}</b><span>Incidentes</span></div><div><b>${G.dbu}</b><span>DBU</span></div><div><b>${G.hp}</b><span>Uptime</span></div></div>
      <table class="tbl"><thead><tr><th>Zona</th><th>Dominio del examen</th><th>Precisión</th></tr></thead><tbody>${G.results.map(r => `<tr><td>${esc(ZONES[r.zone].name)}</td><td>${esc(D.DOMAINS[r.zone].name)} (${D.DOMAINS[r.zone].min}–${D.DOMAINS[r.zone].max}%)</td><td class="${r.acc >= 70 ? "ok" : "bad"}"><b>${r.acc}%</b></td></tr>`).join("")}</tbody></table>
      <p>${acc >= 85 ? "Precisión alta. Valida con el simulacro completo de 50 preguntas." : "Cada partida trae preguntas distintas y prioriza tu deuda técnica: vuelve a jugar o repasa los dominios por debajo del 70 %."}</p>
      <div class="row end"><a class="btn" href="#/deuda">Ver deuda técnica</a><a class="btn" href="#/examen">Simulador de examen</a><button class="btn primary" data-g="start" data-z="0">Jugar de nuevo</button></div>`);
  }
  function gameOver() {
    panel(`<span class="mode" style="color:var(--bad)">Caída de producción</span><h2>Te has quedado sin uptime</h2>
      <p>En esta zona fallaste ${G.zstat.bad} incidente${G.zstat.bad === 1 ? "" : "s"}. Están en tu deuda técnica, con su explicación completa.</p>
      <p class="hint">Consejo: recoge DBU, usa «Consultar la documentación» en las preguntas dudosas y recupera uptime en la máquina de café.</p>
      <div class="row end"><a class="btn" href="#/deuda">Repasar lo fallado</a><button class="btn primary" data-g="start" data-z="${G.zone}">Reintentar la zona</button></div>`);
  }
  function start(z) {
    G = { hp: 3, dbu: 0, stat: { n: 0, ok: 0 }, results: [], paused: false, hudTick: -1 };
    root.querySelector("#g-over").hidden = true;
    loadZone(z); last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function intro() {
    const best = (E.state.game || {}).best || 0;
    root.innerHTML = `
      <div class="page-head"><h1>Incident Run</h1><p>Un juego en pixel art para practicar el DP-750. Cada incidente es una pregunta del banco, y lo que aciertes o falles aquí cuenta para tu dominio por área y tu deuda técnica.</p></div>
      <section class="card g-wrap">
        <div id="g-hud" class="g-hud"></div>
        <div class="g-stage"><canvas id="g-cv" width="${W}" height="${H}" aria-label="Juego Incident Run"></canvas><div id="g-over" class="g-over"></div></div>
        <div class="g-pad" aria-label="Controles táctiles"><button data-dir="up" aria-label="Arriba">▲</button><button data-dir="left" aria-label="Izquierda">◀</button><button data-dir="down" aria-label="Abajo">▼</button><button data-dir="right" aria-label="Derecha">▶</button></div>
        <p class="hint">Muévete con las flechas o WASD. Toca un incidente para atenderlo. En las preguntas: 1–4 o A–D para responder, Enter para continuar.</p>
      </section>`;
    cv = root.querySelector("#g-cv"); cx = cv.getContext("2d"); cx.imageSmoothingEnabled = false;
    cx.fillStyle = "#070b14"; cx.fillRect(0, 0, W, H);
    const ov = root.querySelector("#g-over");
    ov.innerHTML = `<div class="g-card"><span class="mode">Misión</span><h2>Estabiliza la plataforma de datos</h2>
      <ul class="rules">
        <li><b>Cuatro zonas, cuatro dominios del examen.</b> En cada una, resuelve los incidentes (bichos rojos) y derrota al jefe (morado) para abrir la puerta.</li>
        <li><b>Cada incidente es una pregunta.</b> Si aciertas, ganas DBU; si fallas, pierdes 1 ♥ de uptime y verás por qué fallaste y cuál era la respuesta.</li>
        <li><b>Los jefes plantean casos largos</b> (escenarios y auditorías de código) y necesitan dos aciertos.</li>
        <li><b>DBU (◆):</b> recógelos por la sala. Gástalos en «Consultar la documentación» (descarta 2 opciones) o en café (+1 ♥).</li>
        <li><b>SLA:</b> responder a tiempo da DBU extra; pasarse no penaliza. Leer bien vale más que correr.</li>
      </ul>
      <div class="row end">${best > 0 ? ZONES.map((z, i) => i <= Math.min(best, ZONES.length - 1) && i > 0 ? `<button class="btn" data-g="start" data-z="${i}">Zona ${i + 1}</button>` : "").join("") : ""}
        <button class="btn primary" data-g="start" data-z="0">Empezar${best > 0 ? " desde la zona 1" : ""}</button></div></div>`;
  }

  /* ───────── entrada ───────── */
  const KEYMAP = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
  function onKey(e) {
    if (!root || !document.body.contains(cv) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase(), down = e.type === "keydown";
    if (G && G.enc) {
      if (!down) return;
      if (!G.enc.fx) { const i = "1234".includes(k) && k.length === 1 ? +k - 1 : "abcd".indexOf(k); if (i >= 0 && i < G.enc.order.length) { e.preventDefault(); pick(G.enc.order[i]); } }
      else if (k === "enter" && e.target.tagName !== "A" && e.target.tagName !== "SUMMARY") { e.preventDefault(); cont(); }
      return;
    }
    if (!G || G.paused) return;
    if (KEYMAP[k]) { keys[KEYMAP[k]] = down; if (k.startsWith("arrow")) e.preventDefault(); }
    else if (down && (k === "e" || k === " ")) { e.preventDefault(); coffee(); }
  }
  function onClick(e) {
    const el = e.target.closest("[data-g]"); if (!el || !root || !root.contains(el)) return;
    const a = el.dataset.g;
    if (a === "start") start(+el.dataset.z || 0);
    else if (a === "pick") pick(+el.dataset.oi);
    else if (a === "hint") hint();
    else if (a === "cont") cont();
    else if (a === "coffee") coffee();
    else if (a === "nextzone") { root.querySelector("#g-over").hidden = true; loadZone(G.zone + 1); G.paused = false; }
  }
  function onPad(e) {
    const b = e.target.closest && e.target.closest("[data-dir]"); if (!b) return;
    if (e.type === "pointerdown") { e.preventDefault(); keys[b.dataset.dir] = true; } else keys[b.dataset.dir] = false;
  }

  D.Game = {
    mount(view, h) {
      root = view; hooks = h; G = null; keys = {};
      if (!bound) {
        bound = true;
        document.addEventListener("keydown", onKey); document.addEventListener("keyup", onKey); document.addEventListener("click", onClick);
        ["pointerdown", "pointerup", "pointerout", "pointercancel"].forEach(t => document.addEventListener(t, onPad));
        window.addEventListener("blur", () => { keys = {}; });
      }
      intro();
    },
    _state: () => G,   // para pruebas automatizadas
    stop() { cancelAnimationFrame(raf); raf = 0; if (G) clearInterval(G.slaTimer); G = null; keys = {}; }
  };
})();
