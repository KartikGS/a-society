---
workflow:
  name: A-Society Multi-Domain — project-scoped-improvement-instructions (2026-04-04)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "intake and briefing"
    - id: runtime-developer-fix
      role: Runtime Developer
    - id: curator-phase
      role: Curator
    - id: owner-integration-gate
      role: Owner
      human-collaborative: "integration review and approval"
    - id: curator-implementation
      role: Curator
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "closure"
  edges:
    - from: owner-intake
      to: runtime-developer-fix
      artifact: owner-to-runtime-developer-brief
    - from: owner-intake
      to: curator-phase
      artifact: owner-to-curator-brief
    - from: runtime-developer-fix
      to: owner-integration-gate
      artifact: runtime-developer-completion
    - from: curator-phase
      to: owner-integration-gate
      artifact: curator-to-owner
    - from: owner-integration-gate
      to: curator-implementation
      artifact: owner-to-curator
    - from: curator-implementation
      to: owner-forward-pass-closure
      artifact: curator-to-owner
---
