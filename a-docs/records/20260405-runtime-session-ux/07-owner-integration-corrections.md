**Subject:** Runtime Session UX — Integration Gate Corrections
**Type:** Owner → Runtime Developer
**Status:** CORRECTIONS REQUIRED
**Date:** 2026-04-05
**Flow:** `20260405-runtime-session-ux`

---

## Status

The TA integration review (`06-ta-integration-review.md`) identified three required fixes. All three are confirmed against the implementation. Address all three before confirming completion.

---

## Required Fix 1 — Partial text not preserved in session state on autonomous abort

**File:** `runtime/src/orient.ts`

**Problem:** `history` is a spread copy of `providedHistory` (line 38). The ABORTED handlers at the two autonomous call sites push `partialText` to `history` (the local copy). The orchestrator saves `injectedHistory` — which is the original `providedHistory` — so the partial text never reaches persisted state.

**Fix:** In the two autonomous ABORTED catch blocks (initial-turn path and history-resume path), push `partialText` to `providedHistory` directly, not only to `history`:

```typescript
// On ABORTED in autonomous paths — before return null:
if (error.partialText && providedHistory) {
  providedHistory.push({ role: 'assistant', content: error.partialText });
}
process.stderr.write('\n[Aborted]\n');
return null;
```

The interactive ABORTED path (inside `promptUser()`) is unaffected — pushing to `history` there is correct because the interactive loop continues using `history` for all subsequent turns.

---

## Required Fix 2 — `npm run a-society` still present in INVOCATION.md

**File:** `runtime/INVOCATION.md`

**Problem:** Line 13 reads: `*(Optionally you can run \`npm run a-society\` inside the runtime folder or install globally.)*`

**Fix:** Remove line 13 entirely. `a-society` (the bin command) is the sole documented operator entry point.

---

## Required Fix 3 — `a-society flow-status` does not use `renderFlowStatus`

**File:** `runtime/bin/a-society.ts`

**Problem:** The `flow-status` branch (lines 39–48) prints three fields manually. `renderFlowStatus` is not called; completed nodes, pending joins, and record folder path are absent from output.

**Fix:** Replace the manual print with the `renderFlowStatus` pattern from `cli.ts`. Add imports and update the branch:

```typescript
import { FlowOrchestrator, parseWorkflow } from '../src/orchestrator.js';
import { renderFlowStatus } from '../src/visualization.js';
import path from 'node:path';

// replace lines 39–48:
if (command === 'flow-status') {
  SessionStore.init();
  const flowRun = SessionStore.loadFlowRun();
  if (!flowRun) {
    console.log('No active flow state found in .state/flow.json');
    return;
  }
  try {
    const workflowPath = path.join(flowRun.recordFolderPath, 'workflow.md');
    const wf = parseWorkflow(workflowPath).workflow;
    console.log(renderFlowStatus(flowRun, wf));
  } catch (err: any) {
    console.log(`Status: ${flowRun.status}\n(Workflow graph unavailable: ${err.message})`);
  }
  return;
}
```

Note: `FlowOrchestrator` is already imported. Add `parseWorkflow` to that import. Add `renderFlowStatus` import. Add `path` import if not already present.

---

## Verification After Fixing

After applying all three fixes, confirm:

1. TypeScript compiles cleanly across `runtime/` with no new errors.
2. On an autonomous abort with partial text in flight, `SessionStore.loadFlowRun()` after restart shows the partial assistant message in `transcriptHistory`.
3. `a-society flow-status` output includes record folder path, active nodes with role labels, completed nodes, and pending joins (where applicable).
4. INVOCATION.md line 13 is absent.

File `08-runtime-developer-corrections-confirmed.md` confirming all four verification points are met. Return to Owner.
