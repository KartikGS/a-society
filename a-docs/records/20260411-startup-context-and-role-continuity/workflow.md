---
workflow:
  name: startup-context-and-role-continuity
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes"
    - id: ta-phase0-design
      role: Technical Architect
    - id: owner-phase0-gate
      role: Owner
      human-collaborative: "yes"
    - id: orchestration-implementation
      role: Orchestration Developer
    - id: ta-integration-review
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "yes"
    - id: curator-proposal
      role: Curator
    - id: owner-curator-approval
      role: Owner
      human-collaborative: "yes"
    - id: curator-implementation
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake
      to: ta-phase0-design
      artifact: 02-owner-to-ta-brief.md
    - from: ta-phase0-design
      to: owner-phase0-gate
      artifact: 03-ta-phase0-design.md
    - from: owner-phase0-gate
      to: orchestration-implementation
      artifact: 04-owner-phase0-approval.md
    - from: orchestration-implementation
      to: ta-integration-review
      artifact: 05-orchestration-developer-completion-report.md
    - from: ta-integration-review
      to: owner-integration-gate
      artifact: 06-ta-integration-review.md
    - from: owner-integration-gate
      to: curator-proposal
      artifact: 07-owner-to-curator-brief.md
    - from: curator-proposal
      to: owner-curator-approval
      artifact: 08-curator-to-owner.md
    - from: owner-curator-approval
      to: curator-implementation
      artifact: 09-owner-to-curator.md
    - from: curator-implementation
      to: owner-forward-pass-closure
      artifact: 10-curator-to-owner.md
---
