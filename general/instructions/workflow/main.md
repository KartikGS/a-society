# How to Create a Workflow Document

## What Is a Workflow Definition?

A workflow definition describes the repeatable process by which work moves through a project — from raw input to verified, closed output. It answers:

> "How does work get done here? What nodes exist, how does work move between them, and who owns each one?"

It is not a role document. It is not a requirements template. It is the living map of the project's execution loop — the definition every agent consults when they ask "what do I do next?"

It is also the policy surface for node-linked support docs. If a role needs a companion document at proposal time, review time, implementation, or closure, the workflow is the place that says "read this now." The workflow's YAML definition is the executable source for node contracts, support-doc injection cues, role-session identity syntax, and handoff routing semantics.

A workflow definition is read at workflow entry and referenced during execution. It is encoded as YAML so the runtime can execute, inject, and verify the process. It must be specific enough to prevent guessing and stable enough to survive many flows without requiring constant updates.

---

## Why Every Project Needs One

Without a workflow definition, agents improvise process. They infer what "done" means, guess transition rules, and make up sequencing logic. The result is inconsistency that compounds across runs:

- One agent marks a task done before verification; another reopens it.
- Transition artifacts show up in different formats depending on who wrote them.
- No one agrees on when to escalate vs. proceed.
- Each new run re-litigates process decisions that were already made.

A workflow definition converts implicit process knowledge into explicit, referenceable rules. Once written, every agent — regardless of role or run — operates from the same playbook.

**Without a workflow definition, process is negotiated at runtime. With one, it is declared in advance.**

---

## Surface-Driven Workflow Design

Design workflows from **touched permanent surfaces**, not from inherited phase loops.

The first workflow question is:

> "Which permanent surfaces will this flow change, and which roles own their truth?"

Start from the smallest legal path:

`Owner intake -> touched-surface work -> Owner closure`

Then add nodes only when they contribute unique value that this minimal path cannot provide safely:

- **Design or advisory node** — when standing design does not already govern the work, when boundaries or contracts are changing, or when multiple implementers need a shared design before execution
- **Independent approval or review node** — when the work changes shared promises, shared-library surfaces, another role's owned truth surfaces, or any other high-impact area where the same role should not both authorize and verify its own change
- **Registration or stewardship node** — when a separate role owns indexes, guides, update reports, version records, or similar stewardship surfaces that must be updated in-band with the work
- **Parallel tracks and joins** — when multiple touched-surface tracks are independent enough to run concurrently and later converge

A workflow node that adds no unique decision value, execution value, or closure value should not exist.

This keeps workflows structurally complete without forcing unnecessary gates into every flow.

---

## The Workflow as a Graph

A workflow is a **graph**: a named set of nodes connected by transitions.

**Node** — an agent performing a task. Every node has a contract with the following fields:
- **Owner** — which role runs this node
- **Required readings** *(when applicable)* — any node-linked support docs the role must load before acting
- **Inputs** — what the agent receives (the work product arriving on an incoming transition)
- **Work** — what the agent does (defined by its role and task instructions)
- **Outputs** — what the agent produces (the work product departing on an outgoing transition)
- **Transitions** — where the work can go next and what condition causes each outgoing transition to fire
- **Human-collaborative** *(when applicable)* — the nature of human contribution to this node. Use this field when the human must actively contribute through the assigned agent.
- **Notes** *(when applicable)* — node-specific cautions, edge cases, or constraints that do not belong in global invariants

**Transition (edge)** — the rule by which work moves between nodes. Every transition has a **transition condition**: the criterion that determines when work passes from one node to the next. Transitions also have a **direction property**:

- **Unidirectional** (default) — work passes in one direction only. The downstream node completes its work and the transition fires onward.
- **Bidirectional** — the downstream node may send a message upstream and receive a response without exiting the current node. The downstream node enters a waiting state (not complete) until the response arrives, then resumes. Designate a transition as bidirectional when the downstream node may need clarification from the upstream node during execution — information it cannot resolve independently and that the upstream node must provide.

**Parallel fork** — a node may have multiple outgoing transitions that fire simultaneously, producing parallel execution branches. Use when work can proceed concurrently across different roles or role-session identities before converging downstream.

**Role-session identity** — a distinct execution session for a role that shares the same base role authority as another node. Use separate role-session identities when two nodes with the same base role may be active at the same time and need separate histories. The workflow YAML must encode them with explicit role-session identifiers; descriptive node notes do not create separate executable sessions.

**Join** — a node that converges multiple incoming transitions. A join node may activate as soon as any incoming handoff arrives, even when other expected inputs are still pending. The role evaluates the currently received inputs against the node contract and each outgoing transition's requirements. It may wait for more inputs, request corrections, or hand off to one or more next nodes when the current inputs are sufficient for those targets. The workflow should make expected inputs and outgoing requirements explicit; the assigned role makes the sufficiency decision from that contract.

