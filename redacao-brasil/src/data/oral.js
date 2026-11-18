// Pilar 4 — Simulador da Parte Oral
// Elementos provocadores fictícios, criados para fins didáticos.

export const FASE1 = {
  titulo: 'Conversa inicial',
  duracao: 5,
  explicacao:
    'Nos primeiros minutos, o avaliador conversa com você a partir das informações do questionário de inscrição (interesses, profissão, motivos para estudar português). É um aquecimento — mas já está sendo avaliado. Responda com frases completas, dê exemplos e devolva a conversa com naturalidade.',
  perguntas: [
    'Para começar, fale um pouco sobre você: o que você faz e onde mora?',
    'Vi no seu questionário que você se interessa por [interesse]. Como começou esse interesse?',
    'Por que você decidiu estudar português e fazer o Celpe-Bras?',
    'Você já esteve no Brasil? O que mais chamou sua atenção — ou o que espera encontrar?',
    'Como você costuma praticar o português no dia a dia?',
    'Que diferenças você percebe entre o português e o espanhol que mais te desafiam?',
  ],
  dicas: [
    'Evite respostas de uma palavra. Use a estrutura: resposta + motivo + exemplo.',
    'Se não entender, peça: "Desculpe, você poderia repetir?" ou "Não sei se entendi bem: você quer saber se…?"',
    'Ganhe tempo com naturalidade: "Boa pergunta…", "Deixa eu pensar…", "Olha, …"',
    'Cuidado com "me gusta" → "eu gosto de"; "muy" → "muito"; "pero" → "mas".',
  ],
  modelo: {
    pergunta: 'Por que você decidiu estudar português?',
    resposta:
      'Olha, por dois motivos principais. O primeiro é profissional: trabalho numa empresa de logística em Lima que tem cada vez mais clientes no Brasil, e eu percebi que, mesmo entendendo bastante, eu não conseguia negociar com segurança. O segundo é mais pessoal: sou apaixonado por música brasileira, especialmente por bossa nova, e queria entender as letras de verdade, não só pela metade. Aliás, foi ouvindo Tom Jobim que eu aprendi minhas primeiras palavras.',
    comentario:
      'Estrutura clara ("dois motivos… O primeiro… O segundo…"), marcadores de oralidade naturais ("Olha", "Aliás"), regência correta ("apaixonado por") e um detalhe pessoal que abre espaço para o avaliador continuar a conversa.',
  },
};

