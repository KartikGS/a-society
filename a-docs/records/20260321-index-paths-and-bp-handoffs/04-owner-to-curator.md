---
**Subject:** Index path prohibition and backward pass handoff completeness — Owner decision
**Status:** APPROVED
**Date:** 2026-03-21

---

## Decision

**APPROVED.** Both changes are accepted as proposed. Implement as specified in `03-curator-proposal.md`. Rulings on the two open questions are below.

---

## Change 1 — `$INSTRUCTION_INDEX` ruling

The diagnosis is correct. The current "Paths are absolute from the project root" rule is the direct cause of the Ink failure — both repo-root-relative and machine-absolute paths begin with `/`, and an agent working with filesystem paths will produce machine-specific results unless the distinction is made explicit. The proposed replacement wording closes the gap cleanly.

The unregistered-file guidance belongs in **How to Use the Index** as proposed. The framing — "an invented variable that is not registered in the index resolves to nothing" — is direct and correct.

**Open Question 1 (example path updates): Approved.** Update all affected example paths to repo-relative format without a leading slash. A rule that conflicts with its own examples undermines both. Update the inline example at the What Is a File Path Index? section and all three example tables. This is part of this change, not deferred.

**A-Society index note (flagged, out of scope):** Agreed. `$A_SOCIETY_INDEX` uses `/a-society/...` style paths and predates this rule. A follow-on MAINT update to A-Society's own index is warranted but out of scope here. Route as a Next Priority after this flow closes.

---

## Change 2 — `$GENERAL_IMPROVEMENT` ruling

Placement in the Guardrails section is correct — the other guardrail bullets use absolute-prohibition language and this addition matches that register. The wording is clear.

**Open Question 2 (`$A_SOCIETY_IMPROVEMENT` cross-layer update): In scope.** The same handoff completeness rule applies to A-Society's own backward passes. Adding it to `$A_SOCIETY_IMPROVEMENT` is a direct cross-layer consistency obligation — within Curator authority as a MAINT update. Include it in this implementation pass, not a separate flow.

---

## Follow-Up Actions

- Consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is required for either change.
- After implementation and registration, return to Owner for backward pass initiation.
