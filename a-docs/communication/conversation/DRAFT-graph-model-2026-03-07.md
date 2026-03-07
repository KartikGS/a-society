# Draft: Graph Model — All 6 Files
# For Owner review. Referenced from curator-to-owner.md.
# Do not implement until owner-to-curator.md shows APPROVED.

---

## FILE 1 OF 6: general/instructions/workflow/main.md
### Change type: Large (full rewrite shown)

---

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

**Edge** — a handoff between nodes. Every edge has a **transition condition**: the criterion that determines when work passes from one node to the next.

**Graph** — the complete workflow definition: the named set of nodes and edges describing how work moves from entry to completion.

**Instance** — one traversal of a graph. When the same workflow runs multiple times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate instance. Each instance is identified by a **unit-of-work ID**.

**Unit-of-work ID format:** `[short-slug]-[sequential-number]` (e.g., `acme-001`, `rebrand-003`). The slug is a human-readable label for the unit of work; the number disambiguates across time. The project defines its own slug vocabulary. In single-instance workflows, the unit-of-work ID is optional.

The simplest workflow — a linear sequence of phases, running once at a time — is a linear graph with a single active instance. It is the default case. Most of what follows describes how to build that case. Extended patterns (concurrent instances, branching, multiple graphs) are described at the end of this document.

---

## What Belongs in a Workflow Document

A workflow document for any project must cover four things:

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

**Step 6 — Identify sub-documents.**
What artifact types does this project produce? For each type that needs a template or governance rules, create a sub-folder with a `main.md`. Link each sub-folder from the workflow `main.md`.

**Step 7 — Cut what does not belong.**
A workflow document that describes role responsibilities, vision, or tool choices in detail has drifted into other documents' territory. Extract those sections and link to the appropriate files.

---

## Format Rules

- **Process-first, not role-first.** Describe what happens to work, not what roles do. Roles are described in role documents.
- **Numbered phases.** Use numbered lists for ordered processes. Readers must be able to say "we are in phase 3" without ambiguity.
- **Named invariants.** Each invariant should have a short name (e.g., "Traceability Invariant") so agents can reference it precisely in handoffs and reports.
- **Instance-scoped references.** In multi-instance workflows, every artifact reference (handoff files, status tokens, pre-replacement checks) must include the unit-of-work ID so that artifacts from concurrent instances do not collide.
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

When the same phase sequence runs N times simultaneously — parallel client engagements, concurrent assignments, simultaneous studies — each run is a separate instance of the same graph. Define the unit-of-work ID slug vocabulary in the workflow document. Scope all handoff artifacts, status tokens, and pre-replacement checks to the instance via the unit-of-work ID. See `$INSTRUCTION_COMMUNICATION_CONVERSATION` for concurrent artifact naming.

### Branching

When a node has multiple possible outgoing edges: define the transition condition for each. At runtime, the condition determines which edge fires. Converging branches — multiple incoming edges leading to the same downstream node — use the same mechanics: each edge has its own condition; the downstream node defines what input it accepts from any arriving edge.

### Multiple distinct workflows

When the project has more than one phase sequence — a setup workflow and an ongoing execution workflow, for example — define each as a separate named graph with its own entry node and terminal node. Graphs run independently.

### Cross-workflow handoffs

When a terminal node in one graph hands off to an entry node in another: use the same edge mechanics as within a single graph. Define the artifact, the transition condition, and the receiving node's input contract. The edge crosses graph boundaries; the mechanics do not change.

These patterns are not separate complexity tiers. They are all graph traversal with decision points at edges. A project that starts with a linear graph can extend to any of these patterns without changing the underlying model — only the graph definition expands.

---

## What Makes a Workflow Document Fail

**Too abstract.** A workflow that says "work proceeds through phases" without naming the phases or the handoffs between them gives agents nothing to act on.

**Merged with role documents.** When workflow rules are scattered across role files, each role knows its piece but no one can see the whole process. Agents working across roles will apply inconsistent rules.

**No invariants.** Without explicit invariants, every edge case becomes a negotiation. The first time a constraint is challenged, the team discovers they never actually agreed on it.

**Updated reactively.** Workflow documents should be updated when the process is deliberately changed — not after every CR that exposed a gap. Reactive updates produce a patchwork of special cases rather than a coherent process.

---
---

## FILE 2 OF 6: general/instructions/communication/conversation/main.md
### Change type: Small — Naming Conventions section only
### All other sections unchanged.

REPLACE the current Naming Conventions section (lines 79–90 in the baseline) with:

---

## Naming Conventions

Consistent naming makes it possible to locate conversation artifacts without reading every file:

