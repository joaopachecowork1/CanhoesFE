import {
  CalendarRange,
  FolderTree,
  Sparkles,
  TicketCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSectionId =
  | "dashboard"
  | "pending"
  | "state"
  | "categories"
  | "nominees"
  | "secret-santa"
  | "users"
  | "audit";

export type AdminSectionCountContext = {
  nomineePendingCount: number;
  pendingReviewCount: number;
  voteCount: number;
};

export type AdminSectionItem = {
  count: number;
  id: AdminSectionId;
  label: string;
};

export type AdminQuickAction = {
  description: string;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
};

const SECTION_LABELS: Record<AdminSectionId, string> = {
  dashboard: "Resumo",
  pending: "Pendentes",
  state: "Evento",
  categories: "Categorias",
  nominees: "Nomeacoes",
  "secret-santa": "Amigo",
  users: "Membros",
  audit: "Votos",
};

const SECTION_ORDER: readonly AdminSectionId[] = [
  "pending",
  "state",
  "categories",
  "nominees",
  "secret-santa",
  "users",
  "audit",
  "dashboard",
];

export const ADMIN_QUICK_ACTIONS: readonly AdminQuickAction[] = [
  {
    id: "pending",
    label: "Fila de revisao",
    description: "Propostas e nomeacoes por decidir.",
    icon: TicketCheck,
  },
  {
    id: "state",
    label: "Evento e fase",
    description: "Evento ativo, fase e visibilidade.",
    icon: CalendarRange,
  },
  {
    id: "categories",
    label: "Categorias",
    description: "Criar, editar e limpar categorias.",
    icon: FolderTree,
  },
  {
    id: "secret-santa",
    label: "Sorteio",
    description: "Gerar ou rever o Amigo Secreto.",
    icon: Sparkles,
  },
  {
    id: "users",
    label: "Membros",
    description: "Ver quem participa nesta edicao.",
    icon: Users,
  },
] as const;

const SECTION_COUNT_RESOLVERS: Record<
  AdminSectionId,
  (context: AdminSectionCountContext) => number
> = {
  dashboard: () => 0,
  pending: (context) => context.pendingReviewCount,
  state: () => 0,
  categories: () => 0,
  nominees: (context) => context.nomineePendingCount,
  "secret-santa": () => 0,
  users: () => 0,
  audit: (context) => context.voteCount,
};

export function buildAdminSectionItems(
  context: Readonly<AdminSectionCountContext>
): AdminSectionItem[] {
  return SECTION_ORDER.map((sectionId) => ({
    id: sectionId,
    label: SECTION_LABELS[sectionId],
    count: SECTION_COUNT_RESOLVERS[sectionId](context),
  }));
}

export function getDefaultAdminSection(
  context: Readonly<Pick<AdminSectionCountContext, "pendingReviewCount">>
): AdminSectionId {
  return context.pendingReviewCount > 0 ? "pending" : "state";
}
