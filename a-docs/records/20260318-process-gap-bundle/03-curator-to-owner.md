---
**Subject:** Process gap bundle — 4 sections, 11 changes + 1 MAINT inline
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-18

---

## Trigger

Owner-produced brief (`02-owner-to-curator-brief.md`) directing the Curator to address Next Priorities 1–9 as a bundled flow. Changes derive from operational gaps identified during prior flows.

---

## What and Why

Eleven changes across four sections address documented process gaps in approval enforcement, handoff format, records conventions, and tooling governance. One MAINT correction (Priority 3) is implemented inline per brief authority and noted in its section.

---

## Where Observed

A-Society — internal. All gaps identified during prior flow execution and logged in `$A_SOCIETY_LOG`.

---

## Target Location

Section 1: `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_CURATOR_ROLE`
Section 2: `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$GENERAL_CURATOR_ROLE`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_ROLES`
Section 3: `$INSTRUCTION_RECORDS`, `$A_SOCIETY_RECORDS`
Section 4: `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_TOOLING_ADDENDUM`, `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_TOOLING_COUPLING_MAP`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`
MAINT: `$A_SOCIETY_PUBLIC_INDEX`

---

## Draft Content

---

### Section 1 — Brief and Approval Process

---

#### Item 1a — Remove "confirmation step" framing [Requires Owner approval]

**`$A_SOCIETY_OWNER_ROLE` — Brief-Writing Quality section**

Remove the sentence that minimizes Phase 2. Current text:

> A fully-specified brief reduces the proposal round to a confirmation step and eliminates revision cycles for straightforward changes. Reserve open questions for changes that genuinely require Curator judgment.

Replace with:

> A fully-specified brief eliminates revision cycles for straightforward changes. Reserve open questions for changes that genuinely require Curator judgment.

---

**`$GENERAL_OWNER_ROLE` — Brief-Writing Quality section**

Current text:

> This signals to the downstream role that no judgment calls are required: the proposal round becomes a confirmation step, not a design session.

Replace with:

> This signals to the downstream role that no judgment calls are required.

---

#### Item 1b — Add Approval Invariant to Curator hard rules [Requires Owner approval]

**`$A_SOCIETY_CURATOR_ROLE` — Hard Rules section**

Add the following rule. Position: after the existing "Never hardcode a file path" rule.

> - **Never begin implementation on any item without a Phase 2 `APPROVED` decision artifact.** Briefing language, directional alignment, a "fully-specified brief," and any other pre-approval signal do not authorize implementation. The Approval Invariant applies to all items requiring Owner review — including LIB changes and any item not explicitly marked `[Curator authority — implement directly]` in the brief.

---

#### Item 1c — MAINT exemption note (co-located with Item 1b) [Requires Owner approval]

**`$A_SOCIETY_CURATOR_ROLE` — Hard Rules section**

Add immediately after the Item 1b rule (not a hard rule — a clarifying note):

> **MAINT exemption:** Items explicitly marked `[MAINT]` or `[Curator authority — implement directly]` in the brief are exempt from the Approval Invariant and may be implemented directly without a Phase 2 decision artifact. This exemption applies only when the brief marks the item with one of those labels; it does not apply to inferred MAINT status.

---

#### Item 1d — Item authority marking in brief template [Requires Owner approval]

**`$A_SOCIETY_COMM_TEMPLATE_BRIEF` — Agreed Change section**

Add the following note block at the top of the Agreed Change section, before the `[What the Owner and human aligned on...]` placeholder:

> **Item authority marking:** Each item in the Agreed Change section must be marked with its authority level — either `[Requires Owner approval]` or `[Curator authority — implement directly]`. This marking makes the Approval Invariant's scope unambiguous for every item in the brief without requiring the Curator to infer it. An item without a marking is assumed to require Owner approval.

---

#### Item 1e — "Condition not action" note + Curator hard rule [Requires Owner approval]

**`$A_SOCIETY_COMM_TEMPLATE_BRIEF` — add a new note block**

Position: after the existing `> **Authorization scope:**` header note and before the first `---`.

> **Handoff language:** State gate conditions ("return to Owner when X is complete"), not next-role-session instructions ("switch to Session A and point it at Y"). The Owner provides session routing at the point of decision, not in the brief. A brief that routes sessions directly enables the Curator to bypass the Owner-as-waypoint.

---

**`$A_SOCIETY_CURATOR_ROLE` — Hard Rules section**

