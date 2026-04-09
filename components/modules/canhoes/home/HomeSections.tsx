"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock3, Gift, Loader2, MessageSquare, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanhoesHeroEmblem } from "@/components/chrome/canhoes/CanhoesHeroEmblem";
import { ErrorAlert } from "@/components/ui/error-alert";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { homeCopy as homeCopyText } from "@/lib/canhoesCopy";
import { getPhaseLabel, openComposeSheet } from "@/lib/canhoesEvent";
import { cn } from "@/lib/utils";

import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";
import { ActionButton, ActionLinkButton } from "./HomeActions";
import { ChecklistItem, MetricCard } from "./HomeCards";
import { FeedPostCard, SecretSantaStateCard } from "./HomeFeedCard";

const HERO_CARD_CLASS =
  "rounded-[var(--radius-xl-token)] border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.16),transparent_36%),linear-gradient(180deg,rgba(25,33,15,0.98),rgba(12,16,9,0.99))] text-[var(--text-primary)] shadow-[var(--shadow-panel)]";
const PANEL_CARD_CLASS =
  "rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]";

type HomeAction = CanhoesEventHomeViewModel["homeCopy"]["primaryAction"];
type RecentPost = CanhoesEventHomeViewModel["recentPosts"][number];
type MetricItem = { hint: string; label: string; tone?: "green" | "purple"; value: string };
type ChecklistItemData = { done: boolean; hint?: string; label: string };
type AlertItem = string;

export function CanhoesEventHomeLoadingState() {
  return (
    <Card className={HERO_CARD_CLASS}>
      <CardContent className="flex min-h-[16rem] items-center justify-center">
        <div className="flex items-center gap-3 text-[rgba(245,237,224,0.9)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--moss)]" />
          <span className="font-[var(--font-mono)] text-sm uppercase tracking-[0.16em]">
            {homeCopyText.loading}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CanhoesEventHomeErrorState({
  errorMessage,
}: Readonly<{ errorMessage: string | null }>) {
  return (
    <Card className={HERO_CARD_CLASS}>
      <CardContent className="py-8">
        <ErrorAlert
          title={homeCopyText.errorTitle}
          description={errorMessage ?? homeCopyText.errorDescription}
          actionLabel="Tentar outra vez"
          onAction={() => globalThis.location.reload()}
        />
      </CardContent>
    </Card>
  );
}

export function CanhoesEventHomeContent({
  viewModel,
}: Readonly<{ viewModel: CanhoesEventHomeViewModel }>) {
  const { event, homeCopy, overview, phaseDeadline, phaseLabel, phaseSummary, recentPosts, secretSanta, secretSantaAction, voting, wishlistAction } = viewModel;

  const metrics: MetricItem[] = [
    {
      hint:
        voting.categoryCount > 0
          ? `${voting.remainingVoteCount} por fechar`
          : "Sem categorias oficiais abertas nesta fase",
      label: "Boletim oficial",
      tone: "purple",
      value: `${voting.submittedVoteCount}/${voting.categoryCount}`,
    },
    {
      hint: secretSanta.hasAssignment ? "Ligada ao teu amigo secreto" : "Prepara antes do sorteio",
      label: "Wishlist",
      value: String(secretSanta.myWishlistItemCount),
    },
    {
      hint: "Posts ja publicados nesta edicao",
      label: "Mural social",
      tone: "purple",
      value: String(overview.counts.feedPostCount),
    },
    {
      hint: `${overview.counts.pendingProposalCount} itens em revisao`,
      label: "Membros",
      value: String(overview.counts.memberCount),
    },
  ];

  const checklist: ChecklistItemData[] = [
    {
      done: !overview.modules.wishlist || secretSanta.myWishlistItemCount > 0,
      hint: overview.modules.wishlist ? `${secretSanta.myWishlistItemCount} itens visiveis` : "Wishlist indisponivel nesta fase",
      label: "Estado da tua wishlist",
    },
    {
      done: overview.myProposalCount > 0 || !overview.permissions.canSubmitProposal,
      hint: overview.permissions.canSubmitProposal ? `${overview.myProposalCount} propostas feitas` : "Sem propostas abertas nesta fase",
      label: "Estado das tuas propostas",
    },
    {
      done: !overview.modules.voting || voting.remainingVoteCount === 0,
      hint:
        overview.modules.voting && voting.categoryCount > 0
          ? `${voting.submittedVoteCount} / ${voting.categoryCount} categorias`
          : "Sem boletim oficial aberto",
      label: "Boletim oficial deste ciclo",
    },
  ];

  return (
    <div className="space-y-4">
      <HomeHeroSection
        event={event}
        homeCopy={homeCopy}
        metrics={metrics}
        overview={overview}
        phaseDeadline={phaseDeadline}
        phaseLabel={phaseLabel}
        phaseSummary={phaseSummary}
      />

      {homeCopy.alerts.length > 0 ? <HomeAlertsSection alerts={homeCopy.alerts} /> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {overview.modules.feed ? (
          <SectionBoundary
            title="Erro no mural social"
            description="O mural social falhou ao abrir, mas o resto do evento continua disponivel."
          >
            <HomeFeedPanel posts={recentPosts} />
          </SectionBoundary>
        ) : null}

        <div className="space-y-4">
          {overview.modules.secretSanta ? (
            <SectionBoundary
              title="Erro no amigo secreto"
              description="A area do amigo secreto falhou ao renderizar, mas os outros blocos desta pagina continuam disponiveis."
            >
              <HomeSecretSantaPanel
                assignedWishlistItemCount={secretSanta.assignedWishlistItemCount}
                assignedUserName={secretSanta.assignedUser?.name}
                hasAssignment={secretSanta.hasAssignment}
                hasDraw={secretSanta.hasDraw}
                secretSantaAction={secretSantaAction}
                wishlistAction={wishlistAction}
              />
            </SectionBoundary>
          ) : null}

          <SectionBoundary
            title="Erro no resumo da fase"
            description="O resumo desta fase falhou ao renderizar, mas o resto da pagina continua disponivel."
          >
            <HomeChecklistPanel items={checklist} />
          </SectionBoundary>
        </div>
      </div>
    </div>
  );
}

function HomeHeroSection({
  event,
  homeCopy,
  metrics,
  overview,
  phaseDeadline,
  phaseLabel,
  phaseSummary,
}: Readonly<{
  event: CanhoesEventHomeViewModel["event"];
  homeCopy: CanhoesEventHomeViewModel["homeCopy"];
  metrics: MetricItem[];
  overview: CanhoesEventHomeViewModel["overview"];
  phaseDeadline: string | null;
  phaseLabel: string;
  phaseSummary: string;
}>) {
  return (
    <section className="editorial-shell overflow-hidden rounded-[var(--radius-xl-token)] border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.16),transparent_36%),linear-gradient(180deg,rgba(25,33,15,0.98),rgba(12,16,9,0.99))] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
      <div className="space-y-4 px-4 py-5 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.88)]">
              {event.name}
            </p>
            <h1 className="heading-1 text-[var(--bg-paper)] [text-shadow:var(--glow-green-sm)]">
              {homeCopyText.heroTitle}
            </h1>
          </div>
          <CanhoesHeroEmblem compact className="mt-1" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-[var(--border-neon)]/60 bg-[var(--accent)] text-[var(--neon-green)]">
            {phaseLabel}
          </Badge>
          {overview.nextPhase ? (
            <Badge variant="outline" className="border-[rgba(212,184,150,0.28)] bg-[rgba(212,184,150,0.1)] text-[var(--bg-paper)]">
              Proxima: {getPhaseLabel(overview.nextPhase.type)}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-2">
          <h1 className="heading-1 text-[var(--bg-paper)] [text-shadow:var(--glow-green-sm)]">
            Resumo da Fase
          </h1>
          <p className="body-base max-w-3xl text-[rgba(245,237,224,0.92)]">{phaseSummary}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {[homeCopy.primaryAction, homeCopy.secondaryAction].map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(212,184,150,0.12)] pt-4 text-sm text-[rgba(245,237,224,0.9)]">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[var(--accent-purple-soft)]" />
            {phaseDeadline ? `Fecha a ${phaseDeadline}` : "Sem data de fecho definida"}
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--neon-green)]" />
            {overview.permissions.canManage ? homeCopyText.manageLabel : homeCopyText.memberLabel}
          </span>
        </div>
      </div>
    </section>
  );
}

function HomeAlertsSection({ alerts }: Readonly<{ alerts: AlertItem[] }>) {
  return (
    <HomePanel title={homeCopyText.alertsTitle} icon={Clock3} cardClassName="border-[rgba(212,184,150,0.22)] bg-[rgba(57,45,28,0.28)]">
      {alerts.map((alert) => (
        <div key={alert} className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.24)] bg-[rgba(57,45,28,0.42)] px-3 py-3 text-sm text-[var(--bg-paper)]">
          {alert}
        </div>
      ))}
    </HomePanel>
  );
}

function HomeFeedPanel({ posts }: Readonly<{ posts: RecentPost[] }>) {
  return (
    <HomePanel
      title="Mural social da edicao"
      icon={MessageSquare}
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={openComposeSheet}>
            Publicar no mural
          </Button>
        </div>
      }
    >
      {posts.length === 0 ? (
        <HomePanelState>{homeCopyText.emptyFeed}</HomePanelState>
      ) : (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      )}
    </HomePanel>
  );
}

