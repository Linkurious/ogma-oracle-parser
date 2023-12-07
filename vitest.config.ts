import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ['json', 'cobertura'],
      include: ['src/**'],
      exclude: ['**/node_modules/**', 'example/**', 'docs/**'],
      reportsDirectory: 'reports/coverage'
    }
  }
});