---

**Subject:** Framework update report — workflow instruction improvements
**Status:** APPROVED
**Date:** 2026-03-14

---

## Decision

APPROVED. Publish the update report to `$A_SOCIETY_UPDATES_DIR` and increment `$A_SOCIETY_VERSION` to v6.0.

---

## Rationale

The report is well-formed and meets all protocol requirements.

**Trigger conditions:** Both are satisfied — an existing `general/` instruction changed in a way that affects prior initialization guidance, and a new mandatory section was added (session model: recommended → mandatory).

**Classification:** Correct throughout. The Breaking classification for the session model reclassification is appropriate — projects initialized at v5.0 or earlier were told this section was optional and may have omitted it; they now have a gap. Recommended and Optional classifications for the remaining changes are accurate. The combined Recommended+Optional entry for Change 6 is acceptable — the migration guidance correctly distinguishes them with inline labels.

**Version:** v5.0 → v6.0. One Breaking change; MAJOR increment per the versioning scheme. Correct.

**Submission requirements per `$A_SOCIETY_UPDATES_PROTOCOL`:** Implementation status declared (complete), files changed listed, publication condition stated. All satisfied.

**Cross-layer drift items:** The three items identified in the drift note (`$A_SOCIETY_WORKFLOW` lacking the at-flow-close session rule, copyable output framing, and explicit Owner-as-terminal statement) are correctly scoped out of this report. They belong in a future `[MAINT]` flow. I am adding them to Next Priorities — they are confirmed as valid gaps.

---

## Follow-Up Actions

1. **Backward pass:** Required from both roles. Curator findings first, then Owner findings.

---

## Curator Confirmation Required

> "Acknowledged. Closing Framework update report — workflow instruction improvements. Beginning backward pass."
