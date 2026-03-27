# Phase 0 Architecture Design — Orient Command and a-society CLI Entry Point

**Role:** Technical Architect
**Status:** Ready for Owner review
**Date:** 2026-03-28
**Record folder:** `a-society/a-docs/records/20260327-runtime-orient-session/`
**Brief:** `02-owner-to-ta-brief.md`

---

## Preamble

This document is the binding specification for implementing the `orient` command and the `a-society` CLI binary. It covers all eight topics required by the brief and resolves all five design questions flagged in the workflow plan (session model, CLI placement, project discovery edge cases, install approach, session persistence).

No implementation may begin until the Owner approves this document at the `owner-phase0-gate` node.

---

## §1. Orient Session Model

### Decision: Distinct `OrientSession` type — not a stripped `FlowRun`

`FlowRun` carries three fields with no meaning in an orient session: `workflowDocumentPath`, `recordFolderPath`, `currentNode`. These drive workflow graph parsing, edge routing, and `ToolTriggerEngine` evaluation — none of which apply to orient. Reusing `FlowRun` would require dummy values or nullable optional fields, both of which misrepresent the type's meaning. The two session types are structurally and behaviorally distinct and must remain so.

Orient is the full Owner agent experience: the same context loading, the same role, the same capability to reason about the project, plan work, or kick off a flow. The distinction from a flow session is not capability — it is structure. There is no workflow document, no record folder, no node graph, and no handoff contract. The session is conversational.

**New type — add to `runtime/src/types.ts`:**

```ts
export interface OrientSession {
  sessionId: string;     // crypto.randomUUID() — unique per session invocation
  workspaceRoot: string; // absolute path to the workspace root (parent of a-society/ and project folders)
  roleKey: string;       // registry key, e.g. 'a-society__Owner'
  startedAt: string;     // ISO 8601 timestamp
}
```

### Lifecycle

- **start** — `runOrientSession(workspaceRoot, roleKey)` is called. `OrientSession` is constructed in memory. Context bundle assembled via the extended `ContextInjectionService`. Initial LLM turn fires (Owner greeting).
- **active** — Multi-turn readline loop. Each user input appends to history, triggers `llm.executeTurn`, streams response.
- **closed** — User types `exit` or `quit`, sends EOF (Ctrl+D), or sends SIGINT (Ctrl+C). Loop exits. Session ends.

The `OrientSession` object is used for structured construction only; it is not passed through the conversation loop. The conversation loop state is `systemPrompt` (stable) and `history` (growing `MessageParam[]`).

### State persistence: Ephemeral — no SessionStore entry

Orient sessions are not written to `SessionStore`. Rationale:

`FlowRun` persistence exists because flows have structural position — a current node, a handoff chain, a record folder — that must survive process restarts. An orient session has no position. It is a conversation whose value is the dialogue itself. There is no "resume" concept: a new session reloads context from the same documents in under one turn, making persistence a net negative (complexity added, no material benefit recovered).

---

## §2. Context Injection

### Approach: `roleContextRegistry` + extended `ContextInjectionService`

Orient uses the same injection infrastructure as flow sessions. The `roleContextRegistry` is consulted and `ContextInjectionService.buildContextBundle` is called. No parallel injection path is introduced.

**Registry key derivation:** The `a-society` binary determines the role key from the selected project's folder name:

```
roleKey = '{projectFolderName}__Owner'
```

Examples: `a-society` → `'a-society__Owner'`, `llm-journey` → `'llm-journey__Owner'`.

If no entry exists in `roleContextRegistry` for the derived key, orient surfaces an error and exits:

```
"This project's Owner role is not registered in the runtime.
Only registered projects support orient sessions."
```

This is the correct MVP behavior. Other projects will register their own entries as future scope; orient does not attempt to handle unregistered projects.

For MVP, `'a-society__Owner'` is the only registered entry and the only project orient can serve. This is sufficient for the stated user experience.

### The handoff directive problem — `ContextInjectionService` extension

`ContextInjectionService.buildContextBundle` currently appends a hardcoded directive at the end of every context bundle:

```
IMPORTANT INSTRUCTION: Your response must always end with a valid machine-readable handoff block...
```

This directive must NOT appear in orient sessions. An orient session is conversational — there is no handoff handler to receive a block, and requiring one would corrupt the UX. The fix is a minimal extension to `buildContextBundle`, not a bypass of the service.

**Extension — add an optional `mode` parameter to `buildContextBundle`:**

