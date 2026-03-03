# Instruction: Governance Folder

## What Is This Artifact?

The `governance/` folder is a project's formal record layer — a structured home for API contracts and architectural decisions that define the boundaries and obligations of the system.

---

## Why It Exists

API contracts and architectural decisions share a key property: they are authoritative records that agents must consult before making changes, and they accumulate over time. Grouping them under `governance/` signals their standing — these are not guidelines but binding records. Separating them from development standards prevents conflation: development standards tell agents *how to work*; governance records tell agents *what has been decided and what the system must honor*.

---

## What Belongs Here

| Folder | Entry Point | Purpose |
|---|---|---|
| `api/` | `main.md` | Contract rules for API endpoints and an index of all endpoint contract documents |
| `decisions/` | `main.md` | Architecture Decision Records (ADRs) — one per significant architectural decision |

### `governance/main.md`

The governance folder requires a `main.md` that acts as a router: it names the sub-folders and links to their entry points. This file is the starting point for any agent navigating governance artifacts.

---

## Sub-Folder Structure

### `api/`
- `main.md` — contract rules (every new or modified endpoint must have a matching contract doc), index maintenance responsibilities, and a contents list of all contract files
- One contract file per API endpoint
- `shared-types.md` — common data structures used across endpoints
- `route-contract-template.md` — required structure for new contract documents

### `decisions/`
- `main.md` — ADR template and index of all ADRs
- One file per ADR, named `ADR-XXXX-<title>.md`

---

## How to Create

1. Create the folder at `[project]/a-docs/governance/`.
2. Create `governance/main.md` as the router — describe the folder contents and link to sub-folder entry points using `$VARIABLE_NAME` references.
3. Create `governance/api/main.md` with contract rules and a contents index.
4. Migrate any existing API contract documents into `governance/api/`.
5. Create `governance/decisions/main.md` with the ADR template and an index of existing ADRs.
6. Migrate any existing ADR files into `governance/decisions/`.
7. Register all entry points in the project's index (`indexes/main.md`) with `$VARIABLE_NAME` entries.
8. Update role files that reference these artifacts to use index variables rather than hardcoded paths.

---

## What Does Not Belong Here

- Development standards or coding conventions — those belong in `development/`
- Project vision, structure, or principles — those belong in `project-information/`
- Workflow artifacts (plans, reports, requirements) — those belong in `workflow/`
- Role-specific behavioral contracts — those belong in `roles/`
