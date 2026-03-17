**Subject:** Compulsory complexity gate — programmatic enforcement of intake analysis
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-17

---

## Trigger

Human-directed. The Owner identified that the complexity analysis at intake was instructional but not structural — a session that skipped the plan artifact had no gate to push against. This was concretely observed during the `20260316-tooling-ts-migration` flow, where the analysis was omitted without friction. The fix is structural: a required plan artifact with a machine-readable schema, a new Phase 0 node in the workflow graph, and explicit gating language in the Owner role doc.

---

## Where Observed

A-Society — internal. Operational gap in framework adherence; no adopting project involved.

---

## Open Question Resolutions

Before draft content: the three open questions from `02-owner-to-curator-brief.md`, resolved.

### OQ1 — Plan artifact frontmatter schema

**Proposed schema:**

```yaml
---
type: owner-workflow-plan
date: "YYYY-MM-DD"
complexity:
  # Allowed values for each axis: low | moderate | elevated | high
  # Each value measures complexity signal: high = this axis is a strong complexity driver
  # For reversibility: high = poorly reversible (high concern); low = easily undone (low concern)
  domain_spread: null
  shared_artifact_impact: null
  step_dependency: null
  reversibility: null
  scope_size: null
tier: null        # Allowed: 1 | 2 | 3
path: []          # Ordered list of role names; must be non-empty
known_unknowns: [] # List of strings; empty list [] is valid if none
---
```

**Scale rationale — `low | moderate | elevated | high`:** Four points give enough resolution to distinguish meaningfully between trivial, moderate, significant, and high-complexity signals without forcing false precision. A numeric scale (1–5, 1–10) offers more granularity than is actionable at intake, and creates pressure to "score correctly" rather than assess honestly.

**Reversibility direction:** All five axes measure complexity signal, not the raw attribute. For reversibility, `high` means the change is poorly reversible (high concern) — consistent with the other axes where `high` always means a stronger driver of complexity. This is documented in the field comment rather than encoded in the field name, to preserve axis name consistency with `$INSTRUCTION_WORKFLOW_COMPLEXITY`.

**Validator requirements** (for TA scoping after approval):
- All five `complexity` sub-fields must be non-null and in `{low, moderate, elevated, high}`
- `tier` must be non-null and in `{1, 2, 3}`
- `path` must be a non-empty list
- `known_unknowns` must be a list (empty is valid)
- `type` must equal `owner-workflow-plan`
- `date` must be non-null

### OQ2 — Workflow graph update: Phase 0 vs. inside Phase 1

**Recommendation: Phase 0, not a Phase 1 pre-condition.**

`$INSTRUCTION_WORKFLOW_COMPLEXITY` frames intake analysis as what happens "at intake — when the Owner must decide which workflow path a given task requires" and "before creating a Phase 1 briefing." The language is explicitly pre-Phase-1. Phase 1 is the Proposal phase; the plan is a routing decision, not a proposal. Embedding the plan as a Phase 1 pre-condition would misrepresent what Phase 1 is.

Phase 0 is also more honest about the structural position: it precedes the Proposal phase, it is always Owner-owned, and it produces a different kind of artifact than Phase 1. Adding it as Phase 0 is consistent with how `$INSTRUCTION_WORKFLOW_COMPLEXITY` already describes the step — the workflow graph is catching up to the instruction, not diverging from it.

No revision to `$INSTRUCTION_WORKFLOW_COMPLEXITY` is needed. The instruction already correctly describes intake as pre-Phase-1; it just did not specify a required artifact with a defined schema. That gap is addressed by the template.

### OQ3 — Session model prose

**Proposed Step 1 replacement:**

> Session A starts. The human and Owner align on a need. The Owner creates the record folder and produces `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN`. **For Tier 1 flows:** the plan is the approval gate; the Owner implements and closes the flow within Session A — no brief is written and Session B is not needed. **For Tier 2 and 3 flows:** the Owner writes the Owner-to-Curator brief as the next sequenced artifact immediately after the plan. The Owner tells the human whether to resume the existing Curator session or start a new one, provides a copyable path to the brief, and — if a new session is required — provides a copyable session-start prompt for the Curator. If no Curator session exists yet, the Owner says to start Session B; otherwise the default is resume. Session A pauses.

