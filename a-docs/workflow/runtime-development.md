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

## 3. Backward Pass

Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes.

**Traversal order:** Because implementation phase nodes in the YAML graph are a placeholder, the full backward pass traversal order cannot be computed until Phase 0 produces the architecture design and the graph is completed. At that point, Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) should be used.

---

## 4. Session Model

The human orchestrates three standing sessions:
1. Owner
2. Curator
3. Runtime Developer

Plus on-demand Technical Architect sessions, operating in design mode for Phase 0 and advisory mode during integration validation.

*Note on table completion: The full session model table (sessions × phases) will be populated when Phase 0 produces the architecture design and implementation phases are defined.*