export const ELEMENTOS = [
  {
    id: 'e1',
    titulo: 'Gerações Conectadas',
    tipo: 'Capa de revista',
    visual: {
      estilo: 'capa',
      revista: 'VIVA',
      edicao: 'Edição 412 · Comportamento',
      manchete: 'Avós nas redes',
      subtitulo: 'Brasileiros com mais de 60 anos são o grupo que mais cresce nas redes sociais. Inclusão digital ou nova solidão?',
      chamadas: ['Golpes virtuais: como proteger seus pais', 'Netos ensinam, avós aprendem — e vice-versa'],
      cor: 'ocre',
    },
    roteiro: [
      'O que você vê nesta capa? Que tipo de publicação parece ser?',
      'Qual é o tema principal apresentado aqui?',
      'O que você entende por "inclusão digital ou nova solidão"?',
      'Na sua opinião, por que os idosos estão usando mais as redes sociais?',
      'Que benefícios e riscos você vê nesse fenômeno?',
      'Você conhece alguém mais velho que usa redes sociais? Como é a experiência dessa pessoa?',
      'No seu país, como é a relação dos idosos com a tecnologia? É parecida com a do Brasil?',
      'Que medidas poderiam ajudar os idosos a usar a internet com mais segurança?',
    ],
    vocabulario: ['inclusão digital', 'golpe virtual', 'terceira idade', 'letramento digital', 'convívio entre gerações', 'isolamento social'],
    modelos: [
      {
        pergunta: 'O que você entende por "inclusão digital ou nova solidão"?',
        resposta:
          'Eu entendo que a revista levanta uma dúvida. Por um lado, quando os idosos entram nas redes, eles conseguem falar com a família, acompanhar os netos, fazer novos amigos — isso é inclusão. Por outro lado, existe o risco de que a tela substitua o contato real: a pessoa passa horas no celular, mas continua sozinha em casa. Então o título sugere que a tecnologia pode aproximar ou isolar, dependendo de como é usada.',
        comentario: 'Interpreta o título (não só descreve), usa "Por um lado… Por outro lado…" e fecha com síntese. Subjuntivo correto: "o risco de que a tela substitua".',
      },
      {
        pergunta: 'No seu país, como é a relação dos idosos com a tecnologia?',
        resposta:
          'Na Colômbia, eu diria que é bem parecida, mas com uma diferença importante: fora das grandes cidades, muitos idosos ainda não têm acesso à internet de qualidade. Minha avó, por exemplo, mora numa cidade pequena e só aprendeu a fazer videochamadas durante a pandemia, porque era a única forma de ver os bisnetos. Hoje ela manda áudios para todo mundo — às vezes até demais!',
        comentario: 'Compara com o próprio país, traz exemplo pessoal concreto e um toque de humor — tudo o que o avaliador espera na pergunta de comparação.',
      },
    ],
  },
  {
    id: 'e2',
    titulo: 'Vacina é Proteção Coletiva',
    tipo: 'Cartaz de campanha pública',
    visual: {
      estilo: 'campanha',
      orgao: 'Campanha Nacional de Vacinação (peça fictícia)',
      manchete: 'Vacinou, protegeu.',
      subtitulo: 'Quando você se vacina, protege também quem não pode se vacinar: bebês, pessoas em tratamento contra o câncer e imunossuprimidos.',
      chamadas: ['Leve sua caderneta de vacinação', 'Unidades de saúde abertas também aos sábados'],
      cor: 'selva',
    },
    roteiro: [
      'Do que trata este material? Onde você imagina que ele seria divulgado?',
      'A quem ele se dirige?',
      'Explique com suas palavras a ideia de "proteção coletiva".',
      'Por que, na sua opinião, algumas pessoas deixam de se vacinar?',
      'Você acha que campanhas como esta são eficazes? Por quê?',
      'Que outras estratégias poderiam aumentar a vacinação?',
      'Como funcionam as campanhas de vacinação no seu país?',
      'Você acha que o governo deveria tornar algumas vacinas obrigatórias? Justifique.',
    ],
    vocabulario: ['cobertura vacinal', 'caderneta de vacinação', 'imunidade coletiva', 'hesitação vacinal', 'desinformação', 'posto/unidade de saúde'],
    modelos: [
      {
        pergunta: 'Por que algumas pessoas deixam de se vacinar?',
        resposta:
          'Acho que há vários motivos. Um deles é a desinformação: circulam muitas notícias falsas nas redes, e as pessoas acabam com medo de efeitos colaterais. Outro motivo, que às vezes a gente esquece, é prático: quem trabalha o dia todo nem sempre consegue ir ao posto em horário comercial. Por isso, achei interessante que o cartaz diga que as unidades abrem aos sábados — isso responde a uma dificuldade real.',
        comentario: 'Organiza a resposta em motivos, relaciona com o elemento provocador ("o cartaz diga…" — subjuntivo após "achei interessante que"). Ótima integração entre opinião e texto.',
      },
    ],
  },
  {
    id: 'e3',
    titulo: 'A Cidade das Bicicletas',
    tipo: 'Infográfico',
    visual: {
      estilo: 'infografico',
      manchete: 'Pedalar para o trabalho',
      subtitulo: 'Pesquisa fictícia com 2.000 moradores de uma capital brasileira',
      barras: [
        { rotulo: 'Usam a bicicleta para trabalhar', valor: 12 },
        { rotulo: 'Usariam se houvesse ciclovia segura', valor: 47 },
        { rotulo: 'Não usariam de jeito nenhum', valor: 41 },
      ],
      chamadas: ['Principal obstáculo citado: medo do trânsito (63%)', 'Calor e falta de vestiário no trabalho aparecem em seguida'],
      cor: 'petroleo',
    },
    roteiro: [
      'O que este infográfico apresenta?',
      'Que dado mais chamou sua atenção? Por quê?',
      'Como você interpreta a diferença entre os 12% que usam e os 47% que usariam?',
      'Quais são os obstáculos para o uso da bicicleta, segundo o material?',
      'Você usa ou usaria a bicicleta como meio de transporte? Em que condições?',
      'O que as empresas poderiam fazer para incentivar os funcionários a pedalar?',
      'Como é a mobilidade urbana na sua cidade? Há ciclovias?',
      'Você acha que a bicicleta é uma solução real para o trânsito das grandes cidades ou apenas uma alternativa para poucos?',
    ],
    vocabulario: ['ciclovia / ciclofaixa', 'mobilidade urbana', 'trânsito', 'deslocamento', 'vestiário', 'infraestrutura'],
    modelos: [
      {
        pergunta: 'Como você interpreta a diferença entre os 12% e os 47%?',
        resposta:
          'Para mim, esse é o dado mais revelador do infográfico. Ele mostra que existe uma demanda reprimida: quase metade das pessoas gostaria de pedalar, mas não se sente segura. Ou seja, o problema não é falta de vontade, e sim de infraestrutura. Se a cidade construísse ciclovias protegidas, o número de ciclistas poderia, em tese, quadruplicar.',
        comentario: 'Interpreta (não apenas lê) os números, usa "demanda reprimida", "não é…, e sim…" e hipótese com imperfeito do subjuntivo ("Se a cidade construísse"). Nota: "em tese" mostra cautela argumentativa.',
      },
    ],
  },
  {
    id: 'e4',
    titulo: 'Quatro Dias, Mesma Produtividade?',
    tipo: 'Manchete com foto-legenda',
    visual: {
      estilo: 'jornal',
      jornal: 'Diário do Planalto (fictício)',
      manchete: 'Empresas testam semana de quatro dias; 8 em cada 10 decidem manter o modelo',
      subtitulo: 'Projeto-piloto com 21 empresas aponta queda no estresse e nas faltas. Críticos dizem que o modelo não serve para comércio e serviços.',
      legenda: 'Funcionários de uma agência de design durante a "sexta livre", em Brasília.',
      cor: 'ink',
    },
    roteiro: [
      'O que você vê aqui? Qual é a notícia?',
      'O que significa "semana de quatro dias"?',
      'Que resultados o projeto-piloto apresentou?',
      'Por que, segundo os críticos, o modelo não serviria para todos os setores?',
      'Você gostaria de trabalhar quatro dias por semana? O que faria com o dia livre?',
      'Que impactos essa mudança poderia ter na economia e na vida das famílias?',
      'No seu país, discute-se a redução da jornada de trabalho? Como?',
      'Na sua opinião, o futuro do trabalho será de menos horas ou de mais flexibilidade? Por quê?',
    ],
    vocabulario: ['jornada de trabalho', 'projeto-piloto', 'produtividade', 'esgotamento (burnout)', 'carteira assinada', 'setor de serviços'],
    modelos: [
      {
        pergunta: 'Por que o modelo não serviria para todos os setores?',
        resposta:
          'Bom, pelo que entendi da manchete, os críticos argumentam que no comércio e nos serviços o trabalho depende da presença física: uma loja ou um hospital não podem simplesmente fechar na sexta. Nesses casos, seria preciso contratar mais gente ou criar escalas, o que aumenta os custos. Mas eu acho que isso não invalida a ideia; talvez ela precise ser adaptada a cada setor, em vez de aplicada da mesma forma para todos.',
        comentario: 'Reformula o argumento do texto, desenvolve consequência e contra-argumenta com nuance ("em vez de…"). Marcadores "Bom", "pelo que entendi" dão naturalidade.',
      },
    ],
  },
];

export const RUBRICA_ORAL = [
  { criterio: 'Compreensão', descricao: 'Entende as perguntas e o elemento provocador; responde ao que foi perguntado.' },
  { criterio: 'Competência interacional', descricao: 'Mantém a conversa, desenvolve respostas, pede esclarecimentos com naturalidade.' },
  { criterio: 'Fluência', descricao: 'Fala com ritmo contínuo, pausas naturais, sem bloqueios longos.' },
  { criterio: 'Adequação lexical', descricao: 'Vocabulário variado e preciso; ausência de palavras do espanhol.' },
  { criterio: 'Adequação gramatical', descricao: 'Estruturas variadas (subjuntivo, conectores), poucos erros que não comprometem.' },
  { criterio: 'Pronúncia', descricao: 'Inteligível; vogais nasais, "lh/nh", "s" sonoro entre vogais, sem interferência que dificulte a compreensão.' },
];
