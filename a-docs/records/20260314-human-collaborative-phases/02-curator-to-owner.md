---

**Subject:** Fully agentic role model — human-collaborative phase flag
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-14

---

## Trigger

Human direction, per `01-owner-to-curator-brief.md`. The Owner identified a conceptual gap in the framework: the "human or agent" contributor framing in role documents and the "Human" phase-owner entries in workflow documents create inconsistency with the actual operational model, where an agent always authors artifacts and acts as the interface with the human.

---

## What and Why

This proposal removes human-as-role-holder framing from the framework and encodes human involvement explicitly at the workflow phase level.

**What changes:**

1. Role documents are defined as always written for agents. The phrase "human or agent" is removed from `$INSTRUCTION_ROLES`. The role document opening definition is updated accordingly; related phrasing elsewhere in the document is brought into alignment.

2. A `Human-collaborative` flag is added to the workflow phase definition format in `$INSTRUCTION_WORKFLOW`. When a phase carries this flag, the assigned agent acts as the human interface: it surfaces context, elicits the human's contribution, and authors the outgoing artifact. Agent obligations for a flagged phase are defined as a named sub-pattern — not a field-level note — because the three obligations are substantial enough to require their own section and because the pattern is architecturally significant and universally applicable. Phase 1 always carries the flag as a structural rule; no other phases carry it by default.

3. A concurrent maintenance change to `$A_SOCIETY_WORKFLOW` replaces the "Human" phase-owner entry in Phase 1 with "Owner" and applies the `Human-collaborative` flag.

**Why it generalizes:**
This change applies equally to any project type — software, writing, research, or any other domain. The structural rule (Phase 1 always carries the flag because the direction source is always human) is domain-agnostic. The named sub-pattern (surface context, elicit contribution, author artifact) governs how any agent in any project handles a phase that involves human input. No domain assumption is required.

**Why the agent obligations belong as a named sub-pattern, not a field-level note:**
A field-level note within the phase definition spec would say, in effect, "when this flag is present, the agent should do these things" — but only once per reader encounter with the spec. The three obligations (surface, elicit, author) constitute a behavioral contract that agents must carry into execution. A named sub-pattern gives the behavior a referenceable name and a stable location: "see the Human-Collaborative Phase Pattern" is a statement any role document or workflow document can make. A field-level note is not referenceable by name.

**Open questions resolved (per brief):**

*Flag form:* The field is named `Human-collaborative`. The value is a brief phrase naming the nature of human contribution — not a binary marker. A binary marker would tell the agent "involve the human" without telling it what to surface or elicit. A descriptive value gives the agent the context it needs. Example values: `direction`, `decision`, `content`, `approval`. For Phase 1, the value is `direction`. Additional descriptive detail may follow the value word when needed for clarity (see draft content).

*Agent obligations — scope:* Named sub-section within the Phases (Nodes) section of `$INSTRUCTION_WORKFLOW`. Not in Extended Workflow Patterns, because human-collaborative phases are not an edge case — Phase 1 carries this flag in every workflow by structural rule.

---

## Where Observed

A-Society — internal. The "Human" phase-owner entry in `$A_SOCIETY_WORKFLOW` Phase 1 and the "human or agent" phrasing in `$INSTRUCTION_ROLES` both represent the same conceptual gap. The operational model in A-Society's session model already treats the Owner as the interface — this change makes that explicit everywhere.

---

## Target Location

1. `$INSTRUCTION_ROLES` — `/a-society/general/instructions/roles/main.md`
2. `$INSTRUCTION_WORKFLOW` — `/a-society/general/instructions/workflow/main.md`
3. `$A_SOCIETY_WORKFLOW` — `/a-society/a-docs/workflow/main.md` (MAINT — concurrent with general/ changes)

---

## Draft Content

### 1. Changes to `$INSTRUCTION_ROLES`

**Change A — Opening definition (line 5):**

Old:
> A role document is a behavioral contract for a specific kind of contributor — human or agent.

New:
> A role document is a behavioral contract for an agent.

**Change B — Failure modes section (lines 14–19):**

Old:
> **Overreach:** An agent or collaborator does things outside their appropriate scope because no boundary was declared.
>
> **Paralysis:** An agent or collaborator stops at every ambiguous decision because they are not sure if they are authorized to proceed.

New:
> **Overreach:** An agent does things outside its appropriate scope because no boundary was declared.
>
> **Paralysis:** An agent stops at every ambiguous decision because it is not sure if it is authorized to proceed. It asks questions that should already be answered. Work slows.

*(The "note-taker starts making editorial decisions" example sentence can remain unchanged — it illustrates the failure mode with a generic example that does not imply a human role-holder.)*

---

### 2. Changes to `$INSTRUCTION_WORKFLOW`

**Change A — Phase definition field list (in Section 1 — Phases (Nodes)):**

Old:
> Every node must define:
> - **Input** — what arrives from the prior node (the entry condition for this phase)
> - **Owner** — which role runs this node
> - **Output** — what artifact or state this node produces (the exit condition; what fires the outgoing edge)

New:
> Every node must define:
> - **Input** — what arrives from the prior node (the entry condition for this phase)
> - **Owner** — which role runs this node. The phase owner is always an agent role — never a human. Human involvement is encoded via the `Human-collaborative` field.
> - **Output** — what artifact or state this node produces (the exit condition; what fires the outgoing edge)
> - **Human-collaborative** *(when applicable)* — the nature of human contribution to this phase. Presence of this field indicates the assigned agent acts as the human interface for this work; see the Human-Collaborative Phase Pattern below.

**Change B — Add named sub-section after the field list in Section 1:**

Insert after the field list (before the existing paragraph beginning "Typical phases in a project"):

> ### Human-Collaborative Phase Pattern
>
> When a phase carries a `Human-collaborative` field, the agent assigned to that phase acts as the interface between the human and the workflow. The agent has three obligations:
>
> 1. **Surface context** — present the relevant context to the human so they can contribute effectively.
> 2. **Elicit contribution** — draw out the decisions, direction, or work the human provides.
> 3. **Author the artifact** — write the outgoing handoff artifact, encoding the human's contribution in the correct format.
>
> The agent authors every artifact regardless of how much of the underlying work or decision came from the human. This preserves workflow structural integrity: every artifact is agent-authored, every handoff format is correct, and no artifact quality depends on the human's willingness or ability to produce structured output.
>
> **Value format:** The `Human-collaborative` field value is a brief phrase naming the nature of the human's contribution — `direction`, `decision`, `content`, `approval`, or similar. A descriptive value tells the agent what to surface and elicit. A binary marker does not.
>
> **Structural rule:** Phase 1 of every workflow carries the `Human-collaborative` field. The direction source is always the human — the human identifies the need, direction change, or trigger that initiates the flow. Phase 1's assigned agent (typically the Owner) is always the interface for this initiation. No other phases carry this field by default; add it to a phase only when the human must actively contribute content, decisions, or direction within that phase.

---

### 3. Changes to `$A_SOCIETY_WORKFLOW` (MAINT)

**Phase 1 — Owner field:**

Old:
> **Owner:** Curator (for `general/` additions and maintenance); Human (for direction changes).

New:
> **Owner:** Curator (for `general/` additions and maintenance); Owner (for direction changes).
> **Human-collaborative:** direction — the human provides the need, direction change, or feedback signal that initiates the flow.

*(No other phases in `$A_SOCIETY_WORKFLOW` have "Human" as a phase owner. Phase 2 through Phase 5 are already agent-owned.)*

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
