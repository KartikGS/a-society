# How to Create a Workflow Document

## What Is a Workflow Document?

A workflow document describes the repeatable process by which work moves through a project — from raw input to verified, closed output. It answers:

> "How does work get done here? What phases exist, in what order, and who owns each one?"

It is not a role document. It is not a requirements template. It is the living map of the project's execution loop — the document every agent consults when they ask "what do I do next?"

A workflow document is read at session start and referenced during execution. It must be specific enough to prevent guessing and stable enough to survive many CRs without requiring constant updates.

---

## Why Every Project Needs One

Without a workflow document, agents improvise process. They infer what "done" means, guess handoff protocols, and make up sequencing rules. The result is inconsistency that compounds across sessions:

- One agent marks a task done before verification; another reopens it.
- Handoffs happen in different formats depending on who wrote them.
- No one agrees on when to escalate vs. proceed.
- Each session re-litigates process decisions that were already made.

A workflow document converts implicit process knowledge into explicit, referenceable rules. Once written, every agent — regardless of role or session — operates from the same playbook.

**Without a workflow document, process is negotiated at runtime. With one, it is declared in advance.**

---

## The Workflow as a Graph

A workflow is a **graph**: a named set of nodes connected by edges.

**Node** — an agent performing a task. Every node has a three-part contract:
- **Input** — what the agent receives (the work product arriving on the incoming edge)
- **Work** — what the agent does (defined by its role and task instructions)
- **Output** — what the agent produces (the work product departing on the outgoing edge)

**Edge** — a handoff between nodes. Every edge has a **transition condition**: the criterion that determines when work passes from one node to the next. Edges also have a **direction property**:

- **Unidirectional** (default) — work passes in one direction only. The downstream node completes its phase and the edge fires to the next node.
- **Bidirectional** — the downstream node may send a message upstream and receive a response without exiting the current phase. The downstream node enters a waiting state (not complete) until the response arrives, then resumes. Designate an edge as bidirectional when the downstream node may need clarification from the upstream node during execution — information it cannot resolve independently and that the upstream node must provide.

**Parallel fork** — a node may have multiple outgoing edges that fire simultaneously, producing parallel execution branches. Use when work can proceed concurrently across different roles or instances before converging downstream.

**Join** — a node that requires inputs from multiple incoming edges before it can proceed. The node waits until all required inputs have arrived. Partial arrival is a waiting state, not a transition. Join nodes are the downstream convergence point for parallel forks.

**Graph** — the complete workflow definition: the named set of nodes and edges describing how work moves from entry to completion.

**Instance** — one traversal of a graph. When the same workflow runs multiple times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate instance. Each instance is identified by a **unit-of-work ID**.

**Unit-of-work ID format:** `[short-slug]-[sequential-number]` (e.g., `acme-001`, `rebrand-003`). The slug is a human-readable label for the unit of work; the number disambiguates across time. The project defines its own slug vocabulary. In single-instance workflows, the unit-of-work ID is optional.

The simplest workflow — a linear sequence of phases, running once at a time — is a linear graph with a single active instance. It is the default case. Most of what follows describes how to build that case. Extended patterns (concurrent instances, branching, multiple graphs) are described at the end of this document.

---

## Sessions and the Human Orchestrator

A graph defines what work looks like. Sessions define how the work is executed.

**Session** — a continuous interaction between the human and an agent in a specific role. A session can span multiple phases of the graph. It can be paused while another role's session runs and resumed when the workflow returns to that role. The session is where context lives — an agent in a session remembers what it did earlier in that session and why.

**The human as orchestrator** — the human decides when to start sessions, when to pause and resume them, which artifacts to point agents at, and maintains continuity between sessions that agents cannot. The human is not a passive approver at the end of a pipeline — they are the runtime that executes the graph.

In the current operational model, agents do not persist memory between sessions. This creates two realities:

