---
workflow:
  name: A-Society Multi-Domain — session-routing-removal
  nodes:
    - id: owner-intake-briefing
      role: Owner
      human-collaborative: "yes"
    - id: curator-proposal
      role: Curator
    - id: runtime-developer-implementation
      role: Runtime Developer
    - id: owner-review
      role: Owner
      human-collaborative: "yes"
    - id: curator-implementation-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake-briefing
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: owner-intake-briefing
      to: runtime-developer-implementation
      artifact: owner-to-runtime-developer-brief
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
      to: owner-forward-pass-closure
      artifact: curator-to-owner
    - from: runtime-developer-implementation
      to: owner-forward-pass-closure
      artifact: runtime-developer-to-owner
---
