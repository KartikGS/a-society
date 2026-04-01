# Backward Pass Findings: Runtime Developer — orient-startup-simplification

**Date:** 2026-04-01
**Task Reference:** orient-startup-simplification
**Role:** Runtime Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- **Programmatic usage for demoted `orient` command:** The requirement to preserve the usage and arguments documentation for `orient` while demoting it to a "mechanism" was not explicitly stated in the brief. This led to their removal during the "description update," which orphaned the documentation for programmatic callers.

### Unclear Instructions
- **Brief-to-code line mapping:** The brief specified exact line numbers for changes in `orient.ts` (37, 39, 95) that did not match the current file state. While the target content strings were diagnostic, the line number drift creates a failure point for agents relying on line-indexed replacement.
- **"Replace with" scope in INVOCATION.md:** The instruction "Replace with: [new description]" for the `orient` command was interpreted as replacing the entire entry's content (description, usage, and arguments) due to the framing of its demotion to an "underlying mechanism." Explicitly specifying "preserve usage and arguments" would have prevented this removal.

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- none

---

## Top Findings (Ranked)

1. **Ambiguous replacement boundary for command demotion** — `runtime/INVOCATION.md`
2. **Line number drift between brief and code** — `a-docs/records/[flow-id]/02-owner-to-runtime-developer-brief.md`
