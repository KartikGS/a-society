# How to Create Role Documents

## What Is a Role Document?

A role document is a behavioral contract for an agent. It defines what that agent owns, what it is responsible for, what it must not do, and how it should handle situations not explicitly covered by other documents.

It is not a job description. A job description lists tasks. A role document defines **decision authority** — who can say yes, who can say no, and who must be consulted. An agent that has read a role document should be able to operate within that role without asking "am I allowed to do this?" for every decision.

Role documents are not phase playbooks. If a role needs phase-specific guidance, create separate support docs and have the workflow surface them at the relevant node or gate.

---

## Why Projects Need Role Documents

Without explicit roles, two failure modes emerge:

**Overreach:** An agent does things outside its appropriate scope because no boundary was declared. A note-taker starts making editorial decisions. A reviewer starts rewriting content. The project loses coherence.

**Paralysis:** An agent stops at every ambiguous decision because it is not sure if it is authorized to proceed. It asks questions that should already be answered. Work slows.

Role documents prevent both. They push authority to the right level, reduce unnecessary escalation, and make clear where escalation is genuinely required.

---

## Minimum Role Set

Every project using the A-Society framework must declare at minimum two roles at initialization:

**1. Owner** — mandatory from the first session. The Owner holds the project vision, governs structure, and is the quality gate for all contributions. A project with no declared Owner has no authority structure — nothing prevents scope drift and nothing resolves disputes.

**2. Curator** — mandatory at initialization, even if not yet active. The Curator keeps agent-docs accurate as the project evolves. A project that initializes without a Curator has no maintenance mechanism — its agent-docs will drift from reality with every change.

Both roles must be registered in `agents.md` and indexed before the project is considered initialized. Ready-made templates for both are in `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`.

A project may add roles beyond these two. It may not operate without them.

---

## Authority Levels

Every role in the framework operates at one of three authority levels within a given scope:

**Coordinator** — routes work, sets requirements, validates outcomes. Does not design implementation. The Owner is the project-level coordinator. In larger projects, a domain lead can also coordinate within their sub-domain.

**Lead** — owns a domain. Has design authority within scope. Receives requirements from a coordinator, determines how to meet them, may delegate execution to specialists. Accountable for the health of their registered surfaces.

**Specialist** — implements within a domain under a lead's direction. Receives specific direction from a lead. Has execution authority but not unbounded design authority.

These are authority levels, not new role archetypes. The same role can operate at different authority levels depending on context — for example, a Curator is a *lead* for documentation surfaces and a *specialist* when executing Owner-approved changes to surfaces the Owner governs.

Authority levels work together with the **distributed ownership registry** (see `$INSTRUCTION_OWNERSHIP`), which maps every project surface to the role(s) accountable for keeping its truth current through per-role ownership files. The registry tells coordinators *who* to delegate to; the authority levels define *how* delegation works.

---

## What Every Role Document Must Contain

### 1. Primary Focus (mandatory)
One paragraph. What does this role fundamentally do? Not a list — a statement. If you cannot summarize the role in a paragraph, the role may be too broad.

If the role is part-time or active only during specific workflow phases, state both lifecycle boundaries in Primary Focus:
- **Activation condition** — what event, handoff, or phase transition starts this role's authority for a unit of work. In a graph-based workflow, this corresponds to the incoming edge firing at the role's entry node.
- **Closure condition** — what outcome marks this role as done for that unit. In a graph-based workflow, this corresponds to the outgoing edge being ready to fire from the role's exit node.

When activation and closure map to graph edge conditions, an agent can determine from the handoff artifact alone whether it should act — the unit-of-work ID in the artifact's subject field confirms which instance it is responsible for.

Without explicit activation and closure conditions, agents in phase-scoped roles cannot reliably determine when they should act or stand down.

### 2. Authority & Responsibilities (mandatory)
Two lists:
- What the role **owns** — decisions they make, artifacts they control, quality they are responsible for
- What the role **does not do** — explicit boundaries, especially where confusion with adjacent roles is likely

Both lists matter equally. Stating what a role does not do is often more useful than stating what it does, because it resolves the boundary disputes that actually arise in practice.

