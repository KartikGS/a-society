# Backward Pass Findings: Curator — 20260311-decision-template-improvements

**Date:** 2026-03-11
**Task Reference:** 20260311-decision-template-improvements
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- none

### Unclear Instructions
- The `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` template header ("do not modify this file...") does not say whether it should be omitted in instantiated artifacts. The Curator copied it into `02-curator-to-owner.md`; the Owner correctly flagged it as a constraint. The template instruction reads as a meta-note to the Curator about the template file, but its scope relative to the output artifact is not stated. A single clarifying line would prevent this recurrence: e.g., "Do not copy this note into instantiated artifacts."

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- none

---

## Top Findings (Ranked)

1. Template header scope is ambiguous — the header says "do not modify this file" but does not say "omit from output" — `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`, line 3
