import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // tsconfig uses `jsx: preserve` (Next compiles JSX itself), so tell esbuild
  // how to transform .tsx for tests that render components to HTML.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