### 3. Hard Rules (mandatory if any exist)
Non-negotiable constraints that cannot be overridden by any other instruction. If a role has behaviors that must never change regardless of context — state them as hard rules with explicit markers. An agent that treats a hard rule as a guideline is operating incorrectly.

### 4. Workflow-Linked Support Docs (strongly recommended when phase-specific guidance exists)
If the role has guidance that applies only at certain workflow phases — for example proposal drafting, design review, implementation handoff, or forward-pass closure — put that guidance in separate support docs and have the workflow surface those docs at the relevant nodes.

The role document may include a short section such as "Workflow-Linked Support Docs" that names the categories of moments covered by those support docs. It should not enumerate phase-triggered cues such as "Before X, read Y." Those cues belong in the workflow document, because the workflow is the delivery surface for phase-entry guidance.

Projects often place these companion docs under `roles/[role-id]/`, with the startup role contract at `roles/[role-id]/main.md`, but the exact location is less important than the separation of concerns: the role doc stays small, and the workflow delivers the phase-specific guidance.

Ready-made examples of these support docs are available in the general library — for example `$GENERAL_OWNER_BRIEF_WRITING`, `$GENERAL_OWNER_REVIEW_BEHAVIOR`, `$GENERAL_OWNER_LOG_MANAGEMENT`, `$GENERAL_OWNER_TA_REVIEW`, `$GENERAL_OWNER_CLOSURE`, `$GENERAL_CURATOR_IMPL_PRACTICES`, and `$GENERAL_TA_ADVISORY_STANDARDS`.

### 5. Context Loading (deprecated)
Guidance for agents to load context. This section is legacy as the runtime now handles session orientation programmatically via each role's `a-docs/roles/<role-id>/required-readings.yaml`. Role files should no longer carry `## Context Loading` prose or confirmation ritual requirements.

### 6. Escalation Triggers (mandatory)
When must this role escalate to a human or to another role? Be specific. "When uncertain" is not an escalation trigger — it is an invitation to guess. Name the categories of situation that require escalation.

### 7. Input Validation (mandatory for workflow-participating roles)
What input does this role expect to receive when activated? Define the expected format, source, and content of the handoff artifact that triggers this role's work. An agent that receives input not matching its expected format should **flag the discrepancy** rather than proceed silently — unexpected input is a signal that the workflow may have been bypassed or broken.

This does not mean the agent refuses to work. It means the agent names the discrepancy explicitly before proceeding, so the human can decide whether the workflow bypass was intentional.

Roles that are always active (e.g., the Owner) do not need this section — they are entry points, not downstream nodes.

### 8. Handoff Output (mandatory for workflow-participating roles that hand work to another role)
What does this role emit at a pause point to transfer control? At each pause point, the role must emit a machine-readable handoff block per the runtime-injected handoff contract. The block declares the receiving role and the artifact path the runtime uses to route the next session.

Do not place the runtime handoff contract in any role's `required-readings.yaml`. The runtime injects it separately into runtime-managed sessions.

Roles that are terminal nodes in the project's actual workflow may omit this section. Roles that are always-active entry points may omit Input Validation, but they still need Handoff Output if they pause and hand work to another role.

### Optional Sections
- **Working style / character** — useful for roles where tone and approach matter (e.g., a reviewer who must be constructively critical)
- **Review checklist** — useful only when the checklist applies across all uses of the role. If it applies only at certain workflow phases, move it to a workflow-linked support doc instead.
- **Interfaces** — useful for roles that have structured handoffs with other roles

---

## Common Role Archetypes

The following archetypes cover most project needs. Use the template for the archetype closest to the role you need, then customize.

---

### Archetype 1: Owner (Coordinator)

**When to use:** One role per project. The keeper of the vision, the cross-domain coordinator, and the **universal session entry point**.

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

## Handoff Output
At each pause point, emit a machine-readable handoff block per the runtime-injected handoff contract.

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

## Handoff Output
At each pause point, emit a machine-readable handoff block per the runtime-injected handoff contract.

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

## Handoff Output
At each pause point, emit a machine-readable handoff block per the runtime-injected handoff contract.

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

## Handoff Output
At each pause point, emit a machine-readable handoff block per the runtime-injected handoff contract.

