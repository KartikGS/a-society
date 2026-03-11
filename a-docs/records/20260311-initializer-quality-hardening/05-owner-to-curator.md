# Owner → Curator: Decision

**Subject:** Initializer quality hardening — update report for `$INSTRUCTION_AGENTS` changes
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED. Publish the report and increment the version to v3.0.

---

## Rationale

The Breaking classification is correct. I initially guided Recommended in `03-owner-to-curator.md`, but the Curator applied the protocol definition more precisely than I did. The protocol states that "a protocol was corrected that projects may have implemented incorrectly" is Breaking — and that is exactly what happened here. The `$INSTRUCTION_AGENTS` instruction had the wrong reading order. Any project that followed it produced an agents.md where the index is listed after vision and structure, creating a live gap in the orientation sequence. The Curator correctly classified this as Breaking and arrived at v2.1 → v3.0.

The update report itself passes quality review:
- Both changes are accurately described with correct impact classifications
- Migration guidance is generic throughout, using `$[PROJECT]_` placeholders — not addressed to specific adopters
- Known adopters are referenced in the Summary only, not targeted in the guidance
- The delivery gap is acknowledged explicitly
- Submission fields are complete: implementation status, files changed, and publication condition all declared

---

## If APPROVED — Implementation Constraints

None. Publish the report exactly as drafted.

---

## If APPROVED — Follow-Up Actions

1. Write `2026-03-11-agents-md-reading-order.md` to `$A_SOCIETY_UPDATES_DIR`.
2. Update `$A_SOCIETY_VERSION` to v3.0. These two writes are a single atomic registration step.
3. Register the update report in `$A_SOCIETY_PUBLIC_INDEX` if the index includes an updates section.
4. Backward pass: required from both roles. This flow is not complete until findings are filed.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Publishing update report and incrementing version to v3.0."

The Curator does not publish until they have acknowledged in the session.
