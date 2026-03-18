---
**Subject:** Update report draft — Process gap bundle (v12.0 → v13.0)
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-18

---

## Trigger

Post-implementation assessment per `$A_SOCIETY_UPDATES_PROTOCOL`. This flow touched multiple `general/` files. Assessment found one Breaking change and several Recommended and Optional changes qualifying for an outbound report.

---

## What and Why

Report covers process gap bundle changes to `general/` that affect the guidance adopting projects received at initialization.

---

## Where Observed

A-Society — internal.

---

## Target Location

`$A_SOCIETY_UPDATES_DIR/2026-03-18-process-gap-bundle.md`

---

## Draft Content

---

# A-Society Framework Update — 2026-03-18

**Framework Version:** v13.0 *(A-Society's version after this update is applied)*
**Previous Version:** v12.0 *(A-Society's version before this update)*

## Summary

This update addresses process gaps in approval enforcement, handoff format clarity, records structure, and backward pass ordering. One Breaking change requires Curators of adopting projects to verify their records structure declares the Phase 0 workflow plan as the first required artifact. Several Recommended changes improve role handoff output sections.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps in your current `a-docs/` — Curator must review |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 1 | Context-dependent — adopt only if the problem applies |

---

## Changes

### Records structure: Phase 0 gate artifact declared as first required position

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/records/main.md`]
**What changed:** The Sequencing section now states that `01-` is reserved for the Owner's workflow plan — the Phase 0 gate artifact produced at flow intake, before any other artifact. The "What Goes in a Record" section now lists the Phase 0 gate artifact as a distinct item, preceding conversation artifacts. How to Create Step 2 now requires projects to declare position `01-` as the workflow plan in their sequence table.
**Why:** Projects setting up a records structure were told to declare a sequence but were not told that the first position must be reserved for the workflow plan. Projects that followed the prior instruction may have declared sequences that do not include this artifact as the mandatory first slot.
**Migration guidance:** Check your project's `$[PROJECT]_RECORDS` document. Verify that the artifact sequence table declares position `01-` as `owner-workflow-plan`. If the sequence table starts at a brief or proposal artifact, insert the workflow plan entry as the first row. Verify that the "What Goes in a Record" section (or equivalent) acknowledges the Phase 0 gate artifact as the first item in every record folder.

---

### Owner role template: "confirmation step" framing removed from Brief-Writing Quality

**Impact:** Recommended
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** The sentence "This signals to the downstream role that no judgment calls are required: the proposal round becomes a confirmation step, not a design session." has been replaced with "This signals to the downstream role that no judgment calls are required." The "confirmation step" framing minimized the downstream role's proposal as a formality.
**Why:** The phrase implied that a well-specified brief collapses the approval gate, which is incorrect — the approval gate exists regardless of brief completeness.
**Migration guidance:** Check your project's Owner role document for the Brief-Writing Quality section. If it contains language describing the proposal round as a "confirmation step" or equivalent, remove or rephrase that sentence. The correct framing: a fully-specified brief eliminates revision cycles, not the approval requirement.

---

### Role documents: existing-session handoff format added to Handoff Output sections

**Impact:** Recommended
**Affected artifacts:** [`general/roles/owner.md`], [`general/roles/curator.md`], [`general/instructions/roles/main.md`]
**What changed:** Handoff Output item 4 in the Owner and Curator role templates has been updated to present two explicit cases: Existing session (default) — use the named format `Next action / Read / Expected response`; New session (criteria apply) — use the copyable session-start prompt followed by artifact path. `$INSTRUCTION_ROLES` Section 7 now defines this named format and states it applies when resuming an existing session.
**Why:** All four A-Society roles independently encountered this gap during prior flows: the Handoff Output sections documented only the new-session format, leaving the existing-session case (the common case for intra-flow transitions) undefined. Users had to correct handoff format manually for multiple roles.
**Migration guidance:** Check your project's Owner and Curator role documents (and any other role documents with Handoff Output sections). If item 4 provides only a single copyable-inputs format without distinguishing the existing-session case, update it to present both cases explicitly using the format defined in `$INSTRUCTION_ROLES` Section 7. The existing-session format:
```
Next action: [what the receiving role should do]
Read: [path to artifact(s)]
Expected response: [what the receiving role produces next]
```

---

### Improvement template: Backward Pass tooling note generalized

**Impact:** Optional
**Affected artifacts:** [`general/improvement/main.md`]
**What changed:** The Tooling note in the Backward Pass Traversal section previously referenced `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` — an A-Society-specific variable — in a general template. The note now reads: "If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it rather than computing the order manually when the flow has more than two participating roles. Consult the project's tooling documentation for the specific invocation path."
**Why:** A general template should not reference A-Society-internal variables. Projects that instantiated this template before this change would have an incorrect variable reference in their improvement document.
**Migration guidance:** If your project's improvement document contains `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` in the Tooling note, replace it with a reference to your project's backward pass orderer tool (if one exists), or remove the tooling note if your project has no such tool. If your project has not instantiated this template yet, the current version applies.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.

---

## Implementation Status

**Implementation complete:** Yes — all `general/` and `a-docs/` changes described in this flow have been made (Phases 3 and 4 complete).
**Files changed:** `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, `$INSTRUCTION_ROLES`, `$INSTRUCTION_RECORDS`, `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_RECORDS`, `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_TOOLING_ADDENDUM`, `$A_SOCIETY_TOOLING_COUPLING_MAP`, `$A_SOCIETY_INDEX`, `$A_SOCIETY_PUBLIC_INDEX`
**Publication condition outstanding:** Yes — version increment (`$A_SOCIETY_VERSION` v12.0 → v13.0) and report file placement (`$A_SOCIETY_UPDATES_DIR`) are pending Owner approval of this submission.

---

## Owner Confirmation Required

The Owner must respond in `06-owner-update-report.md` with one of:
- **APPROVED** — report may be published and version incremented
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

Backward-pass findings will follow at `07-` after this submission is resolved.
