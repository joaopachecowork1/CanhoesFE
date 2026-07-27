import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type EventModuleKey =
  | "Feed"
  | "SecretSanta"
  | "Wishlist"
  | "Categories"
  | "Voting"
  | "Gala"
  | "Stickers"
  | "Measures"
  | "Nominees"
  | "Admin";

export function withModuleAccess(
  _moduleKey: EventModuleKey,
  handler: (
    req: NextRequest,
    ctx: {
      params: Promise<Record<string, string | string[]>>;
      session?: { userId: string; isAdmin: boolean };
    }
  ) => Promise<NextResponse> | NextResponse
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string | string[]>> }
  ) => {
    return handler(req, ctx as Parameters<typeof handler>[1]);
  };
}

export async function evaluateModuleAccess(
  eventId: string,
  _userId: string,
  isAdmin: boolean
): Promise<{ isEnabled: boolean; modules: Record<string, boolean> }> {
  if (isAdmin) {
    const allEnabled: Record<string, boolean> = {
      feed: true, secretSanta: true, wishlist: true, categories: true,
      voting: true, gala: true, stickers: true, measures: true,
      nominees: true, admin: true,
    };
    return { isEnabled: true, modules: allEnabled };
  }

  const state = await prisma.canhoesEventState.findUnique({
    where: { eventId },
    select: {
      phase: true,
      nominationsVisible: true,
      resultsVisible: true,
      moduleVisibilityJson: true,
      hasSecretSantaDraw: true,
      secretSantaEventCode: true,
    },
  });

  if (!state) return { isEnabled: false, modules: {} };

  const visibility = (state.moduleVisibilityJson ?? {}) as Record<string, boolean>;
  const phase = state.phase?.toLowerCase() ?? "";
  const isProposalPhase = phase === "nominations";
  const isVotingPhase = phase === "voting";
  const isResultsPhase = phase === "gala" || (phase === "locked" && state.resultsVisible);
  const isDrawPhase = phase === "locked" && !state.resultsVisible;

  const modules: Record<string, boolean> = {
    feed: visibility.feed ?? true,
    secretSanta: (visibility.secretSanta ?? true) && (isDrawPhase || state.hasSecretSantaDraw || isVotingPhase || isResultsPhase),
    wishlist: visibility.wishlist ?? true,
    categories: (visibility.categories ?? true) && (isProposalPhase || isVotingPhase || isResultsPhase),
    voting: (visibility.voting ?? true) && isVotingPhase,
    gala: (visibility.gala ?? true) && isResultsPhase,
    stickers: (visibility.stickers ?? true) && (isProposalPhase && state.nominationsVisible),
    measures: (visibility.measures ?? true) && (isProposalPhase && state.nominationsVisible),
    nominees: (visibility.nominees ?? true) && (state.nominationsVisible || isResultsPhase),
    admin: false,
  };

  return { isEnabled: true, modules };
}
