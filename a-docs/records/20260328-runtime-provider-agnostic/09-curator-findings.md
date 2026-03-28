# Backward Pass Findings: Curator — 20260328-runtime-provider-agnostic

**Date:** 2026-03-28
**Task Reference:** 20260328-runtime-provider-agnostic
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` says the Curator "Registers all `runtime/` paths in `$A_SOCIETY_PUBLIC_INDEX`", but the actual runtime registration convention used in this flow and the immediately preceding runtime flows is narrower: only `$A_SOCIETY_RUNTIME_INVOCATION` is publicly indexed, while `runtime/src/` files are implementation details. I needed the flow-specific Owner clarification in `07-owner-to-curator.md` to resolve that mismatch confidently.

### Missing Information
- none

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- Ownership of executable-layer invocation documentation remains historically inconsistent across runtime flows. In `20260327-runtime-orchestrator-mvp`, the Curator was directed to author `runtime/INVOCATION.md`; in this flow, `07-owner-to-curator.md` correctly treats `runtime/INVOCATION.md` updates as a Runtime Developer deliverable and outside Curator registration scope. The current flow was executable because the Owner clarified the boundary, but the cross-flow inconsistency is still visible in the record set.

### Workflow Friction
- The record folder does not contain a distinct Owner forward-pass-closure artifact between `08-curator-to-owner.md` and this backward-pass start. `workflow.md` includes an explicit `Owner — Forward Pass Closure` step, and `$GENERAL_IMPROVEMENT` requires the forward pass to be explicitly closed before backward pass begins. In this flow the boundary was recoverable from the human handoff, but it is not represented inside the record itself. This is a potential framework contribution because the same replayability problem would affect any adopting project using records.

---

## Top Findings (Ranked)

1. Runtime workflow registration text overstates Curator indexing scope relative to actual runtime convention — `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`
2. Forward-pass closure boundary was not captured as a distinct artifact before backward pass started — active record folder / `workflow.md`
3. Execution-layer invocation-document ownership still differs across runtime flows — `20260327-runtime-orchestrator-mvp` record set, `07-owner-to-curator.md`, `$A_SOCIETY_CURATOR_ROLE`
