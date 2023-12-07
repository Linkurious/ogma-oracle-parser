import { name } from "./package.json";
import { defineConfig } from "vite";

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
          "@linkurious/ogma": "Ogma"
        },
      },
    },
    emptyOutDir: false,
  },
  test: {
    coverage: {
      reporter: ['json', 'cobertura'],
      include: ['src/**'],
      exclude: ['**/node_modules/**', 'example/**', 'docs/**'],
      reportsDirectory: 'reports/coverage'
    }
  }
});