**From:** Technical Architect
**To:** Owner
**Artifact:** TA Advisory — Programmatic Improvement System
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-03

---

## Purpose

This advisory covers all three design areas in the Owner's brief: forward-pass-closed signal schema (§1), Component 4 redesign (§2), and runtime improvement orchestration (§3). Together they define the complete programmatic improvement system. Each section is specified to the level required for parallel, independent implementation by the Tooling Developer (Component 4 scope) and the Runtime Developer (orchestration scope) without further design consultation.

---

## §1 — Forward-Pass-Closed Signal

### 1.1 New Handoff Block Form

The handoff block schema (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`) currently defines two forms: single-target and array. This advisory introduces a **closure signal form** as a third valid form. The form is discriminated by a `type` field, which is absent in all existing valid blocks. Detection rule: if the parsed YAML payload is a non-array object and has a `type` field, it is a typed signal block; dispatch on the `type` value.

**Forward-pass-closed block:**

```handoff
type: forward-pass-closed
record_folder_path: <repo-relative path to the record folder>
artifact_path: <repo-relative path to the Owner's closure artifact>
```

Field definitions:

| Field | Type | Constraint | Purpose |
|---|---|---|---|
| `type` | string (literal) | Must be `"forward-pass-closed"` | Discriminator — distinguishes from standard handoff forms |
| `record_folder_path` | string | Repo-relative; non-empty | Tells the runtime where to find `workflow.md` and findings files |
| `artifact_path` | string | Repo-relative; non-empty | The Owner's closure artifact path (for audit trail and human reference) |

**What the Owner emits at forward pass closure:**

The Owner's closure artifact ends with this block after the natural-language prose. The Owner does not specify improvement mode — mode selection happens interactively after the runtime detects the signal.

Example:

```handoff
type: forward-pass-closed
record_folder_path: a-society/a-docs/records/20260403-programmatic-improvement-system
artifact_path: a-society/a-docs/records/20260403-programmatic-improvement-system/07-owner-forward-pass-closure.md
```

### 1.2 Meta-Analysis-Complete Block

The backward pass requires a completion signal from each meta-analysis session. This advisory introduces a second typed signal block in the same schema extension:

```handoff
type: meta-analysis-complete
findings_path: <repo-relative path to the produced findings artifact>
```

Field definitions:

| Field | Type | Constraint | Purpose |
|---|---|---|---|
| `type` | string (literal) | Must be `"meta-analysis-complete"` | Discriminator |
| `findings_path` | string | Repo-relative; non-empty | Path to the findings artifact just produced |

**Content delegation to Curator:** The `$GENERAL_IMPROVEMENT_META_ANALYSIS` file (authored by the Curator as part of this flow) must instruct agents to emit, upon completing their findings artifact, a `meta-analysis-complete` block with the path of the artifact they just produced. The Curator owns the language; the schema above is the required contract. The instruction must specify both the `type` value exactly (`meta-analysis-complete`) and the `findings_path` field name.

### 1.3 Updated Parser Types

`HandoffInterpreter.parse()` currently returns `HandoffTarget[]`. This return type must change to `HandoffResult` (defined in §4.1). The parse logic changes:

1. Extract the YAML payload from the `handoff` fenced block (existing logic, unchanged).
2. If payload is an **array** → existing array form → `{ kind: 'targets', targets: [...] }`.
3. If payload is a **non-array object** with a `type` field:
   - `type === 'forward-pass-closed'` → validate `record_folder_path` and `artifact_path` are non-empty strings; return `{ kind: 'forward-pass-closed', recordFolderPath, artifactPath }`. Throw `HandoffParseError` if either field is absent or empty.
   - `type === 'meta-analysis-complete'` → validate `findings_path` is a non-empty string; return `{ kind: 'meta-analysis-complete', findingsPath }`. Throw `HandoffParseError` if absent or empty.
   - `type` is any other value → throw `HandoffParseError('Unknown handoff signal type: [value]')`.
4. If payload is a **non-array object without a `type` field** → existing single-target form → validate `role` is non-empty, return `{ kind: 'targets', targets: [{ role, artifact_path }] }`.
5. If none of the above → throw `HandoffParseError`.

`runInteractiveSession` in `orient.ts` currently returns `HandoffTarget[] | null`. Its return type must change to `HandoffResult | null`. All call sites in `orient.ts` that pass the parsed result through must propagate the new type. No logic changes to the session loop itself; the return type change propagates the parser's output without modification.

---

## §2 — Component 4 Redesign

### 2.1 Removed Field: `prompt`

The `prompt` field in `BackwardPassEntry` is removed entirely. Component 4 is now a runtime helper; the runtime owns context injection and the initial user message for each session. Component 4 returns structural data only. The `sessionInstruction` field is retained (the runtime uses it to determine whether to reuse a session or start fresh).

### 2.2 New Field: `findingsRolesToInject`

`BackwardPassEntry` gains a new field: `findingsRolesToInject: string[]`. This is the list of role names whose findings the runtime should locate and inject for this step. Role names, not file paths — the runtime resolves paths by calling `locateFindingsFiles` at session-start time (after prior roles have produced their findings). For parallel mode and synthesis, this field has specific semantics described in §2.4.

Updated `BackwardPassEntry`:

```typescript
export interface BackwardPassEntry {
  role: string;
  stepType: 'meta-analysis' | 'synthesis';
  sessionInstruction: 'existing-session' | 'new-session';
  findingsRolesToInject: string[];
  // 'prompt' field removed — runtime owns context injection
}
```

`BackwardPassPlan` type definition is unchanged: `BackwardPassEntry[][]`. Outer array is sequential steps; inner array is a concurrent group.

### 2.3 New Exported Functions

The old `orderWithPromptsFromFile` and `computeBackwardPassOrder` are removed and replaced by three new exports:

**Primary entry point (reads workflow.md from disk):**

```typescript
export function computeBackwardPassPlan(
  recordFolderPath: string,
  synthesisRole: string,
  mode: 'graph-based' | 'parallel',
): BackwardPassPlan
```

Reads `workflow.md` from `recordFolderPath`, parses frontmatter (same YAML schema as current implementation), delegates to `buildBackwardPassPlan`. Throws on unreadable file, missing frontmatter, invalid YAML, or malformed workflow schema — same error model as existing `orderWithPromptsFromFile`.

**Lower-level entry point (for unit tests and callers with pre-parsed graphs):**

```typescript
export function buildBackwardPassPlan(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  synthesisRole: string,
  mode: 'graph-based' | 'parallel',
): BackwardPassPlan
```

**Findings file locator (called by runtime at session-start time):**

```typescript
export function locateFindingsFiles(
  recordFolderPath: string,
  roleNames: string[],
): string[]
```

Scans `recordFolderPath` for files matching the findings naming convention and returns repo-relative paths for files whose embedded role name matches any name in `roleNames`. Returns an empty array (does not throw) when no matching files exist. Repo-relative paths are computed by making the absolute path relative to the process working directory (consistent with how other components report paths).

**Findings file naming convention:** The convention being matched is `NN[a-z]?-[role-slug]-findings.md` where `NN` is one or more digits, the optional letter covers concurrent sub-labels (`05a-`, `05b-`), and `[role-slug]` is the role name lowercased with spaces replaced by hyphens. Match rule: extract the segment between the first `-` and `-findings.md`, normalize it (lowercase, spaces→hyphens), compare case-insensitively against the normalized form of each name in `roleNames`. Example: `09-technical-architect-findings.md` matches role name `"Technical Architect"`.

### 2.4 Role-Appearance Check Algorithm

This algorithm governs `findingsRolesToInject` for graph-based mode. It determines, for each role in the backward pass, which successor roles' findings to inject.

**Input:** `nodes: WorkflowNode[]`, `edges: WorkflowEdge[]`

**Step 1 — Forward pass topological ordering:**
Compute a topological sort of all nodes using BFS from source nodes (nodes with no incoming edges). Assign each node a 0-indexed position in this ordering. For graphs with parallel branches, any valid topological ordering is acceptable; the algorithm is stable because it uses first-occurrence position (minimum across all nodes of that role), not a specific node's position.

**Step 2 — First occurrence position per role:**
For each distinct role name, `firstOccurrencePosition(role)` = the minimum topological position across all nodes whose `role` field equals that role name.

**Step 3 — Direct successor roles per role:**
`directSuccessorRoles(role)` = the set of distinct role names of nodes M where there exists an edge N → M for some node N whose `role` field equals the input role name. Computed using node IDs: for each node N in `nodes` where `N.role === role`, collect all edges where `edge.from === N.id`, then collect the `role` of `nodes.find(n => n.id === edge.to)`.

**Step 4 — Eligible injection roles (graph-based):**
```
eligibleInjectionRoles(role) =
  directSuccessorRoles(role).filter(s =>
    firstOccurrencePosition(s) > firstOccurrencePosition(role)
  )
```

Exclusion condition: if a successor role's first occurrence position is **less than or equal to** the current role's first occurrence position, that role appeared at or before the current role in the forward pass — its findings are excluded from injection. This prevents downstream roles from receiving findings from roles that ran before them in the forward pass (which would invert the causal structure of the backward pass).

**Pinning semantics:** For roles that appear at multiple nodes (e.g., Owner at node `o1` and node `o2`), position is pinned to **first occurrence** (minimum position). The same pinning applies symmetrically for both the current role and each successor role being evaluated. This is the only case that matters: if Owner's first occurrence is position 0, it is treated as position 0 regardless of later appearances when computing whether another role is "earlier."

**Parallel mode:** `findingsRolesToInject` is `[]` for all meta-analysis entries. The parallel mode check is applied in `buildBackwardPassPlan` before per-role filtering; all roles receive an empty injection list.

**Synthesis:** `findingsRolesToInject` is `['*']` — a sentinel value meaning "all findings in the record folder." The runtime interprets this by calling `locateFindingsFiles(recordFolderPath, allRoles)` where `allRoles` is derived from the workflow graph nodes. Alternatively: the runtime calls `locateFindingsFiles(recordFolderPath, [])` with an additional flag, or more simply, `locateFindingsFiles` accepts `'*'` as a shorthand for "all roles present in the record folder." **Decision: define a separate export** `locateAllFindingsFiles(recordFolderPath: string): string[]` that returns all files matching the findings pattern regardless of role. The runtime calls this for synthesis and `locateFindingsFiles` for per-role injection. Component 4 sets `findingsRolesToInject = []` for synthesis (not `['*']`) — synthesis is identified by `stepType === 'synthesis'`, so the runtime uses `stepType` to decide which locator to call.

### 2.5 Worked Trace — Repeated-Role Case

**Workflow:** `o1 (Owner) → c1 (Curator) → ta1 (Technical Architect) → o2 (Owner) → c2 (Curator)`  
`c2` is terminal (no outgoing edges). Synthesis role: `Curator`.

**Topological sort (Kahn's, forward):**  
Source nodes (no incoming edges): `{o1}`  
Order: `o1`(0) → `c1`(1) → `ta1`(2) → `o2`(3) → `c2`(4)

**First occurrence positions:**
- Owner: min(pos(o1), pos(o2)) = min(0, 3) = **0**
- Curator: min(pos(c1), pos(c2)) = min(1, 4) = **1**
- Technical Architect: min(pos(ta1)) = **2**

**BFS distances from terminal c2 (backward pass algorithm, unchanged from current):**
- c2: distance 0 → Curator max: max(0) so far = 0
- o2: distance 1 → Owner max: max(1) so far = 1
- ta1: distance 2 → TA max: max(2) = 2
- c1: distance 3 → Curator max: max(0, 3) = 3
- o1: distance 4 → Owner max: max(1, 4) = 4

roleMaxDistance: TA=2, Curator=3, Owner=4

Backward pass order (ascending maxDistance): TA(2) → Curator(3) → Owner(4) → Synthesis(Curator, new session)

**Graph-based `findingsRolesToInject` per role:**

*Technical Architect (firstOccurrence=2):*
- Direct successors of ta1: Owner (via ta1→o2)
- Owner firstOccurrence=0; 0 ≤ 2 → EXCLUDE
- `findingsRolesToInject = []`

*Curator (firstOccurrence=1):*
- Direct successors of c1: Technical Architect (via c1→ta1)
- TA firstOccurrence=2; 2 > 1 → INCLUDE
- `findingsRolesToInject = ['Technical Architect']`

*Owner (firstOccurrence=0):*
- Direct successors of o1: Curator (via o1→c1)
- Direct successors of o2: Curator (via o2→c2)
- Combined unique successor roles: {Curator}
- Curator firstOccurrence=1; 1 > 0 → INCLUDE
- `findingsRolesToInject = ['Curator']`

*Synthesis (Curator, stepType='synthesis'):*
- `findingsRolesToInject = []` (runtime calls `locateAllFindingsFiles` based on `stepType`)

**Interpretation:** TA runs with no injected findings (writes its own analysis cold). Curator receives TA's findings (reads what came after it). Owner receives Curator's findings (reads what the full chain produced). Synthesis receives everything.

### 2.6 Failure Behavior for Missing Findings Files

`locateFindingsFiles` returns only files that currently exist in the record folder. It does not throw when expected files are absent. The runtime receives an empty or partial list.

When `locateFindingsFiles` returns fewer files than the role names requested, the runtime must:
- Log an operator-facing warning at the start of the session: `[improvement] Role [X]: expected findings from [RoleName] but no matching file found in [recordFolderPath]. Proceeding without findings for this role.`
- Start the session with whatever findings are present (empty injection if none found)
- Not halt or retry

The runtime owns the warning log. `locateFindingsFiles` is silent (it logs nothing; it returns what exists).

### 2.7 INVOCATION.md Contract

The INVOCATION.md for the tooling is **updated, not retired.** The Component 4 section is replaced with the new API: `computeBackwardPassPlan`, `buildBackwardPassPlan`, and `locateFindingsFiles`. The old `orderWithPromptsFromFile` and `computeBackwardPassOrder` entries are removed. The note about CLI invocation is replaced with a note that Component 4 is a runtime library and is no longer invoked directly by agents.

---

## §3 — Runtime Improvement Orchestration

### 3.1 Module Placement

Improvement orchestration lives in a new module: `runtime/src/improvement.ts`, exporting class `ImprovementOrchestrator`. This is a new module, not an extension of `orchestrator.ts`.

**Rationale for separate module:** `FlowOrchestrator` owns forward-pass choreography. Improvement orchestration begins where the forward pass ends and has a distinct responsibility scope (mode selection, backward pass sequencing, synthesis enforcement). Folding it into `FlowOrchestrator` would conflate two distinct lifecycle phases. Separation also makes both classes independently testable.

**Extension path evaluation (per advisory standards):** The extension path was evaluated. `FlowOrchestrator.applyHandoffAndAdvance` and `advanceFlow` are tightly coupled to the forward-pass graph structure (workflow nodes, outgoing edges, `activateOrDefer`). Backward pass sessions are not graph-traversal in the same sense — they follow a pre-computed plan, not the workflow graph edges. Extending `FlowOrchestrator` would require adding mode-specific branching throughout its methods, obscuring the forward-pass logic. Separate module is the correct call.

### 3.2 Detection and Dispatch

`FlowOrchestrator.advanceFlow` calls `runInteractiveSession` and receives `HandoffResult | null`. The dispatch block after session completion is:

```typescript
if (handoffResult === null) {
  // No handoff — session ended without signal
  flowRun.status = 'awaiting_human';
  ...
} else if (handoffResult.kind === 'forward-pass-closed') {
  await ImprovementOrchestrator.handleForwardPassClosure(
    flowRun,
    { recordFolderPath: handoffResult.recordFolderPath, artifactPath: handoffResult.artifactPath },
    inputStream,
    outputStream,
  );
} else if (handoffResult.kind === 'targets') {
  await this.applyHandoffAndAdvance(flowRun, nodeId, handoffResult.targets);
} else {
  // kind === 'meta-analysis-complete' — not expected in forward pass context
  throw new Error(`Unexpected meta-analysis-complete signal during forward pass at node '${nodeId}'.`);
}
```

`applyHandoffAndAdvance` currently receives `HandoffTarget[]` directly. This changes: it receives `handoffResult.targets` (still `HandoffTarget[]`). Its signature does not change.

### 3.3 Mode Presentation

`ImprovementOrchestrator.handleForwardPassClosure` presents the user with three options interactively via `outputStream` and `inputStream`, using the same readline interface pattern as `orient.ts`.

Displayed text (exact):
```
Forward pass complete.

Choose improvement mode:
  1) Graph-based  — roles run in reverse topological order; each receives findings from their direct forward successors
  2) Parallel     — all roles run simultaneously; no cross-role findings injected
  3) No improvement — close the record now

