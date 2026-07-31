# Monologg — Handoff Folder Index

**Last updated:** 2026-07-31

Looking for how to just open or run the product? See the root-level `README.md` (one level up) — it covers the double-clickable HTML files, the `app/` folder, and the `brand/` assets.

This folder is the single, continuously-updated record of the project's history and decisions — for a new developer, a new AI agent, or a returning PM. Six documents, each with one job:

| File | What it's for | Update it when... |
|---|---|---|
| **`implementation-plan.md`** | The living status board — what's done, what's in progress, what's left, in one glance | Any task starts, finishes, or gets re-scoped |
| **`design.md`** | What the product is, what's built vs. the PRD, the tech stack, the design system | The stack changes, a new page/feature ships, or a PRD gap gets closed |
| **`features.md`** | The technical build-out PRD for turning this into a full-stack product — backend, auth, payments/escrow, KYC, and the new feature areas (availability, applications, public profile, external booking) — ordered into 18 dependency-ordered phases (0–17) | A phase starts, finishes, or a conflict item (X1–X5) gets resolved |
| **`log.md`** | Chronological, file-by-file record of every implementation change | Any code change worth remembering happens |
| **`bug.md`** | Every defect found, its severity, and how it was fixed | A bug is found and/or fixed |
| **`process.md`** | Plain-language walkthrough of how the work happened, for technical and non-technical readers alike | The high-level process changes (new phase of work, new workflow) |

## The rule: these are living documents, not a one-time report

This handoff folder was written once, in full, on 2026-07-27 — but the project doesn't stop there. **Every future session that changes the app must also update the relevant file(s) above, in the same session as the change** — not as a separate cleanup pass later. Treat it the same way this project treats design tokens: one source of truth, updated at the point of change, so it never silently drifts out of sync with reality.

Concretely, for whoever (human or agent) is doing the next unit of work:

1. **Before starting:** check `implementation-plan.md` for current status, so you're not duplicating or contradicting work already logged.
2. **While working:** nothing to do yet — finish the change first.
3. **Immediately after finishing (same session):**
   - Move the relevant line(s) in `implementation-plan.md` from Backlog → In Progress → Done, or add a new line if it's new scope.
   - Add a dated entry to `log.md` describing what changed and why (follow the existing file-by-file style).
   - If it was a bug, add an entry to `bug.md` with severity, cause, and fix, using the existing severity scale.
   - If it changes what the product *is* (new page, stack swap, a PRD gap closed, a new integration), update the relevant section of `design.md`.
   - If it changes the overall process/workflow in a way a non-technical stakeholder would care about, add a step to `process.md`.
4. **Bump `Last updated`** at the top of every file you touched, to today's date.

If a change is small enough that none of this feels worth doing, it's usually still worth one line in `log.md` — err toward logging.

## Reading order for a fresh start

1. `implementation-plan.md` — current status, right now, at a glance
2. `design.md` — what the product is and how it's built
3. `features.md` — if backend/full-stack work is next, this is the phase-by-phase build PRD; read it before touching Phase 0
4. `log.md` — how it got to this state, in detail
5. `bug.md` — what went wrong along the way and how it was handled
6. `process.md` — the same story, in plain language

And practically: this project is a git repository, pushed to `github.com/adedoyin899/mono2` under the `monologg/` folder (that repo also contains an unrelated `gstack` project at its root — the two are kept deliberately separate). `features.md`'s own Phase 1 will restructure this into a monorepo (`monologg/apps/web`, `monologg/apps/api`, `monologg/packages/types`) — nested under `monologg/` specifically to keep staying separate from that unrelated content.
