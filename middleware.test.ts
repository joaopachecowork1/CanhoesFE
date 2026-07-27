import { describe, expect, it } from "vitest";

import { shouldRedirectUnauthenticated } from "./middleware";

describe("shouldRedirectUnauthenticated", () => {
  it("requires a token for protected routes", () => {
    expect(shouldRedirectUnauthenticated(null, false)).toBe(true);
    expect(shouldRedirectUnauthenticated(undefined, false)).toBe(true);
  });

  it("allows any authenticated token without forcing admin from middleware", () => {
    expect(shouldRedirectUnauthenticated({ sub: "user-1" }, false)).toBe(false);
    expect(shouldRedirectUnauthenticated({ sub: "user-2", isAdmin: false }, false)).toBe(false);
  });

  it("allows the app shell to create the local session in development", () => {
    expect(shouldRedirectUnauthenticated(null, true)).toBe(false);
  });
});
