import { describe, expect, it } from "vitest";
import { EMOJI_DATA, EMOJI_GROUPS } from "../src/data/emoji-data";

describe("emoji data integrity", () => {
  it("contains required fields", () => {
    for (const emoji of EMOJI_DATA) {
      expect(emoji.id.length).toBeGreaterThan(0);
      expect(emoji.emoji.length).toBeGreaterThan(0);
      expect(emoji.label.length).toBeGreaterThan(0);
      expect(emoji.shortcodes.length).toBeGreaterThan(0);
      expect(emoji.unicode.length).toBeGreaterThan(0);
    }
  });

  it("exposes expected emoji groups", () => {
    expect(EMOJI_GROUPS).toContain("Component");
    expect(EMOJI_GROUPS).toContain("Flags");
    expect(EMOJI_GROUPS).toContain("Recently Used");
  });
});
