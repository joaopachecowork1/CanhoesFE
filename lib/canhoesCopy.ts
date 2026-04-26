export const adminCopy = {
  controlStrip: {
    kicker: "Admin operacional",
    title: "Painel operacional",
    description:
      "Evento ativo, fase, fila e visibilidade num painel curto para decisoes rapidas no telemovel.",
    clearQueue: "Fila limpa",
    refresh: "Atualizar painel",
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
      openAction: "Abrir mais areas",
      kicker: "Mais areas",
      title: "Atalhos do evento",
      description:
        "Separa mural social, participacao oficial e admin sem alongar a navegacao principal.",
      summaryLabel: "Atalhos",
      summaryTitle: "Areas fora do dock",
      summaryDescription:
        "Abre areas sociais, oficiais ou operacionais sem perder o contexto desta fase.",
      empty: "Nao ha outras areas abertas nesta fase.",
      explore: "Explorar",
      exploreTitle: "Areas abertas",
      exploreDescription:
        "Atalhos para areas sociais e oficiais que ficam fora do dock principal.",
      admin: "Admin",
      adminSectionDescription:
        "Ferramentas operacionais reservadas a quem gere a edicao.",
      adminTitle: "Painel operacional",
      adminDescription:
        "Fila, fases, visibilidade e resultados oficiais num unico ponto de controlo.",
      adminAction: "Abrir painel",
      total: "Total",
      shortcuts: "atalhos",
    },
  },
  state: {
    sectionKicker: "Edicao",
    sectionTitle: "Evento, fase e modulos desta edicao",
    sectionDescription:
      "Junta contexto, configuracao e visibilidade num unico bloco de controlo.",
    contextKicker: "Contexto",
    contextTitle: "Evento ativo",
    contextDescription:
      "Escolhe a edicao em curso e confirma rapidamente em que painel estas a operar.",
    activeEventLabel: "Evento ativo",
    currentEditionLabel: "Edicao em curso",
    currentEditionDescription:
      "Trocar a edicao atualiza a shell, a moderacao e os modulos dos membros.",
    configurationKicker: "Configuracao",
    configurationTitle: "Fase e calendario",
    configurationDescription:
      "Muda a fase aberta, acompanha o calendario e percebe quantos modulos estao ativos.",
    phaseLabel: "Fase ativa",
    visibleModulesLabel: "Modulos visiveis",
    visibleModulesDescription: "O que o grupo ve agora",
    pendingLabel: "Pendentes",
    pendingDescription: "Itens por rever",
    phaseClosesPrefix: "Fecha a",
    activeBadge: "Ativa",
    visibilityKicker: "Acesso",
    visibilityTitle: "Visibilidade dos modulos",
    visibilityDescription:
      "A fase manda no ritmo, mas o admin decide o que ainda fica aberto para o grupo.",
    visibilityActionsLabel: "Acoes rapidas",
    enableAll: "Ativar todos",
    disableAll: "Desativar todos",
    saving: "A guardar...",
    groupCore: "Base da edicao",
    groupCommunity: "Participacao",
    groupFinale: "Reta final",
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
      "Abre categorias para esta edicao sem sair do painel operacional.",
    manageKicker: "Gestao",
    manageTitle: "Categorias da edicao",
    empty: "Esta edicao ainda nao tem categorias criadas.",
    historyKicker: "Arquivo",
    historyTitle: "Historico de propostas",
    historyEmpty:
      "Ainda nao chegaram propostas de categoria para esta edicao.",
    title: "Categorias",
    description: "Gerir e modificar as categorias de premio da edicao.",
    expand: "Expandir lista",
    collapse: "Reduzir lista",
    loading: "A carregar categorias...",
    success: "Categoria sincronizada",
    edit: "Editar",
    error: {
      emptyName: "Por favor preencha o nome da categoria.",
      emptyDescription: "Por favor preencha a descricao da categoria.",
      tooLong: "O nome deve ter no maximo 80 caracteres.",
      tooLongDescription: "A descricao deve ter no maximo 200 caracteres.",
      invalidId: "ID invalido.",
    },
    maxNameLength: 80,
    maxDescriptionLength: 200,
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
  manageLabel: "Tens acesso ao admin operacional desta edicao.",
  memberLabel: "Vista de membro entre mural social e participacao oficial.",
} as const;

export const feedCopy = {
  hero: {
    kicker: "Mural social",
    title: "Mural social da edicao",
    description:
      "Publicacoes, imagens e sondagens rapidas para manter o grupo alinhado sem misturar o boletim oficial.",
    refresh: "Atualizar mural",
  },
  empty: {
    kicker: "Mural por abrir",
    title: "O mural social ainda nao tem registos publicados",
    description:
      "Abre o mural com uma fotografia, um aviso rapido ou uma sondagem para o grupo.",
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
      label: "Sondagens do mural",
      description: "Perguntas rapidas do mural, separadas do boletim oficial.",
    },
    pinned: {
      label: "Destaques",
      description: "Posts fixados para segurar contexto no topo do mural.",
    },
  },
  composer: {
    kicker: "Novo post",
    title: "Publicar no mural social da edicao",
    description:
      "Partilha uma nota, uma imagem ou uma sondagem curta para manter o grupo dentro do momento.",
    sheetTitle: "Novo registo",
    sheetDescription:
      "Partilha uma foto, um texto ou uma sondagem curta para manter o grupo dentro desta fase.",
    mediaLabel: "Imagens",
    pollLabel: "Sondagem",
    textLabel: "Texto",
    textPlaceholder:
      "Escreve uma nota rapida, um contexto para a gala ou um update para o grupo.",
    mediaSelected: "Imagens prontas",
    pollTitle: "Abrir uma sondagem no mural",
    pollDescription: "Define a pergunta e as opcoes. Isto nao substitui o boletim oficial.",
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
      "Os melhores posts sao curtos, claros e puxam resposta com uma imagem ou uma sondagem simples.",
    submit: "Publicar no mural",
  },
  post: {
    pinned: "Destaque do mural",
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
