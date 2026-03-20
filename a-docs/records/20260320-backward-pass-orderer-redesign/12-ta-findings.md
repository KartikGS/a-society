# Backward Pass Findings: Technical Architect — 20260320-backward-pass-orderer-redesign

**Date:** 2026-03-20
**Task Reference:** 20260320-backward-pass-orderer-redesign
**Role:** Technical Architect
**Backward pass position:** 3 of 5
**Depth:** Full

---

## Findings

### Missing Information

**1. Advisory did not specify prompt template content.**

The advisory specified `prompt: string` as a field on `BackwardPassEntry` without specifying the template or its structure. The Owner had to supply a correction note at approval time (`04-owner-decision.md`, approval note 1), directing the Developer to use the existing `generateTriggerPrompts` implementation as reference.

The prompt template is part of the interface specification — it determines what agents receive and act on. Leaving it unspecified produced an approval-stage gap that should have been resolved in the advisory itself. The correct handling was either: specify the template inline, or explicitly state "prompt content is at Developer's discretion — follow the existing implementation's language pattern" as a deliberate delegation. The advisory did neither.

**Generalizable:** Yes. Any advisory that introduces a type carrying textual output should either specify the content format or explicitly delegate it with a reference. Implicit delegation to "figure it out" is a spec gap.

---

**2. This flow's record folder cannot use the convention it established.**

The `workflow.md` artifact requirement was established by this flow's documentation proposal. It cannot be retroactively added to this flow's own record folder without creating a bootstrapping exception. The advisory and the Curator's documentation proposal both specified `workflow.md`'s schema and authoring rules — but neither addressed the inherent case where the convention is being established mid-flow and the current folder cannot conform.

As a result, the Backward Pass Orderer cannot be invoked for this flow, and agents encountering this folder in the future will find a non-conforming record folder without explanation.

The Curator found the closely related finding (pre-convention folder exemption not documented). This finding is the forward-facing complement: when a flow establishes a convention, the advisory or documentation proposal should call out that the current folder is exempt-by-origin and note this explicitly for future agents.

**Generalizable:** Yes. Any flow that establishes a new record-folder requirement faces the same bootstrapping gap.

---

### Unclear Instructions

**3. TA role handoff section conflicts with Owner routing authority.**

The TA role file (`$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`) includes a handoff section requiring the TA to "explicitly tell the human" session routing instructions at each pause point: which session to switch to, what the receiving role needs to read, and the handoff inputs. The Owner's approval note (`04-owner-decision.md`, approval note 3) states that session routing instructions are the Owner's responsibility, not the TA's — the content in my advisory was correct and was used, but the protocol note stands.

These two instructions are in direct tension. The role file says the TA provides routing; the Owner says routing is the Owner's responsibility. An agent reading the TA role file has no way to resolve this without prior session context.

**What this blocks:** A TA operating without the Owner's correction note would continue including routing sections in advisories, believing this is required behavior.

---

### Conflicting Instructions

*(See Finding 3 above — the TA handoff / Owner routing conflict is the relevant conflicting instruction.)*

No additional conflicting instructions were encountered.

---

### Redundant Information

- None.

---

### Scope Concerns

- None. The TA scope held cleanly throughout. The advisory produced designs; the Developer implemented; the review artifact assessed conformance. No scope pressure toward implementation was encountered. The Developer correctly escalated nothing — the implementation matched spec and no deviation surfaced.

---

### Workflow Friction

**4. Parallel track artifact position collision at 08.**

The TA assessment (`08-ta-assessment.md`) and the Curator's update report submission (`08-curator-update-report.md`) both reached for position 08 simultaneously. From the TA's perspective: when producing the assessment, position 08 was the next available number in the record folder and was used without coordination. There was no mechanism to know that the Curator track would also file at 08.

The Curator found the records convention gap (no rule for concurrent parallel-track submissions). From the TA's perspective, the additional friction was that the collision was only visible in hindsight — there was no signal during artifact production that a collision was occurring.

The Curator's finding is the right place for the resolution. This is a corroborating signal from a second role.

---

**5. Advisory's four open questions were correctly scoped, but Q1 admitted one implicit assumption.**

The advisory answered Q1 (workflow.md schema) by recommending `phase` as a required field even though Component 4 does not use it algorithmically. The rationale — "carries phase metadata for readability and future use" — was sound but introduced an implicit assumption: that requiring `phase` would not become a friction point for callers writing `workflow.md`. The Backward Pass Orderer's validator throws on a missing or empty `phase`, meaning callers must supply it even when they have no natural phase name to provide.

This is minor friction rather than a defect, but if a future caller finds `phase` burdensome, the spec decision is the source. Worth flagging for the synthesis role to assess whether the `phase` requirement should be revisited.

---

## Top Findings (Ranked)

1. **Advisory did not specify prompt content — produced an Owner correction at approval time.** The advisory should have specified the prompt template or explicitly delegated it. This is a repeatable TA spec gap for any advisory introducing a type with textual output fields. Relevant: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`.

2. **TA handoff section vs. Owner routing authority — conflicting instructions in the TA role file.** The TA role file requires session routing output; the Owner's approval note says routing is the Owner's responsibility. The TA role file needs a clarifying rule. Relevant: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`.

3. **This-flow bootstrapping gap — a flow establishing a record-folder convention cannot conform to it.** Neither the advisory nor the documentation proposal addressed this. Future advisories establishing new record-folder requirements should note the current folder's exempt-by-origin status. Relevant: `$A_SOCIETY_RECORDS`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`.

4. **Parallel track position collision at 08 — corroborates Curator finding.** Two roles independently chose position 08 with no coordination mechanism. Corroborating signal supports fixing the records convention gap. Relevant: `$A_SOCIETY_RECORDS`.

---

Hand off to Owner (position 4 of 5).
