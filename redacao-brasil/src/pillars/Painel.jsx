import { ArrowRight, Flame, BookOpen, Radar, PenLine, Mic, NotebookPen } from 'lucide-react';
import { useStore, nivelEstimado, nivelDe, NIVEIS, hoje } from '../lib/store.jsx';
import { GENEROS } from '../data/generos.js';
import { DESAFIOS } from '../data/laboratorio.js';
import { TAREFAS } from '../data/tarefas.js';
import { ELEMENTOS } from '../data/oral.js';
import { Kicker, Rule, NotaES } from '../components/ui.jsx';

const fmt = (n) => n.toFixed(2).replace('.', ',');

function Regua({ nivel }) {
  const pct = (v) => `${(v / 5) * 100}%`;
  return (
    <div className="pt-8 pb-2" aria-label={`Nível estimado ${nivel ? fmt(nivel) : 'indefinido'} numa escala de 0 a 5`}>
      <div className="relative h-14">
        {NIVEIS.map((l, i) => (
          <div key={l.nome} className={`absolute top-6 h-3 ${['bg-ink/10', 'bg-petroleo/25', 'bg-petroleo/45', 'bg-selva/60', 'bg-selva'][i]}`} style={{ left: pct(l.min), width: pct(Math.min(5, l.max + 0.01) - l.min) }} />
        ))}
        {[{ v: 2, r: 'Certificação' }, { v: 4, r: 'Meta' }].map((m) => (
          <div key={m.v} className="absolute top-0 h-12 border-l border-dashed border-ink/60" style={{ left: pct(m.v) }}>
            <span className="kicker text-[9px] text-muted absolute -top-1 left-1 whitespace-nowrap">{m.r} · {m.v.toFixed(1).replace('.', ',')}</span>
          </div>
        ))}
        {nivel != null && (
          <div className="absolute top-3 -translate-x-1/2 transition-all duration-700" style={{ left: pct(nivel) }}>
            <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-ocre mx-auto" />
            <div className="w-[2px] h-6 bg-ocre mx-auto" />
          </div>
        )}
      </div>
      <div className="relative h-8 font-sans text-[10px] text-muted">
        {NIVEIS.map((l) => (
          <span key={l.nome} className="absolute top-0 leading-tight hidden sm:block" style={{ left: pct(l.min) }}>{l.nome}</span>
        ))}
        <span className="absolute right-0 top-4 num sm:hidden">0 — 5</span>
      </div>
    </div>
  );
}

function Calendario({ atividade }) {
  const dias = [];
  const base = new Date(hoje() + 'T12:00:00');
  for (let i = 55; i >= 0; i--) {
    const d = new Date(base); d.setDate(d.getDate() - i);
    const iso = d.toLocaleDateString('sv-SE');
    dias.push({ iso, n: atividade[iso] || 0 });
  }
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-max" aria-label="Atividade nas últimas 8 semanas">
      {dias.map((d) => (
        <div key={d.iso} title={`${d.iso}: ${d.n} atividade(s)`} className={`w-3 h-3 ${d.n === 0 ? 'bg-ink/[0.07]' : d.n < 3 ? 'bg-selva/40' : d.n < 6 ? 'bg-selva/70' : 'bg-selva'}`} />
      ))}
    </div>
  );
}

