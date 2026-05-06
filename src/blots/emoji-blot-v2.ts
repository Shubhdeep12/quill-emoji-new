import { getEmojiByShortcode } from "../data/emoji-map";
import type { EmojiBlotValue } from "./types";

type QuillLike = {
  import(path: string): any;
};

type EmojiBlotOptions = {
  forceFallbackImages?: boolean;
};

type LegacyEmojiBlotValue =
  | string
  | {
      name?: string;
      shortcode?: string;
      unicode?: string;
      emoji?: string;
      char?: string;
      ariaLabel?: string;
      fallbackImage?: string;
    };

export function createEmojiBlotV2(Quill: QuillLike, options: EmojiBlotOptions = {}) {
  const Parchment = Quill.import("parchment");
  const EmbedBlot = Parchment.EmbedBlot;

  class EmojiBlotV2 extends EmbedBlot {
    static blotName = "emoji";
    static className = "ql-emojiblot";
    static tagName = "span";

    static create(value: EmojiBlotValue | LegacyEmojiBlotValue): HTMLElement {
      const node = super.create() as HTMLElement;
      const payload = normalize(value);
      node.textContent = "";
      node.setAttribute("data-emoji", payload.emoji);
      node.setAttribute("data-name", payload.shortcode);
      node.setAttribute("data-unicode", payload.unicode);
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", payload.ariaLabel);
      node.setAttribute("data-fallback-image", payload.fallbackImage);
      if (shouldRenderFallbackImage(payload, options)) {
        const image = document.createElement("img");
        image.src = payload.fallbackImage;
        image.alt = payload.ariaLabel;
        image.loading = "lazy";
        image.draggable = false;
        node.append(image);
      } else {
        node.textContent = payload.emoji;
      }
      return node;
    }

    static value(node: HTMLElement): EmojiBlotValue {
      const shortcode =
        node.getAttribute("data-name") || extractLegacyShortcodeFromClass(node) || "";
      const mapped = shortcode ? getEmojiByShortcode(shortcode) : undefined;
      return {
        emoji: node.getAttribute("data-emoji") || node.textContent || mapped?.emoji || "",
        shortcode,
        unicode: node.getAttribute("data-unicode") || mapped?.unicode || "",
        ariaLabel: node.getAttribute("aria-label") || shortcode || "emoji",
        fallbackImage: node.getAttribute("data-fallback-image") || undefined
      };
    }

    static formats(_scroll: unknown, node: HTMLElement): EmojiBlotValue {
      return this.value(node);
    }
  }

  return EmojiBlotV2;
}

function normalize(value: EmojiBlotValue | LegacyEmojiBlotValue): Required<EmojiBlotValue> {
  const legacy = parseLegacyValue(value);
  const mapped = legacy.shortcode ? getEmojiByShortcode(legacy.shortcode) : undefined;
  const shortcode = legacy.shortcode;
  return {
    emoji: legacy.emoji || mapped?.emoji || "",
    shortcode,
    unicode: legacy.unicode || mapped?.unicode || "",
    ariaLabel: legacy.ariaLabel ?? (shortcode || "emoji"),
    fallbackImage: legacy.fallbackImage ?? ""
  };
}

function shouldRenderFallbackImage(
  value: Required<EmojiBlotValue>,
  options: EmojiBlotOptions
): boolean {
  return Boolean(options.forceFallbackImages && value.fallbackImage);
}

function parseLegacyValue(value: EmojiBlotValue | LegacyEmojiBlotValue): EmojiBlotValue {
  if (typeof value === "string") {
    return {
      emoji: "",
      shortcode: value,
      unicode: ""
    };
  }
  const legacyChar = "char" in value && typeof value.char === "string" ? value.char : "";
  const legacyName = "name" in value && typeof value.name === "string" ? value.name : "";
  return {
    emoji: value.emoji ?? legacyChar,
    shortcode: value.shortcode ?? legacyName,
    unicode: value.unicode ?? "",
    ariaLabel: value.ariaLabel,
    fallbackImage: value.fallbackImage
  };
}

function extractLegacyShortcodeFromClass(node: HTMLElement): string | undefined {
  const candidates: HTMLElement[] = [
    node,
    ...(Array.from(node.querySelectorAll("span")) as HTMLElement[])
  ];
  for (const candidate of candidates) {
    for (const className of Array.from(candidate.classList)) {
      if (className.startsWith("ap-")) {
        return className.slice(3);
      }
    }
  }
  return undefined;
}
