import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Eye, EyeOff, Volume2, VolumeX, Radio, Tv } from 'lucide-react';
import { lerSequencia, criarRuido, temVoz, aoCarregarVozes } from '../lib/voz.js';
import { Kicker } from './ui.jsx';

const VELOCIDADES = [0.85, 1, 1.2];

function usePlayer(cenas, { ruido = false } = {}) {
  const [atual, setAtual] = useState(-1);
  const [estado, setEstado] = useState('parado'); // parado | tocando | pausado
  const [taxa, setTaxa] = useState(1);
  const [exibicoes, setExibicoes] = useState(0);
  const [comRuido, setComRuido] = useState(ruido);
  const [vozes, setVozes] = useState([]);
  const ctrl = useRef(null);
  const noise = useRef(null);

  useEffect(() => aoCarregarVozes(setVozes), []);
  useEffect(() => () => { ctrl.current?.parar(); noise.current?.parar(); }, []);

  const pararRuido = () => { noise.current?.parar(); noise.current = null; };
  const tocar = (inicio = 0) => {
    ctrl.current?.parar();
    if (comRuido && !noise.current) noise.current = criarRuido();
    setEstado('tocando');
    if (inicio === 0) setExibicoes((e) => e + 1);
    ctrl.current = lerSequencia(cenas, {
      taxa, inicio,
      onFala: setAtual,
      onFim: () => { setEstado('parado'); setAtual(-1); pararRuido(); },
    });
  };
  const pausar = () => { ctrl.current?.pausar(); setEstado('pausado'); noise.current?.volume(0); };
  const retomar = () => { ctrl.current?.retomar(); setEstado('tocando'); noise.current?.volume(0.035); };
  const parar = () => { ctrl.current?.parar(); setEstado('parado'); setAtual(-1); pararRuido(); };
  const mudarTaxa = (t) => { setTaxa(t); if (estado === 'tocando') { ctrl.current?.parar(); setTimeout(() => { ctrl.current = lerSequencia(cenas, { taxa: t, inicio: Math.max(0, atual), onFala: setAtual, onFim: () => { setEstado('parado'); setAtual(-1); pararRuido(); } }); }, 50); } };
  const alternarRuido = () => {
    setComRuido((r) => {
      if (r) pararRuido(); else if (estado === 'tocando') noise.current = criarRuido();
      return !r;
    });
  };
  return { atual, estado, taxa, exibicoes, comRuido, vozes, tocar, pausar, retomar, parar, mudarTaxa, alternarRuido };
}

function Controles({ p, sobreEscuro = false }) {
  const base = sobreEscuro ? 'text-white/80 hover:text-white' : 'text-muted hover:text-ink';
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {p.estado === 'tocando' ? (
        <button onClick={p.pausar} className={`flex items-center gap-1.5 text-sm font-semibold ${base}`}><Pause size={18} /> Pausar</button>
      ) : p.estado === 'pausado' ? (
        <button onClick={p.retomar} className={`flex items-center gap-1.5 text-sm font-semibold ${base}`}><Play size={18} /> Continuar</button>
      ) : (
        <button onClick={() => p.tocar(0)} className={`flex items-center gap-1.5 text-sm font-semibold ${base}`}><Play size={18} /> {p.exibicoes ? 'Ouvir de novo' : 'Reproduzir'}</button>
      )}
      <button onClick={p.parar} disabled={p.estado === 'parado'} className={`${base} disabled:opacity-30`} aria-label="Parar"><Square size={15} /></button>
      <div className="flex items-center gap-1 text-xs font-mono" role="group" aria-label="Velocidade">
        {VELOCIDADES.map((v) => (
          <button key={v} onClick={() => p.mudarTaxa(v)} className={`px-1.5 py-0.5 ${p.taxa === v ? (sobreEscuro ? 'bg-white text-black' : 'bg-ink text-paper') : base}`}>{String(v).replace('.', ',')}×</button>
        ))}
      </div>
      <span className={`text-xs num ${sobreEscuro ? 'text-white/60' : 'text-muted'}`}>Exibições: {p.exibicoes}/2</span>
    </div>
  );
}

