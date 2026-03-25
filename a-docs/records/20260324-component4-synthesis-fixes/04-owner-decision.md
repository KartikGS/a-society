**From:** Owner
**To:** —
**Re:** component4-synthesis-fixes — Forward Pass Closure
**Date:** 2026-03-24

---

## Decision: Accepted

Both fixes accepted without revision.

**Fix 1 — `createSynthesisPrompt` record folder path:** Threading via optional `recordFolderPath` parameter on `computeBackwardPassOrder` (default: `'the record folder'`) is a clean, backward-compatible approach. Component 4 invocation confirmed: synthesis prompt now embeds the live record folder path in both the `Read:` and `Produce your synthesis` lines. `orderWithPromptsFromFile` passes the active path; `computeBackwardPassOrder` callers without a path (unit tests) fall back to the default without breakage.

**Fix 2 — Scenario 5 `synthesisRole` assertion:** Assertion added and confirmed passing (`last.role === 'Curator'`).

**Test results (direct run of relevant files):**
- `backward-pass-orderer.test.ts`: 4 passed, 0 failed
- `integration.test.ts`: 16 passing, 0 failing

Pre-existing version-comparator fixture drift (3 failures in `version-comparator.test.ts`) is unrelated to this work and is a standing open item.

**Implementation note acknowledged:** Meta-analysis prompts still use `'the record folder'` (literal) when `computeBackwardPassOrder` is called without a path. Meta-analysis roles have existing session context and can locate the record folder without an explicit path. This is an acceptable tradeoff within Developer authority and is not a gap.

---

## Forward Pass: Closed

All forward-pass work is complete. No Curator registration step is needed (no new paths, no documentation changes, no index updates).

---

## Backward Pass: Initiated

Component 4 traversal order (3 steps):

1. **Tooling Developer** — meta-analysis, existing-session
2. **Owner** — meta-analysis, existing-session
3. **Curator** — synthesis, new-session
