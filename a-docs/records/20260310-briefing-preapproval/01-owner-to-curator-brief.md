# Owner → Curator: Briefing

**Subject:** Flow A — Briefing pre-approval language and Approval Invariant timing
**Status:** BRIEFED
**Date:** 2026-03-10

---

## Agreed Change

The flow in `20260308-handoff-protocol` exposed a structural gap: a briefing containing the phrase "this briefing constitutes that approval" was reasonably read by the Curator as permission to begin implementation before a Phase 2 decision artifact was written. No document told the Curator that was wrong. The gap must be closed in four places.

**1. `$A_SOCIETY_WORKFLOW` — Approval Invariant (Invariant 2)**
The invariant currently governs *what* requires approval (`general/` writes) but not *when* approval is established or in what form. Add timing: a Phase 2 Owner decision artifact is required before implementation begins, regardless of any direction-level alignment stated in the briefing.

**2. `$A_SOCIETY_WORKFLOW` — Phase 1 description**
Add a sentence clarifying that a briefing establishes scope and direction alignment only. The Phase 2 decision artifact is a separate, subsequent step — not implied by the briefing and not replaceable by it.

**3. `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — Pre-approval language guidance**
The template currently contains no constraint on approval language. Add a note clarifying what directional pre-approval in a briefing covers and does not cover: a briefing may state that a direction is acceptable in principle; it must not state or imply that implementation may proceed without a Phase 2 decision.

**4. `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` — Briefing handoff format requirements**
The Owner → Curator briefing section describes what a well-formed briefing must contain but says nothing about what it cannot authorize. Add an explicit statement that a briefing cannot substitute for a Phase 2 decision artifact — the Curator must not begin implementation on briefing language alone.

These four changes address the same root failure from different angles: the invariant provides the rule, the workflow Phase 1 provides the rationale, the template prevents the Owner from writing unsafe language, and the handoff protocol prevents the Curator from acting on it if they do.

---

## Scope

**In scope:**
- Extending Approval Invariant 2 in `$A_SOCIETY_WORKFLOW` to specify timing and artifact form
- Adding a clarifying sentence to the Phase 1 description in `$A_SOCIETY_WORKFLOW`
- Adding a pre-approval scope note to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
- Adding a briefing-authorization limit to the Owner → Curator section of `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`

**Out of scope:**
- Propagating these changes to `general/` instructions — portability deferred; the synthesis flags this as a possible future step after the A-Society-specific fix proves sound
- Changes to the Owner or Curator role documents — both already correctly describe the Phase 2 requirement; the gap is in the workflow and communication documents, not the role files
- Restricting what context or directional information an Owner may share in a briefing — the fix constrains approval language specifically, not the informational scope of a briefing

---

## Likely Target

- `$A_SOCIETY_WORKFLOW` — Invariant 2 and Phase 1 section
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — inline note in the Agreed Change section instructions, or a standalone note near the top of the template
- `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` — Owner → Curator (Trigger → Phase 1: Briefing) section

---

## Open Questions for the Curator

1. **Approval Invariant wording:** The current Invariant 2 reads: *"The Curator does not write to `general/` without Owner approval. Every addition to the general library is reviewed before creation. Drafting is permitted; creating is not."* The fix adds timing — the Phase 2 decision artifact is when and how approval is established. Draft the addition and confirm it is unambiguous before proposing. The invariant must not become so long that it obscures the core rule.

2. **Template note placement:** The briefing template is minimal. The pre-approval guidance could go as a note within the Agreed Change section instructions, as a callout at the top of the template body, or as a brief "Scope of This Briefing" note. Propose a placement that makes the constraint visible without adding noise to the common case where no pre-approval is stated.

3. **Handoff-protocol state:** The handoff protocol was updated in the 2026-03-10 maintenance bundle for Flows B and C. Confirm the document is in the expected state before drafting. The addition for Flow A should fit the existing structure of the Owner → Curator section — confirm whether a sentence extension or a short subsection is the right form.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Flow A — Briefing pre-approval language and Approval Invariant timing."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
