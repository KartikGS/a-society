---
type: owner-workflow-plan
date: "2026-03-19"
complexity:
  domain_spread: elevated
  shared_artifact_impact: high
  step_dependency: moderate
  reversibility: moderate
  scope_size: elevated
tier: 3
path: [Owner, Curator, Owner, Curator]
known_unknowns:
  - How Component 4 (Backward Pass Orderer) derives role order once first_occurrence_position and is_synthesis_role are removed — design question for TA advisory (out of scope for this Curator flow)
  - Whether Component 3 (Workflow Graph Schema Validator) requires a schema definition file update or only code changes — TA scoping needed
  - Whether $A_SOCIETY_IMPROVEMENT prose references synthesis-as-graph-node in ways that require decoupling edits
---

**Subject:** Workflow graph schema simplification — collapse phases/nodes, remove backward pass from graph
**Type:** Owner Workflow Plan
**Date:** 2026-03-19

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches `general/` (instruction), `a-docs/` (workflow YAML + prose, coupling map), and `tooling/` (coupling impact for Components 3 and 4) | elevated |
| **2. Shared artifact impact** | `$INSTRUCTION_WORKFLOW_GRAPH` is foundational — it governs every project's graph representation; `$A_SOCIETY_WORKFLOW` is the live workflow definition | high |
| **3. Step dependency** | Schema must be defined before the A-Society workflow YAML can be updated; coupling map update follows both | moderate |
| **4. Reversibility** | Changes to instruction documents and workflow definitions are reversible but affect downstream adopters | moderate |
| **5. Scope size** | Multiple files across three layers; Component 3 and 4 tooling updates are out of scope for this flow but are consequent work | elevated |

**Verdict:** Tier 3 — elevated domain spread, high shared artifact impact, foundational schema change.

---

## Routing Decision

Tier 3. The change touches a foundational schema document (`$INSTRUCTION_WORKFLOW_GRAPH`) in `general/`, the live A-Society workflow YAML and prose, and has downstream tooling consequences. Full pipeline: Owner brief → Curator proposal → Owner review → Curator implementation + registration → backward pass. Component 3 and 4 tooling updates are a separate TA → Developer track, not part of this flow.

---

## Path Definition

1. Owner — Phase 0 plan + brief (this document + `02-owner-to-curator-brief.md`)
2. Curator — proposal: draft schema changes, workflow YAML rewrite, workflow prose updates, coupling map entries
3. Owner — review against generalizability, placement, and quality tests
4. Curator — implementation, registration, backward pass findings

---

## Known Unknowns

- How Component 4 (Backward Pass Orderer) derives role order once `first_occurrence_position` and `is_synthesis_role` are removed — design question for TA advisory (out of scope for this Curator flow)
- Whether Component 3 (Workflow Graph Schema Validator) requires a schema definition file update or only code changes — TA scoping needed
- Whether `$A_SOCIETY_IMPROVEMENT` prose references synthesis-as-graph-node in ways that require decoupling edits
