# Instruction: How to Create an `improvement/` Folder

This document explains how to create an `improvement/` folder for a project's agent-docs. An improvement folder gives the project a structured, repeatable system for evolving its own documentation — capturing agent friction, synthesizing fixes, and implementing changes without disrupting normal work.

---

## The Forward Pass and the Backward Pass

Every execution cycle in a project has two directions.

**The forward pass** is agents executing their roles: receiving work, producing artifacts, handing off to the next stage. This is the project's normal workflow.

**The backward pass** is agents reflecting on that execution: each agent who participated in the forward pass produces a structured analysis of their experience — what was clear, what was ambiguous, what was missing from their role or context documents, what they had to infer that they shouldn't have had to. These are per-agent findings. The Curator (or equivalent synthesis role) receives all findings, synthesizes them into proposed a-docs changes, and brings approved changes through the standard review cycle.

In a graph-based workflow, the backward pass traverses the **path actually taken** by the instance under review — walking from the terminal node back to the entry node. In a branching graph, only the edges that fired during this instance are reviewed; not every possible path in the graph definition. Each node's agent reviews its output against the input it received on the traversed path.

**The backward pass is not periodic — it is coupled to every forward pass.** The Curator does not independently observe friction and "notice" things to fix. The backward pass is what generates the raw material the Curator synthesizes. Without a deliberate backward pass, the improvement protocol has nothing to work from.

This is what "running the improvement protocol" means in practice: after each forward pass, each participating agent produces their findings, the Curator synthesizes, and the result is a-docs that reflect how the project actually works — not how it worked at initialization.

---

## What Is an `improvement/` Folder?

An `improvement/` folder contains three components:

1. **Philosophy** (`main.md`) — the principles that govern how improvement decisions are made
2. **Protocol** (`protocol.md`) — the step-by-step process for running a backward pass and synthesizing findings into a-docs changes
3. **Reports** (`reports/`) — the folder where all improvement output artifacts are stored

Together they answer: "How does this project's a-docs stay aligned with how the project actually works?"

---

## Why a Dedicated Folder?

Without a dedicated improvement folder:
- Improvement philosophy gets buried in role files or lost in conversation history
- Meta-analysis reports scatter across the project without a clear home
- Each improvement cycle reinvents how to run it

A dedicated folder separates improvement infrastructure from normal execution infrastructure. The process of improving the docs does not pollute the docs used for execution.

---

## The Three Components

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

### `protocol.md` — Improvement Protocol

**What it is:** The step-by-step process for running a meta-analysis cycle — from capturing per-agent findings, to synthesizing them, to implementing approved fixes.

**What belongs here:**
- The hybrid operating model (task-linked meta vs. alignment cycles)
- Phase definitions (Phase 1: findings, Phase 2: synthesis, Phase 3: implementation)
- Role assignments for each phase
- Decision ownership table
- Role health indicators and escalation thresholds
- Guardrails

**What does not belong here:**
- Improvement philosophy (that goes in `main.md`)
- The actual report files (those go in `reports/`)
- Workflow documents for the project's main execution (those go in `workflow/`)

**Starting point:** Use `$GENERAL_IMPROVEMENT_PROTOCOL` as the template. Customize:
- Replace `[PROJECT_*]` placeholders with `$VARIABLE_NAME` values from your index
- Update role names to match your project's roles
- Adjust the cadence (e.g., "every 3 completed tasks") to fit your project's pace
- Update output paths to point to your `reports/` folder

---

### `reports/` — Reports Folder

**What it is:** The storage location for all improvement artifacts — lightweight summaries, per-agent findings, synthesis documents, and alignment backlogs.

**What belongs here:**
- `main.md` — index of the reports folder with naming conventions and template references
- One file per report, following the naming convention from the protocol
- Template files for each report type (standalone starting points for new reports)

**What does not belong here:**
- Protocol or philosophy documents (those go in `main.md` and `protocol.md`)
- Plans, requirements, or feature artifacts (those go in `workflow/`)
- Non-improvement artifacts of any kind

**Starting point for `reports/main.md`:** Use `$GENERAL_IMPROVEMENT_REPORTS` as the template.

**Starting point for template files:**
- Lightweight summary: `$GENERAL_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT`
- Per-agent findings: `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`
- Synthesis: `$GENERAL_IMPROVEMENT_TEMPLATE_SYNTHESIS`
- Alignment backlog: `$GENERAL_IMPROVEMENT_TEMPLATE_BACKLOG`

---

## Integration with the Index

Add all key files to the project's file path index. At minimum:

| Variable | Path | Description |
|---|---|---|
| `$[PROJECT]_IMPROVEMENT` | `/[project]/a-docs/improvement/main.md` | Improvement philosophy — principles for doc improvement decisions |
| `$[PROJECT]_IMPROVEMENT_PROTOCOL` | `/[project]/a-docs/improvement/protocol.md` | Meta improvement protocol — phases, roles, and guardrails |
| `$[PROJECT]_IMPROVEMENT_REPORTS` | `/[project]/a-docs/improvement/reports/main.md` | Improvement reports index — naming conventions and template links |
| `$[PROJECT]_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT` | `/[project]/a-docs/improvement/reports/template-lightweight.md` | Lightweight synthesis template |
| `$[PROJECT]_IMPROVEMENT_TEMPLATE_FINDINGS` | `/[project]/a-docs/improvement/reports/template-findings.md` | Per-agent findings template |
| `$[PROJECT]_IMPROVEMENT_TEMPLATE_SYNTHESIS` | `/[project]/a-docs/improvement/reports/template-synthesis.md` | Synthesis template |
| `$[PROJECT]_IMPROVEMENT_TEMPLATE_BACKLOG` | `/[project]/a-docs/improvement/reports/template-backlog.md` | Alignment backlog template |

---

## Integration with the Improvement Agent Role

If the project has an Improvement Agent role, that role's context loading must include:
- `$[PROJECT]_IMPROVEMENT` — the philosophy governing improvement decisions
- `$[PROJECT]_IMPROVEMENT_PROTOCOL` — the process the agent executes

The role file should cross-reference both with the exact `$VARIABLE_NAME`.

---

## When to Create This Folder

Create an `improvement/` folder when:
- The project has run at least a few task cycles and has accumulated real friction observations
- The project has an Improvement Agent role (or plans to have one)
- Ad-hoc improvement sessions have happened and need to be standardized

A new project with no execution history can defer this folder until friction has been observed. The protocol is most useful when it has real findings to apply to.
