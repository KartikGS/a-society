# Instruction: How to Create an `improvement/` Folder

This document explains how to create an `improvement/` folder for a project's a-docs. An improvement folder gives the project a structured, repeatable system for evolving its own documentation — capturing agent friction during execution and feeding it back through a lightweight improvement path.

---

## What Is an `improvement/` Folder?

An `improvement/` folder contains two required components:

1. **Philosophy and protocol** (`main.md`) — the principles that govern how improvement decisions are made, combined with the backward pass protocol
2. **Phase-specific instruction files** (`meta-analysis.md`) — injected by the runtime into backward pass agent sessions. See **Project-Specific Phase Files (Runtime)** below.

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
- Reflection categories to guide agents
- Guardrails

**What does not belong here:**
- Feature or product improvement ideas (those go in the project's change request system)
- Workflow documents for the project's main execution (those go in `workflow/`)

**Scope boundary:** The backward pass covers the project's framework surfaces — local `a-docs/`, workflow and coordination docs, and agent-facing tooling/runtime guidance. It is not the project's product-delivery workflow, bug tracker, or feature backlog.

**Starting point:** Use `$GENERAL_IMPROVEMENT` as the template. The principles and backward pass protocol are project-agnostic and can be adopted largely verbatim. Customize:
- Replace `[PROJECT_*]` placeholders with `$VARIABLE_NAME` values from your index
- Update role names to match your project's roles

---

## Project-Specific Phase Files (Runtime)

The runtime injects phase instructions into backward pass sessions. Project-specific meta-analysis instructions live in the project's own `a-docs/improvement/`.

**Required project file:**

- **`improvement/meta-analysis.md`** — injected into backward pass meta-analysis sessions. Contains the project's reflection categories, output format rules, and completion signal schema.

**Creating this file:**

Base the file on the corresponding general framework template:
- `meta-analysis.md` → start from `$GENERAL_IMPROVEMENT_META_ANALYSIS`; resolve all `[PROJECT_*]` placeholders with values from the project's index

**Registering these files:**

Add the meta-analysis file to the project's file path index as `$[PROJECT]_IMPROVEMENT_META_ANALYSIS`. See the Integration with the Index section below.

**When to create:**

Create this file when initializing the project. If adding to an existing project, create it as part of runtime setup.

---

## Integration with the Index

Add all key files to the project's file path index. At minimum:

| Variable | Current Path | Description |
|---|---|---|
| `$[PROJECT]_IMPROVEMENT` | `[project]/a-docs/improvement/main.md` | Improvement philosophy and backward pass protocol |
| `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` | `[project]/a-docs/improvement/meta-analysis.md` | Project-specific meta-analysis phase instructions — runtime injection target for backward pass meta-analysis sessions |

---

## When to Create This Folder

The `improvement/` folder is a required initialization artifact for projects initialized by the runtime. Create it when the project's a-docs are first set up.

**Why:** The backward pass is the mechanism for collecting friction observations. Without it in place from the first execution cycle, friction goes untracked and cannot be analyzed. A project that defers the improvement folder loses signal from its earliest — often most instructive — cycles.

---

## Maintenance Rules

Copy these rules into the project's `improvement/main.md` at initialization. They govern how the improvement folder is updated over its lifetime.

- **Update `main.md` when the improvement philosophy changes.** If the project changes how it decides to split, consolidate, or scope improvement work, update the philosophy. Do not update it to reflect individual backward-pass outcomes — those belong in flow records.
- **Update `meta-analysis.md` when reflection categories change.** If backward-pass findings consistently fall outside the existing categories, add a category. If a category produces no findings over multiple flows, consider whether it is still earning its place.
- **Never rewrite historical records to match updated standards.** Improvement in a-docs applies forward. Closed flow records are immutable.
- **Scope boundary is a hard rule.** The backward pass is for framework surfaces only. Product issues, feature ideas, and performance observations discovered during meta-analysis belong in the project's change request system, not in improvement findings.

**Correction path — applied during every backward pass:**
- **Owned local standing surfaces** — fix them directly during meta-analysis.
- **Owner-owned local governance surfaces** — the Owner fixes them during Owner meta-analysis.
- **Historical records** — never rewrite them.
