---

**Subject:** Workflow modification instruction
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-15

---

## Trigger

Owner/Human session identified a gap: no instruction exists for how to modify a workflow in an A-Society-initialized project. Brief filed at `a-society/a-docs/records/20260315-workflow-modification-instruction/01-owner-to-curator-brief.md` with agreed change, principles, hard rules, and scope.

---

## What and Why

This proposal creates `$INSTRUCTION_WORKFLOW_MODIFY` — a new instruction document in `general/instructions/workflow/` that tells agents how to modify an existing workflow in any A-Society-initialized project.

The instruction is built on one foundational insight from the Owner/Human session: a workflow is a single directed graph, the Owner node is the invariant entry point, and there is no add-vs-modify distinction — there is one operation: graph modification. Without this model, agents approaching workflow changes face a false binary ("new workflow or modified workflow?") and either over-engineer the structure or apply changes ad-hoc.

**Generalizability argument:** The single-graph model, the five principles, and the seven hard rules are domain-agnostic. A software project extending its execution workflow, a writing project adding a new review loop, and a research project restructuring its analysis phases all face the same structural constraints: session boundaries, role separation, approval gates, and traceability. No principle or rule in this instruction assumes a technical context. This instruction belongs in `general/`.

---

## Where Observed

A-Society — internal. Identified during an Owner/Human conversation about A-Society's own tooling workflow, where the absence of a modification instruction created ambiguity about how to correctly extend the existing graph.

---

## Open Question Resolutions

**Q1 — Placement:** `general/instructions/workflow/` is the correct location. The folder already contains `graph.md`, which includes explicit "Maintenance Rules" — meaning the folder's scope already extends beyond pure creation guidance to operational guidance on workflow artifacts. A `modify.md` is within the same natural scope. The structure document's "how do you create [X]" framing describes the default case for `general/instructions/`; it does not prohibit companion operational instructions for the same artifact type within an established sub-folder.

**Q2 — Cross-reference:** A cross-reference from `$INSTRUCTION_WORKFLOW` to `$INSTRUCTION_WORKFLOW_MODIFY` is warranted and is included as an in-scope co-implementation step. Target: a "Modifying an Existing Workflow" section added at the end of `general/instructions/workflow/main.md` before the format rules, pointing to `$INSTRUCTION_WORKFLOW_MODIFY`. This section is minimal — one paragraph — so it does not bloat the creation instruction; it is a navigation pointer only.

---

## Target Location

- **New file:** `$INSTRUCTION_WORKFLOW_MODIFY` → `/a-society/general/instructions/workflow/modify.md`
- **Index registration:** one new row in `$A_SOCIETY_INDEX` (`a-society/a-docs/indexes/main.md`)
- **Public index registration:** one new row in `$A_SOCIETY_PUBLIC_INDEX` (`a-society/index.md`)
- **Cross-reference:** one new section added to `$INSTRUCTION_WORKFLOW` (`a-society/general/instructions/workflow/main.md`)
- **a-docs-guide entry:** one new entry added to `$A_SOCIETY_AGENT_DOCS_GUIDE` (`a-society/a-docs/a-docs-guide.md`)

---

## Draft Content

### `/a-society/general/instructions/workflow/modify.md`

---

# How to Modify a Workflow

*This document is a companion to `$INSTRUCTION_WORKFLOW`. Read that document to create a workflow from scratch. Read this document when an existing workflow needs to change.*

---

## The Single-Graph Model

A workflow is a single directed graph. The Owner node is the invariant entry point — it never changes.

What appears to be "adding a new workflow" is structurally a graph modification: adding new branches from the Owner node. There is no add-vs-modify distinction. There is one operation: **graph modification**.

This model collapses a false binary. "Should I add a new workflow or modify the existing one?" is not the right question. The right question is: "what branch or structural change does this graph require?"

Because the Owner is always the entry point, every new flow type becomes a new branch accessible from the Owner node. The graph grows; it does not multiply.

---

## Principles

These are the evaluative criteria every modification must be held against. A modification that satisfies the hard rules but violates a principle is still a bad modification.

