---

**Subject:** Phase 0 tooling baseline — four documentation artifacts
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-15

---

## Trigger

Human direction, per `01-owner-to-curator-brief.md`. The Technical Architect's approved addendum defines a Phase 0 gate requiring four documentation artifacts before any tooling implementation begins. The human directed the Curator to produce all four as proposals, with two corrections applied. This submission covers all four artifacts in one review bundle; the Owner may approve each independently.

---

## What and Why

This proposal establishes the documentation baseline that gates the Tooling Developer session. Four artifacts are required:

**Artifact 1 — Tooling Developer role document**
A new `a-docs/` role file. The addendum specifies this must be created and indexed before any Developer session opens. Without it, the Developer has no behavioral contract: scope boundaries, escalation paths, hard rules, and context loading are undefined. The role is internal to A-Society (implements A-Society's own tooling layer), so it belongs in `a-docs/roles/`, not `general/roles/`.

**Artifact 2 — Updated architecture document**
The current `$A_SOCIETY_ARCHITECTURE` still contains a placeholder for the tooling layer: "A programmatic tooling layer is planned... No structural detail is recorded here until the design is approved." That placeholder is now stale — the Owner has approved OQ-1 (`tooling/` as fourth top-level folder), OQ-2 (Node.js), OQ-3/OQ-8 (agent-invoked), and all remaining open questions. The architecture must be updated to reflect confirmed decisions. Also incorporates Correction 1: Developer (not Curator) initializes the `tooling/` Node.js project.

**Artifact 3 — Minimum necessary files manifest (`general/manifest.yaml`)**
A machine-readable YAML file enumerating all artifacts a complete `a-docs/` contains. This is the Scaffolding System's primary input (Component 1): the Developer builds the scaffold to create exactly what the manifest declares. Without the manifest, the scaffold has no stable specification for what to create. Incorporates Correction 2: path is `general/manifest.yaml` (OQ-6 resolved as Option B). Belongs in `general/` because it defines the framework's standard artifact set — domain-agnostic and applicable to any project type.

**Artifact 4 — Update report naming convention parsing contract**
An addition to `$A_SOCIETY_UPDATES_PROTOCOL` formalizing the machine-parseable format that Component 6 (Version Comparator) requires (OQ-9). The naming convention and version field format already exist in the protocol; what is missing is explicit confirmation that these are stable, machine-parseable contracts that tooling may depend on. Without this, the Version Comparator builds against an informal description that could change without notice.

**Correction applied throughout:**
- **Correction 1** (Developer initializes tooling/): reflected in the role document (Developer owns Node.js project initialization) and the architecture update (Phase 0 description corrects the addendum).
- **Correction 2** (manifest at `general/manifest.yaml`): reflected in the manifest proposal and architecture update.

**Indexing note (Curator maintenance, no Owner approval required):**
The architecture proposal (`tooling-architecture-proposal.md`) and addendum (`tooling-architecture-addendum.md`) are currently unindexed. The Developer role's context loading references these documents. After the Owner approves Artifact 2, the Curator will add index entries for both as a maintenance action:
- `$A_SOCIETY_TOOLING_PROPOSAL` → `/a-society/a-docs/tooling-architecture-proposal.md`
- `$A_SOCIETY_TOOLING_ADDENDUM` → `/a-society/a-docs/tooling-architecture-addendum.md`

---

## Where Observed

A-Society — internal. The Phase 0 gate is defined in `tooling-architecture-addendum.md` (Section 2, Phase 0). The two corrections were identified during Curator review of the addendum prior to drafting. Correction 1 is a role-boundary error: the Curator's scope is documentation only; the Developer is the implementation role. Correction 2 is a path confirmation: the human resolved OQ-6 as Option B at `general/manifest.yaml`.

---

## Target Location

1. New: `a-society/a-docs/roles/tooling-developer.md` — to be indexed as `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` post-approval
2. Update: `$A_SOCIETY_ARCHITECTURE` — `/a-society/a-docs/project-information/architecture.md`
3. New: `a-society/general/manifest.yaml` — to be indexed as `$GENERAL_MANIFEST` post-approval
4. Update: `$A_SOCIETY_UPDATES_PROTOCOL` — `/a-society/a-docs/updates/protocol.md`

---

## Draft Content

Full draft content for each artifact is in the corresponding draft file in this record folder. Summaries below establish the Owner's review frame for each.

---

### Artifact 1 — Tooling Developer Role Document

**Draft file:** `draft-01-tooling-developer-role.md`

Key design decisions reflected in the draft:

- **Context loading is minimal by design** (Principle 1): The Developer loads the architecture doc, the tooling proposal, the tooling addendum, and the internal index — not the vision, structure, principles, or a-docs-guide. The Developer is a pure execution role; it does not make placement decisions or framework policy judgments. Loading those documents would add context cost without changing any decision the Developer is authorized to make.
- **Vision omitted from context loading**: The Developer's orientation comes from the architecture doc (overall system design and `tooling/` placement) and the proposal/addendum (binding specifications). The vision document is not required for an agent whose only authorized output is implementation within a fully specified design.
- **Node.js project initialization assigned to Developer**: Correction 1 applied. The role document explicitly names this as a Developer responsibility, not Curator. The Developer initializes `tooling/` with `package.json` and directory structure after the Owner approves the architecture update.
- **Escalation is blocking**: The Developer may not implement workarounds for specification deviations. Any deviation from the approved component designs must be escalated to the TA before implementation on the affected component resumes.

---

### Artifact 2 — Architecture Document Update

**Draft file:** `draft-02-architecture-update.md`

The draft is presented as a set of specific changes to `$A_SOCIETY_ARCHITECTURE`, not a full rewrite. Changes fall into three groups:

1. **System Overview** — "three top-level folders" → "four top-level folders"; add `tooling/` entry; replace the tooling placeholder paragraph with confirmed decisions
2. **Index coverage** — update the public index description to include `tooling/` paths
3. **Addendum correction note** — the architecture update notes that the addendum's Phase 0 item 3 (Curator initializes `tooling/`) is corrected here: the Developer is responsible for Node.js project initialization

The draft also adds index entries for the proposal and addendum documents (Curator maintenance, included here for review awareness, not requiring separate Owner approval).

---

### Artifact 3 — Minimum Necessary Files Manifest

**Draft file:** `draft-03-manifest.yaml`

The manifest enumerates 23 required artifacts and 2 optional artifacts for a standard `a-docs/`. Each entry specifies:
- `path` — relative to the project's `a-docs/` root
- `description` — what the artifact is
- `required` — `true` (must be created in every initialization) or `false` (conditional, created on explicit request)
- `scaffold` — `copy` (Scaffolding System copies from template at `source_path`) or `stub` (Scaffolding System creates an empty titled file)
- `source_path` — the `general/` template or instruction the scaffold uses as the basis

**Generalizability argument (required for `general/` placement):** The manifest defines the framework's standard `a-docs/` artifact set — the same set any adopting project receives, regardless of domain. A legal project, a writing project, and a software project all receive the same base `a-docs/` from the Initializer. The manifest is a specification of that base set, not a project-specific configuration. It contains no domain assumptions and would not need to be rewritten for any project type. This passes the `general/` portability test.

---

### Artifact 4 — Update Report Naming Convention Parsing Contract

**Draft file:** `draft-04-naming-convention.md`

The draft adds a "Programmatic Parsing Contract" section to `$A_SOCIETY_UPDATES_PROTOCOL` after the existing "Report Naming Convention" section. It formalizes:

- **Filename format** as a stable contract (not just a convention): `YYYY-MM-DD-[descriptor].md`, where `YYYY-MM-DD` uses ISO 8601 date format and `[descriptor]` is lowercase hyphen-separated words
- **Version field format**: `**Framework Version:** vMAJOR.MINOR` and `**Previous Version:** vMAJOR.MINOR` — both on their own lines, before the first `##` heading in the report body
- **Parser behavior**: how Component 6 discovers files, extracts version fields, filters to unapplied reports, and orders them for sequential application
- **Stability guarantee**: the naming convention and version field format are declared stable contracts; changes require a Curator maintenance proposal and must be reflected in a new Version Comparator implementation

This is a direction-bearing addition (it declares stability as a contract, not a preference) and therefore requires Owner approval before being written to `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints per artifact (may approve individually)
- **REVISE** — with specific changes required before resubmission (per artifact)
- **REJECTED** — with rationale

The Curator does not begin implementation of any artifact until `03-owner-to-curator.md` shows APPROVED status for that artifact. All four must be approved before the Phase 0 gate clears and the Tooling Developer session opens.
