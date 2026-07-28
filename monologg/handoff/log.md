# Monologg — Implementation Log

**Last updated:** 2026-07-27
**This is a living document** — append a new dated entry every time a code change happens, in the same session as the change. See `README.md` for the full update policy.

Chronological record of what was done, in what order, and why. Each entry names the files touched so you can `git blame`-equivalent your way back to any decision (note: this project is **not** currently a git repository — see `process.md` if you want to fix that first).

All work below happened in one continuous engagement, split into two sessions by subject matter. Dates use the session date, 2026-07-27, since there's no commit history to derive exact timestamps from.

---

## Session 1 — Getting the product running

**Goal:** the user handed over a folder (`figj monol`) containing a zipped Figma Make export and asked for a link to see the most up-to-date version of the product.

1. **Discovery.** Listed the folder contents: `ATTRIBUTIONS.md`, `pnpm-workspace.yaml`, `postcss.config.mjs`, `tsconfig.types.json`, `vite.config.ts`, two logo PNGs, and four zip archives (`cjs.zip`, `css.zip`, `guidelines.zip`, `src (1).zip`). Identified this as a Figma Make export configured for **library build mode** (i.e. designed to be published as an importable npm package, not run as a standalone app) — it had no `index.html` or root `package.json` of its own (those were inside the zips).

2. **Extracted all four zips** to a scratch directory and inspected contents:
   - `src (1).zip` → the real React/TypeScript source (`app/`, `styles/`, `imports/`, `lib/`, `index.ts`)
   - `cjs.zip` → the real `package.json` (name `@figma/my-make-file`) plus a batch of one-off codemod scripts (`fix_dashboard.cjs`, `patch_share.cjs`, etc.) — tooling artifacts from the Figma Make generation process, not part of the running app
   - `css.zip` → a shadcn theme CSS file
   - `guidelines.zip` → Figma Make's own authoring guidelines docs

3. **Assembled a runnable project** at `app/`:
   - Copied the extracted `src/` and the real `package.json`
   - Wrote a new `index.html` + `src/main.tsx` entry point (the original zips had no app entry, only library-mode config)
   - Wrote a new `vite.config.ts` in **app mode** (dropped the library-mode `build.lib`/`vite-plugin-dts` config from the original, since that produces an importable package, not a servable site)
   - Ran `npm install` (installed `react`/`react-dom` as the only missing peer deps; everything else was already pinned in `package.json`)

4. **Fixed the router for sandboxed preview.** Temporarily swapped `createBrowserRouter` → `createHashRouter` in `src/app/routes.tsx` for a one-off static Artifact build, since browser-history routing can misbehave inside a sandboxed iframe with no real origin.

5. **Built and published a static preview Artifact** — inlined the built JS/CSS into a single self-contained HTML file (`monologg-preview.html`) and published it so the user could view the product without running anything locally.

6. **Set up the real local dev server per user request.** Copied the working build into a persistent `app/` folder (first attempt used `rsync --exclude 'dist'`, which had an unintended side effect — see `bug.md` #1), reverted the router back to `createBrowserRouter` (real localhost doesn't need the hash-router workaround), and started `vite` in the background on **`http://localhost:5173`**.

---

## Session 2 — Design system audit, remediation, and documentation

**Goal:** the user asked to audit the design system, document it in a `designsystem.html`, and make sure component/token updates "propagate everywhere" — i.e. make the system genuinely single-sourced, not just described.

### 2.1 Audit (read-only)

Ran a full audit across `src/app` covering: every token definition in the codebase, how consistently pages actually reference those tokens vs. hardcoding values, a full inventory of recurring UI patterns not yet extracted into components, typography/spacing/radius consistency, icon usage, and motion/animation patterns. Findings (full detail preserved in the conversation, summarized in `design.md` §5 and `bug.md`):

- Tokens were ~98% consistently used for color/shadow, but lived inside a **JS template string** in `Root.tsx` (injected via `<style dangerouslySetInnerHTML>`) rather than a real stylesheet.
- Two **dead/conflicting CSS files** were shipping duplicate, unused token systems: `src/styles/theme.css` (never imported) and `src/DoyinXMonologgCopy/styles.css` (imported but zero code references).
- The two largest pages, `TalentDashboard.tsx` and `ClientDashboard.tsx`, used **zero** `var(--radius-*)` references — 100% on Tailwind's untokenized default radius scale, which happened to look consistent today but wouldn't update if the token values ever changed.
- Modal scrim color (`rgba(0,0,0,0.5)` / `rgba(0,0,0,0.6)`) was hardcoded in 10 separate places instead of being a token.
- A small cluster of `text-gray-400`/`text-gray-500` Tailwind default classes bypassed the text-color tokens.
- Framer Motion's JS-side durations/easings were re-typed as numeric literals in 8+ places (unavoidable in part — CSS custom properties aren't readable from JS — but not centralized).
- No components existed beyond `Button`/`Input`; Sidebar, BottomNav, Modal, Avatar, Badge, and FormField were each hand-duplicated 2–11× across pages with drifting details (padding, margins, color shade).

