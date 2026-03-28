**Subject:** General documentation bundle — 6 log items
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-28

---

## Trigger

Owner-directed brief (`02-owner-to-curator-brief.md`) filed 2026-03-28, packaging six Next Priorities items derived from improvement cycles and pattern observations across A-Society flows.

---

## What and Why

Six items targeting gaps in shared `general/` content: role guidance quality (9 changes across Owner and Curator templates), backward pass sequence filing discipline, records artifact naming clarity, machine-readable handoff completeness, generalizable advisory standards (new TA role template), and Developer completion/integration-test requirements. Each change addresses a documented operational failure — ambiguous instructions, silent gaps in protocols, or patterns established in A-Society that remain uncaptured in the distributable library.

All changes target `general/` content and require Owner approval before implementation.

---

## Where Observed

A-Society — internal improvement cycles (backward pass findings from multiple flows). Each item traces to a specific operational gap identified during forward-pass execution.

---

## Target Location

| Variable | Action |
|---|---|
| `$GENERAL_IMPROVEMENT` | Insert (item 1) |
| `$GENERAL_OWNER_ROLE` | Insert ×3 + add 2 new sections (items 2a, 2c, 2d, 2e, 2f) |
| `$GENERAL_CURATOR_ROLE` | Insert ×3 (items 2b, 2g, 2h) |
| `$INSTRUCTION_RECORDS` | Insert (item 3) |
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | Additive ×3 (item 4a, 4b, 4c) |
| New `a-society/general/roles/technical-architect.md` | Create (item 11) |
| `$INSTRUCTION_DEVELOPMENT` | Additive ×2 new sections (item 13) |
| `$GENERAL_MANIFEST` | Insert new entry for `roles/technical-architect.md` (item 11) |

---

## Open Question Resolutions

### Item 11 — Form and portability

**Proposed form: New `general/roles/technical-architect.md`.**

Justification:
- No existing `general/` document is a natural home for advisory-production standards. The four standards form the behavioral core of a role contract, not a loose collection of guidelines.
- The Technical Architect (or any equivalent advisory-producing role) is a real, recurring archetype in multi-role projects. Following the same pattern as `general/roles/owner.md` and `general/roles/curator.md` makes it discoverable by project Owners evaluating whether their project warrants such a role.
- Creating a full role template is within scope: the four standards, plus role framing with `[CUSTOMIZE]` markers where project-specific content belongs, constitute a usable starting-point template without requiring content that goes beyond the brief's scope.
- Adding to an existing document has no viable target — no current `general/` file is scoped for advisory-production standards.

**Standard (4) portability assessment:**

The original formulation — "When designing a type or structure that represents data parsed from external input (model output, structured documents, API responses), include an explicit representation for malformed or unparseable input" — uses "type" in a software-programming sense. This does **not** pass the portability constraint as written.

**Proposed reformulation (passes portability test):**
> When designing any structured representation for data received from an external source — model output, API responses, structured documents, user-supplied inputs, or any equivalent — include an explicit state for malformed or unrecognized input. Do not assume all inputs will be well-formed. A representation that specifies only the success path is incomplete; the failure state must be reachable and named.

This reformulation applies equally to a software project (data parsing), a writing project (structured content templates with external input), and a research project (data extraction schemas). The core principle — explicit failure state for external input — generalizes beyond type systems to any domain that processes structured external data.

**Manifest update:** Adding `general/roles/technical-architect.md` requires a new entry in `$GENERAL_MANIFEST` with `required: false, scaffold: copy`. Included in scope below.

### Item 13 — Placement

**Proposed placement: Option A — two new sections in `$INSTRUCTION_DEVELOPMENT`.**

Justification:
- The existing instruction describes what development artifacts contain and how to create them. Adding sections for completion report requirements and integration test record format is consistent with this pattern — the instruction is already the right document for specifying standards that apply to development artifacts.
- Option B (new sub-files) would add `completion-report.md` and `integration-test-record.md` as standing artifacts in `development/`. Completion reports are per-flow artifacts (they belong in records, not in a standing development directory). Integration test records could be standing, but creating a separate sub-file instruction for each artifact type adds file proliferation for two items that fit naturally as sections in the existing instruction.
- The existing inline description pattern (e.g., `testing/` and `frontend/` described within `$INSTRUCTION_DEVELOPMENT` without separate instruction files for each) supports Option A as the more coherent choice.

