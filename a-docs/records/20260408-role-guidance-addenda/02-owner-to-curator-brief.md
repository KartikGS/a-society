# Owner → Curator: Briefing

**Subject:** role-guidance-addenda — missing general TA standards plus Owner/Curator precision follow-up
**Status:** BRIEFED
**Date:** 2026-04-08

---

## Agreed Change

**Files Changed:**

| Target | Action | Authority |
|---|---|---|
| `$GENERAL_TA_ROLE` | modify — add the five still-missing advisory-completeness standards; do not duplicate the seven already present | [Requires Owner approval] |
| `$GENERAL_OWNER_ROLE` | modify — add the thirteen missing brief-writing and closure-time precision rules from the open role-guidance follow-up item | [Requires Owner approval] |
| `$GENERAL_CURATOR_ROLE` | modify — add the three missing proposal/implementation precision rules from the open role-guidance follow-up item | [Requires Owner approval] |
| Framework update report draft in `$A_SOCIETY_UPDATES_DIR` | additive — include in proposal with classification fields marked `TBD`; if approved, publish using the filename contract `[YYYY-MM-DD]-role-guidance-addenda.md` | [Requires Owner approval] |

This flow combines the two user-selected `[S][LIB]` items into one Framework Dev path because they share workflow type, authority level, and the same reusable general role-template layer, and there is no sequencing conflict between them.

**Intake validity correction:** `$GENERAL_TA_ROLE` is not untouched. A current-state spot-check confirms that items *(1)* through *(7)* from the log's "Technical Architect advisory completeness addendum" already exist under `## Advisory Standards` → `### Specification Rigor`. This flow must scope only the still-missing reusable TA counterparts *(8)* through *(12)* rather than re-proposing the rules already present.

### 1. `$GENERAL_TA_ROLE` — extend `### Specification Rigor` from 7 items to 12

In `$GENERAL_TA_ROLE`, under `## Advisory Standards` → `### Specification Rigor`, insert five new numbered items immediately after item `7. **Developer Path Portability:** ...` and before `### Extension Before Bypass (Architecture and Infrastructure)`.

Add the following standards in that location, adapted to project-agnostic wording but preserving the same rule content:

8. **Brief constraint evaluation:** when a brief contains design constraints, distinguish hard constraints from design preferences before anchoring to them; if a constraint is really a preference, surface the alternative comparison explicitly rather than silently accepting the preference as mandatory.
9. **Current-state claims from required reading:** when required-reading or orientation documents make current-state claims that materially constrain advisory scope, spot-check the live codebase before relying on those claims as implementation-state evidence.
10. **Approved schema identifier names are contract terms:** when an advisory defines queryable identifiers (attribute names, event names, field names, or equivalent schema terms), exact name conformance is blocking unless the approved design is revised.
11. **Instrumentation test scope must distinguish schema shape from production-path execution:** when an advisory specifies observability or instrumentation tests, it must say whether each test proves schema shape, production-path coverage, or both; if the integration gate depends on real coverage, the advisory must explicitly require production-path execution.
12. **Instrumentation boundary definitions require call-site enumeration:** before defining a span or instrumentation boundary around a function reached from multiple execution paths, enumerate the invocation paths explicitly so the boundary covers all intended call sites.

Do not rewrite or renumber existing items *(1)* through *(7)* except for minimal continuity edits required by the new contiguous 1-12 list.

### 2. `$GENERAL_CURATOR_ROLE` — add the three missing precision rules

In `$GENERAL_CURATOR_ROLE`, make the following exact-scope additions:

1. In `## Hard Rules`, insert a new hard rule immediately after `**If a maintenance change implies a direction decision, stop and escalate.** Clarification comes before action.` The new rule must state that when the Curator is uncertain whether a procedural step applies, it must flag the uncertainty explicitly and ask rather than inventing a justification; the escalation-first principle is the default response to procedural uncertainty.
2. In `## Implementation Practices`, insert a new paragraph immediately after `**Proposal stage — implementation portability check.** ...` The new paragraph must establish proposal-stage source-claim verification: when a brief makes a specific claim about the current state of a source document, the Curator re-reads the cited document during proposal preparation and flags unverifiable claims explicitly rather than drafting from them as though verified.
3. In `## Implementation Practices`, insert a new paragraph immediately after `**Implementation stage — terminology sweep for schema changes.** ...` The new paragraph must require normalization of tool-surface terminology in maintained guidance: if extracted or maintained guidance names a specific editing tool or interaction surface, verify that the named surface still matches the live environment or rewrite the rule in capability terms rather than preserving stale tool names verbatim.

### 3. `$GENERAL_OWNER_ROLE` — add the thirteen missing brief-writing and closure-time precision rules

In `$GENERAL_OWNER_ROLE`, preserve the document's existing format of one bolded rule lead-in per paragraph and add the following clauses at the specified boundaries.

**A. `## Brief-Writing Quality`**

