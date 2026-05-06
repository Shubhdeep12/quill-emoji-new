import { describe, expect, it } from "vitest";
import { EMOJI_DATA } from "../src/data/emoji-data";
import { EmojiSearch } from "../src/utils/search";

describe("EmojiSearch", () => {
  it("matches by shortcode", () => {
    const search = new EmojiSearch(EMOJI_DATA, { maxResults: 5 });
    const result = search.search("grinning");
    expect(result[0]?.shortcodes.some((entry) => entry.includes("grinning"))).toBe(true);
  });

  it("matches by tags", () => {
    const search = new EmojiSearch(EMOJI_DATA);
    const result = search.search("launch");
    expect(result.some((entry) => entry.shortcodes.includes("rocket"))).toBe(true);
  });

  it("returns empty for blank queries", () => {
    const search = new EmojiSearch(EMOJI_DATA);
    expect(search.search("   ")).toEqual([]);
  });

  it("respects maxResults", () => {
    const search = new EmojiSearch(EMOJI_DATA, { maxResults: 1 });
    const result = search.search("face");
    expect(result.length).toBe(1);
  });
});
