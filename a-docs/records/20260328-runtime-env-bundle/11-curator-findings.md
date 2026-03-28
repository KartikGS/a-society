# Backward Pass Findings: Curator — runtime-env-bundle

**Date:** 2026-03-28
**Task Reference:** `runtime-env-bundle`
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **Index placement inconsistency** — `$A_SOCIETY_INDEX` (the "single source of truth for key file locations") omits `$A_SOCIETY_RUNTIME_INVOCATION`, while `$A_SOCIETY_PUBLIC_INDEX` includes it. This diverges from the pattern in `tooling/INVOCATION.md`, which is registered in both. This caused orientation friction during the registration phase, as the Curator expected all key file references to resolve from the main index.

### Missing Information
- **Diagnostic script placement** — No instruction or convention exists for where "one-shot" integration test scripts (e.g., `test-dotenv.ts`, `test-catch.ts`) should reside. Their placement in `runtime/` root led to unnecessary clutter that required TA intervention and Owner disposition.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- **Registration gate excludes documentation accuracy** — The Registration Phase in `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` focuses on index/guide updates but does not explicitly require the Curator to verify that the implementation's CLI changes are reflected accurately in the documentation. This allowed three command signature inaccuracies to drift in `INVOCATION.md` until they were caught by the TA in the *next* flow's Phase 0.

### Workflow Friction
- none

---

## Top Findings (Ranked)

1. **Register `$A_SOCIETY_RUNTIME_INVOCATION` in the main index** — `$A_SOCIETY_INDEX` (Alignment with tooling pattern and Curator orientation efficiency) 
2. **Add documentation accuracy to the Curator registration gate** — `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` (§Registration Phase)
3. **Specify standardized test/diagnostic placement for the runtime layer** — `role: Runtime Developer` (Placement discipline)

---

## Hand-off

Curator meta-analysis complete. No framework-level (`general/`) contributions identified in this pass; all findings are local to the A-Society `a-docs/` or `runtime/` layer.

Next action: Perform your backward pass meta-analysis (step 2 of 5).
Read: All prior artifacts in the record folder, then ### Meta-Analysis Phase in `a-society/general/improvement/main.md`.
Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to Owner (meta-analysis).
