# Owner → Technical Architect: Design Advisory Brief

**Subject:** Workflow schema unification — Component 4 + Runtime implementation tracks
**Status:** BRIEFED
**Date:** 2026-03-29

---

## Context

This brief covers both implementation tracks of the workflow schema unification. The TA advisory is a single document covering both tracks; the TA must address all items before returning to the Owner.

**Background:** The Framework Dev flow (`20260329-workflow-schema-unification/`) established that record-folder `workflow.md` files use the `nodes/edges` YAML frontmatter schema. Two downstream components must be updated:

1. **Component 4 (`backward-pass-orderer.ts`)** — currently reads the old `path[]` schema and must be updated to parse the new `nodes/edges` format
2. **Runtime orchestrator/CLI** — currently takes `workflowDocumentPath` as an explicit arg in `start-flow`; since `workflow.md` now lives at `recordFolderPath/workflow.md` by convention, this arg is redundant and must be removed

---

## Track A — Component 4 Schema Update

### Current state

- `RecordWorkflowFrontmatter` interface: `workflow.path: WorkflowPathEntry[]` where `WorkflowPathEntry = { role: string; phase: string }`
- `parseRecordWorkflowFrontmatter`: validates `path` array and its entries
- `computeBackwardPassOrder(pathEntries: WorkflowPathEntry[], synthesisRole: string, recordFolderPath?)`: deduplicates by first occurrence in list order; reverses; appends synthesis entry
- `orderWithPromptsFromFile(recordFolderPath: string, synthesisRole: string)`: reads `workflow.md`, parses, calls `computeBackwardPassOrder`

The public entry point `orderWithPromptsFromFile` signature does not change. Internal parsing logic and type interfaces do.

### New schema (per `$A_SOCIETY_RECORDS`)

```yaml
---
workflow:
  name: <string>
  nodes:
    - id: <string>
      role: <string>
      human-collaborative: <string>   # optional
  edges:
    - from: <string>
      to: <string>
      artifact: <string>              # optional
---
```

### Item A1 — Updated Type Interfaces

Specify replacement types for `WorkflowPathEntry` and `RecordWorkflowFrontmatter`. The new interfaces must represent `workflow.nodes[]{id, role, human-collaborative?}` and `workflow.edges[]{from, to, artifact?}`.

### Item A2 — Traversal Algorithm

Specify how Component 4 derives **first-occurrence role ordering** from the nodes/edges graph.

Two candidates — the TA must select one and justify:

- **(a) Node list order:** Treat `workflow.nodes[]` as declared in forward-pass order (consistent with how all existing workflow documents are authored). First occurrence of each role is the first node in the list whose `role` field matches. O(n), no edge traversal required.
- **(b) Topological sort:** Compute a topological ordering from the edges, then derive first occurrence from that ordering. Correct regardless of node declaration order but adds implementation complexity.

Assess whether any existing or anticipated `workflow.md` files would produce different results under (a) vs (b). If none, (a) is preferred for simplicity.

### Item A3 — `computeBackwardPassOrder` Public API

Current signature: `computeBackwardPassOrder(pathEntries: WorkflowPathEntry[], synthesisRole: string, recordFolderPath?)`.

Specify whether this public lower-level entry point:
- **(a) Updates its signature** to accept the new node/edge types (breaking change for any direct callers — only the test suite currently calls this directly), or
- **(b) Is retired** from the public API, with `orderWithPromptsFromFile` as the sole entry point going forward

If (a): specify the new signature.
If (b): specify how the test suite should be updated.

### Item A4 — Validation Rules

Specify validation rules for the new schema:
- Required fields in nodes (`id`, `role`)
- Optional fields (`human-collaborative` — present as string; absent is valid)
- Required fields in edges (`from`, `to`)
- Optional fields (`artifact`)
- Error messages for missing required fields (consistent with existing Component 4 error message style)

### Item A5 — Backward Compatibility

Specify what Component 4 does when it encounters a `workflow.md` still using the old `path[]` schema. Hard-fail with a clear error is preferred; confirm or propose an alternative.

---

## Track B — Runtime `workflowDocumentPath` Removal

### Current state

