# Backward Pass Findings: Owner — 20260320-workflow-directory-realignment

**Date:** 2026-03-20
**Task Reference:** 20260320-workflow-directory-realignment
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **$A_SOCIETY_IMPROVEMENT vs Component 4:** The improvement protocol specifies that the synthesis role is always last and the Owner is second-to-last in a multi-role backward pass. Component 4's implementation (a simple reversal of forward-pass first occurrences) fails this rule for the newly defined tooling workflow, where it incorrectly returns [TA, Developer, Curator, Owner] instead of [TA, Developer, Owner, Curator]. This is a process-tooling conflict.

### Missing Information
- none

### Unclear Instructions
- none

### Redundant Information
- **Session Routing Rules:** Correctly identified that "When to start a new session" was duplicated in role files and workflow files. Moving this to the index (`workflow/main.md`) resolved the redundancy while preserving reference stability across the framework.

### Scope Concerns
- **Downstream Reference Drift:** Identifying the drift in `$A_SOCIETY_IMPROVEMENT` (Component 4 invocation) was a necessary scope guard. The decision to register this as a Next Priority rather than implementing it in the current flow was correct, as it touches a different domain (improvement protocol execution).

### Workflow Friction
- none

---

## Top Findings (Ranked)

1. **Component 4 Logic vs. Protocol Gap** — `$A_SOCIETY_IMPROVEMENT` vs `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`. The reversal-only logic in Component 4 does not satisfy the framework's backward-pass ordering invariants for multi-role flows.
2. **A_SOCIETY_WORKFLOW Pointing to Index** — `workflow/main.md`. Reassigning `$A_SOCIETY_WORKFLOW` to the routing index and moving universal session rules there successfully avoided breaking existing references across all four role documents.
3. **Library Generalization (Index-Based Routing)** — `general/instructions/workflow/main.md`. The guidance added to the library provides a clear "When to use" vs "When NOT to use" rubric, preventing over-engineering for simpler projects.
