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

---

## Completion Report Requirements

A completion report is a per-flow artifact filed by a Developer at the end of implementation. It must include two distinct checks — both are required; neither substitutes for the other:

1. **Deviation check:** Were any aspects of the approved design spec not followed? If yes, name them and provide the implementation rationale.

2. **Completeness check:** Are all behaviors specified in the approved design actually implemented — not stubbed, not deferred, not omitted? If any specified behavior was not implemented, name it explicitly. A suggested framing: "Are there any behaviors specified in the approved design that were not implemented, stubbed, or deferred? If yes, list them."

These two checks are not equivalent. A stub can conform to a spec (no deviation) without implementing any of its specified behavior. A completion report that addresses only deviations structurally permits stub implementations to be filed as "complete." Both checks are required.

---

## Integration Test Record Format

Integration gate validation must include reproducible evidence. Reproducible evidence is: command output, state file excerpts, error traces, log samples, or equivalent artifacts that another agent or human could independently use to verify the result.

Narrative assertion alone — for example, "the integration test passed" without supporting output — is insufficient regardless of how confident the filing agent is. The evidence requirement is not about distrust; it is about structural verifiability. Evidence surfaces failures that were missed when the test environment did not exercise all paths.

What to include per integration gate validation:
- The command or procedure used
- The actual output (not a summary of it)
- Any failure paths that were exercised and their outcomes
- Any paths that could not be tested and why
