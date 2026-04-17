import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
let searchParams = new URLSearchParams("");

vi.mock("next/navigation", () => ({
  usePathname: () => "/canhoes/admin/conteudo",
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock("../components/modules/canhoes/admin/components/AdminNominationsSection", () => ({
  AdminNominationsSection: () => <div>Nominations section</div>,
}));

vi.mock("../components/modules/canhoes/admin/components/PendingProposals", () => ({
  PendingProposals: () => <div>Pending proposals</div>,
}));

vi.mock("../components/modules/canhoes/admin/components/CategoriesAdmin", () => ({
  CategoriesAdmin: () => <div>Categories section</div>,
}));

vi.mock("../components/modules/canhoes/admin/components/AdminOfficialResultsSection", () => ({
  AdminOfficialResultsSection: () => <div>Results section</div>,
}));

vi.mock("../components/modules/canhoes/admin/components/VotesAudit", () => ({
  VotesAudit: () => <div>Votes audit</div>,
}));

import { AdminContentSection } from "@/components/modules/canhoes/admin/components/AdminContentSection";

describe("AdminContentSection", () => {
  beforeEach(() => {
    replace.mockClear();
    searchParams = new URLSearchParams("");
  });

  it("defaults to the queue view when no sub-section is selected", () => {
    render(
      <AdminContentSection
        adminNominees={[]}
        categories={[]}
        categoryProposals={[]}
        eventId="evt-1"
        loading={false}
        measureProposals={[]}
        onUpdate={vi.fn()}
        votes={[]}
      />
    );

    expect(screen.getByText("Nominations section")).toBeTruthy();
    expect(screen.getByText("Pending proposals")).toBeTruthy();
    expect(screen.queryByText("Categories section")).toBeNull();
    expect(screen.queryByText("Results section")).toBeNull();
  });

  it("updates the query string when selecting another sub-section", () => {
    render(
      <AdminContentSection
        adminNominees={[]}
        categories={[]}
        categoryProposals={[]}
        eventId="evt-1"
        loading={false}
        measureProposals={[]}
        onUpdate={vi.fn()}
        votes={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Categorias/i }));

    expect(replace).toHaveBeenCalledWith("/canhoes/admin/conteudo?view=categorias");
  });
});
