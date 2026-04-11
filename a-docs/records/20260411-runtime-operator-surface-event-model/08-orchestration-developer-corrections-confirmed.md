**Subject:** Runtime Operator Surface Event Model — Corrections Confirmed
**Type:** Orchestration Developer → Technical Architect
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Status

All four corrections from the Owner integration gate (`07-owner-integration-corrections.md`) are implemented and verified. All tests pass with zero failures.

---

## Corrections Applied

### Correction 1 — Emit `parallel.active_set` on resume

**File:** `a-society/runtime/src/orchestrator.ts`

After the `flow.resumed` emit in `startUnifiedOrchestration`, when `flowRun.activeNodes.length > 1`, the resume path now parses the workflow and emits `parallel.active_set` with the active node IDs and their roles. Parse failure is caught and suppressed so a workflow read error on resume cannot block the flow.

```typescript
if (flowRun.activeNodes.length > 1) {
  try {
    const resumeWf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
    const activeNodes = flowRun.activeNodes.map(id => {
      const node = resumeWf.nodes.find((n: any) => n.id === id);
      return { nodeId: id, role: node?.role ?? '' };
    });
    this.renderer.emit({ kind: 'parallel.active_set', activeNodes });
  } catch (_) {
    // workflow unreadable on resume — skip parallel notice
  }
}
```

**Verification:** New integration test `test/integration/resume-parallel.test.ts`. Pre-saves a flow with `activeNodes: ['branch-a', 'branch-b']` and `status: 'awaiting_human'` (so the while loop is skipped, exercising only the resume emit path). Asserts both `[runtime/flow] Resuming flow` and `[runtime/parallel] Active nodes:` appear in the operator stream, with the resume notice preceding the parallel notice.

---

### Correction 2 — Remove `stdout` runtime notice from `orient.ts`

**File:** `a-society/runtime/src/orient.ts`

The `console.log('\nSession closed.')` inside `rl.on('close', ...)` was removed entirely. It was a runtime/system notice written to `stdout`, violating the approved surface contract. No replacement event is warranted — session close in the interactive path is not a meaningful operator-facing signal under the approved taxonomy.

---

### Correction 3 — Suppress duplicate `role.active` for linear successors

**File:** `a-society/runtime/src/orchestrator.ts`

Added `private pendingRoleActiveEmitted = new Set<string>()` to `FlowOrchestrator`.

In `applyHandoffAndAdvance` (linear path), after emitting `role.active` for the successor at the handoff boundary, the successor's nodeId is added to `pendingRoleActiveEmitted`.

In `advanceFlow`, before emitting `role.active`, the set is checked. If the nodeId is present, the emit is skipped. The entry is deleted from the set unconditionally so the first subsequent entry into the same node ID emits normally.

This keeps the handoff boundary as the authoritative activation moment for linear successors, while `advanceFlow` remains the authoritative source for the initial node and for fork branches (which `applyHandoffAndAdvance` does not emit `role.active` for — only `parallel.active_set`).

**Verification:** New integration test `test/integration/linear-role-active.test.ts`. Calls `advanceFlow('start')` (which handoffs to 'next' and emits `role.active` for 'next' at the handoff boundary), then calls `advanceFlow('next')` (which enters the node and suppresses the duplicate). Counts `[runtime/role] Active: next` occurrences in the operator stream and asserts exactly 1.

---

### Correction 4 — Execution-path coverage for `flow.forward_pass_closed`

**File:** `a-society/runtime/test/integration/forward-pass-closure.test.ts` (created)

A new execution-path integration test drives a real `forward-pass-closed` typed signal through `advanceFlow`. The mock server returns a valid `forward-pass-closed` handoff block on turn 1. The `inputStream` has `"3\n"` pre-written so `ImprovementOrchestrator.handleForwardPassClosure` reads the "no improvement" selection immediately.

The test asserts:
1. The operator stream contains `[runtime/flow] Forward pass closed via closure-artifact.md; starting improvement phase`.
2. The output stream contains the improvement orchestrator prompt (`"Forward pass complete"`), confirming the improvement path was entered.
3. The `flow.forward_pass_closed` emit precedes `ImprovementOrchestrator.handleForwardPassClosure` structurally (the emit call in `orchestrator.ts` is the line immediately before the `await` call).
4. The flow is `completed` after the no-improvement selection.

---

## Test Results

All test suites pass with zero failures.

```
types:                        1 passed
context-injection:            2 passed
handoff-interpreter:         13 passed
operator-renderer:           25 passed
visualization:                5 passed
observability:                5 passed
integration (unified-routing): PASSED
integration (resume-parallel): PASSED
integration (linear-role-active): PASSED
integration (forward-pass-closure): PASSED
utils:                        7 passed
path-validator:               9 passed
version-comparator:          14 passed
consent-utility:             18 passed
workflow-graph-validator:    25 passed
backward-pass-orderer:        7 passed
scaffolding-system:          27 passed
framework integration:       18 passed
```

---

## Verification Checklist

1. **Resumed multi-node flows emit `parallel.active_set`.**
   Confirmed by `resume-parallel.test.ts`: operator stream contains both `flow.resumed` and `parallel.active_set` in order for a resumed two-node flow.

2. **No live runtime/system notice on `stdout`.**
   `console.log('\nSession closed.')` removed. No live-path emit routes to `stdout`.

3. **Full linear orchestration run emits one successor `role.active` notice, not two.**
   Confirmed by `linear-role-active.test.ts`: count of `[runtime/role] Active: next` is exactly 1 across both `advanceFlow` calls.

4. **Real `forward-pass-closed` execution path emits the approved notice before improvement orchestration begins.**
   Confirmed by `forward-pass-closure.test.ts`: operator stream has the notice; output stream has the improvement prompt; flow reaches `completed`.

```handoff
role: Technical Architect
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/08-orchestration-developer-corrections-confirmed.md
```
