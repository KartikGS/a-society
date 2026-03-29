---
workflow:
  name: owner-protocol-and-role-guidance-bundle (20260329)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "Flow scope, merge assessment, and brief confirmed by human"
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
  edges:
    - from: owner-intake
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-review
      artifact: curator-to-owner-proposal
    - from: owner-review
      to: curator-implementation
      artifact: owner-to-curator-decision
    - from: curator-implementation
      to: owner-closure
      artifact: curator-to-owner-confirmation
---
