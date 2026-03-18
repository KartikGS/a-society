---
**Subject:** Backward pass findings — Curator
**Task Reference:** 20260318-process-gap-bundle
**Role:** Curator
**Date:** 2026-03-18
**Depth:** Full

---

## Findings

### Conflicting Instructions

- none

### Missing Information

- **Variable pre-registration not surfaced in brief.** Item 4b proposed content for `$A_SOCIETY_TOOLING_COUPLING_MAP` and Item 4c proposed content for `$A_SOCIETY_TOOLING_ADDENDUM` both referenced `$A_SOCIETY_TOOLING_INVOCATION` — a variable that was absent from `$A_SOCIETY_INDEX` (the internal index). The brief did not flag this gap. The Curator derived the pre-registration prerequisite from the Index-Before-Reference Invariant and caught the gap during a pre-implementation grep check. Had the check been skipped, both files would have shipped with an unresolvable variable reference. Affected location: `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — the brief template has no prompt for the Owner to verify that every variable referenced in proposed content is already registered in the relevant index.

- **Edit mode not specified for additive items.** Items 3a (three sub-changes to `$INSTRUCTION_RECORDS`) proposed new content to add to existing sections but did not specify whether the additions should be inserted (preserving surrounding content) or whether they replace existing content. The Curator judged all three as additive insertions, confirmed the surrounding content was compatible, and proceeded. In denser flows, an ambiguous edit mode creates risk of incorrect replacement. Affected location: `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — change items lack an explicit `[additive]` / `[replace]` / `[insert before X]` instruction field.

### Unclear Instructions

- **Heading level for new sections not specified.** Item 4b(ii) directed the Curator to add a new "a-docs/ Format Dependencies" section to `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` before "## Escalate to Owner When." The insertion point was clear, but the heading level for the new section was not stated. The Curator matched the adjacent section's `##` level by inference. For briefing items that add new sections, the brief should state the heading level explicitly, or the brief template should include a "Heading level:" field.

### Redundant Information

- none

### Scope Concerns

- **`$A_SOCIETY_INDEX` ambiguity in MAINT table.** Priority 3 MAINT items listed variable `$A_SOCIETY_INDEX` as the target for the `.js` → `.ts` corrections. In A-Society's index system, `$A_SOCIETY_INDEX` refers to the internal `a-docs/indexes/main.md`, while the public-facing index is `a-society/index.md`. The `.js` paths being corrected appear only in `a-society/index.md` (the public tooling index), not in the internal index. The MAINT variable name pointed to the wrong file — the Curator resolved this by reading the surrounding context and confirming that the tooling path entries exist only in the public index, but the ambiguity required a lookup that should not have been necessary. *Generalizable finding: see below.*

### Workflow Friction

- **Owner handoff artifact numbering is provisional, not authoritative.** The Owner's Phase 2 decision artifact (04) specified "backward-pass findings as 05-curator-findings.md." After the Curator completed Phase 3 implementation and ran the update report eligibility assessment, a Breaking change was identified, inserting an update report draft at 05 and Owner response at 06. Findings shifted to 07. The Owner's numbering was correct at decision time (before the update report assessment), but any explicit post-implementation numbering in the Owner's handoff is necessarily provisional. This is a known limitation of the records protocol — the Owner cannot predict eligibility at handoff time — but the friction would be reduced if the Owner's handoff said "backward-pass findings follow once all Curator → Owner submissions are resolved" rather than giving a specific artifact number. *Generalizable finding: see below.*

- **Per-item artifact list requires Curator to mentally transpose to per-file list.** The single-pass-per-file constraint (Constraint C) requires the Curator to identify all items touching each file before beginning any edits. The brief organizes changes by item (each item lists affected artifacts), but the Curator needs a per-file change list to execute single-pass edits. With 12 items across 16+ files, the transposition is non-trivial and adds pre-implementation planning overhead. The Curator constructed this list mentally; a structured brief format that includes a "files changed" summary at the top (generated from the per-item artifact fields) would reduce this friction.

---

## Top Findings (Ranked)

1. Variable pre-registration not surfaced in brief — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (change item format)
2. Owner handoff numbering for post-implementation artifacts is provisional — `$A_SOCIETY_OWNER_ROLE` (Handoff Output) / records convention
3. Single-pass constraint requires per-file transposition not supported by brief format — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (brief structure)
4. Edit mode not specified for additive change items — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (change item format)
5. `$A_SOCIETY_INDEX` variable name ambiguous when two indexes exist — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` / variable naming convention

---

## Generalizable Findings

**Finding (Owner handoff numbering):** In any project using a records structure where post-implementation submissions can shift artifact numbering, the Owner's handoff should refer to downstream artifacts by role and function ("backward-pass findings" or "findings after all submissions resolved"), not by a fixed sequence number. This applies to any project with a records convention and a post-implementation report/review step. *Flag for A-Society framework contribution if a records-aware handoff naming convention is not already addressed in `$INSTRUCTION_RECORDS` or `$INSTRUCTION_ROLES`.*

**Finding (`$A_SOCIETY_INDEX` ambiguity):** In projects that maintain both a public-facing index and an internal index under different variable names, change items should reference the specific variable corresponding to the intended file, not a generic "project index" variable. When both indexes exist, there is no safe default.
