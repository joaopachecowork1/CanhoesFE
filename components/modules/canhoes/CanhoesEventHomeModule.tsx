"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

import type {
  EventFeedPostDto,
  EventOverviewDto,
  EventSecretSantaOverviewDto,
  EventSummaryDto,
  EventVotingOverviewDto,
} from "@/lib/api/types";
import {
  formatPhaseWindow,
  getPhaseLabel,
  getPhaseSummary,
  openComposeSheet,
  pickActiveEvent,
} from "@/lib/canhoesEvent";
import { homeCopy as productHomeCopy } from "@/lib/canhoesCopy";
import { absMediaUrl } from "@/lib/media";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HomeState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      event: EventSummaryDto;
      overview: EventOverviewDto;
      secretSanta: EventSecretSantaOverviewDto;
      voting: EventVotingOverviewDto;
      recentPosts: EventFeedPostDto[];
    };

type ActionLink = {
  href?: string;
  label: string;
  onClick?: () => void;
  tone?: "default" | "outline" | "secondary";
};

function buildHomeActions({
  overview,
  secretSanta,
  voting,
}: Readonly<{
  overview: EventOverviewDto;
  secretSanta: EventSecretSantaOverviewDto;
  voting: EventVotingOverviewDto;
}>): { primaryAction: ActionLink; secondaryAction: ActionLink } {
  const phaseType = overview.activePhase?.type;

  const primaryAction: ActionLink = (() => {
    switch (phaseType) {
      case "DRAW":
        if (secretSanta.hasAssignment) {
          return { href: "/canhoes/amigo-secreto", label: "Ver amigo secreto" };
        }
        if (overview.permissions.canManage && !secretSanta.hasDraw) {
          return { href: "/canhoes/admin", label: "Abrir sorteio" };
        }
        return { href: "/canhoes/wishlist", label: "Abrir wishlists" };
      case "PROPOSALS":
        return {
          href: "/canhoes/categorias",
          label: overview.permissions.canSubmitProposal ? "Propor categoria" : "Ver categorias",
        };
      case "VOTING":
        return {
          href: "/canhoes/votacao",
          label: voting.remainingVoteCount > 0 ? "Votar agora" : "Rever votacao",
        };
      case "RESULTS":
        return {
          href: IS_LOCAL_MODE ? "/canhoes/categorias" : "/canhoes/gala",
          label: IS_LOCAL_MODE ? "Ver ranking" : "Abrir gala",
        };
      default:
        return { href: "/canhoes/categorias", label: "Entrar nas categorias" };
    }
  })();

  const secondaryAction: ActionLink =
    phaseType === "DRAW"
      ? { href: "/canhoes/wishlist", label: "Abrir wishlist", tone: "outline" }
      : { label: "Publicar no feed", onClick: openComposeSheet, tone: "outline" };

  return { primaryAction, secondaryAction };
}

function buildHomeAlerts({
  overview,
  secretSanta,
  voting,
}: Readonly<{
  overview: EventOverviewDto;
  secretSanta: EventSecretSantaOverviewDto;
  voting: EventVotingOverviewDto;
}>) {
  return [
    !secretSanta.hasDraw ? "O sorteio desta edicao ainda nao foi gerado." : null,
    secretSanta.hasDraw && !secretSanta.hasAssignment
      ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
      : null,
    overview.permissions.canSubmitProposal && overview.myProposalCount === 0
      ? "Ainda nao submeteste nenhuma proposta nesta fase."
      : null,
    voting.remainingVoteCount > 0
      ? `Faltam ${voting.remainingVoteCount} categorias por votar.`
      : null,
    secretSanta.myWishlistItemCount === 0
      ? "A tua wishlist ainda esta vazia. Deixa pistas antes de o sorteio fechar."
      : null,
  ].filter(Boolean) as string[];
}

async function loadHomeState(): Promise<HomeState> {
  const events = await canhoesEventsRepo.listEvents();
  const activeEvent = pickActiveEvent(events);

  if (!activeEvent) {
    return { status: "error" };
  }

  const [overview, secretSanta, voting, feedPosts] = await Promise.all([
    canhoesEventsRepo.getEventOverview(activeEvent.id),
    canhoesEventsRepo.getSecretSantaOverview(activeEvent.id),
    canhoesEventsRepo.getVotingOverview(activeEvent.id),
    canhoesEventsRepo.getFeedPosts(activeEvent.id),
  ]);

  return {
    status: "ready",
    event: activeEvent,
    overview,
    recentPosts: feedPosts.slice(0, 3),
    secretSanta,
    voting,
  };
}

