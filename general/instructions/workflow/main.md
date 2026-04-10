# How to Create a Workflow Document

## What Is a Workflow Document?

A workflow document describes the repeatable process by which work moves through a project — from raw input to verified, closed output. It answers:

> "How does work get done here? What nodes exist, how does work move between them, and who owns each one?"

It is not a role document. It is not a requirements template. It is the living map of the project's execution loop — the document every agent consults when they ask "what do I do next?"

It is also the delivery surface for node-linked support docs. If a role needs a companion document at proposal time, review time, implementation, or closure, the workflow is the place that says "read this now."

A workflow document is read at workflow entry and referenced during execution. It must be specific enough to prevent guessing and stable enough to survive many CRs without requiring constant updates.

---

## Why Every Project Needs One

Without a workflow document, agents improvise process. They infer what "done" means, guess transition rules, and make up sequencing logic. The result is inconsistency that compounds across runs:

- One agent marks a task done before verification; another reopens it.
- Transition artifacts show up in different formats depending on who wrote them.
- No one agrees on when to escalate vs. proceed.
- Each new run re-litigates process decisions that were already made.

A workflow document converts implicit process knowledge into explicit, referenceable rules. Once written, every agent — regardless of role or run — operates from the same playbook.

**Without a workflow document, process is negotiated at runtime. With one, it is declared in advance.**

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
- **Human-collaborative** *(when applicable)* — the nature of human contribution to this node. Presence of this field indicates the assigned agent acts as the human interface for this work; see the Human-Collaborative Node Pattern in Section 1
- **Notes** *(when applicable)* — node-specific cautions, edge cases, or constraints that do not belong in global invariants

**Transition (edge)** — the rule by which work moves between nodes. Every transition has a **transition condition**: the criterion that determines when work passes from one node to the next. Transitions also have a **direction property**:

- **Unidirectional** (default) — work passes in one direction only. The downstream node completes its work and the transition fires onward.
- **Bidirectional** — the downstream node may send a message upstream and receive a response without exiting the current node. The downstream node enters a waiting state (not complete) until the response arrives, then resumes. Designate a transition as bidirectional when the downstream node may need clarification from the upstream node during execution — information it cannot resolve independently and that the upstream node must provide.

**Parallel fork** — a node may have multiple outgoing transitions that fire simultaneously, producing parallel execution branches. Use when work can proceed concurrently across different roles or instances before converging downstream.

**Join** — a node that requires inputs from multiple incoming transitions before it can proceed. The node waits until all required inputs have arrived. Partial arrival is a waiting state, not a transition. Join nodes are the downstream convergence point for parallel forks.

**Graph** — the complete workflow definition: the named set of nodes and transitions describing how work moves from entry to completion.

**Instance** — one traversal of a graph. When the same workflow runs multiple times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate instance. Each instance is identified by a **unit-of-work ID**.

**Unit-of-work ID format:** `[short-slug]-[sequential-number]` (e.g., `acme-001`, `rebrand-003`). The slug is a human-readable label for the unit of work; the number disambiguates across time. The project defines its own slug vocabulary. In single-instance workflows, the unit-of-work ID is optional.

The simplest workflow — a linear sequence of nodes, running once at a time — is a linear graph with a single active instance. It is the default case. Most of what follows describes how to build that case. Extended patterns (concurrent instances, branching, multiple graphs) are described at the end of this document.

---

## The Owner as Workflow Entry and Terminal Node

The **Owner** is both the universal entry point and the terminal node for every workflow.

**Entry:** users always begin by assigning the Owner role and pointing the agent at `agents.md`. After loading context (which includes the workflow document), the Owner presents the available workflows and helps the user decide what to work on. The Owner routes work into workflows by creating the trigger input and directing the work to the correct entry node.

**Terminal:** every workflow surfaces back to the Owner on completion. The closing role in a workflow does not silently close — it hands the result to the Owner. The Owner acknowledges completion, logs it, and determines whether any follow-up is needed. This closed loop ensures the Owner is always aware of what has been finished.

**Backward pass ordering:** the Owner, having received terminal confirmation, directs the backward pass. For traversal order, see `$INSTRUCTION_IMPROVEMENT` — ordering is defined there and is not restated here.

This means:
- **Only the Owner reads the full workflow map.** Other agents receive well-formed input artifacts at their nodes — they see their node contract (input, work, output), not the entire graph.
- **The Owner routes work into workflows.** When the user picks a workflow or describes a need, the Owner creates the trigger input and identifies the next node or role to act.
- **Freeform work is valid.** The Owner can engage in discussion, direction-setting, or exploratory thinking without entering any workflow. Not every interaction needs a workflow.

