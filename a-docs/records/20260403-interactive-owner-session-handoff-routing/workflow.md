---
workflow:
  name: A-Society Runtime Development
  nodes:
    - id: owner-intake
      role: Owner
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: "yes"
    - id: developer-implementation-phases
      role: Runtime Developer
    - id: developer-integration-validation
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
      artifact: owner-to-technical-architect-brief
    - from: ta-phase0-design
      to: owner-phase0-gate
      artifact: ta-advisory
    - from: owner-phase0-gate
      to: developer-implementation-phases
      artifact: owner-approval
    - from: developer-implementation-phases
      to: developer-integration-validation
    - from: developer-integration-validation
      to: ta-integration-review
      artifact: integration-test-record
    - from: ta-integration-review
      to: owner-integration-gate
      artifact: ta-assessment
    - from: owner-integration-gate
      to: curator-registration
      artifact: owner-approval
    - from: curator-registration
      to: owner-forward-pass-closure
      artifact: curator-to-owner
---
