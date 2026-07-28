# Monologg — Design & Architecture Reference

**Last updated:** 2026-07-28
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

The original product brief, UX spec, and a design-system prompt live in `app/src/imports/`:

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

**Full dependency list, post-cleanup (2026-07-27):** `clsx`, `lucide-react`, `motion`, `react-router`, `tailwind-merge` (runtime) + `@tailwindcss/vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite` (dev/build). Everything else that shipped in the original Figma Make export — `@emotion/react`, `@emotion/styled`, `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-themes`, `react-day-picker`, `react-dnd`, `react-dnd-html5-backend`, `react-hook-form`, `react-popper`, `react-resizable-panels`, `react-responsive-masonry`, `react-slick`, `recharts`, `sonner`, `tw-animate-css`, `vaul`, plus `vite-plugin-dts` and its `@microsoft`/`@rushstack` transitive tree — was never imported by any page and has been removed (`node_modules` went from 292MB to 134MB). See `bug.md` and `log.md` for what broke and how it was caught.

### Backend, database, authentication — **none exist**

This is the most important fact for anyone continuing this project: **Monologg today is 100% frontend.** There is:
- **No server / API layer.** Zero `fetch`/`axios`/API calls anywhere in the codebase.
- **No database.** Every list of data (orders, talents, projects, stats, messages) is a hardcoded JavaScript constant defined at the top of its page file (e.g. `TALENTS`, `PROJECTS`, `ORDERS`, `STATS` in `ClientDashboard.tsx`/`TalentDashboard.tsx`).
- **No real authentication.** `AuthFlow.tsx`'s "Sign In" just inspects whether the typed email contains the substring `"client"` or `"brand"` and routes to `/client` or `/dashboard` accordingly — it does not check a password, call any endpoint, or issue a session token. "Register" navigates straight to onboarding. There is no logged-in/logged-out state anywhere in the app; every route is reachable directly by URL.
- **No persistence** except one thing: the light/dark theme preference, stored in `localStorage` under the key `monologg-theme` (`src/app/Root.tsx`). Everything else resets to its hardcoded initial state on page refresh.
- **No real payment integration.** The PRD specifies FINCRA as the escrow payment gateway; `Checkout.tsx` simulates this with a 2.5-second delay before showing a "confirmed" state.
- **No real AI verification.** The PRD's "Thespian AI" verification step is implemented in `CreatorOnboarding.tsx` as a timed loading animation ("Thespian AI is reviewing your performance parameters…") followed by a hardcoded set of tags and a verified badge — no model is called.

**Implication for whoever builds the backend next:** the mock data shapes already in each page file (e.g. the `Order`, `Talent`, `Project` object literals) are a reasonable starting point for an actual data model/API contract, since they represent what the UI already expects to receive.

---

## 4. Auth flow reality (detail)

`src/app/pages/AuthFlow.tsx` implements four in-page views (`splash`, `register`, `login`, `forgot`) as local component state, not real routes:

- **Register:** collects name/email/password/role (Talent or Client) + a terms checkbox client-side; on submit, routes to `/onboarding` (Talent) or `/onboarding/client` (Client). No account is created anywhere.
- **Login:** collects email/password; on submit, routes to `/client` if the email string contains `"client"` or `"brand"`, otherwise `/dashboard`. This is explicitly a mock, commented in the code as `// Mock: detect client vs talent by email suffix`.
- **Forgot password:** shows a "check your email" confirmation state after submit; no email is sent.
- There are also two direct-bypass buttons on the login screen ("Talent" / "Client") that skip credentials entirely and route straight to the respective dashboard — useful for demoing, but confirms there's no gate to get past.

---

## 5. Design system

### Single source of truth: `app/src/styles/tokens.css`

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

1. **No API/backend service of any kind.** → `features.md` Phases 1–3.
2. **No database/data model.** Mock constants per page are the closest thing to a schema today. → Phase 2.
3. **No real authentication** (no password check, no session, no JWT, no protected routes). → Phase 4.
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

- **Local dev app:** `app/` — `npm run dev` → `http://localhost:5173`. Routes: `/`, `/auth`, `/onboarding`, `/onboarding/client`, `/dashboard`, `/client`, `/order/:id`, `/brief`, `/checkout`, `/settings`, `/design-system`.
- **Design system reference:** `http://localhost:5173/design-system`, or regenerate the standalone static file with `npm run build:designsystem` (outputs to `dist-designsystem/`, wraps into a single HTML file for sharing).
- **Standalone, no-server HTML files** (double-click, open in any browser, no `npm run dev` needed): `monologg-app.html` and `monologg-design-system.html` at the project root. The app version uses a hash router (`#/dashboard` style URLs) instead of the browser-history router the localhost version uses, since `file://` pages can't use `pushState`. Regenerate after any code change:
  ```
  cd app
  npm run build && npm run build:standalone   # app
  npm run build:designsystem                   # design system
  ```
  then re-inline the built JS/CSS into the two root-level HTML files (ask whoever/whatever is continuing this project to re-run the inlining step, or script it — it's a few lines of Python, see `log.md`).
- **Source control:** `github.com/adedoyin899/mono2`, this project under the `monologg/` folder (that repo also holds an unrelated `gstack` project at its root — kept deliberately separate). Push access is via a repo-scoped deploy key (`~/.ssh/id_ed25519_mono2`, host alias `github.com-mono2`), not the account's general SSH key.

See `log.md` for exactly how `app/` came to exist and what was changed inside it, `bug.md` for defects found and fixed, `process.md` for a plain-language walkthrough of the whole engagement, and `features.md` for everything not yet built.
