import Fuse, { type IFuseOptions } from "fuse.js";
import type { EmojiSearchResult, EmojiValue } from "../blots/types";

export type EmojiSearchOptions = {
  fuseOptions?: IFuseOptions<EmojiValue>;
  maxResults?: number;
};

const defaultFuseOptions: IFuseOptions<EmojiValue> = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.35,
  keys: [
    { name: "shortcodes", weight: 1.0 },
    { name: "tags", weight: 0.7 },
    { name: "label", weight: 0.5 }
  ]
};

export class EmojiSearch {
  private readonly data: EmojiValue[];
  private readonly options: EmojiSearchOptions;
  private fuseInstance: Fuse<EmojiValue> | null = null;

  constructor(data: EmojiValue[], options: EmojiSearchOptions = {}) {
    this.data = data;
    this.options = options;
  }

  private ensureIndex(): Fuse<EmojiValue> {
    if (!this.fuseInstance) {
      this.fuseInstance = new Fuse(this.data, {
        ...defaultFuseOptions,
        ...(this.options.fuseOptions ?? {})
      });
    }
    return this.fuseInstance;
  }

  search(query: string): EmojiSearchResult[] {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return [];
    }

    const results = this.ensureIndex().search(cleanQuery);
    return results
      .slice(0, this.options.maxResults ?? 20)
      .map((result) => ({ ...result.item, score: result.score }));
  }
}
