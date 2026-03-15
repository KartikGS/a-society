---

**Subject:** Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)
**Type:** Curator Backward-Pass Findings
**Date:** 2026-03-15

---

## Registration Note: Index Update Not Required

The Owner's follow-up actions included: "Update `$A_SOCIETY_INDEX` to register the new update report if required by convention." By convention, individual update report files are not registered in the index — the index registers only `$A_SOCIETY_UPDATES_DIR` (the directory). The Version Comparator discovers reports by scanning the directory directly. No index entry was added for `2026-03-15-agent-reliability-gaps.md`. This is consistent with all prior update reports.

---

## Cross-Layer Drift Flagged: Archetype Templates in `$INSTRUCTION_ROLES`

**Scope:** Out of scope for this flow — flagging for a future flow.

The Handoff Output language in `$INSTRUCTION_ROLES` Section 7 was updated with the relative path requirement. However, the same document contains six archetype templates (Archetypes 1–6), each of which includes a Handoff Output section with the same copyable-path reference and the same gap. These were not in the brief's scope ("Section 7 (canonical Handoff Output definition)" specifically) and were not updated in this flow.

**Impact:** An agent creating a role document from one of the archetype templates copies the template text, which does not include the path portability requirement. They may not think to apply the canonical definition in Section 7 if they are working from a template. The gap in the templates undercuts the canonical fix.

**Recommendation:** A follow-up flow should update all six archetype template Handoff Output sections in `$INSTRUCTION_ROLES` to match the Section 7 language. This is a targeted maintenance change — no direction decision implied.

---

## Flow Assessment

**Brief quality:** Fully specified. All three changes were derivable from the brief with no judgment calls. The proposal round was a straight confirmation step as intended.

**Implementation:** Clean. Six files updated; wording consistent across all five Handoff Output locations per the Owner's constraint. No deviations from the approved proposal.

**Update report:** Classification and migration guidance assessed as correct post-implementation. The Recommended classification for Change 2 is appropriate — `$INSTRUCTION_AGENTS` is an instruction, not a directly-instantiated template, so existing projects are not structurally broken, only under-guided.

**Process:** The flow ran correctly. The two-submission sequence (main proposal at `02-`, update report at `04-`) worked as designed.

---

## No Other Findings

No additional gaps, drift, or follow-up items identified within this flow's scope.
