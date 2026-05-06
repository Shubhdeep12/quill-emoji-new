import type { EmojiValue } from "../blots/types";
import { EMOJI_DATA } from "./emoji-data";

export const emojiByShortcode = new Map<string, EmojiValue>();
export const emojiById = new Map<string, EmojiValue>();

for (const emoji of EMOJI_DATA) {
  emojiById.set(emoji.id, emoji);

  for (const shortcode of emoji.shortcodes) {
    emojiByShortcode.set(shortcode.toLowerCase(), emoji);
  }
}

export function getEmojiByShortcode(shortcode: string): EmojiValue | undefined {
  return emojiByShortcode.get(shortcode.toLowerCase());
}
