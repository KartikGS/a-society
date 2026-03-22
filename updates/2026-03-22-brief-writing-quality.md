# A-Society Framework Update — 2026-03-22

**Framework Version:** v19.1
**Previous Version:** v19.0

## Summary

Three brief-writing quality rules added to the general Owner role template (authority designation, topology-based obligation, behavioral property consistency) and two Curator role template additions (Approval Invariant topology check Hard Rules bullet; new Implementation Practices section). These additions address behavioral guidance gaps where agents had no written rule and were forced to infer or apply conservative defaults unnecessarily.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 5 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Authority designation — Owner role template

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** Added "**Authority designation:**" paragraph to the Brief-Writing Quality section. States that `[Curator authority — implement directly]` can extend write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief, and that absent explicit designation the receiving role operates within its default scope.
**Why:** Without a written rule, the receiving role cannot determine whether the label is a scope extension or a shorthand. The brief is now the declared mechanism for explicit authority designation.
**Migration guidance:** Inspect your project's `$[PROJECT]_OWNER_ROLE` Brief-Writing Quality section. If no "Authority designation" guidance is present, add the following paragraph after the ordered-list insertion guidance (or equivalent position):

> **Authority designation:** The `[Curator authority — implement directly]` label can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief. Absent explicit designation, the receiving role operates within its default scope. The brief is the correct home for explicit authority designation.

---

### Topology-based obligation — Owner role template

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** Added "**Topology-based obligation:**" paragraph to the Brief-Writing Quality section, immediately after the authority designation paragraph. Requires the Owner to explicitly state in the brief when no proposal artifact is required because the workflow plan has no Proposal phase.
**Why:** Without this obligation, the Curator either produces an unnecessary proposal artifact or self-authorizes skipping it. The Owner bears the obligation; the Curator relies on the explicit statement.
**Migration guidance:** Inspect your project's `$[PROJECT]_OWNER_ROLE` Brief-Writing Quality section. If no topology-based obligation guidance is present, add the following paragraph after the authority designation paragraph:

> **Topology-based obligation:** When a flow has no Proposal phase (per the workflow plan), the brief must explicitly state that no proposal artifact is required before implementation begins.

---

### Behavioral property consistency — Owner role template

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** Added "**Behavioral property consistency:**" paragraph to the Brief-Writing Quality section. Requires the Owner to verify that behavioral properties specified in a brief (ordering, mutability, timing constraints) are internally consistent before sending.
**Why:** Contradictory properties in a brief propagate downstream into proposals and then into implementations. The Owner is the correct enforcement point before the brief is issued.
**Migration guidance:** Inspect your project's `$[PROJECT]_OWNER_ROLE` Brief-Writing Quality section. If no behavioral property consistency guidance is present, add the following paragraph within the classification prohibition block (after "This prohibition applies to briefs and to the main approval rationale — those two contexts only." and before the update report phase handoffs permission sentence):

> **Behavioral property consistency:** When specifying behavioral properties (ordering, mutability, timing constraints), verify that they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream.

---

### Approval Invariant topology check — Curator role template Hard Rules

**Impact:** Recommended
**Affected artifacts:** `general/roles/curator.md`
**What changed:** Added "**Approval Invariant topology check.**" bullet to the Hard Rules section. States that when the workflow plan shows no Proposal phase and the Owner brief explicitly states that no proposal artifact is required, the brief constitutes authorization and no separate proposal artifact is needed.
**Why:** Without this rule, Curators in no-Proposal-phase flows must either apply the default Approval Invariant conservatively or self-authorize skipping the artifact. The rule provides the waiver under the correct condition: the Owner brief must explicitly state it.
**Migration guidance:** Inspect your project's `$[PROJECT]_CURATOR_ROLE` Hard Rules section. If no topology check or topology waiver guidance is present, add the following bullet after the "Maintenance changes within scope require no approval" bullet:

> - **Approval Invariant topology check.** If the workflow plan shows no Proposal phase, the Owner brief constitutes authorization; no separate proposal artifact is required before implementation begins. The brief must explicitly state this.

---

### Implementation Practices section — Curator role template

**Impact:** Recommended
**Affected artifacts:** `general/roles/curator.md`
**What changed:** Added a new "## Implementation Practices" section after the Hard Rules section. Contains one subsection: "Proposal stage — behavioral property consistency," requiring the Curator to verify that proposed output language does not contain contradictory behavioral properties before submitting any proposal.
**Why:** The general Curator role template lacked this section. Adding it ensures all projects adopting the Curator role receive this quality check at initialization.
**Migration guidance:** Inspect your project's `$[PROJECT]_CURATOR_ROLE` for an "Implementation Practices" section. If none is present, add the following section after the Hard Rules section and before the Context Loading section:

> ## Implementation Practices
>
> **Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
