# Backward Pass Findings: Tooling Developer — c7-removal-c3-extension-synthesis-hardcode

**Date:** 2026-04-02
**Task Reference:** c7-removal-c3-extension-synthesis-hardcode
**Role:** Tooling Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **none**

### Missing Information
- **Test Fixture Dependency on Framework Version:** `tooling/test/version-comparator.test.ts` reads the live `VERSION.md` of the framework but compares it against hardcoded internal fixtures. When the framework version is updated externally (e.g., to `v27.0`), these tests fail even if no tooling changes occurred. This is a "Placement Gap" in the test architecture — tests should either use a mock version file or fixtures should be programmatically aligned with the framework version during a pre-test sweep.

### Unclear Instructions
- **Record-folder Artifact vs Gemini Artifact:** `tooling-developer.md` uses the term "completion artifact" for record-folder files, while the `write_to_file` tool uses the term for Gemini's internal markdown artifact directory. This naming overlap caused an initial tool call failure when attempting to write to the record folder with `IsArtifact: true`.

### Redundant Information
- **none**

### Scope Concerns
- **none**

### Workflow Friction
- **Reconciliation during Implementation:** I had to resolve pre-existing framework drift (stale version fixtures) to get the test suite into a passing state before verifying Track A. This "cleanup on the go" added complexity to a supposedly pure execution phase. A Phase 0 "validity sweep" for the test environment before developer access would reduce this friction.

---

## Top Findings (Ranked)

1. **Stale test fixtures** — `tooling/test/fixtures/`. Tooling tests are coupled to the live framework version, creating non-hermetic test failures whenever the framework is updated.
2. **Tool-Document Terminology Overlap** — `tooling-developer.md` vs `write_to_file` command. "Artifact" terminology conflict between role instructions and the Gemini tool platform.
3. **Missing Test Environment Sweep** — Phase 0 / Implementation boundary. The developer should start with a passing test suite; drift should be cleared by the Curator or Owner during Phase 0 prep.
