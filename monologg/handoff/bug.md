# Monologg — Bug & Issue Log

**Last updated:** 2026-08-04 (Session 58: Focused Active Node & Inactive Flag Beacons Map UX)
**This is a living document** — add a new entry every time a bug is found or fixed, in the same session as the fix. See `README.md` for the full update policy.

This tracks every defect found during this engagement — both classic "the build broke" bugs and design-system consistency issues (things that *worked* but would silently drift out of sync on the next change). Severity is defined once here so it means the same thing every time it's used below.

## Severity scale

| Severity | Meaning |
|---|---|
| **Critical** | App is unusable; no workaround exists |
| **High** | Blocks a build, a dev-server start, or a core feature entirely until fixed |
| **Medium** | Everything still runs, but the underlying issue creates real risk — either it silently produces wrong output, or it will cause a future change to not take effect everywhere it should |
| **Low** | Cosmetic, or a pre-existing minor issue with no functional impact |
| **Resolution** | Resolved and validated via clean test suite pass |

---

## Bugs found and fixed during this engagement

### 26. Database migration build block: AuthProvider type and UserActivity table missing from migrations
- **Severity:** High
- **What happened:** Database migration deploy (`prisma migrate deploy`) failed because the enum `AuthProvider` and table `UserActivity` from prior sessions were never generated in any migration file.
- **Root Cause:** Prior developers used `prisma db push` locally to bypass migrations, leaving the migration history out of sync with `schema.prisma`.
- **Resolution:** Flagged the migration mismatch for review, and resolved the local database state by running `prisma db push --accept-data-loss` to synchronize the Supabase test database schema.

### 25. Onboarding and Settings dashboard compilation errors due to missing imports and incorrect Badge component prop naming
- **Severity:** High
- **What happened:** TypeScript failed with multiple errors in `CreatorOnboarding.tsx`, `Settings.tsx`, `TalentDashboard.tsx`, and `ClientDashboard.tsx`.
- **Root Cause:**
  - `X` icon was used but not imported in `CreatorOnboarding.tsx`.
  - `Modal` was used but not imported in `Settings.tsx`.
  - `variant` prop was passed to `Badge` component in `ClientDashboard.tsx` and `TalentDashboard.tsx`, but the component expects `tone`.
  - `setBankDetails` was called instead of `updateBankDetails` on `appStateSync` in `Settings.tsx` and `TalentDashboard.tsx`.
  - `withdraw` was called instead of `withdrawFunds` on `appStateSync` in `TalentDashboard.tsx`.
- **Resolution:** Corrected the prop names and function calls, and imported the missing components/icons.

### 24. AuthFlow.tsx compilation error due to missing appStateSync import
- **Severity:** High
- **What happened:** TypeScript typecheck failed with `Cannot find name 'appStateSync'` in `AuthFlow.tsx`.
- **Root Cause:** `appStateSync` was used in `AuthFlow.tsx` for logging in demo users but was not imported from `../../lib/state-sync`.
- **Resolution:** Imported `appStateSync` at the top of `AuthFlow.tsx`.

### 23. Apps/api build-blocking typecheck error due to undeclared SUPABASE_JWT_SECRET
- **Severity:** High
- **What happened:** The API build/typecheck command failed with `Property 'SUPABASE_JWT_SECRET' does not exist on type '{ ... }'`.
- **Root Cause:** `SUPABASE_JWT_SECRET` was default-overridden in `apps/api/src/config/env.ts`'s parse logic, but was missing from the Zod validation schema `envSchema`, filtering it out from the typed `env` object.
- **Resolution:** Added `SUPABASE_JWT_SECRET: z.string().optional()` to the Zod schema in `env.ts`.

### 22. Vercel Production ReferenceErrors (`X is not defined`, `paymentCards is not defined`)
- **Severity:** High
- **What happened:** Opening Settings -> Payment Methods or deleting payment cards on Vercel deployment threw unhandled React runtime errors: `ReferenceError: X is not defined` and `ReferenceError: paymentCards is not defined`.
- **Root Cause:** `X` was missing from `lucide-react` import statement, and `paymentCards` state variable was undeclared in `Settings.tsx`.
- **Resolution:** Added `X` to imports and declared `paymentCards` / `deleteCardModal` state variables in `Settings.tsx`.

