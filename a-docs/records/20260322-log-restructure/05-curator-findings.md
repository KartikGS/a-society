# Backward Pass Findings: Curator — 20260322-log-restructure

**Date:** 2026-03-22
**Task Reference:** 20260322-log-restructure
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

### Missing Information

- None. All required files were accessible and sufficient to complete implementation without gaps.

### Unclear Instructions

- None. The brief scope was well-defined; the open question was resolved cleanly during proposal.

### Redundant Information

- None.

### Scope Concerns

- None. All 10 changes (A–J) stayed within the declared scope. The Curator-authority items and LIB items were cleanly separated throughout.

### Workflow Friction

**1. Proposal introduced internally inconsistent terminology — caught by Owner review.**

During proposal, the pointer line (Change A) and archive file header (Change B) were drafted using "append-only" alongside "most recent at top." These conflict: "append-only" conventionally means adding to the bottom (appending), while "most recent at top" requires prepending. The Owner correctly flagged this in `04-owner-to-curator.md` and supplied the corrected form: *"Entries are immutable once written. Most recent at top."*

The flow was not blocked — the constraint was caught at the right stage (review, before implementation). But the inconsistency should have been caught during proposal. The Curator checked structural placement ("will this be in the right file, right section?") but did not check semantic consistency within the proposed output language. For language that specifies ordering or mutability behavior, the two properties should be verified for consistency before submitting.

**Generalizable:** Yes. Any project following the proposal→approval model could benefit from the Curator checking that proposed output language is internally consistent before submitting — not just structurally placed correctly. A brief check of "do these properties contradict each other?" would eliminate a class of Owner correction constraints.

---

**2. Brief paraphrase diverged from source text, requiring a re-read during D1 implementation.**

Change D1 required editing the archival bullet in `$INSTRUCTION_LOG`. The brief described the change semantically ("When a fourth `Previous` entry would be added...") but the actual source text was: "When there are already three `Previous` entries...". The Edit tool requires exact old_string matching; the paraphrase caused the first attempt to fail. Resolution: re-read the relevant section of `$INSTRUCTION_LOG` to obtain the verbatim text, then applied the edit successfully.

This is low-friction — one extra file read — but worth noting as a pattern. Briefs correctly describe semantic intent, not verbatim source. The Curator should always re-read the relevant section of a target file immediately before constructing the old_string for an Edit call, rather than relying on the brief's paraphrase. This is already sound practice; making it explicit would eliminate this class of retry.

**Generalizable:** Yes. This applies to any project where a Curator edits `general/` files based on a brief's description. The fix is a Curator discipline rule, not a process change.

---

**3. Cross-layer consistency check caught a stale reference not in the brief.**

When implementing Change A (removing the `## Archive` section from `$A_SOCIETY_LOG`), the Entry Lifecycle section still contained: "the oldest moves to `## Archive`." This reference would have been stale after the Archive section's removal — but it was not called out in the brief. The Curator's cross-layer consistency standing check caught it. Fixed in the same implementation pass by rewriting `$A_SOCIETY_LOG` via the Write tool (which was already the right tool choice given the large section removal).

This is a positive pattern, not a friction point. Recording it explicitly: the standing check is the correct mechanism for catching this class of stale reference, and it worked as designed.

---

**4. Write tool was the correct choice for the large Archive section removal.**

Removing the 34-entry `## Archive` section from `$A_SOCIETY_LOG` via the Edit tool would have required a large, complex old_string with special characters. The Write tool (full file rewrite) was more reliable. This was a judgment call, not a documented rule. Worth capturing: when a modification removes a large section (roughly more than ten lines of formatted content), the Write tool is more reliable than Edit.

**Generalizable:** Yes — applies to any project with a Curator role implementing large section removals.

---

## Top Findings (Ranked)

1. **Proposal introduced internally inconsistent terminology ("append-only" vs. "most recent at top") — caught by Owner review.** Root: Curator checked structural placement but not semantic consistency of proposed output language. Potential fix: explicit Curator discipline check at proposal — verify that behavioral properties in proposed output language do not contradict each other before submitting.
2. **Brief paraphrase diverged from source text, causing Edit failure at D1.** Root: brief correctly describes intent, not verbatim source. Potential fix: Curator discipline rule — re-read target section immediately before constructing old_string for any Edit call.
3. **Cross-layer consistency check caught stale "## Archive" reference in `$A_SOCIETY_LOG` Entry Lifecycle.** Positive: check worked as designed. No action required.
4. **Write tool vs. Edit tool choice for large section removal — judgment call, no documented rule.** Low priority; a note in Curator guidance would eliminate future uncertainty.
