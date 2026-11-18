import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'rb.estado.v1';
const KEY_API = 'rb.apiKey';

const hoje = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local
const somaDias = (iso, n) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('sv-SE');
};
export const diffDias = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

// Caixas de Leitner: intervalo (dias) até a próxima revisão
export const INTERVALOS = [0, 1, 3, 7, 14, 30];

const INICIAL = {
  criado: hoje(),
  sequencia: { ultima: null, atual: 0, melhor: 0 },
  atividade: {},          // { 'AAAA-MM-DD': nº de ações }
  notas: [],              // { id, tarefaId, data, nota, fonte: 'estimativa' | 'ia' | 'autoavaliacao', criterios? }
  radar: {},              // { desafioId: { acertos, erros } }
  caderno: [],            // itens de revisão espaçada
  rascunhos: {},          // { tarefaId: texto }
  planos: {},             // { tarefaId: { enunciador, interlocutor, proposito, genero } }
  generosVistos: [],
  oral: {},               // { elementoId: { feito, data, auto } }
  ajustes: { tema: 'papel', notasES: true, modelo: 'claude-opus-5-5' },
};

function carregar() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return INICIAL;
    const s = JSON.parse(raw);
    return { ...INICIAL, ...s, ajustes: { ...INICIAL.ajustes, ...(s.ajustes || {}) } };
  } catch {
    return INICIAL;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [estado, setEstado] = useState(carregar);
  const [apiKey, setApiKeyState] = useState(() => {
    try { return localStorage.getItem(KEY_API) || ''; } catch { return ''; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(estado)); } catch { /* armazenamento indisponível */ }
  }, [estado]);

  useEffect(() => {
    document.documentElement.dataset.theme = estado.ajustes.tema;
  }, [estado.ajustes.tema]);

  const setApiKey = useCallback((k) => {
    setApiKeyState(k);
    try { k ? localStorage.setItem(KEY_API, k) : localStorage.removeItem(KEY_API); } catch { /* */ }
  }, []);

  // Registra prática do dia e atualiza a sequência de imersão
  const praticar = useCallback(() => {
    setEstado((s) => {
      const d = hoje();
      const atividade = { ...s.atividade, [d]: (s.atividade[d] || 0) + 1 };
      let { ultima, atual, melhor } = s.sequencia;
      if (ultima !== d) {
        atual = ultima && diffDias(ultima, d) === 1 ? atual + 1 : 1;
        ultima = d;
        melhor = Math.max(melhor, atual);
      }
      return { ...s, atividade, sequencia: { ultima, atual, melhor } };
    });
  }, []);

  const api = useMemo(() => ({
    estado,
    apiKey,
    setApiKey,
    praticar,
    setAjuste: (k, v) => setEstado((s) => ({ ...s, ajustes: { ...s.ajustes, [k]: v } })),
    salvarRascunho: (id, texto) => setEstado((s) => ({ ...s, rascunhos: { ...s.rascunhos, [id]: texto } })),
    salvarPlano: (id, plano) => setEstado((s) => ({ ...s, planos: { ...s.planos, [id]: plano } })),
    marcarGenero: (id) => setEstado((s) => (s.generosVistos.includes(id) ? s : { ...s, generosVistos: [...s.generosVistos, id] })),
    registrarNota: (n) => {
      praticar();
      setEstado((s) => ({ ...s, notas: [...s.notas, { id: crypto.randomUUID?.() || String(Date.now()), data: hoje(), ...n }].slice(-80) }));
    },
    registrarOral: (id, dados) => {
      praticar();
      setEstado((s) => ({ ...s, oral: { ...s.oral, [id]: { feito: true, data: hoje(), ...dados } } }));
    },
    registrarDesafio: (id, acertou, itemCaderno) => {
      praticar();
      setEstado((s) => {
        const r = s.radar[id] || { acertos: 0, erros: 0 };
        const radar = { ...s.radar, [id]: { acertos: r.acertos + (acertou ? 1 : 0), erros: r.erros + (acertou ? 0 : 1) } };
        let caderno = s.caderno;
        if (!acertou && itemCaderno) caderno = adicionarAoCaderno(caderno, itemCaderno);
        return { ...s, radar, caderno };
      });
    },
    adicionarCaderno: (itens) => setEstado((s) => ({ ...s, caderno: itens.reduce(adicionarAoCaderno, s.caderno) })),
    revisarItem: (chave, lembrou) => {
      praticar();
      setEstado((s) => ({
        ...s,
        caderno: s.caderno.map((it) => {
          if (it.chave !== chave) return it;
          const caixa = lembrou ? Math.min(it.caixa + 1, INTERVALOS.length - 1) : 1;
          return { ...it, caixa, proxima: somaDias(hoje(), INTERVALOS[caixa]), revisoes: (it.revisoes || 0) + 1 };
        }),
      }));
    },
    removerItem: (chave) => setEstado((s) => ({ ...s, caderno: s.caderno.filter((i) => i.chave !== chave) })),
    importar: (json) => setEstado({ ...INICIAL, ...json, ajustes: { ...INICIAL.ajustes, ...(json.ajustes || {}) } }),
    zerar: () => setEstado({ ...INICIAL, criado: hoje(), ajustes: estado.ajustes }),
  }), [estado, apiKey, setApiKey, praticar]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function adicionarAoCaderno(caderno, item) {
  const existente = caderno.find((i) => i.chave === item.chave);
  if (existente) {
    return caderno.map((i) => (i.chave === item.chave ? { ...i, caixa: 1, proxima: hoje(), ocorrencias: (i.ocorrencias || 1) + 1 } : i));
  }
  return [...caderno, { ...item, caixa: 1, proxima: hoje(), criado: hoje(), ocorrencias: 1 }];
}

export const useStore = () => useContext(Ctx);
export { hoje };

// ——— Níveis do Celpe-Bras ———
// Faixas conforme a documentação pública do Inep consultada para este projeto.
// Confirme sempre no edital/manual vigente: critérios podem mudar entre edições.
export const NIVEIS = [
  { min: 0, max: 1.99, nome: 'Sem certificação', curto: 'Sem cert.' },
  { min: 2.0, max: 2.75, nome: 'Intermediário', curto: 'Interm.' },
  { min: 2.76, max: 3.5, nome: 'Intermediário Superior', curto: 'Interm. Sup.' },
  { min: 3.51, max: 4.25, nome: 'Avançado', curto: 'Avançado' },
  { min: 4.26, max: 5.0, nome: 'Avançado Superior', curto: 'Av. Sup.' },
];
export const nivelDe = (n) => NIVEIS.find((l) => n >= l.min && n <= l.max + 0.0001) || NIVEIS[0];

// Nível estimado: média ponderada das últimas notas (as mais recentes pesam mais)
export function nivelEstimado(notas) {
  const ult = notas.slice(-6);
  if (!ult.length) return null;
  let soma = 0, peso = 0;
  ult.forEach((n, i) => { const w = i + 1; soma += n.nota * w; peso += w; });
  return Math.round((soma / peso) * 100) / 100;
}
