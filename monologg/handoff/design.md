# Monologg — Design & Architecture Reference

**Last updated:** 2026-07-29 (Session 15: Phase 5 — core domain endpoints)
**Status:** Frontend prototype / design-preview build, now in git. No backend, database, or real authentication exists yet — see [Section 6](#6-what-is-not-built-yet-gaps-vs-the-prd) before assuming anything works end-to-end. The full-stack build-out is scoped in detail in `features.md` — read that before starting backend work; some facts below (FINCRA, 9%/12% fees, "Thespian AI" as verification) are the **current, stale** state that `features.md` explicitly corrects.
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

The PRD describes a large product (public marketing site with waitlist, full onboarding with AI verification, scheduling with calendar sync, FINCRA payment gateway, admin/system screens, notification center, transaction history, help/support). **The current codebase implements a subset**, built as a single-page React app with client-side mock data and no backend.

| PRD screen(s) | Implemented as | Status |
|---|---|---|
| WEB-01/02/03 (Landing, waitlist + live) | `LandingPage.tsx` | Built, static/marketing content |
| PWA-01 (Welcome/Register/Sign In/Forgot) | `AuthFlow.tsx` | Built as **UI only** — no real auth (see Section 4) |
| PWA-02–06 (Niche, Upload, AI processing, Tags, Rate Cards) | `CreatorOnboarding.tsx` | Built as one linear flow; "Thespian AI" verification is a **timed animation**, not a real AI call |
| PWA-07 (Storefront) | Embedded inside `TalentDashboard.tsx` ("My Storefront" tab) | Built |
| PWA-08 (Scheduling) | Embedded inside `TalentDashboard.tsx` ("Availability" tab) | Built, no real calendar sync |
| PWA-09 (Client Brief) | `ProjectBrief.tsx` | Built |
| PWA-10 (Casting Directory) | Embedded inside `ClientDashboard.tsx` ("Find Talent" tab) | Built |
| PWA-11 (Calendar/Checkout sheet) + PWA-12 (Payment) | `Checkout.tsx` | Built; payment is a **2.5-second `setTimeout`**, not a real gateway. Copy currently says "FINCRA" — **stale**, `features.md` (X1) specifies Paystack-first (+ Stripe/Airwallex), to be corrected when Phase 6 lands |
| PWA-13 (Order Room + escrow bar) | `OrderRoom.tsx` | Built; escrow "release" is local state, not a real transaction |
| SET-01–05 (Settings) | `Settings.tsx` | Built |
| SYS-01–04 (Notifications, Transaction History, Help, Terms) | Partial — a notifications *panel* exists inside the dashboards; no dedicated transaction-history or help/support screens | Not built |
| Client/Creator Onboarding as fully separate PRD-numbered screens | `CreatorOnboarding.tsx` / `ClientOnboarding.tsx` | Built, simplified relative to spec |

There is also a page not in the original PRD at all: **`/design-system`** (`DesignSystem.tsx`) — added during this engagement as a living reference for the design tokens and shared components (see Section 5).

---

## 3. Tech stack

### Frontend (this is the entire stack today)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18.3.1 + TypeScript | |
| Build tool | Vite 6.3.5 | Two configs exist: `vite.config.ts` (app dev/build) and `vite.config.designsystem.ts` (builds a standalone snapshot of the `/design-system` page) |
| Routing | `react-router` 7.13.0, `createBrowserRouter` | Client-side only; see `src/app/routes.tsx` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | No `tailwind.config.js` needed (v4 auto-configures); see `src/styles/tailwind.css` |
| Design tokens | Plain CSS custom properties in `src/styles/tokens.css` | Single source of truth — see Section 5 |
| Animation | `motion` (Framer Motion successor), package name `motion/react` | Durations/eases mirrored in `src/lib/motionTokens.ts` since JS can't read CSS custom properties |
| Icons | `lucide-react` | ~57 distinct icons used across the app |
| Utility | `clsx` + `tailwind-merge` via `src/lib/utils.ts` (`cn()` helper) | Standard shadcn-style class merging |
| Fonts | General Sans (display), Plus Jakarta Sans (body), JetBrains Mono (data) | Loaded via `@import url(...)` in `src/styles/fonts.css` from Fontshare/Google Fonts CDNs — **requires internet access to render correctly**; falls back to system fonts otherwise |
| Standalone builds | `vite.config.standalone.ts` (hash-router app build) | For the double-clickable, no-server HTML files — see Section 7 |
| Type checking | TypeScript 5, `strict: true` (`tsconfig.json`) | Added in `features.md` Phase 0 — first time this codebase has ever been type-checked (previously esbuild-transpiled only, types stripped not verified) |
| Linting | ESLint 9 (flat config), `typescript-eslint` + React hooks/refresh plugins | `npm run lint` — CI-blocking on errors (0 currently), 5 pre-existing warnings are non-blocking (documented in `log.md` Session 9) |
| Formatting | Prettier 3 | `npm run format` / `format:check` — available, not yet a CI gate; codebase predates it and hasn't been bulk-reformatted |
| Testing | Vitest 3 | `npm test` — CI-blocking; one real suite so far, `src/lib/utils.test.ts` |
| CI | GitHub Actions, `.github/workflows/monologg-ci.yml` (repo root) | `typecheck → lint → test → build`, path-scoped to `monologg/**`, blocks merge on failure |

**Full dependency list, post-cleanup (2026-07-27):** `clsx`, `lucide-react`, `motion`, `react-router`, `tailwind-merge` (runtime) + `@tailwindcss/vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite` (dev/build). Everything else that shipped in the original Figma Make export — `@emotion/react`, `@emotion/styled`, `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-themes`, `react-day-picker`, `react-dnd`, `react-dnd-html5-backend`, `react-hook-form`, `react-popper`, `react-resizable-panels`, `react-responsive-masonry`, `react-slick`, `recharts`, `sonner`, `tw-animate-css`, `vaul`, plus `vite-plugin-dts` and its `@microsoft`/`@rushstack` transitive tree — was never imported by any page and has been removed (`node_modules` went from 292MB to 134MB). See `bug.md` and `log.md` for what broke and how it was caught.

### Backend, database, authentication — where things actually stand

**A real Fastify server, real authentication, and real domain endpoints now exist** (Phases 3–5) — this is no longer a 100%-frontend prototype. Most dashboard screens read real data when `VITE_API_MODE=live`, though that's still not the shipped default (see below).
- **Server is real.** `apps/api/src` is a running Fastify app (`pnpm --filter @monologg/api run dev` → `http://localhost:3001`): CORS, Helmet, global + per-route rate limiting, structured pino logging, a sanitizing central error handler, `GET /api/v1/health` (real DB round-trip), the full `/api/v1/auth/*` surface, and 7 domain resources (`creators`, `rate-cards`, `availability`, `briefs`, `talent`, `bookings`, `order-rooms`) — Phase 5.
- **Database is real, migrated, and now actually read from `apps/web` in `live` mode.** `apps/api/prisma/schema.prisma` (15 models + `Brief.status`, Phases 2/5) is migrated against the Supabase project provisioned in Phase 1, and `apps/api/prisma/seed.ts` reproduces the prototype's demo data there. In the default `mock` mode, every screen still renders the same hardcoded JavaScript constants as before (e.g. `TALENTS`, `PROJECTS`, `ORDERS` in `ClientDashboard.tsx`/`TalentDashboard.tsx`) — nothing about the shipped experience changed. Four api-client methods (`getClientStats`/`getTalentStats`/`listTalentActivity`/`getShortlistedTalentIds`) and `getAvailability()`'s UI consumer stay mock-only permanently: no stats/activity/shortlist resource is defined anywhere in `features.md`, and the real `AvailabilityBlock` shape is genuinely different from the mock's fixed weekly grid (already flagged in `@monologg/types` as superseded by Phase 13) — see `log.md` Session 15 for the reasoning.
- **Authentication is real** (Phase 4, Session 14) — see [Section 4](#4-auth-flow-reality-detail) for the full detail. Register/login/logout/refresh/verify-email/forgot-password/reset-password all hit real endpoints, argon2id-hashed passwords, rotating JWT refresh tokens with reuse-detection. `AuthFlow.tsx` calls these through `api-client.ts`; in the default `VITE_API_MODE=mock`, the UI behaves exactly as before (no login required to reach any page) — only `live` mode actually gates anything.
- **No persistence in the frontend** beyond the light/dark theme preference (`localStorage`, key `monologg-theme`, `src/app/Root.tsx`) and, in `live` mode, the refresh token (`localStorage`, key `monologg_refresh_token`). Domain UI state still resets on refresh until Phase 5.
- **No real payment integration.** The PRD specifies FINCRA as the escrow payment gateway (stale, see X1); `Checkout.tsx` simulates this with a 2.5-second delay before showing a "confirmed" state. → Phase 6.
- **No real AI verification.** The PRD's "Thespian AI" verification step is implemented in `CreatorOnboarding.tsx` as a timed loading animation ("Thespian AI is reviewing your performance parameters…") followed by a hardcoded set of tags and a verified badge — no model is called. → Phase 7.

**Implication for whoever builds Phase 5 next:** the mock data shapes already in each page file (e.g. the `Order`, `Talent`, `Project` object literals) are a reasonable starting point for the remaining endpoints, since they represent what the UI already expects to receive.

---

## 4. Auth flow reality (detail)

`src/app/pages/AuthFlow.tsx` implements four in-page views (`splash`, `register`, `login`, `forgot`) as local component state, not real routes. As of Phase 4 (Session 14), these call real endpoints through `apiClient` — but **only when `VITE_API_MODE=live`**; the default `mock` mode reproduces the exact original prototype behavior below, so nothing about running the app locally changed unless you explicitly flip the mode.

- **Register:** collects name/email/password/role (Talent or Client) + a terms checkbox client-side. `mock` mode: routes to `/onboarding` (Talent) or `/onboarding/client` (Client) immediately, no network call — unchanged from before. `live` mode: calls `POST /api/v1/auth/register` (argon2id-hashes the password server-side, creates the `User` + matching `Creator`/`Client` row, sends a mock verification email), then navigates the same way on success or shows an inline error on failure (e.g. email already registered). The form only ever collects name/email/password/role — `location`/`niche`/`orgName`/`orgType` are optional server-side (default to empty/`CONTENT_CREATOR`) since they're actually collected later in `CreatorOnboarding.tsx`/`ClientOnboarding.tsx`, which aren't wired to the backend yet (Phase 5+).
- **Login:** `mock` mode: same email-substring rule as before (`"client"`/`"brand"` → `/client`, else `/dashboard`), no network call. `live` mode: calls `POST /api/v1/auth/login`, which returns a short-lived access token + a rotating refresh token on success (or a generic "Invalid email or password" on failure — no user-enumeration signal); the returned user's real `userType` decides the redirect. Tokens: access token in memory only (cleared on reload), refresh token in `localStorage` (`monologg_refresh_token`) so it survives a reload.
- **Forgot password:** `mock` mode: shows the "check your email" confirmation immediately, no network call, as before. `live` mode: calls `POST /api/v1/auth/forgot-password`, which always returns success regardless of whether the email exists (no enumeration).
- There are also two direct-bypass buttons on the login screen ("Talent" / "Client") that skip credentials entirely and route straight to the respective dashboard — left untouched, an explicit demo shortcut rather than a fake login.
- **Route protection:** `apps/web/src/app/RequireAuth.tsx` wraps the six pages that need a session (`dashboard`, `client`, `order/:id`, `brief`, `checkout`, `settings`, via a `protect()` helper in `routes.tsx`). In `mock` mode it's a no-op (every route stays reachable directly by URL, exactly as before); in `live` mode, no session redirects to `/auth`.
- **Server-side:** `requireAuth`/`requireRole`/`requireOwner` (`apps/api/src/middlewares/auth.ts`) are the actual access-control primitives — none of Phase 5's future routes exist yet to apply them to, but the primitives themselves are built and tested (401 no token, 403 wrong role/non-owner, 404 missing resource).

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
- **Type scale:** `--font-size-xs` through `--font-size-5xl` — defined, but **not yet adopted** by most page headings (they still use ad-hoc arbitrary pixel values; this is a known, documented gap, not a bug)
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

## 6. What is NOT built yet (gaps vs. the PRD)

**This section is now superseded by `features.md` and `implementation-plan.md`**, which turn this same gap list into an 18-phase (0–17), dependency-ordered, test-gated build plan — including corrected values (Paystack not FINCRA, 11%/15% fees not 9%/12%, KYC split from AI style-tagging) and four entirely new feature areas (rich availability, project applications, public profile, external booking) that weren't scoped here at all. Kept below as a quick-reference snapshot; `features.md` is authoritative for anything more than a one-line summary.

1. **~~No API/backend service of any kind.~~ Done (Phases 1–5).** A running Fastify server exists with health/auth routes and 7 domain resources (creators, rate-cards, availability, briefs, talent, bookings, order-rooms).
2. **~~No database wired into the running app.~~ Done (Phase 5) for the screens Phase 5 covers.** `VITE_API_MODE=live` reads real Supabase-backed data for talent discovery, briefs, rate cards, bookings, and order-room messages. Stats/activity/shortlist and the availability calendar UI stay mock-only (no backing resource exists for the first group; the second is intentionally deferred to Phase 13's real data model).
3. **~~No real authentication~~ Done (Phase 4, Session 14).** Real register/login/logout/refresh (rotating, reuse-detected)/verify-email/forgot-password/reset-password, argon2id hashing, `requireAuth`/`requireRole`/`requireOwner` middleware, client wired via `api-client.ts` + a `RequireAuth` route guard. Live only in `VITE_API_MODE=live`; `mock` mode (the default) is unchanged. See [Section 4](#4-auth-flow-reality-detail).
4. **No real payment/escrow integration** (currently a fake delay; copy says FINCRA — stale, see X1). → Phase 6.
5. **No real AI verification** (Thespian AI is a scripted animation; will split into KYC + style-tagging, see X3). → Phase 7.
6. **No calendar sync** (Google Calendar "sync" button is UI-only). → Phase 8.
7. **No notifications backend** (panel exists, data is hardcoded). → Phase 9.
8. **No transaction history / help-support / terms screens** (SYS-01–04 from the PRD, mostly unbuilt). → Phase 10.
9. **Type scale tokens exist but aren't applied everywhere** — cosmetic/consistency debt, not a functional gap. → Phase 11.
10. **Font loading depends on external CDNs** (Fontshare, Google Fonts) — will silently fall back to system fonts in offline/restricted-network environments. → Phase 11.

**Also newly scoped, not previously tracked anywhere:** a real time-slot availability calendar (Phase 13), two-sided project applications with an applicant cap (Phase 14), a fully public logged-out marketplace profile (Phase 15), and the flagship external-visitor booking flow with deferred account creation (Phase 16). See `features.md` for full specs on all of these.

---

## 7. Where to run it / see it

**As of `features.md` Phase 1, this is a pnpm workspace** (`monologg/pnpm-workspace.yaml`): `apps/web` (the client, formerly the standalone `app/` folder), `apps/api` (a real running Fastify server as of Phase 3–4 — see below), `packages/types` (shared zod schemas/DTOs). Install once from `monologg/` with `pnpm install` (or `npx pnpm install` if pnpm isn't installed globally) — this links all three packages together.

- **Local dev app:** from `monologg/`, `pnpm dev` (or `cd apps/web && npm run dev`) → `http://localhost:5173`. Routes: `/`, `/auth`, `/onboarding`, `/onboarding/client`, `/dashboard`, `/client`, `/order/:id`, `/brief`, `/checkout`, `/settings`, `/design-system`. The last six are wrapped in `RequireAuth` but it's a no-op in the default `VITE_API_MODE=mock` — nothing to log in with unless you also run the API in `live` mode.
- **Local dev API:** `pnpm --filter @monologg/api run dev` → `http://localhost:3001` (`/api/v1/health`, `/api/v1/auth/*`, and 7 domain resources as of Phase 5 — creators, rate-cards, availability, briefs, talent, bookings, order-rooms). Needs `apps/api/.env` (copy `.env.example`) — validated at boot by `src/config/env.ts`; missing/malformed vars fail fast with a specific message. Note: the two dev servers still aren't proxied to each other, so `apps/web` with `VITE_API_MODE=live` won't reach `localhost:3001` locally without a Vite proxy — not yet needed since nothing requires running both together to develop against.
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

See `log.md` for exactly how `apps/web` came to exist (as `app/`, then moved) and what was changed inside it, `bug.md` for defects found and fixed, `process.md` for a plain-language walkthrough of the whole engagement, and `features.md` for everything not yet built.
