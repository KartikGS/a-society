---
workflow:
  name: programmatic-improvement-system (2026-04-03)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "direction and TA brief approval"
    - id: ta-advisory
      role: Technical Architect
    - id: owner-ta-review
      role: Owner
      human-collaborative: "advisory approval and parallel track kickoff"
    - id: tooling-implementation
      role: Tooling Developer
    - id: runtime-implementation
      role: Runtime Developer
    - id: ta-integration
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "integration approval and Curator brief"
    - id: curator-proposal
      role: Curator
    - id: owner-curator-approval
      role: Owner
      human-collaborative: "proposal approval"
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: "closure"
  edges:
    - from: owner-intake
      to: ta-advisory
      artifact: owner-to-ta-brief
    - from: ta-advisory
      to: owner-ta-review
      artifact: ta-advisory
    - from: owner-ta-review
      to: tooling-implementation
      artifact: approved-spec
    - from: owner-ta-review
      to: runtime-implementation
      artifact: approved-spec
    - from: tooling-implementation
      to: ta-integration
      artifact: completion-report
    - from: runtime-implementation
      to: ta-integration
      artifact: completion-report
    - from: ta-integration
      to: owner-integration-gate
      artifact: ta-integration-report
    - from: owner-integration-gate
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-curator-approval
      artifact: curator-to-owner
    - from: owner-curator-approval
      to: curator-implementation
      artifact: owner-to-curator
    - from: owner-curator-approval
      to: curator-proposal
      artifact: owner-to-curator
    - from: curator-implementation
      to: owner-closure
      artifact: curator-to-owner
---
