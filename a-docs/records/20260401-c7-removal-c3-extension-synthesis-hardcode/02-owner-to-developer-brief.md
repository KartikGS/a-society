**Subject:** C7 removal, Component 3 structural extension, synthesis role hardcode
**Status:** BRIEFED
**Date:** 2026-04-01
**Receiving roles:** Tooling Developer (Track A), Runtime Developer (Track B)

No proposal artifact is required before implementation begins. This brief authorizes direct implementation on both tracks.

---

## Background

Three decisions reached in this Owner session:

1. **Component 7 (Plan Artifact Validator) is removed.** The plan artifact is not consumed programmatically by any downstream component. Component 7 was a protocol compliance check, not a runtime correctness gate. Artifact existence validation belongs in the orchestrator layer. The `ACTIVE_ARTIFACT` trigger that invoked it is removed with it.

2. **Component 3 (Workflow Graph Schema Validator) gains structural invariant checks behind a `strict` mode parameter.** The runtime already invokes Component 3 at flow `START` on per-flow record-folder `workflow.md` files. Two invariants must hold for per-flow graphs that are not currently enforced: Owner must be the start node; Owner must be the end node. A third check — no two directly-connected nodes may share the same role — applies universally. These are added via an optional `strict` parameter so they do not incorrectly fail validation of standing workflow documents (e.g., `runtime-development.md` begins with Technical Architect by design).

3. **Synthesis role is hardcoded as `'Curator'`.** The `SYNTHESIS_ROLE` env var always defaulted to `'Curator'` and adds unnecessary configuration surface with no actual flexibility used.

---

## Track A — Tooling Developer

**[Tooling Developer authority — implement directly]**

**Files Changed:**

| Target | Action |
|---|---|
| `tooling/src/workflow-graph-validator.ts` | extend — add `strict` parameter and structural invariant checks |
| `tooling/src/plan-artifact-validator.ts` | remove — delete the file |
| `tooling/test/plan-artifact-validator.test.ts` | remove — delete the test file |
| `tooling/test/integration.test.ts` | modify — remove any Component 7 invocations or assertions |

Produce `03a-tooling-developer-completion.md` in the record folder on completion.

### Component 3 — interface and behavior extension

Extend the public interface of `workflow-graph-validator.ts`:

```
validateWorkflowFile(filePath: string, strict?: boolean): { valid: boolean, errors: string[] }
```

The return type is unchanged — errors accumulate in the existing `errors: string[]` format.

**New behavior when `strict` is truthy:**

After existing schema validation passes, run the following two additional checks:

1. **Owner at start.** Identify the start node: the node whose `id` does not appear as the `to` field of any edge. Its `role` must equal `'Owner'`. On failure, push a descriptive string to `errors` and set `valid` to `false`.

2. **Owner at end.** Identify the end node: the node whose `id` does not appear as the `from` field of any edge. Its `role` must equal `'Owner'`. On failure, push a descriptive string to `errors` and set `valid` to `false`.

If the graph has no edges (only nodes), treat the sole node as both start and end.

**New behavior unconditionally (regardless of `strict`):**

3. **No neighboring same-role nodes.** For every edge `{ from: A, to: B }`, look up the `role` of node A and node B. If they are equal, push a descriptive error string and set `valid` to `false`. Run this check for all edges; collect all violations.

Checks 1 and 2 only run when `strict` is truthy. Check 3 always runs.

If existing schema validation fails (missing required fields, malformed structure), return immediately with the schema errors — do not run structural checks on an invalid graph.

### Component 7 — removal

Delete `tooling/src/plan-artifact-validator.ts` and `tooling/test/plan-artifact-validator.test.ts`. Remove any Component 7 invocations from `tooling/test/integration.test.ts`. No replacement.

---

## Track B — Runtime Developer

**[Runtime Developer authority — implement directly]**

**Files Changed:**

| Target | Action |
|---|---|
| `runtime/src/triggers.ts` | modify — four targeted changes listed below |
| `runtime/.env.sample` | modify — remove `SYNTHESIS_ROLE` lines |

Produce `03b-runtime-developer-completion.md` in the record folder on completion.

### Changes to `runtime/src/triggers.ts`

Four changes:

1. **Remove `validatePlanArtifact` import.** Delete the import line for `validatePlanArtifact` from `plan-artifact-validator.js`.

2. **Remove the `ACTIVE_ARTIFACT` handler.** Delete the `else if (event === 'ACTIVE_ARTIFACT' && payload.artifactPath?.endsWith('01-owner-workflow-plan.md'))` block in its entirety. If `'ACTIVE_ARTIFACT'` appears only in this handler, remove it from the `event` parameter union type as well.

3. **Hardcode synthesis role.** In the `TERMINAL_FORWARD_PASS` handler, replace:
   `const synthesisRole = process.env.SYNTHESIS_ROLE ?? 'Curator';`
   with:
   `const synthesisRole = 'Curator';`

4. **Update Component 3 invocation to strict mode.** In the `START` handler, update the `validateWorkflowFile` call to pass `strict: true` as the second argument:
   `const res = validateWorkflowFile(payload.workflowDocumentPath, true);`
   The Track A interface specification above defines the parameter signature. Implement this call regardless of whether Track A has completed — the interface is fully specified here.

### Changes to `runtime/.env.sample`

Remove the `SYNTHESIS_ROLE` comment block (the comment line and the `# SYNTHESIS_ROLE=Curator` line). If the `--- RUNTIME CONFIGURATION ---` section header becomes empty after this removal, remove the section header as well.

---

## Scope

**In scope:**
- Track A: `workflow-graph-validator.ts` extension; `plan-artifact-validator.ts` and its test file deletion; `integration.test.ts` cleanup
- Track B: four targeted changes to `triggers.ts`; `SYNTHESIS_ROLE` removal from `.env.sample`

**Out of scope for both tracks:**
- Documentation updates (`runtime/INVOCATION.md`, `tooling/INVOCATION.md`, `$A_SOCIETY_ARCHITECTURE`, `$A_SOCIETY_TOOLING_COUPLING_MAP`, `tooling-development.md`, `$A_SOCIETY_TOOLING_PROPOSAL`) — Curator scope after convergence
- Any files not named above

---

## Completion Artifacts

Each track produces a completion artifact at its pre-assigned parallel-track sequence position:
- Track A: `03a-tooling-developer-completion.md`
- Track B: `03b-runtime-developer-completion.md`

Each completion artifact should confirm: what was changed, that the implementation matches this brief, and any deviations or observations for the Owner's convergence review.

Return both completion artifacts to the Owner before proceeding.
