# Monologg — Implementation Plan (Living Document)

**Last updated:** 2026-10-09 (Session 98: Withdrawal Flow Polish — "Withdraw Funds" Modal, Added Accounts Selector, Standard Passcode Convention, and Monologg Watermarked Receipt)
**Status:** All 18 phases of `features.md` (0–17) + Phase 12B Supabase Auth + Phase 12C Withdrawal OTP Gate + Session 39 & 40 Stress Test + Session 51–60 Visual Overhauls & Design Fixes + Sessions 61–72 Auth, Avatar Sync, bg.svg Pattern, OAuth Stress Testing, Non-Technical Tools Guide, Vercel Integration, Supabase RLS Enablement, Talent Availability Page UI Overhaul & Universal Select Dropdown Chevron & Inset Right Padding Fix + Session 80 Platform-Wide Copy Standardization + Session 81 Performer Onboarding Overhaul + Session 82 Onboarding Stepper Step 1 Restructuring + Session 83 Onboarding Polish + Session 84 Creator Profile Overhaul + Session 85 Reel Player & Rate Cards Polish + Session 86 Availability Cleanup & Projects Search Consistency + Session 87 Inline 5-Dimension Filters & Airbnb Project Detail + Session 88 Standalone HTML Regeneration + Session 89 Airbnb Category Quick Pills & Multi-Status Polish + Session 90 Dedicated Fresh Page for Project Details & Filter Modal with Sliders + Session 91 Order Room Visual Simplification + Session 92 Onsite Live Gig Evidence & 48-Hour Inspection Auto-Release Timer + Sessions 93-97 Order Room FAANG UX Overhaul + Session 98 Withdrawal Flow UX Streamlining & Monologg Watermarked Receipt.

---

## ✅ Done

### Session 98 — Withdrawal Flow Polish: "Withdraw Funds" Modal, Added Accounts Selector, Standard Passcode Convention, and Monologg Watermarked Receipt
- [x] **Withdraw Funds Modal & Added Accounts Selector**:
  - Set Step 1 modal title to `"Withdraw Funds"`.
  - Replaced redundant dual `<select>` and static preview card with a unified destination bank account selector.
  - Selected account input card displays bank name as primary, subtext with masked account number & name, and green checkmark.
  - Clicking selector expands dropdown list to pick from added accounts (`Access Bank Plc`, `GTBank`, `Zenith Bank Plc`) with instant state synchronization.
- [x] **Standardized 4-Digit Passcode Input & Clean Copy**:
  - Modal title set to `"Enter your passcode"`.
  - Removed shield icon and `"Authorize Payout"` header.
  - Cleaned copy: `"Enter your 4-digit passcode to withdraw ₦{withdrawAmount} to {bankName}."`
  - Applied standard PIN input convention: `h-12`, `font-mono text-xl tracking-[0.4em]`, `placeholder="••••"`, centered text, `maxLength={4}`, `inputMode="numeric"`.
  - Primary CTA set to `"Withdraw Funds"`.
  - Direct transition to receipt modal upon passcode entry without browser alerts.
- [x] **Monologg Branded Receipt with Watermark**:
  - Official header with Monologg brand mark (`LogoMark`), `"MONOLOGG"` wordmark, `"Official Receipt"` badge, and reference code.
  - Centered subtle Monologg logo watermark (`LogoMark`) behind receipt body and amount card with high-contrast print support (`print:opacity-15`).
  - Added official Monologg Escrow Protocol Guarantee verification stamp.
  - Save / Print receipt action via `window.print()`.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` (1.35MB) with freshly inlined bundle.
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors), build clean.

### Session 97 — Order Room UX Polish: Conditional Revisions Gate, 3/2 CTA Hierarchy in Brand Color, and Clean Minimal Header Title
- [x] **Conditional Revision Gate**: Gated "Request Revision" so it only renders for digital file submissions (`!isOnsite`) and is hidden for verified live onsite appearances (`isOnsite`).
- [x] **3/2 CTA Hierarchy in Brand Color**:
  - Onsite gig (2 CTAs): Secondary outline `Dispute` + primary `Release ₦120,000` in solid brand purple (`var(--color-purple)`).
  - Online gig (3 CTAs): Secondary `Request Revision` in neutral fill + tertiary outline `Dispute` + primary `Release ₦120,000` in solid brand purple (`var(--color-purple)`).
  - Release Payment modal confirm button updated to solid brand purple.
- [x] **Clean Minimal Header Title**: Removed crowded badges (`[ORD-001]`, `[Phase 3: Review]`, `· 🔒 ₦120,000 in escrow · 📍 Onsite`) from navbar; formatted clean 2-line title and counterparty subtitle.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` (1.4MB).
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors), build clean.

