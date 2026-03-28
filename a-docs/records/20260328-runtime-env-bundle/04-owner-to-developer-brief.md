**Subject:** runtime-env-bundle — Phase 0 gate approved; Developer implementation brief
**Status:** APPROVED — implementation may begin
**Date:** 2026-03-28

---

## Phase 0 Gate Decision

TA advisory `03-ta-phase0-advisory.md` reviewed and approved. Decisions:

- **Item 3 (synthesisRole):** Option A accepted — `process.env.SYNTHESIS_ROLE ?? 'Curator'`. Rationale confirmed: synthesis role is deployment-level configuration; env-var approach is consistent with the existing runtime config model; dotenv (Item 1) eliminates the operator burden concern.
- **Flag 1 (INVOCATION.md inaccuracies):** In scope for this flow. The Developer corrects all three inaccuracies in the same pass as the Item 4 additions.
- **Flag 2 (dotenv version):** Addressed in the advisory — use `"dotenv": "^16.0.0"` or current stable in `package.json`.

No proposal artifact is required before implementation begins. This flow has no Proposal phase — the TA advisory serves as the design specification and this approval is the implementation gate.

---

## Implementation Scope

**Files Changed:**

| Target | Action |
|---|---|
| `runtime/package.json` | Modify — add `"dotenv": "^16.0.0"` to `dependencies` |
| `runtime/src/cli.ts` | Modify — add `import 'dotenv/config'` as the first statement, before all other imports |
| `runtime/.env.sample` | Create — document all env vars with placeholder values and one-line comments |
| `runtime/.gitignore` | Modify — add `.env` entry |
| `runtime/src/providers/anthropic.ts` | Modify — add catch-block guard (Item 2) |
| `runtime/src/providers/openai-compatible.ts` | Modify — add catch-block guard (Item 2) |
| `runtime/src/triggers.ts` | Modify — synthesisRole parameterization (Item 3) |
| `runtime/INVOCATION.md` | Modify — three additions (orient, provider config, .env) plus three inaccuracy corrections (Flag 1) |

---

## Per-Item Implementation Specification

### Item 1 — dotenv support

1. In `runtime/package.json`: add `"dotenv": "^16.0.0"` to the `dependencies` object (alongside `@anthropic-ai/sdk`, `@inquirer/prompts`, `js-yaml`, `openai`). Run `npm install` to update `package-lock.json`.
2. In `runtime/src/cli.ts`: add `import 'dotenv/config'` as the **first line of the file**, before the current first import (`import { SessionStore } from './store.js'`).
3. Create `runtime/.env.sample` documenting all env vars the runtime reads. Required entries:
   - `ANTHROPIC_API_KEY` — required when using the Anthropic provider; your Anthropic API key
   - `ANTHROPIC_MODEL` — optional; Anthropic model override (default: `claude-3-5-sonnet-20241022`)
   - `LLM_PROVIDER` — optional; provider selector (`anthropic` | `openai-compatible`, default: `anthropic`)
   - `OPENAI_COMPAT_BASE_URL` — required when `LLM_PROVIDER=openai-compatible`; provider base URL
   - `OPENAI_COMPAT_API_KEY` — optional; API key for the OpenAI-compatible provider
   - `OPENAI_COMPAT_MODEL` — optional; model name for the OpenAI-compatible provider (default: `mistralai/Mistral-7B-Instruct-v0.3`)
   - `SYNTHESIS_ROLE` — optional; the synthesis role name passed to the Backward Pass Orderer at forward pass closure (default: `Curator`)
4. In `runtime/.gitignore`: add `.env` on a new line (current content: `node_modules/`).

### Item 2 — Provider catch-block fix

**In `runtime/src/providers/anthropic.ts`:**

Add as the **first line of the outer `catch` block** (the `catch (err: any)` block currently at line 113), before the `instanceof Anthropic.AuthenticationError` check:

```typescript
if (err instanceof LLMGatewayError) throw err;
```

**In `runtime/src/providers/openai-compatible.ts`:**

Add as the **first line of the outer `catch` block** (the `catch (err: any)` block currently at line 116), before the `instanceof OpenAI.AuthenticationError` check:

```typescript
if (err instanceof LLMGatewayError) throw err;
```

No other changes to either file.

### Item 3 — synthesisRole parameterization

**In `runtime/src/triggers.ts`, the `TERMINAL_FORWARD_PASS` branch:**

