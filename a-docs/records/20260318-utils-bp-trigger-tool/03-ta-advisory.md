**Subject:** TA Advisory — utils.ts boundary and Component 4 trigger prompt extension
**To:** Owner (Session A)
**Status:** ADVISORY COMPLETE — Awaiting Owner review
**Date:** 2026-03-18
**Record:** 20260318-utils-bp-trigger-tool

---

## 1. Correction to the Brief's Duplication Count

The brief states three components duplicate `extractFrontmatter()`. The source shows two definitions, not three:

| Component | State |
|---|---|
| `workflow-graph-validator.ts` (line 43) | Defines and **exports** `extractFrontmatter()` |
| `plan-artifact-validator.ts` (line 40) | Defines a **private** copy — identical regex |
| `backward-pass-orderer.ts` (line 3) | **Imports** from `workflow-graph-validator.ts` — no own definition |

There are two definitions. The backward-pass-orderer already delegates. This does not change the recommended action — utils.ts is still warranted — but the Developer's deduplication scope is narrower than described in the brief.

Both existing implementations use an identical regex: `/^---\r?\n([\s\S]*?)\r?\n---/`. Consolidation is clean with no behavioral divergence to resolve.

---

## 2. utils.ts: Boundary Definition

### 2a. What belongs in utils.ts

A function belongs in utils.ts if and only if all three conditions are met:

1. **Purely generic** — no component-specific logic, no domain knowledge, no imports from other tooling modules
2. **No side effects** — no file I/O, no external state access
3. **Duplicated or clearly shared** — currently exists in two or more components, or is a general primitive multiple components use

**Current qualifier: `extractFrontmatter(content: string): string | null`**

Pure string → string-or-null transformation. No dependencies. No side effects. No domain knowledge. Currently defined in two places with identical implementations. Qualifies.

**No other current candidates.** All other shared patterns across the seven component files are either standard library calls (`fs.readFileSync`, `path.resolve`, `yaml.load` — not candidates for abstraction) or component-specific logic (schema validation, domain constants, file-reading patterns). None qualify.

### 2b. What does NOT belong in utils.ts

- Functions with file I/O
- Functions with domain knowledge (backward pass logic, schema contracts, consent types)
- Functions that import from other tooling modules
- Constants specific to a component's schema contract (`COMPLEXITY_ALLOWED`, `TIER_ALLOWED`, `COMPLEXITY_AXES`, `FEEDBACK_TYPES`)
- Functions that exist in only one component (no deduplication benefit)

utils.ts is **not a general-purpose utilities bag**. A function that is "utility-like" but component-specific stays in its component file.

### 2c. Implementation specification

The Developer creates `tooling/src/utils.ts` with a single exported function:

```typescript
/**
 * Extracts YAML frontmatter from a markdown file.
 * Returns the raw YAML string between the first pair of "---" delimiters, or null
 * if no frontmatter block is found.
 */
export function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}
```

Three components require changes:

| Component | Current state | Required change |
|---|---|---|
| `workflow-graph-validator.ts` | Defines and exports `extractFrontmatter` | Import from `./utils.js`; remove own definition; remove `extractFrontmatter` from the module's exports |
| `plan-artifact-validator.ts` | Defines a private copy | Import from `./utils.js`; remove private definition |
| `backward-pass-orderer.ts` | Imports `extractFrontmatter` from `./workflow-graph-validator.js` | Update import source to `./utils.js` |

**Note on the workflow-graph-validator export removal:** `extractFrontmatter` is currently part of workflow-graph-validator's public exports, and backward-pass-orderer imports it there. Once both files import from utils.ts, workflow-graph-validator no longer needs to export it. The invocation model (agents call components via entry points, not raw module imports) means no external caller depends on this re-export. Removing it is safe.

**Test suite:** The Developer must add a unit test file for utils.ts covering `extractFrontmatter`. Existing backward-pass-orderer tests must pass unchanged after the import source update.

---

## 3. Component 4 Extension: Trigger Prompt Generator

### 3a. Module placement: new exports on backward-pass-orderer.ts

The trigger prompt generator belongs in `backward-pass-orderer.ts` as new exports — not in a new module, and not as an optional parameter on `orderFromFile`.

**Against a new module:** A separate module would depend on backward-pass-orderer for `BackwardPassEntry` and all order computation. The coupling between trigger prompts and the order is structural — `BackwardPassTriggerEntry` extends `BackwardPassEntry`. Creating a new module would split a tightly coupled unit across a module boundary without architectural benefit.

