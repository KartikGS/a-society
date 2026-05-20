# Instruction: How to Create an `improvement/` Folder

This document explains how to create an `improvement/` folder for a project's a-docs. An improvement folder gives the project a structured, repeatable system for evolving its own documentation — capturing agent friction during execution and feeding it back through a lightweight improvement path.

---

## The Forward Pass and the Backward Pass

Every execution cycle in a project has two directions.

**The forward pass** is agents executing their roles: receiving work, producing artifacts, handing off to the next stage. This is the project's normal workflow.

**The backward pass** is agents reflecting on that execution at the framework layer: each participating role produces structured findings about what the project's agent infrastructure surfaced clearly, what it failed to surface, and what standing local framework surfaces should be corrected. After those findings are complete, the coordinating Owner produces one final framework-feedback artifact for A-Society.

**The backward pass is not periodic — it is coupled to every forward pass.** Roles do not independently "notice" things to fix out of band. The backward pass is what generates the raw material for local framework corrections and upstream A-Society feedback.

**Scope boundary:** The backward pass is for the project's framework surfaces — local `a-docs/`, local workflow/coordination docs, and local agent-facing tooling/runtime guidance. It is not the project's product-delivery workflow, bug tracker, or feature backlog.

---

## Backward Pass Traversal

In a graph-based workflow, the backward pass is ordered as follows:

1. **Identify first occurrences.** Take each role's *first occurrence* in the forward pass. Subsequent appearances of the same role are not counted separately — that role's backward-pass findings cover all their forward-pass phases.
2. **Reverse the sequence.** Reverse the first-occurrence sequence to get the backward order.
3. **Parallel forks produce concurrent backward-pass nodes.** Roles whose first occurrences are at the same forward-pass position (parallel fork) produce findings concurrently, not sequentially.
4. **Owner feedback is always last.** After all findings-producing roles complete meta-analysis, the Owner runs the final framework-feedback step.

**Example:** Forward pass `Owner → A → B + C (parallel) → A (reviews) → Owner (confirms)`. First occurrences in order: Owner, A, then B and C together. Backward sequence: B and C simultaneously → A → Owner findings → Owner feedback. A's second appearance (reviews) is absorbed into A's single backward-pass node.

Only the nodes and edges that fired during the instance under review are included. Dead branches are excluded.

---

## Local Correction Path + Final Feedback

After a role identifies framework friction during meta-analysis:

- **Owned local standing surfaces** — fix them directly during meta-analysis.
- **Owner-owned local governance surfaces** — the Owner fixes them during Owner meta-analysis.
- **Historical records** — never rewrite them.
- **Upstream A-Society changes** — record them for the final framework-feedback artifact instead of editing upstream surfaces directly from the local backward pass.

The final feedback step is not a local maintenance routing loop. It produces one artifact for A-Society-wide feedback:
- potential additions or changes to `general/`
- runtime/tooling feature requests
- cross-project patterns or anti-patterns
- framework-level workflow/documentation gaps

---

## What Is an `improvement/` Folder?

An `improvement/` folder contains one required component and one optional:

1. **Philosophy and protocol** (`main.md`) — required: the principles that govern how improvement decisions are made, combined with the backward pass protocol
2. **Phase-specific instruction files** (`meta-analysis.md`) — optional: present when the project uses a programmatic runtime that injects session context into backward pass agents. See **Project-Specific Phase Files (Runtime)** below.

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
- How to run a backward pass: who produces findings, traversal order, output format, and the final feedback path
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

## Project-Specific Phase Files (Runtime)

When a project uses a programmatic runtime that orchestrates backward pass sessions, the runtime injects phase instructions directly rather than relying on agents to load them from required-reading lists. Project-specific meta-analysis instructions live in the project's own `a-docs/improvement/`. The final feedback step is runtime-owned and uses `$A_SOCIETY_RUNTIME_FEEDBACK`.

**One project file is required when using the runtime:**

- **`improvement/meta-analysis.md`** — injected into backward pass meta-analysis sessions. Contains the project's reflection categories, output format rules, and completion signal schema.

**Creating this file:**

Base the file on the corresponding general framework template:
- `meta-analysis.md` → start from `$GENERAL_IMPROVEMENT_META_ANALYSIS`; resolve all `[PROJECT_*]` placeholders with values from the project's index

`[PROJECT_*]` placeholders to resolve for `meta-analysis.md` at minimum:
- `[PROJECT_RECORDS]` — the path to the project's records folder (e.g., `my-project/a-docs/records`)

**Registering these files:**

Add the meta-analysis file to the project's file path index as `$[PROJECT]_IMPROVEMENT_META_ANALYSIS`. See the Integration with the Index section below.

**When to create:**

Create this file when initializing a project that will use the programmatic runtime. If adding runtime support to an existing project, create it as part of runtime setup. It is not required for projects that run backward passes manually using agent sessions.

---

## Integration with the Index

Add all key files to the project's file path index. At minimum:

| Variable | Path | Description | Required? |
|---|---|---|---|
| `$[PROJECT]_IMPROVEMENT` | `/[project]/a-docs/improvement/main.md` | Improvement philosophy and backward pass protocol | Required |
| `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` | `/[project]/a-docs/improvement/meta-analysis.md` | Project-specific meta-analysis phase instructions — runtime injection target for backward pass meta-analysis sessions | Conditional: required when project uses programmatic runtime |

---

## Integration with the Workflow

The backward pass must be declared as a mandatory phase in the project's workflow document.

The workflow should specify:
- When the backward pass runs (after which phase)
- Who produces findings and where findings go

For traversal order, reference `$INSTRUCTION_IMPROVEMENT` — do not specify ordering locally. The improvement file is the authoritative source for the backward pass algorithm; the workflow declares the backward pass as part of the project's execution cycle.

---

## When to Create This Folder

The `improvement/` folder is a required initialization artifact for projects initialized by the runtime. Create it when the project's a-docs are first set up.

**Why:** The backward pass is the mechanism for collecting friction observations. Without it in place from the first execution cycle, friction goes untracked and cannot be analyzed. A project that defers the improvement folder loses signal from its earliest — often most instructive — cycles.
