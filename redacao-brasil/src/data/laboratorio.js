// Pilar 2 — Laboratório de Língua & Radar Anti-Portunhol

export const MODULOS = [
  {
    id: 'cognatos',
    num: '01',
    titulo: 'Falsos cognatos críticos',
    subtitulo: 'Palavras que parecem amigas e derrubam sua nota de léxico.',
    intro:
      'Português e espanhol compartilham cerca de 85–90% do vocabulário de origem latina — estimativa muito citada, mas que varia conforme o método; trate-a como ordem de grandeza. Essa proximidade é uma vantagem enorme e, ao mesmo tempo, a maior armadilha: o avaliador percebe na hora quando uma palavra foi "transportada" do espanhol.',
    tabela: {
      cols: ['Português', 'Significa', 'Não confunda com (ES)', 'Em PT, diga'],
      linhas: [
        ['todavia', 'porém, contudo', 'todavía (= ainda)', 'ainda'],
        ['esquisito', 'estranho', 'exquisito (= delicioso, requintado)', 'delicioso, requintado'],
        ['propina', 'suborno', 'propina (= gorjeta)', 'gorjeta'],
        ['escritório', 'local de trabalho (oficina ES)', 'escritorio (= escrivaninha)', 'escrivaninha, mesa'],
        ['oficina', 'oficina mecânica; workshop', 'oficina (= escritório)', 'escritório'],
        ['rato', 'roedor', 'rato (= momento)', 'um instante, um tempinho'],
        ['polvo', 'pulpo (animal)', 'polvo (= pó, poeira)', 'pó, poeira'],
        ['embaraçada', 'constrangida; enrolada', 'embarazada (= grávida)', 'grávida'],
        ['puxar', 'tirar hacia sí (jalar)', 'pujar (= empurrar)', 'empurrar'],
        ['balcão', 'mostrador, barra', 'balcón (= sacada)', 'sacada, varanda'],
        ['apelido', 'apodo', 'apellido (= sobrenome)', 'sobrenome'],
        ['largo', 'ancho (amplo)', 'largo (= comprido)', 'comprido, longo'],
        ['borracha', 'goma de borrar; caucho', 'borracha (= bêbada)', 'bêbada'],
        ['contestar', 'refutar, questionar', 'contestar (= responder)', 'responder'],
        ['assinatura', 'firma; suscripción', 'asignatura (= disciplina)', 'disciplina, matéria'],
      ],
    },
    notaES:
      'Truco de examen: si una palabra te sale "sin esfuerzo" porque es igual al español, pregúntate si es un falso amigo. Los más castigados en textos formales: "todavia" (que en PT es conector adversativo), "contestar" y "apelido".',
  },
  {
    id: 'regencia',
    num: '02',
    titulo: 'Regência verbal e preposições',
    subtitulo: 'O verbo pede uma preposição — e ela nem sempre é a do espanhol.',
    intro:
      'Regência é a relação entre o verbo e seus complementos. Muitos erros de hispanofalantes não são de vocabulário, mas de preposição. Atenção também às contrações obrigatórias (em + o = no, de + a = da, por + o = pelo), que o espanhol quase não tem.',
    tabela: {
      cols: ['Em português', 'Exemplo', 'Interferência típica do ES'],
      linhas: [
        ['sonhar com', 'Sonhei com o exame.', '✗ sonhei no / sonhei de (ES: soñar con ✓ igual)'],
        ['gostar de', 'Gosto de música brasileira.', '✗ Me gosta a música (ES: me gusta)'],
        ['precisar de + nome', 'Preciso de ajuda.', '✗ Preciso ajuda (ES: necesito ayuda)'],
        ['precisar + infinitivo', 'Preciso estudar.', '(sem preposição)'],
        ['assistir a (= ver)', 'Assisti ao documentário.', 'Na fala, "assistir o filme" é muito comum; em textos formais, prefira "assistir ao".'],
        ['chegar a', 'Cheguei a Brasília ontem.', '"Chegar em" é muito usado no Brasil, inclusive na mídia; a norma-padrão prefere "chegar a".'],
        ['ir a / ir para', 'Vou ao mercado. / Vou para casa.', '"Ir para" sugere permanência maior.'],
        ['apaixonar-se por', 'Apaixonei-me por Salvador.', '✗ apaixonei-me de (ES: enamorarse de)'],
        ['casar(-se) com', 'Ela se casou com um carioca.', '(igual ao ES)'],
        ['interessar-se por', 'Interesso-me por política.', '✗ interesso-me em (ES: interesarse por ✓)'],
        ['responder a', 'Respondi ao e-mail.', 'Formal: "responder a"; ✗ "contestar o e-mail"'],
        ['em + o/a = no/na', 'Moro no Brasil, na Bahia.', '✗ en el Brasil / em o Brasil'],
        ['de + o/a = do/da', 'O livro do professor.', '✗ de el profesor'],
      ],
    },
    notaES:
      'Regla mental: cada vez que escribas "en el/la", "de el", "a el" o "por el", cámbialo por "no/na", "do", "ao", "pelo". Es la marca de portuñol más visible para un evaluador.',
  },
  {
    id: 'verbos',
    num: '03',
    titulo: 'Tempos verbais-chave no Brasil',
    subtitulo: 'Futuro do subjuntivo, infinitivo pessoal e colocação pronominal.',
    intro:
      'Três estruturas separam um texto Intermediário de um Avançado: o futuro do subjuntivo (que o espanhol praticamente perdeu), o infinitivo pessoal (que o espanhol não tem) e a colocação dos pronomes, que no Brasil segue regras próprias.',
    blocos: [
      {
        titulo: 'Futuro do subjuntivo',
        texto:
          'Usado depois de "quando", "se", "assim que", "enquanto", "sempre que", "logo que", "conforme", "quem" e "o que" para falar de ações futuras hipotéticas.',
        exemplos: [
          ['Quando eu for ao Brasil, vou visitar Ouro Preto.', 'ES: Cuando vaya a Brasil… (presente de subjuntivo)'],
          ['Se você puder, envie o documento hoje.', 'ES: Si puedes… (presente de indicativo)'],
          ['Assim que tivermos os resultados, avisaremos.', 'ES: En cuanto tengamos…'],
          ['Quem quiser participar deve se inscrever.', 'ES: Quien quiera…'],
        ],
        alerta: 'Erro clássico: "Quando eu vou ao Brasil" ou "Se você pode". Ambos soam a portunhol imediato.',
      },
      {
        titulo: 'Infinitivo pessoal (flexionado)',
        texto:
          'O infinitivo recebe terminação de pessoa quando tem sujeito próprio: -mos, -em, -es. Muito usado em textos argumentativos.',
        exemplos: [
          ['É fundamental os cidadãos participarem das decisões.', 'ES: Es fundamental que los ciudadanos participen…'],
          ['Saímos cedo para chegarmos a tempo.', 'ES: …para llegar a tiempo.'],
          ['Depois de assinarem o contrato, os moradores receberão as chaves.', 'ES: Después de firmar el contrato…'],
        ],
        alerta: 'Recurso de prestígio: substitui "que + subjuntivo" e deixa o texto mais enxuto.',
      },
      {
        titulo: 'Colocação pronominal no Brasil',
        texto:
          'Na fala brasileira, a próclise (pronome antes do verbo) é a regra geral, inclusive no início de frase: "Me chamo Ana". Na escrita formal, a norma-padrão evita começar frase com pronome oblíquo e pede ênclise ("Chamo-me Ana") ou reestruturação. Palavras negativas, advérbios e pronomes relativos atraem o pronome ("Não se esqueça", "que me disseram").',
        exemplos: [
          ['Dirijo-me a Vossa Senhoria para solicitar…', 'Carta formal: evite "Me dirijo…" no início.'],
          ['Não se esqueça de levar o documento.', 'Negação atrai o pronome (próclise).'],
          ['Gostaria de lhe agradecer… / Gostaria de agradecer-lhe…', 'Em locuções, as duas posições são aceitas.'],
          ['Te espero amanhã! (mensagem informal)', 'Na fala e em textos informais, "te" com "você" é muito frequente; num texto formal, mantenha a uniformidade.'],
        ],
        alerta: 'Mesóclise ("dir-lhe-ei") é rara e soa artificial fora de contextos muito solenes; evite.',
      },
    ],
    notaES:
      'El futuro de subjuntivo existe en español antiguo y legal ("si así no lo hiciere"), pero en portugués es plenamente vivo y obligatorio. Si en español usarías presente de subjuntivo después de "cuando", en portugués casi siempre va futuro de subjuntivo.',
  },
  {
    id: 'conectores',
    num: '04',
    titulo: 'Conectores de coesão avançada',
    subtitulo: 'Do "e… mas… então" ao repertório de um texto Avançado.',
    intro:
      'Conectores variados e bem empregados são um dos sinais mais visíveis de nível Avançado. Mas atenção: adequação vem antes de sofisticação. "Outrossim" num e-mail para um amigo é tão inadequado quanto "tipo assim" numa carta ao ministro.',
    tabela: {
      cols: ['Função', 'Conectores', 'Registro', 'Exemplo'],
      linhas: [
        ['Adição', 'além disso, ademais, outrossim, soma-se a isso', 'outrossim = muito formal', 'Além disso, o projeto reduz custos.'],
        ['Oposição', 'no entanto, contudo, todavia, em contrapartida, não obstante', 'formal', 'O custo é alto; em contrapartida, o retorno é rápido.'],
        ['Concessão', 'embora + subj., ainda que + subj., apesar de, por mais que + subj.', 'formal', 'Embora a medida seja impopular, é necessária.'],
        ['Causa', 'haja vista, uma vez que, visto que, porquanto', 'haja vista / porquanto = formal', 'Haja vista o aumento dos casos, a campanha foi prorrogada.'],
        ['Consequência', 'por conseguinte, portanto, dessa forma, de modo que', 'formal / neutro', 'Por conseguinte, a frequência caiu.'],
        ['Tema / referência', 'no que tange a, no que diz respeito a, quanto a, em relação a', 'no que tange = formal', 'No que tange ao transporte, a cidade avançou.'],
        ['Retomada / síntese', 'diante desse cenário, sob essa ótica, nesse sentido, à luz disso', 'formal', 'Diante desse cenário, urge agir.'],
        ['Conclusão', 'em suma, em síntese, portanto, dessa maneira', 'neutro', 'Em suma, a proposta é viável.'],
      ],
    },
    notaES:
      '"Haja vista" es invariable en el uso más recomendado ("haja vista os problemas"). "Embora" exige subjuntivo, igual que "aunque" con valor hipotético, pero NUNCA indicativo: "Embora é caro" ✗ → "Embora seja caro" ✓.',
  },
];

