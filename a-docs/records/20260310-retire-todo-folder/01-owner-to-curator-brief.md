# Owner → Curator: Briefing

> **Authorization scope:** A briefing establishes scope and direction alignment only. It does not authorize implementation. A Phase 2 Owner decision artifact (`APPROVED` status) is required before the Curator begins implementation. A briefing may state that a direction is acceptable in principle; it must not state or imply that implementation may proceed without that decision.

---

**Subject:** Retire todo/ folder — superseded by project log
**Status:** BRIEFED
**Date:** 2026-03-10

---

## Agreed Change

The `a-docs/todo/` folder was created before the project log existed to hold deferred work items. Now that the project log tracks next priorities, the todo folder is redundant. Both items in it (`1-graph-workflow.md`, `2-owner-as-entry-point.md`) are fully completed and appear in the log archive. The folder and its references should be retired.

---

## Scope

**In scope:**
- Delete `a-docs/todo/1-graph-workflow.md` and `a-docs/todo/2-owner-as-entry-point.md`
- Remove both index variables (`$A_SOCIETY_TODO_GRAPH_WORKFLOW`, `$A_SOCIETY_TODO_OWNER_ENTRY_POINT`) from `$A_SOCIETY_INDEX`
- Remove the `todo/` section from `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Out of scope:**
- Historical record artifacts that reference todo variables — those are immutable and require no changes

---

## Likely Target

- `$A_SOCIETY_INDEX` — remove two rows
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — remove `## todo/` section and its single entry
- `a-society/a-docs/todo/` — delete both files (and the folder)

---

## Open Questions for the Curator

None — the scope and target are clear. This is `[S][MAINT]` — Curator authority. No structural judgment required.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Retire todo/ folder — superseded by project log."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
