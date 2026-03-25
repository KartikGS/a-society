**Subject:** doc-maintenance-bundle — Priorities 2–5 bundled
**Status:** BRIEFED
**Date:** 2026-03-24

> **Pre-send check (Variables):** All `$VAR` references below are registered in `$A_SOCIETY_INDEX`: `$GENERAL_CURATOR_ROLE`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_LOG`, `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_LOG`, `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_WORKFLOW_TOOLING_DEV`, `$A_SOCIETY_UPDATES_PROTOCOL`. ✓

---

**Topology waiver:** Per `01-owner-workflow-plan.md`, this flow has no Proposal phase. This brief constitutes authorization for all items marked LIB below. No proposal artifact is required before implementation begins.

---

## Agreed Change

**Files Changed:**

| Target | Actions | Authority |
|---|---|---|
| `$GENERAL_CURATOR_ROLE` | insert — Handoff Output (workflow.md verification step) | LIB — authorized by this brief |
| `$GENERAL_OWNER_ROLE` | insert × 2 — Brief-Writing Quality (prose insertions para) + Workflow Routing (parallel flows rule) | LIB — authorized by this brief |
| `$INSTRUCTION_LOG` | modify — Merge Assessment (add third criterion) | LIB — authorized by this brief |
| `$GENERAL_IMPROVEMENT` | modify — Tooling paragraph (remove mandate sentences) | LIB — authorized by this brief |
| `$A_SOCIETY_OWNER_ROLE` | insert × 2 + modify — Brief-Writing Quality (prose insertions para) + Workflow Routing (parallel flows rule) + merge assessment inline mention (add third criterion) | Curator authority — implement directly |
| `$A_SOCIETY_WORKFLOW` | insert — Session Routing Rules (multiple concurrent workflows rule) | Curator authority — implement directly |
| `$A_SOCIETY_LOG` | modify — Current State status line (remove stale "backward pass pending" clause) | Curator authority — implement directly |
| `$A_SOCIETY_IMPROVEMENT` | modify — Component 4 section (rename heading + remove mandate sentences) | Curator authority — implement directly |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | insert — Phase 8 Work section (Component 4 invocation mandate) | Curator authority — implement directly |

---

### Item 1 — `$GENERAL_CURATOR_ROLE`: Handoff Output workflow.md verification step

**Source priority:** P2 `[S][LIB]`

**Problem:** The `$GENERAL_CURATOR_ROLE` Handoff Output section lacks an explicit step directing the Curator to verify the next action against the flow's `workflow.md` before issuing a handoff. Without this, agents rely on memory of the workflow sequence, which has produced incorrect handoff targets. The echo to `$A_SOCIETY_CURATOR_ROLE` was applied in a prior synthesis pass; this item closes the LIB gap.

**Change:** `[insert — before the sentence beginning "At each pause point, the Curator tells the human:"]`

Insert the following sentence as the new opening of the `## Handoff Output` section, immediately before "At each pause point, the Curator tells the human:":

> Before issuing your handoff, verify the next step against the flow's `workflow.md`. Do not rely on memory of the workflow sequence.

---

### Item 2a — `$GENERAL_OWNER_ROLE`: Prose insertions guidance

**Source priority:** P3 `[S][LIB][MAINT]`

**Problem:** `$GENERAL_OWNER_ROLE` Brief-Writing Quality covers ordered-list insertions (with a specificity rule) but has no parallel rule for prose insertions. Briefs that direct prose insertions have been naming only the section, leaving the Curator to infer the exact boundary — which creates ambiguity and can produce correction rounds.

**Change:** `[insert — after the sentence ending "...which creates ambiguity and can require a correction round." (last sentence of the **Ordered-list insertions:** paragraph)]`

Insert a new paragraph immediately after the **Ordered-list insertions:** paragraph:

