"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useEventOverview } from "@/hooks/useEventOverview";
import {
  formatPhaseWindow,
  getPhaseLabel,
  getPhaseSummary,
  openComposeSheet,
} from "@/lib/canhoesEvent";
import { getErrorMessage } from "@/lib/errors";
import { IS_LOCAL_MODE } from "@/lib/mock";
import {
  CANHOES_MEMBER_MODULE_MAP,
  CANHOES_MEMBER_NAV_ORDER,
  type CanhoesMemberModuleKey,
} from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type {
  EventFeedPostDto,
  EventOverviewDto,
  EventSecretSantaOverviewDto,
  EventVotingOverviewDto,
} from "@/lib/api/types";

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

export type CanhoesEventHomeViewModel = {
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
};

type UseCanhoesEventHomeResult = {
  errorMessage: string | null;
  isLoading: boolean;
  viewModel: CanhoesEventHomeViewModel | null;
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
  return overview.modules[moduleKey]
    ? { href: CANHOES_MEMBER_MODULE_MAP[moduleKey].href, label, tone }
    : { ...pickFallbackAction(overview), tone };
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

function buildHomeCopy(
  overview: EventOverviewDto,
  secretSanta: EventSecretSantaOverviewDto,
  voting: EventVotingOverviewDto
): HomeCopyData {
  const phaseType = overview.activePhase?.type;

  const primaryAction = (() => {
    switch (phaseType) {
      case "DRAW":
        if (secretSanta.hasAssignment) {
          return buildModuleAction(overview, "secretSanta", "Ver amigo secreto");
        }

        if (overview.permissions.canManage && !secretSanta.hasDraw) {
          return overview.modules.admin
            ? { href: "/canhoes/admin", label: "Abrir admin operacional" }
            : pickFallbackAction(overview);
        }

        return buildModuleAction(overview, "wishlist", "Abrir wishlists");
      case "PROPOSALS":
        return buildModuleAction(
          overview,
          "categories",
          overview.permissions.canSubmitProposal
            ? "Propor categoria oficial"
            : "Ver categorias oficiais"
        );
      case "VOTING":
        return buildModuleAction(
          overview,
          "voting",
          voting.remainingVoteCount > 0 ? "Votar no boletim" : "Rever boletim oficial"
        );
      case "RESULTS":
        return IS_LOCAL_MODE
          ? buildModuleAction(overview, "categories", "Ver ranking oficial")
          : buildModuleAction(overview, "gala", "Abrir gala");
      default:
        return buildModuleAction(overview, "categories", "Entrar nas categorias oficiais");
    }
  })();

  const secondaryAction =
    phaseType === "DRAW"
      ? buildModuleAction(overview, "wishlist", "Abrir wishlist", "outline")
      : overview.modules.feed
        ? {
            label: "Publicar no mural",
            onClick: openComposeSheet,
            tone: "outline" as const,
          }
        : { ...pickFallbackAction(overview), tone: "outline" as const };

  return {
    alerts: [
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
        ? `Faltam ${voting.remainingVoteCount} categorias por votar no boletim oficial.`
        : null,
      overview.modules.wishlist && secretSanta.myWishlistItemCount === 0
        ? "A tua wishlist ainda esta vazia. Deixa pistas antes de o sorteio fechar."
        : null,
    ].filter(Boolean) as string[],
    primaryAction,
    secondaryAction,
  };
}

export function useCanhoesEventHome(): UseCanhoesEventHomeResult {
  const { event, error: overviewError, isLoading: isOverviewLoading, overview } = useEventOverview();

  const {
    data: homeExtras,
    isLoading: isExtrasLoading,
    error: extrasError,
  } = useQuery({
    queryKey: ["canhoes", "home-extras", event?.id],
    enabled: Boolean(event && overview),
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes to prevent immediate refetches
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!event || !overview) return null;

      const [secretSanta, voting, recentPosts] = await Promise.all([
        overview.modules.secretSanta
          ? canhoesEventsRepo.getSecretSantaOverview(event.id)
          : Promise.resolve(
              buildSecretSantaFallbackState(event.id, overview.myWishlistItemCount)
            ),
        overview.modules.voting
          ? canhoesEventsRepo.getVotingOverview(event.id)
          : Promise.resolve(buildVotingFallbackState(overview)),
        overview.modules.feed
          ? canhoesEventsRepo.getFeedPosts(event.id)
          : Promise.resolve([]),
      ]);

      return {
        recentPosts: recentPosts.slice(0, 3),
        secretSanta,
        voting,
      };
    },
  });

  const viewModel = useMemo<CanhoesEventHomeViewModel | null>(() => {
    if (!event || !overview || !homeExtras) return null;

    return {
      event,
      homeCopy: buildHomeCopy(overview, homeExtras.secretSanta, homeExtras.voting),
      overview,
      phaseDeadline: formatPhaseWindow(overview.activePhase) ?? "S/A definir",
      phaseLabel: getPhaseLabel(overview.activePhase?.type),
      phaseSummary: getPhaseSummary(overview.activePhase?.type),
      recentPosts: homeExtras.recentPosts,
      secretSanta: homeExtras.secretSanta,
      secretSantaAction: buildModuleAction(
        overview,
        "secretSanta",
        "Abrir area do sorteio"
      ),
      voting: homeExtras.voting,
      wishlistAction: buildModuleAction(
        overview,
        "wishlist",
        "Gerir wishlist",
        "secondary"
      ),
    };
  }, [event, homeExtras, overview]);

  return {
    errorMessage: overviewError?.message ?? (extrasError ? getErrorMessage(extrasError, "Nao foi possivel carregar os atalhos e resumos desta edicao.") : null),
    isLoading: isOverviewLoading || isExtrasLoading,
    viewModel,
  };
}
