import {
  FolderTree,
  Layers3,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

import { createAdminSectionRegistry } from "./adminSectionRegistry";

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

const ADMIN_SECTION_REGISTRY = createAdminSectionRegistry<AdminSectionId, AdminSectionCountContext>([
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
] as const);

export const ADMIN_SECTION_IDS = ADMIN_SECTION_REGISTRY.ids;

export function isAdminSectionId(value: string): value is AdminSectionId {
  return ADMIN_SECTION_REGISTRY.isId(value);
}

export function getAdminSectionMeta() {
  return ADMIN_SECTION_REGISTRY.getMeta();
}

export function getAdminSectionItem(id: AdminSectionId) {
  return ADMIN_SECTION_REGISTRY.getItem(id);
}

export function getDefaultAdminSection(): AdminSectionId {
  return "conteudo";
}
