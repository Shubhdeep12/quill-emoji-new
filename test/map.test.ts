import { describe, expect, it } from "vitest";
import { emojiById, emojiByShortcode, getEmojiByShortcode } from "../src/data/emoji-map";

describe("emoji map lookups", () => {
  it("resolves shortcodes in a case-insensitive way", () => {
    const lower = getEmojiByShortcode("rocket");
    const upper = getEmojiByShortcode("ROCKET");
    expect(lower?.id).toBe(upper?.id);
  });

  it("has consistent map entries for id and shortcode maps", () => {
    const rocket = getEmojiByShortcode("rocket");
    expect(rocket).toBeTruthy();
    if (!rocket) {
      throw new Error("expected rocket shortcode to exist");
    }
    expect(emojiByShortcode.get("rocket")?.id).toBe(rocket?.id);
    expect(emojiById.get(rocket.id)?.unicode).toBe(rocket.unicode);
  });
});
