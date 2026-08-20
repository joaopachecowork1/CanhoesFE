import { describe, expect, it } from "vitest";
import { assertAdminRoleChangeAllowed } from "./adminRolePolicy";

const base = {
  actorUserId: "actor",
  targetUserId: "target",
  targetIsAdmin: true,
  nextIsAdmin: false,
  adminCount: 2,
  confirmSelfDemotion: false,
};

describe("admin role policy", () => {
  it("allows promotion", () => {
    expect(() => assertAdminRoleChangeAllowed({
      ...base,
      targetIsAdmin: false,
      nextIsAdmin: true,
    })).not.toThrow();
  });

  it("prevents removing the last admin", () => {
    expect(() => assertAdminRoleChangeAllowed({ ...base, adminCount: 1 }))
      .toThrow("LAST_ADMIN_REQUIRED");
  });

  it("requires explicit confirmation for self-demotion", () => {
    expect(() => assertAdminRoleChangeAllowed({
      ...base,
      actorUserId: "target",
    })).toThrow("SELF_DEMOTION_CONFIRMATION_REQUIRED");
  });

  it("allows a confirmed self-demotion when another admin remains", () => {
    expect(() => assertAdminRoleChangeAllowed({
      ...base,
      actorUserId: "target",
      confirmSelfDemotion: true,
    })).not.toThrow();
  });
});
