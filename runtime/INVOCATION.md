# A-Society Runtime Invocation

## Startup

### `npm --prefix ./a-society/runtime start`

Starts the local runtime UI server, attempts to open the browser, and prints the local URL to `stderr`.

Run from the workspace root:

```bash
npm --prefix ./a-society/runtime start
```

Default URL:

`http://localhost:3000`

Optionally choose the port with:

`A_SOCIETY_UI_PORT`

Example:

```bash
A_SOCIETY_UI_PORT=4010 npm --prefix ./a-society/runtime start
```

The runtime resolves the workspace from its fixed location at `{workspace}/a-society/runtime`. The workspace root is the parent of the cloned `a-society/` folder; it is not operator-configurable.

If the selected port is already in use, the runtime prints a clear error and exits non-zero.

### Model Configuration

The runtime server can start without a model, but runtime work cannot proceed until the operator configures and activates at least one model in the Settings UI.

- Provider, model ID, base URL, and API key are configured in Settings
- Saving a model runs a small sample request before persisting the configuration; validation failures are shown to the operator
- Anthropic thinking effort can be set to `none` to omit the Anthropic `output_config.effort` request parameter for models that do not support it
- Anthropic models expose a prompt cache TTL setting: `5m` by default, or `1h` for long-lived cache entries. The setting is persisted on every model but only Anthropic requests use explicit cache controls.
- The Settings modal stays open until a usable active model exists
- Environment variables in `.env` no longer select the runtime model

### Role Configuration

Each role instance can be configured once per flow:

