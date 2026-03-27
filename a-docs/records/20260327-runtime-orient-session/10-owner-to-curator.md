**Subject:** Integration gate clearance — orient command and a-society CLI
**Status:** APPROVED — integration gate cleared
**Date:** 2026-03-27
**Artifacts reviewed:** `09-runtime-developer-correction.md`

---

## Integration Gate Decision

APPROVED. All three corrections are confirmed:

- **Finding 1 (blocking):** Registry guard in place. Output matches the exact spec-required error message; exits with code 1. Validated against an unregistered key before any LLM communication. The path that caused the integration test to miss this (mock API key triggering AUTH_ERROR first) is no longer the only validated path.
- **Finding 2 (quality):** Literal `\n` corrected.
- **Finding 3 (quality):** Unused `contextHash` removed.

No new deviations introduced. Implementation is in sync with the Phase 0 spec as updated by the TA.

---

## Curator Registration Scope

The Curator is authorized to proceed with registration. Scope is as follows.

**`$A_SOCIETY_PUBLIC_INDEX` — one new entry required:**

| Variable | Path | Description |
|---|---|---|
| `$A_SOCIETY_INSTALL_SCRIPT` | `a-society/install.sh` | A-Society installation script — installs the `a-society` CLI command via npm link; run once from the repository root |

The `runtime/` source files (`orient.ts`, `bin/a-society.ts`, `bin/a-society`) are internal implementation files and do not require individual index registration. The existing `$A_SOCIETY_RUNTIME_INVOCATION` entry remains the external-facing reference for runtime invocation.

**`$A_SOCIETY_INDEX` (internal) — no new entries required.** No new `a-docs/` artifacts were created in this flow.

**`$A_SOCIETY_AGENT_DOCS_GUIDE` — assess for update.** If the guide's runtime section references the invocation document or runtime capabilities, assess whether the addition of the `orient` command and `a-society` binary warrants a note. Apply judgment; do not add if the existing entry already covers the runtime adequately.

**`$A_SOCIETY_UPDATES_PROTOCOL` — assess for framework update report.** This flow adds new user-facing runtime capabilities (orient command, a-society binary, install script). Adopting projects do not need to review their a-docs as a result, but they may want to know about the new capability. Assess per the protocol and produce an update report if warranted.

**Out of scope for this Curator pass:** `runtime/INVOCATION.md` does not need updating in this flow. The Curator's registration scope excludes authoring invocation documentation for executable layers. The gap — `orient` is not yet documented in INVOCATION.md — is flagged as a Next Priorities item and will be filed at Forward Pass Closure.

---

## Gate Condition

Return to Owner when registration is complete and the update report assessment is resolved. Provide: confirmation of what was registered, and the update report decision (report filed or determination that none is warranted with brief rationale).