// ——— Desafios interativos do Radar ———
// Tipos:
//  clique   → frase com marcações [[errado|correto|explicação]]; o aluno clica nas palavras com portunhol
//  escolha  → lacuna com alternativas
//  registro → reescrever um texto informal em registro institucional (checagem por marcadores)

export const DESAFIOS = [
  // Falsos cognatos
  {
    id: 'r01', modulo: 'cognatos', tipo: 'clique', titulo: 'Reunião no escritório',
    contexto: 'Trecho de e-mail a um gestor de RH.',
    frase: 'Prezado Sr. Almeida, [[todavia|ainda|"Todavia" = "porém". Para "todavía" (ES) use "ainda".]] não recebi a resposta sobre a vaga. Estou disponível para conversar no seu escritório a qualquer momento.',
    es: '"Todavía no he recibido" → "Ainda não recebi". "Todavia" en PT es conector adversativo, sinónimo de "porém".',
  },
  {
    id: 'r02', modulo: 'cognatos', tipo: 'clique', titulo: 'Jantar inesquecível',
    contexto: 'Avaliação de restaurante numa plataforma.',
    frase: 'O peixe estava [[esquisito|delicioso|"Esquisito" em PT = estranho. Você estaria criticando o prato!]] e o garçom foi muito atencioso. Deixei uma boa [[propina|gorjeta|"Propina" em PT = suborno. Gorjeta é a "propina" do ES.]] na mesa.',
    es: '"Exquisito" → "delicioso, requintado". "Propina" → "gorjeta". Ambos son clásicos de examen.',
  },
  {
    id: 'r03', modulo: 'cognatos', tipo: 'escolha', titulo: 'Notícia de saúde',
    frase: 'A campanha atende gestantes. Se você está ___, procure a unidade de saúde mais próxima.',
    opcoes: ['embaraçada', 'grávida', 'embarazada', 'constrangida'],
    correta: 1,
    explicacao: '"Embaraçada" em PT significa constrangida ou enrolada. Para "embarazada" (ES), use "grávida" ou "gestante".',
    es: 'Uno de los falsos amigos más famosos: "Estou embaraçada" = "Estoy avergonzada".',
  },
  {
    id: 'r04', modulo: 'cognatos', tipo: 'clique', titulo: 'Ficha de inscrição',
    contexto: 'Instruções de um formulário universitário.',
    frase: 'Escreva seu nome completo e seu [[apelido|sobrenome|"Apelido" em PT = apodo. Para "apellido" (ES), use "sobrenome".]] e indique as [[asignaturas|disciplinas|"Asignatura" não existe em PT; "assinatura" = firma. Use "disciplinas" ou "matérias".]] que deseja cursar.',
    es: '"Apellido" → "sobrenome". "Asignatura" → "disciplina/matéria". "Assinatura" = firma o suscripción.',
  },
  {
    id: 'r05', modulo: 'cognatos', tipo: 'escolha', titulo: 'Na portaria',
    frase: 'Para abrir o portão, ___ a maçaneta na sua direção.',
    opcoes: ['empurre', 'puxe', 'puje', 'jale'],
    correta: 1,
    explicacao: '"Puxar" = trazer para si (ES: jalar/tirar). "Empurrar" = afastar de si (ES: empujar).',
    es: 'Atención en las puertas brasileñas: "PUXE" = tire / jale; "EMPURRE" = empuje.',
  },
  // Regência
  {
    id: 'r06', modulo: 'regencia', tipo: 'clique', titulo: 'Fim de semana cultural',
    contexto: 'Relato num blog de intercâmbio.',
    frase: 'No sábado [[assistí|assisti|Acentuação: em PT, "assisti" (1ª pessoa) não leva acento.]] [[a o|ao|Contração obrigatória: a + o = ao.]] show e depois fomos [[en el|no|Em PT: em + o = no. "En el" é espanhol.]] restaurante da praia.',
    es: 'En portugués las contracciones son obligatorias: ao, no, na, do, da, pelo, pela.',
  },
  {
    id: 'r07', modulo: 'regencia', tipo: 'escolha', titulo: 'Pedido formal',
    frase: 'Para concluir a matrícula, preciso ___ uma declaração da universidade.',
    opcoes: ['—', 'de', 'a', 'em'],
    correta: 1,
    explicacao: '"Precisar" pede "de" antes de substantivo: preciso de uma declaração. Antes de infinitivo, sem preposição: preciso estudar.',
    es: '"Necesito una declaración" → "Preciso de uma declaração". Es de los errores de regencia más frecuentes.',
  },
  {
    id: 'r08', modulo: 'regencia', tipo: 'clique', titulo: 'Paixão pelo Brasil',
    contexto: 'Carta de motivação para bolsa.',
    frase: 'Desde criança me [[interesso em|interesso por|"Interessar-se por" (ES: interesarse por). Evite "interessar-se em" em textos formais.]] cultura brasileira. Quando conheci Salvador, me apaixonei [[de|pela|"Apaixonar-se por" (+ a = pela). ES: enamorarse de.]] cidade.',
    es: '"Enamorarse DE" → "Apaixonar-se POR". "Interesarse por" → "interessar-se por".',
  },
  {
    id: 'r09', modulo: 'regencia', tipo: 'escolha', titulo: 'Registro formal',
    frase: 'Os candidatos devem chegar ___ local da prova com uma hora de antecedência.',
    opcoes: ['no', 'ao', 'en el', 'para o'],
    correta: 1,
    explicacao: 'A norma-padrão prefere "chegar a" (a + o = ao). "Chegar em" é muito usado no Brasil, mas num edital ou texto formal "ao" é a escolha mais segura.',
    es: '"Llegar a" ✓ coincide con la norma-padrão. No te dejes llevar por "chegar no", que oirás mucho en Brasil.',
  },
  // Verbos
  {
    id: 'r10', modulo: 'verbos', tipo: 'clique', titulo: 'Planos de viagem',
    contexto: 'Mensagem para uma anfitriã do Airbnb.',
    frase: 'Quando eu [[chego|chegar|Futuro do subjuntivo: "quando eu chegar" (ação futura).]] a Florianópolis, aviso você. Se você [[pode|puder|Futuro do subjuntivo de "poder": "se você puder".]], deixe a chave na portaria.',
    es: '"Cuando llegue" → "quando eu chegar". "Si puedes" → "se você puder". El futuro de subjuntivo es obligatorio aquí.',
  },
  {
    id: 'r11', modulo: 'verbos', tipo: 'escolha', titulo: 'Argumentação',
    frase: 'É fundamental os moradores ___ das decisões sobre o bairro.',
    opcoes: ['participar', 'participarem', 'participem', 'participam'],
    correta: 1,
    explicacao: 'Infinitivo pessoal: o sujeito "os moradores" está explícito, então o infinitivo se flexiona: participarem.',
    es: 'En español diríamos "que los vecinos participen". En PT puedes usar "que participem" o, más elegante, el infinitivo personal.',
  },
  {
    id: 'r12', modulo: 'verbos', tipo: 'escolha', titulo: 'Carta formal',
    frase: '___ a Vossa Senhoria para solicitar a revisão da multa.',
    opcoes: ['Me dirijo', 'Dirijo-me', 'Dirigo-me', 'Me dirigo'],
    correta: 1,
    explicacao: 'No início de frase, em texto formal, a norma-padrão pede ênclise: "Dirijo-me". Atenção à grafia: dirigir → dirijo.',
    es: '"Me dirijo a usted" → "Dirijo-me a Vossa Senhoria" (o, más natural hoy: "Venho, por meio desta, solicitar…").',
  },
  {
    id: 'r13', modulo: 'verbos', tipo: 'clique', titulo: 'Experiência profissional',
    contexto: 'Relato numa entrevista escrita.',
    frase: 'Hoje [[he aprendido|aprendi|O pretérito perfeito composto do ES corresponde em geral ao perfeito simples em PT.]] que errar faz parte. Já [[tenho trabalhado|trabalhei|"Tenho trabalhado" indica ação repetida que continua; para experiência concluída, use "trabalhei".]] em três países.',
    es: '"He aprendido" → "aprendi". "Tenho trabalhado" significa "he estado trabajando (últimamente)", no "he trabajado (alguna vez)".',
  },
  // Conectores
  {
    id: 'r14', modulo: 'conectores', tipo: 'escolha', titulo: 'Concessão',
    frase: '___ a medida seja impopular, ela é necessária para reduzir o déficit.',
    opcoes: ['Embora', 'Porque', 'Haja vista', 'Portanto'],
    correta: 0,
    explicacao: '"Embora" + subjuntivo introduz concessão. "Haja vista" indica causa; "portanto", conclusão.',
    es: '"Aunque sea impopular" → "Embora seja impopular". Nunca "embora é".',
  },
  {
    id: 'r15', modulo: 'conectores', tipo: 'escolha', titulo: 'Causa formal',
    frase: '___ o aumento dos casos de dengue, a campanha de prevenção foi prorrogada.',
    opcoes: ['Em contrapartida', 'Haja vista', 'Outrossim', 'Embora'],
    correta: 1,
    explicacao: '"Haja vista" (= tendo em vista, considerando) introduz a causa. É formal e adequado a comunicados.',
    es: 'Equivale a "dado / habida cuenta de". Muy útil en notas oficiales y cartas abiertas.',
  },
  {
    id: 'r16', modulo: 'conectores', tipo: 'clique', titulo: 'Portunhol camuflado',
    contexto: 'Parágrafo de artigo de opinião.',
    frase: 'A proposta é cara; [[sin embargo|no entanto|"Sin embargo" é espanhol. Use "no entanto", "contudo", "entretanto" ou "todavia".]], seus benefícios são evidentes. [[Además|Além disso|"Además" é espanhol. Em PT: "além disso", "ademais".]], a população apoia a ideia.',
    es: 'Los conectores son el lugar donde más se "escapa" el español sin que el alumno lo note.',
  },
  // Registro
  {
    id: 'r17', modulo: 'conectores', tipo: 'registro', titulo: 'Do WhatsApp ao ofício',
    instrucao: 'Reescreva a mensagem abaixo como um e-mail formal ao síndico do prédio. Mantenha as informações, mude o registro.',
    original: 'Oi, seu Carlos! Tudo bem? Então, a lâmpada da garagem tá queimada faz uma semana e tá um breu lá embaixo, dá medo. Vc pode mandar alguém trocar? Valeu!',
    marcadores: [
      { rotulo: 'Saudação formal (Prezado…)', re: '\\bprezad[oa]\\b|\\bsenhor\\b|\\bsr\\.' },
      { rotulo: 'Menciona a lâmpada da garagem', re: 'l[âa]mpada' },
      { rotulo: 'Indica o tempo (uma semana)', re: 'semana' },
      { rotulo: 'Pedido cortês (solicito / gostaria / poderia)', re: 'solicit|gostaria|poderia|seria poss' },
      { rotulo: 'Despedida formal (Atenciosamente / Cordialmente)', re: 'atenciosamente|cordialmente|respeitosamente' },
    ],
    proibidos: ['\\boi\\b', '\\btá\\b', '\\bvc\\b', '\\bvaleu\\b', '\\bentão,', '\\bdá medo\\b'],
    modelo:
      'Prezado Sr. Carlos,\n\nInformo que a lâmpada da garagem está queimada há cerca de uma semana. Com a área completamente escura, a circulação de moradores e veículos tornou-se insegura, sobretudo à noite.\n\nDiante disso, solicito que seja providenciada a substituição da lâmpada com a maior brevidade possível.\n\nAtenciosamente,\nAna Torres — apto. 304',
    es: '"Hace una semana" → "há uma semana" (con h, verbo haver). Error frecuente: "a uma semana".',
  },
  {
    id: 'r18', modulo: 'conectores', tipo: 'registro', titulo: 'Reclamação institucional',
    instrucao: 'Transforme o desabafo em um parágrafo de reclamação formal à operadora de internet.',
    original: 'Gente, que absurdo! A internet cai toda hora e ninguém resolve nada. Já liguei mil vezes e nada. Tô pagando por um serviço que não funciona!!!',
    marcadores: [
      { rotulo: 'Fórmula de insatisfação (venho manifestar / lamento)', re: 'venho|manifest|lament|insatisfa' },
      { rotulo: 'Fato concreto (quedas/instabilidade)', re: 'qued|instabil|interrup|oscila' },
      { rotulo: 'Contatos anteriores (protocolo / atendimento)', re: 'protocolo|atendimento|contat|liga' },
      { rotulo: 'Pedido de solução ou ressarcimento', re: 'solicit|ressarc|abatimento|solu[çc]|providênc' },
    ],
    proibidos: ['\\bgente\\b', '!!', '\\btô\\b', 'mil vezes', '\\bque absurdo\\b'],
    modelo:
      'Venho manifestar minha insatisfação com as constantes quedas de conexão registradas desde o início do mês. Apesar de ter entrado em contato com o atendimento em quatro ocasiões (protocolos 4821, 4907, 5013 e 5120), o problema não foi solucionado. Diante disso, solicito a visita de um técnico em até cinco dias úteis e o abatimento proporcional na próxima fatura.',
    es: 'Las exageraciones ("mil vezes") deben convertirse en datos concretos: es justo lo que valora la rúbrica de adecuación.',
  },
  {
    id: 'r19', modulo: 'cognatos', tipo: 'clique', titulo: 'Anúncio de aluguel',
    contexto: 'Classificado de imóvel.',
    frase: 'Apartamento com [[balcón|varanda|"Balcón" (ES) = varanda/sacada. "Balcão" em PT é o mostrador de uma loja.]] e sala ampla. A rua é [[larga|comprida|Se a ideia é extensão, "comprida". "Larga" em PT = ancha.]], com 2 km de árvores.',
    es: '"Calle larga" (extensa) → "rua comprida". "Rua larga" = calle ancha.',
  },
  {
    id: 'r20', modulo: 'regencia', tipo: 'clique', titulo: 'Gostos pessoais',
    contexto: 'Parte oral — apresentação pessoal transcrita.',
    frase: '[[Me gusta|Gosto de|"Gostar de": o sujeito é a pessoa. ES "me gusta" → PT "gosto de".]] ler crônicas e [[sonho en|sonho com|"Sonhar com" (igual ao ES "soñar con").]] morar em Lisboa algum dia. Eu também gosto [[a|de|"Gostar" sempre pede "de".]] cozinhar.',
    es: 'Estructura invertida: "me gusta X" → "(eu) gosto de X". Error número uno en la entrevista oral.',
  },
];

