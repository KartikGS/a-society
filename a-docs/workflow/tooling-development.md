---
workflow:
  name: A-Society Tooling Development
  nodes:
    - id: owner-phase0-gate
      role: Owner
    - id: curator-phase0-docs
      role: Curator
    - id: developer-phases-1-2
      role: Tooling Developer
    - id: curator-phase3-docs
      role: Curator
    - id: owner-phase3-gate
      role: Owner
    - id: developer-phases-4-5-6
      role: Tooling Developer
    - id: ta-phase6-review
      role: Technical Architect
    - id: owner-phase6-gate
      role: Owner
    - id: curator-phase7
      role: Curator
    - id: owner-phase8-closure
      role: Owner
  edges:
    - from: owner-phase0-gate
      to: curator-phase0-docs
      artifact: owner-approval
    - from: curator-phase0-docs
      to: developer-phases-1-2
      artifact: documentation-baseline
    - from: curator-phase0-docs
      to: curator-phase3-docs
    - from: curator-phase3-docs
      to: owner-phase3-gate
      artifact: curator-to-owner
    - from: owner-phase3-gate
      to: developer-phases-4-5-6
      artifact: owner-approval
    - from: developer-phases-1-2
      to: developer-phases-4-5-6
    - from: developer-phases-4-5-6
      to: ta-phase6-review
      artifact: integration-test-record
    - from: ta-phase6-review
      to: owner-phase6-gate
      artifact: ta-assessment
    - from: owner-phase6-gate
      to: curator-phase7
      artifact: owner-approval
    - from: curator-phase7
      to: owner-phase8-closure
      artifact: curator-to-owner
---

# A-Society: Programmatic Tooling Layer — Roles and Workflow

**Summary:** Implementing and extending the programmatic tooling layer — from Phase 0 documentation gate through component implementation, integration validation, and registration.

**Companion document:** `$A_SOCIETY_TOOLING_PROPOSAL`

---

## 1. Roles

### Overview

Four roles are involved in implementing the tooling layer. Three are existing A-Society roles; one is new.

| Role | Type | Primary function in this work |
|---|---|---|
| Tooling Developer | **New** | Implement approved tooling components in TypeScript |
| Technical Architect | Existing (advisory mode) | Review implementations against approved designs; surface deviations |
| Curator | Existing | All documentation changes — architecture doc, workflow frontmatter, general/ instructions, indexes |
| Owner | Existing | Approval gates; final authority |

---

### Tooling Developer (new role)

**Primary function:** Implement the six approved tooling components in TypeScript, following the Technical Architect's component designs as binding specifications. This is a pure execution role — the designs are given, not open for re-interpretation.

**Authority scope:**

The Tooling Developer owns:
- All implementation choices within an approved component design: library selection (npm packages), internal code structure, test harness design, test fixture data and test assertion adaptation, error message text, file naming within `tooling/`. Internal test-harness design and internal format couplings are explicitly out of bounds for the TA's structural advisories.
- Raising deviations: when the approved design cannot be implemented as specified (e.g., the interface is ambiguous, a dependency conflict exists, a design assumption is wrong), the Developer surfaces this to the TA immediately and does not implement a workaround unilaterally

The Tooling Developer does NOT own:
- Automation boundary decisions — these are fixed by the approved proposal
- Component interface changes — inputs, outputs, and behavior are defined in the designs
- Additions of components not in the approved design
- Any content in `a-docs/` or `general/` — documentation changes belong to the Curator
- Architecture decisions of any kind

**Escalation path:** Design deviation → TA. If TA determines the deviation requires a design change → Owner. The Developer does not implement until the resolution is approved.

**Writes to:** `tooling/` only.

**Role document:** Must be created in `a-docs/roles/tooling-developer.md` and indexed before any Developer session begins. Curator drafts; Owner approves. This is a pre-implementation dependency.

