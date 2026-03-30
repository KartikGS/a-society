---
workflow:
  name: A-Society Runtime Development — registry-frontmatter-reader
  nodes:
    - id: ta-phase0-advisory
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: "approve TA advisory before implementation begins"
    - id: developer-implementation
      role: Runtime Developer
    - id: developer-integration-validation
      role: Runtime Developer
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "approve integration before registration"
    - id: curator-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "log update and backward pass initiation"
  edges:
    - from: ta-phase0-advisory
      to: owner-phase0-gate
      artifact: ta-advisory
    - from: owner-phase0-gate
      to: developer-implementation
      artifact: owner-approval
    - from: developer-implementation
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
