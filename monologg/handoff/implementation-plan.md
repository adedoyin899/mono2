# Monologg — Implementation Plan (Living Document)

**Last updated:** 2026-08-04 (Session 56: Client Purple Role Theme, Vector World Map SVG & Hero Card Contrast)
**Status:** All 18 phases of `features.md` (0–17) + Phase 12B Supabase Auth + Phase 12C Withdrawal OTP Gate + Session 39 & 40 Stress Test + Session 51–56 Visual Overhauls & Design Fixes are built and committed. Full-stack: pnpm workspace, real Postgres/Prisma schema, Fastify server, real authentication, real domain endpoints, Paystack-first escrow/payment backend, real KYC + AI style-tagging, Google Calendar/Meet provider layer, notifications backend, design tokens, production hardening, Media Kit, physical attributes, rich time-slot availability, project applications, public marketplace profile, external booking flow, Supabase identity bridge, 2-step passcode withdrawal flow, interactive style tag editing, ReferenceError bug fixes, Availability calendar tab copy updates, Hyper-Design luxury typography, WebGL hero hover grid, Monologg Mono-Red / Mono-Purple brand colors, WCAG AA dark mode contrast, 8Returns/Lumos oversized logotype footer, 7-talent card carousel with edge fade masks, working copy invite link button, Vector World Map SVG with continent paths & flag pins, interactive QR code modal, and full navigation view overhaul.

---

## ✅ Done

### Session 56 — Client Purple Role Theme, Vector World Map SVG & Hero Card Contrast
- [x] **Client Role Theme Scope**: Updated `OrderRoom.tsx` container class and styles to dynamically switch to Mono-Purple (`#7B00FE`) when simulating Client role.
- [x] **AuthFlow Upgrades**: Removed shield icon, upgraded headline to all-caps with SVG line emphasis ("YOUR CRAFT. ON YOUR TERMS. INSTANTLY BOOKED."), added WebGL grid reveal canvas to left panel background, and dynamically adapted page theme when switching roles.
- [x] **Vector World Map SVG**: Replaced dot grid canvas with `VectorWorldMap` rendering SVG continent landmass outlines (North America, South America, Europe, Africa, Asia, Australia) with custom stroke/fill control and location pin badges.
- [x] **Dashboard Hero Card Contrast & Home Tab Clean-up**: Upgraded hero money amount text (`₦148,000` / `₦850,000`) to crisp white (`#FFFFFF`) with lighter brand red (`#FFECEC`) and purple (`#F1E9FF`) washes. Removed stat preview cluster card from Home tab (moved to Analytics tab).
- [x] **Talent Roster Headline Extension**: Extended headline to `"Discover & Book Top Performing Artists Instantly"`.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.06s) verified clean.

### Session 55 — Map Redesign, Dark Mode Card Fixes & Hero Reveal Revert
- [x] **SVG Dot-Matrix World Map**: Built DotMatrixWorldMap component with SVG landmass dot matrix and country flag pin markers (🇳🇬, 🇬🇭, 🇰🇪, 🇿🇦, 🇬🇧, 🇺🇸) matching Attachments 1 & 2.
- [x] **Reverted Hero Grid Reveal & Added Footer Reveal**: Reverted WebGL grid reveal to status quo subtle opacity (`0.25`) and added matching grid reveal to footer.
- [x] **Dark Mode White Card & Input Fixes**: Fixed hero waitlist input form pill in dark mode (`#16161A`, `#F5F5F0`) and replaced hardcoded text classes in AuthFlow left panel with CSS variables.
- [x] **Sticky Navigation Header & Base Invite Link**: Fixed top header sticky behavior and updated copied share invite link to copy `window.location.origin` (directing visitors straight to landing page).
- [x] **Dashboard Analytics Organization**: Moved Analytics quick action to dedicated Analytics tab and placed Orders in Quick Actions.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.09s) verified clean.

### Session 54 — Sci-Fi Radar Trust Map & App-Wide Overhaul
- [x] **Working Copy Link Button**: Added `Copy` button to waitlist invite pill with clipboard copy and 2.5s "Copied!" checkmark feedback.
- [x] **Sci-Fi Interactive Global Radar Map**: Replaced static testimonials with an interactive Sci-Fi Radar Map of Africa & Global Hubs (Lagos, Accra, Nairobi, Joburg, London, NY) featuring glowing pulse nodes and popping performer cards.
- [x] **Hero Red Squiggle & Enhanced Grid Reveal**: Added SVG hand-drawn red squiggle underline beneath `"INSTANTLY BOOKED"` and enhanced `WebGLHeroCanvas` hover grid contrast (`0.75` max opacity).
- [x] **Carousel Edge Fade Masks & Slower Drift**: Added left/right gradient mask overlays (`from-[var(--color-bg-surface-2)] via-transparent to-[var(--color-bg-surface-2)]`) and set `45s` Framer Motion duration.
- [x] **Interactive QR Code Scan Modal**: Added `QRCodeModal` overlay triggered by floating QR badge.
- [x] **App-Wide Navigation View Redesign**: Overhauled Rate Cards, Availability, Shortlist, Activity, Analytics, Earnings/Transactions, Projects, Order Room, Verification Video, and Settings across Client and Talent web apps.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.29s) verified clean.

### Session 53 — Targeted UI Polish, Dark Mode Fixes & Talent Carousel
- [x] **Primary Red + Outlined Secondary CTA Pair**: Fixed side-by-side CTA button pair in final conversion section.
- [x] **Dark Mode Contrast Fix Across Cards**: Replaced white card backgrounds in dark mode with dark surface containers (`#16161A`, `#26262E`) and high-contrast text (`#F5F5F0`, `#A6A6B0`) across Step cards, FAQ accordion, and talent cards.
- [x] **Auto-Looping 7-Talent Carousel**: Built an infinite horizontal auto-scrolling Framer Motion talent carousel with 7 artist profiles.
- [x] **Clean Hero Background & Hover Blueprint Grid**: Reworked `WebGLHeroCanvas.tsx` to default to a plain background and reveal an architectural blueprint grid on hover.
- [x] **Wise-Style Auth / Sign-Up Page Overhaul**: Reworked `AuthFlow.tsx` with segmented role switcher (`Talent / Creator` vs `Client / Employer`), rounded-full inputs, and high-contrast dark/light mode copy.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.08s) verified clean.

