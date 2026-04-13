# A-Society Runtime Invocation

This is the sole default operator-facing executable reference for A-Society. It is authored by the Orchestration Developer and registered or verified by the Curator.

---

## Commands

### `a-society`

Starts or resumes the unified orchestration flow.

Operator-visible behavior:

1. Scan the current working directory for initialized projects by checking for `a-docs/agents.md`
2. Prompt the operator to select a project
3. Start or resume orchestration from the selected project's Owner role

### `a-society flow-status`

Reads the current flow state and prints a rendered status view to `stdout`.

The snapshot is the authoritative view of active nodes, completed nodes, and pending joins. It does not include tool-call history, token counts, repair prompts, or wait/spinner state.

If no active flow state exists, the command reports that no active flow state was found.

---

## Operator Output Model

During a live `run`, the runtime separates its output into two channels:

- **`stderr`** — runtime/system notices (flow lifecycle, role activation, tool calls, handoffs, repairs, token summaries, human-input suspension)
- **`stdout`** — assistant/model text only

The operator can therefore redirect or filter each stream independently.

### Live notice classes

During a live run, operators should expect notices in these classes on `stderr`:

| Class | Example prefix |
|---|---|
| Flow lifecycle | `[runtime/flow]` |
| Role activation | `[runtime/role]` |
| Wait/liveness | `[runtime/wait]` |
| Tool activity | `[runtime/tool]` |
| Handoff success | `[runtime/handoff]` |
| Repair/retry | `[runtime/repair]` |
| Human-input suspension/resume | `[runtime/human]` |
| Parallel-state transition | `[runtime/parallel]` |
| Token summary | `Tokens: ...` |

### Wait indicator behavior

- TTY sessions show a spinner before first model output; the spinner clears when the first text token or tool-call block arrives.
- Non-TTY sessions degrade to a one-line wait notice on `stderr`.

### Token summary strings

One token summary is emitted per completed gateway turn. The exact approved strings are:

- `Tokens: <input> in, <output> out` — both available
- `Tokens: input unavailable, <output> out` — input not reported
- `Tokens: <input> in, output unavailable` — output not reported
- `Tokens unavailable (provider did not report usage)` — neither reported

Unavailable never means zero. When the provider does not report a count, the runtime says so explicitly rather than reporting zero.

### Parallel-state visibility

Live execution emits transition notices at fork and join boundaries only. It does not attempt a multi-pane live dashboard.

`a-society flow-status` is the place to inspect the full current parallel state: which nodes are active, which are complete, and which joins are waiting and on whom.

### No new operator-event flags or env vars

Phase 1 introduces no new CLI flags or environment variables for operator-event rendering.

---

## Runtime Signals

The runtime injects and consumes the machine-readable handoff contract from `$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT`.

- `type: prompt-human` pauses execution for terminal input and resumes the same session after a human reply
- `type: forward-pass-closed` ends the forward pass and hands control to improvement orchestration
- `type: meta-analysis-complete` is consumed during backward-pass orchestration
- `type: backward-pass-complete` closes the backward pass after synthesis

When the operator enters `exit` or `quit` at a prompt-human pause, or the input stream closes, the flow is suspended as `awaiting_human`. Empty input re-prompts without advancing the session.

---

## Session Startup and Continuity

### Required reading is loaded once at startup

When a session begins, the runtime loads all required-reading files from `a-docs/roles/required-readings.yaml` into the system prompt. These files are already present in the model's context at the first turn. Role docs and bootstrap prompts must not instruct the model to reread those files by default.

### Fresh Owner bootstrap

A fresh interactive Owner bootstrap uses an explicit first user message that instructs the Owner to use the already-loaded context. The runtime does not inject a generic "read the project log" prompt — the Owner is told directly that the required-reading files are loaded and to use them to summarize status and ask what to work on.

### Same-node `prompt-human` resume

When a `type: prompt-human` handoff pauses execution, the active role-scoped session transcript is preserved. On resume at the same node, the runtime reuses that transcript and appends only the human reply. The node-entry packet is not regenerated.

### Same-role later-node return

When the same role appears again at a later node in the same flow (e.g., an Owner gate after a Technical Architect node), the runtime reuses the same flow-scoped role session and appends a combined node-transition message containing:

1. A header identifying the workflow node and role
2. An explicit statement that the role is continuing in the same flow session
3. The current node's active artifact(s) as authoritative task input

This preserves in-flow continuity by keeping prior role discussion and repair history in one session, while still restating the node's current authoritative inputs.

### Reopened node re-entry

When a backward edge reopens a node for the same role, the runtime keeps the existing role-scoped session and appends a reopened-node packet before the next turn. The packet states that the node has been reopened and that the current task inputs may supersede earlier assumptions.

### Same-role parallel activation

Concurrent activation of two nodes with the same role is currently unsupported. The runtime now uses one flow-scoped session per role, so it rejects same-role parallel activation rather than silently splitting or mixing transcript state.

---

## Required Project Surface

The runtime loads context from `a-docs/roles/required-readings.yaml`. If that file is missing or the relevant index variables do not resolve, orchestration cannot start.

The machine-readable handoff contract is not part of `required-readings.yaml`. The runtime injects it separately as runtime-owned context.

---

## State Location

- Default state directory: `a-society/runtime/.state`
- Override: `A_SOCIETY_STATE_DIR`

The runtime persists flow state, role sessions, turn records, and trigger records in this state directory.

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

To point the runtime at a local OTLP/HTTP collector:

```bash
export A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318
```

To shorten the wait for exported metrics during local work:

```bash
export A_SOCIETY_OTLP_METRICS_INTERVAL=10000
```
