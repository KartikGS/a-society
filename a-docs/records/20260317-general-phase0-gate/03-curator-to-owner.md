# Curator → Owner: Update Report Submission

---

**Subject:** General library — Phase 0 gate and workflow plan template (2 changes)
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-17

---

## Trigger

Owner brief `02-owner-to-curator-brief.md` from this record folder. Two log priorities (1 and 2) surfaced from the `20260317-compulsory-complexity-gate` backward pass, closing the general library lag created when Phase 0 was formalized.

---

## What and Why

Two changes to close the Phase 0 gap in the general library:

1. `$GENERAL_OWNER_ROLE` — Two targeted edits to the Owner role template: (a) workflow routing bullet now names the plan artifact as a required gate; (b) Post-Confirmation Protocol "Once the user answers" block replaced with a three-point Phase 0 gate model (plan before brief; tier-based routing).

2. New `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` + `$INSTRUCTION_WORKFLOW_COMPLEXITY` edit — Adds the workflow plan template to `general/communication/conversation/`, registers it in both indexes and the manifest, and adds a pointer to the template in the complexity instruction.

---

## Where Observed

A-Society — internal. The gap was identified in the `20260317-compulsory-complexity-gate` backward pass: the general library had no plan artifact gate in the Owner role template and no template for producing `01-owner-workflow-plan.md`.

---

## Target Location

- `$GENERAL_OWNER_ROLE` — `/a-society/general/roles/owner.md`
- `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` — `/a-society/general/communication/conversation/TEMPLATE-owner-workflow-plan.md`
- `$INSTRUCTION_WORKFLOW_COMPLEXITY` — `/a-society/general/instructions/workflow/complexity.md`
- `$GENERAL_MANIFEST` — `/a-society/general/manifest.yaml`
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`
- `$A_SOCIETY_INDEX` — `/a-society/a-docs/indexes/main.md`

---

## Draft Content

See update report draft at: `a-society/updates/2026-03-17-owner-phase0-gate.md`

Classification: 2 Breaking, 1 Recommended → v12.0 (MAJOR increment per Breaking changes).

---

## Implementation Status

**Implementation complete:** Yes
**Files changed:**
- `$GENERAL_OWNER_ROLE` — workflow routing bullet and post-confirmation protocol updated
- `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` — new file created
- `$INSTRUCTION_WORKFLOW_COMPLEXITY` — template pointer sentence added
- `$GENERAL_MANIFEST` — new entry added under Communication section
- `$A_SOCIETY_PUBLIC_INDEX` — new Communication Templates section with `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` entry
- `$A_SOCIETY_INDEX` — `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` entry added

**Publication condition outstanding:** Yes — pending Owner approval of the update report draft and VERSION.md increment to v12.0.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
