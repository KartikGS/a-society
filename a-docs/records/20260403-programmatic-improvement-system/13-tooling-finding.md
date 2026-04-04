# Backward Pass Findings: Tooling Developer — programmatic-improvement-system (2026-04-03)

**Date:** 2026-04-04
**Task Reference:** programmatic-improvement-system (2026-04-03)
**Role:** Tooling Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- **Testing Paths relative to CWD:** When running `npx tsx`, the expected CWD and the relative path provided in the command line must align. If the agent is instructed to "Run tests in `tooling/test/`", it might try `npx tsx tooling/test/foo.test.ts` from the `tooling/` directory, which fails with `ERR_MODULE_NOT_FOUND`. Explicit guidance on CWD or the full repo-relative path is needed for robust execution.

### Unclear Instructions
- **Artifact writing in record folder:** The `IsArtifact: true` metadata in `write_to_file` is reserved for the `artifacts/` folder, but record-folder closure artifacts are project-level files correctly placed in `a-docs/records/`. The failed tool call showed that `write_to_file` with `IsArtifact: true` rejects project-relative paths.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction
- **Phase 0 Gate Coordination:** In a parallel-track flow, the Tooling Developer and Runtime Developer must coordinate on API changes. While the TA Advisory provided the spec, some small logic corrections were needed on the Runtime side (as noted in `12-owner-closure.md`). This suggests that Type C changes (interface changes) require a slightly tighter "handshake" phase before implementation closes.
- **`replace_file_content` vs syntax errors:** Attempting a partial replace on a large file with a complex structure (like the old Component 4) can lead to trailing characters or syntax errors if the block range is not perfectly aligned. A full file rewrite is often more reliable for large redesigns.

---

## Top Findings (Ranked)

1. **Explicit CWD for Tooling Execution** — `$A_SOCIETY_TOOLING_INVOCATION`: Add a note that all `npx tsx` commands should be run from the repository root using repo-relative paths to avoid `ERR_MODULE_NOT_FOUND`.
2. **Artifact Write Distinction** — `$GENERAL_IMPROVEMENT_META_ANALYSIS`: Clarify that record-folder findings and completion artifacts are standard project files (`IsArtifact: false`), not system-level artifacts.
3. **Redesign Reliability Protocol** — `$A_SOCIETY_TOOLING_ADDENDUM`: For Type C redesigns where more than 50% of a file changes, recommend a full file rewrite over a partial `replace_file_content` to prevent syntax drift.

---

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260403-programmatic-improvement-system/11-tooling-finding.md
```
