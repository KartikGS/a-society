# A-Society: Runtime Layer Invocation

This document is the invocation reference for the A-Society runtime orchestrator. The runtime shifts session management, handoff routing, and context injection from manual instructions to programmatic enforcement.

## Entry Model

The runtime is implemented as a TypeScript application operating within a local Node.js environment. It is invoked via `tsx` through the main command-line interface.

- **Source location:** `a-society/runtime/src/`
- **Entry point:** `tsx src/cli.ts <command>`

## Required Environment

The runtime LLM Gateway relies on Anthropic. You must set your API key in the environment before starting or resuming flows:

- `ANTHROPIC_API_KEY`: Required for model provider API calls.

## Commands

### `start-flow`
Creates a new `FlowRun` and begins automated orchestration.
- **Usage:** `tsx src/cli.ts start-flow <workflowDocumentPath> <recordFolderPath> <startingRole> <startingArtifactPath>`
- **Arguments:**
  - `<workflowDocumentPath>`: Path to the permanent workflow document containing the validated YAML graph.
  - `<recordFolderPath>`: Path to the current active flow's record folder.
  - `<startingRole>`: The role assigned to the first node in the flow.
  - `<startingArtifactPath>`: The initial artifact provided to the starting role.

### `resume-flow`
Resumes a paused or retryable flow from its last durable checkpoint.
- **Usage:** `tsx src/cli.ts resume-flow <recordFolderPath> [humanInput]`
- **Arguments:**
  - `<recordFolderPath>`: Path to the previously initialized active flow.
  - `[humanInput]`: Optional free-text string. Required when the flow is paused at an `awaiting_human` state originating from a `human-collaborative` workflow node.

### `flow-status`
Inspects the active conditions of a runtime-managed flow.
- **Usage:** `tsx src/cli.ts flow-status <recordFolderPath>`
- **Output:** Returns the current node, active role sessions, last executed tool trigger, and the specific reason for any pause or failure.

## Session State

The runtime persists operational state separately from the canonical project log. 
- **State location:** `a-society/runtime/.state/`
- **Contents:** `FlowRun` metadata, role-session histories, tool-trigger results, and last-known execution checkpoints. 
*Note:* The runtime state directory is purely for orchestration metadata. Do not store canonical `a-docs/` artifacts inside it.

## Status Values

A flow run will always be in one of the following states:
- `initialized`: Flow created, graph validated, ready for first turn.
- `running`: Flow is actively executing model turns and routing decisions.
- `awaiting_human`: Flow paused at a `human-collaborative` workflow node, waiting for explicit operator input.
- `awaiting_retry`: Flow paused due to a transient error (e.g. rate limit), waiting for operator retry.
- `completed`: Flow reached a terminal node and forward orchestration is finished. Archive operations complete.
- `failed`: Flow encountered an unrecoverable violation or hard error. Operator intervention required.

## Error Conventions

The LLM Gateway normalizes provider-level errors broadly into four classes. The runtime responds to these according to the following conventions:

| Error Class | Runtime Response | Resulting Status |
|---|---|---|
| **Authentication / configuration error** | Fail immediately, no retry. | `failed` |
| **Rate limit / transient network error** | Retry with bounded exponential backoff. If exhausted, pause. | `awaiting_retry` |
| **Provider response malformed** | Fail the current turn, preserve transcript. | `failed` |
| **Handoff parse failure after valid provider response** | Do not automatically retry; the model violated the output block contract. | `failed` |
