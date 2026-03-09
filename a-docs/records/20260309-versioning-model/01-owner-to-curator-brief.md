# Owner → Curator: Briefing

**Subject:** Framework versioning model — scheme, stamping, and version-aware updates
**Status:** BRIEFED
**Date:** 2026-03-09

---

## Agreed Change

A-Society currently publishes update reports with no version scheme. Adopting projects have no baseline recorded in their `a-docs/`, so Curators cannot determine which update reports apply to them and which have already been applied. This is a structural gap that grows more costly as the number of adopting projects and update reports increases.

The agreed direction:

**Versioning scheme:** `vMAJOR.MINOR` — MAJOR increments on Breaking updates, MINOR increments on Recommended or Optional updates. This aligns directly with the existing impact classification on update reports, adding no new judgment layer. No patch level.

**Version declaration:** A-Society maintains a canonical current version in a dedicated version file. This is the single source of truth for the framework's current version.

**Initialization stamp:** When the Initializer runs on a project, it records the A-Society version used in the project's `a-docs/`. This establishes the project's baseline. Future Curators apply update reports from that baseline to current.

**Version-aware update reports:** Each update report declares the framework version it represents (the version A-Society is at after this update). Curators of adopting projects apply reports in version order from their baseline.

**Explicit deferral — discoverability:** How Curators of adopting projects discover that update reports exist remains an open problem, deferred from this flow. The architecture doc already flags this; this flow should update that flag to note that versioning is now established but delivery mechanism is still TBD.

---

## Scope

**In scope:**
- A canonical version file for A-Society's current version (new file; determine correct placement)
- Version fields added to `$A_SOCIETY_UPDATES_PROTOCOL` and `$A_SOCIETY_UPDATES_TEMPLATE` — each update report must declare the version it represents and the version it supersedes
- A new general artifact: a project-level A-Society version record (the file an initialized project holds in its `a-docs/` that records baseline version and applied updates). Includes: what the file is, what it contains, and which agent maintains it
- An instruction for creating this version record artifact, placed in `general/`
- `$A_SOCIETY_INITIALIZER_ROLE` updated to create the version record during initialization
- `$GENERAL_CURATOR_ROLE` updated: migration behavior now includes checking the project's version record and applying update reports in version order before marking migration complete
- `$A_SOCIETY_ARCHITECTURE` updated: the existing open-problem flag on discoverability is updated to note that versioning is now established and the remaining open problem is delivery mechanism only
- All new files registered in the appropriate index (`$A_SOCIETY_INDEX` or `$A_SOCIETY_PUBLIC_INDEX`)
- `$A_SOCIETY_AGENT_DOCS_GUIDE` updated if any new `a-docs/` files are created

**Out of scope:**
- Migration chain discoverability — how adopting project Curators discover that update reports exist. Explicitly deferred. Update the note in `$A_SOCIETY_ARCHITECTURE` but do not design a solution.
- Backward-compatibility bootstrapping for projects already initialized without a version record. The Curator may flag this as an open question in the proposal if a natural solution emerges, but should not design it unilaterally.
- Changes to the A-Society Curator role (`$A_SOCIETY_CURATOR_ROLE`) unless the Curator identifies a necessary update during proposal formulation — the primary target is the general Curator role template that adopting projects use.

---

## Likely Target

- New: `/a-society/VERSION.md` or similar — canonical version declaration (Curator to determine correct placement per `$A_SOCIETY_STRUCTURE`)
- `$A_SOCIETY_UPDATES_PROTOCOL` — add version fields to update report spec
- `$A_SOCIETY_UPDATES_TEMPLATE` — add version fields to the template
- New: a general instruction for the project-level version record artifact — likely under `general/instructions/` (Curator to determine exact path and whether a sub-folder is warranted)
- New: the version record template itself — likely under `general/` (Curator to determine placement)
- `$A_SOCIETY_INITIALIZER_ROLE` — add version stamp step to initialization
- `$GENERAL_CURATOR_ROLE` — add version-aware migration behavior
- `$A_SOCIETY_ARCHITECTURE` — update discoverability deferral note
- `$A_SOCIETY_INDEX` and/or `$A_SOCIETY_PUBLIC_INDEX` — register new files

---

## Open Questions for the Curator

1. **Version file placement:** Where does A-Society's canonical version declaration live? A standalone `VERSION.md` at the root of `a-society/`? In `a-docs/project-information/`? Evaluate against `$A_SOCIETY_STRUCTURE` and propose with rationale.

2. **Project version record placement:** The initialized project's version record lives in their `a-docs/`. What is the right path and filename? What does the file contain — just the baseline version, or also a log of applied update report versions? Propose with rationale.

3. **Version record instruction placement:** Is this a standalone instruction in `general/instructions/` or does it belong in a sub-folder (e.g., alongside initialization-related content)? Evaluate against the three-file rule and namespace parity exception in `$A_SOCIETY_STRUCTURE`.

4. **Starting version:** What version should A-Society declare as its current version at the point this change ships? Given the existing update report history, the Curator should propose a starting version with rationale (e.g., v1.0 as a clean start, or a version that reflects the existing update report count).

5. **A-Society Curator role:** Should `$A_SOCIETY_CURATOR_ROLE` also be updated, or is the change fully captured by `$GENERAL_CURATOR_ROLE`? Check whether the A-Society-specific Curator role has migration guidance that needs updating.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Framework versioning model — scheme, stamping, and version-aware updates."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
