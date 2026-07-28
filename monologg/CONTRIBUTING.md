# Contributing to Monologg

## Running it locally

```
cd app
npm install
npm run dev        # http://localhost:5173
```

## Before you commit

```
npm run typecheck   # tsc --noEmit, strict
npm run lint        # eslint . — warnings are OK, errors block CI
npm test            # vitest run
npm run build       # production build
```

All four are exactly what CI runs on every push/PR (`.github/workflows/monologg-ci.yml`, scoped to `monologg/**`). If it's not green here, it won't be green there.

`npm run format` reformats with Prettier. It's available but not currently a CI gate — the codebase predates Prettier adoption and hasn't been bulk-reformatted yet (see `handoff/log.md`); new code is expected to already match `.prettierrc.json`, and full normalization can happen as a dedicated pass later.

## Working on the backend build-out (`features.md`)

This project is mid-way through turning from a frontend prototype into a full-stack app, following `handoff/features.md` — an 18-phase (0–17), dependency-ordered PRD. The rules that matter most:

1. **One phase at a time.** Finish a phase's acceptance checks and tests, commit, and stop for review before starting the next. Don't batch phases.
2. **Tests are a gate, not an afterthought.** Every phase ships its own tests before it's "done" — money/auth/availability/cap/escrow-state code gets the strongest coverage (unit + integration + concurrency, not just happy-path).
3. **The provider seam is sacred.** Every external dependency (payments, KYC, calendar, AI tagging, notifications) is an interface with a real *and* a mock implementation. The whole app must run and test in all-mock mode with zero real API keys.
4. **Server is authoritative.** Fees, availability, cap enforcement, escrow state, and access control are decided server-side — never trust the client.
5. **Config, not literals.** Fees (`PLATFORM_FEES`), payment provider selection, token lifetimes, etc. are configuration values, never hardcoded in business logic. See `features.md` §1 for the specific stale values (FINCRA, 9%/12% fees) this corrects.
6. **Do no harm to the existing UI.** No phase restyles a screen except the token-adoption phase (Phase 11), which must be visually neutral. Diff key screens against the baseline after each phase.

Read `handoff/features.md` in full before starting Phase 1 or later — this file only summarizes the rules, not the specs.

## Project structure

See `README.md` for the folder map, and `handoff/README.md` for the full documentation index.
