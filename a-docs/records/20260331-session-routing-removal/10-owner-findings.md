---
type: backward-pass-findings
role: owner
date: "2026-03-31"
---

# Backward Pass Findings: Owner — session-routing-removal

**Date:** 2026-03-31
**Task Reference:** session-routing-removal
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- **No explicit intake check for schema-code coupling.** The Owner intake protocol has no step prompting the question: "Does this documentation change define or modify a schema that has a programmatic consumer?" At intake for this flow, I drafted the brief as a documentation-only scope and listed the runtime code change as "Out of scope — a separate work item." This was immediately corrected by the human. The root cause is structural: the intake protocol does not surface this question. The multi-domain pattern exists and was correctly applied once the error was caught, but the error should have been caught by the Owner. — `02-owner-to-curator-brief.md` (original "Out of scope" clause); `$A_SOCIETY_OWNER_ROLE` Post-Confirmation Protocol / brief-writing scope assessment

### Unclear Instructions
- None.

### Redundant Information
- None.

### Scope Concerns
- **Implicit vestigial removal not consistently scoped across files.** In the brief, I explicitly scoped removal of the "New session (criteria apply):" format block for `a-docs/roles/owner.md` — because the block was structurally dependent on item 1. But for the other role files (`curator.md`, `tooling-developer.md`, `runtime-developer.md`), the brief only said "remove item 1 and renumber," without explicitly noting that those files also contained new-session format blocks that would be vestigial after item 1's removal. The Curator correctly inferred the removal was needed and flagged it as an open question, but the inference step should not have been necessary. The brief should have explicitly scoped vestigial-dependent content removal consistently across all target files, not only the first one where the pattern was noticed. — `02-owner-to-curator-brief.md`; Curator finding #2

### Workflow Friction
- **Completion artifact contained a machine-specific absolute path.** The Runtime Developer's Track B completion artifact (`06b-runtime-developer-to-owner.md`) included a `file://` absolute path in its handoff block. This violates the path portability rule ("Never use machine-specific absolute paths or `file://` URLs"). At Forward Pass Closure, I verified the correctness of the code change but did not check the completion artifact's handoff format for portability compliance. The error was harmless here — the artifact was the terminal node of Track B and the path was not actually used for routing — but it is a format violation that went uncaught. A FPC checklist item for "verify artifact paths in all track completion artifacts are relative" would catch this class of error. — `06b-runtime-developer-to-owner.md`

---

## Top Findings (Ranked)

1. **Schema-code coupling check missing from intake** — When a documentation change modifies a schema with a programmatic consumer (type definition, parser, validator), the Owner has no explicit intake prompt to check for the code counterpart. This caused a scope fragmentation error that was caught externally by the human. The fix belongs in the intake scope assessment, either in `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality or in the Post-Confirmation Protocol. Generalizable: applicable to any project with documentation + code layers. — `$A_SOCIETY_OWNER_ROLE`; `$GENERAL_OWNER_ROLE`

2. **Removal briefs should explicitly scope vestigial dependent content** — When a brief scopes removal of an item that other content depends on (e.g., a format block gated on the removed item), all dependent content removals should be explicitly listed, not just the first instance noticed. The existing "obsoletes check" in Brief-Writing Quality covers adding content; it does not explicitly cover this removal-of-dependents pattern. — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality; `$GENERAL_OWNER_ROLE` Brief-Writing Quality

3. **FPC does not currently verify handoff format portability in track completion artifacts** — Forward Pass Closure confirmed that all work was executed, but did not catch a `file://` path in the Track B completion artifact. For flows with multiple tracks, FPC should verify path format in all convergence artifacts, not just functional completeness. — `$A_SOCIETY_OWNER_ROLE` Forward Pass Closure Discipline; `$GENERAL_OWNER_ROLE`

---

## Generalizable Findings

- **Schema-code coupling check at intake (Top Finding 1):** Applies to any project that has both documentation artifacts defining schemas or interfaces and code that implements them. When a schema is being changed in documentation, the Owner should check whether corresponding implementation code also needs to change, and scope both in the same flow. This is a general brief-writing quality rule, not specific to A-Society.

- **Removal-of-dependents scoping (Top Finding 2):** When a brief removes an item from a numbered or structured list, it should explicitly enumerate any content in that same file (or sibling files) that depends on the removed item — even if the dependency seems obvious. Applies to any project with structured role or instruction documents.

---

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260331-session-routing-removal/10-owner-findings.md
```
