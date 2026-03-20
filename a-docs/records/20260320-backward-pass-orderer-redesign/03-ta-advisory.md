---
**Subject:** Component 4 Backward Pass Orderer — interface redesign advisory
**Role:** Technical Architect
**Status:** Awaiting Owner approval
**Date:** 2026-03-20
**Companion brief:** `02-owner-to-ta-brief.md`

---

## Scope Confirmation

This advisory resolves the four open questions from the brief:

1. `workflow.md` YAML schema — exact field names, value format, additional fields
2. Synthesis role determination — how Component 4 identifies the synthesis role without a caller-supplied parameter
3. `orderWithPromptsFromFile` as primary entry point — what is public, what becomes internal
4. Post-Phase-6 routing — which governance path applies to this modification

It also covers the coupling gap assessment the brief requires (`$A_SOCIETY_TOOLING_COUPLING_MAP` check).

This advisory does not cover: documentation changes to the improvement protocol, records convention, or general library — those belong to the Curator's documentation proposal.

---

## Q1: `workflow.md` Schema

**Recommendation: structured YAML frontmatter with explicit `role` and `phase` sub-fields per path entry, plus a top-level `synthesis_role` field.**

```yaml
---
workflow:
  synthesis_role: Curator
  path:
    - role: Owner
      phase: Intake
    - role: Curator
      phase: Phase 1
    - role: Owner
      phase: Review
---
```

**Field specification:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `workflow.synthesis_role` | string | yes | The role that performs backward pass synthesis. See Q2. |
| `workflow.path` | list | yes | Ordered list of all role/phase pairs in this flow's forward pass, in sequence order. |
| `workflow.path[].role` | string | yes | The role name. Must match the role name used in trigger prompts. |
| `workflow.path[].phase` | string | yes | The phase name. Not used by Component 4's algorithm; present for human readability and future component use. |

**Rationale:**

- Structured sub-fields (`role`, `phase`) are more reliable to parse than a combined string. The alternative — a single string `"Owner - Intake"` — requires splitting on a delimiter and is fragile if role or phase names contain a dash.
- `phase` is included even though Component 4's algorithm ignores it. It is cheap to carry, provides orientation for agents reading the file, and preserves optionality for future components that may care about phase-level granularity.
- `synthesis_role` is a top-level field on `workflow`, not a flag on individual path entries. This is cleaner than marking one entry `is_synthesis: true` and avoids requiring Component 4 to scan the list for a flag.

**What Component 4 reads from this file:**

- `workflow.synthesis_role` — to append the synthesis entry at the end of the backward pass plan
- `workflow.path[].role` — to derive the forward-pass role sequence and compute the backward traversal order
- `workflow.path[].phase` — not parsed by Component 4; left for human and future use

---

## Q2: Synthesis Role Determination

**Recommendation: read from `workflow.md` as `workflow.synthesis_role`. Do not pass as a caller parameter. Do not infer by convention.**

The `synthesis_role` field declared in `workflow.md` (see Q1) is the mechanism. `orderWithPromptsFromFile` reads it from the file alongside the path. No caller-supplied parameter is needed. No convention inference (e.g., "last unique role") is applied.

**Why not option (b) — last unique role convention:**

The last unique role in the path is the role that appeared first in the forward pass, placing it last in the reversed order. In A-Society's own workflow this coincides with the synthesis role. But coincidence is not a rule. A workflow where the Owner appears first in the forward pass would produce Owner as the last reversed entry — making Owner the inferred synthesis role, which is incorrect. The synthesis role is a design decision about the flow, not a derivable property of traversal order.

**Why not a caller-supplied parameter:**

If synthesis role is passed at invocation time rather than embedded in `workflow.md`, an agent invoking the tool must know the synthesis role at call time and supply it correctly. This reintroduces agent judgment at the invocation site. Embedding in `workflow.md` moves the declaration to the Owner who writes the file at intake — the right place for a design decision about this flow — and makes `orderWithPromptsFromFile` fully self-contained from a record folder path alone.

---

## Q3: `orderWithPromptsFromFile` as Primary Entry Point

**Recommendation: `orderWithPromptsFromFile` is the sole agent-facing public API. `computeBackwardPassOrder` remains exported for unit testing. `generateTriggerPrompts` is eliminated as a standalone function.**

**Public exports:**

