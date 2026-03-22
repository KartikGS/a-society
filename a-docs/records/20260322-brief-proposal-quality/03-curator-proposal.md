**Subject:** Brief-writing and proposal quality — write authority label, behavioral property consistency, topology waiver; component 4 update report
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-22

---

## Trigger

Two sources:

1. Owner brief `02-owner-to-curator-brief.md` — five behavioral guidance additions across Owner and Curator role files.
2. Owner findings `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md` (Finding 1, Item A) — deferred update report assessment for the component4-design-advisory flow.

---

## What and Why

**Items 1a, 1b, 1c, 2a, 2b (brief-writing quality):** Five behavioral guidance gaps across Owner and Curator role files — situations where agents had no written rule and were forced to infer or apply conservative defaults unnecessarily.

**Item 6 (component4 update report):** The component4-design-advisory flow changed `$GENERAL_IMPROVEMENT` (a `general/` file used by adopting projects). The `orderWithPromptsFromFile` invocation signature changed from one to two required parameters, and phase-instruction embedding behavior was documented. The Phase 7 update report obligation was not completed in that flow; this item closes the gap.

---

## Where Observed

A-Society — internal. All items identified through operational gaps in A-Society framework development workflows.

---

## Target Location

**Items 1a, 1b, 1c, 2a, 2b:**
- `$GENERAL_OWNER_ROLE` — Brief-Writing Quality section
- `$A_SOCIETY_OWNER_ROLE` — Brief-Writing Quality section (MAINT echo)
- `$GENERAL_CURATOR_ROLE` — Hard Rules section (item 2b) and new Implementation Practices section (item 2a)
- `$A_SOCIETY_CURATOR_ROLE` — Hard Rules section (item 2b — MAINT echo); Implementation Practices verified (item 2a — verify only)

**Item 6:**
- `$A_SOCIETY_UPDATES_DIR` — new update report file, if approved

---

## Item 2a Echo Verification

The brief designates item 2a for `$A_SOCIETY_CURATOR_ROLE` as **verify only** — the existing Implementation Practices section must be checked for substantive equivalence.

**Existing text in `$A_SOCIETY_CURATOR_ROLE`, "Proposal stage — behavioral property consistency" subsection:**

> **Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

**Proposed text for `$GENERAL_CURATOR_ROLE`:**

> **Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

**Verdict:** Identical. The existing `$A_SOCIETY_CURATOR_ROLE` text is substantively equivalent. **No change required** to `$A_SOCIETY_CURATOR_ROLE` for item 2a.

---

## Draft Content

### Item 1a — Authority designation paragraph

**Add to `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality section):**

> **Authority designation:** The `[Curator authority — implement directly]` label can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief. Absent explicit designation, the receiving role operates within its default scope. The brief is the correct home for explicit authority designation.

**Placement in `$GENERAL_OWNER_ROLE`:** After the "**Ordered-list insertions:**" paragraph; before the "Output-format changes are an exception." sentence.

**Placement in `$A_SOCIETY_OWNER_ROLE`:** After the "**Multi-file scopes:**" paragraph; before the "**Output-format changes are not mechanical.**" paragraph.

---

### Item 1c — Topology-based obligation paragraph

**Add to `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality section), immediately after item 1a:**

> **Topology-based obligation:** When a flow has no Proposal phase (per the workflow plan), the brief must explicitly state that no proposal artifact is required before implementation begins.

**Placement in `$GENERAL_OWNER_ROLE`:** Immediately after the "**Authority designation:**" paragraph added in item 1a; before the "Output-format changes are an exception." sentence.

**Placement in `$A_SOCIETY_OWNER_ROLE`:** Immediately after the "**Authority designation:**" paragraph added in item 1a; before the "**Output-format changes are not mechanical.**" paragraph.

---

### Item 1b — Behavioral property consistency paragraph