Add the following rule. Position: after the Item 1b/1c block.

> - **When a gate condition is met, return to the Owner for session routing.** Do not self-authorize a session switch based on routing instructions in a brief. A brief states when to return to the Owner (the gate condition); it does not authorize the Curator to route sessions directly. If a brief contains next-role-session instructions instead of a gate condition, apply the gate condition reading: return to the Owner when the described work is complete.

---

### Section 2 — Existing-Session Handoff Format

---

#### Item 2 — Define and add the existing-session handoff format [Requires Owner approval]

**Named format** (defined once; applied to all role Handoff Output sections and `$INSTRUCTION_ROLES`):

```
Next action: [what the receiving role should do]
Read: [path to artifact(s)]
Expected response: [what the receiving role produces next]
```

No role-assignment prompt is included — the session is already running with the correct role.

---

**`$A_SOCIETY_CURATOR_ROLE` — Handoff Output section, item 4**

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

Replace with:

> 4. Handoff inputs for the receiving role:
>    - **Existing session (default):** use this format:
>      ```
>      Next action: [what the receiving role should do]
>      Read: [path to artifact(s)]
>      Expected response: [what the receiving role produces next]
>      ```
>    - **New session (criteria apply):** provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` — then the artifact path. Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

**`$A_SOCIETY_OWNER_ROLE` — Handoff Output section, item 4**

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

Replace with (same as Curator above, same wording):

> 4. Handoff inputs for the receiving role:
>    - **Existing session (default):** use this format:
>      ```
>      Next action: [what the receiving role should do]
>      Read: [path to artifact(s)]
>      Expected response: [what the receiving role produces next]
>      ```
>    - **New session (criteria apply):** provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` — then the artifact path. Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

**`$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — Handoff Output section, item 4**

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for A-Society. Read $A_SOCIETY_AGENTS."`

Replace with:

> 4. Handoff inputs for the receiving role:
>    - **Existing session (default):** use this format:
>      ```
>      Next action: [what the receiving role should do]
>      Read: [path to artifact(s)]
>      Expected response: [what the receiving role produces next]
>      ```
>    - **New session (criteria apply):** provide first: `"You are a [Role] agent for A-Society. Read $A_SOCIETY_AGENTS."` — then the artifact path.

---

**`$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — Handoff Output section, item 4**

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for A-Society. Read [path to agents.md]."`

Replace with:

> 4. Handoff inputs for the receiving role:
>    - **Existing session (default):** use this format:
>      ```
>      Next action: [what the receiving role should do]
>      Read: [path to artifact(s)]
>      Expected response: [what the receiving role produces next]
>      ```
>    - **New session (criteria apply):** provide first: `"You are a [Role] agent for A-Society. Read [path to agents.md]."` — then the artifact path.

---

**`$GENERAL_CURATOR_ROLE` — Handoff Output section, item 4**

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

Replace with:

> 4. Handoff inputs for the receiving role:
>    - **Existing session (default):** use this format:
>      ```
>      Next action: [what the receiving role should do]
>      Read: [path to artifact(s)]
>      Expected response: [what the receiving role produces next]
>      ```
>    - **New session (criteria apply):** provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` — then the artifact path. Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

**`$GENERAL_OWNER_ROLE` — Handoff Output section, item 4**

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

Replace with (same wording as `$GENERAL_CURATOR_ROLE` above):

> 4. Handoff inputs for the receiving role:
>    - **Existing session (default):** use this format:
>      ```
>      Next action: [what the receiving role should do]
>      Read: [path to artifact(s)]
>      Expected response: [what the receiving role produces next]
>      ```
>    - **New session (criteria apply):** provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` — then the artifact path. Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

**`$INSTRUCTION_ROLES` — Section 7 "Handoff Output"**

After the existing "Default rule: resume the existing session." paragraph, add:

> When resuming an existing session, use the following named format:
>
> ```
> Next action: [what the receiving role should do]
> Read: [path to artifact(s)]
> Expected response: [what the receiving role produces next]
> ```
>
> No role-assignment prompt is included — the session is already running under the correct role. The new-session format (session-start prompt followed by artifact path) applies only when the project's workflow criteria for a new session are met.

---

### Section 3 — Records

---

#### Item 3a — `$INSTRUCTION_RECORDS` Phase 0 alignment check [Requires Owner approval]

