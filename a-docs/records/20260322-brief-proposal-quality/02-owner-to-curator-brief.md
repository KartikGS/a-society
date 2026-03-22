**Subject:** Brief-writing and proposal quality — write authority label, behavioral property consistency, topology waiver
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$GENERAL_OWNER_ROLE` | additive — 3 new paragraphs in Brief-Writing Quality section |
| `$A_SOCIETY_OWNER_ROLE` | additive — 3 new paragraphs in Brief-Writing Quality section (MAINT echo) |
| `$GENERAL_CURATOR_ROLE` | additive — 1 new bullet in Hard Rules; 1 new Implementation Practices section |
| `$A_SOCIETY_CURATOR_ROLE` | additive — 1 new bullet in Hard Rules; verify existing Implementation Practices for echo (MAINT echo) |

This brief adds five pieces of behavioral guidance split across the Owner and Curator roles — two concerning what a brief must explicitly state, one concerning a pre-send quality check, and two concerning how the Curator handles proposals and the Approval Invariant.

---

### Item 1a — Write authority label `[Requires Owner approval]`
**Target:** `$GENERAL_OWNER_ROLE` (LIB), echoed to `$A_SOCIETY_OWNER_ROLE` (MAINT)
**Edit mode:** `[additive — new labeled paragraph]`

The `[Curator authority — implement directly]` label can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief. Without explicit designation, the receiving role operates within its default scope. The brief is the correct home for explicit authority designation.

Add the following paragraph to the Brief-Writing Quality section of both files:

> **Authority designation:** The `[Curator authority — implement directly]` label can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief. Absent explicit designation, the receiving role operates within its default scope. The brief is the correct home for explicit authority designation.

**Placement in `$GENERAL_OWNER_ROLE`:** After the "**Ordered-list insertions:**" paragraph and before the "Output-format changes are an exception." paragraph.

**Placement in `$A_SOCIETY_OWNER_ROLE`:** After the "**Multi-file scopes:**" paragraph and before the "**Output-format changes are not mechanical.**" paragraph.

---

### Item 1c — Topology-based obligation `[Requires Owner approval]`
**Target:** `$GENERAL_OWNER_ROLE` (LIB), echoed to `$A_SOCIETY_OWNER_ROLE` (MAINT)
**Edit mode:** `[additive — new labeled paragraph, immediately after item 1a]`

When a flow has no Proposal phase (per the workflow plan), the brief must explicitly state that no proposal artifact is required before implementation begins. This is a brief-writing obligation that pairs with the Curator's topology waiver (item 2b below): the Curator may rely on this statement; the Owner is responsible for making it.

Add the following paragraph immediately after item 1a in both files:

> **Topology-based obligation:** When a flow has no Proposal phase (per the workflow plan), the brief must explicitly state that no proposal artifact is required before implementation begins.

**Placement:** Immediately after the "**Authority designation:**" paragraph added in item 1a.

---

### Item 1b — Behavioral property consistency `[Requires Owner approval]`
**Target:** `$GENERAL_OWNER_ROLE` (LIB), echoed to `$A_SOCIETY_OWNER_ROLE` (MAINT)
**Edit mode:** `[additive — new labeled paragraph]`

When specifying behavioral properties (ordering, mutability, timing constraints), the Owner must verify internal consistency before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream — in the proposal, and then in the implementation.

Add the following paragraph to the Brief-Writing Quality section of both files:

> **Behavioral property consistency:** When specifying behavioral properties (ordering, mutability, timing constraints), verify that they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream.

**Placement in `$GENERAL_OWNER_ROLE`:** After the "This prohibition applies to briefs and to the main approval rationale — those two contexts only." sentence (end of the classification prohibition block) and before the classification-in-update-report-handoffs permission paragraph.

**Placement in `$A_SOCIETY_OWNER_ROLE`:** After the "This prohibition applies to briefs and to the main approval rationale — those two contexts only." sentence and before the classification-in-update-report-handoffs permission paragraph (and before the "**Tooling dev flows:**" paragraph).

---

### Item 2b — Approval Invariant topology check `[Requires Owner approval]`
**Target:** `$GENERAL_CURATOR_ROLE` (LIB), echoed to `$A_SOCIETY_CURATOR_ROLE` (MAINT)
**Edit mode:** `[additive — new Hard Rules bullet]`

When the workflow plan shows no Proposal phase, the Owner brief constitutes authorization; no separate proposal artifact is required. This waiver is conditional on the brief explicitly stating it (see Owner item 1c). Without that explicit statement, the Approval Invariant applies.

**Addition to `$GENERAL_CURATOR_ROLE` Hard Rules:**

Add the following bullet to the Hard Rules section:

> - **Approval Invariant topology check.** If the workflow plan shows no Proposal phase, the Owner brief constitutes authorization; no separate proposal artifact is required before implementation begins. The brief must explicitly state this.

**Placement in `$GENERAL_CURATOR_ROLE`:** After the "**Maintenance changes within scope require no approval.**" bullet and before the "**If a maintenance change implies a direction decision, stop and escalate.**" bullet.

**Addition to `$A_SOCIETY_CURATOR_ROLE` Hard Rules (MAINT echo):**

Add the following text after the MAINT exemption paragraph (the paragraph beginning "**MAINT exemption:**") and before the "**When a gate condition is met, return to the Owner for session routing.**" bullet:

> - **Topology waiver:** If the workflow plan shows no Proposal node, the brief constitutes authorization; no proposal artifact is required. The brief must explicitly state this (see `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality).

