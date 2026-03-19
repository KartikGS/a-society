---
type: owner-workflow-plan
date: "2026-03-19"
complexity:
  domain_spread: low
  shared_artifact_impact: elevated
  step_dependency: high
  reversibility: moderate
  scope_size: moderate
tier: 3
path: 
  - Technical Architect
  - Tooling Developer
  - Owner
  - Curator
known_unknowns: 
  - "How backward-pass ordering is derived without first_occurrence_position (edge traversal vs node-list position vs new field)"
  - "The revised Component 4 interface"
  - "Whether generateTriggerPrompts contract needs restatement given is_synthesis removal"
---

**Subject:** Components 3 and 4 tooling realignment
**Type:** Owner Workflow Plan
**Date:** 2026-03-19

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Limited to tooling execution logic | low |
| **2. Shared artifact impact** | Modifies two core tooling components and tests | elevated |
| **3. Step dependency** | Implementation strictly depends on TA advisory resolution | high |
| **4. Reversibility** | Tooling code can be reverted, but break affects framework adopting projects | moderate |
| **5. Scope size** | Two TS files, tests, and TA advisory | moderate |

**Verdict:** Tier 3 — The high step dependency and urgent need to resolve a functional break in framework tooling require structured TA advisory before Developer implementation.

---

## Routing Decision

Tier 3. The removal of `first_occurrence_position` and `is_synthesis_role` from the workflow graph schema broke Components 3 and 4. Fixing this requires the Technical Architect to first redefine the algorithmic approach for backward pass ordering, followed by the Tooling Developer implementing the fix. The multi-role sequential handoffs and architectural decision requirement place this in Tier 3.

---

## Path Definition

1. Technical Architect — resolve algorithmic and interface questions, provide advisory
2. Tooling Developer — implement the fix based on the TA advisory
3. Owner — review implementation and TA advisory
4. Curator — perform integration documentation updates and register changes

---

## Known Unknowns

- How backward-pass ordering is derived without `first_occurrence_position` (edge traversal, node-list position, or a new lightweight field)
- The exact revised Component 4 interface
- Whether `generateTriggerPrompts` contract needs restatement given that `is_synthesis` is no longer a graph-schema concept
