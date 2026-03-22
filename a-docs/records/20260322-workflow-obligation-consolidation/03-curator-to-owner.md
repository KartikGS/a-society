# Curator → Owner: Proposal / Submission

**Subject:** Workflow obligation consolidation — `$INSTRUCTION_WORKFLOW` forward pass closure (Change 3)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-22

---

## Trigger

Owner-to-Curator brief `02-owner-to-curator-brief.md` in this record folder. Changes 1 and 2 (`$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`) are implemented under Curator authority; this artifact proposes the LIB addition to `$INSTRUCTION_WORKFLOW` only.

---

## What and Why

Adopting projects need workflow documents to name a **forward pass closure** step and to inherit the two universal rules (current-flow scoping; synthesis-is-terminal) from the routing index without restating them. The instruction doc that teaches how to write a workflow document must require that element explicitly so every project’s workflow `main.md` stays aligned with the routing-index contract.

**Generalizability:** Any project with a workflow graph — software, writing, or research — must close the forward pass deliberately (log, tooling, execution verification) before the backward pass; the rule is process-level, not domain-specific.

---

## Where Observed

A-Society — internal. Owner brief consolidated three Next Priority items; routing index (`$A_SOCIETY_WORKFLOW`) now holds universal rules; `general/` must encode the authoring requirement.

---

## Target Location

`$INSTRUCTION_WORKFLOW` — `a-society/general/instructions/workflow/main.md`

---

## Draft Content

Edits are **additive** with renumbering as specified in the brief.

### 3a — "What Belongs in a Workflow Document"

Insert a new **### 6. Forward Pass Closure (mandatory)** between the current item 5 (Session Model) and the current item 6 (Backward Pass). Renumber the current **Backward Pass** section header from **### 6.** to **### 7.**

**New section text:**

### 6. Forward Pass Closure (mandatory)

What happens when the forward pass ends? Every workflow document must name a forward pass closure step — the terminal node of the forward pass, which runs before the backward pass begins. This step is where the workflow consolidates its closure obligations: updating the project log, invoking any required tooling, and verifying that all approved tasks have been executed, not merely approved. Scattering these obligations across role documents and coordination protocols means they are invisible at the point they are needed; naming a closure step makes them visible and checkable.

The two universal rules governing forward pass closure are stated in the project's workflow routing index (see the "Forward Pass Closure" section). Every workflow's closure step inherits those rules without restating them.

**Existing ### 6. Backward Pass** becomes **### 7. Backward Pass** (body unchanged aside from heading number).

### 3b — "How to Write One"

Insert a new step between the current Step 6 (Describe the session model) and the current Step 7 (Define the backward pass). Renumber: current Steps 7, 8, 9 → Steps 8, 9, 10.

**New Step 7 text:**

**Step 7 — Define the forward pass closure step.**
Name the closure obligations for this workflow — what the terminal Owner node must confirm and execute before declaring the forward pass closed. Do not restate the two universal rules (current-flow scoping and synthesis-is-terminal) — reference the workflow routing index instead.

**Renumber existing steps:**
- Current **Step 7 — Define the backward pass.** → **Step 8 — Define the backward pass.**
- Current **Step 8 — Identify sub-documents.** → **Step 9 — Identify sub-documents.**
- Current **Step 9 — Cut what does not belong.** → **Step 10 — Cut what does not belong.**

---

## Update Report Draft

Omitted — change is instructional LIB alignment with an existing Owner brief; not assessed as requiring a published framework update report under `$A_SOCIETY_UPDATES_PROTOCOL`. Owner may override if a report should ship with approval.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` (or next sequenced `owner-to-curator` artifact) with one of:

- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not edit `$INSTRUCTION_WORKFLOW` until the decision artifact shows **APPROVED** status.

---

## Implementation status (for Owner context)

| Change | Target | Status |
|--------|--------|--------|
| 1 | `$A_SOCIETY_WORKFLOW` — Forward Pass Closure section | **Implemented** |
| 2 | `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Session Model Step 6 | **Implemented** |
| 3 | `$INSTRUCTION_WORKFLOW` — 3a + 3b | **Awaiting Phase 2 decision** |
