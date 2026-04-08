# A-Society Framework Update — 2026-04-08

**Framework Version:** v32.1
**Previous Version:** v32.0

## Summary

This update adds precision rules and advisory-completeness standards to the three general role templates most directly involved in brief-writing and specification quality: the Technical Architect, Owner, and Curator role templates. The rules address gaps identified through real execution cycles — constraint/preference conflation in TA advisories, missing brief-writing precision disciplines in Owner role behavior, and missing verification and escalation disciplines in Curator role behavior. Projects that instantiated these role templates before this update should assess their own role documents for the corresponding gaps.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. `$GENERAL_TA_ROLE` — five new `Specification Rigor` standards (items 8–12)

**Impact:** Recommended
**Affected artifacts:** `general/roles/technical-architect.md`
**What changed:** Added items 8–12 to the `### Specification Rigor` list under `## Advisory Standards`. The five new standards address: (8) brief constraint vs. preference distinction — distinguish hard constraints from preferences before anchoring; (9) current-state claim verification — spot-check the live codebase before relying on orientation-document state claims; (10) schema identifier names as binding contract terms — exact name conformance is blocking unless the approved design is revised; (11) instrumentation test scope declaration — state whether each test proves schema shape, production-path coverage, or both; (12) call-site enumeration for instrumentation boundary definitions — enumerate invocation paths before defining a span or boundary.
**Why:** TA advisory sessions were producing specs that anchored to brief preferences as hard constraints, relied on orientation-document current-state claims without spot-checking live state, defined schema identifiers as advisory rather than binding, and underspecified instrumentation test scope — each requiring correction cycles that the standards now prevent.
**Migration guidance:** In your project's Technical Architect role document (or equivalent advisory-producing role), check whether `## Advisory Standards` → `### Specification Rigor` (or equivalent section) contains counterparts to these five standards. If your project produces implementation advisories through a TA or equivalent role, assess whether any recent advisory cycles have produced gaps matching these patterns. Add the missing standards to your project's role document if absent. Projects that do not use an advisory-producing role may skip this entry.

---

### 2. `$GENERAL_CURATOR_ROLE` — three precision rule additions

**Impact:** Recommended
**Affected artifacts:** `general/roles/curator.md`
**What changed:** Added three rules to the Curator role template: (1) a `## Hard Rules` entry — when uncertain whether a procedural step applies, flag and ask rather than inventing a justification; the escalation-first principle is the default response to procedural uncertainty; (2) a `## Implementation Practices` entry — source-claim verification: re-read any source document cited in a brief before drafting a proposal from its claimed state; (3) a `## Implementation Practices` entry — tool-surface terminology normalization: verify that named editing tools or interaction surfaces still match the live environment during implementation; rewrite in capability terms if not.
**Why:** Observed cases of Curators silently resolving procedural uncertainty by constructing justifications, drafting proposals from unverified brief claims about source document state, and preserving stale tool-surface terminology during implementation passes.
**Migration guidance:** In your project's Curator role document, check `## Hard Rules` for a rule governing procedural uncertainty (add if absent). Check `## Implementation Practices` for a source-claim verification entry and a tool-surface normalization entry; add both if absent. If your project's Curator role document does not have an `## Implementation Practices` section, assess whether the section is warranted for your project's execution patterns.

---

### 3. `$GENERAL_OWNER_ROLE` — thirteen brief-writing and closure-time precision rule additions

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** Added ten paragraphs to `## Brief-Writing Quality` and three paragraphs to `## Forward Pass Closure Discipline`. Brief-writing additions: (1) preferred-option pattern — name preferred approaches and require documented rationale if the non-preferred option is chosen; (2) principle/application consistency scan — compare abstract rule text against concrete file-specific instructions before handoff; (3) remove-vs-replace precision — state for each removed section whether it is removed entirely or replaced by a named new section; (4) all-occurrences reference-removal scope — sweep the full file when scoping removal of a named variable or cross-reference; (5) update-report path naming — use the full `[YYYY-MM-DD]-[descriptor].md` filename contract, not a date-only name; (6) standing-artifact propagation — assess required-readings, index, rationale/guide, and manifest implications before handoff; (7) multi-mode scope declaration — declare which execution paths are in scope for components with distinct paths; (8) verification-content precision — name the specific content that must be absent, present, or included; (9) TA-brief constraint/preference partition — surface design preferences as preferences rather than hard constraints; (10) stale-description sweep — assess descriptive surfaces for staleness when extracting or relocating guidance. Closure additions: (11) accepted-residual-exception labeling — label intentionally deferred non-conformances explicitly in the closure artifact; (12) sequence-slot numbering — read the actual record folder to determine the next slot; (13) archive-target discipline — archive the oldest displaced `Previous` entry, not the flow currently closing.
**Why:** Each rule addresses a recurring brief-writing or closure-time gap observed across multiple flows. The gaps produced ambiguous briefs, incomplete reference-removal scope, undeclared mode scope, vague verification obligations, preferences expressed as hard TA constraints, undocumented residual exceptions, incorrect sequence-slot derivation, and incorrect archive targets.
**Migration guidance:** In your project's Owner role document, compare `## Brief-Writing Quality` and `## Forward Pass Closure Discipline` against the ten and three additions respectively. Add any rules whose subject matter is relevant to your project's brief-writing and closure practices. Projects with simple, low-volume brief-writing workflows may find some rules inapplicable — apply the generalizability test: would this rule prevent a correction cycle in this project? If yes, add it.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