```ts
static buildContextBundle(
  roleKey: string,
  projectRoot: string,
  activeArtifactPath: string,
  directivePrompt: string | null,
  mode: 'flow' | 'orient' = 'flow'   // new parameter; default preserves existing behavior
): ContextBundleResult
```

In the directive assembly section (step 3 of `buildContextBundle`), branch on `mode`:

- `'flow'` (default): behavior unchanged — append the handoff block instruction as today
- `'orient'`: replace the handoff instruction with:

```
You are the Owner agent for this project. A new orient session has started.
Greet the user and await their direction. Respond conversationally.
No machine-readable handoff block is required.
```

This is a real string substitution in code, not a placeholder. The `'flow'` path is fully backward-compatible — no existing callers change.

### How orient calls the service

```ts
const { bundleContent, contextHash } = ContextInjectionService.buildContextBundle(
  roleKey,        // e.g. 'a-society__Owner'
  workspaceRoot,  // workspace root — same as projectRoot used by resolveVariableFromIndex
  '',             // no active artifact for orient sessions
  null,           // no additional directive prompt
  'orient'        // mode: suppress handoff directive, inject orient greeting
);
```

`workspaceRoot` is passed as `projectRoot` because `resolveVariableFromIndex` resolves `$VAR` references relative to the workspace root (it looks for `a-society/a-docs/indexes/main.md` and `a-society/index.md` relative to that path). This is identical to how flow sessions use the service.

### Initial user message

```
"A new orient session has started. Greet the user and await their direction."
```

This is the first element of `messageHistory` for the initial LLM call. It gives the model a clear starting instruction without requiring the user to speak first.

### a-docs/ format dependencies

Orient introduces no new `a-docs/` format dependencies beyond those already present in the registry-based injection system. The `'a-society__Owner'` registry entry and `resolveVariableFromIndex` already carry the coupling obligation between the runtime and the required-reading files. No extension to the coupling map is required for orient specifically.

The one new coupling point is the registry key derivation rule (`'{folderName}__Owner'`). This is a runtime-internal convention. If the registry key naming scheme ever changes, the `a-society.ts` binary's key derivation must be updated. This is a co-maintenance obligation internal to the runtime — not a `general/` or `a-docs/` format dependency.

---

## §3. LLM Gateway Reuse

`LLMGateway.executeTurn(systemPrompt, messageHistory)` is reused without modification.

`orient.ts` instantiates a new `LLMGateway`. The conversation loop is:

```
1. Build systemPrompt via ContextInjectionService (mode: 'orient')
2. Call llm.executeTurn(systemPrompt, [initialUserMsg]) → stream initial Owner greeting
3. Append initialUserMsg and response to history
4. Loop:
   a. Print prompt indicator (e.g., "\n> ")
   b. Read line from stdin via readline
   c. If line is 'exit', 'quit', or readline closes (EOF/SIGINT): break
   d. Append { role: 'user', content: line } to history
   e. Call llm.executeTurn(systemPrompt, history) → stream response
   f. Append { role: 'assistant', content: response } to history
5. Print "Orient session closed."
```

`systemPrompt` is assembled once at session start and is stable for the session's duration. `history` is a `MessageParam[]` that grows each turn. The LLM Gateway's streaming model (writing to `process.stdout` during `executeTurn`) is compatible with the readline loop — readline reads from `process.stdin`; there is no conflict.

**`llm.ts` change (implementation deviation, accepted):** `orient.ts` imports `MessageParam` from `./llm.js` rather than directly from the Anthropic SDK. To support this, `llm.ts` adds `export type { MessageParam }` on line 3, re-exporting the type across the module boundary. This is the only change to `llm.ts`. It introduces no behavioral difference and no new runtime dependency. The spec originally stated "llm.ts requires no changes" — this note corrects that statement.

---

## §4. CLI Interface

### `orient` command signature

```
tsx src/cli.ts orient <workspaceRoot> <roleKey>
```

- `workspaceRoot`: required — absolute or relative path to the workspace root (the directory containing `a-society/` and project folders). Resolved to absolute via `path.resolve` before use.
- `roleKey`: required — the registry key for the role to load (e.g. `a-society__Owner`). The `a-society` binary derives and passes this; direct CLI callers must supply it.
- No additional flags for MVP.

### Integration with `cli.ts`

Add a new branch to the existing `if/else if` dispatch. Import `runOrientSession` from `./orient.js` at the top of `cli.ts`. `path` is already available via `node:path` (add import if not present).

**New branch — add after the `flow-status` branch:**

```ts
} else if (command === 'orient') {
  const [workspaceRoot, roleKey] = args.slice(1);
  if (!workspaceRoot || !roleKey) {
    console.error('Usage: orient <workspaceRoot> <roleKey>');
    process.exit(1);
  }
  runOrientSession(path.resolve(workspaceRoot), roleKey);
}
```