function Transcricao({ cenas, atual }) {
  const [ver, setVer] = useState(false);
  const refs = useRef([]);
  useEffect(() => { if (ver && atual >= 0) refs.current[atual]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [atual, ver]);
  return (
    <div className="mt-5">
      <button onClick={() => setVer((v) => !v)} className="btn-ghost">{ver ? <EyeOff size={15} /> : <Eye size={15} />} {ver ? 'Ocultar transcrição' : 'Mostrar transcrição'}</button>
      {!ver && <p className="text-xs text-muted mt-1">Dica: no exame não há transcrição. Tente primeiro só ouvindo e anotando.</p>}
      {ver && (
        <div className="mt-3 max-h-80 overflow-y-auto scrollbar-thin pr-2 space-y-3">
          {cenas.map((c, i) => (
            <p key={i} ref={(el) => (refs.current[i] = el)} className={`font-serif leading-relaxed transition-colors ${i === atual ? 'bg-ocre/15 -mx-2 px-2' : ''}`}>
              <span className="kicker text-petroleo mr-2">{c.quem}:</span>{c.texto}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function AvisoVoz({ vozes }) {
  if (!temVoz()) return <p className="text-xs text-alerta mt-2">Seu navegador não oferece síntese de voz. Use a transcrição.</p>;
  if (!vozes.length) return <p className="text-xs text-muted mt-2">Nenhuma voz em português foi encontrada no sistema; o navegador pode usar outra voz. Instale uma voz pt-BR ou use a transcrição.</p>;
  return null;
}

export function FonteVideo({ fonte }) {
  const p = usePlayer(fonte.cenas);
  const c = fonte.cenas[p.atual] || null;
  return (
    <div>
      <div className="relative aspect-video bg-[#101614] text-white overflow-hidden select-none">
        {/* "Cena" estilizada */}
        <div className="absolute inset-0 opacity-90" style={{ background: 'radial-gradient(120% 90% at 70% 30%, #2d6a4f 0%, #1b4332 45%, #0b1512 100%)' }} />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)' }} />
        <div className="absolute top-3 left-4 flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-white/70"><Tv size={12} /> {fonte.veiculo}</div>
        {p.estado === 'tocando' && <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> No ar</div>}
        <div className="absolute inset-0 flex items-center justify-center">
          {p.estado === 'parado' && !p.exibicoes ? (
            <button onClick={() => p.tocar(0)} className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center hover:bg-white/10" aria-label="Reproduzir vídeo"><Play size={28} /></button>
          ) : (
            <div className="font-serif italic text-white/25 text-4xl sm:text-5xl text-center px-10 leading-tight">{c ? c.quem.split(',')[0] : 'Fim da reportagem'}</div>
          )}
        </div>
        {c?.legenda && (
          <div className="absolute left-0 bottom-6 fade-up" key={p.atual}>
            <div className="bg-[#D97706] text-black text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider px-3 py-1 w-max">{c.quem.includes(',') ? 'Entrevista' : 'Reportagem'}</div>
            <div className="bg-white text-black font-sans font-semibold text-sm sm:text-base px-3 py-1.5">{c.legenda}</div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-[#D97706] transition-all duration-500" style={{ width: `${p.atual < 0 ? 0 : ((p.atual + 1) / fonte.cenas.length) * 100}%` }} />
        </div>
      </div>
      <div className="mt-3"><Controles p={p} /></div>
      <AvisoVoz vozes={p.vozes} />
      <Transcricao cenas={fonte.cenas} atual={p.atual} />
    </div>
  );
}

export function FonteAudio({ fonte }) {
  const p = usePlayer(fonte.cenas, { ruido: !!fonte.ruido });
  const c = fonte.cenas[p.atual] || null;
  const barras = 48;
  return (
    <div>
      <div className="border-2 rule-strong p-5 bg-paper2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Radio size={16} className="text-petroleo" /><Kicker cor="text-petroleo">{fonte.veiculo}</Kicker></div>
          {p.estado === 'tocando' && <span className="kicker text-alerta flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-alerta animate-pulse" /> No ar</span>}
        </div>
        <div className="flex items-end gap-[3px] h-16 mt-5" aria-hidden>
          {Array.from({ length: barras }).map((_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 1.7) * 60) + (i % 5) * 4;
            const ativa = p.atual >= 0 && i / barras <= (p.atual + 1) / fonte.cenas.length;
            return <div key={i} className={`flex-1 ${ativa ? 'bg-petroleo' : 'bg-ink/15'} ${p.estado === 'tocando' && ativa ? 'animate-pulse' : ''}`} style={{ height: `${h}%`, animationDelay: `${(i % 7) * 90}ms` }} />;
          })}
        </div>
        <p className="font-serif italic text-muted mt-3 h-6">{c ? `${c.quem} está falando…` : p.exibicoes ? 'Programa encerrado.' : 'Pressione reproduzir para ouvir o programa.'}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 justify-between">
          <Controles p={p} />
          <button onClick={p.alternarRuido} className="btn-ghost text-xs">{p.comRuido ? <Volume2 size={14} /> : <VolumeX size={14} />} Ruído de rádio {p.comRuido ? 'ligado' : 'desligado'}</button>
        </div>
      </div>
      <AvisoVoz vozes={p.vozes} />
      <Transcricao cenas={fonte.cenas} atual={p.atual} />
    </div>
  );
}

export function FonteTexto({ fonte, titulo }) {
  return (
    <article className="bg-paper2 p-6 sm:p-8 border-t-4 border-ink">
      <div className="flex justify-between items-baseline border-b hairline pb-2">
        <span className="font-serif italic font-semibold">{fonte.veiculo.split('—')[0]}</span>
        <Kicker>{fonte.chapeu}</Kicker>
      </div>
      <h2 className="headline text-4xl sm:text-5xl mt-6">{titulo}</h2>
      <p className="font-serif text-xl italic text-muted mt-3 leading-snug">{fonte.linhaFina}</p>
      <p className="kicker text-muted mt-4">{fonte.autor}</p>
      <div className="mt-6 prose-ed xl:columns-2 xl:gap-8">
        {fonte.paragrafos.map((p, i) => <p key={i} className={i === 0 ? 'dropcap' : ''}>{p}</p>)}
      </div>
    </article>
  );
}

export function FonteInfografico({ fonte }) {
  return (
    <article className="border-2 rule-strong">
      <div className="bg-selva text-white p-6">
        <div className="kicker text-white/70">{fonte.chapeu}</div>
        <h2 className="headline text-4xl sm:text-5xl mt-2">{fonte.tituloPeca}</h2>
        <p className="font-serif italic text-white/85 mt-3 text-lg leading-snug">{fonte.linhaFina}</p>
      </div>
      <div className="grid sm:grid-cols-3 border-b-2 rule-strong">
        {fonte.dados.map((d) => (
          <div key={d.numero} className="p-5 border-b sm:border-b-0 sm:border-l first:border-l-0 hairline">
            <div className="headline text-4xl text-ocre num">{d.numero}</div>
            <p className="text-sm mt-2 leading-snug">{d.rotulo}</p>
          </div>
        ))}
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">
        <div>
          <Kicker className="mb-3">Vistoria de 10 minutos</Kicker>
          <ol className="space-y-2">
            {fonte.checklist.map((c, i) => (
              <li key={c} className="flex gap-3 font-serif"><span className="font-mono text-xs text-ocre pt-1 num">{String(i + 1).padStart(2, '0')}</span>{c}</li>
            ))}
          </ol>
        </div>
        <div>
          <Kicker cor="text-alerta" className="mb-3">Sintomas</Kicker>
          <p className="font-serif leading-relaxed">{fonte.sintomas}</p>
        </div>
      </div>
      <div className="px-6 py-3 border-t hairline text-xs font-sans text-muted">{fonte.rodape}<br />{fonte.veiculo}</div>
    </article>
  );
}
