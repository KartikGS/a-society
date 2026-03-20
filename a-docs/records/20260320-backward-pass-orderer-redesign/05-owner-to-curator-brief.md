---
**Subject:** Backward pass orderer redesign — documentation changes (5 files)
**Status:** BRIEFED
**Date:** 2026-03-20

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_IMPROVEMENT` | modify |
| `$GENERAL_IMPROVEMENT` | modify |
| `$A_SOCIETY_RECORDS` | modify |
| `$INSTRUCTION_RECORDS` | modify |
| `$A_SOCIETY_ARCHITECTURE` | modify |

Component 4 (Backward Pass Orderer) has been redesigned. The interface and input source are changing. Documentation must be updated to reflect what agents should know about using the tool and what the record folder now contains.

**Change 1 — `$A_SOCIETY_IMPROVEMENT`: Component 4 mandate section** `[Requires Owner approval]`

Three updates to the Component 4 mandate in the Backward Pass Protocol:

- *Input source:* remove the reference to passing a workflow variable (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` or `$A_SOCIETY_WORKFLOW_TOOLING_DEV`). Replace with: Component 4 reads `workflow.md` from the record folder. The invocation is `orderWithPromptsFromFile(recordFolderPath)`.
- *When to invoke:* remove the multi-role conditional ("only when the flow has more than two participating roles"). Component 4 is always invoked when available, for every flow regardless of role count.
- *Output:* update the description of what Component 4 returns. It returns a `BackwardPassPlan` — an ordered list of entries, each with `role`, `stepType` (`meta-analysis` | `synthesis`), `sessionInstruction` (`existing-session` | `new-session`), and `prompt`. The synthesis entry is always the last entry in the list, produced by the algorithm itself — not appended by the caller.

**Change 2 — `$GENERAL_IMPROVEMENT`: tooling section** `[Requires Owner approval]`

Same three updates as Change 1, in the project-agnostic version. Language must remain domain-agnostic — do not reference A-Society-specific file paths. Reference `workflow.md` in the record folder generically; reference the invocation entry point by function name only (`orderWithPromptsFromFile`).

**Change 3 — `$A_SOCIETY_RECORDS`: add `workflow.md`** `[Requires Owner approval]`

Add a new section documenting `workflow.md` as a living artifact in the record folder. This section must cover:

- *What it is:* a structured YAML file in the record folder representing the flow's forward-pass path. It is not a sequenced artifact (no `NN-` prefix). It is separate from `01-owner-workflow-plan.md`.
- *Schema:* YAML frontmatter with three fields: `workflow.synthesis_role` (string — the role that performs backward pass synthesis), `workflow.path` (ordered list), and per-path-entry fields `role` (string) and `phase` (string).
- *Who creates it:* Owner, at intake, alongside `01-owner-workflow-plan.md`.
- *Who can edit it:* Owner and roles explicitly designated as workflow-authority for this flow. Regular implementers do not edit it.
- *When it is appended:* when a team lead or workflow-authority role defines their portion of the path that the Owner could not specify at intake.
- *What Component 4 reads from it:* `workflow.synthesis_role` and `workflow.path[].role`. The `phase` field is not parsed by Component 4 but is present for human orientation.

Also address the overlap with the plan's `path` field (see Open Questions below).

**Change 4 — `$INSTRUCTION_RECORDS`: add `workflow.md`** `[Requires Owner approval]`

Same addition as Change 3, in the project-agnostic version. Remove A-Society-specific role names (Owner, Curator). Describe the workflow-authority concept generically — the project defines which roles can append to `workflow.md`.

**Change 5 — `$A_SOCIETY_ARCHITECTURE`: Component 4 table row** `[Curator authority — implement directly]`

Update the Component 4 row description in the tooling layer table:

- Current: "Computes correct backward pass traversal order from a workflow graph and generates per-role session trigger prompts"
- Replace with: "Computes backward pass traversal order and generates per-role session trigger prompts from `workflow.md` in the active record folder"

---

## Scope

**In scope:** The five file changes listed above. The authoring rules and schema for `workflow.md`. Resolving the overlap between `workflow.md` and the plan's `path` field (in the proposal).

**Out of scope:**
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — updated at Phase 7 Registration after both parallel tracks complete, per the TA advisory
- `$A_SOCIETY_TOOLING_INVOCATION` — updated by the Developer as part of Track A
- Project log Next Priorities update (Priorities 1 and 2) — Owner responsibility at flow close
- Any changes to Component 7 (Plan Artifact Validator) — not in scope for this flow

---

## Responsibility Transfer

Changes 1 and 2 transfer invocation responsibility from agents to `orderWithPromptsFromFile`. Check whether `$A_SOCIETY_IMPROVEMENT` or `$GENERAL_IMPROVEMENT` currently contains any prose directing agents to manually compute backward pass order or conditionally invoke the tool. If such prose exists, it must be removed or replaced — the tool is now always invoked when available.

---

## Likely Target

- `$A_SOCIETY_IMPROVEMENT` → Backward Pass Protocol section, Component 4 mandate subsection
- `$GENERAL_IMPROVEMENT` → same section in the general version
- `$A_SOCIETY_RECORDS` → "What Belongs in a Record" or "Creating a Record Folder" section — Curator to determine the best placement for the `workflow.md` entry
- `$INSTRUCTION_RECORDS` → same for general version
- `$A_SOCIETY_ARCHITECTURE` → tooling layer component table

---

## Open Questions for the Curator

1. **`workflow.md` vs. plan `path` field overlap.** The plan artifact already has a `path` field (flat string list: `- Owner - Intake`). `workflow.md` introduces a second path representation with a structured schema. The Curator must propose how these coexist: do both serve distinct purposes that justify the dual maintenance burden, or should the plan's `path` field be retired in favour of `workflow.md`? Note that retiring the plan's `path` field would require a Component 7 (Plan Artifact Validator) interface change — treat this as out of scope unless the case for consolidation is strong. Default recommendation is coexistence with a clear rationale in the documentation.

2. **Placement of `workflow.md` entry in `$A_SOCIETY_RECORDS`.** The records document has sections for artifact sequence, what belongs in a record, and creating a record folder. The Curator determines where `workflow.md` fits best and whether a new sub-section is warranted or an addition to an existing section is sufficient.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for backward pass orderer redesign — documentation changes."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.

Return to the Owner when the proposal is complete, with a copyable path to the proposal artifact.
