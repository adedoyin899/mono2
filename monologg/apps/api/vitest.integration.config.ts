import { defineConfig } from "vitest/config";

// Live-DB tests: real network + real Supabase credentials from apps/api/.env, not wired into
// `pnpm test`/CI since CI doesn't have Supabase secrets or per-run branching configured yet
// (see handoff/log.md Session 12). Run manually with `pnpm --filter @monologg/api run test:integration`
// after `pnpm --filter @monologg/api run db:seed`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.integration.test.ts"],
    exclude: ["**/node_modules/**"],
    setupFiles: ["./test-setup.integration.ts"],
    // The idempotent-reseed test re-runs ~60 sequential upserts against Supabase's transaction
    // pooler over an already-active client; observed at ~80s in this sandbox vs. ~2.5s for a
    // fresh `prisma db seed` process — real network latency, not a hang, but slow enough to
    // need a generous budget since this suite doesn't run on every commit.
    testTimeout: 90000,
    pool: "forks",
    // These files all read/write the same live, shared Supabase project — unlike
    // the mocked-Prisma unit tests, they aren't isolated from each other. Running
    // them in parallel let a row-count-idempotency check in one file race against
    // in-flight bookings created by another (surfaced once a third live-DB file
    // was added in Phase 6); force sequential execution instead.
    fileParallelism: false,
  },
});
