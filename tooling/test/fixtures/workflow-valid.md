---
workflow:
  name: Test Workflow
  phases:
    - id: phase-1
      name: Proposal
    - id: phase-2
      name: Review
    - id: phase-3
      name: Backward Pass
  nodes:
    - id: owner-phase-1
      role: Owner
      phase: phase-1
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-1
      role: Curator
      phase: phase-1
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: owner-phase-2
      role: Owner
      phase: phase-2
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-3-findings
      role: Curator
      phase: phase-3
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: owner-phase-3-findings
      role: Owner
      phase: phase-3
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-3-synthesis
      role: Curator
      phase: phase-3
      first_occurrence_position: 2
      is_synthesis_role: true
  edges:
    - from: owner-phase-1
      to: curator-phase-1
      artifact: brief
    - from: curator-phase-1
      to: owner-phase-2
      artifact: proposal
    - from: owner-phase-2
      to: curator-phase-3-findings
      artifact: decision
---

# Test Workflow

Prose content here.
