# A-Society Runtime Invocation

The A-Society runtime architecture executes all behavior dynamically utilizing emergent execution models exclusively. There are no longer CLI node overrides or specific resume commands.

## Initiating a Session

An Owner bootstraps an execution session exclusively utilizing the singular CLI command:

```bash
a-society
a-society flow-status
```

### Commands

- **`a-society`**: Starts or resumes the unified orchestration flow. Discovers projects in the current working directory and prompts for selection.
- **`a-society flow-status`**: Reads the current `.state/flow.json` and prints the flow ID, status, and active nodes to the terminal.

When invoked:
1. The orchestrator scans the filesystem to identify initialized A-Society projects.
2. The user selects the active project interactive workspace.
3. The orchestrator accesses the existing `.state/flow.json` to resume where the project left off. If no active flow is present, it initiates the **Owner** bootstrapping session via `runInteractiveSession`.
4. The user outlines expectations and tracks state directly via logs and interactive chatting.

## Progression and Automation

When an active conversational node emits a formalized `handoff` YAML block, the runtime identifies it via `HandoffInterpreter.parse`, persisting tracking markers into `.state/flow.json`. The orchestrator terminates the conversational loop immediately natively, processing workflow transitions against `workflow.md`, evaluating dependencies, and recursively launching the target successors automatically.

The system treats interactive sessions and automated background executions symmetrically as nodes seamlessly passing the orchestration token linearly securely.

### In-Flow Human Interaction

An autonomous agent can pause the flow and request human input by emitting a specialized `handoff` block:

```handoff
type: prompt-human
```

When this signal is detected:
1. The runtime pauses the autonomous execution.
2. The operator is prompted for input at the terminal (`> `).
3. The human's reply is appended to the session history as a `user` turn.
4. The same agent session resumes immediately with the new input.

This enables clarifications, approvals, or missing data requests without breaking the flow or requiring manual session resumption. If the operator enters `exit` or `quit`, or the input stream closes, the flow status is set to `awaiting_human` and the session is suspended. Empty input (Enter with no text) re-prompts without advancing the session.

## Improvement Orchestration

The runtime manages the project improvement backward-pass automatically. After a forward pass is closed (indicated by a `type: forward-pass-closed` signal), the runtime presents the operator with three improvement mode options:

1. **Graph-based** — Meta-analysis roles run in reverse topological order. Each role receives findings from its direct successors in the forward pass, enabling structured reflection.
2. **Parallel** — All meta-analysis roles run simultaneously. No cross-role findings are injected. Best for rapid, independent assessment.
3. **No improvement** — Closes the record immediately without a backward pass.

### Execution Lifecycle
- **Meta-analysis**: The runtime launches sessions for each role in the backward pass. Roles are instructed to produce findings artifacts and emit a `type: meta-analysis-complete` signal.
- **Synthesis**: After meta-analysis completes, the runtime automatically launches a fresh **Curator** session for synthesis. This session receives all produced findings in its context.
- **Closure**: Once synthesis completes, the flow status is set to `completed` and the record is closed.

## Configuration and Errors

### Required Readings Configuration

The runtime manages context injection by reading a central configuration file: `a-docs/roles/required-readings.yaml`. This file must exist in the project root. If it is missing, the orchestrator will emit a terminal error and cannot initialize sessions.

Authoritative schema for `required-readings.yaml`:
```yaml
universal:
  - $VAR_NAME       # Resolved against the project's index; loaded for every role
roles:
  role_id:
    - $VAR_NAME     # role_id is the lowercase role name (e.g., owner, curator)
```

### Error Feedback Loop

The A-Society runtime implements an autonomous error feedback loop for specific workflow and handoff errors. Instead of terminating the session, these errors are returned to the model as a user-turn message, allowing the agent to self-correct:

- **Malformed handoff YAML**: If the `handoff` block is invalid or missing required fields.
- **Missing record folder**: If the orchestrator cannot find the record folder specified during handoff.
- **Missing workflow.md**: If the required `workflow.md` is not present in the record folder.

Hard configuration failures (e.g., missing `required-readings.yaml`, project index resolution failures) still result in terminal errors and stop orchestration.

## Runtime UX Features

### Liveness Feedback
When waiting for a response from the LLM provider, a spinner (⠋) and "Thinking..." label are displayed on `stderr`. This indicator is TTY-gated and will not appear in piped or redirected output. The spinner is automatically cleared as soon as the first token of the response is received.

### Token Usage Reporting
After every turn, the cumulative token usage for that turn (including all tool-call rounds) is displayed on `stderr`:
`[tokens: 1234 in, 567 out]`
This provides immediate feedback on the cost and volume of the interaction.

### Interrupt and Resumption
If you press `Ctrl+C` while the model is generating a response:
1. The current API request is immediately aborted.
2. The partial text received up to that point is preserved in the session history.
3. The session returns to the prompt (in interactive mode) or the `awaiting_human` state (in autonomous mode).
This allows for graceful interruption and immediate correction without losing session state or crashing the process.

