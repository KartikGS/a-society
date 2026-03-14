**Subject:** Convention and precision fixes — 2 changes
**Status:** BRIEFED
**Date:** 2026-03-13

> **Count verify:** 2 changes in Subject line. 2 numbered items in Agreed Change. ✓

---

## Agreed Change

### Change 1 — No-update-report convention (Priority 1)

**Problem:** The decision template's (`$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) Follow-Up Actions item 1 prompts the Curator to assess whether a framework update report is required. It gives no instruction for what to do when the answer is "no." Curators currently handle this inconsistently — some create a determination artifact, some note it inline, some say nothing.

**Convention established:** When the update report assessment concludes no report is needed, the Curator records the determination and its rationale in the Curator's backward-pass findings. No separate submission artifact is required for a negative determination.

The pattern has been confirmed across multiple flows: `20260313-maint-bundle`, `20260312-initializer-output-hardening`, `20260311-curator-maint-template-and-crosslayer`, and others. All handled negative determinations inline in findings with no separate artifact. This is the convention.

**Fix:** Add one sentence to Follow-Up Actions item 1 in `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`:

> "If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings. No separate submission artifact is required."

This change is `[MAINT]` — a-docs only, Curator authority. The Curator may implement this component without a Phase 2 decision artifact.

---

### Change 2 — Brief-writing quality — output-format changes (Priority 2)

**Problem:** The Brief-Writing Quality section in `$A_SOCIETY_OWNER_ROLE` does not flag output-format changes as a category requiring explicit specification of the expected output form. A brief may call a change "mechanical" and declare "Open Questions: None" when the change actually introduces a new output format — leaving the Curator to make design decisions the brief never asked about. This was the root cause of multiple revision cycles in the `20260312-handoff-copyable-prompt` flow.

Additionally, `$GENERAL_OWNER_ROLE` has no Brief-Writing Quality section at all.

**Fix — two-part:**

**Part A (`$A_SOCIETY_OWNER_ROLE`, MAINT):** Add a named category to the existing Brief-Writing Quality section that flags output-format changes. The addition must convey:

- Output-format changes (new required fields, new template sections, new required structural elements in the output) are not mechanical — design decisions about what the output should look like are involved.
- A brief that introduces an output-format change must explicitly specify the expected output form, not leave it to the Curator.
- "Open Questions: None" is only correct when the output form is also fully derivable from the brief.

Place this as a discrete paragraph or bullet following the existing guidance in the section.

**Part B (`$GENERAL_OWNER_ROLE`, LIB):** Add a Brief-Writing Quality section. This section is project-agnostic — do not include A-Society-specific references (no mention of `general/`, update report classification, or framework concepts). The section must contain:

1. The core principle: when a change is fully derivable — no ambiguity about scope, target, implementation approach, and no unresolved output format — write a fully-specified brief covering all three dimensions explicitly. State "Open Questions: None" explicitly when there are none; this signals to the downstream role that no judgment calls are required.
2. The output-format exception: output-format changes require explicit specification of the expected output form. A change that introduces a new output structure is not mechanical — design decisions are involved. Do not call such a change "mechanical" or declare "Open Questions: None" unless the output form is fully specified in the brief.

The section should be concise — two paragraphs or equivalent. Do not port A-Society-specific guidance (classification prohibition, `general/` scope considerations) into the general template.

---

## Scope

**In scope:** The three targeted edits described above — one sentence addition to `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`, one paragraph addition to `$A_SOCIETY_OWNER_ROLE`, one new section in `$GENERAL_OWNER_ROLE`.

**Out of scope:** Refactoring surrounding sections; adding the output-format flag to briefing templates; extending the convention to cover edge cases not described above.

---

## Likely Targets

- Change 1: `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` (Follow-Up Actions item 1)
- Change 2 Part A: `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality section)
- Change 2 Part B: `$GENERAL_OWNER_ROLE` (new Brief-Writing Quality section)

---

## Open Questions for the Curator

None. All three edits are fully specified. The proposal round covers Change 2's LIB component only — the Curator should submit a proposal demonstrating that the new `$GENERAL_OWNER_ROLE` section passes the five review tests. Change 1 is MAINT and may be implemented alongside Change 2 after Owner approval of the LIB component.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Convention and precision fixes — 2 changes."
