---

**Subject:** A-Society workflow — complexity analysis pointer at Owner intake
**Status:** BRIEFED
**Date:** 2026-03-16

---

## Agreed Change

`$INSTRUCTION_WORKFLOW` now has a "Routing Complexity at Intake" section pointing to `$INSTRUCTION_WORKFLOW_COMPLEXITY`. The A-Society-specific workflow document (`$A_SOCIETY_WORKFLOW`) has no equivalent pointer. An Owner agent reading A-Society's workflow to understand how to handle incoming work has no indication that complexity analysis governs routing decisions at intake.

One pointer addition to `$A_SOCIETY_WORKFLOW` closes the gap — same pointer, same context, scoped to the A-Society instantiation.

Surfaced in the backward pass of `20260316-owner-role-complexity-references` (`07-owner-findings.md`, finding 1).

---

## Scope

**In scope:**

- `$A_SOCIETY_WORKFLOW` (`a-society/a-docs/workflow/main.md`) — add a pointer to `$INSTRUCTION_WORKFLOW_COMPLEXITY` at the appropriate intake point. Candidate locations are: the Trigger Sources section, the Phase 1 Input description, or the Session A entry in the Session Model. The Curator should select the placement that best fits the local structure without disrupting the phase definitions.

**Out of scope:**

- Changes to `$INSTRUCTION_WORKFLOW_COMPLEXITY` itself
- Changes to any `general/` file — this is an `a-docs/` maintenance change only
- Changes to any other workflow phases or invariants

---

## Likely Target

- `a-society/a-docs/workflow/main.md` — near the trigger-to-Phase-1 transition; exact placement is Curator's judgment

---

## Open Questions for the Curator

None. Single pointer addition; placement is within Curator execution scope.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for A-Society workflow — complexity analysis pointer at Owner intake."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
