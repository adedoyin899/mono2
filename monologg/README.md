# Monologg

A marketplace connecting performing-arts talent with clients who want to book them. This folder contains the running product, its documentation, and its brand assets.

## Start here, depending on what you need

**Just want to see the product?** Double-click **`monologg-app.html`** — opens in any browser, no setup required.

**Want to see the design system (colors, components, tokens)?** Double-click **`monologg-design-system.html`**.

**Want to run it locally and make changes?** See `app/README` below, or just:
```
cd app
npm install
npm run dev
```
Then open `http://localhost:5173`.

**Want the full story — what's built, what isn't, decisions made, bugs fixed, and what's left?** Go to **`handoff/`** and start with `handoff/README.md`.

## What's in this folder

| Item | What it is |
|---|---|
| `monologg-app.html` | The whole product, as one double-clickable file. Regenerate from `app/` after any code change (see `handoff/design.md` §7). |
| `monologg-design-system.html` | The design-system reference page, same idea — one file, no server needed. |
| `app/` | The actual source code and local dev server. This is what a developer opens to make changes. |
| `handoff/` | All project documentation: what the product is, the tech stack, a running implementation log, every bug found and fixed, and a plain-language walkthrough of how it was all built. **Read this before making changes**, and keep it updated after. |
| `brand/` | `icon.svg` (mark) and `logo.svg` (wordmark) — the real brand assets, wired into the app via `app/src/app/components/ui/Logo.tsx` everywhere the wordmark appears. |
| `ATTRIBUTIONS.md` | Required credit for third-party components (shadcn/ui) and photos (Unsplash) used in the original design. |

## The one thing everyone should know before touching anything

**There is no backend, database, or real login yet.** Everything you see running is frontend-only, with sample data built into the page code. Sign-in, payments, and AI verification are all working demos of the *interface*, not real systems. Full detail in `handoff/design.md` — and see `handoff/features.md` for the full plan to build the real thing.

## Source control

This lives in `github.com/adedoyin899/mono2`, inside this `monologg/` folder (that repo also holds an unrelated project at its root — kept separate on purpose). Push access uses a repo-scoped deploy key, not a general account key — see `handoff/design.md` §7 if you need to push and don't have it configured.

## Inside `app/`

```
app/
├── src/
│   ├── app/            the actual pages, components, and routing
│   ├── imports/        original product spec (PRD, UX spec) + historical/reference material
│   │   ├── Monologg_Beta_PRD_PDF.pdf       ← the real product requirements doc
│   │   ├── monologg_ux_spec.md             ← the real, current UX spec
│   │   ├── historical-drafts/              ← earlier/superseded drafts, kept for record only
│   │   └── reference-screenshots/          ← original Figma design screenshots, not used by the app itself
│   ├── lib/             small shared utilities (motion tokens, class-name helper)
│   └── styles/          design tokens and stylesheets — the single source of truth for colors/spacing/etc.
├── package.json          the three build commands: dev, build, build:standalone, build:designsystem
└── vite.config*.ts        build configuration (one file per build target)
```

If a file isn't listed above or in `handoff/log.md`'s file inventory, treat it as generated (inside `dist*/` folders) or as a standard tool file (`node_modules/`, lockfiles) — not something to edit by hand.
