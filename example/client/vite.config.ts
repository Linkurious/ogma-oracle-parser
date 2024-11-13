import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 100 * 1024, // 1000kb
  },
});
