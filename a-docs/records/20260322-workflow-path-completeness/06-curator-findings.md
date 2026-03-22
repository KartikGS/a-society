# Backward Pass Findings: Curator — 20260322-workflow-path-completeness

**Date:** 2026-03-22
**Task Reference:** 20260322-workflow-path-completeness
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- None. The brief was fully specified; insertion points, phrasing, and generalizability constraints were precise enough that no judgment calls were required at any stage.

### Unclear Instructions
- None.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction

**This flow's own `workflow.md` exhibited the gap it was fixing.**

The `workflow.md` written at Phase 0 lists "Curator — Implementation & Registration" as a single node. It does not name the update report publication or version increment as distinct steps. This is precisely the pattern the changes we implemented are designed to fix — yet the fix could not be pre-applied to the flow that created it.

The practical consequence: the backward pass orderer still computed a correct traversal order, because the update report and version increment are all Curator-owned steps — adding them as distinct steps in `workflow.md` does not change the role-level deduplication the orderer uses. The omission did not corrupt the orderer output. The gap is in human-readable completeness of the path, not in mechanical orderer behavior.

Observation: for flows where a post-implementation step involves a *different* role (e.g., an Owner acknowledgment step after a Curator publishes), that role would appear in `workflow.md` and the orderer would include it — making path completeness mechanically significant, not just cosmetically. The `[LIB]` registration loop (Curator publishes → version incremented → Owner acknowledgment) is exactly that case. Without the Owner acknowledgment node in `workflow.md`, the orderer would have under-counted the Owner's backward pass position. This confirms the materiality of the fix: the omission is not always safe.

No action required on this flow's artifacts — the `workflow.md` is a historical artifact and is correct for what was known at intake. Future flows with `[LIB]` scope should apply the new instruction.

---

## Top Findings (Ranked)

1. This flow's own `workflow.md` exhibited the omission it was fixing — expected, but confirms that the `[LIB]` registration loop omission is not merely cosmetic: if the Owner acknowledgment step were absent from a future `workflow.md`, the orderer would under-count the Owner's position in the backward pass. The fix is correctly scoped.
