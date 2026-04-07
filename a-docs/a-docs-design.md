# a-docs Design Principles

These principles govern how agent-documentation is written, structured, and maintained in A-Society. Apply them when creating any `a-docs/` artifact, when reviewing a proposal, and during meta-analysis.

---

## 1. Progressive Context Disclosure

Agents receive information exactly when they need it - not before. Role documents do not contain phase instructions; they contain pointers to where phase instructions live. Instructions are read at the moment they become relevant.

**The pattern:** role document -> "when X occurs, read Y" -> Y contains the instructions -> Y may direct to Z.

**Anti-patterns:**
- Inline instructions in a role document that only apply at a specific phase
- Role-document sections that begin "when writing a brief..." or "when closing a forward pass..." - those instructions belong in the document the agent reads at that phase
- Providing detailed how-to content up front that the agent will not need until much later in the session, displacing context that matters now

---

## 2. No Redundancy With Injected Context

If a document is already in an agent's required readings or otherwise injected into starting context, do not also reference, explain, or link it elsewhere in the required-reading set. Every piece of information has one home.

**Anti-patterns:**
- Links from `agents.md` to documents that are already in required readings for some roles
- Sections that explain the index or required-readings mechanism when those are already handled by the runtime
- Links from `agents.md` to role-specific documents that only some agents read

---

## 3. Workflow-Conditional Instructions Belong in Phase Documents

If an instruction only applies when a specific workflow type is active or a specific phase has been reached, it belongs in the workflow or phase-specific document - not in the role document. A role document that contains TA advisory review instructions will be read by agents in flows that have no TA.

**Anti-patterns:**
- TA advisory review guidance in a general-purpose role document
- Forward pass closure discipline in a role document - belongs in a closure-phase document
- Brief-writing quality standards in a role document - belong in a document read when the brief is being written

---

## 4. Role Documents Are Routing Guides

A role document contains: who this agent is, what it owns, what it does not own, and what to read when specific moments arise. Nothing else.

What a role document does not contain:
- Instructions for how to execute a phase
- Quality standards for artifacts produced in a phase
- Review criteria for artifacts produced by other roles
- Behavioral guidance that only applies to some flows or some workflow types

---

## 5. agents.md Is a Minimal Orientation Entry Point

`agents.md` is the first document every agent reads. Its scope is: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants. Nothing else.

What `agents.md` does not contain:
- Links to documents already in required readings for any role
- Explanation of the index or the required-readings mechanism - handled by the runtime
- A roles table - the runtime assigns the role; the agent already knows what it is
- Any section whose information is available through another channel already in scope