**Graph** — the complete workflow definition: the named set of nodes and transitions describing how work moves from entry to completion.

**Flow** — one traversal of a workflow graph. When the same workflow runs multiple times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate flow. Each flow is identified by a **flow ID**.

**Flow ID format:** `[short-slug]-[sequential-number]` (e.g., `acme-001`, `rebrand-003`). The slug is a human-readable label for the flow; the number disambiguates across time. The project defines its own slug vocabulary.

The simplest workflow — a linear sequence of nodes, running once at a time — is a linear graph with a single active flow. It is the default case. Most of what follows describes how to build that case. Extended patterns (concurrent flows and branching) are described at the end of this document.

---

## The Owner as Workflow Entry and Terminal Node

The **Owner** is both the universal entry point and the terminal node for every workflow.

**Entry:** a flow begins at the Owner entry node. The runtime loads the active flow context for the Owner, and the user's request arrives as chat input to the Owner session. The Owner identifies touched surfaces, refines the active path as needed, and routes work to the correct next node.

**Terminal:** every workflow surfaces back to the Owner on completion. The closing role in a workflow does not silently close — it hands the result to the Owner. The Owner acknowledges completion, logs it, and determines whether any follow-up is needed. This closed loop ensures the Owner is always aware of what has been finished.

This means:
- **Only the Owner reads the full workflow map.** Other agents receive well-formed input artifacts at their nodes — they see their node contract (input, work, output), not the entire graph.
- **The Owner routes work inside the active flow.** The Owner turns the user's request into the trigger input, scopes the active path, and identifies the next node or role to act.
- **Freeform work is valid.** The Owner can engage in discussion, direction-setting, or exploratory thinking without entering any workflow. Not every interaction needs a workflow.

### Routing means routing, not doing

The Owner routes work into the workflow. The Owner does not collapse all nodes into itself.

When the human directs a change — even a small one — that change should enter the workflow at the appropriate trigger point so that the designed role separation is preserved. The Owner receives the human's direction, formulates it as a trigger input, and hands it off to the role that owns the entry node. Each subsequent node brings its own expertise and perspective.

An Owner that receives direction and immediately implements it has bypassed every downstream perspective the workflow was designed to include. The result may be fast, but it is not structurally verified — no second role checked the work, no node contract validated the transition, no expert other than the Owner applied their judgment.

The workflow exists because the project decided that completeness requires multiple perspectives. Human-directed work is not exempt from that decision.

---

## What Belongs in a Workflow Document

A workflow definition should contain only the standing execution data the runtime and roles need:

- **Workflow identity** — name, summary, and any use-when or companion-doc references.
- **Nodes** — node id, role, node-specific required readings, guidance, inputs, work, outputs, transition notes, and local cautions.
- **Edges** — source node, target node, and artifact descriptor when useful.
- **Workflow-level rules** — invariants, escalation rules, session/concurrency rules, and forward-pass closure obligations.
- **Backward-pass declaration** — participating roles and findings destinations. Do not specify traversal ordering locally; the runtime derives ordering from the active flow graph and the project's improvement contracts.

Use `human-collaborative` on a node when the human must actively contribute direction, approval, content, or another named input through the assigned agent. The entry node carries `human-collaborative: direction` because the user's request starts the flow. The assigned agent remains responsible for surfacing context, eliciting the human contribution, and authoring any outgoing artifact in the project's required format.

Keep transition summaries lightweight. Artifact formats, status models, and detailed coordination protocols belong in communication or artifact-specific documents, not in the workflow definition. What does belong here is the node-entry cue that activates a support doc: the workflow says when a role must read it.

---

## What Does NOT Belong

- **Role definitions** — who the agents are and what they own belongs in role documents
- **Tool declarations** — what software to use belongs in a tooling document
- **Project vision** — why the project exists belongs in a vision document
- **Specific artifact templates** — how to format a plan or requirement belongs in sub-documents (`workflow/plans/`, `workflow/reports/`, `workflow/requirements/`)
- **Historical records** — completed work artifacts live alongside the workflow, not inside it

If the workflow definition grows sections that describe specific artifact formats or role-specific behaviors in depth, those sections belong in sub-documents. The workflow definition describes the process; sub-documents describe the artifacts produced by that process.

---

## Folder Structure

A workflow area is usually a folder. The canonical structure is:

```
workflow/
├── main.yaml            ← canonical workflow definition
├── plans/
│   └── main.md          ← how plans are structured and templated
├── reports/
│   └── main.md          ← how investigation/analysis reports work
└── requirements/
    └── main.md          ← how requirements are captured and managed
```

