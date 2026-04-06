**From:** Technical Architect
**To:** Owner
**Subject:** Phase 0 Architecture Advisory — In-Flow Human Interaction (Revised)
**Record:** `a-society/a-docs/records/20260405-inflow-human-interaction/`
**Date:** 2026-04-05

---

## §1 — Problem Restatement

In-flow agents are called with `autonomous: true`. Any response without a valid handoff block throws `HandoffParseError`, which `advanceFlow` catches and injects back as an error message — the agent cannot pause for human input.

The fix introduces a new handoff signal, `type: prompt-human`, that an agent emits when it needs a human reply before continuing. The runtime handles it by prompting the human, appending their reply to the session history, and resuming the agent — all within the existing `advanceFlow` retry loop.

---

## §2 — Design

### Core mechanism

`advanceFlow` already has a `while(true)` loop that accumulates turns in `injectedHistory`. Currently it handles one case: malformed handoff → inject error → loop. The `awaiting_human` kind slots into the same loop as a second case: prompt human → append reply → loop.

```
while (true):
  handoffResult = runInteractiveSession(autonomous: true, injectedHistory)

  kind === 'awaiting_human':
    print "> "
    read one line of human input
    append to injectedHistory as user turn
    save session
    continue  ← agent gets full conversation history on next LLM call

  kind === 'targets' / 'forward-pass-closed' / 'meta-analysis-complete':
    handle normally, break

  HandoffParseError (block present but malformed):
    inject error message, continue  ← existing behavior, unchanged
```

The agent's question text is already in `injectedHistory` as an assistant message (printed during the LLM turn). The human sees it, types a reply, and the session continues. This is a single continuous session history: same system prompt, same `injectedHistory` array, turns accumulating across all Q&A exchanges until the agent emits a real handoff.

### Exit during human prompt

If the human enters nothing (empty line), re-prompt. If the human types `exit` or `quit`, or the input stream closes, set `flowRun.status = 'awaiting_human'`, save state, and break. This is consistent with how `orient.ts` handles exit in the bootstrap REPL.

### `type: prompt-human` — no additional fields required

The question is in the agent's response text. The signal only needs to communicate "pause here for human input." No `role`, no `artifact_path`.

```handoff
type: prompt-human
```

### Why not extend existing handoff types

The three existing typed signals (`forward-pass-closed`, `meta-analysis-complete`) and the target form all route control to another agent. `prompt-human` is categorically different: it pauses within the current agent's session and returns control to the same agent after the human replies. Extending a target form would require a dummy role name and artifact path that carry no meaning. A dedicated signal type is correct.

---

## §3 — Interface Changes

### `types.ts` — `HandoffResult`

Add one variant to the union:

```typescript
export type HandoffResult =
  | { kind: 'targets'; targets: HandoffTarget[] }
  | { kind: 'forward-pass-closed'; recordFolderPath: string; artifactPath: string }
  | { kind: 'meta-analysis-complete'; findingsPath: string }
  | { kind: 'awaiting_human' };                                          // ← new
```

### `handoff.ts` — `HandoffInterpreter.parse`

In the `type`-dispatch block (current lines 55–79), add a new case before the unknown-type throw:

```typescript
if (payload.type === 'prompt-human') {
  return { kind: 'awaiting_human' };
}
```

No other changes. `HandoffParseError` and `HandoffMissingError` (as currently named) are unaffected; the `prompt-human` block parses successfully, so no error is thrown.

### `orchestrator.ts` — `advanceFlow`

**New import:**
```typescript
import readline from 'node:readline';
```

**New private helper on `FlowOrchestrator`:**

```typescript
private readHumanInput(
  inputStream: NodeJS.ReadableStream,
  outputStream: NodeJS.WritableStream
): Promise<string | null> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: inputStream, output: outputStream, terminal: true });
    rl.question('\n> ', (answer) => {
      rl.close();
      const line = answer.trim();
      if (line === 'exit' || line === 'quit' || line === '') {
        resolve(null);
      } else {
        resolve(line);
      }
    });
    rl.on('close', () => resolve(null));
  });
}
```

Note: empty input resolves to `null` (triggers exit). If re-prompting on empty is preferred, replace the `line === ''` branch with a recursive call. Either behavior is acceptable; the advisory recommends exit-on-empty for consistency with session abort semantics.

**In `advanceFlow`, inside `while(true)`, add handling for `kind === 'awaiting_human'`:**

