import type { EmojiSearchResult, EmojiValue } from "../blots/types";
import { EMOJI_DATA } from "../data/emoji-data";
import { clamp, createElement } from "../utils/dom";
import { EmojiSearch } from "../utils/search";

type QuillLike = {
  root: HTMLElement;
  on(eventName: "text-change", handler: () => void): void;
  off(eventName: "text-change", handler: () => void): void;
  getSelection(focus?: boolean): { index: number; length: number } | null;
  getText(index: number, length: number): string;
  deleteText(index: number, length: number, source?: string): void;
  insertEmbed(index: number, blotName: string, value: unknown, source?: string): void;
  setSelection(index: number, length?: number, source?: string): void;
  getBounds(index: number, length?: number): { left: number; top: number; height: number };
};

export type EmojiShortnameOptions = {
  emojis?: EmojiValue[];
  minChars?: number;
  maxResults?: number;
  customEmojis?: EmojiValue[];
  showSuggestionsOnColon?: boolean;
  enableEmoticons?: boolean;
  emoticonMap?: Record<string, string>;
  onOpen?: () => void;
  onClose?: () => void;
  onSelect?: (shortcode: string) => void;
};

const DEFAULT_EMOTICON_MAP: Record<string, string> = {
  ":)": "slightly_smiling_face",
  ":-)": "slightly_smiling_face",
  ":(": "slightly_frowning_face",
  ":-(": "slightly_frowning_face",
  ":D": "grinning_face_with_big_eyes",
  ":-D": "grinning_face_with_big_eyes",
  ";)": "winking_face",
  ";-)": "winking_face",
  ":P": "face_with_tongue",
  ":-P": "face_with_tongue",
  ":p": "face_with_tongue",
  ":-p": "face_with_tongue",
  ":/": "confused_face",
  ":-/": "confused_face",
  ":|": "neutral_face",
  ":-|": "neutral_face",
  "<3": "red_heart"
};

export class EmojiShortname {
  private readonly quill: QuillLike;
  private readonly options: Required<EmojiShortnameOptions>;
  private readonly data: EmojiValue[];
  private readonly search: EmojiSearch;
  private readonly emojiByShortcode = new Map<string, EmojiValue>();
  private activeResults: EmojiSearchResult[] = [];
  private menu: HTMLDivElement | null = null;
  private selectedIndex = 0;
  private activeRange: { start: number; end: number } | null = null;
  private readonly handleTextChange = () => this.onTextChange();
  private readonly handleKeydown = (event: KeyboardEvent) => this.onKeydown(event);

  constructor(quill: QuillLike, options: EmojiShortnameOptions = {}) {
    this.quill = quill;
    this.options = {
      emojis: options.emojis ?? [],
      minChars: options.minChars ?? 2,
      maxResults: options.maxResults ?? 10,
      customEmojis: options.customEmojis ?? [],
      showSuggestionsOnColon: options.showSuggestionsOnColon ?? true,
      enableEmoticons: options.enableEmoticons ?? false,
      emoticonMap: { ...DEFAULT_EMOTICON_MAP, ...(options.emoticonMap ?? {}) },
      onOpen: options.onOpen ?? (() => undefined),
      onClose: options.onClose ?? (() => undefined),
      onSelect: options.onSelect ?? (() => undefined)
    };
    this.data =
      this.options.emojis.length > 0
        ? this.options.emojis
        : [...this.options.customEmojis, ...EMOJI_DATA];
    for (const emoji of this.data) {
      for (const shortcode of emoji.shortcodes) {
        this.emojiByShortcode.set(shortcode.toLowerCase(), emoji);
      }
    }
    this.search = new EmojiSearch(this.data, { maxResults: this.options.maxResults });
    this.quill.on("text-change", this.handleTextChange);
    this.quill.root.addEventListener("keydown", this.handleKeydown);
  }

  private onTextChange(): void {
    const range = this.quill.getSelection(true);
    if (!range) {
      this.close();
      return;
    }

    const lookbehind = 48;
    const start = Math.max(0, range.index - lookbehind);
    const text = this.quill.getText(start, range.index - start);
    if (this.options.enableEmoticons && this.tryConvertEmoticon(text, range.index)) {
      return;
    }

    const match = text.match(/(?:^|\s):([a-z0-9_+-]{0,40})$/i);
    if (!match) {
      this.close();
      return;
    }

    const query = match[1] ?? "";
    if (query.length === 0) {
      if (!this.options.showSuggestionsOnColon) {
        this.close();
        return;
      }
      this.activeResults = this.data.slice(0, this.options.maxResults);
    } else if (query.length < this.options.minChars) {
      this.close();
      return;
    } else {
      this.activeResults = this.search.search(query).slice(0, this.options.maxResults);
    }
    if (this.activeResults.length === 0) {
      this.close();
      return;
    }

    this.activeRange = { start: range.index - query.length - 1, end: range.index };
    this.selectedIndex = clamp(this.selectedIndex, 0, this.activeResults.length - 1);
    this.open(range.index);
  }

