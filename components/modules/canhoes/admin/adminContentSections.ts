import { BarChart2, FolderTree, Gavel, type LucideIcon } from "lucide-react";

export type AdminContentSectionId = "queue" | "categorias" | "resultados";

export type AdminContentSectionCountContext = {
  categoriesCount: number;
  pendingCategoryProposalsCount: number;
  pendingMeasureProposalsCount: number;
  pendingNominationsCount: number;
  resultsCount: number;
};

export type AdminContentSectionItem = {
  count: number;
  description: string;
  icon: LucideIcon;
  id: AdminContentSectionId;
  label: string;
};

type AdminContentSectionDefinition = {
  count: (context: Readonly<AdminContentSectionCountContext>) => number;
  description: string;
  icon: LucideIcon;
  id: AdminContentSectionId;
  label: string;
};

const ADMIN_CONTENT_SECTION_REGISTRY: readonly AdminContentSectionDefinition[] = [
  {
    id: "queue",
    label: "Queue",
    description: "Propostas pendentes e moderacao prioritaria.",
    icon: Gavel,
    count: (context) =>
      context.pendingNominationsCount +
      context.pendingCategoryProposalsCount +
      context.pendingMeasureProposalsCount,
  },
  {
    id: "categorias",
    label: "Categorias",
    description: "CRUD das categorias oficiais e campos relacionados.",
    icon: FolderTree,
    count: (context) => context.categoriesCount,
  },
  {
    id: "resultados",
    label: "Resultados",
    description: "Resultados oficiais e auditoria isolados da moderacao.",
    icon: BarChart2,
    count: (context) => context.resultsCount,
  },
] as const;

export const ADMIN_CONTENT_SECTION_IDS: readonly AdminContentSectionId[] =
  ADMIN_CONTENT_SECTION_REGISTRY.map((sectionDefinition) => sectionDefinition.id);

export function isAdminContentSectionId(value: string): value is AdminContentSectionId {
  return (ADMIN_CONTENT_SECTION_IDS as readonly string[]).includes(value);
}

export function buildAdminContentSectionItems(
  context: Readonly<AdminContentSectionCountContext>
): AdminContentSectionItem[] {
  return ADMIN_CONTENT_SECTION_REGISTRY.map((sectionDefinition) => ({
    id: sectionDefinition.id,
    label: sectionDefinition.label,
    description: sectionDefinition.description,
    icon: sectionDefinition.icon,
    count: sectionDefinition.count(context),
  }));
}

export function getDefaultAdminContentSection(): AdminContentSectionId {
  return "queue";
}