Place this block immediately after the existing `if (handoffResult)` check opens (before the `forward-pass-closed` check), or as a new branch in the `if (handoffResult)` block:

```typescript
if (handoffResult.kind === 'awaiting_human') {
  const humanReply = await this.readHumanInput(inputStream, outputStream);
  if (humanReply === null) {
    // Human exited — suspend flow
    flowRun.status = 'awaiting_human';
    session.transcriptHistory = injectedHistory;
    SessionStore.saveRoleSession(session);
    SessionStore.saveFlowRun(flowRun);
    break;
  }
  injectedHistory.push({ role: 'user', content: humanReply });
  session.transcriptHistory = injectedHistory;
  SessionStore.saveRoleSession(session);
  // Do not save flowRun here — status remains 'running'
  continue;
}
```

**Thread `inputStream` and `outputStream` to `readHumanInput`:** These parameters are already present on `advanceFlow`. No signature change required.

### `orient.ts`

No changes.

### `general/instructions/communication/coordination/machine-readable-handoff.md`

Add `type: prompt-human` as a new typed signal form in the schema section, alongside the existing `forward-pass-closed` and `meta-analysis-complete` forms.

**When to emit:**
Emit `type: prompt-human` when the agent needs a human reply before it can continue — a clarification question, a missing input, or an approval that only the human can provide. The agent writes its question as normal response text and ends with this block.

**Schema:**
```yaml
type: prompt-human
```
No additional fields. The question content is in the response text; the block signals the runtime to pause and collect human input.

**Behavior:** The runtime prompts the human for a reply, appends it to the session history, and resumes the same agent session. The agent receives the full conversation history — including its own question and the human's reply — on the next turn. This may repeat across multiple exchanges; the session continues until the agent emits a routing handoff.

**Constraint:** Do not emit `type: prompt-human` at the end of a response that already has a clear next routing target. Use it only when the agent genuinely cannot determine the next step without human input.

---

## §4 — Files Changed

| File | Action | Summary |
|---|---|---|
| `a-society/runtime/src/types.ts` | Modify | Add `{ kind: 'awaiting_human' }` to `HandoffResult` union |
| `a-society/runtime/src/handoff.ts` | Modify | Parse `type: prompt-human` block; return `{ kind: 'awaiting_human' }` |
| `a-society/runtime/src/orchestrator.ts` | Modify | Add `readline` import; add `readHumanInput` helper; handle `awaiting_human` in `advanceFlow` loop |
| `a-society/general/instructions/communication/coordination/machine-readable-handoff.md` | Modify | Document `type: prompt-human` signal — schema, when to emit, runtime behavior, constraint |
| `a-society/runtime/src/orient.ts` | No change | — |

---

## §5 — Implementation Requirements by File

### `a-society/runtime/src/types.ts`

1. Add `| { kind: 'awaiting_human' }` to the `HandoffResult` union. No other changes.

### `a-society/runtime/src/handoff.ts`

1. In the `type`-dispatch block, add `if (payload.type === 'prompt-human') return { kind: 'awaiting_human' };` before the unknown-type throw.
2. No other changes. `HandoffParseError` is unchanged. The `prompt-human` block with unexpected extra fields parses successfully and those fields are silently ignored — this is acceptable since the type carries no required payload.

### `a-society/runtime/src/orchestrator.ts`

1. Add `import readline from 'node:readline';` to the import block.
2. Add `readHumanInput` as a private method on `FlowOrchestrator` per §3 spec. Method receives `inputStream` and `outputStream`; returns `Promise<string | null>`. `null` signals exit.
3. In `advanceFlow`'s `while(true)` loop, inside the `if (handoffResult)` block, add `awaiting_human` handling per §3: read human input; on `null` → set `flowRun.status = 'awaiting_human'`, save both session and flowRun, break; on reply → append to `injectedHistory` as user turn, save session only (flowRun status stays `'running'`), continue.
4. The existing `HandoffParseError` catch block is unchanged.
5. The `handoffResult === null` branch (user exited REPL) is unchanged.

### `a-society/general/instructions/communication/coordination/machine-readable-handoff.md`

1. Add `type: prompt-human` to the typed signal forms section, with schema, when-to-emit guidance, runtime behavior description, and the constraint against using it when a routing target is already known.
2. No changes to existing signal forms or field definitions.

---

## §6 — Open Questions

None. The design is fully specified within the existing session model. No framework direction decisions are implicated.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260405-inflow-human-interaction/03-ta-to-owner.md
```
