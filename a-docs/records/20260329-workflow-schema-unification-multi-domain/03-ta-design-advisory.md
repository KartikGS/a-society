# Design Advisory: Workflow Schema Unification

**Track A:** Component 4 (`backward-pass-orderer.ts`) Schema Update  
**Track B:** Runtime `workflowDocumentPath` Removal  
**Status:** PROPOSED (Ready for Owner Review)  
**Date:** 2026-03-29

---

## 1. Track A: Component 4 Schema Update

### 1.1 Updated Type Interfaces
The legacy `WorkflowPathEntry` and `RecordWorkflowFrontmatter` interfaces are replaced to support the `nodes/edges` graph schema.

```ts
export interface WorkflowNode {
  id: string;
  role: string;
  'human-collaborative'?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  artifact?: string;
}

export interface RecordWorkflowFrontmatter {
  workflow: {
    name?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
}
```

### 1.2 Traversal Algorithm Selection
**Selected: Node List Order.**  
The backward pass order will be derived by performing a sequential scan of the `workflow.nodes[]` array.
- **Rationale:** A-Society workflow documents are authored in forward-pass execution order by convention. The first occurrence of a role in the `nodes[]` list reliably represents that role's entry point into the flow. This approach maintains O(n) complexity and avoids the implementation overhead of topological sorting while remaining consistent with existing and anticipated workflow authoring patterns.
- **Logic:** Iterate through `nodes[]`; collect the first node encountered for each unique `role`; reverse this list; append the `synthesisRole`.

### 1.3 `computeBackwardPassOrder` Disposition
The `computeBackwardPassOrder` lower-level entry point will **update its signature** rather than being retired.
- **New Signature:** `computeBackwardPassOrder(nodes: WorkflowNode[], synthesisRole: string, recordFolderPath?: string): BackwardPassPlan`
- **Impact:** This preserves the ability to unit-test ordering logic without filesystem dependencies. The test suite (`backward-pass-orderer.test.ts`) must be updated to pass `WorkflowNode[]` fixtures.

### 1.4 Validation Rules
`parseRecordWorkflowFrontmatter` must enforce the following:
- `workflow.nodes`: Must be a non-empty array. Each entry must have a non-empty string `id` and `role`. 
- `workflow.edges`: Must be an array. Each entry must have non-empty string `from` and `to`.
- **Error Format:** Matches existing style, e.g., `"workflow.nodes[${index}].role must be a non-empty string"`.

### 1.5 Backward Compatibility
Component 4 will **hard-fail** upon detecting the legacy `path[]` schema.
- **Error Message:** `"Obsolete workflow schema detected (path[]). Please migrate workflow.md to the nodes/edges schema."`

---

## 2. Track B: Runtime Implementation

### 2.1 `FlowRun` Type Decision
**Selected: Remove `workflowDocumentPath` entirely.**  
The field will be dropped from the `FlowRun` interface in `types.ts`.
- **Rationale:** Since the framework now mandates that the workflow document reside at `recordFolderPath/workflow.md`, maintaining an explicit path field introduces redundancy and state-synchronization risk.
- **Stored State Impact:** Existing `.state/flow.json` files containing this field will remain parseable; the field will be ignored by the runtime upon loading. The runtime will proceed using the convention-derived path.

### 2.2 `startFlow` Signature & Derivation
The `startFlow` signature is updated to remove the explicit path argument. The workflow path is derived once at the top of the function.

```ts
// runtime/src/cli.ts
async function startFlow(
  projectRoot: string, 
  recordFolderPath: string, 
  startingRole: string, 
  startingArtifact: string
) {
  const workflowDocumentPath = path.join(recordFolderPath, 'workflow.md');
  // ... use workflowDocumentPath for start-node resolution and trigger payload
}
```

### 2.3 `ToolTriggerEngine` START Payload
The `START` event payload in `cli.ts` will continue to pass the derived `workflowDocumentPath` to remain compatible with Component 3 (**Workflow Graph Schema Validator**).
- **Triggers.ts:** No update required to `triggers.ts`; it will continue to read `payload.workflowDocumentPath`.

### 2.4 `advanceFlow` Call Site Replacement
In `orchestrator.ts`, the explicit field access is replaced with path derivation.
- **Replacement:** `const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;`

### 2.5 `flowStatus()` Output Replacement
The output will continue to display the workflow location for diagnostic clarity, using the derived path.
- **Display:** `Workflow: ${path.join(flowRun.recordFolderPath, 'workflow.md')}`

---

## 3. Files Changed

| File | Track | Role | Change Summary |
|---|---|---|---|
| `tooling/src/backward-pass-orderer.ts` | A | Developer | Interface updates, validation logic, node-scan algorithm. |
| `tooling/test/backward-pass-orderer.test.ts` | A | Developer | Update fixtures to handle `nodes[]` instead of `path[]`. |
| `runtime/src/types.ts` | B | Developer | Remove `workflowDocumentPath` from `FlowRun`. |
| `runtime/src/orchestrator.ts` | B | Developer | Update `advanceFlow` to derive workflow path. |
| `runtime/src/cli.ts` | B | Developer | Update `startFlow` signature, `flowStatus` output, and CLI arg parsing. |
| `tooling/INVOCATION.md` | A | Curator | Update Component 4 schema and examples (Phase 7). |
| `runtime/INVOCATION.md` | B | Curator | Update `start-flow` usage signature (Phase 7). |
