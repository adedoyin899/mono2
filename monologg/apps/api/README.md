# @monologg/api

Still an empty scaffold as far as a running server goes — the real Fastify server, provider
interfaces, config, and routes land in Phase 3 onward, per `features.md`.

What does exist, per `features.md` Phase 2:

- `prisma/schema.prisma` — the full relational schema (15 models), migrated against Supabase.
- `prisma/seed.ts` — idempotent seed reproducing the prototype's demo data (`pnpm run db:seed`).
- `src/config/paymentProviders.ts` — the payment-provider allowlist (X1), ahead of Phase 3's
  provider-interface work, which should import this rather than redeclare it.
- `src/db/client.ts` — a `PrismaClient` singleton for Phase 3+ to build on.

See `../../CONTRIBUTING.md` ("Database (Supabase + Prisma)") for the commands, and
`../../handoff/log.md` (Sessions 11–12) for how the Supabase connection was set up and why.
