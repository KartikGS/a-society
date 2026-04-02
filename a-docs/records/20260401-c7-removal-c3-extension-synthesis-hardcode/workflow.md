---
workflow:
  name: C7 removal, Component 3 structural extension, synthesis role hardcode (20260401)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes — intake and briefing"
    - id: tooling-developer
      role: Tooling Developer
    - id: runtime-developer
      role: Runtime Developer
    - id: owner-convergence
      role: Owner
      human-collaborative: "yes — convergence review before routing to Curator"
    - id: curator-documentation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: "yes — forward pass closure"
  edges:
    - from: owner-intake
      to: tooling-developer
      artifact: owner-to-developer-brief
    - from: owner-intake
      to: runtime-developer
      artifact: owner-to-developer-brief
    - from: tooling-developer
      to: owner-convergence
      artifact: tooling-developer-completion
    - from: runtime-developer
      to: owner-convergence
      artifact: runtime-developer-completion
    - from: owner-convergence
      to: curator-documentation
      artifact: owner-convergence-decision
    - from: curator-documentation
      to: owner-closure
      artifact: curator-to-owner
---