**Against an optional parameter on `orderFromFile`:** The optional parameter approach changes the return type from `BackwardPassEntry[]` to `BackwardPassTriggerEntry[]` depending on a flag, producing a union return type that callers must narrow. This is worse ergonomics than a separate named function with a stable return type.

**For new exports:** The addition is small (two interfaces, two functions). INVOCATION.md's Component 3+4 section extends naturally. The backward-pass-orderer's scope is "all outputs derived from the backward pass order" — trigger prompts are a direct derivation.

### 3b. Interfaces

```typescript
export interface TriggerPromptOptions {
  recordFolderPath?: string;  // Embedded in prompt text; receiving agent knows where to read
                              // prior artifacts and write findings. Not read by the component.
  flowName?: string;          // Human-readable description of the flow for agent context.
}

export interface BackwardPassTriggerEntry extends BackwardPassEntry {
  trigger_prompt: string;     // Copyable session-start prompt for the receiving agent.
}
```

### 3c. Function signatures

```typescript
/**
 * Generates per-role trigger prompts from a computed backward pass order.
 *
 * Pure function — performs no file I/O. The caller provides the order (from orderFromFile
 * or orderFromGraph) and optional context to embed in the prompts.
 *
 * Each entry in the input order receives a trigger_prompt field. Order is preserved.
 */
export function generateTriggerPrompts(
  order: BackwardPassEntry[],
  options?: TriggerPromptOptions
): BackwardPassTriggerEntry[];

/**
 * Reads and validates the workflow file, computes the backward pass order, and generates
 * trigger prompts — a single-call convenience wrapper.
 *
 * Equivalent to: generateTriggerPrompts(orderFromFile(filePath, firedNodeIds), options)
 */
export function orderWithPromptsFromFile(
  filePath: string,
  firedNodeIds?: string[],
  options?: TriggerPromptOptions
): BackwardPassTriggerEntry[];
```

### 3d. Trigger prompt templates

The templates use the prescribed session-start format from the A-Society handoff protocol.

Variables used in template construction:
- `role` — the role string from the `BackwardPassEntry` (used as-is; no normalization)
- `N` — `entry.backward_pass_position` (1-based)
- `total` — `order.length`
- `nextRole` — `order[N].role` for non-synthesis entries; the synthesis role's name for the last non-synthesis entry

Optional fields (`flowName`, `recordFolderPath`) are omitted from the prompt entirely if not provided — no empty lines are rendered.

**Non-synthesis role (position N of total):**

```
You are a [role] agent for A-Society. Read /a-society/a-docs/agents.md.

You are performing a backward pass findings review.

Backward pass position: [N] of [total]
Flow: [flowName]
Record folder: [recordFolderPath]

Read the prior artifacts in the record folder. Produce your findings at the next available sequence position. When complete, hand off to [nextRole][" (synthesis)" if the next entry is_synthesis else ""].
```

**Synthesis role (always the final position):**

```
You are a [role] agent for A-Society. Read /a-society/a-docs/agents.md.

You are performing backward pass synthesis (position [N] of [total] — final step).

Flow: [flowName]
Record folder: [recordFolderPath]

Read all findings artifacts in the record folder and produce the synthesis at the next available sequence position.
```

**Sufficiency check:** The receiving agent orients via agents.md and its role doc (context loading). The trigger prompt provides: identity, session type, position in sequence, flow context, record folder location, and next action. The artifact naming convention and findings template are in the role doc and improvement protocol — the receiving agent loads these through standard context loading. No additional information from the caller is required.

### 3e. Scope limits of generateTriggerPrompts

This function does not:
- Read any files. It is pure — its output is fully determined by its inputs.
- Infer the record folder from the workflow file path.
- Validate that `recordFolderPath` exists on disk.
- Produce artifact filenames or sequence numbers for the receiving agent's output (the receiving agent reads the record folder at runtime to determine the next slot).
- Embed the agents.md path as a variable — it is a fixed string matching the prescribed format.

**Test suite:** The Developer must add unit tests for `generateTriggerPrompts` and `orderWithPromptsFromFile` in `test/backward-pass-orderer.test.ts` (or a new test file if the existing file becomes unwieldy). Tests must cover: non-synthesis role prompts with and without options; synthesis role prompt; full sequence with `orderWithPromptsFromFile`; options omission behavior (no empty lines).

---

