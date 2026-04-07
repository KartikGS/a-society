---
workflow:
  name: A-Society Framework Development — role-jit-extraction (20260407)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: direction
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
      human-collaborative: approval
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: closure
  edges:
    - from: owner-intake
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-review
      artifact: curator-to-owner
    - from: owner-review
      to: curator-implementation
      artifact: owner-to-curator
    - from: owner-review
      to: curator-proposal
      artifact: owner-to-curator
    - from: curator-implementation
      to: owner-closure
      artifact: curator-to-owner
---
