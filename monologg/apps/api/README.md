# @monologg/api

The running Fastify backend server for Monologg.

## Implemented in Phase 3

- **Fastify Server Scaffold**: Configured with CORS (locked to client origin), Helmet (secure headers), global rate limiting (100 requests per minute per IP), standard HTTP error helpers (`@fastify/sensible`), structured JSON logging (`pino-pretty` in development), and a central error handler that prevents stack trace leaks in production.
- **Boot-Time Env Validation**: Environment variables (`.env`) are parsed and validated using a Zod schema at boot (`src/config/env.ts`). The server fails fast with a clear explanation if variables are missing or misconfigured.
- **Provider Interface Pattern**: Every external integration is defined via a TypeScript interface with a deterministic mock implementation (`providers/*.mock.ts`) and a real stub implementation (`providers/*.real.ts`) for subsequent phases:
  - `PaymentProvider` (Phase 6: Paystack-first, no Fincra `// TODO(conflict:X1)`)
  - `KycProvider` (Phase 7: Smile Identity)
  - `AiTaggingProvider` (Phase 7: Style/vibe tagging only, separate from identity verification `// TODO(conflict:X3)`)
  - `CalendarProvider` (Phase 8: Google Calendar + Meet)
  - `NotifyProvider` (Phase 9: SendGrid + Twilio)
  The registry (`src/providers/index.ts`) resolves providers to mocks under test mode or per configuration flag.
- **Health Check Route**: `GET /api/v1/health` performs a query (`SELECT 1`) against Supabase to check database status, returning `503` if the database is down.
- **Fee Computation**: Centralized fee-split math in `src/services/fees.ts` that enforces the platform splits (11% talent / 15% client, `// TODO(conflict:X2)`). Uses integer minor units (kobo/cents) to prevent rounding drift.

## Running Locally

1. Ensure the workspace dependencies are installed:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and fill in local values:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   pnpm run dev
   ```
   The API will listen at `http://localhost:3001`.

## Testing

Run unit and mock integration tests:
```bash
pnpm test
```

For integration tests against the live database, run:
```bash
pnpm run test:integration
```