**Proposed session table update (Session A row):**

| Session | Role | Phases |
|---|---|---|
| **Session A** | Owner | Phase 0 (plan) → Tier 2/3: briefing → *pause* → Phase 2 (review) → *pause* → Phase 5 (findings) |

---

## What and Why

This proposal makes the complexity gate structural by:

1. **Adding a required plan artifact template** (`$A_SOCIETY_COMM_TEMPLATE_PLAN`) with YAML frontmatter that a validator can check for required fields.
2. **Formalizing Phase 0** in `$A_SOCIETY_WORKFLOW` — a new node (`owner-phase-0-plan`) with a defined edge to the briefing node, carrying the plan artifact. This makes the gate visible in the graph rather than buried in prose.
3. **Updating `$A_SOCIETY_OWNER_ROLE`** to reference the plan template and make the pre-brief gate explicit in the post-confirmation protocol.
4. **Registering the new template** in `$A_SOCIETY_INDEX`.

The plan artifact also serves the TA's subsequent scoping work: the YAML schema is the machine-readable input to whatever validation mechanism the TA designs.

---

## Target Location

1. New file: `$A_SOCIETY_COMM_TEMPLATE_PLAN` — to be registered at `/a-society/a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md`
2. `$A_SOCIETY_WORKFLOW` — `/a-society/a-docs/workflow/main.md`
3. `$A_SOCIETY_OWNER_ROLE` — `/a-society/a-docs/roles/owner.md`
4. `$A_SOCIETY_INDEX` — `/a-society/a-docs/indexes/main.md`

---

## Draft Content

### A. New file — `TEMPLATE-owner-workflow-plan.md`

Full proposed content:

---

```
---
type: owner-workflow-plan
date: "YYYY-MM-DD"
complexity:
  # Allowed values for each axis: low | moderate | elevated | high
  # Each value measures complexity signal: high = this axis is a strong complexity driver
  # For reversibility: high = poorly reversible (high concern); low = easily undone (low concern)
  domain_spread: null
  shared_artifact_impact: null
  step_dependency: null
  reversibility: null
  scope_size: null
tier: null        # Allowed: 1 | 2 | 3
path: []          # Ordered list of role names; must be non-empty
known_unknowns: [] # List of strings; empty list [] is valid if none
---

> **Template** — do not modify this file. When instantiating, omit this header block. Create from this template into the active record folder as `01-owner-workflow-plan.md`. All five `complexity` axis fields, `tier`, and `path` must be filled in — a plan with any `null` or missing required value is incomplete and does not satisfy the Phase 0 gate.

> **Completion gate:** This plan must exist before any other artifact in the record folder. Implementation does not begin until it exists.

---

**Subject:** [Brief identifier for the work item]
**Type:** Owner Workflow Plan
**Date:** YYYY-MM-DD

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | [What domains or areas this touches] | [low \| moderate \| elevated \| high] |
| **2. Shared artifact impact** | [Which shared artifacts are affected and how] | [low \| moderate \| elevated \| high] |
| **3. Step dependency** | [Whether later steps depend on decisions made in earlier steps] | [low \| moderate \| elevated \| high] |
| **4. Reversibility** | [Whether the change can be easily undone — high = poorly reversible] | [low \| moderate \| elevated \| high] |
| **5. Scope size** | [Number of files, roles, and systems affected] | [low \| moderate \| elevated \| high] |

**Verdict:** [Tier 1 / Tier 2 / Tier 3] — [One-sentence rationale.]

---

## Routing Decision

[Which tier and why. Reference the elevated axes that drove the decision. If a project invariant overrides the complexity-derived tier, name it explicitly.]

---

## Path Definition

[Roles to engage, in order. For Tier 1: Owner only. For Tier 2 and 3: the full sequence of handoffs.]

1. [Role] — [action]

---

## Known Unknowns

[Downstream decisions better deferred to the engaged role once they have context. Write "None" explicitly — this confirms deliberate assessment, not omission.]
```

