---
type: owner-workflow-plan
date: "2026-04-02"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: elevated
  reversibility: low
  scope_size: high
tier: 3
path:
  - Owner - Intake & Briefing
  - Technical Architect - Runtime Design Advisory
  - Owner - TA Review
  - Tooling Developer - Component 4 Parallel-Flow Fix
  - Runtime Developer - Orchestrator Parallel Track Support
  - Owner - Convergence Review
  - Curator - Documentation & Registration
  - Owner - Curator Approval
  - Curator - Implementation
  - Owner - Forward Pass Closure
known_unknowns:
  - "Exact join-tracking data structure (activeNodes + completedNodes vs. a more sophisticated model) — TA to determine in advisory"
  - "Whether the handoff parser should accept both single-object and array forms in one parse call, or whether the orchestrator normalizes — TA to specify"
  - "How the orchestrator presents multiple input artifacts to a join node (multiple activeArtifactPath values vs. concatenation) — TA to specify"
  - "Whether Component 4 outputs concurrent groups as nested arrays or a separate grouping structure — Tooling Developer to determine from TA spec"
  - "Tier 1 visualization scope — whether it belongs in this flow or is deferred — Owner to decide at convergence"
---

**Subject:** Parallel Track Orchestration — Runtime, Tooling, and Schema
**Type:** Owner Workflow Plan
**Date:** 2026-04-02

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches three layers: runtime (`runtime/src/`), tooling (`tooling/src/`), and framework documentation (`general/instructions/`, `a-docs/records/`, `a-docs/communication/`) | high |
| **2. Shared artifact impact** | Modifies the machine-readable handoff schema (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`) — a public contract consumed by all adopting projects. Modifies `$A_SOCIETY_RECORDS` (parallel sub-labeling formalization). Changes `FlowRun` type and orchestrator routing logic — the core runtime data model. | high |
| **3. Step dependency** | The TA advisory must precede both implementation tracks. The Tooling Developer's Component 4 fix and the Runtime Developer's orchestrator changes are independent of each other but both depend on design decisions in the advisory. The Curator documentation track depends on implementation completion. | elevated |
| **4. Reversibility** | The handoff schema change is a breaking change for any orchestrator or validator consuming the current single-object format. `FlowRun` type changes affect all runtime consumers. Component 4 output format change affects backward pass ordering. Low reversibility across all three layers. | low |
| **5. Scope size** | Runtime: `types.ts`, `orchestrator.ts`, `handoff.ts`, `triggers.ts`, tests. Tooling: `backward-pass-orderer.ts`, tests. Documentation: `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, `$A_SOCIETY_RECORDS`, `$A_SOCIETY_ARCHITECTURE`, invocation docs. Estimated 10+ files across 3+ roles. | high |

**Verdict:** Tier 3 — Four of five axes are high. This is a structural redesign of how the runtime handles workflow execution, paired with a breaking schema change and a tooling correctness fix. Full pipeline required.

---

## Routing Decision

Tier 3 via multi-domain development pattern (`$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`). The work spans three implementation domains (runtime, tooling, framework documentation) with parallel independent tracks after the TA design phase. A single flow with parallel tracks after the TA advisory, converging at Owner review before Curator documentation.

---

## Path Definition

1. **Owner** — Intake & briefing. Produce workflow plan, `workflow.md`, and Owner-to-TA/Developer brief.
2. **Technical Architect** — Runtime design advisory covering: `FlowRun` type redesign (`activeNodes`/`completedNodes`), fork/join detection algorithm, handoff schema array extension, orchestrator `advanceFlow` restructuring, join-node artifact aggregation, and Component 4 concurrent-group output format. Single advisory covering both runtime and tooling tracks.
3. **Owner** — TA review. Approve or revise the advisory.
4. **Tooling Developer** *(parallel track A)* — Component 4 fix: graph-aware backward pass traversal with concurrent group output. Absorbs the existing "Component 4 parallel-flow correctness bundle" Next Priorities item.
5. **Runtime Developer** *(parallel track B)* — Orchestrator parallel track support: `FlowRun` type changes, fork/join detection, multi-handoff parsing, join convergence buffering, Tier 1 text visualization.
6. **Owner** — Convergence review. Verify both tracks complete and internally consistent.
7. **Curator** — Proposal for documentation changes: `$INSTRUCTION_MACHINE_READABLE_HANDOFF` schema update, `$A_SOCIETY_RECORDS` parallel sub-labeling formalization, `$A_SOCIETY_ARCHITECTURE` Component 4 description update, invocation docs, index updates.
8. **Owner** — Curator approval gate (required: `[LIB]` scope touches `$INSTRUCTION_MACHINE_READABLE_HANDOFF`).
9. **Curator** — Implementation & registration.
10. **Owner** — Forward pass closure.

---

## Known Unknowns

- **Join-tracking data structure:** Whether `activeNodes: string[]` + `completedNodes: string[]` on `FlowRun` is sufficient, or whether a more sophisticated model (e.g., `pendingJoins` map) is needed. TA to determine in advisory.
- **Handoff parser dual-format handling:** Whether the parser accepts both single-object and array forms transparently, or whether the orchestrator normalizes the input before validation. TA to specify.
- **Join-node artifact aggregation:** When a join node activates, it has multiple input artifacts from completed tracks. How the orchestrator presents these to the LLM (multiple `activeArtifactPath` values, concatenation, or a new interface). TA to specify.
- **Component 4 concurrent-group output format:** Whether concurrent groups are nested arrays (`string[][]`), a separate `ConcurrentGroup` type, or another structure. TA/Tooling Developer to determine.
- **Tier 1 visualization scope:** Whether the text-based flow status display belongs in this flow or is deferred to a separate flow. Owner to decide at convergence based on scope creep risk.

---

## Intake Validity Sweep

**Overlapping Next Priorities item identified:**

- **`[M]` — Component 4 parallel-flow correctness bundle** — **Absorbed.** This flow's Track A (Tooling Developer) fully subsumes this item: graph-aware backward traversal and concurrent-group prompt generation are both in scope. The existing Next Priorities entry will be removed when this flow closes.

**Dependency note:**

- **`[M]` — Machine-readable handoff validator (Component 8)** — Not merged (different unit of work), but this flow changes the handoff schema that Component 8 would validate. The Component 8 item's scope note ("the validator spec should reflect the simplified two-field schema only") will need updating when this flow closes to reflect the new array-capable schema.

---

## `[LIB]` Scope

This flow carries `[LIB]` scope: `$INSTRUCTION_MACHINE_READABLE_HANDOFF` (in `general/`) will be modified to support the array handoff format. The registration loop (update report draft, version increment) is accounted for in the `workflow.md` path within the Curator phases. The brief will explicitly instruct the Curator to include an update report draft in the proposal submission.
