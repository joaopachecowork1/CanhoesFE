/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from "vitest";

describe("smoke test", () => {
  it("runs basic assertions", () => {
    expect(1 + 1).toBe(2);
  });

  it("handles arrays", () => {
    const items = ["a", "b", "c"];
    expect(items.length).toBe(3);
    expect(items.filter((x) => x !== "b")).toEqual(["a", "c"]);
  });

  it("handles objects", () => {
    const obj = { foo: "bar", baz: 42 };
    expect(obj.foo).toBe("bar");
    expect(obj.baz).toBe(42);
  });
});

describe("composer logic", () => {
  const MAX_POLL_OPTIONS = 6;

  function addPollOption(options: string[]): string[] {
    return options.length < MAX_POLL_OPTIONS ? [...options, ""] : options;
  }

  function removePollOption(options: string[], index: number): string[] {
    return options.length > 2
      ? options.filter((_, i) => i !== index)
      : options;
  }

  it("adds options up to max", () => {
    let opts = ["", ""];
    opts = addPollOption(opts);
    expect(opts).toHaveLength(3);

    while (opts.length < MAX_POLL_OPTIONS) opts = addPollOption(opts);
    expect(opts).toHaveLength(MAX_POLL_OPTIONS);

    opts = addPollOption(opts);
    expect(opts).toHaveLength(MAX_POLL_OPTIONS);
  });

  it("does not remove below 2 options", () => {
    expect(removePollOption(["a", "b"], 0)).toEqual(["a", "b"]);
  });
});

describe("category selection logic", () => {
  type Item = { id: string; name: string };

  function computeSelectedId<T>(
    items: T[],
    getId: (item: T) => string,
    current: string | null
  ): string | null {
    if (items.length === 0) return null;
    if (current && items.some((item) => getId(item) === current)) return current;
    return getId(items[0]);
  }

  it("selects first item by default", () => {
    const items: Item[] = [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }];
    expect(computeSelectedId(items, (i) => i.id, null)).toBe("a");
  });

  it("returns null for empty list", () => {
    expect(computeSelectedId([], (i: Item) => i.id, "a")).toBeNull();
  });

  it("preserves valid selection", () => {
    const items: Item[] = [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }];
    expect(computeSelectedId(items, (i) => i.id, "b")).toBe("b");
  });
});
