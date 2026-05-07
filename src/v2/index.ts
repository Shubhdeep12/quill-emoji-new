import { createEmojiBlotV2 } from "../blots/emoji-blot-v2";
import type { EmojiBlotValue, EmojiValue } from "../blots/types";
import { EMOJI_DATA, EMOJI_GROUPS } from "../data/emoji-data";
import {
  emojiById,
  emojiByShortcode,
  getEmojiByShortcode,
  registerAliases
} from "../data/emoji-map";
import {
  EmojiShortname,
  type EmojiShortnameOptions,
  EmojiTextarea,
  type EmojiTextareaOptions,
  EmojiToolbar,
  type EmojiToolbarOptions,
  type RegisterEmojiOptions,
  registerSharedModules
} from "../register";
import { EmojiSearch, type EmojiSearchOptions } from "../utils/search";

type QuillLike = {
  import(path: string): any;
  register(
    pathOrDefs: string | Record<string, unknown>,
    target?: unknown,
    overwrite?: boolean
  ): void;
};

export function registerQuillEmojiV2(Quill: QuillLike, options: RegisterEmojiOptions = {}): void {
  if (options.legacyAliases) {
    registerAliases(options.legacyAliases);
  }
  const EmojiBlot = createEmojiBlotV2(Quill, {
    forceFallbackImages: options.forceFallbackImages
  });
  Quill.register({ "formats/emoji": EmojiBlot }, true);
  registerSharedModules(Quill, options);
}

type QuillEditorLike = {
  getSelection(focus?: boolean): { index: number; length: number } | null;
  insertEmbed(index: number, blotName: string, value: unknown, source?: string): void;
  setSelection(index: number, length?: number, source?: string): void;
};

export function setEmoji(quill: QuillEditorLike, shortcode: string): boolean {
  const item = getEmojiByShortcode(shortcode);
  if (!item) {
    return false;
  }
  const range = quill.getSelection(true) ?? { index: 0, length: 0 };
  quill.insertEmbed(
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
  quill.setSelection(range.index + 1, 0, "user");
  return true;
}

const maybeGlobalQuill =
  typeof window !== "undefined" ? (window as { Quill?: QuillLike }).Quill : undefined;
if (maybeGlobalQuill) {
  registerQuillEmojiV2(maybeGlobalQuill);
}

export type {
  EmojiBlotValue,
  EmojiSearchOptions,
  EmojiShortnameOptions,
  EmojiTextareaOptions,
  EmojiToolbarOptions,
  EmojiValue
};
export {
  EMOJI_DATA,
  EMOJI_GROUPS,
  EmojiSearch,
  EmojiShortname,
  EmojiTextarea,
  EmojiToolbar,
  emojiById,
  emojiByShortcode,
  getEmojiByShortcode,
  registerAliases
};
