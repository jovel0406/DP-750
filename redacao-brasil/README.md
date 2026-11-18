# Redação Brasil — Academia & Simulador Celpe-Bras

Programa de preparação para o exame **Celpe-Bras** pensado para hispanofalantes: da base teórica (gêneros textuais) até a simulação das partes escrita e oral, com avaliação em 4 camadas.

> Projeto de estudo independente. Não é afiliado ao Inep nem ao MEC e não contém itens reais do exame. Textos, áudios, campanhas e pessoas citadas nas tarefas são fictícios. Formato, critérios e níveis do exame podem mudar: confirme sempre no edital e no manual vigentes.

## Como usar

- **Publicado (GitHub Pages):** `https://jovel0406.github.io/DP-750/redacao-brasil/dist/` (com Pages ativado na raiz da branch `main`).
- **Local, sem instalar nada:** sirva a pasta `dist/` com qualquer servidor estático (por exemplo `npx serve dist`).
- **Desenvolvimento:**

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

React 18 + Vite + Tailwind CSS 3 + Lucide. O progresso fica no `localStorage` e pode ser exportado/importado em **Ajustes**.

## Os 5 pilares

| Pilar | O que tem |
|---|---|
| 01 · Academia de Gêneros | 12 fichas (carta do leitor, carta aberta, e-mail institucional, artigo de opinião, post de campanha, relato, nota de esclarecimento, abaixo-assinado, resumo executivo, crônica, manifesto, editorial). Seis com anatomia, registro, chaves discursivas copiáveis, exemplo anotado (nota do examinador por parágrafo) e exercício de montagem do texto. |
| 02 · Laboratório & Radar | 4 módulos contrastivos (falsos cognatos, regência e contrações, futuro do subjuntivo / infinitivo pessoal / colocação pronominal, conectores) e 20 desafios: caça ao erro clicando no texto, lacunas e transformação de registro. |
| 03 · Oficina de Tarefas | As 4 tarefas integradas em tela dividida: vídeo (TTS pt-BR com legendas, 0,85×/1×/1,2×, transcrição ocultável), áudio de podcast (com ruído de rádio), reportagem longa e campanha/infográfico. Ficha "situe-se" (enunciador, interlocutor, propósito, gênero), cronômetro, contador de palavras, radar ao vivo opcional e checklist da consigna. |
| 04 · Parte Oral | Conversa inicial + 4 elementos provocadores com visual editorial, roteiro de 8 perguntas (com voz do avaliador), cronômetro de 5 min, gravador, respostas modelo comentadas, autoavaliação e simulação completa de 20 min. |
| 05 · Caderno de Erros | Repetição espaçada (caixas de Leitner: 1, 3, 7, 14, 30 dias) alimentada pelo radar e pelas redações. |

### Avaliação em 4 camadas

1. **Diagnóstico** por critério (gênero/contexto, cumprimento da tarefa, coesão, léxico-gramática), com limites de nota (texto curto, tarefa parcial, cópia da fonte).
2. **Autópsia de portunhol**: o texto marcado com interferências do espanhol e conectores.
3. **Texto modelo** de nível Avançado Superior anotado.
4. **Avaliador IA**: com uma chave da API da Anthropic (guardada só no `localStorage`), a redação é corrigida por Claude via SDK oficial, com streaming; sem chave, o botão *Copiar prompt de avaliação* gera o prompt para colar numa conversa com Claude.

A nota automática é uma **heurística de treino** (marcas do gênero, informações da fonte, conectores, padrões de portunhol, informalidade, cópia). Ela não lê sentido como um avaliador humano.

## Observações técnicas

- A síntese de voz usa `window.speechSynthesis`; a qualidade e a existência de vozes pt-BR dependem do navegador e do sistema operacional.
- A chamada à API é feita do navegador (`dangerouslyAllowBrowser: true`), portanto a chave fica exposta a quem usar aquele navegador. Use uma chave própria, com limite de gastos, e apague-a em computadores compartilhados.
