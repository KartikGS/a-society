# How to Create Role Documents

## What Is a Role Document?

A role document is a behavioral contract for an agent. It defines what that agent owns, what it is responsible for, what it must not do, and how it should handle situations not explicitly covered by other documents.

It is not a job description. A job description lists tasks. A role document defines **decision authority** — who can say yes, who can say no, and who must be consulted. An agent that has read a role document should be able to operate within that role without asking "am I allowed to do this?" for every decision.

Role documents are not workflow playbooks. Node-specific instructions belong in workflow node context, not in the standing role document.

---

## Why Projects Need Role Documents

Without explicit roles, two failure modes emerge:

**Overreach:** An agent does things outside its appropriate scope because no boundary was declared. A note-taker starts making editorial decisions. A reviewer starts rewriting content. The project loses coherence.

**Paralysis:** An agent stops at every ambiguous decision because it is not sure if it is authorized to proceed. It asks questions that should already be answered. Work slows.

Role documents prevent both. They push authority to the right level, reduce unnecessary escalation, and make clear where escalation is genuinely required.

---

## Minimum Role Set

Every project using the A-Society framework must declare an Owner at initialization.

**Owner** — mandatory from the first session. The Owner holds the project vision, governs structure, and is the quality gate for all contributions. A project with no declared Owner has no authority structure — nothing prevents scope drift and nothing resolves disputes.

The Owner role folder must exist and be indexed before the project is considered initialized. A ready-made template is available at `$GENERAL_OWNER_ROLE`.

A project may add roles beyond Owner when those roles have real delegated authority. Use the archetypes below as starting points, and keep the actual role set as small as the project's authority structure allows.

---

## Authority Levels

Every role in the framework operates at one of three authority levels within a given scope:

**Coordinator** — routes work, sets requirements, validates outcomes. Does not design implementation. The Owner is the project-level coordinator. In larger projects, a domain lead can also coordinate within their sub-domain.

**Lead** — owns a domain. Has design authority within scope. Receives requirements from a coordinator, determines how to meet them, may delegate execution to specialists. Accountable for the health of their registered surfaces.

**Specialist** — implements within a domain under a lead's direction. Receives specific direction from a lead. Has execution authority but not unbounded design authority.

These are authority levels, not new role archetypes. The same role can operate at different authority levels depending on context.

Authority levels work together with the **distributed ownership registry** (see `$INSTRUCTION_OWNERSHIP`), which maps every project surface to the role(s) accountable for keeping its truth current through per-role ownership files. The registry tells coordinators *who* to delegate to; the authority levels define *how* delegation works.

---

## What Every Role Document Must Contain

### 1. Primary Focus (mandatory)
One paragraph. What does this role fundamentally do? Not a list — a statement. If you cannot summarize the role in a paragraph, the role may be too broad.

### 2. Authority & Responsibilities (mandatory)
Two lists:
- What the role **owns** — decisions they make, artifacts they control, quality they are responsible for
- What the role **does not do** — explicit boundaries, especially where confusion with adjacent roles is likely

Both lists matter equally. Stating what a role does not do is often more useful than stating what it does, because it resolves the boundary disputes that actually arise in practice.

### 3. Hard Rules (mandatory if any exist)
Non-negotiable constraints that cannot be overridden by any other instruction. If a role has behaviors that must never change regardless of context — state them as hard rules with explicit markers. An agent that treats a hard rule as a guideline is operating incorrectly.

### 4. Support Docs (optional)
If the role has durable companion guidance that would make the main role document too large, keep it in separate support docs and reference those docs from the appropriate workflow node context.

The role document may include a short section such as "Support Docs" that names the companion surfaces the role owns. It should not enumerate node-entry cues or runtime delivery rules.

Ready-made examples of these support docs are available in the general library — for example `$GENERAL_OWNER_BRIEF_WRITING`, `$GENERAL_OWNER_REVIEW_BEHAVIOR`, `$GENERAL_OWNER_LOG_MANAGEMENT`, and `$GENERAL_OWNER_CLOSURE`.

### 5. Escalation Triggers (mandatory)
When must this role escalate to a human or to another role? Be specific. "When uncertain" is not an escalation trigger — it is an invitation to guess. Name the categories of situation that require escalation.

### Optional Sections
- **Working style / character** — useful for roles where tone and approach matter (e.g., a reviewer who must be constructively critical)
- **Review checklist** — useful only when the checklist applies across all uses of the role. Node-specific checklists belong in workflow node context instead.
- **Interfaces** — useful for roles that have structured handoffs with other roles

---

## Common Role Archetypes

The following archetypes cover most project needs. Use the template for the archetype closest to the role you need, then customize.

---

### Archetype 1: Owner (Coordinator)

**When to use:** One role per project. The keeper of the vision, the cross-domain coordinator, and the **universal session entry and exit point**.

**Authority level:** Coordinator — routes work via the distributed ownership registry, sets requirement-level directives, validates outcomes.

**Core responsibilities:** Vision interpretation, scope protection, **requirement-level delegation** to domain leads, **outcome validation**, structure governance, **workflow routing**.

**Key boundary:** Does not make unilateral direction changes — those require the human. Does not write implementation-level constraints for domains that other roles lead — sets requirements, domain leads design solutions. Does not review domain-internal implementation quality.

**Template:** See `$GENERAL_OWNER_ROLE` — a ready-made Owner role document with `[CUSTOMIZE]` markers.

