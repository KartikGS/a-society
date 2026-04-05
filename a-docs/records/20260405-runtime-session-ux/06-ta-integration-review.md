**Subject:** Runtime Session UX — TA Integration Review
**Type:** Technical Architect → Owner
**Date:** 2026-04-05
**Flow:** `20260405-runtime-session-ux`

---

## Summary

The implementation is substantially correct and complete. Three findings follow: one medium-severity spec gap that produces a silent behavioral defect in autonomous mode, and two minor INVOCATION.md deviations. One observation is noted but requires no action.

---

## Verified Against Spec

The following were checked against `03-ta-phase0-design.md` and are conformant:

- **`types.ts`**: All five additions and two replacements match the spec exactly — `TurnUsage`, `TurnOptions`, `GatewayTurnResult`, updated `ProviderTurnResult` (usage on both variants), updated `LLMProvider.executeTurn` signature, `'ABORTED'` added to `LLMGatewayError` union, `partialText?` field present.
- **`spinner.ts`**: Matches the spec implementation exactly — frames, TTY-gate on `start`, no-op `stop` guard, `\r\x1b[K` clear.
- **`anthropic.ts`**: Signal threading via second-argument RequestOptions ✓. Usage extraction from `message_start` and `message_delta` events ✓. First-token spinner stop (`if (fullText === '') spinner.stop()` before `process.stdout.write`) ✓. Spinner stop after loop for tool-call turns ✓. Abort detection before SDK error type checks ✓. `partialText` passed via `fullText || undefined` ✓.
- **`openai-compatible.ts`**: `stream_options: { include_usage: true }` unconditionally ✓. Trailing-chunk usage extraction (`!chunk.choices.length && chunk.usage`) ✓. All abort and spinner behaviors symmetric with Anthropic ✓.
- **`llm.ts`**: Return type `Promise<GatewayTurnResult>` ✓. `options?.signal?.aborted` check at round start ✓. `anyUsage` flag accumulation pattern ✓. Tool-call notification moved to `process.stderr.write` ✓.
- **`orient.ts`**: `externalSignal?: AbortSignal` parameter ✓. Session-scoped `currentController` with readline SIGINT wiring ✓. Per-turn `new AbortController()` inside `promptUser()` ✓. All three call sites destructure `{ text, usage }` ✓. ABORTED catch at all three call sites — `partialText` appended if non-empty, `[Aborted]` to stderr ✓. Interactive path resumes `promptUser()` on abort ✓. Token usage display TTY-gated ✓.
- **`orchestrator.ts`**: Per-call `AbortController` + `process.once('SIGINT', sigintHandler)` ✓. `finally` block removes listener unconditionally ✓. `controller.signal` passed as `externalSignal` ✓. Existing null-result handler (`awaiting_human` + save) unchanged ✓. `HandoffParseError`/`WorkflowError` catch unchanged ✓.
- **`bin/a-society.ts`**: `flow-status` argument check at top of `main()` ✓. `SessionStore.init()` + `loadFlowRun()` ✓.

---

## Findings

### Finding 1 — Medium: Partial text from aborted autonomous turns is not preserved in session state

**What the spec required:** §3 Session state after abort — "The user message that triggered the turn stays in history. Any partial text streamed before the interrupt is appended to history as an assistant message." This was stated as applying to both interactive and autonomous modes.

**What the implementation does:** `orient.ts` correctly appends `partialText` to its local `history` array (a `[...providedHistory]` copy). However, when the autonomous path returns `null`, `orchestrator.ts` saves `injectedHistory` — the original array passed into `runInteractiveSession`, which is unchanged. The partial text appended inside `orient.ts` exists only in the local copy and is silently discarded. `session.transcriptHistory = injectedHistory` (orchestrator line 274) never sees the update.

**How to confirm:** In `orchestrator.ts` at line 274: `session.transcriptHistory = injectedHistory`. `injectedHistory` was passed to `orient.ts` as `providedHistory`. `orient.ts` copies it at initialization (`const history = providedHistory ? [...providedHistory] : []`), so mutations to `history` inside `orient.ts` do not affect `injectedHistory` in the caller.