**Exception: delegated-authority flows.** A project may designate certain flow types as delegated-authority — where a specific role has standing authority to close without Owner terminal confirmation. For these flows, that role serves as the terminal node. The scope of delegated-authority flows must be explicitly bounded in the workflow document itself: direction decisions, library-level additions, and structural changes may not fall within them. The Owner-as-terminal principle applies to all other flows.

Every workflow document should include a **one-line summary** suitable for the Owner to present during workflow selection. This summary is how users discover what workflows are available without reading the full workflow document.

### Routing means routing, not doing

The Owner routes work into the workflow. The Owner does not collapse all nodes into itself.

When the human directs a change — even a small one — that change should enter the workflow at the appropriate trigger point so that the designed role separation is preserved. The Owner receives the human's direction, formulates it as a trigger input, and hands it off to the role that owns the entry node. Each subsequent node brings its own expertise and perspective.

An Owner that receives direction and immediately implements it has bypassed every downstream perspective the workflow was designed to include. The result may be fast, but it is not structurally verified — no second role checked the work, no node contract validated the transition, no expert other than the Owner applied their judgment.

The workflow exists because the project decided that completeness requires multiple perspectives. Human-directed work is not exempt from that decision.

---

## What Belongs in a Workflow Document

A workflow document for any project must cover these sections:

### 1. Nodes (mandatory)

What are the named nodes that every unit of work passes through? Every node must define:
- **Owner** — which role runs this node. The node owner is always an agent role — never a human. Human involvement is encoded via the `Human-collaborative` field.
- **Required readings** *(when applicable)* — any node-linked support docs the role must read at this node. The workflow is the place that surfaces these docs at the moment they become relevant.
- **Inputs** — what arrives from prior nodes (the entry condition for this node)
- **Work** — what the assigned role must do at this node
- **Outputs** — what artifact or state this node produces
- **Transitions** — the outgoing transition or transitions available from this node, including their conditions
- **Human-collaborative** *(when applicable)* — the nature of human contribution to this node. Presence of this field indicates the assigned agent acts as the human interface for this work; see the Human-Collaborative Node Pattern below.
- **Notes** *(when applicable)* — node-specific cautions, limits, or clarifications that do not belong in global invariants

#### Human-Collaborative Node Pattern

When a node carries a `Human-collaborative` field, the agent assigned to that node acts as the interface between the human and the workflow. The agent has three obligations:

1. **Surface context** — present the relevant context to the human so they can contribute effectively.
2. **Elicit contribution** — draw out the decisions, direction, or work the human provides.
3. **Author the artifact** — write the outgoing artifact, encoding the human's contribution in the correct format.

The agent authors every artifact regardless of how much of the underlying work or decision came from the human. This preserves workflow structural integrity: every artifact is agent-authored, every transition contract is preserved, and no artifact quality depends on the human's willingness or ability to produce structured output.

**Value format:** The `Human-collaborative` field value is a brief phrase naming the nature of the human's contribution — `direction`, `decision`, `content`, `approval`, or similar. A descriptive value tells the agent what to surface and elicit.

**Structural rule:** The entry node of every workflow carries the `Human-collaborative` field. The direction source is always the human — the human identifies the need, direction change, or trigger that initiates the flow. The entry node's assigned agent (typically the Owner) is always the interface for this initiation. No other nodes carry this field by default; add it to a node only when the human must actively contribute content, decisions, or direction within that node.

Typical nodes in a project with multi-role execution: intake → planning → implementation → verification → closure. The names and count will vary by project type.

### 2. Transitions (mandatory)

How does work pass from one node to the next? Each transition is an edge in the workflow graph. Define transitions as part of the relevant node contracts; use a separate edge table only when the graph is dense enough that node-local transitions become hard to read. For each transition:
- What is the **transition condition** — when does this transition fire?
- What artifact carries the transition (a file, a message, a document)?
- What must be present in that artifact for the receiver to act?
- What does the receiver confirm before starting?

Transition rules prevent work from disappearing between roles. A node without a defined outgoing transition is a gap where things go silent.

**For bidirectional transitions**, define additionally:
- Under what condition the downstream node may invoke the back-channel — what constitutes a genuine blocker vs. something the downstream node should resolve independently
- What artifact carries the question upstream and the response downstream
- What the downstream node's state is while waiting (paused, not complete — distinct from a normal node completion)
- How the exchange terminates and the downstream node resumes

