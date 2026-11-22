---
title: Flow Types
description: How normal, initialization, and update flows differ in the A-Society runtime.
sources:
  - "Flow behavior, update rule, feedback location: runtime/INVOCATION.md (authoritative; this page summarizes)"
  - "UI labels: runtime/ui/src/components/ProjectSelector.tsx"
---

A flow is one unit of work with a durable record folder, workflow snapshot, role sessions, handoffs, and optional backward pass. The runtime uses different flow types for different moments in a project's lifecycle.

| Flow type | Where it starts | Primary purpose |
|---|---|---|
| Normal project flow | **Initialized** project -> **Records** -> **New** | Do project work through the project's own workflow. |
| Takeover initialization | **Uninitialized** project | Add a first-pass `a-docs/` harness to an existing project. |
| Greenfield initialization | **Create New Project** | Create a new project folder and initialize its first `a-docs/` harness. |
| Update flow | **Update** button on an initialized project | Migrate an existing `a-docs/` layer to the current A-Society framework version. |

---

## Normal project flows

Normal flows are the default once a project is initialized. Select an initialized project, open **Records**, and click **New**.

The runtime creates a record folder, seeds `record.yaml`, writes a draft `workflow.yaml`, and opens the Owner intake node. The Owner uses that first conversation to clarify the work and decide whether the flow stays Owner-only or expands to additional workflow nodes.

Normal flows are for project work: implementation tasks, documentation changes, review cycles, design work, research, or any other work the initialized project workflow supports.

---

## Initialization flows

Initialization flows create the project's first usable `a-docs/` layer. They are Owner-only flows with initialization-specific guidance injected by the runtime.

Initialization has two modes:

| Mode | When it starts | What changes |
|---|---|---|
| **Takeover** | You select an existing uninitialized project. | The runtime scaffolds `a-docs/` inside the existing project, then the Owner fills those surfaces from project evidence and human answers. |
| **Greenfield** | You create a new project from the runtime UI. | The runtime creates the project folder, scaffolds `a-docs/`, and the Owner asks the human for the project facts that do not exist yet. |

The goal is not a perfect final documentation layer. The goal is a usable first-pass harness: enough project truth, roles, workflow, indexes, and required readings for future normal flows to orient safely.

Initialization closes when the scaffolded `a-docs/` are populated enough for normal Owner-led work.

---

## Update flows

Update flows migrate an initialized project's `a-docs/` to the current A-Society framework version. They are offered only when the project's recorded `a_society_version` (in `a-docs/a-society-version.md`) is behind the current framework version by a **release line**: the minor version while A-Society is on 0.x, the major version from 1.0 on. Patch differences never offer an update. For example, a project on 0.3.0 is current with 0.3.3 but behind 0.4.0; a project on 1.2.0 is current with 1.9.0 but behind 2.0.0. The runtime refuses to start an update flow under the same rule.

An update flow is not for new project work. It is an Owner-only migration flow. The Owner reads the update brief, compares the changelog and current `general/` library against the project's existing `a-docs/`, applies the required structure or format changes, preserves project-specific truth, and bumps `a-docs/a-society-version.md` when the migration is complete.

Update flows keep writes inside the project's `a-docs/`.

---

## Backward pass and feedback

After the forward pass closes, the runtime can offer the same optional backward-pass choices for these flow types: graph-based meta-analysis, parallel meta-analysis, or none. If meta-analysis runs, the runtime can also ask whether to generate upstream feedback. The report is saved in your workspace at `.a-society/feedback/<project>-<kind>-<flow-id>.md`, where `<kind>` is `flow`, `update`, `initialization-greenfield`, or `initialization-takeover`. Nothing is sent; see [Runtime Guide — Feedback reports](/docs/runtime-guide#feedback-reports) for how to submit one.

The flow type changes the feedback focus:

| Flow type | Feedback focus |
|---|---|
| Normal | Reusable framework gaps, workflow friction, runtime issues, and cross-project patterns. |
| Initialization | What the runtime could infer, what required human input, and where scaffolding or initialization guidance caused friction. |
| Update | Whether the changelog and framework delta were clear enough to apply, and what was hard to reconcile with existing `a-docs/`. |

---

## Resuming a flow

Resuming is not a separate flow type. It reopens the same persisted flow state and continues from the active node, pending human prompt, consent decision, or interrupted turn.
