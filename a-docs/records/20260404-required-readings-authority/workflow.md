---
workflow:
  name: Required Readings Authority Restructure (20260404)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "ADR decision on required-readings.yaml schema; briefs to both tracks"
    - id: curator-proposal
      role: Curator
    - id: runtime-implementation
      role: Runtime Developer
    - id: owner-curator-review
      role: Owner
      human-collaborative: "approval of Curator proposal"
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: "forward pass closure"
  edges:
    - from: owner-intake
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: owner-intake
      to: runtime-implementation
      artifact: owner-to-runtime-developer-brief
    - from: curator-proposal
      to: owner-curator-review
      artifact: curator-to-owner
    - from: runtime-implementation
      to: owner-closure
      artifact: runtime-developer-completion
    - from: owner-curator-review
      to: curator-implementation
      artifact: owner-to-curator
    - from: owner-curator-review
      to: curator-proposal
      artifact: owner-to-curator
    - from: curator-implementation
      to: owner-closure
      artifact: curator-to-owner
---
