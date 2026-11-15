/* Motor: estado persistente, economía de DBU/SLA, rangos, racha, deuda técnica y puntuación. */
(function () {
  const D = window.DP750;
  const KEY = "dp750-sim-v1";
  /* Habilidad oficial (1.1 … 4.4) de los escenarios y auditorías. */
  const SKILL_OF = {
    "c-d1-01": "1.1", "c-d1-02": "1.1", "c-d1-03": "1.2", "a-d1-01": "1.2", "a-d1-02": "1.1",
    "c-d2-01": "2.2", "c-d2-02": "2.1", "c-d2-03": "2.2", "a-d2-01": "2.1", "a-d2-02": "2.2",
    "c-d3-01": "3.2", "c-d3-02": "3.1", "c-d3-03": "3.1", "a-d3-01": "3.2", "a-d3-02": "3.4", "a-d3-03": "3.3",
    "c-d4-01": "4.3", "c-d4-02": "4.4", "c-d4-03": "4.4", "a-d4-01": "4.3", "a-d4-02": "4.4"
  };
  /* Las preguntas de concepto llegan en formato compacto (ver drills-d1.js). */
  const seq = {};
  const DRILLS = (D.DRILLS || []).map(r => {
    const [skill, objective, title, question, ok, wrong, foundation, heuristic, lang, text, ref] = r;
    seq[skill] = (seq[skill] || 0) + 1;
    return {
      id: "k-" + skill + "-" + String(seq[skill]).padStart(2, "0"), mode: "drill", domain: "d" + skill[0], skill,
      objective, title, question,
      options: [{ t: ok[0], ok: true, why: ok[1] }].concat(wrong.map(w => ({ t: w[0], ok: false, why: w[1], dbu: 60, sla: 8 }))),
      foundation, heuristic, code: { lang, text }, refs: [{ t: ref[0], u: D.DOC + ref[1] }]
    };
  });
  const BANK = [...D.SCENARIOS, ...D.AUDITS].map(q => Object.assign(q, { skill: SKILL_OF[q.id] })).concat(DRILLS);
  const BY_ID = Object.fromEntries(BANK.map(q => [q.id, q]));
  const SKILLS = D.DOMAINS.flatMap(d => d.groups.map(g => Object.assign({ domain: d }, g)));

  const CFG = {
    dbuStart: 1000, dbuCredit: 15, dbuAfterIncident: 600,
    slaRecover: 4, slaBreach: 70,
    xpNew: 40, xpRepeat: 10, xpDebtBonus: 20, xpWrong: 25, xpIncident: 100,
    debtInterest: 2,          // aciertos consecutivos necesarios para saldar un concepto fallado
    debtDoubt: 1,             // aciertos necesarios si se acertó «con dudas»
    examSecondsPerQuestion: 120, passScore: 700
  };

  const RANKS = [
    { xp: 0,   name: "Becario de Pipelines" },
    { xp: 300,  name: "Data Engineer Junior" },
    { xp: 900,  name: "Data Engineer" },
    { xp: 1800, name: "Senior Data Engineer" },
    { xp: 2900, name: "Staff Data Engineer" },
    { xp: 4000, name: "Principal Data Architect" }
  ];

  const fresh = () => ({
    v: 1, dbu: CFG.dbuStart, sla: 100, xp: 0, incidents: 0,
    streak: { count: 0, last: null, best: 0 },
    q: {}, debt: {}, exams: [], log: [], ex: {}, game: { best: 0, wins: 0 }
  });

  let S = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.v === 1) return Object.assign(fresh(), raw);
    } catch (e) { /* almacenamiento no disponible o corrupto */ }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin persistencia */ }
  }

  const dayKey = (d = new Date()) =>
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  function touchStreak() {
    const today = dayKey();
    if (S.streak.last === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak.count = S.streak.last === dayKey(y) ? S.streak.count + 1 : 1;
    S.streak.best = Math.max(S.streak.best || 0, S.streak.count);
    S.streak.last = today;
  }
  function streakAlive() {
    if (!S.streak.last) return 0;
    const y = new Date(); y.setDate(y.getDate() - 1);
    return (S.streak.last === dayKey() || S.streak.last === dayKey(y)) ? S.streak.count : 0;
  }

  function rank(xp = S.xp) {
    let i = 0;
    RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; });
    const next = RANKS[i + 1] || null;
    return { index: i, name: RANKS[i].name, next, floor: RANKS[i].xp,
      pct: next ? Math.round(((xp - RANKS[i].xp) / (next.xp - RANKS[i].xp)) * 100) : 100 };
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Registra una respuesta en los modos de entrenamiento. Devuelve el impacto para mostrarlo. */
  function answer(id, optionIndex, doubt) {
    const q = BY_ID[id];
    const opt = q.options[optionIndex];
    const rec = S.q[id] || (S.q[id] = { attempts: 0, correct: 0, last: null });
    const before = rank();
    const wasCorrectBefore = rec.last === true;
    const hadDebt = S.debt[id] > 0;
    const fx = { ok: opt.ok, dbu: 0, sla: 0, xp: 0, notes: [], incident: false };

    touchStreak();
    rec.attempts++;

    if (opt.ok) {
      rec.correct++; rec.last = true;
      const breached = S.sla < CFG.slaBreach;
      let gain = wasCorrectBefore ? CFG.xpRepeat : CFG.xpNew;
      if (hadDebt) {
        S.debt[id]--;
        if (S.debt[id] <= 0) { delete S.debt[id]; gain += CFG.xpDebtBonus; fx.notes.push("Deuda técnica saldada: concepto consolidado."); }
        else fx.notes.push("Abono a la deuda técnica: falta " + S.debt[id] + " acierto más para saldarla.");
      }
      if (doubt && !S.debt[id]) {
        S.debt[id] = CFG.debtDoubt;
        fx.notes.push("Acertaste con dudas: el concepto se re-encola una vez para confirmarlo.");
      }
      if (breached) { gain = Math.ceil(gain / 2); fx.notes.push("SLA en incumplimiento: la XP ganada se reduce a la mitad hasta recuperarlo."); }
      fx.xp = gain; fx.dbu = CFG.dbuCredit; fx.sla = Math.min(CFG.slaRecover, 100 - S.sla);
    } else {
      rec.last = false;
      fx.dbu = -(opt.dbu || 80); fx.sla = -(opt.sla || 10); fx.xp = -Math.min(CFG.xpWrong, S.xp);
      S.debt[id] = CFG.debtInterest;
      fx.notes.push("Concepto añadido a la deuda técnica: reaparecerá hasta lograr " + CFG.debtInterest + " aciertos seguidos.");
    }

    S.dbu = Math.min(CFG.dbuStart, S.dbu + fx.dbu); S.xp = Math.max(0, S.xp + fx.xp);
    S.sla = Math.max(0, Math.min(100, S.sla + fx.sla));

    if (S.dbu <= 0) {
      fx.incident = true; S.incidents++;
      const loss = Math.min(CFG.xpIncident, S.xp);
      S.xp -= loss; S.dbu = CFG.dbuAfterIncident;
      fx.notes.push("INCIDENTE DE FACTURACIÓN: presupuesto agotado. Finanzas aprueba " + CFG.dbuAfterIncident + " DBU de emergencia a cambio de " + loss + " XP.");
    }

    const after = rank();
    if (after.index > before.index) fx.notes.push("Ascenso de rango: " + after.name + ".");
    if (after.index < before.index) fx.notes.push("Degradación de rango: " + after.name + ".");

    S.log.unshift({ id, ok: opt.ok, at: Date.now() });
    S.log = S.log.slice(0, 30);
    save();
    return fx;
  }

  /* Cola de entrenamiento: primero deuda técnica, luego no vistas, luego falladas, luego el resto. */
  const tier = q => S.debt[q.id] ? 0 : !S.q[q.id] ? 1 : S.q[q.id].last === false ? 2 : 3;
  const prioritize = pool => shuffle(pool).sort((a, b) => tier(a) - tier(b));
  function queue(mode, domain, limit) {
    const list = prioritize(BANK.filter(q => q.mode === mode && (!domain || q.domain === domain)));
    return limit ? list.slice(0, limit) : list;
  }
  /* Entrenamiento por habilidad: de lo conceptual a lo aplicado. */
  function skillQueue(skill) {
    const rank = { drill: 0, campaign: 1, audit: 2 };
    return prioritize(BANK.filter(q => q.skill === skill)).sort((a, b) => (tier(a) - tier(b)) || (rank[a.mode] - rank[b.mode]));
  }
  function debtQueue() {
    return shuffle(Object.keys(S.debt).map(id => BY_ID[id]).filter(Boolean));
  }
  function skillMastery() {
    return SKILLS.map(sk => {
      const qs = BANK.filter(q => q.skill === sk.id);
      const ok = qs.filter(q => S.q[q.id] && S.q[q.id].last === true).length;
      return { skill: sk, total: qs.length, ok, seen: qs.filter(q => S.q[q.id]).length,
        debt: qs.filter(q => S.debt[q.id]).length, pct: qs.length ? Math.round((ok / qs.length) * 100) : 0 };
    });
  }

  /* Dominio por dominio: % de preguntas cuyo último intento fue correcto. */
  function mastery() {
    return D.DOMAINS.map(d => {
      const qs = BANK.filter(q => q.domain === d.id);
      const ok = qs.filter(q => S.q[q.id] && S.q[q.id].last === true).length;
      const seen = qs.filter(q => S.q[q.id]).length;
      const debt = qs.filter(q => S.debt[q.id]).length;
      return { domain: d, total: qs.length, ok, seen, debt, pct: qs.length ? Math.round((ok / qs.length) * 100) : 0 };
    });
  }

  /* Estimación 0-1000 ponderada por el punto medio del peso oficial de cada dominio.
     Es una aproximación didáctica: Microsoft no publica su fórmula de escalado. */
  function weightedScore(perDomain) {
    let num = 0, den = 0;
    D.DOMAINS.forEach(d => {
      const r = perDomain[d.id];
      if (!r || !r.total) return;
      const w = (d.min + d.max) / 2;
      num += w * (r.ok / r.total); den += w;
    });
    return den ? Math.round((num / den) * 1000) : 0;
  }

  /* Muestra n preguntas respetando los pesos oficiales de cada dominio. */
  function buildExam(n) {
    const total = D.DOMAINS.reduce((a, d) => a + (d.min + d.max) / 2, 0);
    const parts = D.DOMAINS.map(d => { const x = n * ((d.min + d.max) / 2) / total; return { d, want: Math.floor(x), frac: x - Math.floor(x), w: d.min }; });
    let left = n - parts.reduce((a, x) => a + x.want, 0);
    parts.slice().sort((a, b) => (b.frac - a.frac) || (b.w - a.w)).forEach(x => { if (left > 0) { x.want++; left--; } });
    let picked = [];
    parts.forEach(x => { picked = picked.concat(shuffle(BANK.filter(q => q.domain === x.d.id)).slice(0, x.want)); });
    return shuffle(picked).map(q => ({ id: q.id, order: shuffle(q.options.map((_, i) => i)), pick: null, flag: false }));
  }

  function gradeExam(items, secondsUsed) {
    const perDomain = {};
    D.DOMAINS.forEach(d => perDomain[d.id] = { ok: 0, total: 0 });
    touchStreak();
    items.forEach(it => {
      const q = BY_ID[it.id];
      const ok = it.pick !== null && q.options[it.pick].ok;
      perDomain[q.domain].total++;
      if (ok) perDomain[q.domain].ok++;
      else S.debt[q.id] = Math.max(S.debt[q.id] || 0, CFG.debtInterest);   // fallada u omitida → deuda
      it.ok = ok;
    });
    const score = weightedScore(perDomain);
    const res = { at: Date.now(), score, pass: score >= CFG.passScore, perDomain, seconds: secondsUsed,
      correct: items.filter(i => i.ok).length, total: items.length };
    S.exams.unshift(res); S.exams = S.exams.slice(0, 20);
    save();
    return res;
  }

  function readiness() {
    const m = mastery();
    const per = {};
    m.forEach(x => per[x.domain.id] = { ok: x.ok, total: x.total });
    return weightedScore(per);
  }

  /* Acciones de Ingeniero: XP solo la primera vez que se resuelve; ver la respuesta no cuenta. */
  function exerciseDone(id, r) {
    touchStreak();
    const prev = S.ex[id] || {};
    let xp = 0;
    if (r.solved && !prev.solved) xp = r.hints ? 15 : 30;
    S.ex[id] = { solved: !!r.solved || !!prev.solved, hints: r.solved ? r.hints : (prev.hints || 0), tries: (prev.tries || 0) + r.tries, at: Date.now() };
    S.xp += xp; save();
    return xp;
  }
  function gameSave(zonesCleared, won) {
    S.game = S.game || { best: 0, wins: 0 };
    S.game.best = Math.max(S.game.best, zonesCleared);
    if (won) S.game.wins++;
    save();
  }

  D.Engine = {
    CFG, RANKS, BANK, BY_ID, SKILLS, shuffle,
    get state() { return S; },
    rank, streakAlive, answer, queue, skillQueue, debtQueue, mastery, skillMastery, exerciseDone, gameSave, readiness, buildExam, gradeExam,
    debtCount: () => Object.keys(S.debt).length,
    reset() { S = fresh(); save(); },
    exportState: () => JSON.stringify(S, null, 2),
    importState(text) {
      const raw = JSON.parse(text);
      if (!raw || raw.v !== 1 || typeof raw.q !== "object") throw new Error("Formato no reconocido");
      S = Object.assign(fresh(), raw); save();
    }
  };
})();
