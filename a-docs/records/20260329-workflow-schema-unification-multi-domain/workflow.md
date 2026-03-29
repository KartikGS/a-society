---
workflow:
  name: Workflow Schema Unification + Multi-Domain Flow Docs
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: direction
    - id: ta-design-advisory
      role: Technical Architect
    - id: owner-advisory-review
      role: Owner
      human-collaborative: approval
    - id: tooling-dev-implementation
      role: Tooling Developer
    - id: runtime-dev-implementation
      role: Runtime Developer
    - id: curator-framework-proposal
      role: Curator
    - id: owner-curator-approval
      role: Owner
      human-collaborative: approval
    - id: curator-framework-implementation
      role: Curator
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: approval
    - id: curator-registration
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: closure
  edges:
    - from: owner-intake
      to: ta-design-advisory
      artifact: owner-to-ta-brief
    - from: owner-intake
      to: curator-framework-proposal
      artifact: owner-to-curator-brief
    - from: ta-design-advisory
      to: owner-advisory-review
      artifact: ta-advisory
    - from: owner-advisory-review
      to: tooling-dev-implementation
      artifact: owner-approval
    - from: owner-advisory-review
      to: runtime-dev-implementation
      artifact: owner-approval
    - from: curator-framework-proposal
      to: owner-curator-approval
      artifact: curator-to-owner
    - from: owner-curator-approval
      to: curator-framework-implementation
      artifact: owner-to-curator
    - from: tooling-dev-implementation
      to: ta-integration-review
      artifact: completion-report
    - from: runtime-dev-implementation
      to: ta-integration-review
      artifact: completion-report
    - from: ta-integration-review
      to: owner-integration-gate
      artifact: ta-integration-report
    - from: owner-integration-gate
      to: curator-registration
      artifact: owner-approval
    - from: curator-framework-implementation
      to: curator-registration
      artifact: implementation-complete
    - from: curator-registration
      to: owner-forward-pass-closure
      artifact: curator-to-owner
---
