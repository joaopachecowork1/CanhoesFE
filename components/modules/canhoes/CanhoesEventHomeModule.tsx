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
  EventVotingOverviewDto,
} from "@/lib/api/types";
import {
  formatPhaseWindow,
  getPhaseLabel,
  getPhaseSummary,
  openComposeSheet,
} from "@/lib/canhoesEvent";
import { homeCopy as productHomeCopy } from "@/lib/canhoesCopy";
import { absMediaUrl } from "@/lib/media";
import { IS_LOCAL_MODE } from "@/lib/mock";
import {
  CANHOES_MEMBER_MODULE_MAP,
  CANHOES_MEMBER_NAV_ORDER,
  type CanhoesMemberModuleKey,
} from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { cn } from "@/lib/utils";
import { useEventOverview } from "@/hooks/useEventOverview";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HomeExtrasState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      recentPosts: EventFeedPostDto[];
      secretSanta: EventSecretSantaOverviewDto;
      voting: EventVotingOverviewDto;
    };

type ActionLink = {
  href?: string;
  label: string;
  onClick?: () => void;
  tone?: "default" | "outline" | "secondary";
};

function pickFallbackAction(overview: EventOverviewDto): ActionLink {
  for (const moduleKey of CANHOES_MEMBER_NAV_ORDER) {
    if (!overview.modules[moduleKey]) continue;

    return {
      href: CANHOES_MEMBER_MODULE_MAP[moduleKey].href,
      label: `Abrir ${CANHOES_MEMBER_MODULE_MAP[moduleKey].label}`,
    };
  }

  return { href: "/canhoes", label: "Voltar ao evento" };
}

function buildModuleAction(
  overview: EventOverviewDto,
  moduleKey: CanhoesMemberModuleKey,
  label: string,
  tone?: ActionLink["tone"]
): ActionLink {
  if (overview.modules[moduleKey]) {
    return {
      href: CANHOES_MEMBER_MODULE_MAP[moduleKey].href,
      label,
      tone,
    };
  }

  return {
    ...pickFallbackAction(overview),
    tone,
  };
}

function buildSecretSantaFallbackState(
  eventId: string,
  myWishlistItemCount: number
): EventSecretSantaOverviewDto {
  return {
    eventId,
    hasDraw: false,
    hasAssignment: false,
    assignedUser: null,
    assignedWishlistItemCount: 0,
    drawEventCode: null,
    myWishlistItemCount,
  };
}

function buildVotingFallbackState(overview: EventOverviewDto): EventVotingOverviewDto {
  return {
    eventId: overview.event.id,
    phaseId: overview.activePhase?.id ?? null,
    canVote: false,
    endsAt: overview.activePhase?.endDate ?? null,
    categoryCount: overview.votingCategoryCount,
    submittedVoteCount: overview.myVoteCount,
    remainingVoteCount: 0,
  };
}

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
          return buildModuleAction(overview, "secretSanta", "Ver amigo secreto");
        }
        if (overview.permissions.canManage && !secretSanta.hasDraw) {
          return overview.modules.admin
            ? { href: "/canhoes/admin", label: "Abrir sorteio" }
            : pickFallbackAction(overview);
        }
        return buildModuleAction(overview, "wishlist", "Abrir wishlists");
      case "PROPOSALS":
        return buildModuleAction(
          overview,
          "categories",
          overview.permissions.canSubmitProposal ? "Propor categoria" : "Ver categorias"
        );
      case "VOTING":
        return buildModuleAction(
          overview,
          "voting",
          voting.remainingVoteCount > 0 ? "Votar agora" : "Rever votacao"
        );
      case "RESULTS":
        if (IS_LOCAL_MODE) {
          return buildModuleAction(overview, "categories", "Ver ranking");
        }

        return buildModuleAction(overview, "gala", "Abrir gala");
      default:
        return buildModuleAction(overview, "categories", "Entrar nas categorias");
    }
  })();

  const secondaryAction: ActionLink =
    phaseType === "DRAW"
      ? buildModuleAction(overview, "wishlist", "Abrir wishlist", "outline")
      : overview.modules.feed
        ? { label: "Publicar no feed", onClick: openComposeSheet, tone: "outline" }
        : {
            ...pickFallbackAction(overview),
            tone: "outline",
          };

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
    overview.modules.secretSanta && !secretSanta.hasDraw
      ? "O sorteio desta edicao ainda nao foi gerado."
      : null,
    overview.modules.secretSanta && secretSanta.hasDraw && !secretSanta.hasAssignment
      ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
      : null,
    overview.permissions.canSubmitProposal && overview.myProposalCount === 0
      ? "Ainda nao submeteste nenhuma proposta nesta fase."
      : null,
    overview.modules.voting && voting.remainingVoteCount > 0
      ? `Faltam ${voting.remainingVoteCount} categorias por votar.`
      : null,
    overview.modules.wishlist && secretSanta.myWishlistItemCount === 0
      ? "A tua wishlist ainda esta vazia. Deixa pistas antes de o sorteio fechar."
      : null,
  ].filter(Boolean) as string[];
}

