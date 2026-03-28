**Subject:** runtime-env-bundle — Phase 0 architecture advisory: dotenv support, provider catch-block fix, synthesisRole parameterization, INVOCATION.md update
**Status:** BRIEFED
**Date:** 2026-03-28

---

## Scope Summary

Four items are bundled in this flow. Three are mechanical; one carries a design decision that requires TA input. The advisory must address all four — confirm the mechanical items require no interface changes and resolve the design decision for the parameterization item.

---

## Item 1 — dotenv support (mechanical)

**What:** Add `.env` file loading to the runtime so environment variables (API keys, provider selection, model overrides) can be persisted in a local `.env` file rather than set in the shell before each invocation.

**Implementation approach (confirmed at intake):**
- Add `dotenv` as a runtime dependency in `package.json`
- Load it at the top of `src/cli.ts`, before any other imports that read `process.env` — `import 'dotenv/config'` (ESM form)
- Create `.env.sample` at `runtime/.env.sample` documenting all current env vars with placeholder values
- Add `.env` to `runtime/.gitignore`

**Design question for TA:** None. Confirm that no existing interface changes are required — this is additive only. The env vars read by the providers remain unchanged; dotenv populates them before they are read.

---

## Item 2 — Provider catch-block fix (mechanical)

**What:** In `runtime/src/providers/anthropic.ts` and `runtime/src/providers/openai-compatible.ts`, already-classified `LLMGatewayError`s thrown inside provider `try` blocks are re-wrapped as `UNKNOWN` in the outer catch block. This discards the original error classification.

**Fix:** Add `if (err instanceof LLMGatewayError) throw err;` as the first line of each provider's outer `catch` block, before SDK-specific error mapping.

**Design question for TA:** None. This is a two-line fix per file. Confirm no interface changes are required.

---

## Item 3 — synthesisRole parameterization (design decision required)

**What:** `ToolTriggerEngine.evaluateAndTrigger` in `runtime/src/triggers.ts` hardcodes `'Curator'` as the `synthesisRole` argument to `orderWithPromptsFromFile` on the `TERMINAL_FORWARD_PASS` event. This is correct for all current A-Society flows but is not portable to non-A-Society projects or future flows with a different synthesis role.

**The design decision:** Where should `synthesisRole` be derived from? Three options:

| Option | Description | Trade-offs |
|---|---|---|
| A — env var (`SYNTHESIS_ROLE`) | Read `process.env.SYNTHESIS_ROLE` with `'Curator'` as default | Simple, consistent with other env-based config; requires operator to set when non-default |
| B — workflow document field | Parse a `synthesisRole` field from the workflow YAML frontmatter | Keeps config co-located with the workflow graph; requires a schema change to `workflow.md` and the graph validator |
| C — runtime config object | Introduce a runtime config layer that the CLI populates at startup and passes through | Most portable; adds a new abstraction layer; warranted if other config needs are anticipated |

**TA to resolve:** Which option to use, and the precise interface change required in `triggers.ts` (and any other files, if Option B or C). The choice determines whether this item is local to `triggers.ts` or requires additional files.

---

## Item 4 — INVOCATION.md update (mechanical once Item 3 is resolved)

**What:** `runtime/INVOCATION.md` has two documented gaps (from Next Priorities) plus a new gap from this flow:
1. `orient` command undocumented — entry point `tsx src/cli.ts orient <workspaceRoot> <roleKey>`
2. Provider configuration undocumented — `LLM_PROVIDER` selector, `ANTHROPIC_MODEL`, `OPENAI_COMPAT_*` vars
3. `.env` file usage undocumented (new from this flow)

**Implementation:** Developer deliverable — the Developer authors all three additions to `INVOCATION.md` during the implementation phase. Curator registration scope is limited to index verification for newly created or modified files.

**Design question for TA:** None beyond Item 3 resolution. Confirm that the `.env` section should document: location (`runtime/.env`), how to create it (copy `.env.sample`), and which vars it covers.

---

## What the TA Advisory Must Produce

§1 — Confirmation that Items 1, 2, and 4 are mechanical (no interface changes beyond what is described above)
§2 — Resolution of Item 3: chosen option, rationale, and precise interface specification
§3 — For Item 3: the full implementation path in `triggers.ts` (and any other files if Option B or C is chosen), specified with enough precision that the Developer can implement without inferring threading
§4 — Files Changed table covering all affected files for the full bundle
§5 — Any flags to Owner (structural concerns, edge cases, risks)

**Gate condition:** Return the advisory to the Owner for Phase 0 gate review before the Developer begins any implementation.

---

## TA Confirmation Required

Before beginning the advisory, the TA must acknowledge:

> "Briefing acknowledged. Beginning Phase 0 advisory for runtime-env-bundle."
