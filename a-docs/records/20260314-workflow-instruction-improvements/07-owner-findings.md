# Backward Pass Findings: Owner — 20260314-workflow-instruction-improvements

**Date:** 2026-03-14
**Task Reference:** 20260314-workflow-instruction-improvements
**Role:** Owner
**Depth:** Full

---

## Findings

### On the Curator's findings

All four of the Curator's top findings are valid and actionable. Adding perspective on each:

**Finding 1 (cross-layer check vs. scope constraint):** The Curator correctly resolved it, but the underlying tension is real and the documentation does not name it. The fix should distinguish two cases: (a) drift discovered in the corresponding `a-docs/` artifact that is *within the scope of the current brief* — apply both layers in the same flow, per the standing check; (b) drift discovered that is *outside the current brief's stated scope* — flag for a future flow, do not expand scope unilaterally. The current standing check text implies (a) always applies, which conflicts with any scoped brief. Both cases need to be named.

**Finding 2 (records convention — extra sequence slot naming):** Valid. The table names standard positions but the extra-slot rule is stated only in prose, without a naming convention. A naming pattern for non-standard artifacts (e.g., append a `-descriptor` suffix to the position prefix) would make this derivable rather than invented.

**Finding 3 ("confirm all submissions resolved" rule buried):** Valid. This is an execution-critical rule — filing findings before the update report submission is resolved would be a sequencing error. It should be a named, visible step, not an embedded clause.

**Finding 4 (briefing template count-verify):** Valid. The root cause here: the brief was enumerating complex, nested changes identified across a long review conversation — exactly the condition where count drift is most likely. A simple prompt ("verify that the subject line change count matches the numbered list in Agreed Change") would catch this at authoring time.

---

### Additional findings

**Constraint mechanism — worked correctly.** The implementation constraint in `03-owner-to-curator.md` (split the branching section into conditional branching and parallel fork/join rather than leaving them under the same opening sentence) was specific and actionable. The Curator executed it correctly — the final document shows the correct structure. No process change needed; noting as a positive confirmation that the constraint mechanism serves its purpose.

**Single-brief scope for nine changes.** Nine changes in one brief is at the upper bound of what a single flow can handle cleanly. The justification for keeping them together — all nine targeted the same file — was correct, and the implementation is complete and accurate. However, if a future review session surfaces this many changes across multiple target files, splitting into multiple flows would reduce implementation risk. The one-file justification is the right test: same file + coherent set → one flow; multiple files → consider splitting.

**Q1 and Q2 resolution quality.** Both open questions were genuinely open and both Curator recommendations were accepted without modification. This is the pattern the brief is designed to produce: the Owner surfaces genuine judgment calls rather than questions the Curator must re-derive from first principles. Worth reinforcing as a model for future briefings with open questions.

**The flow confirmed the Owner-as-bookend principle it was codifying.** This flow began at the Owner (brief) and ended at the Owner (backward pass findings). The Curator's update report submission was an intermediate artifact that correctly surfaced to the Owner before publication. The principle held in practice, including for this flow that defined it.

---

## Top Findings (Ranked)

1. Cross-layer check vs. scope constraint conflict needs both cases named — `$A_SOCIETY_CURATOR_ROLE` standing checks section
2. Records convention: extra-slot naming derivable from a stated pattern, not invented — `$A_SOCIETY_RECORDS` artifact sequence table
3. "Confirm all submissions resolved" should be a named step — `$A_SOCIETY_RECORDS`
4. Briefing template: add count-verification prompt — `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