**Finding:** Gap confirmed. `$INSTRUCTION_RECORDS` does not account for the workflow plan as the Phase 0 gate artifact. Specific gaps:

1. "How to Create a Records Structure" Step 2 does not state that position `01-` is reserved for the workflow plan.
2. "What Goes in a Record" lists only "conversation artifacts" and "findings" — the Phase 0 gate artifact is not listed.
3. "Sequencing" describes the prefix convention but gives no guidance on which artifact type must occupy `01-`.

**Proposed changes to `$INSTRUCTION_RECORDS`:**

**(i) Update "Sequencing" section** — add after "The project's `records/main.md` defines which artifact types appear at which sequence positions":

> The first sequence position (`01-`) is reserved for the workflow plan — the Phase 0 gate artifact produced by the Owner at flow intake, before any other artifact is created. Projects using the A-Society framework should declare this position explicitly in their `records/main.md` sequence table. See `$INSTRUCTION_WORKFLOW_COMPLEXITY` for the workflow plan format and its role as the Phase 0 gate.

**(ii) Update "What Goes in a Record" section** — add a new bullet before "Conversation artifacts":

> - **Phase 0 gate artifact** — the Owner's workflow plan, produced at intake before any conversation artifacts. This is always the first artifact in the record folder.

**(iii) Update "How to Create a Records Structure" Step 2** — add after "This is a commitment — agents producing artifacts follow it without deciding each time.":

> The first position in the declared sequence must be the Owner's workflow plan (Phase 0 gate artifact). Declare it as position `01-` with the label `owner-workflow-plan`. This artifact is the prerequisite for all others in the folder.

---

#### Item 3b — Decision artifact naming rule [Requires Owner approval]

**`$A_SOCIETY_RECORDS` — Artifact Sequence section**

Add after the current "Naming convention for non-standard slots" paragraph:

> **Owner decision naming distinction:** Use `NN-owner-decision.md` when the Owner is recording a decision and the previously active role has no subsequent action in this flow. Use `NN-owner-to-[role].md` only when the named role has a next action in the flow. Mislabeling a terminal Owner decision as an active handoff creates ambiguity about whether the named role still has pending work in this flow.

---

### Section 4 — Tooling Governance

---

#### Item 4a — Multi-role backward pass rule + Component 4 mandate [Requires Owner approval]

**`$A_SOCIETY_IMPROVEMENT` — Backward Pass Traversal section**

Replace the current section in full. Current text begins "A-Society's forward pass: Owner enters first..." and ends "When unavailable, apply the rules above."

Replace with:

> ### Generalizable ordering rule
>
> For any flow with two or more participating roles:
>
> 1. **Identify first occurrences.** Take each role's *first occurrence* in the forward pass. Subsequent appearances of the same role do not add a new backward-pass node — that role's findings cover all their forward-pass phases.
> 2. **Reverse the sequence.** Reverse the first-occurrence order to get the backward order.
> 3. **Owner is always second-to-last.** The Owner is the entry point for every A-Society workflow — its first occurrence is always first in the forward pass, placing it second-to-last in the backward sequence.
> 4. **Synthesis role (Curator) is always last.** The Curator synthesizes all findings and is always the final node.
> 5. **Parallel forks produce concurrent backward-pass nodes.** Roles whose first occurrences are at the same forward-pass position produce findings concurrently, not sequentially.
>
> Only nodes that fired during this instance are included. Dead branches are excluded.
>
> ### Standard two-role case (Owner + Curator only)
>
> Forward pass: Owner first, Curator second.
> Backward pass order: Curator first, Owner second, Curator synthesizes last.
>
> ### Component 4 mandate
>
> When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available **and** the flow has more than two participating roles, invoke Component 4 to compute the traversal order — do not compute manually. Pass `$A_SOCIETY_WORKFLOW`. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance.
>
> For flows with only two roles (Owner + Curator), manual application of the standard order above is sufficient.

---

**`$A_SOCIETY_TOOLING_ADDENDUM` — Phase 7 Backward pass subsection**

The existing Phase 7 backward pass text manually computes the ordering for the tooling flow. Add after the existing "Depth: full structured findings" line:

> **Component 4 invocation:** If Component 4 (Backward Pass Orderer) is available and this flow had more than two participating roles, invoke Component 4 rather than computing the traversal order manually. Pass `$A_SOCIETY_WORKFLOW`. The orderer returns roles in backward pass order, excluding non-firing roles. The manual ordering above is provided as a reference; when Component 4 is available, it takes precedence.

