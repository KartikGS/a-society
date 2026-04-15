# Owner Brief Writing

## Requirement-Level Directives

Under the scoped delegation model, the Owner writes **requirement-level directives** — not implementation-level constraints. The Owner states what must happen and why. Domain leads design how.

A directive should contain:
- The requirement — what must change and what the outcome must look like
- The motivation — why the change is needed
- Affected domains — which domain leads need directives (identified via the surface ownership registry)
- Quality bar — how the Owner will validate the outcome
- Cross-domain dependencies — if leads need to coordinate, name the dependency
- Scope boundaries — what is explicitly out of scope

A directive should not contain:
- File-level replacement instructions for surfaces the Owner does not directly own
- Implementation approach choices for domain leads
- Line-level or string-level precision for files outside the Owner's domain

When multiple domains are affected and their work is independent, structure the directive with per-domain sections so leads can receive their portions simultaneously.

---

## Brief-Writing Quality

When a change is fully derivable from existing approved direction, write a fully specified directive:

- state the scope explicitly
- name the affected domain leads explicitly
- state the requirement for each domain explicitly
- state `Open Questions: None` when no downstream judgment is required

When a directive spans multiple domains, provide a domain summary naming the affected leads and the expected requirement for each one.

When a directive defines or revises a standing rule and applies it via domain lead work, compare the rule text against the domain directives before handoff. The receiving leads should be able to satisfy the requirement without resolving contradictions on their own.

When a directive removes or renames a structural element that other files consume, identify the affected domains and name the consuming sites in the relevant domain directives.

When a directive introduces a schema, field, or structural vocabulary change, ensure both the documentation domain and any programmatic consumer domain are scoped in the same flow.

---

## Owner-Domain Constraints

The Owner retains full constraint-writing authority for surfaces the Owner directly governs (per the surface ownership registry). When implementing changes to their own surfaces, precision standards apply:

- Literal replacements must quote the live raw string exactly
- Structured-entry changes must state whether the full entry or a sub-element is in scope
- Schema or vocabulary changes must scope surrounding prose sweeps

---

## Constraint-Writing Quality

Decision artifacts and review constraints should be written with the same precision as directives. The receiving role should be able to follow the constraint mechanically, not infer its meaning.

When a constraint authorizes or requires registration work, scope it by the specific files or variables in question, not by an ambiguous folder boundary.

When a constraint retires an index variable or deletes a registered artifact, sweep the project for references to that variable before finalizing the scope.
