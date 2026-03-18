**Subject:** Component 7 pre-implementation documentation — proposal (Track 1)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-18

---

## Trigger

Owner brief at `05-owner-to-curator-brief.md`, following Owner approval of Component 7 (Plan Artifact Validator) design in `04-owner-decision.md`. This proposal covers all three Track 1 pre-implementation documentation artifacts. Owner approval of all three is the gate for opening Session C.

---

## What and Why

Three `a-docs/` files must be updated to register Component 7 before the Tooling Developer begins implementation:

1. **`$A_SOCIETY_TOOLING_PROPOSAL`** — add Component 7 entry. The proposal is the Tooling Developer's binding specification. Without a Component 7 entry, the Developer has no authoritative design reference and Session C cannot open (per the Phase 0 gate requirement).

2. **`$A_SOCIETY_TOOLING_ADDENDUM`** — add Phase 1A slot and update the session model table. The addendum is the implementation workflow; Component 7's phase placement and Session C's expanded scope must be reflected there before implementation begins.

3. **`$A_SOCIETY_ARCHITECTURE`** — update component count and table. The architecture document is the system overview; the component count and table are factually incorrect at six until Component 7 is registered.

None of these changes require generalizability assessment — all three are `a-docs/` updates to A-Society's internal operational documents, not `general/` additions.

---

## Where Observed

A-Society — internal. Follows directly from Owner approval of the TA's Component 7 design (`04-owner-decision.md`).

---

## Target Location

- `$A_SOCIETY_TOOLING_PROPOSAL`
- `$A_SOCIETY_TOOLING_ADDENDUM`
- `$A_SOCIETY_ARCHITECTURE`

---

## Draft Content

---

### 1. `$A_SOCIETY_TOOLING_PROPOSAL` — new Component 7 entry

Insert after the Component 6 section (end of Section 2, before Section 3: Tooling Development Workflow Proposal). Full entry:

---

### Component 7: Plan Artifact Validator

**What it is:** A tool that confirms a plan artifact exists in a given record folder and that its YAML frontmatter satisfies all required field constraints from the approved schema.

**What it does:**
- Accepts a record folder path
- Checks whether `01-owner-workflow-plan.md` exists at `[record-folder]/01-owner-workflow-plan.md`
- If absent: returns a presence failure immediately (no further parsing)
- If present: parses the YAML frontmatter block from the file
- Validates all required fields against the approved schema:
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
- Returns a structured result (see Interface below)

**What it does NOT do:**
- Evaluate the quality or appropriateness of the complexity ratings or tier selection — these are Owner judgments, not validation targets
- Validate the content of `path` entries — only the non-empty constraint is checked
- Validate `date` format — only non-null is checked
- Modify any files
- Locate record folders automatically — the invoking agent provides the path
- Validate artifacts other than `01-owner-workflow-plan.md`

**Interface:**

*Input:*

| Parameter | Type | Required | Description |
|---|---|---|---|
| `record_folder_path` | string | yes | Path to the record folder. Absolute path preferred; relative path resolved from tool invocation directory. |

*Output (structured JSON):*

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

*Exit codes (consistent with existing tooling conventions):*

| Code | Meaning |
|---|---|
| 0 | Plan present and all required fields valid |
| 1 | Plan absent, or present but one or more field validations failed |
| 2 | Parse error (malformed YAML, unreadable file) or tool invocation error (invalid path argument) |

**Interface with the documentation layer:**

The tool does not read `$A_SOCIETY_COMM_TEMPLATE_PLAN` at runtime. The validated schema (field names, allowed values, required/optional status) is maintained as constants in the tool source. When `$A_SOCIETY_COMM_TEMPLATE_PLAN` is updated to add, remove, or change required fields, the tool source must be updated to match — consistent with Component 2's co-maintenance pattern.

Reads: `[record-folder]/01-owner-workflow-plan.md` only. Does not read other record folder artifacts. Does not read or write any A-Society `a-docs/` or `general/` files at runtime.

Writes: nothing.

**Dependencies:**
- **Stable plan artifact frontmatter schema.** The schema is fixed by the resolution in `20260317-compulsory-complexity-gate/03-curator-to-owner.md` and reflected in `$A_SOCIETY_COMM_TEMPLATE_PLAN`. Changes to the schema are a trigger for a tool update (Type A change in the coupling taxonomy).
- **Co-maintenance dependency.** `$A_SOCIETY_COMM_TEMPLATE_PLAN` frontmatter schema and the tool's validation constants must be kept in sync manually. This dependency is documented in `$A_SOCIETY_TOOLING_COUPLING_MAP` (added at Phase 7 Registration).
- **No cross-component dependencies.** Component 7 does not depend on any other tooling component and no other component depends on it.

