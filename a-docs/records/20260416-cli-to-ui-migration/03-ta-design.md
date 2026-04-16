**Subject:** CLI-to-UI migration — TA executable design
**Status:** SUBMITTED
**Date:** 2026-04-16

---

## Design Summary

Replace the A-Society CLI operator entry point with a local Express/WebSocket server that serves a React browser UI. The underlying orchestration layer (`orchestrator.ts`, `improvement.ts`, `orient.ts`, and everything under `src/`) is unchanged except for one type widening in `orchestrator.ts`. The operator surface replacement is accomplished entirely through new files at the entry point and operator-surface boundary.

---

## Open Design Questions — Resolved

### Q1: UI package placement

**Decision:** Frontend source lives at `runtime/ui/` as a plain source directory — no sub-package, no nested `package.json`. Frontend build dependencies (`vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `@xyflow/react`, `@types/react`, `@types/react-dom`) are added directly to `runtime/package.json`. A `vite.config.ts` at `runtime/` governs the frontend build. Built assets land at `runtime/dist/ui/` — the same `dist/` folder that TypeScript compiles into.

**Why:** A sub-package creates a second `npm install` target and complicates how the server resolves asset paths. With this model, there is one install, one build pipeline, and the server locates assets at a predictable path relative to the compiled output:

```ts
// In dist/server.js:
const UI_DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'ui');
```

**Build pipeline addition to `package.json`:**
```json
"build:ui": "vite build --outDir dist/ui",
"build": "tsc && npm run build:ui"
```

**Dev workflow:** `npm run build:ui && npx tsx src/server.ts` (Vite dev server integration is not in scope for this flow).

---

### Q2: Chat ↔ graph transition

**Decision:** The client determines render mode from the WebSocket event stream, with two cases:

- **Fresh start:** Client begins in chat mode (project selector → Owner bootstrap chat). Transition to graph mode occurs on the first `operator_event` message where `event.kind === 'role.active'`. `role.active` is emitted only for workflow nodes, never during the Owner bootstrap phase, making it an unambiguous transition signal.

- **Resume (flow already exists):** The server sends an initial `flow_state` message containing the current `FlowRun`. If `flowRun !== null` and `flowRun.status !== 'completed'`, the client opens directly in graph mode without presenting the project selector or chat interface.

**Why not a new `OperatorEvent` kind:** `role.active` is already the correct semantic boundary — it marks "a workflow node is now executing." No new event type is needed and no event type is added. The `OperatorEvent` union in `types.ts` is not modified.

---

### Q3: Human input path — the stream bridge model

**Decision:** The server creates two `PassThrough` streams per active orchestration session:

- `inputBridge: PassThrough` — receives human text written by the server from WebSocket `human_input` messages; passed as `inputStream` to `startUnifiedOrchestration`
- `outputBridge: PassThrough` — receives all LLM/assistant text output; passed as `outputStream`; the server reads from it and sends `{ type: 'output_text', text }` WebSocket messages to the client

The existing `readHumanInput(inputStream, outputStream)` in `orchestrator.ts` uses `readline.createInterface({ input: inputStream })`. When `inputBridge` is passed as `inputStream`, readline reads lines from it. The server writes `text + '\n'` to `inputBridge` on WebSocket `human_input` messages. No changes to `readHumanInput`, `orchestrator.ts`, or `improvement.ts` are required for this mechanism.

**Improvement mode menu:** `improvement.ts` writes the menu text to `outputStream` and reads the selection via `rl.question()` on `inputStream`. Both are bridge streams in UI mode. The menu text flows to the browser as `output_text` chat messages; the user types `1`, `2`, or `3` in the chat input; the server writes the reply to `inputBridge`. No change to `improvement.ts`.

**Concurrency:** Only one orchestration session runs at a time (the runtime serializes flow execution). The server enforces this — a second `start_flow` message while one is running is rejected with an `error` message.

---

### Q4: Session transcript access

**Decision:** REST endpoint `GET /api/transcripts/:nodeId`. 

Server resolution path:
1. Load current `FlowRun` from `SessionStore.loadFlowRun()`
2. Parse the workflow file at `flowRun.recordFolderPath` to map `nodeId` → `role`
3. Compute `logicalSessionId = flowRun.flowId + '__' + role.toLowerCase().replace(/\s+/g, '-')`
4. Load the session via `SessionStore.loadRoleSession(logicalSessionId)`
5. Return `{ nodeId, role, transcript: session.transcriptHistory }` as JSON; 404 if no session exists for that node

The client fetches this endpoint when the user clicks a completed or active node in graph mode. The transcript is not pushed proactively — it is pulled on demand.

---

### Q5: Server startup and browser launch

**Decision:** The new `bin/a-society.ts` entry point:
1. Starts the HTTP server on port `process.env.A_SOCIETY_UI_PORT ?? 3000`
2. Attempts to open the browser automatically using a platform-appropriate command (`open` on macOS, `xdg-open` on Linux, `start` on Windows) via `child_process.exec` — failure to open is not fatal
3. Writes the URL to `stderr`: `[runtime/server] UI available at http://localhost:PORT`
4. On resume (existing `.state/flow.json`): same startup behavior — the client receives the flow state on first WebSocket connect and enters graph mode immediately

