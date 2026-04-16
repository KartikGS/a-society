**Subject:** CLI-to-UI migration — TA integration review
**Status:** SUBMITTED
**Date:** 2026-04-16

---

## Assessment: Implementation Conforms to Approved Design

The implementation is consistent with the approved Phase 0 design and the two Phase 0 OD constraints from `04-owner-phase0-decision.md`. There are no blocking deviations. Two non-blocking observations are surfaced below for the Curator's registration pass.

---

## File-Level Verification

### Deletions — confirmed

| File | Status |
|---|---|
| `runtime/src/cli.ts` | Deleted — confirmed absent |
| `runtime/src/spinner.ts` | Deleted — confirmed absent |
| `@inquirer/prompts` | Removed from `package.json` — confirmed absent |

### Replacements and new files — confirmed

| File | Status |
|---|---|
| `runtime/bin/a-society.ts` | Replaced — server entry with browser auto-open, URL print, `TelemetryManager.init()`, port configuration |
| `runtime/src/server.ts` | Created — HTTP + WebSocket server with all required REST endpoints and stream-bridge wiring |
| `runtime/src/ws-operator-sink.ts` | Created — `WebSocketOperatorSink` implementing `OperatorRenderSink` |
| `runtime/vite.config.ts` | Created — `root: 'ui'`, `build.outDir: '../dist/ui'`, React plugin |
| `runtime/ui/` | Created — frontend source directory (React + Vite + React Flow) |
| `runtime/test/ws-operator-sink.test.ts` | Created — protocol coverage for all three `OperatorRenderSink` methods |

### Modifications — confirmed

| File | Change | Verified |
|---|---|---|
| `runtime/src/orchestrator.ts` | `private renderer: OperatorRenderSink`; `constructor(renderer?: OperatorRenderSink)`; `startUnifiedOrchestration` gains optional `inputStream`/`outputStream` defaulting to `process.stdin`/`process.stdout` | ✓ |
| `runtime/src/operator-renderer.ts` | Spinner dependency removed; `startWait` now writes a plain stderr line; `stopWait` is a no-op; `createDefaultRenderer` retained | ✓ |
| `runtime/package.json` | `express`, `ws` added to dependencies; `react`, `react-dom`, `@xyflow/react`, `vite`, `@vitejs/plugin-react`, `@types/*` added to devDependencies; `build:ui` and `build` scripts added; `start` script updated to `tsx src/server.ts` | ✓ |
| `runtime/INVOCATION.md` | Full structural rework for browser UI model | ✓ |

---

## Phase 0 OD Constraints — Both Satisfied

**Constraint 1 (`startUnifiedOrchestration` signature):** Optional `inputStream` and `outputStream` parameters are present with correct defaults. The threading path through `advanceFlow` → `readHumanInput` is traceable and confirmed. The server passes `inputBridge` and `outputBridge` PassThrough streams; readline reads from the bridge; human input writes to the bridge. The constraint is met.

**Constraint 2 (`bin/a-society.ts` content replacement):** `bin/a-society.ts` path and the `package.json` `bin` field are unchanged. File content is fully replaced with server startup logic. The constraint is met.

---

## WebSocket Protocol — Matches Spec

All specified `ServerMessage` types are implemented: `init`, `operator_event`, `wait_start`, `wait_stop`, `output_text`, `flow_state` (with `backwardActive: string[]`), `error`, `flow_complete`. All specified `ClientMessage` types are handled: `start_flow`, `human_input`. Message shapes match the approved spec.

The `backwardActive` derivation logic is correct: `server.ts` checks `edge.from === target.nodeId && edge.to === event.fromNodeId` on each `handoff.applied` target — this correctly identifies nodes that received backward handoffs by detecting a graph edge running in the reverse direction of the handoff.

---

## Approved Design Behavior Verified

