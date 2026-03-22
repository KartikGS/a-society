# Technical Architect Advisory — Component 4 Design

**Subject:** Component 4 redesign — session prompt formats, phase instruction embedding, synthesis_role removal
**Status:** Ready for Owner review
**Date:** 2026-03-22
**Responds to:** `02-owner-to-ta-brief.md`

---

## 1. Session Prompt Formats

### Existing-session (meta-analysis) prompt

No orientation preamble. The role has context loaded. Format follows the three-field handoff standard documented in the Curator role doc and the backward pass guardrails:

```
Next action: Perform your backward pass meta-analysis (step N of M).

Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in a-society/general/improvement/main.md

Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to [next role] ([next step type]).
```

Where:
- `N` = current position (1-based)
- `M` = total steps (all meta-analysis steps + the final synthesis step)
- `[next role]` = the role receiving the handoff
- `[next step type]` = `meta-analysis` or `synthesis`

### New-session (synthesis) prompt

Retains the orientation preamble — the synthesis role arrives in a fresh session. Adds a `Read:` line for the phase instruction reference:

```
You are the [role] agent for A-Society. Read a-society/a-docs/agents.md.

You are performing backward pass synthesis (step N of N — final step).

Read: all findings artifacts in the record folder, then ### Synthesis Phase in a-society/general/improvement/main.md

Produce your synthesis at the next available sequence position in the record folder.
```

Where `N` = `M` (synthesis is always the last step).

---

## 2. Phase Instruction Embedding

### Exact form of embedded references

| Step type | Embedded reference |
|---|---|
| `meta-analysis` | `### Meta-Analysis Phase in a-society/general/improvement/main.md` |
| `synthesis` | `### Synthesis Phase in a-society/general/improvement/main.md` |

Option (a) from the brief — pointer, not verbatim — is confirmed. Component 4 points the role at the relevant section; it does not reproduce section content. Improvements to the source propagate automatically.

### Path resolution

The path is a **fixed string constant** in the component source:

```ts
const GENERAL_IMPROVEMENT_PATH = 'a-society/general/improvement/main.md';
```

Component 4 does not read this file at runtime. The path appears only in generated prompt strings. If `$GENERAL_IMPROVEMENT` relocates (requires an index update), this constant must be updated in the component source. This is a co-maintenance dependency; document it as a comment above the constant.

No new parameter to `orderWithPromptsFromFile` is introduced for this purpose.

### Interaction between Problems 1 and 3

Problems 1 and 3 interact: the `Read:` field of the three-field meta-analysis format is the natural and sole location for the phase instruction reference. The two fixes compose as follows — the complete `Read:` line becomes:

```
Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in a-society/general/improvement/main.md
```

The synthesis prompt's `Read:` line similarly absorbs the phase reference. No structural tension exists between the two fixes; they resolve to a single coherent output for each step type.

---

## 3. synthesis_role Replacement

### Chosen design: required parameter to `orderWithPromptsFromFile`

`synthesis_role` is removed from `workflow.md` entirely. The calling agent supplies the synthesis role as a required second parameter to `orderWithPromptsFromFile` at invocation time.

**Rationale over the other candidates:**

- **Option (a) — convention-derived hardcode:** Encodes A-Society-specific knowledge ("always Curator") into a general component. Breaks any adopting project that uses Component 4 with a different synthesis role. Rejected.
- **Option (b) — path-derived:** Derivation from path structure is ambiguous in the general case. In A-Society's standard flow (Owner → Curator → Owner Review), the last distinct role by first-occurrence-reverse is the Owner — not the Curator. No reliable structural signal points to the synthesis role. Rejected.
- **Option (c) — separate descriptor artifact:** Introduces a new record folder file to carry a single string that the calling agent already knows from workflow context. Unnecessary artifact creation. Rejected.
- **Parameter approach:** Minimal change. No new artifacts. No derivation ambiguity. The calling agent knows the synthesis role at invocation time; in A-Society's context this is always "Curator" (a stable convention documented in `$A_SOCIETY_IMPROVEMENT`). `computeBackwardPassOrder` already accepts `synthesisRole` as a parameter — the parameter approach simply surfaces this to `orderWithPromptsFromFile`.

### New `workflow.md` schema (record folder)