```ts
// FlowRun type (types.ts)
interface FlowRun {
  flowId: string;
  projectRoot: string;
  workflowDocumentPath: string;   // explicit field
  recordFolderPath: string;
  currentNode: string;
  status: FlowStatus;
}

// startFlow function (cli.ts)
async function startFlow(
  projectRoot: string,
  workflowDocumentPath: string,   // explicit arg
  recordFolderPath: string,
  startingRole: string,
  startingArtifact: string
)

// CLI (cli.ts)
// start-flow <projectRoot> <workflowDocPath> <recordFolderPath> <startingRole> <startingArtifact>

// orchestrator.ts — advanceFlow reads:
const wf = parseWorkflow(flowRun.workflowDocumentPath).workflow;

// ToolTriggerEngine call in startFlow:
await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'START', { workflowDocumentPath });
```

**Target state:** `workflowDocumentPath` is derived as `path.join(recordFolderPath, 'workflow.md')` at the point of use; the explicit arg and field are removed.

### Item B1 — `FlowRun` Type

Specify whether `workflowDocumentPath` should be:

- **(a) Removed from `FlowRun` entirely** — the path is computed at each call site as `path.join(flowRun.recordFolderPath, 'workflow.md')`. Simpler; no stored redundancy.
- **(b) Retained as a derived field** — computed once at `startFlow` and stored for display in `flowStatus()`. Slightly more convenient for diagnostics.

Assess whether existing `.state/flow.json` files (written under the old schema with `workflowDocumentPath`) would cause issues if the field is removed. Given that the runtime is in active development with no production deployments, a clean break is preferred if it simplifies the type — confirm or propose an alternative.

### Item B2 — `startFlow` Function Signature

Specify the updated `startFlow` signature after `workflowDocumentPath` is removed:

```ts
// proposed
async function startFlow(
  projectRoot: string,
  recordFolderPath: string,
  startingRole: string,
  startingArtifact: string
)
```

Confirm or adjust. Specify where `path.join(recordFolderPath, 'workflow.md')` is computed — at the top of `startFlow`, or inline at each use.

### Item B3 — `ToolTriggerEngine.evaluateAndTrigger` (START event)

The current call passes `{ workflowDocumentPath }` as the event payload. After the change, `flowRun.workflowDocumentPath` no longer exists (under option B1a) or is derived internally. Specify:
- Whether the START trigger payload should change (e.g., pass the derived path, or pass nothing for START)
- Whether `triggers.ts` requires any corresponding update

### Item B4 — `advanceFlow` Call Site

`advanceFlow` currently reads:

```ts
const wf = parseWorkflow(flowRun.workflowDocumentPath).workflow;
```

Under option B1a, this becomes:

```ts
const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
```

Confirm this is the correct replacement, or specify an alternative.

### Item B5 — `flowStatus()` Output

Currently prints:

```
Workflow: ${flowRun.workflowDocumentPath}
```

Specify the replacement: either remove the line (if `workflowDocumentPath` is dropped entirely) or replace with the derived path. The derived path is always `${flowRun.recordFolderPath}/workflow.md`.

---

## Advisory Output Requirements

The advisory must produce a binding specification covering all items above, organized by track:

**Track A — Component 4:**
1. Updated type interfaces
2. Traversal algorithm selection with justification
3. `computeBackwardPassOrder` disposition (updated signature or retirement)
4. Validation rules for the new schema
5. Backward-compatibility behavior

**Track B — Runtime:**
1. `FlowRun` type decision (remove or retain as derived) with stored-state impact assessment
2. `startFlow` updated signature and derivation point
3. `ToolTriggerEngine` START payload spec
4. `advanceFlow` call site replacement
5. `flowStatus()` output replacement

**Both tracks:**
- **Files Changed** — table distinguishing Developer scope from Curator scope. Include: `backward-pass-orderer.ts`, test fixtures (Track A); `types.ts`, `orchestrator.ts`, `cli.ts` (Track B); `INVOCATION.md` entries for both (Curator scope, Phase 7)

---

## Return Condition

Return to Owner when the advisory covers all items above. The Owner reviews before any Developer session opens.
