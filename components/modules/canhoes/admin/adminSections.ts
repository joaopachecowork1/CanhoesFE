import {
  FolderTree,
  Layers3,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSectionId =
  | "dashboard"
  | "conteudo"
  | "membros"
  | "configuracoes";

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
    id: "dashboard",
    label: "Dashboard",
    description: "Resumo da edicao, estatisticas e estado geral.",
    icon: Layers3,
    count: () => 0,
  },
  {
    id: "conteudo",
    label: "Conteúdo",
    description: "Curadoria de categorias, nomeacoes e resultados.",
    icon: FolderTree,
    count: (context) => context.pendingReviewCount + context.pendingNominationsCount,
  },
  {
    id: "membros",
    label: "Membros",
    description: "Lista de membros e roles desta edicao.",
    icon: Users,
    count: (context) => context.memberCount,
  },
  {
    id: "configuracoes",
    label: "Configurações",
    description: "Controlo central: visibilidade, fases e estado do evento.",
    icon: Settings2,
    count: (context) => context.visibleModuleCount,
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
  return "dashboard";
}
