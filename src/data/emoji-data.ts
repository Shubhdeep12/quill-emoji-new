import type { EmojiGroup, EmojiValue } from "../blots/types";
import { GENERATED_EMOJI_DATA } from "./emoji-data.generated.js";

export const EMOJI_DATA: EmojiValue[] = GENERATED_EMOJI_DATA as Array<
  Omit<EmojiValue, "group"> & { group: EmojiGroup }
>;

export const EMOJI_GROUPS: EmojiGroup[] = [
  "Recently Used",
  "Smileys & Emotion",
  "People & Body",
  "Component",
  "Animals & Nature",
  "Food & Drink",
  "Travel & Places",
  "Activities",
  "Objects",
  "Symbols",
  "Flags",
  "Custom"
];
