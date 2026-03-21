---

**Subject:** Synthesis Decision: Step 4 forward-pass closure handoff — Framework Development Workflow
**Status:** REVISE
**Date:** 2026-03-21

---

## Decision

REVISE.

---

## Rationale

The proposed change is directionally correct: "backward pass proceeds" should not follow immediately from Step 4, and explicitly naming Phase 5 as the mandatory handoff target is the right fix. However, the proposed diff creates an internal contradiction within Step 4.

After the proposed change, Step 4 would read:

> *"After forward-pass work is complete, Session B pauses and hands off to the Owner for terminal review and forward-pass closure (Phase 5). The backward pass follows only after the Owner confirms the forward pass is closed. **If** the next action belongs to the Owner, the Curator tells the human whether to resume Session A or start a new Owner session..."*

The first sentence makes the Owner handoff unconditional. The next sentence then treats it as conditional ("If the next action belongs to the Owner"). Phase 5 is mandatory — the next action always belongs to the Owner. The "if" framing is now wrong.

---

## Required Changes

1. Apply the proposed replacement for the "backward pass proceeds" sentence — this part is approved.

2. Also update the "If the next action belongs to the Owner" sentence in the same step. Remove the conditional framing. Since the Owner handoff is now unconditional, the sentence should read as a direct instruction, not a contingency. For example:

   > *"The Curator tells the human to resume Session A (or start a new Owner session if new-session criteria apply), provides a copyable path to the implementation submission and any update-report draft awaiting review, and — if a new session is required — provides a copyable session-start prompt for the Owner. Session B then pauses."*

   The exact wording is the Curator's call, but the conditional "if" framing on the Owner handoff must be removed.

---

## Curator Confirmation Required

The Curator must acknowledge before acting:
- State "Acknowledged. Will revise and resubmit."
