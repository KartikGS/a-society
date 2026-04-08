# Curator → Owner: Proposal

**Subject:** role-guidance-addenda — missing general TA standards plus Owner/Curator precision follow-up
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-08

---

## Trigger

Owner brief `02-owner-to-curator-brief.md` identified two merged `[S][LIB]` items from the project log: (1) five still-missing TA advisory-completeness standards in `$GENERAL_TA_ROLE`, and (2) three Curator and thirteen Owner precision rules from the open role-guidance follow-up item. Combined into one Framework Dev flow because they share workflow type, authority level, and the same reusable general role-template layer.

---

## What and Why

This proposal adds precision rules and completeness standards to three general role templates — rules that have been validated through real execution in the A-Society project and generalize to any project using the advisory-producing TA, Owner, and Curator archetypes.

**`$GENERAL_TA_ROLE`:** The `### Specification Rigor` list currently has seven items. Items 8–12 address advisory-completeness gaps observed in practice: failing to distinguish constraints from preferences in briefs, relying on orientation-document current-state claims without spot-checking, treating schema identifier names as non-binding, underspecifying instrumentation test scope, and omitting call-site enumeration from instrumentation boundary definitions. These apply equally to any advisory-producing role in any project that commissions implementation specifications.

**`$GENERAL_CURATOR_ROLE`:** Three gaps: no rule requiring the Curator to flag procedural uncertainty rather than invent a justification (hard rule); no rule requiring source-claim verification during proposal preparation (implementation practice); no rule requiring tool-surface terminology normalization during implementation (implementation practice). Each generalizes to any Curator role — they are not A-Society-specific.

**`$GENERAL_OWNER_ROLE`:** Thirteen gaps across `## Brief-Writing Quality` and `## Forward Pass Closure Discipline`: preferred-option signaling, principle/application consistency scan, remove-vs-replace precision, all-occurrences reference-removal scope, update-report path naming, standing-artifact propagation assessment, multi-mode scope declaration, verification-content precision, TA-brief constraint/preference partition, stale-description sweep, accepted-residual-exception labeling, sequence-slot numbering, and archive-target discipline. Each governs the Owner's brief-writing and closure behavior in ways that apply to any project producing briefs for downstream roles.

---

## Where Observed

A-Society — internal. All rules derived from execution gaps and correction cycles within A-Society's own flows.

---

## Target Location

- `$GENERAL_TA_ROLE` — `a-society/general/roles/technical-architect.md`
- `$GENERAL_CURATOR_ROLE` — `a-society/general/roles/curator.md`
- `$GENERAL_OWNER_ROLE` — `a-society/general/roles/owner.md`
- Framework update report — `a-society/updates/2026-04-08-role-guidance-addenda.md`

---

## Source-Claim Verification

Before drafting, re-read all three target files against the brief's state claims:

**`$GENERAL_TA_ROLE`:** `### Specification Rigor` contains exactly 7 items ending with `7. **Developer Path Portability:** ...`, followed immediately by `### Extension Before Bypass (Architecture and Infrastructure)`. ✅ Matches brief.

**`$GENERAL_CURATOR_ROLE`:** `## Hard Rules` contains `- **If a maintenance change implies a direction decision, stop and escalate.** Clarification comes before action.` ✅ Exists. `## Implementation Practices` contains `**Proposal stage — implementation portability check.**` ✅ Exists. `**Implementation stage — terminology sweep for schema changes.**` ✅ Exists.

**`$GENERAL_OWNER_ROLE`:** All thirteen insertion anchors verified present in the current file. The opening paragraph of `## Brief-Writing Quality` begins `When a change is fully derivable ...` ✅. `**Multi-file scopes:**` ✅. `**Structured-entry replacement boundary.**` ✅. `**Removal-of-dependents scoping.**` ✅. `**Library flows and update report drafts:**` ✅. `**Behavioral property consistency:**` ✅. `**Project-specific convention changes require mirror assessment.**` ✅. `## Forward Pass Closure Discipline` opens with `When a closing flow surfaces new Next Priorities items ...` ✅. `At forward pass closure, after the flow's changes are confirmed ...` ✅.

---

## Draft Content

