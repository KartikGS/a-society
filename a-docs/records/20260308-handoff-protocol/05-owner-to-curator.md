# Owner → Curator: Decision

> **Template usage:** Created from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`.

---

**Subject:** Draft framework update report — workflow-default and handoff routing
**Status:** APPROVED (conditional)
**Date:** 2026-03-08

---

## Decision

APPROVED — with one publication constraint. Do not publish until `$A_SOCIETY_WORKFLOW` is updated. The report describes guidance that includes reviewing a project's workflow document for implicit session-routing — A-Society's own workflow document must reflect that guidance before the report goes out.

---

## Rationale

The draft is sound on all dimensions assessed:

**Content accuracy:** Both described changes match what was implemented. The "workflow as default" and "Handoff Output is now mandatory" sections accurately represent the scope and rationale of this flow.

**Impact classification:** Both changes classified as Breaking is defensible. Under the framework's definition — "Gaps or contradictions in your current `a-docs/` — Curator must review" — the old Owner Post-Confirmation Protocol now contradicts the framework standard, and the missing `Handoff Output` section is a structural gap. Adopting project Curators should be required to review both, not given a judgment call. Breaking is appropriate for both.

**Migration guidance:** Actionable and correctly scoped. The use of `$[PROJECT]_OWNER_ROLE` and `$[PROJECT]_CURATOR_ROLE` variable placeholders is correct — portable and does not hardcode A-Society-specific artifact names. The guidance to also review the project's workflow document for implicit session decisions is the right call.

**Delivery note:** Accurate acknowledgment of the open distribution problem.

**Sequence note:** Using position `04` for this submission is correct. Phase 4 registration includes update report submission to the Owner, and the sequence continues as long as the flow requires. Backward pass findings will follow at `06-` and `07-`.

---

## Implementation Constraints

**Publish only after `$A_SOCIETY_WORKFLOW` is updated.** The migration guidance in the report instructs adopting Curators to review their own workflow documents for implicit new-vs-resume decisions. If A-Society's own workflow document still contains that implicit behavior at publication time, the report will have advised others to fix a gap that A-Society itself has not fixed. Complete `$A_SOCIETY_WORKFLOW` first, then publish.

No revisions to the report content are required. Once `$A_SOCIETY_WORKFLOW` is updated, publish at `$A_SOCIETY_UPDATES_DIR/2026-03-08-handoff-protocol-routing.md` as proposed.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Draft framework update report — workflow-default and handoff routing."

Sequence for the Curator:
1. Update `$A_SOCIETY_WORKFLOW` (completing Phase 3)
2. Publish the update report to `$A_SOCIETY_UPDATES_DIR` (completing Phase 4)
3. Produce backward pass findings at `06-curator-findings.md` (Phase 5)
