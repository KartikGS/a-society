---
**Subject:** Backward pass findings — Owner
**Task Reference:** 20260318-process-gap-bundle
**Role:** Owner
**Date:** 2026-03-18
**Depth:** Full

---

## Assessment of Curator Findings

All five of the Curator's top findings are confirmed. Owner notes on each:

**Finding 1 (Variable pre-registration not surfaced in brief):** Constraint A in the decision artifact caught this, but that is the wrong place for it — a decision-level constraint is a correction after the fact, not a structural prompt. The brief template should require the Owner to verify variable registration before sending. This converts a review-stage catch into a brief-stage catch that cannot be missed. The Curator is right that the brief template is the correct fix location.

**Finding 2 (Owner handoff numbering provisional):** Confirmed. My Phase 2 decision artifact specified "`05-curator-findings.md`" — this was correct at decision time, but the update report submission inserted two artifacts before findings. The fix (refer to backward-pass artifacts by function, not by number, when post-implementation submissions are possible) is correct and belongs in `$A_SOCIETY_OWNER_ROLE` Handoff Output and `$A_SOCIETY_RECORDS`. The generalizable finding also holds: any project where post-implementation submissions can intervene before findings has the same issue.

**Finding 3 (Single-pass constraint requires per-file transposition):** Confirmed. The brief was organized by logical item (grouped by theme), which is the right mental structure for scoping and reviewing. But implementation is organized by file. For a 12-item, 16-file bundle, the transposition is real work — and the Curator had to do it mentally. A "Files Changed" summary table at the top of the brief (organized per file, listing all items affecting it) would remove this step. I included a partial version in the "Likely Target" section with the multi-file overlap notes, but it was not a complete per-file → items mapping.

**Finding 4 (Edit mode not specified):** Confirmed for Item 3a sub-changes specifically. For additive insertions into existing sections, the brief should explicitly state whether content is additive or replacing. The Curator's judgment was correct in each case, but it should not have required judgment.

**Finding 5 (`$A_SOCIETY_INDEX` variable naming ambiguity):** Confirmed. The MAINT table in the brief used `$A_SOCIETY_INDEX` when the correct target was `$A_SOCIETY_PUBLIC_INDEX`. Both are registered variables. In a project with only one index, this error would be obvious; with two, it requires a lookup. This is a brief-authoring discipline gap at the Owner level, not just a template gap.

---

## Owner Observations

### Brief format does not scale well for large bundles

This flow was the first large bundle in A-Society's record — nine priorities, four thematic sections, twelve change items. The brief template was designed for single items or small sets of related changes. It handled the bundle adequately, but two structural limitations surfaced:

1. The per-item artifact organization creates per-file transposition work that scales with bundle size.
2. The absence of an explicit edit-mode field forces the Curator to infer whether each change is additive, replacing, or inserting at a specific position.

Both are addressable template additions. They should be addressed before the next large bundle, not when it arrives.

### Variable registration is an Owner-stage responsibility

The Index-Before-Reference Invariant is well-established. But the Owner currently has no prompt to verify variable registration when writing a brief that contains proposed new content referencing variables. The Curator caught the `$A_SOCIETY_TOOLING_INVOCATION` gap — and also caught the `$A_SOCIETY_PUBLIC_INDEX` naming error in the MAINT table — via a grep check. Both should have been caught by the Owner before the brief was sent. Catching these at the brief stage is strictly better than catching them in review or during implementation.

The fix is a standing check in the `$A_SOCIETY_OWNER_ROLE` brief-writing section (and `$GENERAL_OWNER_ROLE`): before sending a brief, verify that every variable referenced in proposed content is registered in the relevant index.

### Bundling validated

No revision cycles. The proposal passed Phase 2 on first submission. All eleven changes were implementable without design ambiguity in the proposal. The decision to bundle Priorities 1–9 was correct — the file overlaps that argued for bundling also argued against rework: a separate flow for each group would have required careful coordination on shared files, or accepted the risk of sequential edits creating partial-state reads.

The bundle size (nine priorities) appears to be near the upper bound for this brief format as currently designed. The brief was long but navigable. Above this size, the per-file transposition problem would become a genuine implementation risk.

### Approval Invariant language tension (residual)

Items 1a–1c collectively address the confusion created by "fully-specified brief → confirmation step" framing. The downstream fix is correct. But the upstream source of the confusion is the Brief-Writing Quality concept itself: the Owner is instructed to write fully-specified briefs for mechanical changes, and this instruction creates a pull toward "just do it" that now conflicts with the clarified Approval Invariant. The Items 1a–1c changes are the right fix for the framing; the deeper question — whether the "fully-specified brief" guidance should be reframed or bounded differently — did not surface as a priority in this flow and may not be worth a dedicated flow, but is worth noting here for the Curator's synthesis.

---

## Actionable Items for Next Priorities

| Item | Type | Target(s) | Authority |
|---|---|---|---|
| A | `[S][MAINT]` | Brief template: add standing variable pre-registration check | Curator proposes; Owner reviews |
| B | `[S][LIB][MAINT]` | Brief template + Owner role: per-file summary field and edit-mode field | Curator proposes; Owner reviews |
| C | `[S][MAINT]` | `$A_SOCIETY_OWNER_ROLE` + `$A_SOCIETY_RECORDS`: function-based (not number-based) backward-pass artifact references when post-implementation submissions are possible | Curator proposes; Owner reviews |

Item A is the highest priority — it addresses a pre-registration gap that could ship broken variable references. Items B and C are secondary.

---

## Generalizable Findings

**Brief format for large bundles:** The current brief template assumes single-item or small-set changes. Large bundles require two additions to be safe: a per-file summary table (derived from the per-item artifact fields) and an explicit edit-mode field per change item. Applicable to any project where briefs may bundle multiple changes across multiple files. *Candidate for `$INSTRUCTION_ROLES` or `$GENERAL_OWNER_ROLE` Brief-Writing Quality section if the pattern recurs in other projects.*

**Owner variable-registration check before brief:** In any project where briefs propose content that references indexed variables, the Owner's brief-writing steps should include a pre-send verification that all referenced variables are registered. Applicable to any project using an index convention. *Candidate for `$GENERAL_OWNER_ROLE` Brief-Writing Quality section.*
