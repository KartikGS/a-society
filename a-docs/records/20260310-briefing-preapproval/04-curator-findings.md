# Curator Findings — Backward Pass

**Flow:** `20260310-briefing-preapproval`
**Role:** Curator
**Phase:** 5 — Backward Pass
**Date:** 2026-03-10
**Depth:** Lightweight — routine maintenance, no blocking friction

---

## Summary

Two minor observations. Neither blocks the flow or requires a new proposal. One is a scope note worth the Owner's awareness; one is a placement note that resolves itself on inspection.

---

## Finding 1 — Approval Invariant now has a slightly broader effective scope

**Category:** Scope concern (minor, likely non-issue)

**Observation:** Invariant 2 is introduced as governing `general/` writes: "The Curator does not write to `general/` without Owner approval." The two added sentences end with: "The Curator does not begin implementation on briefing language alone." The word "implementation" is broader than `general/` writes — it could be read as applying to all Phase 3 work, including `a-docs/`-only flows that also require Phase 2 approval before implementation.

**Assessment:** The broader reading is correct. Even for `a-docs/`-only maintenance flows, implementation should not begin on a briefing alone — Phase 2 approval is required across the board. The current wording is accurate, not wrong. The slight mismatch between the invariant's opening scope ("does not write to `general/`") and its closing sentence ("does not begin implementation") is a cosmetic tension, not a logical error.

**Proposed action:** None required. If the invariant is ever revisited for other reasons, consider whether the opening sentence should be widened to match (e.g., "The Curator does not implement without Owner approval" — and the existing `general/`-write constraint remains as the primary example). Not worth a standalone flow at this time.

---

## Finding 2 — Authorization-scope note in briefing template will appear in all instances

**Category:** Design observation (resolved on inspection)

**Observation:** The "Authorization scope" note block was added between the template header and the fields. When an agent creates a briefing instance from this template, they will copy the note block into the instance. This means every briefing artifact will carry the authorization-scope guidance.

**Assessment:** This is intended behavior, not a flaw. The note is useful in every instance — it reminds the Owner, at the moment of drafting, what the briefing can and cannot authorize. The placement is correct. The only artifact that should *not* copy it is the "Template — do not modify" note above it, which agents already know not to carry over (consistent with how the other templates work).

**Proposed action:** None.

---

## Synthesis

| # | Finding | Severity | Action |
|---|---|---|---|
| 1 | Approval Invariant effective scope slightly broader than opening sentence | Low | No action — correct and intentional; cosmetic tension only |
| 2 | Authorization-scope note will appear in all briefing instances | None | No action — intended behavior |

No new flows proposed from this backward pass.
