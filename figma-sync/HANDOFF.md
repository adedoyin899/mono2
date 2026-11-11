

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
