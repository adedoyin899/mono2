

## PROGRESS LOG (Nov 2026 sync, branch claude/awesome-hamilton-zqpi6c)
Figma file y9YmAGxvpo4LUybwCU2FbE. Pages: "🎭 Performer Journey — v2 (Nov 2026)" (215:2), "💼 Client Journey — v2 (Nov 2026)" (215:3). v1 pages renamed "… — v1 (Sep)".
Pipeline (all in this folder): `capture.mjs <out> screens/<file>.mjs [regex]` -> JSON (+png, images/, meta.json) -> bundle payload JSONs into ONE svg
(`<text>key§json</text>` each) -> `upload_assets` (1 URL) + curl POST -> `use_figma`: eval `mlg/renderer` (v9) + `mlg/v2lib`, `V2.load(payloadNodeId)`, `V2.run({...})`.
Keep each use_figma call small (60s limit): ~1-3 screens per call. Delete `mlg-payload-*` nodes when done. Image map in `mlg/images` (url->hash).
Renderer v9: colours bound to Color variables by (light,dark) pair; alpha lives in the variable (bound paints ignore paint opacity).
Done: 01 Marketing & entry (60 states, needs re-capture+re-render for inline-text split fix), 02 Auth (6), 03 Onboarding (14), 04 Home (9).
Known gaps: onboarding calendar-error state unreachable in app (dead code); black wordmark SVG logo is invisible in dark mode (graphics are not variable-bound);
section 01 is long (60 states) — consider splitting per page; checkbox check mark is a plain square.
TODO: Performer 05-16 (profile, rate cards, availability, projects, orders, earnings, analytics, media kit, public profile, settings, transactions, legal) then Client journey; Sidebar/BottomNav v2 components; prototype links; audits.


