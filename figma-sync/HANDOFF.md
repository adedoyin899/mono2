# Figma v2 sync — handoff

Continue in a session on the **mono2** environment (allows `mcp.figma.com`,
`images.unsplash.com`, `lh3.googleusercontent.com`). Prompt: *"continue the v2 Figma sync"*.

## Goal (agreed with the user)
Rebuild every current Monologg screen into Figma file `y9YmAGxvpo4LUybwCU2FbE` on two
NEW pages — **🎭 Performer Journey — v2** and **💼 Client Journey — v2** — desktop
(1440×1024, Browser Bar) beside mobile (430×932, iPhone 14 Pro Max chrome), every
screen/state, all flows updated to latest `main`.

- Keep v1 pages untouched; rename them "… — v1 (Sep)".
- Include Resources investor form. Skip `/design-system`. Dark mode not captured as frames.
- **All colours must be bound to Color variables so dark mode applies automatically.**
- Reuse the UI library (🧩 Components → "UI Library — components & states"),
  the 157 text styles, and the swap engine; same section/label layout as v1.

## Approach
1. **Capture** (Playwright, Vite mock mode `VITE_API_MODE=mock`, `npx vite --port 5173`
   in `monologg/apps/web`; Chromium at `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`;
   playwright import `monologg/node_modules/.pnpm/node_modules/playwright/index.mjs`).
   Demo login: `/auth?mode=signup` → "Quick Demo" buttons **Performer** / **Client**.
2. **Serializer** (rewrite needed — scratch copy was lost) emitting the renderer's JSON:
   `D = {vp:'d'|'m', bg, dh, sy, C:[colours], S:[styles], I:{icon:innerSvg}, G:{hash:svg}, k:[nodes]}`.
   Nodes: `t` f(frame)/x(text)/i(lucide icon)/g(svg graphic)/c(component);
   `b:[x,y,w,h]` in document coords; frame: `n,f:[ci|{l,s}|{r,s}|{im}],s:{w,c},r,e:[[inset,x,y,blur,spread,ci]],bb,lb,o,cl,z,fx,ref,k`;
   text: `tx,st|ru:[[a,b,s]],an:'c'|'r',fw,ml`; style tuple `[family,weight,size,lh,ls,ci,italic,deco('s'|'u'),case('U'|'L'|'T')]`;
   icon: `ic,c,sw,fl`. Name frames "Button / label", "Input / placeholder", "Link / …" (swap engine relies on it).
3. **Dark-mode binding**: serialize light, then add `dark` class to `<html>` and the app
   wrapper (transitions disabled), re-read the same elements' colours → each colour slot
   becomes a (light, dark) pair. Renderer binds a paint to the Color variable whose
   Light+Dark values match the pair; create missing pairs as new variables
   (`static/…` when equal in both themes). Bind shadow colours via
   `setBoundVariableForEffect`. Patch the stored renderer (`sharedPluginData mlg/renderer`) accordingly.
4. **Transport**: use `upload_assets` → POST an SVG whose `<text>` holds the JSON chunk,
   then `use_figma` reads the text node and renders (proxy blocked mcp.figma.com in the
   old environment; mono2 allows it). Fallback: inline payloads ≤38KB per call.
   Real photos: upload via `upload_assets` with `nodeIds` targeting image frames.
5. **Post-process**: bind text styles (create new ones for new combos), run the swap engine
   (`sharedPluginData mlg/dsswap`, `S.batch(pageName)`), rebuild Sidebar/BottomNav v2
   components (new items + mobile "More" sheet), nav prototype links, audits, pixel spot-checks.

## Figma state (stored in root sharedPluginData namespace `mlg`)
`renderer` (MLG renderer, v7), `dsb` (library builder), `dslib`, `dsswap` (swap engine),
`tstyles` (style key→id), `icons`, `graphics`, `comps`, `set:<Component>` ids.

## Screen checklist (each = desktop + mobile)
🆕 new · 🔄 changed · ❌ removed (not in v2)

### Performer
1. Marketing: Landing 🔄 (typewriter hero, sections), Product 🆕 (toggle, FAQ), Pricing 🆕, Resources + investor form 🆕, account menu 🔄, mobile menu 🆕. ❌ escrow calculator/currency/limit modal, roster, trust map, early access, QR.
2. Auth: welcome w/ role toggle 🔄, create account empty/filled, sign in, reset, link sent, Google error.
3. Onboarding: 8 steps 🔄 (personal details, craft, reel, AI tags, rates, calendar connect, summary) + 150MB error 🆕, calendar connected/error 🆕.
4. Home: check-in card + decline modal 🆕, checklist, balance hide, new user, notifications.
5. My Profile 🔄: in-page edit, share, upload reel 🆕, watch reel 🆕, client reviews 🆕.
6. Rate cards: list (2 cap) 🔄, new, edit, empty, cap reached.
7. Availability: month/week/day, Google sync, right-click menu 🔄, add slot/event, event, sync modal.
8. Projects: browse + pills 🔄, filter modal 🆕, detail tabs Overview/Requirements/Sides/Escrow/Application 🆕, apply, applied, closed, my applications, profile gate 🆕, no results.
9. Orders & order room: list chat/cards 🆕; phases briefing/deliverables/review/complete; online vs onsite 🆕; PIN 🆕; evidence 🆕; submit (2 modes) 🆕; revision; info; dispute; auto-release 🆕; rating 🆕.
10. Earnings: withdraw amount→passcode, live-projects warning 🆕, success, receipt 🔄.
11. Analytics 🔄 (6m/3m/1y, reputation bar), reviews modal 🆕, activity + filters/no results.
12. Media kit & verification. 13. Public profile.
14. Settings: main, profile 🔄, Personal & Craft Details 🆕, attributes, payment 🔄, notifications, security 🔄 (3-input passcode, delete account 🆕; ❌ 2FA/sessions), escrow policy 🆕, terms.
15. Transactions 🔄 (new statuses, balance card, detail) & support. 16. Legal: terms, privacy, cookies 🆕.

### Client
1. Marketing (client toggles/menu). 2. Auth (client). 3. Onboarding 2 steps 🔄 (❌ payment step).
4. Home: wallet + Fund Wallet modal (card/transfer/USSD, Paystack) 🆕.
5. Find Performers: filters, profile, shortlist, no results.
6. My Projects: drafts 🔄, detail w/ 6 lifecycle states + tabs Applicants/Overview/Requirements/Sides/Escrow 🆕, applicant filters/profile, inline edit 🆕, publish-escrow modal 🆕.
7. Post a brief: 5 steps 🔄 (details, requirements, assets 🆕, review & agreement 🆕, budget & publish), fund modal, published.
8. Checkout: service→slot→summary→review→payment→processing→confirmed.
9. Order room (client): verify PIN 🆕, review & release, revision, rating 🆕, dispute.
10. Shortlist. 11. Activity & analytics (spend graph, range 🆕), reviews modal.
12. Guest booking `/book/:id`: slot→brief→review→payment→processing→confirmed, unavailable modal 🆕, set password.
13. Settings (client) incl. delete account 🆕, escrow policy 🆕. 14. Transactions & support. 15. Legal incl. cookies 🆕.

## Tooling here
- `explore.mjs` — logs in as each role, walks every nav item (desktop + mobile), dumps headings/buttons + screenshots to `explore/`.
- `sections.mjs` — section offsets of marketing pages. `sheet.py` — contact sheets (needs Pillow).
