# Backward Pass Findings: Curator — 20260328-improvement-synthesis-third-criterion

**Date:** 2026-03-28
**Task Reference:** 20260328-improvement-synthesis-third-criterion
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- None. The brief supplied the exact target clause, its location in both files, and the verbatim replacement text. Classification was deferred deliberately per brief instruction; consulted `$A_SOCIETY_UPDATES_PROTOCOL` and VERSION.md history at Phase 4 to classify correctly as Breaking.

### Unclear Instructions
- The brief said "do not pre-specify classification in the proposal" while the template includes an "Update Report Draft" section. This required inferring that the draft should be included with TBD placeholders for classification and version. The inference was straightforward but the instruction could be read as tension between "include the draft" and "do not pre-specify classification." Resolved correctly; not a blocking gap.

### Redundant Information
- None.

### Scope Concerns
- None. The `[Curator authority — implement directly]` marking for `$A_SOCIETY_IMPROVEMENT` and `[Requires Owner approval]` for `$GENERAL_IMPROVEMENT` were unambiguous. Both changes were scoped correctly.

### Workflow Friction
- **Sync gap root cause (informational).** This flow exists because the doc-maintenance-bundle flow (2026-03-24, v22.0) added the third merge criterion to `$INSTRUCTION_LOG` and `$A_SOCIETY_OWNER_ROLE` but not to `$GENERAL_IMPROVEMENT` or `$A_SOCIETY_IMPROVEMENT`. The Curator role's Standing Checks cover cross-layer consistency between `a-docs/` ↔ `general/` pairs for the *same* artifact type, and cross-item consistency *within* a target file during a multi-item brief. Neither check directly prompts: "when adding a concept to one `general/` document, scan other `general/` documents that instantiate the same concept for propagation."

  The root failure was at the v22.0 brief-scoping stage (Owner intake), not at Curator execution. The Owner did not identify `$GENERAL_IMPROVEMENT` as a co-affected file when scoping the third-criterion addition. The existing cross-layer check and brief-writing quality guidance provide the structural prompts — this was a human judgment gap, not a missing rule.

  Not actionable as a doc change: the existing guidance covers it in principle. Noting it for the Owner's meta-analysis as it is a scoping observation rather than a Curator execution gap.

---

## Top Findings (Ranked)

1. Sync gap originated at v22.0 intake scoping — `$GENERAL_IMPROVEMENT` was not identified as a co-affected file when the third criterion was added to `$INSTRUCTION_LOG` and `$A_SOCIETY_OWNER_ROLE` — `a-society/a-docs/records/20260325-doc-maintenance-bundle/` (historical; resolved by this flow)
2. Mild tension between "include the update report draft" and "do not pre-specify classification" — brief instruction could be made explicit that TBD placeholders are the correct form — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` / `$A_SOCIETY_UPDATES_PROTOCOL`