- **Within a session**, an agent has full context: its role, the work it has done, and the reasoning behind its decisions.
- **Between sessions**, continuity lives in two places: the human's memory and the communication artifacts that carry state between roles.

**Session reuse — within a flow:** resume existing sessions by default. When the workflow returns to a role that already has an active session, the human resumes that session rather than starting a new one. The agent retains its earlier context and reads any new artifacts to catch up on what happened while it was paused. A new session is warranted within a flow only when the context window is exhausted or the accumulated context would be more noise than signal.

**Session reuse — at flow close:** when a flow completes, start fresh sessions for the next flow. The accumulated context from a completed flow is almost always noise for a new one — reasoning about a closed unit of work, artifacts that are no longer active, context that was relevant only to what just finished. The default at every new flow start is a fresh session for each role involved.

**Transition behavior:** When an agent finishes a phase and the next phase belongs to a different role, the agent should acknowledge the pause point and tell the human what to do next. At each pause point, the agent produces:
- A **copyable artifact path** — always. The next role's agent must be pointed at the right artifact.
- A **copyable session-start prompt** — when a new session is required. Format: *"You are a [Role] agent for [Project Name]. Read [path to agents.md]."*

The agent knows it is talking to the human who will carry the work forward.

**Bidirectional mid-phase exchanges** are a special case. When a downstream node invokes a back-channel, the human switches to the upstream session, delivers the question artifact, retrieves the response, and resumes the downstream session from its waiting state. Unlike a normal phase transition, the downstream session is paused — not complete. The downstream agent should tell the human its waiting state, what question was sent, and what it needs to continue.

**Future automation:** By explicitly modeling the human's orchestration role, the framework creates a specification for what automation would need to replace: session lifecycle management, artifact routing, role switching, and continuity maintenance. A project that automates orchestration replaces the human at this layer — the graph structure, node contracts, and edge conditions remain unchanged.

---

## The Owner as Workflow Entry and Terminal Node

The **Owner** is both the universal entry point and the terminal node for every workflow.

**Entry:** users always begin by assigning the Owner role and pointing the agent at `agents.md`. After loading context (which includes the workflow document), the Owner presents the available workflows and helps the user decide what to work on. The Owner routes work into workflows by creating the trigger input and directing the human to the first non-Owner role's session.

**Terminal:** every workflow surfaces back to the Owner on completion. The closing role in a workflow does not silently close — it hands the result to the Owner. The Owner acknowledges completion, logs it, and determines whether any follow-up is needed. This closed loop ensures the Owner is always aware of what has been finished.

**Backward pass ordering:** the Owner, having received terminal confirmation, directs the backward pass. For traversal order, see `$INSTRUCTION_IMPROVEMENT` — ordering is defined there and is not restated here.

This means:
- **Only the Owner reads the full workflow map.** Other agents receive well-formed input artifacts at their nodes — they see their node contract (input, work, output), not the entire graph.
- **The Owner routes work into workflows.** When the user picks a workflow or describes a need, the Owner creates the trigger input and tells the human which session to switch to next.
- **Freeform work is valid.** The Owner can engage in discussion, direction-setting, or exploratory thinking without entering any workflow. Not every session needs a workflow.

**Exception: delegated-authority flows.** A project may designate certain flow types as delegated-authority — where a specific role has standing authority to close without Owner terminal confirmation. For these flows, that role serves as the terminal node. The scope of delegated-authority flows must be explicitly bounded in the workflow document itself: direction decisions, library-level additions, and structural changes may not fall within them. The Owner-as-terminal principle applies to all other flows.

Every workflow document should include a **one-line summary** suitable for the Owner to present at session start. This summary is how users discover what workflows are available without reading the full workflow document.

### Routing means routing, not doing

The Owner routes work into the workflow. The Owner does not collapse all phases into itself.

When the human directs a change — even a small one — that change should enter the workflow at the appropriate trigger point so that the designed role separation is preserved. The Owner receives the human's direction, formulates it as a trigger input, and hands it off to the role that owns the first phase. Each subsequent phase brings its own expertise and perspective.

