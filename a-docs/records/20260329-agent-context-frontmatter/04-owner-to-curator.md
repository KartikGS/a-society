**Subject:** Agent context frontmatter — Phase 2 Review Decision
**Status:** REVISE
**Type:** Owner → Curator
**Date:** 2026-03-29

---

## Decision

**REVISE** — one correction required in the `$INSTRUCTION_AGENTS` proposed section. All frontmatter lists are approved as proposed. The update report draft is acknowledged with a Phase 4 note below.

---

## Approval: Frontmatter Lists

All six rendered frontmatter blocks are approved:

- `agents.md` universal list: `$A_SOCIETY_AGENTS`, `$A_SOCIETY_INDEX`, `$INSTRUCTION_MACHINE_READABLE_HANDOFF` ✓
- `owner.md`: vision, structure, architecture, principles, log, workflow ✓
- `curator.md`: vision, structure, principles, agent-docs-guide ✓
- `technical-architect.md`: vision, structure, architecture, principles ✓
- `tooling-developer.md`: architecture, tooling proposal, tooling addendum ✓
- `runtime-developer.md`: architecture only ✓ (correct — the runtime architecture design document is flow-specific input, not a fixed required-reading variable)

`$INSTRUCTION_ROLES` proposed section is approved as proposed.

---

## Required Correction: `$INSTRUCTION_AGENTS` Minimum Set

The "Universal minimum set" bullet list (lines 97–100 of the proposal) reads:

> - `$PROJECT_AGENTS`
> - `$PROJECT_INDEX`
> - `$INSTRUCTION_MACHINE_READABLE_HANDOFF` (from A-Society)

`$PROJECT_AGENTS` and `$PROJECT_INDEX` are not real variable names. An adopting project's agents.md and index variables are named to the project (e.g., `$LLM_JOURNEY_AGENTS`) — the framework does not impose a `$PROJECT_*` prefix convention. Using fictional placeholders here contradicts the instruction's own variable-naming conventions.

Replace the bulleted minimum set with functional descriptions:

> - **Universal minimum set:** Every project's universal list should include at minimum:
>   - The variable registered in the project's index for its own `agents.md`
>   - The variable registered in the project's index for its own file index
>   - `$INSTRUCTION_MACHINE_READABLE_HANDOFF` — registered in the project's index per the adoption instructions in the handoff instruction itself

The Example block below that text already shows the A-Society concrete form correctly — no change needed there.

No other changes to the `$INSTRUCTION_AGENTS` section are required.

---

## Phase 4 Note: Update Report Classification

The draft classifies the change as Breaking at proposal stage. The brief required `TBD` at this stage. The Breaking classification is plausible, but do not finalize it based on this proposal — confirm against `$A_SOCIETY_UPDATES_PROTOCOL` at Phase 4 before filing the implementation confirmation. The version number (`v24.0`) follows from Breaking classification and should also be confirmed at Phase 4.

---

## Follow-Up Actions

1. Revise the `$INSTRUCTION_AGENTS` section as specified above and resubmit as `05-curator-to-owner.md`.
2. The frontmatter lists and `$INSTRUCTION_ROLES` section do not need to be reproduced in the resubmission — reference this decision as approving them and show only the corrected `$INSTRUCTION_AGENTS` section.
3. At Phase 4, confirm update report classification against `$A_SOCIETY_UPDATES_PROTOCOL` before filing the implementation confirmation.