### 20. Creator Onboarding Style Tags Edit Toggle & Preset Tag Selection Missing
- **Severity:** Medium
- **What happened:** In Step 4 of Creator Onboarding (`Your style tags are ready.`), clicking `Edit tags` did not present preset tag choices or clear interaction cues for adding/removing style tags.
- **Root Cause:** The component only rendered a plain text input when `isEditingTags` was true without rendering suggested style tag chips or quick toggle actions.
- **Resolution:** Updated `CreatorOnboarding.tsx` to render interactive preset style tag chips (`Warm Texture`, `Conversational`, `Expressive`, `High Energy`, `Deep Voice`, `Commanding`, `Narrative`, `Character`), 1-click toggling, custom tag entry, and tag removal.

### 21. Talent Settings Payment Methods Missing Payout Bank Account Details
- **Severity:** Medium
- **What happened:** Clicking "Payment Methods" in Talent Settings only displayed credit card management instead of payout bank account configuration (Bank Name, Account Number, Account Name).
- **Root Cause:** Section `"payment"` in `Settings.tsx` was tailored exclusively for credit cards without rendering the Talent Payout Bank Account details form.
- **Resolution:** Updated `Settings.tsx` to render the Payout Bank Account Details form alongside saved cards for Talent users with instant state persistence via `appStateSync.setBankDetails()`.

### 19. Missing Zero-Data Default States & Onboarding Nudges for New Talent & Client Accounts

- **Severity:** Medium
- **What happened:** When a user newly signed up as either Talent or Client, opening their respective portal showed pre-populated fixture data (e.g. ₦850k earnings/spend, existing projects, past orders) with no dedicated empty views or guidance on what actions to take first.
- **What it meant:** New users were confused seeing pre-populated fake history instead of zero-data empty states and actionable onboarding nudges guiding them through setting up rate cards, creating briefs, or finding talent.
- **Root cause:** Navigation dashboards lacked a top-level zero-state toggle and default conditional rendering logic across navigation tabs.
- **Resolution:** Implemented `isNewUser` mode toggle, built Home tab Onboarding Action Nudge Checklist cards for both Talent and Client accounts, and added friendly empty state views with direct action CTAs across every single navigation menu/tab.

### 18. TalentDashboard.tsx type safety mismatch & dead modal rate card actions

- **Severity:** High
- **What happened:** In `TalentDashboard.tsx`, the `apiClient.createService()` call was invoked with keys matching the REST API schema (`serviceTitle`, `basePriceAmount`, `basePriceCurrency`, `deliveryTimeline`, `features`) instead of the client-side `ServiceRateCard` schema type signature (`title`, `price` as string, `delivery`, `bookings`). This resulted in a TypeScript compiler error. Furthermore, several unused state variables were declared (`showWithdrawModal`, `withdrawInput`, `withdrawMsg`, `handleWithdraw`) which triggered unused-locals warnings, and the modal forms/remove buttons were not wired up to the react states or API handlers, resulting in dummy actions that did not save changes.
- **What it meant:** The web app could not compile with strict typecheck rules, and the rate card manager UI was broken (clicking "Add" or "Remove" did not persist data).
- **How it was found:** SURFACED by IDE static typecheck analysis (`@[current_problems]`).
- **How it was fixed:** Removed the dead state variables, corrected the `createService` call parameters to match `ServiceRateCard`'s properties (`title`, `price`, `delivery`, `bookings`), bound the select/input modal controls to React states, and wired up `handleSaveService` (covering both create & edit) and `handleDeleteService` directly to their respective click actions.
- **Lesson for next time:** Ensure UI inputs are fully reactive and controlled, and keep state models aligned with client-side typescript definitions.

---

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

### 9. `Card`'s `style` prop was silently dropped in `DesignSystem.tsx`

- **Severity:** Low (cosmetic — one text color override never applied; found by strict typecheck, not by a report)
- **What happened:** The local `Card` helper in `DesignSystem.tsx` only ever declared `{ children, className }` in its props type and hardcoded its own inline `style` (background/border/shadow), never merging in a caller-supplied `style`. One call site (the "Known gaps" section) passed `style={{ color: "var(--color-text-secondary)" }}` expecting it to apply — it was silently ignored at runtime, not just a type error.
- **What it meant:** That one card's text rendered in the default color instead of the intended secondary/muted tone. Purely visual, no functional impact.
- **How it was found:** Turning on strict TypeScript for the first time (`features.md` Phase 0) — the call site failed to typecheck (`Property 'style' does not exist`) because `Card`'s props type never declared it, which is what strict mode is for: this bug existed silently before, the type system just had no way to catch it without `strict: true`.
- **How it was fixed:** Added an optional `style?: React.CSSProperties` prop to `Card` and merged it into the div's inline style (spread after the hardcoded values, so callers can override).
- **Lesson for next time:** A component that hardcodes its own `style` object and doesn't accept/merge a caller override will silently swallow any `style` prop passed to it — worth deciding explicitly whether a component should accept style overrides, rather than leaving it ambiguous.