### Session 96 — Order Room UX Refinement: Single-Box 4-Digit Verification, "Verify" CTA, Streamlined Auto-Presence Banner, Responsive Order Details Phases, and Client-Only Handshake Code
- [x] **Verify Live Appearance Modal Streamlined**:
  - Replaced inner venue location and arrival time cards with a single presence auto-verification chip: `"Presence auto-verified: Your venue location and arrival timestamp are automatically recorded for proof of attendance."`
  - Replaced split/multi-digit inputs with a single 4-digit input box with `maxLength={4}`, `inputMode="numeric"`, `placeholder="••••"`, monospace styling, and centered letter tracking.
  - Set primary modal CTA button strictly to `"Verify"`.
- [x] **Order Details Modal Overhaul**:
  - Redesigned Project Phases into responsive, standalone cards with phase number/checkmark pill, clear phase title, status chip (`Completed`, `In Progress` / countdown, `Upcoming`), and concise descriptions.
  - Consolidated redundant budget rows into an uncluttered Payment Summary block.
  - **Handshake Security Gate:** Gated arrival handshake code to `{isOnsite && role === "client" && ...}`, ensuring the performer never sees the code in their details view.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` (1.4MB).
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors), build clean.

### Session 92 — Onsite Live Gig Evidence Guardrail, Dual Deliverables Modal (Online vs. Onsite), Check-In & PIN Handshake Proof, and 48-Hour Inspection Auto-Release Timer
- [x] **Dual Deliverables Submission Modal**: Introduced segmented tabs for `Online Digital Files` (with drag & drop and staged file card) and `Onsite Live Appearance` proof.
- [x] **Onsite Live Appearance Verification**:
  - Live GPS coordinates chip (`6.5244° N, 3.3792° E · Lagos`) and arrival timestamp badge (`7:52 PM, Today`).
  - **Check-in & Check-out Method (Recommended):** GPS verified presence, arrival badge, interactive check-out toggle, and stage photo attachment option.
  - **PIN Handshake Method (High-Value):** 4-digit code display (`[ 4 ] [ 8 ] [ 2 ] [ 1 ]`) for client contact entry on site.
- [x] **Onsite Appearance Certificate in Chat**: Inserts a rich verified live performance certificate into the message thread upon submission.
- [x] **Live 48-Hour Inspection Auto-Release Countdown Timer**:
  - Activated during `Review` phase with live ticking countdown (`⏱ 47h 58m 20s`).
  - Automatically transfers escrow funds to performer upon timer expiry if uncontested.
  - Client actions to approve & release early, request revisions, or raise dispute.
  - Fast-forward button for instant demo evaluation.
- [x] **Client Revision Workflow**: Modal for client to submit adjustment notes, automatically pausing review timer and returning phase to Deliverables.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` (1.42MB).
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors), build clean.

### Session 91 — Order Room Visual Simplification, Executive Dark Chat Bubbles, Phase Milestones Stepper, and Interactive Submit Deliverable Modal Overhaul
- [x] **Executive Chat Bubbles & Calm Contrast**: Replaced eye-straining solid red sender bubbles with modern executive obsidian (`#18181B`) bubbles with clean white typography and soft shadows; client bubbles rendered as crisp elevated surface cards with subtle borders.
- [x] **Header Navigation & Discreet Role Simulator**: Cleaned header into a sleek white navbar with project title, `ORD-001` badge, and escrow status; removed the clunky full-width "Simulate Role" banner and placed a compact segmented toggle in the header.
- [x] **Phase Milestones Stepper**: Added a clean 4-step progress bar (`Briefing` → `Deliverables` → `Review` → `Complete`) providing immediate visual lifecycle status.
- [x] **Upgraded Deliverables Action Dock**: Replaced the alarming pink card with a clean white deliverable status card and primary action button.
- [x] **Interactive Submit Deliverable Modal**: Built a modern modal with drag & drop file dropzone, hidden real file input, rich File Preview Card, submission notes textarea, and 100% escrow reassurance note. Submitting smoothly advances order phase to Review.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` (1.40MB) with inlined bundle.
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors), build clean.

### Session 90 — Dedicated Fresh Page for Project Details, Clean Editorial Hierarchy, Search Filter Modal with Sliders & Clickable Craft Pills
- [x] **Fresh Page for Project Details**: Replaced popup modal dialog with an uncluttered, full-page editorial view when clicking into any project from discovery or applications.
- [x] **Editorial Content Hierarchy**: Removed tacky "Client Favorite" gradient card, colored icon badges, and AI slop. Structured clean sections for Creative Brief & Synopsis, Role Requirements with craft pills, Audition Sides with monospace box and 1-click "Copy Script", Deliverables & Schedule, and quiet Casting Client & Escrow verification.
- [x] **Sticky Action Sidebar**: Kept a focused right-hand action column with prominent fixed escrow rate, capacity meter, status-driven action center (pitch withdrawal, order room entry, or pitch submission), and 100% escrow protection guarantee.
- [x] **Clean Search Bar (Tags Stripped)**: Removed the category tag pill strip directly under the search bar to prevent visual noise.
- [x] **Project Filter Modal**:
  - Replaced inline accordion with a dedicated modal triggered by the `Filters` button with an active filter badge.
  - Interactive clickable pills for craft categories (`All Roles`, `Voice-Over`, `Actor`, `Model`, `Presenter / Host`, `Comedian`, `Musician`).
  - Budget range slider with live feedback (`₦0` to `₦600,000+` in `₦25,000` steps).
  - Client rating slider with live feedback (`0.0 ★` to `5.0 ★` in `0.1` steps).
  - Location and Status clickable chips with "Reset All" and "Show {N} Projects" actions.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` with new inlined production bundle (1.39MB).
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors), build clean.

