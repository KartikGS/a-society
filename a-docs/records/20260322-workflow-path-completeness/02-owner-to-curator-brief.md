# Owner → Curator: Briefing

**Subject:** workflow.md path completeness — creation obligation and LIB registration step (2 changes)
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_OWNER_ROLE` | additive |
| `$GENERAL_OWNER_ROLE` | additive |

**Change 1 — `$A_SOCIETY_OWNER_ROLE` `[Curator authority — implement directly]` `[additive]`**

In the Post-Confirmation Protocol section, the existing bullet reads (paraphrased): "creates the record folder, produces `01-owner-workflow-plan.md`…, and creates `workflow.md`…". Immediately after that bullet, add a new bullet:

> When the flow carries `[LIB]` scope, include the registration loop as a distinct step in `workflow.md` at intake. The predictable structure is: Curator publishes update report → version incremented → Owner acknowledgment. The `[LIB]` scope tag is the signal to add this loop; omitting it produces a `workflow.md` path that does not match the flow that actually ran.

The insertion point is after the existing `workflow.md` creation bullet and before the Tier 2/3 brief-writing bullet, as a standalone bullet in the same bulleted list.

---

**Change 2 — `$GENERAL_OWNER_ROLE` `[Requires Owner approval]` `[additive]`**

Two additions to the Post-Confirmation Protocol section:

**(2a)** Extend the existing record-folder bullet to include the `workflow.md` creation obligation, conditional on tooling. The current bullet reads: "creates the record folder and produces `01-owner-workflow-plan.md` — this plan is the approval gate for the flow and must exist before any brief is written". Append to this bullet (before the closing period or as a continuation clause):

> ; when the project uses records with backward pass tooling, also create `workflow.md` alongside `01-owner-workflow-plan.md` at this step — it is a required Phase 0 co-output, not a post-intake artifact

**(2b)** Add a new standalone bullet after the record-folder bullet and before the Tier 2/3 brief-writing bullet:

> When the flow has a known post-implementation publication or registration step (e.g., publishing an update report, incrementing a version record), include that step in the path at intake. These steps are predictable at the time the plan is written and must not be left as implied appendages — they must appear explicitly so the backward pass traversal order reflects the full flow.

Both additions are domain-agnostic and must not reference A-Society-specific artifacts (no `[LIB]` tag, no update report specifics, no `workflow.md` schema details) — the general role is a template for any project.

---

## Scope

**In scope:**
- The two additive changes described above, at the specified insertion points
- Update report assessment per `$A_SOCIETY_UPDATES_PROTOCOL` post-implementation (Curator determines classification; do not pre-specify)

**Out of scope:**
- Changes to any other section of either role file
- Changes to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_RECORDS`, or any other document — this flow is limited to the two role files

---

## Likely Target

- `$A_SOCIETY_OWNER_ROLE` — Post-Confirmation Protocol section
- `$GENERAL_OWNER_ROLE` — Post-Confirmation Protocol section

---

## Open Questions for the Curator

None. Both changes are fully derivable from the brief. The proposal round is mechanical: no judgment calls are required. Proceed directly to drafting content consistent with the insertion points and phrasing guidance above.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for workflow.md path completeness — creation obligation and LIB registration step."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
