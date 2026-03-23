# Backward Pass Synthesis — 20260323-structural-readiness-intake

**Date:** 2026-03-23
**Role:** Curator (synthesis)
**Findings reviewed:** 06-curator-findings.md, 07-owner-findings.md

---

## Findings Review

Two findings across both roles. Both confirmed independently.

### Finding 1 — Handoff Output gap: no workflow.md pre-handoff verification step

Both the Curator and Owner findings identify the same root cause: the Handoff Output section of `$GENERAL_CURATOR_ROLE` (and `$A_SOCIETY_CURATOR_ROLE`) contains format and timing obligations but no explicit step to verify the planned next step from the flow's `workflow.md` before issuing a handoff. In this flow, the Curator issued a handoff after Phase 4 that bypassed Forward Pass Closure entirely, routing the Owner directly to backward pass meta-analysis. The error was caught by the user.

**Scope:** Generalizable — any role in any flow can make this mistake when relying on memory of the workflow sequence instead of checking the artifact that records the planned path.

**Routing:**
- `$A_SOCIETY_CURATOR_ROLE` Handoff Output section — inside `a-docs/` → **implement directly**
- `$GENERAL_CURATOR_ROLE` Handoff Output section — outside `a-docs/` → **Next Priority**

---

### Finding 2 — Brief-Writing Quality: insertion position guidance does not cover prose targets

The existing Brief-Writing Quality guidance covers ordered list insertions but not prose insertions. In this flow, the brief specified "before the existing sentence" in a target whose content was a single participial clause, not a sentence. The Curator had to identify the mismatch, propose a junction fix, and obtain Owner approval — a correction round that a precise prose insertion instruction would have avoided.

**Severity:** Low — resolved cleanly in proposal.
**Scope:** Generalizable — applies to any Owner writing a brief that directs text insertion into prose content.

**Routing:**
- `$GENERAL_OWNER_ROLE` Brief-Writing Quality section — outside `a-docs/` → **Next Priority**
- `$A_SOCIETY_OWNER_ROLE` — the base insertion-position guidance is absent from this file; the fix belongs in `$GENERAL_OWNER_ROLE` first; the Next Priority should note whether a corresponding echo to `$A_SOCIETY_OWNER_ROLE` is warranted once `$GENERAL_OWNER_ROLE` is updated.

---

## Actions

### Direct implementation (a-docs/)

**Finding 1 — `$A_SOCIETY_CURATOR_ROLE` Handoff Output:**

Add pre-handoff verification step before the numbered output list: "Before issuing your handoff, verify the next step against the flow's `workflow.md`. Do not rely on memory of the workflow sequence."

→ Implemented in this synthesis pass. See `$A_SOCIETY_CURATOR_ROLE`.

---

### Next Priorities filed

**Finding 1 — `$GENERAL_CURATOR_ROLE`:**
`[S][LIB]` — Handoff Output pre-handoff workflow.md check. Source: this record, 06-curator-findings.md (Finding 1), 07-owner-findings.md (Finding 1).

**Finding 2 — `$GENERAL_OWNER_ROLE`:**
`[S][LIB]` — Brief-Writing Quality: extend insertion position guidance to prose targets. Source: this record, 07-owner-findings.md (Finding 2).

→ Both filed to `$A_SOCIETY_LOG` Next Priorities. Merge assessment performed: no overlap with existing items.

---

## Summary

Two actionable findings. Finding 1 applied directly to `$A_SOCIETY_CURATOR_ROLE`; both findings queued as Next Priorities for their `general/` targets. No items deferred without action. Backward pass closed.
