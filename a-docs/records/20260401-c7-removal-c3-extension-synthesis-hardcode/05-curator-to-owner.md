# Curator → Owner: Documentation completion (convergence implementation)

**Subject:** C7 removal, Component 3 extension, synthesis hardcode — documentation aligned with `04-owner-convergence-decision.md`
**Status:** SUBMITTED
**Type:** Maintenance / Registration
**Date:** 2026-04-01

---

## Trigger

`04-owner-convergence-decision.md` — Owner **APPROVED** convergence; Curator scope **[Curator authority — implement directly]** for listed documentation targets.

---

## Implementation status

**Complete.** All items in the convergence decision table are reflected in the repository. Tracks A and B implementation were already verified in `03a-tooling-developer-completion.md` and `03b-runtime-developer-completion.md`.

---

## What changed

1. **`$A_SOCIETY_TOOLING_INVOCATION`:** Component 3 documents optional second argument to `validateWorkflowFile`, **same-role neighbor** rule on edges (always on), and **strict mode** (Owner at all start/end nodes; single-node graphs must be Owner). **Component 7** section removed. Test table row for `plan-artifact-validator.test.ts` removed.

2. **`$A_SOCIETY_RUNTIME_INVOCATION`:** **`SYNTHESIS_ROLE`** removed from the Provider Configuration table (synthesis role is fixed in runtime; no env surface).

3. **`$A_SOCIETY_ARCHITECTURE`:** Tooling layer described as **six** components; Component 7 row removed; table reordered 1–6; Component 3 row notes structural checks and strict mode; phase-order footnote no longer references Phase 1A.

4. **`$A_SOCIETY_TOOLING_COUPLING_MAP`:** Format-dependency row for `$A_SOCIETY_COMM_TEMPLATE_PLAN` → Component 7 removed; invocation row for `$INSTRUCTION_WORKFLOW_COMPLEXITY` → Component 7 removed.

5. **`$A_SOCIETY_TOOLING_PROPOSAL`:** **Component 7** design section removed. **Phase 1A** subsection was not present in the current file body after edit verification (no remaining `Phase 1A` / `Component 7` references).

6. **`$A_SOCIETY_WORKFLOW_TOOLING_DEV`:** Phase 1A section removed; Phase 1 fixture-drift standing note removed; forward-pass narrative, session model, and phase dependency diagram updated to drop Phase 1A; Tooling Developer phases listed as 1, 2, 4, 5, 6.

7. **`$A_SOCIETY_PUBLIC_INDEX`:** Row **`$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR`** removed (source file deleted). **`$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR`** description updated for structural and strict-mode behavior.

8. **`$INSTRUCTION_WORKFLOW_COMPLEXITY`:** Plan validation paragraph updated so Owners verify the plan against `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` without invoking a removed tooling entry point — **coupling maintenance** with the public index change (same flow as Component 7 removal).

9. **`$A_SOCIETY_INDEX`:** Reviewed; no row had pointed at the deleted plan-artifact source — **no edit required**.

---

## Files touched (variables where registered)

| Action | Reference |
|--------|-----------|
| Edit | `$A_SOCIETY_TOOLING_INVOCATION` |
| Edit | `$A_SOCIETY_RUNTIME_INVOCATION` |
| Edit | `$A_SOCIETY_ARCHITECTURE` |
| Edit | `$A_SOCIETY_TOOLING_COUPLING_MAP` |
| Edit | `$A_SOCIETY_TOOLING_PROPOSAL` |
| Edit | `$A_SOCIETY_WORKFLOW_TOOLING_DEV` |
| Edit | `$A_SOCIETY_PUBLIC_INDEX` |
| Edit | `$INSTRUCTION_WORKFLOW_COMPLEXITY` |

---

## Owner follow-up

- If you want **`$INSTRUCTION_WORKFLOW_COMPLEXITY`** treated as strictly out-of-band for this convergence artifact, say so and the Curator can route a separate approval for that paragraph; functionally it removes a dangling reference to a deleted public-index variable.
- Optional: clean up **orphan** `tooling/test/fixtures/plan-*.md` files and `.claude/settings.local.json` allowlist entries that still name `plan-artifact-validator` tests — not required for documentation parity.

---

## Handoff

**Next action:** Owner acknowledges documentation registration for this flow or requests revision.

**Read:** This file; `04-owner-convergence-decision.md`; changed artifacts above as needed.

**Expected response:** Forward-pass closure / backward-pass routing per `workflow.md` for `20260401-c7-removal-c3-extension-synthesis-hardcode`, or explicit **REVISE** if any target should be adjusted.
