**Subject:** Project-Scoped Improvement Session Instructions — Curator Brief
**Flow:** 20260404-project-scoped-improvement-instructions
**Artifact:** 02a-owner-to-curator-brief.md
**Date:** 2026-04-04

---

## Context

The prior flow (`programmatic-improvement-system`, 2026-04-03) introduced `ImprovementOrchestrator` in the runtime. A backward pass identified three consequential failures (TA Top Finding 2; Owner Top Findings 1–3):

1. `runtime/src/improvement.ts` injects `a-society/general/improvement/meta-analysis.md` and `a-society/general/improvement/synthesis.md` into backward pass sessions. These are **framework library templates** with unresolved `[PROJECT_*]` placeholders — not project-specific instructions. The correct injection targets for A-Society are `a-society/a-docs/improvement/meta-analysis.md` and `a-society/a-docs/improvement/synthesis.md`, derived from `flowRun.projectRoot`. These files **do not exist** yet.

2. `$INSTRUCTION_IMPROVEMENT` does not document that projects using the runtime must create project-specific improvement phase files in `a-docs/improvement/`. Without this, a project following the standard initialization path would have no correct files for the runtime to inject.

3. `$GENERAL_MANIFEST` does not include `improvement/meta-analysis.md` or `improvement/synthesis.md` as initialization artifacts.

The Runtime Developer receives a separate brief (`02b`) to fix `improvement.ts`. This brief covers the Curator's obligations.

---

## Execution Timing

This brief contains both MAINT and LIB items.

- **Section A (MAINT):** Implement immediately on receipt, before producing the proposal. These are within Curator direct authority.
- **Section B (LIB):** Include in proposal artifact `03a-curator-to-owner.md`. Do not implement until Owner issues an `APPROVED` decision in `04-owner-to-curator.md`.

No proposal artifact is required before implementing Section A items.

---

## Section A — MAINT Items (Curator Authority; Implement Immediately on Receipt)

### A1. Create `a-society/a-docs/improvement/meta-analysis.md`

This file is A-Society's project-specific meta-analysis phase instructions. It is the injection target registered as `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` in `$A_SOCIETY_INDEX`. The runtime injects this file into backward pass meta-analysis sessions for A-Society flows.

**Source:** `$GENERAL_IMPROVEMENT_META_ANALYSIS` (`a-society/general/improvement/meta-analysis.md`).

Derive the file from the source as follows:

- Replace `[PROJECT_RECORDS]` with `a-society/a-docs/records`
- Replace `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]` with `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`
- Remove the paragraph that begins `*If the project does not use records:*` — A-Society uses a records structure; the non-records output path is not applicable
- Keep all other content verbatim

The path `a-society/a-docs/improvement/meta-analysis.md` is already registered in both indexes. No index update required.

### A2. Create `a-society/a-docs/improvement/synthesis.md`

This file is A-Society's project-specific synthesis phase instructions. It is the injection target registered as `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` in `$A_SOCIETY_INDEX`. The runtime injects this file into backward pass synthesis sessions for A-Society flows.

**Source:** `$GENERAL_IMPROVEMENT_SYNTHESIS` (`a-society/general/improvement/synthesis.md`).

Copy verbatim — the template contains no `[PROJECT_*]` placeholders.

The path `a-society/a-docs/improvement/synthesis.md` is already registered in both indexes. No index update required.

---

## Section B — LIB Items (Proposal Required; Include in `03a-curator-to-owner.md`)

### B1. Update `$INSTRUCTION_IMPROVEMENT` (`a-society/general/instructions/improvement/main.md`)

Three changes to this file.

**Change 1 — Add a third item to the "What Is an improvement/ folder?" list**

The list currently reads:
> 1. **Philosophy and protocol** (`main.md`) — required: ...
> 2. **Reports** (`reports/`) — optional: ...

Replace with a three-item list that adds after item 2:

> 3. **Phase-specific instruction files** (`meta-analysis.md`, `synthesis.md`) — optional: present when the project uses a programmatic runtime that injects session context into backward pass agents. See **Project-Specific Phase Files (Runtime)** below.

**Change 2 — Add new section "Project-Specific Phase Files (Runtime)"**

Insert a new section immediately before the existing "Integration with the Index" section. Full section text:

---

### Project-Specific Phase Files (Runtime)

When a project uses a programmatic runtime that orchestrates backward pass sessions, the runtime injects project-specific instructions into each session rather than relying on agents to load them from required-reading lists. These instructions must reside in the project's own `a-docs/improvement/`, not in the general framework library.

**Two files are required when using the runtime:**

- **`improvement/meta-analysis.md`** — injected into backward pass meta-analysis sessions. Contains the project's reflection categories, output format rules, findings template reference, and completion signal schema.
- **`improvement/synthesis.md`** — injected into backward pass synthesis sessions. Contains the project's synthesis routing rules, guardrails, and closure behavior.

**Creating these files:**

