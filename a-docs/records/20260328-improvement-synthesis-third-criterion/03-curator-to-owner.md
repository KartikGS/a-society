**Subject:** `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — add third merge criterion to Synthesis Phase
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-28

---

## Trigger

Owner briefing `02-owner-to-curator-brief.md` for this flow. The third merge criterion (same workflow type and role path) was established in the doc-maintenance-bundle flow (2026-03-24) and added to `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality section) and `$INSTRUCTION_LOG` (Owner responsibilities). The two improvement documents were not updated at that time. Both now enumerate only two criteria where three are required — a sync gap with the authoritative sources.

---

## What and Why

The merge assessment clause in the Synthesis Phase of both improvement documents currently reads:

> scan existing Next Priorities items for same target files/design area and compatible authority level

A third criterion was approved and added to `$A_SOCIETY_OWNER_ROLE` and `$INSTRUCTION_LOG` in the doc-maintenance-bundle flow: **same workflow type and role path**. The two improvement documents were not updated then and remain out of sync.

The fix adds the third criterion to the Synthesis Phase in both files, using the numbered-list form already established in `$A_SOCIETY_OWNER_ROLE`.

For generalizability: the merge assessment operates on a project's Next Priorities list, which exists in any project that uses this framework regardless of domain. The criterion "same workflow type and role path" applies equally to a software project, a writing project, and a research project — any project with a defined workflow has role paths, and items that share a role path are candidates for bundling. The fix belongs in `$GENERAL_IMPROVEMENT`.

---

## Where Observed

A-Society — internal. The gap was identified as part of the improvement synthesis backward pass (2026-03-24 flow), and the fix was deferred to a dedicated flow.

---

## Target Location

- `$GENERAL_IMPROVEMENT` — Synthesis Phase, Step 2, second bullet — `[Requires Owner approval]`
- `$A_SOCIETY_IMPROVEMENT` — Synthesis Phase, Step 1, second bullet — `[Curator authority — implement directly]`

Both files contain an identical target clause. The `$A_SOCIETY_IMPROVEMENT` change is within Curator authority per the brief; it is included here for completeness and will be implemented alongside the approved LIB change.

---

## Draft Content

**Target clause (current — identical in both files):**

> scan existing Next Priorities items for same target files/design area and compatible authority level

**Replacement clause (identical in both files):**

> scan existing Next Priorities items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path

**In context — `$GENERAL_IMPROVEMENT`, Synthesis Phase, Step 2, second bullet (full sentence, after fix):**

> Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. **Before filing**, apply the merge assessment: scan existing Next Priorities items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Do not initiate an Owner approval loop from within the backward pass.

**In context — `$A_SOCIETY_IMPROVEMENT`, Synthesis Phase, Step 1, second bullet (full sentence, after fix):**

> Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create a Next Priorities entry in `$A_SOCIETY_LOG`. **Before filing**, apply the merge assessment: scan existing Next Priorities items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. The Owner routes these as new flows.

No other changes to either file.

---

## Update Report Draft

*(LIB change — `$GENERAL_IMPROVEMENT` modified; framework update report required per `$A_SOCIETY_UPDATES_PROTOCOL`.)*

> **Note:** Classification is TBD — to be assessed per `$A_SOCIETY_UPDATES_PROTOCOL` post-implementation. Version fields are left as placeholders pending classification. Owner reviews report structure and content; version and classification fields are finalized at Phase 4 Registration.

---

# A-Society Framework Update — 2026-03-28

**Framework Version:** v[TBD — Breaking → v23.0 | Recommended → v22.2]
**Previous Version:** v22.1

## Summary

The merge assessment criteria in `general/improvement/main.md` have been updated to enumerate all three criteria that define a merge candidate in a project's Next Priorities list. Previously the document listed two criteria; the third (same workflow type and role path) was established in the doc-maintenance-bundle flow (2026-03-24) but not propagated to this file at that time. Projects that have adopted the improvement template will have instantiations that enumerate only two criteria.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| [TBD] | 1 | [To be determined at Phase 4 Registration] |

---

## Changes

### Third merge criterion added to Synthesis Phase merge assessment

**Impact:** [TBD — assessed per `$A_SOCIETY_UPDATES_PROTOCOL` at Phase 4]
**Affected artifacts:** [`general/improvement/main.md`]
**What changed:** The merge assessment clause in the Synthesis Phase was updated from a two-criterion form to a three-criterion numbered list. The clause now reads: "scan existing Next Priorities items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path." Previously, criterion (3) was absent and the disjunction in criterion (1) was expressed as `files/design area` rather than `files or same design area`.
**Why:** The third criterion — same workflow type and role path — was established in the doc-maintenance-bundle flow (2026-03-24) and added to the Owner role template and log instruction at that time. The improvement template was not updated in that flow, creating a cross-document inconsistency. Without the third criterion, a synthesis agent applying the merge assessment may bundle items that would run through different workflows — producing a merged entry that cannot be cleanly routed as a single flow.
**Migration guidance:** Locate the Synthesis Phase section in your project's improvement document (typically instantiated from `$[PROJECT]_IMPROVEMENT` or a corresponding path in your project's `a-docs/improvement/`). Find the sentence beginning "**Before filing**, apply the merge assessment:". If this sentence enumerates only two criteria (target files/design area and authority level), update it to add the third: "…for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path".

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
