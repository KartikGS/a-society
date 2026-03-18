**Subject:** utils.ts + Component 4 trigger prompt extension — Curator doc updates
**To:** Curator
**Status:** APPROVED — proceed to implementation
**Date:** 2026-03-18

---

## Context

Implementation is complete and TA-verified (no deviations). The following documentation changes are required to register the change correctly. All items that require Owner approval are already approved — authorisations are noted per item.

---

## Agreed Change

**Item 1 — INVOCATION.md: Component 4 new functions** `[Curator authority — implement directly]`

Update the Component 3 + 4 section of `$A_SOCIETY_TOOLING_INVOCATION` to document the two new exports: `generateTriggerPrompts` and `orderWithPromptsFromFile`. Also document the two new interfaces: `TriggerPromptOptions` and `BackwardPassTriggerEntry`.

The new entries should follow the existing Component 3+4 section style. Include:
- Interface definitions for `TriggerPromptOptions` and `BackwardPassTriggerEntry`
- Function signatures and call examples for `generateTriggerPrompts` and `orderWithPromptsFromFile`
- A note that `generateTriggerPrompts` is pure (no file I/O) and what the optional context fields (`recordFolderPath`, `flowName`) do when provided vs. omitted

Source of truth for all interface details and function signatures: `03-ta-advisory.md` Sections 3b–3c, with the two Owner corrections from `04-owner-to-developer.md` applied (article: "the [role]" not "a [role]"; path: no leading slash). Do not derive interface or signature details from the source code — the approved spec in 03 + 04 is canonical for documentation purposes.

This is a Type C coupling map change (existing component interface extended).

**Item 2 — Architecture component table: Component 4 description update** `[Curator authority — implement directly]`

Owner-approved in `04-owner-to-developer.md`. In `$A_SOCIETY_ARCHITECTURE`, update the Component 4 row description:

- **Current:** "Computes correct backward pass traversal order from a workflow graph"
- **Revised:** "Computes correct backward pass traversal order from a workflow graph and generates per-role session trigger prompts"

No other rows in the component table require changes. utils.ts is an internal module and does not appear in the component table.

**Item 3 — Coupling map: Type C update** `[Curator authority — implement directly]`

Update `$A_SOCIETY_TOOLING_COUPLING_MAP` per the Type C change taxonomy:
- Update the format dependency table: no new rows are required (trigger prompt generation uses the same workflow graph YAML schema already tracked for Component 4)
- Update the invocation status table: the existing Component 4 row remains valid; add a note or update the date to reflect the Type C change was processed as of this flow
- Document that the Type C change has been processed

Refer to `06-ta-review.md` Section "Coupling Map Note" for the TA's assessment.

**Item 4 — Watch item assessment: trigger prompt capability in `$GENERAL_IMPROVEMENT`** `[Requires Owner approval if a general/ change results]`

The TA watch item (advisory Section 6; confirmed in review Section "Coupling Map Note"): Component 4's invocation gap was closed in 2026-03-15 with `$GENERAL_IMPROVEMENT` directing agents to use Component 4. The trigger prompt capability (`generateTriggerPrompts`/`orderWithPromptsFromFile`) is now available and is the primary motivation for this flow. Assess whether `$GENERAL_IMPROVEMENT`'s reference to Component 4 should specifically name this capability so agents know to invoke it for trigger prompt generation — not just for traversal order computation.

If the Curator's assessment is that no change is needed: document the reasoning in the submission artifact and the Owner will confirm.
If the Curator's assessment is that a change is warranted: submit the proposed `$GENERAL_IMPROVEMENT` change for Owner review before implementing it. A general/ change requires Owner approval (standard Approval Invariant).

This item does not block items 1–3. Implement 1–3 first, then submit the watch item assessment.

---

## Scope

**In scope:** INVOCATION.md Component 4 section extension; architecture component table row update; coupling map Type C record; watch item assessment with Owner submission if a general/ change is proposed.

**Out of scope:**
- Any changes to `tooling/` — implementation is complete and TA-verified; do not touch it
- utils.ts documentation — it is an internal module with no public interface; it does not appear in INVOCATION.md or the component table
- The synthesis-absent edge case the TA observed (spec gap) — I will surface this in the Owner backward pass findings as a potential future improvement item; the Curator does not need to act on it in this flow

---

## Likely Targets

- `$A_SOCIETY_TOOLING_INVOCATION` — Component 3+4 section
- `$A_SOCIETY_ARCHITECTURE` — component table, Component 4 row
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — format dependency table and/or invocation status table
- `$GENERAL_IMPROVEMENT` — only if watch item assessment results in a proposed change requiring Owner approval

---

## Variable Pre-registration Check

All target files are existing registered files. No new variables are being created in this flow. No pre-registration action required.

---

## Return to Owner

After items 1–3 are implemented and the watch item assessment is complete:
- Submit as the next sequenced artifact in this record folder (position 08)
- Include: confirmation of items 1–3 complete; watch item assessment and proposed change (if any) or documented reasoning (if no change)

Owner reviews the submission, issues a decision on the watch item (if applicable), and proceeds to backward pass.
