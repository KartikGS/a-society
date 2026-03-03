# How to Create a Plans Document

## What Is a Plans Document?

A plans document (or plan template) defines how execution plans are structured within a project. It answers:

> "When an agent is about to execute a unit of work, how do they record their technical decisions, delegation choices, and definition of done?"

A plan is not a requirements document. Requirements describe *what* to build and *why*. A plan describes *how* the work will be done — the technical approach, the sequence of steps, who executes what, and what must be true when it is finished.

The plans document serves two audiences:
1. **The agent creating the plan** — it gives them a standard structure to follow, preventing omissions.
2. **Agents and reviewers reading the plan** — it ensures every plan contains the information needed to execute and verify the work.

---

## Why Every Project Needs One

Without a standard plan structure, agents invent their own. The first plan might focus on technical approach; the second might focus on task delegation; the third might be a bullet list. When someone else needs to review, verify, or continue the work from the plan, they must first decode a novel format.

Standardized plans reduce this cost:
- Reviewers know where to look for the delegation strategy.
- Verifiers know where the Definition of Done is.
- Historical plans become searchable and comparable.
- New agents can onboard to a CR by reading the plan without asking the author to re-explain their decisions.

**A plan template is a forcing function for complete thinking — and a shared language for reviewing it.**

---

## What Belongs in a Plan

A plan document for any project should cover:

### 1. Technical Analysis (mandatory)
What is the current state? What are the key challenges or constraints? This section forces the planner to demonstrate they have understood the problem before proposing a solution.

### 2. Discovery Findings (mandatory when probing was required)
What was learned from pre-plan investigation? Resolved wildcards, validated assumptions, confirmed contracts. This section shows the plan is grounded in evidence, not inference.

### 3. Implementation Decisions (mandatory)
What specific choices did the planner make that the executor would otherwise have to guess? For every decision point in the implementation, the planner must name the choice and the rationale. "None" is a valid entry when the BA spec was fully deterministic.

### 4. Proposed Changes (mandatory)
What will change? List files, components, or modules affected. Include architectural impacts if any.

### 5. Delegation & Execution Order (mandatory for multi-role work)
Who executes which step, and in what order? For parallel vs. sequential execution, explain the dependency logic that determined the order.

### 6. Definition of Done (mandatory)
What must be true for this plan to be considered complete? DoD items must be verifiable — not "looks good" but "build passes" or "test X asserts Y."

### 7. Operational Checklist (recommended)
Common cross-cutting concerns that apply to most plans: environment variables, observability, rollback strategy. These are reminders, not requirements — mark N/A when genuinely inapplicable.

---

## What Does NOT Belong

- **Requirements** — the plan references requirements; it does not repeat or replace them.
- **Role definitions** — who the agents are belongs in role documents, not in the plan.
- **Completed work records** — a plan is a forward-looking document; completion evidence belongs in the completion report or the requirements artifact at closure.

---

## Naming and Storage

Plans should be stored in a `workflow/plans/` folder within the project's agent-docs. The canonical naming pattern:
- One plan per unit of work, named with the work item's identifier: `CR-XXX-plan.md`, `TASK-XXX-plan.md`, etc.
- Historical plans are retained and not deleted after closure — they are the permanent record of how a decision was made.
- A `main.md` file in the plans folder contains the standard template (this document's purpose).

---

## How to Write a Plan Template

**Step 1 — Define the required sections.**
List every section that must be present in every plan. For each section, state whether it is mandatory or conditional, and what "empty but addressed" looks like (e.g., writing "none" rather than leaving a section blank).

**Step 2 — Write prompts for each section.**
Each section should include a brief description of what belongs there and what a common mistake looks like. The template is a checklist and a reminder, not just a blank form.

**Step 3 — Define the DoD format.**
Specify how Definition of Done items should be written. The goal is verifiability: a DoD item that cannot be checked by a third party is not a DoD item.

**Step 4 — Add conditional sections.**
Some project types require additional plan sections (e.g., a "Contract Delta Assessment" for projects with API contracts, or an "Architecture-Only Freeze Checklist" for refactor work). Define these as conditional sections with clear trigger conditions.

**Step 5 — Keep the template concise.**
A plan template that is too long will be filled in mechanically. Every section should earn its place by preventing a common class of errors or omissions.

---

## Format Rules

- **Forward-looking language.** Plans describe what will be done, not what was done. Completion evidence belongs elsewhere.
- **Decision-explicit.** Every technical choice in the plan should be traceable to a stated rationale. "I chose X" without a "because" is incomplete.
- **Conditional sections use explicit triggers.** If a section only applies under certain conditions, state the condition clearly: "Complete this section only if the CR affects route contracts."
- **DoD items are verifiable.** Replace vague DoD items ("system works correctly") with observable outcomes ("pnpm build exits with code 0").
