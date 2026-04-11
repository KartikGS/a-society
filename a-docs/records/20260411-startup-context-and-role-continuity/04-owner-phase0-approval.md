**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — Phase 0 Approval
**Type:** Owner → Orchestration Developer
**Status:** APPROVED
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Approval

The TA Phase 0 design advisory ([`03-ta-phase0-design.md`](a-society/a-docs/records/20260411-startup-context-and-role-continuity/03-ta-phase0-design.md)) is approved.

The core design decisions are correct and sufficiently specified to implement from:

- stable runtime-owned authority stays in the system bundle
- Owner bootstrap behavior becomes explicit and caller-owned
- task-scoped node inputs move out of `buildContextBundle(...)` and into node-entry user input
- same-node continuity remains transcript-based
- same-role later-node continuity becomes a compact carried-forward ledger rather than full transcript reuse

The human-directed scope narrowing is also correctly preserved: this flow does **not** attempt to design same-role parallel continuity. When that case appears, explicit isolation remains the approved behavior for now.

Proceed with implementation.

---

## Implementation Scope

Implement the runtime-owned slice from §8 of the advisory.

The approved implementation files for the **Orchestration Developer** are:

| File | Action |
|---|---|
| `a-society/runtime/src/injection.ts` | modify |
| `a-society/runtime/src/orient.ts` | modify |
| `a-society/runtime/src/orchestrator.ts` | modify |
| `a-society/runtime/src/types.ts` | modify |
| `a-society/runtime/src/store.ts` | modify |
| `a-society/runtime/src/improvement.ts` | modify |
| `a-society/runtime/src/session-entry.ts` | create |
| `a-society/runtime/INVOCATION.md` | modify |
| `a-society/runtime/test/context-injection.test.ts` | modify |
| `a-society/runtime/test/observability.test.ts` | modify |
| `a-society/runtime/test/session-entry.test.ts` | create |
| `a-society/runtime/test/integration/same-role-continuity.test.ts` | create |
| `a-society/runtime/test/invocation-doc.test.ts` | create |

The following approved design consequences are **not** part of the Orchestration Developer's write scope in this phase. They remain downstream Curator-managed work later in this same flow:

| File | Owner |
|---|---|
| `a-society/a-docs/roles/owner.md` | Curator |
| `a-society/general/instructions/roles/required-readings.md` | Curator |

`a-society/general/roles/owner.md` was assessed by the TA and requires no change in this flow.

---

## Required Constraints

1. Keep node-scoped session keys exactly as `${flowId}__${nodeId}`.
2. Do not implement shared same-role parallel continuity. If another active node has the same `roleKey`, suppress the continuity summary and keep isolation.
3. Remove active artifact injection from `buildContextBundle(...)`; task inputs belong in node-entry user messages.
4. Remove the generic empty-history bootstrap behavior from `runInteractiveSession(...)`. Owner bootstrap prompting must be caller-owned from the orchestration bootstrap path.
5. Apply the same stable-context-vs-task-input boundary to improvement sessions, not only forward-pass node entry.
6. Update `$A_SOCIETY_RUNTIME_INVOCATION` in the same pass so the operator-facing contract matches the shipped behavior.

---

## Verification Obligations

Before filing the completion report:

1. Verify the system bundle contains only stable runtime-owned context plus required-reading files, uses the approved already-loaded framing, and does not include active artifact content.
2. Verify the fresh Owner bootstrap path uses the explicit Owner message from `session-entry.ts`, not a generic empty-history branch in `orient.ts`.
3. Verify same-node `prompt-human` resume reuses the existing node-scoped transcript and does not regenerate the node-entry packet.
4. Verify a later same-role node receives the non-startup node-entry framing, the continuity summary when safe, and the current node artifact content as user-message input.
5. Verify active node artifacts, improvement instruction files, and findings files are delivered as user input rather than part of the system-prompt bundle.
6. Verify same-role parallel activation remains isolated: no shared transcript reuse and no continuity summary injection when another active node has the same role.
7. Verify `a-society/runtime/INVOCATION.md` matches the implemented startup/resume semantics exactly.

The completion report must follow the standing completion-report structure from `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`.

---

## No Proposal Required

This phase has no Proposal node. The TA advisory plus this approval artifact are the implementation gate. Runtime implementation begins directly on receipt of this artifact.

```handoff
role: Orchestration Developer
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/04-owner-phase0-approval.md
```
