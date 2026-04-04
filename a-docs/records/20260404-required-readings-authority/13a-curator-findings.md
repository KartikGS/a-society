# Backward Pass Findings: Curator — 20260404-required-readings-authority

**Date:** 2026-04-04
**Task Reference:** 2026-04-04-required-readings-authority
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **Interpretation of "Removal" vs. "Warning":** The initial Curator proposal misinterpreted the Owner's intent for foundation instructions. The brief's requirement to "remove guidance" was initially drafted as a "legacy warning," which required a revision cycle to clarify that the framework is strictly moving to structural removal of rituals rather than preserving them with labels.

### Missing Information
- **Roles Table Sync:** The `agents.md` roles table in the A-Society project was missing the `Runtime Developer` entry, despite the file existence and active maintenance. This indicates a gap in the automated/manual cross-check for role table completeness during maintenance cycles.

### Unclear Instructions
- **Role Identifier Schema:** The `required-readings.yaml` schema requires keys matching role IDs, but no directory-wide convention exists for these IDs (e.g., `technical-architect` vs. `TechnicalArchitect`). I had to infer lowercase-hyphenated strings based on folder patterns.

### Redundant Information
- **Post-Restructure Success:** The restructure successfully eliminated the massive parity burden between role-specific rituals and the project's orientation checklist. The redundancy is gone.

### Scope Concerns
- none

### Workflow Friction
- **Bulk Cleanup Friction:** Manually cleaning up 5+ role templates (`owner.md`, `curator.md`, `technical-architect.md`, `tooling-developer.md`, `runtime-developer.md`) is high-friction. In this session, I missed one ritual line in `tooling-developer.md` on the first pass and had to go back to fix it. This task type is prone to residual fragments.

---

## Analysis Quality

**Observation:** During the edit of `a-docs-guide.md`, I misplaced the new `### Roles` header and accidentally removed a line from the `log.md` rationale.
- **Root Cause:** The `a-docs-guide.md` contains multiple identical sub-headers (e.g., `### Roles` exists for both project files and templates). My `replace_file_content` call did not include enough surrounding context in `TargetContent` to ensure a unique match, leading to a mis-edit.
- **Actionable Finding:** When editing files with repeated semantic headers (like guides or registries), agents should be instructed to include the parent `## Folder` or `## Section` header in their match context to ensure placement integrity.

---

## Top Findings (Ranked)

1. **Repeated Header Matching Ambiguity** — `a-docs-guide.md` (Self-correction needed in TargetContent precision)
2. **Standardized Role-ID YAML keys** — `$INSTRUCTION_REQUIRED_READINGS` (Add lowercase-hyphenated requirement)
3. **Role Table Maintenance Gaps** — `agents.md` (Add completeness check to Curator maintenance protocol)
4. **Post-Ritual Identity Injection** — `$INSTRUCTION_ROLES` (Finalize the formal replacement of rituals with runtime-injected identity)

## Framework Contribution Candidates

1. **Role Identifier Convention:** Add a rule to `$INSTRUCTION_ROLES` that every role must have a machine-safe `role_id` (lowercase, hyphenated) for use in YAML configurations.
2. **Surrounding Context Rule:** Add a principle to `$GENERAL_IMPROVEMENT_META_ANALYSIS` (or a code edit instruction) requiring parent-landmark context for edits on files with repeated sub-headers.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260404-required-readings-authority/13a-curator-findings.md
```