Enter 1, 2, or 3:
```

The method reads one line from `inputStream`. Valid inputs: `"1"`, `"2"`, `"3"`. On invalid input, re-prompt once with: `"Invalid selection. Enter 1, 2, or 3: "`. On second invalid input, default to `"3"` (no improvement) and log: `[improvement] Could not read valid selection. Defaulting to no improvement.`

### 3.4 Session Lifecycle — Graph-Based Mode

1. Call `computeBackwardPassPlan(recordFolderPath, synthesisRole, 'graph-based')` to get the plan.
2. Record `mode: 'graph-based'` in `flowRun.improvementPhase`.
3. For each sequential step `group` (outer array entry):
   a. For each `entry` in `group` (run concurrently within the group via `Promise.all`):
      - Determine `sessionId = `${flowRun.flowId}__bp-${entry.role.toLowerCase().replace(/\s+/g, '-')}-${group.indexOf(entry)}-${flowRun.improvementPhase!.currentStep}`` — unique per role per step.
      - If `entry.stepType === 'meta-analysis'`:
        - Call `locateFindingsFiles(recordFolderPath, entry.findingsRolesToInject)` to get current findings paths.
        - Log a warning for any role in `entry.findingsRolesToInject` with no matching file (per §2.6).
        - Build context: `ContextInjectionService.buildContextBundle(roleKey, projectRoot, [metaAnalysisInstructionPath, ...findingsFilePaths], null)`.
        - Compose initial user message (format below).
        - Call `runInteractiveSession(projectRoot, roleKey, bundleContent, [userMessage])`.
        - If result is `{ kind: 'meta-analysis-complete', findingsPath }`: record findings in `flowRun.improvementPhase.findingsProduced[entry.role]`.
        - If result is `null` or any other kind: log warning (§3.6), do not record findings, continue.
      - Append `entry.role` to `flowRun.improvementPhase.completedRoles`.
   b. Increment `flowRun.improvementPhase.currentStep`.
   c. Save `flowRun` to store after each step group completes.
4. After all meta-analysis steps: run synthesis (§3.5).

**Initial user message for meta-analysis sessions (exact template):**

`runtime/src/improvement.ts` generates this string:
```
Backward pass meta-analysis. Your record folder is: [recordFolderPath].
Produce your findings artifact at the next available sequence position in the record folder.
When your findings artifact is saved, emit a meta-analysis-complete handoff block with findings_path set to the repo-relative path of your findings file.
```

The meta-analysis instruction file in context (`$GENERAL_IMPROVEMENT_META_ANALYSIS`) provides the full guidance on what to reflect on and how to format the findings artifact. This user message is the session launch instruction; the instruction file is the substantive guide. Content of `$GENERAL_IMPROVEMENT_META_ANALYSIS` is delegated to the Curator, subject to the constraint in §1.2 (must instruct agents to emit `meta-analysis-complete` with `findings_path`).

### 3.5 Session Lifecycle — Parallel Mode

1. Call `computeBackwardPassPlan(recordFolderPath, synthesisRole, 'parallel')` to get the plan.
2. Record `mode: 'parallel'` in `flowRun.improvementPhase`.
3. Launch all meta-analysis entries simultaneously via `Promise.all`:
   - Same session construction as graph-based, except `entry.findingsRolesToInject` is always `[]` in parallel mode.
   - Context bundle: `ContextInjectionService.buildContextBundle(roleKey, projectRoot, [metaAnalysisInstructionPath], null)`.
   - Await all completions. Record findings for each role that returns `meta-analysis-complete`.
4. After all complete: run synthesis (§3.5 — synthesis is identical across both modes).

### 3.5 (continued) — Synthesis Session

Synthesis runs after all meta-analysis sessions complete (both modes).

1. Call `locateAllFindingsFiles(recordFolderPath)` to get all findings files currently present.
2. Determine `synthesisSessionId = `${flowRun.flowId}__bp-synthesis-${crypto.randomUUID()}`` — unique per invocation, enforcing a fresh session.
3. Build context: `ContextInjectionService.buildContextBundle(synthesisRoleKey, projectRoot, [synthesisInstructionPath, ...allFindingsFiles], null)`.
4. Compose initial user message:
   ```
   Backward pass synthesis. Your record folder is: [recordFolderPath].
   Findings from all roles in this flow are in your context. Produce the synthesis artifact.
   ```
5. Call `runInteractiveSession(projectRoot, synthesisRoleKey, bundleContent, [userMessage])`.
6. On completion (any result kind): mark `flowRun.status = 'completed'`. Synthesis closes the flow unconditionally regardless of what signal (if any) the session returns.

**Fresh session enforcement:** The `crypto.randomUUID()` suffix in the session ID guarantees no match against any prior session in `SessionStore`. `SessionStore.loadRoleSession(synthesisSessionId)` will always return `null`. No explicit delete or clear operation is needed; the uniqueness of the ID is structural.

**Synthesis role key:** The synthesis role is the same as the project's Curator role. The `synthesisRoleKey` is formed the same way `orchestrator.ts` forms role keys: `${namespace}__${synthesisRole}` where `namespace = path.basename(flowRun.projectRoot)`.

### 3.6 Error Handling — Missing Findings

When a meta-analysis session returns `null` or an unexpected `HandoffResult.kind` (not `meta-analysis-complete`):
- **Log owner (improvement.ts):** Emit the actionable warning. `orchestrator.ts` and `orient.ts` do not log for this condition; they return `null` or propagate the result silently.
- Log format: `[improvement] Meta-analysis for [role] did not produce a findings signal (session ended with: [kind|null]). Proceeding without findings for this role.`
- No retry. No halt. Continue to next role in the step group.

**Error propagation ownership:** `locateFindingsFiles` → silent (returns empty array). `runInteractiveSession` → silent on null return. `HandoffInterpreter.parse` → throws `HandoffParseError` (caught internally by `orient.ts`, which returns `null`). `ImprovementOrchestrator` → owns the operator-facing log for all missing-findings conditions.

### 3.7 Instruction File Path Constants

`runtime/src/improvement.ts` declares two path constants (co-maintenance pattern from `backward-pass-orderer.ts`):

```typescript
/**
 * Co-maintenance: update if $GENERAL_IMPROVEMENT_META_ANALYSIS relocates in the index.
 * Expected path after Curator splits $GENERAL_IMPROVEMENT:
 */
