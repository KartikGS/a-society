# Backward Pass Findings: Curator — 20260321-workflow-mechanics-corrections

**Date:** 2026-03-21
**Task Reference:** 20260321-workflow-mechanics-corrections
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **Item 1 creates a transitional write-authority gap in the implementing flow itself.** After implementing Item 1 (full log write authority transferred to Owner), I retained a Follow-Up Action from the Owner to add a `$INSTRUCTION_RECORDS` Next Priorities entry. The new rule says the Owner writes all log sections at Phase 5; the Owner's explicit instruction directed me to write to Next Priorities now. These two signals are compatible only because the explicit instruction was present — without it, I would not have written to the log under the new rule. The transitional case (implementing a role authority transfer in the same flow that establishes it) is not covered by any existing protocol. I followed the explicit instruction, but the correct behavior was not derivable from the written rules alone.

### Missing Information

- **The brief did not flag the Phase 5 Work stale sentence.** Item 4 removed the post-implementation update-report submission model. Phase 5 Work currently begins with "Review any pending update-report submission." That sentence became stale as a direct consequence of Item 4's edits, but the brief did not identify Phase 5 Work as a target for Item 4. I caught this during proposal formulation and included it in the combined Phase 5 rewrite (4e). The Owner confirmed this was correct. The gap: multi-file bundles where one item makes another item in the same file stale require the Curator to apply a cross-item consistency check within each target file — this expectation exists implicitly in the Curator's standing checks but is not stated as a targeted obligation for brief-specified edits.

- **The brief's Item 4i scope was narrower than the correct change.** The brief asked about adding a new section for the update report draft to the Curator-to-Owner template. My assessment found that two existing elements (the "Update Report Submission" Type value and the "Implementation Status" section) were rendered vestigial by the model change. Neither was mentioned in the brief. I included both in the proposal; the Owner approved them. The broader finding: template change briefs that add new content should also ask whether the change obsoletes existing template content. A brief that asks "do we need to add X?" should also prompt the Curator to assess "does adding X obsolete Y?"

### Unclear Instructions

- **The update report submission format under the old model was ambiguous after Item 4i was implemented.** Constraint 2 required me to use the current workflow model for this flow's update report submission. But Item 4i removed the "Implementation Status" section and "Update Report Submission" type from the template. I had to file `05-curator-update-report.md` using the old submission fields (implementation complete, files changed, publication condition) — but these fields no longer exist in the current template. I modeled the submission after the protocol's "Submission Requirements" section rather than the now-modified template, which was the correct move. But the correct fallback was not explicitly stated anywhere — the constraint said "use the current workflow model" but didn't address what to do when the template itself had just changed. This is an unavoidable transitional edge case for any flow that implements a format change and immediately uses the old format, but the resolution path could be documented.

### Redundant Information

- none

### Scope Concerns

- none

### Workflow Friction

- **First edit attempt on `$A_SOCIETY_CURATOR_ROLE` (Item 1a) failed** because I attempted to match text without a trailing period, but the actual line had no terminal punctuation. I had to re-read the relevant file section before the edit succeeded. This is a consistent pattern across flows: whenever the brief quotes a target string, the quoted string may not match the file exactly (whitespace, punctuation, trailing characters differ). Matching brittle strings requires a read-then-edit discipline that the flow does not formally require but experience shows is necessary. Not a protocol gap — standard practice — but worth noting for consistency.

- **`$GENERAL_IMPROVEMENT` step 5 edit failed on first attempt** due to the same string-matching issue. The actual file structure numbered steps "4." and "5." consecutively without an intermediate item I had anticipated. Re-reading the section revealed the correct match. Same root cause as above.

---

## Top Findings (Ranked)

1. **Role authority transfer flows have no protocol for write authority during the transition** — `$A_SOCIETY_IMPROVEMENT` / `$A_SOCIETY_RECORDS` / `$A_SOCIETY_CURATOR_ROLE`; the implementing flow itself is the one case where the old and new rules conflict, and explicit Owner instruction was the only resolution path.

2. **Cross-item stale content within a target file is not explicitly a Curator obligation during implementation** — `$A_SOCIETY_CURATOR_ROLE` Standing Checks; the implicit expectation to check within-file consistency across items should be made explicit for brief-specified multi-item edits.

3. **Template change briefs should scope both additions and the obsolescence they create** — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` / `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality; the brief for Item 4i identified the addition but not the two vestigial elements removed. An output-format change brief should include an explicit "obsoletes" assessment.

4. **Transitional format fallback after same-flow template removal is undocumented** — `$A_SOCIETY_UPDATES_PROTOCOL` Submission Requirements; when a flow removes a template section and immediately files a submission under the old format, the correct fallback (protocol over template) is not stated.

---

## Generalizable Findings

Finding 3 (template change briefs should scope obsolescence) is generalizable: any project whose briefs can introduce output-format changes would benefit from an explicit "does this change make any existing field or section obsolete?" prompt in the brief-writing guidance. This applies equally to a software project (API spec changes), a writing project (style guide changes), and a research project (report template changes).

Finding 2 (cross-item stale content within a file) is generalizable: any project with multi-file, multi-item briefs faces the same cross-item consistency gap within individual target files.
