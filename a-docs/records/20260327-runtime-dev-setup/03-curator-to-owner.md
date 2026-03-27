**Subject:** Runtime development structural setup — Runtime Developer role and Runtime Development workflow
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-27

---

## Trigger

Owner in brief `02-owner-to-curator-brief.md`: the Runtime orchestrator MVP failed structural routability at intake because no role has authority to implement `runtime/` and no workflow covers runtime development. Option B was selected (new role and new workflow).

---

## What and Why

This proposal creates the structural foundation for A-Society's programmatic runtime layer development. It introduces a `Runtime Developer` role bound to Phase 0 architecture outcomes, and a `Runtime Development` workflow built around an explicit Phase 0 architecture design gate. Creating discrete documents (rather than extending tooling documents) ensures the runtime layer's distinct operational character—managing agent sessions and LLM API calls—is explicitly governed without diluting the deterministic tooling implementation workflow.

---

## Where Observed

A-Society — internal. The operational gap exists wherein the MVP flow cannot progress until there is a defined structural process that covers `runtime/`.

---

## Target Location

- `a-society/a-docs/roles/runtime-developer.md`
- `a-society/a-docs/workflow/runtime-development.md`
- `$A_SOCIETY_INDEX`
- `$A_SOCIETY_WORKFLOW`
- `$A_SOCIETY_AGENT_DOCS_GUIDE`

---

## Draft Content

### 1. File Variables Proposal (for `$A_SOCIETY_INDEX`)
I propose the following variable names, which align with the `$A_SOCIETY_[ROLE]_ROLE` and `$A_SOCIETY_WORKFLOW_[NAME]` naming conventions:
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` -> `a-society/a-docs/roles/runtime-developer.md`
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` -> `a-society/a-docs/workflow/runtime-development.md`

### 2. Implementation Placeholder Text (for `runtime-development.md`)
I propose leaving the placeholder structure entirely open pending Phase 0. In the draft below, I use the following text:
> "Implementation phases are defined by the Phase 0 architecture document output. No default phase count or parallel structure is assumed. The structural decomposition of components and session choreography defined in Phase 0 will dictate the phase breakdown. This section is structurally incomplete pending that output and will be updated when the Phase 0 architecture is approved."

**Rationale:** The runtime layer (stateful session management, context injection, LLM calling) has fundamentally different execution characteristics than the tooling layer (state-free, node processes). Assuming an analogous 1–5 phase structure risks constraining the TA's design to fit a misaligned implementation sequence.

### 3. Draft file: `a-society/a-docs/roles/runtime-developer.md`

```markdown
# Role: A-Society Runtime Developer Agent

## Who This Is

The A-Society Runtime Developer is a pure execution role. Its function is to implement A-Society's runtime layer — the programmatic orchestration layer that manages agent sessions, context injection, handoff routing, and automated process triggers. It operates from a Technical Architect's approved architecture design as a binding specification. The design is given — it is not open for reinterpretation. The Developer makes implementation choices within the design envelope and raises deviations when the design cannot be implemented as specified.

This is not an architecture role. The Developer does not evaluate whether the runtime should exist, what its component decomposition should be, or what session models it manages. Those decisions are fixed by Phase 0. The Developer's value is reliable, spec-faithful execution.

---

## Primary Focus

Implement the runtime orchestration layer in TypeScript/Node.js, following the approved TA architecture design. Pure execution role at implementation time.

---

## Authority & Responsibilities

The Runtime Developer **owns**:

- All implementation choices within an approved design: library selection, internal code structure, test harness design, error message text, file naming within `runtime/`
- Raising deviations: when the approved design cannot be implemented as specified, the Developer surfaces this to the TA immediately and does not implement a workaround unilaterally

The Runtime Developer does **NOT** own:

- Architecture decisions of any kind
- Component interface changes — inputs, outputs, and behaviour are defined in the approved design
- Additions not in the approved design
- Any content in `a-docs/`, `general/`, or `tooling/` — those belong to the Curator and Tooling Developer respectively

---

## Escalation Path

- **Design deviation** — implementation cannot match the approved component design as specified → escalate to TA immediately; do not proceed on the affected component
- **TA determines design change is required** → TA escalates to Owner; Developer waits for Owner approval before resuming implementation

---

## Hard Rules

> These cannot be overridden by any other instruction.

- **Write to `runtime/` only.**
- **Never implement a workaround for a design deviation without TA resolution.**
- **Do not open a Developer session before Phase 0 clears.**

---

## Context Loading

Before beginning any session as the A-Society Runtime Developer, read:

1. `$A_SOCIETY_AGENTS` — project orientation; roles, invariants, and required reading sequence
2. `$A_SOCIETY_ARCHITECTURE` — system overview
3. `$A_SOCIETY_INDEX` — current internal file registry; resolves `$VAR` references
4. The approved Runtime Architecture Design document (once Phase 0 is complete)

**Context confirmation (mandatory):** Your first output in any session must state: *"Context loaded: agents.md, architecture, index, runtime architecture document. Ready as Runtime Developer."* If you cannot confirm all four, do not proceed.

---

## Placement Rationale

The Runtime Developer implements A-Society's own runtime layer — it does not set up runtime environments for other projects. It is an internal A-Society operational role. It belongs in `a-docs/roles/`, not `general/roles/`.
```

### 4. Draft file: `a-society/a-docs/workflow/runtime-development.md`