```markdown
# Role: [Project] Owner Agent

## Authority Level: Coordinator
Routes work via the distributed ownership registry. Sets requirements. Validates outcomes.

## Primary Focus
Own the coherence, direction, and routing of [PROJECT]. [One sentence on what coherence means here.]
The Owner is the universal entry point for all project sessions.

## Authority & Responsibilities
Owns: vision, structure, agents.md, registry governance, workflow routing, requirement-level delegation, outcome validation, cross-domain coherence.
Does not: write implementation constraints for other domains, review domain-internal quality, make unilateral direction changes, [project-specific exclusions].

## Post-Confirmation Protocol
Ask what the user wants to work on. Route via workflow. Consult registry to identify affected domain leads. Write requirement-level directives.

## Escalate to Human When
- A contribution would change direction or scope
- Two interpretations of the vision lead to different decisions
- A surface ownership assignment is contested
- [project-specific triggers]
```

---

### Archetype 2: Analyst

**When to use:** When the project involves translating vague intent into precise, actionable specifications. Common in projects with a gap between the human's high-level goal and what contributors need to execute.

**Core responsibilities:** Requirement clarification, scope definition, acceptance criteria, handoff to implementers.

**Key boundary:** Defines the problem; does not solve it. Writes specifications; does not write implementations.

**Template:**

```markdown
# Role: [Project] Analyst Agent

## Primary Focus
Transform ambiguous intent into precise, scoped, executable specifications.

## Authority & Responsibilities
Owns: requirement clarification, scope definition, acceptance criteria.
Does not: propose implementation approaches, write deliverables, assign other roles.

## Hard Rules
- If scope is unclear, stop and clarify before proceeding. Never infer scope.
- Acceptance criteria must be verifiable — if it cannot be checked, it is not an AC.

## Escalate to Human When
- The requirement contradicts the project vision
- Scope cannot be determined without a direction decision
- [project-specific triggers]
```

---

### Archetype 3: Implementer

**When to use:** When the project involves producing deliverables within a defined specification. The implementer executes; they do not design.

**Core responsibilities:** Producing the specified output, self-verification, reporting blockers.

**Key boundary:** Works within the handoff. Does not redefine scope or make design decisions not already resolved in the specification.

**Template:**

```markdown
# Role: [Project] Implementer Agent

## Primary Focus
Execute the specified task and produce a verifiable deliverable.

## Authority & Responsibilities
Owns: execution within the approved specification, self-verification, blocker reporting.
Does not: redefine scope, make design decisions, approve their own output for final use.

## Hard Rules
- If the specification is ambiguous, stop and request clarification. Do not infer.
- If a blocker is encountered, report it immediately. Do not work around it silently.

## Escalate When
- The specification contains a contradiction
- A blocker cannot be resolved within the current specification
- Completing the task would require going outside the approved scope
```

---

### Archetype 4: Reviewer

**When to use:** When the project needs a dedicated quality gate — someone who evaluates completed work against defined criteria before it is accepted.

**Core responsibilities:** Evaluating deliverables against acceptance criteria, classifying issues (blocking vs. non-blocking), approving or rejecting with evidence.

**Key boundary:** Reviews; does not implement fixes. Identifies issues; does not resolve them unless explicitly delegated.

**Template:**

```markdown
# Role: [Project] Reviewer Agent

## Primary Focus
Evaluate completed work against defined acceptance criteria and produce a clear, evidence-based verdict.

## Authority & Responsibilities
Owns: quality evaluation, issue classification, accept/reject decision within scope.
Does not: fix identified issues (unless explicitly delegated), redefine acceptance criteria, approve work outside their designated scope.

## Review Protocol
For each acceptance criterion:
1. State the criterion.
2. State the evidence consulted.
3. State the verdict: pass / fail / cannot verify.
4. If fail: classify as blocking or non-blocking, with rationale.

## Escalate When
- An AC cannot be verified with available evidence
- A blocking issue requires a scope or direction decision to resolve
```

---

## Declaring a New Role

Writing the role document is not the last step. A role is usable only when its role folder, startup-context file, ownership file, and index entry are in place.

When a new role document is created, these declarations are required:

1. **Create the role folder.** Place the startup role contract at `a-docs/roles/<role-id>/main.md`.

2. **Add the role metadata files.** Create `required-readings.yaml` for startup context and `ownership.yaml` for the role's accountable surfaces.

3. **Add a variable to the project index (`indexes/main.md`).** Register the role file as `$[PROJECT]_[ROLE]_ROLE` (e.g., `$A_SOCIETY_CURATOR_ROLE`). This allows other documents to reference the role by variable name — so if the file ever moves, only the index needs updating.

4. **Update workflow and ownership references.** If the role can receive work, update the workflow node definitions and any ownership surfaces that route work to that role.

These steps are not optional. A role document without the supporting role folder files and index entry is incomplete.

---

## Format Rules

- **Primary Focus first, always.** An agent skimming the document should understand the role from the first paragraph.
- **Both ownership lists are mandatory.** What the role does AND what it does not do. Omitting the "does not" list is a documentation failure.
- **Hard rules get a distinct visual marker.** Agents must recognize them as non-overridable. Use bold, a horizontal rule, or a callout block — be consistent within your project.
- **Escalation triggers are specific.** Name the categories of situation, not just "when uncertain."

---

## What Makes a Role Document Fail

**Too broad.** A role that "owns everything" owns nothing. Authority without specificity cannot be enforced.

**Missing the "does not" list.** The boundary disputes that actually arise are at the edges — where two roles might both claim authority. The "does not" list resolves those edges in advance.

**No escalation triggers.** Without them, an agent either guesses or asks every time. Neither is good.

**Conflates role with person.** A role document defines a behavioral contract, not a personality profile. Keep the focus on authority and decision rules.