> **Prose insertions:** When a brief directs the downstream role to insert text into existing prose — rather than into a numbered or bulleted list — provide the exact target clause or phrase at the insertion boundary. Acceptable forms: "after the clause ending '...X'," "before the sentence beginning 'Y'," or "replace the phrase 'Z' with." A brief that names only the section leaves the receiving role to infer the exact insertion point, which creates ambiguity and can require a correction round.

---

### Item 2b — `$GENERAL_OWNER_ROLE`: Parallel flows routing rule

**Source priority:** P3 `[S][LIB][MAINT]`

**Problem:** `$GENERAL_OWNER_ROLE` Workflow Routing does not state that the Owner must not orchestrate multiple concurrent workflow types within a single session — it must route them as separate flows for the user to execute independently. This rule was distilled from an observed failure mode.

**Change:** `[insert — after the clause ending "directing the user to the next session." (last sentence of the **Workflow routing** bullet in Authority & Responsibilities)]`

Append to the **Workflow routing** bullet, immediately after "directing the user to the next session.":

> When the identified work requires two or more separate workflow types, the Owner routes them as separate flows for the user to execute independently. The Owner does not orchestrate concurrent flows within a single session.

---

### Item 3 — `$INSTRUCTION_LOG`: Third merge assessment criterion

**Source priority:** P3 `[S][LIB][MAINT]`

**Problem:** The merge assessment in `$INSTRUCTION_LOG` Next Priorities states two conditions for mergeability. A third condition is missing: same workflow type and role path. Without it, items that touch the same files but run through incompatible workflows (e.g., one requiring a Curator-only MAINT pass, another requiring Owner brief + Curator + Owner review) can be incorrectly merged, which causes the bundled flow to violate one item's workflow requirements.

**Change — two edits to `## Next Priorities` → `**Merge Assessment**`:**

**Edit A:** `[replace — "Two items are mergeable when both conditions are true:" → "Two items are mergeable when all three conditions are true:"]`

**Edit B:** `[insert — after item 2 "**Compatible authority level**..." (after the sentence ending "...or both requiring the same approval path)."')]`

Insert as item 3:

> 3. **Same workflow type and role path** — both items would run through the same workflow type with the same role sequence.

---

### Item 4 — `$GENERAL_IMPROVEMENT`: Remove mandate sentences from Tooling paragraph

**Source priority:** P5 `[S][LIB][MAINT]`

**Problem:** The Tooling paragraph in `$GENERAL_IMPROVEMENT` `### Backward Pass Traversal` contains two mandate sentences that belong only at forward pass closure nodes, not in the improvement doc: "invoke it for every flow regardless of role count" and "When a Backward Pass Orderer tool is available, manual traversal computation is not permitted." The same pattern applies to "When the tool is available, use it — do not apply the manual traversal rules above as an alternative." The improvement doc should describe the tool and its invocation interface as reference; the mandate (when to invoke, that manual ordering is not permitted) belongs at the forward pass closure node of each workflow. The invocation reference, embedded instructions note, and bootstrapping exemption may remain.

**Change — two edits to `### Backward Pass Traversal` → **Tooling** block:**

**Edit A:** `[replace — remove mandate sentences from first Tooling paragraph]`

Current first paragraph:

> **Tooling:** If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it for every flow regardless of role count. When a Backward Pass Orderer tool is available, manual traversal computation is not permitted. Manual ordering is reserved for projects where no such tool exists or for bootstrapping cases where the tool cannot be invoked.

Replace with:

> **Tooling:** If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), manual ordering is reserved for projects where no such tool exists or for bootstrapping cases where the tool cannot be invoked.

**Edit B:** `[replace — remove mandate sentence from second Tooling paragraph]`

The second paragraph currently begins: "When the tool is available, use it — do not apply the manual traversal rules above as an alternative. The orderer reads `workflow.md`..."

Remove the opening sentence. The paragraph should begin directly with: "The orderer reads `workflow.md` from the active record folder; invoke it using `orderWithPromptsFromFile`..."

Make a minimal phrasing adjustment if the paragraph opening feels abrupt without the preamble sentence — the goal is coherent reference prose, not a mandate.