The server does not exit after the browser opens. It runs until the process is killed. Port-in-use errors surface as a clear stderr message and non-zero exit.

---

### Q6: INVOCATION.md scope

**Decision: Full structural rework.** The current `INVOCATION.md` is written entirely around the CLI model: `a-society` as a terminal command, stderr/stdout channel separation, a spinner, `flow-status` as a separate command, `prompt-human` as a readline pause. All of these are being replaced. An in-place update would leave the document structurally misaligned with the new operator surface.

The new `INVOCATION.md` must cover:
- Starting the server and accessing the UI
- Port configuration (`A_SOCIETY_UI_PORT`)
- Two modes: project selector / Owner chat (fresh start) and graph mode (active flow)
- How human input works in the browser (chat interface replaces readline)
- WebSocket event model (replacing stderr notice classes)
- Session transcript access via node click
- State location and resume behavior (unchanged)
- Telemetry (unchanged)

**Curator registration note:** Registration scope for this flow includes a full redraft of `INVOCATION.md`. The OD should produce a draft as part of implementation; the Curator reviews it at the integration gate.

---

## OperatorRenderSink — Confirmed with One Fix

The `OperatorRenderSink` interface in `types.ts` is **confirmed as the correct abstraction boundary**. It is not changed.

The new `WebSocketOperatorSink` class (in `src/ws-operator-sink.ts`) implements `OperatorRenderSink` and replaces `OperatorEventRenderer` as the active sink during UI sessions.

**One required fix in `orchestrator.ts`:** The `FlowOrchestrator` constructor currently types its `renderer` parameter as `OperatorEventRenderer` (the concrete class) rather than `OperatorRenderSink` (the interface):

```ts
// current — accepts only the concrete class
constructor(renderer?: OperatorEventRenderer)

// corrected — accepts any OperatorRenderSink implementation
constructor(renderer?: OperatorRenderSink)
```

The private field type also widens from `OperatorEventRenderer` to `OperatorRenderSink`. This is a type-only change — no behavior changes, no method signatures change, no callers break. `createDefaultRenderer()` returns an `OperatorEventRenderer` which satisfies the interface. This is the only change to `orchestrator.ts`.

The existing `OperatorEventRenderer` (stderr implementation) is **retained** as a debug fallback. It is not deleted. The new `WebSocketOperatorSink` is added alongside it.

---

## WebSocket Message Protocol

All messages are JSON-encoded strings. Both directions use `{ type: string, ...payload }`.

### Client → Server

