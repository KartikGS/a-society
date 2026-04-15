# How to Create a Surface Ownership Registry

## What Is a Surface Ownership Registry?

A surface ownership registry is a machine-readable file that maps every project surface — folders, files, and artifact categories — to the role(s) accountable for that surface's health.

"Accountable" means: if this surface is broken, outdated, or missing, the listed role(s) must fix it. Accountability does not mean the role does all work on that surface — they may delegate — but the surface's health is their responsibility.

A project without a surface ownership registry has no structural mechanism to prevent coverage gaps. Surfaces that no role explicitly owns will rot silently. A project with a registry can validate that every path has at least one accountable party, and can route incoming work to the right role by consulting the registry rather than requiring the coordinator to hold domain knowledge about every surface.

---

## Why Projects Need This

Without explicit surface ownership, two problems emerge:

**Coverage gaps.** Files and folders that no role claims fall through the cracks. A README goes stale. A configuration file drifts from reality. No one notices because no one is looking.

**Routing confusion.** When work arrives that touches multiple surfaces, the coordinator must know which role handles which area — from memory. As the project grows, this becomes unreliable. The registry makes routing mechanical: look up the surface, find the accountable role.

---

## Where It Lives

Place the registry at `a-docs/roles/ownership.yaml`. It is part of the project's agent documentation — it describes how the project operates, not what the project produces.

---

## Registry Format

```yaml
# [PROJECT] Surface Ownership Registry
#
# Maps every project surface to the role(s) accountable for its health.
#
# Resolution rules:
# - More specific paths override less specific ones.
# - Every path in the project must resolve to at least one accountable role.
# - Unregistered paths are coverage gaps — validation should flag them.

surfaces:

  - path: [folder-or-file-path]
    roles: [role-name]
    scope: "One-line description of what this surface covers"

  - path: [another-path]
    roles: [role-a, role-b]
    scope: "Shared accountability — explain why multiple roles"
```

### Field Definitions

- **`path`** — A relative path from the project root. Can be a folder (with trailing `/`) or a specific file. More specific paths override less specific ones.
- **`roles`** — A list of one or more role names accountable for this surface. Use the role's identifier as it appears in the project's role documents and required-readings configuration.
- **`scope`** — A one-line description of what accountability means for this surface.

### Resolution Rules

1. **Specificity wins.** If both `a-docs/` and `a-docs/workflow/` match a path, the more specific entry governs.
2. **At-least-one rule.** Every path in the project must resolve to at least one accountable role. There is no requirement for exactly-one — some surfaces are genuinely shared (e.g., a records folder where all roles contribute artifacts).
3. **Unregistered paths are gaps.** Any project path that does not match an entry is a coverage gap and should be flagged during validation.

---

## How the Registry Is Used

### At Intake (Coordinator Routing)

When work arrives, the coordinator (typically the Owner) consults the registry to determine which domain lead(s) are affected:

1. Identify which surfaces the work touches.
2. Look up the accountable role(s) for each surface.
3. Send requirement-level directives to the relevant domain lead(s).

This replaces the coordinator reading domain-specific files to understand how to constrain the work. The coordinator sets *requirements* (what and why); the domain lead designs the *solution* (how).

### At Validation (Forward-Pass Gate)

Run the ownership validator at the end of the forward pass. If any project path lacks a registry entry, the validator reports the gap to the Owner. The Owner can then route a fix — either assigning the surface to an existing role or creating a new role entry.

### At Accountability

When a surface is found to be stale, broken, or incomplete, the registry identifies who should address it. This makes maintenance routing mechanical rather than requiring institutional knowledge.

---

## Relationship to Scoped Delegation

The surface ownership registry is one half of the scoped delegation model. The registry defines *what each role owns*. The delegation model defines *how work flows between roles based on that ownership*.

### Authority Levels

Roles operating within the scoped delegation model function at one of three authority levels:

**Coordinator** — routes work, sets requirements, validates outcomes. Does not design implementation details. The Owner is the project-level coordinator. In larger projects, a domain lead can also coordinate within their scope.

**Lead** — owns a domain. Has design authority within scope. Receives requirements from a coordinator, determines how to meet them, may delegate execution to specialists. Accountable for the health of their registered surfaces.

**Specialist** — implements within a domain under a lead's direction. Receives specific direction from a lead. Has execution authority but not unbounded design authority.

These are authority levels, not new role archetypes. The same role can operate at different authority levels depending on context — for example, a Curator is a *lead* for documentation surfaces and a *specialist* when executing Owner-approved changes to surfaces the Owner governs.

### How Coordinators Delegate

When a coordinator identifies affected domains through the registry:

1. **Write requirement-level directives** — state what must happen and why. Do not write implementation-level constraints for surfaces you don't deeply understand.
2. **Trust domain leads** — leads have design authority within their scope. They determine how to meet requirements.
3. **Enable parallelism** — when domains are independent, send directives simultaneously. Leads coordinate directly on dependencies.
4. **Validate outcomes** — check that the requirement was met. Do not review domain-internal implementation quality — that is the lead's responsibility.

---

## Maintaining the Registry

The registry is a living document. Update it when:

- A new role is created — assign its surfaces
- A new folder or standing artifact is added — register it
- A role's scope changes — update the affected entries
- Validation reveals a gap — assign the unowned surface

The Curator typically maintains the registry file itself, but the Owner governs which role is assigned to which surface — assignment is a coordination-level decision.

---

## What Makes a Registry Fail

**Too granular.** Mapping every individual file creates a maintenance burden. Map at folder level and use file-level overrides only where folder-level ownership is genuinely insufficient.

**Shared ownership without clarity.** When multiple roles are listed, the `scope` field must explain why. "Both roles touch this" is not a reason — it is a symptom of unclear boundaries. If two roles share a surface, state what each is accountable for.

**Stale entries.** A registry that is not updated when the project structure changes is worse than no registry — it creates false confidence. Tie registry updates to the same workflow gates that track structural changes.