// Detector de portunhol usado na autópsia das redações (heurístico).
// Cada padrão: regex, sugestão, explicação. Não substitui leitura humana.
export const PORTUNHOL = [
  { re: '\\bmuy\\b', sug: 'muito', exp: '"Muy" é espanhol.' },
  { re: '\\bpero\\b', sug: 'mas / porém', exp: '"Pero" é espanhol.' },
  { re: '\\bsin embargo\\b', sug: 'no entanto / contudo', exp: 'Conector espanhol.' },
  { re: '\\bademás\\b', sug: 'além disso', exp: 'Conector espanhol.' },
  { re: '\\btambién\\b', sug: 'também', exp: 'Grafia espanhola.' },
  { re: '\\b(en el|en la|en los|en las)\\b', sug: 'no / na / nos / nas', exp: 'Contração obrigatória: em + artigo.' },
  { re: '\\bem (o|a|os|as)\\b', sug: 'no / na / nos / nas', exp: 'Contração obrigatória: em + o = no.' },
  { re: '\\bde (o|a|os|as)\\b(?! (que|qual|quais)\\b)', sug: 'do / da / dos / das', exp: 'Contração obrigatória: de + o = do (exceto antes de sujeito de infinitivo).' },
  { re: '\\ba o\\b', sug: 'ao', exp: 'Contração obrigatória: a + o = ao.' },
  { re: '\\bpor (o|a|os|as)\\b', sug: 'pelo / pela', exp: 'Contração obrigatória: por + o = pelo.' },
  { re: '\\b(el|los|las)\\b', sug: 'o / os / as', exp: 'Artigo espanhol.' },
  { re: '\\bhay\\b', sug: 'há / tem', exp: '"Hay" é espanhol.' },
  { re: '\\b(lo que)\\b', sug: 'o que', exp: '"Lo que" é espanhol.' },
  { re: '\\bpor eso\\b', sug: 'por isso', exp: '"Por eso" é espanhol.' },
  { re: '\\baunque\\b', sug: 'embora / ainda que', exp: '"Aunque" é espanhol.' },
  { re: '\\bcuando\\b', sug: 'quando', exp: 'Grafia espanhola.' },
  { re: '\\bentonces\\b', sug: 'então', exp: 'Grafia espanhola.' },
  { re: '\\b\\w+ción\\b', sug: '-ção', exp: 'Terminação espanhola -ción → -ção.' },
  { re: '\\b\\w+dad\\b', sug: '-dade', exp: 'Terminação espanhola -dad → -dade.' },
  { re: '\\btodavia\\b', sug: 'ainda (se quis dizer "todavía")', exp: '"Todavia" = porém. Confira o sentido.' },
  { re: '\\besquisit[oa]s?\\b', sug: 'delicioso / requintado (se quis elogiar)', exp: '"Esquisito" = estranho.' },
  { re: '\\bpropina\\b', sug: 'gorjeta', exp: '"Propina" em PT = suborno.' },
  { re: '\\bme gusta\\b', sug: 'gosto de', exp: 'Estrutura espanhola.' },
  { re: '\\bpreciso (um|uma|uns|umas|o|a|os|as|mais|ajuda)\\b', sug: 'preciso de…', exp: '"Precisar" pede "de" antes de substantivo.' },
  { re: '\\bcontestar\\b', sug: 'responder', exp: '"Contestar" em PT = refutar.' },
  { re: '\\bdesarroll\\w*', sug: 'desenvolvimento / desenvolver', exp: 'Raiz espanhola.' },
  { re: '\\bnecesit\\w*', sug: 'preciso de / necessito', exp: 'Grafia espanhola.' },
  { re: '\\bquando (eu |você |ele |ela |nós |eles |elas )?(vou|vai|vamos|vão|tenho|tem|temos|posso|pode|podemos|chego|chega|sou|é|estou|está)\\b', sug: 'futuro do subjuntivo (quando eu for / tiver / puder / chegar)', exp: 'Ação futura após "quando" pede futuro do subjuntivo.' },
  { re: '\\bse (você|vocês|eu|ele|ela) (pode|podem|posso|quer|querem|tem|têm)\\b', sug: 'se você puder / quiser / tiver', exp: 'Hipótese futura pede futuro do subjuntivo.' },
  { re: '\\bembora (é|está|tem|há|são|estão|foi)\\b', sug: 'embora seja / esteja / tenha / haja', exp: '"Embora" exige subjuntivo.' },
  { re: '\\b(me|te|se) (dirijo|chamo|despeço)\\b', sug: 'Dirijo-me / Despeço-me (no início, em texto formal)', exp: 'Colocação pronominal em início de frase formal.', soloInicio: true },
  { re: '\\ba (uma|dois|duas|três|alguns|algumas|muitos) (dia|dias|semana|semanas|mês|meses|ano|anos)\\b atr[aá]s', sug: 'há … (sem "atrás") ou … atrás', exp: 'Tempo decorrido: "há uma semana" ou "uma semana atrás".' },
];

