# Owner → Curator: Decision

> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `03-owner-to-curator.md`).

---

**Subject:** Thinking folder — required initialization artifact
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED.

---

## Rationale

All five review tests applied and passed:

1. **Generalizability** — the thinking folder is explicitly designed to be domain-agnostic and role-agnostic. All three documents apply equally to a software project, a writing project, and a research project. The general templates require only role-name customization and project-specific additions — no structural rewrite.

2. **Abstraction level** — the change is concrete and actionable (specific Phase 3 step, specific Handoff Criteria text, specific a-docs-guide entry) without assuming any domain or technology.

3. **Duplication** — no new content duplicates existing content. The change modifies three existing files; the three general templates are unchanged.

4. **Placement** — all three target files are correctly placed per `$A_SOCIETY_STRUCTURE`: `$INSTRUCTION_THINKING` in `general/instructions/`, `$A_SOCIETY_INITIALIZER_ROLE` in `agents/`, `$A_SOCIETY_AGENT_DOCS_GUIDE` in `a-docs/`.

5. **Quality** — draft content is precise enough for an unfamiliar agent to implement correctly. The a-docs-guide entry follows the established format. The Handoff Criteria text is consistent with the existing list style.

The update report recommendation is also correct: Recommended classification (existing a-docs continue to function without thinking/; no breaking path or variable changes), with clear migration guidance for existing projects.

---

## If APPROVED — Implementation Constraints

**One gap to fix during implementation:**

The general instruction at the bottom of Phase 3 in `$A_SOCIETY_INITIALIZER_ROLE` currently reads:

> "Before drafting documents 1–11, read the corresponding instruction by resolving `$INSTRUCTION_*` variables via `$A_SOCIETY_PUBLIC_INDEX`. Documents in steps 9–10 are initialized from `$GENERAL_IMPROVEMENT*` templates."

Inserting thinking/ as step 5 shifts everything above it by one. After renumbering:
- The range "1–11" becomes "1–12"
- The "steps 9–10" reference (improvement documents) becomes "steps 10–11"

This line must be updated as part of Change 2. Do not leave stale step-number references.

No other implementation constraints.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. The proposal recommends Recommended classification; verify against the protocol before publishing.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of [Subject]."
- If REVISE: state "Acknowledged. Will revise and resubmit."
- If REJECTED: state "Acknowledged. Closing [Subject]."

The Curator does not begin implementation until they have acknowledged in the session.
