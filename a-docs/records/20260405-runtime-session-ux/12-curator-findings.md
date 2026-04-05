# Backward Pass Findings: Curator — 20260405-runtime-session-ux

**Date:** 2026-04-05
**Task Reference:** 20260405-runtime-session-ux
**Role:** curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- **[A-SOCIETY] Handoff-on-Clarification Restriction** — The instruction `$INSTRUCTION_MACHINE_READABLE_HANDOFF` does not explicitly forbid emitting a `handoff` block during turns that require immediate user/Owner feedback to continue.
- **[A-SOCIETY] Repo-relative Path Format** — `$INSTRUCTION_INDEX` does not specify whether repo-relative paths in the index should include a leading slash. This has led to inconsistency in `$A_SOCIETY_PUBLIC_INDEX`.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- **Contradictory Turn State during Orientation** — During the Curator's initial orientation turn, the agent emitted a `handoff` block to the Owner while simultaneously asking "What is my current objective?". In an automated runtime, this causes a logical contradiction: the session hands off control to the Owner, while the Curator is still awaiting a task assignment in the same turn. This results in redundant role-switches and slows the flow lifecycle.

---

## Top Findings (Ranked)

1. **Restrict Handoff on Clarification Turns** — [$INSTRUCTION_MACHINE_READABLE_HANDOFF](file:///home/kartik/Metamorphosis/a-society/general/instructions/communication/coordination/machine-readable-handoff.md)
   - *Detail:* Agents must be instructed to never emit a `handoff` block when asking for task-start clarification or a mid-session turn within the same flow track. A `handoff` is the "terminal signal" for the current role's session turn.
   - *Analysis:* This finding was triggered by a human correction. In an autonomous runtime, this contradiction creates a race condition between the current role's request for input and the successor role's session startup.

2. **Mandate No Leading Slash for Repo-relative Paths** — [$INSTRUCTION_INDEX](file:///home/kartik/Metamorphosis/a-society/general/instructions/indexes/main.md)
   - *Detail:* Repo-relative paths in index files should consistently omit the leading slash (e.g., `a-society/a-docs/agents.md`). [$A_SOCIETY_PUBLIC_INDEX](file:///home/kartik/Metamorphosis/a-society/index.md) currently mixes both formats (e.g., `/a-society/...` and `a-society/...`).
   - *Analysis:* The lack of explicit formatting guidance in the index instruction allows for silent path inconsistencies that could break programmatic path resolution in the Tooling or Runtime layers.

handoff
```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260405-runtime-session-ux/12-curator-findings.md
```
