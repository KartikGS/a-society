# A-Society: Tooling

This folder contains the design, specification, and operational reference documents for A-Society's programmatic tooling layer. These documents govern how the tooling components are specified, implemented, and kept in sync with the `general/` instruction library.

---

## Documents

### `architecture-proposal.md` — `$A_SOCIETY_TOOLING_PROPOSAL`

The definitive specification for all six tooling components: automation boundary evaluation, component interfaces and data flows, open questions resolved, and accepted implementation deviations from Phases 1–2. This is the Tooling Developer's primary authority for implementation decisions.

**Who reads it:** Tooling Developer (before and during implementation), Technical Architect (when reviewing deviations), Owner (at Phase 2 Coupling Test for tooling-adjacent `general/` changes).

---

### `architecture-addendum.md` — `$A_SOCIETY_TOOLING_ADDENDUM`

The implementation workflow: Phase 0 gate requirements, phase sequencing, role responsibilities per phase, deviation escalation path, and backward pass order for the tooling implementation flow. Read this alongside the proposal when routing work through the tooling implementation flow.

**Who reads it:** Tooling Developer, Technical Architect, Owner (when routing tooling work through phases).

---

### `general-coupling-map.md` — `$A_SOCIETY_TOOLING_COUPLING_MAP`

Standing reference for the coupling between tooling components and `general/` — the format dependency table (which `general/` elements each component parses) and the invocation gap table (whether a `general/` instruction directs agents to invoke each component).

**Who reads it:** Owner checks the format dependency table at Phase 2 (Coupling Test) before approving any `general/` proposal. Technical Architect checks the invocation gap column when reviewing tooling deviations. Curator updates it at Phase 4 (Registration) after any Type A–F change.

---

### `ta-assessment-phase1-2.md` — `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`

The Technical Architect's formal rulings on two implementation deviations identified during Phases 1 and 2, including the required spec updates. Reference this when tracing why a component diverges from an implementation-neutral reading of the proposal.

**Who reads it:** Technical Architect or Tooling Developer when tracing the basis for post-Phase 2 spec revisions.
