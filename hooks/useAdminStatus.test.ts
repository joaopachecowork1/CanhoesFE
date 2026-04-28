import { describe, expect, it } from "vitest";

import { resolveAdminStatus } from "@/lib/auth/adminStatus";

describe("resolveAdminStatus", () => {
  it("prefers backend profile admin without waiting for event overview", () => {
    const result = resolveAdminStatus({
      authLoading: false,
      eventOverviewError: null,
      eventOverviewLoading: true,
      isLogged: true,
      overviewIsAdmin: false,
      profileError: null,
      profileLoading: false,
      userIsAdmin: true,
    });

    expect(result.isAdmin).toBe(true);
    expect(result.isLoading).toBe(false);
    expect(result.source).toBe("profile");
  });

  it("keeps loading while admin confirmation is still unresolved", () => {
    const result = resolveAdminStatus({
      authLoading: false,
      eventOverviewError: null,
      eventOverviewLoading: true,
      isLogged: true,
      overviewIsAdmin: false,
      profileError: null,
      profileLoading: true,
      userIsAdmin: false,
    });

    expect(result.isAdmin).toBe(false);
    expect(result.isLoading).toBe(true);
  });

  it("stops loading and exposes error when confirmation fails", () => {
    const error = new Error("backend down");
    const result = resolveAdminStatus({
      authLoading: false,
      eventOverviewError: null,
      eventOverviewLoading: false,
      isLogged: true,
      overviewIsAdmin: false,
      profileError: error,
      profileLoading: false,
      userIsAdmin: false,
    });

    expect(result.isAdmin).toBe(false);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(error);
  });
});
