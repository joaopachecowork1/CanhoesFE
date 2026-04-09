import type {
  AdminModuleKey,
  EventAdminModuleVisibilityDto,
  EventModulesDto,
} from "@/lib/api/types";

export type CanhoesMemberModuleKey = AdminModuleKey;

export type CanhoesMemberModuleDefinition = {
  description: string;
  group: "community" | "core" | "finale";
  href: string;
  key: CanhoesMemberModuleKey;
  label: string;
  navLabel?: string;
};

// Source of truth for member-facing modules. Admin UI, visibility toggles and
// shell navigation should read from this registry instead of spreading labels
// and descriptions across unrelated files.
export const CANHOES_MEMBER_MODULES: readonly CanhoesMemberModuleDefinition[] = [
  {
    key: "feed",
    label: "Feed",
    navLabel: "Mural",
    href: "/canhoes/feed",
    group: "core",
    description: "Mural social da edicao com posts, imagens e sondagens rapidas do grupo.",
  },
  {
    key: "nominees",
    label: "Nomeacoes",
    navLabel: "Nomeacoes",
    href: "/canhoes/nomeacoes",
    group: "community",
    description: "Area oficial para consultar nomeacoes aprovadas e o que ja entrou no ciclo.",
  },
  {
    key: "categories",
    label: "Categorias",
    navLabel: "Categorias",
    href: "/canhoes/categorias",
    group: "core",
    description: "Area oficial com categorias do premio e propostas abertas nesta fase.",
  },
  {
    key: "secretSanta",
    label: "Amigos",
    navLabel: "Amigo",
    href: "/canhoes/amigo-secreto",
    group: "community",
    description: "Acesso ao Amigo Secreto, atribuicao individual e ritual desta fase.",
  },
  {
    key: "wishlist",
    label: "Wishlist",
    navLabel: "Wishlist",
    href: "/canhoes/wishlist",
    group: "community",
    description: "Pistas, desejos e referencias ligadas ao teu Amigo Secreto.",
  },
  {
    key: "voting",
    label: "Votacao",
    navLabel: "Boletim",
    href: "/canhoes/votacao",
    group: "core",
    description: "Boletim oficial da edicao com voto validado e progresso por categoria.",
  },
  {
    key: "stickers",
    label: "Stickers",
    navLabel: "Stickers",
    href: "/canhoes/stickers",
    group: "community",
    description: "Submissao e consulta de stickers aprovados nesta edicao.",
  },
  {
    key: "measures",
    label: "Medidas",
    navLabel: "Medidas",
    href: "/canhoes/medidas",
    group: "finale",
    description: "Regras, medidas aprovadas e ajustes para a reta final.",
  },
  {
    key: "gala",
    label: "Gala",
    navLabel: "Gala",
    href: "/canhoes/gala",
    group: "finale",
    description: "Momento final da edicao com resultados e fecho do ritual.",
  },
] as const;

export const CANHOES_MEMBER_NAV_ORDER: readonly CanhoesMemberModuleKey[] = [
  "feed",
  "secretSanta",
  "wishlist",
  "categories",
  "voting",
  "stickers",
  "nominees",
  "measures",
  "gala",
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
  return Object.fromEntries(
    CANHOES_MEMBER_MODULES.map((moduleDefinition) => [
      moduleDefinition.key,
      enabled,
    ])
  ) as EventAdminModuleVisibilityDto;
}

export function countVisibleModules(
  visibility: EventAdminModuleVisibilityDto | EventModulesDto | null | undefined
) {
  if (!visibility) return 0;

  return CANHOES_MEMBER_MODULES.filter(
    (moduleDefinition) => visibility[moduleDefinition.key]
  ).length;
}
