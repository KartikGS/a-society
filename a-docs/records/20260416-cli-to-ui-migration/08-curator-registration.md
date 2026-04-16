**Subject:** CLI-to-UI migration — Curator registration
**Status:** COMPLETED
**Date:** 2026-04-16

---

## Registration Report

**Verification 1 — `TelemetryManager.init()` idempotency:**
Confirmed. `TelemetryManager.init()` is instance-guarded (`if (this.instance) return;`). Leaving the dual calls in `bin/a-society.ts` and `server.ts` is safe and idempotent.

**Observation 2 — `parsePort` duplication:**
Acknowledged for future maintenance. No action taken in this flow.

**Standard Registration Scope:**

1. **Indexes (`$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX`):** Verified. `runtime/INVOCATION.md`'s path is unchanged. The underlying executable component restructuring does not surface any new indexed operator references. No index changes required.
2. **`$A_SOCIETY_AGENT_DOCS_GUIDE`:** Updated. The guidance for `runtime/INVOCATION.md` now explicitly cites "operator UI mode interactions (browser chat vs. graph)" as its domain, replacing the legacy CLI output model.
3. **`$A_SOCIETY_ARCHITECTURE`:** Updated. The executable layer outline now accurately states that the runtime provides the operator-facing "web server / browser UI surface" rather than a CLI surface.
4. **Framework Update Report:** Assessed per `$A_SOCIETY_UPDATES_PROTOCOL` — The migration modifies `runtime/` (A-Society's executable operator surface) but does not alter `general/` templates or `agents/` logic. Because this change is internal to A-Society's work product and does not propagate to initialized `a-docs/` in adopting projects, no update report is required and no framework version bump is necessary.

---

## Handoff

Registration is complete. The executable flow can be closed.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260416-cli-to-ui-migration/08-curator-registration.md
```
