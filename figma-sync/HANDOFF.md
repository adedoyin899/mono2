

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
