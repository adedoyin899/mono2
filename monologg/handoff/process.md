# Monologg — How This Was Built: The Process, Step by Step

**Last updated:** 2026-07-27
**This is a living document** — add a new step whenever the high-level process changes (a new phase of work, a new workflow), in the same session as the change. See `README.md` for the full update policy.

This document explains **how** the work happened, in plain language, in the order it happened. If you're technical, it'll double as a checklist you can re-run. If you're not, skip the code-y bits in *italics* and read the rest — it should still make sense.

Think of the whole engagement as two projects back to back:
- **Part A:** turn a downloaded design file into something you can actually click through in a browser.
- **Part B:** make sure the "look and feel" (colors, spacing, buttons, cards) is built on a foundation that's easy to change later, instead of copy-pasted everywhere.

---

## Part A — From a zip file to a working app

### Step 1: Figure out what was actually in the folder

The starting point was a folder with four zip files, two logo images, and a handful of small configuration files — no working app, nothing you could open in a browser yet.

*Technical note: the zips were `cjs.zip`, `css.zip`, `guidelines.zip`, and `src (1).zip`, exported from Figma Make, a tool that turns Figma designs into React code.*

**Why this step matters:** you can't fix or run something until you know what it actually is. This was pure detective work — opening each zip, reading what's inside, figuring out which parts are the real product and which are leftover tooling.

### Step 2: Unpack everything and identify the real source code

All four zips were extracted. One of them contained the actual app code (all the screens, styles, images). The others contained supporting files — a settings file, some one-off scripts the design tool had used internally, and a documentation folder. None of that needed to be run, just understood.

### Step 3: Build a real, runnable project out of the pieces

The exported files were set up to be turned into a *packaged component library* (something other developers install into their own projects) — not a website you can open and click around. To actually see it working, a small number of new files had to be added:
- A "front door" file (`index.html`) — the file a browser loads first
- A small startup script that tells the app "render yourself here"
- An adjusted build configuration to run it as a normal website instead of a package

Then the project's dependencies (all the external code libraries it relies on, like React) were installed.

**Why this step matters:** this is the difference between "we have the ingredients" and "we have a meal." Nothing was invented — everything came from the original export — but it had to be wired together correctly to actually run.

### Step 4: Get a shareable preview link

Before setting up anything permanent, a quick shareable link was generated so the product could be seen immediately, without needing to install anything locally. This required one small, temporary adjustment to how the app's internal navigation worked, specifically so it would behave correctly inside a restricted preview window (this was reverted once the real local version was set up).

### Step 5: Set up a permanent local version

At the user's request, a real, ongoing local copy was set up so it could be opened anytime at `http://localhost:5173` in a normal browser, with the temporary preview-only adjustment reverted back to normal.

*Technical note: this is `app/`, running via `npm run dev`.*

---

## Part B — Making the design system solid

Once the app was running, the next ask was: audit and document the design system (the shared "rules" for colors, spacing, buttons, type), and make sure that changing a rule in one place actually changes it *everywhere* it's used — instead of someone having to remember to update it in 10 different files.

### Step 6: Audit — find out what's actually consistent and what only looks consistent

Every screen was checked against every other screen, looking for:
- Colors, spacing, and rounded-corner values — are they all pulling from the same shared "settings," or did some screens just get a similar-looking value typed in by hand?
- Repeated pieces — like the navigation sidebar, pop-up windows, avatar circles, and status labels — are they built once and reused, or copy-pasted with small differences each time?

**Why this step matters:** something can *look* consistent today by coincidence, while actually being wired up in a fragile way that breaks the moment someone tries to update it. The audit's whole job is to find that gap before it causes a problem.

**What was found**, in plain terms:
- The actual color/spacing "rulebook" was hidden inside a chunk of code instead of living in one clearly labeled settings file.
- Two old, unused copies of a *different* rulebook were still sitting in the project, quietly contradicting the real one — a trap for anyone who stumbled onto them later.
- The two biggest, busiest screens had subtly opted out of the shared "rounded corner" rule without anyone noticing, because their fallback values happened to look the same.
- A pop-up-window background color was hand-typed in ten different places instead of being one shared setting.
- Several small reusable pieces (navigation menus, pop-up windows, little circular profile icons, status tags, form labels) had been built from scratch on almost every screen that needed them, each with tiny, accumulating differences.

