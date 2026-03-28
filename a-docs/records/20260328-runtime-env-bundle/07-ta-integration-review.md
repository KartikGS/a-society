**Document:** Technical Architect Integration Review — runtime-env-bundle
**Role:** Technical Architect
**Date:** 2026-03-28
**Status:** READY FOR OWNER REVIEW
**Artifact path:** `a-society/a-docs/records/20260328-runtime-env-bundle/07-ta-integration-review.md`
**Spec:** `03-ta-phase0-advisory.md`

---

## Verdict: PASS with one minor finding

All eight spec-required file changes are correctly implemented. One unplanned file addition (two diagnostic scripts) requires Owner disposition.

---

## Item-by-Item Verification

### Item 1 — dotenv support

| Spec requirement | Result |
|---|---|
| `"dotenv": "^16.0.0"` in `package.json` dependencies | ✅ Present at correct version |
| `import 'dotenv/config'` as first line of `cli.ts` | ✅ Line 1, before all other imports |
| `.env.sample` documents all env vars with placeholders | ✅ All seven vars present: `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`, `SYNTHESIS_ROLE` |
| `.env` added to `runtime/.gitignore` | ✅ Present on line 2 |

### Item 2 — Provider catch-block fix

| Spec requirement | Result |
|---|---|
| `if (err instanceof LLMGatewayError) throw err;` as **first line** of `anthropic.ts` catch block | ✅ Line 114, before all `instanceof Anthropic.*` checks |
| Same guard as **first line** of `openai-compatible.ts` catch block | ✅ Line 117, before all `instanceof OpenAI.*` checks |

### Item 3 — synthesisRole parameterization

Spec §3 required exact implementation in the `TERMINAL_FORWARD_PASS` branch of `triggers.ts`. Verified line by line:

| Spec requirement | Result |
|---|---|
| `const synthesisRole = process.env.SYNTHESIS_ROLE ?? 'Curator';` introduced | ✅ Line 47 |
| `orderWithPromptsFromFile(flowRun.recordFolderPath, synthesisRole)` | ✅ Line 48 |
| `resultSummary` template: `Component 4 execution success: Computed backward traversal order (synthesisRole=${synthesisRole})` | ✅ Line 49, exact match |
| No changes to `evaluateAndTrigger` signature | ✅ Signature unchanged |
| No new imports in `triggers.ts` | ✅ Import list unchanged |

### Item 4 — INVOCATION.md

| Spec requirement | Result |
|---|---|
| `orient` command section added | ✅ With correct `<workspaceRoot> <roleKey>` signature |
| Provider configuration section with all env vars including `SYNTHESIS_ROLE` | ✅ Seven-row table, correct defaults |
| `.env` file usage section (location, copy instructions, gitignore note) | ✅ With Anthropic and Gemini examples |
| `start-flow` corrected to five args with `<projectRoot>` first | ✅ Matches `cli.ts:98` |
| `resume-flow` corrected to `<roleKey> <activeArtifactPath> [humanInput]` | ✅ Matches `cli.ts:105` |
| `flow-status` corrected to zero arguments | ✅ `tsx src/cli.ts flow-status` with no trailing args |

---

## Finding — Unplanned Diagnostic Scripts

Two files are present in `runtime/` that were not in the spec's §4 Files Changed table:

- `runtime/test-dotenv.ts` — two-line script: imports `dotenv/config`, prints `SYNTHESIS_ROLE` to stdout
- `runtime/test-catch.ts` — replicates the catch-block guard structure and verifies `LLMGatewayError` is preserved

Both are listed as "test artifacts" in `05-integration-test-record.md`. Neither file contains production logic or causes a correctness issue. However, both are sitting in `runtime/` root rather than `runtime/test/`, where the project's existing test file lives (`test/types.test.ts` per `package.json`).

**Owner decision required:** Delete (one-shot validation, served their purpose) or move to `runtime/test/` (keep as regression coverage). No correctness consequence either way. If kept, they should be moved to `runtime/test/` for consistency with the existing test layout.

---

## Handoff

Implementation is correct against spec. The single finding is a housekeeping question with no correctness impact. Owner may close the integration gate and proceed to registration, with or without resolving the diagnostic script disposition first — that can be handled in a separate pass if preferred.