```ts
type ClientMessage =
  // User selected a project on the project selector screen
  | { type: 'start_flow'; projectNamespace: string }

  // User submitted text in the chat input (human reply to prompt-human or improvement menu)
  | { type: 'human_input'; text: string }
```

### Server → Client

```ts
type ServerMessage =
  // Sent immediately on WebSocket connection — current projects and flow state
  | { type: 'init'; projects: Array<{ displayName: string; folderName: string }>; flowRun: FlowRun | null }

  // Real-time OperatorEvent forwarded verbatim from the OperatorRenderSink
  | { type: 'operator_event'; event: OperatorEvent }

  // LLM is waiting for first token from provider
  | { type: 'wait_start'; provider: string; model: string }

  // LLM first token received — dismiss spinner/wait indicator
  | { type: 'wait_stop' }

  // Chunk of LLM/assistant text output (streamed as it arrives from outputBridge)
  | { type: 'output_text'; text: string }

  // Flow state snapshot — sent after any handoff event so client graph stays in sync
  | { type: 'flow_state'; flowRun: FlowRun }

  // Non-fatal server-side error (e.g., duplicate start_flow, port already in use)
  | { type: 'error'; message: string }

  // Flow is fully complete
  | { type: 'flow_complete' }
```

**Flow state sync:** After every `handoff.applied` `OperatorEvent`, the server sends a `flow_state` message containing the latest `FlowRun`. This keeps the graph rendering in sync without polling. The client does not need to derive graph state from individual events — it re-renders from the full `FlowRun` snapshot each time.

**Backward/corrective node coloring:** `FlowRun` does not carry explicit backward-node state (constraint: schemas not changed). The server derives a `backwardActive: string[]` field and injects it into the `flow_state` message payload alongside the raw `FlowRun`. The server tracks which nodes received backward handoffs by inspecting `handoff.applied` events: when `fromNodeId` is in `flowRun.activeNodes` and any target is in `flowRun.completedNodes` (predecessor), those targets enter `backwardActive`. This tracking is server-side, ephemeral (session memory), and does not touch persistent state.

Updated `flow_state` message:
```ts
| { type: 'flow_state'; flowRun: FlowRun; backwardActive: string[] }
```

**Node color mapping (client-side):**
- `flowRun.completedNodes` → Green
- `flowRun.activeNodes` (not in `backwardActive`) → Blue
- `backwardActive` (nodes receiving corrective backward handoff) → Red
- `flowRun.activeNodes` that *sent* a backward handoff (tracked by client from preceding `handoff.applied`) → Grey
- All other nodes → White/neutral (not yet reached)

---

## REST Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | Returns `Array<{ displayName, folderName }>` from `discoverProjects()` |
| `GET` | `/api/flow-state` | Returns current `FlowRun` or `null` |
| `GET` | `/api/transcripts/:nodeId` | Returns session transcript for a node; 404 if not found |
| `GET` | `*` (catch-all) | Serves `dist/ui/index.html` (SPA client-side routing) |

Static assets served from `dist/ui/` via `express.static`.

---

## File-Level Change Map

### New Files

| File | Description |
|---|---|
| `runtime/bin/a-society.ts` (replacement) | New server entry point — starts HTTP server, attempts browser open, prints URL. Replaces deleted CLI entry point at the same path. |
| `runtime/src/server.ts` | HTTP + WebSocket server — Express app, WebSocket endpoint, stream bridge creation, REST handlers, static asset serving |
| `runtime/src/ws-operator-sink.ts` | `WebSocketOperatorSink` class implementing `OperatorRenderSink` — forwards events to the WebSocket client |
| `runtime/vite.config.ts` | Vite configuration — React plugin, `root: 'ui'`, `build.outDir: '../dist/ui'` |
| `runtime/ui/index.html` | SPA entry HTML |
| `runtime/ui/src/main.tsx` | React app mount point |
| `runtime/ui/src/App.tsx` | Root component — manages WebSocket connection, mode switching (project selector / chat / graph) |
| `runtime/ui/src/components/ProjectSelector.tsx` | Project list UI — lists discovered projects, sends `start_flow` on select |
| `runtime/ui/src/components/ChatInterface.tsx` | Chat UI — renders `output_text` stream, `operator_event` notices, and a text input for human replies |
| `runtime/ui/src/components/GraphView.tsx` | React Flow graph — renders workflow nodes with state coloring; node click loads transcript via REST |
| `runtime/ui/src/hooks/useWebSocket.ts` | WebSocket connection hook — manages connect/reconnect, message dispatch |
| `runtime/ui/src/types.ts` | Frontend TypeScript types for `ServerMessage`, `ClientMessage`, `FlowRun` (subset) |

