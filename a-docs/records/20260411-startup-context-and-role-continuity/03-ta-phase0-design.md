**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — TA Phase 0 Design Advisory
**Type:** Technical Architect -> Owner
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Open Question Resolutions

Five open questions were called out in the brief. Resolved here before the numbered design sections that depend on them.

**Q1 - Cleanest same-role continuity mechanism for the single-active-role case?**
**Resolution:** Keep node-keyed transcripts for same-node resume, and add a small flow-scoped role-continuity ledger that is rendered as an explicit carried-forward node-entry summary when the same role returns later at a different node.

This rejects both extremes:

- not full role-scoped transcript reuse, because that would drag prior node-specific task input, repairs, and human turns into later nodes and would turn future same-role parallel handling into a transcript-mixing problem
- not pure on-the-fly reconstruction with no persisted continuity state, because the runtime needs an explicit, durable distinction between "same node resumed" and "same role returning later"

The selected model is the smallest mechanism that preserves continuity without sacrificing node isolation.

**Q2 - Where should the Owner-specific bootstrap prompt live?**
**Resolution:** In `a-society/runtime/src/orchestrator.ts`, at the fresh interactive bootstrap entry point only.

`a-society/runtime/src/orient.ts` must stop inventing a startup prompt based on empty history. `runInteractiveSession(...)` becomes a generic session runner that requires the caller to provide the initial user message. This prevents Owner-first-turn behavior from leaking to non-Owner roles.

**Q3 - Cleanest boundary between stable system context and task-scoped user input?**
**Resolution:** The system prompt bundle contains only stable runtime-owned contracts plus required-reading documents. Node artifacts, improvement instructions, findings files, continuity summaries, and node-entry task framing move out of `buildContextBundle(...)` and are delivered as appended user-message input at node entry.

**Q4 - Which doc surfaces actually need wording changes?**
**Resolution:** Two surfaces need change:

- `a-society/a-docs/roles/owner.md` because it still tells the Owner to read `$A_SOCIETY_WORKFLOW` at request time even though that file is already startup-injected
- `a-society/general/instructions/roles/required-readings.md` because the runtime contract now needs an explicit reusable rule: startup-injected required reading counts as already loaded and role docs should not instruct default rereads of those files

Assessed and no change required:

- `a-society/general/roles/owner.md` is already compatible; it does not tell the Owner to reread injected authority files
- `a-society/general/instructions/roles/main.md` already states that role docs should not enumerate phase-triggered read cues and that runtime-managed context loading is the authority

**Q5 - Does the model require persisted state migration?**
**Resolution:** Yes, but only a small one. `FlowRun.stateVersion` advances from `"2"` to `"3"` so a role-continuity ledger can be persisted. Existing state is silently migrated by adding an empty continuity ledger; node-keyed session transcripts remain valid and unchanged.

This is intentionally minimal. No transcript backfill is required for legacy flows, because the new continuity layer is a quality improvement, not a correctness dependency.

---

## Coupling-Map Consultation

`$A_SOCIETY_EXECUTABLE_COUPLING_MAP` was consulted before completing this advisory.

Relevant standing dependency:

- `a-docs/roles/required-readings.yaml` schema -> Runtime context injection

Relevant standing guidance row:

- `$A_SOCIETY_RUNTIME_INVOCATION` -> Operator-facing executable behavior

This flow is a Type C executable behavior change. No new coupling-map row is required, but the existing runtime-context-injection and operator-reference obligations tighten in two ways:

1. the runtime bundle must now distinguish "already loaded stable authority" from "task-scoped node input"
2. `$A_SOCIETY_RUNTIME_INVOCATION` must describe startup and resume semantics that match the implemented continuity model

---

## §1 - Success Criteria

This flow is fixed only when all four boundaries align: injected startup context, first-turn prompting, same-role later-node continuity, and doc-side wording.

After implementation:

1. a fresh Owner bootstrap turn uses the already injected required-reading set directly; it does not tell the model to reread the project log or workflow as the first move
2. a role returning later at a different node in the same flow enters as an in-flow continuation, not as a blank startup session
3. same-node `prompt-human` pause/resume remains full-transcript continuity on the existing node-scoped session
4. same-role parallel activation does not silently mix transcripts; node-scoped isolation remains authoritative when that case appears
5. active node artifacts and improvement-step materials are delivered as task input at node entry, not baked into the stable system bundle
6. A-Society guidance no longer nudges the Owner to reread startup-injected authority files by default

