---
**Subject:** Proposal: Workflow YAML graph terminal node correction — two workflow files
**Status:** PROPOSED
**Date:** 2026-03-21

---

## 1. Description of Change

This proposal corrects the YAML graph frontmatter in both A-Society workflow files to reflect the "Owner as terminal node" rule specified in `$INSTRUCTION_WORKFLOW`. It also aligns the session model prose in both files to reflect these structural changes and corrects a phase-naming inconsistency in `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.

### Target Files
- `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (/a-society/a-docs/workflow/framework-development.md)
- `$A_SOCIETY_WORKFLOW_TOOLING_DEV` (/a-society/a-docs/workflow/tooling-development.md)
- `$A_SOCIETY_AGENT_DOCS_GUIDE` (/a-society/a-docs/a-docs-guide.md) — for node count consistency

---

## 2. Modified Graph Structure

### `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`
- **Operation:** Add a terminal node.
- **New Node:** `owner-closure-acknowledgment` (Role: Owner; Input: Registration output + any update-report draft; Work: Confirm forward pass closure; Output: Closure message).
- **New Edge:** `curator-implementation-registration` → `owner-closure-acknowledgment` (Artifact: `curator-to-owner`).

### `$A_SOCIETY_WORKFLOW_TOOLING_DEV`
- **Operation:** Add a terminal node.
- **New Node:** `owner-phase8-closure` (Role: Owner; Input: Registration output + any update-report draft; Work: Confirm forward pass closure; Output: Closure message).
- **New Edge:** `curator-phase7` → `owner-phase8-closure` (Artifact: `curator-to-owner`).
- **Phase 7 Correction:** Rename "Phase 7 — Registration, Finalization, and Backward Pass" to "Phase 7 — Registration and Finalization". Move the Backward Pass protocol description to its own section (matching the Framework Dev structure) to preserve the "Backward Pass is not a workflow phase" rule.

---

## 3. Validation

### Principles Check
1. **Completability:** Yes, the terminal step is now captured in the graph and is satisfiable from the `curator-to-owner` artifact.
2. **Role Separation:** Yes, the Owner verifies the Curator's final registration and outbound reporting work.
3. **Approval Gates:** All gates are intact; the terminal node adding a final check improves structural quality.
4. **Core Bet:** The structure now explicitly closes the loop, reinforcing the "Owner as vision keeper" role.
5. **Traceability:** This modification is submitted through the standard workflow.

### Hard Rules Check
1. **Written Artifacts:** Yes, every edge (including the new terminal edge) carries a `curator-to-owner` or `owner-to-curator` artifact.
2. **Approval Gate:** Yes, both graphs preserve all existing approval nodes.
3. **Single Ownership:** Every step is clearly assigned to one role (Owner or Curator).
4. **Indexing:** No new public variables are being added; existing ones are used.
5. **Input Satisfiability:** The terminal Owner nodes receive the outputs of the registration nodes.
6. **Role-defined:** Steps are defined by Owner/Curator roles.
7. **Immutable Records:** Existing records are not affected.

---

## 4. Proposed Implementation Details

### Item 1 — Framework Dev
- **YAML Frontmatter:** Add `owner-closure-acknowledgment` node and incoming edge from `curator-implementation-registration`.
- **Prose Additions:** Add "Phase 5 — Forward Pass Closure" section. Update Step 5 in "How it flows" to explicitly reference this phase.

### Item 2 — Tooling Dev
- **YAML Frontmatter:** Add `owner-phase8-closure` node and incoming edge from `curator-phase7`.
- **Prose Additions:** Add "Phase 8 — Forward Pass Closure" section. Rename Phase 7. Move the backward pass section to Section 3. Note the transition from Curator (Phase 7) to Owner (Phase 8).

### Item 3 — Prose Scan (MAINT authority)
- Update `$A_SOCIETY_AGENT_DOCS_GUIDE` with revised node counts for both workflow files.
- Align Step 4 and 5 in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` session model to ensure the transition to the Owner for closure is explicit.

---

## 5. Decision Support

The "Owner as terminal node" rule ensures work is not silently completed. In the current graphs, the Curator's final registration work is the last node, meaning the human must infer that the flow should return to the Owner for a final acknowledgement and backward-pass initiation. By adding these terminal nodes, we make this transition explicit and machine-discoverable (for Component 4).

In the Tooling workflow, `owner-phase6-gate` does not satisfy the terminal rule because Phase 7 contains significant work (registration, update-report drafting) that requires Owner review and acknowledgement before the forward pass can be considered closed.

---

## 6. Handoff

Next action: Owner review of this proposal.
Read: `/a-society/a-docs/records/20260321-workflow-terminal-node-fix/03-curator-to-owner.md`
Expected response: Approved, Revise, or Rejected decision artifact (`04-owner-to-curator.md`).
