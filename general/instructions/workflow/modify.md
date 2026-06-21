# How to Modify a Workflow

*This document is a companion to `$INSTRUCTION_WORKFLOW`. Read that document to create a workflow from scratch. Read this document when an existing workflow needs to change.*

---

## The Single-Graph Model

A workflow is a single directed graph. The Owner node is the invariant entry point and exit point — it never changes.

What appears to be "adding a new workflow" is usually structurally a graph modification: adding new branches from the Owner node inside the same canonical workflow definition. There is no default add-vs-modify distinction. The normal operation is **graph modification**.

This model collapses a false binary. "Should I add a new workflow or modify the existing one?" is not the right question. The right question is: "what branch or structural change does this graph require?"

Because the Owner is always the entry and exit point, every new flow type becomes a new branch that originates from and terminates at the Owner node. The graph grows; it does not multiply.

---

## Principles

These are the evaluative criteria every modification must be held against. A modification that satisfies the hard rules but violates a principle is still a bad modification.

1. **Agents don't carry context between sessions.** Every modification must be completable from written artifacts alone. A workflow node that requires undocumented institutional knowledge is a broken node.

2. **Different expertise catches different problems.** Preserve the role separations that add unique decision, review, or stewardship value. A modified graph that collapses a genuinely needed perspective is a bad modification; a modified graph that removes a ceremonial gate is an improvement.

3. **Quality gates must justify their cost.** A workflow may remove or collapse a gate only when authorization remains explicit and the removed step adds no unique decision, review, or stewardship value for the touched surfaces.

4. **Workflows are the structure that makes the core bet true.** The A-Society core bet is that structured projects produce better agent output than unstructured ones. Modifications must preserve or improve this structure, never degrade it. A modification that makes the workflow faster but less structurally sound has traded the core bet away.

5. **Traceability.** The modification must be reflected in written artifacts before it takes effect. A workflow change applied without updating the canonical definition and its downstream references is invisible to future agents.

---

## Hard Rules

These are non-negotiable constraints that every node, edge, and phase in a modified or extended graph must satisfy.

1. **Every handoff must produce a written artifact.** An edge without a carried artifact is a silent transition — undiscoverable by agents in subsequent sessions.

2. **Every workflow must have explicit authorization before implementation.** The authorization may be the Owner's intake plan for a direct flow or an independent approval node for higher-impact work. When the touched surfaces require a second perspective, that gate must be explicit in the graph.

3. **Each node must be owned by exactly one role.** Shared ownership is undefined ownership. If two roles both "own" a node, neither can be held to it.

4. **A workflow must be indexed before it can be referenced.** An unindexed workflow cannot be reliably pointed to; references to it become fragile.

5. **No node may require context that cannot be found in written artifacts.** Every node's input must be satisfiable from written artifacts — either produced by upstream nodes in the flow, or from standing documents accessible to the role. A node that requires a verbal agreement, session memory, or undocumented institutional knowledge is a node that will fail silently.

6. **Workflows must be role-defined, not agent-defined.** A workflow node that only works if a specific named agent performs it is not a portable workflow. Role definitions are the unit of assignment.

---

## How to Modify a Workflow

The Owner modifies the workflow. The human may direct the change or offer input at any point — for significant structural changes, consult the human before implementing. Steps 1–3 are the quality gate; the modification does not require a separate workflow flow.

### Step 1 — Identify the operation type

Classify the modification:

- **Add a branch:** a new route or optional node path entering the graph from the Owner node. Define the new nodes and edges from Owner through to the Owner exit node, including all handoffs and roles.
- **Modify a node:** a node's role, work, or behavioral flags (human-colab, await-all-inputs) change. Define what the node looks like before and after. Identify which edges are affected.
- **Modify an edge:** a handoff's transition condition, artifact format, or forward route changes. Identify the upstream and downstream nodes. Confirm no node contract is broken.
- **Remove a node or edge:** the most structurally significant operation. Before removing, verify that no hard rule is violated — especially Hard Rule 2 (authorization remains explicit and any needed second perspective is still present) and Hard Rule 3 (each remaining node is owned by exactly one role). Document why the removal is safe.
- **Modify a structural rule:** a closure obligation or session/concurrency rule changes. Justify the change against all five principles explicitly — these are the non-negotiable layer of the workflow and require the highest scrutiny. (Project-wide invariants and escalation paths live in governance, principles, and role documents, not the workflow definition; change them there and update any node work that cites them.)

### Step 2 — Draft the modified graph

Write out the modified workflow structure:

- For any new or changed node: define the full node contract — role, work, and behavioral flags (human-colab, await-all-inputs) if applicable.
- For any new or changed edge: define the transition condition and the artifact carried.
- If new roles are added: confirm their role document exists in the project before implementing.
- If the workflow has a machine-readable graph representation (see `$INSTRUCTION_WORKFLOW_GRAPH`): draft the updated YAML alongside the written definition change. The written workflow definition and the machine-readable graph must remain in sync.

### Step 3 — Validate against principles and hard rules

Before implementing, run each check:

**Principles:**
1. Is every modified node completable from written artifacts alone?
2. Is role separation preserved? Are any perspectives collapsed by the modification?
3. If a gate was removed or collapsed, did it truly add no unique value, and is authorization still explicit?
4. Does the modified structure preserve or improve structural quality?

**Hard Rules:**
1. Does every handoff in the modified graph produce a written artifact?
2. Does the graph still have explicit authorization before implementation, and an independent gate wherever the touched surfaces require one?
3. Is every node owned by exactly one role?
4. Will the canonical workflow definition and any related references remain indexed correctly after the change?
5. Is every node's input satisfiable from written artifacts — either upstream flow artifacts or accessible standing documents?
6. Is every node defined in terms of a role, not a named agent?

If any check fails, revise the design. Do not implement a modification that fails a check.

### Step 4 — Implement

- Update `workflow/main.yaml` with the changes
- Update the machine-readable graph frontmatter
- Update any downstream documents that reference the modified nodes or edges
- Update any workflow-related index rows or references affected by the change

### Step 5 — Confirm index and cross-references

After implementation, verify:

- The canonical workflow definition is still registered correctly in the project's index
- Cross-references to modified sections still resolve correctly
