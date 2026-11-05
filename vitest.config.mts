import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // Playwright owns these; Vitest would otherwise pick up *.spec.ts here too.
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
});
