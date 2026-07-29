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

## Implemented in Phase 6

- **`PaymentProvider.real`** (`src/providers/payment.real.ts`) — a genuine Paystack integration (`/transaction/initialize`, `/transaction/verify`, `/refund`, HMAC-SHA512 webhook verification), selected via `PAYMENT_PROVIDER=paystack`. `payment.stripe.ts`/`payment.airwallex.ts` stub the same interface for later regions (`config/paymentRails.ts` maps countries to a provider) — never "fincra" (X1). Real payouts (`releaseFunds`) throw a clearly-flagged, descriptive error: Paystack transfers need a `recipient_code` from creator bank details, which no phase through Phase 6 collects — beta's ledger-hold model treats the internal `PAYMENT_RELEASED` state as authoritative, with the actual bank transfer reconciled manually until a payout-onboarding phase exists.
- **Ledger-based escrow** (`src/services/payment.ts`) — `POST /bookings/:id/pay` (`initEscrowForBooking`) charges the client's `base + clientFee` total and returns a Paystack checkout URL; it never advances `BookingState` itself. Only `POST /api/v1/webhooks/paystack` (`processPaystackWebhookEvent`) — signature-verified, idempotent — sets `ESCROW_LOCKED`. A client-side "payment succeeded" redirect is purely advisory; there is no endpoint anywhere that lets it move state on its own.
- **Idempotency, without a generic key-store table** — each money-moving path is guarded by the DB mechanism that actually fits it: `Payment.bookingId`/`providerRef` are `@unique`; `PaymentEvent` has a `@@unique([paymentId, type, eventId])` constraint so a replayed webhook's insert hits a unique-violation (Prisma `P2002`) and no-ops instead of reprocessing; `releaseEscrowForBooking`/`refundEscrowForBooking` atomically claim the transition via a conditional `updateMany` (`WHERE status = 'ESCROW_HELD'`) *before* calling the provider — a concurrent second caller sees zero rows affected and no-ops rather than double-paying. `PaymentStatus` gained two transient states, `RELEASING`/`REFUNDING`, to make that claim window observable and rollback-able if the provider call fails.
- **Booking routes gained the rest of the money lifecycle** (`routes/bookings.ts`): `POST /:id/pay`, `PATCH /:id/deliver` (talent), `PATCH /:id/approve` (client — releases escrow), `PATCH /:id/dispute` (either participant), `POST /:id/refund` (dispute resolution placeholder — no admin/adjudication flow exists in any phase yet, so either participant can call it while `DISPUTED`).
- **Known, deliberately-left-open gap:** `apps/web/src/app/pages/Checkout.tsx` (the prototype checkout screen) is **not wired to any of this** — it still runs its original scripted 2.5s delay and still says "FINCRA" three times. Phase 6's kickoff scope was API-only; rewiring the frontend was explicitly deferred rather than folded in silently (see `handoff/log.md` Session 16).

## Implemented in Phase 7

