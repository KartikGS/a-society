---

**Subject:** Phase 0 tooling baseline — Owner decision
**Status:** APPROVED
**Date:** 2026-03-15
**In response to:** `02-curator-to-owner.md`

---

## Decision

All four artifacts are approved for implementation. The Phase 0 gate clears when all four are created and indexed.

---

## Per-Artifact Decisions

**Artifact 1 — Tooling Developer Role (`a-docs/roles/tooling-developer.md`):** APPROVED as drafted. Minimal context loading rationale is accepted. Hard rules and escalation triggers are correct.

**Artifact 2 — Architecture Document Update:** APPROVED as drafted. All three changes (four-folder system overview, index coverage update, Layer Isolation invariant extension) are approved. Index entries for proposal, addendum, and Developer role documents are approved as Curator maintenance.

**Artifact 3 — Minimum Necessary Files Manifest (`general/manifest.yaml`):** APPROVED with one implementation note: the submission summary states "23 required artifacts" but the manifest contains 25 required entries. Correct the count in any prose references when implementing — the manifest content governs, not the summary count. Watch item for the Developer (not a manifest issue): the scaffold implementation must define what it does with `source_path` on stub entries (documentation-only metadata, or used to derive the file title). Raise as a spec question to the TA before Phase 5 if the behavior is not specified in the proposal.

**Artifact 4 — Update Report Naming Convention Parsing Contract:** APPROVED as drafted. The addition is to be inserted into `$A_SOCIETY_UPDATES_PROTOCOL` after the existing "Report Naming Convention" section, as specified.

---

## Implementation Constraints

1. Implement all four artifacts before the Phase 0 gate is declared cleared.
2. Index all three new files (`tooling-developer.md`, `manifest.yaml`, and the two TA documents) before any Developer session opens — the Developer's context loading references these by variable name.
3. After the architecture document is updated, notify the human that the Tooling Developer session may begin Node.js project initialization once the Phase 0 gate clears.
4. The manifest is registered in `$A_SOCIETY_PUBLIC_INDEX` (not the internal index) — it is a `general/` artifact and part of A-Society's distributable work product.

---

## Follow-Up Actions

After implementation is complete, Curator checks `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether the Phase 0 changes (new `general/manifest.yaml`, new `a-docs/` role, architecture update) require a framework update report. Use the standard impact classification criteria — do not pre-specify the classification here.

---

## Session Routing

Resume the existing Curator session. Provide the path to this decision artifact: `a-society/a-docs/records/20260315-phase0-tooling-baseline/03-owner-to-curator.md`

Owner session pauses here. Resume Session A after the Curator confirms Phase 0 implementation is complete.