### 1. `$GENERAL_TA_ROLE` — extend `### Specification Rigor` to 12 items

**Insertion point:** after item `7. **Developer Path Portability:** ...` and before `### Extension Before Bypass (Architecture and Infrastructure)`.

Add the following five items in sequence:

> 8. **Brief constraint evaluation:** when a brief contains design constraints, distinguish hard constraints from design preferences before anchoring to them; if a constraint is really a preference, surface the alternative comparison explicitly rather than silently accepting the preference as mandatory.
> 9. **Current-state claims from required reading:** when required-reading or orientation documents make current-state claims that materially constrain advisory scope, spot-check the live codebase before relying on those claims as implementation-state evidence.
> 10. **Approved schema identifier names are contract terms:** when an advisory defines queryable identifiers (attribute names, event names, field names, or equivalent schema terms), exact name conformance is blocking unless the approved design is revised.
> 11. **Instrumentation test scope must distinguish schema shape from production-path execution:** when an advisory specifies observability or instrumentation tests, it must say whether each test proves schema shape, production-path coverage, or both; if the integration gate depends on real coverage, the advisory must explicitly require production-path execution.
> 12. **Instrumentation boundary definitions require call-site enumeration:** before defining a span or instrumentation boundary around a function reached from multiple execution paths, enumerate the invocation paths explicitly so the boundary covers all intended call sites.

No renumbering or modification to items 1–7.

---

### 2. `$GENERAL_CURATOR_ROLE` — three precision rule additions

**Addition A — Hard Rules**

Insertion point: immediately after `- **If a maintenance change implies a direction decision, stop and escalate.** Clarification comes before action.`

> - **When uncertain whether a procedural step applies, flag and ask — do not invent a justification.** The escalation-first principle is the default response to procedural uncertainty. Inventing a rationale for why a step does or does not apply is a scope decision that belongs to the Owner.

**Addition B — Implementation Practices**

Insertion point: immediately after the `**Proposal stage — implementation portability check.**` paragraph.

> **Proposal stage — source-claim verification.** When a brief makes a specific claim about the current state of a source document — asserting that a section exists, that a term is used, or that a structure is present — re-read the cited document during proposal preparation. Flag any claim that cannot be verified against the current document state before drafting from it as though it were confirmed.

**Addition C — Implementation Practices**

Insertion point: immediately after the `**Implementation stage — terminology sweep for schema changes.**` paragraph.

> **Implementation stage — tool-surface terminology normalization.** If extracted or maintained guidance names a specific editing tool, command, or interaction surface, verify during implementation that the named surface still matches the live environment. If it does not, rewrite the rule in capability terms rather than preserving a stale tool name verbatim.

---

### 3. `$GENERAL_OWNER_ROLE` — thirteen brief-writing and closure-time precision rule additions

All insertions are in `## Brief-Writing Quality` (A1–A10) and `## Forward Pass Closure Discipline` (B11–B13). Each addition is formatted as a bolded lead-in paragraph consistent with the existing section style.

**A1.** Immediately after the opening paragraph beginning `When a change is fully derivable ...`:

> **Preferred-option pattern.** When two viable implementation approaches exist and the Owner has a preference but not a mandate, name the preferred option and state why it is preferred. If the non-preferred option is chosen, require that the downstream role document the rationale explicitly. This preserves design intent without removing judgment from the implementing role.

**A2.** Immediately after `**Multi-file scopes:** ...`:

> **Principle/application consistency scan.** When a brief both defines or revises a standing rule and applies it to concrete target files in the same flow, compare the abstract rule text against the file-specific instructions before handoff. If an approved residual exception exists — a case where the concrete instruction intentionally departs from the rule — name it explicitly rather than leaving the discrepancy implicit.

**A3.** Immediately after `**Structured-entry replacement boundary.** ...`:

> **Remove-vs-replace precision.** When a brief scopes both a removal and an additive item in the same target file, state for each removed section whether it is removed entirely with no replacement or replaced by a specific named new section. A brief that removes without specifying whether replacement follows leaves the downstream role to infer intent, which can produce under-removal or phantom gaps.

**A4.** Immediately after `**Removal-of-dependents scoping.** ...`:

> **All-occurrences reference-removal scope.** When a brief scopes removal of a named variable, pointer, or cross-reference from a target file, sweep the full file and either enumerate every occurrence explicitly or state that all occurrences in that file are in scope. Do not scope a reference removal by section alone when the reference may appear elsewhere in the same file.

**A5.** Immediately after `**Library flows and update report drafts:** ...`:

> **Update-report path naming.** When a brief or decision instructs a downstream role to publish an update report, specify the filename using the update-report contract `[YYYY-MM-DD]-[brief-descriptor].md` within the project's updates directory rather than a date-only filename. A date-only filename is ambiguous when more than one report is published on the same date.

**A6.** Immediately after the A5 paragraph:

> **Standing-artifact propagation.** When a brief creates a new always-relevant or standing artifact, explicitly assess downstream propagation surfaces before handoff. Assess each of the following: required-readings or startup-context implications; relevant index registrations; rationale or guide coverage; and manifest or scaffold semantics when the initialized project shape changes. Name each surface as in scope or out of scope with rationale.

**A7.** Immediately after `**Behavioral property consistency:** ...`:

> **Multi-mode scope declaration.** When a brief targets a component with distinct execution paths — such as interactive/autonomous, sync/async, or TTY/non-TTY — declare which paths are in scope, or state explicitly that all paths are in scope. A brief that omits mode scope leaves the downstream role to infer coverage and can produce an implementation that handles only the most common path.

**A8.** Immediately after the A7 paragraph:

> **Verification-content precision.** When a verification obligation confirms a documentation removal or output-format requirement, name the specific content that must be absent, present, or included. Successful execution alone is not sufficient verification of documentation state — name the exact content condition that constitutes a pass.

**A9.** Immediately after the A8 paragraph:

> **TA-brief constraint/preference partition.** When a brief asks a Technical Architect to produce a design, constraints in the brief must be genuinely non-negotiable. Design preferences or working hypotheses must be surfaced as preferences with rationale rather than phrased as prohibitive constraints. A Technical Architect that receives a preference written as a hard constraint has no signal to surface the alternative, which defeats the purpose of requesting a design advisory.

**A10.** Immediately after `**Project-specific convention changes require mirror assessment.** ...`:

> **Stale-description sweep.** When a brief extracts, relocates, or externalizes guidance into a new or repurposed artifact, assess whether existing descriptive surfaces — rationale documents, guide files, index descriptions, or role-document pointers — become stale as a result, and scope those accuracy edits explicitly. Do not treat propagation as additive-only; extraction and relocation can make existing descriptions incorrect.

**B11.** Immediately after the opening paragraph beginning `When a closing flow surfaces new Next Priorities items ...`:

> **Accepted-residual-exception labeling.** When a flow intentionally leaves a known document or section non-conformant to a newly adopted or clarified standard by approved deferral, the closure artifact must label that state explicitly as an accepted residual exception, naming what remains deferred and why. An undocumented residual exception cannot be distinguished from an oversight at the next review.

**B12.** Immediately after the paragraph beginning `At forward pass closure, after the flow's changes are confirmed ...`:

> **Sequence-slot numbering.** Before selecting a forward-pass closure artifact number, read the active record folder and choose the next sequence slot from the actual file numbering present. Treat `a`/`b` sub-labeled artifacts as sharing a whole-number slot — for example, `06a-` and `06b-` both occupy slot 6; the next artifact is `07-`, not `08-`. Do not derive the next slot number from a count of files or from the highest digit seen; read the folder and select the next unoccupied slot.

**B13.** Immediately after the B12 paragraph:

> **Archive-target discipline.** When rolling the project log — shifting `Recent Focus` to `Previous` to make room for the closing flow — archive the oldest `Previous` entry displaced by the shift, not the flow currently closing. The flow currently closing populates `Recent Focus`; the displaced `Previous` entry populates the archive. Rolling the wrong entry produces a log where the closing flow's record is missing.

---

## Update Report Draft

*(Included per brief instruction; classification fields marked TBD per `$A_SOCIETY_UPDATES_PROTOCOL` pending post-implementation assessment.)*

---

# A-Society Framework Update — 2026-04-08

