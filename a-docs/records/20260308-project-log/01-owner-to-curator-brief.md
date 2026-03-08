# Owner → Curator: Briefing

---

**Subject:** Create A-Society project log
**Status:** BRIEFED
**Date:** 2026-03-08

---

## Agreed Change

A-Society needs a project log — a single document that answers "What is the current state? What should I work on next?" at the start of every session. The framework has the general instruction for this (`$INSTRUCTION_LOG`), but A-Society itself does not have one yet.

The project has enough completed work to populate the current state meaningfully, and there are several pending items from recent backward passes that need a visible home. Without a log, the Owner must reconstruct current state by scanning record folders and todo files — exactly the problem the log solves.

---

## Scope

**In scope:**

1. **Create** `a-docs/project-information/log.md` following `$INSTRUCTION_LOG`
2. **Populate current state** from completed work. The Curator should survey the records, todo files, and recent flow artifacts to determine what has been completed and in what order. Key completed flows to consider:
   - Graph-based workflow model (`a-docs/todo/1-graph-workflow.md` — Status: Complete)
   - Owner as universal session entry point (`a-docs/todo/2-owner-as-entry-point.md` — Status: Implemented)
   - Records infrastructure (`a-docs/records/20260308-records-infrastructure/`)
   - A-docs-guide rename (`a-docs/records/20260308-a-docs-guide-rename/`)
3. **Populate next priorities** from actionable items surfaced in backward passes. The Curator should survey all findings and synthesis artifacts. Known pending items (the Curator should verify and supplement this list):
   - **Flow A from rename synthesis:** Update Owner role Post-Confirmation Protocol — workflow as the default for all work, not a menu option. Targets: `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`. Severity: High. Source: `a-docs/records/20260308-a-docs-guide-rename/06-curator-synthesis.md`
   - **Flow B from rename synthesis:** Add session-routing guidance at handoffs — Owner must state new vs. existing session at every transition. Targets: `$A_SOCIETY_WORKFLOW` and/or `$A_SOCIETY_OWNER_ROLE`. Severity: Medium. Source: `a-docs/records/20260308-a-docs-guide-rename/06-curator-synthesis.md`
   - **Variable retirement protocol** from records-infrastructure findings — documented protocol for retiring index variables. Target: `general/instructions/indexes/main.md`. Source: `a-docs/records/20260308-records-infrastructure/05-owner-findings.md`, Finding 3
   - **Retirement scope in briefings** from records-infrastructure findings — when a briefing retires a folder, scope should auto-include a-docs-guide cleanup. Source: `a-docs/records/20260308-records-infrastructure/05-owner-findings.md`, Finding 2
   - Any Curator-authority maintenance items from records-infrastructure findings (Curator Findings 3 and 4: a-docs-guide workflow entry phase count, CUSTOMIZE banner)
4. **Define scope tags** appropriate for A-Society's work (framework development, not software development)
5. **Register** the new file in `$A_SOCIETY_INDEX`
6. **Update** `$A_SOCIETY_AGENT_DOCS_GUIDE` — add a rationale entry for the project log

**Out of scope:**

- Retiring the `a-docs/todo/` folder or its files — those remain as the original requirement documents (immutable historical artifacts). The log's next priorities list supersedes them as the source of "what's next," but the todo files retain their value as requirement specifications.
- Modifying any existing record artifacts
- Starting work on any of the next-priority items — just list them

---

## Likely Target

`a-docs/project-information/log.md` — following `$INSTRUCTION_LOG`.

Registration in `$A_SOCIETY_INDEX`. Entry in `$A_SOCIETY_AGENT_DOCS_GUIDE`.

---

## Open Questions for the Curator

1. **Scope tag set:** The general instruction suggests `[S]`, `[M]`, `[L]`, `[ADR]`, `[DOC]`, `[TEST]` as a starting set. A-Society is a documentation framework, not a software project — `[TEST]` is probably not relevant. The Curator should propose a tag set appropriate for framework development work.
2. **Who reads it?** The log is read at orientation by the Owner (and possibly the Curator). The Curator should determine and state this in the a-docs-guide entry.
3. **Entry lifecycle adjustment:** The general instruction prescribes one `Recent Focus` and up to three `Previous`. The Curator should assess whether this window size is appropriate given A-Society's flow cadence, or propose an adjustment.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Create A-Society project log."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
