# Curator → Owner: Proposal / Submission

> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `02-curator-to-owner.md`).

---

**Subject:** Decision template and Owner role — follow-up actions and brief quality
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-11

---

## Trigger

Owner identified two structural gaps through backward passes of `20260311-protocol-and-template-improvements`: the decision template has no formal Follow-Up Actions section despite the Owner adding one informally in every approved decision this session, and the Owner role has no guidance on brief-writing quality despite two flows demonstrating that fully-specified briefs eliminate revision cycles.

---

## What and Why

**Change 1 — Follow-Up Actions section in the decision template:**
The Owner has been adding a Follow-Up Actions section to every APPROVED decision this session, but the section is not in the template — so its content varies by memory rather than by structure. Formalizing it as a standing prompt with three items ensures the three recurring post-implementation questions (update report, backward pass, version increment) are consistently addressed after every approved decision, regardless of which Owner session issues it.

**Change 2 — Brief-writing quality guidance in the Owner role:**
Two flows this session demonstrated that fully-specified briefs — covering scope, target, and implementation approach with no open questions — reduce the proposal round to a confirmation step and eliminate revision cycles for straightforward changes. This is a deliberate technique worth codifying so it is applied consistently, not only when the Owner happens to recall it.

---

## Where Observed

A-Society — internal. Both gaps were identified through backward pass reflection on `20260311-protocol-and-template-improvements`.

---

## Target Location

- `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` — decision template
- `$A_SOCIETY_OWNER_ROLE` — Owner role file

---

## Draft Content

### Change 1 — `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`

**Open question resolution:** APPROVED-only, not conditional language on all decisions.

**Reasoning:** The template already uses a conditional section structure — "If APPROVED — Implementation Constraints" and "If REVISE — Required Changes" — establishing that outcome-scoped sections are its natural form. All three follow-up items only apply after implementation, which only follows an APPROVED decision. REVISE and REJECTED decisions do not trigger any of them: no implementation occurs, no update report is assessed, no backward pass runs, no version increment is possible. Adding Follow-Up Actions as an APPROVED-conditional section follows the established pattern and keeps REVISE and REJECTED decisions free of inapplicable prompts.

**Proposed addition** — insert between "If APPROVED — Implementation Constraints" and "Curator Confirmation Required":

```
## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking.
2. **Backward pass:** Backward pass findings are required from both roles unless the Owner explicitly waives them (e.g., for trivial cosmetic changes).
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.
```

---

### Change 2 — `$A_SOCIETY_OWNER_ROLE`

**Proposed placement:** New `## Brief-Writing Quality` section between "Post-Confirmation Protocol" and "Handoff Output".

**Proposed content:**

```
## Brief-Writing Quality

When a change is fully derivable from existing instructions — no ambiguity about scope, target, or implementation approach — write a fully-specified brief:

- Cover all three dimensions explicitly: scope, target file(s), and implementation approach
- State **"None"** explicitly in the Open Questions section
- This signals to the Curator that the proposal round is mechanical: no judgment calls, straight to draft content

A fully-specified brief reduces the proposal round to a confirmation step and eliminates revision cycles for straightforward changes. Reserve open questions for changes that genuinely require Curator judgment.
```

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
