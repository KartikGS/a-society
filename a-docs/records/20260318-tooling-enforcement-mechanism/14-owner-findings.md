# Backward Pass Findings: Owner — 20260318-tooling-enforcement-mechanism

**Date:** 2026-03-18
**Task Reference:** 20260318-tooling-enforcement-mechanism
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

**1. Decision artifact naming convention has no rule for non-Curator proposals.**

I named the Owner's review response `04-owner-to-ta.md` — implying a handoff to the TA who had no further action. The TA's work was complete at `03-ta-to-owner.md`. The user caught this; the artifact was renamed to `04-owner-decision.md`.

The records convention's non-standard slot rule (`NN-[role]-[descriptor].md`) governs what to name non-standard artifacts, but gives no rule for distinguishing between "the Owner is handing work back to a role" and "the Owner is recording a decision in response to a role's proposal." The `owner-to-[role]` naming form should be reserved for artifacts where the named role has a next action. When the Owner responds to a proposal from a non-Curator role (TA, Developer) whose work is complete at the proposal stage, the artifact should be `NN-owner-decision.md`. This rule is not currently written.

---

### Missing Information

**2. Backward pass ordering for multi-role flows is not documented in any single authoritative source.**

`$A_SOCIETY_IMPROVEMENT` describes only the two-role Owner/Curator backward pass. The addendum's Phase 7 describes a different order specific to the full tooling launch. Neither provides a generalizable rule for flows that involve additional roles.

The actual backward pass order for this flow required human direction — and I got it wrong twice before being corrected: first by dropping the working Curator from the middle (treating the synthesis Curator as the only Curator node), then by not recognizing that the TA session was also an existing session. The correct order (Developer → Curator → TA → Owner → Curator synthesis) follows directly from first-occurrence-reversed with structural rules applied — but this derivation was not accessible from any single document, and was not performed programmatically.

`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` (Component 4) was built to compute this exactly. It was not invoked. The protocol layer does not require it. This is the same pattern as the plan artifact gate before Component 7: the tool exists, but invocation is not mandated.

*Generalizable finding: multi-role backward pass ordering applies equally to any project using the framework that involves more than two roles. Flag for `$GENERAL_IMPROVEMENT` and `$INSTRUCTION_IMPROVEMENT`.*

**3. The Owner's own brief gave the Curator enough information to open Session C without returning to the Owner.**

`08-owner-to-curator.md` stated the gate condition for Session C ("opens after the Curator's Component 7 spec entry in `$A_SOCIETY_TOOLING_PROPOSAL` is approved") and the Developer session prompt. This gave the Curator the information needed to route the Developer directly after Track 1 implementation — which is what happened. The user identified this as a communication gap.

The Owner-as-terminal-node invariant is stated in `$A_SOCIETY_WORKFLOW`: "Every flow closes at Step 5 — the Owner receives the implementation output... A flow that has not cleared the Owner has not closed." But this invariant is about flow closure, not intermediate session transitions. No rule currently says "the Curator may not open a new role session without returning to Owner first." The brief gave the Curator the gate condition; the role boundary did not prevent them from acting on it directly.

This is a handoff protocol gap: the Owner's brief should not provide enough information for the Curator to complete a multi-step handoff unilaterally. The brief should provide the condition, not the action. What the Curator needs after the condition is met — specifically, to return to the Owner to authorize the next session — must be made explicit either in the brief template or in the Curator role's hard rules.

---

### Unclear Instructions

**4. Existing-session handoff format is undocumented — confirmed by all three non-Owner roles.**

Developer finding #5, Curator finding #4, TA finding #5 all flagged the same gap independently: the handoff output sections of all role documents specify the copyable prompt format for new sessions but say nothing about what "copyable inputs" means for existing sessions. The result: roles in this flow produced incomplete handoffs ("switch to the Owner session" without specifying what the receiving session should do), and the user had to supply the missing format live.

This is the highest-frequency friction point in this flow. It is also the most clearly generalizable: existing-session handoffs occur in every multi-session flow, regardless of project type, domain, or tooling. The fix — a named format for existing-session copyable inputs — belongs in `general/roles/` templates and propagates to all A-Society role documents.

