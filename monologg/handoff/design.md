# Monologg — Design & Architecture Reference

**Last updated:** 2026-08-03 (Session 48: Phase 12B — Supabase Auth: Google OAuth, Magic Link, Email OTP)
**Status:** Full-stack product. All 18 phases of `features.md` (0–17) + Phase 12B Supabase Auth identity bridge are built. Real Postgres/Prisma backend, real auth (custom JWT + Supabase Auth bridge), real escrow/payments, real KYC + AI style-tagging, real calendar/notifications, design tokens, production hardening, Media Kit/Verification/Physical-Attributes, rich time-slot availability, project applications, public marketplace profile, external-visitor deferred booking flow, and Supabase Auth identity bridge (Google OAuth, magic link, email OTP).
**This is a living document** — update it whenever the stack, a page, or a PRD gap changes, in the same session as the change. See `README.md` for the full update policy, and `implementation-plan.md` for current status at a glance.

This document is the single place to understand *what Monologg is*, *what's actually been built*, and *what stack decisions govern it*. It's written for whoever picks this project up next — a new developer, a new AI agent, or a PM checking status.

---

## 1. What is Monologg

Monologg is a **marketplace connecting performing-arts talent with clients who want to book them** — described in the original spec as "a brief-to-booking pipeline for performing arts and the creator economy."

- **Talent (Creators):** Actors, Comedians, Voice-Over Artists, Comperes, plus an extended set (Pastors/Speakers, Musicians, Content Creators, Streamers). They build a bookable storefront profile, set rate cards, and get paid.
- **Clients (Employers):** Casting leads, brand agencies, event coordinators. They post a project brief, browse verified talent, and book + pay through the platform.
- **Core promise:** verified talent profiles → discovery → scheduling → escrow-protected payment → an "Order Room" workspace per booking.

