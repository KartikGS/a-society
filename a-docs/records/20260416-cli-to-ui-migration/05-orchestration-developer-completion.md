**Subject:** CLI-to-UI migration — Orchestration Developer completion
**Type:** Orchestration Developer → Owner
**Date:** 2026-04-16
**Flow:** `20260416-cli-to-ui-migration`

---

## Modified Files

| File | Action | Notes |
|---|---|---|
| `a-society/runtime/src/server.ts` | created | Added the HTTP + WebSocket runtime server, REST endpoints, stream-bridge orchestration wiring, flow-state sync, transcript lookup, and resume handling |
| `a-society/runtime/src/ws-operator-sink.ts` | created | Added `WebSocketOperatorSink` implementing `OperatorRenderSink` for the UI protocol |
| `a-society/runtime/ui/index.html` | created | SPA entry HTML |
| `a-society/runtime/ui/src/main.tsx` | created | React mount point |
| `a-society/runtime/ui/src/App.tsx` | created | UI state orchestration: selector/chat/graph modes, WebSocket handling, transcript fetch, operator feed, and browser input flow |
| `a-society/runtime/ui/src/types.ts` | created | Frontend protocol and state typings |
| `a-society/runtime/ui/src/hooks/useWebSocket.ts` | created | Reconnecting WebSocket client hook |
| `a-society/runtime/ui/src/components/ProjectSelector.tsx` | created | Project-selection UI |
| `a-society/runtime/ui/src/components/ChatInterface.tsx` | created | Shared operator feed + input composer surface |
| `a-society/runtime/ui/src/components/GraphView.tsx` | created | Workflow graph rendering, color mapping, and node-click handoff to transcript loading |
| `a-society/runtime/ui/src/styles.css` | created | UI styling for selector/chat/graph surfaces |
| `a-society/runtime/vite.config.ts` | created | Vite React build configuration targeting `a-society/runtime/dist/ui/` |
| `a-society/runtime/bin/a-society.ts` | replaced | Replaced the CLI selector entry point with the UI server launcher, browser auto-open attempt, and URL print |
| `a-society/runtime/src/orchestrator.ts` | modified | Widened `FlowOrchestrator` renderer type from `OperatorEventRenderer` to `OperatorRenderSink`; preserved optional `inputStream` / `outputStream` parameters |
| `a-society/runtime/src/operator-renderer.ts` | modified | Retained stderr fallback renderer while removing spinner coupling; wait notices now render as plain lines |
| `a-society/runtime/src/cli.ts` | deleted | CLI dispatcher removed per approved operator-surface replacement |
| `a-society/runtime/src/spinner.ts` | deleted | Spinner removed per approved terminal-surface retirement |
| `a-society/runtime/INVOCATION.md` | rewritten | Reworked the operator-facing reference for the browser UI model |
| `a-society/runtime/test/ws-operator-sink.test.ts` | created | Added direct protocol coverage for the new sink |
| `a-society/runtime/package.json` | modified | Added server/frontend dependencies and build scripts; removed CLI-only dependency |
| `a-society/runtime/package-lock.json` | modified | Dependency lockfile updated to match the approved package set |

---

## Implemented Behavior

- `a-society` now starts a local server, serves the built UI, attempts to open the browser, and prints the local URL.
- The server exposes:
  - `GET /api/projects`
  - `GET /api/flow-state`
  - `GET /api/workflow`
  - `GET /api/transcripts/:nodeId`
  - SPA catch-all serving `a-society/runtime/dist/ui/index.html`
- WebSocket client/server protocol implemented for:
  - `start_flow`
  - `human_input`
  - `init`
  - `operator_event`
  - `wait_start`
  - `wait_stop`
  - `output_text`
  - `flow_state`
  - `error`
  - `flow_complete`
- The browser UI now supports the approved selector/chat/graph progression:
  - Fresh start: project selector → Owner bootstrap chat → graph on first `role.active`
  - Resume: active persisted flow opens directly in graph mode
- Node-click transcript lookup is implemented against persisted role sessions.
- `GET /api/workflow` is implemented with the existing `parseWorkflow` utility.

### Stream-bridge traceability

The Phase 0 OD constraint on `startUnifiedOrchestration` is satisfied and traceable in code:

1. `a-society/runtime/src/server.ts` creates `inputBridge` and `outputBridge`
2. `a-society/runtime/src/server.ts` calls `FlowOrchestrator.startUnifiedOrchestration(..., inputBridge, outputBridge)`
3. `a-society/runtime/src/orchestrator.ts` threads those parameters into:
   - `runInteractiveSession(..., inputStream, outputStream, ...)`
   - `advanceFlow(..., inputStream, outputStream)`
   - `readHumanInput(inputStream, outputStream)`
4. Browser `human_input` messages are written to `inputBridge`
5. Assistant/output text is read from `outputBridge` and forwarded as `output_text`

Note: the optional `inputStream` / `outputStream` parameters were already present in `a-society/runtime/src/orchestrator.ts` at implementation start. The approved OD constraint is therefore met in shipped behavior, and this pass preserves that bridge path while replacing the operator surface around it.

---

## Verification Summary

- `npm install` completed successfully in `a-society/runtime/`
- `npm run build` passed
- `npm test` passed
- New protocol test passed: `a-society/runtime/test/ws-operator-sink.test.ts`
- Existing runtime suites also passed, including:
  - `a-society/runtime/test/invocation-doc.test.ts`
  - `a-society/runtime/test/operator-renderer.test.ts`
  - `a-society/runtime/test/integration/unified-routing.test.ts`
  - `a-society/runtime/test/integration/forward-pass-closure.test.ts`
  - `a-society/runtime/test/integration/same-role-continuity.test.ts`

---

## Deviations And Resolution Status

- **Phase 0 inconsistency: `startUnifiedOrchestration` signature wording vs stream-bridge usage**
  - Resolution status: resolved in implementation state already present at start of this pass
  - Result: the runtime ships with optional `inputStream` / `outputStream` parameters and the UI server now uses them as the approved bridge path
- **`OperatorEventRenderer` / `spinner.ts` disposal choice**
  - Resolution status: resolved
  - Result: `spinner.ts` deleted; `OperatorEventRenderer` retained as a debug fallback with plain stderr wait lines instead of animated spinner behavior
- **Suspended multi-node resume in the browser**
  - Resolution status: partially constrained, not widened beyond approved scope
  - Result: single-node `awaiting_human` resume is handled in the UI server; suspended multi-node resume remains explicitly rejected in the browser surface rather than improvised with undefined behavior

---

## Standing Spec / Coupling Update Assessment

- `$A_SOCIETY_RUNTIME_INVOCATION` required update: **yes**, and it has been updated in this pass
- Standing executable design docs or coupling docs requiring direct OD update in this pass: **no additional update identified**
- Curator review remains required at registration/integration gate for the rewritten operator-facing reference

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260416-cli-to-ui-migration/05-orchestration-developer-completion.md
```
