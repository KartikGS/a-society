# A-Society Framework Update — 2026-03-17

**Framework Version:** v12.0
**Previous Version:** v11.1

## Summary

This update formalizes the Phase 0 gate in the general Owner role template and adds the workflow plan template to the general library. Projects initialized before this update have an Owner role that lacks the explicit plan-before-brief requirement, and a `communication/conversation/` folder that lacks the workflow plan template. Both gaps must be assessed.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvement worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Change 1 — Owner role template: Phase 0 gate added

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`]

**What changed:**
Two edits to the Owner role template:

1. The workflow routing bullet now names the workflow plan artifact explicitly as a required gate: "including producing a workflow plan artifact at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`)".

2. The Post-Confirmation Protocol "Once the user answers" block was replaced with a three-point Phase 0 gate model:
   - maps the need to the appropriate workflow
   - creates the record folder and produces `01-owner-workflow-plan.md` — this plan is the approval gate and must exist before any brief is written
   - Tier 2 and 3 flows: writes the brief as the next sequenced artifact
   - Tier 1 flows: implements directly and proceeds to backward pass

**Why:** The previous template named complexity analysis at intake but did not establish the plan artifact as a required gate or define the tier-based path split. Projects operating with the old template have an Owner that may skip the plan artifact before briefing downstream roles.

**Migration guidance:** Check your project's `$[PROJECT]_OWNER_ROLE`. If the Post-Confirmation Protocol's "Once the user answers" block still uses the two-bullet model (Maps the need to a workflow / Routes the user to the next session), update it to the three-point Phase 0 gate model above. Also update the Workflow routing bullet if it still says "complexity analysis at intake" without naming the plan artifact as a gate.

---

### Change 2 — New workflow plan template added to general library

**Impact:** Breaking
**Affected artifacts:** [`general/communication/conversation/TEMPLATE-owner-workflow-plan.md`], [`general/manifest.yaml`]

**What changed:** A new `TEMPLATE-owner-workflow-plan.md` has been added to `general/communication/conversation/` and registered as `required: true` in the manifest. The template provides YAML frontmatter (five complexity axis fields, tier, path, known unknowns) and prose sections (Complexity Assessment table, Routing Decision, Path Definition, Known Unknowns) for the Owner to fill in at intake.

**Why:** The Phase 0 gate requires an `01-owner-workflow-plan.md` artifact, but no general template existed for producing it. Projects had no canonical starting point for this artifact's structure.

**Migration guidance:** Add `TEMPLATE-owner-workflow-plan.md` to your project's `a-docs/communication/conversation/` folder, copying from `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE`. Register the variable in your project's index. If your project's `communication/conversation/main.md` lists the available templates, add an entry for this one.

---

### Change 3 — Complexity instruction: template pointer added

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/workflow/complexity.md`]

**What changed:** In the "Producing a Workflow Plan" section, the opening sentence was updated to include a pointer to `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` as the base document.

**Why:** The instruction described the plan artifact's required content but gave no reference to the template. Agents reading the instruction had no discovery path to the template.

**Migration guidance:** No structural gap is created by the absence of this change. If your project's complexity instruction is an instantiated copy (not directly the general instruction), consider adding: "Use `$[PROJECT]_OWNER_WORKFLOW_PLAN_TEMPLATE` as the base; place the instantiated plan in the record folder as `01-owner-workflow-plan.md`." — replacing the existing opening sentence of the "Producing a Workflow Plan" section.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
