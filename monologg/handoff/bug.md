# Monologg — Bug & Issue Log

**Last updated:** 2026-07-28
**This is a living document** — add a new entry every time a bug is found or fixed, in the same session as the fix. See `README.md` for the full update policy.

This tracks every defect found during this engagement — both classic "the build broke" bugs and design-system consistency issues (things that *worked* but would silently drift out of sync on the next change). Severity is defined once here so it means the same thing every time it's used below.

## Severity scale

| Severity | Meaning |
|---|---|
| **Critical** | App is unusable; no workaround exists |
| **High** | Blocks a build, a dev-server start, or a core feature entirely until fixed |
| **Medium** | Everything still runs, but the underlying issue creates real risk — either it silently produces wrong output, or it will cause a future change to not take effect everywhere it should |
| **Low** | Cosmetic, or a pre-existing minor issue with no functional impact |

---

## Bugs found and fixed during this engagement

### 1. `rsync --exclude 'dist'` silently deleted `node_modules/vite` itself

- **Severity:** High
- **What happened:** While copying the working build into a persistent `app/` folder, the command used was `rsync -a --exclude 'dist' <source>/ <dest>/`. The `--exclude` pattern `'dist'` in rsync matches **any path component named `dist`, anywhere in the tree** — not just the top-level build-output folder it was meant to exclude. This also matched (and excluded) `node_modules/vite/dist/`, which is the actual Vite package's compiled code.
- **What it meant:** Starting the dev server immediately failed with `Cannot find module '.../node_modules/vite/dist/node/cli.js'` — Vite itself was missing a required file, so nothing could run.
- **How it was found:** The `vite` background process exited immediately; reading its output log showed the missing-module error.
- **How it was fixed:** Redid the copy with an anchored pattern, `--exclude '/dist'` (leading slash = only match at the root of the copy, not anywhere inside it), which correctly excluded only the intended build-output folder and left `node_modules` intact.
- **Lesson for next time:** rsync exclude patterns without a leading `/` are **not** anchored to the root — they behave like a global "exclude any match" rule. Always anchor them when the intent is "exclude this one top-level thing."

---

### 2. CSS `@import` ordering broke once tokens were extracted into a real stylesheet

- **Severity:** Medium (dev-server console noise and a real spec violation, but did not break the production `vite build` output)
- **What happened:** When the inline design tokens were extracted out of `Root.tsx` into `src/styles/tokens.css`, the new import was added as the *first* line in `src/styles/index.css`:
  ```css
  @import './tokens.css';
  @import './fonts.css';
  @import './tailwind.css';
  ```
  `tokens.css` contains plain CSS rules (like `:root { ... }`), while `fonts.css` and `tailwind.css` each contain their own `@import` statements. CSS requires **all `@import` statements to appear before any other rule** in the final, flattened stylesheet. Once the files are inlined in order, `tokens.css`'s plain rules ended up sitting *before* `fonts.css`'s `@import url(...)` lines — which is invalid.
- **What it meant:** The dev server repeatedly logged `[vite:css][postcss] @import must precede all other statements` — noise that could mask a real error in the console, and a genuine spec violation that some stricter CSS tooling would reject outright.
- **How it was found:** Noticed in the dev-server log output while doing a final health check after a round of changes.
- **How it was fixed:** Reordered the imports so anything containing its own `@import` statements comes first, and the plain-rules file (`tokens.css`) comes last:
  ```css
  @import './fonts.css';
  @import './tailwind.css';
  @import './tokens.css';
  ```
- **Lesson for next time:** When chaining `@import`s across multiple files, order files by "does this file itself contain more `@import`s" first, "plain rules" last — regardless of which file feels conceptually more important.

---

### 3. A stray `*/` inside a code comment prematurely closed a JS block comment