---

### B. `$A_SOCIETY_WORKFLOW` changes

Four changes across the YAML frontmatter and prose.

#### B1 — YAML: add Phase 0

In the `phases` list, insert before `phase-1`:

```yaml
    - id: phase-0
      name: Intake
```

#### B2 — YAML: add node

In the `nodes` list, insert before `owner-phase-1-briefing`:

```yaml
    - id: owner-phase-0-plan
      role: Owner
      phase: phase-0
      first_occurrence_position: 1
      is_synthesis_role: false
```

#### B3 — YAML: add edge

In the `edges` list, insert as the first edge (before the existing `owner-phase-1-briefing → curator-phase-1-proposal` edge):

```yaml
    - from: owner-phase-0-plan
      to: owner-phase-1-briefing
      artifact: owner-workflow-plan
```

#### B4 — Prose: Trigger Sources section

Replace the final paragraph in the Trigger Sources section:

**Current:**
> **Complexity at intake:** Before creating a Phase 1 briefing, the Owner assesses the complexity of the triggered work to determine the appropriate workflow path. See `$INSTRUCTION_WORKFLOW_COMPLEXITY` for the intake analysis framework — complexity determines the tier of workflow path required and what record artifacts are expected.

**Proposed:**
> **Phase 0 — Intake (required):** Every flow begins with Phase 0 — see the Phase 0 section below. The Owner produces `01-owner-workflow-plan.md` before any other artifact. For Tier 2 and 3 flows, the Owner-to-Curator brief follows immediately as the next sequenced artifact.

#### B5 — Prose: new Phase 0 section

Insert a new section immediately before "### Phase 1 — Proposal":

---

```
### Phase 0 — Intake

Every flow begins here, before any other artifact is produced.

**Owner:** Owner.

**Work:** Assess the complexity of the triggered work against the five axes from `$INSTRUCTION_WORKFLOW_COMPLEXITY`. Select the appropriate tier. Define the known path and surface known unknowns.

**Output:** `01-owner-workflow-plan.md` in the record folder, produced using `$A_SOCIETY_COMM_TEMPLATE_PLAN`. All five complexity axis fields, the tier field, and the path field must be non-null — a plan missing any required field is incomplete and does not satisfy this gate.

For **Tier 1 flows:** the plan is the approval gate; the Owner implements directly within Session A and proceeds to backward pass. No brief is written. No Session B is needed.

For **Tier 2 and 3 flows:** the plan gates the brief. The Owner writes the Owner-to-Curator brief as the next sequenced artifact (e.g., `02-owner-to-curator-brief.md`) immediately after, then initiates Session B.
```

---

#### B6 — Prose: Phase 1 Input line

The record folder creation currently described in Phase 1 moves to Phase 0. Update the Phase 1 Input line:

**Current:**
> **Input:** A stated need from a trigger source. For Curator-led proposals, the Owner creates a record folder (see `$A_SOCIETY_RECORDS`) and writes `01-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. For human-directed changes, the human provides the direction directly. The briefing establishes scope and direction alignment only — a Phase 2 decision artifact is a separate, subsequent step and may not be substituted by the briefing.

**Proposed:**
> **Input:** A completed Phase 0 workflow plan and, for Curator-led proposals, an Owner-to-Curator brief written from `$A_SOCIETY_COMM_TEMPLATE_BRIEF` as the next sequenced artifact after the plan. For human-directed changes, the human provides the direction directly. The briefing establishes scope and direction alignment only — a Phase 2 decision artifact is a separate, subsequent step and may not be substituted by the briefing.

#### B7 — Prose: Handoffs table

Replace the first row:

**Current:**
| Trigger → Phase 1 | Owner briefing written (Curator-led) or human direction given | `01-owner-to-curator-brief.md` in the active record folder, or conversation | Briefing contains Agreed Change and Scope; Curator acknowledges |

**Proposed (two rows):**
| Trigger → Phase 0 | Owner identifies need and creates record folder | `01-owner-workflow-plan.md` in the active record folder | All frontmatter fields non-null; tier and path specified |
| Phase 0 → Phase 1 | Plan complete; Tier 2 or 3 confirmed | Next sequenced artifact in the active record folder, from `$A_SOCIETY_COMM_TEMPLATE_BRIEF` | Briefing contains Agreed Change and Scope; Curator acknowledges |

#### B8 — Prose: session model table and How it flows

**Session table — update Session A row:**

| Session | Role | Phases |
|---|---|---|
| **Session A** | Owner | Phase 0 (plan) → Tier 2/3: briefing → *pause* → Phase 2 (review) → *pause* → Phase 5 (findings) |

**How it flows — replace Step 1:**

**Current:**
> 1. **Session A starts.** The human and Owner align on a need. The Owner creates a record folder and writes `01-owner-to-curator-brief.md`. The Owner tells the human whether to resume the existing Curator session or start a new one, provides a copyable path to `01-owner-to-curator-brief.md`, and — if a new session is required — provides a copyable session-start prompt for the Curator. If no Curator session exists yet, the Owner says to start Session B; otherwise the default is resume. Session A pauses.

**Proposed:**
> 1. **Session A starts.** The human and Owner align on a need. The Owner creates the record folder and produces `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN`. **For Tier 1 flows:** the plan is the approval gate; the Owner implements and closes the flow within Session A — no brief is written and Session B is not needed. **For Tier 2 and 3 flows:** the Owner writes the Owner-to-Curator brief as the next sequenced artifact immediately after the plan. The Owner tells the human whether to resume the existing Curator session or start a new one, provides a copyable path to the brief, and — if a new session is required — provides a copyable session-start prompt for the Curator. If no Curator session exists yet, the Owner says to start Session B; otherwise the default is resume. Session A pauses.

---

### C. `$A_SOCIETY_OWNER_ROLE` changes

Two changes.

#### C1 — Workflow routing bullet

**Current (line 28 area):**
> - **Workflow routing** — routing work into the appropriate workflow by default, including complexity analysis at intake to determine the proportional path through the workflow (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the human to the next session

**Proposed:**
> - **Workflow routing** — routing work into the appropriate workflow by default, including producing a workflow plan artifact using `$A_SOCIETY_COMM_TEMPLATE_PLAN` at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the human to the next session

#### C2 — Post-confirmation protocol

**Current (the three-bullet block):**
> Once the human answers, the Owner:
> - maps the need to **A-Society Framework Development**
> - creates the appropriate trigger input for that workflow
> - tells the human which session to use next and what artifact or context to point the next role at

**Proposed:**
> Once the human answers, the Owner:
> - maps the need to **A-Society Framework Development**
> - creates the record folder and produces `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN` — this plan is the approval gate for the flow and must exist before any brief is written
> - **Tier 2 and 3 flows:** writes the Owner-to-Curator brief as the next sequenced artifact, then tells the human which session to use next and what artifact or context to point the Curator at
> - **Tier 1 flows:** implements directly and proceeds to backward pass within Session A

---

### D. `$A_SOCIETY_INDEX` — new row

Insert after the `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` row:

| `$A_SOCIETY_COMM_TEMPLATE_PLAN` | `/a-society/a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Template: Owner workflow plan — Phase 0 artifact; produced at intake for every flow, before any brief is written |

---

## Cross-Layer Consistency Note

The `$A_SOCIETY_AGENT_DOCS_GUIDE` entry for `communication/conversation/` currently reads:

> **What it owns:** The permanent templates for each artifact type (briefing, proposal, decision).

Adding the workflow plan template as a new type means this parenthetical drifts. This update — changing "(briefing, proposal, decision)" to "(workflow plan, briefing, proposal, decision)" — is in scope for Phase 4 Registration per the protocol requiring a-docs-guide entries for new `a-docs/` files.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
