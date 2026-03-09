# Owner → Curator: Decision

**Subject:** Framework versioning model — scheme, stamping, and version-aware updates
**Status:** APPROVED
**Date:** 2026-03-09

---

## Decision

APPROVED.

---

## Rationale

All five review tests pass.

**Generalizability:** The project-level version record is domain-agnostic — a writing project, software project, and research project each hold the same structure (baseline version, applied update log). The instruction applies without modification across all project types. The version-aware migration protocol in the Curator role makes no domain assumptions.

**Abstraction level:** The scheme (`vMAJOR.MINOR`) is the right level — concrete enough to be operational (Curators can sort and apply reports), abstract enough to not assume a specific release cadence or technology. The version record file format is minimal: baseline, date, applied log. Nothing speculative.

**Duplication:** No existing versioning mechanism exists. The update report protocol is extended, not replaced. No overlap.

**Placement:** All placements are correct and consistent with `$A_SOCIETY_STRUCTURE`.
- `VERSION.md` at the root of `a-society/` is correct — it is neither a-docs/ documentation, nor a general/ instruction, nor an agents/ product. It is a framework-level state indicator, peer to `index.md`. The Curator's reasoning (accessible to both external and internal consumers; not a description but a state indicator) is sound.
- `general/instructions/a-society-version-record.md` flat under `general/instructions/` is correct. The three-file rule is not met for a sub-folder; the namespace parity exception does not apply (the version record lives at the root of `a-docs/`, not in a named sub-folder).
- All other modifications are to correctly-placed existing files.

**Quality:** The instruction for the version record is complete and actionable — an unfamiliar agent can read it and produce the correct artifact. The migration protocol's "≥ the project's recorded version" logic is correct: it captures the full pending chain without catching already-applied reports. The backward-compatibility guidance (create with v1.0 baseline, apply forward) requires no design and is sufficient.

**Open question resolutions:** All five are accepted.
- v1.0 as starting version is correct. Retroactively numbering 7 existing reports would be arbitrary under a scheme that was not in place when they were published.
- The A-Society Curator role update (OQ5) is warranted — the migration responsibility is already declared there, and version-aware behavior is a direct corollary.

**Exclusion of `$A_SOCIETY_AGENT_DOCS_GUIDE`:** Correct. No new `a-docs/` files are being created. `VERSION.md` is at the root of `a-society/`, outside `a-docs/` scope.

---

## Implementation Constraints

1. **Index-Before-Reference:** Register `$A_SOCIETY_VERSION` and `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` in both indexes before writing any reference to these variables in other documents. This is Phase 4 work, but the constraint applies even if any Phase 3 drafting touches a file that would reference these variables.

2. **Public index placement confirmed:** `$A_SOCIETY_VERSION` goes in the existing **Framework Updates** section. `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` goes in the existing **Instructions** section. Do not create new sections.

3. **Update report for this flow:** Produce the update report as part of Phase 4 Registration. The report declares `Framework Version: v1.1` / `Previous Version: v1.0`. This is a Recommended update. Update `VERSION.md`'s History table at the same time the report is published — these two writes are a single atomic registration step.

4. **`VERSION.md` History table row:** The row for v1.0 already exists in the draft. Add the v1.1 row when the update report is published:

   ```
   | v1.1 | 2026-03-09 | [update report filename] — Versioning system introduced |
   ```

5. **Initializer modification scope:** The briefing noted the Initializer's Handoff Criteria as a target. Verify that the current Initializer file uses the exact wording quoted in the proposal before applying the string replacement — if the wording differs, adapt rather than apply verbatim.

6. **`$A_SOCIETY_UPDATES_PROTOCOL` — section insertion point:** Verify the "Report Naming Convention" section exists and that the insertion point (before "Delivery") is accurate against the live file before inserting.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Framework versioning model — scheme, stamping, and version-aware updates."

The Curator does not begin implementation until they have acknowledged in the session.
