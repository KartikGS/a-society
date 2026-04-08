# Backward Pass Findings: Curator — 20260408-runtime-observability-foundation

**Date:** 2026-04-08
**Task Reference:** `20260408-runtime-observability-foundation`
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **none**

### Missing Information
- **Registration Protocol for Record Artifacts** — The brief mandated: "Register this flow's `a-docs/records/.../` artifacts per normal Curator practice in `$A_SOCIETY_INDEX`." However, `indexes/main.md` contains no precedent for indexing record-folder variables, and `$A_SOCIETY_CURATOR_IMPL_PRACTICES` lacks a "Registration Protocol" for choosing when to promote a record design vs. indexing the folder vs. only log-entry updates. This created friction during registration, leading to a conservative "description-update-only" pass.

### Unclear Instructions
- **Verification Boundary for `a-docs-guide.md`** — The brief asked to "verify guide remains accurate." The guide explicitly states its scope is the `a-docs/` folder, but this flow touched `runtime/INVOCATION.md`. It was unclear if "verifying accuracy" meant extending the guide to cover non-adocs operator documents or if the request was simply a standing check that nothing in `a-docs/` became stale.

### Redundant Information
- **none**

### Scope Concerns
- **none**

### Workflow Friction
- **Registration Step-Dependency** — I had to perform a cross-index comparison for `$A_SOCIETY_RUNTIME_INVOCATION` across `index.md` and `main.md`. While the manual check is required by `$A_SOCIETY_CURATOR_IMPL_PRACTICES`, the lack of an automated "index parity" check in Component 5 or 8 makes this step error-prone and tedious for the Curator during Phase 4.

### Role File Gaps
- **$A_SOCIETY_CURATOR_IMPL_PRACTICES** — Lacks the "Registration / Promotion Rule" (see Missing Information above).
- **$A_SOCIETY_AGENT_DOCS_GUIDE** — Header scope declaration ("explanation of every significant file and folder in this project's agent-docs") excludes `$A_SOCIETY_RUNTIME_INVOCATION`, even though it is a load-bearing agent starting document. This creates a coverage gap where the rationale for the runtime's entry point is not documented in the guide.

---

## a-docs Structure Check Notes

1. **agents.md scope check** — Verified. `agents.md` was not modified in this flow.
2. **Redundancy check** — The new "Telemetry and Observability" section in `INVOCATION.md` does not duplicate existing `general/` instructions; it provides runtime-specific configuration values (`A_SOCIETY_TELEMETRY_ENABLED`, etc.) that are correctly localized.
3. **Addition-without-removal check** — Verified. The expanded `$A_SOCIETY_RUNTIME_INVOCATION` description correctly replaces the narrower one in both indexes. No stale descriptions persist.

---

## Top Findings (Ranked)

1. **Missing Registration/Promotion Protocol** — [$A_SOCIETY_CURATOR_IMPL_PRACTICES](file:///home/kartik/Metamorphosis/a-society/a-docs/roles/curator/implementation-practices.md) | No rule for when to register record artifacts in the index.
2. **`a-docs-guide.md` Scope Omission** — [$A_SOCIETY_AGENT_DOCS_GUIDE](file:///home/kartik/Metamorphosis/a-society/a-docs/a-docs-guide.md) | The guide does not cover key operator references like `INVOCATION.md` because they live outside `a-docs/`.
3. **Index Parity Friction** — [Registration Workflow] | Manual parity checks between internal and public indexes are brittle; Component 5/8 should validate index-variable synchronization.

---

## Generalizable Findings

- **Externally-caught telemetry gaps (D3, D4, O1)** — The TA caught several telemetry attribute gaps that were missed during implementer self-review. **Root cause:** implementers lack a shared, deterministic "Telemetry Contract Validator" tool or a requirement to submit a local metrics/traces capture as part of the Phase 3 self-verification. A framework-level "Telemetry Validation Record" pattern could prevent these regressions before they reach TA review.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260408-runtime-observability-foundation/18-curator-findings.md
```
