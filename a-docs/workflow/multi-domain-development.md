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

This document describes how to run one unit of work that spans multiple A-Society domains — framework documentation in `a-docs/` and `general/`, executable implementation in `runtime/`, and related roles — using parallel tracks within a single flow. It is a composition pattern, not a third permanent executable workflow.

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

**Phase 0 — Intake (required):** Every multi-domain flow begins with Phase 0. The Owner creates the record folder and produces `01-owner-workflow-plan.md` plus `workflow.md` before any other artifact. Use `$A_SOCIETY_WORKFLOW_COMPLEXITY` for intake sizing/routing and `$A_SOCIETY_RECORDS` for record-folder, `workflow.md`, and artifact-sequencing requirements.

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

- **`owner-intake`** — read `$A_SOCIETY_WORKFLOW_COMPLEXITY` to size the multi-domain flow, `$A_SOCIETY_RECORDS` before opening the record folder and writing `workflow.md`, `$A_SOCIETY_OWNER_LOG_MANAGEMENT` when intake decisions affect `$A_SOCIETY_LOG`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` when issuing detailed downstream constraints
- **`ta-design`, `ta-integration`** — read `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- **`framework-services-implementation`** — read `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE`
- **`orchestration-implementation`** — read `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`
- **`owner-integration-gate`** — read `$A_SOCIETY_OWNER_TA_REVIEW`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` when adding detailed correction constraints
- **`curator-proposal`, `curator-implementation`** — read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- **`owner-curator-approval`** — read `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` when adding detailed downstream constraints
- **`owner-closure`** — read `$A_SOCIETY_OWNER_LOG_MANAGEMENT` and `$A_SOCIETY_OWNER_CLOSURE`

---

## Phase 0 — Intake

Every multi-domain flow begins here, before any design, proposal, approval, implementation, or registration artifact is produced.

At intake, the Owner:

- assesses the triggered work against the five axes from `$A_SOCIETY_WORKFLOW_COMPLEXITY`
- creates the record folder per `$A_SOCIETY_RECORDS`
- produces `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN`
- creates `workflow.md` for the active multi-domain path
- defines the known path, including any parallel tracks, join points, and known unknowns
- decides whether a TA design phase is required before the parallel implementation tracks begin

`01-owner-workflow-plan.md` and `workflow.md` are required Phase 0 outputs. The workflow plan is the approval gate for the flow. Parallel tracks do not begin until these intake artifacts exist and the Owner has approved the flow shape. When the flow embeds a Curator proposal/approval loop or executable completion artifacts, subsequent forward-pass artifacts still follow the sequencing rules in `$A_SOCIETY_RECORDS` inside the same record folder.

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
- Produce `01-owner-workflow-plan.md` as the first sequenced artifact in that folder
- Author `workflow.md` in the nodes/edges format with YAML frontmatter `workflow:` for this flow only
- The backward-pass planning capability reads `workflow.md` from the record folder; keep the graph consistent with actual artifacts and handoffs

---

## See Also

- `$INSTRUCTION_WORKFLOW` — multi-domain parallel-track flows (single workflow)
- `$A_SOCIETY_WORKFLOW` — routing index and cross-workflow rules
