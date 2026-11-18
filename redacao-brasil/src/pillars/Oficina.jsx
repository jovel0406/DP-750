import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Send, Radar, Compass, Maximize2, Minimize2, NotebookPen } from 'lucide-react';
import { TAREFAS } from '../data/tarefas.js';
import { GENEROS } from '../data/generos.js';
import { useStore } from '../lib/store.jsx';
import { avaliar, contarPalavras, contarParagrafos, conectoresUsados, detectarPortunhol } from '../lib/avaliador.js';
import { Cabecalho, Kicker, Rule, Chip, Cronometro, useCronometro, NotaES } from '../components/ui.jsx';
import { FonteVideo, FonteAudio, FonteTexto, FonteInfografico } from '../components/Fontes.jsx';
import Avaliacao from '../components/Avaliacao.jsx';

const fmt = (n) => n.toFixed(2).replace('.', ',');

export default function Oficina({ id }) {
  const t = TAREFAS.find((x) => x.id === id);
  return t ? <Bancada t={t} /> : <Indice />;
}

function Indice() {
  const { estado } = useStore();
  return (
    <div>
      <Cabecalho
        kicker="Pilar 03 · As quatro tarefas escritas"
        titulo="Oficina de Tarefas Integradoras"
        linhaFina="Compreender, decidir quem fala com quem e para quê — e só então escrever. Cada tarefa reproduz o formato do exame com material inédito."
      />
      <div className="grid md:grid-cols-2 gap-x-12">
        {TAREFAS.map((t) => {
          const notas = estado.notas.filter((n) => n.tarefaId === t.id);
          const melhor = notas.length ? Math.max(...notas.map((n) => n.nota)) : null;
          const g = GENEROS.find((x) => x.id === t.generoId);
          return (
            <a key={t.id} href={`#/oficina/${t.id}`} className="group block border-t-2 rule-strong pt-4 pb-10">
              <div className="flex items-baseline justify-between">
                <Kicker>Tarefa {t.numero} · {t.tipo}</Kicker>
                {melhor != null && <span className="font-mono text-sm num text-selva">melhor: {fmt(melhor)}</span>}
              </div>
              <h2 className="headline text-4xl mt-3 group-hover:text-selva transition-colors">{t.titulo}</h2>
              <p className="font-serif text-lg text-ink/80 mt-3 leading-snug line-clamp-3">{t.consigna}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Chip cor="petroleo">{g?.nome}</Chip>
                <Chip>{t.fonte.veiculo.split('—')[0].trim()}</Chip>
                {notas.length > 0 && <Chip cor="selva">{notas.length} tentativa(s)</Chip>}
              </div>
            </a>
          );
        })}
      </div>
      <NotaES className="max-w-3xl">
        En el examen real las cuatro tareas comparten un tiempo total de la parte escrita; aquí puedes elegir el tiempo de cada una. Entrena primero sin reloj y, cuando domines el género, activa el cronómetro.
      </NotaES>
    </div>
  );
}

