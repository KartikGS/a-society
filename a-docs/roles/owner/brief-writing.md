# Owner Brief Writing

## Brief-Writing Quality

When a change is fully derivable from existing instructions — no ambiguity about scope, target, or implementation approach — write a fully-specified brief:

- Cover all three dimensions explicitly: scope, target file(s), and implementation approach
- State **"None"** explicitly in the Open Questions section
- This signals to the Curator that the proposal round is mechanical: no judgment calls, straight to draft content

A fully-specified brief eliminates revision cycles for straightforward changes. Reserve open questions for changes that genuinely require Curator judgment.

**Multi-file scopes:** When a brief spans multiple files, provide a "Files Changed" summary table naming the specific target files and the expected action (additive, replace, insert) to streamline the downstream role's implementation plan.

**Principle/application consistency scan.** When a brief both defines or revises a standing rule and applies that rule to concrete target files in the same flow, compare the abstract rule text against the file-specific instructions before handoff. The receiving role must be able to satisfy the principle statement and the concrete file edits without contradiction. If one target is meant to remain as an approved residual exception, name that exception explicitly in the brief rather than leaving the contradiction implicit.

**New standing artifacts require a downstream propagation sweep.** When a brief creates a new always-relevant or standing artifact, scope the dependent maintenance surfaces explicitly before handoff. Check the relevant startup-context surface (`$A_SOCIETY_REQUIRED_READINGS` when applicable), index registration (`$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX`, as applicable), rationale coverage in `$A_SOCIETY_AGENT_DOCS_GUIDE`, and scaffold semantics in `$GENERAL_MANIFEST` when the artifact affects initialized project shape. Do not scope only the new file itself and leave the propagation surfaces for the Curator to discover during proposal.

**Extraction scopes must include stale-description sweeps.** When a brief extracts, relocates, or externalizes existing guidance into a new or repurposed document, check whether any existing descriptive surfaces become inaccurate as a result — for example guide entries, index descriptions, role summaries, or other rationale text that describes where the moved guidance lives. Scope those accuracy edits explicitly in the brief; do not treat the propagation sweep as additive-only just because a new file is also being created.

**Removed type surfaces require consumer enumeration.** When a brief removes or renames a union variant, enum value, interface member, event type, or other consumed program element, enumerate not only the definition site but also the consuming call sites that must change to keep the layer valid. A type-surface removal mechanically implies downstream edits; list those consuming files in the Files Changed table rather than leaving the receiving role to discover them during implementation.

**Prose insertions:** When a brief directs a downstream role to insert text into existing prose, provide the exact immediately adjacent target clause or phrase at the insertion boundary. Acceptable forms: "after the clause ending '...X'," "before the sentence beginning 'Y'," or "replace the phrase 'Z' with." If the insertion is bounded from both sides, name the immediately adjacent clause on each side — not a nearby landmark elsewhere in the section. A brief that names only the section leaves the receiving role to infer the exact insertion point, which creates ambiguity and can require a correction round.

**Structured-entry replacement boundary.** When directing a change within a structured documentation entry — such as a table row, index entry, log item, or role-table record — state whether the replacement applies to the full entry or only a named sub-element within it (for example, "update only the Description cell" vs. "replace the full row"). A brief that specifies only the target entry without bounding the replacement scope leaves the receiving role to infer which parts are in scope, which can result in either over-replacement (unintended changes to adjacent fields) or under-replacement (incomplete updates).

**Instruction-text variable references:** When a brief proposes text that itself contains `$VAR` references, use only variable names that actually exist in the relevant index. If no project-agnostic variable name exists for the concept being described, use a functional description instead — for example, "the variable registered in the project's index for the agents entry point" — rather than inventing a fictional placeholder.

**Authority designation:** The `[Curator authority — implement directly]` label can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief. Absent explicit designation, the receiving role operates within its default scope. The brief is the correct home for explicit authority designation.

**Mixed-scope Curator briefs need an execution-timing rule.** When a brief to the Curator combines approval-scoped work with direct-authority `[MAINT]` or `[Curator authority — implement directly]` items, state whether the direct-authority items should be implemented immediately on receipt or batched into the post-approval implementation pass. Authority answers who may do the work; the brief must also answer when that work should occur.