---

### Item 5a — `$A_SOCIETY_OWNER_ROLE`: Prose insertions echo (MAINT)

**Source priority:** P3 `[S][LIB][MAINT]` — echo of Item 2a

**Problem:** `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality lacks the prose insertions specificity rule. The `$GENERAL_OWNER_ROLE` template gains this rule in Item 2a; `$A_SOCIETY_OWNER_ROLE` must stay consistent. Note: `$A_SOCIETY_OWNER_ROLE` does not have an **Ordered-list insertions:** paragraph, so the prose insertions rule is added as a standalone paragraph after **Multi-file scopes:**, which is the adjacent structural guidance.

**Change:** `[insert — after the sentence ending "...to streamline the downstream role's implementation plan." (last sentence of the **Multi-file scopes:** paragraph in ## Brief-Writing Quality)]`

Insert a new paragraph immediately after the **Multi-file scopes:** paragraph:

> **Prose insertions:** When a brief directs a downstream role to insert text into existing prose, provide the exact target clause or phrase at the insertion boundary. Acceptable forms: "after the clause ending '...X'," "before the sentence beginning 'Y'," or "replace the phrase 'Z' with." A brief that names only the section leaves the receiving role to infer the exact insertion point, which creates ambiguity and can require a correction round.

---

### Item 5b — `$A_SOCIETY_OWNER_ROLE`: Parallel flows routing rule (MAINT)

**Source priority:** P3 `[S][LIB][MAINT]` — echo of Item 2b

**Change:** `[insert — after the clause ending "directing the human to the next session." (last clause of the **Workflow routing** bullet in ## Authority & Responsibilities)]`

Append to the **Workflow routing** bullet, immediately after "directing the human to the next session.":

> When work requires two or more separate workflow types, route them as separate flows for the user to execute independently. Do not orchestrate concurrent flows within a single session.

---

### Item 5c — `$A_SOCIETY_OWNER_ROLE`: Merge assessment inline mention (MAINT)

**Source priority:** P3 `[S][LIB][MAINT]` — echo of Item 3

**Change:** `[replace — inline text in the project log bullet, ## Authority & Responsibilities]`

Current inline text: "scan existing items for (1) same target files or same design area, and (2) compatible authority level."

Replace with: "scan existing items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path."

---

### Item 6 — `$A_SOCIETY_WORKFLOW`: Multiple concurrent workflows rule (MAINT)

**Source priority:** P3 `[S][LIB][MAINT]`

**Problem:** `$A_SOCIETY_WORKFLOW` Session Routing Rules does not state the constraint on multiple concurrent workflow types. The parallel rule in Items 2b and 5b covers the Owner role docs; the Session Routing Rules governs cross-role universal behavior and must also carry the rule.

**Change:** `[insert — after the paragraph ending "...If a new session is required, provide a copyable session-start prompt." (last paragraph of ## Session Routing Rules, before the closing ---)]`

Insert a new rule paragraph after the **Agents must not pass conditional language...** paragraph:

> **Multiple concurrent workflows:** When the identified work requires two or more separate workflow types, the Owner routes them as separate flows for the user to execute independently. The Owner does not orchestrate multiple concurrent flows within a single session.

---

### Item 7 — `$A_SOCIETY_LOG`: Remove stale "backward pass pending" clause (MAINT)

**Source priority:** P4 `[S][MAINT]`

**Problem:** The Current State status line contains "Backward pass pending for [flow-list]" — this text has no governing instruction and is demonstrably stale. No log instruction or format rule specifies this field; it was added ad hoc and has not been maintained. Stale status text misdirects agents.

**Change:** `[replace — status line in ## Current State]`

Current: `**Status:** Framework active at v21.0. Backward pass pending for \`workflow-obligation-consolidation\`, \`backward-pass-quality-principles\`, \`log-restructure\`, \`general-lib-sync-bundle\`, \`graph-validator-human-collaborative\`, \`next-priorities-bundle\`, and \`workflow-mechanics-corrections\`.`

Replace with: `**Status:** Framework active at v21.0.`

---

### Item 8 — `$A_SOCIETY_IMPROVEMENT`: Rename heading + remove mandate sentences (MAINT)

**Source priority:** P5 `[S][LIB][MAINT]` — MAINT component (echo of Item 4)

**Problem:** Same as Item 4 but in `$A_SOCIETY_IMPROVEMENT`. The `#### Component 4 mandate` subsection opens with two mandate sentences that belong at the forward pass closure node, not in the improvement doc. The invocation reference, embedded instructions note, and bootstrapping exemption remain. The subsection heading should be renamed to reflect its new purpose as an invocation reference.

**Change — two edits to `### Backward Pass Traversal` → `#### Component 4 mandate`:**

**Edit A:** `[replace — section heading]`

Current: `#### Component 4 mandate`
Replace with: `#### Component 4 invocation`

**Edit B:** `[replace — opening paragraph of the section]`

Current paragraph:

> When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available, invoke it for every flow regardless of role count. When Component 4 is available, manual backward pass ordering is not permitted. Manual computation is reserved for cases where Component 4 cannot be invoked (bootstrapping exemption, unavailability).

Replace with:

> Manual computation is reserved for cases where Component 4 cannot be invoked (bootstrapping exemption, unavailability).

Keep all subsequent content in the section intact (invocation reference, `BackwardPassPlan` entry structure, **Embedded instructions:** note, **Bootstrapping exemption:** note).

---

### Item 9 — `$A_SOCIETY_WORKFLOW_TOOLING_DEV`: Add Component 4 mandate to Phase 8 (MAINT)

**Source priority:** P5 `[S][LIB][MAINT]`

**Problem:** The mandate for Component 4 invocation belongs at forward pass closure nodes. The framework dev workflow's Phase 5 (Forward Pass Closure) already carries it. The tooling dev workflow's Phase 8 (Forward Pass Closure) does not — it says only "Acknowledge closure and initiate the backward pass," omitting the Component 4 invocation obligation. This gap means agents running the tooling dev workflow's Phase 8 have no instruction to invoke Component 4 before proceeding to findings.

**Change:** `[replace — the final sentence of **Work:** in #### Phase 8 — Forward Pass Closure]`

Current sentence: "Acknowledge closure and initiate the backward pass."

Replace with: "Acknowledge closure and initiate the backward pass by invoking Component 4 (Backward Pass Orderer) using this flow's `workflow.md`. Component 4 invocation is the first backward pass action — no findings artifact may be produced before the traversal order has been determined."

---

## Scope

**In scope:**
- All nine changes enumerated above, across nine target files.
- Post-implementation update report assessment via `$A_SOCIETY_UPDATES_PROTOCOL` — Curator determines applicability and files if triggered.

**Out of scope:**
- Adding **Ordered-list insertions:** guidance to `$A_SOCIETY_OWNER_ROLE` (not in the source priority; the prose insertions rule is added standalone in Item 5a).
- Any structural changes to the improvement protocol beyond heading rename and sentence removal.
- Changes to other workflow documents beyond `$A_SOCIETY_WORKFLOW` and `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.

---

## Likely Target

All targets are specified in the Files Changed table above. All `general/` files resolve via `$A_SOCIETY_INDEX`; all `a-docs/` files are MAINT within Curator scope.

---

## Open Questions for the Curator

None. All nine changes are fully specified with insertion boundaries. No judgment calls are required.

---

## Gate Condition

Return to the Owner session when implementation, registration, and update report assessment (if triggered) are complete. Produce the implementation confirmation artifact (`03-curator-to-owner.md`) at that point.

---

## Curator Confirmation Required

Before beginning implementation, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning implementation for doc-maintenance-bundle — Priorities 2–5 bundled."

The Curator does not begin implementation until they have read this brief in full and confirmed acknowledgment.
