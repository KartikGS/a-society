# Owner → Curator: Decision

**Subject:** a-docs Design Principles — JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion
**Status:** APPROVED
**Date:** 2026-04-07

---

## Decision

APPROVED — with all six Curator-raised scope refinements accepted and the four Curator-confirmed decisions approved as proposed.

---

## Rationale

All five review tests pass.

**1. Generalizability:** The five design principles apply equally to a software project, a writing project, and a research project. Progressive context disclosure, redundancy avoidance, phase-document extraction, and agents.md minimalism are project-agnostic structural rules. The general template correctly strips A-Society-specific framing.

**2. Abstraction level:** The principles are actionable (concrete anti-patterns, specific structural rules) without assuming any technology, domain, or team structure. The instruction is scoped correctly — how to create and maintain the file, not what to put in it beyond the template.

**3. Duplication:** No overlap with `$A_SOCIETY_PRINCIPLES` (which covers architectural constraints: context scarcity, consent, feedback, structure rules) or `$A_SOCIETY_AGENT_DOCS_GUIDE` (which explains what each file is for). This document governs how a-docs is authored — a distinct surface.

**4. Placement:** All file placements are correct.
- `a-docs/a-docs-design.md` — at a-docs root alongside `agents.md`, appropriate for a cross-cutting design document governing the a-docs layer
- `general/a-docs-design.md` — flat in `general/`, single file, no subfolder needed
- `general/instructions/a-docs-design.md` — flat in `general/instructions/`, one artifact, flat placement correct
- `a-docs/roles/owner/` subfolder — three files immediately, three-file rule satisfied; `roles/owner.md` and `roles/owner/` coexist without conflict

**5. Quality:** The draft content is clear, internally consistent, and written so an agent unfamiliar with the project can read it and apply it correctly. Anti-patterns are concrete. The instruction gives a clear four-step how-to.

**Scope refinements accepted:** All six pre-proposal verifications were correct. Specifically:
- Principle 5 revised to include invariants — better than the original brief draft
- Residual `## How the Owner Reviews an Addition` flagged as follow-on — correct, not expanding scope unilaterally
- `$A_SOCIETY_INDEX` entries for general variables — correct catch; implementation must include these
- Manifest `scaffold: copy` — correct; a `stub` entry would ignore the ready-made template
- `$A_SOCIETY_REQUIRED_READINGS` scope refinement — approved; the design principles are always-relevant for Owner and Curator, not phase-specific, so required-readings placement is appropriate
- a-docs-guide entries for all four new a-docs files — approved

**Insertion points verified:** Re-read both meta-analysis files at review time. Both have the same structure: `### Useful Lenses` → `### Output Format` with a clean gap. The proposed insertion point is confirmed correct for both files.

---

## Implementation Constraints

1. **Content preservation:** The extracted owner.md sections (`## Brief-Writing Quality`, `## Constraint-Writing Quality`, `## TA Advisory Review`, `## Forward Pass Closure Discipline`) must be preserved verbatim in the extracted documents — no editing of instructions in this flow.

2. **`$A_SOCIETY_INDEX` — all six new variables:** Register all six variables in `$A_SOCIETY_INDEX`: `$A_SOCIETY_ADOCS_DESIGN`, `$GENERAL_ADOCS_DESIGN`, `$INSTRUCTION_ADOCS_DESIGN`, `$A_SOCIETY_OWNER_BRIEF_WRITING`, `$A_SOCIETY_OWNER_TA_REVIEW`, `$A_SOCIETY_OWNER_CLOSURE`. This is in addition to the public index entries.

3. **`$A_SOCIETY_PUBLIC_INDEX` — two variables only:** Register `$GENERAL_ADOCS_DESIGN` and `$INSTRUCTION_ADOCS_DESIGN` in the public index. The owner phase documents and A-Society instance are internal; they do not appear in the public index.

4. **`$A_SOCIETY_REQUIRED_READINGS`:** Add `$A_SOCIETY_ADOCS_DESIGN` to the Owner and Curator role-specific lists. This is approved as a scope refinement — it is not Curator-authority-only; it requires this explicit approval.

5. **`$GENERAL_MANIFEST`:** Add `a-docs-design.md` with `required: true`, `scaffold: copy`, `source_path: general/a-docs-design.md`. This is approved.

6. **a-docs-guide entries:** Add entries for all four new a-docs files: `$A_SOCIETY_ADOCS_DESIGN` and the three extracted owner phase documents (`$A_SOCIETY_OWNER_BRIEF_WRITING`, `$A_SOCIETY_OWNER_TA_REVIEW`, `$A_SOCIETY_OWNER_CLOSURE`).

7. **`## Just-in-Time Reads` placement in owner.md:** Add this new section immediately after `## Post-Confirmation Protocol` and before the sections being removed — so the file reads: role identity → authority → character → review → JIT reads. The removed sections leave no gap; the new section is the replacement surface.

8. **Update report:** A draft was included in the proposal. Resolve classification by consulting `$A_SOCIETY_UPDATES_PROTOCOL` at Phase 4 before publishing. Publish to `$A_SOCIETY_UPDATES_DIR` using the contract filename format: `2026-04-07-adocs-design-principles.md`.

---

## Follow-Up Actions

1. **Update report:** Draft included in proposal; classification to be resolved at Phase 4 per `$A_SOCIETY_UPDATES_PROTOCOL`. Publish to `a-society/updates/2026-04-07-adocs-design-principles.md` as part of Phase 3 before registration.

2. **Backward pass:** Both roles produce findings. This is a significant structural change — full depth is expected, not lightweight.

3. **Version increment:** Curator handles as part of Phase 4 registration after update report is published.

4. **Flagged follow-on (do not implement in this flow):** `## How the Owner Reviews an Addition` and `## Review Artifact Quality` remain in `owner.md`. A future flow should evaluate these as a paired review-behavior surface under the stricter Principle 4 application.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of a-docs Design Principles — JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion."

The Curator does not begin implementation until they have acknowledged in the session.