const META_ANALYSIS_INSTRUCTION_PATH = 'a-society/general/improvement/meta-analysis.md';

/**
 * Co-maintenance: update if $GENERAL_IMPROVEMENT_SYNTHESIS relocates in the index.
 * Expected path after Curator splits $GENERAL_IMPROVEMENT:
 */
const SYNTHESIS_INSTRUCTION_PATH = 'a-society/general/improvement/synthesis.md';
```

These paths match the expected locations after the Curator splits `$GENERAL_IMPROVEMENT`. If the Curator places the split files at different paths, these constants must be updated before the runtime module is usable. The Curator and Runtime Developer must coordinate on the final paths. If they differ from these constants, the Runtime Developer updates the constants at implementation time — no further advisory is needed for that adjustment.

---

## §4 — Interface Changes

### 4.1 New Type: `HandoffResult` (in `runtime/src/types.ts`)

```typescript
export type HandoffResult =
  | { kind: 'targets'; targets: HandoffTarget[] }
  | { kind: 'forward-pass-closed'; recordFolderPath: string; artifactPath: string }
  | { kind: 'meta-analysis-complete'; findingsPath: string };
```

`HandoffTarget` is defined in `handoff.ts` and remains unchanged. The `HandoffResult` type is placed in `types.ts` (not `handoff.ts`) because it crosses module boundaries: `orchestrator.ts`, `orient.ts`, and `improvement.ts` all consume it. Placing it in `handoff.ts` would require those modules to import from `handoff.ts` for a type that is not parser-specific. Import from `types.ts` in all three consumer modules.

Note for Runtime Developer: `HandoffTarget` is currently exported from `handoff.ts`. After adding `HandoffResult` to `types.ts`, `HandoffTarget` should also be re-exported from `types.ts` (or moved there), so consumers have a single import source for handoff-related types. Add to `types.ts`: `export type { HandoffTarget } from './handoff.js';` — or move the interface definition to `types.ts` and import it back into `handoff.ts`.

### 4.2 Changed: `HandoffInterpreter.parse()` (in `runtime/src/handoff.ts`)

Old signature: `static parse(text: string): HandoffTarget[]`  
New signature: `static parse(text: string): HandoffResult`

Import addition in `handoff.ts`: `import type { HandoffResult } from './types.js'`

### 4.3 Changed: `runInteractiveSession` (in `runtime/src/orient.ts`)

Old return type: `Promise<HandoffTarget[] | null>`  
New return type: `Promise<HandoffResult | null>`

The function body receives `HandoffResult` from `HandoffInterpreter.parse()` and returns it directly. No logic changes; the type propagates transparently.

Import addition in `orient.ts`: `import type { HandoffResult } from './types.js'` (in addition to or replacing the existing `HandoffTarget` import from `handoff.ts`).

### 4.4 Changed: `FlowOrchestrator.advanceFlow` dispatch (in `runtime/src/orchestrator.ts`)

The post-session dispatch block changes as specified in §3.2. `applyHandoffAndAdvance` receives `handoffResult.targets` (still `HandoffTarget[]`). Its own signature is unchanged.

Import addition in `orchestrator.ts`: `import { ImprovementOrchestrator } from './improvement.js'`  
Type import change in `orchestrator.ts`: `HandoffTarget` import from `handoff.ts` may be replaced or supplemented by `HandoffResult` import from `types.ts`.

### 4.5 Changed: `FlowRun` (in `runtime/src/types.ts`)

New fields:

```typescript
export interface ImprovementPhaseState {
  mode: 'graph-based' | 'parallel';
  currentStep: number;                         // index into BackwardPassPlan outer array (incremented per completed step group)
  completedRoles: string[];                    // role names that have produced findings or been attempted
  findingsProduced: Record<string, string>;    // roleName → findings file path (repo-relative)
}

