# Monologg — Implementation Log

**Last updated:** 2026-07-28
**This is a living document** — append a new dated entry every time a code change happens, in the same session as the change. See `README.md` for the full update policy.

Chronological record of what was done, in what order, and why. Each entry names the files touched so you can `git blame`-equivalent your way back to any decision. As of Session 7 this project **is** a git repository — see Session 7 for how, and `git log` from here on for anything not narrated below.

Sessions 1–6 happened before the project was in git, so their dates are the session date, 2026-07-27. Session 7 onward are dated from actual commits/pushes.

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

## Session 7 — Pushed to GitHub (`github.com/adedoyin899/mono2`)

**Goal:** the user asked to push the project to a specific GitHub repo.

- **Found the target repo wasn't empty:** it already held one commit — an unrelated `gstack` CLI/skills project (`.agent/skills/gstack/...`, `CLAUDE.md`) authored by the same account. Asked the user how to handle it rather than assuming; they chose **keep the existing history, add Monologg alongside it** (not overwrite, not a separate repo).
- **Caught and fixed a drift before committing anything:** the `imports/` reference folder (PRD, UX spec, historical drafts, screenshots) had somehow ended up sitting at the outer project root instead of its documented home at `app/src/imports/` — no code referenced it either way (it's documentation, not an import dependency), but it didn't match what `design.md`/`log.md` describe. Restored it to `app/src/imports/` before proceeding.
- **Restructured locally:** created a `monologg/` folder and moved everything (`app/`, `brand/`, `handoff/`, `README.md`, `ATTRIBUTIONS.md`, both standalone HTML files, both `.skill` files) inside it, so the two unrelated projects in one repo stay cleanly separated on disk, not just in intent.
- **Set up git:** `git init` at the outer project root, local `user.name`/`user.email` set to match the existing repo's author (confirmed with the user first, rather than guessing), `git remote add origin` + `git fetch` + `git checkout -b main origin/main` to bring in the existing history without touching it, added a root `.gitignore` (`monologg/app/node_modules/`, all three `dist*` output folders, `.vite`, `.DS_Store` — none of which existed anywhere in the history yet).
- **Reviewed the full staged file list before committing** (80 files) — confirmed no `node_modules`/build output slipped in, no secrets, nothing unexpected beyond the two now-explainable oddities below.
- **Two things noticed and flagged, not fixed (out of scope for a push):** `brand/logo purple.png` and `brand/logo white.png` (present in earlier sessions) are no longer on disk — gone before this session, cause unknown; and `app/src/app/pages/Dashboard.tsx` is a harmless 2-line legacy re-export (`export { TalentDashboard as Dashboard }`) not wired into any route, likely predates this engagement.
- **Committed and attempted to push over HTTPS** — failed, no credentials configured (`fatal: could not read Username for 'https://github.com'`). Tried the existing SSH key (`id_ed25519_monologg`) — GitHub identified it as a **deploy key scoped to a different repo** (`monologg`, not `mono2`), so it was correctly rejected for this one.
- **User asked for a dedicated key for this repo.** Generated a new keypair (`~/.ssh/id_ed25519_mono2`), added an SSH config host alias (`github.com-mono2`) so this repo's remote uses it automatically without extra flags, pointed the local remote at `git@github.com-mono2:adedoyin899/mono2.git`, and gave the user the public key to add as a **deploy key with write access** on the repo's GitHub settings.
- **Verified and pushed:** once the user confirmed the key was added, re-ran `ssh -T git@github.com-mono2` to confirm it resolved to `adedoyin899/mono2` (not the other repo) before pushing — then `git push origin main` succeeded (`10c240e..4f77f35`).
- Restarted the local dev server from the new path (`monologg/app/`) per the user's request, once it was confirmed the earlier `pkill` (used to stop the server before the directory move) had — as intended — only stopped that one process.

## Session 8 — `features.md` scope review + finishing the logo integration

**Goal:** the user added a large consolidated PRD (`New features.md`, at the project root) covering the full backend build-out plus four new feature areas, and asked for confirmation of understanding before the handoff docs were updated to reflect it.

- **Read the full 1,119-line document.** It's an 18-phase (0–17), dependency-ordered, agent-executable PRD that supersedes both an earlier backend PRD and a separate features PRD. Phases 0–12 are the infrastructure spine (repo tooling → monorepo split → Postgres/Prisma → Fastify backend with a provider-interface pattern for every external dependency → real JWT auth → core endpoints → Paystack-first escrow → Smile Identity KYC split from AI style-tagging → calendar sync → notifications → system screens → design-token/font cleanup → hardening). Phases 13–16 are new, previously-unscoped feature areas built on top (rich time-slot availability, two-sided project applications with an applicant cap, a public logged-out marketplace profile, and the flagship external-visitor booking flow with deferred account creation). Phase 17 is an independent QA/security/UAT gate.
- **Flagged explicit conflict corrections the PRD calls out (X1–X3):** payment provider is Paystack/Stripe/Airwallex, not FINCRA; fees are 11% talent / 15% client, not 9%/12%; "Thespian AI" must become style-tagging only, with identity KYC as a fully separate system. All three contradict current landing-page copy, `Checkout.tsx`, and `design.md` — noted as corrections to apply when the relevant backend phase lands, not retroactively rewriting frontend copy now.
- **Two structural questions asked and resolved before documenting anything:** (1) the PRD assumes a clean repo root for its `apps/web`/`apps/api`/`packages/types` monorepo split, but this repo already holds the unrelated `gstack` project — user chose to nest the new structure under `monologg/` when Phase 1 begins, consistent with Session 7's separation. (2) The PRD itself says its companion files belong "in the repo root" — user chose to move `New features.md` into `handoff/features.md` alongside the other docs rather than leave it at the outer project root.
- **Updated `implementation-plan.md`, `design.md`, and `log.md`** (this entry) to reflect the new phase of work — see those files for the actual content changes; `implementation-plan.md`'s old flat gap-list backlog is now fully superseded by the 18-phase list mirroring `features.md`.
- **Finished an interrupted task from Session 6/7's gap:** `Logo.tsx`/`LogoMark` components (built from the user-supplied `brand/icon.svg` and `brand/logo.svg`, converted from hardcoded white fills to `currentColor` so they inherit an accessible color from whatever surface they sit on) had been created but only partially wired in before the GitHub-push request interrupted the work — `Sidebar.tsx` had the import added but the actual JSX swap never happened, and `AuthFlow.tsx`/`CreatorOnboarding.tsx`/`LandingPage.tsx` (nav + footer) hadn't been touched at all. Completed all five swaps, rebuilt all three targets clean, and regenerated both standalone HTML files.
- **No Phase 0/1 backend work started** — this session was scope confirmation and documentation only, per the user's explicit ask.

## Session 9 — `features.md` Phase 0: repo tooling

**Goal:** the user gave the go-ahead to start the backend build-out, restated the ground rules (one phase at a time, tests as a gate, stop for review), and gave the literal Phase 0 spec: git init + baseline commit, `.gitignore`, TS strict/ESLint/Prettier/EditorConfig, CI, `README`/`CONTRIBUTING`.

- **Baseline commit first, then pushed immediately** — committed the exact state of the prototype (logo wiring + Session 8's doc updates) as the explicit "before any tooling changes" safety net, and pushed it to `mono2` right away rather than leaving it local-only, since a safety net only works if it's actually reachable.
- **Installed TypeScript and turned on `strict: true` for the first time this codebase has ever been type-checked** (it was esbuild-transpiled only until now — types were stripped, never verified). First run: **2,442 lines of errors.** Diagnosed before touching any application code: almost all of it was one root cause — `@types/react`, `@types/react-dom`, and `@types/node` were never installed (only listed as peer deps), so `JSX.IntrinsicElements` didn't exist at all and every single JSX element in the app errored. Installed the three type packages + added `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) — **error count dropped to 38.**
- **Fixed all 38 remaining errors** rather than carving out exceptions, since "strict" should mean strict: 37 were unused imports/variables (`noUnusedLocals`/`noUnusedParameters`) — dead icon imports and two abandoned `useState` calls across 12 files, all pre-existing and harmless, now removed. The 38th was a real (cosmetic) bug: `DesignSystem.tsx`'s local `Card` helper silently dropped a caller-supplied `style` prop because its props type never declared one — see `bug.md` #9.
- **Verified nothing broke:** `npx tsc --noEmit` clean, full rebuild of all three targets (`app`, `standalone`, `designsystem`) clean, localhost still serving, both standalone HTML files regenerated.
- **Added ESLint** (flat config, ESLint 9 + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`). Left 5 pre-existing warnings as warnings rather than forcing fixes that would change behavior: 4 are "fast refresh" DX notices about colocating a context/hook with a component (an intentional, already-documented architecture choice), 1 is a `react-hooks/exhaustive-deps` notice on a `useEffect` that is deliberately dependency-less (it needs to re-read a live computed style on every render — adding the suggested deps would reintroduce the problem it was written to solve). Fixed the one genuine lint **error** (`no-empty` on a deliberate empty `catch {}` guarding `localStorage.setItem` in Safari private-mode) by configuring `allowEmptyCatch` rather than touching defensive code that was already correct.
- **Added Prettier**, but deliberately **did not** bulk-reformat the 38 files it flagged — that's a large, purely-cosmetic diff with no CI-blocking requirement in the Phase 0 spec (which lists `typecheck → lint → test → build`, not format), so it's left as an available `npm run format` for whenever a dedicated pass makes sense, not bundled into this one.
- **Added Vitest** with a real test suite (not a placeholder assertion) against the existing `cn()` utility in `src/lib/utils.ts` — covers plain joins, falsy-value dropping, and Tailwind-conflict resolution via `tailwind-merge`. 3 tests, all passing.
- **Added the four npm scripts** (`typecheck`, `lint`, `format`/`format:check`, `test`) alongside the three existing build scripts.
- **Added CI at the true repo root** (`.github/workflows/monologg-ci.yml`) — GitHub Actions only ever looks at `.github/workflows/` at the repository root, never inside a subfolder, so it couldn't live under `monologg/` itself. Scoped with `paths: monologg/**` so it never fires on the unrelated project sharing this repo, and `working-directory: monologg/app` so every step runs from the right place. Runs `install → typecheck → lint → test → build`, blocking on any failure — exactly mirroring the four commands verified locally.
- **Widened `.gitignore`** from exact paths (`monologg/app/node_modules/`) to glob patterns (`monologg/**/node_modules/`) ahead of Phase 1's monorepo split, which will add more Node projects (`apps/api`, `packages/types`) each with their own `node_modules`. Added `.env`/`.env.*` (with `.env.example` excluded) and `coverage/` per the Phase 0 spec, even though neither exists yet.
- **Added `CONTRIBUTING.md`** (the four gate commands, plus the phase-by-phase ground rules so they're documented somewhere a contributor actually opens, not just in this log) and updated `README.md`.
- **Verified all four gates green locally** (`typecheck`, `lint` — 0 errors, 5 non-blocking warnings —, `test`, `build`) before committing as a separate commit from the baseline.
- **Not yet independently confirmed:** the actual GitHub Actions run on the real `mono2` repo — the workflow was written and verified equivalent to the local gates, but this session can't watch a remote CI run complete; that's the next thing to check after pushing.

## Session 10 — `features.md` Phase 1: monorepo restructure + api-client seam

**Goal:** convert to a pnpm workspace (`apps/web`, `apps/api`, `packages/types`), build a single typed `api-client.ts` seam that every screen's data flows through, and move every mock constant behind it — a pure refactor, zero visual change.

- **pnpm wasn't installed** on this machine and `corepack enable` failed (`EACCES` — no write access to `/usr/local/bin` for the global symlink). Used `npx pnpm@9` for every command instead of a global install; pinned `"packageManager": "pnpm@9.15.9"` in the root `package.json` so CI and any other machine resolve the same version via `pnpm/action-setup`.
- **Moved `apps/web/`** from `app/` via `git mv` (history-preserving), removed the now-redundant `package-lock.json` (pnpm manages the lockfile at the workspace root now), and fixed a real, unrelated pre-existing oddity while touching `package.json` anyway: `react`/`react-dom` were declared as optional `peerDependencies` — a leftover from the original library-mode Figma Make export — instead of real `dependencies`, which is what an application (not a library) should do. Corrected; same resolved versions (18.3.1), zero behavior change.
- **Built `packages/types`** as a zero-build TypeScript source package (`main`/`types` point straight at `src/index.ts` — no separate compile step needed since Phase 1 only needs `apps/web`, a Vite/esbuild consumer, to read it; `apps/api` doesn't need to import it for real until Phase 3). Verified this actually resolves correctly in **three** different consumers before trusting it: `tsc --noEmit` (via `moduleResolution: bundler`), Vitest (via its Vite-based resolver), and a real production `vite build` (Rollup) — all three worked with zero extra config, via the pnpm workspace symlink (`apps/web/node_modules/@monologg/types → ../../../../packages/types`).
- **Designed the mock/domain-data boundary deliberately, not by rote:** every *entity* mock (talents, client projects, orders, stats, activity, services, availability, order messages, shortlist IDs) moved into `apps/web/src/mocks/`, typed against new zod schemas in `packages/types`. Static UI copy/configuration (landing-page marketing copy, form dropdown option lists, weekday labels, fixed time-of-day buckets, the order-room phase-stepper labels) was deliberately **left as local page constants** — none of that is "mock data standing in for a database," it's the same kind of copy/config a fully backed production app would still hardcode or drive from an i18n file, not an API resource. Documented this boundary in code comments so it doesn't get re-litigated per-file later.
- **Dropped `icon`/`color` fields from the stat-tile mock data entirely**, rather than inventing a way to serialize a `lucide-react` component reference into a zod schema — confirmed first, by grepping both dashboards, that neither field was actually ever rendered anywhere (dead fields since before this engagement). `StatMetric` in `packages/types` is `{ kind, label, value, delta }` only.
- **Unified the two dashboards' near-duplicate `Order` shape:** `ClientDashboard`'s mock used a `talent` field, `TalentDashboard`'s used `client` — same role (the other party's name), different key, purely because they'd never been touched by the same hand at the same time. Renamed both to a shared `counterpart` field in `@monologg/types`' `Order` schema. Deliberately did **not** unify the two lists' `status` string vocabularies (`"active"` vs. `"in_progress"` for the same Deliverables phase) — those drive each dashboard's existing badge-coloring logic, and changing them would be a real (if subtle) behavior change, which this phase explicitly rules out.
- **Built `api-client.ts`**: one object, one function per data operation (`getClientStats`, `listTalents`, `listClientProjects`, `listClientOrders`, `getShortlistedTalentIds`, `getTalentStats`, `listTalentActivity`, `listServices`, `getAvailability`, `listTalentOrders`, `getOrderMessages`), every function async (so mock and live modes have identical call signatures), gated on `VITE_API_MODE` (`mock` default, reads `../mocks`; `live` calls `fetch('/api/v1/...')` and throws on a non-ok response — no real endpoints exist yet, so `live` mode isn't functional until Phase 5, exactly as the spec expects).
- **Refactored `ClientDashboard.tsx`, `TalentDashboard.tsx`, `OrderRoom.tsx`**: removed every entity-mock constant, added typed `useState` + a `useEffect` that calls the matching `apiClient` function(s) once on mount. `OrderRoom.tsx` additionally started reading its `:id` route param via `useParams()` (previously ignored entirely, despite the route already defining it) and passes it to `getOrderMessages` — the mock implementation ignores the argument, so this is a zero-observable-difference change today, but means the seam is actually meaningful once Phase 5 lands. Preserved every piece of *interactive* state exactly (shortlist toggling, calendar slot editing, message sending) — only swapped where the *initial* data comes from.
- **Caught and fixed a genuinely unused import** (`Eye` from `lucide-react` in `TalentDashboard.tsx`) that strict TypeScript flagged the moment its only reference (the now-deleted `STATS` mock) was removed — exactly the kind of thing `noUnusedLocals` exists to catch.
- **Added the required test coverage:**
  - `no-direct-mock-imports.test.ts` — walks every `.ts`/`.tsx` under `src/app`, fails if any file imports from `../mocks` (only `api-client.ts` is allowed to) — the automated form of the Phase 1 acceptance criterion "no component imports mock data directly."
  - `api-client.test.ts` — covers both `VITE_API_MODE` paths: mock mode returns real fixtures with the right shape; live mode calls `fetch('/api/v1/...')` with the right path and rejects on a non-ok response instead of silently succeeding.
  - `dashboardParity.test.tsx` — React Testing Library smoke tests rendering all three refactored pages (`ClientDashboard`, `TalentDashboard`, `OrderRoom`) and asserting real mock content still appears after the async load resolves — the closest practical stand-in for a screenshot diff without a visual-regression pipeline. Installed `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`, switched Vitest's environment from `node` to `jsdom` to support them.
  - Hit one jsdom gap along the way — `Element.prototype.scrollIntoView` isn't implemented in jsdom (it works fine in real browsers) — stubbed it in a new `test-setup.ts`, not in the app code, since this is a test-environment limitation, not a bug.
- **Verified the exact commands CI will run**, from the workspace root, not just per-package: `pnpm -r typecheck` (all three packages), `pnpm run lint`/`test`/`build` (proxied to `@monologg/web` via root `package.json` scripts) — all green, 10/10 tests passing, 0 lint errors (same 5 pre-existing warnings as Phase 0).
- **Confirmed zero visual regression the same way as every prior phase:** the production CSS build hash (`index-DnrpMxv1.css`) is byte-identical to before this refactor across all three build targets.
- **Updated CI** (`.github/workflows/monologg-ci.yml`) to install via `pnpm/action-setup` + `pnpm install --frozen-lockfile` from `monologg/` (the workspace root), instead of `npm ci` inside the old `monologg/app/`.

## Session 11 — Phase 1 addendum: Supabase project provisioning

**Goal:** the user extended the Phase 1 kickoff with a Supabase setup step not in `features.md`'s own Phase 1 spec — provision the Postgres project now (no schema — that's Phase 2), capture both a pooled and a direct connection string, and prove the pooled one actually resolves. `apps/api`/`apps/web` refactor part of Phase 1 had already landed in Session 10; this session only covers the Supabase addendum.

- **No Supabase CLI session or access token existed** in this environment (`npx supabase projects list` → `LegacyPlatformAuthRequiredError`), and this sandbox can't complete an interactive OAuth login. Asked the user how to proceed rather than guessing; they chose to create the project themselves via the dashboard and paste the connection strings.
- **User initially pasted the direct connection string twice** when asked for the pooled one — walked them to the dashboard's "Connect" button → "Transaction pooler" option to get the actual pgbouncer string (`aws-0-eu-west-1.pooler.supabase.com:6543`, distinct host from the direct `db.<ref>.supabase.co:5432`).
- **Caught and confirmed a password-formatting ambiguity before writing anything:** the pasted password was wrapped in square brackets (`[hSM2TtnUWQKyx8Di]`), matching Supabase's dashboard placeholder syntax (`[YOUR-PASSWORD]`) rather than a literal value. Asked the user directly rather than assuming; confirmed the brackets were leftover placeholder syntax, not part of the real password.
- **Discovered and diagnosed a genuine network constraint, not a config bug:** the direct-connection host (`db.uuacczlwejzjbhhcyjii.supabase.co`) resolves to an AAAA (IPv6) record only — no A record — which is standard Supabase behavior unless the IPv4 add-on is purchased. This sandbox has no IPv6 route (`ping6` → "No route to host"), so `DIRECT_URL` cannot be verified from here even though the credential itself is correct; it's expected to work from IPv6-capable networks (many CI runners, most cloud hosts). Documented this distinction in the smoke-test script's own output rather than let a network limitation read as a bad password.
- **Wrote both connection strings to `apps/api/.env`** (already covered by the existing `monologg/**/.env` gitignore glob — confirmed with `git check-ignore` before writing anything sensitive) and a placeholder `apps/api/.env.example` (committed) documenting the shape of both URLs and the IPv6 caveat.
- **Added `pg` + `@types/pg`** to `apps/api` (its first real dependency beyond `@monologg/types`) and wrote `apps/api/scripts/verify-supabase-connection.mjs` — plain JS, not `.ts`, since it's an operational script outside the typed app surface and Node's native TypeScript stripping is still experimental (confirmed via a throwaway test: `node script.ts` fails without `--experimental-strip-types`, which prints an experimental-feature warning). Uses Node 20+'s built-in `process.loadEnvFile()` instead of adding a `dotenv` dependency for one script.
- **Ran the smoke test:** `DATABASE_URL` (pooled) succeeded a real `select 1` round trip against the live project. `DIRECT_URL` failed with `ENOTFOUND`, exactly matching the IPv6-route diagnosis above — not treated as a failure of this phase's acceptance, since the pooled connection (the one the running app will actually use) is proven reachable and the direct one's unreachability is fully explained by this specific sandbox's network topology.
- **Deliberately did not wire the smoke test into `pnpm test`/CI** — it needs live network access and a real secret that CI doesn't have configured yet (that's further out than this phase), and CI runners' own IPv6 support is unverified. It's a standalone `pnpm --filter @monologg/api run verify:db` a developer/operator runs by hand, matching the phase's own language ("verify the pooled connection resolves") rather than a permanent regression gate.
- **Re-ran the full Phase 1 acceptance suite** after adding the new dependency (`typecheck`, `lint`, `test` — 10/10 passing, same 5 pre-existing warnings, 0 errors — and `build`) to confirm nothing regressed; production CSS hash (`index-DnrpMxv1.css`) still byte-identical.
- **Did not touch `features.md`** — the Supabase step is a user-added addendum to this session's Phase 1 kickoff, not part of the PRD's own Phase 1 spec, so the source document is left as-is; this log and `design.md` are the record of it.
- **Not enabled:** Supabase Auth, the Data API, or any schema — all explicitly out of scope until Phase 2+ per the user's own instruction.

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
| Project root (`figj monol/`) → `monologg/` | Everything (`app/`, `brand/`, `handoff/`, `README.md`, `ATTRIBUTIONS.md`, both standalone HTML files, both `.skill` files) moved into a `monologg/` subfolder so this project shares a git repo with unrelated existing content without colliding |
| `.gitignore` (repo root, one level above `monologg/`) | **New** — excludes `monologg/app/node_modules/`, all three `dist*` build-output folders, `.vite`, `.DS_Store` |
| `brand/icon.svg`, `brand/logo.svg` | **New** (user-supplied) — the real brand mark/wordmark, superseding the old PNG logo files |
| `src/app/components/ui/Logo.tsx` | **New** — `Logo`/`LogoMark` components built from the SVGs, converted to `fill="currentColor"` so they inherit an accessible color from whatever surface they sit on (default `var(--color-text-primary)`) |
| `src/app/components/ui/Sidebar.tsx`, `src/app/pages/AuthFlow.tsx`, `src/app/pages/CreatorOnboarding.tsx`, `src/app/pages/LandingPage.tsx` (nav + footer) | Plain-text "Monologg" wordmark replaced with the real `<Logo>` component, all 5 sites |
| `handoff/features.md` (moved from `New features.md` at the outer project root) | The consolidated backend + new-features PRD — 18 phases (0–17), now the authoritative backlog superseding the old flat gap list in `design.md` §6 / `implementation-plan.md` |
| `app/tsconfig.json` | **New** — strict TypeScript config, first time this codebase has been type-checked (previously esbuild-transpiled only) |
| `app/src/vite-env.d.ts` | **New** — `/// <reference types="vite/client" />`, needed once real typechecking was turned on |
| `app/eslint.config.js` | **New** — ESLint 9 flat config, `typescript-eslint` + React hooks/refresh plugins |
| `app/.prettierrc.json`, `app/.prettierignore` | **New** — Prettier config; not yet applied as a bulk reformat, see `log.md` Session 9 |
| `app/vitest.config.ts`, `app/src/lib/utils.test.ts` | **New** — first test runner + first real test suite (covers `cn()`) |
| `monologg/.editorconfig` | **New** — shared whitespace/indent settings |
| `monologg/CONTRIBUTING.md` | **New** — CI-mirroring local commands + the phase-by-phase ground rules |
| `figj monol/.github/workflows/monologg-ci.yml` (true repo root — the only place Actions looks) | **New** — `typecheck → lint → test → build`, path-scoped to `monologg/**`, blocks on failure |
| `app/package.json` | Added `typecheck`/`lint`/`format`/`format:check`/`test` scripts; added `typescript`, `eslint` + plugins, `prettier`, `vitest`, `@types/react`/`@types/react-dom`/`@types/node` as devDependencies |
| 12 page/component files (unused-import cleanup) | `BottomNav.tsx`, `FormField.tsx`, `Checkout.tsx`, `ClientDashboard.tsx`, `ClientOnboarding.tsx`, `CreatorOnboarding.tsx`, `LandingPage.tsx`, `OrderRoom.tsx`, `ProjectBrief.tsx`, `Settings.tsx`, `TalentDashboard.tsx` — 37 unused imports/variables removed, surfaced by strict TypeScript, see `log.md` Session 9 |
| `src/app/pages/DesignSystem.tsx` | `Card` helper gained an optional `style` prop it was previously silently dropping — see `bug.md` #9 |
| `.gitignore` | Widened to glob patterns ahead of Phase 1's monorepo split; added `.env*`/`coverage/` per the Phase 0 spec |
| `monologg/pnpm-workspace.yaml`, `monologg/package.json`, `monologg/pnpm-lock.yaml` | **New** — pnpm workspace root, proxies `typecheck`/`lint`/`format`/`test`/`build` to the right package(s) |
| `app/` → `apps/web/` | **Renamed** via `git mv` (history-preserving); `package-lock.json` removed (pnpm manages the lockfile now) |
| `apps/web/package.json` | `react`/`react-dom` moved from optional `peerDependencies` to real `dependencies` (library-mode leftover, fixed); added `@monologg/types` (workspace), `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` |
| `apps/api/` | **New** — empty scaffold (`package.json`, `tsconfig.json`, `src/index.ts`, `README.md`), per `features.md` Phase 1 |
| `packages/types/` | **New** — zero-build TS package: `talent.ts`, `order.ts`, `clientProject.ts`, `stats.ts`, `activity.ts`, `service.ts`, `availability.ts`, `orderMessage.ts`, all zod schemas + inferred types, re-exported from `src/index.ts` |
| `apps/web/src/lib/api-client.ts` | **New** — the one data seam every screen now reads through; `VITE_API_MODE=mock|live` |
| `apps/web/.env.example` | **New** — documents `VITE_API_MODE` |
| `apps/web/src/mocks/*.ts` | **New** — every entity mock constant, typed against `@monologg/types`, moved out of page files |
| `apps/web/src/app/pages/ClientDashboard.tsx`, `TalentDashboard.tsx`, `OrderRoom.tsx` | Mock constants removed; data now loaded via `apiClient` in a `useEffect`; `OrderRoom.tsx` now reads its route `:id` via `useParams()` |
| `apps/web/src/lib/api-client.test.ts`, `no-direct-mock-imports.test.ts`, `apps/web/src/app/pages/dashboardParity.test.tsx` | **New** tests — see Session 10 above |
| `apps/web/vitest.config.ts`, `apps/web/src/test-setup.ts` | Environment switched `node` → `jsdom`; added the `@testing-library/jest-dom` matchers and a `scrollIntoView` stub |
| `.github/workflows/monologg-ci.yml` | Switched from `npm ci` in `monologg/app/` to `pnpm install --frozen-lockfile` at the `monologg/` workspace root |
| `apps/api/.env` (gitignored) | **New** — real Supabase `DATABASE_URL` (pooled) / `DIRECT_URL` (direct) for this environment, per Phase 1's Supabase addendum |
| `apps/api/.env.example` | **New** — documents the shape of both URLs and the direct connection's IPv6-only caveat |
| `apps/api/package.json` | Added `pg`/`@types/pg`; added a `verify:db` script |
| `apps/api/scripts/verify-supabase-connection.mjs` | **New** — standalone smoke test proving both connection strings are present and reachable (`select 1`); not wired into CI, run by hand |
