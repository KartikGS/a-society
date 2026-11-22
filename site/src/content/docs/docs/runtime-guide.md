---
title: Runtime Guide
description: Operator-facing guide to the A-Society runtime — starting the server, the browser UI, agent mode, permissions, feedback reports, and flow management.
sources:
  - "Authoritative reference: runtime/INVOCATION.md (Orchestration Developer). This page summarizes it for newcomers and links to it; when the two differ, INVOCATION.md is right and this page is fixed."
  - "UI labels: runtime/ui/src/. Telemetry names: runtime/src/ and runtime/observability/."
---

The A-Society runtime is a local Node.js server with a browser UI. This guide covers what you need to operate it day to day. The complete, authoritative operator reference is [`runtime/INVOCATION.md`](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md) in the repository; each section below links to the matching part of it.

## Starting the runtime

Run from the workspace root, the folder that contains `a-society/`:

```bash
npm --prefix ./a-society/runtime install        # first time only
npm --prefix ./a-society/runtime run build:ui   # first time only
npm --prefix ./a-society/runtime start
```

The runtime opens a browser tab at **[http://localhost:3000](http://localhost:3000)** by default and prints the workspace and A-Society checkout it resolved, for example `[runtime/server] Workspace: /home/you/workspace`. If the port is already in use, it prints an error and exits.

### Workspace and checkout

The runtime has two roots:

- The **A-Society checkout** (`a-society/`) supplies the framework: runtime contracts, templates, and the current framework version.
- The **workspace** holds your projects and the runtime's own `.a-society/` folder: flow state, settings, API keys, skills, and feedback reports.

By default the workspace is the parent of the checkout, which must then be named `a-society`. That is the layout the install script creates. Set `A_SOCIETY_WORKSPACE` to an absolute path to use a different workspace. The runtime refuses to start if the workspace contains an `a-society` folder that is not this checkout, or if this checkout sits inside the workspace under another name, so two runtimes never share one workspace's state. Details: [INVOCATION.md — Startup](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md#startup).

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `A_SOCIETY_UI_PORT` | `3000` | HTTP port for the local server |
| `A_SOCIETY_WORKSPACE` | parent of `a-society/` | Absolute path to an existing workspace folder |
| `A_SOCIETY_OPEN_BROWSER` | — | Set to `false` to stop the browser tab from opening |
| `A_SOCIETY_TELEMETRY_ENABLED` | `true` | Set to `false` to disable telemetry bootstrapping |
| `A_SOCIETY_OTLP_ENDPOINT` | — | OTLP/HTTP collector endpoint |
| `A_SOCIETY_OTLP_HEADERS` | — | Comma-separated `key=value` headers for the OTLP exporter |
| `A_SOCIETY_OTLP_METRICS_INTERVAL` | `60000` | Metrics export interval in milliseconds |
| `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE` | `false` | Capture full prompts and turns as telemetry events (may include sensitive data) |
| `A_SOCIETY_ENVIRONMENT` | `production` | Sets the `deployment.environment` resource attribute |

Variables can be set inline or in a `runtime/.env` file (copy `runtime/.env.sample` to get started):

```bash
A_SOCIETY_UI_PORT=4000 npm --prefix ./a-society/runtime start
```

The model is not chosen through environment variables; configure it in Settings.

### Updating A-Society

Keep the `a-society/` checkout on `main`. To update, run `git -C a-society pull` and restart the runtime. If you want to change A-Society itself, do that in a second checkout, never in the one your runtime runs from; [INVOCATION.md — Running a development runtime](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md#running-a-development-runtime) has the procedure, including how to try a development runtime on another port against a scratch workspace.

---

## Browser UI layout

The UI has two primary modes: **Project Selector** and **Flow View**.

### Project Selector

The entry point when no flow is active. Shows:

- **Initialized projects** — projects with a complete `a-docs/` layer, ready for new flows
- **Uninitialized projects** — project folders in your workspace without `a-docs/`, ready to initialize
- **Create New Project** — creates a folder and starts the initialization flow

An **Update** button appears next to an initialized project when its `a-docs/` are behind the framework by a release line: the minor version while A-Society is on 0.x, the major version from 1.0 on. Patch releases never prompt; for example, a project on 0.3.0 is current with 0.3.3. See [Flow Types — Update flows](/docs/flow-types#update-flows).

### Settings panel

Open it from the settings button in the sidebar. Its tabs are **Agent mode**, **Models**, **Tools**, **Feed**, **MCP**, and **Skills**. API keys and other secrets are stored locally in `.a-society/secrets.json` in your workspace and sent only to the provider they belong to.

On first launch, the Settings panel opens automatically and stays open until a usable model is active or agent mode has a ready coding agent.

- [Model Configuration](/docs/model-configuration) covers API models.
- [MCP & Skills](/docs/mcp-skills-configuration) covers MCP servers and Skills.

### Agent mode

Agent mode runs each role turn on a coding agent installed on your machine instead of the runtime's own API calls. The supported agent is **Claude Code**, versions `2.1.304` up to (not including) `2.2.0`. Turn it on under **Agent mode**, choose the agent, and click **Check agent**; [Getting Started](/docs/getting-started#option-b-a-coding-agent-you-already-use-agent-mode) walks through it.

- The runtime launches your installed `claude` CLI headlessly, once per turn, as you signed in to it. It never reads, stores, or passes credentials.
- **Billing follows the CLI's own sign-in.** If `ANTHROPIC_API_KEY` is set in the runtime's environment, Claude Code uses that key instead of a subscription sign-in.
- **Check agent** runs again before every turn, because the CLI updates itself. A turn on an unsupported version is refused, and the message names the supported range.
- The backend is fixed per flow when the flow is created. Changing the setting affects new flows only.
- Each role runs on a model and effort level chosen for it: `Opus`, `Sonnet`, `Haiku`, or `Fable`, with effort `low` to `max`, or `Host default` for either.
- The agent manages its own skills, MCP servers, web search, and context compaction. The runtime's Skills and MCP settings, and its compaction, apply to API flows only.
- The runtime still owns the workflow, handoffs and their validation, records, closure, the backward pass, and feedback.
- The composer footer shows the agent's plan usage (5-hour and 7-day windows).

Details: [INVOCATION.md — Agent Mode](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md#agent-mode).

### Project settings

Each initialized project has a settings (⋮) control in the project selector. With **Enable project settings** on, you can set per-role defaults (model, or host model and effort in agent mode; Skills; MCP servers), the permission level and allowed commands new flows start with, and whether the end-of-flow improvement and feedback prompts are answered automatically. **Delete project** is at the bottom of this modal. Details: [INVOCATION.md — Project-level settings](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md#project-level-settings).

---

## Flow lifecycle

A **flow** is a single unit of work routed through the workflow. Each flow has:

- A **record folder** with a unique timestamp ID (e.g., `20260527T143000123Z-a1b2c3`)
- A `record.yaml` with the flow ID, name, and summary
- A `workflow.yaml` tracking the active forward-pass path
- Artifact files produced during the flow

### Opening a flow

Select an initialized project and click **New** next to **Records**. The runtime creates the record folder, seeds `record.yaml`, and opens the Owner node.

### Flow View

When a flow is active, the UI switches to Flow View:

- **Owner Chat** — available at Owner nodes; you collaborate with the Owner agent to plan intake, write briefs, and close the flow
- **Graph View** — the workflow graph, with ready, running, awaiting-human, completed, and backward (corrective) nodes color-coded. The live feed stays beside it, and clicking a node shows that role's transcript
- **Role handoff** — when a node emits a valid handoff, the runtime automatically loads the next node and starts the appropriate role session
- **Approvals** — a node marked `human-colab` asks you before its handoff goes forward, and before it closes the forward pass, with a link to the artifact. **Approve** commits it as written; **Decline** discards it and pauses the node so you can give guidance. Artifact links open in the document panel

### Session continuity

Sessions survive server restarts. If you close the browser or restart the runtime, reopening the UI and selecting the flow restores the active node and its context. Partially completed role turns are recoverable from the saved session state. Use the **Resume** button to continue a flow that was waiting on human input or was interrupted mid-turn.

### Tool permissions

The runtime asks before a role writes files, runs shell commands, or calls MCP tools. The chat footer has three per-flow modes:

| Mode | Behavior |
|---|---|
| **No Access** | Every permission-required tool asks each time; stored grants for the flow are ignored |
| **Partial Access** | Grants stored for this flow are honored: all edits if you allowed them, and the exact commands you allowed |
| **Full Access** | Permission-required tools run without asking |

When a role wants to write a file, the prompt shows the path and offers **Allow**, **Allow all edits for this flow**, or **Deny**. When the change can be shown, a **View change** link opens a line diff of it. Commands prompt with the exact command and offer **Allow this command**, **Allow this command for this flow**, or **Deny**. MCP calls prompt with the server, tool, and an argument preview. Simple read-only commands such as `ls` do not prompt. With project settings enabled, the "for this flow" buttons read "for this project" and the grant carries over to future flows of that project.

Denying pauses the node so you can give the role guidance. Prompts that were pending when the runtime shut down are treated as denied on restart.

In agent mode, the same levels become the agent's own permissions for each turn. When the agent is refused something, the runtime shows the usual prompt after the turn and, if you allow it, retries the turn with the new permission. If you chose **Claude Code decides (auto mode)** for a flow, Claude Code approves or refuses each action itself and the runtime never prompts.

Details: [INVOCATION.md — Tool permission modes](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md#tool-permission-modes).

---

## Owner chat mode

Owner chat is the primary mode for planning, intake, and closure. The Owner agent:

- Reads the active required context for the flow
- Asks what you want to work on (at intake)
- Routes to the appropriate workflow path
- Authors the workflow plan and handoff artifacts
- Closes the forward pass when all touched surfaces are accounted for

You interact with the Owner through a standard chat interface. The Owner may ask clarifying questions, propose alternatives, or push back on scope. This is expected — the Owner's job is to protect framework coherence.

---

## Backward pass and improvement protocol

When the forward pass closes, the runtime pauses and offers three options: **graph-based**, **parallel**, or **none**. In the **backward pass**, each role that took part reflects on its work and writes findings. Both meta-analysis and feedback are optional, and your choice applies only to the current flow, unless project settings answer it for you.

After meta-analysis completes, the runtime asks separately whether to generate an upstream feedback report. This is a second, independent consent gate.

See [Concepts — What is the backward pass?](/docs/concepts#what-is-the-backward-pass) for how meta-analysis sessions work, how graph-based and parallel modes differ, and what the feedback phase produces.

## Feedback reports

If you approve feedback, the feedback agent writes one report to `.a-society/feedback/` in your workspace, named `<project>-<kind>-<flow-id>.md`. Reports stay outside the A-Society checkout, so the checkout stays clean and pullable. Nothing is sent anywhere.

When the report is saved, the flow's chat shows a **Feedback report saved** banner with the file's full path, a **Copy path** button, and a link to the submission steps.

To share a report with the A-Society project, submit it as a pull request that adds the file to the `feedback/` folder of [`KartikGS/a-society`](https://github.com/KartikGS/a-society). In outline:

1. Review the report and remove anything you don't want public. The pull request is public.
2. Fork the repository and clone your fork somewhere other than your runtime's `a-society/` checkout.
3. Copy the report into `feedback/` on a new branch, commit, and push.
4. Open the pull request against `main`. The report's *Suggested PR Share Text* section gives a title and body.

A-Society never uses your GitHub credentials; you run these steps yourself. The exact commands, the maintainer route, and how to move reports that earlier versions saved inside `a-society/feedback/` are in [INVOCATION.md — Submitting a feedback report](https://github.com/KartikGS/a-society/blob/main/runtime/INVOCATION.md#submitting-a-feedback-report).

---

---

## OpenTelemetry observability

The runtime exports traces, metrics, and logs via OpenTelemetry following the [GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/). A pre-configured local observability stack is included at `runtime/observability/` — Tempo for traces, Prometheus for metrics, Loki for logs, and Grafana for visualization.

**Starting the local stack:**

Docker is required. From your workspace:

```bash
docker compose -f ./a-society/runtime/observability/docker-compose.yaml up -d
```

Grafana opens at **[http://localhost:13000](http://localhost:13000)**. The OTLP collector listens at `http://localhost:14318`.

Set `A_SOCIETY_OTLP_ENDPOINT` to point the runtime at the collector:

```bash
A_SOCIETY_OTLP_ENDPOINT=http://localhost:14318 npm --prefix ./a-society/runtime start
```

Or add it to `runtime/.env`.

**Traces:**
- Per-turn spans (`llm.gateway.execute_turn`) wrapping the full tool loop for each role turn
- Per-API-call spans for each model request, with input and output token counts as span attributes (GenAI semantic conventions)
- Backward-pass spans (`improvement.orchestrate`) covering the full improvement phase

**Metrics:**
- `a_society.flow.started` / `a_society.flow.completed` — flow lifecycle counters
- `a_society.session.turn.started` — turn counter per role session
- `a_society.session.turn.duration` — turn duration histogram
- `a_society.handoff.parse_failure` — counter for malformed handoff blocks
- `gen_ai.client.operation.duration` — model API call duration histogram (per provider)

**Logs:**

Structured logs are exported to the same endpoint via the OTLP logs signal and available in Grafana via Loki.

---

## Stopping the runtime

Press `Ctrl+C` in the terminal window.

If there are active role sessions running, the first `Ctrl+C` aborts them gracefully — in-flight LLM calls are cancelled and each running node is checkpointed to disk as an awaiting-human node. The server stays alive. You can reconnect, select the flow, and resume from where it stopped.

If no sessions are active, or after the first `Ctrl+C` has cleared them, a second `Ctrl+C` exits the process.
