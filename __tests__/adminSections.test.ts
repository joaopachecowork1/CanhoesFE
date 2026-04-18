import { describe, expect, it } from "vitest";

import {
  getAdminSectionItem,
  getAdminSectionMeta,
  getDefaultAdminSection,
  isAdminSectionId,
} from "@/components/modules/canhoes/admin/adminSections";
import {
  buildAdminContentSectionItems,
  getDefaultAdminContentSection,
  isAdminContentSectionId,
} from "@/components/modules/canhoes/admin/adminContentSections";

describe("admin section registries", () => {
  it("exposes the expected top-level admin sections", () => {
    expect(getDefaultAdminSection()).toBe("conteudo");
    expect(isAdminSectionId("dashboard")).toBe(true);
    expect(isAdminSectionId("invalid")).toBe(false);

    expect(getAdminSectionMeta().map((section) => section.id)).toEqual([
      "conteudo",
      "configuracoes",
      "membros",
      "dashboard",
    ]);

    expect(getAdminSectionItem("dashboard")?.label).toBe("Resumo");
  });

  it("exposes the expected content sub-sections", () => {
    expect(getDefaultAdminContentSection()).toBe("queue");
    expect(isAdminContentSectionId("categorias")).toBe(true);
    expect(isAdminContentSectionId("invalid")).toBe(false);

    expect(
      buildAdminContentSectionItems({
        categoriesCount: 4,
        pendingCategoryProposalsCount: 2,
        pendingMeasureProposalsCount: 1,
        pendingNominationsCount: 3,
        resultsCount: 5,
      }).map((section) => ({
        count: section.count,
        id: section.id,
      }))
    ).toEqual([
      { count: 6, id: "queue" },
      { count: 4, id: "categorias" },
      { count: 5, id: "resultados" },
    ]);
  });
});