export interface FlowRun {
  // ... existing fields unchanged ...
  stateVersion: string;                        // Persistence version: "2" for this schema; absent/old = "1"
  improvementPhase?: ImprovementPhaseState;    // Present only when improvement is in progress
}
```

### 4.6 New: `ImprovementOrchestrator` (in `runtime/src/improvement.ts`)

```typescript
export class ImprovementOrchestrator {
  static async handleForwardPassClosure(
    flowRun: FlowRun,
    signal: { recordFolderPath: string; artifactPath: string },
    synthesisRole: string,
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream,
  ): Promise<void>
}
```

The `synthesisRole` parameter is added so the caller does not need improvement.ts to know the project's synthesis role independently. The orchestrator derives `synthesisRole` from `flowRun` or the workflow graph. **Resolution:** `synthesisRole` is read from the last node in the backward pass plan (the synthesis entry in the plan returned by `computeBackwardPassPlan`). Since `computeBackwardPassPlan` appends the synthesis role as the final step, `ImprovementOrchestrator` can derive it from the plan rather than requiring the caller to pass it. **Updated signature:**

```typescript
static async handleForwardPassClosure(
  flowRun: FlowRun,
  signal: { recordFolderPath: string; artifactPath: string },
  inputStream: NodeJS.ReadableStream,
  outputStream: NodeJS.WritableStream,
): Promise<void>
```

The synthesisRole is read from `workflow.md` directly within `handleForwardPassClosure` by inspecting the last terminal node in the workflow graph. If the last node's role cannot be determined (malformed workflow), throw with: `'Cannot determine synthesis role from workflow.md in [recordFolderPath]'`.

**Imports in `improvement.ts`:**
```typescript
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { computeBackwardPassPlan, locateFindingsFiles, locateAllFindingsFiles } from '../../tooling/src/backward-pass-orderer.js';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { runInteractiveSession } from './orient.js';
import { parseWorkflow } from './orchestrator.js';
import type { FlowRun, HandoffResult, ImprovementPhaseState } from './types.js';
```

### 4.7 Changed: `SessionStore` (in `runtime/src/store.ts`)

`SessionStore.loadFlowRun()` must add a migration check after parsing:

```typescript
static loadFlowRun(): FlowRun | null {
  const p = path.join(STATE_DIR, 'flow.json');
  if (!fs.existsSync(p)) return null;
  const flow = JSON.parse(fs.readFileSync(p, 'utf8')) as FlowRun;
  if (!flow.stateVersion) {
    // State version absent — pre-versioning state ("1"). Compatible with current schema.
    // improvementPhase will be undefined (correct initial state). No data loss.
    flow.stateVersion = '1';
  }
  return flow;
}
```

No throw on old state. The log of this migration check is operator-facing only when explicitly needed; for normal resume this check is silent. When `stateVersion` is found but does not equal `'2'`, do not fail — the only currently valid migration is `absent/'1' → '2'` (same schema, `improvementPhase` absent = undefined = valid pre-improvement state). New code writing state always sets `stateVersion: '2'` in the `FlowRun` object before saving.

### 4.8 New Exports: `locateAllFindingsFiles` (in `tooling/src/backward-pass-orderer.ts`)

```typescript
export function locateAllFindingsFiles(
  recordFolderPath: string,
): string[]
```

Returns all files in `recordFolderPath` matching the findings file pattern (`/^\d+[a-z]?-.*-findings\.md$/i`), as repo-relative paths. Does not filter by role name.

---

## §5 — Files Changed

| File | Action | Implementing role |
|---|---|---|
| `tooling/src/backward-pass-orderer.ts` | Replace — new API per §2 | Tooling Developer |
| `tooling/INVOCATION.md` | Update — replace Component 4 section with new interface | Tooling Developer |
| `tooling/test/backward-pass-orderer.test.ts` | Replace — tests for new interface, role-appearance check, and worked trace cases | Tooling Developer |
| `runtime/src/types.ts` | Modify — add `HandoffResult`, `ImprovementPhaseState`; add `stateVersion` and `improvementPhase` to `FlowRun` | Runtime Developer |
| `runtime/src/handoff.ts` | Modify — `parse()` return type → `HandoffResult` | Runtime Developer |
| `runtime/src/orient.ts` | Modify — return type → `HandoffResult \| null` | Runtime Developer |
| `runtime/src/orchestrator.ts` | Modify — `advanceFlow` dispatch on `HandoffResult.kind`; import `ImprovementOrchestrator` | Runtime Developer |
| `runtime/src/improvement.ts` | Create — `ImprovementOrchestrator` | Runtime Developer |
| `runtime/src/store.ts` | Modify — `loadFlowRun` migration check | Runtime Developer |
| `runtime/INVOCATION.md` | Modify — document improvement orchestration entry point | Runtime Developer |

---

## §6 — Coupling Map Notes

**Type C change — Component 4 interface:**

The Component 4 interface changes significantly (new function signatures, removed `prompt` field, new `locateFindingsFiles` / `locateAllFindingsFiles` exports). This is a Type C change. Post-implementation, the Curator updates:
1. The invocation status row for Component 4 in `$A_SOCIETY_TOOLING_COUPLING_MAP` with the new interface note.
2. The format dependency row: "Backward pass ordering rule (per `$GENERAL_IMPROVEMENT`) | Yes | Component 4" — this row is affected because Component 4 no longer embeds a path to `$GENERAL_IMPROVEMENT` or generates prompts referencing it. After this implementation, Component 4's format dependency on `$GENERAL_IMPROVEMENT` is removed. The coupling map row should be revised to: "Backward pass ordering rule (per `$GENERAL_IMPROVEMENT_META_ANALYSIS` / `$GENERAL_IMPROVEMENT_SYNTHESIS`, via runtime constants in `improvement.ts`)" with the dependent component listed as the runtime module, not Component 4.

**Invocation gap status:**

The existing `$GENERAL_IMPROVEMENT` invocation reference to Component 4 is being made stale by this change (agents no longer invoke Component 4 manually; the runtime invokes it). The Curator is splitting `$GENERAL_IMPROVEMENT` as part of this same flow. The resulting `$GENERAL_IMPROVEMENT_META_ANALYSIS` file should note that Component 4 is invoked by the runtime — not by agents — and that agents do not call `computeBackwardPassPlan` directly. The Curator's file split should close the prior invocation gap registration and replace it with documentation of the runtime's ownership of this invocation. Curator handles as part of the split.

**No new open invocation gaps introduced.** The new `locateFindingsFiles` and `locateAllFindingsFiles` exports are runtime-internal utilities; no `general/` instruction directs agents to call them. No invocation gap entry is needed for runtime-internal helpers.

---

## §7 — Persistence Versioning Assessment

**Finding 2 context:** The runtime developer's findings from flow 20260402 (Finding 2) identified the absence of a structured version field and migration check in `SessionStore`. This advisory introduces both in response:

- `FlowRun.stateVersion: string` — present in all new state writes, value `"2"`.
- `SessionStore.loadFlowRun()` migration check — treats absent/`"1"` as compatible, returns without error.

**Assessment of `improvementPhase` addition:** This field is optional (`?`). A flow persisted under the old schema (no `stateVersion`, no `improvementPhase`) is correctly loaded by new code as a flow with `improvementPhase: undefined`, which is the valid pre-improvement initial state. New code writing state adds `stateVersion: '2'` and either `improvementPhase: undefined` (before improvement activates) or a populated `ImprovementPhaseState`. Old code (prior to this change) cannot resume a flow mid-improvement because it does not understand `type: forward-pass-closed` signals, so the scenario of old code encountering `improvementPhase` state is functionally unreachable. **The addition does not require a hard version barrier** — the migration check is sufficient.

---

## §8 — Per-File Developer Requirements

### `tooling/src/backward-pass-orderer.ts` (Tooling Developer)

- Remove: `orderWithPromptsFromFile`, `computeBackwardPassOrder`, `createMetaAnalysisPrompt`, `createSynthesisPrompt`
- Remove: `prompt` field from `BackwardPassEntry`; add `findingsRolesToInject: string[]`
- Add: `computeBackwardPassPlan(recordFolderPath, synthesisRole, mode)` — reads workflow.md, delegates to `buildBackwardPassPlan`; same error behavior as old `orderWithPromptsFromFile` for file read / YAML parse / frontmatter failures
- Add: `buildBackwardPassPlan(nodes, edges, synthesisRole, mode)` — pure computation; no file I/O
  - `mode === 'graph-based'`: apply role-appearance check algorithm (§2.4); populate `findingsRolesToInject` per entry
  - `mode === 'parallel'`: set `findingsRolesToInject = []` for all meta-analysis entries; all entries in a single inner concurrent group `[[role1, role2, ...], [synthesis]]`; no ordering needed
  - Synthesis entry: `stepType: 'synthesis'`, `sessionInstruction: 'new-session'`, `findingsRolesToInject: []` (runtime uses `locateAllFindingsFiles` based on `stepType`)
- Add: `locateFindingsFiles(recordFolderPath, roleNames)` — scan dir, regex match, normalize role names for comparison, return repo-relative paths; return `[]` on no match; return `[]` if dir is unreadable (do not throw)
- Add: `locateAllFindingsFiles(recordFolderPath)` — scan dir, all findings-pattern matches, repo-relative paths
- Co-maintenance constant: remove `GENERAL_IMPROVEMENT_PATH` (Component 4 no longer references it)
- Export: `WorkflowNode`, `WorkflowEdge`, `RecordWorkflowFrontmatter`, `BackwardPassEntry`, `BackwardPassPlan` (all retained; `parseRecordWorkflowFrontmatter` retained)
- Guard: `buildBackwardPassPlan` must throw `'workflow.nodes must produce at least one terminal node'` if no terminal node found (existing guard, retained)
- Guard: `computeBackwardPassPlan` must throw `'Cannot read workflow.md at [path]: [reason]'` on file read failure

### `tooling/test/backward-pass-orderer.test.ts` (Tooling Developer)

- Replace with tests for new API only; old prompt-related tests are removed
- Required test cases:
  - `buildBackwardPassPlan` graph-based, linear graph (single-occurrence roles): verifies backward order, correct `findingsRolesToInject`
  - `buildBackwardPassPlan` graph-based, repeated Owner (worked trace from §2.5): verifies exact `findingsRolesToInject` values per role
  - `buildBackwardPassPlan` parallel mode: verifies all roles in one concurrent group, all `findingsRolesToInject = []`
  - `buildBackwardPassPlan` synthesis entry: `stepType === 'synthesis'`, `sessionInstruction === 'new-session'`, `findingsRolesToInject = []`
  - `locateFindingsFiles`: finds matching files; excludes non-matching; case-insensitive role name match
  - `locateFindingsFiles`: returns `[]` for absent directory (does not throw)
  - `locateAllFindingsFiles`: returns all findings-pattern files regardless of role

### `runtime/src/types.ts` (Runtime Developer)

- Add `HandoffResult` discriminated union (§4.1); real union, not a stub
- Add `ImprovementPhaseState` interface (§4.5)
- Add `stateVersion: string` to `FlowRun`; add `improvementPhase?: ImprovementPhaseState` to `FlowRun`
- Re-export or move `HandoffTarget` here so consumers have a single import source (§4.1 note)
- No new imports needed

### `runtime/src/handoff.ts` (Runtime Developer)

- `parse()` return type: `HandoffResult` (not `HandoffTarget[]`)
- Add import: `import type { HandoffResult } from './types.js'`
- Detection logic per §1.3: dispatch on `type` field presence → typed signal block; absent → existing single/array forms
- Guard: `type: forward-pass-closed` must throw `HandoffParseError('forward-pass-closed block missing record_folder_path')` or `'...artifact_path'` on missing/empty fields — real throws, not comment placeholders
- Guard: `type: meta-analysis-complete` must throw `HandoffParseError('meta-analysis-complete block missing findings_path')` on missing/empty field — real throw
- Guard: unknown `type` value must throw `HandoffParseError(`Unknown handoff signal type: ${payload.type}`)` — real throw

### `runtime/src/orient.ts` (Runtime Developer)

- Change return type of `runInteractiveSession` to `Promise<HandoffResult | null>`
- Add import: `import type { HandoffResult } from './types.js'`
- Body: no logic changes; the `HandoffInterpreter.parse()` call already produces the right type; return it directly
- All three parse call sites in the function (initial turn, provided-history turn, readline loop) must return the `HandoffResult` value without modification

### `runtime/src/orchestrator.ts` (Runtime Developer)

- In `advanceFlow`: change post-session dispatch to `HandoffResult.kind` check (§3.2)
- Add import: `import { ImprovementOrchestrator } from './improvement.js'`
- `applyHandoffAndAdvance` call site: pass `handoffResult.targets` (not `handoffResult` directly) — signature unchanged
- Guard: `kind === 'meta-analysis-complete'` in forward pass context → throw with message (§3.2)
- The `startUnifiedOrchestration` method's initial handoff path must also be updated: `runInteractiveSession` now returns `HandoffResult | null`; the initial bootstrap uses `handoffs[0].artifact_path` — change to check `if (handoffResult.kind === 'targets') { const artifactPath = handoffResult.targets[0].artifact_path; ... }` and throw on non-targets kind in bootstrap context

### `runtime/src/improvement.ts` (Runtime Developer — new file)

- Class `ImprovementOrchestrator` with `static async handleForwardPassClosure(...)` (§4.6)
- Imports per §4.6 — all imports must be real module imports, not stubs
- Mode presentation: exact strings from §3.3; readline with single re-prompt on invalid input, default to no-improvement on second failure (real code, not comment placeholder)
- No-improvement path: log `[improvement] No improvement selected. Record closed.`, set `flowRun.status = 'completed'`, save, return
- Graph-based path: per §3.4 — sequential step iteration with `Promise.all` within concurrent groups; real `async/await` control flow
- Parallel path: per §3.5 — `Promise.all` over all meta-analysis entries simultaneously; real concurrent execution
- `locateFindingsFiles` warning: operator-facing log per §2.6 on missing files — real `console.warn` or equivalent on `outputStream`
- Missing findings session result: log per §3.6 — real warning, real continue (no throw, no halt)
- Synthesis session: unique `sessionId` using `crypto.randomUUID()` (§3.5); `flowRun.status = 'completed'` unconditionally after synthesis completes; real implementation
- Meta-analysis instruction path and synthesis instruction path: constants per §3.7; real string constants, not stubs
- Synthesis role derivation: read `workflow.md` from `recordFolderPath` via `parseWorkflow` (imported from `orchestrator.ts`); identify last terminal node's role; throw on failure (§4.6)
- Save `flowRun` to store: after each step group (§3.4) — real `SessionStore.saveFlowRun(flowRun)` calls
- `ImprovementPhaseState` must be initialized before first save: `flowRun.improvementPhase = { mode, currentStep: 0, completedRoles: [], findingsProduced: {} }`; `flowRun.stateVersion = '2'`

### `runtime/src/store.ts` (Runtime Developer)

- `loadFlowRun`: add migration check per §4.7 — real code, sets `flow.stateVersion = '1'` when absent; does not throw; no operator log for this normal migration path
- No other changes

### `runtime/INVOCATION.md` (Runtime Developer)

- Add section: "Improvement Orchestration" — documents that after forward pass closure, the runtime presents mode options interactively; no direct CLI command for users to invoke improvement separately (it activates automatically on forward-pass-closed signal detection)
- Describe the three modes (graph-based, parallel, no improvement) and what each produces
- Note that the synthesis session is always a fresh Curator session launched automatically

### `tooling/INVOCATION.md` (Tooling Developer)

- Replace Component 4 section with new API: `computeBackwardPassPlan`, `buildBackwardPassPlan`, `locateFindingsFiles`, `locateAllFindingsFiles`
- Remove `orderWithPromptsFromFile` and `computeBackwardPassOrder` entries
- Add note: "Component 4 is a runtime library. Agents do not invoke it directly; the runtime calls it during improvement orchestration."
- Update algorithm description: mention findings file locator and role-appearance check in the algorithm note

---

## Handoff

This advisory is complete and ready for Owner review. All four known unknowns from the workflow plan are resolved:

1. **Signal schema** — §1: `type: forward-pass-closed` form; `type: meta-analysis-complete` form; `HandoffResult` discriminated union
2. **Component 4 interface** — §2: `computeBackwardPassPlan` / `buildBackwardPassPlan` / `locateFindingsFiles` / `locateAllFindingsFiles`; role-appearance check algorithm with worked trace
3. **FlowRun integration** — §3/§4: `ImprovementPhaseState`; `stateVersion`; `ImprovementOrchestrator` dispatch and lifecycle
4. **Persistence versioning** — §7: optional field addition is backward-compatible; `stateVersion` introduced in this change; migration check in `loadFlowRun`

**Owner review needed on:**

1. **`locateAllFindingsFiles` naming rule for synthesis injection in Component 4.** The advisory specifies `findingsRolesToInject = []` for synthesis entries and requires the runtime to check `stepType === 'synthesis'` to choose the locator. This is a split responsibility: Component 4 sets the entry, runtime determines behavior from `stepType`. An alternative is to have Component 4 set `findingsRolesToInject = ['*']` as an explicit "all roles" sentinel. Owner decides which encoding is cleaner. Either choice requires consistent implementation in both files.

2. **`parseWorkflow` export from `orchestrator.ts`.** The `improvement.ts` import of `parseWorkflow` from `orchestrator.ts` creates an inter-module dependency within the runtime. Owner may prefer `parseWorkflow` be moved to a shared utility module (e.g., `runtime/src/workflow-utils.ts`) to avoid coupling `improvement.ts` to `orchestrator.ts`. This is a placement decision; no spec change needed, only where `parseWorkflow` lives.

3. **Synthesis role derivation.** The advisory derives synthesis role from the last terminal node in `workflow.md`. Owner should confirm this is the correct derivation rule (vs. the Owner passing `synthesisRole` explicitly in the handoff, or a convention that Curator is always synthesis). If Curator is always synthesis (convention), hardcoding is cleaner. If the workflow graph should be authoritative, terminal-node derivation is correct.

Next action: Review this advisory
Read: `a-society/a-docs/records/20260403-programmatic-improvement-system/03-ta-advisory.md`
Expected response: `04-owner-decision.md` in the same record folder with APPROVED, REVISE, or REJECTED; if REVISE, specify which sections require changes before the implementation tracks open.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260403-programmatic-improvement-system/03-ta-advisory.md
```

