---

**Subject:** Fully agentic role model — human-collaborative phase flag
**Status:** BRIEFED
**Date:** 2026-03-14

---

## Agreed Change

Role documents are always written for agents. The concept of a "human or agent" contributor holding a role is removed from the framework. Humans are never role owners — they are collaborators within phases.

Human involvement is encoded at the workflow level, not the role level. A workflow phase definition may include a human-involvement flag. When a phase is flagged, the agent assigned to that phase acts as the interface: it surfaces the relevant context to the human, elicits the decisions or work the human contributes, and authors the outgoing handoff artifact. The workflow's structural integrity — artifact consistency, handoff format — is preserved because an agent always authors the artifacts.

Phase 1 of any workflow always carries the human-involvement flag, because the direction source is always human. Phases with no flag are fully automated.

This change makes an implicit pattern explicit. The current framework already embeds this model in practice — the Owner agent is always the interface between the human and the workflow. This change removes the inconsistency where "Human" could appear as a phase owner and where role documents could in principle be written for human contributors.

**Why it is worth doing:** The current "human or agent" framing creates a conceptual gap in the framework. If human-authored handoffs were permitted, workflow consistency would break at every human boundary — format drift, missed fields, unpredictable artifact quality. The agent-as-interface model closes this gap: every artifact is agent-authored regardless of who does the underlying work.

---

## Scope

**In scope:**
1. `$INSTRUCTION_ROLES` — remove all "human or agent" framing; role documents are defined as always written for agents; the role document opening definition and any archetype descriptions that imply a human may hold a role are updated accordingly.
2. `$INSTRUCTION_WORKFLOW` — add the human-involvement flag to the phase definition format; define the agent's obligations when a phase is flagged (surface context, elicit work/decisions, author outgoing artifact); specify that a phase owner is always an agent; Phase 1 always carries the flag as a structural rule.
3. `$A_SOCIETY_WORKFLOW` — concurrent MAINT: replace all "Human" phase owner entries with the appropriate agent role (Owner) and apply the human-involvement flag to Phase 1 and any other phases where human input is required.

**Out of scope:**
- Changes to the Initializer role (may be warranted as a follow-up if the Initializer currently asks about human contributors when drafting roles — flag during backward pass if observed).
- Changes to any project-specific a-docs/ that instantiate the current model — those are each project's Curator responsibility after a framework update report.

---

> **Responsibility transfer note:** `$INSTRUCTION_ROLES` currently names "human or agent" as the target audience for a role document. This framing also appears in the opening section. Both references require updating. The Curator should grep for "human or agent" and any related phrasing across `$INSTRUCTION_ROLES` to catch all occurrences.

---

## Likely Target

1. `/a-society/general/instructions/roles/main.md` (`$INSTRUCTION_ROLES`)
2. `/a-society/general/instructions/workflow/main.md` (`$INSTRUCTION_WORKFLOW`)
3. `/a-society/a-docs/workflow/main.md` (`$A_SOCIETY_WORKFLOW`) — MAINT

---

## Open Questions for the Curator

1. **Flag form in workflow phase definition:** The flag is confirmed as a field in the workflow phase definition. The Curator should propose the concrete form — what the field is named, how it is written in the phase block, and whether it carries any additional information (e.g., what the human contributes, or just a binary present/absent marker).

2. **Agent obligations — scope of the named pattern:** The core obligations are confirmed (surface context, elicit work/decisions, author artifact). The Curator should determine whether these belong as a named sub-pattern within the workflow instruction (alongside branching, fork/join) or as a field-level note within the phase definition spec.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Fully agentic role model — human-collaborative phase flag."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
