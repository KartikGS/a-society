# Backward Pass Synthesis: Curator — 20260404-required-readings-authority

**Date:** 2026-04-04
**Role:** Curator
**Findings reviewed:** 13a (Curator), 13b (Runtime Developer), 14 (Owner)

---

## Synthesis Summary

Three findings files reviewed. The flow successfully restructured required-reading authority to a machine-readable `required-readings.yaml` source with runtime injection, eliminating frontmatter and prose ritual redundancy across all role files. The backward pass surfaces four actionable improvement items across two scopes: two within a-docs/ (implemented directly below), and several outside a-docs/ (routed to Next Priorities with merge assessment).

---

## Cross-Cutting Theme

**Role identifier convention absent from `$INSTRUCTION_REQUIRED_READINGS`.** All three roles independently hit the same gap: the `required-readings.yaml` schema specifies lowercase-hyphenated keys for role identifiers, but no documented rule states this or explains how to derive it from the runtime's internal `namespace__Role Name` representation. The Curator inferred it from folder patterns; the Runtime Developer derived the mapping without documentation; the Owner confirmed both hit the gap independently. This is the highest-priority finding and must be addressed in `$INSTRUCTION_REQUIRED_READINGS` before the instruction is used again.

---

## Direct Implementations (within a-docs/)

### 1. Path portability discipline — Runtime Developer role

The Owner found that the path portability requirement — repo-relative paths, no `file://` URLs — was stated only as an Owner *verification* obligation, not as a Developer *production* obligation. The Runtime Developer did not self-catch the `file://` URL in the 04b completion artifact; the Owner caught it in review. The `runtime-developer.md` Handoff Output already contains an "Exact-path discipline" note covering cited file paths; I extended it to explicitly prohibit `file://` URLs.

**File modified:** `a-society/a-docs/roles/runtime-developer.md`
**Change:** Appended `file://` prohibition to the existing Exact-path discipline sentence.

### 2. Path portability discipline — Tooling Developer role

The same obligation applies to the Tooling Developer, which had no path discipline note in its completion report section.

**File modified:** `a-society/a-docs/roles/tooling-developer.md`
**Change:** Added Exact-path discipline note after the completion report definition.

---

## Next Priorities Routing

### A. New item — Role identifier convention in `$INSTRUCTION_REQUIRED_READINGS`

Merge assessment: no existing Next Priorities item targets `$INSTRUCTION_REQUIRED_READINGS`, the role-key convention, or the identifier derivation design area. New item filed.

Scope: Add a "Role Key Convention" section to `$INSTRUCTION_REQUIRED_READINGS` specifying: keys must be lowercase hyphenated strings (e.g., `owner`, `technical-architect`, `runtime-developer`); keys must match the role name as used in the project's `agents.md` roles table, lowercased with spaces replaced by hyphens; include a worked example covering a compound name. Optionally document the runtime derivation rule (extract second segment of `namespace__Role Name`, lowercase, hyphenate) so implementers using the runtime's internal key format do not have to reverse-engineer the mapping.

Sources: `13a` Top Finding 2; `13b` Top Finding 2; `14` Top Finding 1 (Missing Information).

### B. Merge into "Role-guidance precision follow-up" — two additions

**Merge basis:** same target files (`$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`), compatible `[S][LIB]` authority level, same Framework Dev workflow path.

**Addition 1 — `$GENERAL_OWNER_ROLE` Brief-Writing Quality:** When a brief scopes both a removal and an additive item in the same target file, explicitly state for each removed section whether it is (a) removed entirely with no replacement or (b) replaced by a specific named new section. "Remove X; add Y" is ambiguous about whether Y replaces X or coexists with a stripped-down X. The "removal vs. warning" revision cycle in this flow was Owner-caused: the brief combined removal and replacement pointers in adjacent bullets without making the relationship explicit.

Source: `14` Unclear Instructions; Analysis Quality; Top Finding 2.

**Addition 2 — `$GENERAL_CURATOR_ROLE`:** The escalation-first principle (when uncertain, flag the uncertainty and ask rather than invent a rule) exists in the role guidance but may lack sufficient salience. The 04a proposal included an invented "topology waiver" justification for a situation the Curator could not fully assess. Strengthen the salience of the escalation-first principle in the Curator's uncertainty-handling guidance — the correct response to procedural uncertainty is always an explicit flag, not a self-generated justification.

Source: `14` Scope Concerns; Top Finding 4.

### C. Merge into "Technical Architect advisory completeness addendum" — one addition

**Merge basis:** same target file (`$GENERAL_TA_ROLE`), compatible `[S][LIB]` authority level, same Framework Dev workflow path.

**Addition — Developer completion-report path portability:** Add a note to `$GENERAL_TA_ROLE` (or a future general Developer role template if one is created) stating that completion reports and backward-pass findings must use repo-relative paths throughout. Absolute paths and `file://` URLs are prohibited. The rule currently lives in the Runtime Developer role as an Owner verification obligation; it must also be stated as a Developer production obligation so the Developer self-catches violations before the Owner reviews.

Source: `13b` Top Finding 1; `14` Top Finding 3 (Workflow Friction).

### D. New item — Repeated-header matching guidance in `$GENERAL_IMPROVEMENT_META_ANALYSIS`

Merge assessment: no existing Next Priorities item targets `$GENERAL_IMPROVEMENT_META_ANALYSIS`, repeated-header edit discipline, or this design area. New item filed.

Scope: Add guidance to `$GENERAL_IMPROVEMENT_META_ANALYSIS` (or an equivalent instruction for implementation agents) that when editing files with repeated semantic sub-headers (e.g., `### Roles` appearing under multiple parent `## Folder` sections), agents must include the parent section header in their match context to ensure placement integrity. The Curator's mis-edit during `a-docs-guide.md` modification — where a `### Roles` header was misplaced due to ambiguous match context — is the motivating case.

Source: `13a` Top Finding 1; Analysis Quality.

---

## Findings Sequence Gap (09–12)

The forward pass closed at artifact `08`. Backward pass findings landed at `13a`, `13b`, and `14`. Slots 09–12 are unoccupied.

This gap is consistent with Component 4's BFS traversal algorithm assigning sequence slots to all traversal positions in the computed backward pass plan, including nodes that produce no findings. The six-node workflow graph (two parallel tracks, multiple Owner passes) produces a traversal order that reserves intermediate slots before reaching the meta-analysis phase. Records are immutable and cannot be renumbered. No corrective action is possible here. If the slot-assignment behavior is causing ongoing legibility concerns, a future flow targeting Component 4 invocation or the records convention could evaluate whether compact numbering (skipping non-producing roles) is preferable. No Next Priority filed — the cause is explainable and no documentation gap requires resolution.

---

## Synthesis Disposition

| Finding | Action | Scope |
|---|---|---|
| Role identifier convention absent from `$INSTRUCTION_REQUIRED_READINGS` | New Next Priority `[S][LIB]` | Outside a-docs/ |
| "Remove entirely vs. replace" brief precision rule | Merged into "Role-guidance precision follow-up" | Outside a-docs/ |
| Escalation-first salience in `$GENERAL_CURATOR_ROLE` | Merged into "Role-guidance precision follow-up" | Outside a-docs/ |
| Developer completion-report path portability | Implemented directly (a-docs/); merged into TA addendum for general/ | Both |
| Repeated-header matching guidance | New Next Priority `[S][LIB]` | Outside a-docs/ |
| Findings sequence gap (09–12) | Explained; no action needed | — |
| Registry path rigidity (`runtime/src/registry.ts`) | Noted; runtime implementation scope — not a-docs/ item | — |
