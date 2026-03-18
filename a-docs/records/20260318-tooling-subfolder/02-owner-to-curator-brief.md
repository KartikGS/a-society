---

**Subject:** Tooling files — relocate to a-docs/tooling/ subfolder
**Status:** BRIEFED
**Date:** 2026-03-18

---

## Agreed Change

The four tooling-related files currently sitting loose in `a-docs/` root belong in a dedicated subfolder. They form a coherent operational category (tooling specification, coupling map, implementation workflow, TA deviation ruling) — all documentation for agents working on A-Society's tooling layer. The pattern across `a-docs/` is that operational areas get their own subfolder (`workflow/`, `communication/`, `improvement/`, `records/`, `updates/`). Four files exceeds the three-file threshold for subfolder creation.

The agreed placement is `a-docs/tooling/` — not `project-information/tooling/`, because `project-information/` is the identity layer (what A-Society *is*), and these files are operational specs (how to implement and maintain the tooling layer). The high-level tooling description already belongs in `architecture.md`.

The four files to move:
- `a-docs/tooling-architecture-proposal.md` (`$A_SOCIETY_TOOLING_PROPOSAL`)
- `a-docs/tooling-architecture-addendum.md` (`$A_SOCIETY_TOOLING_ADDENDUM`)
- `a-docs/tooling-general-coupling-map.md` (`$A_SOCIETY_TOOLING_COUPLING_MAP`)
- `a-docs/tooling-ta-assessment-phase1-2.md` (`$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`)

---

## Scope

**In scope:**
- Create `a-docs/tooling/` subfolder
- Move the four files above into it
- Create `a-docs/tooling/main.md` — a brief orientation document listing what each file is and when an agent would read it (consistent with how other a-docs subfolders use main.md as an entry point)
- Update the four affected path rows in `$A_SOCIETY_INDEX`
- Register the new `tooling/` subfolder and `tooling/main.md` in `$A_SOCIETY_INDEX`
- Add a `tooling/` entry to `$A_SOCIETY_AGENT_DOCS_GUIDE`
- Resolve the open filename question (see Open Questions)

**Out of scope:**
- Content changes to any of the four files being moved
- Changes to `general/`
- Any changes to actual tooling implementation in `tooling/`

---

## Likely Target

- New folder: `a-society/a-docs/tooling/`
- New file: `a-society/a-docs/tooling/main.md`
- Moved files: the four listed above at their new paths under `a-docs/tooling/`
- Index: `$A_SOCIETY_INDEX` — four path rows updated, new `main.md` row added

---

## Open Questions for the Curator

1. **Filename prefix:** The four files currently carry a "tooling-" prefix (e.g., `tooling-architecture-proposal.md`). Inside a `tooling/` subfolder this prefix is redundant. The Curator should decide: keep names as-is (simpler, no extra index rows beyond path changes) or drop the prefix (e.g., `architecture-proposal.md`, `architecture-addendum.md`, `coupling-map.md`, `ta-assessment-phase1-2.md`). Since all references use `$VARIABLE_NAME`, either choice requires only index row updates. Curator should state the rationale for whichever approach is chosen in the proposal.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Tooling files — relocate to a-docs/tooling/ subfolder."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
