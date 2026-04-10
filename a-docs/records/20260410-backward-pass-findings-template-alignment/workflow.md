---
workflow:
  name: A-Society Framework Development — backward-pass-findings-template-alignment
  nodes:
    - id: owner-intake-briefing
      role: Owner
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
    - id: curator-implementation-registration
      role: Curator
    - id: owner-closure-acknowledgment
      role: Owner
  edges:
    - from: owner-intake-briefing
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-review
      artifact: curator-to-owner
    - from: owner-review
      to: curator-implementation-registration
      artifact: owner-to-curator
    - from: curator-implementation-registration
      to: owner-closure-acknowledgment
      artifact: curator-to-owner
---
