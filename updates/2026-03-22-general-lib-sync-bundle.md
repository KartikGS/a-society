# A-Society Framework Update — 2026-03-22

**Framework Version:** v17.4
**Previous Version:** v17.3

## Summary

Four additive improvements to the general library: the workflow graph schema now documents the optional `human-collaborative` node field; the improvement protocol Guardrails clarifies that approval is not completion; the Owner role template Brief-Writing Quality section adds an obsoletes check requirement for output-format changes; and the improvement protocol How It Works section explicitly closes the backward pass when synthesis is complete. All changes are Recommended.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 4 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Workflow graph schema: `human-collaborative` node field documented

**Impact:** Recommended
**Affected artifacts:** `general/instructions/workflow/graph.md`
**What changed:** The optional `human-collaborative` field has been added to the node schema documentation in the workflow graph instruction. The field accepts a non-empty string when present; null or absent is valid. It appears after the required `role` field in both the schema block and the Field Definitions section.
**Why:** The field was accepted by the workflow graph validator but not documented in the instruction, creating an instruction/tool parity gap. Agents constructing workflow graphs had no guidance for when or how to include it.
**Migration guidance:** If your project has a workflow graph instruction (`$[PROJECT]_INSTRUCTION_WORKFLOW_GRAPH` or equivalent), review it and add the `human-collaborative` optional field to the node schema documentation, positioned after the `role` field. If your project's workflow graphs already use this field, no change to existing graphs is required — the field remains optional. If your project does not use `human-collaborative` in any workflow graphs, no action is needed beyond the instruction update.

---

### Improvement protocol Guardrails: approval is not completion

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** The Forward pass closure boundary guardrail now explicitly states that approval is not completion. The intake role confirming forward pass closure while downstream tasks remain pending is a forward pass closure boundary violation. "Complete" means executed; the intake role must verify execution, not merely that approval was issued.
**Why:** A prior flow's intake role declared the forward pass closed after approving a step that had not yet been executed. The step was pending when closure was declared, which would have allowed backward pass findings to be produced against incomplete work. The clarification prevents this class of violation.
**Migration guidance:** Review your project's improvement protocol (`$[PROJECT]_IMPROVEMENT` or equivalent). If it contains a Forward pass closure boundary guardrail, append the "Approval is not completion" clarification after the existing guardrail text. Adapt role names to match your project's structure (substitute your project's intake role where "intake role" appears).

---

### Owner role template Brief-Writing Quality: obsoletes check for output-format changes

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** The Brief-Writing Quality section now includes a paragraph requiring the Owner to assess what an output-format change makes obsolete and scope any removals explicitly in the brief. A brief that adds a new section without checking for vestigial content transfers that obsolescence assessment to the downstream role unnecessarily.
**Why:** Without this guidance, an Owner proposing an output-format change may add a new section without scoping what the addition makes stale, leaving the downstream role to discover and remediate the obsolescence during implementation — adding an unplanned correction round.
**Migration guidance:** Review your project's Owner role document (`$[PROJECT]_OWNER_ROLE` or equivalent). In the Brief-Writing Quality section, after the paragraph that introduces output-format change requirements, add the obsoletes check guidance. Adopt the language as-is or adapt to match your project's role names (substitute your downstream implementation role where "downstream role" appears).

---

### Improvement protocol How It Works: synthesis closes the backward pass

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** The How It Works section now explicitly states that the synthesis role completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.
**Why:** The omission caused a routing error in a prior flow: the synthesis role handed back to the intake role after synthesis, treating the backward pass as still open. The addition makes the closure rule explicit and prevents the same misrouting in any project using the synthesis model.
**Migration guidance:** Review your project's improvement protocol (`$[PROJECT]_IMPROVEMENT` or equivalent). In the How It Works section, at the end of the synthesis description (after the routing guidance for actionable items), add the statement that synthesis closes the backward pass and no further handoff is required. Adapt role names to match your project's structure.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