### 2.2 Foundation fix

- **Extracted** the inline `CSS_VARS` string out of `Root.tsx` into a real stylesheet, `src/styles/tokens.css` — the single source of truth from this point on. Added missing tokens that were needed but didn't exist: `--color-overlay` / `--color-overlay-strong`, a `--font-size-xs…5xl` scale, `--duration-slow`.
- **Retired** `theme.css` and `DoyinXMonologgCopy/styles.css` from the CSS import chain (`src/styles/index.css`), with header comments explaining why — later deleted outright in the cleanup pass.
- **Created `src/lib/motionTokens.ts`** exporting `DURATION_FAST/MED/SLOW` and `EASE_OUT/SPRING` as plain JS values mirroring the CSS tokens, then rewired all 12 recurring `motion.div transition={{ duration: 0.28, ease: [...] }}`-style literals across `Checkout.tsx`, `ClientOnboarding.tsx`, `Settings.tsx`, `ClientDashboard.tsx`, `CreatorOnboarding.tsx`, `OrderRoom.tsx`, `ProjectBrief.tsx`, `TalentDashboard.tsx` to import from it instead.
- **Replaced the 10 hardcoded modal-scrim `rgba()` values** across `OrderRoom.tsx`, `ClientDashboard.tsx`, `TalentDashboard.tsx` with `var(--color-overlay)` / `var(--color-overlay-strong)`.
- **Fixed the untokenized radius classes**: systematically remapped `rounded-2xl → rounded-[var(--radius-lg)]`, `rounded-xl → rounded-[var(--radius-md)]`, `rounded-lg → rounded-[var(--radius-sm)]` across `TalentDashboard.tsx` (41 occurrences) and `ClientDashboard.tsx` (16 occurrences) — verified the Tailwind default values and the token values were numerically identical, so this was a pure wiring fix with zero visual change.
- **Fixed the `text-gray-*` bypasses** (found inside the Withdraw/Notifications/Day-Detail modals in `TalentDashboard.tsx`) to use `var(--color-text-secondary)`/`var(--color-text-tertiary)`.

### 2.3 Shared component extraction

Built five new components in `src/app/components/ui/`:

| Component | Notes |
|---|---|
| `Modal.tsx` | Owns scrim color/blur/positioning (`align`, `strength` props); panel content stays bespoke per call site |
| `Avatar.tsx` | 4 sizes (`sm/md/lg/xl`), background/color props |
| `Badge.tsx` | 5 tones (`neutral/accent/success/warning/error`) × 3 sizes |
| `FormField.tsx` | Label + control wrapper |
| `Sidebar.tsx` + `BottomNav.tsx` | Generic over a `<T extends string>` tab type, driven entirely by props (`navItems`, `identity`, `indicatorId`) |

