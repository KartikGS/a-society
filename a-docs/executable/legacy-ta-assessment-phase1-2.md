# TA Assessment: Legacy Phase 1–2 Executable Deviations

This document preserves two historical Technical Architect rulings that remain load-bearing in the unified executable layer.

---

## Deviation 1 — Update Comparison

**Ruling:** Accept with spec update.

The update-comparison capability uses `VERSION.md` history as the authoritative published-report ledger rather than discovering reports by scanning `a-society/updates/` alone. This keeps version-to-report mapping explicit and avoids inference from filenames or full report parsing.

**Standing consequence:** When the stable update-report contract changes, the code implementing update comparison must be updated concurrently.

---

## Deviation 2 — Consent Handling

**Ruling:** Accept with spec update.

The consent-handling capability renders the consent-file structure programmatically rather than reading `$GENERAL_FEEDBACK_CONSENT` at runtime. The template and the renderer are therefore a co-maintained pair.

**Standing consequence:** When `$GENERAL_FEEDBACK_CONSENT` changes structurally, the executable consent-rendering implementation must be updated in the same flow.

---

## Standing Reference

These rulings are historical but still authoritative for the legacy framework-service designs carried forward into `$A_SOCIETY_EXECUTABLE_PROPOSAL`.