- **Severity:** High (build-breaking)
- **What happened:** In `src/lib/motionTokens.ts`, a doc comment included the literal text `--duration-*/--ease-*` as a way of referring to a group of CSS variable names. The `*/` inside that text is also the character sequence that **ends** a `/* ... */` block comment in JavaScript/TypeScript — so the comment closed early, and everything after it was interpreted as code instead of a comment.
- **What it meant:** `npx vite build` failed immediately with `Unexpected "*"` at the exact line, since the "leftover" comment text was no longer inside a comment.
- **How it was found:** Standard build-after-every-change verification (`npx vite build` was run after creating the file, per practice throughout this engagement).
- **How it was fixed:** Reworded the comment to avoid a literal `*/` sequence (spelled out "the duration/ease tokens" instead of the shorthand with wildcards).
- **Lesson for next time:** Never put a literal `*/` inside a `/* */` comment, even as part of a glob-style shorthand — it will always terminate the comment early.

---

### 4. A partial edit left a dangling, unclosed JSX tag mid-file

- **Severity:** Would have been High if it had reached a build; caught and fixed before that happened
- **What happened:** While wrapping the "Dispute Modal" in `OrderRoom.tsx` with the new shared `<Modal>` component, an edit replaced only part of the old opening `<motion.div ...>` tag's attributes, leaving the tag's own opening (`<motion.div\n  initial={{ opacity: 0 }}`) still present immediately followed by the new `<Modal onClose=...>` tag — an invalid, unclosed JSX structure.
- **What it meant:** Had this gone untouched, the file would not compile (unclosed tag / invalid JSX).
- **How it was found:** Re-reading the file immediately after the edit (standard practice: verify the surrounding context after any multi-part JSX restructuring) surfaced the malformed markup before any build was attempted.
- **How it was fixed:** Replaced the broken fragment with the correctly-scoped `<Modal onClose={...} strength="strong">` opening tag, removing the orphaned leftover lines.
- **Lesson for next time:** When replacing a multi-line JSX opening tag with a different component, match and replace the **entire** tag (from `<` to the closing `>`) in one edit, not just a sub-range of its attributes — otherwise it's easy to leave a syntactically broken hybrid behind.

---

### 5. Dependency-cleanup grep missed a CSS-only `@import`, breaking the build

- **Severity:** High (build-breaking, but caught immediately by the standard rebuild-after-every-change practice)
- **What happened:** Before removing unused packages, every dependency was checked against `grep -rl "from '<pkg>'"` across `src/`. That check only looks for JavaScript/TypeScript `import ... from` statements — it doesn't catch a CSS `@import 'tw-animate-css';` living inside `src/styles/tailwind.css`. `tw-animate-css` showed as "0 references" and was removed from `package.json`, but the CSS file still referenced it.
- **What it meant:** The very next `vite build` (of all three targets: app, standalone, design-system) failed immediately with `Can't resolve 'tw-animate-css'`.
- **How it was found:** Standard rebuild-after-every-change practice — ran all three builds right after `npm install`, all three failed with the same resolve error.
- **How it was fixed:** Checked whether any real `tw-animate-css` utility classes (`animate-in`, `fade-in`, `slide-in-from-*`, etc.) were used anywhere in the app first — confirmed none were (the one text match, in `Modal.tsx`, turned out to be inside a code comment, not an actual class). Removed the dead `@import 'tw-animate-css';` line from `src/styles/tailwind.css` itself, rather than reinstalling the package, since nothing depended on what it provided.
- **Lesson for next time:** When auditing "is this package used," check every place a package can be referenced for this project — JS/TS imports **and** CSS `@import`s/`@source` directives — not just one.

### 6. `createBrowserRouter` doesn't work when the app is opened as a local file

