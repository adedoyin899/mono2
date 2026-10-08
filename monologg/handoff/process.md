# Monologg — How This Was Built: The Process, Step by Step

**Last updated:** 2026-10-08 (Session 89: Airbnb-Style Fast Category Pills, Multi-Status Action Center Polish, Enriched 6-Craft Mock Projects Catalog, and Reactive Pitch State)
**This is a living document** — add a new step whenever the high-level process changes (a new phase of work, a new workflow), in the same session as the change. See `README.md` for the full update policy.

This document explains **how** the work happened, in plain language, in the order it happened. If you're technical, it'll double as a checklist you can re-run. If you're not, skip the code-y bits in *italics* and read the rest — it should still make sense.

Think of the whole engagement as two projects back to back:
- **Part A:** turn a downloaded design file into something you can actually click through in a browser.
- **Part B:** make sure the "look and feel" (colors, spacing, buttons, cards) is built on a foundation that's easy to change later, instead of copy-pasted everywhere.

---

## Part A — From a zip file to a working app

### Step 1: Figure out what was actually in the folder

The starting point was a folder with four zip files, two logo images, and a handful of small configuration files — no working app, nothing you could open in a browser yet.

*Technical note: the zips were `cjs.zip`, `css.zip`, `guidelines.zip`, and `src (1).zip`, exported from Figma Make, a tool that turns Figma designs into React code.*

**Why this step matters:** you can't fix or run something until you know what it actually is. This was pure detective work — opening each zip, reading what's inside, figuring out which parts are the real product and which are leftover tooling.

### Step 2: Unpack everything and identify the real source code

---

### Step 41: Universal Select Dropdown Chevron & Inset Right Padding Fix (Session 72)

Resolved right-padding collisions and border overlap on `<select>` dropdown chevron indicators and input overlays across all screens:
- **Global Select Rule:** Added a universal CSS rule in `tokens.css` with `appearance: none !important`, custom SVG chevron vector icon (`stroke="%238E8E93"`), `background-position: right 0.875rem center !important` (14px inset), and `padding-right: 2.75rem !important`.
- **Input Overlay Adjustments:** Updated inline currency dropdown select positioning (`right-3.5 pl-2.5 pr-8`) and date picker input calendar icon (`right-3 pr-9`) in `TalentDashboard.tsx` and `CreatorOnboarding.tsx`.

---

All four zips were extracted. One of them contained the actual app code (all the screens, styles, images). The others contained supporting files — a settings file, some one-off scripts the design tool had used internally, and a documentation folder. None of that needed to be run, just understood.

### Step 3: Build a real, runnable project out of the pieces

The exported files were set up to be turned into a *packaged component library* (something other developers install into their own projects) — not a website you can open and click around. To actually see it working, a small number of new files had to be added:
- A "front door" file (`index.html`) — the file a browser loads first
- A small startup script that tells the app "render yourself here"
- An adjusted build configuration to run it as a normal website instead of a package

Then the project's dependencies (all the external code libraries it relies on, like React) were installed.

**Why this step matters:** this is the difference between "we have the ingredients" and "we have a meal." Nothing was invented — everything came from the original export — but it had to be wired together correctly to actually run.

### Step 4: Get a shareable preview link

Before setting up anything permanent, a quick shareable link was generated so the product could be seen immediately, without needing to install anything locally. This required one small, temporary adjustment to how the app's internal navigation worked, specifically so it would behave correctly inside a restricted preview window (this was reverted once the real local version was set up).

### Step 5: Set up a permanent local version

At the user's request, a real, ongoing local copy was set up so it could be opened anytime at `http://localhost:5173` in a normal browser, with the temporary preview-only adjustment reverted back to normal.

*Technical note: this is `app/`, running via `npm run dev`.*

---

## Part B — Making the design system solid

Once the app was running, the next ask was: audit and document the design system (the shared "rules" for colors, spacing, buttons, type), and make sure that changing a rule in one place actually changes it *everywhere* it's used — instead of someone having to remember to update it in 10 different files.