---

## Addendum — Clarifications per Owner Review (04-owner-ta-review.md)

**Date:** 2026-04-03

---

### Clarification 1 — `parseWorkflow` path selection

**Correction (supersedes terminal-node derivation from initial addendum draft):** The terminal-node derivation proposed in the original addendum draft was wrong. The terminal node of the record-folder `workflow.md` is **Owner** — Owner bookends every workflow and is the last node in the forward pass (closes the record). Using the terminal node would yield `synthesisRole = 'Owner'`, which is incorrect.

**Correct resolution:** Synthesis is always Curator in A-Society by framework convention. The synthesis role is a constant, not derived from the graph.

`improvement.ts` declares:

```typescript
// Co-maintenance: update if the synthesis role convention changes for this project.
const SYNTHESIS_ROLE = 'Curator';
```

`handleForwardPassClosure` does not take a `synthesisRole` parameter. No synthesis role derivation in `orchestrator.ts`. No `parseWorkflow` import in `improvement.ts`.

**Final `handleForwardPassClosure` signature (replaces §4.6):**

```typescript
static async handleForwardPassClosure(
  flowRun: FlowRun,
  signal: { recordFolderPath: string; artifactPath: string },
  inputStream: NodeJS.ReadableStream,
  outputStream: NodeJS.WritableStream,
): Promise<void>
```

