export const adminCopy = {
  controlStrip: {
    kicker: "Mesa da edicao",
    title: "Comando desta edicao",
    description:
      "Fase, moderacao e visibilidade num painel pensado para decisoes rapidas no telemovel.",
    clearQueue: "Fila limpa",
    refresh: "Atualizar mesa",
    activeEventFallback: "Sem edicao ativa",
    membersSummary: "membros nesta edicao",
    metrics: {
      pending: "Pendentes",
      categories: "Categorias ativas",
      members: "Membros",
      votes: "Votos registados",
    },
  },
  dashboard: {
    pulseKicker: "Ritmo da edicao",
    queueKicker: "Decisoes por fechar",
    recentKicker: "Arquivo recente",
    queueTitle: "Ha aprovacoes para fechar nesta edicao",
    recentTitle: "Nomeacoes recebidas mais recentemente",
  },
  shell: {
    backendHint: "Atualiza a edicao ou confirma o backend antes de continuar a moderacao.",
    more: {
      openAction: "Abrir mais areas da edicao",
      kicker: "Mapa da edicao",
      title: "Mais areas da edicao",
      description:
        "Atalhos para o resto da edicao sem tirar foco ao que fica sempre na navegacao principal.",
      summaryLabel: "Atalhos",
      summaryTitle: "Outras paragens da edicao",
      summaryDescription:
        "Abre o que fica fora do dock sem perder o ritmo desta fase.",
      empty: "Nao ha outras areas abertas nesta fase.",
      explore: "Explorar",
      admin: "Administracao",
      adminTitle: "Mesa da edicao",
      adminDescription:
        "Moderacao, fases e visibilidade ficam reunidas aqui para quem gere a edicao.",
      adminAction: "Abrir admin",
      total: "Total",
      shortcuts: "atalhos",
    },
  },
  state: {
    sectionKicker: "Edicao",
    sectionTitle: "Evento ativo, fase e calendario",
    sectionDescription:
      "Define a edicao em curso, a fase aberta e a janela de cada momento.",
    activeEventLabel: "Evento ativo",
    currentEditionLabel: "Edicao em curso",
    currentEditionDescription:
      "Trocar a edicao atualiza a shell, a moderacao e os modulos dos membros.",
    phaseLabel: "Fase ativa",
    visibleModulesLabel: "Modulos visiveis",
    visibleModulesDescription: "O que o grupo ve agora",
    pendingLabel: "Pendentes",
    pendingDescription: "Itens por rever",
    phaseClosesPrefix: "Fecha a",
    activeBadge: "Ativa",
    visibilityKicker: "Acesso",
    visibilityTitle: "O que fica aberto para o grupo",
    visibilityDescription:
      "A fase manda no ritmo, mas a mesa da edicao decide o que ainda fica escondido.",
    nominationsVisible: "Nomeacoes visiveis",
    nominationsDescription:
      "Mostra as nomeacoes aos membros quando a fase ja o permite.",
    resultsVisible: "Resultados visiveis",
    resultsDescription:
      "Liberta ranking e resultados fora da gala quando for preciso.",
    visibilityRuleTitle: "Regra de visibilidade",
    visibilityRuleDescription:
      "Estes toggles escondem modulos mesmo quando a fase ja os permitir. Sao ajuste fino, nao substituem a fase ativa.",
    noState: "Falta uma edicao ativa para abrir os controlos globais.",
  },
  categories: {
    createKicker: "Curadoria",
    createTitle: "Nova categoria",
    createDescription:
      "Abre categorias para esta edicao sem sair da mesa de controlo.",
    manageKicker: "Gestao",
    manageTitle: "Categorias da edicao",
    empty: "Esta edicao ainda nao tem categorias criadas.",
    historyKicker: "Arquivo",
    historyTitle: "Historico de propostas",
    historyEmpty:
      "Ainda nao chegaram propostas de categoria para esta edicao.",
  },
  secretSanta: {
    kicker: "Amigo secreto",
    title: "Sorteio desta edicao",
    description:
      "O sorteio usa apenas os membros desta edicao. Cada pessoa ve apenas a sua atribuicao e a wishlist correspondente.",
    refresh: "Atualizar",
    draw: "Gerar sorteio",
    redraw: "Refazer sorteio",
    drawing: "A sortear...",
    editionLabel: "Edicao",
    editionHint: "Contexto atual do sorteio",
    drawLabel: "Draw",
    drawReady: "Criado",
    drawMissing: "Por gerar",
    assignmentsLabel: "Atribuicoes",
    membersHintSuffix: "membros neste evento",
    statusLabel: "Estado",
    statusLocked: "Fechado",
    statusOpen: "Aberto",
    noDrawHint: "Sem sorteio criado",
    available: "Sorteio disponivel",
    unavailable: "Sem sorteio",
    generatedSuffix: "atribuicoes geradas",
  },
  users: {
    title: "Membros",
    loading: "A carregar membros...",
    empty: "Nenhum membro encontrado nesta edicao.",
    admins: "Admins desta edicao",
    members: "Membros desta edicao",
  },
  audit: {
    kicker: "Votos",
    title: "Registo de votos",
    loading: "A carregar auditoria...",
    empty: "Ainda nao ha votos registados nesta edicao.",
    search: "Pesquisar por categoria, nomeado ou utilizador...",
  },
} as const;

