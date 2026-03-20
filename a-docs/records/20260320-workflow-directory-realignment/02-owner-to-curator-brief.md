# Owner → Curator: Briefing

**Subject:** Workflow Directory and Index Realignment
**Status:** BRIEFED
**Date:** 2026-03-20

---

## Agreed Change

We are extracting A-Society's two existing workflows (the standard documentation loop, and the tooling implementation loop) into distinct, permanent files within the `a-docs/workflow/` directory, and converting `workflow/main.md` into a routing index that points to them. 

Currently, the tooling workflow is isolated as an architectural addendum (`a-docs/tooling/architecture-addendum.md`). Because tooling iteration and maintenance are proven to be an ongoing, permanent cadence (e.g., `utils-bp-trigger-tool`), the process governs ongoing reality and structurally belongs in the `workflow/` folder, not as a transient one-off build addendum. This aligns our structure with the "Multiple distinct workflows" pattern defined in `$INSTRUCTION_WORKFLOW`.

Finally, we are updating the framework library itself—specifically `$INSTRUCTION_WORKFLOW`—to formalize this multi-file, index-based structure as the recommended architectural pattern for any project that maintains multiple permanent execution loops. This ensures that our own structural improvement is reflected in the guidelines we provide to others.

---

## Scope

**In scope:** 
- Extracting the prose and YAML graph for the main documentation loop from `workflow/main.md` into a new `workflow/framework-development.md`.
- Extracting the workflow phases, roles, and session model from the tooling addendum into a new `workflow/tooling-development.md` and adding its YAML graph representation.
- Updating `workflow/main.md` to act as an index/menu that describes and links to both extracted workflow files.
- Updating all corresponding references and variables in `$A_SOCIETY_INDEX`.
- Updating the framework library instructions (`general/instructions/workflow/main.md`) to define the index-based routing pattern for multiple workflows.

**Out of scope:** 
- Modifying the actual rules, invariants, or structural logic of either workflow (this is pure extraction and movement).
- Retiring or moving the remaining sections of the tooling architecture addendum (only extracting the workflow phase definitions and role definitions).

---

## Likely Target

- `a-docs/workflow/main.md` (Replace with Index)
- `a-docs/workflow/framework-development.md` (Additive)
- `a-docs/workflow/tooling-development.md` (Additive)
- `a-docs/tooling/architecture-addendum.md` (Replace/Remove workflow sections)
- `$A_SOCIETY_INDEX` (Update variables to point to the new structures)
- `$INSTRUCTION_WORKFLOW` (Update library instructions)

---

## Files Changed

| Target File | Expected Action |
|---|---|
| `a-docs/workflow/main.md` | replace |
| `a-docs/workflow/framework-development.md` | additive |
| `a-docs/workflow/tooling-development.md` | additive |
| `a-docs/tooling/architecture-addendum.md` | replace (excerpting) |
| `a-docs/indexes/main.md` | replace |
| `general/instructions/workflow/main.md` | replace |

---

## Open Questions for the Curator

- How should the variables in `$A_SOCIETY_INDEX` map? Specifically, does `$A_SOCIETY_WORKFLOW` point to the new index `main.md` or the `framework-development.md` file, and what new variable names should be registered for the extracted graphs?

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow Directory and Index Realignment."