**For multi-role projects:** the workflow document carries a lightweight summary of transitions only — who passes to whom and what the receiver checks. Artifact formats, status models, and detailed coordination protocols belong in a communication folder, not here. Embedding protocol detail in the workflow document conflates process sequencing with coordination rules and makes both harder to maintain. See `$INSTRUCTION_COMMUNICATION`. Create the communication folder alongside the workflow document for any project with two or more roles.

### 3. Invariants (mandatory)

What rules are true for every unit of work, regardless of node? Invariants are non-negotiable — they do not bend for speed, convenience, or unusual CRs. Examples:
- Every closed artifact must have a corresponding open artifact.
- Historical artifacts are immutable once closed.
- Scope extensions require explicit approval before implementation resumes.

Invariants belong in the workflow document, not in individual role documents, because they apply to all roles.

### 4. Escalation Rules (mandatory)

When does an agent stop and ask rather than proceed? Define explicit conditions:
- What constitutes a blocker vs. a manageable uncertainty?
- Who receives the escalation?
- What information must the escalation include?

### 5. Forward Pass Closure (mandatory)

What happens when the forward pass ends? Every workflow document must name a forward pass closure step — the terminal node of the forward pass, which runs before the backward pass begins. This step is where the workflow consolidates its closure obligations: updating the project log, invoking any required tooling, and verifying that all approved tasks have been executed, not merely approved. Scattering these obligations across role documents and coordination protocols means they are invisible at the point they are needed; naming a closure step makes them visible and checkable.

The two universal rules governing forward pass closure are stated in the project's workflow routing index (see the "Forward Pass Closure" section). Every workflow's closure step inherits those rules without restating them.

### 6. Backward Pass (mandatory)

What is the improvement loop after a flow closes? A backward pass is a structured reflection run after a flow completes — each participating role reviews its own node work for what worked, what failed, and what should change.

A backward pass entry in the workflow document names the roles involved and where findings go. For traversal order, reference `$INSTRUCTION_IMPROVEMENT` — do not specify ordering locally. The improvement file is the authoritative source for the backward pass algorithm.

---

## What Does NOT Belong

- **Role definitions** — who the agents are and what they own belongs in role documents
- **Tool declarations** — what software to use belongs in a tooling document
- **Project vision** — why the project exists belongs in a vision document
- **Specific artifact templates** — how to format a plan or requirement belongs in sub-documents (`workflow/plans/`, `workflow/reports/`, `workflow/requirements/`)
- **Historical records** — completed work artifacts live alongside the workflow, not inside it

If the workflow document grows sections that describe specific artifact formats or role-specific behaviors in depth, those sections belong in sub-documents. The workflow document describes the process; sub-documents describe the artifacts produced by that process.

What does belong here when relevant is the node-entry cue that activates a support doc: the workflow says when a role must read it.

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

**Step 2 — Define the nodes.**
List every node that a unit of work passes through. For each node: name it, assign an owner role, list required readings, define its inputs and outputs, define the work performed there, note whether the node requires human collaboration (see the Human-Collaborative Node Pattern in Section 1), and record any node-specific notes. The entry node always carries the `Human-collaborative` field as a structural rule. If a node has no owner, it is not a node — it is a gap.

**Step 3 — Define transitions.**
For each outgoing transition from each node, define: the transition condition (when does the transition fire), the artifact that carries it, what that artifact must contain, and what the receiving role checks before acting.

**Step 4 — Write the invariants.**
What rules apply to all work in this project, regardless of node? Write them as a numbered list with names. Invariants should be few, clear, and non-negotiable.

**Step 5 — Define escalation.**
Define what causes an agent to stop and ask. The escalation definition should be specific enough that an agent can distinguish "I should escalate" from "I should proceed with a note." Add node-specific escalation notes only when a node truly needs special handling.

**Step 6 — Define the forward pass closure step.**
Name the closure obligations for this workflow — what the terminal Owner node must confirm and execute before declaring the forward pass closed. Do not restate the two universal rules (current-flow scoping and synthesis-is-terminal) — reference the workflow routing index instead.

**Step 7 — Define the backward pass.**
Describe the backward pass — which roles participate and where findings go. For traversal order, reference `$INSTRUCTION_IMPROVEMENT`. Do not specify ordering locally.

**Step 8 — Identify sub-documents.**
What artifact types does this project produce? For each type that needs a template or governance rules, create a sub-folder with a `main.md`. Link each sub-folder from the workflow `main.md`.

