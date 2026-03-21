# Backward Pass Synthesis: 20260321-index-paths-and-bp-handoffs

**Date:** 2026-03-21
**Task Reference:** 20260321-index-paths-and-bp-handoffs
**Synthesizer:** Curator
**Findings reviewed:** 08-curator-findings.md, 09-owner-findings.md

---

## Flow Summary

Two additive changes to existing general/ library files:

1. `$INSTRUCTION_INDEX` — path format rule replaced (repo-relative required; machine-specific absolute prohibited); unregistered-file guidance added; all example paths updated.
2. `$GENERAL_IMPROVEMENT` — backward pass handoff completeness guardrail added to Guardrails section.
3. `$A_SOCIETY_IMPROVEMENT` — same guardrail added as MAINT (cross-layer consistency obligation, Curator authority).

Framework update report published at v17.1 (`2026-03-21-index-paths-bp-handoffs.md`), 2 Recommended. All implementation is complete and Owner-approved.

---

## Consolidated Findings

Five items across both findings artifacts, consolidated from overlap.

### A. Guardrail ordering — handoff completeness before forward pass closure boundary

*Source: 08-curator-findings Finding #1; 09-owner-findings Finding #1*

The proposal spec said "add at the end of the existing guardrails." The Curator placed the new guardrail before "Forward pass closure boundary," not after it. The Owner validated "placement in the Guardrails section is correct" at review without evaluating intra-section position. The update report migration guidance then codified the current placement ("Place it before the Forward pass closure boundary guardrail"), and the Owner approved it. The intra-section ordering was never decided as a matter of principle.

Semantic analysis: "Forward pass closure boundary" governs whether to enter the backward pass at all (a gate). "Handoff completeness" governs behavior within the backward pass (an execution rule). A chronological reading — first confirm you are authorized to start, then execute correctly — places the gate first. The current ordering inverts this.

**Recommendation:** Swap the two guardrails in both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT`, restoring chronological correctness. The gate (closure boundary) precedes the execution rule (handoff completeness).

**Disposition:** Escalated to Owner — any reordering touches `$GENERAL_IMPROVEMENT` (general/); the cross-layer `$A_SOCIETY_IMPROVEMENT` update follows the same decision.

---

### B. Brief placement ambiguity — intra-section placement not required

*Source: 09-owner-findings Finding #1 (structural root of A)*

The brief directed the Curator to add the guardrail to the Guardrails section but gave no position within the section. The proposal resolved this as "at the end." The Curator deviated. The deviation was not detected at review. The intra-section position was never decided as a matter of principle.

This is the structural cause of finding A. The fix is to require the Owner to specify intra-section position whenever directing an addition to an existing ordered or sequenced list — "add to the Guardrails section" is insufficiently specified; "add as the final bullet" or "add after [named bullet]" is the required form.

**Recommendation:** Add guidance to the brief-writing protocol (in `$GENERAL_OWNER_ROLE` or `$INSTRUCTION_ROLES`) requiring intra-section placement specification when directing additions to ordered lists in existing documents.

**Disposition:** Escalated to Owner — touches general/ role templates or instructions.

---

### C. workflow.md YAML delimiters not specified in schema

*Source: 09-owner-findings Finding #2*

The workflow.md schema in `$A_SOCIETY_RECORDS` and `$INSTRUCTION_RECORDS` documents the field structure but does not state that the YAML content must be wrapped in `---` frontmatter delimiters. The Backward Pass Orderer failed on first invocation in this flow; the file had to be corrected manually before the tool could run.

**Disposition (split):**
- `$A_SOCIETY_RECORDS` — **Implemented directly during synthesis.** Schema example updated to show `---` delimiters; explicit note added. (MAINT, Curator authority)
- `$INSTRUCTION_RECORDS` — **Escalated to Owner.** Same addition needed in the general instruction. (LIB, general/)

---

### D. $A_SOCIETY_INDEX follow-on — repo-relative path adoption

*Source: 08-curator-findings Finding #2; 09-owner-findings Finding #3*

A-Society's own index (`$A_SOCIETY_INDEX`) uses `/a-society/...` style paths, which now violate the repo-relative path rule added in this flow. This was explicitly routed out of scope in 04-owner-to-curator.md with instruction to add to Next Priorities after the flow closes.

**Disposition:** **Implemented directly during synthesis** — added to project log Next Priorities. (Curator log authority; routing pre-approved by Owner in 04-owner-to-curator.md)

---

### E. Classification pre-specification — positive practice with existing prohibition tension

*Source: 08-curator-findings Finding #3; 09-owner-findings Finding #4*

The Owner specified the intended classification for both changes (Recommended) in the handoff directing the Curator toward the update report phase. Both findings flag this as friction-reducing — it removed a potential back-and-forth on Change 1, which could reasonably have been classified as Breaking given that the rule change requires remediation on every adopting project's index.

An existing rule (established in 20260311-classification-prespec-prohibition, in `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality section) prohibits pre-specifying update report classification in briefs or approval rationale.

