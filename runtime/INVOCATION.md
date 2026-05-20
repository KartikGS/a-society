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

### Model Configuration

The runtime server can start without a model, but runtime work cannot proceed until the operator configures and activates at least one model in the Settings UI.

- Provider, model ID, base URL, and API key are configured in Settings
- The Settings modal stays open until a usable active model exists
- Environment variables in `.env` no longer select the runtime model

### Web Search Connectivity

Web search is Tavily-backed. Enabling it in Settings requires a Tavily API key, and successful tool calls require outbound HTTPS access from the runtime process to:

`https://api.tavily.com/search`

If the runtime is launched from a sandboxed command environment without network access, `web_search` calls fail with a network error even when the API key is valid. Start the runtime from a normal operator terminal, or grant network access to the runtime process before relying on web search.

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

The UI switches to graph mode on the first `role.active` operator event. `role.active` is emitted when a node is claimed and entered, not when a handoff merely makes that node ready.

- The workflow graph becomes the primary surface
- Ready, running, awaiting-human, completed, and backward/corrective nodes are color-coded
- The live operator feed remains available beside the graph
- Human replies are routed to the role/node chat that requested input

When a project has existing flow state, the client lists the project's saved records in the left pane. Selecting a record opens it as an in-app tab and scopes the URL to that active tab.

The active tab is mirrored in the URL with `project` and `flow` query parameters. Switching tabs updates those parameters; loading a URL with both parameters reopens that flow.

---

## Operator Event Model

The browser UI replaces the old stderr/stdout split with a WebSocket event stream plus streamed assistant text.

### Server messages

- `init` — discovered projects
- `flow_summaries` — saved flow records for a selected project
- `operator_event` — flow lifecycle, role activation, tool calls, handoffs, repair requests, human-input pauses, and token summaries; includes `flowRef`
- `wait_start` / `wait_stop` — waiting for first token from the provider; includes `flowRef`
- `output_text` — assistant/model text streamed as it arrives; includes `flowRef`
- `flow_state` — full `FlowRun` snapshot after handoff changes, plus `backwardActive`; includes `flowRef`
- `error` — non-fatal server/runtime errors; includes `flowRef`
- `flow_complete` — emitted when orchestration fully completes; includes `flowRef`

### Human input behavior

When the runtime emits a `type: prompt-human` handoff signal, the runtime persists that node under `awaitingHumanNodes`. The operator replies in the browser from the requesting role/node chat, and the runtime resumes the same session without dropping out to a separate terminal prompt.

If more than one role instance is awaiting input, the browser message must identify the target role instance or node.

Human replies are queued durably on the flow and consumed by that flow's single live runner. The runner drains runnable work, sleeps when no work is available, and wakes when a queued reply arrives; it does not create a second runner for the same flow just to process operator input.

When the forward pass closes, the runtime persists `status: awaiting_improvement_choice` in `flow.json`. The browser shows the improvement-mode modal from that persisted state and sends a dedicated improvement-choice message. This is runtime-level input, not a role/node `prompt-human` reply.

### Tool permission modes

The chat footer exposes three per-flow tool permission modes:

- `No Access` — permission-required tools ask each time; stored flow grants are ignored
- `Partial Access` — stored flow grants are honored: all edits if previously granted, and exact bash commands previously granted for this flow
- `Full Access` — permission-required tools run without prompting

File writes (`edit_file`, `write_file`) prompt with the target path and offer `Allow`, `Allow all edits this flow`, or `Deny`.

Bash commands prompt with the exact command and offer `Allow`, `Allow <command> this flow`, or `Deny`. Simple safe read-only commands such as `ls` do not prompt.

Permission state is stored on the active `FlowRun` as `consentState` in `flow.json`.

---

## Session Startup and Continuity

### Required reading is loaded once at startup

When a session begins, the runtime resolves the active role instance to its base role and loads that base role's file from `a-docs/roles/<base-role-id>/required-readings.yaml` into the system prompt. These files are already loaded into the session at first turn. Role docs and bootstrap prompts must not instruct the model to reread those files by default.

Role names ending in `_<number>` are separate role instances. For example, `Owner_1` and `Owner_2` both load `Owner` required readings, but they use separate runtime sessions.

### Stored-flow startup only

The runtime no longer bootstraps from empty orchestration state. A project must have a persisted flow before orchestration starts:

- initialized projects use a stored draft flow created by the server
- initialization runs use a stored single-node Owner flow created after scaffold

