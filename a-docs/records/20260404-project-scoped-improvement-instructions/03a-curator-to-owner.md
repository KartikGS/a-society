**Subject:** Project-Scoped Improvement Session Instructions — Curator Proposal
**Flow:** 20260404-project-scoped-improvement-instructions
**Artifact:** 03a-curator-to-owner.md
**Date:** 2026-04-04

---

## 1. Summary of MAINT Implementation

The following Section A (MAINT) items have been implemented directly in A-Society's `a-docs/` per Curator authority:

1. **A1. Created `a-society/a-docs/improvement/meta-analysis.md`** — Derived from framework template with A-Society record paths resolved and non-records output branch removed.
2. **A2. Created `a-society/a-docs/improvement/synthesis.md`** — Copied from framework template.

These files now serve as the runtime injection targets for A-Society backward passes.

---

## 2. Proposal: LIB Changes (Section B)

This proposal covers the extension of the framework library to support project-specific improvement instructions required by the runtime.

### B1. Update `$INSTRUCTION_IMPROVEMENT` (`a-society/general/instructions/improvement/main.md`)

These changes document the new requirement for project-specific phase files when using a programmatic runtime.

**Change 1 — Add a third item to the "What Is an improvement/ folder?" list**

Replace the existing list at lines 48-51:

```markdown
An `improvement/` folder contains one required component and up to two optional:

1. **Philosophy and protocol** (`main.md`) — required: the principles that govern how improvement decisions are made, combined with the backward pass protocol
2. **Reports** (`reports/`) — optional: the storage location for backward pass findings, for projects that do not use a records structure
3. **Phase-specific instruction files** (`meta-analysis.md`, `synthesis.md`) — optional: present when the project uses a programmatic runtime that injects session context into backward pass agents. See **Project-Specific Phase Files (Runtime)** below.
```

**Change 2 — Add new section "Project-Specific Phase Files (Runtime)"**

Insert before "Integration with the Index" (line 118):

```markdown
## Project-Specific Phase Files (Runtime)

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
```

**Change 3 — Add two rows to the "Integration with the Index" table**

Add after the existing `$[PROJECT]_IMPROVEMENT_REPORTS` row (line 126):

| `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` | `/[project]/a-docs/improvement/meta-analysis.md` | Project-specific meta-analysis phase instructions — runtime injection target for backward pass meta-analysis sessions | Conditional: required when project uses programmatic runtime |
| `$[PROJECT]_IMPROVEMENT_SYNTHESIS` | `/[project]/a-docs/improvement/synthesis.md` | Project-specific synthesis phase instructions — runtime injection target for backward pass synthesis sessions | Conditional: required when project uses programmatic runtime |

**Change 4 — Add record-folder artifact path note**

In the `### reports/ — Reports Folder (Optional)` section, add after line 98:

> **Note on record-folder artifacts:** When a project uses a records structure, backward pass findings are sequenced files within `a-docs/records/[identifier]/`. These are regular repository-tracked files — not system artifact-directory outputs. Do not apply artifact-directory write restrictions to `a-docs/records/` paths. Findings artifacts and completion artifacts in record folders are committed to the project repository alongside all other agent-docs.

### B2. Update `$GENERAL_MANIFEST` (`a-society/general/manifest.yaml`)

Add two new entries to the `# ── Improvement ───` section, after the existing `improvement/reports/main.md` entry (line 141):

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

## 3. Framework Update Report Draft (B3)

# A-Society Framework Update — 2026-04-04

**Framework Version:** vTBD
**Previous Version:** v28.0

## Summary

This update introduces support for project-specific improvement instructions required by the programmatic runtime. Adopting projects that use the runtime must now create and register two new phase-specific instruction files in their `a-docs/improvement/`.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | TBD | Gaps in `a-docs/` for projects using the runtime — Curator must review |
| Recommended | TBD | Improvements worth adopting for all projects |
| Optional | TBD | No action needed for projects not using the runtime |

---

## Changes

### Project-Specific Phase Files for Runtime

**Impact:** TBD
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT` / `$GENERAL_MANIFEST`
**What changed:** Added documentation for `improvement/meta-analysis.md` and `improvement/synthesis.md` phase files; updated the manifest to include these as conditional artifacts.
**Why:** The runtime requires project-specific instruction targets rather than general library templates with unresolved placeholders.
**Migration guidance:** If your project uses the A-Society programmatic runtime, the Curator must create `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` and `$[PROJECT]_IMPROVEMENT_SYNTHESIS` in `a-docs/improvement/` and register them in the index. Base them on the corresponding general templates and resolve all `[PROJECT_*]` placeholders (see the new section in `$INSTRUCTION_IMPROVEMENT` for details).

### Record-Folder Artifact Path Clarification

**Impact:** TBD
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT`
**What changed:** Added a note clarifying that findings in record folders are repository-tracked files, not temporary system artifacts.
**Why:** Prevents confusion about write permissions and persistence of backward pass results when using a records structure.
**Migration guidance:** No structural change required; Curators should review the note to ensure correct handling of record-folder findings.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