Whether the existing prohibition covers the update report phase handoff (a distinct artifact from the initial brief and main approval rationale) is not determinable from the prohibition text alone. Two possible interpretations: (a) the prohibition is scoped to the initial brief and main approval only, in which case the positive practice operates in a permitted gap; (b) the prohibition covers the update report handoff too, in which case the Owner's action in this flow was a violation that produced a good outcome — which is grounds for revisiting the prohibition's scope.

**Recommendation:** Owner clarifies the prohibition's scope, then decides whether to formalize the positive practice as permitted or recommended behavior for update report phase handoffs.

**Disposition:** Escalated to Owner — requires interpretation of existing rule and possible update to `$A_SOCIETY_OWNER_ROLE` or `$GENERAL_OWNER_ROLE`.

---

## Direct Implementations

Two items implemented during synthesis:

### C (partial) — $A_SOCIETY_RECORDS: YAML delimiter requirement

Schema example updated to include `---` delimiters. Explicit note added that the Backward Pass Orderer reads `workflow.md` as YAML frontmatter and that files missing delimiters will cause a parse failure. Creating a Record Folder step 3 also updated to note the delimiter requirement.

### D — Project log: $A_SOCIETY_INDEX follow-on added to Next Priorities

Added `[S][MAINT]` Next Priority entry for A-Society index repo-relative path adoption. Source: 04-owner-to-curator.md, flow 20260321-index-paths-and-bp-handoffs.

---

## Minor Observations

**Sequence gap at position 07.** Backward pass findings begin at 08-curator-findings.md; there is no 07 artifact in the record folder. The preceding artifact (06-owner-to-curator.md) includes a directive to "Return to Owner to confirm publication and initiate backward pass" but no separate backward pass initiation artifact was filed at 07. The gap does not affect the findings or synthesis. Whether a backward pass initiation should be a sequenced artifact is not addressed by current convention — no action required from this observation, but noted for completeness.

---

## Escalated to Owner

Four items require Owner decision before implementation:

| # | Item | Files | Curator recommendation |
|---|---|---|---|
| A | Guardrail ordering: swap — closure boundary before handoff completeness | `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT` | Approve reorder; Curator implements both layers |
| B | Brief placement guidance: require intra-section position when directing additions to ordered lists | `$GENERAL_OWNER_ROLE` or `$INSTRUCTION_ROLES` | Approve addition; Curator drafts wording |
| C (remainder) | `$INSTRUCTION_RECORDS`: add `---` delimiter requirement to workflow.md schema | `$INSTRUCTION_RECORDS` | Approve; Curator implements as companion to existing `$A_SOCIETY_RECORDS` fix |
| E | Classification pre-specification: clarify prohibition scope; decide whether to formalize positive practice | `$A_SOCIETY_OWNER_ROLE`, possibly `$GENERAL_OWNER_ROLE` | Owner ruling required before any action |

---

## Handoff to Owner

Switch to Owner session (existing session).

```
Next action: Review synthesis escalations A, B, C (remainder), and E. Issue decisions or route as separate flows.
Read: a-society/a-docs/records/20260321-index-paths-and-bp-handoffs/10-curator-synthesis.md
Expected response: Owner decision on each escalated item, or routing acknowledgment for each.
```