export default function Painel() {
  const { estado } = useStore();
  const nivel = nivelEstimado(estado.notas);
  const nv = nivel != null ? nivelDe(nivel) : null;
  const pendentes = estado.caderno.filter((i) => i.proxima <= hoje()).length;
  const radarFeitos = Object.keys(estado.radar).length;
  const tarefasFeitas = new Set(estado.notas.map((n) => n.tarefaId)).size;
  const oralFeitos = Object.keys(estado.oral).length;
  const generosDet = GENEROS.filter((g) => !g.compacto);

  // Próximo passo recomendado
  let proximo;
  if (pendentes > 0) proximo = { href: '#/caderno', kicker: 'Revisão espaçada', titulo: `Você tem ${pendentes} ${pendentes === 1 ? 'erro' : 'erros'} para revisar hoje`, texto: 'Revisar no dia certo é o que transforma correção em memória. Leva menos de cinco minutos.' };
  else if (estado.generosVistos.length < 2) proximo = { href: '#/academia/carta-leitor', kicker: 'Comece pela base', titulo: 'Entenda a anatomia de uma Carta do Leitor', texto: 'No Celpe-Bras, errar o gênero derruba a nota mesmo com português impecável. Comece pelo gênero mais cobrado.' };
  else if (radarFeitos < 6) proximo = { href: '#/laboratorio', kicker: 'Radar anti-portunhol', titulo: 'Cace as interferências do espanhol', texto: 'Os desafios do radar mostram, em contexto, os erros que o avaliador percebe primeiro.' };
  else if (tarefasFeitas < TAREFAS.length) {
    const t = TAREFAS.find((x) => !estado.notas.some((n) => n.tarefaId === x.id));
    proximo = { href: `#/oficina/${t.id}`, kicker: `Tarefa ${t.numero} · ${t.tipo}`, titulo: t.titulo, texto: 'Hora de integrar: compreender a fonte e produzir um texto com propósito e interlocutor claros.' };
  } else if (oralFeitos < ELEMENTOS.length) proximo = { href: '#/oral', kicker: 'Parte oral', titulo: 'Simule os 20 minutos de conversa', texto: 'Treine em voz alta com os elementos provocadores e grave suas respostas.' };
  else proximo = { href: '#/oficina', kicker: 'Consolidação', titulo: 'Reescreva sua tarefa com pior nota', texto: 'Reescrever com base no feedback é o exercício de maior retorno nesta fase.' };

  const percurso = [
    { n: '01', icone: BookOpen, titulo: 'Academia de Gêneros', desc: 'Anatomia, registro e chaves discursivas dos gêneros mais cobrados.', prog: `${estado.generosVistos.length}/${GENEROS.length} gêneros lidos`, href: '#/academia' },
    { n: '02', icone: Radar, titulo: 'Laboratório & Radar', desc: 'Falsos cognatos, regência, subjuntivo e conectores — em contexto.', prog: `${radarFeitos}/${DESAFIOS.length} desafios`, href: '#/laboratorio' },
    { n: '03', icone: PenLine, titulo: 'Oficina de Tarefas', desc: 'As 4 tarefas integradas, com fonte, cronômetro e consigna.', prog: `${tarefasFeitas}/${TAREFAS.length} tarefas avaliadas`, href: '#/oficina' },
    { n: '04', icone: Mic, titulo: 'Parte Oral', desc: 'Conversa inicial e 3 elementos provocadores com roteiro do avaliador.', prog: `${oralFeitos}/${ELEMENTOS.length} elementos`, href: '#/oral' },
    { n: '05', icone: NotebookPen, titulo: 'Caderno de Erros', desc: 'Repetição espaçada dos erros que você cometeu.', prog: `${estado.caderno.length} itens · ${pendentes} hoje`, href: '#/caderno' },
  ];

  return (
    <div className="fade-up">
      {/* Manchete */}
      <section className="grid lg:grid-cols-12 gap-x-10 pt-10">
        <div className="lg:col-span-8">
          <Kicker>{proximo.kicker} · Sua próxima leitura</Kicker>
          <a href={proximo.href} className="group block mt-3">
            <h1 className="headline text-4xl sm:text-5xl lg:text-[4.2rem] group-hover:text-selva transition-colors">{proximo.titulo}</h1>
            <p className="font-serif text-xl text-muted mt-4 max-w-2xl italic leading-snug">{proximo.texto}</p>
            <span className="inline-flex items-center gap-2 mt-6 font-sans text-sm font-semibold border-b-2 border-ink pb-0.5 group-hover:gap-3 transition-all">Começar agora <ArrowRight size={16} /></span>
          </a>
        </div>
        <aside className="lg:col-span-4 mt-10 lg:mt-0 lg:border-l hairline lg:pl-8">
          <Kicker cor="text-muted">Racha de imersão</Kicker>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="headline text-6xl num">{estado.sequencia.atual}</span>
            <span className="font-serif italic text-muted">{estado.sequencia.atual === 1 ? 'dia seguido' : 'dias seguidos'}</span>
            <Flame className={estado.sequencia.atual ? 'text-ocre' : 'text-muted'} size={22} />
          </div>
          <p className="text-xs text-muted mt-1 mb-4">Recorde: {estado.sequencia.melhor} {estado.sequencia.melhor === 1 ? 'dia' : 'dias'}</p>
          <Calendario atividade={estado.atividade} />
        </aside>
      </section>

      <Rule forte className="mt-12" />

      {/* Nível */}
      <section className="grid lg:grid-cols-12 gap-x-10 py-8">
        <div className="lg:col-span-4">
          <Kicker cor="text-muted">Nível estimado Celpe-Bras</Kicker>
          {nivel != null ? (
            <>
              <div className="headline text-7xl num mt-2">{fmt(nivel)}</div>
              <div className="font-serif text-2xl italic text-selva">{nv.nome}</div>
              <p className="text-sm text-muted mt-3 leading-relaxed">Média ponderada das suas últimas {Math.min(6, estado.notas.length)} avaliações (as recentes pesam mais). É uma estimativa de treino, não uma previsão da nota oficial.</p>
            </>
          ) : (
            <>
              <div className="headline text-7xl text-muted/40 mt-2">—</div>
              <p className="text-sm text-muted mt-3 leading-relaxed">Faça e avalie uma tarefa na Oficina para estimar seu nível.</p>
            </>
          )}
        </div>
        <div className="lg:col-span-8">
          <Regua nivel={nivel} />
          {estado.notas.length > 1 && (
            <div className="mt-4">
              <Kicker cor="text-muted" className="mb-2">Histórico</Kicker>
              <div className="flex items-end gap-1 h-20">
                {estado.notas.slice(-24).map((n) => (
                  <div key={n.id} className="flex-1 max-w-6 group relative" title={`${TAREFAS.find((t) => t.id === n.tarefaId)?.titulo || ''} · ${fmt(n.nota)} · ${n.fonte}`}>
                    <div className={`${n.fonte === 'ia' ? 'bg-petroleo' : 'bg-ink/70'}`} style={{ height: `${(n.nota / 5) * 80}px` }} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted mt-2"><span className="inline-block w-2 h-2 bg-ink/70 mr-1" />estimativa automática <span className="inline-block w-2 h-2 bg-petroleo ml-3 mr-1" />avaliação IA</p>
            </div>
          )}
        </div>
      </section>

      <Rule forte />

      {/* Percurso */}
      <section className="py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="headline text-3xl">O percurso em cinco cadernos</h2>
          <span className="kicker text-muted hidden sm:block">Da teoria à certificação</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 mt-6 border-t hairline">
          {percurso.map((p) => (
            <a key={p.n} href={p.href} className="group py-5 lg:px-5 first:lg:pl-0 lg:border-l first:lg:border-l-0 border-b lg:border-b-0 hairline block">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ocre">{p.n}</span>
                <p.icone size={18} className="text-muted group-hover:text-selva transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-semibold mt-3 group-hover:text-selva transition-colors">{p.titulo}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{p.desc}</p>
              <p className="kicker text-ink/70 mt-4 num">{p.prog}</p>
            </a>
          ))}
        </div>
      </section>

      <Rule forte />

      {/* Sobre o exame */}
      <section className="grid lg:grid-cols-12 gap-10 py-8">
        <div className="lg:col-span-4">
          <Kicker>Guia rápido</Kicker>
          <h2 className="headline text-3xl mt-2">Como o Celpe-Bras avalia</h2>
          <p className="font-serif italic text-muted mt-3">O exame não pergunta regras de gramática: ele observa se você <strong className="not-italic text-ink">age</strong> em português — com um propósito, para alguém, num gênero reconhecível.</p>
        </div>
        <div className="lg:col-span-8 grid md:grid-cols-2 gap-x-10 gap-y-6 prose-ed text-base">
          <div>
            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider mb-2">Parte escrita</h3>
            <p className="dropcap">Quatro tarefas integradas: a primeira parte de um vídeo, a segunda de um áudio e as duas últimas de textos escritos. Em cada uma, você compreende a fonte e produz um texto com enunciador, interlocutor e propósito definidos pela consigna.</p>
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider mb-2">Parte oral</h3>
            <p>Cerca de 20 minutos de interação face a face: uma conversa inicial a partir do questionário de inscrição e, depois, conversas sobre elementos provocadores (imagens, capas, cartazes), conduzidas pelo avaliador com um roteiro de perguntas.</p>
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider mb-2">Níveis</h3>
            <p>Intermediário, Intermediário Superior, Avançado e Avançado Superior, numa escala de 0 a 5. Abaixo de 2,0 não há certificação. As faixas usadas aqui seguem a documentação pública do Inep consultada para o projeto; confirme no edital vigente.</p>
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider mb-2">A regra de ouro</h3>
            <p>Cumprir o propósito vale mais que exibir vocabulário. Um e-mail simples e adequado supera um texto rebuscado que ignora o interlocutor.</p>
          </div>
          <NotaES className="md:col-span-2">
            El examen premia la adecuación, no la erudición. Muchos hispanohablantes con muy buen nivel de lectura obtienen notas bajas porque escriben "redacciones escolares" en lugar del género pedido, o porque copian frases de la fuente.
          </NotaES>
        </div>
      </section>
    </div>
  );
}
