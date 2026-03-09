# Curator → Owner: Proposal

**Subject:** Framework versioning model — scheme, stamping, and version-aware updates
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-09

---

## Trigger

Owner-identified structural gap: adopting projects have no recorded version baseline and no way to determine which framework update reports apply to them. Briefed via `01-owner-to-curator-brief.md`.

---

## What and Why

This proposal introduces a `vMAJOR.MINOR` versioning scheme for A-Society. The scheme assigns versions to the framework over time, stamps a baseline in each initialized project's `a-docs/`, and requires every future update report to declare the version it represents. With these three pieces in place, any project's Curator can determine exactly which update reports are pending by comparing the project's recorded version against A-Society's current version.

Generalizability: the project-level version record is domain-agnostic — a writing project, software project, or research project all hold the same structure (baseline version, applied update log). The instruction and template apply without modification across all project types.

---

## Where Observed

A-Society — internal. The gap is structural: 7 update reports exist with no version numbering, and no initialized project records which reports it has applied. The cost of this gap grows with each new update report and each new adopting project.

---

## Open Question Resolutions

The five open questions from the briefing are resolved here before the draft content.

### OQ1 — Version file placement

**Decision: root of `a-society/` as `VERSION.md`**

Rationale: `VERSION.md` is a framework-level artifact — not documentation for internal agents (not `a-docs/`), not a distributable instruction or template (not `general/`), not an active agent (not `agents/`). It is analogous to `index.md`, which also lives at the root of `a-society/`. External agents and project owners need it to determine A-Society's current version without loading internal documentation. Root placement makes it accessible to both external and internal consumers via a single predictable location.

`a-docs/project-information/` was considered but rejected: that folder holds documents that describe what A-Society *is* (vision, structure, principles). A version stamp is not a description — it is a state indicator. Mixing it in would conflate identity documents with operational state.

### OQ2 — Project version record placement and content

**Decision: `a-docs/a-society-version.md`, containing baseline version + applied update log**

Path rationale: the file lives at the root of `a-docs/` (not in a sub-folder) because it is a single cross-cutting record, not a document belonging to any sub-domain (workflow, communication, improvement). It is peer to `agents.md` and `a-docs-guide.md` — framework-level operational files that have no sub-folder home.

Content rationale: recording only the baseline version is insufficient. A project that has applied 3 of 5 pending update reports has a different state than one that has applied 0 — both have the same baseline. The applied update log captures the delta between baseline and current state. Together they give any Curator a complete picture: start point, what has been applied, and (by comparing against `VERSION.md`) what remains.

### OQ3 — Version record instruction placement

**Decision: flat file at `general/instructions/a-society-version-record.md`**

The three-file rule is not met — there is no existing category of initialization-related instructions in `general/instructions/` that would form a coherent sub-folder. The namespace parity exception does not apply: the version record lives directly in `a-docs/`, not in a named sub-folder. Flat placement is correct.

### OQ4 — Starting version

**Decision: v1.0**

Rationale: no project has ever been initialized with a version stamp. The versioning system does not exist yet. Retroactively classifying the 7 existing update reports under a scheme that was not in place when they were published would produce arbitrary version numbers with no structural meaning — the reports themselves carry no version fields, and the classification would require judgment calls under a system that wasn't designed to receive them.

v1.0 declares the current stable state of the framework as the baseline. The update report that ships this versioning change will be the first report with version fields, and it will declare v1.1 (MINOR bump: Recommended changes only, 0 Breaking). Future Curators can treat all pre-versioning reports as "already incorporated in v1.0."

### OQ5 — A-Society Curator role update

**Decision: yes, update `$A_SOCIETY_CURATOR_ROLE`**

Rationale: the A-Society Curator's "Authority & Responsibilities" explicitly includes "Migration tasks: restructuring agent-docs in any project to conform to current A-Society standards." When performing such migrations, the A-Society Curator must apply the same version-aware protocol as any project-level Curator. Without this update, the A-Society Curator has no guidance on version ordering during migration — a gap that becomes costly once multiple update reports exist. The addition is a direct corollary of the migration responsibility already declared in the role, not a direction change.

---

## Target Location

| File | Action | Variable |
|---|---|---|
| `/a-society/VERSION.md` | Create | `$A_SOCIETY_VERSION` |
| `/a-society/general/instructions/a-society-version-record.md` | Create | `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` |
| `$A_SOCIETY_UPDATES_PROTOCOL` | Modify — add version requirements section | |
| `$A_SOCIETY_UPDATES_TEMPLATE` | Modify — add version header fields | |
| `$A_SOCIETY_INITIALIZER_ROLE` | Modify — add version stamp step to Phase 3 and Handoff Criteria | |
| `$GENERAL_CURATOR_ROLE` | Modify — add version-aware migration section | |
| `$A_SOCIETY_CURATOR_ROLE` | Modify — add version-aware migration section | |
| `$A_SOCIETY_ARCHITECTURE` | Modify — update delivery/discoverability note | |
| `$A_SOCIETY_PUBLIC_INDEX` | Modify — register `$A_SOCIETY_VERSION` and `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | |
| `$A_SOCIETY_INDEX` | Modify — register `$A_SOCIETY_VERSION` and `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | |

