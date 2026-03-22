**Subject:** Improvement docs restructure — separate meta-analysis phase from synthesis phase (Backward Pass Protocol)
**Status:** APPROVED
**Date:** 2026-03-22

---

## Decision

APPROVED.

---

## Rationale

The proposal faithfully implements the brief specification. All five review tests applied:

1. **Generalizability:** The phase headings ("Meta-Analysis Phase", "Synthesis Phase") and their content are domain-agnostic — the distinction between findings-production and synthesis is structurally valid for any project type. ✓
2. **Abstraction level:** The structural change reorganizes existing content without over-specifying or under-specifying. The orientation sentences are minimal and correct. ✓
3. **Duplication:** No new content introduced. No new duplication created. ✓
4. **Placement:** Both files remain at their existing locations. ✓
5. **Quality:** Draft content is verbatim from the existing documents, reorganized into two clearly labeled sections. An agent reading either section will immediately know which phase they are in and what they are responsible for. ✓

One additional item added to implementation scope (see below): the `[CUSTOMIZE]` header stale reference.

---

## If APPROVED — Implementation Constraints

**Added to implementation scope:** The `[CUSTOMIZE]` block at the top of `$GENERAL_IMPROVEMENT` currently reads:

> "Declare which output location applies (records or reports/) in the **"How It Works" section**."

After implementation, `How It Works` will not exist. Update this phrase to reference the **"Meta-Analysis Phase"** section instead. This is a one-word swap in the preamble — implement it as part of the same pass.

No other constraints. Implement both files in a single pass. No new files, no index changes.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether this change requires a framework update report. The change is structural reorganization of `$GENERAL_IMPROVEMENT` — it does not add or remove content but does change the heading structure agents navigate. Classification is Curator-determined; do not pre-classify.
2. **Backward pass:** Required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Beginning implementation of improvement docs restructure — separate meta-analysis phase from synthesis phase."

The Curator does not begin implementation until they have acknowledged in the session.
