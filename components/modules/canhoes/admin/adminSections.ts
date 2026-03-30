import {
  Award,
  BarChart3,
  CalendarRange,
  FolderTree,
  LayoutDashboard,
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
  group: "primary" | "secondary";
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
};

export type AdminQuickAction = {
  description: string;
  icon: LucideIcon;
  id: AdminSectionId;
  label: string;
  tone?: "primary" | "secondary";
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

const PRIMARY_SECTION_IDS: readonly AdminSectionId[] = [
  "pending",
  "state",
  "categories",
  "nominees",
];

const SECTION_ICONS: Record<AdminSectionId, LucideIcon> = {
  dashboard: LayoutDashboard,
  pending: TicketCheck,
  state: CalendarRange,
  categories: FolderTree,
  nominees: Award,
  "secret-santa": Sparkles,
  users: Users,
  audit: BarChart3,
};

export const ADMIN_QUICK_ACTIONS: readonly AdminQuickAction[] = [
  {
    id: "pending",
    label: "Fila de revisao",
    description: "Propostas e nomeacoes por decidir.",
    icon: TicketCheck,
    tone: "primary",
  },
  {
    id: "state",
    label: "Evento e fase",
    description: "Evento ativo, fase e visibilidade.",
    icon: CalendarRange,
    tone: "primary",
  },
  {
    id: "categories",
    label: "Categorias",
    description: "Criar, editar e limpar categorias.",
    icon: FolderTree,
    tone: "primary",
  },
  {
    id: "secret-santa",
    label: "Sorteio",
    description: "Gerar ou rever o Amigo Secreto.",
    icon: Sparkles,
    tone: "secondary",
  },
  {
    id: "users",
    label: "Membros",
    description: "Ver quem participa nesta edicao.",
    icon: Users,
    tone: "secondary",
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
    group: PRIMARY_SECTION_IDS.includes(sectionId) ? "primary" : "secondary",
    icon: SECTION_ICONS[sectionId],
    count: SECTION_COUNT_RESOLVERS[sectionId](context),
  }));
}

export function getDefaultAdminSection(
  context: Readonly<Pick<AdminSectionCountContext, "pendingReviewCount">>
): AdminSectionId {
  return context.pendingReviewCount > 0 ? "pending" : "state";
}
