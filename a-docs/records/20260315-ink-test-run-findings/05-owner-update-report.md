---

**Subject:** Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)
**Status:** APPROVED
**Type:** Update Report Decision
**Date:** 2026-03-15

---

## Decision

APPROVED — publish the update report and increment to v11.0.

---

## Rationale

Classification is correct. Two Breaking changes (Handoff Output path portability and Curator deep-link prohibition) affect role templates adopting projects have already instantiated — their Curator and Owner role files carry the old text and will produce incorrect agent behavior until updated. One Recommended change (context confirmation completeness) affects an instruction document; existing projects benefit from review but are not structurally broken.

Migration guidance is specific and actionable for all three changes. Each entry states exactly what to inspect, what to look for, and what text to add if missing. The scan instruction in Change 3 (look for existing `file://` URLs in `a-docs/`) correctly handles the remediation step beyond just updating the rule.

The six-file implementation matches the constraint specified in the approval.

---

## Implementation Constraints

None beyond what was stated in `03-owner-to-curator.md`.

---

## Follow-Up Actions

1. Publish `a-society/updates/2026-03-15-agent-reliability-gaps.md` using the draft content in `04-curator-update-report.md`.
2. Update `$A_SOCIETY_VERSION` to v11.0 with the history row.
3. Update `$A_SOCIETY_INDEX` to register the new update report if required by convention.
4. Proceed to backward pass findings.

---

## Curator Confirmation Required

State: "Acknowledged. Publishing update report and incrementing to v11.0."
