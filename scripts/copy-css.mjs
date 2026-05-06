import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "src/styles/quill-emoji.css");
const target = resolve(root, "dist/quill-emoji.css");

await mkdir(dirname(target), { recursive: true });
await cp(source, target);