Not all projects need all sub-folders. Create a sub-folder when:
- The artifact type has its own naming convention, status model, or governance rules.
- Agents need a reference template to create new artifacts of that type.
- Historical artifacts of that type accumulate and agents must navigate them.

Do not create sub-folders preemptively. If a project has no requirements artifacts, there is no `requirements/` folder.

---

## How to Write One

**Step 1 — Name the graph and determine concurrent-flow behavior.**
Give the workflow a name. Decide whether it runs once at a time or may have multiple flows running simultaneously. If concurrent flows are allowed, define the flow ID slug vocabulary the project will use.

**Step 2 — Define the nodes.**
List every node that a unit of work passes through. Derive this list from the touched permanent surfaces and the gates the work actually needs. For each node: name it, assign an owner role, list required readings, define its inputs and outputs, define the work performed there, note whether the node requires human collaboration, and record any node-specific notes. The entry node always carries `human-collaborative: direction`. If a node has no owner, it is not a node — it is a gap.

**Step 3 — Define transitions.**
For each outgoing transition from each node, define: the transition condition (when does the transition fire), the artifact that carries it, what that artifact must contain, and what the receiving role checks before acting.

**Step 4 — Write the invariants.**
What rules apply to all work in this project, regardless of node? Write them as a numbered list with names. Invariants should be few, clear, and non-negotiable.

**Step 5 — Define escalation.**
Define what causes an agent to stop and ask. The escalation definition should be specific enough that an agent can distinguish "I should escalate" from "I should proceed with a note." Add node-specific escalation notes only when a node truly needs special handling.

**Step 6 — Define the forward pass closure step.**
Name the closure obligations for this workflow — what the terminal Owner node must confirm and execute before declaring the forward pass closed. Keep the closure rules in the workflow definition itself rather than splitting them into a separate routing surface.

**Step 7 — Define the backward pass.**
Describe the backward pass — which roles participate and where findings go. Do not specify traversal ordering locally; the runtime derives ordering from the active flow graph and the project's improvement contracts.

**Step 8 — Identify sub-documents.**
What artifact types does this project produce? For each type that needs a template or governance rules, create a sub-folder with a `main.md`. Link each sub-folder from the canonical workflow definition or the surrounding project indexes as appropriate.

**Step 9 — Cut what does not belong.**
A workflow definition that describes role responsibilities, vision, or tool choices in detail has drifted into other documents' territory. Extract those sections and link to the appropriate files. A role document that enumerates node-triggered "before X, read Y" cues has drifted in the other direction; move those cues back into the workflow.

---

## Routing Complexity at Intake

When routing incoming work into an existing workflow, the Owner determines the proportional path through the graph — not all work warrants the full pipeline. For the five complexity axes, the three-tier routing model, and the intake routing procedure: see `$INSTRUCTION_WORKFLOW_COMPLEXITY`.

This instruction defines the reusable model. A mature project should usually instantiate it in a project-local operational complexity document and have the canonical workflow definition reference that local document, rather than sending agents directly to the general instruction during execution.

---

## Modifying an Existing Workflow

When an existing workflow needs to change — adding a new flow type, modifying a node, changing a transition, or adjusting an invariant — do not edit the active workflow definition casually. A workflow modification is a structured operation: it must be proposed, reviewed, and approved before implementation.

For the complete modification procedure, the single-graph model, evaluative principles, and hard rules: see `$INSTRUCTION_WORKFLOW_MODIFY`.

---

## Format Rules

- **Process-first, not role-first.** Describe what happens to work, not what roles do. Roles are described in role documents.
- **One-line summary at the top.** Every workflow definition should carry a one-line summary — typically in the YAML `summary` field — stating what kind of work it processes. The runtime and record surfaces can use this summary as a durable label for the flow.
- **Node-first structure.** Organize the workflow around named node contracts with explicit outgoing transitions. Number nodes only when order itself carries meaning; do not rely on phase numbering as the primary model.
- **Named invariants.** Each invariant should have a short name (e.g., "Traceability Invariant") so agents can reference it precisely in transitions and reports.
- **Flow-scoped references.** In workflows that allow concurrent flows, every artifact reference (transition artifacts, status tokens, pre-replacement checks) must include the flow ID so artifacts from concurrent flows do not collide. Workflows that run only one flow at a time do not need this extra disambiguation.
- **Stable by design.** A workflow document that changes every week is a sign the process has not been decided — not a sign it is being maintained. Decide the process, then write it down.

---

## Examples Across Project Types

### Software project
- **Nodes**: Requirements (BA) → Technical Planning (Tech Lead) → Implementation (Sub-agents) → Verification (Tech Lead/Coordinator) → Acceptance (BA)
- **Key invariant**: Feature code is never written by the planning role — it is always delegated.
- **Key transition**: Planning → Implementation requires a plan artifact; Implementation → Verification requires a completion report.