// Marcas de informalidade (penalizam gêneros formais)
export const INFORMAL = ['\\bvc\\b', '\\bpq\\b', '\\btb\\b', '\\btá\\b', '\\btô\\b', '\\bpra\\b', '\\bné\\b', '\\btipo\\b,', '\\bcara\\b', '\\bvaleu\\b', '\\boi\\b', '\\bbeijos?\\b', '\\babraços\\b', '\\bkkk+\\b', '!!+'];

export const CONECTORES = [
  'além disso', 'ademais', 'outrossim', 'soma-se a isso', 'no entanto', 'contudo', 'todavia', 'entretanto', 'em contrapartida',
  'não obstante', 'embora', 'ainda que', 'apesar de', 'por mais que', 'haja vista', 'uma vez que', 'visto que', 'porquanto',
  'por conseguinte', 'portanto', 'dessa forma', 'desse modo', 'de modo que', 'no que tange', 'no que diz respeito', 'quanto a',
  'em relação a', 'diante desse cenário', 'diante disso', 'sob essa ótica', 'nesse sentido', 'à luz de', 'em suma', 'em síntese',
  'por fim', 'em primeiro lugar', 'por outro lado', 'cabe ressaltar', 'vale destacar', 'isto é', 'ou seja', 'por exemplo', 'assim',
  'logo', 'pois', 'tendo em vista', 'conforme', 'segundo', 'porém', 'já que', 'ao mesmo tempo', 'por isso', 'além de', 'caso',
  'mas', 'afinal', 'sobretudo', 'aliás', 'de fato', 'inclusive', 'enquanto', 'desde que', 'como resultado', 'por um lado',
];
