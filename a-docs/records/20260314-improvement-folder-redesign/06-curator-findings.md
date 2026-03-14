# Backward Pass Findings: Curator — 20260314-improvement-folder-redesign

**Date:** 2026-03-14
**Task Reference:** 20260314-improvement-folder-redesign
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- The brief's scope for `$INSTRUCTION_WORKFLOW` said "remove 'How actionable findings re-enter as standard workflow observations'" but that exact phrase did not appear verbatim in `$INSTRUCTION_WORKFLOW` — it appeared in `$INSTRUCTION_IMPROVEMENT`'s "Integration with the Workflow" section. The matching text in `$INSTRUCTION_WORKFLOW` was "Findings re-enter the workflow as proposals for the next iteration." The intent was clear once the brief's direction was understood, but locating the exact target required cross-referencing. No error resulted, but a brief that names the exact phrase to remove accelerates execution.

### Missing Information

- The Owner's implementation note in `05-owner-update-report.md` ("Consider softening 'naming which role produces findings first and why' to 'naming which role produces findings first (per the traversal algorithm)'") was received after the update report was already published. The note was flagged as non-blocking and "for a future maintenance pass" — but it has no record entry to surface it as a future flow candidate. A minor wording correction in a published update report is out of scope to amend (reports are immutable once produced), but the equivalent text in `$GENERAL_IMPROVEMENT` itself could be checked. This finding is noted here so it enters the synthesis step.

### Unclear Instructions

- The brief listed "update the index table in `$INSTRUCTION_IMPROVEMENT` to remove the protocol variable row and any associated project-level protocol variable guidance" as an in-scope change. On reading the current `$INSTRUCTION_IMPROVEMENT`, the index table already used `$[PROJECT]_IMPROVEMENT_PROTOCOL` as a placeholder (not a registered variable) — removing it from the integration table and the `$A_SOCIETY_INDEX` were clearly separable tasks. The full rewrite handled the former naturally; the latter was a direct edit. No issue resulted, but the brief's phrasing briefly suggested these were the same operation.

### Redundant Information

- None.

### Scope Concerns

- Location A in `$INSTRUCTION_WORKFLOW` (the "Backward pass ordering" paragraph in "The Owner as Workflow Entry and Terminal Node") was not explicitly named in the brief's scope but was flagged in the proposal and confirmed in scope by the Owner. The correct handling worked well — flagging explicitly in the proposal rather than acting unilaterally or silently skipping. Pattern worth preserving.

### Workflow Friction

- None. The flow ran cleanly: brief → proposal → Owner review → implementation → update report submission → Owner approval → publication. The constraint-handling step (four implementation constraints from the Owner's decision) was well-structured — each constraint was specific enough to apply without ambiguity.

---

## Top Findings (Ranked)

1. Owner's post-publication note on Change 4 migration guidance wording has no mechanism to surface as a future flow — check `$GENERAL_IMPROVEMENT` for the equivalent phrase and consider a minor correction in a future maintenance pass. (`$GENERAL_IMPROVEMENT`, "Backward Pass Traversal" migration guidance equivalent)
2. Brief scope descriptions that name a phrase to remove should quote the exact text as it appears in the target file — not the conceptual version — to eliminate lookup friction during implementation. (process observation, no doc change needed)
3. The "index table in `$INSTRUCTION_IMPROVEMENT`" scope item could be split into two explicit tasks in future briefs: (a) remove the variable row from the instruction's integration table, and (b) remove the variable row from `$A_SOCIETY_INDEX`. (process observation, no doc change needed)
