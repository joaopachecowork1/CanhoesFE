import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the overview hook before importing the target
vi.mock("@/hooks/useEventOverview", () => ({
  useEventOverview: vi.fn(),
}));

import { useEventModuleAccess } from "@/hooks/useEventModuleAccess";
import { useEventOverview } from "@/hooks/useEventOverview";

const mockUseEventOverview = vi.mocked(useEventOverview);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function makeOverview(overrides: Partial<{
  modules: Record<string, boolean>;
  isAdmin: boolean;
  activePhase: { id: string; type: "PROPOSALS" | "VOTING" | "RESULTS" | "DRAW"; startDate: string; endDate: string; isActive: boolean } | null;
}> = {}) {
  return {
    event: { id: "evt-1", name: "Test Event", isActive: true },
    overview: {
      event: {
        id: "evt-1",
        name: "Test Event",
        isActive: true,
      },
      modules: {
        feed: true,
        secretSanta: false,
        wishlist: false,
        categories: true,
        voting: false,
        stickers: false,
        nominees: false,
        measures: false,
        gala: false,
        admin: false,
        results: false,
        ...overrides.modules,
      },
      permissions: {
        isAdmin: overrides.isAdmin ?? false,
        isMember: true,
        canPost: true,
        canSubmitProposal: false,
        canVote: false,
        canManage: false,
      },
      counts: {
        memberCount: 0,
        feedPostCount: 0,
        categoryCount: 0,
        wishlistItemCount: 0,
        pendingProposalCount: 0,
        pendingNominationCount: 0,
        pendingCategoryProposalCount: 0,
        pendingMeasureProposalCount: 0,
        visibleModuleCount: 0,
      },
      myWishlistItemCount: 0,
      myProposalCount: 0,
      myVoteCount: 0,
      votingCategoryCount: 0,
      hasSecretSantaDraw: false,
      hasSecretSantaAssignment: false,
      hasResults: false,
      hasNominees: false,
      activePhase: overrides.activePhase ?? null,
    },
    isLoading: false,
    isFetching: false,
    error: null,
    refresh: vi.fn(),
  };
}

describe("useEventModuleAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("grants access to admin for any module", () => {
    mockUseEventOverview.mockReturnValue(makeOverview({ isAdmin: true }));
    const { result } = renderHook(() => useEventModuleAccess("voting"), {
      wrapper: createWrapper(),
    });
    expect(result.current.isAllowed).toBe(true);
  });

  it("grants access to visible module for non-admin", () => {
    mockUseEventOverview.mockReturnValue(makeOverview({ isAdmin: false }));
    const { result } = renderHook(() => useEventModuleAccess("feed"), {
      wrapper: createWrapper(),
    });
    expect(result.current.isAllowed).toBe(true);
  });

  it("denies access to hidden module for non-admin", () => {
    mockUseEventOverview.mockReturnValue(makeOverview({ isAdmin: false }));
    const { result } = renderHook(() => useEventModuleAccess("voting"), {
      wrapper: createWrapper(),
    });
    expect(result.current.isAllowed).toBe(false);
  });

  it("provides fallback to first available module when denied", () => {
    mockUseEventOverview.mockReturnValue(makeOverview({ isAdmin: false }));
    const { result } = renderHook(() => useEventModuleAccess("voting"), {
      wrapper: createWrapper(),
    });
    // feed is first visible module
    expect(result.current.fallbackHref).toBe("/canhoes/feed");
  });

  it("provides fallback to /canhoes when no modules visible", () => {
    mockUseEventOverview.mockReturnValue(makeOverview({
      isAdmin: false,
      modules: {
        feed: false,
        secretSanta: false,
        wishlist: false,
        categories: false,
        voting: false,
        stickers: false,
        nominees: false,
        measures: false,
        gala: false,
      },
    }));
    const { result } = renderHook(() => useEventModuleAccess("feed"), {
      wrapper: createWrapper(),
    });
    expect(result.current.fallbackHref).toBe("/canhoes");
  });

  it("returns module definition with correct metadata", () => {
    mockUseEventOverview.mockReturnValue(makeOverview());
    const { result } = renderHook(() => useEventModuleAccess("voting"), {
      wrapper: createWrapper(),
    });
    expect(result.current.module.key).toBe("voting");
    expect(result.current.module.label).toBe("Votacao");
    expect(result.current.module.href).toBe("/canhoes/votacao");
  });

  it("admin module access requires isAdmin permission", () => {
    // Non-admin trying to access admin module
    mockUseEventOverview.mockReturnValue(makeOverview({ isAdmin: false }));
    const { result } = renderHook(() => useEventModuleAccess("admin"), {
      wrapper: createWrapper(),
    });
    expect(result.current.isAllowed).toBe(false);

    // Admin accessing admin module
    mockUseEventOverview.mockReturnValue(makeOverview({ isAdmin: true }));
    const { result: adminResult } = renderHook(() => useEventModuleAccess("admin"), {
      wrapper: createWrapper(),
    });
    expect(adminResult.current.isAllowed).toBe(true);
  });

  it("exposes refresh from overview", () => {
    mockUseEventOverview.mockReturnValue(makeOverview());
    const { result } = renderHook(() => useEventModuleAccess("feed"), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.refresh).toBe("function");
  });
});
