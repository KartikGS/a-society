**Subject:** Runtime Session UX — Phase 0 Approval
**Type:** Owner → Runtime Developer
**Status:** APPROVED
**Date:** 2026-04-05
**Flow:** `20260405-runtime-session-ux`

---

## Approval

The TA Phase 0 design advisory (`03-ta-phase0-design.md`) is approved. The design is correct and complete. The open question resolutions are sound. All four threading paths are fully specified in §4. The spinner-only approach and TTY-gating are the right calls. Proceed with implementation.

---

## Correction — Import Sources for `bin/a-society.ts`

The advisory §8 states: "Import `SessionStore`, `parseWorkflow`, `renderFlowStatus` (from `visualization.ts`)". This is incorrect — only `renderFlowStatus` comes from `visualization.ts`. The correct import sources, confirmed from the existing `cli.ts` implementation:

```typescript
import { SessionStore }             from '../src/store.js';
import { FlowOrchestrator, parseWorkflow } from '../src/orchestrator.js';
import { renderFlowStatus }         from '../src/visualization.js';
```

`FlowOrchestrator` is already imported in `bin/a-society.ts`. `parseWorkflow` and `renderFlowStatus` are additions. `SessionStore` is an addition. Use these exact import paths — do not derive from the advisory's parenthetical.

---

## Implementation Scope

Implement all files listed in §8 of the advisory:

| File | Action |
|---|---|
| `runtime/src/types.ts` | Additive + replace |
| `runtime/src/spinner.ts` | New file |
| `runtime/src/providers/anthropic.ts` | Replace |
| `runtime/src/providers/openai-compatible.ts` | Replace |
| `runtime/src/llm.ts` | Replace |
| `runtime/src/orient.ts` | Replace |
| `runtime/src/orchestrator.ts` | Replace |
| `runtime/bin/a-society.ts` | Additive |
| `runtime/INVOCATION.md` | Replace |

No changes to `runtime/src/cli.ts`.

---

## Verification Obligations

After implementation, before filing the integration record:

1. Compile the full `runtime/` module — confirm zero TypeScript errors across all modified files, including all consumers of `LLMGateway.executeTurn` (which now returns `GatewayTurnResult` instead of `string`). Any call site that expects `Promise<string>` is a type error — find and fix all of them.
2. Confirm `bin/a-society.ts flow-status` runs without error against a valid `.state/flow.json`.
3. Confirm spinner does not appear and token display does not appear when stderr is not a TTY (pipe stdout and stderr to file, verify no spinner frames or `[tokens: ...]` lines).
4. Confirm `Ctrl+C` during a model response in interactive mode prints `[Aborted]`, returns to the prompt, and does not exit the process.

Return to Owner with integration record as `05-runtime-developer-integration-record.md`.

---

## No Proposal Required

This flow has no Proposal phase. The Phase 0 advisory is the approval gate. Implementation begins directly on receipt of this artifact.
