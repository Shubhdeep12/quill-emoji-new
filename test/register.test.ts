import { afterEach, describe, expect, it } from "vitest";
import { createEmojiBlotV1 } from "../src/blots/emoji-blot-v1";
import { createEmojiBlotV2 } from "../src/blots/emoji-blot-v2";
import { emojiByShortcode, getEmojiByShortcode, registerAliases } from "../src/data/emoji-map";
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
  const testAliases = ["__alias_test_grinning", "__legacy_alias_test_smile"] as const;

  afterEach(() => {
    for (const alias of testAliases) {
      emojiByShortcode.delete(alias);
    }
  });

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

  it("registers aliases for existing emoji ids without overriding existing shortcodes", () => {
    const alias = "__alias_test_grinning";
    const existingEntry = Array.from(emojiByShortcode.entries()).find(
      ([, emoji]) => emoji.id !== "grinning_face"
    );
    if (!existingEntry) {
      throw new Error("expected an existing shortcode that does not map to grinning_face");
    }
    const [existingShortcode, existingEmoji] = existingEntry;
    registerAliases({ [alias]: "grinning_face", [existingShortcode]: "grinning_face" });

    expect(getEmojiByShortcode(alias)?.id).toBe("grinning_face");
    expect(getEmojiByShortcode(existingShortcode)?.id).toBe(existingEmoji.id);
  });

  it("applies legacy aliases passed to registerQuillEmojiV2 options", () => {
    const alias = "__legacy_alias_test_smile";
    const Quill = makeQuillClassStub();

    registerQuillEmojiV2(Quill as any, {
      legacyAliases: { [alias]: "grinning_face_with_smiling_eyes" }
    });

    expect(getEmojiByShortcode(alias)?.id).toBe("grinning_face_with_smiling_eyes");
  });

  it("normalizes mixed-case aliases for case-insensitive lookup", () => {
    registerAliases({ __ALIAS_TEST_MIXED: "grinning_face" });

    expect(getEmojiByShortcode("__alias_test_mixed")?.id).toBe("grinning_face");
    expect(getEmojiByShortcode("__ALIAS_TEST_MIXED")?.id).toBe("grinning_face");
  });
});
