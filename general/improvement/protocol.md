# Backward Pass Protocol

> [CUSTOMIZE] Replace all `[PROJECT_*]` placeholders with the appropriate `$VARIABLE_NAME` values from your project's index. Update role names to match your project's structure.

## Purpose

Standardize how agents reflect on completed work and turn that reflection into documentation improvements. This is the backward pass — the structured counterpart to the forward pass of the project's workflow.

---

## The Idea

Every forward pass (agents executing work through the workflow) is followed by a backward pass (agents reflecting on what worked and what didn't in the a-docs). The backward pass generates findings. Findings that warrant action re-enter the workflow as new trigger inputs, where they are proposed, reviewed, implemented, and registered through the same phases as any other work.

There is no separate improvement workflow. The improvement loop *is* the workflow.

---

## When to Run

Run the backward pass after every substantive forward pass — any work that involved multiple phases or touched structural decisions. For trivial single-file edits where no friction was experienced, the backward pass can be skipped.

The depth of the backward pass should be proportional to the work:
- **Lightweight:** 1–3 top findings, brief rationale. Use for routine work.
- **Full:** Structured per-agent findings using the findings template. Use when blocking friction, ambiguity, or contradictions were encountered during the forward pass.

The agent decides which depth is appropriate. If unsure, default to lightweight.

---

## How It Works

1. **Each agent who participated in the forward pass** produces a findings artifact reflecting on their experience — what was clear, what was ambiguous, what was missing, what conflicted.

2. **Output location:** `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

3. **Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

4. **The synthesis role** (typically the Curator or equivalent) reviews all findings and identifies which warrant action.

5. **Actionable findings re-enter the workflow as new trigger inputs.** They are proposed, reviewed, and implemented through the standard workflow — no parallel process.

---

## What to Reflect On

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution. Vague findings ("the docs could be better") are not useful.

---

## Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Portability:** Is the fix specific to this project, or should it propagate to the general library?
- **Evolvability:** Does the fix reduce future edit cost (e.g., canonical source + cross-reference instead of duplication)?
- **Proportionality:** Is the fix worth the disruption? Small friction in a rare edge case may not warrant a doc change.

These are judgment aids, not mandatory per-finding assessments.

---

## Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports to match newer conventions. Reports are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Agents reflecting should not produce plans, implementations, or new artifacts beyond their findings file.
