# Backward Pass Findings: Owner — 20260322-workflow-obligation-consolidation

**Date:** 2026-03-22
**Task Reference:** 20260322-workflow-obligation-consolidation
**Role:** Owner
**Backward pass position:** 2 of 3
**Depth:** Standard

---

## Assessment of Curator Findings

**Finding 1 (Phase 1 update-report screening): Endorsed.**
Root cause is correct — the trigger is structural, not procedural. The brief's origin does not substitute for a protocol check. The actionable guidance (walk the "When to Publish" bullets against the actual diff class before submitting any `general/` Phase 1) is correct and sufficient. No correction needed.

**Finding 2 (Owner–Curator correction loop): Endorsed.**
The Phase 2 flag preserved velocity while enforcing the obligation. Accurate characterisation.

**Documentation discoverability and authoring nuance: Noted.**
Both are correctly scoped as out-of-flow optional observations. No action required from Owner.

---

## Owner Findings

### 1. Backward pass order stated without reading the source — externally caught

At forward pass closure, I produced `06-owner-findings.md` before invoking Component 4, asserting Owner findings first and Curator synthesis second. The user prompted use of the tool; Component 4 produced the correct order (Curator meta-analysis → Owner meta-analysis → Curator synthesis). The prematurely created file was deleted.

**Root cause:** I reasoned about backward pass order from first principles rather than invoking the tool. The mandate "invoke Component 4 rather than computing manually when the tool is available" exists in `$A_SOCIETY_IMPROVEMENT`. I did not follow it. The ordering assumption I made was wrong.

**Why wasn't this caught before the error?** No check in my forward pass closure procedure prompted me to invoke Component 4 before writing findings. I applied ordering logic I believed to be correct without verifying against the source.

**This was caught externally.** Per the Analysis Quality principle added in `backward-pass-quality-principles`: externally-caught errors are higher priority. The question is not just "what was wrong" but "why was the tool not invoked at the point it should have been."

**Proposed fix:** At forward pass closure, the Owner's obligations list should explicitly include Component 4 invocation as the first backward pass action — before any findings artifact is created. The current Phase 5 Work in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` says "initiate the backward pass" but does not specify that Component 4 invocation is the first act of that initiation. This is a `[S][MAINT]` item for `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 5 Work.

---

### 2. `synthesis_role` in `workflow.md` — design problem surfaced

The user flagged that `synthesis_role` is a backward pass concept embedded in `workflow.md`, which is a forward pass path record. The field exists because Component 4's current algorithm requires it to determine who performs synthesis. But forward pass documents should not carry backward pass structure.

This is a valid architectural critique. Acting on it requires: removing `synthesis_role` from the `workflow.md` schema, redesigning how Component 4 determines the synthesis role (e.g., derivation from the path itself, or a separate backward-pass descriptor), and updating `$A_SOCIETY_RECORDS`, Component 4's specification, and the invocation reference.

Scoping requires TA input before anything is proposed. Filing as a Next Priority.

---

### 3. Hardcoded positions and filenames in `$A_SOCIETY_RECORDS` — design problem

The artifact sequence table in `$A_SOCIETY_RECORDS` assigns fixed position numbers and filenames to every artifact in a flow: `01-owner-workflow-plan.md`, `02-owner-to-curator-brief.md`, `03-curator-to-owner.md`, and so on through `06-owner-findings.md`. This is the wrong design.

Position numbers shift in nearly every real flow:
- An implementation confirmation from the Curator (a standard Phase 4 exit artifact) bumps backward pass findings by one
- A Revise cycle adds two artifacts and shifts everything after them
- Parallel tracks require sub-labeled positions
- Flows with more than two roles have more backward pass positions than the table shows

The table currently hardcodes backward pass at `05-` and `06-` — positions that were wrong in this very flow (where they landed at `06-`, `07-`, and `08-`). The "Reference stability" note in the same section says never hardcode positions for backward pass findings; the table immediately above it does exactly that.

The same document carries the rule and violates it simultaneously.

**Root cause:** The table was written to give agents a concrete mental model, but concrete positions are the wrong thing to make concrete. What is stable is the *ordering relationship* between artifacts (plan before brief, brief before proposal, proposal before decision, decision before implementation, implementation before findings) and the *naming pattern* (`NN-[role]-[descriptor].md`). The positions themselves are derived, not declared.

**Proposed fix:** Replace the hardcoded table with guidance: describe each artifact type, who produces it, what triggers it, and what must precede it — without assigning a position number. The sequence number is a consequence of what has already been filed, not a property to be declared upfront. This is a `[S][MAINT]` item for `$A_SOCIETY_RECORDS`.

---

## Routing

| Finding | Disposition |
|---|---|
| Curator Finding 1 (update-report screening) | Endorsed — route to synthesis |
| Curator Finding 2 (Owner–Curator loop) | Endorsed — informational |
| Owner Finding 1 (backward pass order, externally caught) | Route to synthesis — `[S][MAINT]` Next Priority for Phase 5 Work |
| Owner Finding 2 (`synthesis_role` design problem) | Route to synthesis — `[M][MAINT]` Next Priority, TA scoping required |
| Owner Finding 3 (hardcoded positions in `$A_SOCIETY_RECORDS`) | Route to synthesis — `[S][MAINT]` Next Priority |
