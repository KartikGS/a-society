**Subject:** Compulsory complexity gate — Curator backward-pass findings
**Flow:** 20260317-compulsory-complexity-gate
**Date:** 2026-03-17

---

## Update Report Determination

No framework update report is triggered. All changes in this flow are confined to `a-society/a-docs/` — the workflow graph, Owner role doc, index, a-docs-guide, and the new template. The protocol excludes "A-Society-internal changes (`a-docs/` only) that do not affect what adopting projects were given." No `general/` or `agents/` file was modified.

---

## Findings

### 1. The general Owner role template is now out of sync with A-Society's Owner role

`$GENERAL_OWNER_ROLE` (`/a-society/general/roles/owner.md`) is the distributable Owner role template that adopting projects instantiate. It has a "Workflow routing" responsibility and a post-confirmation protocol — neither of which references a Phase 0 plan artifact, because those concepts did not exist when the template was last updated.

A-Society's own `$A_SOCIETY_OWNER_ROLE` now references `$A_SOCIETY_COMM_TEMPLATE_PLAN` and requires the plan before any brief. If the general template is adopted by a project that also uses `$INSTRUCTION_WORKFLOW_COMPLEXITY`, their Owner role will reference complexity analysis in prose but will have no artifact requirement and no gate. The gap is the same one this flow was designed to close.

**Proposed next action:** Owner to assess whether the general Owner role template should be updated to include a Phase 0 gate (using a `$[PROJECT]_COMM_TEMPLATE_PLAN` reference or equivalent). This is an update to `general/` and requires the standard proposal → review path. Out of scope for this flow.

### 2. `$INSTRUCTION_WORKFLOW_COMPLEXITY` does not mention the plan template

The complexity instruction describes the workflow plan artifact and its required content. It does not reference `$A_SOCIETY_COMM_TEMPLATE_PLAN` (or any equivalent general template variable). Now that a template exists, the instruction should direct readers to it — "produce `01-owner-workflow-plan.md` using [template]" rather than deriving the artifact format from the prose description alone.

This is a `general/` file. Updating it requires the proposal → review path.

**Proposed next action:** Curator proposes an update to `$INSTRUCTION_WORKFLOW_COMPLEXITY` to reference the plan template. Straightforward; low-complexity; no open questions.

### 3. The plan artifact template's YAML block precedes the template header blockquote

In `$A_SOCIETY_COMM_TEMPLATE_PLAN`, the YAML frontmatter (`---`) appears before the blockquote template header. This is correct for YAML parsing (frontmatter must be at the document's top), but it creates a visual asymmetry with the other conversation templates where the header appears first. An agent reading the template file encounters the YAML before the usage instructions.

This is cosmetically imperfect but functionally correct — the blockquote cannot precede the YAML without breaking frontmatter parsing. No change recommended; noting it so the Owner is aware when reviewing the template visually.

### 4. The Handoffs table now has nine rows

With the addition of the "Trigger → Phase 0" and "Phase 0 → Phase 1" rows (replacing the single "Trigger → Phase 1" row), the Handoffs table has grown. This is correct and expected — no action required. Noting it for awareness; the table length is proportional to the workflow's actual complexity.

---

## Process Observations

The three open questions in the brief were well-scoped. OQ1 (schema) required the most judgment; the four-point scale was the right call and the field-comment approach to the reversibility direction issue is pragmatic. OQ2 and OQ3 resolved cleanly against existing documentation.

The implementation constraint from the Owner (adding `$A_SOCIETY_RECORDS` reference to Phase 0 prose) was a small but correct catch — the record folder creation was moving without its reference.

The a-docs-guide update (parenthetical expansion) was minimal but required; the conversation folder's "What it owns" line now accurately lists all four template types.