```typescript
// Output types
export interface BackwardPassEntry {
  role: string;
  stepType: 'meta-analysis' | 'synthesis';
  sessionInstruction: 'existing-session' | 'new-session';
  prompt: string;
}

export type BackwardPassPlan = BackwardPassEntry[];

// Primary public entry point
// Reads workflow.md from recordFolderPath, returns the full enriched backward pass plan.
export function orderWithPromptsFromFile(recordFolderPath: string): BackwardPassPlan;

// Exported for unit testing; not the agent-facing API.
// Takes the parsed path list and synthesis role; returns the enriched order without file I/O.
export function computeBackwardPassOrder(
  path: WorkflowPathEntry[],
  synthesisRole: string
): BackwardPassEntry[];
```

**Input types (internal, but exported for testing):**

```typescript
export interface WorkflowPathEntry {
  role: string;
  phase: string;
}

export interface RecordWorkflowFrontmatter {
  workflow: {
    synthesis_role: string;
    path: WorkflowPathEntry[];
  };
}
```

**What is eliminated:**

- The `BackwardPassOrderer` interface (object with two methods) — replaced by module-level exported functions
- `generateTriggerPrompts` as a standalone exported function — prompt generation is internal to `orderWithPromptsFromFile` and `computeBackwardPassOrder`
- The `WorkflowGraph`, `WorkflowGraphNode`, `WorkflowGraphEdge` types — Component 4 no longer reads the Component 3 format
- The `synthesisRole` parameter on `generateTriggerPrompts` — eliminated entirely; the role is read from `workflow.md`

**Rationale:**

Embedding the prompt in `BackwardPassEntry` rather than returning a separate `Record<string, string>` solves the duplicate-role collision. When a role appears twice — once as `meta-analysis` and once as `synthesis` — two entries exist in the array, each with its own prompt. A `Record<string, string>` keyed by role name cannot represent this without an awkward compound key.

`computeBackwardPassOrder` remains exported because it is the pure-algorithmic core. Unit tests that want to verify the deduplication and reversal logic should not need to touch the filesystem. Keeping it exported preserves testability without exposing it as an agent-facing API.

---

## Q4: Post-Phase-6 Routing

**Recommendation: simplified TA-advisory + Developer path, with explicit Owner approval of this advisory before the Developer session opens.**

**Rationale:**

The Post-Phase-6 protocol in `$A_SOCIETY_TOOLING_ADDENDUM` governs **new component additions** after the original launch. This is a modification to an existing component. The four gate conditions from the addendum apply selectively:

| Condition | Applies? | Assessment |
|---|---|---|
| (a) Tooling Developer role document — updated or confirmed | Confirm only | Component 4 is within existing scope; no update needed |
| (b) `$A_SOCIETY_ARCHITECTURE` — updated if system overview changes | Minor update needed | The architecture table describes Component 4 as reading the workflow graph; it must be updated to reflect the new input source (`workflow.md` in record folder). This is a documentation update, not a structural change. |
| (c) `$GENERAL_MANIFEST` — updated if new component creates/reads `a-docs/` files at scaffold time | Does not apply | Component 4 reads `workflow.md` at backward pass time, not at scaffold time |
| (d) Naming convention parsing contract — updated if new path pattern | Does not apply | `workflow.md` is not a path this tool discovers by naming convention; it is located by a record folder path supplied at invocation |

**Approved path:**

> TA advisory (this document) → Owner approves → Developer implements → Coupling map updated (Phase 7 Registration as Type C change)

The architecture document update (condition b) is part of the Curator's documentation proposal in the next step, not a pre-condition that blocks the Developer. The Developer may begin once Owner approves this advisory. The Curator's documentation proposal and the Developer's implementation may proceed in parallel, with coupling map registration happening after both complete.

---

## Coupling Gap Assessment

**Check: does `workflow.md` introduce a coupling gap with any other component?**

No coupling gap. `workflow.md` is a record-folder artifact read only by Component 4. No other component reads or writes it. Component 3 (Workflow Graph Validator) validates the canonical workflow graph format in permanent workflow files — it does not validate record-folder instance files. These are categorically different artifacts.

**Changes required to the coupling map (`$A_SOCIETY_TOOLING_COUPLING_MAP`):**

*Format dependency table:*

1. **Remove Component 4 from the WorkflowGraph schema row.** The current row records that the workflow graph YAML frontmatter schema is a format dependency for both Component 3 (Workflow Graph Validator) and Component 4. After this redesign, Component 4 no longer reads that format. Component 3 remains on that row; Component 4 is removed.