`$A_SOCIETY_AGENT_DOCS_GUIDE` does not require updating: no new `a-docs/` files are being created. `VERSION.md` is at the root of `a-society/`, and the a-docs-guide's `general/instructions/` entry describes the folder's purpose (which the new instruction fits without needing a named entry).

---

## Draft Content

---

### NEW: `/a-society/VERSION.md`

```markdown
# A-Society: Current Version

**Version:** v1.0

---

This file is the single source of truth for A-Society's current framework version.

## Version Scheme

`vMAJOR.MINOR`

- **MAJOR** increments when a Breaking update report is published
- **MINOR** increments when a Recommended or Optional update report is published

This scheme aligns directly with the impact classification on framework update reports. No patch level.

## For Agents

- To determine A-Society's current version: read this file
- This file is updated as part of Phase 4 (Registration) after each approved change cycle that produces an update report
- The Curator updates this file; the Owner reviews it as part of update report approval

## History

| Version | Date | Update Report |
|---|---|---|
| v1.0 | 2026-03-09 | Baseline — versioning system introduced; all pre-versioning update reports incorporated |
```

---

### NEW: `/a-society/general/instructions/a-society-version-record.md`

```markdown
# Instruction: A-Society Version Record

## What This Artifact Is

The A-Society version record is a file in a project's `a-docs/` that records:

1. The version of the A-Society framework that was active when the project was initialized
2. A log of framework update reports the project's Curator has applied since initialization

It is the project's ledger for its position in the A-Society version history. Without it, a Curator joining mid-lifecycle has no way to determine which update reports have already been applied and which are still pending.

## Who Creates It

The Initializer creates this file during Phase 3 — after all other `a-docs/` documents are drafted but before the index is finalized. The Initializer reads A-Society's current version from `a-society/VERSION.md` and records it as the baseline.

## Who Maintains It

The project's Curator. After each migration cycle — after implementing a framework update report — the Curator adds a row to the Applied Updates log.

## File Location

`[project a-docs root]/a-society-version.md`

This file lives at the root of `a-docs/`, alongside `agents.md` and `a-docs-guide.md`. Register it in the project's `indexes/main.md`.

## File Format

```markdown
# A-Society Version Record

**Baseline Version:** v[X.Y]
**Initialized:** [YYYY-MM-DD]

---

## Applied Updates

| Version After | Update Report | Applied | Notes |
|---|---|---|---|
| — | — | — | No updates applied since initialization. |
```

Replace the placeholder row once the first update is applied. Each row records: the version the project is at after applying the report, the report filename (from `a-society/updates/`), the date applied, and optional notes.

## How to Create It (Initializer)

1. Read `a-society/VERSION.md` to get the current framework version
2. Create `a-docs/a-society-version.md` using the format above, stamping the current version as the baseline
3. Register the file in `a-docs/indexes/main.md` before closing Phase 3

## How to Apply Update Reports (Curator)

When performing migration tasks:

1. Read `a-docs/a-society-version.md` to determine the project's recorded version (last row of Applied Updates, or baseline if none applied)
2. Check `a-society/updates/` for all reports whose **Previous Version** ≥ the project's recorded version
3. Apply update reports in version order — lowest version first — through to the latest
4. After implementing each report, add a row to the Applied Updates log with the resulting version, report filename, and date
5. When all pending reports are applied, the project's recorded version matches `a-society/VERSION.md`

**If the project has no `a-society-version.md`** (initialized before versioning was introduced): create one, set the baseline to `v1.0`, leave Applied Updates empty, and apply reports from v1.0 forward.

## Invariant

The project's recorded version is always ≤ A-Society's current version (`a-society/VERSION.md`). A project that is behind has pending update reports; a project that is current needs no migration action.
```

---

### MODIFY: `$A_SOCIETY_UPDATES_PROTOCOL` — add version requirements section

Insert after the "Report Naming Convention" section, before "Delivery":

```markdown
## Version Requirements

Every update report must declare two version fields in the report header, before the Summary section:

- **Framework Version:** The version A-Society is at *after* this update is applied (e.g., `v1.1`). Increment per the scheme in `a-society/VERSION.md`: MAJOR for Breaking changes, MINOR for Recommended or Optional.
- **Previous Version:** The version A-Society was at *before* this update (e.g., `v1.0`). Curators of adopting projects use this field to determine their position in the update sequence — they apply all reports whose Previous Version ≥ their project's recorded version.

The Curator updates `a-society/VERSION.md` as part of Phase 4 (Registration), at the same time the report is published.
```

---

### MODIFY: `$A_SOCIETY_UPDATES_TEMPLATE` — add version header fields

Add two fields to the report header, before "## Summary":

```markdown
**Framework Version:** v[X.Y] *(A-Society's version after this update is applied)*
**Previous Version:** v[X.Y-1] *(A-Society's version before this update)*
```

---

### MODIFY: `$A_SOCIETY_INITIALIZER_ROLE` — add version stamp step

In Phase 3, renumber the current step 11 (`indexes/main.md`) to step 12, and insert a new step 11:

```
11. `a-society-version.md` — read A-Society's current version from `a-society/VERSION.md` and create `a-docs/a-society-version.md` stamping the baseline version and initialization date. Use `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` for the format.
12. `indexes/main.md` — register every document created in this phase; write this last so the registry is complete and accurate.
```

In the Handoff Criteria section, add `a-society-version.md` to the list of foundational documents that must exist:

Change: `"All foundational documents exist and are populated with real content: vision, structure, log, index, role(s), agents.md, a-docs-guide.md, workflow/main.md, communication/ (if two or more roles), improvement/main.md, improvement/protocol.md, and improvement/reports/template-findings.md"`

To: `"All foundational documents exist and are populated with real content: vision, structure, log, index, role(s), agents.md, a-docs-guide.md, workflow/main.md, communication/ (if two or more roles), improvement/main.md, improvement/protocol.md, improvement/reports/template-findings.md, and a-society-version.md"`

---

### MODIFY: `$GENERAL_CURATOR_ROLE` — add version-aware migration section

Add a new section between "Pattern Distillation" and "Handoff Output":

```markdown
## Version-Aware Migration

When performing migration tasks — bringing a project's agent-docs into conformance with current A-Society standards — work in version order:

1. Read the project's `a-docs/a-society-version.md` to determine the current recorded version (last row of Applied Updates, or baseline if none applied)
2. Check `a-society/updates/` for all reports whose **Previous Version** ≥ the project's recorded version
3. Apply update reports sequentially from the project's recorded version to A-Society's current version
4. After implementing each report, add a row to the project's `a-docs/a-society-version.md` Applied Updates log
5. Do not mark migration complete until the project's recorded version matches `a-society/VERSION.md`

**If the project has no `a-society-version.md`** (initialized before versioning was introduced): create one, set the baseline to `v1.0`, and apply update reports from v1.0 forward. See `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` for the file format.
```

---

### MODIFY: `$A_SOCIETY_CURATOR_ROLE` — add version-aware migration section

Add a new section between "Pattern Distillation" and "Handoff Output":

```markdown
## Version-Aware Migration

The A-Society Curator's migration responsibility (restructuring agent-docs in any project to conform to current standards) requires version-aware behavior once versioning is established:

1. Read the target project's `a-docs/a-society-version.md` to determine its recorded version
2. Apply update reports from `a-society/updates/` in version order, from the project's recorded version to A-Society's current version (`$A_SOCIETY_VERSION`)
3. After implementing each report, update the project's `a-docs/a-society-version.md` Applied Updates log
4. Do not mark migration complete until the project's version record matches `$A_SOCIETY_VERSION`

**If the project has no version record** (initialized before versioning was introduced): create one at `a-docs/a-society-version.md` with baseline `v1.0`, then apply reports forward. See `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` (via `$A_SOCIETY_PUBLIC_INDEX`) for the file format.
```

---

### MODIFY: `$A_SOCIETY_ARCHITECTURE` — update delivery/discoverability note

In the "Feedback Signal Architecture" section, under "Outbound communication — Framework update reports", update the final sentence of that paragraph.

Current:
> "The delivery mechanism — how Curators of adopting projects discover these reports — remains an open problem until A-Society's distribution model is defined. See `$A_SOCIETY_UPDATES_PROTOCOL`."

Replace with:
> "A `vMAJOR.MINOR` versioning scheme has been established so Curators can determine which reports they still need to apply by comparing their project's recorded version against `a-society/VERSION.md`. The remaining open problem is *discovery* — how Curators learn that new update reports exist in the first place. This is deferred until A-Society's distribution model is defined. See `$A_SOCIETY_UPDATES_PROTOCOL`."

---

### MODIFY: `$A_SOCIETY_PUBLIC_INDEX` — register new files

Add to the "Framework Updates" section:

```
| `$A_SOCIETY_VERSION` | `/a-society/VERSION.md` | A-Society's current framework version — single source of truth for the vMAJOR.MINOR version stamp |
```

Add to the "Instructions" section:

```
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | `/a-society/general/instructions/a-society-version-record.md` | How to create and maintain an A-Society version record in any initialized project |
```

---

### MODIFY: `$A_SOCIETY_INDEX` — register new files

Add two rows:

```
| `$A_SOCIETY_VERSION` | `/a-society/VERSION.md` | A-Society's current framework version — single source of truth for the vMAJOR.MINOR version stamp |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | `/a-society/general/instructions/a-society-version-record.md` | How to create and maintain an A-Society version record in any initialized project |
```

---

## Open Items for Owner Consideration

**Backward-compatibility bootstrapping:** The proposal handles projects initialized without a version record by instructing Curators to create one with baseline v1.0. This is simple and sufficient for the current scale. The brief flagged this as out-of-scope for a designed solution, and this approach requires no design — it is covered by the Curator role instructions.

**Update report for this change:** This flow qualifies for a framework update report (changes to `general/` and `agents/` that affect initialized projects). The report will declare `Framework Version: v1.1` / `Previous Version: v1.0`. The Curator will draft this after the Owner approves and implementation is complete.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