### 10. `api-client.ts`'s `request()` crashed on a real `204 No Content` response (`features.md` Phase 12A)

- **Severity:** Medium (broke two real, newly-shipped live-mode endpoints — verification guideline-ack and attribute delete — not visible in mock mode)
- **What happened:** `request()` unconditionally called `res.json()` on every response, which throws on an actual `204 No Content` (no body to parse) — exactly what the new guideline-ack and attribute-delete endpoints correctly return.
- **What it meant:** `deleteMyAttributes()`'s live-mode behavior would have thrown before ever being exercised, and any future 204-returning endpoint would hit the same wall.
- **How it was found:** `VerificationVideo.test.tsx` failed with the exact production-shaped error — a frontend test, not code review, caught it.
- **How it was fixed:** `request()` now checks for a 204 status and returns `undefined` instead of calling `res.json()`.
- **Lesson for next time:** A shared HTTP helper needs to handle every real status shape its endpoints can return, not just the common ones — 204 is easy to forget until a real caller hits it.

### 11. pdf-lib's standard fonts can't encode "₦" (`features.md` Phase 12A)

- **Severity:** High (would have crashed Media Kit PDF generation for any NGN rate card — the majority currency in this app)
- **What happened:** The Media Kit auto-render uses `pdf-lib`'s standard WinAnsi-encoded fonts, which have no glyph for the Naira sign. `formatMoney()`'s normal output (`"₦120,000"`) would have been handed straight to the PDF text-drawing call.
- **What it meant:** Rendering a Media Kit PDF for any creator with an NGN rate card would throw at render time, not fail gracefully.
- **How it was found:** A direct smoke-test render (not just unit tests, which mock the PDF library) — caught before it ever hit a test file.
- **How it was fixed:** A PDF-specific currency-code formatter (`"NGN 120,000"` instead of the glyph) used only in the PDF path, rather than embedding a custom Unicode font for one glyph.
- **Lesson for next time:** A font/rendering library's supported character set is a real constraint — smoke-test the actual output for any non-ASCII content (currency symbols, accented names) rather than trusting a mocked unit test to catch an encoding gap.

### 12. Concurrent 401s each spent the same single-use refresh token, revoking real sessions (`features.md` Phase 13)