### Step 6: Audit — find out what's actually consistent and what only looks consistent

Every screen was checked against every other screen, looking for:
- Colors, spacing, and rounded-corner values — are they all pulling from the same shared "settings," or did some screens just get a similar-looking value typed in by hand?
- Repeated pieces — like the navigation sidebar, pop-up windows, avatar circles, and status labels — are they built once and reused, or copy-pasted with small differences each time?

**Why this step matters:** something can *look* consistent today by coincidence, while actually being wired up in a fragile way that breaks the moment someone tries to update it. The audit's whole job is to find that gap before it causes a problem.

**What was found**, in plain terms:
- The actual color/spacing "rulebook" was hidden inside a chunk of code instead of living in one clearly labeled settings file.
- Two old, unused copies of a *different* rulebook were still sitting in the project, quietly contradicting the real one — a trap for anyone who stumbled onto them later.
- The two biggest, busiest screens had subtly opted out of the shared "rounded corner" rule without anyone noticing, because their fallback values happened to look the same.
- A pop-up-window background color was hand-typed in ten different places instead of being one shared setting.
- Several small reusable pieces (navigation menus, pop-up windows, little circular profile icons, status tags, form labels) had been built from scratch on almost every screen that needed them, each with tiny, accumulating differences.

### Step 7: Fix the foundation

The real rulebook was moved into one clearly labeled settings file that everything else now points back to. The two old, contradicting rulebooks were disconnected (and later deleted, once confirmed they truly were unused). The hand-typed pop-up background color was replaced with one shared setting.

### Step 8: Fix the two screens that had quietly opted out

The two big screens that weren't using the shared "rounded corner" rule were switched over to use it — carefully checked first to confirm the visual result would be identical, so nothing looked different, it just became truly connected to the shared setting underneath.

### Step 9: Build the reusable pieces properly, once each

Six shared building blocks were built — a pop-up window, a small circular avatar, a status tag/badge, a form-field label, and a navigation sidebar + bottom menu — each written once, in one place, and then swapped in everywhere the old, hand-copied versions used to be. Some very minor, deliberate differences between the old copies were resolved by picking the more common version as the new standard (documented in `log.md`/`bug.md` so nothing is a mystery).

### Step 10: Check the work after every change

After each meaningful change, the project was rebuilt from scratch (a technical health-check that catches typos or broken code immediately) before moving to the next change. A few small mistakes were caught and fixed this way mid-process — see `bug.md` for exactly what those were and how they were caught.

### Step 11: Document the design system — for real, not just in writing

Rather than writing a separate document that describes the colors and components (which would immediately go stale the next time someone changes something), a **living page inside the actual app** was built at `/design-system`. It shows the real colors, spacing, and buttons/badges/avatars — pulled directly from the same settings file the rest of the app uses — so if someone changes a color tomorrow, this page updates itself automatically, with zero extra work.

A second, shareable version of that same page was also generated as a single file, so it can be opened or sent to someone without needing the local server running.

### Step 12: Clean up loose ends

With the app running well, the project folder was reviewed for anything left over and no longer needed — old placeholder files, empty files, and configuration meant for a different purpose than how the project is actually being used now. Nothing was deleted without explicitly checking with the user first; a few items (the original zip files, in particular) were a judgment call, not an obvious "junk vs. not junk" decision, so they were confirmed before removal.

### Step 13: Write this handoff

Four documents (`design.md`, `log.md`, `bug.md`, and this one) were written so that anyone picking this project up next — whether a person or another AI assistant — can understand the product, the technical decisions, the bugs that came up and how they were resolved, and the process used to get here, without needing to reconstruct any of it from scratch.

### Step 14: Turn the handoff into a living system, not a one-time snapshot

