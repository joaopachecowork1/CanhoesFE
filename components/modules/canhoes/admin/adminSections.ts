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
    id: "conteudo",
    label: "Conteúdo",
    description: "Fila, categorias e resultados oficiais.",
    icon: FolderTree,
    count: (context) => context.pendingReviewCount + context.pendingNominationsCount,
  },
  {
    id: "configuracoes",
    label: "Evento",
    description: "Evento ativo, fase e visibilidade dos modulos.",
    icon: Settings2,
    count: (context) => context.visibleModuleCount,
  },
  {
    id: "membros",
    label: "Amigos",
    description: "Amigo secreto e roster operacional desta edicao.",
    icon: Users,
    count: (context) => context.memberCount,
  },
  {
    id: "dashboard",
    label: "Resumo",
    description: "Leitura rapida da edicao, da fila e dos sinais operacionais.",
    icon: Layers3,
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

export function getAdminSectionItem(id: AdminSectionId) {
  return ADMIN_SECTION_REGISTRY.find((sectionDefinition) => sectionDefinition.id === id) ?? null;
}

export function getDefaultAdminSection(): AdminSectionId {
  return "conteudo";
}
