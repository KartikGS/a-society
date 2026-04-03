---
workflow:
  name: A-Society Framework Development
  nodes:
    - id: owner-intake-briefing
      role: Owner
      human-collaborative: "yes"
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
      human-collaborative: "yes"
    - id: curator-implementation-registration
      role: Curator
    - id: owner-closure-acknowledgment
      role: Owner
      human-collaborative: "yes"
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
    - from: owner-review
      to: curator-proposal
      artifact: owner-to-curator
    - from: curator-implementation-registration
      to: owner-closure-acknowledgment
      artifact: curator-to-owner
---