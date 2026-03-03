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

## What Belongs in a Workflow Document

A workflow document for any project must cover four things:

### 1. The Phases (mandatory)
What are the named stages that every unit of work passes through? Each phase should have:
- A clear entry condition (when does this phase begin?)
- A clear owner (which role runs this phase?)
- A clear output (what artifact or state ends this phase?)

Typical phases in a project with multi-role execution: intake → planning → implementation → verification → closure. The names and count will vary by project type.

### 2. Handoff Protocols (mandatory)
How does work pass from one role to the next? For each handoff:
- What artifact carries the handoff (a file, a message, a document)?
- What must be present in that artifact for the receiver to act?
- What does the receiver confirm before starting?

Handoff protocols prevent work from disappearing between roles. A phase without a defined handoff is a gap where things go silent.

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

**Step 1 — Name the phases.**
List every stage that a unit of work passes through in this project. Name each stage and assign an owner role. If a stage has no owner, it is not a stage — it is a gap.

**Step 2 — Define handoffs.**
For each transition between phases, define: what artifact carries the handoff, what it must contain, and what the receiving role checks before acting.

**Step 3 — Write the invariants.**
What rules apply to all work in this project, regardless of phase? Write them as a numbered list with names. Invariants should be few, clear, and non-negotiable.

**Step 4 — Define escalation.**
For each phase, describe what causes an agent to stop and ask. The escalation definition should be specific enough that an agent can distinguish "I should escalate" from "I should proceed with a note."

**Step 5 — Identify sub-documents.**
What artifact types does this project produce? For each type that needs a template or governance rules, create a sub-folder with a `main.md`. Link each sub-folder from the workflow `main.md`.

**Step 6 — Cut what does not belong.**
A workflow document that describes role responsibilities, vision, or tool choices in detail has drifted into other documents' territory. Extract those sections and link to the appropriate files.

---

## Format Rules

- **Process-first, not role-first.** Describe what happens to work, not what roles do. Roles are described in role documents.
- **Numbered phases.** Use numbered lists for ordered processes. Readers must be able to say "we are in phase 3" without ambiguity.
- **Named invariants.** Each invariant should have a short name (e.g., "Traceability Invariant") so agents can reference it precisely in handoffs and reports.
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

## What Makes a Workflow Document Fail

**Too abstract.** A workflow that says "work proceeds through phases" without naming the phases or the handoffs between them gives agents nothing to act on.

**Merged with role documents.** When workflow rules are scattered across role files, each role knows its piece but no one can see the whole process. Agents working across roles will apply inconsistent rules.

**No invariants.** Without explicit invariants, every edge case becomes a negotiation. The first time a constraint is challenged, the team discovers they never actually agreed on it.

**Updated reactively.** Workflow documents should be updated when the process is deliberately changed — not after every CR that exposed a gap. Reactive updates produce a patchwork of special cases rather than a coherent process.
