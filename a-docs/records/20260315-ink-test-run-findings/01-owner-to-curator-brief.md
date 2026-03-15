---

**Subject:** Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)
**Status:** BRIEFED
**Date:** 2026-03-15

---

## Agreed Change

Three targeted fixes surfaced from a full-lifecycle test run of the Ink project (initialization → first essay workflow → backward pass → curator synthesis). Each gap produced observable agent failure within one run.

**1. Handoff Output: relative path requirement**

The canonical Handoff Output definition (in `$INSTRUCTION_ROLES` Section 7 and the general role templates) specifies that the Curator must provide "Copyable inputs: `[artifact path]`" but does not state that this path must be relative. Four instances of machine-specific absolute paths (e.g., `/home/user/...`, `…/Metamorphosis/...`) appeared across three different agents in a single test run. The fix is to add an explicit sentence in the canonical definition and both general role templates: copyable paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`), never machine-specific, absolute, or using `file://` protocol.

**2. Context confirmation completeness**

The context confirmation template in `$INSTRUCTION_AGENTS` is a fixed string — "Context loaded: agents.md, index, vision, structure, thinking, [role]. Ready." — that does not adapt when a project's required reading list expands. In Ink, communication was added as item 8 in required reading, but all three agents omitted it from their confirmation because the template didn't include it. The fix is to specify in `$INSTRUCTION_AGENTS` that the confirmation statement must enumerate the items actually loaded, and that when drafting an agents.md for a project with additional required reading, the confirmation template must be updated to match.

**3. Curator deep-link prohibition**

The Curator role template warns against hardcoded paths generally but does not explicitly name the markdown hyperlink pattern (`[text](file:///absolute/path)` or `[text](/absolute/path)`) as a violation. During Ink maintenance, the Curator added a `file://` URL to a role document while intending to improve usability — a well-intentioned edit that violated the path discipline invariant. The fix is to add an explicit prohibition in `$GENERAL_CURATOR_ROLE`'s path discipline or maintenance guidance: markdown link syntax using absolute paths or `file://` URLs is forbidden; use `$VARIABLE_NAME` references instead.

---

## Scope

**In scope:**
- Item 1: `$INSTRUCTION_ROLES` Section 7 (canonical Handoff Output definition); `$GENERAL_OWNER_ROLE` Handoff Output section; `$GENERAL_CURATOR_ROLE` Handoff Output section
- Item 2: `$INSTRUCTION_AGENTS` — context confirmation section and the "how to write one" guidance
- Item 3: `$GENERAL_CURATOR_ROLE` — add explicit deep-link prohibition

**Out of scope:** Ink-specific a-docs corrections (the hardcoded path in `ink/a-docs/roles/owner.md`, the context confirmation mismatches in Ink role files) — these are Ink Curator maintenance, handled in a separate Ink session.

---

## Likely Target

- `$INSTRUCTION_ROLES`
- `$GENERAL_OWNER_ROLE`
- `$GENERAL_CURATOR_ROLE`
- `$INSTRUCTION_AGENTS`

---

## Open Questions for the Curator

None. All three changes are fully derivable from the brief. No judgment calls required on scope, target, or implementation approach.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
