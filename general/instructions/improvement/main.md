# Instruction: How to Create an `improvement/` Folder

This document explains how to create an `improvement/` folder for a project's a-docs. An improvement folder gives the project a structured, repeatable system for evolving its own documentation — capturing agent friction during execution and feeding it back through a lightweight improvement path.

---

## The Forward Pass and the Backward Pass

Every execution cycle in a project has two directions.

**The forward pass** is agents executing their roles: receiving work, producing artifacts, handing off to the next stage. This is the project's normal workflow.

**The backward pass** is agents reflecting on that execution: each agent who participated in the forward pass produces a structured analysis of their experience — what was clear, what was ambiguous, what was missing from their role or context documents, what they had to infer that they shouldn't have had to. The synthesis role (typically the Curator) receives all findings, identifies actionable items, and routes them through the appropriate path.

**The backward pass is not periodic — it is coupled to every forward pass.** The Curator does not independently observe friction and "notice" things to fix. The backward pass is what generates the raw material the Curator synthesizes. Without it, the improvement system has nothing to work from.

---

## Backward Pass Traversal

In a graph-based workflow, the backward pass is ordered as follows:

1. **Identify first occurrences.** Take each role's *first occurrence* in the forward pass. Subsequent appearances of the same role are not counted separately — that role's backward-pass findings cover all their forward-pass phases.
2. **Reverse the sequence.** Reverse the first-occurrence sequence to get the backward order.
3. **Owner is always second-to-last.** Because Owner is the entry point for every workflow, Owner's first occurrence is always first in the forward pass — placing Owner second-to-last in the backward sequence.
4. **Synthesis role is always last.** The synthesis role (typically the Curator) synthesizes all findings and produces the final backward-pass output. It is always the final node in the backward pass.
5. **Parallel forks produce concurrent backward-pass nodes.** Roles whose first occurrences are at the same forward-pass position (parallel fork) produce findings concurrently, not sequentially.

**Example:** Forward pass `Owner → A → B + C (parallel) → A (reviews) → Owner (confirms)`. First occurrences in order: Owner, A, then B and C together. Backward sequence: B and C simultaneously → A → Owner → Curator synthesizes. A's second appearance (reviews) is absorbed into A's single backward-pass node.

Only the nodes and edges that fired during the instance under review are included. Dead branches are excluded.

---

## Synthesis Path

After the synthesis role collects all findings and identifies actionable items:

- **Changes within synthesis role authority** — doc corrections, clarifications, maintenance items the Curator owns: implement directly to a-docs without a formal proposal.
- **Changes requiring Owner judgment** — structural decisions, additions to `general/`, direction changes: submit to the Owner for approval; implement after approval.

a-docs improvement is a separate, lightweight path. It does not re-enter the project's main execution workflow — it runs on a shorter approval loop than the project's normal work product.

---

## What Is an `improvement/` Folder?

An `improvement/` folder contains one required component and one optional:

1. **Philosophy and protocol** (`main.md`) — required: the principles that govern how improvement decisions are made, combined with the backward pass protocol
2. **Reports** (`reports/`) — optional: the storage location for backward pass findings, for projects that do not use a records structure

Together they answer: "How does this project's a-docs stay aligned with how the project actually works?"

---

## Why a Dedicated Folder?

Without a dedicated improvement folder:
- Improvement philosophy gets buried in role files or lost in conversation history
- Backward pass findings scatter across the project without a clear home
- Each improvement cycle reinvents how to run it

A dedicated folder separates improvement infrastructure from normal execution infrastructure. The process of improving the docs does not pollute the docs used for execution.

---

## The Components

### `main.md` — Improvement Philosophy and Backward Pass Protocol

**What it is:** A single file combining the principles that govern how the project evaluates and decides on documentation changes with the step-by-step backward pass protocol.

**What belongs here:**
- Principles for when to split files vs. consolidate
- Principles for when to create a new protocol vs. using the user consultation path
- Principles for keeping documentation single-purpose and cross-referenced
- The project's stance on doc improvement scope
- How to run a backward pass: who produces findings, traversal order, output format, synthesis path
- Reflection categories to guide agents
- Guardrails

**What does not belong here:**
- Historical improvement decisions (those go in `reports/`)
- Feature or product improvement ideas (those go in the project's change request system)
- Workflow documents for the project's main execution (those go in `workflow/`)

**Starting point:** Use `$GENERAL_IMPROVEMENT` as the template. The principles and backward pass protocol are project-agnostic and can be adopted largely verbatim. Customize:
- Replace `[PROJECT_*]` placeholders with `$VARIABLE_NAME` values from your index
- Update role names to match your project's roles

---

### `reports/` — Reports Folder (Optional)

**What it is:** The storage location for backward pass findings in projects that do not use a records structure.

If the project uses a records structure (see `$INSTRUCTION_RECORDS`), backward pass findings are sequenced artifacts within the record folder — not files in `reports/`. In that case, this folder may be omitted or repurposed for non-flow-specific improvement artifacts (e.g., a periodic synthesis that spans multiple flows).

If the project does not use records, `reports/` is the required storage location for all backward pass findings.

**What belongs here (when used):**
- `main.md` — index of the reports folder with naming conventions and template references
- One file per backward pass findings report, following the naming convention from the protocol

**What does not belong here:**
- Protocol or philosophy documents (those go in `main.md`)
- Plans, requirements, or feature artifacts (those go in `workflow/`)
- Non-improvement artifacts of any kind

**Starting point for `reports/main.md`:** Use `$GENERAL_IMPROVEMENT_REPORTS` as the template.

**Starting point for template files:**
- Backward pass findings: `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`

---

## Integration with the Index

Add all key files to the project's file path index. At minimum:

| Variable | Path | Description | Required? |
|---|---|---|---|
| `$[PROJECT]_IMPROVEMENT` | `/[project]/a-docs/improvement/main.md` | Improvement philosophy and backward pass protocol | Required |
| `$[PROJECT]_IMPROVEMENT_REPORTS` | `/[project]/a-docs/improvement/reports/main.md` | Improvement reports index — naming conventions and template links | Optional: include only if the project uses `reports/` rather than a records structure for findings |

---

## Integration with the Workflow

The backward pass must be declared as a mandatory phase in the project's workflow document.

The workflow should specify:
- When the backward pass runs (after which phase)
- Who produces findings and where findings go

For traversal order, reference `$INSTRUCTION_IMPROVEMENT` — do not specify ordering locally. The improvement file is the authoritative source for the backward pass algorithm; the workflow declares the backward pass as part of the project's execution cycle.

---

## When to Create This Folder

The `improvement/` folder is a required initialization artifact. Create it alongside `thinking/` when the project's a-docs are first set up.

**Why:** The backward pass is the mechanism for collecting friction observations. Without it in place from the first execution cycle, friction goes untracked and cannot be analyzed. A project that defers the improvement folder loses signal from its earliest — often most instructive — cycles.