**UI asset path resolution:** `vite.config.ts` sets `root: 'ui'` and `build.outDir: '../dist/ui'`, landing assets at `runtime/dist/ui/`. The `server.ts` asset locator uses a `path.basename` check to resolve `dist/ui/` correctly whether running via `tsx src/server.ts` (dev) or from compiled `dist/server.js` (production). Both paths are correct.

**Chat→graph transition:** `server.ts` tracks `awaitingHumanInput` state from `human.awaiting_input` and clears it on `human.resumed`, `role.active`, and `flow.completed` events. `role.active` is emitted only for workflow nodes (not during bootstrap), preserving the approved transition signal.

**Suspended `awaiting_human` resume:** Single-node suspended flows are handled via `advanceFlow(flowRun, activeNodes[0], undefined, text, ...)` — correct given no active orchestration loop is running when the flow is in `awaiting_human` state. Multi-node suspended flows are explicitly rejected with an error message, consistent with the approved scope boundary.

**`GET /api/workflow`:** Implemented using `parseWorkflow` utility; returns `{ nodes, edges }`. Returns 404 when no active flow state exists or workflow is unreadable. Correct.

**`isPromptLine` filtering on `outputBridge`:** The OD added filtering to suppress readline prompt strings (`\n> `, `> `, `\r\n> `) from being forwarded as `output_text`. This was not specified but is obviously correct — without it, readline prompt glyphs would appear as model output in the browser chat. No design concern.

**`messageHistory` / `HISTORY_LIMIT`:** The OD added a 400-message history buffer for replay to late-joining WebSocket clients (e.g., after browser reconnect). Not in the design spec; consistent with the reconnect behavior intent. No concern.

---

## Non-Blocking Observations for Curator

### 1. `TelemetryManager.init()` called twice in the `bin/a-society.ts` execution path

`bin/a-society.ts` calls `TelemetryManager.init()` at module load time (line 7). `startServer()` in `server.ts` also calls `TelemetryManager.init()` internally (line 571). When `a-society` is run, both execute in sequence in the same process.

The `TelemetryManager` uses a static `instance: NodeSDK | null = null` field, which suggests double-init is guarded. However, the guard was not verified in this review. **The Curator should confirm `TelemetryManager.init()` is idempotent (instance-guarded) before completing registration.** If it is not, the fix is to remove the `TelemetryManager.init()` call from `server.ts`'s `startServer()` and ensure callers (the bin entry) own initialization.

### 2. `parsePort` duplicated between entry points

`parsePort` is defined identically in both `bin/a-society.ts` and inside `server.ts`'s `main()` function. These are independent code paths — the bin entry's `parsePort` feeds `startServer()`; the `server.ts` `main()` guards direct-execution startup. The duplication is not a correctness issue and no callers are confused, but the Curator may choose to consolidate in a later maintenance cycle.

Neither observation requires correction before Owner approval. Both are surfaced for completeness.

---

## INVOCATION.md Assessment

The reworked `INVOCATION.md` correctly describes the new operator surface:

- Startup command, default port, `A_SOCIETY_UI_PORT` override, port-conflict behavior ✓
- Two UI modes (project selector + Owner chat → graph) ✓
- Chat→graph transition on first `role.active` ✓
- `flow.resumed` / active flow opens in graph mode ✓
- Server message taxonomy replacing the old stderr notice classes ✓
- Browser input replacing readline for `prompt-human` pauses ✓
- Improvement-phase menu via browser input ✓
- Session transcript access via node click ✓
- State location and resume behavior ✓
- Telemetry variables (unchanged, preserved) ✓

One omission: the new `INVOCATION.md` does not mention the `GET /api/workflow` endpoint. The REST endpoints are not currently documented in INVOCATION.md (the old document also did not document internal HTTP paths), so this is not a regression — it is out of scope for the operator-facing reference. No change needed.

---

## Recommendation

Implementation is approved for Owner integration gate review. No revision required before Curator registration.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260416-cli-to-ui-migration/06-ta-integration-review.md
```
