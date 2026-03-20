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