An Owner that receives direction and immediately implements it has bypassed every downstream perspective the workflow was designed to include. The result may be fast, but it is not structurally verified — no second role checked the work, no node contract validated the handoff, no expert other than the Owner applied their judgment.

The workflow exists because the project decided that completeness requires multiple perspectives. Human-directed work is not exempt from that decision.

---

## What Belongs in a Workflow Document

A workflow document for any project must cover these sections:

### 1. Phases (Nodes) (mandatory)

What are the named stages that every unit of work passes through? Each phase is a node in the workflow graph. Every node must define:
- **Input** — what arrives from the prior node (the entry condition for this phase)
- **Owner** — which role runs this node
- **Output** — what artifact or state this node produces (the exit condition; what fires the outgoing edge)

Typical phases in a project with multi-role execution: intake → planning → implementation → verification → closure. The names and count will vary by project type.

### 2. Handoff Protocols (Edges) (mandatory)

How does work pass from one node to the next? Each handoff is an edge in the workflow graph. For each edge:
- What is the **transition condition** — when does this edge fire?
- What artifact carries the handoff (a file, a message, a document)?
- What must be present in that artifact for the receiver to act?
- What does the receiver confirm before starting?

Handoff protocols prevent work from disappearing between roles. A node without a defined outgoing edge is a gap where things go silent.

**For bidirectional edges**, define additionally:
- Under what condition the downstream node may invoke the back-channel — what constitutes a genuine blocker vs. something the downstream node should resolve independently
- What artifact carries the question upstream and the response downstream
- What the downstream node's state is while waiting (paused, not complete — distinct from a normal phase completion)
- How the exchange terminates and the downstream node resumes

**For multi-role projects:** the workflow document carries a lightweight summary of handoffs only — who passes to whom and what the receiver checks. Artifact formats, status models, and detailed coordination protocols belong in a communication folder, not here. Embedding protocol detail in the workflow document conflates process sequencing with coordination rules and makes both harder to maintain. See `$INSTRUCTION_COMMUNICATION`. Create the communication folder alongside the workflow document for any project with two or more roles.

### 3. Invariants (mandatory)

What rules are true for every unit of work, regardless of phase? Invariants are non-negotiable — they do not bend for speed, convenience, or unusual CRs. Examples:
- Every closed artifact must have a corresponding open artifact.
- Historical artifacts are immutable once closed.
- Scope extensions require explicit approval before implementation resumes.

Invariants belong in the workflow document, not in individual role documents, because they apply to all roles.

### 4. Escalation Rules (mandatory)

When does an agent stop and ask rather than proceed? Define explicit conditions:
- What constitutes a blocker vs. a manageable uncertainty?
- Who receives the escalation?
- What information must the escalation include?

### 5. Session Model (mandatory for two or more roles)

How are phases mapped to sessions? For multi-role workflows, describe:
- Which roles run in which sessions
- Where the natural pause points are (edges that cross session boundaries)
- What the human does at each transition (which session to switch to, which artifact to route)
- When to start a new session vs. resume an existing one (see session reuse rules in "Sessions and the Human Orchestrator")

A session model makes the human's orchestration role visible and gives agents the information they need to guide the human at pause points. A session model is mandatory for any workflow with two or more roles. It is optional only for genuinely single-role workflows.

### 6. Backward Pass (mandatory)

What is the improvement loop after a flow closes? A backward pass is a structured reflection run after a flow completes — each participating role reviews its own phase for what worked, what failed, and what should change.

A backward pass entry in the workflow document names the roles involved and where findings go. For traversal order, reference `$INSTRUCTION_IMPROVEMENT` — do not specify ordering locally. The improvement file is the authoritative source for the backward pass algorithm.

---

## What Does NOT Belong

