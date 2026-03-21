# Backward Pass Synthesis (REVISED): curator — 20260321-workflow-terminal-node-fix

**Date:** 2026-03-21
**Record Reference:** 20260321-workflow-terminal-node-fix

---

## 1. Description of Revision

This synthesis resubmission corrects the internal contradiction identified by the Owner in Step 4 of the Framework Development session model. The "if the next action belongs to the Owner" conditional is removed, as the Owner-led Phase 5 is now the mandatory terminal node for the forward pass.

---

## 2. Revised Proposal for `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

**Modified Section:** "How it flows" — Step 4

**Proposed Replacement for Step 4:**

```markdown
4. **Session B resumes.** The human returns to the Curator session and points it at the decision. The Curator implements, registers, and drafts any required update-report submission in the active record folder. After forward-pass work is complete, Session B pauses and hands off to the Owner for terminal review and forward-pass closure (Phase 5). The backward pass follows only after the Owner confirms the forward pass is closed. The Curator tells the human to resume Session A (or start a new Owner session if new-session criteria apply), provides a copyable path to the registration confirmation and any update-report draft awaiting review, and — if a new session is required — provides a copyable session-start prompt for the Owner. Session B then pauses.
```

**Rationale:** This revision satisfies both requirements:
- **Structural:** Prevents premature backward-pass initiation by removing "backward pass proceeds" from the Curator's Step 4 context.
- **Logical:** Removes the obsolete conditional ("If the next action belongs to the Owner"), as Phase 5 is now a fixed structural requirement for every flow.

---

## 3. Implementation of Curator-Authority Items (Status: Complete)

The following MAINT item from the previous synthesis remains implemented:
- **Phase diagram label corrected** in `$A_SOCIETY_WORKFLOW_TOOLING_DEV` (removed "+ backward pass" from Phase 7; added Phase 8 terminal node).

---

## Handoff

Next action: Owner review of the revised Step 4 change.
Read: Section 2 of this revised synthesis.
Expected response: Approved, Revise, or Rejected decision artifact; or a direct instruction to implement.
