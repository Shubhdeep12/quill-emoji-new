import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type RawEmoji = {
  annotation?: string;
  emoji?: string;
  group?: number;
  hexcode?: string;
  label?: string;
  shortcodes?: string[];
  tags?: string[];
  skins?: Array<{ emoji?: string; hexcode?: string }>;
};

type GroupName =
  | "Smileys & Emotion"
  | "People & Body"
  | "Component"
  | "Animals & Nature"
  | "Food & Drink"
  | "Travel & Places"
  | "Activities"
  | "Objects"
  | "Symbols"
  | "Flags";

type EmojiRecord = {
  id: string;
  emoji: string;
  label: string;
  group: GroupName;
  shortcodes: string[];
  tags: string[];
  unicode: string;
  skinTones?: Array<{ emoji: string; unicode: string }>;
};

const GROUP_MAP: Record<number, GroupName> = {
  0: "Smileys & Emotion",
  1: "People & Body",
  2: "Component",
  3: "Animals & Nature",
  4: "Food & Drink",
  5: "Travel & Places",
  6: "Activities",
  7: "Objects",
  8: "Symbols",
  9: "Flags"
};

function normalizeShortcodes(shortcodes: string[] | undefined, label: string): string[] {
  if (shortcodes && shortcodes.length > 0) {
    return [
      ...new Set(shortcodes.map((code) => code.replace(/^:|:$/g, "").trim()).filter(Boolean))
    ];
  }
  return [
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
  ];
}

async function run(): Promise<void> {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const dataOutputFile = resolve(root, "src/data/emoji-data.generated.ts");

  const module = await import("emojibase-data/en/data.json", { with: { type: "json" } });
  const source = module.default as RawEmoji[];

  const records: EmojiRecord[] = source
    .filter((item) => item.emoji && item.hexcode && item.group !== undefined)
    .map((item) => {
      const label = item.annotation ?? item.label ?? "emoji";
      const shortcodes = normalizeShortcodes(item.shortcodes, label);
      const group = GROUP_MAP[item.group as number] ?? "Objects";
      const skinTones =
        item.skins
          ?.filter((skin) => skin.emoji && skin.hexcode)
          .map((skin) => ({
            emoji: skin.emoji as string,
            unicode: skin.hexcode as string
          })) ?? [];

      const unicode = item.hexcode as string;

      return {
        id: shortcodes[0] || unicode,
        emoji: item.emoji as string,
        label,
        group,
        shortcodes,
        tags: item.tags ?? [],
        unicode,
        ...(skinTones.length > 0 ? { skinTones } : {})
      };
    });

  await mkdir(dirname(dataOutputFile), { recursive: true });
  const sourceFile = `import type { EmojiValue } from "../blots/types";

export const GENERATED_EMOJI_DATA = ${JSON.stringify(records, null, 2)} as unknown as EmojiValue[];
`;
  await writeFile(dataOutputFile, sourceFile, "utf8");
  process.stdout.write(`Generated ${records.length} emoji records\n`);
}

run().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
