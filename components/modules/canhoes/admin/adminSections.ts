import { Award, BarChart3, FolderTree, ShieldCheck, Users, type LucideIcon } from "lucide-react";

export type AdminSectionId = "control-center" | "moderation" | "categories" | "members" | "audit";

export type AdminSectionCountContext = {
  nomineePendingCount: number;
  pendingReviewCount: number;
  voteCount: number;
};

export type AdminSectionGroup = "primary" | "secondary";

export type AdminSectionItem = {
  count: number;
  description: string;
  group: AdminSectionGroup;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
};

export type AdminQuickAction = {
  description: string;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
  tone: "primary" | "secondary";
};

type AdminSectionDefinition = {
  count: (context: AdminSectionCountContext) => number;
  description: string;
  group: AdminSectionGroup;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
  quickActionTone?: "primary" | "secondary";
};

const ADMIN_SECTION_REGISTRY: readonly AdminSectionDefinition[] = [
  {
    id: "control-center",
    label: "Control Center",
    description: "Evento ativo, fase atual, calendario e modulos desta edicao.",
    group: "primary",
    icon: ShieldCheck,
    quickActionTone: "primary",
    count: () => 0,
  },
  {
    id: "moderation",
    label: "Moderation",
    description: "Fila de moderacao para nomeacoes, categorias e medidas.",
    group: "primary",
    icon: Award,
    quickActionTone: "primary",
    count: (context) => context.pendingReviewCount,
  },
  {
    id: "categories",
    label: "Categories",
    description: "CRUD e configuracao das categorias desta edicao.",
    group: "primary",
    icon: FolderTree,
    quickActionTone: "primary",
    count: () => 0,
  },
  {
    id: "members",
    label: "Members",
    description: "Participantes, admins e composicao da edicao.",
    group: "primary",
    icon: Users,
    quickActionTone: "secondary",
    count: () => 0,
  },
  {
    id: "audit",
    label: "Audit",
    description: "Auditoria de votos e registo do que ja foi submetido.",
    group: "secondary",
    icon: BarChart3,
    count: (context) => context.voteCount,
  },
] as const;

export const ADMIN_QUICK_ACTIONS: readonly AdminQuickAction[] =
  ADMIN_SECTION_REGISTRY.filter(
    (sectionDefinition) => sectionDefinition.quickActionTone
  ).map((sectionDefinition) => ({
    id: sectionDefinition.id,
    label: sectionDefinition.label,
    description: sectionDefinition.description,
    icon: sectionDefinition.icon,
    tone: sectionDefinition.quickActionTone!,
  }));

export function buildAdminSectionItems(
  context: Readonly<AdminSectionCountContext>
): AdminSectionItem[] {
  return ADMIN_SECTION_REGISTRY.map((sectionDefinition) => ({
    id: sectionDefinition.id,
    label: sectionDefinition.label,
    description: sectionDefinition.description,
    group: sectionDefinition.group,
    icon: sectionDefinition.icon,
    count: sectionDefinition.count(context),
  }));
}

export function getAdminSection(
  sectionId: AdminSectionId
): AdminSectionDefinition | undefined {
  return ADMIN_SECTION_REGISTRY.find(
    (sectionDefinition) => sectionDefinition.id === sectionId
  );
}

export function getDefaultAdminSection(
  context: Readonly<Pick<AdminSectionCountContext, "pendingReviewCount">>
): AdminSectionId {
  return context.pendingReviewCount > 0 ? "moderation" : "control-center";
}
