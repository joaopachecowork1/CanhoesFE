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
import { ErrorAlert } from "@/components/ui/error-alert";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
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

type HomeCopyData = {
  alerts: string[];
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
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

  let secondaryAction: ActionLink;

  if (phaseType === "DRAW") {
    secondaryAction = buildModuleAction(overview, "wishlist", "Abrir wishlist", "outline");
  } else if (overview.modules.feed) {
    secondaryAction = { label: "Publicar no feed", onClick: openComposeSheet, tone: "outline" };
  } else {
    secondaryAction = {
      ...pickFallbackAction(overview),
      tone: "outline",
    };
  }

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
  const [homeExtrasError, setHomeExtrasError] = useState<string | null>(null);

  useEffect(() => {
    if (!event || !overview) {
      if (!isOverviewLoading) {
        setHomeExtras({ status: "idle" });
        setHomeExtrasError(null);
      }
      return;
    }

    const activeEvent = event;
    const activeOverview = overview;
    let isCancelled = false;

    async function loadHomeExtras() {
      setHomeExtras({ status: "loading" });
      setHomeExtrasError(null);

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
      } catch (nextError) {
        if (!isCancelled) {
          const message = getErrorMessage(
            nextError,
            "Nao foi possivel carregar os atalhos e resumos desta edicao."
          );
          logFrontendError("CanhoesEventHome.loadHomeExtras", nextError, {
            eventId: activeEvent.id,
          });
          setHomeExtras({ status: "error" });
          setHomeExtrasError(message);
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
      <div className="space-y-5">
        <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
          <CardContent className="flex min-h-[16rem] items-center justify-center">
            <div className="flex items-center gap-3 text-[rgba(245,237,224,0.9)]">
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
      <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
        <CardContent className="space-y-3 py-8 text-center">
          <ErrorAlert
            title={productHomeCopy.errorTitle}
            description={
              error?.message ?? homeExtrasError ?? productHomeCopy.errorDescription
            }
            actionLabel="Tentar outra vez"
            onAction={() => globalThis.location.reload()}
          />
        </CardContent>
      </Card>
    );
  }

  const { recentPosts, secretSanta, voting } = homeExtras;
  const phaseLabel = getPhaseLabel(overview.activePhase?.type);
  const phaseSummary = getPhaseSummary(overview.activePhase?.type);
  const phaseDeadline = formatPhaseWindow(overview.activePhase) ?? "S/A definir";
  const secretSantaAction = buildModuleAction(
    overview,
    "secretSanta",
    "Abrir area do sorteio"
  );
  const wishlistAction = buildModuleAction(overview, "wishlist", "Gerir wishlist", "secondary");
  return (
    <CanhoesEventHomeContent
      event={event}
      homeCopy={homeCopy}
      overview={overview}
      phaseDeadline={phaseDeadline}
      phaseLabel={phaseLabel}
      phaseSummary={phaseSummary}
      recentPosts={recentPosts}
      secretSanta={secretSanta}
      secretSantaAction={secretSantaAction}
      voting={voting}
      wishlistAction={wishlistAction}
    />
  );
}

function CanhoesEventHomeContent({
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
}: Readonly<{
  event: EventOverviewDto["event"];
  homeCopy: HomeCopyData;
  overview: EventOverviewDto;
  phaseDeadline: string;
  phaseLabel: string;
  phaseSummary: string;
  recentPosts: EventFeedPostDto[];
  secretSanta: EventSecretSantaOverviewDto;
  secretSantaAction: ActionLink;
  voting: EventVotingOverviewDto;
  wishlistAction: ActionLink;
}>) {
  return (
    <div className="space-y-4">
      <HomeHeroSection
        event={event}
        homeCopy={homeCopy}
        overview={overview}
        phaseDeadline={phaseDeadline}
        phaseLabel={phaseLabel}
        phaseSummary={phaseSummary}
        secretSanta={secretSanta}
        voting={voting}
      />
      <HomeAlertsCard homeCopy={homeCopy} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <HomeFeedCard overview={overview} recentPosts={recentPosts} />
        <div className="space-y-4">
          <HomeSecretSantaCard
            overview={overview}
            secretSanta={secretSanta}
            secretSantaAction={secretSantaAction}
            wishlistAction={wishlistAction}
          />
          <HomeChecklistCard overview={overview} secretSanta={secretSanta} voting={voting} />
        </div>
      </div>
    </div>
  );
}

function HomeHeroSection({
  event,
  homeCopy,
  overview,
  phaseDeadline,
  phaseLabel,
  phaseSummary,
  secretSanta,
  voting,
}: Readonly<{
  event: EventOverviewDto["event"];
  homeCopy: HomeCopyData;
  overview: EventOverviewDto;
  phaseDeadline: string;
  phaseLabel: string;
  phaseSummary: string;
  secretSanta: EventSecretSantaOverviewDto;
  voting: EventVotingOverviewDto;
}>) {
  return (
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
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.88)]">
            {event.name}
          </p>
          <h1 className="heading-1 text-[var(--bg-paper)] [text-shadow:var(--glow-green-sm)]">
            {productHomeCopy.heroTitle}
          </h1>
          <p className="body-base max-w-3xl text-[rgba(245,237,224,0.92)]">{phaseSummary}</p>
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

        <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(212,184,150,0.12)] pt-4 text-sm text-[rgba(245,237,224,0.9)]">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[var(--accent-purple-soft)]" />
            {phaseDeadline ? `Fecha a ${phaseDeadline}` : "Sem data de fecho definida"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--neon-green)]" />
            {overview.permissions.canManage ? productHomeCopy.manageLabel : productHomeCopy.memberLabel}
          </span>
        </div>
      </div>
    </section>
  );
}

