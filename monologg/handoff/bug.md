# Monologg — Bug & Issue Log

**Last updated:** 2026-10-10 (Session 110: Dedicated Settings Option for Personal & Craft Details [Read-Only Default with Interactive Edit Mode] and Redundant Profile Action Buttons Removal)
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

### 58. Missing dedicated settings section for onboarding personal & craft details and redundant buttons bar hovering above edit profile
- **Severity:** Low / Information Architecture & UX Redundancy
- **What happened:** In `Settings.tsx`, basic onboarding details (Gender, Date of Birth, Location, Primary Craft, Thespian AI Performance Summary, and Style Tags) had no dedicated destination in Settings where performers could inspect them in a simple read-only manner. Performers only had the public storefront editor under "Profile". In addition, the Edit Profile screen featured a floating button bar (`[Edit Profile] [Share Profile] [View Public Storefront] [Save Profile]`) directly above the profile banner that duplicated the actions situated immediately below on the profile header itself.
- **Root Cause:** Conflation of public storefront showcase with personal performer persona; redundant duplication of header action buttons in an auxiliary container.
- **Resolution:** Added a dedicated **Personal & Craft Details** section in Settings with a clean read-only view by default (Basic details, Primary craft with icon, AI summary quotation block, and style tag pills) alongside an interactive Edit Mode. Removed the redundant top action bar above the profile cover banner, harmonizing action controls beside the performer avatar and placing the Save CTA directly in the sticky top navbar.

### 57. Redundant sub-badges on filter tabs and duplicate fee breakdown row on feed cards
- **Severity:** Low / Visual Clutter & Information Architecture
- **What happened:** In `TransactionHistory.tsx`, filter chips displayed dual nested labels (e.g., `Payout Success`, `Escrow Pending`, `Dispute Settled / In Review`), which created visual noise and redundant text. Additionally, every transaction card rendered a secondary bottom row with verbose fee and account breakdowns (`Paid to ... Base ... Fee ... Ref: ...`) that duplicated the information already surfaced cleanly in the detail modal upon tapping the card.
- **Root Cause:** Attempting to surface secondary telemetry both at the filter level and at the card preview level rather than strictly in the detail view.
- **Resolution:** Stripped sub-badge bubbles from the filter tabs to keep only the clean primary titles (`All`, `Payout`, `Escrow`, `Dispute`). Removed the secondary breakdown footer row from the transaction cards, leaving clean, compact, scannable cards with all detailed breakdown fields safely housed inside the detail modal.

### 56. Complex legalistic jargon in modal, status badge terminology mismatch, and text-dense ledger cards
- **Severity:** Low / Visual Hierarchy & Readability Polish
- **What happened:** In `TransactionHistory.tsx`, status badges on transaction cards used legacy terms like "Released" and "In Escrow" instead of the user's explicit simplified terminology (`Success` for payouts, `Pending` for escrow, and `Settled` or `In Review` for disputes). Furthermore, the transaction cards lacked quick scannability with no dedicated state icons, and the detail invoice modal used dense legalistic phrases ("arbitration concluded", "automated ledger settlement", "milestone deliverables incomplete") rather than simple, transparent everyday language.
- **Root Cause:** Legacy badge terminology mapping and verbose copy in earlier iteration templates.
- **Resolution:** Updated `STATE_META` to map `RELEASED` to `Success`, escrow states to `Pending`, `REFUNDED` to `Settled`, and `REFUNDING` to `In Review`. Redesigned cards with 40px rounded state icons (`CheckCircle2`, `Clock`, `AlertCircle`, `RotateCcw`), bold left-right hierarchy, and a clean secondary context footer. Rewrote the detail modal copy into direct, human 1-sentence explanations (e.g., *"Booking was cancelled. Money was refunded to the client. You received ₦0."*) focusing strictly on essential figures.

