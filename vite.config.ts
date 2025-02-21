import { defineConfig } from "vite";
import { name } from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name,
    },
    rollupOptions: {
      external: ["@linkurious/ogma"],
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