Success is not "the prompts sound nicer." Success is a declared session contract:

- startup authority is loaded once by the runtime
- bootstrap prompting uses that fact
- node entry delivers current work as conversational input
- continuity across repeated-role nodes is explicit and bounded

---

## §2 - Current-State Boundary Evaluation

### 1. What the runtime currently injects

`a-society/runtime/src/injection.ts` currently builds one system-prompt bundle containing:

- runtime-managed handoff contract
- required-reading documents
- active workspace artifacts

The current heading is `--- MANDATORY CONTEXT LOADING FOR <roleKey> ---`, which misstates the runtime contract. By the time the model sees these files, the runtime has already loaded them. The heading sounds like an instruction to start reading rather than a declaration that the context is present.

### 2. What the first-turn prompt currently asks for

`a-society/runtime/src/orient.ts` injects this message whenever `history.length === 0`:

`A new session has started. Read the project log in your context, give a brief status of where the project is at, ask what the user wants to work on, and end with a \`type: prompt-human\` handoff block.`

This is structurally wrong in two ways:

- it is generic empty-history behavior, even though the desired startup behavior is Owner-specific
- it tells the model to read a file the runtime has already injected

### 3. What the node-keyed session model currently preserves

`a-society/runtime/src/orchestrator.ts` keys persisted sessions by `sessionId = ${flowId}__${nodeId}` and stores transcript history inside that node-scoped session file. This is correct for same-node `prompt-human` pause/resume and for concurrent active nodes.

The current problem is not the node-keyed transcript model itself. The problem is that no explicit role-continuity layer exists above it. When the same role returns later at a new node, the runtime creates a fresh empty session and only seeds:

- optional human input
- a flat `Active artifact: ... Please proceed.` message

That is not enough to re-establish in-flow phase continuity for repeated-role nodes.

### 4. What the A-Society Owner role currently says

`a-society/a-docs/roles/owner.md` still says:

`Workflow routing — routing work into the appropriate workflow by default. When the user makes a request, read $A_SOCIETY_WORKFLOW to route it.`

That wording is now out of contract with runtime-managed startup injection. The role should still own routing, but it should not tell the agent to reread a startup-injected authority file by default.

### 5. What belongs to runtime behavior vs Curator-managed wording

**Runtime-owned fixes:**

- stable system bundle framing
- Owner bootstrap message ownership
- node-entry task-input delivery
- same-role continuity state and rendering
- resume classification between same-node resume and same-role later-node return

**Curator-managed alignment:**

- remove A-Society-local startup reread wording from `a-society/a-docs/roles/owner.md`
- add reusable wording in `a-society/general/instructions/roles/required-readings.md` clarifying that startup-injected required reading counts as already loaded in runtime-managed sessions

---

## §3 - Startup Context Contract

### Approved startup distinction

There are now three distinct entry cases:

1. **Fresh interactive Owner bootstrap** - the flow has not started yet; the runtime is bootstrapping from the Owner role
2. **Resumed same-node session** - a node-scoped session already exists and has transcript history
3. **New node entry** - the runtime is activating a workflow node with no existing transcript for that node

These are not interchangeable and must not share one generic `history.length === 0` behavior.

### Stable bundle contract

`ContextInjectionService.buildContextBundle(...)` remains the stable system-prompt assembler, but its responsibility narrows to:

- role announcement
- current date
- runtime-managed handoff contract
- required-reading files resolved from `required-readings.yaml`

It must no longer inject active artifacts or improvement-step input.

The required-reading heading must change from:

`--- MANDATORY CONTEXT LOADING FOR <roleKey> ---`

to approved framing of this shape:

`--- RUNTIME-LOADED REQUIRED READING FOR <roleKey> ---`

followed immediately by an explicit statement:

`These files are already loaded into this session by the runtime. Use them directly. Do not spend your first turn rereading or re-listing them unless the current task specifically requires close inspection of one file.`

This wording belongs in the bundle framing, not only in the bootstrap prompt, because the contract is broader than the Owner's first turn.

### Exact Owner bootstrap behavior

The fresh interactive Owner bootstrap message is caller-owned and lives in `a-society/runtime/src/orchestrator.ts`.

Approved first user message:

