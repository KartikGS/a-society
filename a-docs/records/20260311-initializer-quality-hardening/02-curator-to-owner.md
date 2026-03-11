# Curator → Owner: Proposal / Submission

**Subject:** Initializer quality hardening — shell prohibition, Phase 2 scope, Phase 4 disclosure, and agents.md instruction fixes
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Owner briefing `01-owner-to-curator-brief.md` in record `20260311-initializer-quality-hardening`. A test run of the Initializer against a seed-file project surfaced four quality gaps across `$A_SOCIETY_INITIALIZER_ROLE` and `$INSTRUCTION_AGENTS`.

---

## What and Why

Four distinct gaps, each with a concrete fix:

**Gap 1 — Shell/version control hallucination.** The Initializer attempted git operations with no basis in the protocol. Hard Rules prohibit writing outside `a-docs/` but are silent on shell commands. An explicit prohibition closes this gap unambiguously.

**Gap 2 — Phase 2 scope creep.** The Initializer offered to design project structure rather than asking about the human's intent. The clarification phase exists to fill information gaps, not to offer design services. A single clarifying sentence draws this line explicitly.

**Gap 3 — Phase 4 design decision disclosure.** The Initializer invented a naming convention and presented it as established fact in the review summary. Self-review must require the Initializer to surface invented design decisions and seek explicit human confirmation before proceeding. Currently it does not.

**Gap 4 — `$INSTRUCTION_AGENTS` reading order and authority hierarchy.** The instruction specifies the wrong reading order (vision before index), causing the Initializer to produce agents.md files where `$VAR` references in the required reading list cannot be resolved until after vision and structure are already listed. Additionally, Step 6 leaves the authority hierarchy unspecified, allowing the Initializer to invert it (placing the role document above the vision). Both must be fixed in the instruction.

---

## Where Observed

A-Society — a test run of the Initializer against a seed-file project (promo-agency).

---

## Target Location

- `$A_SOCIETY_INITIALIZER_ROLE` — Hard Rules, Phase 2, and Phase 4 sections
- `$INSTRUCTION_AGENTS` — Step 4 (required reading list) and Step 6 (authority hierarchy), plus the corresponding entry in "What Every agents.md Must Contain" section 4

---

## Draft Content

### Change 1 — Hard Rules: add shell/version control prohibition

Add a new bullet to the Hard Rules section of `$A_SOCIETY_INITIALIZER_ROLE`:

> **Do not execute shell commands or perform version control operations.** The Initializer's only writable actions are creating files in the target project's `a-docs/` and filing a signal report to `$A_SOCIETY_FEEDBACK_ONBOARDING`. No other operations are permitted — not git commands, not terminal operations, not modifications to any file outside these two locations.

Recommended placement: after the existing "Do not modify the target project's existing files" bullet, as this is a natural extension of the same constraint.

---

### Change 2 — Phase 2: add scope boundary for clarification questions

In the Phase 2 section of `$A_SOCIETY_INITIALIZER_ROLE`, after the existing instruction ("Present all ambiguities to the human in a single message. Frame each question specifically..."), add:

> Questions are for understanding what exists or what the human has already decided — not for offering design decisions. If a design gap exists (e.g., no established workflow, no file naming convention), surface it as a gap and ask the human how they want to address it. Do not offer to design it: "Should I establish a naming convention for you?" is out of scope. "Do you have an existing file naming convention?" is correct. The Initializer documents what the human has decided or can confirm; it does not design what the human has not yet decided.

---

### Change 3 — Phase 4: add design-decision disclosure check

In the Phase 4 self-review section of `$A_SOCIETY_INITIALIZER_ROLE`, the current self-review checklist has three bullets. Add a fourth:

> - Did you make any design decisions in the absence of explicit user direction (e.g., invented naming conventions, file structures, workflow steps, process models not present in the project's files or the human's answers)? If yes, list each decision explicitly in the presentation and ask the human to confirm or correct before proceeding to Phase 5. Presenting invented decisions as established fact is a critical self-review failure.

---

### Change 4a — `$INSTRUCTION_AGENTS` Step 4: correct required reading order

**In "What Every agents.md Must Contain", section 4 (Required reading list):**

Current:
> "Typically: this file → vision → structure → index → role file. The role file is listed last because it may specify additional readings of its own."

Replace with:
> "Typically: this file → index → vision → structure → role file. **The index must come second** — before vision and structure — because those documents use `$VAR` references that cannot be resolved until the index is loaded. The role file is listed last because it may specify additional readings of its own."

**In "How to Write One", Step 4:**

Current:
> "Order matters. Start with `agents.md` itself (agents confirm they have read it), then vision, then structure, then index, then role file. If your project has additional universal required readings (e.g., a standards document every agent needs), insert them before the role file."

Replace with:
> "Order matters. Start with `agents.md` itself (agents confirm they have read it), then the index, then vision, then structure, then role file. **The index must come second** — before vision and structure — so that `$VAR` references in those documents can be resolved as agents read them. If your project has additional universal required readings (e.g., a standards document every agent needs), insert them before the role file."

**Note:** The examples in the "Examples Across Project Types" section use project-specific reading lists (vision, tooling, style guide, etc.) that do not necessarily include a generic index — these do not need to be changed, as they correctly reflect the flexibility agents.md allows once the mandatory components are in place.

---

### Change 4b — `$INSTRUCTION_AGENTS` Step 6: specify the authority hierarchy

**In "What Every agents.md Must Contain", section 6 (Authority and conflict resolution):**

Current:
> "When two documents give conflicting guidance, which takes precedence? State the resolution order explicitly. End with: 'if the conflict cannot be resolved using these sources, stop and ask the human.'"

Replace with:
> "When two documents give conflicting guidance, which takes precedence? **The expected authority hierarchy is: project vision (highest precedence) → project structure → role document → agents.md.** State this order explicitly. Do not invert it — placing the role document above the vision or structure inverts the intended hierarchy. End with: 'if the conflict cannot be resolved using these sources, stop and ask the human.'"

**In "How to Write One", Step 6:**

Current:
> "List the documents in precedence order. Three to five items is typical. End with the escalation to human."

Replace with:
> "List the documents in precedence order. **The expected hierarchy is: project vision → project structure → role document → agents.md.** Three to five items is typical. End with the escalation to human."

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