`runOrientSession` is async. The call is unawaited at the top level — consistent with how `startFlow` and `resumeFlow` are currently invoked. The process remains alive during the async operation via the Node.js event loop.

**Update usage message** in the final `else` branch:

```ts
console.log('Available CLI commands: start-flow, resume-flow, flow-status, orient');
```

**Threading path:** `path.resolve(workspaceRoot)` is called in `cli.ts` before passing to `runOrientSession`. The `runOrientSession` function signature accepts pre-resolved absolute paths. This threading is fully specified here.

---

## §5. a-society Binary

### Directory structure

```
a-society/
  runtime/
    bin/
      a-society       ← shell wrapper (the npm bin entry; chmod +x; no extension)
      a-society.ts    ← TypeScript source the wrapper invokes
    src/
      cli.ts          ← modified: orient branch added
      orient.ts       ← new
      injection.ts    ← modified: mode parameter added
      ...
    package.json      ← modified: bin field and @inquirer/prompts added
  install.sh          ← new: cd runtime && npm install && npm link
```

The binary files live inside `runtime/` because the `"bin"` field in `package.json` only accepts paths relative to that `package.json`. `npm link` reads `runtime/package.json` and symlinks to whatever `"bin"` points to — the file must be inside the package.

### Shell wrapper

**`a-society/runtime/bin/a-society`** (chmod +x):

```sh
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "$(realpath "$0")")" && pwd)"
exec "$SCRIPT_DIR/../node_modules/.bin/tsx" "$SCRIPT_DIR/a-society.ts" "$@"
```

`realpath "$0"` resolves the symlink created by `npm link` back to the actual package location. `exec` replaces the shell process with `tsx`, passing all arguments through. `realpath` (not `readlink -f`) is used for macOS and Linux compatibility without requiring GNU coreutils.

No build step required. Consistent with the rest of the runtime's execution model (`npm start` calls `tsx src/cli.ts` directly).

### `a-society.ts` responsibilities

```
1. workspaceRoot = process.cwd()
2. projects = discoverProjects(workspaceRoot)      // see §6
3. If projects.length === 0: print not-found message, exit 0
4. If projects.length === 1: skip menu, use projects[0]
5. If projects.length > 1: present select prompt via @inquirer/prompts
6. selectedFolderName = selected project's directory name
7. roleKey = `${selectedFolderName}__Owner`
8. runOrientSession(workspaceRoot, roleKey)        // imported from ../src/orient.ts
```

`runOrientSession` is imported directly — no child process spawn.

### Menu library

**`@inquirer/prompts`** — ESM-compatible, modular Inquirer v9+. Add to `"dependencies"` in `package.json`. Use the `select` export:

```ts
import { select } from '@inquirer/prompts';

const selectedPath = await select({
  message: 'Select a project:',
  choices: projects.map(p => ({ name: p.displayName, value: p.folderName }))
});
```

`displayName` is the directory name (last path component). `value` is the folder name used to derive the registry key.

---

## §6. Project Discovery

### Algorithm

Implemented as a synchronous function in `a-society.ts`:

```
function discoverProjects(workspaceRoot: string): Array<{ displayName: string; folderName: string }>

1. Read all entries via fs.readdirSync(workspaceRoot, { withFileTypes: true })
2. Filter to entries where entry.isDirectory() is true
3. Exclude any entry whose name is 'a-society'
4. For each remaining entry: check fs.existsSync(path.join(workspaceRoot, entry.name, 'a-docs', 'agents.md'))
5. Collect matches as { displayName: entry.name, folderName: entry.name }
6. Return the collected array
```

Scan depth: one level only (immediate children of `workspaceRoot`). No recursive descent.

### Workspace root