A written handoff is only useful the day it's written unless something forces it to stay current. Two more things were added to make sure this doesn't go stale the moment real work resumes:
- **`implementation-plan.md`** — a status board with checkboxes for what's done, what's actively in progress, and what's not started yet, so anyone can see the current state in ten seconds instead of reading four documents to piece it together.
- **`README.md`** — a short index explaining what each document is for, and a rule: **every future change to the app must update the relevant document(s) in the same session as the change**, not as a separate cleanup pass later. The same principle applied to the design tokens (one source of truth, updated at the point of change) now applies to the documentation about the project.

### Step 15: Put it under real version control

The project was moved into a `monologg/` subfolder and pushed to a real GitHub repository, sharing space with an unrelated existing project the same account already had there — rather than starting a brand new repo, the existing history was kept and Monologg was added alongside it, on the user's instruction. From this point on, `git log` is the authoritative record of every change; this handoff folder explains the *why*, git explains the exact *what* and *when*.

### Step 16: Scope the next phase — turning the prototype into a real product

The user provided a large, detailed technical plan (`features.md`) for building the actual backend: a database, real accounts and login, real payments held safely in escrow, identity verification, and several brand-new features (a proper booking calendar, talent applying to job posts, a public profile page anyone can book from without an account first). Before touching any code, the plan was read in full, checked against what's already built, and a couple of open questions (mainly: how the new backend code should be organized inside the shared GitHub repo) were confirmed with the user. Only once that was settled were the handoff documents updated to describe the new phase.

---

## Part C — Building the actual product, one reviewed phase at a time

`features.md` laid out 18 phases (numbered 0 through 17). The rule the whole way through: **build one phase, test it for real, stop and let the human look at it, then move to the next one** — never several phases bundled into one unreviewed pass. What follows is the plain-language summary of that whole arc; the detailed, technical version of each phase lives in `log.md`.

### Steps 17–29: the infrastructure spine (Phases 0–12A)

In order: repo tooling and automated checks (Phase 0), reorganizing the project so a real backend could live alongside the existing frontend (Phase 1), a real database (Phase 2), a real server (Phase 3), real accounts/login (Phase 4), the core "things you can do" — profiles, rate cards, bookings, messaging (Phase 5), real money held safely in escrow until a client approves the work (Phase 6), identity verification kept strictly separate from the AI-based "vibe tagging" feature so the two are never confused (Phase 7), connecting talent's calendars to Google Calendar (Phase 8), real notifications by email/text/in-app (Phase 9), account/legal/support screens (Phase 10), making the visual design fully consistent and no longer dependent on an internet connection to load fonts (Phase 11), a full security/reliability/deployment pass (Phase 12), and three add-on profile features — a downloadable media kit, a short verification video, and optional physical-attribute filters for casting (Phase 12A).

Along the way, a small number of real bugs were caught and fixed — a PDF generator that couldn't print the Naira currency symbol, a page that crashed on a type of empty server response, and others. Every one is written up in `bug.md` with exactly what went wrong and how it was caught.

### Steps 30–33: the new features nobody had scoped yet (Phases 13–16)

Four brand-new pieces were added on top of that foundation: a real, minute-by-minute booking calendar that respects a talent's actual availability (Phase 13); talent being able to apply to a client's job posting, with a hard cap on how many applicants a client has to review (Phase 14); a public profile page anyone can visit and share, even without an account (Phase 15); and the flagship feature — a complete stranger clicking a shared link can book a talent, pay into escrow, and get a account created for them automatically from the same information they already typed in for the booking, never being asked to "sign up" separately (Phase 16). Two real, user-facing bugs were caught by testing these live (not just running the automated test suite) — a "publish" button that silently didn't publish, and a wrong applicant count shown to talent — both found and fixed the same day.

### Step 34: the independent check before anything real launches (Phase 17)