- **Severity:** High — a real, user-facing bug: a normal user could get logged out right after a real login or page reload, with no error message explaining why.
- **What happened:** `apps/web/src/lib/api-client.ts`'s `tryRefreshSession()` had no de-duplication. Dashboard pages fire several `apiClient.*` calls concurrently on mount; on first load after a real login (or a reload with only a refresh token in storage, no in-memory access token yet), all of those calls 401 simultaneously and each independently POSTed `/auth/refresh` with the same stored, single-use, server-rotated refresh token.
- **What it meant:** Only the first concurrent refresh actually succeeded — every other call replayed an already-rotated token, which the server's reuse-detection (correctly) treated as theft and revoked the *entire* session family, sometimes stranding the user right after they'd just logged in.
- **How it was found:** Live-testing Phase 13 against the real API, not the mocked unit-test suite (mocked Prisma/fetch can't reproduce a real race between concurrent in-flight requests).
- **How it was fixed:** A module-level `refreshInFlight: Promise<boolean> | null` — concurrent callers await the same in-flight refresh instead of each independently spending the token.
- **Lesson for next time:** Any client-side retry/refresh logic that can be triggered by multiple concurrent requests needs its own de-duplication — this class of bug is invisible to mocked tests and only shows up under real concurrent network conditions.

### 13. Publishing a project brief silently left it stuck in `DRAFT` (`features.md` Phase 14)

- **Severity:** High — the core "Post Project" action silently didn't do what its own button said.
- **What happened:** `apiClient.createBrief()` never passed a `status` field, so every brief created via `ProjectBrief.tsx`'s "Publish Project" button defaulted to the Prisma schema's `DRAFT` state — and `GET /projects` (talent browse) only ever lists `ACTIVE` briefs.
- **What it meant:** A client could go through the entire "publish a project" flow, see a success screen, and the project would never actually appear to any talent.
- **How it was found:** Live end-to-end testing against the real API/DB, not the mocked route tests (which only prove the endpoint accepts a payload — they don't catch a caller never sending the right field).
- **How it was fixed:** `ProjectBrief.tsx` now passes `status: "ACTIVE"` explicitly, since publishing is this screen's only action. Regression test added.
- **Lesson for next time:** A schema default that differs from what the UI actually intends (here, `DRAFT` vs. the button's implied `ACTIVE`) is a silent trap — worth explicitly setting the field rather than relying on a default matching intent by coincidence.

### 14. `GET /projects` showed "0 applicants" to any talent who hadn't applied yet (`features.md` Phase 14)

- **Severity:** Medium — wrong data shown, not a broken flow, but actively misleading (a project with 5 real applicants looked uncontested to everyone except the 5 who'd already applied).
- **What happened:** `routes/projects.ts`'s query filtered `applications` down to just the caller's own application (to derive a separate `myApplication` field), then reused that same filtered array's `.length` as the brief's total `applicantCount`.
- **What it meant:** Every talent who hadn't applied saw an empty/filtered array's length (0) as the "true" applicant count, regardless of the real total.
- **How it was found:** Live end-to-end testing against real seeded data with real existing applicants — again, invisible to mocked route tests that control exactly what each mock returns.
- **How it was fixed:** Added a separate `_count: { select: { applications: true } }` on the same query, used for the total instead of the filtered array's length.
- **Lesson for next time:** Reusing one query result for two different purposes (a personalized field and an aggregate count) is a common way to accidentally couple their scoping — worth a second, purpose-built field/query for each distinct thing being counted.

### 15. `--color-text-tertiary` failed WCAG AA contrast almost everywhere it was used (`features.md` Phase 17)

- **Severity:** Medium (accessibility defect, not a functional break — but a real, widespread one: this single token backed ~48 axe violations across nearly every screen)
- **What happened:** `tokens.css`'s `--color-text-tertiary` (`#97979F` light mode) measured 2.68:1 contrast against `--color-bg-canvas` — well under the 4.5:1 WCAG AA minimum for normal text — and this token is used for captions, footer text, and secondary labels across almost the entire app.
- **What it meant:** Low-vision users would have had real difficulty reading a large fraction of the app's secondary text.
- **How it was found:** An automated axe-core accessibility scan (new this phase, `apps/web/e2e/regression.spec.ts`), run against a real browser-rendered page — not something the existing unit/component test suite could ever have caught (jsdom-based tests don't compute real contrast ratios).
- **How it was fixed:** Darkened the token (light mode → `#6D6D75`, dark mode `#898993` for the equivalent issue), keeping the same hue, deep enough to clear every surface it's actually painted on (4.5:1+ against the darkest/lightest surface each mode uses respectively).
- **Lesson for next time:** Contrast ratios need an automated, real-rendering check (axe-core or equivalent) as part of the regular test suite — a color token can look fine to a sighted developer on a bright monitor and still fail the actual accessibility bar. See `monologg/qa/2026-07-31-phase17/cross-device-a11y.md` for the much larger, NOT-yet-fixed contrast debt this same scan surfaced (dozens of other, unrelated color pairs — tracked separately, needs design sign-off, not a quick token fix).

### Bug #19: Hardcoded "Elias Thorne" / "Elias" talent fallback name in Talent Dashboard (Session 34)
- **What happened:** `TalentDashboard.tsx` hardcoded `"Elias Thorne"` and `"Elias"` as default profile fallbacks, storefront heading, and desktop greeting (`"Good morning, Elias 👋"`), overriding the user's default talent persona preference ("Emeka Johnson").
- **What it meant:** Talent Dashboard displayed contradictory profile names and greetings (`Good morning, Elias` vs `Emeka Johnson` in settings/sidebar).
- **How it was found:** Multi-page browser QA pass (`/qa` skill workflow).
- **How it was fixed:** Updated name fallback, Storefront preview heading, and greeting to derive dynamically from `talentName` ("Emeka Johnson") (`98a0d36`).

### Bug #20: Hardcoded "Elias Thorne" initials (`ET`) in Order Room message thread & release text (Session 34)
- **What happened:** `OrderRoom.tsx` hardcoded `"ET"` avatar initials for talent message bubbles and hardcoded `"Elias Thorne"` in the payment release confirmation system message.
- **What it meant:** Order Room messages rendered `ET` badge next to system messages that cited `Emeka Johnson`.
- **How it was found:** Multi-page browser QA pass (`/qa` skill workflow).
- **How it was fixed:** Dynamically derived avatar initials (`EJ`) and payment release system text from `appStateSync.getTalentProfile().name` (`fd95a46`).

### Bug #21: Low-contrast disabled time slot text in External Booking Entry (Session 34)
- **What happened:** `ExternalBookingEntry.tsx` applied `color: var(--color-text-tertiary)` combined with `disabled:opacity-30`, yielding extremely faint 0.05 opacity text for unselected/disabled time slots.
- **What it meant:** Time slot options were illegible under standard lighting conditions.
- **How it was found:** Multi-page browser QA pass (`/qa` skill workflow).
- **How it was fixed:** Updated disabled slot text to `color: var(--color-text-primary)` with `disabled:opacity-45` for WCAG AA 4.5:1 contrast compliance (`fa1d26c`).

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
| ~~Several unused icon imports in `TalentDashboard.tsx`~~ | — | **Fixed** in `features.md` Phase 0 — strict TypeScript's `noUnusedLocals` surfaced 38 unused imports/variables across 12 files (this one included); all removed, see `log.md` |
| ~~Fonts load from external CDNs~~ | — | **Fixed** in `features.md` Phase 11 — all three brand fonts self-hosted, see `log.md` Session 21 |
| Type-scale tokens (`--font-size-*`) exist but aren't applied to most page headings yet | Low | Explicitly scoped out during this engagement as a larger, riskier change (would touch heading markup across every page); tokens were added so the option exists, adoption was left for a follow-up pass |
| **`PATCH /verification-recordings/:id/review` has no reviewer/ownership check at all** — any authenticated user, including a recording's own creator, can approve or reject it | **High** | No moderator/admin role exists in any phase of `features.md` through Phase 17 — flagged as a known gap since Phase 12A, **confirmed and demonstrated** (self-approval proven) in Phase 17's security pass (`security.authzFuzz.test.ts`). Not fixed: building a real moderator role is feature work, out of a QA phase's scope. **Must be closed before real users are onboarded** — see `monologg/qa/2026-07-31-phase17/security.md`. |
| `apiClient.getOgImageUrl(handle)` returns a hardcoded live-API path regardless of `API_MODE` | Low | In mock mode there's no backend to serve it, so a mock-mode demo's `og:image`/`twitter:image` meta tags point at a URL that 404s. Found during Phase 17's documentation backfill (git-history review of Phase 15), not exercised by any existing test; low-stakes enough not to warrant a dedicated fix pass on its own. |
| No PWA infrastructure exists — no `manifest.json`, no service worker, anywhere in `apps/web` | **High** | Every screen has been named `PWA-XX` throughout `features.md` since Phase 0, but actual installability/offline-caching was never built in any phase. Confirmed directly (not assumed) in Phase 17's Playwright pass. Building it is feature work, out of a QA phase's scope — tracked as a P0 pre-cutover gap, see `monologg/qa/2026-07-31-phase17/cross-device-a11y.md`. |
| ~45 of 57 route×browser combinations still have serious/critical `color-contrast` axe violations (dozens of distinct color pairs, not the one token fixed as bug #15 above) | Medium | A full design-system remediation project needing sign-off on new brand colors across every accent ramp — explicitly out of a QA-only phase's scope. See `monologg/qa/2026-07-31-phase17/cross-device-a11y.md` for the full breakdown. |

**Not a bug — a scope gap, documented separately:** the entire absence of a real backend, database, authentication, and payment integration is **not** logged here as a "bug" — it's the current, intentional state of a frontend-only prototype. See `design.md` §6 for the full list of what still needs to be built.

**Also see `monologg/qa/2026-07-31-phase17/` for the complete Phase 17 findings**, including two items that are process gaps rather than code bugs: UAT and NDPA legal sign-off are both explicitly PENDING — neither can be completed by an agent.