function HomeSecretSantaPanel({
  assignedWishlistItemCount,
  assignedUserName,
  hasAssignment,
  hasDraw,
  secretSantaAction,
  wishlistAction,
}: Readonly<{
  assignedWishlistItemCount: number;
  assignedUserName?: string;
  hasAssignment: boolean;
  hasDraw: boolean;
  secretSantaAction: HomeAction;
  wishlistAction: HomeAction;
}>) {
  return (
    <HomePanel title={homeCopyText.secretSantaTitle} icon={Gift}>
      <SecretSantaStateCard
        assignedWishlistItemCount={assignedWishlistItemCount}
        assignedUserName={assignedUserName}
        hasAssignment={hasAssignment}
        hasDraw={hasDraw}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <ActionLinkButton action={secretSantaAction} variant="outline" />
        <ActionLinkButton action={wishlistAction} variant="secondary" />
      </div>
    </HomePanel>
  );
}

function HomeChecklistPanel({ items }: Readonly<{ items: ChecklistItemData[] }>) {
  return (
    <HomePanel title={homeCopyText.checklistTitle} icon={Vote}>
      {items.map((item) => (
        <ChecklistItem key={item.label} {...item} />
      ))}
    </HomePanel>
  );
}

function HomePanel({
  cardClassName,
  children,
  footer,
  icon: Icon,
  title,
}: Readonly<{
  cardClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
  icon: LucideIcon;
  title: string;
}>) {
  return (
    <Card className={cn(PANEL_CARD_CLASS, cardClassName)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--bg-paper)]">
          <Icon className="h-4 w-4 text-[var(--moss)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
}

function HomePanelState({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.72)] px-3 py-4 text-sm text-[rgba(245,237,224,0.88)]">
      {children}
    </div>
  );
}
