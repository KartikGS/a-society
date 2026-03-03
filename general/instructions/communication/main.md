# How to Create a Communication Folder

## What Is a Communication Folder?

A communication folder is the part of a project's agent-docs that governs how agents talk to each other. It does not describe roles, tools, or workflow phases. It describes the communication layer that connects those things: what artifacts agents pass between each other, what format those artifacts take, what rules govern when they are produced and consumed, and what happens when agents disagree.

Every multi-role project needs a communication folder. Without one, agents invent their own handoff formats, apply inconsistent status models, and have no shared protocol for escalation or dispute. The result is coordination failure that looks like execution failure.

---

## Why It Is a Separate Folder

Communication concerns cut across all roles and phases. They belong neither in a specific role document (which covers only that role's behavior) nor in the workflow document (which describes phases and ordering). They sit between those layers — defining the connective tissue.

If communication rules are placed in role documents, each role knows only its half of the contract. If placed in the workflow document, the workflow becomes a protocol reference rather than a process map. A dedicated folder keeps the separation clean.

---

## Structure

A communication folder has two sub-folders:

```
communication/
├── main.md           ← entry point: what this folder contains and how the two parts relate
├── conversation/     ← how agents exchange information: artifact formats, templates, lifecycle
└── coordination/     ← how agents govern that exchange: protocols, status models, escalation
```

### `conversation/`

Covers the actual artifacts agents exchange: what files carry handoffs, what fields they must contain, what the lifecycle of a conversation artifact is (when it is created, replaced, or archived). In practice, this folder holds live handoff files and the permanent templates that define their format.

See the sub-instruction: `conversation/main.md`.

### `coordination/`

Covers the standing rules that govern all agent communication: status models, handoff protocols, feedback paths for reporting discrepancies, and conflict resolution. These are not per-task artifacts — they are durable documents that change only when the process changes.

See the sub-instruction: `coordination/main.md`.

---

## What Belongs in Communication

A communication artifact or protocol belongs in this folder if it answers one of these questions:

- How does information flow from one role to another?
- What must a receiving agent confirm before acting on a handoff?
- What does an agent do when it discovers a flaw in a prior artifact?
- What happens when two agents disagree and cannot resolve it themselves?
- What is the canonical vocabulary for describing the state of a handoff?

**What does NOT belong here:**

- Role responsibilities — those live in role documents
- Workflow phases and sequencing — those live in the workflow document
- Tool decisions — those live in a tooling document
- Project vision or structure — those live in project-information documents

---

## How to Create One

**Step 1 — Identify the role pairs.**
List every pair of roles that must communicate during execution. For each pair, determine the direction of each handoff (A → B only, or bidirectional).

**Step 2 — Define the conversation layer.**
For each role-pair handoff: what artifact carries it, what fields it must include, what the receiver checks before acting, and when it is replaced. Write this into `conversation/main.md` and create templates for each handoff type.

**Step 3 — Define the coordination layer.**
Write a handoff protocol document: the canonical status model (every project needs one), the bidirectional clarification rules (can agents exchange rounds, or is the handoff one-way?), and the pre-replacement check for artifacts that are replaced per unit of work.

**Step 4 — Define the feedback path.**
Write a feedback protocol: what an agent does when it discovers a discrepancy, false assumption, or blocker in someone else's work. Define the reporting path, the acknowledgment requirement, and the resolution owner.

**Step 5 — Define conflict resolution.**
Write a conflict-resolution document: what happens when agents disagree, who has authority to resolve which type of conflict, and when the human must be consulted.

**Step 6 — Write the entry point.**
Write `communication/main.md` — a brief orientation that describes the two sub-folders and the relationship between them.

---

## What Makes a Communication Folder Fail

**Handoff formats defined only in role documents.** Each role knows its own half. The shared contract is implicit. When a new agent joins, it discovers the format by reading the other role's file — if it thinks to.

**No status vocabulary.** Agents describe state in natural language. "Done" means different things to different agents. One agent marks something complete before the receiver has verified it.

**Protocols buried in the workflow document.** The workflow becomes a policy reference. Agents reading it for phase sequencing must wade through protocol detail. Neither the process nor the protocols are easy to find.

**Feedback path undefined.** When a sub-agent finds a bug in the plan, it either silently works around it (losing traceability) or stops without knowing how to report. Both outcomes are worse than having a protocol.

---

## How Much Communication Structure Does a Project Need?

Scale the communication folder to the number of roles and the complexity of handoffs:

- **Two roles, simple handoff:** A single `conversation/` template and a brief `coordination/` document covering the status model and one escalation path may be sufficient.
- **Three or more roles with multi-directional handoffs:** Separate templates per role-pair, a full status model, bidirectional clarification rules, feedback protocol, and conflict resolution.
- **Asynchronous or long-running work:** Add pre-replacement checks, session state tracking, and explicit rules about artifact immutability once a unit of work is closed.

Do not create more coordination infrastructure than the project's actual handoff complexity requires. A two-person project with one handoff direction does not need a conflict-resolution document.
