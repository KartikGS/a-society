# Backward Pass Findings: Owner — 20260308-handoff-protocol

**Date:** 2026-03-08
**Task Reference:** 20260308-handoff-protocol
**Role:** Owner
**Depth:** Standard

---

## Findings

### Conflicting Instructions
- None. The workflow break came from an ambiguous phrase in the briefing I wrote, not from two sources contradicting each other.

### Missing Information

**1. Briefing approval vs. Phase 2 approval — not distinguished in the workflow**
The workflow describes the briefing as creating a trigger input for Phase 1, but it does not state anywhere that a briefing cannot serve as a Phase 2 decision. The Approval Invariant says "The Curator does not write to `general/` without Owner approval" — but it does not specify *at which point* in the flow that approval must be issued, or what form it must take. A Curator reading only the invariant and a briefing that says "this constitutes approval" has no document telling them that a separate Phase 2 decision artifact is still required.

Target: `$A_SOCIETY_WORKFLOW` — Phase 1 description and/or the Approval Invariant should explicitly state that a briefing establishes direction and scope alignment only; the Owner's Phase 2 decision artifact is required before implementation regardless.

**2. "What" vs. "When" missing from the Approval Invariant**
The invariant governs what requires approval (`general/` writes) but not when approval is established (which phase, which artifact). This gap made the Curator's misreading structurally reasonable rather than clearly wrong. The invariant should be extended to cover timing, not just scope.

**3. Implementation status not declared in update report submissions**
The update report submission (`04-curator-to-owner.md`) did not state whether all Phase 3 implementation was complete. I had to issue a conditional approval ("publish only after `$A_SOCIETY_WORKFLOW` is updated") because I could not verify implementation completeness from the submission alone. By the time I reviewed, the workflow had already been updated — my conditional approval was satisfied before it was read. The submission format should require an explicit implementation status declaration.

Target: `$A_SOCIETY_UPDATES_PROTOCOL` or the update report submission template.

### Unclear Instructions

**4. "This briefing constitutes that approval" — ambiguous pre-approval language**
The briefing I wrote contained: "This briefing constitutes that approval" — referring to the Owner's agreement that the scoped `general/` changes were in principle acceptable. This phrase was accurate in intent (directional approval, not Phase 2 approval) but ambiguous in effect. The Curator reasonably read it as permission to proceed to implementation.

This is partly an Owner error: briefings should not use approval language that could be read as Phase 2 authorization. But it is also a gap in the briefing template or accompanying guidance: `$A_SOCIETY_COMM_TEMPLATE_BRIEF` does not tell the Owner what pre-approval language is safe to include, or what it must explicitly not say.

Target: `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — add a note on what directional pre-approval in a briefing covers and does not cover. And/or `$A_SOCIETY_WORKFLOW` Phase 1 — clarify pre-approval scope.

### Redundant Information
- None.

### Scope Concerns
- None. The scope held cleanly throughout. All six files were correct targets; none were out of place.

### Workflow Friction

**5. Workflow sequencing: implementation before decision**
The Curator implemented five of six files before the Phase 2 decision existed. The work was correct, but the sequencing was wrong. This is the same event Curator Finding 1 identifies. From the Owner's perspective, the root cause is a combination of: (a) ambiguous briefing language (Finding 4 above), and (b) an Approval Invariant that specifies what requires approval but not when or in what form. Both need to be addressed to close the gap.

**6. Partial disagreement with Curator Finding 3**
The Curator notes that "workflow verification should precede publication constraints" because the `$A_SOCIETY_WORKFLOW` update was already complete by the time I reviewed the update report. I disagree with the proposed direction. The publication gate was correct: I could not verify at review time that implementation was complete, so a conditional approval was the right call. The problem was the missing implementation status declaration in the submission (Finding 3 above), not the gate itself. The fix is a better submission format — not a relaxed gate.

---

## Top Findings (Ranked)

1. **Briefing pre-approval language creates Phase 2 bypass risk** — `$A_SOCIETY_COMM_TEMPLATE_BRIEF` and/or `$A_SOCIETY_WORKFLOW` Phase 1. The phrase "this briefing constitutes that approval" is ambiguous; briefing guidance should specify what pre-approval covers and what it does not. (Consolidates Findings 4 and 1.)

2. **Approval Invariant covers "what" but not "when"** — `$A_SOCIETY_WORKFLOW` Approval Invariant. Add timing: Phase 2 decision artifact required before implementation regardless of briefing content. (Extends Finding 1.)

3. **Implementation status missing from update report submissions** — `$A_SOCIETY_UPDATES_PROTOCOL`. Submissions should declare which Phase 3 files are complete and which if any are pending, so the Owner can issue conditional vs. unconditional approval accurately. (Finding 3.)

4. **Within-flow sequencing for additional submissions is implicit** — `$A_SOCIETY_RECORDS`. Confirm with Curator Finding 2: the case of an update report submission between decision and backward pass should be explicitly noted as a handled pattern, not left implicit in the "sequence continues as long as required" rule.

---

## Proposed New Flows

**Flow A — Briefing pre-approval language and Approval Invariant timing**
Fixes Findings 1, 2, and 4. Targets: `$A_SOCIETY_WORKFLOW` (Approval Invariant + Phase 1 description) and `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. Severity: High — the same break will recur in any flow where the Owner includes pre-approval language in a briefing. `[S][MAINT]` — within Curator authority if no direction decision is implied; Owner briefing recommended given the Invariant change.

**Flow B — Implementation status in update report submissions**
Fix Finding 3. Target: `$A_SOCIETY_UPDATES_PROTOCOL`. Severity: Medium — affects accuracy of Owner review but does not break the flow when the gate condition is met before review. `[S][MAINT]` — Curator authority.

**Flow C — Within-flow sequencing explicit documentation**
Fix Finding 4 (aligned with Curator Finding 2). Target: `$A_SOCIETY_RECORDS`. Severity: Low — the convention handles it implicitly; explicit documentation is a clarity improvement. `[S][MAINT]` — Curator authority. May fold into Flow A if the Curator judges it efficiently handled together.