Replace:
```typescript
} else if (event === 'TERMINAL_FORWARD_PASS') {
  triggerRecord.toolComponent = 'Backward Pass Orderer';
  orderWithPromptsFromFile(flowRun.recordFolderPath, 'Curator');
  triggerRecord.resultSummary = `Component 4 execution success: Computed backward traversal order`;
  triggerRecord.success = true;
```

With:
```typescript
} else if (event === 'TERMINAL_FORWARD_PASS') {
  triggerRecord.toolComponent = 'Backward Pass Orderer';
  const synthesisRole = process.env.SYNTHESIS_ROLE ?? 'Curator';
  orderWithPromptsFromFile(flowRun.recordFolderPath, synthesisRole);
  triggerRecord.resultSummary = `Component 4 execution success: Computed backward traversal order (synthesisRole=${synthesisRole})`;
  triggerRecord.success = true;
```

No changes to the `evaluateAndTrigger` function signature. No new imports required. No changes to callers.

### Item 4 — INVOCATION.md update

The Developer authors all additions and corrections in a single pass. The current `runtime/INVOCATION.md` requires:

**Corrections (Flag 1):**

1. **`start-flow` signature:** Current documented signature omits `<projectRoot>`. Correct to: `tsx src/cli.ts start-flow <projectRoot> <workflowDocumentPath> <recordFolderPath> <startingRole> <startingArtifactPath>`. Update the Arguments list to include `<projectRoot>` as the first argument: the root directory of the project being orchestrated.
2. **`resume-flow` signature:** Current documented signature is `tsx src/cli.ts resume-flow <recordFolderPath> [humanInput]`. Correct to: `tsx src/cli.ts resume-flow <roleKey> <activeArtifactPath> [humanInput]`. Update the Arguments list accordingly — `<roleKey>` is the role to resume as, `<activeArtifactPath>` is the artifact to hand to the resuming role.
3. **`flow-status` signature:** Current documented signature includes `<recordFolderPath>`. Correct to: `tsx src/cli.ts flow-status` (no arguments). Remove the `<recordFolderPath>` argument from both the Usage line and any Arguments section.

**Additions:**

4. **`orient` command:** Add a new command section after `flow-status`. Usage: `tsx src/cli.ts orient <workspaceRoot> <roleKey>`. Arguments: `<workspaceRoot>` — absolute path to the workspace root for file tool sandboxing; `<roleKey>` — the key identifying the role context to load from the role context registry.
5. **Provider configuration section:** Add a section (after the Required Environment section or as a sub-section within it) documenting the full set of env vars: `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OPENAI_COMPAT_BASE_URL` (required for openai-compatible), `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`. Include example configurations for Anthropic (default) and one OpenAI-compatible endpoint.
6. **`.env` file usage section:** Add a section documenting that env vars may be persisted in `runtime/.env` (loaded automatically at startup). How to create: copy `runtime/.env.sample` and populate. Note that `.env` is gitignored and must not be committed. List the full var set including `SYNTHESIS_ROLE`.

---

## Integration Validation

After implementing all items, run the following end-to-end checks before filing the integration test record:

1. **dotenv loading:** Confirm that `ANTHROPIC_API_KEY` (or `LLM_PROVIDER` + provider vars) set only in `runtime/.env` (not in shell environment) are picked up correctly when running a CLI command.
2. **Catch-block fix:** Confirm that a classified `LLMGatewayError` (e.g., `PROVIDER_MALFORMED`) thrown inside a provider's `try` block emerges from the outer catch with its original code, not re-classified as `UNKNOWN`. A unit-level check against the catch block logic is sufficient.
3. **synthesisRole parameterization:** Confirm that with `SYNTHESIS_ROLE` unset, `orderWithPromptsFromFile` is called with `'Curator'`; with `SYNTHESIS_ROLE=TestRole`, it is called with `'TestRole'`. Verify the trigger record `resultSummary` includes the resolved role name.
4. **INVOCATION.md:** Verify that all three corrected command signatures match the actual `cli.ts` argument handling. Verify all three new sections are present.

---

## Open Questions

None. The advisory is fully specified. No Developer judgment calls are required.

---

## Gate Condition

Return to Owner when implementation is complete and integration validation passes. File the integration test record as the next sequenced artifact in the record folder before returning.

---

## Developer Confirmation Required

Before beginning implementation, the Developer must acknowledge:

> "Brief acknowledged. Beginning implementation for runtime-env-bundle."
