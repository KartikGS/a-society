---
type: curator-to-owner
date: "2026-04-03"
---

**Subject:** Role guidance precision bundle — 9 additions to `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-03

---

## Trigger

Backward pass synthesis findings from four prior flows (`20260329-owner-protocol-and-role-guidance-bundle`, `20260331-session-routing-removal`, `20260402-parallel-track-orchestration`, `20260401-c7-removal-c3-extension-synthesis-hardcode`) and one Next Priorities entry (item 6). The corresponding guidance items have been implemented in the A-Society-specific owner and curator roles; this proposal adds the general-layer counterparts.

---

## Pre-Proposal Verification

**Item 5 (mixed-scope brief timing) — already present in `$GENERAL_OWNER_ROLE`:**

The brief lists 8 items for `$GENERAL_OWNER_ROLE`, but Item 5 is already present in the current file under Brief-Writing Quality:

> **Mixed-scope Curator briefs need an execution-timing rule.** When a brief to the Curator combines approval-scoped work with direct-authority `[MAINT]` or `[Curator authority — implement directly]` items, state whether the direct-authority items should be implemented immediately on receipt or batched into the post-approval implementation pass. Authority answers who may do the work; the brief must also answer when that work should occur.

This item is covered. The proposal below addresses the remaining 7 items for `$GENERAL_OWNER_ROLE` and 1 item for `$GENERAL_CURATOR_ROLE`.

**Cross-layer drift note — Item 8 (structured-entry replacement boundary):**

Item 8 is net-new (no prior A-Society-role precedent). Adding it to `$GENERAL_OWNER_ROLE` creates drift with `$A_SOCIETY_OWNER_ROLE`, which does not currently carry this item. This is outside the current brief's scope. Flagging as a candidate for a future maintenance flow.

---

## What and Why

Seven precision guidance additions to `$GENERAL_OWNER_ROLE` and one to `$GENERAL_CURATOR_ROLE`, each addressing a specific failure mode observed in prior A-Society flow execution. All items generalize across project types. Two items that reference programmatic constructs in the A-Society-specific roles (Items 6 and 2) are reframed in project-agnostic terms.

1. **Review artifact quality (brief-state-claim verification)** — prevents decision artifacts from making stale state claims based on session-start context.
2. **Schema-code coupling check** — ensures briefs scope both the documentation and code changes when a schema has a programmatic consumer.
3. **Removal-of-dependents scoping** — ensures that removing a structured list item triggers explicit enumeration of dependent content across affected files.
4. **Multi-track path portability** — ensures parallel-track flows verify convergence artifacts for machine-specific paths at closure.
5. **Removed-element consumer enumeration** — ensures removing or renaming a structural element enumerates consuming sites, not just the definition site.
6. **Index variable retirement reference sweep** — ensures retiring a project index variable triggers a full reference sweep before scope is finalized.
7. **Structured-entry replacement boundary (new)** — ensures that when directing a change within a structured entry, the brief specifies whether the full entry or only a named sub-element is in scope.
8. **[Curator] Implementation portability check** — ensures the Curator verifies that variable references, terminology, and examples are valid for the target context when adapting content between project-specific and general layers.

---

## Where Observed

A-Society — the A-Society project's own operational flows. The patterns are general; the A-Society-specific roles already carry these items. This proposal adds the general-layer counterparts.

---

## Target Location

- `$GENERAL_OWNER_ROLE` — `a-society/general/roles/owner.md`
- `$GENERAL_CURATOR_ROLE` — `a-society/general/roles/curator.md`

---

## Draft Content

### `$GENERAL_OWNER_ROLE` — 7 additions

---

#### O-1: Removed-element consumer enumeration
**Section:** Brief-Writing Quality
**Position:** After the "Multi-file scopes" item (ending "...to streamline the downstream role's implementation plan."), before the "Ordered-list insertions" item

**Proposed text:**

> **Removed element consumer enumeration.** When a brief removes or renames a structural element that is consumed or depended upon by other content — such as a schema type, protocol step, defined term, workflow node, or any construct referenced elsewhere — enumerate not only the definition site but also the consuming sites that must change. A definition-site removal without corresponding consumer updates leaves the structure in an inconsistent state; list consuming files in the Files Changed table rather than leaving the downstream role to discover them during implementation.

---

#### O-2: Structured-entry replacement boundary
**Section:** Brief-Writing Quality
**Position:** After the "Prose insertions" item (ending "...which creates ambiguity and can require a correction round."), before the "Instruction-text variable references" item

**Proposed text:**

> **Structured-entry replacement boundary.** When directing a change within a structured documentation entry — such as a table row, index entry, log item, or role-table record — state whether the replacement applies to the full entry or only a named sub-element within it (for example, "update only the Description cell" vs. "replace the full row"). A brief that specifies only the target entry without bounding the replacement scope leaves the downstream role to infer which parts are in scope, which can result in either over-replacement (unintended changes to adjacent fields) or under-replacement (incomplete updates).

---

#### O-3: Removal-of-dependents scoping
**Section:** Brief-Writing Quality
**Position:** After the output-format obsolescence check paragraph (ending "...transfers that obsolescence assessment to the downstream role unnecessarily."), before the "Do not pre-specify update report classification" item

**Proposed text:**

> **Removal-of-dependents scoping.** When a brief scopes removal of an item from a numbered or structured list, explicitly enumerate any other content in that file — or in sibling files receiving the same removal — that depends on the removed item and would become vestigial after its removal. This includes format blocks gated on the removed item, cross-references to it, and any prose whose meaning changes when the item no longer exists. Apply this consistently across all target files in the brief; do not scope explicit dependent removal for only the first instance noticed and leave the same pattern implicit in the remaining files.

---

#### O-4: Schema-code coupling check
**Section:** Brief-Writing Quality
**Position:** After the "Schema migrations require a vocabulary sweep" item (currently the last substantive item in Brief-Writing Quality), before the TA Advisory Review section

**Proposed text:**

> **Schema-code coupling check.** When a documentation change defines or modifies a schema that has a programmatic consumer — a type definition, parser, validator, or other code artifact that depends on the documented schema — scope both the documentation change and the corresponding code change in the same flow. At brief-writing time, ask: "Does this documentation change define or modify a schema that is consumed programmatically?" If yes, identify the programmatic consumer and include it in the flow scope. A brief scoped to documentation only when code must also change fragments the work and requires external correction.

---

#### O-5: Review Artifact Quality section (brief-state-claim verification)
**Section:** New standalone section
**Position:** After the Brief-Writing Quality section, before the TA Advisory Review section

**Proposed text:**

> ## Review Artifact Quality
>
> When a decision artifact (e.g., an Owner approval) makes a specific claim about current file state — for example, "this section is already standalone" or "this field is not present" — verify that claim by re-reading the relevant passage at review time, not from session-start context. Session-start context may reflect the file as it was when the session opened, not as it exists after prior edits in the same session or in prior sessions. A wrong state claim is wasted instruction that the downstream role must detect and override; re-reading the relevant passage before issuing the claim eliminates the correction round.

---

#### O-6: Index variable retirement reference sweep
**Section:** Constraint-Writing Quality
**Position:** After the "Registration scope must be file-based" item (ending "...a location-based qualifier can accidentally exclude the relevant file."), as the second item in the section

**Proposed text:**

> **Index variable retirement requires a reference sweep.** When a brief, decision artifact, or other Owner authorization retires a project index variable or deletes a registered artifact, sweep the project for references to that `$VARIABLE_NAME` before finalizing scope. Explicitly name every dependent file that must change so the required authorization is granted up front rather than retroactively.

---

#### O-7: Multi-track path portability
**Section:** Forward Pass Closure Discipline
**Position:** After the current last paragraph (ending "...Relevant entries are updated, narrowed, or removed before the closure artifact is filed.")

**Proposed text:**

> **Multi-track path portability.** For flows with multiple parallel tracks, verify at closure that all track convergence artifacts (e.g., completion artifacts filed by downstream roles) do not contain machine-specific absolute paths or `file://` URLs. Confirming functional completeness is not sufficient — handoff artifact format portability must also be confirmed. A `file://` path in a terminal track artifact violates the path portability rule even if the path was not used for routing.