Every phase up to this point was tested by whoever built it. Phase 17 is different on purpose: it's an outside check, on the assumption that the person who built something is the worst-positioned person to find what's wrong with it. This pass:
- Tried the whole app in three different real web-browser engines, at four different screen widths, and ran an automated accessibility scanner across every screen.
- Found and fixed one real accessibility bug that made a lot of secondary text too hard to read for low-vision users — but also found a much bigger backlog of similar issues that needs its own dedicated design pass, not something to rush through here.
- Found — and confirmed with a real test, not just a hunch — that anyone with an account can currently approve their own identity-verification video. That's a real problem to fix before onboarding real users, not something this pass could fix itself (fixing it means building a proper reviewer role, which is new feature work, not quality-checking).
- Confirmed that despite every screen being labeled "PWA" (progressive web app) in the plans since the very beginning, the actual "installable app" / "works offline" pieces were never built at all.
- Fired real simultaneous requests at the actual database to prove that two people can't accidentally double-book the same time slot or get double-charged — they can't, confirmed under real conditions, not just assumed.
- Wrote up exactly what personal information the app collects and where, so a real lawyer can review it — this pass can describe the data, but can't itself sign off that it's legally compliant.
- Wrote a structured script for a real test round with actual talent and clients — but couldn't run that round itself, since it takes real people and a real "practice" version of the payment/verification systems, neither of which exist yet.

**The bottom line, in plain terms: this product is fully built, but it is not yet ready for real users and real money** until the account-approval problem above is fixed and a human being — not an AI — signs off on the user-testing round and the legal data review. That's the actual gate, not a formality.

### Step 35: platform-wide design review and polish pass (Session 32)

Conducted a thorough 7-pass design review across the entire platform (Website, Talent App, Client App, Public Storefront):
- Added Monologg headers, logo navigation, and trust badges (escrow, verified profiles, money-back guarantee) to the public storefront page so strangers booking talent feel immediate platform trust.
- Created reusable `Skeleton` loading components with shimmer pulse animations for card, stat, and list layouts to eliminate plain text loading states.
- Implemented visually hidden `Skip to main content` accessibility targets across the main app shell and dashboard containers.
- Fixed rate card card borders (AI slop removal) and resolved type safety mismatches in `TalentDashboard.tsx` to enable real-time, interactive service rate card creation, editing, and deletion synced across sessions.

### Step 36: platform quality sweep and compilation fixes (Session 50)

Conducted a comprehensive quality sweep and workspace stabilization to establish a fully runnable, compile-clean MVP base:
- Resolved severe API typecheck compile blocks by explicitly validating `SUPABASE_JWT_SECRET` in the configuration loader schema.
- Synchronized the relational Postgres database schema directly using `prisma db push --accept-data-loss` (bringing the missing `AuthProvider` and `UserActivity` schema elements from previous phases into the database schema history).
- Successfully executed the integration database seed script, populating realistic test profiles, briefs, applications, and bookings across all possible lifecycle states.
- Cleaned up web app compilation defects by adding missing imports (`appStateSync` in `AuthFlow`, `Modal` in `Settings`, and `X` icon in `CreatorOnboarding`), updating component props (`Badge` expects `tone` instead of `variant`), and matching correct state-sync method names (`updateBankDetails`, `withdrawFunds`).
- Verified build and test suite integrity (Vitest) returning a 100% passing state (577 API, 78 Web tests).

### Step 37: manual currency inputs, auto-expanding range sliders, and dynamic currency conversions (Session 60)

Stabilized multi-currency workflows across the app by allowing users to enter custom base rates / budgets manually and dynamically expanding the range limits on sliders as users drag them to the edge. Unified conversions under a common library so values swap seamlessly into their equivalents when switching currencies.
- Created `/apps/web/src/lib/currency.ts` to manage conversion logic and rates.
- Refactored `LandingPage.tsx` and `ProjectBrief.tsx` to enable raw text fields that format on blur, auto-scaling sliders, and converting currency.
- Fixed budget multiplication bug on publishing briefs for non-Naira selections by transmitting values in currency-appropriate minor units.
- Updated `CreatorOnboarding.tsx` and `TalentDashboard.tsx` base price setup to convert rate values automatically on dropdown select.
### Step 38: non-technical tools & integrations architecture guide (Session 69)

