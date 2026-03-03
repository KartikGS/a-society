# Instruction: Development Folder

## What Is This Artifact?

The `development/` folder is a project's technical reference layer — a structured home for standards, conventions, and domain-specific guides that any agent must understand before contributing to the codebase.

---

## Why It Exists

Development guidance scattered as flat files at the root of `a-docs/` becomes hard to discover as a project grows. Grouping development artifacts under a named folder makes the technical layer navigable: agents know where to look, and the structure communicates which concerns belong together.

---

## What Belongs Here

| File / Folder | Purpose |
|---|---|
| `main.md` | The primary development standards document — general principles, project structure, API route requirements, and code quality conventions |
| `contribution.md` | Contribution and branching guidelines — commit message format, branch naming, git hygiene |
| `technical-context.md` | A quick-reference cheat sheet of key technical configurations, endpoints, and constraints for the project |
| `testing/` | Testing strategy and test contract registry (see sub-folder convention below) |
| `frontend/` | Frontend visual system and refactor safety (see sub-folder convention below) |

Not every project will need all entries. Create what exists and is in active use. Do not pre-create empty placeholder files.

---

## Sub-Folder Convention

Sub-folders are created when a topic has two or more closely related documents that belong together. Each sub-folder uses `main.md` as its canonical entry point.

### `testing/`
- `main.md` — testing philosophy, strategy, tooling, and execution rules
- `contract-registry.md` — durable test contracts (routes, selectors, metrics getters) that all CRs must preserve unless a CR explicitly changes them

### `frontend/`
- `main.md` — design tokens and visual system (single source of truth for visual values)
- `refactor-checklist.md` — safety checklist for rendering-boundary refactors and shared UI component updates

---

## How to Create

1. Create the folder at `[project]/a-docs/development/`.
2. Start with `main.md` — document the project's core coding standards and conventions.
3. Add `contribution.md` if the project has defined branching and commit standards.
4. Add `technical-context.md` as a quick-reference cheat sheet once key technical configurations are known.
5. Create sub-folders (`testing/`, `frontend/`) when their constituent files both exist and are in active use. Do not create sub-folders for a single file.
6. Register all files in the project's index (`indexes/main.md`) with descriptive `$VARIABLE_NAME` entries.
7. Update the project's `agents.md` Universal Standards section to reference the new files.

---

## What Does Not Belong Here

- Project vision, architecture, or principles — those belong in `project-information/`
- Workflow artifacts (plans, reports, requirements) — those belong in `workflow/`
- API contracts or architectural decisions — those belong in `governance/`
- Role-specific behavioral contracts — those belong in `roles/`
