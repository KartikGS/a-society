# Backward Pass Findings: Technical Architect — 20260322-component4-design-advisory

**Date:** 2026-03-22
**Task Reference:** 20260322-component4-design-advisory
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- **Coupling map consultation not required by TA role doc:** The Owner noted in `04-owner-to-developer.md` that the TA had a "standing obligation" to check `$A_SOCIETY_TOOLING_COUPLING_MAP` for Component 4 and surface any open invocation gap — but this obligation is not written anywhere in the TA role doc. The TA role doc's "a-docs/ Format Dependencies" section covers co-maintenance obligations when a component reads `a-docs/` content, but says nothing about checking the coupling map when advising on a component whose general/ format dependencies are already tracked there. The TA reached advisory completion without checking the coupling map; the Owner had to add the check as a gap-correction in `04-owner-to-developer.md`.

  **Root cause:** The TA role doc's advisory obligations are incomplete with respect to coupling map consultation. The obligation "when advising on a component change, verify the coupling map entry for that component" is not documented. It is not in required reading, not in advisory standards, and not in the handoff output section. The Owner's note treats it as standing, but standing obligations that are not written down cannot be reliably executed.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- **Parameter threading specified in Files Changed table, not Interface Changes:** The TA advisory specified that `synthesisRole` must be threaded from `orderWithPromptsFromFile` through to `computeBackwardPassOrder` — but this was placed in the §5 Files Changed table cell, not in §4 Interface Changes. The Developer noted this as friction: the advisory required them to "independently identify" the threading step. Looking at §4, the `orderWithPromptsFromFile` entry describes the new signature but does not explicitly state "this parameter is passed as the `synthesisRole` argument to `computeBackwardPassOrder`." The threading instruction existed in the advisory, but in a consumption section (§5) rather than the spec section (§4) where the Developer looks first.

  **Root cause:** Advisory authorship practice gap. When a new parameter on a public function must be threaded to an internal call, the full threading path is part of the interface change — it belongs in §4 alongside the signature spec, not only in §5's implementation table. The §5 table is not a suitable substitute for explicit threading specification in the interface section.

### Workflow Friction
- **The three-problem unification was smooth once source was read:** The brief framed three interrelated problems and asked the TA to resolve them as a unified design. This framing was correct — the interaction between Problem 1 and Problem 3 (phase reference embedding into the three-field Read: field) only became visible after both were held simultaneously. The brief's explicit flag that they interact helped avoid resolving them sequentially and then needing a reconciliation pass. Advisory authoring friction was low once all source files were loaded.

---

## Top Findings (Ranked)

1. **Coupling map consultation obligation undocumented in TA role doc** — externally-caught gap; affected advisory completeness
2. **Parameter threading belongs in Interface Changes (§4), not only in Files Changed (§5)** — advisory authorship practice gap; caused mild Developer friction

---

## Generalizable Findings

**Finding 1** (coupling map consultation gap) may be project-specific — it depends on A-Society's coupling map convention and tooling architecture. Not flagged as a framework contribution.

**Finding 2** (parameter threading placement) is potentially generalizable: any advisory framework that separates interface specification from implementation guidance faces the same risk of threading instructions landing in the wrong section. Flagged as a potential framework contribution — the principle "specification of parameter threading belongs in the interface spec section, not the implementation task section" could apply to any TA-style role in any project with multi-layer function call chains.

---

Next action: Perform your backward pass meta-analysis (step 4 of 5).

Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in a-society/general/improvement/main.md

Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to Curator (synthesis).
