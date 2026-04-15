# Owner Brief Writing

## Requirement-Level Directives

Under the scoped delegation model, the Owner writes **requirement-level directives** — not implementation-level constraints. The Owner states what must happen and why. Domain leads design how.

### What a Directive Contains

1. **The requirement** — a clear statement of what must change and what the outcome must look like
2. **The motivation** — why this change is needed, what problem it solves, what user direction it serves
3. **Affected domains** — which domain leads need directives (identified via `$A_SOCIETY_OWNERSHIP`)
4. **Quality bar** — how the Owner will validate the outcome (observable behaviors, not implementation details)
5. **Cross-domain dependencies** — if domain A's output depends on domain B's, name the dependency and state whether leads coordinate directly or the Owner sequences the work
6. **Scope boundaries** — what is explicitly out of scope for this flow

### What a Directive Does NOT Contain

- File-level replacement instructions for surfaces the Owner does not directly own
- Implementation approach choices for domain leads — leads have design authority within their scope
- Detailed structural constraints on how a domain lead organizes their work
- Line-level or string-level precision for files outside the Owner's domain

### Writing Quality

**Requirement vs. constraint test.** Before including a specific instruction in a directive, ask: "Am I stating what must happen (requirement) or how it must happen (implementation constraint)?" Requirements belong in the directive. Implementation constraints belong to the domain lead receiving the directive.

**Domain identification.** Consult `$A_SOCIETY_OWNERSHIP` at intake to identify all affected surfaces. A directive that misses an affected domain forces a re-routing cycle. When in doubt, name more domains rather than fewer — a domain lead can report "no work required" faster than the Owner can discover a missed domain after the fact.

**Parallel-ready structure.** When multiple domains are affected and their work is independent, structure the directive so leads can receive their sections simultaneously. Use a per-domain section format:

```markdown
## Requirement

[Overall statement of what must happen and why]

### → Documentation Lead (Curator)
Requirement: [What the documentation layer must achieve]
Quality bar: [How the Owner will validate]

### → Executable Lead (Technical Architect)
Requirement: [What the executable layer must achieve]
Quality bar: [How the Owner will validate]
Dependency: [Any dependency on another domain's output]
```

**Dependency declaration.** When two domains have dependencies, state the dependency in the directive and specify coordination mode:
- **Leads coordinate directly** (default) — name the dependency, leads handle timing
- **Owner sequences** — when the dependency is hard and timing is critical, issue directives sequentially

**Scope-expansion awareness.** When drafting a directive, check whether the requirement implies surfaces beyond the obvious target. A requirement like "support behavior X in the runtime" may also imply documentation, index, and operator-reference updates. The registry lookup surfaces these — name all affected domains up front.

---

## Owner-Domain Constraints

The Owner retains full constraint-writing authority for surfaces the Owner directly governs (per `$A_SOCIETY_OWNERSHIP`): project identity documents, workflow definitions, the agents.md entry point, the a-docs design principles, and the README.

When the Owner implements changes to their own surfaces, the same precision standards apply as before:

- Literal replacements must quote the live raw string exactly
- Structured-entry changes must state whether the full entry or a sub-element is in scope
- Schema or vocabulary changes must scope surrounding prose sweeps

These standards apply to *Owner-authored changes to Owner-governed surfaces*, not to directives sent to domain leads.

---

## Constraint-Writing Quality

When a decision artifact or review constraint directs downstream implementation checks, write the constraint with the same precision required of briefs. Constraint language should be mechanically followable by the receiving role without needing pattern inference.

**Registration scope must be file-based.** When directing index registration or verification, scope the instruction by the newly created or modified files, not by their parent directory, unless the directory boundary is itself the point of the constraint. "Verify whether `$A_SOCIETY_INDEX` needs updating for any newly created or modified files" is mechanically actionable; a location-based qualifier can accidentally exclude the relevant file.

**Public-index variable retirement requires a reference sweep.** When a brief, convergence decision, or other Owner authorization retires a public-index variable or deletes a publicly registered artifact, sweep `a-society/` for references to that `$VARIABLE_NAME` before finalizing scope. Explicitly name every dependent file that must change, including any `general/` artifacts, so required `[LIB]` authorization is granted up front rather than retroactively.

---

## Retained Coordination-Level Checks

These checks remain the Owner's responsibility regardless of delegation:

**Principle/application consistency scan.** When a directive both defines or revises a standing rule and applies that rule via domain lead work, compare the abstract rule text against the domain directives before handoff. The domain leads must be able to satisfy the requirement without contradiction.

**New standing artifacts require downstream identification.** When a directive creates a new standing artifact, identify all downstream domains affected — required-readings, index registration, guide rationale, manifest semantics. Name these as domain directives rather than leaving domain leads to discover propagation obligations.

**Schema-code coupling check.** When a requirement changes a schema with a programmatic consumer, scope both the documentation domain and the executable domain in the same flow. Do not split documentation and code paths unless the workflow explicitly intends that separation.

**`[LIB]` brief trigger for update report drafts.** When a `[LIB]` flow is likely to qualify for a framework update report, the directive must explicitly instruct the Curator to include the update report draft. When classification cannot yet be determined, instruct the Curator to include the draft with classification fields marked `TBD`.

**Do not pre-specify update report classification.** Classification is determined by the Curator post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. Stating a classification in the directive creates framing the Curator must override.

**TA design directives require a constraint/preference partition.** When a directive asks the Technical Architect to produce a design, constraints must be genuinely non-negotiable — derived from framework invariants, explicit user direction, or immovable prior decisions. A design preference is not a constraint; presenting it as one closes off design space the TA is engaged to evaluate.