export function CanhoesEventHomeModule() {
  const { event, error, isLoading: isOverviewLoading, overview } = useEventOverview();
  const [homeExtras, setHomeExtras] = useState<HomeExtrasState>({ status: "idle" });

  useEffect(() => {
    if (!event || !overview) {
      if (!isOverviewLoading) {
        setHomeExtras({ status: "idle" });
      }
      return;
    }

    const activeEvent = event;
    const activeOverview = overview;
    let isCancelled = false;

    async function loadHomeExtras() {
      setHomeExtras({ status: "loading" });

      try {
        const [secretSanta, voting, recentPosts] = await Promise.all([
          activeOverview.modules.secretSanta
            ? canhoesEventsRepo.getSecretSantaOverview(activeEvent.id)
            : Promise.resolve(
                buildSecretSantaFallbackState(
                  activeEvent.id,
                  activeOverview.myWishlistItemCount
                )
              ),
          activeOverview.modules.voting
            ? canhoesEventsRepo.getVotingOverview(activeEvent.id)
            : Promise.resolve(buildVotingFallbackState(activeOverview)),
          activeOverview.modules.feed
            ? canhoesEventsRepo.getFeedPosts(activeEvent.id)
            : Promise.resolve([]),
        ]);

        if (!isCancelled) {
          setHomeExtras({
            status: "ready",
            recentPosts: recentPosts.slice(0, 3),
            secretSanta,
            voting,
          });
        }
      } catch {
        if (!isCancelled) {
          setHomeExtras({ status: "error" });
        }
      }
    }

    void loadHomeExtras();
    return () => {
      isCancelled = true;
    };
  }, [event, isOverviewLoading, overview]);

  const homeCopy = useMemo(() => {
    if (!overview || homeExtras.status !== "ready") return null;

    const { primaryAction, secondaryAction } = buildHomeActions({
      overview,
      secretSanta: homeExtras.secretSanta,
      voting: homeExtras.voting,
    });

    return {
      alerts: buildHomeAlerts({
        overview,
        secretSanta: homeExtras.secretSanta,
        voting: homeExtras.voting,
      }),
      primaryAction,
      secondaryAction,
    };
  }, [homeExtras, overview]);

  const isLoading =
    isOverviewLoading || (Boolean(event && overview) && homeExtras.status === "loading");

  if (isLoading) {
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

  if (error || !event || !overview || homeExtras.status !== "ready" || !homeCopy) {
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

  const { recentPosts, secretSanta, voting } = homeExtras;
  const phaseLabel = getPhaseLabel(overview.activePhase?.type);
  const phaseSummary = getPhaseSummary(overview.activePhase?.type);
  const phaseDeadline = formatPhaseWindow(overview.activePhase);
  const secretSantaAction = buildModuleAction(
    overview,
    "secretSanta",
    "Abrir area do sorteio"
  );
  const wishlistAction = buildModuleAction(overview, "wishlist", "Gerir wishlist", "secondary");

  return (
    <div className="space-y-4">
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
        {overview.modules.feed ? (
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
                  <div
                    key={post.id}
                    className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(255,255,255,0.4)] px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--bark)]">
                        {post.userName}
                      </p>
                      <span className="text-xs text-[var(--bark)]/72">
                        {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[var(--text-ink)]">{post.content}</p>
                    {post.mediaUrls?.[0] || post.imageUrl ? (
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
        ) : null}

        <div className="space-y-4">
          {overview.modules.secretSanta ? (
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
                    <Link href={secretSantaAction.href ?? "/canhoes"}>
                      {secretSantaAction.label}
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={wishlistAction.href ?? "/canhoes"}>{wishlistAction.label}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[var(--text-ink)]">
                <Vote className="h-4 w-4 text-[var(--moss)]" />
                {productHomeCopy.checklistTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ChecklistItem
                done={!overview.modules.wishlist || secretSanta.myWishlistItemCount > 0}
                label="Estado da tua wishlist"
                hint={
                  overview.modules.wishlist
                    ? `${secretSanta.myWishlistItemCount} itens visiveis`
                    : "Wishlist indisponivel nesta fase"
                }
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
                done={!overview.modules.voting || voting.remainingVoteCount === 0}
                label="Votacao deste ciclo"
                hint={
                  overview.modules.voting && voting.categoryCount > 0
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
