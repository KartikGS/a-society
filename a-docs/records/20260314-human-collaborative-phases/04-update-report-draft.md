# A-Society Framework Update — 2026-03-14

**Framework Version:** v9.0
**Previous Version:** v8.0

## Summary

Two general instructions were updated to remove human-as-role-holder framing and introduce explicit human-collaboration encoding at the workflow phase level. Role documents are now defined as always written for agents; the `Human-collaborative` field has been added to the workflow phase definition format, with a structural rule that Phase 1 always carries it. Projects with existing workflow documents are missing this field on Phase 1 — this is a required update. Projects with role documents that used "human or agent" contributor framing should review and align.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in existing workflow documents — Phase 1 is missing a required field. Curator must review. |
| Recommended | 1 | Conceptual framing correction in role documents — worth adopting for consistency. |
| Optional | 0 | — |

---

## Changes

### 1. Workflow phase definition: `Human-collaborative` field added (Phase 1 mandatory)

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/workflow/main.md`]
**What changed:** The workflow phase definition format now includes a `Human-collaborative` field. When present, this field names the nature of the human's contribution to that phase (e.g., `direction`, `decision`, `approval`, `content`), and indicates that the assigned agent acts as the human interface for that work — surfacing context, eliciting the human's contribution, and authoring the outgoing artifact. A new named sub-pattern ("Human-Collaborative Phase Pattern") defines the three agent obligations that apply whenever this field is present.

A structural rule has been added: Phase 1 of every workflow always carries the `Human-collaborative` field, because the direction source is always the human. No other phases carry it by default.

The Owner field in the phase definition now includes a note: the phase owner is always an agent role — never a human.

**Why:** The prior instruction allowed "Human" to appear as a phase owner, which created a structural gap. Human-authored handoffs cannot guarantee artifact format consistency. The agent-as-interface model closes this gap: regardless of how much underlying work or decision comes from the human, an agent always authors the outgoing artifact.

**Migration guidance:** Inspect your project's workflow document(s) — specifically `$[PROJECT]_WORKFLOW` (your project's workflow main file) and any other workflow graph definitions in your `a-docs/`. For each workflow:

1. **Phase 1:** Add a `Human-collaborative` field immediately after the `Owner` field. The value should name the nature of human contribution at initiation — typically `direction` (the human provides the need or trigger that starts the flow). Example:

   ```
   **Human-collaborative:** direction — the human provides the need or trigger that initiates this flow.
   ```

2. **Other phases:** Check whether any phase currently lists "Human" as its phase owner. If so, replace it with the appropriate agent role (typically the Owner, which acts as the human interface), and add a `Human-collaborative` field naming what the human contributes. If a phase has no human involvement, no field is needed.

3. **Any role documents with "Handoff Output" sections** that tell the agent to wait for human input within a phase: verify that the relevant phase in your workflow carries the `Human-collaborative` field.

The structural rule (Phase 1 always carries this field) applies to all workflow documents, regardless of project type.

---

### 2. Role document framing: "human or agent" removed

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/roles/main.md`]
**What changed:** The opening definition of a role document has been updated: "A role document is a behavioral contract for a specific kind of contributor — human or agent" is now "A role document is a behavioral contract for an agent." The failure modes section ("Overreach" and "Paralysis") has been updated from "an agent or collaborator" to "an agent" to match.

**Why:** The "human or agent" framing implied that a human could hold a role and operate under a role document's behavioral contract. In practice, human involvement is encoded at the workflow phase level (via the `Human-collaborative` field), not at the role level. Allowing human-authored handoffs from a "human role-holder" would break artifact format consistency at every phase boundary where the human contributes.

**Migration guidance:** Inspect your project's role documents. If any role document's opening section describes the role as being for "a human or agent contributor" or equivalent phrasing, update it to describe the role as being for an agent. If any role document was written with a human contributor in mind (rather than an agent operating on the human's behalf), the document's framing should be revised: the human's involvement belongs in the workflow document as a `Human-collaborative` field on the relevant phase, not in a role document.

This is a framing correction. If your role documents were already written as behavioral contracts for agents (the typical case), no change is required.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
