---
workflow:
  name: A-Society Executable Development
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: direction
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: approval
    - id: framework-services-implementation
      role: Framework Services Developer
    - id: orchestration-implementation
      role: Orchestration Developer
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: approval
    - id: curator-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: closure
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

**Phase 0 — Intake (required):** Every executable flow begins with Phase 0. The Owner creates the record folder and produces `01-owner-workflow-plan.md` plus `workflow.md` before any other artifact. Use `$INSTRUCTION_WORKFLOW_COMPLEXITY` for intake sizing/routing and `$A_SOCIETY_RECORDS` for record-folder and `workflow.md` requirements.

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

- **`owner-intake`** — read `$INSTRUCTION_WORKFLOW_COMPLEXITY` to size the executable flow, `$A_SOCIETY_RECORDS` before opening the record folder and writing `workflow.md`, `$A_SOCIETY_OWNER_LOG_MANAGEMENT` when intake decisions affect `$A_SOCIETY_LOG`, and `$A_SOCIETY_OWNER_BRIEF_WRITING` if intake will produce a detailed written brief or approval artifact
- **`owner-phase0-gate`, `owner-integration-gate`** — read `$A_SOCIETY_OWNER_BRIEF_WRITING` when issuing detailed constraints and `$A_SOCIETY_OWNER_TA_REVIEW` when reviewing TA output
- **`ta-phase0-design`, `ta-integration-review`** — read `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- **`framework-services-implementation`** — read `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE`
- **`orchestration-implementation`** — read `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`
- **`curator-registration`** — read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- **`owner-forward-pass-closure`** — read `$A_SOCIETY_OWNER_LOG_MANAGEMENT` and `$A_SOCIETY_OWNER_CLOSURE`

---

## Phase 0 — Intake and Executable Design Gate

Every executable flow opens with the Owner and begins here, before any design/advisory, approval, or implementation artifact is produced.

At intake, the Owner:

- assesses the triggered executable work against the five axes from `$INSTRUCTION_WORKFLOW_COMPLEXITY`
- creates the record folder per `$A_SOCIETY_RECORDS`
- produces `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN`
- creates `workflow.md` for the active executable path
- decides whether the existing executable design already governs the requested change or whether a TA design/advisory step is required

`01-owner-workflow-plan.md` and `workflow.md` are required Phase 0 outputs. The workflow plan is the approval gate for the flow. Executable implementation does not begin until these intake artifacts exist and the Owner has approved the executable scope. Omitting the TA node for a scoped implementation changes the downstream path only; it does not waive the Phase 0 record-folder artifacts. Subsequent forward-pass artifacts follow the sequencing rules in `$A_SOCIETY_RECORDS`.

- If the flow changes executable boundaries, adds a new standing capability, changes a stable executable contract, or restructures the executable workflow, route through the TA design step before implementation.
- If the flow is a scoped implementation that fits an already approved executable design, the record-folder `workflow.md` may omit the TA node and route directly from the Owner gate to the relevant developer track.

---

## Implementation Tracks

This workflow supports one or both executable implementation tracks:

- **Framework Services Developer track** — deterministic framework services such as scaffolding, validation, backward-pass planning, consent handling, and update comparison
- **Orchestration Developer track** — runtime orchestration, session lifecycle, CLI behavior, provider integration, observability, and `$A_SOCIETY_RUNTIME_INVOCATION`

Only the tracks actually used by a flow should appear in that flow's `workflow.md`. The permanent workflow graph shows the fullest standing path; the record-folder graph scopes it to the active traversal.

All standing executable implementation lands under `runtime/`.

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
2. Technical Architect, when a design or integration gate is required
3. Framework Services Developer, when that track is in scope
4. Orchestration Developer, when that track is in scope
5. Curator

Parallel executable developer tracks may run concurrently when the approved scope allows it.