1. **Agents don't carry context between sessions.** Every modification must be completable from written artifacts alone. A workflow step that requires undocumented institutional knowledge is a broken step.

2. **Different expertise catches different problems.** Role separation must be preserved in any modified structure. A modified graph that collapses roles — combining proposal and approval into the same role, or merging review and implementation — removes the perspective-checking that makes the workflow reliable.

3. **Quality gates prevent compounding errors.** Modifications cannot remove review steps. Every approval gate that exists in the graph has a reason; removing it removes the protection it provides.

4. **Workflows are the structure that makes the core bet true.** The A-Society core bet is that structured projects produce better agent output than unstructured ones. Modifications must preserve or improve this structure, never degrade it. A modification that makes the workflow faster but less structurally sound has traded the core bet away.

5. **Traceability and reversibility.** The modification itself must go through the workflow — records are always produced. A workflow change that is applied without passing through proposal and review is itself a violation of the structure it is trying to maintain.

---

## Hard Rules

These are non-negotiable constraints that every node, edge, and phase in a modified or extended graph must satisfy.

1. **Every handoff must produce a written artifact.** An edge without a carried artifact is a silent transition — undiscoverable by agents in subsequent sessions.

2. **Every workflow must have at least one approval gate before implementation.** A graph without a review node has no second perspective. No exceptions.

3. **Each step must be owned by exactly one role.** Shared ownership is undefined ownership. If two roles both "own" a step, neither can be held to it.

4. **A workflow must be indexed before it can be referenced.** An unindexed workflow cannot be reliably pointed to; references to it become fragile.

5. **No step may require context that wasn't produced by a prior step.** Every node's input contract must be satisfiable from the artifacts produced by its upstream nodes. A node that requires context from outside the graph — undocumented prior work, a verbal agreement, session memory — is a node that will fail silently.

6. **Workflows must be role-defined, not agent-defined.** A workflow step that only works if a specific named agent performs it is not a portable workflow. Role definitions are the unit of assignment.

7. **Records are immutable once produced.** A completed, closed artifact in the records folder may not be retroactively edited. Corrections are made in new artifacts — not by modifying historical ones.

---

## How to Modify a Workflow

**The modification itself must go through the workflow.** A workflow change is proposed, reviewed, and approved before implementation — not applied directly. This satisfies Principle 5 and ensures the modification receives the same perspective-checking that any other change receives.

### Step 1 — Identify the operation type

Classify the modification:

- **Add a branch:** a new flow type entering the graph from the Owner node. Define the new nodes and edges from Owner through to a terminal node, including all handoffs, roles, and invariants.
- **Modify a node:** a phase's input, output, owner, or human-collaborative designation changes. Define what the node looks like before and after. Identify which edges are affected.
- **Modify an edge:** a handoff's transition condition, artifact format, or direction changes. Identify the upstream and downstream nodes. Confirm no node contract is broken.
- **Remove a node or edge:** the most structurally significant operation. Before removing, verify that no hard rule is violated — especially Hard Rule 2 (at least one approval gate must remain) and Hard Rule 3 (each remaining step is owned by exactly one role). Document why the removal is safe.
- **Modify a structural rule:** an invariant or escalation rule changes. Justify the change against all five principles explicitly — invariants are the non-negotiable layer of the workflow and require the highest scrutiny.

### Step 2 — Draft the modified graph

Write out the modified workflow structure:

- For any new or changed node: define the full node contract — input, owner, output, and human-collaborative field (if applicable).
- For any new or changed edge: define the transition condition and the artifact carried.
- If new roles are added: confirm they are defined in the project's `agents.md` before submitting the proposal.
- If the workflow has a machine-readable graph representation (see `$INSTRUCTION_WORKFLOW_GRAPH`): draft the updated YAML alongside the prose change. The prose and graph must remain in sync.

### Step 3 — Validate against principles and hard rules

Before proposing, run each check:

**Principles:**
1. Is every modified step completable from written artifacts alone?
2. Is role separation preserved? Are any perspectives collapsed by the modification?
3. Are all approval gates intact? Has any been removed?
4. Does the modified structure preserve or improve structural quality?
5. Is this modification being routed through the workflow as a proposal?