### Session 89 — Airbnb-Style Fast Category Pills, Multi-Status Action Center Polish, Enriched 6-Craft Mock Projects Catalog, and Reactive Pitch State
- [x] **Airbnb-Style Category Quick Pills Strip**: Introduced horizontal category filter pill carousel (`All Roles`, `Voice-Over`, `Actor`, `Model`, `Presenter / Host`, `Comedian`, `Musician`) right below search and filter bar for instant 1-click filtering.
- [x] **Refined Multi-Status Action Center**:
  - `SELECTED`: Emerald celebration banner + primary CTA `Open Order Room` navigating to `/order/ORD-001`.
  - `SHORTLISTED`: Shortlist badge + informative review notice + `Withdraw Pitch` button.
  - `APPLIED`: Application badge + pitch quote + `Withdraw Pitch` button.
  - `REJECTED`: Empathetic non-blocking status guidance.
  - `WITHDRAWN`: Clean withdrawn state notice.
  - Immediate reactive state update on pitch withdrawal without needing to exit or reopen modal.
- [x] **Enriched 6-Craft Mock Projects & Applications**: Populated mock catalog with `P-006` (Radio Drama VO, REJECTED), `P-007` (Fashion Week Model, SELECTED via `myapp-4`), `P-008` (Afrobeats Jingle Musician), and `P-009` (Corporate Gala Comedian), guaranteeing every category, location, and status dimension has live preview records.
- [x] **Seamless "My Applications" Inspection Merge**: Merged catalog project briefs with individual performer applications, ensuring complete creative briefs, sides, and deliverables render when clicking any application card.
- [x] **Standalone HTML Distribution Updated**: Rebuilt `monologg/monologg-app.html` and `monologg/monologg-design-system.html` with all new features.
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors).

### Session 88 — Standalone Single-File Distribution Regeneration (monologg-app.html & monologg-design-system.html) to Latest Production Build
- [x] **Production Bundle Rebuild**: Executed `npm run build:standalone` and `npm run build:designsystem` generating updated JS and CSS artifacts incorporating all Sessions 1–87 enhancements.
- [x] **Inlined HTML Regeneration**: Regenerated self-contained `monologg/monologg-app.html` (1.36MB) and `monologg/monologg-design-system.html` (320.4KB) with embedded script and styles, completely eliminating dependencies on dev servers or local asset servers.
- [x] **Feature Completeness in Standalone**: Double-clicking `monologg-app.html` now opens the complete, latest experience (5-dimension filter bar, Airbnb project detail view with Client Favorite banner and brief quick scan strip, availability calendar with right-click actions and Monologg LogoMark icons, video player modal, and profile completion gate).
- [x] **Verification**: All 24 test files passing (97/97 tests), monorepo typecheck clean (0 errors).

