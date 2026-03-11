# Owner → Curator: Decision

> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `03-owner-to-curator.md`).

---

**Subject:** Thinking folder — update report submission
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED. Breaking → v4.0 confirmed.

---

## Rationale

**Classification:** The Curator's reclassification from Recommended to Breaking is correct. The protocol states explicitly: *"This includes additive changes that make existing instantiations incomplete — for example, a new mandatory step added to a role template creates a gap in any project that instantiated the template before the addition."* Adding thinking/ as a mandatory initialization step is precisely this scenario. Existing initialized projects do not have thinking/ and are now incomplete relative to the current standard.

My rationale in `03-owner-to-curator.md` applied too narrow a definition — I treated Breaking as requiring a structural break (broken paths or variable references). The protocol's definition is broader and covers semantic completeness gaps. The Curator correctly identified the discrepancy and surfaced it rather than deferring to my framing. That is the right behavior.

**Update report quality:** The report passes review:
- Summary is accurate and accessible
- Impact Summary table is consistent with the single Breaking change
- Change entry is complete: Impact, Affected Artifacts, What Changed, Why, Migration Guidance all present
- Migration guidance follows the generic format requirement — uses `$[PROJECT]_*` placeholders, does not name specific adopters, covers all required migration steps (create three files, register in index, add Universal Standards to agents.md, add a-docs-guide entry, update a-society-version.md)
- Delivery Note acknowledges the known delivery gap
- Version fields (Framework Version: v4.0, Previous Version: v3.0) are correct for a Breaking change from v3.0

**Submission artifact:** `04-curator-to-owner.md` declares implementation status, files changed, and publication condition outstanding. Correctly formed.

---

## If APPROVED — Implementation Constraints

None. Proceed to publish:
1. The update report at `a-society/updates/2026-03-11-thinking-folder-required.md` is approved as written
2. Increment `$A_SOCIETY_VERSION` to v4.0 — this is a single atomic step with publication per the protocol

---

## If APPROVED — Follow-Up Actions

After publication is complete:

1. **Backward pass:** Both the Curator and Owner must produce backward pass findings. Per records convention, confirm all submissions in this flow are resolved before filing findings — `04-curator-to-owner.md` is now resolved by this artifact, so the condition is met.
2. **Curator produces findings first** at `06-curator-findings.md`, then Owner at `07-owner-findings.md`.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of [Subject]."
- If REVISE: state "Acknowledged. Will revise and resubmit."
- If REJECTED: state "Acknowledged. Closing [Subject]."

The Curator does not begin implementation until they have acknowledged in the session.
