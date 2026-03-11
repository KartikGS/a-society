# Owner → Curator: Briefing

**Subject:** Decision template and Owner role — follow-up actions and brief quality
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

Two improvements identified across the backward passes of `20260311-protocol-and-template-improvements`:

1. The decision template (`$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) has no section for post-implementation follow-up. The Owner has been adding an informal "Follow-Up Actions" section in every decision this session — but it is not in the template, so its content varies by memory rather than by structure. This should be a formal section with a standing prompt covering the three recurring questions after every approved decision.

2. The Owner role file (`$A_SOCIETY_OWNER_ROLE`) has no brief-writing guidance. Two flows in this session demonstrated that fully-specified briefs (no open questions) enable mechanical proposal rounds with no revisions. This is a deliberate technique worth codifying — the Owner should aim for full specification when a change is entirely derivable from existing instructions.

---

**Change 1 — `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`: Add "Follow-Up Actions" section**

Add a new section after "If APPROVED — Implementation Constraints" / "If REVISE — Required Changes" and before "Curator Confirmation Required". It should appear on APPROVED decisions only (or be marked conditional). The section contains a standing prompt with three items:

1. **Update report:** Assess whether this change requires a framework update report (Curator checks trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not pre-assert required or not required here).
2. **Backward pass:** Backward pass findings are required from both roles after implementation unless the Owner explicitly waives them (e.g., for trivial cosmetic changes).
3. **Version increment:** If an update report is produced, version increment happens as part of Phase 4 registration — Curator handles.

The phrasing for item 1 must use "assess whether" not "required" — the Curator makes the determination, not the Owner.

**Change 2 — `$A_SOCIETY_OWNER_ROLE`: Add brief-quality guidance**

Add a new section or subsection in the Owner role file covering brief-writing quality. Placement: between "Post-Confirmation Protocol" and "Handoff Output" — since the brief is the trigger for the first handoff.

Content: When a change is fully derivable from existing instructions (no ambiguity about scope, target, or implementation approach), write a fully-specified brief with no open questions and state "None" explicitly in that section. This signals to the Curator that the proposal round is mechanical — no judgment calls, straight to draft content. This reduces the proposal round to a confirmation step and eliminates revision cycles for straightforward changes.

---

## Scope

**In scope:**
- Adding the Follow-Up Actions section to `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`
- Adding brief-quality guidance to `$A_SOCIETY_OWNER_ROLE` in the specified placement

**Out of scope:**
- Changes to the brief template (`$A_SOCIETY_COMM_TEMPLATE_BRIEF`) — already updated in `20260311-protocol-and-template-improvements`
- Changes to the Curator role or workflow documents

---

> **Responsibility transfer note:** No responsibility transfers in this brief. Not applicable.

---

## Likely Targets

- `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` — `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator.md`
- `$A_SOCIETY_OWNER_ROLE` — `/a-society/a-docs/roles/owner.md`

---

## Open Questions for the Curator

1. **Follow-Up Actions section conditionality:** The section is most relevant on APPROVED decisions. On REVISE, backward pass doesn't apply yet, and update reports aren't assessed until implementation is complete. Propose whether the section appears on all decisions with appropriate conditional language, or only on APPROVED decisions (with the template guiding the Owner to omit it on REVISE/REJECTED).

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Decision template and Owner role — follow-up actions and brief quality."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
