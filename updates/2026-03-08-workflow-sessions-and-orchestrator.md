# A-Society Framework Update — 2026-03-08

## Summary

The workflow instruction and improvement templates have been updated to introduce two new concepts — sessions and the human orchestrator — and to align terminology across all improvement-related documents. The workflow instruction now defines how graphs are executed at runtime (sessions, pause/resume, the human as the orchestrator who maintains continuity) and recommends a session model as a workflow document section. The improvement protocol and instruction have been updated to replace "Phase 1 observations" with "trigger inputs," removing an assumption about specific phase naming that reduced portability.

Known adopters at publication time: LLM Journey. This report is addressed to all adopting project Curators. Migration guidance is written generically — map `$[PROJECT]_*` placeholders to your project's actual index variable names.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### RECOMMENDED 1 — Workflow instruction adds sessions and human orchestrator concepts

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_WORKFLOW`
**What changed:** A new section "Sessions and the Human Orchestrator" has been added after "The Workflow as a Graph." It defines: **session** (a continuous interaction between the human and an agent that can span multiple phases and be paused/resumed), **session reuse** (resume by default rather than starting new sessions), **the human as orchestrator** (the human maintains continuity between sessions and routes artifacts), **transition behavior** (agents should tell the human what to do at pause points), and **future automation** (the human's role is a specification for what automation replaces). A new recommended section "5. Session Model" has been added to "What Belongs in a Workflow Document," and a new Step 6 has been added to "How to Write One."
**Why:** The workflow instruction defined graphs (structure) but not sessions (execution). Agents had no concept of who carries work between sessions, what a pause point is, or that they should address the human at transitions. This gap meant agents wrote artifacts into the void rather than guiding the human to the next step. The addition also creates a clear automation specification — if the human's orchestration role is named, it can be automated without changing the graph model.
**Migration guidance:**
- Review your project's `$[PROJECT]_WORKFLOW`. If your project has two or more agent roles, consider adding a "Session Model" section describing: which roles run in which sessions, where natural pause points are, and what agents should tell the human at each transition.
- If your project's workflow was written before this update, its phase definitions likely assume each phase is a separate session. Consider whether your agents should acknowledge pause points and guide the human.
- No existing content contradicts this addition — it is purely additive. No documents need to be modified unless you choose to adopt the session model.

---

### RECOMMENDED 2 — "Phase 1 observations" replaced with "trigger inputs" in improvement documents

**Impact:** Recommended
**Affected artifacts:** `$GENERAL_IMPROVEMENT_PROTOCOL`, `$INSTRUCTION_IMPROVEMENT`
**What changed:** All references to "Phase 1 observations" or "observations (Phase 1)" in the general improvement protocol and the improvement instruction have been replaced with "trigger inputs" or "new trigger inputs." The improvement protocol template now says findings "re-enter the workflow as new trigger inputs" instead of "re-enter the workflow as Phase 1 observations." The improvement instruction now says findings flow back "as new trigger inputs" instead of "as Phase 1 observations."
**Why:** The term "Phase 1 observations" assumed that every project's first workflow phase was named "Observation" — a holdover from A-Society's own earlier workflow design. This reduced portability: a project whose entry node is named "Proposal" or "Intake" would see a term that doesn't match their workflow. "Trigger inputs" is graph-model-correct and phase-name-agnostic.
**Migration guidance:**
- Check your project's `$[PROJECT]_IMPROVEMENT_PROTOCOL`. If it was adapted from `$GENERAL_IMPROVEMENT_PROTOCOL` and contains references to "Phase 1 observations," consider updating to "trigger inputs" or to whatever your project's entry node is named.
- Check your project's `$[PROJECT]_IMPROVEMENT` (the improvement instruction instantiation). Same search: "Phase 1 observations" → update to match your workflow terminology.
- If your project's workflow entry node is already Phase 1, the terminology change is cosmetic but improves clarity. If your project uses different phase numbering, this update removes a confusing mismatch.

---

### RECOMMENDED 3 — Workflow instruction step count updated

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_WORKFLOW`
**What changed:** The "How to Write One" section now has 8 steps instead of 7. The new Step 6 ("Describe the session model") was inserted for multi-role workflows. Previous steps 6 and 7 ("Identify sub-documents" and "Cut what does not belong") have been renumbered to 7 and 8.
**Why:** The session model step follows directly from the new "Sessions and the Human Orchestrator" section. Projects following the "How to Write One" guide step-by-step should encounter the session model consideration at the right point in the process — after defining escalation rules and before identifying sub-documents.
**Migration guidance:**
- No direct migration required. If your project's workflow was built by following the step-by-step guide, the additional step applies to future workflow revisions, not to existing documents.
- If your project's documentation references specific step numbers from the workflow instruction (e.g., "follow Step 6 of `$INSTRUCTION_WORKFLOW`"), verify the step number still matches after renumbering.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.
