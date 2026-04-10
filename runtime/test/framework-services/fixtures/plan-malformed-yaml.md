---
type: owner-workflow-plan
date: "\q invalid escape sequence"
complexity:
  domain_spread: elevated
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: moderate
tier: 2
path: [Owner, Curator]
known_unknowns: []
---

# Malformed YAML Fixture

Used by plan-artifact-validator tests — the `\q` escape sequence is invalid in YAML
double-quoted strings. js-yaml throws a parse error on this file.
The validator should throw (exit code 2).