### Session 52 — Monologg Brand Identity Remix & Oversized Logotype Footer
- [x] **Monologg Native Brand Palette**: Replaced Wise green tokens with Monologg Mono-Red (`#F13030`), Mono-Purple (`#7B00FE`), soft washes, and clean neutrals (`#F8F8F6`, `#16161A`, `#0D0D0F`).
- [x] **Dark Mode & WCAG AA Contrast**: Audited dark mode contrast variables in `tokens.css` ensuring >= 4.5:1 text contrast on dark cards, accordions, and inputs.
- [x] **Oversized 8Returns/Lumos Logotype Footer**: Built an edge-to-edge "MONOLOGG" display typography footer in `LandingPage.tsx` with contact email, multi-column navigation links, social links with external arrows (`↗`), and certification badges (`NDPA Compliant`, `FINCRA Escrow Verified`).
- [x] **Unified Typography Hierarchy**: Standardized base body text at `16px` across all sections with responsive mobile font scales.
- [x] **Monologg Copy Alignment**: Replaced Wise terms with `"MONOLOGG ESCROW PROTOCOL"`, `"PROPRIETARY THESPIAN AI SCANNER"`, and `"FINCRA SECURED ESCROW LOCK"`.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.11s) verified clean.

### Session 51 — Hyper-Design & Wise Design System Overhaul
- [x] **Wise & Hyer Design Tokens**: Integrated Wise Forest Ink (`#163300`), Lime Voltage (`#9fe870`), Linen Mist (`#e2f6d5`), Fog (`#e8ebe6`), Charcoal (`#454745`), and Hyer Clay Ember (`#bc7155`) tokens in `tokens.css`. Added Google Fonts import for Inter 900 heavy display typography and DM Sans in `fonts.css`.
- [x] **WebGL Ambient Hero Canvas**: Created `WebGLHeroCanvas.tsx` for mouse/scroll-reactive particle mesh animations in the Hero.
- [x] **Hyper-Design Luxury Scale Landing Page**: Reworked `LandingPage.tsx` with architectural block display type (Wise Sans / Inter 900 at 105px display scale), Wise Escrow Calculator card (`WiseBookingCalculator`), 3D tilt talent cards with audio player preview, 3-step workflow, creator testimonial mosaic grid, FAQ accordion, and floating QR app download badge.
- [x] **Wise-Style Button & Layout Matrix**: Extended `Button.tsx` with `lime`, `forest`, `outline-pill`, and `clay` variants; updated `DesignSystem.tsx` with Web vs Mobile layout breakdown matrix.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.10s) verified clean.

### Session 50 — QA Master Sweep & Compilation Fixes
- [x] **API Zod Schema Fixed**: Added `SUPABASE_JWT_SECRET` to the Zod schema in `env.ts` to prevent Fastify crash and typecheck compile errors.
- [x] **Database Schema Synced & Seeded**: Ran `prisma db push --accept-data-loss` to sync database with the schema and successfully ran seed data.
- [x] **Web Compilation Errors Resolved**: Fixed missing imports (`X` icon in `CreatorOnboarding`, `Modal` in `Settings`, `appStateSync` in `AuthFlow`), corrected `Badge` component props from `variant` to `tone`, fixed `appStateSync` method name mismatches (`setBankDetails` -> `updateBankDetails`, `withdraw` -> `withdrawFunds`), and resolved type compatibility mismatches.
- [x] **Verification**: Workspace passes `tsc --noEmit` and Vitest unit test suite (100% green: 577 API, 78 Web).

### Session 40 — Fix ReferenceErrors, Calendar Tabs Copy & Auth Demo Routing
- [x] **Production ReferenceErrors Fixed**: Imported missing `X` icon from `lucide-react` and declared `paymentCards` / `deleteCardModal` state variables in `Settings.tsx` to fix Vercel runtime crashes.
- [x] **Availability Calendar Tabs & Copy**: Updated calendar switcher tabs to `"Month"`, `"Week"`, `"Day"` and condensed helper text to single responsive line: `"Click a day to see and edit everything scheduled — an unconfigured day is open across normal hours by default."`.
- [x] **Auth Demo Routing**: Updated Talent and Client demo buttons in `AuthFlow.tsx` to set `localStorage.setItem("monologg_is_new_user", "false")` and route directly to default regular user dashboards (Emeka Johnson / FilmCraft Studios).
- [x] **Verification**: Vitest Web test suite 100% passing (21 test files, 78 tests). Vite production build: 2129 modules transformed cleanly.

### Session 39 — Platform Stress Testing, Bug Fixes & Withdrawal / Auth UX Overhauls
- [x] **Creator Onboarding Style Tags Editing**: Enhanced Step 4 tag editing (`CreatorOnboarding.tsx`) with preset performance style tags (`Warm Texture`, `Conversational`, `Expressive`, `High Energy`, `Deep Voice`, `Commanding`, `Narrative`, `Character`), 1-click toggling, custom tag creation, and tag removal.
- [x] **Settings Payment Methods**: Integrated Payout Bank Account Details editor (Bank Name, Account Number, Account Name) into section `"payment"` of `Settings.tsx` for Talent users with instant state synchronization via `appStateSync.setBankDetails()`.
- [x] **Withdrawal Authorization Flow Overhaul**: Refactored `WithdrawalModal` (`TalentDashboard.tsx`) into a clean 2-step process: **Step 1: Amount (₦) + Destination Bank Account Selector** -> **Step 2: 4-Digit Security Passcode Verification** -> **Instant Payout & Receipt**. Completely removed email OTP clutter.
- [x] **Streamlined Auth UI**: Cleaned up `AuthFlow.tsx` by removing redundant Magic Link / Email OTP secondary buttons, highlighting Google Sign-In as primary, and refining Email/Password login/register layouts.
- [x] **Verification**: Vitest Web test suite 100% passing (21 test files, 78 tests).

