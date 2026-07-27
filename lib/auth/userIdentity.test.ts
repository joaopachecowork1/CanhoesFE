import { describe, expect, it } from "vitest";
import { isDatabaseUserId } from "./userIdentity";

describe("database user identity", () => {
  it("accepts UUID database identifiers", () => {
    expect(isDatabaseUserId("c269f265-9b4f-4f1c-9e75-802b5dd166b0")).toBe(true);
  });

  it("rejects Google subject identifiers", () => {
    expect(isDatabaseUserId("109876543210987654321")).toBe(false);
  });

  it("rejects empty and missing identifiers", () => {
    expect(isDatabaseUserId("")).toBe(false);
    expect(isDatabaseUserId(undefined)).toBe(false);
  });
});