### Modified Files

| File | Change | Reason |
|---|---|---|
| `runtime/src/orchestrator.ts` | Widen `renderer` parameter and private field from `OperatorEventRenderer` to `OperatorRenderSink` in `FlowOrchestrator` constructor | Allows `WebSocketOperatorSink` to be injected without a cast |
| `runtime/package.json` | (1) Remove `@inquirer/prompts` from `dependencies`. (2) Add `express`, `ws` to `dependencies`. (3) Add `react`, `react-dom`, `@xyflow/react`, `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `@types/ws`, `@types/express` to `devDependencies`. (4) Add `build:ui` and `build` scripts. | New server and frontend dependencies; remove CLI dependency |
| `runtime/INVOCATION.md` | Full structural rework | Document describes CLI model; new operator surface is a browser UI with fundamentally different interaction model |

### Deleted Files

| File | Reason |
|---|---|
| `runtime/bin/a-society.ts` | CLI entry point with `@inquirer/prompts` project selector — replaced by `server.ts` entry |
| `runtime/src/cli.ts` | CLI command dispatcher (`run`, `flow-status`) — superseded by HTTP server and graph view |
| `runtime/src/spinner.ts` | TTY spinner — used only by `OperatorEventRenderer`; no terminal in browser mode. `OperatorEventRenderer` is retained as a debug option but the spinner it depends on is removed; if retained as debug fallback, `OperatorEventRenderer` should use a no-op spinner or write wait notices directly to stderr without animation. |

**Note on `OperatorEventRenderer` + `spinner.ts`:** The brief states `spinner.ts` is removed. `OperatorEventRenderer` currently depends on it. Two options for the OD: (a) simplify `OperatorEventRenderer` to write `startWait`/`stopWait` as plain stderr lines without the spinner; or (b) delete both `spinner.ts` and `OperatorEventRenderer`. Decision deferred to OD — both are acceptable. The `OperatorRenderSink` interface and `WebSocketOperatorSink` are unaffected either way.

---

## Component Contracts

### `server.ts`

```ts
// Exported for testing
export function createServer(workspaceRoot: string): { app: Express; wss: WebSocketServer }

