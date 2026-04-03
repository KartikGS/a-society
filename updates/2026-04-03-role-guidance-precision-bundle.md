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
**What changed:** Added "Removed element consumer enumeration" to the Brief-Writing Quality section. When a brief removes or renames a structural element consumed by other content, the Owner must enumerate consuming sites alongside the definition site.
**Why:** Briefs scoped to only the definition site of a removed element left downstream roles to discover consuming sites during implementation, creating ambiguity about scope.
**Migration guidance:** Review your project's Owner role Brief-Writing Quality section. If it does not address consumer-site enumeration for removals, consider adding: when a brief removes or renames a structural element referenced elsewhere, enumerate consuming sites in the Files Changed table alongside the definition site.

---

### Owner Role — Structured-Entry Replacement Boundary

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Structured-entry replacement boundary" to the Brief-Writing Quality section. When directing a change within a structured documentation entry, the Owner must state whether the replacement applies to the full entry or only a named sub-element.
**Why:** Briefs that identified a target entry without bounding replacement scope caused downstream roles to either over-replace (changing adjacent fields unintentionally) or under-replace (updating only part of an entry).
**Migration guidance:** Review your project's Owner role Brief-Writing Quality section. Consider adding: when directing changes within a structured entry (table row, index entry, log item), the brief must specify whether the full entry or only a named sub-element is in scope for replacement.

---

### Owner Role — Removal-of-Dependents Scoping

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Removal-of-dependents scoping" to the Brief-Writing Quality section. When scoping removal of a structured list item, the Owner must explicitly enumerate any dependent content in affected files that would become vestigial.
**Why:** Briefs that scoped only the primary item left downstream roles encountering vestigial cross-references and format blocks after implementation, requiring correction rounds.
**Migration guidance:** Review your project's Owner role Brief-Writing Quality section. If it addresses output-format obsolescence checks, consider adding a parallel item: when a brief removes a structured list item, enumerate all dependent content (cross-references, gated format blocks, prose that changes meaning) in that file and any sibling files receiving the same removal.

---

### Owner Role — Schema-Code Coupling Check

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Schema-code coupling check" to the Brief-Writing Quality section. When a documentation change defines or modifies a schema with a programmatic consumer, the brief must scope both the documentation and code changes in the same flow.
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
**What changed:** Added "Index variable retirement requires a reference sweep" to the Constraint-Writing Quality section. When retiring a project index variable, the Owner must sweep for references and enumerate all dependent files before finalizing scope.
**Why:** Retirements scoped only to the definition site left stale `$VARIABLE_NAME` references elsewhere in the project, requiring discovery and correction during or after implementation.
**Migration guidance:** Review your project's Owner role Constraint-Writing Quality section. Consider adding: when retiring a registered index variable or deleting a registered artifact, sweep the project for references to that `$VARIABLE_NAME` and include all dependent files in scope before finalizing the brief.

---

### Owner Role — Multi-Track Path Portability

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/owner.md`]
**What changed:** Added "Multi-track path portability" to the Forward Pass Closure Discipline section. For flows with parallel tracks, the Owner must verify at closure that convergence artifacts contain no machine-specific absolute paths or `file://` URLs.
**Why:** Parallel-track completion artifacts with machine-specific paths were accepted at closure without format verification — functional completeness was confirmed but handoff artifact portability was not.
**Migration guidance:** If your project uses multi-track parallel flows, review your Owner role Forward Pass Closure Discipline section. Consider adding: at closure, verify that all track convergence artifacts filed by downstream roles contain no machine-specific absolute paths or `file://` URLs.

---

### Curator Role — Implementation Portability Check

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/roles/curator.md`]
**What changed:** Added "Proposal stage — implementation portability check" to the Implementation Practices section. When adapting content between project-specific and general contexts, the Curator must verify variable references, terminology, and examples are valid in the target context.
**Why:** Variable references valid in one project's index were carried into general-layer proposals without substitution, producing proposals containing project-specific variables or domain-specific terms not valid in the general context.
**Migration guidance:** Review your project's Curator role Implementation Practices section. Consider adding: when adapting content from project-specific to general context (or vice versa), verify that all `$VAR` references, terminology, and examples are valid for the target before submitting.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