  private tryConvertEmoticon(text: string, cursorIndex: number): boolean {
    const emoticons = Object.keys(this.options.emoticonMap)
      .sort((left, right) => right.length - left.length)
      .map((value) => escapeRegExp(value));
    if (emoticons.length === 0) {
      return false;
    }
    const match = text.match(new RegExp(`(?:^|\\s)(${emoticons.join("|")})$`));
    if (!match) {
      return false;
    }

    const emoticon = match[1];
    const shortcode = this.options.emoticonMap[emoticon];
    if (!shortcode) {
      return false;
    }

    const emoji = this.emojiByShortcode.get(shortcode.toLowerCase());
    if (!emoji) {
      return false;
    }

    const start = cursorIndex - emoticon.length;
    this.quill.deleteText(start, emoticon.length, "user");
    this.quill.insertEmbed(
      start,
      "emoji",
      {
        emoji: emoji.emoji,
        shortcode: emoji.shortcodes[0],
        unicode: emoji.unicode,
        ariaLabel: emoji.label,
        fallbackImage: emoji.fallbackImage
      },
      "user"
    );
    this.quill.setSelection(start + 1, 0, "user");
    this.options.onSelect(emoji.shortcodes[0]);
    this.close();
    return true;
  }

  private onKeydown(event: KeyboardEvent): void {
    if (!this.menu || this.activeResults.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.selectedIndex = clamp(this.selectedIndex + 1, 0, this.activeResults.length - 1);
      this.renderMenu();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.selectedIndex = clamp(this.selectedIndex - 1, 0, this.activeResults.length - 1);
      this.renderMenu();
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      this.commit(this.activeResults[this.selectedIndex]);
      return;
    }

    if (event.key === "Escape") {
      this.close();
    }
  }

  private open(index: number): void {
    if (!this.menu) {
      this.menu = createElement("div", "ql-emoji-shortname-menu");
      document.body.append(this.menu);
      this.options.onOpen();
    }
    const bounds = this.quill.getBounds(index);
    this.menu.style.left = `${bounds.left + window.scrollX}px`;
    this.menu.style.top = `${bounds.top + bounds.height + window.scrollY + 4}px`;
    this.renderMenu();
  }

  private renderMenu(): void {
    if (!this.menu) {
      return;
    }
    this.menu.replaceChildren();
    this.activeResults.forEach((result, index) => {
      const item = createElement("button", "ql-emoji-shortname-item");
      item.type = "button";
      item.classList.toggle("is-active", index === this.selectedIndex);

      const emoji = createElement("span", "emoji");
      emoji.textContent = result.emoji;
      const name = createElement("span", "name");
      name.textContent = `:${result.shortcodes[0]}:`;

      item.append(emoji, name);
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.commit(result);
      });
      this.menu?.append(item);
    });
  }

  private commit(result: EmojiSearchResult): void {
    if (!this.activeRange) {
      return;
    }
    const length = this.activeRange.end - this.activeRange.start;
    this.quill.deleteText(this.activeRange.start, length, "user");
    this.quill.insertEmbed(
      this.activeRange.start,
      "emoji",
      {
        emoji: result.emoji,
        shortcode: result.shortcodes[0],
        unicode: result.unicode,
        ariaLabel: result.label,
        fallbackImage: result.fallbackImage
      },
      "user"
    );
    this.quill.setSelection(this.activeRange.start + 1, 0, "user");
    this.options.onSelect(result.shortcodes[0]);
    this.close();
  }

  private close(): void {
    if (!this.menu) {
      return;
    }
    this.menu.remove();
    this.menu = null;
    this.activeResults = [];
    this.activeRange = null;
    this.selectedIndex = 0;
    this.options.onClose();
  }

  destroy(): void {
    this.quill.off("text-change", this.handleTextChange);
    this.quill.root.removeEventListener("keydown", this.handleKeydown);
    this.close();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
