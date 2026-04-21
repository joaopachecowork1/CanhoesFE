import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CanhoesNominationsModule } from "@/components/modules/canhoes/CanhoesNominationsModule";
import { useEventOverview } from "@/hooks/useEventOverview";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

vi.mock("@/hooks/useEventOverview", () => ({
  useEventOverview: vi.fn(),
}));

vi.mock("@/lib/repositories/canhoesEventsRepo", () => ({
  canhoesEventsRepo: {
    getUserCategories: vi.fn(),
    getMyNominationStatus: vi.fn(),
    getApprovedNominees: vi.fn(),
    createNomination: vi.fn(),
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

describe("CanhoesNominationsModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEventOverview.mockReturnValue({
      event: { id: "evt-1" },
      overview: {
        activePhase: { type: "PROPOSALS" },
        permissions: { canSubmitProposal: true },
      },
      isLoading: false,
    } as never);
  });

  it("submete uma nomeacao oficial com sucesso", async () => {
    mockRepo.getUserCategories.mockResolvedValue([
      { id: "cat-1", name: "Categoria A", isActive: true },
    ] as never);
    mockRepo.getMyNominationStatus.mockResolvedValue(null as never);
    mockRepo.getApprovedNominees.mockResolvedValue([] as never);
    mockRepo.createNomination.mockResolvedValue({ id: "nom-1" } as never);

    render(<CanhoesNominationsModule />, { wrapper: createWrapper() });

    const input = await screen.findByPlaceholderText("Ex.: Nome da pessoa ou item");
    fireEvent.change(input, { target: { value: "Joana" } });
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("Joana");
    });

    const submitButton = screen.getByRole("button", { name: "Submeter" });
    await waitFor(() => {
      expect(submitButton.disabled).toBe(false);
    });

    fireEvent.click(submitButton);

    expect(await screen.findByText(/Aguarda aprovacao/i)).toBeTruthy();
  });

  it("mostra erro inline quando a carga inicial falha", async () => {
    mockRepo.getUserCategories.mockRejectedValue(new Error("boom"));
    mockRepo.getMyNominationStatus.mockResolvedValue(null as never);
    mockRepo.getApprovedNominees.mockResolvedValue([] as never);

    render(<CanhoesNominationsModule />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Erro ao carregar nomeacoes oficiais/i)).toBeTruthy();
  });
});
