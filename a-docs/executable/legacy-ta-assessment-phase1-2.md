# TA Assessment: Legacy Phase 1–2 Executable Deviations

This document preserves historical Technical Architect rulings retained for traceability.

---

## Deviation 1 — Update Comparison (Retired)

The update-comparison capability has been removed. This deviation ruling is retained only so older records remain interpretable.

---

## Deviation 2 — Consent Handling (Retired)

**Ruling at the time:** Accept with spec update.

The older consent-handling capability rendered consent-file structure programmatically rather than reading `$GENERAL_FEEDBACK_CONSENT` at runtime. That capability has now been retired. Upstream feedback consent is asked per flow by the runtime after backward-pass meta-analysis, so this older ruling no longer creates a standing co-maintenance obligation.
