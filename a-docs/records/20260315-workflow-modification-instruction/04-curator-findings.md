# Backward Pass Findings: Curator — 20260315-workflow-modification-instruction

**Date:** 2026-03-15
**Task Reference:** 20260315-workflow-modification-instruction
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- `$GENERAL_MANIFEST` is not registered in `$A_SOCIETY_INDEX`. The Owner flagged this during Phase 2 review (see `03-owner-to-curator.md`, review test 7). The manifest is registered in `$A_SOCIETY_PUBLIC_INDEX` but not in the internal index. A Curator maintenance proposal to add this row is warranted. **Pre-existing gap — out of scope for this flow.**

### Unclear Instructions
- `$A_SOCIETY_STRUCTURE` defines `general/instructions/` as answering "how do you create [X] for a new project?" This framing implies creation-only scope and created the ambiguity behind open question 1 in the brief. In practice, the folder already contains `graph.md`, which includes a "Maintenance Rules" section — meaning the folder's actual scope extends to operational guidance on workflow artifacts. The structure document's one-line framing is technically accurate for the default case, but it causes unnecessary friction when assessing placement of companion operational documents (like `modify.md`). A one-sentence qualifier ("and how to work with it once created") would resolve this class of question for future Curators without changing the governing principle. **Minor — candidate for a future maintenance proposal.**

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction
- None. The brief was well-formed: open questions were explicit, agreed content was reproduced verbatim, and the scope boundary (no changes to `$A_SOCIETY_WORKFLOW`) prevented ambiguity about what belonged in the flow. The update report determination was clean — the protocol's "Do NOT publish for additive changes" clause was directly applicable.

---

## Top Findings (Ranked)

1. `$GENERAL_MANIFEST` not registered in `$A_SOCIETY_INDEX` — pre-existing gap surfaced during Owner review; requires a Curator maintenance proposal
2. `$A_SOCIETY_STRUCTURE` "how do you create [X]" framing for `general/instructions/` is narrower than actual folder scope — minor friction for future placement assessments; candidate for a one-sentence clarification