**Placement rationale:** The Tooling Developer is an A-Society internal role — it implements A-Society's own tooling layer, not something other projects run themselves. It belongs in `a-docs/roles/`, not `general/roles/`.

---

### Technical Architect (existing — advisory mode during implementation)

The TA's primary work for this effort is complete (the approved design proposal). During implementation, the TA operates in advisory mode:

**Active responsibilities:**
- Reviewing implementation output against the approved component designs when the Developer or Owner requests it, or when a deviation is escalated
- Confirming "implementation matches spec, no deviations" — this is the TA's sign-off function, distinct from approving their own proposals
- Escalating spec-breaking deviations to Owner before any workaround is implemented

**Not a blocking sequential node in every phase.** The TA is on-demand, not a required step after every implementation sprint. Each phase in the workflow below identifies when TA input is required vs. optional.

**TA sessions:** Invoked on-demand by the Developer (when spec questions arise) or by the Owner (at approval gates). Not a standing persistent session.

**No authority extension needed.** Advisory review of implementation against an approved design is within the existing TA scope.

---

### Curator (existing — expanded documentation scope)

The Curator's role covers all documentation changes in service of the tooling layer. No authority extension is needed; all of the following are within existing Curator scope:

- Updating `$A_SOCIETY_ARCHITECTURE` to reflect confirmed tooling layer decisions
- Drafting the Tooling Developer role document (in `a-docs/roles/`)
- Creating the minimum necessary files manifest (the `tooling/` source of truth for what a complete `a-docs/` contains — OQ-6)
- Drafting the `general/instructions/workflow/` instruction for the workflow graph format (OQ-5)
- Adding YAML frontmatter to A-Society's existing workflow documents (OQ-4, Option B) — after Owner approval
- Registering all new `tooling/` paths and `a-docs/` artifacts in the relevant indexes after implementation is complete
- Producing backward pass findings and synthesis for this flow

All `general/` additions follow the standard proposal flow (Phase 1 → Owner review → approval before implementation). The Curator does not write to `general/` on briefing language alone — explicit Phase 2 approval is required.

---

### Owner (existing — approval gates)

The Owner holds three approval gates in this workflow (detailed in Section 2). No authority extension is needed.

---

## 2. Workflow

### Design note

The existing A-Society workflow (Proposal → Review → Implementation → Registration → Backward Pass) is designed for single-artifact documentation additions. The tooling implementation is structurally different: it has multiple sequential phases with inter-phase dependencies, a new implementation role, and documentation changes that must land before certain implementation phases can begin.

This workflow extends the existing model rather than replacing it. The existing session conventions, handoff protocol, and invariants all apply. Two new elements are added: a Tooling Developer session and the concept of a pre-implementation documentation track (Curator work) that gates certain implementation phases.

---

### Phases

#### Phase 0 — Pre-implementation Documentation Baseline

**Purpose:** Establish all decisions and documents that implementation depends on before any code is written.

**Role:** Curator (executes), Owner (approves gate).

**Work:**

