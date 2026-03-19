**Subject:** Post-Realignment Maintenance Bundle (Priorities 2–6)
**Status:** BRIEFED
**Date:** 2026-03-19

---

## Agreed Change

`[Bundle — Mixed Authority]`

We are bundling the five remaining `Next Priorities` from `$A_SOCIETY_LOG` into a single maintenance flow.

**Item 1: `$A_SOCIETY_UPDATES_TEMPLATE` annotations:**
*Authority: `[Curator authority — implement directly]`*
The template contains trailing annotations in the version fields that break the programatic parsing contract (e.g., `*(A-Society's version before this update)*`). Remove both annotations.

**Item 2: Variable pre-registration check in brief template:**
*Authority: `[Requires Owner approval]`*
Add a standing pre-send prompt to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` requiring the Owner to verify that every internal/framework variable referenced in the brief is explicitly registered in the relevant index.

**Item 3: Per-file summary + edit-mode fields in brief template:**
*Authority: `[Requires Owner approval]`*
Add a "Files Changed" per-file summary table to the brief template to prevent the Curator from transposing logic across multiple sections mentally. Additionally, add an explicit edit-mode field (`[additive] / [replace] / [insert before X]`) to change items to prevent interpolation errors. 

**Item 4: Function-based backward-pass artifact references:**
*Authority: `[Requires Owner approval]`*
Fixed sequence-number references to backward-pass artifacts in Owner handoffs (e.g., `06-owner-findings.md`) are fundamentally provisional due to variable submission sizes. Replace exact `NN-` sequence instructions in `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_RECORDS` with function-based descriptors like "backward-pass findings after all submissions resolved". Assess whether general instructions (`$INSTRUCTION_ROLES`/`$INSTRUCTION_RECORDS`) require the same update.

**Item 5: `$A_SOCIETY_IMPROVEMENT` Component 4 mandate extension:**
*Authority: `[Requires Owner approval]`*
Following the successful Component 3 & 4 tooling realignment (Priority 1), Component 4 is completely aligned. (a) Register `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` in the index and ensure it's referenced cleanly in `$A_SOCIETY_IMPROVEMENT`. (b) Instruct agents to use `orderWithPromptsFromFile` when trigger prompts are conditionally necessary, rather than just sequence derivation. 

---

## Scope

**In scope:**
- Directly executing Item 1 (`$A_SOCIETY_UPDATES_TEMPLATE`)
- Proposing structural modifications to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_RECORDS`, and `$A_SOCIETY_IMPROVEMENT` for Items 2-5.

**Out of scope:**
- Modifying Component 4 typescript execution logic (done).
- Executing Items 2-5 without an Owner decision artifact (`03-owner-decision.md`).

---

## Likely Target

- `general/improvement/reports/template-update.md` (Item 1)
- `general/communication/conversation/TEMPLATE-owner-to-curator-brief.md` (Items 2, 3)
- `a-docs/roles/owner.md` (Item 4)
- `a-docs/records/main.md` (Item 4)
- `a-docs/improvement/main.md` (Item 5)
- `a-docs/indexes/main.md` (Item 5)

---

## Open Questions for the Curator
- Will the edit mode flags in the Brief Template significantly bloat small briefs? Ensure the syntax adds rigor without imposing unacceptable word counts.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Implementing Item 1, and beginning proposal drafting for Items 2-5."
