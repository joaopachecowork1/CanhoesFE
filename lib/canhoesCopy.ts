export const adminCopy = {
  controlStrip: {
    kicker: "Mesa da edicao",
    title: "Comando desta edicao",
    description:
      "Fase, moderacao e visibilidade num painel pensado para decisoes rapidas no telemovel.",
    clearQueue: "Fila limpa",
  },
  dashboard: {
    pulseKicker: "Ritmo da edicao",
    queueKicker: "Decisoes por fechar",
    recentKicker: "Arquivo recente",
    queueTitle: "Ha aprovacoes para fechar nesta edicao",
  },
  shell: {
    backendHint: "Atualiza a edicao ou confirma o backend antes de continuar a moderacao.",
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
