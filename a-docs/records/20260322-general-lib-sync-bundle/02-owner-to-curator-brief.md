---

**Subject:** General library sync — 6 Next Priority items
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$INSTRUCTION_WORKFLOW_GRAPH` | additive |
| `$INSTRUCTION_RECORDS` | additive (conditional on inspection) |
| `$GENERAL_IMPROVEMENT` | additive (two additions) |
| `$GENERAL_OWNER_ROLE` | additive |
| Component 3 test file (`a-society/tooling/`) | replace target |

Six items from Next Priorities are bundled here. Items 1, 2, 4, 5, 6 require Owner approval. Item 3 is Curator-authority direct and executes during the implementation session alongside the approved items.

---

**Item 1 — `$INSTRUCTION_WORKFLOW_GRAPH`: Add `human-collaborative` field to the schema** `[Requires Owner approval]` `[additive]`

Component 3 (Workflow Graph Schema Validator) now validates an optional `human-collaborative` field on workflow nodes (accepted as a non-empty string when present; `null` or absent is valid). `$INSTRUCTION_WORKFLOW_GRAPH` does not yet document this field in its schema section, creating an instruction/tool parity gap.

Add `human-collaborative` to the node schema documentation in `$INSTRUCTION_WORKFLOW_GRAPH`: optional field; non-empty string when present. Position it after the existing required node fields in the schema table or field list, consistent with the existing schema documentation format in that file.

---

**Item 2 — `$INSTRUCTION_RECORDS` sync gap for post-decision submission model** `[Requires Owner approval]` `[additive — conditional on inspection]`

During `workflow-mechanics-corrections`, `$A_SOCIETY_RECORDS` had its update-report-specific example removed (the update report is no longer a post-implementation submission artifact) and its naming convention examples updated accordingly. `$INSTRUCTION_RECORDS` may carry parallel language — specifically, update-report-specific framing in the post-decision submission paragraph and/or naming convention examples.

Inspect `$INSTRUCTION_RECORDS` during proposal formulation. If parallel language is found, include the corresponding cleanup in this proposal as a LIB change. If no parallel language is found, confirm this explicitly in the proposal — Item 2 closes with no change.

---

**Item 3 — Component 3 live-workflow compatibility test fix** `[Curator authority — implement directly]` `[replace target]`

The Component 3 test "live A-Society workflow passes validation" targets `a-society/a-docs/workflow/main.md` — the routing file, which has no YAML frontmatter — rather than an actual workflow graph document. This produces a pre-existing parse failure that validates incorrect behavior.

Update the test target to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (`a-society/a-docs/workflow/framework-development.md`), which is a live workflow graph document with a valid YAML frontmatter schema. Execute in the same session as the implementation of Items 1, 2, 4, 5, 6. No proposal or Owner approval required.

---

**Item 4 — `$GENERAL_IMPROVEMENT` Guardrails: "complete = executed, not approved"** `[Requires Owner approval]` `[additive]`

During `workflow-mechanics-corrections`, `$A_SOCIETY_IMPROVEMENT` Guardrails was updated with a clarification that approval is not completion — a step is forward-pass closed when it has been executed, not merely approved. This clarification is equally valid for any project using this framework.

Add an equivalent statement to `$GENERAL_IMPROVEMENT` Guardrails, immediately after the existing forward pass closure boundary guardrail. Consult `$A_SOCIETY_IMPROVEMENT` for the domain-specific wording and produce a domain-agnostic equivalent.

---

**Item 5 — `$GENERAL_OWNER_ROLE` Brief-Writing Quality: add obsoletes check** `[Requires Owner approval]` `[additive]`

`$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality includes the following paragraph (added during `workflow-mechanics-corrections`):

> "When proposing an output-format change, also assess whether the change makes any existing field, section, or type value obsolete — and scope that removal explicitly in the brief. A brief that adds a new section without checking what the addition makes vestigial transfers that obsolescence assessment to the Curator unnecessarily."

This guidance applies to any project whose briefs can introduce output-format changes. Add the equivalent paragraph to `$GENERAL_OWNER_ROLE` Brief-Writing Quality, immediately after the paragraph that introduces output-format change requirements. Produce a domain-agnostic formulation.

---

**Item 6 — `$GENERAL_IMPROVEMENT` How It Works: synthesis closes the backward pass** `[Requires Owner approval]` `[additive]`

`$A_SOCIETY_IMPROVEMENT` How It Works now explicitly states that Curator completing synthesis closes the backward pass — no further handoff is required, and the flow is complete when synthesis is done. The omission of this statement from `$GENERAL_IMPROVEMENT` caused a routing error in a prior flow (Curator handed to Owner after synthesis, treating the backward pass as still open).

Add an equivalent statement to `$GENERAL_IMPROVEMENT`, at the end of the synthesis description in the How It Works section. Consult `$A_SOCIETY_IMPROVEMENT` for the domain-specific wording and produce a domain-agnostic equivalent.

---

## Scope

**In scope:** Items 1–6 as described above. Item 3 is Curator-direct and executes during the implementation pass.

**Out of scope:** Changes to `$A_SOCIETY_IMPROVEMENT` or `$A_SOCIETY_OWNER_ROLE` (already updated in prior flows). Backward pass findings for this flow (produced after implementation and registration are complete).

---

## Likely Target

| Target | Variable | Path |
|---|---|---|
| Workflow graph instruction | `$INSTRUCTION_WORKFLOW_GRAPH` | `a-society/general/instructions/workflow/graph.md` |
| Records instruction | `$INSTRUCTION_RECORDS` | `a-society/general/instructions/records/main.md` |
| General improvement | `$GENERAL_IMPROVEMENT` | `a-society/general/improvement/main.md` |
| General owner role | `$GENERAL_OWNER_ROLE` | `a-society/general/roles/owner.md` |
| Component 3 test file | — | `a-society/tooling/` (Curator locates) |

---

## Open Questions for the Curator

None. All items are fully specified — no judgment calls are required. Item 2 has a conditional outcome (implement if parallel language found; close with no change if absent), but the outcome requires no judgment: the Curator either finds the language or does not.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for General library sync — 6 Next Priority items."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