export const homeCopy = {
  loading: "A afinar a edicao",
  errorTitle: "Nao foi possivel abrir esta edicao.",
  errorDescription:
    "Falta contexto para perceber a fase ativa e o que ja esta aberto para o grupo.",
  heroTitle: "O que esta em jogo nesta fase",
  alertsTitle: "Antes da proxima fase",
  emptyFeed: "O mural desta edicao ainda espera pelo primeiro post.",
  secretSantaTitle: "O teu Amigo Secreto",
  checklistTitle: "Antes da proxima fase",
  manageLabel: "Tens acesso a mesa desta edicao.",
  memberLabel: "Vista de membro nesta edicao.",
} as const;

export const feedCopy = {
  hero: {
    kicker: "Mural",
    title: "Cronica viva da edicao",
    description:
      "Publicacoes, imagens e votacoes curtas para manter o grupo alinhado ao ritmo desta fase.",
    refresh: "Atualizar mural",
  },
  empty: {
    kicker: "Mural por abrir",
    title: "Esta edicao ainda nao tem registos publicados",
    description:
      "Abre o mural com uma fotografia, um aviso rapido ou um teaser da proxima fase.",
  },
  insights: {
    archive: {
      label: "Arquivo",
      description: "Publicacoes ja registadas no mural desta edicao.",
    },
    media: {
      label: "Momentos visuais",
      description: "Posts com imagem para dar mais contexto e memoria ao mural.",
    },
    polls: {
      label: "Votacoes relampago",
      description: "Perguntas rapidas para puxar participacao entre fases.",
    },
    pinned: {
      label: "Destaques",
      description: "Posts fixados para segurar contexto no topo do mural.",
    },
  },
  composer: {
    kicker: "Novo registo",
    title: "Publicar no mural da edicao",
    description:
      "Partilha uma nota, uma imagem ou uma votacao curta para manter o grupo dentro do momento.",
    sheetTitle: "Novo registo",
    sheetDescription:
      "Partilha uma foto, um texto ou uma votacao curta para manter o grupo dentro desta fase.",
    mediaLabel: "Imagens",
    pollLabel: "Votacao",
    textLabel: "Texto",
    textPlaceholder:
      "Escreve uma nota rapida, um contexto para a gala ou um update para o grupo.",
    mediaSelected: "Imagens prontas",
    pollTitle: "Abrir uma votacao rapida",
    pollDescription: "Define a pergunta e as opcoes antes de publicar.",
    pollQuestionLabel: "Pergunta",
    pollQuestionPlaceholder:
      "Ex: Qual foi o momento mais improvavel desta edicao?",
    pollOptionsLabel: "Opcoes",
    pollOptionPlaceholder: "Opcao",
    addOption: "Adicionar opcao",
    authPrompt: "Para publicar no mural, inicia sessao.",
    signIn: "Entrar com Google",
    uploading: "A enviar imagens...",
    uploadingFallback: "A enviar...",
    unsupportedFormat: "formato nao suportado",
    fileTooLargeLabel: "maximo",
    maxImagesLabel: "Maximo de imagens por post",
    optimizedLabel: "imagem(ns) otimizadas para upload rapido",
    published: "Post publicado",
    publishError: "Nao foi possivel publicar",
    mediaOrderLabel: "Ordem das imagens no post",
    moveLeft: "Mover imagem para a esquerda",
    moveRight: "Mover imagem para a direita",
    removeImage: "Remover imagem",
    removeOption: "Remover opcao",
    helper:
      "Os melhores posts sao curtos, claros e com uma imagem ou pergunta que puxe reacao.",
    submit: "Publicar no mural",
  },
  post: {
    pinned: "Arquivo em destaque",
    closeComments: "Fechar",
    openComments: "Abrir conversa",
    commentCount: "comentarios",
    reactionCount: "reacoes",
  },
  comments: {
    empty: "Este registo ainda nao tem respostas.",
    label: "Responder",
    placeholder: "Acrescenta contexto, piada interna ou detalhe util para o grupo.",
    submit: "Enviar resposta",
  },
  media: {
    unavailable: "Imagem indisponivel",
    detail:
      "O post ficou registado, mas o ficheiro ainda nao esta acessivel no arquivo.",
  },
} as const;