`A fresh interactive Owner session has started. The runtime already loaded your required-reading authority files into context. Using that loaded context, summarize the project log, give a brief status of where the project is at, ask what the user wants to work on, and end with a \`type: prompt-human\` handoff block. Do not spend this first turn rereading the log or workflow unless close inspection is necessary for the status you give.`

This message is specific enough to stop redundant rereads, but it still leaves the Owner's first-turn work product intact: brief status plus human prompt.

### Where the trigger lives

The trigger is not "empty history." The trigger is:

- runtime bootstrap path
- current role is Owner
- no existing bootstrap transcript yet

Implementation consequence:

- `a-society/runtime/src/orient.ts` must not auto-seed a startup user message
- `a-society/runtime/src/orchestrator.ts` owns the Owner bootstrap message and pushes it into `bootstrapHistory` before the first `runInteractiveSession(...)` call

### Reusable startup pattern under the Owner-specific wording

Yes, a reusable pattern exists under the Owner-specific wording:

- stable bundle says startup-injected required reading is already loaded
- callers own their initial user message

But the only approved runtime-owned bootstrap message in this flow is the Owner one above. Non-Owner roles do not inherit startup behavior from `runInteractiveSession(...)`.

---

## §4 - Same-Role Continuity Model

### Rejected model: full role-scoped transcript reuse

Do not reuse one transcript across all nodes for a role.

Reasons:

1. it preserves stale node-specific task artifacts and repair turns into later nodes
2. it makes future same-role parallel activation a transcript-sharing hazard
3. it couples same-node pause/resume and same-role later-node return into one history mechanism when they are different behaviors
4. it grows context monotonically across repeated-role nodes

### Rejected model: no persisted continuity layer, only fresh node entry

Also rejected. A fresh node entry with only the new artifact path does not tell the role that it is returning later inside an existing flow, and it does not preserve the minimum continuity needed for repeated-role gates.

### Selected model: node-scoped transcripts plus flow-scoped role-continuity ledger

Use two layers, each for a different job.

**Layer 1 - node-scoped session transcript**

- key remains `${flowId}__${nodeId}`
- owner: `RoleSession`
- purpose: exact same-node pause/resume continuity, including human replies, repairs, and partial assistant turns

**Layer 2 - flow-scoped role-continuity ledger**

- stored on `FlowRun`
- key is exact runtime `roleKey`
- purpose: compact continuity for later returns of the same role at a different node

Approved keying rule:

`roleKey = ${flowRun.projectNamespace}__${workflowNode.role}`

Worked example:

- namespace `a-society`
- workflow role `Owner`
- continuity ledger key `a-society__Owner`

### Data carried forward

Do not carry forward full transcripts. Carry forward only structured prior-node facts:

```ts
export interface RoleContinuityEntry {
  nodeId: string;
  outputArtifactPath: string | null;
  completedAt: string;
}
```

and per-role ledger state:

```ts
export interface RoleContinuityState {
  roleKey: string;
  completedNodes: RoleContinuityEntry[];
}
```

This is enough because the current node's real work product arrives separately as fresh task input.

### When the continuity state is produced and updated

Update `flowRun.roleContinuity[roleKey]` only when a node completes successfully and control moves forward from that node.

Approved update points:

- successful `targets` handoff
- terminal forward-pass node completion if the runtime passes through the same success path before closure

Do not update the continuity ledger on:

- `prompt-human`
- abort/suspension
- repair turns
- blank null-return suspension

Those belong to same-node transcript continuity, not role-continuity state.

### How same-role new-node entry behaves

When the runtime activates a node with no existing node-scoped transcript:

1. derive the node's `roleKey`
2. check whether any other active node in `flowRun.activeNodes` currently resolves to the same `roleKey`
3. if another active same-role node exists, do not use role continuity; node isolation wins
4. otherwise, if `flowRun.roleContinuity[roleKey]` has entries, render them into the node-entry message as a compact continuity section
5. append the current node's active artifacts in the same node-entry user message

Approved continuity section shape:

`Role continuity from earlier nodes in this flow:`

followed by one line per prior completed node in completion order:

`- <nodeId> -> <artifactPath>`

If `artifactPath` is empty:

`- <nodeId> -> (no artifact recorded)`

### Same-node human pause/resume

Unchanged in principle, but now explicit by contract:

- if a node-scoped session already exists and has transcript history, that transcript is authoritative
- the runtime does not regenerate the node-entry message
- human input is appended as a plain new user turn to the preserved transcript

This is the only case that reuses full prior conversation history.

### Same-role parallel activation

