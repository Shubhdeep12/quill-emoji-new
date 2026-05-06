import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmojiShortname } from "../src/modules/emoji-shortname";

type TextChangeHandler = () => void;

function createQuillStub(initialText = "") {
  let text = initialText;
  let selection = { index: initialText.length, length: 0 };
  let textChangeHandler: TextChangeHandler | null = null;
  const insertedEmbeds: Array<{ index: number; blotName: string; value: unknown }> = [];
  const deletedRanges: Array<{ index: number; length: number }> = [];

  return {
    root: document.createElement("div"),
    on(eventName: "text-change", handler: TextChangeHandler) {
      if (eventName === "text-change") {
        textChangeHandler = handler;
      }
    },
    off() {
      textChangeHandler = null;
    },
    getSelection() {
      return selection;
    },
    getText(index: number, length: number) {
      return text.slice(index, index + length);
    },
    deleteText(index: number, length: number) {
      deletedRanges.push({ index, length });
      text = `${text.slice(0, index)}${text.slice(index + length)}`;
      selection = { index, length: 0 };
    },
    insertEmbed(index: number, blotName: string, value: unknown) {
      insertedEmbeds.push({ index, blotName, value });
      text = `${text.slice(0, index)}*${text.slice(index)}`;
      selection = { index: index + 1, length: 0 };
    },
    setSelection(index: number, length = 0) {
      selection = { index, length };
    },
    getBounds() {
      return { left: 0, top: 0, height: 16 };
    },
    emitTextChange() {
      textChangeHandler?.();
    },
    setEditorText(next: string) {
      text = next;
      selection = { index: next.length, length: 0 };
    },
    getInsertedEmbeds() {
      return insertedEmbeds;
    },
    getDeletedRanges() {
      return deletedRanges;
    }
  };
}

beforeEach(() => {
  document.body.textContent = "";
});

describe("EmojiShortname advanced behavior", () => {
  it("opens suggestions when user types only colon", () => {
    const quill = createQuillStub("hello :");
    new EmojiShortname(quill as any, { minChars: 1, showSuggestionsOnColon: true });
    quill.emitTextChange();
    expect(document.querySelector(".ql-emoji-shortname-menu")).toBeTruthy();
  });

  it("converts emoticons into emoji embeds when enabled", () => {
    const quill = createQuillStub("hello :)");
    new EmojiShortname(quill as any, { enableEmoticons: true });
    quill.emitTextChange();

    expect(quill.getDeletedRanges().length).toBe(1);
    expect(quill.getInsertedEmbeds().length).toBe(1);
    expect(quill.getInsertedEmbeds()[0]?.blotName).toBe("emoji");
  });

  it("does not open on bare colon when disabled", () => {
    const quill = createQuillStub("hello :");
    new EmojiShortname(quill as any, { showSuggestionsOnColon: false });
    quill.emitTextChange();
    expect(document.querySelector(".ql-emoji-shortname-menu")).toBeFalsy();
  });

  it("respects minChars setting for shortcode suggestions", () => {
    const quill = createQuillStub("hello :ro");
    new EmojiShortname(quill as any, { minChars: 3 });
    quill.emitTextChange();
    expect(document.querySelector(".ql-emoji-shortname-menu")).toBeFalsy();
  });

  it("fires lifecycle callbacks and selection callback", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const quill = createQuillStub("hello :roc");
    new EmojiShortname(quill as any, {
      minChars: 1,
      onOpen,
      onClose,
      onSelect
    });

    quill.emitTextChange();
    expect(onOpen).toHaveBeenCalledTimes(1);
    const firstItem = document.querySelector(".ql-emoji-shortname-item") as HTMLButtonElement;
    firstItem.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports custom emoticonMap mappings", () => {
    const quill = createQuillStub("ok ^_^");
    new EmojiShortname(quill as any, {
      enableEmoticons: true,
      emoticonMap: { "^_^": "rocket" }
    });
    quill.emitTextChange();
    expect(quill.getInsertedEmbeds().length).toBe(1);
    expect((quill.getInsertedEmbeds()[0]?.value as any).shortcode).toBe("rocket");
  });
});
