# A-Society: Runtime Layer Invocation

This document is the invocation reference for the A-Society runtime orchestrator. The runtime shifts session management, handoff routing, and context injection from manual instructions to programmatic enforcement.

## Entry Model

The runtime is implemented as a TypeScript application operating within a local Node.js environment. It is invoked via `tsx` through the main command-line interface.

- **Source location:** `a-society/runtime/src/`
- **Entry point:** `tsx src/cli.ts <command>`

## Required Environment

The runtime LLM Gateway relies on provider-specific credentials. These can be set as standard environment variables or persisted in a `runtime/.env` file.

### Provider Configuration

| Variable | Description | Default |
|---|---|---|
| `LLM_PROVIDER` | Provider selector (`anthropic` | `openai-compatible`) | `anthropic` |
| `ANTHROPIC_API_KEY` | Required when `LLM_PROVIDER=anthropic`. | - |
| `ANTHROPIC_MODEL` | Optional model override for Anthropic. | `claude-3-5-sonnet-20241022` |
| `OPENAI_COMPAT_BASE_URL` | Required when `LLM_PROVIDER=openai-compatible`. | - |
| `OPENAI_COMPAT_API_KEY` | Optional API key for OpenAI-compatible provider. | - |
| `OPENAI_COMPAT_MODEL` | Optional model name for OpenAI-compatible provider. | `mistralai/Mistral-7B-Instruct-v0.3` |
| `SYNTHESIS_ROLE` | Optional; synthesis role for Backward Pass Orderer. | `Curator` |

### .env File Usage

The runtime automatically loads variables from `a-society/runtime/.env` at startup. 
1. Copy `runtime/.env.sample` to `runtime/.env`.
2. Populate with your API keys and configuration.
3. Note: `.env` is gitignored and must never be committed to the repository.

#### Example: Anthropic (Default)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### Example: OpenAI-Compatible (Gemini via Vertex/AI Studio)
```bash
LLM_PROVIDER=openai-compatible
OPENAI_COMPAT_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
OPENAI_COMPAT_API_KEY=AIza...
OPENAI_COMPAT_MODEL=gemini-1.5-pro
```

## Commands

### `start-flow`
Creates a new `FlowRun` and begins automated orchestration.
- **Usage:** `tsx src/cli.ts start-flow <projectRoot> <recordFolderPath> <startingRole> <startingArtifact>`
- **Arguments:**
  - `<projectRoot>`: The root directory of the project being orchestrated.
  - `<recordFolderPath>`: Path to the current active flow's record folder. The workflow graph is read from `<recordFolderPath>/workflow.md` (record-folder subgraph schema per `$INSTRUCTION_WORKFLOW_GRAPH` / `$INSTRUCTION_RECORDS`).
  - `<startingRole>`: The role assigned to the first node in the flow.
  - `<startingArtifact>`: The initial artifact provided to the starting role.

### `resume-flow`
Resumes a paused or retryable flow from its last durable checkpoint.
- **Usage:** `tsx src/cli.ts resume-flow <roleKey> <activeArtifactPath> [humanInput]`
- **Arguments:**
  - `<roleKey>`: The key identifying the role to resume as (e.g. `Owner`, `Curator`).
  - `<activeArtifactPath>`: Path to the artifact to hand to the resuming role.
  - `[humanInput]`: Optional free-text string. Required when the flow is paused at an `awaiting_human` state originating from a `human-collaborative` workflow node.

### `flow-status`
Inspects the active conditions of the last runtime-managed flow.
- **Usage:** `tsx src/cli.ts flow-status`
- **Output:** Returns the current node, active role sessions, last executed tool trigger, and the specific reason for any pause or failure.

### `orient`
Loads a specific role context for an interactive session with full file tool sandboxing.
- **Usage:** `tsx src/cli.ts orient <workspaceRoot> <roleKey>`
- **Arguments:**
  - `<workspaceRoot>`: Absolute path to the workspace root for file tool sandboxing checking.
  - `<roleKey>`: The key identifying the role context to load (resolved via internal role registry).

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