### Session 87 — Inline 5-Dimension Filter Bar Beside Search, Airbnb-Style Project Detail View with Fast Brief Tabs & Sticky Floating Action Card, and Unified Applications Inspection
- [x] **Inline 5-Dimension Project Filter Bar**: Replaced separate stacked dropdown selectors with an inline `Filters` toggle button (`h-10`, `rounded-xl`, badge counter) positioned directly beside the search bar. Expandable filter panel supports Category (6 roles), Budget Range (Under ₦100k, ₦100k–₦300k, Over ₦300k), Status (Open, Applied, Closed), Location (Lagos, Abuja, Remote), and Rating (4.8+ ★, 4.5+ ★, 4.0+ ★), accompanied by active filter chips and clear-all action.
- [x] **Enriched Project Brief Types & Mock Data**: Extended `ProjectSchema` with `location`, `clientRating`, `clientReviews`, `description`, `timeline`, `deliverables`, `scriptSample`, `additionalNotes`, and `escrowProtected`. Populated full realistic creative briefs across Nike VO, Nollywood Feature Film, Fintech Explainer, and Tech Summit Compere mock entries.
- [x] **Airbnb-Style Project Detail View**: Redesigned project modal into a spacious `max-w-5xl rounded-[28px]` two-column experience with static sticky header (client name, verified badge, `★ 4.9`, location, title), left fast-nav tabs (`Overview`, `Requirements`, `Script & Assets`, `Client & Escrow`), screenplay sides display in monospace screenplay card, and escrow guarantee breakdown.
- [x] **Sticky Floating Reservation & Dynamic Action Card**: Built right-column floating card with budget display (`₦200,000 Fixed Escrow Rate`), applicant capacity meter, escrow protection seal, and dynamic status-dependent CTAs (Already Applied with pitch quote & withdraw, Applications Closed, Profile Completion Gate checklist, or Ready to Apply audition pitch form).
- [x] **Unified My Applications Inspection**: Hooked My Applications cards to launch the identical rich Airbnb project view, allowing performers to effortlessly scan complete client briefs and check their submission status in one cohesive interface.
- [x] **Airbnb Visual Hierarchy Polish**: Added "Client Favorite" trust and social proof banner with rating and completed hires, "Brief at a Glance" 3-item icon strip (Craft & Role Fit, Production Window, 100% Escrow), one-click "Copy Sides" script action, and transparent "Compensation & Payout Breakdown" in the right floating card.
- [x] **Verification**: Zero TypeScript errors across all workspace packages (`packages/types`, `apps/api`, `apps/web`); 100% test pass (24/24 files, 97/97 tests).

### Session 86 — Public Profile 2-Card & 5XL Width Parity, Availability Page Double-Header/Calendar Cleanup with Right-Click Context Menu & Monologg Event Icon, Projects Search Bar Consistency
- [x] **Public Storefront 2-Card Cap**: Removed third rate card from `mocks/publicStorefront.ts`, capping rate cards strictly to 2 (`Feature Film Audition` ₦120,000, `Commercial Voice-Over` ₦45,000).
- [x] **Public Profile Width Parity**: Replaced `max-w-2xl` container in `PublicStorefront.tsx` with `max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8` matching creator profile structure and eliminating narrow "tab view" styling.
- [x] **Availability Double-Header & Double-Calendar Cleanup**: Eliminated duplicate `Availability` heading and redundant notification bell inside tab view; eliminated redundant 14-day rolling date strip and redundant date picker input.
- [x] **Calendar Right-Click Context Menu & Left-Click Inspection**: Left-clicking selects date and loads that day's schedule below the calendar; right-clicking (`onContextMenu`) launches custom floating menu with actions: "Mark as Available", "Mark as Unavailable", "Add Custom Slot", "Add Event".
- [x] **Calendar Visual State Distinction**: Unavailable days styled with grey canvas background, dashed borders, and `UNAVAILABLE` tag; open days remain clean with neutral styling and no dots/colors; Monologg bookings prominently display the official `LogoMark` crimson icon.
- [x] **Projects & Activity Search Bar Sizing Consistency**: Standardized Projects tab search input and dropdown selects to matching `h-10` (40px) height with `rounded-xl` and surface background, adding an interactive clear search (`X`) button.
- [x] **Verification**: All 24 web test files (97/97 tests) and all 56 API test files (580/580 tests) pass 100%; zero TypeScript errors across all workspace projects.

### Session 85 — Upload Modal Polish, 2-Card CTA Cleanup, Video Player Modal, Rate Card Redesign & Public Profile Parity
- [x] **Upload Modal Copy & Chip Polish**: Streamlined copy ("Upload a video showcase of your craft", "Click or drag video reel here", "MP4 or QuickTime · Max 90s · Up to 150MB"), removed redundant "Choose Video File" chip, and cleaned checklist.
- [x] **Rate Cards 2-Card Button Removal**: Header button beside the notification bell shows "Add Rate Card" only when 1 card exists, and is completely hidden once 2 cards are created.
- [x] **Reduced-Height Featured Reel**: Reduced height from tall aspect ratio to a sleek widescreen preview container (`h-48 sm:h-56 md:h-60`).
- [x] **Custom Video Player Modal (`WatchPerformanceReelModal.tsx`)**: Standalone modal playing performance reel with custom controls: Play/Pause, scrubber with time position (`00:18 / 01:30`), volume toggle, replay, fullscreen, and "Replace Reel" action button.
- [x] **Rate Cards Card Redesign on Profile**: Retitled section to "Rate Cards", removed Edit and Book buttons, placed an edit icon button in the top-right where the price was, and positioned the base rate price cleanly at the bottom.
- [x] **Public Storefront Profile Parity**: Redesigned `PublicStorefront.tsx` with cover banner, badges, social presence, bio, reduced-height reel with `WatchPerformanceReelModal`, and prominent "Book Now" CTA on rate cards.
- [x] **Verification**: All 24 test files passing, 97/97 tests passing (100% green), 0 TypeScript errors.