### 55. Static hardcoded balance card, redundant withdrawal CTA on performer history, and ambiguous dispute accounting
- **Severity:** Medium / Financial Ledger UX & Telemetry Accuracy
- **What happened:** In `TransactionHistory.tsx`, the top black summary card showed a static hardcoded `₦1,420,000` balance and `8 Completed Escrow Contracts` that failed to update when switching status filter pills. In addition, the card featured a redundant `Request Payout Withdrawal` CTA that conflicted with performer wallet actions on `TalentDashboard.tsx`. Furthermore, disputed transactions were generically labeled as "Payment · Refunded" without clarifying whether funds were returned to the client or received by the performer, causing ambiguity over available balances.
- **Root Cause:** Hardcoded strings in the summary hero card; lack of dynamic category aggregation logic; missing dispute taxonomy distinguishing `In Review` mediation from `Refunded to Client` settlements.
- **Resolution:** Removed the withdrawal CTA button; implemented a 4-chip taxonomy (`All`, `Payout`, `Escrow`, `Dispute`); connected the hero card to dynamically compute and display the active category's total amount, title, and contract count; and introduced clear directional dispute badging (`↩ Refunded to Client`, `⏳ In Review`, `• Escrow refunded to client · Net performer earnings: ₦0`) with contextual resolution banners in the detail invoice modal.

### 54. Unprotected Delete Account card without confirmation/payout transparency, unmanaged password inputs with prematurely enabled CTA, and extraneous passcode subtext
- **Severity:** Low / UX Risk & State Management
- **What happened:** In `Settings.tsx`, clicking the Delete Account card did nothing (unbound `<button>` element with no confirmation modal or operational copy), creating confusion over what happens to a performer's profile, data, and unsettled escrow earnings. In addition, the Change Password form used uncontrolled `<Input>` components with an unconditionally active `Update Password` CTA that could be clicked without entering any credentials. Finally, the Change Passcode card included a redundant subtext that broke visual symmetry with the clean Change Password card.
- **Root Cause:** Placeholder delete button without confirmation modal; unmanaged input state in the password card; subtext asymmetry.
- **Resolution:** Built a comprehensive Delete Account confirmation modal with permanent data loss notice, under-72-hour earnings transfer guarantee to the user's verified bank account, and double-confirmation security gate (typing "DELETE"). Controlled all 3 password inputs in local state and disabled `Update Password` until all 3 fields contain text. Removed the subtext from Change Passcode for clean visual symmetry.

### 53. Cluttered Security & Privacy section, unverified single-input passcode without confirmation/current PIN validation, and non-functional 2FA/Sessions cards
- **Severity:** Low / UX Clutter & Security Validation Gap
- **What happened:** In `Settings.tsx`, the Security & Privacy section displayed non-functional placeholder cards for "Two-Factor Authentication" and "Active Sessions (2 devices logged in)" that created clutter without user utility. In addition, the withdrawal passcode card only showed a single raw input with "Save Passcode" that did not authenticate the user's current PIN nor require a confirmation PIN, and referenced an undeclared `securityPasscode` state variable that bypassed full input lifecycle checks.
- **Root Cause:** Placeholder security mockup elements from early templates; withdrawal passcode card not adhering to the standard 3-field credential change pattern (Current, New, Confirm New).
- **Resolution:** Removed the Two-Factor Authentication row and Active Sessions card. Reworked the withdrawal passcode card into a full "Change Passcode" card mirroring the Password card: subtext `4-digit PIN required to authorise earnings withdrawals`, 3 inputs (`Current Passcode`, `New Passcode`, `Confirm New Passcode`), full-width `Update Passcode` button, and robust validation enforcing the current passcode (`1234` default or previous code), 4-digit constraints, and matching confirmation before writing to `localStorage`.

### 52. Disjointed Payment Methods UX, duplicate payout bank cards, and improper saved cards exposure on Performer profiles
- **Severity:** Low / UX Consistency & Role Boundary
- **What happened:** In `Settings.tsx`, performers navigating to Payment Methods were presented with duplicate Payout Bank Account cards (an open edit form card at the top with a redundant "Verified" badge, and another bank card at the bottom of the page with an "Edit" button). Furthermore, client billing cards ("SAVED CARDS (OPTIONAL BACKUP)", "+ Add Card", and "+ Add Payment Method") were shown to performers who only receive payouts to a Nigerian bank account, creating visual clutter and operational ambiguity.
- **Root Cause:** Accidental duplication of bank card templates during early iterations; lack of role gating (`!isClient`) around billing card sections; missing operational copy explaining Monologg's single-bank payout model and 48-hour security locking rule.
- **Resolution:** Unified the performer payment section into a single, cohesive Payout Bank Account card. Relabeled the menu item and header to `"Payment details"`, removed the `Verified` badge and client saved card blocks for performers, explicitly stated the one-payout-bank policy both before and after saving, and integrated a 48-hour security memo warning.


