import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "apps/web/**/*.unit.test.ts",
      "packages/validators/**/*.unit.test.ts"
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web"),
      "@src": path.resolve(__dirname, "apps/web")
    }
  }
});