### Coupling map findings

The following was checked against `$A_SOCIETY_TOOLING_COUPLING_MAP`:

- **`$GENERAL_IMPROVEMENT`** appears in the format dependency table as the source of the backward pass ordering rule (Component 4 depends on it). The proposed change to item 1 adds guidance about **sequence number selection for output filing** — it does not alter the backward pass ordering rule itself. Component 4 encodes the traversal algorithm (role ordering), not artifact sequence numbering. **No coupling impact. No coupling map update required.**

- **`$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`** appear in `$GENERAL_MANIFEST` as `copy`-type source files (all proposed changes are content additions to existing sections, not structural changes to the files). The manifest entry paths and scaffold types remain unchanged. **No Type D impact. No manifest update required for these files.**

- **New `general/roles/technical-architect.md`** (item 11): This is a new file in `general/` that Component 1 (Scaffolding System) should know about. This is a **Type D** event. The manifest needs a new entry. Included in draft content below.

- **`$INSTRUCTION_RECORDS`**, **`$INSTRUCTION_MACHINE_READABLE_HANDOFF`**, **`$INSTRUCTION_DEVELOPMENT`**: None appear in the format dependency table. No coupling impact.

---

## Draft Content

---

### Item 1 — `$GENERAL_IMPROVEMENT`: Backward pass sequence filing

**Target:** `$GENERAL_IMPROVEMENT`, Meta-Analysis Phase, Step 2.

**Insertion boundary:** After the sentence ending "The project's `improvement/main.md` declares which path applies."

**Text to insert (new paragraph immediately following that sentence):**

> Before selecting a sequence number, read the record folder's current contents to identify the actual next available number — intermediate artifacts filed during registration or late forward-pass steps may have shifted the sequence forward from its expected position.

---

### Item 2a — `$GENERAL_OWNER_ROLE`: Shared list constructs

**Target:** `$GENERAL_OWNER_ROLE`, Brief-Writing Quality section.

**Insertion boundary:** After the paragraph beginning "**Ordered-list insertions:**" and ending "...which creates ambiguity and can require a correction round."

**Text to insert (new paragraph immediately following):**

> **Shared list constructs:** When adding an item to a criteria or conditions list that appears across multiple documents (e.g., an Owner review checklist instantiated in both a project-specific role and a general template), enumerate all documents containing that list before finalizing scope. A brief that scopes only one instance while a parallel list in another document remains unupdated produces a sync correction round that could have been avoided at intake.

---

### Item 2b — `$GENERAL_CURATOR_ROLE`: Expected response scope

**Target:** `$GENERAL_CURATOR_ROLE`, Handoff Output section, existing-session format block.