**Topology-based obligation:** When a flow has no Proposal phase (per the workflow plan), the brief must explicitly state that no proposal artifact is required before implementation begins.

**Output-format changes are not mechanical.** Any change that introduces a new required field, a new template section, or a new required structural element in the output carries design decisions about what the output should look like — those decisions belong in the brief, not left to the Curator. A brief that introduces an output-format change must explicitly specify the expected output form. "Open Questions: None" is only correct when the output form is also fully derivable from the brief.

When proposing an output-format change, also assess whether the change makes any existing field, section, or type value obsolete — and scope that removal explicitly in the brief. A brief that adds a new section without checking what the addition makes vestigial transfers that obsolescence assessment to the Curator unnecessarily.

**Removal-of-dependents scoping.** When a brief scopes removal of an item from a numbered or structured list, explicitly enumerate any other content in that file — or in sibling files receiving the same removal — that depends on the removed item and would become vestigial after its removal. This includes format blocks gated on the removed item, cross-references to it, and any prose whose meaning changes when the item no longer exists. Apply this consistently across all target files in the brief; do not scope explicit dependent removal for only the first instance noticed and leave the same pattern implicit in the remaining files.

**Reference-removal scopes must verify all occurrences.** When a brief scopes removal of a named variable, pointer, cross-reference, or other specific reference from a target file, sweep the full file for every occurrence before finalizing the brief. If multiple occurrences exist, either enumerate each one or state explicitly that all occurrences are in scope. Do not anchor the brief only to the first occurrence that surfaced during analysis.

**Project-specific convention changes require mirror assessment.** When a brief modifies a project-specific convention that instantiates a reusable general instruction, explicitly assess the general counterpart in the brief. Either scope the general instruction as a co-change or declare it out of scope with rationale. Do not leave the mirror decision implicit; otherwise the Curator must guess whether parity maintenance is in scope.

**Runtime-injected file references must name the project layer.** When a brief or review specifies a file the runtime will inject into project sessions, reference the project's own `a-docs/` artifact or explicitly require derivation from project context (for example `flowRun.projectRoot`). Do not use `$GENERAL_*` template variables as runtime injection targets; those name framework templates, not project session inputs.

**Schema migrations require a vocabulary sweep.** When a brief changes a schema, field name, or structural vocabulary, explicitly scope a surrounding prose sweep for deprecated terms as part of the same work. Updating the schema block alone is incomplete if adjacent explanations still use the old terminology.

**Schema-code coupling check.** When a documentation change defines or modifies a schema with a programmatic consumer (a type definition, parser, or validator in the codebase), the brief must scope both the documentation change and the corresponding code change in the same flow. At brief-writing time, ask: "Does this documentation change define or modify a schema that is consumed programmatically?" If yes, identify the programmatic consumer and include it in the flow scope. A brief scoped documentation-only when code must also change fragments the work and requires external correction.

**Executable-layer verification scope must name the boundary.** When a brief asks the Framework Services Developer or Orchestration Developer to verify a change under the executable layer, specify the intended verification boundary explicitly: file-local, module/package-wide, or repository-wide. Do not say "confirm the module compiles" when the scoped work only names one file unless the brief also makes the module-wide verification obligation explicit. If sibling consumers, runtime operator surfaces, or compile surfaces must be checked to call the work complete, name them in the brief rather than leaving the receiving role to discover the breadth during implementation.

**Verification obligations must specify output content, not just successful execution.** When a verification obligation requires confirming a documentation change or an output-format requirement, name the specific content: what must be absent, what must be present, or which fields the output must include. "Runs without error" or "confirm the section is removed" is not a sufficient verification standard — a command that runs successfully can still produce under-specified output, and a document can retain prohibited content while technically compiling or rendering. A Developer who passes all listed verification obligations without content-precision standards has not deviated from the spec; the spec has incomplete verification scope.

