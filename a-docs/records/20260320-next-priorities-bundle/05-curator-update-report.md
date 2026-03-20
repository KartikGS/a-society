**Subject:** Next Priorities Bundle Update Report
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-20

---

## Trigger

Completion of Phase 4 Registration for the Next Priorities Bundle (Priorities 2-6), which modified `$GENERAL_OWNER_ROLE` and `$INSTRUCTION_RECORDS`, qualifying for an outbound Framework Update Report.

---

## What and Why

This framework update communicates two project-agnostic improvements to adopting projects:
1. Multi-file scope guidance added to the Brief-Writing Quality section, stipulating a "Files Changed" summary table in briefings. This streamlines downstream implementation paths.
2. A required reference stability rule for records, shifting from hardcoded sequence IDs to function-based artifact references so that injected/intermittent artifacts do not break existing procedural references.

Both are clarity and stability improvements, without causing contradicting gaps to prior framework states. Therefore, they are classified as **Recommended**. Following version increment protocol, this moves the framework from `v14.0` to `v14.1`.

---

## Where Observed

A-Society — Internal

---

## Target Location

`$A_SOCIETY_UPDATES_DIR/2026-03-20-briefing-records-refinements.md`

---

## Draft Content

```markdown
**Framework Version:** v14.1
**Previous Version:** v14.0

## Summary

This update adds multi-file scope guidance to the Owner role for writing better implementation briefs, and updates the Records convention to refer to trailing artifacts functionally to prevent sequence breaks. These changes streamline implementation and improve the stability of flow records in adopting projects.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 2 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Add "Files Changed" Summary to Briefing Quality Guidance

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_OWNER_ROLE`
**What changed:** Added guidance to the Brief-Writing Quality section of the Owner role stipulating that when a brief spans multiple files, it should include a "Files Changed" summary table detailing the specific target files and the expected action (additive, replace, insert).
**Why:** Improves clarity and streamlines the implementation plan for the downstream role receiving the brief.
**Migration guidance:** Update the Brief-Writing Quality section in `$[PROJECT]_OWNER_ROLE` to include this multi-file briefing requirement.

---

### Adopt Function-Based References for Trailing Sequence Artifacts

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_RECORDS` Instruction
**What changed:** Added a reference stability rule prohibiting the use of hardcoded sequence IDs (e.g. `05-findings.md`) in standing instructions and templates, requiring instead functional references for trailing artifacts (e.g. "the backward-pass findings artifact").
**Why:** Intermediate submissions, revisions, and additions in active record folders shift expected sequence IDs. Using functional labels instead ensures reference stability.
**Migration guidance:** Add a block about sequence reference stability into your `$[PROJECT]_RECORDS` instruction indicating that instructions and templates must refer to trailing artifacts functionally. Ensure that no internal templates within your project currently hardcode trailing sequence IDs.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Implementation Status *(Update Report Submissions only — omit for Proposals and Maintenance Changes)*

**Implementation complete:** Yes
**Files changed:** `$A_SOCIETY_UPDATES_TEMPLATE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_RECORDS`, `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_INDEX`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_RECORDS`.
**Publication condition outstanding:** Yes — Pending Owner approval of this draft and subsequent Phase 4 version increment on `$A_SOCIETY_VERSION` upon publication.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