### Session 84 — Creator Profile Overhaul: Application Gate, In-Page Editing, Rate Cards Cap, Socials, Cover Banner & Performance Reel Modal
- [x] **Profile Completion Application Gate**: Creators must complete their Bio (>10 chars), Location, at least 1 Rate Card, and Featured Performance Reel before applying to projects. Gated modal with live 4-point checklist and direct link to profile.
- [x] **De-clutter Profile**: Removed Media Kit and Verification Video sections from the creator profile storefront tab.
- [x] **Rate Cards Limit & Adaptive CTA**: Enforced max 2 rate cards across onboarding and profile. Rate cards header CTA hidden for new users (0 cards), displays "Add Rate Card" once 1 card exists, and disables when 2 cards exist.
- [x] **In-Page Profile Editing**: Direct on-page editing mode on My Profile updating Bio, Stage Title, Location, Availability toggle, Tags, and Socials, syncing immediately with `Settings.tsx`.
- [x] **Social Media Presence**: Sleek Linktree/Upwork-style icon row supporting Instagram, YouTube, X, TikTok, Spotify, LinkedIn, and Website with custom handles and URLs.
- [x] **Customizable Cover Banner**: Replaced static header with customizable banner supporting user image uploads (JPG/PNG/WebP) and 4 curated studio gradient presets.
- [x] **Standalone "Upload Performance Reel" Modal**: Modal titled "Upload Performance Reel" with framing checklist and 150MB file size limit, omitting the verification block.
- [x] **Verification**: 24/24 test files passing, 97/97 tests passing (100% green).

### Session 82 — Onboarding Stepper Step 1 Restructuring, Clean Location/DOB & Auth Role Copy Streamlining
- [x] **Step 1: Personal Details Dedicated**: Separated personal details into the first onboarding step (`CreatorOnboarding.tsx`) matching design typography ("Tell us about yourself" / "Enter your basic details to personalize your profile.").
- [x] **Strict Binary Gender**: Restricted gender options strictly to `Female` and `Male` in a high-contrast 2-button grid.
- [x] **Date of Birth Calendar**: Provided interactive calendar input and popover while completely removing redundant age badge and age calculation display.
- [x] **Clean Location Dropdown**: Stripped away `NIGERIA`, `Verified Hub`, `Popular Entertainment Hubs` titles, and `Select` badges. Titled field `Location`, placeholder `Search location...`, rendering clean city names (`Ikeja`, `Lekki`, `Abuja`, etc.) while intelligently filtering across states as the user types.
- [x] **Step 2: Craft Selection**: Dedicated step for craft selection ("What best describes your craft?" / "Select your primary craft to personalize your profile.") with the 6 core categories.
- [x] **Auth Role Copy Streamlining**: Updated role switcher buttons and pills in `AuthFlow.tsx` to strictly `Performer` and `Client` (no slashes, no alternate titles).
- [x] **Test Alignment**: Updated `CreatorOnboarding.test.tsx` helper to traverse both Step 1 and Step 2 before testing Step 3 reel upload.
- [x] **Verification**: Web typecheck clean (0 errors); all 24 test files and 97 tests passing (100%).

### Session 81 — Performer Onboarding Overhaul & Storefront-to-Profile Modernization
- [x] **6 Craft Categories**: Replaced 8 niches in `CreatorOnboarding.tsx` with the 6 core categories from design (Actors, Public speakers, Comperes, Comedians, Artists, Creators).
- [x] **Performer Personal Essentials**: Added gender selector (`Female`, `Male`, `Non-Binary`, `Prefer not to say`), interactive date-of-birth mini-calendar picker with dynamic age calculation, and Nigerian location picker with auto-suggest for 28+ entertainment hubs.
- [x] **Strict Anti-AI Policy**: Implemented anti-AI warning banner on reel upload screen prohibiting AI-generated/cloned content and duplicated work with account ban warning and certification checkbox.
- [x] **AI Summary & Deletable Tag Suggestions**: Added editable Thespian AI performance summary in rich textarea with refine/reset controls, direct tag removal (`X`), and individual deletion of unwanted suggested tags.
- [x] **Rate Card Overhaul (Alpha Limit: 2)**: Added "Set your rate cards" header, `{count}/2 Rate Cards` limit badge, service description with "Refine with Thespian AI", Naira-only (`₦ NGN`) base pricing, delivery timeline, and `"Preview My Profile"` CTA.
- [x] **Storefront-to-Profile Nomenclature**: Replaced all user-visible "storefront" terminology with "profile" across `TalentDashboard.tsx`, `ClientDashboard.tsx`, `LandingPage.tsx`, and `Settings.tsx`.
- [x] **Verification**: Monorepo typecheck 0 errors; Vitest suite passing 100% (24/24 files, 97/97 tests).

