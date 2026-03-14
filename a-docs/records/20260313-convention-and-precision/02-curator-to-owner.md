**Subject:** Convention and precision fixes — 2 changes
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-14

---

## Trigger

Owner brief `01-owner-to-curator-brief.md` identified two convention and precision gaps. Change 2 Part B — adding a Brief-Writing Quality section to `$GENERAL_OWNER_ROLE` — is a LIB change requiring Owner approval before implementation.

---

## What and Why

`$GENERAL_OWNER_ROLE` has no Brief-Writing Quality section. Without it, an Owner in any adopting project has no guidance on when to write a fully-specified brief and how to handle output-format changes. The gap leads to briefs that declare "Open Questions: None" when the output form is unresolved — forcing downstream roles into unacknowledged design decisions and producing revision cycles that a well-specified brief would have prevented.

**Generalizability argument:** Brief-writing quality is a universal Owner concern. The Owner writes briefs for downstream roles in every project — software, writing, research, or any other domain. The core principle (specify scope, target, and implementation approach; signal "Open Questions: None" explicitly) and the output-format exception (new fields, sections, or structural elements in an output are not mechanical — specify the expected form) apply equally across all project types. No A-Society-specific concepts appear in the proposed content.

---

## Where Observed

A-Society — internal. The root cause of revision cycles in the `20260312-handoff-copyable-prompt` flow was traced to a brief that declared "Open Questions: None" for a change that introduced a new output-format element without specifying the expected form. The Owner role file for A-Society (`$A_SOCIETY_OWNER_ROLE`) has a Brief-Writing Quality section; the general template (`$GENERAL_OWNER_ROLE`) does not.

---

## Target Location

`$GENERAL_OWNER_ROLE` — add a new `## Brief-Writing Quality` section after `## Context Loading`.

---

## Draft Content

Proposed new section for `$GENERAL_OWNER_ROLE`, to be inserted after `## Context Loading`:

---

**## Brief-Writing Quality**

When a change is fully derivable — no ambiguity about scope, target, or implementation approach — write a fully-specified brief. Cover all three dimensions explicitly and state **"Open Questions: None"** when there are none. This signals to the downstream role that no judgment calls are required: the proposal round becomes a confirmation step, not a design session.

Output-format changes are an exception. Any change that introduces a new required field, a new template section, or a new required structural element in the output is not mechanical — design decisions about what the output should look like are involved. A brief that introduces an output-format change must explicitly specify the expected output form. "Open Questions: None" is only correct when the output form is also fully derivable from the brief.

---

**Five review tests applied:**

1. **Generalizability test:** Passes. Brief-writing applies equally to a software project Owner writing a build brief, a writing project Owner writing an editorial brief, and a research project Owner writing a research brief. No domain-specific assumptions.

2. **Abstraction level test:** Passes. The guidance operates at the artifact level (briefs, output forms) without referencing any technology, workflow system, or project type. Actionable without being over-specified.

3. **Duplication test:** Passes. `$GENERAL_OWNER_ROLE` has no existing Brief-Writing Quality content. `$A_SOCIETY_OWNER_ROLE` has this section but it is the A-Society-specific instantiation; the proposed content is its project-agnostic counterpart. No overlap with any existing general template content.

4. **Placement test:** Passes. Brief-writing guidance belongs in the Owner role document — the Owner is the author of briefs. `general/roles/` is the correct folder for role-level guidance applicable to any project's Owner.

5. **Quality test:** Passes. A new Owner agent unfamiliar with the project can read two paragraphs and know: (a) when and how to write a fully-specified brief, (b) what "Open Questions: None" signals to the downstream role, and (c) that output-format changes require explicit specification of the expected output form and why. No additional explanation or context is required.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
