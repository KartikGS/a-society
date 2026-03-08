# A-Society: Backward Pass Protocol

## Purpose

Standardize how Owner and Curator reflect on completed framework work and turn that reflection into documentation improvements.

This protocol is A-Society's instantiation of `$GENERAL_IMPROVEMENT_PROTOCOL`. A-Society has two roles: Owner (synthesis) and Curator (implementation). Both produce findings; the Curator synthesizes actionable items and proposes them through the standard workflow.

---

## The Idea

Every forward pass (Phases 1–4 of `$A_SOCIETY_WORKFLOW`) is followed by a backward pass. Each agent who participated produces a findings artifact reflecting on their experience — what the a-docs got right, what was missing, what was ambiguous, what would have made the execution smoother.

Findings that warrant action re-enter the workflow as new trigger inputs for Phase 1 (Proposal). They are proposed, reviewed, implemented, and registered through the same phases as any other framework work. There is no separate improvement workflow.

---

## When to Run

Run after every substantive forward pass — work that involved multiple phases or touched structural decisions. For trivial single-file edits where no friction was experienced, the backward pass can be skipped.

**Depth:**
- **Lightweight:** 1–3 top findings, brief rationale. Use for routine work.
- **Full:** Structured findings using the template. Use when blocking friction, ambiguity, or contradictions were encountered.

The agent decides which depth is appropriate. If unsure, default to lightweight.

---

## How It Works

1. **Curator produces findings first** (closest to implementation friction).
2. **Owner produces findings second**, reviewing Curator findings and adding strategic-level observations.
3. **Output:** The next sequenced artifact in the active record folder — e.g., `04-curator-findings.md`, `05-owner-findings.md`. See `$A_SOCIETY_RECORDS` for the naming convention.
4. **Template:** `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`
5. **Curator synthesizes** actionable items from both findings artifacts and, if actionable items exist, initiates a new trigger input for Phase 1 (Proposal). A new flow begins with a new record folder.
6. **Approved changes** proceed through the workflow: Proposal → Owner Review → Implementation → Registration.

---

## Reflection Categories

Use these to guide your reflection (not all will apply every time):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution.

---

## Useful Lenses

When evaluating whether a finding warrants action:

- **Portability:** Should the fix propagate to `general/`, or is it A-Society-specific?
- **Evolvability:** Does the fix reduce future edit cost?
- **Proportionality:** Is the fix worth the disruption?

These are judgment aids, not mandatory per-finding assessments.

---

## Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports. They are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Agents reflecting should not produce plans, implementations, or new artifacts beyond their findings file.
