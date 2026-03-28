# A-Society Framework Update — 2026-03-28

**Framework Version:** v23.0
**Previous Version:** v22.1

## Summary

The merge assessment criteria in `general/improvement/main.md` have been updated to enumerate all three criteria that define a merge candidate in a project's Next Priorities list. Previously the document listed two criteria; the third (same workflow type and role path) was established in the doc-maintenance-bundle flow (2026-03-24) and added to the Owner role template and log instruction at that time, but was not propagated to this file. Projects that have adopted the improvement template will have instantiations that enumerate only two criteria, creating a gap where synthesis agents may incorrectly merge items that should remain separate because they run through different workflow types.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Your improvement document's merge assessment enumerates only two criteria — Curator must update it |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### Third merge criterion added to Synthesis Phase merge assessment

**Impact:** Breaking
**Affected artifacts:** [`general/improvement/main.md`]
**What changed:** The merge assessment clause in the Synthesis Phase was updated from a two-criterion prose form to a three-criterion numbered list. The clause now reads: "scan existing Next Priorities items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path." Previously, criterion (3) was absent and the disjunction in criterion (1) was expressed as `files/design area` rather than `files or same design area`.
**Why:** The third criterion — same workflow type and role path — was established in the doc-maintenance-bundle flow (2026-03-24) and added to the Owner role template and log instruction at that time. The improvement template was not updated in that flow, creating a cross-document inconsistency. Without the third criterion, a synthesis agent applying the merge assessment may bundle Next Priorities items that would run through different workflows — producing a merged entry that cannot be cleanly routed as a single flow.
**Migration guidance:** Locate the Synthesis Phase section in your project's improvement document (typically instantiated from `$[PROJECT]_IMPROVEMENT` or a corresponding path in your project's `a-docs/improvement/`). Find the sentence beginning "**Before filing**, apply the merge assessment:". If this sentence enumerates only two criteria (target files/design area and authority level), update it to add the third: "…for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path".

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
