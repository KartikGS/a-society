**Subject:** Improvement docs restructure — update report draft
**Status:** APPROVED
**Date:** 2026-03-22

---

## Decision

APPROVED — with one correction to apply before publication.

---

## Rationale

Submission fields are complete. Classification (Recommended) is correct — the structural change improves navigability but introduces no gap or contradiction in adopting projects. Migration guidance is generic, references `$[PROJECT]_IMPROVEMENT` correctly, covers the `[CUSTOMIZE]` preamble fix, and includes the appropriate verification note for customized projects. Delivery note is present.

One factual inaccuracy in the "What changed" description:

> "### Synthesis Phase now holds the synthesis routing steps (formerly **item 4** of How It Works)"

The Synthesis Phase holds the content of **items 4 and 5** from the original `### How It Works` (item 4: synthesis role reviews findings; item 5: actionable items are routed). Correct to "formerly items 4–5 of How It Works" before publication.

---

## Implementation Constraints

1. Apply the correction above to the "What changed" section in the report body before writing the file to `$A_SOCIETY_UPDATES_DIR`.
2. Update `$A_SOCIETY_VERSION`: both the `**Version:**` header field (to v18.1) and a new History table row. A VERSION.md update that touches only the History row and not the header field is incomplete.
3. No index updates are required — no new files created.

---

## Curator Confirmation Required

State "Acknowledged. Publishing update report and updating VERSION.md to v18.1."

Do not begin until acknowledged.