**Hard Rules:**
1. Does every handoff in the modified graph produce a written artifact?
2. Does the graph still have at least one approval gate before implementation?
3. Is every step owned by exactly one role?
4. Will any new workflow or sub-flow be indexed before being referenced?
5. Is every node's input contract satisfiable from its upstream artifacts?
6. Is every step defined in terms of a role, not a named agent?
7. Are all existing records treated as immutable?

If any check fails, revise the design. Do not propose a modification that fails a check.

### Step 4 — Route through the workflow

Submit the modification as a proposal through the standard project workflow. Include:

- The operation type (from Step 1)
- The drafted modified graph (from Step 2)
- The principle and hard-rule validation results (from Step 3)
- The rationale: what problem the modification solves and why the current graph does not solve it

### Step 5 — Implement after approval

Once the proposal is approved:

- Update `workflow/main.md` with the approved changes
- Update the machine-readable graph frontmatter if present
- Update any downstream documents that reference the modified nodes or edges (role documents that specify phase inputs/outputs, communication templates tied to handoff formats)
- Register any new named workflow in the project's index

### Step 6 — Confirm index and cross-references

After implementation, verify:

- Any new workflow is registered in the project's index
- Cross-references to modified sections still resolve correctly
- The backward pass order is still computable from the updated graph (run `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` if available; otherwise derive manually per `$INSTRUCTION_IMPROVEMENT`)

---

## Relationship to Other Instructions

- **`$INSTRUCTION_WORKFLOW`** — how to create a workflow from scratch. Read before this document if you are creating rather than modifying.
- **`$INSTRUCTION_WORKFLOW_GRAPH`** — how to create and maintain the machine-readable graph representation. Required reading if the workflow being modified has YAML frontmatter.
- **`$INSTRUCTION_IMPROVEMENT`** — the backward pass protocol. After a workflow modification flows through to closure, backward pass traversal order is defined there.

---

### Cross-reference addition to `$INSTRUCTION_WORKFLOW` (general/instructions/workflow/main.md)

Add the following section immediately before the "## Format Rules" section:

---

## Modifying an Existing Workflow

When an existing workflow needs to change — adding a new flow type, modifying a phase, changing a handoff, or adjusting an invariant — do not edit the workflow document directly. A workflow modification is a structured operation: it must be proposed, reviewed, and approved before implementation.

For the complete modification procedure, the single-graph model, evaluative principles, and hard rules: see `$INSTRUCTION_WORKFLOW_MODIFY`.

---

### a-docs-guide entry for `$INSTRUCTION_WORKFLOW_MODIFY`

Add under the `general/instructions/` section, alongside the existing workflow instruction entries:

---

### `general/instructions/workflow/modify.md` — `$INSTRUCTION_WORKFLOW_MODIFY`

**Why it exists:** When an existing workflow needs to change, agents need more than the creation instruction — they need a model for what kind of operation they are performing and the constraints that govern it. Without this document, agents either apply changes ad-hoc (violating traceability) or re-derive the evaluation criteria from scratch each time. The document establishes the single-graph model (there is one operation: graph modification), the five evaluative principles, and the seven hard rules that every node, edge, and phase in a modified graph must satisfy.

**What it owns:** The single-graph model, the five principles, the seven hard rules, and the six-step procedure for routing, drafting, validating, and implementing a workflow modification.

**What breaks without it:** Agents facing workflow changes have no principled framework. Modifications bypass approval (violating traceability), collapse role separation (violating the core bet), or remove approval gates (removing quality checks). The false binary between "add a workflow" and "modify a workflow" resurfaces, producing inconsistent graph structures across sessions.

**Do not consolidate with:** `$INSTRUCTION_WORKFLOW` — the creation instruction tells you how to build a workflow; this document tells you how to change one. Distinct operations with distinct constraints. Do not consolidate with `$A_SOCIETY_WORKFLOW` — that document describes A-Society's own workflow; this is a general instruction applicable to any project.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
