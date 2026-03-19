# Backward Pass Findings: Curator — 20260319-graph-schema-simplification

**Date:** 2026-03-19
**Task Reference:** 20260319-graph-schema-simplification
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- `$A_SOCIETY_UPDATES_TEMPLATE` currently includes explanatory annotations on the two version field lines, while `$A_SOCIETY_UPDATES_PROTOCOL` explicitly forbids trailing text on those lines. Following the template verbatim caused the revise cycle in this flow.

### Missing Information
- none

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- The flow intentionally changed framework documentation before Components 3 and 4 were realigned. This was the correct scope call, but it leaves a temporary split state: framework schema is current, tooling implementation alignment remains a separate TA → Developer track.

### Workflow Friction
- The update-report gate changed the expected artifact sequence mid-flow. Once the report requirement was confirmed, findings had to wait until the update-report submission and approval were resolved. That sequencing is correct, but it is easy to under-specify in handoffs if the gate is identified late.

---

## Top Findings (Ranked)

1. Update report template violates its own parsing contract — `$A_SOCIETY_UPDATES_TEMPLATE`
2. Approved schema and current Component 3/4 implementation are now intentionally split until follow-up lands — `$A_SOCIETY_TOOLING_INVOCATION`, `$A_SOCIETY_TOOLING_COUPLING_MAP`
3. Update-report gate should be surfaced earlier in implementation handoffs when a `general/` change is obviously migration-relevant — `$A_SOCIETY_UPDATES_PROTOCOL`, `$A_SOCIETY_WORKFLOW`