### Research project
- **Nodes**: Question framing → Literature review → Analysis → Synthesis → Output
- **Key invariant**: No conclusions are drawn without evidence artifacts.
- **Key transition**: Each node produces a dated artifact that the next node reads as input.

### Editorial / writing project
- **Nodes**: Brief → Draft → Review → Revision → Final
- **Key invariant**: Reviewer comments are tracked as discrete items, each accepted or rejected explicitly.
- **Key transition**: Draft → Review requires a complete draft; Review → Revision requires a marked-up artifact with classified comments.

---

## Extended Workflow Patterns

The linear workflow with one active flow at a time is the default case. When your project's needs grow beyond it:

### Multiple concurrent flows

When the same workflow runs N times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate flow through the same graph. Define the flow ID slug vocabulary in the workflow document. Scope all transition artifacts, status tokens, and pre-replacement checks to the flow via the flow ID. See `$INSTRUCTION_COMMUNICATION_CONVERSATION` for concurrent artifact naming.

### Branching

**Conditional branching:** when a node has multiple possible outgoing transitions, define the transition condition for each. At runtime, the condition determines which transition fires — one transition fires per decision. Converging branches — multiple incoming transitions leading to the same downstream node — use the same mechanics: each transition has its own condition; the downstream node defines what input it accepts from any arriving transition.

**Parallel fork and join:** a parallel fork fires multiple outgoing transitions simultaneously — work continues in parallel branches without waiting for the other branches to complete. A join node may wake on partial incoming handoffs and decide whether the received inputs are enough to proceed to one or more outgoing nodes, whether to wait for additional inputs, or whether to request corrections. Use parallel forks when independent work can run concurrently and later coordinate at a shared node. Define at the join node which inputs are expected, what each outgoing transition requires, and who has authority to judge sufficiency.

### Multi-domain parallel-track flows (single workflow)

When **one unit of work** spans **multiple domains or role types** (e.g., documentation, implementation track A, implementation track B) that can proceed **in parallel until a synchronization point**, model it as **a single workflow graph** with **parallel forks and at least one join** — not as separate workflows chosen because the work "touches more than one area."

**What this is:** One flow, one workflow name, one record of the work. Branches run concurrently where transitions are independent; a join node coordinates incoming branch work and may proceed when the assigned role judges the received inputs sufficient for the relevant outgoing transition.

**What this is not:** It is not a justification for introducing multiple permanent workflow files. If the work is truly one feature or one decision thread, splitting it into multiple workflows fragments accountability and obscures transitions.

**When to use:** Independent implementation or review tracks exist; a single planning or architecture node can feed all tracks; convergence is required before verification, acceptance, or publication.

**Graph pattern (abstract):** Planning or architecture node → **parallel fork** to two or more domain tracks → **join** → downstream verification or closure nodes. Role names are project-specific; the structure is generic.

**Checkpoints and approvals:** When a parallel track includes work that **must not proceed without a governance or approval step** (e.g., a shared library change that requires Owner or steward approval before implementation continues), model that step explicitly in the graph: either a **node** whose output is approval, or a **bidirectional transition** for clarification/approval, so the track does not silently bypass the approval obligation. The exact mechanics follow the same transition and bidirectional-transition rules defined earlier in this document.

**Owner routing:** The Owner still routes the unit of work **into** this workflow once and receives **terminal** confirmation once; parallel tracks do not remove the Owner terminal node.

**Parallel-track declaration:** State explicitly which tracks may run in parallel and where joins force ordering. Parallelism is a graph property, not a separate coordination model.

These patterns are not separate complexity tiers. They are all graph traversal with decision points at transitions. A project should strongly prefer one canonical workflow definition whose record snapshots activate only the relevant nodes and edges for each flow.

---

## What Makes a Workflow Document Fail

**Too abstract.** A workflow that says "work proceeds through stages" without naming the nodes or the transitions between them gives agents nothing to act on.

**Merged with role documents.** When *process rules* — invariants, transition conditions, escalation paths — are embedded in role documents, they diverge. Each role file holds its own version of the process, updated independently. The assembled process can only be reconstructed by reading every role document in sequence — and even then, the versions may conflict. Role documents should reference the workflow document for process rules; they should not contain them.

**No invariants.** Without explicit invariants, every edge case becomes a negotiation. The first time a constraint is challenged, the team discovers they never actually agreed on it.

**Updated reactively.** Workflow documents should be updated when the process is deliberately changed — not after every flow that exposed a gap. Reactive updates produce a patchwork of special cases rather than a coherent process.
