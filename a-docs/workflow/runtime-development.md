---
workflow:
  name: A-Society Runtime Development
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes"
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: "yes"
    - id: developer-implementation-validation
      role: Runtime Developer
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
      artifact: architecture-design
    - from: owner-phase0-gate
      to: developer-implementation-validation
      artifact: owner-approval
    - from: developer-implementation-validation
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

### Workflow Entry — Owner Intake and TA Briefing

Every runtime flow opens with the Owner. The Owner scopes the runtime work, routes it into this workflow, and briefs the TA for Phase 0 design work.

**Workflow-linked support docs:** Before routing intake work that may update Next Priorities or otherwise managing `$A_SOCIETY_LOG` / `$A_SOCIETY_LOG_ARCHIVE`, read `$A_SOCIETY_OWNER_LOG_MANAGEMENT`. Before writing the Owner-to-TA brief or any review-constraint artifact in this workflow, read `$A_SOCIETY_OWNER_BRIEF_WRITING`.

---

### Phase 0 — Architecture Design Gate

The TA produces the runtime architecture design document which sets the binding specification and definition for subsequent phases. The Owner reviews and approves before any implementation begins. This gate is the structural prerequisite for all subsequent phases.

- **Workflow-linked support docs:** Before producing the design advisory, read `$A_SOCIETY_TA_ADVISORY_STANDARDS`. Before reviewing the Phase 0 design or deciding the gate, read `$A_SOCIETY_OWNER_TA_REVIEW`. If the gate artifact adds detailed correction constraints, also read `$A_SOCIETY_OWNER_BRIEF_WRITING`.
- **TA produces:** Architecture document covering runtime component decomposition, session management model, LLM API integration approach, interface design, and relationship to existing tooling components.
- **Owner reviews:** Against the vision (`$A_SOCIETY_VISION`) and architecture (`$A_SOCIETY_ARCHITECTURE`) for consistency; confirms the design is compatible with the tooling layer.
- **Gate condition:** Owner explicitly approves the design before any implementation begins.

*Note: The remaining graph structure and implementation phases depend on the outcome of Phase 0. Intermediate implementation nodes are deferred pending the architecture design.*

---

### Implementation Phases (Placeholder)

Implementation phases are defined by the Phase 0 architecture document output. No default phase count or parallel structure is assumed. The structural decomposition of components and session choreography defined in Phase 0 will dictate the phase breakdown. This section is structurally incomplete pending that output and will be updated when the Phase 0 architecture is approved.

**Workflow-linked support docs:** Before implementing or validating runtime changes in these phases, read `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`. If a TA advisory or deviation review is requested during implementation, the TA reads `$A_SOCIETY_TA_ADVISORY_STANDARDS` before producing it.

---

### Integration Validation Gate

Analogous to Tooling Dev Phase 6.

- **Workflow-linked support docs:** Before the Runtime Developer hands off integration-validation status, read `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`. Before producing the integration review, read `$A_SOCIETY_TA_ADVISORY_STANDARDS`. Before reviewing the TA integration output or deciding the gate, read `$A_SOCIETY_OWNER_TA_REVIEW`. If the gate artifact adds downstream correction constraints, also read `$A_SOCIETY_OWNER_BRIEF_WRITING`.
- **Runtime Developer:** Tests the composed runtime layer end-to-end.
- **TA review:** Assesses the integrated implementation against the approved architecture. When `$A_SOCIETY_RUNTIME_INVOCATION` (or an equivalent operator-facing reference) is modified in-flow, the TA compares the documented commands, parameters, exposed entry points, and environment-variable names directly against the implementation rather than relying on advisory or completion summaries.
- **Owner gate:** Owner explicitly signs off on the integrated product and verifies from the implementation and operator-facing surface that any in-flow changes to `$A_SOCIETY_RUNTIME_INVOCATION` accurately reflect the implemented runtime surface before approval.

---

### Registration Phase

**Workflow-linked support docs:** Before registration or maintenance verification in this phase, read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`.

**Curator:** Registers the runtime public entry point in `$A_SOCIETY_PUBLIC_INDEX` — specifically `$A_SOCIETY_RUNTIME_INVOCATION`, the externally accessible interface. `runtime/src/` files are implementation details and are not individually indexed. For internal documentation, update `$A_SOCIETY_INDEX` only for standing `a-docs/` surfaces affected by the flow. Record-folder artifacts remain record-only by default; index a record path only when the record itself is being adopted as an authoritative long-lived reference, or promote the enduring content to a standing location and index that standing artifact instead. Update `$A_SOCIETY_AGENT_DOCS_GUIDE` when the purpose of a maintained internal or operator-facing reference changes, and verify directly from the implementation or CLI surface that implemented CLI and environment-surface changes are reflected accurately in `$A_SOCIETY_RUNTIME_INVOCATION` before closing registration. Registration must not mutate `$A_SOCIETY_LOG` lifecycle sections (`Recent Focus`, `Previous`) or `$A_SOCIETY_LOG_ARCHIVE`; if closure-time log updates are needed, report them to the Owner in the registration artifact.

---

### Forward Pass Closure

**Workflow-linked support docs:** Before updating `$A_SOCIETY_LOG`, managing `$A_SOCIETY_LOG_ARCHIVE`, or filing closure, read `$A_SOCIETY_OWNER_LOG_MANAGEMENT` and `$A_SOCIETY_OWNER_CLOSURE`.

**Owner:** Acknowledges forward-pass completion.

---

---

## 4. Session Model

The human orchestrates three standing sessions:
1. Owner
2. Curator
3. Runtime Developer

Plus on-demand Technical Architect sessions, operating in design mode for Phase 0 and advisory mode during implementation and integration validation.

*Note on table completion: The full session model table (sessions × phases) will be populated when Phase 0 produces the architecture design and implementation phases are defined.*
