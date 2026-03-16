---

**Subject:** Owner role and workflow instruction — complexity analysis references (2 changes)
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-16

---

## Trigger

Backward pass findings from `20260316-workflow-dynamic-complexity`, synthesized in `06-curator-synthesis.md`, surfaced two navigational gaps: neither Owner role document names complexity analysis at intake as a responsibility, and the primary workflow instruction entry point has no pointer to the intake routing instruction.

---

## What and Why

Two pointer-only additions that close navigational gaps without introducing new content.

**Change 1 — Owner role documents (both):** Complexity analysis at intake is now a core Owner responsibility — established in `$INSTRUCTION_WORKFLOW_COMPLEXITY` — but neither `$A_SOCIETY_OWNER_ROLE` nor `$GENERAL_OWNER_ROLE` reflects it. An Owner agent reading their role document has no path to the capability. The fix is a single clause added to the existing "Workflow routing" bullet in "Authority & Responsibilities."

**Change 2 — Workflow instruction (`$INSTRUCTION_WORKFLOW`):** The primary entry point for workflow guidance has no reference to the intake routing instruction. A new section parallel to "Modifying an Existing Workflow" resolves the gap — same format (brief explanation + pointer), same placement tier (working-with-an-existing-workflow operations).

---

## Where Observed

A-Society — internal. The gap is in A-Society's own agent-docs and general library, not in an adopting project.

---

## Target Location

- `$A_SOCIETY_OWNER_ROLE` — "Authority & Responsibilities" section, "Workflow routing" bullet
- `$GENERAL_OWNER_ROLE` — equivalent section
- `$INSTRUCTION_WORKFLOW` — new section inserted before "Modifying an Existing Workflow" (current line 266)

---

## Draft Content

### Change 1a — `$A_SOCIETY_OWNER_ROLE`

**Current:**
> **Workflow routing** — routing work into the appropriate workflow by default and directing the human to the next session

**Proposed:**
> **Workflow routing** — routing work into the appropriate workflow by default, including complexity analysis at intake to determine the proportional path through the workflow (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the human to the next session

---

### Change 1b — `$GENERAL_OWNER_ROLE`

**Current:**
> **Workflow routing** — routing work into the appropriate workflow by default and directing the user to the next session

**Proposed:**
> **Workflow routing** — routing work into the appropriate workflow by default, including complexity analysis at intake to determine the proportional path through the workflow (see the workflow complexity instruction), and directing the user to the next session

*Note: the general template uses generic document names rather than `$VAR` references, consistent with how other documents are referenced in that file (e.g., "The project workflow document(s)" in the context loading section). The pointer is unambiguous — there is one workflow complexity instruction in the library.*

---

### Change 2 — `$INSTRUCTION_WORKFLOW`

**Insert as a new section immediately before the "Modifying an Existing Workflow" section (currently line 266):**

```markdown
## Routing Complexity at Intake

When routing incoming work into an existing workflow, the Owner determines the proportional path through the graph — not all work warrants the full pipeline. For the five complexity axes, the three-tier routing model, and the intake routing procedure: see `$INSTRUCTION_WORKFLOW_COMPLEXITY`.

---
```

*Rationale for form: a parallel section matches the structure and weight of "Modifying an Existing Workflow" — both are short, both point to a companion instruction for the full procedure. A sentence appended to the modification section would conflate two distinct operations (intake routing vs. graph modification). A new section at this position groups both "working with an existing workflow" concerns before the format rules.*

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