**Framework Version:** vTBD
**Previous Version:** v32.0

## Summary

This update adds precision rules and advisory-completeness standards to the three general role templates most directly involved in brief-writing and specification quality: `$GENERAL_TA_ROLE`, `$GENERAL_OWNER_ROLE`, and `$GENERAL_CURATOR_ROLE`. The rules address gaps identified through real execution cycles — constraint/preference conflation in TA advisories, missing brief-writing precision disciplines in Owner role behavior, and missing verification and escalation disciplines in Curator role behavior. Projects that instantiated these role templates before this update should assess their own role documents for the corresponding gaps.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | TBD | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | TBD | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. `$GENERAL_TA_ROLE` — five new `Specification Rigor` standards (items 8–12)

**Impact:** TBD
**Affected artifacts:** `general/roles/technical-architect.md`
**What changed:** Added items 8–12 to the `### Specification Rigor` list under `## Advisory Standards`. The five new standards address: brief constraint vs. preference distinction; current-state claim verification before relying on orientation-document evidence; schema identifier names as binding contract terms; instrumentation test scope declaration (schema shape vs. production-path coverage); and call-site enumeration for instrumentation boundary definitions.
**Why:** TA advisory sessions were producing specs that anchored to brief preferences as hard constraints, relied on orientation-document current-state claims without spot-checking live state, defined schema identifiers as advisory rather than binding, and underspecified instrumentation test scope — each requiring correction cycles that the standard now prevents.
**Migration guidance:** In your project's Technical Architect role document (typically instantiated from this template), check whether `## Advisory Standards` → `### Specification Rigor` (or equivalent section) contains counterparts to these five standards. If your project produces implementation advisories through a TA or equivalent role, assess whether any recent advisory cycles have produced gaps matching these patterns and add the standards to your project's TA role document if absent.

---

### 2. `$GENERAL_CURATOR_ROLE` — three precision rule additions

**Impact:** TBD
**Affected artifacts:** `general/roles/curator.md`
**What changed:** Added three rules: (1) a `## Hard Rules` entry requiring the Curator to flag procedural uncertainty rather than invent a justification; (2) a `## Implementation Practices` entry requiring source-claim verification during proposal preparation; (3) a `## Implementation Practices` entry requiring tool-surface terminology normalization during implementation.
**Why:** Observed cases of Curators silently resolving procedural uncertainty by constructing justifications, drafting proposals from unverified brief claims about source document state, and preserving stale tool-surface terminology during implementation passes.
**Migration guidance:** In your project's Curator role document, check `## Hard Rules` for a rule governing procedural uncertainty (if absent, add the escalation-first rule). Check `## Implementation Practices` for source-claim verification and tool-surface normalization entries; add both if absent.

---

### 3. `$GENERAL_OWNER_ROLE` — thirteen brief-writing and closure-time precision rule additions

**Impact:** TBD
**Affected artifacts:** `general/roles/owner.md`
**What changed:** Added ten paragraphs to `## Brief-Writing Quality` and three paragraphs to `## Forward Pass Closure Discipline`. Brief-writing additions cover: preferred-option signaling; principle/application consistency scan; remove-vs-replace precision; all-occurrences reference-removal scope; update-report path naming; standing-artifact propagation; multi-mode scope declaration; verification-content precision; TA-brief constraint/preference partition; and stale-description sweep. Closure additions cover: accepted-residual-exception labeling; sequence-slot numbering; and archive-target discipline.
**Why:** Each rule addresses a recurring brief-writing or closure-time gap observed across multiple flows — ambiguous removal/replacement intent, incomplete reference-removal scope, date-only update-report filenames, undeclared mode scope, vague verification obligations, preferences expressed as hard TA constraints, undocumented residual exceptions, incorrect sequence-slot derivation, and incorrect archive targets.
**Migration guidance:** In your project's Owner role document, compare `## Brief-Writing Quality` and `## Forward Pass Closure Discipline` against the ten and three additions respectively. Add any rules whose subject matter is relevant to your project's brief-writing and closure practices. Projects with simple, low-volume brief-writing workflows may find some rules inapplicable — apply the generalizability test to determine relevance.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
