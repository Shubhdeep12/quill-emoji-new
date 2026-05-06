# quill-emoji-new

Emoji modules for Quill with modern TypeScript builds and Quill 1.x/2.x support.

`quill-emoji-new` is an updated fork of the original `quill-emoji`, focused on modern packaging, better configurability, and maintainable defaults.

Open source contributions are welcome.

## Installation

```bash
# npm
npm install quill-emoji-new

# pnpm
pnpm add quill-emoji-new

# yarn
yarn add quill-emoji-new

# bun
bun add quill-emoji-new
```

## Version Support

- `quill-emoji-new` -> Quill 2.x
- `quill-emoji-new/v1` -> Quill 1.x
- `quill-emoji-new/style.css` -> shared stylesheet

## Quick Start

### Quill 2.x

```ts
import Quill from "quill";
import { registerQuillEmojiV2 } from "quill-emoji-new";
import "quill-emoji-new/style.css";

registerQuillEmojiV2(Quill);

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: {
      container: [["bold", "italic"], ["emoji"]],
      handlers: { emoji: () => {} }
    },
    "emoji/toolbar": true,
    "emoji/shortname": true,
    "emoji/textarea": true
  }
});
```

### Quill 1.x

```ts
import Quill from "quill";
import { registerQuillEmojiV1 } from "quill-emoji-new/v1";
import "quill-emoji-new/style.css";

registerQuillEmojiV1(Quill);
```

## Features

- `emoji/toolbar` picker module
- `emoji/shortname` inline suggestions (`:` trigger)
- `emoji/textarea` quick insert module
- optional emoticon conversion (`:)`, `:-)`, `<3`, etc.)
- custom emoji extension (`customEmojis`)
- full dataset override (`emojis`)
- optional fallback image rendering (`forceFallbackImages`)
- programmatic command helper: `setEmoji(quill, shortcode)`
- exported search/data utilities

## API

### Register

- `registerQuillEmojiV2(Quill, options?)`
- `registerQuillEmojiV1(Quill, options?)`

### Command

- `setEmoji(quill, shortcode): boolean`

### Data & Search

- `EMOJI_DATA`
- `EMOJI_GROUPS`
- `emojiById`
- `emojiByShortcode`
- `getEmojiByShortcode(shortcode)`
- `EmojiSearch`

## Configuration

Top-level:

- `emojis?: EmojiValue[]`
- `customEmojis?: EmojiValue[]`
- `forceFallbackImages?: boolean`
- `modules?: { toolbar?, shortname?, textarea? }`

`emoji/toolbar`:

- `buttonIcon?: string`
- `buttonAriaLabel?: string`
- `searchPlaceholder?: string`
- `pickerClassName?: string`
- `emojis?: EmojiValue[]`
- `customEmojis?: EmojiValue[]`
- `maxRecent?: number`
- `storageKey?: string`

`emoji/shortname`:

- `minChars?: number`
- `maxResults?: number`
- `showSuggestionsOnColon?: boolean`
- `enableEmoticons?: boolean`
- `emoticonMap?: Record<string, string>`
- `emojis?: EmojiValue[]`
- `customEmojis?: EmojiValue[]`
- `onOpen?: () => void`
- `onClose?: () => void`
- `onSelect?: (shortcode: string) => void`

`emoji/textarea`:

- `buttonLabel?: string`
- `emojis?: EmojiValue[]`
- `customEmojis?: EmojiValue[]`

## Updated vs Original

Original `quill-emoji` package:

- primarily Quill 1.x-era setup
- legacy JS/webpack toolchain
- old module keys (`emoji-toolbar`, `emoji-shortname`, `emoji-textarea`)

`quill-emoji-new`:

- Quill 2.x default + Quill 1.x compatibility entry
- TypeScript + ESM/CJS/type declarations
- modern module keys:
  - `emoji/toolbar`
  - `emoji/shortname`
  - `emoji/textarea`
- expanded runtime customization and data controls

## Security Note

`quill` currently has an upstream low-severity advisory ([GHSA-v3m3-f69x-jf25](https://github.com/advisories/GHSA-v3m3-f69x-jf25)) with no patched release published yet. Sanitize editor-generated HTML at your output/storage boundaries.

## Development

```bash
# choose one package manager
npm install
npm run ci

# or
pnpm install
pnpm run ci

# or
yarn install
yarn ci
```

## Contributing

Thanks for helping improve `quill-emoji-new`.

### Ways to contribute

- report bugs and edge cases
- propose features and API improvements
- improve docs and examples
- submit tests and implementation fixes

### Local setup

```bash
# pick your preferred package manager
pnpm install
pnpm run ci
```

### Pull request checklist

- keep changes focused and include tests when behavior changes
- run `pnpm run ci` (or your equivalent npm/yarn commands) before opening a PR
- for user-facing changes, add a changeset:

```bash
pnpm changeset
```

- commit the generated `.changeset/*.md` file with your branch changes

## Attribution

- Original package: [contentco/quill-emoji](https://github.com/contentco/quill-emoji)
- Repository: [Shubhdeep12/quill-emoji-new](https://github.com/Shubhdeep12/quill-emoji-new)
- npm: [quill-emoji-new](https://www.npmjs.com/package/quill-emoji-new)
- Dependencies:
  - [quill](https://www.npmjs.com/package/quill)
  - [fuse.js](https://www.npmjs.com/package/fuse.js)
  - [emojibase](https://www.npmjs.com/package/emojibase)
  - [emojibase-data](https://www.npmjs.com/package/emojibase-data)