2. **Add a new row for Component 4's new dependency.** The `workflow.md` schema in the record folder is a co-maintenance dependency:

   | `general/` or `[a-docs]` element | Format dependency | Component |
   |---|---|---|
   | `workflow.md` YAML frontmatter schema in record folder `[a-docs]`: `workflow.synthesis_role` (string), `workflow.path[].role` (string), `workflow.path[].phase` (string) | Yes | Component 4: Backward Pass Orderer |

   This is an `[a-docs]` dependency — it is not a `general/` format. Authoring rules for `workflow.md` belong in the documentation layer (Curator's scope). If those rules change the field names or structure of `workflow.md`, Component 4 must be updated to match.

**Open Type A follow-up (2026-03-19) — superseded:**

The coupling map currently records an open follow-up: Components 3 and 4 require implementation alignment with the simplified workflow graph schema (nodes-and-edges only, per `$INSTRUCTION_WORKFLOW_GRAPH`). This advisory supersedes that follow-up for Component 4. Component 4 is redesigned with a different input source entirely; the workflow graph schema is no longer its concern. The Type A follow-up remains open for Component 3 only. The coupling map annotation should be updated to reflect this when Component 4's implementation is registered.

*Invocation status table:*

The row for `$GENERAL_IMPROVEMENT` (backward pass context) / Component 4 is currently Closed. The interface change (output type, entry point name) is a Type C change. `$A_SOCIETY_TOOLING_INVOCATION` must be updated by the Developer after implementation. Invocation status remains Closed after the update; this is not a new invocation gap.

---

## Algorithm — No Change

The core algorithm is confirmed correct and unchanged:

1. Iterate `workflow.path` entries sequentially
2. Deduplicate by first occurrence of each `role` value
3. Reverse the deduplicated list → backward pass traversal order
4. For each role in traversal order: `stepType = 'meta-analysis'`, `sessionInstruction = 'existing-session'`
5. Append one final entry for `synthesis_role`: `stepType = 'synthesis'`, `sessionInstruction = 'new-session'`

When the synthesis role also appeared in the traversal (step 4), it appears twice in the output — once as `meta-analysis` at its reversed position, once as `synthesis` appended last. This is correct.

---

## Developer Scope

The Developer modifies `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` (`/a-society/tooling/src/backward-pass-orderer.ts`):

1. **Remove:** `WorkflowGraph`, `WorkflowGraphNode`, `WorkflowGraphEdge`, `BackwardPassOrderer` types and the `backwardPassOrderer` object
2. **Add:** `WorkflowPathEntry`, `RecordWorkflowFrontmatter`, `BackwardPassEntry`, `BackwardPassPlan` types
3. **Replace `computeBackwardPassOrder`:** New signature `(path: WorkflowPathEntry[], synthesisRole: string): BackwardPassEntry[]`. Algorithm is unchanged (deduplicate first occurrences, reverse, append synthesis). Returns enriched entries with `stepType`, `sessionInstruction`, and `prompt` fields; prompt generation is now internal to this function.
4. **Remove `generateTriggerPrompts`:** Eliminated. Prompt generation is internal.
5. **Add `orderWithPromptsFromFile`:** New primary public entry point. Signature: `(recordFolderPath: string): BackwardPassPlan`. Reads `workflow.md` from the record folder, parses YAML frontmatter, calls `computeBackwardPassOrder`, returns the result.
6. **Update `$A_SOCIETY_TOOLING_INVOCATION`:** Reflect new entry point name, signature, and output format (Type C update).

No other tooling files are in scope for this modification.

---

## Handoff

This advisory is ready for Owner approval.

**If approved:** Switch to the Tooling Developer's existing session (or open a new one if the criteria in `$A_SOCIETY_WORKFLOW_TOOLING_DEV` apply).

```
Next action: Implement Component 4 interface redesign per TA advisory
Read: a-society/a-docs/records/20260320-backward-pass-orderer-redesign/03-ta-advisory.md
Expected response: Updated backward-pass-orderer.ts and INVOCATION.md; report any deviations before proceeding
```

The Curator's documentation proposal (improvement protocol, records convention, general library authoring rules for `workflow.md`) may proceed in parallel with the Developer's implementation. Coupling map registration (Phase 7) happens after both are complete.
