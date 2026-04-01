import {
  FolderTree,
  LayoutDashboard,
  Layers3,
  TimerReset,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSectionId =
  | "overview"
  | "categories"
  | "members"
  | "modules"
  | "phase";

export type AdminSectionCountContext = {
  memberCount: number;
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