function HomeAlertsCard({ homeCopy }: Readonly<{ homeCopy: HomeCopyData }>) {
  if (homeCopy.alerts.length === 0) return null;

  return (
    <Card className="rounded-[var(--radius-lg-token)] border border-[var(--border-purple)] bg-[rgba(93,67,138,0.18)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--bg-paper)]">
          <Clock3 className="h-4 w-4 text-[var(--accent-purple-deep)]" />
          {productHomeCopy.alertsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {homeCopy.alerts.map((alert) => (
          <div
            key={alert}
            className="rounded-[var(--radius-md-token)] border border-[var(--border-purple)] bg-[rgba(93,67,138,0.28)] px-3 py-3 text-sm text-[var(--bg-paper)]"
          >
            {alert}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HomeFeedCard({
  overview,
  recentPosts,
}: Readonly<{
  overview: EventOverviewDto;
  recentPosts: EventFeedPostDto[];
}>) {
  if (!overview.modules.feed) return null;

  return (
    <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--bg-paper)]">
          <MessageSquare className="h-4 w-4 text-[var(--moss)]" />
          Feed da edicao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentPosts.length === 0 ? (
          <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.72)] px-3 py-4 text-sm text-[rgba(245,237,224,0.88)]">
            {productHomeCopy.emptyFeed}
          </div>
        ) : (
          recentPosts.map((post) => (
            <div
              key={post.id}
              className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3"
            >
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
  );
}

function HomeSecretSantaCard({
  overview,
  secretSanta,
  secretSantaAction,
  wishlistAction,
}: Readonly<{
  overview: EventOverviewDto;
  secretSanta: EventSecretSantaOverviewDto;
  secretSantaAction: ActionLink;
  wishlistAction: ActionLink;
}>) {
  if (!overview.modules.secretSanta) return null;

  return (
    <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-[var(--bg-paper)]">
          <Gift className="h-4 w-4 text-[var(--moss)]" />
          {productHomeCopy.secretSantaTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {secretSanta.hasAssignment && secretSanta.assignedUser ? (
          <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3">
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.78)]">
              Pessoa atribuida
            </p>
            <p className="text-base font-semibold text-[var(--bg-paper)]">{secretSanta.assignedUser.name}</p>
            <p className="text-sm text-[rgba(245,237,224,0.84)]">
              {secretSanta.assignedWishlistItemCount} itens na wishlist.
            </p>
          </div>
        ) : (
          <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3">
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.78)]">
              Estado
            </p>
            <p className="text-sm text-[var(--bg-paper)]">
              {secretSanta.hasDraw
                ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
                : "O sorteio desta edicao ainda nao foi gerado."}
            </p>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" asChild>
            <Link href={secretSantaAction.href ?? "/canhoes"}>{secretSantaAction.label}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={wishlistAction.href ?? "/canhoes"}>{wishlistAction.label}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HomeChecklistCard({
  overview,
  secretSanta,
  voting,
}: Readonly<{
  overview: EventOverviewDto;
  secretSanta: EventSecretSantaOverviewDto;
  voting: EventVotingOverviewDto;
}>) {
  return (
    <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--bg-paper)]">
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
        "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3 text-[var(--bg-paper)]",
        tone === "purple" &&
          "border-[var(--border-purple)] bg-[rgba(93,67,138,0.18)] shadow-[var(--glow-purple-sm)]"
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
    <div className="flex items-start gap-3 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3 text-[var(--bg-paper)]">
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
        <span className="block text-sm font-semibold text-[var(--bg-paper)]">
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-xs text-[rgba(245,237,224,0.8)]">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
