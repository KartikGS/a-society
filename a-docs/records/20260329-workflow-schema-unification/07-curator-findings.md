# Curator Findings: Workflow schema unification — Framework Dev phase (4 files)

**Flow ID:** `20260329-workflow-schema-unification`
**Role:** Curator
**Date:** 2026-03-29

---

## Meta-Analysis: Framework Dev Phase

This flow successfully established the unified nodes/edges schema for record-folder `workflow.md` files, harmonizing them with the permanent workflow graph format. The implementation covered four major documentation targets and published the framework update report.

### Process Friction & Gaps

1.  **Stale Proposal Risk in Parallel Flows:**
    The `agent-context-frontmatter` flow (v24.0) completed its implementation and registration while this flow was in the proposal stage. This meant the `ReplacementChunks` in Phase 4 had to be carefully re-verified against the new post-v24.0 line numbers, as the proposal's anchors had shifted.
    *   *Finding:* Large framework changes happening in parallel or close succession create anchor-drift friction for the Curator.

2.  **Vocabulary Inertia (Path-model Terminology):**
    Correction A ("entry" vs. "node") highlighted how easily legacy terminology survives a schema migration even when the schema block itself is updated.
    *   *Finding:* Schema migrations require a deliberate "vocabulary sweep" beyond the schema blocks themselves.

3.  **Brief-to-Instruction Gap (Item 2 Analogues):**
    Correction B revealed that the brief did not scope the general counterpart to `$A_SOCIETY_RECORDS` Change 1d. While the brief correctly identified the project-specific correction, the instruction-level mirror was missing.
    *   *Finding:* When the Owner briefs a project-specific record change, the Curator should proactively sweep for the general instruction counterpart to ensure framework-wide parity.

4.  **Component 4 Incompatibility Gap:**
    As noted in `06-owner-decision.md`, this flow's `workflow.md` uses the new schema, but Component 4 still expects the old `path[]` schema. This creates a temporary "dead zone" where manual ordering is mandatory for the current folder.
    *   *Finding:* The transition from specification-only (Framework Dev) to tool-supported (Tooling Dev) creates a short-term observability gap for the current flow.

---

## Proposed Improvements

1.  **[LIB] Migration Sweep Protocol:**
    Update `$A_SOCIETY_CURATOR_ROLE` to require a **"Vocabulary Sweep"** during schema migrations. When a format changes, the Curator must perform a grep-search for deprecated terms (e.g., `path:`, `synthesis_role`, `entry`) across all `general/` and `a-docs/` files to ensure prose alignment.

2.  **Adjacent-Anchor Guardrail Enforcement:**
    Implement the findings from `20260328-general-doc-bundle` regarding "Adjacent Boundary Anchors" more strictly. Using immediately adjacent lines as `TargetContent` in proposals reduces the impact of distant line-number shifts caused by parallel flows.

3.  **Instruction Mirroring Requirement:**
    Add a requirement to `$A_SOCIETY_OWNER_ROLE` or `$A_SOCIETY_CURATOR_ROLE` that whenever a project-specific record-folder convention ($A_SOCIETY_RECORDS) is modified, the general record-folder instruction ($INSTRUCTION_RECORDS) must be assessed for an identical update to preserve mirroring.

4.  **Immediate Tooling Dev Priority:**
    The update to Component 4's parser should be the immediate next focus to eliminate the manual-ordering requirement for new flows.

---

## Next Action: Owner Meta-Analysis
**Filing Location:** `a-docs/records/20260329-workflow-schema-unification/08-owner-findings.md`
**Trigger:** Curator findings filed.