- **Role definitions** — who the agents are and what they own belongs in role documents
- **Tool declarations** — what software to use belongs in a tooling document
- **Project vision** — why the project exists belongs in a vision document
- **Specific artifact templates** — how to format a plan or requirement belongs in sub-documents (`workflow/plans/`, `workflow/reports/`, `workflow/requirements/`)
- **Historical records** — completed work artifacts live alongside the workflow, not inside it

If the workflow document grows sections that describe specific artifact formats or role-specific behaviors in depth, those sections belong in sub-documents. The workflow document describes the process; sub-documents describe the artifacts produced by that process.

---

## Sub-Document Structure

A workflow document is a folder, not a single file. The canonical structure is:

```
workflow/
├── main.md              ← this document: the process map
├── plans/
│   └── main.md          ← how plans are structured and templated
├── reports/
│   └── main.md          ← how investigation/analysis reports work
└── requirements/
    └── main.md          ← how requirements are captured and managed
```

Not all projects need all sub-folders. Create a sub-folder when:
- The artifact type has its own naming convention, status model, or governance rules.
- Agents need a reference template to create new instances of that artifact.
- The artifact type has historical instances that agents must navigate.

Do not create sub-folders preemptively. If a project has no requirements artifacts, there is no `requirements/` folder.

---

## How to Write One

**Step 1 — Name the graph and determine instance behavior.**
Give the workflow a name. Decide whether it runs once at a time (single-instance) or may have multiple traversals running simultaneously (multi-instance). If multi-instance, define the unit-of-work ID slug vocabulary the project will use.

**Step 2 — Name the phases (nodes).**
List every stage that a unit of work passes through. For each node: name it, assign an owner role, define its input (what arrives), and define its output (what it produces). If a stage has no owner, it is not a stage — it is a gap.

**Step 3 — Define handoffs (edges).**
For each transition between nodes, define: the transition condition (when does the edge fire), the artifact that carries the handoff, what it must contain, and what the receiving role checks before acting.

**Step 4 — Write the invariants.**
What rules apply to all work in this project, regardless of phase? Write them as a numbered list with names. Invariants should be few, clear, and non-negotiable.

**Step 5 — Define escalation.**
For each phase, describe what causes an agent to stop and ask. The escalation definition should be specific enough that an agent can distinguish "I should escalate" from "I should proceed with a note."

**Step 6 — Describe the session model (mandatory for two or more roles).**
For workflows with two or more roles: map phases to sessions, identify pause points where the human switches between sessions, and describe what the agent should tell the human at each transition — including a copyable artifact path (always) and a copyable session-start prompt when a new session is required. Define when sessions are resumed within a flow versus started fresh at flow close. Skip this step only for single-role workflows.

**Step 7 — Define the backward pass.**
Describe the backward pass — which roles participate and where findings go. For traversal order, reference `$INSTRUCTION_IMPROVEMENT`. Do not specify ordering locally.

**Step 8 — Identify sub-documents.**
What artifact types does this project produce? For each type that needs a template or governance rules, create a sub-folder with a `main.md`. Link each sub-folder from the workflow `main.md`.

**Step 9 — Cut what does not belong.**
A workflow document that describes role responsibilities, vision, or tool choices in detail has drifted into other documents' territory. Extract those sections and link to the appropriate files.

---

## Format Rules

- **Process-first, not role-first.** Describe what happens to work, not what roles do. Roles are described in role documents.
- **One-line summary at the top.** Every workflow document should begin with a one-line summary of the workflow — what kind of work it processes, stated in one sentence. The Owner reads this to present the workflow menu at session start. Without a summary, the Owner must read and synthesize the full workflow to describe it, which wastes context.
- **Numbered phases.** Use numbered lists for ordered processes. Readers must be able to say "we are in phase 3" without ambiguity.
- **Named invariants.** Each invariant should have a short name (e.g., "Traceability Invariant") so agents can reference it precisely in handoffs and reports.
- **Instance-scoped references.** In multi-instance workflows only: every artifact reference (handoff files, status tokens, pre-replacement checks) must include the unit-of-work ID so that artifacts from concurrent instances do not collide. Single-instance workflows do not need unit-of-work IDs.
- **Stable by design.** A workflow document that changes every week is a sign the process has not been decided — not a sign it is being maintained. Decide the process, then write it down.

