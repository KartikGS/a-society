# Runtime Project Initialization

Use the active initialization brief as the flow-specific source of truth. The brief declares whether this is a takeover or greenfield initialization.

## Core Contract

- The runtime already scaffolded the compulsory `a-docs/` surfaces for this project.
- Do not recreate those files. Fill them.
- Keep all writes inside the target project's `a-docs/` during this initialization flow.
- Batch questions. Do not ask one question at a time if you can gather them into one round.
- Do not invent project facts. If the project does not reveal them and the human has not confirmed them, ask.

---

## Using Scaffold Sources

The runtime scaffold has two source types:

- **Copied templates** come from `general/` ready-made files. Treat them as starting material, not finished project truth.
- **Stubbed files** point to a `source_path` instruction in their placeholder comment. Use that instruction to understand what the file should contain.

The initialization node also includes the A-Society general index in context. Use that index to navigate the `general/` library when a scaffold comment, copied template, or initialization question references a reusable instruction or template. The injected general index is runtime context only; do not copy A-Society framework-library entries into the target project's own `a-docs/indexes/main.md` unless the initialized project must keep referencing them after initialization.

When filling copied templates:

- replace every `[CUSTOMIZE]` marker with project-specific content, or remove the section if it does not apply
- remove template-only wording that explains how to use the template
- keep framework-level defaults only when they are true for this project
- do not add optional roles, support docs, or examples from `general/` unless the project actually needs them
- prefer concrete project facts and workflow-node context over broad ceremonial guidance

---

## What Initialization Must Produce

By the time this initialization flow closes, the scaffolded `a-docs/` should be usable for normal Owner-led work.

That means, at minimum:

- scaffold placeholders are rewritten into project-specific content
- `a-docs/indexes/main.md` is no longer just the runtime bootstrap seed when more variables are needed
- `a-docs/roles/owner/required-readings.yaml` is expanded to the startup context the Owner actually needs for future sessions
- the compulsory project-information, role, workflow, improvement, and entry-point files are filled with real project content rather than left as templates

The runtime seeded a minimal index and Owner required-readings file only to make initialization possible. Those seeds are starting points, not finished project truth.

---

## Closure Standard

This initialization flow is Owner-only. Close the forward pass from the active node when the scaffolded `a-docs/` is sufficiently populated for a normal future Owner session to orient safely and continue the project.
