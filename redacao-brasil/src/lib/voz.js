// Síntese de voz (Web Speech API) em pt-BR + ruído de rádio (Web Audio API).
// A disponibilidade e a qualidade das vozes dependem do navegador e do sistema operacional.

export const temVoz = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function vozesPT() {
  if (!temVoz()) return [];
  const todas = window.speechSynthesis.getVoices();
  const br = todas.filter((v) => /pt[-_]BR/i.test(v.lang));
  return br.length ? br : todas.filter((v) => /^pt/i.test(v.lang));
}

export function aoCarregarVozes(cb) {
  if (!temVoz()) return () => {};
  cb(vozesPT());
  const h = () => cb(vozesPT());
  window.speechSynthesis.addEventListener?.('voiceschanged', h);
  return () => window.speechSynthesis.removeEventListener?.('voiceschanged', h);
}

// Perfis de locutor: se houver mais de uma voz pt-BR, alterna; senão varia o tom.
const PERFIS = { f: { pitch: 1.05, idx: 0 }, f2: { pitch: 0.92, idx: 1 }, m: { pitch: 0.8, idx: 2 } };

function escolherVoz(vozes, perfil) {
  if (!vozes.length) return null;
  const masculinas = vozes.filter((v) => /male|masculin|daniel|ricardo|felipe|antonio|antônio|paulo/i.test(v.name) && !/female/i.test(v.name));
  const femininas = vozes.filter((v) => !masculinas.includes(v));
  if (perfil === 'm' && masculinas.length) return masculinas[0];
  if (perfil === 'f2' && femininas.length > 1) return femininas[1];
  if ((perfil === 'f' || perfil === 'f2') && femininas.length) return femininas[0];
  return vozes[PERFIS[perfil]?.idx % vozes.length] || vozes[0];
}

/**
 * Lê uma sequência de falas. Retorna um controlador { parar }.
 * onFala(i) é chamado quando a fala i começa; onFim() ao terminar tudo.
 */
export function lerSequencia(cenas, { taxa = 1, inicio = 0, onFala, onFim } = {}) {
  if (!temVoz()) { onFim?.(); return { parar() {} }; }
  const synth = window.speechSynthesis;
  synth.cancel();
  const vozes = vozesPT();
  let cancelado = false;
  const falar = (i) => {
    if (cancelado) return;
    if (i >= cenas.length) { onFim?.(); return; }
    const c = cenas[i];
    const u = new SpeechSynthesisUtterance(c.texto);
    u.lang = 'pt-BR';
    const v = escolherVoz(vozes, c.voz || 'f');
    if (v) u.voice = v;
    u.rate = taxa;
    u.pitch = PERFIS[c.voz || 'f']?.pitch ?? 1;
    u.onstart = () => onFala?.(i);
    u.onend = () => setTimeout(() => falar(i + 1), 350);
    u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') falar(i + 1); };
    synth.speak(u);
  };
  falar(inicio);
  return {
    parar() { cancelado = true; synth.cancel(); },
    pausar() { synth.pause(); },
    retomar() { synth.resume(); },
  };
}

export function falarUma(texto, taxa = 1, voz = 'm') {
  return lerSequencia([{ texto, voz }], { taxa });
}

// Ruído de fundo tipo "rádio" (ruído marrom filtrado, volume baixo)
export function criarRuido(volume = 0.035) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return { parar() {} };
  const ctx = new AC();
  const tam = 2 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, tam, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let ultimo = 0;
  for (let i = 0; i < tam; i++) {
    const branco = Math.random() * 2 - 1;
    ultimo = (ultimo + 0.02 * branco) / 1.02;
    d[i] = ultimo * 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.value = 900;
  filtro.Q.value = 0.6;
  const ganho = ctx.createGain();
  ganho.gain.value = volume;
  src.connect(filtro).connect(ganho).connect(ctx.destination);
  src.start();
  return {
    volume(v) { ganho.gain.value = v; },
    parar() { try { src.stop(); ctx.close(); } catch { /* já parado */ } },
  };
}
