import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X, RotateCcw, Radar, Target } from 'lucide-react';
import { MODULOS, DESAFIOS } from '../data/laboratorio.js';
import { useStore } from '../lib/store.jsx';
import { ure } from '../lib/avaliador.js';
import { Cabecalho, Kicker, Rule, NotaES, Chip } from '../components/ui.jsx';

export default function Laboratorio({ param }) {
  if (param === 'radar') return <SessaoRadar desafios={DESAFIOS} titulo="Sessão completa do Radar" />;
  const m = MODULOS.find((x) => x.id === param);
  return m ? <Modulo m={m} /> : <Indice />;
}

function Indice() {
  const { estado } = useStore();
  const feitos = Object.keys(estado.radar).length;
  const acertos = Object.values(estado.radar).filter((r) => r.acertos > 0).length;
  return (
    <div>
      <Cabecalho
        kicker="Pilar 02 · Treino contrastivo ES → PT-BR"
        titulo="Laboratório de Língua & Radar Anti-Portunhol"
        linhaFina="Quem fala espanhol entende muito português — e é justamente por isso que erra sem perceber. Aqui você treina o olhar."
      >
        <a href="#/laboratorio/radar" className="btn-ink self-start lg:self-end"><Radar size={16} /> Sessão do Radar ({DESAFIOS.length} desafios)</a>
      </Cabecalho>

      <div className="grid md:grid-cols-2 gap-x-12">
        {MODULOS.map((m) => {
          const ds = DESAFIOS.filter((d) => d.modulo === m.id);
          const ok = ds.filter((d) => estado.radar[d.id]?.acertos).length;
          return (
            <a key={m.id} href={`#/laboratorio/${m.id}`} className="group grid grid-cols-[auto_1fr] gap-x-6 py-7 border-t hairline">
              <span className="headline text-6xl text-ink/15 group-hover:text-ocre transition-colors num">{m.num}</span>
              <div>
                <h2 className="headline text-3xl group-hover:text-selva transition-colors">{m.titulo}</h2>
                <p className="font-serif italic text-muted mt-2">{m.subtitulo}</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex gap-0.5">{ds.map((d) => <span key={d.id} className={`w-3 h-1.5 ${estado.radar[d.id]?.acertos ? 'bg-selva' : estado.radar[d.id] ? 'bg-alerta/60' : 'bg-ink/15'}`} />)}</div>
                  <span className="kicker text-muted num">{ok}/{ds.length} desafios dominados</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      <Rule forte className="mt-4" />
      <p className="text-sm text-muted mt-4 num">Total: {feitos} desafios tentados · {acertos} acertados ao menos uma vez. Erros vão automaticamente para o Caderno de Erros.</p>
    </div>
  );
}

function Modulo({ m }) {
  const ds = DESAFIOS.filter((d) => d.modulo === m.id);
  const [praticando, setPraticando] = useState(false);
  if (praticando) return <SessaoRadar desafios={ds} titulo={m.titulo} onSair={() => setPraticando(false)} />;
  return (
    <article>
      <a href="#/laboratorio" className="btn-ghost mt-8"><ArrowLeft size={15} /> Laboratório</a>
      <Cabecalho kicker={`Módulo ${m.num}`} titulo={m.titulo} linhaFina={m.subtitulo}>
        <button className="btn-ink self-start lg:self-end" onClick={() => setPraticando(true)}><Target size={16} /> Praticar ({ds.length} desafios)</button>
      </Cabecalho>
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <p className="prose-ed dropcap">{m.intro}</p>
          {m.tabela && (
            <div className="overflow-x-auto mt-8 scrollbar-thin">
              <table className="w-full text-sm font-sans border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-y-2 rule-strong">
                    {m.tabela.cols.map((c) => <th key={c} className="text-left py-2 pr-4 kicker text-ink">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {m.tabela.linhas.map((l, i) => (
                    <tr key={i} className="border-b hairline align-top">
                      {l.map((c, j) => <td key={j} className={`py-2.5 pr-4 ${j === 0 ? 'font-serif text-base font-semibold' : ''}`}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {m.blocos?.map((b) => (
            <section key={b.titulo} className="mt-10">
              <h2 className="headline text-2xl">{b.titulo}</h2>
              <p className="prose-ed mt-2">{b.texto}</p>
              <ul className="mt-4 space-y-3">
                {b.exemplos.map(([pt, nota]) => (
                  <li key={pt} className="grid sm:grid-cols-2 gap-x-6 border-t hairline pt-2">
                    <span className="font-serif text-lg">{pt}</span>
                    <span className="text-sm text-muted">{nota}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-alerta">⚑ {b.alerta}</p>
            </section>
          ))}
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <NotaES>{m.notaES}</NotaES>
          <div className="border-t-2 border-ink pt-3">
            <Kicker cor="text-muted">Desafios deste módulo</Kicker>
            <ul className="mt-2">
              {ds.map((d) => (
                <li key={d.id} className="py-2 border-b hairline flex justify-between gap-2 text-sm">
                  <span className="font-serif">{d.titulo}</span>
                  <Chip>{d.tipo === 'clique' ? 'Caça ao erro' : d.tipo === 'escolha' ? 'Lacuna' : 'Registro'}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

function SessaoRadar({ desafios, titulo, onSair }) {
  const [i, setI] = useState(0);
  const [resultados, setResultados] = useState({});
  const fim = i >= desafios.length;
  const d = desafios[i];
  const certos = Object.values(resultados).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mt-8">
        {onSair ? <button onClick={onSair} className="btn-ghost"><ArrowLeft size={15} /> Voltar ao módulo</button> : <a href="#/laboratorio" className="btn-ghost"><ArrowLeft size={15} /> Laboratório</a>}
        <span className="kicker text-muted num">{Math.min(i + 1, desafios.length)} / {desafios.length}</span>
      </div>
      <div className="flex gap-0.5 mt-4" aria-hidden>
        {desafios.map((x, k) => (
          <span key={x.id} className={`h-1 flex-1 ${resultados[x.id] === true ? 'bg-selva' : resultados[x.id] === false ? 'bg-alerta' : k === i ? 'bg-ink' : 'bg-ink/15'}`} />
        ))}
      </div>
      <Kicker className="mt-8">Radar anti-portunhol · {titulo}</Kicker>

      {fim ? (
        <div className="py-16 text-center fade-up">
          <div className="headline text-8xl num">{certos}<span className="text-ink/30">/{desafios.length}</span></div>
          <p className="font-serif text-2xl italic mt-4">{certos === desafios.length ? 'Radar calibrado. Nenhuma interferência passou.' : certos >= desafios.length * 0.7 ? 'Bom faro. Os erros foram para o seu Caderno.' : 'O espanhol ainda fala alto. Revise o Caderno e tente de novo amanhã.'}</p>
          <div className="flex justify-center gap-3 mt-8">
            <button className="btn-line" onClick={() => { setI(0); setResultados({}); }}><RotateCcw size={15} /> Refazer</button>
            <a href="#/caderno" className="btn-ink">Abrir Caderno de Erros <ArrowRight size={15} /></a>
          </div>
        </div>
      ) : (
        <Desafio key={d.id} d={d} onResultado={(ok) => setResultados((r) => ({ ...r, [d.id]: ok }))} onProximo={() => setI((x) => x + 1)} />
      )}
    </div>
  );
}

// ——— Um desafio ———
function Desafio({ d, onResultado, onProximo }) {
  const { registrarDesafio, adicionarCaderno } = useStore();
  const [feito, setFeito] = useState(null); // true / false

  const concluir = (ok, itens = []) => {
    setFeito(ok);
    onResultado(ok);
    registrarDesafio(d.id, ok, null);
    if (!ok && itens.length) adicionarCaderno(itens);
  };

  return (
    <section className="mt-3 fade-up">
      <h2 className="headline text-4xl">{d.titulo}</h2>
      {d.contexto && <p className="font-serif italic text-muted mt-2">{d.contexto}</p>}
      <div className="mt-8">
        {d.tipo === 'clique' && <Clique d={d} feito={feito} onConcluir={concluir} />}
        {d.tipo === 'escolha' && <Escolha d={d} feito={feito} onConcluir={concluir} />}
        {d.tipo === 'registro' && <Registro d={d} feito={feito} onConcluir={concluir} />}
      </div>
      {feito !== null && (
        <div className="mt-8 fade-up">
          <NotaES>{d.es}</NotaES>
          <div className="flex justify-end mt-6">
            <button className="btn-ink" onClick={onProximo}>Próximo <ArrowRight size={15} /></button>
          </div>
        </div>
      )}
    </section>
  );
}

function parseFrase(frase) {
  const seg = [];
  const re = /\[\[(.+?)\|(.+?)\|(.+?)\]\]/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(frase)) !== null) {
    frase.slice(last, m.index).split(/(\s+)/).forEach((w) => w && seg.push({ t: w, erro: false, k: k++ }));
    seg.push({ t: m[1], correto: m[2], exp: m[3], erro: true, k: k++ });
    last = re.lastIndex;
  }
  frase.slice(last).split(/(\s+)/).forEach((w) => w && seg.push({ t: w, erro: false, k: k++ }));
  return seg;
}

function Clique({ d, feito, onConcluir }) {
  const seg = useMemo(() => parseFrase(d.frase), [d.frase]);
  const [sel, setSel] = useState(new Set());
  const erros = seg.filter((s) => s.erro);
  const alternar = (k) => { if (feito !== null) return; setSel((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; }); };
  const verificar = () => {
    const perdidos = erros.filter((e) => !sel.has(e.k));
    const falsos = seg.filter((s) => !s.erro && sel.has(s.k));
    const ok = perdidos.length === 0 && falsos.length === 0;
    const paraRevisar = perdidos.length ? perdidos : erros;
    onConcluir(ok, paraRevisar.map((e) => ({ chave: `radar:${d.id}:${e.k}`, origem: 'Radar', frente: e.t, resposta: e.correto, explicacao: e.exp, contexto: d.frase.replace(/\[\[(.+?)\|.+?\|.+?\]\]/g, '$1') })));
  };
  return (
    <div>
      <p className="kicker text-muted mb-3">Clique nas palavras que denunciam portunhol ({erros.length} {erros.length === 1 ? 'erro' : 'erros'}).</p>
      <p className="font-serif text-2xl sm:text-[1.7rem] leading-[1.9]">
        {seg.map((s) => {
          if (/^\s+$/.test(s.t)) return s.t;
          const marcado = sel.has(s.k);
          if (feito !== null && s.erro) {
            return (
              <span key={s.k} className="inline-block">
                <span className={`line-through decoration-2 ${marcado ? 'decoration-selva text-ink/50' : 'decoration-alerta text-alerta'}`}>{s.t}</span>{' '}
                <span className="text-selva font-semibold">{s.correto}</span>
              </span>
            );
          }
          if (feito !== null && marcado && !s.erro) return <span key={s.k} className="bg-alerta/15 px-0.5">{s.t}</span>;
          return (
            <button key={s.k} onClick={() => alternar(s.k)} className={`px-0.5 transition-colors ${marcado ? 'bg-ocre/25 underline decoration-ocre decoration-2 underline-offset-4' : 'hover:bg-ink/5'}`}>
              {s.t}
            </button>
          );
        })}
      </p>
      {feito === null ? (
        <button className="btn-ink mt-6" onClick={verificar} disabled={!sel.size}>Verificar</button>
      ) : (
        <div className="mt-6 space-y-3">
          <Veredito ok={feito} />
          {erros.map((e) => (
            <p key={e.k} className="text-sm border-l-2 border-selva pl-3"><strong className="font-serif text-base">{e.t} → {e.correto}.</strong> {e.exp}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function Escolha({ d, feito, onConcluir }) {
  const [escolha, setEscolha] = useState(null);
  const partes = d.frase.split('___');
  const responder = (i) => {
    if (feito !== null) return;
    setEscolha(i);
    const ok = i === d.correta;
    onConcluir(ok, ok ? [] : [{ chave: `radar:${d.id}`, origem: 'Radar', frente: d.frase.replace('___', '___'), resposta: d.opcoes[d.correta], explicacao: d.explicacao, contexto: `Você marcou: ${d.opcoes[i]}` }]);
  };
  return (
    <div>
      <p className="font-serif text-2xl sm:text-[1.7rem] leading-snug">
        {partes[0]}
        <span className={`inline-block min-w-[5ch] border-b-2 text-center px-1 ${feito === null ? 'border-ink' : feito ? 'border-selva text-selva' : 'border-alerta text-alerta'}`}>
          {escolha !== null ? d.opcoes[feito ? escolha : d.correta] : ' '}
        </span>
        {partes[1]}
      </p>
      <div className="grid sm:grid-cols-2 gap-2 mt-8 max-w-xl">
        {d.opcoes.map((o, i) => {
          const estado = feito === null ? '' : i === d.correta ? 'border-selva bg-selva/10' : i === escolha ? 'border-alerta bg-alerta/10 line-through' : 'opacity-50';
          return (
            <button key={o} onClick={() => responder(i)} disabled={feito !== null} className={`text-left border px-4 py-3 font-serif text-lg transition-colors hairline hover:border-ink ${estado}`}>
              <span className="font-mono text-xs text-muted mr-3">{String.fromCharCode(65 + i)}</span>{o}
            </button>
          );
        })}
      </div>
      {feito !== null && <div className="mt-6 space-y-2"><Veredito ok={feito} /><p className="text-sm border-l-2 border-selva pl-3">{d.explicacao}</p></div>}
    </div>
  );
}

function Registro({ d, feito, onConcluir }) {
  const [texto, setTexto] = useState('');
  const [res, setRes] = useState(null);
  const verificar = () => {
    const marcas = d.marcadores.map((m) => ({ ...m, ok: ure(m.re, 'iu').test(texto) }));
    const proib = d.proibidos.filter((p) => ure(p, 'iu').test(texto)).map((p) => p.replace(/\\b/g, ''));
    setRes({ marcas, proib });
    const ok = marcas.every((m) => m.ok) && proib.length === 0;
    onConcluir(ok, ok ? [] : [{ chave: `radar:${d.id}`, origem: 'Radar', frente: `Reescreva em registro formal: "${d.original}"`, resposta: d.modelo, explicacao: d.instrucao, contexto: '' }]);
  };
  return (
    <div>
      <p className="kicker text-muted">{d.instrucao}</p>
      <blockquote className="font-serif text-xl italic border-l-4 border-ink/20 pl-4 my-4">{d.original}</blockquote>
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} disabled={feito !== null} rows={8} className="field folha font-serif text-lg !leading-8 resize-y bg-paper2" placeholder="Escreva aqui a versão formal…" spellCheck lang="pt-BR" />
      {feito === null ? (
        <button className="btn-ink mt-4" onClick={verificar} disabled={texto.trim().length < 30}>Verificar registro</button>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 mt-6">
          <div>
            <Veredito ok={feito} />
            <ul className="mt-3 space-y-1 text-sm">
              {res.marcas.map((m) => <li key={m.rotulo} className="flex gap-2">{m.ok ? <Check size={16} className="text-selva" /> : <X size={16} className="text-alerta" />}{m.rotulo}</li>)}
              {res.proib.map((p) => <li key={p} className="flex gap-2 text-alerta"><X size={16} /> Marca informal: “{p}”</li>)}
            </ul>
          </div>
          <div className="border-t-2 border-ink pt-3">
            <Kicker cor="text-selva">Versão de referência</Kicker>
            <p className="font-serif whitespace-pre-line mt-2">{d.modelo}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Veredito({ ok }) {
  return ok
    ? <p className="flex items-center gap-2 font-sans font-semibold text-selva"><Check size={18} /> Isso! Português brasileiro sem sotaque escrito.</p>
    : <p className="flex items-center gap-2 font-sans font-semibold text-alerta"><X size={18} /> Quase. O item foi para o seu Caderno de Erros.</p>;
}
