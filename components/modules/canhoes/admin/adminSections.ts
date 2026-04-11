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
    label: "Resumo",
    description: "Leitura rapida da edicao, da fila e dos sinais operacionais.",
    icon: Layers3,
    count: () => 0,
  },
  {
    id: "conteudo",
    label: "Conteúdo",
    description: "Fila, categorias e resultados oficiais.",
    icon: FolderTree,
    count: (context) => context.pendingReviewCount + context.pendingNominationsCount,
  },
  {
    id: "membros",
    label: "Amigos",
    description: "Amigo secreto e roster operacional desta edicao.",
    icon: Users,
    count: (context) => context.memberCount,
  },
  {
    id: "configuracoes",
    label: "Evento",
    description: "Evento ativo, fase e visibilidade dos modulos.",
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

export function getAdminSectionItem(id: AdminSectionId) {
  return ADMIN_SECTION_REGISTRY.find((sectionDefinition) => sectionDefinition.id === id) ?? null;
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
  return "conteudo";
}