---

### `$GENERAL_CURATOR_ROLE` — 1 addition

---

#### C-1: Implementation portability check
**Section:** Implementation Practices
**Position:** After the "Proposal stage — rendered-content matching" item (ending "...when the target document renders the same kind of content differently.")

**Proposed text:**

> **Proposal stage — implementation portability check.** When adapting content from a project-specific context to a general context — or vice versa, when instantiating general guidance into a project-specific document — verify that all variable references, terminology, and examples are valid in the target context. A `$VAR` reference valid in one project's index may not exist in another's; terminology and examples specific to a technology or domain may not apply at the general level. Replace project-specific references with generic equivalents before submitting.

---

## Update Report Draft

A framework update report qualifies: changes are made to `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` under `a-society/general/`, which affects adopting projects that have instantiated these templates.

All 8 additions are additive guidance enhancements to existing sections; no existing structure is removed or made contradictory. Preliminary classification: **Recommended** for all items. The absence of these items does not break existing role instantiations — it means adopters miss specific quality guardrails. Classification to be confirmed at Phase 4 by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. If any item qualifies as Breaking under the protocol (e.g., the new Review Artifact Quality section is read as a mandatory structural addition), the version should be MAJOR rather than MINOR.

**[Draft — version and classification preliminary; to be confirmed at Phase 4]**

---

# A-Society Framework Update — 2026-04-03

**Framework Version:** v27.2
**Previous Version:** v27.1

## Summary

Eight precision guidance additions to the general Owner and Curator role templates, derived from backward pass synthesis findings across four prior A-Society flows. The additions address specific brief-writing and implementation failure modes: state-claim verification in decision artifacts, schema-code coupling scope, structured-entry replacement boundary specification, removal-of-dependents enumeration, parallel-track path portability at closure, index variable retirement reference sweeps, removed-element consumer enumeration, and context portability when adapting content between project-specific and general layers.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 8 | Precision guidance additions to Owner and Curator role templates — adopt if these failure modes are relevant to your project |
| Optional | 0 | — |