---

**`$GENERAL_IMPROVEMENT` — Backward Pass Traversal section, Tooling note**

Current text:

> **Tooling:** `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` computes the traversal order programmatically from a workflow graph. Pass the path to `workflow/main.md`. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance. When available, use the orderer rather than computing the order manually. When unavailable, apply the rules above.

Replace with:

> **Tooling:** If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it rather than computing the order manually when the flow has more than two participating roles. Pass the project's workflow document path. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance. Consult the project's tooling documentation for the specific invocation path. When no such tool is available, apply the rules above manually.

---

#### Item 4b — INVOCATION.md obligation + TA `a-docs/` dependency guidance [Requires Owner approval]

**`$A_SOCIETY_TOOLING_COUPLING_MAP` — Change Taxonomy, Type B row**

Current Type B:

> **B** | A new tool is built that agents should invoke | Tooling | A `general/` instruction update (or new instruction) naming the tool and directing agents to invoke it

Replace with:

> **B** | A new tool is built that agents should invoke | Tooling | (1) `$A_SOCIETY_TOOLING_INVOCATION` updated with the new component's invocation entry; (2) a `general/` instruction updated or created naming the tool and directing agents to invoke it. Note: Component 5 (Path Validator) validates all entries in `$A_SOCIETY_TOOLING_INVOCATION` — a component not registered there will fail Path Validator checks.

---

**`$A_SOCIETY_TOOLING_ADDENDUM` — Phase 7 Registration subsection**

Add to the Registration work list, after "Add entries to `$A_SOCIETY_AGENT_DOCS_GUIDE` for any new `a-docs/` files created in this flow":

> - Update `$A_SOCIETY_TOOLING_INVOCATION` with the new component's invocation entry. This step is required for every new component — Component 5 (Path Validator) validates all entries in `$A_SOCIETY_TOOLING_INVOCATION` and will fail on components not registered there.

---

**`$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — add new section**

Add a new section after the existing "Escalate to Owner When" section and before "Handoff Output":

> ## a-docs/ Format Dependencies
>
> The coupling map change taxonomy (Types A–F) covers `general/` format dependencies. When a component design requires reading from `a-docs/` content, the taxonomy does not apply — but the co-maintenance obligation does.
>
> For each `a-docs/` format dependency in a component design:
>
> 1. **Identify the dependency explicitly.** State which `a-docs/` file the component reads, which fields or sections it parses, and what format it expects.
> 2. **Document it in the component design.** Add a co-maintenance dependency declaration: "This component reads `$[FILE]` and parses [field names]. If those fields change, this component must be updated."
> 3. **Recommend handling.** Evaluate whether the component should read the `a-docs/` file directly (appropriate when the format is stable and the parse is simple) or whether a more stable interface is available — such as a `general/` format that encodes the same information. If reading `a-docs/` directly, state in the design that the dependency is not tracked by the coupling map taxonomy and requires manual co-maintenance discipline.
> 4. **Flag to Owner.** An `a-docs/` format dependency creates a co-maintenance obligation that may not be visible to future Curators maintaining the referenced file. Flag it explicitly in the proposal so the Owner can decide whether the coupling map taxonomy should be extended to cover `a-docs/` dependencies, or whether the manual co-maintenance declaration in the design is sufficient.

---

#### Item 4c — Post-Phase-6 component additions + Developer completion artifact [Requires Owner approval]

**`$A_SOCIETY_TOOLING_ADDENDUM` — add new section**

Add a new section "4. Post-Phase-6 Component Additions" after the "3. Constraints and Dependencies" section:

> ## 4. Post-Phase-6 Component Additions
>
> The phase structure above (Phases 0–7) was designed for the initial launch of six components. When a new component is added after the original launch, the following conditions apply.
>
> **Phase 0 gate conditions for a new post-Phase-6 component:**
>
> Before any Developer session opens for the new component:
> - (a) The Tooling Developer role document is updated (or confirmed unchanged) to cover the new component's implementation scope — Owner approval required.
> - (b) `$A_SOCIETY_ARCHITECTURE` is updated if the new component changes the system overview — Owner approval required.
> - (c) `$GENERAL_MANIFEST` is updated if the new component creates or reads `a-docs/` files at scaffold time — Owner approval required.
> - (d) The naming convention parsing contract is updated if the component reads a new path pattern not covered by existing contracts — Owner approval required. If unchanged, confirm explicitly.
>
> All four conditions must be confirmed before the Developer session opens. A Developer session that opens before this gate clears has violated the Approval Invariant.
>
> **Advisory mode:**
>
> The Technical Architect reviews the new component's design and confirms its Phase 0 gate conditions before any Developer session begins. The TA operates in advisory mode during implementation, as defined in Section 1.
>
> **Phase numbering:**
>
> Post-Phase-6 components use a phase label that extends the original sequence (e.g., "Phase 1A" for a Phase 1-class component added after launch, or a descriptive label such as "Phase 8" for a new sequential phase). The Phase 0 gate for a new component is the same gate — a new numbered "Phase 0" is not created. Update the phase dependency diagram in this document when a new component adds a dependency to the diagram.

---

**`$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — Hard Rules section, Phase 0 gate rule**

