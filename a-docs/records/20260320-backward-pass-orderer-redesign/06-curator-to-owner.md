---
**Subject:** Backward pass orderer redesign — documentation changes (5 files)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-20

---

## Trigger

Owner brief (`05-owner-to-curator-brief.md`) following TA advisory (`03-ta-advisory.md`) and Owner decision (`04-owner-decision.md`) approving the Component 4 redesign. Component 4's input model and output format have changed; five documentation files must be updated to reflect what agents should know about using the tool and what the record folder now contains.

---

## What and Why

Component 4 (Backward Pass Orderer) has been redesigned. Its input source is changing from a workflow graph document to `workflow.md` in the active record folder, its invocation condition is changing from role-count-conditional to always-invoke, and its output format is changing from an unspecified ordering to a structured `BackwardPassPlan`. The documentation must match these changes so agents invoke Component 4 correctly and know what to produce in record folders.

This proposal covers Changes 1–4 (requiring Owner approval) and notes Change 5 (Curator authority, to be implemented directly in Phase 3).

---

## Where Observed

A-Society — internal. Component 4 redesign is documented in `03-ta-advisory.md` and approved in `04-owner-decision.md`.

---

## Target Location

| Change | File | Requires approval |
|---|---|---|
| 1 | `$A_SOCIETY_IMPROVEMENT` | Yes |
| 2 | `$GENERAL_IMPROVEMENT` | Yes |
| 3 | `$A_SOCIETY_RECORDS` | Yes |
| 4 | `$INSTRUCTION_RECORDS` | Yes |
| 5 | `$A_SOCIETY_ARCHITECTURE` | No — Curator authority; to be implemented directly |

---

## Open Question Resolutions

### Open Question 1 — workflow.md vs. plan `path` field

**Recommendation: coexistence with documented rationale.**

The plan's `path` field (flat string list, e.g. `- Owner - Intake & Briefing`) and `workflow.md`'s structured path serve different consumers and cannot be collapsed without a Component 7 interface change (out of scope):

- **Plan `path`** — human-oriented planning reference. Combines role and phase descriptor in one string. Used for complexity assessment and routing decisions at intake. Validated by Component 7 (Plan Artifact Validator) as part of plan YAML frontmatter.
- **`workflow.md` path** — machine-readable schema parsed by Component 4. Structured `role` + `phase` fields. Used to compute backward pass traversal order.

Retiring the plan's `path` field would require Component 7 to stop validating it — a breaking interface change explicitly marked out of scope in the brief. Coexistence is the correct call. The documentation will note that both representations must be kept consistent (roles matching), that `workflow.md` is authoritative for programmatic ordering, and that the plan's `path` governs human-oriented planning only.

### Open Question 2 — Placement of workflow.md entry in `$A_SOCIETY_RECORDS`

**Recommendation: new dedicated section between `## Artifact Sequence` and `## What Belongs in a Record`.**

`workflow.md` does not fit into the existing sections:
- It is not sequenced, so it does not belong in the artifact sequence table.
- "What Belongs in a Record" is a filter (what to include vs. exclude), not a reference for individual artifact types.

A dedicated `## workflow.md — Forward Pass Path` section gives it the schema documentation, authoring rules, and Component 4 dependency description it needs — in a location that will be found when someone is orienting to the record folder structure. The same placement applies in `$INSTRUCTION_RECORDS`.

---

## Draft Content

### Change 1 — `$A_SOCIETY_IMPROVEMENT`: Component 4 mandate subsection

**Action:** Replace the entire "Component 4 mandate" subsection (currently lines 139–143).

**Current:**

> #### Component 4 mandate
>
> When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available **and** the flow has more than two participating roles, invoke Component 4 to generate the trigger prompts and order them. Use `generateTriggerPrompts` and `orderWithPromptsFromFile`, passing `$A_SOCIETY_WORKFLOW`. The orderer will programmatically assemble the roles in their backward-pass sequence based on their presence in the workflow.
>
> For flows with only two roles (Owner + Curator), manual application of the standard order above is sufficient.

**Proposed replacement:**

