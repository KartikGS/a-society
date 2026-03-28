**Subject:** General documentation bundle — 6 log items
**Status:** BRIEFED
**Date:** 2026-03-28

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$GENERAL_IMPROVEMENT` | insert |
| `$GENERAL_OWNER_ROLE` | insert (×5) |
| `$GENERAL_CURATOR_ROLE` | insert (×3) |
| `$INSTRUCTION_RECORDS` | insert |
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | additive |
| New `general/` artifact (item 11 — form TBD) | create |
| `$INSTRUCTION_DEVELOPMENT` | additive |

All items: `[Requires Owner approval]` — all target `general/` content.

---

### Item 1 — Backward pass sequence filing (`$GENERAL_IMPROVEMENT`) `[additive]`

**Problem:** `$GENERAL_IMPROVEMENT` Meta-Analysis Phase Step 2 gives no instruction to verify the record folder's current contents before selecting a sequence number. The implicit assumption — that backward pass findings follow immediately after forward-pass artifacts — breaks whenever a registration phase or late forward-pass step files artifacts before the backward pass begins. In a flow where `07-` and `08-` artifacts were filed during registration, a Developer who derived their sequence number from forward-pass position filed at `06-`, creating a collision.

**Change:** In Meta-Analysis Phase, Step 2, after the sentence ending "The project's `improvement/main.md` declares which path applies." insert:

> Before selecting a sequence number, read the record folder's current contents to identify the actual next available number — intermediate artifacts filed during registration or late forward-pass steps may have shifted the sequence forward from its expected position.

**Insertion boundary:** After the sentence ending "...`improvement/main.md` declares which path applies."

---

### Item 2 — Role guidance quality (`$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`)

Nine changes across two files. Each is independently insertable; no ordering dependency between them.

#### 2a — `$GENERAL_OWNER_ROLE` Brief-Writing Quality: Shared list constructs `[insert]`

**Problem:** When a brief adds an item to a numbered criteria or conditions list that appears in multiple documents (e.g., the Owner review checklist in both the project-specific owner role and the general template), scoping only one instance leaves the parallel list unsynced. The resulting correction round was avoidable.

**Change:** In Brief-Writing Quality, after the paragraph beginning "**Ordered-list insertions:**..." add:

> **Shared list constructs:** When adding an item to a criteria or conditions list that appears across multiple documents (e.g., an Owner review checklist instantiated in both a project-specific role and a general template), enumerate all documents containing that list before finalizing scope. A brief that scopes only one instance while a parallel list in another document remains unupdated produces a sync correction round that could have been avoided at intake.

**Insertion boundary:** After the paragraph beginning "**Ordered-list insertions:**" and ending "...which creates ambiguity and can require a correction round."

---

#### 2b — `$GENERAL_CURATOR_ROLE` Handoff Output: Expected response scope `[insert]`

**Problem:** `Expected response` in the Curator's handoff format has been used to name artifacts that will only exist after the receiving role passes work to another role and that other role responds. This overstates the immediate output and creates confusion about what should be produced next.

**Change:** In Handoff Output, in the block showing the existing-session format, after the line "`Expected response: [what the receiving role produces next]`" add as a note immediately below that format block:

> `Expected response` names only the immediate next artifact the receiving role will produce in response to this handoff — the artifact they create before passing work onward. Do not name artifacts produced only after an intermediate step by another role. Listing a downstream artifact as the expected response implies the receiving role should produce it directly, which is incorrect when another role must act first.

**Insertion boundary:** After the closing backtick-fence of the existing-session format block (before the start-new case section).

---

#### 2c — `$GENERAL_OWNER_ROLE` Post-Confirmation Protocol: Library registration within existing phases `[insert]`

**Problem:** When a flow has a library publication or version registration step, owners have added extra path nodes to `workflow.md` for these sub-steps — producing a `workflow.md` path that does not match the flow's actual phase structure and corrupting backward pass ordering. The registration obligations occur predictably within existing phases (publication during Implementation, acknowledgment at Forward Pass Closure) and do not need their own path nodes.

**Change:** In Post-Confirmation Protocol, after the sentence ending "...include that step in the path at intake." insert:

> When that registration step follows naturally from an existing workflow phase — for example, when a library publication occurs during Implementation and a version acknowledgment occurs at Forward Pass Closure — represent it within those phases in `workflow.md` rather than by adding new path nodes. A new path node for a sub-step within an established phase produces a `workflow.md` that does not match the flow's actual structure and corrupts backward pass ordering.

**Insertion boundary:** After the sentence beginning "When the flow has a known post-implementation publication or registration step..." and ending "...they must appear explicitly so the backward pass traversal order reflects the full flow."

---

#### 2d — `$GENERAL_OWNER_ROLE` Brief-Writing Quality: Update report draft instruction for library flows `[insert]`

**Problem:** When a flow modifies shared library content and is likely to qualify for a framework update report, briefs have not included explicit instruction to prepare the update report draft as part of the proposal submission. This has resulted in a separate submission cycle just for the report draft — avoidable if scoped in the brief from the start. When classification cannot yet be determined at brief-writing time, classification has been pre-specified anyway, creating framing the Curator must override.

**Change:** In Brief-Writing Quality, after the paragraph beginning "This prohibition applies to briefs and to the main approval rationale — those two contexts only." insert:

> **Library flows and update report drafts:** When a flow modifies content in the project's shared distributable layer and is likely to qualify for a framework update report, the brief must explicitly instruct the downstream role to include the update report draft as a named section in the proposal submission. When the impact classification cannot yet be determined at brief-writing time, instruct the downstream role to include the draft with classification fields marked `TBD`, to be resolved post-implementation by consulting the project's update report protocol. This prevents an additional submission cycle just to add the update report — the draft and the content proposal are reviewed together in Phase 2.

**Insertion boundary:** After the paragraph ending "...those two contexts only." and before the paragraph beginning "Classification guidance issued in update report phase handoffs..."

---

#### 2e — `$GENERAL_OWNER_ROLE` new section: TA Advisory Review `[additive]`

**Problem:** Projects with a Technical Architect (or equivalent advisory-producing role) have no general guidance for how the Owner reviews advisories. The pattern — checking both design correctness AND spec completeness, specifically verifying threading paths and data-extraction type coverage — has been established in A-Society but not captured in the general template.

**Change:** Add a new `## TA Advisory Review` section after Brief-Writing Quality. Content:

> ## TA Advisory Review
>
> When reviewing a Technical Architect advisory (or advisory from any equivalent role that produces implementation specifications), apply two distinct criteria: **design correctness** and **spec completeness**. Design correctness is not sufficient — the advisory must also be complete enough that the implementing role can proceed from the interface changes section alone.
>
> **Interface completeness check.** For every parameter, interface, or behavioral change described in the advisory, verify that the full implementation path is specified. If a new parameter on a public function must be threaded through to an internal call, that threading path must appear explicitly in the advisory — not only in a higher-level summary. An interface change that requires the implementing role to independently infer threading or integration is an incomplete spec.
>
> **Data-extraction type coverage check.** For every type or structure that represents data parsed from external input (model output, API responses, structured documents), verify that the type includes a mechanism to represent parse failure explicitly. A type that specifies only the happy-path fields is structurally incomplete. Also verify that every internal execution path — including no-op, fallback, and error paths — has its non-happy-path behavior explicitly specified in the advisory's per-file requirements, not left as an implied passthrough.

**Insertion boundary:** As a new section after the existing Brief-Writing Quality section ends.

---

#### 2f — `$GENERAL_OWNER_ROLE` new section: Tooling Invocation Discipline `[additive]`

**Problem:** Owners have reconstructed tooling invocations from memory or source code analysis rather than consulting the documented invocation reference. Invocation behavior — including required argument order, return format, and side effects — may differ from what source code inspection alone would suggest, producing silent failures.

