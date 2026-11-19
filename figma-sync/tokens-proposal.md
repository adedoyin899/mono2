# tokens.css promotion proposal (draft — nothing in `tokens.css` was changed)

Source: audit of the v2 Figma file (Performer + Client pages, Nov 2026). Every colour binding was counted
(fills, strokes, effects, gradient stops): **154,141 bindings, 20,227 (13%) use a one-off colour**, spread over
**258 distinct variables**. Concentration is high: the top 5 one-offs cover 47% of those 20,227 bindings, the top 10 cover 58%,
the top 30 cover 75%, the top 70 cover 88%. So ~12 new tokens plus a handful of "use the existing primitive" swaps remove most of the drift.

Values below are what the capture saw in Light / Dark. "Uses" = Figma bindings, a proxy for how widespread it is in the UI.

## Correction to earlier Figma work
The earlier "snap to app tokens" passes compared against the **semantic** tokens only (`--color-*`). `tokens.css` also defines
the `--mono-grey-*` primitives, which I left out of the comparison. Several one-offs are exact or near matches of those, so the
earlier statement that nothing else is close to a token was too strong. Section A lists them. Nothing was re-bound in Figma yet.

## A. Already in tokens.css — use the existing token, add nothing
| One-off (uses) | Existing token | Δ/255 | Note |
|---|---|---|---|
| `#BABABA` (184) | `--mono-grey-150` | 0 | exact |
| `#1A1A1A` (157) | `--mono-grey-500` / `--color-charcoal` | 0 | exact |
| `#7B00FE` (78) | `--color-purple` | 0 | exact (hard-coded in Light) |
| `#767676` (22) | `--mono-grey-300` / `--color-text-tertiary` | 0 | exact |
| `#A1A1A1` (12) | `--mono-grey-200` | 2 | |
| `#18181B` (4), `#16161A` (14) | `--mono-grey-500` | 2 / 4 | Tailwind zinc-900 vs ours |
| `#71717B` (316) | `--mono-grey-300` | 5 | zinc-500 |
| `#9F9FA9` (700) | `--mono-grey-200` | 6 | zinc-400 |
| `#D4D4D8` (21) | `--mono-grey-100` | 7 | zinc-300 |
| `#3F3F47` (8) | `--mono-grey-400` | 9 | zinc-700 |

Root cause: Tailwind `zinc-*` classes are used next to the `--mono-grey-*` ramp. Swapping zinc classes for the ramp tokens is a code
change with a sub-10/255 visual shift. Pairs that are already expressible with primitives (no new value needed, only a semantic name — see B):
`#000000|#FFFFFF` (4,958), `#000000|#1A1A1A` (1,364), `#333333|#1A1A1A` (157), `#3F3F47|#F9F9F9` (184), `#7B00FE|#1A1A1A` (47), `#F13030|#1A1A1A` (87).

## B. Proposed new tokens
Names follow the existing `--color-*` convention. Light value first, `.dark` override second.

| Token | Light | Dark | Uses | Replaces |
|---|---|---|---|---|
| `--color-ink` | `#000000` | `#FFFFFF` | 4,958 | pure black/white SVG icon ink. Better fix: draw icons with `currentColor` + `--color-text-primary` (shifts 000→1A1A1A) and skip the token |
| `--color-bg-inverse` | `#000000` | `#1A1A1A` | 1,364 | black hero/balance panels that stay dark in Light mode |
| `--color-bg-inverse-2` | `#333333` | `#1A1A1A` | 157 | secondary dark panel |
| `--color-text-placeholder` | `#A3A3A3` | `#767676` | ~906 | `#9F9FA9` and `#9F9FA9|#71717B` (placeholder/quiet text, one step below tertiary) |
| `--color-text-on-inverse` | `rgba(255,255,255,0.8)` | same | 187 (+86 at 0.9) | white-80/90 text on dark panels |
| `--color-emerald` | `#009966` | `#00D492` | 1,635 (+150) | status/online/available green |
| `--color-emerald-bright` | `#00BC7D` | same | 925 (+376 `#00D492`) | dot/icon accent |
| `--color-emerald-soft` | `rgba(0,188,125,0.12)` | same | 181 + 64 + 107 | success tints (seen at 10/15/20%) |
| `--color-amber` | `#FE9A00` | same | 641 | pending/in-progress |
| `--color-amber-bright` | `#FFB900` | same | 376 | |
| `--color-amber-strong` | `#E17100` | `#FFB900` | 136 (+120 `#E17100`) | amber text on amber-soft |
| `--color-amber-soft` | `rgba(245,147,0,0.10)` | same | 74 | |
| `--color-purple-strong` | `#5B21B6` | `#DAB2FF` | 216 + 109 (+72 dark variant `#C27AFF`) | purple text on `--color-purple-soft` (badges) |
| `--color-red-strong` | `#B91C1C` | `#FFA2A2` | 203 + 137 | red text on `--color-red-soft`; `--color-error` (`#D31F20`) is 26 steps away |
| `--color-bg-glass-strong` | `rgba(255,255,255,0.95)` | `rgba(0,0,0,0.92)` | 157 + 45 | sticky header bars; `--color-bg-glass` is 0.85/0.88 |

Decisions only you can make:
1. **Two greens — DECIDED: fold emerald into the brand green** (Figma already done, see HANDOFF). Drop the three `--color-emerald*` rows above from the proposal; use `--color-green` / `--color-green-soft` / `--color-success-bg`. Original question: brand green `--color-green` (`#1A7544`) and Tailwind emerald (`#009966` family) are both in use and 36–62 steps apart. Either keep both (add the emerald tokens) or fold emerald into `--color-green` and accept a visible shift on 2,800+ bindings.
2. **Amber vs gold.** The amber family (`#FE9A00`, `#FFB900`) is 24–25 steps from `--color-gold` (`#E6A517`). Same question: add amber, or fold into gold.
3. **`#5B21B6` / `#7C3AED` (violet).** 136 bindings use `#7C3AED`; it is 58 steps from `--color-purple`. Recommend mapping it to `--color-purple` and dropping it.

## C. Do not tokenise (third-party brand colours)
Keep as constants inside the brand icons/screens, not in `tokens.css`: Paystack cyan `#0BA4DB` / `#00A8E1`, Twitter `#1DA1F2`, LinkedIn `#0A66C2`,
Spotify `#1DB954`, Instagram `#E1306C`, YouTube `#FF0000`. `#00A6F4` (180 bindings, sky) has no obvious owner — confirm what it is used for before deciding.

## D. Long tail (not worth tokens)
Roughly 190 variables with fewer than ~45 bindings each (about 2,350 bindings, 12% of one-offs) are chart series, illustration art, gradients and
one-off tints. They stay as named one-offs in Figma (`v2/{family}/…`).

## After tokens.css changes
Figma side (about one working session): add the new tokens as Color variables with Light/Dark modes, alias the matching `v2/{family}/…`
one-offs to them (same reversible method as the earlier snaps), and re-run the dark-mode contrast scan. Ask when ready.
