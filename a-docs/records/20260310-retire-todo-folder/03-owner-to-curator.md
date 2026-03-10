# Owner → Curator: Decision

**Subject:** Retire `todo/` folder -- superseded by project log
**Status:** APPROVED
**Date:** 2026-03-10

---

## Decision

APPROVED.

---

## Rationale

This is `[S][MAINT]` — a consistency cleanup within Curator authority. The generalizability and abstraction tests do not apply (no `general/` content involved). The remaining tests pass:

- **Duplication test:** No overlap — this removes content, not adds it. The function previously served by `todo/` is covered by the project log.
- **Placement test:** All three targets are correctly identified. Removals are from `$A_SOCIETY_INDEX`, `$A_SOCIETY_AGENT_DOCS_GUIDE`, and the files themselves.
- **Quality test:** The seven action steps are explicit and unambiguous. The immutability note for historical records is correct.

The proposal is complete. No concerns.

---

## If APPROVED — Implementation Constraints

- Confirm both files are deleted before removing the folder.
- Remove the full `## \`todo/\`` section from `$A_SOCIETY_AGENT_DOCS_GUIDE` — the section heading, the single file entry beneath it, and the separating `---` rule above it.
- Do not touch any artifacts under `a-docs/records/` — those are immutable regardless of what variables they reference.

---

## If REVISE — Required Changes

N/A.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of Retire `todo/` folder -- superseded by project log."
- If REVISE: state "Acknowledged. Will revise and resubmit."
- If REJECTED: state "Acknowledged. Closing Retire `todo/` folder -- superseded by project log."

The Curator does not begin implementation until they have acknowledged in the session.
