# Owner → Curator: Briefing

> **Template** — do not modify this file. Create from this template into the active record folder as `01-owner-to-curator-brief.md` (or the next available sequence position if `01-` is taken).

> **Authorization scope:** A briefing establishes scope and direction alignment only. It does not authorize implementation. A Phase 2 Owner decision artifact (`APPROVED` status) is required before the Curator begins implementation. A briefing may state that a direction is acceptable in principle; it must not state or imply that implementation may proceed without that decision.

---

**Subject:** Thinking folder — required initialization artifact
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

The `thinking/` folder should be a default initialization artifact, created by the Initializer for every project alongside the other foundational documents. Currently it is treated as a conditional/deferred artifact in `$INSTRUCTION_THINKING`, with a deferral path for "a project with a single agent role and minimal documented process." This undersells it.

The case for making it required:

1. The thinking folder's content — general principles, reasoning framework, operational reminders — is the behavioral foundation layer. It is explicitly designed to be read by every agent regardless of role.
2. The three general templates (`$GENERAL_THINKING`, `$GENERAL_THINKING_REASONING`, `$GENERAL_THINKING_KEEP_IN_MIND`) are the most domain-agnostic artifacts the framework offers. They require the least project-specific knowledge to draft and are essentially usable as-is with minor customization.
3. The deferral condition "until agents have shown a tendency to repeat the same reasoning errors" means waiting for the problem before addressing it — backwards from a framework whose core bet is that structure prevents problems rather than reacts to them.
4. Context efficiency concerns for minimal projects do not outweigh the benefit: three short documents with universal principles and hard stops are cheap to load.

The deferral path in `$INSTRUCTION_THINKING` should be removed or narrowed to match the new default.

---

## Scope

**In scope:**
- Update `$INSTRUCTION_THINKING` — remove or narrow the deferral condition in the "When to Create This Folder" section; reposition thinking/ as a default initialization artifact with no required conditions
- Update `$A_SOCIETY_INITIALIZER_ROLE` — add thinking/ as a numbered step in Phase 3 (before agents.md, since agents.md references thinking/ documents in the Universal Standards section); update Handoff Criteria to include thinking/ in the foundational documents list
- Update `$A_SOCIETY_AGENT_DOCS_GUIDE` — add a rationale entry for the thinking/ folder
- Assess whether a framework update report is warranted for existing projects (existing initialized projects do not have thinking/ and may benefit from adding it — expected classification: Recommended)

**Out of scope:**
- Changes to the three general thinking templates (`$GENERAL_THINKING`, `$GENERAL_THINKING_REASONING`, `$GENERAL_THINKING_KEEP_IN_MIND`) — their content is not in question
- Broader review of what other general/ features should be required — that is a separate, larger flow

---

> **Responsibility transfer note:** None. No existing responsibility is being transferred between roles.

---

## Likely Target

- `$INSTRUCTION_THINKING` → `/a-society/general/instructions/thinking/main.md`
- `$A_SOCIETY_INITIALIZER_ROLE` → `/a-society/agents/initializer.md`
- `$A_SOCIETY_AGENT_DOCS_GUIDE` → `/a-society/a-docs/a-docs-guide.md`
- Framework update report → `$A_SOCIETY_UPDATES_DIR` (if triggered after Curator assessment)

---

## Open Questions for the Curator

None. The scope, target files, and implementation approach are fully specified. The proposal round is mechanical — draft the content per the scope above, verify placement, and submit.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Thinking folder — required initialization artifact."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
