import type {
  EventAdminModuleVisibilityDto,
  EventModulesDto,
} from "@/lib/api/types";

export type CanhoesMemberModuleKey = keyof EventAdminModuleVisibilityDto;

export type CanhoesMemberModuleDefinition = {
  description: string;
  group: "community" | "core" | "finale";
  key: CanhoesMemberModuleKey;
  label: string;
  navLabel?: string;
};

export const CANHOES_MEMBER_MODULES: readonly CanhoesMemberModuleDefinition[] = [
  {
    key: "feed",
    label: "Feed",
    navLabel: "Feed",
    group: "core",
    description: "Mural principal da edicao com posts, imagens e avisos curtos.",
  },
  {
    key: "nominees",
    label: "Nomeacoes",
    navLabel: "Nomeacoes",
    group: "community",
    description: "Arquivo das nomeacoes aprovadas para consulta do grupo.",
  },
  {
    key: "categories",
    label: "Categorias",
    navLabel: "Categorias",
    group: "core",
    description: "Lista de categorias abertas nesta edicao e respetivo contexto.",
  },
  {
    key: "secretSanta",
    label: "Amigos",
    navLabel: "Amigo",
    group: "community",
    description: "Acesso ao Amigo Secreto, atribuicao individual e ritual desta fase.",
  },
  {
    key: "wishlist",
    label: "Wishlist",
    navLabel: "Wishlist",
    group: "community",
    description: "Pistas, desejos e referencias ligadas ao teu Amigo Secreto.",
  },
  {
    key: "voting",
    label: "Votacao",
    navLabel: "Votos",
    group: "core",
    description: "Boletim da fase de votacao e progresso por categoria.",
  },
  {
    key: "stickers",
    label: "Stickers",
    navLabel: "Stickers",
    group: "community",
    description: "Submissao e consulta de stickers aprovados nesta edicao.",
  },
  {
    key: "measures",
    label: "Medidas",
    navLabel: "Medidas",
    group: "finale",
    description: "Regras, medidas aprovadas e ajustes para a reta final.",
  },
  {
    key: "gala",
    label: "Gala",
    navLabel: "Gala",
    group: "finale",
    description: "Momento final da edicao com resultados e fecho do ritual.",
  },
] as const;

export const CANHOES_MEMBER_MODULE_MAP = Object.fromEntries(
  CANHOES_MEMBER_MODULES.map((moduleDefinition) => [
    moduleDefinition.key,
    moduleDefinition,
  ])
) as Record<CanhoesMemberModuleKey, CanhoesMemberModuleDefinition>;

export function buildModuleVisibilityState(
  enabled: boolean
): EventAdminModuleVisibilityDto {
  return CANHOES_MEMBER_MODULES.reduce<EventAdminModuleVisibilityDto>(
    (nextState, moduleDefinition) => ({
      ...nextState,
      [moduleDefinition.key]: enabled,
    }),
    {
      feed: enabled,
      secretSanta: enabled,
      wishlist: enabled,
      categories: enabled,
      voting: enabled,
      gala: enabled,
      stickers: enabled,
      measures: enabled,
      nominees: enabled,
    }
  );
}

export function countVisibleModules(
  visibility: EventAdminModuleVisibilityDto | EventModulesDto | null | undefined
) {
  if (!visibility) return 0;

  return CANHOES_MEMBER_MODULES.filter(
    (moduleDefinition) => visibility[moduleDefinition.key]
  ).length;
}