## 4. Post-Phase-6 Gate Conditions

Addressing the four conditions from `$A_SOCIETY_TOOLING_ADDENDUM` Section 4:

**(a) Tooling Developer role document: UNCHANGED**

The scope covers "implementing approved tooling components in TypeScript" within `tooling/`. Extending Component 4's public interface and creating utils.ts as an internal module are within this scope. No new component is added; no new authority is needed.

*Owner to confirm.*

**(b) Architecture component table: UPDATE NEEDED**

Component 4's current description: "Computes correct backward pass traversal order from a workflow graph."

Revised description: "Computes correct backward pass traversal order from a workflow graph and generates per-role session trigger prompts."

The Curator updates this row after Owner approval of this advisory.

`utils.ts` does **not** appear in the component table. It is an internal implementation module with no public interface. The component table records public-facing tooling components; internal modules are not entries.

**(c) Manifest: UNCHANGED**

Neither utils.ts nor the Component 4 extension creates or reads any `a-docs/` files at scaffold time. The manifest remains current.

**(d) Naming convention: UNCHANGED**

The extension does not introduce a new file path pattern for the component to parse. The `recordFolderPath` option is a string embedded in prompt text — the component does not parse it against a naming contract or read from it.

---

## 5. Binding Spec Form

The TA advisory (this document) serves as the binding specification for the Developer. No formal amendment to `$A_SOCIETY_TOOLING_PROPOSAL` is required.

**Rationale:** The addendum's Section 4 protocol established that post-Phase-6 changes are governed by TA advisory + Owner approval. This extension does not change an automation boundary determination, does not add a new top-level component, and does not alter the architecture's structural invariants. The advisory, once Owner-approved, is the Developer's binding specification.

A formal proposal amendment would be warranted only if the change altered an automation boundary determination or required a new component design section in the proposal. This extension requires neither.

*Owner to confirm.*

---

## 6. Coupling Map Assessment

This change is a **Type C** change (existing component interface changes).

Format dependency table: **no new rows required.** The trigger prompt generator uses the same workflow graph YAML frontmatter schema already tracked for Component 4. No new `general/` format parsing is introduced.

Invocation status table: **no new rows required.** Component 4's invocation gap is already closed (2026-03-15, `$GENERAL_IMPROVEMENT`). The existing row remains valid.

**Watch item:** The trigger prompt capability is a new, independently useful operation. If the Owner determines that agents should be directed to invoke `generateTriggerPrompts` or `orderWithPromptsFromFile` specifically (not just the component generally), the Curator should assess whether `$GENERAL_IMPROVEMENT`'s reference to Component 4 should name this capability. This does not re-open the invocation gap — it is a watch item for the Curator to evaluate at Phase 7.

The Curator updates the coupling map at Phase 7 to record the Type C change.

---

## 7. Advisory Summary

| Item | Determination | Action |
|---|---|---|
| Duplication count correction | 2 definitions (not 3); backward-pass-orderer already imports from workflow-graph-validator | Informational |
| utils.ts | Create with single export: `extractFrontmatter()` | Requires Owner approval |
| Other utils.ts candidates | None at this time | N/A |
| Affected components | workflow-graph-validator (remove export), plan-artifact-validator (remove private copy), backward-pass-orderer (update import source) | Developer implements |
| Component 4 placement | New exports on backward-pass-orderer.ts | Requires Owner approval |
| New interfaces | `TriggerPromptOptions`, `BackwardPassTriggerEntry` | Requires Owner approval |
| New functions | `generateTriggerPrompts`, `orderWithPromptsFromFile` | Requires Owner approval |
| Trigger prompt template | Specified in Section 3d | Requires Owner approval |
| Tooling Developer role doc | Unchanged | Owner to confirm |
| Architecture component table | Update needed — Component 4 description (Curator updates post-approval) | Owner to confirm scope |
| Manifest | Unchanged | N/A |
| Naming convention | Unchanged | N/A |
| Binding spec form | TA advisory serves as binding spec; no proposal amendment needed | Owner to confirm |
| Coupling map | Type C; no new rows; watch item noted for trigger prompt capability | Curator updates at Phase 7 |

---

## Handoff

Switch to: Owner Session A (existing session).

```
Next action: Review this advisory and issue an approval decision
Read: a-society/a-docs/records/20260318-utils-bp-trigger-tool/03-ta-advisory.md
Expected response: Owner approval or revision request; if approved, proceed to Tooling Developer session
```
