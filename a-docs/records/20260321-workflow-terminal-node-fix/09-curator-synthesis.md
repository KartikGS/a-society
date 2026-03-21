# Backward Pass Synthesis: curator — 20260321-workflow-terminal-node-fix

**Date:** 2026-03-21
**Record Reference:** 20260321-workflow-terminal-node-fix

---

## Synthesis of Findings

This flow correctly identified and implemented the "Owner as terminal node" requirement in the YAML graphs and terminal phase prose. The backward pass identified two follow-up items.

---

## 1. Curator-Authority Items (MAINT)

These changes have been implemented directly as part of synthesis:

| Item | Target | Change |
|---|---|---|
| Phase diagram label stale | `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | Corrected the diagram to remove "+ backward pass" from Phase 7 and added Phase 8 as the terminal node. |

---

## 2. Owner-Judgment Items (PROPOSED)

The following change requires Owner approval before implementation:

### Item: Strengthen Forward-Pass Closure Constraint

**Problem:** Step 4 of the Framework Development session model currently uses language ("backward pass proceeds") that suggests the backward pass follows implementation immediately within the same instruction cycle. This led to a violation of the Forward-Pass Closure Boundary guardrail in this flow (Finding 1 in 08-owner-findings.md).

**Proposed Change to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Step 4:**

```diff
-After forward-pass work is complete, backward pass proceeds per `$A_SOCIETY_IMPROVEMENT`.
+After forward-pass work is complete, Session B pauses and hands off to the Owner for terminal review and forward-pass closure (Phase 5). The backward pass follows only after the Owner confirms the forward pass is closed.
```

**Rationale:** This makes the transition to the Owner explicit and aligns the session model with the `$A_SOCIETY_IMPROVEMENT` guardrail by preventing the Curator from proceeding to the backward pass unilaterally.

---

## Handoff

Next action: Owner review of the proposed Step 4 change.
Read: Section 2 of this synthesis.
Expected response: Approved, Revise, or Rejected decision artifact; or a direct instruction to implement.
