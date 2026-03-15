# Backward Pass Findings: Curator — 20260315-tooling-general-coupling-workflow

**Date:** 2026-03-15
**Task Reference:** 20260315-tooling-general-coupling-workflow
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- None.

### Unclear Instructions
- Addition 2c in `04-owner-to-curator-brief.md` was listed under "Change 2: Update `$A_SOCIETY_WORKFLOW`" but its target text ("On-demand — invoked when Developer escalates or at Owner's request for Phase 6 gate") does not exist in `$A_SOCIETY_WORKFLOW` — it exists in `$A_SOCIETY_TOOLING_ADDENDUM`. The brief's heading named one file; the addition targeted a different file. I located the target by reading the addendum, inferred the correct file, and applied the change there. The inference was safe in this case, but the ambiguity is a real risk: a Curator could misread 2c as targeting the workflow document and either fail to find the text or apply it in the wrong place. When a "Change N" block groups additions that target different files, each addition should name its target file explicitly.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction
- None.

---

## Top Findings (Ranked)

1. Brief should name the target file explicitly when an addition targets a different document than the Change heading implies — `04-owner-to-curator-brief.md` / Addition 2c.