Base each file on the corresponding general framework template:
- `meta-analysis.md` → start from `$GENERAL_IMPROVEMENT_META_ANALYSIS`; resolve all `[PROJECT_*]` placeholders with values from the project's index
- `synthesis.md` → start from `$GENERAL_IMPROVEMENT_SYNTHESIS`; no placeholders to resolve in the current template

`[PROJECT_*]` placeholders to resolve for `meta-analysis.md` at minimum:
- `[PROJECT_RECORDS]` — the path to the project's records folder (e.g., `my-project/a-docs/records`)
- `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]` — the variable registered in the project's index for the findings template

If the project uses a records structure, remove the non-records output path branch from the template. If the project does not use records, remove the records branch.

**Registering these files:**

Add both to the project's file path index as `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` and `$[PROJECT]_IMPROVEMENT_SYNTHESIS`. See the Integration with the Index section below.

**When to create:**

Create these files when initializing a project that will use the programmatic runtime. If adding runtime support to an existing project, create them as part of runtime setup. These files are not required for projects that run backward passes manually using agent sessions.

---

**Change 3 — Add two rows to the "Integration with the Index" table**

The current table ends with the `$[PROJECT]_IMPROVEMENT_REPORTS` row. Add two rows after it:

| `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` | `/[project]/a-docs/improvement/meta-analysis.md` | Project-specific meta-analysis phase instructions — runtime injection target for backward pass meta-analysis sessions | Conditional: required when project uses programmatic runtime |
| `$[PROJECT]_IMPROVEMENT_SYNTHESIS` | `/[project]/a-docs/improvement/synthesis.md` | Project-specific synthesis phase instructions — runtime injection target for backward pass synthesis sessions | Conditional: required when project uses programmatic runtime |

**Change 4 — Add record-folder artifact path note (absorbed from: "Improvement artifact path semantics")**

In the `### reports/ — Reports Folder (Optional)` section, add the following note after the paragraph beginning "If the project uses a records structure..." and before the "If the project does not use records..." paragraph:

> **Note on record-folder artifacts:** When a project uses a records structure, backward pass findings are sequenced files within `a-docs/records/[identifier]/`. These are regular repository-tracked files — not system artifact-directory outputs. Do not apply artifact-directory write restrictions to `a-docs/records/` paths. Findings artifacts and completion artifacts in record folders are committed to the project repository alongside all other agent-docs.

**Mirror assessment:** `$A_SOCIETY_IMPROVEMENT` (`a-society/a-docs/improvement/main.md`) is the project-specific instantiation of `$INSTRUCTION_IMPROVEMENT`. It already contains correct references to `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` and `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` and correctly labels the general templates as not A-Society's injection targets. No mirror update required.

---

### B2. Update `$GENERAL_MANIFEST` (`a-society/general/manifest.yaml`)

Add two new entries to the `# ── Improvement ───` section, immediately after the existing `improvement/reports/main.md` entry:

```yaml
  - path: improvement/meta-analysis.md
    description: "Project-specific meta-analysis phase instructions — injected by the runtime into backward pass meta-analysis sessions; base on $GENERAL_IMPROVEMENT_META_ANALYSIS and resolve [PROJECT_*] placeholders; conditional on project using the A-Society programmatic runtime"
    required: false
    scaffold: copy
    source_path: general/improvement/meta-analysis.md

  - path: improvement/synthesis.md
    description: "Project-specific synthesis phase instructions — injected by the runtime into backward pass synthesis sessions; base on $GENERAL_IMPROVEMENT_SYNTHESIS and resolve [PROJECT_*] placeholders; conditional on project using the A-Society programmatic runtime"
    required: false
    scaffold: copy
    source_path: general/improvement/synthesis.md
```

---

### B3. Framework Update Report Draft

Include an update report draft as a named section in `03a-curator-to-owner.md`. Use `$A_SOCIETY_UPDATES_TEMPLATE` as the format. Mark classification fields as `TBD` — classification is determined at Phase 4 by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.

The update report should cover:
- The addition of the "Project-Specific Phase Files (Runtime)" section to `$INSTRUCTION_IMPROVEMENT`, including the new index table rows and the record-folder artifact path note
- The addition of `improvement/meta-analysis.md` and `improvement/synthesis.md` to `$GENERAL_MANIFEST`

These changes affect projects adopting the runtime: they will need to create the two phase files in their `a-docs/improvement/` and register them in their index.

---

## Files Changed

| File | Action | Section |
|---|---|---|
| `a-society/a-docs/improvement/meta-analysis.md` | Create | MAINT A1 |
| `a-society/a-docs/improvement/synthesis.md` | Create | MAINT A2 |
| `a-society/general/instructions/improvement/main.md` | Additive: 1 list item + 1 new section + 2 table rows + 1 note | LIB B1 |
| `a-society/general/manifest.yaml` | Additive: 2 new entries | LIB B2 |

---

## Open Questions

None.
