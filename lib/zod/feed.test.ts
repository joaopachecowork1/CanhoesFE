import { describe, expect, it } from "vitest";

import { CreateFeedPostSchema } from "./feed";

describe("CreateFeedPostSchema", () => {
  it("accepts a text post with images and a complete poll", () => {
    const result = CreateFeedPostSchema.safeParse({
      text: "  Jantar de Natal  ",
      mediaUrls: ["/api/uploads/feed/event/photo.webp"],
      pollQuestion: "Onde vamos jantar?",
      pollOptions: ["Porto", "Braga"],
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.text).toBe("Jantar de Natal");
  });

  it("rejects an incomplete poll", () => {
    const result = CreateFeedPostSchema.safeParse({
      text: "Escolham",
      pollQuestion: "Onde?",
      pollOptions: ["Porto"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicate poll options", () => {
    const result = CreateFeedPostSchema.safeParse({
      text: "Escolham",
      pollQuestion: "Onde?",
      pollOptions: ["Porto", "porto"],
    });

    expect(result.success).toBe(false);
  });
});