### Session 80 — Platform-Wide Copy Standardization: Talent to Performer
- [x] **Client Platform Copy Updates**: Replaced all user-visible "talent" copy with "performer" across `ClientDashboard.tsx`, `ClientOnboarding.tsx`, and `ProjectBrief.tsx` (`Find Performers` tabs, `Performers Hired` metrics, `Performer Acquisition Funnel`, `Shortlisted Performers`, `Filter Performers by Physical Features`, `Performer Requirements`).
- [x] **Performer Platform Copy Updates**: Updated portal labels, headlines, action banners, and empty states across `TalentDashboard.tsx`, `OrderRoom.tsx`, `Checkout.tsx`, `AuthFlow.tsx`, `Settings.tsx`, `HelpSupport.tsx`, `SetPassword.tsx`, `ExternalBookingEntry.tsx`, `PublicStorefront.tsx`, `MediaKitManagement.tsx`, and `DesignSystem.tsx` (`Performer Portal`, `New Creative Performer`, `Complete your Performer Setup`, counterpart labels `Performer`).
- [x] **Test Suite Synchronization**: Updated test fixtures and assertions across `ClientDashboard.test.tsx`, `ProjectBrief.test.tsx`, `AuthFlow.test.tsx`, `HelpSupport.test.tsx`, and `authFlowStress.test.tsx` ensuring 100% test pass.
- [x] **Verification**: Zero TypeScript errors (`npx pnpm -r typecheck`), web tests passing (24/24 files, 97/97 tests), API tests passing (56/56 files, 580/580 tests).

### Session 72 — Universal Select Dropdown Chevron, Inset Padding & Form Input Height Standardization
- [x] **Global Select Dropdown Styling**: Added universal CSS rule in `tokens.css` forcing `appearance: none`, custom vector SVG chevron down icon, `background-position: right 0.875rem center` (14px inset), and `padding-right: 2.75rem`.
- [x] **Form Input & Select Height Standardization**: Standardized `<select>` dropdown heights across form modals and pages (`Withdrawal Authorization`, `Recurring Availability`, `Add Service`, `Settings`, `Project Brief`, `Client Dashboard`) to match `<Input>` height `54px` (`h-[54px] rounded-[var(--radius-lg)] px-4 text-base`).
- [x] **Input Overlay Alignment**: Updated inline currency dropdown select positioning (`right-3.5 pl-2.5 pr-8`) and date picker input calendar icon (`right-3 pr-9`) in `TalentDashboard.tsx` and `CreatorOnboarding.tsx`.
- [x] **Verification**: Ran `npx pnpm -r typecheck` (0 errors) and Vitest suite (24 test files, 97/97 tests passed 100%).

### Session 71 — Talent Availability Page UI Overhaul based on Inspiration Screenshots
- [x] **Header & Navigation Toolbar**: Built top header bar with `< Prev >`, `Today`, `< Next >` navigation controls, Month/Year title, 3-view switcher (`Month | Week | Day`), and date picker input with calendar icon (`Calendar`).
- [x] **14-Day Rolling Date Selector**: Implemented horizontal date pill strip (`Wed, Aug 19`, `Thu, Aug 20`, `Fri, Aug 21 (Active Red)`...) with active solid Mono-Red accent styling and scrollable container.
- [x] **Enhanced Month View Grid**: Built 7-day grid with day numbers, dot indicators, event previews, and active solid red date pill selection.
- [x] **7-Day Week View Grid**: Implemented 7-column time-grid layout (Monday – Sunday), 8:00 AM – 8:00 PM time axis, red horizontal current time line with live time pill (`11:30`), colored event blocks placed in grid cells, and click-to-view/add popovers (matching Image 3 inspiration).
- [x] **1-Day Day View Grid**: Implemented single-column time-grid layout with hourly rows, red current time line, full-width event cards, and event detail popovers (matching Image 4 inspiration).
- [x] **Interactive Modals & Popovers**: Built `actionPopover` modal ("Mark as Available", "Mark as Unavailable", "Add Event") and `selectedEventModal` detail modal (Title, Date, Time, Venue, Description, Delete `Trash2` action) matching Images 2 & 4 inspiration.
- [x] **Dedicated Stress Test Suite**: Built `TalentDashboardAvailability.test.tsx` verifying Month view, 7-column Week view, 1-column Day view, period navigation controls, date cell popover actions, explicit slot creation/deletion, personal event creation/deletion, recurring availability form, and Google Calendar sync modal.
- [x] **Verification**: Ran `npx pnpm -r typecheck` (0 errors) and Vitest suite (24 test files, 97/97 tests passed 100%).

