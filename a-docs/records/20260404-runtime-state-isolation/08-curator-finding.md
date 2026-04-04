# Backward Pass Findings: Curator — 20260404-runtime-state-isolation

**Date:** 2026-04-04
**Task Reference:** 20260404-runtime-state-isolation
**Role:** curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- **System vs. Project "Artifact" Terminology**: The system prompt defines "Artifacts" as files written to a specific `/artifacts/` directory for internal presentation, while A-Society defines "Artifacts" as the sequenced markdown files within a record folder (e.g., `06-registration-confirmation.md`). This overlap caused a tool-call error when implementing the registration phase: the agent used `IsArtifact: true` in `write_to_file` for a project-level artifact, which failed because the path was outside the system's `/artifacts/` directory.

### Missing Information
- none

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- none

---

## Top Findings (Ranked)

1. **System/Project Terminology Overlap** — `$RECORDS` / `write_to_file` tool: The shared "Artifact" term between the A-Society framework and the agentic system prompt can lead to incorrect tool parameter selection. Project-level artifacts in the record folder should be written with `IsArtifact: false` to avoid path-validation failures.
2. **Effective Handoff of Non-Blocking Concerns** — `05-owner-integration-gate.md`: The Owner successfully used the Curator role to "side-channel" a non-blocking test-quality observation (env-var cleanup) into the project log's Next Priorities, preventing implementer distraction while ensuring the finding was not lost.
