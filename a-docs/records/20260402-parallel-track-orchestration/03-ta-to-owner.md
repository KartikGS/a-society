**Subject:** Parallel Track Orchestration — Technical Architect Advisory
**Type:** Technical Architect → Owner
**Date:** 2026-04-02
**Flow:** `20260402-parallel-track-orchestration`

---

## Preamble

This advisory is the single design specification for both implementation tracks. Track A (Tooling Developer) and Track B (Runtime Developer) may proceed independently after Owner approval. No cross-track consultation is required during implementation.

All four TA Open Questions from the brief are resolved in [§TA Resolution](#ta-open-questions-resolution) below.

**Coupling Map consultation completed.** Results are in [§Coupling Map](#coupling-map).

**Bootstrapping exemption note:** This flow's record folder (`20260402-parallel-track-orchestration`) was created before the parallel-subgraph schema it introduces. `workflow.md` already uses the nodes/edges format, so Component 4 can be invoked for this flow after Track A completes. The `currentNode`-based `FlowRun` in `.state/flow.json` is not compatible with the redesigned type; any in-flight `.state/` must be discarded before running the redesigned runtime.

---

## §1 — FlowRun Type Redesign

**File:** `runtime/src/types.ts`

Replace the `currentNode: string` field with a multi-node tracking model. The revised `FlowRun` interface is:

```typescript
export interface FlowRun {
  flowId: string;
  projectRoot: string;
  recordFolderPath: string;
  activeNodes: string[];                          // node IDs currently executing
  completedNodes: string[];                       // node IDs that have finished
  completedNodeArtifacts: Record<string, string>; // nodeId → artifact_path of that node's output
  pendingNodeArtifacts: Record<string, string[]>; // nodeId → list of input artifacts waiting for it
  status: FlowStatus;
}
```

**`completedNodeArtifacts`** records what each completed node emitted. At fork nodes, the agent emits one artifact per track; each track's artifact is stored under that track's node ID — not the fork node's ID.

**`pendingNodeArtifacts`** records the input artifacts queued for each node that has been activated but not yet advanced. For a linear successor, this is `[handoffTarget.artifact_path]`. For a join node, this is the list of all predecessor artifacts collected when the join condition is first satisfied.

**Initial state** when `start-flow` creates a `FlowRun`:

```typescript
{
  flowId: <uuid>,
  projectRoot: <arg>,
  recordFolderPath: <arg>,
  activeNodes: [firstNodeId],
  completedNodes: [],
  completedNodeArtifacts: {},
  pendingNodeArtifacts: { [firstNodeId]: [startingArtifact] },
  status: 'initialized',
}
```

**`FlowStatus` semantics with multiple active nodes:**

| Value | Meaning |
|---|---|
| `initialized` | `FlowRun` created, `START` validation passed, not yet advanced |
| `running` | At least one node is active and advancing |
| `awaiting_human` | `advanceFlow` was called for a `human-collaborative` node without `humanInput`; the entire flow pauses (Tier 1 limitation: all tracks pause, not just the node that triggered the pause) |
| `awaiting_retry` | A rate-limit error occurred on any active track |
| `completed` | `activeNodes` is empty after the final node's completion |
| `failed` | An unrecoverable error occurred on any track |

**`store.ts` scope note:** `SessionStore.saveFlowRun` and `loadFlowRun` require no method-signature changes — they serialize/deserialize `FlowRun` as JSON. The `flow.json` format changes automatically because the type changes. Any existing `.state/flow.json` written by the `currentNode`-model runtime is incompatible and must be discarded. This is an explicit breaking change to the `.state/` persistence format.

---

## §2 — Fork/Join Detection Algorithm

**File:** `runtime/src/orchestrator.ts`

The orchestrator determines fork, join, and linear cases from the graph structure — not from the handoff block's shape. The handoff block must match the graph's structure; mismatches are contract violations.

### Definitions

- **Terminal node:** A node with no outgoing edges in `workflow.edges`.
- **Fork node:** A node with more than one outgoing edge.
- **Join node:** A node with more than one incoming edge.
- A node may be both a join and a fork (convergence-then-divergence), though no such node appears in this flow.

### After a node `X` completes its LLM turn and handoff is parsed:

```
outgoingEdges = workflow.edges.filter(e => e.from === X.id)

case outgoingEdges.length === 0:  → terminal (see Terminal Handling below)
case outgoingEdges.length === 1:  → linear (see Linear Activation below)
case outgoingEdges.length > 1:    → fork (see Fork Activation below)
```

### Terminal Handling

```
remove X.id from flowRun.activeNodes
add X.id to flowRun.completedNodes
store flowRun.completedNodeArtifacts[X.id] = handoffs[0].artifact_path

if flowRun.activeNodes.length === 0:
  trigger ToolTriggerEngine.evaluateAndTrigger(flowRun, 'TERMINAL_FORWARD_PASS', {})
  flowRun.status = 'completed'
  save flowRun
  return
else:
  // Other tracks still running. Save and return without setting completed.
  save flowRun
  return
```

### Linear Activation

Validate: `handoffs.length === 1`. If not:

> Error: `"Non-fork node '${X.id}' has 1 outgoing edge but agent emitted ${handoffs.length} handoff targets. Use single-target handoff form for non-fork nodes."`

Match: the single handoff's `role` must equal the successor node's role.

```
successor = wf.nodes.find(n => n.id === outgoingEdges[0].to)
if successor.role !== handoffs[0].role:
  throw Error with: "Unauthorized transition: node '${X.id}' must hand to '${successor.role}' but proposed '${handoffs[0].role}'."

remove X.id from flowRun.activeNodes
add X.id to flowRun.completedNodes
flowRun.completedNodeArtifacts[X.id] = handoffs[0].artifact_path ?? ''

// Activate successor (or defer if it's a join node — see Join Check below)
```

### Fork Activation

Validate: `handoffs.length === outgoingEdges.length`. If not:

> Error: `"Fork node '${X.id}' has ${outgoingEdges.length} outgoing edges but agent emitted ${handoffs.length} handoff targets. An array handoff with one entry per fork target is required."`

For each `(edge, handoffTarget)` pair — match by role:

```
for each edge of outgoingEdges:
  targetNode = wf.nodes.find(n => n.id === edge.to)
  matchingHandoff = handoffs.find(h => h.role === targetNode.role && !alreadyClaimed(h))
  if not found:
    throw Error: "Fork node '${X.id}' has no handoff target with role '${targetNode.role}'."
  mark matchingHandoff as claimed
  record: edge.to → matchingHandoff.artifact_path
```

If fork target roles are not unique among the outgoing edges (two edges lead to nodes with the same role):

> Error: `"Fork node '${X.id}' has multiple outgoing edges with role '${role}'. Non-unique fork-target roles are not supported in this version. Each fork target must have a distinct role."`

After all edges are matched:

```
remove X.id from flowRun.activeNodes
add X.id to flowRun.completedNodes
flowRun.completedNodeArtifacts[X.id] = ''  // fork nodes have no single output artifact

for each (targetNodeId, artifactPath) in matched pairs:
  flowRun.completedNodeArtifacts[X.id] is intentionally empty (output is per-target, not per-fork-node)
  // but we need to route artifacts to each target's pendingNodeArtifacts:
  activateOrDefer(flowRun, wf, targetNodeId, [artifactPath], completedNodes)
```

### Join Check (called for every potential successor after linear or fork completion)

```
function activateOrDefer(flowRun, wf, candidateNodeId, incomingArtifacts, completedNodesAfterCurrent):
  incomingEdges = wf.edges.filter(e => e.to === candidateNodeId)
  
  if incomingEdges.length <= 1:
    // Not a join — activate immediately
    flowRun.pendingNodeArtifacts[candidateNodeId] = incomingArtifacts
    flowRun.activeNodes.push(candidateNodeId)
    return

  // Join node: check if all predecessors are now complete
  allComplete = incomingEdges.every(e => completedNodesAfterCurrent.includes(e.from))

  if allComplete:
    // Gather all predecessor output artifacts, in incoming-edge order
    joinArtifacts = incomingEdges.map(e => flowRun.completedNodeArtifacts[e.from]).filter(a => a !== '')
    flowRun.pendingNodeArtifacts[candidateNodeId] = joinArtifacts
    flowRun.activeNodes.push(candidateNodeId)
  // else: predecessor(s) still running — do nothing; candidateNode stays pending
```

### Nested Fork Correctness

The algorithm handles a fork within a fork (e.g., `A → B, A → C, B → D, B → E, D → F, E → F, C → F`) because:

- `activeNodes` is a set updated per completion, not a position counter.
- `activateOrDefer` checks the current `completedNodes` each time, so partial join satisfaction is correctly deferred.
- At `F`'s join check: `D`, `E`, and `C` are all required predecessors; `F` activates only when all three are in `completedNodes`.

### Edge Case: Fork with Shared Artifact

If all fork targets receive the same `artifact_path`, the behavior is the same as distinct artifacts — each target gets `[artifact_path]` in its `pendingNodeArtifacts`. No deduplication.

---

## §3 — Handoff Schema Extension

**Files:** `runtime/src/handoff.ts`; `general/instructions/communication/coordination/machine-readable-handoff.md` (Curator track)

### New Array Form (agent-facing)

The fenced `handoff` block may now contain either the existing single-object form (unchanged) or a new array form for fork points:

**Single-target form (unchanged):**

```
```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260402-xxx/03-ta-to-owner.md
```
```

**Array form (new, for fork points):**

```
```handoff
- role: Tooling Developer
  artifact_path: a-society/a-docs/records/20260402-xxx/04a-owner-to-td.md
- role: Runtime Developer
  artifact_path: a-society/a-docs/records/20260402-xxx/04b-owner-to-rd.md
```
```

The block tag `handoff` is unchanged. The array form uses YAML sequence syntax (leading `-`). Both forms are valid YAML under the existing `handoff:` prepending strategy.

### Parser Changes in `handoff.ts`

**Types:**

```typescript
// Remove: HandoffBlock interface
// Add:
export interface HandoffTarget {
  role: string;
  artifact_path: string | null;
}
// HandoffParseError class: unchanged
```

**`HandoffInterpreter.parse` return type changes from `HandoffBlock` to `HandoffTarget[]`.**

The existing regex (`/```(?:yaml)?\s*[\n\r]+handoff:([\s\S]*?)```/i`) and the YAML prepend strategy (`handoff:${match[1]}`) work for both forms without modification. After `yaml.load(yamlStr)`:

```typescript
const payload = parsed.handoff;

// Empty array guard:
if (Array.isArray(payload) && payload.length === 0) {
  throw new HandoffParseError('Handoff block must contain at least one target.');
}

// Single-object form:
if (!Array.isArray(payload)) {
  if (typeof payload.role !== 'string' || payload.role.trim() === '') {
    throw new HandoffParseError('"role" field is required and must be a non-empty string.');
  }
  return [{ role: payload.role, artifact_path: payload.artifact_path ? String(payload.artifact_path) : null }];
}

// Array form:
return payload.map((entry, i) => {
  if (typeof entry.role !== 'string' || entry.role.trim() === '') {
    throw new HandoffParseError(`Handoff array entry [${i}]: "role" field is required and must be a non-empty string.`);
  }
  return { role: entry.role, artifact_path: entry.artifact_path ? String(entry.artifact_path) : null };
});
```

Return value: always `HandoffTarget[]`. The orchestrator always processes a list, even for single-target handoffs.

**`$INSTRUCTION_MACHINE_READABLE_HANDOFF` impact classification note:** The schema change is backward-compatible — the single-object form is unchanged. Existing adopting-project agents and orchestrators that emit the single-object form continue to work. Orchestrators that do not yet support the array form will encounter it only at fork nodes; such flows would not have been possible before. Impact classification is likely **Recommended**, but the Curator determines classification per `$A_SOCIETY_UPDATES_PROTOCOL` at proposal time. The TA does not pre-specify.

---

## §4 — Orchestrator `advanceFlow` Restructuring

**Files:** `runtime/src/orchestrator.ts` (primary); `runtime/src/injection.ts` (additive); `runtime/src/cli.ts` (parameter threading)

### New `advanceFlow` Signature

```typescript
async advanceFlow(
  flowRun: FlowRun,
  nodeId: string,
  activeArtifactPath?: string | string[],
  humanInput?: string
): Promise<void>
```

`nodeId` replaces `roleKey` as the primary navigation parameter. `activeArtifactPath` is now optional: when omitted, the orchestrator reads `flowRun.pendingNodeArtifacts[nodeId]`. The `roleKey` is derived internally from the graph: `const roleKey = currentNode.role`.

**Parameter threading:**

1. **`nodeId` guard:** Before any LLM call, verify `flowRun.activeNodes.includes(nodeId)`. If not:
   > Throw: `"Node '${nodeId}' is not in activeNodes: [${flowRun.activeNodes.join(', ')}]. Only active nodes can be advanced."`

2. **`activeArtifactPath` resolution:**
   ```typescript
   const resolvedArtifacts: string[] =
     activeArtifactPath !== undefined
       ? (Array.isArray(activeArtifactPath) ? activeArtifactPath : [activeArtifactPath])
       : (flowRun.pendingNodeArtifacts[nodeId] ?? []);
   ```

3. **`roleKey` derivation:**
   ```typescript
   const currentNodeDef = wf.nodes.find(n => n.id === nodeId);
   if (!currentNodeDef) throw new Error(`Node '${nodeId}' not found in workflow graph.`);
   const roleKey = currentNodeDef.role;
   ```

4. **Session key:** `const sessionId = \`${flowRun.flowId}__${nodeId}\`;`
   — This replaces the previous `${flowRun.flowId}__${roleKey}` format. This is a real in-process string substitution, not a comment. All `SessionStore.loadRoleSession` and `SessionStore.saveRoleSession` calls use `sessionId` constructed from `nodeId`.

5. **`buildContextBundle` call:**
   ```typescript
   const { bundleContent, contextHash } = ContextInjectionService.buildContextBundle(
     roleKey, flowRun.projectRoot, resolvedArtifacts, null
   );
   ```
   `resolvedArtifacts` is `string[]`. The updated `injection.ts` handles the array (see below).

6. **User message construction:**
   ```typescript
   if (resolvedArtifacts.length === 1) {
     userMessageContent += `Active artifact: ${resolvedArtifacts[0]}`;
   } else if (resolvedArtifacts.length > 1) {
     userMessageContent += `Active artifacts (parallel track inputs):\n`;
     userMessageContent += resolvedArtifacts.map(a => `- ${a}`).join('\n');
   } else {
     userMessageContent += `Please proceed.`;
   }
   ```

### `injection.ts` — `buildContextBundle` Extension

Change the `activeArtifactPath` parameter from `string` to `string | string[]`:

```typescript
static buildContextBundle(
  roleKey: string,
  projectRoot: string,
  activeArtifactPath: string | string[],  // previously: string
  directivePrompt: string | null,
  mode: 'flow' | 'orient' = 'flow'
): ContextBundleResult
```

When `activeArtifactPath` is a `string[]`: inject each artifact under its own header, in order:

```typescript
const paths = Array.isArray(activeArtifactPath) ? activeArtifactPath : [activeArtifactPath];
const total = paths.length;

for (let i = 0; i < paths.length; i++) {
  const p = paths[i];
  const fullPath = path.resolve(projectRoot, p);
  bundle += `--- ACTIVE WORKSPACE ARTIFACT${total > 1 ? ` (${i + 1} of ${total})` : ''} ---\n`;
  bundle += `[FILE: ${p}]\n`;
  bundle += fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') + '\n\n' : '(File does not exist yet)\n\n';
}
```

When `activeArtifactPath` is a `string`: wrap it in an array and run the same loop. No duplication of logic.

Import required by this change: none (uses existing `path`, `fs` imports already present in `injection.ts`).

### `cli.ts` Parameter Threading

**`startFlow` function:**

```typescript
async function startFlow(
  projectRoot: string, recordFolderPath: string,
  startingRole: string, startingArtifact: string
)
```

After parsing `workflow.md`, find the first node by role (existing behavior). The `FlowRun` initialization changes to the new shape. The `advanceFlow` call changes from `(flowRun, startingRole, startingArtifact)` to `(flowRun, startNode, startingArtifact)` where `startNode` is the node's `id` string. The `pendingNodeArtifacts` initialization is set inside `startFlow` before saving the `FlowRun`.

**`resumeFlow` function:**

Old signature: `resumeFlow(roleKey, activeArtifactPath, humanInput?)`
New signature: `resumeFlow(nodeId, activeArtifactPath?, humanInput?)`

The `<activeArtifactPath>` CLI argument becomes optional:
- If provided: passed to `advanceFlow` as the artifact override
- If omitted: `advanceFlow` derives from `pendingNodeArtifacts`

CLI command usage changes (Runtime Developer updates `INVOCATION.md`):

```
resume-flow <nodeId> [activeArtifactPath] [humanInput]
```

Where `nodeId` is the workflow node ID (e.g., `tooling-developer`, `runtime-developer`), not the role name.

**`flowStatus` function:**

Change to load `workflow.md` and delegate to `renderFlowStatus` from `visualization.ts`:

```typescript
import { renderFlowStatus } from './visualization.js';

function flowStatus() {
  SessionStore.init();
  const flowRun = SessionStore.loadFlowRun();
  if (!flowRun) { console.log('Status: No active flow.'); return; }
  try {
    const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
    console.log(renderFlowStatus(flowRun, wf));
  } catch {
    // Fall back to minimal output if workflow.md is unreadable
    console.log(`=== RUNTIME FLOW STATUS ===\nRecord Folder: ${flowRun.recordFolderPath}\nStatus: ${flowRun.status}\n(Workflow graph unavailable for visualization)`);
  }
}
```

Import to add in `cli.ts`: `import { renderFlowStatus } from './visualization.js';`

### `awaiting_human` in Parallel Flows

When `advanceFlow` detects a human-collaborative node and pauses: it sets `flowRun.status = 'awaiting_human'` and returns, as before. This pauses all orchestration regardless of how many other tracks are active. This is the Tier 1 limitation: the flow does not differentiate "one track paused" from "all tracks paused." The `flow-status` visualization will show which node triggered the pause. The operator calls `resume-flow <nodeId> <artifact> <humanInput>` to resume that specific node.

---

## §5 — Component 4 Concurrent Group Output

**File:** `tooling/src/backward-pass-orderer.ts`

### New `BackwardPassPlan` Type

```typescript
export type BackwardPassPlan = BackwardPassEntry[][];
// Outer array: sequential steps (run in order)
// Inner array: concurrent group (entries may run in parallel)
// Linear flows: every inner array has exactly one entry
```

This is a breaking change to the component's output type. All existing callers of `computeBackwardPassOrder` and `orderWithPromptsFromFile` must be updated to iterate over the outer array and then the inner array. The `triggers.ts` `ToolTriggerEngine` calls `orderWithPromptsFromFile` but does not use its return value — it records success/failure only — so it requires no logic change, only TypeScript compilation compatibility.

### New `computeBackwardPassOrder` Signature

```typescript
export function computeBackwardPassOrder(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],  // NEW — previously unused; now drives the algorithm
  synthesisRole: string,
  recordFolderPath: string = 'the record folder',
): BackwardPassPlan
```

The `edges` parameter is now required and drives the topological algorithm. Callers that previously passed only `nodes` must add `edges`. The `orderWithPromptsFromFile` function threads `frontmatter.workflow.edges` to `computeBackwardPassOrder` (see below).

### Graph-Based Algorithm

The algorithm computes "reverse distance from terminal" for each node using BFS. Nodes at the same distance form a concurrent group. Roles are deduplicated across groups (first occurrence wins, in backward-pass order).

```typescript
// Step 1: Build predecessors map
const predecessors: Record<string, string[]> = {};
for (const edge of edges) {
  predecessors[edge.to] = [...(predecessors[edge.to] ?? []), edge.from];
}

// Step 2: Find terminal nodes (no outgoing edges)
const hasOutgoing = new Set(edges.map(e => e.from));
const terminalIds = nodes.map(n => n.id).filter(id => !hasOutgoing.has(id));

// Step 3: BFS from terminals through predecessor links
const nodeDistance: Record<string, number> = {};
const queue: string[] = [...terminalIds];
terminalIds.forEach(id => { nodeDistance[id] = 0; });
while (queue.length > 0) {
  const current = queue.shift()!;
  const dist = nodeDistance[current];
  for (const pred of (predecessors[current] ?? [])) {
    if (nodeDistance[pred] === undefined) {
      nodeDistance[pred] = dist + 1;
      queue.push(pred);
    }
    // Already-visited predecessors are skipped — this handles revision-loop back-edges naturally
  }
}

// Step 4: Group nodes by distance, sort descending (highest = earliest in backward pass)
const distanceGroups: Record<number, string[]> = {};
for (const [id, dist] of Object.entries(nodeDistance)) {
  distanceGroups[dist] = [...(distanceGroups[dist] ?? []), id];
}
const sortedDistances = Object.keys(distanceGroups).map(Number).sort((a, b) => b - a);

// Step 5: Collect roles, deduplicate across all groups
const nodeById: Record<string, WorkflowNode> = Object.fromEntries(nodes.map(n => [n.id, n]));
const seenRoles = new Set<string>();
const roleGroups: string[][] = [];

for (const dist of sortedDistances) {
  const idsAtDist = distanceGroups[dist];
  const newRoles = idsAtDist
    .map(id => nodeById[id]?.role)
    .filter((role): role is string => !!role && !seenRoles.has(role))
    .filter((role, idx, arr) => arr.indexOf(role) === idx); // dedup within group
  for (const role of newRoles) seenRoles.add(role);
  if (newRoles.length > 0) roleGroups.push(newRoles);
}

// Step 6: Convert to BackwardPassPlan
// (compute positions, build BackwardPassEntry objects, append synthesis)
```

**Position numbering:** Total steps = (sum of all group sizes) + 1 (synthesis). Positions are sequential across groups: group 1 positions start at 1, group 2 continues from where group 1 left off, etc.

**Synthesis handling:** The synthesis role is NOT excluded from meta-analysis. If the synthesis role appears in the graph, it gets a meta-analysis entry at its first-occurrence distance, and then a synthesis entry appended at the end — identical to current behavior for linear flows.

### `createMetaAnalysisPrompt` Update

Add a `concurrent` parameter:

```typescript
function createMetaAnalysisPrompt(
  role: string,
  position: number,
  total: number,
  nextRole: string,
  nextStepType: 'meta-analysis' | 'synthesis',
  concurrent: boolean,  // NEW
): string {
  const lines = [
    `Next action: Perform your backward pass meta-analysis (step ${position} of ${total}).`,
    `Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in ${GENERAL_IMPROVEMENT_PATH}`,
    `Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to ${nextRole} (${nextStepType}).`,
  ];
  if (concurrent) {
    lines.push(
      `Note: this step is concurrent — other roles are performing their meta-analysis in parallel. File your findings at the next available sub-labeled position (e.g., NNa-, NNb-) after reading the record folder's current contents to confirm the available slot.`
    );
  }
  return lines.join('\n\n');
}
```

A concurrent group is detected when `innerArray.length > 1`. The `concurrent` flag is `true` for all entries in that inner array. Single-entry groups (including all linear-flow groups) pass `concurrent: false`, producing prompts identical to the current output. This is the backward-compatibility guarantee for linear flows.

### `orderWithPromptsFromFile` Update

Thread `frontmatter.workflow.edges` to `computeBackwardPassOrder`:

```typescript
return computeBackwardPassOrder(
  frontmatter.workflow.nodes,
  frontmatter.workflow.edges,  // NEW — thread edges
  synthesisRole,
  recordFolderPath,
);
```

No change to the function's own signature or file-reading logic.

### Backward Pass for This Flow

For reference: running the new algorithm on the `20260402-parallel-track-orchestration` `workflow.md` produces:

| Step | Group | Roles | Type |
|---|---|---|---|
| 1 | [Owner] | Owner | meta-analysis, sequential |
| 2 | [Technical Architect] | Technical Architect | meta-analysis, sequential |
| 3 | [Tooling Developer, Runtime Developer] | Both | meta-analysis, **concurrent** |
| 4 | [Curator] | Curator | meta-analysis, sequential |
| 5 | [Curator] | Curator | synthesis |

(Owner nodes at distances 5, 4, 2 and Curator at distance 1 are deduplicated against earlier appearances.)

---

## §6 — Tier 1 Text Visualization

**File:** `runtime/src/visualization.ts` (new file)

### Exported Function

```typescript
import type { FlowRun } from './types.js';

