# Backward Pass Findings: Owner — 20260411-runtime-operator-surface-event-model

**Date:** 2026-04-11
**Task Reference:** 20260411-runtime-operator-surface-event-model
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information

- **Cross-subsystem acceptance coverage crossed into improvement orchestration without a named seam contract.** In `07-owner-integration-corrections.md`, I required one execution-path test proving that a real `forward-pass-closed` signal emits the approved operator notice before improvement orchestration begins. That was the right behavioral requirement, but neither `03-ta-phase0-design.md` nor `04-owner-phase0-approval.md` documented what the downstream improvement seam expects once `ImprovementOrchestrator.handleForwardPassClosure()` begins: it reads from `inputStream`, writes the prompt to `outputStream`, and blocks for a menu choice. `14-orchestration-developer-findings.md` confirms the implementation team had to reverse-engineer that from source. The root cause is that the design and approval treated `flow.forward_pass_closed` as the end of the local operator-surface boundary while still requiring proof from behavior beyond that boundary. If acceptance crosses the subsystem boundary, the seam contract has to be named.

### Unclear Instructions

- **Phase 0 event-render approval was too template-oriented for an event family that spans multiple lifecycle states.** In `04-owner-phase0-approval.md`, I had to correct the approved `repair.requested` wording because `retrying current node` was valid only after node activation, not during bootstrap repair paths before any node exists. The TA advisory already modeled `scope`, but the rendered rule was still written as one global template. The root cause is that the advisory/approval loop did not force a scope-by-scope render sanity check for event kinds that span bootstrap and in-flow states. The error was caught before implementation, which is good, but it still means the design contract as written was not precise enough on its own.

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction

- **The operator-surface contract was strict in prose, but not operationalized as a required audit sweep.** At `07-owner-integration-corrections.md`, I had to block the first integration pass on two contract deviations that survived implementation and TA review: resumed multi-node flows did not emit `parallel.active_set`, and `orient.ts` still wrote a runtime/system notice to `stdout`. Later, `10-owner-integration-approval.md` had to carry a non-blocking residual `console.warn(...)` deviation on the project-root mismatch edge path. The root cause is that the flow expressed a new cross-cutting invariant, but treated it mainly as a list of additions to implement rather than as a mandatory audit of touched files and execution paths against the invariant. Owner review became the first place where the contract was re-applied holistically to live source rather than locally to the named edits.

### Role File Gaps

- **Owner integration-gate review still lacks a standing executable contract-review aid.** To decide `07-owner-integration-corrections.md` and `10-owner-integration-approval.md`, I had to compare the approved design, live runtime source, operator-facing docs, and execution-path tests directly, and then decide which deviations were blocking versus acceptable. `a-society/a-docs/roles/owner/ta-advisory-review.md` helps with Phase 0 review, but there is no equivalent Owner-side support surface for executable integration gates. Missing guidance includes: the evidence hierarchy when TA recommends approval, when a documented deviation is acceptable, how to treat legacy-path violations of a new invariant, and when production-path verification is required instead of unit or synthetic coverage. This was already visible in `runtime-observability-foundation`; this flow confirms the gap is still standing.

---

## a-docs Structure Check Notes

- [x] **agents.md scope:** No `agents.md` scope drift surfaced in this flow.
- [x] **role document scope:** No role-document phase leakage surfaced in the reviewed artifacts.
- [x] **JIT delivery:** The workflow surfaced the needed Owner support docs at the right points for intake, closure, and log handling.
- [x] **redundancy:** No required-reading redundancy issue surfaced during this flow.
- [x] **consolidation risk:** The operator-surface documentation updates stayed appropriately split between `runtime/INVOCATION.md`, the indexes, and `$A_SOCIETY_AGENT_DOCS_GUIDE`.
- [x] **orphans:** No orphaned a-docs artifact or support document surfaced in the reviewed record.
- [x] **index accuracy:** No broken `$VAR` resolution issue surfaced during the forward pass or closure review.
- [x] **structural drift:** No a-docs structural drift was introduced by this flow.

---

## Top Findings (Ranked)

1. **Owner integration-gate review still lacks a standing contract-review procedure for executable/operator-surface flows.** — `a-society/a-docs/roles/owner/ta-advisory-review.md`; executable integration-gate path exercised in `07-owner-integration-corrections.md` and `10-owner-integration-approval.md`
2. **Cross-cutting runtime invariants need mandatory audit sweeps, not only additive implementation lists.** — `03-ta-phase0-design.md`; surfaced at `07-owner-integration-corrections.md` and carried in part through `10-owner-integration-approval.md`
3. **If an acceptance test crosses a subsystem boundary, the downstream seam contract must be named explicitly.** — `03-ta-phase0-design.md`; `04-owner-phase0-approval.md`; exposed by the `forward-pass-closed` execution-path requirement
4. **Event kinds that span multiple lifecycle states need scope-conditioned render rules at Phase 0, not one global template.** — `03-ta-phase0-design.md`; corrected in `04-owner-phase0-approval.md`

---

## Framework Contribution Candidates

1. **Owner integration-gate review guidance for executable contract flows.** Add a reusable Owner-side review surface for approved-design-versus-live-implementation gates, including evidence hierarchy, deviation handling, and production-path verification rules.
2. **Legacy-path audit step for new invariants.** When a flow introduces a new cross-cutting invariant over existing executable code, require an explicit audit of touched files and relevant execution paths rather than assuming the implementation list is enough.
3. **Cross-subsystem acceptance-test seam rule.** If an approval artifact or TA advisory requires verification that passes into another subsystem, require a short interface note describing the seam contract the test harness must satisfy.
4. **Scope-conditioned event-render rule for multi-state events.** When one event kind spans bootstrap, in-flow, resume, or terminal contexts, require a render decision table or equivalent scope-specific wording in the advisory.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/16-owner-findings.md
```