---

## Examples Across Project Types

### Software project
- **Phases**: Requirements (BA) → Technical Planning (Tech Lead) → Implementation (Sub-agents) → Verification (Tech Lead/Coordinator) → Acceptance (BA)
- **Key invariant**: Feature code is never written by the planning role — it is always delegated.
- **Key handoff**: Planning → Implementation requires a plan artifact; Implementation → Verification requires a completion report.

### Research project
- **Phases**: Question framing → Literature review → Analysis → Synthesis → Output
- **Key invariant**: No conclusions are drawn without evidence artifacts.
- **Key handoff**: Each phase produces a dated artifact that the next phase reads as input.

### Editorial / writing project
- **Phases**: Brief → Draft → Review → Revision → Final
- **Key invariant**: Reviewer comments are tracked as discrete items, each accepted or rejected explicitly.
- **Key handoff**: Draft → Review requires a complete draft; Review → Revision requires a marked-up artifact with classified comments.

---

## Extended Workflow Patterns

The linear, single-instance workflow is the default case. When your project's needs grow beyond it:

### Multiple instances of the same workflow

When the same workflow runs N times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate instance of the same graph. Define the unit-of-work ID slug vocabulary in the workflow document. Scope all handoff artifacts, status tokens, and pre-replacement checks to the instance via the unit-of-work ID. See `$INSTRUCTION_COMMUNICATION_CONVERSATION` for concurrent artifact naming.

### Branching

**Conditional branching:** when a node has multiple possible outgoing edges, define the transition condition for each. At runtime, the condition determines which edge fires — one edge fires per decision. Converging branches — multiple incoming edges leading to the same downstream node — use the same mechanics: each edge has its own condition; the downstream node defines what input it accepts from any arriving edge.

**Parallel fork and join:** a parallel fork fires multiple outgoing edges simultaneously — work continues in parallel branches without waiting for the other branches to complete. A join node waits for all required incoming edges before proceeding — partial arrival is a waiting state, not a transition condition. Use parallel forks when independent work can run concurrently and must be synchronized before the workflow continues. Define at the join node exactly what constitutes "all required inputs."

### Multiple distinct workflows

When the project has more than one workflow — a setup workflow and an ongoing execution workflow, for example — define each as a separate named graph with its own entry node and terminal node. Each workflow surfaces back to the Owner on completion; the Owner is the cross-workflow routing layer, deciding what to trigger next. Workflows do not hand off directly to each other.

### Cross-workflow handoffs

When a terminal node in one graph hands off to an entry node in another: use the same edge mechanics as within a single graph. Define the artifact, the transition condition, and the receiving node's input contract. The edge crosses graph boundaries; the mechanics do not change. Cross-workflow handoffs surface to the Owner before the next workflow is triggered.

These patterns are not separate complexity tiers. They are all graph traversal with decision points at edges. A project that starts with a linear graph can extend to any of these patterns without changing the underlying model — only the graph definition expands.

---

## What Makes a Workflow Document Fail

**Too abstract.** A workflow that says "work proceeds through phases" without naming the phases or the handoffs between them gives agents nothing to act on.

**Merged with role documents.** When *process rules* — invariants, transition conditions, escalation paths — are embedded in role documents, they diverge. Each role file holds its own version of the process, updated independently. The assembled process can only be reconstructed by reading every role document in sequence — and even then, the versions may conflict. Role documents should reference the workflow document for process rules; they should not contain them.

**No invariants.** Without explicit invariants, every edge case becomes a negotiation. The first time a constraint is challenged, the team discovers they never actually agreed on it.

**Updated reactively.** Workflow documents should be updated when the process is deliberately changed — not after every CR that exposed a gap. Reactive updates produce a patchwork of special cases rather than a coherent process.
