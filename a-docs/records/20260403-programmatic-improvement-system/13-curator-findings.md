# Backward Pass Findings: Curator — programmatic-improvement-system

**Date:** 2026-04-04
**Task Reference:** 20260403-programmatic-improvement-system
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **Phase 7 (Registration) Mirror Assessment:** There is a discrepancy between the internal index (`a-society/a-docs/indexes/main.md`) and the public index (`a-society/index.md`). `$GENERAL_IMPROVEMENT_PROTOCOL` was still present in the public index despite being retired in v8.0. This suggests that prior "mirror assessments" may have been incomplete or assumed internal index updates automatically propagated to the public-facing surface.

### Missing Information
- **write_to_file `IsArtifact` behavior:** Encountered a tool-level failure when setting `IsArtifact: true` while specifying an absolute repository path for a record-folder artifact. The documentation (or tool-specific guidance) does not explicitly differentiate between the system's "artifact directory" and repository-tracked sequence artifacts in record folders.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- **Draft Update Report Conventions:** The Part B brief instructed the production of a framework update report draft for newly-created files but did not specify that those files should be referenced by their proposed `$VAR` names in the draft. This resulted in a "minor cleanup note" from the Owner, which could have been avoided if the brief-writing protocol explicitly required `$VAR` usage for all files in update report drafts, including those in-flow.

---

## Top Findings (Ranked)

1. **Gapped Mirror Assessment for Public Index** — `a-society/index.md`. Retired variables persisted in the public index after being correctly removed from the internal index.
2. **`IsArtifact` vs. Repo Path Ambiguity** — `write_to_file` usage. Confusion over system-level "artifacts" vs. repository record-folder sequence artifacts led to a tool-call failure.
3. **Draft Update Report Reference Standards** — `$A_SOCIETY_OWNER_ROLE`. Brief-writing requirements do not explicitly mandate `$VAR` usage for newly-created files in draft update reports, creating minor iteration overhead.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260403-programmatic-improvement-system/13-curator-findings.md
next_action: perform meta-analysis as Tooling Developer and Runtime Developer (concurrent)
read: a-society/a-docs/improvement/main.md
expected_response: 13a-tooling-developer-findings.md and 13b-runtime-developer-findings.md
```
