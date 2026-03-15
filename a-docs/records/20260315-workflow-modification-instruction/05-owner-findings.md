# Backward Pass Findings: Owner — 20260315-workflow-modification-instruction

**Date:** 2026-03-15
**Task Reference:** 20260315-workflow-modification-instruction
**Role:** Owner
**Depth:** Standard

---

## Assessment of Curator Findings

Both findings are valid. Confirming their status:

**Finding 1 — `$GENERAL_MANIFEST` not in `$A_SOCIETY_INDEX`:** Confirmed pre-existing gap. The manifest is registered in the public index but not the internal one. This is inconsistent — if it exists and is used, it belongs in both. Actionable. A Curator maintenance proposal is the correct path.

**Finding 2 — `$A_SOCIETY_STRUCTURE` framing too narrow for `general/instructions/`:** I rate this higher than the Curator did. The "how do you create [X]" framing is not just a minor friction point — it is a documentation accuracy issue. The folder already contains operational guidance (`graph.md` maintenance rules, now `modify.md`), so the governing description is materially incomplete. Any Curator placing a future operational companion document in this folder will hit the same open question. A one-sentence qualifier resolves the entire class. Actionable. Curator maintenance proposal.

---

## Owner Findings

### What worked well

The brief design for this flow was effective. Reproducing the agreed principles and hard rules verbatim in the brief eliminated derivation burden from the Curator and meant the proposal was a formalization exercise rather than a re-derivation. The single-pass approval with no revisions reflects this — the brief was precise enough that the Curator had no room to go off-course.

The Curator's generalizability argument was strong and independently reached the same conclusion I would have: the structural constraints (session boundaries, role separation, approval gates, traceability) are domain-agnostic, and the instruction belongs in `general/`.

### Substantive observation: the single-graph model

This flow produced something beyond its stated deliverable. The single-graph model — the insight that "adding a workflow" is structurally identical to "modifying a workflow," and that the Owner node is the invariant entry point — was not previously articulated anywhere in the framework. It is now documented in `$INSTRUCTION_WORKFLOW_MODIFY`.

This insight has implications for A-Society's own workflow going forward. When new types of work are added to A-Society's scope, the correct framing is: what branch does this require from the Owner node? Not: should we create a separate workflow? This should be treated as a settled design decision, not re-opened.

### Workflow design gap surfaced

The initial conversation that produced this brief exposed a structural assumption in the framework: that workflows, once initialized, do not change. This assumption was never stated, which made it invisible until it became a problem. The correct assumption — that workflows are living graphs that grow through modification — is now explicit. No further action needed; the instruction captures it.

---

## Actionable Items (New Trigger Inputs)

1. **`$GENERAL_MANIFEST` registration in `$A_SOCIETY_INDEX`:** Curator maintenance proposal. Add the missing row to the internal index so the manifest is findable from within A-Society's own tooling without requiring knowledge of the public index.

2. **`$A_SOCIETY_STRUCTURE` framing update for `general/instructions/`:** Curator maintenance proposal. Add a one-sentence qualifier to the governing description: the folder covers not only "how to create [X]" but also "how to work with [X] once created." Target: the `general/instructions/` section in `$A_SOCIETY_STRUCTURE`.

Both items are small, well-scoped, and do not require an Owner brief — the Curator may initiate directly at `01-curator-to-owner.md` per the Backward-Pass Streamlined Entry conditions in `$A_SOCIETY_WORKFLOW`.

---

## Flow Status

This flow is complete. All submissions resolved. Backward pass findings produced by both roles. No further Curator follow-up required for this flow — the two actionable items above enter as new trigger inputs in separate flows.
