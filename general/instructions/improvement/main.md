# Instruction: How to Create an `improvement/` Folder

This document explains how to create an `improvement/` folder for a project's agent-docs. An improvement folder gives the project a structured, repeatable system for evolving its own documentation — capturing agent friction during execution and feeding it back into the workflow.

---

## The Forward Pass and the Backward Pass

Every execution cycle in a project has two directions.

**The forward pass** is agents executing their roles: receiving work, producing artifacts, handing off to the next stage. This is the project's normal workflow.

**The backward pass** is agents reflecting on that execution: each agent who participated in the forward pass produces a structured analysis of their experience — what was clear, what was ambiguous, what was missing from their role or context documents, what they had to infer that they shouldn't have had to. The synthesis role (typically the Curator) receives all findings, identifies actionable items, and proposes them through the standard workflow.

In a graph-based workflow, the backward pass traverses the **path actually taken** by the instance under review — walking from the terminal node back to the entry node. Only the edges that fired during this instance are reviewed.

**The backward pass is not periodic — it is coupled to every forward pass.** The Curator does not independently observe friction and "notice" things to fix. The backward pass is what generates the raw material the Curator synthesizes. Without it, the improvement system has nothing to work from.

**The key insight:** findings that warrant action re-enter the workflow as new trigger inputs. They proceed through the same proposal, review, and implementation phases as any other work. There is no separate improvement workflow.

---

## What Is an `improvement/` Folder?

An `improvement/` folder contains two required components and one optional:

1. **Philosophy** (`main.md`) — required: the principles that govern how improvement decisions are made
2. **Protocol** (`protocol.md`) — required: how to run a backward pass: who produces findings, in what format, and how findings flow back into the workflow
3. **Reports** (`reports/`) — optional: the storage location for backward pass findings, for projects that do not use a records structure

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

### `main.md` — Improvement Philosophy

**What it is:** The principles that govern how the project evaluates and decides on documentation changes. Not a workflow — a decision-making framework.

**What belongs here:**
- Principles for when to split files vs. consolidate
- Principles for when to create a new protocol vs. using the user consultation path
- Principles for keeping documentation single-purpose and cross-referenced
- The project's stance on doc improvement scope (what is in bounds, what is out)

**What does not belong here:**
- Step-by-step process (that goes in `protocol.md`)
- Historical improvement decisions (those go in `reports/`)
- Feature or product improvement ideas (those go in the project's change request system)

**Starting point:** Use `$GENERAL_IMPROVEMENT` as the template. The principles are project-agnostic and can be adopted largely verbatim. Add project-specific principles or examples if needed.

---

### `protocol.md` — Backward Pass Protocol

**What it is:** The step-by-step process for running a backward pass — from capturing per-agent findings to feeding actionable items back into the workflow.

**What belongs here:**
- Who produces findings first and why (typically the role closest to implementation)
- The findings output format and location
- How findings flow back into the workflow (as new trigger inputs)
- Reflection categories to guide agents
- Guardrails

**What does not belong here:**
- Improvement philosophy (that goes in `main.md`)
- The actual report files (those go in `reports/`)
- Workflow documents for the project's main execution (those go in `workflow/`)

**Starting point:** Use `$GENERAL_IMPROVEMENT_PROTOCOL` as the template. Customize:
- Replace `[PROJECT_*]` placeholders with `$VARIABLE_NAME` values from your index
- Update role names to match your project's roles
- Specify who produces findings first (typically the role closest to implementation friction)

---

### `reports/` — Reports Folder (Optional)

**What it is:** The storage location for backward pass findings in projects that do not use a records structure.

If the project uses a records structure (see `$INSTRUCTION_RECORDS`), backward pass findings are sequenced artifacts within the record folder — not files in `reports/`. In that case, this folder may be omitted or repurposed for non-flow-specific improvement artifacts (e.g., a periodic synthesis that spans multiple flows).

If the project does not use records, `reports/` is the required storage location for all backward pass findings.

**What belongs here (when used):**
- `main.md` — index of the reports folder with naming conventions and template references
- One file per backward pass findings report, following the naming convention from the protocol

**What does not belong here:**
- Protocol or philosophy documents (those go in `main.md` and `protocol.md`)
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
| `$[PROJECT]_IMPROVEMENT` | `/[project]/a-docs/improvement/main.md` | Improvement philosophy — principles for doc improvement decisions | Required |
| `$[PROJECT]_IMPROVEMENT_PROTOCOL` | `/[project]/a-docs/improvement/protocol.md` | Backward pass protocol — how findings are produced and flow back into the workflow | Required |
| `$[PROJECT]_IMPROVEMENT_REPORTS` | `/[project]/a-docs/improvement/reports/main.md` | Improvement reports index — naming conventions and template links | Optional: include only if the project uses `reports/` rather than a records structure for findings |

---

## Integration with the Workflow

The backward pass should be declared as a phase in the project's workflow document. It is the structured counterpart to the forward pass — not a separate system.

The workflow should specify:
- When the backward pass runs (after which phase)
- Who produces findings and in what order
- How actionable findings re-enter as standard workflow observations

The improvement protocol (`protocol.md`) provides the detailed how; the workflow declares the backward pass as part of the project's execution cycle.

---

## When to Create This Folder

Create an `improvement/` folder when:
- The project has run at least a few task cycles and has accumulated real friction observations
- Ad-hoc improvement sessions have happened and need to be standardized

A new project with no execution history can defer this folder until friction has been observed. The protocol is most useful when it has real findings to apply to.
