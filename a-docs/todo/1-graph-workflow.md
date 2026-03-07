# Requirement: Graph-Based Workflow Model

**Status:** Complete — implemented and update report published
**Logged:** 2026-03-07
**Scoped:** 2026-03-07
**Source:** BrightLaunch Initializer test run

---

## What Was Observed

During the BrightLaunch initialization test, two related friction points surfaced:

1. **Concurrent naming gap** — The communication instruction assumes one live artifact per handoff type. BrightLaunch runs multiple simultaneous client engagements, so a single `[sender]-to-[receiver].md` file would be overwritten constantly. The Initializer had to derive a per-engagement naming convention (`[client-slug]-[handoff-type].md`) independently, without guidance.

2. **Multiple workflow instances** — BrightLaunch's five-phase engagement lifecycle is a single workflow that runs N times concurrently. The framework had no model for this. The Initializer addressed the symptom (naming) but the underlying structural gap was not resolved.

These are symptoms of a deeper assumption embedded throughout the framework.

---

## The Core Problem: Single-Thread Assumption

The current framework assumes a single workflow, running once, sequentially. This assumption is not stated anywhere — it is baked into every layer:

- **Workflow instruction** — describes one phase sequence; no concept of multiple instances running simultaneously
- **Communication instruction** — defines one live artifact per handoff type; no unit-of-work identifier
- **Conversation template format** — bilateral handoff between two roles; no way to scope a handoff to a specific work unit
- **Handoff protocol** — status vocabulary (`PENDING`, `IN_PROGRESS`, etc.) applies to a handoff, not to an instance of a workflow
- **Role activation conditions** — roles are always-on; no concept of a role being scoped to a specific engagement or run

The result: any project that runs multiple instances of the same workflow simultaneously, or that has more than one workflow, must derive its own extensions without framework support.

---

## The Graph Model

A graph data structure is the right conceptual frame for what the framework needs to support:

**Nodes** — an agent performing a task. Each node has a 3-part contract:
- **Inputs** — what the agent receives (the handoff artifact from the incoming edge)
- **Work** — what the agent does (defined by its role and task instructions)
- **Outputs** — what the agent produces (the handoff artifact for the outgoing edge)

**Edges** — handoffs between nodes. Each edge carries a work product and has a transition condition that determines when it fires.

This input/work/output contract keeps agent context minimal — an agent at a node does not need to know the full graph. It knows what it receives, what it does, and what it hands off. This aligns with Principle 1 (Context Is a Scarce Resource).

The model also makes workflows **verifiable**: does node B's output format match the expected input format of node C? If not, that's a structural bug — catchable before any work runs.

Under this model, the current single-thread workflow is a degenerate case: a linear graph with one instance running at a time. The framework supports all of these with one unified model:

### Case 1: Multiple instances of the same graph
A project runs the same workflow multiple times simultaneously (BrightLaunch: multiple client engagements). Each instance is a separate traversal of the same graph. Work artifacts, handoffs, and status are scoped to an instance via the unit-of-work ID.

### Case 2: Branching within a single graph
A node with multiple outgoing edges. Each edge has a transition condition. At runtime, the condition determines which edge fires. Converging branches: multiple edges leading to the same node.

### Case 3: Multiple distinct graphs in one project
Separate graphs — different node sequences, different handoff types, possibly different roles. Each graph is defined independently.

### Case 4: Cross-graph edges
An edge from a node in one graph to a node in another. Same mechanics as any edge — transition condition, handoff artifact — but connects different workflow definitions.

These are not four separate complexity tiers requiring phased implementation. They are all graph traversal with decision points at edges. One model, four cases.

---

## Resolved Decisions

All open questions have been resolved. These decisions govern the Curator's drafting.

### Unit-of-work identifier format

**`[short-slug]-[sequential-number]`** (e.g., `acme-001`, `rebrand-003`).

- The slug is a human-readable label for the unit of work; the number disambiguates across time
- The framework prescribes the pattern; each project picks its own slug vocabulary
- UUIDs rejected (opaque to humans and agents scanning filesystems). Pure slugs rejected (not unique across time)
- In single-instance mode, the unit-of-work ID is optional

### Case scoping

One model handles all cases from day one. The instruction document layers progressively: simple linear case first, then branching, multi-instance, and multi-graph as "your workflow may also need…" sections. The model is uniform; the pedagogy is graduated.

### Backwards compatibility

**Preserved.** If a project's workflow is linear and single-instance, nothing changes. The unit-of-work ID is optional. The graph model means the single-thread workflow is the default case — a linear graph with one instance — not a separate legacy format.

### Update report classification

**Recommended**, not Breaking. Only projects that want multi-instance or branching need to act. Single-thread projects need to do nothing.

### Improvement backward pass

Traverses the graph backwards along the **path that was actually traversed** for the instance under review. Each node's agent reviews its own outputs against its inputs, walking from the terminal node back to the entry node. In a branching graph, only the traversed path is reviewed — not every possible path in the graph definition.

---

## Implementation Scope

**6 files changed across `general/instructions/`.** 1 major revision + 3 small updates + 2 minimal updates.

Implementation order (each step depends on the previous):

| Step | File | Effort |
|---|---|---|
| 1 | `workflow/main.md` | **Large** — introduces graph model, node/edge vocabulary, instance management, reframes phases as nodes |
| 2 | `communication/conversation/main.md` | **Small** — prescribes unit-of-work ID format, aligns handoff framing with edges |
| 3 | `communication/coordination/main.md` | **Small** — instance-scopes status vocabulary and pre-replacement checks |
| 4 | `roles/main.md` | **Small** — connects activation/closure to graph edges, adds node contract guidance |
| 5 | `communication/main.md` | **Minimal** — entry point acknowledgment of instance-scoped artifacts |
| 6 | `improvement/main.md` | **Minimal** — backward pass traversal guidance |

**Detailed scope:** See the implementation scope document produced in the Owner session dated 2026-03-07.

**Unchanged:** workflow sub-documents (plans, reports, requirements), role templates, feedback mechanisms.

---

## Direction Decision

**Extend the model** — the single-thread assumption should not merely be acknowledged as a limitation. The framework should have a first-class model for workflow instances, parallel tracks, and multiple workflow graphs. The current single-thread pattern becomes the default case of the extended model, not the only case.

The scope is confirmed. The Curator may begin drafting following the implementation order above. This is an `[L]` scope change — it touches multiple instructions and will produce a Recommended framework update report.
