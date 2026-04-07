# Backward Pass Synthesis: 20260407-role-jit-extraction

**Date:** 2026-04-07
**Task Reference:** 20260407-role-jit-extraction
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Review

### Curator Findings (07-curator-findings.md)

**Finding 1 — `06-owner-closure.md` declared the backward pass unnecessary.** Endorsed, but not a documentation-gap finding. The standing protocol already requires the backward pass in `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`, `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, and the current closure guidance. Historical artifacts are immutable, so no direct fix was applied to the record. No new Next Priorities item was created; this is an execution miss, not a missing rule.

**Finding 2 — the brief under-scoped `$A_SOCIETY_AGENT_DOCS_GUIDE` propagation by treating it as additive-only.** Actionable. The direct A-Society fix belongs in `$A_SOCIETY_OWNER_BRIEF_WRITING`: extraction scopes must include a stale-description sweep for existing guide entries, index descriptions, role summaries, and similar descriptive surfaces. Implemented directly.

**Finding 3 — the findings template still does not model the required backward-pass analysis families.** Actionable, but outside `a-docs/`. The correct route is the existing `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` Next Priorities item in `$A_SOCIETY_LOG`. That item was broadened in place to cover both `a-docs Structure Check Notes` and `Role File Gaps`, and updated with this flow's citations.

**Finding 4 — `$A_SOCIETY_CURATOR_IMPL_PRACTICES` preserved outdated Write/Edit tool terminology after extraction.** Actionable. The direct A-Society fix belongs in `$A_SOCIETY_CURATOR_IMPL_PRACTICES`: normalize tool-surface terminology to the live environment or rewrite in capability terms, and restate the editing rules in patch-vs-rewrite language rather than obsolete tool names. Implemented directly.

### Owner Findings (08-owner-findings.md)

**Finding 1 — additive-only propagation sweep for extraction flows.** Endorsed and already covered by Curator Finding 2. Implemented directly in `$A_SOCIETY_OWNER_BRIEF_WRITING`, and the reusable counterpart was merged into the existing role-guidance precision item in `$A_SOCIETY_LOG`.

**Finding 2 — removal scopes did not require verification of all occurrences of the target reference.** Actionable. The direct A-Society fix also belongs in `$A_SOCIETY_OWNER_BRIEF_WRITING`: when a brief scopes removal of a named variable, pointer, or cross-reference, it must verify all occurrences in the target file before handoff. Implemented directly, and the reusable counterpart was merged into the same role-guidance precision item in `$A_SOCIETY_LOG`.

**Finding 3 — the findings template alignment gap persisted for a second flow.** Endorsed and already covered by Curator Finding 3. No duplicate routing created; the existing template-alignment item in `$A_SOCIETY_LOG` was expanded in place and given this flow's corroborating citations.

**Role-file-gap note — outdated tool-surface terminology in the extracted Curator support doc.** Endorsed and already covered by Curator Finding 4. Implemented directly in `$A_SOCIETY_CURATOR_IMPL_PRACTICES`, and the reusable counterpart was merged into the existing role-guidance precision item in `$A_SOCIETY_LOG`.

---

## Actions Taken

### Direct Implementation

**`$A_SOCIETY_OWNER_BRIEF_WRITING` — stale-description sweep for extraction scopes.** Added a new brief-writing rule requiring the Owner to assess whether extraction or relocation makes existing descriptive surfaces inaccurate, and to scope those accuracy edits explicitly rather than treating the propagation sweep as additive-only.

**`$A_SOCIETY_OWNER_BRIEF_WRITING` — all-occurrence verification for reference removals.** Added a new brief-writing rule requiring the Owner to sweep the full target file for every occurrence of a named variable, pointer, or cross-reference before finalizing a removal scope.

**`$A_SOCIETY_CURATOR_IMPL_PRACTICES` — live tool-surface normalization and edit-strategy wording.** Added a rule requiring maintained guidance to use the live tool surface or capability terms, replaced the outdated `old_string` / Edit-call wording with targeted-patching language, and replaced the obsolete Write-vs-Edit rule with a least-fragile patch-vs-rewrite rule for large removals.

### Next Priorities

**Merge assessment**

- **Reusable Owner/Curator guidance counterparts:** merged into the existing `[S][LIB]` "Role-guidance precision follow-up: proposal-state claims and closure-time artifact precision" item in `$A_SOCIETY_LOG`. Same target files (`$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`), same role-guidance precision design area, compatible authority level, and same Framework Dev workflow path.
- **Findings-template alignment:** merged into the existing `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` item in `$A_SOCIETY_LOG`. Same target file, same backward-pass reporting-surface design area, compatible authority level, and same Framework Dev workflow path.
- **Backward-pass-not-required statement in the closure artifact:** no routing action. The governing protocol already covers the requirement and the historical artifact is immutable, so no maintenance item or Next Priorities entry was created for this execution miss.

**Log updates completed**

- Expanded the existing "Role-guidance precision follow-up" item to absorb three reusable clarifications from this backward pass: extraction stale-description sweeps, all-occurrence verification for reference removals, and tool-surface terminology normalization.
- Broadened the existing findings-template alignment item from `a-docs Structure Check Notes` only to both standing analysis families surfaced by this flow: `a-docs Structure Check Notes` and `Role File Gaps`.

---

## Flow Status

Backward pass complete. All actionable `a-docs/` issues were implemented directly in this synthesis pass, and the out-of-`a-docs/` follow-up work was merged into existing Next Priorities items in `$A_SOCIETY_LOG`. No further handoff is required.
