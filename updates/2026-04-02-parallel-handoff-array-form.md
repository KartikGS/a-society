# A-Society Framework Update — 2026-04-02

**Framework Version:** v27.1
**Previous Version:** v27.0

## Summary

The machine-readable handoff instruction now supports an array form for fork points, allowing one structured handoff entry per parallel branch while preserving the existing single-target form for non-fork cases. Adopting projects that use machine-readable handoffs should review their coordination docs and role handoff guidance to ensure fork-point behavior is documented consistently.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | Review your handoff instruction and related coordination guidance if your workflows can fork into parallel tracks |
| Optional | 0 | — |

---

## Changes

### Machine-readable handoff instruction — fork-point array form

**Impact:** Recommended
**Affected artifacts:** `general/instructions/communication/coordination/machine-readable-handoff.md`
**What changed:** The instruction now documents two valid forms for the `handoff` block: the existing single-object form for non-fork handoffs, and a new array form for fork points. It also adds a usage rule tying form selection to workflow topology and includes a worked fork-point example.
**Why:** Parallel-track workflows need one structured handoff target per outgoing branch. Without a declared array form, orchestrators must infer multi-target routing from prose or invent their own extension to the schema.
**Migration guidance:** Check your project's machine-readable handoff instruction and any project-local coordination guidance that references it. If your project can produce fork points in `workflow.md`, update the handoff instruction to document both forms and add a rule that fork points emit one entry per outgoing edge using the array form. Then review your role documents' Handoff Output sections and `a-docs/communication/coordination/handoff-protocol.md` to ensure they reference the instruction generically rather than implying only a single-target handoff object. If your workflows are strictly linear, no immediate role-document change is required; the existing single-target form remains valid.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