function Bancada({ t }) {
  const { estado, salvarRascunho, salvarPlano, registrarNota, adicionarCaderno } = useStore();
  const [texto, setTexto] = useState(estado.rascunhos[t.id] || '');
  const [minutos, setMinutos] = useState(45);
  const c = useCronometro(minutos);
  const [resultado, setResultado] = useState(null);
  const [textoAvaliado, setTextoAvaliado] = useState('');
  const [radarVivo, setRadarVivo] = useState(false);
  const [foco, setFoco] = useState(false);
  const [aba, setAba] = useState('fonte'); // mobile
  const [checks, setChecks] = useState({});
  const [notas, setNotas] = useState('');
  const genero = GENEROS.find((g) => g.id === t.generoId);

  useEffect(() => { const h = setTimeout(() => salvarRascunho(t.id, texto), 500); return () => clearTimeout(h); }, [texto]); // eslint-disable-line

  const palavras = contarPalavras(texto);
  const paragrafos = contarParagrafos(texto);
  const conectores = useMemo(() => conectoresUsados(texto), [texto]);
  const alertas = useMemo(() => (radarVivo ? detectarPortunhol(texto) : []), [texto, radarVivo]);
  const pctExt = Math.min(100, (palavras / t.extensao.max) * 100);

  const entregar = () => {
    const r = avaliar(texto, t);
    setResultado(r);
    setTextoAvaliado(texto);
    c.zerar();
    registrarNota({ tarefaId: t.id, nota: r.final, fonte: 'estimativa', criterios: r.criterios.map((x) => x.nota) });
    if (r.portunhol.length) {
      adicionarCaderno(r.portunhol.map((p) => ({
        chave: `red:${p.trecho.toLowerCase()}`, origem: 'Redação', frente: p.trecho, resposta: p.sug, explicacao: p.exp, contexto: p.frase,
      })));
    }
    setTimeout(() => document.getElementById('avaliacao')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const Fonte = { video: FonteVideo, audio: FonteAudio, texto: FonteTexto, infografico: FonteInfografico }[t.fonte.tipo];

  return (
    <div>
      <div className="flex items-center justify-between mt-8 gap-4 flex-wrap">
        <a href="#/oficina" className="btn-ghost"><ArrowLeft size={15} /> Todas as tarefas</a>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-xs text-muted flex items-center gap-2">
            Tempo
            <select className="field !w-auto !py-1" value={minutos} onChange={(e) => setMinutos(+e.target.value)}>
              {[20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </label>
          <Cronometro c={c} rotulo="Cronômetro" />
        </div>
      </div>

      <header className="pt-6 pb-6">
        <Kicker>Tarefa {t.numero} · {t.tipo}</Kicker>
        <h1 className="headline text-4xl sm:text-5xl mt-2">{t.titulo}</h1>
      </header>

      {/* Consigna */}
      <div className="border-y-2 rule-strong py-5 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Kicker cor="text-ocre">Consigna</Kicker>
          <p className="font-serif text-xl leading-snug mt-2">{t.consigna}</p>
        </div>
        <Plano t={t} genero={genero} plano={estado.planos[t.id]} onSalvar={(p) => salvarPlano(t.id, p)} />
      </div>

      {/* Abas mobile */}
      <div className="flex lg:hidden mt-4 border-b hairline">
        {[['fonte', 'Fonte'], ['redacao', 'Redação']].map(([id, r]) => (
          <button key={id} onClick={() => setAba(id)} className={`flex-1 py-2 text-sm font-semibold border-b-2 -mb-px ${aba === id ? 'border-ink' : 'border-transparent text-muted'}`}>{r}</button>
        ))}
      </div>

      <div className={`grid gap-10 mt-8 ${foco ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Fonte */}
        {!foco && (
          <div className={`${aba === 'fonte' ? 'block' : 'hidden'} lg:block`}>
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-thin lg:pr-3">
              <Kicker cor="text-muted" className="mb-3">Fonte · {t.fonte.veiculo}</Kicker>
              <Fonte fonte={t.fonte} titulo={t.titulo} />
              {(t.fonte.tipo === 'video' || t.fonte.tipo === 'audio') && (
                <div className="mt-6">
                  <Kicker cor="text-muted" className="mb-2 flex items-center gap-1.5"><NotebookPen size={12} /> Anotações durante a exibição</Kicker>
                  <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={5} className="field font-serif bg-paper2" placeholder="Nomes, números, argumentos… Anote palavras-chave, não frases inteiras." />
                  <p className="text-xs text-muted mt-1">No exame, vídeo e áudio costumam ser apresentados duas vezes; confira as instruções do manual vigente.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Caderno de redação */}
        <div className={`${aba === 'redacao' ? 'block' : 'hidden'} lg:block ${foco ? 'max-w-3xl mx-auto w-full' : ''}`}>
          <div className="flex items-center justify-between">
            <Kicker cor="text-muted">Folha de redação · {genero?.nome}</Kicker>
            <button onClick={() => setFoco((f) => !f)} className="btn-ghost text-xs hidden lg:inline-flex">{foco ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {foco ? 'Mostrar fonte' : 'Modo foco'}</button>
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={20}
            lang="pt-BR"
            spellCheck={false}
            style={{ backgroundPosition: '0 0.8rem' }}
            className="w-full mt-3 px-5 sm:px-6 py-5 bg-paper2 folha font-serif text-[1.08rem] resize-y border hairline focus:outline-none focus:border-petroleo"
            placeholder={'Comece pelo vocativo, saudação ou título do gênero pedido…'}
            aria-label="Texto da redação"
          />
          {/* Medidores */}
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="kicker text-muted">Palavras</div>
              <div className="font-mono num text-lg">{palavras} <span className="text-xs text-muted">/ ref. {t.extensao.min}–{t.extensao.max}</span></div>
              <div className="h-1 bg-ink/10 mt-1 relative">
                <div className={`h-full ${palavras < t.extensao.min ? 'bg-ocre' : palavras > t.extensao.max ? 'bg-alerta' : 'bg-selva'}`} style={{ width: `${pctExt}%` }} />
                <div className="absolute top-[-2px] h-2 border-l border-ink" style={{ left: `${(t.extensao.min / t.extensao.max) * 100}%` }} />
              </div>
            </div>
            <div><div className="kicker text-muted">Parágrafos</div><div className="font-mono num text-lg">{paragrafos}</div></div>
            <div><div className="kicker text-muted">Conectores</div><div className="font-mono num text-lg">{conectores.length}</div></div>
          </div>
          <p className="text-[11px] text-muted mt-1">A extensão é uma referência didática deste app, não uma exigência oficial.</p>

          {/* Radar ao vivo */}
          <div className="mt-5 border-t hairline pt-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={radarVivo} onChange={(e) => setRadarVivo(e.target.checked)} className="accent-[rgb(var(--selva))]" />
              <Radar size={15} className="text-petroleo" /> <strong>Radar ao vivo</strong> <span className="text-muted">(modo treino — no exame você estará sozinho)</span>
            </label>
            {radarVivo && (
              <ul className="mt-2 space-y-1 text-sm">
                {alertas.length === 0 ? <li className="text-selva">Nenhum alerta por enquanto.</li> : alertas.map((a, i) => (
                  <li key={i}><span className="line-through decoration-alerta">{a.trecho}</span> → <span className="text-selva">{a.sug}</span> <span className="text-muted">— {a.exp}</span></li>
                ))}
              </ul>
            )}
          </div>

          {/* Checklist */}
          <div className="mt-5 border-t hairline pt-3">
            <Kicker cor="text-muted" className="mb-2">Cumpri a consigna?</Kicker>
            <ul className="space-y-1.5">
              {t.checklist.map((item, i) => (
                <li key={i}>
                  <label className="flex gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!checks[i]} onChange={(e) => setChecks((s) => ({ ...s, [i]: e.target.checked }))} className="mt-0.5 accent-[rgb(var(--selva))]" />
                    <span className={checks[i] ? 'line-through text-muted' : ''}>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="btn-ink" onClick={entregar} disabled={palavras < 20}><Send size={15} /> Entregar e avaliar</button>
            <span className="text-xs text-muted">Rascunho salvo automaticamente.</span>
          </div>
        </div>
      </div>

      {resultado && <Avaliacao tarefa={t} texto={textoAvaliado} resultado={resultado} />}
    </div>
  );
}

// Ficha de planejamento: quem escreve, para quem, para quê e em que gênero
function Plano({ t, genero, plano, onSalvar }) {
  const [p, setP] = useState(plano || { enunciador: '', interlocutor: '', proposito: '', genero: '' });
  const [conferir, setConferir] = useState(false);
  const campos = [
    ['enunciador', 'Quem sou eu neste texto?', t.enunciador],
    ['interlocutor', 'Para quem escrevo?', t.interlocutor],
    ['proposito', 'Para quê?', t.proposito],
  ];
  return (
    <div className="lg:col-span-4 lg:border-l hairline lg:pl-6">
      <Kicker cor="text-petroleo" className="flex items-center gap-1.5"><Compass size={12} /> Antes de escrever: situe-se</Kicker>
      <div className="space-y-2 mt-2">
        {campos.map(([k, r, esperado]) => (
          <label key={k} className="block">
            <span className="text-xs text-muted">{r}</span>
            <input className="field !py-1.5" value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} onBlur={() => onSalvar(p)} />
            {conferir && <span className="text-xs text-selva block mt-0.5">↳ {esperado}</span>}
          </label>
        ))}
        <label className="block">
          <span className="text-xs text-muted">Em que gênero?</span>
          <select className="field !py-1.5" value={p.genero} onChange={(e) => { const n = { ...p, genero: e.target.value }; setP(n); onSalvar(n); }}>
            <option value="">— escolha —</option>
            {GENEROS.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
          {conferir && (
            <span className={`text-xs block mt-0.5 ${p.genero === genero.id ? 'text-selva' : 'text-alerta'}`}>
              {p.genero === genero.id ? <><Check size={12} className="inline" /> Isso: </> : '↳ Esperado: '}{genero.nome}
            </span>
          )}
        </label>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button className="btn-line !py-1 !px-3 text-xs" onClick={() => setConferir((v) => !v)}>{conferir ? 'Ocultar gabarito' : 'Conferir situação'}</button>
        {conferir && <a href={`#/academia/${genero.id}`} className="text-xs underline">Rever o gênero</a>}
      </div>
    </div>
  );
}