**Add to `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality section):**

> **Behavioral property consistency:** When specifying behavioral properties (ordering, mutability, timing constraints), verify that they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream.

**Placement in `$GENERAL_OWNER_ROLE`:** The existing paragraph beginning "This prohibition applies to briefs and to the main approval rationale — those two contexts only." currently runs directly into "Classification guidance issued in **update report phase handoffs** is permitted…" as a single paragraph. This insertion splits that paragraph:

- "This prohibition applies to briefs and to the main approval rationale — those two contexts only." remains as the closing sentence of its current paragraph.
- The new "**Behavioral property consistency:**" paragraph follows as a standalone paragraph.
- "Classification guidance issued in **update report phase handoffs** is permitted…" becomes its own paragraph.

**Placement in `$A_SOCIETY_OWNER_ROLE`:** Same split logic applies. "This prohibition applies to briefs and to the main approval rationale — those two contexts only." is currently followed by "Classification guidance issued in **update report phase handoffs** is permitted…" within a single paragraph. The insertion:

- "This prohibition applies to briefs and to the main approval rationale — those two contexts only." becomes the closing sentence of its paragraph.
- The new "**Behavioral property consistency:**" paragraph follows.
- "Classification guidance issued in **update report phase handoffs** is permitted…" becomes its own paragraph.
- "**Tooling dev flows:**" paragraph follows unchanged.

---

### Item 2b — Approval Invariant topology check (Hard Rules bullet)

**Add to `$GENERAL_CURATOR_ROLE` Hard Rules section:**

> - **Approval Invariant topology check.** If the workflow plan shows no Proposal phase, the Owner brief constitutes authorization; no separate proposal artifact is required before implementation begins. The brief must explicitly state this.

**Placement in `$GENERAL_CURATOR_ROLE`:** After the "**Maintenance changes within scope require no approval.**" bullet; before the "**If a maintenance change implies a direction decision, stop and escalate.**" bullet.

**Add to `$A_SOCIETY_CURATOR_ROLE` Hard Rules section (MAINT echo):**

> - **Topology waiver:** If the workflow plan shows no Proposal node, the brief constitutes authorization; no proposal artifact is required. The brief must explicitly state this (see `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality).

**Placement in `$A_SOCIETY_CURATOR_ROLE`:** After the "**MAINT exemption:**" paragraph (beginning "Items explicitly marked `[MAINT]`…"); before the "**When a gate condition is met, return to the Owner for session routing.**" bullet.

---

### Item 2a — Implementation Practices section (general template)

**Add to `$GENERAL_CURATOR_ROLE` as a new section:**

> ## Implementation Practices
>
> **Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

**Placement in `$GENERAL_CURATOR_ROLE`:** After the Hard Rules section (including the new bullet added in item 2b); before the Context Loading section.

**`$A_SOCIETY_CURATOR_ROLE`:** No change required (verified equivalent — see Item 2a Echo Verification above).

---

### Item 6 — Component 4 update report assessment

**Source:** `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md`, Finding 1, Item A.

**Assessment against `$A_SOCIETY_UPDATES_PROTOCOL`:**

Two changes from the component4-design-advisory flow touched `$GENERAL_IMPROVEMENT` (a `general/` file distributed to adopting projects):

1. **`orderWithPromptsFromFile` signature change.** The function previously took one required parameter (`recordFolderPath`). It now requires two (`recordFolderPath`, `synthesisRole`). This was reflected in the `$GENERAL_IMPROVEMENT` tooling invocation note. Adopting projects that instantiated `$GENERAL_IMPROVEMENT` before this flow will have the old single-parameter invocation in their improvement protocol. Any agent following that documentation and invoking the tool will now fail — the second argument is required with no default. **Trigger condition met. Classification: Breaking.**

2. **Phase-instruction embedding addition.** A new paragraph was added to `$GENERAL_IMPROVEMENT` documenting that Component 4 generated prompts automatically embed a `Read:` reference to the relevant phase instructions (`### Meta-Analysis Phase` or `### Synthesis Phase`). Adopting projects' improvement protocols lack this documentation. **Trigger condition met. Classification: Recommended.**

**Update report draft is included below.** Publication sequencing note: this report covers changes from the component4 flow, which was implemented before the brief-writing quality items in this proposal. If both reports are approved in this flow, this report (v18.1 → v19.0) must be published before the brief-writing quality report (v19.0 → v19.1).

---

## Update Report Draft — Component 4 Changes

# A-Society Framework Update — 2026-03-22

**Framework Version:** v19.0
**Previous Version:** v18.1

## Summary

The `orderWithPromptsFromFile` function in Component 4 (Backward Pass Orderer) now requires a second mandatory argument, `synthesisRole`. This is a breaking change for any caller using the old single-parameter signature. The `$GENERAL_IMPROVEMENT` tooling description was updated to reflect the new signature and to document the embedded phase-instruction behavior of generated prompts. Adopting projects must update their improvement protocol's invocation note and any direct tool invocations.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvement worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### `orderWithPromptsFromFile` signature change — two required parameters

