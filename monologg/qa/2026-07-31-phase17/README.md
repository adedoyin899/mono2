# Phase 17 — QA, security & UAT (production gate)

Date: 2026-07-31. This is the independent verification pass before production cutover — it
checks the assembled system, not just each phase's own unit tests. Per its own rule, this phase
**does not add features**; anything found becomes a tracked ticket here, not scope creep.

Scope was confirmed with the user up front on the four pieces an agent genuinely can't do
literally: UAT (prep only, sign-off pending), physical cross-device testing (substituted with a
real Playwright browser-engine matrix), load testing (substituted with genuine concurrency
against the real dev database), and staging with test-mode providers (doesn't exist yet, noted
as an infra gap).

## Gate summary

| Section | Status | Detail |
|---|---|---|
| Full regression (typecheck/lint/test/audit/build) | ✅ Green | `regression.md` |
| Cross-browser/responsive (Playwright, 3 engines, 360→1600px) | ✅ Green (143 passed, 1 correctly skipped) | `cross-device-a11y.md` |
| Automated accessibility (axe) | ⚠️ **Runs, reports — does NOT pass clean** | `cross-device-a11y.md` — 45/57 route×browser combos have ≥1 serious/critical `color-contrast` violation; one systemic root cause fixed, the rest is a tracked design-remediation project |
| PWA install / offline | ❌ **Does not exist** | `cross-device-a11y.md` — no manifest/service worker anywhere in the app |
| Security review (auth, webhook, authz fuzzing, secrets, encryption, audit) | ⚠️ **Mostly closed, one real P0/P1 open** | `security.md` — verification-review self-approval gap confirmed and demonstrated, not fixed (out of scope: needs a real moderator role) |
| Load/concurrency on money paths (real DB) | ✅ Green, one attributable perf finding | `load-concurrency.md` |
| NDPA data-handling inventory | ✅ Inventory complete | `ndpa-data-inventory.md` — legal sign-off PENDING |
| UAT | 📝 Script prepared | `uat-plan.md` — **not run, sign-off PENDING** |

## PENDING — human action required, not closed by this pass

1. **UAT sign-off** — `uat-plan.md` is a script, not a completed round. Needs a staging
   environment with test-mode providers (doesn't exist yet) and real talent/client panelists.
2. **NDPA/legal sign-off** — `ndpa-data-inventory.md` is an inventory to inform review, not a
   legal decision.
3. **Physical device/browser testing** — the Playwright matrix is a strong automated substitute,
   but no real iPhone/Android hardware was used.
4. **Lighthouse CI budgets** — not attempted; would need a new tool integration and would
   trivially fail its PWA category on the manifest/service-worker gap regardless.
5. **Dynamic-type / OS-level zoom testing** — not meaningfully emulable via Playwright.
6. **Staging with test-mode real providers** — nothing beyond the earlier mock-mode Vercel web
   deploy exists; this whole pass ran against mock-mode web + the real dev Supabase DB instead.
7. **Color-contrast remediation** — 45/57 route×browser combinations still have serious/critical
   `color-contrast` axe violations after this phase's one systemic fix; needs a dedicated
   design-system pass with sign-off on new brand colors.
8. **PWA install/offline infrastructure** — needs to actually be built (manifest, service worker,
   cached shell) before the `PWA-XX` naming used throughout `features.md` reflects reality.
9. **Verification self-approval** (security.md §3b) — a talent can currently approve their own
   identity verification. Needs a real moderator/reviewer role before real users are onboarded.

## Hard gate (per this phase's own language)

**No production cutover until security highs are closed and UAT is signed off.** As of this
report: security item #9 above (verification self-approval) is an open P0/P1, and UAT (#1) plus
NDPA sign-off (#2) are explicitly not done. This phase's own instruction is a hard stop here —
these are the blockers, not a checklist to wave through.

## What's genuinely new/changed in the codebase this phase

- `apps/web/src/styles/tokens.css` — `--color-text-tertiary` contrast fix (light + dark mode).
- 5 files — `aria-label` additions (`CreatorOnboarding.tsx`, `ClientOnboarding.tsx`,
  `OrderRoom.tsx`, `Settings.tsx`'s `TOGGLE`, `Checkout.tsx` + `ExternalBookingEntry.tsx` date
  inputs).
- `apps/web/e2e/` — new Playwright config + regression/a11y/PWA-gap spec (`@playwright/test`,
  `@axe-core/playwright` added as web devDependencies).
- `apps/api/src/services/payment.test.ts` — new amount-tampering test.
- `apps/api/src/security.authzFuzz.test.ts` — new authorization-fuzzing file (10 tests).
- `apps/api/prisma/phase17.concurrency.integration.test.ts` — new real-DB concurrency test (4
  tests, run manually, not CI-wired — matches the existing integration-test convention).
- `apps/web/src/app/pages/PublicStorefront.test.tsx` — one assertion updated to match the real
  Phase 16 external-booking flow (previously asserted the Phase-15 placeholder stub's copy).

No application feature behavior changed as a result of this phase, other than the accessibility
fixes above (which are bug fixes to existing screens, not new functionality).