**Updated imports for `improvement.ts` (replaces §4.6 imports block):**

```typescript
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { computeBackwardPassPlan, locateFindingsFiles, locateAllFindingsFiles } from '../../tooling/src/backward-pass-orderer.js';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { runInteractiveSession } from './orient.js';
import type { FlowRun, HandoffResult, ImprovementPhaseState } from './types.js';
```

No `orchestrator.ts` import. No `parseWorkflow` import.

**§8 update — `runtime/src/improvement.ts`:** Replace the synthesis role derivation requirement with: "Synthesis role is the module-level constant `SYNTHESIS_ROLE = 'Curator'`. No workflow parsing. `handleForwardPassClosure` does not accept a `synthesisRole` parameter."

**§8 update — `runtime/src/orchestrator.ts`:** No synthesis role derivation needed at the dispatch site. The `forward-pass-closed` dispatch calls `ImprovementOrchestrator.handleForwardPassClosure(flowRun, { recordFolderPath, artifactPath }, inputStream, outputStream)` — no `synthesisRole` argument.

---

### Clarification 2 — `ContextInjectionService.buildContextBundle` signature compatibility

**Verified from source (`runtime/src/injection.ts` lines 16–22, 44–45):**

Current signature:
```typescript
static buildContextBundle(
  roleKey: string,
  projectRoot: string,
  activeArtifactPath: string | string[],
  directivePrompt: string | null,
  mode: 'flow' | 'orient' = 'flow'
): ContextBundleResult
```