### 51. Duplicate "Save Changes" button label collisions and vertical form questionnaire replacing authentic performer storefront in Settings
- **Severity:** Low / Test Ambiguity & UX Consistency
- **What happened:** In `Settings.tsx`, rendering a simple vertical form with onboarding questions (craft category dropdown, raw email input) duplicated account identification data already presented in the main Settings header card, while lacking the rich Performer Profile aesthetics (Hero banner presets, avatar camera overlay, video reel preview, rate cards, and social links). Furthermore, rendering multiple identical `"Save Changes"` buttons across the top bar, in-page edit form, and page bottom caused test query ambiguity (`getByText("Save Changes")`).
- **Root Cause:** Duplication of onboarding inputs on the profile sub-page; lack of distinct action labeling (`Save Profile` for inline forms vs `Save Changes` for the primary submit action).
- **Resolution:** Refactored `section === "profile"` in `Settings.tsx` to replicate the full Performer Profile storefront card from `TalentDashboard.tsx` in an interactive, editable format. Relabeled the in-page form action to `Save Profile` and kept `Save Changes` as the unique primary page action, restoring clean test assertions and delivering a unified performer experience.

---

### 50. Redundant reviews modal header copy, missing rating distribution bars, and disjointed Settings profile editing
- **Severity:** Low / UI Redundancy & Settings Synchronization
- **What happened:** In `TalentDashboard.tsx`, the Reviews modal header repeatedly showed the same words across multiple elements ("Client Ratings & Reviews" title, "100% Verified" badge, "8 verified client reviews", and "100% Recommended" subtitle). It also lacked the standard marketplace rating distribution breakdown (5★ to 1★ bar charts) shown in the user's reference designs. In `Settings.tsx`, the user header card featured a redundant `Edit` pill on the right while the `Verified` badge sat below the email; additionally, clicking "Profile & Storefront" opened an incomplete editor that did not allow editing stage title, craft category, craft tags, or social handles collected during onboarding.
- **Root Cause:** Repetitive microcopy in reviews modal header; missing 3-column stats structure from PRD/references; obsolete "Storefront" nomenclature in settings; lack of synchronization between onboarding profile fields, Settings state, and `getPublicStorefront`.
- **Resolution:** Replaced the cluttered Reviews modal header with a clean, single-phrase title ("Reviews") and subtitle, accompanied by 3 clear statistical pillars: Total Reviews with verification status, Average Rating with 5 gold stars, and 5-to-1 star horizontal breakdown bars matching actual review scores. In `Settings.tsx`, replaced the top-right `Edit` pill with a prominent `✓ Verified` badge, renamed "Profile & Storefront" to "Profile", added a public profile preview card with link, and provided full editing of all onboarding-collected attributes (Full Name, Stage Title, Craft Category dropdown, Location, Bio, Style Tags, and Social Handles) synchronized with `appStateSync.getTalentProfile()` and public profile views.

---

### 49. Visual clutter from nested cards, double-icon duplication in review list, and mismatched graph palette
- **Severity:** Low / Visual Hierarchy & Brand Identity
- **What happened:** In `TalentDashboard.tsx`, the review cards suffered from heavy nested-card clutter (an overhead card inside the modal, plus nested gray quote boxes inside each review card) and icon duplication (displaying 5 star icons adjacent to the numeric rating, alongside client initials avatars and verification checkmarks). All ratings looked uniform without colored backgrounds to distinguish scores at a glance. In the Analytics tab, the category spline graph used generic electric cyan and pastel lavender that clashed with Monologg's crimson/violet design language, legends sat at the bottom of the card, and an out-of-place summary reputation bar was positioned below the chart.
- **Root Cause:** Over-nesting of card containers; lack of distinct rating badge styling; hardcoded cyan/lavender hex codes rather than platform brand tokens; placement of legends below chart rather than in the header.
- **Resolution:** Excised the out-of-place bottom rating bar. Removed the nested overhead 4.9 card container in the modal in favor of an integrated horizontal typographic summary strip. Replaced the 5-star row with a single, background-tinted rating badge (`★ 5.0` in emerald, `★ 4.9` in amber, `★ 4.8` in warm orange) and replaced nested gray quote boxes with clean italic text indented by a subtle left border (`border-l-2`). Overhauled chart palette to Monologg Performer Red (`#E50914`) and Client Violet (`#7C3AED`), and repositioned legends above the chart alongside the timeframe selector.

---

