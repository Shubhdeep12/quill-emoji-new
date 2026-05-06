import type { EmojiValue } from "../blots/types";
import { EMOJI_DATA } from "../data/emoji-data";
import { createElement } from "../utils/dom";

type QuillLike = {
  container: HTMLElement;
  getSelection(focus?: boolean): { index: number; length: number } | null;
  insertEmbed(index: number, blotName: string, value: unknown, source?: string): void;
  setSelection(index: number, length?: number, source?: string): void;
};

export type EmojiTextareaOptions = {
  emojis?: EmojiValue[];
  customEmojis?: EmojiValue[];
  buttonLabel?: string;
};

export class EmojiTextarea {
  private readonly quill: QuillLike;
  private readonly options: Required<EmojiTextareaOptions>;
  private readonly data: EmojiValue[];
  private menu: HTMLDivElement | null = null;

  constructor(quill: QuillLike, options: EmojiTextareaOptions = {}) {
    this.quill = quill;
    this.options = {
      emojis: options.emojis ?? [],
      customEmojis: options.customEmojis ?? [],
      buttonLabel: options.buttonLabel ?? "😀"
    };
    this.data =
      this.options.emojis.length > 0
        ? this.options.emojis
        : [...this.options.customEmojis, ...EMOJI_DATA];
    this.mount();
  }

  private mount(): void {
    const wrapper = this.quill.container.parentElement;
    if (!wrapper) {
      return;
    }

    const button = createElement("button", "ql-emoji-textarea-button");
    button.type = "button";
    button.textContent = this.options.buttonLabel;
    button.addEventListener("click", () => this.toggle(button));
    wrapper.append(button);
  }

  private toggle(anchor: HTMLElement): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
      return;
    }

    const menu = createElement("div", "ql-emoji-inline-menu");
    const top = this.data.slice(0, 50);
    for (const item of top) {
      const option = createElement("button", "ql-emoji-inline-item");
      option.type = "button";
      option.textContent = item.emoji;
      option.ariaLabel = item.label;
      option.addEventListener("click", () => {
        const range = this.quill.getSelection(true) ?? { index: 0, length: 0 };
        this.quill.insertEmbed(
          range.index,
          "emoji",
          {
            emoji: item.emoji,
            shortcode: item.shortcodes[0],
            unicode: item.unicode,
            ariaLabel: item.label,
            fallbackImage: item.fallbackImage
          },
          "user"
        );
        this.quill.setSelection(range.index + 1, 0, "user");
        menu.remove();
        this.menu = null;
      });
      menu.append(option);
    }

    const bounds = anchor.getBoundingClientRect();
    menu.style.top = `${bounds.top + window.scrollY - 4}px`;
    menu.style.left = `${bounds.right + window.scrollX + 8}px`;
    document.body.append(menu);
    this.menu = menu;
  }
}
