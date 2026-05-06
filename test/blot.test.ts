import { describe, expect, it } from "vitest";
import { createEmojiBlotV1 } from "../src/blots/emoji-blot-v1";
import { createEmojiBlotV2 } from "../src/blots/emoji-blot-v2";

function makeQuillStub() {
  class BaseEmbed {
    static create() {
      return document.createElement("span");
    }
  }

  return {
    import(path: string) {
      if (path !== "parchment") {
        throw new Error("unsupported import");
      }
      return {
        Embed: BaseEmbed,
        EmbedBlot: BaseEmbed
      };
    }
  };
}

describe("emoji blots", () => {
  it("creates and extracts value in v1 blot", () => {
    const EmojiBlot = createEmojiBlotV1(makeQuillStub());
    const node = EmojiBlot.create({
      emoji: "😀",
      shortcode: "grinning",
      unicode: "1F600"
    });
    expect(node.getAttribute("data-name")).toBe("grinning");
    expect(EmojiBlot.value(node).emoji).toBe("😀");
  });

  it("creates and extracts value in v2 blot", () => {
    const EmojiBlot = createEmojiBlotV2(makeQuillStub());
    const node = EmojiBlot.create({
      emoji: "🚀",
      shortcode: "rocket",
      unicode: "1F680"
    });
    expect(node.getAttribute("data-unicode")).toBe("1F680");
    expect(EmojiBlot.formats(undefined, node).shortcode).toBe("rocket");
  });

  it("supports legacy string payload from original quill-emoji", () => {
    const EmojiBlotV1 = createEmojiBlotV1(makeQuillStub());
    const EmojiBlotV2 = createEmojiBlotV2(makeQuillStub());
    const nodeV1 = EmojiBlotV1.create("rocket");
    const nodeV2 = EmojiBlotV2.create("rocket");
    expect(nodeV1.getAttribute("data-name")).toBe("rocket");
    expect(nodeV2.getAttribute("data-unicode")).toBe("1F680");
    expect(nodeV2.textContent).toContain("🚀");
  });

  it("parses legacy sprite class markup when data-name is missing", () => {
    const EmojiBlot = createEmojiBlotV2(makeQuillStub());
    const node = document.createElement("span");
    const legacySpan = document.createElement("span");
    legacySpan.className = "ap ap-rocket";
    legacySpan.innerText = "🚀";
    node.appendChild(legacySpan);
    const value = EmojiBlot.value(node);
    expect(value.shortcode).toBe("rocket");
    expect(value.unicode).toBe("1F680");
  });

  it("renders fallback image when forced", () => {
    const EmojiBlot = createEmojiBlotV2(makeQuillStub(), { forceFallbackImages: true });
    const node = EmojiBlot.create({
      emoji: "👍",
      shortcode: "thumbs_up",
      unicode: "1F44D",
      fallbackImage: "https://example.com/thumb.png"
    });
    expect(node.querySelector("img")?.getAttribute("src")).toBe("https://example.com/thumb.png");
  });
});
