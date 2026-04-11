**Subject:** Runtime Operator Surface Event Model — Integration Gate Corrections
**Type:** Owner → Orchestration Developer
**Status:** CORRECTIONS REQUIRED
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Status

The TA integration review ([`06-ta-integration-review.md`](a-society/a-docs/records/20260411-runtime-operator-surface-event-model/06-ta-integration-review.md)) is accepted. I compared the live implementation directly against the approved design in [`03-ta-phase0-design.md`](a-society/a-docs/records/20260411-runtime-operator-surface-event-model/03-ta-phase0-design.md) and the Owner gate in [`04-owner-phase0-approval.md`](a-society/a-docs/records/20260411-runtime-operator-surface-event-model/04-owner-phase0-approval.md).

I also reran `npm test` in `a-society/runtime/` outside the sandbox because the sandbox blocked `tsx` IPC startup. The suite passes. That confirms the implementation is healthy enough to iterate on, but it does not clear the integration gate by itself.

Approval is withheld because two blocking contract deviations remain in live source:

1. resumed multi-node flows do not emit the approved `parallel.active_set` live notice
2. `orient.ts` still writes a runtime/system notice to `stdout`

Address both blocking issues and the two cleanup items below in one revision pass before resubmitting.

---

## Required Correction 1 — Emit `parallel.active_set` on resume

**File:** `a-society/runtime/src/orchestrator.ts`

**Problem:** The approved design scoped `parallel.active_set` to fork and resume boundaries. The live resume path emits only:

```typescript
this.renderer.emit({ kind: 'flow.resumed', flowId: flowRun.flowId, activeNodeCount: flowRun.activeNodes.length });
```

This tells the operator that multiple nodes are active, but not which nodes or roles they are. That leaves resumed parallel-state visibility incomplete unless the operator leaves the live surface and runs `a-society flow-status`.

**Fix:** Immediately after `flow.resumed`, when `flowRun.activeNodes.length > 1`, emit `parallel.active_set` with the active node IDs and their roles. Use the same role-resolution logic already used in the fork path.

**Required verification:**

1. Add automated coverage for resumed multi-node state, not only fork-time activation.
2. Confirm the operator stream includes both the resume notice and the `parallel.active_set` notice for a resumed multi-node flow.

---

## Required Correction 2 — Remove the `stdout` runtime notice from `orient.ts`

**File:** `a-society/runtime/src/orient.ts`

**Problem:** The approved surface contract is explicit: runtime/system notices on `stderr`, assistant/model text on `stdout`. The live interactive close handler still writes:

```typescript
console.log('\nSession closed.');
```

That is a runtime/system notice on `stdout`.

**Fix:** Remove this direct `console.log`. Either:

1. drop the line entirely, or
2. reroute it through the operator renderer on `stderr` if you can justify its operator value within the approved event taxonomy

Do not leave any live-path runtime/system notice on `stdout`.

**Required verification:**

1. Add coverage for the close/suspension path if an operator-visible notice remains.
2. Confirm assistant output remains the only live content written to `stdout`.

---

## Required Correction 3 — Suppress duplicate `role.active` emission for linear successors

**File:** `a-society/runtime/src/orchestrator.ts`

**Problem:** A linear successor currently receives `role.active`:

1. once at the handoff boundary in `applyHandoffAndAdvance()`
2. again when the successor's own `advanceFlow()` begins

That is operator noise rather than a clean activation contract.

**Fix:** Choose one activation boundary and make it authoritative for the linear case. Preferred option: keep the successor activation notice at the handoff boundary and suppress the duplicate when the same node is entered immediately afterward.

**Required verification:** Extend the integration coverage so a full linear orchestration run shows one successor `role.active` notice, not two.

---

## Required Correction 4 — Add execution-path coverage for `flow.forward_pass_closed`

**Files:** `a-society/runtime/test/integration/unified-routing.test.ts` or another execution-path integration test in `a-society/runtime/test/integration/`

**Problem:** Source and renderer coverage exist for `flow.forward_pass_closed`, but there is no execution-path test proving that a real `forward-pass-closed` typed signal:

1. reaches the orchestrator
2. emits the approved operator notice
3. does so before improvement orchestration begins

This is not the main blocker, but it should be closed in the same revision pass because the approved design explicitly made forward-pass closure part of the operator-facing contract.

**Fix:** Add one execution-path integration test that drives a real `forward-pass-closed` signal through the orchestrator and asserts the operator stream contains the approved notice in the expected sequence.

---

## Verification After Fixing

Before resubmitting:

1. Run `npm test` in `a-society/runtime/`.
2. Confirm resumed multi-node flows emit `parallel.active_set`.
3. Confirm no live runtime/system notice is written to `stdout`.
4. Confirm a full linear orchestration run emits one successor `role.active` notice, not two.
5. Confirm a real `forward-pass-closed` execution path emits the approved notice before improvement orchestration begins.

File `08-orchestration-developer-corrections-confirmed.md` summarizing the fixes and verification evidence, then return to Technical Architect for re-review.

```handoff
role: Orchestration Developer
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/07-owner-integration-corrections.md
```
