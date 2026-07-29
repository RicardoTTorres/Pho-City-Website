import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.integration.test.js"],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    isolate: true,
  },
});
