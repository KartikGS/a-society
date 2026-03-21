---
**Subject:** TA Advisory: Component 3 schema update for `human-collaborative`
**Status:** READY FOR OWNER REVIEW
**Date:** 2026-03-21
---

## 1) Proposed Schema Definition

### Recommendation

Add `human-collaborative` as an **optional node-level field** in Component 3's workflow graph schema.

- **Field location:** `workflow.nodes[].human-collaborative`
- **Field type:** string
- **Required/optional:** optional
- **Allowed values:** any non-empty, trimmed string (no closed enum)

### Rationale

From `$INSTRUCTION_WORKFLOW`, the field value is explicitly described as a brief phrase with examples (`direction`, `decision`, `content`, `approval`, "or similar"). That wording indicates an open vocabulary, not a fixed finite set. Enforcing an enum in Component 3 would over-constrain documented semantics.

The same instruction defines this concept as part of the phase/node contract ("Human-collaborative (when applicable)"), so placement is node-level, not edge-level or workflow-level.

### Scope note on structural rule

`$INSTRUCTION_WORKFLOW` states that Phase 1 always carries `Human-collaborative`. Component 3 currently validates structural schema only (shape/types), not semantic phase-order policy. This advisory keeps that boundary and does **not** add Phase 1 rule enforcement to Component 3.

---

## 2) Component 3 Implementation Scope

Target file: `a-society/tooling/src/workflow-graph-validator.ts`

### Change points

1. **Type surface**
   - Extend `WorkflowNode` interface:
     - `human-collaborative?: string`

2. **Allowed keys enforcement**
   - In node key validation, allow `human-collaborative` in addition to `id` and `role`.

3. **Field validation**
   - If `human-collaborative` is present:
     - must be a string
     - must be non-empty after trim

### Existing tests potentially affected

Target test file: `a-society/tooling/test/workflow-graph-validator.test.ts`

- **Likely unaffected:** all existing tests should remain valid.
- **Specifically check:** "extra keys on node produces error" should continue to fail for unknown keys (e.g., `invalid`) after adding a new allowed key.

### New tests required

Add at least these unit tests:

1. **Valid node with `human-collaborative`**
   - `{ id, role, 'human-collaborative': 'direction' }` passes.

2. **Non-string value rejected**
   - numeric/boolean/object value produces type error.

3. **Empty/whitespace value rejected**
   - `''` or `'   '` produces non-empty-string error.

4. **No regression on unknown keys**
   - unknown node keys still fail.

5. **Live workflow compatibility**
   - Existing live workflow without field still passes (backward compatibility).

---

## 3) Companion Component Assessment

### Component 4 (Backward Pass Orderer)

No companion implementation change required.

- Component 4 reads record-folder `workflow.md` schema:
  - `workflow.synthesis_role`
  - `workflow.path[].role`
  - `workflow.path[].phase`
- It does not consume Component 3 graph frontmatter or node metadata from `workflow/main.md`.
- `human-collaborative` semantics do not affect traversal algorithm in Component 4's current design.

### Other consumers

- **Component 3 tests:** requires updates described above.
- **No other runtime component** currently parses Component 3 node fields.

---

## 4) Invocation Contract Impact

### Impact determination

**Yes, minor contract expansion.**

- Inputs accepted by Component 3 are expanded to allow optional `workflow.nodes[].human-collaborative`.
- Outputs and exit-code behavior are unchanged.

### Required documentation updates

1. **`$A_SOCIETY_TOOLING_INVOCATION`** (`a-society/tooling/INVOCATION.md`)
   - Update Component 3 schema snippet to include optional `human-collaborative`.
   - Clarify validation rule: optional, non-empty string when present.

2. **`$A_SOCIETY_TOOLING_COUPLING_MAP`** (`a-society/a-docs/tooling/general-coupling-map.md`)
   - Update Component 3 format-dependency row to reflect schema now includes optional `workflow.nodes[].human-collaborative`.

---

## 5) Open Questions / Follow-on Dependencies

1. **Instruction sync gap (follow-on outside this advisory scope):**
   - The brief marks `$INSTRUCTION_WORKFLOW_GRAPH` as out-of-scope for this advisory's implementation package.
   - Current instruction schema does not list `workflow.nodes[].human-collaborative`.
   - If Component 3 is updated first, there will be a temporary doc/tool mismatch.
   - Follow-on should update `$INSTRUCTION_WORKFLOW_GRAPH` to preserve spec parity.

2. **Policy boundary confirmation:**
   - Confirm Owner intent that Component 3 remains schema-only and does not enforce the Phase 1 human-collaborative requirement from `$INSTRUCTION_WORKFLOW`.
   - If Owner wants that semantic rule enforced, that is a separate validator-scope expansion decision.

---

## Owner Review Request

Please review and decide:

1. Approve optional node-level string schema (`workflow.nodes[].human-collaborative`) with open vocabulary.
2. Confirm Component 3 remains schema-shape validator (no Phase 1 semantic enforcement).
3. Approve the follow-on registration/docs updates to invocation and coupling map during implementation registration.

