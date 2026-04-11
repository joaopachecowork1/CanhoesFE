import { describe, it, expect } from "vitest";
import {
  CANHOES_MEMBER_MODULES,
  CANHOES_MEMBER_NAV_ORDER,
  CANHOES_MEMBER_MODULE_MAP,
  buildModuleVisibilityState,
  countVisibleModules,
  type CanhoesMemberModuleKey,
} from "@/lib/modules";

describe("module registry", () => {
  it("defines exactly 9 member modules", () => {
    expect(CANHOES_MEMBER_MODULES).toHaveLength(9);
  });

  it("includes all expected module keys", () => {
    const keys = CANHOES_MEMBER_MODULES.map((m) => m.key);
    const expected: CanhoesMemberModuleKey[] = [
      "feed",
      "nominees",
      "categories",
      "secretSanta",
      "wishlist",
      "voting",
      "stickers",
      "measures",
      "gala",
    ];
    expect(keys).toEqual(expected);
  });

  it("each module has all required fields", () => {
    for (const mod of CANHOES_MEMBER_MODULES) {
      expect(mod.key).toBeTruthy();
      expect(mod.label).toBeTruthy();
      expect(mod.href).toMatch(/^\/canhoes\//);
      expect(["core", "community", "finale"]).toContain(mod.group);
      expect(mod.description.length).toBeGreaterThan(0);
    }
  });

  it("nav order contains all 9 modules without duplicates", () => {
    expect(CANHOES_MEMBER_NAV_ORDER).toHaveLength(9);
    const uniqueKeys = new Set(CANHOES_MEMBER_NAV_ORDER);
    expect(uniqueKeys.size).toBe(9);
  });

  it("nav order keys match module definitions", () => {
    const defKeys = CANHOES_MEMBER_MODULES.map((m) => m.key);
    for (const navKey of CANHOES_MEMBER_NAV_ORDER) {
      expect(defKeys).toContain(navKey);
    }
  });

  it("module map has correct structure", () => {
    expect(CANHOES_MEMBER_MODULE_MAP.feed.key).toBe("feed");
    expect(CANHOES_MEMBER_MODULE_MAP.feed.href).toBe("/canhoes/feed");
    expect(CANHOES_MEMBER_MODULE_MAP.voting.key).toBe("voting");
    expect(CANHOES_MEMBER_MODULE_MAP.voting.href).toBe("/canhoes/votacao");
  });
});

describe("buildModuleVisibilityState", () => {
  it("returns all true when enabled", () => {
    const visibility = buildModuleVisibilityState(true);
    for (const mod of CANHOES_MEMBER_MODULES) {
      expect(visibility[mod.key]).toBe(true);
    }
  });

  it("returns all false when disabled", () => {
    const visibility = buildModuleVisibilityState(false);
    for (const mod of CANHOES_MEMBER_MODULES) {
      expect(visibility[mod.key]).toBe(false);
    }
  });

  it("returns exactly 9 keys", () => {
    const visibility = buildModuleVisibilityState(true);
    expect(Object.keys(visibility)).toHaveLength(9);
  });
});

describe("countVisibleModules", () => {
  it("returns 0 for null/undefined", () => {
    expect(countVisibleModules(null)).toBe(0);
    expect(countVisibleModules(undefined)).toBe(0);
  });

  it("counts visible modules correctly", () => {
    const visibility = {
      feed: true,
      secretSanta: true,
      wishlist: false,
      categories: true,
      voting: false,
      stickers: false,
      nominees: false,
      measures: false,
      gala: false,
    };
    expect(countVisibleModules(visibility)).toBe(3);
  });

  it("counts all 9 when all visible", () => {
    const visibility = buildModuleVisibilityState(true);
    expect(countVisibleModules(visibility)).toBe(9);
  });

  it("returns 0 when none visible", () => {
    const visibility = buildModuleVisibilityState(false);
    expect(countVisibleModules(visibility)).toBe(0);
  });
});
