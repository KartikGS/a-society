---
**Subject:** Component 4 Backward Pass Orderer — implementation review
**Role:** Technical Architect
**Status:** MATCHES SPEC — no escalation required
**Date:** 2026-03-20
**Advisory assessed against:** `03-ta-advisory.md`
**Owner decision:** `04-owner-decision.md`

---

## Verdict

Implementation matches the approved advisory. No deviations. No items requiring Owner escalation.

---

## Review: Type Signatures

**Specified:**

```typescript
export interface WorkflowPathEntry { role: string; phase: string; }
export interface RecordWorkflowFrontmatter { workflow: { synthesis_role: string; path: WorkflowPathEntry[]; }; }
export interface BackwardPassEntry { role: string; stepType: 'meta-analysis' | 'synthesis'; sessionInstruction: 'existing-session' | 'new-session'; prompt: string; }
export type BackwardPassPlan = BackwardPassEntry[];
export function orderWithPromptsFromFile(recordFolderPath: string): BackwardPassPlan;
export function computeBackwardPassOrder(path: WorkflowPathEntry[], synthesisRole: string): BackwardPassEntry[];
```

**Implemented:** All four types are exported. Both functions are exported. Return type on `computeBackwardPassOrder` is `BackwardPassPlan` rather than `BackwardPassEntry[]` — these are the same type; the alias is correct.

**Eliminated as specified:** `WorkflowGraph`, `WorkflowGraphNode`, `WorkflowGraphEdge`, `BackwardPassOrderer` interface, `backwardPassOrderer` object, `generateTriggerPrompts`. All removed. ✓

**Implementation details within developer discretion:**
- `computeBackwardPassOrder`'s parameter is named `pathEntries` instead of `path` — avoids shadowing the imported `node:path` module. Not a spec item.
- `parseRecordWorkflowFrontmatter` and the two prompt builder functions are internal (not exported). ✓

---

## Review: Algorithm

Trace against the two-role test case (`Owner → Curator → Curator → Owner`, synthesis: `Curator`):

1. Iterate path entries; keep first occurrence of each role → `[Owner, Curator]`
2. Reverse → `[Curator, Owner]`
3. `totalSteps = 2 + 1 = 3`
4. Entry 0 (Curator, i=0): `meta-analysis`, `existing-session`, handoff → `Owner`
5. Entry 1 (Owner, i=1): `meta-analysis`, `existing-session`, handoff → `Curator (synthesis)`
6. Append: Curator, `synthesis`, `new-session`, position 3 of 3

Result: `[Curator/meta, Owner/meta, Curator/synthesis]` — matches advisory spec. ✓

Duplicate-role case (synthesis role appearing twice in output): algorithm produces two entries for Curator as required. ✓

No invocation restriction (multi-role gate eliminated): `orderWithPromptsFromFile` accepts any non-empty path list. ✓

---

## Review: Prompt Content

Owner approval note directed the Developer to follow the existing prompt structure. Assessment:

**meta-analysis entries:**
- Role identification line ✓
- `backward pass findings review` language ✓
- `Backward pass position: N of total` ✓
- Record folder read instruction + handoff to next role ✓
- Last meta-analysis entry appends `(synthesis)` to handoff when next is synthesis ✓

**synthesis entry:**
- Role identification line ✓
- `backward pass synthesis (position N of total — final step)` ✓
- `Read all findings artifacts in the record folder` instruction ✓

One cosmetic discrepancy: the old implementation used an em-dash (`—`) in the synthesis position line; the new implementation uses a hyphen-dash (`-`). Not a spec item; prompt template wording was delegated to the Developer per the Owner's approval note.

---

## Review: `workflow.md` Schema

Advisory specified:
```yaml
workflow:
  synthesis_role: <string, required>
  path:
    - role: <string, required>
      phase: <string, required>
```

INVOCATION.md and both test files use exactly this schema. `parseRecordWorkflowFrontmatter` validates all required fields and throws with descriptive messages on missing or empty values. ✓