- The first time a role instance is activated in a flow, the runtime suspends that node as awaiting human input with reason `role-configuration` when there is anything for the operator to choose
- The role configuration banner shows only the subsections that apply: Model when more than one model is configured, Skills when the workspace has at least one valid skill, and MCP servers when servers are configured
- The operator submits the role configuration once; the selected model applies to that role instance's turns, improvement-phase turns, and compaction turns; selected skills and MCP servers apply to model turns for that role instance, including improvement-phase turns
- Once the role is fully configured, a `Role Configuration` result feed item shows its complete effective configuration by **name** — the model, skills, and MCP servers it will run with, whether decided manually or automatically. The awaiting prompt is carried by the interactive banner only and produces no feed item of its own
- Model selection is persisted as `roles/<roleKey>/model.json`; selected optional capabilities are persisted as `roles/<roleKey>/capabilities.json`
- A node awaiting `role-configuration` does not accept a text reply
- With exactly one configured model and no skills or MCP servers, no role configuration is requested and the active model is used
- If a selected model is later deleted or becomes unusable while multiple models remain configured, the role re-prompts at its next activation; if a selected skill or MCP server is later removed, it is dropped at use time without re-prompting
- When project-level settings configure a role's model, skills, or MCP servers, those are written as the flow's selection before this prompt is evaluated, suppressing the prompt for the configured dimensions (see [Project-level settings](#project-level-settings))

#### Automatic selection

Model, skills, and MCP-server selection can each be switched from manual prompting to automatic selection — independently — via a toggle in the matching Settings tab (`Models`, `Skills`, `MCP`). The mode is global per dimension (it applies to every role instance) and defaults to **manual**, preserving the prompt-based behavior above.

- When a dimension is set to **automatic** and a role instance reaches it undecided, the runtime runs one independent selection turn — like compaction, a system-mode turn on the **active model** — briefed with the role's own workflow-snapshot nodes (their guidance, inputs, work, and outputs) so it can match capabilities to the role's responsibilities, and persists the choice so the manual gate reads that dimension as decided and the node is not suspended for it
- This runs at most once per role instance per flow: once a dimension is decided, every later activation of that role instance (any of its nodes) reuses the persisted choice without another turn
- The turn's input is only the dimensions that actually need a decision: models are included only when more than one is configured (a single model is used as-is, with no turn); skills and MCP servers are included only when at least one is configured. If no dimension needs an automatic decision, no turn runs at all
- Dimensions are independent: e.g. Model and Skills can stay manual while MCP is automatic. The node then suspends for `role-configuration` showing only the manual dimensions, and the operator's submit never overwrites a dimension that was already decided automatically
- The turn appears in the role feed as a single, always status-only strip — running, then green on success or red if it falls back. The chosen configuration is shown by name in the `Role Configuration` result bubble once the role is fully configured: immediately after the turn in a pure-auto run, or after the operator's manual submit when a manual dimension still follows
- Failure is two-tier: malformed model output is corrected with a bounded re-prompt; a transport error (network/timeout) or exhausted retries leaves the affected dimensions undecided and falls back to the manual `role-configuration` prompt — automation never blocks a flow on its own failure

Skills are folders at `{workspace}/.a-society/skills/<name>/`, each with a `SKILL.md` (name + description frontmatter, markdown body) and optional bundled resources (`scripts/`, `references/`, `assets/`). The runtime injects only selected skill names, descriptions, and `SKILL.md` paths into the role's system prompt; the agent reads the body and any `references/` on demand with `read_file`, and runs any bundled `scripts/` through the consent-gated `run_command` (bash) tool. The runtime never auto-executes skill scripts — but an imported skill may include runnable code, so import from trusted sources. Skills are imported (not created) in Settings under `Skills`.

### MCP Servers

MCP servers are configured in Settings under `MCP`.

- Server names must match `^[a-z0-9-]{1,32}$` because they become the namespace segment in model-visible tool names
- Stdio servers store command, args, and env-var names in settings; env-var values are stored in `.a-society/secrets.json`
- HTTP servers store URL and header names in settings; header values are stored in `.a-society/secrets.json`
- Saving a server connects to it and runs `tools/list`; failures block the save, and discovered tool names are stored for display and role configuration
- Selected tools are exposed as `mcp__<server>__<tool>`
- If a selected server is unreachable when a role first needs it, that server's tools are absent for the role and the role feed records an MCP notice
- If a server dies mid-flow, the tool remains in the role's frozen tool snapshot and returns an error result when called

### Web Search Connectivity

Web search is Tavily-backed. Enabling it in Settings requires a Tavily API key, and successful tool calls require outbound HTTPS access from the runtime process to:

`https://api.tavily.com/search`

If the runtime is launched from a sandboxed command environment without network access, `web_search` calls fail with a network error even when the API key is valid. Start the runtime from a normal operator terminal, or grant network access to the runtime process before relying on web search.

---

## UI Modes

The browser UI has two operator modes.

### 1. Project Selector and Owner Chat

Fresh starts open in the project selector. The selector has these startup paths:

- Existing projects with `a-docs/`
- Existing projects without `a-docs/`
- Create a new project
- Update an initialized project whose `a-docs/` are behind the current framework version

Selecting a project with `a-docs/` starts the normal stored Owner draft flow.

Selecting a project without `a-docs/` or creating a new project runs scaffold first, creates a runtime-owned initialization record folder under `.a-society/state/<project>/<flow-id>/record/` with a single-node Owner workflow, injects initialization guidance and the A-Society general index as active artifacts, and then runs that stored flow.

### Framework version and the update flow

The canonical current framework version is declared in `CHANGELOG.md` YAML frontmatter (`a_society_version`). Each initialized project records the version its `a-docs/` conform to in `a-docs/a-society-version.md` frontmatter (same key). The version is stamped automatically at initialization and is a compulsory, parseable surface validated by runtime health checks.

`GET /api/projects` reports, per initialized project, its recorded `aDocsVersion`, the `currentVersion`, and `updateAvailable` (true when the current version is strictly newer than the recorded version). When an update is available, the project selector shows an **Update** button next to the project's settings (⋮) control.

Choosing Update starts an Owner-only update flow. Like initialization, it creates a runtime-owned record folder with a single-node Owner workflow, but it does **not** scaffold or modify the project's `a-docs/`. It injects the runtime update guide, an update brief (recording from/to versions and the changelog), and the A-Society general index. The Owner migrates the `a-docs/` to the target version and bumps `a_society_version` in `a-docs/a-society-version.md`. On forward-pass closure the `a-docs/` are validated like any other flow, and the optional feedback step runs with an `update`-kind feedback context.

The runtime injects `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT` with the handoff contract in every managed session. It defines flow record placement, metadata, and writable scope.

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

When a project has existing flow state, the client lists the project's saved flows in the left pane. Selecting a flow opens it as an in-app tab and scopes the URL to that active tab.

### Project-level settings

Each initialized project in the selector has a settings (⋮) control that opens a **project settings** modal (titled with the project name). A master **Enable project settings** toggle gates everything below; when off, the project behaves exactly as the per-flow defaults. Settings persist to `{workspace}/.a-society/state/<project>/settings.json`.

- **Roles** — per role, choose a default Model and optionally fix Skills and MCP servers. A configured dimension is written as each flow's selection for that role before the activation gate, so the per-flow role-configuration prompt is suppressed for it; dimensions left unset fall back to the manual/automatic gate. Model/skill/MCP references are re-validated at use time and dropped if the underlying entry is removed.
- **Permission → Tools** — choose the project permission level (No / Partial / Full access) and edit the allowed bash commands. These seed each new flow's `consentState` at creation. While enabled, the chat-footer mode dropdown and the consent prompt's `Allow … for this project` button also write back to the project, so future flows inherit the change.
- **Permission → Improvement · Feedback** — preset the improvement mode (No improvement / Graph-based / Parallel) and feedback (Yes / No). When set, the matching end-of-flow gate is applied automatically and its modal is skipped; `Ask each flow` keeps the prompt. Graph/parallel improvement and feedback generation still require a usable model and fall back to the prompt when none is configured.
- **Delete project** lives at the bottom of this modal; the per-row delete (×) is removed for initialized projects (uninitialized projects keep it).

The active tab is mirrored in the URL as `/projects/:projectNamespace/flows/:flowId`. Switching tabs updates that route; loading the route reopens that flow. The UI also accepts the older `?project=...&flow=...` form for compatibility and rewrites it to the route form after a flow is selected.

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

The runtime writes a queued human reply only if the targeted node or improvement role is still awaiting non-consent human input, or the targeted node is still suspended in `awaitingHandoff`, in the latest persisted flow state. If the node was already woken by handoff or otherwise stopped accepting input, the reply is rejected instead of leaving stale `pendingHumanInputs`.

A node awaiting a `prompt-human` reply can also be woken by a deliverable inbound handoff. If a human reply is already queued for that node, the queued human reply is consumed first and the inbound handoff is not injected into that human-input turn. If no human reply is queued, the inbound handoff wakes the same node, clears its awaiting-human suspension for the turn, and appends the normal reopened-node handoff packet before the model continues.

A node suspended with `await-handoff` can also receive targeted human input. Queued human input has priority over received handoffs: the runtime resumes the node with the human reply, removes the `awaitingHandoff` suspension, and does not inject inbound handoff artifacts into that human-input turn.

When the forward pass closes, the runtime persists `status: awaiting_improvement_choice` in `flow.json`. The browser shows the improvement-mode modal from that persisted state and sends a dedicated improvement-choice message. This is runtime-level input, not a role/node `prompt-human` reply.

### Tool permission modes

The chat footer exposes three per-flow tool permission modes:

- `No Access` — permission-required tools ask each time; stored flow grants are ignored
- `Partial Access` — stored flow grants are honored: all edits if previously granted, and exact bash commands previously granted for this flow
- `Full Access` — permission-required tools run without prompting

File writes (`edit_file`, `write_file`) prompt with the target path and offer `Allow`, `Allow all edits this flow`, or `Deny`.

Bash commands prompt with the exact command and offer `Allow`, `Allow <command> this flow`, or `Deny`. Simple safe read-only commands such as `ls` do not prompt.

MCP tool calls prompt by default with `<server> · <tool>` and an argument preview. `Allow this tool for this flow` stores a per-tool grant under `consentState.mcp.allowedTools`; MCP read-only hints are not auto-allowed.

Permission state is stored on the active `FlowRun` as `consentState` in `flow.json`.

When project-level settings are enabled, this mode and the granted bash commands are seeded from the project at flow creation, the footer's mode dropdown writes the project default, and the consent prompt's allow button reads `Allow … for this project` and persists the grant to the project (see [Project-level settings](#project-level-settings)).

---

## Session Startup and Continuity

### Required reading is loaded once at startup

When a session begins, the runtime resolves the active role instance to its base role and loads that base role's file from `a-docs/roles/<base-role-id>/required-readings.yaml` into the system prompt. These files are already loaded into the session at first turn. Role docs and bootstrap prompts must not instruct the model to reread those files by default.

Role ids ending in `_<number>` are separate role instances. For example, `owner_1` and `owner_2` both load `owner` required readings, but they use separate runtime sessions.

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

If that same `prompt-human` node receives a handoff before a human reply is queued, the runtime treats the handoff as the wake-up signal instead of an interrupted-turn continuation. The existing role-scoped transcript and current-node conversation context are preserved, and the runtime appends a reopened-node packet containing the inbound handoff context.

### Later same-role-instance return

When the same role instance appears again at a later node in the same flow, the runtime reuses the same flow-scoped role-instance session and appends a node-transition packet. The current node inputs are authoritative even though earlier discussion remains available.

### Reopened node re-entry

When a backward edge reopens a node for the same role instance, the runtime keeps the existing role-instance-scoped session and appends a reopened-node packet before continuing.

### Same-role-instance scheduling

Concurrent execution of the same role instance is serialized because a role instance has one flow-scoped session. If multiple runnable nodes share a role instance, the runtime claims only the earliest runnable node for that role instance; later same-role-instance work remains derivable from flow state or the runner's initial-node list until that role instance is free. Distinct role instances may run in parallel, including instances that share the same base role such as `owner_1` and `owner_2`.

### Context compaction

The runtime tracks the latest reported context usage per role session. When usage reaches the auto-compaction threshold, compaction runs immediately before that role's next model turn. This applies consistently across forward flow turns, backward-pass meta-analysis turns, and feedback turns.

Manual compaction from the browser uses the same model-request lifecycle as a normal role turn: `request_sent`, `receiving_response`, and `response_end`. The stop control can abort the compaction turn through the role's active abort controller.

Compaction archives the raw transcript in the role session, replaces active model input with a runtime-authored restoration message, resets the displayed context usage for that role, and preserves the compacted event as an audit/feed item.

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

- State directory: `{workspace}/.a-society/state`
- Settings directory: `{workspace}/.a-society`

The runtime persists flow state and role sessions under `{workspace}/.a-society/state/{projectNamespace}/{flowId}/`.

Per-project: `{workspace}/.a-society/state/{projectNamespace}/settings.json` — project-level settings (per-role model/skill/MCP defaults, permission seed, improvement/feedback defaults), applied to new flows only while its `enabled` flag is set.

Per-flow layout:

- `flow.json` — persisted `FlowRun`
- `roles/<roleKey>/feed.json` — persisted per-role browser feed (`FeedItem[]`) for replay after reconnect or server restart
- `roles/<roleKey>/transcript.json` — persisted role-instance-scoped session transcript for that role
- `roles/<roleKey>/model.json` — persisted per-role model selection for that flow (present once the operator has chosen a model for the role)
- `roles/<roleKey>/capabilities.json` — persisted per-role selected skills and MCP servers for that flow, with per-dimension `skillsDecided` / `mcpDecided` provenance so skills and MCP can be resolved independently (manual or automatic); present once either dimension has been decided, including explicit empty selections

Resume behavior:

- Existing `FlowRun` state is read from `{workspace}/.a-society/state/{projectNamespace}/{flowId}/flow.json`
- Selecting a flow opens it in graph mode
- The browser feed is replayed from `{workspace}/.a-society/state/{projectNamespace}/{flowId}/roles/<roleKey>/feed.json` when available
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

Provider spans report prompt-cache usage when the provider returns cache counters:

- `gen_ai.usage.cache_read.input_tokens` — input tokens served from provider prompt cache
- `gen_ai.usage.cache_creation.input_tokens` — input tokens written into provider prompt cache; reported by Anthropic when present

Project-mode role turns opt into prompt caching. System-mode turns such as compaction and automatic capability selection do not write cache by default.

---

## Local Collector Example

```bash
export A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318
export A_SOCIETY_OTLP_METRICS_INTERVAL=10000
```