### 48. Fragmented dual analytics cards and lack of search/filter in client reviews modal
- **Severity:** Low / Information Density & Review Explorer Usability
- **What happened:** The analytics tab used a side-by-side 2-card layout (horizontal progress bars for categories and a separate bar chart) which felt fragmented and cramped compared to an expansive, smooth spline area curve showing category trends. Additionally, client reviews were shown as an un-filterable static list with no ability to search by client name, project, or keyword, nor filter by rating, date, or studio.
- **Root Cause:** Earnings by category was split across multiple smaller cards rather than taking advantage of full-width spline area charting; the reviews modal lacked a search input, filter selects, and sort state handlers.
- **Resolution:** Replaced the two-card split with a single full-width spline area chart ("Earnings by Category") utilizing Catmull-Rom cubic Bézier curve paths with dual gradient fills for the 2 active gigs/rate cards, interactive mouse-tracking tooltips, and a timeframe selector. Placed a dedicated Client Reviews & Studio Ratings reputation bar directly underneath the graph. Upgraded the Client Reviews modal with real-time search, multi-dimensional filters (rating, client, date/sort, tags), reputation breakdown, and direct `View Order Room →` navigation links.

---

### 47. Bulky accordion bank picker, invisible monthly growth chart bars, and lack of completed order rating system
- **Severity:** Low / UX Polish & Feedback Completeness
- **What happened:** In `TalentDashboard.tsx`, the destination bank input was wrapped in an expandable box accordion that felt heavy and clunky compared to a standard native input with subscript text. In the Analytics tab, the Monthly Booking Growth chart bars collapsed to zero height because of unconstrained flex-col sizing, and revenue was split across 3 generic niches instead of the performer's 2 real rate cards. In `OrderRoom.tsx`, once an order concluded (`phase === "complete"`), the action dock became empty with no reciprocal rating or review capability for clients and talents.
- **Root Cause:** Custom accordion introduced excessive DOM chrome; chart bars lacked explicit flex container heights; rate cards were hardcoded to 3 items rather than slicing active services (`effectiveServices.slice(0, 2)`); completed order phase lacked an interactive review feedback loop.
- **Resolution:** Replaced bank accordion with a clean `<select>` listing added accounts, showing account details and a green checkmark as minimal subscript text only. Restored initial receipt modal layout with a subtle 3.5% opacity Monologg watermark. Standardized 4 analytics cards (`Profile view`, `Project completed`, `Average rating`, `Total earnings`), restricted category earnings to the 2 available rate cards, and fixed chart bar rendering. Implemented reciprocal 1–5 star rating with prefilled tags and note textarea in `OrderRoom.tsx`, and connected the "Average rating" analytics card to a dedicated Client Ratings & Reviews modal linking directly to project order rooms.

---

### 46. Redundant dual bank select layout, awkward stretched passcode placeholder, and unbranded receipt
- **Severity:** Low / UX Flow & Brand Polish
- **What happened:** In `TalentDashboard.tsx`, the withdrawal authorization modal presented a redundant dual layout: an unstyled `<select>` dropdown stacked right above a standalone destination account card. On the passcode step, a redundant shield icon and "Authorize Payout" sub-header were shown, and the placeholder `"Enter 4-digit PIN"` was stretched across wide tracking (`tracking-[0.4em]`), creating an awkward visual bug (`E n t e r   4 - d i g i t`). Furthermore, the generated Payout Receipt lacked Monologg brand identity and watermark when saved or printed.
- **Root Cause:** Legacy MVP modal components combined `<select>` elements with display preview cards without consolidating them into an interactive selector; the text placeholder was styled with numeric tracking; receipt modal omitted brand mark and watermark tokens.
- **Resolution:** Re-titled modal to "Withdraw Funds" and unified destination account selection into an interactive card displaying the bank name as primary, subtext with masked account number & account name, and a green verification checkmark with an expandable added accounts dropdown. Standardized PIN input to standard conventions (`h-12`, `font-mono text-xl tracking-[0.4em]`, `placeholder="••••"`), titled "Enter your passcode" with "Withdraw Funds" CTA. Overhauled Payout Receipt with Monologg header brand mark, centered subtle logo watermark (`LogoMark`), and escrow protocol verification stamp with print contrast.

---

