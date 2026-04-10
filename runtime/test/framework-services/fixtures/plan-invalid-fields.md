---
type: owner-workflow-plan
date: "2026-03-18"
complexity:
  domain_spread: medium
  shared_artifact_impact: null
  step_dependency: low
  reversibility: null
  scope_size: high
tier: null
path: []
known_unknowns: []
---

# Invalid Fields Fixture

Used by plan-artifact-validator tests — multiple field violations:
- complexity.domain_spread: "medium" is not in {low, moderate, elevated, high}
- complexity.shared_artifact_impact: null
- complexity.reversibility: null
- tier: null
- path: empty list
