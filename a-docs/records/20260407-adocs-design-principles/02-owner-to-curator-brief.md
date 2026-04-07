# Owner → Curator: Briefing

**Subject:** a-docs Design Principles — JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion
**Status:** BRIEFED
**Date:** 2026-04-07

---

## Agreed Change

**Files Changed:**

| Target | Action | Authority |
|---|---|---|
| NEW: `a-society/a-docs/a-docs-design.md` (`$A_SOCIETY_ADOCS_DESIGN`, proposed) | additive | [Requires Owner approval] |
| NEW: `a-society/general/a-docs-design.md` (`$GENERAL_ADOCS_DESIGN`, proposed) | additive | [Requires Owner approval] |
| NEW: `a-society/general/instructions/a-docs-design.md` (`$INSTRUCTION_ADOCS_DESIGN`, proposed) | additive | [Requires Owner approval] |
| `a-society/a-docs/agents.md` (`$A_SOCIETY_AGENTS`) | modify — remove four sections | [Requires Owner approval] |
| `a-society/a-docs/roles/owner.md` (`$A_SOCIETY_OWNER_ROLE`) | modify — remove phase-specific sections, add pointers; extracted documents created at Curator-proposed locations | [Requires Owner approval] |
| NEW: extracted owner.md phase documents (count and paths TBD — Curator proposes) | additive | [Requires Owner approval] |
| `a-society/a-docs/improvement/meta-analysis.md` (`$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`) | modify — add a-docs anti-pattern checks | [Requires Owner approval] |
| `a-society/general/improvement/meta-analysis.md` (`$GENERAL_IMPROVEMENT_META_ANALYSIS`) | modify — add generalizable a-docs anti-pattern checks + repeated-header guidance (absorbed from Next Priorities) | [Requires Owner approval] |
| `a-society/a-docs/indexes/main.md` (`$A_SOCIETY_INDEX`) | additive — register new a-docs file and extracted documents | [Curator authority — implement directly] |
| `a-society/index.md` (`$A_SOCIETY_PUBLIC_INDEX`) | additive — register new general files | [Curator authority — implement directly] |
| `a-society/a-docs/a-docs-guide.md` (`$A_SOCIETY_AGENT_DOCS_GUIDE`) | additive — add entry for `a-docs-design.md` | [Curator authority — implement directly] |
| `$GENERAL_MANIFEST` | modify — add `a-docs-design.md` as required stub entry if appropriate | [Curator authority — implement directly, flag if requires Owner judgment] |

Note: The proposed variable names `$A_SOCIETY_ADOCS_DESIGN`, `$GENERAL_ADOCS_DESIGN`, and `$INSTRUCTION_ADOCS_DESIGN` are provisional. The Curator may propose adjustments in the proposal submission, and registration in both indexes will define the canonical names.

---

### Background: The Direction

The human and Owner have aligned on a new architectural principle for how a-docs is authored: **just-in-time (JIT) context disclosure**. The current model front-loads context at session start — role documents contain all instructions inline, agents.md explains things the runtime already handles. The new model: agents receive pointers, not content, and pull the right document at the moment it becomes relevant. Instructions are fresh because they are read exactly when needed.

This flow establishes this principle in writing, applies it immediately to the two most degraded existing documents (`agents.md` and `owner.md`), and embeds it as a standing obligation in the meta-analysis phase so future degradation is caught.

---

### Item 1: a-docs Design Principles — Three-Layer Structure

Establish the JIT context model as written design principles. Three files:

**A. `a-society/a-docs/a-docs-design.md`** — A-Society's own instance. Content:

```
# a-docs Design Principles

These principles govern how agent-documentation is written, structured, and maintained
— for A-Society and for every project initialized from it. Apply them when creating
any a-docs artifact, when reviewing a proposal, and during meta-analysis.

---

## 1. Progressive Context Disclosure

Agents receive information exactly when they need it — not before. Role documents do
not contain instructions; they contain pointers to where instructions live. Instructions
are read at the moment they become relevant.

**The pattern:** role document → "when X occurs, read Y" → Y contains the instructions
→ Y may direct to Z.

**Anti-patterns:**
- Inline instructions in a role document that only apply at a specific phase
- Role document sections that begin "when writing a brief..." or "when closing a forward
  pass..." — those instructions belong in the document the agent reads at that phase
- Providing detailed how-to content upfront that the agent will not need until much later
  in the session, displacing relevant context

---

## 2. No Redundancy With Injected Context

If a document is already in an agent's required readings or injected by the runtime,
do not also reference, explain, or link it elsewhere in the required-reading set. Every
piece of information has one home.

**Anti-patterns:**
- Links from agents.md to documents that are already in required readings for some roles
- Sections that explain the index or required-readings mechanism when those are already
  handled by the runtime
- Links from agents.md to role-specific documents that only some agents read

---

## 3. Workflow-Conditional Instructions Belong in Phase Documents

If an instruction only applies when a specific workflow type is active or a specific phase
has been reached, it belongs in the workflow or phase-specific document — not in the role
document. A role document that contains TA advisory review instructions will be read by
agents in flows that have no TA.

**Anti-patterns:**
- TA advisory review guidance in a general-purpose role document
- Forward pass closure discipline in a role document — belongs in a closure-phase document
- Brief-writing quality standards in a role document — belong in a document read when the
  brief is being written

---

## 4. Role Documents Are Routing Guides

A role document contains: who this agent is, what it owns, what it does not own, and
what to read when specific moments arise. Nothing else.

What a role document does not contain:
- Instructions for how to execute a phase
- Quality standards for artifacts produced in a phase
- Review criteria for artifacts produced by other roles
- Behavioral guidance that only applies to some flows or some workflow types

---

## 5. agents.md Is a Minimal Orientation Entry Point

agents.md is the first document every agent reads. Its scope is: what the project is
(one paragraph) and the authority/conflict resolution model. Nothing else.

What agents.md does not contain:
- Links to documents already in required readings for any role
- Explanation of the index or the required-readings mechanism — handled by the runtime
- A roles table — the runtime assigns the role; the agent already knows what it is
- Any section whose information is available through another channel already in scope
```

