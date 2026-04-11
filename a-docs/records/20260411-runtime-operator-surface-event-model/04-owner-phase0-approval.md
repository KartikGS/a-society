**Subject:** Runtime Operator Surface Event Model — Phase 0 Approval
**Type:** Owner → Orchestration Developer
**Status:** APPROVED
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Approval

The TA Phase 0 design advisory ([`03-ta-phase0-design.md`](a-society/a-docs/records/20260411-runtime-operator-surface-event-model/03-ta-phase0-design.md)) is approved. The event taxonomy, rendering boundary, repair ownership split, and parallel-state model are directionally correct and complete enough to implement from. The decision to make the current terminal/runtime surface the Phase 1 operator surface is accepted as the design conclusion for this flow, not as a standing Owner constraint on future work.

Proceed with implementation.

---

## Required Correction

### Bootstrap-path repair notices must not say "retrying current node"

The common `repair.requested` render template in the advisory currently ends with `retrying current node`. That wording is correct only after a flow node is active.

It is not correct for pre-flow bootstrap repair paths, including:

- missing `workflow.md` after the initial Owner handoff
- workflow parse failure before flow establishment
- START-trigger workflow validation failure before any active node exists

In those cases there is no current node yet. The operator notice must therefore be context-aware.

Approved implementation rule:

- **Node-scoped repair:** keep the TA's wording, including `retrying current node`.
- **Pre-flow bootstrap repair:** use equivalent wording that does not imply an active node, for example `retrying bootstrap interaction` or `waiting for corrected bootstrap handoff`.

This is a localized correction. It does not require redesign of the repair ownership model or the event taxonomy.

---

## Implementation Scope

Implement the Phase 1 surface exactly as specified in §6 of the TA advisory, with the bootstrap repair correction above.

The approved implementation files are:

| File | Action |
|---|---|
| `a-society/runtime/src/types.ts` | modify |
| `a-society/runtime/src/operator-renderer.ts` | create |
| `a-society/runtime/src/spinner.ts` | modify |
| `a-society/runtime/src/orchestrator.ts` | modify |
| `a-society/runtime/src/orient.ts` | modify |
| `a-society/runtime/src/handoff.ts` | modify |
| `a-society/runtime/src/framework-services/workflow-graph-validator.ts` | modify |
| `a-society/runtime/src/triggers.ts` | modify |
| `a-society/runtime/src/llm.ts` | modify |
| `a-society/runtime/src/providers/anthropic.ts` | modify |
| `a-society/runtime/src/providers/openai-compatible.ts` | modify |
| `a-society/runtime/src/visualization.ts` | modify |
| `a-society/runtime/INVOCATION.md` | modify |
| `a-society/runtime/test/operator-renderer.test.ts` | create |
| `a-society/runtime/test/handoff.test.ts` | modify |
| `a-society/runtime/test/framework-services/workflow-graph-validator.test.ts` | modify |
| `a-society/runtime/test/visualization.test.ts` | modify |
| `a-society/runtime/test/integration/unified-routing.test.ts` | modify |

`a-society/runtime/src/cli.ts` is not a required Phase 1 edit unless implementation proves explicit entrypoint-level renderer threading is necessary. Treat the TA advisory's §6 table as authoritative over the earlier broad summary list.

---

## Verification Obligations

Before filing the completion report:

1. Verify the operator stream and assistant stream are captured separately in automated tests, and that assistant text does not leak into the operator stream.
2. Verify the bootstrap repair path uses the corrected non-node wording rather than `retrying current node`.
3. Verify successful linear handoff produces both a positive handoff notice and a successor `role.active` notice.
4. Verify malformed handoff repair uses validator-owned guidance only and does not retain stale hardcoded schema examples.
5. Verify `flow-status` remains the authoritative snapshot for active nodes and pending joins, with explicit `awaiting_human` state.
6. Verify `$A_SOCIETY_RUNTIME_INVOCATION` matches the shipped implementation exactly if any command wording or operator-behavior text is touched.

Return to Owner with completion report as `05-orchestration-developer-completion-report.md`.

---

## No Proposal Required

This flow has no Proposal phase. The TA advisory plus this approval artifact are the implementation gate. Implementation begins directly on receipt of this artifact.

```handoff
role: Orchestration Developer
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/04-owner-phase0-approval.md
```
