# Backward Pass Synthesis: Curator — 20260322-component4-design-advisory

**Date:** 2026-03-22
**Task Reference:** 20260322-component4-design-advisory
**Role:** Curator (synthesis)
**Depth:** Full

---

## Findings Reviewed

Four findings documents: Curator (08), Tooling Developer (09), Technical Architect (10), Owner (11).

---

## Actionable Findings

### B — TA advisory authorship obligations `[MAINT]` → `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

Two items merged (Owner findings confirmed merge; same target file, same design area):

- **(B1) Coupling map consultation obligation undocumented** (TA Finding 1, Owner Finding 3): the obligation to check `$A_SOCIETY_TOOLING_COUPLING_MAP` when advising on a component change exists only in the tooling dev workflow session model note — not in the TA role doc. The Owner added it as an ad-hoc correction in `04-owner-to-developer.md`, which masked the gap rather than closing it.

- **(B2) Parameter threading belongs in §4, not §5** (TA Finding 2, Developer Finding 2, Owner Finding 4): when a new public-function parameter must be threaded to an internal call, the threading path belongs in Interface Changes (§4) — not only in Files Changed (§5). The Developer found the threading instruction in §5 and had to independently infer a step that should have been explicit in the spec section.

**Routing:** Both targets are within `a-docs/` and within Curator authority. Implement directly.

---

### C — Owner role scope gaps `[MAINT]` → `$A_SOCIETY_OWNER_ROLE`

Two items merged (Owner findings confirmed merge; same target file; design areas are distinct from existing Next Priorities entry on brief-writing quality):

- **(C1) Phase 7 obligations missing from Curator authorization scope in tooling dev flows** (Owner Finding 1): when writing a Curator authorization in a tooling dev flow, the Owner derived scope from the TA advisory §5 — not from Phase 7 workflow obligations. Phase 7 carries standing Curator obligations (update report assessment, index registration) that apply regardless of what the TA brief scoped.

- **(C2) TA advisory review §4 completeness check absent** (Owner Finding 4): when reviewing a TA advisory, the Owner applied design-correctness review but not spec-completeness review. §4 (Interface Changes) must be verifiable as a standalone implementation specification — every parameter change must have its full threading path explicit.

**Routing:** Both targets are within `a-docs/` and within Curator authority. Implement directly.

---

### A — Update report assessment `[S][MAINT]` → Next Priorities

Owner Finding 1 surfaced that Phase 7 update report assessment was not completed. Two changes from this flow may trigger `$A_SOCIETY_UPDATES_PROTOCOL`: *(1)* `orderWithPromptsFromFile` signature change (one required parameter → two); *(2)* `$GENERAL_IMPROVEMENT` LIB update (phase-instruction embedding). The signature change is a breaking API change for any caller using the old signature.

**Routing:** Requires Owner approval if a report is published; publishes to `a-society/updates/`. Outside `a-docs/`. File to Next Priorities.

---

### D — Integration test assertion depth `[S]` → Next Priorities

Developer Finding 1, Owner Finding 2: `test/integration.test.ts` Scenario 5 asserts result structure (is it an array? does the last entry have `stepType: 'synthesis'`?) but not `synthesisRole` value correctness. The `synthesisRole` was `undefined` during a test run and the assertion passed. Fix: verify the `synthesisRole` value in the computed backward pass plan.

**Routing:** Target is in `a-society/tooling/` — outside `a-docs/`, requires Tooling Developer. File to Next Priorities.

---

## Non-Actionable Findings

**Curator Finding 1 (heading hierarchy verification):** Root cause — inadequate verification of heading hierarchy before editing. The existing Curator implementation practice "re-read before editing" covers this. No new rule warranted; the existing guidance is sufficient if applied.

**Curator Finding 2 (schema naming collision):** `synthesis_role` vs. `is_synthesis_role` distinction is already clarified in `07-owner-decision.md`. Different documents, different schemas, deliberate design. No documentation gap.

**Developer Finding 2 (parameter threading specified in §5):** Addressed by Item B.

**TA Finding 2 (generalizable threading principle):** Fixed locally in TA role doc (Item B). Generalizability to `general/` does not meet the cross-domain bar — the §4/§5 advisory structure is specific to A-Society's tooling architecture. No LIB filing warranted.

---

## Merge Assessment (Next Priorities)

Current Next Priorities entries: *(1)* brief-writing and proposal quality (targets `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, `$A_SOCIETY_CURATOR_ROLE` — design areas: brief quality, Approval Invariant topology); *(2)* workflow.md path completeness (targets `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE` — design area: registration step at intake).

Neither existing item targets update report assessment or integration test coverage. Items A and D are standalone additions.

---

## Direct Implementations

### B: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — Advisory Standards

Added two new paragraphs to `## Advisory Standards`:

1. **Coupling map consultation for component change advisories** — standing obligation to check `$A_SOCIETY_TOOLING_COUPLING_MAP` for the component's entry and surface any open invocation gap before advisory completion.

2. **Parameter threading belongs in §4 (Interface Changes), not §5 (Files Changed)** — when a parameter must be threaded to an internal call, the full path belongs in the spec section, not only in the coverage table.

### C: `$A_SOCIETY_OWNER_ROLE` — Brief-Writing Quality and new TA Advisory Review section

- **C1** added at end of `## Brief-Writing Quality`: tooling dev flows must cross-check Phase 7 standard obligations when authorizing Curator scope — do not derive scope solely from TA advisory §5.

- **C2** added as new `## TA Advisory Review` section (between Brief-Writing Quality and Handoff Output): §4 completeness check — design correctness and spec completeness are distinct criteria; every parameter change must have its full threading path in §4.

---

## Next Priorities Filed

**A** `[S][MAINT]` — **Update report assessment for component4-design-advisory** — Curator to assess `$A_SOCIETY_UPDATES_PROTOCOL` for two changes: *(1)* `orderWithPromptsFromFile` signature change (one → two required parameters); *(2)* `$GENERAL_IMPROVEMENT` LIB update (phase-instruction embedding addition). Signature change is a breaking API change for any caller using the old single-parameter signature. Draft and publish update report if triggered. Source: `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md` (Finding 1).

**D** `[S]` — **Integration test assertion depth: Scenario 5 synthesisRole value check** — `test/integration.test.ts` Scenario 5 currently asserts result structure only; `synthesisRole` was `undefined` during a passing test run. Fix: add assertion verifying the `synthesisRole` value in the computed backward pass plan. Requires Tooling Developer. Source: `a-society/a-docs/records/20260322-component4-design-advisory/09-developer-findings.md` (Finding 1); `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md` (Finding 2).

---

Backward pass complete. Flow closed.
