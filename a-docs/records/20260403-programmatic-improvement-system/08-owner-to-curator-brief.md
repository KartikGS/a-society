**From:** Owner
**To:** Curator
**Artifact:** Owner — Integration Gate & Curator Brief
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-04

---

## Integration Gate

Both implementation tracks are accepted.

**Tooling Developer track:** All Component 4 requirements met. New API (`computeBackwardPassPlan`, `buildBackwardPassPlan`, `locateFindingsFiles`, `locateAllFindingsFiles`) implemented correctly. Role-appearance check verified against §2.5 worked trace. Seven test cases pass.

**Runtime Developer track:** `HandoffResult` dispatch, `ImprovementOrchestrator` lifecycle, and `stateVersion` migration all implemented correctly per spec. Three issues in `improvement.ts` were found during Owner integration review and applied directly (two from TA integration review, one additional unused variable the TA missed): `synthesisSessionId` removed, `sessionId` removed, `crypto` import removed, and the substring `includes` warning check replaced with per-role `locateFindingsFiles` calls. The file is now clean.

---

## Curator Scope

This brief has two parts with different execution timing.

**Part A — Direct-authority items:** Implement immediately on receipt. No proposal required.

**Part B — LIB proposal items:** Propose first (include update report draft in the proposal). Implement after Owner approval. Files in `general/` may not be written before approval.

---

## Part A — Direct-Authority Items

### A1. Minimal Backward Pass Initiation Removal

Remove only explicit instructions that tell agents to initiate the backward pass after forward pass closure. Do not remove backward pass *descriptions*, ordering information, or synthesis rules — only initiation instructions. Apply the following changes:

**`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`**
- Phase 0 (Forward Pass Closure) output line: replace "Closure message; Component 4 invoked; backward pass traversal order confirmed." with "Closure message; forward pass confirmed complete."
- Immediately after that phase block, remove the standalone line: "Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes."
- In the session model table: remove the clause "Backward pass per `$A_SOCIETY_IMPROVEMENT`." from both the Session A row and the Session B row.
- In the Tier 1 description: remove the phrase "and proceeds to backward pass" from the sentence "the Owner implements directly within Session A and proceeds to backward pass."

**`$A_SOCIETY_WORKFLOW_TOOLING_DEV`**
- Phase 8 (Forward Pass Closure) Work description: remove the sentence "Acknowledge closure and initiate the backward pass by invoking Component 4 (Backward Pass Orderer) using this flow's `workflow.md`." and the sentence "Component 4 invocation is the first backward pass action — no findings artifact may be produced before the traversal order has been determined."
- Phase 8 output line: replace "Closure message; backward pass initiated." with "Closure message."
- In Section 3 (Backward Pass): remove the Component 4 invocation bullet: "**Component 4 invocation:** If Component 4 (Backward Pass Orderer) is available and this flow had more than two participating roles, invoke Component 4 rather than computing the traversal order manually. Pass `$A_SOCIETY_WORKFLOW_TOOLING_DEV` via the record folder's `workflow.md`. The manual ordering above is provided as a reference; when Component 4 is available, it takes precedence."
- In Section 3: remove the line "Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes."

**`$A_SOCIETY_WORKFLOW_RUNTIME_DEV`**
- Forward Pass Closure phase: replace "**Owner:** Acknowledges forward-pass completion and initiates backward pass." with "**Owner:** Acknowledges forward-pass completion."
- In Section 3 (Backward Pass): remove the line "Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes."
- In Section 3: remove the Traversal Order paragraph: "**Traversal order:** Because implementation phase nodes in the YAML graph are a placeholder, the full backward pass traversal order cannot be computed until Phase 0 produces the architecture design and the graph is completed. At that point, Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) should be used."

**`$A_SOCIETY_OWNER_ROLE`**
- Forward Pass Closure Discipline section: remove the entire "**Backward-pass initiation must use the actual traversal output.**" paragraph (from "**Backward-pass initiation must use the actual traversal output.**" through "...transcribe the full result faithfully, including concurrent groups and the terminal synthesis step.").

### A2. Update `$A_SOCIETY_IMPROVEMENT` — Remove Stale Component 4 Invocation

The Component 4 API changed: `orderWithPromptsFromFile` no longer exists. Remove the stale invocation reference from the Backward Pass Traversal section:

- Remove the sentence: "The orderer reads `workflow.md` from the active record folder; invoke it using `orderWithPromptsFromFile` with the record folder path and the synthesis role name. The orderer returns a structured backward pass plan: an ordered list of entries, each containing a role, step type (`meta-analysis` | `synthesis`), session instruction (`existing-session` | `new-session`), and prompt."
- Remove the "**Embedded instructions:**" paragraph that follows it: "Generated prompts automatically embed a `Read:` reference to the relevant phase instructions in this document (`### Meta-Analysis Phase` or `### Synthesis Phase`). Roles follow these references to orient to their phase-specific tasks; no separate session-start loading of the improvement document is required."
- Replace both removed passages with a single sentence: "When the project uses the A-Society runtime, backward pass initiation and agent context injection are handled programmatically — agents do not invoke the Backward Pass Orderer directly."
- Update the "Component 4 invocation" section header and description to remove the `orderWithPromptsFromFile` invocation details. Replace the invocation block with the new API reference: `computeBackwardPassPlan(recordFolderPath, synthesisRole, mode)` — and note that this is called by the runtime, not by agents.

### A3. Update `$A_SOCIETY_TOOLING_COUPLING_MAP` per TA Advisory §6

Per TA §6 (Type C change — Component 4 interface):