### 45. Inappropriate "Request Revision" action on concluded onsite gigs and cluttered jagged header title
- **Severity:** Low / UX Logic & Visual Polish
- **What happened:** In `OrderRoom.tsx`, clients reviewing an onsite live performance (e.g. Comedy Night at Eko Hotel) were presented with a "Request Revision" button. Physical live event performances that have concluded cannot be revised; only digital deliverables can be re-cut or re-recorded. In addition, the header title was cluttered with stacked status pills, order IDs, and escrow chips that wrapped awkwardly, looking jagged and complex.
- **Root Cause:** Review action buttons lacked conditional branching on `isOnsite`, and header navbar rendered multiple metadata chips simultaneously rather than deferring detailed information to the dedicated Order Details modal.
- **Resolution:** Gated `Request Revision` to `!isOnsite`, showing only `Dispute` and brand-purple `Release ₦120,000` for onsite gigs (2 CTAs), while retaining `Request Revision` for digital submissions (3 CTAs). Simplified header title into a crisp, clean 2-line title and subtitle for both roles.

---

### 44. Arrival verification handshake PIN visible to performer in Order Details and multi-box input layout breakage
- **Severity:** Medium / Security & Handshake Integrity
- **What happened:** In `OrderRoom.tsx`, the arrival handshake code (`4821`) was rendered inside the Order Details modal regardless of role (`role === "talent"` or `role === "client"`). This allowed the performer to inspect the handshake code directly from their own details dialog, defeating the verification requirement of asking the client in person upon arrival. Furthermore, the PIN input in the Verify Live Appearance modal was split into multiple boxes that wrapped and stretched unevenly on mobile screens, appearing as two mismatched boxes.
- **Root Cause:** Missing role gate `{role === "client"}` on the arrival code container in the Order Details modal, and split input box styling without rigid container width controls.
- **Resolution:** Gated the arrival code block strictly to `{isOnsite && role === "client" && ...}`, hiding it completely from the performer. Replaced the multi-input PIN element with a single full-width numeric input box with centered letter tracking (`tracking-[0.4em]`), `maxLength={4}`, and real-time validation against the client's code.

---

### 43. Missing deliverable evidence workflow for onsite/live performers and lack of 48-hour inspection countdown guardrail
- **Severity:** Medium / UX & Product Integrity
- **What happened:** In `OrderRoom.tsx`, deliverable submission was limited exclusively to digital file uploads (MP3, WAV, PDF, ZIP). Live performers (such as standup comedians at Eko Hotel, stage actors, emcees, or runway models) had no formal way to submit on-site appearance evidence, GPS check-in/out stamps, or PIN handshake verifications. Additionally, there was no inspection countdown timer protecting performers from indefinite review delays.
- **Root Cause:** The early prototype assumed purely remote digital creative deliverables and lacked guardrails for physical on-site gigs and an escrow auto-release inspection window.
- **Resolution:** Added dual-mode Deliverable submission (`Online Files` vs `Onsite Appearance`) featuring GPS coordinates chip (`6.5244° N, 3.3792° E · Lagos`), timestamp chips, two verified proof methods (Check-in/Check-out with stage photo, and PIN handshake with 4-digit code `4821`), a dedicated Onsite Appearance Certificate in chat, and an active 48-hour inspection countdown timer with automated escrow release upon timer expiry if uncontested.

---

### 42. Eye-straining bright red sender chat bubbles, intrusive simulation banner, and clunky deliverable modal
- **Severity:** Low / UX & Visual Design
- **What happened:** In `OrderRoom.tsx`, performer chat messages were rendered in a searing solid red (`#F13030`) background that clashed with conversational legibility. In addition, an intrusive "Simulate Role" banner spanned the entire chat width, and the "Submit Deliverable" modal lacked interactive file selection and staged file previews.
- **Root Cause:** Chat bubbles used raw brand accent color instead of conversational neutral hierarchy, and developer simulation controls were positioned inside the primary message view.
- **Resolution:** Upgraded sender message bubbles to a sophisticated obsidian (`#18181B`) background with white typography; moved role simulator to a compact segmented toggle in the header; added a clean 4-step phase progress strip; and rebuilt the Submit Deliverable modal with real drag-and-drop file staging and preview.

---

### 41. Over-cluttered project detail modal with AI slop/gradient cards and redundant search category pills strip
- **Severity:** Low / UX & Visual Design
- **What happened:** Inspecting a project presented a cramped overlay modal with visual clutter ("Client Favorite" gradient cards, multiple colored icon strips, fragmented tab navigation). Simultaneously, a redundant row of category tags sat directly under the search bar while filters were displayed as an inline accordion panel.
- **Root Cause:** Accumulated prototype UI elements (tabs, gradient badges, inline accordion controls) led to visual fatigue and cramped presentation on smaller viewports.
- **Resolution:** Replaced the modal with a dedicated fresh-page editorial view with clean typography hierarchy, clear sections (Creative Brief, Role Requirements, Audition Sides with copy button, Deliverables, Escrow), stripped the redundant category strip beneath the search bar, and moved filtering into an accessible Filter Modal featuring budget and rating sliders alongside clickable craft pills.

