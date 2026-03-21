---

**Subject:** General library sync — 6 Next Priority items (proposal)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-22

---

## Trigger

Six items from Next Priorities bundled in `02-owner-to-curator-brief.md`. Items 1, 2, 4, 5, 6 require Owner approval. Item 3 is Curator-direct; it is noted below for visibility but requires no approval.

---

## Where Observed

A-Society — internal. Items 1, 4, 5, and 6 trace to prior flow corrections (`workflow-mechanics-corrections` and predecessor flows) that were applied to `a-docs/` but not yet propagated to the corresponding `general/` files. Item 2 was a conditional inspection; result is reported below. Item 3 is a Curator-direct tooling fix.

---

## Target Location

| Item | Target | Variable | Action |
|---|---|---|---|
| Item 1 | `a-society/general/instructions/workflow/graph.md` | `$INSTRUCTION_WORKFLOW_GRAPH` | additive |
| Item 2 | `a-society/general/instructions/records/main.md` | `$INSTRUCTION_RECORDS` | **no change** (see inspection result below) |
| Item 3 | Component 3 test file in `a-society/tooling/` | — | Curator-direct, no approval required |
| Item 4 | `a-society/general/improvement/main.md` | `$GENERAL_IMPROVEMENT` | additive |
| Item 5 | `a-society/general/roles/owner.md` | `$GENERAL_OWNER_ROLE` | additive |
| Item 6 | `a-society/general/improvement/main.md` | `$GENERAL_IMPROVEMENT` | additive |

---

## Item 1 — `$INSTRUCTION_WORKFLOW_GRAPH`: Add `human-collaborative` field to the schema

**What and why:** Component 3 (Workflow Graph Schema Validator) validates an optional `human-collaborative` field on workflow nodes: a non-empty string when present; `null` or absent is valid. This field is not currently documented in the `$INSTRUCTION_WORKFLOW_GRAPH` schema section, creating an instruction/tool parity gap. Agents constructing workflow graphs have no documented guidance for when or how to include it.

**Generalizability:** Any project using a workflow graph representation may have nodes requiring human participation. The field is optional and domain-agnostic — it applies equally to a software project, a writing project, and a research project.

**Draft content — two additions to `$INSTRUCTION_WORKFLOW_GRAPH`:**

*Addition 1: Schema block.* In the `Schema` section, add `human-collaborative` as a third node field after `role`:

```yaml
workflow:
  name: [string — the graph name; copy from workflow/main.md "Graph:" line, or use the document title]
  nodes:
    - id: [string — unique identifier for this structural node]
      role: [string — role name exactly as declared in agents.md]
      human-collaborative: [string, optional — description of the human input required at this node; null or absent when fully agent-driven]
  edges:
    - from: [string — node id]
      to: [string — node id]
      artifact: [string, optional — artifact type produced at this handoff, e.g. approval-decision]
```

*Addition 2: Field Definitions.* In the `workflow.nodes` subsection of Field Definitions, after the **`role`** entry, add:

> **`human-collaborative`** — optional. When present, must be a non-empty string describing the human input required at this node. Null or absent when the node is fully agent-driven.

---

## Item 2 — `$INSTRUCTION_RECORDS` sync gap: Inspection Result

**Inspection performed.** `$INSTRUCTION_RECORDS` was read in full during proposal formulation and examined for: (a) update-report-specific framing in any post-decision submission paragraph, and (b) naming convention examples referencing update reports.

**Finding: no parallel language found.** `$INSTRUCTION_RECORDS` contains no reference to update reports as post-implementation submission artifacts. No update-report-specific naming convention examples are present. The document's What Goes in a Record section lists only: the Phase 0 gate artifact (workflow plan), conversation artifacts (briefings, proposals, decisions), and findings. The naming convention section shows only the standard `YYYYMMDD-slug` and `[project]-NNN` patterns.

**Item 2 closes with no change.**

---