**Change:** Add a new `## Tooling Invocation Discipline` section after TA Advisory Review. Content:

> ## Tooling Invocation Discipline
>
> When invoking project tooling during a flow — at intake (e.g., plan artifact validation), at forward pass closure (e.g., backward pass orderer), or at any other step — use the invocation documented in the project's tooling reference. Do not reconstruct the call from source code analysis or memory. Required argument order, return format, and entry point names are authoritative in the documented invocation; source code may differ from what published documentation describes, especially when a component has been updated since initial implementation.
>
> [CUSTOMIZE: reference the project's tooling invocation document here, e.g., `$[PROJECT]_TOOLING_INVOCATION`.]

**Insertion boundary:** As a new section after TA Advisory Review.

---

#### 2g — `$GENERAL_CURATOR_ROLE` Authority & Responsibilities: Registration scope `[insert]`

**Problem:** "Registration" has been interpreted to include authoring invocation documentation for executable project layers (e.g., a tooling or runtime invocation reference). This blurs the boundary between registration (indexing documentation) and Developer deliverables (authoring documentation for the executable layer itself).

**Change:** In Authority & Responsibilities, under the "The Curator **owns**:" bullet list, after the bullet "Proposals to `a-society/general/`..." add:

> - **Registration scope:** Registration means indexing existing documentation in the project's appropriate registries (index files). Authoring documentation for executable project layers — such as a tooling or runtime invocation reference — is outside registration scope. That documentation is a Developer deliverable for the role that produced the executable layer.

**Insertion boundary:** After the bullet beginning "Proposals to `a-society/general/`..." and before the `[CUSTOMIZE]` bullet.

---

#### 2h — `$GENERAL_CURATOR_ROLE` Implementation Practices: Technical summary discipline `[insert]`

**Problem:** When summarizing technical implementations in backward pass findings, registration confirmations, or proposals, generic substitutes have replaced specific technical terms from approved source artifacts (e.g., "error handling approach" instead of the specific error type name). This makes summaries harder to verify against source and introduces terminology drift.

**Change:** In Implementation Practices, after the existing paragraph about behavioral property consistency, add:

> **Technical summary discipline.** When summarizing or describing a technical implementation — in a findings artifact, a registration confirmation, or a proposal — use the exact type names, method signatures, function names, and methodology terms from the approved source artifact (design advisory, spec, or implemented code). Do not substitute generic language for specific technical terms. Substituting a category name for an actual type or function name makes the summary unverifiable against the source and introduces drift between the documented and implemented state.

**Insertion boundary:** After the sentence ending "...semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream."

---

### Item 3 — Records closure artifact naming: forward-pass-only distinction (`$INSTRUCTION_RECORDS`) `[insert]`

**Problem:** `$INSTRUCTION_RECORDS` has no guidance on the distinction between `NN-owner-decision.md` and `NN-owner-to-[role].md` artifact naming. Without this, a backward-pass findings artifact or synthesis action is sometimes confused as an active handoff to a named role — implying that role has pending forward-pass work when it does not.

**Change:** In the Sequencing section, after the existing "Reference stability" paragraph, add:

> **Owner decision naming distinction:** Use `NN-owner-decision.md` when the intake role is recording a terminal decision and the previously active role has no subsequent forward-pass action in this flow. Use `NN-owner-to-[role].md` only when the named role has a next action in the forward pass. This distinction applies to forward-pass actions only. Backward-pass findings or synthesis work do not transform a terminal forward-pass closure artifact into an active handoff — a role that produces backward-pass findings later in the same record is not thereby implied to have had pending forward-pass work. Mislabeling a terminal intake-role decision as an active handoff creates ambiguity about whether the named role still has pending work in this flow.

**Insertion boundary:** After the "Reference stability" paragraph ending "...refer to them by function (e.g., 'the backward-pass findings artifact after all submissions have resolved')." and before the paragraph about the first sequence position.

---

### Item 4 — Machine-readable handoff: phase-closure `artifact_path` semantics + completion examples (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`) `[additive]`

**Problem:** `$INSTRUCTION_MACHINE_READABLE_HANDOFF` has one worked example pattern (proposal/decision handoffs). It has no guidance for phase-closure handoffs where the receiving role verifies completion rather than reading a new proposal or decision artifact. The semantics of `artifact_path` in that pattern are undefined — it is unclear whether to point to the completion artifact, the implementation itself, or something else. Synthesis/flow-closure handoff conventions are also unaddressed.

**Changes:**

**a.** In the Schema section, in the `artifact_path` field definition, after the current description ending "Must be a non-empty string." add:

> For phase-closure handoffs where the receiving role verifies completion rather than reads a new proposal or decision — for example, a Curator returning to the Owner after implementation and registration are complete — `artifact_path` should point to the primary artifact the receiving role needs to confirm closure: typically the final submission artifact in the record folder (e.g., the registration confirmation or implementation summary). If no single artifact represents the completion state, point to the record folder's most recent sequenced artifact.

**b.** In the Worked Example section, after the existing examples (resume case and start-new case), add a third example:

> **Phase-closure case (receiving role verifies completion):**
>
> ---
>
> Resume the existing Owner session (Session A).
>
> Next action: Verify implementation and registration complete; proceed to forward pass closure
> Read: `[project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md`
> Expected response: Forward pass closure message with backward pass initiation
>
> ```handoff
> role: Owner
> session_action: resume
> artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
> prompt: null
> ```
>
> ---

**c.** After the new phase-closure example, add a brief note on synthesis/flow-closure:

> **Synthesis and flow-closure handoffs:** When the synthesis role completes backward pass synthesis, the flow closes unconditionally — no further handoff block is required for the current flow. If synthesis produces follow-up items that initiate a new flow, those are filed as new trigger inputs rather than continued within the current flow's handoff chain. Synthesis completion is the terminal event; there is no receiving role to hand off to within the current flow.

**Insertion boundaries:**
- (a): In the `artifact_path` field definition, after the sentence ending "Must be a non-empty string."
- (b) and (c): After the existing "Start-new case" example, before the "How Projects Adopt This" section.

---

### Item 11 — Generalizable advisory standards: new `general/` contribution `[create]`

**Problem:** Four advisory standards were established in A-Society's `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards but their `general/` contribution — applicable to any project with an advisory-document-producing role — remains open. The four standards are:

1. **§ completeness (advisory prose vs. files-changed):** Behavioral requirements stated in advisory prose but not mirrored in the files-changed or interface-changes section are not binding implementation requirements. Implementing roles read implementation specs from the per-file section, not from advisory prose.
2. **Extension-before-bypass (architecture/infrastructure):** Before proposing new infrastructure or a bypass, enumerate explicitly why the existing path cannot be extended. The rationale for extension-over-bypass belongs in the advisory.
3. **Extension-before-bypass (dependency selection):** The extension-before-bypass standard applies to library and dependency selection. Before introducing a separate library or per-case implementation for each provider/format/service, enumerate whether a common interface or existing library covers multiple cases.
4. **Typed extraction errors:** When designing a type or structure that represents data parsed from external input (model output, structured documents, API responses), include an explicit representation for malformed or unparseable input — do not rely on sentinel keys or silent null fields to signal parse failure.

**Open question for the Curator to resolve:**

The Curator must determine the appropriate form and placement:

- **Target form:** Should this be a new `general/roles/technical-architect.md` (a general TA role template) or additions to an existing `general/` document? There is currently no general TA role template. Creating one is warranted if the four standards form the core of a reusable TA role contract; adding to an existing document is warranted if the scope is narrow enough to avoid a premature new file.
- **Generalizability check on standard (4):** Standard (4) — typed extraction errors — uses "type" in a software-programming sense. Assess whether this passes the portability constraint for `general/` (applicable equally to a writing project, a research project, and a software project). If not, either exclude it from the `general/` contribution or reformulate it at an abstraction level that generalizes (e.g., "when a process step receives structured input from an external source, include an explicit state for malformed or unrecognized input — do not assume all input will be well-formed").

**Scope:** Propose only the generalizable standards. Standards that do not pass the portability check belong in A-Society's own `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` and remain there.

**Manifest check:** If this item creates a new file in `general/`, check whether `$GENERAL_MANIFEST` needs updating and include that update in scope.

---

### Item 13 — Developer completion report and integration test record format (`$INSTRUCTION_DEVELOPMENT`) `[additive]`

**Problem:** `$INSTRUCTION_DEVELOPMENT` does not address completion report quality or integration test record requirements. Existing completion reports have asked only about spec deviations — which structurally permits a stub implementation to be filed as "no deviation" when no deviation from the spec was made, without surfacing that the implementation was never completed. Integration gates have been passed on narrative self-assertion without reproducible evidence, enabling structurally overconfident self-certification. Both findings are generalizable to any project with Developer completion reports and self-certified integration gates.

**Open question for the Curator to resolve:**

The Curator must determine placement:
- **Option A:** Add two new sections to `$INSTRUCTION_DEVELOPMENT` (e.g., `## Completion Report Requirements` and `## Integration Test Record Format`).
- **Option B:** Add entries to the "What Belongs Here" table pointing to new sub-files in the development folder (e.g., `completion-report.md`, `integration-test-record.md`) and add instructions for those sub-files.

Assess which placement is more coherent given the existing structure of `$INSTRUCTION_DEVELOPMENT` and the project-agnostic nature of these requirements.

**Required content regardless of form:**

*Completion report:* The completion report must include an explicit check for incomplete or stubbed implementations — distinct from the spec deviation check. A developer filing a completion report must confirm not only that no deviations from the spec were made, but that all specified behaviors are actually implemented. The two checks are not equivalent: a stub can conform to a spec without implementing it. A suggested framing for the check: "Are there any behaviors specified in the approved design that were not implemented, stubbed, or deferred? If yes, list them."

*Integration test record format:* Integration gate validation must include reproducible evidence — command output, state file excerpts, error traces, or equivalent artifacts. Narrative assertion ("the integration test passed") without reproducible evidence is insufficient. The evidence requirement ensures that another agent or human can independently verify the result, and surfaces failures that were missed when the test environment did not exercise all paths.

---

## Update Report Instruction

This flow modifies `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` — base templates that adopting projects have instantiated — as well as multiple `general/` instruction documents. It is likely to qualify for a framework update report.

**Include a framework update report draft as a named section in your proposal submission.** At proposal time, classification cannot yet be determined. Mark all classification fields as `TBD`. Resolve classification post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. The Owner will review the draft and its `TBD` fields as part of Phase 2.

---

## Scope

**In scope:**
- All nine changes in item 2 (full set)
- Item 1, 3, 4, 13 changes as described
- Item 11: Curator's proposed form and generalizability assessment (within the bounds described)
- Update report draft (with TBD classification)
- `$GENERAL_MANIFEST` update if item 11 creates a new `general/` file

**Out of scope:**
- MAINT components of items 2 and 3 that have already been applied to A-Society's own `a-docs/` role files in prior synthesis sessions — these are done; do not re-implement
- The four Next Priorities items in other workflow types (Runtime Dev, Tooling Dev, MAINT-only items) — those are separate flows
- Any changes to `a-society/a-docs/` role files beyond what is needed for index registration

---

## Open Questions for the Curator

1. **Item 11 form:** New `general/roles/technical-architect.md` or addition to an existing document? Assess, propose, and justify. Does standard (4) pass the portability constraint?
2. **Item 13 placement:** Option A (new sections in `$INSTRUCTION_DEVELOPMENT`) or Option B (new sub-files in the development folder)? Assess and propose.
3. **Coupling map:** Before finalizing the proposal, consult `$A_SOCIETY_TOOLING_COUPLING_MAP`. If any proposed `general/` change appears in the format dependency table, flag it in the proposal.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for General documentation bundle — 6 log items."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
