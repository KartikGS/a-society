# Backward Pass Synthesis: 20260322-workflow-obligation-consolidation

**Date:** 2026-03-22
**Task Reference:** 20260322-workflow-obligation-consolidation
**Role:** Curator
**Backward pass position:** 3 of 3 (synthesis)

---

## Assessment of Findings

### Curator Findings (position 1 of 3)

**Finding: Phase 1 update-report screening — Endorsed.** Root cause correct: the publish trigger is structural (new mandatory section added to `general/`), not procedural (who initiated the change). The actionable guidance — walk the "When to Publish" bullets against the actual diff class before submitting any `general/` Phase 1 proposal — is precise and sufficient.

**Finding: Owner–Curator correction loop — Endorsed as informational.** Accurate characterisation of the Phase 2 flag preserving velocity while enforcing the obligation. No action required.

**Observation: Documentation discoverability (index-based-routing example tweak) — Noted, deferred.** Out of scope for this flow; optional hygiene deferred per Curator findings. Owner endorsed the disposition. Not actioned.

**Observation: Authoring nuance (Step 7 "terminal Owner node") — Informational.** No conflict; the exception is already documented. No action required.

---

### Owner Findings (position 2 of 3)

**Owner endorsement of Curator findings — Accepted.** All four Curator items endorsed as stated; no corrections to Curator findings required.

**Finding 1: Backward pass order stated without reading the source — Endorsed.** Root cause correct: Component 4 invocation was not the first act of backward pass initiation. The fix identified — add explicit Component 4 invocation as the first Phase 5 backward pass action in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — is within Curator MAINT authority. **Implemented directly** (see MAINT Actions below).

**Finding 2: `synthesis_role` in `workflow.md` — design problem — Endorsed.** Valid architectural critique: `synthesis_role` is a backward pass concept embedded in the forward pass path record. Acting on it requires TA scoping before a proposal can be formed. **Filed to Next Priorities** (see below). Not implementable within this synthesis.

**Finding 3: Hardcoded positions in `$A_SOCIETY_RECORDS` — Endorsed.** Root cause correct: the base table declares position numbers that are derived from the sequence of what has been filed, not properties of the artifact type. The proposed fix — replace the table with a type-based description carrying trigger and precondition columns, no position numbers — is within Curator MAINT authority. **Implemented directly** (see MAINT Actions below).

---

## MAINT Actions Taken

### 1. Phase 5 Work — Component 4 invocation made explicit (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`)

Phase 5 Work block updated. The final sentence previously read "Acknowledge closure and initiate the backward pass." Now reads:

> "Acknowledge closure and initiate the backward pass by invoking Component 4 (Backward Pass Orderer) using this flow's `workflow.md`. Component 4 invocation is the first backward pass action — no findings artifact may be produced before the traversal order has been determined."

Phase 5 Output updated from "Closure message; backward pass initiated." to "Closure message; Component 4 invoked; backward pass traversal order confirmed."

Source: Owner Finding 1.

---

### 2. Artifact sequence table replaced (`$A_SOCIETY_RECORDS`)

The position-based artifact sequence table has been replaced with a type-based table. Columns are now: Artifact, Produced By, Trigger, Must Follow — with no position numbers assigned. The implementation confirmation artifact (Phase 4 exit `curator-to-owner.md`) is now a named artifact type in the table, closing the gap that previously caused backward-pass finding positions to appear to shift unexpectedly. Tier 1 flow description updated to remove hardcoded position numbers.

Source: Owner Finding 3.

---

## Next Priorities Filed

**`[M][MAINT]` — `synthesis_role` in `workflow.md` — design problem; TA scoping required** — Filed to `$A_SOCIETY_LOG`.

`synthesis_role` is a backward pass concept embedded in `workflow.md`, which is a forward pass path record. Component 4 currently requires the field to determine who performs synthesis, but backward pass concepts should not be carried in a forward pass document. Fixing this requires: removing `synthesis_role` from the `workflow.md` schema, redesigning how Component 4 determines the synthesis role (e.g., derivation from the path itself, or a separate backward-pass descriptor), and updating `$A_SOCIETY_RECORDS`, the Component 4 specification (`$A_SOCIETY_TOOLING_PROPOSAL`), and `$A_SOCIETY_TOOLING_INVOCATION`. TA scoping required before a proposal can be formed.

Source: Owner Finding 2.

---

## Flow Status

**Closed.** All MAINT items within synthesis authority have been implemented directly. One Next Priorities entry filed to `$A_SOCIETY_LOG`. No Owner follow-up is required within this flow.
