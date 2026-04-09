**Subject:** Executable layer unification — structural setup
**Status:** REVISE
**Date:** 2026-04-09

---

## Decision

**REVISE** — the structural direction is approved, but the proposal is not yet approvable because one source-verification claim is incorrect and several load-bearing standing docs were left out of scope.

---

## Rationale

The proposal passes the abstraction, duplication, and placement tests for the main direction:

- one executable-layer story,
- `runtime/` as the surviving umbrella root,
- tooling retired as a standing peer layer,
- `Framework Services Developer` and `Orchestration Developer` as the new parallelizable responsibility split,
- one permanent executable-development workflow.

It does not yet pass the quality test.

Two problems block approval:

1. **Incorrect source-verification claim.** The proposal states that `$INSTRUCTION_WORKFLOW_MODIFY` and `$INSTRUCTION_WORKFLOW_COMPLEXITY` do not currently contain direct standalone-tool references. That is not correct. Both files still explicitly name `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`, so they are not "cross-reference cleanup only" surfaces.

2. **Incomplete standing-doc coverage.** The proposal updates the primary architecture/workflow/role surfaces, but it omits several still-active support docs that currently preserve the retired tooling/runtime split or the old operator-surface model. Approving the proposal as written would leave those contradictions standing.

This is a revise, not a rejection, because the framework direction itself is sound. The correction needed is scope precision.

---

## If APPROVED — Implementation Constraints

Not applicable while revision is pending.

---

## If REVISE — Required Changes

1. **Correct the source-verification section for `$INSTRUCTION_WORKFLOW_MODIFY` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`.**
   Replace the current "no direct standalone-tool invocation instructions" claim with the verified state: both files still name `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` explicitly. Revise the proposal so these two files are scoped for wording updates, not merely optional cross-reference cleanup.

2. **Add the missing standing support docs to the proposal's in-scope file set.**
   The resubmission must explicitly include:
   - `$A_SOCIETY_TA_ADVISORY_STANDARDS`
   - `$A_SOCIETY_CURATOR_ROLE`
   - `$A_SOCIETY_OWNER_BRIEF_WRITING`
   - `$A_SOCIETY_OWNER_CLOSURE`
   - `$A_SOCIETY_UPDATES_PROTOCOL`

3. **For each newly added file above, state the intended executable-layer outcome, not just the filename.**
   The revised proposal must name the actual change required in each surface. Examples of the level of specificity expected:
   - `$A_SOCIETY_TA_ADVISORY_STANDARDS` — coupling-map consultation wording must move from tooling-component framing to executable-capability / executable-coupling framing.
   - `$A_SOCIETY_CURATOR_ROLE` — registration-scope wording must no longer describe `tooling/INVOCATION.md` as a standing developer-authored operator surface.
   - `$A_SOCIETY_OWNER_BRIEF_WRITING` and `$A_SOCIETY_OWNER_CLOSURE` — executable verification guidance must be rewritten against the new role split and the new surviving executable boundaries.
   - `$A_SOCIETY_UPDATES_PROTOCOL` — "programmatic tooling" wording around the Version Comparator contract must be reconciled with the retired standalone tooling layer.

4. **Make the surviving operator-surface ownership explicit.**
   The revised proposal must state who authors and maintains `$A_SOCIETY_RUNTIME_INVOCATION` after `Tooling Developer` and `Runtime Developer` are retired. The current proposal says the runtime invocation surface survives, but it does not yet make the new standing ownership rule explicit enough for the role/workflow rewrite.

5. **Resubmit the proposal with the corrected file tables and narrative sections aligned to the expanded scope.**
   Update all relevant sections together:
   - discovered in-scope additions,
   - target location tables,
   - draft content sections,
   - agent-docs-guide rationale replacement notes,
   - update-report draft where the corrected scope changes the described affected artifacts.

---

## If APPROVED — Follow-Up Actions

Not applicable while revision is pending.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If REVISE: state "Acknowledged. Will revise and resubmit."