interface WfGraph {
  nodes: Array<{ id: string; role: string }>;
  edges: Array<{ from: string; to: string }>;
}

export function renderFlowStatus(flowRun: FlowRun, wf: WfGraph): string
```

Returns a formatted string. Does not write to stdout. `cli.ts` is responsible for `console.log`.

### Pending Join Detection

A node is a pending join if all of the following are true:
- It is not in `flowRun.activeNodes`
- It is not in `flowRun.completedNodes`
- It has more than one incoming edge
- At least one incoming edge source is in `flowRun.completedNodes`

```typescript
function findPendingJoins(flowRun: FlowRun, wf: WfGraph): Array<{ nodeId: string; role: string; waiting: string[] }> {
  const incomingEdges: Record<string, string[]> = {};
  for (const edge of wf.edges) {
    incomingEdges[edge.to] = [...(incomingEdges[edge.to] ?? []), edge.from];
  }
  return wf.nodes
    .filter(n => {
      const preds = incomingEdges[n.id] ?? [];
      if (preds.length <= 1) return false;
      if (flowRun.activeNodes.includes(n.id)) return false;
      if (flowRun.completedNodes.includes(n.id)) return false;
      return preds.some(p => flowRun.completedNodes.includes(p));
    })
    .map(n => ({
      nodeId: n.id,
      role: n.role,
      waiting: (incomingEdges[n.id] ?? []).filter(p => !flowRun.completedNodes.includes(p)),
    }));
}
```

### Output Format

The exact output of `renderFlowStatus`:

```
=== RUNTIME FLOW STATUS ===
Record Folder: {flowRun.recordFolderPath}
Status: {flowRun.status}

