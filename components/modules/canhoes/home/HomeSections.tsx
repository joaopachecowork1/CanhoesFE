"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gift,
  Loader2,
  MessageSquare,
  Sparkles,
  Vote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanhoesHeroEmblem } from "@/components/chrome/canhoes/CanhoesHeroEmblem";
import { ErrorAlert } from "@/components/ui/error-alert";
import { homeCopy as homeCopyText } from "@/lib/canhoesCopy";
import { getPhaseLabel, openComposeSheet } from "@/lib/canhoesEvent";
import { absMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";

const HERO_CARD_CLASS =
  "rounded-[var(--radius-xl-token)] border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.16),transparent_36%),linear-gradient(180deg,rgba(25,33,15,0.98),rgba(12,16,9,0.99))] text-[var(--text-primary)] shadow-[var(--shadow-panel)]";
const PANEL_CARD_CLASS =
  "rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]";
const PANEL_ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3";
const METRIC_TONE_CLASS: Record<string, string> = {
  green: "",
  purple: "border-[rgba(212,184,150,0.24)] bg-[rgba(57,45,28,0.3)]",
};

type HomeAction = CanhoesEventHomeViewModel["homeCopy"]["primaryAction"];
type RecentPost = CanhoesEventHomeViewModel["recentPosts"][number];
type MetricItem = { hint: string; label: string; tone?: "green" | "purple"; value: string };
type ChecklistItem = { done: boolean; hint?: string; label: string };
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
  const {
    event,
    homeCopy,
    overview,
    phaseDeadline,
    phaseLabel,
    phaseSummary,
    recentPosts,
    secretSanta,
    secretSantaAction,
    voting,
    wishlistAction,
  } = viewModel;

  const metrics: MetricItem[] = [
    {
      hint: voting.categoryCount > 0 ? `${voting.remainingVoteCount} por fechar` : "Sem categorias abertas nesta fase",
      label: "Votacao",
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
      label: "Feed",
      tone: "purple",
      value: String(overview.counts.feedPostCount),
    },
    {
      hint: `${overview.counts.pendingProposalCount} itens em revisao`,
      label: "Membros",
      value: String(overview.counts.memberCount),
    },
  ];

  const checklist: ChecklistItem[] = [
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
      hint: overview.modules.voting && voting.categoryCount > 0 ? `${voting.submittedVoteCount} / ${voting.categoryCount} categorias` : "Sem votacoes abertas",
      label: "Votacao deste ciclo",
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

      {homeCopy.alerts.length > 0 ? (
        <HomeAlertsSection alerts={homeCopy.alerts} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {overview.modules.feed ? (
          <HomeFeedPanel posts={recentPosts} />
        ) : null}

        <div className="space-y-4">
          {overview.modules.secretSanta ? (
            <HomeSecretSantaPanel
              assignedWishlistItemCount={secretSanta.assignedWishlistItemCount}
              assignedUserName={secretSanta.assignedUser?.name}
              hasAssignment={secretSanta.hasAssignment}
              hasDraw={secretSanta.hasDraw}
              secretSantaAction={secretSantaAction}
              wishlistAction={wishlistAction}
            />
          ) : null}

          <HomeChecklistPanel items={checklist} />
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
          <p className="body-base max-w-3xl text-[rgba(245,237,224,0.92)]">
            {phaseSummary}
          </p>
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
            <Sparkles className="h-4 w-4 text-[var(--neon-green)]" />
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
      title="Feed da edicao"
      icon={MessageSquare}
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={openComposeSheet}>
            Publicar no feed
            <ArrowRight className="h-4 w-4" />
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

function HomeChecklistPanel({ items }: Readonly<{ items: ChecklistItem[] }>) {
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

function FeedPostCard({
  post,
}: Readonly<{
  post: CanhoesEventHomeViewModel["recentPosts"][number];
}>) {
  return (
    <div className={cn(PANEL_ITEM_CLASS, "space-y-2")}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.8)]">
          {post.userName}
        </p>
        <span className="text-xs text-[rgba(245,237,224,0.74)]">
          {new Date(post.createdAt).toLocaleDateString("pt-PT")}
        </span>
      </div>
      <p className="text-sm leading-6 text-[var(--bg-paper)]">{post.content}</p>
      {post.mediaUrls?.[0] || post.imageUrl ? (
        <div className="overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={absMediaUrl(post.mediaUrls?.[0] ?? post.imageUrl)}
            alt={`Media do post de ${post.userName}`}
            loading="lazy"
            decoding="async"
            className="h-44 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

function SecretSantaStateCard({
  assignedUserName,
  assignedWishlistItemCount,
  hasAssignment,
  hasDraw,
}: Readonly<{
  assignedUserName?: string;
  assignedWishlistItemCount: number;
  hasAssignment: boolean;
  hasDraw: boolean;
}>) {
  return hasAssignment && assignedUserName ? (
    <div className={cn(PANEL_ITEM_CLASS, "space-y-2")}>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.78)]">
        Pessoa atribuida
      </p>
      <p className="text-base font-semibold text-[var(--bg-paper)]">{assignedUserName}</p>
      <p className="text-sm text-[rgba(245,237,224,0.84)]">
        {assignedWishlistItemCount} itens na wishlist.
      </p>
    </div>
  ) : (
    <div className={cn(PANEL_ITEM_CLASS, "space-y-2")}>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.78)]">
        Estado
      </p>
      <p className="text-sm text-[var(--bg-paper)]">
        {hasDraw
          ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
          : "O sorteio desta edicao ainda nao foi gerado."}
      </p>
    </div>
  );
}

function MetricCard({
  hint,
  label,
  tone = "green",
  value,
}: Readonly<{
  hint: string;
  label: string;
  tone?: "green" | "purple";
  value: string;
}>) {
  return (
    <div
      className={cn(
        PANEL_ITEM_CLASS,
        tone === "purple" &&
          "border-[rgba(212,184,150,0.24)] bg-[rgba(57,45,28,0.3)]"
      )}
    >
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.76)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--bg-paper)]">{value}</p>
      <p className="mt-1 text-xs text-[rgba(245,237,224,0.8)]">{hint}</p>
    </div>
  );
}

function ActionButton({ action }: Readonly<{ action: HomeAction }>) {
  return <ActionLinkButton action={action} variant={action.tone ?? "default"} />;
}

function ActionLinkButton({
  action,
  variant,
}: Readonly<{
  action: HomeAction;
  variant: "default" | "outline" | "secondary";
}>) {
  const className =
    variant === "outline"
      ? "border-[rgba(212,184,150,0.3)] bg-[rgba(212,184,150,0.08)] text-[var(--bg-paper)] hover:bg-[rgba(212,184,150,0.14)]"
      : undefined;

  if (action.href) {
    return (
      <Button variant={variant} className={className} asChild>
        <Link href={action.href}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} className={className} onClick={action.onClick}>
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function ChecklistItem({
  done,
  hint,
  label,
}: Readonly<{
  done: boolean;
  hint?: string;
  label: string;
}>) {
  return (
    <div className={cn(PANEL_ITEM_CLASS, "flex items-start gap-3 text-[var(--bg-paper)]")}>
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-[rgba(74,92,47,0.24)] bg-[rgba(74,92,47,0.12)] text-[var(--success)]"
            : "border-[rgba(212,184,150,0.28)] bg-[rgba(212,184,150,0.12)] text-[var(--beige)]"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--bg-paper)]">{label}</span>
        {hint ? (
          <span className="mt-1 block text-xs text-[rgba(245,237,224,0.8)]">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
