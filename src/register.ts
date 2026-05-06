import type { EmojiValue } from "./blots/types";
import { EmojiShortname, type EmojiShortnameOptions } from "./modules/emoji-shortname";
import { EmojiTextarea, type EmojiTextareaOptions } from "./modules/emoji-textarea";
import { EmojiToolbar, type EmojiToolbarOptions } from "./modules/emoji-toolbar";

type QuillLike = {
  register(
    pathOrDefs: string | Record<string, unknown>,
    target?: unknown,
    overwrite?: boolean
  ): void;
};

type EmojiModulesOptions = {
  toolbar?: EmojiToolbarOptions;
  textarea?: EmojiTextareaOptions;
  shortname?: EmojiShortnameOptions;
};

export type RegisterEmojiOptions = {
  emojis?: EmojiValue[];
  customEmojis?: EmojiValue[];
  forceFallbackImages?: boolean;
  modules?: EmojiModulesOptions;
};

export function registerSharedModules(Quill: QuillLike, options: RegisterEmojiOptions = {}): void {
  Quill.register(
    {
      "modules/emoji/toolbar": class EmojiToolbarModule extends EmojiToolbar {
        constructor(quill: any) {
          super(quill, {
            ...options.modules?.toolbar,
            emojis: options.emojis,
            customEmojis: options.customEmojis
          });
        }
      },
      "modules/emoji/textarea": class EmojiTextareaModule extends EmojiTextarea {
        constructor(quill: any) {
          super(quill, {
            ...options.modules?.textarea,
            emojis: options.emojis,
            customEmojis: options.customEmojis
          });
        }
      },
      "modules/emoji/shortname": class EmojiShortnameModule extends EmojiShortname {
        constructor(quill: any) {
          super(quill, {
            ...options.modules?.shortname,
            emojis: options.emojis,
            customEmojis: options.customEmojis
          });
        }
      }
    },
    true
  );
}

export {
  EmojiShortname,
  type EmojiShortnameOptions,
  EmojiTextarea,
  type EmojiTextareaOptions,
  EmojiToolbar,
  type EmojiToolbarOptions
};
