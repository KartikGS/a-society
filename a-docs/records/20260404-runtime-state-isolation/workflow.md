---
workflow:
  name: A-Society Runtime Development — runtime-state-isolation (20260404)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes"
    - id: runtime-dev
      role: Runtime Developer
    - id: ta-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "yes"
    - id: curator-registration
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake
      to: runtime-dev
      artifact: owner-brief
    - from: runtime-dev
      to: ta-review
      artifact: integration-validation-record
    - from: ta-review
      to: owner-integration-gate
      artifact: ta-assessment
    - from: owner-integration-gate
      to: curator-registration
      artifact: owner-approval
    - from: curator-registration
      to: owner-closure
      artifact: curator-to-owner
---
