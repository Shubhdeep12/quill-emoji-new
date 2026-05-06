import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/v2/index.ts" },
    tsconfig: "tsconfig.build.json",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: false,
    outDir: "dist/v2",
    splitting: false,
    external: ["quill"],
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".cjs"
      };
    }
  },
  {
    entry: { index: "src/v1/index.ts" },
    tsconfig: "tsconfig.build.json",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: false,
    outDir: "dist/v1",
    splitting: false,
    external: ["quill"],
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".cjs"
      };
    }
  }
]);