> #### Component 4 mandate
>
> When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available, invoke it for every flow regardless of role count. The invocation is `orderWithPromptsFromFile(recordFolderPath)`, where `recordFolderPath` is the path to the active record folder. Component 4 reads `workflow.md` from that folder directly — do not pass a workflow document path.
>
> Component 4 returns a `BackwardPassPlan`: an ordered list of entries, each containing:
> - `role` — the role name
> - `stepType` — `meta-analysis` | `synthesis`
> - `sessionInstruction` — `existing-session` | `new-session`
> - `prompt` — the generated trigger prompt for that role
>
> The synthesis entry is always the final entry in the list and is produced by the algorithm — do not append it manually.

**Responsibility transfer check:** The removed text contained two invocation-limiting conditions: the multi-role conditional ("and the flow has more than two participating roles") and the two-role fallback sentence ("For flows with only two roles (Owner + Curator), manual application of the standard order above is sufficient"). Both are removed. No other prose in `$A_SOCIETY_IMPROVEMENT` directs agents to manually compute backward pass order or conditionally invoke the tool.

---

### Change 2 — `$GENERAL_IMPROVEMENT`: tooling paragraph

**Action:** Replace the "Tooling" paragraph in the "Backward Pass Traversal" subsection (currently lines 132–133).

**Current:**

> **Tooling:** If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it rather than computing the order manually when the flow has more than two participating roles. Pass the project's workflow document path. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance. Consult the project's tooling documentation for the specific invocation path. When no such tool is available, apply the rules above manually.

**Proposed replacement:**

> **Tooling:** If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it for every flow regardless of role count. The orderer reads `workflow.md` from the active record folder; invoke it using `orderWithPromptsFromFile` with the record folder path. The orderer returns a structured backward pass plan: an ordered list of entries, each containing a role, step type (`meta-analysis` | `synthesis`), session instruction (`existing-session` | `new-session`), and prompt. The synthesis entry is always the final entry in the list and is produced by the algorithm — do not append it manually. Consult the project's tooling documentation for the specific invocation path. When no such tool is available, apply the traversal rules above manually.

**Responsibility transfer check:** The removed conditional ("when the flow has more than two participating roles") is removed. The sentence "When no such tool is available, apply the rules above manually" is retained — it governs absence of the tool, not role count, and remains correct.

---

### Change 3 — `$A_SOCIETY_RECORDS`: add workflow.md section and update Creating a Record Folder

**Action 3a:** Insert the following section after `## Artifact Sequence` and before `## What Belongs in a Record`.

---

> ## workflow.md — Forward Pass Path
>
> `workflow.md` is a structured YAML file that lives in the record folder alongside the sequenced artifacts. It is not sequenced — it has no `NN-` prefix and does not appear in the artifact sequence table.
>
> **Schema:**
>
> ```yaml
> workflow:
>   synthesis_role: <string>   # The role that performs backward pass synthesis
>   path:
>     - role: <string>         # Role name (parsed by Component 4)
>       phase: <string>        # Phase descriptor (human orientation; not parsed by Component 4)
> ```
>
> **Who creates it:** The Owner, at flow intake, alongside `01-owner-workflow-plan.md`.
>
> **Who can edit it:** The Owner and any role explicitly designated as workflow-authority for this flow. Standard implementer roles do not edit `workflow.md`.
>
> **When it is appended:** When a workflow-authority role defines their portion of the path that the Owner could not specify at intake.
>
> **What Component 4 reads from it:** `workflow.synthesis_role` and `workflow.path[].role`. The `phase` field is present for human orientation and is not parsed by Component 4.
>
> **Relationship to the plan's `path` field:** `01-owner-workflow-plan.md` also contains a `path` field — a flat string list combining role and phase descriptor (e.g., `- Owner - Intake & Briefing`). These two representations coexist and serve distinct consumers:
>
> - **Plan `path`** — human-oriented planning reference used for complexity assessment and routing decisions at intake. Not machine-parsed. Combined role + phase strings.
> - **`workflow.md` path** — machine-readable schema parsed by Component 4. Structured `role` and `phase` fields. Used to compute backward pass traversal order.
>
> When creating `workflow.md` at intake, populate it from the plan's `path`. The roles listed must be consistent between the two. `workflow.md` is the authoritative source for programmatic backward pass ordering; the plan's `path` governs human-oriented planning only.

