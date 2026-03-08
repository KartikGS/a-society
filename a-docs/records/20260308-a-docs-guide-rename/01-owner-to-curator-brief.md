# Owner → Curator: Briefing

---

**Subject:** Rename agent-docs-guide.md to a-docs-guide.md
**Status:** BRIEFED
**Date:** 2026-03-08

---

## Agreed Change

Rename the artifact `agent-docs-guide.md` to `a-docs-guide.md` in both A-Society's own `a-docs/` and the general instruction in `general/instructions/`. The term "agent-docs" has been replaced by "a-docs" across the project; this rename aligns the filename with current naming conventions.

This is a filename-only change. The variable names (`$A_SOCIETY_AGENT_DOCS_GUIDE`, `$INSTRUCTION_AGENT_DOCS_GUIDE`) remain unchanged — the index system is designed to absorb path changes without propagating variable renames.

Historical artifacts (records, update reports, feedback reports) are immutable per the invariants in `agents.md` and must not be modified.

---

## Scope

**In scope:**

1. **Rename** `a-docs/agent-docs-guide.md` → `a-docs/a-docs-guide.md`
2. **Rename** `general/instructions/agent-docs-guide.md` → `general/instructions/a-docs-guide.md`
3. **Update** `$A_SOCIETY_INDEX` (`a-docs/indexes/main.md`) — update path for `$A_SOCIETY_AGENT_DOCS_GUIDE` and `$INSTRUCTION_AGENT_DOCS_GUIDE`
4. **Update** `$A_SOCIETY_PUBLIC_INDEX` (`index.md`) — update path for `$INSTRUCTION_AGENT_DOCS_GUIDE`
5. **Update** `general/instructions/a-docs-guide.md` (after rename) — the line that says "Name it `agent-docs-guide.md`" must become "Name it `a-docs-guide.md`"
6. **Update** `a-docs/a-docs-guide.md` (after rename) — the heading `### agent-docs-guide.md — $A_SOCIETY_AGENT_DOCS_GUIDE` must become `### a-docs-guide.md — $A_SOCIETY_AGENT_DOCS_GUIDE`
7. **Update** `a-docs/roles/curator.md` — context confirmation string references `agent-docs-guide` by name
8. **Update** `general/roles/curator.md` — references filename `agent-docs-guide.md`
9. **Update** `agents/initializer.md` — 3 hardcoded references to `agent-docs-guide.md`
10. **Update** `a-docs/workflow/main.md` — line 98 references "agent-docs-guide entry"

**Out of scope:**

- Variable name changes (`$A_SOCIETY_AGENT_DOCS_GUIDE`, `$INSTRUCTION_AGENT_DOCS_GUIDE` stay as-is)
- Historical artifacts: all files under `a-docs/records/`, `updates/`, and `feedback/` are immutable and must not be touched
- Framework update report — this is an internal naming alignment, not a change to `general/` semantics that would affect adopters. However, the Curator should assess whether the filename change in `general/instructions/` and `general/roles/curator.md` qualifies per `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Likely Target

Files listed in scope items 1–10 above. All paths are resolvable via `$A_SOCIETY_INDEX`.

---

## Open Questions for the Curator

1. Does the filename change in `general/instructions/` and `general/roles/curator.md` warrant a framework update report? The Curator should assess per `$A_SOCIETY_UPDATES_PROTOCOL`. My leaning: yes, since adopters referencing the old filename in hardcoded paths could break.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Rename agent-docs-guide.md to a-docs-guide.md."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