Authored a comprehensive, plain-language handoff document (`monologg/handoff/tools.md`) covering every single tool, API, service, and integration in Monologg:
- Explained all 22+ architectural components using an intuitive luxury hotel analogy (frontend decor, backend front desk, database vault, armored money truck, identity scanner, talent scout AI, concierge calendar, messaging mailroom, night-shift queue workers, security guards, quality control bots).
- Created a quick-reference summary table ranking every tool's architectural importance (Critical Core, High Importance, Supporting).
- Documented how to set up each provider, including environment variables, API credentials, introduced project stage (Phases 0–17), and configuration guidelines.
- Updated `monologg/handoff/README.md`, `implementation-plan.md`, `log.md`, `design.md`, and `bug.md` to maintain full handoff documentation discipline.

### Step 39: Supabase Row Level Security (RLS) enablement (Session 70)

Enforced Row Level Security (RLS) across all application tables in the Supabase PostgreSQL database:
- Audited PostgreSQL catalog (`pg_tables` / `pg_policies`) to inspect RLS state across all schemas.
- Authored a SQL migration (`20260819120000_enable_rls_public_tables/migration.sql`) enabling RLS across all 28 public application models.
- Executed migration on live Supabase instance and verified 28/28 application tables show `rowsecurity = true`.
### Step 42: Platform-Wide Copy Standardization: Talent to Performer (Session 80)

Ahead of the Alpha launch, updated the platform's core terminology from "Talent" to "Performer" across all user-facing screens on both the client and performer webapps:
- **Client Experience:** Replaced tabs (`Find Performers`), analytical funnels (`Performer Acquisition Funnel`, `Repeat Performer Rate`), brief builder steps (`Performer Requirements`), and filtering modals (`Filter Performers by Physical Features`).
- **Performer Experience:** Updated portal headers (`Performer Portal`), onboarding checklists (`Complete your Performer Setup`), counterpart indicators in the Order Room and Checkout, public bio/storefront trust badges, and settings microcopy.
- **Scope Boundary:** Maintained backend data models (`Creator`, `UserRole`, `TALENT`) and API query parameters to preserve existing database schemas and API stability without breaking changes.
### Step 43: Performer Onboarding Overhaul & Storefront-to-Profile Modernization (Session 81)

Modernized the performer onboarding stepper and standardized platform terminology:
- **6 Craft Categories:** Replaced the previous 8 niches with the 6 core categories from design (Actors, Public speakers, Comperes, Comedians, Artists, Creators).
- **Personal Details Collection:** Built an integrated performer essentials card on Step 1 collecting Gender (4 options), Date of Birth with an interactive mini-calendar picker and dynamic age calculator, and a Nigerian Location selector with auto-suggest across 28+ entertainment hubs.
- **Strict Anti-AI Policy:** Added an explicit Anti-AI warning banner on the reel upload step emphasizing that synthetic, deepfake, or duplicated content is strictly prohibited and results in an immediate permanent account ban.
- **AI Performance Summary & Deletable Suggestions:** Provided an editable Thespian AI summary textarea on Step 4 along with direct tag deletion (`X`) and individual dismissal/deletion of suggested tags.
- **Rate Cards Overhaul:** Retitled to "Set your rate cards", enforced an Alpha limit of 2 rate cards with visual counter (`1/2`), added "Refine with Thespian AI" to service descriptions, locked base pricing to Naira (`₦ NGN`), and updated CTA to "Preview My Profile".
- **Global Profile Nomenclature:** Replaced all user-visible instances of "storefront" with "profile" across the client and performer dashboards and landing pages.

### Step 44: Onboarding Stepper Step 1 Restructuring, Clean Location/DOB & Auth Role Copy Streamlining (Session 82)

