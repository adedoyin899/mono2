

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
