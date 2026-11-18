import { useMemo, useState } from 'react';
import { Check, RotateCcw, Trash2, Eye } from 'lucide-react';
import { useStore, hoje, INTERVALOS } from '../lib/store.jsx';
import { Cabecalho, Kicker, Rule, Chip, NotaES } from '../components/ui.jsx';

export default function Caderno() {
  const { estado, revisarItem, removerItem } = useStore();
  const pendentes = useMemo(() => estado.caderno.filter((i) => i.proxima <= hoje()).sort((a, b) => a.caixa - b.caixa), [estado.caderno]);
  const [revelado, setRevelado] = useState(false);
  const [feitosHoje, setFeitosHoje] = useState(0);
  const atual = pendentes[0];

  const responder = (lembrou) => {
    revisarItem(atual.chave, lembrou);
    setRevelado(false);
    setFeitosHoje((n) => n + 1);
  };

  const porCaixa = INTERVALOS.map((_, i) => estado.caderno.filter((it) => it.caixa === i).length);
  const recorrentes = [...estado.caderno].sort((a, b) => (b.ocorrencias || 1) - (a.ocorrencias || 1)).filter((i) => (i.ocorrencias || 1) > 1).slice(0, 6);

  return (
    <div>
      <Cabecalho
        kicker="Pilar 05 · Repetição espaçada"
        titulo="Caderno de Erros Recorrentes"
        linhaFina="Cada erro do radar ou das suas redações vira um cartão. Acertou? Ele volta daqui a mais dias. Errou? Volta amanhã."
      >
        <div className="text-sm text-muted">
          <span className="headline text-5xl text-ink num">{pendentes.length}</span> para hoje · {estado.caderno.length} no total
        </div>
      </Cabecalho>

      <div className="grid lg:grid-cols-12 gap-10">
        <section className="lg:col-span-7">
          {!atual ? (
            <div className="py-12">
              <h2 className="headline text-4xl">{estado.caderno.length ? 'Revisão do dia concluída.' : 'Seu caderno está em branco.'}</h2>
              <p className="font-serif text-xl italic text-muted mt-3">
                {estado.caderno.length
                  ? `Você revisou ${feitosHoje} cartão(ões) nesta sessão. Volte amanhã para manter a sequência.`
                  : 'Erre sem medo no Laboratório e na Oficina: é daqui que vem o seu progresso.'}
              </p>
              <div className="flex gap-2 mt-6">
                <a href="#/laboratorio/radar" className="btn-ink">Ir ao Radar</a>
                <a href="#/oficina" className="btn-line">Ir à Oficina</a>
              </div>
            </div>
          ) : (
            <div className="border-2 rule-strong p-6 sm:p-10 bg-paper2 fade-up" key={atual.chave + feitosHoje}>
              <div className="flex justify-between items-center">
                <Chip cor={atual.origem === 'Radar' ? 'petroleo' : 'ocre'}>{atual.origem}</Chip>
                <span className="kicker text-muted num">Caixa {atual.caixa} · visto {atual.ocorrencias || 1}×</span>
              </div>
              <p className="kicker text-muted mt-8">Como se escreve em português do Brasil?</p>
              <p className="headline text-4xl sm:text-5xl mt-3 break-words">{atual.frente}</p>
              {atual.contexto && <p className="font-serif italic text-muted mt-4">“{atual.contexto}”</p>}
              {!revelado ? (
                <button className="btn-ink mt-10" onClick={() => setRevelado(true)}><Eye size={15} /> Mostrar resposta</button>
              ) : (
                <div className="mt-8 fade-up">
                  <Rule />
                  <p className="font-serif text-2xl text-selva font-semibold mt-6 whitespace-pre-line">{atual.resposta}</p>
                  <p className="text-sm mt-2">{atual.explicacao}</p>
                  <div className="flex flex-wrap gap-2 mt-8">
                    <button className="btn-line" onClick={() => responder(false)}><RotateCcw size={15} /> Errei — rever amanhã</button>
                    <button className="btn-ink" onClick={() => responder(true)}><Check size={15} /> Acertei — espaçar</button>
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-muted mt-3 num">{Math.max(0, pendentes.length - (atual ? 1 : 0))} restante(s) depois deste.</p>
        </section>

        <aside className="lg:col-span-5 space-y-8">
          <div className="border-t-2 border-ink pt-3">
            <Kicker cor="text-muted">Caixas de Leitner</Kicker>
            <div className="flex items-end gap-2 h-24 mt-3">
              {porCaixa.slice(1).map((n, i) => {
                const max = Math.max(1, ...porCaixa);
                return (
                  <div key={i} className="flex-1 text-center">
                    <div className="bg-selva/80 mx-auto w-full" style={{ height: `${(n / max) * 72}px`, opacity: 0.35 + i * 0.13 }} />
                    <div className="font-mono text-xs mt-1 num">{n}</div>
                    <div className="text-[10px] text-muted">{INTERVALOS[i + 1]}d</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted mt-2">Cada acerto move o cartão para a caixa seguinte (intervalos de 1, 3, 7, 14 e 30 dias).</p>
          </div>
          {recorrentes.length > 0 && (
            <div className="border-t-2 border-alerta pt-3">
              <Kicker cor="text-alerta">Seus erros mais teimosos</Kicker>
              <ul className="mt-2 space-y-1">
                {recorrentes.map((r) => <li key={r.chave} className="font-serif flex justify-between"><span><span className="line-through decoration-alerta">{r.frente}</span> → {r.resposta.split('\n')[0].slice(0, 40)}</span><span className="font-mono text-xs num">{r.ocorrencias}×</span></li>)}
              </ul>
            </div>
          )}
          <div className="border-t hairline pt-3">
            <Kicker cor="text-muted">Todos os cartões</Kicker>
            <ul className="mt-2 max-h-96 overflow-y-auto scrollbar-thin divide-y divide-ink/10">
              {estado.caderno.map((it) => (
                <li key={it.chave} className="py-2 flex items-center gap-3 text-sm">
                  <span className="font-mono text-[10px] text-muted w-6 num">C{it.caixa}</span>
                  <span className="flex-1 font-serif truncate">{it.frente.length > 60 ? it.frente.slice(0, 60) + '…' : it.frente}</span>
                  <span className="text-xs text-muted num">{it.proxima <= hoje() ? 'hoje' : it.proxima.slice(5).split('-').reverse().join('/')}</span>
                  <button onClick={() => removerItem(it.chave)} className="btn-ghost" aria-label="Remover cartão"><Trash2 size={13} /></button>
                </li>
              ))}
              {!estado.caderno.length && <li className="py-2 text-sm text-muted italic">Nenhum cartão ainda.</li>}
            </ul>
          </div>
          <NotaES>
            La repetición espaciada funciona mejor con sesiones cortas y diarias que con maratones. Cinco minutos al día mantienen tu racha y fijan los falsos amigos para siempre.
          </NotaES>
        </aside>
      </div>
    </div>
  );
}
