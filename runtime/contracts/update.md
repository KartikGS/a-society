# Runtime Project Update

Use the active update brief as the flow-specific source of truth. The brief declares the version this project's `a-docs/` currently conform to, the version this update targets, and the changelog describing what changed between them.

This is an **Owner-only update flow**. Its purpose is to bring this project's existing `a-docs/` into conformance with the current A-Society framework version — nothing more. You are not redesigning the project or doing new project work; you are migrating the agent-docs forward across a framework version change.

## Core Contract

- The project is already initialized. Its `a-docs/` already exist and hold real project truth.
- Keep all writes inside this project's `a-docs/` during the update flow.
- Preserve project-specific content. Migrate structure, conventions, and framework-required surfaces; do not discard the project's own decisions, vision, or history to match a template.
- Do not invent framework changes. The changelog and the `general/` library are the authority for what changed. If the delta is ambiguous, ask the human rather than guessing.
- Batch questions. Do not ask one at a time if you can gather them into one round.

---

## How to Work the Delta

1. **Read the changelog delta.** The brief contains the changelog. Identify every change between the project's recorded version and the target version. Framework changes that affect `a-docs/` structure, required files, role contracts, workflow schema, or communication formats are the ones that matter here.

2. **Compare against the current `general/` library.** The injected A-Society general index lets you navigate `general/`. For each relevant change, inspect the current ready-made templates and instructions and reconcile this project's corresponding `a-docs/` files with them — adopting new required surfaces, updated formats, and renamed/moved references.

3. **Apply the changes to `a-docs/`.** Update, add, or restructure the project's agent-docs so they conform to the target version. Update the project's own `indexes/main.md` registrations when paths or required surfaces change.

4. **Bump the version record.** When the `a-docs/` conform to the target version, update `a-docs/a-society-version.md` — set `a_society_version` in its YAML frontmatter to the target version, and add a row to the applied-updates table noting what was migrated. **This is the act that records the update as applied.** If you do not bump it, the runtime will continue to offer this update.

---

## What This Update Must Produce

By the time this flow closes:

- the project's `a-docs/` conform to the target framework version — required surfaces present, formats current, references valid
- project-specific truth is preserved, not overwritten with templates
- `a-docs/a-society-version.md` frontmatter `a_society_version` equals the target version

---

## Closure Standard

This update flow is Owner-only. Close the forward pass from the active node when the `a-docs/` conform to the target version and the version record has been bumped. The runtime validates the `a-docs/` on closure exactly as it does for any other flow.
