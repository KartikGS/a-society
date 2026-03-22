# Backward Pass Synthesis: Curator — 20260322-log-restructure

**Date:** 2026-03-22
**Task Reference:** 20260322-log-restructure
**Role:** Curator (Synthesis)

---

## Findings Reviewed

| # | Source | Finding | Owner Verdict |
|---|---|---|---|
| 1 | Curator (05) | Inconsistent terminology in proposal ("append-only" vs. "most recent at top") — root cause extended by Owner to include brief-drafting stage | Endorsed with root-cause correction — LIB+MAINT; Owner-side fix bundled with Finding 2 |
| 2 | Curator (05) | Brief paraphrase diverged from source text, causing Edit match failure at D1 | Endorsed — Curator-authority discipline note |
| 3 | Curator (05) | Cross-layer consistency check caught stale "## Archive" reference — positive confirmation | No action |
| 4 | Curator (05) | Write vs. Edit judgment call for large section removal — no documented rule | Endorsed — Curator-authority note |
| 5 | Owner (06) | Merge assessment rule confirmed effective on first application | No action |
| 6 | Owner (06) | Brief-Writing Quality gap: behavioral property consistency check missing from Owner brief-drafting | New finding — LIB+MAINT; bundleable with Finding 1 |
| 7 | Owner (06) | Forward pass closure scope violation — externally caught; no rule scoping backward pass initiation to current flow | New finding — LIB+MAINT; bundleable with "workflow obligation consolidation" Next Priority |

---

## Routing

Routing rule: items within `a-docs/` only (MAINT, no LIB component) → implement directly. Items with any LIB component → Next Priorities (require Owner approval).

Findings 2 and 4 are MAINT-only (notes to `$A_SOCIETY_CURATOR_ROLE`). Finding 1 Curator-side (proposal quality check) is also MAINT-only for the A-Society instantiation — the LIB component (`$GENERAL_CURATOR_ROLE`) goes to Next Priorities bundled with Finding 6.

Finding 7 merges into the existing "workflow obligation consolidation" Next Priority per Owner routing.

---

### Direct Implementation

**Finding 2 + Finding 4 + Finding 1 (Curator-side) — Implementation Practices section added to `$A_SOCIETY_CURATOR_ROLE`**

New section added after Standing Checks with three items:
1. *Proposal stage — behavioral property consistency* (Finding 1 Curator-side): verify proposed output language does not contain contradictory behavioral properties before submitting.
2. *Implementation stage — re-read before editing* (Finding 2): re-read target section before constructing `old_string` for any Edit call.
3. *Implementation stage — Write vs. Edit for large removals* (Finding 4): for removals of roughly more than ten lines of formatted content, Write is more reliable than Edit.

---

### Next Priorities — Routed to `$A_SOCIETY_LOG`

**Priority A — Brief-writing and proposal quality: behavioral property consistency and write authority label**

`[S][LIB][MAINT]` — *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality (LIB): *(a)* add note that `[Curator authority — implement directly]` can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief; the brief is the correct home for explicit designation; *(b)* add behavioral property consistency check — when specifying behavioral properties (ordering, mutability, timing), verify they are internally consistent before sending; a brief that seeds contradictory properties will have those contradictions reproduced downstream. Echo both to `$A_SOCIETY_OWNER_ROLE` (MAINT). *(2)* `$GENERAL_CURATOR_ROLE` (LIB): add proposal quality check — before submitting a proposal, verify that proposed output language does not contain contradictory behavioral properties. Sources: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/07-curator-synthesis.md` (item 1a); `$A_SOCIETY_RECORDS/20260322-log-restructure/06-owner-findings.md` (items 1b, 2).

Merge rationale: existing Item 1 (write authority gap → `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`) and new behavioral property check share the same target files and compatible authority level. Merged into single item retaining all source citations.

**Priority B — Workflow obligation consolidation: forward pass closure, synthesis closure rule, and current-flow scoping**

Merge rationale: Owner Finding 7 targets `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` and `$INSTRUCTION_WORKFLOW` — same files as existing Item 2. Same authority level. Merged by appending item (3) to existing item.

---

## Backward Pass Status

Closed. All seven findings reviewed and routed. No open items remain for this flow. Direct implementations applied to `$A_SOCIETY_CURATOR_ROLE`. Next Priorities updated in `$A_SOCIETY_LOG`.
