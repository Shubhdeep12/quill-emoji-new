import { describe, expect, it } from "vitest";
import { setEmoji as setEmojiV1 } from "../src/v1";
import { setEmoji as setEmojiV2 } from "../src/v2";

function createEditorStub() {
  const embeds: Array<{ index: number; blotName: string; value: unknown }> = [];
  return {
    getSelection() {
      return { index: 3, length: 0 };
    },
    insertEmbed(index: number, blotName: string, value: unknown) {
      embeds.push({ index, blotName, value });
    },
    setSelection() {
      return undefined;
    },
    getEmbeds() {
      return embeds;
    }
  };
}

describe("setEmoji command helper", () => {
  it("inserts shortcode by helper in v2", () => {
    const editor = createEditorStub();
    const ok = setEmojiV2(editor as any, "rocket");
    expect(ok).toBe(true);
    expect(editor.getEmbeds()[0]?.blotName).toBe("emoji");
  });

  it("returns false when shortcode is unknown in v1", () => {
    const editor = createEditorStub();
    const ok = setEmojiV1(editor as any, "does_not_exist");
    expect(ok).toBe(false);
    expect(editor.getEmbeds().length).toBe(0);
  });
});
