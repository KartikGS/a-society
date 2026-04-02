---
workflow:
  name: A-Society Multi-Domain Development (illustrative)
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: direction
    - id: ta-design
      role: Technical Architect
    - id: tooling-implementation
      role: Tooling Developer
    - id: runtime-implementation
      role: Runtime Developer
    - id: ta-integration
      role: Technical Architect
    - id: owner-integration-gate
      role: Owner
      human-collaborative: approval
    - id: curator-proposal
      role: Curator
    - id: owner-curator-approval
      role: Owner
      human-collaborative: approval
    - id: curator-implementation
      role: Curator
    - id: owner-closure
      role: Owner
      human-collaborative: closure
  edges:
    - from: owner-intake
      to: ta-design
      artifact: owner-to-ta-brief
    - from: ta-design
      to: tooling-implementation
      artifact: ta-advisory
    - from: ta-design
      to: runtime-implementation
      artifact: ta-advisory
    - from: tooling-implementation
      to: ta-integration
      artifact: completion-report
    - from: runtime-implementation
      to: ta-integration
      artifact: completion-report
    - from: ta-integration
      to: owner-integration-gate
      artifact: ta-integration-report
    - from: owner-integration-gate
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-curator-approval
      artifact: curator-to-owner
    - from: owner-curator-approval
      to: curator-implementation
      artifact: owner-to-curator
    - from: curator-implementation
      to: owner-closure
      artifact: curator-to-owner
    - from: owner-curator-approval
      to: curator-proposal
      artifact: owner-to-curator
---

# A-Society: Multi-Domain Development Pattern

This document describes how to run **one unit of work** that spans **multiple A-Society domains** (framework documentation in `a-docs/` and `general/`, tooling in `tooling/`, runtime in `runtime/`, and related roles) using **parallel tracks** within a **single flow**. It is a **composition pattern**, not a fourth permanent workflow alongside Framework Development, Tooling Development, and Runtime Development.

**Summary:** Coordinate cross-domain work in one record folder with a `workflow.md` graph that forks after planning, runs independent implementation tracks in parallel, joins for integration review, then routes through Owner and Curator as needed.

**Graph:** The YAML frontmatter above is an **illustrative** subgraph — real flows add, remove, or rename nodes and edges per the Owner workflow plan. It is not a mandatory canonical graph.

---

## When to use

Use this pattern when **all** of the following hold:

- One feature or decision thread requires work in **more than one** of: framework docs / `general/`, tooling implementation, runtime implementation, or other roles that can proceed in parallel after a shared planning or design phase.
- Tracks are **independent until a join** (e.g., integration review, Owner gate).
- Splitting the work into **separate flows** solely because it touches multiple workflow types would **fragment** the same unit of work.

Do **not** use this pattern when the project has two **permanent, distinct execution loops** — that is the **multiple distinct workflows** case in `$INSTRUCTION_WORKFLOW` (index-based routing).

---

## How this relates to the permanent workflows

| Workflow | Role |
|----------|------|
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | Library and documentation changes — proposal, Owner approval, implementation, registration. |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | Tooling layer — Phase 0 gate, component implementation, TA reviews. |
| `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` | Runtime layer — Phase 0 architecture gate, implementation, registration. |

A **multi-domain flow** **invokes** these workflows' **roles and conventions** as **phases** inside **one** record folder. It does **not** replace those documents: each workflow file still defines the full cadence for work that stays within that layer. The multi-domain pattern **stitches** layers together with a single `workflow.md` and one artifact sequence.

---

## Role map (typical)

| Role | Typical role in the pattern |
|------|-----------------------------|
| **Owner** | Intake, workflow plan, briefs, integration approval, Curator approval when `general/` changes require it, forward pass closure. |
| **Technical Architect** | Design advisory before parallel tracks; integration review after parallel implementation tracks converge. |
| **Tooling Developer** | One parallel track; implements tooling components per `owner-to-ta-brief` / owner approval. |
| **Runtime Developer** | Other parallel track when runtime work is in scope; same session model. |
| **Curator** | Parallel track when framework docs / `general/` work is in scope; **proposal → Owner approval → implement** when `general/` changes need Owner review per `$A_SOCIETY_CURATOR_ROLE`. |

Not every multi-domain flow includes all roles. Omit nodes that do not apply; keep the graph honest to the Owner workflow plan.

---

## Parallel tracks

After a **shared planning or TA design** phase, the graph may **fork** to two or more implementation nodes that run **concurrently**. Each track produces completion artifacts (e.g., completion reports) consumed by a **join** node — typically **TA integration review**, then **Owner integration gate**.

When more than one Developer track converges, require those completion artifacts to follow the shared completion-report contract in the relevant Developer role docs: labeled sections for modified files, implemented behavior, verification summary, deviations, and spec-update impact. Convergence review should compare like-for-like artifacts, not normalize different report shapes after the fact.


---

## Curator track and `general/` checkpoint

When a parallel track includes work that affects **`general/`**, the Curator follows the **Approval Invariant**: **no unilateral writes to `general/`** — proposal → Owner `APPROVED` → implement.

For flows where the Curator can run **in parallel** with implementation tracks, the graph may show **Curator** receiving an **Owner brief** in parallel with other tracks. When **Curator implementation** depends on **Owner approval** of a proposal, the graph includes:

- **Curator → Owner** (proposal artifact)
- **Owner → Curator** (decision artifact)
- **Curator** implementation phase

If the **only** `general/` work is Curator-owned and requires approval, the embedded loop is: **Curator (proposal) → Owner (approve) → Curator (implement)** — still within the **same** flow and record folder.

---



## Record folder and `workflow.md`

- Create a **record folder** under the A-Society records convention (`$A_SOCIETY_RECORDS`).

- Author **`workflow.md`** in the **nodes/edges** format with YAML frontmatter `workflow:` — **subgraph** for **this** flow only. See `$INSTRUCTION_WORKFLOW_GRAPH` and the record-folder variant for **record-folder** `workflow.md`.

- The **Backward Pass Orderer** (when available) reads `workflow.md` from the record folder; keep the graph consistent with actual artifacts and handoffs.

---

## See also

- `$INSTRUCTION_WORKFLOW` — **Multi-domain parallel-track flows (single workflow)** (general abstraction).
- `$A_SOCIETY_WORKFLOW` — routing index and cross-workflow rules.
