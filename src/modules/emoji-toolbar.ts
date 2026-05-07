import type { EmojiValue } from "../blots/types";
import { EMOJI_DATA, EMOJI_GROUPS } from "../data/emoji-data";
import { createElement, safeLocalStorageGet, safeLocalStorageSet } from "../utils/dom";
import { EmojiSearch } from "../utils/search";

type QuillLike = {
  root: HTMLElement;
  container: HTMLElement;
  getSelection(focus?: boolean): { index: number; length: number } | null;
  insertEmbed(index: number, blotName: string, value: unknown, source?: string): void;
  setSelection(index: number, length?: number, source?: string): void;
};

export type EmojiToolbarOptions = {
  emojis?: EmojiValue[];
  buttonIcon?: string;
  buttonAriaLabel?: string;
  searchPlaceholder?: string;
  pickerClassName?: string;
  customEmojis?: EmojiValue[];
  maxRecent?: number;
  storageKey?: string;
};

export class EmojiToolbar {
  private readonly quill: QuillLike;
  private readonly options: Required<EmojiToolbarOptions>;
  private readonly data: EmojiValue[];
  private readonly search: EmojiSearch;
  private picker: HTMLDivElement | null = null;

  constructor(quill: QuillLike, options: EmojiToolbarOptions = {}) {
    this.quill = quill;
    this.options = {
      emojis: options.emojis ?? [],
      buttonIcon: options.buttonIcon ?? "😀",
      buttonAriaLabel: options.buttonAriaLabel ?? "Insert emoji",
      searchPlaceholder: options.searchPlaceholder ?? "Search emoji",
      pickerClassName: options.pickerClassName ?? "",
      customEmojis: options.customEmojis ?? [],
      maxRecent: options.maxRecent ?? 24,
      storageKey: options.storageKey ?? "quill-emoji-recent"
    };
    this.data =
      this.options.emojis.length > 0
        ? this.options.emojis
        : [...this.options.customEmojis, ...EMOJI_DATA];
    this.search = new EmojiSearch(this.data, { maxResults: 100 });
    this.mount();
  }

  private mount(): void {
    const toolbar = this.quill.container.parentElement?.querySelector(".ql-toolbar");
    if (!toolbar) {
      return;
    }

    let button = toolbar.querySelector("button.ql-emoji") as HTMLButtonElement | null;
    if (!button) {
      button = createElement("button", "ql-emoji");
      button.type = "button";
      button.ariaLabel = this.options.buttonAriaLabel;
      button.textContent = this.options.buttonIcon;
      toolbar.append(button);
    }
    const anchor = button;
    anchor.addEventListener("click", () => this.togglePicker(anchor));
  }

  private togglePicker(anchor: HTMLElement): void {
    if (this.picker) {
      this.destroyPicker();
      return;
    }
    this.picker = this.renderPicker();
    const bounds = anchor.getBoundingClientRect();
    this.picker.style.top = `${bounds.bottom + window.scrollY + 8}px`;
    this.picker.style.left = `${bounds.left + window.scrollX}px`;
    document.body.append(this.picker);
  }

  private renderPicker(): HTMLDivElement {
    const picker = createElement("div", "ql-emoji-picker");
    if (this.options.pickerClassName) {
      picker.classList.add(this.options.pickerClassName);
    }
    const searchInput = createElement("input", "ql-emoji-search");
    const tabs = createElement("div", "ql-emoji-tabs");
    const grid = createElement("div", "ql-emoji-grid");
    let activeGroup = this.getInitialGroup();

    searchInput.type = "search";
    searchInput.placeholder = this.options.searchPlaceholder;
    searchInput.addEventListener("input", () => {
      this.renderGrid(
        grid,
        searchInput.value.trim()
          ? this.search.search(searchInput.value)
          : this.getByGroup(activeGroup)
      );
    });

    for (const group of EMOJI_GROUPS.filter((name) => name !== "Custom")) {
      if (group === "Recently Used" && this.getRecent().length === 0) {
        continue;
      }
      const tab = createElement("button", "ql-emoji-tab");
      tab.type = "button";
      tab.textContent = group === "Recently Used" ? "Recent" : group.split(" ")[0];
      tab.addEventListener("click", () => {
        activeGroup = group;
        this.renderGrid(grid, this.getByGroup(group));
      });
      tabs.append(tab);
    }

    picker.append(searchInput, tabs, grid);
    this.renderGrid(grid, this.getByGroup(activeGroup));

    const onDocumentClick = (event: Event) => {
      if (!picker.contains(event.target as Node)) {
        this.destroyPicker();
        document.removeEventListener("mousedown", onDocumentClick);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return picker;
  }

  private renderGrid(grid: HTMLElement, items: EmojiValue[]): void {
    grid.replaceChildren();

    for (const item of items) {
      const button = createElement("button", "ql-emoji-item");
      button.type = "button";
      button.textContent = item.emoji;
      button.ariaLabel = item.label;
      button.title = `:${item.shortcodes[0]}:`;
      button.addEventListener("click", () => {
        this.insertEmoji(item);
        this.pushRecent(item.id);
        this.destroyPicker();
      });
      grid.append(button);
    }
  }

  private insertEmoji(item: EmojiValue): void {
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
  }

  private getByGroup(group: string): EmojiValue[] {
    if (group === "Recently Used") {
      return this.getRecent();
    }
    return this.data.filter((item) => item.group === group);
  }

  private getInitialGroup(): string {
    const preferred = EMOJI_GROUPS.find((group) => {
      if (group === "Recently Used") {
        return this.getRecent().length > 0;
      }
      return this.getByGroup(group).length > 0;
    });
    return preferred ?? EMOJI_GROUPS[1];
  }

  private getRecent(): EmojiValue[] {
    const raw = safeLocalStorageGet(this.options.storageKey);
    if (!raw) {
      return [];
    }

    const ids = JSON.parse(raw) as string[];
    const lookup = new Map(this.data.map((item) => [item.id, item]));
    return ids.map((id) => lookup.get(id)).filter((item): item is EmojiValue => Boolean(item));
  }

  private pushRecent(id: string): void {
    const ids = this.getRecent()
      .map((item) => item.id)
      .filter((current) => current !== id);
    ids.unshift(id);
    safeLocalStorageSet(
      this.options.storageKey,
      JSON.stringify(ids.slice(0, this.options.maxRecent))
    );
  }

  private destroyPicker(): void {
    this.picker?.remove();
    this.picker = null;
  }
}