Active nodes:
  [→] {nodeId} ({role})
  ...

Completed nodes:
  [✓] {nodeId} ({role})
  ...

Pending joins:
  [ ] {nodeId} ({role}) — waiting for: {waiting.join(', ')}
```

Rules:
- If `flowRun.activeNodes` is empty: emit `  (none)` under "Active nodes".
- If `flowRun.completedNodes` is empty: emit `  (none)` under "Completed nodes".
- Omit the "Pending joins" section entirely if there are no pending joins. Do not emit the header with `(none)`.
- Each node is displayed in the order it appears in `wf.nodes` (preserves topology order from `workflow.md`).

### Visualization Location

`flow-status` CLI command only. Not integrated into `advanceFlow`'s execution loop. The operator runs `tsx src/cli.ts flow-status` explicitly to inspect state.

---

## §7 — Files Changed Summary

**Track A — Tooling Developer:**

| File | Action | Key change |
|---|---|---|
| `tooling/src/backward-pass-orderer.ts` | Replace | Graph-based algorithm; `edges` param; `BackwardPassPlan = BackwardPassEntry[][]`; concurrent prompt note |
| `tooling/INVOCATION.md` | Replace | Component 4 entry: new signature, output type, concurrent group note; algorithm description updated (Type C) |
| `tooling/test/backward-pass-orderer.test.ts` | Replace | New tests: parallel graph, concurrent group output, linear regression |

**Track B — Runtime Developer:**

| File | Action | Key change |
|---|---|---|
| `runtime/src/types.ts` | Replace | `FlowRun` redesign (`activeNodes`, `completedNodes`, `completedNodeArtifacts`, `pendingNodeArtifacts`) |
| `runtime/src/handoff.ts` | Replace | `HandoffTarget` type; `HandoffBlock` removed; `parse()` returns `HandoffTarget[]` |
| `runtime/src/orchestrator.ts` | Replace | `advanceFlow(flowRun, nodeId, activeArtifactPath?, humanInput?)`; fork/join logic; node-keyed sessions |
| `runtime/src/injection.ts` | Additive | `activeArtifactPath: string \| string[]`; array injection loop |
| `runtime/src/cli.ts` | Replace | `startFlow` passes `nodeId`; `resumeFlow(nodeId, artifact?, humanInput?)`; `flowStatus` uses visualization |
| `runtime/src/visualization.ts` | Additive (new file) | `renderFlowStatus(flowRun, wf): string` |
| `runtime/INVOCATION.md` | Replace | `resume-flow` signature (`nodeId`, optional artifact); `flow-status` output description |
| `runtime/test/*.ts` (affected) | Replace | Updated for new types and signatures |

**Curator track (post-convergence):**

| File | Action | Key change |
|---|---|---|
| `general/instructions/communication/coordination/machine-readable-handoff.md` | Replace | Array form schema; worked example for fork; when-to-use rule |
| `a-society/a-docs/tooling/general-coupling-map.md` | Additive | Component 4 Type C note; no new format dependency row needed (handoff format not tooling-parsed) |
| `a-society/index.md` (and internal index) | Verify | Path Validator sweep after Curator implementation |
| Update report (new file in `a-society/updates/`) | Additive | `[LIB]` scope: handoff schema change |
| `a-society/VERSION.md` | Replace | Minor version increment |

---

## §8 — Behavioral Requirements per File (Binding Checklist)

This section is the binding implementation checklist. A behavioral requirement not named in this table is not structurally in the Developer's scope.

### Track A

**`tooling/src/backward-pass-orderer.ts`:**

| Requirement | Expected behavior |
|---|---|
| `computeBackwardPassOrder` signature | `(nodes, edges, synthesisRole, recordFolderPath?)` — real extra `edges` parameter, not a stub |
| `edges` used for BFS ordering | Edges array drives predecessor-map construction; not ignored; linear flows pass `edges` from `workflow.md` |
| `BackwardPassPlan` return type | `BackwardPassEntry[][]` — outer array sequential, inner array concurrent group |
| Linear flow: inner array length | Every inner array has exactly one entry for linear topologies |
| Concurrent group detection | When inner array has >1 entry, `concurrent: true` is passed to `createMetaAnalysisPrompt` |
| Concurrent note in prompt | Emitted as a fourth paragraph in the meta-analysis prompt text, exactly as specified in §5 |
| Non-concurrent note omitted | When `concurrent: false`, prompt is identical to current output (regression protection) |
| Cycle handling | Back-edges (already-visited nodes in BFS) are silently skipped; no error thrown for graphs with revision loops |
| Synthesis role in meta-analysis | Synthesis role participates in meta-analysis at its first-occurrence distance AND appears again as synthesis step |
| `orderWithPromptsFromFile` | Passes `frontmatter.workflow.edges` to `computeBackwardPassOrder` — real parameter threading |
| Legacy `path[]` detection | Throws migration error as before (unchanged) |
| No outgoing edges graph | Throws `Error('workflow.nodes must produce at least one terminal node')` — or existing parse error; not silent |

**`tooling/INVOCATION.md` (Type C update):**

| Requirement | Expected behavior |
|---|---|
| Algorithm description | Updated to state edges ARE used for ordering (remove "not used for ordering today") |
| `computeBackwardPassOrder` example | Updated signature showing `edges` parameter |
| Output type | `BackwardPassPlan = BackwardPassEntry[][]` documented with description of outer/inner semantics |
| Concurrent group note | Mention that concurrent inner arrays receive the sub-labeling prompt note |

### Track B

**`runtime/src/types.ts`:**

| Requirement | Expected behavior |
|---|---|
| `currentNode` removed | Field absent from `FlowRun`; TypeScript compilation will surface all references requiring update |
| `activeNodes: string[]` | Present, required; no optional marker |
| `completedNodes: string[]` | Present, required |
| `completedNodeArtifacts: Record<string, string>` | Present, required |
| `pendingNodeArtifacts: Record<string, string[]>` | Present, required |
| `FlowStatus` values | Unchanged |

**`runtime/src/handoff.ts`:**

| Requirement | Expected behavior |
|---|---|
| `HandoffBlock` removed | Type is gone; callers of `parse()` updated to use `HandoffTarget[]` |
| `HandoffTarget` interface | Added: `{ role: string; artifact_path: string \| null }` |
| `parse()` return type | `HandoffTarget[]` |
| Single-object normalization | Returns `[{ role, artifact_path }]` — real normalization, not a comment |
| Array validation | Each entry validated; `HandoffParseError` thrown on invalid entry — real throw |
| Empty array error | `HandoffParseError('Handoff block must contain at least one target.')` thrown — real throw |
| `role` non-empty check | Both single-object and array entries checked for non-empty `role` string |

**`runtime/src/orchestrator.ts`:**

| Requirement | Expected behavior |
|---|---|
| `advanceFlow` signature | `(flowRun, nodeId, activeArtifactPath?, humanInput?)` — real parameters |
| `nodeId ∉ activeNodes` guard | Throws immediately before any LLM call, with message naming `nodeId` and current `activeNodes` |
| Session key | `${flowRun.flowId}__${nodeId}` — real string construction, not `roleKey` |
| `roleKey` derivation | Derived from graph: `wf.nodes.find(n => n.id === nodeId).role` — real lookup |
| `activeArtifactPath` fallback | When undefined: reads `flowRun.pendingNodeArtifacts[nodeId]` — real map read |
| Fork mismatch error (too few) | Error message includes `nodeId` and counts, as specified in §2 |
| Fork mismatch error (too many) | Error message includes `nodeId` and counts, as specified in §2 |
| Non-unique fork-target roles | Error thrown, naming the duplicate role, as specified in §2 |
| Join activation check | Real function call (or inline logic) checking all predecessors in `completedNodes` before adding to `activeNodes` |
| `pendingNodeArtifacts` population | Set for each activated node at activation time, before saving `FlowRun` |
| Terminal with active tracks remaining | Does NOT set `status = 'completed'`; saves and returns; only sets completed when `activeNodes.length === 0` |
| `TERMINAL_FORWARD_PASS` trigger | Fired only when `activeNodes.length === 0` after the final node completes — real in-process call |
| `awaiting_human` sets entire flow paused | `flowRun.status = 'awaiting_human'` regardless of other active nodes — as specified in §4 |

**`runtime/src/injection.ts`:**

| Requirement | Expected behavior |
|---|---|
| `activeArtifactPath` parameter | `string \| string[]` — real type change to function signature |
| String case | Wrapped in array `[activeArtifactPath]` and processed by the same loop — no behavior change for callers passing strings |
| Array case | Each element injected under its own `--- ACTIVE WORKSPACE ARTIFACT (N of M) ---` header — real loop |
| Single-element array | Header omits `(N of M)` suffix — `--- ACTIVE WORKSPACE ARTIFACT ---` (unchanged appearance) |

**`runtime/src/cli.ts`:**

| Requirement | Expected behavior |
|---|---|
| `startFlow` passes `nodeId` | Calls `advanceFlow(flowRun, startNode, startingArtifact)` where `startNode` is node ID string |
| `FlowRun` initialization | Uses new shape (no `currentNode`; `activeNodes`, `completedNodes`, etc. initialized as specified in §1) |
| `resumeFlow` signature | `resumeFlow(nodeId, activeArtifactPath?, humanInput?)` |
| `resume-flow` CLI argument | `nodeId` in position 1; `activeArtifactPath` optional in position 2 |
| `flowStatus` uses visualization | Calls `renderFlowStatus`; falls back to minimal output on `workflow.md` parse failure |
| `renderFlowStatus` import | `import { renderFlowStatus } from './visualization.js'` added |

**`runtime/src/visualization.ts` (new file):**

| Requirement | Expected behavior |
|---|---|
| `renderFlowStatus` returns string | Function returns `string`, does not `console.log` internally |
| Pending-join detection | Real set-difference logic over `completedNodes` and `incomingEdges` per node — not a hardcoded list |
| Active nodes listed | In `wf.nodes` order; format `  [→] {id} ({role})` |
| Completed nodes listed | In `wf.nodes` order; format `  [✓] {id} ({role})` |
| Empty active/completed | `  (none)` emitted as the only line in that section |
| "Pending joins" section | Omitted entirely when no pending joins; not emitted with `(none)` |
| Waiting list format | `  [ ] {id} ({role}) — waiting for: {nodeIds joined with ', '}` |

**`runtime/INVOCATION.md`:**

| Requirement | Expected behavior |
|---|---|
| `resume-flow` usage line | `tsx src/cli.ts resume-flow <nodeId> [activeArtifactPath] [humanInput]` |
| `resume-flow` `nodeId` description | Node ID from `workflow.md` (e.g., `tooling-developer`), not role name |
| `resume-flow` `activeArtifactPath` | Marked optional; description states: if omitted, orchestrator reads from pending node artifacts |
| `flow-status` output description | Updated to describe multi-node format (active nodes, completed nodes, pending joins) |

---

## TA Open Questions Resolution

**Q1: Does `advanceFlow` need a different calling convention for parallel flows, or can the orchestrator determine internally?**

Different calling convention required. The caller specifies `nodeId`. For parallel flows where both `tooling-developer` and `runtime-developer` are active simultaneously, the caller must specify which node completed — the orchestrator cannot determine this from role name alone, because roles are not unique per active node in the general case. The `nodeId`-based convention also makes `resume-flow` unambiguous: the operator knows which node they're advancing by name.

**Q2: Per-track session state or reuse single-session-per-role?**

Per-track session state, keyed by `nodeId`. Session key format: `${flowId}__${nodeId}`. Rationale: the same role appearing in two parallel tracks would share transcript history under the role-keyed scheme, mixing context from unrelated executions. The node-keyed scheme ensures each parallel track has an independent, accurate transcript. The `store.ts` method signatures are unchanged; only the strings passed to them change.

**Q3: Flow-level lock or concurrency control?**

No lock scoped for Tier 1. The runtime CLI is invoked one command at a time by a single operator; Node.js's single-threaded event loop precludes races within a single invocation. The known limitation: if two terminal shells invoke `resume-flow` simultaneously for different active nodes, both processes would read `flow.json`, overwrite it, and produce inconsistent state. Document in `INVOCATION.md` as a known limitation. No semaphore, advisory lock, or file-based mutex is in scope.

**Q4: Standalone `flow-status` command or integrated into `advanceFlow` output?**

Standalone — the existing `flow-status` command, enhanced. Rationale: `advanceFlow` is an execution path; mixing visualization into it couples concerns and pollutes the LLM-call loop with display logic. The operator runs `flow-status` explicitly when they need to inspect state. The visualization logic is factored into `visualization.ts` and called only from `cli.ts`'s `flowStatus` function.

---

## Coupling Map

**Component 4 interface change (Type C):** Component 4's public interface changes: `computeBackwardPassOrder` gains an `edges` parameter; `orderWithPromptsFromFile`'s return type changes from `BackwardPassEntry[]` to `BackwardPassEntry[][]`. Per the coupling map taxonomy, Type C changes require the Tooling Developer to update `$A_SOCIETY_TOOLING_INVOCATION`. Track A's file scope already includes `tooling/INVOCATION.md`. The invocation gap status for Component 4 remains Closed after this update.

**Handoff schema format dependency:** The machine-readable handoff format (in `general/instructions/communication/coordination/machine-readable-handoff.md`) is not currently in the coupling map's format-dependency table — no tooling component parses handoff blocks today. No coupling map row is added as part of this flow. If a future Component 8 (handoff validator) is introduced, it will require a Type B entry at that time. The Curator is not required to add a coupling map row during this flow.

**No new invocation gaps introduced.** Both tracks produce changes to existing components only.

---

## Handoff to Owner

This advisory is ready for Owner review.

**Artifacts to evaluate:** `03-ta-to-owner.md` (this document)

**What the Owner needs to evaluate:**

1. **§1 `FlowRun` redesign** — four-field model (`activeNodes`, `completedNodes`, `completedNodeArtifacts`, `pendingNodeArtifacts`). Confirm this is sufficient or identify any tracking gap.
2. **§2 fork/join algorithm** — fork requires exact handoff-count match (no auto-fan-out). Confirm this is the right failure mode vs. auto-fan-out.
3. **§3 handoff schema** — backward-compatible array extension. The single-object form is unchanged. Confirm no adopting-project concern with the instruction update.
4. **§4 `resume-flow` signature change** — `<roleKey>` replaced by `<nodeId>`. This changes the CLI interface that human operators use. Confirm acceptable.
5. **§5 `BackwardPassPlan` breaking change** — `BackwardPassEntry[]` → `BackwardPassEntry[][]`. All callers update; `triggers.ts` requires no logic change. Confirm acceptable.
6. **§5 cycle handling** — revision-loop back-edges (e.g., `owner-curator-approval → curator-proposal`) silently skipped in BFS. Confirm no concern about undetected cycles producing incorrect ordering.
7. **Tier 1 parallel `awaiting_human` limitation** — any human-collaborative pause halts all tracks. Confirm acceptable for now.

**Open questions for Owner resolution before implementation begins:**

None. All known unknowns from the workflow plan are resolved in this advisory.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260402-parallel-track-orchestration/03-ta-to-owner.md
```
