import { useRef, useState } from 'react';
import { X, KeyRound, Download, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { MODELOS } from '../lib/claude.js';
import { Kicker, Rule } from './ui.jsx';

export default function Ajustes({ onFechar }) {
  const { estado, setAjuste, apiKey, setApiKey, importar, zerar } = useStore();
  const [chave, setChave] = useState(apiKey);
  const [mostrar, setMostrar] = useState(false);
  const [msg, setMsg] = useState('');
  const arq = useRef();

  const exportar = () => {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `redacao-brasil-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const lerArquivo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => { try { importar(JSON.parse(t)); setMsg('Progresso importado.'); } catch { setMsg('Arquivo inválido.'); } });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Ajustes">
      <button className="absolute inset-0 bg-ink/30" onClick={onFechar} aria-label="Fechar ajustes" />
      <div className="relative w-full max-w-md h-full overflow-y-auto bg-paper border-l-2 rule-strong p-6 sm:p-8 fade-up">
        <div className="flex items-start justify-between">
          <div>
            <Kicker>Ajustes</Kicker>
            <h2 className="headline text-3xl mt-2">Sua redação</h2>
          </div>
          <button onClick={onFechar} className="btn-ghost" aria-label="Fechar"><X /></button>
        </div>
        <Rule forte className="my-6" />

        <section className="space-y-4">
          <Kicker cor="text-muted">Leitura</Kicker>
          <div className="flex gap-2">
            {[['papel', 'Papel'], ['sepia', 'Sépia'], ['noturno', 'Noturno']].map(([id, r]) => (
              <button key={id} onClick={() => setAjuste('tema', id)} className={estado.ajustes.tema === id ? 'btn-ink' : 'btn-line'}>{r}</button>
            ))}
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-[rgb(var(--selva))]" checked={estado.ajustes.notasES} onChange={(e) => setAjuste('notasES', e.target.checked)} />
            <span className="text-sm">
              <strong>Notas contrastivas em espanhol</strong>
              <span className="block text-muted">Mostra, nas explicações, onde o espanhol interfere. Desligue para treinar imersão total.</span>
            </span>
          </label>
        </section>

        <Rule className="my-6" />

        <section className="space-y-3">
          <Kicker cor="text-muted">Avaliador IA (opcional)</Kicker>
          <p className="text-sm text-muted leading-relaxed">
            Cole sua chave da API da Anthropic para receber a correção de Claude em tempo real. A chave fica <strong className="text-ink">apenas no localStorage deste navegador</strong> e é enviada somente à API da Anthropic. Cada avaliação é cobrada na sua conta. Em computadores compartilhados, apague a chave ao terminar.
          </p>
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-muted shrink-0" />
            <input
              type={mostrar ? 'text' : 'password'}
              className="field font-mono"
              placeholder="sk-ant-…"
              value={chave}
              onChange={(e) => setChave(e.target.value.trim())}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="btn-ghost" onClick={() => setMostrar((m) => !m)} aria-label={mostrar ? 'Ocultar' : 'Mostrar'}>{mostrar ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <div className="flex gap-2">
            <button className="btn-ink" onClick={() => { setApiKey(chave); setMsg(chave ? 'Chave salva neste navegador.' : 'Chave removida.'); }}>Salvar chave</button>
            {apiKey && <button className="btn-line" onClick={() => { setApiKey(''); setChave(''); setMsg('Chave removida.'); }}>Apagar</button>}
          </div>
          <label className="block text-sm">
            <span className="kicker text-muted">Modelo</span>
            <select className="field mt-1" value={estado.ajustes.modelo} onChange={(e) => setAjuste('modelo', e.target.value)}>
              {MODELOS.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </label>
          <p className="text-xs text-muted">Sem chave? Em cada avaliação há o botão <em>Copiar prompt de avaliação</em> para colar no seu chat com Claude.</p>
        </section>

        <Rule className="my-6" />

        <section className="space-y-3">
          <Kicker cor="text-muted">Progresso</Kicker>
          <p className="text-sm text-muted">Tudo é salvo localmente. Exporte para levar a outro navegador.</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-line" onClick={exportar}><Download size={15} /> Exportar</button>
            <button className="btn-line" onClick={() => arq.current?.click()}><Upload size={15} /> Importar</button>
            <input ref={arq} type="file" accept="application/json" className="hidden" onChange={lerArquivo} />
            <button className="btn-line text-alerta" onClick={() => { if (confirm('Apagar todo o progresso (notas, caderno, rascunhos)?')) { zerar(); setMsg('Progresso zerado.'); } }}>
              <Trash2 size={15} /> Zerar
            </button>
          </div>
        </section>
        {msg && <p className="mt-6 text-sm text-selva" role="status">{msg}</p>}
      </div>
    </div>
  );
}
