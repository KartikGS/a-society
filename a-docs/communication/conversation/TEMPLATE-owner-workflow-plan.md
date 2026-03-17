---
type: owner-workflow-plan
date: "YYYY-MM-DD"
complexity:
  # Allowed values for each axis: low | moderate | elevated | high
  # Each value measures complexity signal: high = this axis is a strong complexity driver
  # For reversibility: high = poorly reversible (high concern); low = easily undone (low concern)
  domain_spread: null
  shared_artifact_impact: null
  step_dependency: null
  reversibility: null
  scope_size: null
tier: null        # Allowed: 1 | 2 | 3
path: []          # Ordered list of role names; must be non-empty
known_unknowns: [] # List of strings; empty list [] is valid if none
---

> **Template** — do not modify this file. When instantiating, omit this header block. Create from this template into the active record folder as `01-owner-workflow-plan.md`. All five `complexity` axis fields, `tier`, and `path` must be filled in — a plan with any `null` or missing required value is incomplete and does not satisfy the Phase 0 gate.

> **Completion gate:** This plan must exist before any other artifact in the record folder. Implementation does not begin until it exists.

---

**Subject:** [Brief identifier for the work item]
**Type:** Owner Workflow Plan
**Date:** YYYY-MM-DD

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | [What domains or areas this touches] | [low \| moderate \| elevated \| high] |
| **2. Shared artifact impact** | [Which shared artifacts are affected and how] | [low \| moderate \| elevated \| high] |
| **3. Step dependency** | [Whether later steps depend on decisions made in earlier steps] | [low \| moderate \| elevated \| high] |
| **4. Reversibility** | [Whether the change can be easily undone — high = poorly reversible] | [low \| moderate \| elevated \| high] |
| **5. Scope size** | [Number of files, roles, and systems affected] | [low \| moderate \| elevated \| high] |

**Verdict:** [Tier 1 / Tier 2 / Tier 3] — [One-sentence rationale.]

---

## Routing Decision

[Which tier and why. Reference the elevated axes that drove the decision. If a project invariant overrides the complexity-derived tier, name it explicitly.]

---

## Path Definition

[Roles to engage, in order. For Tier 1: Owner only. For Tier 2 and 3: the full sequence of handoffs.]

1. [Role] — [action]

---

## Known Unknowns

[Downstream decisions better deferred to the engaged role once they have context. Write "None" explicitly — this confirms deliberate assessment, not omission.]