**Insertion boundary:** After the closing fence of the existing-session format block (the block ending with `` ``` ``) and before the `**New session (criteria apply):**` line.

**Text to insert (note immediately below the format block fence):**

> `Expected response` names only the immediate next artifact the receiving role will produce in response to this handoff — the artifact they create before passing work onward. Do not name artifacts produced only after an intermediate step by another role. Listing a downstream artifact as the expected response implies the receiving role should produce it directly, which is incorrect when another role must act first.

---

### Item 2c — `$GENERAL_OWNER_ROLE`: Library registration within existing phases

**Target:** `$GENERAL_OWNER_ROLE`, Post-Confirmation Protocol section.

**Insertion boundary:** After the sentence beginning "When the flow has a known post-implementation publication or registration step..." and ending "...they must appear explicitly so the backward pass traversal order reflects the full flow."

**Text to insert (new paragraph immediately following):**

> When that registration step follows naturally from an existing workflow phase — for example, when a library publication occurs during Implementation and a version acknowledgment occurs at Forward Pass Closure — represent it within those phases in `workflow.md` rather than by adding new path nodes. A new path node for a sub-step within an established phase produces a `workflow.md` that does not match the flow's actual structure and corrupts backward pass ordering.

---

### Item 2d — `$GENERAL_OWNER_ROLE`: Update report draft instruction for library flows

**Target:** `$GENERAL_OWNER_ROLE`, Brief-Writing Quality section.

**Insertion boundary:** After the paragraph ending "...those two contexts only." and before the paragraph beginning "**Behavioral property consistency:**"

**Text to insert (new paragraph immediately following "...those two contexts only."):**

> **Library flows and update report drafts:** When a flow modifies content in the project's shared distributable layer and is likely to qualify for a framework update report, the brief must explicitly instruct the downstream role to include the update report draft as a named section in the proposal submission. When the impact classification cannot yet be determined at brief-writing time, instruct the downstream role to include the draft with classification fields marked `TBD`, to be resolved post-implementation by consulting the project's update report protocol. This prevents an additional submission cycle just to add the update report — the draft and the content proposal are reviewed together in Phase 2.

---

### Item 2e — `$GENERAL_OWNER_ROLE`: TA Advisory Review (new section)

**Target:** `$GENERAL_OWNER_ROLE`.

**Insertion boundary:** As a new section after the Brief-Writing Quality section ends (after "Classification guidance issued in **update report phase handoffs**...") and before the `## Handoff Output` section.

**Full section to insert:**

```
## TA Advisory Review

When reviewing a Technical Architect advisory (or advisory from any equivalent role that produces implementation specifications), apply two distinct criteria: **design correctness** and **spec completeness**. Design correctness is not sufficient — the advisory must also be complete enough that the implementing role can proceed from the interface changes section alone.

**Interface completeness check.** For every parameter, interface, or behavioral change described in the advisory, verify that the full implementation path is specified. If a new parameter on a public function must be threaded through to an internal call, that threading path must appear explicitly in the advisory — not only in a higher-level summary. An interface change that requires the implementing role to independently infer threading or integration is an incomplete spec.

**Data-extraction type coverage check.** For every type or structure that represents data parsed from external input (model output, API responses, structured documents), verify that the type includes a mechanism to represent parse failure explicitly. A type that specifies only the happy-path fields is structurally incomplete. Also verify that every internal execution path — including no-op, fallback, and error paths — has its non-happy-path behavior explicitly specified in the advisory's per-file requirements, not left as an implied passthrough.
```

---

### Item 2f — `$GENERAL_OWNER_ROLE`: Tooling Invocation Discipline (new section)

**Target:** `$GENERAL_OWNER_ROLE`.

**Insertion boundary:** As a new section after the TA Advisory Review section (item 2e) and before `## Handoff Output`.

**Full section to insert:**

```
## Tooling Invocation Discipline

When invoking project tooling during a flow — at intake (e.g., plan artifact validation), at forward pass closure (e.g., backward pass orderer), or at any other step — use the invocation documented in the project's tooling reference. Do not reconstruct the call from source code analysis or memory. Required argument order, return format, and entry point names are authoritative in the documented invocation; source code may differ from what published documentation describes, especially when a component has been updated since initial implementation.

[CUSTOMIZE: reference the project's tooling invocation document here, e.g., `$[PROJECT]_TOOLING_INVOCATION`.]
```

---

### Item 2g — `$GENERAL_CURATOR_ROLE`: Registration scope

**Target:** `$GENERAL_CURATOR_ROLE`, Authority & Responsibilities section, "The Curator **owns**:" list.

**Insertion boundary:** After the bullet "- Proposals to `a-society/general/`: submitting candidate additions for Owner review — never writing to `general/` directly" and before the `[CUSTOMIZE]` bullet.

**Text to insert (new bullet):**

> - **Registration scope:** Registration means indexing existing documentation in the project's appropriate registries (index files). Authoring documentation for executable project layers — such as a tooling or runtime invocation reference — is outside registration scope. That documentation is a Developer deliverable for the role that produced the executable layer.

---

### Item 2h — `$GENERAL_CURATOR_ROLE`: Technical summary discipline

**Target:** `$GENERAL_CURATOR_ROLE`, Implementation Practices section.

**Insertion boundary:** After the paragraph beginning "**Proposal stage — behavioral property consistency.**" and ending "...A proposal that seeds contradictory terms will have those contradictions reproduced downstream."

**Text to insert (new paragraph immediately following):**

> **Technical summary discipline.** When summarizing or describing a technical implementation — in a findings artifact, a registration confirmation, or a proposal — use the exact type names, method signatures, function names, and methodology terms from the approved source artifact (design advisory, spec, or implemented code). Do not substitute generic language for specific technical terms. Substituting a category name for an actual type or function name makes the summary unverifiable against the source and introduces drift between the documented and implemented state.

---

### Item 3 — `$INSTRUCTION_RECORDS`: Owner decision naming distinction

**Target:** `$INSTRUCTION_RECORDS`, Sequencing section.

**Insertion boundary:** After the "**Reference stability:**" paragraph ending "...refer to them by function (e.g., 'the backward-pass findings artifact after all submissions have resolved')." and before the paragraph beginning "**Parallel track sub-labeling:**"

**Text to insert (new paragraph immediately following Reference stability):**

> **Owner decision naming distinction:** Use `NN-owner-decision.md` when the intake role is recording a terminal decision and the previously active role has no subsequent forward-pass action in this flow. Use `NN-owner-to-[role].md` only when the named role has a next action in the forward pass. This distinction applies to forward-pass actions only. Backward-pass findings or synthesis work do not transform a terminal forward-pass closure artifact into an active handoff — a role that produces backward-pass findings later in the same record is not thereby implied to have had pending forward-pass work. Mislabeling a terminal intake-role decision as an active handoff creates ambiguity about whether the named role still has pending work in this flow.

---

### Item 4 — `$INSTRUCTION_MACHINE_READABLE_HANDOFF`: Phase-closure semantics and examples

**Three additive changes:**

#### 4a — `artifact_path` field definition extension

**Target:** `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, Schema section, `artifact_path` field definition.

**Insertion boundary:** After the sentence "Must be a non-empty string." (end of the `artifact_path` field description).

**Text to insert (new paragraph immediately following "Must be a non-empty string."):**

> For phase-closure handoffs where the receiving role verifies completion rather than reads a new proposal or decision — for example, a Curator returning to the Owner after implementation and registration are complete — `artifact_path` should point to the primary artifact the receiving role needs to confirm closure: typically the final submission artifact in the record folder (e.g., the registration confirmation or implementation summary). If no single artifact represents the completion state, point to the record folder's most recent sequenced artifact.

#### 4b — Phase-closure worked example

**Target:** `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, Worked Example section.

**Insertion boundary:** After the existing "Start-new case" example block, before the "## How Projects Adopt This" section.

**Text to insert:**

```
**Phase-closure case (receiving role verifies completion):**

---

Resume the existing Owner session (Session A).

Next action: Verify implementation and registration complete; proceed to forward pass closure
Read: `[project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md`
Expected response: Forward pass closure message with backward pass initiation

```handoff
role: Owner
session_action: resume
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
prompt: null
```

---
```

#### 4c — Synthesis and flow-closure note

**Target:** `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

**Insertion boundary:** Immediately after the phase-closure example block (item 4b), before "## How Projects Adopt This".

**Text to insert:**

> **Synthesis and flow-closure handoffs:** When the synthesis role completes backward pass synthesis, the flow closes unconditionally — no further handoff block is required for the current flow. If synthesis produces follow-up items that initiate a new flow, those are filed as new trigger inputs rather than continued within the current flow's handoff chain. Synthesis completion is the terminal event; there is no receiving role to hand off to within the current flow.

---

### Item 11 — New `general/roles/technical-architect.md`

**Full file to create at `a-society/general/roles/technical-architect.md`:**

```markdown
# Role: Technical Architect Agent (Advisory-Producing Role)

> **Template usage:** This is a ready-made template for any advisory-producing role in a project — a role whose primary output is implementation specifications and design advisories consumed by implementing roles. The most common instantiation is a Technical Architect, but the pattern applies to any role that scopes and specifies work rather than implementing it. Customize the sections marked `[CUSTOMIZE]`. Sections without that marker are designed to work as-is for most projects.

---

## Primary Focus

Scope, evaluate, and specify work for implementing roles — producing advisories complete enough that an implementing role can proceed from the specification alone without requiring design clarification.

[CUSTOMIZE: describe what the advisory-producing role evaluates and specifies in this project — e.g., "automation boundary evaluation and component design for the programmatic tooling layer."]

---

## Authority & Responsibilities

This role **owns**:
- Producing advisories (design documents, implementation specifications) for work assigned by the Owner
- Evaluating whether proposed approaches are the right ones — surfacing alternatives before implementation begins
- Scoping what belongs in automated/deterministic execution versus what requires agent judgment

This role **does NOT**:
- Implement the work it scopes — implementation belongs to the designated implementing role
- Approve its own advisories — the Owner reviews and approves before implementation begins
- [CUSTOMIZE: list any project-specific exclusions]

---

## Advisory Standards

These standards govern every advisory this role produces.

### § Completeness (advisory prose vs. specification sections)

Behavioral requirements stated in advisory prose but not mirrored in the per-file or interface-changes section of the advisory are not binding implementation requirements. Implementing roles read implementation specs from the per-file specification section — not from advisory prose. Any requirement that must be implemented must appear in the specification section, not only in the rationale or summary.

### Extension Before Bypass (architecture and infrastructure)

Before proposing new infrastructure or a bypass of an existing architectural path, enumerate explicitly why the existing path cannot be extended to handle the new requirement. The rationale for extension-over-bypass belongs in the advisory. A proposal to introduce new infrastructure without this enumeration transfers an unresolved design decision to the implementing role.

### Extension Before Bypass (dependency selection)

The extension-before-bypass standard applies to library and dependency selection. Before introducing a separate library or per-case implementation for each provider, format, or service type, enumerate whether a common interface or existing library covers multiple cases. New dependencies require justification that the existing dependency surface cannot be extended.

### Explicit Failure States for External Input

When designing any structured representation for data received from an external source — model output, API responses, structured documents, user-supplied inputs, or any equivalent — include an explicit state for malformed or unrecognized input. Do not assume all inputs will be well-formed. A representation that specifies only the success path is incomplete; the failure state must be reachable and named.

---

## Context Loading

[CUSTOMIZE: list the documents this role reads at session start — typically the project's agents.md, vision, structure, index, and the relevant workflow document.]

---

## Escalate to Owner When

- A proposed design requires a direction decision (scope expansion, new architectural commitment, technology choice with long-term implications)
- Two technically valid approaches lead to meaningfully different trade-offs that the Owner should weigh
- The scope of an advisory cannot be determined from the existing project structure
- [CUSTOMIZE: any other escalation triggers specific to this project]
```

---

### Item 11 — `$GENERAL_MANIFEST` update

**Target:** `$GENERAL_MANIFEST`, `roles/` section.

**Insertion boundary:** After the `roles/curator.md` entry and before the `# ── Workflow ──` section header.

**Entry to insert:**

```yaml
  - path: roles/technical-architect.md
    description: "Technical Architect (advisory-producing) role — advisory standards, extension-before-bypass discipline, explicit failure states for external input; ready-made template for any role that scopes and specifies work for implementing roles"
    required: false
    scaffold: copy
    source_path: general/roles/technical-architect.md
```

---

### Item 13 — `$INSTRUCTION_DEVELOPMENT`: Completion report requirements and integration test record format

**Proposed placement: Option A — two new sections added to `$INSTRUCTION_DEVELOPMENT`.**

**Target:** `$INSTRUCTION_DEVELOPMENT`.

**Insertion boundary:** After the "## What Does Not Belong Here" section (the final section in the current document).

**Text to append (two new sections):**

```markdown
---

## Completion Report Requirements

A completion report is a per-flow artifact filed by a Developer at the end of implementation. It must include two distinct checks — both are required; neither substitutes for the other:

1. **Deviation check:** Were any aspects of the approved design spec not followed? If yes, name them and provide the implementation rationale.

2. **Completeness check:** Are all behaviors specified in the approved design actually implemented — not stubbed, not deferred, not omitted? If any specified behavior was not implemented, name it explicitly. A suggested framing: "Are there any behaviors specified in the approved design that were not implemented, stubbed, or deferred? If yes, list them."

These two checks are not equivalent. A stub can conform to a spec (no deviation) without implementing any of its specified behavior. A completion report that addresses only deviations structurally permits stub implementations to be filed as "complete." Both checks are required.

---

## Integration Test Record Format

Integration gate validation must include reproducible evidence. Reproducible evidence is: command output, state file excerpts, error traces, log samples, or equivalent artifacts that another agent or human could independently use to verify the result.

Narrative assertion alone — for example, "the integration test passed" without supporting output — is insufficient regardless of how confident the filing agent is. The evidence requirement is not about distrust; it is about structural verifiability. Evidence surfaces failures that were missed when the test environment did not exercise all paths.

What to include per integration gate validation:
- The command or procedure used
- The actual output (not a summary of it)
- Any failure paths that were exercised and their outcomes
- Any paths that could not be tested and why
```

---

## Update Report Draft

*Classification fields marked TBD — to be resolved post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.*

---

# A-Society Framework Update — TBD

**Framework Version:** TBD
**Previous Version:** TBD

## Summary

This update adds guidance across multiple `general/` artifacts — role templates, improvement protocol, records instruction, machine-readable handoff instruction, and development instruction — addressing operational gaps identified during A-Society execution. Changes correct silent ambiguities in backward pass filing, handoff artifact naming, and role responsibility boundaries, and add new advisory standards and completion quality requirements. Projects that have instantiated `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, or any of the affected instructions should review the changes below.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | TBD | TBD |
| Recommended | TBD | TBD |
| Optional | TBD | TBD |

---

## Changes

### Item 1 — Backward pass sequence number selection

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_IMPROVEMENT`]
**What changed:** Meta-Analysis Phase Step 2 now instructs roles to read the record folder's current contents before selecting a sequence number, to account for intermediate artifacts filed during registration or late forward-pass steps.
**Why:** Without this check, roles derived their sequence number from expected position in the forward pass and filed at colliding positions when registration artifacts had already occupied those slots.
**Migration guidance:** Review your project's `improvement/main.md`. If it copies the backward pass protocol from `$GENERAL_IMPROVEMENT`, add the sequence-number check instruction to Step 2 of the Meta-Analysis Phase.

---

### Item 2a — Owner brief-writing: shared list constructs

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** Brief-Writing Quality now includes a "Shared list constructs" paragraph directing Owners to enumerate all documents containing a parallel list before finalizing brief scope.
**Why:** Briefs scoping only one instance of a parallel list (e.g., an Owner review checklist in both a project-specific role and a general template) left the other instance unupdated, requiring a correction round.
**Migration guidance:** Review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the Shared list constructs paragraph to the Brief-Writing Quality section after the Ordered-list insertions paragraph.

---

### Item 2b — Curator handoff: expected response scope

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_CURATOR_ROLE`]
**What changed:** Handoff Output now includes a note below the existing-session format block clarifying that `Expected response` names only the immediate next artifact — not artifacts produced after an intermediate step by another role.
**Why:** The field was used to name artifacts that only exist after another role acts first, creating incorrect expectations about what the receiving role should produce directly.
**Migration guidance:** Review your project's `roles/curator.md`. If it was copied from `$GENERAL_CURATOR_ROLE`, add the Expected response scope note below the existing-session format block in the Handoff Output section.

---

### Item 2c — Owner post-confirmation: library registration within existing phases

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** Post-Confirmation Protocol now states that registration steps following from an existing workflow phase should be represented within those phases in `workflow.md` — not as new path nodes.
**Why:** Adding path nodes for predictable sub-steps within existing phases produced `workflow.md` paths that did not match the flow's actual structure and corrupted backward pass ordering.
**Migration guidance:** Review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the library-registration-within-existing-phases paragraph to the Post-Confirmation Protocol section. Also audit any existing `workflow.md` files for extra path nodes added for registration sub-steps within established phases.

---

### Item 2d — Owner brief-writing: update report draft instruction for library flows

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** Brief-Writing Quality now includes a "Library flows and update report drafts" paragraph directing Owners to explicitly instruct the downstream role to include the update report draft in the proposal when a flow modifies the distributable layer.
**Why:** Without explicit brief instruction, update report drafts required a separate submission cycle after the content proposal was already approved.
**Migration guidance:** Review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the Library flows paragraph to the Brief-Writing Quality section after the pre-classification prohibition paragraph.

---

### Item 2e — Owner: TA Advisory Review section

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** New `## TA Advisory Review` section added to the Owner role, covering design correctness vs. spec completeness, interface completeness check, and data-extraction type coverage check.
**Why:** No general guidance existed for how Owners review advisories from advisory-producing roles (Technical Architects or equivalents).
**Migration guidance:** Review your project's `roles/owner.md`. If your project has a Technical Architect or equivalent advisory-producing role, and your `roles/owner.md` was copied from `$GENERAL_OWNER_ROLE`, add the TA Advisory Review section.

---

### Item 2f — Owner: Tooling Invocation Discipline section

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** New `## Tooling Invocation Discipline` section added to the Owner role, directing Owners to use documented invocations rather than reconstructing calls from source code.
**Why:** Owners reconstructed invocations from source code analysis, which may diverge from the published invocation reference, producing silent failures.
**Migration guidance:** Review your project's `roles/owner.md`. If your project uses programmatic tooling components, add the Tooling Invocation Discipline section and customize the `[CUSTOMIZE]` reference to point to your project's tooling invocation document.

---

### Item 2g — Curator authority: registration scope clarification

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_CURATOR_ROLE`]
**What changed:** Authority & Responsibilities now includes a "Registration scope" bullet clarifying that registration means indexing existing documentation — and that authoring documentation for executable project layers is outside registration scope.
**Why:** "Registration" was interpreted to include authoring invocation documentation for tooling/runtime layers, blurring the boundary between the Curator's indexing role and Developer deliverables.
**Migration guidance:** Review your project's `roles/curator.md`. If it was copied from `$GENERAL_CURATOR_ROLE`, add the Registration scope bullet to the "The Curator owns:" list in Authority & Responsibilities.

---

### Item 2h — Curator: technical summary discipline

**Impact:** TBD
**Affected artifacts:** [`$GENERAL_CURATOR_ROLE`]
**What changed:** Implementation Practices now includes a "Technical summary discipline" paragraph directing Curators to use exact type names, method signatures, and terminology from approved source artifacts when summarizing implementations.
**Why:** Generic substitutes for specific technical terms (e.g., "error handling approach" instead of the actual type name) made summaries unverifiable against source and introduced terminology drift.
**Migration guidance:** Review your project's `roles/curator.md`. If it was copied from `$GENERAL_CURATOR_ROLE`, add the Technical summary discipline paragraph to the Implementation Practices section.

---

### Item 3 — Records: Owner decision naming distinction

**Impact:** TBD
**Affected artifacts:** [`$INSTRUCTION_RECORDS`]
**What changed:** Sequencing section now includes an "Owner decision naming distinction" paragraph defining when to use `NN-owner-decision.md` vs. `NN-owner-to-[role].md`.
**Why:** Backward-pass findings artifacts were sometimes confused as active forward-pass handoffs, implying named roles had pending forward-pass work when they did not.
**Migration guidance:** Review your project's `records/main.md`. If it defines its artifact sequence convention, verify that the naming rules align with this distinction. No existing artifact renames are required — this is prospective guidance.

---

### Item 4 — Machine-readable handoff: phase-closure semantics and synthesis note

**Impact:** TBD
**Affected artifacts:** [`$INSTRUCTION_MACHINE_READABLE_HANDOFF`]
**What changed:** Three additions: (a) `artifact_path` field definition extended with phase-closure semantics; (b) new "Phase-closure case" worked example; (c) note on synthesis/flow-closure handoffs.
**Why:** Phase-closure handoffs (where the receiving role verifies completion) had undefined `artifact_path` semantics. Synthesis termination convention was undocumented.
**Migration guidance:** Review your project's `communication/coordination/` documentation. If it references `$INSTRUCTION_MACHINE_READABLE_HANDOFF` or includes its own handoff block guidance, update to reflect: (a) `artifact_path` points to the final submission artifact for phase-closure handoffs; (b) synthesis completion terminates the flow with no further handoff block required.

---

### Item 11 — New `general/roles/technical-architect.md`

**Impact:** TBD
**Affected artifacts:** [`a-society/general/roles/technical-architect.md` — new file; `$GENERAL_MANIFEST` — new entry]
**What changed:** New ready-made template for any advisory-producing role (Technical Architect or equivalent), containing four advisory standards: § completeness, extension-before-bypass (architecture), extension-before-bypass (dependency selection), and explicit failure states for external input.
**Why:** The advisory standards were established in A-Society's project-specific `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` but had no `general/` home. Projects with an advisory-producing role had no template to start from.
**Migration guidance:** If your project has a Technical Architect or equivalent advisory-producing role, consider adopting this template as the basis for your `roles/technical-architect.md`. If a role file already exists, review the four advisory standards and incorporate any that are missing.

---

### Item 13 — Developer completion report and integration test requirements

**Impact:** TBD
**Affected artifacts:** [`$INSTRUCTION_DEVELOPMENT`]
**What changed:** Two new sections added: "Completion Report Requirements" (stub/completeness check requirement, separate from deviation check) and "Integration Test Record Format" (reproducible evidence requirement).
**Why:** Existing completion reports permitted stub implementations to be filed as "no deviation." Integration gates were passed on narrative assertion without reproducible evidence.
**Migration guidance:** Review your project's `development/` folder and any Developer role that files completion reports. Update your development standards to require both checks. Update integration gate procedures to require reproducible evidence artifacts alongside any narrative assertion.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
