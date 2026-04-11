**Subject:** Runtime Operator Surface Event Model — TA Integration Review
**Type:** Technical Architect → Owner
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`
**Reviewed against:** `03-ta-phase0-design.md`, `04-owner-phase0-approval.md`

---

## Decision

**REVISE.** The implementation lands the core design correctly: the renderer exists, the repair-ownership split is real, the stale `description` workflow repair example is gone, the operator/assistant stream separation is testable, and the runtime test suite passes end to end. However, two blocking deviations remain:

1. resumed parallel flows do not emit the approved `parallel.active_set` notice, so the operator still cannot see which nodes are active after resume without leaving the live surface
2. `orient.ts` still writes a runtime/system closure notice to `stdout`, violating the approved stderr/stdout boundary

Two additional non-blocking deviations are listed for correction in the same revision pass.

---

## Verification Performed

I verified the implementation by:

- reading the completion report at `a-society/a-docs/records/20260411-runtime-operator-surface-event-model/05-orchestration-developer-completion-report.md`
- comparing the landed code against the approved design in `a-society/a-docs/records/20260411-runtime-operator-surface-event-model/03-ta-phase0-design.md`
- running `npm test` in `a-society/runtime/`

The full runtime suite passed in review:

- unit tests
- renderer tests
- visualization tests
- observability tests
- unified-routing integration test
- framework-services suites

The review findings below are therefore design-alignment findings, not failures to compile or failures of the current automated suite.

---

## Blocking Findings

### B1 — Resume path omits the approved `parallel.active_set` live notice

The approved event model explicitly scoped `parallel.active_set` to **fork and resume boundaries**. The implementation emits it on fork in `a-society/runtime/src/orchestrator.ts:547-552`, but on resume it emits only:

- `flow.resumed` at `a-society/runtime/src/orchestrator.ts:180-181`

The emitted resume notice includes only `activeNodeCount`. It does not identify which nodes are active or which roles they belong to.

This is a blocking gap because the flow's operator-facing problem statement included parallel-track visibility, and the approved Phase 1 contract deliberately reserved inline parallel-state notices for transition boundaries. Resume is one of those boundaries. On a resumed multi-track flow, the operator currently sees only "N active node(s)" and must run `a-society flow-status` to recover the actual active set.

**Required fix:**

- On resume, when `flowRun.activeNodes.length > 1`, emit `parallel.active_set` immediately after `flow.resumed`.
- The payload must include the node IDs and roles for the currently active nodes.
- Add automated coverage for resumed multi-node state, not only fork-time activation.

### B2 — `orient.ts` still writes a runtime/system notice to `stdout`

The approved surface contract was explicit:

- runtime/system notices on `stderr`
- assistant/model text on `stdout`

One runtime/system notice still bypasses that boundary:

- `a-society/runtime/src/orient.ts:363-366`

```typescript
rl.on('close', () => {
  if (!resolved && inputStream === process.stdin && outputStream === process.stdout) {
    console.log('\nSession closed.');
  }
```

`Session closed.` is not assistant text. It is a runtime/system notice, and it is being written to `stdout`.

This is blocking because the whole point of the event-model flow was to make runtime/system output distinguishable from assistant output by design rather than convention. Leaving even one live-path runtime notice on `stdout` keeps the boundary porous.

**Required fix:**

- Remove this direct `console.log`.
- Either emit an approved operator event on `stderr` through the renderer, or drop the line entirely if it adds no real operator value.
- Add automated coverage for the closure path if the line remains as an operator-visible notice.

---

## Non-Blocking Findings

### N1 — Linear successor `role.active` is emitted twice in a full orchestrated run

The implementation emits `role.active`:

- when a node begins executing in `a-society/runtime/src/orchestrator.ts:256-266`
- again for a newly activated linear successor in `a-society/runtime/src/orchestrator.ts:485-493`

In a full `startUnifiedOrchestration()` run, this means a linear successor can receive:

1. one `handoff.applied` line
2. one `role.active` line when the predecessor hands off
3. another `role.active` line when the successor's own `advanceFlow()` begins

That is operator-noise rather than a structural break, so I am not blocking approval on it alone. But it should be corrected in the same revision pass so "active" remains a single semantic transition, not a repeated announcement.

**Preferred correction:** keep the successor activation notice at the handoff boundary and suppress the duplicate when the same node is entered immediately afterward, or collapse the two into one consistent activation rule.

### N2 — The forward-pass closure path has source coverage but not execution-path verification for the approved notice

The code does emit `flow.forward_pass_closed` in `a-society/runtime/src/orchestrator.ts:345-351`, and the renderer has a unit test for its exact string in `a-society/runtime/test/operator-renderer.test.ts`.

What is missing is an execution-path test proving that a real `forward-pass-closed` typed signal:

1. reaches the orchestrator
2. emits the approved live notice
3. does so before improvement orchestration begins

This is not blocking because the source implementation is present and the owner approval artifact did not restate this specific test as one of its six gating checks. But it is still a gap relative to the Phase 0 review expectations and should be closed in the same revision pass.

---

## Verified Correct

The following parts of the approved design are implemented correctly:

- `a-society/runtime/src/operator-renderer.ts` is the live renderer owner for operator-visible runtime/system notices.
- Providers no longer own spinner rendering directly; both provider modules thread wait-state through the renderer.
- `a-society/runtime/src/handoff.ts` now owns typed handoff repair details.
- `a-society/runtime/src/framework-services/workflow-graph-validator.ts` now owns workflow repair guidance, and the stale `description` example is removed.
- `a-society/runtime/src/triggers.ts` preserves structured workflow-validation failures instead of flattening them.
- `a-society/runtime/src/llm.ts` routes tool-call notices through the renderer instead of writing directly to `stderr`.
- `a-society/runtime/src/visualization.ts` preserves `flow-status` as the authoritative snapshot and makes `awaiting_human` explicit.
- `a-society/runtime/INVOCATION.md` accurately documents the stderr/stdout split, token strings, and `flow-status` role.
- The runtime test suite passes after implementation.

---

## Resubmission Requirements

Before resubmission, the Orchestration Developer should:

1. add `parallel.active_set` emission on resume for multi-node active state and cover it with automated tests
2. remove or reroute the `Session closed.` stdout notice so all live runtime/system notices stay off `stdout`
3. suppress duplicate `role.active` emission for linear successors in a full orchestrated run
4. add an execution-path test for `forward-pass-closed` notice emission

On resubmission, the completion record should confirm both blocking fixes explicitly and note the two non-blocking corrections as completed.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/06-ta-integration-review.md
```