Current rule:

> - **Do not open a Developer session before Phase 0 clears.** The Phase 0 gate is not optional. The following must exist before the first Developer session begins: (a) this role document is approved and indexed; (b) `$A_SOCIETY_ARCHITECTURE` is updated and approved; (c) `$GENERAL_MANIFEST` is approved; (d) the naming convention parsing contract is approved. A Developer session that opens before Phase 0 clears has violated the Approval Invariant.

Add after this rule (not replacing it):

> **Post-Phase-6 additions:** For components added after the original launch, the Phase 0 gate conditions are defined in `$A_SOCIETY_TOOLING_ADDENDUM` Section 4. The same gate applies: no Developer session opens before those conditions are met.

---

**`$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — Handoff Output section**

After the existing pause points list (ending "After integration testing passes — handoff to Owner for Phase 6 approval gate..."), add:

> **Completion report:** Upon completing a phase's implementation work, the Developer produces `NN-developer-completion.md` in the active record folder at the next available sequence position. The completion report must include: (1) what was implemented in this phase; (2) any deviations from the approved spec and their resolution status (escalated to TA / resolved / pending); (3) whether the spec requires an update as a result of accepted deviations. This creates a first-party implementation record that the Owner and Curator can cite.

---

### Priority 3 — MAINT Inline (no proposal needed) [Curator authority — implement directly]

All six tooling component entries in `$A_SOCIETY_PUBLIC_INDEX` use `.js` extensions; actual files on disk are `.ts`. The following six rows will be corrected during the Phase 4 registration pass:

| Variable | Current (incorrect) path | Corrected path |
|---|---|---|
| `$A_SOCIETY_TOOLING_SCAFFOLDING_SYSTEM` | `/a-society/tooling/src/scaffolding-system.js` | `/a-society/tooling/src/scaffolding-system.ts` |
| `$A_SOCIETY_TOOLING_CONSENT_UTILITY` | `/a-society/tooling/src/consent-utility.js` | `/a-society/tooling/src/consent-utility.ts` |
| `$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR` | `/a-society/tooling/src/workflow-graph-validator.js` | `/a-society/tooling/src/workflow-graph-validator.ts` |
| `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` | `/a-society/tooling/src/backward-pass-orderer.js` | `/a-society/tooling/src/backward-pass-orderer.ts` |
| `$A_SOCIETY_TOOLING_PATH_VALIDATOR` | `/a-society/tooling/src/path-validator.js` | `/a-society/tooling/src/path-validator.ts` |
| `$A_SOCIETY_TOOLING_VERSION_COMPARATOR` | `/a-society/tooling/src/version-comparator.js` | `/a-society/tooling/src/version-comparator.ts` |

Note: `$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR` already shows `.ts` extension in the index and requires no correction.

---

## Cross-layer consistency check

Per Curator standing checks: all Section 1–4 changes are within the current brief's scope. No cross-layer drift was found outside this scope.

**Section 1** changes touch both `a-docs/` role files and `general/` role templates — these are paired and both are in scope.

**Section 2** touches all role documents and `$INSTRUCTION_ROLES`. The format is defined once and applied consistently; no drift between `general/` and `a-docs/` variants.

**Section 3** touches `$INSTRUCTION_RECORDS` (general) and `$A_SOCIETY_RECORDS` (a-docs). Both are in scope. The general instruction will align with what the a-docs instantiation already says.

**Section 4** touches `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` in a coordinated way: the general version removes the A-Society-specific variable reference; the A-Society version gains the generalizable rule. No cross-layer drift.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