**Multi-mode scope declaration.** When a brief targets a component that has distinct execution paths (for example, interactive and autonomous modes, synchronous and asynchronous paths, TTY and non-TTY paths), explicitly declare which modes are in scope — or state that all modes are in scope. Do not rely on interactive framing to convey full scope implicitly. A brief framed around the interactive path that does not declare "applies to both paths" will be correctly read as interactive-only by the receiving role. Catching the omission requires a full re-draft; one sentence of scope declaration eliminates the correction round.

**Do not pre-specify update report classification.** If the change described in a brief may trigger a framework update report, do not state an expected impact classification. Classification is determined by the Curator post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. Stating a classification in the brief creates framing the Curator must override — which adds a correction round rather than eliminating one.

**`[LIB]` brief trigger for update report drafts.** When a `[LIB]` flow is likely to qualify for a framework update report, the brief must explicitly instruct the Curator to include the update report draft as a named section in the proposal submission. When classification cannot yet be determined, instruct the Curator to include the draft with classification fields marked `TBD`, to be resolved at Phase 4 by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. This requirement comes from Phase 1 of `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`; surface it in the brief rather than relying on the Curator to infer it from the workflow document mid-flow.

**Update report drafts for newly created files must use proposed `$VAR` names.** When a brief asks the Curator to draft an update report for files being created or indexed in the same flow, name those files in the draft using their proposed variable names rather than raw paths. Proposed `$VAR` names are acceptable in draft content before registration when the same brief also scopes the index additions that will define them.

The same applies to approval rationale for main decisions: do not comment on expected classification when approving a content change. The Follow-Up Actions section directing the Curator to check `$A_SOCIETY_UPDATES_PROTOCOL` is the correct mechanism — no anticipation needed.

This prohibition applies to briefs and to the main approval rationale — those two contexts only.

**Behavioral property consistency:** When specifying behavioral properties (ordering, mutability, timing constraints), verify that they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream.

Classification guidance issued in **update report phase handoffs** is permitted and is a positive practice: when directing the Curator to consult `$A_SOCIETY_UPDATES_PROTOCOL` after implementation, noting a likely classification as orienting guidance does not create framing that must be overridden, because classification is now actually determinable.

**Executable dev flows: cross-check registration obligations when authorizing Curator scope.** When writing a Curator authorization for an executable development flow, do not derive scope solely from the TA advisory's files-changed section. The executable workflow carries standing Curator obligations — including update report assessment (`$A_SOCIETY_UPDATES_PROTOCOL`), index registration, executable-doc maintenance, and verification of `$A_SOCIETY_RUNTIME_INVOCATION` when it changes in-flow — that apply regardless of what the TA brief scoped. Cross-check those obligations explicitly against the authorization list before finalizing the brief.

**TA design briefs require a constraint/preference partition.** When a brief asks a Technical Architect to produce a design, constraints in the brief must be genuinely non-negotiable — derived from framework invariants, explicit user direction, or immovable prior decisions. A design preference or working hypothesis is not a constraint; presenting it as one closes off design space the TA is specifically engaged to evaluate. If the Owner has a hypothesis about the right direction, name it as a preference with rationale and require the TA to address it — do not convert it into a prohibitive constraint. The test: "Would I reject a TA advisory that explored this option?" If the answer is "I don't know," it is not a constraint.

---

## Constraint-Writing Quality

When a decision artifact or review constraint directs downstream implementation checks, write the constraint with the same precision required of briefs. Constraint language should be mechanically followable by the receiving role without needing pattern inference.

**Registration scope must be file-based.** When directing index registration or verification, scope the instruction by the newly created or modified files, not by their parent directory, unless the directory boundary is itself the point of the constraint. "Verify whether `$A_SOCIETY_INDEX` needs updating for any newly created or modified files" is mechanically actionable; a location-based qualifier can accidentally exclude the relevant file.

**Public-index variable retirement requires a reference sweep.** When a brief, convergence decision, or other Owner authorization retires a public-index variable or deletes a publicly registered artifact, sweep `a-society/` for references to that `$VARIABLE_NAME` before finalizing scope. Explicitly name every dependent file that must change, including any `general/` artifacts, so required `[LIB]` authorization is granted up front rather than retroactively.
