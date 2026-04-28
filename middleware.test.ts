import { describe, expect, it } from "vitest";

import { shouldRedirectUnauthenticated } from "./middleware";

describe("shouldRedirectUnauthenticated", () => {
  it("requires a token for protected routes", () => {
    expect(shouldRedirectUnauthenticated(null)).toBe(true);
    expect(shouldRedirectUnauthenticated(undefined)).toBe(true);
  });

  it("allows any authenticated token without forcing admin from middleware", () => {
    expect(shouldRedirectUnauthenticated({ sub: "user-1" })).toBe(false);
    expect(shouldRedirectUnauthenticated({ sub: "user-2", isAdmin: false })).toBe(false);
  });
});
