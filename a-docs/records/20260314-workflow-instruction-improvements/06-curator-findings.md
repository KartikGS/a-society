# Backward Pass Findings: Curator — 20260314-workflow-instruction-improvements

**Date:** 2026-03-14
**Task Reference:** 20260314-workflow-instruction-improvements
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- The brief subject line stated "eight targeted improvements" while the Agreed Change section listed nine numbered items. Minor drafting artifact with no execution impact — the Curator correctly treated all nine as in scope. No documentation fix needed, but it surfaced a consistency gap: the briefing template has no self-check prompting the Owner to verify that the subject line change count matches the numbered list.

### Missing Information

- The records convention (`$A_SOCIETY_RECORDS`) does not explicitly address what to name the update report submission artifact when it occupies a sequence slot between the main decision and backward pass findings. The convention names the standard positions (01–05) but notes only that additional submissions "take the next available sequence slot." A Curator in a flow like this one has to infer the filename. The current naming (`04-curator-to-owner-update-report.md`) is reasonable but was invented, not derived from a stated rule.

- `$A_SOCIETY_RECORDS` also does not state that the Curator must confirm all submissions are resolved before filing findings. This rule exists in the records document ("Before filing findings, confirm that all submissions in this flow are resolved") but is easy to overlook because it appears mid-paragraph rather than as a named step or checklist item.

### Unclear Instructions

- The standing cross-layer check in `$A_SOCIETY_CURATOR_ROLE` says: "When a change in one layer implies a change in the other, apply both in the same flow." The brief simultaneously said "No other files are in scope for this flow." These are in tension for a flow that modifies `general/instructions/` and finds drift in the corresponding `a-docs/` artifact. The current resolution (flag drift, scope to future flow) is reasonable, but the Curator role could state this resolution explicitly rather than leaving it to in-session judgment.

### Redundant Information

- None.

### Scope Concerns

- None. The Owner's scope constraint was clear and the drift flag mechanism worked as intended.

### Workflow Friction

- The update report submission artifact required producing the full report draft inline in the submission. This is correct per the template ("The Owner must be able to assess the quality and correctness of the proposal from this field alone"). However, the update report is a sizeable artifact, and embedding it in a submission file means the draft lives in a record folder rather than at its eventual publication path during review. If the Owner requests revisions, the draft must be edited in the record folder and then re-published. There is no material friction here — just an observation that the review → publish step requires a copy-out rather than an in-place approval.

---

## Top Findings (Ranked)

1. Cross-layer check vs. scope constraint conflict unresolved in documentation — `$A_SOCIETY_CURATOR_ROLE` standing checks section
2. Records convention does not name the update report submission artifact position — `$A_SOCIETY_RECORDS` artifact sequence table
3. "Before filing findings, confirm all submissions resolved" rule is buried mid-paragraph — `$A_SOCIETY_RECORDS`
4. Briefing template has no count-verification prompt — `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
