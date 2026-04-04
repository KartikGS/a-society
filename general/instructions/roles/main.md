# How to Create Role Documents

## What Is a Role Document?

A role document is a behavioral contract for an agent. It defines what that agent owns, what it is responsible for, what it must not do, and how it should handle situations not explicitly covered by other documents.

It is not a job description. A job description lists tasks. A role document defines **decision authority** — who can say yes, who can say no, and who must be consulted. An agent that has read a role document should be able to operate within that role without asking "am I allowed to do this?" for every decision.

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

### 4. Context Loading (deprecated)
Guidance for agents to load context. This section is legacy as the runtime now handles session orientation programmatically via `a-docs/roles/required-readings.yaml`. Role files should no longer carry `## Context Loading` prose or confirmation ritual requirements.

### 5. Escalation Triggers (mandatory)
When must this role escalate to a human or to another role? Be specific. "When uncertain" is not an escalation trigger — it is an invitation to guess. Name the categories of situation that require escalation.

### 6. Input Validation (mandatory for workflow-participating roles)
What input does this role expect to receive when activated? Define the expected format, source, and content of the handoff artifact that triggers this role's work. An agent that receives input not matching its expected format should **flag the discrepancy** rather than proceed silently — unexpected input is a signal that the workflow may have been bypassed or broken.

This does not mean the agent refuses to work. It means the agent names the discrepancy explicitly before proceeding, so the human can decide whether the workflow bypass was intentional.

Roles that are always active (e.g., the Owner) do not need this section — they are entry points, not downstream nodes.

### 7. Handoff Output (mandatory for workflow-participating roles that hand work to another role)
What does this role emit at a pause point to transfer control? At each pause point, the role must emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`. The block declares the receiving role and the artifact path the runtime uses to route the next session.

Roles that are terminal nodes in the project's actual workflow may omit this section. Roles that are always-active entry points may omit Input Validation, but they still need Handoff Output if they pause and hand work to another role.

### Optional Sections
- **Working style / character** — useful for roles where tone and approach matter (e.g., a reviewer who must be constructively critical)
- **Review checklist** — useful for roles that evaluate contributions (owner, reviewer, coordinator)
- **Interfaces** — useful for roles that have structured handoffs with other roles

---

## Common Role Archetypes

The following archetypes cover most project needs. Use the template for the archetype closest to the role you need, then customize.

---

### Archetype 1: Owner

**When to use:** One role per project. The keeper of the vision, the final quality gate, and the **universal session entry point**.

**Core responsibilities:** Vision interpretation, scope protection, contribution review, structure governance, **workflow routing**.

**Key boundary:** Does not make unilateral direction changes — those require the human. Reviews and approves; does not always execute.

**Template:**

```markdown
# Role: [Project] Owner Agent

## Primary Focus
Own the coherence, quality, and direction of [PROJECT]. [One sentence on what coherence means here.]
The Owner is the universal entry point for all project sessions.

## Authority & Responsibilities
Owns: vision interpretation, folder structure, agents.md, index, contribution review, workflow routing.
Does not: make unilateral direction changes, [project-specific exclusions].

## How the Owner Reviews a Contribution
1. Vision alignment — does this serve the core bet?
2. Scope test — is this within declared scope?
3. Placement test — is this in the correct folder?
4. Duplication test — does an equivalent already exist?
5. Quality test — can a new collaborator use this without additional explanation?

## Post-Confirmation Protocol

After confirming context via the runtime-injected identity, ask what the user wants to work on and route that need into the appropriate workflow by default.

Freeform discussion remains available, but only when the user explicitly asks to stay outside workflow (for example: thinking aloud, exploring options, or discussing before committing to a path). Freeform is a human override, not a co-equal default entry path.

If the workflow list for this project has not yet been customized, do not default to freeform. First establish which workflow should govern the work, then route into it.

[CUSTOMIZE: list the project's actual workflows and their one-line summaries here. The Owner uses this list as the routing map after the user states a need.]

## Handoff Output
At each pause point, emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

## Escalate to Human When
- A contribution would change direction or scope
- Two interpretations of the vision lead to different decisions
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
At each pause point, emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

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
At each pause point, emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

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
At each pause point, emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

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
At each pause point, emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

## Escalate When
- Two roles produce conflicting outputs that cannot be resolved by the coordinator
- A role reports a blocker that requires a direction decision
- The sequence cannot proceed without a decision the coordinator is not authorized to make
```

---

### Archetype 6: Curator

**When to use:** When the project needs a dedicated steward for its agent-docs — someone who keeps documentation accurate and navigable, and observes the project's execution for patterns worth proposing to the A-Society general library.

**Core responsibilities:** Agent-docs maintenance, migration execution, pattern observation, proposals to `a-society/general/`.

**Key boundary:** Proposes additions to `a-society/general/`; never writes there unilaterally. Does not set project direction — that is the Owner's authority. Maintenance changes within scope require no pre-approval; direction-implying changes require escalation.

**Template:** See `$GENERAL_CURATOR_ROLE` — a ready-made Curator role document with `[CUSTOMIZE]` markers.

```markdown
# Role: [Project] Curator Agent

## Primary Focus
Maintain the health of [PROJECT_NAME]'s agent-docs and observe the project's execution for patterns worth proposing to the A-Society general instruction library.

## Authority & Responsibilities
Owns: agent-docs maintenance within scope, migration tasks, pattern observation, proposals to a-society/general/.
Does not: write to a-society/general/ without Owner approval, set project direction, approve its own proposals.

## Hard Rules
- Propose, never write to general/ unilaterally. Owner approves before creation.
- Maintenance changes within scope require no approval — unless a direction decision is implied.
- If a maintenance change implies a direction decision, stop and escalate.

## Handoff Output
At each pause point, emit a machine-readable handoff block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.

## Escalate to Owner When
- A proposal to a-society/general/ is ready for review
- A maintenance change implies a direction or scope decision
- A migration task reveals structural ambiguity requiring Owner judgment
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