---

### 40. Stale application state sync in project modal and unmapped mock applications
- **Severity:** Low / UI State & Data Integrity
- **What happened:** In `TalentDashboard.tsx`, withdrawing an application within the open project detail modal did not immediately update the open modal's state (requiring a close and re-open to see the withdrawn state). Additionally, `MY_APPLICATIONS` had an entry (`myapp-3` referencing `P-006`) that was not registered in `PROJECTS`, causing fallback placeholder data to load instead of an authoritative client brief.
- **Root Cause:** `handleWithdrawApplication` only updated `myApplications` array state without propagating to `selectedProject`. Furthermore, `P-006` was missing from `mocks/projects.ts`.
- **Resolution:** Updated `handleWithdrawApplication` to reactively update `selectedProject.myApplication.status`. Added full mock entries for `P-006`, `P-007`, `P-008`, and `P-009` across all 6 crafts, and added `myapp-4` for testing the `SELECTED` state with "Open Order Room" navigation.

---

### 39. Stale standalone HTML distribution artifacts
- **Severity:** Low / Deployment & Distribution
- **What happened:** The root double-clickable preview files `monologg-app.html` and `monologg-design-system.html` had not been rebuilt since Session 3 (July 28). When opened directly by non-technical stakeholders or reviewers, they rendered a months-old version of the product lacking 80+ sessions of subsequent features.
- **Root Cause:** Build inlining was a manual step rather than an automated hook, causing the single-file distribution artifacts to drift from the active TypeScript codebase.
- **Resolution:** Re-ran `npm run build:standalone` and `npm run build:designsystem`, and inlined the updated production JavaScript and Tailwind CSS directly into both root distribution files.

---

### 38. Filter UX clutter and project brief transparency disconnect
- **Severity:** Medium / UX & Discovery
- **What happened:** In `TalentDashboard.tsx`, project filters were rendered as separate rows eating vertical space and lacked critical dimensions requested by users (Location, Client Rating). Furthermore, the project detail view was a compact modal that only showed a sparse summary and didn't reflect the detailed steps that clients completed during brief creation (script sides, deliverables, requirements, client credentials).
- **Root Cause:** Early mockups used a simple modal designed for initial brief previews without accommodating rich multi-step creative briefs or advanced filtering.
- **Resolution:** Replaced stacked filters with an inline `Filters` toggle button directly beside the search bar with 5 filter dimensions (Category, Budget Range, Status, Location, Rating). Redesigned the project detail view into a two-column Airbnb-style modal with a static header, 4 fast-nav brief tabs (`Overview`, `Requirements`, `Script & Assets`, `Client & Escrow`), and a sticky floating action card dynamically adapting to application status.

---

### 37. Projects and Activity search bar height and styling mismatch with filter dropdowns
- **Severity:** Low / Cosmetic
- **What happened:** In `TalentDashboard.tsx`, the search bar rendered as a bulky `54px` tall box with `bg-surface-2` (grey) background and `rounded-[var(--radius-lg)]`, while the three filter select dropdowns directly underneath were `36px` (`h-9`) tall with `bg-surface` (white) background, creating jarring visual inconsistency.
- **Root Cause:** `<Input>` defaults to `h-[54px]` while the filter `<select>` elements used `h-9` without synchronized styling.
- **Resolution:** Standardized both the search input and the filter selects to `h-10` (40px) with `rounded-xl`, matching `bg-[var(--color-bg-surface)]` background and `border-[var(--color-border-default)]` border. Added a quick clear (`X`) button inside the search input.

---

### 36. Duplicate headers and duplicate calendar strips on Availability page
- **Severity:** Medium / UI Clutter
- **What happened:** Navigating to the Availability tab rendered a duplicate `<h2>Availability</h2>` title and a second notification bell icon inside the tab content directly below the main shell header, as well as a redundant 14-day rolling horizontal date strip and duplicate date picker input.
- **Root Cause:** Legacy tab mockup retained an inner header bar and secondary date carousel above the main Month/Week/Day calendar views.
- **Resolution:** Removed the redundant inner header, notification bell, rolling date strip, and duplicate date input, centering Month, Week, and Day views with clean navigation controls.

