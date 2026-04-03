# Backward Pass Findings: Curator — 20260403-role-guidance-precision-bundle

**Date:** 2026-04-03
**Task Reference:** 20260403-role-guidance-precision-bundle
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

---

### Missing Information

**Finding 1: No documented Curator behavior for unverifiable brief state claims during proposal**

During the proposal phase, the brief asserted for C-1: "A-Society role already has this; general-layer counterpart needed." I re-read `$A_SOCIETY_CURATOR_ROLE`'s Implementation Practices section and could not locate a specific item matching the "implementation portability gap" description — not by name, not by description, not as a subset of any existing item.

I trusted the brief's assertion and proceeded — drafting C-1's general-layer text from the finding description rather than a source precedent. No correction round occurred, and the drafted text is coherent. But this outcome was lucky, not structurally guaranteed.

**Root cause:** The Curator role has "Implementation stage — re-read before editing" (about Edit call construction) and the A-Society Curator role has "Review Artifact Quality" (about Owner decision artifacts making state claims). Neither addresses the analogous situation for Curator proposals: *when a brief makes a state claim about a source document ("X is already implemented in role Y"), the Curator has no documented guidance to verify that claim during the proposal stage, or to flag it if unverifiable.*

The failure mode: a brief asserts a source precedent that doesn't exist. The Curator drafts general-layer text from the finding description, producing content with no verified anchor. If the finding description were imprecise, the drafted text would be imprecise too — and no structural check catches this before submission.

**Warranted action:** Add Curator guidance: when a brief makes a specific state claim about a source document ("X already exists in role Y," "the A-Society-specific role has this"), verify by re-reading that document during the proposal stage. If the claim cannot be confirmed, note the discrepancy explicitly in the proposal rather than silently trusting the brief.

This is a `$GENERAL_CURATOR_ROLE` addition — requires Owner approval. **Potentially generalizable:** applies equally to any project where a brief references a source precedent.

---

### Unclear Instructions

- None.

---

### Redundant Information

- None.

---

### Scope Concerns

- None. Role boundaries were clear throughout.

---

### Workflow Friction

**Finding 2: Owner closure artifact specified a non-compliant update report filename**

`04-owner-to-curator.md` instructed: "file the framework update report to `a-society/updates/2026-04-03.md`." This filename is missing the required descriptor component — the Version Comparator naming pattern is `[YYYY-MM-DD]-[descriptor].md`, and files not matching that pattern are ignored.

I applied the protocol naming convention (`2026-04-03-role-guidance-precision-bundle.md`) and flagged the deviation in `05-curator-to-owner.md`. Resolution was correct.

**Root cause:** The update report protocol documents the naming contract and states it is stable and programmatically enforced. But the Owner's Forward Pass Closure Discipline guidance (both `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`) contains no reminder that update report filenames in closure instructions must follow the naming convention. The Owner generated a non-compliant path in the closure artifact without a structural cue to check the protocol.

The failure mode is low-severity here because the Curator caught it and applied the correct name. But if the Curator had followed the Owner's instruction literally, the file would have been silently ignored by the Version Comparator with no error.

**Warranted action:** Add a note in the Owner's Forward Pass Closure Discipline or update-report-related guidance: when a closure instruction specifies an update report filing path, use the protocol naming format `[YYYY-MM-DD]-[descriptor].md`. This is both `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` — requires Owner approval. **Potentially generalizable.**

**Note: Cross-layer drift for O-2 (structured-entry replacement boundary)**

O-2 is net-new to `$GENERAL_OWNER_ROLE` and has no A-Society-specific precedent. `$A_SOCIETY_OWNER_ROLE` does not carry this item. This is expected behavior — the brief scoped only the general layer, and the cross-layer drift was flagged in the closure artifact. Included here for the Owner's next-priorities assessment and synthesis pass.

---

## Top Findings (Ranked)

1. **No Curator guidance for unverifiable brief state claims during proposal** — `$GENERAL_CURATOR_ROLE` / `$A_SOCIETY_CURATOR_ROLE` Implementation Practices (missing item; brief's precedent assertion for C-1 could not be verified from current file state)
2. **Owner closure artifact produced non-compliant update report filename** — `$GENERAL_OWNER_ROLE` / `$A_SOCIETY_OWNER_ROLE` Forward Pass Closure Discipline (naming contract not surfaced at closure time; Curator-side catch was correct but not structurally guaranteed)
3. **O-2 cross-layer drift: `$A_SOCIETY_OWNER_ROLE` lacks structured-entry replacement boundary** — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality (net-new general-layer item has no A-Society counterpart; flagged for future maintenance flow)