**Root cause:** This is a spec gap. The advisory said "session history saved" for the null-result path without accounting for the copy boundary between `orient.ts`'s local `history` and the orchestrator's `injectedHistory`. The Developer implemented the intent correctly within `orient.ts`. The defect is at the interface.

**Operator-visible impact:** On autonomous abort with a partial response in flight, the session resumes at `awaiting_human` but the model has no record of the partial response. The conversation history jumps from the user's message to the next session start without any assistant turn — the model cannot reference what it had begun to say.

**Required fix:** In `orient.ts`, do not copy `providedHistory` unconditionally. For the autonomous ABORTED path, partial text must be appended to the original `providedHistory` array (by reference) so the orchestrator's `injectedHistory` receives it. One approach: keep the local copy for normal operation; on ABORTED in the autonomous path, push `partialText` to `providedHistory` directly before returning null:

```typescript
// On ABORTED in autonomous paths:
if (error.partialText && providedHistory) {
  providedHistory.push({ role: 'assistant', content: error.partialText });
}
process.stderr.write('\n[Aborted]\n');
return null;
```

This is the minimal fix. It mutates the caller's array intentionally — the caller (`orchestrator.ts`) then saves it and the partial text persists.

---

### Finding 2 — Minor: `npm run a-society` not removed from INVOCATION.md

**What the spec required:** §7 CLI Surface Resolution — "Remove `npm run a-society` from operator docs."

**What the implementation does:** INVOCATION.md line 13 still reads: `*(Optionally you can run \`npm run a-society\` inside the runtime folder or install globally.)*`

**Problem:** `npm run start` (`tsx src/cli.ts`) is a different entry point from `bin/a-society.ts`. It prints `Available CLI commands: run, flow-status` with no args, which is not useful operator UX. Leaving this documented invites confusion. The advisory removed it explicitly to clarify that `a-society` (the bin) is the sole operator entry point.

**Required fix:** Remove line 13 from INVOCATION.md. The note about global install (`install globally`) can be retained in a different form if desired, but the `npm run a-society` alias must not be documented as an operator command.

---

### Finding 3 — Minor: `a-society flow-status` uses simplified output instead of `renderFlowStatus`

**What the spec required:** §7 — "Import `SessionStore`, `parseWorkflow`, `renderFlowStatus` (from `visualization.ts`). When `process.argv[2] === 'flow-status'`: call `SessionStore.init()`, load flow run, render and print status, return."

**What the implementation does:** `bin/a-society.ts` lines 38–48 inline a manual print of three fields: `flowId`, `status`, `activeNodes`. `renderFlowStatus` (which produces record folder path, active nodes with role labels, completed nodes, and pending joins) is not called.

**Consequence:** The `a-society flow-status` command is less informative than the spec required. Completed nodes, pending joins, and record folder path are all absent. The `renderFlowStatus` function and `parseWorkflow` are already implemented in `visualization.ts` and `orchestrator.ts` respectively — this is unused infrastructure.

**Required fix:** Replace the manual print with the `renderFlowStatus` call pattern from `cli.ts` lines 19–25:
```typescript
import { parseWorkflow } from '../src/orchestrator.js';
import { renderFlowStatus } from '../src/visualization.js';
import path from 'node:path';

// in flow-status branch:
try {
  const workflowPath = path.join(flowRun.recordFolderPath, 'workflow.md');
  const wf = parseWorkflow(workflowPath).workflow;
  console.log(renderFlowStatus(flowRun, wf));
} catch (err: any) {
  console.log(`Status: ${flowRun.status}\n(Workflow graph unavailable: ${err.message})`);
}
```

---

## Observation — Spinner start timing (no action required)

Both providers call `spinner.start()` before message conversion (synchronous array mapping), not immediately before `client.messages.create()` as specified. Message conversion is fast and synchronous — the deviation is imperceptible in practice and the spinner provides the correct UX behavior. No change required.

---

## Conclusion

Findings 1, 2, and 3 require fixes before this integration is considered complete. Finding 1 is the most significant: it silently breaks the partial-text preservation guarantee for autonomous aborts. Findings 2 and 3 are documentation and output completeness gaps. All three fixes are small and bounded.

Returning to Owner for disposition.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260405-runtime-session-ux/06-ta-integration-review.md
```
