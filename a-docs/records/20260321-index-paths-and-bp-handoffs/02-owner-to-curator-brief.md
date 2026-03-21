---
**Subject:** Index path prohibition and backward pass handoff completeness — 2 changes
**Status:** BRIEFED
**Date:** 2026-03-21

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$INSTRUCTION_INDEX` | additive |
| `$GENERAL_IMPROVEMENT` | additive |

---

### Change 1 — `$INSTRUCTION_INDEX`: Absolute path prohibition and repo-relative path guidance `[Requires Owner approval]` `[additive]`

**Problem:** The Ink test run produced an index where all 29 entries were machine-specific absolute paths (e.g., `/home/kartik/Metamorphosis/ink/a-docs/agents.md`). This violates the portability hard constraint: an index populated with absolute paths breaks when the project moves to a different machine or account. The framework currently has no explicit rule against this.

A secondary pattern also appeared: during workflow handoffs, the Writer invented `$INK_ROOT` as an unregistered variable to reference a file in the project root. This happened because no registered path covered that location, and the agent felt compelled to create a variable anchor. The result was a variable reference that resolved to nothing.

**Fix:**
Add two rules to `$INSTRUCTION_INDEX`:

1. **Path format rule:** All paths in an index table must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Machine-specific absolute paths (e.g., `/home/user/...`, `/Users/...`) are prohibited. Agents populating an index must use repo-relative paths regardless of how they obtained the path during file operations.

2. **Unregistered file guidance:** For files not individually registered in the index (e.g., active working files that change per flow), agents should reference them by their repo-relative path directly in handoffs and artifacts — not by inventing unregistered variables. Only files that are stable, reused across sessions, and warrant a stable variable name belong in the index.

---

### Change 2 — `$GENERAL_IMPROVEMENT`: Backward pass handoff completeness `[Requires Owner approval]` `[additive]`

**Problem:** During the Ink backward pass, handoff quality degraded across the chain. The Editor's handoff to the Writer dropped `template-findings.md` from the Read list and omitted the `Expected response:` field entirely. These fields were present in the Owner's backward pass initiation but not maintained by subsequent roles. The protocol currently specifies the three-field format for handoffs but does not explicitly require it to be maintained across the backward pass chain.

**Fix:**
Add an explicit completeness requirement to the backward pass section of `$GENERAL_IMPROVEMENT`: every handoff between backward pass roles must include all three fields — `Next action:`, `Read:`, and `Expected response:`. Each role producing a backward pass handoff is responsible for including all three before passing to the next role. Dropping a field is not permitted even when the receiving role could infer it from context.

---

## Scope

**In scope:** Two additive rules to two existing `general/` library files.

**Out of scope:** The workflow graph validator `human-collaborative` field gap — this is a tooling realignment item and will be routed separately through the Tooling Development workflow.

---

## Likely Target

- `$INSTRUCTION_INDEX` = `a-society/general/instructions/indexes/main.md`
- `$GENERAL_IMPROVEMENT` = `a-society/general/improvement/main.md`

---

## Open Questions for the Curator

None — both changes are fully specified. The proposal round is mechanical: draft the wording for each rule, verify placement within each target file, return for Owner review.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for index path prohibition and backward pass handoff completeness."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