1. Immediately after the opening paragraph beginning `When a change is fully derivable ...`, add the preferred-option brief pattern: when two viable implementation approaches exist and the Owner has a preference but not a mandate, name the preferred option, state why it is preferred, and require documented rationale if the non-preferred option is chosen.
2. Immediately after `**Multi-file scopes:** ...`, add the principle/application consistency scan: when a brief both defines or revises a standing rule and applies it to concrete target files in the same flow, compare the abstract rule text against the file-specific instructions before handoff and name any approved residual exception explicitly.
3. Immediately after `**Structured-entry replacement boundary.** ...`, add the remove-vs-replace precision rule: when a brief scopes both a removal and an additive item in the same target file, state for each removed section whether it is removed entirely with no replacement or replaced by a specific named new section.
4. Immediately after `**Removal-of-dependents scoping.** ...`, add the all-occurrences reference-removal rule: when a brief scopes removal of a named variable, pointer, or cross-reference from a target file, sweep the full file and either enumerate every occurrence or state explicitly that all occurrences are in scope.
5. Immediately after `**Library flows and update report drafts:** ...`, add the update-report path naming rule: when a brief or decision instructs a downstream role to publish an update report, specify the filename using the update-report contract `[YYYY-MM-DD]-[brief-descriptor].md` within the project's updates directory rather than a date-only filename.
6. Immediately after that new update-report path naming paragraph, add the standing-artifact propagation rule: when a brief creates a new always-relevant or standing artifact, explicitly assess downstream propagation surfaces before handoff, including required-readings/startup-context implications, relevant index registrations, rationale/guide coverage, and manifest or scaffold semantics when initialized project shape changes.
7. Immediately after `**Behavioral property consistency:** ...`, add the multi-mode scope declaration rule: when a brief targets a component with distinct execution paths (interactive/autonomous, sync/async, TTY/non-TTY, or equivalent), declare which paths are in scope or state explicitly that all paths are in scope.
8. Immediately after that new multi-mode paragraph, add the verification-content precision rule: when a verification obligation confirms a documentation removal or output-format requirement, name the specific content that must be absent, present, or included; successful execution alone is not sufficient.
9. Immediately after that new verification-content paragraph, add the TA-brief constraint/preference partition rule: when a brief asks a Technical Architect to produce a design, constraints in the brief must be genuinely non-negotiable; design preferences or working hypotheses must be surfaced as preferences with rationale rather than phrased as prohibitive constraints.
10. Immediately after `**Project-specific convention changes require mirror assessment.** ...`, add the stale-description sweep rule: when a brief extracts, relocates, or externalizes guidance into a new or repurposed artifact, assess whether existing descriptive surfaces become stale and scope those accuracy edits explicitly rather than treating propagation as additive-only.

**B. `## Forward Pass Closure Discipline`**

11. Immediately after the opening paragraph beginning `When a closing flow surfaces new Next Priorities items ...`, add the accepted-residual-exception rule: when a flow intentionally leaves a known document or section non-conformant to a newly adopted or clarified standard by approved deferral, the closure artifact must label that state explicitly as an accepted residual exception, naming what remains deferred.
12. Immediately after the paragraph beginning `At forward pass closure, after the flow's changes are confirmed ...`, add the sequence-slot numbering rule: before selecting a forward-pass closure artifact number, read the active record folder and choose the next sequence slot from the actual numbering, treating `a`/`b` sub-labels as shared slots rather than additional whole-number positions.
13. Immediately after that new sequence-slot paragraph, add the archive-target rule: when rolling the project log, archive the oldest `Previous` entry displaced by the shift into `Recent Focus`, not the flow currently closing.

### 4. Proposal requirement — include the update report draft

Because this flow modifies reusable general role templates adopted across projects, include a framework update report draft as a named section in the proposal submission. Keep classification fields as `TBD` until resolved through `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Scope

**In scope:**
- The missing reusable TA standards *(8)* through *(12)* only; existing `$GENERAL_TA_ROLE` standards *(1)* through *(7)* stay in place
- The three missing `$GENERAL_CURATOR_ROLE` precision rules
- The thirteen missing `$GENERAL_OWNER_ROLE` precision rules spanning `## Brief-Writing Quality` and `## Forward Pass Closure Discipline`
- The proposal-time update report draft and, if approved, the published update report in `$A_SOCIETY_UPDATES_DIR`
- Verification during proposal that the currently loaded general role templates still match the Owner's state claims above

**Out of scope:**
- Rewriting or re-generalizing TA standards *(1)* through *(7)* already present in `$GENERAL_TA_ROLE`
- Changes to A-Society-specific role documents; this flow targets only the reusable general counterparts
- The separate Next Priorities item `Owner integration-gate review and Curator registration-boundary guidance`
- Creating a new general Developer role template or relocating the existing path-portability rule out of `$GENERAL_TA_ROLE`
- New standing general-library files beyond the update report published to `$A_SOCIETY_UPDATES_DIR`

---

## Likely Target

- `$GENERAL_TA_ROLE`
- `$GENERAL_OWNER_ROLE`
- `$GENERAL_CURATOR_ROLE`
- Framework update report in `$A_SOCIETY_UPDATES_DIR` using the filename contract `[YYYY-MM-DD]-role-guidance-addenda.md`

---

## Downstream Propagation

- No new standing general-library files are expected, so no `$GENERAL_MANIFEST` change is expected in this flow.
- No new public-index rows are expected. During registration, verify whether the existing `$GENERAL_TA_ROLE`, `$GENERAL_OWNER_ROLE`, and `$GENERAL_CURATOR_ROLE` descriptions in `$A_SOCIETY_PUBLIC_INDEX` remain accurate after the wording additions; update only if the role summaries themselves become inaccurate.
- Because this flow modifies reusable role templates, the proposal must include the update report draft in the same submission rather than deferring it to a later cycle.

---

## Open Questions for the Curator

None.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for role-guidance-addenda."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment. Return to the Owner when the proposal artifact is complete.
