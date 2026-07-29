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
- **Auth middleware** (`src/middlewares/auth.ts`): `requireAuth` (valid access token → 401), `requireRole('TALENT'|'CLIENT')` (→ 403), `requireOwner('user'|'creator'|'client', paramName)` (→ 403 not-owned, 404 not-found). Applied throughout Phase 5's domain routes below.
- **Client wiring** (`apps/web`): `api-client.ts` gained `register`/`login`/`logout`/`forgotPassword`/`isAuthenticated`; every live-mode request now attaches the access token and retries once on a 401 via silent refresh. `AuthFlow.tsx` calls these; a `RequireAuth` route guard wraps the six pages that need a session. Both are no-ops in the default `VITE_API_MODE=mock`.

## Implemented in Phase 5

- **Domain resources** — all owner/participant-scoped and paginated (`src/lib/pagination.ts`, `{data, page, pageSize, total, totalPages}`):
  - `creators` (`routes/creators.ts`) — `GET/PATCH /creators/me` (styleTags/verification aren't even in the update schema — X3 by omission, not a runtime check); `POST /creators/me/media/presign` (video/audio only, ≤150MB, via the new `StorageProvider` seam — mock local-disk fronted by a real `PUT /uploads/local/:token` route, real S3-compatible stub).
  - `rate-cards`, `availability` (`routes/rateCards.ts`, `routes/availability.ts`) — owner-scoped CRUD.
  - `briefs` (`routes/briefs.ts`) — client-owned CRUD. Schema gained `Brief.status` (`DRAFT|ACTIVE|IN_REVIEW|CLOSED`) this phase — not in the original Phase 2 listing, added since the resource needs a lifecycle field to be meaningful.
  - `talent` (`routes/talent.ts`) — public discovery, no auth. Filters: `niche`, `tag` (styleTags), `location`, `minPrice`/`maxPrice`.
  - `bookings` (`routes/bookings.ts`) — `POST` creates in `PENDING_PAYMENT` with fees always derived from `services/fees.ts`'s `computeFees()`, never client-supplied; `GET ?role=talent|client` lists own bookings; `PATCH /:id/cancel` uses the state machine.
  - `order-rooms` (`routes/orderRooms.ts`) — participant-scoped messages, `GET`/`POST /order-rooms/:bookingId/messages`.
- **Booking state machine** (`src/services/booking.ts`): a `LEGAL_TRANSITIONS` map + `assertLegalTransition()` reject illegal moves (e.g. `PENDING_PAYMENT → PAYMENT_RELEASED` directly) with `IllegalBookingTransitionError`. Only `PENDING_PAYMENT → CANCELLED` has a route so far — the rest (`ESCROW_LOCKED`, etc.) are triggered by Phase 6's payment webhook and later delivery/dispute flows, but the full legal-transition graph is defined and enforced now.
- **Response shapes are display-mapped, not raw Prisma rows** — `talent`/`rate-cards`/`briefs`/`bookings` all map real schema fields into the shape `apps/web`'s types expect (e.g. `Creator.niche` enum → a human label, `RateCard.basePriceAmount` → a formatted `"₦28,000"` string). Fields with no real backing data are honest placeholders, not fabricated: `Talent.rating`/`reviews` are `0` (no review system exists in any phase), `ClientProject.applicants` is `0` (no application system until Phase 14).

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