## Item 3 — Component 3 live-workflow compatibility test fix `[Curator authority — implement directly]`

Noted for visibility. This item is marked `[Curator authority — implement directly]` in the brief and requires no Owner approval. It will be executed during the implementation session alongside Items 1, 4, 5, and 6. The test target will be updated from `a-society/a-docs/workflow/main.md` (the routing file, which has no YAML frontmatter) to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (`a-society/a-docs/workflow/framework-development.md`), which is a live workflow graph document with a valid YAML frontmatter schema.

---

## Item 4 — `$GENERAL_IMPROVEMENT` Guardrails: "complete = executed, not approved"

**What and why:** `$A_SOCIETY_IMPROVEMENT` Guardrails was updated during `workflow-mechanics-corrections` to clarify that approval is not completion — a step is forward-pass closed when it has been executed, not merely approved. The intake role must verify execution. This clarification is equally valid for any project using this framework and prevents the same class of forward pass closure boundary violation in any project.

**Generalizability:** The distinction between "approved" and "executed" applies to any multi-role workflow regardless of domain. The failure mode (intake role declaring closure while downstream tasks remain pending) is not A-Society-specific.

**Draft content — addition to `$GENERAL_IMPROVEMENT` Guardrails:**

In the Guardrails section, append to the existing **Forward pass closure boundary** bullet point, after the sentence "Findings produced before the forward pass is confirmed closed may be based on incomplete work.":

> **Approval is not completion:** The intake role confirming forward pass closure while downstream tasks remain pending (e.g., a step approved but not yet executed) is a forward pass closure boundary violation. "Complete" means executed; the intake role must verify execution, not merely that approval was issued.

---

## Item 5 — `$GENERAL_OWNER_ROLE` Brief-Writing Quality: add obsoletes check

