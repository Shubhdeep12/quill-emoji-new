import { describe, expect, it } from "vitest";
import { createEmojiBlotV1 } from "../src/blots/emoji-blot-v1";
import { createEmojiBlotV2 } from "../src/blots/emoji-blot-v2";
import { registerQuillEmojiV1 } from "../src/v1";
import { registerQuillEmojiV2 } from "../src/v2";

function makeQuillClassStub() {
  class BaseEmbed {
    static create() {
      return document.createElement("span");
    }
  }
  const calls: Array<{ defs: unknown; overwrite?: boolean }> = [];
  return {
    import(path: string) {
      if (path !== "parchment") {
        throw new Error("unsupported import");
      }
      return { Embed: BaseEmbed, EmbedBlot: BaseEmbed };
    },
    register(defs: unknown, overwrite?: boolean) {
      calls.push({ defs, overwrite });
    },
    getCalls() {
      return calls;
    }
  };
}

describe("registering modules and blots", () => {
  it("registers blot and modules for v2", () => {
    const Quill = makeQuillClassStub();
    registerQuillEmojiV2(Quill as any);
    expect(Quill.getCalls().length).toBe(2);
  });

  it("registers blot and modules for v1", () => {
    const Quill = makeQuillClassStub();
    registerQuillEmojiV1(Quill as any);
    expect(Quill.getCalls().length).toBe(2);
  });

  it("wires forceFallbackImages for v1 blots", () => {
    const Quill = makeQuillClassStub();
    const EmojiBlot = createEmojiBlotV1(Quill as any, { forceFallbackImages: true });
    const node = EmojiBlot.create({
      emoji: "🚀",
      shortcode: "rocket",
      unicode: "1F680",
      fallbackImage: "https://example.com/rocket.png"
    });
    expect(node.querySelector("img")?.getAttribute("src")).toBe("https://example.com/rocket.png");
  });

  it("keeps unicode rendering when fallback mode disabled", () => {
    const Quill = makeQuillClassStub();
    const EmojiBlot = createEmojiBlotV2(Quill as any, { forceFallbackImages: false });
    const node = EmojiBlot.create({
      emoji: "🚀",
      shortcode: "rocket",
      unicode: "1F680",
      fallbackImage: "https://example.com/rocket.png"
    });
    expect(node.textContent).toBe("🚀");
    expect(node.querySelector("img")).toBeNull();
  });
});