Then wired them into their real call sites:
- **Sidebar/BottomNav** replaced the near-duplicate `Sidebar`/`ClientSidebar` and `BottomNav` functions previously defined locally inside `TalentDashboard.tsx` and `ClientDashboard.tsx`.
- **Modal** replaced the outer scrim wrapper in all 10 modal instances across `OrderRoom.tsx` (3), `ClientDashboard.tsx` (1), `TalentDashboard.tsx` (6) — including extending `Modal` with a third `align="right"` variant for the slide-in Notifications drawer, which didn't fit the original center/bottom-sheet design.
- **FormField** replaced label+input pairs in `Settings.tsx` (5 fields) and `ProjectBrief.tsx` (7 fields, including two that previously used a slightly-different `mb-3` margin — now standardized to the component's `mb-2`).
- **Badge** replaced status pills in `TalentDashboard.tsx`, `ClientDashboard.tsx` (including two 3-way conditional status pills, `active`/`draft`/other), and `Settings.tsx` (2 instances, one of which needed to stay wrapped in a `motion.div` for its enter/exit animation since `Badge` itself is a plain non-animated `<span>`).
- **Avatar** replaced person-identity circles in `ClientDashboard.tsx` (3 instances) and `OrderRoom.tsx` (2 instances). Icon-in-circle decorations (e.g. an Award icon, a stat-tile icon) were deliberately left alone — those aren't person avatars.

At each step, ran `npx vite build` to confirm no compile errors before moving to the next file.

### 2.4 Documentation page

- Built a **live route, `/design-system`** (`src/app/pages/DesignSystem.tsx`), added to `src/app/routes.tsx`. It renders the actual imported components (`Button`, `Badge`, `Avatar`, `FormField`, `Modal`) and reads live CSS custom property values via `getComputedStyle` at render time, so it can never drift from `tokens.css`. Includes a Talent/Client toggle and a Light/Dark toggle to preview the role-adaptive accent and theme swap live.
- Added a second, standalone Vite entry (`design-system.html` + `src/main-designsystem.tsx` + `vite.config.designsystem.ts`) that renders just the `DesignSystem` page (wrapped in a `MemoryRouter` so it doesn't need real browser routing) — this builds a small, shareable static snapshot independent of running the dev server. Added `npm run build:designsystem` to `package.json` for easy regeneration after future token/component changes.
- Built this, inlined the output JS/CSS into a single self-contained HTML file, and published it as an Artifact.

### 2.5 File cleanup

User asked for a redundant-file audit before deleting anything. Presented findings, got explicit confirmation, then removed:

**From `app/`:** `src/test.txt` (stray placeholder), `src/styles/theme.css` (dead, conflicting), `src/styles/globals.css` (empty, unreferenced — found and flagged during the cleanup, not part of the original ask), the whole `src/DoyinXMonologgCopy/` folder (dead CSS + duplicate guidelines doc), `src/index.ts` (unused library barrel export), `tsconfig.types.json` and `postcss.config.mjs` (both belonged to the original library-mode build config, inert in the app-mode copy).

**From the parent `figj monol/` folder** (after a separate confirmation, since these were the original untouched export): `.DS_Store` (macOS junk, deleted unconditionally — always safe) and the four original zip archives (`cjs.zip`, `css.zip`, `guidelines.zip`, `src (1).zip`) — user explicitly chose to delete these since `app` had already superseded and improved on their contents.

Rebuilt after each deletion round; output was byte-identical to the pre-cleanup build both times, confirming nothing load-bearing was removed.

### 2.6 This handoff documentation

Created `handoff/design.md`, `handoff/log.md` (this file), `handoff/bug.md`, `handoff/process.md` to make the current state, the reasoning behind it, the defects found along the way, and the overall process legible to whoever continues this project next.

---

## Session 3 — Standalone HTML builds + dependency cleanup

**Goal:** the user reported that `index.html`/`design-system.html` didn't open correctly outside the dev server, and separately asked to delete unused packages (including possibly Vite itself) to simplify the file structure and size.

### 3.1 Standalone, double-clickable HTML files

- **Diagnosed:** `index.html`/`design-system.html` in `app/` are Vite *source* shells (`<script type="module" src="/src/main.tsx">`) — they only work through Vite's dev server, which transpiles TypeScript live and resolves the absolute `/src/...` path. Opened directly as a `file://` URL, the browser can't run raw `.tsx`, can't resolve that path, and modern browsers block ES-module `fetch()` over `file://` regardless.
- **Fixed the design-system page** by building it (already used `MemoryRouter`, so no URL-based routing to break) and inlining the built JS/CSS directly into a single HTML file — no external asset files that could go missing.
- **Fixed the app** the same way, but first had to solve the routing problem: the real app uses `createBrowserRouter` (pushState-based), which doesn't work when opened as a local file (no server to resolve arbitrary paths, and `file://` pages can't reliably `pushState` to a different path). Refactored `src/app/routes.tsx` to export the route tree separately (`routeTree`) from the router instantiation, added `src/app/AppStandalone.tsx` using `createHashRouter(routeTree)` (URLs like `#/dashboard`), and a new entry point (`src/main-standalone.tsx`, `standalone.html`, `vite.config.standalone.ts`, `base: './'`, new `npm run build:standalone` script). Same components, same tokens, same route list — only the router differs, and only for this build target.
- Built both, then inlined the built JS/CSS into single self-contained files at the project root: `monologg-app.html` and `monologg-design-system.html`. Verified via grep that no `./assets/...` references were left dangling, and confirmed (via `grep -rn "React.lazy\|import("`) there are no dynamic imports in the source that could have produced separate chunks the inlining would miss.
- Opened both in the default browser (`open ...html`) for the user to visually confirm.

### 3.2 Dependency cleanup

- Checked every dependency in `package.json` against actual `import ... from '...'` usage in `src/`. Found **20 of 26 runtime dependencies were never imported anywhere** — leftover shadcn/ui-style scaffolding from the original Figma Make export: `@emotion/react`, `@emotion/styled`, `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-themes`, `react-day-picker`, `react-dnd`, `react-dnd-html5-backend`, `react-hook-form`, `react-popper`, `react-resizable-panels`, `react-responsive-masonry`, `react-slick`, `recharts`, `sonner`, `tw-animate-css`, `vaul`. Also found `vite-plugin-dts` (leftover from the old library-mode build, pulling in ~41MB of `@microsoft`/`@rushstack` transitive deps) unreferenced by either current Vite config.
- **Vite itself** was flagged separately rather than deleted outright: it's what powers both `npm run dev` and the ability to rebuild the two standalone HTML files above after any future change. Asked the user to confirm before removing it; they chose to keep it and remove everything else unused.
- Removed the 20 dead runtime packages + `vite-plugin-dts` from `package.json`, ran `npm install` — **removed 204 packages, `node_modules` dropped from 292MB to 134MB.**
- **Caught a false negative in the cleanup:** the `from '...'` grep missed `tw-animate-css`, which was pulled in via a CSS `@import 'tw-animate-css';` in `src/styles/tailwind.css`, not a JS import — so the first rebuild after pruning failed (`Can't resolve 'tw-animate-css'`). Checked whether any real utility classes from it (`animate-in`, `fade-in`, `slide-in-from-*`, etc.) were used anywhere first — none were, the one text match was inside a code comment, not a class — then removed the dead `@import` line from `tailwind.css` itself rather than reinstalling the package. See `bug.md` #5.
- Removed three now-empty leftover npm scope folders (`@microsoft`, `@react-dnd`, `@rushstack`) that `npm install` didn't clean up on its own.
- Rebuilt all three targets (app, standalone, design-system) clean, smoke-tested the dev server on a scratch port (HTTP 200), and regenerated `monologg-app.html`/`monologg-design-system.html` to match the pruned build.

---

## Session 4 — File structure reorganization

**Goal:** the user asked for the file structure to be understandable to both developers and non-technical people, and for unused files to be identified and removed (with confirmation before any deletion).

### 4.1 Survey and findings

Walked the entire tree (parent folder + everything inside `app/`) and split findings into two buckets:
- **Definitely dead, no judgment call:** `.DS_Store` files (parent + `app/`), and four parent-level files — `pnpm-workspace.yaml`, `postcss.config.mjs`, `tsconfig.types.json`, `vite.config.ts`. These were orphaned leftovers from the original library-mode Figma export, sitting at the parent level with **no `package.json` there at all** to run them — the parent-level `vite.config.ts` even referenced `./src/index.ts` and `vite-plugin-dts`, neither of which exist at that level. Confirmed 100% inert before deleting.
- **Judgment calls, asked the user first:** 18 unreferenced PNG screenshots in `src/imports/` (~18MB, confirmed via grep that no page or component imports them), an early/shorter draft UX spec (`pasted_text/monologg-ux-spec.md`, 739 lines vs. the current 1309-line spec), and whether to rename `dev-preview/` → `app/` + add a root wayfinding README.

User chose, for all three: keep-but-organize into clearly labeled folders (not delete), and yes to both the rename and the new README.

### 4.2 Execution

- Deleted the confirmed-dead files (both `.DS_Store`s, the four orphaned parent-level config files).
- Renamed `dev-preview/` → `app/`.
- Created `brand/` at the project root and moved the two logo PNGs (`logo purple.png`, `logo white.png`) into it — they were unused by any component but are real brand assets, not junk.
- Created `app/src/imports/reference-screenshots/` and moved all 18 unreferenced PNGs into it.
- Created `app/src/imports/historical-drafts/` and moved three superseded documents into it: `monologg-ux-spec.md` (renamed to `monologg-ux-spec-early-draft.md` to make its status obvious at a glance), `MONOLOGG_DESIGN_SYSTEM.md`, and `monologg_design_prompt.md`. The latter two were already documented as "superseded" in `design.md` §1, so grouping all three historical documents together (rather than just the one the user explicitly asked about) was a natural extension of the same decision — flagged here rather than done silently.
- Removed the now-empty `pasted_text/` folder.
- Added a root-level `README.md` — the single wayfinding document for anyone opening the project folder for the first time, technical or not: how to just view the product (`monologg-app.html`), how to run/edit it (`app/`), and where the full documentation lives (`handoff/`).
- Updated every `dev-preview` reference across all `handoff/*.md` files to `app` (bulk `sed` pass, then manually verified and fixed the one occurrence inside a code block that the pattern missed), and rewrote `design.md`'s source-documents table to reflect the new `historical-drafts/`/`reference-screenshots/` folders.

### 4.3 Verification

Rebuilt all three targets (`app`, `standalone`, `designsystem`) from the renamed `app/` folder — all three built clean, with byte-identical CSS/JS output to before the rename (only the file paths changed, not the code). Regenerated `monologg-app.html`/`monologg-design-system.html` to match. Smoke-tested the dev server on a scratch port — still responds `HTTP 200`.

**Incident during cleanup:** while removing a stray leftover `.vite` cache folder at the old `dev-preview/` path, a `pkill` pattern matched too broadly and killed the actual long-running localhost dev server on port 5173 (still alive from an earlier session, serving from the pre-rename path). Caught it via the background-task failure notification; restarted it immediately from the renamed `app/` folder and confirmed `http://localhost:5173` responded again.

---

## Session 5 — Dark-mode toggle fix on the standalone design-system page

**Goal:** user reported the dark-mode toggle on `monologg-design-system.html` didn't work.

- **Root cause:** `DesignSystem.tsx` reads theme state via `useTheme()` (`useContext(ThemeContext)`). In the real app, `Root.tsx` supplies both the context value and the `.dark` class that `tokens.css` keys its dark-mode overrides off. The standalone design-system build (`main-designsystem.tsx`) renders `DesignSystem` directly under a bare `MemoryRouter`, with no `Root` in the tree — so `useTheme()` silently fell back to the context's default, `{ isDark: false, toggle: () => {} }`. Clicking "Dark" called a no-op.
- **Fix:** extracted the theme state/persistence logic out of `Root.tsx` into an exported `useThemeState()` hook (`src/app/Root.tsx`) — same `localStorage` key (`monologg-theme`), same behavior, now usable outside of `Root`. Added a small `StandaloneThemeProvider` inside `main-designsystem.tsx` that calls this hook and supplies the same `ThemeContext.Provider` + `.dark`-class wrapper `Root` would have. `Root.tsx` itself now just calls `useThemeState()` too — zero behavior change for the real app.
- Rebuilt the design-system target, sanity-rebuilt the other two targets (`app`, `standalone`) since `Root.tsx` changed and both depend on it — all three clean. Regenerated `monologg-design-system.html` and opened it for the user to confirm visually.
- See `bug.md` #7 for full detail.

---

## Session 6 — Landing page visual rework

**Goal:** the user provided two external style-reference files (`saaswebskill.skill` — codename "Visitors," a white-canvas/lavender-accent SaaS analytics style; `saaswebskill2.skill` — codename "Shade," a near-monochrome editorial style with hard-offset "paper cutout" button shadows) and asked for the landing page's visual design to be reworked by combining ideas from both into something that couldn't be traced back to either — while keeping all existing Monologg copy, branding, and colors — with more imagery, bento grids, 3D-style icons, and an overall "Series C" polish.

- **Found the two `.skill` files** sitting in the project root (`/figj monol/saaswebskill.skill`, `saaswebskill2.skill`) — plain text style-reference documents, not registered Claude skills (they don't live under `~/.claude/skills`, so they wouldn't be invoked via the Skill tool). Read both in full.
- **Synthesis approach:** rather than borrowing either reference's literal colors (`#918df6` lavender, `#855cf7` violet) or fonts (OpenRunde, Inter Display), extracted the underlying *mechanics* from each and reskinned them entirely in Monologg's own existing palette and type (General Sans, Plus Jakarta Sans, JetBrains Mono — nothing in `tokens.css` changed value). From "Visitors": atmospheric gradient bands, pill CTAs, metric-callout cards. From "Shade": hard-offset shadows (no blur — a "poster," not a Material card), oversized editorial display type, full-bleed photography, mono-tracked eyebrow labels. The gradient itself blends Monologg's own red (Talent) and purple (Client) — a combination neither reference uses, and one that's thematically Monologg's alone (the two-sided marketplace).
- **Added two new, additive-only token pairs** to `tokens.css`: `--gradient-brand`/`--gradient-brand-soft` (red→purple diagonal) and `--shadow-cutout`/`--shadow-cutout-sm` (hard offset shadow, tuned per light/dark mode). Nothing existing was changed — these are new tokens only referenced from the landing page, so dashboards/Order Room/Settings are unaffected.
- **Extended `Avatar.tsx`** with an optional `src`/`alt` prop (backward compatible — every one of its ~25 existing call sites across the app is untouched) so it can render a real photo with graceful fallback to initials if the image fails to load.
- **Rebuilt `LandingPage.tsx`** end to end, keeping every existing copy string, stat, testimonial quote, FAQ answer, and pricing figure exactly as they were (only added a `photo` field to each testimonial). Structural changes: two-column hero with a floating, ambiently-animated "Order Room" mockup card (built from real `Avatar`/`Badge` components, not a static image) and a dual red/purple gradient atmosphere; an overlapping-photo social-proof cluster; niche cards given the hard-cutout shadow treatment with alternating tilt; a new gradient-filled `IconTile` primitive used everywhere a flat icon circle used to be, for a dimensional "3D icon" look built entirely in CSS (no external render assets); the six-item feature grid restructured into a bento layout (`grid-auto-flow: dense`, one 2×2 "hero" feature card, one tall gradient-filled stat card reusing the real `₦2.4B+ Paid Out` figure) instead of a flat 3-column grid; a new full-bleed photography section between Features and the Clients section; testimonial cards now show real photos via the extended `Avatar`.
- **Verification:** rebuilt all three targets (`app`, `standalone`, `designsystem` — the latter two matter because `Avatar.tsx` and `tokens.css` are shared) — all three built clean. Regenerated `monologg-app.html` and opened the live localhost page for the user to review.
- **Left as-is, flagged for the user:** the two `.skill` reference files remain in the project root — not moved or deleted, since they weren't part of the file-cleanup pass and their disposition (keep as design reference, or move into `handoff/` or delete) is the user's call.

---

## File inventory: what changed and why (quick reference)

| File | Change |
|---|---|
| `src/styles/tokens.css` | **New.** Single source of truth for all design tokens |
| `src/app/Root.tsx` | Removed inline `CSS_VARS` string + `<style>` injection; now just imports the stylesheet chain |
| `src/styles/index.css` | Reordered imports (fonts → tailwind → tokens) to fix a CSS `@import` ordering bug; dropped the dead `DoyinXMonologgCopy` import |
| `src/styles/theme.css`, `src/DoyinXMonologgCopy/` | Deleted (previously deprecated-in-place, then removed in cleanup) |
| `src/lib/motionTokens.ts` | **New.** JS-side mirror of motion tokens |
| `src/app/components/ui/Modal.tsx`, `Avatar.tsx`, `Badge.tsx`, `FormField.tsx`, `Sidebar.tsx`, `BottomNav.tsx` | **New** shared components |
| `src/app/pages/TalentDashboard.tsx`, `ClientDashboard.tsx` | Radius tokens fixed, local Sidebar/BottomNav removed and replaced with the shared components, Modal/Badge/Avatar wired in, `text-gray-*` bypasses fixed |
| `src/app/pages/OrderRoom.tsx`, `ProjectBrief.tsx`, `Settings.tsx`, `Checkout.tsx`, `ClientOnboarding.tsx`, `CreatorOnboarding.tsx` | Motion tokens wired in; Modal/FormField wired in where applicable |
| `src/app/pages/DesignSystem.tsx`, `src/app/routes.tsx` | **New** page + route |
| `design-system.html`, `src/main-designsystem.tsx`, `vite.config.designsystem.ts`, `package.json` (`build:designsystem` script) | **New** — standalone design-system build |
| `index.html`, `src/main.tsx`, `vite.config.ts` (in `app/`) | **New** — app-mode entry point (didn't exist in the original library-mode export) |
| `src/app/routes.tsx` | Route tree extracted into exported `routeTree`, reused by both `createBrowserRouter` (dev/host) and the new hash router |
| `src/app/AppStandalone.tsx`, `src/main-standalone.tsx`, `standalone.html`, `vite.config.standalone.ts`, `package.json` (`build:standalone` script) | **New** — hash-router build target for the standalone, no-server HTML file |
| `monologg-app.html`, `monologg-design-system.html` (project root) | **New** — single-file, self-contained, double-clickable builds (JS/CSS inlined). Regenerate after any change; see `design.md` §7 |
| `src/styles/tailwind.css` | Removed dead `@import 'tw-animate-css';` — no utility classes from it were ever used |
| `package.json` | Removed 20 unused runtime deps + `vite-plugin-dts`; kept `vite` and its build chain (see `bug.md` #5, `design.md` §3) |
| `dev-preview/` → `app/` | **Renamed** for clarity — this is the actual running product |
| `README.md` (project root) | **New** — wayfinding for anyone opening the folder, technical or not |
| `brand/logo purple.png`, `brand/logo white.png` | **Moved** from the project root into a labeled `brand/` folder |
| `app/src/imports/reference-screenshots/` | **New folder** — 18 unreferenced Figma screenshot PNGs moved here from `imports/` directly |
| `app/src/imports/historical-drafts/` | **New folder** — `MONOLOGG_DESIGN_SYSTEM.md`, `monologg_design_prompt.md`, and the early UX-spec draft (renamed `monologg-ux-spec-early-draft.md`) moved here; `pasted_text/` folder removed once empty |
| `pnpm-workspace.yaml`, `postcss.config.mjs`, `tsconfig.types.json`, `vite.config.ts` (parent level) | **Deleted** — orphaned library-mode config with no `package.json` at that level to run them |
| `src/app/Root.tsx` | Theme state/persistence logic extracted into exported `useThemeState()` hook, reusable outside `Root` |
| `src/main-designsystem.tsx` | Added `StandaloneThemeProvider` so the standalone design-system build has a working dark-mode toggle (see `bug.md` #7) |
| `src/styles/tokens.css` | Added `--gradient-brand`/`--gradient-brand-soft`/`--shadow-cutout`/`--shadow-cutout-sm` — additive only, landing-page-only |
| `src/app/components/ui/Avatar.tsx` | Added optional `src`/`alt` photo prop, backward compatible |
| `src/app/pages/LandingPage.tsx` | Full visual rework (hero, bento features, 3D icon tiles, photography) — copy unchanged, see Session 6 |
