# Backward Pass Synthesis: 20260408-role-guidance-addenda

**Date:** 2026-04-08
**Task Reference:** 20260408-role-guidance-addenda
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Review

### Curator Findings (07-curator-findings.md)

**Finding 1 — just-in-time reads were skipped at proposal and implementation phase entry.** Actionable. The direct A-Society fix belongs in the extracted role-routing layer: strengthen the phase-entry cue so required support docs are framed as pre-phase reads rather than session-start reminders. Implemented directly in `$A_SOCIETY_CURATOR_ROLE`, and the same phase-entry wording was applied across the other A-Society role wrappers that use `## Just-in-Time Reads`.

No reusable-library follow-up was queued for this finding. The gap is specific to A-Society's extracted just-in-time wrapper model; `$GENERAL_CURATOR_ROLE` keeps its implementation-practice guidance inline rather than behind a separate phase-entry pointer.

**Finding 2 — no other friction.** No action required.

### Owner Findings (08-owner-findings.md)

**Finding 1 — A-Society Owner routing did not surface the intake validity-sweep duty clearly enough.** Actionable. The reusable Owner template already carries the intake validity sweep and closure overlap sweep, so the missing piece was the A-Society-specific routing surface. The direct fix belongs in `$A_SOCIETY_OWNER_LOG_MANAGEMENT`, with a stronger pointer from `$A_SOCIETY_OWNER_ROLE`. Implemented directly.

No reusable-library follow-up was queued for this finding. The general role already contains the standing duty; this was project-specific wrapper drift inside `a-docs/`.

**Finding 2 — Curator just-in-time reads lacked a strong phase-entry activation cue.** Endorsed and already covered by Curator Finding 1. Implemented directly in `$A_SOCIETY_CURATOR_ROLE` and applied consistently across the other A-Society role wrappers that use extracted just-in-time support documents.

---

## Actions Taken

### Direct Implementation

**`$A_SOCIETY_OWNER_LOG_MANAGEMENT` — intake validity sweep and closure coordination.** Expanded the support document so it now covers three distinct log-management duties: the intake validity sweep over overlapping Next Priorities entries, the existing merge assessment for adding or merging Next Priorities items, and the closure-time coordination rule pointing the Owner back to `$A_SOCIETY_OWNER_CLOSURE` before filing the closure artifact.

**`$A_SOCIETY_OWNER_ROLE` — stronger routing to log-management duties and phase-entry reads.** Updated the project-log authority bullet and the `## Just-in-Time Reads` section so intake work that may change Next Priorities is explicitly routed through `$A_SOCIETY_OWNER_LOG_MANAGEMENT`, rather than relying on the Owner to recall that duty from the reusable template or from prior flows.

**`$A_SOCIETY_CURATOR_ROLE` — explicit phase-entry activation for implementation practices.** Rewrote the Curator's just-in-time pointer to read as a phase-entry action: before proposal, implementation, or registration, stop and read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`.

**A-Society extracted role wrappers — consistent phase-entry wording.** Updated the `## Just-in-Time Reads` language in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`, and `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` from "When ..." to "Before ...", aligning the extracted role-routing layer with the phase-entry activation model surfaced by this backward pass.

### Next Priorities

**Merge assessment**

- No new or merged Next Priorities items were created.
- The Owner validity-sweep issue was already solved at the reusable layer and only needed the A-Society-specific routing surfaces brought back into alignment.
- The Curator just-in-time issue was resolved within A-Society's extracted role-wrapper layer; it did not expose a separate `general/` gap because the reusable Curator template does not use extracted phase-entry support documents.

**Log updates completed**

- None. `$A_SOCIETY_LOG` was not changed because synthesis produced no out-of-`a-docs/` follow-up work.

---

## Flow Status

Backward pass complete. All actionable findings from this flow were resolved directly within A-Society's `a-docs/` during synthesis. No further handoff is required.