---

### 2. `$A_SOCIETY_TOOLING_ADDENDUM` — Phase 1A slot and session model update

**Naming decision:** The TA used "Phase 1A" as an informal label and delegated final naming to the Curator and Owner. I propose retaining **Phase 1A** as the final name. It communicates position clearly (alongside Phase 1, after Phase 0 gate clears), accurately reflects the Phase 1-class dependency profile, and does not imply false sequencing constraints relative to Phases 2 or 3.

**Three changes to the addendum:**

#### Change A — New Phase 1A section

Insert after the Phase 1 section (after "**Output:** Working Path Validator and Version Comparator in `tooling/`."). Full phase section:

---

#### Phase 1A — Plan Artifact Validator

**Purpose:** Implement Plan Artifact Validator (Component 7). Phase 1-class dependency profile: no cross-component dependencies, read-only (no file writes), validates a stable artifact format.

**Role:** Tooling Developer (primary). TA on-demand if spec questions arise.

**Work:**
- Implement Component 7: Plan Artifact Validator
- Test against: a record folder with a valid plan artifact (exit code 0), an absent plan artifact (exit code 1), a plan with one or more invalid field values (exit code 1), a file with malformed YAML frontmatter (exit code 2)

**TA involvement:** On-demand. Developer escalates to TA if the component design is ambiguous during implementation. TA is not required at phase completion if no deviations occurred.

**Gate:** None beyond Phase 0. TA confirms no deviations if the Developer escalated anything. Owner is not required between Phase 1A and subsequent phases unless a deviation escalated past the TA.

**Parallelism note:** Phase 1A may run concurrently with Phases 1–3. It has no dependency on any other component and no other component depends on it. It may be implemented as soon as Phase 0 clears.

**Output:** Working Plan Artifact Validator in `tooling/`.

---

#### Change B — Session model table

Update Session C row:

| Session | Role | Active in phases |
|---|---|---|
| Session C | Tooling Developer | Phases 1, **1A**, 2, 4, 5, 6 |

(No other session rows change.)

#### Change C — Phase dependency diagram

Replace the existing diagram with:

```
Phase 0 (Owner gate)
  ├── Phase 1 (Developer) ─── Phase 2 (Developer)
  ├── Phase 1A (Developer) [concurrent with Phases 1–3; no inter-phase dependencies]
  └── Phase 3 (Curator/Owner gate)                 ─── Phase 4 (Developer)
                                                                └── Phase 5 (Developer)
                                                                          └── Phase 6 (Developer + TA + Owner gate)
                                                                                    └── Phase 7 (Curator + backward pass)
```

**Note on backward pass forward-pass node description:** The addendum's Phase 7 section currently lists the forward-pass node order as "Tooling Developer (Phases 1–2)". This should be updated to "Tooling Developer (Phases 1, 1A, 2)" to reflect Phase 1A. The backward pass order is unchanged (Developer's first occurrence remains Phase 1; Phase 1A does not alter first-occurrence position).

---

### 3. `$A_SOCIETY_ARCHITECTURE` — component count and table

**Change A — Component count in System Overview**

Replace:
> The tooling layer comprises six components, each covering a distinct deterministic operation:

With:
> The tooling layer comprises seven components, each covering a distinct deterministic operation:

**Change B — Component table: add Component 7 row**

Insert after the "Version Comparator (6)" row (Phase 1 components), before "Consent Utility (2)":

| Plan Artifact Validator (7) | Confirms a plan artifact exists in a given record folder and that its YAML frontmatter satisfies all required field constraints |

This placement reflects implementation phase order: Component 7 is in Phase 1A, logically concurrent with Phase 1, before Phase 2.

**Change C — Phase reference parenthetical**

Replace:
> Component numbers reflect the implementation phase order (phases 1–5 in the approved proposal).

With:
> Component numbers reflect the implementation phase order (Phases 1–5 in the approved proposal; Component 7 is in Phase 1A, concurrent with Phases 1–3).

---

## Owner Confirmation Required

The Owner must respond in `07-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `07-owner-to-curator.md` shows APPROVED status. Session C does not open until all three artifacts are approved and implemented.
