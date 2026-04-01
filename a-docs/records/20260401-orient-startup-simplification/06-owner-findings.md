---
type: owner-findings
date: "2026-04-01"
flow: orient-startup-simplification
role: Owner
depth: Lightweight
---

**Date:** 2026-04-01
**Task Reference:** orient-startup-simplification
**Role:** Owner

---

## Findings

### Conflicting Instructions
None.

### Missing Information
None.

### Unclear Instructions

**Replacement boundary for structured documentation entries** — The brief directed: "Replace with: [new description]" for the `orient` command entry in `runtime/INVOCATION.md`. The command entry is a structured block with three discrete fields: a description line, a `- **Usage:**` line, and argument definitions. The brief scoped a change to the description field only — but by using "Replace with" without naming a boundary, it left the developer to infer whether the replacement was description-only or whole-entry.

The developer's interpretation (whole-entry replacement) was coherent: if `orient` is being demoted to a "low-level mechanism," prominent usage documentation arguably runs counter to that framing. But the brief's intent was description-only. The ambiguity was the brief's, not the developer's.

Root cause: the Brief-Writing Quality guidance covers prose insertions (adjacency anchors) and schema changes, but does not address structured documentation entries — CLI command blocks, template sections, or any format where a description field is one of several discrete sub-fields. A "Replace with" instruction on such an entry is ambiguous about scope unless the boundary is stated explicitly.

### Redundant Information
None.

### Scope Concerns
None.

### Workflow Friction
None.

---

## Top Findings (Ranked)

1. **Replacement boundary for structured entry changes** — when a brief directs a description change within a structured documentation entry (CLI command block, template section, or similar format with discrete sub-fields), it must explicitly state whether the replacement is description-only or the whole entry. "Replace with: [new text]" is ambiguous when applied to a named sub-field of a multi-field structure. This gap is generalizable: applies to any project using Owner briefs that touch structured documentation. Flag for `$GENERAL_OWNER_ROLE` Brief-Writing Quality.

---

## Merge Assessment for Next Priorities

Finding 1 targets `$GENERAL_OWNER_ROLE` Brief-Writing Quality. The existing "Role guidance precision bundle" Next Priorities item targets the same file, same design area, compatible `[LIB]` authority, and same Framework Dev workflow path. This finding merges into that item — does not file as a separate entry.

The merge will extend the bundle's scope to include: *add a replacement-boundary rule to Brief-Writing Quality — when directing a description change within a structured documentation entry (a block with discrete sub-fields such as a CLI command entry or template section), the brief must explicitly state whether the replacement is description-only or the whole entry.*

---

## Note on Finding 2 (Line Number Drift)

The Runtime Developer flagged line number drift as a failure point. Assessment: not actionable as a documentation gap. The brief provided content strings as primary locators and line numbers as supplementary reference — the correct approach per existing guidance. The changes landed correctly. No rule is warranted.
