// File: vitest.config.mts
// Purpose: lets tests use the same "@/..." import alias as the app (tsconfig.json's
// "paths"), and runs in plain Node since these are service-layer unit tests, not
// anything that touches a browser.
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "server-only": path.resolve(import.meta.dirname, "./test/server-only-stub.ts"),
    },
  },
});