## PROGRESS UPDATE — Performer journey complete (first pass)
Performer v2 page sections 01-16 are rendered (see screens/*.mjs for capture scripts; one screens file per area).
Sections: 01 Marketing, 02 Auth, 03 Onboarding, 04 Home, 05 My Profile, 06 Rate cards, 07 Availability, 08 Projects, 09 Orders & order room,
10 Earnings, 11 Analytics, 12 Media kit & verification, 13 Public profile, 14 Settings, 15 Transactions & support, 16 Legal.
TODO polish (performer): re-capture + re-render 01 and 02 (captured before inline-text/checkbox serializer fix); fix `proj-detail-open` script
(click matched the check-in card text, use getByRole('button', {name:/^Fintech Explainer/})); desktop project detail pages scroll inside an inner container
so only the first 972px is captured; wordmark logo SVG invisible in dark mode (graphics are not variable-bound).
App findings (not fixed): Settings "View public profile" navigates to /storefront/emeka which 404s (real route is /:handle, e.g. /adaeze-obi);
/legal/privacy renders the Cookie Policy (LegalPage only distinguishes terms vs else); onboarding calendar "error" state is unreachable (dead code);
analytics has no 3m/1y range control and project detail has no Overview/Requirements/Sides/Escrow tabs in this build (checklist from the earlier audit was out of date).
NEXT: Client journey (page 215:3): marketing toggles/menu, auth (client), onboarding 2 steps, home (wallet + fund modal), find performers, my projects, brief 5 steps,
checkout, order room (client), shortlist, analytics, guest booking /book/:id, settings, transactions, legal. Then Sidebar/BottomNav v2 components + prototype links.


## PROGRESS UPDATE — Client journey first pass (page 215:3)
Rendered sections 01-14 (79 states): marketing (signed-in landing + account menus), auth, onboarding (2 steps), home (+fund wallet), find performers, my projects (list + one detail),
post a brief (5 steps + card funding + published), checkout (summary/review/payment/Paystack), orders & order room (client review, revision, release, complete, dispute),
shortlist, activity & analytics, guest booking (slot -> brief -> contact), settings (6 views), transactions.
Capture scripts: screens/client-a.mjs, client-brief.mjs, client-b.mjs, client-c.mjs (+ _chelpers.mjs). Names in capture output: c-*, brief-*, co-*, cor-*, book-*.
Gaps: guest booking payment/processing/confirmed/set-password and "unavailable" modal not reached (Continue stays disabled with scripted input);
checkout confirmed state not reached (Paystack modal is the last captured state); my-projects 6 lifecycle states + applicants + inline edit + publish-escrow modal not captured (only list + one detail);
find performers filters/profile view not captured; support/help + legal for client not duplicated (same pages as performer).
App note: shortlist "Book Now" opens /book/:id?role=client in a new tab (window.open) — that is the client booking path.


## PROGRESS UPDATE — gap-closing pass
Done: Performer 01/02 re-captured+re-rendered (serializer fixes), 08 rebuilt (fixed "open to apply") + project detail tabs (Roles & Requirements, Script & Materials, Client & Escrow) and apply flow;
dark-mode wordmark fixed (renderer v10 recolours `dark:invert` SVG graphics via light/dark variables; serializer records `iv`).
Client: My Projects lifecycle (applicants, filters, applicant profile, select/hire, 5 tabs, Draft/In progress/Review/Completed/Closed, publish & fund escrow), find-performers filters.
Correction: project detail DOES have tabs for open projects (the applied project hides them); only the analytics range control is absent in this build.
Page totals: Performer 222 states (16 sections), Client ~100 states (14 sections).
Still open: guest booking payment/processing/confirmed/set-password + unavailable modal; checkout confirmed; performer profile modal in client find; client support & legal (same pages as performer);
Sidebar/BottomNav v2 components, prototype links, final audit (colour-variable binding spot-checks, text-style binding via swap engine).
Operational notes: use_figma has a 60s limit (keep 1-3 screens per call); MCP connection drops periodically — re-run ToolSearch select:mcp__Figma__use_figma, then read-only check what landed before retrying.


## PROGRESS UPDATE — navigation components & prototype links
Library page (🧩 Components): section "v2 navigation — Sidebar & BottomNav" holds component sets "Sidebar v2" (Role=Performer|Client x Active) and "BottomNav v2"
(Active incl. "More"), built by cloning the real captured navs (so they match the app exactly); BottomNav items carry invisible "Button / <label>" hit areas for prototype links.
All dashboard desktop/mobile frames on both journey pages now use instances (raw `aside` / nav frames replaced). New "More sheet (mobile)" states added to both Home sections (P04.10 / C04.06).
Prototype: sidebar/bottom-nav items link to each section's first screen (Performer: ~1,800 links; Client: ~830); landing -> auth -> onboarding -> home chain (Performer), auth -> onboarding -> home and the 5-step brief chain (Client);
More-sheet items link on. Flow starting points are set on both pages. Mechanics: `node.setReactionsAsync([{trigger:{type:'ON_CLICK'}, actions:[{type:'NODE', destinationId, navigation:'NAVIGATE', transition:null, preserveScrollPosition:false}]}])`.
Not linked: order-room/checkout/guest-booking internal steps, modal open/close, settings sub-tabs.
Remaining: guest booking payment/confirmed/set-password, checkout confirmed, final audit (text-style binding via swap engine, colour-binding spot-checks, nav instance detach checks).


## FINAL AUDIT (Nov 2026)
Colour binding (sampled, instances excluded): Performer 99.5% of fills / 100% of strokes bound; Client 99.5% / 100%; all shadows bound. Dark mode verified on landing hero and a dashboard frame (nav instance, cards, text flip).
Text styles: resumable binder (`mlg/v2ts`, `V2TS.run(pageId, prefixes, budgetMs)`) bound every non-instance text: Performer 443 frames / 30,930 texts, Client 223 frames / 12,091 texts; 177 new styles under "v2 (Nov 2026)/..." (text styles total 346). Done-lists in `mlg/v2tsdone:<pageId>`.
Variables: Color collection 48 -> 429 (227 `auto/`, 122 `static/`, 37 `shadow/`) — pairs/alphas not covered by the original tokens. Consider consolidating `auto/` into named tokens later.
Components: Sidebar v2 / BottomNav v2 instances everywhere (0 raw navs); 0 missing icon/graphic placeholders.
Fixed in audit: grey fallback paints from `<select>` background-image chevrons removed (14 Client / 92 Performer nodes); select chevron icon itself is not drawn.
Known/accepted: v1 swap engine (Button/Input/Chip -> library instances) NOT run on v2 pages (frames are raw captured layers with bound variables + text styles; run `S.batch` per page if library instances are wanted);
unreached states (guest booking payment/confirmed/set-password, checkout confirmed, onboarding calendar error); modal open/close and order-room internal prototype links not wired.


## PROGRESS UPDATE — missing states closed
Client Guest booking (section 12, 19 states): slot, slot selected, performer-unavailable modal, project brief (+filled), contact & agreement (+filled), escrow payment (card), pay with Paystack,
processing payment, booking confirmed, set password. Client Checkout (section 08): + booking confirmed. Prototype: booking chain + checkout chain wired; processing auto-advances to confirmed (AFTER_TIMEOUT 1.5s);
flow starting points added for guest booking and checkout. Text styles bound on the new frames.
Capture notes: booking contact fields use placeholders "Your full name" / "you@company.com" / "+234 800 000 0000"; contact-step button is "Proceed to Payment"; pay button is "Confirm & Deposit ₦…" (card) — the "Pay with Paystack" text is the method toggle.
The processing view is on screen for microtasks only, so it is captured with a MutationObserver (screens/client-d.mjs, `p.__preD` hook in capture.mjs) and fade-in elements forced to opacity 1.
Figma auto-creates "Flow N" starting points when reactions are added — rename/delete them (done for both pages).
Still not capturable: onboarding calendar "error" state (dead code in the app), performer profile view from Find performers (click opens nothing).


## SWAP ENGINE RUN ON v2 (Nov 2026)
Ran `S.batch(<page name>)` (mlg/dsswap) on both v2 pages. Swapped to library instances: Performer — Icon Button 672, Button 356, Input 40; Client — Button 418, Icon Button 294, Input 86, Chip 2 (~1,870 layers).
Skipped/rolled back (originals left untouched): geom:Input 24, geom:Button 19, err "set_strokeWeight: Cannot unwrap symbol" 56. Most other candidates are not classified because their fills use the app's exact colour pairs
(`auto/…` / `static/…` variables) rather than the library's older named tokens, so the engine's name-based classifier does not recognise them (≈84% of button-like layers remain raw layers with bound variables + text styles).
Engine patched (backup in `mlg/dsswap_v1backup`): swapped instances now inherit the original layer's prototype reactions (marker `/*v2-reactions*/`). Spot checks: reactions preserved, none broken; light/dark verified on Rate cards (Performer) and Find performers (Client).
Fixed along the way: sidebar items had a 2px left border drawn from `border-l-2 border-transparent` that the renderer turned into opaque black — removed from Sidebar v2 variants (98) and frames (4); serializer now ignores transparent borders (ser.js).


## COLOUR VARIABLE CONSOLIDATION (Nov 2026)
Analysis: of 351 renderer-generated `auto/`+`static/` colour variables only 21 pairs match an app token (tokens.css) within rounding (<=2/255); 38 are within 6 levels; 266 are >24 levels away — the app hard-codes
many one-off hex pairs (e.g. f9f9f9|141414 vs canvas f9f9f9|000000), and the file's older named tokens (bg/surface ffffff|16161a etc.) predate the current palette.
Applied (no node re-binding, pixel-neutral): 14 variables renamed to named app tokens `v2/bg/canvas`, `v2/text/primary`, `v2/red`, ... (description cites tokens.css); 7 duplicates of those became `v2/alias/<token>/<orig>` and ALIAS the canonical variable (<=2/255 difference);
330 one-offs renamed `v2/{neutral|red|purple|blue|green|amber}/<light>_<dark>` with a description giving the nearest app token and distance; 32 renderer shadow colours renamed `v2/shadow/…`. Old->new mapping in `mlg/v2tokenmap`.
Renderer patched (backup `mlg/renderer_prenames`): newly created pair variables are named `v2/unsorted/<light>_<dark>`; no `auto/`/`static/` variables remain.
Not done on purpose: snapping the 38 near-misses (<=6 levels) or old named tokens to app tokens — that shifts visible colours (e.g. surfaces f9f9f9 -> ffffff). Decide per token, then re-bind/alias; the nearest-token note on each variable is the worklist.
The file's original v1 named tokens (bg/canvas, text/primary, ...) are untouched (v1 pages unchanged); v1 and v2 palettes now coexist (`bg/…` vs `v2/bg/…`).


## PROTOTYPE LINKS — second pass (modals, order room, settings, projects)
Rule-driven wiring (label of source frame -> clickable layer label regex -> destination frame label; matched across every scroll-stop frame, desktop + mobile; nodes inside Sidebar/BottomNav instances are skipped).
Performer: home (check-in decline modal, notifications, balance), profile (edit/share/upload), rate-card edit, projects browse -> 4 project details + filter modal, order room (orders cards -> room -> submit modals -> review -> client view -> revision / release -> complete; dispute),
earnings -> withdraw, analytics -> reviews modal, settings main -> 10 sub-views, sub-view "Back to settings" (42). Client: home, find filters, projects list -> detail, applicants filters/profile/hire, lifecycle Draft publish-escrow modal, shortlist "Book Now" -> guest booking, order-room chain, settings sub-views + back (16).
Totals (frame-descendant reactions): Performer 1,952, Client 1,034; 0 broken destinations. The processing screen's AFTER_TIMEOUT (1.5s) reaction sits on the frame itself (not counted above).
Not linkable (layers are not separate clickable nodes in the captured states): project-detail lifecycle chips and tabs on Client detail, Performer project-detail tabs, "Hide balance" icon button, Performer Share/Upload close buttons, modal dismiss on states without a labelled Cancel/Close.
Rule table code is in the session history; to extend, add [fromLabel, labelRegex, toLabel] rows and re-run (setReactionsAsync overwrites, so it is idempotent).


## COLOUR SNAP — near-misses (<=6/255) aliased to app tokens
Done as requested ("snap the near-miss colours to the app tokens"). 18 `v2/{family}/<light>_<dark>` variables whose nearest app token was <=6/255 away now ALIAS the canonical `v2/<token>` variable in both modes and are renamed `v2/alias/<token>/<orig>`; description reads "Snapped to v2/<token> (was Δn/255: light X / dark Y)".
Canonical variables created from tokens.css where missing: `v2/green`, `v2/error`, `v2/success-bg`, `v2/red-soft`, `v2/error-bg`, `v2/gold-soft`.
Examples: f9f9f9|1a1a1a -> bg/surface (visible shift f9f9f9 -> ffffff in light), 18181b|f4f4f5 -> text/primary, 71717b|9f9fa9 -> text/tertiary, e5e5e5|1a1a1a -> hairline, d81d1d|ff6c58 -> error, 1d7645|3ee08b -> green.
Reversible: originals (name, description, Light/Dark values) are stored per variable id in root plugin data `mlg/v2snap`.
Verified: Client C01.01 desktop frame rendered in Light and Dark after the snap — no broken fills, surfaces/text/buttons look right.
Left alone: 18 variables within <=12/255 and 29 within <=24/255 (shift is more visible; nearest-token note is on each variable's description). 266 are far from any app token.
Pre-existing, not caused by the snap: the Monologg wordmark (`Graphic/13nq62t`, Graphics page) has unbound hard-coded 18181b vector fills, so it is near-invisible in Dark mode. Fix = bind its vectors to `v2/text/primary` (and any other `Graphic/*` with unbound dark fills).