- **`KycProvider` (`src/services/kyc.ts`)** — the only code path that writes `Creator.verification`. `POST /creators/me/verify` starts a check (409 if one's already `PROCESSING`, or the creator is already `VERIFIED`; freely retriable after `FAILED`); `GET /creators/me/verify` polls `KycProvider.getStatus` and only writes on an actual `PROCESSING → VERIFIED|FAILED` transition. Attempts are recorded in `KycCheck`.
- **`AiTaggingProvider` (`src/services/aiTagging.ts`)** — the only code path that writes `Creator.styleTags` (merged/deduped, never overwritten). No dedicated job queue exists yet (Phase 9's BullMQ work); `POST /creators/me/media/:id/confirm` synchronously claims `QUEUED → TAGGING` then runs the provider call + `DONE`/`FAILED` finalization in the background. `GET /creators/me/media/:id` polls the real `taggingStatus` — this is what `apps/web` now drives its UI from, not a fixed timer.
- **X3 enforced at three layers**: schema (`MediaAsset.taggingStatus` vs `Creator.verification` are separate columns/enums, asserted in `prisma/schema.test.ts`), service (each service only ever calls `prisma.creator.update` with its own field — asserted in `services/kyc.test.ts` / `services/aiTagging.test.ts`), and copy (`apps/web`'s `x3CopyAudit.test.ts` — see below).
- **`apps/web` copy audit**: `CreatorOnboarding.tsx`'s old "Thespian AI Verified" scripted animation conflated AI tagging with identity verification. Rewired to real job-state polling in `live` mode (mock mode keeps a local timed simulation, no network — same seam contract as every other mock-mode screen), and reworded everywhere: the finished state now reads "Style Tags Generated," never "Verified." The same conflation was found and fixed on `Settings.tsx`, `TalentDashboard.tsx`, `LandingPage.tsx`, `AuthFlow.tsx`, and `ClientDashboard.tsx`.
- **Known, deliberately-left-open gap:** no screen anywhere collects the legal name/DOB/country/ID-type/ID-number `POST /creators/me/verify` needs — a creator can't yet self-serve identity verification from the UI. The endpoints are real and fully tested; building an input form wasn't in this phase's kickoff scope (see `handoff/log.md` Session 17, same shape as the Phase 6 `Checkout.tsx` gap above).

## Implemented in Phase 8

- **Google OAuth, per user, refresh token encrypted at rest** (`src/lib/encryption.ts`, AES-256-GCM; `CalendarConnection.encryptedRefreshToken`). `POST /calendar/connect` mints a one-time, cache-backed `state` token (never the raw userId — an OAuth `state` a browser query string carries can't be trusted, so it's opaque and mapped server-side) and returns Google's consent URL with minimal scopes (`calendar.events` + `calendar.freebusy`, `access_type=offline`, `prompt=consent`). `GET /calendar/callback` is public (Google redirects the *browser* here, with no bearer token) — it resolves `state` back to a userId, exchanges the code, and encrypts the refresh token before it ever reaches the database or a log line.
- **`CalendarProvider.real` (`src/providers/calendar.real.ts`)** — raw fetch against Google's OAuth/Calendar REST endpoints (no SDK dependency, matching `payment.real.ts`'s style). Access tokens are never cached: every real call re-exchanges the stored refresh token first, which *is* the "handle expiry" behavior — there's no separate access-token-expired state to track. `pushAvailability` creates/PATCHes a Calendar event per `AvailabilityBlock`; `getBusyTimes` runs a `freeBusy.query` (this is the hook Phase 13's `getOpenSlots` will call); `createMeet` creates an event with `conferenceData` and returns the real Meet link.
- **Graceful revoke/expiry handling** — Google's `invalid_grant` response on a refresh-token exchange is translated into a typed `CalendarAuthRevokedError`. `services/calendar.ts` catches it everywhere, flips `CalendarConnection.status` to `REVOKED`, and surfaces a `CalendarReconnectRequiredError` (routes map this to `409 { reconnectRequired: true }`) — never a raw 500. `createMeetForBooking` (called best-effort from the payment webhook on escrow lock) degrades to a no-op `null` on either a missing or revoked connection: a booking never fails because Meet creation did.
- **New routes**: `POST /calendar/connect`, `GET /calendar/callback` (public), `POST /calendar/disconnect`, `GET /calendar/status`, `GET /calendar/busy-times?date=`, `POST /availability/:id/sync-calendar`.
- **Known, deliberately-left-open gap:** this phase is the provider layer only, by its own kickoff scope — no `apps/web` screen calls any of these endpoints yet. `TalentDashboard.tsx`'s "Availability" tab still has no real calendar sync, and there's no Meet-link UI anywhere in the Order Room. Both are intentionally deferred to Phase 13, which owns the rich availability UX these endpoints exist to support (see `handoff/log.md` Session 18).

## Implemented in Phase 9

- **In-app notifications are real** — `NotifyProvider.inApp` (both mock and real) persists to `Notification` via a shared helper (`src/providers/notify.shared.ts`); there's no meaningful "mock in-app notification" distinct from a real one, since the table is our own DB either way. `GET /notifications` (paginated, `unreadCount` alongside the envelope) and `POST /notifications/:id/read` (owner-scoped, idempotent) are the read/ack side (`src/services/notifications.ts`).
- **Email (SendGrid) + SMS (Twilio) are real** (`src/providers/notify.real.ts`, raw fetch, no SDK) — `email()` renders a template via the new registry (`src/lib/notificationTemplates.ts`; "localisable" is a real, load-bearing mechanism — every renderer takes a `locale` and falls back to `en` — but only `en` content ships, same proportionate-stub pattern as `payment.stripe.ts`). `verify_email`/`reset_password` (referenced by Phase 4's `auth.ts` since the start, never actually implemented until now) now render for real too.
- **Async delivery via a job queue, with retry + backoff** (`src/jobs/` — a new top-level concern, not a `*Provider`, per `features.md`'s own architecture section listing "jobs" separately). `notificationQueue.mock.ts` is an in-process retry loop (3 attempts, short exponential backoff) for dev/test; `notificationQueue.real.ts` is BullMQ-on-Redis (`attempts: 3, backoff: exponential 1s`), selected via `JOB_QUEUE_PROVIDER=bullmq`. Both call the exact same processor (`notificationWorker.ts`) — only the retry/scheduling mechanism differs.
- **`NotificationPreference`** — per-user, per-channel (`emailEnabled`/`smsEnabled`) opt-out, `GET`/`PATCH /notifications/preferences`. No row = both enabled by default. In-app is never gated by this (not the legally-sensitive channel; email/SMS unsubscribe is) — only `enqueueEmailNotification`/`enqueueSmsNotification` check it.
- **Domain events now actually publish notifications**: `booking_created` (new — `POST /bookings`), `deliverables_provided` (new — `PATCH /bookings/:id/deliver`), `new_message` (new — `POST /order-rooms/:id/messages`, notifies the *other* participant, never the sender), plus email added alongside the *existing* Phase 6/7 in-app-only calls: `payment_escrow_locked`, `payment_released`, `payment_refunded` (`services/payment.ts`), `kyc_verified`/`kyc_failed` (`services/kyc.ts`). `tagging_done`/`calendar_disconnected` stay in-app-only — not worth an email.
- **`User.phone` (new, nullable)** — SMS has a real recipient column to key off, but no phase through Phase 9 collects one at registration/onboarding. `enqueueSmsNotification` skips silently (not an error) when it's null — a real, flagged gap, not a fabricated data source.
- **Tests, the gate's own list, all covered**: `jobs/notificationQueue.mock.test.ts` (retry-with-backoff, gives-up-after-max-attempts, fire-and-forget), `providers/notify.real.test.ts` + `providers/notify.shared.test.ts` (SendGrid/Twilio HTTP mechanics, template rendering, in-app persistence), `services/notifications.test.ts` (dispatch + preference-respecting, **user-scoping** on list/unread/mark-read — a cross-account leakage attempt is explicitly asserted to 404, not succeed), `routes/notifications.test.ts`, and new assertions in `routes/bookings.test.ts`/`routes/orderRooms.test.ts` for the three new domain-event hooks.
- **Known, deliberately-left-open gap:** `Settings.tsx`'s existing "Notifications" toggle UI (5 local categories: bookings/messages/payments/reminders/marketing) is still fully local state, unwired to `GET/PATCH /notifications/preferences` — but that entire screen has no backend wiring of any kind yet (pre-existing, not introduced by this phase), and its category granularity doesn't map onto the simpler `emailEnabled`/`smsEnabled` model this phase built. Wiring it is a `Settings.tsx`-wide pass, not something to fold in here.

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
