/* Motor: estado persistente, economía de DBU/SLA, rangos, racha, deuda técnica y puntuación. */
(function () {
  const D = window.DP750;
  const KEY = "dp750-sim-v1";
  const BANK = [...D.SCENARIOS, ...D.AUDITS];
  const BY_ID = Object.fromEntries(BANK.map(q => [q.id, q]));

  const CFG = {
    dbuStart: 1000, dbuCredit: 15, dbuAfterIncident: 600,
    slaRecover: 4, slaBreach: 70,
    xpNew: 40, xpRepeat: 10, xpDebtBonus: 20, xpWrong: 25, xpIncident: 100,
    debtInterest: 2,          // aciertos consecutivos necesarios para saldar un concepto fallado
    debtDoubt: 1,             // aciertos necesarios si se acertó «con dudas»
    examSecondsPerQuestion: 100, passScore: 700
  };

  const RANKS = [
    { xp: 0,   name: "Becario de Pipelines" },
    { xp: 100, name: "Data Engineer Junior" },
    { xp: 250, name: "Data Engineer" },
    { xp: 420, name: "Senior Data Engineer" },
    { xp: 620, name: "Staff Data Engineer" },
    { xp: 820, name: "Principal Data Architect" }
  ];

  const fresh = () => ({
    v: 1, dbu: CFG.dbuStart, sla: 100, xp: 0, incidents: 0,
    streak: { count: 0, last: null, best: 0 },
    q: {}, debt: {}, exams: [], log: []
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

    S.dbu += fx.dbu; S.xp = Math.max(0, S.xp + fx.xp);
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
  function queue(mode, domain) {
    const pool = BANK.filter(q => q.mode === mode && (!domain || q.domain === domain));
    const tier = q => S.debt[q.id] ? 0 : !S.q[q.id] ? 1 : S.q[q.id].last === false ? 2 : 3;
    return shuffle(pool).sort((a, b) => tier(a) - tier(b));
  }
  function debtQueue() {
    return shuffle(Object.keys(S.debt).map(id => BY_ID[id]).filter(Boolean));
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

  function buildExam() {
    return shuffle(BANK).map(q => ({ id: q.id, order: shuffle(q.options.map((_, i) => i)), pick: null, flag: false }));
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

  D.Engine = {
    CFG, RANKS, BANK, BY_ID, shuffle,
    get state() { return S; },
    rank, streakAlive, answer, queue, debtQueue, mastery, readiness, buildExam, gradeExam,
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