`process.cwd()` at invocation time. No upward walk. The expected invocation point is the workspace root (the directory containing `a-society/` and the user's project folders). This matches the framework's canonical directory layout described in the vision.

### Edge case table

| Case | Behavior |
|---|---|
| No matching projects | Print: `"No initialized A-Society projects found in [cwd].\nRun the A-Society Initializer to bootstrap a project."` Exit 0. |
| `a-society/` in scan | Excluded by name (step 3). The framework directory is not a user project. |
| `a-docs/` present, no `agents.md` | Not matched. `a-docs/agents.md` is the sole discovery signal. Partial initialization = not discoverable. |
| Single project found | Skip menu. Print: `"Found 1 project: [name]. Starting orient session..."` Call `runOrientSession` directly. |
| Multiple projects | Show `select` prompt. |
| Project found but registry entry absent | Discovery succeeds. Error surfaced inside `runOrientSession` when registry lookup fails. Discovery finds candidates; it does not validate registry coverage. |
| `agents.md` exists, `roles/owner.md` absent | Discovery succeeds. Error surfaced at context injection time (`resolveVariableFromIndex` fails to read the role file). Not a discovery concern. |
| Invoked from inside a project subdirectory | `cwd` is the project folder. Its children are not projects. Not-found message printed. Expected behavior; document in README. |

---

## §7. Install Script

### Approach: `npm link` via shell script

**Location:** `a-society/install.sh` (chmod +x)

**Content:**

```sh
#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing A-Society..."
cd "$SCRIPT_DIR/runtime"
npm install
chmod +x bin/a-society
npm link

echo ""
echo "Installation complete. The 'a-society' command is now available."
echo ""
echo "Before running, set your Anthropic API key:"
echo "  export ANTHROPIC_API_KEY=your_api_key_here"
echo ""
echo "Usage: cd to your workspace root, then run 'a-society'"
```

**What `npm link` does:** Reads `runtime/package.json`, sees `"bin": { "a-society": "./bin/a-society" }`, and creates a global symlink from `{npm-global-bin}/a-society` to `runtime/bin/a-society`. The shell wrapper then uses `realpath` to resolve the symlink back to the package and calls the local `tsx`.

**Idempotency:** `npm install` and `npm link` are both idempotent. Re-running the script is safe.

**`package.json` `"bin"` field:**

```json
"bin": {
  "a-society": "./bin/a-society"
}
```

**ANTHROPIC_API_KEY:** Surfaced in install output. The `LLMGateway` reads `process.env.ANTHROPIC_API_KEY` at construction time. If absent or invalid, an `LLMGatewayError` with type `'AUTH_ERROR'` is thrown on the first LLM turn and printed to stderr. The install script surfaces this expectation at install time; the README should include it as a prerequisite step before the `a-society` invocation step.

**Post-install user action:** Set `ANTHROPIC_API_KEY`. No other action required.

---

## §8. Files Changed

| File | Action | Description |
|---|---|---|
| `runtime/src/types.ts` | Modify | Add `OrientSession` interface |
| `runtime/src/injection.ts` | Modify | Add optional `mode: 'flow' \| 'orient'` parameter to `buildContextBundle`; branch directive assembly on mode |
| `runtime/src/orient.ts` | New | `runOrientSession(workspaceRoot, roleKey)` — registry lookup, context bundle via extended service, LLM instantiation, readline conversation loop |
| `runtime/src/cli.ts` | Modify | Import `runOrientSession`; add `orient` command branch; update usage message |
| `runtime/src/llm.ts` | Modify | Re-export `MessageParam` type (`export type { MessageParam }`) for import by `orient.ts` across module boundary |
| `runtime/bin/a-society.ts` | New | Binary source: `discoverProjects`, single-project shortcut, `select` menu, registry key derivation, `runOrientSession` call |
| `runtime/bin/a-society` | New | Shell wrapper (chmod +x) — resolves symlink via `realpath`, calls local `tsx` against `a-society.ts` |
| `runtime/package.json` | Modify | Add `"bin": { "a-society": "./bin/a-society" }`; add `"@inquirer/prompts"` to `"dependencies"` |
| `a-society/install.sh` | New | Install script (chmod +x) — `npm install`, `chmod +x bin/a-society`, `npm link`; prints API key instructions |

Total: 4 new files, 4 modified files.

---

## Bootstrapping exemption note

This document was produced in the `20260327-runtime-orient-session` record folder, which predates the Plan Artifact Validator (Component 7). The record folder's artifacts do not conform to any validator schema requirement because Component 7 did not exist when this flow began. This is an expected non-conformance, not an error.

---

## Open items for Owner

**Watch item — coupling map (not a blocker):** Orient introduces one new runtime-internal coupling: the registry key derivation rule (`'{folderName}__Owner'`). This is internal to the runtime — not a `general/` or `a-docs/` format dependency. The coupling map taxonomy does not need to cover it. Owner has indicated the coupling map may need extension for runtime `a-docs/` path dependencies more broadly; that remains open for future decision.

No other open items. All five design questions from the workflow plan are resolved. Owner approval at `owner-phase0-gate` unblocks the Runtime Developer.

---

*Ready for Owner review. Artifact path: `a-society/a-docs/records/20260327-runtime-orient-session/03-ta-phase0-architecture.md`*
