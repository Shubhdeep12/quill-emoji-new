import { beforeEach, describe, expect, it } from "vitest";
import { EmojiTextarea } from "../src/modules/emoji-textarea";

function createTextareaQuillStub() {
  const wrapper = document.createElement("div");
  const container = document.createElement("div");
  wrapper.append(container);
  const embeds: unknown[] = [];
  let selection = { index: 0, length: 0 };
  return {
    container,
    getSelection() {
      return selection;
    },
    insertEmbed(_index: number, _blot: string, value: unknown) {
      embeds.push(value);
    },
    setSelection(index: number, length = 0) {
      selection = { index, length };
    },
    getEmbeds() {
      return embeds;
    },
    getWrapper() {
      return wrapper;
    }
  };
}

beforeEach(() => {
  document.body.textContent = "";
});

describe("EmojiTextarea", () => {
  it("uses custom button label", () => {
    const quill = createTextareaQuillStub();
    new EmojiTextarea(quill as any, { buttonLabel: "😎" });
    expect(quill.getWrapper().querySelector(".ql-emoji-textarea-button")?.textContent).toBe("😎");
  });

  it("inserts embed payload with fallback metadata", () => {
    const quill = createTextareaQuillStub();
    new EmojiTextarea(quill as any, {
      emojis: [
        {
          id: "cat",
          emoji: "🐱",
          label: "cat",
          shortcodes: ["cat"],
          tags: ["animal"],
          group: "Animals & Nature",
          unicode: "1F431",
          fallbackImage: "https://example.com/cat.png"
        }
      ]
    });
    const button = quill
      .getWrapper()
      .querySelector(".ql-emoji-textarea-button") as HTMLButtonElement;
    button.click();
    const item = document.querySelector(".ql-emoji-inline-item") as HTMLButtonElement;
    item.click();
    expect(quill.getEmbeds()).toHaveLength(1);
    expect((quill.getEmbeds()[0] as any).fallbackImage).toBe("https://example.com/cat.png");
  });

  it("prefers emojis override over customEmojis", () => {
    const quill = createTextareaQuillStub();
    new EmojiTextarea(quill as any, {
      emojis: [
        {
          id: "a",
          emoji: "🧪",
          label: "lab",
          shortcodes: ["lab"],
          tags: ["science"],
          group: "Objects",
          unicode: "1F9EA"
        }
      ],
      customEmojis: [
        {
          id: "b",
          emoji: "🛠️",
          label: "tools",
          shortcodes: ["tools"],
          tags: ["work"],
          group: "Objects",
          unicode: "1F6E0-FE0F"
        }
      ]
    });
    const button = quill
      .getWrapper()
      .querySelector(".ql-emoji-textarea-button") as HTMLButtonElement;
    button.click();
    expect(document.querySelector(".ql-emoji-inline-item")?.textContent).toBe("🧪");
  });
});
