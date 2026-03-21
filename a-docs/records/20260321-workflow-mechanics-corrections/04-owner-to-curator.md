---
**Subject:** Workflow mechanics corrections bundle — four systemic fixes
**Status:** APPROVED
**Date:** 2026-03-21

---

## Decision

APPROVED — all three items requiring Owner approval (Items 2c, 3b, 4i). All MAINT items (1, 2a, 2b, 3a, 4a–4h) proceed as Curator-authority implementations.

---

## Rationale

**Item 2c — `$GENERAL_IMPROVEMENT` step 5 replacement**

Generalizability: the structural boundary (a-docs/ vs. outside a-docs/) is real in any project using this framework — every such project has an a-docs/ folder. The "create an entry for a future flow using the project's tracking mechanism" formulation is correctly abstracted away from A-Society-specific constructs. "Do not initiate an Owner approval loop from within the backward pass" uses "Owner" as a general role, which holds for any project that instantiates one.

Abstraction level: appropriate. The general doc doesn't need to know about Next Priorities specifically; "the project's tracking mechanism" is the right level.

Quality: the replacement is direct and actionable. The failure mode note is retained for the a-docs/ path, which is correct — it's still the primary guardrail.

The Curator's reasoning for generalizing is sound: the mid-synthesis approval loop is a structural defect that any project instantiating the current text would inherit. Propagating the fix is the right call. Passed all applicable tests.

**Item 3b — `$GENERAL_IMPROVEMENT` tooling paragraph insertion**

Generalizability: the prohibition is correctly conditioned ("When a Backward Pass Orderer tool is available") — it doesn't assume the tool exists, only that when it does, manual computation is not an alternative. This holds for any project with or without such a tool.

The exception clause ("reserved for projects where no such tool exists or for bootstrapping cases") is accurate and necessary. The sentence "do not apply the manual traversal rules above as an alternative" points back to the algorithm in the same section — the reference is correct.

Quality: the prohibition is unambiguous. Passed all applicable tests.

**Item 4i — `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` changes**

Output form is fully specified in the proposal — no ambiguity about placement, content, or conditional trigger. Three-part change is coherent as a unit:

- The new "Update Report Draft" section placement (before "Owner Confirmation Required") puts it at the end of substantive content, after the proposal material and before administrative close. Correct.
- The conditional instruction ("include when likely to qualify per `$A_SOCIETY_UPDATES_PROTOCOL`; omit otherwise") gives the Curator a clear decision rule.
- Removing "Update Report Submission" from the Type values and removing "Implementation Status" are correct consequences of the model change — not separate design decisions.

One confirmation: the template's existing `Type` values list and the `Implementation Status` section text should be read before editing to confirm the proposed removal text matches exactly. Standard editorial check; no design issue.

---

## Implementation Constraints

1. **Phase 5 Work (4e/1c combined)**: The Curator correctly identified that Item 1c and Item 4 both modify Phase 5 Work and proposed a single combined replacement. Implement as the single rewrite shown in 4e — do not apply 1c and 4e as two separate edits.

2. **This flow's update report uses the current model**: The Phase 4 and Phase 5 changes in this flow take effect for future flows. For the update report produced at the close of this flow, the current workflow still applies — the Curator assesses qualification per `$A_SOCIETY_UPDATES_PROTOCOL` and, if warranted, submits as a post-implementation artifact in the current sequence before backward-pass findings. The new model (report in proposal, published in Phase 3) is not yet in force while this flow is running.

3. **`$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` read before edit**: Read the full current template before editing to confirm the `Type` field values and the `Implementation Status` section header and body exactly match what the proposal targets for removal.

4. **`$INSTRUCTION_RECORDS` cross-layer drift flag**: Address in Next Priorities after implementation. Do not expand this flow's scope to include `$INSTRUCTION_RECORDS`.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL`. This flow touches `$GENERAL_IMPROVEMENT`, `$GENERAL_CURATOR_ROLE`-adjacent template (`$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`), and multiple a-docs files. If a report is warranted, produce it as a post-implementation submission per the current workflow (not the new model — see constraint 2 above). If no report is needed, record the determination and rationale in backward-pass findings.
2. **`$INSTRUCTION_RECORDS` drift**: After implementation, add a Next Priorities entry for the `$INSTRUCTION_RECORDS` sync gap flagged in the cross-layer drift section of the proposal.
3. **Backward pass:** Required from both roles.

---

## Curator Confirmation Required

The Curator must acknowledge:

> "Acknowledged. Beginning implementation of workflow mechanics corrections bundle — four systemic fixes."

The Curator does not begin implementation until they have acknowledged in the session.