**Impact:** Breaking
**Affected artifacts:** `general/improvement/main.md`
**What changed:** `orderWithPromptsFromFile` now requires a second mandatory parameter, `synthesisRole: string`. Old signature: `orderWithPromptsFromFile(recordFolderPath)`. New signature: `orderWithPromptsFromFile(recordFolderPath, synthesisRole)`. The `$GENERAL_IMPROVEMENT` tooling invocation note was updated to reflect this. The `synthesis_role` field was simultaneously removed from the `workflow.md` record folder schema; the synthesis role is now supplied by the calling agent at invocation time rather than read from the record folder.
**Why:** Decouples synthesis role configuration from the record folder. The calling agent always knows the synthesis role at invocation time; embedding it in `workflow.md` was an unnecessary schema dependency. The change also makes Component 4 usable by any project regardless of which role performs synthesis.
**Migration guidance:** Inspect your project's `$[PROJECT]_IMPROVEMENT` (or `a-docs/improvement/main.md`) backward pass tooling description. If it documents `orderWithPromptsFromFile(recordFolderPath)` (single parameter), update the invocation to `orderWithPromptsFromFile(recordFolderPath, synthesisRole)`, where `synthesisRole` is the name of the role that performs backward pass synthesis in your project. Also update any agent that invokes the tool directly. Existing record folders that contain `synthesis_role` in their `workflow.md` do not need to be migrated — the field is silently ignored by the updated component.

---

### Embedded phase-instruction references in Component 4 prompts

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** Added an "Embedded instructions" paragraph to the `$GENERAL_IMPROVEMENT` backward pass tooling description. Component 4 generated prompts now automatically embed a `Read:` reference to the relevant phase-instruction section (`### Meta-Analysis Phase` or `### Synthesis Phase`) in the improvement document. Roles follow this reference to orient to their phase-specific tasks; no separate session-start loading of the improvement document is required.
**Why:** Previously, the tooling note described invocation only. Agents in adopting projects relying on the template would not know that phase instructions are delivered inline — potentially leading them to attempt loading the full improvement document unnecessarily at session start.
**Migration guidance:** Inspect your project's `$[PROJECT]_IMPROVEMENT` backward pass tooling description. If it lacks an embedded-instructions note after the invocation description, add the following paragraph:

> **Embedded instructions:** Generated prompts automatically embed a `Read:` reference to the relevant phase instructions in this document (`### Meta-Analysis Phase` or `### Synthesis Phase`). Roles follow these references to orient to their phase-specific tasks; no separate session-start loading of the improvement document is required. Consult the project's tooling documentation for the specific invocation path. When no such tool is available, apply the traversal rules above manually.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Update Report Draft — Brief-Writing Quality Changes

# A-Society Framework Update — 2026-03-22

**Framework Version:** v19.1
**Previous Version:** v19.0

## Summary

Three brief-writing quality rules added to the general Owner role template (authority designation, topology-based obligation, behavioral property consistency) and two Curator role template additions (Approval Invariant topology check Hard Rules bullet; new Implementation Practices section). These additions address behavioral guidance gaps: situations where agents had no written rule and were forced to infer or apply conservative defaults unnecessarily.

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
**Migration guidance:** Inspect your project's `$[PROJECT]_OWNER_ROLE` Brief-Writing Quality section. If no behavioral property consistency guidance is present, add the following paragraph (within the classification prohibition block, after "This prohibition applies to briefs and to the main approval rationale — those two contexts only." and before the update report phase handoffs permission sentence):

> **Behavioral property consistency:** When specifying behavioral properties (ordering, mutability, timing constraints), verify that they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream.

---

### Approval Invariant topology check — Curator role template Hard Rules

**Impact:** Recommended
**Affected artifacts:** `general/roles/curator.md`
**What changed:** Added "**Approval Invariant topology check.**" bullet to the Hard Rules section. States that when the workflow plan shows no Proposal phase and the Owner brief explicitly states that no proposal artifact is required, the brief constitutes authorization and no separate proposal artifact is needed.
**Why:** Without this rule, Curators in no-Proposal-phase flows must either apply the default Approval Invariant conservatively (producing an unnecessary artifact) or self-authorize skipping the artifact. The rule provides the waiver under the correct condition: the Owner brief must explicitly state it.
**Migration guidance:** Inspect your project's `$[PROJECT]_CURATOR_ROLE` Hard Rules section. If no topology check or topology waiver guidance is present, add the following bullet after the "Maintenance changes within scope require no approval" bullet:

> - **Approval Invariant topology check.** If the workflow plan shows no Proposal phase, the Owner brief constitutes authorization; no separate proposal artifact is required before implementation begins. The brief must explicitly state this.

---

### Implementation Practices section — Curator role template

**Impact:** Recommended
**Affected artifacts:** `general/roles/curator.md`
**What changed:** Added a new "## Implementation Practices" section after the Hard Rules section. Contains one subsection: "Proposal stage — behavioral property consistency," requiring the Curator to verify that proposed output language does not contain contradictory behavioral properties before submitting any proposal.
**Why:** The general Curator role template lacked this section. The A-Society-specific Curator role already contained it. Adding it to the general template ensures all projects adopting the Curator role receive this quality check.
**Migration guidance:** Inspect your project's `$[PROJECT]_CURATOR_ROLE` for an "Implementation Practices" section. If none is present, add the following section after the Hard Rules section and before the Context Loading section:

> ## Implementation Practices
>
> **Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
