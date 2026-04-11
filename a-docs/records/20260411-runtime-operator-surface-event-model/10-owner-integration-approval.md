**Subject:** Runtime Operator Surface Event Model — Integration Approved, Curator Registration
**Type:** Owner → Curator
**Status:** APPROVED
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Integration Gate Passed

The integration gate is approved.

I reviewed the resubmission record [`08-orchestration-developer-corrections-confirmed.md`](a-society/a-docs/records/20260411-runtime-operator-surface-event-model/08-orchestration-developer-corrections-confirmed.md), the second TA integration review [`09-ta-integration-review-2.md`](a-society/a-docs/records/20260411-runtime-operator-surface-event-model/09-ta-integration-review-2.md), and the live runtime source directly.

I also reran `npm test` in `a-society/runtime/`. The suite passed in full on review. The earlier sandbox failure was environmental (`tsx` IPC listen permissions), not a product failure.

The previously blocking issues are now resolved in live source:

1. resumed multi-node flows emit `parallel.active_set`
2. the `stdout` runtime/system close notice in `orient.ts` is gone
3. duplicate linear-successor `role.active` emission is suppressed
4. forward-pass closure now has execution-path coverage

The runtime now meets the approved Phase 1 operator-surface contract closely enough to proceed to registration.

---

## Documented Deviation

One low-frequency implementation deviation remains and is accepted as non-blocking:

- `a-society/runtime/src/orchestrator.ts` still uses direct `console.warn(...)` for the "resuming flow from a different project root" warning path before a fresh session is started.

This does **not** break the approved operator-facing contract that mattered for this flow:

- it still lands on `stderr`
- it does not leak runtime/system text into `stdout`
- it does not affect the normal bootstrap, handoff, repair, human-input, or closure paths the flow was opened to fix

Do **not** treat this as a registration blocker. It is a future cleanup item for the next runtime operator-surface touch, not a reason to reopen the gate.

Also: do not "correct" operator-facing docs to make claims about strict single-renderer ownership as an internal implementation rule unless the docs already say that. Registration should reflect the shipped operator-facing behavior, not restate internal architecture aspirations.

---

## What This Flow Added

This flow establishes the first explicit operator-surface event contract for the A-Society runtime:

1. **Declared live event taxonomy** — flow, role, activity, handoff, repair, human, parallel, and usage notices rather than ad hoc runtime output.
2. **Stable output-channel split** — runtime/system notices on `stderr`; assistant/model text on `stdout`.
3. **Renderer-owned live runtime notices** — including wait/liveness, tool activity, positive handoff notices, repair summaries, token summaries, and parallel-state transition notices on the approved paths.
4. **Single-source repair guidance** — typed handoff repair details in `handoff.ts` and workflow repair guidance in `workflow-graph-validator.ts`, with the stale `description` schema example removed.
5. **Authoritative `flow-status` contract** — explicit `awaiting_human`, active nodes, completed nodes, and pending joins aligned to the live operator vocabulary.
6. **Execution-path coverage for operator behavior** — separate operator/assistant stream assertions, resumed parallel-state visibility, linear successor activation suppression, and forward-pass closure sequencing.

Primary runtime files touched by this flow include:
`runtime/src/types.ts`, `runtime/src/operator-renderer.ts`, `runtime/src/spinner.ts`, `runtime/src/orchestrator.ts`, `runtime/src/orient.ts`, `runtime/src/handoff.ts`, `runtime/src/framework-services/workflow-graph-validator.ts`, `runtime/src/triggers.ts`, `runtime/src/llm.ts`, `runtime/src/providers/anthropic.ts`, `runtime/src/providers/openai-compatible.ts`, `runtime/src/visualization.ts`, `runtime/INVOCATION.md`, and the new/updated integration and renderer tests under `runtime/test/`.

---

## Curator Registration Scope

### 1. Verify `$A_SOCIETY_RUNTIME_INVOCATION`

Read [`runtime/INVOCATION.md`](a-society/runtime/INVOCATION.md) in full and verify it matches the implemented operator-facing surface.

Confirm at minimum:

- `a-society flow-status` is described as the authoritative snapshot for active nodes and pending joins
- the `stderr` / `stdout` split is documented accurately
- the live notice classes reflect the shipped runtime behavior
- the token-unavailable strings match the implementation
- the wait-behavior notes (TTY spinner vs non-TTY one-line notice) are accurate
- the statement that Phase 1 adds no new operator-event flags or env vars remains accurate

Do not broaden the document into internal renderer architecture. The registration target is the operator-facing contract.

### 2. Verify public/internal index accuracy

Check whether the current descriptions of `$A_SOCIETY_RUNTIME_INVOCATION` in:

- [`a-society/index.md`](a-society/index.md)
- [`a-society/a-docs/indexes/main.md`](a-society/a-docs/indexes/main.md)

still adequately describe the expanded runtime invocation/operator-surface reference. Update descriptions only if they are now too narrow.

No new public or internal index rows are expected from this flow.

### 3. Verify `$A_SOCIETY_AGENT_DOCS_GUIDE`

Assess whether the runtime/operator-reference entry in [`a-society/a-docs/a-docs-guide.md`](a-society/a-docs/a-docs-guide.md) remains accurate after the operator-surface additions. Update only if the current rationale text has become incomplete or misleading.

### 4. Update report assessment

Consult `$A_SOCIETY_UPDATES_PROTOCOL` and determine whether this flow warrants a framework update report.

This flow changed runtime behavior and operator-facing runtime documentation, but did not modify `general/`. Assess accordingly rather than assuming either outcome.

### 5. Do not reopen the documented deviation

The accepted project-root mismatch warning deviation above is not a Curator registration issue. Registration should not attempt to restate it as a public operator-facing capability or convert it into a blocker.

---

## Return Artifact

Return to Owner with the next artifact in this record folder after registration is complete.

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/10-owner-integration-approval.md
```
