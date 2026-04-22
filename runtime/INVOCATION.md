# A-Society Runtime Invocation

This is the sole default operator-facing executable reference for A-Society. It is authored by the Orchestration Developer and registered or verified by the Curator.

---

## Startup

### `a-society`

Starts the local runtime UI server, attempts to open the browser, and prints the local URL to `stderr`.

Default URL:

`http://localhost:3000`

Override the port with:

`A_SOCIETY_UI_PORT`

Example:

```bash
export A_SOCIETY_UI_PORT=4010
a-society
```

If the selected port is already in use, the runtime prints a clear error and exits non-zero.

---

## UI Modes

The browser UI has two operator modes.

### 1. Project Selector and Owner Chat

Fresh starts open in the project selector. The selector now has three startup paths:

- Existing projects with `a-docs/`
- Existing projects without `a-docs/`
- Create a new project

Selecting a project with `a-docs/` starts the normal stored Owner draft flow.

Selecting a project without `a-docs/` or creating a new project runs scaffold first, creates a runtime-owned initialization record folder and single-node Owner workflow, injects initialization guidance as active artifacts, and then runs that stored flow.

- The runtime streams assistant text into the chat panel
- Runtime notices appear inline in the same operator feed
- Human replies are entered in the browser instead of terminal `readline`

The chat view remains active only until the first workflow node starts.

### 2. Graph Mode

The UI switches to graph mode on the first `role.active` operator event.

- The workflow graph becomes the primary surface
- Active, completed, and backward/corrective nodes are color-coded
- The live operator feed remains available beside the graph
- Human replies still use the browser input box whenever the runtime pauses for input

If the runtime starts with an already active flow state, the client opens directly in graph mode instead of showing the project selector.

---

## Operator Event Model

The browser UI replaces the old stderr/stdout split with a WebSocket event stream plus streamed assistant text.

### Server messages

- `init` — discovered projects plus current `FlowRun` state, if any
- `operator_event` — flow lifecycle, role activation, tool calls, handoffs, repair requests, human-input pauses, and token summaries
- `wait_start` / `wait_stop` — waiting for first token from the provider
- `output_text` — assistant/model text streamed as it arrives
- `flow_state` — full `FlowRun` snapshot after handoff changes, plus `backwardActive`
- `error` — non-fatal server/runtime errors
- `flow_complete` — emitted when orchestration fully completes

### Human input behavior

When the runtime emits a `type: prompt-human` handoff signal, the UI unlocks its input box. The operator replies in the browser, and the runtime resumes the same session without dropping out to a separate terminal prompt.

Improvement-phase menus use the same browser input path. Menu text appears in the operator feed; the human types the response into the same input box.

---

## Session Startup and Continuity

### Required reading is loaded once at startup

When a session begins, the runtime resolves the active role to kebab-case and loads that role's file from `a-docs/roles/<role-id>/required-readings.yaml` into the system prompt. These files are already loaded into the session at first turn. Role docs and bootstrap prompts must not instruct the model to reread those files by default.

### Stored-flow startup only

The runtime no longer bootstraps from empty orchestration state. A project must have a persisted flow before orchestration starts:

- initialized projects use a stored draft flow created by the server
- initialization runs use a stored single-node Owner flow created after scaffold

The runtime then resumes or advances that stored flow until it pauses or completes.

### Same-node `prompt-human` resume

When a `type: prompt-human` handoff pauses execution, the active role-scoped transcript is preserved. On resume at the same node, the runtime reuses that same node session and appends only the new human reply.

### Later same-role return

When the same role appears again at a later node in the same flow, the runtime reuses the same flow-scoped role session and appends a node-transition packet. The current node inputs are authoritative even though earlier discussion remains available.

### Reopened node re-entry

When a backward edge reopens a node for the same role, the runtime keeps the existing role-scoped session and appends a reopened-node packet before continuing.

### Same-role parallel activation

Concurrent same-role parallel activation is currently unsupported. The runtime rejects same-role parallel activation because it now uses one flow-scoped session per role.

---

## Session Transcript Access

In graph mode, clicking an active or completed node fetches that node's persisted role-scoped transcript and displays it in the UI.

Transcript resolution path:

1. Load the current `FlowRun`
2. Map node ID to role from the active workflow file
3. Resolve the logical session ID as `flowId__role-name`
4. Load the persisted role session from runtime state

If no session exists for the selected node, the UI reports that the transcript is unavailable.

---

## Runtime Signals

The runtime injects and consumes the machine-readable handoff contract from `$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT`.

- `type: prompt-human` pauses execution for browser-entered human input
- `type: forward-pass-closed` ends the forward pass and hands control to improvement orchestration
- `type: meta-analysis-complete` is consumed during backward-pass orchestration
- `type: backward-pass-complete` closes the backward pass after the final feedback step

When the runtime is waiting for human input, the UI keeps the current flow state and resumes the same role-scoped session after the reply is submitted.

---

## State Location and Resume

- Default state directory: `a-society/runtime/.state`
- Override: `A_SOCIETY_STATE_DIR`

The runtime persists flow state, role sessions, turn records, and trigger records in this directory.

Resume behavior is unchanged:

- Existing `FlowRun` state is read from `.state/flow.json`
- Active flows reopen in graph mode
- Role-scoped session continuity is preserved from persisted session files

---

## Telemetry and Observability

Telemetry behavior is controlled by the following environment variables:

| Variable | Default | Description |
|---|---|---|
| `A_SOCIETY_TELEMETRY_ENABLED` | `true` | Set to `false` to disable telemetry bootstrapping |
| `A_SOCIETY_OTLP_ENDPOINT` | (none) | OTLP/HTTP collector endpoint |
| `A_SOCIETY_OTLP_HEADERS` | (none) | Comma-separated key=value pairs for OTLP export headers |
| `A_SOCIETY_OTLP_METRICS_INTERVAL` | `60000` | Metrics export interval in milliseconds |
| `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE` | `false` | If `true`, capture full prompts and turns as telemetry events |
| `A_SOCIETY_ENVIRONMENT` | `production` | Sets the `deployment.environment` resource attribute |

If telemetry configuration is malformed or the SDK fails to initialize, the runtime warns on `stderr` and continues without exported telemetry.

---

## Local Collector Example

```bash
export A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318
export A_SOCIETY_OTLP_METRICS_INTERVAL=10000
```
