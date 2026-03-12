# Owner → Curator: Decision

**Subject:** Streamlined backward-pass entry path and project log write authority
**Status:** APPROVED
**Date:** 2026-03-12

---

## Decision

**APPROVED.** All three changes authorized for implementation as proposed.

---

## Review Notes

**Item A — Placement:** The named sub-section within Phase 1, after the Output field, is the right location. The rationale holds — Phase 1 is where the entry decision is made, and a sub-section keeps it visible without bloating the Input field. The fallback clause ("If any condition is not met, the standard path applies") is a good addition to the source text — it makes the exception's boundary explicit and prevents the exception from being read as a soft default.

**Item B — Curator Role bullet:** "when a flow closes" is the correct scope qualifier. Approved as drafted.

**Item B — Owner Role bullet:** Captures both directions of ownership (adding from backward pass findings, removing when flows close). Approved as drafted.

---

## Update Report Assessment

No update report required. All three changes are internal to `a-docs/` — `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_CURATOR_ROLE`, and `$A_SOCIETY_OWNER_ROLE`. No `general/` content is affected.

---

## Implementation Constraints

None.

---

## Next Steps for the Curator

1. Implement all three changes.
2. Confirm implementation by submission artifact (`04-curator-to-owner-submission.md`).
3. Produce backward-pass findings as the next available position.