### Step 7: Fix the foundation

The real rulebook was moved into one clearly labeled settings file that everything else now points back to. The two old, contradicting rulebooks were disconnected (and later deleted, once confirmed they truly were unused). The hand-typed pop-up background color was replaced with one shared setting.

### Step 8: Fix the two screens that had quietly opted out

The two big screens that weren't using the shared "rounded corner" rule were switched over to use it — carefully checked first to confirm the visual result would be identical, so nothing looked different, it just became truly connected to the shared setting underneath.

### Step 9: Build the reusable pieces properly, once each

Six shared building blocks were built — a pop-up window, a small circular avatar, a status tag/badge, a form-field label, and a navigation sidebar + bottom menu — each written once, in one place, and then swapped in everywhere the old, hand-copied versions used to be. Some very minor, deliberate differences between the old copies were resolved by picking the more common version as the new standard (documented in `log.md`/`bug.md` so nothing is a mystery).

### Step 10: Check the work after every change

After each meaningful change, the project was rebuilt from scratch (a technical health-check that catches typos or broken code immediately) before moving to the next change. A few small mistakes were caught and fixed this way mid-process — see `bug.md` for exactly what those were and how they were caught.

### Step 11: Document the design system — for real, not just in writing

Rather than writing a separate document that describes the colors and components (which would immediately go stale the next time someone changes something), a **living page inside the actual app** was built at `/design-system`. It shows the real colors, spacing, and buttons/badges/avatars — pulled directly from the same settings file the rest of the app uses — so if someone changes a color tomorrow, this page updates itself automatically, with zero extra work.

A second, shareable version of that same page was also generated as a single file, so it can be opened or sent to someone without needing the local server running.

### Step 12: Clean up loose ends

With the app running well, the project folder was reviewed for anything left over and no longer needed — old placeholder files, empty files, and configuration meant for a different purpose than how the project is actually being used now. Nothing was deleted without explicitly checking with the user first; a few items (the original zip files, in particular) were a judgment call, not an obvious "junk vs. not junk" decision, so they were confirmed before removal.

### Step 13: Write this handoff

Four documents (`design.md`, `log.md`, `bug.md`, and this one) were written so that anyone picking this project up next — whether a person or another AI assistant — can understand the product, the technical decisions, the bugs that came up and how they were resolved, and the process used to get here, without needing to reconstruct any of it from scratch.

### Step 14: Turn the handoff into a living system, not a one-time snapshot

A written handoff is only useful the day it's written unless something forces it to stay current. Two more things were added to make sure this doesn't go stale the moment real work resumes:
- **`implementation-plan.md`** — a status board with checkboxes for what's done, what's actively in progress, and what's not started yet, so anyone can see the current state in ten seconds instead of reading four documents to piece it together.
- **`README.md`** — a short index explaining what each document is for, and a rule: **every future change to the app must update the relevant document(s) in the same session as the change**, not as a separate cleanup pass later. The same principle applied to the design tokens (one source of truth, updated at the point of change) now applies to the documentation about the project.

---

## If you're picking this up next: suggested reading order

1. **`README.md`** — the index, and the rule for keeping all of this current.
2. **`implementation-plan.md`** — current status at a glance: done, in progress, not started.
3. **`design.md`** — what the product is, what's actually built vs. only designed, and the full technical stack (including the important fact that there's currently no backend/database/login).
4. **`log.md`** — the detailed, technical, file-by-file record of every change made.
5. **`bug.md`** — every defect found, how serious it was, and how it was fixed — useful both as a record and as a "here's what to watch out for" list.
6. **`process.md`** (this file) — the plain-language walkthrough, useful for onboarding non-technical stakeholders or refreshing your own memory quickly.

And practically: this folder is **not currently a git repository**. If you're a developer continuing this work, initializing git and making a first commit of the current state should be one of your very first steps — everything past this point should be tracked properly, unlike the work described in this handoff.
