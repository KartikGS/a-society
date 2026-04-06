---
workflow:
  name: In-Flow Human Interaction (20260405-inflow-human-interaction)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes"
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: "yes"
    - id: runtime-developer-implementation
      role: Runtime Developer
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "yes"
    - id: curator-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake
      to: ta-phase0-design
    - from: ta-phase0-design
      to: owner-phase0-gate
    - from: owner-phase0-gate
      to: runtime-developer-implementation
    - from: runtime-developer-implementation
      to: ta-integration-review
    - from: ta-integration-review
      to: owner-integration-gate
    - from: owner-integration-gate
      to: curator-registration
    - from: curator-registration
      to: owner-forward-pass-closure
---