`phase` is validated as a required non-empty string, consistent with the advisory (`phase` required for readability, not used by algorithm). ✓

---

## Review: `orderWithPromptsFromFile`

Reads `workflow.md` from `path.join(recordFolderPath, 'workflow.md')`. ✓

Error handling:
- File unreadable → throws with path and OS error message ✓
- No frontmatter → throws ✓
- Invalid YAML → throws with parse error ✓
- Missing/invalid fields → throws via `parseRecordWorkflowFrontmatter` ✓

Fully self-contained from a record folder path; caller supplies nothing else. ✓

---

## Review: INVOCATION.md (Type C update)

Component 4 section reflects the new design:
- Entry point changed from `WorkflowGraph`-based to `orderWithPromptsFromFile(recordFolderPath)` ✓
- `computeBackwardPassOrder` documented as lower-level entry point for testing ✓
- `workflow.md` schema shown with full YAML example ✓
- Output type documented: `Array<{role, stepType, sessionInstruction, prompt}>` ✓
- Algorithm described: deduplicate first occurrences, reverse, append synthesis ✓
- `synthesis_role` sourced from file, not from caller ✓

No reference to old `WorkflowGraph` input or `synthesisRole` parameter. ✓

---

## Review: Tests

**Unit tests (`backward-pass-orderer.test.ts`):**
- Two-role reversal + synthesis append ✓
- Four-role order: `[Curator, TA, Tooling Developer, Owner, Curator]` ✓ — confirms Owner second-to-last in traversal, synthesis appended
- Prompt content patterns (findings language, handoff language, synthesis language) ✓
- `orderWithPromptsFromFile` round-trip from temp file ✓

**Integration test (`integration.test.ts`):**
- Backward Pass Orderer invoked from a temp `RECORD_FOLDER` with `workflow.md` written in-test ✓
- Last entry is `synthesis` / `new-session` ✓
- All prior entries are `meta-analysis` / `existing-session` ✓

Test coverage is sufficient for the algorithm and the file I/O path.

---

## Coupling Map Follow-up (Curator scope — already assigned)

The following Phase 7 Registration items are required and are in scope for the Curator's documentation proposal (tracks 05–07). They are not Developer deviations; they are standing post-implementation obligations.

1. **Remove Component 4 from the WorkflowGraph schema row.** The row currently lists both Component 3 and Component 4 as dependents of the workflow graph YAML frontmatter schema. Component 4 no longer reads that format. Component 3 remains; Component 4 is removed.

2. **Add new `[a-docs]` row for Component 4's `workflow.md` dependency:**

   > `workflow.md` YAML frontmatter schema in record folder `[a-docs]`: `workflow.synthesis_role` (string), `workflow.path[].role` (string), `workflow.path[].phase` (string) — Component 4: Backward Pass Orderer

3. **Close the open Type A follow-up (2026-03-19) for Component 4.** The note reads: "Components 3 and 4 require TA advisory + Developer follow-up to align implementation with the new schema." Component 4's follow-up is now resolved by this redesign. Component 3's follow-up remains open and is unaffected.

4. **Invocation status row:** The Type C change to Component 4's interface is registered. Invocation status remains Closed (the update to INVOCATION.md is complete). The row annotation should note the Type C update date.

---

## Assessment Summary

| Area | Status |
|---|---|
| Type signatures | Matches spec |
| Eliminated types and functions | Confirmed removed |
| Algorithm correctness | Verified |
| Prompt content | Follows Owner-approved pattern |
| `workflow.md` schema | Matches spec |
| `orderWithPromptsFromFile` entry point | Correct — self-contained from path |
| INVOCATION.md (Type C) | Updated correctly |
| Unit and integration tests | Sufficient coverage |
| Coupling map follow-up | Assigned to Curator — not a deviation |

Implementation is complete and correct. This flow may close after the Curator's documentation proposal is registered.