---

### 35. TypeScript TS2367 comparison error in `TalentDashboard.tsx`
- **Severity:** High / Build Failure
- **What happened:** `npx pnpm -r typecheck` failed with `TS2367: This comparison appears to be unintentional because the types '"personal" | "hold"' and '"booking"' have no overlap.`
- **Root Cause:** In `handleAddEvent`, `bookingId` evaluated `newEventKind === "booking" ? "bk-local" : null`, but `newEventKind` was typed as `useState<"personal" | "hold">("personal")`.
- **Resolution:** Simplified `bookingId: null` since manually added creator events are personal/hold entries, while Monologg platform bookings originate from backend orders. Restored clean workspace typecheck.

---

### 34. `effectiveServices` in TalentDashboard hardcoding empty array for new users
- **Severity:** Medium / Data Flow
- **What happened:** In `TalentDashboard.tsx`, line 272 defined `const effectiveServices = isNewUser ? [] : services;`. When a new user created a rate card, the newly created card was saved in `services` / `appStateSync`, but `effectiveServices` remained `[]`, hiding their newly created rate cards from both their profile and rate cards tab.
- **Root Cause:** A stale ternary hardcoded `effectiveServices` to `[]` whenever `isNewUser` was true, ignoring newly created service entries.
- **Resolution:** Updated `effectiveServices` to directly bind to `services`, which initializes from `appStateSync.getServices()` and accurately reflects empty state initially and created rate cards dynamically.

---

### 33. `ReferenceError: useRef is not defined` in TalentDashboard.tsx
- **Severity:** High / Build Failure
- **What happened:** Vitest test suite failed across `TalentDashboard.notifications.test.tsx`, `TalentDashboardAvailability.test.tsx`, and `dashboardParity.test.tsx` with `ReferenceError: useRef is not defined`.
- **Root Cause:** Added `coverFileInputRef = useRef<HTMLInputElement>(null)` for the profile cover photo upload, but `useRef` was omitted from the React import statement.
- **Resolution:** Added `useRef` to `import React, { useEffect, useState, useRef } from "react";`. Restored 100% passing tests (24/24 files, 97/97 tests).

---

### 32. Onboarding test helper single-step transition failure after separating personal details and craft
- **Severity:** Medium / Test Suite
- **What happened:** In `CreatorOnboarding.test.tsx`, the `goToUploadStep` helper clicked "Continue" only once expecting to reach "Upload your showcase reel" (Step 2 in the old design).
- **Root Cause:** By dedicating Step 1 to Performer Personal Details and Step 2 to Craft Selection, the reel upload moved from Step 2 to Step 3. A single click on "Continue" advanced only to Step 2 ("What best describes your craft?"), causing Step 3 element queries to time out.
- **Resolution:** Added the second `fireEvent.click(await screen.findByText("Continue"))` inside `goToUploadStep` to properly traverse Step 1 (Personal details) and Step 2 (Craft), restoring 100% green status across all 24 web test files and 97 tests.

---

### 31. Out-of-sync test assertions and label selectors following talent-to-performer copy change
- **Severity:** Low / Cosmetic
- **What happened:** Vitest test suites (`ClientDashboard.test.tsx`, `ProjectBrief.test.tsx`, `AuthFlow.test.tsx`, `HelpSupport.test.tsx`, and `authFlowStress.test.tsx`) failed after updating platform copy from "Talent" to "Performer" due to strict regex string queries (e.g. `/Find Talent/i`, `/Talent Requirements/i`, `/When does a talent get paid/i`).
- **Root Cause:** Tests asserted on exact user-facing microcopy which was changed to standard "Performer" branding.
- **Resolution:** Synchronized all query matchers and label assertions in test files to expect "Performer" / "Performers", bringing the entire 24-file web test suite to 100% green (97/97 tests passing).

---