---

## Changes

### Owner Role — Removed-Element Consumer Enumeration

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Removed element consumer enumeration" to Brief-Writing Quality. When a brief removes or renames a structural element consumed by other content, the Owner must enumerate consuming sites alongside the definition site.
**Why:** Briefs scoped to only the definition site of a removed element left downstream roles to discover consuming sites during implementation, creating ambiguity about scope.
**Migration guidance:** Review your project's Owner role Brief-Writing Quality section. If it does not address consumer-site enumeration for removals, consider adding: when a brief removes or renames a structural element referenced elsewhere, enumerate consuming sites in the Files Changed table alongside the definition site.

---

### Owner Role — Structured-Entry Replacement Boundary

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Structured-entry replacement boundary" to Brief-Writing Quality. When directing a change within a structured documentation entry, the Owner must state whether the replacement applies to the full entry or only a named sub-element.
**Why:** Briefs that identified a target entry without bounding replacement scope caused downstream roles to either over-replace (changing adjacent fields unintentionally) or under-replace (updating only part of an entry).
**Migration guidance:** Review your project's Owner role Brief-Writing Quality section. Consider adding: when directing changes within a structured entry (table row, index entry, log item), the brief must specify whether the full entry or only a named sub-element is in scope for replacement.

---

### Owner Role — Removal-of-Dependents Scoping

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Removal-of-dependents scoping" to Brief-Writing Quality. When scoping removal of a structured list item, the Owner must explicitly enumerate any dependent content in affected files that would become vestigial.
**Why:** Briefs that scoped only the primary item left downstream roles encountering vestigial cross-references and format blocks after implementation, requiring correction rounds.
**Migration guidance:** Review your project's Owner role Brief-Writing Quality section. If it addresses output-format obsolescence checks, consider adding a parallel item: when a brief removes a structured list item, enumerate all dependent content (cross-references, gated format blocks, prose that changes meaning) in that file and any sibling files receiving the same removal.

---

### Owner Role — Schema-Code Coupling Check

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Schema-code coupling check" to Brief-Writing Quality. When a documentation change defines or modifies a schema with a programmatic consumer, the brief must scope both the documentation and code changes in the same flow.
**Why:** Documentation-only briefs for schema changes left programmatic consumers in an inconsistent state, requiring a follow-up flow to update the code layer.
**Migration guidance:** If your project has programmatic tooling that consumes documented schemas, review your Owner role Brief-Writing Quality section. Consider adding: when a documentation change modifies a consumed schema, the brief must identify the programmatic consumer and include the code change in scope alongside the documentation change.

---

### Owner Role — Review Artifact Quality (Brief-State-Claim Verification)

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added a standalone "Review Artifact Quality" section. When an Owner approval makes a specific claim about current file state, the Owner must verify by re-reading the relevant passage at review time, not relying on session-start context.
**Why:** Approvals containing state claims based on session-start context were sometimes stale — the file had changed in prior edits — requiring the downstream role to detect and override the wrong claim.
**Migration guidance:** Review your project's Owner role for a review artifact quality guideline. If absent, consider adding: state claims in decision artifacts must be verified by re-reading the relevant passage at review time, not from session-start context.

---

### Owner Role — Index Variable Retirement Reference Sweep

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Index variable retirement requires a reference sweep" to Constraint-Writing Quality. When retiring a project index variable, the Owner must sweep for references and enumerate all dependent files before finalizing scope.
**Why:** Retirements scoped only to the definition site left stale `$VARIABLE_NAME` references elsewhere in the project, requiring discovery and correction during or after implementation.
**Migration guidance:** Review your project's Owner role Constraint-Writing Quality section. Consider adding: when retiring a registered index variable or deleting a registered artifact, sweep the project for references to that `$VARIABLE_NAME` and include all dependent files in scope before finalizing the brief.

---

### Owner Role — Multi-Track Path Portability

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Multi-track path portability" to Forward Pass Closure Discipline. For flows with parallel tracks, the Owner must verify at closure that convergence artifacts contain no machine-specific absolute paths or `file://` URLs.
**Why:** Parallel-track completion artifacts with machine-specific paths were accepted at closure without format verification — functional completeness was confirmed but handoff artifact portability was not.
**Migration guidance:** If your project uses multi-track parallel flows, review your Owner role Forward Pass Closure Discipline section. Consider adding: at closure, verify that all track convergence artifacts filed by downstream roles contain no machine-specific absolute paths or `file://` URLs.

---

### Curator Role — Implementation Portability Check

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/curator.md`]
**What changed:** Added "Proposal stage — implementation portability check" to Implementation Practices. When adapting content between project-specific and general contexts, the Curator must verify variable references, terminology, and examples are valid in the target context.
**Why:** Variable references valid in one project's index were carried into general-layer proposals without substitution, producing proposals containing project-specific variables or domain-specific terms not valid in the general context.
**Migration guidance:** Review your project's Curator role Implementation Practices section. Consider adding: when adapting content from project-specific to general context (or vice versa), verify that all `$VAR` references, terminology, and examples are valid for the target before submitting.

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