**Step 9 — Cut what does not belong.**
A workflow document that describes role responsibilities, vision, or tool choices in detail has drifted into other documents' territory. Extract those sections and link to the appropriate files. A role document that enumerates node-triggered "before X, read Y" cues has drifted in the other direction; move those cues back into the workflow.

---

## Routing Complexity at Intake

When routing incoming work into an existing workflow, the Owner determines the proportional path through the graph — not all work warrants the full pipeline. For the five complexity axes, the three-tier routing model, and the intake routing procedure: see `$INSTRUCTION_WORKFLOW_COMPLEXITY`.

This instruction defines the reusable model. A mature project should usually instantiate it in a project-local operational complexity document and point live workflow docs to that local document, rather than sending agents directly to the general instruction during execution.

---

## Modifying an Existing Workflow

When an existing workflow needs to change — adding a new flow type, modifying a node, changing a transition, or adjusting an invariant — do not edit the workflow document directly. A workflow modification is a structured operation: it must be proposed, reviewed, and approved before implementation.

For the complete modification procedure, the single-graph model, evaluative principles, and hard rules: see `$INSTRUCTION_WORKFLOW_MODIFY`.

---

## Format Rules

- **Process-first, not role-first.** Describe what happens to work, not what roles do. Roles are described in role documents.
- **One-line summary at the top.** Every workflow document should begin with a one-line summary of the workflow — what kind of work it processes, stated in one sentence. The Owner reads this to present the workflow options at routing time. Without a summary, the Owner must read and synthesize the full workflow to describe it, which wastes context.
- **Node-first structure.** Organize the workflow around named node contracts with explicit outgoing transitions. Number nodes only when order itself carries meaning; do not rely on phase numbering as the primary model.
- **Named invariants.** Each invariant should have a short name (e.g., "Traceability Invariant") so agents can reference it precisely in transitions and reports.
- **Instance-scoped references.** In multi-instance workflows only: every artifact reference (transition artifacts, status tokens, pre-replacement checks) must include the unit-of-work ID so that artifacts from concurrent instances do not collide. Single-instance workflows do not need unit-of-work IDs.
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

The linear, single-instance workflow is the default case. When your project's needs grow beyond it:

### Multiple instances of the same workflow

When the same workflow runs N times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate instance of the same graph. Define the unit-of-work ID slug vocabulary in the workflow document. Scope all transition artifacts, status tokens, and pre-replacement checks to the instance via the unit-of-work ID. See `$INSTRUCTION_COMMUNICATION_CONVERSATION` for concurrent artifact naming.

### Branching

**Conditional branching:** when a node has multiple possible outgoing transitions, define the transition condition for each. At runtime, the condition determines which transition fires — one transition fires per decision. Converging branches — multiple incoming transitions leading to the same downstream node — use the same mechanics: each transition has its own condition; the downstream node defines what input it accepts from any arriving transition.

**Parallel fork and join:** a parallel fork fires multiple outgoing transitions simultaneously — work continues in parallel branches without waiting for the other branches to complete. A join node waits for all required incoming transitions before proceeding — partial arrival is a waiting state, not a transition condition. Use parallel forks when independent work can run concurrently and must be synchronized before the workflow continues. Define at the join node exactly what constitutes "all required inputs."

### Multiple distinct workflows

When the project has more than one workflow — a setup workflow and an ongoing execution workflow, for example — define each as a separate named graph with its own entry node and terminal node. Each workflow surfaces back to the Owner on completion; the Owner is the cross-workflow routing layer, deciding what to trigger next. Workflows do not hand off directly to each other.

#### Index-based routing

When a project maintains two or more **permanent, distinct execution loops** — each with its own ongoing operational cadence, distinct node sequence, and distinct role composition — organize them using an index-based structure:

1. Define each workflow as its own named file in `workflow/` (e.g., `workflow/[name].md`), each with its own YAML frontmatter graph.
2. Convert `workflow/main.md` into a **routing index**: a lightweight file that names each workflow, provides a one-line summary, and links to its file.
3. Register each workflow file in the project's file path index with its own variable name.
4. Place any rules that apply universally across all of the project's workflows — particularly routing guidance and workflow-selection cues — in the routing index, not duplicated in each workflow file.

**When to use this structure:**
- Two or more distinct workflow types exist simultaneously and are both active
- Each represents a permanent, ongoing cadence (not a one-off, setup, or temporary process)
- The workflows are structurally distinct enough that a single `main.md` would force agents to read irrelevant material to reach the workflow governing their current work

