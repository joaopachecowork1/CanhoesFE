import {
  BarChart2,
  FolderTree,
  LayoutDashboard,
  Layers3,
  TimerReset,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSectionId =
  | "overview"
  | "categories"
  | "nominations"
  | "results"
  | "members"
  | "modules"
  | "phase";

export type AdminSectionCountContext = {
  memberCount: number;
  pendingNominationsCount: number;
  pendingReviewCount: number;
  visibleModuleCount: number;
};

export type AdminSectionItem = {
  count: number;
  description: string;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
};

type AdminSectionDefinition = {
  count: (context: AdminSectionCountContext) => number;
  description: string;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
};

const ADMIN_SECTION_REGISTRY: readonly AdminSectionDefinition[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Resumo da edicao, stats e estado geral sem controlos.",
    icon: LayoutDashboard,
    count: () => 0,
  },
  {
    id: "categories",
    label: "Categories",
    description: "Curadoria de categorias e revisao de conteudo da edicao.",
    icon: FolderTree,
    count: (context) => context.pendingReviewCount,
  },
  {
    id: "nominations",
    label: "Nomeacoes",
    description: "Moderacao de nomeacoes com autoria visivel apenas para admin.",
    icon: Trophy,
    count: (context) => context.pendingNominationsCount,
  },
  {
    id: "results",
    label: "Resultados",
    description: "Ranking oficial por categoria, participacao e eleitores.",
    icon: BarChart2,
    count: () => 0,
  },
  {
    id: "members",
    label: "Members",
    description: "Lista de membros e roles desta edicao.",
    icon: Users,
    count: (context) => context.memberCount,
  },
  {
    id: "modules",
    label: "Modules",
    description: "Unico sitio para gerir visibilidade de modulos.",
    icon: Layers3,
    count: (context) => context.visibleModuleCount,
  },
  {
    id: "phase",
    label: "Phase",
    description: "Evento ativo, fase atual e passagem entre fases.",
    icon: TimerReset,
    count: () => 0,
  },
] as const;

export const ADMIN_SECTION_IDS: readonly AdminSectionId[] = ADMIN_SECTION_REGISTRY.map(
  (sectionDefinition) => sectionDefinition.id
);

export function isAdminSectionId(value: string): value is AdminSectionId {
  return (ADMIN_SECTION_IDS as readonly string[]).includes(value);
}

export function getAdminSectionMeta() {
  return ADMIN_SECTION_REGISTRY.map((sectionDefinition) => ({
    id: sectionDefinition.id,
    label: sectionDefinition.label,
    icon: sectionDefinition.icon,
  }));
}

export function getAdminAdjacentSection(
  current: AdminSectionId,
  direction: "prev" | "next"
): AdminSectionId | null {
  const index = ADMIN_SECTION_IDS.indexOf(current);
  if (index < 0) return null;

  const targetIndex = direction === "next" ? index + 1 : index - 1;
  if (targetIndex < 0 || targetIndex >= ADMIN_SECTION_IDS.length) return null;

  return ADMIN_SECTION_IDS[targetIndex] ?? null;
}

export function buildAdminSectionItems(
  context: Readonly<AdminSectionCountContext>
): AdminSectionItem[] {
  return ADMIN_SECTION_REGISTRY.map((sectionDefinition) => ({
    id: sectionDefinition.id,
    label: sectionDefinition.label,
    description: sectionDefinition.description,
    icon: sectionDefinition.icon,
    count: sectionDefinition.count(context),
  }));
}

export function getDefaultAdminSection(): AdminSectionId {
  return "overview";
}
