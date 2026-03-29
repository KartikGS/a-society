# Owner → Curator: Briefing

**Subject:** Owner protocol and role guidance bundle — 11 items (Groups A, B, C)
**Status:** BRIEFED
**Date:** 2026-03-29

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$GENERAL_OWNER_ROLE` | additive (new sections + insertions) |
| `$GENERAL_CURATOR_ROLE` | additive (insertions) |
| `$INSTRUCTION_LOG` | additive (new protocol sections) |
| `$A_SOCIETY_OWNER_ROLE` | additive (new sections + insertions + parity verification) |
| `$A_SOCIETY_CURATOR_ROLE` | additive (parity verification) |

No proposal artifact is required before implementation begins for Curator-authority items. All items in this brief require Owner approval before implementation — see authority markings below.

---

### Group A — Log Validity Sweep Protocol [Requires Owner approval]

**Problem:** The current log protocol has no mechanism for catching Next Priorities entries that have been made invalid by prior or current work. Entries can accumulate that are addressed, contradicted, restructured, or partially addressed — and nothing in the protocol surfaces this to the human or requires resolution.

**Changes:**

**A1. Intake validity sweep** — `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` [additive — new section]

After the human states a need and the Owner forms their own scope assessment (files, design areas, concepts the work will likely touch), the Owner sweeps Next Priorities entries against that assessment before proceeding to the workflow plan. The scope is the Owner's assessment, not the human's stated intent — the Owner may recognize that the actual scope is broader than the description.

For each entry whose target files or design areas overlap with the Owner's scope assessment, the Owner evaluates whether the entry has been invalidated under one of four cases:

1. **Addressed** — a prior flow already implemented what the entry describes
2. **Contradicted** — a prior flow changed the design in a direction that makes the entry incorrect
3. **Restructured** — a prior flow renamed, moved, or removed the file or concept the entry references
4. **Partially addressed** — a prior flow addressed part of the entry; the remainder is still valid but the entry overclaims

Flagged entries are surfaced to the human with: what the entry says, why the Owner's scope assessment implicates it, and which invalidation case applies. The human confirms or overrides. The Owner updates the log accordingly before proceeding to the workflow plan.

**A2. Closure validity sweep** — `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` [additive — insert into Forward Pass Closure section]

At forward pass closure, after the flow's changes are confirmed, the Owner sweeps Next Priorities entries whose target files or design areas overlap with what the flow actually modified. The same four-case taxonomy applies (addressed, contradicted, restructured, partially addressed). Entries are updated, narrowed, or removed as warranted before the closure artifact is filed.

The closure sweep is targeted to the completed flow's scope — not a full review of all Next Priorities entries.

**A3. Entry lifecycle documentation** — `$INSTRUCTION_LOG` [additive — new section or insertion into entry lifecycle]

Document both sweep points as Owner obligations in the entry lifecycle section: the intake sweep (triggered by Owner scope assessment at session start) and the closure sweep (triggered by completed flow scope at forward pass closure). Include the four invalidation cases. Placement within the file is at Curator discretion — see Open Questions.

---

### Group B — Merge Criteria Update [Requires Owner approval]

**Problem:** Merge criterion 3 ("same workflow type and role path") was designed before the multi-domain pattern existed. With a single flow now able to route Framework Dev, Tooling Dev, and Runtime Dev work as parallel tracks, criterion 3 as written incorrectly separates items that could and should run together.

**Changes:**

**B1. Criterion 3 revision** — `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`, and `$INSTRUCTION_LOG` [replace criterion 3 in the merge assessment]

Replace the current criterion 3 ("same workflow type and role path") with language that accounts for the multi-domain pattern. The revised criterion should read approximately:

> **Same workflow type and role path, or routable as parallel tracks in a single multi-domain flow.** Items that would route through different workflow types (e.g., one Framework Dev, one Tooling Dev) may still merge if they share a design area and are cohesive enough to run as independent parallel tracks in a single flow without sequencing conflict.

The intent is to preserve the guard against bundling unrelated work (criterion 1, same design area, still applies) while recognizing that different workflow types no longer imply separate flows.

---

### Group C — Role Guidance Precision (8 items) [Requires Owner approval]

These items add to `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` the same guidance that was previously implemented directly in `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE`. Before proposing, the Curator must read the current state of `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` for each item and verify that the general counterpart does not already contain equivalent language. Propose only what is genuinely absent.

**C1.** `$GENERAL_CURATOR_ROLE` — require proposal-stage rendered-content matching against adjacent target-file exemplars when proposing formatted blocks (tables, lists, structured sections). When the proposed content will be inserted adjacent to existing formatted content, the Curator should render the proposed block and verify it matches the surrounding formatting style before submitting the proposal. [additive]

**C2.** `$GENERAL_OWNER_ROLE` — prose-insertion boundary anchors must be immediately adjacent. When a brief directs insertion into existing prose, the anchor must name the immediately adjacent clause or phrase at the insertion boundary — not a landmark elsewhere in the section. If the insertion is bounded from both sides, name the immediately adjacent clause on each side. [additive — insert into Brief-Writing Quality section, after the existing prose-insertion guidance, specifically after the clause ending "...which creates ambiguity and can require a correction round."]

**C3.** `$GENERAL_OWNER_ROLE` — registration/index constraints must be scoped by file, not directory. When directing index registration or verification, scope the instruction by the newly created or modified files, not by their parent directory, unless the directory boundary is itself the point of the constraint. [additive — insert into Constraint-Writing Quality section]

**C4.** `$GENERAL_OWNER_ROLE` — instruction-text variable references must use real registered `$VAR` names. When a brief proposes text that itself contains `$VAR` references, use only variable names that actually exist in the relevant index. If no project-agnostic variable name exists for the concept, use a functional description instead of inventing a fictional placeholder. [additive — insert into Brief-Writing Quality section, after the existing variable-reference guidance]

**C5.** `$GENERAL_OWNER_ROLE` — Next Priorities items surfaced by the closing flow must be written to the log before the closure artifact is filed. The closure artifact should reflect the already-updated project state; filing the closure artifact is not the step that leaves log maintenance for later. [additive — insert into Forward Pass Closure guidance]

**C6.** `$GENERAL_OWNER_ROLE` — explicit mirror assessment required when a brief modifies a project-specific convention that instantiates a reusable general instruction. The brief must explicitly assess the general counterpart — either scope it as a co-change or declare it out of scope with rationale. Do not leave the mirror decision implicit. [additive — insert into Brief-Writing Quality section]

**C7.** `$GENERAL_OWNER_ROLE` — schema-migration briefs must scope a vocabulary sweep. When a brief changes a schema, field name, or structural vocabulary, explicitly scope a surrounding prose sweep for deprecated terms as part of the same work. Updating the schema block alone is incomplete if adjacent explanations still use old terminology. [additive — insert into Brief-Writing Quality section]

**C8.** `$GENERAL_CURATOR_ROLE` — implementation-stage terminology sweep required for schema changes. When implementing a change that renames structural terms, the Curator must sweep surrounding prose for deprecated terminology as part of the same implementation pass, not deferred to a follow-up. [additive]

---

## Scope

**In scope:**
- All 11 items above across the five listed files
- Framework update report draft (with TBD classification fields) included in the proposal submission — this is a `[LIB]` flow modifying `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`; the Curator should include the draft in the proposal and resolve classification by consulting `$A_SOCIETY_UPDATES_PROTOCOL` at implementation time

**Out of scope:**
- Any changes to tooling, runtime, or non-Owner/Curator role files
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` or `$GENERAL_TA_ROLE` — those are tracked in a separate Next Priorities item