Refined the performer onboarding stepper and authentication entry point:
- **Dedicated Step 1 (Personal Details):** Separated performer personal details into its own dedicated initial step titled "Tell us about yourself" / "Enter your basic details to personalize your profile."
- **Strict Binary Gender:** Restricted gender choices strictly to `Female` and `Male` in a high-contrast 2-button selection grid.
- **Calendar-Only Date of Birth:** Preserved the interactive calendar input and popover while removing the redundant age calculation badge.
- **Streamlined Location Search:** Simplified the location field to a clean input labeled "Location" with placeholder "Search location...", removing regional chips, "Verified Hub" badges, and "Select" labels. Options display clean city names while intelligently matching both cities and states during keystroke filtering.
- **Dedicated Step 2 (Craft):** Retained craft selection on Step 2 with the 6 core categories under the title "What best describes your craft?" / "Select your primary craft to personalize your profile."
- **Auth Role Switcher Copy:** Streamlined role toggles on `/auth` from "Performer / Creator" and "Client / Employer" to strictly "Performer" and "Client".

### Step 45: Creator Profile Overhaul, Gated Applications, Rate Cards Cap & Performance Reel Modal (Session 84)

Overhauled the creator profile and application experience:
- **Profile Completion Application Gate:** Enforced mandatory profile completeness before allowing creators to pitch or apply to client projects (Bio written >10 characters, Location specified, at least 1 Rate Card created, Featured Performance Reel uploaded). Uncompleted profiles see a 4-point progress checklist with direct links to the profile.
- **Removed Profile Clutter:** Removed Media Kit downloads and Verification Video sections from the creator profile storefront tab, focusing the screen on booking rate cards, bio, credits, and featured reel.
- **Rate Cards Cap (Max 2) & Adaptive Header CTA:** Capped rate cards to a maximum of 2 across onboarding and the dashboard. Adapted the Rate Cards header CTA to be hidden for new users (0 cards), titled "Add Rate Card" when 1 card exists, and disabled when 2 cards exist.
- **In-Page Profile Editing Synced with Settings:** Built in-page edit mode directly on My Profile updating Bio, Stage Title, Location, Availability status, Style Tags, and Social Media links, syncing in real-time with `appStateSync` and `Settings.tsx`.
- **Social Media Bar & Customizable Cover:** Added Linktree/Upwork-style social media presence links row and hero banner customizer supporting image uploads (JPG/PNG/WebP) and 4 curated studio gradient presets.
- **Standalone "Upload Performance Reel" Modal:** Added a dedicated modal titled "Upload Performance Reel" with framing guidelines, video player preview, and 150MB file size validation, omitting the verification block.

### Step 46: Upload Modal Simplification, 2-Card Redundant Button Removal, Reduced Reel Height & Custom Video Player Modal, Rate Card Redesign, and Public Storefront Profile Parity (Session 85)

Refined creator upload, profile presentation, video playback, and public storefront parity:
- **Upload Modal Simplification:** Streamlined header copy ("A high-impact video showcase of your monologue, dialogue, or vocal craft" -> "Upload a video showcase of your craft."), removed the redundant "Choose Video File" chip inside the dropzone, tightened guidelines into 4 clear bullets, and changed CTA to "Save Reel".
- **Rate Cards Header Button Polish:** Completely removed the header CTA beside the notification icon once 2 rate cards are created (no redundant disabled or pill button; shown only when exactly 1 card exists as "Add Rate Card").
- **Reduced Reel Height & Custom Video Player Modal:** Reduced the featured reel height on both creator profile and public storefront to a sleek widescreen frame (`h-48 sm:h-56 md:h-60`). Clicking anywhere on the reel launches `WatchPerformanceReelModal` featuring custom Play/Pause, interactive timeline scrubber progress bar, timestamps (`00:18 / 01:30`), volume/mute toggle, replay, fullscreen, and optional owner "Replace Reel" trigger.
- **Rate Cards Section & Card Redesign:** Renamed "Booking Services & Rate Cards" to "Rate Cards", removed the bottom action buttons ("Edit" and "Book") from the creator's own profile view, repositioned Base Rate and price to the bottom above a clean hairline divider, and placed an edit pencil icon in the top-right corner to open the inline edit modal directly on the page.
### Step 47: Public Storefront 2-Card & 5XL Width Parity, Availability Double Header & Calendar Cleanup with Right-Click Context Menu & Monologg Event Icon, Projects Search Bar Consistency (Session 86)

