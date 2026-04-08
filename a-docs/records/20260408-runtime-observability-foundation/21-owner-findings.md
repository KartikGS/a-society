# Backward Pass Findings: Owner — 20260408-runtime-observability-foundation

**Date:** 2026-04-08
**Task Reference:** 20260408-runtime-observability-foundation
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information

- **No standing protocol for record-artifact registration or promotion.** In `15-owner-integration-approval.md`, I instructed the Curator to "register this flow's `a-docs/records/20260408-runtime-observability-foundation/` artifacts per normal Curator practice in `$A_SOCIETY_INDEX`." By `16-curator-registration.md`, the actual registration work was limited to the `$A_SOCIETY_RUNTIME_INVOCATION` description update and log/index verification, which was the correct conservative outcome. The problem is that neither `a-society/a-docs/workflow/runtime-development.md` nor `a-society/a-docs/roles/curator/implementation-practices.md` defines when a sequenced record artifact should be indexed directly, promoted to a standing location, or left as a record-only trace. The phrase "register a-docs artifacts" is too broad when the affected `a-docs/` material is a record folder rather than a standing document set.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction

- **Curator registration crossed the closure-time log ownership boundary.** `a-society/a-docs/workflow/runtime-development.md` explicitly says the Registration Phase "does not include writing the project's log `Recent Focus` entry for the closing flow; that summary is written by the Owner during Forward Pass Closure." `a-society/a-docs/roles/owner/log-management.md` says the same thing in stronger terms: the closed-flow log entry is written by the Owner at closure. Despite that, `16-curator-registration.md` reported that the Curator had already added `runtime-observability-foundation` to Recent Focus, shifted `role-jit-extraction` and `adocs-design-principles`, and archived `runtime-session-ux`. I still had to perform the closure-time Next Priorities sweep and file `17-owner-forward-pass-closure.md`, so the log arrived partially mutated before the Owner's final review. The rule exists, but the registration handoff surface does not operationalize it strongly enough to prevent role-boundary bleed.

### Role File Gaps

- **`$A_SOCIETY_OWNER_TA_REVIEW` covers Phase 0 advisory review, but Owner integration-gate review has no equivalent guidance.** After `11-ta-integration-review-2.md` recommended approval, I had to overrule that recommendation in `12-owner-integration-corrections-2.md` by re-reading the implementation directly and deciding that synthetic span construction, incomplete test-provider lifecycle cleanup, and still-open contract items were blocking. The runtime workflow says the Owner must verify implementation and operator-facing surface before approval, but there is no Owner-side review aid for this phase comparable to `a-society/a-docs/roles/owner/ta-advisory-review.md`. Missing from the Owner guidance are concrete rules for contract-heavy integration gates: when a "documented deviation" is acceptable, when a schema-name mismatch is blocking, when test execution must be production-path rather than synthetic, and when the Owner should override a TA approval recommendation. In this flow, that decision procedure lived only in live judgment.

---

## a-docs Structure Check Notes

- **`runtime/INVOCATION.md` addition-without-removal check:** Passed. The telemetry section is runtime-specific and does not duplicate a general-library instruction. The update also widened the existing `$A_SOCIETY_RUNTIME_INVOCATION` description in both indexes rather than adding a parallel description surface.
- **Record-folder structure check:** Passed mechanically. The correction rounds stayed sequenced cleanly through `17-owner-forward-pass-closure.md`, and the backward-pass artifact numbering remained stable up to `21-owner-findings.md`.
- **Guide-scope check:** Still tensioned. `a-society/a-docs/a-docs-guide.md` remains an `a-docs/`-scoped guide while `runtime/INVOCATION.md` is a load-bearing operator document outside `a-docs/`. That was not a blocker in this flow, but it remains a genuine scope boundary that forces Curator judgment during registration.

---

## Top Findings (Ranked)

1. **Owner integration-gate review lacks a standing contract-review procedure.** This flow required the Owner to overrule a TA approval recommendation based on source-level evidence, but there is no Owner-side integration review guidance comparable to the Phase 0 TA-advisory review surface. — `a-society/a-docs/roles/owner/ta-advisory-review.md`; `a-society/a-docs/workflow/runtime-development.md`
2. **Record-artifact registration remains under-specified.** The phrase "register a-docs artifacts" is not mechanically actionable when the affected artifacts are sequenced record documents rather than standing indexed files. — `a-society/a-docs/workflow/runtime-development.md`; `a-society/a-docs/roles/curator/implementation-practices.md`
3. **Closure-time log ownership is documented but not operationally guarded.** Curator registration mutated Recent Focus / Previous / archive state even though that responsibility belongs to the Owner at forward-pass closure. — `a-society/a-docs/workflow/runtime-development.md`; `a-society/a-docs/roles/owner/log-management.md`

---

## Framework Contribution Candidates

1. **Owner integration-gate review guidance for contract surfaces.** Add an Owner-side review surface for integration gates parallel to `$A_SOCIETY_OWNER_TA_REVIEW`. It should define evidence hierarchy, when source-level contract drift is blocking, how to treat "documented deviations," and how to evaluate production-path versus synthetic verification.
2. **Standing record-artifact registration / promotion rule.** Define when record artifacts stay record-only, when they receive index exposure, and when a record-borne design should be promoted to a standing location. This would remove recurring Curator guesswork at registration.
3. **Registration-stage prohibition on log mutation before Owner closure.** The role boundary already exists in prose; the framework contribution is to encode it into Curator registration practice and/or the standard registration artifact shape so the handoff cannot arrive with Owner closure work already performed.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260408-runtime-observability-foundation/21-owner-findings.md
```
