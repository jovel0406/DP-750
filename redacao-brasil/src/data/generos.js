// Pilar 1 — Academia de Gêneros Textuais
// Todos os exemplos são textos originais, escritos para fins didáticos.
// "rubrica" explica por que o parágrafo atende à grade de avaliação (adaptação pedagógica
// dos critérios do INEP: contexto/enunciador/interlocutor/propósito, coesão-coerência, léxico-gramática).

export const GENEROS = [
  {
    id: 'carta-leitor',
    nome: 'Carta do Leitor',
    familia: 'Argumentar em público',
    frequencia: 'altíssima',
    resumo:
      'Texto enviado por um leitor a um jornal ou revista para reagir a uma matéria publicada: concorda, discorda, complementa ou corrige.',
    noExame:
      'Aparece com frequência nas Tarefas 3 e 4: você lê uma reportagem e escreve à seção de cartas da publicação, posicionando-se sobre ela.',
    anatomia: [
      { parte: 'Vocativo', funcao: 'Dirigir-se à redação ou ao editor.', exemplo: 'Prezados editores da Revista Cidade Viva,', dica: 'Use o nome da publicação citada na consigna. Nunca "Querido amigo".' },
      { parte: 'Abertura com referência', funcao: 'Identificar a matéria que motiva a carta (título, edição, autor).', exemplo: 'Li com grande interesse a reportagem "A cidade que encolheu", publicada na edição de março…', dica: 'O avaliador verifica se o leitor da revista entenderia de que matéria você fala.' },
      { parte: 'Posicionamento', funcao: 'Dizer claramente se concorda, discorda ou complementa.', exemplo: 'Concordo apenas em parte com o diagnóstico apresentado.', dica: 'Uma frase-tese curta, logo no 1º ou 2º parágrafo.' },
      { parte: 'Argumentação com dados da fonte', funcao: 'Retomar informações do texto-base com suas palavras e acrescentar experiência ou argumento.', exemplo: 'Segundo a própria reportagem, 40% dos moradores…', dica: 'Parafrasear, não copiar. Copiar trechos longos derruba a nota.' },
      { parte: 'Fechamento', funcao: 'Sugestão, expectativa ou agradecimento.', exemplo: 'Espero que a revista continue dando espaço a esse debate.', dica: 'Feche o raciocínio; não abra tema novo.' },
      { parte: 'Despedida e assinatura', funcao: 'Identificar o leitor (nome, cidade, às vezes profissão).', exemplo: 'Atenciosamente,\nMariana Restrepo — Curitiba (PR)', dica: 'Cartas de leitor costumam trazer nome e cidade.' },
    ],
    registro: {
      nivel: 'Formal a semiformal',
      tom: 'Crítico, cordial, assertivo',
      pessoa: '1ª pessoa do singular ("eu") é natural e esperada',
      evitar: ['gírias (tipo, cara, massa)', 'abreviações de internet (vc, pq, tb)', 'ataques pessoais ao jornalista'],
    },
    chaves: [
      { funcao: 'Referir-se à matéria', frases: ['Li com atenção a reportagem "…", publicada em…', 'Venho, por meio desta, comentar a matéria…', 'Ao ler o artigo assinado por…, não pude deixar de…'] },
      { funcao: 'Posicionar-se', frases: ['Concordo plenamente com…', 'Discordo, no entanto, da ideia de que…', 'Gostaria de acrescentar um ponto que não foi abordado:'] },
      { funcao: 'Retomar a fonte', frases: ['Conforme aponta a própria reportagem,', 'De acordo com os dados apresentados,', 'Como bem lembra o especialista entrevistado,'] },
      { funcao: 'Fechar', frases: ['Parabenizo a revista pela iniciativa de…', 'Espero que o tema volte a ser discutido em edições futuras.', 'Fica, portanto, minha sugestão de que…'] },
    ],
    exemplo: {
      consigna:
        'Você leu na Revista Cidade Viva uma reportagem sobre o fechamento de bibliotecas de bairro. Escreva uma carta à seção de leitores posicionando-se sobre o tema.',
      paragrafos: [
        { parte: 'Vocativo', texto: 'Prezados editores da Revista Cidade Viva,', rubrica: 'Interlocutor correto e explícito: a redação da revista. Vocativo formal adequado ao gênero.' },
        { parte: 'Abertura', texto: 'Li com atenção a reportagem "Estantes vazias", publicada na edição de março, sobre o fechamento de seis bibliotecas de bairro na capital. Como frequentadora da biblioteca da Vila Esperança há quase dez anos, senti-me na obrigação de escrever.', rubrica: 'Situa a matéria (título, edição, tema) e justifica o lugar de fala do enunciador. O leitor da revista entende o contexto sem ter lido a matéria.' },
        { parte: 'Posicionamento', texto: 'Concordo com o diagnóstico apresentado: os prédios estão deteriorados e o acervo, desatualizado. Discordo, no entanto, da conclusão de que a solução seja concentrar tudo em uma única biblioteca central.', rubrica: 'Tese clara e matizada (concordo / discordo, no entanto). Mostra leitura crítica, não mera repetição.' },
        { parte: 'Argumentação', texto: 'A própria reportagem informa que 60% dos usuários dessas unidades são crianças e idosos, justamente os que têm mais dificuldade de se deslocar. Para eles, fechar a biblioteca do bairro equivale a fechar o acesso à leitura. Além disso, esses espaços funcionam como pontos de encontro comunitário, algo que nenhum prédio central, por mais moderno que seja, consegue substituir.', rubrica: 'Usa dado do texto-base parafraseado (60%) e acrescenta argumento próprio. Conectores "Além disso", "por mais… que" garantem progressão.' },
        { parte: 'Fechamento', texto: 'Sugiro que a prefeitura considere parcerias com escolas e associações de moradores para manter as unidades abertas. Parabenizo a revista por dar visibilidade ao tema e espero que ele volte a ser discutido.', rubrica: 'Proposta concreta + cordialidade com a publicação. Fecha o propósito comunicativo.' },
        { parte: 'Assinatura', texto: 'Atenciosamente,\nMariana Restrepo — São Paulo (SP)', rubrica: 'Despedida formal e identificação típica do gênero (nome + cidade).' },
      ],
    },
    armadilhas: [
      'Escrever uma redação escolar sem vocativo nem assinatura: o gênero não é reconhecido.',
      'Resumir a reportagem sem se posicionar: o propósito (reagir) não é cumprido.',
      'Dirigir-se ao "autor da reportagem" quando a consigna pede a seção de cartas.',
    ],
    notaES:
      'En español la "Carta al director" funciona igual, pero en portugués se usa más "Prezados editores" / "Prezado editor" que "Estimado director". Evita "Les escribo para…" → "Escrevo para…" o "Venho, por meio desta,…".',
  },
  {
    id: 'carta-aberta',
    nome: 'Carta Aberta',
    familia: 'Argumentar em público',
    frequencia: 'alta',
    resumo:
      'Carta dirigida a uma autoridade ou instituição, mas publicada para que toda a sociedade a leia. Une reivindicação e argumentação.',
    noExame:
      'Comum quando a consigna pede que você, como representante de um grupo (moradores, estudantes, pais), se dirija a uma autoridade sobre um problema coletivo.',
    anatomia: [
      { parte: 'Título', funcao: 'Identificar o gênero e o destinatário.', exemplo: 'Carta aberta ao secretário municipal de Mobilidade', dica: 'O título já sinaliza que o texto é público.' },
      { parte: 'Vocativo', funcao: 'Nomear a autoridade com o pronome de tratamento adequado.', exemplo: 'Excelentíssimo Senhor Secretário,', dica: 'Para autoridades: Excelentíssimo(a) / Ilustríssimo(a) / Senhor(a).' },
      { parte: 'Apresentação dos signatários', funcao: 'Dizer quem fala e em nome de quem.', exemplo: 'Nós, moradores do bairro Jardim das Flores, reunidos em associação…', dica: 'Normalmente em 1ª pessoa do plural.' },
      { parte: 'Exposição do problema', funcao: 'Descrever a situação com dados.', exemplo: 'Desde janeiro, a linha 302 deixou de circular aos domingos…', dica: 'Dados concretos dão credibilidade.' },
      { parte: 'Argumentação e reivindicação', funcao: 'Justificar e pedir ações concretas.', exemplo: 'Diante desse cenário, solicitamos…', dica: 'Pedidos numerados ou bem delimitados.' },
      { parte: 'Fechamento e assinatura coletiva', funcao: 'Reforçar o apelo e assinar como grupo.', exemplo: 'Certos de sua atenção, subscrevemo-nos.\nAssociação de Moradores do Jardim das Flores', dica: 'Data e local também são bem-vindos.' },
    ],
    registro: {
      nivel: 'Formal',
      tom: 'Firme, respeitoso, mobilizador',
      pessoa: '1ª pessoa do plural ("nós")',
      evitar: ['tom agressivo ou ameaçador', 'informalidades', 'pedidos vagos ("que façam alguma coisa")'],
    },
    chaves: [
      { funcao: 'Apresentar-se', frases: ['Nós, abaixo assinados, …', 'Em nome da comunidade escolar…, vimos manifestar…'] },
      { funcao: 'Expor o problema', frases: ['É de conhecimento público que…', 'Há meses, a comunidade convive com…', 'Os dados não deixam dúvida:'] },
      { funcao: 'Reivindicar', frases: ['Diante desse cenário, solicitamos que…', 'Reivindicamos, em caráter de urgência,…', 'É imprescindível que o poder público…'] },
      { funcao: 'Fechar', frases: ['Certos de contar com sua sensibilidade,…', 'Aguardamos um posicionamento oficial.', 'Respeitosamente,'] },
    ],
    exemplo: {
      consigna:
        'Como representante dos pais de alunos de uma escola pública, escreva uma carta aberta à secretária de Educação sobre a falta de merenda escolar.',
      paragrafos: [
        { parte: 'Título', texto: 'Carta aberta à secretária estadual de Educação', rubrica: 'O título explicita gênero e destinatário: o leitor sabe de imediato que é um texto público.' },
        { parte: 'Vocativo', texto: 'Excelentíssima Senhora Secretária,', rubrica: 'Pronome de tratamento adequado a uma autoridade. Demonstra domínio do registro institucional.' },
        { parte: 'Apresentação', texto: 'Nós, pais e responsáveis pelos alunos da Escola Estadual Machado de Assis, vimos a público manifestar nossa preocupação com a interrupção do fornecimento de merenda escolar, que já dura três semanas.', rubrica: 'Enunciador coletivo bem definido, propósito anunciado na primeira frase e dado concreto (três semanas).' },
        { parte: 'Argumentação', texto: 'Para muitas de nossas crianças, a refeição servida na escola é a principal do dia. Desde o início do problema, a direção registrou queda de 25% na frequência escolar, o que confirma algo que as famílias já sabiam: sem alimentação, não há aprendizagem possível.', rubrica: 'Argumento com dado e conclusão lógica. O conector "o que confirma" articula causa e consequência.' },
        { parte: 'Reivindicação', texto: 'Diante desse cenário, solicitamos: (1) a retomada imediata do fornecimento; (2) a divulgação de um cronograma de regularização; e (3) a criação de um canal direto entre a Secretaria e o conselho escolar.', rubrica: 'Pedidos concretos e verificáveis. Cumprimento pleno do propósito comunicativo (reivindicar).' },
        { parte: 'Fechamento', texto: 'Certos de contar com a sensibilidade de Vossa Excelência, aguardamos um posicionamento oficial.\n\nRespeitosamente,\nConselho de Pais da E. E. Machado de Assis\nBelo Horizonte, 12 de abril', rubrica: 'Fecho formal coerente com o vocativo ("Vossa Excelência"), assinatura coletiva, local e data.' },
      ],
    },
    armadilhas: [
      'Esquecer que o texto é público: escrever como se fosse um e-mail privado.',
      'Misturar "você" com "Vossa Excelência" (quebra de uniformidade de tratamento).',
      'Reclamar sem propor nem pedir nada concreto.',
    ],
    notaES:
      '"Vossa Excelência" pide verbo en 3ª persona (como "usted"): "Vossa Excelência sabe…", nunca "sabeis". "Solicitamos que + subjuntivo" funciona como en español: "que retome", "que divulgue".',
  },
  {
    id: 'email-institucional',
    nome: 'E-mail Institucional',
    familia: 'Comunicar a instituições',
    frequencia: 'altíssima',
    resumo:
      'Mensagem eletrônica a uma empresa, universidade ou órgão para solicitar, reclamar, informar ou agradecer.',
    noExame:
      'Muito frequente nas Tarefas 1 e 2: depois de ver um vídeo ou ouvir um áudio, você escreve a uma instituição pedindo informações ou se candidatando a algo.',
    anatomia: [
      { parte: 'Assunto', funcao: 'Resumir o objetivo em poucas palavras.', exemplo: 'Assunto: Inscrição no programa Vizinho Voluntário', dica: 'Se a consigna pedir e-mail, um campo "Assunto" ajuda a marcar o gênero.' },
      { parte: 'Saudação', funcao: 'Cumprimentar o destinatário.', exemplo: 'Prezada equipe do Instituto Raízes,', dica: '"Prezado(a)" é o curinga do registro institucional.' },
      { parte: 'Apresentação + motivo', funcao: 'Quem escreve e por quê.', exemplo: 'Meu nome é Andrés Pineda, sou engenheiro e soube do programa pela reportagem…', dica: 'Mencionar onde soube da informação mostra que você usou a fonte.' },
      { parte: 'Desenvolvimento', funcao: 'Informações, perguntas ou argumentos pedidos na consigna.', exemplo: 'Gostaria de saber se há vagas para… e quais são os requisitos…', dica: 'Cada item da consigna = um parágrafo ou frase identificável.' },
      { parte: 'Fechamento', funcao: 'Agradecer e indicar expectativa de resposta.', exemplo: 'Desde já, agradeço a atenção e fico no aguardo de um retorno.', dica: '' },
      { parte: 'Despedida e assinatura', funcao: 'Fórmula + nome (e contato, se fizer sentido).', exemplo: 'Atenciosamente,\nAndrés Pineda', dica: '' },
    ],
    registro: {
      nivel: 'Formal (padrão) — semiformal se a consigna indicar proximidade',
      tom: 'Objetivo, cordial e claro',
      pessoa: '1ª pessoa do singular',
      evitar: ['"Oi", "Olá, pessoal"', 'beijos/abraços na despedida', 'parágrafos sem foco'],
    },
    chaves: [
      { funcao: 'Abrir', frases: ['Escrevo para…', 'Entro em contato a fim de…', 'Tomei conhecimento de… por meio de…'] },
      { funcao: 'Pedir com cortesia', frases: ['Gostaria de saber se…', 'Poderiam me informar…?', 'Seria possível…?'] },
      { funcao: 'Reclamar com elegância', frases: ['Lamento informar que…', 'Venho manifestar minha insatisfação com…', 'Até o momento, não obtive resposta.'] },
      { funcao: 'Fechar', frases: ['Desde já, agradeço a atenção.', 'Fico no aguardo de um retorno.', 'Coloco-me à disposição para eventuais esclarecimentos.'] },
    ],
    exemplo: {
      consigna:
        'Você assistiu a uma reportagem sobre um programa de hortas comunitárias. Escreva um e-mail à ONG responsável pedindo para participar e fazendo perguntas sobre o funcionamento.',
      paragrafos: [
        { parte: 'Assunto', texto: 'Assunto: Interesse em participar do projeto Horta na Laje', rubrica: 'Marca o gênero e o propósito antes mesmo da leitura.' },
        { parte: 'Saudação', texto: 'Prezada equipe do Instituto Raízes,', rubrica: 'Interlocutor institucional identificado; saudação formal padrão.' },
        { parte: 'Apresentação', texto: 'Meu nome é Andrés Pineda, sou colombiano e moro no Rio de Janeiro há dois anos. Assisti à reportagem exibida no último domingo sobre o projeto Horta na Laje e fiquei impressionado com a transformação que as hortas trouxeram para a comunidade do Morro do Cantagalo.', rubrica: 'Enunciador se apresenta e mostra que compreendeu a fonte (projeto, local). "Assisti à" — regência correta.' },
        { parte: 'Desenvolvimento', texto: 'Gostaria de participar como voluntário. Trabalhei por cinco anos com irrigação em pequenas propriedades rurais e acredito que essa experiência possa ser útil. Para me organizar, poderiam me informar se é necessário morar na comunidade, quantas horas por semana são exigidas e se há algum treinamento inicial?', rubrica: 'Cumpre os dois itens da consigna (pedir participação + perguntar). Perguntas indiretas e polidas ("poderiam me informar se…").' },
        { parte: 'Fechamento', texto: 'Desde já, agradeço a atenção e fico no aguardo de um retorno.\n\nAtenciosamente,\nAndrés Pineda\n(21) 99999-0000', rubrica: 'Fechamento convencional do gênero e assinatura com contato — coerente com o pedido de resposta.' },
      ],
    },
    armadilhas: [
      'Começar com "Olá, tudo bem?" num e-mail a uma instituição.',
      'Esquecer uma das perguntas exigidas pela consigna (cumprimento parcial da tarefa).',
      'Copiar frases inteiras do vídeo/áudio.',
    ],
    notaES:
      '"Quedo a la espera" → "Fico no aguardo" (no "fico à espera de sua resposta", que é possível mas menos usual). "Un saludo cordial" → "Atenciosamente" ou "Cordialmente". "Me gustaría saber" → "Gostaria de saber" (sin "me").',
  },
  {
    id: 'artigo-opiniao',
    nome: 'Artigo de Opinião',
    familia: 'Argumentar em público',
    frequencia: 'alta',
    resumo:
      'Texto assinado, publicado em jornal, revista ou blog, em que o autor defende um ponto de vista sobre tema polêmico, com argumentos e contra-argumentos.',
    noExame:
      'Aparece quando a consigna pede que você escreva para um jornal ou blog defendendo uma posição a partir dos textos lidos.',
    anatomia: [
      { parte: 'Título', funcao: 'Atrair o leitor e antecipar a tese.', exemplo: 'Trabalhar menos para viver melhor', dica: 'Títulos curtos e opinativos funcionam bem.' },
      { parte: 'Introdução', funcao: 'Contextualizar e apresentar a tese.', exemplo: 'A proposta de reduzir a jornada semanal voltou ao centro do debate…', dica: 'Tese explícita até o fim do 1º parágrafo.' },
      { parte: 'Argumento 1', funcao: 'Primeiro argumento com dado ou exemplo.', exemplo: 'Em primeiro lugar, os dados do estudo mostram…', dica: '' },
      { parte: 'Contra-argumento', funcao: 'Reconhecer a posição contrária e refutá-la.', exemplo: 'É verdade que alguns setores temem queda na produtividade. No entanto,…', dica: 'Concessão + refutação é marca de nível avançado.' },
      { parte: 'Conclusão', funcao: 'Retomar a tese e propor caminho.', exemplo: 'Diante disso, mais do que uma utopia, a semana de quatro dias é…', dica: 'Não introduza dados novos.' },
      { parte: 'Assinatura', funcao: 'Nome e identificação do autor.', exemplo: 'Lucía Fernández é professora e mora em Porto Alegre.', dica: 'Típico de artigos em jornais.' },
    ],
    registro: {
      nivel: 'Formal, com espaço para recursos expressivos',
      tom: 'Persuasivo e reflexivo',
      pessoa: '1ª pessoa (singular ou plural inclusivo) ou impessoal',
      evitar: ['"eu acho" repetido', 'generalizações sem dado', 'ofensas a quem pensa diferente'],
    },
    chaves: [
      { funcao: 'Introduzir tese', frases: ['Parece-me evidente que…', 'Defendo que…', 'Ao contrário do que se costuma pensar,…'] },
      { funcao: 'Encadear argumentos', frases: ['Em primeiro lugar,…', 'Além disso,…', 'Soma-se a isso o fato de que…'] },
      { funcao: 'Conceder e refutar', frases: ['É verdade que…; no entanto,…', 'Ainda que…, …', 'Por mais que…, não se pode ignorar…'] },
      { funcao: 'Concluir', frases: ['Diante desse cenário,…', 'Portanto,…', 'Em suma,…'] },
    ],
    exemplo: {
      consigna:
        'Escreva um artigo de opinião para o blog de um jornal sobre a proibição de celulares nas escolas, usando informações do texto lido.',
      paragrafos: [
        { parte: 'Título', texto: 'Desligar para conectar', rubrica: 'Título opinativo e expressivo, coerente com a tese.' },
        { parte: 'Introdução', texto: 'A decisão de proibir celulares nas salas de aula, adotada recentemente por várias redes de ensino, divide pais, professores e estudantes. Defendo que a medida é acertada, desde que venha acompanhada de educação digital, e não apenas de punição.', rubrica: 'Contextualiza o debate e apresenta tese matizada ("desde que…"). Nível avançado: tese com condição.' },
        { parte: 'Argumento', texto: 'Em primeiro lugar, os números são eloquentes: segundo o levantamento citado pela reportagem, professores perdem, em média, dez minutos por aula chamando a atenção de alunos distraídos com o aparelho. Somados ao longo de um ano letivo, esses minutos equivalem a semanas de conteúdo.', rubrica: 'Dado da fonte reformulado + inferência própria ("equivalem a semanas"). Mostra compreensão, não cópia.' },
        { parte: 'Contra-argumento', texto: 'É verdade que o celular pode ser uma ferramenta pedagógica poderosa. No entanto, usá-lo com propósito exige planejamento, e não é isso o que se vê na maioria das salas: o que domina é a rolagem infinita das redes sociais.', rubrica: 'Concessão ("É verdade que") + refutação ("No entanto") — estrutura típica de Avançado Superior.' },
        { parte: 'Conclusão', texto: 'Diante desse cenário, desligar o aparelho durante a aula não é retrocesso, mas uma oportunidade de ensinar os jovens a decidir quando estar conectados. Proibir é só o começo; educar é o que faz a diferença.', rubrica: 'Retoma a tese, amplia e fecha com frase de efeito (paralelismo "Proibir… educar…").' },
        { parte: 'Assinatura', texto: 'Lucía Fernández é professora de ensino médio em Porto Alegre.', rubrica: 'Assinatura típica do gênero, reforçando a autoridade do enunciador.' },
      ],
    },
    armadilhas: [
      'Transformar o artigo em resumo da reportagem.',
      'Usar "eu acho que" em todas as frases (pobreza lexical).',
      'Não ter título.',
    ],
    notaES:
      '"Sin embargo" → "No entanto / Contudo / Entretanto" (y ojo: "todavia" en portugués también significa "sin embargo", ¡no "todavía"!). "Desde que" + subjuntivo en portugués es condicional ("siempre que"), no temporal.',
  },
  {
    id: 'post-campanha',
    nome: 'Post Informativo de Campanha',
    familia: 'Informar e mobilizar',
    frequencia: 'média-alta',
    resumo:
      'Texto curto para redes sociais ou site institucional que informa e convoca o público a agir (vacinar-se, economizar água, doar sangue…).',
    noExame:
      'Tarefas com campanhas públicas costumam pedir posts, folhetos ou textos de divulgação para um público específico (jovens, idosos, vizinhos).',
    anatomia: [
      { parte: 'Chamada (título)', funcao: 'Capturar a atenção em poucas palavras.', exemplo: 'Sua doação salva até 4 vidas', dica: 'Verbo no imperativo ou número impactante.' },
      { parte: 'Contexto', funcao: 'Explicar por que o tema importa agora.', exemplo: 'Os estoques de sangue costumam cair nas férias de julho…', dica: '' },
      { parte: 'Informação prática', funcao: 'Quem, onde, quando, como.', exemplo: 'Pode doar quem tem entre 16 e 69 anos…', dica: 'Listas curtas facilitam a leitura.' },
      { parte: 'Chamada para ação', funcao: 'Convocar diretamente o leitor.', exemplo: 'Agende sua doação e convide um amigo!', dica: 'Imperativo + "você".' },
      { parte: 'Assinatura / hashtag', funcao: 'Identificar quem promove a campanha.', exemplo: '#DoeSangue — Hemocentro Regional', dica: '' },
    ],
    registro: {
      nivel: 'Semiformal, acessível',
      tom: 'Próximo, motivador, claro',
      pessoa: '"você" (2ª pessoa indireta) e imperativo',
      evitar: ['parágrafos longos', 'jargão técnico sem explicação', 'informações imprecisas'],
    },
    chaves: [
      { funcao: 'Chamar a atenção', frases: ['Você sabia que…?', 'Atenção, moradores do…!', 'Faça parte dessa corrente!'] },
      { funcao: 'Orientar', frases: ['Para participar, basta…', 'Não se esqueça de levar…', 'Fique atento ao prazo:'] },
      { funcao: 'Mobilizar', frases: ['Compartilhe esta informação!', 'Juntos, podemos…', 'Contamos com você!'] },
    ],
    exemplo: {
      consigna:
        'Com base no texto sobre a falta de doadores, escreva um post para a página de um hemocentro convocando jovens universitários a doarem sangue.',
      paragrafos: [
        { parte: 'Chamada', texto: 'Universitário, sua próxima pausa entre as aulas pode salvar quatro vidas.', rubrica: 'Interlocutor específico (universitários) já na chamada + dado impactante da fonte.' },
        { parte: 'Contexto', texto: 'Nas férias de julho, os estoques do Hemocentro Regional chegam a cair 30%. É justamente quando acidentes e cirurgias continuam acontecendo — e a procura por sangue não tira férias.', rubrica: 'Dado da fonte parafraseado e frase expressiva ("não tira férias") adequada ao gênero.' },
        { parte: 'Informação prática', texto: 'Quem pode doar? Pessoas entre 16 e 69 anos (menores de 18, com autorização dos responsáveis), com mais de 50 kg e em boas condições de saúde.\nO que levar? Documento oficial com foto.\nQuanto tempo leva? Cerca de 40 minutos, do cadastro ao lanche.', rubrica: 'Perguntas-guia organizam a informação de forma escaneável, como em posts reais.' },
        { parte: 'Chamada para ação', texto: 'Agende pelo site, venha com um colega e mostre que a sua turma faz diferença. Doar é rápido, seguro e gratuito.', rubrica: 'Imperativo, "você" implícito e argumento final de tranquilização — cumpre o propósito de mobilizar.' },
        { parte: 'Assinatura', texto: '#DoeSangueDoeVida | Hemocentro Regional', rubrica: 'Marca o suporte (rede social) e o enunciador institucional.' },
      ],
    },
    armadilhas: [
      'Escrever um texto dissertativo longo: o gênero pede concisão.',
      'Esquecer o público-alvo indicado na consigna.',
      'Usar "tú" ou misturar "você" e "tu" sem critério.',
    ],
    notaES:
      'Imperativo con "você" usa la forma del subjuntivo: "agende", "venha", "faça" (no "agenda", "vem", "faz", que son formas de "tu", habituales en el habla de algunas regiones pero inadecuadas en un post institucional).',
  },
  {
    id: 'relato',
    nome: 'Relato de Experiência',
    familia: 'Narrar e refletir',
    frequencia: 'média',
    resumo:
      'Narrativa em 1ª pessoa de uma vivência real, com reflexão sobre o que ela ensinou. Publicado em blogs, revistas ou coletâneas institucionais.',
    noExame:
      'Aparece quando uma revista ou projeto convida leitores a compartilhar experiências (intercâmbio, voluntariado, mudança de país).',
    anatomia: [
      { parte: 'Título', funcao: 'Sugerir a experiência.', exemplo: 'O dia em que aprendi a pedir ajuda', dica: '' },
      { parte: 'Situação inicial', funcao: 'Onde, quando, quem.', exemplo: 'Cheguei a Salvador em fevereiro de 2023, em pleno Carnaval…', dica: 'Pretérito perfeito e imperfeito bem articulados.' },
      { parte: 'Acontecimento central', funcao: 'O que mudou / o desafio.', exemplo: 'Na segunda semana, perdi a carteira…', dica: '' },
      { parte: 'Reflexão', funcao: 'O que a experiência ensinou.', exemplo: 'Hoje percebo que…', dica: 'A reflexão é o que diferencia relato de simples narração.' },
      { parte: 'Fechamento', funcao: 'Mensagem ao leitor.', exemplo: 'Se você está pensando em…, meu conselho é…', dica: 'Conecta com o público da publicação.' },
    ],
    registro: {
      nivel: 'Semiformal',
      tom: 'Pessoal, reflexivo, envolvente',
      pessoa: '1ª pessoa do singular',
      evitar: ['lista de fatos sem reflexão', 'excesso de detalhes irrelevantes', 'mistura de tempos verbais'],
    },
    chaves: [
      { funcao: 'Situar no tempo', frases: ['Era meu primeiro dia em…', 'Logo que cheguei,…', 'Poucos meses depois,…'] },
      { funcao: 'Marcar a virada', frases: ['Foi então que…', 'De repente,…', 'Tudo mudou quando…'] },
      { funcao: 'Refletir', frases: ['Hoje percebo que…', 'Essa experiência me ensinou que…', 'Olhando para trás,…'] },
    ],
    exemplo: {
      consigna:
        'A revista de um programa de intercâmbio convida ex-participantes a contar uma experiência marcante no Brasil. Escreva seu relato.',
      paragrafos: [
        { parte: 'Título', texto: 'O dia em que a vizinhança virou família', rubrica: 'Título narrativo que antecipa a reflexão.' },
        { parte: 'Situação inicial', texto: 'Cheguei a Recife em março de 2022 para um semestre de mestrado. Eu falava um portunhol corajoso, mas tinha vergonha de puxar conversa: cumprimentava os vizinhos com a cabeça e fugia para o apartamento.', rubrica: 'Pretérito perfeito (cheguei) para fatos pontuais e imperfeito (falava, cumprimentava) para hábitos — domínio do sistema verbal. "Puxar conversa" é expressão idiomática natural.' },
        { parte: 'Acontecimento', texto: 'Tudo mudou numa madrugada de chuva forte, quando a água invadiu o térreo do prédio. Dona Lourdes, a vizinha do 102, bateu à minha porta e, sem cerimônia, me entregou um balde. Passamos a noite inteira tirando água e, entre um balde e outro, ela me contou a história de cada morador.', rubrica: 'Marca a virada com "Tudo mudou… quando". Narrativa concreta, com detalhes significativos.' },
        { parte: 'Reflexão', texto: 'Hoje percebo que meu maior obstáculo não era a língua, mas o medo de errar. Naquela noite, ninguém corrigiu meus verbos; todos estavam ocupados demais ajudando uns aos outros.', rubrica: 'Reflexão explícita ("Hoje percebo que") — o que eleva o relato acima da simples narração.' },
        { parte: 'Fechamento', texto: 'Se você está prestes a fazer intercâmbio, meu conselho é simples: bata à porta do vizinho antes que a chuva o obrigue a isso.', rubrica: 'Dirige-se ao leitor da revista (futuros intercambistas) e fecha com retomada criativa da imagem da chuva.' },
      ],
    },
    armadilhas: [
      'Narrar sem refletir: o propósito do gênero fica pela metade.',
      'Usar só presente ou trocar perfeito/imperfeito sem critério.',
      'Esquecer o público da publicação.',
    ],
    notaES:
      'El pretérito perfecto compuesto español ("he llegado") casi nunca corresponde al "tenho chegado" portugués, que indica repetición. "Hoy he aprendido" → "Hoje aprendi". "Había llegado" → "tinha chegado" (más natural que "havia chegado" en el registro semiformal).',
  },

  // ——— Fichas compactas (estrutura + chaves) ———
  {
    id: 'nota-esclarecimento', nome: 'Nota de Esclarecimento', familia: 'Comunicar a instituições', frequencia: 'média', compacto: true,
    resumo: 'Comunicado oficial de uma instituição para corrigir informações equivocadas ou explicar um fato que gerou dúvidas ou polêmica.',
    noExame: 'Você assume o papel da instituição (escola, empresa, prefeitura) e responde publicamente a um boato ou problema.',
    anatomia: [
      { parte: 'Título', funcao: '"Nota de esclarecimento" ou "Nota oficial".', exemplo: 'Nota de esclarecimento', dica: '' },
      { parte: 'Contextualização', funcao: 'Que informação circulou.', exemplo: 'Em razão das informações divulgadas nas redes sociais sobre…', dica: '' },
      { parte: 'Esclarecimento', funcao: 'Fatos corretos, em tom impessoal.', exemplo: 'A direção esclarece que…', dica: '3ª pessoa institucional.' },
      { parte: 'Providências', funcao: 'O que será feito.', exemplo: 'Informamos ainda que serão adotadas as seguintes medidas:', dica: '' },
      { parte: 'Assinatura e data', funcao: 'Instituição responsável.', exemplo: 'A Diretoria — Campinas, 3 de maio', dica: '' },
    ],
    registro: { nivel: 'Formal', tom: 'Impessoal, sereno, transparente', pessoa: '3ª pessoa institucional ou "nós" institucional', evitar: ['emoção excessiva', 'ataques a quem divulgou o boato'] },
    chaves: [
      { funcao: 'Abrir', frases: ['Em razão de…, a [instituição] vem a público esclarecer que…', 'Diante das informações veiculadas…'] },
      { funcao: 'Corrigir', frases: ['Ao contrário do que foi divulgado,…', 'Cabe esclarecer que…', 'Não procede a informação de que…'] },
      { funcao: 'Comprometer-se', frases: ['A instituição reafirma seu compromisso com…', 'Permanecemos à disposição para…'] },
    ],
    notaES: '"No procede" existe igual en portugués ("não procede"). Ojo: "esclarecer" en portugués es "aclarar/explicar"; no tiene el sentido español de "liberar de la esclavitud".',
  },
  {
    id: 'abaixo-assinado', nome: 'Abaixo-Assinado', familia: 'Informar e mobilizar', frequencia: 'média', compacto: true,
    resumo: 'Documento coletivo que formaliza uma reivindicação e recolhe assinaturas de apoio.',
    noExame: 'Pode ser pedido quando um grupo quer mudar algo junto a uma autoridade (horário de ônibus, poda de árvores, iluminação).',
    anatomia: [
      { parte: 'Destinatário', funcao: 'Autoridade a quem se dirige.', exemplo: 'Ao Ilustríssimo Senhor Prefeito de Niterói', dica: '' },
      { parte: 'Identificação do grupo', funcao: 'Quem assina.', exemplo: 'Nós, abaixo assinados, moradores da Rua das Palmeiras,…', dica: '' },
      { parte: 'Justificativa', funcao: 'Problema e argumentos.', exemplo: 'considerando que…; considerando ainda que…', dica: 'A estrutura "considerando que" é típica.' },
      { parte: 'Pedido', funcao: 'Reivindicação objetiva.', exemplo: 'vimos solicitar…', dica: '' },
      { parte: 'Espaço de assinaturas', funcao: 'Nome, documento, assinatura.', exemplo: 'Nome | RG | Assinatura', dica: '' },
    ],
    registro: { nivel: 'Formal', tom: 'Objetivo, reivindicativo', pessoa: '1ª pessoa do plural', evitar: ['narrativa longa', 'pedidos vagos'] },
    chaves: [
      { funcao: 'Justificar', frases: ['Considerando que…', 'Tendo em vista que…'] },
      { funcao: 'Pedir', frases: ['vimos, respeitosamente, solicitar…', 'requeremos a Vossa Senhoria que…'] },
    ],
    notaES: '"Abajo firmantes" → "abaixo assinados" (sin hífen cuando son las personas; con hífen, "abaixo-assinado", es el documento).',
  },
  {
    id: 'resumo-executivo', nome: 'Resumo Executivo', familia: 'Informar com precisão', frequencia: 'baixa-média', compacto: true,
    resumo: 'Síntese objetiva de um relatório, projeto ou estudo para leitores que precisam decidir rapidamente.',
    noExame: 'Pode surgir com textos técnicos: você resume um estudo para um chefe, conselho ou comissão.',
    anatomia: [
      { parte: 'Objetivo', funcao: 'Para que serve o documento.', exemplo: 'Este resumo apresenta os principais resultados de…', dica: '' },
      { parte: 'Principais dados', funcao: 'Números e achados centrais.', exemplo: 'O estudo constatou que…', dica: 'Tópicos são bem-vindos.' },
      { parte: 'Recomendações', funcao: 'O que fazer.', exemplo: 'Recomenda-se…', dica: '' },
    ],
    registro: { nivel: 'Formal técnico', tom: 'Neutro e conciso', pessoa: 'Impessoal (se, voz passiva)', evitar: ['opiniões pessoais', 'adjetivos desnecessários'] },
    chaves: [
      { funcao: 'Sintetizar', frases: ['Em linhas gerais,…', 'Os resultados indicam que…', 'Destaca-se que…'] },
      { funcao: 'Recomendar', frases: ['Recomenda-se…', 'Sugere-se, ainda,…'] },
    ],
    notaES: 'La pasiva refleja es igual que en español ("Recomienda-se" ✗ → "Recomenda-se" ✓). En portugués formal el pronombre va después del verbo al inicio de frase.',
  },
  {
    id: 'cronica', nome: 'Crônica', familia: 'Narrar e refletir', frequencia: 'baixa-média', compacto: true,
    resumo: 'Texto curto, literário e reflexivo, que parte de um fato cotidiano para comentar a vida. Gênero muito brasileiro.',
    noExame: 'Mais raro como produção, mas frequente como texto-base. Reconhecer o tom irônico/lírico ajuda na compreensão.',
    anatomia: [
      { parte: 'Cena cotidiana', funcao: 'Fato banal observado.', exemplo: 'Na fila da padaria, uma senhora…', dica: '' },
      { parte: 'Desenvolvimento', funcao: 'Digressão, humor, lirismo.', exemplo: '', dica: '' },
      { parte: 'Fecho reflexivo', funcao: 'Comentário sobre a vida.', exemplo: '', dica: 'Muitas vezes com ironia sutil.' },
    ],
    registro: { nivel: 'Variável — coloquial elaborado', tom: 'Leve, irônico ou lírico', pessoa: '1ª pessoa frequente', evitar: ['tom de redação escolar'] },
    chaves: [{ funcao: 'Observar', frases: ['Outro dia, …', 'Reparei que…', 'Dizem por aí que…'] }],
    notaES: 'La "crónica" brasileña no es la crónica periodística hispana de hechos; está más cerca de la columna literaria.',
  },
  {
    id: 'manifesto', nome: 'Manifesto', familia: 'Argumentar em público', frequencia: 'baixa-média', compacto: true,
    resumo: 'Declaração pública de princípios de um grupo, com tom enfático e mobilizador.',
    noExame: 'Pode ser pedido em tarefas sobre movimentos sociais, ambientais ou culturais.',
    anatomia: [
      { parte: 'Título', funcao: 'Nome do manifesto.', exemplo: 'Manifesto pela rua que respira', dica: '' },
      { parte: 'Diagnóstico', funcao: 'O que está errado.', exemplo: '', dica: '' },
      { parte: 'Princípios', funcao: '"Acreditamos que…" / "Defendemos…"', exemplo: '', dica: 'Anáforas são bem-vindas.' },
      { parte: 'Convocação', funcao: 'Chamado coletivo.', exemplo: 'Junte-se a nós.', dica: '' },
    ],
    registro: { nivel: 'Formal enfático', tom: 'Mobilizador', pessoa: '1ª pessoa do plural', evitar: ['tom de reclamação pessoal'] },
    chaves: [{ funcao: 'Declarar', frases: ['Acreditamos que…', 'Defendemos…', 'Não aceitamos…', 'Convocamos todos os que…'] }],
    notaES: 'La anáfora ("Acreditamos… Acreditamos…") es un recurso retórico válido aquí; en otros géneros sería repetición.',
  },
  {
    id: 'editorial', nome: 'Editorial', familia: 'Argumentar em público', frequencia: 'baixa-média', compacto: true,
    resumo: 'Texto opinativo que expressa a posição do próprio veículo (jornal, revista), sem assinatura individual.',
    noExame: 'Mais comum como texto-base. Se pedido, escreva em nome da publicação, de forma impessoal.',
    anatomia: [
      { parte: 'Título', funcao: 'Tese condensada.', exemplo: '', dica: '' },
      { parte: 'Fato', funcao: 'Notícia que motiva.', exemplo: '', dica: '' },
      { parte: 'Análise', funcao: 'Argumentos da publicação.', exemplo: '', dica: '' },
      { parte: 'Posição final', funcao: 'Recomendação ou alerta.', exemplo: '', dica: '' },
    ],
    registro: { nivel: 'Formal', tom: 'Sóbrio, institucional', pessoa: 'Impessoal / "nós" editorial raro', evitar: ['"eu"', 'assinatura pessoal'] },
    chaves: [{ funcao: 'Avaliar', frases: ['É preocupante que…', 'Não se pode admitir que…', 'Cabe ao poder público…'] }],
    notaES: 'Igual que el editorial hispano. Diferencia con el artículo de opinión: sin firma y sin "eu".',
  },
];