Out of scope for continuity restoration. The runtime must preserve isolation, not invent shared continuity.

Approved behavior when another active node with the same `roleKey` exists:

- keep node-scoped session IDs exactly as today
- do not inject the role-continuity summary into the new node
- treat the node as a fresh node-scoped entry with only its current task inputs

This is explicit isolation, not silent transcript mixing.

---

## §5 - Task Input Delivery Model

### Stable context vs task input boundary

**Remains in `buildContextBundle(...)`:**

- role announcement
- date
- runtime handoff contract
- required-reading documents

**Moves out of `buildContextBundle(...)` into appended user-message input:**

- active workflow node artifacts
- improvement-step instruction files
- findings files for backward pass
- same-role continuity summary
- node-entry phase framing
- node-entry human input supplied at activation time

### One combined node-entry user message

Use one combined user message at first entry to a node. Do not split continuity and active artifacts into separate first-turn user messages.

Reasons:

1. the model receives one coherent "why am I here now?" packet
2. the last message remains a user message with the full task frame
3. same-node resume stays simple because that combined entry message is emitted only once

### Approved forward-node entry shape

The runtime should render a combined node-entry message of this form:

1. header stating this is workflow node `<nodeId>` for role `<role>`
2. explicit note that this is workflow execution, not fresh role startup
3. optional role-continuity section from §4
4. `Current task inputs:` section
5. one `[FILE: <repo-relative path>]` block per active artifact
6. if an artifact path does not exist yet on disk, render `(File does not exist yet)` under that file marker
7. optional `Human input:` section if the node is activated with explicit human input
8. final instruction line: `Proceed from these current node inputs.`

Approved fixed line for the non-startup distinction:

`This is a workflow node entry, not a fresh role-orientation session. Use the current node inputs and the already loaded startup authority to do this node's work.`

### Improvement-phase task input

Yes, the same rule applies to improvement.

For improvement sessions:

- the stable role context still belongs in the system bundle
- `a-docs/improvement/meta-analysis.md` or `a-docs/improvement/synthesis.md` is task-scoped input for that step and must move into the first user message
- findings files also move into that first user message

Approved improvement entry pattern:

- step label
- record folder path
- instruction file `[FILE: ...]`
- findings file blocks
- exact required completion signal reminder

### Same-node resume and same-role new-node return under this model

**Same-node resume:**

- no new node-entry packet
- append only the human reply

**Same-role new-node return:**

- new node-entry packet
- continuity section included when safe
- current node artifacts included

**First appearance of a role at a node:**

- new node-entry packet
- no continuity section unless prior same-role nodes exist

---

## §6 - State, Persistence, and Resume Behavior

### Flow state changes

`FlowRun` gains a new optional field:

```ts
roleContinuity?: Record<string, RoleContinuityState>;
```

`stateVersion` advances from `"2"` to `"3"`.

### What remains node-keyed

These remain node-keyed and unchanged in principle:

- `RoleSession` files in `runtime/.state/sessions/`
- `TurnRecord` storage in `runtime/.state/turns/`

This preserves same-node resume semantics and existing parallel-node isolation.

### Silent migration

`SessionStore.loadFlowRun()` must support all prior states:

- no `stateVersion` -> treat as legacy and migrate
- `"1"` -> migrate
- `"2"` -> migrate
- `"3"` -> read as current

Approved migration behavior:

1. if `flow.roleContinuity` is absent, initialize it to `{}`
2. set `flow.stateVersion = "3"`
3. persist on next normal save

No transcript rewrite is required. No session-file rename is required.

### Why no transcript backfill is required

The continuity ledger is a convenience layer for later same-role node returns. It is not the source of truth for same-node resume and it is not required for flow correctness. Legacy flows migrated from state version 2 therefore remain valid immediately:

- same-node resumes still work because node sessions are unchanged
- new v3 continuity entries begin to accumulate as nodes complete after upgrade

### What survives process restart

Must survive restart:

- `FlowRun`
- node-scoped `RoleSession` transcript history
- role-continuity ledger

Can be reconstructed at activation time:

- node-entry combined user message
- rendered file blocks from current artifact paths

### Bootstrap session persistence

No new pre-flow bootstrap persistence is introduced in this flow. The Owner bootstrap session before a flow exists remains in-memory only. This advisory changes the prompt contract, not bootstrap-session durability.

---

## §7 - Framework-Guidance Alignment Surface

### Required Curator-managed changes

