// Avaliação com Claude via SDK oficial, direto do navegador.
// A chave fica só no localStorage deste navegador e é enviada apenas à API da Anthropic.
import Anthropic from '@anthropic-ai/sdk';

export const MODELOS = [
  { id: 'claude-opus-5-5', nome: 'Claude Opus 5.5 (padrão — avaliação mais criteriosa)' },
  { id: 'claude-sonnet-5-5', nome: 'Claude Sonnet 5.5 (mais rápido e econômico)' },
];

const SISTEMA =
  'Você é um avaliador certificado do exame Celpe-Bras com longa experiência corrigindo textos de candidatos hispanofalantes. Avalie com rigor e generosidade pedagógica, sempre citando trechos do texto avaliado. Nunca invente informações sobre a fonte além do que foi fornecido.';

export async function avaliarComClaude({ apiKey, modelo, prompt, onTexto, signal }) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const stream = client.beta.messages.stream(
    {
      model: modelo,
      max_tokens: 16000,
      output_config: { effort: 'high' },
      // Em caso de recusa por política, a API tenta automaticamente um modelo alternativo.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SISTEMA,
      messages: [{ role: 'user', content: prompt }],
    },
    { signal },
  );
  stream.on('text', (_delta, snapshot) => onTexto?.(snapshot));
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') {
    throw new Error('O modelo recusou esta solicitação. Revise o texto enviado e tente novamente.');
  }
  const texto = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return { texto, truncado: msg.stop_reason === 'max_tokens', modelo: msg.model };
}

export function mensagemDeErro(e) {
  if (e instanceof Anthropic.AuthenticationError) return 'Chave de API inválida. Confira em Ajustes.';
  if (e instanceof Anthropic.PermissionDeniedError) return 'Sua chave não tem permissão para este modelo.';
  if (e instanceof Anthropic.RateLimitError) return 'Limite de requisições atingido. Aguarde um pouco e tente de novo.';
  if (e instanceof Anthropic.APIConnectionError) return 'Falha de conexão com a API. Verifique sua internet.';
  if (e instanceof Anthropic.APIError) return `Erro da API (${e.status ?? '—'}): ${e.message}`;
  if (e?.name === 'AbortError' || e instanceof Anthropic.APIUserAbortError) return 'Avaliação cancelada.';
  return e?.message || 'Erro desconhecido.';
}