*Generalizable finding: flag for `general/roles/owner.md`, `general/roles/curator.md`, and the `$INSTRUCTION_ROLES` archetypes.*

---

### Redundant Information

- None.

---

### Scope Concerns

**5. The backward pass trigger prompt was manually composed and inconsistently applied.**

The trigger prompt used to start each role's backward pass session was different across sessions in this flow — in some cases I provided it, in some cases the user composed it, and the format varied. The user observed that this prompt is mechanically derivable (record folder path, role, sequence position, improvement protocol reference are all knowable) and that programming would help.

This is correct. The backward pass trigger prompt is fully deterministic given the record folder identifier and the list of participating roles in backward pass order. A thin tool — or an extension of Component 4 — that generates the ordered list of sessions and the copyable trigger prompt for each would eliminate this manual step entirely and prevent the ordering errors I made in this flow.

**6. Record has no Developer-authored completion artifact and no TA-authored non-involvement confirmation.**

The Developer's implementation completion is recorded only as an Owner paraphrase in `08-owner-to-curator.md`. The TA's non-involvement during Phase 1A is recorded only as an Owner statement in the same artifact. Neither role produced an artifact that documents the outcome of their phase from their own perspective.

Both the Developer (finding #5) and TA (finding #4) surfaced this as a scope gap. I agree it is a gap, but I want to name the structural cause: the record convention was designed around substantive artifacts (proposals, decisions, findings). It has no lightweight artifact type for "role completed work cleanly" or "advisory role was available but not invoked." Whether to add such an artifact type is a design question — the cost is more artifacts per flow; the benefit is a record that can be audited without relying on Owner paraphrase.

---

### Workflow Friction

**7. "Implement directly" and "submit as proposal" were both stated in the same brief.**

`08-owner-to-curator.md` told the Curator that the public index registration was Curator-authority ("implement directly"), then immediately told them to submit all three items as a single proposal. The Curator correctly included item 1 in the proposal with a note, and I approved. But the instruction was contradictory.

This is a brief-authoring error on my part, and the Curator finding (#1) correctly traces it to an absent convention in the brief template. When bundling Curator-authority items with proposal-required items, the brief must distinguish them explicitly. The convention — "include for record" vs. "requires approval" — is not in `$A_SOCIETY_COMM_TEMPLATE_BRIEF`.

---

## Top Findings (Ranked)

1. **Existing-session handoff format undocumented — confirmed by all three non-Owner roles.** Highest-frequency friction; affects every multi-session flow. *Generalizable.* Affects `general/roles/` templates and all A-Society role documents.

2. **Backward pass ordering for multi-role flows has no single authoritative source, and Component 4 was not invoked.** I computed the order manually and got it wrong twice. The tool exists; the protocol does not require it. Affects `$A_SOCIETY_IMPROVEMENT`, `$INSTRUCTION_IMPROVEMENT`, and `general/` equivalents. *Generalizable.*

3. **Owner brief gave Curator enough information to bypass the Owner-as-waypoint at Session C opening.** The Curator routed the Developer without returning to Owner first. The brief template and Curator hard rules do not prevent this. Affects `$A_SOCIETY_COMM_TEMPLATE_BRIEF` and `$A_SOCIETY_CURATOR_ROLE` hard rules.

4. **Decision artifact naming has no rule for non-Curator proposals.** `owner-to-ta` named a decision artifact as if the TA had a next action. The convention needs an explicit rule: `owner-decision` when the proposing role's work is complete; `owner-to-[role]` only when the named role has a subsequent action. Affects `$A_SOCIETY_RECORDS`.

5. **Backward pass trigger prompt was manually composed and inconsistently applied.** Fully derivable from record folder identifier and role list. Strong candidate for a thin programmatic tool — either a Component 4 extension or a standalone utility. Affects backward pass execution across all flows.

6. **Brief-bundling convention absent from brief template.** When Curator-authority items and proposal-required items are bundled in a single brief, the brief must mark each item's authority level explicitly. Affects `$A_SOCIETY_COMM_TEMPLATE_BRIEF`.