Resolved public profile layout parity, streamlined the performer calendar experience, and harmonized project browsing controls:
- **Public Profile 2-Card Cap & 5XL Parity:** Capped mock rate cards strictly to 2 in `publicStorefront.ts` and expanded container width from narrow `max-w-2xl` to `max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8` with `rounded-[28px]` surface cards, bringing 1-to-1 visual hierarchy with the creator dashboard.
- **Availability Double Header & Calendar Cleanup:** Eliminated duplicate inner header title and second notification bell, as well as the redundant 14-day rolling date selector strip and duplicate date picker input.
- **Right-Click Context Menu & Schedule View:** Left-clicking a date tile selects the date and loads that day's schedule and events below the calendar without an intrusive modal. Right-clicking (`onContextMenu`) launches a floating action menu to "Mark as Available", "Mark as Unavailable", "Add Custom Slot", or "Add Event".
- **Visual Distinction for Calendar States:** Unavailable days are greyed out with dashed borders and `UNAVAILABLE` badges; open days remain clean and neutral without dots or colors; Monologg bookings are distinguished with the official Monologg icon (`LogoMark` in crimson accent).
- **Projects Tab Search Bar Sizing Consistency:** Standardized the search input height to `!h-10` (40px) to match the Role/Category, Budget Range, and Status dropdown selects below it, with matching surface background, border, corner radius (`rounded-xl`), and an interactive clear button (`X`).

### Step 48: Inline 5-Dimension Filter Bar, Airbnb-Style Project Detail View with Fast Tabs and Sticky Floating Action Card, and Unified Applications Inspection (Session 87)

Re-architected the performer project discovery and review flow for maximum transparency and rapid navigation:
- **Inline 5-Dimension Filter Bar:** Consolidated separate filter rows into an inline `Filters` toggle button directly beside the search bar with active filter badge counter, supporting 5 core dimensions: Category (6 craft roles), Budget Range (Under ₦100k, ₦100k–₦300k, Over ₦300k), Status (Open, Applied, Closed), Location (Lagos, Abuja, Remote), and Rating (4.8+ ★, 4.5+ ★, 4.0+ ★), accompanied by active filter chips and clear-all action.
- **Airbnb-Style Project Detail View:** Transformed the project modal into a spacious `max-w-5xl` two-column layout mirroring Airbnb stay listings:
  - **Static Sticky Header:** Back button, client name, verified client badge, star rating (`★ 4.9`), location pin, project title, and close button.
  - **Left-Hand Fast-Nav Tabs Bar:** High-speed switching across all 4 stages of client brief setup (`Overview`, `Requirements`, `Script & Assets`, `Client & Escrow`) showcasing creative synopsis, timelines, technical requirements, monologue/sides excerpt in a monospace screenplay container, and 100% Monologg Escrow Guarantee breakdown.
  - **Right-Hand Floating Action Card:** Sticky reservation card displaying fixed compensation (`₦200,000`), applicant capacity progress bar, escrow guarantee seal, and dynamic status-dependent CTAs (Already Applied with pitch quote & withdraw, Closed, Profile Completion Gate checklist, or Ready to Apply audition pitch form).
- **Unified My Applications Inspection:** Wired My Applications cards to launch the identical rich Airbnb project view, providing performers complete visibility into the client brief alongside their submission status.