**What and why:** `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality was updated during `workflow-mechanics-corrections` to include a paragraph requiring that when an Owner proposes an output-format change, they also assess what the change makes obsolete and scope that removal in the brief. Without this guidance, obsolescence assessment is transferred to the downstream role unnecessarily, creating additional correction rounds. This guidance applies to any project whose briefs can introduce output-format changes.

**Generalizability:** Output-format changes can introduce obsolescence in any multi-role project. The obligation to scope removals at brief-writing time — rather than leaving them to the downstream role — is a valid quality rule regardless of domain.

**Draft content — addition to `$GENERAL_OWNER_ROLE` Brief-Writing Quality:**

In the Brief-Writing Quality section, after the output-format changes paragraph (the paragraph ending "...'Open Questions: None' is only correct when the output form is also fully derivable from the brief."), insert:

> When proposing an output-format change, also assess whether the change makes any existing field, section, or type value obsolete — and scope that removal explicitly in the brief. A brief that adds a new section without checking what the addition makes vestigial transfers that obsolescence assessment to the downstream role unnecessarily.

---

## Item 6 — `$GENERAL_IMPROVEMENT` How It Works: synthesis closes the backward pass

**What and why:** `$A_SOCIETY_IMPROVEMENT` How It Works now explicitly states that Curator completing synthesis closes the backward pass — no further handoff is required, and the flow is complete when synthesis is done. The omission of this statement from `$GENERAL_IMPROVEMENT` caused a routing error in a prior flow (the Curator handed to the Owner after synthesis, treating the backward pass as still open). Any project using this framework is subject to the same ambiguity.

**Generalizability:** The backward pass closure rule applies to any project using the synthesis model: the synthesis role completing synthesis ends the backward pass. No project type warrants a different routing rule after synthesis.

**Draft content — addition to `$GENERAL_IMPROVEMENT` How It Works:**

In the How It Works section, after the final line of step 5 ("Do not re-route improvement items through the project's main execution workflow."), add:

> The synthesis role completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.

---

## Update Report Draft

Items 1, 4, 5, and 6 modify existing `general/` files in ways that affect guidance adopting projects received at initialization. A framework update report is warranted. All four changes are Recommended. Current version: v17.3. Proposed next version: v17.4.

---

# A-Society Framework Update — 2026-03-22

**Framework Version:** v17.4
**Previous Version:** v17.3

## Summary

Four additive improvements to the general library: the workflow graph schema now documents the optional `human-collaborative` node field; the improvement protocol Guardrails clarifies that approval is not completion; the Owner role template Brief-Writing Quality section adds an obsoletes check requirement for output-format changes; and the improvement protocol How It Works section explicitly closes the backward pass when synthesis is complete. All changes are Recommended.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 4 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Workflow graph schema: `human-collaborative` node field documented

**Impact:** Recommended
**Affected artifacts:** `general/instructions/workflow/graph.md`
**What changed:** The optional `human-collaborative` field has been added to the node schema documentation in the workflow graph instruction. The field accepts a non-empty string when present; null or absent is valid. It appears after the required `role` field in both the schema block and the Field Definitions section.
**Why:** The field was accepted by the workflow graph validator but not documented in the instruction, creating an instruction/tool parity gap. Agents constructing workflow graphs had no guidance for when or how to include it.
**Migration guidance:** If your project has a workflow graph instruction (`$[PROJECT]_INSTRUCTION_WORKFLOW_GRAPH` or equivalent), review it and add the `human-collaborative` optional field to the node schema documentation, positioned after the `role` field. If your project's workflow graphs already use this field, no change is needed beyond the instruction update. If your project does not use `human-collaborative` in any workflow graphs, no change to existing graphs is required — the field remains optional.

---

### Improvement protocol Guardrails: approval is not completion

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** The Forward pass closure boundary guardrail now explicitly states that approval is not completion. The intake role confirming forward pass closure while downstream tasks remain pending is a forward pass closure boundary violation. "Complete" means executed; the intake role must verify execution, not merely that approval was issued.
**Why:** A prior flow's intake role declared the forward pass closed after approving a publication step that had not yet been executed. The step was pending when closure was declared, which would have allowed backward pass findings to be produced against incomplete work. The clarification prevents this class of violation.
**Migration guidance:** Review your project's improvement protocol (`$[PROJECT]_IMPROVEMENT` or equivalent). If it contains a Forward pass closure boundary guardrail, append the "Approval is not completion" clarification after the existing guardrail text. Adapt role names to match your project's structure.

---

### Owner role template Brief-Writing Quality: obsoletes check for output-format changes

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** The Brief-Writing Quality section now includes a paragraph requiring the Owner to assess what an output-format change makes obsolete and scope any removals explicitly in the brief. A brief that adds a new section without checking for vestigial content transfers that obsolescence assessment to the downstream role unnecessarily.
**Why:** Without this guidance, an Owner proposing an output-format change may add a new section without scoping what the addition makes stale, leaving the downstream role to discover and remediate the obsolescence during implementation — which adds an unplanned correction round.
**Migration guidance:** Review your project's Owner role document (`$[PROJECT]_OWNER_ROLE` or equivalent). In the Brief-Writing Quality section, after the paragraph that introduces output-format change requirements, add the obsoletes check guidance. Adopt the language as-is or adapt to match your project's role names (substitute your downstream implementation role where "downstream role" appears).

---

### Improvement protocol How It Works: synthesis closes the backward pass

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** The How It Works section now explicitly states that the synthesis role completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.
**Why:** The omission caused a routing error in a prior flow: the synthesis role handed back to the intake role after synthesis, treating the backward pass as still open. The addition makes the closure rule explicit and prevents the same misrouting in any project using the synthesis model.
**Migration guidance:** Review your project's improvement protocol (`$[PROJECT]_IMPROVEMENT` or equivalent). In the How It Works section, at the end of the synthesis description (after the routing guidance for actionable items), add the statement that synthesis closes the backward pass and no further handoff is required. Adapt role names to match your project's structure.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
