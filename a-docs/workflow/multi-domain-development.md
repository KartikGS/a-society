---
workflow:
  name: A-Society Multi-Domain Development (illustrative)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: direction
    - id: ta-design
      role: Technical Architect
    - id: framework-services-implementation
      role: Framework Services Developer
    - id: orchestration-implementation
      role: Orchestration Developer
    - id: ta-integration
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: approval
    - id: curator-proposal
      role: Curator
    - id: owner-curator-approval
      role: Owner
      human-collaborative: approval
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: closure
  edges:
    - from: owner-intake
      to: ta-design
      artifact: owner-to-ta-brief
    - from: ta-design
      to: framework-services-implementation
      artifact: ta-advisory
    - from: ta-design
      to: orchestration-implementation
      artifact: ta-advisory
    - from: framework-services-implementation
      to: ta-integration
      artifact: completion-report
    - from: orchestration-implementation
      to: ta-integration
      artifact: completion-report
    - from: ta-integration
      to: owner-integration-gate
      artifact: ta-integration-report
    - from: owner-integration-gate
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-curator-approval
      artifact: curator-to-owner
    - from: owner-curator-approval
      to: curator-implementation
      artifact: owner-to-curator
    - from: curator-implementation
      to: owner-closure
      artifact: curator-to-owner
    - from: owner-curator-approval
      to: curator-proposal
      artifact: owner-to-curator
---

# A-Society: Multi-Domain Development Pattern

This document describes how to run one unit of work that spans multiple A-Society domains — framework documentation in `a-docs/` and `general/`, executable implementation in `runtime/` and transitional `tooling/`, and related roles — using parallel tracks within a single flow. It is a composition pattern, not a third permanent executable workflow.

---

## When to Use

Use this pattern when all of the following hold:

- One feature or decision thread requires work in more than one of: framework docs / `general/`, framework-service implementation, orchestration implementation, or other roles that can proceed in parallel after a shared planning or design phase
- Tracks are independent until a join
- Splitting the work into separate flows solely because it touches multiple workflow types would fragment the same unit of work

Do not use this pattern when the project has two permanent, distinct execution loops. That is the multiple-distinct-workflows case in `$INSTRUCTION_WORKFLOW`.

---

## How This Relates to the Permanent Workflows

| Workflow | Role |
|---|---|
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | Library and documentation changes — proposal, Owner approval, implementation, registration |
| `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` | Executable layer — framework services plus orchestration, design gate, implementation, validation, registration |

A multi-domain flow invokes these workflows' roles and conventions as phases inside one record folder. It does not replace those documents.

---

## Role Map (Typical)

| Role | Typical role in the pattern |
|---|---|
| **Owner** | Intake, workflow plan, briefs, integration approval, Curator approval when `general/` changes require it, forward pass closure |
| **Technical Architect** | Design advisory before parallel tracks; integration review after parallel implementation tracks converge |
| **Framework Services Developer** | Parallel track for deterministic executable capabilities |
| **Orchestration Developer** | Parallel track for runtime orchestration and operator-facing executable behavior |
| **Curator** | Parallel track when framework docs / `general/` work is in scope; proposal → Owner approval → implement when required |

---

## Workflow-Linked Support Docs

