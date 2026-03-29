# Owner → Developers: Advisory Review + Implementation Opening

**Subject:** TA advisory approved — Track A (Tooling Developer) and Track B (Runtime Developer) open
**Status:** APPROVED
**Date:** 2026-03-29

---

## Decision

The TA design advisory (`03-ta-design-advisory.md`) is **approved in full** for both tracks. Both implementation tracks are now open. Developers may begin immediately.

---

## Track A — Tooling Developer

**Approved spec:**

- **Type interfaces:** Replace `WorkflowPathEntry` and `RecordWorkflowFrontmatter` with `WorkflowNode`, `WorkflowEdge`, and the updated `RecordWorkflowFrontmatter` as specified in §1.1.
- **Traversal algorithm:** Node list order. First occurrence of each unique `role` in `workflow.nodes[]`, reversed, synthesis appended. No edge traversal.
- **`computeBackwardPassOrder` signature:** Update to `computeBackwardPassOrder(nodes: WorkflowNode[], synthesisRole: string, recordFolderPath?: string)`. Not retired — preserves unit testability.
- **Validation rules:** `workflow.nodes` non-empty array; each node requires non-empty `id` and `role`; `workflow.edges` array (may be empty); each edge requires non-empty `from` and `to`. Error format matches existing style.
- **Backward compatibility:** Hard-fail on detection of legacy `path[]` schema with the exact message specified: `"Obsolete workflow schema detected (path[]). Please migrate workflow.md to the nodes/edges schema."`

**Test suite:** `backward-pass-orderer.test.ts` fixtures must be updated to `WorkflowNode[]` format. If `integration.test.ts` contains record-folder fixtures using the old `path[]` schema, those must also be updated.

**Files (Developer scope):** `tooling/src/backward-pass-orderer.ts`, `tooling/test/backward-pass-orderer.test.ts`, and any integration test fixtures using the old schema.

**Files (Curator scope, Phase 7):** `tooling/INVOCATION.md` — Component 4 section update (nodes/edges schema, updated algorithm note). Component 7 entry addition also closes in Phase 7 per the workflow plan.

---

## Track B — Runtime Developer

**Approved spec:**

- **`FlowRun` type:** Remove `workflowDocumentPath` field entirely. Existing `.state/flow.json` files containing the field will have it silently ignored on load — no migration required given active development with no production deployments.
- **`startFlow` signature:** Drop `workflowDocumentPath` parameter. Derive `workflowDocumentPath` as `path.join(recordFolderPath, 'workflow.md')` once at the top of `startFlow`.
- **CLI:** Update arg parsing: `start-flow <projectRoot> <recordFolderPath> <startingRole> <startingArtifact>` (drops `<workflowDocPath>`).
- **`ToolTriggerEngine` START payload:** Continue passing `{ workflowDocumentPath }` using the derived path. `triggers.ts` requires no update — it continues to read `payload.workflowDocumentPath`.
- **`advanceFlow` call site:** Replace `flowRun.workflowDocumentPath` with `path.join(flowRun.recordFolderPath, 'workflow.md')`.
- **`flowStatus()` output:** Display `Workflow: ${path.join(flowRun.recordFolderPath, 'workflow.md')}` using derived path.

**Files (Developer scope):** `runtime/src/types.ts`, `runtime/src/orchestrator.ts`, `runtime/src/cli.ts`.

**Files (Curator scope, Phase 7):** `runtime/INVOCATION.md` — update `start-flow` signature.

---

## Completion Requirements

Each Developer produces a completion report as the next sequenced artifact in this record folder. Completion reports for both tracks must be present before the TA integration review opens.

Use sub-labels: `05a-tooling-completion-report.md` (Track A) and `05b-runtime-completion-report.md` (Track B).

---

## Next Steps

- **Tooling Developer:** Start a new session. Read `a-society/a-docs/agents.md`, then this artifact. Implement per the approved spec above.
- **Runtime Developer:** Start a new session. Read `a-society/a-docs/agents.md`, then this artifact. Implement per the approved spec above.
- **Track C (Curator):** Running in parallel — see `05-owner-to-curator.md`.