export function CanhoesEventHomeModule() {
  const [homeState, setHomeState] = useState<HomeState>({ status: "loading" });

  useEffect(() => {
    let isCancelled = false;

    async function hydrateHome() {
      try {
        // The home preloads the lightweight overview endpoints together so the
        // first screen can answer "what should I do now?" without extra hops.
        const nextHomeState = await loadHomeState();
        if (!isCancelled) setHomeState(nextHomeState);
      } catch {
        if (!isCancelled) setHomeState({ status: "error" });
      }
    }

    void hydrateHome();
    return () => {
      isCancelled = true;
    };
  }, []);

  const homeCopy = useMemo(() => {
    if (homeState.status !== "ready") return null;

    const { overview, secretSanta, voting } = homeState;
    const { primaryAction, secondaryAction } = buildHomeActions({
      overview,
      secretSanta,
      voting,
    });

    return {
      alerts: buildHomeAlerts({ overview, secretSanta, voting }),
      primaryAction,
      secondaryAction,
    };
  }, [homeState]);

  if (homeState.status === "loading") {
    return (
      <div className="space-y-4">
        <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
          <CardContent className="flex min-h-[16rem] items-center justify-center">
            <div className="flex items-center gap-3 text-[var(--bark)]/76">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--moss)]" />
              <span className="font-[var(--font-mono)] text-sm uppercase tracking-[0.16em]">
                {productHomeCopy.loading}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (homeState.status === "error" || !homeCopy) {
    return (
      <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
        <CardContent className="space-y-3 py-8 text-center">
          <p className="heading-3 text-[var(--text-ink)]">{productHomeCopy.errorTitle}</p>
          <p className="body-small text-[var(--bark)]/76">{productHomeCopy.errorDescription}</p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Tentar outra vez</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { event, overview, recentPosts, secretSanta, voting } = homeState;
  const phaseLabel = getPhaseLabel(overview.activePhase?.type);
  const phaseSummary = getPhaseSummary(overview.activePhase?.type);
  const phaseDeadline = formatPhaseWindow(overview.activePhase);

  return (
    <div className="space-y-4">
      {/* Hero panel: keeps the dark/neon aesthetic for event branding at the top */}
      <section className="editorial-shell overflow-hidden rounded-[var(--radius-xl-token)] border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_36%),linear-gradient(180deg,rgba(25,33,15,0.98),rgba(12,16,9,0.99))] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <div className="space-y-4 px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--border-neon)]/60 bg-[var(--accent)] text-[var(--neon-green)]">
              {phaseLabel}
            </Badge>
            {overview.nextPhase ? (
              <Badge
                variant="outline"
                className="border-[var(--border-purple)] bg-[rgba(177,140,255,0.12)] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)]"
              >
                Proxima: {getPhaseLabel(overview.nextPhase.type)}
              </Badge>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--beige)]/68">
              {event.name}
            </p>
            <h1 className="heading-1 text-[var(--bg-paper)] [text-shadow:var(--glow-green-sm),var(--glow-purple-sm)]">
              {productHomeCopy.heroTitle}
            </h1>
            <p className="body-base max-w-3xl text-[var(--beige)]/82">{phaseSummary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Votacao"
              value={`${voting.submittedVoteCount}/${voting.categoryCount}`}
              tone="purple"
              hint={
                voting.categoryCount > 0
                  ? `${voting.remainingVoteCount} por fechar`
                  : "Sem categorias abertas nesta fase"
              }
            />
            <MetricCard
              label="Wishlist"
              value={String(secretSanta.myWishlistItemCount)}
              hint={
                secretSanta.hasAssignment
                  ? "Ligada ao teu amigo secreto"
                  : "Prepara antes do sorteio"
              }
            />
            <MetricCard
              label="Feed"
              value={String(overview.counts.feedPostCount)}
              tone="purple"
              hint="Posts ja publicados nesta edicao"
            />
            <MetricCard
              label="Membros"
              value={String(overview.counts.memberCount)}
              hint={`${overview.counts.pendingProposalCount} itens em revisao`}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton action={homeCopy.primaryAction} />
            <ActionButton action={homeCopy.secondaryAction} />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(212,184,150,0.12)] pt-4 text-sm text-[var(--beige)]/76">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--accent-purple-soft)]" />
              {phaseDeadline ? `Fecha a ${phaseDeadline}` : "Sem data de fecho definida"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--neon-green)]" />
              {overview.permissions.canManage
                ? productHomeCopy.manageLabel
                : productHomeCopy.memberLabel}
            </span>
          </div>
        </div>
      </section>

      {homeCopy.alerts.length > 0 ? (
        <Card className="canhoes-paper-panel border-[var(--border-purple)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[var(--text-ink)]">
              <Clock3 className="h-4 w-4 text-[var(--accent-purple-deep)]" />
              {productHomeCopy.alertsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {homeCopy.alerts.map((alert) => (
              <div
                key={alert}
                className="rounded-[var(--radius-md-token)] border border-[var(--border-purple)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.14),transparent_34%),rgba(248,240,226,0.78)] px-3 py-3 text-sm text-[var(--bark)]/82"
              >
                {alert}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* Feed da edicao – paper surface for readable post previews */}
        <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[var(--text-ink)]">
              <MessageSquare className="h-4 w-4 text-[var(--moss)]" />
              Feed da edicao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <div className="rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.14)] bg-[rgba(255,255,255,0.35)] px-3 py-4 text-sm text-[var(--bark)]">
                {productHomeCopy.emptyFeed}
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(255,255,255,0.4)] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--bark)]">
                      {post.userName}
                    </p>
                    <span className="text-xs text-[var(--bark)]/72">
                      {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-[var(--text-ink)]">{post.content}</p>
                  {(post.mediaUrls?.[0] || post.imageUrl) ? (
                    <div className="overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)]">
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
              ))
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={openComposeSheet}>
                Publicar no feed
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Amigo Secreto – paper surface */}
          <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[var(--text-ink)]">
                <Gift className="h-4 w-4 text-[var(--moss)]" />
                {productHomeCopy.secretSantaTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {secretSanta.hasAssignment && secretSanta.assignedUser ? (
                <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(255,255,255,0.4)] px-3 py-3">
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--bark)]">
                    Pessoa atribuida
                  </p>
                  <p className="text-base font-semibold text-[var(--text-ink)]">
                    {secretSanta.assignedUser.name}
                  </p>
                  <p className="text-sm text-[var(--bark)]">
                    {secretSanta.assignedWishlistItemCount} itens na wishlist.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(255,255,255,0.4)] px-3 py-3">
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--bark)]">
                    Estado
                  </p>
                  <p className="text-sm text-[var(--text-ink)]">
                    {secretSanta.hasDraw
                      ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
                      : "O sorteio desta edicao ainda nao foi gerado."}
                  </p>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link href="/canhoes/amigo-secreto">Abrir area do sorteio</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/canhoes/wishlist">Gerir wishlist</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checklist do membro – paper surface */}
          <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[var(--text-ink)]">
                <Vote className="h-4 w-4 text-[var(--moss)]" />
                {productHomeCopy.checklistTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ChecklistItem
                done={secretSanta.myWishlistItemCount > 0}
                label="Tens wishlist preenchida"
              />
              <ChecklistItem
                done={overview.myProposalCount > 0 || !overview.permissions.canSubmitProposal}
                label="Estado das tuas propostas"
                hint={
                  overview.permissions.canSubmitProposal
                    ? `${overview.myProposalCount} propostas feitas`
                    : "Sem propostas abertas nesta fase"
                }
              />
              <ChecklistItem
                done={voting.remainingVoteCount === 0}
                label="Votacao deste ciclo"
                hint={
                  voting.categoryCount > 0
                    ? `${voting.submittedVoteCount} / ${voting.categoryCount} categorias`
                    : "Sem votacoes abertas"
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
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
        "canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3",
        tone === "purple" &&
          "border-[var(--border-purple)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_38%),linear-gradient(180deg,rgba(250,244,233,0.98),rgba(236,228,212,0.98))] shadow-[var(--glow-purple-sm)]"
      )}
    >
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--bark)]/62">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-ink)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--bark)]/72">{hint}</p>
    </div>
  );
}

function ActionButton({ action }: Readonly<{ action: ActionLink }>) {
  const outlineClassName =
    action.tone === "outline"
      ? "border-[var(--border-purple)] bg-[rgba(177,140,255,0.08)] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)] hover:bg-[rgba(177,140,255,0.14)]"
      : undefined;

  if (action.href) {
    return (
      <Button variant={action.tone ?? "default"} className={outlineClassName} asChild>
        <Link href={action.href}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={action.tone ?? "default"}
      className={outlineClassName}
      onClick={action.onClick}
    >
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
    <div className="canhoes-paper-card flex items-start gap-3 rounded-[var(--radius-md-token)] px-3 py-3">
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-[rgba(74,92,47,0.24)] bg-[rgba(74,92,47,0.12)] text-[var(--success)]"
            : "border-[var(--border-purple)] bg-[rgba(177,140,255,0.14)] text-[var(--accent-purple-deep)] shadow-[var(--glow-purple-sm)]"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--text-ink)]">
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-xs text-[var(--bark)]/72">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
