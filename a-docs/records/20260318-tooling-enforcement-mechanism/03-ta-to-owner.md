**Subject:** Plan artifact validator — component design proposal (Component 7)
**Status:** PENDING_REVIEW
**Type:** Technical Architect Component Design Proposal
**Date:** 2026-03-18

---

## Trigger

Owner brief (`02-owner-to-ta-brief.md`). The compulsory-complexity-gate flow (`20260317-compulsory-complexity-gate`) established a required plan artifact with a machine-readable YAML frontmatter schema. The brief directs the TA to scope and design a tooling component that validates plan artifacts programmatically.

---

## Open Question Resolutions

### OQ1 — New Component 7 vs. Component 3 extension

**Recommendation: New Component 7.**

Component 3 (Workflow Graph Schema Validator) validates that a workflow graph document matches the YAML frontmatter schema defined in `$INSTRUCTION_WORKFLOW_GRAPH`. Its purpose is narrow and specific: enabling Component 4 (Backward Pass Orderer) to trust its input. It validates a single schema for a single workflow artifact type, invoked in the context of workflow graph management.

The plan artifact validator would validate an entirely different schema (the `$A_SOCIETY_COMM_TEMPLATE_PLAN` frontmatter), serves a different workflow step (Phase 0 intake, not workflow graph management), has a different input model (a record folder path plus a file-presence check, rather than a workflow document path), and is invoked by a different role at a different point in the process. The presence check is distinctive: Component 3 validates a document the invoking agent already has; Component 7 first confirms the document exists at all.

A single "schema validator" component with two modes would conflate these distinctions, create coupling between unrelated schemas, and produce a component that does two things. Each existing component has one function. That pattern must continue.

One extension approach worth ruling out explicitly: adding a second invocation mode to Component 3 that accepts a schema specification and document path. This is not the right design. It would make Component 3's scope unbounded — any future schema validation need would extend it further — and it obscures the invocation semantics for agents reading the component list.

**The existing Component 3 remains unchanged. A new Component 7 is the correct design.**

---

### OQ2 — Invocation model: required gate vs. on-demand check

**Recommendation: On-demand check, with required invocation established by the protocol layer.**

No existing tooling component is automatic. All are agent-invoked: the agent calls the tool and interprets the result. The gate is always enforced by the protocol (role document + workflow invariant), not by the tool itself. This is how Component 2's check operation works — the check is on-demand; the consent invariant in `$A_SOCIETY_ARCHITECTURE` is what makes checking required before writing. The plan validator follows the same pattern.

Concretely: the component accepts a record folder path and returns a structured result. Any agent can invoke it. The invocation is required for the Owner before writing the brief — but that requirement lives in the workflow's Phase 0 gate language (already updated by the compulsory-complexity-gate flow) and in the Owner role's post-confirmation protocol, not in the tool.

