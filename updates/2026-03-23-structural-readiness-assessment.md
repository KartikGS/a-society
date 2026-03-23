# A-Society Framework Update — 2026-03-23

**Framework Version:** v21.0
**Previous Version:** v20.0

## Summary

A Structural Readiness Assessment has been added as a mandatory gate before complexity analysis at intake. The Owner role template has been updated to require this assessment before producing the workflow plan. Projects that instantiated the Owner role template before this change have an Owner role document missing this obligation — their Owner agents will not run the readiness gate and may route structurally impossible or unroutable tasks into complexity analysis without detecting the gap.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Your Owner role document is missing a mandatory intake obligation — Curator must review and update |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### Structural Readiness Assessment added to Owner role template

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`] [`general/instructions/workflow/complexity.md`]

**What changed:** The Workflow Routing bullet in the general Owner role template now includes a structural readiness assessment obligation before complexity analysis. The complexity instruction has a new mandatory section — **Structural Readiness Assessment** — added before the Complexity Axes section, defining three sequential checks (Feasibility, Structural Routability, Frequency Assessment), a Handling by Outcome table, and a Structural Gap Protocol.

**Why:** Complexity analysis assumes the task is structurally handleable — it does not check whether the task is feasible, whether any defined role has authority for it, or whether any workflow can route it. Without an explicit readiness gate, Owners may route structurally impossible or unroutable tasks into complexity analysis and produce workflow plans for work that cannot be executed. The Structural Gap Protocol provides a consistent path when gaps are found: surface what is missing, get user permission, open a setup flow, and defer the original task with a dependency note.

**Migration guidance:** Inspect the Workflow Routing bullet in your project's Owner role document (typically `a-docs/roles/owner.md`, registered as `$[PROJECT]_OWNER_ROLE` in your index). If the bullet does not include a structural readiness assessment obligation before the workflow plan step, update it as follows.

Find the Workflow Routing bullet. It currently reads approximately:

> **Workflow routing** — routing work into the appropriate workflow by default, including producing a workflow plan artifact at intake before any brief is written…

Replace the opening clause so that the bullet reads:

> **Workflow routing** — routing work into the appropriate workflow by default. Before producing the workflow plan, conduct a structural readiness assessment per `$INSTRUCTION_WORKFLOW_COMPLEXITY`: verify the task is feasible, that a role with appropriate authority exists for it, and that a workflow can route it. If a structural gap is found, apply the Structural Gap Protocol before complexity analysis. This includes producing a workflow plan artifact at intake before any brief is written…

The remainder of the bullet (workflow plan artifact, template reference, handoff direction) is unchanged. Preserve any project-specific additions that follow.

Note: The full Structural Readiness Assessment — including the three checks, the Handling by Outcome table, and the Structural Gap Protocol — is defined in `$INSTRUCTION_WORKFLOW_COMPLEXITY` (the shared library document). No project-level copy of the assessment content is required; the role document reference to the instruction is sufficient.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
