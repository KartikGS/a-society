# Backward Pass Findings: Owner — 20260322-component4-design-advisory

**Date:** 2026-03-22
**Task Reference:** 20260322-component4-design-advisory
**Role:** Owner
**Depth:** Full

---

## Findings

### Missing Information

- **Phase 7 update report obligation not included in Curator scope authorization.** The Curator did not complete the Phase 7 update report assessment. The root cause is upstream: the Owner's Curator authorization in `05-owner-decision.md` was derived from the TA advisory §5 (Files Changed) scope, not from the tooling dev workflow's Phase 7 obligations. Phase 7 requires the Curator to assess `$A_SOCIETY_UPDATES_PROTOCOL` and submit an update report if triggered. This obligation is not in the TA advisory — but it does not need to be. It is a standing Phase 7 workflow obligation, and the Owner is responsible for including it in Curator authorization scope regardless of what the TA brief scoped.

  **Root cause — why wasn't this caught by me?** When writing `05-owner-decision.md`, I listed TA advisory §5 items plus the coupling map addition. I did not cross-check the tooling dev workflow Phase 7 section against my authorization list. The gap is structural: Owner Curator authorizations in tooling dev flows should include Phase 7 standard obligations as a checklist item, not infer them from the TA brief.

  **Update report assessment:** The changes in this flow that may trigger an update report — `orderWithPromptsFromFile` signature change (single → two parameters), `workflow.md` schema change, and the `$GENERAL_IMPROVEMENT` LIB addition — should be assessed against `$A_SOCIETY_UPDATES_PROTOCOL`. The signature change is a breaking API change for any caller using the old signature. Assessment and publication (if warranted) is deferred to the Curator in a follow-up flow.

### Scope Concerns

- **Integration test coverage absent from implementation review.** My implementation approval in `05-owner-decision.md` reviewed `backward-pass-orderer.ts` and `backward-pass-orderer.test.ts`, but not `test/integration.test.ts`. The Developer found that Scenario 5 in the integration suite could pass with `undefined` synthesisRole because the assertions only verified result structure (is it an array? does the last entry have `stepType: 'synthesis'`?), not value correctness of the computed role. This is a genuine quality near-miss.

  **Root cause — why wasn't this caught by me?** The TA advisory §5 listed `backward-pass-orderer.test.ts` as the Developer-scope test file to update. My review checked the listed files against the advisory. I did not independently assess whether integration test coverage also needed review. For any signature change to a component with both unit and integration tests, the review scope must include both — the advisory's Files Changed table is not a complete coverage checklist.

- **TA role doc coupling map obligation confirmed as undocumented.** The TA's finding (10-ta-findings.md, Finding 1) is correct and the Owner confirms it. The coupling map consultation obligation for TA advisory sessions is documented only in the tooling dev workflow's session model note (`TA sessions` row), not in the TA role document itself. The Owner treated it as a "standing obligation" in `04-owner-to-developer.md` and added it as an ad-hoc correction, which masked the documentation gap rather than surfacing it.

  **Root cause:** The obligation is located in the workflow document (a process artifact) rather than in the role document (a behavioral contract). Obligations that must be executed reliably belong in the role document, not only in a workflow note that the TA may not read for a given advisory session.

### Workflow Friction

- **Owner advisory review did not include §4 completeness check.** The review questions in `04-owner-to-developer.md` focused on design choices (§1 prompt formats, §3 synthesis_role design, §5 file coverage, §6 directive scope). I did not ask whether §4 (Interface Changes) was complete as a standalone implementation specification — specifically, whether a Developer could implement from §4 alone without needing §5 to fill gaps. The TA's finding (10-ta-findings.md, Finding 2) confirms: the `synthesisRole` threading path was in §5 (Files Changed table cell) rather than §4, causing the Developer to independently infer it.

  **Root cause:** No completeness criterion for §4 in the Owner advisory review standard. Evaluating design choices is not the same as verifying spec completeness. Both are needed.

---

## Top Findings (Ranked)

1. **Phase 7 update report obligation not included in Curator authorization scope** — structural gap; resulted in a missing deliverable; externally noted at forward pass closure rather than prevented upstream
2. **Integration test coverage absent from implementation review** — review scope gap; surfaced a quality near-miss (Scenario 5 shallow assertions)
3. **TA role doc coupling map obligation undocumented** — confirmed; behavioral contract gap in the TA role document
4. **Advisory review §4 completeness check absent** — Owner review standard gap; caused mild Developer friction

---

## Next Priorities Items

Four items identified. Merge assessment applied before filing:

**Item A (Curator, MAINT):** Update report assessment for this flow's changes. Curator to assess against `$A_SOCIETY_UPDATES_PROTOCOL`: does the `orderWithPromptsFromFile` signature change and `$GENERAL_IMPROVEMENT` LIB update require adopting projects to review their a-docs? If yes, draft and publish. Standalone — no merge candidate in current Next Priorities.

**Item B (MAINT):** `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — two advisory authorship obligations: *(1)* when advising on a component change, check the coupling map entry for that component and surface any open invocation gap in the advisory output; *(2)* when a new parameter on a public function must be threaded to an internal call, the full threading path belongs in the Interface Changes section, not only in the Files Changed table. Merge assessment: Items B1 and B2 share the same target file and design area (TA advisory authorship obligations) — file as one merged item.

**Item C (MAINT):** `$A_SOCIETY_OWNER_ROLE` — two scope gaps to close: *(1)* when authorizing Curator scope in tooling dev flows, cross-check Phase 7 standard obligations (`$A_SOCIETY_UPDATES_PROTOCOL` assessment, index registration) against the authorization list — do not derive scope solely from TA brief; *(2)* when reviewing a TA advisory, verify that §4 (Interface Changes) is complete as a standalone implementation specification — check that every parameter change has its full threading path specified, not inferred from Files Changed. Merge assessment: both target `$A_SOCIETY_OWNER_ROLE` MAINT; existing Next Priorities item (brief-writing quality) also targets `$A_SOCIETY_OWNER_ROLE` — but design areas are distinct (brief-writing vs. advisory review vs. scope authorization). File as a separate item; no merge warranted.

**Item D (Developer fix):** `test/integration.test.ts` — Scenario 5 assertions should verify the `synthesisRole` value used in the computed backward pass plan, not only that the result is an array with a synthesis last entry. Small targeted fix. Standalone.

---

Next action: Perform your backward pass synthesis (step 5 of 5 — final step).
