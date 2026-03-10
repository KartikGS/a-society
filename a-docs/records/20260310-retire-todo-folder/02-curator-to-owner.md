# Curator -> Owner: Proposal / Submission

**Subject:** Retire `todo/` folder -- superseded by project log
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-10

---

## Trigger

Owner briefing in this active record folder: `01-owner-to-curator-brief.md`. The briefing identified that `a-docs/todo/` is redundant because deferred work is now tracked in the project log and both todo items are already completed and represented in the log archive.

---

## What and Why

This change retires a stale internal structure from A-Society's own `a-docs/`.

The `todo/` folder previously held deferred requirements before `$A_SOCIETY_LOG` existed. That role is now covered by the project log's next-priority and archive model. The two files still indexed under the todo namespace are no longer active work items, and keeping them in place incorrectly suggests that `todo/` remains part of the current operating model.

The correct state is:
- the completed todo artifacts are removed
- their index variables are removed from `$A_SOCIETY_INDEX`
- the rationale section describing `todo/` is removed from `$A_SOCIETY_AGENT_DOCS_GUIDE`

Historical record artifacts that mention the retired variables remain unchanged because record artifacts are immutable.

---

## Where Observed

A-Society -- internal. The redundancy exists in A-Society's own `a-docs/` structure after the project log replaced the todo folder's original function.

---

## Target Location

- `$A_SOCIETY_INDEX`
- `$A_SOCIETY_AGENT_DOCS_GUIDE`
- `$A_SOCIETY_TODO_GRAPH_WORKFLOW`
- `$A_SOCIETY_TODO_OWNER_ENTRY_POINT`

---

## Draft Content

Proposed maintenance actions:

1. Remove the `$A_SOCIETY_TODO_GRAPH_WORKFLOW` row from `$A_SOCIETY_INDEX`.
2. Remove the `$A_SOCIETY_TODO_OWNER_ENTRY_POINT` row from `$A_SOCIETY_INDEX`.
3. Delete the file currently registered as `$A_SOCIETY_TODO_GRAPH_WORKFLOW`.
4. Delete the file currently registered as `$A_SOCIETY_TODO_OWNER_ENTRY_POINT`.
5. Remove the `## \`todo/\`` section from `$A_SOCIETY_AGENT_DOCS_GUIDE`, including its rationale entry for the todo artifacts.
6. Remove the now-empty `a-docs/todo/` folder after the two files are deleted.
7. Leave historical record artifacts unchanged, even where they reference the retired variables.

No new artifact is introduced. This is a consistency cleanup so the documented structure matches the current operating model.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** -- with any implementation constraints
- **REVISE** -- with specific changes required before resubmission
- **REJECTED** -- with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