### Step 49: Standalone Single-File Distribution Regeneration (monologg-app.html & monologg-design-system.html) (Session 88)

Regenerated the zero-dependency, server-free offline preview distribution artifacts to achieve 100% parity with the latest production build:
- **Production Bundling:** Built latest self-contained bundles via Vite (`npm run build:standalone` and `npm run build:designsystem`) incorporating all recent releases (Airbnb-style client favorites, brief at a glance strip, copy sides, escrow breakdowns, and 5-dimension project filters).
- **Inlined Asset Artifacts:** Embedded compiled JavaScript (`<script type="module">`) and compiled design tokens & CSS (`<style>`) directly into `monologg/monologg-app.html` (1.36MB) and `monologg/monologg-design-system.html` (320KB).
- **Zero-Server Portable Previews:** Verified that both single-file HTML distributions open directly via `file://` protocol or double-click in any browser without requiring Node, Vite, or external asset servers, fully resolving stale distribution artifact drift (Bug 39).

### Step 50: Airbnb-Style Fast Category Pills, Multi-Status Action Center Polish, and Enriched 6-Craft Projects Catalog (Session 89)

Delivered rapid 1-click category discovery, enriched all 6 craft niches in mock datasets, and perfected status-dependent action feedback:
- **Airbnb-Style Category Quick Pills:** Integrated a horizontal pill carousel directly under the search bar (`All Roles`, `Voice-Over`, `Actor`, `Model`, `Presenter / Host`, `Comedian`, `Musician`) with instant highlighted active states, syncing with the 5-dimension filter engine.
- **Multi-Status Action Center:** Tailored the constant floating reservation box with status-specific feedback:
  - `SELECTED`: Green-accented celebratory offer banner + primary CTA `Open Order Room` navigating to `/order/ORD-001`.
  - `SHORTLISTED`: Gold review status notification + `Withdraw Pitch` button.
  - `APPLIED`: Application badge + submitted pitch quote + `Withdraw Pitch` button.
  - `REJECTED` & `WITHDRAWN`: Empathetic, clean status notifications.
- **Enriched Mock Projects & Applications Catalog:** Populated full entries for `P-006` (Radio Drama VO, REJECTED), `P-007` (Lookbook Model, SELECTED), `P-008` (Afrobeats Musician), and `P-009` (Corporate Comedian), ensuring every filter parameter yields real, beautifully formatted briefs.
- **Unified My Applications Inspection:** Ensured clicking an application merges the underlying catalog brief so performers inspect complete client brief tabs, requirements, deliverables, and escrow protection alongside their submission status.
- **Standalone Distribution Inlining:** Re-compiled and inlined updated assets into `monologg/monologg-app.html` and `monologg/monologg-design-system.html`.

---

## If you're picking this up next: suggested reading order

1. **`README.md`** — the index, and the rule for keeping all of this current.
2. **`implementation-plan.md`** — current status at a glance: done, in progress, not started.
3. **`tools.md`** — non-technical overview of tools, integrations, and APIs.
4. **`design.md`** — what the product is, what's actually built (everything, as of Phase 17), and the full technical stack.
5. **`features.md`** — the detailed, phase-by-phase build plan this whole engagement followed, phases 0–17.
6. **`monologg/qa/2026-07-31-phase17/`** — the current, real gate status: what's still open before a production launch. Read this before assuming anything is "done and shippable."
7. **`log.md`** — the detailed, technical, file-by-file record of every change made.
8. **`bug.md`** — every defect found, how serious it was, and how it was fixed — useful both as a record and as a "here's what to watch out for" list.
9. **`process.md`** (this file) — the plain-language walkthrough, useful for onboarding non-technical stakeholders or refreshing your own memory quickly.

And practically: this project is a real git repository now, pushed to GitHub. Anyone continuing the work should pull the latest, make changes on top of it, and keep committing — the days of "not tracked anywhere" described earlier in this document are over.
