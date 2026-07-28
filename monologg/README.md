# Monologg

A marketplace connecting performing-arts talent with clients who want to book them. This folder contains the running product, its documentation, and its brand assets — organized as a pnpm workspace as of `features.md` Phase 1.

## Start here, depending on what you need

**Just want to see the product?** Double-click **`monologg-app.html`** — opens in any browser, no setup required.

**Want to see the design system (colors, components, tokens)?** Double-click **`monologg-design-system.html`**.

**Want to run it locally and make changes?**
```
pnpm install     # from this folder — links apps/web, apps/api, packages/types together
pnpm dev         # http://localhost:5173
```
(No pnpm installed globally? `npx pnpm install` / `npx pnpm dev` work the same way.) Before committing, see `CONTRIBUTING.md` for the checks CI runs (`typecheck`, `lint`, `test`, `build`).

**Want the full story — what's built, what isn't, decisions made, bugs fixed, and what's left?** Go to **`handoff/`** and start with `handoff/README.md`.

## What's in this folder

| Item | What it is |
|---|---|
| `monologg-app.html` | The whole product, as one double-clickable file. Regenerate from `apps/web/` after any code change (see `handoff/design.md` §7). |
| `monologg-design-system.html` | The design-system reference page, same idea — one file, no server needed. |
| `apps/web/` | The actual source code and local dev server. This is what a developer opens to make changes. |
| `apps/api/` | No running server yet (that's `features.md` Phase 3+), but the real Prisma schema/migration/seed against Supabase exist as of Phase 2 — see `apps/api/README.md`. |
| `packages/types/` | Shared zod schemas/TypeScript types — the single source of truth for every data shape, imported by both `apps/web` and (eventually) `apps/api`. |
| `handoff/` | All project documentation: what the product is, the tech stack, a running implementation log, every bug found and fixed, and a plain-language walkthrough of how it was all built. **Read this before making changes**, and keep it updated after. |
| `brand/` | `icon.svg` (mark) and `logo.svg` (wordmark) — the real brand assets, wired into the app via `apps/web/src/app/components/ui/Logo.tsx` everywhere the wordmark appears. |
| `ATTRIBUTIONS.md` | Required credit for third-party components (shadcn/ui) and photos (Unsplash) used in the original design. |
| `CONTRIBUTING.md` | How to run the checks CI runs, and the ground rules for the phase-by-phase backend build-out. |
| `.editorconfig` | Shared editor whitespace/indent settings for the whole project. |
| `pnpm-workspace.yaml`, `package.json`, `pnpm-lock.yaml` | The workspace root — defines the three packages above and proxies common scripts to the right one. |

## The one thing everyone should know before touching anything

**There is no backend, database, or real login yet.** Everything you see running is frontend-only, with sample data served through a typed `api-client` seam (`apps/web/src/lib/api-client.ts`) that currently returns local fixtures. Sign-in, payments, and AI verification are all working demos of the *interface*, not real systems. Full detail in `handoff/design.md` — and see `handoff/features.md` for the full plan to build the real thing.

## Source control & CI

This lives in `github.com/adedoyin899/mono2`, inside this `monologg/` folder (that repo also holds an unrelated project at its root — kept separate on purpose). Push access uses a repo-scoped deploy key, not a general account key — see `handoff/design.md` §7 if you need to push and don't have it configured.

CI (`.github/workflows/monologg-ci.yml`, at the true repo root since that's the only place GitHub Actions looks — scoped to trigger only on changes under `monologg/**`) runs `pnpm install --frozen-lockfile → typecheck → lint → test → build` from this folder on every push/PR and blocks merge on failure. Run the same commands locally before pushing — see `CONTRIBUTING.md`.

## Inside `apps/web/`

```
apps/web/
├── src/
│   ├── app/            the actual pages, components, and routing
│   ├── lib/             api-client.ts (the one data seam), motion tokens, class-name helper
│   ├── mocks/            typed fixtures (@monologg/types), only ever imported by api-client.ts
│   ├── imports/        original product spec (PRD, UX spec) + historical/reference material
│   │   ├── Monologg_Beta_PRD_PDF.pdf       ← the real product requirements doc
│   │   ├── monologg_ux_spec.md             ← the real, current UX spec
│   │   ├── historical-drafts/              ← earlier/superseded drafts, kept for record only
│   │   └── reference-screenshots/          ← original Figma design screenshots, not used by the app itself
│   └── styles/          design tokens and stylesheets — the single source of truth for colors/spacing/etc.
├── package.json          dev, build, build:standalone, build:designsystem, typecheck, lint, format, test
├── .env.example           VITE_API_MODE=mock|live
└── vite.config*.ts        build configuration (one file per build target)
```

If a file isn't listed above or in `handoff/log.md`'s file inventory, treat it as generated (inside `dist*/` folders) or as a standard tool file (`node_modules/`, lockfiles) — not something to edit by hand.