At line 45: `const paths = Array.isArray(activeArtifactPath) ? activeArtifactPath : (activeArtifactPath ? [activeArtifactPath] : []);`

Array form is explicitly handled. **The call in §3.4 is fully compatible with the existing interface.** No change to `injection.ts` is needed; it is not added to §5 Files Changed.

Call compatibility breakdown:
- `[metaAnalysisInstructionPath, ...findingsFilePaths]` → `string[]` → matches `string | string[]` ✓
- `null` → matches `string | null` ✓
- `mode` omitted → defaults to `'flow'` ✓

**Behavioral note for Runtime Developer:** The `mode: 'flow'` default appends the IMPORTANT INSTRUCTION at the end of the context bundle: *"Your response must always end with a valid machine-readable handoff block formatted strictly per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`."* This is the correct behavior for meta-analysis sessions — the agent must emit a `type: meta-analysis-complete` block when done. The `$GENERAL_IMPROVEMENT_META_ANALYSIS` instruction file (injected as an active artifact before the runtime directive) will specify the `meta-analysis-complete` schema. Agents read the instruction file first, then see the IMPORTANT INSTRUCTION; the instruction file's schema guidance takes precedence for the specific block type. The Curator must ensure `$GENERAL_IMPROVEMENT_META_ANALYSIS` explicitly defines the `meta-analysis-complete` form per the schema in §1.2.

---

**Both clarifications resolved. The advisory (inclusive of this addendum) is the binding specification for the parallel implementation tracks.**

Next action: Release parallel implementation tracks to Tooling Developer and Runtime Developer
Read: `a-society/a-docs/records/20260403-programmatic-improvement-system/03-ta-advisory.md` (including addendum)
Expected response: `05a-tooling-developer-brief.md` and `05b-runtime-developer-brief.md` filed in the same record folder (or Owner proceeds directly to developer implementation)

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260403-programmatic-improvement-system/03-ta-advisory.md
```
