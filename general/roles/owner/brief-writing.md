# Owner Brief Writing

## Requirement-Level Directives

Under the scoped delegation model, the Owner writes **requirement-level directives** — not implementation-level constraints. The Owner states what must happen and why. Domain leads design how.

A directive should contain:
- The requirement — what must change and what the outcome must look like
- The motivation — why the change is needed
- Affected domains — which domain leads need directives (identified via the distributed role ownership files)
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

---

## Constraints

Constraints in Owner directives must stay high-level and non-negotiable. Use them to protect project direction, explicit human decisions, ownership boundaries, invariants, acceptance criteria, and out-of-scope areas. Do not use constraints to prescribe the receiving role's implementation approach.

A good constraint says what must remain true. It should leave the domain lead room to design the solution.

When pointing to existing content that needs attention, summarize where it is and what needs to change. Exact replacement text is only appropriate when the human supplied exact wording or when the Owner is directly editing an Owner-governed surface.

When a constraint authorizes registration or cleanup work, name the relevant files, variables, or surfaces clearly enough that the receiving role can find them, but do not dictate line-level edits.
