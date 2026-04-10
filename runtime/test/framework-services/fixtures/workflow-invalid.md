---
workflow:
  name: Bad Workflow
  phases:
    - id: phase-1
      name: Only Phase
  nodes:
    - id: node-1
      role: Owner
      phase: phase-1
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: node-1
      role: Curator
      phase: nonexistent-phase
      first_occurrence_position: -1
      is_synthesis_role: true
    - id: node-3
      role: Curator
      phase: phase-1
      first_occurrence_position: 2
      is_synthesis_role: true
  edges:
    - from: node-1
      to: bad-node-id
---

# Invalid Workflow
