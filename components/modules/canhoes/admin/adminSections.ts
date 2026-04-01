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

/**
 * Central registry that defines every admin section available in the panel.
 *
 * Each entry declares:
 *   - `id`              Stable identifier used for routing between sections.
 *   - `label`           Short Portuguese label shown in the nav tab strip.
 *   - `description`     One-line description shown in the section stage header.
 *   - `group`           "primary" sections always appear in the horizontal tab
 *                       strip; "secondary" sections appear after them.
 *   - `icon`            Lucide icon shown next to the label.
 *   - `quickActionTone` When set, the section is also shown as a quick-action
 *                       card in AdminControlStrip (primary = green, secondary = purple).
 *   - `count`           Returns a live badge count derived from AdminSectionCountContext.
 *                       Return 0 when no badge is needed.
 */
const ADMIN_SECTION_REGISTRY: readonly AdminSectionDefinition[] = [
  {
    id: "control-center",
    label: "Controlo",
    description: "Evento ativo, fase atual, calendario e modulos desta edicao.",
    group: "primary",
    icon: ShieldCheck,
    quickActionTone: "primary",
    count: () => 0,
  },
  {
    id: "moderation",
    label: "Moderacao",
    description: "Fila de moderacao para nomeacoes, categorias e medidas.",
    group: "primary",
    icon: Award,
    quickActionTone: "primary",
    count: (context) => context.pendingReviewCount,
  },
  {
    id: "categories",
    label: "Categorias",
    description: "CRUD e configuracao das categorias desta edicao.",
    group: "primary",
    icon: FolderTree,
    quickActionTone: "primary",
    count: () => 0,
  },
  {
    id: "members",
    label: "Membros",
    description: "Participantes, admins e composicao da edicao.",
    group: "primary",
    icon: Users,
    quickActionTone: "secondary",
    count: () => 0,
  },
  {
    id: "audit",
    label: "Auditoria",
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
