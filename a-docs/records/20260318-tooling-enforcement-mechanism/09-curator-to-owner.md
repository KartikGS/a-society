**Subject:** Component 7 Track 2 — registration and general/ proposal
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-18

---

## Trigger

Owner authorization at `08-owner-to-curator.md`. Phase 1A implementation confirmed complete (18/18 tests, no deviations). Track 2 registration is now authorized.

---

## What and Why

Three items per the brief. All are Phase 7 Registration obligations for Component 7:

1. **Public index** — register Component 7 so external agents can resolve its path. Curator-authority; included here for record and Owner confirmation of the path.
2. **Coupling map** — add the two rows required by OQ4 and resolve the C1 structural question (how to represent the `a-docs/` co-maintenance dependency in the format dependency table).
3. **`$INSTRUCTION_WORKFLOW_COMPLEXITY`** — add an invocation reference directing agents to invoke Component 7 after completing the plan artifact. Type B coupling obligation. Requires Owner approval before implementation.

---

## Where Observed

A-Society — internal. All three items derive directly from the approved Component 7 design (`03-ta-to-owner.md`) and the TA's OQ4 resolution.

---

## Target Location

- `$A_SOCIETY_PUBLIC_INDEX`
- `$A_SOCIETY_TOOLING_COUPLING_MAP`
- `$INSTRUCTION_WORKFLOW_COMPLEXITY`

---

## Path Discrepancy Flag (out of scope — for Owner awareness)

Before the draft content: the existing public index entries for all six prior tooling components use `.js` extensions (e.g., `/a-society/tooling/src/path-validator.js`). No `.js` files exist anywhere in `tooling/src/` — only `.ts` files. The existing index entries are factually incorrect. Correcting all six is out of scope for this proposal (different flow, different brief). I am registering Component 7 with the correct `.ts` extension, consistent with the actual files on disk. The six stale `.js` entries are flagged here as a candidate for a future maintenance flow.

---

## Draft Content

---

### 1. `$A_SOCIETY_PUBLIC_INDEX` — Component 7 row

Add to the Tooling section, after the Version Comparator row:

| `$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR` | `/a-society/tooling/src/plan-artifact-validator.ts` | Component 7: Plan Artifact Validator — confirms a plan artifact exists in a given record folder and that its YAML frontmatter satisfies all required field constraints |

---

### 2. `$A_SOCIETY_TOOLING_COUPLING_MAP` — two new rows plus C1 resolution

**C1 decision (stated explicitly per `04-owner-decision.md` constraint):**

The coupling map's Format Dependencies table column is currently headed `` `general/` element ``. `$A_SOCIETY_COMM_TEMPLATE_PLAN` is an `a-docs/` file, not a `general/` element. The proposed representation is:

- **Column header change:** `` `general/` element `` → `` `general/` or `[a-docs]` element ``
- **Explanatory note:** Add a brief note above the Format Dependencies table body explaining the annotation
- **Row annotation:** The new row uses `` `[a-docs]` `` in the element column to mark it as an `a-docs/` dependency

This approach is minimal (one column header word change, one note, one annotation on the new row), makes the distinction visible at the exact point of use, and avoids restructuring the table with a separate section that would be needed only for this one row.

**Proposed changes to `$A_SOCIETY_TOOLING_COUPLING_MAP`:**

**Change A — Section intro note.** Add the following paragraph between the `## Format Dependencies` heading and the table:

> Note: rows annotated `[a-docs]` represent co-maintenance dependencies on `a-docs/` files rather than `general/` elements. These are tracked in this table because they require the same update discipline: when the referenced `a-docs/` artifact changes its schema or field structure, the dependent tooling component's validation constants must be updated to match.

**Change B — Column header.** In the table header row, change:

`| \`general/\` element | Format dependency | Component that depends on it |`

to:

`| \`general/\` or \`[a-docs]\` element | Format dependency | Component that depends on it |`

**Change C — New format dependency row.** Add after the last existing format dependency row (Scaffolding System row):

| `$A_SOCIETY_COMM_TEMPLATE_PLAN` frontmatter schema `[a-docs]`: `type`, `date`, `complexity.*` (five sub-fields: `domain_spread`, `shared_artifact_impact`, `step_dependency`, `reversibility`, `scope_size`), `tier`, `path`, `known_unknowns` | Yes | Component 7: Plan Artifact Validator |

**Change D — New invocation status row.** Add after the last existing invocation status row (Scaffolding System row):

| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | Component 7: Plan Artifact Validator | Open |

(This row closes to Closed once `$INSTRUCTION_WORKFLOW_COMPLEXITY` is updated — the status updates in the same implementation pass as item 3 below.)

---

### 3. `$INSTRUCTION_WORKFLOW_COMPLEXITY` — invocation reference

**Placement:** The "Producing a Workflow Plan" section (currently ends at "The workflow plan is the approval gate for the flow. Implementation does not begin until the plan exists."). The validator is the final step in plan production before handing off — natural placement is immediately after that sentence, as the last action before the gate is considered satisfied.

**Proposed addition:** Add the following paragraph at the end of the "Producing a Workflow Plan" section, after "Implementation does not begin until the plan exists.":

> **Plan artifact validation:** After the plan is drafted and before writing the brief, invoke `$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR` with the record folder path. Exit code 0 confirms the YAML frontmatter is present and all required fields are valid. A non-zero result identifies what to fix before proceeding. This step is required for the Owner before issuing a brief; it is not required for other roles reading the plan.

**Note on `$A_SOCIETY_RECORDS`:** The TA's OQ4 resolution stated that `$INSTRUCTION_WORKFLOW_COMPLEXITY` is the required invocation home, and that adding a reference in `$A_SOCIETY_RECORDS` is optional. I am not proposing an addition to `$A_SOCIETY_RECORDS`. If the Owner determines records context warrants it, that is a separate proposal.

**Invocation status close:** Once this addition is implemented, the invocation status row in `$A_SOCIETY_TOOLING_COUPLING_MAP` changes from Open to Closed. I will close the status in the same implementation pass.

---

## Implementation Sequence (if approved)

1. Add Component 7 row to `$A_SOCIETY_PUBLIC_INDEX`
2. Apply all four coupling map changes (section note, column header, format dependency row, invocation status row — Open)
3. Add invocation reference paragraph to `$INSTRUCTION_WORKFLOW_COMPLEXITY`
4. Close invocation status row in `$A_SOCIETY_TOOLING_COUPLING_MAP` (Open → Closed, with date)

---

## Owner Confirmation Required

The Owner must respond in `10-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not write to `$INSTRUCTION_WORKFLOW_COMPLEXITY` (or implement any item) until `10-owner-to-curator.md` shows APPROVED status.