```yaml
---
workflow:
  path:
    - role: <string>         # Role name (parsed by Component 4)
      phase: <string>        # Phase descriptor (human orientation; not parsed by Component 4)
---
```

`synthesis_role` field removed. All other structure unchanged.

### Backward-compatibility for existing record folders

**Accept-and-ignore.** If `workflow.md` contains `synthesis_role`, the parser does not error. `js-yaml` parses the field, but the typed interface no longer references it — no validation fires, no error is thrown. Existing record folders continue to work without modification. Document in INVOCATION.md under Component 4 Notes: "If `workflow.md` still contains `synthesis_role`, the field is silently ignored. Callers of the old `orderWithPromptsFromFile(recordFolderPath)` single-parameter signature must update their invocations to supply `synthesisRole` as the second argument."

### Bootstrapping exemption (Advisory Standards requirement)

The current flow's record folder (`20260322-component4-design-advisory`) is exempt-by-origin from the updated `workflow.md` schema. Its `workflow.md` was created under the old schema, which includes `synthesis_role`. This flow's record folder cannot conform to the post-advisory schema because it predates it.

**Consequence:** When this flow's backward pass is initiated, the Owner must acknowledge this exemption explicitly in the backward pass initiation. Two valid paths:
- If Component 4 has been updated to the new signature: invoke as `orderWithPromptsFromFile(recordFolderPath, 'Curator')`. The `synthesis_role` field in the existing `workflow.md` is silently ignored per backward-compat behavior.
- If Component 4 has not yet been updated: invoke using the old API — `orderWithPromptsFromFile(recordFolderPath)` — which reads `synthesis_role` from the existing `workflow.md` and works correctly.

In neither case does the current folder's non-conformance constitute an error. It is an expected exemption-by-origin.

---

## 4. Interface Changes

### `orderWithPromptsFromFile`

| | Signature |
|---|---|
| Old | `orderWithPromptsFromFile(recordFolderPath: string): BackwardPassPlan` |
| New | `orderWithPromptsFromFile(recordFolderPath: string, synthesisRole: string): BackwardPassPlan` |

`synthesisRole` is required. No default value.

### `computeBackwardPassOrder`

Unchanged: `computeBackwardPassOrder(pathEntries: WorkflowPathEntry[], synthesisRole: string): BackwardPassPlan`

### `RecordWorkflowFrontmatter` interface

| | |
|---|---|
| Old | `workflow: { synthesis_role: string; path: WorkflowPathEntry[] }` |
| New | `workflow: { path: WorkflowPathEntry[] }` |

`synthesis_role` removed from the interface.

### `parseRecordWorkflowFrontmatter`

Remove the `synthesis_role` validation and extraction block (lines that validate `synthesisRole` as a non-empty string and assign it to the return value). Keep `path` parsing unchanged. Return type aligns with the updated `RecordWorkflowFrontmatter`.

### `createMetaAnalysisPrompt`

Signature unchanged: `createMetaAnalysisPrompt(role, position, total, nextRole, nextStepType)`

Output changes:
- Remove `"You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md."` preamble line
- Replace freeform text with three-field format as specified in §1

### `createSynthesisPrompt`

Signature unchanged: `createSynthesisPrompt(role, position, total)`

Output changes:
- Retain `"You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md."` preamble
- Add `Read:` line referencing `### Synthesis Phase` as specified in §1

### `BackwardPassEntry` output shape

Unchanged:
```ts
{
  role: string;
  stepType: 'meta-analysis' | 'synthesis';
  sessionInstruction: 'existing-session' | 'new-session';
  prompt: string;
}
```

---

## 5. Files Changed

