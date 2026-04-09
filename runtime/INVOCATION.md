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

Reads the current flow state and prints a rendered status view.

If no active flow state exists, the command reports that no active flow state was found.

---

## Runtime Signals

The runtime consumes the machine-readable handoff contract from `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

- `type: prompt-human` pauses execution for terminal input and resumes the same session after a human reply
- `type: forward-pass-closed` ends the forward pass and hands control to improvement orchestration
- `type: meta-analysis-complete` is consumed during backward-pass orchestration

When the operator enters `exit` or `quit` at a prompt-human pause, or the input stream closes, the flow is suspended as `awaiting_human`. Empty input re-prompts without advancing the session.

---

## Required Project Surface

The runtime loads context from `a-docs/roles/required-readings.yaml`. If that file is missing or the relevant index variables do not resolve, orchestration cannot start.

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