- **`owner-intake`** — read `$A_SOCIETY_OWNER_LOG_MANAGEMENT`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` when issuing detailed downstream constraints
- **`ta-design`, `ta-integration`** — read `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- **`framework-services-implementation`** — read `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE`
- **`orchestration-implementation`** — read `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`
- **`owner-integration-gate`** — read `$A_SOCIETY_OWNER_TA_REVIEW`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` when adding detailed correction constraints
- **`curator-proposal`, `curator-implementation`** — read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- **`owner-curator-approval`** — read `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` when adding detailed downstream constraints
- **`owner-closure`** — read `$A_SOCIETY_OWNER_LOG_MANAGEMENT` and `$A_SOCIETY_OWNER_CLOSURE`

---

## Parallel Tracks

After a shared planning or TA design phase, the graph may fork to two or more implementation nodes that run concurrently. Each track produces completion artifacts consumed by a join node, typically TA integration review and then Owner integration gate.

When more than one executable track converges, require comparable completion artifacts so convergence review does not depend on ad hoc normalization.

---

## Curator Track and `general/` Checkpoint

When a parallel track includes work that affects `general/`, the Curator follows the Approval Invariant: no unilateral writes to `general/` — proposal, Owner `APPROVED`, then implementation.

If the only `general/` work is Curator-owned and requires approval, the embedded loop is still Curator proposal → Owner approval → Curator implementation within the same flow and record folder.

---

## Record Folder and `workflow.md`

- Create a record folder under `$A_SOCIETY_RECORDS`
- Author `workflow.md` in the nodes/edges format with YAML frontmatter `workflow:` for this flow only
- The backward-pass planning capability reads `workflow.md` from the record folder; keep the graph consistent with actual artifacts and handoffs

---

## See Also

- `$INSTRUCTION_WORKFLOW` — multi-domain parallel-track flows (single workflow)
- `$A_SOCIETY_WORKFLOW` — routing index and cross-workflow rules
*** Add File: /home/kartik/Metamorphosis/a-society/a-docs/workflow/executable-development.md
---
workflow:
  name: A-Society Executable Development
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes"
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: "yes"
    - id: framework-services-implementation
      role: Framework Services Developer
    - id: orchestration-implementation
      role: Orchestration Developer
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "yes"
    - id: curator-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake
      to: ta-phase0-design
      artifact: owner-to-ta-brief
    - from: ta-phase0-design
      to: owner-phase0-gate
      artifact: executable-design
    - from: owner-phase0-gate
      to: framework-services-implementation
      artifact: owner-approval
    - from: owner-phase0-gate
      to: orchestration-implementation
      artifact: owner-approval
    - from: framework-services-implementation
      to: ta-integration-review
      artifact: completion-report
    - from: orchestration-implementation
      to: ta-integration-review
      artifact: completion-report
    - from: ta-integration-review
      to: owner-integration-gate
      artifact: ta-assessment
    - from: owner-integration-gate
      to: curator-registration
      artifact: owner-approval
    - from: curator-registration
      to: owner-forward-pass-closure
      artifact: curator-to-owner
---

# A-Society: Executable Development Workflow

**Summary:** Designing, implementing, validating, and registering A-Society's executable layer — deterministic framework services plus orchestration, with `runtime/` as the standing executable root.

**Companion docs:** `$A_SOCIETY_EXECUTABLE_PROPOSAL`, `$A_SOCIETY_EXECUTABLE_ADDENDUM`

---

## Roles

| Role | Primary function in this work |
|---|---|
| Technical Architect | Designs executable boundaries, capabilities, and workflow-level implementation structure when needed |
| Framework Services Developer | Implements deterministic executable framework services |
| Orchestration Developer | Implements runtime orchestration behavior and owns `$A_SOCIETY_RUNTIME_INVOCATION` |
| Curator | Registers standing docs, indexes, update reports, and verifies operator-facing references |
| Owner | Approval gates, final authority, forward-pass closure |

---

## Workflow-Linked Support Docs

- **`owner-intake`, `owner-phase0-gate`, `owner-integration-gate`** — read `$A_SOCIETY_OWNER_BRIEF_WRITING` when issuing detailed constraints; read `$A_SOCIETY_OWNER_TA_REVIEW` when reviewing TA output; read `$A_SOCIETY_OWNER_LOG_MANAGEMENT` when intake decisions affect `$A_SOCIETY_LOG`
- **`ta-phase0-design`, `ta-integration-review`** — read `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- **`framework-services-implementation`** — read `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE`
- **`orchestration-implementation`** — read `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`
- **`curator-registration`** — read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- **`owner-forward-pass-closure`** — read `$A_SOCIETY_OWNER_LOG_MANAGEMENT` and `$A_SOCIETY_OWNER_CLOSURE`

---

## Phase 0 — Executable Design Gate

Every executable flow opens with the Owner. The Owner scopes the work and decides whether the existing executable design already governs the requested change or whether a TA design/advisory step is required.

- If the flow changes executable boundaries, adds a new standing capability, changes a stable executable contract, or restructures the executable workflow, route through the TA design step before implementation.
- If the flow is a scoped implementation that fits an already approved executable design, the record-folder `workflow.md` may omit the TA node and route directly from the Owner gate to the relevant developer track.

The approval gate is explicit either way. No executable implementation begins before the Owner has approved the executable scope.

---

## Implementation Tracks

This workflow supports one or both executable implementation tracks:

- **Framework Services Developer track** — deterministic framework services such as scaffolding, validation, backward-pass planning, consent handling, and update comparison
- **Orchestration Developer track** — runtime orchestration, session lifecycle, CLI behavior, provider integration, observability, and `$A_SOCIETY_RUNTIME_INVOCATION`

Only the tracks actually used by a flow should appear in that flow's `workflow.md`. The permanent workflow graph shows the fullest standing path; the record-folder graph scopes it to the active traversal.

`runtime/` is the standing executable root. A flow may keep legacy framework-service edits under `tooling/` only when the approved scope explicitly preserves that migration boundary.

---

## Integration Validation Gate

The TA reviews the integrated executable output against the approved design when the flow includes a TA phase or when a deviation requires review. The Owner then decides the integration gate.

At this gate:

- the Framework Services Developer and Orchestration Developer provide completion artifacts for the tracks they ran
- the TA assesses any deviations or confirms design alignment
- when `$A_SOCIETY_RUNTIME_INVOCATION` changed in-flow, the TA and Owner compare the documented commands, parameters, exposed entry points, and environment-variable names directly against the implementation

Backward-pass findings are required from each participating executable developer role unless the Owner grants an explicit waiver.

---

## Registration Phase

The Curator registers all standing documentation and publication surfaces affected by the executable flow.

Registration includes:

- updating `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` for standing file changes
- maintaining `$A_SOCIETY_AGENT_DOCS_GUIDE` accuracy for changed standing docs and operator-facing references
- updating executable design/coupling docs when the approved scope requires it
- verifying `$A_SOCIETY_RUNTIME_INVOCATION` directly against the implemented operator-facing executable surface when that file changed in-flow
- publishing any approved framework update report and performing the paired `$A_SOCIETY_VERSION` update when required by `$A_SOCIETY_UPDATES_PROTOCOL`

Registration does not mutate `$A_SOCIETY_LOG` lifecycle sections (`Recent Focus`, `Previous`) or `$A_SOCIETY_LOG_ARCHIVE`.

---

## Forward Pass Closure

The Owner is the terminal node of the forward pass. Closure confirms:

- all approved executable work actually landed
- all required registrations and publications are complete
- overlapping Next Priorities items are updated, narrowed, or removed
- backward-pass routing is clear, including any required executable developer findings

---

## Session Model

The human orchestrates:

1. Owner
2. Curator
3. Framework Services Developer, when that track is in scope
4. Orchestration Developer, when that track is in scope

TA sessions are invoked for executable design or integration review when the flow requires them.
