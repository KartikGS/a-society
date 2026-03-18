**Subject:** Plan artifact validator — scope and component design
**Status:** BRIEFED
**Date:** 2026-03-18

---

## Agreed Change

The compulsory complexity gate flow (`20260317-compulsory-complexity-gate`) established a required plan artifact (`01-owner-workflow-plan.md`) with a machine-readable YAML frontmatter schema. That schema was designed with programmatic validation in mind — the OQ1 resolution in `03-curator-to-owner.md` explicitly names the validator requirements as inputs for TA scoping after approval.

The agreed change is: **scope and design a tooling component that validates plan artifacts**. Concretely, the component must:

1. Confirm that a plan artifact exists in a given record folder
2. Parse its YAML frontmatter
3. Validate all required fields against the approved schema

The validator requirements from OQ1 are the fixed input to this scoping work — the TA does not redesign the schema, only designs the tool that enforces it:

- All five `complexity` sub-fields non-null and in `{low, moderate, elevated, high}`
- `tier` non-null and in `{1, 2, 3}`
- `path` a non-empty list
- `known_unknowns` a list (empty is valid)
- `type` equals `owner-workflow-plan`
- `date` non-null

The problem this solves: a session can currently skip the plan artifact without any structural gate to push against. The compulsory-gate flow made the artifact required by convention and by role documentation. This component makes the gate enforceable programmatically.

---

## Scope

**In scope:**
- Determine whether this is a new Component 7 or an extension of existing Component 3 (Workflow Graph Schema Validator) — the TA must state a recommendation and rationale
- Define the invocation model: which role invokes, at which workflow step, and whether invocation is a hard required gate or an on-demand check available to the Owner or Curator; the existing agent-invoked model applies (agents call tools and interpret results — see `$A_SOCIETY_TOOLING_ADDENDUM` Section 1 session model)
- Define the component interface: inputs, outputs, and exit codes or error schema consistent with existing tooling conventions
- Determine phase placement in the existing tooling implementation workflow (`$A_SOCIETY_TOOLING_ADDENDUM`) — whether this slots into an existing phase or requires a new one; note that Phases 1–2 (Foundation Primitives and Consent Utility) have no inter-component dependencies and the plan validator similarly has no dependencies, which may make it a natural fit alongside Phase 1 or Phase 2
- Assess coupling map implications: does the plan artifact format belong in the format dependency table (a Type B change in the coupling taxonomy — new tool that agents should invoke); does any existing `general/` instruction or the `$A_SOCIETY_WORKFLOW` need an invocation reference; surface any invocation gaps as standing open items
- Produce a complete component design specification that the Tooling Developer can implement without further scoping decisions

**Out of scope:**
- Redesigning the plan artifact YAML schema — the schema from OQ1 is fixed
- Designing the invocation documentation (`$A_SOCIETY_TOOLING_INVOCATION`) — that is a Developer output at Phase 6, confirmed by TA review
- Implementation — the TA designs; the Tooling Developer implements
- Documentation updates (proposal entry, addendum phase slot, architecture, coupling map, index registration) — those belong to the Curator after Owner approval

---

## Required Reading for TA Session

Before scoping, read:

- `a-society/a-docs/tooling-architecture-proposal.md` (`$A_SOCIETY_TOOLING_PROPOSAL`) — binding specification for all six current components; the new component design must be consistent with the conventions established here
- `a-society/a-docs/tooling-architecture-addendum.md` (`$A_SOCIETY_TOOLING_ADDENDUM`) — implementation workflow, roles, phase sequencing; the TA must determine where the new component slots
- `a-society/a-docs/tooling-general-coupling-map.md` (`$A_SOCIETY_TOOLING_COUPLING_MAP`) — format dependency and invocation status tables; the TA must assess what rows this component adds
- `a-society/a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` (`$A_SOCIETY_COMM_TEMPLATE_PLAN`) — the plan artifact template; the YAML frontmatter schema here is the fixed input to the validator
- `a-society/a-docs/records/20260317-compulsory-complexity-gate/03-curator-to-owner.md` — OQ1 resolution containing the validator requirements

---

## Likely Target

The TA's output is a component design proposal submitted as `03-ta-to-owner.md` in this record folder, using the `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` format adapted for TA authorship.

Once approved by the Owner, implementation lands in `tooling/`. Documentation updates (proposal, addendum, architecture, coupling map, index) land at their respective paths after Owner approval of the implementation.

---

## Open Questions for the TA

1. **New component vs. Component 3 extension:** Component 3 validates the workflow graph YAML schema; this validator validates a different schema (the plan artifact). Are they different enough to warrant a separate component? Or is a single "schema validator" component with two modes the right design? State a recommendation and rationale.

2. **Invocation model — required gate vs. on-demand check:** Should the plan validator be a required pre-condition that blocks the Curator from beginning a proposal without a valid plan, or an on-demand check the Owner can invoke to confirm their plan is valid before handing off? The former is a stronger gate; the latter is more consistent with the agent-invoked model where no tool is fully automated. The TA should assess this against how the other components are invoked and recommend.

3. **Phase placement:** Does the new component slot alongside Phase 1 (Foundation Primitives) given its lack of inter-component dependencies? Or does the TA see a reason to defer it to a later phase?

4. **Coupling map:** What rows does this component add to both tables? Which instruction gets the invocation reference — `$INSTRUCTION_WORKFLOW_COMPLEXITY`, the records instruction (`$A_SOCIETY_RECORDS`), or both?

---

## TA Confirmation Required

Before beginning scoping, the TA must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning component design for plan artifact validator."

The TA does not begin scoping until they have read this brief and all required reading documents in full, and confirmed acknowledgment.
