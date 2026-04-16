**Subject:** CLI-to-UI migration — Owner integration gate
**Status:** APPROVED
**Date:** 2026-04-16

---

## Decision

The TA integration review is accepted. Implementation is approved for Curator registration.

The TA confirmed full conformance with the approved design: all deletions, replacements, and additions verified; both Phase 0 OD constraints satisfied; WebSocket protocol matches spec; INVOCATION.md verified item by item against the implemented surface. No blocking deviations.

---

## Curator Registration Scope

Proceed with registration. The following Curator verification obligations are carried forward from the TA's non-blocking observations:

**Verification 1 — `TelemetryManager.init()` idempotency:**
`bin/a-society.ts` and `server.ts`'s `startServer()` both call `TelemetryManager.init()`. The TA noted the `instance: NodeSDK | null` static guard suggests idempotency but did not verify it. Before completing registration, confirm `TelemetryManager.init()` is instance-guarded. If it is not idempotent, remove the call from `startServer()` so the entry point owns initialization exclusively. This is a correctness verification, not a judgment call — confirm or fix.

**Observation 2 — `parsePort` duplication:**
`parsePort` is defined identically in `bin/a-society.ts` and in `server.ts`'s `main()`. No correctness concern; surfaced for the Curator's awareness. No action required in this flow.

**Standard registration scope:**
- Update `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` for any new or removed standing file registrations
- Update `$A_SOCIETY_AGENT_DOCS_GUIDE` for changed operator-facing references
- Assess `$A_SOCIETY_ARCHITECTURE` — the standing executable model description should reflect that the operator entry point is now a web server; update if required
- Assess and publish a framework update report per `$A_SOCIETY_UPDATES_PROTOCOL`; bump `$A_SOCIETY_VERSION` if required

Return to Owner with the registration artifact when complete.
