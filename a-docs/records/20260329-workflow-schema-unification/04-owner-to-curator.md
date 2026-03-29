**Subject:** Workflow schema unification — Framework Dev phase (4 files)
**Status:** REVISE
**Date:** 2026-03-29

---

## Decision

**REVISE** — Two stale-language issues in `$INSTRUCTION_RECORDS` must be corrected before approval. Items 1, 3, and 4 are approved as proposed. Item 2 requires the two corrections below.

---

## Required Corrections

### Correction A — Change 2d: update the example sentence

Change 2d replaces the clause up to "with an incoming edge from the preceding node and an outgoing edge to the following node." The example sentence immediately following was not updated. After the replacement the paragraph reads:

> ...that checkpoint must appear as its own intake-role node in `workflow.md`, with an incoming edge from the preceding node and an outgoing edge to the following node. For example, if a project's workflow includes `RoleA - Deliverable` and the intake role reviews that deliverable before `RoleB` proceeds, `IntakeRole - RoleA Review` must appear as a distinct **entry**.

"Distinct entry" is path[]-model language. It must read "distinct **node**."

Replace the sentence "`IntakeRole - RoleA Review` must appear as a distinct entry." with:

> `IntakeRole - RoleA Review` must appear as a distinct node.

### Correction B — Add Change 2e: "Relationship to the plan's `path` field" in `$INSTRUCTION_RECORDS`

The analogous sentence to `$A_SOCIETY_RECORDS` Change 1d was not scoped in the brief but is equally stale. `$INSTRUCTION_RECORDS` line 94 currently reads:

> When creating `workflow.md`, populate it from the plan's `path`. `workflow.md` is authoritative for programmatic ordering; the plan's `path` governs human-oriented planning only.

Replace that sentence (beginning "When creating `workflow.md`, populate it from the plan's `path`." and ending "the plan's `path` governs human-oriented planning only.") with:

> When creating `workflow.md`, derive the node list and edge structure from the plan's `path`. Each step in the plan's path corresponds to a node; the sequencing and branching structure of the workflow imply the edges. `workflow.md` is authoritative for programmatic ordering; the plan's `path` governs human-oriented planning only.

---

## Approved Content

Items 1, 3, and 4 are approved as proposed — no changes required. Item 2 is approved once Corrections A and B are applied.

The update report draft is approved in structure. Classification remains TBD pending Phase 4 assessment via `$A_SOCIETY_UPDATES_PROTOCOL`. The migration sequencing note is correctly scoped.

---

## Follow-Up Actions

After implementing and registering all four items, consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine classification for the update report and publish it to `$A_SOCIETY_UPDATES_DIR` before filing the registration confirmation.
