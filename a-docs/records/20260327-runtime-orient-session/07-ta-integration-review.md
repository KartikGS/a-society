# TA Integration Review — Orient Command and a-society CLI

**Role:** Technical Architect
**Date:** 2026-03-28
**Binding spec:** `03-ta-phase0-architecture.md`
**Inputs reviewed:** `05-integration-test-record.md`, `06-runtime-developer-completion.md`
**Source files reviewed:** All 8 files in scope (see §1)

---

## Method

This review is forensic: the primary question is whether the implementation matches the approved spec. Each source file was read against the corresponding spec section. Findings are classified as blocking (must be corrected before Owner sign-off) or non-blocking (spec update or quality note; does not prevent sign-off).

---

## §1. Files Reviewed

| File | Spec action | Present | Matches spec |
|---|---|---|---|
| `runtime/src/types.ts` | Modify | ✅ | ✅ |
| `runtime/src/injection.ts` | Modify | ✅ | ✅ |
| `runtime/src/orient.ts` | New | ✅ | ❌ — see Finding 1 |
| `runtime/src/cli.ts` | Modify | ✅ | ✅ |
| `runtime/bin/a-society.ts` | New | ✅ | ✅ |
| `runtime/bin/a-society` | New | ✅ | ✅ |
| `runtime/package.json` | Modify | ✅ | ✅ |
| `a-society/install.sh` | New | ✅ | ✅ |
| `runtime/src/llm.ts` | Not in spec | — | Deviation — see Finding 2 |

---

## §2. Findings

### Finding 1 — Missing registry guard in `orient.ts` [BLOCKING]

**Spec requirement (§2):**
> "If no entry exists in `roleContextRegistry` for the derived key, orient surfaces an error and exits: 'This project's Owner role is not registered in the runtime. Only registered projects support orient sessions.'"

**Implementation:** `orient.ts` calls `ContextInjectionService.buildContextBundle(roleKey, ...)` with no prior check on whether `roleKey` exists in `roleContextRegistry`. The injection service's `else` branch handles an unknown key by appending `--- UNKNOWN ROLE: {roleKey}. No required reading registered. ---` to the bundle and continuing. No error is raised. The session proceeds with an empty context — no required reading injected — and fires the first LLM turn against an effectively blank system prompt.

**Why the integration test did not catch this:** The test selected the `ink` project, deriving `ink__Owner` — a key that is not registered. The test used a mock `ANTHROPIC_API_KEY` that triggers `AUTH_ERROR` immediately on the API call. The `AUTH_ERROR` caused `process.exit(1)` before the context gap could manifest. The test correctly validated the binary flow up to the LLM call; it did not validate registry guard behavior because the mock key short-circuited that path.

**Impact:** In the current workspace, `a-society` is excluded from discovery by the algorithm (step 3: exclude entries named `'a-society'`). `a-society__Owner` is the only registered key. Therefore, every project the binary discovers is unregistered, and every orient session in the current state runs with empty context. The guard is not a future-scope concern — it is required for the system to function correctly today.

**Required correction:** Add a registry check at the start of `runOrientSession`, before `buildContextBundle` is called. If `roleKey` is absent from `roleContextRegistry`, print the spec-required error message and call `process.exit(1)`. The check must import `roleContextRegistry` from `./registry.js`. No other changes to `orient.ts` are required.

The correction is small and self-contained. It does not alter the architecture.

---

### Finding 2 — `llm.ts` modified; not in spec [NON-BLOCKING — spec update required]

**Spec statement (§3):** "llm.ts requires no changes."
**Spec files-changed table (§8):** `runtime/src/llm.ts` is not listed.

**Implementation:** Line 3 of `llm.ts` adds `export type { MessageParam };`, re-exporting the `MessageParam` type from the Anthropic SDK so `orient.ts` can import it from `./llm.js` rather than directly from the SDK.

**Assessment:** The change is benign. Re-exporting a type across a module boundary is a correct TypeScript pattern and introduces no behavioral difference. The Developer's characterization is accurate. However, the spec explicitly stated "llm.ts requires no changes" — the change therefore constitutes a deviation, and the spec must be updated to reflect actual state. A code change is not required.

**Required spec update:** §3 of `03-ta-phase0-architecture.md` should note the `MessageParam` re-export. §8 files-changed table should add `runtime/src/llm.ts — Modify — Re-export MessageParam type for use by orient.ts`.

---

### Finding 3 — Literal `\n` escape in error string [NON-BLOCKING — quality]

**Location:** `orient.ts` line 74.

**Issue:** The string is `'\\nError during turn: ${error.message}'`, which contains a literal backslash-n rather than a newline character. When printed, this produces `\nError during turn: ...` instead of a newline followed by the error message. The double-backslash is inconsistent with every other newline in the file.

**Assessment:** Minor rendering defect. Does not affect correctness of error handling or session behavior. Not a spec deviation — the spec did not specify the exact formatting of mid-turn error output. Surfaced for Developer awareness; correction is at Owner's discretion.

---

### Finding 4 — `contextHash` computed but unused [NON-BLOCKING — observation]

**Location:** `orient.ts` lines 15–21.

**Issue:** `contextHash` is destructured from `buildContextBundle`'s return value but is never referenced after that point. The hash is computed (consuming a SHA-256 operation) and discarded.

**Assessment:** Dead code. The spec did not specify that the hash be used in orient sessions (unlike flow sessions, which store it in `TurnRecord`). This is consistent with the ephemeral, no-persistence design. Not a deviation. Surfaced as a code quality note.

---

## §3. Conformance Assessment

All files except `orient.ts` conform to the approved spec. The `orientation.ts` deviation is architectural, not cosmetic: it allows orient sessions to proceed silently with empty context for any currently-discoverable project. This is the opposite of the designed error behavior and makes every orient session in the current workspace non-functional (context-empty) when a real API key is used.

**Integration gate: NOT CLEAR**

The integration gate condition is not met. Finding 1 must be corrected and re-validated before Owner sign-off.

---

## §4. Required Actions Before Gate Clears

**Developer (code fix):**
1. In `orient.ts`: add a `roleContextRegistry` import and guard at the start of `runOrientSession`. If `roleKey` is absent, print the spec-required error message and exit. No other changes.
2. Re-run integration validation against a registered project OR confirm the guard fires correctly for an unregistered key. Either validates the fix.

**TA (spec update, can be done concurrently):**
1. Update §3 and §8 of `03-ta-phase0-architecture.md` to reflect the `llm.ts` `MessageParam` re-export.

---

## §5. Handoff to Owner

The TA integration review is complete. Two actions are required before the `owner-integration-gate` can be reached:

1. Developer corrects Finding 1 and files a follow-up validation record.
2. TA updates the spec to reflect Finding 2.

Artifact path: `a-society/a-docs/records/20260327-runtime-orient-session/07-ta-integration-review.md`