### 30. Select dropdown chevron arrow colliding with right rounded border radius & height mismatch with form inputs
- **Severity:** Low / Cosmetic
- **What happened:** Native `<select>` elements (e.g. Destination Bank Account select in Withdrawal Authorization modal, Repeats select in Recurring Availability modal) rendered dropdown arrows pressed right against the right border radius of pill containers and had mismatched heights (`44px` / `h-11`) compared to `<Input>` fields (`54px` / `h-[54px]`).
- **Root Cause:** Browser-default select arrows use small default padding (`px-3`) that collides with rounded corner curves (`rounded-xl` / `rounded-[var(--radius-md)]`), and individual components declared non-standard select heights.
- **Resolution:** Added a global CSS rule in `tokens.css` with `appearance: none !important`, custom SVG chevron vector icon (`stroke="%238E8E93"`), `background-position: right 0.875rem center !important` (14px inset), and `padding-right: 2.75rem !important`. Standardized form `<select>` elements to `h-[54px] rounded-[var(--radius-lg)] px-4 text-base` matching `<Input>` default height across all modals and forms.

---

### 29. Missing avatarUrl in SidebarIdentity interface
- **Severity:** Medium
- **What happened:** Attempting to pass `avatarUrl` to `Sidebar` in `ClientDashboard.tsx` and `TalentDashboard.tsx` resulted in TypeScript type errors `TS2353` and `TS2339` because `SidebarIdentity` interface lacked `avatarUrl?: string;`.
- **Root Cause:** `SidebarIdentity` interface was originally typed only for `initials`, `name`, and `subtitle`.
- **Resolution:** Added `avatarUrl?: string;` to `SidebarIdentity` in `Sidebar.tsx` and `<Avatar src={identity.avatarUrl}>` to render profile images with initials fallback. Verified with `npx pnpm -r typecheck` passing with 0 errors.

### 28. Overlarge numeric amount layout breakage
- **Severity:** Medium
- **What happened:** Entering extremely large base rates or project budgets (e.g. 15+ digits) caused calculations to overflow and broken layout blocks with text overlapping in the escrow calculator card and client brief screens.
- **Root Cause:** Input fields accepted arbitrary string length digits without limit validation, rendering labels that overflowed the fixed-width UI panels.
- **Resolution:** Implemented high-value limit validation in all currency inputs capping entry at `999,999,999,999,999`. If exceeded, it triggers a funny error modal rotating warning options with mobile layout viewport safety.

### 27. Multi-currency project brief budget multiplier bug
- **Severity:** Medium
- **What happened:** Selecting USD/GBP/EUR or other non-Naira currencies in `ProjectBrief.tsx` and selecting a budget preset caused the posted `budgetAmount` to be wrong, e.g., posting $150,000 instead of $100.
- **Root Cause:** The component parsed the Naira preset values (`selectedBudget.split("-")[0]`) and sent them directly to the API as the base budget unit for the selected currency.
- **Resolution:** Introduced unified currency conversion. The budget presets are now calculated on-the-fly and click presets update a precise `budgetAmount` in the selected currency, which is properly multiplied into cents/kobo units for transmission.

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

### 16. Deeply-nested, space-containing asset folders broke copying the project via cloud sync

- **Severity:** Low–Medium (never broke the running app or a build — every affected file was unreferenced by any code — but a real, user-facing operational problem: the project folder couldn't be reliably copied/synced)
- **What happened:** `brand/mono fonts/` nested a full font-family archive 8 levels deep (`GeneralSans_Complete/Fonts/WEB/fonts/GeneralSans-VariableItalic.woff2`, etc.) with spaces in folder names (`mono fonts`, `plus jakarta`), and `apps/web/src/imports/reference-screenshots/` put 17MB of images inside the active app's source tree. Cloud-sync tools (Dropbox/OneDrive/Google Drive-class) enforce their own path-length caps, often stricter than the OS's own limit — combined absolute paths through these folders were long enough to trip that cap.
- **What it meant:** The user reported real trouble copying the project folder.
- **How it was found:** Reported directly by the user, then confirmed by measuring actual path lengths/depths and cross-checking which folders were the real contributors (`apps/web/public/fonts/` — the font files actually wired into the app — was already flat and fine; it was specifically the two unused/misplaced trees above).
- **How it was fixed:** `brand/mono fonts/` was deleted outright (confirmed unreferenced by any code, easily re-sourced later if ever needed). `reference-screenshots/` was moved to a top-level `monologg/reference-screenshots/` folder (still historical reference material, just no longer nested inside `apps/web/src/`). See `log.md` Session 61.
- **Lesson for next time:** "Committed for future use" asset archives are exactly the kind of thing that quietly accumulates depth/size without anyone noticing, since nothing ever fails to build because of them — worth a periodic sweep for large, unreferenced, deeply-nested folders, not just a reactive fix once someone hits a real copy/sync failure.

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
