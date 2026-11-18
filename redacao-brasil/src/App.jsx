import { useEffect, useState } from 'react';
import { Settings2, Flame, Moon, Sun, Coffee, Menu, X } from 'lucide-react';
import { useStore, nivelEstimado, nivelDe } from './lib/store.jsx';
import Painel from './pillars/Painel.jsx';
import Academia from './pillars/Academia.jsx';
import Laboratorio from './pillars/Laboratorio.jsx';
import Oficina from './pillars/Oficina.jsx';
import Oral from './pillars/Oral.jsx';
import Caderno from './pillars/Caderno.jsx';
import Ajustes from './components/Ajustes.jsx';

export const SECOES = [
  { id: '', rotulo: 'Painel', num: '00' },
  { id: 'academia', rotulo: 'Academia de Gêneros', num: '01' },
  { id: 'laboratorio', rotulo: 'Laboratório & Radar', num: '02' },
  { id: 'oficina', rotulo: 'Oficina de Tarefas', num: '03' },
  { id: 'oral', rotulo: 'Parte Oral', num: '04' },
  { id: 'caderno', rotulo: 'Caderno de Erros', num: '05' },
];

function lerRota() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [secao = '', ...resto] = h.split('/');
  return { secao, param: resto.join('/') || null };
}

const DATA_EXTENSO = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function App() {
  const { estado, setAjuste } = useStore();
  const [rota, setRota] = useState(lerRota);
  const [ajustes, setAjustes] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const h = () => { setRota(lerRota()); setMenu(false); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const nivel = nivelEstimado(estado.notas);
  const edicao = Object.keys(estado.atividade).length || 1;
  const temas = [
    { id: 'papel', icone: Sun, rotulo: 'Papel' },
    { id: 'sepia', icone: Coffee, rotulo: 'Sépia' },
    { id: 'noturno', icone: Moon, rotulo: 'Noturno' },
  ];
  const proxTema = temas[(temas.findIndex((t) => t.id === estado.ajustes.tema) + 1) % temas.length];
  const IconeTema = temas.find((t) => t.id === estado.ajustes.tema)?.icone || Sun;

  let Pagina;
  switch (rota.secao) {
    case 'academia': Pagina = <Academia id={rota.param} />; break;
    case 'laboratorio': Pagina = <Laboratorio param={rota.param} />; break;
    case 'oficina': Pagina = <Oficina id={rota.param} />; break;
    case 'oral': Pagina = <Oral id={rota.param} />; break;
    case 'caderno': Pagina = <Caderno />; break;
    default: Pagina = <Painel />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-paper">Pular para o conteúdo</a>
      {/* ——— Cabeçalho de jornal ——— */}
      <header className="px-4 sm:px-8 lg:px-12 pt-4 no-print">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between gap-4 text-[11px] font-sans text-muted uppercase tracking-[0.14em] pb-2 border-b hairline">
            <span className="hidden sm:inline">{DATA_EXTENSO.format(new Date())}</span>
            <span className="num">Edição nº {edicao}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 num" title="Sequência de imersão (dias seguidos)">
                <Flame size={13} className={estado.sequencia.atual ? 'text-ocre' : ''} /> {estado.sequencia.atual} {estado.sequencia.atual === 1 ? 'dia' : 'dias'}
              </span>
              <span className="hidden md:inline num" title="Nível estimado a partir das suas últimas tarefas">
                Nível est.: {nivel ? `${nivel.toFixed(2).replace('.', ',')} · ${nivelDe(nivel).curto}` : '—'}
              </span>
              <button onClick={() => setAjuste('tema', proxTema.id)} className="hover:text-ink" aria-label={`Mudar para tema ${proxTema.rotulo}`} title={`Tema: ${estado.ajustes.tema}`}>
                <IconeTema size={14} />
              </button>
              <button onClick={() => setAjustes(true)} className="hover:text-ink flex items-center gap-1" aria-label="Ajustes">
                <Settings2 size={14} /> <span className="hidden sm:inline">Ajustes</span>
              </button>
            </div>
          </div>
          <div className="flex items-end justify-between py-5">
            <a href="#/" className="block">
              <div className="headline text-[2.4rem] sm:text-6xl lg:text-7xl tracking-[-0.03em]">
                Redação <span className="italic font-normal text-selva">Brasil</span>
              </div>
              <div className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.22em] text-muted mt-2">Academia &amp; Simulador Celpe-Bras · para hispanofalantes</div>
            </a>
            <button className="lg:hidden btn-ghost mb-2" onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
              {menu ? <X /> : <Menu />}
            </button>
          </div>
          <nav className={`border-y-2 rule-strong ${menu ? 'block' : 'hidden'} lg:block`} aria-label="Seções">
            <ul className="flex flex-col lg:flex-row lg:justify-between">
              {SECOES.map((s) => {
                const ativo = rota.secao === s.id;
                return (
                  <li key={s.id} className="lg:flex-1">
                    <a
                      href={'#/' + s.id}
                      aria-current={ativo ? 'page' : undefined}
                      className={`block px-1 lg:px-3 py-2.5 font-sans text-[13px] lg:text-center transition-colors border-b lg:border-b-0 lg:border-l first:border-l-0 hairline ${ativo ? 'bg-ink text-paper' : 'hover:bg-ink/5'}`}
                    >
                      <span className={`font-mono text-[10px] mr-1.5 ${ativo ? 'text-paper/60' : 'text-ocre'}`}>{s.num}</span>
                      {s.rotulo}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <main id="conteudo" className="px-4 sm:px-8 lg:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto" key={rota.secao + (rota.param || '')}>{Pagina}</div>
      </main>

      <footer className="px-4 sm:px-8 lg:px-12 pb-10 no-print">
        <div className="max-w-[1400px] mx-auto border-t-2 rule-strong pt-4 grid md:grid-cols-3 gap-4 text-xs font-sans text-muted leading-relaxed">
          <p><strong className="text-ink">Redação Brasil</strong> é um projeto de estudo independente. Não é afiliado ao Inep nem ao Ministério da Educação e não contém itens reais do exame.</p>
          <p>Textos, áudios, campanhas e pessoas citadas nas tarefas são fictícios. As notas automáticas são estimativas didáticas, não a correção oficial.</p>
          <p>Regras, níveis e formato do Celpe-Bras podem mudar: confirme sempre no edital e no manual vigentes publicados pelo Inep.</p>
        </div>
      </footer>

      {ajustes && <Ajustes onFechar={() => setAjustes(false)} />}
    </div>
  );
}