## Escalate When
- An AC cannot be verified with available evidence
- A blocking issue requires a scope or direction decision to resolve
```

---

### Archetype 5: Coordinator

**When to use:** When the project involves multiple roles that need sequencing — someone who manages handoffs, tracks state, and ensures the right role acts at the right time.

**Core responsibilities:** Handoff management, state tracking, blocker escalation, session sequencing.

**Key boundary:** Does not perform the work of any other role. Coordinates; does not execute.

**Template:**

```markdown
# Role: [Project] Coordinator Agent

## Primary Focus
Manage handoffs between roles and ensure the right work happens in the right sequence.

## Authority & Responsibilities
Owns: handoff issuance, state tracking, blocker escalation, session sequencing.
Does not: perform any role's substantive work, make design or scope decisions.

## Coordination Protocol
1. Read the current state document before any session.
2. Identify which role should act next and what they need.
3. Issue the handoff to that role with complete context.
4. Enter wait state until the role reports back.
5. Review the report and issue the next handoff.

## Handoff Output
At each pause point, emit a machine-readable handoff block per the runtime-injected handoff contract.

## Escalate When
- Two roles produce conflicting outputs that cannot be resolved by the coordinator
- A role reports a blocker that requires a direction decision
- The sequence cannot proceed without a decision the coordinator is not authorized to make
```

---

### Archetype 6: Curator (Lead — Documentation Domain)

**When to use:** When the project needs a dedicated leader and steward for its agent-docs — someone who owns the documentation layer, keeps it accurate and navigable, and observes the project's execution for patterns worth proposing to the A-Society general library.

**Authority level:** Lead — has design authority for documentation organization, content structure, and registration practices. Receives requirement-level directives from the Owner. Reports outcomes for validation.

**Core responsibilities:** Agent-docs design and maintenance, migration execution, pattern observation, proposals to `a-society/general/`.

**Key boundary:** Proposes additions to `a-society/general/`; never writes there unilaterally (expanding the library is a scope decision, not a documentation decision). Does not set project direction — that is the Owner's authority. Has design authority for *how* to organize documentation within scope.

**Template:** See `$GENERAL_CURATOR_ROLE` — a ready-made Curator role document with `[CUSTOMIZE]` markers.

```markdown
# Role: [Project] Curator Agent

## Authority Level: Lead (Documentation Domain)
Owns design authority for documentation surfaces. Receives requirements. Reports outcomes.

## Primary Focus
Maintain the health of [PROJECT_NAME]'s agent-docs and observe the project's execution for patterns worth proposing to the A-Society general instruction library.

## Authority & Responsibilities
Owns: documentation design authority within scope, agent-docs maintenance, migration tasks, pattern observation, proposals to a-society/general/.
Does not: write to a-society/general/ without Owner approval, set project direction, approve its own proposals.

## Hard Rules
- Propose, never write to general/ unilaterally. Owner approves before creation.
- Design authority applies to how documentation is organized, not to what the project's direction is.
- If a maintenance change implies a direction decision, stop and escalate.

## Handoff Output
At each pause point, emit a machine-readable handoff block per the runtime-injected handoff contract.

## Escalate to Owner When
- A proposal to a-society/general/ is ready for review
- A maintenance change implies a direction or scope decision
- A cross-domain dependency requires Owner-level coordination
```

---

## Registering a New Role

Writing the role document is not the last step. A role that exists as a file but is not registered is invisible to agents — `agents.md` explicitly instructs agents not to assume a role exists unless it appears in the roles table.

When a new role document is created, three registrations are required:

1. **Add a row to `agents.md` roles table.** Include the role name, a link to the role file, and a one-line primary focus summary. Without this entry, no agent will know the role exists.

2. **Add a variable to the project index (`indexes/main.md`).** Register the role file as `$[PROJECT]_[ROLE]_ROLE` (e.g., `$A_SOCIETY_CURATOR_ROLE`). This allows other documents to reference the role by variable name — so if the file ever moves, only the index needs updating.

3. **Update `agents.md` required reading if needed.** If the required reading step currently hardcodes a specific role file, generalize it to reference the assigned role (e.g., "your assigned role from the table above"). This ensures future roles are picked up without another edit.

These three steps are not optional. A role document without registration is incomplete.

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

**Too broad.** A role that "owns everything" owns nothing. Authority without specificity cannot be enforced.
