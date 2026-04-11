import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the hook
vi.mock("@/hooks/useEventModuleAccess", () => ({
  useEventModuleAccess: vi.fn(),
}));

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { useEventModuleAccess } from "@/hooks/useEventModuleAccess";

const mockUseEventModuleAccess = vi.mocked(useEventModuleAccess);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function makeAccess(overrides: Partial<{
  isLoading: boolean;
  error: Error | null;
  event: { id: string; name: string } | null;
  overview: { modules: Record<string, boolean>; permissions: { isAdmin: boolean } } | null;
  isAllowed: boolean;
  module: { key: string; label: string; href: string };
  fallbackHref: string;
  fallbackLabel: string;
  refresh: () => Promise<void>;
}> = {}) {
  return {
    isLoading: false,
    isFetching: false,
    error: null,
    event: { id: "evt-1", name: "Test" },
    overview: { modules: { voting: true }, permissions: { isAdmin: false } },
    isAllowed: true,
    module: { key: "voting", label: "Votacao", href: "/canhoes/votacao" },
    fallbackHref: "/canhoes",
    fallbackLabel: "Evento",
    refresh: vi.fn(),
    ...overrides,
  };
}

describe("EventModuleGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when isLoading is true", () => {
    mockUseEventModuleAccess.mockReturnValue(makeAccess({ isLoading: true }));
    render(
      <EventModuleGate moduleKey="voting">
        <div data-testid="child">Content</div>
      </EventModuleGate>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByText(/A validar acesso/i)).toBeTruthy();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("shows error state when error is present", () => {
    mockUseEventModuleAccess.mockReturnValue(makeAccess({
      error: new Error("Network error"),
      event: null,
      overview: null,
    }));
    render(
      <EventModuleGate moduleKey="voting">
        <div data-testid="child">Content</div>
      </EventModuleGate>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByText(/Erro ao abrir/i)).toBeTruthy();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("shows unavailable state when access is denied", () => {
    mockUseEventModuleAccess.mockReturnValue(makeAccess({
      isAllowed: false,
      fallbackHref: "/canhoes/feed",
      fallbackLabel: "Mural",
    }));
    render(
      <EventModuleGate moduleKey="voting">
        <div data-testid="child">Content</div>
      </EventModuleGate>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByText(/indisponivel/i)).toBeTruthy();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("renders children when access is allowed", () => {
    mockUseEventModuleAccess.mockReturnValue(makeAccess({ isAllowed: true }));
    render(
      <EventModuleGate moduleKey="voting">
        <div data-testid="child">Voting Content</div>
      </EventModuleGate>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByTestId("child")).toBeTruthy();
    expect(screen.getByText("Voting Content")).toBeTruthy();
  });

  it("wraps allowed children with SectionBoundary (renders children)", () => {
    mockUseEventModuleAccess.mockReturnValue(makeAccess({ isAllowed: true }));
    render(
      <EventModuleGate moduleKey="feed">
        <span>Feed stuff</span>
      </EventModuleGate>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByText("Feed stuff")).toBeTruthy();
  });
});
