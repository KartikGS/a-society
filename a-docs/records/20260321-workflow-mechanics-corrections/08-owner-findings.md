# Backward Pass Findings: Owner — 20260321-workflow-mechanics-corrections

**Date:** 2026-03-21
**Task Reference:** 20260321-workflow-mechanics-corrections
**Role:** Owner
**Depth:** Full

---

## Findings

### Forward pass closure boundary violation — the issue this flow was designed to prevent

This flow committed the exact violation Item 4 was designed to eliminate.

After issuing `06-owner-update-report.md` (approving the update report for publication), I declared forward pass closure and initiated the backward pass in the same response. The Curator had not yet published the update report or incremented `$A_SOCIETY_VERSION`. Both are forward-pass tasks. The backward pass findings (`07-curator-findings.md`) were produced while those tasks were still outstanding.

This is a forward pass closure boundary violation. The guardrail is unambiguous: all forward-pass work must be complete before the backward pass begins. "Approved, now publish" is not the same as "published." The Curator still had work to do. I closed the forward pass anyway.

I framed this in my initial findings as "expected and constrained" — a known transitional case. That framing was wrong. The transitional constraint applied to the format of the update report submission (using the old model rather than the new one). It did not authorize declaring the forward pass closed before the Curator had completed publication. The guardrail does not have a transitional exception.

The root cause is structural: the separate post-implementation update report submission creates exactly this gap. The Owner approves the report, is now holding the last decision artifact, and proceeds to close out — without waiting for the Curator's publication step. This is the specific pattern Item 4 was designed to eliminate. By collapsing the update report into the Phase 1 proposal, Phase 2 decision, and Phase 3 publication, there is no outstanding publication task at Phase 5. The Owner can close the forward pass cleanly because there is nothing left for the Curator to do.

This flow ran the old model for its own update report — a known consequence of the transitional constraint — and then demonstrated precisely why the old model is problematic. This is not irony or coincidence. It is the mechanism. The separate submission model structurally invites premature closure, and that is exactly what happened here.

**Routing:** The forward pass closure boundary guardrail in `$A_SOCIETY_IMPROVEMENT` and `$GENERAL_IMPROVEMENT` may need strengthening to make this explicit: approving a pending submission is not the same as that submission being complete. The Owner must wait for the Curator to confirm completion of all approved tasks before declaring the forward pass closed. This is already implied by "confirm all forward-pass work is complete" — but "complete" needs to mean executed, not merely approved. Curator should assess during synthesis whether a targeted clarification is warranted in the Phase 5 Work description in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` and the equivalent in `$GENERAL_IMPROVEMENT`.

---

### Brief-writing quality: obsolescence not scoped

The Curator correctly identified that Item 4i's scope should have included removing the "Update Report Submission" type and "Implementation Status" section — both rendered vestigial by the model change. The brief asked "does the template need a new section?" It did not ask "does adding this section make existing content obsolete?" The Curator caught this during proposal formulation and proposed the removals. No friction resulted, but the correction required Curator initiative that should have been Owner responsibility at brief-writing time.

The Brief-Writing Quality section currently says output-format changes require explicit specification of the expected output form. The inverse is missing: when a brief introduces an output-format change, the Owner should also assess whether the change makes any existing field, section, or type value obsolete — and scope that removal explicitly.

**Routing:** Curator should add an "obsoletes" assessment obligation to `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality during synthesis (a-docs, Curator authority). Parallel addition to `$GENERAL_OWNER_ROLE` → Next Priorities (LIB change).

---

### Role authority transfer during the implementing flow

The Curator surfaced a gap: after implementing Item 1, an explicit Owner instruction in `04-owner-to-curator.md` directed the Curator to add a Next Priorities entry to the log — a section that was already Owner territory under the old model, and is Owner territory under the new one. The Curator followed the instruction. I then wrote the rest of the log at Phase 5. Split writes, in the implementing flow.

Assessment: the explicit instruction resolved the immediate ambiguity. A formal protocol for this category would add complexity for a case that resolves naturally at flow close. Principle 4 (Simplicity Over Protocol) applies.

**Routing:** No action. The Simplicity Over Protocol assessment is the answer; the Curator should not route this to Next Priorities.

---

### Format fallback when a template is removed mid-flow

The Curator had to file `05-curator-update-report.md` using old submission fields that no longer exist in the updated template. The correct fallback — use `$A_SOCIETY_UPDATES_PROTOCOL` Submission Requirements as the source of truth — was not documented anywhere. The Curator derived it correctly from first principles.

A one-sentence clarification in `$A_SOCIETY_UPDATES_PROTOCOL` would close this: when the template no longer has the relevant fields, the Submission Requirements section in this document is the fallback specification.

**Routing:** Curator implements directly during synthesis if judged worth adding; otherwise notes "assessed, not actioned — edge case too narrow."

---

## Top Findings (Ranked)

1. **Forward pass closure boundary violation: I declared the forward pass closed before the Curator had completed publication of the approved update report** — `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 5 Work and `$GENERAL_IMPROVEMENT` guardrail; "complete" must mean executed, not merely approved. This is the exact structural failure Item 4 was designed to prevent.

2. **Brief-Writing Quality is missing the inverse of the output-format rule: scope what the change makes obsolete** — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality (Curator implements during synthesis); `$GENERAL_OWNER_ROLE` (Next Priorities, LIB).

3. **Format fallback when template removed mid-flow is undocumented** — `$A_SOCIETY_UPDATES_PROTOCOL`; one-sentence clarification; Curator assesses during synthesis.

---

## Generalizable Findings

Finding 1 is generalizable: any project using this framework where an approved task must be executed by one role before another can declare closure faces this structural gap. The clarification that "complete means executed, not approved" belongs in `$GENERAL_IMPROVEMENT` alongside the existing forward pass closure boundary guardrail. Route to Next Priorities via synthesis.

Finding 2 (obsolescence check in brief-writing) is generalizable and the Curator already flagged it. Confirmed. Route `$GENERAL_OWNER_ROLE` addition to Next Priorities.
