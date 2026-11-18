import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Shuffle, AlertTriangle, ArrowRight } from 'lucide-react';
import { GENEROS } from '../data/generos.js';
import { TAREFAS } from '../data/tarefas.js';
import { useStore } from '../lib/store.jsx';
import { Cabecalho, Kicker, Rule, NotaES, Chip, Copiar } from '../components/ui.jsx';

export default function Academia({ id }) {
  const g = GENEROS.find((x) => x.id === id);
  return g ? <FichaGenero g={g} /> : <Indice />;
}

function Indice() {
  const { estado } = useStore();
  const familias = [...new Set(GENEROS.map((g) => g.familia))];
  return (
    <div>
      <Cabecalho
        kicker="Pilar 01 · A base teórica"
        titulo="Academia de Gêneros Textuais"
        linhaFina="No Celpe-Bras, o gênero é o contrato com o leitor. Antes de escrever bem, é preciso escrever o texto certo."
      >
        <div className="text-sm text-muted max-w-xs">
          <span className="headline text-4xl text-ink num">{estado.generosVistos.length}</span>/{GENEROS.length} fichas lidas.
          Seis fichas trazem exemplo anotado e exercício de montagem; as demais, estrutura e chaves.
        </div>
      </Cabecalho>
      <div className="columns-1 md:columns-2 xl:columns-3 gap-10 [column-rule:1px_solid_rgb(var(--rule)/0.15)]">
        {familias.map((f) => (
          <section key={f} className="break-inside-avoid mb-10">
            <Kicker className="mb-4">{f}</Kicker>
            {GENEROS.filter((g) => g.familia === f).map((g) => {
              const lido = estado.generosVistos.includes(g.id);
              const idx = GENEROS.indexOf(g) + 1;
              return (
                <a key={g.id} href={`#/academia/${g.id}`} className="group block py-4 border-t hairline">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-muted num">{String(idx).padStart(2, '0')}</span>
                    <h3 className="font-serif text-2xl font-semibold group-hover:text-selva transition-colors flex-1">{g.nome}</h3>
                    {lido && <Check size={16} className="text-selva" aria-label="lido" />}
                  </div>
                  <p className="font-serif text-[0.98rem] text-ink/80 mt-1.5 pl-8 leading-snug">{g.resumo}</p>
                  <div className="pl-8 mt-2 flex gap-2 flex-wrap">
                    <Chip cor={g.frequencia.startsWith('alt') ? 'ocre' : 'ink'}>Frequência {g.frequencia}</Chip>
                    {!g.compacto && <Chip cor="selva">Exemplo anotado</Chip>}
                  </div>
                </a>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

function FichaGenero({ g }) {
  const { marcarGenero, praticar } = useStore();
  useEffect(() => { marcarGenero(g.id); }, [g.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [ativo, setAtivo] = useState(0);
  const idx = GENEROS.indexOf(g);
  const prox = GENEROS[(idx + 1) % GENEROS.length];
  const tarefasRel = TAREFAS.filter((t) => t.generoId === g.id);

  return (
    <article>
      <a href="#/academia" className="btn-ghost mt-8"><ArrowLeft size={15} /> Todos os gêneros</a>
      <Cabecalho kicker={`${g.familia} · Frequência ${g.frequencia}`} titulo={g.nome} linhaFina={g.resumo} />

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Coluna de ficha técnica */}
        <aside className="lg:col-span-3 lg:sticky lg:top-6 self-start space-y-6">
          <div>
            <Kicker cor="text-muted">No exame</Kicker>
            <p className="font-serif mt-2 leading-snug">{g.noExame}</p>
          </div>
          <Rule />
          <dl className="space-y-3 text-sm">
            <div><dt className="kicker text-muted">Registro</dt><dd className="mt-1">{g.registro.nivel}</dd></div>
            <div><dt className="kicker text-muted">Tom</dt><dd className="mt-1">{g.registro.tom}</dd></div>
            <div><dt className="kicker text-muted">Pessoa</dt><dd className="mt-1">{g.registro.pessoa}</dd></div>
            <div>
              <dt className="kicker text-alerta">Evite</dt>
              <dd className="mt-1"><ul className="space-y-1">{g.registro.evitar.map((e) => <li key={e}>— {e}</li>)}</ul></dd>
            </div>
          </dl>
          {tarefasRel.length > 0 && (
            <>
              <Rule />
              <div>
                <Kicker cor="text-muted">Pratique na Oficina</Kicker>
                {tarefasRel.map((t) => (
                  <a key={t.id} href={`#/oficina/${t.id}`} className="block mt-2 font-serif hover:text-selva">Tarefa {t.numero}: {t.titulo} →</a>
                ))}
              </div>
            </>
          )}
        </aside>

        <div className="lg:col-span-9 space-y-14">
          {/* Anatomia */}
          <section>
            <h2 className="headline text-3xl mb-6">Anatomia do gênero</h2>
            <ol className="border-l-2 border-ink/80 ml-3">
              {g.anatomia.map((a, i) => (
                <li key={a.parte} className="relative pl-8 pb-7 last:pb-0">
                  <span className="absolute -left-[13px] top-0 w-6 h-6 bg-paper border-2 border-ink font-mono text-[11px] flex items-center justify-center num">{i + 1}</span>
                  <div className="grid md:grid-cols-12 gap-x-6 gap-y-1">
                    <div className="md:col-span-4">
                      <h3 className="font-sans font-semibold">{a.parte}</h3>
                      <p className="text-sm text-muted mt-0.5">{a.funcao}</p>
                    </div>
                    <div className="md:col-span-8">
                      {a.exemplo && <p className="font-serif italic text-[1.05rem] whitespace-pre-line">“{a.exemplo}”</p>}
                      {a.dica && <p className="text-sm text-selva mt-1">↳ {a.dica}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Chaves discursivas */}
          <section>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
              <h2 className="headline text-3xl">Chaves discursivas</h2>
              <span className="text-sm text-muted">Clique numa expressão para copiá-la.</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {g.chaves.map((c) => (
                <div key={c.funcao} className="border-t-2 border-ink pt-3">
                  <Kicker cor="text-ocre">{c.funcao}</Kicker>
                  <ul className="mt-2 space-y-1.5">
                    {c.frases.map((f) => (
                      <li key={f}><Copiar texto={f} rotulo={f} className="text-left font-serif text-[1.05rem] hover:text-selva hover:underline decoration-ocre underline-offset-4" /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Exemplo anotado */}
          {g.exemplo && (
            <section>
              <h2 className="headline text-3xl">Exemplo anotado</h2>
              <p className="text-sm text-muted mt-2 mb-1">Passe o cursor (ou toque) em cada parágrafo para ler a nota do examinador.</p>
              <div className="border-l-4 border-ocre pl-4 my-6">
                <Kicker cor="text-ocre">Consigna</Kicker>
                <p className="font-serif italic mt-1">{g.exemplo.consigna}</p>
              </div>
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7 bg-paper2 p-6 sm:p-8 folha font-serif text-[1.06rem]">
                  {g.exemplo.paragrafos.map((p, i) => (
                    <p
                      key={i}
                      tabIndex={0}
                      onMouseEnter={() => setAtivo(i)}
                      onFocus={() => setAtivo(i)}
                      onClick={() => setAtivo(i)}
                      className={`whitespace-pre-line mb-4 cursor-help transition-colors outline-none ${ativo === i ? 'bg-ocre/15 -mx-2 px-2' : ''}`}
                    >
                      {p.texto}
                    </p>
                  ))}
                </div>
                <div className="md:col-span-5">
                  <div className="md:sticky md:top-6 border-t-2 border-ink pt-3" aria-live="polite">
                    <Kicker cor="text-selva">Nota do examinador · {g.exemplo.paragrafos[ativo].parte}</Kicker>
                    <p className="font-serif text-lg leading-snug mt-3">{g.exemplo.paragrafos[ativo].rubrica}</p>
                    <div className="flex gap-1 mt-6">
                      {g.exemplo.paragrafos.map((_, i) => (
                        <button key={i} onClick={() => setAtivo(i)} className={`h-1.5 flex-1 ${i === ativo ? 'bg-ink' : 'bg-ink/15'}`} aria-label={`Parágrafo ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {g.exemplo && <Montagem g={g} onConcluir={praticar} />}

          {g.armadilhas && (
            <section>
              <h2 className="headline text-3xl mb-4">Armadilhas que custam pontos</h2>
              <ul className="space-y-3">
                {g.armadilhas.map((a) => (
                  <li key={a} className="flex gap-3 font-serif text-lg"><AlertTriangle size={18} className="text-alerta shrink-0 mt-1" />{a}</li>
                ))}
              </ul>
            </section>
          )}

          <NotaES>{g.notaES}</NotaES>

          <Rule forte />
          <a href={`#/academia/${prox.id}`} className="group flex items-center justify-between py-2">
            <span><Kicker cor="text-muted">Próximo gênero</Kicker><span className="headline text-2xl group-hover:text-selva">{prox.nome}</span></span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
}

// Exercício: reordenar os parágrafos do exemplo clicando na sequência correta
function Montagem({ g, onConcluir }) {
  const partes = g.exemplo.paragrafos;
  const embaralhar = () => partes.map((p, i) => ({ ...p, i })).sort(() => Math.random() - 0.5);
  const [pool, setPool] = useState(embaralhar);
  const [ordem, setOrdem] = useState([]);
  const [erro, setErro] = useState(null);
  const pronto = ordem.length === partes.length;

  const escolher = (item) => {
    if (item.i === ordem.length) {
      setOrdem((o) => [...o, item]);
      setPool((p) => p.filter((x) => x.i !== item.i));
      setErro(null);
      if (ordem.length + 1 === partes.length) onConcluir();
    } else {
      setErro(item.i);
      setTimeout(() => setErro(null), 700);
    }
  };
  const reiniciar = () => { setPool(embaralhar()); setOrdem([]); };
  const preview = (t) => (t.length > 120 ? t.slice(0, 120) + '…' : t);
  const resumo = useMemo(() => partes.map((p) => p.parte).join(' → '), [partes]);

  return (
    <section>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="headline text-3xl">Exercício: monte o texto</h2>
        <button onClick={reiniciar} className="btn-ghost"><Shuffle size={15} /> Embaralhar</button>
      </div>
      <p className="text-sm text-muted mt-2">Clique nos fragmentos na ordem em que devem aparecer. Você está treinando o "esqueleto" do gênero.</p>
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div>
          <Kicker cor="text-muted" className="mb-2">Fragmentos</Kicker>
          <div className="space-y-2">
            {pool.map((p) => (
              <button
                key={p.i}
                onClick={() => escolher(p)}
                className={`w-full text-left font-serif text-[0.98rem] border px-3 py-2 transition-colors ${erro === p.i ? 'border-alerta bg-alerta/10' : 'hairline hover:border-ink'}`}
              >
                {preview(p.texto)}
              </button>
            ))}
            {pronto && <p className="text-selva font-sans text-sm flex items-center gap-2"><Check size={16} /> Estrutura completa! {resumo}</p>}
          </div>
        </div>
        <div>
          <Kicker cor="text-muted" className="mb-2">Seu texto</Kicker>
          <ol className="space-y-2">
            {ordem.map((p, n) => (
              <li key={p.i} className="flex gap-3 fade-up">
                <span className="font-mono text-xs text-ocre w-5 pt-1 num">{n + 1}</span>
                <div><span className="kicker text-selva">{p.parte}</span><p className="font-serif text-[0.98rem] whitespace-pre-line">{preview(p.texto)}</p></div>
              </li>
            ))}
            {!ordem.length && <li className="text-sm text-muted italic">Comece pelo primeiro elemento do gênero.</li>}
          </ol>
        </div>
      </div>
    </section>
  );
}