---

### Item 2a — Curator proposal behavioral property consistency `[Requires Owner approval]`
**Target:** `$GENERAL_CURATOR_ROLE` (LIB), echoed to `$A_SOCIETY_CURATOR_ROLE` (MAINT — verify only)
**Edit mode:** `[additive — new Implementation Practices section in general; verify in a-docs]`

Before submitting any proposal, the Curator must verify that proposed output language does not contain contradictory behavioral properties. Structural placement checks are necessary but not sufficient — semantic consistency between behavioral properties must also be verified.

**Addition to `$GENERAL_CURATOR_ROLE`:**

Add a new "## Implementation Practices" section after the Hard Rules section:

> ## Implementation Practices
>
> **Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

**Placement:** After the Hard Rules section (including the new bullet added in item 2b) and before the Context Loading section.

**Echo to `$A_SOCIETY_CURATOR_ROLE` (MAINT — verify only):** The `$A_SOCIETY_CURATOR_ROLE` Implementation Practices section already contains a behavioral property consistency check. Verify that the existing text in the "Proposal stage — behavioral property consistency" subsection is substantively equivalent to the text above. If equivalent, no change is required — document the verification. If the existing text is materially different or weaker, update it to match.

---

## Scope

**In scope:**
- All five additions as specified above (items 1a, 1b, 1c, 2a, 2b)
- MAINT echoes to both A-Society role files
- Update report assessment post-implementation

**Out of scope:**
- Any other changes to Owner or Curator role files not named above
- Changes to the Approval Invariant beyond adding the topology waiver bullet
- Changes to the `$A_SOCIETY_COMM_TEMPLATE_PLAN` or workflow documents

---

## Likely Target

- `$GENERAL_OWNER_ROLE` (`a-society/general/roles/owner.md`)
- `$A_SOCIETY_OWNER_ROLE` (`a-society/a-docs/roles/owner.md`)
- `$GENERAL_CURATOR_ROLE` (`a-society/general/roles/curator.md`)
- `$A_SOCIETY_CURATOR_ROLE` (`a-society/a-docs/roles/curator.md`)

---

## Open Questions for the Curator

None. All five items are fully specified: scope, target files, content, and placement. The proposal round is mechanical. The only verification step is item 2a's echo check in `$A_SOCIETY_CURATOR_ROLE`.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Brief-writing and proposal quality — write authority label, behavioral property consistency, topology waiver."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
