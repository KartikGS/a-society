# How to Maintain Per-Role Ownership Files

## What Is the Ownership Registry?

The ownership registry is the distributed set of `ownership.yaml` files kept inside each role folder.

Each declared role keeps its own file at:

`a-docs/roles/<role-id>/ownership.yaml`

Taken together, these files answer one question:

**If this surface changes, which role must ensure it is correct before the flow can close?**

"Accountable" means: if the surface is stale, broken, missing, or incorrect, the listed role must ensure it is fixed. The role may delegate the edit. It may not delegate accountability.

---

## Why the Registry Is Split Per Role

Ownership should follow truth accountability, and that accountability should live with the role that carries it.

Putting all ownership into one shared file creates a coordinator-centric model. Splitting the registry by role makes the responsibility local:

- each role owns the list of surfaces it is accountable for
- each role keeps that list current as its scope changes
- the Owner routes work by consulting the distributed ownership files, not by relying on memory

---

## Where It Lives

Each role folder under `a-docs/roles/` should contain:

- `main.md`
- `required-readings.yaml`
- `ownership.yaml`

The `roles/` folder itself should contain only role folders.

---

## Ownership Philosophy

Design ownership around **truth ownership**, not around which role usually edits prose.

- **Truth ownership over document-category ownership.** A surface belongs to the role accountable for the truth it expresses.
- **In-band maintenance.** Owned permanent surfaces should be updated in the same flow that changes them.
- **Accountability is not authorship.** Another role may draft the change; the accountable role still owns correctness.
- **Workflow follows touched ownership.** Activate the roles whose owned surfaces are affected.
- **Shared ownership is exceptional.** If two roles genuinely share a surface, record that explicitly and treat it as a possible split target.

---

## File Format

```yaml
role: owner
surfaces:
  - path: project-information/
    scope: "Project direction and lifecycle governance"

  - path: project-information/architecture.md
    shared_with: [technical-architect]
    scope: "Shared framework and executable-boundary truth"
```

### Field Definitions

- `role` — the kebab-case role identifier for the folder that owns this file
- `surfaces` — the list of surfaces this role is accountable for
- `path` — a relative path from project root; may be a folder or a specific file
- `scope` — a one-line description of the truth this surface expresses
- `shared_with` — optional list of other role IDs that share accountability for this surface

---

## Resolution Rules Across the Distributed Registry

1. **Specificity wins.** If one role file claims `runtime/` and another claims `runtime/src/framework-services/`, the narrower path governs that subtree.
2. **At-least-one rule.** Every project path should resolve to at least one ownership entry somewhere in the distributed registry.
3. **Unregistered paths are gaps.** Any project path not covered by any role file is a coverage gap.
4. **Shared entries are explicit.** If a surface is genuinely shared, record the same path in each participating role file and name the other role(s) in `shared_with`.

---

## How the Registry Is Used

### At Intake

The coordinator consults the role ownership files to determine which roles are affected:

1. Identify the surfaces the work touches.
2. Resolve those surfaces against the distributed ownership files.
3. Delegate to the relevant role(s) with requirement-level directives.

### During Execution

When work changes an owned surface, the accountable role must ensure the permanent truth is updated before the flow closes.

This can happen in two ways:

1. The accountable role edits the surface directly.
2. Another role edits it, and the accountable role verifies correctness before closure.

### At Forward-Pass Closure

Check both coverage and touched-surface completeness:

- every touched permanent surface was updated, or
- explicitly verified unchanged, or
- explicitly deferred with a named owner and reason

---

## Relationship to Delegation

The distributed ownership files define **what each role owns**.

The authority model defines **how work flows between those roles**:

- **Coordinator** — routes, sets requirements, validates outcomes
- **Lead** — designs and owns a domain
- **Specialist** — executes inside a domain under a lead's direction

The coordinator should consult ownership files to find the right role, then delegate at the requirement level rather than dictating implementation.

---

## Maintaining the Registry

Update a role's `ownership.yaml` when:

- the role gains a new standing surface
- a surface moves
- a shared surface is split
- a validation sweep finds an uncovered path
- the role's scope changes materially

Because the file is role-local, keeping it current is part of that role's own documentation maintenance duty.

---

## What Makes the Registry Fail

**Folder-first convenience instead of truth ownership.** Broad folder claims are only correct when everything under that folder truly shares one truth owner.

**Blurry shared ownership.** "Both roles touch it" is not enough. If a surface is shared, explain why and consider splitting it.

**Stale ownership files.** A distributed registry that is not updated during structural change is just decentralized drift.

**Out-of-band documentation cleanup.** If a role changes a truth surface and assumes someone else will fix the owned docs later, the model has failed.
