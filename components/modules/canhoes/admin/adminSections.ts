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
    id: "pending",
    label: "Pendentes",
    description: "Fila de revisao para fechar propostas e nomeacoes.",
    group: "primary",
    icon: TicketCheck,
    quickActionTone: "primary",
    count: (context) => context.pendingReviewCount,
  },
  {
    id: "state",
    label: "Evento",
    description: "Evento ativo, fase, calendario e modulos disponiveis.",
    group: "primary",
    icon: CalendarRange,
    quickActionTone: "primary",
    count: () => 0,
  },
  {
    id: "categories",
    label: "Categorias",
    description: "Curadoria e manutencao das categorias desta edicao.",
    group: "primary",
    icon: FolderTree,
    quickActionTone: "primary",
    count: () => 0,
  },
  {
    id: "nominees",
    label: "Nomeacoes",
    description: "Moderacao de nomeacoes submetidas pelo grupo.",
    group: "primary",
    icon: Award,
    count: (context) => context.nomineePendingCount,
  },
  {
    id: "secret-santa",
    label: "Amigo",
    description: "Sorteio, atribuicoes e estado do Amigo Secreto.",
    group: "secondary",
    icon: Sparkles,
    quickActionTone: "secondary",
    count: () => 0,
  },
  {
    id: "users",
    label: "Membros",
    description: "Participantes, admins e composicao da edicao.",
    group: "secondary",
    icon: Users,
    quickActionTone: "secondary",
    count: () => 0,
  },
  {
    id: "audit",
    label: "Votos",
    description: "Auditoria de votos e registo do que ja foi submetido.",
    group: "secondary",
    icon: BarChart3,
    count: (context) => context.voteCount,
  },
  {
    id: "dashboard",
    label: "Resumo",
    description: "Pulso geral da edicao e atividade mais recente.",
    group: "secondary",
    icon: LayoutDashboard,
    count: () => 0,
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
  return context.pendingReviewCount > 0 ? "pending" : "state";
}
