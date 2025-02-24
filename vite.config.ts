import { defineConfig } from "vite";
import { name } from "./package.json";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name,
    },
    rollupOptions: {
      external: [
        "@linkurious/ogma",
        "process",
        "util",
        "path",
        "fs",
        "oracledb",
        "buffer",
      ],
      output: {
        name: "OgmaOracleParser",
        globals: {
          "@linkurious/ogma": "Ogma",
        },
      },
    },
    emptyOutDir: false,
  },
});