---

**Action 3b:** Replace `## Creating a Record Folder` with the following (step numbers shift to accommodate the new `workflow.md` creation step):

---

> ## Creating a Record Folder
>
> The Owner creates the record folder at flow intake:
>
> 1. Name the folder: `YYYYMMDD-slug`
> 2. Create `01-owner-workflow-plan.md` from `$A_SOCIETY_COMM_TEMPLATE_PLAN` — this is the Phase 0 gate; it must exist before any other artifact in the folder
> 3. Create `workflow.md` using the schema in [## workflow.md — Forward Pass Path] above. Populate `workflow.synthesis_role` and `workflow.path` from the plan's `path` field. `workflow.md` is required in any record folder where Component 4 will be invoked during the backward pass.
> 4. **Tier 2/3 only:** Create `02-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
> 5. **Tier 2/3 only:** Point the Curator at `02-owner-to-curator-brief.md`
>
> Each subsequent artifact is created at the next available sequence position by the role responsible for it.

---

### Change 4 — `$INSTRUCTION_RECORDS`: add workflow.md section and update How to Create

**Action 4a:** Insert the following section after `## Sequencing` and before `## What Goes in a Record`.

---

> ## workflow.md — Forward Pass Path
>
> Some projects using this framework maintain a `workflow.md` file in each record folder alongside the sequenced artifacts. This is a structured YAML file representing the flow's forward-pass path in machine-readable form. It is not a sequenced artifact — it has no `NN-` prefix.
>
> **When to use `workflow.md`:** When the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order), `workflow.md` is the input that tool reads. Projects without such tooling do not need `workflow.md`.
>
> **Schema:**
>
> ```yaml
> workflow:
>   synthesis_role: <string>   # The role that performs backward pass synthesis
>   path:
>     - role: <string>         # Role name
>       phase: <string>        # Phase descriptor (human orientation only)
> ```
>
> **Who creates it:** The role that performs flow intake, at the same time as the workflow plan artifact, before any sequenced artifacts are created.
>
> **Who can edit it:** The intake role and any role the project designates as workflow-authority for this flow. Regular implementer roles do not edit it.
>
> **When it is appended:** When a workflow-authority role defines their portion of the path that the intake role could not specify at intake.
>
> **What the orderer reads from it:** The `synthesis_role` field and the `role` entries in the `path` list. The `phase` field is for human orientation and is not parsed programmatically.
>
> **Relationship to the plan's `path` field:** If the project's workflow plan artifact contains a `path` field (a flat string list for human planning), both coexist. They serve different consumers: the plan's `path` is for human-oriented complexity assessment; `workflow.md` is for programmatic backward pass ordering. When creating `workflow.md`, populate it from the plan's `path`. `workflow.md` is authoritative for programmatic ordering; the plan's `path` governs human-oriented planning only.

---

**Action 4b:** In `## How to Create a Records Structure`, append to Step 2 ("Declare the artifact sequence"):

> If the project will use a Backward Pass Orderer tool, also declare `workflow.md` as a non-sequenced artifact created at intake alongside the workflow plan (`01-`). Document its schema, authoring authority, and the tool that reads it in the project's `records/main.md`.

---

### Change 5 — `$A_SOCIETY_ARCHITECTURE`: Component 4 table row (Curator authority — implementing directly in Phase 3)

**Current row description:** "Computes correct backward pass traversal order from a workflow graph and generates per-role session trigger prompts"

**Replacement:** "Computes backward pass traversal order and generates per-role session trigger prompts from `workflow.md` in the active record folder"

This change is marked `[Curator authority — implement directly]` in the brief. It will be applied during Phase 3 without a separate approval artifact.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation of Changes 1–4 until `owner-to-curator.md` shows APPROVED status. Change 5 will be implemented directly in Phase 3 per its brief designation.
