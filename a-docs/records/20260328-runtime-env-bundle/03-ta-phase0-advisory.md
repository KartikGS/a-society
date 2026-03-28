**Document:** Phase 0 Architecture Advisory — runtime-env-bundle
**Role:** Technical Architect
**Date:** 2026-03-28
**Status:** READY FOR OWNER REVIEW
**Artifact path:** `a-society/a-docs/records/20260328-runtime-env-bundle/03-ta-phase0-advisory.md`

---

## Briefing Acknowledgment

Brief `02-owner-to-ta-brief.md` read in full. Four items in scope. Three are confirmed mechanical. One carries a design decision — resolved below as Option A. Advisory covers all four items.

---

## §1 — Mechanical Item Confirmations

### Item 1 — dotenv support

Confirmed: no existing interface changes required. The `dotenv/config` import populates `process.env` before any module reads it; the env var names (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `LLM_PROVIDER`, `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`) remain unchanged throughout. The change is additive-only. The four-step implementation described in the brief is correct:

1. Add `dotenv` as a runtime dependency in `package.json`
2. Add `import 'dotenv/config'` as the first import in `src/cli.ts`, before all other imports
3. Create `runtime/.env.sample` documenting all current env vars (see §4 for the full var list, which now includes `SYNTHESIS_ROLE` from Item 3)
4. Add `.env` to `runtime/.gitignore`

One placement confirmation: `import 'dotenv/config'` must be the *first* statement in `cli.ts` — before `SessionStore`, `FlowOrchestrator`, and all other imports. The current first import is `import { SessionStore } from './store.js'` at line 1. The dotenv import must precede it.

### Item 2 — Provider catch-block fix

Confirmed: no interface changes required. Both `anthropic.ts` and `openai-compatible.ts` expose the same `executeTurn` signature; callers are unaffected. The fix is two lines, one per file, each at the top of the outer `catch` block. See §3 for precise placement.

Source inspection confirms the bug: in `anthropic.ts`, `LLMGatewayError('PROVIDER_MALFORMED', ...)` is thrown at line 91 inside the try block (when `stop_reason` is neither `tool_use` nor `end_turn`); the outer catch at line 113 has no `instanceof LLMGatewayError` guard, so the already-classified error falls through to the final `UNKNOWN` re-wrap. Same pattern in `openai-compatible.ts` (line 70 inside try, catch at line 116). The fix corrects both.

### Item 4 — INVOCATION.md update

