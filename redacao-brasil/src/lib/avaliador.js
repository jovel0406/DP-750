// Avaliação heurística local (sem IA). Produz uma ESTIMATIVA didática,
// inspirada nos critérios do Celpe-Bras; não reproduz a correção oficial.
import { PORTUNHOL, INFORMAL, CONECTORES } from '../data/laboratorio.js';

// \b e \w do JavaScript não entendem acentos: convertemos para classes Unicode.
const L = '[\\p{L}\\p{N}_]';
const B = `(?:(?<!${L})(?=${L})|(?<=${L})(?!${L}))`;
export function ure(src, flags = 'giu') {
  const conv = src.replace(/\\b/g, B).replace(/\\w/g, L);
  return new RegExp(conv, flags.includes('u') ? flags : flags + 'u');
}

export const contarPalavras = (t) => (t.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
export const contarParagrafos = (t) => t.split(/\n\s*\n|\n/).map((p) => p.trim()).filter((p) => p.length > 0).length;
const frases = (t) => t.split(/(?<=[.!?…])\s+|\n+/).map((f) => f.trim()).filter(Boolean);
const clamp = (x, a = 0, b = 5) => Math.max(a, Math.min(b, x));
const arred = (x) => Math.round(x * 4) / 4; // passos de 0,25

export function detectarPortunhol(texto) {
  const achados = [];
  const fs = frases(texto);
  for (const p of PORTUNHOL) {
    const re = ure(p.re, 'giu');
    let m;
    while ((m = re.exec(texto)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (p.soloInicio) {
        const antes = texto.slice(0, m.index).trimEnd();
        if (antes && !/[.!?\n]$/.test(antes)) continue;
      }
      const frase = fs.find((f) => f.toLowerCase().includes(m[0].toLowerCase())) || '';
      achados.push({ trecho: m[0], inicio: m.index, fim: m.index + m[0].length, sug: p.sug, exp: p.exp, frase });
    }
  }
  // remove sobreposições (mantém o primeiro achado)
  achados.sort((a, b) => a.inicio - b.inicio);
  return achados.filter((a, i, arr) => i === 0 || a.inicio >= arr[i - 1].fim);
}

export function detectarInformalidade(texto) {
  return INFORMAL.flatMap((src) => texto.match(ure(src, 'giu')) || []);
}

export function conectoresUsados(texto) {
  const low = texto.toLowerCase();
  return CONECTORES.filter((c) => ure(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'iu').test(low));
}

// Sequências de 8+ palavras copiadas do texto-fonte
export function detectarCopia(texto, fonte) {
  if (!fonte) return [];
  const norm = (s) => s.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+/gu) || [];
  const f = norm(fonte), t = norm(texto);
  const N = 8;
  const grams = new Set();
  for (let i = 0; i + N <= f.length; i++) grams.add(f.slice(i, i + N).join(' '));
  const trechos = [];
  let i = 0;
  while (i + N <= t.length) {
    if (grams.has(t.slice(i, i + N).join(' '))) {
      let j = i + N;
      while (j < t.length && grams.has(t.slice(j - N + 1, j + 1).join(' '))) j++;
      trechos.push(t.slice(i, j).join(' '));
      i = j;
    } else i++;
  }
  return trechos;
}

export function textoFonte(tarefa) {
  const f = tarefa.fonte;
  if (f.cenas) return f.cenas.map((c) => c.texto).join(' ');
  if (f.paragrafos) return f.paragrafos.join(' ');
  return [f.linhaFina, ...(f.checklist || []), f.sintomas, f.rodape].join(' ');
}

// Última linha curta, iniciada por maiúscula e sem ponto final: típico de assinatura
function temAssinatura(texto) {
  const linhas = texto.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (linhas.length < 2) return false;
  const ult = linhas[linhas.length - 1];
  return ult.length <= 80 && /^[\p{Lu}]/u.test(ult) && !/[.!?:]$/.test(ult) && ult.split(/\s+/).length <= 12;
}

export function avaliar(texto, tarefa) {
  const palavras = contarPalavras(texto);
  const paragrafos = contarParagrafos(texto);
  const portunhol = detectarPortunhol(texto);
  const informal = tarefa.formal ? detectarInformalidade(texto) : [];
  const conectores = conectoresUsados(texto);
  const copia = detectarCopia(texto, textoFonte(tarefa));
  const palavrasCopiadas = copia.reduce((s, c) => s + c.split(' ').length, 0);

  const genero = tarefa.marcadoresGenero.map((m) => ({ ...m, ok: m.re === '__assinatura__' ? temAssinatura(texto) : ure(m.re, 'imu').test(texto.trim()) }));
  const pontos = tarefa.pontosChave.map((p) => ({ ...p, ok: ure(p.re, 'iu').test(texto) }));

  // 1) Adequação ao gênero e ao contexto (interlocutor, registro, estrutura)
  const fracGenero = genero.filter((g) => g.ok).length / genero.length;
  let cGenero = 1 + fracGenero * 3 + (paragrafos >= 3 ? 1 : paragrafos >= 2 ? 0.5 : 0);
  cGenero -= Math.min(1.5, informal.length * 0.5);

  // 2) Cumprimento da tarefa (informações da fonte + propósito)
  const fracPontos = pontos.filter((p) => p.ok).length / pontos.length;
  let cTarefa = 0.5 + fracPontos * 4.5;
  if (palavrasCopiadas > 25) cTarefa -= 1;

  // 3) Coesão e coerência
  const fs = frases(texto);
  const mediaFrase = fs.length ? palavras / fs.length : 0;
  let cCoesao = 2 + Math.min(conectores.length, 6) * 0.45 + (paragrafos >= 3 ? 0.5 : 0);
  if (mediaFrase > 45) cCoesao -= 0.75; // períodos longos demais
  if (mediaFrase > 0 && mediaFrase < 7) cCoesao -= 0.5; // frases muito fragmentadas

  // 4) Adequação lexical e gramatical
  const densidade = palavras ? (portunhol.length / palavras) * 100 : 0;
  let cLingua = 5 - densidade * 1.2 - Math.min(1, informal.length * 0.25);
  if (palavras < 40) cLingua = Math.min(cLingua, 2.5);

  const criterios = [
    { id: 'genero', nome: 'Adequação ao gênero e ao contexto', nota: arred(clamp(cGenero)), peso: 0.3 },
    { id: 'tarefa', nome: 'Cumprimento da tarefa (interlocutor e propósito)', nota: arred(clamp(cTarefa)), peso: 0.3 },
    { id: 'coesao', nome: 'Coesão e coerência', nota: arred(clamp(cCoesao)), peso: 0.2 },
    { id: 'lingua', nome: 'Adequação lexical e gramatical', nota: arred(clamp(cLingua)), peso: 0.2 },
  ];
  let final = criterios.reduce((s, c) => s + c.nota * c.peso, 0);

  const tetos = [];
  if (palavras < tarefa.extensao.min * 0.5) { final = Math.min(final, 2); tetos.push('Texto muito curto para desenvolver a tarefa: nota limitada a 2,0.'); }
  if (criterios[1].nota < 2.5) { final = Math.min(final, criterios[1].nota + 0.75); tetos.push('Tarefa cumprida apenas parcialmente: no Celpe-Bras, não atender ao propósito pesa mais que erros de língua.'); }
  if (palavrasCopiadas > 40) { final = Math.min(final, 2.5); tetos.push('Trechos longos copiados da fonte: reformule com suas palavras.'); }

  return {
    final: Math.round(clamp(final) * 100) / 100,
    criterios, palavras, paragrafos, conectores, portunhol, informal, copia, genero, pontos, tetos, mediaFrase,
  };
}

// Comentários pedagógicos gerados a partir da análise
export function comentarios(r, tarefa) {
  const out = [];
  const faltaG = r.genero.filter((g) => !g.ok).map((g) => g.rotulo.toLowerCase());
  if (faltaG.length) out.push({ c: 'genero', t: `Marcas do gênero ausentes: ${faltaG.join('; ')}. O avaliador precisa reconhecer o gênero sem ler a consigna.` });
  else out.push({ c: 'genero', t: 'As marcas estruturais do gênero estão presentes. Confira se o registro se mantém uniforme do início ao fim.' });
  if (r.informal.length) out.push({ c: 'genero', t: `Marcas de informalidade num texto formal: ${[...new Set(r.informal)].join(', ')}.` });
  const faltaP = r.pontos.filter((p) => !p.ok).map((p) => p.rotulo.toLowerCase());
  if (faltaP.length) out.push({ c: 'tarefa', t: `Informações da fonte que não aparecem (ou não foram detectadas): ${faltaP.join('; ')}.` });
  else out.push({ c: 'tarefa', t: 'Você retomou todas as informações-chave da fonte. Verifique se elas servem ao seu propósito, e não apenas aparecem listadas.' });
  if (r.copia.length) out.push({ c: 'tarefa', t: `Há ${r.copia.length} trecho(s) copiado(s) literalmente da fonte. Parafraseie.` });
  if (r.conectores.length < 4) out.push({ c: 'coesao', t: `Apenas ${r.conectores.length} conector(es) identificado(s). Experimente: "além disso", "no entanto", "diante desse cenário", "por isso".` });
  else out.push({ c: 'coesao', t: `Bom repertório de conectores (${r.conectores.length}): ${r.conectores.slice(0, 6).join(', ')}${r.conectores.length > 6 ? '…' : ''}.` });
  if (r.mediaFrase > 45) out.push({ c: 'coesao', t: `Frases muito longas (média de ${Math.round(r.mediaFrase)} palavras). Divida períodos.` });
  if (r.portunhol.length) out.push({ c: 'lingua', t: `${r.portunhol.length} possível(is) interferência(s) do espanhol. Veja a autópsia na próxima aba.` });
  else out.push({ c: 'lingua', t: 'Nenhuma interferência típica do espanhol detectada pelo radar automático (o que não exclui outros erros).' });
  if (r.palavras < tarefa.extensao.min) out.push({ c: 'tarefa', t: `Texto com ${r.palavras} palavras — abaixo da extensão de referência (${tarefa.extensao.min}–${tarefa.extensao.max}).` });
  return out;
}

// Prompt de avaliação para Claude (API ou colar manualmente)
export function montarPrompt(tarefa, genero, texto) {
  const fonte = textoFonte(tarefa);
  return `Você é um avaliador experiente do exame Celpe-Bras (Inep, Brasil), especializado em candidatos hispanofalantes.

Avalie a produção escrita abaixo, considerando a tarefa integrada (leitura/compreensão da fonte + produção). Seja exigente, justo e pedagógico. Escreva a avaliação em português do Brasil; quando explicar uma interferência do espanhol, você pode acrescentar uma nota curta em espanhol.

## TAREFA ${tarefa.numero} (${tarefa.tipo}) — ${tarefa.titulo}
Consigna: ${tarefa.consigna}
Enunciador esperado: ${tarefa.enunciador}
Interlocutor: ${tarefa.interlocutor}
Propósito: ${tarefa.proposito}
Gênero esperado: ${genero?.nome || '—'}

## FONTE (transcrição/texto-base)
${fonte}

## TEXTO DO CANDIDATO
"""
${texto}
"""

## FORMATO DA RESPOSTA
Use exatamente estas seções em Markdown:

### 1. Diagnóstico (escala 0,0 a 5,0)
Atribua uma nota a cada critério, com 2–3 linhas de justificativa citando trechos do texto:
- Adequação ao gênero e ao contexto (enunciador, interlocutor, registro)
- Cumprimento da tarefa (propósito, uso das informações da fonte)
- Coesão e coerência
- Adequação lexical e gramatical

### 2. Autópsia de portunhol e melhorias de estilo
Liste até 10 trechos no formato: "trecho original" → "como um brasileiro culto escreveria" — explicação breve (e nota em espanhol quando útil).

### 3. Três prioridades para a próxima redação
Ações concretas e verificáveis.

### 4. Versão reescrita (nível Avançado Superior)
Reescreva o texto preservando as ideias do candidato, e depois liste os conectores e escolhas lexicais que elevaram o nível.

Na última linha, escreva exatamente: NOTA FINAL: X.X (holística, de 0.0 a 5.0) — NÍVEL: (Sem certificação | Intermediário | Intermediário Superior | Avançado | Avançado Superior)`;
}

export function extrairNotaIA(texto) {
  const m = texto.match(/NOTA FINAL:\s*([0-5](?:[.,]\d{1,2})?)/i);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}
