# Curator → Owner: Submission (Phase 7 Registration)

**Subject:** Phase 7 registration — Tracks A, B, C converged
**Status:** SUBMITTED
**Type:** Registration / Maintenance
**Date:** 2026-03-29

---

## Trigger

`07-owner-integration-gate.md` — Owner approved TA integration review; Phase 7 registration opened for Curator (single session covering tooling INVOCATION, runtime INVOCATION, coupling map, Track C verification, index parity).

---

## Implementation status

**Complete.** Phases 3–4 implementation for Tracks A and B were already verified in `06-ta-integration-findings.md`. This session completed Phase 7 documentation and registration items below. **`$A_SOCIETY_VERSION` is already v25.0** with History row for `2026-03-29-owner-routing-multi-domain.md` (Track C completed in a prior session).

---

## What changed

1. **`$A_SOCIETY_TOOLING_INVOCATION`:** Component 4 rewritten for **`nodes`/`edges`** record-folder `workflow.md`: `orderWithPromptsFromFile`, `computeBackwardPassOrder(nodes[], ...)`, record-folder YAML example, algorithm note (first-occurrence role order in node list, reverse for meta-analysis, synthesis append), legacy **`path[]` hard-fail** documented. **Component 7** (`validatePlanArtifact`) section added with entry point and exit semantics. Test table includes `plan-artifact-validator.test.ts`.

2. **`$A_SOCIETY_RUNTIME_INVOCATION`:** **`start-flow`** usage updated to four arguments: `<projectRoot> <recordFolderPath> <startingRole> <startingArtifact>` — workflow read from `<recordFolderPath>/workflow.md` (matches `runtime/src/cli.ts`).

3. **`$A_SOCIETY_TOOLING_COUPLING_MAP`:** Component 4 row resolved — removed “Tooling Dev update pending”; schema description matches implemented parser.

4. **Track C (verification):** Confirmed present: `$INSTRUCTION_WORKFLOW` multi-domain subsection, `$A_SOCIETY_WORKFLOW` Multi-domain pattern + Session Routing cross-ref, `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`, `$A_SOCIETY_AGENT_DOCS_GUIDE` entry, `$A_SOCIETY_INDEX` + `$A_SOCIETY_PUBLIC_INDEX` rows, `$A_SOCIETY_UPDATES_DIR` report `2026-03-29-owner-routing-multi-domain.md`, `$A_SOCIETY_VERSION` v25.0.

5. **Component 6 alignment:** `compareVersions` now **sorts** `unappliedReports` by version **ascending** (per `$A_SOCIETY_UPDATES_PROTOCOL` comparison rule). Updated `test/version-comparator.test.ts` fixtures and **dynamic `CURRENT_FRAMEWORK`** read from live `VERSION.md` so tests stay valid across version bumps.

---

## Files changed (use `$VAR` references)

| Action | Variable / path |
|--------|-----------------|
| Edit | `$A_SOCIETY_TOOLING_INVOCATION` |
| Edit | `$A_SOCIETY_RUNTIME_INVOCATION` |
| Edit | `$A_SOCIETY_TOOLING_COUPLING_MAP` |
| Edit | `a-society/tooling/src/version-comparator.ts` (sort unapplied reports) |
| Edit | `a-society/tooling/test/version-comparator.test.ts` |
| Edit | `a-society/tooling/test/fixtures/version-record-current.md` |
| Edit | `a-society/tooling/test/fixtures/version-record-no-updates.md` |

Track C targets were already satisfied before this session; no additional edits to `$INSTRUCTION_WORKFLOW`, `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`, `$A_SOCIETY_VERSION`, or the v25.0 update report in this pass.

---

## Publication condition

**None blocking.** Update report for Track C is already published; version record is current.

Path Validator continues to report informational drift for `$A_SOCIETY_FEEDBACK_MIGRATION` (directory) and `$GENERAL_IMPROVEMENT_PROTOCOL` (missing file) — pre-existing; not introduced by this flow.

---

## Owner next step

**Forward pass closure** per `workflow.md`: Owner acknowledges flow completion, updates project log if required, and directs backward pass when due.

**Next action:** Owner agent — read this artifact and `$A_SOCIETY_WORKFLOW` forward-pass closure rules for the active flow.

**Read:** `08-curator-to-owner.md`, record folder `workflow.md`, `$A_SOCIETY_LOG` if applicable.

**Expected response:** Owner closure acknowledgment and backward-pass routing per workflow plan.