**1. `a-society/a-docs/roles/owner.md`**

Required change. Remove the explicit reread cue:

`When the user makes a request, read $A_SOCIETY_WORKFLOW to route it.`

Replace it with wording that preserves routing authority without a reread instruction. Approved intent:

- the Owner owns workflow routing
- the workflow directory is already in startup context
- the role file should not tell the Owner to reread that file by default

**2. `a-society/general/instructions/roles/required-readings.md`**

Required change. Add a reusable runtime contract rule:

- in runtime-managed sessions, required-reading files injected at startup count as already loaded
- role docs and runtime-owned startup prompts must not instruct default rereads of those files
- manual/human orientation may still follow the ordered reading sequence in the YAML file

This is the reusable counterpart of the A-Society-local Owner wording fix.

### Assessed and no change required

**`a-society/general/roles/owner.md`**

No change required. The template already says:

- ask what the user wants to work on after confirming context
- route via workflow by default
- do not enumerate before-X read-Y cues

It does not currently contradict the approved runtime contract.

**`a-society/general/instructions/roles/main.md`**

No change required. It already says role docs should not carry context-loading prose and should not enumerate workflow-triggered read cues.

### Local-only vs reusable

The wording fix is not A-Society-local only.

- the concrete role-file correction is A-Society-local: `a-society/a-docs/roles/owner.md`
- the underlying rule is reusable and belongs in `a-society/general/instructions/roles/required-readings.md`

---

## §8 - Files Changed

| File | Action | Required change |
|---|---|---|
| `a-society/runtime/src/injection.ts` | Modify | Narrow `buildContextBundle(...)` to stable runtime-owned context only. Remove active-artifact injection from the bundle. Change required-reading framing from "MANDATORY CONTEXT LOADING" to "RUNTIME-LOADED REQUIRED READING" and include the explicit already-loaded rule in the bundle text. |
| `a-society/runtime/src/orient.ts` | Modify | Remove the generic empty-history startup prompt. `runInteractiveSession(...)` must require caller-owned initial user input and must not apply Owner startup behavior based on `history.length === 0`. Keep same-node transcript execution behavior unchanged. |
| `a-society/runtime/src/orchestrator.ts` | Modify | Add explicit Owner bootstrap message at fresh flow start. Import `buildOwnerBootstrapMessage` and `buildForwardNodeEntryMessage` from `a-society/runtime/src/session-entry.ts`. Keep node session keys as `${flowId}__${nodeId}`. On first entry to a node, build one combined node-entry user message containing node framing, optional role continuity, active artifact file blocks, and optional human input. Update `flowRun.roleContinuity[roleKey]` only on successful node completion. When another active node has the same role, suppress role continuity instead of mixing transcripts. |
| `a-society/runtime/src/types.ts` | Modify | Add `RoleContinuityEntry`, `RoleContinuityState`, and `FlowRun.roleContinuity`. Update the `stateVersion` comment to `"3"` as the current schema. |
| `a-society/runtime/src/store.ts` | Modify | Persist the new `FlowRun.roleContinuity` field. Silently migrate state versions 1 and 2 to 3 by initializing an empty continuity ledger. Do not rename or rewrite existing node-scoped session files. |
| `a-society/runtime/src/improvement.ts` | Modify | Import `buildImprovementEntryMessage` from `a-society/runtime/src/session-entry.ts`. Stop passing improvement instruction files and findings files as system-bundle artifacts. Deliver them as the first user message for each improvement step, with exact completion-signal instructions in that message. |
| `a-society/runtime/src/session-entry.ts` | Create | New helper module owning the exact text templates and file-block rendering for: fresh Owner bootstrap message, forward-pass node-entry message, and improvement-step entry message. This file is the single authorship point for those runtime-generated textual fields. |
| `a-society/runtime/INVOCATION.md` | Modify | Document that startup-injected required reading is already loaded, that fresh Owner bootstrap uses that loaded context, that `prompt-human` resumes the same node-scoped session, that later same-role returns receive an explicit continuity summary plus current node inputs, and that same-role parallel continuity remains isolated rather than shared. |
| `a-society/a-docs/roles/owner.md` | Modify | Remove the explicit instruction to reread `$A_SOCIETY_WORKFLOW` at request time. Preserve routing authority without a startup reread cue. |
| `a-society/general/instructions/roles/required-readings.md` | Modify | Add the reusable rule that runtime-injected required reading counts as already loaded in runtime-managed sessions, while manual orientation may still follow the YAML reading order. |
| `a-society/runtime/test/context-injection.test.ts` | Modify | Assert that the context bundle contains only stable runtime-owned context plus required-reading files, uses the already-loaded framing, and no longer includes active artifact content. |
| `a-society/runtime/test/observability.test.ts` | Modify | Update `runInteractiveSession(...)` call expectations to the caller-owned-initial-message contract and cover the absence of generic auto-bootstrap seeding in `orient.ts`. |
| `a-society/runtime/test/session-entry.test.ts` | Create | Assert the exact runtime-generated text for the Owner bootstrap message, forward-node entry message, continuity section rendering, and improvement-step entry message. |
| `a-society/runtime/test/integration/same-role-continuity.test.ts` | Create | Cover four behaviors in one repeated-role workflow harness: fresh Owner bootstrap uses the explicit Owner message, same-node `prompt-human` resume preserves transcript continuity, later same-role node entry receives continuity summary plus current task input as user message content, and same-role parallel activation omits continuity rather than mixing transcripts. |
| `a-society/runtime/test/invocation-doc.test.ts` | Create | Add a lightweight doc-contract test that checks `a-society/runtime/INVOCATION.md` for the approved startup/resume semantics introduced by this flow. |