---

## Likely Target

- `$GENERAL_OWNER_ROLE` — `a-society/general/roles/owner.md`
- `$GENERAL_CURATOR_ROLE` — `a-society/general/roles/curator.md`
- `$INSTRUCTION_LOG` — `a-society/general/instructions/project-information/log.md`
- `$A_SOCIETY_OWNER_ROLE` — `a-society/a-docs/roles/owner.md`
- `$A_SOCIETY_CURATOR_ROLE` — `a-society/a-docs/roles/curator.md`

---

## Open Questions for the Curator

1. **Placement of validity sweep in `$INSTRUCTION_LOG`:** The intake and closure sweep obligations are Owner behaviors. The Owner role files are the primary home. Assess whether `$INSTRUCTION_LOG`'s entry lifecycle section is also an appropriate location for these obligations (as cross-referenced guidance), or whether the Owner role files alone are sufficient and `$INSTRUCTION_LOG` should not be changed. Either outcome is acceptable — state the rationale in the proposal.

2. **Group C parity check:** Before drafting Group C items, read the current state of `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` against each of the 8 items. Some may already be present from prior synthesis work. Propose only what is genuinely absent from the general counterpart. Note any items already present and confirmed as out of scope.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Owner protocol and role guidance bundle — 11 items (Groups A, B, C)."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
