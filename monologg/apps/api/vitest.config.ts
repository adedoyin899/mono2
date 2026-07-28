import { defineConfig } from "vitest/config";

// Fast, no-network tests — this is the CI-blocking gate. Live-DB tests live in
// vitest.integration.config.ts (see README.md for why they're separate).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/*.integration.test.ts"],
  },
});