### Session 49 — Phase 12C: Withdrawal Email OTP Gate
- [x] Added `WithdrawalRequestStatus` enum, `WithdrawalRequest` model, `WithdrawalOtp` model (`codeHash`, `expiresAt`, `attempts`, `verifiedAt`), and relations on `User` model.
- [x] Created additive SQL migration `20260803010000_phase12c_withdrawal_otp`.
- [x] Added `WITHDRAWAL_OTP_MODE` (`mock` | `live`) config flag to `env.ts` and `.env.example`.
- [x] Implemented core withdrawal service (`apps/api/src/services/withdrawals.ts`) with `crypto.randomInt` code generation, Argon2id hashing, rate limiting (3/10m per withdrawal, 5/1h per user, 60s cooldown), 10-minute expiry, 5-attempt lockout, and generic error leakage protection.
- [x] Created server routes `POST /api/v1/withdrawals`, `POST /api/v1/withdrawals/:id/otp/request`, `POST /api/v1/withdrawals/:id/otp/verify`, `POST /api/v1/withdrawals/:id/release` (security gated with 409 Conflict if unverified), and `GET /api/v1/dev/withdrawals/:id/otp` (dev helper).
- [x] Added withdrawal methods to `api-client.ts` (`initiateWithdrawal`, `requestWithdrawalOtp`, `verifyWithdrawalOtp`, `getDevWithdrawalOtp`).
- [x] Integrated 2-step OTP flow into the Withdrawal modal in `TalentDashboard.tsx` (amount/passcode input -> 6-digit OTP verification UI with copy, countdown, and resend link).
- [x] Written comprehensive test suite `apps/api/src/routes/withdrawals.test.ts` (12 tests covering crypto, Argon2id storage, happy path verify/release, 5-attempt lockout, 10m expiry, rate limits, generic errors, and release security gating). Verified 100% passing across API (577 tests) and Web (78 tests).
- [x] Extended `User` model with `supabaseUserId` (nullable, unique), extended `AuthProvider` enum (`MAGIC_LINK`, `EMAIL_OTP`), and added `AuthEvent` audit table.
- [x] Created additive SQL migration `20260803000000_phase12b_supabase_auth`.
- [x] Configured Supabase environment variables schema (`SUPABASE_MODE`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`) in `apps/api/src/config/env.ts` and `.env.example` files.
- [x] Implemented `SupabaseAuthProvider` interface and provider seam (`mock` and `real` implementations using HS256 JWT verification).
- [x] Built server routes `POST /api/v1/auth/session/sync` (verifies Supabase token, links/creates User, issues app JWT, writes `AuthEvent`, sends notifications) and `POST /api/v1/auth/otp/request` (rate-limited 1 req/60s).
- [x] Built web client Supabase singleton `apps/web/src/lib/supabase.ts` (null in ALL-MOCK mode) and `AuthCallback.tsx` route handler.
- [x] Updated `AuthFlow.tsx` with real Google OAuth redirect trigger, expandable Magic Link form, Email OTP request + 6-digit verification code screen.
- [x] Written comprehensive test coverage (API: `authSupabase.test.ts`, Web: `supabaseKeyCheck.test.ts`, `AuthCallback.test.tsx`). Verified 100% passing across API (565 tests) and Web (78 tests).
- [x] Added `isNewUser` mode toggles on Talent and Client dashboards for testing zero-data states.
- [x] Built interactive Onboarding Action Nudges Checklist card on Talent Home tab.
- [x] Built interactive Onboarding Action Nudges Checklist card on Client Home tab.
- [x] Built zero balance / zero spend hero states and zero activity states on Talent & Client Home tabs.
- [x] Built dedicated empty state views with descriptive copy and action CTAs across all Talent navigation tabs (Rate Cards, Availability/Calendar, Projects, Orders, Activity, Earnings, Analytics).
- [x] Built dedicated empty state views with descriptive copy and action CTAs across all Client navigation tabs (Discover, Projects, Orders, Shortlist, Activity, Analytics).
- [x] Verified full unit test suite passing cleanly (19 test suites, 72 tests).

### Phase 1 — Get the product running
- [x] Extract and identify real source code from the four Figma Make export zips
- [x] Assemble a runnable app (`index.html`, `src/main.tsx`, app-mode `vite.config.ts`) — original export was library-mode only
- [x] Install dependencies
- [x] Publish a one-off shareable static preview (Artifact)
- [x] Stand up a persistent local dev server at `http://localhost:5173` (`app/`, `npm run dev`)

### Phase 2 — Design system audit + remediation
- [x] Full audit: token usage consistency, duplicated components, radius/color/motion drift
- [x] Extract design tokens from an inline JS string (`Root.tsx`) into a real stylesheet, `src/styles/tokens.css`
- [x] Retire and delete two dead/conflicting CSS files (`theme.css`, `DoyinXMonologgCopy/styles.css`)
- [x] Centralize motion durations/eases (`src/lib/motionTokens.ts`)
- [x] Centralize modal scrim color (`--color-overlay` / `--color-overlay-strong`)
- [x] Fix untokenized radius classes in `TalentDashboard.tsx` (41) and `ClientDashboard.tsx` (16)
- [x] Fix `text-gray-*` bypasses of the text-color tokens
- [x] Build 6 shared components (`Modal`, `Avatar`, `Badge`, `FormField`, `Sidebar`, `BottomNav`) and wire them into every real call site
- [x] Build a live, self-updating `/design-system` documentation route
- [x] Build a standalone, shareable static build of the design-system page (`npm run build:designsystem`)

### Phase 3 — File cleanup
- [x] Remove dead/placeholder files from `app/` (confirmed with user first)
- [x] Remove original export zips + `.DS_Store` from the parent folder (confirmed with user first)
- [x] Verify build stayed byte-identical after each cleanup round

### Phase 4 — Handoff documentation
- [x] `design.md` — product, stack, and design-system reference
- [x] `log.md` — chronological implementation record
- [x] `bug.md` — defect log with severity
- [x] `process.md` — plain-language walkthrough
- [x] `README.md` + `implementation-plan.md` — living-document index and status board

### Phase 5 — Standalone builds + dependency cleanup
- [x] Diagnose why `index.html`/`design-system.html` didn't open outside the dev server (Vite source shells, not runnable files)
- [x] Add a hash-router build target (`AppStandalone.tsx`, `createHashRouter`, `vite.config.standalone.ts`) so the app works with no server
- [x] Build and inline both into single self-contained files: `monologg-app.html`, `monologg-design-system.html` (project root)
- [x] Audit all 26 dependencies against real usage; remove 20 unused packages + `vite-plugin-dts`; keep `vite` (confirmed with user — needed for localhost + rebuilds)
- [x] Fix the CSS-only `tw-animate-css` import the dependency-usage grep missed (see `bug.md` #5)
- [x] Verify all three build targets + dev server still work after cleanup; regenerate the two standalone HTML files

### Phase 6 — File structure reorganization
- [x] Survey entire tree; split findings into confirmed-dead vs. judgment calls
- [x] Delete confirmed-dead files (`.DS_Store`s, 4 orphaned parent-level config files with no `package.json` to run them)
- [x] Confirm with user before touching anything ambiguous (unused screenshots, old draft doc, renaming/README)
- [x] Rename `dev-preview/` → `app/`
- [x] Move unused logo PNGs into a labeled `brand/` folder
- [x] Move 18 unreferenced Figma screenshots into `app/src/imports/reference-screenshots/`
- [x] Move 3 superseded design/spec drafts into `app/src/imports/historical-drafts/`
- [x] Add a root-level `README.md` for wayfinding (technical + non-technical)
- [x] Update every `dev-preview` reference across `handoff/*.md` to `app`
- [x] Rebuild all three targets + smoke-test dev server to confirm the rename broke nothing; regenerate the two standalone HTML files

### Phase 7 — Dark-mode toggle fix (standalone design-system page)
- [x] Diagnose why the toggle silently did nothing (no `ThemeContext.Provider` in the standalone entry's render tree)
- [x] Extract theme state/persistence into a shared `useThemeState()` hook (`Root.tsx`)
- [x] Add a `StandaloneThemeProvider` to `main-designsystem.tsx` reusing the hook
- [x] Rebuild + sanity-check all three targets; regenerate `monologg-design-system.html`

### Phase 8 — Landing page visual rework
- [x] Read both user-supplied style-reference files (`saaswebskill.skill`, `saaswebskill2.skill`) in full
- [x] Synthesize a distinct visual system: borrow the *mechanics* (gradient atmosphere, hard-offset shadows, bento layout, mono eyebrows), not the literal colors/fonts of either reference
- [x] Add additive-only tokens to `tokens.css` (`--gradient-brand*`, `--shadow-cutout*`) — nothing existing changed value
- [x] Extend `Avatar.tsx` with an optional photo (`src`) prop, backward compatible
- [x] Rebuild `LandingPage.tsx`: hero mockup + gradient atmosphere, photo social-proof cluster, bento feature grid, 3D-style icon tiles, full-bleed photography section, real testimonial photos — all existing copy retained
- [x] Rebuild all three targets + regenerate `monologg-app.html`; open for user review

### Phase 9 — Pushed to git
- [x] Diagnosed and restored an accidental drift (`imports/` had ended up outside `app/src/`) before committing
- [x] Restructured locally into a `monologg/` subfolder so the project can share a repo with unrelated existing content without collision
- [x] Initialized git, merged with the existing history at `github.com/adedoyin899/mono2` (kept, didn't overwrite), added a scoped `.gitignore` (`node_modules`, `dist*`, `.vite`, `.DS_Store`)
- [x] Set up a dedicated deploy key (`id_ed25519_mono2`, write access, this repo only) and pushed

### Phase 10 — Full-stack build-out scope review
- [x] Read `features.md` (the consolidated backend + new-features PRD, 18 phases, 0–17) in full
- [x] Confirmed the new monorepo structure nests under `monologg/` (not the true repo root, to stay separate from the unrelated content) and moved `New features.md` → `handoff/features.md`
- [x] Updated `implementation-plan.md`, `design.md`, `log.md` to reflect the new phase of work — this pass

### `features.md` Phase 0 — Repo tooling (done, reviewed below)
- [x] Committed the UI-complete prototype as an explicit baseline (safety-net diff point) before any tooling changes
- [x] Added strict TypeScript (`tsconfig.json`) — surfaced and fixed 38 pre-existing issues (mostly dead icon imports; one real bug, see `bug.md` #9) once the missing `@types/react`/`@types/react-dom`/`@types/node` packages were installed
- [x] Added ESLint (flat config, `typescript-eslint` + React hooks/refresh plugins) and Prettier — lint is a CI gate (0 errors required; warnings are visible but non-blocking), format is available but not yet enforced (codebase predates it, not bulk-reformatted)
- [x] Added Vitest + a real placeholder test suite against the existing `cn()` utility (not a vacuous assertion)
- [x] Added `typecheck`/`lint`/`format`/`format:check`/`test` npm scripts
- [x] Added GitHub Actions CI (`.github/workflows/monologg-ci.yml`, at the true repo root — the only place Actions looks — path-scoped to `monologg/**` so it doesn't fire on the unrelated project sharing this repo) running `typecheck → lint → test → build`, blocking on failure
- [x] Added `CONTRIBUTING.md` and updated `README.md` with the new commands and CI description
- [x] Verified all four gates green locally before committing

### `features.md` Phase 1 — Monorepo restructure + api-client seam
- [x] Converted to pnpm workspaces: `apps/web` (moved from `app/` via `git mv`, preserves history), `apps/api` (empty scaffold), `packages/types` (shared zod schemas/DTOs)
- [x] Fixed a real pre-existing bug surfaced along the way: `apps/web`'s `react`/`react-dom` were declared as optional `peerDependencies` (a library-mode leftover) instead of real `dependencies`, now corrected
- [x] Built `apps/web/src/lib/api-client.ts` — one typed seam, every function mocked by default; added `VITE_API_MODE=mock|live` (`.env.example`)
- [x] Moved every domain-entity mock constant (talents, projects, orders, stats, activity, services, availability, order messages, shortlist) into `apps/web/src/mocks/`, typed against `@monologg/types`; left static UI copy/config (marketing copy, form dropdown options, weekday labels) local, since that's not "mock data standing in for a backend" — see `log.md` for the exact boundary
- [x] Refactored `ClientDashboard.tsx`, `TalentDashboard.tsx`, `OrderRoom.tsx` to load all domain data through `apiClient`, zero visual change (production CSS build hash unchanged)
- [x] Added a grep-based test enforcing the boundary (no file under `src/app` imports `../mocks` directly) and DOM-parity tests (React Testing Library) proving each refactored page still renders the same real data
- [x] Added `api-client.test.ts` covering both `VITE_API_MODE` paths (mock returns fixtures; live calls `fetch('/api/v1/...')`, mocked transport, including an error-response path)
- [x] Updated CI to install/typecheck/lint/test/build via `pnpm` from the new workspace root
- [x] Verified all three build targets green, CSS byte-identical across all of them, dev server + both standalone HTML files regenerated

### `features.md` Phase 2 — Database schema, Prisma, migrations, seed
- [x] Implemented a 15-model database schema in `prisma/schema.prisma` mapping all domain concepts (Users, Creators, Clients, Bookings, RateCards, AvailabilityBlocks, Payments, Messages, etc.).
- [x] Resolved conflicts X1 (Paystack/Stripe/Airwallex, no Fincra), X2 (11% talent / 15% client platform fee variables), and X3 (Fully separate `styleTags` AI tagging and `verification` KYC status columns).
- [x] Configured multi-connection URL system: pooled connection `DATABASE_URL` for the client runtime, and session pooler `DIRECT_URL` for DDL migrations.
- [x] Generated database schema migration `20260728221646_init` and applied it to Supabase Postgres instance.
- [x] Created idempotent `prisma/seed.ts` seeding all 6 mock creators, 4 client projects, 8 rate cards, 4 briefs, plus one booking for each of the 6 booking states with exact fee calculations.
- [x] Verified seeded database entries in manual integration tests against Supabase.

### `features.md` Phase 3 — Backend scaffold, config, and provider interfaces (all mocked)
- [x] Scaffolded the Fastify backend application structure under `apps/api/src`.
- [x] Added validated environment loader `src/config/env.ts` with strict Zod parsing, failing fast on start with clear exit message if required vars are missing.
- [x] Centralized fee math in `src/services/fees.ts` checking defaults against custom config, unit-tested without rounding drift (money minor units rule).
- [x] Defined TypeScript interfaces for all five external provider boundaries: `PaymentProvider`, `KycProvider`, `AiTaggingProvider`, `CalendarProvider`, and `NotifyProvider`.
- [x] Created mock implementations (`*.mock.ts`) and real stubs (`*.real.ts`) for all 5 providers, integrated via a provider selection registry module.
- [x] Configured request logging (pino/pino-pretty), CORS, security headers (helmet), and rate limiting.
- [x] Implemented `GET /api/v1/health` verifying database connectivity.
- [x] Wrote automated test suite covering fees, environment validation, health check, and mock provider resolution.

### `features.md` Phase 4 — Real authentication
- [x] Backend built in a separate tool ("antigravity") from this plan/`features.md`, then audited and completed in this session (Session 14): `services/auth.ts` (argon2id, JWT issue/verify, refresh-token hashing), `routes/auth.ts` (all 7 endpoints — register/login/refresh/logout/verify-email/forgot-password/reset-password), `middlewares/auth.ts` (`requireAuth`/`requireRole`/`requireOwner`), `providers/cache.*` (refresh-token denylist + verify/reset TTLs, mock in-memory + real Redis).
- [x] Fixed a real bug found in review: `requireOwner` returned the non-standard status `444` instead of `404` on a missing owned resource.
- [x] Closed test-gate gaps: verify-email/reset-password/logout endpoint tests, rate-limit tests (login + forgot-password), a real sanitized-logs test (replacing a placeholder assertion), `requireOwner`'s missing `client`-scope tests, and a full register→verify-email→login→protected-route→refresh→logout integration test. 91 `apps/api` tests passing.
- [x] Wired the client half (`features.md` spec item 6, previously entirely missing): `api-client.ts` gained `register`/`login`/`logout`/`forgotPassword`/`isAuthenticated`, attaches the access token to every live-mode request, and retries once on a 401 via a silent refresh. `AuthFlow.tsx` calls these instead of just navigating locally. A new `RequireAuth` guard wraps the six protected routes — a no-op in the default `mock` mode, real gating only in `live` mode.
- [x] Verified in a real browser (headless Chromium), not just the test suite: mock-mode register/login navigate correctly, protected routes stay directly reachable with no login, zero console errors.
- [x] Fixed a real, pre-existing `apps/web` test-infrastructure gap surfaced by the new tests: `@testing-library/react`'s per-test DOM cleanup was never registering (no `test.globals: true`), so `render()` output silently accumulated across tests in a file. Fixed once in `test-setup.ts`.
- [x] Re-verified the full baseline: `typecheck`/`lint`/`test`/`build` green across both packages, production CSS hash unchanged.

### `features.md` Phase 5 — Core domain endpoints
- [x] Built all 7 resources: `creators` (profile + presigned media upload, styleTags/verification read-only by omission), `rate-cards`/`availability` (owner-scoped CRUD), `briefs` (client-owned CRUD, added a `status` field the original schema didn't have since the resource needs one to be meaningful), `talent` (public discovery — niche/tag/location/price filters, paginated), `bookings` (create with server-computed fees + guarded state machine, list/get/cancel), `order-rooms` (participant-scoped messages). New `StorageProvider` seam (mock local-disk + real S3-compatible stub).
- [x] Caught two response-shape gaps before they reached the frontend: `/rate-cards` and `/briefs` initially returned raw Prisma rows instead of the display-mapped shapes `apps/web`'s types expect — fixed with the same mapping pattern already used for `/talent`/`/bookings`.
- [x] Deliberate scope boundary: 4 api-client methods (stats ×2, activity, shortlist) have no backing resource in this phase's spec and stay mock-only; `getAvailability()`'s UI consumer also stays mock since the real `AvailabilityBlock` shape is genuinely different from the mock's weekly grid (already flagged in `@monologg/types` as superseded by Phase 13) — the real `/availability` endpoint itself is built and tested regardless.
- [x] `Talent`/`ServiceRateCard`/`OrderMessage.id` changed `number` → `string` (they mirror real cuid ids). Found and fixed a real pre-existing bug during the fallout from that change: both dashboards' order-card clicks hardcoded `navigate("/order/1")` regardless of which order was clicked.
- [x] Client wiring: 6 `api-client` methods flipped to live (unwrapping the new pagination envelope via a `requestList()` helper, one generous page rather than building pagination UI as a side effect); added `createBrief`/`sendOrderMessage`; wired `ProjectBrief.tsx`'s publish and `OrderRoom.tsx`'s send-message to them in live mode, unchanged in mock mode.
- [x] Caught a real CSS regression before it shipped — the first one in this whole engagement: a test fixture's fake id `"order-1"` collided with Tailwind's `order-{n}` utility class and leaked into the production bundle. Renamed the fixture; confirmed the CSS hash is byte-identical to baseline again.
- [x] Live-Supabase integration tests for real owner-scoping, fee persistence, and pagination against the seeded data (same non-CI-gated pattern as Phases 2/4).
- [x] Verified in a real browser: shortlist toggling, rate-card editing, sending an Order Room message, and a full project-brief publish — zero console errors, zero visual change.
- [x] Re-verified the full baseline: `typecheck`/`lint`/`test`/`build` green across all three packages (172 tests), CSS hash confirmed byte-identical.

### `features.md` Phase 6 — Payment & escrow integration
- [x] `PaymentProvider.real` — genuine Paystack implementation (initialize/verify/refund/HMAC-SHA512 webhook verification); `payment.stripe.ts`/`payment.airwallex.ts` stub the same interface for later regions. Real payouts (`releaseFunds`) throw a descriptive, flagged error: Paystack transfers need a `recipient_code` from creator bank details, which no phase through Phase 6 collects — a real, documented gap, not an oversight.
- [x] Ledger-based escrow: `POST /bookings/:id/pay` charges `base+clientFee` and never advances `BookingState`; only the signature-verified `POST /webhooks/paystack` sets `ESCROW_LOCKED`. No endpoint anywhere lets a client-side callback advance state on its own.
- [x] Idempotency without a generic key-store table: `Payment.providerRef` is `@unique`; `PaymentEvent` gained `eventId` + a `@@unique([paymentId, type, eventId])` constraint so a replayed webhook hits a DB unique-violation and no-ops; release/refund atomically claim the transition via conditional `updateMany` before calling the provider (two new transient `PaymentStatus` values, `RELEASING`/`REFUNDING`, make the claim window observable and rollback-able on provider failure).
- [x] Full booking money-lifecycle routes: `POST /:id/pay`, `PATCH /:id/deliver`, `PATCH /:id/approve` (releases escrow, base−11% to the talent), `PATCH /:id/dispute`, `POST /:id/refund`.
- [x] Tests (highest-coverage, money path): escrow ledger/fee-split math; idempotent webhook replay; unsigned/tampered webhook rejected; client-callback-never-advances-state (authority); concurrency (two simultaneous webhooks, two simultaneous releases — no double-pay); grep-equivalent allowlist assertions that `Payment.provider` is never `"fincra"`.
- [x] Live-Supabase e2e integration test: real checkout → webhook → `ESCROW_LOCKED` → deliver → approve → `PAYMENT_RELEASED` with correct fee splits, replay-safety, and a full refund path — all against the real seeded Supabase project (`prisma/phase6.integration.test.ts`).
- [x] Fixed a latent cross-file race in the live-DB integration suite, surfaced (not caused) by adding a third live-DB test file: Vitest ran integration files in parallel by default, letting a row-count-idempotency check in one file race against in-flight bookings from another. Fixed with `fileParallelism: false` in `vitest.integration.config.ts` — these files share one live database and were never isolated from each other.
- [x] **Known, deliberately-left-open gap:** `Checkout.tsx` is not wired to any of this — still the scripted 2.5s delay, still says "FINCRA" three times. Phase 6's kickoff was API-only scope; asked explicitly whether to fold the frontend rewiring in now, and the answer was to leave it and log the gap instead (this entry, plus `log.md` Session 16) rather than silently carry a known acceptance-criteria gap forward.
- [x] Re-verified the full baseline: `apps/api` typecheck/tests green (186 unit + 16 live-DB integration tests); `apps/web` untouched this phase.

### `features.md` Phase 7 — KYC (Smile Identity) + AI style-tagging as two independent systems
- [x] `KycProvider`/`AiTaggingProvider` real+mock implementations; `Creator.verification` (KYC) and `Creator.styleTags` (AI) kept fully independent columns/code paths (X3) — locked in with a schema test proving `KycCheck` has no name/DOB/ID-number column, i.e. PII is never persisted at all.
- [x] Known, deliberately-left-open gap: no "start identity verification" UI form exists — the endpoints are real and tested, but no screen in the original design collects the legal name/DOB/ID fields `KycProvider.startCheck` needs; building one is new UI scope, not a wiring pass. See `log.md` Session 17.

### `features.md` Phase 8 — Google Calendar sync (provider layer) + Phase 9 — Notifications backend
- [x] `CalendarProvider` real OAuth (encrypted refresh token), `getBusyTimes`/`createMeet`; provider-layer only by kickoff design — no `apps/web` screen calls any of it yet, rich availability UX deferred to Phase 13. See `log.md` Session 18.
- [x] Real notifications backend — in-app + queued email/SMS with retry/backoff, per-user preferences (`NotificationPreference`). `Settings.tsx`'s preferences toggle UI stayed unwired at the time (closed in Phase 17's a11y pass with a proper `aria-label`, still not backend-wired). See `log.md` Session 19.

### `features.md` Phase 10 — System screens (transaction history, help & support, terms/privacy)
- [x] Four PRD SYS-01–04 screens shipped for real: transaction history (owner-scoped, fee breakdown), help & support (FAQ + ticket submit/list), versioned Terms/Privacy pages, terms acceptance recorded with version+timestamp at registration. Terms/Privacy content explicitly flagged in-page as a legal-review-pending draft. See `log.md` Session 20.

### `features.md` Phase 11 — Design-token adoption + font self-hosting
- [x] Swapped every exact-match literal px type size to its token across 4 files; added (not yet consumed) font-weight/line-height tokens. Self-hosted all 3 brand fonts (11 `@font-face` rules, `font-display: swap`), dropped both CDN dependencies, added preload links. Backfilled into `log.md` as Session 21 (see `README.md`'s living-document policy — this phase originally shipped with no entry).

### `features.md` Phase 12 — Hardening (security, testing, observability, deployment)
- [x] Security: CSP tightened to `default-src 'none'`, pino log redaction, production DB-URL cross-check, proved (not assumed) no CSRF surface and no KYC PII persistence, `pnpm audit` now CI-blocking with 2 reviewed/allowlisted exceptions.
- [x] Testing: per-file coverage thresholds on money/auth/state modules; new cross-cutting hardening test file; first continuous-state e2e test (book→pay→webhook→deliver→approve against one stateful mock).
- [x] Observability: `x-request-id`, `/ready`, `/metrics`, optional Sentry (no-op without `SENTRY_DSN`). Deployment: both Dockerfiles + `docker-compose.yml` (reviewed line-by-line; no Docker daemon available to build locally that session — CI's `docker` job is the real acceptance check). See `log.md` Session 22.

### `features.md` Phase 12A — Media Kit, Verification Video, Physical Attributes
- [x] Three additive extensions: auto-rendered Media Kit PDF (`pdf-lib`, with an upload-override mode), server-authoritative verification-video duration check (a real hand-written ISO-BMFF/MP4 box parser, not an ffprobe wrapper), and Physical Attributes with all six PRD privacy non-negotiables (optional fields, ranges not raw numbers, SEARCHABLE-default, versioned consent, hard-delete, no auto-scoring). Reviewer decisions on verification videos flagged as a known gap (no moderator role exists) — **this is the same gap Phase 17 later confirmed and demonstrated as a real security finding (self-approval), still open.** See `log.md` Session 23.

### `features.md` Phase 13 — Rich availability calendar & time-slot booking (FA-1)
- [x] Server-authoritative `getOpenSlots`/`bookSlot` (Postgres advisory-lock-serialized, race-safe), default-free rule, recurring + exact-date `AvailabilityBlock`s, new `CalendarEvent` model. `Checkout.tsx` and `TalentDashboard.tsx` wired to real slots for the first time — the Phase 6 "Checkout not wired" gap noted above is closed as of this phase.
- [x] Real bug found + fixed via live testing: a concurrent-refresh-token race in `api-client.ts` (concurrent 401s each independently spending the same single-use refresh token, triggering reuse-detection and revoking the session) — fixed with a shared in-flight refresh promise. See `log.md` Session 24.

### `features.md` Phase 14 — Project applications, two-sided + applicant cap (FA-2, FA-4)
- [x] `Application` model (DB-unique per briefId+creatorId), advisory-lock-enforced applicant cap (same pattern as Phase 13's slot booking), full apply/shortlist/reject/select/withdraw lifecycle, selection converts straight into a real booking via the existing `createBooking` path.
- [x] Two real bugs found + fixed via live testing: `createBrief()` never set `status`, so published briefs silently stayed `DRAFT` and never appeared in browse; `GET /projects`'s applicant count reused a caller-filtered array's length instead of a true count, showing "0 applicants" to anyone who hadn't applied yet. See `log.md` Session 25.

### `features.md` Phase 15 — Public marketplace profile / shareable link (FA-3)
- [x] `monologg.co/[handle]` (currently the creator's cuid, not a real slug — flagged) renders fully logged-out with real prices/media/badges; client-side Open Graph/Twitter meta injection (no SSR, so real crawler bots won't see it — an explicitly flagged, out-of-scope tradeoff). `ExternalBookingEntry.tsx` shipped as an intentional Phase-16 placeholder stub. See `log.md` Session 26.

### `features.md` Phase 16 — External-visitor booking + deferred account + escrow-first (FA-5)
- [x] The flagship flow: logged-out guest picks a service/slot, funds escrow, gets a `User`+`Client` auto-created from checkout info (surfaced only once escrow is confirmed, never before — `TODO(conflict:X7)`), and lands in their new dashboard via an emailed set-password/magic-link (reusing `POST /auth/reset-password`, not a parallel mechanism).
- [x] Closed a real, pre-existing gap while at it: the order room previously never checked `Booking.state` at all — chat is now gated on `ESCROW_LOCKED` globally (internal bookings too, not just this flow). Slot-hold expiry (X5, confirmed 30 min) is lazy (checked inside `getOpenSlots`), no cron job. See `log.md` Session 27.

### `features.md` Phase 17 — QA, security & UAT (production gate)
- [x] Independent verification pass — Playwright cross-browser/a11y suite, security authorization-fuzz test, amount-tampering regression test, real-DB concurrency test, NDPA data inventory, UAT script. Fixed one systemic a11y bug (contrast token + missing labels); found and documented (not fixed — out of scope) a P0/P1 security gap and the missing PWA infrastructure. **This phase's own gate is open, not closed — see the Status note at the top of this file and `monologg/qa/2026-07-31-phase17/README.md` for the full PENDING list.** See `log.md` Session 28.

### `features.md` Phase 22 — Code & Structural Review via `/review` (Session 36)
- [x] Executed `/review` workflow: audited recent code diffs, caught and fixed open-slots range check interval flaw in `ExternalBookingEntry.tsx` (`202d621`), verified 100% Vitest test suite pass (19/19 files, 72/72 tests green), logged Eng Review audit, and cleared Review Readiness Dashboard. See `log.md` Session 36.

---

## 🔄 In Progress

- [ ] **Living-document discipline itself.** Ongoing habit, not a one-time task — every future change to the app should also move a checkbox here and add a line to `log.md`, in the same session.

---

## ✅ Full-stack build-out — all phases done (see `features.md` for complete specs)

`features.md` was the authoritative, dependency-ordered backlog for this whole build-out; every phase in it is now built. **Phases were built in dependency order, one at a time, with tests as a gate and a stop-for-review between phases** — the discipline that got this list to all-done, not a rule that stops mattering now. The Phase 17 gate above is what actually decides production-readiness — treat every checkbox below as "built," not as "shippable."

**⚠️ Known conflicts** (see `features.md` §1) — **all resolved**: payment provider is Paystack/Stripe/Airwallex, not FINCRA (X1, resolved Phase 6 backend; `Checkout.tsx`'s copy resolved Phase 13). Fees are 11% talent / 15% client, not 9%/12% (X2, resolved Phase 3). "Thespian AI" is style-tagging only, identity KYC fully separate (X3, resolved Phase 7, backend + UI copy). Applicant cap hard-closes first-come with manual client selection (X4, resolved Phase 14). External-checkout slot hold expires after 30 min, as config (X5, resolved Phase 16). `TODO(conflict:X7)` — a new one from Phase 16, not in the original PRD list: the guest account-materialization timing reconciliation (see that phase's Done entry above) — resolved, documented in code, not open.

### Infrastructure spine (Phases 0–12)
- [x] **Phase 0** — Repo tooling: CI, lint/prettier/strict TypeScript, `CONTRIBUTING.md` — done, see the Done section above; git itself was already done in Phase 9
- [x] **Phase 1** — Monorepo restructure (`monologg/apps/web`, `monologg/apps/api`, `monologg/packages/types`, pnpm workspaces) + typed `api-client` seam, `VITE_API_MODE=mock|live` — done, see the Done section above
- [x] **Phase 2** — Postgres schema via Prisma, migrations, seed data reproducing today's mock fixtures
- [x] **Phase 3** — Fastify backend scaffold, validated env config, provider-interface pattern (every external dependency mocked by default)
- [x] **Phase 4** — Real authentication: JWT access + rotating refresh, argon2id, protected routes, auth middleware — done, see the Done section above
- [x] **Phase 5** — Core domain endpoints (profiles, rate cards, availability, briefs, bookings, order rooms) behind the api-client seam — done, see the Done section above
- [x] **Phase 6** — Payment/escrow integration, Paystack-first, webhook-authoritative, idempotent — done, see the Done section above (`Checkout.tsx` frontend wiring closed in Phase 13)
- [x] **Phase 7** — KYC (Smile Identity) + AI style-tagging as two independent systems — done, see the Done section above and `log.md` Session 17
- [x] **Phase 8** — Google Calendar sync + real Meet links — done, provider layer only by kickoff design; see the Done section above and `log.md` Session 18
- [x] **Phase 9** — Notifications backend (email/SMS/in-app) — done, see the Done section above and `log.md` Session 19
- [x] **Phase 10** — System screens: transaction history, help/support, terms/privacy (PRD SYS-01–04) — done, see the Done section above and `log.md` Session 20
- [x] **Phase 11** — Design-token adoption everywhere + font self-hosting — done, see the Done section above; backfilled `log.md` Session 21
- [x] **Phase 12** — Hardening: security (OWASP pass, NDPA), test coverage, observability, deployment — done, see the Done section above and `log.md` Session 22
- [x] **Phase 12A** — Media Kit, Verification Video, Physical Attributes — done, see the Done section above and `log.md` Session 23

### New feature areas (Phases 13–16, built on the spine above)
- [x] **Phase 13** — Rich availability calendar & time-slot booking (default-free rule, server-authoritative `getOpenSlots`) — done, see the Done section above and `log.md` Session 24
- [x] **Phase 14** — Two-sided project applications with a server-enforced applicant cap; new talent "Projects" nav item — done, see the Done section above and `log.md` Session 25
- [x] **Phase 15** — Public, logged-out marketplace profile at `/[handle]` with Open Graph previews — done, see the Done section above and `log.md` Session 26
- [x] **Phase 16** — Flagship: external-visitor booking, escrow-first, deferred account creation from checkout info — done, see the Done section above and `log.md` Session 27

### Production gate
- [x] **Phase 17** — Independent QA, security/pen-test, load testing, and UAT — done as an automated/documentary pass; **the human sign-off itself is still PENDING** (see the Status note at the top of this file, and `monologg/qa/2026-07-31-phase17/`). See the Done section above and `log.md` Session 28.

---

## How to use this file

- **Starting a task:** move its line from "Not started" to "In Progress," with a one-line note on who/when if useful.
- **Finishing a task:** move it to "Done," under the phase it belongs to (add a new phase heading if it doesn't fit an existing one).
- **New scope discovered:** add it to "Not started" rather than letting it live only in a conversation — if it's not here, the next person won't know about it.
- Always pair a checkbox move with a `log.md` entry (the "why/how") — this file only tracks the "what/status."