A design that attempts to make the component itself block the Curator from proceeding would require the Curator to invoke the tool before accepting a brief, which would be an unusual role reversal (the Curator checking the Owner's pre-brief work). The structural gate is at the Owner's output, not the Curator's input. The Owner self-invokes the validator after completing the plan and before writing the brief. This is the correct model.

**The component is designed as an on-demand check. The required-gate behavior is established by the protocol layer, which already exists.**

---

### OQ3 — Phase placement

**Recommendation: New phase slot (Phase 1A) alongside Phase 1 in the addendum dependency diagram; standalone implementation sprint.**

Component 7's dependency profile matches Phase 1 exactly: no cross-component dependencies, read-only (no file writes), validates a stable artifact format. Had this component been designed at initial scoping, it would have been part of Phase 1 (Foundation Primitives) alongside Components 5 and 6.

Since Phases 1–6 are complete, the component cannot slot into an existing phase — it requires its own implementation sprint. The correct approach is to add a new phase slot in the addendum that reflects its logical position alongside Phase 1 (concurrent with Phases 1–3, before Phase 4's hard dependency on Phase 3). Call this Phase 1A for now; the Curator and Owner determine the final naming when updating the addendum.

This is not a reason to defer the component to a later phase. Deferral to Phase 6A (after all other work) would misrepresent the dependency profile and imply false sequencing constraints. The component can be implemented as soon as the Owner approves the design.

**Phase placement: new Phase 1A, logically concurrent with Phase 1, requires its own implementation sprint since Phase 1 is complete.**

---

### OQ4 — Coupling map implications

**Two new rows are required: one format dependency row, one invocation status row. One structural note must be surfaced.**

**Format dependency row:**

| `general/` element | Format dependency | Component that depends on it |
|---|---|---|
| Plan artifact YAML frontmatter schema (`$A_SOCIETY_COMM_TEMPLATE_PLAN`): `type`, `date`, `complexity.*` (five sub-fields), `tier`, `path`, `known_unknowns` | Yes | Component 7: Plan Artifact Validator |

**Structural note for the Curator:** `$A_SOCIETY_COMM_TEMPLATE_PLAN` is an `a-docs/` file, not a `general/` element. The coupling map currently tracks `general/` format dependencies. The Curator must determine how to represent this `a-docs/` co-maintenance dependency in the format table — options include a note in the table header, a row annotation, or a separate `a-docs/` co-maintenance section. This decision is for the Curator to propose and Owner to approve when updating the coupling map at Phase 7.

**Invocation status row:**

| `general/` instruction | Component that should be mentioned | Invocation Status |
|---|---|---|
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | Component 7: Plan Artifact Validator | Open |

**Rationale:** The coupling map pattern is that the instruction which teaches agents to create or use an artifact also teaches them to validate it. `$INSTRUCTION_WORKFLOW_COMPLEXITY` is where intake analysis and plan artifact creation are described — it is the natural home for the validator invocation reference. `$A_SOCIETY_RECORDS` covers record folder structure, not plan artifact production; it does not need an invocation reference. The Curator may additionally reference Component 7 in `$A_SOCIETY_RECORDS` if they determine the records context benefits from it, but this is not required.

**This is a Type B change:** a new tool is built that agents should invoke → requires a `general/` instruction update naming the tool and directing agents to invoke it. The `$INSTRUCTION_WORKFLOW_COMPLEXITY` update (adding the invocation reference) follows the standard proposal flow.

---

## Component 7: Plan Artifact Validator — Full Design

### What it is

A tool that confirms a plan artifact exists in a given record folder and that its YAML frontmatter satisfies all required field constraints from the approved schema.

---

### What it does

1. Accepts a record folder path
2. Checks whether `01-owner-workflow-plan.md` exists at `[record-folder]/01-owner-workflow-plan.md`
3. If absent: returns a presence failure immediately (no further parsing)
4. If present: parses the YAML frontmatter block from the file
5. Validates all required fields against the approved schema:
   - `type` equals `owner-workflow-plan` (string equality)
   - `date` is non-null (any non-null string passes — format strictness is out of scope)
   - `complexity.domain_spread` is non-null and in `{low, moderate, elevated, high}`
   - `complexity.shared_artifact_impact` is non-null and in `{low, moderate, elevated, high}`
   - `complexity.step_dependency` is non-null and in `{low, moderate, elevated, high}`
   - `complexity.reversibility` is non-null and in `{low, moderate, elevated, high}`
   - `complexity.scope_size` is non-null and in `{low, moderate, elevated, high}`
   - `tier` is non-null and in `{1, 2, 3}` (integer or string representation)
   - `path` is a non-empty list (at least one element)
   - `known_unknowns` is a list (empty list is valid)
6. Returns a structured result (see Interface below)

---

### What it does NOT do

- Evaluate the quality or appropriateness of the complexity ratings or tier selection — these are Owner judgments, not validation targets
- Validate the content of `path` entries — only the non-empty constraint is checked
- Validate `date` format — only non-null is checked
- Modify any files
- Locate record folders automatically — the invoking agent provides the path
- Validate artifacts other than `01-owner-workflow-plan.md`

---

### Interface

**Input:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `record_folder_path` | string | yes | Path to the record folder. Absolute path preferred; relative path resolved from tool invocation directory. |

**Output (structured JSON):**

```json
{
  "valid": true | false,
  "file_status": "present" | "absent",
  "path_checked": "<resolved absolute path to 01-owner-workflow-plan.md>",
  "errors": [
    {
      "field": "<field name, e.g. 'complexity.domain_spread', 'tier', 'path'>",
      "issue": "<description, e.g. 'null', 'invalid value: medium', 'empty list', 'missing field'>"
    }
  ]
}
```

- When `file_status` is `absent`, `valid` is `false` and `errors` contains one entry: `{ "field": "file", "issue": "absent" }`
- When `file_status` is `present` and all fields pass, `valid` is `true` and `errors` is an empty array
- When `file_status` is `present` and one or more fields fail, `valid` is `false` and `errors` contains one entry per failing field

**Exit codes (consistent with existing tooling conventions):**

| Code | Meaning |
|---|---|
| 0 | Plan present and all required fields valid |
| 1 | Plan absent, or present but one or more field validations failed |
| 2 | Parse error (malformed YAML, unreadable file) or tool invocation error (invalid path argument) |

---

### Interface with the documentation layer

The tool does not read `$A_SOCIETY_COMM_TEMPLATE_PLAN` at runtime. The validated schema (field names, allowed values, required/optional status) is maintained as constants in the tool source. When `$A_SOCIETY_COMM_TEMPLATE_PLAN` is updated to add, remove, or change required fields, the tool source must be updated to match — consistent with Component 2's co-maintenance pattern.

Reads: `[record-folder]/01-owner-workflow-plan.md` only. Does not read other record folder artifacts. Does not read or write any A-Society `a-docs/` or `general/` files at runtime.

Writes: nothing.

---

### Dependencies

- **Stable plan artifact frontmatter schema.** The schema is fixed by the OQ1 resolution in `20260317-compulsory-complexity-gate/03-curator-to-owner.md` and reflected in `$A_SOCIETY_COMM_TEMPLATE_PLAN`. Changes to the schema are a trigger for a tool update (Type A change in the coupling taxonomy).
- **Co-maintenance dependency.** `$A_SOCIETY_COMM_TEMPLATE_PLAN` frontmatter schema and the tool's validation constants must be kept in sync manually. This dependency must be documented in the updated `$A_SOCIETY_TOOLING_PROPOSAL` entry for Component 7.
- **No cross-component dependencies.** Component 7 does not depend on any other tooling component and no other component depends on it.

---

### Implementation note for the Tooling Developer

The plan artifact uses YAML frontmatter embedded in a markdown file — the same pattern as the workflow graph format (Component 3's input domain). A YAML frontmatter parser already in the tooling project's dependency set should be reused if available. If no frontmatter parser exists, the Developer selects one; parser selection is within Developer authority. The tool must handle the case where a YAML frontmatter block is absent from the file (treat as a parse error, exit code 2).

---

## Target Location

- **Component 7 implementation:** `tooling/` (path within `tooling/` at Developer's discretion, consistent with existing component naming conventions)
- **Spec update:** `$A_SOCIETY_TOOLING_PROPOSAL` — new Component 7 entry added by Curator after Owner approval, following the assessment pattern from `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`
- **Addendum update:** `$A_SOCIETY_TOOLING_ADDENDUM` — new Phase 1A slot added by Curator; session model table updated
- **Architecture update:** `$A_SOCIETY_ARCHITECTURE` — component count updated from six to seven
- **Coupling map update:** `$A_SOCIETY_TOOLING_COUPLING_MAP` — two new rows added by Curator at Phase 7 (Registration)
- **Invocation instruction update:** `$INSTRUCTION_WORKFLOW_COMPLEXITY` — invocation reference added by Curator; follows standard proposal flow

---

## Summary of open questions resolved

| OQ | Resolution |
|---|---|
| OQ1: New component vs. Component 3 extension | New Component 7. Separate schemas, separate workflow steps, separate invocation context, different input model (presence check + field validation vs. document validation only). |
| OQ2: Required gate vs. on-demand check | On-demand check. Required invocation established by protocol layer (Phase 0 gate in `$A_SOCIETY_WORKFLOW`, Owner role post-confirmation protocol). Consistent with agent-invoked model. |
| OQ3: Phase placement | New Phase 1A alongside Phase 1 in the addendum dependency diagram. Phase 1-class dependency profile (no cross-component dependencies, read-only). Standalone implementation sprint since Phase 1 is complete. |
| OQ4: Coupling map | One new format dependency row (plan artifact YAML schema → Component 7); one new invocation status row (`$INSTRUCTION_WORKFLOW_COMPLEXITY` → Component 7 → Open). Type B change. Structural note: `$A_SOCIETY_COMM_TEMPLATE_PLAN` is an `a-docs/` file — Curator decides how to represent this in the format dependency table. |

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-ta.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Tooling Developer does not begin implementation until `04-owner-to-ta.md` shows APPROVED status.

---

**Handoff:** Output ready for Owner review. Switch to the Owner session (Session A). The Owner reads `a-society/a-docs/records/20260318-tooling-enforcement-mechanism/03-ta-to-owner.md` and responds in `04-owner-to-ta.md`.