- Update the Component 4 interface note in the invocation status row to reflect the new API (`computeBackwardPassPlan`, `buildBackwardPassPlan`, `locateFindingsFiles`, `locateAllFindingsFiles`; `orderWithPromptsFromFile` removed).
- Update the format dependency row: the prior entry "Backward pass ordering rule (per `$GENERAL_IMPROVEMENT`) | Yes | Component 4" is replaced with: "Backward pass ordering rule (per `$GENERAL_IMPROVEMENT_META_ANALYSIS` / `$GENERAL_IMPROVEMENT_SYNTHESIS`, via runtime constants in `improvement.ts`)" with the dependent component listed as the runtime module (`runtime/src/improvement.ts`), not Component 4.
- Add a note that the prior Component 4 invocation gap (agents invoking Component 4 manually per `$GENERAL_IMPROVEMENT`) is closed by this flow: Component 4 is now a runtime library and is not invoked by agents. No new invocation gap is introduced.
- Date the entry: 2026-04-04.

---

## Part B — LIB Proposal Items

### B1. Split `$GENERAL_IMPROVEMENT` into Three Files

**Current file:** `a-society/general/improvement/main.md`

Split into:

**`a-society/general/improvement/main.md` (replace in-place)**
Retain: Core Philosophy header, Principles 1–5, "How to Apply These Principles in Meta-Synthesis" section.
Remove: The entire "## Backward Pass Protocol" section (Purpose through Guardrails).
Add after the "How to Apply" section: a brief cross-reference block —
> The improvement process runs in two phases, each with its own instruction file:
> - **Meta-analysis:** `$GENERAL_IMPROVEMENT_META_ANALYSIS` — instructions for roles producing backward pass findings.
> - **Synthesis:** `$GENERAL_IMPROVEMENT_SYNTHESIS` — instructions for the synthesis role.
>
> When using the A-Society runtime, these files are injected into the appropriate agent sessions automatically. For projects without the runtime, follow the traversal ordering rules in your project's `a-docs/improvement/` instantiation of this framework.

**`a-society/general/improvement/meta-analysis.md` (create)**
Extract from current `main.md`: the entire "### Meta-Analysis Phase" section including:
- "When to Run" (depth guidance only — not the traversal instructions)
- Reflection categories (What to Reflect On)
- Analysis Quality
- Generalizable Findings
- Useful Lenses
- Output format (findings artifact naming and sequence numbering)

Add at the end of the file: the `meta-analysis-complete` signal instruction (required per TA advisory §1.2). Exact content to add:

> ### Completion Signal
>
> When your findings artifact is saved, emit a `meta-analysis-complete` handoff block:
>
> ````handoff
> type: meta-analysis-complete
> findings_path: <repo-relative path to the findings file you just produced>
> ````
>
> The `findings_path` field must be the repo-relative path to the findings artifact you produced in this session. This signal tells the improvement orchestrator that your meta-analysis is complete and where to find your output.

Do not include traversal ordering instructions or any "initiate backward pass" language in this file. This file is injected into an already-initiated session.

**`a-society/general/improvement/synthesis.md` (create)**
Extract from current `main.md`: the "### Synthesis Phase" section (routing rules, merge assessment, synthesis closes the flow) plus the "### Guardrails" section.

Do not include "How to Apply These Principles in Meta-Synthesis" here — that section remains in `main.md` as it belongs to the philosophy layer, not the synthesis execution instructions. Do not include traversal ordering instructions.

### B2. Register New Files in Indexes

Add to `$A_SOCIETY_INDEX` (internal):

| Variable | Path | Description |
|---|---|---|
| `$GENERAL_IMPROVEMENT_META_ANALYSIS` | `a-society/general/improvement/meta-analysis.md` | Meta-analysis phase instructions — injected into backward pass agent sessions by the runtime; contains reflection categories, analysis quality guidance, and `meta-analysis-complete` signal schema |
| `$GENERAL_IMPROVEMENT_SYNTHESIS` | `a-society/general/improvement/synthesis.md` | Synthesis phase instructions — injected into the synthesis (Curator) session by the runtime; contains routing rules, merge assessment, and synthesis closure behavior |

Add the same two entries to `a-society/index.md` (public index).

### B3. Framework Update Report Draft

Include a framework update report draft as a named section in the proposal submission. Classification per `$A_SOCIETY_UPDATES_PROTOCOL`. Indicate classification as TBD if you cannot determine it at proposal time; resolve at Phase 4 by consulting the protocol.

---

## Files Changed

| File | Action | Part |
|---|---|---|
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | Modify — minimal backward pass initiation removal | A1 |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | Modify — minimal backward pass initiation removal | A1 |
| `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` | Modify — minimal backward pass initiation removal | A1 |
| `$A_SOCIETY_OWNER_ROLE` | Modify — remove backward pass initiation paragraph from Forward Pass Closure Discipline | A1 |
| `$A_SOCIETY_IMPROVEMENT` | Modify — remove stale `orderWithPromptsFromFile` invocation; add runtime note | A2 |
| `$A_SOCIETY_TOOLING_COUPLING_MAP` | Modify — Component 4 Type C note; invocation gap closure | A3 |
| `a-society/general/improvement/main.md` | Replace — Core Philosophy + Principles + cross-references only | B1 |
| `a-society/general/improvement/meta-analysis.md` | Create — meta-analysis phase instructions + `meta-analysis-complete` signal | B1 |
| `a-society/general/improvement/synthesis.md` | Create — synthesis phase instructions + guardrails | B1 |
| `$A_SOCIETY_INDEX` | Modify — add `$GENERAL_IMPROVEMENT_META_ANALYSIS`, `$GENERAL_IMPROVEMENT_SYNTHESIS` | B2 |
| `a-society/index.md` | Modify — add same two public entries | B2 |

---

## Open Questions

None. Part A is fully specified for direct implementation. Part B is fully specified for proposal. The update report classification is deferred to Curator per protocol.