**B. `a-society/general/a-docs-design.md`** — The project-agnostic ready-made template. Curator adapts the above content to be generic (replacing any A-Society-specific framing with project-neutral language). This is the file a new project adopts directly.

**C. `a-society/general/instructions/a-docs-design.md`** — The instruction for how to create and maintain a-docs-design for any project. Content should cover:
- What a-docs-design is and why it is needed (pointer to the ready-made template)
- When to instantiate it (during project initialization)
- How to maintain it: update it when the project's a-docs structure changes; meta-analysis flags violations
- How the principles interact with the improvement protocol (meta-analysis obligations)

---

### Item 2: agents.md Cleanup — Remove Four Sections

Four sections of `a-society/a-docs/agents.md` are anti-patterns under the new principles. Remove them:

**Remove 1 — vision link line:** Under "## What Is This Project?", remove the line:
> `Full vision: [\`$A_SOCIETY_VISION\`] — resolve via \`$A_SOCIETY_INDEX\`.`

Rationale: `$A_SOCIETY_VISION` is in required readings for roles that need it. Linking it in `agents.md` creates redundancy for those roles and false signal for roles that don't read it.

**Remove 2 — entire "## File Path Index" section:** The section beginning "Key file locations are registered in..." through "...confirm no stale paths remain." Rationale: The index is injected into every agent's context by the runtime. Explaining it in agents.md is redundant.

**Remove 3 — entire "## Roles" section:** The table and both paragraphs below it ("Additional roles will be added here..." and "**Role assignment:** Roles are assigned by the human..."). Rationale: Agents know their role from the runtime assignment. A complete roles table in agents.md is information the agent will not use.

**Remove 4 — entire "## Required Readings Authority" section:** The two-sentence section beginning "All universal and role-specific required readings..." Rationale: This describes the runtime mechanism. Agents do not need to know how the runtime works; they need to know what to do.

The resulting agents.md retains: "## What Is This Project?" (first paragraph only, after the vision link removal), "## Authority & Conflict Resolution", and "## Invariants".

---

### Item 3: owner.md Restructure

`a-society/a-docs/roles/owner.md` currently contains phase-specific instructions inline — Brief-Writing Quality, Constraint-Writing Quality, TA Advisory Review, Forward Pass Closure Discipline, and Review Artifact Quality. These violate Principles 3 and 4. They must be extracted to documents the Owner reads at the right phase, and replaced in `owner.md` with single-line pointers.

**Sections to extract** (content moves to new documents; owner.md retains one-line pointer):

| Section | Pointer line to add in owner.md |
|---|---|
| "## Brief-Writing Quality" + "## Constraint-Writing Quality" | When writing a brief, read `$A_SOCIETY_OWNER_BRIEF_WRITING`. |
| "## TA Advisory Review" | When reviewing a TA advisory, read `$A_SOCIETY_OWNER_TA_REVIEW`. |
| "## Forward Pass Closure Discipline" | When closing a forward pass, read `$A_SOCIETY_OWNER_CLOSURE`. |
| "## Review Artifact Quality" | Curator recommends: stay (universal Owner behavior) or extract — flag in proposal. |

**Section to slim** — "## Authority & Responsibilities":
The Workflow routing bullet currently contains an inline structural readiness protocol and multi-step intake procedure. Replace with: "When the user makes a request, read `$A_SOCIETY_WORKFLOW` to route it and `$INSTRUCTION_WORKFLOW_COMPLEXITY` for tier selection and intake procedure." The detailed intake steps (Intake Validity Sweep, record folder creation, etc.) belong in the complexity and workflow documents the Owner reads at that moment.

**Section to slim** — "## Post-Confirmation Protocol":
Currently contains the full intake sequence inline. Slim to the trigger: "After confirming context, ask what the human wants to work on. Then route per `$A_SOCIETY_WORKFLOW` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`. If the human explicitly asks to discuss or stay outside the workflow, the Owner may do so." Remove the detailed inline steps that duplicate what those documents contain.

