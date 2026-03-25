# Backward Pass Findings: Owner — 20260325-machine-readable-handoff

**Date:** 2026-03-25
**Task Reference:** 20260325-machine-readable-handoff
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

**Finding 1 — "Distinct step in workflow.md" conflicts with the Framework Dev workflow structure**

The Post-Confirmation Protocol in `$A_SOCIETY_OWNER_ROLE` states: "When the flow carries [LIB] scope, include the registration loop as a distinct step in workflow.md at intake. The predictable structure is: Curator publishes update report → version incremented → Owner acknowledgment."

"Include the registration loop as a distinct step in workflow.md" reads as an instruction to add separate `workflow.md` path entries for the LIB sub-steps. I added a `Curator — Framework Update Report (LIB)` node after `Curator — Implementation & Registration`, producing two consecutive Curator nodes. The human corrected this.

The Framework Dev workflow has no separate LIB nodes. The Curator's update report publication is sub-work within Phase 3 (Implementation); the version increment and Owner acknowledgment are sub-work within Phase 4 and Phase 5 respectively. The LIB obligation is satisfied within existing nodes — not by adding new ones.

Root cause: "distinct step in workflow.md" is ambiguous between (a) "add a new `workflow.md` node" and (b) "ensure this obligation is represented within the existing phases." The intention is (b), but the language reads as (a).

This is an instruction gap in `$A_SOCIETY_OWNER_ROLE` Post-Confirmation Protocol and the corresponding section in `$GENERAL_OWNER_ROLE`.

---

### Missing Information

**Finding 2 — No brief-writing trigger for the update report draft requirement in [LIB] flows**

The Framework Dev workflow Phase 1 requirement is: "When the proposed change is likely to qualify for a framework update report, include the update report draft as a named section in the proposal submission."

This requirement lives in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`. It is not surfaced in the Owner's Brief-Writing Quality section. My initial brief did not instruct the Curator to include the update report draft. The omission was caught by the human before the Curator acted on it; I corrected it via an Edit to the brief.

Root cause: the Brief-Writing Quality section focuses on scope, target files, and implementation approach. There is no `[LIB]` flow trigger that says "for flows where a framework update report is expected, the brief must explicitly instruct the Curator to include the draft in the proposal." The Phase 1 requirement is in the workflow document, which the Owner reads at session start but does not necessarily consult when writing a brief.

Fix: add a `[LIB]` brief note to `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality and `$GENERAL_OWNER_ROLE` Brief-Writing Quality: for `[LIB]` flows where a framework update report is expected, the brief must explicitly instruct the Curator to include the update report draft as a named section in the proposal submission.

This finding is **generalizable** — any project with an analogous "include [artifact X] in the proposal" phase requirement is vulnerable to the same omission if the brief-writing guidance does not surface it.

---

**Finding 3 — `artifact_path` for phase-closure handoffs (Owner perspective)**

Confirming Curator Finding 2. After I approved the proposal and issued `04-owner-to-curator.md`, my handoff correctly named that artifact as the Curator's reading input. The Curator's completion handoff back to me mirrored this structure — pointing me at `04-owner-to-curator.md` (my own decision artifact) rather than producing `05-curator-to-owner.md` as the `artifact_path`.

Both worked examples in `$INSTRUCTION_MACHINE_READABLE_HANDOFF` show mid-flow content-submission handoffs, where the artifact named in `artifact_path` is a proposal or decision the receiving role needs to read. Neither shows the completion/registration handoff pattern where the receiving role needs to verify completion, not read new content. The Curator had no example to orient to.

Root cause: the worked example set is incomplete. The omission of a completion handoff example produced the routing error. This is the same as Curator Finding 2 and Finding 3 — confirmed from the Owner's perspective.

This finding is **generalizable** — confirmed by the Curator.

---

### Unclear Instructions
- None beyond what is captured above.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction

**Finding 4 — Three forward-pass corrections caught externally, none self-caught (meta-observation)**

Three errors were corrected by the human before work proceeded:
1. Backward pass steps added to `workflow.md` (not in scope for `workflow.md`)
2. Duplicate consecutive Curator node (LIB loop treated as a separate node)
3. Update report draft requirement missing from the brief

None were self-caught by the Owner before human intervention. All three trace to insufficient cross-checking of workflow documents at the point of artifact production. Findings 1 and 2 above address the specific actionable gaps. The meta-pattern observation is: the Owner constructs `workflow.md` and the brief without an explicit cross-check step against the workflow's Phase requirements and phase structure.

Whether this warrants a formal pre-send checklist or cross-check reminder beyond Findings 1 and 2 is a synthesis judgment call. Flagging here; I lean against adding formal ceremony if the two specific fixes address the observable failure modes.

---

## Top Findings (Ranked)

1. **"Distinct step in workflow.md" is ambiguous for LIB registration loop** — `$A_SOCIETY_OWNER_ROLE` Post-Confirmation Protocol; `$GENERAL_OWNER_ROLE` equivalent section. Produced a double Curator node and incorrect `workflow.md`; corrected externally. Fix: clarify that "distinct step" means the obligation is represented within existing phases, not via additional nodes.

2. **No brief-writing trigger for update report draft requirement in [LIB] flows** — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality; `$GENERAL_OWNER_ROLE` Brief-Writing Quality. Generalizable. Fix: add explicit `[LIB]` brief note requiring instruction to Curator to include the update report draft as a named section in the proposal.

3. **`artifact_path` undefined for phase-closure handoffs** — `$INSTRUCTION_MACHINE_READABLE_HANDOFF`. Confirming Curator Findings 2 and 3. Generalizable. Fix: add a worked example for the completion/registration handoff pattern.