// Main entry (called from bin/a-society.ts)
export async function startServer(workspaceRoot: string, port: number): Promise<void>
```

Key responsibilities:
- Create `express` app and `http.Server`
- Mount `express.static(UI_DIST)` for frontend assets
- Register REST endpoints
- Attach `ws.WebSocketServer` to the `http.Server`
- On WebSocket connect: send `init` message, attach stream bridges if flow is resuming
- On WebSocket `start_flow`: create `inputBridge` and `outputBridge` PassThrough streams, create `WebSocketOperatorSink`, construct `FlowOrchestrator(wsSink)`, call `orchestrator.startUnifiedOrchestration(workspaceRoot, projectNamespace, 'Owner', inputBridge, outputBridge)`
- On WebSocket `human_input`: write `text + '\n'` to active `inputBridge`
- Pipe `outputBridge` → WebSocket `output_text` messages (using `outputBridge.on('data', ...)`)

### `ws-operator-sink.ts`

```ts
export class WebSocketOperatorSink implements OperatorRenderSink {
  constructor(private send: (msg: ServerMessage) => void) {}
  emit(event: OperatorEvent): void
  startWait(provider: string, model: string): void
  stopWait(): void
}
```

The `send` callback is the WebSocket's `ws.send` (pre-serialized to JSON string). The sink is constructed per-session with the specific client's send function.

### `GraphView.tsx`

Accepts:
```ts
interface GraphViewProps {
  flowRun: FlowRun;
  backwardActive: string[];
  recordFolderPath: string;      // for workflow graph fetch
  workspaceRoot: string;
  onNodeClick: (nodeId: string) => void;
}
```

Fetches the workflow YAML from the server (via `GET /api/workflow` — see below) to render the directed graph. Applies node coloring from `flowRun` and `backwardActive`.

**Additional REST endpoint needed:** `GET /api/workflow` — returns the current flow's workflow graph (nodes + edges) as JSON, parsed from the workflow YAML at `flowRun.recordFolderPath`. This was not in the brief's initial list but is required for graph rendering. Adding it to the endpoint list above.

---

## Build Pipeline — Complete

```
npm install                    # installs server + frontend deps
npm run build:ui               # vite build → dist/ui/
tsc                            # TypeScript → dist/
node dist/server.js            # production server
```

Dev mode:
```
npm run build:ui               # build frontend once
npx tsx src/server.ts          # run server with tsx (no tsc needed)
```

The `bin/a-society.ts` entry point invokes the compiled or tsx-run server. The `package.json` `bin` field (`"a-society": "./bin/a-society"`) remains unchanged — the path is the same, only the file content changes.

---

## What Does Not Change

The following files are **untouched** by this flow:

`orchestrator.ts` (one type-only line change only), `store.ts`, `types.ts` (interface unchanged), `injection.ts`, `improvement.ts`, `handoff.ts`, `orient.ts`, `llm.ts`, `observability.ts`, `paths.ts`, `registry.ts`, `session-entry.ts`, `visualization.ts`, `workflow-file.ts`, `providers/`, `tools/`, `framework-services/`

The `FlowRun` and `RoleSession` state schemas in `.state/` are not changed.

The `OperatorRenderSink` interface in `types.ts` is not changed.

`startUnifiedOrchestration`'s method signature is not changed — the server calls it with bridge streams instead of `process.stdin`/`process.stdout`.

---

## Open Items for Orchestration Developer

1. **`OperatorEventRenderer` + `spinner.ts` disposal:** The brief requires `spinner.ts` deleted. The OD should decide whether to (a) simplify `OperatorEventRenderer` to not use a spinner or (b) delete `OperatorEventRenderer` entirely. Either is acceptable. If deleting, confirm no tests depend on it directly.

2. **outputBridge streaming:** `outputBridge` is a `PassThrough` that the orchestrator writes to as the LLM streams text. The server reads from it and sends `output_text` WebSocket messages. The OD should confirm the data encoding — the orchestrator writes raw strings; the PassThrough emits `Buffer` or `string` chunks depending on encoding. Set `PassThrough({ encoding: 'utf8' })` to ensure string chunks.

3. **WebSocket lifecycle:** When the browser disconnects mid-flow, the orchestrator is still running. The OD must handle the disconnect gracefully: either abort the orchestration via `AbortController` or let it continue and reconnect on browser refresh (the `flow_state` endpoint enables resume). The design recommends the latter — the flow continues in the background, and reconnect picks up current state via the `init` message.

4. **`GET /api/workflow` endpoint:** Required for `GraphView` to render the graph. The OD implements this — parse the workflow YAML from `flowRun.recordFolderPath` using the existing `parseWorkflow` utility and return `{ nodes, edges }` as JSON.

5. **Port conflict handling:** If `A_SOCIETY_UI_PORT` is in use, the server should print a clear error and exit. The OD handles the `EADDRINUSE` error from `server.listen()`.
