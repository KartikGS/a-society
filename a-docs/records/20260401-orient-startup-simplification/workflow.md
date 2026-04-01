---
workflow:
  name: orient-startup-simplification
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "yes"
    - id: developer-implementation
      role: Runtime Developer
    - id: owner-forward-pass-closure
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake
      to: developer-implementation
      artifact: owner-to-runtime-developer-brief
    - from: developer-implementation
      to: owner-forward-pass-closure
      artifact: developer-to-owner
---