- **Live artifacts:** `[sender-role]-to-[receiver-role].md` (e.g., `tech-lead-to-backend.md`)
- **Templates:** `TEMPLATE-[sender-role]-to-[receiver-role].md`
- **Clarification artifacts (if separate):** `TEMPLATE-[role-a]-[role-b]-clarification.md`

When two or more units of work are active at the same time (for example: concurrent sprints, client engagements, assignments, or studies), prefix live artifact filenames with the unit-of-work ID to prevent collisions:

- **Concurrent live artifacts:** `[unit-of-work-id]-[sender-role]-to-[receiver-role].md` (e.g., `acme-001-ba-to-tech-lead.md`)

The unit-of-work ID follows the format defined in the project's workflow document: `[short-slug]-[sequential-number]`. The slug is a human-readable label for the unit of work; the number disambiguates across time. The project's workflow document defines the slug vocabulary.

Use the base live-artifact naming (`[sender-role]-to-[receiver-role].md`) when only one unit is active at a time. In concurrent mode, unit-prefixed naming is required; in single-unit mode, it is optional.

Use role names as they appear in the project's role documents. Do not abbreviate differently from the role document names — inconsistent abbreviation creates lookup friction.

---
---

## FILE 3 OF 6: general/instructions/communication/coordination/main.md
### Change type: Small — three targeted additions
### All other content unchanged.

### ADDITION A — in Core Documents > Handoff Protocol, after the status vocabulary bullet

INSERT AFTER: "...and agents must be able to apply the right token without deliberation."

> In projects with multiple concurrent workflow instances, status tokens apply per instance: each instance's artifacts carry their own status, identified by the unit-of-work ID. The status of instance `acme-001` is independent of the status of `acme-002`. Status tokens do not aggregate across instances.

### ADDITION B — in Core Documents > Handoff Protocol, after the pre-replacement checks bullet

INSERT AFTER: "...Define the check procedure."

> In multi-instance workflows, the pre-replacement check must confirm that the specific instance being replaced has reached a terminal status — not merely that any prior instance was closed.

### ADDITION C — in How to Create Coordination Protocols > Step 1

INSERT AFTER: "...Keep the set minimal — every token must be distinguishable from all others, and agents must be able to apply the right token without deliberation."

> In projects with concurrent workflow instances, decide whether status is tracked globally (one status per handoff type) or per-instance (one status per unit-of-work ID per handoff type). For any project running multiple instances simultaneously, per-instance status tracking is required.

---
---

## FILE 4 OF 6: general/instructions/roles/main.md
### Change type: Small — one targeted addition in Primary Focus section
### All other content unchanged.

### ADDITION — in What Every Role Document Must Contain > Primary Focus, after the activation/closure condition bullets

REPLACE the two existing bullets plus the following sentence with:

```
- **Activation condition** — what event, handoff, or phase transition starts this role's authority for a unit of work. In a graph-based workflow, this corresponds to the incoming edge firing at the role's entry node.
- **Closure condition** — what outcome marks this role as done for that unit. In a graph-based workflow, this corresponds to the outgoing edge being ready to fire from the role's exit node.

When activation and closure map to graph edge conditions, an agent can determine from the handoff artifact alone whether it should act — the unit-of-work ID on the incoming artifact confirms which instance it is responsible for.

Without explicit activation and closure conditions, agents in phase-scoped roles cannot reliably determine when they should act or stand down.
```

(The final sentence "Without explicit activation and closure conditions..." is preserved from the original; only the bullets and one new paragraph are changed.)

---
---

## FILE 5 OF 6: general/instructions/communication/main.md
### Change type: Minimal — one sentence added to conversation/ description
### All other content unchanged.

### ADDITION — in Structure > conversation/ description

INSERT AFTER: "In practice, this folder holds live handoff files and the permanent templates that define their format."

> In projects with concurrent workflow instances, live artifacts are scoped to their instance via the unit-of-work ID. See `$INSTRUCTION_COMMUNICATION_CONVERSATION` for naming conventions.

---
---

## FILE 6 OF 6: general/instructions/improvement/main.md
### Change type: Minimal — one paragraph added in backward pass section
### All other content unchanged.

### ADDITION — in The Forward Pass and the Backward Pass, after "These are per-agent findings."

INSERT AFTER: "These are per-agent findings."

> In a graph-based workflow, the backward pass traverses the **path actually taken** by the instance under review — walking from the terminal node back to the entry node. In a branching graph, only the edges that fired during this instance are reviewed; not every possible path in the graph definition. Each node's agent reviews its output against the input it received on the traversed path.
