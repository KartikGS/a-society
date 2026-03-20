---
**Subject:** Backward pass orderer redesign — framework update report draft
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-20
**Proposal:** `06-curator-to-owner.md` (approved at `07-owner-to-curator.md`)

---

## Trigger

Changes 2 and 4 from the approved brief modified `general/` files in ways that affect the guidance adopting projects received at initialization. Per `$A_SOCIETY_UPDATES_PROTOCOL`, a framework update report is required.

**Trigger conditions met:**
- `$GENERAL_IMPROVEMENT` (Change 2): an existing `general/` document changed in a way that affects the guidance adopting projects received — the Backward Pass Orderer invocation model changed materially (input source and invocation condition both changed).
- `$INSTRUCTION_RECORDS` (Change 4): a new section was added to a `general/` instruction describing `workflow.md` as a record folder artifact required for projects using the Backward Pass Orderer.

**Trigger conditions not met:**
- Changes 1, 3, and 5 were `a-docs/`-only changes. They do not trigger an update report.

---

## Implementation Status

**Implementation complete:** Yes — all five changes have been applied.

**Files changed:**
- `$A_SOCIETY_IMPROVEMENT` — Component 4 mandate subsection replaced
- `$GENERAL_IMPROVEMENT` — Tooling paragraph replaced
- `$A_SOCIETY_RECORDS` — `workflow.md` section added; "Creating a Record Folder" step count updated
- `$INSTRUCTION_RECORDS` — `workflow.md` section added; Step 2 of "How to Create" updated
- `$A_SOCIETY_ARCHITECTURE` — Component 4 table row description updated

**Publication condition outstanding:** Yes — `$A_SOCIETY_VERSION` must be incremented to v16.0 and the report published to `$A_SOCIETY_UPDATES_DIR` upon Owner approval. Both writes are a single atomic registration step.

---

## Draft Update Report

> The following is the draft for Owner review. Upon approval, this content will be published to `a-society/updates/2026-03-20-backward-pass-orderer-interface.md` and `$A_SOCIETY_VERSION` will be updated to v16.0.

---

# A-Society Framework Update — 2026-03-20

**Framework Version:** v16.0
**Previous Version:** v15.1

## Summary

Component 4 (Backward Pass Orderer) has been redesigned with a new input model and output format. The invocation guidance in `general/improvement/main.md` has been updated accordingly: Component 4 now reads `workflow.md` from the active record folder (rather than receiving a workflow document path), is invoked for every flow regardless of role count, and returns a structured `BackwardPassPlan`. A new `workflow.md` artifact type has been documented in `general/instructions/records/main.md` for projects using the Backward Pass Orderer. Projects that have instantiated these documents and use the Backward Pass Orderer should review their agent-docs.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in backward pass invocation guidance — Curator must review if your project uses the Backward Pass Orderer |
| Recommended | 1 | New `workflow.md` documentation — Curator should add if your project uses the Backward Pass Orderer |

---

## Changes

### Backward Pass Orderer invocation model

**Impact:** Breaking
**Affected artifact:** `general/improvement/main.md`

**What changed:** The tooling paragraph in the Backward Pass Protocol (Backward Pass Traversal subsection) was updated. The Backward Pass Orderer is now:
- Invoked for every flow regardless of role count (previously: only when the flow had more than two participating roles)
- Invoked with the record folder path via `orderWithPromptsFromFile(recordFolderPath)` — Component 4 reads `workflow.md` from that folder directly (previously: the workflow document path was passed as input)
- Returns a structured `BackwardPassPlan`: an ordered list of entries, each with `role`, `stepType` (`meta-analysis` | `synthesis`), `sessionInstruction` (`existing-session` | `new-session`), and `prompt`. The synthesis entry is always last and is produced by the algorithm — callers do not append it.

**Why:** Component 4's interface was redesigned. The previous design required agents to pass a workflow graph document; the new design reads `workflow.md` from the record folder directly, which is closer to where the backward pass is executed and enables richer per-entry output.

**Migration guidance:** Locate the tooling paragraph in your project's `improvement/main.md` (the Backward Pass Traversal section). If it contains either of these conditions, it is stale and must be updated:
- A role-count conditional on invocation (e.g., "only when the flow has more than two participating roles")
- An instruction to pass the workflow document path as input

Replace with guidance matching the current model: invoke `orderWithPromptsFromFile` with the record folder path for every flow; the tool reads `workflow.md` from that folder and returns a `BackwardPassPlan` as described above.

If your project does not have a Backward Pass Orderer tool, no action is required.

---

### workflow.md documented in records instruction

**Impact:** Recommended
**Affected artifact:** `general/instructions/records/main.md`

**What changed:** A new section `workflow.md — Forward Pass Path` was added between the Sequencing section and the What Goes in a Record section. It describes `workflow.md` as a non-sequenced artifact in record folders: its schema, who creates it, who can edit it, when it is appended, and what the Backward Pass Orderer reads from it. Step 2 of "How to Create a Records Structure" was updated to direct projects using a Backward Pass Orderer to declare `workflow.md` as a non-sequenced artifact in their `records/main.md`.

**Why:** The Backward Pass Orderer reads from `workflow.md` in the record folder. Projects using the tool need to know to create this file at intake, understand its schema, and document its authoring rules in their own `records/main.md`.

**Migration guidance:** If your project uses a Backward Pass Orderer tool:

1. Review your project's `$[PROJECT]_RECORDS` document. If it does not document `workflow.md` as a non-sequenced record folder artifact, add a section covering: the YAML schema (`workflow.synthesis_role` string; `workflow.path` list of `{role, phase}` entries); who creates it (the intake role, at flow intake); who can edit it (intake role and workflow-authority roles only); and what the orderer reads from it (`synthesis_role` and `path[].role`).

2. Review your project's flow intake process. If `workflow.md` is not being created at intake alongside the workflow plan, update the intake procedure to include it.

If your project does not have a Backward Pass Orderer tool, no action is required.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in a sequenced artifact with one of:
- **APPROVED** — Curator will publish to `$A_SOCIETY_UPDATES_DIR` and increment `$A_SOCIETY_VERSION` to v16.0
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not publish or increment the version until APPROVED status is received.
