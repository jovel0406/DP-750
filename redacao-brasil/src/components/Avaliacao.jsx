import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Square, Check, X, AlertTriangle, ClipboardCopy, KeyRound } from 'lucide-react';
import { useStore, nivelDe } from '../lib/store.jsx';
import { comentarios, montarPrompt, extrairNotaIA, conectoresUsados, ure } from '../lib/avaliador.js';
import { avaliarComClaude, mensagemDeErro } from '../lib/claude.js';
import { CONECTORES } from '../data/laboratorio.js';
import { GENEROS } from '../data/generos.js';
import { Abas, Kicker, Rule, MarkdownLeve, Copiar, NotaES } from './ui.jsx';

const fmt = (n) => n.toFixed(2).replace('.', ',');

// Destaca intervalos [{inicio, fim, classe, titulo}] num texto
function Marcado({ texto, marcas }) {
  const ord = [...marcas].sort((a, b) => a.inicio - b.inicio);
  const out = [];
  let pos = 0;
  ord.forEach((m, i) => {
    if (m.inicio < pos) return;
    out.push(texto.slice(pos, m.inicio));
    out.push(<mark key={i} className={m.classe} title={m.titulo}>{texto.slice(m.inicio, m.fim)}</mark>);
    pos = m.fim;
  });
  out.push(texto.slice(pos));
  return <>{out}</>;
}

function marcasConectores(texto) {
  const res = [];
  for (const c of CONECTORES) {
    const re = ure(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'giu');
    let m;
    while ((m = re.exec(texto)) !== null) res.push({ inicio: m.index, fim: m.index + m[0].length, classe: 'con', titulo: 'Conector' });
  }
  return res;
}

export default function Avaliacao({ tarefa, texto, resultado }) {
  const [aba, setAba] = useState('diag');
  const genero = GENEROS.find((g) => g.id === tarefa.generoId);
  const abas = [
    { id: 'diag', num: '1', rotulo: 'Diagnóstico' },
    { id: 'autopsia', num: '2', rotulo: 'Autópsia de portunhol' },
    { id: 'modelo', num: '3', rotulo: 'Texto modelo 5,0' },
    { id: 'ia', num: '4', rotulo: 'Avaliador IA' },
  ];
  return (
    <section className="mt-12 fade-up" id="avaliacao">
      <Rule forte />
      <div className="pt-6 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Kicker>Revisão pedagógica em 4 camadas</Kicker>
          <h2 className="headline text-4xl mt-2">A banca leu seu texto</h2>
        </div>
        <div className="text-right">
          <div className="kicker text-muted">Estimativa automática</div>
          <div className="headline text-6xl num">{fmt(resultado.final)}</div>
          <div className="font-serif italic text-selva">{nivelDe(resultado.final).nome}</div>
        </div>
      </div>
      <Abas abas={abas} ativa={aba} onChange={setAba} />
      <div className="pt-8">
        {aba === 'diag' && <Diagnostico tarefa={tarefa} r={resultado} />}
        {aba === 'autopsia' && <Autopsia texto={texto} r={resultado} />}
        {aba === 'modelo' && <Modelo tarefa={tarefa} />}
        {aba === 'ia' && <AvaliadorIA tarefa={tarefa} genero={genero} texto={texto} />}
      </div>
    </section>
  );
}

