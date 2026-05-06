import { beforeEach, describe, expect, it } from "vitest";
import { EmojiToolbar } from "../src/modules/emoji-toolbar";

function createToolbarQuillStub() {
  const toolbar = document.createElement("div");
  toolbar.className = "ql-toolbar";
  const wrapper = document.createElement("div");
  const container = document.createElement("div");
  wrapper.append(toolbar, container);

  return {
    root: container,
    container,
    getSelection() {
      return { index: 0, length: 0 };
    },
    insertEmbed(_index: number, _blotName: string, _value: unknown) {
      return undefined;
    },
    setSelection() {
      return undefined;
    },
    getToolbar() {
      return toolbar;
    }
  };
}

beforeEach(() => {
  document.body.textContent = "";
  window.localStorage.clear();
});

describe("EmojiToolbar options", () => {
  it("uses customizable icon and aria label", () => {
    const quill = createToolbarQuillStub();
    new EmojiToolbar(quill as any, { buttonIcon: "😎", buttonAriaLabel: "Open custom picker" });
    const button = quill.getToolbar().querySelector(".ql-emoji");
    expect(button?.textContent).toBe("😎");
    expect(button?.getAttribute("aria-label")).toBe("Open custom picker");
  });

  it("uses custom picker class and placeholder", () => {
    const quill = createToolbarQuillStub();
    new EmojiToolbar(quill as any, {
      pickerClassName: "my-picker",
      searchPlaceholder: "Find emoji"
    });

    const button = quill.getToolbar().querySelector(".ql-emoji") as HTMLButtonElement;
    button.click();

    expect(document.querySelector(".ql-emoji-picker.my-picker")).toBeTruthy();
    expect((document.querySelector(".ql-emoji-search") as HTMLInputElement).placeholder).toBe(
      "Find emoji"
    );
  });

  it("inserts embed payload and stores recent emoji", () => {
    const embeds: unknown[] = [];
    const quill = createToolbarQuillStub();
    quill.insertEmbed = (_index: number, _blot: string, value: unknown) => {
      embeds.push(value);
    };

    new EmojiToolbar(quill as any, {
      emojis: [
        {
          id: "custom_rocket",
          emoji: "🚀",
          label: "rocket ship",
          shortcodes: ["rocket"],
          tags: ["launch"],
          group: "Travel & Places",
          unicode: "1F680",
          fallbackImage: "https://example.com/rocket.png"
        }
      ],
      storageKey: "test-recent"
    });

    const button = quill.getToolbar().querySelector(".ql-emoji") as HTMLButtonElement;
    button.click();
    const item = document.querySelector(".ql-emoji-item") as HTMLButtonElement;
    item.click();

    expect(embeds).toHaveLength(1);
    expect((embeds[0] as any).shortcode).toBe("rocket");
    expect((embeds[0] as any).fallbackImage).toBe("https://example.com/rocket.png");
    expect(window.localStorage.getItem("test-recent")).toContain("custom_rocket");
  });

  it("prefers full emojis list over customEmojis extension", () => {
    const quill = createToolbarQuillStub();
    new EmojiToolbar(quill as any, {
      emojis: [
        {
          id: "one",
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
          id: "two",
          emoji: "🛠️",
          label: "tools",
          shortcodes: ["tools"],
          tags: ["work"],
          group: "Objects",
          unicode: "1F6E0-FE0F"
        }
      ]
    });

    const button = quill.getToolbar().querySelector(".ql-emoji") as HTMLButtonElement;
    button.click();
    const text = document.querySelector(".ql-emoji-item")?.textContent;
    expect(text).toBe("🧪");
  });
});
