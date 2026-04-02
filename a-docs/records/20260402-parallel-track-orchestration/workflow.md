---
workflow:
  name: Parallel Track Orchestration (20260402)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes — intake, briefing, and scope definition"
    - id: ta-design
      role: Technical Architect
    - id: owner-ta-review
      role: Owner
      human-collaborative: "yes — advisory approval"
    - id: tooling-developer
      role: Tooling Developer
    - id: runtime-developer
      role: Runtime Developer
    - id: owner-convergence
      role: Owner
      human-collaborative: "yes — convergence review"
    - id: curator-proposal
      role: Curator
    - id: owner-curator-approval
      role: Owner
      human-collaborative: "yes — LIB approval gate"
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: "yes — forward pass closure"
  edges:
    - from: owner-intake
      to: ta-design
      artifact: owner-to-ta-brief
    - from: ta-design
      to: owner-ta-review
      artifact: ta-advisory
    - from: owner-ta-review
      to: tooling-developer
      artifact: owner-approval
    - from: owner-ta-review
      to: runtime-developer
      artifact: owner-approval
    - from: tooling-developer
      to: owner-convergence
      artifact: tooling-developer-completion
    - from: runtime-developer
      to: owner-convergence
      artifact: runtime-developer-completion
    - from: owner-convergence
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
