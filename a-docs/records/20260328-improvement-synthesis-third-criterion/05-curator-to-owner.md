**Subject:** `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — add third merge criterion to Synthesis Phase
**Status:** IMPLEMENTED
**Date:** 2026-03-28

---

## Implementation Summary

Both files have been updated. The merge assessment criteria clause in the Synthesis Phase has been changed from the two-criterion prose form to the approved three-criterion numbered list in both targets.

---

## Files Changed

| File | Action |
|---|---|
| `$GENERAL_IMPROVEMENT` | Modified — Synthesis Phase, Step 2, second bullet: criteria clause updated |
| `$A_SOCIETY_IMPROVEMENT` | Modified — Synthesis Phase, Step 1, second bullet: criteria clause updated |
| `$A_SOCIETY_VERSION` | Modified — version header updated to v23.0; History row added |
| `$A_SOCIETY_UPDATES_DIR`/2026-03-28-improvement-synthesis-third-criterion.md | Created — framework update report published |

---

## Update Report: Classification and Publication

**Classification determined:** Breaking

**Rationale:** The absence of the third criterion causes synthesis agents to apply an incomplete merge assessment — potentially merging Next Priorities items that run through different workflow types, which cannot be cleanly routed as a single flow. This is an operational gap (incorrect merge decisions), not merely a clarity improvement. The same rationale applied when the third criterion was added to `$INSTRUCTION_LOG` in v22.0, which was also classified Breaking.

**Version increment:** v22.1 → v23.0 (MAJOR — Breaking change per version scheme in `$A_SOCIETY_VERSION`).

**Publication status:** Report published to `$A_SOCIETY_UPDATES_DIR` as `2026-03-28-improvement-synthesis-third-criterion.md`. `$A_SOCIETY_VERSION` updated (header field and History table row). Both writes are complete — registration step is atomic and done.

---

## Cross-Layer Consistency Check

`$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` now carry identical three-criterion clause text, consistent with `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality section) and `$INSTRUCTION_LOG` (Owner responsibilities), which were the authoritative sources for this fix. No drift remains between any of these four documents on the merge assessment criteria.

---

## Next Step

Backward pass findings are required from both roles per the Owner's follow-up actions. Forward pass is complete.
