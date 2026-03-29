# Backward Pass Findings: Curator — agent-context-frontmatter

**Date:** 2026-03-29
**Task Reference:** agent-context-frontmatter
**Role:** curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- none

### Unclear Instructions
- **Instruction Placeholder Notation** — The brief (`02-owner-to-curator-brief.md`) used `$PROJECT_AGENTS` and `$PROJECT_INDEX` as placeholders in the proposed `$INSTRUCTION_AGENTS` section. This contradicted the project's variable naming conventions (which use project-specific prefixes like `$A_SOCIETY_`). The Owner flagged this in the Phase 2 review (`04-owner-to-curator.md`), requiring a resubmission to replace placeholders with functional descriptions.

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- **Phase 2 Resubmission Cycle** — The resubmission of the proposal (`05-curator-to-owner.md`) was triggered by the placeholder ambiguity in the brief. While a small corrective edit, it added an extra session cycle that clearer drafting of the brief could have avoided.
- **Tool-Usage Friction (Artifacts)** — Attempted to use `write_to_file` with `IsArtifact: true` using an absolute path within the repository, which is not a valid artifact path for the AI platform's specific "Artifacts" tool. Resolved by setting `IsArtifact: false` to write directly to the project's record folder.

---

## Top Findings (Ranked)

1. **Instruction Placeholder Clarity** — Use functional descriptions ("The variable registered in the project's index for...") rather than fictional `$VAR` placeholders in instruction templates — `$INSTRUCTION_AGENTS`. 
2. **Briefing Verification** — Owners should verify that proposed instruction additions are self-consistent with existing framework conventions before the brief reaches the Curator — `$GENERAL_COMM_TEMPLATE_BRIEF`.