### Session 69 — Comprehensive Non-Technical Tools & Integrations Handoff Guide
- [x] **Non-Technical Tools Guide (`tools.md`)**: Authored `monologg/handoff/tools.md` explaining all 22+ tools, third-party integrations, services, APIs, setup steps, introduced phases, and architectural importance using real-world analogies (hotel architecture).
- [x] **Environment Variables Master Reference**: Created complete production environment variable setup reference table in `tools.md`.
- [x] **Handoff Index Update**: Updated `monologg/handoff/README.md` to integrate `tools.md` into the index, reading order, and document maintenance rules.

### Session 68 — Google OAuth Architecture Review, End-to-End Stress Testing & Navigation Verification
- [x] **End-to-End Stress Test Suite**: Built `apps/web/src/app/pages/authFlowStress.test.tsx` verifying Google signup/login metadata extraction, onboarding stepper routing vs direct dashboard routing, profile state sync, and persistent-session logo navigation.
- [x] **Backend Sync Verification**: Confirmed `POST /api/v1/auth/session/sync` persistence on `User`, `Creator`, and `Client` Prisma models with `AuthEvent` logging.
- [x] **Verification**: Workspace typecheck (`0 errors`), web tests (`22/22 files, 86/86 tests passed`), and API tests (`56/56 files, 579/579 tests passed`).

### Session 67 — bg.svg Background Pattern & Hover-to-Reveal Spotlight Integration
- [x] **Asset Deployment**: Deployed `/bg.svg` vector pattern asset into `apps/web/public/bg.svg`.
- [x] **Interactive Canvas Upgrade**: Configured `WebGLHeroCanvas.tsx` to tile `/bg.svg` canvas pattern with ambient scroll pulse + mouse hover spotlight reveal.
- [x] **Page Integration**: Applied `<WebGLHeroCanvas>` to Hero, Escrow Calculator, Final CTA, and Footer sections on `LandingPage.tsx` and `AuthFlow.tsx`.
- [x] **Verification**: Ran `npx pnpm -r typecheck` (0 errors) and web unit test suite (`21/21 files, 82/82 tests passed`).

### Session 66 — Google Auth Identity Sync, Avatar Display, Logo Navigation & Hand-Off Updates
- [x] **Google OAuth Profile Sync**: Synced Google user photo `avatarUrl` and full name across `LoggedInUserSession`, `state-sync.ts`, and `api-client.ts`.
- [x] **Sidebar Avatar Display**: Rendered Google avatar photo in `<Avatar src={identity.avatarUrl}>` with initials fallback in `Sidebar.tsx`, `ClientDashboard.tsx`, and `TalentDashboard.tsx`.
- [x] **Persistent-Session Logo Navigation**: Ensured clicking the Monologg logo navigates to `/` (Landing Page) while preserving active logged-in user session state.
- [x] **Sign Out Behavior**: Verified Sign Out clears session state via `apiClient.logout()` and redirects to `/` in logged-out mode.
- [x] **Verification**: Ran `npx pnpm -r typecheck` (0 errors) and web unit test suite (`21/21 files, 82/82 tests passed`).

### Session 65 — GitHub Repository Front Page & Vercel Deployment Configuration Cleanup
- [x] **Root README**: Created comprehensive root `README.md` for GitHub repository landing page display.
- [x] **Automated Vercel Deployment**: Created root `vercel.json` and `package.json` pointing Vercel directly to `@monologg/web` build output.
- [x] **Workspace Cleanup**: Deleted redundant root `Vector map.svg` asset and moved design documents into `monologg/reference-docs/`.

### Session 64 — Account Activity Log Service & Repository Status Check
- [x] **Activity Service**: Created `monologg/apps/api/src/services/activity.ts` defining `ActivityAction` union type and best-effort `logActivity` helper for `UserActivity` database model.
- [x] **Verification**: Executed workspace typecheck (`npx pnpm -r typecheck`) across `packages/types`, `apps/api`, and `apps/web` passing 100% clean.
- [x] **Handoff Sync**: Synced Sessions 61–64 details across all 5 handoff living documents.

