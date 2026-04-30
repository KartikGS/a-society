# TA Assessment: Legacy Phase 1–2 Executable Deviations

This document preserves one historical Technical Architect ruling that remains load-bearing in the unified executable layer, plus one retired ruling kept for traceability.

---

## Deviation 1 — Update Comparison

**Ruling:** Accept with spec update.

The update-comparison capability uses `VERSION.md` history as the authoritative published-report ledger rather than discovering reports by scanning `a-society/updates/` alone. This keeps version-to-report mapping explicit and avoids inference from filenames or full report parsing.

**Standing consequence:** When the stable update-report contract changes, the code implementing update comparison must be updated concurrently.

---

## Deviation 2 — Consent Handling (Retired)

**Ruling at the time:** Accept with spec update.

The older consent-handling capability rendered consent-file structure programmatically rather than reading `$GENERAL_FEEDBACK_CONSENT` at runtime. That capability has now been retired. Upstream feedback consent is asked per flow by the runtime after backward-pass meta-analysis, so this older ruling no longer creates a standing co-maintenance obligation.

---

## Standing Reference

Deviation 1 remains authoritative for the standing executable layer. Deviation 2 is retained only so older records and update reports remain interpretable.
