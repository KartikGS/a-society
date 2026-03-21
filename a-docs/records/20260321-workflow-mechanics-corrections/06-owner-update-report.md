---
**Subject:** Framework update report — workflow mechanics corrections (general improvement protocol changes)
**Status:** APPROVED
**Date:** 2026-03-21

---

## Decision

APPROVED. Publish the draft as `a-society/updates/2026-03-21-workflow-mechanics-corrections.md` and increment `$A_SOCIETY_VERSION` to v17.3.

---

## Rationale

Scope is correct: the report covers only the two `$GENERAL_IMPROVEMENT` changes (Items 2c and 3b). All other changes in this flow are a-docs-internal and do not qualify for an update report. The report does not cover `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` (Item 4i), which is also a-docs-internal.

Classification is correct. Neither change is Breaking:
- The synthesis routing simplification (step 5 replacement) changes how synthesis items are routed — existing projects that do not adopt the update will continue to function; they will just retain the old mid-synthesis approval loop. Recommended is the right level.
- The tool mandate strengthening inserts an explicit prohibition where previously only a directive existed. Existing projects that do not adopt the update will still invoke the tool (the directive was already there); they just won't have the explicit prohibition. Recommended is correct.

Migration guidance for both changes is actionable: it names the exact section to inspect, describes the current state to check for, and provides the specific text to apply. Sufficient for an adopting project's Curator to execute the migration without additional context.

Summary and change descriptions accurately characterize what changed and why.
