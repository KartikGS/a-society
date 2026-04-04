**Subject:** Project-Scoped Improvement Session Instructions — Owner Decision
**Flow:** 20260404-project-scoped-improvement-instructions
**Artifact:** 04-owner-to-curator.md
**Date:** 2026-04-04

---

## Runtime Track Verdict

**Status: Accepted.**

`improvement.ts` correctly removes both module-level constants and computes `metaAnalysisInstructionPath` and `synthesisInstructionPath` from `path.join(flowRun.projectRoot, 'a-docs', 'improvement', ...)` at each usage site. Inline comments at both declaration sites match the brief.

The incidental `triggers.ts` fix is sound: `flowRun.recordFolderPath` is a valid `FlowRun` property, the `computeBackwardPassPlan` call matches the current API, and the unused return value is consistent with the trigger engine's validation purpose. The fix correctly replaces the deprecated `orderWithPromptsFromFile` call.

One cosmetic issue noted but not requiring rework: the module-level comment block at line 13 has a stray `§` character (`// §$[PROJECT]_IMPROVEMENT_META_ANALYSIS`). Functional behavior is unaffected.

---

## Curator Proposal Verdict

**Status: APPROVED.**

All four B1 changes and the B2 manifest entries are approved as proposed. The MAINT items (created files) are verified:
- `a-society/a-docs/improvement/meta-analysis.md`: placeholders resolved, non-records branch removed, completion signal preserved. ✓
- `a-society/a-docs/improvement/synthesis.md`: verbatim copy, no placeholders required. ✓

The B3 update report draft is accepted with TBD classification fields — Curator determines final classification at Phase 4 by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Implementation Instructions

Implement Section B changes now. Execute in this order:

**1. Update `$INSTRUCTION_IMPROVEMENT`** (`a-society/general/instructions/improvement/main.md`) — apply all four changes from the proposal:
   - Change 1: Replace the two-item list with a three-item list (add item 3 for phase-specific instruction files)
   - Change 2: Insert the "Project-Specific Phase Files (Runtime)" section before "Integration with the Index"
   - Change 3: Add two rows to the "Integration with the Index" table after the `$[PROJECT]_IMPROVEMENT_REPORTS` row
   - Change 4: Add the record-folder artifact note in the "reports/ — Reports Folder (Optional)" section

**2. Update `$GENERAL_MANIFEST`** (`a-society/general/manifest.yaml`) — add the two new improvement file entries after `improvement/reports/main.md`.

**3. Finalize and publish the update report:**
   - Determine classification for each change by consulting `$A_SOCIETY_UPDATES_PROTOCOL`
   - Publish to `a-society/updates/2026-04-04-project-scoped-improvement-instructions.md`

**4. Version bump:** Apply the version increment per `$A_SOCIETY_UPDATES_PROTOCOL` based on the final classification.

**5. Return `05-curator-to-owner.md`** confirming all four implementation steps above are complete, the update report is published at the specified path, and the new version number.

---

## Follow-Up Actions

- After publishing the update report, check `$A_SOCIETY_UPDATES_PROTOCOL` for any index registration requirements for the update report file itself.
- Verify `$A_SOCIETY_INDEX` does not require entries for the two newly created `a-docs/improvement/` files — both are already registered (`$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`, `$A_SOCIETY_IMPROVEMENT_SYNTHESIS`). No index update expected, but confirm.

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260404-project-scoped-improvement-instructions/04-owner-to-curator.md
```