- **Severity:** Would have been High (silently broken navigation) had it shipped unnoticed — caught during design, not after a failed build
- **What happened:** The real app uses `createBrowserRouter` (pushState-based routing), which is correct for the localhost dev server and any real hosting, but doesn't work for a page opened directly via `file://`: there's no server to resolve an arbitrary path, and `file://` documents can't reliably `pushState` to a different path the way an `http://` origin can.
- **What it meant:** A double-clickable, single-file build of the app using the same router as the localhost version would load its first page fine, but clicking through to any other screen would break.
- **How it was found:** Reasoned through before building the standalone artifact, based on the same root cause noted back in Session 1 (`createHashRouter` was used for the very first sandboxed-preview Artifact, for an adjacent reason — no real origin in a sandboxed iframe).
- **How it was fixed:** Extracted the route tree into a shared `routeTree` export (`src/app/routes.tsx`) and added a second app entry (`AppStandalone.tsx`) using `createHashRouter(routeTree)` — same routes, same pages, same tokens, only used for the standalone HTML build target. The localhost dev server and any future real hosting keep using `createBrowserRouter` unchanged.
- **Lesson for next time:** Browser-history routing needs a real origin+server (or at least something that can rewrite unknown paths back to `index.html`); anything meant to be opened as a bare local file needs a hash router (or memory router, for a single fixed page) instead.

### 7. Dark-mode toggle silently did nothing on the standalone design-system page

