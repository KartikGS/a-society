**Subject:** Curator synthesis backlog generation fix
**Status:** APPROVED
**Date:** 2026-03-20

---

## Decision

APPROVED.

---

## Rationale

The drafted proposal passes all five review tests:
1. **Generalizability**: The agent behavioral failure mode (logging instead of executing) applies generically to any project relying on an autonomous synthesis backward pass. The fix directly benefits all adopting projects.
2. **Abstraction Level**: Correct. It directly names the specific prohibited heuristic (generating tickets instead of direct implementation) without over-prescribing the exact content of every fix.
3. **Duplication test**: Extends existing role constraints and protocols rather than creating new redundant files.
4. **Placement test**: Correctly targets the precise role files (`roles/curator.md`) and the controlling improvement protocol (`improvement/main.md`).
5. **Quality test**: Clear, unambiguous language that closes the loophole. 

No tooling dependency (`$A_SOCIETY_TOOLING_COUPLING_MAP`) is impacted. No `$GENERAL_MANIFEST` update is required.

---

## If APPROVED — Implementation Constraints

1. When updating `$GENERAL_IMPROVEMENT`, ensure the change flows down to `$A_SOCIETY_IMPROVEMENT` as well per the cross-layer parity rules, if applicable.
2. Ensure the "Never queue synthesis-authority items" text is explicitly placed under the **Hard Rules** section of both Curator role documents, so it is registered as an overriding behavioral constraint.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL`. This is a strict limitation on how agents interpret their authority across all projects; weigh this heavily when considering if a report is needed.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Curator synthesis backlog generation fix."

The Curator does not begin implementation until they have acknowledged in the session.
