# Backward Pass Findings: Owner — c7-removal-c3-extension-synthesis-hardcode

**Date:** 2026-04-02
**Task Reference:** c7-removal-c3-extension-synthesis-hardcode
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- **Brief "Files Changed" table did not enumerate consuming call sites for removed type:** `02-owner-to-developer-brief.md` (Track B). The brief directed removal of the `ACTIVE_ARTIFACT` handler and event type from `triggers.ts`, and correctly listed `triggers.ts` in the files-changed table. It did not list `orchestrator.ts`, which contained the only call site for that event. Removing an event from a union type makes all call sites in the consuming layer type-unsafe; those files are mechanically implied by the removal. The Runtime Developer caught this and correctly extended scope as an accepted deviation. Root cause: the brief-writing process does not have a systematic step for tracing consuming call sites when removing an interface member or union variant. The "removal-of-dependents scoping" item in Next Priorities (Role guidance precision bundle, item 4) partially addresses this — but that item is scoped to structured list items, not type-level consumers.

- **`general/` consuming file not enumerated in convergence decision scope:** `04-owner-convergence-decision.md`. When scoping the Curator's documentation work, the convergence decision listed the public index change (`$A_SOCIETY_PUBLIC_INDEX` removing `$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR`) but did not enumerate `$INSTRUCTION_WORKFLOW_COMPLEXITY`, which contained a prose reference to the deleted entry. Removing a public-index variable implies scanning all `general/` files that reference it by name and scoping those changes in the same brief. This scan did not occur; the Curator discovered the dangling reference during implementation and edited the `general/` file on their own authority. The change was correct, and the Owner accepted it retroactively — but the Approval Invariant requires `general/` edits to be explicitly authorized in advance. Root cause: the brief-writing and convergence decision scoping steps do not mandate a cross-file reference sweep when a public-index variable is retired.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- **Approval Invariant boundary blurred by retroactive acceptance:** The Curator's edit to `$INSTRUCTION_WORKFLOW_COMPLEXITY` was technically an Approval Invariant violation — a `general/` file was edited without prior Owner authorization. Retroactive acceptance resolves the immediate instance but does not prevent recurrence. The structural fix is upstream: the brief-scoping process should surface dependent `general/` files so the Owner can authorize them proactively rather than ratifying after the fact.

### Workflow Friction
- **Backward pass sequence collision (externally-caught):** After forward pass closure, the backward pass opened with Curator as step 1 (expected artifact: `07-curator-findings.md`). An issue during the Curator session left no `07-` artifact. The next two roles (Runtime Developer, Tooling Developer) both received Component 4-generated prompts that predicted `08-` as the next sequence number — because Component 4 does not inspect the actual record folder at prompt-generation time. Both roles wrote to `08-`, producing a collision. The session then resumed at step 4 (Owner) with the next available number being `09-`. This directly instantiates the known gap described in the "Component 4 parallel-flow correctness bundle" Next Priority: Component 4 prompts should direct agents to inspect the record folder for the next available sequence number rather than predicting filenames.

---

## Top Findings (Ranked)

1. **Backward pass sequence collision due to Component 4 filename prediction** — Record folder `20260401-c7-removal-c3-extension-synthesis-hardcode/`. Two artifacts both named `08-*` because Component 4's generated prompts embedded predicted filenames rather than instructing agents to read the record folder. A missing step-1 artifact compounded the collision. This is the concrete instantiation of the Component 4 parallel-flow correctness bundle Next Priority (prompt-generation sub-item). Generalizable: any project using a backward pass orderer that generates predicted filenames rather than dynamic folder inspection will reproduce this class of error. **Potential framework contribution.**

2. **Removal of a public-index variable requires a `general/` reference sweep** — `04-owner-convergence-decision.md`. When `$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR` was retired, no sweep was performed to find all `general/` files referencing it. The dependent `$INSTRUCTION_WORKFLOW_COMPLEXITY` was found only during Curator implementation. The fix belongs in the brief-writing quality guidance: retiring a public-index variable should trigger an explicit cross-file reference check as a scoping step, with all identified `general/` files listed in the brief for upfront authorization. Maps to Role guidance precision bundle item 4 (removal-of-dependents scoping) — but that item is currently scoped to structured list items; it should be extended to cover public-index variable retirement.

3. **Brief must enumerate type-consuming files when removing a union variant or interface member** — `02-owner-to-developer-brief.md` (Track B). Removing `ACTIVE_ARTIFACT` from the event union implied at minimum one `orchestrator.ts` cleanup. The brief did not surface this. The pattern is: any time a type, variant, or interface member is removed, the brief should enumerate all files in the affected layer that reference that type, not only the file where it is defined. This could be added as a brief-quality check to `$GENERAL_OWNER_ROLE` (and its A-Society counterpart) in the "Brief-Writing Quality" section.

4. **Interface pre-specification eliminated inter-track dependency (positive pattern):** `02-owner-to-developer-brief.md`. Specifying the new `validateWorkflowFile(filePath: string, strict?: boolean)` signature upfront in the brief allowed Track B (Runtime) to write its Component 3 invocation without waiting for Track A (Tooling) to finalize the implementation. This is the correct pattern for parallel multi-domain flows where one track's output is consumed by another: fully specify the interface contract at briefing time, not during implementation.

---

## Handoff

**Next action:** Perform backward pass synthesis (step 5 of 5)

**Read:** All prior artifacts in this record folder (`01-` through `09-`), then `### Synthesis Phase` in `a-society/a-docs/improvement/main.md`

**Expected response:** Synthesis findings artifact at the next available sequence position (`10-curator-findings.md`); implement any `a-docs/` maintenance items directly; file Next Priorities entries for items outside `a-docs/` scope, applying merge assessment against existing log entries before filing
