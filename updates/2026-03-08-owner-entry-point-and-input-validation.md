# A-Society Framework Update — 2026-03-08

## Summary

The Owner role is now the universal session entry point for all projects. After loading context, the Owner presents available workflows and routes the user — replacing the previous model where users had to know the workflow structure in advance. Additionally, a new "Input Validation" section has been added to the role document standard: workflow-participating roles should define their expected inputs and flag unexpected ones as a signal of workflow bypass. The agent-docs-guide instruction now requires every artifact entry to answer "who reads it?" — preventing orphan artifacts that no role loads.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 1 | Context-dependent improvement — adopt only if the problem applies |

---

## Changes

### Owner as Universal Session Entry Point

**Impact:** Recommended
**Affected artifacts:** [`general/roles/owner.md`], [`general/instructions/workflow/main.md`]
**What changed:** The Owner role template now includes workflow routing as a responsibility, the workflow document in context loading, and a new Post-Confirmation Protocol section. After confirming context, the Owner presents available workflows and invites the user to choose — or engage freeform. The workflow instruction now documents the Owner-as-entry-point pattern and requires every workflow to include a one-line summary for the Owner to present.
**Why:** Users had to carry the workflow structure in their own memory — knowing which roles exist, which workflow applies, and which role to start with. For projects with multiple workflows or infrequent sessions, this was a UX failure. The Owner is the natural routing layer because it already loads the broadest context. Only the Owner needs the full workflow map; other agents see their node contracts only, aligning with context efficiency.
**Migration guidance:** Check `$[PROJECT]_OWNER_ROLE`. If the Owner role does not include workflow routing in its responsibilities or a Post-Confirmation Protocol section, add both. Add the project's workflow document(s) to the Owner's context loading. Update the context confirmation statement to include "workflow." Add a one-line `**Summary:**` line to the top of each workflow document in `$[PROJECT]_WORKFLOW` (or equivalent). Review whether any non-Owner roles currently load the full workflow document unnecessarily — if so, consider removing it from their context loading and ensuring their role file defines their node contract (expected inputs and outputs) instead.

---

### Input Validation for Workflow-Participating Roles

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/roles/main.md`]
**What changed:** A new mandatory section (§6, "Input Validation") has been added to the role document standard. Workflow-participating roles should define their expected input format, source, and content. When an agent receives input that does not match its expected format, it should flag the discrepancy before proceeding — rather than failing silently or refusing to work.
**Why:** When a user bypasses the designed workflow (intentionally or accidentally), downstream agents previously had no mechanism to detect this. The defensive signal makes workflow bypass visible: the agent names the discrepancy, the human decides whether it was intentional. This supports the design principle that workflows exist to ensure completeness — breaking them should be a conscious choice, not an invisible one.
**Migration guidance:** Review each role document in `$[PROJECT]_*_ROLE` that participates in a workflow as a downstream node (i.e., receives handoff artifacts from other roles). Add an "Input Validation" section defining the expected input format, source, and what the agent should do if input does not match. Roles that are entry points (e.g., the Owner) do not need this section. This is additive — existing role documents continue to function without it, but adding it improves workflow integrity.

---

### Agent-Docs Guide: "Who Reads It?" Question

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/agent-docs-guide.md`]
**What changed:** The agent-docs-guide entry checklist has been expanded from four questions to five. The new question — "Who reads it?" — requires every artifact entry to name which role loads the file and when. The "Keeping It Current" section now includes an orphan artifact check: when adding a new file, verify it is assigned to at least one role's required reading.
**Why:** Agent-docs exist for agents. An artifact that no role is assigned to read is an orphan — it occupies index space and maintenance burden without influencing any agent's behavior. This was discovered when A-Society's own principles document had no role assigned to read it. The new question prevents this failure mode at documentation time.
**Migration guidance:** Review your project's `$[PROJECT]_AGENT_DOCS_GUIDE`. For each artifact entry, verify that you can answer "which role loads this file, and when?" If any artifact has no assigned reader, either add it to the appropriate role's required reading or question whether the artifact is needed. Pay particular attention to recently added artifacts — these are most likely to have been created without a reader assignment.

---

### Owner Archetype Update in Roles Instruction

**Impact:** Optional
**Affected artifacts:** [`general/instructions/roles/main.md`]
**What changed:** The Owner archetype (Archetype 1) in the roles instruction has been updated to reflect workflow routing as a core responsibility. The archetype template now includes `workflow routing` in the responsibilities list, `workflow` in context loading, and a `Post-Confirmation Protocol` section.
**Why:** Projects creating new Owner roles from the archetype template will now get the routing pattern by default. This is the same change as the Owner template update, reflected in the instruction that describes how to create role documents.
**Migration guidance:** No action required unless your project is creating new Owner roles from the archetype template. If so, the updated template now includes workflow routing. Existing Owner roles are covered by the first change entry above.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
