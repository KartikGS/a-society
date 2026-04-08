# a-docs Design Principles

These principles govern how a project's agent-documentation is written, structured, and maintained. Apply them when creating any `a-docs/` artifact, when reviewing a proposal, and during meta-analysis.

---

## 1. Progressive Context Disclosure

Agents receive information exactly when they need it - not before. True just-in-time delivery means the active workflow or phase document surfaces the support doc at the node or gate where it is needed. Role documents do not contain phase instructions; at most they point to the workflow as the delivery surface for those instructions.

**The pattern:** role document -> workflow document -> phase or node says "read support doc Y now" -> Y contains the instructions -> Y may direct to Z.

**Anti-patterns:**
- Inline instructions in a role document that only apply at a specific phase
- Role-document sections that enumerate phase-triggered cues such as "before writing a brief..." or "before closing a forward pass..." - those cues belong in the workflow or phase document that creates the moment
- Pointer-only JIT: a role document names a support doc, but the active workflow never surfaces it at the phase where it must actually be read
- Providing detailed how-to content up front that the agent will not need until much later in the session, displacing context that matters now

---

## 2. No Redundancy With Injected Context

If a document is already in an agent's starting context via required readings or runtime injection, do not also reference, explain, or link it elsewhere in the required-reading set. Every piece of information has one home.

**Anti-patterns:**
- Links from `agents.md` to documents that are already in required readings for some roles
- Sections that explain the index or required-readings mechanism when those are already handled by the project's session-start mechanism
- Links from `agents.md` to role-specific documents that only some agents read

---

## 3. Workflow-Conditional Instructions Belong in Phase Documents

If an instruction only applies when a specific workflow type is active or a specific phase has been reached, it belongs in the workflow or phase-specific document - not in the role document. The workflow or phase document is not just the storage location; it is the delivery mechanism for that instruction. A role document that contains workflow-conditional review guidance will be read in flows where that guidance does not apply, and a role document that merely points to the support doc without the workflow surfacing it still relies on memory rather than true phase-entry delivery.

**Anti-patterns:**
- Workflow-specific review guidance in a general-purpose role document
- Forward pass closure discipline in a role document - belongs in a closure-phase document
- Brief-writing quality standards in a role document - belong in a document read when the brief is being written

---

## 4. Role Documents Are Routing Guides

A role document contains: who this agent is, what it owns, what it does not own, and where phase-specific support guidance is delivered. Nothing else.

What a role document does not contain:
- Instructions for how to execute a phase
- Quality standards for artifacts produced in a phase
- Review criteria for artifacts produced by other roles
- Behavioral guidance that only applies to some flows or some workflow types
- An enumerated list of phase-triggered "before X, read Y" reminders

---

## 5. agents.md Is a Minimal Orientation Entry Point

`agents.md` is the first document every agent reads. Its scope is: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants. Nothing else.

What `agents.md` does not contain:
- Links to documents already in required readings for any role
- Explanation of the index or the required-readings mechanism when those are already handled by the project's session-start mechanism
- A roles table - role assignment happens outside `agents.md`
- Any section whose information is available through another channel already in scope