1. Curator drafts the following documentation artifacts, each following the standard proposal flow (Curator proposes → Owner reviews → Owner approves):
   - Updated `$A_SOCIETY_ARCHITECTURE` — reflects confirmed decisions: `tooling/` as fourth top-level folder, Node.js runtime, agent-invoked model
   - Tooling Developer role document (`a-docs/roles/tooling-developer.md`)
   - Minimum necessary files manifest — the machine-readable source of truth for what a complete `a-docs/` contains (the Scaffolding System's input; OQ-6)
   - Update report naming convention — formal confirmation of the naming contract Component 6 requires (OQ-9)

2. Each artifact follows the standard Curator → Owner proposal sequence. Owner approval of each is required before it is created.

3. `tooling/` directory is created with initial Node.js project scaffolding (package.json, directory structure) by the Curator after Owner approves the architecture doc update.

**Gate:** Owner has approved all four documentation artifacts AND the `tooling/` structure exists. No Developer session opens until this gate clears.

**Output:** Approved and registered documentation; `tooling/` directory scaffolded and indexed.

---

#### Phase 1 — Foundation Primitives

**Purpose:** Implement Path Validator (Component 5) and Version Comparator (Component 6). These have no inter-component dependencies and no documentation prerequisites beyond Phase 0.

**Role:** Tooling Developer (primary). TA on-demand if spec questions arise.

**Work:**
- Implement Component 5: Path Validator
- Implement Component 6: Version Comparator
- Test each against current framework state (indexes and version files)

**TA involvement:** On-demand. Developer escalates to TA if the component designs are ambiguous during implementation. TA is not required at phase completion if no deviations occurred.

**Gate:** None beyond Phase 0. TA confirms no deviations if the Developer escalated anything. Owner is not required between Phase 1 and Phase 2 unless a deviation escalated past the TA.

**Known test suite state (as of 2026-03-18):** The version-comparator test suite has 3 pre-existing failures caused by fixture drift — fixtures record v11.1 as the current version, but `VERSION.md` has since moved to v12.0. These failures pre-date Phase 1A and are unrelated to Component 5 or 6 implementation work. When running `npm test` to verify an implementation, confirm that any failures are limited to these version-comparator fixture assertions before declaring the implementation clean. Phase 6 Integration Validation cannot produce a fully clean `npm test` run until the fixture drift is resolved. Update this note when the fixtures are brought current.

**Output:** Working Path Validator and Version Comparator in `tooling/`.

---

#### Phase 1A — Plan Artifact Validator

**Purpose:** Implement Plan Artifact Validator (Component 7). Phase 1-class dependency profile: no cross-component dependencies, read-only (no file writes), validates a stable artifact format.

**Role:** Tooling Developer (primary). TA on-demand if spec questions arise.

**Work:**
- Implement Component 7: Plan Artifact Validator
- Test against: a record folder with a valid plan artifact (exit code 0), an absent plan artifact (exit code 1), a plan with one or more invalid field values (exit code 1), a file with malformed YAML frontmatter (exit code 2)

**TA involvement:** On-demand. Developer escalates to TA if the component design is ambiguous during implementation. TA is not required at phase completion if no deviations occurred.

**Gate:** None beyond Phase 0. TA confirms no deviations if the Developer escalated anything. Owner is not required between Phase 1A and subsequent phases unless a deviation escalated past the TA.

**Parallelism note:** Phase 1A may run concurrently with Phases 1–3. It has no dependency on any other component and no other component depends on it. It may be implemented as soon as Phase 0 clears.

**Output:** Working Plan Artifact Validator in `tooling/`.

---

#### Phase 2 — Consent Utility

**Purpose:** Implement Consent Utility (Component 2). No new documentation prerequisites.

**Role:** Tooling Developer (primary). TA on-demand.

**Work:**
- Implement Component 2: Consent Utility (create and check operations)
- Test against a temp project directory with all three feedback types

**Gate:** Same as Phase 1 — TA on-demand, Owner not required unless deviation escalates.

**Output:** Working Consent Utility in `tooling/`.

---

#### Phase 3 — Workflow Graph Documentation

**Purpose:** Create all documentation artifacts that Component 3 and 4 depend on before their implementation begins.

**Role:** Curator (executes), Owner (approves gate).

**Work:**

1. Curator drafts (following standard proposal flow):
   - `general/instructions/workflow/main.md` (or appropriate path per namespace parity rule) — instruction for how any project creates and maintains a workflow graph representation in the structured format
   - YAML frontmatter block for A-Society's existing workflow document (`$A_SOCIETY_WORKFLOW`) — the machine-readable representation of A-Society's workflow graph

2. Owner reviews both artifacts using the standard review tests. The generalizability test applies to the `general/` instruction; portability of the frontmatter format across project types must be confirmed.

3. After Owner approval: Curator adds the YAML frontmatter to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`. Curator registers the new `general/` instruction in `$A_SOCIETY_PUBLIC_INDEX`.

**Gate:** Owner has approved the `general/` instruction AND the frontmatter has been added to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`. Phase 4 does not begin until this gate clears. The Tooling Developer does not build Component 3 or 4 until there is a live instance of the frontmatter format to build against.

**Parallelism note:** Phase 3 (Curator) can run concurrently with Phases 1–2 (Developer). They have no dependency on each other. The human may run the Curator and Developer sessions in parallel, provided the Phase 0 gate has cleared. Phase 4 (Developer) has a hard dependency on Phase 3 (Curator/Owner) completing first.

**Output:** Approved and registered `general/` instruction; YAML frontmatter present in `$A_SOCIETY_WORKFLOW`; indexes updated.

---

#### Phase 4 — Workflow Graph Format and Backward Pass Orderer

**Purpose:** Implement Component 3 (schema validator for the workflow graph format) and Component 4 (Backward Pass Orderer).

**Role:** Tooling Developer (primary). TA on-demand.

**Work:**
- Implement Component 3: schema validator — validates that a workflow graph document matches the approved YAML frontmatter format
- Implement Component 4: Backward Pass Orderer — computes backward pass traversal order from a valid workflow graph
- Validate Component 4 output against A-Society's workflow: confirm the computed order matches the manually verified order in `$A_SOCIETY_IMPROVEMENT`

**Gate:** TA confirms Component 4 output for A-Society's workflow matches expected order. Owner is not required unless deviation escalates.

**Output:** Working schema validator and Backward Pass Orderer in `tooling/`.

---

#### Phase 5 — Scaffolding System

**Purpose:** Implement Component 1 (Scaffolding System). Most complex component; depends on Phase 2 (Consent Utility) and the approved manifest from Phase 0.

**Role:** Tooling Developer (primary). TA on-demand.

**Work:**
- Implement Component 1: Scaffolding System
- The manifest from Phase 0 is the input specification — Developer does not define what files to create
- Consent Utility (Phase 2) is called by the scaffold during initialization to create consent stubs
- Test with a full initialization run in a temp project directory; verify output matches a manually initialized `a-docs/`

**Gate:** TA confirms implementation matches spec and integration with Consent Utility is correct. Owner is not required unless deviation escalates.

**Output:** Working Scaffolding System in `tooling/`.

---

#### Phase 6 — Integration Validation

**Purpose:** Validate that all components work together correctly end-to-end, and produce the invocation documentation that agents will use.

**Role:** Tooling Developer (primary); TA review (required at this phase); Owner final approval gate.

**Work:**

1. Tooling Developer:
   - Runs all components together against a simulated full initialization and backward pass scenario
   - Runs Path Validator against all indexes — must pass with zero failures
   - Writes invocation documentation: how agents call each tool, what inputs they provide, how they interpret outputs

2. TA reviews:
   - Integration test record against approved component designs
   - Invocation documentation for correctness

3. Owner reviews:
   - TA assessment
   - Integration test record
   - Invocation documentation
   - Path Validator results

**Gate:** Owner explicitly approves the complete tooling layer. This is the final approval gate. The tooling layer is not considered complete until the Owner has signed off.

**Output:** Integration test record; invocation documentation; Path Validator results (all passing); Owner approval recorded.

---

#### Phase 7 — Registration and Finalization

**Purpose:** Register all tooling artifacts in the appropriate indexes and assess whether a framework update report is warranted.

**Role:** Curator.

**Work:**

Registration:
- Register all new `tooling/` paths in `$A_SOCIETY_PUBLIC_INDEX` (tooling is part of A-Society's work product, accessible to external agents via the public index)
- Register any new `a-docs/` artifacts in `$A_SOCIETY_INDEX`
- Add entries to `$A_SOCIETY_AGENT_DOCS_GUIDE` for any new `a-docs/` files created in this flow
- Update `$A_SOCIETY_TOOLING_INVOCATION` with any new component's invocation entry (required for every new component — Component 5 validates all entries in `$A_SOCIETY_TOOLING_INVOCATION` and will fail on components not registered there)

Framework update report assessment:
- Curator checks `$A_SOCIETY_UPDATES_PROTOCOL`: does the tooling layer's completion (new `tooling/` folder, new `general/` instruction, workflow frontmatter format) require adopting projects to review their `a-docs/`?
- If yes: Curator drafts the update report and submits to Owner for review before publishing

**Output:** Updated index row(s); updated a-docs-guide entry if applicable; framework update report draft submitted if triggered. Work hands off to the Owner for forward-pass closure.

---

#### Phase 8 — Forward Pass Closure

**Purpose:** The Owner acknowledges forward-pass completion.

**Role:** Owner.

**Work:** Review any pending update-report submission. Confirm all forward-pass work is complete and registered. Acknowledge closure and initiate the backward pass.

**Output:** Closure message; backward pass initiated.

---

## 3. Backward Pass

Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes.

**Forward-pass node order:** Owner (Phase 0) → Curator (Phase 0) → Tooling Developer (Phases 1, 1A, 2) → Curator (Phase 3) → Tooling Developer (Phases 4–5–6) → Technical Architect (Phase 6 review) → Owner (Phase 6 gate) → Curator (Phase 7) → Owner (Phase 8 closure).

**First occurrences:** Owner, Curator, Tooling Developer, Technical Architect.

**Backward pass order (manual candidate):** Technical Architect, Tooling Developer, Owner — then Curator (synthesis, always last).

**Component 4 invocation:** If Component 4 (Backward Pass Orderer) is available and this flow had more than two participating roles, invoke Component 4 rather than computing the traversal order manually. Pass `$A_SOCIETY_WORKFLOW_TOOLING_DEV` via the record folder's `workflow.md`. The manual ordering above is provided as a reference; when Component 4 is available, it takes precedence.

---

## 4. Session model

| Session | Role | Active in phases |
|---|---|---|
| Session A | Owner | Phase 0 gate, Phase 3 gate, Phase 6 final approval, Phase 8 forward pass closure |
| Session B | Curator | Phase 0 docs, Phase 3 docs, Phase 7 registration |
| Session C | Tooling Developer | Phases 1, 1A, 2, 4, 5, 6 |
| TA sessions | Technical Architect | On-demand — invoked when Developer escalates or at Owner's request for Phase 6 gate. When reviewing a tooling change or deviation, the TA also checks `$A_SOCIETY_TOOLING_COUPLING_MAP`'s invocation gap column for the affected component. If the gap is open, the TA notes it as a standing open item in the advisory output. This is not a hard stop — it is a gap-surfacing obligation. |

The existing session model conventions apply: see `$A_SOCIETY_WORKFLOW` "Session Routing Rules" for the universal rules governing when to start new vs. resume. Each role explicitly tells the human whether to resume or start new at each pause point.

The human orchestrates across three standing sessions (A, B, C) rather than two. TA sessions are invoked ad hoc; the human starts a new TA session when the Developer or Owner identifies the need, and the TA session closes after the review output is produced.

---

### Phase dependency diagram

```
Phase 0 (Owner gate)
  ├── Phase 1 (Developer) ─── Phase 2 (Developer)
  ├── Phase 1A (Developer) [concurrent with Phases 1–3; no inter-phase dependencies]
  └── Phase 3 (Curator/Owner gate)                 ─── Phase 4 (Developer)
                                                                └── Phase 5 (Developer)
                                                                          └── Phase 6 (Developer + TA + Owner gate)
                                                                                    └── Phase 7 (Curator)
                                                                                              └── Phase 8 (Owner closure acknowledgment)
```

Phases 1–2 and Phase 3 may run concurrently after Phase 0 clears.
Phase 4 has a hard dependency on Phase 3.
Phases 4 and 5 are sequential (Scaffold depends on Consent Utility from Phase 2).
