export type EmojiGroup =
  | "Smileys & Emotion"
  | "People & Body"
  | "Component"
  | "Animals & Nature"
  | "Food & Drink"
  | "Travel & Places"
  | "Activities"
  | "Objects"
  | "Symbols"
  | "Flags"
  | "Recently Used"
  | "Custom";

export type EmojiValue = {
  id: string;
  emoji: string;
  label: string;
  shortcodes: string[];
  tags: string[];
  group: EmojiGroup;
  unicode: string;
  fallbackImage?: string;
  skinTones?: Array<{ emoji: string; unicode: string }>;
};

export type EmojiBlotValue = {
  emoji: string;
  shortcode: string;
  unicode: string;
  ariaLabel?: string;
  fallbackImage?: string;
};

export type EmojiSearchResult = EmojiValue & {
  score?: number;
};