- **Severity:** Medium (a real, user-facing broken control — the button visibly changed label but nothing else happened — caught by explicit user report, not a build failure)
- **What happened:** `DesignSystem.tsx` reads dark/light state via `useTheme()`, which is `useContext(ThemeContext)`. In the real app, `ThemeContext.Provider` is supplied by `Root.tsx`, which also toggles a `.dark` class on its own wrapping `<div>` (the class that `tokens.css`'s `.dark { ... }` selector actually keys off). The standalone design-system build (`main-designsystem.tsx`) renders `DesignSystem` directly inside a bare `MemoryRouter` — it never renders `Root` at all. With no `ThemeContext.Provider` in the tree, `useTheme()` fell back to the context's default value, `{ isDark: false, toggle: () => {} }` — a no-op function.
- **What it meant:** Clicking "Dark" in the design-system page's header called the no-op `toggle`, so nothing happened — no state change, no `.dark` class applied anywhere, no visual change at all.
- **How it was found:** User reported the toggle didn't work after opening `monologg-design-system.html`.
- **How it was fixed:** Extracted the state/persistence logic out of `Root.tsx` into an exported `useThemeState()` hook (same `localStorage` key, same shape), so `Root` and any other entry point can share it without duplicating logic. Added a small `StandaloneThemeProvider` in `main-designsystem.tsx` that calls `useThemeState()` and supplies both the `ThemeContext.Provider` and the `.dark`-class wrapping div that `Root` would otherwise have provided.
- **Lesson for next time:** Any page/component that reads a React Context needs *something* in its render tree providing that context — a standalone build that skips the app's usual root wrapper (for router or bundling reasons) silently loses whatever that wrapper was supplying, without any error. Worth checking every `useContext`-based hook when adding a new, narrower entry point.

### 8. A stray extra `</g>` tag when converting the logo SVG to a React component

- **Severity:** Would have been High (JSX syntax error, build-breaking) if it had reached a build unnoticed — caught before that happened
- **What happened:** While converting `brand/logo.svg` into the `Logo` React component (`src/app/components/ui/Logo.tsx`), the original SVG has one `<g clipPath>` group wrapping just the icon-mark paths, followed by a sibling text path *outside* that group. When retyping the structure as JSX, an extra closing `</g>` was left after the text path with no corresponding opening tag.
- **What it meant:** Had a build been run against this file as written, it would have failed with a JSX/tag-mismatch error.
- **How it was found:** Re-read the file immediately after writing it (standard practice for hand-transcribed markup) before running any build — caught before `npx vite build` was ever attempted against it.
- **How it was fixed:** Removed the orphaned `</g>`, matching the JSX structure back to the original SVG's actual nesting (one `<g>` around the icon paths only, the text path as a sibling).
- **Lesson for next time:** When hand-converting an existing SVG's tag structure into JSX (e.g. to swap `fill="white"` for `fill="currentColor"`), diff the opening/closing tag count against the source rather than assuming a straight copy — it's easy to add or drop a wrapping tag when the file is large and repetitive.

---

## Design-system consistency issues (found via audit, not crashes — but real bugs in the "will silently drift" sense)

These didn't break anything today, but they meant a future change to a design token would **not** propagate everywhere it should — which was the exact problem the user asked to fix. Full detail and file-level counts are in `log.md` §2.1–2.2; summarized here with severity:

| Issue | Severity | What it meant | Fix |
|---|---|---|---|
| Design tokens lived in a JS template string inside `Root.tsx`, not a real CSS file | Medium | Not literally broken, but awkward and easy to accidentally duplicate; no single canonical file to point a new dev at | Extracted to `src/styles/tokens.css` |
| Two dead CSS files (`theme.css`, `DoyinXMonologgCopy/styles.css`) defined **conflicting** token values under the same names (e.g. different `--radius-*` scales) | Medium | If either file were ever accidentally re-imported, it would silently override the real tokens with different values | Removed from the import chain, then deleted entirely |
| `TalentDashboard.tsx` and `ClientDashboard.tsx` — the two biggest pages — used Tailwind's default radius classes (`rounded-xl`, `rounded-2xl`, etc.) instead of `var(--radius-*)` | Medium | Looked visually identical today (the default values happened to match), but changing the design tokens later would have had **zero effect** on these two pages, silently | Remapped 57 occurrences to the token-based equivalents |
| Modal background color (`rgba(0,0,0,0.5)` / `0.6`) was hardcoded in 10 different places | Medium | Changing the intended overlay darkness would require finding and editing 10 separate lines correctly, with high odds of missing one | Replaced with `var(--color-overlay)` / `var(--color-overlay-strong)`, defined once |
| A handful of `text-gray-400`/`text-gray-500` Tailwind classes bypassed the text-color tokens | Low–Medium | Those specific labels wouldn't shift color if the app's text-color tokens were ever redefined (e.g. a contrast fix) | Replaced with `var(--color-text-secondary)` / `var(--color-text-tertiary)` |
| Sidebar, BottomNav, Modal, Avatar, Badge, and FormField were each hand-duplicated 2–11× with drifting details (padding, margins) | Medium | A design change to any of these (e.g. "make all avatars 2px bigger") required manually finding and editing every duplicate correctly — easy to miss one and end up with visible inconsistency | Extracted into shared components in `src/app/components/ui/`, wired into their real call sites |

---

## Known issues, not fixed (out of scope / pre-existing, flagged for visibility)

| Issue | Severity | Why it wasn't fixed |
|---|---|---|
| Several unused icon imports in `TalentDashboard.tsx` (`Search`, `Star`, `Clock`, `Mic`, `Video`, `MoreHorizontal`) | Low | Pre-existing dead code from the original Figma Make export, unrelated to design-system work; purely cosmetic, no functional or build impact |
| Fonts (General Sans, Plus Jakarta Sans, JetBrains Mono) load from external CDNs (Fontshare, Google Fonts) | Low–Medium | Not a bug introduced here, but worth flagging: in any environment without internet access (e.g. a strict sandboxed preview), fonts silently fall back to system fonts. Not fixed because it requires a product decision (self-host the fonts, or accept the CDN dependency) |
| Type-scale tokens (`--font-size-*`) exist but aren't applied to most page headings yet | Low | Explicitly scoped out during this engagement as a larger, riskier change (would touch heading markup across every page); tokens were added so the option exists, adoption was left for a follow-up pass |

**Not a bug — a scope gap, documented separately:** the entire absence of a real backend, database, authentication, and payment integration is **not** logged here as a "bug" — it's the current, intentional state of a frontend-only prototype. See `design.md` §6 for the full list of what still needs to be built.