**When not to use this structure:**
- Only one workflow exists (a workflow with conditional branching is not "multiple workflows")
- The second workflow is transient — a one-time setup or initialization workflow does not warrant an index structure

**Routing index format:** The index is not a summary of each workflow — it gives the Owner exactly what they need to present the available workflows and route work: the workflow name, a one-line summary, a file reference, an optional "use it when" cue, and any universal cross-workflow rules. It does not duplicate node definitions, transitions, or invariants from the workflow files.

**Variable naming:** When registering multiple workflows, use a naming convention that makes the role of each variable clear (e.g., `$PROJECT_WORKFLOW` for the index, `$PROJECT_WORKFLOW_[NAME]` for each workflow file).

**Cross-reference updates:** When splitting a single `workflow/main.md` into an index plus workflow files, audit all existing references to the original variable (e.g., `$PROJECT_WORKFLOW`) for section citations (e.g., *"See `$PROJECT_WORKFLOW` 'Use it when'"*). Determine whether the cited section moves to a specific workflow file or belongs in the index. Update references accordingly, or ensure the index owns the cited content so existing references remain valid.

### Multi-domain parallel-track flows (single workflow)

When **one unit of work** spans **multiple domains or role types** (e.g., documentation, implementation track A, implementation track B) that can proceed **in parallel until a synchronization point**, model it as **a single workflow graph** with **parallel forks and at least one join** — not as separate workflows chosen because the work "touches more than one area."

**What this is:** One instance, one workflow name, one record of the work. Branches run concurrently where transitions are independent; a join node waits for all required inputs before the workflow continues toward closure.

**What this is not:** It is not the same as **multiple distinct workflows** (separate named graphs with separate entry/terminal behavior). If the work is truly one feature or one decision thread, splitting it into multiple workflows fragments accountability and obscures transitions. Use multiple workflows only when the project maintains **permanent, distinct execution loops** that meet the criteria in the "Multiple distinct workflows" section above.

**When to use:** Independent implementation or review tracks exist; a single planning or architecture node can feed all tracks; convergence is required before verification, acceptance, or publication.

**Graph pattern (abstract):** Planning or architecture node → **parallel fork** to two or more domain tracks → **join** → downstream verification or closure nodes. Role names are project-specific; the structure is generic.

**Checkpoints and approvals:** When a parallel track includes work that **must not proceed without a governance or approval step** (e.g., a shared library change that requires Owner or steward approval before implementation continues), model that step explicitly in the graph: either a **node** whose output is approval, or a **bidirectional transition** for clarification/approval, so the track does not silently bypass the approval obligation. The exact mechanics follow the same transition and bidirectional-transition rules defined earlier in this document.

**Owner routing:** The Owner still routes the unit of work **into** this workflow once and receives **terminal** confirmation once; parallel tracks do not remove Owner-as-terminal unless the workflow document declares a delegated-authority exception that explicitly covers the work class.

**Parallel-track declaration:** State explicitly which tracks may run in parallel and where joins force ordering. Parallelism is a graph property, not a separate coordination model.

### Cross-workflow transitions

When a terminal node in one graph transitions to an entry node in another: use the same transition mechanics as within a single graph. Define the artifact, the transition condition, and the receiving node's input contract. The transition crosses graph boundaries; the mechanics do not change. Cross-workflow transitions surface to the Owner before the next workflow is triggered.

These patterns are not separate complexity tiers. They are all graph traversal with decision points at transitions. A project that starts with a linear graph can extend to any of these patterns without changing the underlying model — only the graph definition expands.

---

## What Makes a Workflow Document Fail

**Too abstract.** A workflow that says "work proceeds through stages" without naming the nodes or the transitions between them gives agents nothing to act on.

**Merged with role documents.** When *process rules* — invariants, transition conditions, escalation paths — are embedded in role documents, they diverge. Each role file holds its own version of the process, updated independently. The assembled process can only be reconstructed by reading every role document in sequence — and even then, the versions may conflict. Role documents should reference the workflow document for process rules; they should not contain them.

**No invariants.** Without explicit invariants, every edge case becomes a negotiation. The first time a constraint is challenged, the team discovers they never actually agreed on it.

**Updated reactively.** Workflow documents should be updated when the process is deliberately changed — not after every CR that exposed a gap. Reactive updates produce a patchwork of special cases rather than a coherent process.
