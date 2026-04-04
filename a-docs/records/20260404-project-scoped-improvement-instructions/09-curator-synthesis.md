# Backward Pass Synthesis: 20260404-project-scoped-improvement-instructions

**Date:** 2026-04-04
**Task Reference:** 20260404-project-scoped-improvement-instructions
**Role:** Curator
**Backward pass position:** 4 of 4 (synthesis)

---

## Assessment of Findings

### Curator Findings (position 1 of 4)

**Finding: Update report classification decision logic — Informational.** The reasoning is sound. No document change warranted; the flow already classified the update correctly and the finding does not identify a contradiction or maintenance gap in the current instructions.

**Finding: Record sequence mapping friction — Endorsed.** The root cause is valid: the Owner-facing closure surface did not restate the record-slot rule strongly enough for forward-pass closure, even though `$A_SOCIETY_RECORDS` already defines the general sequence-verification obligation. **Implemented directly** in `$A_SOCIETY_OWNER_ROLE` (see MAINT Actions below).

### Runtime Developer Findings (position 1 of 4, concurrent)

**Finding 1: Stale tooling imports in runtime layer — Endorsed as already resolved in the forward pass.** The broken `orderWithPromptsFromFile` import in `runtime/src/triggers.ts` was fixed during the runtime track, so no additional synthesis action is needed on the implementation itself.

**Finding 2: Runtime integration coverage gap — Endorsed.** The current runtime tests do not exercise the improvement phase deeply enough. This is outside `a-docs/`, so it cannot be implemented in synthesis. **Merged into the existing Runtime integration test infrastructure Next Priorities item** in `$A_SOCIETY_LOG`.

### Owner Findings (position 3 of 4)

**Finding 1: No full-runtime compilation check in the Runtime Developer brief — Endorsed.** The problem is not the brief target file; it is the missing verification-boundary instruction. The active A-Society fix belongs in `$A_SOCIETY_OWNER_ROLE`, where briefing quality for executable-layer work is defined. **Implemented directly** (see MAINT Actions below).

**Finding 2: No cross-consumer verification step when tooling removes a public API — Endorsed.** The actionable A-Society-side fix is to make the Owner's closure checklist require a cross-consumer sweep when executable-layer interfaces are retired. This is specific to A-Society's `tooling/` and `runtime/` layers and does not warrant a general-library item. **Implemented directly** (see MAINT Actions below).

**Finding 3: Closure sequence miscounting when a/b sub-labels are present — Endorsed.** This is the same closure-surface issue surfaced by the Curator's record-sequence finding. **Implemented directly** in `$A_SOCIETY_OWNER_ROLE`, and the reusable counterpart was merged into an existing `$GENERAL_OWNER_ROLE` Next Priorities item.

**Finding 4: Log archive target ambiguity — Endorsed.** The failure mode is real and recurrent. The A-Society-specific rule belongs in `$A_SOCIETY_OWNER_ROLE`; the reusable counterpart belongs in the existing `$GENERAL_OWNER_ROLE` follow-up item. **Implemented directly** for A-Society; reusable item merged into `$A_SOCIETY_LOG`.

---

## MAINT Actions Taken

### 1. `$A_SOCIETY_OWNER_ROLE` — executable-layer briefing and closure precision

Added four A-Society-side clarifications:

- **Brief-Writing Quality:** executable-layer verification scopes must name the intended boundary explicitly (file-local, module/package-wide, or repository-wide).
- **Forward Pass Closure Discipline:** executable-layer API removals require cross-consumer verification across `tooling/` and `runtime/` before closure.
- **Forward Pass Closure Discipline:** closure artifact numbering uses sequence slots, not raw filename count; `a`/`b` sub-labels share a numeric slot.
- **Forward Pass Closure Discipline:** archive the displaced `Previous` entry, not the flow currently closing.

These changes resolve all actionable A-Society `a-docs/` issues surfaced by the backward pass.

---

## Next Priorities Filed / Updated

### 1. Runtime integration test infrastructure — merged in place

Updated the existing `[M][RUNTIME]` item in `$A_SOCIETY_LOG` to explicitly include improvement-phase orchestration coverage and added the new source citation from `07b-runtime-developer-finding.md`.

### 2. Role-guidance precision follow-up — merged in place

Updated the existing `[S][LIB]` item in `$A_SOCIETY_LOG` to absorb two reusable closure-time precision rules for `$GENERAL_OWNER_ROLE`:

- choose forward-pass closure artifact numbers by sequence slot rather than raw file count
- archive the displaced `Previous` entry rather than the flow being closed

Merge assessment: both belong to the same `$GENERAL_OWNER_ROLE` closure-time precision design area as the existing update-report filename rule, with compatible `[LIB]` authority and the same Framework Dev workflow path.

---

## Flow Status

**Closed.** All actionable `a-docs/` items were implemented directly in this synthesis pass, and out-of-`a-docs/` follow-up was merged into existing Next Priorities entries in `$A_SOCIETY_LOG`. No further handoff is required.
