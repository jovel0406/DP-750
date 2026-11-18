import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Square, Volume2, Check, Play, Trash2 } from 'lucide-react';
import { FASE1, ELEMENTOS, RUBRICA_ORAL } from '../data/oral.js';
import { useStore } from '../lib/store.jsx';
import { falarUma } from '../lib/voz.js';
import { Cabecalho, Kicker, Rule, Cronometro, useCronometro, NotaES, Chip } from '../components/ui.jsx';

export default function Oral({ id }) {
  if (id === 'simulado') return <Simulado />;
  if (id === 'conversa') return <Pagina voltar><Fase1 /></Pagina>;
  const e = ELEMENTOS.find((x) => x.id === id);
  if (e) return <Pagina voltar><Elemento e={e} /></Pagina>;
  return <Indice />;
}

function Pagina({ children }) {
  return (
    <div>
      <a href="#/oral" className="btn-ghost mt-8"><ArrowLeft size={15} /> Parte oral</a>
      {children}
    </div>
  );
}

function Indice() {
  const { estado } = useStore();
  return (
    <div>
      <Cabecalho
        kicker="Pilar 04 · Interação face a face"
        titulo="Simulador da Parte Oral"
        linhaFina="Vinte minutos de conversa: cinco sobre você, quinze sobre três elementos provocadores. Fale em voz alta — sempre."
      >
        <a href="#/oral/simulado" className="btn-ink self-start lg:self-end"><Play size={16} /> Simulação completa (20 min)</a>
      </Cabecalho>
      <div className="grid lg:grid-cols-12 gap-10">
        <a href="#/oral/conversa" className="group lg:col-span-4 border-t-2 rule-strong pt-4 block">
          <Kicker>Fase 1 · {FASE1.duracao} minutos</Kicker>
          <h2 className="headline text-4xl mt-2 group-hover:text-selva">{FASE1.titulo}</h2>
          <p className="font-serif mt-3 text-ink/80 leading-snug">{FASE1.explicacao}</p>
        </a>
        <div className="lg:col-span-8">
          <Kicker className="border-t-2 rule-strong pt-4">Fase 2 · Elementos provocadores · 5 min cada</Kicker>
          <div className="grid sm:grid-cols-2 gap-x-8">
            {ELEMENTOS.map((e) => (
              <a key={e.id} href={`#/oral/${e.id}`} className="group py-5 border-b hairline grid grid-cols-[96px_1fr] gap-4 items-start">
                <div className="h-28 overflow-hidden pointer-events-none"><div className="origin-top-left scale-[0.3] w-[320px]"><CartaoVisual v={e.visual} /></div></div>
                <div>
                  <Chip cor="petroleo">{e.tipo}</Chip>
                  <h3 className="font-serif text-xl font-semibold mt-2 group-hover:text-selva">{e.titulo}</h3>
                  {estado.oral[e.id] && <span className="kicker text-selva flex items-center gap-1 mt-2"><Check size={12} /> praticado</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Rule forte className="mt-10" />
      <section className="grid lg:grid-cols-12 gap-10 py-8">
        <div className="lg:col-span-4">
          <Kicker>O que o avaliador observa</Kicker>
          <p className="text-sm text-muted mt-2">Critérios de referência deste simulador, adaptados da descrição pública da avaliação oral. Confira a grade vigente no manual do Inep.</p>
        </div>
        <dl className="lg:col-span-8 grid sm:grid-cols-2 gap-x-10 gap-y-4">
          {RUBRICA_ORAL.map((r) => (
            <div key={r.criterio} className="border-t hairline pt-2">
              <dt className="font-serif text-lg font-semibold">{r.criterio}</dt>
              <dd className="text-sm text-muted">{r.descricao}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

// ——— Cartões visuais editoriais ———
export function CartaoVisual({ v }) {
  if (v.estilo === 'capa') {
    return (
      <div className="w-full aspect-[3/4] max-w-[420px] bg-[#F2E8D5] text-[#1a1410] relative overflow-hidden border border-black/20 shadow-[6px_6px_0_rgba(0,0,0,0.12)]">
        <div className="absolute -right-16 top-24 w-72 h-72 rounded-full bg-[#D97706]" />
        <div className="absolute -right-4 top-40 w-40 h-40 rounded-full bg-[#1B4332]" />
        <div className="absolute left-6 top-44 w-20 h-32 bg-[#0F4C5C] rotate-[-8deg]" />
        <div className="relative p-6 flex flex-col h-full">
          <div className="flex justify-between items-end border-b-2 border-black pb-1">
            <span className="font-serif font-bold italic text-6xl leading-none tracking-tighter">{v.revista}</span>
            <span className="text-[9px] font-sans uppercase tracking-widest text-right">{v.edicao}</span>
          </div>
          <div className="mt-auto bg-[#F2E8D5]/90 p-1 -m-1">
            <div className="font-serif font-bold text-5xl leading-[0.95] tracking-tight">{v.manchete}</div>
            <p className="font-serif text-[15px] leading-snug mt-3">{v.subtitulo}</p>
            <div className="mt-4 border-t border-black pt-2 space-y-1">
              {v.chamadas.map((c) => <p key={c} className="font-sans text-[11px] font-semibold uppercase tracking-wide">▸ {c}</p>)}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (v.estilo === 'campanha') {
    return (
      <div className="w-full aspect-[3/4] max-w-[420px] bg-[#1B4332] text-white relative overflow-hidden border border-black/20 shadow-[6px_6px_0_rgba(0,0,0,0.12)]">
        <svg className="absolute right-[-30px] top-10 w-64 h-64 opacity-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="#FAF9F6" />
          <path d="M30 52 l14 14 l28 -32" stroke="#1B4332" strokeWidth="9" fill="none" strokeLinecap="square" />
        </svg>
        <div className="relative p-6 flex flex-col h-full">
          <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/70">{v.orgao}</div>
          <div className="mt-auto">
            <div className="font-serif font-bold text-[3.4rem] leading-[0.9] tracking-tight">{v.manchete}</div>
            <p className="font-sans text-[14px] leading-snug mt-4 text-white/90">{v.subtitulo}</p>
            <div className="mt-4 bg-[#D97706] text-black px-3 py-2 space-y-0.5">
              {v.chamadas.map((c) => <p key={c} className="font-sans text-[11px] font-bold uppercase tracking-wide">{c}</p>)}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (v.estilo === 'infografico') {
    return (
      <div className="w-full max-w-[460px] bg-[#FAF9F6] text-[#18181B] border-2 border-black p-6 shadow-[6px_6px_0_rgba(0,0,0,0.12)]">
        <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#0F4C5C] font-bold">Mobilidade</div>
        <div className="font-serif font-bold text-4xl leading-none mt-2">{v.manchete}</div>
        <p className="font-sans text-xs text-black/60 mt-2">{v.subtitulo}</p>
        <div className="mt-5 space-y-3">
          {v.barras.map((b) => (
            <div key={b.rotulo}>
              <div className="flex justify-between font-sans text-xs"><span>{b.rotulo}</span><span className="font-bold">{b.valor}%</span></div>
              <div className="h-5 bg-black/10 mt-1"><div className="h-full bg-[#0F4C5C]" style={{ width: `${b.valor}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-black pt-2 space-y-1">
          {v.chamadas.map((c) => <p key={c} className="font-sans text-[11px]">● {c}</p>)}
        </div>
      </div>
    );
  }
  // jornal
  return (
    <div className="w-full max-w-[460px] bg-[#F5F3EE] text-[#18181B] border border-black/30 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.12)]">
      <div className="text-center border-b-4 border-double border-black pb-1">
        <div className="font-serif font-bold text-2xl tracking-tight">{v.jornal}</div>
      </div>
      <div className="font-serif font-bold text-[1.7rem] leading-[1.05] mt-4">{v.manchete}</div>
      <p className="font-serif text-[14px] leading-snug mt-2 text-black/75">{v.subtitulo}</p>
      <div className="mt-4 aspect-[16/9] relative overflow-hidden bg-[#2a2a2a]">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#D97706 0%,#B45309 35%,#1B4332 100%)' }} />
        <div className="absolute bottom-0 left-6 w-14 h-24 bg-black/70 rounded-t-full" />
        <div className="absolute bottom-0 left-24 w-16 h-28 bg-black/60 rounded-t-full" />
        <div className="absolute bottom-0 right-10 w-12 h-20 bg-black/70 rounded-t-full" />
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FAF9F6]/80" />
      </div>
      <p className="font-sans text-[10px] italic text-black/60 mt-1">{v.legenda}</p>
    </div>
  );
}

// ——— Gravador ———
function Gravador() {
  const [gravando, setGravando] = useState(false);
  const [clipes, setClipes] = useState([]);
  const [erro, setErro] = useState('');
  const rec = useRef(null);
  useEffect(() => () => { rec.current?.stream?.getTracks().forEach((t) => t.stop()); clipes.forEach((c) => URL.revokeObjectURL(c.url)); }, []); // eslint-disable-line

  const iniciar = async () => {
    setErro('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const partes = [];
      mr.ondataavailable = (e) => partes.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(partes, { type: mr.mimeType || 'audio/webm' });
        setClipes((c) => [...c, { url: URL.createObjectURL(blob), hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      rec.current = mr;
      setGravando(true);
    } catch {
      setErro('Não foi possível acessar o microfone. Verifique a permissão do navegador.');
    }
  };
  const parar = () => { rec.current?.stop(); setGravando(false); };

  if (typeof window !== 'undefined' && !('MediaRecorder' in window)) return <p className="text-xs text-muted">Gravação indisponível neste navegador.</p>;
  return (
    <div>
      <div className="flex items-center gap-3">
        {gravando
          ? <button onClick={parar} className="btn-line text-alerta border-alerta"><Square size={14} /> Parar gravação</button>
          : <button onClick={iniciar} className="btn-line"><Mic size={15} /> Gravar minha resposta</button>}
        {gravando && <span className="kicker text-alerta flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-alerta animate-pulse" /> gravando</span>}
      </div>
      {erro && <p className="text-xs text-alerta mt-2">{erro}</p>}
      {clipes.length > 0 && (
        <ul className="mt-3 space-y-2">
          {clipes.map((c, i) => (
            <li key={c.url} className="flex items-center gap-3 text-xs">
              <span className="font-mono text-muted">{c.hora}</span>
              <audio src={c.url} controls className="h-8 flex-1" />
              <button onClick={() => { URL.revokeObjectURL(c.url); setClipes((x) => x.filter((_, k) => k !== i)); }} className="btn-ghost" aria-label="Apagar gravação"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-muted mt-2">As gravações ficam só na memória desta página e somem ao sair. Ouça-se procurando: palavras em espanhol, vogais nasais (-ão, -em) e pausas longas.</p>
    </div>
  );
}

// ——— Roteiro do avaliador ———
function Roteiro({ perguntas, minutos, autoIniciar, onFim }) {
  const [i, setI] = useState(0);
  const c = useCronometro(minutos, { autoIniciar });
  const falar = (t) => falarUma(t, 1, 'm');
  useEffect(() => { if (c.restante === 0) onFim?.(); }, [c.restante]); // eslint-disable-line
  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Kicker cor="text-petroleo">Roteiro do avaliador · pergunta {i + 1} de {perguntas.length}</Kicker>
        <Cronometro c={c} rotulo={`${minutos} min`} />
      </div>
      <div className="mt-5 min-h-[7rem]">
        <p className="font-serif text-2xl sm:text-3xl leading-snug fade-up" key={i}>“{perguntas[i]}”</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button className="btn-line" onClick={() => falar(perguntas[i])}><Volume2 size={15} /> Ouvir a pergunta</button>
        <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={15} /> Anterior</button>
        <button className="btn-ink" disabled={i === perguntas.length - 1} onClick={() => { setI(i + 1); if (!c.rodando && c.restante === c.total) c.iniciar(); }}>Próxima pergunta <ArrowRight size={15} /></button>
      </div>
      <div className="flex gap-0.5 mt-5" aria-hidden>{perguntas.map((_, k) => <span key={k} className={`h-1 flex-1 ${k <= i ? 'bg-petroleo' : 'bg-ink/15'}`} />)}</div>
      {c.restante === 0 && <p className="mt-3 text-sm text-ocre">Tempo esgotado. No exame, o avaliador passaria ao próximo elemento.</p>}
    </div>
  );
}

function Fase1({ autoIniciar = false, onFim }) {
  return (
    <section className="pt-6">
      <Kicker>Fase 1 · {FASE1.duracao} minutos</Kicker>
      <h1 className="headline text-5xl mt-2">{FASE1.titulo}</h1>
      <p className="font-serif text-lg text-muted italic mt-3 max-w-3xl">{FASE1.explicacao}</p>
      <Rule forte className="my-8" />
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <Roteiro perguntas={FASE1.perguntas} minutos={FASE1.duracao} autoIniciar={autoIniciar} onFim={onFim} />
          <Gravador />
        </div>
        <aside className="lg:col-span-5 space-y-6">
          <div className="border-t-2 border-ink pt-3">
            <Kicker cor="text-muted">Estratégias</Kicker>
            <ul className="mt-2 space-y-2 text-sm">{FASE1.dicas.map((d) => <li key={d}>— {d}</li>)}</ul>
          </div>
          <RespostaModelo m={FASE1.modelo} />
        </aside>
      </div>
    </section>
  );
}

function RespostaModelo({ m }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="border-t hairline pt-3">
      <button className="btn-ghost" onClick={() => setVer((v) => !v)}>{ver ? 'Ocultar' : 'Ver'} resposta modelo comentada</button>
      {ver && (
        <div className="mt-3 fade-up">
          <p className="kicker text-muted">{m.pergunta}</p>
          <p className="font-serif text-lg leading-relaxed mt-2">“{m.resposta}”</p>
          <p className="text-sm text-selva mt-2 border-l-2 border-selva pl-3">{m.comentario}</p>
          <button className="btn-ghost mt-2 text-xs" onClick={() => falarUma(m.resposta, 1, 'f')}><Volume2 size={13} /> Ouvir a resposta</button>
        </div>
      )}
    </div>
  );
}

function Autoavaliacao({ e }) {
  const { estado, registrarOral } = useStore();
  const anterior = estado.oral[e.id]?.auto || {};
  const [notas, setNotas] = useState(() => Object.fromEntries(RUBRICA_ORAL.map((r) => [r.criterio, anterior[r.criterio] ?? 3])));
  const [salvo, setSalvo] = useState(false);
  const media = Object.values(notas).reduce((a, b) => a + b, 0) / RUBRICA_ORAL.length;
  return (
    <div className="border-t-2 border-ink pt-3">
      <Kicker cor="text-muted">Autoavaliação (ouça sua gravação primeiro)</Kicker>
      <div className="space-y-3 mt-3">
        {RUBRICA_ORAL.map((r) => (
          <label key={r.criterio} className="block">
            <span className="flex justify-between text-sm"><span>{r.criterio}</span><span className="font-mono num">{notas[r.criterio]}</span></span>
            <input type="range" min={0} max={5} step={1} value={notas[r.criterio]} onChange={(ev) => { setNotas({ ...notas, [r.criterio]: +ev.target.value }); setSalvo(false); }} className="w-full accent-[rgb(var(--selva))]" aria-label={r.criterio} />
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-sm num">Média: {media.toFixed(1).replace('.', ',')}</span>
        <button className="btn-line !py-1" onClick={() => { registrarOral(e.id, { auto: notas, media }); setSalvo(true); }}>{salvo ? 'Salvo ✓' : 'Salvar'}</button>
      </div>
    </div>
  );
}

function Elemento({ e, autoIniciar = false, onFim, compacto = false }) {
  return (
    <section className="pt-6">
      <Kicker>Elemento provocador · {e.tipo}</Kicker>
      <h1 className="headline text-5xl mt-2">{e.titulo}</h1>
      <Rule forte className="my-8" />
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <p className="kicker text-muted mb-3">Observe o material por cerca de 1 minuto antes de começar.</p>
          <CartaoVisual v={e.visual} />
          <p className="text-[11px] text-muted mt-3">Material fictício criado para treino.</p>
        </div>
        <div className="lg:col-span-7 space-y-8">
          <Roteiro perguntas={e.roteiro} minutos={5} autoIniciar={autoIniciar} onFim={onFim} />
          <Gravador />
          <div className="border-t hairline pt-3">
            <Kicker cor="text-muted">Vocabulário útil</Kicker>
            <p className="font-serif mt-2">{e.vocabulario.join(' · ')}</p>
          </div>
          {!compacto && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">{e.modelos.map((m) => <RespostaModelo key={m.pergunta} m={m} />)}</div>
              <Autoavaliacao e={e} />
            </div>
          )}
          <NotaES>
            En la conversación, el evaluador valora que desarrolles: describir → interpretar → opinar → comparar con tu país. Si solo describes la imagen, te quedas en Intermedio aunque no cometas errores.
          </NotaES>
        </div>
      </div>
    </section>
  );
}

function Simulado() {
  const [passo, setPasso] = useState(-1);
  const [sorteio] = useState(() => [...ELEMENTOS].sort(() => Math.random() - 0.5).slice(0, 3));
  const { praticar } = useStore();
  const etapas = ['Conversa inicial', ...sorteio.map((e) => e.titulo)];
  return (
    <div>
      <a href="#/oral" className="btn-ghost mt-8"><ArrowLeft size={15} /> Parte oral</a>
      <div className="flex gap-1 mt-6">
        {etapas.map((e, i) => (
          <div key={e} className="flex-1">
            <div className={`h-1 ${i < passo ? 'bg-selva' : i === passo ? 'bg-ink' : 'bg-ink/15'}`} />
            <span className={`kicker text-[10px] mt-1 block ${i === passo ? 'text-ink' : 'text-muted'}`}>{i === 0 ? '5 min' : `Elemento ${i} · 5 min`}</span>
          </div>
        ))}
      </div>
      {passo === -1 && (
        <div className="py-16 max-w-2xl">
          <Kicker>Simulação completa</Kicker>
          <h1 className="headline text-5xl mt-2">Vinte minutos, sem pausa</h1>
          <p className="font-serif text-xl italic text-muted mt-4">Uma conversa inicial e três elementos sorteados. Os cronômetros começam sozinhos. Responda em voz alta e grave para ouvir depois. Como no exame, você não verá respostas modelo durante a simulação.</p>
          <button className="btn-ink mt-8" onClick={() => setPasso(0)}><Play size={16} /> Começar</button>
        </div>
      )}
      {passo === 0 && <Fase1 autoIniciar key="f1" />}
      {passo >= 1 && passo <= 3 && <Elemento e={sorteio[passo - 1]} autoIniciar compacto key={sorteio[passo - 1].id} />}
      {passo === 4 && (
        <div className="py-16 max-w-2xl">
          <h1 className="headline text-5xl">Simulação concluída</h1>
          <p className="font-serif text-xl italic text-muted mt-4">Agora abra cada elemento individualmente para ver as respostas modelo e fazer sua autoavaliação.</p>
          <div className="flex flex-wrap gap-2 mt-6">{sorteio.map((e) => <a key={e.id} className="btn-line" href={`#/oral/${e.id}`}>{e.titulo}</a>)}</div>
        </div>
      )}
      {passo >= 0 && passo <= 3 && (
        <div className="flex justify-end mt-10 border-t hairline pt-4">
          <button className="btn-ink" onClick={() => { if (passo === 3) praticar(); setPasso(passo + 1); window.scrollTo({ top: 0 }); }}>
            {passo === 3 ? 'Encerrar simulação' : 'Próxima etapa'} <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
