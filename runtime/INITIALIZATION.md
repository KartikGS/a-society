# Runtime Project Initialization

This file is runtime-owned guidance for initialization flows.

The runtime uses this guide only when a project is being initialized through the browser UI. It applies to both:

- takeover of an existing project that does not yet have `a-docs/`
- greenfield startup of a brand-new project

The active initialization brief in the record folder declares which mode is active. Treat that brief as the flow-specific source of truth.

---

## Core Contract

- The runtime already scaffolded the compulsory `a-docs/` surfaces for this project.
- Do not recreate those files. Fill them.
- Keep all writes inside the target project's `a-docs/` during this initialization flow.
- Read the existing project before asking questions whenever project files already exist.
- Batch questions. Do not ask one question at a time if you can gather them into one round.
- Do not invent project facts. If the project does not reveal them and the human has not confirmed them, ask.

---

## What Initialization Must Produce

By the time this initialization flow closes, the scaffolded `a-docs/` should be usable for normal Owner-led work.

That means, at minimum:

- scaffold placeholders are rewritten into project-specific content
- `a-docs/indexes/main.md` is no longer just the runtime bootstrap seed when more variables are needed
- `a-docs/roles/owner/required-readings.yaml` is expanded to the startup context the Owner actually needs for future sessions
- the compulsory project-information, role, workflow, thinking, improvement, and entry-point files are filled with real project content rather than left as templates

The runtime seeded a minimal index and Owner required-readings file only to make initialization possible. Those seeds are starting points, not finished project truth.

---

## Mode Guidance

### Takeover

The project already exists outside `a-docs/`.

- inspect the project before asking questions
- infer what you can from the existing files and folder structure
- ask only the questions required to fill the missing truth
- document the project as it exists rather than redesigning it

### Greenfield

The project has just been created.

- gather the minimum project truth interactively
- ask for project purpose, outputs, intended users, workflow, contributors, tools, and major constraints
- keep the questioning practical and batched
- fill the scaffolded `a-docs/` from those answers

---

## Closure Standard

This initialization flow is Owner-only. Close the forward pass from the active node when the scaffolded `a-docs/` is sufficiently populated for a normal future Owner session to orient safely and continue the project.