**Open question for Curator (Phase 1):** Where do the extracted documents live? Options include:
- `a-society/a-docs/roles/` as owner-phase documents (e.g., `owner-brief-writing.md`)
- `a-society/a-docs/workflow/` organized by phase

Propose the placement with rationale. The Owner will decide at Phase 2. Proposed variable names (`$A_SOCIETY_OWNER_BRIEF_WRITING`, `$A_SOCIETY_OWNER_TA_REVIEW`, `$A_SOCIETY_OWNER_CLOSURE`) are provisional — adjust as appropriate given the placement.

**Note:** All extracted content must be preserved verbatim — no editing of the instructions themselves in this flow. This flow is structural (right-sizing the role document); content improvement is a separate concern.

---

### Item 4: Meta-Analysis Scope Expansion

Add a-docs anti-pattern checks to both meta-analysis files. These must become standing backward-pass obligations applied to every reviewed document.

**Add to `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`** — a new check category titled "a-docs Structure Checks". Add as a named section so it is clearly identifiable. The checks:

1. **Redundancy check:** Does this document reference, explain, or link anything already in the agent's injected context or required readings? If yes, flag the specific lines for removal.

2. **Phase-coupling check:** Does this role document contain instructions applicable only at a specific workflow phase? If yes, flag the section for extraction to a phase-specific document and add a pointer.

3. **Workflow-conditioning check:** Does this document contain instructions applicable only in specific workflow types (e.g., only flows with a TA, only flows with a forward pass closure)? If yes, flag the section for extraction.

4. **Role document scope check:** Does this role document contain anything beyond routing guidance, ownership declaration, and pointers to phase-specific documents? If yes, flag the excess.

5. **agents.md scope check:** Does agents.md contain anything beyond: what the project is (one paragraph) and the authority/conflict resolution model? If yes, flag for removal.

6. **Addition-without-removal check:** When a new instruction is added to a role document or agents.md, does any existing content become redundant or vestigial? If yes, flag it. Adding without checking what the addition makes obsolete is how garbage accumulates.

**Add to `$GENERAL_IMPROVEMENT_META_ANALYSIS`** — the same six checks, phrased in project-agnostic language (remove A-Society-specific references). Also add the absorbed item from Next Priorities:

7. **Repeated-header matching guidance:** When editing files with repeated semantic sub-headers (e.g., `### Roles` appearing under multiple parent `## Section` headings), agents must include the parent section header in their match context to ensure placement integrity. A mis-edit that places content under the wrong parent due to ambiguous header matching is a structural error, not a minor slip.

---

### Item 5: Update Report

This flow modifies `general/` (new files + meta-analysis template changes) and establishes a direction change that affects how all adopting projects author their a-docs. Include a framework update report draft as a named section in the proposal submission. Classification fields may be `TBD` at proposal time; resolve by consulting `$A_SOCIETY_UPDATES_PROTOCOL` at implementation. The Owner will review the draft as part of the Phase 2 decision.

---

## Scope

**In scope:**
- Creating the three a-docs-design principle files
- Removing the four identified anti-pattern sections from agents.md
- Extracting the five identified sections from owner.md, replacing with pointers; creating the extracted documents at Curator-proposed locations
- Adding the six a-docs structure checks to both meta-analysis files, plus the absorbed repeated-header guidance to the general file
- Registering all new files in both indexes and updating the a-docs-guide
- Update report draft included in proposal

**Out of scope:**
- Editing the content of extracted owner.md sections — preserve verbatim; only move them
- Applying the JIT principle to any other role documents (Curator, TA, etc.) in this flow — those are follow-on flows
- Applying the JIT principle to `general/` template role documents — follow-on
- Creating new phase-specific documents for any workflow other than what is extracted from owner.md

---

## Likely Target

- `a-society/a-docs/a-docs-design.md` — new; alongside `agents.md` and `project-information/` in the a-docs root
- `a-society/general/a-docs-design.md` — new; flat placement in `general/`
- `a-society/general/instructions/a-docs-design.md` — new; flat placement in `general/instructions/`
- `a-society/a-docs/agents.md` — existing
- `a-society/a-docs/roles/owner.md` — existing
- Extracted documents — Curator proposes placement, likely under `a-society/a-docs/roles/` or `a-society/a-docs/workflow/`
- `a-society/a-docs/improvement/meta-analysis.md` — existing
- `a-society/general/improvement/meta-analysis.md` — existing

---

## Open Questions for the Curator

1. **Extracted document placement:** Where do the extracted owner.md sections live? Propose the folder and file structure with rationale. Note whether the chosen placement creates a one-file subfolder (which requires the namespace parity exception from `$A_SOCIETY_STRUCTURE`) or keeps flat placement.

2. **"## Review Artifact Quality" disposition:** This section governs how the Owner verifies state claims in review artifacts. Is it universal Owner behavior (appropriate to keep in owner.md, since every Owner review involves this) or phase-specific (extract)? Flag your recommendation.

3. **general template framing:** Is `general/a-docs-design.md` structurally identical to the A-Society instance, or does the project-agnostic template need different section framing? Flag any structural adjustments needed for portability.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for a-docs Design Principles — JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