### Session 63 — Signed-in Header Menu, Google OAuth Avatars & Onboarding Routing
- [x] **Signed-in Landing Header**: Rendered signed-in avatar/initials dropdown with 4 role-aware navigation shortcuts (Dashboard, Media Kit/Post a Project, Transactions, Settings) and Sign Out.
- [x] **Sign Out Fix**: Fixed `apiClient.logout()` to clear local state sync and fixed Sidebar Sign Out button to invoke full logout path.
- [x] **Google Avatar Persistence**: Added `avatarUrl` field to Creator/Client schema, migrated database, and synced Google OAuth avatar photos across session sync and settings.
- [x] **Onboarding Routing**: Routed new OAuth/OTP users to onboarding steppers (`/onboarding` / `/onboarding/client`) while sending returning accounts directly to dashboard.

### Session 62 — AuthFlow UI Redundancy Cleanup & Real Google OAuth
- [x] **Auth UI Streamlining**: Cleaned up redundant mode toggle buttons on registration screen.
- [x] **Real Google OAuth**: Integrated `supabase.auth.signInWithOAuth` flow replacing simulated modal.

### Session 61 — Deep Unused Asset Tree Relocation
- [x] **Path Length Cleanup**: Deleted unreferenced `monologg/brand/mono fonts/` tree and relocated `apps/web/src/imports/reference-screenshots/` to `monologg/reference-screenshots/`.

### Session 60 — Manual Currency Input, Auto-Expanding Sliders & Currency Conversion
- [x] **Shared Currency Utility**: Created unified `currency.ts` helper with stable exchange rates, currency conversion methods, and added rotating `getRandomLimitError` warnings for overlarge amounts.
- [x] **Limit Warning Modals**: Added validation modals to the Escrow Calculator (`LandingPage.tsx`) and Project Brief Stepper (`ProjectBrief.tsx`) budget inputs, triggering when values exceed `999,999,999,999,999` in any currency.
- [x] **Escrow Calculator**: Refactored `LandingPage.tsx` to shift manual input to the top contract total display, keep slider values read-only, and dynamically scale slider max limits.
- [x] **Mobile Responsiveness Polish**: Scaled stats columns, stacked email forms on mobile (<480px), shortened card header titles and CTA text, and scaled carousel talent cards down dynamically to prevent clipping.
- [x] **Project Brief Stepper**: Added manual text input, auto-expanding range slider, dynamic presets matching selected currency, and currency conversion. Fixed bug where non-Naira brief budget was posted with incorrect values.
- [x] **Creator Onboarding & Talent Dashboard**: Updated base price input form to automatically convert rate card values when selecting a new currency.
- [x] **Verification**: Web typecheck (`tsc --noEmit`) and Vitest test suite (21 test files, 78 tests passing 100%) passed successfully.

### Session 59 — Interactive Multi-Currency Dropdown Selector & Multi-Currency Input Support
- [x] **Escrow Calculator Multi-Currency Selector**: Built an interactive currency dropdown supporting `NGN`, `USD`, `GBP`, `EUR`, `GHS`, `KES`, and `ZAR` with flag icons and automatic price re-calculation.
- [x] **Project Brief Multi-Currency Buttons**: Added multi-currency pill selection row to `ProjectBrief.tsx` Step 4 budget view.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.11s) verified clean.

### Session 58 — Focused Active Node & Inactive Flag Beacons Map UX
- [x] **Clutter-Free Map UX Overhaul**: Rendered active focus node as a bold Mono-Red pill card (`bg-[#F13030]`) with animated radar pulse, while rendering inactive nodes as sleek 32px circular flag beacon pins with `opacity-60` and hover tooltips.
- [x] **Eliminated Badge Overlap**: Completely solved card overlap across West/East Africa (Lagos, Accra, Nairobi).
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.11s) verified clean.

### Session 57 — High-Resolution Dot-Matrix Vector Map Asset Integration
- [x] **Dot-Matrix Vector Map Asset Integration**: Copied high-resolution `Vector map.svg` asset into `monologg/apps/web/public/vector-map.svg`.
- [x] **VectorWorldMap Component Overhaul**: Rendered `/vector-map.svg` dot matrix world map with dark mode inverted styling matching Inspiration Image 2.
- [x] **Precise Location Pin Coordinates**: Calibrated geographic location pin coordinates for Lagos, Accra, Nairobi, Johannesburg, London, and New York.
- [x] **Verification**: Web typecheck (`tsc --noEmit`), Vitest test suite (21 test files, 78 tests passing 100%), and Vite production build (`dist/assets` compiled in 2.08s) verified clean.

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
