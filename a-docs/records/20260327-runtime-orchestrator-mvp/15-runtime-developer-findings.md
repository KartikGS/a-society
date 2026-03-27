# Backward Pass Findings: Runtime Developer — 20260327-runtime-orchestrator-mvp

**Date:** 2026-03-27
**Task Reference:** 20260327-runtime-orchestrator-mvp
**Role:** Runtime Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- The handoff block schema dictated `session_action: start_new`, but some historical prompts and flow initiation documents used `start`. This created a schema mismatch that temporarily resulted in an undeclared parser normalization before the Owner explicitly enforced `start_new` strictness.

### Missing Information
- `$A_SOCIETY_TOOLING_INVOCATION` (`tooling/INVOCATION.md`) documents Components 1 through 6, but completely omits Component 7 (`plan-artifact-validator.ts`). I had to read the source file to discover its exported entry point (`validatePlanArtifact(recordFolderPath: string)` vs passing a direct file path).

### Unclear Instructions
- Component 1's `scaffoldFromManifestFile` requires `aSocietyRoot` and `manifestPath` as explicit arguments, which requires the Runtime API wrapper to computationally resolve paths representing the framework installation location relative to the `projectRoot`. Hardcoding this resolution logic slightly violates pure data-driven invocation.

### Redundant Information
- none

### Scope Concerns
- The implementation of the `human-collaborative` orchestrator pause required me directly editing the permanent framework workflow documentation (`framework-development.md`, `tooling-development.md`, `runtime-development.md`) to add the `human-collaborative: "yes"` flags. While explicitly authorized in Phase 0, it crosses the boundary of a Developer mutating cross-project metadata.

### Workflow Friction
- Implementing the runtime without native topological node awareness forced manual translation of workflow parsed edges inside the Orchestrator loop.

---

## Top Findings (Ranked)

1. Missing Component 7 in INVOCATION.md — `tooling/INVOCATION.md` needs a dedicated section documenting `validatePlanArtifact`.
2. Handoff `session_action` enum mismatch — Strict enforcement of `start_new` vs `start` needs monitoring moving forward.
3. Component 1 path argument complexity — `scaffoldFromManifestFile` requires passing deterministic framework paths that the runtime orchestrator has to infer.