The runtime starts from persisted `runningNodes`. Fresh draft and initialization flows persist `owner-intake` in `runningNodes`; cold resume reuses the nodes that were already in `runningNodes` before the previous process died. The runner takes those initial running nodes, clears them from persisted state, and then claims them as live work. After those initial nodes drain, runnable work is derived from the flow state: pending human input, inbound handoffs, and visited nodes that still owe outgoing handoffs.

### Flow state scheduler fields

Forward-pass flow state persists only durable scheduler facts:

- `runningNodes` — nodes currently claimed by live runtime turns
- `awaitingHumanNodes` — nodes suspended for targeted operator input
- `pendingHumanInputs` — durable operator replies queued for the single flow runner to consume
- `receivingHandoff` / `awaitingHandoff` — durable handoff delivery and handoff suspension state

There is no persisted ready queue. At runner startup, persisted `runningNodes` are taken as initial work and cleared before live claims are made. Live operator replies wake the existing runner instead of re-entering cold-resume recovery.

### Same-node `prompt-human` resume

When a `type: prompt-human` handoff pauses execution, the active role-scoped transcript is preserved. On resume at the same node, the runtime reuses that same node session and appends only the new human reply.

### Later same-role-instance return

When the same role instance appears again at a later node in the same flow, the runtime reuses the same flow-scoped role-instance session and appends a node-transition packet. The current node inputs are authoritative even though earlier discussion remains available.

### Reopened node re-entry

When a backward edge reopens a node for the same role instance, the runtime keeps the existing role-instance-scoped session and appends a reopened-node packet before continuing.

### Same-role-instance scheduling

Concurrent execution of the same role instance is serialized because a role instance has one flow-scoped session. If multiple runnable nodes share a role instance, the runtime claims only the earliest runnable node for that role instance; later same-role-instance work remains derivable from flow state or the runner's initial-node list until that role instance is free. Distinct role instances may run in parallel, including instances that share the same base role such as `Owner_1` and `Owner_2`.

---

## Session Transcript Access

In graph mode, clicking a running, awaiting-human, or completed node fetches that node's persisted role-scoped transcript and displays it in the UI when a session file exists.

Transcript resolution path:

1. Load the current `FlowRun`
2. Map node ID to role from the active workflow file
3. Resolve the logical session ID as `flowId__role-instance-name`
4. Load the persisted role session from runtime state

If no session exists for the selected node, the UI reports that the transcript is unavailable.

---

## Runtime Signals

The runtime injects and consumes the machine-readable handoff contract from `$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT`.

- `type: prompt-human` pauses the emitting node for targeted browser-entered human input
- `type: forward-pass-closed` ends the forward pass and pauses the flow at `awaiting_improvement_choice`
- `type: meta-analysis-complete` is consumed during backward-pass orchestration
- `type: backward-pass-complete` closes the backward pass after the final feedback step

During backward-pass meta-analysis, the runtime assigns each role a deterministic findings path under the active record folder's `findings/` subfolder, using `<role-slug>-findings.md`. A meta-analysis session must write to that assigned path and return the same repo-relative path in `findings_path`.

When the runtime is waiting for human input, the UI keeps the current flow state and resumes the same role-instance-scoped session after a reply is submitted to the requesting role instance or node.

---

## State Location and Resume

- Default state directory: `{workspace}/.a-society/state`
- Default settings directory: `{workspace}/.a-society`
- Override: `A_SOCIETY_STATE_DIR`
- Override: `A_SOCIETY_SETTINGS_DIR`

The runtime persists flow state and role sessions under `{stateDir}/{projectNamespace}/{flowId}/`.

Per-flow layout:

- `flow.json` — persisted `FlowRun`
- `roles/<roleKey>/feed.json` — persisted per-role browser feed (`FeedItem[]`) for replay after reconnect or server restart
- `roles/<roleKey>/transcript.json` — persisted role-instance-scoped session transcript for that role

Resume behavior:

- Existing `FlowRun` state is read from `{stateDir}/{projectNamespace}/{flowId}/flow.json`
- Selecting a flow opens it in graph mode
- The browser feed is replayed from `{stateDir}/{projectNamespace}/{flowId}/roles/<roleKey>/feed.json` when available
- Role-scoped session continuity is preserved from persisted role transcript files
- Persisted `runningNodes` are taken as initial runner work and cleared before live claims are made

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