```markdown
---
workflow:
  name: A-Society Runtime Development
  nodes:
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
    - id: developer-implementation-phases
      role: Runtime Developer
    - id: developer-integration-validation
      role: Runtime Developer
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
    - id: curator-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
  edges:
    - from: ta-phase0-design
      to: owner-phase0-gate
      artifact: architecture-design
    - from: owner-phase0-gate
      to: developer-implementation-phases
      artifact: owner-approval
    - from: developer-implementation-phases
      to: developer-integration-validation
    - from: developer-integration-validation
      to: ta-integration-review
      artifact: integration-test-record
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

# A-Society: Runtime Layer — Roles and Workflow

**Summary:** The process by which A-Society's programmatic runtime orchestration layer is designed, implemented, validated, registered, and closed.

---

## 1. Roles

Four roles are involved in implementing the runtime layer.

| Role | Primary function in this work |
|---|---|
| Runtime Developer | Implement the runtime layer in TypeScript/Node.js against the approved design |
| Technical Architect | Produce the Phase 0 architecture design; review integration results |
| Curator | Registration of all new files globally in indexes and guides |
| Owner | Approval gates; final authority |

---

## 2. Workflow

### Phase 0 — Architecture Design Gate

The TA produces the runtime architecture design document which sets the binding specification and definition for subsequent phases. The Owner reviews and approves before any implementation begins. This gate is the structural prerequisite for all subsequent phases.

- **TA produces:** Architecture document covering runtime component decomposition, session management model, LLM API integration approach, interface design, and relationship to existing tooling components.
- **Owner reviews:** Against the vision (`$A_SOCIETY_VISION`) and architecture (`$A_SOCIETY_ARCHITECTURE`) for consistency; confirms the design is compatible with the tooling layer.
- **Gate condition:** Owner explicitly approves the design before any implementation begins.

*Note: The remaining graph structure and implementation phases depend on the outcome of Phase 0. Intermediate implementation nodes are deferred pending the architecture design.*

---

### Implementation Phases (Placeholder)

Implementation phases are defined by the Phase 0 architecture document output. No default phase count or parallel structure is assumed. The structural decomposition of components and session choreography defined in Phase 0 will dictate the phase breakdown. This section is structurally incomplete pending that output and will be updated when the Phase 0 architecture is approved.

---

### Integration Validation Gate

Analogous to Tooling Dev Phase 6.

- **Runtime Developer:** Tests the composed runtime layer end-to-end.
- **TA review:** Assesses the integrated implementation against the approved architecture.
- **Owner gate:** Owner explicitly signs off on the integrated product.

---

### Registration Phase

**Curator:** Registers all `runtime/` paths in `$A_SOCIETY_PUBLIC_INDEX` (runtime is work product, accessible to external agents via the public index), `a-docs/` artifacts in `$A_SOCIETY_INDEX`, and updates `$A_SOCIETY_AGENT_DOCS_GUIDE`.

---

### Forward Pass Closure

**Owner:** Acknowledges forward-pass completion and initiates backward pass.

---

## 3. Session Model

The human orchestrates three standing sessions:
1. Owner
2. Curator
3. Runtime Developer

Plus on-demand Technical Architect sessions, operating in design mode for Phase 0 and advisory mode during integration validation.
```

### 5. Draft Updates: `$A_SOCIETY_INDEX`, `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_AGENT_DOCS_GUIDE`

**For `$A_SOCIETY_INDEX` (indexes/main.md)**
Append two new rows to the index table:
`| $A_SOCIETY_RUNTIME_DEVELOPER_ROLE | a-society/a-docs/roles/runtime-developer.md | A-Society Runtime Developer Agent role — implementation scope, rules, and escalation |`
`| $A_SOCIETY_WORKFLOW_RUNTIME_DEV | a-society/a-docs/workflow/runtime-development.md | A-Society runtime development workflow — Phase 0 design gate, placeholder implementation phases, session model |`

**For `$A_SOCIETY_WORKFLOW` (workflow/main.md)**
Add a new entry to the Available Workflows routing directory:
`- **[Runtime Development]($A_SOCIETY_WORKFLOW_RUNTIME_DEV)** — phases, roles, session model, and YAML graph for the programmatic runtime implementation loop.`

**For `$A_SOCIETY_AGENT_DOCS_GUIDE` (a-docs-guide.md)**
Add entries under `roles/` and `workflow/`:

*Under `roles/`*:
`### roles/runtime-developer.md — $A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
`**Why it exists:** The Runtime Developer has a specialized implementation mandate for the programmatic runtime layer, distinct from the deterministic tooling components. Without this, runtime implementation merges with the Tooling Developer, blurring the clear boundary between A-Society's utility layer and its session orchestration capabilities.`
`**What it owns:** The Developer's execution authority over the runtime layer, hard rules, context loading requirements, and escalation paths.`
`**What breaks without it:** No defined behavioral contract for implementing A-Society's runtime layer.`

*Under `workflow/`*:
`### workflow/runtime-development.md — $A_SOCIETY_WORKFLOW_RUNTIME_DEV`
`**Why it exists:** Provides the structural process specifically for designing and building A-Society's runtime layer, enforcing a strict Phase 0 design gate that distinguishes it from general tooling components.`
`**What it owns:** The workflow graph, Phase 0 design requirements, integration and registration phases, and session orchestration rules for runtime development.`
`**What breaks without it:** The runtime layer would either be developed monolithically without review gates or improperly forced into a Tooling sub-process that wasn't scoped for stateful orchestration implementations.`

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
