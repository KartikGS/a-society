# Owner → Technical Architect: Design Advisory Brief

**Subject:** Component 4 design advisory — prompt embedding, synthesis_role schema, session prompt distinction
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Advisory Scope

Three interrelated design problems with Component 4 (Backward Pass Orderer). The TA must resolve all three as a unified design. The Tooling Developer does not begin implementation until this advisory is complete and Owner-reviewed.

---

## Problem 1 — Session Prompt Distinction

**Current behavior:** `createMetaAnalysisPrompt` outputs `sessionInstruction: 'existing-session'` but begins the prompt text with `"You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md."` — the new-session orientation preamble. This is contradictory: existing sessions have already loaded context; re-orientation is both redundant and incorrect.

The user has confirmed this is a defect: existing session prompts must not contain `"You are a [role] agent. Read agents.md"`.

**Design questions for the TA:**

1. What format should existing-session meta-analysis prompts use? The Owner role doc specifies `Next action: / Read: / Expected response:` for existing-session handoffs. Should Component 4 adopt this format for meta-analysis prompts, or is a different structure warranted?
2. New-session synthesis prompts currently begin with the same `"You are the ${role} agent..."` preamble. Is this the correct form for new-session synthesis prompts after the fix, or should it be updated alongside Problem 1's resolution?

---

## Problem 2 — synthesis_role Schema Placement

**Current behavior:** `workflow.md` (the forward pass path record in each record folder) contains a `synthesis_role` field. This is a backward pass concept — who performs synthesis — embedded in a forward pass artifact. The conceptual mismatch is a design problem.

**Current schema:**

```yaml
---
workflow:
  synthesis_role: Curator
  path:
    - role: Owner
      phase: Intake
    - role: Curator
      phase: Phase 1
---
```

**Required change:** Remove `synthesis_role` from the `workflow.md` schema. Redesign how Component 4 determines the synthesis role. Downstream doc updates: `$A_SOCIETY_RECORDS` (schema spec), `$A_SOCIETY_TOOLING_PROPOSAL`, `$A_SOCIETY_TOOLING_INVOCATION`.

**Design questions for the TA:**

1. What is the replacement design? Candidate options:
   - **(a) Convention-derived:** Curator is always the synthesis role in A-Society's framework — hardcode or express as a framework-level constant in the component.
   - **(b) Path-derived:** Derive synthesis role from the path structure itself (e.g., a role marker, a dedicated `backward_pass` section in the record folder, or the last distinct role in the path).
   - **(c) Separate descriptor:** Move to a new backward-pass descriptor artifact in the record folder (separate from the forward pass `workflow.md`).
2. Does the replacement design require a new file in the record folder, a new parameter to `orderWithPromptsFromFile`, or only an internal change to the component?
3. Backward-compatibility: what should Component 4 do when it encounters a `workflow.md` that still contains `synthesis_role` (i.e., existing record folders written under the old schema)? Hard-fail, warn-and-ignore, or silently accept?

---

## Problem 3 — Prompt Embedding (Phase-Specific Instructions)

**Current behavior:** Component 4 prompts contain no reference to phase-specific instructions in `$GENERAL_IMPROVEMENT`. Meta-analysis role prompts do not direct the role to `### Meta-Analysis Phase`; the synthesis prompt does not direct the role to `### Synthesis Phase`. The result is that roles must already know to load the relevant section, or they arrive at the backward pass without clear task direction.

**Required change:** Embed phase-specific instruction references in the generated prompts:
- Meta-analysis prompts → direct the role to `### Meta-Analysis Phase` in `$GENERAL_IMPROVEMENT`
- Synthesis prompt → direct the role to `### Synthesis Phase` in `$GENERAL_IMPROVEMENT`

**After this ships:** Any directive in improvement docs to load the full improvement file at session start (upfront) can be removed — the prompt itself directs roles to the relevant section. Whether that upfront-load directive exists in `$GENERAL_IMPROVEMENT` (LIB) or only `$A_SOCIETY_IMPROVEMENT` (MAINT) is a known unknown — the TA should identify which file(s) carry it after reviewing the source.

**Design questions for the TA:**

1. What form should the embedded reference take?
   - **(a) Pointer:** `"Read ### Meta-Analysis Phase in a-society/general/improvement/main.md"` — avoids duplication; improvement to the source propagates automatically.
   - **(b) Verbatim:** embed the section content — creates duplication and a maintenance liability.
   Option (a) is preferred. The TA should confirm or propose an alternative.
2. Should the path to `$GENERAL_IMPROVEMENT` be a fixed string known to Component 4 (e.g., resolved relative to the repository root), or a new parameter to `orderWithPromptsFromFile`?
3. Do Problems 1 and 3 interact? Specifically: does the existing-session format (Problem 1's resolution) constrain how phase instructions are embedded in meta-analysis prompts?

---

## Implementation Context

**Component 4 current source:** `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`

Current prompt generation:
- `createMetaAnalysisPrompt(role, position, total, nextRole, nextStepType)` — always outputs the new-session preamble regardless of `sessionInstruction`; no phase instruction reference
- `createSynthesisPrompt(role, position, total)` — always `sessionInstruction: 'new-session'`; no phase instruction reference

Current `workflow.md` schema (record folder):
```yaml
workflow:
  synthesis_role: <string>   # backward pass concept; targeted for removal
  path:
    - role: <string>
      phase: <string>
```

Current output shape:
```ts
Array<{
  role: string;
  stepType: 'meta-analysis' | 'synthesis';
  sessionInstruction: 'existing-session' | 'new-session';
  prompt: string;
}>
```

The output shape and function signatures may change — this is within the TA's authority to specify.

---

## Advisory Output Requirements

The TA advisory must produce a binding specification covering:

1. **Session prompt formats** — the exact structural template for existing-session (meta-analysis) prompts and new-session (synthesis) prompts, including what preamble (if any) each format uses.
2. **Phase instruction embedding** — the exact form of the embedded reference to `$GENERAL_IMPROVEMENT` sections, and how the file path is resolved.
3. **synthesis_role replacement** — the chosen design, the schema change to `workflow.md`, any new artifact or parameter introduced, and backward-compatibility behavior for existing record folders.
4. **Interface changes** — any changes to `orderWithPromptsFromFile` signature, `computeBackwardPassOrder` signature, or the output shape.
5. **Files Changed** — a table listing every file the Tooling Developer will modify and every file the Curator will update post-implementation (distinguishing Developer scope from Curator scope).
6. **Upfront-load directive scope** — identify whether the directive to load improvement docs at session start appears in `$GENERAL_IMPROVEMENT` (LIB), `$A_SOCIETY_IMPROVEMENT` (MAINT), or both, and state which Curator action is appropriate for each.

---

## Return Condition

Return to Owner when the advisory covers all six output requirements above. The Owner will review before the Tooling Developer session opens.