| File | Scope | Nature of change |
|---|---|---|
| `a-society/tooling/src/backward-pass-orderer.ts` | Developer | (1) Add `GENERAL_IMPROVEMENT_PATH` constant; (2) update `createMetaAnalysisPrompt` output to three-field format, no preamble, phase ref in `Read:` field; (3) update `createSynthesisPrompt` output to retain preamble, add phase ref `Read:` line; (4) remove `synthesis_role` from `RecordWorkflowFrontmatter` interface; (5) remove `synthesis_role` parsing from `parseRecordWorkflowFrontmatter`; (6) add `synthesisRole: string` parameter to `orderWithPromptsFromFile` and thread it to `computeBackwardPassOrder` |
| `a-society/tooling/test/backward-pass-orderer.test.ts` | Developer | Update invocations of `orderWithPromptsFromFile` to pass `synthesisRole`; update prompt content assertions to match new three-field and synthesis formats |
| `a-society/tooling/INVOCATION.md` | Curator | Update Component 4 section: new `orderWithPromptsFromFile` signature (two parameters); update `workflow.md` schema block (remove `synthesis_role`); add backward-compat note for old schema; update prompt format example |
| `a-society/a-docs/records/main.md` | Curator | Update `workflow.md` schema block and description (remove `synthesis_role` field); update the `workflow.md` note that Component 4 reads `workflow.synthesis_role` (remove — it no longer reads it) |
| `a-society/a-docs/tooling/architecture-proposal.md` | Curator | Update Component 4 spec: remove `synthesis_role` from the interface description; update `orderWithPromptsFromFile` to reflect new signature |
| `a-society/a-docs/improvement/main.md` | Curator | Update Component 4 mandate section: update invocation to `orderWithPromptsFromFile(recordFolderPath, synthesisRole)`; add note that prompts embed phase-instruction references so roles are directed to the correct section without session-start loading |
| `a-society/general/improvement/main.md` | Curator | Update tooling description under `### Backward Pass Traversal`: update invocation to reflect `synthesisRole` as second parameter; add note that generated prompts embed a phase-instruction reference directing roles to the relevant section |

---

## 6. Upfront-load Directive Scope

After reading `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT`, and the Curator role doc:

**`$GENERAL_IMPROVEMENT` (LIB):** No upfront-load directive present. The file does not instruct roles to load it at session start. The Curator role doc's context loading does not include it.

**`$A_SOCIETY_IMPROVEMENT` (MAINT):** No upfront-load directive present. The Backward Pass Protocol is in the document, but no instruction tells roles to load the document before beginning backward pass work. The Curator role doc does not list it in required reading.

**Finding:** There is no upfront-load directive to remove in either file. The concern raised in the brief was precautionary; it does not surface an actionable removal.

**Curator action — `$A_SOCIETY_IMPROVEMENT` (MAINT):** Update the Component 4 mandate section to note that generated prompts now embed a reference to the relevant improvement phase section (`### Meta-Analysis Phase` or `### Synthesis Phase`), so roles are automatically directed to the correct section. No separate session-start loading is needed or currently directed. This is a documentation update, not a removal.

**Curator action — `$GENERAL_IMPROVEMENT` (LIB):** Update the tooling description to note the same — that Component 4 prompts embed a phase-instruction reference. This aligns the library template with the actual component behavior. This is an addition to the existing tooling note, not a removal.

---

## Advisory Completeness Check

| Output requirement | Covered |
|---|---|
| 1. Session prompt formats — structural template for existing-session and new-session | §1 |
| 2. Phase instruction embedding — exact form and path resolution | §2 |
| 3. synthesis_role replacement — chosen design, schema change, backward-compat | §3 |
| 4. Interface changes — function signatures and output shape | §4 |
| 5. Files Changed — Developer scope vs. Curator scope | §5 |
| 6. Upfront-load directive scope — LIB and MAINT findings, Curator action | §6 |

---

## Handoff

This advisory is ready for Owner review.

**Artifact to review:** `a-society/a-docs/records/20260322-component4-design-advisory/03-ta-advisory.md`

**What the Owner needs to evaluate:**

1. §1 — Are the two prompt formats (existing-session three-field and new-session) the correct structural templates? Specifically: does the existing-session three-field format align with how the Owner expects agents to receive meta-analysis triggers?
2. §3 — Is the parameter-passed synthesis role (rather than convention-derived, path-derived, or separate descriptor) the right design choice? Confirm that calling agents are always in a position to know the synthesis role at invocation time.
3. §5 — Confirm that the Curator scope captures all documentation files requiring update. If any files are missing from the table, identify them before the Developer session opens.
4. §6 — Confirm that the "no upfront-load directive exists" finding is correct, or identify where such a directive lives if the Owner has observed it in a file not reviewed here.

**No open questions block implementation.** All three problems have been resolved to a unified design. The Tooling Developer can begin after Owner approval.
