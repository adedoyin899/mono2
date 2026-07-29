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

## Implemented in Phase 4

- **Auth endpoints** (`/api/v1/auth/*`): `register`, `login`, `refresh`, `logout`, `verify-email`, `forgot-password`, `reset-password` (`src/routes/auth.ts`). Generic error messages throughout to avoid user enumeration; `login`/`forgot-password` are rate-limited (10 req / 15 min per IP).
- **Passwords**: argon2id (`src/services/auth.ts`). Never stored, logged, or returned in plaintext.
- **Tokens**: short-lived (~15 min) access JWT + rotating (~30 day) refresh JWT. Refresh tokens are stored hashed (SHA-256) in `RefreshToken`; reuse of an already-rotated token revokes the entire token family. `CacheProvider` (`src/providers/cache.*` — in-memory mock / Redis real) backs the revocation denylist and short-lived verify/reset tokens.
- **Auth middleware** (`src/middlewares/auth.ts`): `requireAuth` (valid access token → 401), `requireRole('TALENT'|'CLIENT')` (→ 403), `requireOwner('user'|'creator'|'client', paramName)` (→ 403 not-owned, 404 not-found). Not yet applied to any domain route — those don't exist until Phase 5.
- **Client wiring** (`apps/web`): `api-client.ts` gained `register`/`login`/`logout`/`forgotPassword`/`isAuthenticated`; every live-mode request now attaches the access token and retries once on a 401 via silent refresh. `AuthFlow.tsx` calls these; a `RequireAuth` route guard wraps the six pages that need a session. Both are no-ops in the default `VITE_API_MODE=mock`.

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
