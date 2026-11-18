import { useEffect, useRef, useState } from 'react';
import { Languages, Pause, Play, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store.jsx';

export function Kicker({ children, className = '', cor = 'text-ocre' }) {
  return <div className={`kicker ${cor} ${className}`}>{children}</div>;
}

export function Rule({ forte = false, className = '' }) {
  return <hr className={`border-0 border-t ${forte ? 'rule-strong border-t-2' : 'hairline'} ${className}`} />;
}

export function Cabecalho({ kicker, titulo, linhaFina, children }) {
  return (
    <header className="pt-10 pb-8 fade-up">
      {kicker && <Kicker className="mb-3">{kicker}</Kicker>}
      <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
        <div className="max-w-3xl">
          <h1 className="headline text-4xl sm:text-5xl lg:text-6xl">{titulo}</h1>
          {linhaFina && <p className="font-serif text-lg sm:text-xl text-muted mt-4 leading-snug italic">{linhaFina}</p>}
        </div>
        {children}
      </div>
      <Rule forte className="mt-8" />
    </header>
  );
}

// Nota contrastiva em espanhol — aparece apenas se o interruptor estiver ligado
export function NotaES({ children, className = '' }) {
  const { estado } = useStore();
  if (!estado.ajustes.notasES || !children) return null;
  return (
    <aside className={`border-l-2 border-petroleo pl-4 py-1 ${className}`} lang="es">
      <div className="kicker text-petroleo flex items-center gap-1.5 mb-1"><Languages size={12} /> Nota contrastiva · ES</div>
      <p className="font-sans text-sm leading-relaxed text-ink/85">{children}</p>
    </aside>
  );
}

export function Chip({ children, cor = 'ink', className = '' }) {
  const mapa = {
    ink: 'border-ink/40 text-ink/80',
    selva: 'border-selva text-selva',
    ocre: 'border-ocre text-ocre',
    petroleo: 'border-petroleo text-petroleo',
    alerta: 'border-alerta text-alerta',
  };
  return <span className={`chip ${mapa[cor]} ${className}`}>{children}</span>;
}

// Cronômetro regressivo (minutos) ou progressivo
export function useCronometro(minutos, { autoIniciar = false } = {}) {
  const total = minutos * 60;
  const [restante, setRestante] = useState(total);
  const [rodando, setRodando] = useState(autoIniciar);
  useEffect(() => { setRestante(total); }, [total]);
  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setRestante((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [rodando]);
  useEffect(() => { if (restante === 0) setRodando(false); }, [restante]);
  return {
    restante, rodando, total,
    alternar: () => setRodando((r) => !r),
    iniciar: () => setRodando(true),
    zerar: () => { setRodando(false); setRestante(total); },
  };
}

export const fmtTempo = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function Cronometro({ c, rotulo = 'Tempo', compacto = false }) {
  const pct = c.total ? (c.restante / c.total) * 100 : 0;
  const alerta = c.restante <= 60 && c.restante > 0;
  return (
    <div className={`flex items-center gap-3 ${compacto ? '' : 'border hairline px-3 py-2'}`}>
      <div>
        <div className="kicker text-muted">{rotulo}</div>
        <div className={`font-mono text-2xl num leading-none mt-1 ${c.restante === 0 ? 'text-alerta' : alerta ? 'text-ocre' : ''}`} aria-live="off">
          {fmtTempo(c.restante)}
        </div>
      </div>
      <div className="w-1 h-10 bg-ink/10 relative" aria-hidden>
        <div className="absolute bottom-0 left-0 right-0 bg-selva transition-all" style={{ height: `${pct}%` }} />
      </div>
      <button onClick={c.alternar} className="btn-ghost" aria-label={c.rodando ? 'Pausar' : 'Iniciar'}>
        {c.rodando ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button onClick={c.zerar} className="btn-ghost" aria-label="Reiniciar"><RotateCcw size={16} /></button>
    </div>
  );
}

// Abas tipográficas (sem caixas)
export function Abas({ abas, ativa, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex flex-wrap gap-x-6 gap-y-2 border-b hairline ${className}`}>
      {abas.map((a) => (
        <button
          key={a.id}
          role="tab"
          aria-selected={ativa === a.id}
          onClick={() => onChange(a.id)}
          className={`-mb-px pb-2 pt-1 font-sans text-sm transition-colors border-b-2 ${ativa === a.id ? 'border-ink text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'}`}
        >
          {a.num && <span className="font-mono text-[11px] mr-1.5 text-ocre">{a.num}</span>}
          {a.rotulo}
        </button>
      ))}
    </div>
  );
}

// Markdown mínimo (títulos, negrito, itálico, listas, citações) — para a resposta da IA
export function MarkdownLeve({ texto }) {
  const linhas = texto.split('\n');
  const blocos = [];
  let lista = null;
  const inline = (s, k) => {
    const partes = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return partes.map((p, i) => {
      if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={k + i}>{p.slice(2, -2)}</strong>;
      if (/^\*[^*]+\*$/.test(p)) return <em key={k + i}>{p.slice(1, -1)}</em>;
      if (/^`[^`]+`$/.test(p)) return <code key={k + i} className="font-mono text-[0.9em]">{p.slice(1, -1)}</code>;
      return p;
    });
  };
  const fecharLista = () => {
    if (lista) { blocos.push(<ul key={'ul' + blocos.length} className="list-disc pl-5 space-y-1 my-2">{lista}</ul>); lista = null; }
  };
  linhas.forEach((l, i) => {
    const t = l.trimEnd();
    if (/^\s*[-*•]\s+/.test(t) || /^\s*\d+[.)]\s+/.test(t)) {
      const item = t.replace(/^\s*([-*•]|\d+[.)])\s+/, '');
      if (!lista) lista = [];
      lista.push(<li key={i}>{inline(item, i)}</li>);
      return;
    }
    fecharLista();
    if (!t.trim()) return;
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const n = h[1].length;
      blocos.push(<div key={i} className={`${n <= 2 ? 'headline text-2xl mt-8' : 'font-serif font-semibold text-xl mt-6'} mb-2`}>{inline(h[2], i)}</div>);
    } else if (t.startsWith('>')) {
      blocos.push(<blockquote key={i} className="border-l-2 border-ocre pl-3 italic my-2">{inline(t.replace(/^>\s?/, ''), i)}</blockquote>);
    } else {
      blocos.push(<p key={i} className="my-2">{inline(t, i)}</p>);
    }
  });
  fecharLista();
  return <div className="font-serif text-[1.02rem] leading-relaxed">{blocos}</div>;
}

export function useClickFora(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

export function Copiar({ texto, rotulo = 'Copiar', className = 'btn-line' }) {
  const [ok, setOk] = useState(false);
  const tm = useRef();
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* */ }
      ta.remove();
    }
    setOk(true); clearTimeout(tm.current); tm.current = setTimeout(() => setOk(false), 1800);
  };
  return <button onClick={copiar} className={className}>{ok ? 'Copiado ✓' : rotulo}</button>;
}
