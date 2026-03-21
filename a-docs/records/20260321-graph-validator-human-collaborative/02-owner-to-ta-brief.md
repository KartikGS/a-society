---

**Subject:** TA Advisory Request: Component 3 schema update — allow human-collaborative as optional node field
**Status:** BRIEFED
**Date:** 2026-03-21

---

## Context

Component 3 — the Workflow Graph Schema Validator — currently rejects `human-collaborative` as a node field, causing an invocation failure when agents validate workflow graphs that include it. This forces Initializer agents to document `human-collaborative` in prose only and strip it from the YAML frontmatter before validation. That workaround prevents Component 3 from validating complete workflow graphs.

`human-collaborative` is a first-class concept in `$INSTRUCTION_WORKFLOW`. It appears in A-Society's own workflow documents (e.g., `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 1). The validator schema needs to be extended to accept it as a valid optional node field.

---

## Requested Assessment

Produce an advisory that addresses the following:

**1. Field definition**
Propose the exact schema addition to Component 3. Specifically:
- What type should `human-collaborative` have in the validator schema? (string, enum, or something else)
- What allowed values, if any, should be enforced? (e.g., free string, or constrained to values like `direction`, `review`, `approval`)
- Is the field required or optional on a node?
- Does the field belong at the node level, the phase level, or both?

Reference `$INSTRUCTION_WORKFLOW` for the authoritative definition of `human-collaborative` phases and their value semantics.

**2. Component 3 implementation scope**
Review the current Component 3 implementation to identify:
- Where in the schema validation logic the addition should go
- Whether any existing test cases would be invalidated by the change
- What new test cases are needed to cover the `human-collaborative` field

**3. Companion implications**
Assess whether any other component requires a companion change:
- **Component 4 (Backward Pass Orderer):** Does `human-collaborative` affect traversal ordering? If the Backward Pass Orderer skips human-collaborative nodes or treats them differently in the backward pass, the Component 4 logic may need to handle this field.
- Any other component or downstream consumer of the schema validator output.

**4. Invocation contract**
Does this schema change alter the public invocation contract for Component 3 (inputs, outputs, exit codes)? If yes, describe how `$A_SOCIETY_TOOLING_INVOCATION` and `$A_SOCIETY_TOOLING_COUPLING_MAP` will need updating.

---

## Artifacts to Read

- `$INSTRUCTION_WORKFLOW` — definition of `human-collaborative` phases, allowed values, structural rules
- `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — example of `human-collaborative` in a live workflow document (Phase 1)
- Component 3 implementation: `tooling/src/workflow-graph-schema-validator.ts`
- `$A_SOCIETY_TOOLING_PROPOSAL` — original Component 3 design specification
- `$A_SOCIETY_TOOLING_INVOCATION` — current invocation contract
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — current coupling records for Component 3

---

## Scope

**In scope:** Schema change to Component 3 to allow `human-collaborative` as an optional node field; companion changes to any other component the TA identifies as required.

**Out of scope:** Changes to `$INSTRUCTION_WORKFLOW_GRAPH` (the general instruction for workflow graphs) — if the instruction needs updating to document `human-collaborative` as a valid field, flag it as a follow-on but do not include it in this advisory scope.

---

## Output Format

Return an advisory artifact with:
1. Proposed schema definition for `human-collaborative` (field type, allowed values, required/optional)
2. Component 3 implementation scope (where the change goes, affected tests, new tests needed)
3. Companion component assessment (Component 4 and others)
4. Invocation contract impact (yes/no; if yes, describe changes)
5. Any open questions the TA cannot resolve from existing documentation

---

## TA Confirmation Required

Before beginning the advisory, the TA must acknowledge in the session:

> "Advisory request acknowledged. Beginning Component 3 schema assessment for human-collaborative."