### Explicitly assessed but not changed

`a-society/general/roles/owner.md` was evaluated and requires no modification in this flow.

---

## §9 - Verification and Test Boundary

The Orchestration Developer's verification must prove behavior, not just that tests ran.

### Automated validation requirements

**1. Fresh Owner startup uses the Owner-specific bootstrap contract**

Prove that the first user message for a fresh interactive Owner bootstrap is the explicit Owner bootstrap message from `session-entry.ts`, not a generic empty-history branch in `orient.ts`.

**2. Fresh Owner startup does not depend on rereading already injected authority**

Prove two things:

- the system bundle states required reading is already loaded
- the bootstrap message tells the model to use that loaded context rather than reread it

This belongs in `context-injection.test.ts` and `session-entry.test.ts`.

**3. Same-node `prompt-human` pause/resume preserves continuity**

Prove that:

- the node-scoped session transcript is reused
- the runtime does not regenerate the node-entry packet
- the resumed turn appends only the human reply

This belongs in `same-role-continuity.test.ts`.

**4. Same-role later-node return regains context without blank restart**

Use a repeated-role workflow such as:

- Owner intake
- Technical Architect
- Owner gate

Prove that the later Owner node's first user message contains:

- the non-startup node-entry framing
- the prior Owner continuity section
- the current incoming artifact content

and does not contain the fresh Owner bootstrap message.

**5. Active node artifacts are delivered as user input, not system bundle**

Prove that active artifact file content is absent from `buildContextBundle(...)` and present instead in the initial node-entry user message.

Apply the same proof to improvement-step instruction and findings delivery.

**6. Same-role parallel path remains isolated**

Prove that when another active node has the same role:

- node sessions remain node-keyed
- no prior same-role continuity summary is injected into the new node
- no transcript history from the other node is reused

The requirement is explicit isolation or explicit unsupported behavior, not shared history.

**7. Operator-facing documentation stays accurate**

Automated doc-contract coverage must confirm that `a-society/runtime/INVOCATION.md` mentions:

- required reading is already loaded at session start
- `prompt-human` resumes the same node session
- later same-role returns use a carried-forward continuity summary plus current task input

This is supplemented, not replaced, by manual integration review.

### Manual integration review requirements

At the TA integration-review gate, compare implementation against:

- the exact Owner bootstrap string
- the exact bundle framing rule
- the node-entry message shape
- same-node vs same-role-new-node classification
- `runtime/INVOCATION.md`

The integration gate is not cleared by command success alone. The runtime contract and the operator-facing reference must match.

---

## Result

The approved Phase 0 design is:

- stable startup authority stays in the system bundle and is explicitly marked as already loaded
- Owner bootstrap behavior is explicit and caller-owned in the bootstrap path
- node task inputs move to appended user-message delivery
- node-scoped transcripts remain authoritative for same-node resume
- a small role-continuity ledger supports later same-role returns without reusing full prior transcripts

This is specific enough for the Orchestration Developer to implement without inventing prompt ownership, continuity keying, or migration behavior during execution, and specific enough for the Curator to align the companion guidance surfaces afterward.
