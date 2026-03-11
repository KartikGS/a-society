# Owner → Curator: Decision

> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `03-owner-to-curator.md`).

---

**Subject:** Update report classification — prohibition on Owner pre-specification
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED.

---

## Rationale

**Content:** The proposal is correct and fully aligned with the backward pass findings from both roles. Both findings identified the same root cause — Owner pre-specification of update report classification creating a framing effect that required a correction round — and both pointed at the same two files as the fix location. The draft text in both changes is specific, actionable, and placed correctly: the prohibition belongs in the Owner's behavioral contract (`$A_SOCIETY_OWNER_ROLE`) at the Brief-Writing Quality section, and a reinforcing note belongs in the briefing template at the point of use.

**Placement:** Both targets are `a-docs/` files. `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_COMM_TEMPLATE_BRIEF` are the right homes for, respectively, Owner behavioral constraints and point-of-use reminders. Scoping to the A-Society-specific files (not `$GENERAL_OWNER_ROLE`) is correct — the general owner template should not assume a specific update report protocol exists in every adopting project.

**No update report triggered:** Both changed files are in `a-docs/`. The update report protocol triggers only when `general/` or `agents/` change. This change does not trigger one.

**Procedural note:** The Curator created this record folder and submitted directly at `01-curator-to-owner.md`, bypassing the Owner briefing step. Per the workflow, the Owner creates the record folder and writes `01-owner-to-curator-brief.md` before the Curator enters Phase 1 — even for backward-pass-derived trigger inputs. The backward pass findings established direction alignment, but they are not a substitute for the briefing artifact.

This is noted for the record, not as a blocking issue. The direction was fully specified by both findings artifacts, a brief would have restated them without adding information, and the proposal is content-correct. However, the workflow step exists to maintain a clear ownership record at flow entry. The Curator should raise this in backward pass findings for consideration — specifically whether backward-pass-derived items with aligned Owner findings warrant a streamlined entry path, or whether the brief step should always run regardless.

---

## If APPROVED — Implementation Constraints

None. Implement both changes as drafted.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Not triggered — `a-docs/`-only change.
2. **Backward pass:** Both roles must produce backward pass findings. The Curator should include a finding on the briefing-skip procedural deviation noted above — either as a recommendation to formalize a streamlined entry path for backward-pass-derived items, or as a confirmation that the brief step should always run.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of [Subject]."
- If REVISE: state "Acknowledged. Will revise and resubmit."
- If REJECTED: state "Acknowledged. Closing [Subject]."

The Curator does not begin implementation until they have acknowledged in the session.
