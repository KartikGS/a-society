---
type: owner-workflow-plan
date: "2026-04-11"
complexity:
  domain_spread: elevated
  shared_artifact_impact: high
  step_dependency: high
  reversibility: high
  scope_size: high
tier: 3
path:
  - Owner
  - Technical Architect
  - Owner
  - Orchestration Developer
  - Technical Architect
  - Owner
  - Curator
  - Owner
  - Curator
  - Owner
known_unknowns:
  - "Continuity model: how same-role returns later in one live flow should regain context when there is a single active node for that role; same-role parallel continuity is explicitly deferred from this flow"
  - "Task-input delivery model: whether active node artifacts should move out of `buildContextBundle(...)` and be appended as a user message at node entry instead"
  - "Startup prompt contract: what the runtime should say about already-injected required reading, and how the Owner-specific bootstrap prompt is triggered without relying on `history.length === 0` alone"
  - "Documentation alignment scope: which A-Society role/workflow surfaces must change to stop encouraging rereads of already-injected authority files, and whether any reusable `general/` counterpart should also change"
  - "Persistence boundary: whether the chosen continuity model requires new persisted state, version migration, or resume-time derivation from existing transcripts/artifacts"
---

**Subject:** Startup context-read timing and same-role session continuity
**Type:** Owner Workflow Plan
**Date:** 2026-04-11

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Crosses executable orchestration and A-Society framework guidance: runtime startup/session behavior plus A-Society role/workflow wording | elevated |
| **2. Shared artifact impact** | Touches the session-start contract for runtime-managed flows, persisted session behavior, and Owner-facing guidance that shapes how injected authority files are used | high |
| **3. Step dependency** | High — the TA must define one coherent startup/continuity model before runtime changes or framework-guidance alignment can proceed safely | high |
| **4. Reversibility** | High — changing session continuity and startup-read semantics affects persisted runtime behavior, role expectations, and future workflow ergonomics | high |
| **5. Scope size** | High — likely touches runtime orchestration, context injection/persistence, operator reference text, A-Society Owner guidance, and possibly reusable Owner wording | high |

**Verdict:** Tier 3 — multi-domain flow. The work combines an executable session-model decision with companion framework-guidance alignment, and the continuity tradeoff is architecture-sensitive enough to require a TA design gate before implementation.

---

## Routing Decision

Tier 3 via the multi-domain development pattern: Executable Dev structure for the runtime behavior change, followed by a Framework Dev-style Curator proposal/approval/implementation loop for the companion guidance updates.

The TA Phase 0 design gate is mandatory. The current runtime behavior is not an incidental string issue:

- `ContextInjectionService.buildContextBundle(...)` injects required reading before the first turn
- `runInteractiveSession(...)` still seeds a fresh Owner session with a prompt that says "Read the project log in your context..."
- `FlowOrchestrator.advanceFlow(...)` stores session continuity by `flowId__nodeId`, so the same role returning at a later node gets a fresh transcript history
- A-Society's Owner role still contains startup wording that can encourage rereading an already injected workflow surface

Those pieces must be redesigned together, not patched independently.

Human direction narrows the scope further: same-role parallel continuity is **not** part of this flow. The design should target the common case where a role returns later in the same flow and is the only active node for that role. If the runtime later needs multiple concurrent nodes with the same role, that becomes a separate design problem rather than something solved opportunistically here.

**Merge assessment:** no merge. The selected Next Priorities item still targets a distinct design area from the remaining open items in `$A_SOCIETY_LOG`. `Owner integration-gate review and Curator registration-boundary guidance` is adjacent only at the Owner-surface level; it does not target startup-read timing, already-injected authority-file usage, or same-role continuity behavior.

---

## Path Definition

1. **Owner** — Intake complete: confirm no merge, create the record folder and `workflow.md`, and issue the TA Phase 0 brief.
2. **Technical Architect** — Phase 0 design: define the Owner-specific startup context contract, same-role continuity model for the single-active-role case, task-input delivery model, persistence boundary, doc-side alignment surfaces, files-changed table, and verification expectations.
3. **Owner** — Phase 0 gate: review the TA design against the runtime's parallel-track isolation requirements and the framework's progressive-context rules.
4. **Orchestration Developer** — Implementation: apply the approved runtime startup/continuity design in `a-society/runtime/`, including any required operator-reference changes owned by that role.
5. **Technical Architect** — Integration review: confirm that the implementation matches the approved startup and continuity contract, including same-role return behavior and parallel-track isolation.
6. **Owner** — Integration gate.
7. **Curator** — Proposal: draft the required A-Society guidance changes and identify whether any reusable `general/` counterpart changes are warranted by the approved runtime contract.
8. **Owner** — Curator approval.
9. **Curator** — Implementation/registration: apply the approved framework-guidance changes and registration updates.
10. **Owner** — Forward pass closure.

---

## Known Unknowns

- Continuity model: how same-role returns within one live flow should regain context when there is a single active node for that role. Same-role parallel continuity is explicitly deferred from this flow.
- Task-input delivery model: whether active node artifacts should move out of `buildContextBundle(...)` and be appended as a user message at node entry instead.
- Startup prompt contract: what the runtime should say about already-injected required reading, and how the Owner-specific bootstrap prompt is triggered without relying on `history.length === 0` alone.
- Documentation alignment scope: which A-Society role/workflow surfaces must change to stop encouraging rereads of already-injected authority files, and whether any reusable `general/` counterpart should also change.
- Persistence boundary: whether the chosen continuity model requires new persisted state, version migration, or resume-time derivation from existing transcripts/artifacts.