Confirmed mechanical once Item 3 is resolved. The `.env` section should document:
- **Location:** `runtime/.env` (project root of the runtime directory)
- **How to create:** copy `runtime/.env.sample` and populate values
- **What it covers:** all env vars the runtime reads — `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `LLM_PROVIDER`, `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`, and `SYNTHESIS_ROLE` (from Item 3, with default `Curator`)

The Developer authors all three additions: `orient` command, provider configuration, and `.env` file usage. However, Item 4 carries an additional scope item described in §5 Flag 1 — three pre-existing command signature inaccuracies in INVOCATION.md that the Developer should correct in the same pass.

---

## §2 — Item 3 Resolution: synthesisRole Parameterization

**Decision: Option A — environment variable (`SYNTHESIS_ROLE`)**

### Rationale

**Option A is consistent with the runtime's existing configuration model.** Every configurable value in the runtime is env-based: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `LLM_PROVIDER`, `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`. Introducing `SYNTHESIS_ROLE` continues this pattern without adding a new abstraction tier.

**The synthesis role is deployment-level configuration, not workflow-level configuration.** A deployment of this runtime for a given project will use the same synthesis role for all flows run in that deployment. It is a property of how the runtime is configured for a project context — analogous to which LLM provider to use — not a property of an individual workflow document. Option B (workflow YAML frontmatter) is a category error: it treats a deployment-level concern as a per-workflow concern, requiring every workflow to declare what is actually a constant for a given deployment. This would also require a schema change to the workflow YAML frontmatter format and an update to Component 3 (Workflow Graph Schema Validator) — a disproportionate cascade for a problem that is simply "make a hardcoded string configurable."

**Option C is premature.** No other configuration need has emerged that would warrant a structured runtime config object. The existing codebase reads env vars directly at the point of use. Introducing a config layer now, for a single parameter, adds an abstraction with no current second use case. The right time to introduce a config object is when multiple configuration needs converge and direct env reads become unmanageable.

**Item 1 mitigates the operator burden concern.** After Item 1, `SYNTHESIS_ROLE=MyRole` lives in `runtime/.env` and is loaded automatically at startup — ergonomically equivalent to any other approach.

**Coupling map consultation (standing advisory obligation):** Component 4 (Backward Pass Orderer) invocation gap is **closed** (2026-03-15). No open gap to surface. Item 3 modifies `triggers.ts` (the caller) — it changes which value is passed to `orderWithPromptsFromFile`, not the interface of `orderWithPromptsFromFile` itself. This is not a Type C change; no coupling map update is required.

---

## §3 — Item 3 Full Implementation Path

The change is entirely local to `runtime/src/triggers.ts`. No other files require modification for Item 3 beyond what is noted in §1 (`.env.sample` and `INVOCATION.md` must document `SYNTHESIS_ROLE`).

**In `runtime/src/triggers.ts`, `TERMINAL_FORWARD_PASS` branch (currently lines 45–49):**

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

**Threading:** No threading through additional files. `process.env` is available in scope without an import. No new imports are required in `triggers.ts`. No changes to the `evaluateAndTrigger` function signature. No changes to callers of `evaluateAndTrigger` in `cli.ts` or elsewhere.

**`resultSummary` field specification:** The template is:

> `Component 4 execution success: Computed backward traversal order (synthesisRole=${synthesisRole})`

where `synthesisRole` is the resolved string value — either the value of `process.env.SYNTHESIS_ROLE` or the literal string `Curator` when the env var is absent. The Developer must not use a different label or omit the `synthesisRole` interpolation; the resolved role must appear in the trigger record for observability when non-default synthesis roles are in use.

---

## §4 — Files Changed

| File | Change type | What changes |
|---|---|---|
| `runtime/package.json` | Modify | Add `"dotenv": "^16.0.0"` (or current stable) to `dependencies` |
| `runtime/src/cli.ts` | Modify | Add `import 'dotenv/config'` as the first line, before all other imports |
| `runtime/.env.sample` | Create | Document all env vars: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `LLM_PROVIDER`, `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`, `SYNTHESIS_ROLE` — each with a placeholder value and a one-line comment explaining its purpose |
| `runtime/.gitignore` | Modify | Add `.env` entry |
| `runtime/src/providers/anthropic.ts` | Modify | Add `if (err instanceof LLMGatewayError) throw err;` as the first line of the outer `catch` block (currently line 113), before the `instanceof Anthropic.AuthenticationError` check |
| `runtime/src/providers/openai-compatible.ts` | Modify | Add `if (err instanceof LLMGatewayError) throw err;` as the first line of the outer `catch` block (currently line 116), before the `instanceof OpenAI.AuthenticationError` check |
| `runtime/src/triggers.ts` | Modify | In the `TERMINAL_FORWARD_PASS` branch: introduce `const synthesisRole = process.env.SYNTHESIS_ROLE ?? 'Curator'`; pass `synthesisRole` instead of `'Curator'` to `orderWithPromptsFromFile`; update `resultSummary` to include `(synthesisRole=${synthesisRole})` per §3 |
| `runtime/INVOCATION.md` | Modify | Add three new sections: `orient` command, provider configuration (env vars), `.env` file usage; correct three pre-existing command signature inaccuracies (see §5 Flag 1) |

**No new files in `a-society/tooling/` or `a-society/general/`.** All changes are local to `runtime/`. No coupling map update required (see §2 rationale).

---

## §5 — Flags to Owner

### Flag 1 — Pre-existing INVOCATION.md inaccuracies (scope decision required)

Source inspection revealed three command signatures documented in `runtime/INVOCATION.md` that do not match the current implementation in `cli.ts`. Since the Developer is already modifying INVOCATION.md for Item 4, correction in the same pass is the most efficient path — but Owner confirmation is required before the Developer treats this as in-scope.

**Inaccuracy 1 — `start-flow` missing argument.** INVOCATION.md documents: `tsx src/cli.ts start-flow <workflowDocumentPath> <recordFolderPath> <startingRole> <startingArtifactPath>` (four positional args). Actual implementation (`cli.ts:97`): `const [root, wfPath, recPath, role, artifact] = args.slice(1)` — five positional args, with `<projectRoot>` first. The documented signature omits `<projectRoot>`.

**Inaccuracy 2 — `resume-flow` wrong arguments.** INVOCATION.md documents: `tsx src/cli.ts resume-flow <recordFolderPath> [humanInput]`. Actual implementation (`cli.ts:104`): `const [role, artifact, ...rest] = args.slice(1)` — takes `<roleKey>` and `<activeArtifactPath>`, not `<recordFolderPath>`. The documented signature is incorrect.

**Inaccuracy 3 — `flow-status` spurious argument.** INVOCATION.md documents: `tsx src/cli.ts flow-status <recordFolderPath>`. Actual implementation (`cli.ts:78–91`): no arguments consumed — `flowStatus()` calls `SessionStore.init()` and `SessionStore.loadFlowRun()` with no path input. The documented `<recordFolderPath>` argument does not exist.

**Recommendation:** Include correction of all three inaccuracies in the Developer's Item 4 deliverable. These are factual errors in the same file, require no new design decisions, and leaving them uncorrected while adding new sections would leave INVOCATION.md in a partially accurate state. Owner to confirm whether this is in-scope for this flow or deferred.

### Flag 2 — dotenv version pin

The brief specifies `import 'dotenv/config'` (ESM form) without specifying a dotenv version. The Developer should use `dotenv` v16+ (the version that provides stable ESM support via `dotenv/config`). The `package.json` change should pin to `"^16.0.0"` or the current stable release — not an unversioned or pre-v16 entry.

---

## Handoff

Advisory is ready for Owner Phase 0 gate review.

**Owner needs to evaluate:**
1. Whether the Option A rationale for Item 3 is accepted
2. Whether Flag 1 (INVOCATION.md inaccuracy corrections) is in-scope for this flow or deferred to a separate flow
3. Whether any edge case or constraint not visible from the source files changes the Item 3 decision

**No open questions block the Developer** for Items 1, 2, and 4-as-documented. Item 3 implementation can begin once the Owner approves Option A. Flag 1 scope confirmation is needed before the Developer begins the INVOCATION.md portion of Item 4.
