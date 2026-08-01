# Monologg Project Rules

## Continuous Handoff Documentation Discipline
- For EVERY user prompt that results in a code, configuration, or documentation change:
  1. **`monologg/handoff/log.md`**: Append a new dated entry detailing exact changes made, files touched, and technical context.
  2. **`monologg/handoff/implementation-plan.md`**: Update task statuses, checkboxes, and scope items.
  3. **`monologg/handoff/bug.md`**: Log any defects found or fixed during the session with severity and resolution.
  4. **`monologg/handoff/design.md`**: Update if architecture, screens, design tokens, or endpoints are modified.
  5. **`monologg/handoff/process.md`**: Update for high-level workflow or phase transitions.
  6. **Bump `Last updated` date** at the top of every touched handoff file.
  7. Commit and push the changes to git.