The product is deliberately **role-adaptive**: the same app shell serves both sides, with the accent color flipping between Talent-red and Client-purple depending on which role scope wraps the current screen (`.role-talent` / `.role-client` in the CSS — see [Section 5](#5-design-system)).

### Source documents (the real PRD)

The original product brief, UX spec, and a design-system prompt live in `apps/web/src/imports/`:

| File | What it is |
|---|---|
| `Monologg_Beta_PRD_PDF.pdf` | The original, current product requirements document |
| `monologg_ux_spec.md` | The real, current UX architecture spec — sitemap, every screen, every flow, all microcopy, error/empty/loading states (PRD v1.4.0 aligned) |
| `historical-drafts/MONOLOGG_DESIGN_SYSTEM.md` | An earlier design-system draft (red/purple/green/gold on off-white, Inter typeface) — **superseded**, kept for record only |
| `historical-drafts/monologg_design_prompt.md` | A later, more detailed design-system + build prompt (dark-mode-first, gold accent, DM Serif Display + Inter) — also **superseded** by what was actually built |
| `historical-drafts/monologg-ux-spec-early-draft.md` | An earlier, shorter (739-line) draft of the UX spec, superseded by the 1309-line current version above |
| `reference-screenshots/` | 18 original Figma design screenshots (~18MB) — historical visual reference only, not imported or used by any running page |

**Important:** neither of the two `historical-drafts/` design-system documents matches the colors/fonts actually implemented in the running app (which uses mono-red/mono-purple on a warm off-white/near-black canvas, General Sans + Plus Jakarta Sans — see Section 5). Treat everything under `historical-drafts/` as **historical design exploration**, not current spec — that's exactly why it's separated from `monologg_ux_spec.md` and the PRD PDF, which remain current and authoritative.

---

## 2. What's actually implemented (vs. the PRD's full vision)

The original PRD described a large product; `features.md` extended it further (rich availability, two-sided applications, a public profile, external-visitor booking). **Both are now built end-to-end** — real backend, real database, real money movement — not a frontend-only mock prototype. `VITE_API_MODE=live` is what makes any of the "real" behavior below actually active; the default `mock` mode still renders every screen against static fixtures for demo/offline use, unchanged in behavior from the original prototype.

| PRD screen(s) | Implemented as | Status |
|---|---|---|
| WEB-01/02/03 (Landing, waitlist + live) | `LandingPage.tsx` | Built, static/marketing content |
| PWA-01 (Welcome/Register/Sign In/Forgot) | `AuthFlow.tsx` | Real auth as of Phase 4 (see Section 4) |
| PWA-02–06 (Niche, Upload, AI processing, Tags, Rate Cards) | `CreatorOnboarding.tsx` | Real KYC + AI style-tagging as two independent systems as of Phase 7 — the old scripted "Thespian AI" animation is gone in `live` mode |
| PWA-07 (Storefront) | Embedded inside `TalentDashboard.tsx` ("My Storefront" tab) **plus** a fully public, logged-out version at `/[handle]` (`PublicStorefront.tsx`, Phase 15) | Built |
| PWA-08 (Scheduling) | Embedded inside `TalentDashboard.tsx` ("Availability" tab) | Real, server-authoritative day-detail + slot editor as of Phase 13 (default-free rule, recurring templates, `getOpenSlots`) |
| PWA-09 (Client Brief) | `ProjectBrief.tsx` | Built; gained an applicant-cap field in Phase 14 |
| PWA-10 (Casting Directory) | Embedded inside `ClientDashboard.tsx` ("Find Talent" tab) | Built; gained Physical Attributes filters in Phase 12A |
| PWA-11 (Calendar/Checkout sheet) + PWA-12 (Payment) | `Checkout.tsx` | Real, slot-aware, server-computed-fee escrow checkout as of Phase 13 — the old "FINCRA"/`setTimeout` demo path only remains for mock mode |
| PWA-13 (Order Room + escrow bar) | `OrderRoom.tsx` | Built; chat is gated on `ESCROW_LOCKED` as of Phase 16 (a real invariant, not just a visual bar) |
| PWA-14/15/16 (Talent Projects browse/detail/applications) | `TalentDashboard.tsx`'s "Projects" tab | Real, server-enforced applicant cap as of Phase 14 |
| PWA-17 (Client applicant management) | `ClientDashboard.tsx` | Real shortlist/reject/select as of Phase 14 |
| PWA-18 (External-visitor booking) | `ExternalBookingEntry.tsx` at `/book/:creatorId` | Real, full logged-out flow as of Phase 16 — deferred account creation, escrow-first |
| PWA-19 (Post-payment set-password/magic-link) | `SetPassword.tsx` at `/set-password` | Built, Phase 16 |
| PWA-20 (Media Kit) | `MediaKitManagement.tsx` | Built, Phase 12A |
| Verification Video | `VerificationVideo.tsx` | Built, Phase 12A — file upload, not a live in-browser recorder (deliberate scope call, see `log.md` Session 23) |
| SET-01–05 (Settings) | `Settings.tsx` | Built; gained Physical Attributes editor (Phase 12A) |
| SYS-01–04 (Notifications, Transaction History, Help, Terms) | All real as of Phase 9/10 — see Section 3 | Built |
| Client/Creator Onboarding as fully separate PRD-numbered screens | `CreatorOnboarding.tsx` / `ClientOnboarding.tsx` | Built, simplified relative to spec |

There is also a page not in the original PRD at all: **`/design-system`** (`DesignSystem.tsx`) — added during this engagement as a living reference for the design tokens and shared components (see Section 5).

**One structural gap Phase 17's QA pass confirmed, despite the `PWA-XX` naming throughout this whole section implying a Progressive Web App: there is no `manifest.json`, no service worker, and no PWA plugin anywhere in `apps/web`.** Installability and offline behavior were never built in any phase — see Section 6.

---

## 3. Tech stack

### Frontend (this is the entire stack today)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18.3.1 + TypeScript | |
| Build tool | Vite 6.3.5 | Two configs exist: `vite.config.ts` (app dev/build) and `vite.config.designsystem.ts` (builds a standalone snapshot of the `/design-system` page) |
| Routing | `react-router` 7.18.2+, `createBrowserRouter` | Client-side only; see `src/app/routes.tsx` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | No `tailwind.config.js` needed (v4 auto-configures); see `src/styles/tailwind.css` |
| Design tokens | Plain CSS custom properties in `src/styles/tokens.css` | Single source of truth — see Section 5 |
| Animation | `motion` (Framer Motion successor), package name `motion/react` | Durations/eases mirrored in `src/lib/motionTokens.ts` since JS can't read CSS custom properties |
| Icons | `lucide-react` | ~57 distinct icons used across the app |
| Utility | `clsx` + `tailwind-merge` via `src/lib/utils.ts` (`cn()` helper) | Standard shadcn-style class merging |
| Fonts | General Sans (display), Plus Jakarta Sans (body), JetBrains Mono (data) | **Self-hosted since Phase 11** — 11 `@font-face` rules in `src/styles/fonts.css` pointing at `public/fonts/`, no CDN dependency, no offline/restricted-network fallback risk |
| Standalone builds | `vite.config.standalone.ts` (hash-router app build) | For the double-clickable, no-server HTML files — see Section 7 |
| Type checking | TypeScript 5, `strict: true` (`tsconfig.json`) | Added in `features.md` Phase 0 — first time this codebase has ever been type-checked (previously esbuild-transpiled only, types stripped not verified) |
| Linting | ESLint 9 (flat config), `typescript-eslint` + React hooks/refresh plugins | `npm run lint` — CI-blocking on errors (0 currently), 7 pre-existing warnings are non-blocking |
| Formatting | Prettier 3 | `npm run format` / `format:check` — available, not yet a CI gate; codebase predates it and hasn't been bulk-reformatted |
| Testing | Vitest 3 | `npm test` — CI-blocking; full unit/route/component suite, 71 `apps/web` tests as of Phase 17 |
| E2E / cross-browser / a11y | Playwright 1.62 + `@axe-core/playwright` (`apps/web/e2e/`) | **New in Phase 17** — not CI-wired yet; run manually, Chromium/WebKit/Firefox against the mock-mode build. See `monologg/qa/2026-07-31-phase17/` |
| CI | GitHub Actions, `.github/workflows/monologg-ci.yml` (repo root) | `typecheck → lint → test → build → audit`, plus a `docker` job (Phase 12); path-scoped to `monologg/**`, blocks merge on failure |

**Full dependency list, post-cleanup (2026-07-27):** `clsx`, `lucide-react`, `motion`, `react-router`, `tailwind-merge` (runtime) + `@tailwindcss/vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite` (dev/build). Everything else that shipped in the original Figma Make export — `@emotion/react`, `@emotion/styled`, `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-themes`, `react-day-picker`, `react-dnd`, `react-dnd-html5-backend`, `react-hook-form`, `react-popper`, `react-resizable-panels`, `react-responsive-masonry`, `react-slick`, `recharts`, `sonner`, `tw-animate-css`, `vaul`, plus `vite-plugin-dts` and its `@microsoft`/`@rushstack` transitive tree — was never imported by any page and has been removed (`node_modules` went from 292MB to 134MB). See `bug.md` and `log.md` for what broke and how it was caught.

### Backend, database, authentication — where things actually stand

**A real Fastify server, real authentication, and real domain endpoints now exist** (Phases 3–5) — this is no longer a 100%-frontend prototype. Most dashboard screens read real data when `VITE_API_MODE=live`, though that's still not the shipped default (see below).
- **Server is real.** `apps/api/src` is a running Fastify app (`pnpm --filter @monologg/api run dev` → `http://localhost:3001`): CORS, Helmet, global + per-route rate limiting, structured pino logging, a sanitizing central error handler, `GET /api/v1/health` (real DB round-trip), the full `/api/v1/auth/*` surface, and 7 domain resources (`creators`, `rate-cards`, `availability`, `briefs`, `talent`, `bookings`, `order-rooms`) — Phase 5.
- **Database is real, migrated, and now actually read from `apps/web` in `live` mode.** `apps/api/prisma/schema.prisma` (15 models + `Brief.status`, Phases 2/5) is migrated against the Supabase project provisioned in Phase 1, and `apps/api/prisma/seed.ts` reproduces the prototype's demo data there. In the default `mock` mode, every screen still renders the same hardcoded JavaScript constants as before (e.g. `TALENTS`, `PROJECTS`, `ORDERS` in `ClientDashboard.tsx`/`TalentDashboard.tsx`) — nothing about the shipped experience changed. Four api-client methods (`getClientStats`/`getTalentStats`/`listTalentActivity`/`getShortlistedTalentIds`) and `getAvailability()`'s UI consumer stay mock-only permanently: no stats/activity/shortlist resource is defined anywhere in `features.md`, and the real `AvailabilityBlock` shape is genuinely different from the mock's fixed weekly grid (already flagged in `@monologg/types` as superseded by Phase 13) — see `log.md` Session 15 for the reasoning.
- **Authentication is real** (Phase 4, Session 14) — see [Section 4](#4-auth-flow-reality-detail) for the full detail. Register/login/logout/refresh/verify-email/forgot-password/reset-password all hit real endpoints, argon2id-hashed passwords, rotating JWT refresh tokens with reuse-detection. `AuthFlow.tsx` calls these through `api-client.ts`; in the default `VITE_API_MODE=mock`, the UI behaves exactly as before (no login required to reach any page) — only `live` mode actually gates anything.
- **No persistence in the frontend** beyond the light/dark theme preference (`localStorage`, key `monologg-theme`, `src/app/Root.tsx`) and, in `live` mode, the refresh token (`localStorage`, key `monologg_refresh_token`). Domain UI state still resets on refresh until Phase 5.
- **Payment/escrow backend is real (Phase 6)**: Paystack-first `PaymentProvider` (Stripe/Airwallex stubbed behind the same interface), a ledger-based escrow hold (`POST /bookings/:id/pay` → `initEscrow` → client pays on Paystack → `POST /webhooks/paystack` — the *only* authority that sets `ESCROW_LOCKED`, HMAC-SHA512-verified and idempotent via a DB-unique `(paymentId, type, eventId)` constraint) through to release (`PATCH /bookings/:id/approve`, base−11% to the talent) and a dispute/refund path. `Checkout.tsx` itself wasn't wired to any of this yet at the time this phase shipped — that gap closed in Phase 13 (see below).
- **KYC + AI style-tagging backend is real (Phase 7)**, and built as two fully independent systems (X3): `KycProvider` (`POST /creators/me/verify` → `PROCESSING` → poll `GET /creators/me/verify` → `VERIFIED`/`FAILED`, the only writer of `Creator.verification`) and `AiTaggingProvider` (media confirm → real `taggingStatus` job → `POST /creators/me/media/:id/confirm`/`GET .../media/:id`, the only writer of `Creator.styleTags`). `CreatorOnboarding.tsx`'s old scripted "Thespian AI Verified" animation is gone: `live` mode now drives the processing view from the real job state. **Still open:** no screen anywhere actually collects the legal name/DOB/ID fields needed to call `POST /creators/me/verify` — a creator can't yet self-serve identity verification from the UI.
- **Google Calendar sync is real (Phase 8, provider layer)**: OAuth connect/callback/disconnect, encrypted refresh tokens (AES-256-GCM), `getBusyTimes`, and `createMeet` (real Meet links, best-effort-wired into the escrow-lock webhook). No `apps/web` screen calls any of it directly — deliberate, the rich availability UX landed in Phase 13 instead.
- **Notifications backend is real (Phase 9)**: in-app persistence + paginated unread count, async/retrying email+SMS (SendGrid/Twilio behind `NotifyProvider`, BullMQ-on-Redis in prod), per-channel opt-out (`NotificationPreference`).
- **System screens are real (Phase 10)**: transaction history (owner-scoped, fee breakdown), help & support (FAQ + tickets), versioned Terms/Privacy with recorded acceptance.
- **Design tokens fully self-hosted (Phase 11)** — see Section 3's frontend table.
- **Production-hardened (Phase 12)**: CSP `default-src 'none'`, log redaction, `pnpm audit` CI-blocking, per-file test-coverage thresholds on money/auth/state modules, `/ready`/`/metrics`, optional Sentry, Docker images for both apps + `docker-compose.yml`.
- **Media Kit, Verification Video, Physical Attributes (Phase 12A)**: auto-rendered/uploadable Media Kit PDF, server-authoritative (real ISO-BMFF parser, not ffprobe) verification-video duration check, six privacy-non-negotiable Physical Attributes (consent-versioned, hard-deletable, visibility-scoped). **Reviewer decisions on verification videos have no real access control — any authenticated user can approve/reject any recording, including their own.** Flagged as a known gap since this phase; **confirmed and demonstrated as a real security finding in Phase 17** (self-approval proven) — still open, needs a real moderator role.
- **Rich availability + real slot-aware checkout (Phase 13)**: server-authoritative `getOpenSlots`/`bookSlot` (Postgres advisory-lock-serialized), default-free rule, recurring templates. `Checkout.tsx` is now genuinely wired to the Phase 6 escrow backend — the old "FINCRA"/`setTimeout` demo path only remains in mock mode.
- **Two-sided project applications (Phase 14)**: server-enforced applicant cap (same advisory-lock pattern as slot booking), full apply/shortlist/reject/select/withdraw lifecycle, selection converts straight into a real booking.
- **Public marketplace profile (Phase 15)**: `/[handle]` (currently the creator's cuid, not a real slug) renders fully logged-out with real prices/media/badges. Client-side-only Open Graph/Twitter meta injection — real crawler bots (which don't execute JS) won't see it, an explicitly flagged, out-of-scope SSR tradeoff.
- **External-visitor booking, deferred account, escrow-first (Phase 16, flagship)**: a logged-out guest can book a talent, fund escrow, and get a `User`+`Client` auto-created from checkout info — surfaced only once escrow is confirmed (`TODO(conflict:X7)`, see `log.md` Session 27), never before. Chat is now gated on `ESCROW_LOCKED` globally, closing a real pre-existing gap (internal bookings too, not just this flow).
- **Independent QA/security/UAT pass (Phase 17)**: see the Status note at the top of this document and Section 6 below for the full, current list of what's still open before production cutover.

---

## 4. Auth flow reality (detail)

`src/app/pages/AuthFlow.tsx` implements four in-page views (`splash`, `register`, `login`, `forgot`) as local component state, not real routes. As of Phase 4 (Session 14), these call real endpoints through `apiClient` — but **only when `VITE_API_MODE=live`**; the default `mock` mode reproduces the exact original prototype behavior below, so nothing about running the app locally changed unless you explicitly flip the mode.

- **Register:** collects name/email/password/role (Talent or Client) + a terms checkbox client-side. `mock` mode: routes to `/onboarding` (Talent) or `/onboarding/client` (Client) immediately, no network call — unchanged from before. `live` mode: calls `POST /api/v1/auth/register` (argon2id-hashes the password server-side, creates the `User` + matching `Creator`/`Client` row, sends a mock verification email), then navigates the same way on success or shows an inline error on failure (e.g. email already registered). The form only ever collects name/email/password/role — `location`/`niche`/`orgName`/`orgType` are optional server-side (default to empty/`CONTENT_CREATOR`) since they're actually collected later in `CreatorOnboarding.tsx`/`ClientOnboarding.tsx`, which aren't wired to the backend yet (Phase 5+).
- **Login:** `mock` mode: same email-substring rule as before (`"client"`/`"brand"` → `/client`, else `/dashboard`), no network call. `live` mode: calls `POST /api/v1/auth/login`, which returns a short-lived access token + a rotating refresh token on success (or a generic "Invalid email or password" on failure — no user-enumeration signal); the returned user's real `userType` decides the redirect. Tokens: access token in memory only (cleared on reload), refresh token in `localStorage` (`monologg_refresh_token`) so it survives a reload.
- **Forgot password:** `mock` mode: shows the "check your email" confirmation immediately, no network call, as before. `live` mode: calls `POST /api/v1/auth/forgot-password`, which always returns success regardless of whether the email exists (no enumeration).
- There are also two direct-bypass buttons on the login screen ("Talent" / "Client") that skip credentials entirely and route straight to the respective dashboard — left untouched, an explicit demo shortcut rather than a fake login.
- **Route protection:** `apps/web/src/app/RequireAuth.tsx` wraps every session-requiring page (`dashboard`, `client`, `order/:id`, `brief`, `checkout`, `settings`, `transactions`, `support`, `media-kit`, `verification`, via a `protect()` helper in `routes.tsx`). In `mock` mode it's a no-op (every route stays reachable directly by URL); in `live` mode, no session redirects to `/auth`. **Deliberately outside `RequireAuth`, by design**: `book/:creatorId` (Phase 16's external booking entry — the whole point is a logged-out visitor), `set-password` (Phase 16 — this IS how a fresh guest gets a session), `:handle` (Phase 15's public storefront, registered last in the route tree since it's a single dynamic segment at the root).
- **Server-side:** `requireAuth`/`requireRole`/`requireOwner` (`apps/api/src/middlewares/auth.ts`) are the access-control primitives every protected route uses. Phase 16 added a real escrow-first gate on top: `routes/orderRooms.ts` refuses any participant (even a legitimate one) access to the order room until `Booking.state === "ESCROW_LOCKED"`.

---

## 5. Design system

### Single source of truth: `apps/web/src/styles/tokens.css`

All colors, radii, shadows, motion durations/easings, and (a partial) type scale are defined once as CSS custom properties on `:root`, with overrides under `.dark` (dark mode), `.role-talent` and `.role-client` (accent color scoping). Every component and page references these via `var(--token-name)` — see the live, self-updating reference at **`/design-system`** (route) or the generated static snapshot `handoff`-adjacent artifact.

Key token groups:
- **Neutrals:** `--color-bg-canvas/surface/elevated`, `--color-hairline`, `--color-text-primary/secondary/tertiary`
- **Brand ramps:** `--color-red-*` (Talent), `--color-purple-*` (Client), each with `-press`/`-soft`/`-glow`/`-on` variants
- **Role-adaptive accent:** `--color-accent*` — aliases to red under `.role-talent`, purple under `.role-client`. This is how one shared `<Button>` looks different depending which side of the app it's rendered in.
- **Semantic:** `--color-success/-warning/-error` (+ `-bg` variants), `--color-overlay`/`--color-overlay-strong` (modal scrims)
- **Radius:** `--radius-sm` (8px) → `--radius-2xl` (28px), `--radius-full`
- **Shadow:** `--shadow-card/elevated/modal/focus`
- **Motion:** `--duration-fast/med/slow`, `--ease-out/spring` — mirrored as plain JS numbers in `src/lib/motionTokens.ts` for Framer Motion, which can't read CSS custom properties
- **Type scale:** `--font-size-xs` through `--font-size-5xl` — adopted for every literal px size with an exact token match as of Phase 11 (4 files); sizes with no exact match (15px, 19px, 26px, etc.) remain ad-hoc literals, an intentionally incomplete adoption, not a bug. `--font-weight-*`/`--line-height-*` tokens were also added in Phase 11 but aren't consumed by any call site yet.
- **Landing-page-only additive tokens:** `--gradient-brand` / `--gradient-brand-soft` (a red→purple diagonal blend — Monologg's own two-sided accent, used as an atmospheric hero background and for gradient-fill stat cards) and `--shadow-cutout` / `--shadow-cutout-sm` (a hard-offset "poster" shadow — no blur — used in place of `--shadow-card` on marketing surfaces). These are purely additive: nothing existing changed value, and they're only referenced from `LandingPage.tsx`, so the rest of the app (dashboards, Order Room, Settings, etc.) is unaffected.

### Shared components (`src/app/components/ui/`)

| Component | Purpose |
|---|---|
| `Button.tsx` | primary/secondary/ghost/destructive/icon variants |
| `Input.tsx` | text input, token-driven |
| `Modal.tsx` | Scrim + positioning wrapper (`align: center\|end\|right`, `strength: default\|strong`) — owns the overlay color and backdrop blur; bespoke panel content stays per-call-site |
| `Avatar.tsx` | Circular initials/icon avatar, 4 sizes, optional `src` for a photo (falls back to initials/icon if the image fails to load) |
| `Badge.tsx` | Status pill/chip, 5 tones × 3 sizes |
| `FormField.tsx` | Uppercase caption label + control wrapper |
| `Sidebar.tsx` / `BottomNav.tsx` | Generic, prop-driven nav shared by `TalentDashboard` and `ClientDashboard` (previously duplicated per-file) |

### Two dead CSS files kept for reference only

`src/styles/theme.css` (generic shadcn starter) and — as of the file cleanup pass — the `DoyinXMonologgCopy/` folder were removed entirely; they were never imported and conflicted with the real tokens. (Documented here in case anything references them in old notes — they no longer exist on disk.)

---

## 6. What is NOT built yet — the real, current gap list (post-Phase-17)

Every gap this section originally tracked (no backend, no auth, no payments, no AI verification, no calendar sync, no notifications, no system screens, no design-token adoption, no rich availability, no applications, no public profile, no external booking) **is now closed** — all 18 `features.md` phases (0–17) are built. This section is no longer "what's not built"; it's **what Phase 17's independent QA pass found still standing between this codebase and a real production cutover.** Full detail in `monologg/qa/2026-07-31-phase17/` — this is a summary, not the authoritative record.

1. **No PWA install/offline infrastructure exists.** No `manifest.json`, no service worker, no PWA plugin anywhere in `apps/web` — verified directly (0 manifest links, 0 service-worker registrations), despite every screen in this document being named `PWA-XX` since Phase 0. Building this is real, scoped feature work for a dedicated phase, not something Phase 17 (a QA pass) does itself.
2. **A confirmed, demonstrated security gap**: `PATCH /verification-recordings/:id/review` has no reviewer/ownership check at all — any authenticated user, including a recording's own creator, can approve or reject it. Flagged as a known gap since Phase 12A; Phase 17 proved the sharpest version (self-approval) with a dedicated test. **Must be closed (a real moderator role) before real users are onboarded** — not fixed in Phase 17 itself, since building a role system is feature work.
3. **Accessibility contrast debt.** One systemic token (`--color-text-tertiary`) was fixed in Phase 17 (see `bug.md` #15), but ~45 of 57 route×browser combinations still fail serious/critical `color-contrast` checks across dozens of *other*, unrelated color pairs (accent-on-soft-background badges in every brand ramp, opacity utilities, component-local inline colors). Needs a dedicated design-system remediation pass with sign-off on new brand colors.
4. **UAT and NDPA legal sign-off are both explicitly PENDING.** An agent can't recruit real talent/client panelists or grant legal sign-off — `monologg/qa/2026-07-31-phase17/uat-plan.md` and `ndpa-data-inventory.md` are prep documents (a structured test script, a personal-data inventory), not completed reviews.
5. **No staging environment with test-mode real providers exists** (Paystack test keys, Smile Identity sandbox, Google Calendar test OAuth). Phase 17's automated passes ran against mock-mode `apps/web` + the real dev Supabase database instead — a real, if lesser, form of verification, but not a substitute for UAT against test-mode providers.
6. **Minor, lower-stakes items**: a real load-testing setup (k6/artillery against a live, running server) doesn't exist — Phase 17 substituted genuine `Promise.all` concurrency against the real dev DB, which proved the actual safety invariants (no double-book/double-charge/cap-overrun) but isn't the same as production-scale load; Lighthouse CI budgets were never run; dynamic-type/OS-zoom testing isn't meaningfully automatable and needs real-device QA; `apiClient.getOgImageUrl()` 404s in mock mode (Phase 15, `bug.md`).
7. **Type scale tokens still aren't applied everywhere** (Phase 11 adoption was intentionally partial) — cosmetic/consistency debt, not a functional gap.

**No production cutover until items 2 and 4 above are closed**, per Phase 17's own stated gate — see `monologg/qa/2026-07-31-phase17/README.md`.

---

## 7. Where to run it / see it

**As of `features.md` Phase 1, this is a pnpm workspace** (`monologg/pnpm-workspace.yaml`): `apps/web` (the client, formerly the standalone `app/` folder), `apps/api` (a real running Fastify server as of Phase 3–4 — see below), `packages/types` (shared zod schemas/DTOs). Install once from `monologg/` with `pnpm install` (or `npx pnpm install` if pnpm isn't installed globally) — this links all three packages together.

- **Local dev app:** from `monologg/`, `pnpm dev` (or `cd apps/web && npm run dev`) → `http://localhost:5173`. Routes: `/`, `/auth`, `/onboarding`, `/onboarding/client`, `/dashboard`, `/client`, `/order/:id`, `/brief`, `/checkout`, `/settings`, `/transactions`, `/support`, `/media-kit`, `/verification`, `/legal/terms`, `/legal/privacy`, `/design-system`, plus the logged-out-reachable `/book/:creatorId`, `/set-password`, and `/:handle` (public storefront, catch-all, registered last). Most are wrapped in `RequireAuth`, a no-op in the default `VITE_API_MODE=mock`; the three logged-out routes are deliberately outside it (see Section 4).
- **Local dev API:** `pnpm --filter @monologg/api run dev` → `http://localhost:3001`. Needs `apps/api/.env` (copy `.env.example`) — validated at boot by `src/config/env.ts`; missing/malformed vars fail fast with a specific message.
- **Docker (Phase 12):** `docker-compose up --build` from `monologg/` runs the whole stack locally (postgres+redis+api+web, all-mock except `CACHE_PROVIDER=redis`) — see `apps/api/Dockerfile`, `apps/web/Dockerfile`, `docker-compose.yml`. CI's `docker` job builds both images on every push; that's the real acceptance check for this piece, not local say-so (no Docker daemon was available in the session that wrote the Dockerfiles).
- **Cross-browser/a11y (Phase 17):** `cd apps/web && pnpm run build && node_modules/.bin/playwright test --config=e2e/playwright.config.ts` — runs the golden-path/responsive/accessibility suite against Chromium/WebKit/Firefox. Not CI-wired yet.
- **Real-DB integration + concurrency tests:** `pnpm --filter @monologg/api run test:integration` (after `db:seed`) — runs `phase5`/`phase6`/`seed`/`phase17.concurrency` against the real dev Supabase project. Not CI-wired (no Supabase secrets configured in CI), run manually.
- **Design system reference:** `http://localhost:5173/design-system`, or regenerate the standalone static file with `npm run build:designsystem` from `apps/web/` (outputs to `dist-designsystem/`, wraps into a single HTML file for sharing).
- **Standalone, no-server HTML files** (double-click, open in any browser, no dev server needed): `monologg-app.html` and `monologg-design-system.html` at the project root. The app version uses a hash router (`#/dashboard` style URLs) instead of the browser-history router the localhost version uses, since `file://` pages can't use `pushState`. Regenerate after any code change:
  ```
  cd apps/web
  npm run build && npm run build:standalone   # app
  npm run build:designsystem                   # design system
  ```
  then re-inline the built JS/CSS into the two root-level HTML files (ask whoever/whatever is continuing this project to re-run the inlining step, or script it — it's a few lines of Python, see `log.md`).
- **Data seam:** every screen reads/writes through `apps/web/src/lib/api-client.ts`, controlled by `VITE_API_MODE` (`mock`, the default — returns fixtures from `apps/web/src/mocks/`; `live` — calls the real `/api/v1/...` endpoints for talent discovery, briefs, rate cards, bookings, and order-room messages as of Phase 5; stats/activity/shortlist/availability-calendar stay mock-only regardless of the flag, see Section 6). See `apps/web/.env.example`.
- **Database (Supabase + Prisma):** a Supabase Postgres project exists (`apps/api/.env`, gitignored, not committed — see `apps/api/.env.example` for the shape), migrated per `apps/api/prisma/schema.prisma` (15 models, Phase 2) and seeded via `apps/api/prisma/seed.ts` (idempotent — one `Booking` per `BookingState`). Both connection URLs route through Supabase's **pooler host** (`aws-0-eu-west-1.pooler.supabase.com`), just different ports: `DATABASE_URL` is the **transaction pooler** (port 6543, `?pgbouncer=true`) — what the app/Prisma client uses at runtime; `DIRECT_URL` is the **session pooler** (port 5432, same host) — what `prisma migrate` uses. Neither uses the raw direct host (`db.<ref>.supabase.co`): that host is IPv6-only unless the project's IPv4 add-on is purchased, and `prisma migrate dev` failed against it in Session 12 in this network — the session pooler is Supabase's own documented IPv4-compatible substitute for tools needing session semantics (prepared statements, advisory locks), and is what actually gets used. Run `pnpm --filter @monologg/api run verify:db` to smoke-test both, `db:seed` to (re-)seed, `test:integration` to run live-DB tests (not CI-gated — see `apps/api/vitest.integration.config.ts`). Supabase Auth and the Data API remain deliberately **not** enabled.
- **Prisma is pinned to 6.19.3, not latest (7.x):** Prisma 7 removed schema-level `datasource { url / directUrl }` in favor of a `prisma.config.ts` + driver-adapter system, which doesn't match the PRD's specified pattern. Revisit this pin if a later phase has a specific reason to move to Prisma 7's model.
- **Payment provider allowlist** lives in `apps/api/src/config/paymentProviders.ts` (X1: `paystack`/`stripe`/`airwallex`, never `fincra`) — built ahead of Phase 3's full provider-interface work since Phase 2's own acceptance criteria required it; Phase 3 is expected to import this rather than redeclare it.
- **Authentication (Phase 4):** `apps/api/src/routes/auth.ts` — full `/api/v1/auth/*` surface; `services/auth.ts` (argon2id, JWT issue/verify, refresh-token hashing); `middlewares/auth.ts` (`requireAuth`/`requireRole`/`requireOwner`); `providers/cache.*` (in-memory mock / Redis real — refresh-token denylist, verify/reset token TTLs). `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (≥32 chars) are required env vars, validated at boot. See [Section 4](#4-auth-flow-reality-detail) for the client-side half.
- **CI:** `.github/workflows/monologg-ci.yml` (repo root — the only place GitHub Actions looks), path-scoped to `monologg/**`, runs `pnpm install --frozen-lockfile → typecheck → lint → test → build` from `monologg/`.
- **Source control:** `github.com/adedoyin899/mono2`, this project under the `monologg/` folder (that repo also holds an unrelated `gstack` project at its root — kept deliberately separate). Push access is via a repo-scoped deploy key (`~/.ssh/id_ed25519_mono2`, host alias `github.com-mono2`), not the account's general SSH key.

See `log.md` for exactly how `apps/web` came to exist (as `app/`, then moved) and what was changed inside it, `bug.md` for defects found and fixed, `process.md` for a plain-language walkthrough of the whole engagement, `features.md` for the full phase-by-phase build spec (all 18 phases now built), and `monologg/qa/2026-07-31-phase17/` for what's still open before production cutover.
