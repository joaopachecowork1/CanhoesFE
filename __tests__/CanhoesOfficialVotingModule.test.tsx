import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CanhoesOfficialVotingModule } from "@/components/modules/canhoes/CanhoesOfficialVotingModule";
import { useEventOverview } from "@/hooks/useEventOverview";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

vi.mock("@/hooks/useEventOverview", () => ({
  useEventOverview: vi.fn(),
}));

vi.mock("@/lib/repositories/canhoesEventsRepo", () => ({
  canhoesEventsRepo: {
    getOfficialVotingBoard: vi.fn(),
    castOfficialVote: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/components/ui/virtualized-list", () => ({
  VirtualizedList: ({
    items,
    renderItem,
  }: {
    items: readonly unknown[];
    renderItem: (item: unknown, index: number) => React.ReactNode;
  }) => <div>{items.map((item, index) => <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>)}</div>,
}));

const mockUseEventOverview = vi.mocked(useEventOverview);
const mockRepo = vi.mocked(canhoesEventsRepo);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("CanhoesOfficialVotingModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEventOverview.mockReturnValue({
      event: { id: "evt-1" },
      overview: null,
      isLoading: false,
    } as never);
  });

  it("regista o voto oficial com sucesso", async () => {
    mockRepo.getOfficialVotingBoard.mockResolvedValue({
      canVote: true,
      categories: [
        {
          id: "cat-1",
          title: "Categoria A",
          description: "Descricao",
          myNomineeId: null,
          totalVotes: 4,
          nominees: [
            { id: "nom-1", label: "Opcao 1", voteCount: 2 },
            { id: "nom-2", label: "Opcao 2", voteCount: 2 },
          ],
        },
      ],
    } as never);
    mockRepo.castOfficialVote.mockResolvedValue(undefined as never);

    render(<CanhoesOfficialVotingModule />, { wrapper: createWrapper() });

    fireEvent.click(await screen.findByText("Opcao 1"));

    await waitFor(() => {
      expect(mockRepo.castOfficialVote).toHaveBeenCalledWith("evt-1", {
        categoryId: "cat-1",
        nomineeId: "nom-1",
      });
    });
  });

  it("mostra erro inline quando o boletim falha", async () => {
    mockRepo.getOfficialVotingBoard.mockRejectedValue(new Error("boom"));

    render(<CanhoesOfficialVotingModule />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Erro ao carregar boletim oficial/i)).toBeTruthy();
  });
});