function Diagnostico({ tarefa, r }) {
  const coms = comentarios(r, tarefa);
  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-6">
        {r.criterios.map((c) => (
          <div key={c.id}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-serif text-xl font-semibold">{c.nome}</h3>
              <span className="font-mono text-xl num">{fmt(c.nota)}</span>
            </div>
            <div className="h-1.5 bg-ink/10 mt-2"><div className="h-full bg-selva transition-all duration-700" style={{ width: `${(c.nota / 5) * 100}%` }} /></div>
            <ul className="mt-3 space-y-1.5">
              {coms.filter((x) => x.c === c.id).map((x, i) => <li key={i} className="text-sm leading-relaxed text-ink/85">— {x.t}</li>)}
            </ul>
          </div>
        ))}
        {r.tetos.length > 0 && (
          <div className="border-l-4 border-alerta pl-4 space-y-1">
            <Kicker cor="text-alerta">Limites aplicados à nota</Kicker>
            {r.tetos.map((t) => <p key={t} className="text-sm">{t}</p>)}
          </div>
        )}
        <p className="text-xs text-muted leading-relaxed">
          Como funciona: o radar automático verifica marcas do gênero, informações-chave da fonte, conectores, interferências do espanhol, informalidade e cópia literal. É um termômetro para treino — não lê sentido nem argumentação como um avaliador humano. Para uma leitura de verdade, use a camada 4.
        </p>
      </div>
      <aside className="lg:col-span-5 space-y-6">
        <div className="border-t-2 border-ink pt-3">
          <Kicker cor="text-muted">Números do texto</Kicker>
          <dl className="grid grid-cols-3 gap-4 mt-3">
            <div><dt className="text-xs text-muted">Palavras</dt><dd className="headline text-3xl num">{r.palavras}</dd></div>
            <div><dt className="text-xs text-muted">Parágrafos</dt><dd className="headline text-3xl num">{r.paragrafos}</dd></div>
            <div><dt className="text-xs text-muted">Conectores</dt><dd className="headline text-3xl num">{r.conectores.length}</dd></div>
          </dl>
        </div>
        <div className="border-t-2 border-ink pt-3">
          <Kicker cor="text-muted">Marcas do gênero</Kicker>
          <ul className="mt-2 space-y-1 text-sm">
            {r.genero.map((g) => <li key={g.rotulo} className="flex gap-2">{g.ok ? <Check size={16} className="text-selva shrink-0" /> : <X size={16} className="text-alerta shrink-0" />}{g.rotulo}</li>)}
          </ul>
        </div>
        <div className="border-t-2 border-ink pt-3">
          <Kicker cor="text-muted">Informações da fonte</Kicker>
          <ul className="mt-2 space-y-1 text-sm">
            {r.pontos.map((g) => <li key={g.rotulo} className="flex gap-2">{g.ok ? <Check size={16} className="text-selva shrink-0" /> : <X size={16} className="text-alerta shrink-0" />}{g.rotulo}</li>)}
          </ul>
        </div>
        {r.copia.length > 0 && (
          <div className="border-t-2 border-alerta pt-3">
            <Kicker cor="text-alerta">Trechos copiados da fonte</Kicker>
            <ul className="mt-2 space-y-1 text-sm italic">{r.copia.map((c) => <li key={c}>“{c}”</li>)}</ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function Autopsia({ texto, r }) {
  const marcas = [
    ...r.portunhol.map((p) => ({ inicio: p.inicio, fim: p.fim, classe: 'err', titulo: `${p.exp} Sugestão: ${p.sug}` })),
    ...marcasConectores(texto).filter((c) => !r.portunhol.some((p) => c.inicio < p.fim && c.fim > p.inicio)),
  ];
  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7">
        <div className="flex gap-4 text-xs mb-3">
          <span><mark className="err">trecho</mark> interferência do espanhol</span>
          <span><mark className="con">conector</mark> coesão</span>
        </div>
        <div className="bg-paper2 p-6 font-serif text-[1.06rem] leading-8 whitespace-pre-wrap">
          <Marcado texto={texto} marcas={marcas} />
        </div>
      </div>
      <aside className="lg:col-span-5">
        <Kicker cor="text-alerta">{r.portunhol.length} alerta(s) do radar</Kicker>
        {r.portunhol.length === 0 ? (
          <p className="font-serif italic mt-3">Nenhuma interferência típica detectada. Isso é ótimo — mas o radar não pega tudo: regências e colocações menos comuns ficam para a camada 4.</p>
        ) : (
          <ol className="mt-3 space-y-4">
            {r.portunhol.map((p, i) => (
              <li key={i} className="border-t hairline pt-3">
                <p className="font-serif text-lg"><span className="line-through decoration-alerta decoration-2">{p.trecho}</span> → <span className="text-selva font-semibold">{p.sug}</span></p>
                <p className="text-sm text-muted mt-1">{p.exp}</p>
              </li>
            ))}
          </ol>
        )}
        {r.informal.length > 0 && (
          <div className="mt-6 border-l-4 border-ocre pl-4">
            <Kicker cor="text-ocre">Marcas de informalidade</Kicker>
            <p className="text-sm mt-1">{[...new Set(r.informal)].join(' · ')} — inadequadas ao gênero pedido.</p>
          </div>
        )}
        <p className="text-xs text-muted mt-6">Os alertas foram enviados ao Caderno de Erros para revisão espaçada.</p>
      </aside>
    </div>
  );
}

function Modelo({ tarefa }) {
  const [ativo, setAtivo] = useState(0);
  const ps = tarefa.modelo.paragrafos;
  const todos = ps.map((p) => p.texto).join('\n');
  const usados = conectoresUsados(todos);
  return (
    <div>
      <p className="text-sm text-muted mb-4">{tarefa.modelo.titulo}. Passe o cursor sobre os parágrafos; os conectores estão destacados.</p>
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7 bg-paper2 p-6 sm:p-8 folha font-serif text-[1.06rem]">
          {ps.map((p, i) => (
            <p key={i} tabIndex={0} onMouseEnter={() => setAtivo(i)} onFocus={() => setAtivo(i)} onClick={() => setAtivo(i)} className={`whitespace-pre-line mb-4 cursor-help outline-none ${ativo === i ? 'bg-selva/10 -mx-2 px-2' : ''}`}>
              <Marcado texto={p.texto} marcas={marcasConectores(p.texto)} />
            </p>
          ))}
        </div>
        <aside className="md:col-span-5">
          <div className="md:sticky md:top-6 space-y-6">
            <div className="border-t-2 border-ink pt-3" aria-live="polite">
              <Kicker cor="text-selva">Por que funciona · parágrafo {ativo + 1}</Kicker>
              <p className="font-serif text-lg leading-snug mt-3">{ps[ativo].nota}</p>
            </div>
            <div className="border-t hairline pt-3">
              <Kicker cor="text-muted">Conectores do modelo</Kicker>
              <p className="mt-2 font-serif">{usados.join(' · ')}</p>
            </div>
            <Copiar texto={todos} rotulo="Copiar texto modelo" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function AvaliadorIA({ tarefa, genero, texto }) {
  const { apiKey, estado, registrarNota } = useStore();
  const prompt = useMemo(() => montarPrompt(tarefa, genero, texto), [tarefa, genero, texto]);
  const [saida, setSaida] = useState('');
  const [status, setStatus] = useState('ocioso'); // ocioso | avaliando | pronto | erro
  const [erro, setErro] = useState('');
  const [verPrompt, setVerPrompt] = useState(false);
  const abort = useRef(null);
  useEffect(() => () => abort.current?.abort(), []);

  const avaliar = async () => {
    setStatus('avaliando'); setSaida(''); setErro('');
    abort.current = new AbortController();
    try {
      const { texto: t, truncado } = await avaliarComClaude({ apiKey, modelo: estado.ajustes.modelo, prompt, onTexto: setSaida, signal: abort.current.signal });
      setSaida(t + (truncado ? '\n\n> A resposta foi interrompida por limite de tamanho.' : ''));
      const nota = extrairNotaIA(t);
      if (nota != null) registrarNota({ tarefaId: tarefa.id, nota, fonte: 'ia' });
      setStatus('pronto');
    } catch (e) {
      setErro(mensagemDeErro(e)); setStatus('erro');
    }
  };
  const nota = extrairNotaIA(saida);

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8">
        {!apiKey && status === 'ocioso' && (
          <div className="border-l-4 border-petroleo pl-5 py-2">
            <h3 className="headline text-2xl">Correção com Claude, critério a critério</h3>
            <p className="font-serif mt-2 leading-relaxed">Você pode colar sua chave da API da Anthropic em <strong>Ajustes</strong> para receber a avaliação aqui mesmo, ou copiar o prompt e colá-lo numa conversa com Claude — sem custo de API.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Copiar texto={prompt} rotulo="Copiar prompt de avaliação" className="btn-ink" />
              <span className="text-sm text-muted self-center flex items-center gap-1"><KeyRound size={14} /> ou configure a chave em Ajustes</span>
            </div>
          </div>
        )}
        {apiKey && status !== 'avaliando' && (
          <div className="flex flex-wrap gap-2">
            <button className="btn-ink" onClick={avaliar}><Sparkles size={16} /> {status === 'pronto' ? 'Avaliar de novo' : 'Avaliar com Claude'}</button>
            <Copiar texto={prompt} rotulo="Copiar prompt de avaliação" />
          </div>
        )}
        {status === 'avaliando' && (
          <div className="flex items-center gap-3">
            <span className="kicker text-petroleo flex items-center gap-2"><span className="w-2 h-2 bg-petroleo animate-pulse" /> Claude está lendo seu texto…</span>
            <button className="btn-line" onClick={() => abort.current?.abort()}><Square size={14} /> Cancelar</button>
          </div>
        )}
        {erro && <p className="mt-4 text-alerta flex items-center gap-2"><AlertTriangle size={16} /> {erro}</p>}
        {saida && <div className="mt-6"><MarkdownLeve texto={saida} /></div>}
      </div>
      <aside className="lg:col-span-4 space-y-6">
        {nota != null && (
          <div className="border-t-2 border-petroleo pt-3">
            <Kicker cor="text-petroleo">Nota da IA</Kicker>
            <div className="headline text-6xl num mt-1">{fmt(nota)}</div>
            <div className="font-serif italic">{nivelDe(nota).nome}</div>
            <p className="text-xs text-muted mt-2">Registrada no seu histórico de nível.</p>
          </div>
        )}
        <div className="border-t hairline pt-3">
          <button className="btn-ghost" onClick={() => setVerPrompt((v) => !v)}><ClipboardCopy size={14} /> {verPrompt ? 'Ocultar' : 'Ver'} o prompt enviado</button>
          {verPrompt && <pre className="mt-3 text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto scrollbar-thin bg-paper2 p-3">{prompt}</pre>}
        </div>
        <NotaES>
          Usa la IA como un segundo corrector, no como oráculo: compara su nota con la estimación automática y, sobre todo, lee las "três prioridades". Reescribir el texto siguiendo esas prioridades es el ejercicio de mayor rendimiento.
        </NotaES>
      </aside>
    </div>
  );
}
