**Subject:** Runtime Orchestrator MVP — Phase 0 Architecture Design
**Status:** BRIEFED
**Date:** 2026-03-27

---

## Phase 0 Scope

The Technical Architect produces the binding architecture design document for A-Society's runtime layer. This document sets the specification for all subsequent implementation phases. No implementation begins until the Owner explicitly approves it.

### What the Architecture Document Must Cover

Per `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`, the Phase 0 architecture design must address:

1. **Runtime component decomposition** — the discrete components of the runtime layer and what each is responsible for.
2. **Session management model** — how the runtime manages agent sessions end-to-end: creation, context injection, handoff detection, next-session setup, and teardown.
3. **LLM API integration approach** — how the runtime calls LLM APIs directly: which provider(s), which client library, streaming vs. non-streaming, and the error handling model.
4. **Interface design** — what interface the runtime exposes and how the human (or an automated trigger) initiates a flow. The runtime provides its own interface and is not a plugin for existing editors.
5. **Relationship to existing tooling components** — how the runtime invokes and coordinates with the seven tooling components. Which components the runtime triggers automatically (e.g., Component 4 at forward pass closure, Component 7 at plan artifact creation) and which remain agent-invoked.
6. **MVP scope boundary** — what is in scope for the MVP; what is explicitly deferred. The boundary must be tight enough for a first implementation to ship, with later versions expanding from it.

### Core Capabilities the MVP Must Deliver

Per the project log and the strategic direction from the runtime-layer-vision flow (2026-03-26):

- **Automated context injection** — when a session starts for a role, the runtime loads that role's required documents programmatically. The agent does not read a required-reading list and confirm; it begins with context already present.
- **Automated session orchestration** — when an agent produces a machine-readable handoff block (per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`), the runtime parses it and sets up the next session with the correct role context — replacing the human's manual session-switching and prompt-pasting loop.
- **Automated process triggers** — backward pass tool invocation at forward pass closure, plan artifact validation when plans are produced, scaffolding at initialization — without agents invoking tools as a required ritual. The runtime fires these triggers based on phase state.
- **Behavioral guidance stays in-context** — role documents are trimmed to judgment and quality standards only. All process choreography is handled by the runtime, freeing the in-context budget for behavioral guidance.

---

## Constraints

- **Technology:** TypeScript/Node.js, consistent with the tooling layer (tsx runtime, ESM). No technology change is in scope.
- **Interface model:** The runtime provides its own interface. It is not a plugin for existing editors.
- **LLM API:** The runtime calls LLM APIs directly — it is not a wrapper around an agent session started elsewhere.
- **Tooling compatibility:** The design must be compatible with and integrate with the tooling layer. Consult `$A_SOCIETY_TOOLING_PROPOSAL` for the full component specifications.
- **Path convention:** All paths referenced in the runtime implementation must use registered index variables, never hardcoded paths.
- **Handoff parsing:** The machine-readable handoff block schema is defined in `$INSTRUCTION_MACHINE_READABLE_HANDOFF`. The runtime's handoff detection must conform to that schema.

---

## Required Reading

Before producing the architecture document, read:

- `$A_SOCIETY_VISION` — "What A-Society Is" section (all four work product layers, especially the runtime layer description); "Why Roles and Workflows Exist" section
- `$A_SOCIETY_ARCHITECTURE` — runtime layer definition; tooling layer component table; architectural invariants (Layer Isolation, Boundary Respect, Portability Hard Constraint)
- `$A_SOCIETY_TOOLING_PROPOSAL` — all tooling component specifications; the TA must understand what the runtime will orchestrate
- `$A_SOCIETY_TOOLING_INVOCATION` — existing tooling component invocation model; the runtime's automatic triggers must conform to this
- `$INSTRUCTION_MACHINE_READABLE_HANDOFF` — the handoff block schema the runtime will parse
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` — the workflow governing this flow; what Phase 0 must produce and what the Owner reviews against

---

## Open Questions for the TA

These are design decisions to resolve in the Phase 0 architecture document. They do not require pre-authorization — the TA proposes; the Owner gates at Phase 0 review.

1. **LLM provider scope** — Should the MVP target a single provider (Anthropic) or be provider-agnostic from the start? Recommend a position with rationale.
2. **Session state persistence** — How is session state persisted across handoffs? File-based, in-memory, or a lightweight store? What are the tradeoffs for the MVP?
3. **Handoff detection model** — Does the runtime poll agent output for handoff blocks, or does the agent explicitly signal completion? What does this mean for the LLM API call model?
4. **Context injection scope for MVP** — Which documents does the runtime inject programmatically for each role in the MVP? Does it inject the full required reading list, or a defined subset?

---

## Gate Condition

When the architecture document is complete, return to the Owner. The Owner reviews against `$A_SOCIETY_VISION` and `$A_SOCIETY_ARCHITECTURE` for consistency and confirms compatibility with the tooling layer.

**Do not proceed to implementation planning until the Owner explicitly approves the architecture document.**

---

## TA Confirmation Required

Before beginning Phase 0 design, the Technical Architect must acknowledge this brief:

> "Brief acknowledged. Beginning Phase 0 architecture design for Runtime Orchestrator MVP."

The TA does not begin drafting until this brief has been read in full and acknowledgment is confirmed.
