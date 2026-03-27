# Backward Pass Findings: Curator — 20260327-runtime-orchestrator-mvp

**Date:** 2026-03-27
**Task Reference:** 20260327-runtime-orchestrator-mvp
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- The `a-docs-guide.md` does not list `$A_SOCIETY_TOOLING_INVOCATION` or its runtime equivalent, as it is appropriately scoped to `a-docs/` documentation intent. However, this means invocation references for executable components don't have a formalized orientation layer explaining *why* they exist. A new maintainer would not discover why `tooling/INVOCATION.md` or `runtime/INVOCATION.md` exist through the `a-docs-guide.md`, even though they are critical to the framework's operation.

### Unclear Instructions
- Identifying the correct public-facing index registration categorization for the runtime invocation document was slightly ambiguous, as `a-society/index.md` lacked an existing "Runtime" category to map to. Only minor friction.

### Redundant Information
- none

### Scope Concerns
- The Curator role document (`a-docs/roles/curator.md`) focuses explicitly on "Maintenance of all content under `a-society/a-docs/` and `a-society/general/`". However, the Phase 6 brief explicitly directed me to author `a-society/runtime/INVOCATION.md`. There is a structural disconnect here: either the Curator's explicit scope needs expansion to cover orchestration/utility layer documentation, or authoring these files should formally belong to the Developers (Tooling/Runtime Developer) who build those layers.

### Workflow Friction
- none

---

## Top Findings (Ranked)

1. Scope ambiguity in maintaining execution-layer documentation — Owner's brief requested Curator to write `runtime/INVOCATION.md`, yet `roles/curator.md` limits scope to `a-docs/` and `general/`.
2. Missing orientation layer for invocation references — `a-docs-guide.md` correctly omits tooling/runtime docs, leaving those critical references without structural rationale documentation.
